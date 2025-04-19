// badge.model.js
const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  image: {
    type: String,
  },
  collection: {
    type: String,
    default: null,
    index: true,
  },
  collectionOrder: {
    type: Number,
    default: 0,
  },
  conditions: {
    type: {
      type: String,
      enum: [
        "points_threshold",
        "task_completion",
        "attendance_streak",
        "custom",
      ],
      required: true,
    },
    threshold: {
      type: Number,
    },
    taskCategory: {
      type: String,
    },
    streak: {
      type: Number,
    },
  },
  pointsBonus: {
    type: Number,
    default: 0,
  },
  issuerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  issuerType: {
    type: String,
    enum: ["system", "school", "parent"],
    default: "system",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Badge", badgeSchema);
