const axios = require("axios");
const UserMetrics = require("../models/userMetrics.model");
const TaskMetrics = require("../models/taskMetrics.model");
const PointMetrics = require("../models/pointMetrics.model");
const BadgeMetrics = require("../models/badgeMetrics.model");

// Service URLs from environment variables
const NODE_ENV = process.env.NODE_ENV || "development";
const AUTH_SERVICE_URL =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_AUTH_SERVICE_URL
    : process.env.AUTH_SERVICE_URL;
const USER_SERVICE_URL =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_USER_SERVICE_URL
    : process.env.USER_SERVICE_URL;
const TASK_SERVICE_URL =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_TASK_SERVICE_URL
    : process.env.TASK_SERVICE_URL;
const POINTS_SERVICE_URL =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_POINTS_SERVICE_URL
    : process.env.POINTS_SERVICE_URL;
const REWARDS_SERVICE_URL =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_REWARDS_SERVICE_URL
    : process.env.REWARDS_SERVICE_URL;

// The JWT secret must match the one used by the auth service
const JWT_SECRET =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_JWT_SECRET
    : process.env.JWT_SECRET;

/**
 * Get a system JWT token for making authenticated requests to other services
 */
const getSystemAuthToken = async () => {
  try {
    // For system-to-system communication, we create a special token with admin privileges
    // In a real implementation, this would be more secure, possibly using a dedicated service account
    const jwt = require("jsonwebtoken");

    const systemToken = jwt.sign(
      {
        id: "system_analytics",
        roles: ["platform_admin"],
        type: "system",
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return systemToken;
  } catch (error) {
    console.error("Failed to generate system auth token:", error);
    throw error;
  }
};

/**
 * Create an API client with authorization headers
 */
const createApiClient = async () => {
  const token = await getSystemAuthToken();

  return axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    timeout: 10000, // 10 second timeout
  });
};

/**
 * Collect user metrics from the user service
 */
const collectUserMetrics = async (startDate, endDate) => {
  try {
    console.log("Collecting user metrics...");
    const apiClient = await createApiClient();

    // Get total user counts
    const [
      usersResponse,
      studentsResponse,
      parentsResponse,
      teachersResponse,
      adminsResponse,
      activeUsersResponse,
      newUsersResponse, 
      schoolsResponse
    ] = await Promise.all([
      apiClient.get(`${USER_SERVICE_URL}/api/users?count=true`),
      apiClient.get(`${USER_SERVICE_URL}/api/students?count=true`),
      apiClient.get(`${USER_SERVICE_URL}/api/parents?count=true`),
      apiClient.get(`${USER_SERVICE_URL}/api/teachers?count=true`),
      apiClient.get(`${USER_SERVICE_URL}/api/users?roles=school_admin&count=true`),
      // Get active users (users with activity in the last 30 days)
      apiClient.get(
        `${USER_SERVICE_URL}/api/users/active?days=30&count=true`
      ),
      // Get new users in the specified date range
      apiClient.get(
        `${USER_SERVICE_URL}/api/users`,
        {
          params: {
            createdAtGte: startDate.toISOString(),
            createdAtLte: endDate.toISOString(),
            count: 'true'
          }
        }
      ),
      // Get schools for school-specific metrics
      apiClient.get(
        `${USER_SERVICE_URL}/api/schools`
      )
    ]);

    // Prepare base user metrics
    const userMetrics = new UserMetrics({
      date: new Date(),
      totalUsers: usersResponse.data?.data?.total || 0,
      newUsers: newUsersResponse.data?.data?.total || 0,
      activeUsers: activeUsersResponse.data?.data?.total || 0,
      usersByRole: {
        students: studentsResponse.data?.data?.total || 0,
        parents: parentsResponse.data?.data?.total || 0,
        teachers: teachersResponse.data?.data?.total || 0,
        school_admin: adminsResponse.data?.data?.total || 0,
        social_worker: 0, //TODO: Will be added later
        platform_admin: 1, // This might need special handling
      },
      schoolMetrics: [],
      lastUpdated: new Date(),
    });

    // Collect school-specific metrics if schools exist
    if (schoolsResponse.data && schoolsResponse.data.data) {
      const schools = schoolsResponse.data.data;

      // For each school, get its user metrics
      for (const school of schools) {
        const schoolId = school._id;
        const schoolName = school.name;

        const [
          schoolStudentsResponse,
          schoolTeachersResponse,
          schoolAdminsResponse,
        ] = await Promise.all([
          apiClient.get(`${USER_SERVICE_URL}/api/students?schoolId=${schoolId}&count=true`),
          apiClient.get(`${USER_SERVICE_URL}/api/teachers?schoolId=${schoolId}&count=true`),
          apiClient.get(`${USER_SERVICE_URL}/api/users?roles=school_admin&schoolId=${schoolId}&count=true`),
        ]);

        const schoolTotalUsers =
          (schoolStudentsResponse.data?.data?.total || 0) +
          (schoolTeachersResponse.data?.data?.total || 0) +
          (schoolAdminsResponse.data?.data?.total || 0);

        userMetrics.schoolMetrics.push({
          schoolId,
          schoolName,
          totalUsers: schoolTotalUsers,
          usersByRole: {
            students: schoolStudentsResponse.data?.data?.total || 0,
            teachers: schoolTeachersResponse.data?.data?.total || 0,
            school_admin: schoolAdminsResponse.data?.data?.total || 0,
          },
        });
      }
    }

    // Save the metrics
    await userMetrics.save();
    console.log("User metrics collected and saved.");

    return userMetrics;
  } catch (error) {
    console.error("Failed to collect user metrics:", error);
    throw error;
  }
};

/**
 * Collect task metrics from the task service
 */
const collectTaskMetrics = async (startDate, endDate) => {
  try {
    console.log("Collecting task metrics...");
    const apiClient = await createApiClient();

    // Get task counts by status
    const [
      totalTasksResponse,
      pendingTasksResponse,
      completedTasksResponse,
      approvedTasksResponse,
      rejectedTasksResponse,
      expiredTasksResponse,
      newTasksResponse,
    ] = await Promise.all([
      apiClient.get(`${TASK_SERVICE_URL}/api/tasks?count=true`),
      apiClient.get(`${TASK_SERVICE_URL}/api/tasks?status=pending&count=true`),
      apiClient.get(
        `${TASK_SERVICE_URL}/api/tasks?status=completed&count=true`
      ),
      apiClient.get(`${TASK_SERVICE_URL}/api/tasks?status=approved&count=true`),
      apiClient.get(`${TASK_SERVICE_URL}/api/tasks?status=rejected&count=true`),
      apiClient.get(`${TASK_SERVICE_URL}/api/tasks?status=expired&count=true`),
      apiClient.get(
        `${TASK_SERVICE_URL}/api/tasks?createdAt[gte]=${startDate.toISOString()}&createdAt[lte]=${endDate.toISOString()}&count=true`
      ),
    ]);

    // Get task counts by category
    const taskCategoriesResponse = await apiClient.get(
      `${TASK_SERVICE_URL}/api/tasks/categories`
    );
    const tasksByCategory = {};

    if (taskCategoriesResponse.data && taskCategoriesResponse.data.data) {
      for (const category of taskCategoriesResponse.data.data) {
        const categoryId = category._id;
        const categoryName = category.name;

        const categoryTasksResponse = await apiClient.get(
          `${TASK_SERVICE_URL}/api/tasks?category=${categoryId}&count=true`
        );
        tasksByCategory[categoryName] = categoryTasksResponse.data.total || 0;
      }
    }

    // Get tasks by creator role
    const tasksByCreatorRole = {
      student: 0,
      parent: 0,
      teacher: 0,
      school_admin: 0,
      social_worker: 0,
      platform_admin: 0,
      system: 0,
    };

    const creatorRoles = Object.keys(tasksByCreatorRole);
    for (const role of creatorRoles) {
      const roleTasksResponse = await apiClient.get(
        `${TASK_SERVICE_URL}/api/tasks?creatorRole=${role}&count=true`
      );
      tasksByCreatorRole[role] = roleTasksResponse.data.total || 0;
    }

    // Get tasks by difficulty
    const tasksByDifficulty = {
      easy: 0,
      medium: 0,
      hard: 0,
      challenging: 0,
    };

    const difficulties = Object.keys(tasksByDifficulty);
    for (const difficulty of difficulties) {
      const difficultyTasksResponse = await apiClient.get(
        `${TASK_SERVICE_URL}/api/tasks?difficulty=${difficulty}&count=true`
      );
      tasksByDifficulty[difficulty] = difficultyTasksResponse.data.total || 0;
    }

    // Calculate completion rate
    const totalTasks = totalTasksResponse.data.total || 0;
    const completedAndApprovedTasks =
      (completedTasksResponse.data.total || 0) +
      (approvedTasksResponse.data.total || 0);
    const completionRate =
      totalTasks > 0 ? (completedAndApprovedTasks / totalTasks) * 100 : 0;

    // Calculate average completion time (example implementation)
    // In a real implementation, you would need to analyze the completedDate and dueDate or createdAt
    const averageCompletionTime = 48; // Placeholder value

    // Prepare the task metrics object
    const taskMetrics = new TaskMetrics({
      date: new Date(),
      totalTasks,
      newTasks: newTasksResponse.data.total || 0,
      completedTasks: completedAndApprovedTasks,
      pendingTasks: pendingTasksResponse.data.total || 0,
      approvedTasks: approvedTasksResponse.data.total || 0,
      rejectedTasks: rejectedTasksResponse.data.total || 0,
      expiredTasks: expiredTasksResponse.data.total || 0,
      tasksByCategory,
      tasksByCreatorRole,
      tasksByDifficulty,
      completionRate,
      averageCompletionTime,
      schoolMetrics: [],
      lastUpdated: new Date(),
    });

    // Get schools for school-specific metrics
    const schoolsResponse = await apiClient.get(
      `${USER_SERVICE_URL}/api/schools`
    );

    // Collect school-specific metrics if schools exist
    if (schoolsResponse.data && schoolsResponse.data.data) {
      const schools = schoolsResponse.data.data;

      for (const school of schools) {
        const schoolId = school._id;
        const schoolName = school.name;

        const [schoolTotalTasksResponse, schoolCompletedTasksResponse] =
          await Promise.all([
            apiClient.get(
              `${TASK_SERVICE_URL}/api/tasks?schoolId=${schoolId}&count=true`
            ),
            apiClient.get(
              `${TASK_SERVICE_URL}/api/tasks?schoolId=${schoolId}&status=approved,completed&count=true`
            ),
          ]);

        const schoolTotalTasks = schoolTotalTasksResponse.data.total || 0;
        const schoolCompletedTasks =
          schoolCompletedTasksResponse.data.total || 0;
        const schoolCompletionRate =
          schoolTotalTasks > 0
            ? (schoolCompletedTasks / schoolTotalTasks) * 100
            : 0;

        taskMetrics.schoolMetrics.push({
          schoolId,
          schoolName,
          totalTasks: schoolTotalTasks,
          completedTasks: schoolCompletedTasks,
          completionRate: schoolCompletionRate,
        });
      }
    }

    // Save the task metrics
    await taskMetrics.save();
    console.log("Task metrics collected and saved.");

    return taskMetrics;
  } catch (error) {
    console.error("Failed to collect task metrics:", error);
    throw error;
  }
};

/**
 * Collect point metrics from the points service
 */
const collectPointMetrics = async (startDate, endDate) => {
  try {
    console.log("Collecting point metrics...");
    const apiClient = await createApiClient();

    // Get point transactions in the date range
    const transactionsResponse = await apiClient.get(
      `${POINTS_SERVICE_URL}/api/points/transactions?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    );

    // Get all point accounts
    const accountsResponse = await apiClient.get(
      `${POINTS_SERVICE_URL}/api/points/accounts`
    );

    // Default values
    let totalPointsEarned = 0;
    let totalPointsSpent = 0;
    let netPointsChange = 0;
    let totalActiveAccounts = 0;
    let averagePointsPerAccount = 0;
    let pointsBySource = {
      task: 0,
      attendance: 0,
      behavior: 0,
      badge: 0,
      manual_adjustment: 0,
    };
    let pointsByTransactionType = {
      earned: 0,
      spent: 0,
      adjusted: 0,
    };
    let levelDistribution = {};

    // Process transactions if they exist
    if (
      transactionsResponse.data &&
      transactionsResponse.data.data &&
      transactionsResponse.data.data.transactions
    ) {
      const transactions = transactionsResponse.data.data.transactions;

      // Count points by transaction type and source
      for (const transaction of transactions) {
        const amount = Math.abs(transaction.amount || 0);

        if (transaction.type === "earned") {
          totalPointsEarned += amount;
          pointsByTransactionType.earned += amount;

          // Count by source
          if (
            transaction.source &&
            pointsBySource[transaction.source] !== undefined
          ) {
            pointsBySource[transaction.source] += amount;
          }
        } else if (transaction.type === "spent") {
          totalPointsSpent += amount;
          pointsByTransactionType.spent += amount;
        } else if (transaction.type === "adjusted") {
          pointsByTransactionType.adjusted += amount;

          // Adjusted can be positive or negative
          if (transaction.amount > 0) {
            totalPointsEarned += amount;
          } else {
            totalPointsSpent += amount;
          }
        }
      }

      netPointsChange = totalPointsEarned - totalPointsSpent;
    }

    // Process accounts if they exist
    if (accountsResponse.data && accountsResponse.data.data) {
      const accounts = accountsResponse.data.data;
      totalActiveAccounts = accounts.length;

      let totalPoints = 0;

      // Process account information
      for (const account of accounts) {
        totalPoints += account.currentBalance || 0;

        // Count accounts by level
        const level = account.level || 1;
        levelDistribution[level] = (levelDistribution[level] || 0) + 1;
      }

      // Calculate average points per account
      averagePointsPerAccount =
        totalActiveAccounts > 0 ? totalPoints / totalActiveAccounts : 0;
    }

    // Prepare the point metrics object
    const pointMetrics = new PointMetrics({
      date: new Date(),
      totalPointsEarned,
      totalPointsSpent,
      netPointsChange,
      totalActiveAccounts,
      averagePointsPerAccount,
      pointsBySource,
      pointsByTransactionType,
      levelDistribution,
      schoolMetrics: [],
      lastUpdated: new Date(),
    });

    // Get schools for school-specific metrics
    const schoolsResponse = await apiClient.get(
      `${USER_SERVICE_URL}/api/schools`
    );

    // Collect school-specific metrics if schools exist
    if (schoolsResponse.data && schoolsResponse.data.data) {
      const schools = schoolsResponse.data.data;

      for (const school of schools) {
        const schoolId = school._id;
        const schoolName = school.name;

        // Get students for this school
        const schoolStudentsResponse = await apiClient.get(
          `${USER_SERVICE_URL}/api/students?schoolId=${schoolId}`
        );

        let schoolTotalPointsEarned = 0;
        let schoolTotalPointsSpent = 0;
        let schoolNetPointsChange = 0;
        let schoolTotalPoints = 0;
        let schoolStudentCount = 0;

        // If students exist, get their point transactions
        if (schoolStudentsResponse.data && schoolStudentsResponse.data.data) {
          const students = schoolStudentsResponse.data.data;
          schoolStudentCount = students.length;

          // For each student, get their point account and recent transactions
          for (const student of students) {
            const studentId = student._id;

            // Get student's point account
            const accountResponse = await apiClient.get(
              `${POINTS_SERVICE_URL}/api/points/accounts/student/${studentId}`
            );

            if (accountResponse.data && accountResponse.data.data) {
              const account = accountResponse.data.data;
              schoolTotalPoints += account.currentBalance || 0;
            }

            // Get student's recent transactions
            const studentTransactionsResponse = await apiClient.get(
              `${POINTS_SERVICE_URL}/api/points/transactions/student/${studentId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
            );

            if (
              studentTransactionsResponse.data &&
              studentTransactionsResponse.data.data &&
              studentTransactionsResponse.data.data.transactions
            ) {
              const transactions =
                studentTransactionsResponse.data.data.transactions;

              // Count points by transaction type
              for (const transaction of transactions) {
                const amount = Math.abs(transaction.amount || 0);

                if (transaction.type === "earned") {
                  schoolTotalPointsEarned += amount;
                } else if (transaction.type === "spent") {
                  schoolTotalPointsSpent += amount;
                } else if (transaction.type === "adjusted") {
                  // Adjusted can be positive or negative
                  if (transaction.amount > 0) {
                    schoolTotalPointsEarned += amount;
                  } else {
                    schoolTotalPointsSpent += amount;
                  }
                }
              }
            }
          }
        }

        schoolNetPointsChange =
          schoolTotalPointsEarned - schoolTotalPointsSpent;
        const schoolAveragePointsPerStudent =
          schoolStudentCount > 0 ? schoolTotalPoints / schoolStudentCount : 0;

        pointMetrics.schoolMetrics.push({
          schoolId,
          schoolName,
          totalPointsEarned: schoolTotalPointsEarned,
          totalPointsSpent: schoolTotalPointsSpent,
          netPointsChange: schoolNetPointsChange,
          averagePointsPerStudent: schoolAveragePointsPerStudent,
        });
      }
    }

    // Save the point metrics
    await pointMetrics.save();
    console.log("Point metrics collected and saved.");

    return pointMetrics;
  } catch (error) {
    console.error("Failed to collect point metrics:", error);
    throw error;
  }
};

/**
 * Collect badge metrics from the badge endpoints in the user service
 */
const collectBadgeMetrics = async (startDate, endDate) => {
  try {
    console.log("Collecting badge metrics...");
    const apiClient = await createApiClient();

    // Get all badges
    const badgesResponse = await apiClient.get(
      `${USER_SERVICE_URL}/api/badges`
    );

    // Get badge awards in the date range
    const badgeAwardsResponse = await apiClient.get(
      `${USER_SERVICE_URL}/api/badges/awards?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    );

    // Default values
    let totalBadgesAwarded = 0;
    let uniqueStudentsAwarded = new Set();
    let badgesByCategory = {};
    let mostAwardedBadges = [];
    let badgesByConditionType = {
      points_threshold: 0,
      task_completion: 0,
      attendance_streak: 0,
      custom: 0,
    };
    let badgesByIssuerType = {
      system: 0,
      school: 0,
      parent: 0,
    };
    let totalPointsFromBadges = 0;

    // Process badge awards if they exist
    if (badgeAwardsResponse.data && badgeAwardsResponse.data.data) {
      const awards = badgeAwardsResponse.data.data;
      totalBadgesAwarded = awards.length;

      // Count unique students and points from badges
      const badgeCounts = {};

      for (const award of awards) {
        uniqueStudentsAwarded.add(award.studentId);
        totalPointsFromBadges += award.pointsAwarded || 0;

        // Count by badge ID for most awarded
        const badgeId = award.badgeId;
        badgeCounts[badgeId] = (badgeCounts[badgeId] || 0) + 1;
      }

      // Create most awarded badges array
      if (badgesResponse.data && badgesResponse.data.data) {
        const badges = badgesResponse.data.data;
        const badgeMap = new Map();

        // Create a map of badge details
        for (const badge of badges) {
          badgeMap.set(badge._id, badge);

          // Count by category
          const category = badge.category || "uncategorized";
          badgesByCategory[category] = (badgesByCategory[category] || 0) + 1;

          // Count by condition type
          if (badge.conditions && badge.conditions.type) {
            badgesByConditionType[badge.conditions.type] =
              (badgesByConditionType[badge.conditions.type] || 0) + 1;
          }

          // Count by issuer type
          if (badge.issuerType) {
            badgesByIssuerType[badge.issuerType] =
              (badgesByIssuerType[badge.issuerType] || 0) + 1;
          }
        }

        // Create sorted array of most awarded badges
        mostAwardedBadges = Object.entries(badgeCounts)
          .map(([badgeId, count]) => {
            const badge = badgeMap.get(badgeId);
            return {
              badgeId,
              badgeName: badge ? badge.name : "Unknown Badge",
              count,
            };
          })
          .sort((a, b) => b.count - a.count)
          .slice(0, 10); // Top 10 most awarded
      }
    }

    // Prepare the badge metrics object
    const badgeMetrics = new BadgeMetrics({
      date: new Date(),
      totalBadgesAwarded,
      uniqueStudentsAwarded: uniqueStudentsAwarded.size,
      badgesByCategory,
      mostAwardedBadges,
      badgesByConditionType,
      badgesByIssuerType,
      totalPointsFromBadges,
      schoolMetrics: [],
      lastUpdated: new Date(),
    });

    // Get schools for school-specific metrics
    const schoolsResponse = await apiClient.get(
      `${USER_SERVICE_URL}/api/schools`
    );

    // Collect school-specific metrics if schools exist
    if (schoolsResponse.data && schoolsResponse.data.data) {
      const schools = schoolsResponse.data.data;

      for (const school of schools) {
        const schoolId = school._id;
        const schoolName = school.name;

        // Get badge awards for this school in the date range
        const schoolBadgeAwardsResponse = await apiClient.get(
          `${USER_SERVICE_URL}/api/badges/awards?schoolId=${schoolId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );

        let schoolTotalBadgesAwarded = 0;
        let schoolUniqueStudentsAwarded = new Set();

        // Process school-specific badge awards if they exist
        if (
          schoolBadgeAwardsResponse.data &&
          schoolBadgeAwardsResponse.data.data
        ) {
          const schoolAwards = schoolBadgeAwardsResponse.data.data;
          schoolTotalBadgesAwarded = schoolAwards.length;

          for (const award of schoolAwards) {
            schoolUniqueStudentsAwarded.add(award.studentId);
          }
        }

        badgeMetrics.schoolMetrics.push({
          schoolId,
          schoolName,
          totalBadgesAwarded: schoolTotalBadgesAwarded,
          uniqueStudentsAwarded: schoolUniqueStudentsAwarded.size,
        });
      }
    }

    // Save the badge metrics
    await badgeMetrics.save();
    console.log("Badge metrics collected and saved.");

    return badgeMetrics;
  } catch (error) {
    console.error("Failed to collect badge metrics:", error);
    throw error;
  }
};

module.exports = {
  collectUserMetrics,
  collectTaskMetrics,
  collectPointMetrics,
  collectBadgeMetrics,
};
