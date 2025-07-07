const mongoose = require("mongoose");

const linkRequestSchema = new mongoose.Schema({
  initiatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'initiator'
  },
  initiator: {
    type: String,
    enum: ["Student", "Parent", "School", "Teacher"],
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  targetEmail: {
    // Email address for invitation if no existing account
    type: String,
    required: true,
  },
  requestType: {
    type: String,
    enum: ["parent", "school"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "expired", "cancelled"],
    default: "pending",
  },
  code: {
    // For manual entry when no direct account link exists
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for better performance
linkRequestSchema.index({ initiatorId: 1, initiator: 1 });
linkRequestSchema.index({ targetId: 1 });
linkRequestSchema.index({ targetEmail: 1 });
linkRequestSchema.index({ code: 1 });
linkRequestSchema.index({ status: 1 });

module.exports = mongoose.model("LinkRequest", linkRequestSchema);
