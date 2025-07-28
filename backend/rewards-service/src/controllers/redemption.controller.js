const RewardRedemption = require("../models/rewardRedemption.model");
const Reward = require("../models/reward.model");
const mongoose = require("mongoose");
const axios = require("axios");

// Helper function to get student details with user info
const getStudentDetails = async (studentId, authorization) => {
  try {
    const userServiceUrl = process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_USER_SERVICE_URL
      : process.env.USER_SERVICE_URL || "http://localhost:3002";

    const response = await axios.get(
      `${userServiceUrl}/api/students/${studentId}`,
      {
        headers: {
          Authorization: authorization,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error("Failed to get student details:", error.message);
    return null;
  }
};

// Helper function to get parent details
const getParentDetails = async (userId, authorization) => {
  try {
    const userServiceUrl = process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_USER_SERVICE_URL
      : process.env.USER_SERVICE_URL || "http://localhost:3002";

    const response = await axios.get(
      `${userServiceUrl}/api/parents/by-user/${userId}`,
      {
        headers: {
          Authorization: authorization,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error("Failed to get parent details:", error.message);
    return { childIds: [] };
  }
};

const redemptionController = {
  // Redeem a reward
  redeemReward: async (req, res) => {
    try {
      const { id: rewardId } = req.params;
      const { studentId } = req.body;

      // Validate reward ID
      if (!mongoose.Types.ObjectId.isValid(rewardId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reward ID format",
        });
      }

      // Get the reward
      const reward = await Reward.findById(rewardId);

      if (!reward || reward.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Reward not found",
        });
      }

      // Check if reward can be redeemed
      if (!reward.canBeRedeemed()) {
        return res.status(400).json({
          success: false,
          message: "Reward cannot be redeemed",
          reason: !reward.isActive
            ? "Reward is not active"
            : reward.expiryDate && reward.expiryDate < new Date()
              ? "Reward has expired"
              : reward.limitedQuantity && reward.quantity <= 0
                ? "Reward is out of stock"
                : "Unknown reason",
        });
      }

      // Check authorization - students can redeem for themselves, parents can redeem for their children
      const userId = req.user.id;
      const userRoles = req.user.roles;
      let requestedStudentId = studentId || userId;

      // If user is a student, get their student profile ID
      if (userRoles.includes("student")) {
        try {
          const userServiceUrl = process.env.NODE_ENV === "production"
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

          requestedStudentId = studentResponse.data.data._id;

          // Students can only redeem for themselves
          if (studentId && studentId !== requestedStudentId) {
            return res.status(403).json({
              success: false,
              message: "Students can only redeem rewards for themselves",
            });
          }
        } catch (error) {
          console.error("Failed to get student profile:", error.message);
          return res.status(500).json({
            success: false,
            message: "Failed to get student profile",
            error: error.message,
          });
        }
      }

      if (userRoles.includes("parent")) {
        // Verify parent-child relationship
        const parentDetails = await getParentDetails(userId, req.headers.authorization);
        if (!parentDetails.childIds.includes(requestedStudentId)) {
          return res.status(403).json({
            success: false,
            message: "You can only redeem rewards for your own children",
          });
        }
      }

      // Call points service to deduct points
      const pointsServiceUrl =
        process.env.NODE_ENV === "production"
          ? process.env.PRODUCTION_POINTS_SERVICE_URL
          : process.env.POINTS_SERVICE_URL || "http://localhost:3004";

      try {
        // First check if student has enough points
        const balanceResponse = await axios.get(
          `${pointsServiceUrl}/api/points/accounts/student/${requestedStudentId}/balance`,
          {
            headers: {
              Authorization: req.headers.authorization,
            },
          }
        );

        const currentBalance = balanceResponse.data.data.currentBalance;

        if (currentBalance < reward.pointsCost) {
          return res.status(400).json({
            success: false,
            message: "Insufficient points for redemption",
            data: {
              currentBalance,
              required: reward.pointsCost,
            },
          });
        }

        // Deduct points
        await axios.post(
          `${pointsServiceUrl}/api/points/transactions`,
          {
            studentId: requestedStudentId,
            amount: reward.pointsCost,
            type: "spent",
            source: "redemption",
            sourceId: reward._id.toString(),
            description: `Redeemed reward: ${reward.title}`,
            awardedBy: userId,
            awardedByRole: userRoles[0],
            metadata: {
              rewardCategory: reward.category,
              rewardSubcategory: reward.subcategory,
            },
          },
          {
            headers: {
              Authorization: req.headers.authorization,
            },
          }
        );
      } catch (error) {
        console.error(
          "Points service error:",
          error.response?.data || error.message
        );
        return res.status(500).json({
          success: false,
          message: "Failed to process points transaction",
          error: error.response?.data?.message || error.message,
        });
      }

      // Create redemption record
      const redemption = new RewardRedemption({
        rewardId: reward._id,
        studentId: requestedStudentId,
        pointsSpent: reward.pointsCost,
        status: "pending",
        metadata: {
          rewardCategory: reward.category,
          rewardCreatorType: reward.creatorType,
          rewardCreatorId: reward.creatorId,
        },
      });

      await redemption.save();

      // If limited quantity, decrement the quantity
      if (reward.limitedQuantity) {
        await reward.decrementQuantity();
      }

      // Send notification
      try {
        const notificationServiceUrl =
          process.env.NODE_ENV === "production"
            ? process.env.PRODUCTION_NOTIFICATION_SERVICE_URL
            : process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3006";

        // Notify student
        await axios.post(
          `${notificationServiceUrl}/api/notifications`,
          {
            type: "reward_redeemed",
            recipientId: requestedStudentId,
            data: {
              redemptionId: redemption._id,
              rewardId: reward._id,
              rewardTitle: reward.title,
              pointsSpent: reward.pointsCost,
              redemptionCode: redemption.redemptionCode,
            },
          },
          {
            headers: {
              Authorization: req.headers.authorization,
            },
          }
        );

        // Notify reward creator
        await axios.post(
          `${notificationServiceUrl}/api/notifications`,
          {
            type: "reward_redemption_pending",
            recipientId: reward.creatorId,
            data: {
              redemptionId: redemption._id,
              rewardId: reward._id,
              rewardTitle: reward.title,
              studentId: requestedStudentId,
              redemptionCode: redemption.redemptionCode,
            },
          },
          {
            headers: {
              Authorization: req.headers.authorization,
            },
          }
        );
      } catch (error) {
        // Log but don't fail if notification fails
        console.error("Failed to send redemption notification:", error.message);
      }

      // Get student details for the response
      const studentDetails = await getStudentDetails(
        requestedStudentId,
        req.headers.authorization
      );

      const redemptionObj = redemption.toObject();
      redemptionObj.studentInfo = studentDetails ? {
        firstName: studentDetails.userId?.firstName || '',
        lastName: studentDetails.userId?.lastName || '',
        email: studentDetails.userId?.email || '',
        avatar: studentDetails.userId?.avatar || null,
        grade: studentDetails.grade || null
      } : null;

      res.status(201).json({
        success: true,
        message: "Reward redeemed successfully",
        data: {
          redemption: redemptionObj,
          redemptionCode: redemption.redemptionCode,
        },
      });
    } catch (error) {
      console.error("Redeem reward error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to redeem reward",
        error: error.message,
      });
    }
  },

  // Get redemption history
  getRedemptionHistory: async (req, res) => {
    try {
      const {
        studentId,
        rewardId,
        status,
        startDate,
        endDate,
        page = 1,
        limit = 20,
        sort = "redemptionDate",
        order = "desc",
        activeRole
      } = req.query;

      const filter = {};

      // Access control
      const userId = req.user.id;
      const userRoles = req.user.roles;

      if (userRoles.includes("student")) {
        // Students can only see their own redemptions
        // Need to get the student profile ID, not the user ID
        try {
          const userServiceUrl = process.env.NODE_ENV === "production"
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

          const studentProfileId = studentResponse.data.data._id;
          filter.studentId = studentProfileId;
        } catch (error) {
          console.error("Failed to get student profile:", error.message);
          return res.status(500).json({
            success: false,
            message: "Failed to get student profile",
            error: error.message,
          });
        }
      } else if (userRoles.includes("parent")) {
        // Parents can see their children's redemptions
        // TODO: Integrate with user service to get children IDs
        filter.studentId = studentId || userId;
      } else if (activeRole === "school_admin" && userRoles.includes("school_admin")) {
        const schoolId = req.user?.profiles?.school?._id;

        // Step 1: Base match stage
        const baseMatchStage = {
          $match: {
            $or: [
              { "metadata.rewardCreatorType": "school_admin" },
              { "metadata.rewardCreatorType": "teacher" }
            ]
          }
        };

        // Step 2: Lookup and filter by schoolId
        const lookupAndFilterStages = [
          {
            $lookup: {
              from: "rewards",
              localField: "rewardId",
              foreignField: "_id",
              as: "rewardId",
              pipeline: [
                { $project: { title: 1, schoolId: 1, category: 1, subcategory: 1, pointsCost: 1, image: 1, classId: 1 } }
              ]
            }
          },
          { $unwind: "$rewardId" },
          {
            $match: {
              "rewardId.schoolId": new mongoose.Types.ObjectId(schoolId)
            }
          }
        ];

        // Step 3: Count total before pagination
        const countPipeline = [
          baseMatchStage,
          ...lookupAndFilterStages,
          { $count: "total" }
        ];
        const countResult = await RewardRedemption.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        // Step 4: Fetch paginated results
        const paginationStages = [
          { $sort: { [sort]: order === "desc" ? -1 : 1 } },
          { $skip: (parseInt(page) - 1) * parseInt(limit) },
          { $limit: parseInt(limit) }
        ];

        const redemptions = await RewardRedemption.aggregate([
          baseMatchStage,
          ...lookupAndFilterStages,
          ...paginationStages
        ]);

        // Step 5: Enrich with student info
        const redemptionsWithStudentInfo = await Promise.all(
          redemptions.map(async (redemption) => {
            const studentDetails = await getStudentDetails(
              redemption.studentId,
              req.headers.authorization
            );

            return {
              ...redemption,
              studentInfo: studentDetails ? {
                firstName: studentDetails.userId?.firstName || '',
                lastName: studentDetails.userId?.lastName || '',
                email: studentDetails.userId?.email || '',
                avatar: studentDetails.userId?.avatar || null,
                grade: studentDetails.grade || null
              } : null
            };
          })
        );

        // Step 6: Send response
        res.status(200).json({
          success: true,
          data: {
            redemptions: redemptionsWithStudentInfo,
            pagination: {
              total,
              page: parseInt(page),
              limit: parseInt(limit),
              pages: Math.ceil(total / parseInt(limit)),
            },
          },
        });
      } else if (userRoles.includes("teacher") && activeRole === "teacher") {
        const classIds = req.user?.profiles?.teacher?.classIds;
        const classObjectIds = classIds.map(id => new mongoose.Types.ObjectId(id));
        const pageNumber = parseInt(page);
        const pageLimit = parseInt(limit);

        // Step 1: Define common stages (match + lookup + classId filter)
        const baseMatchStage = {
          $match: {
            "metadata.rewardCreatorType": "teacher"
          }
        };

        const lookupAndFilterStages = [
          {
            $lookup: {
              from: "rewards",
              localField: "rewardId",
              foreignField: "_id",
              as: "rewardId"
            }
          },
          { $unwind: "$rewardId" },
          {
            $match: {
              "rewardId.classId": { $in: classObjectIds }
            }
          }
        ];

        // Step 2: Count total before pagination
        const countPipeline = [
          baseMatchStage,
          ...lookupAndFilterStages,
          { $count: "total" }
        ];
        const countResult = await RewardRedemption.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        // Step 3: Fetch paginated results
        const paginationStages = [
          { $sort: { [sort]: order === "desc" ? -1 : 1 } },
          { $skip: (pageNumber - 1) * pageLimit },
          { $limit: pageLimit }
        ];

        const redemptions = await RewardRedemption.aggregate([
          baseMatchStage,
          ...lookupAndFilterStages,
          ...paginationStages
        ]);

        // Step 4: Enrich with student info
        const redemptionsWithStudentInfo = await Promise.all(
          redemptions.map(async (redemption) => {
            const studentDetails = await getStudentDetails(
              redemption.studentId,
              req.headers.authorization
            );

            return {
              ...redemption,
              studentInfo: studentDetails ? {
                firstName: studentDetails.userId?.firstName || '',
                lastName: studentDetails.userId?.lastName || '',
                email: studentDetails.userId?.email || '',
                avatar: studentDetails.userId?.avatar || null,
                grade: studentDetails.grade || null
              } : null
            };
          })
        );

        // Step 5: Return final response
        res.status(200).json({
          success: true,
          data: {
            redemptions: redemptionsWithStudentInfo,
            pagination: {
              total,
              page: pageNumber,
              limit: pageLimit,
              pages: Math.ceil(total / pageLimit)
            }
          }
        });

      }
      // Platform admins can see all redemptions

      // Apply filters
      if (studentId && !userRoles.includes("student")) {
        filter.studentId = studentId;
      }
      if (rewardId) filter.rewardId = rewardId;
      if (status) filter.status = status;

      // Date range filter
      if (startDate || endDate) {
        filter.redemptionDate = {};
        if (startDate) filter.redemptionDate.$gte = new Date(startDate);
        if (endDate) filter.redemptionDate.$lte = new Date(endDate);
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOrder = order === "desc" ? -1 : 1;

      // Execute query with pagination
      const redemptions = await RewardRedemption.find(filter)
        .populate("rewardId", "title category subcategory pointsCost image")
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit));

      // Get student details for each redemption
      const redemptionsWithStudentInfo = await Promise.all(
        redemptions.map(async (redemption) => {
          const studentDetails = await getStudentDetails(
            redemption.studentId,
            req.headers.authorization
          );

          const redemptionObj = redemption.toObject();
          redemptionObj.studentInfo = studentDetails ? {
            firstName: studentDetails.userId?.firstName || '',
            lastName: studentDetails.userId?.lastName || '',
            email: studentDetails.userId?.email || '',
            avatar: studentDetails.userId?.avatar || null,
            grade: studentDetails.grade || null
          } : null;

          return redemptionObj;
        })
      );

      // Get total count for pagination
      const total = await RewardRedemption.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: {
          redemptions: redemptionsWithStudentInfo,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Get redemption history error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get redemption history",
        error: error.message,
      });
    }
  },

  // Fulfill a redemption
  fulfillRedemption: async (req, res) => {
    try {
      const { id } = req.params;
      const { feedback, role } = req.body;
      const { profiles } = req.user;
      const userId = role === 'parent' ? profiles.parent?._id : req.user.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid redemption ID format",
        });
      }

      const redemption = await RewardRedemption.findById(id).populate(
        "rewardId"
      );

      if (!redemption) {
        return res.status(404).json({
          success: false,
          message: "Redemption not found",
        });
      }

      // Check authorization - only reward creator can fulfill
      const userRoles = req.user.roles;
      const reward = redemption.rewardId;

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
          message: "Not authorized to fulfill this redemption",
        });
      }

      // Fulfill the redemption
      await redemption.fulfill(userId, feedback);

      // Send notification to student
      try {
        const notificationServiceUrl =
          process.env.NODE_ENV === "production"
            ? process.env.PRODUCTION_NOTIFICATION_SERVICE_URL
            : process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3006";

        await axios.post(
          `${notificationServiceUrl}/api/notifications`,
          {
            type: "reward_fulfilled",
            recipientId: redemption.studentId,
            data: {
              redemptionId: redemption._id,
              rewardId: reward._id,
              rewardTitle: reward.title,
              feedback,
            },
          },
          {
            headers: {
              Authorization: req.headers.authorization,
            },
          }
        );
      } catch (error) {
        console.error(
          "Failed to send fulfillment notification:",
          error.message
        );
      }

      // Get student details for the response
      const studentDetails = await getStudentDetails(
        redemption.studentId,
        req.headers.authorization
      );

      const redemptionObj = redemption.toObject();
      redemptionObj.studentInfo = studentDetails ? {
        firstName: studentDetails.userId?.firstName || '',
        lastName: studentDetails.userId?.lastName || '',
        email: studentDetails.userId?.email || '',
        avatar: studentDetails.userId?.avatar || null,
        grade: studentDetails.grade || null
      } : null;

      res.status(200).json({
        success: true,
        message: "Redemption fulfilled successfully",
        data: redemptionObj,
      });
    } catch (error) {
      console.error("Fulfill redemption error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fulfill redemption",
        error: error.message,
      });
    }
  },

  // Cancel a redemption
  cancelRedemption: async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, role } = req.body;
      const { profiles } = req.user;
      const userId = role === 'parent' ? profiles.parent?._id : req.user.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid redemption ID format",
        });
      }

      const redemption = await RewardRedemption.findById(id).populate(
        "rewardId"
      );

      if (!redemption) {
        return res.status(404).json({
          success: false,
          message: "Redemption not found",
        });
      }

      // Check authorization - student can cancel their own, reward creator can cancel any
      const userRoles = req.user.roles;
      const reward = redemption.rewardId;

      const isStudent = role === "student" && userRoles.includes("student") && redemption.studentId === userId;

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

      if (!isStudent && !isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to cancel this redemption",
        });
      }

      // Cancel the redemption
      await redemption.cancel(userId, reason);

      // Refund points
      const pointsServiceUrl =
        process.env.NODE_ENV === "production"
          ? process.env.PRODUCTION_POINTS_SERVICE_URL
          : process.env.POINTS_SERVICE_URL || "http://localhost:3004";

      try {
        await axios.post(
          `${pointsServiceUrl}/api/points/transactions`,
          {
            studentId: redemption.studentId,
            amount: redemption.pointsSpent,
            type: "earned",
            source: "redemption",
            sourceId: redemption._id.toString(),
            description: `Refund for cancelled redemption: ${reward.title}`,
            awardedBy: userId,
            awardedByRole: role,
            metadata: {
              redemptionId: redemption._id,
              rewardId: reward._id,
              cancellationReason: reason,
            },
          },
          {
            headers: {
              Authorization: req.headers.authorization,
            },
          }
        );
      } catch (error) {
        console.error(
          "Failed to refund points:",
          error.response?.data || error.message
        );
        // Continue even if refund fails - redemption is already cancelled
      }

      // Restore reward quantity if limited
      if (reward.limitedQuantity) {
        reward.quantity += 1;
        await reward.save();
      }

      // Send notification
      try {
        const notificationServiceUrl =
          process.env.NODE_ENV === "production"
            ? process.env.PRODUCTION_NOTIFICATION_SERVICE_URL
            : process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3006";

        await axios.post(
          `${notificationServiceUrl}/api/notifications`,
          {
            type: "reward_cancelled",
            recipientId: redemption.studentId,
            data: {
              redemptionId: redemption._id,
              rewardId: reward._id,
              rewardTitle: reward.title,
              pointsRefunded: redemption.pointsSpent,
              cancellationReason: reason,
            },
          },
          {
            headers: {
              Authorization: req.headers.authorization,
            },
          }
        );
      } catch (error) {
        console.error(
          "Failed to send cancellation notification:",
          error.message
        );
      }

      res.status(200).json({
        success: true,
        message: "Redemption cancelled successfully",
        data: redemption,
      });
    } catch (error) {
      console.error("Cancel redemption error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to cancel redemption",
        error: error.message,
      });
    }
  },

  // Get redemption by ID
  getRedemptionById: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid redemption ID format",
        });
      }

      const redemption = await RewardRedemption.findById(id).populate(
        "rewardId",
        "title category subcategory pointsCost creatorId creatorType"
      );

      if (!redemption) {
        return res.status(404).json({
          success: false,
          message: "Redemption not found",
        });
      }

      // Access control - student can view their own, creator can view theirs
      const userId = req.user.id;
      const userRoles = req.user.roles;
      const reward = redemption.rewardId;

      const isStudent =
        userRoles.includes("student") && redemption.studentId === userId;
      const isCreator =
        reward.creatorId === userId ||
        (reward.creatorType === "school" &&
          userRoles.includes("school_admin") &&
          reward.schoolId === req.user.schoolId);
      const isPlatformAdmin = userRoles.includes("platform_admin");

      if (!isStudent && !isCreator && !isPlatformAdmin) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this redemption",
        });
      }

      res.status(200).json({
        success: true,
        data: redemption,
      });
    } catch (error) {
      console.error("Get redemption error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get redemption",
        error: error.message,
      });
    }
  },

  // Get pending redemptions for fulfillment
  getPendingRedemptions: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;

      // Access control - only reward creators can see pending redemptions
      const parentId = req.user?.profiles?.parent?._id;
      const userRoles = req.user.roles;
      const filter = { status: "pending" };

      if (userRoles.includes("parent")) {
        // Parents see redemptions for their created rewards
        filter["metadata.rewardCreatorId"] = mongoose.Types.ObjectId.createFromHexString(parentId);
      } else if (userRoles.includes("school_admin")) {
        // School admins see redemptions for school rewards
        filter["metadata.rewardCreatorType"] = "school";
        // TODO: Filter by school ID
      } else if (!userRoles.includes("platform_admin")) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view pending redemptions",
        });
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Execute query with pagination
      const redemptions = await RewardRedemption.find(filter)
        .populate("rewardId", "title category subcategory pointsCost image")
        .sort({ redemptionDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Get student details for each redemption
      const redemptionsWithStudentInfo = await Promise.all(
        redemptions.map(async (redemption) => {
          const studentDetails = await getStudentDetails(
            redemption.studentId,
            req.headers.authorization
          );

          const redemptionObj = redemption.toObject();
          redemptionObj.studentInfo = studentDetails ? {
            firstName: studentDetails.userId?.firstName || '',
            lastName: studentDetails.userId?.lastName || '',
            email: studentDetails.userId?.email || '',
            avatar: studentDetails.userId?.avatar || null,
            grade: studentDetails.grade || null
          } : null;

          return redemptionObj;
        })
      );

      // Get total count for pagination
      const total = await RewardRedemption.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: {
          redemptions: redemptionsWithStudentInfo,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Get pending redemptions error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get pending redemptions",
        error: error.message,
      });
    }
  },
};

module.exports = redemptionController;
