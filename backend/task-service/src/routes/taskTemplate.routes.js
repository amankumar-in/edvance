const express = require("express");
const router = express.Router();
const taskTemplateController = require("../controllers/taskTemplate.controller");
const authMiddleware = require("../middleware/auth.middleware");

/**
 * @openapi
 * components:
 *   schemas:
 *     TaskTemplate:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the template
 *         title:
 *           type: string
 *           description: Title of the task template
 *         description:
 *           type: string
 *           description: Detailed description of the task template
 *         category:
 *           type: string
 *           enum: [academic, home, behavior, extracurricular, attendance, system]
 *           description: Category of the task
 *         subCategory:
 *           type: string
 *           description: Sub-category of the task
 *         suggestedPointValue:
 *           type: number
 *           description: Recommended point value for tasks created from this template
 *         createdBy:
 *           type: string
 *           description: ID of the user who created the template
 *         creatorRole:
 *           type: string
 *           enum: [parent, teacher, school_admin, social_worker, platform_admin, system]
 *           description: Role of the creator
 *         requiresApproval:
 *           type: boolean
 *           description: Whether tasks created from this template require approval
 *         defaultApproverType:
 *           type: string
 *           enum: [parent, teacher, school_admin, social_worker, platform_admin, system, none]
 *           description: Default type of approver for tasks created from this template
 *         isRecurring:
 *           type: boolean
 *           description: Whether tasks created from this template should be recurring by default
 *         defaultRecurringSchedule:
 *           type: object
 *           properties:
 *             frequency:
 *               type: string
 *               enum: [daily, weekly, monthly]
 *             daysOfWeek:
 *               type: array
 *               items:
 *                 type: number
 *             interval:
 *               type: number
 *           description: Default recurring schedule for tasks created from this template
 *         estimatedDuration:
 *           type: number
 *           description: Estimated time to complete (in minutes)
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard, challenging]
 *           description: Difficulty level of the task
 *         recommendedAgeMin:
 *           type: number
 *           description: Minimum recommended age for this template
 *         recommendedAgeMax:
 *           type: number
 *           description: Maximum recommended age for this template
 *         recommendedGradeMin:
 *           type: number
 *           description: Minimum recommended grade level for this template
 *         recommendedGradeMax:
 *           type: number
 *           description: Maximum recommended grade level for this template
 *         externalResource:
 *           type: object
 *           properties:
 *             platform:
 *               type: string
 *             resourceId:
 *               type: string
 *             url:
 *               type: string
 *           description: External resource associated with this template
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [image, document, link, video]
 *               url:
 *                 type: string
 *               name:
 *                 type: string
 *               contentType:
 *                 type: string
 *           description: Default attachments for tasks created from this template
 *         schoolId:
 *           type: string
 *           description: ID of the school (for school-specific templates)
 *         visibility:
 *           type: string
 *           enum: [private, family, class, school, public]
 *           description: Who can see and use this template
 *         isFeatured:
 *           type: boolean
 *           description: Whether this is a featured template
 *         usageCount:
 *           type: number
 *           description: Number of times this template has been used
 *         isActive:
 *           type: boolean
 *           description: Whether this template is active
 *         metadata:
 *           type: object
 *           description: Additional metadata for the template
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     TaskTemplateCreate:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - suggestedPointValue
 *       properties:
 *         title:
 *           type: string
 *           example: "Daily Math Practice"
 *         description:
 *           type: string
 *           example: "Complete 20 minutes of math practice problems"
 *         category:
 *           type: string
 *           enum: [academic, home, behavior, extracurricular, attendance, system]
 *           example: "academic"
 *         subCategory:
 *           type: string
 *           example: "Math"
 *         suggestedPointValue:
 *           type: number
 *           example: 15
 *         requiresApproval:
 *           type: boolean
 *           example: true
 *         defaultApproverType:
 *           type: string
 *           enum: [parent, teacher, school_admin, social_worker, platform_admin, system, none]
 *           example: "teacher"
 *         isRecurring:
 *           type: boolean
 *           example: true
 *         defaultRecurringSchedule:
 *           type: object
 *           properties:
 *             frequency:
 *               type: string
 *               example: "daily"
 *             daysOfWeek:
 *               type: array
 *               items:
 *                 type: number
 *               example: [1, 2, 3, 4, 5]
 *             interval:
 *               type: number
 *               example: 1
 *         estimatedDuration:
 *           type: number
 *           example: 20
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard, challenging]
 *           example: "medium"
 *         recommendedAgeMin:
 *           type: number
 *           example: 8
 *         recommendedAgeMax:
 *           type: number
 *           example: 12
 *         recommendedGradeMin:
 *           type: number
 *           example: 3
 *         recommendedGradeMax:
 *           type: number
 *           example: 6
 *         externalResource:
 *           type: object
 *           properties:
 *             platform:
 *               type: string
 *               example: "Khan Academy"
 *             url:
 *               type: string
 *               example: "https://www.khanacademy.org/math"
 *         schoolId:
 *           type: string
 *           example: "60f8a9b5e6b3f32f8c9a8d7e"
 *         visibility:
 *           type: string
 *           enum: [private, family, class, school, public]
 *           example: "school"
 *     TaskTemplateUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *           enum: [academic, home, behavior, extracurricular, attendance, system]
 *         subCategory:
 *           type: string
 *         suggestedPointValue:
 *           type: number
 *         requiresApproval:
 *           type: boolean
 *         defaultApproverType:
 *           type: string
 *           enum: [parent, teacher, school_admin, social_worker, platform_admin, system, none]
 *         isRecurring:
 *           type: boolean
 *         defaultRecurringSchedule:
 *           type: object
 *         estimatedDuration:
 *           type: number
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard, challenging]
 *         recommendedAgeMin:
 *           type: number
 *         recommendedAgeMax:
 *           type: number
 *         recommendedGradeMin:
 *           type: number
 *         recommendedGradeMax:
 *           type: number
 *         externalResource:
 *           type: object
 *         schoolId:
 *           type: string
 *         visibility:
 *           type: string
 *           enum: [private, family, class, school, public]
 *     TaskFromTemplate:
 *       type: object
 *       required:
 *         - assignedTo
 *       properties:
 *         assignedTo:
 *           type: string
 *           example: "60f8a9b5e6b3f32f8c9a8d7e"
 *           description: ID of student to assign the task to
 *         dueDate:
 *           type: string
 *           format: date-time
 *           example: "2023-05-15T18:00:00Z"
 *         pointValue:
 *           type: number
 *           example: 20
 *         description:
 *           type: string
 *           example: "Custom description for this task instance"
 *         specificApproverId:
 *           type: string
 *           example: "60f8a9b5e6b3f32f8c9a8d7e"
 *         isRecurring:
 *           type: boolean
 *           example: true
 *         recurringSchedule:
 *           type: object
 *           properties:
 *             frequency:
 *               type: string
 *               example: "weekly"
 *             daysOfWeek:
 *               type: array
 *               items:
 *                 type: number
 *               example: [1, 3, 5]
 *             interval:
 *               type: number
 *               example: 1
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *         visibility:
 *           type: string
 *           enum: [private, family, class, school, public]
 *           example: "family"
 *         metadata:
 *           type: object
 */

// All routes require authentication
router.use(authMiddleware.verifyToken);

/**
 * @openapi
 * /tasks/templates:
 *   post:
 *     summary: Create a new task template
 *     description: Creates a new template for organizing and reusing tasks
 *     tags:
 *       - Task Templates
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Template details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskTemplateCreate'
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
 *                   example: "Template created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/TaskTemplate'
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
 *                   example: "Missing required fields: title, category, and suggestedPointValue are required"
 *       '500':
 *         description: Failed to create template
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
 *                   example: "Failed to create template"
 *                 error:
 *                   type: string
 */
router.post("/", taskTemplateController.createTemplate);

/**
 * @openapi
 * /tasks/templates/{id}:
 *   get:
 *     summary: Get a specific task template by ID
 *     description: Retrieves detailed information about a task template by its ID
 *     tags:
 *       - Task Templates
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
 *                   $ref: '#/components/schemas/TaskTemplate'
 *       '400':
 *         description: Invalid template ID format
 *       '403':
 *         description: Not authorized to view this template
 *       '404':
 *         description: Template not found
 *       '500':
 *         description: Failed to get template
 */
router.get("/:id", taskTemplateController.getTemplateById);

/**
 * @openapi
 * /tasks/templates/{id}:
 *   put:
 *     summary: Update a task template
 *     description: Updates a task template with the provided details
 *     tags:
 *       - Task Templates
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
 *             $ref: '#/components/schemas/TaskTemplateUpdate'
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
 *                   example: "Template updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/TaskTemplate'
 *       '400':
 *         description: Invalid template ID format
 *       '403':
 *         description: Not authorized to update this template
 *       '404':
 *         description: Template not found
 *       '500':
 *         description: Failed to update template
 */
router.put("/:id", taskTemplateController.updateTemplate);

/**
 * @openapi
 * /tasks/templates/{id}:
 *   delete:
 *     summary: Delete a task template (soft delete)
 *     description: Marks a task template as deleted (soft delete)
 *     tags:
 *       - Task Templates
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
 *                   example: "Template deleted successfully"
 *       '400':
 *         description: Invalid template ID format
 *       '403':
 *         description: Not authorized to delete this template
 *       '404':
 *         description: Template not found
 *       '500':
 *         description: Failed to delete template
 */
router.delete("/:id", taskTemplateController.deleteTemplate);

/**
 * @openapi
 * /tasks/templates:
 *   get:
 *     summary: Get task templates with filtering
 *     description: Retrieves task templates based on various filter criteria
 *     tags:
 *       - Task Templates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: category
 *         in: query
 *         description: Filter by category
 *         schema:
 *           type: string
 *           enum: [academic, home, behavior, extracurricular, attendance, system]
 *       - name: createdBy
 *         in: query
 *         description: Filter by creator ID
 *         schema:
 *           type: string
 *       - name: visibility
 *         in: query
 *         description: Filter by visibility
 *         schema:
 *           type: string
 *           enum: [private, family, class, school, public]
 *       - name: schoolId
 *         in: query
 *         description: Filter by school ID
 *         schema:
 *           type: string
 *       - name: isFeatured
 *         in: query
 *         description: Filter featured templates
 *         schema:
 *           type: boolean
 *       - name: search
 *         in: query
 *         description: Search by title or description
 *         schema:
 *           type: string
 *       - name: gradeMin
 *         in: query
 *         description: Filter by minimum grade level
 *         schema:
 *           type: number
 *       - name: gradeMax
 *         in: query
 *         description: Filter by maximum grade level
 *         schema:
 *           type: number
 *       - name: ageMin
 *         in: query
 *         description: Filter by minimum age
 *         schema:
 *           type: number
 *       - name: ageMax
 *         in: query
 *         description: Filter by maximum age
 *         schema:
 *           type: number
 *       - name: difficulty
 *         in: query
 *         description: Filter by difficulty level
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard, challenging]
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         schema:
 *           type: number
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of items per page
 *         schema:
 *           type: number
 *           default: 20
 *       - name: sort
 *         in: query
 *         description: Field to sort by
 *         schema:
 *           type: string
 *           default: "title"
 *       - name: order
 *         in: query
 *         description: Sort order (asc or desc)
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "asc"
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
 *                         $ref: '#/components/schemas/TaskTemplate'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 45
 *                         page:
 *                           type: number
 *                           example: 1
 *                         limit:
 *                           type: number
 *                           example: 20
 *                         pages:
 *                           type: number
 *                           example: 3
 *       '500':
 *         description: Failed to get templates
 */
router.get("/", taskTemplateController.getTemplates);

/**
 * @openapi
 * /tasks/templates/{id}/use:
 *   post:
 *     summary: Use a template to create a task
 *     description: Creates a new task using an existing template
 *     tags:
 *       - Task Templates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the template to use
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Task details to override template defaults
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskFromTemplate'
 *     responses:
 *       '201':
 *         description: Task created from template successfully
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
 *                   example: "Task created from template successfully"
 *                 data:
 *                   type: object
 *       '400':
 *         description: Invalid template ID format or missing required fields
 *       '403':
 *         description: Not authorized to use this template
 *       '404':
 *         description: Template not found
 *       '500':
 *         description: Failed to create task from template
 */
router.post("/:id/use", taskTemplateController.useTemplate);

/**
 * @openapi
 * /tasks/templates/{id}/featured:
 *   put:
 *     summary: Toggle featured status for a template
 *     description: Marks or unmarks a template as featured (admin only)
 *     tags:
 *       - Task Templates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the template to feature/unfeature
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Template featured status toggled successfully
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
 *                   example: "Template featured successfully"
 *       '400':
 *         description: Invalid template ID format
 *       '403':
 *         description: Only administrators can feature or unfeature templates
 *       '404':
 *         description: Template not found
 *       '500':
 *         description: Failed to update template featured status
 */
router.put("/:id/featured", taskTemplateController.toggleFeatured);

/**
 * @openapi
 * /tasks/templates/system/defaults:
 *   post:
 *     summary: Create default system templates
 *     description: Initializes the system with default task templates (admin only)
 *     tags:
 *       - Task Templates
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Default templates initialized successfully
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
 *                   example: "Default templates initialized: 7 created, 0 already existed"
 *       '403':
 *         description: Only platform administrators can create system templates
 *       '500':
 *         description: Failed to create default templates
 */
router.post("/system/defaults", taskTemplateController.createDefaultTemplates);

/**
 * @openapi
 * /tasks/templates/suggestions/{studentId}:
 *   get:
 *     summary: Get suggested templates for a student
 *     description: Retrieves task templates suggested for a specific student based on their profile
 *     tags:
 *       - Task Templates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: studentId
 *         in: path
 *         description: ID of the student to get suggestions for
 *         required: true
 *         schema:
 *           type: string
 *       - name: grade
 *         in: query
 *         description: Student's grade level
 *         schema:
 *           type: number
 *       - name: age
 *         in: query
 *         description: Student's age
 *         schema:
 *           type: number
 *       - name: schoolId
 *         in: query
 *         description: Student's school ID
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Suggested templates retrieved successfully
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
 *                     featured:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TaskTemplate'
 *                     byCategory:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TaskTemplate'
 *                     studentProfile:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         grade:
 *                           type: number
 *                         age:
 *                           type: number
 *                         schoolId:
 *                           type: string
 *       '403':
 *         description: Not authorized to get suggested templates for this student
 *       '500':
 *         description: Failed to get suggested templates
 */
router.get(
  "/suggestions/:studentId",
  taskTemplateController.getSuggestedTemplates
);

module.exports = router;
