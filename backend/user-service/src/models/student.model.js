const mongoose = require("mongoose"); // Add this line at the top

// CHANGE: Remove point fields, add pointsAccountId reference
const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  grade: {
    type: String,
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
  },
  parentIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
    },
  ],
  teacherIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
  ],
  // REMOVE: currentPoints, totalEarnedPoints, spentPoints fields
  // ADD: reference to points service
  pointsAccountId: {
    type: String,
    unique: true,
  },
  level: {
    type: Number,
    default: 1,
  },
  badges: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
    },
  ],
  lastCheckInDate: {
    type: Date,
  },
  attendanceStreak: {
    type: Number,
    default: 0,
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

// Create indexes for search
studentSchema.index({ grade: 1 });
studentSchema.index({ schoolId: 1 });
module.exports = mongoose.model("Student", studentSchema);
