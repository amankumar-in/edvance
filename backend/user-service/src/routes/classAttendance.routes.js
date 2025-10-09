const express = require("express");
const classAttendanceController = require("../controllers/classAttendance.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     ClassAttendance:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the class attendance record
 *         studentId:
 *           type: string
 *           description: ID of the student
 *         classId:
 *           type: string
 *           description: ID of the class
 *         sessionDate:
 *           type: string
 *           format: date
 *           description: Date of the class session
 *         scheduledStartTime:
 *           type: string
 *           description: Scheduled start time in HH:MM format
 *         scheduledEndTime:
 *           type: string
 *           description: Scheduled end time in HH:MM format
 *         dayOfWeek:
 *           type: string
 *           enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *           description: Day of the week
 *         status:
 *           type: string
 *           enum: [present, absent, tardy, excused, left_early]
 *           description: Attendance status
 *         actualArrivalTime:
 *           type: string
 *           format: date-time
 *           description: Actual arrival timestamp
 *         actualDepartureTime:
 *           type: string
 *           format: date-time
 *           description: Actual departure timestamp
 *         recordedBy:
 *           type: string
 *           description: ID of the user who recorded the attendance
 *         recordedByRole:
 *           type: string
 *           enum: [teacher, system, school_admin]
 *           description: Role of the user who recorded the attendance
 *         comments:
 *           type: string
 *           description: Additional comments
 *         pointsAwarded:
 *           type: number
 *           description: Points awarded for this attendance
 *         metadata:
 *           type: object
 *           properties:
 *             isLate:
 *               type: boolean
 *             minutesLate:
 *               type: number
 *             leftEarly:
 *               type: boolean
 *             minutesEarly:
 *               type: number
 *             sessionDuration:
 *               type: number
 *         academicYear:
 *           type: string
 *           description: Academic year
 *         academicTerm:
 *           type: string
 *           description: Academic term
 */

router
  .route("/classes/:classId/students/:studentId")
  .get(authMiddleware.verifyToken, authMiddleware.checkRole(["teacher", "school_admin", "platform_admin", "student"]), classAttendanceController.getStudentClassAttendanceInfo);

router.put(
  "/classes/:classId/students/:studentId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin", "student"]),
  classAttendanceController.studentMarkPresent
);

/**
 * @openapi
 * /class-attendance/classes/{classId}/day:
 *   get:
 *     summary: Get class attendance for a specific day
 *     description: Retrieves attendance details for all students in a class for a specific day
 *     tags:
 *       - Class Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: classId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the class
 *       - name: date
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to get attendance for
 *     responses:
 *       '200':
 *         description: Daily attendance retrieved successfully
 *       '400':
 *         description: Date is required
 *       '404':
 *         description: Class not found
 *       '500':
 *         description: Server error
 */
router.get(
  "/classes/:classId/day",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  classAttendanceController.getClassAttendanceForDay
);

/**
 * @openapi
 * /class-attendance/classes/{classId}/week:
 *   get:
 *     summary: Get class attendance for a specific week
 *     description: Retrieves attendance details for all students in a class for a specific week
 *     tags:
 *       - Class Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: classId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the class
 *       - name: startDate
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date of the week (Monday)
 *     responses:
 *       '200':
 *         description: Weekly attendance retrieved successfully
 *       '400':
 *         description: Start date is required
 *       '404':
 *         description: Class not found
 *       '500':
 *         description: Server error
 */
router.get(
  "/classes/:classId/week",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  classAttendanceController.getClassAttendanceForWeek
);

/**
 * @openapi
 * /class-attendance/classes/{classId}/month:
 *   get:
 *     summary: Get class attendance for a specific month
 *     description: Retrieves attendance details for all students in a class for a specific month
 *     tags:
 *       - Class Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: classId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the class
 *       - name: month
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month number (1-12)
 *       - name: year
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year (e.g., 2024)
 *     responses:
 *       '200':
 *         description: Monthly attendance retrieved successfully
 *       '400':
 *         description: Month and year are required
 *       '404':
 *         description: Class not found
 *       '500':
 *         description: Server error
 */
router.get(
  "/classes/:classId/month",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  classAttendanceController.getClassAttendanceForMonth
);

module.exports = router; 