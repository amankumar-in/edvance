const NotificationPreference = require("../models/notificationPreference.model");

// Get the authenticated user's notification preferences
exports.getMyPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find preferences for the user
    let preferences = await NotificationPreference.findOne({ userId });

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await createDefaultPreferences(userId);
    }

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error("Get preferences error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get notification preferences",
      error: error.message,
    });
  }
};

// Update the user's notification preferences
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Input validation
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No updates provided",
      });
    }

    // Find preferences and update them
    let preferences = await NotificationPreference.findOne({ userId });

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await createDefaultPreferences(userId);
    }

    // Update valid fields
    const validUpdateFields = [
      "enabled",
      "channels",
      "quietHours",
      "preferences",
    ];

    validUpdateFields.forEach((field) => {
      if (updates[field] !== undefined) {
        if (
          field === "channels" ||
          field === "quietHours" ||
          field === "preferences"
        ) {
          // For nested objects, update individual fields
          for (const subField in updates[field]) {
            if (updates[field][subField] !== undefined) {
              if (
                typeof updates[field][subField] === "object" &&
                !Array.isArray(updates[field][subField])
              ) {
                preferences[field][subField] = {
                  ...preferences[field][subField],
                  ...updates[field][subField],
                };
              } else {
                preferences[field][subField] = updates[field][subField];
              }
            }
          }
        } else {
          preferences[field] = updates[field];
        }
      }
    });

    preferences.updatedAt = Date.now();
    await preferences.save();

    res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      data: preferences,
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification preferences",
      error: error.message,
    });
  }
};

// Reset user's preferences to default values
exports.resetPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete existing preferences
    await NotificationPreference.findOneAndDelete({ userId });

    // Create new default preferences
    const preferences = await createDefaultPreferences(userId);

    res.status(200).json({
      success: true,
      message: "Notification preferences reset to default",
      data: preferences,
    });
  } catch (error) {
    console.error("Reset preferences error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset notification preferences",
      error: error.message,
    });
  }
};

// Get preferences for a specific user (admin only)
exports.getUserPreferences = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find preferences for the specified user
    let preferences = await NotificationPreference.findOne({ userId });

    // If no preferences exist, return default structure
    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: "Notification preferences not found for this user",
      });
    }

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error("Get user preferences error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user notification preferences",
      error: error.message,
    });
  }
};

// Helper function to create default preferences
const createDefaultPreferences = async (userId) => {
  const defaultPreferences = new NotificationPreference({
    userId,
    email: true,
    push: true,
    inApp: true,
    sms: false,
    taskNotifications: {
      assigned: true,
      reminder: true,
      completed: true,
      approved: true,
      rejected: true,
    },
    pointNotifications: {
      earned: true,
      spent: true,
      levelUp: true,
    },
    badgeNotifications: {
      earned: true,
      collection: true,
    },
    rewardNotifications: {
      available: true,
      redeemed: true,
      fulfilled: true,
    },
    systemNotifications: {
      announcement: true,
      maintenance: true,
    },
    allNotifications: true,
    digestFrequency: "daily", // Options: immediate, daily, weekly
    quietHoursStart: "22:00", // 10 PM
    quietHoursEnd: "08:00", // 8 AM
  });

  await defaultPreferences.save();
  return defaultPreferences;
};

// Set default preferences for all users in a role (platform admin only)
exports.setRoleDefaults = async (req, res) => {
  try {
    const { role } = req.params;
    const defaults = req.body;

    if (
      !role ||
      ![
        "student",
        "parent",
        "teacher",
        "school_admin",
        "social_worker",
        "platform_admin",
      ].includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
    }

    // Store the default preferences for this role
    // This would typically be stored in a separate defaults collection
    // or as a system configuration setting

    // For demonstration, we're just returning success
    // In a real implementation, you would save this to a configuration collection

    res.status(200).json({
      success: true,
      message: `Default notification preferences set for ${role} role`,
      data: { role, defaults },
    });
  } catch (error) {
    console.error("Set role defaults error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set role default preferences",
      error: error.message,
    });
  }
};
