const User = require("../models/user.model");
const Student = require("../models/student.model");
const Parent = require("../models/parent.model");
const Teacher = require("../models/teacher.model");
const SocialWorker = require("../models/socialWorker.model");
const School = require("../models/school.model");

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

    let school = null;
    if (user?.roles?.includes('school_admin')) {
      school = await School.findOne({ adminIds: userId });
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
          school,
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

// Get users by role with pagination
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { page = 1, limit = 10, sort = "firstName", order = "asc" } = req.query;

    // Validate role parameter
    const validRoles = ["student", "parent", "teacher", "social_worker", "school_admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
    }

    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Create filter for role
    const filter = { roles: role };

    // Set up sorting
    const sortOrder = order.toLowerCase() === "desc" ? -1 : 1;
    const sortOptions = {};
    sortOptions[sort] = sortOrder;

    // Query the database with pagination
    const users = await User.find(filter)
      .select('-password') // Exclude password field
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    // Calculate pagination data
    const totalPages = Math.ceil(total / limitNum);
    const hasPrevPage = pageNum > 1;
    const hasNextPage = pageNum < totalPages;
    const prevPage = hasPrevPage ? pageNum - 1 : null;
    const nextPage = hasNextPage ? pageNum + 1 : null;
    const pagingCounter = (pageNum - 1) * limitNum + 1;
    const offset = skip;

    // Add a name field combining firstName and lastName
    const usersWithName = users.map(user => {
      // Create a name field combining firstName and lastName
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      return {
        ...user,
        name
      };
    });

    res.status(200).json({
      success: true,
      data: {
        docs: usersWithName,
        totalDocs: total,
        limit: limitNum,
        page: pageNum,
        totalPages: totalPages,
        offset: offset,
        hasPrevPage: hasPrevPage,
        hasNextPage: hasNextPage,
        prevPage: prevPage,
        nextPage: nextPage,
        pagingCounter: pagingCounter
      }
    });
  } catch (error) {
    console.error("Get users by role error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Get total user count excluding platform admins
exports.getTotalUserCount = async (req, res) => {
  try {
    // Count users that don't have the platform_admin role
    const totalUsers = await User.countDocuments({
      roles: { $nin: ["platform_admin"] }
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalUsers
      }
    });
  } catch (error) {
    console.error("Get total user count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user count",
      error: error.message,
    });
  }
};

// Admin: Update any user's profile and roles (platform admin only)
// This route should be protected by platform admin middleware
exports.adminUpdateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName, phoneNumber, dateOfBirth, roles } = req.body;

    // List of valid roles
    const validRoles = [
      "student",
      "parent",
      "teacher",
      "social_worker",
      "school_admin"
    ];

    // Validate roles if provided
    if (roles !== undefined) {
      if (!Array.isArray(roles)) {
        return res.status(400).json({
          success: false,
          message: "Roles must be an array",
        });
      }
      const invalidRoles = roles.filter(role => !validRoles.includes(role));
      if (invalidRoles.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid roles: ${invalidRoles.join(", ")}`,
        });
      }
    }

    // Find user by ID
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update allowed fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (roles !== undefined) user.roles = roles;

    user.updatedAt = Date.now();
    await user.save();

    // Don't send password
    const updatedProfile = user.toObject();
    delete updatedProfile.password;

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Admin update user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user profile",
      error: error.message,
    });
  }
};

// ==================== ANALYTICS ENDPOINTS ====================

// Get all users with optional filtering and count
exports.getAllUsers = async (req, res) => {
  try {
    const {
      count,
      roles,
      schoolId,
      page = 1,
      limit = 20,
      sort = "createdAt",
      order = "desc"
    } = req.query;

    // Build filter object
    const filter = {};

    // Filter by roles if provided (can be comma-separated or array)
    if (roles) {
      if (schoolId && count === 'true' && roles === 'school_admin') {
        const school = await School.findOne({_id: schoolId}).select('adminIds');
        const schoolAdminIds = school.adminIds;
        
        return res.status(200).json({
          success: true,
          data: {
            total: schoolAdminIds.length
          }
        });
      } else {
        const rolesArray = typeof roles === 'string' ? roles.split(',') : roles;
        filter.roles = { $in: rolesArray };
      }
    }

    // Handle date range filtering for createdAt
    if (req.query.createdAtGte || req.query.createdAtLte) {
      filter.createdAt = {};
      if (req.query.createdAtGte) filter.createdAt.$gte = new Date(req.query.createdAtGte);
      if (req.query.createdAtLte) filter.createdAt.$lte = new Date(req.query.createdAtLte);
    }

    // If count=true, return only the count
    if (count === 'true') {
      const total = await User.countDocuments(filter);
      return res.status(200).json({
        success: true,
        data: {
          total
        }
      });
    }

    // Otherwise return paginated data
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = order.toLowerCase() === "desc" ? -1 : 1;
    const sortOptions = {};
    sortOptions[sort] = sortOrder;

    const users = await User.find(filter)
      .select('-password')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Get active users (users with activity in last N days)
exports.getActiveUsers = async (req, res) => {
  try {
    const { days = 30, count, schoolId } = req.query;

    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));

    // Build filter - users who logged in or were updated after the threshold
    const filter = {
      $or: [
        { lastLogin: { $gte: dateThreshold } },
        { updatedAt: { $gte: dateThreshold } }
      ]
    };

    // If count=true, return only the count
    if (count === 'true') {
      const total = await User.countDocuments(filter);
      return res.status(200).json({
        success: true,
        data: {
          total
        }
      });
    }

    // Otherwise return the users
    const users = await User.find(filter)
      .select('-password')
      .sort({ lastLoginAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        users,
        days: parseInt(days),
        dateThreshold
      }
    });
  } catch (error) {
    console.error("Get active users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active users",
      error: error.message,
    });
  }
};