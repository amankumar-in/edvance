const express = require("express");
const studentController = require("../controllers/student.controller");
const authMiddleware = require("../middleware/auth.middleware");
const attendanceController = require("../controllers/attendance.controller"); // Add this line

const router = express.Router();

// Student routes
router.get(
  "/me",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student", "platform_admin"]),
  studentController.getStudentProfile
);

router.get(
  "/:id",
  authMiddleware.verifyToken,
  studentController.getStudentById
);

router.post(
  "/profile",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student", "platform_admin"]),
  studentController.createStudentProfile
);

router.post(
  "/link/parent",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student", "platform_admin"]),
  studentController.linkWithParent
);

// Update student profile
router.put(
  "/:id",
  authMiddleware.verifyToken,
  studentController.updateStudentProfile
);

// Get student badges
router.get(
  "/:id/badges",
  authMiddleware.verifyToken,
  studentController.getStudentBadges
);

// Get student attendance
router.get(
  "/:id/attendance",
  authMiddleware.verifyToken,
  attendanceController.getStudentAttendance
);

// Check-in (daily attendance)
router.post(
  "/:id/check-in",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student", "platform_admin"]),
  attendanceController.checkIn
);

// Get student level and progress
router.get(
  "/:id/level",
  authMiddleware.verifyToken,
  studentController.getStudentLevel
);

// Link with school
router.post(
  "/link/school",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student", "platform_admin"]),
  studentController.linkWithSchool
);

// Add to student.routes.js
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

// Unlink student from parent
router.delete(
  "/:id/parent/:parentId",
  authMiddleware.verifyToken,
  studentController.unlinkFromParent
);

// Unlink student from school
router.delete(
  "/:id/school",
  authMiddleware.verifyToken,
  studentController.unlinkFromSchool
);

// Request to link with parent
router.post(
  "/request-parent",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student"]),
  studentController.requestParentLink
);

// Request to link with school
router.post(
  "/request-school",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student"]),
  studentController.requestSchoolLink
);
module.exports = router;
