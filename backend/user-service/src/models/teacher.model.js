const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
  },
  classIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchoolClass",
    },
  ],
  subjectsTaught: [String],
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
teacherSchema.index({ schoolId: 1 });
teacherSchema.index({ subjectsTaught: 1 });
module.exports = mongoose.model("Teacher", teacherSchema);
