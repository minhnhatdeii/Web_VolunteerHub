import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} from '../controllers/notifications.controller.js';

const router = express.Router();

/**
 * Get notifications for the authenticated user
 * GET /api/users/me/notifications
 * Query params: limit, offset, unreadOnly
 */
router.get('/', authenticateToken, getNotifications);

/**
 * Get unread notification count
 * GET /api/users/me/notifications/unread-count
 */
router.get('/unread-count', authenticateToken, getUnreadCount);

/**
 * Mark all notifications as read
 * PUT /api/users/me/notifications/read-all
 */
router.put('/read-all', authenticateToken, markAllAsRead);

/**
 * Mark a specific notification as read
 * PUT /api/users/me/notifications/:id/read
 */
router.put('/:id/read', authenticateToken, markAsRead);

export default router;
