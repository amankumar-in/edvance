const Badge = require("../models/badge.model");
const Student = require("../models/student.model");
const axios = require("axios");

// Check and award badges based on criteria
exports.checkAndAwardBadges = async (studentId, triggerType, metadata = {}) => {
  try {
    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      console.error(`Cannot award badges: Student ${studentId} not found`);
      return [];
    }

    // Get student's current badges
    const currentBadges = student.badges || [];

    // Get all available badges with criteria matching the trigger type
    const badges = await Badge.find({
      "conditions.type": triggerType,
      _id: { $nin: currentBadges }, // Only badges the student doesn't already have
    });

    if (!badges || badges.length === 0) {
      return [];
    }

    const awardedBadges = [];

    // For points threshold badges
    if (triggerType === "points_threshold") {
      // Get current points from points service or use provided total
      let totalPoints = metadata.totalPoints;

      if (!totalPoints) {
        try {
          // Get points from points service
          const pointsServiceUrl =
            process.env.NODE_ENV === "production"
              ? process.env.PRODUCTION_POINTS_SERVICE_URL
              : process.env.POINTS_SERVICE_URL;

          const response = await axios.get(
            `${pointsServiceUrl}/api/points/student/${studentId}/balance`,
            {
              headers: { Authorization: metadata.authorization },
            }
          );

          totalPoints = response.data.data.totalEarned;
        } catch (error) {
          console.error("Error fetching points:", error);
          return [];
        }
      }

      // Check each badge
      for (const badge of badges) {
        if (totalPoints >= badge.conditions.threshold) {
          await awardBadgeToStudent(student, badge, metadata.authorization);
          awardedBadges.push(badge);
        }
      }
    }

    // For attendance streak badges
    if (triggerType === "attendance_streak") {
      let streak = metadata.streak;

      // If streak not provided, fetch from student record
      if (!streak && student.attendanceStreak) {
        streak = student.attendanceStreak;
      }

      if (streak) {
        for (const badge of badges) {
          if (streak >= badge.conditions.streak) {
            await awardBadgeToStudent(student, badge, metadata.authorization);
            awardedBadges.push(badge);
          }
        }
      }
    }

    // For task completion badges
    if (triggerType === "task_completion") {
      // Get task data from task service or use provided counts
      let taskData = metadata.taskData;

      if (!taskData && metadata.authorization) {
        try {
          // This will work once the task service is implemented
          const taskServiceUrl =
            process.env.NODE_ENV === "production"
              ? process.env.PRODUCTION_TASK_SERVICE_URL
              : process.env.TASK_SERVICE_URL;

          const response = await axios.get(
            `${taskServiceUrl}/api/tasks/student/${studentId}/stats`,
            {
              headers: { Authorization: metadata.authorization },
            }
          );

          taskData = response.data.data;
        } catch (error) {
          console.error("Error fetching task data:", error);
          // Continue with available data
        }
      }

      // If task data is available, check badges
      if (taskData && taskData.categoryCounts) {
        for (const badge of badges) {
          const { taskCategory, threshold } = badge.conditions;

          // Check if the category exists and count meets the threshold
          if (
            taskData.categoryCounts[taskCategory] &&
            taskData.categoryCounts[taskCategory] >= threshold
          ) {
            await awardBadgeToStudent(student, badge, metadata.authorization);
            awardedBadges.push(badge);
          }
        }
      } else if (metadata.taskCategory && metadata.completedCount) {
        // Use specific category and count if provided
        for (const badge of badges) {
          if (
            badge.conditions.taskCategory === metadata.taskCategory &&
            metadata.completedCount >= badge.conditions.threshold
          ) {
            await awardBadgeToStudent(student, badge, metadata.authorization);
            awardedBadges.push(badge);
          }
        }
      }
    }

    return awardedBadges;
  } catch (error) {
    console.error("Error checking badges:", error);
    return [];
  }
};

// Award a specific badge to a student
async function awardBadgeToStudent(student, badge, authorization) {
  try {
    // Add badge to student's list if not already present
    if (!student.badges.includes(badge._id)) {
      student.badges.push(badge._id);
      await student.save();

      // Award bonus points if badge has them
      if (badge.pointsBonus > 0 && authorization) {
        try {
          const pointsServiceUrl =
            process.env.NODE_ENV === "production"
              ? process.env.PRODUCTION_POINTS_SERVICE_URL
              : process.env.POINTS_SERVICE_URL;

          // Award bonus points through the points service
          await axios.post(
            `${pointsServiceUrl}/api/points/transactions`,
            {
              studentId: student._id,
              amount: badge.pointsBonus,
              type: "earned",
              source: "badge",
              sourceId: badge._id.toString(),
              description: `Earned ${badge.name} badge bonus`,
              awardedBy: "system",
              awardedByRole: "system",
              metadata: {
                badgeName: badge.name,
                badgeDescription: badge.description,
              },
            },
            {
              headers: { Authorization: authorization },
            }
          );

          console.log(
            `Awarded ${badge.pointsBonus} bonus points for badge ${badge.name} to student ${student._id}`
          );
        } catch (error) {
          console.error("Failed to award badge bonus points:", error);
        }
      }

      // Notify student (stub for notification service)
      try {
        notifyStudent(
          student._id,
          {
            type: "badge_earned",
            title: `New Badge: ${badge.name}`,
            message: badge.description,
            badgeId: badge._id,
          },
          authorization
        );
      } catch (error) {
        console.error("Failed to send notification:", error);
      }

      console.log(`Badge ${badge.name} awarded to student ${student._id}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(
      `Error awarding badge ${badge._id} to student ${student._id}:`,
      error
    );
    return false;
  }
}

// Helper function to send notifications (will be replaced by notification service)
async function notifyStudent(studentId, notification, authorization) {
  // This will be implemented when notification service is ready
  console.log(`Would send notification to student ${studentId}:`, notification);
}

// Manually award a badge to a student
exports.awardBadgeManually = async (
  studentId,
  badgeId,
  awardedBy,
  authorization
) => {
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    const badge = await Badge.findById(badgeId);
    if (!badge) {
      throw new Error("Badge not found");
    }

    // Store original issuer to restore later
    const originalIssuerId = badge.issuerId;

    // Temporarily set the badge issuer to the person manually awarding
    badge.issuerId = awardedBy;

    const awarded = await awardBadgeToStudent(student, badge, authorization);

    // Restore original issuer
    badge.issuerId = originalIssuerId;
    await badge.save();

    return awarded;
  } catch (error) {
    console.error("Error manually awarding badge:", error);
    throw error;
  }
};

// Check for any badges a student might qualify for (comprehensive check)
exports.checkAllBadgesForStudent = async (studentId, authorization) => {
  try {
    const awardedBadges = [];

    // Check points threshold badges
    const pointsThresholdBadges = await this.checkAndAwardBadges(
      studentId,
      "points_threshold",
      { authorization }
    );
    awardedBadges.push(...pointsThresholdBadges);

    // Check attendance streak badges
    const attendanceStreakBadges = await this.checkAndAwardBadges(
      studentId,
      "attendance_streak",
      { authorization }
    );
    awardedBadges.push(...attendanceStreakBadges);

    // Check task completion badges
    const taskCompletionBadges = await this.checkAndAwardBadges(
      studentId,
      "task_completion",
      { authorization }
    );
    awardedBadges.push(...taskCompletionBadges);

    return awardedBadges;
  } catch (error) {
    console.error("Error checking all badges:", error);
    return [];
  }
};
