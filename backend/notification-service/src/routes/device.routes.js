const express = require("express");
const router = express.Router();
const deviceController = require("../controllers/userDevice.controller");
const authMiddleware = require("../middleware/auth.middleware");

/**
 * @openapi
 * components:
 *   schemas:
 *     UserDevice:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the device
 *         userId:
 *           type: string
 *           description: ID of the user who owns this device
 *         token:
 *           type: string
 *           description: Push notification token for the device
 *         deviceType:
 *           type: string
 *           enum: [ios, android, web, other]
 *           description: Type of device
 *         deviceModel:
 *           type: string
 *           description: Model name of the device
 *         deviceName:
 *           type: string
 *           description: Custom name for the device
 *         osVersion:
 *           type: string
 *           description: Operating system version
 *         appVersion:
 *           type: string
 *           description: App version installed on the device
 *         active:
 *           type: boolean
 *           description: Whether the device is currently active
 *           default: true
 *         lastActive:
 *           type: string
 *           format: date-time
 *           description: When the device was last active
 *         notificationEnabled:
 *           type: boolean
 *           description: Whether notifications are enabled for this device
 *           default: true
 *         language:
 *           type: string
 *           description: Preferred language for notifications
 *           default: "en"
 *         timezone:
 *           type: string
 *           description: Device timezone
 *           default: "UTC"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the device was first registered
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the device was last updated
 *     DeviceRegister:
 *       type: object
 *       required:
 *         - token
 *         - deviceType
 *       properties:
 *         token:
 *           type: string
 *           description: Push notification token from FCM or APNS
 *           example: "fcm:APA91bHun4MxP5egoKMwt2KZFBaFUH-1RYqx..."
 *         deviceType:
 *           type: string
 *           enum: [ios, android, web, other]
 *           description: Type of device
 *           example: "android"
 *         deviceModel:
 *           type: string
 *           description: Model of the device
 *           example: "Pixel 6"
 *         deviceName:
 *           type: string
 *           description: Name of the device
 *           example: "My Phone"
 *         osVersion:
 *           type: string
 *           description: OS version of the device
 *           example: "Android 12"
 *         appVersion:
 *           type: string
 *           description: Version of the app
 *           example: "1.2.0"
 *     DeviceUpdate:
 *       type: object
 *       properties:
 *         active:
 *           type: boolean
 *           description: Whether the device is active
 *         notificationEnabled:
 *           type: boolean
 *           description: Whether notifications are enabled
 *         language:
 *           type: string
 *           description: Preferred language
 *           example: "en"
 *         timezone:
 *           type: string
 *           description: User's timezone
 *           example: "America/New_York"
 */

// Public routes
router.get("/health", (req, res) => {
  res.status(200).json({ message: "Device routes are working" });
});

/**
 * @openapi
 * /notifications/devices/register:
 *   post:
 *     summary: Register a device for push notifications
 *     description: Register a new device or update an existing device if the token already exists
 *     tags:
 *       - Notification Devices
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Device registration details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeviceRegister'
 *     responses:
 *       '201':
 *         description: Device registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Device registered successfully"
 *                 data:
 *                   $ref: '#/components/schemas/UserDevice'
 *       '200':
 *         description: Device updated successfully (token already existed)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Device updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/UserDevice'
 *       '400':
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Device token and device type are required"
 *       '500':
 *         description: Failed to register device
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to register device"
 *                 error:
 *                   type: string
 */
router.post(
  "/register",
  authMiddleware.verifyToken,
  deviceController.registerDevice
);

/**
 * @openapi
 * /notifications/devices/me:
 *   get:
 *     summary: Get user's devices
 *     description: Retrieves all devices registered for the current user
 *     tags:
 *       - Notification Devices
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Devices retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserDevice'
 *       '500':
 *         description: Failed to get user devices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to get user devices"
 *                 error:
 *                   type: string
 */
router.get("/me", authMiddleware.verifyToken, deviceController.getMyDevices);

/**
 * @openapi
 * /notifications/devices/{id}:
 *   put:
 *     summary: Update a device
 *     description: Update a specific device's settings (e.g., active status, notification preferences)
 *     tags:
 *       - Notification Devices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the device to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated device settings
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeviceUpdate'
 *     responses:
 *       '200':
 *         description: Device updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Device updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/UserDevice'
 *       '403':
 *         description: Not authorized to update this device
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Not authorized to update this device"
 *       '404':
 *         description: Device not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Device not found"
 *       '500':
 *         description: Failed to update device
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to update device"
 *                 error:
 *                   type: string
 */
router.put("/:id", authMiddleware.verifyToken, deviceController.updateDevice);

/**
 * @openapi
 * /notifications/devices/{id}:
 *   delete:
 *     summary: Delete a device
 *     description: Remove a device from the user's registered devices
 *     tags:
 *       - Notification Devices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the device to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Device deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Device deleted successfully"
 *       '403':
 *         description: Not authorized to delete this device
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Not authorized to delete this device"
 *       '404':
 *         description: Device not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Device not found"
 *       '500':
 *         description: Failed to delete device
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to delete device"
 *                 error:
 *                   type: string
 */
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  deviceController.deleteDevice
);

module.exports = router;
