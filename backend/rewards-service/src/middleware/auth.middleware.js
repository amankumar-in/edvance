const jwt = require("jsonwebtoken");
const axios = require("axios");

const JWT_SECRET =
  process.env.NODE_ENV === "production"
    ? process.env.PRODUCTION_JWT_SECRET
    : process.env.JWT_SECRET;

const getAllProfiles = async (userId, token) => {
  const baseUrl = process.env.NODE_ENV === "production"
    ? process.env.PRODUCTION_USER_SERVICE_URL
    : process.env.USER_SERVICE_URL || "http://localhost:3002";

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const { data } = await axios.get(`${baseUrl}/api/users/me/profiles`, config);
    return data.data;
  } catch (error) {
    console.error(`Error fetching profiles:`, error.response?.data || error.message);
    return null;
  }
};

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No authorization token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const userDetails = await getAllProfiles(decoded.id, token);

      // Add user information to request object
      req.user = {
        id: decoded.id,
        email: userDetails?.user?.email || decoded.email,
        roles: decoded.roles,
        firstName: userDetails?.user?.firstName || decoded.firstName,
        lastName: userDetails?.user?.lastName || decoded.lastName,
        profiles: userDetails?.profiles || {}
      };

      // Add convenience method to check if user has a role
      req.user.hasRole = function (role) {
        return this.roles.includes(role);
      };

      // Add convenience method to check if user has any of specified roles
      req.user.hasAnyRole = function (roles) {
        return roles.some((role) => this.roles.includes(role));
      };

      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message,
    });
  }
};

// Role authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "No authorization token provided",
      });
    }

    if (!req.user.hasAnyRole(roles)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

// Check if user is admin (school or platform)
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (!req.user.hasAnyRole(["platform_admin", "school_admin"])) {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

// Check if user can manage rewards (parents, school admins, platform admins)
const canManageRewards = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (!req.user.hasAnyRole(["parent", "school_admin", "platform_admin"])) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to manage rewards",
    });
  }

  next();
};

module.exports = {
  authMiddleware,
  authorizeRoles,
  isAdmin,
  canManageRewards,
};
