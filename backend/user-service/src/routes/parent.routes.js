const express = require("express");
const parentController = require("../controllers/parent.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Parent:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the parent profile
 *         userId:
 *           type: string
 *           description: ID of the associated user account
 *         childIds:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of child/student IDs linked to this parent
 *         tuitPoints:
 *           type: number
 *           description: TUIT points earned by parent
 *           default: 0
 *         linkCode:
 *           type: string
 *           description: Code used for linking with student accounts
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Profile creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Profile update timestamp
 *     Child:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the student
 *         userId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             email:
 *               type: string
 *             avatar:
 *               type: string
 *             dateOfBirth:
 *               type: string
 *               format: date-time
 *         grade:
 *           type: number
 *           description: Student's grade level
 *         schoolId:
 *           type: string
 *           description: ID of the student's school (if any)
 *         level:
 *           type: number
 *           description: Student's current level
 *         attendanceStreak:
 *           type: number
 *           description: Current attendance streak
 */

/**
 * @openapi
 * /parents/me:
 *   get:
 *     summary: Get parent profile
 *     description: Retrieves the authenticated user's parent profile
 *     tags:
 *       - Parents
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Parent profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Parent'
 *       '404':
 *         description: Parent profile not found
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
 *                   example: "Parent profile not found"
 *       '500':
 *         description: Server error
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
 *                   example: "Failed to get parent profile"
 *                 error:
 *                   type: string
 */
router.get(
  "/me",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["parent", "platform_admin"]),
  parentController.getParentProfile
);

/**
 * @openapi
 * /parents/me/children:
 *   get:
 *     summary: Get all children
 *     description: Retrieves all children linked to the authenticated parent
 *     tags:
 *       - Parents
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Children retrieved successfully
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
 *                     $ref: '#/components/schemas/Child'
 *       '404':
 *         description: Parent profile not found
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
 *                   example: "Parent profile not found"
 *       '500':
 *         description: Server error
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
 *                   example: "Failed to get children"
 *                 error:
 *                   type: string
 */
router.get(
  "/me/children",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["parent", "platform_admin"]),
  parentController.getChildren
);

/**
 * @openapi
 * /parents/children:
 *   post:
 *     summary: Add child (create or link)
 *     description: Creates a new child account or links with an existing one
 *     tags:
 *       - Parents
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Child information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               childEmail:
 *                 type: string
 *                 format: email
 *                 description: Email of existing child account (optional)
 *                 example: "child@example.com"
 *               childName:
 *                 type: string
 *                 description: Full name of child (required when creating new account)
 *                 example: "John Doe"
 *               childAge:
 *                 type: number
 *                 description: Age of child (optional)
 *                 example: 12
 *               grade:
 *                 type: number
 *                 description: Grade level of child (optional)
 *                 example: 7
 *             required:
 *               - childName
 *     responses:
 *       '201':
 *         description: Child added successfully
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
 *                   example: "Child added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     childId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     userId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c84"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe.1632908361234@placeholder.com"
 *                     grade:
 *                       type: number
 *                       example: 7
 *       '404':
 *         description: Parent profile not found
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
 *                   example: "Parent profile not found"
 *       '500':
 *         description: Server error
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
 *                   example: "Failed to add child"
 *                 error:
 *                   type: string
 */
router.post(
  "/children",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["parent", "platform_admin"]),
  parentController.addChild
);

/**
 * @openapi
 * /parents/profile:
 *   post:
 *     summary: Create parent profile
 *     description: Creates a new parent profile for the authenticated user
 *     tags:
 *       - Parents
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '201':
 *         description: Parent profile created successfully
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
 *                   example: "Parent profile created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Parent'
 *       '400':
 *         description: Parent profile already exists
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
 *                   example: "Parent profile already exists"
 *       '500':
 *         description: Server error
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
 *                   example: "Failed to create parent profile"
 *                 error:
 *                   type: string
 */
router.post(
  "/profile",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["parent", "platform_admin"]),
  parentController.createParentProfile
);

/**
 * @openapi
 * /parents/{id}:
 *   put:
 *     summary: Update parent profile
 *     description: Update a parent profile (own profile or as admin)
 *     tags:
 *       - Parents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Parent ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated profile information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tuitPoints:
 *                 type: number
 *                 description: Updated TUIT points
 *                 example: 100
 *     responses:
 *       '200':
 *         description: Parent profile updated successfully
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
 *                   example: "Parent profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Parent'
 *       '403':
 *         description: Not authorized to update this profile
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
 *                   example: "Not authorized to update this profile"
 *       '404':
 *         description: Parent profile not found
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
 *                   example: "Parent profile not found"
 *       '500':
 *         description: Server error
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
 *                   example: "Failed to update parent profile"
 *                 error:
 *                   type: string
 */
router.put(
  "/:id",
  authMiddleware.verifyToken,
  parentController.updateParentProfile
);

/**
 * @openapi
 * /parents/link-code:
 *   post:
 *     summary: Generate link code
 *     description: Generates a new code for linking with student accounts
 *     tags:
 *       - Parents
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Link code generated successfully
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
 *                   example: "Link code generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     linkCode:
 *                       type: string
 *                       example: "ABC123"
 *       '404':
 *         description: Parent profile not found
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
 *                   example: "Parent profile not found"
 *       '500':
 *         description: Server error
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
 *                   example: "Failed to generate link code"
 *                 error:
 *                   type: string
 */
router.post(
  "/link-code",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["parent", "platform_admin"]),
  parentController.generateLinkCode
);

/**
 * @openapi
 * /parents/children/{childId}:
 *   delete:
 *     summary: Remove child from parent
 *     description: Removes the link between parent and child
 *     tags:
 *       - Parents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: childId
 *         in: path
 *         description: ID of the child to remove
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Child removed successfully
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
 *                   example: "Successfully removed child from parent"
 *       '400':
 *         description: Child is not linked to this parent
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
 *                   example: "Child is not linked to this parent"
 *       '404':
 *         description: Parent profile not found
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
 *                   example: "Parent profile not found"
 *       '500':
 *         description: Server error
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
 *                   example: "Failed to remove child from parent"
 *                 error:
 *                   type: string
 */
router.delete(
  "/children/:childId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["parent", "platform_admin"]),
  parentController.removeChild
);

/**
 * @openapi
 * /parents/link-requests:
 *   get:
 *     summary: Get pending link requests
 *     description: Retrieves pending student-parent link requests for the authenticated parent
 *     tags:
 *       - Parents
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Link requests retrieved successfully
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
 *                       _id:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c99"
 *                       studentId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           userId:
 *                             type: string
 *                       requestType:
 *                         type: string
 *                         example: "parent"
 *                       targetEmail:
 *                         type: string
 *                         example: "parent@example.com"
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       code:
 *                         type: string
 *                         example: "DEF456"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       expiresAt:
 *                         type: string
 *                         format: date-time
 *                       studentName:
 *                         type: string
 *                         example: "Jane Smith"
 *       '404':
 *         description: Parent profile not found
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
 *                   example: "Parent profile not found"
 *       '500':
 *         description: Server error
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
 *                   example: "Failed to get pending link requests"
 *                 error:
 *                   type: string
 */
router.get(
  "/link-requests",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["parent"]),
  parentController.getPendingLinkRequests
);

/**
 * @openapi
 * /parents/link-requests/{requestId}:
 *   post:
 *     summary: Respond to a link request
 *     description: Approve or reject a student-parent link request
 *     tags:
 *       - Parents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestId
 *         in: path
 *         description: ID of the link request
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Response to the link request
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *                 description: Action to take on the request
 *                 example: "approve"
 *             required:
 *               - action
 *     responses:
 *       '200':
 *         description: Link request processed successfully
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
 *                   example: "Link request approved successfully"
 *       '400':
 *         description: Invalid action or missing parameters
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
 *                   example: "Action must be either 'approve' or 'reject'"
 *       '404':
 *         description: Parent profile not found or link request not found
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
 *                   example: "Link request not found or already processed"
 *       '500':
 *         description: Server error
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
 *                   example: "Failed to respond to link request"
 *                 error:
 *                   type: string
 */
router.post(
  "/link-requests/:requestId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["parent"]),
  parentController.respondToLinkRequest
);

module.exports = router;
