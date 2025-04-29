const mongoose = require("mongoose");

const rewardRedemptionSchema = new mongoose.Schema(
  {
    rewardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reward",
      required: true,
    },
    studentId: {
      type: String, // Will store student ID from user service
      required: true,
    },
    pointsSpent: {
      type: Number,
      required: true,
      min: 0,
    },
    redemptionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "fulfilled", "canceled", "expired"],
      default: "pending",
    },
    fulfillmentDate: {
      type: Date,
    },
    fulfillerId: {
      type: String, // Will store user ID of who fulfilled the redemption
    },
    redemptionCode: {
      type: String,
      unique: true,
      sparse: true, // Allows null values but ensures uniqueness when not null
    },
    feedback: {
      type: String,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    cancelReason: {
      type: String,
    },
    cancelledBy: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
rewardRedemptionSchema.index({ studentId: 1, status: 1 });
rewardRedemptionSchema.index({ rewardId: 1, status: 1 });
rewardRedemptionSchema.index(
  { redemptionCode: 1 },
  { unique: true, sparse: true }
);
rewardRedemptionSchema.index({ redemptionDate: 1 });
rewardRedemptionSchema.index({ fulfillmentDate: 1 });

// Pre-save hook to generate redemption code if not provided
rewardRedemptionSchema.pre("save", function (next) {
  if (!this.redemptionCode && this.isNew) {
    // Generate a unique redemption code
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    this.redemptionCode = `RDM-${timestamp}-${randomStr}`.toUpperCase();
  }
  next();
});

// Methods
rewardRedemptionSchema.methods.fulfill = async function (
  fulfillerId,
  feedback
) {
  if (this.status !== "pending") {
    throw new Error("Can only fulfill pending redemptions");
  }

  this.status = "fulfilled";
  this.fulfillmentDate = new Date();
  this.fulfillerId = fulfillerId;
  if (feedback) {
    this.feedback = feedback;
  }

  await this.save();
  return this;
};

rewardRedemptionSchema.methods.cancel = async function (userId, reason) {
  if (this.status !== "pending") {
    throw new Error("Can only cancel pending redemptions");
  }

  this.status = "canceled";
  this.cancelledBy = userId;
  this.cancelledAt = new Date();
  this.cancelReason = reason;

  await this.save();
  return this;
};

rewardRedemptionSchema.methods.markExpired = async function () {
  if (this.status !== "pending") {
    throw new Error("Can only expire pending redemptions");
  }

  this.status = "expired";
  await this.save();
  return this;
};

const RewardRedemption = mongoose.model(
  "RewardRedemption",
  rewardRedemptionSchema
);

module.exports = RewardRedemption;
