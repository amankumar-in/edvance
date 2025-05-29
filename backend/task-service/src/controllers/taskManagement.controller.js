const Task = require("../models/task.model");
const TaskCategory = require("../models/taskCategory.model");
const TaskAssignment = require("../models/taskAssignment.model");
const TaskVisibilityControl = require("../models/taskVisibilityControl.model");
const TaskAssignmentService = require("../services/taskAssignment.service");
const VisibilityResolutionService = require("../services/visibilityResolution.service");
const axios = require("axios");
const mongoose = require("mongoose");

/**
 * Task Management Controller
 * 
 * Handles all task-related operations including:
 * - CRUD operations for tasks
 * - Task assignment management
 * - Visibility control management
 * - Student task retrieval with visibility filtering
 */
class TaskManagementController {

  // ==================== TASK CRUD OPERATIONS ====================

  /**
   * Create a new task with assignment strategy
   * POST /api/task-management/tasks
   */
  async createTask(req, res) {
    try {
      const {
        title,
        description,
        category,
        subCategory,
        pointValue,
        dueDate,
        assignmentStrategy,
        targetCriteria,
        defaultVisibility,
        attachments,
        metadata
      } = req.body;

      // Validate required fields
      if (!title || !description || !category || !pointValue || !assignmentStrategy) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: title, description, category, pointValue, assignmentStrategy"
        });
      }

      // Validate and get category details
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID format",
        });
      }

      const categoryDoc = await TaskCategory.findById(category);
      if (!categoryDoc || !categoryDoc.isActive) {
        return res.status(400).json({
          success: false,
          message: "Category not found or inactive",
        });
      }

      // Create task
      const task = new Task({
        title,
        description,
        category,
        categoryType: categoryDoc.type, // Set categoryType from the referenced category
        subCategory,
        pointValue,
        dueDate,
        createdBy: req.user.id,
        creatorRoles: req.user.roles,
        
        // New fields for sophisticated assignment
        assignmentStrategy,
        targetCriteria: targetCriteria || {},
        defaultVisibility: defaultVisibility || {
          forParents: true,
          forSchools: true,
          forStudents: false
        },
        
        // Keep existing required fields for compatibility
        assignedTo: {
          role: targetCriteria?.roles?.[0] || "student",
          selectedPeopleIds: []
        },
        status: "pending",
        visibility: "school",
        attachments: attachments || [],
        metadata: metadata || {}
      });

      const savedTask = await task.save();

      // Auto-assign based on strategy
      let assignmentResult = null;
      if (assignmentStrategy !== "manual") {
        assignmentResult = await TaskAssignmentService.assignTaskToTargets(
          savedTask._id,
          assignmentStrategy,
          targetCriteria,
          req.user.id,
          req.user.roles[0]
        );
      }

      res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: {
          task: savedTask,
          assignments: assignmentResult
        }
      });

    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create task",
        error: error.message
      });
    }
  }

  /**
   * Get all tasks with filtering and pagination
   * GET /api/task-management/tasks
   */
  async getTasks(req, res) {
    try {
      const {
        status,
        category,
        assignmentStrategy,
        createdBy,
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = "desc"
      } = req.query;

      // Build filter
      const filter = { isDeleted: { $ne: true } };
      if (status) filter.status = status;
      if (category) filter.category = category;
      if (assignmentStrategy) filter.assignmentStrategy = assignmentStrategy;
      if (createdBy) filter.createdBy = createdBy;

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

      // Get tasks with assignment counts and populated category
      const tasks = await Task.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "taskcategories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetails"
          }
        },
        {
          $lookup: {
            from: "taskassignments",
            localField: "_id",
            foreignField: "taskId",
            as: "assignments"
          }
        },
        {
          $addFields: {
            assignmentCount: { $size: "$assignments" },
            activeAssignmentCount: {
              $size: {
                $filter: {
                  input: "$assignments",
                  cond: { $eq: ["$$this.isActive", true] }
                }
              }
            },
            // Add category details to the task object
            categoryInfo: { $arrayElemAt: ["$categoryDetails", 0] }
          }
        },
        { $sort: sort },
        { $skip: skip },
        { $limit: parseInt(limit) },
        { $project: { assignments: 0, categoryDetails: 0 } } // Remove arrays from output
      ]);

      // Get total count
      const totalCount = await Task.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: {
          tasks,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            totalCount,
            hasNext: skip + tasks.length < totalCount,
            hasPrev: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      console.error("Error getting tasks:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get tasks",
        error: error.message
      });
    }
  }

  /**
   * Get a specific task by ID
   * GET /api/task-management/tasks/:id
   */
  async getTaskById(req, res) {
    try {
      const { id } = req.params;

      const task = await Task.findById(id).populate('category', 'name description icon color type');
      if (!task || task.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Task not found"
        });
      }

      // Get assignment statistics
      const assignmentStats = await TaskAssignment.aggregate([
        { $match: { taskId: task._id } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ["$isActive", 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } }
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: {
          task,
          assignmentStats: assignmentStats[0] || {
            total: 0,
            active: 0,
            completed: 0,
            pending: 0
          }
        }
      });

    } catch (error) {
      console.error("Error getting task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get task",
        error: error.message
      });
    }
  }

  /**
   * Update a task
   * PUT /api/task-management/tasks/:id
   */
  async updateTask(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Remove fields that shouldn't be updated directly
      delete updates._id;
      delete updates.createdBy;
      delete updates.createdAt;
      delete updates.creatorRoles;

      const task = await Task.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: task
      });

    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update task",
        error: error.message
      });
    }
  }

  /**
   * Delete a task (soft delete)
   * DELETE /api/task-management/tasks/:id
   */
  async deleteTask(req, res) {
    try {
      const { id } = req.params;

      const task = await Task.findByIdAndUpdate(
        id,
        { 
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.user.id
        },
        { new: true }
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found"
        });
      }

      // Deactivate all assignments
      await TaskAssignment.updateMany(
        { taskId: id },
        { 
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: req.user.id
        }
      );

      res.status(200).json({
        success: true,
        message: "Task deleted successfully"
      });

    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete task",
        error: error.message
      });
    }
  }

  // ==================== ASSIGNMENT MANAGEMENT ====================

  /**
   * Get assignments for a task
   * GET /api/task-management/tasks/:id/assignments
   */
  async getTaskAssignments(req, res) {
    try {
      const { id } = req.params;
      const { status, isActive, page = 1, limit = 50 } = req.query;

      // Build filter
      const filter = { taskId: id };
      if (status) filter.status = status;
      if (isActive !== undefined) filter.isActive = isActive === "true";

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const assignments = await TaskAssignment.find(filter)
        .populate("studentId", "name email")
        .sort({ assignedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalCount = await TaskAssignment.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: {
          assignments,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            totalCount,
            hasNext: skip + assignments.length < totalCount,
            hasPrev: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      console.error("Error getting task assignments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get task assignments",
        error: error.message
      });
    }
  }

  /**
   * Manually assign task to specific students
   * POST /api/task-management/tasks/:id/assign
   */
  async assignTaskToStudents(req, res) {
    try {
      const { id } = req.params;
      const { studentIds, schoolId, classId } = req.body;

      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "studentIds array is required"
        });
      }

      const result = await TaskAssignmentService.assignTaskToSpecificStudents(
        id,
        studentIds,
        req.user.id,
        req.user.roles[0],
        { schoolId, classId }
      );

      res.status(200).json({
        success: true,
        message: "Task assigned successfully",
        data: result
      });

    } catch (error) {
      console.error("Error assigning task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to assign task",
        error: error.message
      });
    }
  }

  /**
   * Remove assignment from students
   * POST /api/task-management/tasks/:id/unassign
   */
  async unassignTaskFromStudents(req, res) {
    try {
      const { id } = req.params;
      const { studentIds } = req.body;

      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "studentIds array is required"
        });
      }

      const result = await TaskAssignmentService.deactivateAssignments(
        id,
        studentIds,
        req.user.id
      );

      res.status(200).json({
        success: true,
        message: "Task unassigned successfully",
        data: result
      });

    } catch (error) {
      console.error("Error unassigning task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to unassign task",
        error: error.message
      });
    }
  }

  // ==================== VISIBILITY CONTROL ====================

  /**
   * Set visibility control for a task
   * POST /api/task-management/tasks/:id/visibility
   */
  async setTaskVisibility(req, res) {
    try {
      const { id } = req.params;
      const { controllerType, controllerId, studentIds, isVisible, reason } = req.body;

      // Validate required fields
      if (!controllerType || !controllerId || !Array.isArray(studentIds)) {
        return res.status(400).json({
          success: false,
          message: "controllerType, controllerId, and studentIds array are required"
        });
      }

      // Validate controller type
      if (!["parent", "school", "class"].includes(controllerType)) {
        return res.status(400).json({
          success: false,
          message: "controllerType must be 'parent', 'school', or 'class'"
        });
      }

      const result = await VisibilityResolutionService.setVisibilityControl(
        id,
        controllerType,
        controllerId,
        studentIds,
        isVisible !== undefined ? isVisible : true,
        {
          id: req.user.id,
          role: req.user.roles[0]
        },
        reason
      );

      res.status(200).json({
        success: true,
        message: "Visibility control set successfully",
        data: result
      });

    } catch (error) {
      console.error("Error setting visibility control:", error);
      res.status(500).json({
        success: false,
        message: "Failed to set visibility control",
        error: error.message
      });
    }
  }

  /**
   * Get visibility controls for a task
   * GET /api/task-management/tasks/:id/visibility
   */
  async getTaskVisibilityControls(req, res) {
    try {
      const { id } = req.params;
      const { controllerType, controllerId } = req.query;

      const filter = { taskId: id };
      if (controllerType) filter.controllerType = controllerType;
      if (controllerId) filter.controllerId = controllerId;

      const controls = await TaskVisibilityControl.find(filter)
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: controls
      });

    } catch (error) {
      console.error("Error getting visibility controls:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get visibility controls",
        error: error.message
      });
    }
  }

  /**
   * Check if a student can see a task
   * GET /api/task-management/tasks/:id/visibility/:studentId
   */
  async checkStudentTaskVisibility(req, res) {
    try {
      const { id, studentId } = req.params;
      const { parentId, schoolId, classId } = req.query;

      const context = {};
      if (parentId) context.parentId = parentId;
      if (schoolId) context.schoolId = schoolId;
      if (classId) context.classId = classId;

      const result = await VisibilityResolutionService.canStudentSeeTask(
        id,
        studentId,
        context
      );

      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error("Error checking student visibility:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check student visibility",
        error: error.message
      });
    }
  }

  // ==================== STUDENT TASK RETRIEVAL ====================

  /**
   * Get visible tasks for a student
   * GET /api/task-management/students/:studentId/tasks
   */
  async getStudentTasks(req, res) {
    try {
      const { studentId } = req.params;
      const { 
        status, 
        category, 
        parentId, 
        schoolId, 
        classId,
        page = 1, 
        limit = 20 
      } = req.query;

      const context = {};
      if (parentId) context.parentId = parentId;
      if (schoolId) context.schoolId = schoolId;
      if (classId) context.classId = classId;

      const options = {
        status,
        category,
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit)
      };

      const result = await VisibilityResolutionService.getVisibleTasksForStudent(
        studentId,
        context,
        options
      );

      res.status(200).json({
        success: true,
        data: {
          tasks: result.tasks,
          pagination: {
            currentPage: parseInt(page),
            totalAssignments: result.totalAssignments,
            visibleCount: result.visibleCount,
            hasNext: result.tasks.length === parseInt(limit),
            hasPrev: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      console.error("Error getting student tasks:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get student tasks",
        error: error.message
      });
    }
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk assign tasks to students
   * POST /api/task-management/bulk/assign
   */
  async bulkAssignTasks(req, res) {
    try {
      const { taskIds, studentIds, schoolId, classId } = req.body;

      if (!Array.isArray(taskIds) || !Array.isArray(studentIds)) {
        return res.status(400).json({
          success: false,
          message: "taskIds and studentIds must be arrays"
        });
      }

      const results = [];
      for (const taskId of taskIds) {
        try {
          const result = await TaskAssignmentService.assignTaskToSpecificStudents(
            taskId,
            studentIds,
            req.user.id,
            req.user.roles[0],
            { schoolId, classId }
          );
          results.push({ taskId, success: true, data: result });
        } catch (error) {
          results.push({ taskId, success: false, error: error.message });
        }
      }

      res.status(200).json({
        success: true,
        message: "Bulk assignment completed",
        data: results
      });

    } catch (error) {
      console.error("Error in bulk assignment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to perform bulk assignment",
        error: error.message
      });
    }
  }

  /**
   * Bulk set visibility controls
   * POST /api/task-management/bulk/visibility
   */
  async bulkSetVisibility(req, res) {
    try {
      const { taskIds, controllerType, controllerId, studentIds, isVisible, reason } = req.body;

      if (!Array.isArray(taskIds)) {
        return res.status(400).json({
          success: false,
          message: "taskIds must be an array"
        });
      }

      const results = [];
      for (const taskId of taskIds) {
        try {
          const result = await VisibilityResolutionService.setVisibilityControl(
            taskId,
            controllerType,
            controllerId,
            studentIds,
            isVisible,
            {
              id: req.user.id,
              role: req.user.roles[0]
            },
            reason
          );
          results.push({ taskId, success: true, data: result });
        } catch (error) {
          results.push({ taskId, success: false, error: error.message });
        }
      }

      res.status(200).json({
        success: true,
        message: "Bulk visibility control completed",
        data: results
      });

    } catch (error) {
      console.error("Error in bulk visibility control:", error);
      res.status(500).json({
        success: false,
        message: "Failed to perform bulk visibility control",
        error: error.message
      });
    }
  }

  /**
   * Get available tasks for a parent to control
   */
  async getAvailableTasksForParent(req, res) {
    try {
      const { parentId } = req.params;
      const { category, page = 1, limit = 50 } = req.query;

      const skip = (page - 1) * limit;
      const options = {
        category,
        limit: parseInt(limit),
        skip
      };

      const result = await VisibilityResolutionService.getAvailableTasksForParent(parentId, options);

      res.status(200).json({
        success: true,
        message: 'Available tasks retrieved successfully',
        data: result
      });

    } catch (error) {
      console.error('Error getting available tasks for parent:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get available tasks',
        error: error.message
      });
    }
  }

  /**
   * Get available tasks for a school to control
   */
  async getAvailableTasksForSchool(req, res) {
    try {
      const { schoolId } = req.params;
      const { category, page = 1, limit = 50 } = req.query;

      const skip = (page - 1) * limit;
      const options = {
        category,
        limit: parseInt(limit),
        skip
      };

      const result = await VisibilityResolutionService.getAvailableTasksForSchool(schoolId, options);

      res.status(200).json({
        success: true,
        message: 'Available tasks retrieved successfully',
        data: result
      });

    } catch (error) {
      console.error('Error getting available tasks for school:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get available tasks',
        error: error.message
      });
    }
  }

  /**
   * Set visibility control for a task
   */
  async setTaskVisibilityControl(req, res) {
    try {
      const { taskId } = req.params;
      const { controllerType, controllerId, studentIds, isVisible, reason } = req.body;
      const { user } = req;

      // Validate controller type
      if (!['parent', 'school', 'class'].includes(controllerType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid controller type. Must be parent, school, or class'
        });
      }

      // Validate required fields
      if (!controllerId || !Array.isArray(studentIds) || typeof isVisible !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: controllerId, studentIds, isVisible'
        });
      }

      const changedBy = {
        id: user.id,
        role: user.role
      };

      const result = await VisibilityResolutionService.setVisibilityControl(
        taskId,
        controllerType,
        controllerId,
        studentIds,
        isVisible,
        changedBy,
        reason
      );

      res.status(200).json({
        success: true,
        message: `Task visibility ${result.action} successfully`,
        data: result
      });

    } catch (error) {
      console.error('Error setting task visibility control:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set visibility control',
        error: error.message
      });
    }
  }

  /**
   * Get visibility controls for a controller
   */
  async getVisibilityControls(req, res) {
    try {
      const { controllerType, controllerId } = req.params;
      const { taskId, includeTaskDetails } = req.query;

      const options = {
        taskId,
        includeTaskDetails: includeTaskDetails === 'true'
      };

      const result = await VisibilityResolutionService.getVisibilityControls(
        controllerType,
        controllerId,
        options
      );

      res.status(200).json({
        success: true,
        message: 'Visibility controls retrieved successfully',
        data: result
      });

    } catch (error) {
      console.error('Error getting visibility controls:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get visibility controls',
        error: error.message
      });
    }
  }

  /**
   * Get tasks for a parent's children
   */
  async getTasksForParentChildren(req, res) {
    try {
      const { parentId } = req.params;
      const { childId, category, status, page = 1, limit = 50 } = req.query;

      // Get parent's children from user service
      const childrenResponse = await axios.get(`${process.env.USER_SERVICE_URL}/api/parents/${parentId}/children`);

      const children = childrenResponse.data.data;
      
      // If specific child requested, filter to that child
      const targetChildren = childId ? children.filter(child => child._id === childId) : children;

      const allTasks = [];

      // Get tasks for each child
      for (const child of targetChildren) {
        const skip = (page - 1) * limit;
        const options = { status, category, limit: parseInt(limit), skip };
        const context = { parentId };

        const result = await VisibilityResolutionService.getVisibleTasksForStudent(
          child._id,
          context,
          options
        );

        allTasks.push({
          child: {
            _id: child._id,
            name: child.name,
            grade: child.grade
          },
          tasks: result.tasks,
          totalTasks: result.totalTasks,
          visibleCount: result.visibleCount
        });
      }

      res.status(200).json({
        success: true,
        message: 'Tasks for parent children retrieved successfully',
        data: {
          children: allTasks,
          totalChildren: targetChildren.length
        }
      });

    } catch (error) {
      console.error('Error getting tasks for parent children:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get tasks for children',
        error: error.message
      });
    }
  }

  /**
   * Get tasks for school students
   */
  async getTasksForSchoolStudents(req, res) {
    try {
      const { schoolId } = req.params;
      const { classId, grade, category, status, page = 1, limit = 50 } = req.query;

      // Get school's students from user service
      const studentsResponse = await axios.get(`${process.env.USER_SERVICE_URL}/schools/${schoolId}/students`, {
        params: { classId, grade }
      });

      const students = studentsResponse.data.data;

      const allTasks = [];

      // Get tasks for each student (sample first 10 for performance)
      const sampleStudents = students.slice(0, 10);

      for (const student of sampleStudents) {
        const skip = (page - 1) * limit;
        const options = { status, category, limit: parseInt(limit), skip };
        const context = { schoolId };

        const result = await VisibilityResolutionService.getVisibleTasksForStudent(
          student._id,
          context,
          options
        );

        allTasks.push({
          student: {
            _id: student._id,
            name: student.name,
            grade: student.grade,
            classId: student.classId
          },
          tasks: result.tasks,
          totalTasks: result.totalTasks,
          visibleCount: result.visibleCount
        });
      }

      res.status(200).json({
        success: true,
        message: 'Tasks for school students retrieved successfully',
        data: {
          students: allTasks,
          totalStudents: students.length,
          sampleSize: sampleStudents.length
        }
      });

    } catch (error) {
      console.error('Error getting tasks for school students:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get tasks for students',
        error: error.message
      });
    }
  }
}

module.exports = new TaskManagementController();