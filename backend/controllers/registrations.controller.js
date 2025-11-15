import { 
  registerForEvent, 
  cancelRegistration, 
  getUserRegistrations, 
  approveRegistration 
} from '../services/registrations.service.js';

/**
 * Register for an event
 * POST /api/events/:id/register
 */
export async function registerForEventHandler(req, res) {
  try {
    const { id } = req.params; // event id
    const userId = req.user.id;
    
    const registration = await registerForEvent(userId, id);
    
    if (registration.error) {
      return res.status(registration.statusCode).json({ error: registration.error });
    }
    
    res.status(201).json({ message: 'Successfully registered for event', registration });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Cancel registration
 * POST /api/events/:id/cancel
 */
export async function cancelRegistrationHandler(req, res) {
  try {
    const { id } = req.params; // event id
    const userId = req.user.id;
    
    const result = await cancelRegistration(userId, id);
    
    if (!result.success) {
      return res.status(result.statusCode).json({ error: result.error });
    }
    
    res.json({ message: result.message });
  } catch (error) {
    console.error('Error canceling registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get user's registrations
 * GET /api/users/me/registrations
 */
export async function getUserRegistrationsHandler(req, res) {
  try {
    const userId = req.user.id;
    
    const registrations = await getUserRegistrations(userId);
    
    res.json(registrations);
  } catch (error) {
    console.error('Error getting user registrations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Approve registration
 * POST /api/events/:eventId/registrations/:regId/approve
 * Event manager or admin only
 */
export async function approveRegistrationHandler(req, res) {
  try {
    const { eventId, regId } = req.params;
    const managerId = req.user.id;
    const managerRole = req.user.role;
    
    const result = await approveRegistration(eventId, regId, managerId, managerRole);
    
    if (!result.success) {
      return res.status(result.statusCode).json({ error: result.error });
    }
    
    res.json({ message: result.message, registration: result.registration });
  } catch (error) {
    console.error('Error approving registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}