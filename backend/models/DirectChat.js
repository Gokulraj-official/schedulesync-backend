const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  attachment: {
    url: String,
    type: {
      type: String,
      enum: ['image', 'pdf', 'document']
    },
    filename: String
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const directChatSchema = new mongoose.Schema({
  directKey: {
    type: String,
    required: true,
    unique: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messages: [messageSchema],
  lastMessage: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

directChatSchema.index({ directKey: 1 });
directChatSchema.index({ participants: 1 });

module.exports = mongoose.model('DirectChat', directChatSchema);
