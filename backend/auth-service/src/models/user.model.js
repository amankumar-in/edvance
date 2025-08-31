// /models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  roles: {
    type: [String],
    enum: {
      values: ['student', 'parent', 'teacher', 'school_admin', 'social_worker', 'platform_admin', 'sub_admin'],
      message: '{VALUE} is not a supported role'
    },
    default: ['student']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  avatar: {
    type: String
  },
  phoneNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },

  // Verification fields
  isVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    select: false
  },
  verificationTokenExpires: {
    type: Date,
    select: false
  },
  phoneVerificationOtp: {
    type: String,
    select: false
  },
  phoneVerificationOtpExpires: {
    type: Date,
    select: false
  },

  // Password reset fields
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },
  otp: {
    type: String,
    select: false
  },
  otpExpires: {
    type: Date,
    select: false
  },

  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deviceTokens: {
    type: [String]
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.verificationToken;
      delete ret.verificationTokenExpires;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      delete ret.phoneVerificationOtp;
      delete ret.phoneVerificationOtpExpires;
      delete ret.otp;
      delete ret.otpExpires;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.verificationToken;
      delete ret.verificationTokenExpires;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      delete ret.phoneVerificationOtp;
      delete ret.phoneVerificationOtpExpires;
      delete ret.otp;
      delete ret.otpExpires;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ verificationToken: 1 }, { sparse: true });
userSchema.index({ resetPasswordToken: 1 }, { sparse: true });
userSchema.index({ phoneNumber: 1 }, { unique: true, sparse: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update the updatedAt field and reset phone verification fields if phoneNumber is modified
userSchema.pre('save', function(next) {
  if(this.isModified('phoneNumber')){
    this.isPhoneVerified = false;
    this.phoneVerificationOtp = undefined;
    this.phoneVerificationOtpExpires = undefined;
  }
  this.updatedAt = Date.now();
  next();
});

/**
 * Compare provided password with stored hash
 * @param {string} candidatePassword - Password to check
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.comparePassword = function(candidatePassword) {
  if (!candidatePassword || !this.password) {
    return Promise.resolve(false);
  }
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Update login statistics
 * @param {boolean} success - Whether login was successful
 * @returns {Promise<void>}
 */
userSchema.methods.updateLoginStats = async function(success) {
  if (success) {
    // Reset login attempts on successful login
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    this.lastLogin = Date.now();
  } else {
    // Increment login attempts on failed login
    this.loginAttempts += 1;
    
    // Lock account if too many attempts (configurable)
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCK_TIME = 30 * 60 * 1000; // 30 minutes
    
    if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      this.lockUntil = Date.now() + LOCK_TIME;
    }
  }
  
  return this.save();
};

/**
 * Check if account is locked due to too many failed attempts
 * @returns {boolean} - True if account is locked
 */
userSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

/**
 * Reset password and clear reset token
 * @param {string} newPassword - New password to set
 * @returns {Promise<void>}
 */
userSchema.methods.resetPassword = async function(newPassword) {
  this.password = newPassword;
  this.resetPasswordToken = undefined;
  this.resetPasswordExpires = undefined;
  return this.save();
};

/**
 * Get full name of user
 * @returns {string} - Full name
 */
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

/**
 * Static method to find user by email with sensitive fields
 * @param {string} email - User email
 * @returns {Promise<User>} - User document
 */
userSchema.statics.findByEmailWithResetToken = function(email) {
  return this.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires');
};

/**
 * Static method to find user by email with verification fields
 * @param {string} email - User email
 * @returns {Promise<User>} - User document
 */
userSchema.statics.findByEmailWithVerification = function(email) {
  return this.findOne({ email }).select('+verificationToken +verificationTokenExpires');
};

module.exports = mongoose.model('User', userSchema);