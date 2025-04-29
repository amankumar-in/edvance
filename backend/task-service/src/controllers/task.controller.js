const Task = require("../models/task.model");
const mongoose = require("mongoose");
const axios = require("axios");

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
      const {
        title,
        description,
        category,
        subCategory,
        pointValue,
        assignedTo,
        dueDate,
        isRecurring,
        recurringSchedule,
        requiresApproval,
        approverType,
        specificApproverId,
        externalResource,
        attachments,
        difficulty,
        schoolId,
        classId,
        visibility,
        metadata,
      } = req.body;

      // Extract user info from authentication middleware
      const createdBy = req.user.id;
      const creatorRole = req.user.role;

      // Validate required fields
      if (!title || !category || !assignedTo || pointValue === undefined) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: title, category, assignedTo, and pointValue are required",
        });
      }

      // Create new task
      const task = new Task({
        title,
        description,
        category,
        subCategory,
        pointValue: Number(pointValue),
        createdBy,
        creatorRole,
        assignedTo,
        status: "pending",
        dueDate: dueDate ? new Date(dueDate) : undefined,
        isRecurring: isRecurring || false,
        recurringSchedule: isRecurring ? recurringSchedule : undefined,
        requiresApproval:
          requiresApproval !== undefined ? requiresApproval : true,
        approverType:
          approverType ||
          (creatorRole === "parent"
            ? "parent"
            : creatorRole === "teacher" || creatorRole === "school_admin"
            ? "teacher"
            : "none"),
        specificApproverId: specificApproverId || createdBy,
        externalResource,
        attachments,
        difficulty,
        schoolId,
        classId,
        visibility: visibility || "private",
        metadata,
      });

      await task.save();

      // If this is a recurring task, create the first instance
      if (isRecurring && recurringSchedule) {
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

      // Check if user has permission to view this task
      // Here we'd implement access control logic
      // For example, a student should only see tasks assigned to them
      // A parent should only see tasks they created or assigned to their children
      // A teacher should only see tasks they created or for their class/school

      // For now, basic check: user is creator, assigned student, or approved role (admin, etc.)
      const userId = req.user.id;
      const userRole = req.user.role;

      const isAuthorized =
        task.createdBy === userId ||
        task.assignedTo === userId ||
        userRole === "platform_admin" ||
        (userRole === "school_admin" && task.schoolId) ||
        (userRole === "teacher" && task.classId) ||
        (userRole === "parent" && task.assignedTo === req.query.childId);

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this task",
        });
      }

      return res.status(200).json({
        success: true,
        data: task,
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
      const { id } = req.params;
      const updateData = req.body;
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

      // Check authorization - only creator or approved roles can update
      const isAuthorized =
        task.createdBy === userId ||
        userRole === "platform_admin" ||
        (userRole === "school_admin" && task.schoolId) ||
        (userRole === "teacher" &&
          task.classId &&
          task.creatorRole === "teacher");

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this task",
        });
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

      // Check authorization - only creator or approved roles can delete
      const isAuthorized =
        task.createdBy === userId ||
        userRole === "platform_admin" ||
        (userRole === "school_admin" && task.schoolId) ||
        (userRole === "teacher" &&
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
        updateData.approvedBy = "system";
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
   * Approve or reject a completed task
   */
  reviewTask: async (req, res) => {
    try {
      const { id } = req.params;
      const { action, feedback } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

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

      const task = await Task.findById(id);

      if (!task || task.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      // Check if task is awaiting approval
      if (task.status !== "pending_approval") {
        return res.status(400).json({
          success: false,
          message: "Task is not awaiting approval",
        });
      }

      // Check if user is authorized to approve/reject
      let isAuthorized = false;

      if (task.approverType === "parent" && userRole === "parent") {
        isAuthorized = task.specificApproverId
          ? task.specificApproverId === userId
          : task.createdBy === userId;
      } else if (
        task.approverType === "teacher" &&
        (userRole === "teacher" || userRole === "school_admin")
      ) {
        isAuthorized = task.createdBy === userId || userRole === "school_admin";
      } else if (userRole === "platform_admin") {
        isAuthorized = true;
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
      };

      // Add feedback as a comment if provided
      if (feedback) {
        updateData.$push = {
          comments: {
            text: feedback,
            createdBy: userId,
            creatorRole: userRole,
          },
        };
      }

      const updatedTask = await Task.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      // If approved, award points
      if (action === "approve") {
        await taskController.awardPointsForTask(updatedTask);
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
   * Get tasks with filtering
   */
  getTasks: async (req, res) => {
    try {
      const {
        assignedTo,
        createdBy,
        category,
        subCategory,
        status,
        startDate,
        endDate,
        isRecurring,
        schoolId,
        classId,
        page = 1,
        limit = 20,
        sort = "dueDate",
        order = "asc",
      } = req.query;

      const userId = req.user.id;
      const userRole = req.user.role;

      // Build filter
      const filter = { isDeleted: false };

      // Add filters based on query params
      if (assignedTo) filter.assignedTo = assignedTo;
      if (createdBy) filter.createdBy = createdBy;
      if (category) filter.category = category;
      if (subCategory) filter.subCategory = subCategory;
      if (status) filter.status = status;
      if (isRecurring !== undefined)
        filter.isRecurring = isRecurring === "true";
      if (schoolId) filter.schoolId = schoolId;
      if (classId) filter.classId = classId;

      // Date range filter
      if (startDate || endDate) {
        filter.dueDate = {};
        if (startDate) filter.dueDate.$gte = new Date(startDate);
        if (endDate) filter.dueDate.$lte = new Date(endDate);
      }

      // Access control based on user role
      if (userRole === "student") {
        // Students can only see tasks assigned to them
        filter.assignedTo = userId;
      } else if (userRole === "parent") {
        // Parents can see tasks they created or that are assigned to their children
        // In a real application, we would check if assignedTo is one of parent's children
        if (!assignedTo && !createdBy) {
          filter.$or = [
            { createdBy: userId },
            { assignedTo: { $in: req.user.childIds || [] } },
          ];
        }
      } else if (userRole === "teacher") {
        // Teachers can see tasks they created or for their classes
        if (!assignedTo && !createdBy && !classId && !schoolId) {
          filter.$or = [
            { createdBy: userId },
            { classId: { $in: req.user.classIds || [] } },
          ];
        }
      } else if (userRole === "school_admin") {
        // School admins can see all tasks for their school
        if (!schoolId) {
          filter.schoolId = req.user.schoolId;
        }
      }
      // Platform admins can see all tasks

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOrder = order === "desc" ? -1 : 1;

      // Execute query with pagination
      const tasks = await Task.find(filter)
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count for pagination
      const total = await Task.countDocuments(filter);

      return res.status(200).json({
        success: true,
        data: {
          tasks,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Get tasks error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get tasks",
        error: error.message,
      });
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
};

module.exports = taskController;
