// src/controllers/rewardCategory.controller.js
const RewardCategory = require("../models/rewardCategory.model");
const mongoose = require("mongoose");

/**
 * Reward Category Controller
 * Handles operations related to reward categories
 */
const rewardCategoryController = {
  /**
   * Create a new reward category
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
        subcategoryType,
        schoolId,
        minPointValue,
        maxPointValue,
        visibility,
        displayOrder,
      } = req.body;

      // Extract user info from authentication middleware
      const createdBy = req.user.id;
      const userRoles = req.user.roles;

      // Determine creator role
      let creatorRole;
      if (userRoles.includes("parent")) {
        creatorRole = "parent";
      } else if (userRoles.includes("teacher")) {
        creatorRole = "teacher";
      } else if (userRoles.includes("school_admin")) {
        creatorRole = "school_admin";
      } else if (userRoles.includes("social_worker")) {
        creatorRole = "social_worker";
      } else if (userRoles.includes("platform_admin")) {
        creatorRole = "platform_admin";
      } else {
        return res.status(403).json({
          success: false,
          message: "Not authorized to create reward categories",
        });
      }

      // Validate required fields
      if (!name || !type) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: name and type are required",
        });
      }

      // Check if category with same name already exists for this creator
      const existingCategory = await RewardCategory.findOne({
        name,
        createdBy,
        isDeleted: false,
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "A category with this name already exists",
        });
      }

      // If parentCategory is provided, validate it exists and is valid
      if (parentCategory) {
        if (!mongoose.Types.ObjectId.isValid(parentCategory)) {
          return res.status(400).json({
            success: false,
            message: "Invalid parent category ID format",
          });
        }

        const parentCat = await RewardCategory.findById(parentCategory);
        if (!parentCat || parentCat.isDeleted) {
          return res.status(404).json({
            success: false,
            message: "Parent category not found",
          });
        }
      }

      // Create new category
      const category = new RewardCategory({
        name,
        description,
        icon,
        color,
        parentCategory,
        createdBy,
        creatorRole,
        type,
        subcategoryType,
        schoolId,
        minPointValue,
        maxPointValue,
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
   * Get a reward category by ID
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

      const category = await RewardCategory.findById(id).populate(
        "parentCategory",
        "name type"
      );

      if (!category || category.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      // Check visibility/authorization
      const userId = req.user.id;
      const userRoles = req.user.roles;

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
   * Update a reward category
   */
  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.id;
      const userRoles = req.user.roles;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID format",
        });
      }

      const category = await RewardCategory.findById(id);

      if (!category || category.isDeleted) {
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

      // Validate parentCategory if provided
      if (updateData.parentCategory) {
        if (!mongoose.Types.ObjectId.isValid(updateData.parentCategory)) {
          return res.status(400).json({
            success: false,
            message: "Invalid parent category ID format",
          });
        }

        const parentCat = await RewardCategory.findById(
          updateData.parentCategory
        );
        if (!parentCat || parentCat.isDeleted) {
          return res.status(404).json({
            success: false,
            message: "Parent category not found",
          });
        }

        // Prevent circular references
        if (updateData.parentCategory === id) {
          return res.status(400).json({
            success: false,
            message: "Category cannot be its own parent",
          });
        }
      }

      // Update the category
      const updatedCategory = await RewardCategory.findByIdAndUpdate(
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
   * Delete a reward category (soft delete)
   */
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRoles = req.user.roles;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID format",
        });
      }

      const category = await RewardCategory.findById(id);

      if (!category || category.isDeleted) {
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

      // Soft delete
      await category.softDelete();

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
        subcategoryType,
        createdBy,
        visibility,
        schoolId,
        isSystem,
        search,
        page = 1,
        limit = 50,
      } = req.query;

      const userId = req.user.id;
      const userRoles = req.user.roles;

      // Build filter
      const filter = { isDeleted: false };

      // Add filters based on query params
      if (type) filter.type = type;
      if (subcategoryType) filter.subcategoryType = subcategoryType;
      if (createdBy) filter.createdBy = createdBy;
      if (visibility) filter.visibility = visibility;
      if (schoolId) filter.schoolId = schoolId;
      if (isSystem !== undefined) filter.isSystem = isSystem === "true";

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

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get the categories with pagination
      const categories = await RewardCategory.find(filter)
        .populate("parentCategory", "name type")
        .sort({
          displayOrder: 1,
          name: 1,
        })
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count for pagination
      const total = await RewardCategory.countDocuments(filter);

      return res.status(200).json({
        success: true,
        data: {
          categories,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
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
      const userRoles = req.user.roles;

      // Only platform admin can create system categories
      if (!userRoles.includes("platform_admin")) {
        return res.status(403).json({
          success: false,
          message: "Only platform administrators can create system categories",
        });
      }

      // Define default categories
      const defaultCategories = [
        // Family categories with subcategories
        {
          name: "Family Rewards",
          description: "Rewards given by parents and guardians",
          icon: "home",
          color: "#4285F4",
          type: "family",
          isSystem: true,
          visibility: "public",
          displayOrder: 10,
        },
        {
          name: "Family Privileges",
          description: "Privileges earned at home",
          icon: "star",
          color: "#4285F4",
          type: "family",
          subcategoryType: "privilege",
          isSystem: true,
          visibility: "public",
          displayOrder: 11,
          minPointValue: 10,
          maxPointValue: 100,
        },
        {
          name: "Family Items",
          description: "Physical items from family",
          icon: "gift",
          color: "#34A853",
          type: "family",
          subcategoryType: "item",
          isSystem: true,
          visibility: "public",
          displayOrder: 12,
          minPointValue: 50,
          maxPointValue: 500,
        },
        {
          name: "Family Experiences",
          description: "Special experiences with family",
          icon: "heart",
          color: "#EA4335",
          type: "family",
          subcategoryType: "experience",
          isSystem: true,
          visibility: "public",
          displayOrder: 13,
          minPointValue: 100,
          maxPointValue: 1000,
        },
        // School categories
        {
          name: "School Rewards",
          description: "Rewards available from school",
          icon: "school",
          color: "#FBBC05",
          type: "school",
          isSystem: true,
          visibility: "public",
          displayOrder: 20,
        },
        {
          name: "School Privileges",
          description: "Special privileges at school",
          icon: "medal",
          color: "#FBBC05",
          type: "school",
          subcategoryType: "privilege",
          isSystem: true,
          visibility: "public",
          displayOrder: 21,
          minPointValue: 10,
          maxPointValue: 100,
        },
        {
          name: "School Store Items",
          description: "Items from the school store",
          icon: "shopping-cart",
          color: "#34A853",
          type: "school",
          subcategoryType: "item",
          isSystem: true,
          visibility: "public",
          displayOrder: 22,
          minPointValue: 20,
          maxPointValue: 200,
        },
        // Sponsor categories
        {
          name: "Sponsor Rewards",
          description: "Rewards from external sponsors",
          icon: "gift",
          color: "#9B59B6",
          type: "sponsor",
          isSystem: true,
          visibility: "public",
          displayOrder: 30,
        },
        {
          name: "Digital Rewards",
          description: "Digital items and content",
          icon: "monitor",
          color: "#3498DB",
          type: "sponsor",
          subcategoryType: "digital",
          isSystem: true,
          visibility: "public",
          displayOrder: 31,
          minPointValue: 50,
          maxPointValue: 500,
        },
      ];

      // Create categories if they don't exist
      let created = 0;
      let skipped = 0;

      for (const categoryData of defaultCategories) {
        const existingCategory = await RewardCategory.findOne({
          name: categoryData.name,
          isSystem: true,
          isDeleted: false,
        });

        if (!existingCategory) {
          // Add creator info and create category
          const category = new RewardCategory({
            ...categoryData,
            createdBy: userId,
            creatorRole: "system",
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
   * Get hierarchical category structure
   */
  getCategoryHierarchy: async (req, res) => {
    try {
      const { type } = req.query;
      const userId = req.user.id;
      const userRoles = req.user.roles;

      // Build base filter
      let filter = { isDeleted: false };

      // Filter by type if provided
      if (type) {
        filter.type = type;
      }

      // Apply access control
      if (!userRoles.includes("platform_admin")) {
        filter.$or = [{ visibility: "public" }, { createdBy: userId }];

        // Add school-specific visibility
        if (req.user.schoolId) {
          filter.$or.push({
            visibility: "school",
            schoolId: req.user.schoolId,
          });
        }
      }

      // Fetch all categories
      const categories = await RewardCategory.find(filter).sort({
        displayOrder: 1,
        name: 1,
      });

      // Build hierarchy
      const hierarchy = {};
      const parentCategories = [];

      // First, identify all parent categories
      categories.forEach((category) => {
        if (!category.parentCategory) {
          parentCategories.push(category);
          hierarchy[category._id] = {
            category: category,
            subcategories: [],
          };
        }
      });

      // Then, add subcategories to their parents
      categories.forEach((category) => {
        if (category.parentCategory) {
          if (hierarchy[category.parentCategory]) {
            hierarchy[category.parentCategory].subcategories.push(category);
          }
        }
      });

      // Convert to array format
      const result = parentCategories.map((parent) => ({
        category: parent,
        subcategories: hierarchy[parent._id].subcategories,
      }));

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get category hierarchy error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get category hierarchy",
        error: error.message,
      });
    }
  },
};

module.exports = rewardCategoryController;
