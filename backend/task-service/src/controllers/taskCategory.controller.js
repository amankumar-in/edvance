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
        role
      } = req.body;

      // Extract user info from authentication middleware
      const createdBy = req.user.id;
      const creatorRole = role;

      // Validate required fields
      if (!name || !type) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: name and type are required",
        });
      }

      // Validate parentCategory if provided and not empty
      if (parentCategory && parentCategory.trim() !== '') {
        if (!mongoose.Types.ObjectId.isValid(parentCategory)) {
          return res.status(400).json({
            success: false,
            message: "Invalid parent category ID format",
          });
        }

        // Check if parent category exists
        const parentExists = await TaskCategory.findById(parentCategory);
        if (!parentExists || !parentExists.isActive) {
          return res.status(400).json({
            success: false,
            message: "Parent category not found",
          });
        }
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
      const categoryData = {
        name,
        description,
        icon,
        color,
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
      };

      // Only include parentCategory if it's provided and not empty
      if (parentCategory && parentCategory.trim() !== '') {
        categoryData.parentCategory = parentCategory;
      }

      const category = new TaskCategory(categoryData);

      await category.save();

      // Populate the parent category before returning
      await category.populate('parentCategory', 'name icon color type');

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
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID format",
        });
      }

      const category = await TaskCategory.findById(id)
        .populate('parentCategory', 'name icon color type');

      if (!category || !category.isActive) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      // Check visibility/authorization
      const userId = req.user.id;
      const userRole = req.user.role;

      let isAuthorized =
        category.createdBy === userId ||
        category.visibility === "public" ||
        userRole === "platform_admin";

      // School admin can see school categories
      if (
        userRole === "school_admin" &&
        category.schoolId &&
        req.user.schoolId === category.schoolId
      ) {
        isAuthorized = true;
      }

      // Teachers can see school categories for their school
      if (
        userRole === "teacher" &&
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
      const userRole = req.user.role;

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
        category.createdBy === userId || userRole === "platform_admin";

      // School admin can update school categories
      if (
        userRole === "school_admin" &&
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

      // Handle parentCategory in update data
      if ('parentCategory' in updateData) {
        if (updateData.parentCategory && updateData.parentCategory.trim() !== '') {
          // Validate parentCategory format
          if (!mongoose.Types.ObjectId.isValid(updateData.parentCategory)) {
            return res.status(400).json({
              success: false,
              message: "Invalid parent category ID format",
            });
          }

          // Check if parent category exists
          const parentExists = await TaskCategory.findById(updateData.parentCategory);
          if (!parentExists || !parentExists.isActive) {
            return res.status(400).json({
              success: false,
              message: "Parent category not found",
            });
          }

          // Prevent circular references (category cannot be its own parent)
          if (updateData.parentCategory === id) {
            return res.status(400).json({
              success: false,
              message: "Category cannot be its own parent",
            });
          }
        } else {
          // If empty string or null, remove the parent category
          updateData.parentCategory = null;
        }
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
      ).populate('parentCategory', 'name icon color type');

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
      const userRole = req.query.role;

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
        category.createdBy === userId || userRole === "platform_admin";

      // School admin can delete school categories
      if (
        userRole === "school_admin" &&
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
        role
      } = req.query;

      const userId = req.user.id;
      const userRole = role;
      
      if (!userRole) {
        return res.status(400).json({
          success: false,
          message: "User role is required",
        });
      }

      // Build filter
      const filter = { isActive: true };

      // Add filters based on query params
      if (type) filter.type = type;
      if (createdBy) filter.createdBy = createdBy;
      if (visibility) filter.visibility = visibility;
      if (schoolId) filter.schoolId = schoolId;
      if (isSystem !== undefined) filter.isSystem = isSystem === "true";
      if (subject) filter.subject = subject;
      if (gradeLevel) filter.gradeLevel = gradeLevel;

      // Search by name
      if (search) {
        filter.name = { $regex: search, $options: "i" };
      }

      // Access control based on user role and visibility
      if (userRole === "student" || userRole === "parent") {
        // Students and parents can see public, their own, and school categories
        filter.$or = [
          { visibility: "public" },
          { createdBy: userId },
          { visibility: "school", schoolId: req.user.schoolId }, // if user has a schoolId
        ];
      } else if (userRole === "teacher") {
        // Teachers can see public, their own, and their school's categories
        filter.$or = [
          { visibility: "public" },
          { createdBy: userId },
          { visibility: "school", schoolId: req.user.schoolId },
        ];
      } else if (userRole === "school_admin") {
        // School admins can see public, their own, and their school's categories
        filter.$or = [
          { visibility: "public" },
          { createdBy: userId },
          { schoolId: req.user.schoolId },
        ];
      }
      // Platform admins can see all categories

      // Get the categories with populated parent category
      const categories = await TaskCategory.find(filter)
        .populate('parentCategory', 'name icon color type')
        .sort({
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
      const userRole = req.body.role;

      // Only platform admin can create system categories
      if (userRole !== "platform_admin") {
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
          icon: "calculator",
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
          icon: "book",
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
          icon: "microscope",
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
          icon: "pen",
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
          icon: "home",
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
          icon: "droplet",
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
          icon: "thumbs-up",
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
          icon: "calendar",
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
          icon: "activity",
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
          icon: "music",
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
            creatorRole: userRole,
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
      const userRole = req.user.role;

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
      if (userRole === "student" || userRole === "parent") {
        filter.$or = [
          { visibility: "public" },
          { createdBy: userId },
          // Include school-specific categories if user has schoolId
          ...(req.user.schoolId
            ? [{ visibility: "school", schoolId: req.user.schoolId }]
            : []),
        ];
      } else if (userRole === "teacher") {
        filter.$or = [
          { visibility: "public" },
          { createdBy: userId },
          { schoolId: req.user.schoolId },
        ];
      } else if (userRole === "school_admin") {
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
};

module.exports = taskCategoryController;
