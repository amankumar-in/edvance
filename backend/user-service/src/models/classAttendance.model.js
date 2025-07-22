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

  // Attendance Date( just the day, not the time)
  attendanceDate: {
    type: Date,
    required: true,
  },

  //Current Attendance status
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

  // 🔍 History of changes
  history: [
    {
      status: {
        type: String,
        enum: ["present", "absent"],
      },
      recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
      },
      recordedByRole: {
        type: String,
        enum: ["teacher", "system", "school_admin", "student", "parent"],
      },
      comments: String,
      recordedAt: {
        type: Date,
        default: () => new Date(),
      },
    },
  ],
}, { timestamps: true });

// Indexes for efficient querying
classAttendanceSchema.index({ classId: 1 });
classAttendanceSchema.index({ studentId: 1 });
classAttendanceSchema.index({ status: 1 });

module.exports = mongoose.model("ClassAttendance", classAttendanceSchema); 