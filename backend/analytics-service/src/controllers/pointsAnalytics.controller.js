const PointMetrics = require("../models/pointMetrics.model");

// Get points transaction metrics
exports.getPointsTransactions = async (req, res) => {
  try {
    const { period = "monthly", startDate, endDate, schoolId } = req.query;

    // Parse date parameters
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // Default to 90 days ago
    const end = endDate ? new Date(endDate) : new Date();

    // Build aggregation pipeline
    let groupBy = {};
    let dateFormat = {};

    if (period === "daily") {
      dateFormat = {
        year: { $year: "$date" },
        month: { $month: "$date" },
        day: { $dayOfMonth: "$date" },
      };
      groupBy = {
        _id: {
          year: "$year",
          month: "$month",
          day: "$day",
        },
        date: { $first: "$date" },
      };
    } else if (period === "weekly") {
      dateFormat = {
        year: { $year: "$date" },
        week: { $week: "$date" },
      };
      groupBy = {
        _id: {
          year: "$year",
          week: "$week",
        },
        date: { $first: "$date" },
      };
    } else {
      // monthly
      dateFormat = {
        year: { $year: "$date" },
        month: { $month: "$date" },
      };
      groupBy = {
        _id: {
          year: "$year",
          month: "$month",
        },
        date: { $first: "$date" },
      };
    }

    // Add metrics to group by
    groupBy.totalPointsEarned = { $sum: "$totalPointsEarned" };
    groupBy.totalPointsSpent = { $sum: "$totalPointsSpent" };
    groupBy.netPointsChange = { $sum: "$netPointsChange" };
    groupBy.pointsBySource = { $first: "$pointsBySource" };
    groupBy.pointsByTransactionType = { $first: "$pointsByTransactionType" };

    // Start building the pipeline
    const pipeline = [
      {
        $match: {
          date: { $gte: start, $lte: end },
        },
      },
      {
        $addFields: dateFormat,
      },
      {
        $group: groupBy,
      },
      {
        $sort: { date: 1 },
      },
    ];

    // If schoolId is provided, filter for that school
    if (schoolId) {
      pipeline[0].$match["schoolMetrics.schoolId"] = schoolId;

      // Modify the pipeline to use school-specific data
      pipeline.push({
        $addFields: {
          schoolMetric: {
            $filter: {
              input: "$schoolMetrics",
              as: "school",
              cond: { $eq: ["$$school.schoolId", schoolId] },
            },
          },
        },
      });

      pipeline.push({
        $addFields: {
          totalPointsEarned: {
            $arrayElemAt: ["$schoolMetric.totalPointsEarned", 0],
          },
          totalPointsSpent: {
            $arrayElemAt: ["$schoolMetric.totalPointsSpent", 0],
          },
          netPointsChange: {
            $arrayElemAt: ["$schoolMetric.netPointsChange", 0],
          },
        },
      });
    }

    // Execute the aggregation
    const results = await PointMetrics.aggregate(pipeline);

    // Format the results
    const formattedResults = results.map((item) => ({
      date: item.date,
      totalPointsEarned: item.totalPointsEarned || 0,
      totalPointsSpent: item.totalPointsSpent || 0,
      netPointsChange: item.netPointsChange || 0,
      pointsBySource: item.pointsBySource || {
        task: 0,
        attendance: 0,
        behavior: 0,
        badge: 0,
        manual_adjustment: 0,
      },
      pointsByTransactionType: item.pointsByTransactionType || {
        earned: 0,
        spent: 0,
        adjusted: 0,
      },
    }));

    res.status(200).json({
      success: true,
      data: {
        period,
        startDate: start,
        endDate: end,
        schoolId: schoolId || null,
        metrics: formattedResults,
      },
    });
  } catch (error) {
    console.error("Error getting points transaction metrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get points transaction metrics",
      error: error.message,
    });
  }
};

// Get points economy health
exports.getPointsEconomyHealth = async (req, res) => {
  try {
    const { startDate, endDate, schoolId } = req.query;

    // Parse date parameters
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    // Query for the latest point metrics within the date range
    const query = { date: { $gte: start, $lte: end } };

    // Get the earliest and latest metrics in range to calculate change
    const [earliestMetrics, latestMetrics] = await Promise.all([
      PointMetrics.findOne(query).sort({ date: 1 }).lean(),
      PointMetrics.findOne(query).sort({ date: -1 }).lean(),
    ]);

    if (!latestMetrics) {
      return res.status(200).json({
        success: true,
        data: {
          startDate: start,
          endDate: end,
          schoolId: schoolId || null,
          economyHealth: {
            pointsEarningRate: 0,
            pointsSpendingRate: 0,
            economyBalance: 0,
            pointsVelocity: 0,
            inflationRate: 0,
          },
          pointsDistribution: {
            bySource: {
              task: 0,
              attendance: 0,
              behavior: 0,
              badge: 0,
              manual_adjustment: 0,
            },
            byTransactionType: {
              earned: 0,
              spent: 0,
              adjusted: 0,
            },
          },
        },
      });
    }

    // Default values
    let pointsEarningRate = 0;
    let pointsSpendingRate = 0;
    let economyBalance = 0;
    let pointsVelocity = 0;
    let inflationRate = 0;
    let pointsBySource = latestMetrics.pointsBySource || {
      task: 0,
      attendance: 0,
      behavior: 0,
      badge: 0,
      manual_adjustment: 0,
    };
    let pointsByTransactionType = latestMetrics.pointsByTransactionType || {
      earned: 0,
      spent: 0,
      adjusted: 0,
    };

    // Calculate metrics if we have both earliest and latest data points
    if (earliestMetrics && latestMetrics) {
      const daysDiff = Math.max(
        1,
        (new Date(latestMetrics.date) - new Date(earliestMetrics.date)) /
          (1000 * 60 * 60 * 24)
      );

      // Calculate rates per day
      pointsEarningRate =
        (latestMetrics.totalPointsEarned - earliestMetrics.totalPointsEarned) /
        daysDiff;
      pointsSpendingRate =
        (latestMetrics.totalPointsSpent - earliestMetrics.totalPointsSpent) /
        daysDiff;
      pointsVelocity = pointsEarningRate - pointsSpendingRate;

      // Economy balance: ratio of spending to earning
      economyBalance =
        latestMetrics.totalPointsEarned > 0
          ? (latestMetrics.totalPointsSpent / latestMetrics.totalPointsEarned) *
            100
          : 0;

      // Inflation rate: change in average points per account
      const initialAvg = earliestMetrics.averagePointsPerAccount || 0;
      const currentAvg = latestMetrics.averagePointsPerAccount || 0;
      inflationRate =
        initialAvg > 0 ? ((currentAvg - initialAvg) / initialAvg) * 100 : 0;
    }

    // School-specific metrics if requested
    if (schoolId && latestMetrics.schoolMetrics) {
      const latestSchoolMetric = latestMetrics.schoolMetrics.find(
        (s) => s.schoolId.toString() === schoolId
      );

      const earliestSchoolMetric = earliestMetrics?.schoolMetrics?.find(
        (s) => s.schoolId.toString() === schoolId
      );

      if (latestSchoolMetric) {
        if (earliestSchoolMetric) {
          const daysDiff = Math.max(
            1,
            (new Date(latestMetrics.date) - new Date(earliestMetrics.date)) /
              (1000 * 60 * 60 * 24)
          );

          pointsEarningRate =
            (latestSchoolMetric.totalPointsEarned -
              earliestSchoolMetric.totalPointsEarned) /
            daysDiff;
          pointsSpendingRate =
            (latestSchoolMetric.totalPointsSpent -
              earliestSchoolMetric.totalPointsSpent) /
            daysDiff;
          pointsVelocity = pointsEarningRate - pointsSpendingRate;

          economyBalance =
            latestSchoolMetric.totalPointsEarned > 0
              ? (latestSchoolMetric.totalPointsSpent /
                  latestSchoolMetric.totalPointsEarned) *
                100
              : 0;

          const initialAvg = earliestSchoolMetric.averagePointsPerStudent || 0;
          const currentAvg = latestSchoolMetric.averagePointsPerStudent || 0;
          inflationRate =
            initialAvg > 0 ? ((currentAvg - initialAvg) / initialAvg) * 100 : 0;
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        startDate: start,
        endDate: end,
        schoolId: schoolId || null,
        economyHealth: {
          pointsEarningRate,
          pointsSpendingRate,
          economyBalance,
          pointsVelocity,
          inflationRate,
        },
        pointsDistribution: {
          bySource: pointsBySource,
          byTransactionType: pointsByTransactionType,
        },
      },
    });
  } catch (error) {
    console.error("Error getting points economy health:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get points economy health",
      error: error.message,
    });
  }
};

// Get level distribution
exports.getLevelDistribution = async (req, res) => {
  try {
    const { startDate, endDate, schoolId } = req.query;

    // Parse date parameters
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    // Query for the latest point metrics within the date range
    const query = { date: { $gte: start, $lte: end } };

    if (schoolId) {
      query["schoolMetrics.schoolId"] = schoolId;
    }

    const latestMetrics = await PointMetrics.findOne(query)
      .sort({ date: -1 })
      .lean();

    if (!latestMetrics || !latestMetrics.levelDistribution) {
      return res.status(200).json({
        success: true,
        data: {
          startDate: start,
          endDate: end,
          schoolId: schoolId || null,
          levelDistribution: {},
        },
      });
    }

    // For global metrics
    let levelDistribution =
      Object.fromEntries(latestMetrics.levelDistribution) || {};

    // For school-specific metrics (if available)
    if (schoolId && latestMetrics.schoolMetrics) {
      const schoolMetric = latestMetrics.schoolMetrics.find(
        (s) => s.schoolId.toString() === schoolId
      );

      if (schoolMetric && schoolMetric.levelDistribution) {
        levelDistribution = Object.fromEntries(schoolMetric.levelDistribution);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        startDate: start,
        endDate: end,
        schoolId: schoolId || null,
        levelDistribution,
      },
    });
  } catch (error) {
    console.error("Error getting level distribution:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get level distribution",
      error: error.message,
    });
  }
};
