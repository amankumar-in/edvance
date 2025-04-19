const mongoose = require("mongoose");

const pointAccountSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  currentBalance: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalEarned: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: 0,
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // This stores the thresholds for progression to the next level
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
  levelName: {
    type: String,
  },
});

// Method to add points and update level
pointAccountSchema.methods.addPoints = function (amount) {
  if (amount <= 0) return this;

  this.currentBalance += amount;
  this.totalEarned += amount;
  this.lastUpdated = Date.now();

  // Check level progression
  this.updateLevel();

  return this;
};

// Method to spend points
pointAccountSchema.methods.spendPoints = function (amount) {
  if (amount <= 0) return false;
  if (amount > this.currentBalance) return false;

  this.currentBalance -= amount;
  this.totalSpent += amount;
  this.lastUpdated = Date.now();

  return true;
};

// Update the level method to handle more levels
pointAccountSchema.methods.updateLevel = function () {
  let newLevel = 1;

  try {
    // Get the levels from configuration
    const thresholds = Object.fromEntries(this.levelProgression);
    const maxConfigLevel = Math.max(
      ...Object.keys(thresholds).map((level) => parseInt(level))
    );

    // Find highest level that the student qualifies for
    for (let level = 2; level <= maxConfigLevel; level++) {
      const threshold = thresholds[level];
      if (threshold && this.totalEarned >= threshold) {
        newLevel = level;
      } else {
        break;
      }
    }

    // If level has changed, update it
    if (newLevel !== this.level) {
      this.level = newLevel;

      // Try to get level name from configuration
      try {
        const PointConfiguration = mongoose.model("PointConfiguration");
        PointConfiguration.getActive()
          .then((config) => {
            if (config.levelNames.has(newLevel.toString())) {
              this.levelName = config.levelNames.get(newLevel.toString());
              this.save();
            }
          })
          .catch((err) => {
            console.error("Error getting level name:", err);
          });
      } catch (error) {
        console.error("Error updating level name:", error);
      }
    }
  } catch (error) {
    console.error("Error updating level:", error);
  }

  return this.level;
};

// Method to calculate points needed for next level
pointAccountSchema.methods.pointsToNextLevel = function () {
  const nextLevel = this.level + 1;

  // If already at max level, return 0
  if (nextLevel > 10) return 0;

  const nextThreshold = this.levelProgression.get(nextLevel.toString());
  return Math.max(0, nextThreshold - this.totalEarned);
};

// Static method to create a new account
pointAccountSchema.statics.createAccount = async function (studentId) {
  try {
    const account = new this({
      studentId,
      currentBalance: 0,
      totalEarned: 0,
      totalSpent: 0,
      level: 1,
    });

    await account.save();
    return account;
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model("PointAccount", pointAccountSchema);
