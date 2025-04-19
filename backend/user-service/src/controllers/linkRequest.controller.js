const LinkRequest = require("../models/linkRequest.model");
const Student = require("../models/student.model");
const User = require("../models/user.model");
const Parent = require("../models/parent.model");
const School = require("../models/school.model");
const crypto = require("crypto");

// Student requests to link with a parent
exports.requestParentLink = async (req, res) => {
  try {
    const userId = req.user.id;
    const { parentEmail } = req.body;

    if (!parentEmail) {
      return res.status(400).json({
        success: false,
        message: "Parent email is required",
      });
    }

    // Find student profile
    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Check if parent exists
    let parentUser = await User.findOne({ email: parentEmail });
    let parentId = null;

    if (parentUser) {
      // Check if user has parent role
      if (!parentUser.roles.includes("parent")) {
        // Add parent role if missing
        parentUser.roles.push("parent");
        await parentUser.save();
      }

      // Find or create parent profile
      let parent = await Parent.findOne({ userId: parentUser._id });
      if (!parent) {
        // Create parent profile
        parent = new Parent({
          userId: parentUser._id,
          childIds: [],
          tuitPoints: 0,
        });
        await parent.save();
      }

      parentId = parent._id;

      // Check if already linked
      if (student.parentIds.includes(parentId)) {
        return res.status(400).json({
          success: false,
          message: "Already linked with this parent",
        });
      }
    }

    // Generate a unique code for the request
    const code = crypto.randomBytes(3).toString("hex").toUpperCase();

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create link request
    const linkRequest = new LinkRequest({
      studentId: student._id,
      requestType: "parent",
      targetId: parentId, // Will be null if parent doesn't exist yet
      targetEmail: parentEmail,
      code: code,
      expiresAt: expiresAt,
    });

    await linkRequest.save();

    // TODO: Notify parent via email - would be implemented with notification service

    res.status(201).json({
      success: true,
      message: "Parent link request created successfully",
      data: {
        requestId: linkRequest._id,
        code: linkRequest.code,
        expiresAt: linkRequest.expiresAt,
      },
    });
  } catch (error) {
    console.error("Request parent link error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to request parent link",
      error: error.message,
    });
  }
};

// Student requests to link with a school via class code
exports.requestSchoolLink = async (req, res) => {
  try {
    const userId = req.user.id;
    const { schoolCode } = req.body;

    if (!schoolCode) {
      return res.status(400).json({
        success: false,
        message: "School/class code is required",
      });
    }

    // Find student
    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Find class with join code
    const schoolClass = await SchoolClass.findOne({ joinCode: schoolCode });
    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Invalid school code",
      });
    }

    // Check if already in this class
    if (schoolClass.studentIds.includes(student._id)) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this class",
      });
    }

    // Generate a unique request code
    const code = crypto.randomBytes(3).toString("hex").toUpperCase();

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create link request
    const linkRequest = new LinkRequest({
      studentId: student._id,
      requestType: "school",
      targetId: schoolClass.schoolId,
      code: code,
      expiresAt: expiresAt,
    });

    await linkRequest.save();

    // TODO: Notify school admin/teacher via notification service

    res.status(201).json({
      success: true,
      message: "School link request created successfully",
      data: {
        requestId: linkRequest._id,
        schoolName: schoolClass.name, // This would actually need a DB lookup to get the school name
        className: schoolClass.name,
        code: linkRequest.code,
        expiresAt: linkRequest.expiresAt,
      },
    });
  } catch (error) {
    console.error("Request school link error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to request school link",
      error: error.message,
    });
  }
};

// Get pending link requests for a student
exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find student
    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Get pending requests
    const requests = await LinkRequest.find({
      studentId: student._id,
      status: "pending",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Get pending requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get pending link requests",
      error: error.message,
    });
  }
};

// Cancel a link request
exports.cancelRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    // Find student
    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Find and update request
    const request = await LinkRequest.findOneAndUpdate(
      {
        _id: requestId,
        studentId: student._id,
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
    console.error("Cancel request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel link request",
      error: error.message,
    });
  }
};
