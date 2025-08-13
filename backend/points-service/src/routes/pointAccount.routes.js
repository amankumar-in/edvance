const express = require("express");
const pointAccountController = require("../controllers/pointAccount.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     PointAccount:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the point account
 *         studentId:
 *           type: string
 *           description: ID of the student who owns this account
 *         currentBalance:
 *           type: number
 *           description: Current available point balance
 *           minimum: 0
 *         totalEarned:
 *           type: number
 *           description: Total lifetime points earned
 *           minimum: 0
 *         totalSpent:
 *           type: number
 *           description: Total lifetime points spent
 *           minimum: 0
 *         level:
 *           type: number
 *           description: Current student level
 *           minimum: 1
 *         levelName:
 *           type: string
 *           description: Current level name
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *           description: Last account update timestamp
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 */

/**
 * @openapi
 * /points/accounts:
 *   post:
 *     summary: Create a new point account
 *     description: Creates a new point account for a student. Limited to platform admins, school admins, and the student themselves.
 *     tags:
 *       - Point Accounts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Student account information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: ID of the student
 *                 example: "60d21b4667d0d8992e610c85"
 *             required:
 *               - studentId
 *     responses:
 *       '201':
 *         description: Point account created successfully
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
 *                   example: "Point account created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PointAccount'
 *       '400':
 *         description: Point account already exists for this student or missing student ID
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
 *                   example: "Point account already exists for this student"
 *       '500':
 *         description: Failed to create point account
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
 *                   example: "Failed to create point account"
 *                 error:
 *                   type: string
 */
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin", "school_admin", "student", "parent"]),
  pointAccountController.createAccount
);

/**
 * @openapi
 * /points/accounts/student/{studentId}:
 *   get:
 *     summary: Get a student's point account details
 *     description: Retrieves complete point account information for a specific student
 *     tags:
 *       - Point Accounts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: studentId
 *         in: path
 *         description: ID of the student
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Point account retrieved successfully
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
 *                     _id:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c86"
 *                     studentId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     currentBalance:
 *                       type: number
 *                       example: 350
 *                     totalEarned:
 *                       type: number
 *                       example: 500
 *                     totalSpent:
 *                       type: number
 *                       example: 150
 *                     level:
 *                       type: number
 *                       example: 3
 *                     levelName:
 *                       type: string
 *                       example: "Developing Scholar"
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     pointsToNextLevel:
 *                       type: number
 *                       example: 250
 *                     progressPercentage:
 *                       type: number
 *                       example: 45.2
 *       '404':
 *         description: Point account not found
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
 *                   example: "Point account not found"
 *       '500':
 *         description: Failed to get point account
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
 *                   example: "Failed to get point account"
 *                 error:
 *                   type: string
 */
router.get(
  "/student/:studentId",
  authMiddleware.verifyToken,
  pointAccountController.getAccountByStudentId
);

/**
 * @openapi
 * /points/accounts/student/{studentId}/balance:
 *   get:
 *     summary: Get a student's point balance
 *     description: Retrieves the current point balance and related statistics
 *     tags:
 *       - Point Accounts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: studentId
 *         in: path
 *         description: ID of the student
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Point balance retrieved successfully
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
 *                     currentBalance:
 *                       type: number
 *                       example: 350
 *                     totalEarned:
 *                       type: number
 *                       example: 500
 *                     totalSpent:
 *                       type: number
 *                       example: 150
 *                     level:
 *                       type: number
 *                       example: 3
 *       '404':
 *         description: Point account not found
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
 *                   example: "Point account not found"
 *       '500':
 *         description: Failed to get balance
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
 *                   example: "Failed to get balance"
 *                 error:
 *                   type: string
 */
router.get(
  "/student/:studentId/balance",
  authMiddleware.verifyToken,
  pointAccountController.getBalance
);

/**
 * @openapi
 * /points/accounts/student/{studentId}/level:
 *   get:
 *     summary: Get a student's level and progress information
 *     description: Retrieves detailed information about the student's current level and progress towards next level
 *     tags:
 *       - Point Accounts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: studentId
 *         in: path
 *         description: ID of the student
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Level information retrieved successfully
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
 *                     level:
 *                       type: number
 *                       example: 3
 *                     totalEarned:
 *                       type: number
 *                       example: 500
 *                     currentBalance:
 *                       type: number
 *                       example: 350
 *                     pointsToNextLevel:
 *                       type: number
 *                       example: 250
 *                     progressPercentage:
 *                       type: number
 *                       example: 45.2
 *                     isMaxLevel:
 *                       type: boolean
 *                       example: false
 *       '404':
 *         description: Point account not found
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
 *                   example: "Point account not found"
 *       '500':
 *         description: Failed to get level information
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
 *                   example: "Failed to get level information"
 *                 error:
 *                   type: string
 */
router.get(
  "/student/:studentId/level",
  authMiddleware.verifyToken,
  pointAccountController.getLevelInfo
);

/**
 * @openapi
 * /points/accounts/student/{studentId}/history:
 *   get:
 *     summary: Get a student's point transaction history
 *     description: Retrieves paginated transaction history for a student with optional filters
 *     tags:
 *       - Point Accounts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: studentId
 *         in: path
 *         description: ID of the student
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
 *         description: Transaction history retrieved successfully
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
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           accountId:
 *                             type: string
 *                           studentId:
 *                             type: string
 *                           amount:
 *                             type: number
 *                           type:
 *                             type: string
 *                             enum: [earned, spent, adjusted]
 *                           source:
 *                             type: string
 *                             enum: [task, attendance, behavior, badge, redemption, manual_adjustment]
 *                           sourceId:
 *                             type: string
 *                           description:
 *                             type: string
 *                           awardedBy:
 *                             type: string
 *                           awardedByRole:
 *                             type: string
 *                           balanceAfter:
 *                             type: number
 *                           metadata:
 *                             type: object
 *                           createdAt:
 *                             type: string
 *                             format: date-time
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
 *       '404':
 *         description: Point account not found
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
 *                   example: "Point account not found"
 *       '500':
 *         description: Failed to get transaction history
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
 *                   example: "Failed to get transaction history"
 *                 error:
 *                   type: string
 */
router.get(
  "/student/:studentId/history",
  authMiddleware.verifyToken,
  pointAccountController.getTransactionHistory
);

module.exports = router;
