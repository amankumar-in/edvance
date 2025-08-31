const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: {
    type: [String],
    enum: [
      "student",
      "parent",
      "teacher",
      "school_admin",
      "social_worker",
      "platform_admin",
    ],
    default: ["student"],
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
  },
  avatar: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  deviceTokens: {
    type: [String],
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
}, {
  timestamps: true,
});

// Create indexes for search
userSchema.index({ firstName: 1, lastName: 1 });
userSchema.index({ email: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
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

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
module.exports = mongoose.model("User", userSchema);
