const mongoose = require("mongoose");

/**
 * Task Model
 *
 * Handles all types of tasks in the Univance system:
 * - Academic tasks assigned by teachers
 * - Home tasks assigned by parents
 * - System-suggested tasks
 * - Self-assigned tasks by students
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Primary category
    category: {
      type: String,
      required: true,
      enum: [
        "academic",
        "home",
        "behavior",
        "extracurricular",
        "attendance",
        "system",
        "custom",
      ],
    },
    // More specific subcategory (e.g., "math", "reading", "chore", etc.)
    subCategory: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    // Points awarded upon completion
    pointValue: {
      type: Number,
      required: true,
      min: 0,
    },
    // Who created the task
    createdBy: {
      type: String,
      required: true,
    },
    // Role of the creator
    creatorRole: {
      type: String,
      enum: [
        "student",
        "parent",
        "teacher",
        "school_admin",
        "social_worker",
        "platform_admin",
        "sub_admin",
      ],
      required: true,
    },
    // Who the task is assigned to (typically a student)
    assignedTo: {
      role: {
        type: String,
        enum: [
          "parent",
          "student",
          "school",
        ],
      },
      selectedPeopleIds: [mongoose.Schema.Types.ObjectId],
    },
    // Due date for the task
    dueDate: {
      type: Date,
    },
    // Is this a recurring task?
    isRecurring: {
      type: Boolean,
      default: false,
    },
    // For recurring tasks
    recurringSchedule: {
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
      },
      daysOfWeek: [
        {
          type: Number,
          min: 0,
          max: 6,
        },
      ],
      // How many days/weeks/months between occurrences
      interval: {
        type: Number,
        default: 1,
      },
      endDate: {
        type: Date,
      },
    },
    // For recurring task instances
    parentTaskId: {
      type: String,
    },
    instanceDate: {
      type: Date,
    },
    // Does this task require approval?
    requiresApproval: {
      type: Boolean,
      default: true,
    },
    // Who should approve this task
    approverType: {
      type: String,
      enum: [
        "parent",
        "teacher",
        "school_admin",
        "social_worker",
        "platform_admin",
        "system",
      ],
      default: "system",
    },
    // If this approverType is "parent", which specific parent ID should approve
    specificApproverId: {
      type: String,
    },
    // For tasks linked to external resources (e.g., Khan Academy)
    externalResource: {
      platform: {
        type: String,
      },
      resourceId: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    // Attachments to the task
    attachments: [
      {
        type: {
          type: String,
          enum: ["image", "document", "link", "video"],
        },
        url: {
          type: String,
        },
        name: {
          type: String,
        },
        contentType: {
          type: String,
        },
      },
    ],
    // Comments on the task
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        createdBy: {
          type: String,
          required: true,
        },
        creatorRole: {
          type: String,
          enum: [
            "student",
            "parent",
            "teacher",
            "school_admin",
            "social_worker",
            "platform_admin",
            "system",
          ],
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Difficulty level
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "challenging"],
    },
    // School-related fields
    schoolId: {
      type: String,
    },
    classId: {
      type: String,
    },
    // If part of a badge or achievement
    badgeId: {
      type: String,
    },
    // Additional task properties
    metadata: {
      type: Object,
    },
    // Is this task featured or specially highlighted
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Has this task been deleted (soft delete)
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for common queries
taskSchema.index({ createdBy: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ category: 1, subCategory: 1 });
taskSchema.index({ schoolId: 1, classId: 1 });
taskSchema.index({ isRecurring: 1, parentTaskId: 1 });

module.exports = mongoose.model("Task", taskSchema);
