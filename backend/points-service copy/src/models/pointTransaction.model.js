const mongoose = require("mongoose");

const pointTransactionSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PointAccount",
    required: true,
    index: true,
  },
  studentId: {
    type: String,
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["earned", "spent", "adjusted"],
    required: true,
  },
  source: {
    type: String,
    enum: [
      "task",
      "attendance",
      "behavior",
      "badge",
      "redemption",
      "manual_adjustment",
    ],
    required: true,
  },
  sourceId: {
    type: String,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  awardedBy: {
    type: String, // Usually a User ID
    required: true,
  },
  awardedByRole: {
    type: String,
    enum: [
      "student",
      "parent",
      "teacher",
      "school_admin",
      "social_worker",
      "platform_admin",
      "system",
    ],
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  metadata: {
    type: Object,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  // Add these new fields
  transactionDay: {
    type: Date,
    index: true,
  },
  transactionWeek: {
    type: Date,
    index: true,
  },
  transactionMonth: {
    type: Date,
    index: true,
  },
});

// Add this pre-save middleware after the schema but before module.exports
pointTransactionSchema.pre("save", function (next) {
  // Set day to the start of the day (midnight)
  const day = new Date(this.createdAt);
  day.setHours(0, 0, 0, 0);
  this.transactionDay = day;

  // Set week to the start of the week (Sunday midnight)
  const week = new Date(this.createdAt);
  const dayOfWeek = week.getDay(); // 0 = Sunday, 6 = Saturday
  week.setDate(week.getDate() - dayOfWeek); // Go back to Sunday
  week.setHours(0, 0, 0, 0);
  this.transactionWeek = week;

  // Set month to the start of the month
  const month = new Date(this.createdAt);
  month.setDate(1); // First day of month
  month.setHours(0, 0, 0, 0);
  this.transactionMonth = month;

  next();
});
// Compound index for faster queries
pointTransactionSchema.index({ studentId: 1, createdAt: -1 });
pointTransactionSchema.index({ accountId: 1, type: 1 });
pointTransactionSchema.index({ source: 1, sourceId: 1 });

module.exports = mongoose.model("PointTransaction", pointTransactionSchema);
