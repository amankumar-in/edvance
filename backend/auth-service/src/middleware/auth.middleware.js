const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token
 * Extracts token from Authorization header and verifies it
 */
exports.verifyToken = (req, res, next) => {
  // Check for Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication token is required' 
    });
  }
  
  // Extract token from header
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Set user info in request object
    req.user = decoded;
    next();
  } catch (err) {
    // Handle specific JWT errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token has expired', 
        expired: true 
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    // Generic error
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

/**
 * Middleware to check user roles
 * Returns a middleware function that verifies if the user has required roles
 * 
 * @param {Array} roles - Array of roles allowed to access the route
 * @returns {Function} Middleware function
 */
exports.checkRole = (roles) => (req, res, next) => {
  // Ensure user is authenticated
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: User not authenticated' 
    });
  }
  
  // Check if user has at least one required role
  if (!req.user.roles || !Array.isArray(req.user.roles) || 
      !req.user.roles.some(role => roles.includes(role))) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied: Insufficient permissions' 
    });
  }
  
  next();
};

/**
 * Middleware to check if user is verified
 */
exports.checkVerified = async (req, res, next) => {
  // Ensure user is authenticated
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: User not authenticated' 
    });
  }
  
  try {
    // Find user
    const User = require('../models/user.model');
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Email verification required', 
        needsVerification: true 
      });
    }
    
    next();
  } catch (err) {
    console.error('checkVerified error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during verification check',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

/**
 * Middleware for optional authentication
 * Attempts to authenticate, but allows request to continue even if authentication fails
 */
exports.optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Authentication failed, but continue without user
    req.user = null;
  }
  
  next();
};

/**
 * Middleware to check if account is active
 */
exports.checkActive = async (req, res, next) => {
  // Ensure user is authenticated
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: User not authenticated' 
    });
  }
  
  try {
    // Find user
    const User = require('../models/user.model');
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is inactive. Please contact support.' 
      });
    }
    
    next();
  } catch (err) {
    console.error('checkActive error:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during account status check',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};