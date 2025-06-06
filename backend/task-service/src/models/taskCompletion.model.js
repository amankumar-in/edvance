const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')

/**
 * Task Completion Model
 * 
 * Handles the tracking of task completion status, evidence, and approval process.
 * This model maintains a separate record for each student's task completion,
 * which allows for individual tracking when a task might be assigned to multiple students.
 *
 * Relationships:
 * - References Task model via taskId
 * - References Student model via studentId
 * - References User model via approvedBy (for approvers)
 */
const taskCompletionSchema = new mongoose.Schema({
  // Reference to the task being completed
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },

  // Reference to the student who completed the task
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },

  // Timestamp when the student marked the task as completed
  completedAt: {
    type: Date,
    default: Date.now,
  },

  // Optional note provided by the student when submitting completion
  note: {
    type: String,
    trim: true,
  },

  // Array of evidence items that prove task completion
  evidence: [
    {
      // Type of evidence provided (image, document, link, or text)
      type: {
        type: String,
        enum: ['image', 'document', 'link', 'text']
      },

      // URL for external evidence (images, documents, etc.)
      url: {
        type: String,
      },

      // Text content for evidence (descriptions, answers, etc.)
      content: {
        type: String,
      },
    }
  ],

  // Current status of the task completion workflow
  status: {
    type: String,
    enum: [
      "pending",       // Not yet started
      "pending_approval", // Submitted and awaiting approval
      "approved",      // Approved by authorized user
      "rejected",      // Rejected by authorized user
      "expired",       // Past due date without completion
    ],
    default: "pending",
  },

  // Reference to the user who approved/rejected the task
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // Role of the person who approved the task
  approverRole: {
    type: String,
    enum: ['parent', 'teacher', 'school_admin', 'social_worker', 'platform_admin', 'system'],
  },

  // Timestamp when the task was approved or rejected
  approvalDate: {
    type: Date,
  },
  // Feedback given by approver
  feedback: String,
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

// Ensure each student can only have one completion record per task
taskCompletionSchema.index({ taskId: 1, studentId: 1 }, { unique: true });

taskCompletionSchema.plugin(aggregatePaginate)

const TaskCompletion = mongoose.model('TaskCompletion', taskCompletionSchema);

module.exports = TaskCompletion;

