const Student = require("../models/student.model");
const Parent = require("../models/parent.model");
const Teacher = require("../models/teacher.model");
const School = require("../models/school.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");

// Search students with parameters
exports.searchStudents = async (req, res) => {
  try {
    const {
      name,
      email,
      grade,
      schoolId,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {};

    if (schoolId) {
      query.schoolId = schoolId;
    }

    if (grade) {
      query.grade = parseInt(grade);
    }

    // Need to use aggregation for name/email search because they're in the User model
    const pipeline = [];

    // First match on Student fields
    pipeline.push({ $match: query });

    // Lookup user details
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    });

    // Unwind the joined user array
    pipeline.push({ $unwind: "$user" });

    // Match on user fields if provided
    if (name || email) {
      const userQuery = {};

      if (name) {
        // Search in both first and last names
        userQuery.$or = [
          { "user.firstName": { $regex: name, $options: "i" } },
          { "user.lastName": { $regex: name, $options: "i" } },
        ];
      }

      if (email) {
        userQuery["user.email"] = { $regex: email, $options: "i" };
      }

      if (Object.keys(userQuery).length > 0) {
        pipeline.push({ $match: userQuery });
      }
    }

    // Add sort
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    // Handle sorting by user fields
    if (sortBy.startsWith("user.")) {
      pipeline.push({ $sort: { [sortBy]: sortDirection } });
    } else {
      pipeline.push({ $sort: { [sortBy]: sortDirection } });
    }

    // Count total matching documents before pagination
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: "total" });
    const countResult = await Student.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Execute the aggregation
    const students = await Student.aggregate(pipeline);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.status(200).json({
      success: true,
      data: {
        students,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: totalPages,
          hasNext,
          hasPrev,
        },
      },
    });
  } catch (error) {
    console.error("Search students error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search students",
      error: error.message,
    });
  }
};

// Search parents with parameters
exports.searchParents = async (req, res) => {
  try {
    const {
      name,
      email,
      childCount,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build pipeline
    const pipeline = [];

    // Initial match (no-op if empty)
    pipeline.push({ $match: {} });

    // Lookup user details
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    });

    // Unwind the joined user array
    pipeline.push({ $unwind: "$user" });

    // Match on user fields if provided
    if (name || email) {
      const userQuery = {};

      if (name) {
        userQuery.$or = [
          { "user.firstName": { $regex: name, $options: "i" } },
          { "user.lastName": { $regex: name, $options: "i" } },
        ];
      }

      if (email) {
        userQuery["user.email"] = { $regex: email, $options: "i" };
      }

      pipeline.push({ $match: userQuery });
    }

    // Add childCount filter if provided
    if (childCount) {
      // Add a field with the size of childIds array
      pipeline.push({
        $addFields: {
          childCount: { $size: "$childIds" },
        },
      });

      pipeline.push({
        $match: { childCount: parseInt(childCount) },
      });
    }

    // Add sort
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    // Handle sorting by user fields or regular fields
    if (sortBy.startsWith("user.")) {
      pipeline.push({ $sort: { [sortBy]: sortDirection } });
    } else {
      pipeline.push({ $sort: { [sortBy]: sortDirection } });
    }

    // Count total matching documents before pagination
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: "total" });
    const countResult = await Parent.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Execute the aggregation
    const parents = await Parent.aggregate(pipeline);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.status(200).json({
      success: true,
      data: {
        parents,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: totalPages,
          hasNext,
          hasPrev,
        },
      },
    });
  } catch (error) {
    console.error("Search parents error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search parents",
      error: error.message,
    });
  }
};

// Search teachers with parameters
exports.searchTeachers = async (req, res) => {
  try {
    const {
      name,
      email,
      schoolId,
      subject,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {};

    if (schoolId) {
      query.schoolId = schoolId;
    }

    if (subject) {
      query.subjectsTaught = { $regex: subject, $options: "i" };
    }

    // Need to use aggregation for name/email search
    const pipeline = [];

    // First match on Teacher fields
    pipeline.push({ $match: query });

    // Lookup user details
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    });

    // Unwind the joined user array
    pipeline.push({ $unwind: "$user" });

    // Match on user fields if provided
    if (name || email) {
      const userQuery = {};

      if (name) {
        userQuery.$or = [
          { "user.firstName": { $regex: name, $options: "i" } },
          { "user.lastName": { $regex: name, $options: "i" } },
        ];
      }

      if (email) {
        userQuery["user.email"] = { $regex: email, $options: "i" };
      }

      pipeline.push({ $match: userQuery });
    }

    // Add sort
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    // Handle sorting by user fields
    if (sortBy.startsWith("user.")) {
      pipeline.push({ $sort: { [sortBy]: sortDirection } });
    } else {
      pipeline.push({ $sort: { [sortBy]: sortDirection } });
    }

    // Count total matching documents before pagination
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: "total" });
    const countResult = await Teacher.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Execute the aggregation
    const teachers = await Teacher.aggregate(pipeline);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.status(200).json({
      success: true,
      data: {
        teachers,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: totalPages,
          hasNext,
          hasPrev,
        },
      },
    });
  } catch (error) {
    console.error("Search teachers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search teachers",
      error: error.message,
    });
  }
};

// Search schools with parameters
exports.searchSchools = async (req, res) => {
  try {
    const {
      name,
      city,
      state,
      zipCode,
      country,
      page = 1,
      limit = 20,
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    // Build query
    const query = {};

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (city) {
      query.city = { $regex: city, $options: "i" };
    }

    if (state) {
      query.state = { $regex: state, $options: "i" };
    }

    if (zipCode) {
      query.zipCode = { $regex: zipCode, $options: "i" };
    }

    if (country) {
      query.country = { $regex: country, $options: "i" };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Set sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get schools
    const schools = await School.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await School.countDocuments(query);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.status(200).json({
      success: true,
      data: {
        schools,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: totalPages,
          hasNext,
          hasPrev,
        },
      },
    });
  } catch (error) {
    console.error("Search schools error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search schools",
      error: error.message,
    });
  }
};
