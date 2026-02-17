const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'booking_created',
      'booking_approved',
      'booking_rejected',
      'booking_cancelled',
      'slot_created',
      'slot_cancelled',
      'reminder_2hour',
      'reminder_1hour',
      'reminder_10min',
      'waitlist_promoted',
      'chat_message',
      'attendance_marked',
      'faculty_load_suggestion',
      'faculty_bulk_notice',
      'announcement'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  data: {
    bookingId: String,
    slotId: String,
    chatId: String,
    action: String,
    date: String,
    count: String,
    message: String
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  sent: {
    type: Boolean,
    default: false
  },
  sentAt: Date,
  scheduledFor: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ scheduledFor: 1, sent: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
