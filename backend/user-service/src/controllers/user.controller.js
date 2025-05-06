const User = require("../models/user.model");
const Student = require("../models/student.model");
const Parent = require("../models/parent.model");
const Teacher = require("../models/teacher.model");
const SocialWorker = require("../models/socialWorker.model");

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get basic user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Don't send password
    const userProfile = user.toObject();
    delete userProfile.password;

    // Get role-specific profile
    let roleProfile = null;
    const roles = user.roles || [];

    if (roles.includes("student")) {
      roleProfile = await Student.findOne({ userId });
    } else if (roles.includes("parent")) {
      roleProfile = await Parent.findOne({ userId });
    } else if (roles.includes("teacher")) {
      roleProfile = await Teacher.findOne({ userId });
    } else if (roles.includes("social_worker")) {
      roleProfile = await SocialWorker.findOne({ userId });
    }

    res.status(200).json({
      success: true,
      data: {
        user: userProfile,
        roleProfile,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
      error: error.message,
    });
  }
};

// Update current user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phoneNumber, dateOfBirth } = req.body;

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update basic fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;

    user.updatedAt = Date.now();
    await user.save();

    // Don't send password
    const updatedProfile = user.toObject();
    delete updatedProfile.password;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Set new password
    user.password = newPassword;
    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
};

// Update uploadAvatar function

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Get file path or URL
    const fileUrl = require("../middleware/upload.middleware").getFileUrl(req.file.filename);

    // Update user avatar
    const user = await User.findByIdAndUpdate(
      userId,
      {
        avatar: fileUrl,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      data: { avatar: user.avatar },
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload avatar",
      error: error.message,
    });
  }
};

// Get user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Don't send password
    const userProfile = user.toObject();
    delete userProfile.password;

    res.status(200).json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user",
      error: error.message,
    });
  }
};

// Get all role-specific profiles for the current user
exports.getAllProfiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const userProfile = user.toObject();
    delete userProfile.password;

    // Fetch all possible profiles
    const [student, parent, teacher, socialWorker] = await Promise.all([
      Student.findOne({ userId }),
      Parent.findOne({ userId }),
      Teacher.findOne({ userId }),
      SocialWorker.findOne({ userId }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        user: userProfile,
        profiles: {
          student,
          parent,
          teacher,
          social_worker: socialWorker,
        },
      },
    });
  } catch (error) {
    console.error("Get all profiles error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get all profiles",
      error: error.message,
    });
  }
};
