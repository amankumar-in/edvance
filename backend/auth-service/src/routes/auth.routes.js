const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: User's unique identifier
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *             enum: [student, parent, teacher, school_admin, social_worker, platform_admin]
 *           description: User's roles in the system
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       description: User registration data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *                 example: "Password123"
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *                 example: "Doe"
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [student, parent, teacher, school_admin, social_worker, platform_admin]
 *                 description: User's roles (optional, defaults to student)
 *                 example: ["student"]
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *     responses:
 *       '201':
 *         description: User registered successfully
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
 *                   example: "User registered successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         roles:
 *                           type: array
 *                           items:
 *                             type: string
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token
 *       '400':
 *         description: User with this email already exists
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
 *                   example: "User with this email already exists"
 *       '500':
 *         description: Registration failed
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
 *                   example: "Registration failed"
 *                 error:
 *                   type: string
 */
router.post("/register", authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in a user and receive tokens
 *     tags:
 *       - Authentication
 *     requestBody:
 *       description: User login credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *                 example: "Password123"
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: Login successful
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
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token
 *                     refreshToken:
 *                       type: string
 *                       description: JWT refresh token
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         roles:
 *                           type: array
 *                           items:
 *                             type: string
 *       '401':
 *         description: Invalid credentials
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
 *                   example: "Invalid credentials"
 *       '500':
 *         description: Login failed
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
 *                   example: "Login failed"
 *                 error:
 *                   type: string
 */
router.post("/login", authController.login);

/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       description: Refresh token payload
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: JWT refresh token received during login
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             required:
 *               - refreshToken
 *     responses:
 *       '200':
 *         description: Token refreshed successfully
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
 *                   example: "Token refreshed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: New JWT access token
 *       '400':
 *         description: Refresh token is required
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
 *                   example: "Refresh token is required"
 *       '401':
 *         description: Invalid or expired refresh token
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
 *                   example: "Invalid or expired refresh token"
 *                 error:
 *                   type: string
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
 */
router.post("/refresh-token", authController.refreshToken);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset instructions
 *     tags:
 *       - Authentication
 *     requestBody:
 *       description: User email for password reset
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the account to reset
 *                 example: "user@example.com"
 *             required:
 *               - email
 *     responses:
 *       '200':
 *         description: Password reset instructions sent if email exists
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
 *                   example: "If your email is registered, you will receive password reset instructions"
 *       '500':
 *         description: Failed to process password reset request
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
 *                   example: "Failed to process request"
 *                 error:
 *                   type: string
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset user password using token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       description: Password reset payload
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the account
 *                 example: "user@example.com"
 *               token:
 *                 type: string
 *                 description: Reset token received via email
 *                 example: "e34a6118b2f87d98e35cb5b24b14e22c"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password
 *                 example: "NewPassword123"
 *             required:
 *               - email
 *               - token
 *               - newPassword
 *     responses:
 *       '200':
 *         description: Password reset successfully
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
 *                   example: "Password reset successfully"
 *       '400':
 *         description: Missing or invalid email, token, or newPassword
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
 *                   example: "Email, token, and new password are required"
 *       '500':
 *         description: Failed to reset password
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
 *                   example: "Failed to reset password"
 *                 error:
 *                   type: string
 */
router.post("/reset-password", authController.resetPassword);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Log out the current user
 *     tags:
 *       - Authentication
 *     responses:
 *       '200':
 *         description: Logged out successfully
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
 *                   example: "Logged out successfully"
 */
router.post("/logout", authController.logout);

module.exports = router;
