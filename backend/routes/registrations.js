import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  registerForEventHandler,
  cancelRegistrationHandler,
  getUserRegistrationsHandler,
  approveRegistrationHandler
} from '../controllers/registrations.controller.js';

const router = express.Router();

/**
 * Register for an event
 * POST /api/events/:id/register
 * Requires authentication (volunteers can register)
 */
router.post('/:id/register', authenticateToken, registerForEventHandler);

/**
 * Cancel registration
 * POST /api/events/:id/cancel
 * Requires authentication (only user who registered can cancel)
 */
router.post('/:id/cancel', authenticateToken, cancelRegistrationHandler);

/**
 * Get current user's registrations
 * GET /api/users/me/registrations
 * Requires authentication (only for current user)
 */
router.get('/me', authenticateToken, getUserRegistrationsHandler);

/**
 * Approve registration
 * POST /api/events/:eventId/registrations/:regId/approve
 * Event manager or admin only
 */
router.post('/:eventId/registrations/:regId/approve', authenticateToken, approveRegistrationHandler);

export default router;