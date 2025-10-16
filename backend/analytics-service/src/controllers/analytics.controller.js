const UserMetrics = require("../models/userMetrics.model");
const TaskMetrics = require("../models/taskMetrics.model");
const PointMetrics = require("../models/pointMetrics.model");
const BadgeMetrics = require("../models/badgeMetrics.model");
const AnalyticsJob = require("../models/analyticsJob.model");
const { default: mongoose } = require("mongoose");

// Get a dashboard overview of all metrics
exports.getDashboardOverview = async (req, res) => {
  try {
    // Get the latest metrics for each category
    const [
      latestUserMetrics,
      latestTaskMetrics,
      latestPointMetrics,
      latestBadgeMetrics,
    ] = await Promise.all([
      UserMetrics.findOne().sort({ date: -1 }),
      TaskMetrics.findOne().sort({ date: -1 }),
      PointMetrics.findOne().sort({ date: -1 }),
      BadgeMetrics.findOne().sort({ date: -1 }),
    ]);

    // Get metrics from 7 days ago for comparison
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [
      weekAgoUserMetrics,
      weekAgoTaskMetrics,
      weekAgoPointMetrics,
      weekAgoBadgeMetrics,
    ] = await Promise.all([
      UserMetrics.findOne({ date: { $lte: oneWeekAgo } }).sort({ date: -1 }),
      TaskMetrics.findOne({ date: { $lte: oneWeekAgo } }).sort({ date: -1 }),
      PointMetrics.findOne({ date: { $lte: oneWeekAgo } }).sort({ date: -1 }),
      BadgeMetrics.findOne({ date: { $lte: oneWeekAgo } }).sort({ date: -1 }),
    ]);

    // Get recent analytics jobs
    const recentJobs = await AnalyticsJob.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Generate comparison metrics
    const getChangePercentage = (current, previous) => {
      if (!previous || previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    const dashboard = {
      userMetrics: {
        totalUsers: latestUserMetrics?.totalUsers || 0,
        activeUsers: latestUserMetrics?.activeUsers || 0,
        newUsers: latestUserMetrics?.newUsers || 0,
        change: {
          totalUsers: getChangePercentage(
            latestUserMetrics?.totalUsers || 0,
            weekAgoUserMetrics?.totalUsers || 0
          ),
          activeUsers: getChangePercentage(
            latestUserMetrics?.activeUsers || 0,
            weekAgoUserMetrics?.activeUsers || 0
          ),
        },
      },
      taskMetrics: {
        totalTasks: latestTaskMetrics?.totalTasks || 0,
        completedTasks: latestTaskMetrics?.completedTasks || 0,
        pendingTasks: latestTaskMetrics?.pendingTasks || 0,
        completionRate: latestTaskMetrics?.completionRate || 0,
        change: {
          completionRate: getChangePercentage(
            latestTaskMetrics?.completionRate || 0,
            weekAgoTaskMetrics?.completionRate || 0
          ),
        },
      },
      pointMetrics: {
        totalPointsEarned: latestPointMetrics?.totalPointsEarned || 0,
        totalPointsSpent: latestPointMetrics?.totalPointsSpent || 0,
        averagePointsPerAccount:
          latestPointMetrics?.averagePointsPerAccount || 0,
        change: {
          pointsEarned: getChangePercentage(
            latestPointMetrics?.totalPointsEarned || 0,
            weekAgoPointMetrics?.totalPointsEarned || 0
          ),
        },
      },
      badgeMetrics: {
        totalBadgesAwarded: latestBadgeMetrics?.totalBadgesAwarded || 0,
        uniqueStudentsAwarded: latestBadgeMetrics?.uniqueStudentsAwarded || 0,
        change: {
          badgesAwarded: getChangePercentage(
            latestBadgeMetrics?.totalBadgesAwarded || 0,
            weekAgoBadgeMetrics?.totalBadgesAwarded || 0
          ),
        },
      },
      recentJobs: recentJobs.map((job) => ({
        jobType: job.jobType,
        status: job.status,
        startDate: job.startDate,
        endDate: job.endDate,
        processedRecords: job.processedRecords,
        createdAt: job.createdAt,
      })),
      lastUpdated: latestUserMetrics?.lastUpdated || new Date(),
    };

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error("Error getting dashboard overview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get dashboard overview",
      error: error.message,
    });
  }
};

// Get system health status
exports.getSystemHealth = async (req, res) => {
  try {
    // Check status of latest jobs
    const latestJobs = await AnalyticsJob.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Check database connection
    const dbStatus =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    // Get metrics about the analytics data
    const metrics = await Promise.all([
      UserMetrics.countDocuments(),
      TaskMetrics.countDocuments(),
      PointMetrics.countDocuments(),
      BadgeMetrics.countDocuments(),
    ]);

    // Get the last job run time
    const lastJob = await AnalyticsJob.findOne().sort({ lastRun: -1 }).limit(1);

    const health = {
      status: "healthy",
      database: {
        status: dbStatus,
        collections: {
          userMetrics: metrics[0],
          taskMetrics: metrics[1],
          pointMetrics: metrics[2],
          badgeMetrics: metrics[3],
        },
      },
      jobs: {
        recent: latestJobs.map((job) => ({
          jobType: job.jobType,
          status: job.status,
          lastRun: job.lastRun,
        })),
        lastRun: lastJob?.lastRun || null,
      },
      timestamp: new Date(),
    };

    res.status(200).json({
      success: true,
      data: health,
    });
  } catch (error) {
    console.error("Error getting system health:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get system health",
      error: error.message,
    });
  }
};

// Trigger a manual analytics update
exports.triggerAnalyticsUpdate = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.body;

    if (!type || !["user", "task", "point", "badge", "full"].includes(type)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid analytics type. Must be one of: user, task, point, badge, full",
      });
    }

    // Create a new analytics job
    const job = new AnalyticsJob({
      jobType: type,
      startDate: startDate
        ? new Date(startDate)
        : new Date(Date.now() - 24 * 60 * 60 * 1000), // Default to 24 hours ago
      endDate: endDate ? new Date(endDate) : new Date(),
      status: "pending",
    });

    await job.save();

    // In a real implementation, this would trigger the actual job processing
    // For now, we'll just acknowledge the job creation

    res.status(200).json({
      success: true,
      message: `Analytics job for ${type} data has been scheduled`,
      data: {
        jobId: job._id,
        jobType: job.jobType,
        startDate: job.startDate,
        endDate: job.endDate,
        status: job.status,
      },
    });
  } catch (error) {
    console.error("Error triggering analytics update:", error);
    res.status(500).json({
      success: false,
      message: "Failed to trigger analytics update",
      error: error.message,
    });
  }
};
