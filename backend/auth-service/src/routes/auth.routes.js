// /routes/auth.routes.js
const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email,password,firstName,lastName]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [student,parent,teacher,school_admin,social_worker,platform_admin]
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 emailSent: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { type: object }
 *                     accessToken: { type: string }
 *                     refreshToken: { type: string }
 *       400:
 *         description: Bad request or user already exists
 *       500:
 *         description: Server error
 */
router.post('/register', authController.register);

/**
 * @openapi
 * /auth/verify-email:
 *   get:
 *     summary: Verify user email
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema: { type: string, format: email }
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Email verified
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get('/verify-email', authController.verifyEmail);

/**
 * @openapi
 * /auth/resend-verification:
 *   post:
 *     summary: Resend email verification link
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Link resent or error message
 *       400:
 *         description: Missing email or user already verified
 *       500:
 *         description: Server error
 */
router.post('/resend-verification', authController.resendVerification);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email,password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { type: object }
 *                     accessToken: { type: string }
 *                     refreshToken: { type: string }
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: User not verified
 *       500:
 *         description: Server error
 */
router.post('/login', authController.login);

/**
 * @openapi
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP to user's phone number
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phoneNumber]
 *             properties:
 *               phoneNumber: { type: string }
 *               purpose:
 *                 type: string
 *                 enum: [login, verify]
 *                 default: login
 *                 description: "Purpose of OTP. 'login' for login OTP, 'verify' for phone verification OTP."
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Missing phone number or invalid purpose
 *       404:
 *         description: No user found with this phone number
 *       429:
 *         description: OTP recently sent, please wait
 *       500:
 *         description: Failed to send OTP
 */
router.post('/send-otp', authMiddleware.optionalAuth, authController.sendOtp);

/**
 * @openapi
 * /auth/verify-phone:
 *   post:
 *     summary: Verify user's phone number with OTP
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Requires authentication. Only the authenticated user can verify their own phone number. The phoneNumber in the request body must match the user's phone number.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phoneNumber, otp]
 *             properties:
 *               phoneNumber: { type: string }
 *               otp: { type: string }
 *     responses:
 *       200:
 *         description: Phone number verified successfully
 *       400:
 *         description: Missing phone number or OTP, or no OTP request found
 *       401:
 *         description: Invalid or expired OTP, or not authenticated
 *       403:
 *         description: Phone number does not match authenticated user
 *       404:
 *         description: No user found with this phone number
 *       500:
 *         description: Failed to verify phone number
 */
router.post('/verify-phone', authMiddleware.verifyToken, authController.verifyPhone);

/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       400:
 *         description: Missing refresh token
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Server error
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Reset instructions sent if email exists
 *       400:
 *         description: Missing email
 *       500:
 *         description: Server error
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @openapi
 * /auth/reset-password:
 *   get:
 *     summary: Verify reset password token
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema: { type: string, format: email }
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Valid reset token
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get('/reset-password', authController.getResetPassword);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email,token,newPassword]
 *             properties:
 *               email: { type: string, format: email }
 *               token: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token, or missing fields
 *       500:
 *         description: Server error
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authController.logout);

/**
 * @openapi
 * /auth/update-password:
 *   put:
 *     summary: Update user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword,newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Missing fields or invalid password
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put(
  '/update-password',
  authMiddleware.verifyToken,
  authMiddleware.checkActive,
  authController.updatePassword
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get(
  '/me',
  authMiddleware.verifyToken,
  authMiddleware.checkActive,
  authController.getProfile
);

module.exports = router;