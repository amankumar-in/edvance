// badge.routes.js
const express = require("express");
const badgeController = require("../controllers/badge.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Get all badges
router.get("/", badgeController.getAllBadges);

// Get badge by ID
router.get("/:id", badgeController.getBadgeById);

// Create badge (admin only)
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin", "school_admin"]),
  badgeController.createBadge
);

// Award badge (admin only)
router.post(
  "/award",
  authMiddleware.verifyToken,
  authMiddleware.checkRole([
    "platform_admin",
    "school_admin",
    "teacher",
    "parent",
  ]),
  badgeController.awardBadge
);

// Check if student qualifies for badges
router.post("/check", authMiddleware.verifyToken, badgeController.checkBadges);

// Get available badge criteria
router.get(
  "/criteria",
  authMiddleware.verifyToken,
  badgeController.getBadgeCriteria
);

// Check all badge types for a student
router.get(
  "/check-all/:studentId",
  authMiddleware.verifyToken,
  badgeController.checkAllBadges
);

// timeline
router.get(
  "/timeline/:studentId",
  authMiddleware.verifyToken,
  badgeController.getAchievementTimeline
);

// Add these routes
router.get(
  "/collections",
  authMiddleware.verifyToken,
  badgeController.getBadgeCollections
);

router.post(
  "/collections",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  badgeController.updateBadgeCollection
);

router.delete(
  "/collections/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  badgeController.removeBadgeFromCollection
);
module.exports = router;
