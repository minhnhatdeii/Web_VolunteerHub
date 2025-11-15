import express from 'express';
import { authenticateToken, authorizeRole, requireOwnResource } from '../middleware/auth.js';
import {
  getAllEvents,
  getEventDetail,
  createEventHandler,
  updateEventHandler,
  deleteEventHandler,
  submitEvent,
  getManagerEventsHandler
} from '../controllers/events.controller.js';

const router = express.Router();

/**
 * Get all events with optional filters
 * GET /api/events
 * Public endpoint (no authentication required)
 */
router.get('/', getAllEvents);

/**
 * Get event by ID
 * GET /api/events/:id
 * Public endpoint (no authentication required)
 */
router.get('/:id', getEventDetail);

/**
 * Create event
 * POST /api/events
 * Manager and Admin only
 */
router.post('/', authenticateToken, authorizeRole(['MANAGER', 'ADMIN']), createEventHandler);

/**
 * Update event
 * PUT /api/events/:id
 * Event creator (manager) or Admin only
 */
router.put('/:id', authenticateToken, authorizeRole(['MANAGER', 'ADMIN']), updateEventHandler);

/**
 * Delete event
 * DELETE /api/events/:id
 * Event creator (manager) or Admin only
 */
router.delete('/:id', authenticateToken, authorizeRole(['MANAGER', 'ADMIN']), deleteEventHandler);

/**
 * Submit event for approval
 * POST /api/events/:id/submit
 * Event creator (manager) only
 */
router.post('/:id/submit', authenticateToken, authorizeRole(['MANAGER', 'ADMIN']), submitEvent);

/**
 * Get manager's events
 * GET /api/managers/:id/events
 * Manager and Admin only (managers can only access their own events, admins can access any manager's events)
 */
router.get('/managers/:id/events', authenticateToken, authorizeRole(['MANAGER', 'ADMIN']), getManagerEventsHandler);

export default router;