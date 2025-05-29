const Task = require("../models/task.model");
const TaskAssignment = require("../models/taskAssignment.model");
const TaskVisibilityControl = require("../models/taskVisibilityControl.model");
const axios = require("axios");

/**
 * Visibility Resolution Service
 * 
 * Determines task visibility based on:
 * 1. Assignment strategy (who should see the task)
 * 2. Visibility controls (parent/school overrides)
 */
class VisibilityResolutionService {

  /**
   * Get all visible tasks for a student
   */
  async getVisibleTasksForStudent(studentId, context = {}, options = {}) {
    try {
      const { status, category, limit = 50, skip = 0 } = options;

      // Get student details from user service
      const studentData = await this.getStudentData(studentId);
      if (!studentData) {
        throw new Error('Student not found');
      }

      // Step 1: Find all tasks the student should see based on assignment strategy
      const taskFilter = {
        isDeleted: false,
        $or: [
          // Global tasks
          { assignmentStrategy: 'global' },
          
          // Role-based tasks for students
          { 
            assignmentStrategy: 'role_based',
            'targetCriteria.roles': 'student'
          },
          
          // School-based tasks for this student's school
          ...(studentData.schoolId ? [{
            assignmentStrategy: 'school_based',
            'targetCriteria.schoolIds': studentData.schoolId
          }] : []),
          
          // Class-based tasks for this student's classes
          ...(studentData.classIds && studentData.classIds.length > 0 ? [{
            assignmentStrategy: 'school_based',
            'targetCriteria.classIds': { $in: studentData.classIds }
          }] : []),
          
          // Specific tasks assigned to this student
          {
            assignmentStrategy: 'specific',
            'targetCriteria.specificUserIds': studentId
          }
        ]
      };

      // Apply filters
      if (status) taskFilter.status = status;
      if (category) taskFilter.category = category;

      // Get tasks with pagination
      const tasks = await Task.find(taskFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Step 2: Apply visibility controls for each task
      const visibleTasks = [];
      
      for (const task of tasks) {
        const visibilityResult = await this.checkTaskVisibility(
          task._id,
          studentId,
          studentData,
          context
        );

        if (visibilityResult.canSee) {
          visibleTasks.push({
            task,
            assignment: null, // No assignment record for strategy-based tasks
            visibilityReason: visibilityResult.reason,
            visibilityControls: visibilityResult.visibilityControls
          });
        }
      }

      return {
        success: true,
        tasks: visibleTasks,
        totalTasks: tasks.length,
        visibleCount: visibleTasks.length
      };

    } catch (error) {
      console.error("Error getting visible tasks for student:", error);
      throw error;
    }
  }

  /**
   * Check if a student can see a specific task
   */
  async checkTaskVisibility(taskId, studentId, studentData, context = {}) {
    try {
      const task = await Task.findById(taskId);
      if (!task || task.isDeleted) {
        return {
          canSee: false,
          reason: 'Task not found or deleted'
        };
      }

      // Step 1: Check if student meets assignment criteria
      const meetsAssignmentCriteria = await this.checkAssignmentCriteria(task, studentId, studentData);
      if (!meetsAssignmentCriteria) {
        return {
          canSee: false,
          reason: 'Student does not meet assignment criteria'
        };
      }

      // Step 2: Check parent visibility controls
      const parentVisibility = await this.checkParentVisibility(
        taskId, 
        studentId, 
        context.parentId || studentData.parentIds?.[0]
      );
      
      if (parentVisibility.hasControl && !parentVisibility.isVisible) {
        return {
          canSee: false,
          reason: 'Hidden by parent',
          visibilityControls: { parent: parentVisibility }
        };
      }

      // Step 3: Check school visibility controls
      const schoolVisibility = await this.checkSchoolVisibility(
        taskId, 
        studentId, 
        context.schoolId || studentData.schoolId
      );
      
      if (schoolVisibility.hasControl && !schoolVisibility.isVisible) {
        return {
          canSee: false,
          reason: 'Hidden by school',
          visibilityControls: { school: schoolVisibility }
        };
      }

      // Step 4: Check class visibility controls
      const classVisibility = await this.checkClassVisibility(
        taskId, 
        studentId, 
        context.classId
      );
      
      if (classVisibility.hasControl && !classVisibility.isVisible) {
        return {
          canSee: false,
          reason: 'Hidden by class/teacher',
          visibilityControls: { class: classVisibility }
        };
      }

      // Step 5: Final visibility determination based on default settings
      let canSee = false;
      let reason = '';

      if (task.defaultVisibility?.forStudents === true) {
        // Direct visibility - student can see unless explicitly hidden
        canSee = true;
        reason = 'Direct visibility enabled';
      } else {
        // Requires parent/school approval
        const parentApproval = parentVisibility.hasControl ? 
          parentVisibility.isVisible : 
          task.defaultVisibility?.forParents;
          
        const schoolApproval = schoolVisibility.hasControl ? 
          schoolVisibility.isVisible : 
          task.defaultVisibility?.forSchools;

        if (parentApproval || schoolApproval) {
          canSee = true;
          reason = parentApproval ? 'Approved by parent' : 'Approved by school';
        } else {
          canSee = false;
          reason = 'No parent or school approval';
        }
      }

      return {
        canSee,
        reason,
        visibilityControls: {
          parent: parentVisibility,
          school: schoolVisibility,
          class: classVisibility
        },
        defaultVisibility: task.defaultVisibility
      };

    } catch (error) {
      console.error("Error checking task visibility:", error);
      return {
        canSee: false,
        reason: 'Error checking visibility',
        error: error.message
      };
    }
  }

  /**
   * Check if student meets assignment criteria for a task
   */
  async checkAssignmentCriteria(task, studentId, studentData) {
    try {
      switch (task.assignmentStrategy) {
        case 'global':
          // Global tasks are for all students
          return true;

        case 'role_based':
          // Check if student role is in target roles
          return task.targetCriteria?.roles?.includes('student') || false;

        case 'school_based':
          // Check if student's school is in target schools
          if (task.targetCriteria?.schoolIds?.length > 0) {
            return task.targetCriteria.schoolIds.includes(studentData.schoolId);
          }
          // Check if student's classes are in target classes
          if (task.targetCriteria?.classIds?.length > 0 && studentData.classIds) {
            return task.targetCriteria.classIds.some(classId => 
              studentData.classIds.includes(classId)
            );
          }
          // Check grade level
          if (task.targetCriteria?.gradeLevel) {
            return studentData.grade === task.targetCriteria.gradeLevel;
          }
          return false;

        case 'specific':
          // Check if student is specifically assigned
          return task.targetCriteria?.specificUserIds?.includes(studentId) || false;

        default:
          return false;
      }
    } catch (error) {
      console.error("Error checking assignment criteria:", error);
      return false;
    }
  }

  /**
   * Get student data from user service
   */
  async getStudentData(studentId) {
    try {
      const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/students/internal/user/${studentId}`);
      
      const student = response.data.data;
      return {
        _id: student._id,
        userId: student.userId,
        schoolId: student.schoolId,
        classIds: student.classIds || [],
        parentIds: student.parentIds || [],
        grade: student.grade
      };
    } catch (error) {
      console.error("Error getting student data:", error);
      return null;
    }
  }

  /**
   * Get available tasks for parents to control
   */
  async getAvailableTasksForParent(parentId, options = {}) {
    try {
      const { category, limit = 50, skip = 0 } = options;

      // Find tasks that parents can control
      const taskFilter = {
        isDeleted: false,
        $or: [
          // Tasks specifically for parents to assign
          { 
            assignmentStrategy: 'role_based',
            'targetCriteria.roles': 'parent'
          },
          // Global tasks that parents can control
          { 
            assignmentStrategy: 'global',
            'defaultVisibility.forParents': true
          },
          // Role-based student tasks that parents can control
          { 
            assignmentStrategy: 'role_based',
            'targetCriteria.roles': 'student',
            'defaultVisibility.forParents': true
          }
        ]
      };

      if (category) taskFilter.category = category;

      const tasks = await Task.find(taskFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return {
        success: true,
        tasks,
        totalCount: tasks.length
      };

    } catch (error) {
      console.error("Error getting available tasks for parent:", error);
      throw error;
    }
  }

  /**
   * Get available tasks for schools to control
   */
  async getAvailableTasksForSchool(schoolId, options = {}) {
    try {
      const { category, limit = 50, skip = 0 } = options;

      // Find tasks that schools can control
      const taskFilter = {
        isDeleted: false,
        $or: [
          // Tasks specifically for this school
          { 
            assignmentStrategy: 'school_based',
            'targetCriteria.schoolIds': schoolId
          },
          // Global tasks that schools can control
          { 
            assignmentStrategy: 'global',
            'defaultVisibility.forSchools': true
          },
          // Role-based student tasks that schools can control
          { 
            assignmentStrategy: 'role_based',
            'targetCriteria.roles': 'student',
            'defaultVisibility.forSchools': true
          }
        ]
      };

      if (category) taskFilter.category = category;

      const tasks = await Task.find(taskFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return {
        success: true,
        tasks,
        totalCount: tasks.length
      };

    } catch (error) {
      console.error("Error getting available tasks for school:", error);
      throw error;
    }
  }

  /**
   * Check parent visibility control for a task and student
   */
  async checkParentVisibility(taskId, studentId, parentId) {
    try {
      if (!parentId) {
        return { hasControl: false, isVisible: null };
      }

      const control = await TaskVisibilityControl.findOne({
        taskId,
        controllerType: 'parent',
        controllerId: parentId,
        controlledStudentIds: studentId
      });

      return {
        hasControl: !!control,
        isVisible: control?.isVisible || null,
        control
      };

    } catch (error) {
      console.error("Error checking parent visibility:", error);
      return { hasControl: false, isVisible: null, error: error.message };
    }
  }

  /**
   * Check school visibility control for a task and student
   */
  async checkSchoolVisibility(taskId, studentId, schoolId) {
    try {
      if (!schoolId) {
        return { hasControl: false, isVisible: null };
      }

      const control = await TaskVisibilityControl.findOne({
        taskId,
        controllerType: 'school',
        controllerId: schoolId,
        controlledStudentIds: studentId
      });

      return {
        hasControl: !!control,
        isVisible: control?.isVisible || null,
        control
      };

    } catch (error) {
      console.error("Error checking school visibility:", error);
      return { hasControl: false, isVisible: null, error: error.message };
    }
  }

  /**
   * Check class visibility control for a task and student
   */
  async checkClassVisibility(taskId, studentId, classId) {
    try {
      if (!classId) {
        return { hasControl: false, isVisible: null };
      }

      const control = await TaskVisibilityControl.findOne({
        taskId,
        controllerType: 'class',
        controllerId: classId,
        controlledStudentIds: studentId
      });

      return {
        hasControl: !!control,
        isVisible: control?.isVisible || null,
        control
      };

    } catch (error) {
      console.error("Error checking class visibility:", error);
      return { hasControl: false, isVisible: null, error: error.message };
    }
  }

  /**
   * Set visibility control for a task
   */
  async setVisibilityControl(taskId, controllerType, controllerId, studentIds, isVisible, changedBy, reason) {
    try {
      // Check if control already exists
      const existingControl = await TaskVisibilityControl.findOne({
        taskId,
        controllerType,
        controllerId
      });

      if (existingControl) {
        // Update existing control
        existingControl.isVisible = isVisible;
        existingControl.controlledStudentIds = studentIds;
        existingControl.changedBy = changedBy.id;
        existingControl.changedByRole = changedBy.role;
        if (reason) existingControl.reason = reason;
        
        const updatedControl = await existingControl.save();
        
        return {
          success: true,
          action: 'updated',
          control: updatedControl
        };
      } else {
        // Create new control
        const newControl = new TaskVisibilityControl({
          taskId,
          controllerType,
          controllerId,
          isVisible,
          controlledStudentIds: studentIds,
          changedBy: changedBy.id,
          changedByRole: changedBy.role,
          reason: reason || 'Visibility control set'
        });

        const savedControl = await newControl.save();
        
        return {
          success: true,
          action: 'created',
          control: savedControl
        };
      }

    } catch (error) {
      console.error("Error setting visibility control:", error);
      throw error;
    }
  }

  /**
   * Get visibility controls for a controller (parent, school, class)
   */
  async getVisibilityControls(controllerType, controllerId, options = {}) {
    try {
      const { taskId, includeTaskDetails = false } = options;
      
      const filter = {
        controllerType,
        controllerId
      };

      if (taskId) {
        filter.taskId = taskId;
      }

      let query = TaskVisibilityControl.find(filter).sort({ createdAt: -1 });

      if (includeTaskDetails) {
        query = query.populate('taskId');
      }

      const controls = await query;

      return {
        success: true,
        controls
      };

    } catch (error) {
      console.error("Error getting visibility controls:", error);
      throw error;
    }
  }
}

module.exports = new VisibilityResolutionService();