import express from "express";
import EventController from "../controllers/event.controller.js";
import { 
  authenticateToken, 
  requireRole 
} from "../middleware/auth.js";

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
// 1. GET /api/events  
router.get("/", EventController.getEvents);

// 2. GET /api/events/:id  
router.get("/:id", EventController.getEventById);

// 3. POST /api/events  (Manager only)
router.post(
  "/",
  authenticateToken,
  requireRole("MANAGER"),
  EventController.createEvent
);

// 4. PUT /api/events/:id  (Manager only)
router.put(
  "/:id",
  authenticateToken,
  requireRole("MANAGER"),
  EventController.updateEvent
);

// 5. DELETE /api/events/:id  (Manager, Admin)
router.delete(
  "/:id",
  authenticateToken,
  requireRole(["MANAGER", "ADMIN"]),
  EventController.deleteEvent
);

// 6. POST /api/events/:id/submit (submit for approval)
router.post(
  "/:id/submit",
  authenticateToken,
  requireRole("MANAGER"),
  EventController.submitEventForApproval
);

// 7. POST /api/events/:id/approve (approve event)
router.post(
  "/:id/approve",
  authenticateToken,
  requireRole("ADMIN"),
  EventController.approveEvent
);

// 8. GET /api/managers/:id/events (list manager’s events)
router.get(
  "/:id/events",
  EventController.getManagerEvents
);

// 9. Upload thumbnail → Supabase
router.post(
  "/:id/upload-thumbnail",
  authenticateToken,
  requireRole("MANAGER"),
  EventController.uploadEventThumbnail
);

export default router;


// import express from 'express';
// const router = express.Router();

// // Placeholder routes for event management (to be implemented in Milestone 4)
// router.get('/', (req, res) => {
//   res.status(501).json({ error: 'Get events endpoint not implemented yet' });
// });

// router.get('/:id', (req, res) => {
//   res.status(501).json({ error: 'Get event details endpoint not implemented yet' });
// });

// router.post('/', (req, res) => {
//   res.status(501).json({ error: 'Create event endpoint not implemented yet' });
// });

// router.put('/:id', (req, res) => {
//   res.status(501).json({ error: 'Edit event endpoint not implemented yet' });
// });

// router.delete('/:id', (req, res) => {
//   res.status(501).json({ error: 'Delete event endpoint not implemented yet' });
// });

// router.post('/:id/submit', (req, res) => {
//   res.status(501).json({ error: 'Event submission for approval endpoint not implemented yet' });
// });

// router.get('/:id/registrations', (req, res) => {
//   res.status(501).json({ error: 'Get event registrations endpoint not implemented yet' });
// });

// export default router;