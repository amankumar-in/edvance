const cron = require("node-cron");
const axios = require("axios");
const AnalyticsJob = require("../models/analyticsJob.model");

// Data collector services
const dataCollectorService = require("./dataCollector.service");

/**
 * Initialize the analytics scheduler
 * This will set up recurring jobs to collect analytics data
 */
const initScheduler = () => {
  console.log("Initializing analytics scheduler...");

  // Schedule hourly data collection (default)
  try {
    const cronExpression =
      process.env.ANALYTICS_REFRESH_INTERVAL || "0 0 * * * *"; // Default: hourly at the top of the hour

    if (!cron.validate(cronExpression)) {
      console.error(
        `Invalid cron expression: ${cronExpression}, defaulting to hourly`
      );
      cronExpression = "0 0 * * * *";
    }

    cron.schedule(cronExpression, async () => {
      console.log(
        `Running scheduled analytics update at ${new Date().toISOString()}`
      );
      await runFullAnalyticsJob();
    });

    console.log(
      `Analytics scheduler initialized with schedule: ${cronExpression}`
    );
  } catch (error) {
    console.error("Failed to initialize scheduler:", error);
  }
};

/**
 * Run a full analytics job (collecting data for all metrics)
 */
const runFullAnalyticsJob = async () => {
  try {
    const startDate = new Date(); // Current time
    startDate.setHours(startDate.getHours() - 24); // Look back 24 hours

    const endDate = new Date(); // Current time

    // Create a job record
    const job = new AnalyticsJob({
      jobType: "full",
      startDate,
      endDate,
      status: "processing",
    });

    await job.save();
    console.log(`Started full analytics job: ${job._id}`);

    try {
      // Collect all types of analytics data
      await Promise.all([
        collectUserAnalytics(job._id, startDate, endDate),
        collectTaskAnalytics(job._id, startDate, endDate),
        collectPointAnalytics(job._id, startDate, endDate),
        collectBadgeAnalytics(job._id, startDate, endDate),
      ]);

      // Update job as completed
      await AnalyticsJob.findByIdAndUpdate(job._id, {
        status: "completed",
        lastRun: new Date(),
      });

      console.log(`Completed full analytics job: ${job._id}`);
    } catch (error) {
      // Update job as failed
      await AnalyticsJob.findByIdAndUpdate(job._id, {
        status: "failed",
        error: {
          message: error.message,
          stack: error.stack,
        },
        lastRun: new Date(),
      });

      console.error(`Failed to complete analytics job ${job._id}:`, error);
    }
  } catch (error) {
    console.error("Failed to run full analytics job:", error);
  }
};

/**
 * Collect user analytics data
 */
const collectUserAnalytics = async (jobId, startDate, endDate) => {
  try {
    console.log(`Collecting user analytics data for job ${jobId}...`);

    // Call the data collector service
    await dataCollectorService.collectUserMetrics(startDate, endDate);

    // Update job with progress
    await AnalyticsJob.findByIdAndUpdate(jobId, {
      $inc: { processedRecords: 1 },
      "metrics.userMetricsCollected": true,
    });

    console.log(`User analytics data collection completed for job ${jobId}`);
  } catch (error) {
    console.error(`Error collecting user analytics for job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Collect task analytics data
 */
const collectTaskAnalytics = async (jobId, startDate, endDate) => {
  try {
    console.log(`Collecting task analytics data for job ${jobId}...`);

    // Call the data collector service
    await dataCollectorService.collectTaskMetrics(startDate, endDate);

    // Update job with progress
    await AnalyticsJob.findByIdAndUpdate(jobId, {
      $inc: { processedRecords: 1 },
      "metrics.taskMetricsCollected": true,
    });

    console.log(`Task analytics data collection completed for job ${jobId}`);
  } catch (error) {
    console.error(`Error collecting task analytics for job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Collect point analytics data
 */
const collectPointAnalytics = async (jobId, startDate, endDate) => {
  try {
    console.log(`Collecting point analytics data for job ${jobId}...`);

    // Call the data collector service
    await dataCollectorService.collectPointMetrics(startDate, endDate);

    // Update job with progress
    await AnalyticsJob.findByIdAndUpdate(jobId, {
      $inc: { processedRecords: 1 },
      "metrics.pointMetricsCollected": true,
    });

    console.log(`Point analytics data collection completed for job ${jobId}`);
  } catch (error) {
    console.error(`Error collecting point analytics for job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Collect badge analytics data
 */
const collectBadgeAnalytics = async (jobId, startDate, endDate) => {
  try {
    console.log(`Collecting badge analytics data for job ${jobId}...`);

    // Call the data collector service
    await dataCollectorService.collectBadgeMetrics(startDate, endDate);

    // Update job with progress
    await AnalyticsJob.findByIdAndUpdate(jobId, {
      $inc: { processedRecords: 1 },
      "metrics.badgeMetricsCollected": true,
    });

    console.log(`Badge analytics data collection completed for job ${jobId}`);
  } catch (error) {
    console.error(`Error collecting badge analytics for job ${jobId}:`, error);
    throw error;
  }
};

module.exports = {
  initScheduler,
  runFullAnalyticsJob,
  collectUserAnalytics,
  collectTaskAnalytics,
  collectPointAnalytics,
  collectBadgeAnalytics,
};
