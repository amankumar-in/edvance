const mongoose = require("mongoose");

const pointMetricsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    totalPointsEarned: {
      type: Number,
      default: 0,
    },
    totalPointsSpent: {
      type: Number,
      default: 0,
    },
    netPointsChange: {
      type: Number,
      default: 0,
    },
    totalActiveAccounts: {
      type: Number,
      default: 0,
    },
    averagePointsPerAccount: {
      type: Number,
      default: 0,
    },
    pointsBySource: {
      task: {
        type: Number,
        default: 0,
      },
      attendance: {
        type: Number,
        default: 0,
      },
      behavior: {
        type: Number,
        default: 0,
      },
      badge: {
        type: Number,
        default: 0,
      },
      manual_adjustment: {
        type: Number,
        default: 0,
      },
    },
    pointsByTransactionType: {
      earned: {
        type: Number,
        default: 0,
      },
      spent: {
        type: Number,
        default: 0,
      },
      adjusted: {
        type: Number,
        default: 0,
      },
    },
    levelDistribution: {
      type: Map,
      of: Number,
      default: {},
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
        totalPointsEarned: {
          type: Number,
          default: 0,
        },
        totalPointsSpent: {
          type: Number,
          default: 0,
        },
        netPointsChange: {
          type: Number,
          default: 0,
        },
        averagePointsPerStudent: {
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
pointMetricsSchema.index({ date: 1 });

const PointMetrics = mongoose.model("PointMetrics", pointMetricsSchema);

module.exports = PointMetrics;
