// attendance.routes.js
const express = require("express");
const attendanceController = require("../controllers/attendance.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// IMPORTANT: Routes with specific paths must come BEFORE routes with parameters (:id)

// Get all attendance records (with filters)
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

// Get today's attendance for a class
router.get(
  "/today",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  attendanceController.getTodayAttendance
);

// Generate attendance report
router.get(
  "/report",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  attendanceController.generateReport
);

// Record attendance (for teachers/admins)
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  attendanceController.recordAttendance
);

// Record bulk attendance
router.post(
  "/bulk",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  attendanceController.recordBulkAttendance
);

// Get student attendance - parameter routes come after specific paths
router.get(
  "/:id",
  authMiddleware.verifyToken,
  attendanceController.getStudentAttendance
);

// Check in (for student)
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
// Get attendance summary with points
router.get(
  "/:id/summary",
  authMiddleware.verifyToken,
  attendanceController.getAttendanceSummary
);
module.exports = router;
