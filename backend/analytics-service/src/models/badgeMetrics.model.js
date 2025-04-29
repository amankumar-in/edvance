const mongoose = require("mongoose");

const badgeMetricsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    totalBadgesAwarded: {
      type: Number,
      default: 0,
    },
    uniqueStudentsAwarded: {
      type: Number,
      default: 0,
    },
    badgesByCategory: {
      type: Map,
      of: Number,
      default: {},
    },
    mostAwardedBadges: [
      {
        badgeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Badge",
        },
        badgeName: {
          type: String,
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],
    badgesByConditionType: {
      points_threshold: {
        type: Number,
        default: 0,
      },
      task_completion: {
        type: Number,
        default: 0,
      },
      attendance_streak: {
        type: Number,
        default: 0,
      },
      custom: {
        type: Number,
        default: 0,
      },
    },
    badgesByIssuerType: {
      system: {
        type: Number,
        default: 0,
      },
      school: {
        type: Number,
        default: 0,
      },
      parent: {
        type: Number,
        default: 0,
      },
    },
    totalPointsFromBadges: {
      type: Number,
      default: 0,
    },
    schoolMetrics: [
      {
        schoolId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "School",
        },
        schoolName: {
          type: String,
        },
        totalBadgesAwarded: {
          type: Number,
          default: 0,
        },
        uniqueStudentsAwarded: {
          type: Number,
          default: 0,
        },
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index for efficient querying
badgeMetricsSchema.index({ date: 1 });

const BadgeMetrics = mongoose.model("BadgeMetrics", badgeMetricsSchema);

module.exports = BadgeMetrics;
