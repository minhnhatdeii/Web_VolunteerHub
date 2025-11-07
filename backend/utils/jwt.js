import jwt from 'jsonwebtoken';

/**
 * Generate access token
 * @param {Object} payload - Data to include in the token
 * @returns {string} - Generated JWT
 */
export const generateAccessToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(payload, secret, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
  });
};

/**
 * Generate refresh token
 * @param {Object} payload - Data to include in the token
 * @returns {string} - Generated refresh token
 */
export const generateRefreshToken = (payload) => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(payload, secret, { 
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' 
  });
};

/**
 * Verify access token
 * @param {string} token - JWT to verify
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
export const verifyAccessToken = (token) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return null;
    }
    throw error;
  }
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
export const verifyRefreshToken = (token) => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
  }
  
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return null;
    }
    throw error;
  }
};