import { createEvent, getEvents, getEventById, updateEvent, deleteEvent, submitEventForApproval, getManagerEvents } from '../services/events.service.js';

/**
 * Get all events with optional filters
 * GET /api/events
 */
export async function getAllEvents(req, res) {
  try {
    const { category, startDate, endDate, location, status } = req.query;
    const filters = { category, startDate, endDate, location, status };
    const events = await getEvents(filters);
    res.json(events);
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get event by ID
 * GET /api/events/:id
 */
export async function getEventDetail(req, res) {
  try {
    const { id } = req.params;
    const event = await getEventById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Create event
 * POST /api/events
 * Manager and Admin only
 */
export async function createEventHandler(req, res) {
  try {
    const { title, description, startDate, endDate, location, category, maxParticipants } = req.body;
    
    if (!title || !description || !startDate || !endDate || !location || !category || !maxParticipants) {
      return res.status(400).json({ error: 'All required fields must be provided: title, description, startDate, endDate, location, category, maxParticipants' });
    }
    
    // Ensure the event creator is the logged-in user
    const newEvent = await createEvent({
      ...req.body,
      creatorId: req.user.id
    });
    
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update event
 * PUT /api/events/:id
 * Event owner (manager) only
 */
export async function updateEventHandler(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // The service will check if the user owns the event
    const updatedEvent = await updateEvent(id, updateData, req.user.id);
    
    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found or you do not have permission to edit this event' });
    }
    
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete event
 * DELETE /api/events/:id
 * Event owner (manager) or admin only
 */
export async function deleteEventHandler(req, res) {
  try {
    const { id } = req.params;
    
    const result = await deleteEvent(id, req.user.id, req.user.role);
    
    if (!result) {
      return res.status(404).json({ error: 'Event not found or you do not have permission to delete this event' });
    }
    
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Submit event for approval
 * POST /api/events/:id/submit
 * Event owner (manager) only
 */
export async function submitEvent(req, res) {
  try {
    const { id } = req.params;
    const { note } = req.body;
    
    const event = await submitEventForApproval(id, req.user.id, note);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found or you do not have permission to submit this event' });
    }
    
    res.json({ message: 'Event submitted for approval successfully', event });
  } catch (error) {
    console.error('Error submitting event for approval:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get events for a specific manager
 * GET /api/managers/:id/events
 * Manager and Admin only
 */
export async function getManagerEventsHandler(req, res) {
  try {
    const { id } = req.params;
    
    // Check if the current user is accessing their own events or is an admin
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You do not have permission to view this manager\'s events' });
    }
    
    const events = await getManagerEvents(id);
    res.json(events);
  } catch (error) {
    console.error('Error getting manager events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}