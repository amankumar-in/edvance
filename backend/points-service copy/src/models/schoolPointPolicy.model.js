const mongoose = require("mongoose");

const schoolPointPolicySchema = new mongoose.Schema({
  schoolId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  policies: {
    attendance: {
      dailyCheckIn: {
        type: Number,
        default: 5,
      },
      streak: {
        enabled: {
          type: Boolean,
          default: true,
        },
        interval: {
          type: Number,
          default: 5,
        },
        bonus: {
          type: Number,
          default: 5,
        },
      },
    },
    task: {
      base: {
        type: Number,
        default: 10,
      },
      categories: {
        type: Map,
        of: Number,
        default: () =>
          new Map([
            ["homework", 10],
            ["quiz", 15],
            ["exam", 25],
            ["project", 20],
            ["reading", 5],
          ]),
      },
    },
    dailyLimit: {
      enabled: {
        type: Boolean,
        default: false,
      },
      maxPoints: {
        type: Number,
        default: 100,
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
  },
});

// Static method to get or create a policy for school
schoolPointPolicySchema.statics.getOrCreatePolicy = async function (schoolId) {
  try {
    let policy = await this.findOne({ schoolId });

    if (!policy) {
      policy = new this({
        schoolId,
        // Default values will be used from schema
      });
      await policy.save();
    }

    return policy;
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model("SchoolPointPolicy", schoolPointPolicySchema);
