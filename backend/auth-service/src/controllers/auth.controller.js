// /controllers/auth.controller.js
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/user.model");
const { sendOTP } = require('../utils/twilio');

const ALLOW_ADMIN_REGISTRATION =
  process.env.ALLOW_ADMIN_REGISTRATION === "true";
const EMAIL_TIMEOUT = 10000; // 10 seconds timeout for email operations

// Set up SMTP transporter with timeout
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: EMAIL_TIMEOUT,
  greetingTimeout: EMAIL_TIMEOUT,
  socketTimeout: EMAIL_TIMEOUT,
});

// Test email connection on startup
(async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log("SMTP connection verified successfully");
  } catch (err) {
    console.error("SMTP connection failed:", err.message);
    console.error("Email functionality will not work properly");
  }
})();

// Helper to send an email with timeout
async function safeSendMail(mailOptions) {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      console.error("Mail send timeout after", EMAIL_TIMEOUT, "ms");
      resolve({ error: "Email timeout", success: false });
    }, EMAIL_TIMEOUT * 1.2);

    transporter
      .sendMail(mailOptions)
      .then(() => {
        clearTimeout(timeoutId);
        resolve({ success: true });
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        console.error("Mail send error:", err.message);
        resolve({ error: err.message, success: false });
      });
  });
}

// Generate secure tokens
function generateSecureToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Build verification or reset URL
function buildUrl(path, token, email) {
  // For API endpoints (internal use)
  if (path !== "verify-email" && path !== "reset-password") {
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? `http://${process.env.AUTH_HOST === "0.0.0.0"
          ? "localhost"
          : process.env.AUTH_HOST
        }:${process.env.AUTH_PORT}`
        : process.env.PRODUCTION_URL;
    return `${baseUrl}/api/auth/${path}?token=${token}&email=${encodeURIComponent(
      email
    )}`;
  }

  // For frontend routes (email links)
  const frontendUrl =
    process.env.NODE_ENV === "development"
      ? process.env.FRONTEND_URL_DEV
      : process.env.FRONTEND_URL_PRODUCTION;

  // Map API paths to frontend routes
  let frontendPath = path;
  if (path === "verify-email") {
    frontendPath = "email-verification";
  } else if (path === "reset-password") {
    frontendPath = "reset-password";
  }

  // Create frontend URL with parameters
  return `${frontendUrl}/${frontendPath}?token=${token}&email=${encodeURIComponent(
    email
  )}`;
}

// Generate JWT tokens
function generateTokens(userId, roles) {
  const accessToken = jwt.sign({ id: userId, roles }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || "1d",
  });

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d" }
  );

  return { accessToken, refreshToken };
}

// POST /auth/register
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, roles } = req.body;

    // Input validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "Missing required registration fields",
        fields: ["email", "password", "firstName", "lastName"],
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Determine roles
    const finalRoles = ALLOW_ADMIN_REGISTRATION
      ? roles || ["student"]
      : (roles || ["student"]).filter((r) => r !== "platform_admin");

    // Create verification token (expires in 1 hour)
    const verificationToken = generateSecureToken();
    const verificationTokenExpires = Date.now() + 3600000; // 1 hour

    // Create new user
    const newUser = new User({
      email,
      password,
      firstName,
      lastName,
      roles: finalRoles,
      verificationToken,
      verificationTokenExpires,
    });

    // Save user to database
    await newUser.save();

    // Generate email verification link
    const verifyLink = buildUrl("verify-email", verificationToken, email);

    // Send verification email
    const mailResult = await safeSendMail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Verify your Univance account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Univance!</h2>
          <p>Hi ${firstName},</p>
          <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
          <p>
            <a href="${verifyLink}" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </p>
          <p>Or copy and paste this link in your browser: ${verifyLink}</p>
          <p>This link will expire in one hour.</p>
          <p>If you did not create this account, please ignore this email.</p>
          <p>Best regards,<br>The Univance Team</p>
        </div>
      `,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      newUser._id,
      newUser.roles
    );

    // Strip sensitive data before sending back
    const userObj = newUser.toObject();
    delete userObj.password;
    delete userObj.verificationToken;
    delete userObj.verificationTokenExpires;
    delete userObj.resetPasswordToken;
    delete userObj.resetPasswordExpires;

    return res.status(201).json({
      success: true,
      message: mailResult.success
        ? "Registration successful! Please check your email to verify your account."
        : "Registration successful, but we couldn't send a verification email. Please use the resend verification option.",
      emailSent: mailResult.success,
      data: {
        user: userObj,
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({
      success: false,
      message: "Registration failed due to a server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// GET /auth/verify-email
exports.verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;

    // Input validation
    if (!token || !email) {
      return res.status(400).json({
        success: false,
        message: "Token and email are required",
      });
    }

    // Find user with matching token and email
    const user = await User.findOne({
      email,
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Return success
    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (err) {
    console.error("VerifyEmail error:", err);
    return res.status(500).json({
      success: false,
      message: "Email verification failed due to a server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// POST /auth/resend-verification
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    // Input validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No account found with that email address",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "This account is already verified",
      });
    }

    // Generate new verification token
    const verificationToken = generateSecureToken();
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Generate verification link
    const verifyLink = buildUrl("verify-email", verificationToken, email);

    // Send verification email
    const mailResult = await safeSendMail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Verify your Univance account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Univance Account</h2>
          <p>Hi ${user.firstName},</p>
          <p>You requested a new verification link. Please click the button below to verify your email address:</p>
          <p>
            <a href="${verifyLink}" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </p>
          <p>Or copy and paste this link in your browser: ${verifyLink}</p>
          <p>This link will expire in one hour.</p>
          <p>If you did not request this email, please ignore it.</p>
          <p>Best regards,<br>The Univance Team</p>
        </div>
      `,
    });

    return res.json({
      success: mailResult.success,
      message: mailResult.success
        ? "Verification email has been sent. Please check your inbox."
        : "Could not send verification email. Please try again later.",
      error:
        mailResult.error && process.env.NODE_ENV === "development"
          ? mailResult.error
          : undefined,
    });
  } catch (err) {
    console.error("ResendVerification error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to resend verification email due to a server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { email, password, phoneNumber, otp } = req.body;

    // Email/password login
    if (email && password) {
      // Find user
      const user = await User.findOne({ email });

      if (!user) {
        // Use same message for security (don't reveal which field is wrong)
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check if email is verified
      if (!user.isVerified) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email before logging in",
          needsVerification: true,
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "This account has been deactivated. Please contact support.",
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id, user.roles);

      // Return user data
      return res.json({
        success: true,
        message: "Login successful",
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user._id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.roles,
            isVerified: user.isVerified,
          },
        },
      });
    }
    // Phone/OTP login
    else if (phoneNumber && otp) {
      const user = await User.findOne({ phoneNumber }).select('+otp +otpExpires');
      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
      if (!user.isPhoneVerified) {
        return res.status(403).json({
          success: false,
          message: "Phone number is not verified. Please verify your phone number before logging in."
        });
      }
      if (!user.isVerified) {
        return res.status(403).json({ success: false, message: "Please verify your account before logging in" });
      }
      if (!user.isActive) {
        return res.status(403).json({ success: false, message: "This account has been deactivated. Please contact support." });
      }
      if (!user.otp || !user.otpExpires || user.otp !== otp || user.otpExpires < Date.now()) {
        return res.status(401).json({ success: false, message: "Invalid or expired OTP" });
      }

      // OTP is valid, clear it
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id, user.roles);

      return res.json({
        success: true,
        message: "Login successful",
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user._id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.roles,
            isVerified: user.isVerified,
          },
        },
      });
    }
    // Missing credentials
    else {
      return res.status(400).json({ success: false, message: "Email/password or phone/otp required" });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Login failed due to a server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// POST /auth/refresh-token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Input validation
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      );

      // Find user
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Invalid refresh token or user is inactive",
        });
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { id: user._id, roles: user.roles },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || "1d" }
      );

      return res.json({
        success: true,
        message: "Token refreshed successfully",
        data: { accessToken },
      });
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }
  } catch (err) {
    console.error("RefreshToken error:", err);
    return res.status(500).json({
      success: false,
      message: "Token refresh failed due to a server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// POST /auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Input validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // For security reasons, always return success (don't reveal if email exists)
    res.json({
      success: true,
      message:
        "If an account with that email exists, a password reset link will be sent shortly.",
    });

    // Find user
    const user = await User.findOne({ email });
    if (!user || !user.isActive) return;

    // Generate reset token
    const resetToken = generateSecureToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Generate reset link
    const resetLink = buildUrl("reset-password", resetToken, email);

    // Send reset email
    await safeSendMail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Reset Your Univance Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>Hi ${user.firstName},</p>
          <p>You requested to reset your password. Please click the button below to set a new password:</p>
          <p>
            <a href="${resetLink}" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>Or copy and paste this link in your browser: ${resetLink}</p>
          <p>This link will expire in one hour.</p>
          <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
          <p>Best regards,<br>The Univance Team</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("ForgotPassword error:", err);
    // Response already sent, so just log error
  }
};

// GET /auth/reset-password
exports.getResetPassword = async (req, res) => {
  try {
    const { token, email } = req.query;

    // Input validation
    if (!token || !email) {
      return res.status(400).json({
        success: false,
        message: "Token and email are required",
      });
    }

    // Find user with matching token and email
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Token is valid, return success
    return res.status(200).json({
      success: true,
      message: "Valid reset token",
      email: email,
      token: token,
    });
  } catch (err) {
    console.error("GetResetPassword error:", err);
    return res.status(500).json({
      success: false,
      message: "Password reset verification failed due to a server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// POST /auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    // Input validation
    if (!email || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, token, and new password are required",
      });
    }

    // Password strength validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Find user with matching token and email
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send password changed notification
    await safeSendMail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Your Univance Password Has Been Changed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Changed</h2>
          <p>Hi ${user.firstName},</p>
          <p>Your password has been successfully changed.</p>
          <p>If you did not request this change, please contact our support immediately.</p>
          <p>Best regards,<br>The Univance Team</p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message:
        "Password reset successfully. You can now log in with your new password.",
    });
  } catch (err) {
    console.error("ResetPassword error:", err);
    return res.status(500).json({
      success: false,
      message: "Password reset failed due to a server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// POST /auth/logout
exports.logout = (req, res) => {
  // The actual token invalidation would typically be handled client-side
  // Server can implement token blacklisting for additional security
  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};

// PUT /auth/update-password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Input validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    // Password strength validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send password changed notification
    await safeSendMail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: "Your Univance Password Has Been Changed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Changed</h2>
          <p>Hi ${user.firstName},</p>
          <p>Your password has been successfully changed.</p>
          <p>If you did not request this change, please contact our support immediately.</p>
          <p>Best regards,<br>The Univance Team</p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("UpdatePassword error:", err);
    return res.status(500).json({
      success: false,
      message: "Password update failed due to a server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// GET /auth/me
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId).select(
      "-password -resetPasswordToken -resetPasswordExpires -verificationToken -verificationTokenExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: { user },
    });
  } catch (err) {
    console.error("GetProfile error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile due to a server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// POST /auth/send-otp

/**
 * Sends a 6-digit OTP to a user's phone number via SMS for either login or phone verification.
 * - Purpose can be "login" (for verified users) or "verify" (to verify phone number).
 * - Enforces a 45-second cooldown to prevent spam.
 * - Stores OTP and expiry in the user record.
 * - Sends purpose-specific SMS using Twilio.
 */
exports.sendOtp = async (req, res) => {
  try {
    const { phoneNumber, purpose = "login" } = req.body;

    const normalizedPurpose = purpose.toLowerCase();

    // Validate input
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    if (!['login', 'verify'].includes(normalizedPurpose)) {
      return res.status(400).json({ success: false, message: "Invalid purpose. Allowed values are 'login' and 'verify'." });
    }

    // Find user
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ success: false, message: "No user found with this phone number" });
    }

    // If purpose is 'verify', require authentication and check phone number matches logged in user
    if (normalizedPurpose === 'verify' && req.user) {
      const userId = req.user.id;
      const authUser = await User.findById(userId).select('+phoneNumber');
      if (!authUser) {
        return res.status(404).json({ success: false, message: "Authenticated user not found" });
      }
      if (authUser.phoneNumber !== phoneNumber) {
        return res.status(403).json({ success: false, message: "You can only request a verification OTP for your own phone number." });
      }
    }

    const now = Date.now();
    const cooldownPeriod = 45 * 1000; // 45 seconds cooldown between OTP sends

    // Throttle OTP resend for each purpose
    if (
      normalizedPurpose === "login" &&
      user.otpExpires &&
      user.otpExpires > now - cooldownPeriod
    ) {
      return res.status(429).json({
        success: false,
        message: "OTP was recently sent. Please wait before trying again."
      });
    }

    if (
      normalizedPurpose === "verify" &&
      user.phoneVerificationOtpExpires &&
      user.phoneVerificationOtpExpires > now - cooldownPeriod
    ) {
      return res.status(429).json({
        success: false,
        message: "Verification OTP was recently sent. Please wait before trying again."
      });
    }

    // Generate OTP and expiry
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpExpires = now + 5 * 60 * 1000; // 5 minutes

    // Set OTP on user based on purpose
    if (normalizedPurpose === "login") {
      if (!user.isPhoneVerified) {
        return res.status(403).json({
          success: false,
          message: "Phone number is not verified. Please verify your phone number first."
        });
      }
      user.otp = otp;
      user.otpExpires = otpExpires;
    } else {
      user.phoneVerificationOtp = otp;
      user.phoneVerificationOtpExpires = otpExpires;
    }

    await user.save();

    // Send SMS via Twilio
    const message =
      normalizedPurpose === "verify"
        ? `Use this OTP to verify your phone number on Univance: ${otp}. This OTP will expire in 5 minutes.`
        : `Use this OTP to log into your Univance account: ${otp}. This OTP will expire in 5 minutes. If you did not request this OTP, please ignore this message. - Univance Team`;

    try {
      await sendOTP(phoneNumber, message);
    } catch (twilioErr) {
      console.error("Twilio send error:", twilioErr);
      return res.status(500).json({ success: false, message: "Failed to send OTP via SMS" });
    }

    return res.json({ success: true, message: "OTP sent successfully" });

  } catch (err) {
    console.error("SendOtp error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Verifies a user's phone number using the OTP sent for verification.
 * - Accepts phoneNumber and otp in the request body.
 * - Checks OTP and expiry.
 * - Sets isPhoneVerified to true and clears verification OTP fields if valid.
 * - Returns appropriate success or error responses.
 */
exports.verifyPhone = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const userId = req.user.id; // from auth middleware
    if (!phoneNumber || !otp) {
      return res.status(400).json({ success: false, message: "Phone number and OTP are required" });
    }
    const user = await User.findById(userId).select('+phoneVerificationOtp +phoneVerificationOtpExpires +phoneNumber');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.phoneNumber !== phoneNumber) {
      return res.status(403).json({ success: false, message: "You can only verify your own phone number." });
    }
    if (!user.phoneVerificationOtp || !user.phoneVerificationOtpExpires) {
      return res.status(400).json({ success: false, message: "No OTP request found for this phone number" });
    }
    if (user.phoneVerificationOtp !== otp) {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }
    if (user.phoneVerificationOtpExpires < Date.now()) {
      return res.status(401).json({ success: false, message: "OTP has expired" });
    }
    user.isPhoneVerified = true;
    user.phoneVerificationOtp = undefined;
    user.phoneVerificationOtpExpires = undefined;
    await user.save();
    return res.json({ success: true, message: "Phone number verified successfully" });
  } catch (err) {
    console.error("VerifyPhone error:", err);
    return res.status(500).json({ success: false, message: "Failed to verify phone number" });
  }
};
