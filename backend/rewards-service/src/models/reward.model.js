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
      type: String, // Will store user ID from user service
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
        "system",
      ],
    },
    schoolId: {
      type: String, // Will store school ID from user service
      required: function () {
        return this.creatorType === "school" || this.creatorType === "teacher";
      },
    },
    classId: {
      type: String, // Will store class ID for teacher-created rewards
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
