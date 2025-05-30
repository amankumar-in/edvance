const mongoose = require("mongoose");

/**
 * Task Visibility Model
 * 
 * Controls the visibility of tasks to specific students in the system.
 * This model enables granular control over which students can see which tasks,
 * particularly for parents who want to selectively show/hide tasks to their children.
 * 
 * Use Cases:
 * - Parent showing a task to only specific children in their family
 * - Teacher making a task visible only to selected students
 * - Platform admins managing task visibility across the platform
 * 
 * Relationships:
 * - References Task model via taskId
 * - References Student model via toggledForUserId
 */
const taskVisibilitySchema = new mongoose.Schema({
  // Reference to the task whose visibility is being controlled
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  
  // User who made the visibility change (typically a parent)
  toggledBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  }, 
  
  // Role of the user who toggled visibility
  toggleByRole:{
    type: String,
    enum: ['parent', 'teacher', 'platform_admin', 'sub_admin'],
    required: true,
  },
  
  // Student whose visibility is being controlled
  toggledForUserId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  }, 
  
  // Whether the task is visible to the specified student
  // true = explicitly visible, false = explicitly hidden
  isVisible: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

// Create a unique compound index to ensure there's only one visibility record
// per task per student
taskVisibilitySchema.index({ taskId: 1, toggledForUserId: 1 }, { unique: true });

const TaskVisibility = mongoose.model('TaskVisibility', taskVisibilitySchema);

module.exports = TaskVisibility;
