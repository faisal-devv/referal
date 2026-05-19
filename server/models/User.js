const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin', 'employee'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  wallet: {
    usd: { type: Number, default: 0 },
    aed: { type: Number, default: 0 },
    euro: { type: Number, default: 0 },
    sar: { type: Number, default: 0 }
  },
  preferredCurrency: {
    type: String,
    default: 'USD',
    uppercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  lastLogin: {
    type: Date
  },
  botPaused: {
    type: Boolean,
    default: false
  },
  userId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  isVerified: { type: Boolean, default: false },
  emailOtp: String,
  emailOtpExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
