// badge.controller.js
const Badge = require("../models/badge.model");
const Student = require("../models/student.model");
const badgeService = require("../services/badge.service");

// Get all badges
exports.getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find();

    res.status(200).json({
      success: true,
      data: badges,
    });
  } catch (error) {
    console.error("Get all badges error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get badges",
      error: error.message,
    });
  }
};

// Get badge by ID
exports.getBadgeById = async (req, res) => {
  try {
    const badgeId = req.params.id;

    const badge = await Badge.findById(badgeId).populate(
      "issuerId",
      "firstName lastName"
    );

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: "Badge not found",
      });
    }

    res.status(200).json({
      success: true,
      data: badge,
    });
  } catch (error) {
    console.error("Get badge by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get badge",
      error: error.message,
    });
  }
};

// Create badge (admin/school only)
exports.createBadge = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      description,
      category,
      image,
      conditions,
      pointsBonus,
      issuerType,
    } = req.body;

    // Create new badge
    const newBadge = new Badge({
      name,
      description,
      category,
      image,
      conditions,
      pointsBonus: pointsBonus || 0,
      issuerId: userId,
      issuerType: issuerType || "system",
    });

    await newBadge.save();

    res.status(201).json({
      success: true,
      message: "Badge created successfully",
      data: newBadge,
    });
  } catch (error) {
    console.error("Create badge error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create badge",
      error: error.message,
    });
  }
};

// Get student badges
exports.getStudentBadges = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get badges
    const badges = await Badge.find({
      _id: { $in: student.badges },
    });

    res.status(200).json({
      success: true,
      data: badges,
    });
  } catch (error) {
    console.error("Get student badges error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get student badges",
      error: error.message,
    });
  }
};

// Award a badge to a student
exports.awardBadge = async (req, res) => {
  try {
    const { studentId, badgeId } = req.body;

    if (!studentId || !badgeId) {
      return res.status(400).json({
        success: false,
        message: "Student ID and Badge ID are required",
      });
    }

    const awarded = await badgeService.awardBadgeManually(
      studentId,
      badgeId,
      req.user.id,
      req.headers.authorization // Pass authorization header for points service
    );

    if (awarded) {
      res.status(200).json({
        success: true,
        message: "Badge awarded successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message:
          "Badge was already awarded to this student or could not be awarded",
      });
    }
  } catch (error) {
    console.error("Award badge error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to award badge",
      error: error.message,
    });
  }
};

// Check if student qualifies for badges based on criteria
exports.checkBadges = async (req, res) => {
  try {
    const { studentId, triggerType, metadata } = req.body;

    if (!studentId || !triggerType) {
      return res.status(400).json({
        success: false,
        message: "Student ID and trigger type are required",
      });
    }

    // Add authorization for service calls
    const metadataWithAuth = {
      ...(metadata || {}),
      authorization: req.headers.authorization,
    };

    const awardedBadges = await badgeService.checkAndAwardBadges(
      studentId,
      triggerType,
      metadataWithAuth
    );

    res.status(200).json({
      success: true,
      message: `${awardedBadges.length} badges awarded`,
      data: { awardedBadges },
    });
  } catch (error) {
    console.error("Check badges error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check badges",
      error: error.message,
    });
  }
};

// Get available badge criteria
exports.getBadgeCriteria = async (req, res) => {
  try {
    // Return a list of available criteria types and what they mean
    res.status(200).json({
      success: true,
      data: {
        criteriaTypes: [
          {
            type: "points_threshold",
            description: "Awarded when student reaches a specific points total",
            metadata: {
              threshold: "Number of points required (e.g., 100)",
            },
          },
          {
            type: "attendance_streak",
            description:
              "Awarded when student achieves a specific attendance streak",
            metadata: {
              streak: "Number of consecutive days (e.g., 5)",
            },
          },
          {
            type: "task_completion",
            description:
              "Awarded when student completes a specific number of tasks in a category",
            metadata: {
              taskCategory: "Category of tasks (e.g., 'math', 'reading')",
              threshold: "Number of tasks required (e.g., 10)",
            },
          },
          {
            type: "custom",
            description: "Custom criteria that can be manually awarded",
          },
        ],
      },
    });
  } catch (error) {
    console.error("Get badge criteria error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get badge criteria",
      error: error.message,
    });
  }
};

// Check all badge types for a student
exports.checkAllBadges = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const awardedBadges = await badgeService.checkAllBadgesForStudent(
      studentId,
      req.headers.authorization
    );

    res.status(200).json({
      success: true,
      message: `${awardedBadges.length} badges awarded`,
      data: { awardedBadges },
    });
  } catch (error) {
    console.error("Check all badges error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check badges",
      error: error.message,
    });
  }
};

// Achievement timeline endpoint
exports.getAchievementTimeline = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Find all point transactions related to badge earnings
    const badgeTransactions = await PointTransaction.find({
      studentId,
      source: "badge",
      type: "earned",
    }).sort({ createdAt: 1 });

    // Combine with badge info
    const timeline = [];
    for (const transaction of badgeTransactions) {
      // Get badge details if sourceId exists
      let badge = null;
      if (transaction.sourceId) {
        badge = await Badge.findById(transaction.sourceId);
      }

      timeline.push({
        date: transaction.createdAt,
        badgeId: transaction.sourceId,
        badgeName: badge ? badge.name : "Unknown Badge",
        badgeDescription: badge ? badge.description : "",
        badgeImage: badge ? badge.image : "",
        pointsAwarded: transaction.amount,
        transaction: transaction._id,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: studentId,
          name: `${student.firstName} ${student.lastName}`,
          badgeCount: timeline.length,
        },
        timeline,
      },
    });
  } catch (error) {
    console.error("Get achievement timeline error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get achievement timeline",
      error: error.message,
    });
  }
};

// Get badge collections
exports.getBadgeCollections = async (req, res) => {
  try {
    // Get all collections
    const collections = await Badge.aggregate([
      {
        $match: {
          collection: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$collection",
          badgeCount: { $sum: 1 },
          badges: { $push: "$$ROOT" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format collections
    const formattedCollections = collections.map((collection) => ({
      name: collection._id,
      badgeCount: collection.badgeCount,
      badges: collection.badges
        .sort((a, b) => a.collectionOrder - b.collectionOrder)
        .map((badge) => ({
          id: badge._id,
          name: badge.name,
          description: badge.description,
          image: badge.image,
          collectionOrder: badge.collectionOrder,
          conditions: badge.conditions,
          pointsBonus: badge.pointsBonus,
        })),
    }));

    res.status(200).json({
      success: true,
      data: formattedCollections,
    });
  } catch (error) {
    console.error("Get badge collections error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get badge collections",
      error: error.message,
    });
  }
};

// Create or update badge collection
exports.updateBadgeCollection = async (req, res) => {
  try {
    const { badgeIds, collectionName } = req.body;

    // Validate input
    if (!badgeIds || !Array.isArray(badgeIds) || !collectionName) {
      return res.status(400).json({
        success: false,
        message: "Badge IDs array and collection name are required",
      });
    }

    // Only platform admins can manage collections
    if (!req.user.roles.includes("platform_admin")) {
      return res.status(403).json({
        success: false,
        message: "Only platform administrators can manage badge collections",
      });
    }

    // Update all badges in the collection
    const updatePromises = badgeIds.map((badgeId, index) =>
      Badge.findByIdAndUpdate(badgeId, {
        collection: collectionName,
        collectionOrder: index,
      })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: `Badges updated to collection "${collectionName}"`,
      data: {
        collection: collectionName,
        badgeCount: badgeIds.length,
      },
    });
  } catch (error) {
    console.error("Update badge collection error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update badge collection",
      error: error.message,
    });
  }
};

// Remove badges from collection
exports.removeBadgeFromCollection = async (req, res) => {
  try {
    const { id } = req.params;

    // Only platform admins can manage collections
    if (!req.user.roles.includes("platform_admin")) {
      return res.status(403).json({
        success: false,
        message: "Only platform administrators can manage badge collections",
      });
    }

    // Find and update the badge
    const badge = await Badge.findByIdAndUpdate(id, {
      $unset: { collection: "", collectionOrder: "" },
    });

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: "Badge not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Badge removed from collection",
      data: {
        badgeId: id,
        previousCollection: badge.collection,
      },
    });
  } catch (error) {
    console.error("Remove badge from collection error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove badge from collection",
      error: error.message,
    });
  }
};
