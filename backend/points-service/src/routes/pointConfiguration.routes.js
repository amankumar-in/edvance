const express = require("express");
const pointConfigurationController = require("../controllers/pointConfiguration.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     PointConfiguration:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the configuration
 *         version:
 *           type: number
 *           description: Configuration version number
 *         isActive:
 *           type: boolean
 *           description: Whether this is the currently active configuration
 *         activityPoints:
 *           type: object
 *           properties:
 *             attendance:
 *               type: object
 *               properties:
 *                 dailyCheckIn:
 *                   type: number
 *                   description: Points awarded for daily check-in
 *                 streak:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                     interval:
 *                       type: number
 *                     bonus:
 *                       type: number
 *                 perfectWeek:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                     bonus:
 *                       type: number
 *             tasks:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *                 difficultyMultipliers:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *             badges:
 *               type: object
 *               properties:
 *                 default:
 *                   type: number
 *                 special:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *             behavior:
 *               type: object
 *               properties:
 *                 positive:
 *                   type: number
 *                 negative:
 *                   type: number
 *         limits:
 *           type: object
 *           properties:
 *             daily:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                 maxPoints:
 *                   type: number
 *             weekly:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                 maxPoints:
 *                   type: number
 *             monthly:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                 maxPoints:
 *                   type: number
 *             sources:
 *               type: object
 *               additionalProperties:
 *                 type: object
 *         levelProgression:
 *           type: object
 *           additionalProperties:
 *             type: number
 *           description: Map of level numbers to point thresholds
 *         maxLevel:
 *           type: number
 *           description: Maximum level defined in the system
 *         levelNames:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           description: Map of level numbers to level names
 *         createdBy:
 *           type: string
 *           description: User ID who created this configuration
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedBy:
 *           type: string
 *           description: User ID who last updated this configuration
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     LevelInfo:
 *       type: object
 *       properties:
 *         level:
 *           type: number
 *           description: Level number
 *         threshold:
 *           type: number
 *           description: Points required to reach this level
 *         name:
 *           type: string
 *           description: Display name for the level
 */

/**
 * @openapi
 * /points/configuration/active:
 *   get:
 *     summary: Get active point system configuration
 *     description: Retrieves the currently active configuration for points, levels, and limits
 *     tags:
 *       - Point Configuration
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Active configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PointConfiguration'
 *       '500':
 *         description: Failed to get configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to get point configuration"
 *                 error:
 *                   type: string
 */
router.get(
  "/active",
  authMiddleware.verifyToken,
  pointConfigurationController.getActiveConfiguration
);

/**
 * @openapi
 * /points/configuration/history:
 *   get:
 *     summary: Get configuration version history
 *     description: Retrieves a history of configuration versions (platform admin only)
 *     tags:
 *       - Point Configuration
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Configuration history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PointConfiguration'
 *       '403':
 *         description: Access denied - platform admin only
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied: platform admin only"
 *       '500':
 *         description: Failed to get configuration history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to get configuration history"
 *                 error:
 *                   type: string
 */
router.get(
  "/history",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  pointConfigurationController.getConfigurationHistory
);

/**
 * @openapi
 * /points/configuration:
 *   post:
 *     summary: Create new configuration version
 *     description: Create a new configuration version based on current settings (platform admin only)
 *     tags:
 *       - Point Configuration
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Updated configuration data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activityPoints:
 *                 type: object
 *                 description: Point values for different activities
 *               limits:
 *                 type: object
 *                 description: Daily, weekly, and source limits
 *               levelProgression:
 *                 type: object
 *                 description: Map of levels to point thresholds
 *               levelNames:
 *                 type: object
 *                 description: Map of levels to display names
 *     responses:
 *       '200':
 *         description: Configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Point configuration updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PointConfiguration'
 *       '403':
 *         description: Access denied - platform admin only
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Only platform administrators can update point configuration"
 *       '500':
 *         description: Failed to update configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to update point configuration"
 *                 error:
 *                   type: string
 */
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  pointConfigurationController.updateConfiguration
);

/**
 * @openapi
 * /points/configuration/{version}:
 *   get:
 *     summary: Get specific configuration version
 *     description: Retrieves a specific version of the configuration (platform admin only)
 *     tags:
 *       - Point Configuration
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: version
 *         in: path
 *         description: Configuration version number
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Configuration version retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PointConfiguration'
 *       '403':
 *         description: Access denied - platform admin only
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied: platform admin only"
 *       '404':
 *         description: Configuration version not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Configuration version not found"
 *       '500':
 *         description: Failed to get configuration version
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to get configuration version"
 *                 error:
 *                   type: string
 */
router.get(
  "/:version",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  pointConfigurationController.getConfigurationVersion
);

/**
 * @openapi
 * /points/configuration/{version}/activate:
 *   post:
 *     summary: Activate a specific configuration version
 *     description: Sets a specific configuration version as the active one (platform admin only)
 *     tags:
 *       - Point Configuration
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: version
 *         in: path
 *         description: Configuration version number to activate
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Configuration version activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Configuration version 5 activated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/PointConfiguration'
 *       '403':
 *         description: Access denied - platform admin only
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Only platform administrators can activate configuration versions"
 *       '404':
 *         description: Configuration version not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Configuration version not found"
 *       '500':
 *         description: Failed to activate configuration version
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to activate configuration version"
 *                 error:
 *                   type: string
 */
router.post(
  "/:version/activate",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  pointConfigurationController.activateConfigurationVersion
);

/**
 * @openapi
 * /points/configuration/levels:
 *   get:
 *     summary: Get all levels information
 *     description: Retrieves all level definitions, thresholds, and names
 *     tags:
 *       - Point Configuration
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Levels retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     levels:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LevelInfo'
 *                     maxLevel:
 *                       type: number
 *                       example: 10
 *       '500':
 *         description: Failed to get levels
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to get levels"
 *                 error:
 *                   type: string
 */
router.get(
  "/levels",
  authMiddleware.verifyToken,
  pointConfigurationController.getAllLevels
);

/**
 * @openapi
 * /points/configuration/levels:
 *   post:
 *     summary: Add or update a level
 *     description: Creates a new level or updates an existing one (platform admin only)
 *     tags:
 *       - Point Configuration
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Level details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               level:
 *                 type: number
 *                 description: Level number (2-100)
 *                 minimum: 2
 *                 maximum: 100
 *                 example: 11
 *               threshold:
 *                 type: number
 *                 description: Points required to reach this level
 *                 minimum: 1
 *                 example: 10000
 *               name:
 *                 type: string
 *                 description: Display name for the level (optional)
 *                 example: "Elite Scholar"
 *             required:
 *               - level
 *               - threshold
 *     responses:
 *       '200':
 *         description: Level added/updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Level 11 added/updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/LevelInfo'
 *       '400':
 *         description: Invalid level parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Valid level number (2-100) and threshold are required"
 *       '403':
 *         description: Access denied - platform admin only
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Only platform administrators can manage levels"
 *       '500':
 *         description: Failed to add/update level
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to add/update level"
 *                 error:
 *                   type: string
 */
router.post(
  "/levels",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  pointConfigurationController.addOrUpdateLevel
);

/**
 * @openapi
 * /points/configuration/levels/{level}:
 *   delete:
 *     summary: Delete a level
 *     description: Removes a level definition (platform admin only). Core levels (1-10) cannot be deleted.
 *     tags:
 *       - Point Configuration
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: level
 *         in: path
 *         description: Level number to delete
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 11
 *     responses:
 *       '200':
 *         description: Level deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Level 11 deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     maxLevel:
 *                       type: number
 *                       example: 10
 *       '400':
 *         description: Cannot delete core levels
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Cannot delete core levels (1-10)"
 *       '403':
 *         description: Access denied - platform admin only
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Only platform administrators can manage levels"
 *       '404':
 *         description: Level not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Level 11 not found"
 *       '500':
 *         description: Failed to delete level
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to delete level"
 *                 error:
 *                   type: string
 */
router.delete(
  "/levels/:level",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  pointConfigurationController.deleteLevel
);

module.exports = router;
