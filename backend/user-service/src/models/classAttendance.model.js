const mongoose = require("mongoose");

const classAttendanceSchema = new mongoose.Schema({
  // Core identifiers
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
  // attendance date to identify which day
  attendanceDate: {
    type: Date,
    required: true,
    default: () => new Date().toDateString(),
  },
  // Attendance status
  status: {
    type: String,
    enum: ["present", "absent"],
    required: true,
  },
  // Recording details
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  recordedByRole: {
    type: String,
    enum: ["teacher", "system", "school_admin", "student", "parent"],
    required: true,
  },
  recordedAt: {
    type: Date,
    default: new Date(),
  },
  // Additional info
  comments: {
    type: String,
  },
  pointsAwarded: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Indexes for efficient querying
classAttendanceSchema.index({ classId: 1 });
classAttendanceSchema.index({ studentId: 1 });
classAttendanceSchema.index({ status: 1 });

module.exports = mongoose.model("ClassAttendance", classAttendanceSchema); 