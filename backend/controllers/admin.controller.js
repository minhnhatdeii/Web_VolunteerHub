import { PrismaClient } from '../generated/prisma/index.js';
import { createNotification } from '../services/notification.service.js'; // Import notification service
import { emitEventUpdate } from '../realtime/index.js';

const prisma = new PrismaClient();

/* -----------------------------------------------------------
   GET /api/admin/events — list events with optional status filter
   Admin only - can see all events, not just pending approval
------------------------------------------------------------*/
export const getPendingEvents = async (req, res) => {
  try {
    const { status, q, page = 1, limit = 10 } = req.query;
    const where = {};

    // Filter by status if provided
    if (status) {
      where.status = status;
    }
    // If no status is provided, admin can see all events (not just pending approval)

    // Add search functionality if query parameter is provided
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination values
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination info
    const totalCount = await prisma.event.count({ where });

    // Get the events with pagination
    const events = await prisma.event.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    });

    res.json({
      data: events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum),
      }
    });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

/* -----------------------------------------------------------
   POST /api/admin/events/:id/approve — approve event
   Admin only
------------------------------------------------------------*/
export const adminApproveEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const { reason } = req.body; // Optional reason for approval

    // Find the event
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ error: 'Only pending approval events can be approved' });
    }

    // Update the event status to approved
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        status: 'APPROVED',
        submissionNote: reason ? `${event.submissionNote || ''} Approval reason: ${reason}`.trim() : event.submissionNote
      },
    });

    try {
      emitEventUpdate(updatedEvent, 'APPROVED');
    } catch (emitErr) {
      console.error('Error emitting event update:', emitErr);
      // Continue with the response even if emit fails
    }

    try {
      // Create notification for the event creator
      await createNotification({
        userId: event.creator.id,
        title: 'Event Approved',
        message: `Your event "${event.title}" has been approved by an administrator.`,
        type: 'EVENT_APPROVED',
        data: {
          eventId: event.id,
          eventTitle: event.title,
          reason: reason
        }
      });
    } catch (notificationErr) {
      console.error('Error creating notification for event creator:', notificationErr);
      // Continue with the response even if notification fails
    }

    res.json({
      message: 'Event approved successfully',
      event: updatedEvent
    });
  } catch (err) {
    console.error('Error approving event:', err);
    res.status(500).json({ error: 'Failed to approve event' });
  }
};

/* -----------------------------------------------------------
   POST /api/admin/events/:id/reject — reject event
   Admin only
------------------------------------------------------------*/
export const adminRejectEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const { reason } = req.body; // Required reason for rejection

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    // Find the event
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ error: 'Only pending approval events can be rejected' });
    }

    // Update the event status to rejected
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        status: 'REJECTED',
        submissionNote: reason ? `${event.submissionNote || ''} Rejection reason: ${reason}`.trim() : reason
      },
    });

    try {
      emitEventUpdate(updatedEvent, 'REJECTED');
    } catch (emitErr) {
      console.error('Error emitting event update:', emitErr);
      // Continue with the response even if emit fails
    }

    try {
      // Create notification for the event creator
      await createNotification({
        userId: event.creator.id,
        title: 'Event Rejected',
        message: `Your event "${event.title}" has been rejected by an administrator. Reason: ${reason}`,
        type: 'EVENT_REJECTED',
        data: {
          eventId: event.id,
          eventTitle: event.title,
          reason: reason
        }
      });
    } catch (notificationErr) {
      console.error('Error creating notification for event creator:', notificationErr);
      // Continue with the response even if notification fails
    }

    // Note: We don't send notifications to volunteers about rejected events
    // as it's generally not necessary for them to know about rejected events

    res.json({
      message: 'Event rejected successfully',
      event: updatedEvent
    });
  } catch (err) {
    console.error('Error rejecting event:', err);
    res.status(500).json({ error: 'Failed to reject event' });
  }
};

export default {
  getPendingEvents,
  adminApproveEvent,
  adminRejectEvent,
};
