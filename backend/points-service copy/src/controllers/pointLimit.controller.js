const PointLimit = require("../models/pointLimit.model");

// Get point limits
exports.getLimits = async (req, res) => {
  try {
    const { scope, entityId } = req.query;

    // Build query
    const query = {};
    if (scope) {
      query.scope = scope;
    }
    if (entityId) {
      query.entityId = entityId;
    }

    // If no query parameters, return all limits
    const limits = await PointLimit.find(query);

    res.status(200).json({
      success: true,
      data: limits,
    });
  } catch (error) {
    console.error("Get point limits error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get point limits",
      error: error.message,
    });
  }
};

// Create or update point limit
exports.createOrUpdateLimit = async (req, res) => {
  try {
    const { scope, entityId, limits, sourceLimits } = req.body;

    if (!scope) {
      return res.status(400).json({
        success: false,
        message: "Scope is required",
      });
    }

    if (scope !== "global" && !entityId) {
      return res.status(400).json({
        success: false,
        message: "Entity ID is required for non-global scope",
      });
    }

    // Check for permissions - only allow platform admin for global and school limits
    const isPlatformAdmin = req.user.roles.includes("platform_admin");
    const isSchoolAdmin = req.user.roles.includes("school_admin");

    if (scope === "global" && !isPlatformAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only platform administrators can set global limits",
      });
    }

    if (scope === "school" && !isPlatformAdmin && !isSchoolAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only administrators can set school limits",
      });
    }

    // Find existing limit or create new one
    let pointLimit = await PointLimit.findOne({
      scope,
      entityId: scope === "global" ? null : entityId,
    });

    if (!pointLimit) {
      pointLimit = new PointLimit({
        scope,
        entityId: scope === "global" ? null : entityId,
      });
    }

    // Update limit fields
    if (limits) {
      // Update daily limit
      if (limits.daily) {
        if (limits.daily.enabled !== undefined) {
          pointLimit.limits.daily.enabled = limits.daily.enabled;
        }
        if (limits.daily.maxPoints !== undefined) {
          pointLimit.limits.daily.maxPoints = limits.daily.maxPoints;
        }
      }

      // Update weekly limit
      if (limits.weekly) {
        if (limits.weekly.enabled !== undefined) {
          pointLimit.limits.weekly.enabled = limits.weekly.enabled;
        }
        if (limits.weekly.maxPoints !== undefined) {
          pointLimit.limits.weekly.maxPoints = limits.weekly.maxPoints;
        }
      }

      // Update monthly limit
      if (limits.monthly) {
        if (limits.monthly.enabled !== undefined) {
          pointLimit.limits.monthly.enabled = limits.monthly.enabled;
        }
        if (limits.monthly.maxPoints !== undefined) {
          pointLimit.limits.monthly.maxPoints = limits.monthly.maxPoints;
        }
      }
    }

    // Update source-specific limits
    if (sourceLimits) {
      // Update attendance limits
      if (sourceLimits.attendance && sourceLimits.attendance.daily) {
        if (sourceLimits.attendance.daily.enabled !== undefined) {
          pointLimit.sourceLimits.attendance.daily.enabled =
            sourceLimits.attendance.daily.enabled;
        }
        if (sourceLimits.attendance.daily.maxPoints !== undefined) {
          pointLimit.sourceLimits.attendance.daily.maxPoints =
            sourceLimits.attendance.daily.maxPoints;
        }
      }

      // Update task limits
      if (sourceLimits.task && sourceLimits.task.daily) {
        if (sourceLimits.task.daily.enabled !== undefined) {
          pointLimit.sourceLimits.task.daily.enabled =
            sourceLimits.task.daily.enabled;
        }
        if (sourceLimits.task.daily.maxPoints !== undefined) {
          pointLimit.sourceLimits.task.daily.maxPoints =
            sourceLimits.task.daily.maxPoints;
        }
      }
    }

    pointLimit.updatedAt = Date.now();
    await pointLimit.save();

    res.status(200).json({
      success: true,
      message: "Point limit updated successfully",
      data: pointLimit,
    });
  } catch (error) {
    console.error("Update point limit error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update point limit",
      error: error.message,
    });
  }
};

// Delete point limit
exports.deleteLimit = async (req, res) => {
  try {
    const { id } = req.params;

    // Only platform admins can delete limits
    if (!req.user.roles.includes("platform_admin")) {
      return res.status(403).json({
        success: false,
        message: "Only platform administrators can delete limits",
      });
    }

    // Find and delete the limit
    const pointLimit = await PointLimit.findByIdAndDelete(id);

    if (!pointLimit) {
      return res.status(404).json({
        success: false,
        message: "Point limit not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Point limit deleted successfully",
    });
  } catch (error) {
    console.error("Delete point limit error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete point limit",
      error: error.message,
    });
  }
};

// Get applicable limit for student
exports.getStudentLimit = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { schoolId } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // Get applicable limit
    const limit = await PointLimit.getApplicableLimit(studentId, schoolId);

    res.status(200).json({
      success: true,
      data: limit,
    });
  } catch (error) {
    console.error("Get student limit error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get student limit",
      error: error.message,
    });
  }
};
