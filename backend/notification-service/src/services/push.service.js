const mongoose = require("mongoose");
let admin;

try {
  // Try to import Firebase Admin SDK
  admin = require("firebase-admin");

  // Initialize Firebase Admin SDK if not already initialized
  if (!admin.apps.length) {
    try {
      // First try environment variable
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase initialized with environment credentials");
      }
      // Then try file
      else {
        try {
          const serviceAccount = require("../config/firebase-service-account.json");
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          console.log("Firebase initialized with service account file");
        } catch (fileError) {
          console.warn(
            "Firebase service account file not found. Push notifications will be logged but not sent."
          );
          // Don't throw - continue without Firebase
        }
      }
    } catch (initError) {
      console.warn("Failed to initialize Firebase:", initError.message);
    }
  }
} catch (importError) {
  console.warn(
    "Firebase Admin SDK not installed. Push notifications will be logged but not sent."
  );
  // Create dummy admin object
  admin = {
    messaging: () => ({
      sendMulticast: async () => ({
        successCount: 0,
        failureCount: 0,
        responses: [],
      }),
      send: async () => "dummy-message-id",
    }),
  };
}

/**
 * Get user's device tokens from database
 * @param {string} userId - User ID
 * @returns {Promise<string[]>} - Array of device tokens
 */
const getUserDeviceTokens = async (userId) => {
  try {
    // Assuming we have a UserDevice model that stores device tokens
    // You may need to create this model or use a different approach
    const UserDevice = mongoose.model("UserDevice");
    const devices = await UserDevice.find({ userId, active: true });
    return devices.map((device) => device.token);
  } catch (error) {
    console.error("Error fetching user device tokens:", error);
    return [];
  }
};

/**
 * Send push notification to a user's devices
 * @param {string} userId - User ID
 * @param {string} title - Notification title
 * @param {string} content - Notification content/body
 * @param {object} data - Additional data to send
 * @returns {Promise<object>} - Send result
 */
const sendPushNotification = async (userId, title, content, data = {}) => {
  try {
    // Get user's device tokens
    const deviceTokens = await getUserDeviceTokens(userId);

    if (!deviceTokens.length) {
      console.log(`No active devices found for user ${userId}`);
      return {
        success: false,
        message: "No active devices found",
      };
    }

    // Always log the notification for debugging
    console.log(`[PUSH] Sending to user ${userId}:`);
    console.log(`[PUSH] Title: ${title}`);
    console.log(`[PUSH] Content: ${content}`);

    // If Firebase is not fully initialized, just log and return success
    if (!admin.apps || !admin.apps.length) {
      console.log(
        "[PUSH] Firebase not initialized - notification would be sent to",
        deviceTokens.length,
        "devices"
      );
      return {
        success: true,
        messageId: `dummy-${Date.now()}`,
        provider: "none",
        info: "Firebase not initialized, push notification logged only",
      };
    }

    // Prepare notification message
    const message = {
      notification: {
        title,
        body: content,
      },
      data: {
        ...data,
        // Ensure all values are strings as required by FCM
        userId: userId.toString(),
        timestamp: Date.now().toString(),
        type: data.type || "notification",
      },
      tokens: deviceTokens,
      // Set high priority for time-sensitive notifications
      android: {
        priority: "high",
      },
      apns: {
        headers: {
          "apns-priority": "10",
        },
      },
    };

    // Send the message
    const response = await admin.messaging().sendMulticast(message);

    // Return success with details
    return {
      success: true,
      messageId: response.responses[0]?.messageId || "unknown",
      successCount: response.successCount,
      failureCount: response.failureCount,
      provider: "firebase",
    };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send push notification to a topic
 * @param {string} topic - Topic name
 * @param {string} title - Notification title
 * @param {string} content - Notification content/body
 * @param {object} data - Additional data to send
 * @returns {Promise<object>} - Send result
 */
const sendTopicNotification = async (topic, title, content, data = {}) => {
  try {
    // Prepare notification message
    const message = {
      notification: {
        title,
        body: content,
      },
      data: {
        ...data,
        timestamp: Date.now().toString(),
      },
      topic,
      android: {
        priority: "high",
      },
      apns: {
        headers: {
          "apns-priority": "10",
        },
      },
    };

    // Send the message
    const response = await admin.messaging().send(message);

    return {
      success: true,
      messageId: response,
      provider: "firebase",
    };
  } catch (error) {
    console.error("Error sending topic notification:", error);
    throw error;
  }
};

module.exports = {
  sendPushNotification,
  sendTopicNotification,
};
