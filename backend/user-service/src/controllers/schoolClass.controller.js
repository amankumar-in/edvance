const SchoolClass = require("../models/schoolClass.model");
const Student = require("../models/student.model");
const Teacher = require("../models/teacher.model");
const User = require("../models/user.model");
const LinkRequest = require("../models/linkRequest.model");
const School = require("../models/school.model");

const crypto = require("crypto");

// Helper function to check if user is authorized to access a class
async function checkClassAuthorization(userId, classId) {
  try {
    // Check if user is a teacher assigned to this class
    const teacher = await Teacher.findOne({ userId });
    if (teacher && teacher.classIds.includes(classId)) {
      return {
        authorized: true,
        userType: 'teacher',
        profile: teacher
      };
    }

    // Check if user is a school admin for the school that owns this class
    const classDetails = await SchoolClass.findById(classId);
    if (classDetails) {
      const school = await School.findOne({
        _id: classDetails.schoolId,
        adminIds: userId
      });
      if (school) {
        return {
          authorized: true,
          userType: 'school_admin',
          profile: { schoolId: school._id },
          classDetails
        };
      }
    }

    return { authorized: false };
  } catch (error) {
    console.error("Authorization check error:", error);
    return { authorized: false };
  }
}

// Helper function to check if user can create/manage classes for a school
async function checkSchoolAuthorization(userId, schoolId) {
  try {
    // Check if user is a teacher for this school
    const teacher = await Teacher.findOne({ userId, schoolId });
    if (teacher) {
      return {
        authorized: true,
        userType: 'teacher',
        profile: teacher
      };
    }

    // Check if user is a school admin for this school
    const school = await School.findOne({
      _id: schoolId,
      adminIds: userId
    });
    if (school) {
      return {
        authorized: true,
        userType: 'school_admin',
        profile: { schoolId: school._id },
        school
      };
    }

    return { authorized: false };
  } catch (error) {
    console.error("School authorization check error:", error);
    return { authorized: false };
  }
}

// Get specific class details
exports.getClassDetails = async (req, res) => {
  try {
    const classId = req.params.id;
    const userId = req.user.id;

    // Check authorization
    const authResult = await checkClassAuthorization(userId, classId);
    if (!authResult.authorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this class",
      });
    }

    // Get class details
    const classDetails = await SchoolClass.findById(classId)
      .populate("schoolId", "name")
      .populate({
        path:"teacherId",
        select:"userId",
        populate:{
          path:"userId",
          select:"firstName lastName email avatar phoneNumber"
        }
      });

    if (!classDetails) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      data: classDetails,
    });
  } catch (error) {
    console.error("Get class details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get class details",
      error: error.message,
    });
  }
};

// Get class students
exports.getClassStudents = async (req, res) => {
  try {
    const classId = req.params.id;
    const userId = req.user.id;

    // Check authorization
    const authResult = await checkClassAuthorization(userId, classId);
    if (!authResult.authorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this class",
      });
    }

    // Get class
    const classDetails = authResult.classDetails || await SchoolClass.findById(classId);
    if (!classDetails) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Get students in class
    const students = await Student.find({
      _id: { $in: classDetails.studentIds },
    }).populate("userId", "firstName lastName email avatar dateOfBirth");

    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error("Get class students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get class students",
      error: error.message,
    });
  }
};

// Create new class
exports.createClass = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, grade, schoolId, schedule, academicYear, academicTerm } = req.body;

    if (!name || !schoolId) {
      return res.status(400).json({
        success: false,
        message: "Class name and school ID are required",
      });
    }

    if (!academicYear) {
      return res.status(400).json({
        success: false,
        message: "Academic year is required",
      });
    }

    // Validate schedule (mandatory)
    if (!schedule || schedule.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Schedule is required and cannot be empty",
      });
    }

    for (const scheduleItem of schedule) {
      if (!scheduleItem.dayOfWeek || !scheduleItem.startTime || !scheduleItem.endTime) {
        return res.status(400).json({
          success: false,
          message: "All schedule entries must have dayOfWeek, startTime, and endTime",
        });
      }
      
      if (scheduleItem.startTime >= scheduleItem.endTime) {
        return res.status(400).json({
          success: false,
          message: "Start time must be before end time in schedule",
        });
      }
    }

    // Check authorization
    const authResult = await checkSchoolAuthorization(userId, schoolId);
    if (!authResult.authorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to create a class for this school",
      });
    }

    // Generate join code
    const joinCode = generateUniqueJoinCode();

    // Create new class
    const newClass = new SchoolClass({
      name,
      grade: grade || null,
      schoolId,
      teacherId: authResult.userType === 'teacher' ? authResult.profile._id : null,
      studentIds: [],
      joinCode,
      schedule: schedule,
      academicYear: academicYear,
      academicTerm: academicTerm || null,
    });

    await newClass.save();

    // Add class to teacher's classes if user is a teacher
    if (authResult.userType === 'teacher') {
      authResult.profile.classIds.push(newClass._id);
      await authResult.profile.save();
    }

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: newClass,
    });
  } catch (error) {
    console.error("Create class error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create class",
      error: error.message,
    });
  }
};

// Update class
exports.updateClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const userId = req.user.id;
    const { name, grade, schedule, academicYear, academicTerm } = req.body;

    // Validate schedule if provided (mandatory if updating)
    if (schedule !== undefined) {
      if (!schedule || schedule.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Schedule is required and cannot be empty",
        });
      }

      for (const scheduleItem of schedule) {
        if (!scheduleItem.dayOfWeek || !scheduleItem.startTime || !scheduleItem.endTime) {
          return res.status(400).json({
            success: false,
            message: "All schedule entries must have dayOfWeek, startTime, and endTime",
          });
        }
        
        if (scheduleItem.startTime >= scheduleItem.endTime) {
          return res.status(400).json({
            success: false,
            message: "Start time must be before end time in schedule",
          });
        }
      }
    }

    // Check authorization
    const authResult = await checkClassAuthorization(userId, classId);
    if (!authResult.authorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this class",
      });
    }

    // Prepare update object
    const updateData = {
      updatedAt: Date.now(),
    };

    // Only update fields that are provided
    if (name !== undefined) updateData.name = name;
    if (grade !== undefined) updateData.grade = grade;
    if (schedule !== undefined) updateData.schedule = schedule;
    if (academicYear !== undefined) updateData.academicYear = academicYear;
    if (academicTerm !== undefined) updateData.academicTerm = academicTerm;

    // Find and update class
    const updatedClass = await SchoolClass.findByIdAndUpdate(
      classId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Class updated successfully",
      data: updatedClass,
    });
  } catch (error) {
    console.error("Update class error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update class",
      error: error.message,
    });
  }
};

// Delete class
exports.deleteClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const userId = req.user.id;

    // Check authorization
    const authResult = await checkClassAuthorization(userId, classId);
    if (!authResult.authorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this class",
      });
    }

    // Delete class
    const deletedClass = await SchoolClass.findByIdAndDelete(classId);
    if (!deletedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Remove class from teacher's classes if user is a teacher
    if (authResult.userType === 'teacher') {
      authResult.profile.classIds = authResult.profile.classIds.filter(
        (id) => id.toString() !== classId
      );
      await authResult.profile.save();
    }

    res.status(200).json({
      success: true,
      message: "Class deleted successfully",
      data: { classId: deletedClass._id },
    });
  } catch (error) {
    console.error("Delete class error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete class",
      error: error.message,
    });
  }
};

// Generate new join code
exports.generateJoinCode = async (req, res) => {
  try {
    const classId = req.params.id;
    const userId = req.user.id;

    // Check authorization
    const authResult = await checkClassAuthorization(userId, classId);
    if (!authResult.authorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to manage this class",
      });
    }

    // Generate new join code
    const joinCode = generateUniqueJoinCode();

    // Update class with new join code
    const updatedClass = await SchoolClass.findByIdAndUpdate(
      classId,
      {
        joinCode,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Join code generated successfully",
      data: { joinCode: updatedClass.joinCode, classId: updatedClass._id },
    });
  } catch (error) {
    console.error("Generate join code error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate join code",
      error: error.message,
    });
  }
};

// Add student to class
exports.addStudentToClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const userId = req.user.id;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // Check authorization
    const authResult = await checkClassAuthorization(userId, classId);
    if (!authResult.authorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to manage this class",
      });
    }

    // Find class
    const classDetails = authResult.classDetails || await SchoolClass.findById(classId);
    if (!classDetails) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if student already in class
    if (classDetails.studentIds.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Student already in this class",
      });
    }

    // Add student to class
    classDetails.studentIds.push(studentId);
    classDetails.updatedAt = Date.now();
    await classDetails.save();

    // Add teacher to student's teachers if class has a teacher and not already added
    if (classDetails.teacherId && !student.teacherIds.includes(classDetails.teacherId)) {
      student.teacherIds.push(classDetails.teacherId);
      await student.save();
    }

    res.status(200).json({
      success: true,
      message: "Student added to class successfully",
      data: classDetails,
    });
  } catch (error) {
    console.error("Add student to class error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add student to class",
      error: error.message,
    });
  }
};

// Helper function to generate unique join code
function generateUniqueJoinCode() {
  // Generate a random 6-character alphanumeric code
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

// Remove student from class
exports.removeStudentFromClass = async (req, res) => {
  try {
    const { id: classId, studentId } = req.params;
    const userId = req.user.id;

    // Check authorization
    const authResult = await checkClassAuthorization(userId, classId);
    if (!authResult.authorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to manage this class",
      });
    }

    // Find class
    const classDetails = authResult.classDetails || await SchoolClass.findById(classId);
    if (!classDetails) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if student in class
    if (!classDetails.studentIds.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Student not in this class",
      });
    }

    // Remove student from class
    classDetails.studentIds = classDetails.studentIds.filter(
      (id) => id.toString() !== studentId
    );
    classDetails.updatedAt = Date.now();
    await classDetails.save();

    // If the student is no longer in any class with this teacher, remove teacher from student
    if (classDetails.teacherId) {
      const student = await Student.findById(studentId);
      if (student) {
        const otherClassesWithTeacher = await SchoolClass.findOne({
          _id: { $ne: classId },
          teacherId: classDetails.teacherId,
          studentIds: studentId,
        });

        if (!otherClassesWithTeacher) {
          student.teacherIds = student.teacherIds.filter(
            (id) => id.toString() !== classDetails.teacherId.toString()
          );
          await student.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Student removed from class successfully",
    });
  } catch (error) {
    console.error("Remove student from class error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove student from class",
      error: error.message,
    });
  }
};

// Get pending class join requests
exports.getPendingJoinRequests = async (req, res) => {
  try {
    const classId = req.params.id;
    const userId = req.user.id;

    // Check authorization
    const authResult = await checkClassAuthorization(userId, classId);
    if (!authResult.authorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view join requests for this class",
      });
    }

    // Find class
    const classDetails = authResult.classDetails || await SchoolClass.findById(classId);
    if (!classDetails) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Find all pending requests for this school
    const requests = await LinkRequest.find({
      targetId: classDetails.schoolId,
      requestType: "school",
      status: "pending",
    }).populate("studentId", "userId");

    // Also populate student names
    const populatedRequests = [];
    for (const request of requests) {
      if (request.studentId && request.studentId.userId) {
        const studentUser = await User.findById(request.studentId.userId);
        if (studentUser) {
          populatedRequests.push({
            ...request.toObject(),
            studentName: `${studentUser.firstName} ${studentUser.lastName}`,
            studentGrade: request.studentId.grade,
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: populatedRequests,
    });
  } catch (error) {
    console.error("Get pending join requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get pending join requests",
      error: error.message,
    });
  }
};

// Respond to a class join request
exports.respondToJoinRequest = async (req, res) => {
  try {
    const classId = req.params.id;
    const requestId = req.params.requestId;
    const userId = req.user.id;
    const { action } = req.body; // "approve" or "reject"

    if (!action || !["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be either 'approve' or 'reject'",
      });
    }

    // Check authorization
    const authResult = await checkClassAuthorization(userId, classId);
    if (!authResult.authorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to manage join requests for this class",
      });
    }

    // Find class
    const classDetails = authResult.classDetails || await SchoolClass.findById(classId);
    if (!classDetails) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Find request
    const request = await LinkRequest.findOne({
      _id: requestId,
      targetId: classDetails.schoolId,
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

    // If approved, add student to class
    if (action === "approve") {
      // Find student
      const student = await Student.findById(request.studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      // Add student to class if not already added
      if (!classDetails.studentIds.includes(student._id)) {
        classDetails.studentIds.push(student._id);
        await classDetails.save();
      }

      // Update student with school and teacher
      student.schoolId = classDetails.schoolId;

      // Add teacher to student's teachers if class has a teacher and not already added
      if (classDetails.teacherId && !student.teacherIds.includes(classDetails.teacherId)) {
        student.teacherIds.push(classDetails.teacherId);
      }

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
