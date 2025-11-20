import express from 'express';
import AdminController from '../controllers/admin.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/events - List events with optional status filter (admin can see all events)
router.get('/events', authenticateToken, requireRole('ADMIN'), AdminController.getPendingEvents);

// POST /api/admin/events/:id/approve - Approve event (admin only)
router.post('/events/:id/approve', authenticateToken, requireRole('ADMIN'), AdminController.adminApproveEvent);

// POST /api/admin/events/:id/reject - Reject event (admin only)
router.post('/events/:id/reject', authenticateToken, requireRole('ADMIN'), AdminController.adminRejectEvent);

export default router;