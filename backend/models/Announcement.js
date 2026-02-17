const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    audience: {
      type: String,
      enum: ['all', 'faculty', 'student', 'department'],
      default: 'all',
    },
    department: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sent: {
      type: Boolean,
      default: false,
    },
    sentAt: Date,
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ audience: 1, department: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
