const mongoose = require("mongoose");

const pointLimitSchema = new mongoose.Schema({
  // Can be applied globally, per school, or per user
  scope: {
    type: String,
    enum: ["global", "school", "student"],
    required: true,
  },

  // ID of the entity this limit applies to (null for global)
  entityId: {
    type: String,
    required: function () {
      return this.scope !== "global";
    },
  },

  // Different time period limits
  limits: {
    daily: {
      enabled: {
        type: Boolean,
        default: true,
      },
      maxPoints: {
        type: Number,
        default: 100,
      },
    },
    weekly: {
      enabled: {
        type: Boolean,
        default: true,
      },
      maxPoints: {
        type: Number,
        default: 500,
      },
    },
    monthly: {
      enabled: {
        type: Boolean,
        default: false,
      },
      maxPoints: {
        type: Number,
        default: 2000,
      },
    },
  },

  // Source-specific limits
  sourceLimits: {
    // Attendance limits
    attendance: {
      daily: {
        enabled: {
          type: Boolean,
          default: true,
        },
        maxPoints: {
          type: Number,
          default: 10,
        },
      },
    },
    // Task limits
    task: {
      daily: {
        enabled: {
          type: Boolean,
          default: true,
        },
        maxPoints: {
          type: Number,
          default: 50,
        },
      },
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for scope and entityId
pointLimitSchema.index({ scope: 1, entityId: 1 }, { unique: true });

// Static method to get applicable limit for a student
pointLimitSchema.statics.getApplicableLimit = async function (
  studentId,
  schoolId
) {
  try {
    // First check if student has specific limit
    let limit = await this.findOne({ scope: "student", entityId: studentId });

    // If no student-specific limit and school ID provided, check school limit
    if (!limit && schoolId) {
      limit = await this.findOne({ scope: "school", entityId: schoolId });
    }

    // If no student or school limit, use global limit
    if (!limit) {
      limit = await this.findOne({ scope: "global" });

      // If no global limit exists, create one with defaults
      if (!limit) {
        limit = new this({
          scope: "global",
          entityId: null,
        });
        await limit.save();
      }
    }

    return limit;
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model("PointLimit", pointLimitSchema);
