const mongoose = require("mongoose");

const userMetricsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    totalUsers: {
      type: Number,
      default: 0,
    },
    newUsers: {
      type: Number,
      default: 0,
    },
    activeUsers: {
      type: Number,
      default: 0,
    },
    usersByRole: {
      students: {
        type: Number,
        default: 0,
      },
      parents: {
        type: Number,
        default: 0,
      },
      teachers: {
        type: Number,
        default: 0,
      },
      school_admin: {
        type: Number,
        default: 0,
      },
      social_worker: {
        type: Number,
        default: 0,
      },
      platform_admin: {
        type: Number,
        default: 0,
      },
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
        totalUsers: {
          type: Number,
          default: 0,
        },
        activeUsers: {
          type: Number,
          default: 0,
        },
        usersByRole: {
          students: {
            type: Number,
            default: 0,
          },
          parents: {
            type: Number,
            default: 0,
          },
          teachers: {
            type: Number,
            default: 0,
          },
          school_admin: {
            type: Number,
            default: 0,
          },
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
userMetricsSchema.index({ date: 1 });

const UserMetrics = mongoose.model("UserMetrics", userMetricsSchema);

module.exports = UserMetrics;
