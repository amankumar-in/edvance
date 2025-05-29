const mongoose = require("mongoose");

/**
 * Task Visibility Control Model
 * 
 * Handles visibility overrides for tasks by parents and schools.
 * This allows parents to control which tasks their children see,
 * and schools to control which tasks their students see.
 */
const taskVisibilityControlSchema = new mongoose.Schema(
  {
    // Reference to the task being controlled
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    
    // Type of controller (parent, school, class)
    controllerType: {
      type: String,
      enum: ["parent", "school", "class"],
      required: true,
    },
    
    // ID of the controller (parent._id, school._id, class._id)
    controllerId: {
      type: String,
      required: true,
    },
    
    // Whether the task should be visible to the controlled entities
    isVisible: {
      type: Boolean,
      required: true,
      default: true,
    },
    
    // Specific student IDs that this control applies to
    // For parents: their children
    // For schools: their students  
    // For classes: students in that class
    controlledStudentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    
    // Who made this visibility change
    changedBy: {
      type: String,
      required: true,
    },
    
    // Role of the person who made the change
    changedByRole: {
      type: String,
      enum: [
        "parent",
        "teacher", 
        "school_admin",
        "platform_admin",
      ],
      required: true,
    },
    
    // Optional reason for the visibility change
    reason: {
      type: String,
    },
    
    // Additional metadata
    metadata: {
      type: Object,
    },
  },
  { 
    timestamps: true,
    // Ensure unique combinations
    indexes: [
      { taskId: 1, controllerType: 1, controllerId: 1 },
      { taskId: 1, controlledStudentIds: 1 },
      { controllerId: 1, controllerType: 1 },
    ]
  }
);

// Compound index for efficient queries
taskVisibilityControlSchema.index({ 
  taskId: 1, 
  controllerType: 1, 
  controllerId: 1 
}, { unique: true });

// Index for finding controls by student
taskVisibilityControlSchema.index({ 
  controlledStudentIds: 1, 
  isVisible: 1 
});

// Index for finding controls by controller
taskVisibilityControlSchema.index({ 
  controllerId: 1, 
  controllerType: 1 
});

module.exports = mongoose.model("TaskVisibilityControl", taskVisibilityControlSchema);