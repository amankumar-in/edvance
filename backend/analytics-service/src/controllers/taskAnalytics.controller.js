const TaskMetrics = require("../models/taskMetrics.model");

// Get task creation and completion metrics
exports.getTaskMetrics = async (req, res) => {
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
    groupBy.totalTasks = { $avg: "$totalTasks" };
    groupBy.newTasks = { $sum: "$newTasks" };
    groupBy.completedTasks = { $sum: "$completedTasks" };
    groupBy.pendingTasks = { $avg: "$pendingTasks" };
    groupBy.completionRate = { $avg: "$completionRate" };

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
          totalTasks: { $arrayElemAt: ["$schoolMetric.totalTasks", 0] },
          completedTasks: { $arrayElemAt: ["$schoolMetric.completedTasks", 0] },
          completionRate: { $arrayElemAt: ["$schoolMetric.completionRate", 0] },
        },
      });
    }

    // Execute the aggregation
    const results = await TaskMetrics.aggregate(pipeline);

    // Format the results
    const formattedResults = results.map((item) => ({
      date: item.date,
      totalTasks: item.totalTasks || 0,
      newTasks: item.newTasks || 0,
      completedTasks: item.completedTasks || 0,
      pendingTasks: item.pendingTasks || 0,
      completionRate: item.completionRate || 0,
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
    console.error("Error getting task metrics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get task metrics",
      error: error.message,
    });
  }
};

// Get task category distribution
exports.getTaskCategoryDistribution = async (req, res) => {
  try {
    const { startDate, endDate, schoolId } = req.query;

    // Parse date parameters
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    // Query for the latest task metrics within the date range
    const query = { date: { $gte: start, $lte: end } };

    if (schoolId) {
      query["schoolMetrics.schoolId"] = schoolId;
    }

    const latestMetrics = await TaskMetrics.findOne(query)
      .sort({ date: -1 })
      .lean();

    if (!latestMetrics) {
      return res.status(200).json({
        success: true,
        data: {
          startDate: start,
          endDate: end,
          schoolId: schoolId || null,
          categoryDistribution: {},
          difficultyDistribution: {
            easy: 0,
            medium: 0,
            hard: 0,
            challenging: 0,
          },
        },
      });
    }

    // Prepare the response
    let categoryDistribution = {};
    let difficultyDistribution = {
      easy: 0,
      medium: 0,
      hard: 0,
      challenging: 0,
    };

    // For global metrics
    if (!schoolId) {
      // Convert Map to regular object for category distribution
      categoryDistribution = latestMetrics.tasksByCategory
        ? Object.fromEntries(latestMetrics.tasksByCategory)
        : {};

      difficultyDistribution = latestMetrics.tasksByDifficulty || {
        easy: 0,
        medium: 0,
        hard: 0,
        challenging: 0,
      };
    } else if (latestMetrics.schoolMetrics) {
      // For school-specific metrics (if available)
      const schoolMetric = latestMetrics.schoolMetrics.find(
        (s) => s.schoolId.toString() === schoolId
      );

      if (schoolMetric && schoolMetric.tasksByCategory) {
        categoryDistribution = Object.fromEntries(schoolMetric.tasksByCategory);
      }

      if (schoolMetric && schoolMetric.tasksByDifficulty) {
        difficultyDistribution = schoolMetric.tasksByDifficulty;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        startDate: start,
        endDate: end,
        schoolId: schoolId || null,
        categoryDistribution,
        difficultyDistribution,
      },
    });
  } catch (error) {
    console.error("Error getting task category distribution:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get task category distribution",
      error: error.message,
    });
  }
};

// Get task performance by school
exports.getTaskPerformanceBySchool = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      sortBy = "completionRate",
      limit = 10,
    } = req.query;

    // Parse date parameters
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    // Get the latest metrics
    const latestMetrics = await TaskMetrics.findOne({ date: { $lte: end } })
      .sort({ date: -1 })
      .lean();

    if (!latestMetrics || !latestMetrics.schoolMetrics) {
      return res.status(200).json({
        success: true,
        data: {
          startDate: start,
          endDate: end,
          sortBy,
          schools: [],
        },
      });
    }

    // Apply sorting based on the requested field
    const sortSchoolsBy = (a, b) => {
      if (sortBy === "totalTasks") {
        return b.totalTasks - a.totalTasks;
      } else if (sortBy === "completedTasks") {
        return b.completedTasks - a.completedTasks;
      } else {
        // Default to completion rate
        return b.completionRate - a.completionRate;
      }
    };

    // Sort schools by the selected criteria
    const sortedSchools = [...latestMetrics.schoolMetrics]
      .sort(sortSchoolsBy)
      .slice(0, limit);

    res.status(200).json({
      success: true,
      data: {
        startDate: start,
        endDate: end,
        sortBy,
        schools: sortedSchools.map((school) => ({
          schoolId: school.schoolId,
          schoolName: school.schoolName,
          totalTasks: school.totalTasks || 0,
          completedTasks: school.completedTasks || 0,
          completionRate: school.completionRate || 0,
        })),
      },
    });
  } catch (error) {
    console.error("Error getting task performance by school:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get task performance by school",
      error: error.message,
    });
  }
};
