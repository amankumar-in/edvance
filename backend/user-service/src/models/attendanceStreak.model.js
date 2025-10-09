const mongoose = require('mongoose');

const attendanceStreakSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SchoolClass",
    required: true,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  lastAttendanceDate: {
    type: Date,
  },
  lastCalculatedAt: {
    type: Date,
    default: Date.now,
  },
  academicYear: {
    type: String,
    required: true,
  },
  academicTerm: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model("AttendanceStreak", attendanceStreakSchema);  

// Indexes for efficient querying
attendanceStreakSchema.index({ studentId: 1, classId: 1 }, { unique: true });
attendanceStreakSchema.index({ currentStreak: -1 });
attendanceStreakSchema.index({ classId: 1, currentStreak: -1 });
