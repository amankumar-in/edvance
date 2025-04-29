const express = require("express");
const router = express.Router();
const badgeAnalyticsController = require("../controllers/badgeAnalytics.controller");
const { verifyToken, checkRole } = require("../middleware/auth.middleware");

/**
 * @openapi
 * components:
 *   schemas:
 *     BadgeAwardMetricsResponse:
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
 *                   totalBadgesAwarded:
 *                     type: number
 *                     example: 157
 *                   uniqueStudentsAwarded:
 *                     type: number
 *                     example: 89
 *                   badgesByConditionType:
 *                     type: object
 *                     properties:
 *                       points_threshold:
 *                         type: number
 *                         example: 58
 *                       task_completion:
 *                         type: number
 *                         example: 42
 *                       attendance_streak:
 *                         type: number
 *                         example: 37
 *                       custom:
 *                         type: number
 *                         example: 20
 *                   badgesByIssuerType:
 *                     type: object
 *                     properties:
 *                       system:
 *                         type: number
 *                         example: 87
 *                       school:
 *                         type: number
 *                         example: 61
 *                       parent:
 *                         type: number
 *                         example: 9
 *                   totalPointsFromBadges:
 *                     type: number
 *                     example: 3750
 *                   awardsPerStudent:
 *                     type: number
 *                     format: float
 *                     example: 1.76
 *     PopularBadgesResponse:
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
 *             popularBadges:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   badgeId:
 *                     type: string
 *                     example: "60f8a9b5e6b3f32f8c9a8d7e"
 *                   badgeName:
 *                     type: string
 *                     example: "Math Wizard"
 *                   count:
 *                     type: number
 *                     example: 42
 *     BadgeCategoryDistributionResponse:
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
 *             badgesByCategory:
 *               type: object
 *               additionalProperties:
 *                 type: number
 *               example:
 *                 academic: 87
 *                 behavior: 42
 *                 attendance: 28
 *             badgesByConditionType:
 *               type: object
 *               properties:
 *                 points_threshold:
 *                   type: number
 *                   example: 58
 *                 task_completion:
 *                   type: number
 *                   example: 42
 *                 attendance_streak:
 *                   type: number
 *                   example: 37
 *                 custom:
 *                   type: number
 *                   example: 20
 *             badgesByIssuerType:
 *               type: object
 *               properties:
 *                 system:
 *                   type: number
 *                   example: 87
 *                 school:
 *                   type: number
 *                   example: 61
 *                 parent:
 *                   type: number
 *                   example: 9
 */

// Middleware for protected routes
router.use(verifyToken);

/**
 * @openapi
 * /analytics/badges/awards:
 *   get:
 *     summary: Get badge award metrics
 *     description: Retrieves analytics on badge awards over time with various filtering options
 *     tags:
 *       - Badge Analytics
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
 *         description: Badge award metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadgeAwardMetricsResponse'
 *       '403':
 *         description: Not authorized to access badge award metrics
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
 *         description: Failed to get badge award metrics
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
 *                   example: "Failed to get badge award metrics"
 *                 error:
 *                   type: string
 */
router.get(
  "/awards",
  checkRole(["teacher", "school_admin", "platform_admin"]),
  badgeAnalyticsController.getBadgeAwards
);

/**
 * @openapi
 * /analytics/badges/popular:
 *   get:
 *     summary: Get popular badges
 *     description: Retrieves a list of the most popular badges based on award count
 *     tags:
 *       - Badge Analytics
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
 *       - name: limit
 *         in: query
 *         description: Number of popular badges to return
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       '200':
 *         description: Popular badges retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PopularBadgesResponse'
 *       '403':
 *         description: Not authorized to access popular badges
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
 *         description: Failed to get popular badges
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
 *                   example: "Failed to get popular badges"
 *                 error:
 *                   type: string
 */
router.get(
  "/popular",
  checkRole(["teacher", "school_admin", "platform_admin"]),
  badgeAnalyticsController.getPopularBadges
);

/**
 * @openapi
 * /analytics/badges/categories:
 *   get:
 *     summary: Get badge category distribution
 *     description: Retrieves badge distribution across various categories and types
 *     tags:
 *       - Badge Analytics
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
 *         description: Badge category distribution retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadgeCategoryDistributionResponse'
 *       '403':
 *         description: Not authorized to access badge category distribution
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
 *         description: Failed to get badge category distribution
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
 *                   example: "Failed to get badge category distribution"
 *                 error:
 *                   type: string
 */
router.get(
  "/categories",
  checkRole(["teacher", "school_admin", "platform_admin"]),
  badgeAnalyticsController.getBadgeCategoryDistribution
);

module.exports = router;
