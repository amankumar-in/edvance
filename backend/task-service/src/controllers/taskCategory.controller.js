const TaskCategory = require("../models/taskCategory.model");
const mongoose = require("mongoose");

/**
 * Task Category Controller
 * Handles operations related to task categories
 */
const taskCategoryController = {
  /**
   * Create a new task category
   */
  createCategory: async (req, res) => {
    try {
      const {
        name,
        description,
        icon,
        color,
        parentCategory,
        type,
        defaultPointValue,
        schoolId,
        subject,
        gradeLevel,
        visibility,
        displayOrder,
      } = req.body;

      // Extract user info from authentication middleware
      const createdBy = req.user.id;
      const creatorRole = req.user.roles && req.user.roles.length > 0 ? req.user.roles[0] : 'unknown';

      // Validate required fields
      if (!name || !type) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: name and type are required",
        });
      }

      // Check if category with same name already exists for this creator
      const existingCategory = await TaskCategory.findOne({
        name,
        createdBy,
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "A category with this name already exists",
        });
      }

      // Create new category
      const category = new TaskCategory({
        name,
        description,
        icon,
        color,
        parentCategory,
        createdBy,
        creatorRole,
        type,
        defaultPointValue: defaultPointValue || 10,
        schoolId,
        subject,
        gradeLevel,
        isSystem: false,
        visibility: visibility || "private",
        displayOrder: displayOrder || 0,
        isActive: true,
      });

      await category.save();

      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error) {
      console.error("Create category error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create category",
        error: error.message,
      });
    }
  },

  /**
   * Get a task category by ID
   */
  getCategoryById: async (req, res) => {
    console.log("🔴 getCategoryById method called - this is WRONG for /tasks/categories", req.params);
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID format",
        });
      }

      const category = await TaskCategory.findById(id);

      if (!category || !category.isActive) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      // Check visibility/authorization
      const userId = req.user.id;
      const userRoles = req.user.roles || [];

      let isAuthorized =
        category.createdBy === userId ||
        category.visibility === "public" ||
        userRoles.includes("platform_admin");

      // School admin can see school categories
      if (
        userRoles.includes("school_admin") &&
        category.schoolId &&
        req.user.schoolId === category.schoolId
      ) {
        isAuthorized = true;
      }

      // Teachers can see school categories for their school
      if (
        userRoles.includes("teacher") &&
        category.schoolId &&
        req.user.schoolId === category.schoolId
      ) {
        isAuthorized = true;
      }

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this category",
        });
      }

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      console.error("Get category error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get category",
        error: error.message,
      });
    }
  },

  /**
   * Update a task category
   */
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.id;
      const userRoles = req.user.roles || [];

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID format",
        });
      }

      const category = await TaskCategory.findById(id);

      if (!category || !category.isActive) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      // Check authorization
      let isAuthorized =
        category.createdBy === userId || userRoles.includes("platform_admin");

      // School admin can update school categories
      if (
        userRoles.includes("school_admin") &&
        category.schoolId &&
        req.user.schoolId === category.schoolId
      ) {
        isAuthorized = true;
      }

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this category",
        });
      }

      // Cannot update system categories
      if (category.isSystem) {
        return res.status(403).json({
          success: false,
          message: "System categories cannot be modified",
        });
      }

      // Don't allow changing certain fields
      const protectedFields = [
        "createdBy",
        "creatorRole",
        "isSystem",
        "createdAt",
        "updatedAt",
      ];
      protectedFields.forEach((field) => {
        if (updateData[field]) delete updateData[field];
      });

      // Update the category
      const updatedCategory = await TaskCategory.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: updatedCategory,
      });
    } catch (error) {
      console.error("Update category error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update category",
        error: error.message,
      });
    }
  },

  /**
   * Delete a task category (soft delete)
   */
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRoles = req.user.roles || [];

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID format",
        });
      }

      const category = await TaskCategory.findById(id);

      if (!category || !category.isActive) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      // Check authorization
      let isAuthorized =
        category.createdBy === userId || userRoles.includes("platform_admin");

      // School admin can delete school categories
      if (
        userRoles.includes("school_admin") &&
        category.schoolId &&
        req.user.schoolId === category.schoolId
      ) {
        isAuthorized = true;
      }

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this category",
        });
      }

      // Cannot delete system categories
      if (category.isSystem) {
        return res.status(403).json({
          success: false,
          message: "System categories cannot be deleted",
        });
      }

      // Soft delete by setting isActive to false
      await TaskCategory.findByIdAndUpdate(id, { isActive: false });

      return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      console.error("Delete category error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete category",
        error: error.message,
      });
    }
  },

  /**
   * Get all categories with filters
   */
  getCategories: async (req, res) => {
    console.log("🟢 getCategories method called - this is the correct method");
    try {
      const {
        type,
        createdBy,
        visibility,
        schoolId,
        isSystem,
        subject,
        gradeLevel,
        search,
      } = req.query;

      const userId = req.user.id;
      const userRoles = req.user.roles || [];

      // Build filter
      const filter = { isActive: true };

      // Add filters based on query params
      if (type) filter.type = type;
      if (createdBy) filter.createdBy = createdBy;
      if (visibility) filter.visibility = visibility;
      if (schoolId) filter.schoolId = schoolId;
      if (isSystem !== undefined) filter.isSystem = isSystem === "true";
      if (subject) filter.subject = subject;
      if (gradeLevel) filter.gradeLevel = Number(gradeLevel);

      // Search by name
      if (search) {
        filter.name = { $regex: search, $options: "i" };
      }

      // Access control based on user role and visibility
      if (userRoles.includes("student") || userRoles.includes("parent")) {
        // Students and parents can see public, their own, and school categories
        filter.$or = [
          { visibility: "public" },
          { createdBy: userId },
          { visibility: "school", schoolId: req.user.schoolId }, // if user has a schoolId
        ];
      } else if (userRoles.includes("teacher")) {
        // Teachers can see public, their own, and their school's categories
        filter.$or = [
          { visibility: "public" },
          { createdBy: userId },
          { visibility: "school", schoolId: req.user.schoolId },
        ];
      } else if (userRoles.includes("school_admin")) {
        // School admins can see public, their own, and their school's categories
        filter.$or = [
          { visibility: "public" },
          { createdBy: userId },
          { schoolId: req.user.schoolId },
        ];
      }
      // Platform admins can see all categories

      // Get the categories
      const categories = await TaskCategory.find(filter).sort({
        displayOrder: 1,
        name: 1,
      });

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error("Get categories error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get categories",
        error: error.message,
      });
    }
  },

  /**
   * Create default system categories
   * This is an admin function to initialize the system with defaults
   */
  createDefaultCategories: async (req, res) => {
    try {
      const userId = req.user.id;
      const userRoles = req.user.roles || [];

      // Only platform admin can create system categories
      if (!userRoles || !userRoles.includes("platform_admin")) {
        return res.status(403).json({
          success: false,
          message: "Only platform administrators can create system categories",
        });
      }

      // Define default categories
      const defaultCategories = [
        // Academic categories
        {
          name: "Math",
          description: "Mathematics tasks and assignments",
          icon: "🧮",
          color: "#4285F4",
          type: "academic",
          defaultPointValue: 20,
          isSystem: true,
          visibility: "public",
          displayOrder: 10,
        },
        {
          name: "Reading",
          description: "Reading and literature tasks",
          icon: "📚",
          color: "#34A853",
          type: "academic",
          defaultPointValue: 15,
          isSystem: true,
          visibility: "public",
          displayOrder: 20,
        },
        {
          name: "Science",
          description: "Science experiments and learning",
          icon: "🔬",
          color: "#FBBC05",
          type: "academic",
          defaultPointValue: 20,
          isSystem: true,
          visibility: "public",
          displayOrder: 30,
        },
        {
          name: "Writing",
          description: "Writing assignments and exercises",
          icon: "✏️",
          color: "#EA4335",
          type: "academic",
          defaultPointValue: 15,
          isSystem: true,
          visibility: "public",
          displayOrder: 40,
        },
        // Home categories
        {
          name: "Chores",
          description: "Household chores and responsibilities",
          icon: "🏠",
          color: "#8E44AD",
          type: "home",
          defaultPointValue: 10,
          isSystem: true,
          visibility: "public",
          displayOrder: 100,
        },
        {
          name: "Hygiene",
          description: "Personal care and hygiene tasks",
          icon: "🚿",
          color: "#3498DB",
          type: "home",
          defaultPointValue: 5,
          isSystem: true,
          visibility: "public",
          displayOrder: 110,
        },
        // Behavior categories
        {
          name: "Positive Behavior",
          description: "Recognition for positive behaviors",
          icon: "👍",
          color: "#2ECC71",
          type: "behavior",
          defaultPointValue: 5,
          isSystem: true,
          visibility: "public",
          displayOrder: 200,
        },
        // Attendance category
        {
          name: "Attendance",
          description: "School attendance and check-ins",
          icon: "📅",
          color: "#F39C12",
          type: "attendance",
          defaultPointValue: 5,
          isSystem: true,
          visibility: "public",
          displayOrder: 300,
        },
        // Extracurricular
        {
          name: "Sports",
          description: "Sports and physical activities",
          icon: "🏃‍♂️",
          color: "#E74C3C",
          type: "extracurricular",
          defaultPointValue: 15,
          isSystem: true,
          visibility: "public",
          displayOrder: 400,
        },
        {
          name: "Arts",
          description: "Art, music, and creative activities",
          icon: "🎵",
          color: "#9B59B6",
          type: "extracurricular",
          defaultPointValue: 15,
          isSystem: true,
          visibility: "public",
          displayOrder: 410,
        },
      ];

      // Create categories if they don't exist
      let created = 0;
      let skipped = 0;

      for (const categoryData of defaultCategories) {
        const existingCategory = await TaskCategory.findOne({
          name: categoryData.name,
          isSystem: true,
        });

        if (!existingCategory) {
          // Add creator info and create category
          const category = new TaskCategory({
            ...categoryData,
            createdBy: userId,
            creatorRole: "platform_admin",
          });

          await category.save();
          created++;
        } else {
          skipped++;
        }
      }

      return res.status(200).json({
        success: true,
        message: `Default categories initialized: ${created} created, ${skipped} already existed`,
      });
    } catch (error) {
      console.error("Create default categories error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create default categories",
        error: error.message,
      });
    }
  },

  /**
   * Get categories for a specific user context
   */
  getUserContextCategories: async (req, res) => {
    try {
      const { context } = req.params;
      const userId = req.user.id;
      const userRoles = req.user.roles || [];

      if (
        ![
          "academic",
          "home",
          "behavior",
          "extracurricular",
          "attendance",
          "all",
        ].includes(context)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid context. Must be 'academic', 'home', 'behavior', 'extracurricular', 'attendance', or 'all'",
        });
      }

      // Build filter
      const filter = { isActive: true };

      // Filter by context type unless 'all' is specified
      if (context !== "all") {
        filter.type = context;
      }

      // Access control filtering
      if (userRoles.includes("student") || userRoles.includes("parent")) {
        filter.$or = [
          { visibility: "public" },
          { createdBy: userId },
          // Include school-specific categories if user has schoolId
          ...(req.user.schoolId
            ? [{ visibility: "school", schoolId: req.user.schoolId }]
            : []),
        ];
      } else if (userRoles.includes("teacher")) {
        filter.$or = [
          { visibility: "public" },
          { createdBy: userId },
          { schoolId: req.user.schoolId },
        ];
      } else if (userRoles.includes("school_admin")) {
        filter.$or = [
          { visibility: "public" },
          { createdBy: userId },
          { schoolId: req.user.schoolId },
        ];
      }
      // Platform admins see all categories

      // Get categories
      const categories = await TaskCategory.find(filter).sort({
        displayOrder: 1,
        name: 1,
      });

      // Group by parent category if applicable
      let groupedCategories = {};

      categories.forEach((category) => {
        const normalizedCategory = category.toObject();

        if (category.parentCategory) {
          // This is a subcategory
          if (!groupedCategories[category.parentCategory]) {
            groupedCategories[category.parentCategory] = {
              parent: null,
              subcategories: [],
            };
          }

          groupedCategories[category.parentCategory].subcategories.push(
            normalizedCategory
          );
        } else {
          // This is a parent category
          if (!groupedCategories[category._id.toString()]) {
            groupedCategories[category._id.toString()] = {
              parent: normalizedCategory,
              subcategories: [],
            };
          } else {
            groupedCategories[category._id.toString()].parent =
              normalizedCategory;
          }
        }
      });

      // Convert to array format for response
      const result = Object.values(groupedCategories);

      return res.status(200).json({
        success: true,
        data: {
          categories: result,
          context,
        },
      });
    } catch (error) {
      console.error("Get user context categories error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get categories",
        error: error.message,
      });
    }
  },

  /**
   * Migrate existing categories from string icons to emoji icons
   * This is a one-time migration function for admin use
   */
  migrateIconsToEmojis: async (req, res) => {
    try {
      const userId = req.user.id;
      const userRoles = req.user.roles || [];

      // Only platform admin can run migrations
      if (!userRoles || !userRoles.includes("platform_admin")) {
        return res.status(403).json({
          success: false,
          message: "Only platform administrators can run migrations",
        });
      }

      // Mapping of old string icons to new emoji icons
      const iconMapping = {
        'calculator': '🧮',
        'book': '📚', 
        'microscope': '🔬',
        'pen': '✏️',
        'home': '🏠',
        'droplet': '🚿',
        'thumbs-up': '👍',
        'calendar': '📅',
        'activity': '🏃‍♂️',
        'music': '🎵',
        'edit': '📝',
        'star': '⭐',
        'target': '🎯',
        'palette': '🎨',
        'award': '🏆',
        'chart': '📊',
        'lightbulb': '💡',
        'circus-tent': '🎪',
        'sparkle': '🌟',
        'theater': '🎭',
        'medal': '🏅',
        'clipboard': '📋'
      };

      // Find all categories with string icons
      const categoriesToMigrate = await TaskCategory.find({
        icon: { $in: Object.keys(iconMapping) }
      });

      let migrated = 0;

      for (const category of categoriesToMigrate) {
        const newIcon = iconMapping[category.icon];
        if (newIcon) {
          await TaskCategory.findByIdAndUpdate(category._id, {
            icon: newIcon
          });
          migrated++;
        }
      }

      return res.status(200).json({
        success: true,
        message: `Migration completed: ${migrated} categories updated with emoji icons`,
        data: {
          migrated,
          total: categoriesToMigrate.length
        }
      });
    } catch (error) {
      console.error("Icon migration error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to migrate icons",
        error: error.message,
      });
    }
  },
};

module.exports = taskCategoryController;
