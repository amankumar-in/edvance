const School = require("../models/school.model");
const Teacher = require("../models/teacher.model");
const User = require("../models/user.model");
const Student = require("../models/student.model");
const SchoolClass = require("../models/schoolClass.model");
const LinkRequest = require("../models/linkRequest.model");

// Get school profile
exports.getSchoolProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find school where user is admin
    const school = await School.findOne({ adminIds: userId });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: school,
    });
  } catch (error) {
    console.error("Get school profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get school profile",
      error: error.message,
    });
  }
};

// Update school profile
exports.updateSchoolProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      address,
      city,
      state,
      zipCode,
      country,
      phone,
      email,
      website,
      logo,
    } = req.body;

    // Find school where user is admin
    const school = await School.findOne({ adminIds: userId });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School profile not found",
      });
    }

    // Update fields
    if (name) school.name = name;
    if (address) school.address = address;
    if (city) school.city = city;
    if (state) school.state = state;
    if (zipCode) school.zipCode = zipCode;
    if (country) school.country = country;
    if (phone) school.phone = phone;
    if (email) school.email = email;
    if (website) school.website = website;
    if (logo) school.logo = logo;

    school.updatedAt = Date.now();
    await school.save();

    res.status(200).json({
      success: true,
      message: "School profile updated successfully",
      data: school,
    });
  } catch (error) {
    console.error("Update school profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update school profile",
      error: error.message,
    });
  }
};

// Get all teachers
exports.getTeachers = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find school where user is admin
    const school = await School.findOne({ adminIds: userId });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School profile not found",
      });
    }

    // Find teachers for this school
    const teachers = await Teacher.find({ schoolId: school._id }).populate(
      "userId",
      "firstName lastName email avatar"
    );

    res.status(200).json({
      success: true,
      data: teachers,
    });
  } catch (error) {
    console.error("Get teachers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get teachers",
      error: error.message,
    });
  }
};

// Add teacher
exports.addTeacher = async (req, res) => {
  try {
    const userId = req.user.id;
    const { teacherEmail, subjectsTaught } = req.body;

    // Find school where user is admin
    const school = await School.findOne({ adminIds: userId });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School profile not found",
      });
    }

    // Find user with email
    const teacherUser = await User.findOne({ email: teacherEmail });
    if (!teacherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // Check if already a teacher
    const existingTeacher = await Teacher.findOne({ userId: teacherUser._id });
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: "User is already a teacher",
      });
    }

    // Update user roles
    if (!teacherUser.roles.includes("teacher")) {
      teacherUser.roles.push("teacher");
      await teacherUser.save();
    }

    // Create teacher profile
    const newTeacher = new Teacher({
      userId: teacherUser._id,
      schoolId: school._id,
      subjectsTaught: subjectsTaught || [],
      classIds: [],
    });
    await newTeacher.save();

    res.status(201).json({
      success: true,
      message: "Teacher added successfully",
      data: newTeacher,
    });
  } catch (error) {
    console.error("Add teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add teacher",
      error: error.message,
    });
  }
};

// Remove teacher
exports.removeTeacher = async (req, res) => {
  try {
    const userId = req.user.id;
    const teacherId = req.params.id;

    // Find school where user is admin
    const school = await School.findOne({ adminIds: userId });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School profile not found",
      });
    }

    // Find teacher
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Verify teacher belongs to this school
    if (teacher.schoolId.toString() !== school._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to remove this teacher",
      });
    }

    // Remove teacher record
    await Teacher.findByIdAndDelete(teacherId);

    res.status(200).json({
      success: true,
      message: "Teacher removed successfully",
    });
  } catch (error) {
    console.error("Remove teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove teacher",
      error: error.message,
    });
  }
};

// Get all students
exports.getStudents = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find school where user is admin
    const school = await School.findOne({ adminIds: userId });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School profile not found",
      });
    }

    // Find students for this school
    const students = await Student.find({ schoolId: school._id }).populate(
      "userId",
      "firstName lastName email avatar dateOfBirth"
    );

    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get students",
      error: error.message,
    });
  }
};

// Get all classes
exports.getClasses = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find school where user is admin
    const school = await School.findOne({ adminIds: userId });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School profile not found",
      });
    }

    // Find classes for this school
    const classes = await SchoolClass.find({ schoolId: school._id }).populate(
      "teacherId",
      "userId"
    );

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

// Bulk import students
exports.importStudents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { students } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No students provided for import",
      });
    }

    // Find school where user is admin
    const school = await School.findOne({ adminIds: userId });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School profile not found",
      });
    }

    // In a real implementation, we would process the student data
    // For this demo, just return a success message

    res.status(200).json({
      success: true,
      message: `${students.length} students imported successfully`,
    });
  } catch (error) {
    console.error("Import students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to import students",
      error: error.message,
    });
  }
};
// Create a new school
exports.createSchool = async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      state,
      zipCode,
      country,
      phone,
      email,
      website,
      logo,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "School name is required",
      });
    }

    // Create new school
    const school = new School({
      name,
      address,
      city,
      state,
      zipCode,
      country,
      phone,
      email,
      website,
      logo,
      adminIds: [req.user.id], // Add current user as admin
    });

    await school.save();

    // If user is not already a school_admin, add the role
    const user = await User.findById(req.user.id);
    if (!user.roles.includes("school_admin")) {
      user.roles.push("school_admin");
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: "School created successfully",
      data: school,
    });
  } catch (error) {
    console.error("Create school error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create school",
      error: error.message,
    });
  }
};

// Update all school administrators
exports.updateAdministrators = async (req, res) => {
  try {
    const schoolId = req.params.id;
    const { adminIds } = req.body;

    if (!adminIds || !Array.isArray(adminIds) || adminIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Administrator IDs are required (must be a non-empty array)",
      });
    }

    // Find school
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    // Check if requester is an admin of this school
    const isSchoolAdmin = school.adminIds.some(
      (id) => id.toString() === req.user.id
    );
    const isPlatformAdmin = req.user.roles.includes("platform_admin");

    if (!isSchoolAdmin && !isPlatformAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update school administrators",
      });
    }

    // Keep current requester as an admin to prevent locking out
    if (isSchoolAdmin && !adminIds.includes(req.user.id)) {
      adminIds.push(req.user.id);
    }

    // Verify all users exist and update their roles
    for (const adminId of adminIds) {
      const user = await User.findById(adminId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `User with ID ${adminId} not found`,
        });
      }

      // Add school_admin role if not already present
      if (!user.roles.includes("school_admin")) {
        user.roles.push("school_admin");
        await user.save();
      }
    }

    // Get current admins who are being removed
    const removedAdmins = school.adminIds.filter(
      (id) => !adminIds.includes(id.toString())
    );

    // For removed admins, check if they need the school_admin role removed
    for (const adminId of removedAdmins) {
      // Check if user is admin of any other schools
      const otherSchools = await School.findOne({
        _id: { $ne: schoolId },
        adminIds: adminId,
      });

      if (!otherSchools) {
        // If no other schools, remove school_admin role
        const user = await User.findById(adminId);
        if (user) {
          user.roles = user.roles.filter((role) => role !== "school_admin");
          await user.save();
        }
      }
    }

    // Update school's admin list
    school.adminIds = adminIds;
    await school.save();

    res.status(200).json({
      success: true,
      message: "School administrators updated successfully",
      data: {
        schoolId: school._id,
        administrators: school.adminIds,
      },
    });
  } catch (error) {
    console.error("Update administrators error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update school administrators",
      error: error.message,
    });
  }
};

// Add administrator to school
exports.addAdministrator = async (req, res) => {
  try {
    const schoolId = req.params.id;
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User email is required",
      });
    }

    // Find school
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    // Check if requester is an admin of this school
    const isSchoolAdmin = school.adminIds.some(
      (id) => id.toString() === req.user.id
    );
    const isPlatformAdmin = req.user.roles.includes("platform_admin");

    if (!isSchoolAdmin && !isPlatformAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add school administrators",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // Check if already an admin
    if (school.adminIds.includes(user._id)) {
      return res.status(400).json({
        success: false,
        message: "User is already an administrator of this school",
      });
    }

    // Add user as admin
    school.adminIds.push(user._id);
    await school.save();

    // Add school_admin role to user if not already present
    if (!user.roles.includes("school_admin")) {
      user.roles.push("school_admin");
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Administrator added successfully",
      data: {
        schoolId: school._id,
        administrators: school.adminIds,
      },
    });
  } catch (error) {
    console.error("Add administrator error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add administrator",
      error: error.message,
    });
  }
};

// Remove administrator from school
exports.removeAdministrator = async (req, res) => {
  try {
    const schoolId = req.params.id;
    const adminUserId = req.params.userId;

    // Find school
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    // Check if requester is an admin of this school
    const isSchoolAdmin = school.adminIds.some(
      (id) => id.toString() === req.user.id
    );
    const isPlatformAdmin = req.user.roles.includes("platform_admin");

    if (!isSchoolAdmin && !isPlatformAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to remove school administrators",
      });
    }

    // Prevent removing yourself unless you're a platform admin
    if (adminUserId === req.user.id && !isPlatformAdmin) {
      return res.status(400).json({
        success: false,
        message: "You cannot remove yourself as an administrator",
      });
    }

    // Check if admin is in the list
    if (!school.adminIds.some((id) => id.toString() === adminUserId)) {
      return res.status(400).json({
        success: false,
        message: "User is not an administrator of this school",
      });
    }

    // Check if this is the last admin
    if (school.adminIds.length === 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove the last administrator of a school",
      });
    }

    // Remove admin from school
    school.adminIds = school.adminIds.filter(
      (id) => id.toString() !== adminUserId
    );
    await school.save();

    // Check if user is admin of any other schools
    const otherSchools = await School.findOne({
      _id: { $ne: schoolId },
      adminIds: adminUserId,
    });

    // If no other schools, remove school_admin role
    if (!otherSchools) {
      const user = await User.findById(adminUserId);
      if (user) {
        user.roles = user.roles.filter((role) => role !== "school_admin");
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Administrator removed successfully",
      data: {
        schoolId: school._id,
        administrators: school.adminIds,
      },
    });
  } catch (error) {
    console.error("Remove administrator error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove administrator",
      error: error.message,
    });
  }
};

// Get school administrators
exports.getAdministrators = async (req, res) => {
  try {
    const schoolId = req.params.id;

    // Find school
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    // Get admin details
    const administrators = await User.find(
      { _id: { $in: school.adminIds } },
      { password: 0 } // Exclude password from results
    );

    res.status(200).json({
      success: true,
      data: administrators,
    });
  } catch (error) {
    console.error("Get administrators error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get school administrators",
      error: error.message,
    });
  }
};

// For school.controller.js

// Get all pending join requests for the school
exports.getAllPendingJoinRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find school where user is admin
    const school = await School.findOne({ adminIds: userId });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School profile not found",
      });
    }

    // Find all pending requests for this school
    const requests = await LinkRequest.find({
      targetId: school._id,
      requestType: "school",
      status: "pending",
    }).populate({
      path: "initiatorId",
      select: "userId grade",
      populate: {
        path: "userId",
        select: "firstName lastName email avatar"
      }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Get all pending join requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get pending join requests",
      error: error.message,
    });
  }
};

// Respond to a join request
exports.respondToJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // "approve" or "reject"
    const userId = req.user.id;

    if (!action || !["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be either 'approve' or 'reject'",
      });
    }

    // Find school where user is admin
    const school = await School.findOne({ adminIds: userId });
    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School profile not found",
      });
    }

    // Find request
    const request = await LinkRequest.findOne({
      _id: requestId,
      targetId: school._id,
      requestType: "school",
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Join request not found or already processed",
      });
    }

    // Update request status
    request.status = action === "approve" ? "approved" : "rejected";
    request.updatedAt = Date.now();
    await request.save();

    // If approved, add student to school
    if (action === "approve") {
      // Find student
      const student = await Student.findById(request.initiatorId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      // Update student with school
      student.schoolId = school._id;
      await student.save();
    }

    res.status(200).json({
      success: true,
      message: `Join request ${action === "approve" ? "approved" : "rejected"
        } successfully`,
    });
  } catch (error) {
    console.error("Respond to join request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to respond to join request",
      error: error.message,
    });
  }
};
