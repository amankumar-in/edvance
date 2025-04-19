const express = require("express");
const schoolClassController = require("../controllers/schoolClass.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// SchoolClass routes (for teachers)
router.get(
  "/classes/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  schoolClassController.getClassDetails
);

router.get(
  "/classes/:id/students",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  schoolClassController.getClassStudents
);

router.post(
  "/classes",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  schoolClassController.createClass
);

router.put(
  "/classes/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  schoolClassController.updateClass
);

router.delete(
  "/classes/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  schoolClassController.deleteClass
);

router.post(
  "/classes/:id/join-code",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  schoolClassController.generateJoinCode
);

router.post(
  "/classes/:id/students",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  schoolClassController.addStudentToClass
);

router.delete(
  "/classes/:id/students/:studentId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  schoolClassController.removeStudentFromClass
);

// Get pending join requests for a class
router.get(
  "/classes/:id/join-requests",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  schoolClassController.getPendingJoinRequests
);

// Respond to a join request
router.post(
  "/classes/:id/join-requests/:requestId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  schoolClassController.respondToJoinRequest
);
module.exports = router;
