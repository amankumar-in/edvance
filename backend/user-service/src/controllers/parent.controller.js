const Parent = require("../models/parent.model");
const Student = require("../models/student.model");
const User = require("../models/user.model");
const crypto = require("crypto");
const axios = require("axios");
const LinkRequest = require("../models/linkRequest.model");
const School = require("../models/school.model");

// Get parent profile
exports.getParentProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const parent = await Parent.findOne({ userId });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: parent,
    });
  } catch (error) {
    console.error("Get parent profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get parent profile",
      error: error.message,
    });
  }
};

// Get all children
exports.getChildren = async (req, res) => {
  try {
    const userId = req.user.id;

    const parent = await Parent.findOne({ userId });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    const children = await Student.find({
      _id: { $in: parent.childIds },
    }).populate("userId", "firstName lastName email avatar dateOfBirth").populate("schoolId", "-adminIds");

    res.status(200).json({
      success: true,
      data: children,
    });
  } catch (error) {
    console.error("Get children error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get children",
      error: error.message,
    });
  }
};

// Add child (create or link)
exports.addChild = async (req, res) => {
  try {
    const userId = req.user.id;
    const { childEmail } = req.body;

    // Require existing child email for linking
    if (!childEmail) {
      return res.status(400).json({
        success: false,
        message: "Child email is required for linking",
      });
    }

    // Find parent profile
    const parent = await Parent.findOne({ userId });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    // Find existing child user by email
    const childUser = await User.findOne({ email: childEmail });

    if (!childUser) {
      return res.status(404).json({
        success: false,
        message: "Child account not found. Create the child account first.",
      });
    }

    // Check if student profile exists
    let student = await Student.findOne({ userId: childUser._id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Child student profile not found. Complete child setup first.",
      });
    }

    // Do not create student profile or points account here (linking only)

    // Check if already linked
    if (parent.childIds.includes(student._id)) {
      return res.status(400).json({
        success: false,
        message: "Child is already linked to this parent",
      });
    }

    // Check if there's already a pending link request
    const existingRequest = await LinkRequest.findOne({
      studentId: student._id,
      targetId: parent._id,
      requestType: "parent",
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "A link request for this child is already pending",
        data: {
          requestId: existingRequest._id,
          code: existingRequest.code,
          expiresAt: existingRequest.expiresAt
        }
      });
    }

    // Generate a unique code for the request
    const code = crypto.randomBytes(3).toString("hex").toUpperCase();

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Get parent user details for notification
    const parentUser = await User.findById(userId);
    
    // Create link request
    const linkRequest = new LinkRequest({
      initiatorId: parent._id,
      initiator: "Parent",
      targetId: student._id,
      targetEmail: childUser.email,
      requestType: "parent",
      code: code,
      expiresAt: expiresAt,
    });

    await linkRequest.save();

    // TODO: Notify child via email/notification service

    res.status(201).json({
      success: true,
      message: "Link request sent to child successfully",
      data: {
        requestId: linkRequest._id,
        code: linkRequest.code,
        expiresAt: linkRequest.expiresAt,
        childId: student._id,
        userId: childUser._id,
        name: `${childUser.firstName} ${childUser.lastName}`,
        email: childUser.email,
        grade: student.grade,
      },
    });
  } catch (error) {
    console.error("Add child error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add child",
      error: error.message,
    });
  }
};

// Create parent profile
exports.createParentProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if parent profile already exists
    const existingParent = await Parent.findOne({ userId });
    if (existingParent) {
      return res.status(400).json({
        success: false,
        message: "Parent profile already exists",
      });
    }

    // Create new parent profile
    const newParent = new Parent({
      userId,
      childIds: [],
      tuitPoints: 0,
    });

    await newParent.save();

    res.status(201).json({
      success: true,
      message: "Parent profile created successfully",
      data: newParent,
    });
  } catch (error) {
    console.error("Create parent profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create parent profile",
      error: error.message,
    });
  }
};

// Add this new function
exports.generateLinkCode = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find parent
    const parent = await Parent.findOne({ userId });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    // Generate a new link code (6 characters)
    const linkCode = crypto.randomBytes(3).toString("hex").toUpperCase();

    // Update parent with new link code
    parent.linkCode = linkCode;
    parent.updatedAt = Date.now();
    await parent.save();

    res.status(200).json({
      success: true,
      message: "Link code generated successfully",
      data: { linkCode },
    });
  } catch (error) {
    console.error("Generate link code error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate link code",
      error: error.message,
    });
  }
};
// Remove child from parent
exports.removeChild = async (req, res) => {
  try {
    const userId = req.user.id;
    const { childId } = req.params;

    // Find parent
    const parent = await Parent.findOne({ userId });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    // Check if child exists in parent's children
    if (!parent.childIds.includes(childId)) {
      return res.status(400).json({
        success: false,
        message: "Child is not linked to this parent",
      });
    }

    // Remove child from parent
    parent.childIds = parent.childIds.filter((id) => id.toString() !== childId);
    await parent.save();

    // Remove parent from student
    const student = await Student.findById(childId);
    if (student) {
      student.parentIds = student.parentIds.filter(
        (id) => id.toString() !== parent._id.toString()
      );
      await student.save();
    }

    // Create relationship history record
    // This would be implemented if you have a relationship history model

    res.status(200).json({
      success: true,
      message: "Successfully removed child from parent",
    });
  } catch (error) {
    console.error("Remove child error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove child from parent",
      error: error.message,
    });
  }
};
// Update parent profile
exports.updateParentProfile = async (req, res) => {
  try {
    const parentId = req.params.id;
    const { tuitPoints } = req.body;

    // Check permissions
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    const isOwnProfile = parent.userId.toString() === req.user.id;
    const isAdmin = req.user.roles.includes("platform_admin");

    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this profile",
      });
    }

    // Update fields
    if (tuitPoints !== undefined) {
      parent.tuitPoints = tuitPoints;
    }

    parent.updatedAt = Date.now();
    await parent.save();

    res.status(200).json({
      success: true,
      message: "Parent profile updated successfully",
      data: parent,
    });
  } catch (error) {
    console.error("Update parent profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update parent profile",
      error: error.message,
    });
  }
};

// Get pending link requests for parent
exports.getPendingLinkRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find parent
    const parent = await Parent.findOne({ userId });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    // Get parent email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find requests targeting this parent's email
    const requests = await LinkRequest.find({
      targetEmail: user.email,
      requestType: "parent",
      initiator: "Student",
      status: "pending",
    }).populate({
      path: "initiatorId",
      model: "Student",
      select: "userId"
    });

    // Also populate student names
    const populatedRequests = [];
    for (const request of requests) {
      const studentUser = await User.findById(request.initiatorId.userId);
      populatedRequests.push({
        ...request.toObject(),
        studentName: studentUser
          ? `${studentUser.firstName} ${studentUser.lastName}`
          : "Unknown",
        studentEmail: studentUser.email,
      });
    }

    res.status(200).json({
      success: true,
      data: populatedRequests,
    });
  } catch (error) {
    console.error("Get pending link requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get pending link requests",
      error: error.message,
    });
  }
};

// Get outgoing link requests sent by parent to children
exports.getOutgoingLinkRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find parent
    const parent = await Parent.findOne({ userId });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    // Find requests initiated by this parent
    const requests = await LinkRequest.find({
      initiatorId: parent._id,
      initiator: "Parent",
      requestType: "parent",
      status: "pending",
    }).populate({
      path: "targetId",
      model: "Student",
      select: "userId"
    });

    // Also populate student details
    const populatedRequests = [];
    for (const request of requests) {
      const studentUser = await User.findById(request.targetId.userId);
      populatedRequests.push({
        ...request.toObject(),
        childName: studentUser
          ? `${studentUser.firstName} ${studentUser.lastName}`
          : "Unknown",
        childEmail: studentUser.email,
      });
    }

    res.status(200).json({
      success: true,
      data: populatedRequests,
    });
  } catch (error) {
    console.error("Get outgoing link requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get outgoing link requests",
      error: error.message,
    });
  }
};

// Cancel an outgoing link request
exports.cancelOutgoingRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    // Find parent
    const parent = await Parent.findOne({ userId });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    // Find and update request
    const request = await LinkRequest.findOneAndUpdate(
      {
        _id: requestId,
        initiatorId: parent._id,
        initiator: "Parent",
        status: "pending",
      },
      {
        status: "cancelled",
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Link request not found or already processed",
      });
    }

    res.status(200).json({
      success: true,
      message: "Link request cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel outgoing request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel link request",
      error: error.message,
    });
  }
};

// Respond to a link request (approve or reject)
exports.respondToLinkRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;
    const { action } = req.body; // "approve" or "reject"

    if (!action || !["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be either 'approve' or 'reject'",
      });
    }

    // Find parent
    const parent = await Parent.findOne({ userId });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    // Get parent email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find request
    const request = await LinkRequest.findOne({
      _id: requestId,
      targetEmail: user.email,
      requestType: "parent",
      initiator: "Student",
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Link request not found or already processed",
      });
    }

    // Update request status
    request.status = action === "approve" ? "approved" : "rejected";
    request.updatedAt = Date.now();
    await request.save();

    // If approved, link parent and student
    if (action === "approve") {
      // Find student (initiator of the request)
      const student = await Student.findById(request.initiatorId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      // Link parent to student
      if (!parent.childIds.includes(student._id)) {
        parent.childIds.push(student._id);
        await parent.save();
      }

      // Link student to parent
      if (!student.parentIds.includes(parent._id)) {
        student.parentIds.push(parent._id);
        await student.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `Link request ${
        action === "approve" ? "approved" : "rejected"
      } successfully`,
    });
  } catch (error) {
    console.error("Respond to link request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to respond to link request",
      error: error.message,
    });
  }
};

// Get parent by userId
exports.getParentByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const parent = await Parent.findOne({ userId })
      .populate("childIds", "userId")

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    res.status(200).json({
      success: true,
      data: parent,
    });
  } catch (error) {
    console.error("Get parent by userId error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get parent",
      error: error.message,
    });
  }
};

// Create a new child account (user + student profile) and link to the parent
exports.createChildAccount = async (req, res) => {
  try {
    const actingUserId = req.user.id;
    const roles = Array.isArray(req.user.roles) ? req.user.roles : [];

    // Only parents or admins can create child accounts
    const isAllowed = roles.includes("parent") || roles.includes("school_admin") || roles.includes("platform_admin");
    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create child accounts",
      });
    }

    // Validate parent profile exists
    const parent = await Parent.findOne({ userId: actingUserId });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    const { email, password, firstName, lastName, grade, schoolId } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        fields: ["email", "password", "firstName", "lastName"],
      });
    }

    // Optionally validate provided school exists
    if (schoolId) {
      const schoolExists = await School.findById(schoolId);
      if (!schoolExists) {
        return res.status(404).json({
          success: false,
          message: "School not found",
        });
      }
    }

    // Step 1: Create the child user via auth-service
    const authServiceUrl =
      process.env.NODE_ENV === "production"
        ? process.env.PRODUCTION_AUTH_SERVICE_URL
        : process.env.AUTH_SERVICE_URL || "http://localhost:3001";

    if (!authServiceUrl) {
      return res.status(500).json({
        success: false,
        message: "Auth service URL is not configured",
      });
    }

    let createdUser;
    try {
      const registerResponse = await axios.post(
        `${authServiceUrl}/api/auth/register`,
        {
          email,
          password,
          firstName,
          lastName,
          roles: ["student"],
        }
      );

      const userPayload = registerResponse?.data?.data?.user || registerResponse?.data?.user;
      if (!userPayload) {
        return res.status(502).json({
          success: false,
          message: "Auth service did not return user data",
        });
      }
      createdUser = userPayload;
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message;
      return res.status(error?.response?.status || 500).json({
        success: false,
        message: `Failed to register child user: ${errorMessage}`,
        error: error?.response?.data || undefined,
      });
    }

    const createdUserId = createdUser._id || createdUser.id;
    if (!createdUserId) {
      return res.status(502).json({
        success: false,
        message: "Auth service response missing user ID",
      });
    }

    // Step 2: Create the student profile via existing endpoint (handles points itself)
    const userServiceUrl =
      process.env.NODE_ENV === "production"
        ? process.env.PRODUCTION_USER_SERVICE_URL
        : process.env.USER_SERVICE_URL || "http://localhost:3002";

    let studentResponse;
    try {
      studentResponse = await axios.post(
        `${userServiceUrl}/api/students/profile`,
        {
          grade,
          schoolId,
          targetUserId: createdUserId,
        },
        {
          headers: { Authorization: req.headers.authorization },
        }
      );
    } catch (studentErr) {
      const errMsg = studentErr?.response?.data?.message || studentErr.message;
      return res.status(studentErr?.response?.status || 500).json({
        success: false,
        message: `Failed to create student profile: ${errMsg}`,
        error: studentErr?.response?.data || undefined,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Child account created successfully",
      data: {
        user: {
          id: createdUserId,
          email: createdUser.email,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          roles: createdUser.roles || ["student"],
        },
        student: studentResponse?.data?.data || null,
      },
    });
  } catch (error) {
    console.error("Create child account error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create child account",
      error: error.message,
    });
  }
};

// ==================== ANALYTICS ENDPOINTS ====================

// Get all parents with optional count and filtering
exports.getAllParents = async (req, res) => {
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
    if (schoolId) {
      filter.schoolId = schoolId;
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
      const total = await User.countDocuments({roles: {$in: ['parent']}});
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

    const parents = await Parent.find(filter)
      .populate('userId', 'firstName lastName email avatar')
      .populate('schoolId', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Parent.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        parents,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error("Get all parents error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch parents",
      error: error.message,
    });
  }
};