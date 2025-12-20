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

// GET /api/admin/reports/events-by-month - Get events aggregated by month
router.get('/reports/events-by-month', authenticateToken, requireRole('ADMIN'), AdminController.getEventsByMonth);

// GET /api/admin/reports/dashboard-stats - Get dashboard statistics
router.get('/reports/dashboard-stats', authenticateToken, requireRole('ADMIN'), AdminController.getDashboardStats);

// GET /api/admin/export/events.csv - Export events as CSV
router.get('/export/events.csv', authenticateToken, requireRole('ADMIN'), AdminController.exportEvents);

// GET /api/admin/export/registrations.csv - Export registrations as CSV
router.get('/export/registrations.csv', authenticateToken, requireRole('ADMIN'), AdminController.exportRegistrations);

export default router;