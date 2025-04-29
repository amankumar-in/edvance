const Notification = require("../models/notification.model");
const NotificationTemplate = require("../models/notificationTemplate.model");
const NotificationPreference = require("../models/notificationPreference.model");
const emailService = require("./email.service");
const pushService = require("./push.service");

/**
 * Create and send a notification
 * @param {String} userId - Recipient user ID
 * @param {String} type - Notification type
 * @param {Object} data - Data to populate the template
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Created notification
 */
const sendNotification = async (userId, type, data, options = {}) => {
  try {
    // Get user's notification preferences
    const userPreferences =
      (await NotificationPreference.findOne({ userId })) ||
      (await createDefaultPreferences(userId));

    // Check if user has enabled this notification type
    let typePreference;

    // Map notification type to preference structure
    if (type.startsWith("task")) {
      if (type === "task.assignment")
        typePreference = userPreferences.preferences.taskAssignment;
      else if (type === "task.reminder")
        typePreference = userPreferences.preferences.taskReminder;
      else if (type === "task.approval")
        typePreference = userPreferences.preferences.taskApproval;
    } else if (type.startsWith("point")) {
      if (type === "point.earned")
        typePreference = userPreferences.preferences.pointsEarned;
      else if (type === "point.levelUp")
        typePreference = userPreferences.preferences.levelUp;
    }
    // Additional mappings would be added for other notification types

    if (!typePreference || !typePreference.enabled) {
      console.log(`Notification ${type} disabled for user ${userId}`);
      return null;
    }

    // Get notification template
    const template = await NotificationTemplate.findOne({ type });
    if (!template) {
      console.error(`Template not found for notification type: ${type}`);
      return null;
    }

    // Create notification content by filling template with data
    const content = populateTemplate(template.content, data);
    const title = populateTemplate(template.title, data);

    // Create notification record
    const notification = new Notification({
      userId,
      type,
      title,
      content,
      sourceType: type,
      sourceId: data.sourceId || null,
      priority: options.priority || "normal",
      expiresAt: options.expiresAt,
      metadata: data,
      actionLink: data.actionLink,
      actionText: data.actionText,
    });

    await notification.save();

    // Deliver through selected channels based on user preferences
    const deliveryPromises = [];

    // In-app notifications are always stored (we just created the record)

    // Email notifications
    if (typePreference.email && options.recipientEmail) {
      deliveryPromises.push(
        emailService.sendEmail(
          options.recipientEmail,
          title,
          content,
          template.emailTemplate
        )
      );
    }

    // Push notifications
    if (typePreference.push) {
      deliveryPromises.push(
        pushService.sendPushNotification(userId, title, content, data)
      );
    }

    // Wait for all deliveries to complete
    await Promise.allSettled(deliveryPromises);

    return notification;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

/**
 * Create default notification preferences for a user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Created preferences
 */
const createDefaultPreferences = async (userId) => {
  try {
    // Get all notification types
    const templates = await NotificationTemplate.find({});

    // Create preferences object with all notification types enabled
    const preferences = {};
    templates.forEach((template) => {
      preferences[template.type] = {
        enabled: true,
        email: true,
        push: true,
        sms: false,
      };
    });

    // Create preferences record
    const notificationPreference = new NotificationPreference({
      userId,
      preferences,
    });

    await notificationPreference.save();
    return notificationPreference;
  } catch (error) {
    console.error("Error creating default preferences:", error);
    throw error;
  }
};

/**
 * Send a notification to multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {String} type - Notification type
 * @param {Object} data - Data to populate the template
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} Created notifications
 */
const sendBulkNotification = async (userIds, type, data, options = {}) => {
  try {
    const promises = userIds.map((userId) =>
      sendNotification(userId, type, data, options)
    );
    return await Promise.allSettled(promises);
  } catch (error) {
    console.error("Error sending bulk notification:", error);
    throw error;
  }
};

/**
 * Send a notification to all users with a specific role
 * @param {String} role - User role
 * @param {String} type - Notification type
 * @param {Object} data - Data to populate the template
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} Created notifications
 */
const sendRoleNotification = async (role, type, data, options = {}) => {
  try {
    // This requires fetching users by role from the user service
    // For now, we'll assume we already have the userIds
    const userIds = options.userIds || [];
    return await sendBulkNotification(userIds, type, data, options);
  } catch (error) {
    console.error("Error sending role notification:", error);
    throw error;
  }
};

/**
 * Populate a template with data
 * @param {String} template - Template string with placeholders
 * @param {Object} data - Data to fill placeholders
 * @returns {String} Populated template
 */
const populateTemplate = (template, data) => {
  return template.replace(/{{(.*?)}}/g, (match, key) => {
    const keys = key.trim().split(".");
    let value = data;

    for (const k of keys) {
      if (value === undefined || value === null) return match;
      value = value[k];
    }

    return value !== undefined && value !== null ? value : match;
  });
};

/**
 * Mark notifications as read
 * @param {String} userId - User ID
 * @param {Array} notificationIds - Array of notification IDs to mark as read
 * @returns {Promise<Object>} Update result
 */
const markAsRead = async (userId, notificationIds) => {
  try {
    const result = await Notification.updateMany(
      { _id: { $in: notificationIds }, userId },
      { $set: { read: true, readAt: new Date() } }
    );

    return result;
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw error;
  }
};

/**
 * Delete notifications
 * @param {String} userId - User ID
 * @param {Array} notificationIds - Array of notification IDs to delete
 * @returns {Promise<Object>} Deletion result
 */
const deleteNotifications = async (userId, notificationIds) => {
  try {
    const result = await Notification.deleteMany({
      _id: { $in: notificationIds },
      userId,
    });

    return result;
  } catch (error) {
    console.error("Error deleting notifications:", error);
    throw error;
  }
};

module.exports = {
  sendNotification,
  sendBulkNotification,
  sendRoleNotification,
  markAsRead,
  deleteNotifications,
  createDefaultPreferences,
};
