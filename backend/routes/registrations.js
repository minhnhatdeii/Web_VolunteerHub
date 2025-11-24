import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  registerForEventHandler,
  cancelRegistrationHandler,
  getUserRegistrationsHandler,
  approveRegistrationHandler,
  getRegistrationsByEvent
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

// Get event regis

/**
 * Approve registration
 * POST /api/events/:eventId/registrations/:regId/approve
 * Event manager or admin only
 */
router.post('/:eventId/registrations/:regId/approve', authenticateToken, approveRegistrationHandler);


/**
 * GET /registrations/event/:eventId
 * Query params:
 *   - status: comma-separated, ví dụ ?status=PENDING,APPROVED
 *   - countOnly: true/false
 */
router.get('/event/:eventId', (req, res, next) => {
  const { status, countOnly } = req.query;

  // Nếu chỉ count APPROVED → public
  if (status === 'APPROVED' && countOnly === 'true') {
    return getRegistrationsByEvent(req, res, next);
  }

  // Ngược lại: cần xác thực
  authenticateToken(req, res, () => getRegistrationsByEvent(req, res, next));
});


export default router;