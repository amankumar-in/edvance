const express = require("express");
const pointLimitController = require("../controllers/pointLimit.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Get all point limits
router.get(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin", "school_admin"]),
  pointLimitController.getLimits
);

// Create or update point limit
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin", "school_admin"]),
  pointLimitController.createOrUpdateLimit
);

// Delete point limit
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  pointLimitController.deleteLimit
);

// Get applicable limit for student
router.get(
  "/student/:studentId",
  authMiddleware.verifyToken,
  pointLimitController.getStudentLimit
);

module.exports = router;
