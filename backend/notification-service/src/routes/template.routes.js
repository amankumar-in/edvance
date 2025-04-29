const express = require("express");
const router = express.Router();
const templateController = require("../controllers/template.controller");
const authMiddleware = require("../middleware/auth.middleware");

/**
 * @openapi
 * components:
 *   schemas:
 *     NotificationTemplate:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the template
 *         name:
 *           type: string
 *           description: Unique name of the template
 *         description:
 *           type: string
 *           description: Detailed description of the template
 *         type:
 *           type: string
 *           enum: [task, point, badge, attendance, reward, system, user]
 *           description: Primary notification type
 *         eventType:
 *           type: string
 *           description: Specific event type like task.assigned, point.earned, etc.
 *         title:
 *           type: string
 *           description: Template title with placeholders (e.g., "New Task: {{taskTitle}}")
 *         content:
 *           type: string
 *           description: Template content with placeholders for in-app notifications
 *         emailSubject:
 *           type: string
 *           description: Subject line template for email notifications
 *         emailBody:
 *           type: string
 *           description: HTML body template for email notifications
 *         pushBody:
 *           type: string
 *           description: Shorter template text for push notifications
 *         smsBody:
 *           type: string
 *           description: Template text for SMS notifications
 *         channels:
 *           type: array
 *           description: Available delivery channels for this template
 *           items:
 *             type: string
 *             enum: [in_app, email, push, sms]
 *         defaultRoles:
 *           type: array
 *           description: User roles this template is applicable to by default
 *           items:
 *             type: string
 *             enum: [student, parent, teacher, school_admin, social_worker, platform_admin]
 *         isSystemTemplate:
 *           type: boolean
 *           description: Whether this is a system template that cannot be modified
 *         isActive:
 *           type: boolean
 *           description: Whether the template is currently active
 *         createdBy:
 *           type: string
 *           description: ID of the user who created the template
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the template was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the template was last updated
 *     TemplateCreate:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - type
 *         - eventType
 *         - title
 *         - content
 *       properties:
 *         name:
 *           type: string
 *           description: Unique template name
 *           example: "Task Assignment"
 *         description:
 *           type: string
 *           description: Template description
 *           example: "Sent when a task is assigned to a student"
 *         type:
 *           type: string
 *           enum: [task, point, badge, attendance, reward, system, user]
 *           description: Primary notification type
 *           example: "task"
 *         eventType:
 *           type: string
 *           description: Specific event type
 *           example: "task.assigned"
 *         title:
 *           type: string
 *           description: Template title with placeholders
 *           example: "New Task: {{taskTitle}}"
 *         content:
 *           type: string
 *           description: Template content with placeholders
 *           example: "You've been assigned a new task: {{taskTitle}}, due on {{dueDate}}."
 *         emailSubject:
 *           type: string
 *           description: Email subject line template
 *           example: "New Task Assigned: {{taskTitle}}"
 *         emailBody:
 *           type: string
 *           description: HTML email body template
 *           example: "<h1>New Task</h1><p>You've been assigned a new task: <strong>{{taskTitle}}</strong>, due on {{dueDate}}.</p>"
 *         pushBody:
 *           type: string
 *           description: Push notification text
 *           example: "New task: {{taskTitle}}"
 *         smsBody:
 *           type: string
 *           description: SMS text
 *           example: "Univance: New task '{{taskTitle}}' has been assigned to you, due on {{dueDate}}."
 *         channels:
 *           type: array
 *           description: Available channels
 *           items:
 *             type: string
 *             enum: [in_app, email, push, sms]
 *           example: ["in_app", "email", "push"]
 *         defaultRoles:
 *           type: array
 *           description: Applicable user roles
 *           items:
 *             type: string
 *           example: ["student"]
 *         isActive:
 *           type: boolean
 *           default: true
 *     TemplateUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Template name
 *         description:
 *           type: string
 *           description: Template description
 *         type:
 *           type: string
 *           enum: [task, point, badge, attendance, reward, system, user]
 *         eventType:
 *           type: string
 *           description: Specific event type
 *         title:
 *           type: string
 *           description: Template title
 *         content:
 *           type: string
 *           description: Template content
 *         emailSubject:
 *           type: string
 *           description: Email subject line
 *         emailBody:
 *           type: string
 *           description: HTML email body
 *         pushBody:
 *           type: string
 *           description: Push notification text
 *         smsBody:
 *           type: string
 *           description: SMS text
 *         channels:
 *           type: array
 *           items:
 *             type: string
 *             enum: [in_app, email, push, sms]
 *         defaultRoles:
 *           type: array
 *           items:
 *             type: string
 *         isActive:
 *           type: boolean
 */

// Public routes
router.get("/health", (req, res) => {
  res.status(200).json({ message: "Template routes are working" });
});

/**
 * @openapi
 * /notifications/templates:
 *   get:
 *     summary: Get all notification templates
 *     description: Retrieves a list of notification templates with optional filtering
 *     tags:
 *       - Notification Templates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: type
 *         in: query
 *         description: Filter by notification type
 *         schema:
 *           type: string
 *           enum: [task, point, badge, attendance, reward, system, user]
 *       - name: category
 *         in: query
 *         description: Filter by template category
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
 *     responses:
 *       '200':
 *         description: Templates retrieved successfully
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
 *                     templates:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NotificationTemplate'
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
 *         description: Failed to get notification templates
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
 *                   example: "Failed to get notification templates"
 *                 error:
 *                   type: string
 */
router.get("/", authMiddleware.verifyToken, templateController.getAllTemplates);

/**
 * @openapi
 * /notifications/templates/{id}:
 *   get:
 *     summary: Get template by ID
 *     description: Retrieves detailed information about a specific notification template
 *     tags:
 *       - Notification Templates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the template to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Template retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/NotificationTemplate'
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
 *         description: Failed to get notification template
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
 *                   example: "Failed to get notification template"
 *                 error:
 *                   type: string
 */
router.get(
  "/:id",
  authMiddleware.verifyToken,
  templateController.getTemplateById
);

/**
 * @openapi
 * /notifications/templates:
 *   post:
 *     summary: Create new notification template
 *     description: Creates a new notification template (platform admin only)
 *     tags:
 *       - Notification Templates
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Template details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TemplateCreate'
 *     responses:
 *       '201':
 *         description: Template created successfully
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
 *                   example: "Notification template created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/NotificationTemplate'
 *       '400':
 *         description: Missing required fields or duplicate template name
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
 *                   example: "Name, type, category, and body are required"
 *       '403':
 *         description: Not authorized to create templates
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
 *                   example: "Only platform administrators can create notification templates"
 *       '500':
 *         description: Failed to create notification template
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
 *                   example: "Failed to create notification template"
 *                 error:
 *                   type: string
 */
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  templateController.createTemplate
);

/**
 * @openapi
 * /notifications/templates/{id}:
 *   put:
 *     summary: Update notification template
 *     description: Updates an existing notification template (platform admin only)
 *     tags:
 *       - Notification Templates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the template to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated template details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TemplateUpdate'
 *     responses:
 *       '200':
 *         description: Template updated successfully
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
 *                   example: "Notification template updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/NotificationTemplate'
 *       '400':
 *         description: Duplicate template name or invalid data
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
 *                   example: "Template with this name already exists"
 *       '403':
 *         description: Not authorized to update templates
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
 *                   example: "Only platform administrators can update notification templates"
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
 *         description: Failed to update notification template
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
 *                   example: "Failed to update notification template"
 *                 error:
 *                   type: string
 */
router.put(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  templateController.updateTemplate
);

/**
 * @openapi
 * /notifications/templates/{id}:
 *   delete:
 *     summary: Delete notification template
 *     description: Soft-deletes a notification template by marking it as inactive (platform admin only)
 *     tags:
 *       - Notification Templates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the template to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Template deleted successfully
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
 *                   example: "Notification template deleted successfully"
 *       '403':
 *         description: Not authorized to delete templates
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
 *                   example: "Only platform administrators can delete notification templates"
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
 *         description: Failed to delete notification template
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
 *                   example: "Failed to delete notification template"
 *                 error:
 *                   type: string
 */
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin"]),
  templateController.deleteTemplate
);

module.exports = router;
