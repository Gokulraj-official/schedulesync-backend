const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  purpose: {
    type: String,
    required: [true, 'Please provide purpose of appointment'],
    maxlength: 300
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    maxlength: 200
  },
  cancellationReason: {
    type: String,
    maxlength: 200
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  // Attendance tracking
  attendance: {
    status: {
      type: String,
      enum: ['pending', 'checked-in', 'attended', 'no-show', 'rescheduled'],
      default: 'pending'
    },
    checkedInAt: Date,
    markedAt: Date,
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  },
  // Waitlist support
  isWaitlisted: {
    type: Boolean,
    default: false
  },
  waitlistPosition: Number,
  promotedFromWaitlist: {
    type: Boolean,
    default: false
  },
  promotedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

bookingSchema.index({ student: 1, createdAt: -1 });
bookingSchema.index({ faculty: 1, status: 1 });
bookingSchema.index({ slot: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
