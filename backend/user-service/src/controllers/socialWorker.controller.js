const SocialWorker = require("../models/socialWorker.model");
const Student = require("../models/student.model");
const User = require("../models/user.model");

// Get social worker profile
exports.getSocialWorkerProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const socialWorker = await SocialWorker.findOne({ userId });
    if (!socialWorker) {
      return res.status(404).json({
        success: false,
        message: "Social worker profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: socialWorker,
    });
  } catch (error) {
    console.error("Get social worker profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get social worker profile",
      error: error.message,
    });
  }
};

// Get assigned children
exports.getAssignedChildren = async (req, res) => {
  try {
    const userId = req.user.id;

    const socialWorker = await SocialWorker.findOne({ userId });
    if (!socialWorker) {
      return res.status(404).json({
        success: false,
        message: "Social worker profile not found",
      });
    }

    const children = await Student.find({
      _id: { $in: socialWorker.assignedChildIds },
    }).populate("userId", "firstName lastName email avatar dateOfBirth");

    res.status(200).json({
      success: true,
      data: children,
    });
  } catch (error) {
    console.error("Get assigned children error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get assigned children",
      error: error.message,
    });
  }
};

// Create social worker profile
exports.createSocialWorkerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { organization, caseloadLimit } = req.body;

    // Check if social worker profile already exists
    const existingSocialWorker = await SocialWorker.findOne({ userId });
    if (existingSocialWorker) {
      return res.status(400).json({
        success: false,
        message: "Social worker profile already exists",
      });
    }

    // Create new social worker profile
    const newSocialWorker = new SocialWorker({
      userId,
      organization,
      caseloadLimit,
      assignedChildIds: [],
      caseNotes: [],
    });

    await newSocialWorker.save();

    res.status(201).json({
      success: true,
      message: "Social worker profile created successfully",
      data: newSocialWorker,
    });
  } catch (error) {
    console.error("Create social worker profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create social worker profile",
      error: error.message,
    });
  }
};

// Update social worker profile
exports.updateSocialWorkerProfile = async (req, res) => {
  try {
    const socialWorkerId = req.params.id;
    const { organization, caseloadLimit } = req.body;

    // Find social worker
    const socialWorker = await SocialWorker.findById(socialWorkerId);
    if (!socialWorker) {
      return res.status(404).json({
        success: false,
        message: "Social worker profile not found",
      });
    }

    // Check permissions
    const isOwnProfile = socialWorker.userId.toString() === req.user.id;
    const isAdmin = req.user.roles.includes("platform_admin");

    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this profile",
      });
    }

    // Update fields
    if (organization) {
      socialWorker.organization = organization;
    }

    if (caseloadLimit !== undefined) {
      socialWorker.caseloadLimit = caseloadLimit;
    }

    socialWorker.updatedAt = Date.now();
    await socialWorker.save();

    res.status(200).json({
      success: true,
      message: "Social worker profile updated successfully",
      data: socialWorker,
    });
  } catch (error) {
    console.error("Update social worker profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update social worker profile",
      error: error.message,
    });
  }
};

// Assign child to social worker
exports.assignChild = async (req, res) => {
  try {
    const socialWorkerId = req.params.id;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // Find social worker
    const socialWorker = await SocialWorker.findById(socialWorkerId);
    if (!socialWorker) {
      return res.status(404).json({
        success: false,
        message: "Social worker profile not found",
      });
    }

    // Verify permissions
    const isOwnProfile = socialWorker.userId.toString() === req.user.id;
    const isAdmin = req.user.roles.includes("platform_admin");
    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this social worker's assignments",
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

    // Check if already assigned
    if (socialWorker.assignedChildIds.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Student is already assigned to this social worker",
      });
    }

    // Check caseload limit if defined
    if (
      socialWorker.caseloadLimit &&
      socialWorker.assignedChildIds.length >= socialWorker.caseloadLimit
    ) {
      return res.status(400).json({
        success: false,
        message: "Social worker has reached their caseload limit",
      });
    }

    // Add student to social worker
    socialWorker.assignedChildIds.push(studentId);
    await socialWorker.save();

    res.status(200).json({
      success: true,
      message: "Student assigned to social worker successfully",
      data: socialWorker,
    });
  } catch (error) {
    console.error("Assign child error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign child to social worker",
      error: error.message,
    });
  }
};

// Remove child from social worker
exports.removeChild = async (req, res) => {
  try {
    const socialWorkerId = req.params.id;
    const { childId } = req.params;

    // Find social worker
    const socialWorker = await SocialWorker.findById(socialWorkerId);
    if (!socialWorker) {
      return res.status(404).json({
        success: false,
        message: "Social worker profile not found",
      });
    }

    // Verify permissions
    const isOwnProfile = socialWorker.userId.toString() === req.user.id;
    const isAdmin = req.user.roles.includes("platform_admin");
    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this social worker's assignments",
      });
    }

    // Check if student is assigned
    if (!socialWorker.assignedChildIds.includes(childId)) {
      return res.status(400).json({
        success: false,
        message: "Student is not assigned to this social worker",
      });
    }

    // Remove student from social worker
    socialWorker.assignedChildIds = socialWorker.assignedChildIds.filter(
      (id) => id.toString() !== childId
    );
    await socialWorker.save();

    res.status(200).json({
      success: true,
      message: "Student removed from social worker successfully",
    });
  } catch (error) {
    console.error("Remove child error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove child from social worker",
      error: error.message,
    });
  }
};

// Add case note for a child
exports.addCaseNote = async (req, res) => {
  try {
    const socialWorkerId = req.params.id;
    const { studentId, note } = req.body;

    if (!studentId || !note) {
      return res.status(400).json({
        success: false,
        message: "Student ID and note are required",
      });
    }

    // Find social worker
    const socialWorker = await SocialWorker.findById(socialWorkerId);
    if (!socialWorker) {
      return res.status(404).json({
        success: false,
        message: "Social worker profile not found",
      });
    }

    // Verify permissions
    const isOwnProfile = socialWorker.userId.toString() === req.user.id;
    const isAdmin = req.user.roles.includes("platform_admin");
    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add case notes for this social worker",
      });
    }

    // Verify student is assigned to this social worker
    if (!socialWorker.assignedChildIds.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Student is not assigned to this social worker",
      });
    }

    // Add case note
    const caseNote = {
      studentId,
      note,
      date: new Date(),
    };

    socialWorker.caseNotes.push(caseNote);
    await socialWorker.save();

    res.status(201).json({
      success: true,
      message: "Case note added successfully",
      data: caseNote,
    });
  } catch (error) {
    console.error("Add case note error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add case note",
      error: error.message,
    });
  }
};

// Get case notes for a specific child
exports.getCaseNotes = async (req, res) => {
  try {
    const socialWorkerId = req.params.id;
    const { studentId } = req.params;

    // Find social worker
    const socialWorker = await SocialWorker.findById(socialWorkerId);
    if (!socialWorker) {
      return res.status(404).json({
        success: false,
        message: "Social worker profile not found",
      });
    }

    // Verify permissions
    const isOwnProfile = socialWorker.userId.toString() === req.user.id;
    const isAdmin = req.user.roles.includes("platform_admin");
    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view case notes for this social worker",
      });
    }

    // Verify student is assigned to this social worker
    if (!socialWorker.assignedChildIds.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Student is not assigned to this social worker",
      });
    }

    // Get case notes for the specific student
    const caseNotes = socialWorker.caseNotes.filter(
      (note) => note.studentId.toString() === studentId
    );

    res.status(200).json({
      success: true,
      data: caseNotes,
    });
  } catch (error) {
    console.error("Get case notes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get case notes",
      error: error.message,
    });
  }
};

// Get social worker profile by ID
exports.getSocialWorkerProfileById = async (req, res) => {
  try {
    const userId = req.params.id;

    const socialWorker = await SocialWorker.findOne({ userId }).populate("assignedChildIds");
    if (!socialWorker) {
      return res.status(404).json({
        success: false,
        message: "Social worker profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: socialWorker,
    });
  } catch (error) {
    console.error("Get social worker profile by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get social worker profile",
      error: error.message,
    });
  }
};
