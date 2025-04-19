const express = require("express");
const socialWorkerController = require("../controllers/socialWorker.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Social Worker routes
router.get(
  "/me",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["social_worker", "platform_admin"]),
  socialWorkerController.getSocialWorkerProfile
);

router.get(
  "/me/children",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["social_worker", "platform_admin"]),
  socialWorkerController.getAssignedChildren
);

router.post(
  "/profile",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["social_worker", "platform_admin"]),
  socialWorkerController.createSocialWorkerProfile
);

// Update social worker profile
router.put(
  "/:id",
  authMiddleware.verifyToken,
  socialWorkerController.updateSocialWorkerProfile
);

// Assign child to social worker
router.post(
  "/:id/children",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["social_worker", "platform_admin"]),
  socialWorkerController.assignChild
);

// Remove child from social worker
router.delete(
  "/:id/children/:childId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["social_worker", "platform_admin"]),
  socialWorkerController.removeChild
);

// Add case notes for a child
router.post(
  "/:id/case-notes",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["social_worker", "platform_admin"]),
  socialWorkerController.addCaseNote
);

// Get case notes for a child
router.get(
  "/:id/case-notes/:studentId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["social_worker", "platform_admin"]),
  socialWorkerController.getCaseNotes
);
module.exports = router;
