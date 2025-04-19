const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// TOGGLE THIS VARIABLE TO ALLOW/BLOCK ADMIN REGISTRATION
// Set to true to allow platform_admin registration
// Set to false to block platform_admin registration
const ALLOW_ADMIN_REGISTRATION = true;

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, roles } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user - with toggle for admin registration
    let finalRoles;
    if (ALLOW_ADMIN_REGISTRATION) {
      // Original behavior - allow any role including platform_admin
      finalRoles = roles || ["student"];
    } else {
      // Filter out platform_admin role
      const allowedRoles = (roles || ["student"]).filter(
        (role) => role !== "platform_admin"
      );
      finalRoles = allowedRoles.length ? allowedRoles : ["student"];
    }

    const newUser = new User({
      email,
      password,
      firstName,
      lastName,
      roles: finalRoles,
    });

    await newUser.save();

    // Generate tokens
    const accessToken = jwt.sign(
      { id: newUser._id, roles: newUser.roles },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || "1d" }
    );

    const refreshToken = jwt.sign(
      { id: newUser._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d" }
    );

    // Return user data without password
    const userWithoutPassword = { ...newUser.toObject() };
    delete userWithoutPassword.password;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user._id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || "1d" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// Refresh token to get new access token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user._id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: { accessToken },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
      error: error.message,
    });
  }
};

// Request password reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // For security, always return the same response whether the email exists or not
    res.status(200).json({
      success: true,
      message:
        "If your email is registered, you will receive password reset instructions",
    });

    // Find user (continue processing only if user exists)
    const user = await User.findOne({ email });
    if (!user) return;

    // In a real implementation, we would generate a token and send an email
    // This would happen after the response is sent to prevent timing attacks
    console.log(`Password reset requested for: ${email}`);
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process request",
      error: error.message,
    });
  }
};

// Reset password using token
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, token, and new password are required",
      });
    }

    // In a real implementation, we would verify the token and update the password
    // For this demo, we'll just find the user and update the password

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};

// Logout user
exports.logout = async (req, res) => {
  // In a real implementation, we would blacklist the token
  // For now, just return success
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
