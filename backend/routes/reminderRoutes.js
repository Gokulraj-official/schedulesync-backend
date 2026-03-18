const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ReminderPreference = require('../models/ReminderPreference');
const Booking = require('../models/Booking');

// Get user's reminder preferences
router.get('/preferences', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    let prefs = await ReminderPreference.findOne({ user: userId });

    // If no preferences exist, create default ones
    if (!prefs) {
      prefs = new ReminderPreference({ user: userId });
      await prefs.save();
    }

    // Convert notification methods object to array format for frontend
    const notificationMethods = [];
    if (prefs.notificationMethods?.pushNotification) notificationMethods.push('push');
    if (prefs.notificationMethods?.email) notificationMethods.push('email');
    if (prefs.notificationMethods?.sms) notificationMethods.push('sms');

    res.json({
      success: true,
      remindersEnabled: prefs.remindersEnabled,
      reminder24HoursBefore: prefs.reminder24HoursBefore,
      reminder1HourBefore: prefs.reminder1HourBefore,
      reminderDayOf: prefs.reminderDayOf,
      dayOfReminderTime: prefs.dayOfReminderTime,
      notificationMethods,
      quietHoursEnabled: prefs.quietHoursEnabled,
      quietHoursStart: prefs.quietHoursStart,
      quietHoursEnd: prefs.quietHoursEnd,
      includeSlotDetails: prefs.includeSlotDetails,
      includeFacultyDetails: prefs.includeFacultyDetails,
      customReminderMessage: prefs.customMessage,
      timezone: prefs.timezone,
    });
  } catch (error) {
    console.error('Get reminder preferences error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reminder preferences' });
  }
});

// Update user's reminder preferences
router.put('/preferences', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      remindersEnabled,
      reminder24HoursBefore,
      reminder1HourBefore,
      reminderDayOf,
      dayOfReminderTime,
      notificationMethods,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
      includeSlotDetails,
      includeFacultyDetails,
      customReminderMessage,
      timezone,
    } = req.body;

    let prefs = await ReminderPreference.findOne({ user: userId });

    if (!prefs) {
      prefs = new ReminderPreference({ user: userId });
    }

    // Update fields if provided
    if (remindersEnabled !== undefined) prefs.remindersEnabled = remindersEnabled;
    if (reminder24HoursBefore !== undefined) prefs.reminder24HoursBefore = reminder24HoursBefore;
    if (reminder1HourBefore !== undefined) prefs.reminder1HourBefore = reminder1HourBefore;
    if (reminderDayOf !== undefined) prefs.reminderDayOf = reminderDayOf;
    if (dayOfReminderTime !== undefined) prefs.dayOfReminderTime = dayOfReminderTime;
    
    // Convert notification methods array to object format
    if (notificationMethods !== undefined) {
      prefs.notificationMethods = {
        pushNotification: notificationMethods.includes('push'),
        email: notificationMethods.includes('email'),
        sms: notificationMethods.includes('sms'),
      };
    }
    
    if (quietHoursEnabled !== undefined) prefs.quietHoursEnabled = quietHoursEnabled;
    if (quietHoursStart !== undefined) prefs.quietHoursStart = quietHoursStart;
    if (quietHoursEnd !== undefined) prefs.quietHoursEnd = quietHoursEnd;
    if (includeSlotDetails !== undefined) prefs.includeSlotDetails = includeSlotDetails;
    if (includeFacultyDetails !== undefined) prefs.includeFacultyDetails = includeFacultyDetails;
    if (customReminderMessage !== undefined) prefs.customMessage = customReminderMessage;
    if (timezone !== undefined) prefs.timezone = timezone;

    await prefs.save();

    // Convert notification methods object to array format for frontend (consistent with GET)
    const notificationMethodsArray = [];
    if (prefs.notificationMethods?.pushNotification) notificationMethodsArray.push('push');
    if (prefs.notificationMethods?.email) notificationMethodsArray.push('email');
    if (prefs.notificationMethods?.sms) notificationMethodsArray.push('sms');

    res.json({
      success: true,
      message: 'Reminder preferences updated successfully',
      remindersEnabled: prefs.remindersEnabled,
      reminder24HoursBefore: prefs.reminder24HoursBefore,
      reminder1HourBefore: prefs.reminder1HourBefore,
      reminderDayOf: prefs.reminderDayOf,
      dayOfReminderTime: prefs.dayOfReminderTime,
      notificationMethods: notificationMethodsArray,
      quietHoursEnabled: prefs.quietHoursEnabled,
      quietHoursStart: prefs.quietHoursStart,
      quietHoursEnd: prefs.quietHoursEnd,
      includeSlotDetails: prefs.includeSlotDetails,
      includeFacultyDetails: prefs.includeFacultyDetails,
      customReminderMessage: prefs.customMessage,
      timezone: prefs.timezone,
    });
  } catch (error) {
    console.error('Update reminder preferences error:', error);
    res.status(500).json({ success: false, message: 'Failed to update reminder preferences' });
  }
});

// Get upcoming reminders for user
router.get('/upcoming', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingBookings = await Booking.find({
      student: userId,
      status: 'approved',
    })
      .populate({
        path: 'slot',
        match: {
          startTime: { $gte: now, $lte: in24Hours },
        },
        select: 'startTime endTime location',
      })
      .populate('faculty', 'name email')
      .select('_id slot faculty reminders')
      .lean();

    // Filter bookings where slot exists (matched by populate)
    const filtered = upcomingBookings.filter((b) => b.slot);

    res.json({
      success: true,
      upcomingReminders: filtered.map((booking) => ({
        bookingId: booking._id,
        facultyName: booking.faculty?.name,
        facultyEmail: booking.faculty?.email,
        slotTime: booking.slot.startTime,
        location: booking.slot.location,
        reminders: {
          sent24HoursBefore: booking.reminders?.sent24HoursBefore || false,
          sent1HourBefore: booking.reminders?.sent1HourBefore || false,
          sentDayOf: booking.reminders?.sentDayOf || false,
        },
      })),
      count: filtered.length,
    });
  } catch (error) {
    console.error('Get upcoming reminders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch upcoming reminders' });
  }
});

// Test reminder (sends a test notification)
router.post('/test', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId)
      .populate('student', '_id')
      .populate('faculty', 'name')
      .populate('slot', 'startTime');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.student._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const prefs = await ReminderPreference.findOne({ user: userId });
    if (!prefs) {
      return res.status(400).json({ success: false, message: 'Reminder preferences not found' });
    }

    const testMessage = prefs.customMessage || 'This is a test reminder for your upcoming appointment.';

    res.json({
      success: true,
      message: 'Test reminder notification would be sent',
      testData: {
        bookingId,
        facultyName: booking.faculty?.name,
        slotTime: booking.slot?.startTime,
        notificationMethods: prefs.notificationMethods,
        customMessage: testMessage,
      },
    });
  } catch (error) {
    console.error('Test reminder error:', error);
    res.status(500).json({ success: false, message: 'Failed to process test reminder' });
  }
});

// Toggle all reminders on/off
router.put('/toggle', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { enabled } = req.body;

    if (enabled === undefined) {
      return res.status(400).json({ success: false, message: 'Enabled status is required' });
    }

    let prefs = await ReminderPreference.findOne({ user: userId });

    if (!prefs) {
      prefs = new ReminderPreference({ user: userId, remindersEnabled: enabled });
    } else {
      prefs.remindersEnabled = enabled;
    }

    await prefs.save();

    res.json({
      success: true,
      message: `Reminders ${enabled ? 'enabled' : 'disabled'}`,
      remindersEnabled: prefs.remindersEnabled,
    });
  } catch (error) {
    console.error('Toggle reminders error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle reminders' });
  }
});

module.exports = router;
