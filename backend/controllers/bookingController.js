const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const User = require('../models/User');
const NotificationService = require('../services/notificationService');

const emitToUser = (req, userId, eventName, payload) => {
  const io = req.app.get('io');
  if (!io) return;
  io.to(userId.toString()).emit(eventName, payload);
};

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

exports.createBooking = async (req, res) => {
  try {
    const { slotId, purpose } = req.body;

    const slot = await Slot.findById(slotId);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    if (!slot.checkAvailability()) {
      return res.status(400).json({
        success: false,
        message: 'Slot is not available'
      });
    }

    if (slot.startTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book past slots'
      });
    }

    const existingBooking = await Booking.findOne({
      slot: slotId,
      student: req.user._id,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You have already booked this slot'
      });
    }

    const conflictingBooking = await Booking.findOne({
      student: req.user._id,
      status: 'approved'
    }).populate('slot');

    if (conflictingBooking) {
      const existingSlot = conflictingBooking.slot;
      if (
        existingSlot &&
        ((slot.startTime >= existingSlot.startTime && slot.startTime < existingSlot.endTime) ||
        (slot.endTime > existingSlot.startTime && slot.endTime <= existingSlot.endTime))
      ) {
        return res.status(400).json({
          success: false,
          message: 'You have a conflicting appointment at this time'
        });
      }
    }

    const booking = await Booking.create({
      slot: slotId,
      student: req.user._id,
      faculty: slot.faculty,
      purpose
    });

    slot.bookedCount += 1;
    await slot.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('slot_updated', {
        action: 'capacity_changed',
        slotId: slot._id.toString(),
        facultyId: slot.faculty.toString(),
      });
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('slot')
      .populate('student', 'name email department profilePhoto')
      .populate('faculty', 'name email department profilePhoto');

    emitToUser(req, populatedBooking.faculty._id || populatedBooking.faculty, 'booking_created', {
      bookingId: populatedBooking._id,
      status: populatedBooking.status
    });

    NotificationService.notifyBookingCreated(populatedBooking).catch(() => {});

    res.status(201).json({
      success: true,
      booking: populatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getFacultyTomorrowSummary = async (req, res) => {
  try {
    const now = new Date();
    const tomorrowStart = startOfDay(addDays(now, 1));
    const tomorrowEnd = startOfDay(addDays(now, 2));

    const bookings = await Booking.find({ faculty: req.user._id, status: 'approved' })
      .populate({
        path: 'slot',
        match: { startTime: { $gte: tomorrowStart, $lt: tomorrowEnd } },
        select: 'startTime endTime location',
      })
      .populate('student', 'name department profilePhoto')
      .select('slot student purpose createdAt')
      .lean();

    const filtered = bookings.filter((b) => !!b.slot);
    res.json({
      success: true,
      count: filtered.length,
      bookings: filtered,
      date: tomorrowStart.toISOString().slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.notifyTomorrowStudents = async (req, res) => {
  try {
    const { message } = req.body;
    const now = new Date();
    const tomorrowStart = startOfDay(addDays(now, 1));
    const tomorrowEnd = startOfDay(addDays(now, 2));
    const dateKey = tomorrowStart.toISOString().slice(0, 10);

    const bookings = await Booking.find({ faculty: req.user._id, status: 'approved' })
      .populate({
        path: 'slot',
        match: { startTime: { $gte: tomorrowStart, $lt: tomorrowEnd } },
        select: 'startTime endTime location',
      })
      .populate('student', 'name')
      .select('_id slot student')
      .lean();

    const filtered = bookings.filter((b) => !!b.slot);
    const studentIds = Array.from(
      new Set(filtered.map((b) => (b.student?._id || b.student).toString()))
    );

    if (!studentIds.length) {
      return res.status(400).json({ success: false, message: 'No approved bookings tomorrow' });
    }

    const title = 'Reminder from Faculty';
    const body = (message && String(message).trim().length)
      ? String(message).trim()
      : 'You have an appointment scheduled for tomorrow. Please be on time.';

    await Promise.allSettled(
      studentIds.map((sid) =>
        NotificationService.createNotification(sid, 'faculty_bulk_notice', title, body, {
          action: 'view_booking',
          date: dateKey,
          count: String(studentIds.length),
          message: body,
        })
      )
    );

    await Promise.allSettled(
      studentIds.map((sid) =>
        NotificationService.sendPushNotification(sid, title, body, {
          action: 'view_booking',
          date: dateKey,
        })
      )
    );

    const io = req.app.get('io');
    if (io) {
      studentIds.forEach((sid) => {
        io.to(sid.toString()).emit('notification', { type: 'faculty_bulk_notice' });
      });
    }

    res.json({ success: true, notified: studentIds.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const { status } = req.query;

    let query = { student: req.user._id };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate('slot')
      .populate('faculty', 'name email department profilePhoto isOnline statusMessage');

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getFacultyBookings = async (req, res) => {
  try {
    const { status } = req.query;

    let query = { faculty: req.user._id };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate('slot')
      .populate('student', 'name email department profilePhoto');

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this booking'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be approved'
      });
    }

    booking.status = 'approved';
    booking.approvedAt = new Date();
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('slot')
      .populate('student', 'name email department profilePhoto')
      .populate('faculty', 'name email department profilePhoto');

    emitToUser(req, populatedBooking.student._id || populatedBooking.student, 'booking_updated', {
      bookingId: populatedBooking._id,
      status: populatedBooking.status
    });

    emitToUser(req, populatedBooking.faculty._id || populatedBooking.faculty, 'booking_updated', {
      bookingId: populatedBooking._id,
      status: populatedBooking.status
    });

    NotificationService.notifyBookingApproved(populatedBooking).catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Booking approved successfully',
      booking: populatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this booking'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be rejected'
      });
    }

    booking.status = 'rejected';
    booking.rejectionReason = reason;
    booking.rejectedAt = new Date();
    await booking.save();

    const slot = await Slot.findById(booking.slot);
    if (slot) {
      slot.bookedCount = Math.max(0, slot.bookedCount - 1);
      await slot.save();

      const io = req.app.get('io');
      if (io) {
        io.emit('slot_updated', {
          action: 'capacity_changed',
          slotId: slot._id.toString(),
          facultyId: slot.faculty.toString(),
        });
      }
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('slot')
      .populate('student', 'name email department profilePhoto')
      .populate('faculty', 'name email department profilePhoto');

    emitToUser(req, populatedBooking.student._id || populatedBooking.student, 'booking_updated', {
      bookingId: populatedBooking._id,
      status: populatedBooking.status
    });

    emitToUser(req, populatedBooking.faculty._id || populatedBooking.faculty, 'booking_updated', {
      bookingId: populatedBooking._id,
      status: populatedBooking.status
    });

    NotificationService.notifyBookingRejected(populatedBooking, reason).catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Booking rejected successfully',
      booking: populatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const isStudent = booking.student.toString() === req.user._id.toString();
    const isFaculty = booking.faculty.toString() === req.user._id.toString();

    if (!isStudent && !isFaculty) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'cancelled' || booking.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled or rejected'
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    await booking.save();

    const slot = await Slot.findById(booking.slot);
    if (slot) {
      slot.bookedCount = Math.max(0, slot.bookedCount - 1);
      await slot.save();

      const io = req.app.get('io');
      if (io) {
        io.emit('slot_updated', {
          action: 'capacity_changed',
          slotId: slot._id.toString(),
          facultyId: slot.faculty.toString(),
        });
      }
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('slot')
      .populate('student', 'name email department profilePhoto')
      .populate('faculty', 'name email department profilePhoto');

    emitToUser(req, populatedBooking.student._id || populatedBooking.student, 'booking_updated', {
      bookingId: populatedBooking._id,
      status: populatedBooking.status
    });

    emitToUser(req, populatedBooking.faculty._id || populatedBooking.faculty, 'booking_updated', {
      bookingId: populatedBooking._id,
      status: populatedBooking.status
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: populatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('slot')
      .populate('student', 'name email department profilePhoto')
      .populate('faculty', 'name email department profilePhoto');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const isStudent = booking.student._id.toString() === req.user._id.toString();
    const isFaculty = booking.faculty._id.toString() === req.user._id.toString();

    if (!isStudent && !isFaculty) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
