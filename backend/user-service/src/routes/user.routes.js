const express = require("express");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const uploadMiddleware = require("../middleware/upload.middleware");

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the user
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *             enum: [student, parent, teacher, school_admin, social_worker, platform_admin]
 *           description: User's roles in the system
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: User's date of birth
 *         avatar:
 *           type: string
 *           description: URL to user's avatar image
 *         phoneNumber:
 *           type: string
 *           description: User's phone number
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Account update timestamp
 *         isActive:
 *           type: boolean
 *           description: Whether the user account is active
 */

/**
 * @openapi
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieves the profile for the currently authenticated user including role-specific profile if available
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     roleProfile:
 *                       type: object
 *                       description: Role-specific profile information (student, parent, teacher, etc.)
 *       '404':
 *         description: User not found
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
 *                   example: "User not found"
 *       '500':
 *         description: Failed to get user profile
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
 *                   example: "Failed to get user profile"
 *                 error:
 *                   type: string
 */
router.get("/me", authMiddleware.verifyToken, userController.getProfile);

/**
 * @openapi
 * /users/me:
 *   put:
 *     summary: Update current user profile
 *     description: Updates the basic profile information for the currently authenticated user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: User profile data to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *                 example: "Smith"
 *               phoneNumber:
 *                 type: string
 *                 description: User's phone number
 *                 example: "+1234567890"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: User's date of birth
 *                 example: "2000-01-01"
 *     responses:
 *       '200':
 *         description: Profile updated successfully
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
 *                   example: "Profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       '404':
 *         description: User not found
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
 *                   example: "User not found"
 *       '500':
 *         description: Failed to update profile
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
 *                   example: "Failed to update profile"
 *                 error:
 *                   type: string
 */
router.put("/me", authMiddleware.verifyToken, userController.updateProfile);

/**
 * @openapi
 * /users/me/password:
 *   put:
 *     summary: Change user password
 *     description: Updates the password for the currently authenticated user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Current and new password
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: User's current password
 *                 example: "CurrentPassword123"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: User's new password
 *                 example: "NewPassword456"
 *             required:
 *               - currentPassword
 *               - newPassword
 *     responses:
 *       '200':
 *         description: Password changed successfully
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
 *                   example: "Password changed successfully"
 *       '400':
 *         description: Current password and new password are required
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
 *                   example: "Current password and new password are required"
 *       '401':
 *         description: Current password is incorrect
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
 *                   example: "Current password is incorrect"
 *       '404':
 *         description: User not found
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
 *                   example: "User not found"
 *       '500':
 *         description: Failed to change password
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
 *                   example: "Failed to change password"
 *                 error:
 *                   type: string
 */
router.put(
  "/me/password",
  authMiddleware.verifyToken,
  userController.changePassword
);

/**
 * @openapi
 * /users/me/avatar:
 *   post:
 *     summary: Upload user avatar
 *     description: Uploads a profile image for the currently authenticated user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Avatar image file
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file (jpg, jpeg, png, gif)
 *             required:
 *               - file
 *     responses:
 *       '200':
 *         description: Avatar updated successfully
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
 *                   example: "Avatar updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     avatar:
 *                       type: string
 *                       description: URL to the uploaded avatar
 *                       example: "http://localhost:3002/uploads/1631234567890-abc123.jpg"
 *       '400':
 *         description: No file uploaded
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
 *                   example: "No file uploaded"
 *       '404':
 *         description: User not found
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
 *                   example: "User not found"
 *       '500':
 *         description: Failed to upload avatar
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
 *                   example: "Failed to upload avatar"
 *                 error:
 *                   type: string
 */
router.post(
  "/me/avatar",
  authMiddleware.verifyToken,
  uploadMiddleware.uploadSingle,
  userController.uploadAvatar
);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieves a user profile by ID. Limited to platform admins and school admins.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: User ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       '404':
 *         description: User not found
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
 *                   example: "User not found"
 *       '403':
 *         description: Not authorized to access this user
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
 *                   example: "Access denied: insufficient permissions"
 *       '500':
 *         description: Failed to get user
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
 *                   example: "Failed to get user"
 *                 error:
 *                   type: string
 */
router.get(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin", "school_admin"]),
  userController.getUserById
);

/**
 * @openapi
 * /users/me/profiles:
 *   get:
 *     summary: Get all role-specific profiles for the current user
 *     description: Returns the user object and all role-specific profiles (student, parent, teacher, social_worker) for the authenticated user.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: All profiles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     profiles:
 *                       type: object
 *                       properties:
 *                         student:
 *                           type: object
 *                           nullable: true
 *                         parent:
 *                           type: object
 *                           nullable: true
 *                         teacher:
 *                           type: object
 *                           nullable: true
 *                         social_worker:
 *                           type: object
 *                           nullable: true
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Failed to get all profiles
 */
router.get("/me/profiles", authMiddleware.verifyToken, userController.getAllProfiles);

module.exports = router;
