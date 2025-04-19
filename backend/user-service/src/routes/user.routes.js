const express = require("express");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const uploadMiddleware = require("../middleware/upload.middleware");

const router = express.Router();

// Protected routes - require authentication
router.get("/me", authMiddleware.verifyToken, userController.getProfile);
router.put("/me", authMiddleware.verifyToken, userController.updateProfile);
router.put(
  "/me/password",
  authMiddleware.verifyToken,
  userController.changePassword
);
router.post(
  "/me/avatar",
  authMiddleware.verifyToken,
  uploadMiddleware.uploadSingle, // Add this middleware
  userController.uploadAvatar
);

// Admin only routes
router.get(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin", "school_admin"]),
  userController.getUserById
);

module.exports = router;
