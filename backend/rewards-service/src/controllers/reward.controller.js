// src/controllers/reward.controller.js
const Reward = require("../models/reward.model");
const RewardCategory = require("../models/rewardCategory.model");
const RewardWishlist = require("../models/rewardWishlist.model");
const mongoose = require("mongoose");
const axios = require("axios");
const { getFileUrl } = require("../middleware/upload.middleware");
const { isValidObjectId } = require("mongoose");

// Helper function to get user details
async function getUserDetails(userId, authHeader) {
  const userServiceUrl =
    process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_USER_SERVICE_URL
      : process.env.USER_SERVICE_URL;

  const response = await axios.get(
    `${userServiceUrl}/api/users/${userId}/details`,
    { headers: { Authorization: authHeader } }
  );

  return response.data.data;
}

// Helper function to get parent's children data
async function getUserChildren(parentId, authHeader) {
  const userServiceUrl =
    process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_USER_SERVICE_URL
      : process.env.USER_SERVICE_URL || "http://localhost:3002";

  try {
    const childrenResponse = await axios.get(
      `${userServiceUrl}/api/parents/me/children`,
      { headers: { Authorization: authHeader } }
    );

    return childrenResponse.data.data;
  } catch (error) {
    console.error("Error getting children details:", error.response?.data || error.message);
    throw new Error("Failed to verify parent permissions");
  }
}

// Helper function to get parent and children data
async function getParentAndChildrenData(parentId, authHeader) {
  const userServiceUrl =
    process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_USER_SERVICE_URL
      : process.env.USER_SERVICE_URL || "http://localhost:3002";

  try {
    const [parentResponse, childrenResponse] = await Promise.all([
      axios.get(`${userServiceUrl}/api/parents/me`, { headers: { Authorization: authHeader } }),
      axios.get(`${userServiceUrl}/api/parents/me/children`, { headers: { Authorization: authHeader } })
    ]);

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

    return {
      parentData: parentResponse.data.data,
      childrenData: childrenWithClasses
    };
  } catch (error) {
    console.error("Error getting parent/children details:", error.response?.data || error.message);
    throw new Error("Failed to get parent information");
  }
}


// Helper function to verify parent-child relationships and return valid parent IDs
async function getVerifiedParentRewards(studentId, parentIds, authHeader) {
  const userServiceUrl =
    process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_USER_SERVICE_URL
      : process.env.USER_SERVICE_URL || "http://localhost:3002";

  const verifiedParentIds = [];

  try {
    // For each parent ID, verify that this student is actually their child
    for (const parentId of parentIds) {
      try {
        // Get the parent's children list
        const childrenResponse = await axios.get(
          `${userServiceUrl}/api/parents/${parentId}/children`,
          { headers: { Authorization: authHeader } }
        );

        const parentChildren = childrenResponse.data.data;

        // Check if this student is in the parent's children list
        const isActualChild = parentChildren.some(child => child._id === studentId);

        if (isActualChild) {
          verifiedParentIds.push(parentId);
        }
      } catch (error) {
        console.warn(`Failed to verify parent-child relationship for parent ${parentId}:`, error.message);
        // Continue with other parents even if one fails
        continue;
      }
    }

    return verifiedParentIds;
  } catch (error) {
    console.error("Error verifying parent-child relationships:", error);
    return []; // Return empty array if verification fails
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

// Helper function to handle category resolution
async function resolveCategory(req) {
  let categoryId = req.body.categoryId;
  let categoryType = req.body.category; // DEPRECATED
  let subcategoryType = req.body.subcategory; // DEPRECATED

  // NEW: Prioritize categoryId (recommended approach)
  if (categoryId) {
    const category = await RewardCategory.findById(categoryId);
    if (!category || category.isDeleted) {
      throw new Error("Invalid category ID");
    }
    // Use the actual category data from the database
    categoryType = category.type;
    subcategoryType = category.subcategoryType;
    return {
      categoryId: category._id,
      categoryType: category.type,
      subcategoryType: category.subcategoryType,
      categoryName: category.name
    };
  }

  // DEPRECATED: Fallback for backward compatibility
  // If no categoryId but category/subcategory provided, attempt to find matching category
  else if (categoryType && subcategoryType) {
    console.warn("Using deprecated category/subcategory fields. Please use categoryId instead.");

    // Look for a system category that matches
    const category = await RewardCategory.findOne({
      type: categoryType,
      subcategoryType: subcategoryType,
      isSystem: true,
      isDeleted: false,
    });

    if (category) {
      categoryId = category._id;
      return {
        categoryId: category._id,
        categoryType: category.type,
        subcategoryType: category.subcategoryType,
        categoryName: category.name
      };
    }
  }

  // If neither categoryId nor valid category/subcategory provided
  throw new Error("Category information is required. Please provide categoryId.");
}

const rewardController = {
  // Create a new reward
  createReward: async (req, res) => {
    try {
      const {
        title,
        description,
        pointsCost,
        limitedQuantity,
        quantity,
        expiryDate,
        redemptionInstructions,
        restrictions,
        schoolId,
        classId,
        metadata,
        isFeatured,
        role: creatorType,
        isVisibleToChildren
      } = req.body;

      // Handle image upload
      let imageUrl = null;
      if (req.file) {
        imageUrl = getFileUrl(req.file.filename);
      }

      // Extract user info from authentication middleware
      const { profiles, id: userId, roles: userRoles } = req.user;

      // Determine creator type and ID based on user role (following task service pattern)
      const creatorId = creatorType === 'platform_admin' || creatorType === 'sub_admin' || creatorType === 'school_admin' ? userId : profiles[creatorType]?._id;

      // Validate required fields
      if (!title || !description || pointsCost === undefined) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: title, description, and pointsCost are required",
        });
      }

      // Handle category resolution (NEW: prioritizes categoryId)
      let categoryData;
      try {
        categoryData = await resolveCategory(req);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      // Teachers must provide classId
      if (creatorType === "teacher" && !classId) {
        return res.status(400).json({
          success: false,
          message: "Teachers must specify a class ID for the reward",
        });
      }

      // TODO:
      // 1. If schoolId is provided, validate that the school exists.
      // 2. If classId is provided, validate that the class exists.
      // 3. If both are provided, ensure that the class belongs to the given school.
      // 4. Prevent creation if any of these checks fail.

      // Create new reward
      const reward = new Reward({
        title,
        description,
        // DEPRECATED: For backward compatibility only
        category: categoryData.categoryType,
        subcategory: categoryData.subcategoryType,
        // NEW: Primary category fields
        categoryId: categoryData.categoryId,
        categoryName: categoryData.categoryName || categoryData.categoryType,
        subcategoryName: categoryData.subcategoryType,
        pointsCost,
        creatorId,
        authUserId: userId,
        creatorType: (creatorType === 'platform_admin' || creatorType === 'sub_admin') ? 'system' : creatorType,
        schoolId: isValidObjectId(schoolId) ? schoolId : null,
        classId: isValidObjectId(classId) ? classId : null,
        limitedQuantity: limitedQuantity || false,
        quantity: limitedQuantity ? quantity : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        image: imageUrl,
        redemptionInstructions,
        restrictions,
        metadata,
        isFeatured: isFeatured || false,
        isVisibleToChildren: isVisibleToChildren !== 'false',
      });

      await reward.save();

      res.status(201).json({
        success: true,
        message: "Reward created successfully",
        data: reward,
      });
    } catch (error) {
      console.error("Create reward error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create reward",
        error: error.message,
      });
    }
  },

  // Get available rewards with filtering
  getRewards: async (req, res) => {
    try {
      const {
        category,
        subcategory,
        categoryId,
        creatorType,
        creatorId,
        schoolId,
        classId,
        minPoints,
        maxPoints,
        search,
        page = 1,
        limit = 20,
        sort = "createdAt",
        order = "desc",
        isFeatured,
        activeRole,
      } = req.query;

      const { profiles, roles, id: userId } = req.user

      const filter = {
        isActive: true,
        isDeleted: false,
        $or: [{ expiryDate: { $gt: new Date() } }, { expiryDate: null }],
      };

      // if activeRole is teacher and the user has the teacher role, filter the rewards by the teacher's class
      if (activeRole === 'teacher' && roles.includes('teacher')) {
        console.log('teacher')
        const teacherProfile = profiles?.['teacher'];
        console.log(teacherProfile)
        const classIds = teacherProfile?.classIds;
        const classIdsObjectId = classIds.map(id => new mongoose.Types.ObjectId(id));
        const teacherId = teacherProfile?._id;

        const baseFilter = [{ creatorId: new mongoose.Types.ObjectId(teacherId) }]

        if (classIdsObjectId.length > 0) {
          baseFilter.push({
            classId: { $in: classIdsObjectId },
          })
        }

        filter.$or = baseFilter;
      }

      // Apply filters (NEW: prioritizes categoryId, maintains backward compatibility)
      if (categoryId) {
        // NEW: Primary filtering by categoryId
        filter.categoryId = categoryId;
      } else if (category) {
        // DEPRECATED: Backward compatibility - search by both old and new fields
        filter.$or = [
          { category: category }, // DEPRECATED field
          { categoryName: category } // NEW field
        ];
      }

      if (subcategory) {
        // DEPRECATED: Backward compatibility - search by both old and new fields
        filter.$or = [
          { subcategory: subcategory }, // DEPRECATED field
          { subcategoryName: subcategory } // NEW field
        ];
      }

      if (creatorType) filter.creatorType = creatorType;
      if (creatorId) filter.creatorId = creatorId;
      if (schoolId) filter.schoolId = schoolId;
      if (classId) filter.classId = classId;

      if (minPoints) filter.pointsCost = { $gte: parseInt(minPoints) };
      if (maxPoints) {
        filter.pointsCost = filter.pointsCost || {};
        filter.pointsCost.$lte = parseInt(maxPoints);
      }

      if (search) {
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        });
      }

      if (isFeatured !== undefined) {
        filter.isFeatured = isFeatured === 'true';
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOrder = order === "desc" ? -1 : 1;

      // Execute query with pagination
      const rewards = await Reward.find(filter)
        .populate("categoryId", "name type subcategoryType") // Populate category info
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count for pagination
      const total = await Reward.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: {
          rewards,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Get rewards error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get rewards",
        error: error.message,
      });
    }
  },

  // Get reward by ID
  getRewardById: async (req, res) => {
    try {
      const { id } = req.params;
      const authHeader = req.headers.authorization;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reward ID format",
        });
      }

      const reward = await Reward.findById(id).populate(
        "categoryId",
        "name type subcategoryType"
      );

      if (!reward || reward.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Reward not found",
        });
      }

      const enhancedReward = { ...reward.toObject() };

      if (reward.classId) {
        const classData = await getClassById(reward.classId, authHeader);
        if (classData) {
          enhancedReward.class = {
            _id: classData._id,
            name: classData.name,
            grade: classData.grade,
            schoolId: classData.schoolId,
          };
        }
      }

      res.status(200).json({
        success: true,
        data: enhancedReward,
      });
    } catch (error) {
      console.error("Get reward error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get reward",
        error: error.message,
      });
    }
  },

  // Update a reward
  updateReward: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const role = req.body.role;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reward ID format",
        });
      }

      const reward = await Reward.findById(id);

      if (!reward || reward.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Reward not found",
        });
      }

      const { profiles } = req.user;
      const userRoles = req.user.roles;

      // Check authorization
      let isAuthorized = false;

      // Check if the user is a school admin and has the school_admin role
      if (role === "school_admin" && userRoles.includes("school_admin")) {
        const schoolId = profiles?.['school']?._id;

        // Authorize if the reward belongs to the same school
        isAuthorized = reward.schoolId.equals(schoolId)
      }
      // Check if the user is a teacher and has the teacher role
      else if (role === 'teacher' && userRoles.includes('teacher')) {
        const teacherProfile = profiles?.['teacher'];
        const classIds = teacherProfile?.classIds;

        // Authorize if the reward is assigned to any of the teacher's classes
        isAuthorized = classIds.some(classId => reward.classId.equals(classId));
      }
      // Check if the user is a parent and has the parent role
      else if (role === 'parent' && userRoles.includes('parent')) {
        const parentProfile = profiles?.['parent'];
        const parentId = parentProfile?._id;

        // Authorize if the parent is the creator of the reward
        isAuthorized = reward.creatorId.equals(parentId);
      }
      // Allow full access to platform or sub admins
      else if (userRoles.includes('platform_admin') || userRoles.includes('sub_admin')) {
        isAuthorized = true;
      }

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this reward",
        });
      }

      // Handle image upload if new file provided
      if (req.file) {
        updateData.image = getFileUrl(req.file.filename);
      }

      // Don't allow changing certain fields after creation
      const protectedFields = [
        "creatorId",
        "creatorType",
        "createdAt",
        "updatedAt",
      ];
      protectedFields.forEach((field) => {
        if (updateData[field]) delete updateData[field];
      });

      // Handle category update if provided (NEW: prioritizes categoryId)
      if (
        updateData.categoryId ||
        updateData.category ||
        updateData.subcategory
      ) {
        try {
          const categoryData = await resolveCategory({ body: updateData });
          // NEW: Primary fields
          updateData.categoryId = categoryData.categoryId;
          updateData.categoryName = categoryData.categoryName || categoryData.categoryType;
          updateData.subcategoryName = categoryData.subcategoryType;
          // DEPRECATED: For backward compatibility
          updateData.category = categoryData.categoryType;
          updateData.subcategory = categoryData.subcategoryType;
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        }
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

      // Validation: Ensure classId isn't set without schoolId
      if (updateData.classId && !updateData.schoolId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign classId without a valid schoolId',
        });
      }

      // Update the reward
      const updatedReward = await Reward.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).populate("categoryId", "name type subcategoryType");

      res.status(200).json({
        success: true,
        message: "Reward updated successfully",
        data: updatedReward,
      });
    } catch (error) {
      console.error("Update reward error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update reward",
        error: error.message,
      });
    }
  },

  // Delete a reward (soft delete)
  deleteReward: async (req, res) => {
    try {
      const { id } = req.params;
      const role = req.body.role;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reward ID format",
        });
      }

      const reward = await Reward.findById(id);

      if (!reward || reward.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Reward not found",
        });
      }

      // Check authorization
      const { profiles } = req.user;
      const userRoles = req.user.roles;

      // Check authorization
      let isAuthorized = false;

      // Check if the user has the school_admin role
      if (role === "school_admin" && userRoles.includes("school_admin")) {
        const schoolId = profiles?.['school']?._id;

        // Authorize if the reward belongs to the same school
        isAuthorized = reward.schoolId.equals(schoolId)
      }
      // Check if the user has the teacher role
      else if (role === 'teacher' && userRoles.includes('teacher')) {
        const teacherProfile = profiles?.['teacher'];
        const classIds = teacherProfile?.classIds;

        // Authorize if the reward is assigned to any of the teacher's classes
        isAuthorized = classIds.some(classId => reward.classId.equals(classId));
      }
      // Check if the user has the parent role
      else if (role === 'parent' && userRoles.includes('parent')) {
        const parentProfile = profiles?.['parent'];
        const parentId = parentProfile?._id;

        // Authorize if the parent is the creator of the reward
        isAuthorized = reward.creatorId.equals(parentId);
      }
      // Allow full access to platform or sub admins
      else if (userRoles.includes('platform_admin') || userRoles.includes('sub_admin')) {
        isAuthorized = true;
      }

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this reward",
        });
      }

      // Perform soft delete
      await reward.softDelete();

      res.status(200).json({
        success: true,
        message: "Reward deleted successfully",
      });
    } catch (error) {
      console.error("Delete reward error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete reward",
        error: error.message,
      });
    }
  },

  // Check if a reward can be redeemed
  checkRedemptionEligibility: async (req, res) => {
    try {
      const { id } = req.params;
      const { studentId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reward ID format",
        });
      }

      const reward = await Reward.findById(id);

      if (!reward || reward.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Reward not found",
        });
      }

      // Check if reward can be redeemed
      const canRedeem = reward.canBeRedeemed();

      if (!canRedeem) {
        return res.status(200).json({
          success: true,
          data: {
            eligible: false,
            reason: !reward.isActive
              ? "Reward is not active"
              : reward.expiryDate && reward.expiryDate < new Date()
                ? "Reward has expired"
                : reward.limitedQuantity && reward.quantity <= 0
                  ? "Reward is out of stock"
                  : "Unknown reason",
          },
        });
      }

      // Check if student has enough points
      try {
        const pointsServiceUrl =
          process.env.NODE_ENV === "production"
            ? process.env.PRODUCTION_POINTS_SERVICE_URL
            : process.env.POINTS_SERVICE_URL || "http://localhost:3004";

        const balanceResponse = await axios.get(
          `${pointsServiceUrl}/api/points/accounts/student/${studentId}/balance`,
          {
            headers: {
              Authorization: req.headers.authorization,
            },
          }
        );

        const currentBalance = balanceResponse.data.data.currentBalance;

        return res.status(200).json({
          success: true,
          data: {
            eligible: currentBalance >= reward.pointsCost,
            pointsRequired: reward.pointsCost,
            currentBalance: currentBalance,
            reason:
              currentBalance >= reward.pointsCost
                ? null
                : "Insufficient points",
          },
        });
      } catch (error) {
        console.error("Error checking student balance:", error);
        return res.status(200).json({
          success: true,
          data: {
            eligible: true, // Assume eligible if we can't check points
            pointsRequired: reward.pointsCost,
            reason: "Unable to verify points balance",
          },
        });
      }
    } catch (error) {
      console.error("Check redemption eligibility error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check redemption eligibility",
        error: error.message,
      });
    }
  },

  // Add reward to wishlist
  addToWishlist: async (req, res) => {
    try {
      const { rewardId } = req.params;
      const { studentId } = req.body;

      // Validate reward ID
      if (!mongoose.Types.ObjectId.isValid(rewardId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reward ID format",
        });
      }

      // Check if reward exists
      const reward = await Reward.findById(rewardId);
      if (!reward || reward.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Reward not found",
        });
      }

      // Check if already in wishlist
      const existingWishlist = await RewardWishlist.findOne({
        studentId,
        rewardId
      });

      if (existingWishlist) {
        return res.status(409).json({
          success: false,
          message: "Reward already in wishlist",
        });
      }

      // Add to wishlist
      const wishlistItem = new RewardWishlist({
        studentId,
        rewardId
      });

      await wishlistItem.save();

      res.status(201).json({
        success: true,
        message: "Reward added to wishlist",
        data: wishlistItem
      });

    } catch (error) {
      console.error("Add to wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add reward to wishlist",
        error: error.message,
      });
    }
  },

  // Remove reward from wishlist
  removeFromWishlist: async (req, res) => {
    try {
      const { rewardId } = req.params;
      const { studentId } = req.body;

      // Validate reward ID
      if (!mongoose.Types.ObjectId.isValid(rewardId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reward ID format",
        });
      }

      // Find and remove from wishlist
      const wishlistItem = await RewardWishlist.findOneAndDelete({
        studentId,
        rewardId
      });

      if (!wishlistItem) {
        return res.status(404).json({
          success: false,
          message: "Reward not found in wishlist",
        });
      }

      res.status(200).json({
        success: true,
        message: "Reward removed from wishlist"
      });

    } catch (error) {
      console.error("Remove from wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove reward from wishlist",
        error: error.message,
      });
    }
  },

  // Get student's wishlist
  getWishlist: async (req, res) => {
    try {
      const { studentId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Get wishlist with populated reward data
      const wishlistItems = await RewardWishlist.find({ studentId })
        .populate({
          path: 'rewardId',
          match: { isDeleted: false, isActive: true }, // Only show active rewards
          populate: {
            path: 'categoryId',
            select: 'name type subcategoryType'
          }
        })
        .sort({ createdAt: -1 }) // Most recently added first
        .skip(skip)
        .limit(parseInt(limit));

      // Filter out items where reward was deleted/deactivated
      const validWishlistItems = wishlistItems.filter(item => item.rewardId);

      // Get total count
      const total = await RewardWishlist.countDocuments({ studentId });

      res.status(200).json({
        success: true,
        data: {
          wishlist: validWishlistItems,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });

    } catch (error) {
      console.error("Get wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get wishlist",
        error: error.message,
      });
    }
  },

  // Get rewards visible to parent (with ability to control visibility)
  getParentRewards: async (req, res) => {
    try {
      const {
        category,
        subcategory,
        categoryId,
        search,
        page = 1,
        limit = 20,
        sort = "createdAt",
        order = "desc",
        isFeatured,
      } = req.query;

      const parentId = req.user?.profiles?.['parent']?._id;
      const authHeader = req.headers.authorization;

      // Get parent details and children from user service
      try {
        const { childrenData } = await getParentAndChildrenData(parentId, authHeader);

        // Get children's school IDs and class IDs
        const childrenSchoolIds = [...new Set(childrenData.map(child => {
          const schoolId = child.schoolId?._id || child.schoolId;
          return schoolId ? new mongoose.Types.ObjectId(schoolId) : null;
        }).filter(Boolean))];

        const childrenClassIds = [...new Set(childrenData.flatMap(child =>
          (child.classIds || []).map(classId => new mongoose.Types.ObjectId(classId))
        ))];

        // Base filter for rewards visible to parent
        const filter = {
          isActive: true,
          isDeleted: false,
          $or: [{ expiryDate: { $gt: new Date() } }, { expiryDate: null }]
        };

        // Parent can see:
        // 1. System rewards
        // 2. Rewards they created
        // 3. Class rewards for their children's classes
        // 4. School rewards for their children's schools (but not class-specific ones)
        const rewardAccessConditions = [
          {
            creatorType: "system",
            $nor: [
              { schoolId: { $exists: true, $ne: null } },
              { classId: { $exists: true, $ne: null } }
            ]
          }
        ];

        // 1. Parent's own rewards
        rewardAccessConditions.push({
          creatorType: "parent",
          creatorId: parentId
        });

        // 2. School rewards (school-level rewards without specific classId)
        if (childrenSchoolIds.length > 0) {
          rewardAccessConditions.push({
            $and: [
              { schoolId: { $in: childrenSchoolIds } },
              { $or: [{ classId: { $exists: false } }, { classId: null }] }
            ]
          });
        }

        // 3. Class rewards for children's classes
        if (childrenClassIds.length > 0) {
          rewardAccessConditions.push({
            classId: { $in: childrenClassIds }
          });
        }

        // Apply access conditions
        if (rewardAccessConditions.length > 0) {
          filter.$or = rewardAccessConditions;
        } else {
          // If no access conditions, only show parent's own rewards
          filter.creatorType = "parent";
          filter.creatorId = parentId;
        }

        // Apply additional filters
        if (categoryId) {
          filter.categoryId = categoryId;
        } else if (category) {
          filter.$and = filter.$and || [];
          filter.$and.push({
            $or: [
              { category: category },
              { categoryName: category }
            ]
          });
        }

        if (subcategory) {
          filter.$and = filter.$and || [];
          filter.$and.push({
            $or: [
              { subcategory: subcategory },
              { subcategoryName: subcategory }
            ]
          });
        }

        if (search) {
          filter.$and = filter.$and || [];
          filter.$and.push({
            $or: [
              { title: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } },
            ],
          });
        }

        if (isFeatured !== undefined) {
          filter.isFeatured = isFeatured === 'true';
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOrder = order === "desc" ? -1 : 1;

        // Execute query
        const rewards = await Reward.find(filter)
          .populate("categoryId", "name type subcategoryType")
          .sort({ [sort]: sortOrder })
          .skip(skip)
          .limit(parseInt(limit));

        // Add parent control information to each reward
        const rewardsWithParentInfo = rewards.map(reward => {
          const rewardObj = reward.toObject();

          // Check if parent can control this reward
          const canControl = reward.canParentControl(parentId, childrenData);

          // Check if parent has hidden this reward
          const isHiddenByMe = reward.parentHiddenBy?.some(hide => hide.parentId === parentId) || false;

          return {
            ...rewardObj,
            canParentControl: canControl,
            isHiddenByParent: isHiddenByMe,
            isVisibleToMyChildren: reward.isVisibleToStudent([parentId])
          };
        });

        // Get total count
        const total = await Reward.countDocuments(filter);

        res.status(200).json({
          success: true,
          data: {
            rewards: rewardsWithParentInfo,
            parentInfo: {
              parentId,
              childrenCount: childrenData.length,
              childrenSchools: childrenSchoolIds.length,
              childrenClasses: childrenClassIds.length
            },
            pagination: {
              total,
              page: parseInt(page),
              limit: parseInt(limit),
              pages: Math.ceil(total / parseInt(limit)),
            },
          },
        });

      } catch (userServiceError) {
        console.error("Error getting parent/children details:", userServiceError.response?.data || userServiceError.message);
        return res.status(500).json({
          success: false,
          message: "Failed to get parent information",
          error: userServiceError.message,
        });
      }

    } catch (error) {
      console.error("Get parent rewards error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get parent rewards",
        error: error.message,
      });
    }
  },

  // Toggle reward visibility for parent's children
  toggleRewardVisibility: async (req, res) => {
    try {
      const { id } = req.params;
      const { isVisible } = req.body;
      const { profiles } = req.user;
      const parentId = profiles.parent?._id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reward ID format",
        });
      }

      if (typeof isVisible !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: "isVisible must be a boolean value",
        });
      }

      const reward = await Reward.findById(id);

      if (!reward || reward.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Reward not found",
        });
      }

      // Toggle visibility
      const result = await reward.toggleParentVisibility(parentId, isVisible);

      if (!result.success) {
        return res.status(409).json({
          success: false,
          message: result.message,
        });
      }

      const actionText = isVisible ? "shown to" : "hidden from";
      const statusText = isVisible ? "visible" : "hidden";

      res.status(200).json({
        success: true,
        message: `Reward ${actionText} your children successfully`,
        data: {
          rewardId: reward._id,
          parentId,
          isVisible,
          updatedAt: new Date(),
          status: statusText,
        },
      });

    } catch (error) {
      console.error("Toggle reward visibility error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to toggle reward visibility",
        error: error.message,
      });
    }
  },

  // Get rewards visible to student (respecting parent controls)
  getStudentRewards: async (req, res) => {
    try {
      const {
        category,
        subcategory,
        categoryId,
        search,
        page = 1,
        limit = 20,
        sort = "createdAt",
        order = "desc",
        isFeatured,
        wishlistOnly,
      } = req.query;

      const { profiles } = req.user;
      const authHeader = req.headers.authorization;
      const studentData = profiles['student'];
      const studentId = studentData._id;
      const parentIds = profiles['student']?.parentIds;
      const schoolId = studentData?.schoolId;
      let classIds;

      // Get student details from user service
      const userServiceUrl =
        process.env.NODE_ENV === "production"
          ? process.env.PRODUCTION_USER_SERVICE_URL
          : process.env.USER_SERVICE_URL || "http://localhost:3002";

      try {
        const studentClasses = await axios.get(
          `${userServiceUrl}/api/students/${studentId}/classes`,
          { headers: { Authorization: authHeader } }
        );

        classIds = studentClasses?.data?.data?.map(cls => new mongoose.Types.ObjectId(cls._id)) ?? [];

        // Base filter for rewards
        const filter = {
          isActive: true,
          isDeleted: false,
          isVisibleToChildren: true, // Only visible rewards
          $or: [{ expiryDate: { $gt: new Date() } }, { expiryDate: null }],
          // Exclude rewards hidden by any parent
          $nor: [
            { 'parentHiddenBy.parentId': { $in: parentIds } }
          ]
        };

        // Handle wishlist-only filter
        if (wishlistOnly === 'true') {
          const wishlistItems = await RewardWishlist.find({ studentId });
          const wishlistedRewardIds = wishlistItems.map(item => item.rewardId);

          if (wishlistedRewardIds.length === 0) {
            return res.status(200).json({
              success: true,
              data: {
                rewards: [],
                pagination: {
                  total: 0,
                  page: parseInt(page),
                  limit: parseInt(limit),
                  pages: 0,
                },
              },
            });
          }

          filter._id = { $in: wishlistedRewardIds };
        } else {
          // Apply student access rules
          const rewardAccessConditions = [
            {
              creatorType: "system",
              $nor: [
                { schoolId: { $exists: true, $ne: null } },
                { classId: { $exists: true, $ne: null } }
              ]
            }
          ];

          // School rewards (contain schoolId, no classId requirement)
          if (schoolId) {
            rewardAccessConditions.push({
              $and: [
                { schoolId: schoolId },
                { $or: [{ classId: { $exists: false } }, { classId: null }] }
              ]
            });
          }

          // Class rewards (contain both schoolId and classId)
          if (classIds && classIds.length > 0) {
            rewardAccessConditions.push({
              $and: [
                { schoolId: schoolId },
                { classId: { $in: classIds } }
              ]
            });
          }

          // Parent rewards
          if (parentIds && parentIds.length > 0) {
            const parentObjectIds = parentIds.map(id => new mongoose.Types.ObjectId(id));
            rewardAccessConditions.push({
              creatorType: "parent",
              creatorId: { $in: parentObjectIds }
            });
          }

          // Include social worker rewards if applicable
          if (studentData.socialWorkerId) {
            rewardAccessConditions.push({
              creatorType: "social_worker",
              creatorId: studentData.socialWorkerId
            });
          }

          filter.$or = rewardAccessConditions;
        }

        // Apply additional filters
        if (categoryId) {
          filter.categoryId = categoryId;
        } else if (category) {
          filter.$or = [
            { category: category },
            { categoryName: category }
          ];
        }

        if (subcategory) {
          filter.$or = [
            { subcategory: subcategory },
            { subcategoryName: subcategory }
          ];
        }

        if (search) {
          filter.$and = filter.$and || [];
          filter.$and.push({
            $or: [
              { title: { $regex: search, $options: "i" } },
              { description: { $regex: search, $options: "i" } },
            ],
          });
        }

        if (isFeatured !== undefined) {
          filter.isFeatured = isFeatured === 'true';
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOrder = order === "desc" ? -1 : 1;

        // Execute query
        const rewards = await Reward.find(filter)
          .populate("categoryId", "name type subcategoryType")
          .sort({ [sort]: sortOrder })
          .skip(skip)
          .limit(parseInt(limit));


        // Add wishlist status
        const wishlistItems = await RewardWishlist.find({ studentId });
        const wishlistedRewardIds = new Set(
          wishlistItems.map(item => item.rewardId.toString())
        );

        const rewardsWithWishlistStatus = rewards.map(reward => ({
          ...reward.toObject(),
          isInWishlist: wishlistedRewardIds.has(reward._id.toString())
        }));

        // Get total count
        const total = await Reward.countDocuments(filter);

        res.status(200).json({
          success: true,
          data: {
            rewards: rewardsWithWishlistStatus,
            studentInfo: {
              studentId,
              parentIds,
              schoolId: studentData.schoolId,
              classIds: studentData.classIds || [],
            },
            pagination: {
              total,
              page: parseInt(page),
              limit: parseInt(limit),
              pages: Math.ceil(total / parseInt(limit)),
            },
          },
        });

      } catch (userServiceError) {
        console.error("Error getting student details:", userServiceError.response?.data || userServiceError.message);

        if (wishlistOnly === 'true') {
          return res.status(200).json({
            success: true,
            data: {
              rewards: [],
              pagination: {
                total: 0,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: 0,
              },
            },
          });
        }

        return res.status(500).json({
          success: false,
          message: "Failed to get student information",
          error: userServiceError.message,
        });
      }

    } catch (error) {
      console.error("Get student rewards error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get student rewards",
        error: error.message,
      });
    }
  },


};

module.exports = rewardController;

