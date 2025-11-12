import express from 'express';
import { register, login, refresh } from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * Register a new user
 * POST /api/auth/register
 */
router.post('/register', register);

/**
 * Login user
 * POST /api/auth/login
 */
router.post('/login', login);

/**
 * Refresh access token using refresh token
 * POST /api/auth/refresh
 */
router.post('/refresh', refresh);

/**
 * Logout user (client-side: remove tokens from storage)
 * POST /api/auth/logout
 */
router.post('/logout', async (req, res) => {
  try {
    // In a real application, you might want to blacklist the refresh token here
    // For now, we just tell the client to remove the tokens
    
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Internal server error during logout' 
    });
  }
});

export default router;
