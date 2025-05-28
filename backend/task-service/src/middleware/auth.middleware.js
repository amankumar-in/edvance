const jwt = require("jsonwebtoken");

/**
 * Authentication Middleware
 * Verifies and processes authentication tokens for protected routes
 */
const authMiddleware = {
  /**
   * Verify JWT token from request
   */
  verifyToken: (req, res, next) => {
    try {
      // Get token from Authorization header
      const bearerHeader = req.headers.authorization;

      if (!bearerHeader) {
        return res.status(401).json({
          success: false,
          message: "No authorization token provided",
        });
      }

      // Split the bearer token
      const bearer = bearerHeader.split(" ");
      if (bearer.length !== 2 || bearer[0] !== "Bearer") {
        return res.status(401).json({
          success: false,
          message: "Invalid token format",
        });
      }

      const token = bearer[1];

      // Verify token
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
            error: err.message,
          });
        }

        // Attach user info to request object
        req.user = {
          id: decoded.id,
          email: decoded.email,
          roles: decoded.roles,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
          schoolId: decoded.schoolId,
          classIds: decoded.classIds || [],
          childIds: decoded.childIds || [],
        };

        next();
      });
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(500).json({
        success: false,
        message: "Authentication error",
        error: error.message,
      });
    }
  },

  /**
   * Check if user has one of the required roles
   * @param {Array} roles - Array of allowed roles
   */
  checkRoles: (roles) => {
    return (req, res, next) => {
      try {
        // User must be authenticated first
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: "Authentication required",
          });
        }

        const hasRole = req.user.roles.some((role) => roles.includes(role));
        if (!hasRole) {
          return res.status(403).json({
            success: false,
            message: "Access denied: insufficient permissions",
          });
        }

        next();
      } catch (error) {
        console.error("Role check error:", error);
        return res.status(500).json({
          success: false,
          message: "Role verification error",
          error: error.message,
        });
      }
    };
  },

  /**
   * Check if user is a student's parent
   * Used for routes where a parent needs to access a child's data
   */
  checkParentChild: (req, res, next) => {
    try {
      // User must be authenticated first
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Skip for platform admins
      if (req.user.role === "platform_admin") {
        return next();
      }

      // Must be a parent
      if (req.user.role !== "parent") {
        return res.status(403).json({
          success: false,
          message: "Only parents can access this resource",
        });
      }

      // Get child ID from request params or query
      const childId = req.params.childId || req.query.childId;

      if (!childId) {
        return res.status(400).json({
          success: false,
          message: "Child ID is required",
        });
      }

      // Check if child ID is in parent's childIds array
      if (!req.user.childIds || !req.user.childIds.includes(childId)) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this child's data",
        });
      }

      next();
    } catch (error) {
      console.error("Parent-child check error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization error",
        error: error.message,
      });
    }
  },

  /**
   * Check if user is a teacher for a specific class
   */
  checkTeacherClass: (req, res, next) => {
    try {
      // User must be authenticated first
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Skip for platform admins and school admins
      if (
        req.user.role === "platform_admin" ||
        req.user.role === "school_admin"
      ) {
        return next();
      }

      // Must be a teacher
      if (req.user.role !== "teacher") {
        return res.status(403).json({
          success: false,
          message: "Only teachers can access this resource",
        });
      }

      // Get class ID from request params or query
      const classId = req.params.classId || req.query.classId;

      if (!classId) {
        return res.status(400).json({
          success: false,
          message: "Class ID is required",
        });
      }

      // Check if class ID is in teacher's classIds array
      if (!req.user.classIds || !req.user.classIds.includes(classId)) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this class",
        });
      }

      next();
    } catch (error) {
      console.error("Teacher-class check error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization error",
        error: error.message,
      });
    }
  },

  /**
   * Check if user belongs to a specific school
   */
  checkSchoolMember: (req, res, next) => {
    try {
      // User must be authenticated first
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Skip for platform admins
      if (req.user.role === "platform_admin") {
        return next();
      }

      // Get school ID from request params or query
      const schoolId =
        req.params.schoolId || req.query.schoolId || req.body.schoolId;

      if (!schoolId) {
        return res.status(400).json({
          success: false,
          message: "School ID is required",
        });
      }

      // Check if user belongs to this school
      if (!req.user.schoolId || req.user.schoolId !== schoolId) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this school's data",
        });
      }

      next();
    } catch (error) {
      console.error("School member check error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization error",
        error: error.message,
      });
    }
  },
};

module.exports = authMiddleware;
