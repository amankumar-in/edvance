const mongoose = require("mongoose");

const linkRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  requestType: {
    type: String,
    enum: ["parent", "school"],
    required: true,
  },
  targetId: {
    // parentId or schoolId
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  targetEmail: {
    // Email address for invitation if no existing account
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "expired"],
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
