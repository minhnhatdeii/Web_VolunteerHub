import express from 'express';
import EventController from '../controllers/event.controller.js';  // Using the same controller

const router = express.Router();

// GET /api/managers/:id/events - list manager's events
router.get('/:id/events', EventController.getManagerEvents);

export default router;