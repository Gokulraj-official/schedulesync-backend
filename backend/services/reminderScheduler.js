const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const NotificationService = require('./notificationService');

let ioRef = null;

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const addDays = (d, days) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
};

const minutesBetween = (a, b) => {
  return Math.floor((b.getTime() - a.getTime()) / (60 * 1000));
};

const shouldFire = (minutesToStart, targetMinutes) => {
  return minutesToStart <= targetMinutes && minutesToStart >= targetMinutes - 1;
};

const hasReminderAlready = async (userId, type, bookingId) => {
  const exists = await Notification.exists({
    user: userId,
    type,
    'data.bookingId': bookingId.toString(),
  });
  return !!exists;
};

const getStudentNoShowRate = async (studentId) => {
  const recent = await Booking.find({
    student: studentId,
    $or: [
      { status: { $in: ['completed', 'no-show'] } },
      { 'attendance.status': { $in: ['attended', 'no-show'] } },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('status attendance.status')
    .lean();

  if (!recent.length) return 0;

  const noShows = recent.filter((b) => b.status === 'no-show' || b.attendance?.status === 'no-show').length;
  return noShows / recent.length;
};

const processSmartReminders = async () => {
  const now = new Date();
  const horizon = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const upcoming = await Booking.find({ status: 'approved' })
    .populate({
      path: 'slot',
      match: { startTime: { $gte: now, $lte: horizon } },
      select: 'startTime endTime',
    })
    .populate('faculty', 'name')
    .populate('student', 'name')
    .select('slot student faculty status')
    .lean();

  const bookings = upcoming.filter((b) => !!b.slot);

  const noShowRateCache = new Map();

  for (const b of bookings) {
    const startTime = new Date(b.slot.startTime);
    const minsToStart = minutesBetween(now, startTime);
    if (minsToStart < 0) continue;

    const studentId = b.student?._id || b.student;

    let noShowRate = noShowRateCache.get(studentId.toString());
    if (noShowRate === undefined) {
      noShowRate = await getStudentNoShowRate(studentId);
      noShowRateCache.set(studentId.toString(), noShowRate);
    }

    const targets = [60, 10];
    if (noShowRate >= 0.3) targets.unshift(120);

    for (const t of targets) {
      if (!shouldFire(minsToStart, t)) continue;

      const type = t === 120 ? 'reminder_2hour' : t === 60 ? 'reminder_1hour' : 'reminder_10min';
      const already = await hasReminderAlready(studentId, type, b._id);
      if (already) continue;

      await NotificationService.sendReminder(
        {
          _id: b._id,
          student: studentId,
          faculty: { name: b.faculty?.name || 'your faculty' },
        },
        t
      );

      if (ioRef) {
        ioRef.to(studentId.toString()).emit('notification', { type, bookingId: b._id.toString() });
      }
    }
  }
};

const processFacultyLoadSuggestions = async () => {
  const now = new Date();
  const tomorrowStart = startOfDay(addDays(now, 1));
  const tomorrowEnd = startOfDay(addDays(now, 2));

  const tomorrowBookings = await Booking.find({ status: 'approved' })
    .populate({
      path: 'slot',
      match: { startTime: { $gte: tomorrowStart, $lt: tomorrowEnd } },
      select: 'startTime',
    })
    .select('faculty slot')
    .lean();

  const filtered = tomorrowBookings.filter((b) => !!b.slot);

  const countsByFaculty = new Map();
  for (const b of filtered) {
    const fid = (b.faculty?._id || b.faculty).toString();
    countsByFaculty.set(fid, (countsByFaculty.get(fid) || 0) + 1);
  }

  const dateKey = tomorrowStart.toISOString().slice(0, 10);
  const HEAVY_THRESHOLD = 6;

  for (const [fid, count] of countsByFaculty.entries()) {
    if (count < HEAVY_THRESHOLD) continue;

    const exists = await Notification.exists({
      user: fid,
      type: 'faculty_load_suggestion',
      'data.action': 'open_more_slots',
      'data.date': dateKey,
    });

    if (exists) continue;

    const title = 'Busy Day Tomorrow';
    const body = `You have ${count} approved bookings tomorrow. Consider opening extra slots to reduce crowding.`;

    await NotificationService.createNotification(fid, 'faculty_load_suggestion', title, body, {
      action: 'open_more_slots',
      date: dateKey,
      count: String(count),
    });

    await NotificationService.sendPushNotification(fid, title, body, {
      action: 'open_more_slots',
      date: dateKey,
      count: String(count),
    });

    if (ioRef) {
      ioRef.to(fid.toString()).emit('notification', { type: 'faculty_load_suggestion', date: dateKey });
    }
  }
};

const safeRun = async (fn, label) => {
  try {
    await fn();
  } catch (e) {
    console.error(`[ReminderScheduler] ${label} failed:`, e.message);
  }
};

let started = false;

const startReminderScheduler = () => {
  if (started) return;
  started = true;

  setInterval(() => {
    safeRun(processSmartReminders, 'processSmartReminders');
    safeRun(processFacultyLoadSuggestions, 'processFacultyLoadSuggestions');
  }, 60 * 1000);

  safeRun(processSmartReminders, 'processSmartReminders');
  safeRun(processFacultyLoadSuggestions, 'processFacultyLoadSuggestions');

  console.log('ReminderScheduler started');
};

const startReminderSchedulerWithIo = (io) => {
  ioRef = io;
  startReminderScheduler();
};

module.exports = { startReminderScheduler, startReminderSchedulerWithIo };
