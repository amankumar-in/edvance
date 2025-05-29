const Task = require("../models/task.model");
const TaskAssignment = require("../models/taskAssignment.model");
const mongoose = require("mongoose");

/**
 * Task Assignment Service
 * 
 * Handles the logic for assigning tasks to students based on different strategies.
 * This service ensures scalability by not storing large arrays in task documents.
 */
class TaskAssignmentService {
  
  /**
   * Assign a task to students based on the task's assignment strategy
   * @param {string} taskId - The task to assign
   * @param {Object} assignedBy - Who is assigning the task
   * @param {Object} options - Additional assignment options
   */
  async assignTask(taskId, assignedBy, options = {}) {
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error("Task not found");
      }

      let studentIds = [];

      // Determine students based on assignment strategy
      switch (task.assignmentStrategy) {
        case 'specific':
          studentIds = await this.getSpecificStudents(task, options);
          break;
        case 'role_based':
          studentIds = await this.getRoleBasedStudents(task, options);
          break;
        case 'school_based':
          studentIds = await this.getSchoolBasedStudents(task, options);
          break;
        case 'global':
          studentIds = await this.getGlobalStudents(task, options);
          break;
        default:
          throw new Error(`Unknown assignment strategy: ${task.assignmentStrategy}`);
      }

      // Create assignments for each student
      const assignments = await this.createAssignments(taskId, studentIds, assignedBy, options);

      return {
        success: true,
        assignedCount: assignments.length,
        assignments: assignments,
        message: `Task assigned to ${assignments.length} students`
      };

    } catch (error) {
      console.error("Error in assignTask:", error);
      throw error;
    }
  }

  /**
   * Get students for specific assignment strategy
   */
  async getSpecificStudents(task, options) {
    // For specific assignments, use the specificUserIds from targetCriteria
    return task.targetCriteria?.specificUserIds || [];
  }

  /**
   * Get students for role-based assignment strategy
   */
  async getRoleBasedStudents(task, options) {
    // This would typically query the user service to get students by role
    // For now, we'll simulate this with the provided student IDs
    const { studentIds = [] } = options;
    
    // Apply filters from targetCriteria
    let filteredStudents = studentIds;

    // Filter by school if specified
    if (task.targetCriteria?.schoolIds?.length > 0) {
      // In a real implementation, this would query user service
      // For now, we'll assume all provided students are in the target schools
      filteredStudents = studentIds;
    }

    // Filter by grade level if specified
    if (task.targetCriteria?.gradeLevel) {
      // In a real implementation, this would filter by grade
      filteredStudents = studentIds;
    }

    // Apply exclusions
    if (task.targetCriteria?.excludeUserIds?.length > 0) {
      filteredStudents = filteredStudents.filter(
        id => !task.targetCriteria.excludeUserIds.includes(id)
      );
    }

    return filteredStudents;
  }

  /**
   * Get students for school-based assignment strategy
   */
  async getSchoolBasedStudents(task, options) {
    // This would query user service for all students in specified schools
    const { studentIds = [] } = options;
    return studentIds;
  }

  /**
   * Get students for global assignment strategy
   */
  async getGlobalStudents(task, options) {
    // This would query user service for all students globally
    const { studentIds = [] } = options;
    return studentIds;
  }

  /**
   * Create assignment records for students
   */
  async createAssignments(taskId, studentIds, assignedBy, options) {
    const assignments = [];
    const { source = 'admin', schoolId, classId } = options;

    for (const studentId of studentIds) {
      try {
        // Check if assignment already exists and is active
        const existingAssignment = await TaskAssignment.findOne({
          taskId,
          studentId,
          isActive: true
        });

        if (existingAssignment) {
          console.log(`Assignment already exists for student ${studentId}`);
          assignments.push(existingAssignment);
          continue;
        }

        // Create new assignment
        const assignment = new TaskAssignment({
          taskId,
          studentId,
          assignedBy: assignedBy.id,
          assignedByRole: assignedBy.role,
          source,
          schoolId: schoolId || 'unknown',
          classId: classId || 'unknown',
          isActive: true
        });

        const savedAssignment = await assignment.save();
        assignments.push(savedAssignment);

      } catch (error) {
        console.error(`Error creating assignment for student ${studentId}:`, error);
        // Continue with other students even if one fails
      }
    }

    return assignments;
  }

  /**
   * Deactivate task assignments
   */
  async deactivateAssignments(taskId, studentIds, deactivatedBy, reason = 'Manual deactivation') {
    try {
      const filter = {
        taskId,
        isActive: true
      };

      if (studentIds && studentIds.length > 0) {
        filter.studentId = { $in: studentIds };
      }

      const result = await TaskAssignment.updateMany(
        filter,
        {
          $set: {
            isActive: false,
            deactivatedAt: new Date(),
            deactivatedBy: deactivatedBy.id,
            deactivationReason: reason
          }
        }
      );

      return {
        success: true,
        deactivatedCount: result.modifiedCount,
        message: `Deactivated ${result.modifiedCount} assignments`
      };

    } catch (error) {
      console.error("Error deactivating assignments:", error);
      throw error;
    }
  }

  /**
   * Get assignments for a task
   */
  async getTaskAssignments(taskId, options = {}) {
    try {
      const { includeInactive = false, schoolId, classId } = options;
      
      const filter = { taskId };
      
      if (!includeInactive) {
        filter.isActive = true;
      }
      
      if (schoolId) {
        filter.schoolId = schoolId;
      }
      
      if (classId) {
        filter.classId = classId;
      }

      const assignments = await TaskAssignment.find(filter)
        .sort({ assignedAt: -1 });

      return assignments;

    } catch (error) {
      console.error("Error getting task assignments:", error);
      throw error;
    }
  }

  /**
   * Get assignments for a student
   */
  async getStudentAssignments(studentId, options = {}) {
    try {
      const { includeInactive = false, taskStatus } = options;
      
      const filter = { studentId };
      
      if (!includeInactive) {
        filter.isActive = true;
      }

      let assignments = await TaskAssignment.find(filter)
        .populate('taskId')
        .sort({ assignedAt: -1 });

      // Filter by task status if specified
      if (taskStatus) {
        assignments = assignments.filter(
          assignment => assignment.taskId && assignment.taskId.status === taskStatus
        );
      }

      return assignments;

    } catch (error) {
      console.error("Error getting student assignments:", error);
      throw error;
    }
  }

  /**
   * Assign a task to targets based on assignment strategy
   * This is the function called by the task management controller
   * @param {string} taskId - The task to assign
   * @param {string} assignmentStrategy - The assignment strategy
   * @param {Object} targetCriteria - The targeting criteria
   * @param {string} assignedById - Who is assigning the task
   * @param {string} assignedByRole - Role of who is assigning
   */
  async assignTaskToTargets(taskId, assignmentStrategy, targetCriteria, assignedById, assignedByRole) {
    try {
      // Only create assignment records for specific assignments
      // Other strategies (global, role_based, school_based) are resolved dynamically
      if (assignmentStrategy === 'specific' && targetCriteria.specificUserIds?.length > 0) {
        const assignments = [];
        
        for (const userId of targetCriteria.specificUserIds) {
          // Create assignment directly since we have specific user IDs
          const assignment = new TaskAssignment({
            taskId,
            studentId: userId,
            assignedBy: assignedById,
            assignedByRole: assignedByRole,
            source: 'admin',
            schoolId: 'unknown',
            classId: 'unknown',
            isActive: true
          });

          const savedAssignment = await assignment.save();
          assignments.push(savedAssignment);
        }

        return {
          success: true,
          strategy: assignmentStrategy,
          assignmentType: 'specific',
          assignmentsCreated: assignments.length,
          assignments
        };
      } else {
        // For strategy-based assignments, no records are created
        // Tasks are resolved dynamically based on assignment strategy
        return {
          success: true,
          strategy: assignmentStrategy,
          assignmentType: 'strategy-based',
          message: `Task will be dynamically assigned to users based on ${assignmentStrategy} strategy`,
          assignmentsCreated: 0
        };
      }

    } catch (error) {
      console.error("Error assigning task to targets:", error);
      throw error;
    }
  }
}

module.exports = new TaskAssignmentService();