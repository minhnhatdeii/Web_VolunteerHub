import express from 'express';
import { authenticateToken, authorizeRole, requireOwnResource } from '../middleware/auth.js';
import { getMe, updateMe, uploadAvatar, getUserById, lockUser, updateUserById } from '../controllers/users.controller.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * Get current user profile
 * GET /api/users/me
 * Requires authentication
 */
router.get('/me', authenticateToken, getMe);

/**
 * Update current user profile
 * PUT /api/users/me
 * Requires authentication
 */
router.put('/me', authenticateToken, updateMe);

router.post('/me/avatar', authenticateToken, uploadAvatar);

/**
 * Get user by ID
 * GET /api/users/:id
 * Requires authentication and appropriate role
 */
router.get('/:id', authenticateToken, authorizeRole(['ADMIN', 'MANAGER']), getUserById);

/**
 * Lock/unlock user account
 * POST /api/users/:id/lock
 * Requires admin or manager role
 */
router.post('/:id/lock', authenticateToken, authorizeRole(['ADMIN', 'MANAGER']), lockUser);

/**
 * Update user by ID
 * PUT /api/users/:id
 * Requires admin or manager role
 */
router.put('/:id', authenticateToken, authorizeRole(['ADMIN', 'MANAGER']), requireOwnResource('id'), updateUserById);

export default router;
