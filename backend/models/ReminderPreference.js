const mongoose = require('mongoose');

const reminderPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // General reminder settings
  remindersEnabled: {
    type: Boolean,
    default: true
  },
  // 24-hour reminder
  reminder24HoursBefore: {
    type: Boolean,
    default: true
  },
  // 1-hour reminder
  reminder1HourBefore: {
    type: Boolean,
    default: true
  },
  // Day-of reminder (morning)
  reminderDayOf: {
    type: Boolean,
    default: true
  },
  dayOfReminderTime: {
    type: String,
    default: '09:00' // Format: HH:mm in 24-hour
  },
  // Notification delivery methods
  notificationMethods: {
    pushNotification: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    }
  },
  // Quiet hours (no reminders during this time)
  quietHoursEnabled: {
    type: Boolean,
    default: false
  },
  quietHoursStart: {
    type: String,
    default: '22:00'
  },
  quietHoursEnd: {
    type: String,
    default: '08:00'
  },
  // Reminder customization
  includeSlotDetails: {
    type: Boolean,
    default: true
  },
  includeFacultyDetails: {
    type: Boolean,
    default: true
  },
  customMessage: {
    type: String,
    maxlength: 200
  },
  // Timezone preference
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ReminderPreference', reminderPreferenceSchema);
