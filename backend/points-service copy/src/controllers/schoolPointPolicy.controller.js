const SchoolPointPolicy = require("../models/schoolPointPolicy.model");

// Get policy for a school
exports.getSchoolPolicy = async (req, res) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    // Get or create policy
    const policy = await SchoolPointPolicy.getOrCreatePolicy(schoolId);

    res.status(200).json({
      success: true,
      data: policy,
    });
  } catch (error) {
    console.error("Get school policy error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get school point policy",
      error: error.message,
    });
  }
};

// Update policy for a school
exports.updateSchoolPolicy = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { policies } = req.body;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required",
      });
    }

    // Check permissions - only allow school_admin or platform_admin
    const isAdmin = req.user.roles.includes("platform_admin");
    const isSchoolAdmin = req.user.roles.includes("school_admin");

    if (!isAdmin && !isSchoolAdmin) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update school policies",
      });
    }

    // If school admin, verify they belong to this school
    if (isSchoolAdmin && !isAdmin) {
      // In a real implementation, we would check if the user is admin for this school
      // For now, we'll skip this check as we don't have access to school-user mapping here
    }

    // Get or create policy
    let policy = await SchoolPointPolicy.findOne({ schoolId });

    if (!policy) {
      policy = new SchoolPointPolicy({
        schoolId,
      });
    }

    // Update policy fields
    if (policies) {
      // Update attendance policies
      if (policies.attendance) {
        if (policies.attendance.dailyCheckIn !== undefined) {
          policy.policies.attendance.dailyCheckIn =
            policies.attendance.dailyCheckIn;
        }
        if (policies.attendance.streak) {
          if (policies.attendance.streak.enabled !== undefined) {
            policy.policies.attendance.streak.enabled =
              policies.attendance.streak.enabled;
          }
          if (policies.attendance.streak.interval !== undefined) {
            policy.policies.attendance.streak.interval =
              policies.attendance.streak.interval;
          }
          if (policies.attendance.streak.bonus !== undefined) {
            policy.policies.attendance.streak.bonus =
              policies.attendance.streak.bonus;
          }
        }
      }

      // Update task policies
      if (policies.task) {
        if (policies.task.base !== undefined) {
          policy.policies.task.base = policies.task.base;
        }
        if (policies.task.categories) {
          for (const [category, value] of Object.entries(
            policies.task.categories
          )) {
            policy.policies.task.categories.set(category, value);
          }
        }
      }

      // Update daily limit
      if (policies.dailyLimit) {
        if (policies.dailyLimit.enabled !== undefined) {
          policy.policies.dailyLimit.enabled = policies.dailyLimit.enabled;
        }
        if (policies.dailyLimit.maxPoints !== undefined) {
          policy.policies.dailyLimit.maxPoints = policies.dailyLimit.maxPoints;
        }
      }
    }

    policy.updatedAt = Date.now();
    await policy.save();

    res.status(200).json({
      success: true,
      message: "School point policy updated successfully",
      data: policy,
    });
  } catch (error) {
    console.error("Update school policy error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update school point policy",
      error: error.message,
    });
  }
};
