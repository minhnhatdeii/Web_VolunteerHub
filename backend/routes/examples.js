import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Public route - no authentication required
router.get('/public', (req, res) => {
  res.json({ message: 'This is a public route accessible to everyone' });
});

// Protected route - requires authentication
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ 
    message: 'This is a protected route', 
    user: req.user // User info from the middleware
  });
});

// Admin-only route - requires authentication and specific role
router.get('/admin', authenticateToken, authorizeRole(['ADMIN']), (req, res) => {
  res.json({ 
    message: 'This is an admin-only route', 
    user: req.user 
  });
});

// Manager or admin route
router.get('/manager', authenticateToken, authorizeRole(['MANAGER', 'ADMIN']), (req, res) => {
  res.json({ 
    message: 'This route is for managers and admins', 
    user: req.user 
  });
});

export default router;