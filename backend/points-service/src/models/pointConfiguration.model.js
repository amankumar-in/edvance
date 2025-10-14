const mongoose = require("mongoose");

const pointConfigurationSchema = new mongoose.Schema({
  // Configuration should be a singleton, versioned
  version: {
    type: Number,
    default: 1,
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },

  // Basic activity points
  activityPoints: {
    // Attendance points
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
      perfectWeek: {
        enabled: {
          type: Boolean,
          default: true,
        },
        bonus: {
          type: Number,
          default: 10,
        },
      },
    },

    // Task categories
    tasks: {
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
            ["practice", 8],
          ]),
      },
      // Task difficulty multipliers
      difficultyMultipliers: {
        type: Map,
        of: Number,
        default: () =>
          new Map([
            ["easy", 0.75],
            ["medium", 1.0],
            ["hard", 1.5],
          ]),
      },
    },

    // Badge points
    badges: {
      default: {
        type: Number,
        default: 10,
      },
      // Special badges can have custom values
      special: {
        type: Map,
        of: Number,
        default: () =>
          new Map([
            ["perfect_month", 50],
            ["top_performer", 100],
          ]),
      },
    },

    // Behavior related points
    behavior: {
      positive: {
        type: Number,
        default: 5,
      },
      negative: {
        type: Number,
        default: -5,
      },
    },
  },

  // Point limits
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
    // Source-specific limits
    sources: {
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
  },

  // Level progression thresholds
  levelProgression: {
    type: Map,
    of: Number,
    default: () =>
      new Map([
        ["2", 100], // Need 100 points to reach level 2
        ["3", 250], // Need 250 points to reach level 3
        ["4", 500], // Need 500 points to reach level 4
        ["5", 1000], // Need 1000 points to reach level 5
        ["6", 1750], // and so on...
        ["7", 2750],
        ["8", 4000],
        ["9", 5500],
        ["10", 7500],
      ]),
  },

  maxLevel: {
  type: Number,
  default: 10,
  min: 5,    // Require at least 5 levels
  max: 100   // Cap at 100 levels
},

  // Level names (optional)
  levelNames: {
    type: Map,
    of: String,
    default: () =>
      new Map([
        ["1", "Novice Scholar"],
        ["2", "Apprentice Scholar"],
        ["3", "Developing Scholar"],
        ["4", "Proficient Scholar"],
        ["5", "Advanced Scholar"],
        ["6", "Distinguished Scholar"],
        ["7", "Expert Scholar"],
        ["8", "Master Scholar"],
        ["9", "Grand Scholar"],
        ["10", "Premier Scholar"],
      ]),
  },

  // Metadata
  createdBy: {
    type: String, // User ID
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: String, // User ID
  },
  updatedAt: {
    type: Date,
  },
});

// Static method to get active configuration
pointConfigurationSchema.statics.getActive = async function () {
  try {
    let config = await this.findOne({ isActive: true }).sort({ version: -1 });

    // If no active config exists, create default
    if (!config) {
      config = new this({
        version: 1,
        isActive: true,
        createdBy: "system",
      });
      await config.save();
    }

    return config;
  } catch (error) {
    console.error("Error getting active configuration:", error);
    throw error;
  }
};

// Method to create a new version based on current
pointConfigurationSchema.statics.createNewVersion = async function (
  updatedData,
  updatedBy
) {
  try {
    // Get current active config
    const currentConfig = await this.getActive();

    // Find the highest version number in database
    const maxVersionConfig = await this.findOne()
      .sort({ version: -1 })
      .select('version');

    const nextVersion = maxVersionConfig ? maxVersionConfig.version + 1 : 1;

    // Deactivate current config
    currentConfig.isActive = false;
    await currentConfig.save();

    // Create new config with incremented version
    const newConfig = new this({
      ...currentConfig.toObject(),
      _id: new mongoose.Types.ObjectId(), // Generate new ID
      version: nextVersion,
      isActive: true,
      createdBy: updatedBy,
      createdAt: new Date(),
      updatedBy: null,
      updatedAt: null,
      ...updatedData,
    });

    await newConfig.save();
    return newConfig;
  } catch (error) {
    console.error("Error creating new configuration version:", error);
    throw error;
  }
};

module.exports = mongoose.model("PointConfiguration", pointConfigurationSchema);
