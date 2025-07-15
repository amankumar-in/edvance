// attendance.controller.js
const Attendance = require("../models/attendance.model");
const Student = require("../models/student.model");
const SchoolClass = require("../models/schoolClass.model");
const fs = require("fs").promises;
const path = require("path");

const axios = require("axios");

// Get student attendance
exports.getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { startDate, endDate } = req.query;

    // Create filter
    const filter = { studentId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Get attendance records
    const attendance = await Attendance.find(filter)
      .sort({ date: -1 })
      .populate("recordedBy", "firstName lastName");

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    console.error("Get student attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get attendance records",
      error: error.message,
    });
  }
};

// Daily check in attendance
exports.checkIn = async (req, res) => {
  try {
    const studentId = req.params.id;
    const userId = req.user.id;

    // Verify student
    const student = await Student.findOne({ userId, _id: studentId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found or not authorized",
      });
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await Attendance.findOne({
      studentId,
      date: { $gte: today, $lte: endOfDay },
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: "Already checked in today",
      });
    }

    // Create attendance record
    const newAttendance = new Attendance({
      studentId,
      date: new Date(),
      status: "present",
      recordedBy: userId,
      recordedByRole: "student",
      comments: "Self check-in",
      pointsAwarded: 0, // Will be updated after points service response
    });

    await newAttendance.save();

    // Update student streaks
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const yesterdayAttendance = await Attendance.findOne({
      studentId,
      date: { $gte: yesterday, $lte: yesterdayEnd },
      status: "present",
    });

    if (yesterdayAttendance) {
      student.attendanceStreak += 1;
    } else {
      student.attendanceStreak = 1;
    }

    student.lastCheckInDate = new Date();
    await student.save();

    // Award points through points service
    const MAX_RETRIES = 3;
    let pointsSuccess = false;
    let retryCount = 0;
    let pointsResponse = null;

    while (!pointsSuccess && retryCount < MAX_RETRIES) {
      try {
        const pointsServiceUrl =
          process.env.NODE_ENV === "production"
            ? process.env.PRODUCTION_POINTS_SERVICE_URL
            : process.env.POINTS_SERVICE_URL;

        const response = await axios.post(
          `${pointsServiceUrl}/api/points/transactions`,
          {
            studentId,
            amount: 1, // Just a placeholder, points service will calculate actual amount
            type: "earned",
            source: "attendance",
            sourceId: newAttendance._id.toString(),
            description: "Daily attendance check-in",
            awardedBy: userId,
            awardedByRole: "student",
            metadata: {
              sourceType: "daily_check_in",
              date: new Date().toISOString().split("T")[0],
              streak: student.attendanceStreak,
            },
          },
          {
            headers: {
              Authorization: req.headers.authorization,
            },
            timeout: 5000,
          }
        );

        pointsResponse = response.data;
        pointsSuccess = true;
        console.log(`Points awarded for attendance to student ${studentId}`);
        
        // Update attendance record with actual points awarded
        if (pointsResponse?.data?.transaction?.amount) {
          newAttendance.pointsAwarded = pointsResponse.data.transaction.amount;
          await newAttendance.save();
        }
      } catch (error) {
        retryCount++;
        console.error(
          `Failed to award attendance points (attempt ${retryCount}):`,
          error.message
        );

        if (retryCount >= MAX_RETRIES) {
          console.error("Max retries reached. Failed to award points.");
          await logFailedTransaction({
            type: "attendance",
            studentId,
            attendanceId: newAttendance._id.toString(),
            date: new Date(),
            error: error.message,
          });
        } else {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          );
        }
      }
    }

    // Check for streak badges
    try {
      const badgeService = require("../services/badge.service");
      const awardedBadges = await badgeService.checkAndAwardBadges(
        studentId,
        "attendance_streak",
        {
          streak: student.attendanceStreak,
          authorization: req.headers.authorization,
        }
      );

      if (awardedBadges.length > 0) {
        console.log(
          `Awarded ${awardedBadges.length} attendance badges to student ${studentId}`
        );
      }
    } catch (error) {
      console.error("Failed to check for attendance badges:", error);
    }

    // Get points awarded from response if available
    const pointsAwarded = pointsResponse?.data?.transaction?.amount || 0;

    res.status(201).json({
      success: true,
      message: "Check-in successful",
      data: {
        attendance: newAttendance,
        pointsAwarded,
        currentStreak: student.attendanceStreak,
      },
    });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check in",
      error: error.message,
    });
  }
};

// Get all attendance records (with filters)
exports.getAllAttendance = async (req, res) => {
  try {
    const {
      studentId,
      schoolId,
      startDate,
      endDate,
      status,
      page = 1,
      limit = 20,
    } = req.query;

    // Build filter
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (schoolId) filter.schoolId = schoolId;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get records
    const records = await Attendance.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("recordedBy", "firstName lastName")
      .populate("studentId", "userId");

    // Get total count for pagination
    const total = await Attendance.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        records,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get all attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get attendance records",
      error: error.message,
    });
  }
};

// Record attendance (for teachers/admins)
exports.recordAttendance = async (req, res) => {
  try {
    const { studentId, date, status, comments } = req.body;
    const recordedBy = req.user.id;

    if (!studentId || !status) {
      return res.status(400).json({
        success: false,
        message: "Student ID and status are required",
      });
    }

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Determine points based on status
    let pointsAwarded = 0;
    if (status === "present") {
      pointsAwarded = 5; // Default points for attendance
    }

    // Create or update attendance record
    const attendanceDate = date ? new Date(date) : new Date();
    // Set time to start of day for consistent comparison
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if record already exists for this date
    let attendance = await Attendance.findOne({
      studentId,
      date: {
        $gte: attendanceDate,
        $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (attendance) {
      // Update existing record
      attendance.status = status;
      attendance.recordedBy = recordedBy;
      attendance.recordedByRole = req.user.roles[0];
      attendance.comments = comments || attendance.comments;
      attendance.updatedAt = Date.now();

      // Only update points if status changed from non-present to present
      if (attendance.status !== "present" && status === "present") {
        attendance.pointsAwarded = pointsAwarded;
      } else if (attendance.status === "present" && status !== "present") {
        // Status changed from present to non-present, remove points
        attendance.pointsAwarded = 0;
      }
    } else {
      // Create new record
      attendance = new Attendance({
        studentId,
        schoolId: student.schoolId,
        date: attendanceDate,
        status,
        recordedBy,
        recordedByRole: req.user.roles[0],
        pointsAwarded: status === "present" ? pointsAwarded : 0,
        comments,
      });
    }

    await attendance.save();

    // Update streak if present
    if (status === "present") {
      // Check yesterday's attendance
      const yesterday = new Date(attendanceDate);
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);

      const yesterdayAttendance = await Attendance.findOne({
        studentId,
        date: { $gte: yesterday, $lte: yesterdayEnd },
        status: "present",
      });

      if (yesterdayAttendance) {
        student.attendanceStreak += 1;
      } else {
        student.attendanceStreak = 1;
      }

      student.lastCheckInDate = attendanceDate;
      await student.save();

      // Award points if status is present
      try {
        const pointsServiceUrl =
          process.env.NODE_ENV === "production"
            ? process.env.PRODUCTION_POINTS_SERVICE_URL
            : process.env.POINTS_SERVICE_URL;

        await axios.post(
          `${pointsServiceUrl}/api/points/transactions`,
          {
            studentId,
            amount: pointsAwarded,
            type: "earned",
            source: "attendance",
            sourceId: attendance._id.toString(),
            description: "Attendance recorded by teacher",
            awardedBy: recordedBy,
            awardedByRole: req.user.roles[0],
            metadata: {
              sourceType: "teacher_recorded",
              date: attendanceDate.toISOString().split("T")[0],
              streak: student.attendanceStreak,
            },
          },
          {
            headers: {
              Authorization: req.headers.authorization,
            },
          }
        );
      } catch (error) {
        console.error("Failed to award attendance points:", error.message);
      }

      // Check for badges
      try {
        const badgeService = require("../services/badge.service");
        await badgeService.checkAndAwardBadges(studentId, "attendance_streak", {
          streak: student.attendanceStreak,
          authorization: req.headers.authorization,
        });
      } catch (error) {
        console.error("Failed to check for attendance badges:", error);
      }
    }

    res.status(200).json({
      success: true,
      message: "Attendance recorded successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Record attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record attendance",
      error: error.message,
    });
  }
};

// Record bulk attendance (for multiple students)
exports.recordBulkAttendance = async (req, res) => {
  try {
    const { records, date } = req.body;
    const recordedBy = req.user.id;

    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Attendance records are required",
      });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    // Set time to start of day for consistent comparison
    attendanceDate.setHours(0, 0, 0, 0);

    const results = {
      success: [],
      failed: [],
    };

    // Process each record
    for (const record of records) {
      try {
        const { studentId, status, comments } = record;

        if (!studentId || !status) {
          results.failed.push({
            studentId,
            error: "Student ID and status are required",
          });
          continue;
        }

        // Find student
        const student = await Student.findById(studentId);
        if (!student) {
          results.failed.push({
            studentId,
            error: "Student not found",
          });
          continue;
        }

        // Determine points based on status
        let pointsAwarded = 0;
        if (status === "present") {
          pointsAwarded = 5; // Default points for attendance
        }

        // Check if record already exists for this date
        let attendance = await Attendance.findOne({
          studentId,
          date: {
            $gte: attendanceDate,
            $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
          },
        });

        if (attendance) {
          // Update existing record
          attendance.status = status;
          attendance.recordedBy = recordedBy;
          attendance.recordedByRole = req.user.roles[0];
          attendance.comments = comments || attendance.comments;
          attendance.updatedAt = Date.now();

          // Only update points if status changed
          if (attendance.status !== "present" && status === "present") {
            attendance.pointsAwarded = pointsAwarded;
          } else if (attendance.status === "present" && status !== "present") {
            attendance.pointsAwarded = 0;
          }
        } else {
          // Create new record
          attendance = new Attendance({
            studentId,
            schoolId: student.schoolId,
            date: attendanceDate,
            status,
            recordedBy,
            recordedByRole: req.user.roles[0],
            pointsAwarded: status === "present" ? pointsAwarded : 0,
            comments,
          });
        }

        await attendance.save();

        // Update streak if present
        if (status === "present") {
          // Check yesterday's attendance
          const yesterday = new Date(attendanceDate);
          yesterday.setDate(yesterday.getDate() - 1);

          const yesterdayEnd = new Date(yesterday);
          yesterdayEnd.setHours(23, 59, 59, 999);

          const yesterdayAttendance = await Attendance.findOne({
            studentId,
            date: { $gte: yesterday, $lte: yesterdayEnd },
            status: "present",
          });

          if (yesterdayAttendance) {
            student.attendanceStreak += 1;
          } else {
            student.attendanceStreak = 1;
          }

          student.lastCheckInDate = attendanceDate;
          await student.save();

          // Award points
          try {
            const pointsServiceUrl =
              process.env.NODE_ENV === "production"
                ? process.env.PRODUCTION_POINTS_SERVICE_URL
                : process.env.POINTS_SERVICE_URL;

            await axios.post(
              `${pointsServiceUrl}/api/points/transactions`,
              {
                studentId,
                amount: pointsAwarded,
                type: "earned",
                source: "attendance",
                sourceId: attendance._id.toString(),
                description: "Attendance recorded by teacher",
                awardedBy: recordedBy,
                awardedByRole: req.user.roles[0],
                metadata: {
                  sourceType: "bulk_recorded",
                  date: attendanceDate.toISOString().split("T")[0],
                  streak: student.attendanceStreak,
                },
              },
              {
                headers: {
                  Authorization: req.headers.authorization,
                },
              }
            );
          } catch (error) {
            console.error(
              `Failed to award attendance points for student ${studentId}:`,
              error.message
            );
          }

          // Check for badges
          try {
            const badgeService = require("../services/badge.service");
            await badgeService.checkAndAwardBadges(
              studentId,
              "attendance_streak",
              {
                streak: student.attendanceStreak,
                authorization: req.headers.authorization,
              }
            );
          } catch (error) {
            console.error(
              `Failed to check badges for student ${studentId}:`,
              error
            );
          }
        }

        results.success.push({
          studentId,
          status: attendance.status,
          date: attendance.date,
        });
      } catch (error) {
        console.error(`Error processing student ${record.studentId}:`, error);
        results.failed.push({
          studentId: record.studentId,
          error: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${results.success.length} attendance records, ${results.failed.length} failed`,
      data: results,
    });
  } catch (error) {
    console.error("Bulk attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process bulk attendance",
      error: error.message,
    });
  }
};

// Generate attendance report
exports.generateReport = async (req, res) => {
  try {
    const { schoolId, classId, startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    // Build query
    const query = {};
    if (schoolId) query.schoolId = schoolId;

    // Add date range
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };

    // Get students for filter
    let studentIds = [];
    if (classId) {
      const schoolClass = await SchoolClass.findById(classId);
      if (!schoolClass) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }
      studentIds = schoolClass.studentIds;
      query.studentId = { $in: studentIds };
    }

    // Get all attendance records in range
    const records = await Attendance.find(query)
      .populate("studentId", "userId")
      .populate("recordedBy", "firstName lastName");

    // Group by student
    const studentAttendance = {};

    // Create a date range for all days in the period
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateRange = [];

    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      dateRange.push(new Date(dt));
    }

    // Initialize student records
    for (const record of records) {
      const studentId = record.studentId._id.toString();

      if (!studentAttendance[studentId]) {
        studentAttendance[studentId] = {
          studentId,
          studentName: `${record.studentId.userId.firstName} ${record.studentId.userId.lastName}`,
          totalDays: dateRange.length,
          present: 0,
          absent: 0,
          tardy: 0,
          excused: 0,
          percentage: 0,
          days: {},
        };

        // Initialize days to "none" status
        for (const date of dateRange) {
          const dateString = date.toISOString().split("T")[0];
          studentAttendance[studentId].days[dateString] = "none";
        }
      }

      // Count by status
      const recordDate = record.date.toISOString().split("T")[0];
      studentAttendance[studentId].days[recordDate] = record.status;

      if (record.status === "present") {
        studentAttendance[studentId].present += 1;
      } else if (record.status === "absent") {
        studentAttendance[studentId].absent += 1;
      } else if (record.status === "tardy") {
        studentAttendance[studentId].tardy += 1;
      } else if (record.status === "excused") {
        studentAttendance[studentId].excused += 1;
      }
    }

    // Calculate percentages
    for (const studentId in studentAttendance) {
      const student = studentAttendance[studentId];
      student.percentage = Math.round(
        (student.present / student.totalDays) * 100
      );
    }

    res.status(200).json({
      success: true,
      data: {
        dateRange: {
          start: startDate,
          end: endDate,
          totalDays: dateRange.length,
        },
        students: Object.values(studentAttendance),
      },
    });
  } catch (error) {
    console.error("Generate report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate attendance report",
      error: error.message,
    });
  }
};

// Get today's attendance for a class
exports.getTodayAttendance = async (req, res) => {
  try {
    const { classId } = req.query;

    if (!classId) {
      return res.status(400).json({
        success: false,
        message: "Class ID is required",
      });
    }

    // Get class and students
    const schoolClass = await SchoolClass.findById(classId);
    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Get attendance records for today
    const records = await Attendance.find({
      studentId: { $in: schoolClass.studentIds },
      date: { $gte: today, $lte: endOfDay },
    });

    // Get student details
    const students = await Student.find({
      _id: { $in: schoolClass.studentIds },
    }).populate("userId", "firstName lastName");

    // Build attendance data
    const attendanceData = students.map((student) => {
      const attendance = records.find(
        (r) => r.studentId.toString() === student._id.toString()
      );

      return {
        studentId: student._id,
        studentName: `${student.userId.firstName} ${student.userId.lastName}`,
        status: attendance ? attendance.status : "not_recorded",
        recordId: attendance ? attendance._id : null,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        class: {
          id: schoolClass._id,
          name: schoolClass.name,
          grade: schoolClass.grade,
        },
        date: today,
        attendance: attendanceData,
      },
    });
  } catch (error) {
    console.error("Get today's attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get today's attendance",
      error: error.message,
    });
  }
};

// Helper to log failed transactions for manual resolution
async function logFailedTransaction(data) {
  try {
    // In a production system, this would write to a database collection
    // For now, we'll just log to console and a file
    console.error("FAILED TRANSACTION:", JSON.stringify(data));

    // In a real implementation, you might:
    // 1. Write to a dedicated collection for failed transactions
    // 2. Set up a process to retry these periodically
    // 3. Alert administrators

    // For demonstration, we'll just create a basic log entry
    const fs = require("fs").promises;
    const path = require("path");
    const logDir = path.join(__dirname, "../../logs");

    try {
      await fs.mkdir(logDir, { recursive: true });
      const logPath = path.join(logDir, "failed-transactions.log");
      await fs.appendFile(
        logPath,
        `${new Date().toISOString()} - ${JSON.stringify(data)}\n`
      );
    } catch (fsError) {
      console.error("Could not write to log file:", fsError);
    }
  } catch (error) {
    console.error("Failed to log transaction failure:", error);
  }
}

// Get attendance summary with points
exports.getAttendanceSummary = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { startDate, endDate } = req.query;

    // Default to last 30 days if no dates provided
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
    }

    const end = endDate ? new Date(endDate) : new Date();
    if (!endDate) {
      end.setHours(23, 59, 59, 999);
    }

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get attendance records
    const attendanceRecords = await Attendance.find({
      studentId,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    // Calculate total days in the date range
    const totalDaysInRange = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    // If there are no records
    if (!attendanceRecords.length) {
      return res.status(200).json({
        success: true,
        data: {
          student: {
            id: studentId,
            currentStreak: student.attendanceStreak || 0,
          },
          summary: {
            totalDays: totalDaysInRange,
            present: 0,
            absent: 0,
            tardy: 0,
            excused: 0,
            attendanceRate: 0,
            pointsEarned: 0,
          },
          records: [],
        },
      });
    }

    // Calculate summary stats
    const summary = {
      totalDays: totalDaysInRange,
      present: 0,
      absent: 0,
      tardy: 0,
      excused: 0,
      pointsEarned: 0,
    };

    // Process records and add point data
    const records = [];
    let longestStreak = 0;
    let currentStreak = 0;

    // Get point data if available
    let pointsData = {};
    try {
      const pointsServiceUrl =
        process.env.NODE_ENV === "production"
          ? process.env.PRODUCTION_POINTS_SERVICE_URL
          : process.env.POINTS_SERVICE_URL;

      // Get attendance-related points
      const response = await axios.get(
        `${pointsServiceUrl}/api/points/transactions`,
        {
          params: {
            studentId,
            source: "attendance",
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          },
          headers: {
            Authorization: req.headers.authorization,
          },
          timeout: 3000,
        }
      );

      // Organize by sourceId (which is the attendance record ID)
      if (
        response.data &&
        response.data.data &&
        response.data.data.transactions
      ) {
        pointsData = response.data.data.transactions.reduce(
          (acc, transaction) => {
            if (transaction.sourceId) {
              acc[transaction.sourceId] = transaction;
            }
            return acc;
          },
          {}
        );
      }
    } catch (error) {
      console.error("Failed to fetch points data:", error.message);
      // Continue without points data
    }

    // Process attendance records and calculate proper streaks
    let previousDate = null;
    
    for (const record of attendanceRecords) {
      // Update summary
      summary[record.status] += 1;

      // Track streaks - check for gaps between dates
      const currentDate = new Date(record.date);
      
      if (record.status === "present") {
        // Check if there's a gap from the previous date
        if (previousDate) {
          const daysDiff = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24));
          if (daysDiff > 1) {
            // There's a gap, reset the streak
            currentStreak = 1;
          } else {
            // Consecutive day, increment streak
            currentStreak += 1;
          }
        } else {
          // First record or first present record
          currentStreak = 1;
        }
        
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
      } else {
        // Not present (absent, tardy, excused) - break the streak
        currentStreak = 0;
      }

      // Update previous date for next iteration
      previousDate = new Date(currentDate);

      // Get points for this record - first try from attendance record, then from points service
      let points = 0;
      if (record.pointsAwarded && record.pointsAwarded > 0) {
        points = record.pointsAwarded;
      } else {
        const pointsTransaction = pointsData[record._id.toString()];
        points = pointsTransaction ? pointsTransaction.amount : 0;
      }

      // Add points to total
      if (points > 0) {
        summary.pointsEarned += points;
      }

      // Format record with points
      records.push({
        id: record._id,
        date: record.date,
        status: record.status,
        points: points,
        recordedBy: record.recordedByRole,
        comments: record.comments,
      });
    }

    // Calculate attendance rate
    summary.attendanceRate = summary.totalDays > 0 
      ? Math.round((summary.present / summary.totalDays) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: studentId,
          currentStreak: student.attendanceStreak || 0,
          longestStreak: longestStreak,
          lastCheckInDate: student.lastCheckInDate,
        },
        summary,
        records,
      },
    });
  } catch (error) {
    console.error("Get attendance summary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get attendance summary",
      error: error.message,
    });
  }
};
