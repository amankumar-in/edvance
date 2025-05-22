const express = require("express");
const studentController = require("../controllers/student.controller");
const authMiddleware = require("../middleware/auth.middleware");
const attendanceController = require("../controllers/attendance.controller");

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the student
 *         userId:
 *           type: string
 *           description: ID of the user record
 *         grade:
 *           type: number
 *           description: Student's grade level
 *         schoolId:
 *           type: string
 *           description: ID of the student's school (optional)
 *         parentIds:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs of parents linked to the student
 *         teacherIds:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs of teachers associated with the student
 *         pointsAccountId:
 *           type: string
 *           description: ID of the student's points account
 *         level:
 *           type: number
 *           description: Current student level
 *         badges:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs of badges earned by the student
 *         lastCheckInDate:
 *           type: string
 *           format: date-time
 *           description: Last attendance check-in date
 *         attendanceStreak:
 *           type: number
 *           description: Current consecutive attendance streak
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Record creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Record update timestamp
 */

/**
 * @openapi
 * /students/me:
 *   get:
 *     summary: Get current student profile
 *     description: Retrieves the student profile for the authenticated student user
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Student profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Student'
 *                     - type: object
 *                       properties:
 *                         parentIds:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               userId:
 *                                 type: object
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                         teacherIds:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               userId:
 *                                 type: object
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
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
 *         description: Failed to get student profile
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
 *                   example: "Failed to get student profile"
 *                 error:
 *                   type: string
 */
router.get(
  "/me",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student", "platform_admin"]),
  studentController.getStudentProfile
);

/**
 * @openapi
 * /students/{id}:
 *   get:
 *     summary: Get student by ID
 *     description: Retrieves a student profile by its ID
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Student's unique ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Student retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Student'
 *                     - type: object
 *                       properties:
 *                         userId:
 *                           type: object
 *                           properties:
 *                             firstName:
 *                               type: string
 *                             lastName:
 *                               type: string
 *                             email:
 *                               type: string
 *                             avatar:
 *                               type: string
 *                             dateOfBirth:
 *                               type: string
 *                               format: date
 *                         parentIds:
 *                           type: array
 *                           items:
 *                             type: object
 *                         teacherIds:
 *                           type: array
 *                           items:
 *                             type: object
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
 *         description: Failed to get student
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
 *                   example: "Failed to get student"
 *                 error:
 *                   type: string
 */
router.get(
  "/:id",
  authMiddleware.verifyToken,
  studentController.getStudentById
);

/**
 * @openapi
 * /students/profile:
 *   post:
 *     summary: Create student profile
 *     description: Creates a new student profile for the authenticated user
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Student profile data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               grade:
 *                 type: number
 *                 description: Student's grade level
 *                 example: 9
 *               schoolId:
 *                 type: string
 *                 description: ID of the school (optional)
 *                 example: "60d21b4667d0d8992e610c88"
 *     responses:
 *       '201':
 *         description: Student profile created successfully
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
 *                   example: "Student profile created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       '400':
 *         description: Student profile already exists
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
 *                   example: "Student profile already exists"
 *       '500':
 *         description: Failed to create student profile
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
 *                   example: "Failed to create student profile"
 *                 error:
 *                   type: string
 */
router.post(
  "/profile",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student", "platform_admin"]),
  studentController.createStudentProfile
);

/**
 * @openapi
 * /students/link/parent:
 *   post:
 *     summary: Link with parent
 *     description: Links a student account with a parent using a link code
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Parent link code
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parentLinkCode:
 *                 type: string
 *                 description: Link code from parent
 *                 example: "ABC123"
 *             required:
 *               - parentLinkCode
 *     responses:
 *       '200':
 *         description: Successfully linked with parent
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
 *                   example: "Successfully linked with parent"
 *                 data:
 *                   type: object
 *                   properties:
 *                     parentId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c89"
 *       '400':
 *         description: Invalid parent link code or already linked
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
 *                   example: "Parent link code is required"
 *       '404':
 *         description: Student profile not found or invalid parent link code
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
 *                   example: "Invalid parent link code"
 *       '500':
 *         description: Failed to link with parent
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
 *                   example: "Failed to link with parent"
 *                 error:
 *                   type: string
 */
router.post(
  "/link/parent",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student", "platform_admin"]),
  studentController.linkWithParent
);

/**
 * @openapi
 * /students/{id}:
 *   put:
 *     summary: Update student profile
 *     description: Updates a student's profile information
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Student's unique ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Student profile updates
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               grade:
 *                 type: number
 *                 description: Updated grade level
 *                 example: 10
 *               level:
 *                 type: number
 *                 description: Updated level (rarely set manually)
 *                 example: 2
 *     responses:
 *       '200':
 *         description: Student profile updated successfully
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
 *                   example: "Student profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Student'
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
 *         description: Failed to update student profile
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
 *                   example: "Failed to update student profile"
 *                 error:
 *                   type: string
 */
router.put(
  "/:id",
  authMiddleware.verifyToken,
  studentController.updateStudentProfile
);

/**
 * @openapi
 * /students/{id}/badges:
 *   get:
 *     summary: Get student badges
 *     description: Retrieves all badges earned by a student
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Student's unique ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Student badges retrieved successfully
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
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                       image:
 *                         type: string
 *                       pointsBonus:
 *                         type: number
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
 *         description: Failed to get student badges
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
 *                   example: "Failed to get student badges"
 *                 error:
 *                   type: string
 */
router.get(
  "/:id/badges",
  authMiddleware.verifyToken,
  studentController.getStudentBadges
);

/**
 * @openapi
 * /students/{id}/attendance:
 *   get:
 *     summary: Get student attendance
 *     description: Retrieves attendance records for a student
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Student's unique ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Student attendance retrieved successfully
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
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                         enum: [present, absent, tardy, excused]
 *                       recordedBy:
 *                         type: object
 *                         properties:
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *       '500':
 *         description: Failed to get attendance records
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
 *                   example: "Failed to get attendance records"
 *                 error:
 *                   type: string
 */
router.get(
  "/:id/attendance",
  authMiddleware.verifyToken,
  attendanceController.getStudentAttendance
);

/**
 * @openapi
 * /students/{id}/check-in:
 *   post:
 *     summary: Daily attendance check-in
 *     description: Records daily attendance check-in for a student
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Student's unique ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '201':
 *         description: Check-in successful
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
 *                   example: "Check-in successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     attendance:
 *                       type: object
 *                     pointsAwarded:
 *                       type: number
 *                       example: 5
 *                     currentStreak:
 *                       type: number
 *                       example: 7
 *       '400':
 *         description: Already checked in today
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
 *                   example: "Already checked in today"
 *       '404':
 *         description: Student not found or not authorized
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
 *                   example: "Student not found or not authorized"
 *       '500':
 *         description: Failed to check in
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
 *                   example: "Failed to check in"
 *                 error:
 *                   type: string
 */
router.post(
  "/:id/check-in",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student", "platform_admin"]),
  attendanceController.checkIn
);

/**
 * @openapi
 * /students/{id}/level:
 *   get:
 *     summary: Get student level info
 *     description: Retrieves the current level and progress information for a student
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Student's unique ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Student level info retrieved successfully
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
 *                     currentPoints:
 *                       type: number
 *                       example: 350
 *                     pointsNeededForNextLevel:
 *                       type: number
 *                       example: 150
 *                     progressPercentage:
 *                       type: number
 *                       example: 70
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
 *         description: Failed to get student level
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
 *                   example: "Failed to get student level"
 *                 error:
 *                   type: string
 */
router.get(
  "/:id/level",
  authMiddleware.verifyToken,
  studentController.getStudentLevel
);

/**
 * @openapi
 * /students/link/school:
 *   post:
 *     summary: Link with school
 *     description: Links a student account with a school using a school code
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: School join code
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
 *       '200':
 *         description: Successfully linked with school
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
 *                   example: "Successfully linked with school"
 *                 data:
 *                   type: object
 *                   properties:
 *                     schoolId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c87"
 *                     classId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c88"
 *       '400':
 *         description: Invalid school code or already enrolled
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
 *                   example: "School join code is required"
 *       '404':
 *         description: Student profile not found or invalid school code
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
 *         description: Failed to link with school
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
 *                   example: "Failed to link with school"
 *                 error:
 *                   type: string
 */
router.post(
  "/link/school",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student", "platform_admin"]),
  studentController.linkWithSchool
);

/**
 * @openapi
 * /students/{id}/points-account:
 *   patch:
 *     summary: Update student's points account ID
 *     description: Updates the reference to a student's points account (system use)
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Student's unique ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Points account information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pointsAccountId:
 *                 type: string
 *                 description: ID of the points account
 *                 example: "60d21b4667d0d8992e610c99"
 *             required:
 *               - pointsAccountId
 *     responses:
 *       '200':
 *         description: Points account ID updated successfully
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
 *                   example: "Points account ID updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     pointsAccountId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c99"
 *       '400':
 *         description: Points account ID is required
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
 *                   example: "Points account ID is required"
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
 *         description: Failed to update points account ID
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
 *                   example: "Failed to update points account ID"
 *                 error:
 *                   type: string
 */
router.patch(
  "/:id/points-account",
  authMiddleware.verifyToken,
  authMiddleware.checkRole([
    "platform_admin",
    "school_admin",
    "system",
    "student",
  ]),
  studentController.updatePointsAccount
);

/**
 * @openapi
 * /students/{id}/parent/{parentId}:
 *   delete:
 *     summary: Unlink student from parent
 *     description: Removes the relationship between a student and a parent
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Student's unique ID
 *         required: true
 *         schema:
 *           type: string
 *       - name: parentId
 *         in: path
 *         description: Parent's unique ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully unlinked student from parent
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
 *                   example: "Successfully unlinked student from parent"
 *       '400':
 *         description: Parent is not linked to this student
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
 *                   example: "Parent is not linked to this student"
 *       '403':
 *         description: Not authorized to unlink this relationship
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
 *                   example: "Not authorized to unlink this relationship"
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
 *         description: Failed to unlink from parent
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
 *                   example: "Failed to unlink from parent"
 *                 error:
 *                   type: string
 */
router.delete(
  "/:id/parent/:parentId",
  authMiddleware.verifyToken,
  studentController.unlinkFromParent
);

/**
 * @openapi
 * /students/{id}/school:
 *   delete:
 *     summary: Unlink student from school
 *     description: Removes the relationship between a student and their school
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Student's unique ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successfully unlinked student from school
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
 *                   example: "Successfully unlinked student from school"
 *       '400':
 *         description: Student is not linked to any school
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
 *                   example: "Student is not linked to any school"
 *       '403':
 *         description: Not authorized to unlink from school
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
 *                   example: "Not authorized to unlink from school"
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
 *         description: Failed to unlink from school
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
 *                   example: "Failed to unlink from school"
 *                 error:
 *                   type: string
 */
router.delete(
  "/:id/school",
  authMiddleware.verifyToken,
  studentController.unlinkFromSchool
);

/**
 * @openapi
 * /students/request-parent:
 *   post:
 *     summary: Request link with parent
 *     description: Initiates a request to link with a parent via email
 *     tags:
 *       - Students
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
  "/request-parent",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student"]),
  studentController.requestParentLink
);

/**
 * @openapi
 * /students/request-school:
 *   post:
 *     summary: Request link with school
 *     description: Initiates a request to link with a school using a school code
 *     tags:
 *       - Students
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
  "/request-school",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student"]),
  studentController.requestSchoolLink
);

router.get(
  "/user/:userId",
  authMiddleware.verifyToken,
  studentController.getStudentByUserId
);

/**
 * @openapi
 * /students/requests/parent:
 *   get:
 *     summary: Get parent link requests
 *     description: Retrieves all pending link requests from parents for the student
 *     tags:
 *       - Students
 *       - Link Requests
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
 *                       parentName:
 *                         type: string
 *                       parentEmail:
 *                         type: string
 *                       parentAvatar:
 *                         type: string
 *                       code:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       expiresAt:
 *                         type: string
 *                         format: date-time
 *       '404':
 *         description: Student profile not found
 *       '500':
 *         description: Failed to get link requests
 */
router.get(
  "/requests/parent",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student"]),
  studentController.getParentLinkRequests
);

/**
 * @openapi
 * /students/requests/parent/{requestId}:
 *   post:
 *     summary: Respond to parent link request
 *     description: Approve or reject a link request from a parent
 *     tags:
 *       - Students
 *       - Link Requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: requestId
 *         in: path
 *         description: Link request ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *                 description: Action to take on the request
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
 *         description: Invalid request
 *       '404':
 *         description: Link request not found
 *       '500':
 *         description: Failed to process link request
 */
router.post(
  "/requests/parent/:requestId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student"]),
  studentController.respondToParentLinkRequest
);

module.exports = router;
