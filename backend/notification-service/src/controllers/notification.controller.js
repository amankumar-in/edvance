const Notification = require("../models/notification.model");
const NotificationTemplate = require("../models/notificationTemplate.model");
const NotificationService = require("../services/notification.service");

/**
 * Send a notification to a specific user
 */
exports.sendNotification = async (req, res) => {
  try {
    const { userId, templateId, data, channels } = req.body;

    if (!userId || !templateId) {
      return res.status(400).json({
        success: false,
        message: "User ID and template ID are required",
      });
    }

    // Get the template
    const template = await NotificationTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Notification template not found",
      });
    }

    // Send the notification using the service
    const result = await NotificationService.sendNotification(
      userId,
      template.eventType,
      data,
      {
        recipientEmail: data.email,
        channels: channels || template.channels,
      }
    );

    res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("Send notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: error.message,
    });
  }
};

/**
 * Send a notification to multiple users
 */
exports.sendBulkNotifications = async (req, res) => {
  try {
    const { userIds, templateId, data, channels } = req.body;

    if (!userIds || !userIds.length || !templateId) {
      return res.status(400).json({
        success: false,
        message: "User IDs array and template ID are required",
      });
    }

    // Get the template
    const template = await NotificationTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Notification template not found",
      });
    }

    // Send notifications to multiple users
    const results = await NotificationService.sendBulkNotification(
      userIds,
      template.eventType,
      data,
      {
        recipientEmail: data.email,
        channels: channels || template.channels,
      }
    );

    res.status(201).json({
      success: true,
      message: `${results.length} notifications sent successfully`,
      data: {
        successCount: results.filter((r) => r.success).length,
        failureCount: results.filter((r) => !r.success).length,
      },
    });
  } catch (error) {
    console.error("Send bulk notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send bulk notifications",
      error: error.message,
    });
  }
};

/**
 * Get notifications for the current user
 */
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { userId };
    if (unreadOnly === "true") {
      query.read = false;
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
    };

    // Get paginated results
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);

    // Get total count for pagination
    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          total,
          page: options.page,
          limit: options.limit,
          pages: Math.ceil(total / options.limit),
        },
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get notifications",
      error: error.message,
    });
  }
};

/**
 * Get notifications for a specific user (admin only)
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const query = { userId };
    if (unreadOnly === "true") {
      query.read = false;
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
    };

    // Get paginated results
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);

    // Get total count for pagination
    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          total,
          page: options.page,
          limit: options.limit,
          pages: Math.ceil(total / options.limit),
        },
      },
    });
  } catch (error) {
    console.error("Get user notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user notifications",
      error: error.message,
    });
  }
};

/**
 * Get unread notifications count for the current user
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.countDocuments({
      userId,
      read: false,
    });

    res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
      error: error.message,
    });
  }
};

/**
 * Mark a notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
    }

    // Find the notification and check ownership
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Ensure user owns this notification
    if (notification.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this notification",
      });
    }

    // Update the notification
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

/**
 * Mark all notifications as read for the current user
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: { modifiedCount: result.nModified || result.modifiedCount || 0 },
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};

/**
 * Delete a notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
    }

    // Find the notification and check ownership
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Ensure user owns this notification
    if (notification.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this notification",
      });
    }

    // Delete the notification
    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

/**
 * Delete all notifications for the current user
 */
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: "All notifications deleted successfully",
      data: { deletedCount: result.deletedCount || 0 },
    });
  } catch (error) {
    console.error("Delete all notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete all notifications",
      error: error.message,
    });
  }
};
