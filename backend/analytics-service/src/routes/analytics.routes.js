const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");
const { verifyToken, checkRole } = require("../middleware/auth.middleware");

/**
 * @openapi
 * components:
 *   schemas:
 *     DashboardOverview:
 *       type: object
 *       properties:
 *         userMetrics:
 *           type: object
 *           properties:
 *             totalUsers:
 *               type: number
 *               description: Total number of users in the system
 *             activeUsers:
 *               type: number
 *               description: Number of active users in the last 30 days
 *             newUsers:
 *               type: number
 *               description: Number of new users in the measurement period
 *             change:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: number
 *                   description: Percentage change in total users
 *                 activeUsers:
 *                   type: number
 *                   description: Percentage change in active users
 *         taskMetrics:
 *           type: object
 *           properties:
 *             totalTasks:
 *               type: number
 *               description: Total number of tasks in the system
 *             completedTasks:
 *               type: number
 *               description: Number of completed tasks
 *             pendingTasks:
 *               type: number
 *               description: Number of pending tasks
 *             completionRate:
 *               type: number
 *               description: Task completion rate as a percentage
 *             change:
 *               type: object
 *               properties:
 *                 completionRate:
 *                   type: number
 *                   description: Percentage change in completion rate
 *         pointMetrics:
 *           type: object
 *           properties:
 *             totalPointsEarned:
 *               type: number
 *               description: Total points earned across the platform
 *             totalPointsSpent:
 *               type: number
 *               description: Total points spent across the platform
 *             averagePointsPerAccount:
 *               type: number
 *               description: Average points per student account
 *             change:
 *               type: object
 *               properties:
 *                 pointsEarned:
 *                   type: number
 *                   description: Percentage change in points earned
 *         badgeMetrics:
 *           type: object
 *           properties:
 *             totalBadgesAwarded:
 *               type: number
 *               description: Total badges awarded
 *             uniqueStudentsAwarded:
 *               type: number
 *               description: Number of unique students who received badges
 *             change:
 *               type: object
 *               properties:
 *                 badgesAwarded:
 *                   type: number
 *                   description: Percentage change in badges awarded
 *         recentJobs:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               jobType:
 *                 type: string
 *                 enum: [user, task, point, badge, full]
 *               status:
 *                 type: string
 *                 enum: [pending, processing, completed, failed]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               processedRecords:
 *                 type: number
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *           description: Timestamp of last update
 *     SystemHealth:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [healthy, degraded, unhealthy]
 *           description: Overall system health status
 *         database:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: [connected, disconnected]
 *             collections:
 *               type: object
 *               properties:
 *                 userMetrics:
 *                   type: number
 *                 taskMetrics:
 *                   type: number
 *                 pointMetrics:
 *                   type: number
 *                 badgeMetrics:
 *                   type: number
 *         jobs:
 *           type: object
 *           properties:
 *             recent:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   jobType:
 *                     type: string
 *                     enum: [user, task, point, badge, full]
 *                   status:
 *                     type: string
 *                     enum: [pending, processing, completed, failed]
 *                   lastRun:
 *                     type: string
 *                     format: date-time
 *             lastRun:
 *               type: string
 *               format: date-time
 *               description: Last job execution time
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Current timestamp
 *     AnalyticsUpdateRequest:
 *       type: object
 *       required:
 *         - type
 *       properties:
 *         type:
 *           type: string
 *           enum: [user, task, point, badge, full]
 *           example: "full"
 *           description: Type of analytics to update
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00.000Z"
 *           description: Start date for analytics data collection
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: "2023-01-31T23:59:59.999Z"
 *           description: End date for analytics data collection
 *     AnalyticsJob:
 *       type: object
 *       properties:
 *         jobId:
 *           type: string
 *           description: Unique identifier for the analytics job
 *         jobType:
 *           type: string
 *           enum: [user, task, point, badge, full]
 *           description: Type of analytics job
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Start date for data collection
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: End date for data collection
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *           description: Current status of the job
 */

// Middleware for protected routes
router.use(verifyToken);

/**
 * @openapi
 * /analytics/dashboard:
 *   get:
 *     summary: Get dashboard overview
 *     description: Retrieves a comprehensive overview of all metrics for the dashboard
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Dashboard overview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DashboardOverview'
 *       '403':
 *         description: Not authorized to access dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied: insufficient permissions"
 *       '500':
 *         description: Failed to get dashboard overview
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to get dashboard overview"
 *                 error:
 *                   type: string
 */
router.get(
  "/dashboard",
  checkRole(["school_admin", "platform_admin"]),
  analyticsController.getDashboardOverview
);

/**
 * @openapi
 * /analytics/health:
 *   get:
 *     summary: Get system health status
 *     description: Retrieves the current health status of the analytics system
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: System health status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SystemHealth'
 *       '403':
 *         description: Not authorized to access system health
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied: insufficient permissions"
 *       '500':
 *         description: Failed to get system health
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to get system health"
 *                 error:
 *                   type: string
 */
router.get(
  "/health",
  checkRole(["platform_admin"]),
  analyticsController.getSystemHealth
);

/**
 * @openapi
 * /analytics/update:
 *   post:
 *     summary: Trigger manual analytics update
 *     description: Schedules a manual update of analytics data for the specified type
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Analytics update details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnalyticsUpdateRequest'
 *     responses:
 *       '200':
 *         description: Analytics update scheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Analytics job for full data has been scheduled"
 *                 data:
 *                   $ref: '#/components/schemas/AnalyticsJob'
 *       '400':
 *         description: Invalid analytics type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid analytics type. Must be one of: user, task, point, badge, full"
 *       '403':
 *         description: Not authorized to trigger analytics update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied: insufficient permissions"
 *       '500':
 *         description: Failed to trigger analytics update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to trigger analytics update"
 *                 error:
 *                   type: string
 */
router.post(
  "/update",
  checkRole(["platform_admin"]),
  analyticsController.triggerAnalyticsUpdate
);

module.exports = router;
