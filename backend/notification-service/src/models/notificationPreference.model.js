const mongoose = require("mongoose");

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // General settings
    enabled: {
      type: Boolean,
      default: true,
    },
    // Channel preferences
    channels: {
      inApp: {
        type: Boolean,
        default: true,
      },
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
    },
    // Quiet hours
    quietHours: {
      enabled: {
        type: Boolean,
        default: false,
      },
      start: {
        type: String,
        default: "22:00", // 10 PM
      },
      end: {
        type: String,
        default: "08:00", // 8 AM
      },
      timezone: {
        type: String,
        default: "UTC",
      },
    },
    // Notification type preferences
    preferences: {
      // Task related
      taskAssignment: {
        enabled: { type: Boolean, default: true },
        channels: {
          inApp: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          push: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
        },
      },
      taskReminder: {
        enabled: { type: Boolean, default: true },
        channels: {
          inApp: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          push: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
        },
      },
      taskApproval: {
        enabled: { type: Boolean, default: true },
        channels: {
          inApp: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          push: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
        },
      },
      // Points related
      pointsEarned: {
        enabled: { type: Boolean, default: true },
        channels: {
          inApp: { type: Boolean, default: true },
          email: { type: Boolean, default: false },
          push: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
        },
      },
      levelUp: {
        enabled: { type: Boolean, default: true },
        channels: {
          inApp: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          push: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
        },
      },
      // Badge related
      badgeEarned: {
        enabled: { type: Boolean, default: true },
        channels: {
          inApp: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          push: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
        },
      },
      // Reward related
      rewardRedemption: {
        enabled: { type: Boolean, default: true },
        channels: {
          inApp: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          push: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
        },
      },
      newReward: {
        enabled: { type: Boolean, default: true },
        channels: {
          inApp: { type: Boolean, default: true },
          email: { type: Boolean, default: false },
          push: { type: Boolean, default: false },
          sms: { type: Boolean, default: false },
        },
      },
      // User related
      linkRequest: {
        enabled: { type: Boolean, default: true },
        channels: {
          inApp: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          push: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
        },
      },
      accountUpdate: {
        enabled: { type: Boolean, default: true },
        channels: {
          inApp: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          push: { type: Boolean, default: false },
          sms: { type: Boolean, default: false },
        },
      },
      // Attendance related
      attendanceReminder: {
        enabled: { type: Boolean, default: true },
        channels: {
          inApp: { type: Boolean, default: true },
          email: { type: Boolean, default: false },
          push: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
        },
      },
      attendanceStreak: {
        enabled: { type: Boolean, default: true },
        channels: {
          inApp: { type: Boolean, default: true },
          email: { type: Boolean, default: false },
          push: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure each user has only one preference document
notificationPreferenceSchema.index({ userId: 1 }, { unique: true });

const NotificationPreference = mongoose.model(
  "NotificationPreference",
  notificationPreferenceSchema
);

module.exports = NotificationPreference;
