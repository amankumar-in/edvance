const mongoose = require("mongoose");

/**
 * Task Template Model
 *
 * Provides reusable templates for creating tasks
 * Useful for system suggestions, recurring tasks, and commonly used tasks
 */
const taskTemplateSchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: [
        "academic",
        "home",
        "behavior",
        "extracurricular",
        "attendance",
        "system",
      ],
      required: true,
    },
    subCategory: {
      type: String,
      trim: true,
    },
    // Recommended point value
    suggestedPointValue: {
      type: Number,
      required: true,
      min: 0,
    },
    // Who created this template
    createdBy: {
      type: String,
      required: true,
    },
    // Role of the creator
    creatorRole: {
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
    // Default: does this task require approval when created
    requiresApproval: {
      type: Boolean,
      default: true,
    },
    // Default approver type
    defaultApproverType: {
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
    // Is this template for a recurring task
    isRecurring: {
      type: Boolean,
      default: false,
    },
    // Default recurring settings
    defaultRecurringSchedule: {
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
      interval: {
        type: Number,
        default: 1,
      },
    },
    // Estimated time to complete (in minutes)
    estimatedDuration: {
      type: Number,
    },
    // Difficulty level
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "challenging"],
    },
    // For age-appropriate templates
    recommendedAgeMin: {
      type: Number,
    },
    recommendedAgeMax: {
      type: Number,
    },
    // For grade-appropriate templates
    recommendedGradeMin: {
      type: Number,
    },
    recommendedGradeMax: {
      type: Number,
    },
    // Default external resource
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
    // Default attachments
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
    // For school-specific templates
    schoolId: {
      type: String,
    },
    // Visibility/scope of the template
    visibility: {
      type: String,
      enum: ["private", "family", "class", "school", "public"],
      default: "private",
    },
    // Is this a featured template
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Usage count - how many times this template has been used
    usageCount: {
      type: Number,
      default: 0,
    },
    // Is this template active
    isActive: {
      type: Boolean,
      default: true,
    },
    // Additional metadata
    metadata: {
      type: Object,
    },
  },
  { timestamps: true }
);

// Indexes
taskTemplateSchema.index({ category: 1, subCategory: 1 });
taskTemplateSchema.index({ visibility: 1 });
taskTemplateSchema.index({ schoolId: 1 });
taskTemplateSchema.index({ recommendedGradeMin: 1, recommendedGradeMax: 1 });
taskTemplateSchema.index({ isFeatured: 1 });

module.exports = mongoose.model("TaskTemplate", taskTemplateSchema);
