const Student = require("../models/student.model");
const Parent = require("../models/parent.model");
const Teacher = require("../models/teacher.model");
const User = require("../models/user.model");
const Badge = require("../models/badge.model");
const SchoolClass = require("../models/schoolClass.model");
const LinkRequest = require("../models/linkRequest.model");
const linkRequestController = require("./linkRequest.controller");
const crypto = require("crypto");
const axios = require("axios");
const { default: mongoose } = require("mongoose");
const ClassAttendance = require("../models/classAttendance.model"); // Added import for ClassAttendance

// Get student profile (for student users)
exports.getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const student = await Student.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId.createFromHexString(userId),
        },
      },
      // Look up parents information
      {
        $lookup: {
          from: "parents",
          localField: "parentIds",
          foreignField: "_id",
          as: "parentIds",
          pipeline: [
            {
              $project: {
                _id: 1,
                userId: 1,
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userDetails",
              },
            },
            {
              $unwind: {
                path: "$userDetails",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                userId: 1,
                firstName: "$userDetails.firstName",
                lastName: "$userDetails.lastName",
                email: "$userDetails.email",
                avatar: "$userDetails.avatar",
              }
            }
          ]
        },
      },
      {
        $lookup: {
          from: "schools",
          localField: "schoolId",
          foreignField: "_id",
          as: "schoolId",
          pipeline: [
            {
              $project: {
                adminIds: 0,
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: "teachers",
          localField: "teacherIds",
          foreignField: "_id",
          as: "teacherIds",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userDetails",
              }
            },
            {
              $unwind: {
                path: "$userDetails",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                userId: 1,
                firstName: "$userDetails.firstName",
                lastName: "$userDetails.lastName",
                email: "$userDetails.email",
                avatar: "$userDetails.avatar",
                subjectsTaught: 1,
              }
            }
          ]
        },
      },
      {
        $addFields: {
          schoolDetails: {
            $arrayElemAt: ["$schoolId", 0]
          },
        }
      },
      {
        $project: {
          schoolId: 0,
        }
      }
    ])

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: student[0],
    });
  } catch (error) {
    console.error("Get student profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get student profile",
      error: error.message,
    });
  }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await Student.findById(studentId)
      .populate("userId", "firstName lastName email avatar dateOfBirth")
      .populate("parentIds", "userId firstName lastName")
      .populate("teacherIds", "userId firstName lastName");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Get student by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get student",
      error: error.message,
    });
  }
};

// Create student profile
exports.createStudentProfile = async (req, res) => {
  try {
    const actingUserId = req.user.id;
    const roles = Array.isArray(req.user.roles) ? req.user.roles : [];
    const { grade, schoolId, targetUserId } = req.body;

    // Determine who the profile is being created for
    let resolvedUserId = actingUserId;
    if (targetUserId && targetUserId !== actingUserId) {
      const canCreateForOthers =
        roles.includes("platform_admin") ||
        roles.includes("school_admin") ||
        roles.includes("parent");
      if (!canCreateForOthers) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to create a student profile for another user",
        });
      }
      resolvedUserId = targetUserId;
    }

    // Prevent parents/admins from accidentally creating a student profile for themselves without specifying a target
    if (resolvedUserId === actingUserId && (roles.includes("parent") || roles.includes("school_admin"))) {
      return res.status(400).json({
        success: false,
        message: "Please provide 'targetUserId' to create a student profile for another user",
      });
    }

    // Validate target user exists
    const targetUser = await User.findById(resolvedUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Target user not found",
      });
    }

    // Ensure target user has the 'student' role
    const targetRoles = Array.isArray(targetUser.roles) ? targetUser.roles : [];
    if (!targetRoles.includes("student")) {
      targetUser.roles = [...targetRoles, "student"];
      targetUser.updatedAt = Date.now();
      await targetUser.save();
    }

    // Check if student profile already exists
    const existingStudent = await Student.findOne({ userId: resolvedUserId });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student profile already exists",
      });
    }

    // Generate a temporary pointsAccountId (will be replaced by points service later)
    const tempPointsAccountId = `temp_${crypto
      .randomBytes(10)
      .toString("hex")}`;

    // Create new student profile
    const newStudent = new Student({
      userId: resolvedUserId,
      grade,
      schoolId,
      pointsAccountId: tempPointsAccountId,
      level: 1,
      attendanceStreak: 0,
    });

    await newStudent.save();

    // Create a points account for the student
    try {
      const pointsServiceUrl =
        process.env.NODE_ENV === "production"
          ? process.env.PRODUCTION_POINTS_SERVICE_URL
          : process.env.POINTS_SERVICE_URL;

      console.log(
        `Attempting to create points account at: ${pointsServiceUrl}/api/points/accounts`
      );

      const response = await axios.post(
        `${pointsServiceUrl}/api/points/accounts`,
        {
          studentId: newStudent._id.toString(),
        },
        {
          headers: {
            Authorization: req.headers.authorization,
          },
        }
      );

      console.log(
        `Points account created for student ${newStudent._id}:`,
        response.data
      );
    } catch (error) {
      console.error("Failed to create points account:", error.message);
      if (error.response) {
        console.error("Response details:", error.response.data);
      }
      // Continue even if points account creation fails initially
    }

    res.status(201).json({
      success: true,
      message: "Student profile created successfully",
      data: newStudent,
    });
  } catch (error) {
    console.error("Create student profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create student profile",
      error: error.message,
    });
  }
};

// Update the linkWithParent method
exports.linkWithParent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { parentLinkCode } = req.body;

    if (!parentLinkCode) {
      return res.status(400).json({
        success: false,
        message: "Parent link code is required",
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

    // Find parent with link code
    const parent = await Parent.findOne({ linkCode: parentLinkCode });
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Invalid parent link code",
      });
    }

    // Check if already linked
    if (student.parentIds.includes(parent._id)) {
      return res.status(400).json({
        success: false,
        message: "Already linked with this parent",
      });
    }

    // Link parent to student
    student.parentIds.push(parent._id);
    await student.save();

    // Link student to parent
    if (!parent.childIds.includes(student._id)) {
      parent.childIds.push(student._id);
      await parent.save();
    }

    res.status(200).json({
      success: true,
      message: "Successfully linked with parent",
      data: {
        parentId: parent._id,
      },
    });
  } catch (error) {
    console.error("Link with parent error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to link with parent",
      error: error.message,
    });
  }
};

// Get student badges
exports.getStudentBadges = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get badges
    const badges = await Badge.find({
      _id: { $in: student.badges },
    });

    res.status(200).json({
      success: true,
      data: badges,
    });
  } catch (error) {
    console.error("Get student badges error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get student badges",
      error: error.message,
    });
  }
};

// Get student level and progress
exports.getStudentLevel = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // This would normally call the points-service API
    res.status(200).json({
      success: true,
      data: {
        level: student.level,
        // Points data will come from points-service later
        currentPoints: 0,
        pointsNeededForNextLevel: 100,
        progressPercentage: 0,
      },
    });
  } catch (error) {
    console.error("Get student level error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get student level",
      error: error.message,
    });
  }
};

// Link with school
exports.linkWithSchool = async (req, res) => {
  try {
    const userId = req.user.id;
    const { schoolCode } = req.body;

    if (!schoolCode) {
      return res.status(400).json({
        success: false,
        message: "School join code is required",
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

    if(!schoolClass?.teacherId) {
      return res.status(400).json({
        success: false,
        message: "Class is not linked to a teacher. Please contact your school administrator",
      });
    }

    // Update student with school and class
    student.schoolId = schoolClass.schoolId;

    // Add student to class if not already added
    if (!schoolClass.studentIds.includes(student._id)) {
      schoolClass.studentIds.push(student._id);
      await schoolClass.save();
    }

    // Add teacher to student's teachers if not already added
    if (
      schoolClass.teacherId &&
      !student.teacherIds.includes(schoolClass.teacherId)
    ) {
      student.teacherIds.push(schoolClass.teacherId);
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: "Successfully linked with school",
      data: {
        schoolId: schoolClass.schoolId,
        classId: schoolClass._id,
      },
    });
  } catch (error) {
    console.error("Link with school error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to link with school",
      error: error.message,
    });
  }
};

// Add this controller function
// Update student's points account ID
exports.updatePointsAccount = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { pointsAccountId } = req.body;

    if (!pointsAccountId) {
      return res.status(400).json({
        success: false,
        message: "Points account ID is required",
      });
    }

    // Update the student with the points account ID
    const student = await Student.findByIdAndUpdate(
      studentId,
      { pointsAccountId },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Points account ID updated successfully",
      data: {
        studentId,
        pointsAccountId,
      },
    });
  } catch (error) {
    console.error("Update points account ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update points account ID",
      error: error.message,
    });
  }
};

// Unlink student from parent
exports.unlinkFromParent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { parentId } = req.params;

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check permissions
    const isOwnProfile = student.userId.toString() === req.user.id;
    const isAdmin = req.user.roles.includes("platform_admin");
    const isParent = req.user.roles.includes("parent");

    // Only allow student themselves, admin, or the parent to unlink
    if (
      !isOwnProfile &&
      !isAdmin &&
      (!isParent || !student.parentIds.includes(parentId))
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to unlink this relationship",
      });
    }

    // Check if parent exists in student's parents
    if (!student.parentIds.includes(parentId)) {
      return res.status(400).json({
        success: false,
        message: "Parent is not linked to this student",
      });
    }

    // Remove parent from student
    student.parentIds = student.parentIds.filter(
      (id) => id.toString() !== parentId
    );
    await student.save();

    // Remove student from parent
    const parent = await Parent.findById(parentId);
    if (parent) {
      parent.childIds = parent.childIds.filter(
        (id) => id.toString() !== studentId
      );
      await parent.save();
    }

    // Create relationship history record
    // This would be implemented if you have a relationship history model

    res.status(200).json({
      success: true,
      message: "Successfully unlinked student from parent",
    });
  } catch (error) {
    console.error("Unlink from parent error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unlink student from parent",
      error: error.message,
    });
  }
};

// Unlink student from school
exports.unlinkFromSchool = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check permissions
    const isOwnProfile = student.userId.toString() === req.user.id;
    const isAdmin = req.user.roles.includes("platform_admin");
    const isSchoolAdmin = req.user.roles.includes("school_admin");

    // Only allow student themselves, platform admin, or school admin to unlink
    if (
      !isOwnProfile &&
      !isAdmin &&
      (!isSchoolAdmin || !req.user.schoolId === student.schoolId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to unlink from school",
      });
    }

    // Check if student is linked to a school
    if (!student.schoolId) {
      return res.status(400).json({
        success: false,
        message: "Student is not linked to any school",
      });
    }

    const schoolId = student.schoolId;

    // Remove student from all classes in the school
    const classes = await SchoolClass.find({ schoolId, studentIds: studentId });
    for (const cls of classes) {
      cls.studentIds = cls.studentIds.filter(
        (id) => id.toString() !== studentId
      );
      await cls.save();
    }

    // Remove teachers from student
    // We need to be careful here as a teacher might be associated with multiple classes
    // Only remove teachers that are exclusively from this school
    const teachersToKeep = [];
    for (const teacherId of student.teacherIds) {
      const teacher = await Teacher.findById(teacherId);
      if (teacher && teacher.schoolId.toString() !== schoolId.toString()) {
        teachersToKeep.push(teacherId);
      }
    }
    student.teacherIds = teachersToKeep;

    // Clear school ID
    student.schoolId = null;
    await student.save();

    // Create relationship history record
    // This would be implemented if you have a relationship history model

    res.status(200).json({
      success: true,
      message: "Successfully unlinked student from school",
    });
  } catch (error) {
    console.error("Unlink from school error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unlink student from school",
      error: error.message,
    });
  }
};
// Update student profile
exports.updateStudentProfile = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { grade, level } = req.body;

    // Check permissions
    const isOwnProfile = req.user.id === studentId;
    const isAdmin = req.user.roles.includes("platform_admin");
    const isParent = req.user.roles.includes("parent");

    // Only allow the student themselves, admin, or the parent to update
    if (!isOwnProfile && !isAdmin && !isParent) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this profile",
      });
    }

    // Find and update student
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        grade: grade !== undefined ? grade : undefined,
        level: level !== undefined ? level : undefined,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student profile updated successfully",
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Update student profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update student profile",
      error: error.message,
    });
  }
};

// Request link with parent (simplified version for direct use)
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

    // Forward to link request controller
    const linkRequestController = require("./linkRequest.controller");
    return linkRequestController.requestParentLink(req, res);
  } catch (error) {
    console.error("Request parent link error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to request parent link",
      error: error.message,
    });
  }
};

// Request link with school (simplified version)
exports.requestSchoolLink = async (req, res) => {
  try {
    const userId = req.user.id;
    const { schoolCode } = req.body;

    if (!schoolCode) {
      return res.status(400).json({
        success: false,
        message: "School code is required",
      });
    }

    // Forward to link request controller
    const linkRequestController = require("./linkRequest.controller");
    return linkRequestController.requestSchoolLink(req, res);
  } catch (error) {
    console.error("Request school link error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to request school link",
      error: error.message,
    });
  }
};

// Get student by userId
exports.getStudentByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const student = await Student.findOne({ userId })
      .populate("userId", "firstName lastName email avatar dateOfBirth")
      .populate("parentIds", "userId firstName lastName")
      .populate("teacherIds", "userId firstName lastName");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Get student by userId error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get student",
      error: error.message,
    });
  }
};

// Get parent link requests for student
exports.getParentLinkRequests = async (req, res) => {
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

    // Find pending link requests where this student is the target and parent is the initiator
    const requests = await LinkRequest.find({
      targetId: student._id,
      requestType: "parent",
      initiator: "Parent",
      status: "pending",
    });

    // We need to find the parent information for each request
    const formattedRequests = [];
    for (const request of requests) {
      try {
        // Get parent information (initiator)
        const parent = await Parent.findById(request.initiatorId).populate('userId', 'firstName lastName email avatar');
        
        const parentUser = parent?.userId;

        formattedRequests.push({
          _id: request._id,
          parentName: parentUser ? `${parentUser.firstName} ${parentUser.lastName}` : "Unknown",
          parentEmail: parentUser ? parentUser.email : (request.targetEmail || "Unknown"),
          parentAvatar: parentUser?.avatar || null,
          code: request.code,
          createdAt: request.createdAt,
          expiresAt: request.expiresAt
        });
      } catch (err) {
        console.error("Error processing link request:", err);
        // Continue with other requests
      }
    }

    res.status(200).json({
      success: true,
      data: formattedRequests,
    });
  } catch (error) {
    console.error("Get parent link requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get parent link requests",
      error: error.message,
    });
  }
};

// Respond to a parent link request
exports.respondToParentLinkRequest = async (req, res) => {
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

    // Find student
    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Find request
    const request = await LinkRequest.findOne({
      _id: requestId,
      targetId: student._id,
      requestType: "parent",
      initiator: "Parent",
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
      // Get the parent who initiated the request
      const parent = await Parent.findById(request.initiatorId);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Parent not found",
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
    console.error("Respond to parent link request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to respond to parent link request",
      error: error.message,
    });
  }
};

// Get all classes that a student is part of
exports.getStudentClasses = async (req, res) => {
  try {
    const studentId = req.params.id;
    console.log('studentId', studentId)

    // Find student to verify it exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Find all classes where this student is enrolled
    const classes = await SchoolClass.find({
      studentIds: studentId
    })
    .populate('teacherId', 'userId')
    .populate({
      path: 'teacherId',
      populate: {
        path: 'userId',
        select: 'firstName lastName email avatar'
      }
    })
    .populate('schoolId', 'name address')
    .sort({ name: 1 });

    // Format the response to include relevant class information
    const formattedClasses = classes.map(classObj => ({
      _id: classObj._id,
      name: classObj.name,
      grade: classObj.grade,
      joinCode: classObj.joinCode,
      schedule: classObj.schedule,
      academicYear: classObj.academicYear,
      academicTerm: classObj.academicTerm,
      teacher: classObj.teacherId ? {
        _id: classObj.teacherId._id,
        name: classObj.teacherId.userId ? 
          `${classObj.teacherId.userId.firstName} ${classObj.teacherId.userId.lastName}` : 
          'Unknown Teacher',
        email: classObj.teacherId.userId?.email,
        avatar: classObj.teacherId.userId?.avatar
      } : null,
      school: classObj.schoolId ? {
        _id: classObj.schoolId._id,
        name: classObj.schoolId.name,
        address: classObj.schoolId.address
      } : null,
      studentCount: classObj.studentIds.length,
      createdAt: classObj.createdAt,
      updatedAt: classObj.updatedAt
    }));

    res.status(200).json({
      success: true,
      data: formattedClasses,
      message: `Found ${formattedClasses.length} classes for student`
    });

  } catch (error) {
    console.error("Get student classes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get student classes",
      error: error.message,
    });
  }
};

// Get student classes by user ID (alternative endpoint for current user)
exports.getMyClasses = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('userid', userId)

    // Find student by userId
    const student = await Student.findOne({ userId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    console.log('student', student)

    // Set the student ID in params and call the main function
    req.params.id = student._id.toString();
    return exports.getStudentClasses(req, res);

  } catch (error) {
    console.error("Get my classes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get classes",
      error: error.message,
    });
  }
};

// Get student's attendance details for a specific class
const getStudentClassAttendanceDetails = async (req, res) => {
  try {
    const { studentId, classId } = req.params;
    
    // Verify the student exists and belongs to the authenticated user
    const student = await Student.findById(studentId).populate('userId');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get class details to check schedule
    const schoolClass = await SchoolClass.findById(classId);
    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if student is enrolled in this class
    if (!schoolClass.studentIds.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Student is not enrolled in this class",
      });
    }

    // Get current date info
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Calculate current month range
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);

    // Get all attendance records for this student in this class
    const allAttendanceRecords = await ClassAttendance.find({
      studentId,
      classId,
    }).sort({ attendanceDate: 1 });

    // Get attendance records for current month
    const currentMonthRecords = await ClassAttendance.find({
      studentId,
      classId,
      attendanceDate: {
        $gte: monthStart,
        $lte: monthEnd,
      },
    }).sort({ attendanceDate: 1 });

    // Calculate scheduled days in current month
    const scheduledDaysInMonth = [];
    const currentDate = new Date(monthStart);
    
    while (currentDate <= monthEnd) {
      const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      const isScheduled = schoolClass.schedule.some(scheduleItem =>
        scheduleItem.dayOfWeek === dayOfWeek
      );
      
      if (isScheduled) {
        scheduledDaysInMonth.push(new Date(currentDate));
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate attendance rate for current month
    const totalScheduledDaysInMonth = scheduledDaysInMonth.length;
    const presentDaysInMonth = currentMonthRecords.filter(record => record.status === 'present').length;
    const attendanceRate = totalScheduledDaysInMonth > 0 
      ? Math.round((presentDaysInMonth / totalScheduledDaysInMonth) * 100) 
      : 0;

    // Calculate points earned in current month
    const pointsThisMonth = currentMonthRecords.reduce((sum, record) => 
      sum + (record.pointsAwarded || 0), 0
    );

    // Function to check if a date is a scheduled class day
    const isScheduledDay = (date) => {
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      return schoolClass.schedule.some(scheduleItem => scheduleItem.dayOfWeek === dayOfWeek);
    };

    // Calculate streaks based on scheduled days only
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Create a map of attendance records by date for efficient lookup
    const attendanceMap = new Map();
    allAttendanceRecords.forEach(record => {
      const dateKey = record.attendanceDate.toISOString().split('T')[0];
      attendanceMap.set(dateKey, record);
    });

    // Get all scheduled days from the earliest attendance record to today
    const earliestDate = allAttendanceRecords.length > 0 
      ? new Date(allAttendanceRecords[0].attendanceDate) 
      : new Date();
    
    const scheduledDays = [];
    const iterDate = new Date(earliestDate);
    const today = new Date();
    
    while (iterDate <= today) {
      if (isScheduledDay(iterDate)) {
        scheduledDays.push(new Date(iterDate));
      }
      iterDate.setDate(iterDate.getDate() + 1);
    }

    // Calculate longest streak by going through all scheduled days
    for (const scheduledDay of scheduledDays) {
      const dateKey = scheduledDay.toISOString().split('T')[0];
      const attendanceRecord = attendanceMap.get(dateKey);
      
      if (attendanceRecord && attendanceRecord.status === 'present') {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calculate current streak (from the most recent scheduled days backwards)
    const recentScheduledDays = scheduledDays.slice(-30).reverse(); // Last 30 scheduled days, reversed
    
    for (const scheduledDay of recentScheduledDays) {
      const dateKey = scheduledDay.toISOString().split('T')[0];
      const attendanceRecord = attendanceMap.get(dateKey);
      
      if (attendanceRecord && attendanceRecord.status === 'present') {
        currentStreak++;
      } else {
        break; // Stop at first non-present day
      }
    }

    // Get last 7 recent attendance records (only for scheduled days)
    const recentAttendance = [];
    const last30ScheduledDays = scheduledDays.slice(-30).reverse(); // Get more days to ensure we have enough records
    
    for (const scheduledDay of last30ScheduledDays) {
      if (recentAttendance.length >= 7) break;
      
      const dateKey = scheduledDay.toISOString().split('T')[0];
      const attendanceRecord = attendanceMap.get(dateKey);
      
      recentAttendance.push({
        date: scheduledDay,
        dayOfWeek: scheduledDay.toLocaleDateString('en-US', { weekday: 'long' }),
        status: attendanceRecord ? attendanceRecord.status : 'not_recorded',
        pointsAwarded: attendanceRecord ? attendanceRecord.pointsAwarded : 0,
        recordedAt: attendanceRecord ? attendanceRecord.recordedAt : null,
      });
    }

    // Check today's class schedule and attendance status
    const todayDayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
    const todayDateKey = today.toISOString().split('T')[0];
    
    // Check if class is scheduled today
    const todaysSchedule = schoolClass.schedule.filter(scheduleItem => 
      scheduleItem.dayOfWeek === todayDayOfWeek
    );
    
    const todaysClassInfo = {
      isScheduledToday: todaysSchedule.length > 0,
      schedule: todaysSchedule,
      attendanceMarked: false,
      attendanceStatus: null,
      attendanceDetails: null,
    };
    
    // If class is scheduled today, check if attendance has been marked
    if (todaysClassInfo.isScheduledToday) {
      const todaysAttendanceRecord = attendanceMap.get(todayDateKey);
      
      if (todaysAttendanceRecord) {
        todaysClassInfo.attendanceMarked = true;
        todaysClassInfo.attendanceStatus = todaysAttendanceRecord.status;
        todaysClassInfo.attendanceDetails = {
          status: todaysAttendanceRecord.status,
          recordedAt: todaysAttendanceRecord.recordedAt,
          recordedBy: todaysAttendanceRecord.recordedBy,
          recordedByRole: todaysAttendanceRecord.recordedByRole,
          comments: todaysAttendanceRecord.comments,
          pointsAwarded: todaysAttendanceRecord.pointsAwarded || 0,
        };
      }
    }

    res.status(200).json({
      success: true,
      data: {
        studentInfo: {
          id: student._id,
          name: `${student.userId.firstName} ${student.userId.lastName}`,
          email: student.userId.email,
        },
        classInfo: {
          id: schoolClass._id,
          name: schoolClass.name,
          grade: schoolClass.grade,
        },
        statistics: {
          currentStreak,
          longestStreak,
          attendanceRate,
          pointsThisMonth,
          totalScheduledDaysInMonth,
          presentDaysInMonth,
        },
        todaysClass: todaysClassInfo,
        recentAttendance,
        monthInfo: {
          month: currentMonth + 1,
          year: currentYear,
          totalScheduledDays: totalScheduledDaysInMonth,
        },
      },
    });
  } catch (error) {
    console.error("Get student class attendance details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get student attendance details",
      error: error.message,
    });
  }
};


// Join Class using class code
exports.joinClass = async (req, res) => {
  const useTransactions = process.env.NODE_ENV === 'production' || process.env.USE_TRANSACTIONS === 'true';
  let session = null;
  if (useTransactions) {
    session = await mongoose.startSession();
    session.startTransaction();
  }
  try {
    const { classCode } = req.body;
    const { id: studentId } = req.user;

    if (!classCode || typeof classCode !== 'string') {
      const err = new Error("Valid class code is required");
      err.statusCode = 400;
      throw err;
    }

    const student = await Student.findOne({ userId: studentId }).session(session);

    if (!student) {
      const err = new Error("Student not found");
      err.statusCode = 404;
      throw err;
    }

    // Ensure student is associated with a school before joining
    if (!student.schoolId) {
      const err = new Error("Student is not linked to any school");
      err.statusCode = 400;
      throw err;
    }

    // Find the class within the same school using join code
    const schoolClass = await SchoolClass.findOne({
      joinCode: classCode,
      schoolId: student.schoolId
    }).session(session);

    if (!schoolClass) {
      const err = new Error("Class not found");
      err.statusCode = 404;
      throw err;
    }

    // Prevent duplicate enrollment (ObjectId-safe comparison)
    if (schoolClass.studentIds.some(id => id.equals(student._id))) {
      const err = new Error("Student is already in this class");
      err.statusCode = 400;
      throw err;
    }

    // Fixed: Use session in options object for updates
    const updateOptions = { new: true };
    if (session) {
      updateOptions.session = session;
    }

    // Add student to class using $addToSet (avoids duplicates on race conditions)
    const updatedClass = await SchoolClass.findOneAndUpdate(
      { joinCode: classCode, schoolId: student.schoolId },
      { $addToSet: { studentIds: student._id } },
      updateOptions
    )

    if (!updatedClass) {
      const err = new Error("Class no longer exists or access denied");
      err.statusCode = 404;
      throw err;
    }

    // Add teacher reference to student if not already linked
    await Student.findOneAndUpdate(
      { userId: studentId },
      { $addToSet: { teacherIds: updatedClass.teacherId } },
      updateOptions
    );

    // Commit transaction if using transactions
    if (useTransactions && session) {
      await session.commitTransaction();
    }

    return res.status(200).json({
      success: true,
      message: "Class joined successfully",
      data: updatedClass
    });

  } catch (error) {
    // Abort transaction if using transactions
    if (useTransactions && session && session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("Join class error:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
}

exports.getStudentClassAttendanceDetails = getStudentClassAttendanceDetails;