const express = require("express");
const teacherController = require("../controllers/teacher.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     TeacherProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the teacher profile
 *         userId:
 *           type: string
 *           description: Reference to the user account
 *         schoolId:
 *           type: string
 *           description: Reference to the school
 *         classIds:
 *           type: array
 *           items:
 *             type: string
 *           description: List of classes taught by the teacher
 *         subjectsTaught:
 *           type: array
 *           items:
 *             type: string
 *           description: List of subjects taught by the teacher
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
 * /teachers/me:
 *   get:
 *     summary: Get current teacher profile
 *     description: Retrieves the profile for the currently authenticated teacher user
 *     tags:
 *       - Teachers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Teacher profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TeacherProfile'
 *       '404':
 *         description: Teacher profile not found
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
 *                   example: "Teacher profile not found"
 *       '500':
 *         description: Failed to get teacher profile
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
 *                   example: "Failed to get teacher profile"
 *                 error:
 *                   type: string
 */
router.get(
  "/me",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "platform_admin"]),
  teacherController.getTeacherProfile
);

/**
 * @openapi
 * /teachers/me/classes:
 *   get:
 *     summary: Get classes for current teacher
 *     description: Retrieves all classes associated with the currently authenticated teacher
 *     tags:
 *       - Teachers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Classes retrieved successfully
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
 *                         example: "60d21b4667d0d8992e610c88"
 *                       name:
 *                         type: string
 *                         example: "5th Grade Math"
 *                       grade:
 *                         type: number
 *                         example: 5
 *                       schoolId:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c80"
 *                       teacherId:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c82"
 *                       studentIds:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["60d21b4667d0d8992e610c85", "60d21b4667d0d8992e610c86"]
 *                       joinCode:
 *                         type: string
 *                         example: "ABC123"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       '404':
 *         description: Teacher profile not found
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
 *                   example: "Teacher profile not found"
 *       '500':
 *         description: Failed to get classes
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
 *                   example: "Failed to get classes"
 *                 error:
 *                   type: string
 */
router.get(
  "/me/classes",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "platform_admin"]),
  teacherController.getClasses
);

/**
 * @openapi
 * /teachers/profile:
 *   post:
 *     summary: Create teacher profile
 *     description: Creates a new teacher profile for the authenticated user
 *     tags:
 *       - Teachers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Teacher profile information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schoolId:
 *                 type: string
 *                 description: ID of the school where the teacher works
 *                 example: "60d21b4667d0d8992e610c80"
 *               subjectsTaught:
 *                 type: array
 *                 description: List of subjects taught by the teacher
 *                 items:
 *                   type: string
 *                 example: ["Math", "Science"]
 *             required:
 *               - schoolId
 *     responses:
 *       '201':
 *         description: Teacher profile created successfully
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
 *                   example: "Teacher profile created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/TeacherProfile'
 *       '400':
 *         description: Teacher profile already exists
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
 *                   example: "Teacher profile already exists"
 *       '500':
 *         description: Failed to create teacher profile
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
 *                   example: "Failed to create teacher profile"
 *                 error:
 *                   type: string
 */
router.post(
  "/profile",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "platform_admin"]),
  teacherController.createTeacherProfile
);

/**
 * @openapi
 * /teachers/{id}:
 *   put:
 *     summary: Update teacher profile
 *     description: Updates an existing teacher profile
 *     tags:
 *       - Teachers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the teacher profile to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated teacher information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subjectsTaught:
 *                 type: array
 *                 description: Updated list of subjects taught by the teacher
 *                 items:
 *                   type: string
 *                 example: ["Math", "Science", "Computer Science"]
 *     responses:
 *       '200':
 *         description: Teacher profile updated successfully
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
 *                   example: "Teacher profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/TeacherProfile'
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
 *         description: Teacher profile not found
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
 *                   example: "Teacher profile not found"
 *       '500':
 *         description: Failed to update teacher profile
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
 *                   example: "Failed to update teacher profile"
 *                 error:
 *                   type: string
 */
router.put(
  "/:id",
  authMiddleware.verifyToken,
  teacherController.updateTeacherProfile
);

router.get(
  "/:id",
  authMiddleware.verifyToken,
  teacherController.getTeacherById
);

// ==================== ANALYTICS ROUTES ====================
router.get(
  "/",
  authMiddleware.verifyToken,
  teacherController.getAllTeachers
);

module.exports = router;
