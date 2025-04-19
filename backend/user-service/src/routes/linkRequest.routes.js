const express = require("express");
const linkRequestController = require("../controllers/linkRequest.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Request to link with a parent
router.post(
  "/parent",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student"]),
  linkRequestController.requestParentLink
);

// Request to link with a school
router.post(
  "/school",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student"]),
  linkRequestController.requestSchoolLink
);

// Get pending link requests
router.get(
  "/pending",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student"]),
  linkRequestController.getPendingRequests
);

// Cancel a link request
router.delete(
  "/:requestId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["student"]),
  linkRequestController.cancelRequest
);

module.exports = router;
