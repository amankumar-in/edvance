const express = require("express");
const router = express.Router();
const taskAnalyticsController = require("../controllers/taskAnalytics.controller");
const { verifyToken, checkRole } = require("../middleware/auth.middleware");

/**
 * @openapi
 * components:
 *   schemas:
 *     TaskMetricsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             period:
 *               type: string
 *               enum: [daily, weekly, monthly]
 *               example: "monthly"
 *             startDate:
 *               type: string
 *               format: date-time
 *             endDate:
 *               type: string
 *               format: date-time
 *             schoolId:
 *               type: string
 *               nullable: true
 *               example: "60f8a9b5e6b3f32f8c9a8d7e"
 *             metrics:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   totalTasks:
 *                     type: number
 *                     example: 315
 *                   newTasks:
 *                     type: number
 *                     example: 78
 *                   completedTasks:
 *                     type: number
 *                     example: 215
 *                   pendingTasks:
 *                     type: number
 *                     example: 97
 *                   completionRate:
 *                     type: number
 *                     format: float
 *                     example: 68.25
 *                     description: Percentage of tasks completed
 *     TaskCategoryDistributionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *               format: date-time
 *             endDate:
 *               type: string
 *               format: date-time
 *             schoolId:
 *               type: string
 *               nullable: true
 *               example: "60f8a9b5e6b3f32f8c9a8d7e"
 *             categoryDistribution:
 *               type: object
 *               additionalProperties:
 *                 type: number
 *               example:
 *                 Homework: 95
 *                 Reading: 68
 *                 Math: 45
 *                 Science: 32
 *                 "Household Chores": 75
 *             difficultyDistribution:
 *               type: object
 *               properties:
 *                 easy:
 *                   type: number
 *                   example: 120
 *                 medium:
 *                   type: number
 *                   example: 135
 *                 hard:
 *                   type: number
 *                   example: 45
 *                 challenging:
 *                   type: number
 *                   example: 15
 *     SchoolPerformanceResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *               format: date-time
 *             endDate:
 *               type: string
 *               format: date-time
 *             sortBy:
 *               type: string
 *               enum: [totalTasks, completedTasks, completionRate]
 *               example: "completionRate"
 *             schools:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   schoolId:
 *                     type: string
 *                     example: "60f8a9b5e6b3f32f8c9a8d7e"
 *                   schoolName:
 *                     type: string
 *                     example: "Lincoln Elementary School"
 *                   totalTasks:
 *                     type: number
 *                     example: 587
 *                   completedTasks:
 *                     type: number
 *                     example: 432
 *                   completionRate:
 *                     type: number
 *                     format: float
 *                     example: 73.6
 */

// Middleware for protected routes
router.use(verifyToken);

/**
 * @openapi
 * /analytics/tasks/metrics:
 *   get:
 *     summary: Get task creation and completion metrics
 *     description: Retrieves analytics on task creation and completion over time with various filtering options
 *     tags:
 *       - Task Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: period
 *         in: query
 *         description: Time period for aggregation
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: monthly
 *       - name: startDate
 *         in: query
 *         description: Start date for filtering (defaults to 90 days ago)
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: endDate
 *         in: query
 *         description: End date for filtering (defaults to current date)
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: schoolId
 *         in: query
 *         description: School ID for filtering by school
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Task metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskMetricsResponse'
 *       '403':
 *         description: Not authorized to access task metrics
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
 *         description: Failed to get task metrics
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
 *                   example: "Failed to get task metrics"
 *                 error:
 *                   type: string
 */
router.get(
  "/metrics",
  checkRole(["teacher", "school_admin", "platform_admin"]),
  taskAnalyticsController.getTaskMetrics
);

/**
 * @openapi
 * /analytics/tasks/categories:
 *   get:
 *     summary: Get task category distribution
 *     description: Retrieves the distribution of tasks across categories and difficulty levels
 *     tags:
 *       - Task Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: startDate
 *         in: query
 *         description: Start date for filtering (defaults to 30 days ago)
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: endDate
 *         in: query
 *         description: End date for filtering (defaults to current date)
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: schoolId
 *         in: query
 *         description: School ID for filtering by school
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Task category distribution retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskCategoryDistributionResponse'
 *       '403':
 *         description: Not authorized to access task category distribution
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
 *         description: Failed to get task category distribution
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
 *                   example: "Failed to get task category distribution"
 *                 error:
 *                   type: string
 */
router.get(
  "/categories",
  checkRole(["teacher", "school_admin", "platform_admin"]),
  taskAnalyticsController.getTaskCategoryDistribution
);

/**
 * @openapi
 * /analytics/tasks/schools-performance:
 *   get:
 *     summary: Get task performance by school
 *     description: Retrieves school-level task performance metrics, sorted by specified criteria
 *     tags:
 *       - Task Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: startDate
 *         in: query
 *         description: Start date for filtering (defaults to 30 days ago)
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: endDate
 *         in: query
 *         description: End date for filtering (defaults to current date)
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: sortBy
 *         in: query
 *         description: Criteria to sort schools by
 *         schema:
 *           type: string
 *           enum: [totalTasks, completedTasks, completionRate]
 *           default: completionRate
 *       - name: limit
 *         in: query
 *         description: Number of schools to return
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       '200':
 *         description: School performance metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolPerformanceResponse'
 *       '403':
 *         description: Not authorized to access school performance metrics
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
 *         description: Failed to get school performance metrics
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
 *                   example: "Failed to get school performance metrics"
 *                 error:
 *                   type: string
 */
router.get(
  "/schools-performance",
  checkRole(["platform_admin"]),
  taskAnalyticsController.getTaskPerformanceBySchool
);

module.exports = router;
