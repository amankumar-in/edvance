const RewardRedemption = require("../models/rewardRedemption.model");
const Reward = require("../models/reward.model");
const mongoose = require("mongoose");
const axios = require("axios");

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
      const requestedStudentId = studentId || userId;

      // If user is a student, they can only redeem for themselves
      if (userRoles.includes("student") && requestedStudentId !== userId) {
        return res.status(403).json({
          success: false,
          message: "Students can only redeem rewards for themselves",
        });
      }

      if (userRoles.includes("parent")) {
        // Verify parent-child relationship
        const parentDetails = await getParentDetails(userId);
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

      res.status(201).json({
        success: true,
        message: "Reward redeemed successfully",
        data: {
          redemption,
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
      } = req.query;

      const filter = {};

      // Access control
      const userId = req.user.id;
      const userRoles = req.user.roles;

      if (userRoles.includes("student")) {
        // Students can only see their own redemptions
        filter.studentId = userId;
      } else if (userRoles.includes("parent")) {
        // Parents can see their children's redemptions
        // TODO: Integrate with user service to get children IDs
        filter.studentId = studentId || userId;
      } else if (
        userRoles.includes("school_admin") ||
        userRoles.includes("teacher")
      ) {
        // School staff can see redemptions related to their school
        // TODO: Filter based on school ID from rewards
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
        .populate("rewardId", "title category subcategory pointsCost")
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count for pagination
      const total = await RewardRedemption.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: {
          redemptions,
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
      const { feedback } = req.body;

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
      const userId = req.user.id;
      const userRoles = req.user.roles;
      const reward = redemption.rewardId;

      const isAuthorized =
        reward.creatorId === userId ||
        (reward.creatorType === "school" &&
          userRoles.includes("school_admin") &&
          reward.schoolId === req.user.schoolId) ||
        userRoles.includes("platform_admin");

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

      res.status(200).json({
        success: true,
        message: "Redemption fulfilled successfully",
        data: redemption,
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
      const { reason } = req.body;

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
            awardedByRole: userRoles[0],
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
      const userId = req.user.id;
      const userRoles = req.user.roles;
      const filter = { status: "pending" };

      if (userRoles.includes("parent")) {
        // Parents see redemptions for their created rewards
        filter["metadata.rewardCreatorId"] = userId;
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
        .populate("rewardId", "title category subcategory pointsCost")
        .sort({ redemptionDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count for pagination
      const total = await RewardRedemption.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: {
          redemptions,
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
