const mongoose = require("mongoose");

/**
 * Task Category Model
 *
 * Handles categories for organizing tasks in the Univance system
 * Both system-defined and user-created categories are supported
 */
const taskCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Icon or emoji for the category
    icon: {
      type: String,
    },
    // Color for UI representation
    color: {
      type: String,
    },
    // Parent category if this is a subcategory
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaskCategory',
    },
    // Who created this category
    createdBy: {
      type: String,
      required: true,
    },
    // Role of creator
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
    // Type of category
    type: {
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
      required: true,
    },
    // Default point value recommendation for this category
    defaultPointValue: {
      type: Number,
      default: 10,
    },
    // For school-specific categories
    schoolId: {
      type: String,
    },
    // For subject-specific categories
    subject: {
      type: String,
    },
    // For grade-level specific categories
    gradeLevel: {
      type: String,
    },
    // Is this a system category that cannot be modified
    isSystem: {
      type: Boolean,
      default: false,
    },
    // Visibility/scope of the category
    visibility: {
      type: String,
      enum: ["private", "family", "class", "school", "public"],
      default: "private",
    },
    // Ordering for display
    displayOrder: {
      type: Number,
      default: 0,
    },
    // Is this category active
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
taskCategorySchema.index({ name: 1, createdBy: 1 }, { unique: true });
taskCategorySchema.index({ type: 1 });
taskCategorySchema.index({ schoolId: 1 });
taskCategorySchema.index({ visibility: 1 });

module.exports = mongoose.model("TaskCategory", taskCategorySchema);
