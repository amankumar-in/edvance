// attendance.routes.js
const express = require("express");
const attendanceController = require("../controllers/attendance.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the attendance record
 *         studentId:
 *           type: string
 *           description: ID of the student
 *         schoolId:
 *           type: string
 *           description: ID of the school (optional)
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date for the attendance record
 *         status:
 *           type: string
 *           enum: [present, absent, tardy, excused]
 *           description: Attendance status
 *         recordedBy:
 *           type: string
 *           description: ID of the user who recorded the attendance
 *         recordedByRole:
 *           type: string
 *           enum: [teacher, parent, student, system]
 *           description: Role of the user who recorded the attendance
 *         pointsAwarded:
 *           type: number
 *           description: Points awarded for this attendance record
 *         comments:
 *           type: string
 *           description: Additional comments or notes
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
 * /attendance:
 *   get:
 *     summary: Get all attendance records with filters
 *     description: Retrieve attendance records with optional filtering. Limited to teachers, school admins, platform admins, and parents.
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: studentId
 *         in: query
 *         description: Filter by student ID
 *         schema:
 *           type: string
 *       - name: schoolId
 *         in: query
 *         description: Filter by school ID
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
 *       - name: status
 *         in: query
 *         description: Filter by attendance status
 *         schema:
 *           type: string
 *           enum: [present, absent, tardy, excused]
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
 *         description: Attendance records retrieved successfully
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
 *                     records:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Attendance'
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
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkRole([
    "teacher",
    "school_admin",
    "platform_admin",
    "parent",
  ]),
  attendanceController.getAllAttendance
);

/**
 * @openapi
 * /attendance/today:
 *   get:
 *     summary: Get today's attendance for a class
 *     description: Retrieves the attendance status for all students in a specific class for today.
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: classId
 *         in: query
 *         description: ID of the class
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Today's attendance retrieved successfully
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
 *                     class:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "60d21b4667d0d8992e610c88"
 *                         name:
 *                           type: string
 *                           example: "5th Grade - Room 2B"
 *                         grade:
 *                           type: number
 *                           example: 5
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2023-10-05T00:00:00.000Z"
 *                     attendance:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           studentId:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c85"
 *                           studentName:
 *                             type: string
 *                             example: "John Smith"
 *                           status:
 *                             type: string
 *                             enum: [present, absent, tardy, excused, not_recorded]
 *                             example: "present"
 *                           recordId:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c90"
 *       '400':
 *         description: Class ID is required
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
 *                   example: "Class ID is required"
 *       '404':
 *         description: Class not found
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
 *                   example: "Class not found"
 *       '500':
 *         description: Failed to get today's attendance
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
 *                   example: "Failed to get today's attendance"
 *                 error:
 *                   type: string
 */
router.get(
  "/today",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  attendanceController.getTodayAttendance
);

/**
 * @openapi
 * /attendance/report:
 *   get:
 *     summary: Generate attendance report
 *     description: Generates a comprehensive attendance report with filtering options
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: schoolId
 *         in: query
 *         description: Filter by school ID
 *         schema:
 *           type: string
 *       - name: classId
 *         in: query
 *         description: Filter by class ID
 *         schema:
 *           type: string
 *       - name: startDate
 *         in: query
 *         description: Start date for report (YYYY-MM-DD)
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         description: End date for report (YYYY-MM-DD)
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       '200':
 *         description: Report generated successfully
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
 *                     dateRange:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                           example: "2023-10-01"
 *                         end:
 *                           type: string
 *                           format: date
 *                           example: "2023-10-31"
 *                         totalDays:
 *                           type: integer
 *                           example: 31
 *                     students:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           studentId:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c85"
 *                           studentName:
 *                             type: string
 *                             example: "John Smith"
 *                           totalDays:
 *                             type: integer
 *                             example: 31
 *                           present:
 *                             type: integer
 *                             example: 28
 *                           absent:
 *                             type: integer
 *                             example: 1
 *                           tardy:
 *                             type: integer
 *                             example: 1
 *                           excused:
 *                             type: integer
 *                             example: 1
 *                           percentage:
 *                             type: number
 *                             example: 90
 *                           days:
 *                             type: object
 *                             additionalProperties:
 *                               type: string
 *                               enum: [present, absent, tardy, excused, none]
 *       '400':
 *         description: Start date and end date are required
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
 *                   example: "Start date and end date are required"
 *       '404':
 *         description: Class not found
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
 *                   example: "Class not found"
 *       '500':
 *         description: Failed to generate attendance report
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
 *                   example: "Failed to generate attendance report"
 *                 error:
 *                   type: string
 */
router.get(
  "/report",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  attendanceController.generateReport
);

/**
 * @openapi
 * /attendance:
 *   post:
 *     summary: Record attendance for a student
 *     description: Records attendance for a single student. Limited to teachers, school admins, and platform admins.
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Attendance record details
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
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date for attendance (defaults to today if not provided)
 *                 example: "2023-10-05"
 *               status:
 *                 type: string
 *                 enum: [present, absent, tardy, excused]
 *                 description: Attendance status
 *                 example: "present"
 *               comments:
 *                 type: string
 *                 description: Additional comments (optional)
 *                 example: "Arrived on time"
 *             required:
 *               - studentId
 *               - status
 *     responses:
 *       '200':
 *         description: Attendance recorded successfully
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
 *                   example: "Attendance recorded successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Attendance'
 *       '400':
 *         description: Student ID and status are required
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
 *                   example: "Student ID and status are required"
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
 *         description: Failed to record attendance
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
 *                   example: "Failed to record attendance"
 *                 error:
 *                   type: string
 */
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  attendanceController.recordAttendance
);

/**
 * @openapi
 * /attendance/bulk:
 *   post:
 *     summary: Record attendance for multiple students
 *     description: Records attendance for multiple students at once. Limited to teachers, school admins, and platform admins.
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Bulk attendance records
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               records:
 *                 type: array
 *                 description: Array of attendance records
 *                 items:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: string
 *                       description: ID of the student
 *                       example: "60d21b4667d0d8992e610c85"
 *                     status:
 *                       type: string
 *                       enum: [present, absent, tardy, excused]
 *                       description: Attendance status
 *                       example: "present"
 *                     comments:
 *                       type: string
 *                       description: Optional comments
 *                       example: "Arrived on time"
 *                   required:
 *                     - studentId
 *                     - status
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date for all records (defaults to today if not provided)
 *                 example: "2023-10-05"
 *             required:
 *               - records
 *     responses:
 *       '200':
 *         description: Bulk attendance processed successfully
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
 *                   example: "Processed 25 attendance records, 0 failed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           studentId:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c85"
 *                           status:
 *                             type: string
 *                             example: "present"
 *                           date:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-05T00:00:00.000Z"
 *                     failed:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           studentId:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c99"
 *                           error:
 *                             type: string
 *                             example: "Student not found"
 *       '400':
 *         description: Attendance records are required
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
 *                   example: "Attendance records are required"
 *       '500':
 *         description: Failed to process bulk attendance
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
 *                   example: "Failed to process bulk attendance"
 *                 error:
 *                   type: string
 */
router.post(
  "/bulk",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  attendanceController.recordBulkAttendance
);

/**
 * @openapi
 * /attendance/{id}:
 *   get:
 *     summary: Get attendance records for a specific student
 *     description: Retrieves a student's attendance records with optional date range filtering
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Student ID
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
 *         description: Attendance records retrieved successfully
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
 *                     $ref: '#/components/schemas/Attendance'
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
  "/:id",
  authMiddleware.verifyToken,
  attendanceController.getStudentAttendance
);

/**
 * @openapi
 * /attendance/{id}/check-in:
 *   post:
 *     summary: Record daily check-in for a student
 *     description: Allows a student to check in for attendance. Also accessible to teachers, admins, and parents.
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Student ID
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
 *                       $ref: '#/components/schemas/Attendance'
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
  authMiddleware.checkRole([
    "student",
    "teacher",
    "school_admin",
    "platform_admin",
    "parent",
  ]),
  attendanceController.checkIn
);

/**
 * @openapi
 * /attendance/{id}/summary:
 *   get:
 *     summary: Get attendance summary with points
 *     description: Retrieves a summary of attendance records with points earned for a student
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Student ID
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
 *         description: Attendance summary retrieved successfully
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
 *                         currentStreak:
 *                           type: number
 *                           example: 7
 *                         longestStreak:
 *                           type: number
 *                           example: 15
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalDays:
 *                           type: number
 *                           example: 30
 *                         present:
 *                           type: number
 *                           example: 27
 *                         absent:
 *                           type: number
 *                           example: 1
 *                         tardy:
 *                           type: number
 *                           example: 1
 *                         excused:
 *                           type: number
 *                           example: 1
 *                         attendanceRate:
 *                           type: number
 *                           example: 90
 *                         pointsEarned:
 *                           type: number
 *                           example: 135
 *                     records:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c90"
 *                           date:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-10-05T00:00:00.000Z"
 *                           status:
 *                             type: string
 *                             enum: [present, absent, tardy, excused]
 *                             example: "present"
 *                           points:
 *                             type: number
 *                             example: 5
 *                           recordedBy:
 *                             type: string
 *                             example: "student"
 *                           comments:
 *                             type: string
 *                             example: "Self check-in"
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
 *         description: Failed to get attendance summary
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
 *                   example: "Failed to get attendance summary"
 *                 error:
 *                   type: string
 */
router.get(
  "/:id/summary",
  authMiddleware.verifyToken,
  attendanceController.getAttendanceSummary
);

module.exports = router;
