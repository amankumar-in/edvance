const express = require("express");
const teacherController = require("../controllers/teacher.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Teacher routes
router.get(
  "/me",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "platform_admin"]),
  teacherController.getTeacherProfile
);

router.get(
  "/me/classes",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "platform_admin"]),
  teacherController.getClasses
);

router.post(
  "/profile",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "platform_admin"]),
  teacherController.createTeacherProfile
);

// Update teacher profile
router.put(
  "/:id",
  authMiddleware.verifyToken,
  teacherController.updateTeacherProfile
);
module.exports = router;
