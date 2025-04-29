const express = require("express");
const router = express.Router();
const userAnalyticsController = require("../controllers/userAnalytics.controller");
const { verifyToken, checkRole } = require("../middleware/auth.middleware");

/**
 * @openapi
 * components:
 *   schemas:
 *     UserGrowthResponse:
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
 *                   totalUsers:
 *                     type: number
 *                     example: 845
 *                   newUsers:
 *                     type: number
 *                     example: 32
 *                   activeUsers:
 *                     type: number
 *                     example: 567
 *                   usersByRole:
 *                     type: object
 *                     properties:
 *                       students:
 *                         type: number
 *                         example: 425
 *                       parents:
 *                         type: number
 *                         example: 315
 *                       teachers:
 *                         type: number
 *                         example: 85
 *                       school_admin:
 *                         type: number
 *                         example: 15
 *                       social_worker:
 *                         type: number
 *                         example: 4
 *                       platform_admin:
 *                         type: number
 *                         example: 1
 *     UserEngagementResponse:
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
 *               type: object
 *               properties:
 *                 activeUsers:
 *                   type: number
 *                   example: 567
 *                 activeUserRate:
 *                   type: number
 *                   format: float
 *                   example: 67.1
 *                   description: Percentage of total users who are active
 *                 userDistribution:
 *                   type: object
 *                   properties:
 *                     students:
 *                       type: number
 *                       example: 425
 *                     parents:
 *                       type: number
 *                       example: 315
 *                     teachers:
 *                       type: number
 *                       example: 85
 *                     school_admin:
 *                       type: number
 *                       example: 15
 *                     social_worker:
 *                       type: number
 *                       example: 4
 *                     platform_admin:
 *                       type: number
 *                       example: 1
 *     SchoolComparisonResponse:
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
 *                   totalUsers:
 *                     type: number
 *                     example: 845
 *                   activeUsers:
 *                     type: number
 *                     example: 567
 *                   activeRate:
 *                     type: number
 *                     format: float
 *                     example: 67.1
 *                   userDistribution:
 *                     type: object
 *                     properties:
 *                       students:
 *                         type: number
 *                         example: 425
 *                       parents:
 *                         type: number
 *                         example: 315
 *                       teachers:
 *                         type: number
 *                         example: 85
 *                       school_admin:
 *                         type: number
 *                         example: 15
 */

// Middleware for protected routes
router.use(verifyToken);

/**
 * @openapi
 * /analytics/users/growth:
 *   get:
 *     summary: Get user growth metrics
 *     description: Retrieves analytics on user growth over time with various filtering options
 *     tags:
 *       - User Analytics
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
 *         description: User growth metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserGrowthResponse'
 *       '403':
 *         description: Not authorized to access user growth metrics
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
 *         description: Failed to get user growth metrics
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
 *                   example: "Failed to get user growth metrics"
 *                 error:
 *                   type: string
 */
router.get(
  "/growth",
  checkRole(["school_admin", "platform_admin"]),
  userAnalyticsController.getUserGrowth
);

/**
 * @openapi
 * /analytics/users/engagement:
 *   get:
 *     summary: Get user engagement metrics
 *     description: Retrieves analytics on user engagement, including active users and role distribution
 *     tags:
 *       - User Analytics
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
 *         description: User engagement metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserEngagementResponse'
 *       '403':
 *         description: Not authorized to access user engagement metrics
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
 *         description: Failed to get user engagement metrics
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
 *                   example: "Failed to get user engagement metrics"
 *                 error:
 *                   type: string
 */
router.get(
  "/engagement",
  checkRole(["school_admin", "platform_admin"]),
  userAnalyticsController.getUserEngagement
);

/**
 * @openapi
 * /analytics/users/schools-comparison:
 *   get:
 *     summary: Get school comparison metrics
 *     description: Retrieves analytics comparing user metrics across different schools
 *     tags:
 *       - User Analytics
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
 *         description: School comparison metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchoolComparisonResponse'
 *       '403':
 *         description: Not authorized to access school comparison metrics
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
 *         description: Failed to get school comparison metrics
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
 *                   example: "Failed to get school comparison metrics"
 *                 error:
 *                   type: string
 */
router.get(
  "/schools-comparison",
  checkRole(["platform_admin"]),
  userAnalyticsController.getSchoolComparison
);

module.exports = router;
