import { supabase } from '../config/supabase.js';
import { findByExternalId, findById } from '../repositories/user.repo.js';
import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Middleware to authenticate token
 * In production, verifies token with Supabase
 * In test environment, also accepts locally generated JWT tokens
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
    // In test environment, try local JWT tokens first
    if (process.env.NODE_ENV === 'test') {
      const decodedToken = verifyAccessToken(token);
      if (decodedToken) {
        // This is a local JWT token (for testing)
        // If the token contains externalId, try to find by externalId first
        let userProfile = null;
        if (decodedToken.externalId) {
          userProfile = await findByExternalId(decodedToken.externalId);
        }

        // If not found by externalId or externalId doesn't exist, try by local id
        if (!userProfile && decodedToken.userId) {
          userProfile = await findById(decodedToken.userId);
        }

        if (!userProfile) {
          return res.status(401).json({
            error: 'User profile not found in the system'
          });
        }

        if (userProfile.isLocked) {
          return res.status(401).json({
            error: 'Account is locked'
          });
        }

        // Add user info to request object
        req.user = {
          id: userProfile.id,
          externalId: decodedToken.externalId || userProfile.id,
          email: userProfile.email,
          role: userProfile.role
        };

        next();
        return;
      }
    }

    // For production or if JWT verification failed in test, try Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({
        error: 'Invalid or expired token'
      });
    }

    // Find user in our database to ensure they exist and get additional info
    const userProfile = await findByExternalId(user.id);

    if (!userProfile) {
      return res.status(401).json({
        error: 'User profile not found in the system'
      });
    }

    if (userProfile.isLocked) {
      return res.status(401).json({
        error: 'Account is locked'
      });
    }

    // Add user info to request object
    req.user = {
      id: userProfile.id,
      externalId: user.id, // Store the Supabase user ID for reference
      email: userProfile.email,
      role: userProfile.role
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