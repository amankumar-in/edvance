/**
 * Role-based access control middleware
 * 
 * Checks if the authenticated user has the required role(s) to access a route
 */

/**
 * Middleware to check if user has required roles
 * @param {Array} allowedRoles - Array of roles that can access the route
 * @returns {Function} Express middleware function
 */
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get user roles (could be array or single role)
      const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
      
      // Check if user has any of the allowed roles
      const hasRequiredRole = userRoles.some(role => allowedRoles.includes(role));

      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          userRoles: userRoles
        });
      }

      // User has required role, proceed to next middleware
      next();

    } catch (error) {
      console.error('Error in role middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error in role validation',
        error: error.message
      });
    }
  };
};

module.exports = roleMiddleware; 