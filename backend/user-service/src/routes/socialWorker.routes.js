const express = require("express");
const socialWorkerController = require("../controllers/socialWorker.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     SocialWorker:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the social worker profile
 *         userId:
 *           type: string
 *           description: User ID associated with this profile
 *         assignedChildIds:
 *           type: array
 *           description: IDs of students assigned to this social worker
 *           items:
 *             type: string
 *         organization:
 *           type: string
 *           description: Organization the social worker belongs to
 *         caseloadLimit:
 *           type: number
 *           description: Maximum number of children this social worker can manage
 *         caseNotes:
 *           type: array
 *           description: Notes for assigned children
 *           items:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: ID of the student the note is about
 *               note:
 *                 type: string
 *                 description: Content of the case note
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date the note was created
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Profile creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Profile update timestamp
 */

/**
 * @openapi
 * /social-workers/me:
 *   get:
 *     summary: Get current social worker profile
 *     description: Retrieves the profile of the currently authenticated social worker
 *     tags:
 *       - Social Workers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Social worker profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SocialWorker'
 *       '404':
 *         description: Social worker profile not found
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
 *                   example: "Social worker profile not found"
 *       '500':
 *         description: Failed to get social worker profile
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
 *                   example: "Failed to get social worker profile"
 *                 error:
 *                   type: string
 */
router.get(
  "/me",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["social_worker", "platform_admin"]),
  socialWorkerController.getSocialWorkerProfile
);

/**
 * @openapi
 * /social-workers/me/children:
 *   get:
 *     summary: Get children assigned to current social worker
 *     description: Retrieves all children assigned to the currently authenticated social worker
 *     tags:
 *       - Social Workers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Assigned children retrieved successfully
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
 *                         description: Student ID
 *                       userId:
 *                         type: object
 *                         properties:
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                           dateOfBirth:
 *                             type: string
 *                             format: date-time
 *                       grade:
 *                         type: number
 *                       schoolId:
 *                         type: string
 *       '404':
 *         description: Social worker profile not found
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
 *                   example: "Social worker profile not found"
 *       '500':
 *         description: Failed to get assigned children
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
 *                   example: "Failed to get assigned children"
 *                 error:
 *                   type: string
 */
router.get(
  "/me/children",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["social_worker", "platform_admin"]),
  socialWorkerController.getAssignedChildren
);

/**
 * @openapi
 * /social-workers/profile:
 *   post:
 *     summary: Create social worker profile
 *     description: Creates a new social worker profile for the authenticated user
 *     tags:
 *       - Social Workers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Social worker profile information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organization:
 *                 type: string
 *                 description: Organization the social worker belongs to
 *                 example: "Child Services Department"
 *               caseloadLimit:
 *                 type: number
 *                 description: Maximum number of cases to handle
 *                 example: 20
 *     responses:
 *       '201':
 *         description: Social worker profile created successfully
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
 *                   example: "Social worker profile created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SocialWorker'
 *       '400':
 *         description: Social worker profile already exists
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
 *                   example: "Social worker profile already exists"
 *       '500':
 *         description: Failed to create social worker profile
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
 *                   example: "Failed to create social worker profile"
 *                 error:
 *                   type: string
 */
router.post(
  "/profile",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["social_worker", "platform_admin"]),
  socialWorkerController.createSocialWorkerProfile
);

/**
 * @openapi
 * /social-workers/{id}:
 *   put:
 *     summary: Update social worker profile
 *     description: Updates an existing social worker profile. Limited to the profile owner and platform admins.
 *     tags:
 *       - Social Workers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Social worker profile ID
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
 *               organization:
 *                 type: string
 *                 description: Organization the social worker belongs to
 *                 example: "Child Services Department"
 *               caseloadLimit:
 *                 type: number
 *                 description: Maximum number of cases to handle
 *                 example: 25
 *     responses:
 *       '200':
 *         description: Social worker profile updated successfully
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
 *                   example: "Social worker profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SocialWorker'
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
 *         description: Social worker profile not found
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
 *                   example: "Social worker profile not found"
 *       '500':
 *         description: Failed to update social worker profile
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
 *                   example: "Failed to update social worker profile"
 *                 error:
 *                   type: string
 */
router.put(
  "/:id",
  authMiddleware.verifyToken,
  socialWorkerController.updateSocialWorkerProfile
);

/**
 * @openapi
 * /social-workers/{id}/children:
 *   post:
 *     summary: Assign child to social worker
 *     description: Assigns a student to a social worker's caseload
 *     tags:
 *       - Social Workers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Social worker profile ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Student assignment information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: ID of student to assign
 *                 example: "60d21b4667d0d8992e610c85"
 *             required:
 *               - studentId
 *     responses:
 *       '200':
 *         description: Student assigned successfully
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
 *                   example: "Student assigned to social worker successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SocialWorker'
 *       '400':
 *         description: Student already assigned or caseload limit reached
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
 *                   example: "Student is already assigned to this social worker"
 *       '403':
 *         description: Not authorized to modify assignments
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
 *                   example: "Not authorized to modify this social worker's assignments"
 *       '404':
 *         description: Social worker profile or student not found
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
 *                   example: "Social worker profile not found"
 *       '500':
 *         description: Failed to assign child
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
 *                   example: "Failed to assign child to social worker"
 *                 error:
 *                   type: string
 */
router.post(
  "/:id/children",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["social_worker", "platform_admin"]),
  socialWorkerController.assignChild
);

/**
 * @openapi
 * /social-workers/{id}/children/{childId}:
 *   delete:
 *     summary: Remove child from social worker
 *     description: Removes a student from a social worker's caseload
 *     tags:
 *       - Social Workers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Social worker profile ID
 *         required: true
 *         schema:
 *           type: string
 *       - name: childId
 *         in: path
 *         description: Student ID to remove
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Student removed successfully
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
 *                   example: "Student removed from social worker successfully"
 *       '400':
 *         description: Student not assigned to this social worker
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
 *                   example: "Student is not assigned to this social worker"
 *       '403':
 *         description: Not authorized to modify assignments
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
 *                   example: "Not authorized to modify this social worker's assignments"
 *       '404':
 *         description: Social worker profile not found
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
 *                   example: "Social worker profile not found"
 *       '500':
 *         description: Failed to remove child
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
 *                   example: "Failed to remove child from social worker"
 *                 error:
 *                   type: string
 */
router.delete(
  "/:id/children/:childId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["social_worker", "platform_admin"]),
  socialWorkerController.removeChild
);

/**
 * @openapi
 * /social-workers/{id}/case-notes:
 *   post:
 *     summary: Add case note for a child
 *     description: Creates a new case note for an assigned student
 *     tags:
 *       - Social Workers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Social worker profile ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Case note information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: ID of the student the note is about
 *                 example: "60d21b4667d0d8992e610c85"
 *               note:
 *                 type: string
 *                 description: Content of the case note
 *                 example: "Meeting with student went well. Discussed academic progress and set goals for the semester."
 *             required:
 *               - studentId
 *               - note
 *     responses:
 *       '201':
 *         description: Case note added successfully
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
 *                   example: "Case note added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     note:
 *                       type: string
 *                       example: "Meeting with student went well. Discussed academic progress and set goals for the semester."
 *                     date:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: Missing fields or student not assigned
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
 *                   example: "Student ID and note are required"
 *       '403':
 *         description: Not authorized to add case notes
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
 *                   example: "Not authorized to add case notes for this social worker"
 *       '404':
 *         description: Social worker profile not found
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
 *                   example: "Social worker profile not found"
 *       '500':
 *         description: Failed to add case note
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
 *                   example: "Failed to add case note"
 *                 error:
 *                   type: string
 */
router.post(
  "/:id/case-notes",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["social_worker", "platform_admin"]),
  socialWorkerController.addCaseNote
);

/**
 * @openapi
 * /social-workers/{id}/case-notes/{studentId}:
 *   get:
 *     summary: Get case notes for a specific child
 *     description: Retrieves all case notes for a specific student assigned to the social worker
 *     tags:
 *       - Social Workers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Social worker profile ID
 *         required: true
 *         schema:
 *           type: string
 *       - name: studentId
 *         in: path
 *         description: Student ID to get notes for
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Case notes retrieved successfully
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
 *                       studentId:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c85"
 *                       note:
 *                         type: string
 *                         example: "Meeting with student went well. Discussed academic progress and set goals for the semester."
 *                       date:
 *                         type: string
 *                         format: date-time
 *       '400':
 *         description: Student not assigned to this social worker
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
 *                   example: "Student is not assigned to this social worker"
 *       '403':
 *         description: Not authorized to view case notes
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
 *                   example: "Not authorized to view case notes for this social worker"
 *       '404':
 *         description: Social worker profile not found
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
 *                   example: "Social worker profile not found"
 *       '500':
 *         description: Failed to get case notes
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
 *                   example: "Failed to get case notes"
 *                 error:
 *                   type: string
 */
router.get(
  "/:id/case-notes/:studentId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["social_worker", "platform_admin"]),
  socialWorkerController.getCaseNotes
);

router.get(
  "/user/:id",
  authMiddleware.verifyToken,
  socialWorkerController.getSocialWorkerProfileById
);

module.exports = router;
