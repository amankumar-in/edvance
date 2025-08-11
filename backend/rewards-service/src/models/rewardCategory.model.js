// src/models/rewardCategory.model.js
const mongoose = require("mongoose");

/**
 * Reward Category Model
 *
 * Handles categories for organizing rewards in the Univance system
 * Both system-defined and user-created categories are supported
 */
const rewardCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Optional image/banner representing the category
    image: {
      type: String,
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
      ref: "RewardCategory",
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
    // Type of category (main category)
    type: {
      type: String,
      enum: ["family", "school", "sponsor", "custom"],
      required: true,
    },
    // Subcategory type
    subcategoryType: {
      type: String,
      enum: ["privilege", "item", "experience", "digital", "custom"],
    },
    // For school-specific categories
    schoolId: {
      type: String,
    },
    // Recommended point value range for rewards in this category
    minPointValue: {
      type: Number,
      default: 0,
    },
    maxPointValue: {
      type: Number,
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
    // Feature category on rewards page
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Ordering for featured sections
    featuredOrder: {
      type: Number,
      default: 0,
    },
    // Is this category active
    isActive: {
      type: Boolean,
      default: true,
    },
    // Is this category deleted (soft delete)
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // Additional metadata
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Indexes
rewardCategorySchema.index({ name: 1, createdBy: 1 }, { unique: true });
rewardCategorySchema.index({ type: 1 });
rewardCategorySchema.index({ schoolId: 1 });
rewardCategorySchema.index({ visibility: 1 });
rewardCategorySchema.index({ parentCategory: 1 });
rewardCategorySchema.index({ isDeleted: 1, isActive: 1 });
rewardCategorySchema.index({ isFeatured: 1, featuredOrder: 1 });

// Methods
rewardCategorySchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.isActive = false;
  await this.save();
};

module.exports = mongoose.model("RewardCategory", rewardCategorySchema);
