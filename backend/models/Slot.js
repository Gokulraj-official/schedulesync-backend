const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: [true, 'Please provide start time']
  },
  endTime: {
    type: Date,
    required: [true, 'Please provide end time']
  },
  location: {
    type: String,
    required: [true, 'Please provide location'],
    trim: true
  },
  notes: {
    type: String,
    maxlength: 300
  },
  capacity: {
    type: Number,
    default: 1,
    min: 1
  },
  bookedCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

slotSchema.index({ faculty: 1, startTime: 1 });
slotSchema.index({ startTime: 1, endTime: 1 });

slotSchema.pre('save', function(next) {
  this.isAvailable = this.bookedCount < this.capacity && this.status === 'active';
  next();
});

slotSchema.methods.checkAvailability = function() {
  return this.bookedCount < this.capacity && this.status === 'active';
};

module.exports = mongoose.model('Slot', slotSchema);
