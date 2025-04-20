const express = require("express");
const linkRequestController = require("../controllers/linkRequest.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     LinkRequest:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the link request
 *         studentId:
 *           type: string
 *           description: ID of the student making the request
 *         requestType:
 *           type: string
 *           enum: [parent, school]
 *           description: Type of link request
 *         targetId:
 *           type: string
 *           description: ID of the parent or school being linked to
 *         targetEmail:
 *           type: string
 *           description: Email address for invitation if no existing account
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, expired]
 *           description: Current status of the request
 *         code:
 *           type: string
 *           description: Unique code for manual linking
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Request creation timestamp
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Request expiration timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @openapi
 * /link-requests/parent:
 *   post:
 *     summary: Request to link with a parent
 *     description: Student creates a request to link their account with a parent's account
 *     tags:
 *       - Link Requests
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Parent email information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parentEmail:
 *                 type: string
 *                 format: email
 *                 description: Email address of the parent to link with
 *                 example: "parent@example.com"
 *             required:
 *               - parentEmail
 *     responses:
 *       '201':
 *         description: Parent link request created successfully
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
 *                   example: "Parent link request created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     requestId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c95"
 *                     code:
 *                       type: string
 *                       example: "A5C7D9"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: Parent email is required
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
 *                   example: "Parent email is required"
 *       '404':
 *         description: Student profile not found
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
 *                   example: "Student profile not found"
 *       '500':
 *         description: Failed to request parent link
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
 *                   example: "Failed to request parent link"
 *                 error:
 *                   type: string
 */
router.post(
  "/parent",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student"]),
  linkRequestController.requestParentLink
);

/**
 * @openapi
 * /link-requests/school:
 *   post:
 *     summary: Request to link with a school
 *     description: Student creates a request to link their account with a school using a class/school code
 *     tags:
 *       - Link Requests
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: School code information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schoolCode:
 *                 type: string
 *                 description: Join code for the school/class
 *                 example: "XYZ123"
 *             required:
 *               - schoolCode
 *     responses:
 *       '201':
 *         description: School link request created successfully
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
 *                   example: "School link request created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     requestId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c97"
 *                     schoolName:
 *                       type: string
 *                       example: "Springfield Elementary"
 *                     className:
 *                       type: string
 *                       example: "5th Grade - Room 2B"
 *                     code:
 *                       type: string
 *                       example: "B3D7F9"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: School code is required
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
 *                   example: "School code is required"
 *       '404':
 *         description: Invalid school code or student profile not found
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
 *                   example: "Invalid school code"
 *       '500':
 *         description: Failed to request school link
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
 *                   example: "Failed to request school link"
 *                 error:
 *                   type: string
 */
router.post(
  "/school",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student"]),
  linkRequestController.requestSchoolLink
);

/**
 * @openapi
 * /link-requests/pending:
 *   get:
 *     summary: Get pending link requests
 *     description: Retrieves all pending link requests initiated by the student
 *     tags:
 *       - Link Requests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Pending requests retrieved successfully
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
 *                     $ref: '#/components/schemas/LinkRequest'
 *       '404':
 *         description: Student profile not found
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
 *                   example: "Student profile not found"
 *       '500':
 *         description: Failed to get pending link requests
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
  "/pending",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student"]),
  linkRequestController.getPendingRequests
);

/**
 * @openapi
 * /link-requests/{requestId}:
 *   delete:
 *     summary: Cancel a link request
 *     description: Cancels a pending link request initiated by the student
 *     tags:
 *       - Link Requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestId
 *         in: path
 *         description: ID of the link request to cancel
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Link request cancelled successfully
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
 *                   example: "Link request cancelled successfully"
 *       '404':
 *         description: Link request not found or already processed
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
 *         description: Failed to cancel link request
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
 *                   example: "Failed to cancel link request"
 *                 error:
 *                   type: string
 */
router.delete(
  "/:requestId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student"]),
  linkRequestController.cancelRequest
);

module.exports = router;
