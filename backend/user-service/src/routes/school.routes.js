const express = require("express");
const schoolController = require("../controllers/school.controller");
const authMiddleware = require("../middleware/auth.middleware");
const studentController = require("../controllers/student.controller");

const router = express.Router();
// Create a new school (platform admin or any user who will become school admin)
router.post("/", authMiddleware.verifyToken, schoolController.createSchool);

// School routes
router.get(
  "/me",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.getSchoolProfile
);

router.put(
  "/me",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.updateSchoolProfile
);

router.get(
  "/me/teachers",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.getTeachers
);

router.post(
  "/teachers",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.addTeacher
);

router.delete(
  "/teachers/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.removeTeacher
);

router.get(
  "/me/students",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.getStudents
);

router.get(
  "/me/classes",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.getClasses
);

router.post(
  "/import/students",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.importStudents
);

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
// Update all school administrators (replace existing ones)
router.put(
  "/:id/administrators",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.updateAdministrators
);

// Add a new administrator to school
router.post(
  "/:id/administrators",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.addAdministrator
);

// Remove administrator from school
router.delete(
  "/:id/administrators/:userId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.removeAdministrator
);

// Get all administrators for a school
router.get(
  "/:id/administrators",
  authMiddleware.verifyToken,
  schoolController.getAdministrators
);
// Add these routes to school.routes.js
router.get(
  "/join-requests",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.getAllPendingJoinRequests
);

router.post(
  "/join-requests/:requestId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  // You'd need to implement this method similar to the class one
  schoolController.respondToJoinRequest
);
module.exports = router;
