const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const AuditLog = require('../models/AuditLog');
const Announcement = require('../models/Announcement');
const SystemSetting = require('../models/SystemSetting');
const NotificationService = require('../services/notificationService');

const logAdminAction = async (req, action, targetType, targetId, metadata = {}) => {
  try {
    await AuditLog.create({
      actor: req.user._id,
      action,
      targetType,
      targetId,
      metadata
    });
  } catch (e) {
  }
};

const parseDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, verified } = req.query;
    let query = {};
    
    if (role) query.role = role;
    if (verified !== undefined) query.isVerified = verified === 'true';

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/verify
// @desc    Verify a faculty user
// @access  Private/Admin
router.put('/users/:id/verify', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isVerified = true;
    user.verifiedBy = req.user._id;
    user.verifiedAt = Date.now();
    await user.save();

    // Send notification
    const io = req.app.get('io');
    io.to(user._id.toString()).emit('verified', {
      message: 'Your account has been verified'
    });

    res.json({
      success: true,
      message: 'User verified successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/statistics
// @desc    Get system-wide statistics
// @access  Private/Admin
router.get('/statistics', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const verifiedFaculty = await User.countDocuments({ role: 'faculty', isVerified: true });
    const pendingVerification = await User.countDocuments({ role: 'faculty', isVerified: false });
    
    const totalSlots = await Slot.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const approvedBookings = await Booking.countDocuments({ status: 'approved' });
    
    // Department-wise stats
    const departmentStats = await User.aggregate([
      { $match: { role: 'faculty' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      statistics: {
        users: {
          total: totalUsers,
          faculty: totalFaculty,
          students: totalStudents,
          verifiedFaculty,
          pendingVerification
        },
        slots: {
          total: totalSlots
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          approved: approvedBookings
        },
        departments: departmentStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/users/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'faculty', 'student'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    if (req.params.id.toString() === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot demote yourself' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await logAdminAction(req, 'user_role_changed', 'User', user._id, { oldRole, newRole: role });

    res.json({ success: true, message: 'Role updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/audit-logs', protect, authorize('admin'), async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const skip = Math.max(parseInt(req.query.skip || '0', 10), 0);
    const action = req.query.action;

    const query = {};
    if (action) query.action = action;

    const logs = await AuditLog.find(query)
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/bookings', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, faculty, student } = req.query;
    const from = parseDate(req.query.from);
    const to = parseDate(req.query.to);

    const query = {};
    if (status) query.status = status;
    if (faculty) query.faculty = faculty;
    if (student) query.student = student;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = from;
      if (to) query.createdAt.$lte = to;
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate('slot')
      .populate('student', 'name email department profilePhoto')
      .populate('faculty', 'name email department profilePhoto');

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/bookings/:id/force-cancel', protect, authorize('admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'cancelled' || booking.status === 'rejected') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled/rejected' });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason || 'Cancelled by admin';
    await booking.save();

    const slot = await Slot.findById(booking.slot);
    if (slot) {
      slot.bookedCount = Math.max(0, slot.bookedCount - 1);
      await slot.save();
    }

    const title = 'Booking Cancelled';
    const body = booking.cancellationReason;

    NotificationService.createNotification(booking.student, 'booking_cancelled', title, body, {
      bookingId: booking._id.toString(),
      action: 'view_booking'
    }).catch(() => {});

    NotificationService.createNotification(booking.faculty, 'booking_cancelled', title, body, {
      bookingId: booking._id.toString(),
      action: 'view_booking'
    }).catch(() => {});

    NotificationService.sendPushNotification(booking.student, title, body, {
      bookingId: booking._id.toString(),
      action: 'view_booking'
    }).catch(() => {});

    NotificationService.sendPushNotification(booking.faculty, title, body, {
      bookingId: booking._id.toString(),
      action: 'view_booking'
    }).catch(() => {});

    const io = req.app.get('io');
    if (io) {
      io.to(booking.student.toString()).emit('booking_updated', { bookingId: booking._id, status: booking.status });
      io.to(booking.faculty.toString()).emit('booking_updated', { bookingId: booking._id, status: booking.status });
    }

    await logAdminAction(req, 'booking_force_cancelled', 'Booking', booking._id, { reason: booking.cancellationReason });

    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/slots', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, faculty } = req.query;
    const from = parseDate(req.query.from);
    const to = parseDate(req.query.to);

    const query = {};
    if (status) query.status = status;
    if (faculty) query.faculty = faculty;
    if (from || to) {
      query.startTime = {};
      if (from) query.startTime.$gte = from;
      if (to) query.startTime.$lte = to;
    }

    const slots = await Slot.find(query)
      .sort({ startTime: -1 })
      .populate('faculty', 'name email department profilePhoto');

    res.json({ success: true, count: slots.length, slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/slots/:id/cancel', protect, authorize('admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    slot.status = 'cancelled';
    await slot.save();

    const affectedBookings = await Booking.find({
      slot: slot._id,
      status: { $in: ['pending', 'approved'] }
    });

    for (const b of affectedBookings) {
      b.status = 'cancelled';
      b.cancelledAt = new Date();
      b.cancellationReason = reason || 'Slot cancelled by admin';
      await b.save();

      const title = 'Appointment Cancelled';
      const body = b.cancellationReason;

      NotificationService.createNotification(b.student, 'booking_cancelled', title, body, {
        bookingId: b._id.toString(),
        slotId: slot._id.toString(),
        action: 'view_booking'
      }).catch(() => {});

      NotificationService.sendPushNotification(b.student, title, body, {
        bookingId: b._id.toString(),
        slotId: slot._id.toString(),
        action: 'view_booking'
      }).catch(() => {});

      const io = req.app.get('io');
      if (io) {
        io.to(b.student.toString()).emit('booking_updated', { bookingId: b._id, status: b.status });
        io.to(b.faculty.toString()).emit('booking_updated', { bookingId: b._id, status: b.status });
      }
    }

    slot.bookedCount = 0;
    await slot.save();

    await logAdminAction(req, 'slot_cancelled', 'Slot', slot._id, { reason: reason || 'Slot cancelled by admin' });

    res.json({ success: true, message: 'Slot cancelled', slot, affectedBookings: affectedBookings.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/announcements', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, body, audience, department, sendPush } = req.body;
    if (!title || !body) {
      return res.status(400).json({ success: false, message: 'title and body are required' });
    }

    const ann = await Announcement.create({
      title,
      body,
      audience: audience || 'all',
      department: department || undefined,
      createdBy: req.user._id,
      sent: true,
      sentAt: new Date()
    });

    const userQuery = {};
    if (ann.audience === 'faculty') userQuery.role = 'faculty';
    if (ann.audience === 'student') userQuery.role = 'student';
    if (ann.audience === 'department') userQuery.department = ann.department;

    const users = await User.find(userQuery).select('_id');
    const userIds = users.map((u) => u._id);

    await Promise.all(
      userIds.map((uid) =>
        NotificationService.createNotification(uid, 'announcement', title, body, {
          action: 'view_announcement'
        })
      )
    );

    if (sendPush) {
      await Promise.allSettled(
        userIds.map((uid) =>
          NotificationService.sendPushNotification(uid, title, body, { action: 'view_announcement' })
        )
      );
    }

    const io = req.app.get('io');
    if (io) {
      userIds.forEach((uid) => {
        io.to(uid.toString()).emit('announcement', { title, body });
      });
    }

    await logAdminAction(req, 'announcement_sent', 'Announcement', ann._id, {
      audience: ann.audience,
      department: ann.department,
      sendPush: !!sendPush,
      recipients: userIds.length
    });

    res.json({ success: true, announcement: ann, recipients: userIds.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/announcements', protect, authorize('admin'), async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ success: true, count: announcements.length, announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/settings', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await SystemSetting.find().sort({ key: 1 });
    res.json({ success: true, count: settings.length, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/settings/:key', protect, authorize('admin'), async (req, res) => {
  try {
    const key = req.params.key;
    const { value } = req.body;

    const setting = await SystemSetting.findOneAndUpdate(
      { key },
      { value, updatedBy: req.user._id, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    await logAdminAction(req, 'system_setting_updated', 'SystemSetting', setting._id, { key });

    res.json({ success: true, setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/reports/department-booking-load', protect, authorize('admin'), async (req, res) => {
  try {
    const from = parseDate(req.query.from);
    const to = parseDate(req.query.to);
    const match = {};
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = from;
      if (to) match.createdAt.$lte = to;
    }

    const result = await Booking.aggregate([
      { $match: match },
      { $group: { _id: '$faculty', totalBookings: { $sum: 1 } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'facultyUser'
        }
      },
      { $unwind: '$facultyUser' },
      { $group: { _id: '$facultyUser.department', totalBookings: { $sum: '$totalBookings' } } },
      { $sort: { totalBookings: -1 } }
    ]);

    res.json({ success: true, report: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/reports/peak-hours', protect, authorize('admin'), async (req, res) => {
  try {
    const from = parseDate(req.query.from);
    const to = parseDate(req.query.to);

    const match = {};
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = from;
      if (to) match.createdAt.$lte = to;
    }

    const result = await Booking.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'slots',
          localField: 'slot',
          foreignField: '_id',
          as: 'slotDoc'
        }
      },
      { $unwind: '$slotDoc' },
      { $group: { _id: { $hour: '$slotDoc.startTime' }, totalBookings: { $sum: 1 } } },
      { $sort: { totalBookings: -1 } }
    ]);

    res.json({ success: true, report: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/reports/top-faculty', protect, authorize('admin'), async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);
    const result = await Booking.aggregate([
      { $group: { _id: '$faculty', totalBookings: { $sum: 1 } } },
      { $sort: { totalBookings: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'facultyUser'
        }
      },
      { $unwind: '$facultyUser' },
      {
        $project: {
          _id: 1,
          totalBookings: 1,
          name: '$facultyUser.name',
          email: '$facultyUser.email',
          department: '$facultyUser.department'
        }
      }
    ]);

    res.json({ success: true, report: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/reports/cancellation-reasons', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await Booking.aggregate([
      { $match: { status: 'cancelled', cancellationReason: { $exists: true, $ne: '' } } },
      { $group: { _id: '$cancellationReason', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);

    res.json({ success: true, report: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/reports/bookings.csv', protect, authorize('admin'), async (req, res) => {
  try {
    const from = parseDate(req.query.from);
    const to = parseDate(req.query.to);

    const query = {};
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = from;
      if (to) query.createdAt.$lte = to;
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate('slot')
      .populate('student', 'name email department')
      .populate('faculty', 'name email department');

    const escape = (v) => {
      const s = (v ?? '').toString().replace(/\r?\n/g, ' ');
      if (s.includes(',') || s.includes('"')) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const header = [
      'bookingId',
      'status',
      'createdAt',
      'facultyName',
      'facultyEmail',
      'facultyDepartment',
      'studentName',
      'studentEmail',
      'studentDepartment',
      'slotStartTime',
      'slotEndTime',
      'location',
      'purpose',
      'rejectionReason',
      'cancellationReason'
    ];

    const lines = [header.join(',')];
    for (const b of bookings) {
      lines.push(
        [
          b._id,
          b.status,
          b.createdAt,
          b.faculty?.name,
          b.faculty?.email,
          b.faculty?.department,
          b.student?.name,
          b.student?.email,
          b.student?.department,
          b.slot?.startTime,
          b.slot?.endTime,
          b.slot?.location,
          b.purpose,
          b.rejectionReason,
          b.cancellationReason
        ]
          .map(escape)
          .join(',')
      );
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"');
    res.status(200).send(lines.join('\n'));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
