// src/models/reward.model.js
const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    // DEPRECATED: Will be removed in future versions
    category: {
      type: String,
      enum: ["family", "school", "sponsor"],
    },
    // DEPRECATED: Will be removed in future versions
    subcategory: {
      type: String,
      enum: ["privilege", "item", "experience", "digital"],
    },
    // NEW: Reference to RewardCategory collection
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RewardCategory",
    },
    // NEW: Store category names for backward compatibility and faster access
    categoryName: {
      type: String,
    },
    subcategoryName: {
      type: String,
    },
    pointsCost: {
      type: Number,
      required: true,
      min: 0,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId, // Will store profile ID (parent, teacher, social_worker) or user ID for admins
      required: true,
    },
    authUserId: {
      type: mongoose.Schema.Types.ObjectId, // Will store user ID from auth
      required: true,
    },
    creatorType: {
      type: String,
      required: true,
      enum: [
        "parent",
        "teacher",
        "school",
        "social_worker",
        "sponsor",
        "platform_admin",
        "sub_admin",
        "school_admin",
        "system",
      ],
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId, // Will store school ID from user service
      ref: "School",
      required: function () {
        return this.creatorType === "school" || this.creatorType === "teacher";
      },
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId, // Will store class ID for teacher-created rewards
      ref: "SchoolClass",
      required: function () {
        return this.creatorType === "teacher";
      },
    },
    limitedQuantity: {
      type: Boolean,
      default: false,
    },
    quantity: {
      type: Number,
      required: function () {
        return this.limitedQuantity;
      },
      min: 0,
    },
    expiryDate: {
      type: Date,
    },
    image: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // NEW: Parent visibility control
    isVisibleToChildren: {
      type: Boolean,
      default: true,
    },
    // NEW: Track which parents have hidden this reward from their children
    parentHiddenBy: [{
      parentId: {
        type: String,
        required: true,
      },
      hiddenAt: {
        type: Date,
        default: Date.now,
      },
    }],
    redemptionInstructions: {
      type: String,
    },
    restrictions: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
rewardSchema.index({ creatorId: 1, category: 1 });
rewardSchema.index({ schoolId: 1, isActive: 1 });
rewardSchema.index({ classId: 1, isActive: 1 });
rewardSchema.index({ category: 1, subcategory: 1, isActive: 1 });
rewardSchema.index({ categoryId: 1, isActive: 1 }); // NEW INDEX
rewardSchema.index({ expiryDate: 1, isActive: 1 });
rewardSchema.index({ isFeatured: 1, isActive: 1 }); // INDEX for featured rewards
rewardSchema.index({ 'parentHiddenBy.parentId': 1 }); // NEW INDEX for parent visibility control
rewardSchema.index({ authUserId: 1, isActive: 1 }); // NEW INDEX for user-based queries

// Methods
rewardSchema.methods.canBeRedeemed = function () {
  if (!this.isActive || this.isDeleted) return false;
  if (this.expiryDate && this.expiryDate < new Date()) return false;
  if (this.limitedQuantity && this.quantity <= 0) return false;
  return true;
};

rewardSchema.methods.decrementQuantity = async function () {
  if (this.limitedQuantity && this.quantity > 0) {
    this.quantity -= 1;
    await this.save();
    return true;
  }
  return false;
};

rewardSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.isActive = false;
  await this.save();
};

// NEW: Check if reward is visible to a student based on parent controls
rewardSchema.methods.isVisibleToStudent = function (parentIds) {
  // Check base visibility
  if (!this.isVisibleToChildren) return false;

  // Check if any parent has hidden it
  const isHiddenByAnyParent = this.parentHiddenBy?.some(hide =>
    parentIds.includes(hide.parentId)
  );

  return !isHiddenByAnyParent;
};

// NEW: Hide reward from parent's children
rewardSchema.methods.hideFromParent = async function (parentId) {
  // Check if already hidden by this parent
  const alreadyHidden = this.parentHiddenBy?.some(hide => hide.parentId === parentId);
  if (alreadyHidden) return false;

  // Add parent to hidden list
  this.parentHiddenBy.push({
    parentId,
    hiddenAt: new Date(),
  });

  await this.save();
  return true;
};

// NEW: Toggle visibility for parent's children
rewardSchema.methods.toggleParentVisibility = async function (parentId, isVisible) {
  const existingHideIndex = this.parentHiddenBy?.findIndex(hide => hide.parentId === parentId);

  if (isVisible) {
    // Parent wants to show the reward
    if (existingHideIndex === -1) {
      return {
        success: false,
        message: "Reward is already visible to your children"
      };
    }

    // Remove from hidden list (unhide)
    this.parentHiddenBy.splice(existingHideIndex, 1);
    await this.save();

    return {
      success: true,
      message: "Reward is now visible to your children"
    };
  } else {
    // Parent wants to hide the reward
    if (existingHideIndex !== -1) {
      return {
        success: false,
        message: "Reward is already hidden from your children"
      };
    }

    // Add to hidden list
    this.parentHiddenBy.push({
      parentId,
      hiddenAt: new Date(),
    });
    await this.save();

    return {
      success: true,
      message: "Reward is now hidden from your children"
    };
  }
};

// NEW: Check if parent can control this reward's visibility
rewardSchema.methods.canParentControl = function (parentId, childrenData) {
  // Can control if reward is naturally visible to their children
  return (
    this.creatorType === 'system' || // Global rewards
    this.createdByProfileId === parentId || // Own rewards  
    childrenData.some(child => child.schoolId === this.schoolId) || // School rewards
    childrenData.some(child => child.classIds?.includes(this.classId)) // Class rewards
  ) && this.isVisibleToChildren; // And currently visible
};

// NEW: Populate category info before sending response
rewardSchema.methods.populateCategory = async function () {
  if (this.categoryId) {
    const category = await mongoose
      .model("RewardCategory")
      .findById(this.categoryId);
    if (category) {
      this.categoryName = category.type;
      this.subcategoryName = category.subcategoryType;
    }
  }
  return this;
};

// Pre-save hook to update category and subcategory fields
rewardSchema.pre("save", async function (next) {
  if (this.categoryId && this.isModified("categoryId")) {
    try {
      const category = await mongoose
        .model("RewardCategory")
        .findById(this.categoryId);
      if (category) {
        this.categoryName = category.type;
        this.subcategoryName = category.subcategoryType;
        // For backward compatibility, set the enum fields
        this.category = category.type;
        this.subcategory = category.subcategoryType;
      }
    } catch (error) {
      console.error("Error updating category fields:", error);
    }
  }
  next();
});

const Reward = mongoose.model("Reward", rewardSchema);

module.exports = Reward;
