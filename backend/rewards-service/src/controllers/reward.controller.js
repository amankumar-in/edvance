// src/controllers/reward.controller.js
const Reward = require("../models/reward.model");
const RewardCategory = require("../models/rewardCategory.model");
const mongoose = require("mongoose");
const axios = require("axios");
const { getFileUrl } = require("../middleware/upload.middleware");

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
      } = req.body;

      // Handle image upload
      let imageUrl = null;
      if (req.file) {
        imageUrl = getFileUrl(req.file.filename);
      }

      // Extract user info from authentication middleware
      const creatorId = req.user.id;
      const userRoles = req.user.roles;

      // Determine creator type based on user role
      let creatorType;
      if (userRoles.includes("parent")) {
        creatorType = "parent";
      } else if (userRoles.includes("teacher")) {
        creatorType = "teacher";
      } else if (userRoles.includes("school_admin")) {
        creatorType = "school";
      } else if (userRoles.includes("social_worker")) {
        creatorType = "social_worker";
      } else if (userRoles.includes("platform_admin")) {
        creatorType = "system";
      } else {
        return res.status(403).json({
          success: false,
          message: "Not authorized to create rewards",
        });
      }

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
        creatorType,
        schoolId:
          creatorType === "school" || creatorType === "teacher"
            ? schoolId || req.user.schoolId
            : undefined,
        classId: creatorType === "teacher" ? classId : undefined,
        limitedQuantity: limitedQuantity || false,
        quantity: limitedQuantity ? quantity : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        image: imageUrl,
        redemptionInstructions,
        restrictions,
        metadata,
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
        schoolId,
        classId,
        minPoints,
        maxPoints,
        search,
        page = 1,
        limit = 20,
        sort = "pointsCost",
        order = "asc",
      } = req.query;

      const filter = {
        isActive: true,
        isDeleted: false,
        $or: [{ expiryDate: { $gt: new Date() } }, { expiryDate: null }],
        $and: [
          {
            $or: [{ limitedQuantity: false }, { quantity: { $gt: 0 } }],
          },
        ],
      };

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
      if (schoolId) filter.schoolId = schoolId;
      if (classId) filter.classId = classId;

      if (minPoints) filter.pointsCost = { $gte: parseInt(minPoints) };
      if (maxPoints) {
        filter.pointsCost = filter.pointsCost || {};
        filter.pointsCost.$lte = parseInt(maxPoints);
      }

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      // Access control based on user role
      const userRoles = req.user.roles;
      const userId = req.user.id;

      if (userRoles.includes("student")) {
        try {
          // Get student details from user service
          const userServiceUrl =
            process.env.NODE_ENV === "production"
              ? process.env.PRODUCTION_USER_SERVICE_URL
              : process.env.USER_SERVICE_URL || "http://localhost:3002";

          const studentResponse = await axios.get(
            `${userServiceUrl}/api/students/me`,
            {
              headers: {
                Authorization: req.headers.authorization,
              },
            }
          );

          const studentData = studentResponse.data.data;

          // Students can see:
          // 1. Sponsor rewards
          // 2. System rewards
          // 3. School rewards for their school
          // 4. Class rewards for their classes
          // 5. Family rewards created by their parents
          filter.$or = [
            { category: "sponsor" },
            { creatorType: "system" },
            { schoolId: studentData.schoolId },
            { classId: { $in: studentData.classIds || [] } },
            { creatorId: { $in: studentData.parentIds || [] } },
          ];

          // If student has a social worker, include their rewards too
          if (studentData.socialWorkerId) {
            filter.$or.push({ creatorId: studentData.socialWorkerId });
          }
        } catch (error) {
          console.error(
            "Error getting student details:",
            error.response?.data || error.message
          );
          // Fallback if user service fails - show basic rewards
          filter.$or = [{ category: "sponsor" }, { creatorType: "system" }];
        }
      } else if (userRoles.includes("parent")) {
        try {
          // Get parent details from user service
          const userServiceUrl =
            process.env.NODE_ENV === "production"
              ? process.env.PRODUCTION_USER_SERVICE_URL
              : process.env.USER_SERVICE_URL || "http://localhost:3002";

          const parentResponse = await axios.get(
            `${userServiceUrl}/api/parents/me`,
            {
              headers: {
                Authorization: req.headers.authorization,
              },
            }
          );

          const parentData = parentResponse.data.data;

          // Get children's school IDs
          const childrenResponse = await axios.get(
            `${userServiceUrl}/api/parents/me/children`,
            {
              headers: {
                Authorization: req.headers.authorization,
              },
            }
          );

          const childrenData = childrenResponse.data.data;
          const childrenSchoolIds = childrenData
            .map((child) => child.schoolId)
            .filter(Boolean);

          // Parents can see:
          // 1. Their own rewards
          // 2. Sponsor rewards
          // 3. System rewards
          // 4. School rewards for schools their children attend
          filter.$or = [
            { creatorId: userId },
            { category: "sponsor" },
            { creatorType: "system" },
            { schoolId: { $in: childrenSchoolIds } },
          ];
        } catch (error) {
          console.error(
            "Error getting parent details:",
            error.response?.data || error.message
          );
          // Fallback if user service fails
          filter.$or = [
            { creatorId: userId },
            { category: "sponsor" },
            { creatorType: "system" },
          ];
        }
      } else if (userRoles.includes("teacher")) {
        // Teachers can see:
        // 1. Their own rewards
        // 2. School rewards for their school
        // 3. System rewards
        filter.$or = [
          { creatorId: userId },
          { schoolId: req.user.schoolId },
          { creatorType: "system" },
        ];
      } else if (userRoles.includes("social_worker")) {
        // Social workers can see:
        // 1. Their own rewards
        // 2. Sponsor rewards
        // 3. System rewards
        filter.$or = [
          { creatorId: userId },
          { category: "sponsor" },
          { creatorType: "system" },
        ];
      } else if (userRoles.includes("school_admin")) {
        // School admins can see all rewards but focus on their school
        if (req.user.schoolId && !schoolId) {
          filter.schoolId = req.user.schoolId;
        }
      }
      // Platform admins can see all rewards

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

      res.status(200).json({
        success: true,
        data: reward,
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

      // Check authorization - only creator or platform admin can update
      const userId = req.user.id;
      const userRoles = req.user.roles;

      const isAuthorized =
        reward.creatorId === userId ||
        (reward.creatorType === "school" &&
          userRoles.includes("school_admin") &&
          reward.schoolId === req.user.schoolId) ||
        (reward.creatorType === "teacher" &&
          userRoles.includes("teacher") &&
          reward.creatorId === userId) ||
        userRoles.includes("platform_admin");

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

      // Check authorization - only creator or platform admin can delete
      const userId = req.user.id;
      const userRoles = req.user.roles;

      const isAuthorized =
        reward.creatorId === userId ||
        (reward.creatorType === "school" &&
          userRoles.includes("school_admin") &&
          reward.schoolId === req.user.schoolId) ||
        (reward.creatorType === "teacher" &&
          userRoles.includes("teacher") &&
          reward.creatorId === userId) ||
        userRoles.includes("platform_admin");

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
};

module.exports = rewardController;
