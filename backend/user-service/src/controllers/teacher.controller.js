const Teacher = require("../models/teacher.model");
const SchoolClass = require("../models/schoolClass.model");
const User = require("../models/user.model");

// Get teacher profile
exports.getTeacherProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const teacher = await Teacher.findOne({ userId }).populate(
      "schoolId",
      "name"
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    console.error("Get teacher profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get teacher profile",
      error: error.message,
    });
  }
};

// Get all classes
exports.getClasses = async (req, res) => {
  try {
    const userId = req.user.id;

    const teacher = await Teacher.findOne({ userId });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    const classes = await SchoolClass.find({ _id: { $in: teacher.classIds } });

    res.status(200).json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error("Get classes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get classes",
      error: error.message,
    });
  }
};

// Create teacher profile
exports.createTeacherProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { schoolId, subjectsTaught } = req.body;

    // Check if teacher profile already exists
    const existingTeacher = await Teacher.findOne({ userId });
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: "Teacher profile already exists",
      });
    }

    // Create new teacher profile
    const newTeacher = new Teacher({
      userId,
      schoolId,
      classIds: [],
      subjectsTaught: subjectsTaught || [],
    });

    await newTeacher.save();

    res.status(201).json({
      success: true,
      message: "Teacher profile created successfully",
      data: newTeacher,
    });
  } catch (error) {
    console.error("Create teacher profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create teacher profile",
      error: error.message,
    });
  }
};

// Update teacher profile
exports.updateTeacherProfile = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const { subjectsTaught } = req.body;

    // Find teacher
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    // Check permissions
    const isOwnProfile = teacher.userId.toString() === req.user.id;
    const isAdmin = req.user.roles.includes("platform_admin");
    const isSchoolAdmin = req.user.roles.includes("school_admin");

    if (!isOwnProfile && !isAdmin && !isSchoolAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this profile",
      });
    }

    // Update fields
    if (subjectsTaught) {
      teacher.subjectsTaught = subjectsTaught;
    }

    teacher.updatedAt = Date.now();
    await teacher.save();

    res.status(200).json({
      success: true,
      message: "Teacher profile updated successfully",
      data: teacher,
    });
  } catch (error) {
    console.error("Update teacher profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update teacher profile",
      error: error.message,
    });
  }
};

// Get teacher by userId
exports.getTeacherById = async (req, res) => {
  try {
    const userId = req.params.id;

    const teacher = await Teacher.findOne({ userId })
      .populate("userId", "firstName lastName email avatar dateOfBirth")
      .populate("schoolId", "name")
      .populate("classIds", "name grade");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    console.error("Get teacher by userId error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get teacher",
      error: error.message,
    });
  }
};

// ==================== ANALYTICS ENDPOINTS ====================

// Get all teachers with optional count and filtering
exports.getAllTeachers = async (req, res) => {
  try {
    const { 
      count, 
      schoolId,
      page = 1, 
      limit = 20,
      sort = "createdAt",
      order = "desc"
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Filter by school if provided
    if (schoolId && count === 'true') {
      const total = await Teacher.countDocuments({ schoolId });
      return res.status(200).json({
        success: true,
        data: {
          total
        }
      });
    }

    // Handle date range filtering for createdAt
    if (req.query['createdAt[gte]'] || req.query['createdAt[lte]']) {
      filter.createdAt = {};
      if (req.query['createdAt[gte]']) {
        filter.createdAt.$gte = new Date(req.query['createdAt[gte]']);
      }
      if (req.query['createdAt[lte]']) {
        filter.createdAt.$lte = new Date(req.query['createdAt[lte]']);
      }
    }

    // If count=true, return only the count
    if (count === 'true') {
      const total = await User.countDocuments({roles: {$in: ['teacher']}});
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

    const teachers = await Teacher.find(filter)
      .populate('userId', 'firstName lastName email avatar')
      .populate('schoolId', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Teacher.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        teachers,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error("Get all teachers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teachers",
      error: error.message,
    });
  }
};