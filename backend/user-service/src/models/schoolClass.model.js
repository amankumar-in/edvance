const mongoose = require("mongoose");

const schoolClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  grade: {
    type: String,
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
  },
  studentIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  joinCode: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  schedule: {
    type: [{
      dayOfWeek: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true,
      },
      startTime: {
        type: String, // Format: "HH:MM" (24-hour format)
        required: true,
      },
      endTime: {
        type: String, // Format: "HH:MM" (24-hour format)
        required: true,
      },
    }], 
    required: true,
    validate: {
      validator: function (arr) {
        return arr.length > 0;
      },
      message: 'Schedule cannot be empty',
    },
  },
  // For semester/term-based scheduling
  academicYear: {
    type: String,
    required: true,
  },
  academicTerm: {
    type: String,
  },
});

// Compound and performance indexes
schoolClassSchema.index({ schoolId: 1, name: 1 });
schoolClassSchema.index({ schoolId: 1, grade: 1 });



module.exports = mongoose.model("SchoolClass", schoolClassSchema);
