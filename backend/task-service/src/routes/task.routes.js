const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const authMiddleware = require("../middleware/auth.middleware");

/**
 * @openapi
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the task
 *         title:
 *           type: string
 *           description: Title of the task
 *         description:
 *           type: string
 *           description: Detailed description of the task
 *         category:
 *           type: string
 *           enum: [academic, home, behavior, extracurricular, attendance, system]
 *           description: Primary category of the task
 *         subCategory:
 *           type: string
 *           description: More specific subcategory (e.g., math, reading, chore)
 *         pointValue:
 *           type: number
 *           description: Points awarded upon completion
 *           minimum: 0
 *         createdBy:
 *           type: string
 *           description: ID of the user who created the task
 *         creatorRole:
 *           type: string
 *           enum: [student, parent, teacher, school_admin, social_worker, platform_admin, system]
 *           description: Role of the creator
 *         assignedTo:
 *           type: string
 *           description: ID of the student this task is assigned to
 *         status:
 *           type: string
 *           enum: [pending, completed, pending_approval, approved, rejected, expired]
 *           description: Current status of the task
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: When the task is due
 *         completedDate:
 *           type: string
 *           format: date-time
 *           description: When the task was marked as completed
 *         approvedBy:
 *           type: string
 *           description: ID of the user who approved the task
 *         approverRole:
 *           type: string
 *           enum: [parent, teacher, school_admin, social_worker, platform_admin, system]
 *           description: Role of the approver
 *         approvalDate:
 *           type: string
 *           format: date-time
 *           description: When the task was approved
 *         completion:
 *           type: object
 *           properties:
 *             note:
 *               type: string
 *               description: Notes provided during completion
 *             evidence:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [image, document, link, text]
 *                   url:
 *                     type: string
 *                   content:
 *                     type: string
 *         isRecurring:
 *           type: boolean
 *           description: Whether this is a recurring task
 *         recurringSchedule:
 *           type: object
 *           properties:
 *             frequency:
 *               type: string
 *               enum: [daily, weekly, monthly]
 *             daysOfWeek:
 *               type: array
 *               items:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 6
 *             interval:
 *               type: number
 *               default: 1
 *             endDate:
 *               type: string
 *               format: date-time
 *         parentTaskId:
 *           type: string
 *           description: ID of the parent recurring task (for task instances)
 *         instanceDate:
 *           type: string
 *           format: date-time
 *           description: Date of this recurring task instance
 *         requiresApproval:
 *           type: boolean
 *           default: true
 *           description: Whether this task requires approval when completed
 *         approverType:
 *           type: string
 *           enum: [parent, teacher, school_admin, social_worker, platform_admin, system, none]
 *           description: Who should approve this task
 *         specificApproverId:
 *           type: string
 *           description: ID of specific user who should approve (if applicable)
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard, challenging]
 *           description: Difficulty level of the task
 *         schoolId:
 *           type: string
 *           description: ID of associated school (if applicable)
 *         classId:
 *           type: string
 *           description: ID of associated class (if applicable)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Task creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     TaskCreate:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - pointValue
 *         - assignedTo
 *       properties:
 *         title:
 *           type: string
 *           example: "Complete math worksheet"
 *         description:
 *           type: string
 *           example: "Finish pages 10-12 in the math workbook"
 *         category:
 *           type: string
 *           enum: [academic, home, behavior, extracurricular, attendance, system]
 *           example: "academic"
 *         subCategory:
 *           type: string
 *           example: "Math"
 *         pointValue:
 *           type: number
 *           example: 15
 *         assignedTo:
 *           type: string
 *           example: "60f8a9b5e6b3f32f8c9a8d7e"
 *         dueDate:
 *           type: string
 *           format: date-time
 *           example: "2023-11-15T18:00:00.000Z"
 *         isRecurring:
 *           type: boolean
 *           example: false
 *         recurringSchedule:
 *           type: object
 *           properties:
 *             frequency:
 *               type: string
 *               enum: [daily, weekly, monthly]
 *               example: "weekly"
 *             daysOfWeek:
 *               type: array
 *               items:
 *                 type: number
 *               example: [1, 3, 5]
 *             interval:
 *               type: number
 *               example: 1
 *         requiresApproval:
 *           type: boolean
 *           example: true
 *         approverType:
 *           type: string
 *           enum: [parent, teacher, school_admin, social_worker, platform_admin, system, none]
 *           example: "teacher"
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard, challenging]
 *           example: "medium"
 */

// All routes require authentication
router.use(authMiddleware.verifyToken);

/**
 * @openapi
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     description: Creates a new task with the provided details
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Task details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskCreate'
 *     responses:
 *       '201':
 *         description: Task created successfully
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
 *                   example: "Task created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Task'
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
 *                   example: "Missing required fields: title, category, assignedTo, and pointValue are required"
 *       '403':
 *         description: Not authorized to create tasks
 *       '500':
 *         description: Failed to create task
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
 *                   example: "Failed to create task"
 *                 error:
 *                   type: string
 */
router.post(
  "/",
  authMiddleware.checkRoles([
    "parent",
    "teacher",
    "school_admin",
    "social_worker",
    "platform_admin",
  ]),
  taskController.createTask
);

router.route('/approval').get(taskController.getTasksForApproval)


/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     summary: Get a specific task by ID
 *     description: Retrieves detailed information about a task by its ID
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the task to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       '400':
 *         description: Invalid task ID format
 *       '403':
 *         description: Not authorized to view this task
 *       '404':
 *         description: Task not found
 *       '500':
 *         description: Failed to get task
 */
router.get("/:id", taskController.getTaskById);

/**
 * @openapi
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     description: Updates a task with the provided details
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the task to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated task details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               subCategory:
 *                 type: string
 *               pointValue:
 *                 type: number
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               isRecurring:
 *                 type: boolean
 *               recurringSchedule:
 *                 type: object
 *               requiresApproval:
 *                 type: boolean
 *               approverType:
 *                 type: string
 *               difficulty:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Task updated successfully
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
 *                   example: "Task updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       '400':
 *         description: Invalid task ID format
 *       '403':
 *         description: Not authorized to update this task
 *       '404':
 *         description: Task not found
 *       '500':
 *         description: Failed to update task
 */
router.put(
  "/:id",
  authMiddleware.checkRoles([
    "parent",
    "teacher",
    "school_admin",
    "social_worker",
    "platform_admin",
  ]),
  taskController.updateTask
);

/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task (soft delete)
 *     description: Marks a task as deleted (soft delete)
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the task to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Task deleted successfully
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
 *                   example: "Task deleted successfully"
 *       '400':
 *         description: Invalid task ID format
 *       '403':
 *         description: Not authorized to delete this task
 *       '404':
 *         description: Task not found
 *       '500':
 *         description: Failed to delete task
 */
router.delete(
  "/:id",
  authMiddleware.checkRoles([
    "parent",
    "teacher",
    "school_admin",
    "social_worker",
    "platform_admin",
  ]),
  taskController.deleteTask
);

/**
 * @openapi
 * /tasks/by-role/student:
 *   get:
 *     summary: Get tasks for a student with completion status
 *     description: Retrieves tasks assigned to the student with their completion information and visibility filtering
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: role
 *         in: query
 *         description: User role (must be "student")
 *         required: true
 *         schema:
 *           type: string
 *           enum: [student]
 *       - name: category
 *         in: query
 *         description: Task category
 *         schema:
 *           type: string
 *       - name: subCategory
 *         in: query
 *         description: Task subcategory
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         description: Task status
 *         schema:
 *           type: string
 *           enum: [pending, completed, pending_approval, approved, rejected, expired]
 *       - name: startDate
 *         in: query
 *         description: Filter tasks created after this date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         description: Filter tasks created before this date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: dueDate
 *         in: query
 *         description: Filter tasks due on this date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: schoolId
 *         in: query
 *         description: Filter by school ID
 *         schema:
 *           type: string
 *       - name: classId
 *         in: query
 *         description: Filter by class ID
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
 *       - name: sort
 *         in: query
 *         description: Field to sort by
 *         schema:
 *           type: string
 *           default: dueDate
 *       - name: order
 *         in: query
 *         description: Sort order (asc or desc)
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       '200':
 *         description: Tasks retrieved successfully
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/Task'
 *                       - type: object
 *                         properties:
 *                           completionStatus:
 *                             type: object
 *                             properties:
 *                               status:
 *                                 type: string
 *                               completedAt:
 *                                 type: string
 *                                 format: date-time
 *                               hasSubmitted:
 *                                 type: boolean
 *       '400':
 *         description: Invalid role or missing parameters
 *       '500':
 *         description: Server error
 */
router.get(
  "/by-role/student",
  authMiddleware.checkRoles(["student"]),
  taskController.getStudentTasks
);

/**
 * @openapi
 * /tasks/by-role/student/{id}:
 *   get:
 *     summary: Get a specific task for a student with completion status
 *     description: Retrieves a specific task assigned to the student with completion information and visibility checks
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the task to retrieve
 *         required: true
 *         schema:
 *           type: string
 *       - name: role
 *         in: query
 *         description: User role (must be "student")
 *         required: true
 *         schema:
 *           type: string
 *           enum: [student]
 *     responses:
 *       '200':
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Task'
 *                     - type: object
 *                       properties:
 *                         completionStatus:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               enum: [pending, completed, pending_approval, approved, rejected]
 *                             completedAt:
 *                               type: string
 *                               format: date-time
 *                             note:
 *                               type: string
 *                             evidence:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   type:
 *                                     type: string
 *                                     enum: [image, document, link, text]
 *                                   url:
 *                                     type: string
 *                                   content:
 *                                     type: string
 *                             approvalDate:
 *                               type: string
 *                               format: date-time
 *                             approvedBy:
 *                               type: string
 *                             approverRole:
 *                               type: string
 *                             hasSubmitted:
 *                               type: boolean
 *       '400':
 *         description: Invalid role or task ID format
 *       '403':
 *         description: Not authorized to view this task or task is hidden
 *       '404':
 *         description: Task not found
 *       '500':
 *         description: Server error
 */
router.get(
  "/by-role/student/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRoles(["student"]),
  taskController.getStudentTaskById
);

/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: Get tasks with filtering
 *     description: Retrieves tasks based on various filter criteria
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: assignedTo
 *         in: query
 *         description: ID of student assigned to tasks
 *         schema:
 *           type: string
 *       - name: createdBy
 *         in: query
 *         description: ID of user who created tasks
 *         schema:
 *           type: string
 *       - name: category
 *         in: query
 *         description: Task category
 *         schema:
 *           type: string
 *       - name: subCategory
 *         in: query
 *         description: Task subcategory
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         description: Task status
 *         schema:
 *           type: string
 *           enum: [pending, completed, pending_approval, approved, rejected, expired]
 *       - name: startDate
 *         in: query
 *         description: Filter tasks due after this date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         description: Filter tasks due before this date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: isRecurring
 *         in: query
 *         description: Filter recurring tasks
 *         schema:
 *           type: boolean
 *       - name: schoolId
 *         in: query
 *         description: Filter by school ID
 *         schema:
 *           type: string
 *       - name: classId
 *         in: query
 *         description: Filter by class ID
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
 *       - name: sort
 *         in: query
 *         description: Field to sort by
 *         schema:
 *           type: string
 *           default: dueDate
 *       - name: order
 *         in: query
 *         description: Sort order (asc or desc)
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       '200':
 *         description: Tasks retrieved successfully
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
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
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
 *         description: Failed to get tasks
 */
router.get("/", taskController.getTasks);

/**
 * @openapi
 * /tasks/{id}/complete:
 *   post:
 *     summary: Mark a task as completed
 *     description: Student marks a task as completed, potentially with evidence
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the task to mark as completed
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Completion details
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 description: Note about task completion
 *                 example: "I finished all the math problems"
 *               evidence:
 *                 type: array
 *                 description: Evidence of task completion
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [image, document, link, text]
 *                       example: "image"
 *                     url:
 *                       type: string
 *                       example: "https://example.com/evidence1.jpg"
 *                     content:
 *                       type: string
 *                       example: "Image of completed work"
 *     responses:
 *       '200':
 *         description: Task marked as completed
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
 *                   example: "Task marked as completed, awaiting approval"
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       '400':
 *         description: Invalid request or task already approved
 *       '403':
 *         description: Only the assigned student can mark this task as completed
 *       '404':
 *         description: Task not found
 *       '500':
 *         description: Failed to complete task
 */
router.post("/:id/complete", taskController.completeTask);

/**
 * @openapi
 * /tasks/by-role/student/{id}/submit:
 *   post:
 *     summary: Submit task completion using TaskCompletion model
 *     description: Student submits task completion with evidence and notes, creating individual tracking record
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the task to submit completion for
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Task completion details
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 description: Student's note about task completion
 *                 example: "I completed all exercises and checked my answers twice"
 *               evidence:
 *                 type: array
 *                 description: Evidence of task completion
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [image, document, link, text]
 *                       example: "image"
 *                     url:
 *                       type: string
 *                       example: "https://example.com/completed-worksheet.jpg"
 *                     content:
 *                       type: string
 *                       example: "Photo of completed math worksheet"
 *     responses:
 *       '200':
 *         description: Task completion submitted successfully
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
 *                   example: "Task submitted successfully, awaiting approval"
 *                 data:
 *                   type: object
 *                   properties:
 *                     task:
 *                       $ref: '#/components/schemas/Task'
 *                     completion:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         taskId:
 *                           type: string
 *                         studentId:
 *                           type: string
 *                         status:
 *                           type: string
 *                           enum: [pending_approval, approved]
 *                         note:
 *                           type: string
 *                         evidence:
 *                           type: array
 *                         completedAt:
 *                           type: string
 *                           format: date-time
 *                         approvalDate:
 *                           type: string
 *                           format: date-time
 *       '400':
 *         description: Invalid task ID, student profile not found, or task already approved
 *       '403':
 *         description: Not authorized to submit this task or task is hidden
 *       '404':
 *         description: Task not found
 *       '500':
 *         description: Failed to submit task completion
 */
router.post(
  "/by-role/student/:id/submit",
  authMiddleware.verifyToken,
  authMiddleware.checkRoles(["student"]),
  taskController.submitTaskCompletion
);

/**
 * @openapi
 * /tasks/by-role/parent:
 *   get:
 *     summary: Get tasks for a parent with visibility information
 *     description: Retrieves tasks assigned to the parent and their children with visibility control information
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: role
 *         in: query
 *         description: User role (must be "parent")
 *         required: true
 *         schema:
 *           type: string
 *           enum: [parent]
 *       - name: category
 *         in: query
 *         description: Task category
 *         schema:
 *           type: string
 *           enum: [academic, home, behavior, extracurricular, attendance, system]
 *       - name: subCategory
 *         in: query
 *         description: Task subcategory
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         description: Task status
 *         schema:
 *           type: string
 *           enum: [pending, completed, pending_approval, approved, rejected, expired]
 *       - name: startDate
 *         in: query
 *         description: Filter tasks created after this date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         description: Filter tasks created before this date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: dueDate
 *         in: query
 *         description: Filter tasks due on this date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: schoolId
 *         in: query
 *         description: Filter by school ID
 *         schema:
 *           type: string
 *       - name: classId
 *         in: query
 *         description: Filter by class ID
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
 *       - name: sort
 *         in: query
 *         description: Field to sort by
 *         schema:
 *           type: string
 *           default: dueDate
 *       - name: order
 *         in: query
 *         description: Sort order (asc or desc)
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       '200':
 *         description: Tasks retrieved successfully
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/Task'
 *                       - type: object
 *                         properties:
 *                           visibleToChildren:
 *                             type: array
 *                             items:
 *                               type: string
 *                             description: Array of child IDs who can see this task
 *                             example: ["60f8a9b5e6b3f32f8c9a8d7e", "60f8a9b5e6b3f32f8c9a8d7f"]
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     pages:
 *                       type: integer
 *                       example: 2
 *       '400':
 *         description: Invalid role or missing parameters
 *       '500':
 *         description: Server error
 */
router.get(
  "/by-role/parent",
  authMiddleware.verifyToken,
  authMiddleware.checkRoles(["parent"]),
  taskController.getParentTasks
);

/**
 * @openapi
 * /tasks/{id}/review:
 *   post:
 *     summary: Approve or reject a completed task
 *     description: Parent, teacher, or admin reviews a completed task
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the task to review
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Review details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *                 example: "approve"
 *                 description: Whether to approve or reject the task
 *               feedback:
 *                 type: string
 *                 example: "Great job on the math problems!"
 *                 description: Feedback for the student
 *     responses:
 *       '200':
 *         description: Task reviewed successfully
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
 *                   example: "Task approved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       '400':
 *         description: Invalid action or task not awaiting approval
 *       '403':
 *         description: Not authorized to review this task
 *       '404':
 *         description: Task not found
 *       '500':
 *         description: Failed to review task
 */
router.post(
  "/:id/review",
  authMiddleware.checkRoles([
    "parent",
    "teacher",
    "school_admin",
    "social_worker",
    "platform_admin",
  ]),
  taskController.reviewTask
);

/**
 * @openapi
 * /tasks/stats/analytics:
 *   get:
 *     summary: Get task statistics
 *     description: Retrieves task statistics and analytics
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: studentId
 *         in: query
 *         description: Filter by student ID
 *         schema:
 *           type: string
 *       - name: schoolId
 *         in: query
 *         description: Filter by school ID
 *         schema:
 *           type: string
 *       - name: classId
 *         in: query
 *         description: Filter by class ID
 *         schema:
 *           type: string
 *       - name: startDate
 *         in: query
 *         description: Start date for statistics (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         description: End date for statistics (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: groupBy
 *         in: query
 *         description: How to group the statistics
 *         schema:
 *           type: string
 *           enum: [category, status, creatorRole, date]
 *           default: category
 *     responses:
 *       '200':
 *         description: Statistics retrieved successfully
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
 *                     statistics:
 *                       type: array
 *                       items:
 *                         type: object
 *                     summary:
 *                       type: object
 *                     groupBy:
 *                       type: string
 *                     filters:
 *                       type: object
 *       '403':
 *         description: Not authorized to view these statistics
 *       '500':
 *         description: Failed to get task statistics
 */
router.get(
  "/stats/analytics",
  authMiddleware.checkRoles([
    "teacher",
    "school_admin",
    "social_worker",
    "platform_admin",
  ]),
  taskController.getTaskStatistics
);

/**
 * @openapi
 * /tasks/student/{studentId}/summary:
 *   get:
 *     summary: Get tasks summary for a student
 *     description: Retrieves dashboard data summarizing tasks for a student
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: studentId
 *         in: path
 *         description: ID of the student
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Summary retrieved successfully
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
 *                     summary:
 *                       type: object
 *                     categorySummary:
 *                       type: array
 *                       items:
 *                         type: object
 *                     upcomingTasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 *                     recentlyCompletedTasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 *       '403':
 *         description: Not authorized to view this student's tasks summary
 *       '500':
 *         description: Failed to get student tasks summary
 */
router.get(
  "/student/:studentId/summary",
  taskController.getStudentTasksSummary
);

/**
 * @openapi
 * /tasks/{id}/comments:
 *   post:
 *     summary: Add a comment to a task
 *     description: Adds a comment to a task from a student, parent, teacher, or admin
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the task to comment on
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Comment details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "How are you progressing on this task?"
 *     responses:
 *       '200':
 *         description: Comment added successfully
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
 *                   example: "Comment added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     createdBy:
 *                       type: string
 *                     creatorRole:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: Comment text is required or invalid task ID
 *       '403':
 *         description: Not authorized to comment on this task
 *       '404':
 *         description: Task not found
 *       '500':
 *         description: Failed to add comment
 */
router.post("/:id/comments", taskController.addComment);

/**
 * @openapi
 * /tasks/{id}/generate-instance:
 *   post:
 *     summary: Generate next recurring task instance
 *     description: Creates the next instance of a recurring task
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the task instance to generate next from
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '201':
 *         description: New task instance generated successfully
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
 *                   example: "New task instance generated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       '200':
 *         description: Instance already exists or end date reached
 *       '400':
 *         description: Invalid task ID or not a recurring task
 *       '403':
 *         description: Not authorized to generate task instances
 *       '404':
 *         description: Task not found
 *       '500':
 *         description: Failed to generate next task instance
 */
router.post(
  "/:id/generate-instance",
  authMiddleware.checkRoles([
    "parent",
    "teacher",
    "school_admin",
    "social_worker",
    "platform_admin",
  ]),
  taskController.generateNextInstance
);

/**
 * @openapi
 * /tasks/visibility/toggle:
 *   post:
 *     summary: Toggle task visibility for a student
 *     description: Parents, teachers, and admins can hide or show tasks for specific students
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Visibility toggle details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - studentId
 *               - isVisible
 *             properties:
 *               taskId:
 *                 type: string
 *                 description: ID of the task to toggle visibility
 *                 example: "60f8a9b5e6b3f32f8c9a8d7e"
 *               studentId:
 *                 type: string
 *                 description: ID of the student for whom visibility is being toggled
 *                 example: "60f8a9b5e6b3f32f8c9a8d7f"
 *               isVisible:
 *                 type: boolean
 *                 description: Whether the task should be visible to the student
 *                 example: false
 *     responses:
 *       '200':
 *         description: Visibility toggled successfully
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
 *                   example: "Task visibility hidden successfully."
 *                 data:
 *                   type: object
 *       '400':
 *         description: Missing or invalid fields
 *       '403':
 *         description: Not authorized to toggle visibility
 *       '404':
 *         description: Task not found
 *       '500':
 *         description: Failed to toggle visibility
 */
router.post(
  "/visibility/toggle",
  authMiddleware.checkRoles([
    "parent",
    "teacher",
    "school_admin",
    "platform_admin",
    "sub_admin"
  ]),
  taskController.toggleTaskVisibility
);

module.exports = router;
