const ClassAttendance = require("../models/classAttendance.model");
const SchoolClass = require("../models/schoolClass.model");
const Student = require("../models/student.model");
const axios = require("axios");

// Record attendance for a student in a class session
const recordStudentAttendance = async (req, res) => {
  try {
    const { classId, studentId } = req.params;
    const { attendanceDate, status, comments, activeRole } = req.body;
    const recordedBy = req.user.id;

    if (!attendanceDate || !status) {
      return res.status(400).json({
        success: false,
        message: "Attendance date and status are required",
      });
    }

    // Validate status
    if (!['present', 'absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'present' or 'absent'",
      });
    }

    // Validate that attendance date is not in the future
    const attendanceDateObj = new Date(attendanceDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today

    if (attendanceDateObj > today) {
      return res.status(400).json({
        success: false,
        message: "Cannot record attendance for future dates",
      });
    }

    // Get the class details to check schedule
    const schoolClass = await SchoolClass.findById(classId);
    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if the student is enrolled in this class
    if (!schoolClass.studentIds.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Student is not enrolled in this class",
      });
    }

    // Check if class is scheduled on this day
    const dayOfWeek = attendanceDateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const readableDate = attendanceDateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const isScheduled = schoolClass.schedule.some(scheduleItem =>
      scheduleItem.dayOfWeek === dayOfWeek
    );

    if (!isScheduled) {
      return res.status(400).json({
        success: false,
        message: `Class is not scheduled on ${dayOfWeek}`,
      });
    }

    // Create date range for the entire day
    const startOfDay = new Date(attendanceDateObj);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(attendanceDateObj);
    endOfDay.setHours(23, 59, 59, 999);

    // Find existing attendance record or create new one
    let attendanceRecord = await ClassAttendance.findOne({
      classId,
      studentId,
      attendanceDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    // Create history entry
    const historyEntry = {
      status,
      recordedBy,
      recordedByRole: activeRole,
      comments,
      recordedAt: new Date(),
    };

    if (attendanceRecord) {
      // Update existing record
      attendanceRecord.history.push(historyEntry);
      attendanceRecord.status = status;
      attendanceRecord.recordedBy = recordedBy;
      attendanceRecord.recordedByRole = activeRole;
      attendanceRecord.comments = comments;
      attendanceRecord.recordedAt = new Date();
    } else {
      // Create new record
      attendanceRecord = new ClassAttendance({
        studentId,
        classId,
        attendanceDate: attendanceDateObj,
        status,
        recordedBy,
        recordedByRole: activeRole,
        comments,
        recordedAt: new Date(),
        history: [historyEntry],
      });
    }

    await attendanceRecord.save();

    // Award points if present
    if (status === 'present') {
      try {
        const pointsServiceUrl =
          process.env.NODE_ENV === "production"
            ? process.env.PRODUCTION_POINTS_SERVICE_URL
            : process.env.POINTS_SERVICE_URL;

        const pointsResponse = await axios.post(
          `${pointsServiceUrl}/api/points/transactions`,
          {
            studentId,
            amount: 5, // Base points for class attendance
            type: "earned",
            source: "attendance",
            sourceId: attendanceRecord._id.toString(),
            description: `Class attendance - ${schoolClass.name} - ${readableDate}`,
            awardedBy: recordedBy,
            awardedByRole: activeRole,
            metadata: {
              sourceType: "attendance",
              classId: classId,
              attendanceDate: attendanceDate,
              dayOfWeek: dayOfWeek,
            },
          },
          {
            headers: {
              Authorization: req.headers.authorization,
            },
          }
        );

        if (pointsResponse.data?.data?.transaction?.amount) {
          attendanceRecord.pointsAwarded = pointsResponse.data.data.transaction.amount;
          await attendanceRecord.save();
        }
      } catch (error) {
        console.error("Failed to award class attendance points:", error.message);
      }
    }

    res.status(200).json({
      success: true,
      message: "Attendance recorded successfully",
      data: attendanceRecord,
    });
  } catch (error) {
    console.error("Record student attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record attendance",
      error: error.message,
    });
  }
};

// Bulk record attendance for multiple students
const recordBulkAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { sessionDate, startTime, attendanceData } = req.body;
    const recordedBy = req.user.id;

    if (!sessionDate || !startTime || !attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({
        success: false,
        message: "Session date, start time, and attendance data are required",
      });
    }

    const results = {
      success: [],
      failed: [],
    };

    // Process each attendance record
    for (const data of attendanceData) {
      try {
        const { studentId, status, comments, arrivalTime, departureTime } = data;

        if (!studentId || !status) {
          results.failed.push({
            studentId,
            error: "Student ID and status are required",
          });
          continue;
        }

        // Find the attendance record
        let attendanceRecord = await ClassAttendance.findOne({
          classId,
          studentId,
          sessionDate: new Date(sessionDate),
          scheduledStartTime: startTime,
        });

        if (!attendanceRecord) {
          results.failed.push({
            studentId,
            error: "Attendance record not found for this session",
          });
          continue;
        }

        // Update the record
        attendanceRecord.status = status;
        attendanceRecord.recordedBy = recordedBy;
        attendanceRecord.recordedByRole = req.user.roles[0];
        attendanceRecord.comments = comments;
        attendanceRecord.updatedAt = new Date();

        if (arrivalTime) {
          attendanceRecord.actualArrivalTime = new Date(arrivalTime);
        }
        if (departureTime) {
          attendanceRecord.actualDepartureTime = new Date(departureTime);
        }

        await attendanceRecord.save();

        // Award points if present
        if (status === 'present') {
          try {
            const pointsServiceUrl =
              process.env.NODE_ENV === "production"
                ? process.env.PRODUCTION_POINTS_SERVICE_URL
                : process.env.POINTS_SERVICE_URL;

            const pointsResponse = await axios.post(
              `${pointsServiceUrl}/api/points/transactions`,
              {
                studentId,
                amount: 10, // Base points for class attendance
                type: "earned",
                source: "class_attendance",
                sourceId: attendanceRecord._id.toString(),
                description: "Class attendance",
                awardedBy: recordedBy,
                awardedByRole: req.user.roles[0],
                metadata: {
                  sourceType: "class_session_bulk",
                  classId: classId,
                  sessionDate: sessionDate,
                  startTime: startTime,
                  isLate: attendanceRecord.metadata.isLate,
                  minutesLate: attendanceRecord.metadata.minutesLate,
                },
              },
              {
                headers: {
                  Authorization: req.headers.authorization,
                },
              }
            );

            if (pointsResponse.data?.data?.transaction?.amount) {
              attendanceRecord.pointsAwarded = pointsResponse.data.data.transaction.amount;
              await attendanceRecord.save();
            }
          } catch (error) {
            console.error(`Failed to award points for student ${studentId}:`, error.message);
          }
        }

        results.success.push({
          studentId,
          status: attendanceRecord.status,
          recordId: attendanceRecord._id,
        });
      } catch (error) {
        console.error(`Error processing student ${data.studentId}:`, error);
        results.failed.push({
          studentId: data.studentId,
          error: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${results.success.length} records, ${results.failed.length} failed`,
      data: results,
    });
  } catch (error) {
    console.error("Bulk record attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record bulk attendance",
      error: error.message,
    });
  }
};

// Get student's class attendance history
const getStudentClassAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { classId, startDate, endDate, academicYear, academicTerm } = req.query;

    // Build filter
    const filter = { studentId };

    if (classId) filter.classId = classId;
    if (academicYear) filter.academicYear = academicYear;
    if (academicTerm) filter.academicTerm = academicTerm;

    if (startDate || endDate) {
      filter.sessionDate = {};
      if (startDate) filter.sessionDate.$gte = new Date(startDate);
      if (endDate) filter.sessionDate.$lte = new Date(endDate);
    }

    // Get attendance records
    const attendanceRecords = await ClassAttendance.find(filter)
      .populate("classId", "name grade")
      .populate("recordedBy", "firstName lastName")
      .sort({ sessionDate: -1, scheduledStartTime: -1 });

    // Calculate summary statistics
    const summary = {
      totalSessions: attendanceRecords.length,
      present: attendanceRecords.filter(r => r.status === 'present').length,
      absent: attendanceRecords.filter(r => r.status === 'absent').length,
      tardy: attendanceRecords.filter(r => r.status === 'tardy').length,
      excused: attendanceRecords.filter(r => r.status === 'excused').length,
      totalPointsEarned: attendanceRecords.reduce((sum, r) => sum + (r.pointsAwarded || 0), 0),
    };

    summary.attendanceRate = summary.totalSessions > 0
      ? Math.round((summary.present / summary.totalSessions) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        summary,
        records: attendanceRecords,
      },
    });
  } catch (error) {
    console.error("Get student class attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get student class attendance",
      error: error.message,
    });
  }
};

// Get class attendance analytics
const getClassAttendanceAnalytics = async (req, res) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate, academicYear, academicTerm } = req.query;

    // Build filter
    const filter = { classId };

    if (academicYear) filter.academicYear = academicYear;
    if (academicTerm) filter.academicTerm = academicTerm;

    if (startDate || endDate) {
      filter.sessionDate = {};
      if (startDate) filter.sessionDate.$gte = new Date(startDate);
      if (endDate) filter.sessionDate.$lte = new Date(endDate);
    }

    // Get all attendance records
    const attendanceRecords = await ClassAttendance.find(filter)
      .populate("studentId", "userId")
      .populate("studentId.userId", "firstName lastName");

    // Group by student
    const studentStats = {};
    const sessionStats = {};

    attendanceRecords.forEach(record => {
      const studentId = record.studentId._id.toString();
      const sessionKey = `${record.sessionDate.toISOString().split('T')[0]}_${record.scheduledStartTime}`;

      // Student statistics
      if (!studentStats[studentId]) {
        studentStats[studentId] = {
          studentId,
          studentName: `${record.studentId.userId.firstName} ${record.studentId.userId.lastName}`,
          totalSessions: 0,
          present: 0,
          absent: 0,
          tardy: 0,
          excused: 0,
          pointsEarned: 0,
          averageLateness: 0,
          totalLateMinutes: 0,
          lateCount: 0,
        };
      }

      const student = studentStats[studentId];
      student.totalSessions++;
      student[record.status]++;
      student.pointsEarned += (record.pointsAwarded || 0);

      if (record.metadata.isLate) {
        student.totalLateMinutes += record.metadata.minutesLate;
        student.lateCount++;
      }

      // Session statistics
      if (!sessionStats[sessionKey]) {
        sessionStats[sessionKey] = {
          sessionDate: record.sessionDate,
          startTime: record.scheduledStartTime,
          endTime: record.scheduledEndTime,
          dayOfWeek: record.dayOfWeek,
          totalStudents: 0,
          present: 0,
          absent: 0,
          tardy: 0,
          excused: 0,
          attendanceRate: 0,
        };
      }

      const session = sessionStats[sessionKey];
      session.totalStudents++;
      session[record.status]++;
    });

    // Calculate averages and rates
    Object.values(studentStats).forEach(student => {
      student.attendanceRate = student.totalSessions > 0
        ? Math.round((student.present / student.totalSessions) * 100)
        : 0;
      student.averageLateness = student.lateCount > 0
        ? Math.round(student.totalLateMinutes / student.lateCount)
        : 0;
    });

    Object.values(sessionStats).forEach(session => {
      session.attendanceRate = session.totalStudents > 0
        ? Math.round((session.present / session.totalStudents) * 100)
        : 0;
    });

    // Overall class statistics
    const overallStats = {
      totalSessions: Object.keys(sessionStats).length,
      totalStudents: Object.keys(studentStats).length,
      averageAttendanceRate: Object.values(sessionStats).reduce((sum, s) => sum + s.attendanceRate, 0) / Object.keys(sessionStats).length || 0,
      totalPointsAwarded: Object.values(studentStats).reduce((sum, s) => sum + s.pointsEarned, 0),
    };

    res.status(200).json({
      success: true,
      data: {
        overallStats,
        studentStats: Object.values(studentStats),
        sessionStats: Object.values(sessionStats).sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate)),
      },
    });
  } catch (error) {
    console.error("Get class attendance analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get class attendance analytics",
      error: error.message,
    });
  }
};

// Get class attendance for a specific day
const getClassAttendanceForDay = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    // Get class details
    const schoolClass = await SchoolClass.findById(classId).populate({
      path: 'studentIds',
      populate: {
        path: 'userId',
        select: 'firstName lastName avatar email',
      },
    });
    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    console.log(schoolClass)

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Check if class is scheduled on this day
    const scheduleForDay = schoolClass.schedule.filter(s => s.dayOfWeek === dayOfWeek);

    if (scheduleForDay.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          classInfo: {
            id: schoolClass._id,
            name: schoolClass.name,
            grade: schoolClass.grade,
          },
          date: targetDate,
          dayOfWeek,
          isScheduled: false,
          message: `Class is not scheduled on ${dayOfWeek}`,
          schedule: [],
          students: [],
        },
      });
    }

    // Get attendance records for this date
    const attendanceRecords = await ClassAttendance.find({
      classId,
      attendanceDate: {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lt: new Date(targetDate.setHours(23, 59, 59, 999)),
      },
    }).populate('recordedBy', 'firstName lastName');

    // Create attendance map
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.studentId.toString()] = record;
    });

    // Build student attendance data
    const studentsData = await Promise.all(
      schoolClass.studentIds.map(async (student) => {
        const attendanceRecord = attendanceMap[student._id.toString()];

        return {
          studentId: student._id,
          studentName: `${student.userId.firstName} ${student.userId.lastName}`,
          email: student.userId.email,
          avatar: student.userId.avatar,
          status: attendanceRecord ? attendanceRecord.status : 'not_recorded',
          recordedAt: attendanceRecord ? attendanceRecord.recordedAt : null,
          recordedBy: attendanceRecord ? attendanceRecord.recordedBy : null,
          comments: attendanceRecord ? attendanceRecord.comments : null,
          pointsAwarded: attendanceRecord ? attendanceRecord.pointsAwarded : 0,
        };
      })
    );

    // Calculate summary
    const summary = {
      totalStudents: studentsData.length,
      present: studentsData.filter(s => s.status === 'present').length,
      absent: studentsData.filter(s => s.status === 'absent').length,
      notRecorded: studentsData.filter(s => s.status === 'not_recorded').length,
      attendanceRate: 0,
    };

    const recordedStudents = summary.totalStudents - summary.notRecorded;
    summary.attendanceRate = recordedStudents > 0
      ? Math.round((summary.present / recordedStudents) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        classInfo: {
          id: schoolClass._id,
          name: schoolClass.name,
          grade: schoolClass.grade,
        },
        date: new Date(date),
        dayOfWeek,
        isScheduled: true,
        schedule: scheduleForDay,
        summary,
        students: studentsData,
      },
    });
  } catch (error) {
    console.error("Get class attendance for day error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get class attendance for day",
      error: error.message,
    });
  }
};

// Get class attendance for a specific week
const getClassAttendanceForWeek = async (req, res) => {
  try {
    const { classId } = req.params;
    const { startDate } = req.query;

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "Start date is required",
      });
    }

    // Get class details
    const schoolClass = await SchoolClass.findById(classId).populate({
      path: 'studentIds',
      populate: {
        path: 'userId',
        select: 'firstName lastName avatar email',
      },
    });
    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Calculate week range
    const weekStart = new Date(startDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Get all scheduled days in the week
    const scheduledDays = [];
    for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'long' });
      const scheduleForDay = schoolClass.schedule.filter(s => s.dayOfWeek === dayOfWeek);

      if (scheduleForDay.length > 0) {
        scheduledDays.push({
          date: new Date(d),
          dayOfWeek,
          schedule: scheduleForDay,
        });
      }
    }

    // Get attendance records for the week
    const attendanceRecords = await ClassAttendance.find({
      classId,
      attendanceDate: {
        $gte: weekStart,
        $lte: weekEnd,
      },
    }).populate('recordedBy', 'firstName lastName');

    // Group attendance by date and student
    const attendanceByDate = {};
    attendanceRecords.forEach(record => {
      const dateKey = record.attendanceDate.toISOString().split('T')[0];
      if (!attendanceByDate[dateKey]) {
        attendanceByDate[dateKey] = {};
      }
      attendanceByDate[dateKey][record.studentId.toString()] = record;
    });

    // Build students data with attendance map
    const students = await Promise.all(
      schoolClass.studentIds.map(async (student) => {
        const attendance = {};

        // Fill attendance data for each scheduled day
        scheduledDays.forEach(day => {
          const dateKey = day.date.toISOString().split('T')[0];
          const dayAttendance = attendanceByDate[dateKey] || {};
          const attendanceRecord = dayAttendance[student._id.toString()];

          attendance[dateKey] = attendanceRecord ? attendanceRecord.status : 'not_recorded';
        });

        return {
          studentId: student._id,
          name: `${student.userId.firstName} ${student.userId.lastName}`,
          email: student.userId.email,
          avatar: student.userId.avatar,
          attendance,
        };
      })
    );

    // Create array of class days (scheduled dates)
    const classDays = scheduledDays.map(day => day.date.toISOString().split('T')[0]);

    // Build daily attendance summaries
    const dailyAttendance = scheduledDays.map(day => {
      const dateKey = day.date.toISOString().split('T')[0];
      const dayAttendanceRecords = attendanceByDate[dateKey] || {};
      
      const summary = {
        present: 0,
        absent: 0,
        notRecorded: 0,
        totalStudents: students.length,
      };

      students.forEach(student => {
        const status = student.attendance[dateKey];
        if (status === 'present') {
          summary.present++;
        } else if (status === 'absent') {
          summary.absent++;
        } else {
          summary.notRecorded++;
        }
      });

      const recordedStudents = summary.totalStudents - summary.notRecorded;
      summary.attendanceRate = recordedStudents > 0
        ? Math.round((summary.present / recordedStudents) * 100)
        : 0;

      return {
        date: day.date,
        dateKey,
        dayOfWeek: day.dayOfWeek,
        schedule: day.schedule,
        summary,
      };
    });

    // Calculate weekly summary
    const weeklySummary = {
      totalScheduledDays: scheduledDays.length,
      totalStudents: schoolClass.studentIds.length,
      totalSessions: dailyAttendance.length,
      averageAttendanceRate: dailyAttendance.length > 0
        ? Math.round(dailyAttendance.reduce((sum, day) => sum + day.summary.attendanceRate, 0) / dailyAttendance.length)
        : 0,
    };

    res.status(200).json({
      success: true,
      data: {
        classInfo: {
          id: schoolClass._id,
          name: schoolClass.name,
          grade: schoolClass.grade,
        },
        weekRange: {
          startDate: weekStart,
          endDate: weekEnd,
        },
        weeklySummary,
        dailyAttendance,
        students,
        classDays,
      },
    });
  } catch (error) {
    console.error("Get class attendance for week error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get class attendance for week",
      error: error.message,
    });
  }
};

// Get class attendance for a specific month
const getClassAttendanceForMonth = async (req, res) => {
  try {
    const { classId } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required",
      });
    }

    // Get class details
    const schoolClass = await SchoolClass.findById(classId).populate('studentIds', 'userId');
    if (!schoolClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Helper function to format date as YYYY-MM-DD in local timezone
    const formatLocalDate = (date) => {
      return date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0');
    };

    // Calculate month range
    const targetYear = parseInt(year);
    const targetMonth = parseInt(month) - 1; // JavaScript months are 0-indexed

    const monthStart = new Date(targetYear, targetMonth, 1);
    const monthEnd = new Date(targetYear, targetMonth + 1, 0);

    // Get all days in the month
    const allDaysInMonth = [];
    const scheduledDays = [];

    // Start from monthStart and iterate day by day until monthEnd
    const currentDate = new Date(monthStart);

    while (currentDate <= monthEnd) {
      const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

      const scheduleForDay = schoolClass.schedule.filter(s =>
        s.dayOfWeek?.toLowerCase() === dayOfWeek.toLowerCase()
      );

      const dayInfo = {
        date: new Date(currentDate), // Create a new date object to avoid reference issues
        dayOfWeek,
        isScheduled: scheduleForDay.length > 0,
        schedule: scheduleForDay,
      };

      allDaysInMonth.push(dayInfo);

      if (dayInfo.isScheduled) {
        scheduledDays.push(dayInfo);
      }

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get attendance records for the month
    const attendanceRecords = await ClassAttendance.find({
      classId,
      attendanceDate: {
        $gte: monthStart,
        $lte: monthEnd,
      },
    }).populate('recordedBy', 'firstName lastName');

    // Group attendance by date and student
    const attendanceByDate = {};
    attendanceRecords.forEach(record => {
      const dateKey = formatLocalDate(record.attendanceDate);
      if (!attendanceByDate[dateKey]) {
        attendanceByDate[dateKey] = {};
      }
      attendanceByDate[dateKey][record.studentId.toString()] = record;
    });

    // Build students data with attendance map for all days
    const students = await Promise.all(
      schoolClass.studentIds.map(async (student) => {

        const studentData = await Student.findById(student._id).populate('userId', 'firstName lastName avatar email');

        const attendance = {};

        // Fill attendance data for all days in the month
        allDaysInMonth.forEach(day => {
          const dateKey = formatLocalDate(day.date);

          if (!day.isScheduled) {
            // No class scheduled on this day
            attendance[dateKey] = null;
          } else {
            // Class is scheduled, check actual attendance
            const dayAttendance = attendanceByDate[dateKey] || {};
            const attendanceRecord = dayAttendance[studentData._id.toString()];
            attendance[dateKey] = attendanceRecord ? attendanceRecord.status : 'not_recorded';
          }
        });

        let presentCount = 0;
        Object.values(attendance).forEach(status => {
          if (status === 'present') {
            presentCount++;
          }
        });

        return {
          studentId: studentData._id,
          name: `${studentData.userId.firstName} ${studentData.userId.lastName}`,
          email: studentData.userId.email,
          avatar: studentData.userId.avatar,
          present: presentCount,
          attendance,
        };
      })
    );

    // Create array of all days in the month
    const classDays = allDaysInMonth.map(day => formatLocalDate(day.date));

    // Calculate monthly summary
    const monthlySummary = {
      totalScheduledDays: scheduledDays.length,
      totalStudents: schoolClass.studentIds.length,
      averageAttendanceRate: 0,
    };

    // Calculate overall statistics from the students data
    let totalPresentCount = 0;
    let totalRecordedCount = 0;

    students.forEach(student => {
      Object.values(student.attendance).forEach(status => {
        if (status === 'present') {
          totalPresentCount++;
          totalRecordedCount++;
        } else if (status === 'absent') {
          totalRecordedCount++;
        }
        // 'not_recorded' and 'noclass' don't count towards recorded
      });
    });

    if (totalRecordedCount > 0) {
      monthlySummary.averageAttendanceRate = Math.round((totalPresentCount / totalRecordedCount) * 100);
    }

    res.status(200).json({
      success: true,
      data: {
        classInfo: {
          id: schoolClass._id,
          name: schoolClass.name,
          grade: schoolClass.grade,
        },
        monthRange: {
          month: parseInt(month),
          year: parseInt(year),
          startDate: monthStart,
          endDate: monthEnd,
        },
        monthlySummary,
        students,
        classDays,
      },
    });
  } catch (error) {
    console.error("Get class attendance for month error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get class attendance for month",
      error: error.message,
    });
  }
};

module.exports = {
  recordStudentAttendance,
  recordBulkAttendance,
  getStudentClassAttendance,
  getClassAttendanceAnalytics,
  getClassAttendanceForDay,
  getClassAttendanceForWeek,
  getClassAttendanceForMonth,
}; 