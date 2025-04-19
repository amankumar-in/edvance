const PointAccount = require("../models/pointAccount.model");
const PointTransaction = require("../models/pointTransaction.model");
const PointConfiguration = require("../models/pointConfiguration.model"); // Add this
const mongoose = require("mongoose");

// Replace the createTransaction function with this version:
exports.createTransaction = async (req, res) => {
  try {
    const {
      studentId,
      amount: requestedAmount, // Rename to requestedAmount
      type,
      source,
      sourceId,
      description,
      awardedBy,
      awardedByRole,
      metadata,
    } = req.body;

    // Validation
    if (
      !studentId ||
      requestedAmount === undefined || // Changed
      !type ||
      !source ||
      !description ||
      !awardedBy ||
      !awardedByRole
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Get active point configuration
    const config = await PointConfiguration.getActive();

    // Initialize the amount with the requested amount
    let amount = requestedAmount;
    let adjustedMetadata = { ...metadata };

    // For earned points, validate and adjust according to configuration
    if (type === "earned") {
      // Handle different sources according to configuration
      switch (source) {
        case "attendance":
          if (metadata?.sourceType === "daily_check_in") {
            // Use configured attendance points instead of requested amount
            amount = config.activityPoints.attendance.dailyCheckIn;

            // Apply streak bonus if applicable
            if (
              config.activityPoints.attendance.streak.enabled &&
              metadata.streak &&
              metadata.streak %
                config.activityPoints.attendance.streak.interval ===
                0
            ) {
              adjustedMetadata.bonusPoints =
                config.activityPoints.attendance.streak.bonus;
              amount += adjustedMetadata.bonusPoints;
            }
          } else if (metadata?.sourceType === "perfect_week") {
            // Use configured perfect week bonus
            amount = config.activityPoints.attendance.perfectWeek.bonus;
          }
          break;

        case "task":
          // Apply task category points from configuration
          if (
            metadata?.category &&
            config.activityPoints.tasks.categories.has(metadata.category)
          ) {
            // Base points for this task category
            let basePoints = config.activityPoints.tasks.categories.get(
              metadata.category
            );

            // Apply difficulty multiplier if provided
            if (
              metadata.difficulty &&
              config.activityPoints.tasks.difficultyMultipliers.has(
                metadata.difficulty
              )
            ) {
              const multiplier =
                config.activityPoints.tasks.difficultyMultipliers.get(
                  metadata.difficulty
                );
              amount = Math.round(basePoints * multiplier);
              adjustedMetadata.baseCategoryPoints = basePoints;
              adjustedMetadata.appliedMultiplier = multiplier;
            } else {
              amount = basePoints;
            }
          }
          break;

        case "badge":
          // Use badge points from configuration
          if (
            metadata?.badgeType &&
            config.activityPoints.badges.special.has(metadata.badgeType)
          ) {
            amount = config.activityPoints.badges.special.get(
              metadata.badgeType
            );
          } else {
            amount = config.activityPoints.badges.default;
          }
          break;

        case "behavior":
          // Apply behavior points
          amount = metadata?.isPositive
            ? config.activityPoints.behavior.positive
            : config.activityPoints.behavior.negative;
          break;
      }

      // Apply daily limits from configuration
      if (config.limits.daily.enabled) {
        // Get points earned today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const pointsEarnedToday = await PointTransaction.aggregate([
          {
            $match: {
              studentId,
              type: "earned",
              createdAt: { $gte: today, $lte: endOfDay },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ]);

        const totalEarnedToday =
          pointsEarnedToday.length > 0 ? pointsEarnedToday[0].total : 0;

        // Check if adding these points would exceed daily limit
        if (totalEarnedToday + amount > config.limits.daily.maxPoints) {
          // Cap the points to the maximum allowed
          const adjustedAmount = Math.max(
            0,
            config.limits.daily.maxPoints - totalEarnedToday
          );

          if (adjustedAmount === 0) {
            return res.status(400).json({
              success: false,
              message: "Daily point limit reached",
              data: {
                limit: config.limits.daily.maxPoints,
                earned: totalEarnedToday,
              },
            });
          }

          adjustedMetadata.limitApplied = true;
          adjustedMetadata.originalAmount = amount;
          adjustedMetadata.adjustedAmount = adjustedAmount;
          adjustedMetadata.limitType = "daily";
          amount = adjustedAmount;
        }

        // Also check source-specific limits if applicable
        if (config.limits.sources[source]?.daily?.enabled) {
          const sourceLimit = config.limits.sources[source].daily.maxPoints;

          // Get points earned today from this source
          const sourcePointsToday = await PointTransaction.aggregate([
            {
              $match: {
                studentId,
                type: "earned",
                source,
                createdAt: { $gte: today, $lte: endOfDay },
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" },
              },
            },
          ]);

          const totalSourceToday =
            sourcePointsToday.length > 0 ? sourcePointsToday[0].total : 0;

          // Check if this transaction would exceed source daily limit
          if (totalSourceToday + amount > sourceLimit) {
            // Cap the amount to the remaining source limit
            const adjustedAmount = Math.max(0, sourceLimit - totalSourceToday);

            if (adjustedAmount === 0) {
              return res.status(400).json({
                success: false,
                message: `Daily ${source} point limit reached`,
                data: {
                  limit: sourceLimit,
                  earned: totalSourceToday,
                },
              });
            }

            adjustedMetadata.limitApplied = true;
            adjustedMetadata.originalAmount = amount;
            adjustedMetadata.adjustedAmount = adjustedAmount;
            adjustedMetadata.limitType = `${source}_daily`;
            amount = adjustedAmount;
          }
        }
      }

      // Check weekly limits
      if (config.limits.weekly.enabled) {
        const startOfWeek = new Date();
        const dayOfWeek = startOfWeek.getDay(); // 0 = Sunday, 6 = Saturday
        startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek); // Go back to Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const pointsEarnedThisWeek = await PointTransaction.aggregate([
          {
            $match: {
              studentId,
              type: "earned",
              createdAt: { $gte: startOfWeek, $lte: endOfWeek },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ]);

        const totalEarnedThisWeek =
          pointsEarnedThisWeek.length > 0 ? pointsEarnedThisWeek[0].total : 0;

        // Check if this transaction would exceed weekly limit
        if (totalEarnedThisWeek + amount > config.limits.weekly.maxPoints) {
          // Cap the amount to the remaining weekly limit
          const adjustedAmount = Math.max(
            0,
            config.limits.weekly.maxPoints - totalEarnedThisWeek
          );

          if (adjustedAmount === 0) {
            return res.status(400).json({
              success: false,
              message: "Weekly point limit reached",
              data: {
                limit: config.limits.weekly.maxPoints,
                earned: totalEarnedThisWeek,
              },
            });
          }

          adjustedMetadata.limitApplied = true;
          adjustedMetadata.originalAmount = amount;
          adjustedMetadata.adjustedAmount = adjustedAmount;
          adjustedMetadata.limitType = "weekly";
          amount = adjustedAmount;
        }
      }
    }

    // Find the point account
    let account = await PointAccount.findOne({ studentId });

    // If account doesn't exist, create it (only for earned points)
    if (!account && type === "earned") {
      account = await PointAccount.createAccount(studentId);
    } else if (!account) {
      return res.status(404).json({
        success: false,
        message: "Point account not found",
      });
    }

    // Process the transaction based on type
    let success = true;
    let errorMessage = null;

    switch (type) {
      case "earned":
        account.addPoints(Math.abs(amount));
        break;
      case "spent":
        // Make sure we can't spend more than available
        success = account.spendPoints(Math.abs(amount));
        if (!success) {
          errorMessage = "Insufficient points for this transaction";
        }
        break;
      case "adjusted":
        // For manual adjustments (admin only)
        if (amount > 0) {
          account.addPoints(amount);
        } else if (amount < 0) {
          // For negative adjustments, make sure we don't go below 0
          success = account.spendPoints(Math.abs(amount));
          if (!success) {
            errorMessage = "Insufficient points for this adjustment";
          }
        }
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid transaction type",
        });
    }

    // If transaction failed (e.g., insufficient points)
    if (!success) {
      return res.status(400).json({
        success: false,
        message: errorMessage || "Transaction failed",
      });
    }

    // Check level progression against the configuration
    account.levelProgression = config.levelProgression;
    account.updateLevel();

    // Save the account changes
    await account.save();

    // Create a transaction record
    const transaction = new PointTransaction({
      accountId: account._id,
      studentId,
      amount: type === "spent" ? -Math.abs(amount) : amount,
      type,
      source,
      sourceId: sourceId || undefined,
      description,
      awardedBy,
      awardedByRole,
      balanceAfter: account.currentBalance,
      metadata: adjustedMetadata || {},
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: {
        transaction,
        accountBalance: account.currentBalance,
        accountLevel: account.level,
      },
    });
  } catch (error) {
    console.error("Create transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create transaction",
      error: error.message,
    });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await PointTransaction.findById(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Get transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get transaction",
      error: error.message,
    });
  }
};

// Get transactions by source (e.g., task, attendance)
exports.getTransactionsBySource = async (req, res) => {
  try {
    const { source, sourceId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get transactions
    const transactions = await PointTransaction.find({ source, sourceId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await PointTransaction.countDocuments({ source, sourceId });

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get transactions by source error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get transactions",
      error: error.message,
    });
  }
};

// Get student transactions (with filters)
exports.getStudentTransactions = async (req, res) => {
  try {
    const { studentId } = req.params;
    const {
      page = 1,
      limit = 20,
      type,
      source,
      startDate,
      endDate,
    } = req.query;

    // Build query
    const query = { studentId };

    if (type) query.type = type;
    if (source) query.source = source;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get transactions
    const transactions = await PointTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await PointTransaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get student transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get student transactions",
      error: error.message,
    });
  }
};

// Get student transaction summary
exports.getStudentTransactionSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    // Build date range filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Aggregate summary by source
    const summary = await PointTransaction.aggregate([
      {
        $match: {
          studentId,
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: {
            type: "$type",
            source: "$source",
          },
          totalPoints: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.type",
          sources: {
            $push: {
              source: "$_id.source",
              totalPoints: "$totalPoints",
              count: "$count",
            },
          },
          totalPoints: { $sum: "$totalPoints" },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          sources: 1,
          totalPoints: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Get student transaction summary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get transaction summary",
      error: error.message,
    });
  }
};
// Get transaction history for a student

// Reverse a transaction
exports.reverseTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Reason for reversal is required",
      });
    }

    // Find the original transaction
    const originalTransaction = await PointTransaction.findById(transactionId);
    if (!originalTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Check if already reversed
    const existingReversal = await PointTransaction.findOne({
      "metadata.reversedTransactionId": transactionId,
    });

    if (existingReversal) {
      return res.status(400).json({
        success: false,
        message: "Transaction has already been reversed",
      });
    }

    // Find the account
    const account = await PointAccount.findOne({
      studentId: originalTransaction.studentId,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Point account not found",
      });
    }

    // Calculate the reversal amount
    const reversalAmount = -originalTransaction.amount;

    // Update the account balance
    if (originalTransaction.type === "earned") {
      // If original was earning points, remove them
      if (account.currentBalance < Math.abs(reversalAmount)) {
        return res.status(400).json({
          success: false,
          message:
            "Insufficient points for reversal, balance would go negative",
        });
      }
      account.currentBalance += reversalAmount;
      account.totalEarned += reversalAmount; // Adjust the totalEarned downward
    } else if (originalTransaction.type === "spent") {
      // If original was spending points, add them back
      account.currentBalance -= reversalAmount;
      account.totalSpent -= Math.abs(reversalAmount); // Adjust the totalSpent downward
    }

    account.lastUpdated = Date.now();
    await account.save();

    // Create a reversal transaction
    const reversalTransaction = new PointTransaction({
      accountId: account._id,
      studentId: originalTransaction.studentId,
      amount: reversalAmount,
      type: originalTransaction.type === "earned" ? "adjusted" : "adjusted",
      source: "manual_adjustment",
      sourceId: originalTransaction.sourceId,
      description: `Reversal: ${reason}`,
      awardedBy: req.user.id,
      awardedByRole: req.user.roles[0],
      balanceAfter: account.currentBalance,
      metadata: {
        reversalReason: reason,
        reversedTransactionId: originalTransaction._id,
        originalType: originalTransaction.type,
        originalSource: originalTransaction.source,
        originalAmount: originalTransaction.amount,
      },
    });

    await reversalTransaction.save();

    // Add reference to reversal in original transaction
    originalTransaction.metadata = {
      ...originalTransaction.metadata,
      reversed: true,
      reversedBy: req.user.id,
      reversalDate: new Date(),
      reversalTransactionId: reversalTransaction._id,
      reversalReason: reason,
    };

    await originalTransaction.save();

    res.status(200).json({
      success: true,
      message: "Transaction reversed successfully",
      data: {
        originalTransaction,
        reversalTransaction,
        accountBalance: account.currentBalance,
      },
    });
  } catch (error) {
    console.error("Reverse transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reverse transaction",
      error: error.message,
    });
  }
};

// For dashboard chart visualization
exports.getPointsTimeSeriesData = async (req, res) => {
  try {
    const { studentId, timeFrame, startDate, endDate, groupBy } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // Default values
    const now = new Date();
    let start = new Date(startDate || now.setDate(now.getDate() - 30)); // Default 30 days ago
    let end = new Date(endDate || Date.now());
    let interval = groupBy || "day"; // Default group by day

    // Handle preset timeframes
    if (timeFrame === "week") {
      start = new Date();
      start.setDate(start.getDate() - 7);
      interval = "day";
    } else if (timeFrame === "month") {
      start = new Date();
      start.setMonth(start.getMonth() - 1);
      interval = "day";
    } else if (timeFrame === "year") {
      start = new Date();
      start.setFullYear(start.getFullYear() - 1);
      interval = "month";
    }

    // Create match stage for the query
    const matchStage = {
      studentId,
      createdAt: { $gte: start, $lte: end },
    };

    // Create group stage based on interval
    let groupStage = {};
    if (interval === "day") {
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
      };
    } else if (interval === "week") {
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        },
      };
    } else if (interval === "month") {
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
      };
    }

    // Add sum fields to group stage
    groupStage.earned = {
      $sum: { $cond: [{ $eq: ["$type", "earned"] }, "$amount", 0] },
    };
    groupStage.spent = {
      $sum: { $cond: [{ $eq: ["$type", "spent"] }, "$amount", 0] },
    };
    groupStage.adjusted = {
      $sum: { $cond: [{ $eq: ["$type", "adjusted"] }, "$amount", 0] },
    };
    groupStage.total = { $sum: "$amount" };
    groupStage.count = { $sum: 1 };

    // Execute aggregation
    const timeSeries = await PointTransaction.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } },
    ]);

    // Transform to friendly format for charts
    const formattedData = timeSeries.map((entry) => {
      let dateLabel = "";
      let timestamp = 0;

      if (interval === "day") {
        const date = new Date(
          entry._id.year,
          entry._id.month - 1,
          entry._id.day
        );
        dateLabel = date.toISOString().split("T")[0];
        timestamp = date.getTime();
      } else if (interval === "week") {
        // Create a date for the first day of the week
        const date = new Date(entry._id.year, 0, 1);
        date.setDate(date.getDate() + (entry._id.week - 1) * 7);
        dateLabel = `Week ${entry._id.week}, ${entry._id.year}`;
        timestamp = date.getTime();
      } else if (interval === "month") {
        const date = new Date(entry._id.year, entry._id.month - 1, 1);
        dateLabel = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        timestamp = date.getTime();
      }

      return {
        date: dateLabel,
        timestamp,
        earned: entry.earned,
        spent: Math.abs(entry.spent), // Convert to positive for charts
        adjusted: entry.adjusted,
        net: entry.total,
        transactions: entry.count,
      };
    });

    // Sort by timestamp
    formattedData.sort((a, b) => a.timestamp - b.timestamp);

    res.status(200).json({
      success: true,
      data: {
        timeSeries: formattedData,
        timeFrame,
        interval,
        startDate: start,
        endDate: end,
      },
    });
  } catch (error) {
    console.error("Get time series data error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get time series data",
      error: error.message,
    });
  }
};
// Point analysis by category
exports.getCategoryAnalysis = async (req, res) => {
  try {
    const { studentId, timeFrame } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // Determine date range
    let startDate = null;
    const now = new Date();

    if (timeFrame === "week") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeFrame === "month") {
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (timeFrame === "year") {
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else if (timeFrame === "all") {
      startDate = new Date(0); // Beginning of time
    } else {
      // Default to last 30 days
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
    }

    // Match stage
    const matchStage = {
      studentId,
      type: "earned",
    };

    if (startDate) {
      matchStage.createdAt = { $gte: startDate };
    }

    // Source category analysis
    const sourceAnalysis = await PointTransaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$source",
          totalPoints: { $sum: "$amount" },
          count: { $sum: 1 },
          firstDate: { $min: "$createdAt" },
          lastDate: { $max: "$createdAt" },
        },
      },
      { $sort: { totalPoints: -1 } },
    ]);

    // Format the results
    const categories = sourceAnalysis.map((category) => ({
      category: category._id,
      totalPoints: category.totalPoints,
      transactionCount: category.count,
      firstEarned: category.firstDate,
      lastEarned: category.lastDate,
      averagePerTransaction:
        Math.round((category.totalPoints / category.count) * 10) / 10,
    }));

    // Calculate totals
    const totalPoints = categories.reduce(
      (sum, cat) => sum + cat.totalPoints,
      0
    );
    const totalTransactions = categories.reduce(
      (sum, cat) => sum + cat.transactionCount,
      0
    );

    // Add percentage to each category
    categories.forEach((category) => {
      category.percentage =
        Math.round((category.totalPoints / totalPoints) * 1000) / 10;
    });

    // Task sub-category analysis
    const taskAnalysis = await PointTransaction.aggregate([
      {
        $match: {
          ...matchStage,
          source: "task",
          "metadata.category": { $exists: true },
        },
      },
      {
        $group: {
          _id: "$metadata.category",
          totalPoints: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalPoints: -1 } },
    ]);

    // Format task categories
    const taskCategories = taskAnalysis.map((category) => ({
      category: category._id,
      totalPoints: category.totalPoints,
      transactionCount: category.count,
      averagePerTask:
        Math.round((category.totalPoints / category.count) * 10) / 10,
    }));

    res.status(200).json({
      success: true,
      data: {
        timeFrame,
        startDate,
        endDate: new Date(),
        summary: {
          totalPoints,
          totalTransactions,
          averagePerTransaction:
            Math.round((totalPoints / totalTransactions) * 10) / 10,
        },
        categories,
        taskCategories,
      },
    });
  } catch (error) {
    console.error("Get category analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get category analysis",
      error: error.message,
    });
  }
};
