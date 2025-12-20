import { PrismaClient } from '../generated/prisma/index.js';
import { createNotification } from '../services/notification.service.js'; // Import notification service
import * as reportsService from '../services/reports.service.js';
import * as exportService from '../services/export.service.js';
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

    emitEventUpdate(updatedEvent, 'APPROVED');

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

    emitEventUpdate(updatedEvent, 'REJECTED');

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

    res.json({
      message: 'Event rejected successfully',
      event: updatedEvent
    });
  } catch (err) {
    console.error('Error rejecting event:', err);
    res.status(500).json({ error: 'Failed to reject event' });
  }
};

/* -----------------------------------------------------------
     GET /api/admin/reports/events-by-month — get events aggregated by month
     Admin only - returns monthly event counts for charts
  ------------------------------------------------------------*/
export const getEventsByMonth = async (req, res) => {
  try {
    const { year } = req.query;
    const yearNum = year ? parseInt(year) : undefined;

    const result = await reportsService.getEventsByMonth(yearNum);
    res.json(result);
  } catch (err) {
    console.error('Error fetching events by month:', err);
    res.status(500).json({ error: 'Failed to fetch events by month' });
  }
};

/* -----------------------------------------------------------
   GET /api/admin/reports/dashboard-stats — get dashboard statistics
   Admin only - returns counts for dashboard
------------------------------------------------------------*/
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await reportsService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

/* -----------------------------------------------------------
   GET /api/admin/export/events.csv — export events as CSV
   Admin only - downloads events data as CSV file
------------------------------------------------------------*/
export const exportEvents = async (req, res) => {
  try {
    const events = await reportsService.getEventReport();
    const csv = exportService.generateEventsCSV(events);

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=events.csv');
    res.send(csv);
  } catch (err) {
    console.error('Error exporting events:', err);
    res.status(500).json({ error: 'Failed to export events' });
  }
};

/* -----------------------------------------------------------
   GET /api/admin/export/registrations.csv — export registrations as CSV
   Admin only - downloads registrations data as CSV file
------------------------------------------------------------*/
export const exportRegistrations = async (req, res) => {
  try {
    const registrations = await reportsService.getRegistrationReport();
    const csv = exportService.generateRegistrationsCSV(registrations);

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=registrations.csv');
    res.send(csv);
  } catch (err) {
    console.error('Error exporting registrations:', err);
    res.status(500).json({ error: 'Failed to export registrations' });
  }
};

export default {
  getPendingEvents,
  adminApproveEvent,
  adminRejectEvent,
  getEventsByMonth,
  getDashboardStats,
  exportEvents,
  exportRegistrations,
};

