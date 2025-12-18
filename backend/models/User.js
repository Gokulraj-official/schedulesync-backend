const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['faculty', 'student'],
    required: [true, 'Please specify role']
  },
  department: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  qualifications: [{
    type: String
  }],
  profilePhoto: {
    type: String,
    default: ''
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  statusMessage: {
    type: String,
    default: '',
    maxlength: 100
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  publicScheduleToken: {
    type: String,
    unique: true,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generatePublicToken = function() {
  const crypto = require('crypto');
  this.publicScheduleToken = crypto.randomBytes(32).toString('hex');
  return this.publicScheduleToken;
};

module.exports = mongoose.model('User', userSchema);
