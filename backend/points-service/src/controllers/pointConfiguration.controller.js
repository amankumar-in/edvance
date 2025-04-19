const PointConfiguration = require("../models/pointConfiguration.model");

// Get active point configuration
exports.getActiveConfiguration = async (req, res) => {
  try {
    const config = await PointConfiguration.getActive();

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Get configuration error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get point configuration",
      error: error.message,
    });
  }
};

// Get configuration history
exports.getConfigurationHistory = async (req, res) => {
  try {
    // Only platform admins can see history
    if (!req.user.roles.includes("platform_admin")) {
      return res.status(403).json({
        success: false,
        message: "Access denied: platform admin only",
      });
    }

    const history = await PointConfiguration.find()
      .sort({ version: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Get configuration history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get configuration history",
      error: error.message,
    });
  }
};

// Create new configuration version
exports.updateConfiguration = async (req, res) => {
  try {
    // Only platform admins can update configuration
    if (!req.user.roles.includes("platform_admin")) {
      return res.status(403).json({
        success: false,
        message: "Only platform administrators can update point configuration",
      });
    }

    const updatedData = req.body;
    const updatedBy = req.user.id;

    // Create new version
    const newConfig = await PointConfiguration.createNewVersion(
      updatedData,
      updatedBy
    );

    res.status(200).json({
      success: true,
      message: "Point configuration updated successfully",
      data: newConfig,
    });
  } catch (error) {
    console.error("Update configuration error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update point configuration",
      error: error.message,
    });
  }
};

// Get specific configuration version
exports.getConfigurationVersion = async (req, res) => {
  try {
    const { version } = req.params;

    // Only platform admins can access specific versions
    if (!req.user.roles.includes("platform_admin")) {
      return res.status(403).json({
        success: false,
        message: "Access denied: platform admin only",
      });
    }

    const config = await PointConfiguration.findOne({
      version: parseInt(version),
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Configuration version not found",
      });
    }

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Get configuration version error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get configuration version",
      error: error.message,
    });
  }
};

// Activate specific configuration version
exports.activateConfigurationVersion = async (req, res) => {
  try {
    const { version } = req.params;

    // Only platform admins can activate versions
    if (!req.user.roles.includes("platform_admin")) {
      return res.status(403).json({
        success: false,
        message:
          "Only platform administrators can activate configuration versions",
      });
    }

    // Find the version to activate
    const configToActivate = await PointConfiguration.findOne({
      version: parseInt(version),
    });

    if (!configToActivate) {
      return res.status(404).json({
        success: false,
        message: "Configuration version not found",
      });
    }

    // Deactivate current active configuration
    await PointConfiguration.updateMany(
      { isActive: true },
      { isActive: false }
    );

    // Activate the selected version
    configToActivate.isActive = true;
    configToActivate.updatedBy = req.user.id;
    configToActivate.updatedAt = new Date();
    await configToActivate.save();

    res.status(200).json({
      success: true,
      message: `Configuration version ${version} activated successfully`,
      data: configToActivate,
    });
  } catch (error) {
    console.error("Activate configuration version error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to activate configuration version",
      error: error.message,
    });
  }
};

// Add a new level
exports.addOrUpdateLevel = async (req, res) => {
  try {
    const { level, threshold, name } = req.body;

    // Validate input
    if (!level || level < 2 || level > 100 || !threshold) {
      return res.status(400).json({
        success: false,
        message: "Valid level number (2-100) and threshold are required",
      });
    }

    // Only platform admins can manage levels
    if (!req.user.roles.includes("platform_admin")) {
      return res.status(403).json({
        success: false,
        message: "Only platform administrators can manage levels",
      });
    }

    // Get current configuration
    const currentConfig = await PointConfiguration.getActive();

    // Prepare updated data
    const updatedData = {
      levelProgression: currentConfig.levelProgression,
      levelNames: currentConfig.levelNames,
    };

    // Update the level threshold
    updatedData.levelProgression.set(level.toString(), threshold);

    // Update the level name if provided
    if (name) {
      // Admin provided a custom name
      updatedData.levelNames.set(level.toString(), name);
    } else if (!updatedData.levelNames.has(level.toString())) {
      // Auto-generate a name for new levels
      updatedData.levelNames.set(level.toString(), `Level ${level} Scholar`);
    }

    // Update max level if needed
    if (level > currentConfig.maxLevel) {
      updatedData.maxLevel = level;
    }

    // Create new configuration version
    const newConfig = await PointConfiguration.createNewVersion(
      updatedData,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: `Level ${level} added/updated successfully`,
      data: {
        level,
        threshold,
        name: name || updatedData.levelNames.get(level.toString()),
      },
    });
  } catch (error) {
    console.error("Add/update level error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add/update level",
      error: error.message,
    });
  }
};

// Delete a level
exports.deleteLevel = async (req, res) => {
  try {
    const { level } = req.params;

    // Only platform admins can manage levels
    if (!req.user.roles.includes("platform_admin")) {
      return res.status(403).json({
        success: false,
        message: "Only platform administrators can manage levels",
      });
    }

    // Cannot delete levels below 10
    if (parseInt(level) <= 10) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete core levels (1-10)",
      });
    }

    // Get current configuration
    const currentConfig = await PointConfiguration.getActive();

    // Check if level exists
    if (!currentConfig.levelProgression.has(level)) {
      return res.status(404).json({
        success: false,
        message: `Level ${level} not found`,
      });
    }

    // Prepare updated data
    const updatedData = {
      levelProgression: currentConfig.levelProgression,
      levelNames: currentConfig.levelNames,
    };

    // Delete the level
    updatedData.levelProgression.delete(level);
    updatedData.levelNames.delete(level);

    // Update max level if needed
    if (parseInt(level) >= currentConfig.maxLevel) {
      // Find the new max level
      let newMax = 10;
      for (const levelKey of updatedData.levelProgression.keys()) {
        const levelNum = parseInt(levelKey);
        if (levelNum > newMax) {
          newMax = levelNum;
        }
      }
      updatedData.maxLevel = newMax;
    }

    // Create new configuration version
    const newConfig = await PointConfiguration.createNewVersion(
      updatedData,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: `Level ${level} deleted successfully`,
      data: {
        maxLevel: newConfig.maxLevel,
      },
    });
  } catch (error) {
    console.error("Delete level error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete level",
      error: error.message,
    });
  }
};

// Get all levels
exports.getAllLevels = async (req, res) => {
  try {
    // Get current configuration
    const config = await PointConfiguration.getActive();

    // Build response data
    const levels = [];

    for (let i = 1; i <= config.maxLevel; i++) {
      const level = i.toString();

      // Level 1 is always 0 points
      const threshold =
        i === 1 ? 0 : config.levelProgression.get(level) || null;

      if (i === 1 || threshold !== null) {
        levels.push({
          level: i,
          threshold,
          name: config.levelNames.get(level) || `Level ${i}`,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        levels,
        maxLevel: config.maxLevel,
      },
    });
  } catch (error) {
    console.error("Get levels error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get levels",
      error: error.message,
    });
  }
};
