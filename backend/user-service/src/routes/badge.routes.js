// badge.routes.js
const express = require("express");
const badgeController = require("../controllers/badge.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Badge:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the badge
 *         name:
 *           type: string
 *           description: Badge name
 *         description:
 *           type: string
 *           description: Badge description
 *         category:
 *           type: string
 *           description: Badge category
 *         image:
 *           type: string
 *           description: URL to badge image
 *         collection:
 *           type: string
 *           description: Collection name badge belongs to (if any)
 *           nullable: true
 *         collectionOrder:
 *           type: number
 *           description: Order within collection
 *         conditions:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [points_threshold, task_completion, attendance_streak, custom]
 *               description: Type of conditions for earning this badge
 *             threshold:
 *               type: number
 *               description: Points threshold (for points_threshold type)
 *             taskCategory:
 *               type: string
 *               description: Task category (for task_completion type)
 *             streak:
 *               type: number
 *               description: Streak count (for attendance_streak type)
 *         pointsBonus:
 *           type: number
 *           description: Bonus points awarded when badge is earned
 *         issuerId:
 *           type: string
 *           description: User ID who created this badge
 *         issuerType:
 *           type: string
 *           enum: [system, school, parent]
 *           description: Type of issuer
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Badge creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Badge update timestamp
 */

/**
 * @openapi
 * /badges:
 *   get:
 *     summary: Get all badges
 *     description: Retrieves the complete list of available badges
 *     tags:
 *       - Badges
 *     responses:
 *       '200':
 *         description: Badges retrieved successfully
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
 *                     $ref: '#/components/schemas/Badge'
 *       '500':
 *         description: Failed to get badges
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
 *                   example: "Failed to get badges"
 *                 error:
 *                   type: string
 */
router.get("/", badgeController.getAllBadges);

/**
 * @openapi
 * /badges/{id}:
 *   get:
 *     summary: Get badge by ID
 *     description: Retrieve a specific badge by its ID
 *     tags:
 *       - Badges
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the badge to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Badge retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Badge'
 *       '404':
 *         description: Badge not found
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
 *                   example: "Badge not found"
 *       '500':
 *         description: Failed to get badge
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
 *                   example: "Failed to get badge"
 *                 error:
 *                   type: string
 */
router.get("/:id", badgeController.getBadgeById);

/**
 * @openapi
 * /badges:
 *   post:
 *     summary: Create a new badge
 *     description: Creates a new badge definition. Limited to platform admins and school admins.
 *     tags:
 *       - Badges
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Badge information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Badge name
 *                 example: "Perfect Attendance"
 *               description:
 *                 type: string
 *                 description: Badge description
 *                 example: "Awarded for maintaining perfect attendance for 30 days"
 *               category:
 *                 type: string
 *                 description: Badge category
 *                 example: "Attendance"
 *               image:
 *                 type: string
 *                 description: URL to badge image
 *                 example: "https://example.com/badges/attendance.png"
 *               conditions:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [points_threshold, task_completion, attendance_streak, custom]
 *                     example: "attendance_streak"
 *                   threshold:
 *                     type: number
 *                     example: 100
 *                   taskCategory:
 *                     type: string
 *                     example: "homework"
 *                   streak:
 *                     type: number
 *                     example: 30
 *               pointsBonus:
 *                 type: number
 *                 description: Bonus points awarded when badge is earned
 *                 example: 50
 *               issuerType:
 *                 type: string
 *                 enum: [system, school, parent]
 *                 description: Type of issuer
 *                 example: "school"
 *             required:
 *               - name
 *               - description
 *               - conditions
 *     responses:
 *       '201':
 *         description: Badge created successfully
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
 *                   example: "Badge created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Badge'
 *       '500':
 *         description: Failed to create badge
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
 *                   example: "Failed to create badge"
 *                 error:
 *                   type: string
 */
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin", "school_admin"]),
  badgeController.createBadge
);

/**
 * @openapi
 * /badges/award:
 *   post:
 *     summary: Award a badge to a student
 *     description: Manually awards a badge to a specific student. Available to platform admins, school admins, teachers, and parents.
 *     tags:
 *       - Badges
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Badge award information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: ID of the student to award the badge to
 *                 example: "60d21b4667d0d8992e610c85"
 *               badgeId:
 *                 type: string
 *                 description: ID of the badge to award
 *                 example: "60d21b4667d0d8992e610c88"
 *             required:
 *               - studentId
 *               - badgeId
 *     responses:
 *       '200':
 *         description: Badge awarded successfully
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
 *                   example: "Badge awarded successfully"
 *       '400':
 *         description: Missing required fields or badge already awarded
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
 *                   example: "Badge was already awarded to this student or could not be awarded"
 *       '500':
 *         description: Failed to award badge
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
 *                   example: "Failed to award badge"
 *                 error:
 *                   type: string
 */
router.post(
  "/award",
  authMiddleware.verifyToken,
  authMiddleware.checkRole([
    "platform_admin",
    "school_admin",
    "teacher",
    "parent",
  ]),
  badgeController.awardBadge
);

/**
 * @openapi
 * /badges/check:
 *   post:
 *     summary: Check if student qualifies for badges
 *     description: Checks if a student qualifies for badges based on a specific trigger type and metadata
 *     tags:
 *       - Badges
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Student and trigger information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: ID of the student to check
 *                 example: "60d21b4667d0d8992e610c85"
 *               triggerType:
 *                 type: string
 *                 description: Type of trigger event
 *                 enum: [points_threshold, task_completion, attendance_streak]
 *                 example: "attendance_streak"
 *               metadata:
 *                 type: object
 *                 description: Additional metadata about the event
 *                 example:
 *                   streak: 30
 *                   taskCategory: "homework"
 *                   totalPoints: 500
 *             required:
 *               - studentId
 *               - triggerType
 *     responses:
 *       '200':
 *         description: Badge check completed successfully
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
 *                   example: "2 badges awarded"
 *                 data:
 *                   type: object
 *                   properties:
 *                     awardedBadges:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Badge'
 *       '400':
 *         description: Student ID and trigger type are required
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
 *                   example: "Student ID and trigger type are required"
 *       '500':
 *         description: Failed to check badges
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
 *                   example: "Failed to check badges"
 *                 error:
 *                   type: string
 */
router.post("/check", authMiddleware.verifyToken, badgeController.checkBadges);

/**
 * @openapi
 * /badges/criteria:
 *   get:
 *     summary: Get available badge criteria
 *     description: Retrieves information about the different types of badge criteria
 *     tags:
 *       - Badges
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Badge criteria retrieved successfully
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
 *                     criteriaTypes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "points_threshold"
 *                           description:
 *                             type: string
 *                             example: "Awarded when student reaches a specific points total"
 *                           metadata:
 *                             type: object
 *                             properties:
 *                               threshold:
 *                                 type: string
 *                                 example: "Number of points required (e.g., 100)"
 *       '500':
 *         description: Failed to get badge criteria
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
 *                   example: "Failed to get badge criteria"
 *                 error:
 *                   type: string
 */
router.get(
  "/criteria",
  authMiddleware.verifyToken,
  badgeController.getBadgeCriteria
);

/**
 * @openapi
 * /badges/check-all/{studentId}:
 *   get:
 *     summary: Check all badge types for a student
 *     description: Performs a comprehensive check across all badge criteria for a specific student
 *     tags:
 *       - Badges
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: studentId
 *         in: path
 *         description: ID of the student to check
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Badge check completed successfully
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
 *                   example: "3 badges awarded"
 *                 data:
 *                   type: object
 *                   properties:
 *                     awardedBadges:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Badge'
 *       '400':
 *         description: Student ID is required
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
 *                   example: "Student ID is required"
 *       '500':
 *         description: Failed to check badges
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
 *                   example: "Failed to check badges"
 *                 error:
 *                   type: string
 */
router.get(
  "/check-all/:studentId",
  authMiddleware.verifyToken,
  badgeController.checkAllBadges
);

/**
 * @openapi
 * /badges/timeline/{studentId}:
 *   get:
 *     summary: Get achievement timeline for a student
 *     description: Retrieves a chronological history of badge achievements for a student
 *     tags:
 *       - Badges
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
 *         description: Achievement timeline retrieved successfully
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
 *                     student:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c85"
 *                         name:
 *                           type: string
 *                           example: "John Smith"
 *                         badgeCount:
 *                           type: integer
 *                           example: 12
 *                     timeline:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-01T08:30:00.000Z"
 *                           badgeId:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c88"
 *                           badgeName:
 *                             type: string
 *                             example: "Perfect Attendance"
 *                           badgeDescription:
 *                             type: string
 *                             example: "Awarded for maintaining perfect attendance for 30 days"
 *                           badgeImage:
 *                             type: string
 *                             example: "https://example.com/badges/attendance.png"
 *                           pointsAwarded:
 *                             type: number
 *                             example: 50
 *                           transaction:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c95"
 *       '404':
 *         description: Student not found
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
 *                   example: "Student not found"
 *       '500':
 *         description: Failed to get achievement timeline
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
 *                   example: "Failed to get achievement timeline"
 *                 error:
 *                   type: string
 */
router.get(
  "/timeline/:studentId",
  authMiddleware.verifyToken,
  badgeController.getAchievementTimeline
);

/**
 * @openapi
 * /badges/collections:
 *   get:
 *     summary: Get badge collections
 *     description: Retrieves all badge collections with their badges
 *     tags:
 *       - Badges
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Badge collections retrieved successfully
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
 *                       name:
 *                         type: string
 *                         example: "Attendance Badges"
 *                       badgeCount:
 *                         type: integer
 *                         example: 5
 *                       badges:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "60d21b4667d0d8992e610c88"
 *                             name:
 *                               type: string
 *                               example: "Perfect Attendance"
 *                             description:
 *                               type: string
 *                               example: "Awarded for maintaining perfect attendance for 30 days"
 *                             image:
 *                               type: string
 *                               example: "https://example.com/badges/attendance.png"
 *                             collectionOrder:
 *                               type: number
 *                               example: 1
 *                             conditions:
 *                               type: object
 *                             pointsBonus:
 *                               type: number
 *                               example: 50
 *       '500':
 *         description: Failed to get badge collections
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
 *                   example: "Failed to get badge collections"
 *                 error:
 *                   type: string
 */
router.get(
  "/collections",
  authMiddleware.verifyToken,
  badgeController.getBadgeCollections
);

/**
 * @openapi
 * /badges/collections:
 *   post:
 *     summary: Create or update a badge collection
 *     description: Creates or updates a collection of badges. Limited to platform admins.
 *     tags:
 *       - Badges
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Collection information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               badgeIds:
 *                 type: array
 *                 description: Array of badge IDs to include in the collection
 *                 items:
 *                   type: string
 *                 example: ["60d21b4667d0d8992e610c88", "60d21b4667d0d8992e610c89"]
 *               collectionName:
 *                 type: string
 *                 description: Name of the collection
 *                 example: "Attendance Badges"
 *             required:
 *               - badgeIds
 *               - collectionName
 *     responses:
 *       '200':
 *         description: Badge collection updated successfully
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
 *                   example: "Badges updated to collection \"Attendance Badges\""
 *                 data:
 *                   type: object
 *                   properties:
 *                     collection:
 *                       type: string
 *                       example: "Attendance Badges"
 *                     badgeCount:
 *                       type: integer
 *                       example: 2
 *       '400':
 *         description: Badge IDs array and collection name are required
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
 *                   example: "Badge IDs array and collection name are required"
 *       '403':
 *         description: Only platform administrators can manage badge collections
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
 *                   example: "Only platform administrators can manage badge collections"
 *       '500':
 *         description: Failed to update badge collection
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
 *                   example: "Failed to update badge collection"
 *                 error:
 *                   type: string
 */
router.post(
  "/collections",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  badgeController.updateBadgeCollection
);

/**
 * @openapi
 * /badges/collections/{id}:
 *   delete:
 *     summary: Remove a badge from a collection
 *     description: Removes a specific badge from its collection. Limited to platform admins.
 *     tags:
 *       - Badges
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the badge to remove from its collection
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Badge removed from collection successfully
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
 *                   example: "Badge removed from collection"
 *                 data:
 *                   type: object
 *                   properties:
 *                     badgeId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c88"
 *                     previousCollection:
 *                       type: string
 *                       example: "Attendance Badges"
 *       '403':
 *         description: Only platform administrators can manage badge collections
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
 *                   example: "Only platform administrators can manage badge collections"
 *       '404':
 *         description: Badge not found
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
 *                   example: "Badge not found"
 *       '500':
 *         description: Failed to remove badge from collection
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
 *                   example: "Failed to remove badge from collection"
 *                 error:
 *                   type: string
 */
router.delete(
  "/collections/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  badgeController.removeBadgeFromCollection
);
module.exports = router;
