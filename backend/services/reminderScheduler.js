const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const NotificationService = require('./notificationService');
const ReminderPreference = require('../models/ReminderPreference');

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

// New: Process 24-hour before reminders
const process24HourReminders = async () => {
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in24HoursPlus5Min = new Date(in24Hours.getTime() + 5 * 60 * 1000);

  const bookings = await Booking.find({
    status: 'approved',
    'reminders.sent24HoursBefore': false,
  })
    .populate({
      path: 'slot',
      match: {
        startTime: { $gte: in24Hours, $lt: in24HoursPlus5Min },
      },
      select: 'startTime endTime',
    })
    .populate('student', '_id name email')
    .populate('faculty', 'name')
    .select('_id student faculty slot reminders');

  for (const booking of bookings) {
    if (!booking?.slot) continue;

    const studentId = booking?.student?._id;
    if (!studentId) continue;

    // Check user's reminder preferences
    let prefs = await ReminderPreference.findOne({ user: studentId });
    if (!prefs?.remindersEnabled || !prefs?.reminder24HoursBefore) {
      continue;
    }

    // Ensure reminders subdocument exists with proper structure
    if (!booking.reminders) {
      booking.reminders = {
        reminderEnabled: true,
        sent24HoursBefore: false,
        sent1HourBefore: false,
        sentDayOf: false
      };
    }

    // Skip if already sent
    if (booking.reminders?.sent24HoursBefore) {
      continue;
    }

    // Send reminder notification
    const title = `Reminder: Appointment Tomorrow`;
    const body = `Your booking with ${booking.faculty?.name} is scheduled for tomorrow at ${new Date(
      booking.slot.startTime
    ).toLocaleTimeString()}`;

    await NotificationService.createNotification(studentId, 'reminder_24hour', title, body, {
      bookingId: booking._id.toString(),
      facultyName: booking.faculty?.name,
      slotTime: booking.slot.startTime.toISOString(),
    });

    // Send push notification if enabled
    if (prefs.notificationMethods?.pushNotification) {
      await NotificationService.sendPushNotification(studentId, title, body, {
        type: 'reminder_24hour',
        bookingId: booking._id.toString(),
      });
    }

    // Emit socket event for real-time notification
    if (ioRef) {
      ioRef.to(studentId.toString()).emit('reminder', {
        type: 'reminder_24hour',
        bookingId: booking._id.toString(),
        title,
        body,
        slotTime: booking.slot.startTime,
      });
    }

    // Update booking reminder status
    await Booking.updateOne(
      { _id: booking._id },
      {
        $set: {
          'reminders.sent24HoursBefore': true,
          'reminders.sentAt24HoursBefore': now,
        },
      }
    );

    console.log(`[ReminderScheduler] 24-hour reminder sent for booking ${booking._id} to student ${studentId}`);
  }
};

// New: Process 1-hour before reminders
const process1HourReminders = async () => {
  const now = new Date();
  const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);
  const in1HourPlus5Min = new Date(in1Hour.getTime() + 5 * 60 * 1000);

  const bookings = await Booking.find({
    status: 'approved',
    'reminders.sent1HourBefore': false,
  })
    .populate({
      path: 'slot',
      match: {
        startTime: { $gte: in1Hour, $lt: in1HourPlus5Min },
      },
      select: 'startTime endTime',
    })
    .populate('student', '_id name email')
    .populate('faculty', 'name')
    .select('_id student faculty slot reminders');

  for (const booking of bookings) {
    if (!booking?.slot) continue;

    const studentId = booking?.student?._id;
    if (!studentId) continue;

    // Check user's reminder preferences
    let prefs = await ReminderPreference.findOne({ user: studentId });
    if (!prefs?.remindersEnabled || !prefs?.reminder1HourBefore) {
      continue;
    }

    // Ensure reminders subdocument exists with proper structure
    if (!booking.reminders) {
      booking.reminders = {
        reminderEnabled: true,
        sent24HoursBefore: false,
        sent1HourBefore: false,
        sentDayOf: false
      };
    }

    // Skip if already sent
    if (booking.reminders?.sent1HourBefore) {
      continue;
    }

    // Send reminder notification
    const title = `Appointment in 1 Hour`;
    const body = `Your booking with ${booking.faculty?.name} starts in 1 hour at ${new Date(
      booking.slot.startTime
    ).toLocaleTimeString()}`;

    await NotificationService.createNotification(studentId, 'reminder_1hour', title, body, {
      bookingId: booking._id.toString(),
      facultyName: booking.faculty?.name,
      slotTime: booking.slot.startTime.toISOString(),
    });

    // Send push notification if enabled
    if (prefs.notificationMethods?.pushNotification) {
      await NotificationService.sendPushNotification(studentId, title, body, {
        type: 'reminder_1hour',
        bookingId: booking._id.toString(),
      });
    }

    // Emit socket event for real-time notification
    if (ioRef) {
      ioRef.to(studentId.toString()).emit('reminder', {
        type: 'reminder_1hour',
        bookingId: booking._id.toString(),
        title,
        body,
        slotTime: booking.slot.startTime,
      });
    }

    // Update booking reminder status
    await Booking.updateOne(
      { _id: booking._id },
      {
        $set: {
          'reminders.sent1HourBefore': true,
          'reminders.sentAt1HourBefore': now,
        },
      }
    );

    console.log(`[ReminderScheduler] 1-hour reminder sent for booking ${booking._id} to student ${studentId}`);
  }
};

// New: Process day-of reminders
const processDayOfReminders = async () => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = startOfDay(addDays(now, 1));

  const bookings = await Booking.find({
    status: 'approved',
    'reminders.sentDayOf': false,
  })
    .populate({
      path: 'slot',
      match: {
        startTime: { $gte: todayStart, $lt: todayEnd },
      },
      select: 'startTime endTime',
    })
    .populate('student', '_id name email')
    .populate('faculty', 'name')
    .select('_id student faculty slot reminders');

  for (const booking of bookings) {
    if (!booking?.slot) continue;

    const studentId = booking?.student?._id;
    if (!studentId) continue;

    // Check user's reminder preferences
    let prefs = await ReminderPreference.findOne({ user: studentId });
    if (!prefs?.remindersEnabled || !prefs?.reminderDayOf) {
      continue;
    }

    // Ensure reminders subdocument exists with proper structure
    if (!booking.reminders) {
      booking.reminders = {
        reminderEnabled: true,
        sent24HoursBefore: false,
        sent1HourBefore: false,
        sentDayOf: false
      };
    }

    // Skip if already sent
    if (booking.reminders?.sentDayOf) {
      continue;
    }

    // Get the day-of reminder time (default: 9:00 AM in user's timezone)
    const reminderTimeStr = prefs.dayOfReminderTime || '09:00';
    const [hours, minutes] = reminderTimeStr.split(':').map(Number);

    const reminderTime = new Date(todayStart);
    reminderTime.setHours(hours, minutes, 0, 0);

    // Check if we're past the reminder time but before the slot starts
    if (now >= reminderTime && now < booking.slot.startTime) {
      // Send day-of reminder
      const title = `Your Appointment Today`;
      const body = `Reminder: Your booking with ${booking.faculty?.name} is today at ${new Date(
        booking.slot.startTime
      ).toLocaleTimeString()}`;

      await NotificationService.createNotification(studentId, 'reminder_dayof', title, body, {
        bookingId: booking._id.toString(),
        facultyName: booking.faculty?.name,
        slotTime: booking.slot.startTime.toISOString(),
      });

      // Send push notification if enabled
      if (prefs.notificationMethods?.pushNotification) {
        await NotificationService.sendPushNotification(studentId, title, body, {
          type: 'reminder_dayof',
          bookingId: booking._id.toString(),
        });
      }

      // Emit socket event for real-time notification
      if (ioRef) {
        ioRef.to(studentId.toString()).emit('reminder', {
          type: 'reminder_dayof',
          bookingId: booking._id.toString(),
          title,
          body,
          slotTime: booking.slot.startTime,
        });
      }

      // Update booking reminder status
      await Booking.updateOne(
        { _id: booking._id },
        {
          $set: {
            'reminders.sentDayOf': true,
            'reminders.sentAtDayOf': now,
          },
        }
      );

      console.log(`[ReminderScheduler] Day-of reminder sent for booking ${booking._id} to student ${studentId}`);
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

  // Run every 5 minutes to check for due reminders
  setInterval(() => {
    safeRun(processSmartReminders, 'processSmartReminders');
    safeRun(process24HourReminders, 'process24HourReminders');
    safeRun(process1HourReminders, 'process1HourReminders');
    safeRun(processDayOfReminders, 'processDayOfReminders');
    safeRun(processFacultyLoadSuggestions, 'processFacultyLoadSuggestions');
  }, 5 * 60 * 1000);

  // Run immediately on startup
  safeRun(processSmartReminders, 'processSmartReminders');
  safeRun(process24HourReminders, 'process24HourReminders');
  safeRun(process1HourReminders, 'process1HourReminders');
  safeRun(processDayOfReminders, 'processDayOfReminders');
  safeRun(processFacultyLoadSuggestions, 'processFacultyLoadSuggestions');

  console.log('[ReminderScheduler] Started - checking reminders every 5 minutes');
};

const startReminderSchedulerWithIo = (io) => {
  ioRef = io;
  startReminderScheduler();
};

module.exports = { startReminderScheduler, startReminderSchedulerWithIo };
