const mongoose = require("mongoose");

/**
 * Task Assignment Model
 * 
 * Tracks actual task assignments to students.
 * This model handles the many-to-many relationship between tasks and students
 * in a scalable way without storing large arrays in the task document.
 */
const taskAssignmentSchema = new mongoose.Schema(
  {
    // Reference to the task
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    
    // Reference to the student who has this task assigned
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student", 
      required: true,
    },
    
    // Who assigned this task to the student
    assignedBy: {
      type: String,
      required: true,
    },
    
    // Role of the person who assigned the task
    assignedByRole: {
      type: String,
      enum: [
        "parent",
        "teacher",
        "school_admin", 
        "social_worker",
        "platform_admin",
        "system",
      ],
      required: true,
    },
    
    // Whether this assignment is currently active
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // When the task was assigned
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    
    // Source of the assignment
    source: {
      type: String,
      enum: ["admin", "parent", "school", "teacher", "system", "bulk"],
      required: true,
    },
    
    // When the assignment was deactivated (if applicable)
    deactivatedAt: {
      type: Date,
    },
    
    // Who deactivated the assignment
    deactivatedBy: {
      type: String,
    },
    
    // Reason for deactivation
    deactivationReason: {
      type: String,
    },
    
    // Additional metadata about the assignment
    metadata: {
      type: Object,
    },
    
    // School context (for filtering and analytics)
    schoolId: {
      type: String,
    },
    
    // Class context (for filtering and analytics)
    classId: {
      type: String,
    },
  },
  { 
    timestamps: true 
  }
);

// Compound index for unique active assignments
taskAssignmentSchema.index({ 
  taskId: 1, 
  studentId: 1, 
  isActive: 1 
}, { unique: true });

// Index for finding assignments by student
taskAssignmentSchema.index({ 
  studentId: 1, 
  isActive: 1,
  assignedAt: -1 
});

// Index for finding assignments by task
taskAssignmentSchema.index({ 
  taskId: 1, 
  isActive: 1 
});

// Index for analytics and reporting
taskAssignmentSchema.index({ 
  schoolId: 1, 
  assignedAt: -1 
});

taskAssignmentSchema.index({ 
  classId: 1, 
  assignedAt: -1 
});

// Index for assignment source tracking
taskAssignmentSchema.index({ 
  source: 1, 
  assignedByRole: 1,
  assignedAt: -1 
});

module.exports = mongoose.model("TaskAssignment", taskAssignmentSchema);