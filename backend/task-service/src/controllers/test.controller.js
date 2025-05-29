const Task = require("../models/task.model");
const TaskAssignment = require("../models/taskAssignment.model");
const TaskVisibilityControl = require("../models/taskVisibilityControl.model");
const VisibilityResolutionService = require("../services/visibilityResolution.service");

/**
 * Test Controller for New Task Management Models
 * This controller provides endpoints to test the new models before implementing full functionality
 */
const testController = {
  // Test creating a task with new fields
  createTestTask: async (req, res) => {
    try {
      const testTask = new Task({
        title: "Test Task with New Schema",
        description: "Testing the new assignment strategy and visibility controls",
        category: "system",
        subCategory: "Schema Test",
        pointValue: 10,
        createdBy: req.user?.id || "test-user-id",
        creatorRoles: [req.user?.roles?.[0] || "platform_admin"],
        
        // NEW FIELDS
        assignmentStrategy: "role_based",
        targetCriteria: {
          roles: ["student"],
          schoolIds: ["school-123"],
          gradeLevel: 5
        },
        defaultVisibility: {
          forParents: true,
          forSchools: true,
          forStudents: false
        },
        
        // Keep existing required fields
        assignedTo: {
          role: "student",
          selectedPeopleIds: []
        },
        status: "pending",
        visibility: "school"
      });

      const savedTask = await testTask.save();
      
      res.status(201).json({
        success: true,
        message: "Test task created successfully with new schema",
        data: savedTask
      });
    } catch (error) {
      console.error("Error creating test task:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create test task",
        error: error.message
      });
    }
  },

  // Test creating a task assignment
  createTestAssignment: async (req, res) => {
    try {
      const { taskId, studentId } = req.body;
      
      if (!taskId || !studentId) {
        return res.status(400).json({
          success: false,
          message: "taskId and studentId are required"
        });
      }

      const assignment = new TaskAssignment({
        taskId,
        studentId,
        assignedBy: req.user?.id || "test-user-id",
        assignedByRole: req.user?.roles?.[0] || "platform_admin",
        source: "admin",
        schoolId: "school-123",
        classId: "class-456"
      });

      const savedAssignment = await assignment.save();
      
      res.status(201).json({
        success: true,
        message: "Test assignment created successfully",
        data: savedAssignment
      });
    } catch (error) {
      console.error("Error creating test assignment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create test assignment",
        error: error.message
      });
    }
  },

  // Test creating a visibility control
  createTestVisibilityControl: async (req, res) => {
    try {
      const { taskId, controllerType, controllerId, isVisible, studentIds } = req.body;
      
      if (!taskId || !controllerType || !controllerId) {
        return res.status(400).json({
          success: false,
          message: "taskId, controllerType, and controllerId are required"
        });
      }

      const visibilityControl = new TaskVisibilityControl({
        taskId,
        controllerType,
        controllerId,
        isVisible: isVisible !== undefined ? isVisible : true,
        controlledStudentIds: studentIds || [],
        changedBy: req.user?.id || "test-user-id",
        changedByRole: req.user?.roles?.[0] || "platform_admin",
        reason: "Test visibility control"
      });

      const savedControl = await visibilityControl.save();
      
      res.status(201).json({
        success: true,
        message: "Test visibility control created successfully",
        data: savedControl
      });
    } catch (error) {
      console.error("Error creating test visibility control:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create test visibility control",
        error: error.message
      });
    }
  },

  // Get all test data
  getTestData: async (req, res) => {
    try {
      const tasks = await Task.find({ title: { $regex: "Test Task" } }).limit(10);
      const assignments = await TaskAssignment.find().limit(10);
      const visibilityControls = await TaskVisibilityControl.find().limit(10);
      
      res.status(200).json({
        success: true,
        data: {
          tasks,
          assignments,
          visibilityControls
        }
      });
    } catch (error) {
      console.error("Error fetching test data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch test data",
        error: error.message
      });
    }
  },

  // Test visibility check without authentication
  testVisibilityCheck: async (req, res) => {
    try {
      const { taskId, studentId } = req.params;
      const { parentId, schoolId, classId } = req.query;
      
      if (!taskId || !studentId) {
        return res.status(400).json({
          success: false,
          message: "taskId and studentId are required"
        });
      }

      const context = {};
      if (parentId) context.parentId = parentId;
      if (schoolId) context.schoolId = schoolId;
      if (classId) context.classId = classId;

      const result = await VisibilityResolutionService.canStudentSeeTask(taskId, studentId, context);
      
      res.status(200).json({
        success: true,
        message: "Visibility check completed",
        data: result
      });
    } catch (error) {
      console.error("Error checking visibility:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check visibility",
        error: error.message
      });
    }
  },

  // Test creating school control without authentication
  testSchoolControl: async (req, res) => {
    try {
      const schoolControl = new TaskVisibilityControl({
        taskId: "68372cdb06316b7fb22b4583",
        controllerType: "school",
        controllerId: "school-123", 
        isVisible: false,
        controlledStudentIds: ["507f1f77bcf86cd799439011"],
        changedBy: "test-school-admin",
        changedByRole: "school_admin",
        reason: "Test school control"
      });

      const savedControl = await schoolControl.save();
      
      res.status(201).json({
        success: true,
        message: "Test school control created successfully",
        data: savedControl
      });
    } catch (error) {
      console.error("Error creating test school control:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create test school control",
        error: error.message
      });
    }
  },

  // Test creating multi-child parent control
  testMultiChildControl: async (req, res) => {
    try {
      const multiChildControl = new TaskVisibilityControl({
        taskId: "68372cdb06316b7fb22b4583",
        controllerType: "parent",
        controllerId: "parent-456", // Different parent
        isVisible: false,
        controlledStudentIds: [
          "507f1f77bcf86cd799439011", // Child 1
          "507f1f77bcf86cd799439012", // Child 2  
          "507f1f77bcf86cd799439013"  // Child 3
        ],
        changedBy: "test-parent-456",
        changedByRole: "parent",
        reason: "Test multi-child parent control"
      });

      const savedControl = await multiChildControl.save();
      
      res.status(201).json({
        success: true,
        message: "Test multi-child parent control created successfully",
        data: savedControl
      });
    } catch (error) {
      console.error("Error creating test multi-child control:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create test multi-child control",
        error: error.message
      });
    }
  },

  // Clean up test data
  cleanupTestData: async (req, res) => {
    try {
      const taskResult = await Task.deleteMany({ title: { $regex: "Test Task" } });
      const assignmentResult = await TaskAssignment.deleteMany({ source: "admin" });
      const visibilityResult = await TaskVisibilityControl.deleteMany({ reason: "Test visibility control" });
      
      res.status(200).json({
        success: true,
        message: "Test data cleaned up successfully",
        data: {
          tasksDeleted: taskResult.deletedCount,
          assignmentsDeleted: assignmentResult.deletedCount,
          visibilityControlsDeleted: visibilityResult.deletedCount
        }
      });
    } catch (error) {
      console.error("Error cleaning up test data:", error);
      res.status(500).json({
        success: false,
        message: "Failed to clean up test data",
        error: error.message
      });
    }
  }
};

module.exports = testController;