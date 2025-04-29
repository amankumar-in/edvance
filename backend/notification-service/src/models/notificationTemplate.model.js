const mongoose = require("mongoose");

const notificationTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
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
    eventType: {
      type: String,
      required: true,
      // Examples: task.assigned, task.completed, point.earned, badge.awarded, etc.
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    emailSubject: {
      type: String,
      default: "",
    },
    emailBody: {
      type: String,
      default: "",
    },
    pushBody: {
      type: String,
      default: "",
    },
    smsBody: {
      type: String,
      default: "",
    },
    channels: {
      type: [String],
      enum: ["in_app", "email", "push", "sms"],
      default: ["in_app"],
    },
    defaultRoles: {
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
    isSystemTemplate: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
notificationTemplateSchema.index({ type: 1, eventType: 1 });
notificationTemplateSchema.index({ isActive: 1 });

const NotificationTemplate = mongoose.model(
  "NotificationTemplate",
  notificationTemplateSchema
);

module.exports = NotificationTemplate;
