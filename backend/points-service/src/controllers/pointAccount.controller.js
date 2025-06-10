const PointAccount = require("../models/pointAccount.model");
const PointTransaction = require("../models/pointTransaction.model");
const axios = require("axios");

// Create a new point account
exports.createAccount = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // Check if account already exists
    const existingAccount = await PointAccount.findOne({ studentId });
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: "Point account already exists for this student",
      });
    }

    // Create new account
    const account = await PointAccount.createAccount(studentId);

    // Update student record with pointsAccountId
    try {
      const userServiceUrl =
        process.env.NODE_ENV === "production"
          ? process.env.PRODUCTION_USER_SERVICE_URL
          : process.env.USER_SERVICE_URL;

      // Make an actual API call to update the student record
      await axios.patch(
        `${userServiceUrl}/api/students/${studentId}/points-account`,
        {
          pointsAccountId: account._id.toString(),
        },
        {
          headers: {
            Authorization: req.headers.authorization, // Forward the auth token
          },
        }
      );

      console.log(
        `Updated student ${studentId} with pointsAccountId ${account._id}`
      );
    } catch (error) {
      console.error("Failed to update student record:", error);
      // Continue even if update fails, we'll handle this asynchronously
    }

    res.status(201).json({
      success: true,
      message: "Point account created successfully",
      data: account,
    });
  } catch (error) {
    console.error("Create account error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create point account",
      error: error.message,
    });
  }
};

// Get account by student ID
exports.getAccountByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    const account = await PointAccount.findOne({ studentId });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Point account not found",
      });
    }

    // Calculate points needed for next level
    const pointsToNextLevel = account.pointsToNextLevel();
    const progressPercentage =
      account.level < 10
        ? ((account.totalEarned -
            (account.levelProgression.get(account.level.toString()) || 0)) /
            (account.levelProgression.get((account.level + 1).toString()) -
              (account.levelProgression.get(account.level.toString()) || 0))) *
          100
        : 100;

    // Calculate date ranges for statistics
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Aggregate weekly statistics
    const weeklyStats = await PointTransaction.aggregate([
      {
        $match: {
          studentId,
          createdAt: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Aggregate monthly statistics
    const monthlyStats = await PointTransaction.aggregate([
      {
        $match: {
          studentId,
          createdAt: { $gte: monthAgo }
        }
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Aggregate statistics by source
    const sourceStats = await PointTransaction.aggregate([
      {
        $match: {
          studentId,
          type: "earned"
        }
      },
      {
        $group: {
          _id: "$source",
          amount: { $sum: "$amount" },
          transactions: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "pointtransactions",
          pipeline: [
            { $match: { studentId, type: "earned" } },
            { $group: { _id: null, totalEarned: { $sum: "$amount" } } }
          ],
          as: "totalInfo"
        }
      },
      {
        $addFields: {
          percentage: {
            $multiply: [
              {
                $divide: [
                  "$amount",
                  { $ifNull: [{ $first: "$totalInfo.totalEarned" }, 1] }
                ]
              },
              100
            ]
          }
        }
      },
      {
        $project: {
          _id: 0,
          source: "$_id",
          amount: 1,
          transactions: 1,
          percentage: { $round: ["$percentage", 0] }
        }
      },
      {
        $match: {
          amount: { $gt: 0 }
        }
      }
    ]);

    // Process weekly statistics
    const weeklyProcessed = {
      earned: 0,
      spent: 0,
      net: 0,
      transactions: 0
    };

    weeklyStats.forEach(stat => {
      if (stat._id === 'earned') {
        weeklyProcessed.earned = stat.total;
        weeklyProcessed.transactions += stat.count;
      } else if (stat._id === 'spent') {
        weeklyProcessed.spent = Math.abs(stat.total);
        weeklyProcessed.transactions += stat.count;
      }
    });
    weeklyProcessed.net = weeklyProcessed.earned - weeklyProcessed.spent;

    // Process monthly statistics
    const monthlyProcessed = {
      earned: 0,
      spent: 0,
      net: 0,
      transactions: 0
    };

    monthlyStats.forEach(stat => {
      if (stat._id === 'earned') {
        monthlyProcessed.earned = stat.total;
        monthlyProcessed.transactions += stat.count;
      } else if (stat._id === 'spent') {
        monthlyProcessed.spent = Math.abs(stat.total);
        monthlyProcessed.transactions += stat.count;
      }
    });
    monthlyProcessed.net = monthlyProcessed.earned - monthlyProcessed.spent;

    res.status(200).json({
      success: true,
      data: {
        ...account.toObject(),
        pointsToNextLevel,
        progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
        statistics: {
          weekly: weeklyProcessed,
          monthly: monthlyProcessed,
          bySource: sourceStats
        }
      },
    });
  } catch (error) {
    console.error("Get account error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get point account",
      error: error.message,
    });
  }
};

// Get account balance
exports.getBalance = async (req, res) => {
  try {
    const { studentId } = req.params;

    const account = await PointAccount.findOne({ studentId });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Point account not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        currentBalance: account.currentBalance,
        totalEarned: account.totalEarned,
        totalSpent: account.totalSpent,
        level: account.level,
      },
    });
  } catch (error) {
    console.error("Get balance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get balance",
      error: error.message,
    });
  }
};

// Get account level and progress
exports.getLevelInfo = async (req, res) => {
  try {
    const { studentId } = req.params;

    const account = await PointAccount.findOne({ studentId });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Point account not found",
      });
    }

    // Calculate points needed for next level
    const pointsToNextLevel = account.pointsToNextLevel();

    // Calculate progress percentage to next level
    let progressPercentage = 0;
    if (account.level < 10) {
      const currentLevelThreshold =
        account.levelProgression.get(account.level.toString()) || 0;
      const nextLevelThreshold = account.levelProgression.get(
        (account.level + 1).toString()
      );

      progressPercentage =
        ((account.totalEarned - currentLevelThreshold) /
          (nextLevelThreshold - currentLevelThreshold)) *
        100;
    } else {
      progressPercentage = 100; // Max level reached
    }

    res.status(200).json({
      success: true,
      data: {
        level: account.level,
        totalEarned: account.totalEarned,
        currentBalance: account.currentBalance,
        pointsToNextLevel,
        progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
        isMaxLevel: account.level >= 10,
      },
    });
  } catch (error) {
    console.error("Get level info error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get level information",
      error: error.message,
    });
  }
};

// Get account transaction history
exports.getTransactionHistory = async (req, res) => {
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

    // Find account
    const account = await PointAccount.findOne({ studentId });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Point account not found",
      });
    }

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
    console.error("Get transaction history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get transaction history",
      error: error.message,
    });
  }
};
