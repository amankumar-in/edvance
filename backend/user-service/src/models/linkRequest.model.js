const mongoose = require("mongoose");

const linkRequestSchema = new mongoose.Schema({
  initiatorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'initiator'
  },
  initiator: {
    type: String,
    enum: ["student", "parent", "school", "teacher"],
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.model("LinkRequest", linkRequestSchema);
