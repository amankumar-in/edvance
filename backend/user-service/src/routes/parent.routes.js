const express = require("express");
const parentController = require("../controllers/parent.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Parent routes
router.get(
  "/me",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["parent", "platform_admin"]),
  parentController.getParentProfile
);

router.get(
  "/me/children",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["parent", "platform_admin"]),
  parentController.getChildren
);

router.post(
  "/children",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["parent", "platform_admin"]),
  parentController.addChild
);

router.post(
  "/profile",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["parent", "platform_admin"]),
  parentController.createParentProfile
);

// Update parent profile
router.put(
  "/:id",
  authMiddleware.verifyToken,
  parentController.updateParentProfile
);

// create ink code
router.post(
  "/link-code",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["parent", "platform_admin"]),
  parentController.generateLinkCode
);
// Remove child from parent
router.delete(
  "/children/:childId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["parent", "platform_admin"]),
  parentController.removeChild
);

// Get pending link requests
router.get(
  "/link-requests",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["parent"]),
  parentController.getPendingLinkRequests
);

// Respond to a link request
router.post(
  "/link-requests/:requestId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["parent"]),
  parentController.respondToLinkRequest
);
module.exports = router;
