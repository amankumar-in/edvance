const BadgeMetrics = require("../models/badgeMetrics.model");

// Get badge award metrics
exports.getBadgeAwards = async (req, res) => {
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
    groupBy.totalBadgesAwarded = { $sum: "$totalBadgesAwarded" };
    groupBy.uniqueStudentsAwarded = { $sum: "$uniqueStudentsAwarded" };
    groupBy.badgesByConditionType = { $first: "$badgesByConditionType" };
    groupBy.badgesByIssuerType = { $first: "$badgesByIssuerType" };
    groupBy.totalPointsFromBadges = { $sum: "$totalPointsFromBadges" };

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
          totalBadgesAwarded: {
            $arrayElemAt: ["$schoolMetric.totalBadgesAwarded", 0],
          },
          uniqueStudentsAwarded: {
            $arrayElemAt: ["$schoolMetric.uniqueStudentsAwarded", 0],
          },
        },
      });
    }

    // Execute the aggregation
    const results = await BadgeMetrics.aggregate(pipeline);

    // Format the results
    const formattedResults = results.map((item) => ({
      date: item.date,
      totalBadgesAwarded: item.totalBadgesAwarded || 0,
      uniqueStudentsAwarded: item.uniqueStudentsAwarded || 0,
      badgesByConditionType: item.badgesByConditionType || {
        points_threshold: 0,
        task_completion: 0,
        attendance_streak: 0,
        custom: 0,
      },
      badgesByIssuerType: item.badgesByIssuerType || {
        system: 0,
        school: 0,
        parent: 0,
      },
      totalPointsFromBadges: item.totalPointsFromBadges || 0,
      awardsPerStudent:
        item.uniqueStudentsAwarded > 0
          ? item.totalBadgesAwarded / item.uniqueStudentsAwarded
          : 0,
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
    console.error("Error getting badge award metrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get badge award metrics",
      error: error.message,
    });
  }
};

// Get popular badges
exports.getPopularBadges = async (req, res) => {
  try {
    const { startDate, endDate, schoolId, limit = 10 } = req.query;

    // Parse date parameters
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    // Query for the latest badge metrics within the date range
    const query = { date: { $gte: start, $lte: end } };

    if (schoolId) {
      query["schoolMetrics.schoolId"] = schoolId;
    }

    const latestMetrics = await BadgeMetrics.findOne(query)
      .sort({ date: -1 })
      .lean();

    if (!latestMetrics || !latestMetrics.mostAwardedBadges) {
      return res.status(200).json({
        success: true,
        data: {
          startDate: start,
          endDate: end,
          schoolId: schoolId || null,
          popularBadges: [],
        },
      });
    }

    // Get and sort the most awarded badges
    let popularBadges = [...latestMetrics.mostAwardedBadges]
      .sort((a, b) => b.count - a.count)
      .slice(0, parseInt(limit));

    // For school-specific metrics (if available)
    if (schoolId && latestMetrics.schoolMetrics) {
      const schoolMetric = latestMetrics.schoolMetrics.find(
        (s) => s.schoolId.toString() === schoolId
      );

      if (schoolMetric && schoolMetric.mostAwardedBadges) {
        popularBadges = [...schoolMetric.mostAwardedBadges]
          .sort((a, b) => b.count - a.count)
          .slice(0, parseInt(limit));
      }
    }

    res.status(200).json({
      success: true,
      data: {
        startDate: start,
        endDate: end,
        schoolId: schoolId || null,
        popularBadges,
      },
    });
  } catch (error) {
    console.error("Error getting popular badges:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get popular badges",
      error: error.message,
    });
  }
};

// Get badge category distribution
exports.getBadgeCategoryDistribution = async (req, res) => {
  try {
    const { startDate, endDate, schoolId } = req.query;

    // Parse date parameters
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    // Query for the latest badge metrics within the date range
    const query = { date: { $gte: start, $lte: end } };

    if (schoolId) {
      query["schoolMetrics.schoolId"] = schoolId;
    }

    const latestMetrics = await BadgeMetrics.findOne(query)
      .sort({ date: -1 })
      .lean();

    if (!latestMetrics || !latestMetrics.badgesByCategory) {
      return res.status(200).json({
        success: true,
        data: {
          startDate: start,
          endDate: end,
          schoolId: schoolId || null,
          badgesByCategory: {},
          badgesByConditionType: {
            points_threshold: 0,
            task_completion: 0,
            attendance_streak: 0,
            custom: 0,
          },
          badgesByIssuerType: {
            system: 0,
            school: 0,
            parent: 0,
          },
        },
      });
    }

    // Process global or school-specific metrics
    let badgesByCategory = {};
    let badgesByConditionType = latestMetrics.badgesByConditionType || {
      points_threshold: 0,
      task_completion: 0,
      attendance_streak: 0,
      custom: 0,
    };
    let badgesByIssuerType = latestMetrics.badgesByIssuerType || {
      system: 0,
      school: 0,
      parent: 0,
    };

    // Convert Map to object if needed
    if (latestMetrics.badgesByCategory) {
      badgesByCategory = Object.fromEntries(latestMetrics.badgesByCategory);
    }

    // For school-specific metrics (if available)
    if (schoolId && latestMetrics.schoolMetrics) {
      const schoolMetric = latestMetrics.schoolMetrics.find(
        (s) => s.schoolId.toString() === schoolId
      );

      if (schoolMetric) {
        if (schoolMetric.badgesByCategory) {
          badgesByCategory = Object.fromEntries(schoolMetric.badgesByCategory);
        }

        if (schoolMetric.badgesByConditionType) {
          badgesByConditionType = schoolMetric.badgesByConditionType;
        }

        if (schoolMetric.badgesByIssuerType) {
          badgesByIssuerType = schoolMetric.badgesByIssuerType;
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        startDate: start,
        endDate: end,
        schoolId: schoolId || null,
        badgesByCategory,
        badgesByConditionType,
        badgesByIssuerType,
      },
    });
  } catch (error) {
    console.error("Error getting badge category distribution:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get badge category distribution",
      error: error.message,
    });
  }
};
