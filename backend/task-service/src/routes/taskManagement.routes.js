const express = require("express");
const router = express.Router();
const taskManagementController = require("../controllers/taskManagement.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// Apply authentication middleware to all routes
router.use(authMiddleware.verifyToken);

/**
 * Task Management Routes
 * 
 * Complete API endpoints for sophisticated task management system
 * with assignment strategies and visibility controls
 */

// ==================== TASK CRUD OPERATIONS ====================

/**
 * @route   POST /api/task-management/tasks
 * @desc    Create a new task with assignment strategy
 * @access  Platform Admin, School Admin, Teacher
 * @body    { title, description, category, pointValue, assignmentStrategy, targetCriteria, defaultVisibility }
 */
router.post("/tasks", taskManagementController.createTask);

/**
 * @route   GET /api/task-management/tasks
 * @desc    Get all tasks with filtering and pagination
 * @access  Platform Admin, School Admin, Teacher
 * @query   { status, category, assignmentStrategy, createdBy, page, limit, sortBy, sortOrder }
 */
router.get("/tasks", taskManagementController.getTasks);

/**
 * @route   GET /api/task-management/tasks/:id
 * @desc    Get a specific task by ID with assignment statistics
 * @access  Platform Admin, School Admin, Teacher
 */
router.get("/tasks/:id", taskManagementController.getTaskById);

/**
 * @route   PUT /api/task-management/tasks/:id
 * @desc    Update a task
 * @access  Platform Admin, School Admin, Teacher (own tasks)
 */
router.put("/tasks/:id", taskManagementController.updateTask);

/**
 * @route   DELETE /api/task-management/tasks/:id
 * @desc    Delete a task (soft delete)
 * @access  Platform Admin, School Admin, Teacher (own tasks)
 */
router.delete("/tasks/:id", taskManagementController.deleteTask);

// ==================== ASSIGNMENT MANAGEMENT ====================

/**
 * @route   GET /api/task-management/tasks/:id/assignments
 * @desc    Get assignments for a specific task
 * @access  Platform Admin, School Admin, Teacher
 * @query   { status, isActive, page, limit }
 */
router.get("/tasks/:id/assignments", taskManagementController.getTaskAssignments);

/**
 * @route   POST /api/task-management/tasks/:id/assign
 * @desc    Manually assign task to specific students
 * @access  Platform Admin, School Admin, Teacher
 * @body    { studentIds, schoolId, classId }
 */
router.post("/tasks/:id/assign", taskManagementController.assignTaskToStudents);

/**
 * @route   POST /api/task-management/tasks/:id/unassign
 * @desc    Remove assignment from students
 * @access  Platform Admin, School Admin, Teacher
 * @body    { studentIds }
 */
router.post("/tasks/:id/unassign", taskManagementController.unassignTaskFromStudents);

// ==================== VISIBILITY CONTROL ====================

/**
 * @route   POST /api/task-management/tasks/:id/visibility
 * @desc    Set visibility control for a task
 * @access  Parent, School Admin, Teacher
 * @body    { controllerType, controllerId, studentIds, isVisible, reason }
 */
router.post("/tasks/:id/visibility", taskManagementController.setTaskVisibility);

/**
 * @route   GET /api/task-management/tasks/:id/visibility
 * @desc    Get visibility controls for a task
 * @access  Platform Admin, School Admin, Teacher
 * @query   { controllerType, controllerId }
 */
router.get("/tasks/:id/visibility", taskManagementController.getTaskVisibilityControls);

/**
 * @route   GET /api/task-management/tasks/:id/visibility/:studentId
 * @desc    Check if a student can see a specific task
 * @access  Platform Admin, School Admin, Teacher, Parent
 * @query   { parentId, schoolId, classId }
 */
router.get("/tasks/:id/visibility/:studentId", taskManagementController.checkStudentTaskVisibility);

// ==================== STUDENT TASK RETRIEVAL ====================

/**
 * @route   GET /api/task-management/students/:studentId/tasks
 * @desc    Get visible tasks for a student with visibility filtering
 * @access  Student, Parent, School Admin, Teacher
 * @query   { status, category, parentId, schoolId, classId, page, limit }
 */
router.get("/students/:studentId/tasks", taskManagementController.getStudentTasks);

// ==================== BULK OPERATIONS ====================

/**
 * @route   POST /api/task-management/bulk/assign
 * @desc    Bulk assign multiple tasks to multiple students
 * @access  Platform Admin, School Admin, Teacher
 * @body    { taskIds, studentIds, schoolId, classId }
 */
router.post("/bulk/assign", taskManagementController.bulkAssignTasks);

/**
 * @route   POST /api/task-management/bulk/visibility
 * @desc    Bulk set visibility controls for multiple tasks
 * @access  Parent, School Admin, Teacher
 * @body    { taskIds, controllerType, controllerId, studentIds, isVisible, reason }
 */
router.post("/bulk/visibility", taskManagementController.bulkSetVisibility);

// ==================== ANALYTICS & REPORTING ====================

/**
 * @route   GET /api/task-management/analytics/assignments
 * @desc    Get assignment analytics and statistics
 * @access  Platform Admin, School Admin
 * @query   { schoolId, classId, dateFrom, dateTo, groupBy }
 */
router.get("/analytics/assignments", async (req, res) => {
  try {
    const { schoolId, classId, dateFrom, dateTo, groupBy = "day" } = req.query;
    
    // Build match filter
    const matchFilter = {};
    if (schoolId) matchFilter.schoolId = schoolId;
    if (classId) matchFilter.classId = classId;
    if (dateFrom || dateTo) {
      matchFilter.assignedAt = {};
      if (dateFrom) matchFilter.assignedAt.$gte = new Date(dateFrom);
      if (dateTo) matchFilter.assignedAt.$lte = new Date(dateTo);
    }

    const TaskAssignment = require("../models/taskAssignment.model");
    
    const analytics = await TaskAssignment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupBy === "month" ? "%Y-%m" : "%Y-%m-%d",
              date: "$assignedAt"
            }
          },
          totalAssignments: { $sum: 1 },
          activeAssignments: { $sum: { $cond: ["$isActive", 1, 0] } },
          completedAssignments: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          uniqueStudents: { $addToSet: "$studentId" },
          uniqueTasks: { $addToSet: "$taskId" }
        }
      },
      {
        $addFields: {
          uniqueStudentCount: { $size: "$uniqueStudents" },
          uniqueTaskCount: { $size: "$uniqueTasks" }
        }
      },
      {
        $project: {
          uniqueStudents: 0,
          uniqueTasks: 0
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error("Error getting assignment analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get assignment analytics",
      error: error.message
    });
  }
});

/**
 * @route   GET /api/task-management/analytics/visibility
 * @desc    Get visibility control analytics
 * @access  Platform Admin, School Admin
 * @query   { controllerType, dateFrom, dateTo }
 */
router.get("/analytics/visibility", async (req, res) => {
  try {
    const { controllerType, dateFrom, dateTo } = req.query;
    
    const matchFilter = {};
    if (controllerType) matchFilter.controllerType = controllerType;
    if (dateFrom || dateTo) {
      matchFilter.createdAt = {};
      if (dateFrom) matchFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) matchFilter.createdAt.$lte = new Date(dateTo);
    }

    const TaskVisibilityControl = require("../models/taskVisibilityControl.model");
    
    const analytics = await TaskVisibilityControl.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            controllerType: "$controllerType",
            isVisible: "$isVisible"
          },
          count: { $sum: 1 },
          uniqueControllers: { $addToSet: "$controllerId" },
          uniqueTasks: { $addToSet: "$taskId" },
          totalStudentsAffected: { $sum: { $size: "$controlledStudentIds" } }
        }
      },
      {
        $addFields: {
          uniqueControllerCount: { $size: "$uniqueControllers" },
          uniqueTaskCount: { $size: "$uniqueTasks" }
        }
      },
      {
        $project: {
          uniqueControllers: 0,
          uniqueTasks: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error("Error getting visibility analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get visibility analytics",
      error: error.message
    });
  }
});

// Parent task management routes
router.get('/parents/:parentId/available-tasks', 
  roleMiddleware(['parent', 'platform_admin']), 
  taskManagementController.getAvailableTasksForParent
);

router.get('/parents/:parentId/children/tasks', 
  roleMiddleware(['parent', 'platform_admin']), 
  taskManagementController.getTasksForParentChildren
);

// School task management routes
router.get('/schools/:schoolId/available-tasks', 
  roleMiddleware(['school_admin', 'teacher', 'platform_admin']), 
  taskManagementController.getAvailableTasksForSchool
);

router.get('/schools/:schoolId/students/tasks', 
  roleMiddleware(['school_admin', 'teacher', 'platform_admin']), 
  taskManagementController.getTasksForSchoolStudents
);

// Visibility control routes
router.post('/tasks/:taskId/visibility-control', 
  roleMiddleware(['parent', 'school_admin', 'teacher', 'platform_admin']), 
  taskManagementController.setTaskVisibilityControl
);

router.get('/visibility-controls/:controllerType/:controllerId', 
  roleMiddleware(['parent', 'school_admin', 'teacher', 'platform_admin']), 
  taskManagementController.getVisibilityControls
);

module.exports = router;