const mongoose = require("mongoose");

const userDeviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    deviceType: {
      type: String,
      enum: ["ios", "android", "web", "other"],
      required: true,
    },
    deviceModel: {
      type: String,
      default: "",
    },
    deviceName: {
      type: String,
      default: "",
    },
    osVersion: {
      type: String,
      default: "",
    },
    appVersion: {
      type: String,
      default: "",
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    notificationEnabled: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      default: "en",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
userDeviceSchema.index({ userId: 1, active: 1 });
userDeviceSchema.index({ token: 1 });

const UserDevice = mongoose.model("UserDevice", userDeviceSchema);

module.exports = UserDevice;
