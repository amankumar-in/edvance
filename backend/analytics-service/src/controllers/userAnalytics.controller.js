const UserMetrics = require("../models/userMetrics.model");

// Get user growth metrics
exports.getUserGrowth = async (req, res) => {
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
    groupBy.totalUsers = { $avg: "$totalUsers" };
    groupBy.newUsers = { $sum: "$newUsers" };
    groupBy.activeUsers = { $avg: "$activeUsers" };
    groupBy.usersByRole = { $first: "$usersByRole" };

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
          totalUsers: { $arrayElemAt: ["$schoolMetric.totalUsers", 0] },
          activeUsers: { $arrayElemAt: ["$schoolMetric.activeUsers", 0] },
          usersByRole: { $arrayElemAt: ["$schoolMetric.usersByRole", 0] },
        },
      });
    }

    // Execute the aggregation
    const results = await UserMetrics.aggregate(pipeline);

    // Format the results
    const formattedResults = results.map((item) => ({
      date: item.date,
      totalUsers: item.totalUsers || 0,
      newUsers: item.newUsers || 0,
      activeUsers: item.activeUsers || 0,
      usersByRole: item.usersByRole || {
        students: 0,
        parents: 0,
        teachers: 0,
        school_admin: 0,
        social_worker: 0,
        platform_admin: 0,
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
    console.error("Error getting user growth metrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user growth metrics",
      error: error.message,
    });
  }
};

// Get user engagement metrics
exports.getUserEngagement = async (req, res) => {
  try {
    const { period = "monthly", startDate, endDate, schoolId } = req.query;

    // Parse date parameters
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // Default to 90 days ago
    const end = endDate ? new Date(endDate) : new Date();

    // Get the latest user metrics
    const query = { date: { $gte: start, $lte: end } };

    // If schoolId is provided, only include metrics for that school
    if (schoolId) {
      query["schoolMetrics.schoolId"] = schoolId;
    }

    const latestMetrics = await UserMetrics.findOne().sort({ date: -1 }).lean();

    if (!latestMetrics) {
      return res.status(200).json({
        success: true,
        data: {
          period,
          startDate: start,
          endDate: end,
          schoolId: schoolId || null,
          metrics: {
            activeUsers: 0,
            activeUserRate: 0,
            userDistribution: {
              students: 0,
              parents: 0,
              teachers: 0,
              school_admin: 0,
              social_worker: 0,
              platform_admin: 0,
            },
          },
        },
      });
    }

    // Calculate active user rate
    const activeUserRate =
      latestMetrics.totalUsers > 0
        ? (latestMetrics.activeUsers / latestMetrics.totalUsers) * 100
        : 0;

    // Prepare the response data
    const userEngagement = {
      activeUsers: latestMetrics.activeUsers || 0,
      activeUserRate,
      userDistribution: latestMetrics.usersByRole || {
        students: 0,
        parents: 0,
        teachers: 0,
        school_admin: 0,
        social_worker: 0,
        platform_admin: 0,
      },
    };

    // If schoolId is provided, use school-specific metrics
    if (schoolId && latestMetrics.schoolMetrics) {
      const schoolMetric = latestMetrics.schoolMetrics.find(
        (s) => s.schoolId.toString() === schoolId
      );

      if (schoolMetric) {
        userEngagement.activeUsers = schoolMetric.activeUsers || 0;
        userEngagement.activeUserRate =
          schoolMetric.totalUsers > 0
            ? (schoolMetric.activeUsers / schoolMetric.totalUsers) * 100
            : 0;
        userEngagement.userDistribution = schoolMetric.usersByRole || {
          students: 0,
          parents: 0,
          teachers: 0,
          school_admin: 0,
        };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        period,
        startDate: start,
        endDate: end,
        schoolId: schoolId || null,
        metrics: userEngagement,
      },
    });
  } catch (error) {
    console.error("Error getting user engagement metrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user engagement metrics",
      error: error.message,
    });
  }
};

// Get school comparison metrics
exports.getSchoolComparison = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    // Parse date parameters
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    // Get the latest metrics
    const latestMetrics = await UserMetrics.findOne({ date: { $lte: end } })
      .sort({ date: -1 })
      .lean();

    if (!latestMetrics || !latestMetrics.schoolMetrics) {
      return res.status(200).json({
        success: true,
        data: {
          startDate: start,
          endDate: end,
          schools: [],
        },
      });
    }

    // Sort schools by total users
    const sortedSchools = [...latestMetrics.schoolMetrics]
      .sort((a, b) => b.totalUsers - a.totalUsers)
      .slice(0, limit);

    res.status(200).json({
      success: true,
      data: {
        startDate: start,
        endDate: end,
        schools: sortedSchools.map((school) => ({
          schoolId: school.schoolId,
          schoolName: school.schoolName,
          totalUsers: school.totalUsers,
          activeUsers: school.activeUsers,
          activeRate:
            school.totalUsers > 0
              ? (school.activeUsers / school.totalUsers) * 100
              : 0,
          userDistribution: school.usersByRole,
        })),
      },
    });
  } catch (error) {
    console.error("Error getting school comparison:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get school comparison",
      error: error.message,
    });
  }
};
