const express = require("express");
const router = express.Router();
const pointsAnalyticsController = require("../controllers/pointsAnalytics.controller");
const { verifyToken, checkRole } = require("../middleware/auth.middleware");

/**
 * @openapi
 * components:
 *   schemas:
 *     PointsTransactionsResponse:
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
 *                   totalPointsEarned:
 *                     type: number
 *                     example: 15750
 *                   totalPointsSpent:
 *                     type: number
 *                     example: 8450
 *                   netPointsChange:
 *                     type: number
 *                     example: 7300
 *                   pointsBySource:
 *                     type: object
 *                     properties:
 *                       task:
 *                         type: number
 *                         example: 8750
 *                       attendance:
 *                         type: number
 *                         example: 3500
 *                       behavior:
 *                         type: number
 *                         example: 2250
 *                       badge:
 *                         type: number
 *                         example: 1000
 *                       manual_adjustment:
 *                         type: number
 *                         example: 250
 *                   pointsByTransactionType:
 *                     type: object
 *                     properties:
 *                       earned:
 *                         type: number
 *                         example: 15500
 *                       spent:
 *                         type: number
 *                         example: 8450
 *                       adjusted:
 *                         type: number
 *                         example: 250
 *     PointsEconomyHealthResponse:
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
 *             economyHealth:
 *               type: object
 *               properties:
 *                 pointsEarningRate:
 *                   type: number
 *                   format: float
 *                   example: 525.0
 *                   description: Average points earned per day
 *                 pointsSpendingRate:
 *                   type: number
 *                   format: float
 *                   example: 281.7
 *                   description: Average points spent per day
 *                 economyBalance:
 *                   type: number
 *                   format: float
 *                   example: 53.7
 *                   description: Percentage of points spent relative to earned
 *                 pointsVelocity:
 *                   type: number
 *                   format: float
 *                   example: 243.3
 *                   description: Net points change per day
 *                 inflationRate:
 *                   type: number
 *                   format: float
 *                   example: 12.5
 *                   description: Percentage change in average points per account
 *             pointsDistribution:
 *               type: object
 *               properties:
 *                 bySource:
 *                   type: object
 *                   properties:
 *                     task:
 *                       type: number
 *                       example: 8750
 *                     attendance:
 *                       type: number
 *                       example: 3500
 *                     behavior:
 *                       type: number
 *                       example: 2250
 *                     badge:
 *                       type: number
 *                       example: 1000
 *                     manual_adjustment:
 *                       type: number
 *                       example: 250
 *                 byTransactionType:
 *                   type: object
 *                   properties:
 *                     earned:
 *                       type: number
 *                       example: 15500
 *                     spent:
 *                       type: number
 *                       example: 8450
 *                     adjusted:
 *                       type: number
 *                       example: 250
 *     LevelDistributionResponse:
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
 *             levelDistribution:
 *               type: object
 *               additionalProperties:
 *                 type: number
 *               example:
 *                 "1": 45
 *                 "2": 78
 *                 "3": 56
 *                 "4": 32
 *                 "5": 14
 */

// Middleware for protected routes
router.use(verifyToken);

/**
 * @openapi
 * /analytics/points/transactions:
 *   get:
 *     summary: Get points transaction metrics
 *     description: Retrieves analytics on points transactions over time with various filtering options
 *     tags:
 *       - Points Analytics
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
 *         description: Points transaction metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PointsTransactionsResponse'
 *       '403':
 *         description: Not authorized to access points transaction metrics
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
 *         description: Failed to get points transaction metrics
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
 *                   example: "Failed to get points transaction metrics"
 *                 error:
 *                   type: string
 */
router.get(
  "/transactions",
  checkRole(["teacher", "school_admin", "platform_admin"]),
  pointsAnalyticsController.getPointsTransactions
);

/**
 * @openapi
 * /analytics/points/economy-health:
 *   get:
 *     summary: Get points economy health metrics
 *     description: Retrieves analytics on points economy health, including earning rates, spending rates, and inflation
 *     tags:
 *       - Points Analytics
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
 *         description: Points economy health metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PointsEconomyHealthResponse'
 *       '403':
 *         description: Not authorized to access points economy health metrics
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
 *         description: Failed to get points economy health metrics
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
 *                   example: "Failed to get points economy health metrics"
 *                 error:
 *                   type: string
 */
router.get(
  "/economy-health",
  checkRole(["school_admin", "platform_admin"]),
  pointsAnalyticsController.getPointsEconomyHealth
);

/**
 * @openapi
 * /analytics/points/level-distribution:
 *   get:
 *     summary: Get level distribution metrics
 *     description: Retrieves analytics on the distribution of students across different point levels
 *     tags:
 *       - Points Analytics
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
 *         description: Level distribution metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LevelDistributionResponse'
 *       '403':
 *         description: Not authorized to access level distribution metrics
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
 *         description: Failed to get level distribution metrics
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
 *                   example: "Failed to get level distribution metrics"
 *                 error:
 *                   type: string
 */
router.get(
  "/level-distribution",
  checkRole(["teacher", "school_admin", "platform_admin"]),
  pointsAnalyticsController.getLevelDistribution
);

module.exports = router;
