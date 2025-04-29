const mongoose = require("mongoose");

const taskMetricsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    totalTasks: {
      type: Number,
      default: 0,
    },
    newTasks: {
      type: Number,
      default: 0,
    },
    completedTasks: {
      type: Number,
      default: 0,
    },
    pendingTasks: {
      type: Number,
      default: 0,
    },
    approvedTasks: {
      type: Number,
      default: 0,
    },
    rejectedTasks: {
      type: Number,
      default: 0,
    },
    expiredTasks: {
      type: Number,
      default: 0,
    },
    tasksByCategory: {
      type: Map,
      of: Number,
      default: {},
    },
    tasksByCreatorRole: {
      student: {
        type: Number,
        default: 0,
      },
      parent: {
        type: Number,
        default: 0,
      },
      teacher: {
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
      system: {
        type: Number,
        default: 0,
      },
    },
    tasksByDifficulty: {
      easy: {
        type: Number,
        default: 0,
      },
      medium: {
        type: Number,
        default: 0,
      },
      hard: {
        type: Number,
        default: 0,
      },
      challenging: {
        type: Number,
        default: 0,
      },
    },
    completionRate: {
      type: Number,
      default: 0,
    },
    averageCompletionTime: {
      type: Number, // in hours
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
        totalTasks: {
          type: Number,
          default: 0,
        },
        completedTasks: {
          type: Number,
          default: 0,
        },
        completionRate: {
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
taskMetricsSchema.index({ date: 1 });

const TaskMetrics = mongoose.model("TaskMetrics", taskMetricsSchema);

module.exports = TaskMetrics;
