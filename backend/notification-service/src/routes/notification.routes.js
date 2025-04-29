const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const authMiddleware = require("../middleware/auth.middleware");

/**
 * @openapi
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the notification
 *         userId:
 *           type: string
 *           description: ID of the user who received this notification
 *         title:
 *           type: string
 *           description: Notification title
 *         content:
 *           type: string
 *           description: Notification content/message
 *         type:
 *           type: string
 *           enum: [task, point, badge, attendance, reward, system, user]
 *           description: Type of notification
 *         sourceType:
 *           type: string
 *           description: Specific notification source type (e.g., task.assigned, point.earned)
 *         sourceId:
 *           type: string
 *           description: ID of the associated entity (task, badge, etc.)
 *         read:
 *           type: boolean
 *           description: Whether the notification has been read
 *         readAt:
 *           type: string
 *           format: date-time
 *           description: When the notification was marked as read
 *         isArchived:
 *           type: boolean
 *           description: Whether the notification is archived
 *         priority:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *           description: Notification priority level
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the notification was created
 *         actionLink:
 *           type: string
 *           description: Optional link for the notification action
 *         actionText:
 *           type: string
 *           description: Text for the action button
 *     NotificationSend:
 *       type: object
 *       required:
 *         - userId
 *         - templateId
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the user to send notification to
 *           example: "60f8a9b5e6b3f32f8c9a8d7e"
 *         templateId:
 *           type: string
 *           description: ID of the notification template to use
 *           example: "60f8a9b5e6b3f32f8c9a8d7f"
 *         data:
 *           type: object
 *           description: Data to populate the template
 *           example:
 *             email: "user@example.com"
 *             taskTitle: "Complete Project"
 *             pointsEarned: 50
 *         channels:
 *           type: array
 *           description: Channels to send notification through
 *           items:
 *             type: string
 *             enum: [in_app, email, push, sms]
 *           example: ["in_app", "email"]
 *     NotificationBulkSend:
 *       type: object
 *       required:
 *         - userIds
 *         - templateId
 *       properties:
 *         userIds:
 *           type: array
 *           description: Array of user IDs to send notifications to
 *           items:
 *             type: string
 *           example: ["60f8a9b5e6b3f32f8c9a8d7e", "60f8a9b5e6b3f32f8c9a8d7f"]
 *         templateId:
 *           type: string
 *           description: ID of the notification template to use
 *           example: "60f8a9b5e6b3f32f8c9a8d7f"
 *         data:
 *           type: object
 *           description: Data to populate the template
 *           example:
 *             title: "New Announcement"
 *             message: "School closed due to weather"
 *         channels:
 *           type: array
 *           description: Channels to send notification through
 *           items:
 *             type: string
 *           example: ["in_app", "email"]
 */

// Public routes
router.get("/health", (req, res) => {
  res.status(200).json({ message: "Notification routes are working" });
});

/**
 * @openapi
 * /notifications/send:
 *   post:
 *     summary: Send a notification to a user
 *     description: Creates and sends a notification to a specific user
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Notification details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationSend'
 *     responses:
 *       '201':
 *         description: Notification sent successfully
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
 *                   example: "Notification sent successfully"
 *                 data:
 *                   type: object
 *       '400':
 *         description: Missing required fields
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
 *                   example: "User ID and template ID are required"
 *       '404':
 *         description: Template not found
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
 *                   example: "Notification template not found"
 *       '500':
 *         description: Failed to send notification
 */
router.post(
  "/send",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin", "school_admin"]),
  notificationController.sendNotification
);

/**
 * @openapi
 * /notifications/bulk:
 *   post:
 *     summary: Send notifications to multiple users
 *     description: Creates and sends the same notification to multiple users
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Bulk notification details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotificationBulkSend'
 *     responses:
 *       '201':
 *         description: Notifications sent successfully
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
 *                   example: "10 notifications sent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     successCount:
 *                       type: integer
 *                       example: 9
 *                     failureCount:
 *                       type: integer
 *                       example: 1
 *       '400':
 *         description: Missing required fields
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
 *                   example: "User IDs array and template ID are required"
 *       '404':
 *         description: Template not found
 *       '500':
 *         description: Failed to send bulk notifications
 */
router.post(
  "/bulk",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin", "school_admin"]),
  notificationController.sendBulkNotifications
);

/**
 * @openapi
 * /notifications/me:
 *   get:
 *     summary: Get notifications for current user
 *     description: Retrieves paginated notifications for the authenticated user
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of items per page
 *         schema:
 *           type: integer
 *           default: 20
 *       - name: unreadOnly
 *         in: query
 *         description: Filter to show only unread notifications
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       '200':
 *         description: Notifications retrieved successfully
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
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 45
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         pages:
 *                           type: integer
 *                           example: 3
 *       '500':
 *         description: Failed to get notifications
 */
router.get(
  "/me",
  authMiddleware.verifyToken,
  notificationController.getMyNotifications
);

/**
 * @openapi
 * /notifications/me/unread:
 *   get:
 *     summary: Get unread notification count
 *     description: Returns the count of unread notifications for the current user
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Unread count retrieved successfully
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
 *                     unreadCount:
 *                       type: integer
 *                       example: 5
 *       '500':
 *         description: Failed to get unread count
 */
router.get(
  "/me/unread",
  authMiddleware.verifyToken,
  notificationController.getUnreadCount
);

/**
 * @openapi
 * /notifications/me/read/all:
 *   post:
 *     summary: Mark all notifications as read
 *     description: Marks all notifications for the current user as read
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: All notifications marked as read
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
 *                   example: "All notifications marked as read"
 *                 data:
 *                   type: object
 *                   properties:
 *                     modifiedCount:
 *                       type: integer
 *                       example: 5
 *       '500':
 *         description: Failed to mark all notifications as read
 */
router.post(
  "/me/read/all",
  authMiddleware.verifyToken,
  notificationController.markAllAsRead
);

/**
 * @openapi
 * /notifications/{id}/read:
 *   post:
 *     summary: Mark a notification as read
 *     description: Marks a specific notification as read
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the notification to mark as read
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Notification marked as read
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
 *                   example: "Notification marked as read"
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       '403':
 *         description: Not authorized to update this notification
 *       '404':
 *         description: Notification not found
 *       '500':
 *         description: Failed to mark notification as read
 */
router.post(
  "/:id/read",
  authMiddleware.verifyToken,
  notificationController.markAsRead
);

/**
 * @openapi
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     description: Deletes a specific notification
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the notification to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Notification deleted successfully
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
 *                   example: "Notification deleted successfully"
 *       '403':
 *         description: Not authorized to delete this notification
 *       '404':
 *         description: Notification not found
 *       '500':
 *         description: Failed to delete notification
 */
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  notificationController.deleteNotification
);

/**
 * @openapi
 * /notifications/me/all:
 *   delete:
 *     summary: Delete all notifications
 *     description: Deletes all notifications for the current user
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: All notifications deleted successfully
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
 *                   example: "All notifications deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *                       example: 15
 *       '500':
 *         description: Failed to delete all notifications
 */
router.delete(
  "/me/all",
  authMiddleware.verifyToken,
  notificationController.deleteAllNotifications
);

/**
 * @openapi
 * /notifications/user/{userId}:
 *   get:
 *     summary: Get notifications for a specific user
 *     description: Retrieves notifications for a specific user (admin only)
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID of the user to get notifications for
 *         required: true
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of items per page
 *         schema:
 *           type: integer
 *           default: 20
 *       - name: unreadOnly
 *         in: query
 *         description: Filter to show only unread notifications
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       '200':
 *         description: Notifications retrieved successfully
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
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 45
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         pages:
 *                           type: integer
 *                           example: 3
 *       '400':
 *         description: User ID is required
 *       '403':
 *         description: Not authorized to view other users' notifications
 *       '500':
 *         description: Failed to get user notifications
 */
router.get(
  "/user/:userId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin", "school_admin", "teacher"]),
  notificationController.getUserNotifications
);

module.exports = router;
