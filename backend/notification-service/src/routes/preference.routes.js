const express = require("express");
const router = express.Router();
const preferenceController = require("../controllers/notificationPreference.controller");
const authMiddleware = require("../middleware/auth.middleware");

/**
 * @openapi
 * components:
 *   schemas:
 *     NotificationPreference:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the preference document
 *         userId:
 *           type: string
 *           description: ID of the user these preferences belong to
 *         enabled:
 *           type: boolean
 *           description: Whether notifications are globally enabled for this user
 *           default: true
 *         channels:
 *           type: object
 *           description: Channel-level preferences
 *           properties:
 *             inApp:
 *               type: boolean
 *               description: Whether in-app notifications are enabled
 *               default: true
 *             email:
 *               type: boolean
 *               description: Whether email notifications are enabled
 *               default: true
 *             push:
 *               type: boolean
 *               description: Whether push notifications are enabled
 *               default: true
 *             sms:
 *               type: boolean
 *               description: Whether SMS notifications are enabled
 *               default: false
 *         quietHours:
 *           type: object
 *           description: Quiet hours settings
 *           properties:
 *             enabled:
 *               type: boolean
 *               description: Whether quiet hours are enabled
 *               default: false
 *             start:
 *               type: string
 *               description: Start time for quiet hours (24h format)
 *               example: "22:00"
 *             end:
 *               type: string
 *               description: End time for quiet hours (24h format)
 *               example: "08:00"
 *             timezone:
 *               type: string
 *               description: User's timezone
 *               default: "UTC"
 *         preferences:
 *           type: object
 *           description: Notification type specific preferences
 *           properties:
 *             taskAssignment:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                   default: true
 *                 channels:
 *                   type: object
 *                   properties:
 *                     inApp:
 *                       type: boolean
 *                       default: true
 *                     email:
 *                       type: boolean
 *                       default: true
 *                     push:
 *                       type: boolean
 *                       default: true
 *                     sms:
 *                       type: boolean
 *                       default: false
 *             taskReminder:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                   default: true
 *                 channels:
 *                   type: object
 *                   properties:
 *                     inApp:
 *                       type: boolean
 *                       default: true
 *                     email:
 *                       type: boolean
 *                       default: true
 *                     push:
 *                       type: boolean
 *                       default: true
 *                     sms:
 *                       type: boolean
 *                       default: false
 *             # Additional notification types would be listed here
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the preferences were created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the preferences were last updated
 *     PreferenceUpdate:
 *       type: object
 *       description: Fields to update in notification preferences
 *       properties:
 *         enabled:
 *           type: boolean
 *           description: Whether notifications are globally enabled
 *         channels:
 *           type: object
 *           description: Channel-level preferences
 *           properties:
 *             inApp:
 *               type: boolean
 *             email:
 *               type: boolean
 *             push:
 *               type: boolean
 *             sms:
 *               type: boolean
 *         quietHours:
 *           type: object
 *           properties:
 *             enabled:
 *               type: boolean
 *             start:
 *               type: string
 *               example: "22:00"
 *             end:
 *               type: string
 *               example: "08:00"
 *             timezone:
 *               type: string
 *         preferences:
 *           type: object
 *           description: Updates to specific notification type preferences
 *     RoleDefaultsRequest:
 *       type: object
 *       description: Default preferences for a specific role
 *       properties:
 *         enabled:
 *           type: boolean
 *         channels:
 *           type: object
 *         quietHours:
 *           type: object
 *         preferences:
 *           type: object
 */

// Public routes
router.get("/health", (req, res) => {
  res.status(200).json({ message: "Preference routes are working" });
});

/**
 * @openapi
 * /notifications/preferences/me:
 *   get:
 *     summary: Get current user's notification preferences
 *     description: Retrieves the authenticated user's notification preferences. Creates default preferences if none exist.
 *     tags:
 *       - Notification Preferences
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/NotificationPreference'
 *       '500':
 *         description: Failed to get notification preferences
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
 *                   example: "Failed to get notification preferences"
 *                 error:
 *                   type: string
 */
router.get(
  "/me",
  authMiddleware.verifyToken,
  preferenceController.getMyPreferences
);

/**
 * @openapi
 * /notifications/preferences/me:
 *   put:
 *     summary: Update user's notification preferences
 *     description: Updates the authenticated user's notification preferences
 *     tags:
 *       - Notification Preferences
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Preference updates
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PreferenceUpdate'
 *     responses:
 *       '200':
 *         description: Preferences updated successfully
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
 *                   example: "Notification preferences updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/NotificationPreference'
 *       '400':
 *         description: No updates provided
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
 *                   example: "No updates provided"
 *       '500':
 *         description: Failed to update notification preferences
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
 *                   example: "Failed to update notification preferences"
 *                 error:
 *                   type: string
 */
router.put(
  "/me",
  authMiddleware.verifyToken,
  preferenceController.updatePreferences
);

/**
 * @openapi
 * /notifications/preferences/me/reset:
 *   post:
 *     summary: Reset user's notification preferences to default
 *     description: Deletes the current preferences and creates new default preferences for the user
 *     tags:
 *       - Notification Preferences
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Preferences reset successfully
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
 *                   example: "Notification preferences reset to default"
 *                 data:
 *                   $ref: '#/components/schemas/NotificationPreference'
 *       '500':
 *         description: Failed to reset notification preferences
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
 *                   example: "Failed to reset notification preferences"
 *                 error:
 *                   type: string
 */
router.post(
  "/me/reset",
  authMiddleware.verifyToken,
  preferenceController.resetPreferences
);

/**
 * @openapi
 * /notifications/preferences/user/{userId}:
 *   get:
 *     summary: Get preferences for a specific user
 *     description: Retrieves notification preferences for a specific user (admin access required)
 *     tags:
 *       - Notification Preferences
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID of the user to get preferences for
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/NotificationPreference'
 *       '403':
 *         description: Not authorized to view this user's preferences
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
 *                   example: "Not authorized to view this user's preferences"
 *       '404':
 *         description: Preferences not found for this user
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
 *                   example: "Notification preferences not found for this user"
 *       '500':
 *         description: Failed to get user notification preferences
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
 *                   example: "Failed to get user notification preferences"
 *                 error:
 *                   type: string
 */
router.get(
  "/user/:userId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin", "school_admin"]),
  preferenceController.getUserPreferences
);

/**
 * @openapi
 * /notifications/preferences/role/{role}/defaults:
 *   post:
 *     summary: Set default preferences for a role
 *     description: Sets default notification preferences for all users with a specific role (platform admin only)
 *     tags:
 *       - Notification Preferences
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: role
 *         in: path
 *         description: User role to set defaults for
 *         required: true
 *         schema:
 *           type: string
 *           enum: [student, parent, teacher, school_admin, social_worker, platform_admin]
 *     requestBody:
 *       description: Default preference settings
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleDefaultsRequest'
 *     responses:
 *       '200':
 *         description: Role defaults set successfully
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
 *                   example: "Default notification preferences set for student role"
 *                 data:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       example: "student"
 *                     defaults:
 *                       type: object
 *       '400':
 *         description: Invalid role specified
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
 *                   example: "Invalid role specified"
 *       '403':
 *         description: Not authorized to set role defaults
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
 *                   example: "Only platform administrators can set role defaults"
 *       '500':
 *         description: Failed to set role default preferences
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
 *                   example: "Failed to set role default preferences"
 *                 error:
 *                   type: string
 */
router.post(
  "/role/:role/defaults",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  preferenceController.setRoleDefaults
);

module.exports = router;
