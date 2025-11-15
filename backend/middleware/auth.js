import { verifyAccessToken } from '../utils/jwt.js';
import prisma from '../db.js';

/**
 * Middleware to authenticate JWT token
 * Extracts token from Authorization header and verifies it
 */
export const authenticateToken = async (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token is required' 
    });
  }

  try {
    // Verify the token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(403).json({ 
        error: 'Invalid or expired token' 
      });
    }

    // Find user in database to ensure they exist and are not locked
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'User not found' 
      });
    }

    if (user.isLocked) {
      return res.status(401).json({ 
        error: 'Account is locked' 
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during authentication' 
    });
  }
};

/**
 * Middleware to authorize user roles
 * @param {Array} allowedRoles - Array of roles that are allowed to access the route
 */
export const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions' 
      });
    }

    next();
  };
};

/**
 * Require one or more roles to access a route
 * @param {string|string[]} roles - allowed roles
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Insufficient permissions. Allowed roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

/**
 * Middleware to check if the user is accessing their own resource
 * @param {string} idParam - Parameter name that contains the user ID (default: 'id')
 */
export const requireOwnResource = (idParam = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    const targetUserId = req.params[idParam] || req.body.userId;
    
    if (req.user.id !== targetUserId) {
      return res.status(403).json({ 
        error: 'Cannot access another user\'s resource' 
      });
    }

    next();
  };
};