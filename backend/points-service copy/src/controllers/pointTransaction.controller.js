const PointAccount = require("../models/pointAccount.model");
const PointTransaction = require("../models/pointTransaction.model");
const SchoolPointPolicy = require("../models/schoolPointPolicy.model"); // Add this line
const PointLimit = require("../models/pointLimit.model"); // Add this line

const mongoose = require("mongoose");

// Create a transaction (award or deduct points)
exports.createTransaction = async (req, res) => {
  try {
    const {
      studentId,
      amount,
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
      !amount ||
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

    // Add this after the validation checks in createTransaction:

    // Only check limits for earning points, not spending
    if (type === "earned") {
      // Get applicable point limit
      const schoolId = metadata && metadata.schoolId ? metadata.schoolId : null;
      const pointLimit = await PointLimit.getApplicableLimit(
        studentId,
        schoolId
      );

      if (pointLimit) {
        // Check daily limit
        if (pointLimit.limits.daily.enabled) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Get points earned today
          const pointsEarnedToday = await PointTransaction.aggregate([
            {
              $match: {
                studentId,
                type: "earned",
                transactionDay: today,
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

          // Check if this transaction would exceed daily limit
          if (totalEarnedToday + amount > pointLimit.limits.daily.maxPoints) {
            // Cap the amount to the remaining daily limit
            const remainingLimit = Math.max(
              0,
              pointLimit.limits.daily.maxPoints - totalEarnedToday
            );

            if (remainingLimit <= 0) {
              return res.status(400).json({
                success: false,
                message: "Daily point limit reached",
                data: {
                  limit: pointLimit.limits.daily.maxPoints,
                  earned: totalEarnedToday,
                },
              });
            }

            // Update amount and add metadata
            amount = remainingLimit;
            metadata = {
              ...(metadata || {}),
              limitApplied: true,
              originalAmount: amount,
              limitType: "daily",
            };
          }
        }

        // Check weekly limit
        if (pointLimit.limits.weekly.enabled) {
          const startOfWeek = new Date();
          const dayOfWeek = startOfWeek.getDay(); // 0 = Sunday, 6 = Saturday
          startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek); // Go back to Sunday
          startOfWeek.setHours(0, 0, 0, 0);

          // Get points earned this week
          const pointsEarnedThisWeek = await PointTransaction.aggregate([
            {
              $match: {
                studentId,
                type: "earned",
                transactionWeek: startOfWeek,
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
          if (
            totalEarnedThisWeek + amount >
            pointLimit.limits.weekly.maxPoints
          ) {
            // Cap the amount to the remaining weekly limit
            const remainingLimit = Math.max(
              0,
              pointLimit.limits.weekly.maxPoints - totalEarnedThisWeek
            );

            if (remainingLimit <= 0) {
              return res.status(400).json({
                success: false,
                message: "Weekly point limit reached",
                data: {
                  limit: pointLimit.limits.weekly.maxPoints,
                  earned: totalEarnedThisWeek,
                },
              });
            }

            // Update amount and add metadata
            amount = remainingLimit;
            metadata = {
              ...(metadata || {}),
              limitApplied: true,
              originalAmount: amount,
              limitType: "weekly",
            };
          }
        }

        // Check source-specific limits
        if (source && pointLimit.sourceLimits[source]) {
          // Check daily source limit
          if (
            pointLimit.sourceLimits[source].daily &&
            pointLimit.sourceLimits[source].daily.enabled
          ) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Get points earned today from this source
            const sourcePointsToday = await PointTransaction.aggregate([
              {
                $match: {
                  studentId,
                  type: "earned",
                  source,
                  transactionDay: today,
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
            if (
              totalSourceToday + amount >
              pointLimit.sourceLimits[source].daily.maxPoints
            ) {
              // Cap the amount to the remaining source limit
              const remainingLimit = Math.max(
                0,
                pointLimit.sourceLimits[source].daily.maxPoints -
                  totalSourceToday
              );

              if (remainingLimit <= 0) {
                return res.status(400).json({
                  success: false,
                  message: `Daily ${source} point limit reached`,
                  data: {
                    limit: pointLimit.sourceLimits[source].daily.maxPoints,
                    earned: totalSourceToday,
                  },
                });
              }

              // Update amount and add metadata
              amount = remainingLimit;
              metadata = {
                ...(metadata || {}),
                limitApplied: true,
                originalAmount: amount,
                limitType: `${source}_daily`,
              };
            }
          }
        }
      }
    }
    // Add this after the "Validation" section in createTransaction:
    const SchoolPointPolicy = require("../models/schoolPointPolicy.model");

    // After validation of required fields, add:
    // Check for school-specific point policies if schoolId is provided
    let schoolPolicy = null;
    if (metadata && metadata.schoolId) {
      schoolPolicy = await SchoolPointPolicy.findOne({
        schoolId: metadata.schoolId,
      });
    }

    // Adjust point amount based on school policy if applicable
    if (schoolPolicy && type === "earned") {
      // For attendance points
      if (source === "attendance" && metadata.sourceType === "daily_check_in") {
        amount = schoolPolicy.policies.attendance.dailyCheckIn;

        // Check for streak bonus
        if (
          schoolPolicy.policies.attendance.streak.enabled &&
          metadata.streak &&
          metadata.streak % schoolPolicy.policies.attendance.streak.interval ===
            0
        ) {
          // Add streak bonus from school policy
          metadata.bonusPoints = schoolPolicy.policies.attendance.streak.bonus;
          amount += metadata.bonusPoints;
        }
      }

      // For task points - will be useful when task service is implemented
      if (source === "task" && metadata.category) {
        // Get task category specific points if available
        if (schoolPolicy.policies.task.categories.has(metadata.category)) {
          amount = schoolPolicy.policies.task.categories.get(metadata.category);
        } else {
          // Otherwise use base task points
          amount = schoolPolicy.policies.task.base;
        }
      }

      // Check daily limit if enabled
      if (schoolPolicy.policies.dailyLimit.enabled) {
        // Calculate points earned today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
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
        if (
          totalEarnedToday + amount >
          schoolPolicy.policies.dailyLimit.maxPoints
        ) {
          // Cap the points to the maximum allowed
          const adjustedAmount = Math.max(
            0,
            schoolPolicy.policies.dailyLimit.maxPoints - totalEarnedToday
          );

          if (adjustedAmount === 0) {
            return res.status(400).json({
              success: false,
              message: "Daily point limit reached",
            });
          }

          amount = adjustedAmount;

          // Update metadata to indicate capping
          metadata.capped = true;
          metadata.originalAmount = amount;
          metadata.reason = "Daily limit reached";
        }
      }
    }

    // Source verification
    const validSources = {
      task: ["task_completion", "task_bonus", "task_streak"],
      attendance: ["daily_check_in", "perfect_week", "streak_bonus"],
      behavior: ["class_participation", "helping_others", "good_conduct"],
      badge: ["achievement_badge", "milestone_badge", "special_badge"],
      redemption: ["reward_purchase", "reward_refund"],
      manual_adjustment: [
        "correction",
        "bonus",
        "penalty",
        "system_adjustment",
      ],
    };

    // If sourceType is provided, verify it's valid for the source
    if (metadata && metadata.sourceType) {
      const validTypes = validSources[source];
      if (!validTypes || !validTypes.includes(metadata.sourceType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid source type '${metadata.sourceType}' for source '${source}'`,
        });
      }
    }

    // Verify source and sourceId combination is consistent
    if (sourceId) {
      // For sources that should have an ID, verify format
      switch (source) {
        case "task":
          // Task IDs typically start with 'task_'
          if (!/^[0-9a-fA-F]{24}$/.test(sourceId)) {
            return res.status(400).json({
              success: false,
              message: "Invalid task ID format",
            });
          }
          break;
        case "badge":
          // Badge IDs typically are MongoDB ObjectIDs
          if (!/^[0-9a-fA-F]{24}$/.test(sourceId)) {
            return res.status(400).json({
              success: false,
              message: "Invalid badge ID format",
            });
          }
          break;
        // Add other source-specific validations as needed
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
      metadata: metadata || {},
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
