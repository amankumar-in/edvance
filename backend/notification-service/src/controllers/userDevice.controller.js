const UserDevice = require("../models/userDevice.model");

// Register a new device or update if token already exists
exports.registerDevice = async (req, res) => {
  try {
    const {
      token,
      deviceType,
      deviceModel,
      deviceName,
      osVersion,
      appVersion,
    } = req.body;
    const userId = req.user.id;

    if (!token || !deviceType) {
      return res.status(400).json({
        success: false,
        message: "Device token and device type are required",
      });
    }

    // Check if device with this token already exists
    let device = await UserDevice.findOne({ token });

    if (device) {
      // Update existing device
      device.userId = userId;
      device.deviceType = deviceType;
      device.deviceModel = deviceModel || device.deviceModel;
      device.deviceName = deviceName || device.deviceName;
      device.osVersion = osVersion || device.osVersion;
      device.appVersion = appVersion || device.appVersion;
      device.active = true;
      device.lastActive = new Date();

      await device.save();

      return res.status(200).json({
        success: true,
        message: "Device updated successfully",
        data: device,
      });
    }

    // Create new device
    device = new UserDevice({
      userId,
      token,
      deviceType,
      deviceModel,
      deviceName,
      osVersion,
      appVersion,
      active: true,
      lastActive: new Date(),
    });

    await device.save();

    res.status(201).json({
      success: true,
      message: "Device registered successfully",
      data: device,
    });
  } catch (error) {
    console.error("Error registering device:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register device",
      error: error.message,
    });
  }
};

// Get all devices for the current user
exports.getMyDevices = async (req, res) => {
  try {
    const userId = req.user.id;

    const devices = await UserDevice.find({ userId });

    res.status(200).json({
      success: true,
      data: devices,
    });
  } catch (error) {
    console.error("Error getting user devices:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user devices",
      error: error.message,
    });
  }
};

// Update a device (e.g., mark as inactive)
exports.updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Find device and check ownership
    const device = await UserDevice.findById(id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    // Ensure user owns this device
    if (device.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this device",
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      "active",
      "notificationEnabled",
      "language",
      "timezone",
    ];
    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        device[field] = updates[field];
      }
    });

    device.lastActive = new Date();
    await device.save();

    res.status(200).json({
      success: true,
      message: "Device updated successfully",
      data: device,
    });
  } catch (error) {
    console.error("Error updating device:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update device",
      error: error.message,
    });
  }
};

// Delete a device
exports.deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find device and check ownership
    const device = await UserDevice.findById(id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    // Ensure user owns this device
    if (device.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this device",
      });
    }

    await device.deleteOne();

    res.status(200).json({
      success: true,
      message: "Device deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting device:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete device",
      error: error.message,
    });
  }
};
