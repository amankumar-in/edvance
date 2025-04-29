const mongoose = require("mongoose");

const analyticsJobSchema = new mongoose.Schema(
  {
    jobType: {
      type: String,
      required: true,
      enum: ["user", "task", "point", "badge", "full"],
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    processedRecords: {
      type: Number,
      default: 0,
    },
    error: {
      message: String,
      stack: String,
    },
    metrics: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastRun: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
analyticsJobSchema.index({ jobType: 1, status: 1 });
analyticsJobSchema.index({ startDate: 1, endDate: 1 });

const AnalyticsJob = mongoose.model("AnalyticsJob", analyticsJobSchema);

module.exports = AnalyticsJob;
