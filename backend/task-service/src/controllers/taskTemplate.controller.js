const TaskTemplate = require("../models/taskTemplate.model");
const Task = require("../models/task.model");
const mongoose = require("mongoose");

/**
 * Task Template Controller
 * Handles operations related to task templates
 */
const taskTemplateController = {
  /**
   * Create a new task template
   */
  createTemplate: async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        subCategory,
        suggestedPointValue,
        requiresApproval,
        defaultApproverType,
        isRecurring,
        defaultRecurringSchedule,
        estimatedDuration,
        difficulty,
        externalResource,
        attachments,
        recommendedAgeMin,
        recommendedAgeMax,
        recommendedGradeMin,
        recommendedGradeMax,
        schoolId,
        visibility,
      } = req.body;

      // Extract user info from authentication middleware
      const createdBy = req.user.id;
      const creatorRole = req.user.role;

      // Validate required fields
      if (!title || !category || !suggestedPointValue) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: title, category, and suggestedPointValue are required",
        });
      }

      // Create new template
      const template = new TaskTemplate({
        title,
        description,
        category,
        subCategory,
        suggestedPointValue: Number(suggestedPointValue),
        createdBy,
        creatorRole,
        requiresApproval:
          requiresApproval !== undefined ? requiresApproval : true,
        defaultApproverType:
          defaultApproverType ||
          (creatorRole === "parent"
            ? "parent"
            : creatorRole === "teacher" || creatorRole === "school_admin"
            ? "teacher"
            : "none"),
        isRecurring: isRecurring || false,
        defaultRecurringSchedule: isRecurring
          ? defaultRecurringSchedule
          : undefined,
        estimatedDuration,
        difficulty,
        externalResource,
        attachments,
        recommendedAgeMin,
        recommendedAgeMax,
        recommendedGradeMin,
        recommendedGradeMax,
        schoolId,
        visibility: visibility || "private",
        isFeatured: false,
        usageCount: 0,
        isActive: true,
      });

      await template.save();

      return res.status(201).json({
        success: true,
        message: "Template created successfully",
        data: template,
      });
    } catch (error) {
      console.error("Create template error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create template",
        error: error.message,
      });
    }
  },

  /**
   * Get a task template by ID
   */
  getTemplateById: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid template ID format",
        });
      }

      const template = await TaskTemplate.findById(id);

      if (!template || !template.isActive) {
        return res.status(404).json({
          success: false,
          message: "Template not found",
        });
      }

      // Check visibility/authorization
      const userId = req.user.id;
      const userRole = req.user.role;

      let isAuthorized =
        template.createdBy === userId ||
        template.visibility === "public" ||
        userRole === "platform_admin";

      // School admin can see school templates
      if (
        userRole === "school_admin" &&
        template.schoolId &&
        req.user.schoolId === template.schoolId
      ) {
        isAuthorized = true;
      }

      // Teachers can see school templates for their school
      if (
        userRole === "teacher" &&
        template.schoolId &&
        req.user.schoolId === template.schoolId
      ) {
        isAuthorized = true;
      }

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this template",
        });
      }

      return res.status(200).json({
        success: true,
        data: template,
      });
    } catch (error) {
      console.error("Get template error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get template",
        error: error.message,
      });
    }
  },

  /**
   * Update a task template
   */
  updateTemplate: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid template ID format",
        });
      }

      const template = await TaskTemplate.findById(id);

      if (!template || !template.isActive) {
        return res.status(404).json({
          success: false,
          message: "Template not found",
        });
      }

      // Check authorization
      let isAuthorized =
        template.createdBy === userId || userRole === "platform_admin";

      // School admin can update school templates
      if (
        userRole === "school_admin" &&
        template.schoolId &&
        req.user.schoolId === template.schoolId
      ) {
        isAuthorized = true;
      }

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this template",
        });
      }

      // Don't allow changing certain fields
      const protectedFields = [
        "createdBy",
        "creatorRole",
        "usageCount",
        "createdAt",
        "updatedAt",
      ];
      protectedFields.forEach((field) => {
        if (updateData[field]) delete updateData[field];
      });

      // Update the template
      const updatedTemplate = await TaskTemplate.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Template updated successfully",
        data: updatedTemplate,
      });
    } catch (error) {
      console.error("Update template error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update template",
        error: error.message,
      });
    }
  },

  /**
   * Delete a task template (soft delete)
   */
  deleteTemplate: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid template ID format",
        });
      }

      const template = await TaskTemplate.findById(id);

      if (!template || !template.isActive) {
        return res.status(404).json({
          success: false,
          message: "Template not found",
        });
      }

      // Check authorization
      let isAuthorized =
        template.createdBy === userId || userRole === "platform_admin";

      // School admin can delete school templates
      if (
        userRole === "school_admin" &&
        template.schoolId &&
        req.user.schoolId === template.schoolId
      ) {
        isAuthorized = true;
      }

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this template",
        });
      }

      // Soft delete by setting isActive to false
      await TaskTemplate.findByIdAndUpdate(id, { isActive: false });

      return res.status(200).json({
        success: true,
        message: "Template deleted successfully",
      });
    } catch (error) {
      console.error("Delete template error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete template",
        error: error.message,
      });
    }
  },

  /**
   * Get all templates with filtering
   */
  getTemplates: async (req, res) => {
    try {
      const {
        category,
        createdBy,
        visibility,
        schoolId,
        isFeatured,
        search,
        gradeMin,
        gradeMax,
        ageMin,
        ageMax,
        difficulty,
        page = 1,
        limit = 20,
        sort = "title",
        order = "asc",
      } = req.query;

      const userId = req.user.id;
      const userRole = req.user.role;

      // Build filter
      const filter = { isActive: true };

      // Add filters based on query params
      if (category) filter.category = category;
      if (createdBy) filter.createdBy = createdBy;
      if (visibility) filter.visibility = visibility;
      if (schoolId) filter.schoolId = schoolId;
      if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";
      if (difficulty) filter.difficulty = difficulty;

      // Grade level filtering
      if (gradeMin || gradeMax) {
        filter.$and = filter.$and || [];

        if (gradeMin) {
          filter.$and.push({
            $or: [
              { recommendedGradeMin: { $lte: Number(gradeMin) } },
              { recommendedGradeMin: null },
            ],
          });
        }

        if (gradeMax) {
          filter.$and.push({
            $or: [
              { recommendedGradeMax: { $gte: Number(gradeMax) } },
              { recommendedGradeMax: null },
            ],
          });
        }
      }

      // Age filtering
      if (ageMin || ageMax) {
        filter.$and = filter.$and || [];

        if (ageMin) {
          filter.$and.push({
            $or: [
              { recommendedAgeMin: { $lte: Number(ageMin) } },
              { recommendedAgeMin: null },
            ],
          });
        }

        if (ageMax) {
          filter.$and.push({
            $or: [
              { recommendedAgeMax: { $gte: Number(ageMax) } },
              { recommendedAgeMax: null },
            ],
          });
        }
      }

      // Search by title or description
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      // Access control based on user role and visibility
      if (userRole === "student" || userRole === "parent") {
        // Students and parents can see public, their own, and school templates
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { visibility: "public" },
            { createdBy: userId },
            ...(req.user.schoolId
              ? [{ visibility: "school", schoolId: req.user.schoolId }]
              : []),
          ],
        });
      } else if (userRole === "teacher") {
        // Teachers can see public, their own, and their school's templates
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { visibility: "public" },
            { createdBy: userId },
            { visibility: "school", schoolId: req.user.schoolId },
          ],
        });
      } else if (userRole === "school_admin") {
        // School admins can see public, their own, and their school's templates
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { visibility: "public" },
            { createdBy: userId },
            { schoolId: req.user.schoolId },
          ],
        });
      }
      // Platform admins can see all templates

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOrder = order === "desc" ? -1 : 1;

      // Execute query with pagination
      const templates = await TaskTemplate.find(filter)
        .sort({ [sort]: sortOrder, isFeatured: -1 }) // Featured templates first
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count for pagination
      const total = await TaskTemplate.countDocuments(filter);

      return res.status(200).json({
        success: true,
        data: {
          templates,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Get templates error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get templates",
        error: error.message,
      });
    }
  },

  /**
   * Use a template to create a task
   */
  useTemplate: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        assignedTo,
        dueDate,
        pointValue,
        description,
        specificApproverId,
        isRecurring,
        recurringSchedule,
        attachments,
        visibility,
        metadata,
      } = req.body;

      // Extract user info from authentication middleware
      const createdBy = req.user.id;
      const creatorRole = req.user.role;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid template ID format",
        });
      }

      // Validate assignedTo
      if (!assignedTo) {
        return res.status(400).json({
          success: false,
          message: "assignedTo is required when creating a task from template",
        });
      }

      const template = await TaskTemplate.findById(id);

      if (!template || !template.isActive) {
        return res.status(404).json({
          success: false,
          message: "Template not found",
        });
      }

      // Check authorization to use this template
      const userId = req.user.id;
      const userRole = req.user.role;

      let isAuthorized =
        template.createdBy === userId ||
        template.visibility === "public" ||
        userRole === "platform_admin";

      // School admin/teacher can use school templates
      if (
        (userRole === "school_admin" || userRole === "teacher") &&
        template.schoolId &&
        req.user.schoolId === template.schoolId
      ) {
        isAuthorized = true;
      }

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to use this template",
        });
      }

      // Create the task from template
      const task = new Task({
        title: template.title,
        description: description || template.description,
        category: template.category,
        subCategory: template.subCategory,
        pointValue: pointValue || template.suggestedPointValue,
        createdBy,
        creatorRole,
        assignedTo,
        status: "pending",
        dueDate: dueDate ? new Date(dueDate) : undefined,
        isRecurring:
          isRecurring !== undefined ? isRecurring : template.isRecurring,
        recurringSchedule:
          recurringSchedule || template.defaultRecurringSchedule,
        requiresApproval: template.requiresApproval,
        approverType: template.defaultApproverType,
        specificApproverId: specificApproverId || createdBy,
        externalResource: template.externalResource,
        attachments: attachments || template.attachments,
        difficulty: template.difficulty,
        schoolId: template.schoolId,
        visibility: visibility || template.visibility,
        metadata: metadata || {},
      });

      await task.save();

      // Increment usage count
      await TaskTemplate.findByIdAndUpdate(id, { $inc: { usageCount: 1 } });

      // If this is a recurring task, create the first instance
      if (task.isRecurring && task.recurringSchedule) {
        try {
          // Call the task controller to handle this
          // For now we'll simulate this functionality here
          // Normally this would be imported from task controller
          const instance = { ...task.toObject() };
          delete instance._id;
          instance.parentTaskId = task._id.toString();
          instance.instanceDate = task.dueDate || new Date();
          instance.isRecurring = false;

          const instanceTask = new Task(instance);
          await instanceTask.save();
        } catch (error) {
          console.error("Error creating recurring instance:", error);
          // Continue even if instance creation fails
        }
      }

      // Send notification to the assigned student
      try {
        const notificationServiceUrl =
          process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3005";

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
        console.error(
          "Failed to send task assignment notification:",
          error.message
        );
      }

      return res.status(201).json({
        success: true,
        message: "Task created from template successfully",
        data: task,
      });
    } catch (error) {
      console.error("Use template error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create task from template",
        error: error.message,
      });
    }
  },

  /**
   * Toggle featured status for a template (admin only)
   */
  toggleFeatured: async (req, res) => {
    try {
      const { id } = req.params;
      const userRole = req.user.role;

      // Only platform admins or school admins can feature templates
      if (userRole !== "platform_admin" && userRole !== "school_admin") {
        return res.status(403).json({
          success: false,
          message: "Only administrators can feature or unfeature templates",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid template ID format",
        });
      }

      const template = await TaskTemplate.findById(id);

      if (!template || !template.isActive) {
        return res.status(404).json({
          success: false,
          message: "Template not found",
        });
      }

      // School admins can only feature templates for their own school
      if (
        userRole === "school_admin" &&
        (!template.schoolId || template.schoolId !== req.user.schoolId)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "School administrators can only feature templates for their own school",
        });
      }

      // Toggle featured status
      await TaskTemplate.findByIdAndUpdate(id, {
        isFeatured: !template.isFeatured,
      });

      return res.status(200).json({
        success: true,
        message: template.isFeatured
          ? "Template unfeatured successfully"
          : "Template featured successfully",
      });
    } catch (error) {
      console.error("Toggle featured error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update template featured status",
        error: error.message,
      });
    }
  },

  /**
   * Create a set of default system templates
   * This is an admin function to initialize the system with defaults
   */
  createDefaultTemplates: async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      // Only platform admin can create system templates
      if (userRole !== "platform_admin") {
        return res.status(403).json({
          success: false,
          message: "Only platform administrators can create system templates",
        });
      }

      // Define default templates
      const defaultTemplates = [
        // Math templates
        {
          title: "Complete daily math practice",
          description: "Practice math problems for 20 minutes",
          category: "academic",
          subCategory: "Math",
          suggestedPointValue: 15,
          requiresApproval: true,
          defaultApproverType: "teacher",
          isRecurring: true,
          defaultRecurringSchedule: {
            frequency: "daily",
            interval: 1,
          },
          estimatedDuration: 20,
          difficulty: "medium",
          recommendedGradeMin: 3,
          recommendedGradeMax: 8,
          visibility: "public",
        },
        {
          title: "Khan Academy math lesson",
          description: "Complete a Khan Academy math lesson",
          category: "academic",
          subCategory: "Math",
          suggestedPointValue: 20,
          requiresApproval: true,
          defaultApproverType: "teacher",
          externalResource: {
            platform: "Khan Academy",
            url: "https://www.khanacademy.org/math",
          },
          estimatedDuration: 30,
          difficulty: "medium",
          recommendedGradeMin: 3,
          recommendedGradeMax: 12,
          visibility: "public",
        },
        // Reading templates
        {
          title: "Daily reading time",
          description: "Read a book for 30 minutes",
          category: "academic",
          subCategory: "Reading",
          suggestedPointValue: 15,
          requiresApproval: true,
          defaultApproverType: "parent",
          isRecurring: true,
          defaultRecurringSchedule: {
            frequency: "daily",
            interval: 1,
          },
          estimatedDuration: 30,
          difficulty: "easy",
          recommendedGradeMin: 1,
          recommendedGradeMax: 12,
          visibility: "public",
        },
        {
          title: "Complete a book and write summary",
          description:
            "Finish a book and write a one-paragraph summary of what you learned",
          category: "academic",
          subCategory: "Reading",
          suggestedPointValue: 50,
          requiresApproval: true,
          defaultApproverType: "teacher",
          estimatedDuration: 0, // Varies based on book
          difficulty: "medium",
          recommendedGradeMin: 4,
          recommendedGradeMax: 12,
          visibility: "public",
        },
        // Chores templates
        {
          title: "Clean your room",
          description:
            "Tidy up your room, make your bed, and put away belongings",
          category: "home",
          subCategory: "Chores",
          suggestedPointValue: 10,
          requiresApproval: true,
          defaultApproverType: "parent",
          isRecurring: true,
          defaultRecurringSchedule: {
            frequency: "weekly",
            daysOfWeek: [6], // Saturday
            interval: 1,
          },
          estimatedDuration: 15,
          difficulty: "easy",
          recommendedAgeMin: 5,
          recommendedAgeMax: 18,
          visibility: "public",
        },
        {
          title: "Take out the trash",
          description:
            "Collect trash from indoor bins and take to outdoor garbage cans",
          category: "home",
          subCategory: "Chores",
          suggestedPointValue: 5,
          requiresApproval: true,
          defaultApproverType: "parent",
          isRecurring: true,
          defaultRecurringSchedule: {
            frequency: "weekly",
            daysOfWeek: [1, 4], // Monday and Thursday
            interval: 1,
          },
          estimatedDuration: 5,
          difficulty: "easy",
          recommendedAgeMin: 8,
          recommendedAgeMax: 18,
          visibility: "public",
        },
        // Attendance templates
        {
          title: "Daily school check-in",
          description: "Mark your attendance at school for the day",
          category: "attendance",
          subCategory: "Attendance",
          suggestedPointValue: 5,
          requiresApproval: false,
          defaultApproverType: "system",
          isRecurring: true,
          defaultRecurringSchedule: {
            frequency: "daily",
            daysOfWeek: [1, 2, 3, 4, 5], // Weekdays
            interval: 1,
          },
          estimatedDuration: 1,
          difficulty: "easy",
          recommendedGradeMin: 1,
          recommendedGradeMax: 12,
          visibility: "public",
        },
      ];

      // Create templates if they don't exist
      let created = 0;
      let skipped = 0;

      for (const templateData of defaultTemplates) {
        const existingTemplate = await TaskTemplate.findOne({
          title: templateData.title,
          category: templateData.category,
          visibility: "public",
        });

        if (!existingTemplate) {
          // Add creator info and create template
          const template = new TaskTemplate({
            ...templateData,
            createdBy: userId,
            creatorRole: userRole,
            isFeatured: true, // Make default templates featured
          });

          await template.save();
          created++;
        } else {
          skipped++;
        }
      }

      return res.status(200).json({
        success: true,
        message: `Default templates initialized: ${created} created, ${skipped} already existed`,
      });
    } catch (error) {
      console.error("Create default templates error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create default templates",
        error: error.message,
      });
    }
  },

  /**
   * Get suggested templates based on student profile
   */
  getSuggestedTemplates: async (req, res) => {
    try {
      const { studentId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Validate authorization
      let isAuthorized =
        studentId === userId ||
        userRole === "platform_admin" ||
        userRole === "school_admin";

      // Parents should be able to get suggestions for their children
      if (userRole === "parent") {
        // In a real app, check if studentId is parent's child
        isAuthorized = true; // Simplified for now
      }

      // Teachers for student's class/school
      if (userRole === "teacher") {
        // In a real app, check if teacher is associated with student
        isAuthorized = true; // Simplified for now
      }

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to get suggested templates for this student",
        });
      }

      // Get student profile info - normally would fetch from user service
      // For now we'll use mock data or query parameters
      const { grade, age, schoolId } = req.query;

      // Build filter based on student profile
      const filter = { isActive: true };

      // Grade-level filtering
      if (grade) {
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            {
              $and: [
                { recommendedGradeMin: { $lte: Number(grade) } },
                { recommendedGradeMax: { $gte: Number(grade) } },
              ],
            },
            {
              $and: [
                { recommendedGradeMin: { $exists: false } },
                { recommendedGradeMax: { $exists: false } },
              ],
            },
          ],
        });
      }

      // Age filtering
      if (age) {
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            {
              $and: [
                { recommendedAgeMin: { $lte: Number(age) } },
                { recommendedAgeMax: { $gte: Number(age) } },
              ],
            },
            {
              $and: [
                { recommendedAgeMin: { $exists: false } },
                { recommendedAgeMax: { $exists: false } },
              ],
            },
          ],
        });
      }

      // Filter for public templates and school-specific templates
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { visibility: "public" },
          ...(schoolId ? [{ schoolId: schoolId }] : []),
        ],
      });

      // Get featured templates first
      const featuredTemplates = await TaskTemplate.find({
        ...filter,
        isFeatured: true,
      })
        .sort({ usageCount: -1 })
        .limit(5);

      // Get category-specific suggestions
      // For each major category, get top templates
      const categories = [
        "academic",
        "home",
        "behavior",
        "extracurricular",
        "attendance",
      ];

      let categoryTemplates = [];

      for (const category of categories) {
        const templates = await TaskTemplate.find({
          ...filter,
          category,
        })
          .sort({ usageCount: -1 })
          .limit(3);

        categoryTemplates = [...categoryTemplates, ...templates];
      }

      // Remove duplicates (templates that appear in both featured and category lists)
      const featuredIds = featuredTemplates.map((t) => t._id.toString());
      const uniqueCategoryTemplates = categoryTemplates.filter(
        (t) => !featuredIds.includes(t._id.toString())
      );

      return res.status(200).json({
        success: true,
        data: {
          featured: featuredTemplates,
          byCategory: uniqueCategoryTemplates,
          studentProfile: {
            id: studentId,
            grade: grade ? Number(grade) : undefined,
            age: age ? Number(age) : undefined,
            schoolId,
          },
        },
      });
    } catch (error) {
      console.error("Get suggested templates error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get suggested templates",
        error: error.message,
      });
    }
  },
};

module.exports = taskTemplateController;
