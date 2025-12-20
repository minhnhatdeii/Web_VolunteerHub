import prisma from '../db.js';
import {
  registerForEvent,
  cancelRegistration,
  getUserRegistrations,
  approveRegistration,
  rejectRegistration,
  getEventRegistrations
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
      return res.status(registration.statusCode).json({ success: false, message: registration.error });
    }

    res.status(201).json({ success: true, message: 'Successfully registered for event', data: registration });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
      return res.status(result.statusCode).json({ success: false, message: result.error });
    }

    res.json({ success: true, message: result.message });
  } catch (error) {
    console.error('Error canceling registration:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
      return res.status(result.statusCode).json({
        success: false,
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      registration: result.registration
    });

  } catch (err) {
    console.error("Error approving registration:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}

export async function rejectRegistrationHandler(req, res) {
  try {
    const { eventId, regId } = req.params;
    const managerId = req.user.id;
    const managerRole = req.user.role;

    const result = await rejectRegistration(eventId, regId, managerId, managerRole);

    if (!result.success) {
      return res.status(result.statusCode).json({
        success: false,
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      registration: result.registration
    });

  } catch (err) {
    console.error("Error rejecting registration:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}

/**
 * GET /registrations/event/:eventId
 * Query params:
 *   - status (optional, comma-separated)
 *   - countOnly (optional, boolean)
 */
export async function getRegistrationsByEvent(req, res) {
  try {
    const { eventId } = req.params;
    const { status, countOnly } = req.query;
    const statusArray = status ? status.split(',').map(s => s.toUpperCase()) : undefined;
    const isCountOnly = countOnly === 'true';

    // Nếu chỉ là approved + count, không check quyền
    const isPublicRequest = isCountOnly && statusArray?.length === 1 && statusArray[0] === 'APPROVED';

    if (!isPublicRequest) {
      // Kiểm tra quyền: phải là admin hoặc owner của event
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { creatorId: true }
      });

      if (!event) {
        return res.status(404).json({ success: false, error: 'Event not found' });
      }

      if (req.user.role !== 'ADMIN' && req.user.id !== event.creatorId) {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }
    }

    // Lấy registrations từ service
    const registrations = await getEventRegistrations(eventId, {
      status: statusArray,
      countOnly: isCountOnly
    });

    return res.json({ success: true, data: registrations });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}