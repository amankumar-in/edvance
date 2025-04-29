const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "task",
        "point",
        "badge",
        "attendance",
        "reward",
        "system",
        "user",
      ],
    },
    sourceType: {
      type: String,
      required: true,
      // Examples: task, point_transaction, badge, attendance, reward_redemption, etc.
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      // Reference to the source object (task, badge, etc.)
    },
    read: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isEmailSent: {
      type: Boolean,
      default: false,
    },
    isPushSent: {
      type: Boolean,
      default: false,
    },
    isSmsSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },
    pushSentAt: {
      type: Date,
    },
    smsSentAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    expiresAt: {
      type: Date,
    },
    actionLink: {
      type: String,
    },
    actionText: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, isArchived: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ sourceType: 1, sourceId: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
