const College = require("../models/college.model");
const uploadMiddleware = require("../middleware/upload.middleware");

// @desc    Get all colleges
// @route   GET /api/colleges
// @access  Public
const getAllColleges = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      isFeatured,
      location,
      tier,
      search,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";
    if (location) filter.location = { $regex: location, $options: "i" };
    if (tier) filter.tier = tier;
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { courses: { $in: [new RegExp(search, "i")] } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    console.log(JSON.stringify(filter, null, 2))

    // Execute query with pagination
    const colleges = await College.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

      console.log(colleges)

    // Get total count for pagination
    const totalColleges = await College.countDocuments(filter);
    const totalPages = Math.ceil(totalColleges / parseInt(limit));

    res.status(200).json({
      success: true,
      data: colleges,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalColleges,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
        sortOptions,
        limit: parseInt(limit),
      }
    });
  } catch (error) {
    console.error("Get all colleges error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch colleges",
      error: error.message,
    });
  }
};

// @desc    Get single college by ID
// @route   GET /api/colleges/:id
// @access  Public
const getCollegeById = async (req, res) => {
  try {
    const { id } = req.params;

    const college = await College.findById(id).select("-__v");

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    res.status(200).json({
      success: true,
      data: college,
    });
  } catch (error) {
    console.error("Get college by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch college",
      error: error.message,
    });
  }
};

// @desc    Create new college
// @route   POST /api/colleges
// @access  Private (Admin only)
const createCollege = async (req, res) => {
  try {
    let {
      name,
      location,
      shortDescription,
      description,
      logo,
      bannerImage,
      courses,
      website,
      contactEmail,
      contactPhone,
      tier,
      isFeatured,
      status,
      highlight1,
      highlight2,
      highlight3
    } = req.body;

    // Parse courses array from FormData if needed
    if (typeof courses === 'string') {
      try {
        courses = JSON.parse(courses);
      } catch (e) {
        courses = [];
      }
    } else if (!Array.isArray(courses)) {
      // Handle FormData array format (courses[0], courses[1], etc.)
      courses = [];
      let index = 0;
      while (req.body[`courses[${index}]`]) {
        courses.push(req.body[`courses[${index}]`]);
        index++;
      }
    }

    // Parse boolean values from FormData
    if (typeof isFeatured === 'string') {
      isFeatured = isFeatured === 'true';
    }

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "College name is required",
      });
    }

    // Check if college with same name already exists
    const existingCollege = await College.findOne({ 
      name: { $regex: `^${name}$`, $options: "i" } 
    });

    if (existingCollege) {
      return res.status(409).json({
        success: false,
        message: "College with this name already exists",
      });
    }

    // Create new college
    const college = new College({
      name,
      location,
      shortDescription,
      description,
      logo,
      bannerImage,
      courses: courses || [],
      website,
      contactEmail,
      contactPhone,
      tier,
      isFeatured: isFeatured || false,
      status: status || "draft",
      highlight1,
      highlight2,
      highlight3
    });

    // Handle file uploads for logo and banner
    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        const logoUrl = uploadMiddleware.getFileUrl(req.files.logo[0].filename);
        college.logo = logoUrl;
      }
      if (req.files.bannerImage && req.files.bannerImage[0]) {
        const bannerUrl = uploadMiddleware.getFileUrl(req.files.bannerImage[0].filename);
        college.bannerImage = bannerUrl;
      }
    }

    const savedCollege = await college.save();

    res.status(201).json({
      success: true,
      message: "College created successfully",
      data: savedCollege,
    });
  } catch (error) {
    console.error("Create college error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create college",
      error: error.message,
    });
  }
};

// @desc    Update college
// @route   PUT /api/colleges/:id
// @access  Private (Admin only)
const updateCollege = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // Parse courses array from FormData if needed
    if (typeof updateData.courses === 'string') {
      try {
        updateData.courses = JSON.parse(updateData.courses);
      } catch (e) {
        updateData.courses = [];
      }
    } else if (!Array.isArray(updateData.courses)) {
      // Handle FormData array format (courses[0], courses[1], etc.)
      const courses = [];
      let index = 0;
      while (req.body[`courses[${index}]`]) {
        courses.push(req.body[`courses[${index}]`]);
        index++;
      }
      if (courses.length > 0) {
        updateData.courses = courses;
      }
    }

    // Parse boolean values from FormData
    if (typeof updateData.isFeatured === 'string') {
      updateData.isFeatured = updateData.isFeatured === 'true';
    }

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;

    // Check if college exists
    const existingCollege = await College.findById(id);
    if (!existingCollege) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    // If name is being updated, check for duplicates
    if (updateData.name && updateData.name !== existingCollege.name) {
      const duplicateCollege = await College.findOne({
        name: { $regex: `^${updateData.name}$`, $options: "i" },
        _id: { $ne: id }
      });

      if (duplicateCollege) {
        return res.status(409).json({
          success: false,
          message: "College with this name already exists",
        });
      }
    }

    // Handle file uploads for logo and banner
    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        const logoUrl = uploadMiddleware.getFileUrl(req.files.logo[0].filename);
        updateData.logo = logoUrl;
      }
      if (req.files.bannerImage && req.files.bannerImage[0]) {
        const bannerUrl = uploadMiddleware.getFileUrl(req.files.bannerImage[0].filename);
        updateData.bannerImage = bannerUrl;
      }
    }

    // Update college
    const updatedCollege = await College.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { 
        new: true, 
        runValidators: true,
        select: "-__v"
      }
    );

    res.status(200).json({
      success: true,
      message: "College updated successfully",
      data: updatedCollege,
    });
  } catch (error) {
    console.error("Update college error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update college",
      error: error.message,
    });
  }
};

// @desc    Delete college
// @route   DELETE /api/colleges/:id
// @access  Private (Admin only)
const deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;

    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    await College.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "College deleted successfully",
      data: { deletedId: id },
    });
  } catch (error) {
    console.error("Delete college error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete college",
      error: error.message,
    });
  }
};

// @desc    Get featured colleges
// @route   GET /api/colleges/featured
// @access  Public
const getFeaturedColleges = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const featuredColleges = await College.find({
      isFeatured: true,
      status: "published"
    })
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .select("-__v");

    res.status(200).json({
      success: true,
      data: featuredColleges,
      count: featuredColleges.length,
    });
  } catch (error) {
    console.error("Get featured colleges error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured colleges",
      error: error.message,
    });
  }
};

// @desc    Toggle college featured status
// @route   PATCH /api/colleges/:id/featured
// @access  Private (Admin only)
const toggleFeaturedStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    college.isFeatured = !college.isFeatured;
    await college.save();

    res.status(200).json({
      success: true,
      message: `College ${college.isFeatured ? "featured" : "unfeatured"} successfully`,
      data: {
        id: college._id,
        name: college.name,
        isFeatured: college.isFeatured,
      },
    });
  } catch (error) {
    console.error("Toggle featured status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle featured status",
      error: error.message,
    });
  }
};

// @desc    Update college status
// @route   PATCH /api/colleges/:id/status
// @access  Private (Admin only)
const updateCollegeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["draft", "published"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'draft' or 'published'",
      });
    }

    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    college.status = status;
    await college.save();

    res.status(200).json({
      success: true,
      message: `College status updated to ${status}`,
      data: {
        id: college._id,
        name: college.name,
        status: college.status,
      },
    });
  } catch (error) {
    console.error("Update college status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update college status",
      error: error.message,
    });
  }
};

module.exports = {
  getAllColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
  getFeaturedColleges,
  toggleFeaturedStatus,
  updateCollegeStatus,
};