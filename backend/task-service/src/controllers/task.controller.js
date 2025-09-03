const Task = require("../models/task.model");
const mongoose = require("mongoose");
const axios = require("axios");
const TaskVisibility = require("../models/taskVisibility.model");
const TaskCompletion = require("../models/taskCompletion.model");
const { getFileUrl, getFileType } = require("../middleware/upload.middleware");
const { isValidObjectId } = require("mongoose");

// Helper function to get student classes
async function getStudentClasses(childId, authHeader) {
  const userServiceUrl =
    process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_USER_SERVICE_URL
      : process.env.USER_SERVICE_URL || "http://localhost:3002";

  const childClasses = await axios.get(
    `${userServiceUrl}/api/students/${childId}/classes`,
    { headers: { Authorization: authHeader } }
  );

  const classIds = childClasses?.data?.data?.map(child => new mongoose.Types.ObjectId(child._id));

  return classIds || [];
}

// Helper function to get children data
async function getChildrenData(authHeader) {
  const userServiceUrl =
    process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_USER_SERVICE_URL
      : process.env.USER_SERVICE_URL || "http://localhost:3002";

  try {
    const childrenResponse = await axios.get(`${userServiceUrl}/api/parents/me/children`, { headers: { Authorization: authHeader } });

    const childrenData = childrenResponse.data.data;

    // Fetch classes for each child
    const childrenWithClasses = await Promise.all(
      childrenData.map(async (child) => {
        try {
          const childClasses = await axios.get(
            `${userServiceUrl}/api/students/${child._id}/classes`,
            { headers: { Authorization: authHeader } }
          );

          return {
            ...child,
            classes: childClasses?.data?.data || [],
            classIds: childClasses?.data?.data?.map(cls => cls._id) || []
          };
        } catch (error) {
          console.warn(`Failed to fetch classes for child ${child._id}:`, error.message);
          return {
            ...child,
            classes: [],
            classIds: []
          };
        }
      })
    );

    return childrenWithClasses;
  } catch (error) {
    console.error("Error getting children details:", error.response?.data || error.message);
    throw new Error("Failed to get children information");
  }
}

// Helper function to get school profile
async function getSchoolProfile(authHeader) {
  const userServiceUrl =
    process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_USER_SERVICE_URL
      : process.env.USER_SERVICE_URL || "http://localhost:3002";

  const schoolProfile = await axios.get(`${userServiceUrl}/api/schools/me`, { headers: { Authorization: authHeader } });

  return schoolProfile?.data?.data;
}

// Helper function to get school details by ID
async function getSchoolById(schoolId, authHeader) {
  try {
    const userServiceUrl =
      process.env.NODE_ENV === "production"
        ? process.env.PRODUCTION_USER_SERVICE_URL
        : process.env.USER_SERVICE_URL || "http://localhost:3002";

    const response = await axios.get(`${userServiceUrl}/api/schools/${schoolId}`, {
      headers: { Authorization: authHeader }
    });

    return response?.data?.data;
  } catch (error) {
    console.warn(`Failed to fetch school ${schoolId}:`, error.message);
    return null;
  }
}

// Helper function to get class details by ID
async function getClassById(classId, authHeader) {
  try {
    const userServiceUrl =
      process.env.NODE_ENV === "production"
        ? process.env.PRODUCTION_USER_SERVICE_URL
        : process.env.USER_SERVICE_URL || "http://localhost:3002";

    const response = await axios.get(`${userServiceUrl}/api/classes/${classId}`, {
      headers: { Authorization: authHeader }
    });

    return response?.data?.data;
  } catch (error) {
    console.warn(`Failed to fetch class ${classId}:`, error.message);
    return null;
  }
}


/**
 * Task Controller
 * Handles all task-related operations
 */
const taskController = {
  /**
   * Create a new task
   */
  createTask: async (req, res) => {
    try {
      // Helper function to parse JSON strings from FormData
      const parseField = (field) => {
        if (typeof field === 'string') {
          try {
            return JSON.parse(field);
          } catch {
            return field;
          }
        }
        return field;
      };

      const {
        title,
        description,
        category,
        subCategory,
        pointValue,
        assignedTo: rawAssignedTo,
        dueDate,
        isRecurring,
        recurringSchedule: rawRecurringSchedule,
        requiresApproval,
        approverType: rawApproverType,
        specificApproverId,
        externalResource: rawExternalResource,
        attachments: rawAttachments,
        difficulty,
        schoolId,
        classId,
        // visibility,
        metadata: rawMetadata,
        role: creatorRole
      } = req.body;

      const { profiles, id } = req.user

      // Parse complex objects that might be JSON strings from FormData
      const assignedTo = parseField(rawAssignedTo);
      const recurringSchedule = parseField(rawRecurringSchedule);
      const externalResource = parseField(rawExternalResource);
      const metadata = parseField(rawMetadata);
      const attachments = parseField(rawAttachments);
      const approverType = parseField(rawApproverType);

      // Always store user ID for consistency
      const createdBy = creatorRole === 'platform_admin' || creatorRole === 'sub_admin' || creatorRole === 'school_admin' ? id : profiles[creatorRole]?._id;

      if (!creatorRole) {
        return res.status(400).json({
          success: false,
          message: "Creator role is required",
        });
      }

      // Validate required fields
      if (!title || !category || !assignedTo || pointValue === undefined) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: title, category, assignedTo, and pointValue are required",
        });
      }

      // Process uploaded files if any
      let processedAttachments = [];
      if (req.files && req.files.length > 0) {
        processedAttachments = req.files.map(file => ({
          type: getFileType(file.filename),
          url: getFileUrl(file.filename),
          name: file.originalname,
          contentType: file.mimetype,
        }));
      } else if (attachments && Array.isArray(attachments)) {
        // Handle attachments from form data (if no files uploaded)
        processedAttachments = attachments;
      }

      // TODO:
      // 1. If schoolId is provided, validate that the school exists.
      // 2. If classId is provided, validate that the class exists.
      // 3. If both are provided, ensure that the class belongs to the given school.
      // 4. Prevent creation if any of these checks fail.

      // Create new task
      const task = new Task({
        title,
        description,
        category,
        subCategory,
        pointValue: Number(pointValue),
        createdBy,
        creatorRole: (
          creatorRole === 'parent' ? 'parent' :
            creatorRole === 'teacher' || creatorRole === 'school_admin' ? 'teacher' :
              creatorRole === 'social_worker' ? 'social_worker' :
                'system'
        ),
        assignedTo,
        status: "pending",
        dueDate: dueDate ? new Date(dueDate) : undefined,
        isRecurring: isRecurring === 'true' || isRecurring === true,
        recurringSchedule: (isRecurring === 'true' || isRecurring === true) ? recurringSchedule : undefined,
        requiresApproval:
          requiresApproval !== undefined ? requiresApproval === 'true' || requiresApproval === true : true,
        approverType:
          approverType ?
            (Array.isArray(approverType) ? approverType : [approverType]) :
            [(creatorRole === "parent"
              ? "parent"
              : creatorRole === "teacher" || creatorRole === "school_admin"
                ? "teacher"
                : "system")],
        specificApproverId: specificApproverId,
        externalResource,
        attachments: processedAttachments,
        difficulty,
        schoolId: isValidObjectId(schoolId) ? schoolId : null,
        classId: isValidObjectId(classId) ? classId : null,
        metadata,
      });

      await task.save();

      // If this is a recurring task, create the first instance
      if ((isRecurring === 'true' || isRecurring === true) && recurringSchedule) {
        await taskController.createRecurringTaskInstance(task);
      }

      // Send notification if integrated with notification service
      try {
        // This would be the actual notification service URL in production
        const notificationServiceUrl =
          process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3006";

        await axios.post(`${notificationServiceUrl}/api/notifications`, {
          type: "task_assigned",
          recipientId: assignedTo,
          data: {
            taskId: task._id,
            title: task.title,
            dueDate: task.dueDate,
            pointValue: task.pointValue,
          },
        });
      } catch (error) {
        // Log but don't fail if notification fails
        console.error(
          "Failed to send task assignment notification:",
          error.message
        );
      }

      return res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
      });
    } catch (error) {
      console.error("Create task error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create task",
        error: error.message,
      });
    }
  },

  /**
   * Get task by ID
   */
  getTaskById: async (req, res) => {
    try {
      const { id } = req.params;
      const authHeader = req.headers.authorization;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task ID format",
        });
      }

      const task = await Task.findById(id);

      if (!task || task.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      // TODO: Implement access control logic

      // Populate class data if it exists
      const enhancedTask = { ...task.toObject() };

      // Fetch class details if classId exists
      // School details are already present in class details (no need to fetch separately)
      if (task.classId && authHeader) {
        const classData = await getClassById(task.classId, authHeader);
        if (classData) {
          enhancedTask.class = {
            _id: classData._id,
            name: classData.name,
            grade: classData.grade,
            schoolId: classData.schoolId,
          };
        }
      }

      return res.status(200).json({
        success: true,
        data: enhancedTask,
      });
    } catch (error) {
      console.error("Get task error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get task",
        error: error.message,
      });
    }
  },

  /**
   * Update a task by ID
   */
  updateTask: async (req, res) => {
    try {
      // Helper function to parse JSON strings from FormData
      const parseField = (field) => {
        if (typeof field === 'string') {
          try {
            return JSON.parse(field);
          } catch {
            return field;
          }
        }
        return field;
      };

      const { id } = req.params;
      const updateData = { ...req.body };
      const userId = req.user.id;
      const userRole = req.user.roles;
      const { profiles } = req.user;
      const role = req.headers['x-role'];
      const createdByProfileId = profiles[role]?._id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task ID format",
        });
      }

      const task = await Task.findById(id);

      if (!task || task.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      // TODO: Implement a stricter access control logic
      // Check authorization - only creator or approved roles can update
      const isAuthorized =
        task.createdBy.equals(createdByProfileId) ||
        userRole.includes("platform_admin") ||
        (userRole.includes("school_admin") && task.schoolId) ||
        (userRole.includes("teacher") &&
          task.classId &&
          task.creatorRole === "teacher");

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this task",
        });
      }

      // Handle attachments
      let finalAttachments = [];

      // Get existing attachments if provided
      if (updateData.existingAttachments) {
        const existingAttachments = parseField(updateData.existingAttachments);
        if (Array.isArray(existingAttachments)) {
          finalAttachments = [...existingAttachments];
        }
        delete updateData.existingAttachments; // Remove from updateData
      } else {
        // If no existing attachments specified, keep current ones
        finalAttachments = [...(task.attachments || [])];
      }

      // Process new uploaded files if any
      if (req.files && req.files.length > 0) {
        const newAttachments = req.files.map(file => ({
          type: getFileType(file.filename),
          url: getFileUrl(file.filename),
          name: file.originalname,
          contentType: file.mimetype,
        }));
        finalAttachments = [...finalAttachments, ...newAttachments];
      }

      // Set the final attachments
      updateData.attachments = finalAttachments;

      // Parse other complex fields
      if (updateData.assignedTo) {
        updateData.assignedTo = parseField(updateData.assignedTo);
      }
      if (updateData.externalResource) {
        updateData.externalResource = parseField(updateData.externalResource);
      }
      if (updateData.recurringSchedule) {
        updateData.recurringSchedule = parseField(updateData.recurringSchedule);
      }
      // Handle approverType as an array
      if (updateData.approverType) {
        const parsedApproverType = parseField(updateData.approverType);
        updateData.approverType = Array.isArray(parsedApproverType)
          ? parsedApproverType
          : [parsedApproverType];
      }

      // TODO:
      // 1. If schoolId is present, verify that the school exists.
      // 2. If classId is present, verify that the class exists.
      // 3. If both are present, ensure the class belongs to the school.

      // Only update schoolId if valid or explicitly set to null
      if ('schoolId' in updateData) {
        updateData.schoolId = isValidObjectId(updateData.schoolId) ? updateData.schoolId : null;
      }

      // Only update classId if valid or explicitly set to null
      if ('classId' in updateData) {
        updateData.classId = isValidObjectId(updateData.classId) ? updateData.classId : null;
      }

      // Handle boolean conversions for FormData
      if (updateData.requiresApproval !== undefined) {
        updateData.requiresApproval = updateData.requiresApproval === 'true' || updateData.requiresApproval === true;
      }
      if (updateData.isRecurring !== undefined) {
        updateData.isRecurring = updateData.isRecurring === 'true' || updateData.isRecurring === true;
      }

      // Don't allow changing certain fields after creation
      const protectedFields = [
        "createdBy",
        "creatorRole",
        "createdAt",
        "updatedAt",
      ];
      protectedFields.forEach((field) => {
        if (updateData[field]) delete updateData[field];
      });

      // Special handling for recurring tasks
      if (
        task.isRecurring !== updateData.isRecurring ||
        (updateData.recurringSchedule &&
          JSON.stringify(task.recurringSchedule) !==
          JSON.stringify(updateData.recurringSchedule))
      ) {
        // Handle recurrence change - this might require regenerating instances
        // For simplicity, we'll just note it here
        console.log("Recurrence settings changed for task:", id);
      }

      // Update the task
      const updatedTask = await Task.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      // Send notification if dueDate changed or pointValue changed significantly
      if (
        (updateData.dueDate &&
          task.dueDate?.toString() !==
          new Date(updateData.dueDate).toString()) ||
        (updateData.pointValue &&
          Math.abs(task.pointValue - updateData.pointValue) > 5)
      ) {
        try {
          const notificationServiceUrl =
            process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3006";
          await axios.post(`${notificationServiceUrl}/api/notifications`, {
            type: "task_updated",
            recipientId: task.assignedTo,
            data: {
              taskId: task._id,
              title: updatedTask.title,
              changes: {
                dueDate: updateData.dueDate ? true : false,
                pointValue: updateData.pointValue ? true : false,
              },
            },
          });
        } catch (error) {
          console.error(
            "Failed to send task update notification:",
            error.message
          );
        }
      }

      return res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: updatedTask,
      });
    } catch (error) {
      console.error("Update task error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update task",
        error: error.message,
      });
    }
  },

  /**
   * Delete a task (soft delete)
   */
  deleteTask: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.roles;
      const { profiles } = req.user;
      const role = req.headers['x-role'];
      const createdByProfileId = profiles[role]?._id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task ID format",
        });
      }

      const task = await Task.findById(id);

      if (!task || task.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      // TODO: Implement a stricter access control logic
      // Check authorization - only creator or approved roles can delete
      const isAuthorized =
        task.createdBy.equals(createdByProfileId) ||
        userRole.includes("platform_admin") ||
        (userRole.includes("school_admin") && task.schoolId) ||
        (userRole.includes("teacher") &&
          task.classId &&
          task.creatorRole === "teacher");

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this task",
        });
      }

      // Perform soft delete
      await Task.findByIdAndUpdate(id, { isDeleted: true });

      // If recurring task, handle future instances
      if (task.isRecurring) {
        // Option: delete all future instances
        await Task.updateMany(
          { parentTaskId: id, dueDate: { $gte: new Date() } },
          { isDeleted: true }
        );
      }

      // Notify the student
      try {
        const notificationServiceUrl =
          process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3006";
        await axios.post(`${notificationServiceUrl}/api/notifications`, {
          type: "task_deleted",
          recipientId: task.assignedTo,
          data: {
            taskId: task._id,
            title: task.title,
          },
        });
      } catch (error) {
        console.error(
          "Failed to send task deletion notification:",
          error.message
        );
      }

      return res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      console.error("Delete task error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete task",
        error: error.message,
      });
    }
  },

  /**
   * Mark a task as completed
   */
  completeTask: async (req, res) => {
    try {
      const { id } = req.params;
      const { note, evidence } = req.body;
      const userId = req.user.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task ID format",
        });
      }

      const task = await Task.findById(id);

      if (!task || task.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      // Check if the task is already completed or approved
      if (task.status === "approved") {
        return res.status(400).json({
          success: false,
          message: "Task already approved",
        });
      }

      // Check if the user is the assignee
      if (task.assignedTo !== userId) {
        return res.status(403).json({
          success: false,
          message: "Only the assigned student can mark this task as completed",
        });
      }

      // Update task status based on approval requirements
      const newStatus = task.requiresApproval ? "pending_approval" : "approved";
      const completionData = {
        note: note || "",
        evidence: evidence || [],
      };

      // Update the task
      const updateData = {
        status: newStatus,
        completedDate: new Date(),
        completion: completionData,
      };

      // If no approval required, also set approval details
      if (!task.requiresApproval) {
        updateData.approvedBy = null;
        updateData.approverRole = "system";
        updateData.approvalDate = new Date();
      }

      const updatedTask = await Task.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      // If no approval required, award points immediately
      if (!task.requiresApproval) {
        await taskController.awardPointsForTask(updatedTask);
      } else {
        // Notify approver that task needs approval
        try {
          const notificationServiceUrl =
            process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3006";

          // Determine who should be notified based on approverType
          let recipientId;
          if (task.approverType === "parent") {
            recipientId = task.specificApproverId || task.createdBy;
          } else if (task.approverType === "teacher") {
            recipientId = task.createdBy;
          } else {
            recipientId = task.createdBy;
          }

          await axios.post(`${notificationServiceUrl}/api/notifications`, {
            type: "task_needs_approval",
            recipientId: recipientId,
            data: {
              taskId: task._id,
              title: task.title,
              studentId: task.assignedTo,
            },
          });
        } catch (error) {
          console.error("Failed to send approval notification:", error.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: task.requiresApproval
          ? "Task marked as completed, awaiting approval"
          : "Task completed and approved automatically",
        data: updatedTask,
      });
    } catch (error) {
      console.error("Complete task error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to complete task",
        error: error.message,
      });
    }
  },

  /**
   * Submit task completion using TaskCompletion model
   */
  submitTaskCompletion: async (req, res) => {
    try {
      // Helper function to parse JSON strings from FormData
      const parseField = (field) => {
        if (typeof field === 'string') {
          try {
            return JSON.parse(field);
          } catch {
            return field;
          }
        }
        return field;
      };

      const { profiles } = req.user;
      const { id } = req.params;
      const { note, evidence: rawEvidence } = req.body;
      const currentProfileId = profiles.student?._id && new mongoose.Types.ObjectId(profiles.student?._id);
      const schoolId = profiles?.['student']?.schoolId && new mongoose.Types.ObjectId(profiles?.['student']?.schoolId);
      const classIds = await getStudentClasses(currentProfileId, req.headers.authorization);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task ID format",
        });
      }

      if (!currentProfileId) {
        return res.status(400).json({
          success: false,
          message: "Student profile not found",
        });
      }

      // Find the task
      const task = await Task.findById(id).lean();

      if (!task || task.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      // Check task visibility
      const visibility = await TaskVisibility.findOne({
        taskId: id,
        toggledForUserId: currentProfileId,
      });

      // If task is explicitly hidden by parent, deny access
      if (visibility && !visibility.isVisible) {
        return res.status(403).json({
          success: false,
          message: "This task is not available to you",
        });
      }

      // Check if student has access to this task
      let hasAccess = false;

      // Check if task is explicitly made visible by parent
      if (visibility && visibility.isVisible) {
        hasAccess = true;
      } else {
        // Check normal assignment rules
        if (task.assignedTo?.role === "student") {
          // If no specific students selected, it's assigned to all students
          if (!task.assignedTo.selectedPeopleIds || task.assignedTo.selectedPeopleIds.length === 0) {
            hasAccess = true;
          } else {
            // Check if current student is in the selected list
            hasAccess = task.assignedTo.selectedPeopleIds.some(
              assignedId => assignedId.toString() === currentProfileId.toString()
            );
          }
        } else if (task.assignedTo?.role === "school") {
          if (task.schoolId.equals(schoolId) && (task.classId === null || task.classId === undefined)) {
            hasAccess = true;
          } else if (task.classId && classIds.some(id => id.equals(task.classId))) {
            hasAccess = true;
          }
        }
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to submit this task",
        });
      }

      // Check if there's already a completion record
      let taskCompletion = await TaskCompletion.findOne({
        taskId: id,
        studentId: currentProfileId
      });

      // If already approved, don't allow resubmission
      if (taskCompletion && taskCompletion.status === "approved") {
        return res.status(400).json({
          success: false,
          message: "Task already approved and cannot be resubmitted",
        });
      }

      // Process evidence including file uploads
      let processedEvidence = [];

      // Parse evidence from FormData if it exists (for text/link evidence)
      const textEvidence = parseField(rawEvidence) || [];

      // Add text/link evidence first
      processedEvidence = [...textEvidence];

      // Process uploaded files if any
      if (req.files && req.files.length > 0) {
        const fileEvidence = req.files.map(file => ({
          type: getFileType(file.filename), // This will return 'image' or 'document'
          url: getFileUrl(file.filename),
          fileName: file.originalname,
          contentType: file.mimetype,
          fileType: getFileType(file.filename),
        }));

        // Add file evidence to the processed evidence array
        processedEvidence = [...processedEvidence, ...fileEvidence];
      }

      // Determine the status based on approval requirements
      const newStatus = task.requiresApproval ? "pending_approval" : "approved";

      // Prepare completion data
      const completionData = {
        taskId: id,
        studentId: currentProfileId,
        note: note || "",
        evidence: processedEvidence,
        status: newStatus,
        completedAt: new Date(),
      };

      // Handle approval fields based on requirements and resubmission status
      if (!task.requiresApproval) {
        // Auto-approved task
        completionData.approvedBy = null;
        completionData.approverRole = "system";
        completionData.approvalDate = new Date();
      } else {
        // Task requires approval - clear any previous approval/rejection data
        completionData.approvedBy = null;
        completionData.approverRole = null;
        completionData.approvalDate = null;
      }

      // Create or update the completion record
      let isResubmission = false;
      if (taskCompletion) {
        // Resubmission case - update existing completion
        isResubmission = true;
        console.log(`Student resubmitting task ${id}, previous status: ${taskCompletion.status}`);

        taskCompletion = await TaskCompletion.findByIdAndUpdate(
          taskCompletion._id,
          { $set: completionData },
          { new: true }
        );
      } else {
        // First submission - create new completion
        taskCompletion = new TaskCompletion(completionData);
        await taskCompletion.save();
      }

      // If no approval required, award points immediately
      if (!task.requiresApproval) {
        await taskController.awardPointsForTaskCompletion(req, task, taskCompletion);
      } else {
        // Notify approver that task needs approval
        try {
          const notificationServiceUrl =
            process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3006";

          // Determine who should be notified based on approverType
          let recipientId;
          if (task.approverType === "parent") {
            recipientId = task.specificApproverId || task.createdBy;
          } else if (task.approverType === "teacher") {
            recipientId = task.createdBy;
          } else {
            recipientId = task.createdBy;
          }

          await axios.post(`${notificationServiceUrl}/api/notifications`, {
            type: isResubmission ? "task_resubmitted" : "task_needs_approval",
            recipientId: recipientId,
            data: {
              taskId: task._id,
              title: task.title,
              studentId: currentProfileId,
              submissionId: taskCompletion._id,
              isResubmission: isResubmission,
            },
          }, {
            headers: {
              Authorization: req.headers.authorization,
            },
          });
        } catch (error) {
          console.error("Failed to send approval notification:", error.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: task.requiresApproval
          ? isResubmission
            ? "Task resubmitted successfully, awaiting approval"
            : "Task submitted successfully, awaiting approval"
          : isResubmission
            ? "Task resubmitted and approved automatically"
            : "Task completed and approved automatically",
        data: {
          task: task,
          completion: taskCompletion,
        },
      });

    } catch (error) {
      console.error("Submit task completion error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to submit task completion",
        error: error.message,
      });
    }
  },

  /**
   * Approve or reject a completed task
   */
  reviewTask: async (req, res) => {
    try {
      const { id } = req.params;
      const { action, feedback, role } = req.body;
      const { profiles } = req.user;
      const userRole = role;
      let userId;

      if (!["approve", "reject"].includes(action)) {
        return res.status(400).json({
          success: false,
          message: "Action must be either 'approve' or 'reject'",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task ID format",
        });
      }

      const taskSubmission = await TaskCompletion.findById(id);

      if (!taskSubmission) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      // Check if task is awaiting approval
      if (taskSubmission.status !== "pending_approval") {
        return res.status(400).json({
          success: false,
          message: "Task is not awaiting approval",
        });
      }

      const task = await Task.findById(taskSubmission.taskId)

      // Check if user is authorized to approve/reject
      let isAuthorized = false;

      // TODO: Implement a stricter access control logic
      if (userRole === 'teacher') {
        const teacherProfile = profiles?.['teacher'];
        const teacherId = teacherProfile?._id;
        const classIds = teacherProfile?.classIds;
        const classIdsObjectIds = classIds.map(id => new mongoose.Types.ObjectId(id));
        userId = teacherId;

        isAuthorized = classIdsObjectIds.some(id => id.equals(task.classId)) || (task.approverType === 'teacher' ||
          (Array.isArray(task.approverType) && task.approverType.includes('teacher')));
      }
      if (userRole === 'school_admin') {
        userId = new mongoose.Types.ObjectId(req.user.id);
        const schoolProfile = await getSchoolProfile(req.headers.authorization);
        const schoolId = schoolProfile?._id;
        const approvers = Array.isArray(task.approverType)
          ? task.approverType
          : [task.approverType];

        isAuthorized =
          task.schoolId?.toString() === schoolId.toString() ||
          approvers.some(role => ["teacher", "school_admin"].includes(role));
      }
      if (userRole === 'parent') {
        const parentProfile = profiles?.['parent'];
        const parentId = parentProfile?._id;
        userId = parentId;
        const childIds = parentProfile?.childIds || [];

        const childIdsObjectIds = childIds.map(id => new mongoose.Types.ObjectId(id));
        const taskSubmissionStudentId =
          taskSubmission.studentId instanceof mongoose.Types.ObjectId
            ? taskSubmission.studentId
            : new mongoose.Types.ObjectId(taskSubmission.studentId);

        // 1. Parent must be in the allowed approverType(s)
        // 2. The submission must belong to one of their children
        isAuthorized =
          (task.approverType === 'parent' ||
            (Array.isArray(task.approverType) && task.approverType.includes('parent'))) &&
          childIdsObjectIds.some(id => id.equals(taskSubmissionStudentId));
      }

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to review this task",
        });
      }

      // Process approval or rejection
      const updateData = {
        status: action === "approve" ? "approved" : "rejected",
        approvedBy: userId,
        approverRole: userRole,
        approvalDate: new Date(),
        feedback: feedback || ''
      };

      const updatedTask = await TaskCompletion.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      // If approved, award points
      if (action === "approve") {
        await taskController.awardPointsForTaskCompletion(req, task, updatedTask);
      }

      // Send notification to student
      try {
        const notificationServiceUrl =
          process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3006";
        await axios.post(`${notificationServiceUrl}/api/notifications`, {
          type: action === "approve" ? "task_approved" : "task_rejected",
          recipientId: task.assignedTo,
          data: {
            taskId: task._id,
            title: task.title,
            feedback: feedback || "",
            points: action === "approve" ? task.pointValue : 0,
          },
        });
      } catch (error) {
        console.error(
          "Failed to send task review notification:",
          error.message
        );
      }

      return res.status(200).json({
        success: true,
        message:
          action === "approve" ? "Task approved successfully" : "Task rejected",
        data: updatedTask,
      });
    } catch (error) {
      console.error("Review task error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to review task",
        error: error.message,
      });
    }
  },

  /**
   * Get tasks with filtering - General administrative function
   * For platform_admin, sub_admin, school_admin, and teacher roles
   */
  getTasks: async (req, res) => {
    try {
      const { profiles, roles } = req.user;
      const { role = "platform_admin" } = req.query;

      // Validate role - only allow administrative roles
      if (!role || !["platform_admin", "sub_admin", "school_admin", "teacher"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. This endpoint is for administrative roles only (platform_admin, sub_admin, school_admin, teacher).',
        });
      }

      if (!roles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'You do not have the required role.',
        });
      }

      const {
        assignedTo,
        createdBy,
        category,
        subCategory,
        startDate,
        endDate,
        dueDate,
        status,
        schoolId,
        classId,
        page = 1,
        limit = 20,
        sort = "dueDate",
        order = "asc",
      } = req.query;

      const currentProfileId = profiles[role]?._id;
      const parsedPage = parseInt(page);
      const parsedLimit = parseInt(limit);
      const skip = (parsedPage - 1) * parsedLimit;

      // Build base query
      let query = { isDeleted: false };

      // Apply role-based access control
      if (role === "school_admin") {
        // School admins can only see tasks within their school
        if (schoolId) {
          query.schoolId = schoolId;
        }
      } else if (role === "teacher") {
        const teacherProfile = profiles?.['teacher'];
        const teacherId = teacherProfile?._id;
        const classIds = teacherProfile?.classIds;
        const classIdsObjectIds = classIds?.map(id => new mongoose.Types.ObjectId(id)) || [];

        // Teachers can see tasks they created or tasks in their classes
        const teacherConditions = [
          { createdBy: teacherId }
        ];

        // If teacher has class assignments, include those
        if (classIdsObjectIds.length > 0) {
          teacherConditions.push({ classId: { $in: classIdsObjectIds } });
        }

        query.$or = teacherConditions;
      }
      // platform_admin and sub_admin can see all tasks (no additional restrictions)

      // Apply filters
      if (assignedTo) {
        if (assignedTo === "student") {
          query["assignedTo.role"] = "student";
        } else if (assignedTo === "parent") {
          query["assignedTo.role"] = "parent";
        } else {
          // Assume it's a specific user ID
          query.$or = [
            { "assignedTo.selectedPeopleIds": { $in: [assignedTo] } },
            { createdBy: assignedTo }
          ];
        }
      }

      if (createdBy) query.createdBy = createdBy;
      if (category) query.category = category;
      if (subCategory) query.subCategory = subCategory;
      if (schoolId) query.schoolId = schoolId;
      if (classId) query.classId = classId;
      if (status) query.status = status;

      if (dueDate) query.dueDate = new Date(dueDate);
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      // Fetch tasks with pagination
      const tasks = await Task.find(query)
        .sort({ [sort]: order === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean();

      const total = await Task.countDocuments(query);

      // For administrative roles, we can include some enhanced information
      const enhancedTasks = tasks.map(task => {
        // Add computed fields that might be useful for admins
        const enhancedTask = {
          ...task,
          // Add assignment summary
          assignmentSummary: {
            role: task.assignedTo?.role,
            isAssignedToAll: !task.assignedTo?.selectedPeopleIds || task.assignedTo.selectedPeopleIds.length === 0,
            specificAssignmentCount: task.assignedTo?.selectedPeopleIds?.length || 0
          },
          // Add status info
          isOverdue: task.dueDate && new Date(task.dueDate) < new Date() && task.status === "pending",
          daysUntilDue: task.dueDate ? Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : null
        };

        return enhancedTask;
      });

      res.json({
        success: true,
        data: enhancedTasks,
        pagination: {
          total,
          page: parsedPage,
          limit: parsedLimit,
          pages: Math.ceil(total / parsedLimit),
        },
        filters: {
          role,
          assignedTo,
          createdBy,
          category,
          subCategory,
          status,
          schoolId,
          classId,
          startDate,
          endDate,
          dueDate
        }
      });
    } catch (err) {
      console.error("Error fetching tasks:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  /**
   * Get tasks summary for a student (dashboard data)
   */
  getStudentTasksSummary: async (req, res) => {
    try {
      const { studentId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Check authorization
      let isAuthorized =
        studentId === userId ||
        userRole === "platform_admin" ||
        userRole === "school_admin" ||
        userRole === "teacher";

      // Parents can see their children's summaries
      if (userRole === "parent") {
        // In a real app, we would verify the studentId is actually their child
        isAuthorized = true; // Simplified for now
      }

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this student's tasks summary",
        });
      }

      // Get counts by status
      const [
        totalTasks,
        pendingTasks,
        completedTasks,
        approvedTasks,
        rejectedTasks,
        expiredTasks,
        dueSoonTasks,
      ] = await Promise.all([
        Task.countDocuments({ assignedTo: studentId, isDeleted: false }),
        Task.countDocuments({
          assignedTo: studentId,
          status: "pending",
          isDeleted: false,
        }),
        Task.countDocuments({
          assignedTo: studentId,
          status: "pending_approval",
          isDeleted: false,
        }),
        Task.countDocuments({
          assignedTo: studentId,
          status: "approved",
          isDeleted: false,
        }),
        Task.countDocuments({
          assignedTo: studentId,
          status: "rejected",
          isDeleted: false,
        }),
        Task.countDocuments({
          assignedTo: studentId,
          status: "pending",
          dueDate: { $lt: new Date() },
          isDeleted: false,
        }),
        Task.countDocuments({
          assignedTo: studentId,
          status: "pending",
          dueDate: {
            $gte: new Date(),
            $lte: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          },
          isDeleted: false,
        }),
      ]);

      // Get counts by category
      const categoryCounts = await Task.aggregate([
        {
          $match: {
            assignedTo: studentId,
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["approved", "pending_approval"]] },
                  1,
                  0,
                ],
              },
            },
            totalPoints: {
              $sum: {
                $cond: [{ $eq: ["$status", "approved"] }, "$pointValue", 0],
              },
            },
          },
        },
      ]);

      // Get upcoming tasks
      const upcomingTasks = await Task.find({
        assignedTo: studentId,
        status: "pending",
        dueDate: { $gte: new Date() },
        isDeleted: false,
      })
        .sort({ dueDate: 1 })
        .limit(5);

      // Get recently completed tasks
      const recentlyCompletedTasks = await Task.find({
        assignedTo: studentId,
        status: "approved",
        isDeleted: false,
      })
        .sort({ approvalDate: -1 })
        .limit(5);

      // Calculate streak (consecutive days with completed tasks)
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check up to 30 days back for streak calculation
      for (let i = 0; i < 30; i++) {
        const day = new Date(today);
        day.setDate(day.getDate() - i);
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);

        const tasksCompletedOnDay = await Task.countDocuments({
          assignedTo: studentId,
          status: "approved",
          approvalDate: { $gte: day, $lt: nextDay },
          isDeleted: false,
        });

        if (tasksCompletedOnDay > 0) {
          streak++;
        } else if (i > 0) {
          // Break the streak if no tasks completed on this day (except today)
          break;
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          summary: {
            totalTasks,
            pendingTasks,
            completedTasks,
            approvedTasks,
            rejectedTasks,
            expiredTasks,
            dueSoonTasks,
            streak,
          },
          categorySummary: categoryCounts,
          upcomingTasks,
          recentlyCompletedTasks,
        },
      });
    } catch (error) {
      console.error("Get student tasks summary error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get student tasks summary",
        error: error.message,
      });
    }
  },

  /**
   * Add a comment to a task
   */
  addComment: async (req, res) => {
    try {
      const { id } = req.params;
      const { text } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!text) {
        return res.status(400).json({
          success: false,
          message: "Comment text is required",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task ID format",
        });
      }

      const task = await Task.findById(id);

      if (!task || task.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      // Check authorization - assignee, creator, or approved roles can comment
      const isAuthorized =
        task.assignedTo === userId ||
        task.createdBy === userId ||
        userRole === "platform_admin" ||
        (userRole === "school_admin" && task.schoolId) ||
        (userRole === "teacher" && task.classId);

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to comment on this task",
        });
      }

      // Add the comment
      const comment = {
        text,
        createdBy: userId,
        creatorRole: userRole,
        createdAt: new Date(),
      };

      const updatedTask = await Task.findByIdAndUpdate(
        id,
        { $push: { comments: comment } },
        { new: true }
      );

      // Notify relevant parties about the comment
      try {
        const notificationServiceUrl =
          process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3006";

        // If student comments, notify the approver/creator
        // If teacher/parent comments, notify the student
        const recipientId =
          userId === task.assignedTo ? task.createdBy : task.assignedTo;

        await axios.post(`${notificationServiceUrl}/api/notifications`, {
          type: "task_comment",
          recipientId: recipientId,
          data: {
            taskId: task._id,
            title: task.title,
            commentBy: `${userRole}`,
            commentPreview:
              text.substring(0, 50) + (text.length > 50 ? "..." : ""),
          },
        });
      } catch (error) {
        console.error("Failed to send comment notification:", error.message);
      }

      return res.status(200).json({
        success: true,
        message: "Comment added successfully",
        data: updatedTask.comments[updatedTask.comments.length - 1],
      });
    } catch (error) {
      console.error("Add comment error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to add comment",
        error: error.message,
      });
    }
  },

  /**
   * Create recurring task instances for a recurring task
   * This is a helper method used internally
   */
  createRecurringTaskInstance: async (task) => {
    try {
      // Skip if not a recurring task
      if (!task.isRecurring || !task.recurringSchedule) {
        return null;
      }

      // Determine the due date for the first instance
      const { frequency, daysOfWeek, interval } = task.recurringSchedule;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let instanceDate;

      if (frequency === "daily") {
        // For daily, due date is today or user-specified dueDate
        instanceDate = task.dueDate || today;
      } else if (frequency === "weekly") {
        // For weekly, find the next occurrence of specified days
        if (daysOfWeek && daysOfWeek.length > 0) {
          // Find the next day that matches one in daysOfWeek
          instanceDate = new Date(today);
          let found = false;

          // Check up to 7 days forward to find a matching day
          for (let i = 0; i < 7; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() + i);
            if (daysOfWeek.includes(checkDate.getDay())) {
              instanceDate = checkDate;
              found = true;
              break;
            }
          }

          if (!found) {
            // Default to today if no matching day found
            instanceDate = today;
          }
        } else {
          // If no days specified, use today or specified dueDate
          instanceDate = task.dueDate || today;
        }
      } else if (frequency === "monthly") {
        // For monthly, use the same day of month
        instanceDate = task.dueDate || today;
      }

      // Create the instance task
      const taskInstance = new Task({
        title: task.title,
        description: task.description,
        category: task.category,
        subCategory: task.subCategory,
        pointValue: task.pointValue,
        createdBy: task.createdBy,
        creatorRole: task.creatorRole,
        assignedTo: task.assignedTo,
        status: "pending",
        dueDate: instanceDate,
        requiresApproval: task.requiresApproval,
        approverType: task.approverType,
        specificApproverId: task.specificApproverId,
        externalResource: task.externalResource,
        attachments: task.attachments,
        difficulty: task.difficulty,
        schoolId: task.schoolId,
        classId: task.classId,
        visibility: task.visibility,
        metadata: task.metadata,

        // Recurring-specific fields
        parentTaskId: task._id.toString(),
        instanceDate: instanceDate,
        isRecurring: false, // Instance itself is not recurring
      });

      await taskInstance.save();
      return taskInstance;
    } catch (error) {
      console.error("Create recurring instance error:", error);
      return null;
    }
  },

  /**
   * Generate next recurring task instance
   * Used when a recurring task instance is completed
   */
  generateNextInstance: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task ID format",
        });
      }

      const task = await Task.findById(id);

      if (!task || task.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      // Find the parent recurring task
      const parentTask = await Task.findById(task.parentTaskId);

      if (!parentTask || !parentTask.isRecurring) {
        return res.status(400).json({
          success: false,
          message: "Parent recurring task not found or is not recurring",
        });
      }

      // Check authorization - only creator can generate instances
      const isAuthorized =
        parentTask.createdBy === userId || userRole === "platform_admin";

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to generate task instances",
        });
      }

      // Calculate next instance date based on the recurring schedule
      const { frequency, daysOfWeek, interval } = parentTask.recurringSchedule;
      const currentDate = task.dueDate || task.instanceDate || new Date();
      let nextInstanceDate;

      if (frequency === "daily") {
        nextInstanceDate = new Date(currentDate);
        nextInstanceDate.setDate(nextInstanceDate.getDate() + (interval || 1));
      } else if (frequency === "weekly") {
        nextInstanceDate = new Date(currentDate);
        nextInstanceDate.setDate(
          nextInstanceDate.getDate() + 7 * (interval || 1)
        );

        // If specific days of week are set, find the next matching day
        if (daysOfWeek && daysOfWeek.length > 0) {
          let found = false;

          // Look up to 7 days forward from the calculated date
          for (let i = 0; i < 7; i++) {
            const checkDate = new Date(nextInstanceDate);
            checkDate.setDate(checkDate.getDate() + i);
            if (daysOfWeek.includes(checkDate.getDay())) {
              nextInstanceDate = checkDate;
              found = true;
              break;
            }
          }

          if (!found) {
            // Default to 7 days from current if no matching day found
            nextInstanceDate = new Date(currentDate);
            nextInstanceDate.setDate(nextInstanceDate.getDate() + 7);
          }
        }
      } else if (frequency === "monthly") {
        nextInstanceDate = new Date(currentDate);
        nextInstanceDate.setMonth(
          nextInstanceDate.getMonth() + (interval || 1)
        );
      }

      // Check if we've reached the end date
      if (
        parentTask.recurringSchedule.endDate &&
        nextInstanceDate > new Date(parentTask.recurringSchedule.endDate)
      ) {
        return res.status(200).json({
          success: true,
          message: "End date reached, no more instances to generate",
          data: null,
        });
      }

      // Check if this instance already exists
      const existingInstance = await Task.findOne({
        parentTaskId: parentTask._id,
        instanceDate: nextInstanceDate,
        isDeleted: false,
      });

      if (existingInstance) {
        return res.status(200).json({
          success: true,
          message: "Instance already exists for this date",
          data: existingInstance,
        });
      }

      // Create the new instance
      const newInstance = new Task({
        title: parentTask.title,
        description: parentTask.description,
        category: parentTask.category,
        subCategory: parentTask.subCategory,
        pointValue: parentTask.pointValue,
        createdBy: parentTask.createdBy,
        creatorRole: parentTask.creatorRole,
        assignedTo: parentTask.assignedTo,
        status: "pending",
        dueDate: nextInstanceDate,
        requiresApproval: parentTask.requiresApproval,
        approverType: parentTask.approverType,
        specificApproverId: parentTask.specificApproverId,
        externalResource: parentTask.externalResource,
        attachments: parentTask.attachments,
        difficulty: parentTask.difficulty,
        schoolId: parentTask.schoolId,
        classId: parentTask.classId,
        visibility: parentTask.visibility,
        metadata: parentTask.metadata,

        // Recurring-specific fields
        parentTaskId: parentTask._id.toString(),
        instanceDate: nextInstanceDate,
        isRecurring: false, // Instance itself is not recurring
      });

      await newInstance.save();

      return res.status(201).json({
        success: true,
        message: "New task instance generated successfully",
        data: newInstance,
      });
    } catch (error) {
      console.error("Generate next instance error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to generate next task instance",
        error: error.message,
      });
    }
  },

  /**
   * Award points for a completed task
   * This is a helper method used internally
   */
  awardPointsForTask: async (task) => {
    try {
      // Only award points for approved tasks
      if (task.status !== "approved") {
        return;
      }

      // Call the points service to award points
      const pointsServiceUrl =
        process.env.POINTS_SERVICE_URL || "http://localhost:3004";

      await axios.post(`${pointsServiceUrl}/api/points/transactions`, {
        studentId: task.assignedTo,
        amount: task.pointValue,
        type: "earned",
        source: task.category === "attendance" ? "attendance" : "task",
        sourceId: task._id.toString(),
        description: `Completed task: ${task.title}`,
        awardedBy: task.approvedBy,
        awardedByRole: task.approverRole,
        metadata: {
          taskCategory: task.category,
          taskSubCategory: task.subCategory,
          difficulty: task.difficulty,
        },
      });

      return true;
    } catch (error) {
      console.error("Award points error:", error);
      return false;
    }
  },

  /**
   * Award points for a task completion using TaskCompletion model
   * This is a helper method used internally
   */
  awardPointsForTaskCompletion: async (req, task, taskCompletion) => {
    try {
      // Only award points for approved task completions
      if (taskCompletion.status !== "approved") {
        return;
      }

      console.log(taskCompletion, task)

      // Call the points service to award points
      const pointsServiceUrl =
        process.env.POINTS_SERVICE_URL || "http://localhost:3004";

      await axios.post(`${pointsServiceUrl}/api/points/transactions`, {
        studentId: taskCompletion.studentId,
        amount: task.pointValue,
        type: "earned",
        source: task.category === "attendance" ? "attendance" : "task",
        sourceId: taskCompletion._id.toString(), // Use completion ID as source
        description: `Completed task: ${task.title}`,
        awardedBy: taskCompletion.approvedBy || "system", // Handle null approvedBy
        awardedByRole: taskCompletion.approverRole,
        metadata: {
          taskId: task._id.toString(),
          taskCategory: task.category,
          taskSubCategory: task.subCategory,
          difficulty: task.difficulty,
          submissionId: taskCompletion._id.toString(),
        },
      }, {
        headers: {
          Authorization: req.headers.authorization,
        },
      });

      return true;
    } catch (error) {
      console.error("Award points for task completion error:");
      return false;
    }
  },

  /**
   * Get task statistics
   */
  getTaskStatistics: async (req, res) => {
    try {
      const {
        studentId,
        schoolId,
        classId,
        startDate,
        endDate,
        groupBy = "category",
      } = req.query;

      const userId = req.user.id;
      const userRole = req.user.role;

      // Build match filter
      const matchFilter = { isDeleted: false };

      if (studentId) matchFilter.assignedTo = studentId;
      if (schoolId) matchFilter.schoolId = schoolId;
      if (classId) matchFilter.classId = classId;

      // Date range
      if (startDate || endDate) {
        matchFilter.createdAt = {};
        if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
        if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
      }

      // Check authorization
      let isAuthorized = userRole === "platform_admin";

      if (userRole === "student") {
        isAuthorized = studentId === userId;
      } else if (userRole === "parent") {
        // In a real app, check if studentId is parent's child
        isAuthorized = true; // Simplified for now
      } else if (userRole === "teacher" || userRole === "school_admin") {
        isAuthorized = true; // Teachers and school admins can view stats
      }

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view these statistics",
        });
      }

      // Define group by field
      let groupByField;
      if (groupBy === "category") {
        groupByField = "$category";
      } else if (groupBy === "status") {
        groupByField = "$status";
      } else if (groupBy === "creatorRole") {
        groupByField = "$creatorRole";
      } else if (groupBy === "date") {
        groupByField = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
      } else {
        groupByField = "$category"; // Default
      }

      // Run aggregation
      const statistics = await Task.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: groupByField,
            count: { $sum: 1 },
            completedCount: {
              $sum: {
                $cond: [{ $eq: ["$status", "approved"] }, 1, 0],
              },
            },
            pendingCount: {
              $sum: {
                $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
              },
            },
            rejectedCount: {
              $sum: {
                $cond: [{ $eq: ["$status", "rejected"] }, 1, 0],
              },
            },
            totalPoints: {
              $sum: {
                $cond: [{ $eq: ["$status", "approved"] }, "$pointValue", 0],
              },
            },
            avgPointValue: { $avg: "$pointValue" },
          },
        },
        {
          $project: {
            _id: 0,
            category: "$_id",
            count: 1,
            completedCount: 1,
            pendingCount: 1,
            rejectedCount: 1,
            completionRate: {
              $cond: [
                { $eq: ["$count", 0] },
                0,
                {
                  $multiply: [{ $divide: ["$completedCount", "$count"] }, 100],
                },
              ],
            },
            totalPoints: 1,
            avgPointValue: 1,
          },
        },
        { $sort: { count: -1 } },
      ]);

      // Get overall summary
      const summary = await Task.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            totalTasks: { $sum: 1 },
            completedTasks: {
              $sum: {
                $cond: [{ $eq: ["$status", "approved"] }, 1, 0],
              },
            },
            totalPoints: {
              $sum: {
                $cond: [{ $eq: ["$status", "approved"] }, "$pointValue", 0],
              },
            },
            avgCompletionTime: {
              $avg: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", "approved"] },
                      { $ne: ["$completedDate", null] },
                      { $ne: ["$createdAt", null] },
                    ],
                  },
                  {
                    $divide: [
                      { $subtract: ["$completedDate", "$createdAt"] },
                      86400000, // Convert ms to days
                    ],
                  },
                  null,
                ],
              },
            },
          },
        },
      ]);

      return res.status(200).json({
        success: true,
        data: {
          statistics,
          summary: summary[0] || {
            totalTasks: 0,
            completedTasks: 0,
            totalPoints: 0,
            avgCompletionTime: 0,
          },
          groupBy,
          filters: {
            studentId,
            schoolId,
            classId,
            startDate,
            endDate,
          },
        },
      });
    } catch (error) {
      console.error("Get task statistics error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get task statistics",
        error: error.message,
      });
    }
  },

  toggleTaskVisibility: async (req, res) => {
    try {
      const { taskId, studentId, isVisible } = req.body;
      const { profiles, roles } = req.user;
      const role = req.query.role; // role making the toggle request

      if (!roles.includes(role)) {
        return res.status(403).json({ success: false, message: "Unauthorized role." });
      }

      if (!["parent", "teacher", "platform_admin", "sub_admin"].includes(role)) {
        return res.status(400).json({ success: false, message: "This role cannot toggle visibility." });
      }

      if (!taskId || !studentId || typeof isVisible !== "boolean") {
        return res.status(400).json({ success: false, message: "Missing or invalid fields." });
      }

      const toggledById = profiles[role]?._id;

      if (!toggledById) {
        return res.status(400).json({ success: false, message: "Profile not found for role." });
      }

      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ success: false, message: "Task not found." });
      }

      const visibilityDoc = await TaskVisibility.findOneAndUpdate(
        { taskId, toggledForUserId: studentId },
        {
          taskId,
          toggledForUserId: studentId,
          toggledBy: toggledById,
          toggleByRole: role,
          isVisible,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return res.status(200).json({
        success: true,
        message: `Task visibility ${isVisible ? "shown" : "hidden"} successfully.`,
        data: visibilityDoc,
      });

    } catch (err) {
      console.error("Error toggling task visibility:", err);
      res.status(500).json({ success: false, message: "Server error." });
    }
  },

  /**
   * Get tasks for a student with completion status
   */
  getStudentTasks: async (req, res) => {
    try {
      const { profiles, roles } = req.user;
      const { role } = req.query;
      const studentProfile = profiles?.['student'];
      const studentId = studentProfile?._id;
      const schoolId = studentProfile?.schoolId;
      const authHeader = req.headers.authorization;

      const studentClasses = await getStudentClasses(studentId, authHeader);

      if (!role || role !== "student" || !roles.includes("student")) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. This endpoint is for students only.',
        });
      }

      const {
        category,
        subCategory,
        startDate,
        endDate,
        dueDate,
        status,
        classId,
        page = 1,
        limit = 20,
        sort = "createdAt",
        order = "desc",
        isFeatured,
      } = req.query;

      const currentProfileId = profiles[role]?._id;
      const parsedPage = parseInt(page);
      const parsedLimit = parseInt(limit);
      const skip = (parsedPage - 1) * parsedLimit;

      // Build query for tasks assigned to the student
      let query = {
        isDeleted: false,
        $or: [
          {
            "assignedTo.role": "student",
            $or: [
              { "assignedTo.selectedPeopleIds": { $exists: false } },
              { "assignedTo.selectedPeopleIds": { $size: 0 } },
              { "assignedTo.selectedPeopleIds": { $in: [currentProfileId] } }
            ]
          },
          // School-level tasks without specific class assignment
          {
            schoolId: schoolId,
            "assignedTo.role": { $ne: "student" }, // Exclude student-specific tasks
            $or: [
              { classId: { $exists: false } },
              { classId: null }
            ]
          },
          {
            classId: { $in: studentClasses || [] }
          }
        ]
      };

      // Apply filters (excluding status - we'll handle that separately)
      if (category) query.category = category?.toLowerCase();
      if (subCategory) query.subCategory = subCategory?.toLowerCase();
      if (classId) query.classId = classId;

      if (dueDate) query.dueDate = new Date(dueDate);
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      // Fetch tasks first (without status filter)
      const tasks = await Task.find(query)
        .sort({ [sort]: order === "desc" ? -1 : 1 })
        .lean();

      // Get task IDs for fetching completion statuses
      const taskIds = tasks.map(task => task._id);

      // Fetch completion status for all tasks
      const taskCompletions = await TaskCompletion.find({
        taskId: { $in: taskIds },
        studentId: currentProfileId
      }).lean();

      // Create a map of task completions
      const completionMap = {};
      taskCompletions.forEach(completion => {
        completionMap[completion.taskId.toString()] = completion;
      });

      // Apply TaskVisibility filter
      const visibilities = await TaskVisibility.find({
        toggledForUserId: currentProfileId,
      }).select("taskId isVisible");

      const hiddenSet = new Set();
      const visibleSet = new Set();

      visibilities.forEach(tv => {
        const id = tv.taskId.toString();
        if (tv.isVisible) visibleSet.add(id);
        else hiddenSet.add(id);
      });

      // Exclude hidden tasks
      let filteredTasks = tasks.filter(task => !hiddenSet.has(task._id.toString()));

      // Include extra tasks made visible by parent for student
      const taskIdsSet = new Set(taskIds.map(id => id.toString()));
      const extraVisibleTaskIds = [...visibleSet].filter(id => !taskIdsSet.has(id));

      if (extraVisibleTaskIds.length) {
        // Build the same filter criteria for extra tasks
        let extraTaskQuery = {
          _id: { $in: extraVisibleTaskIds.map(id => new mongoose.Types.ObjectId(id)) },
          isDeleted: false,
        };

        // Apply the same filters as the main query
        if (category) extraTaskQuery.category = category?.toLowerCase();
        if (subCategory) extraTaskQuery.subCategory = subCategory?.toLowerCase();
        if (classId) extraTaskQuery.classId = classId;
        if (dueDate) extraTaskQuery.dueDate = new Date(dueDate);
        if (startDate || endDate) {
          extraTaskQuery.createdAt = {};
          if (startDate) extraTaskQuery.createdAt.$gte = new Date(startDate);
          if (endDate) extraTaskQuery.createdAt.$lte = new Date(endDate);
        }

        const extraTasks = await Task.find(extraTaskQuery).lean();

        // Get completion status for extra tasks too
        const extraTaskCompletions = await TaskCompletion.find({
          taskId: { $in: extraTasks.map(t => t._id) },
          studentId: currentProfileId
        }).lean();

        extraTaskCompletions.forEach(completion => {
          completionMap[completion.taskId.toString()] = completion;
        });

        filteredTasks.push(...extraTasks);
      }

      // Enhance tasks with completion status
      let enhancedTasks = filteredTasks.map(task => {
        const taskId = task._id.toString();
        const completion = completionMap[taskId];

        return {
          ...task,
          completionStatus: completion ? {
            status: completion.status,
            completedAt: completion.completedAt,
            note: completion.note,
            evidence: completion.evidence,
            approvalDate: completion.approvalDate,
            hasSubmitted: !!completion
          } : {
            status: "pending",
            hasSubmitted: false
          }
        };
      });

      // Apply status filter after enhancement (if provided)
      if (status) {
        enhancedTasks = enhancedTasks.filter(task =>
          task.completionStatus.status === status
        );
      }

      // Apply featured filter after enhancement (if provided)
      if (isFeatured) {
        enhancedTasks = enhancedTasks.filter(task =>
          task.isFeatured === true
        );
      }

      // Apply pagination to filtered results
      const totalFiltered = enhancedTasks.length;
      const paginatedTasks = enhancedTasks.slice(skip, skip + parsedLimit);

      res.json({
        success: true,
        data: paginatedTasks,
        pagination: {
          total: totalFiltered,
          page: parsedPage,
          limit: parsedLimit,
          pages: Math.ceil(totalFiltered / parsedLimit),
        },
      });
    } catch (err) {
      console.error("Error fetching student tasks:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  /**
   * Get a specific task by ID for a student with completion status
   */
  getStudentTaskById: async (req, res) => {
    try {
      const { profiles, roles } = req.user;
      const { role } = req.query;
      const { id } = req.params;
      const studentProfile = profiles?.['student'];
      const studentId = studentProfile?._id && new mongoose.Types.ObjectId(studentProfile?._id);
      const schoolId = studentProfile?.schoolId && new mongoose.Types.ObjectId(studentProfile?.schoolId);
      const authHeader = req.headers.authorization;

      let classIds = [];

      try {
        classIds = await getStudentClasses(studentId, authHeader);
      } catch (error) {
        console.error("Error fetching student classes:", error);
        throw error;
      }

      if (!role || role !== "student" || !roles.includes("student")) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. This endpoint is for students only.',
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task ID format",
        });
      }

      // Find the task
      const task = await Task.findById(id).lean();

      if (!task || task.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      // Check task visibility first
      const visibility = await TaskVisibility.findOne({
        taskId: id,
        toggledForUserId: studentId,
      });

      // If task is explicitly hidden by parent, deny access
      if (visibility && !visibility.isVisible) {
        return res.status(403).json({
          success: false,
          message: "This task is not available to you",
        });
      }

      // Check if student has access to this task
      let hasAccess = false;

      // Check if task is explicitly made visible by parent
      if (visibility && visibility.isVisible) {
        hasAccess = true;
      } else {
        // Check normal assignment rules
        if (task.assignedTo?.role === "student") {
          // If no specific students selected, it's assigned to all students
          if (!task.assignedTo.selectedPeopleIds || task.assignedTo.selectedPeopleIds.length === 0) {
            hasAccess = true;
          } else {
            // Check if current student is in the selected list
            hasAccess = task.assignedTo.selectedPeopleIds.some(
              assignedId => assignedId.toString() === studentId.toString()
            );
          }
        } else if (task.assignedTo?.role === "school") {
          if (task.schoolId.equals(schoolId) && (task.classId === null || task.classId === undefined)) {
            hasAccess = true;
          } else if (task.classId && classIds.some(id => id.equals(task.classId))) {
            hasAccess = true;
          }
        }
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to view this task",
        });
      }

      // Get completion status for this student
      const completion = await TaskCompletion.findOne({
        taskId: id,
        studentId: studentId
      }).lean();

      // Enhance task with completion status
      const enhancedTask = {
        ...task,
        completionStatus: completion ? {
          status: completion.status,
          completedAt: completion.completedAt,
          note: completion.note,
          evidence: completion.evidence,
          approvalDate: completion.approvalDate,
          approvedBy: completion.approvedBy,
          approverRole: completion.approverRole,
          feedback: completion.feedback,
          hasSubmitted: !!completion
        } : {
          status: "pending",
          hasSubmitted: false
        }
      };

      return res.status(200).json({
        success: true,
        data: enhancedTask,
      });

    } catch (error) {
      console.error("Get student task by ID error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get task",
        error: error.message,
      });
    }
  },

  /**
   * Get tasks for a parent with visibility information
   */
  getParentTasks: async (req, res) => {
    try {
      const { profiles, roles } = req.user;
      const { role } = req.query;
      const authHeader = req.headers.authorization;

      const childrenData = await getChildrenData(authHeader);

      // Get children's school IDs and class IDs
      const childrenSchoolIds = [...new Set(childrenData.map(child => {
        const schoolId = child.schoolId?._id || child.schoolId;
        return schoolId ? new mongoose.Types.ObjectId(schoolId) : null;
      }).filter(Boolean))];

      const childrenClassIds = [...new Set(childrenData.flatMap(child =>
        (child.classIds || []).map(classId => new mongoose.Types.ObjectId(classId))
      ))];

      if (!role || role !== "parent" || !roles.includes("parent")) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. This endpoint is for parents only.',
        });
      }

      const {
        category,
        subCategory,
        startDate,
        endDate,
        dueDate,
        status,
        classId,
        page = 1,
        limit = 20,
        sort = "createdAt",
        order = "desc",
        isFeatured,
      } = req.query;

      const currentProfileId = profiles[role]?._id;
      const childIds = profiles.parent?.childIds || [];
      const parsedPage = parseInt(page);
      const parsedLimit = parseInt(limit);
      const skip = (parsedPage - 1) * parsedLimit;

      // Build query for tasks assigned to parent or their children
      let query = { isDeleted: false };
      let conditions = [];

      // Tasks assigned to the parent
      conditions.push({
        "assignedTo.role": "parent",
        $or: [
          { "assignedTo.selectedPeopleIds": { $exists: false } },
          { "assignedTo.selectedPeopleIds": { $size: 0 } },
          { "assignedTo.selectedPeopleIds": { $in: [currentProfileId] } },
        ],
      });

      // Tasks assigned to children of the parent
      if (childIds.length) {
        conditions.push(
          {
            "assignedTo.role": "student",
            "assignedTo.selectedPeopleIds": { $in: childIds },
          },
          {
            "assignedTo.role": "student",
            $or: [
              { "assignedTo.selectedPeopleIds": { $exists: false } },
              { "assignedTo.selectedPeopleIds": { $size: 0 } },
            ],
          },
          {
            schoolId: { $in: childrenSchoolIds },
            $or: [
              { classId: { $exists: false } },
              { classId: null }
            ]
          },
          {
            classId: { $in: childrenClassIds },
          }
        );
      }

      query.$or = conditions;

      // Apply filters
      if (category) query.category = category;
      if (subCategory) query.subCategory = subCategory;
      if (classId) query.classId = classId;
      if (status) query.status = status;
      if (isFeatured) query.isFeatured = isFeatured === "true";
      if (dueDate) query.dueDate = new Date(dueDate);
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      // Fetch tasks
      const tasks = await Task.find(query)
        .sort({ [sort]: order === "desc" ? -1 : 1 })
        .lean();

      let filteredTasks = tasks;

      // Apply TaskVisibility logic for parent view
      if (childIds.length) {
        // Get visibility settings for all children
        const visibilityRecords = await TaskVisibility.find({
          toggledForUserId: { $in: childIds }
        }).lean();

        // Create visibility map
        const visibilityMap = {};

        visibilityRecords.forEach(record => {
          const taskId = record.taskId.toString();
          const childId = record.toggledForUserId.toString();

          if (!visibilityMap[taskId]) {
            visibilityMap[taskId] = {
              visibleChildren: new Set(),
              hiddenChildren: new Set()
            };
          }

          if (record.isVisible) {
            visibilityMap[taskId].visibleChildren.add(childId);
          } else {
            visibilityMap[taskId].hiddenChildren.add(childId);
          }
        });

        // Add visibility information to each task
        filteredTasks = filteredTasks.map(task => {
          const taskId = task._id.toString();
          const visibility = visibilityMap[taskId] || { visibleChildren: new Set(), hiddenChildren: new Set() };

          // Start with an empty set of visible children
          const visibleToChildren = new Set();

          // Determine which children can see this task based on task type
          if (task.assignedTo?.role === "parent") {
            // Parent-assigned tasks: hidden from all children unless explicitly made visible
            childIds.forEach(childId => {
              const childIdStr = childId.toString();
              if (visibility.visibleChildren.has(childIdStr)) {
                visibleToChildren.add(childIdStr);
              }
            });
          }
          else if (task.assignedTo?.role === "student") {
            if (!task.assignedTo.selectedPeopleIds || task.assignedTo.selectedPeopleIds.length === 0) {
              // Task assigned to all students - all children can see by default unless explicitly hidden
              childIds.forEach(childId => {
                const childIdStr = childId.toString();
                if (!visibility.hiddenChildren.has(childIdStr)) {
                  visibleToChildren.add(childIdStr);
                }
              });
            } else {
              // Task assigned to specific students - only those children can see by default
              childIds.forEach(childId => {
                const childIdStr = childId.toString();
                const isAssigned = task.assignedTo.selectedPeopleIds.some(id => id.toString() === childIdStr);

                if (isAssigned && !visibility.hiddenChildren.has(childIdStr)) {
                  visibleToChildren.add(childIdStr);
                }
              });
            }
          } else {
            // System/School/Class tasks without specific assignment role
            // Determine visibility based on school and class membership
            childIds.forEach(childId => {
              const childIdStr = childId.toString();
              const child = childrenData.find(c => c._id.toString() === childIdStr);

              if (child) {
                let canSeeTask = false;

                // Check if task is a school-level task
                if (task.schoolId && (!task.classId || task.classId === null)) {
                  const taskSchoolId = task.schoolId.toString();
                  const childSchoolId = (child.schoolId?._id || child.schoolId)?.toString();
                  canSeeTask = taskSchoolId === childSchoolId;
                }
                // Check if task is a class-level task
                else if (task.classId) {
                  const taskClassId = task.classId.toString();
                  canSeeTask = (child.classIds || []).some(classId => classId.toString() === taskClassId);
                }

                // Apply visibility settings
                if (canSeeTask && !visibility.hiddenChildren.has(childIdStr)) {
                  visibleToChildren.add(childIdStr);
                }
              }
            });
          }

          // Add explicitly visible children (overrides default logic)
          visibility.visibleChildren.forEach(childId => {
            visibleToChildren.add(childId);
          });

          // Return enhanced task with simple visibility array
          return {
            ...task,
            visibleToChildren: Array.from(visibleToChildren)
          };
        });
      }

      // Apply pagination to filtered results
      const totalFiltered = filteredTasks.length;
      const paginatedTasks = filteredTasks.slice(skip, skip + parsedLimit);

      res.json({
        success: true,
        data: paginatedTasks,
        pagination: {
          total: totalFiltered,
          page: parsedPage,
          limit: parsedLimit,
          pages: Math.ceil(totalFiltered / parsedLimit),
        },
      });
    } catch (err) {
      console.error("Error fetching parent tasks:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  /**
   * Get tasks for approval
   */
  // TODO: Refactor to reduce code duplication while maintaining exact functionality
  getTasksForApproval: async (req, res) => {
    try {
      const role = req.query.role;
      const { profiles } = req.user;
      const { status = 'all', sortBy = 'updatedAt', order = 'desc' } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const validRoles = ["parent", "teacher", "social_worker", "platform_admin", "school_admin"];
      const validStatuses = ["pending", "pending_approval", "approved", "rejected", "expired", "all"];
      const validSortFields = ["createdAt", "updatedAt", "status"];
      const validSortOrders = ["asc", "desc"];

      // Validation: Role must be provided
      if (!role) {
        return res.status(400).json({ success: false, message: "Role is required" });
      }

      // Validation: Role must be one of the supported roles
      if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, message: "Invalid role" });
      }

      // Validation: Status must be one of the defined values
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }

      // Validation: sortBy must be a valid sortable field
      if (!validSortFields.includes(sortBy)) {
        return res.status(400).json({ success: false, message: "Invalid sortBy field" });
      }

      // Validation: order must be either asc or desc
      if (!validSortOrders.includes(order)) {
        return res.status(400).json({ success: false, message: "Invalid order, use 'asc' or 'desc'" });
      }

      // Logic for parent role
      if (role === 'parent') {
        const childIds = profiles[role]?.childIds;

        // Convert childIds to ObjectId format for querying
        const objectIds = childIds.map(id => new mongoose.Types.ObjectId(id));

        // Base match stage to get task completions submitted by children
        const matchStage = {
          studentId: { $in: objectIds }
        };

        // If status is provided and not "all", apply filter
        if (status && status !== 'all') {
          matchStage.status = status;
        }

        /**
         * Aggregation pipeline:
         * 1. Match TaskCompletions by child (studentId) and optional status
         * 2. Lookup student details and their linked user info
         * 3. Flatten nested user inside student
         * 4. Lookup task details
         * 5. Filter tasks that require parent approval and are not deleted
         * 6. Project only required fields
         */
        const aggregationPipeline = [
          { $match: matchStage },
          {
            $lookup: {
              from: "students",
              localField: "studentId",
              foreignField: "_id",
              as: "childDetails",
              pipeline: [
                {
                  $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                  }
                },
                {
                  $addFields: {
                    user: { $arrayElemAt: ["$user", 0] },
                  }
                }
              ]
            }
          },
          // Flatten childDetails array
          {
            $addFields: {
              childDetails: { $arrayElemAt: ["$childDetails", 0] }
            }
          },
          {
            $addFields: {
              childDetails: {
                $mergeObjects: [
                  "$childDetails",
                  "$childDetails.user"
                ]
              },
            }
          },
          // Lookup task details
          {
            $lookup: {
              from: "tasks",
              localField: "taskId",
              foreignField: "_id",
              as: "task"
            }
          },
          {
            $addFields: {
              task: { $arrayElemAt: ["$task", 0] }
            }
          },
          // Ensure only tasks that require parent approval and are not deleted are included
          {
            $match: {
              "task.isDeleted": false,
              "task.approverType": { $in: ["parent"] },
            }
          },
          // Final projection: send only necessary fields to the client
          {
            $project: {
              taskId: 1,
              studentId: 1,
              completedAt: 1,
              note: 1,
              evidence: 1,
              status: 1,
              approvedBy: 1,
              approverRole: 1,
              approvalDate: 1,
              createdAt: 1,
              updatedAt: 1,
              task: 1,
              childDetails: {
                userId: 1,
                firstName: 1,
                lastName: 1,
                avatar: 1,
                email: 1,
                grade: 1
              },
              feedback: 1
            }
          }
        ]

        // Pagination options
        const options = {
          page,
          limit,
          sort: { [sortBy]: order === 'asc' ? 1 : -1 }
        }

        // Execute the aggregation with pagination
        const approvalRequest = await TaskCompletion.aggregatePaginate(
          TaskCompletion.aggregate(aggregationPipeline),
          options
        );

        return res.status(200).json({ success: true, data: approvalRequest })
      }

      if (role === 'school_admin') {
        const schoolProfile = await getSchoolProfile(req.headers.authorization);
        const schoolId = schoolProfile?._id;

        if (!schoolId) {
          return res.status(400).json({
            success: false,
            message: "School admin profile missing schoolId"
          });
        }

        // Convert schoolId to ObjectId format for querying
        const schoolObjectId = new mongoose.Types.ObjectId(schoolId);

        // Base match stage to get task completions from students in the school admin's school
        const matchStage = {};

        // If status is provided and not "all", apply filter
        if (status && status !== 'all') {
          matchStage.status = status;
        }

        // Aggregation pipeline
        const aggregationPipeline = [
          { $match: matchStage },
          {
            $lookup: {
              from: "tasks",
              localField: "taskId",
              foreignField: "_id",
              as: "task"
            }
          },
          {
            $addFields: {
              task: { $arrayElemAt: ["$task", 0] }
            }
          },
          {
            $match: {
              "task.isDeleted": { $ne: true },        // task must not be deleted
              $or: [                                   // AND one of these must be true
                { "task.dueDate": { $gte: new Date() } }, // due date is in the future
                { "task.dueDate": { $exists: false } },   // due date not set at all
                { "task.dueDate": null }                  // due date explicitly null
              ]
            }
          },
          {
            $lookup: {
              from: "students",
              localField: "studentId",
              foreignField: "_id",
              as: "childDetails",
              pipeline: [
                {
                  $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                  }
                },
                {
                  $addFields: {
                    user: { $arrayElemAt: ["$user", 0] },
                  }
                }
              ]
            }
          },
          // Flatten childDetails array
          {
            $addFields: {
              childDetails: { $arrayElemAt: ["$childDetails", 0] }
            }
          },
          {
            $addFields: {
              childDetails: {
                $mergeObjects: [
                  "$childDetails",
                  "$childDetails.user"
                ]
              },
            }
          },
          // Match task claims for tasks that:
          // - Require approval from a teacher or school admin
          // - Are linked to the same school, either because:
          //    • The child who submitted the task belongs to the school, OR
          //    • The task itself belongs to the school
          {
            $match: {
              $and: [
                { "task.approverType": { $in: ["teacher", "school_admin"] } },
                {
                  $or: [
                    { $expr: { $eq: ["$childDetails.schoolId", schoolObjectId] } },
                    { $expr: { $eq: [{ $toObjectId: "$task.schoolId" }, schoolObjectId] } }
                  ]
                }
              ]
            }
          },
          // Final projection: send only necessary fields to the client
          {
            $project: {
              taskId: 1,
              studentId: 1,
              completedAt: 1,
              note: 1,
              evidence: 1,
              status: 1,
              approvedBy: 1,
              approverRole: 1,
              approvalDate: 1,
              createdAt: 1,
              updatedAt: 1,
              task: 1,
              childDetails: {
                userId: 1,
                firstName: 1,
                lastName: 1,
                avatar: 1,
                email: 1,
                grade: 1
              },
              feedback: 1
            }
          }
        ]

        // Pagination options
        const options = {
          page,
          limit,
          sort: { [sortBy]: order === 'asc' ? 1 : -1 }
        }

        // Execute the aggregation with pagination
        const approvalRequest = await TaskCompletion.aggregatePaginate(
          TaskCompletion.aggregate(aggregationPipeline),
          options
        );

        return res.status(200).json({ success: true, data: approvalRequest })
      }

      if (role === 'teacher') {
        const teacherProfile = profiles?.['teacher'];
        const classIds = teacherProfile?.classIds;

        if (!classIds?.length) {
          return res.status(400).json({ success: false, message: "Teacher profile missing classIds" });
        }

        const classIdsObjectIds = classIds.map(id => new mongoose.Types.ObjectId(id));

        const classesDetails = await Promise.all(
          classIds.map(id => getClassById(id, req.headers.authorization))
        );

        const allStudentIds = classesDetails.flatMap(c => c.studentIds);
        const allStudentObjectIds = allStudentIds.map(id => new mongoose.Types.ObjectId(id));

        // Base match stage to get task completions from students in the teacher's classes
        const matchStage = {};

        // If status is provided and not "all", apply filter
        if (status && status !== 'all') {
          matchStage.status = status;
        }

        // Aggregation pipeline
        const aggregationPipeline = [
          { $match: matchStage },
          {
            $lookup: {
              from: "tasks",
              localField: "taskId",
              foreignField: "_id",
              as: "task"
            }
          },
          {
            $addFields: {
              task: { $arrayElemAt: ["$task", 0] }
            }
          },
          // Match only valid tasks for this teacher:
          // 1. Exclude deleted tasks
          // 2. Ensure approverType is "teacher" (works whether it's a string or array)
          // 3. Then allow either:
          //    a) Class-based tasks → if task.classId belongs to one of the teacher's classes
          //    b) Student-based tasks → if task was created for all students (e.g., by platform admin)
          //       i.e. no classId AND no schoolId, and the student is in this teacher's student list
          {
            $match: {
              "task.isDeleted": false,
              $and: [
                { "task.approverType": { $in: ["teacher"] } },
                {
                  $or: [
                    { "task.classId": { $in: classIdsObjectIds } },
                    {
                      $and: [
                        { "studentId": { $in: allStudentObjectIds } },
                        { "task.classId": { $eq: null } },
                        { "task.schoolId": { $eq: null } },
                      ]
                    }
                  ]
                }
              ]
            }
          },
          {
            $lookup: {
              from: "students",
              localField: "studentId",
              foreignField: "_id",
              as: "childDetails",
              pipeline: [
                {
                  $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                  }
                },
                {
                  $addFields: {
                    user: { $arrayElemAt: ["$user", 0] },
                  }
                }
              ]
            }
          },
          // Flatten childDetails array
          {
            $addFields: {
              childDetails: { $arrayElemAt: ["$childDetails", 0] }
            }
          },
          {
            $addFields: {
              childDetails: {
                $mergeObjects: [
                  "$childDetails",
                  "$childDetails.user"
                ]
              },
            }
          },
          // Final projection: send only necessary fields to the client
          {
            $project: {
              taskId: 1,
              studentId: 1,
              completedAt: 1,
              note: 1,
              evidence: 1,
              status: 1,
              approvedBy: 1,
              approverRole: 1,
              approvalDate: 1,
              createdAt: 1,
              updatedAt: 1,
              task: 1,
              childDetails: {
                userId: 1,
                firstName: 1,
                lastName: 1,
                avatar: 1,
                email: 1,
                grade: 1
              },
              feedback: 1
            }
          }
        ]

        // Pagination options
        const options = {
          page,
          limit,
          sort: { [sortBy]: order === 'asc' ? 1 : -1 }
        }

        // Execute the aggregation with pagination
        const approvalRequest = await TaskCompletion.aggregatePaginate(
          TaskCompletion.aggregate(aggregationPipeline),
          options
        );

        return res.status(200).json({ success: true, data: approvalRequest })
      }
    } catch (error) {
      console.log('Server error: ', error)

      if (process.env.NODE_ENV === 'development') {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
      }

      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
};

module.exports = taskController;  