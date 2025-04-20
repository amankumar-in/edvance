const express = require("express");
const pointTransactionController = require("../controllers/pointTransaction.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     PointTransaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the transaction
 *         accountId:
 *           type: string
 *           description: ID of the associated point account
 *         studentId:
 *           type: string
 *           description: ID of the student
 *         amount:
 *           type: number
 *           description: Amount of points awarded/deducted
 *         type:
 *           type: string
 *           enum: [earned, spent, adjusted]
 *           description: Type of transaction
 *         source:
 *           type: string
 *           enum: [task, attendance, behavior, badge, redemption, manual_adjustment]
 *           description: Source of the transaction
 *         sourceId:
 *           type: string
 *           description: ID of the source entity (task, badge, etc.)
 *         description:
 *           type: string
 *           description: Description of the transaction
 *         awardedBy:
 *           type: string
 *           description: ID of the user who awarded the points
 *         awardedByRole:
 *           type: string
 *           enum: [student, parent, teacher, school_admin, social_worker, platform_admin, system]
 *           description: Role of the user who awarded the points
 *         balanceAfter:
 *           type: number
 *           description: Account balance after this transaction
 *         metadata:
 *           type: object
 *           description: Additional transaction metadata
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Transaction creation timestamp
 *
 */

/**
 * @openapi
 * /points/transactions:
 *   post:
 *     summary: Create a new point transaction (award or deduct points)
 *     tags:
 *       - Point Transactions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Transaction details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: ID of the student
 *               amount:
 *                 type: number
 *                 description: Amount of points to award or deduct
 *               type:
 *                 type: string
 *                 enum: [earned, spent, adjusted]
 *                 description: Type of transaction
 *               source:
 *                 type: string
 *                 enum: [task, attendance, behavior, badge, redemption, manual_adjustment]
 *                 description: Source of the transaction
 *               sourceId:
 *                 type: string
 *                 description: ID of the source entity (task, badge, etc.)
 *               description:
 *                 type: string
 *                 description: Description of the transaction
 *               awardedBy:
 *                 type: string
 *                 description: ID of the user awarding the points
 *               awardedByRole:
 *                 type: string
 *                 enum: [student, parent, teacher, school_admin, social_worker, platform_admin, system]
 *                 description: Role of the user awarding the points
 *               metadata:
 *                 type: object
 *                 description: Additional data about the transaction
 *                 properties:
 *                   sourceType:
 *                     type: string
 *                     description: Specific sub-type of the source
 *                   category:
 *                     type: string
 *                     description: Category for task-related transactions
 *                   difficulty:
 *                     type: string
 *                     enum: [easy, medium, hard]
 *                     description: Difficulty level for tasks
 *                   streak:
 *                     type: number
 *                     description: Current streak count for attendance
 *                   badgeType:
 *                     type: string
 *                     description: Type of badge for badge transactions
 *                   isPositive:
 *                     type: boolean
 *                     description: Whether behavior is positive or negative
 *             required:
 *               - studentId
 *               - amount
 *               - type
 *               - source
 *               - description
 *               - awardedBy
 *               - awardedByRole
 *     responses:
 *       '201':
 *         description: Transaction created successfully
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
 *                   example: "Transaction created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       $ref: '#/components/schemas/PointTransaction'
 *                     accountBalance:
 *                       type: number
 *                       example: 150
 *                     accountLevel:
 *                       type: number
 *                       example: 2
 *       '400':
 *         description: Missing required fields or limit exceeded
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
 *                   example: "Missing required fields"
 *       '500':
 *         description: Internal server error
 */
router.post(
  "/",
  authMiddleware.verifyToken,
  pointTransactionController.createTransaction
);

/**
 * @openapi
 * /points/transactions/{id}:
 *   get:
 *     summary: Retrieve a point transaction by its ID
 *     tags:
 *       - Point Transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Unique identifier of the transaction
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Transaction data returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PointTransaction'
 *       '404':
 *         description: Transaction not found
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
 *                   example: "Transaction not found"
 *       '500':
 *         description: Internal server error
 */
router.get(
  "/:id",
  authMiddleware.verifyToken,
  pointTransactionController.getTransactionById
);

/**
 * @openapi
 * /points/transactions/source/{source}/{sourceId}:
 *   get:
 *     summary: Get transactions filtered by source and entity
 *     tags:
 *       - Point Transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: source
 *         in: path
 *         description: Transaction source type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [task, attendance, behavior, badge, redemption, manual_adjustment]
 *       - name: sourceId
 *         in: path
 *         description: Identifier of the source entity
 *         required: true
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of items per page
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       '200':
 *         description: Array of transactions matching criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PointTransaction'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 45
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         pages:
 *                           type: integer
 *                           example: 3
 *       '500':
 *         description: Internal server error
 */
router.get(
  "/source/:source/:sourceId",
  authMiddleware.verifyToken,
  pointTransactionController.getTransactionsBySource
);

/**
 * @openapi
 * /points/transactions/student/{studentId}:
 *   get:
 *     summary: List all transactions for a student with optional filters
 *     tags:
 *       - Point Transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: studentId
 *         in: path
 *         description: Student's unique ID
 *         required: true
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Items per page
 *         schema:
 *           type: integer
 *           default: 20
 *       - name: type
 *         in: query
 *         description: Filter by transaction type
 *         schema:
 *           type: string
 *           enum: [earned, spent, adjusted]
 *       - name: source
 *         in: query
 *         description: Filter by transaction source
 *         schema:
 *           type: string
 *           enum: [task, attendance, behavior, badge, redemption, manual_adjustment]
 *       - name: startDate
 *         in: query
 *         description: Start date for filtering (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         description: End date for filtering (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       '200':
 *         description: Paginated list of student transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PointTransaction'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 45
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         pages:
 *                           type: integer
 *                           example: 3
 *       '500':
 *         description: Internal server error
 */
router.get(
  "/student/:studentId",
  authMiddleware.verifyToken,
  pointTransactionController.getStudentTransactions
);

/**
 * @openapi
 * /points/transactions/student/{studentId}/summary:
 *   get:
 *     summary: Get aggregated transaction summary for a student
 *     tags:
 *       - Point Transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: studentId
 *         in: path
 *         description: Student's unique ID
 *         required: true
 *         schema:
 *           type: string
 *       - name: startDate
 *         in: query
 *         description: Start date for filtering (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         description: End date for filtering (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       '200':
 *         description: Summary of transactions by type and source
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "earned"
 *                       sources:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             source:
 *                               type: string
 *                               example: "task"
 *                             totalPoints:
 *                               type: number
 *                               example: 125
 *                             count:
 *                               type: integer
 *                               example: 10
 *                       totalPoints:
 *                         type: number
 *                         example: 350
 *       '500':
 *         description: Internal server error
 */
router.get(
  "/student/:studentId/summary",
  authMiddleware.verifyToken,
  pointTransactionController.getStudentTransactionSummary
);

/**
 * @openapi
 * /points/transactions/{transactionId}/reverse:
 *   post:
 *     summary: Reverse a specific transaction
 *     description: Reverse a transaction and create a compensating transaction. Limited to admins.
 *     tags:
 *       - Point Transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: transactionId
 *         in: path
 *         description: ID of the transaction to reverse
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Reason for reversal
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for reversing the transaction
 *                 example: "Transaction was made in error"
 *             required:
 *               - reason
 *     responses:
 *       '200':
 *         description: Transaction reversed successfully
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
 *                   example: "Transaction reversed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     originalTransaction:
 *                       $ref: '#/components/schemas/PointTransaction'
 *                     reversalTransaction:
 *                       $ref: '#/components/schemas/PointTransaction'
 *                     accountBalance:
 *                       type: number
 *                       example: 100
 *       '400':
 *         description: Bad request or already reversed
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
 *                   example: "Transaction has already been reversed"
 *       '404':
 *         description: Transaction not found
 *       '500':
 *         description: Internal server error
 */
router.post(
  "/:transactionId/reverse",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin", "school_admin"]),
  pointTransactionController.reverseTransaction
);

/**
 * @openapi
 * /points/transactions/visualization/timeseries:
 *   get:
 *     summary: Retrieve time series data for charting student points over time
 *     tags:
 *       - Point Transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: studentId
 *         in: query
 *         description: Filter by student ID
 *         required: true
 *         schema:
 *           type: string
 *       - name: timeFrame
 *         in: query
 *         description: Preset timeframe (week, month, year)
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *       - name: startDate
 *         in: query
 *         description: Custom start date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         description: Custom end date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: groupBy
 *         in: query
 *         description: Interval grouping (day, week, month)
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *     responses:
 *       '200':
 *         description: Time series data returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     timeSeries:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             example: "2023-09-15"
 *                           timestamp:
 *                             type: number
 *                             example: 1694739600000
 *                           earned:
 *                             type: number
 *                             example: 25
 *                           spent:
 *                             type: number
 *                             example: 10
 *                           adjusted:
 *                             type: number
 *                             example: 0
 *                           net:
 *                             type: number
 *                             example: 15
 *                           transactions:
 *                             type: integer
 *                             example: 3
 *                     timeFrame:
 *                       type: string
 *                       example: "month"
 *                     interval:
 *                       type: string
 *                       example: "day"
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *       '500':
 *         description: Internal server error
 */
router.get(
  "/visualization/timeseries",
  authMiddleware.verifyToken,
  pointTransactionController.getPointsTimeSeriesData
);

/**
 * @openapi
 * /points/transactions/analysis/categories:
 *   get:
 *     summary: Analyze and summarize transactions by category
 *     tags:
 *       - Point Transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: studentId
 *         in: query
 *         description: Student ID for analysis
 *         required: true
 *         schema:
 *           type: string
 *       - name: timeFrame
 *         in: query
 *         description: Timeframe filter (week, month, year, all)
 *         schema:
 *           type: string
 *           enum: [week, month, year, all]
 *     responses:
 *       '200':
 *         description: Category analysis data returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     timeFrame:
 *                       type: string
 *                       example: "month"
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalPoints:
 *                           type: number
 *                           example: 350
 *                         totalTransactions:
 *                           type: integer
 *                           example: 25
 *                         averagePerTransaction:
 *                           type: number
 *                           example: 14
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                             example: "task"
 *                           totalPoints:
 *                             type: number
 *                             example: 200
 *                           transactionCount:
 *                             type: integer
 *                             example: 15
 *                           percentage:
 *                             type: number
 *                             example: 57.1
 *                           firstEarned:
 *                             type: string
 *                             format: date-time
 *                           lastEarned:
 *                             type: string
 *                             format: date-time
 *                           averagePerTransaction:
 *                             type: number
 *                             example: 13.3
 *                     taskCategories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                             example: "homework"
 *                           totalPoints:
 *                             type: number
 *                             example: 120
 *                           transactionCount:
 *                             type: integer
 *                             example: 8
 *                           averagePerTask:
 *                             type: number
 *                             example: 15
 *       '500':
 *         description: Internal server error
 */
router.get(
  "/analysis/categories",
  authMiddleware.verifyToken,
  pointTransactionController.getCategoryAnalysis
);

module.exports = router;
