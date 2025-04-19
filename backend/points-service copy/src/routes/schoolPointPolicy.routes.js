const express = require("express");
const schoolPointPolicyController = require("../controllers/schoolPointPolicy.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Get school point policy
router.get(
  "/schools/:schoolId/policies",
  authMiddleware.verifyToken,
  schoolPointPolicyController.getSchoolPolicy
);

// Update school point policy
router.put(
  "/schools/:schoolId/policies",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin", "school_admin"]),
  schoolPointPolicyController.updateSchoolPolicy
);

module.exports = router;
