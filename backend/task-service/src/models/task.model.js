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
    // Primary category - reference to TaskCategory
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaskCategory',
      required: true,
    },
    // Category type for quick filtering (derived from category.type)
    categoryType: {
      type: String,
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
    creatorRoles: {
      type: [String],
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
          'parent',
          'student',
          'school',
        ]
      },
      selectedPeopleIds: [mongoose.Schema.Types.ObjectId]
    },
    // Current status of the task
    status: {
      type: String,
      enum: [
        "pending",
        "completed",
        "pending_approval",
        "approved",
        "rejected",
        "expired",
      ],
      default: "pending",
    },
    // Due date for the task
    dueDate: {
      type: Date,
    },
    // Date when task was marked as completed
    completedDate: {
      type: Date,
    },
    // ID of who approved the task
    approvedBy: {
      type: String,
    },
    // Role of the approver
    approverRole: {
      type: String,
      enum: [
        "parent",
        "teacher",
        "school_admin",
        "social_worker",
        "platform_admin",
        "system",
      ],
    },
    // Date when task was approved
    approvalDate: {
      type: Date,
    },
    // User's submission when completing the task
    completion: {
      note: {
        type: String,
      },
      evidence: [
        {
          type: {
            type: String,
            enum: ["image", "document", "link", "text"],
          },
          url: {
            type: String,
          },
          content: {
            type: String,
          },
        },
      ],
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
        "none",
      ],
      default: "none",
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
    // Task visibility (who can see it)
    visibility: {
      type: String,
      enum: ["private", "family", "class", "school", "public"],
      default: "private",
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
    // NEW: Assignment strategy for scalable task assignment
    assignmentStrategy: {
      type: String,
      enum: ['specific', 'role_based', 'school_based', 'global'],
      required: true,
      default: 'specific'
    },
    // NEW: Target criteria for assignment (replaces simple assignedTo for complex scenarios)
    targetCriteria: {
      roles: [{
        type: String,
        enum: ['student', 'parent', 'teacher', 'school_admin']
      }],
      schoolIds: [String],       // specific schools
      classIds: [String],        // specific classes  
      gradeLevel: Number,        // grade filter
      specificUserIds: [String], // for small specific assignments
      excludeUserIds: [String]   // exclusions
    },
    // NEW: Default visibility settings for different controllers
    defaultVisibility: {
      forParents: {
        type: Boolean,
        default: true,
        description: "Can parents see this task and control it for their children?"
      },
      forSchools: {
        type: Boolean, 
        default: true,
        description: "Can schools see this task and control it for their students?"
      },
      forStudents: {
        type: Boolean,
        default: false,
        description: "Is this task directly visible to students without parent/school control?"
      }
    },
  },
  { timestamps: true }
);

// Indexes for common queries
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ category: 1, subCategory: 1 });
taskSchema.index({ schoolId: 1, classId: 1 });
taskSchema.index({ isRecurring: 1, parentTaskId: 1 });

// NEW: Indexes for assignment strategy and targeting
taskSchema.index({ assignmentStrategy: 1, status: 1 });
taskSchema.index({ 'targetCriteria.roles': 1 });
taskSchema.index({ 'targetCriteria.schoolIds': 1 });
taskSchema.index({ 'targetCriteria.classIds': 1 });
taskSchema.index({ 'targetCriteria.gradeLevel': 1 });
taskSchema.index({ 'defaultVisibility.forParents': 1, 'defaultVisibility.forSchools': 1 });

// Pre-save hook to populate categoryType from category reference
taskSchema.pre('save', async function(next) {
  // Only populate categoryType if category is an ObjectId and categoryType is not already set
  if (this.category && mongoose.Types.ObjectId.isValid(this.category) && !this.categoryType) {
    try {
      const TaskCategory = mongoose.model('TaskCategory');
      const categoryDoc = await TaskCategory.findById(this.category);
      if (categoryDoc) {
        this.categoryType = categoryDoc.type;
      }
    } catch (error) {
      console.error('Error populating categoryType:', error);
      // Don't fail the save, just log the error
    }
  }
  next();
});

module.exports = mongoose.model("Task", taskSchema);
