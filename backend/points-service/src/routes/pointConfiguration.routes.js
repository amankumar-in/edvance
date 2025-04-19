const express = require("express");
const pointConfigurationController = require("../controllers/pointConfiguration.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Get active configuration (accessible to all authenticated users)
router.get(
  "/active",
  authMiddleware.verifyToken,
  pointConfigurationController.getActiveConfiguration
);

// Admin only routes
router.get(
  "/history",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  pointConfigurationController.getConfigurationHistory
);

router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  pointConfigurationController.updateConfiguration
);

router.get(
  "/:version",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  pointConfigurationController.getConfigurationVersion
);

router.post(
  "/:version/activate",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  pointConfigurationController.activateConfigurationVersion
);

// Add level management routes
router.get(
  "/levels",
  authMiddleware.verifyToken,
  pointConfigurationController.getAllLevels
);

router.post(
  "/levels",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  pointConfigurationController.addOrUpdateLevel
);

router.delete(
  "/levels/:level",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  pointConfigurationController.deleteLevel
);
module.exports = router;
