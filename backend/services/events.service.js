import prisma from '../db.js';

/**
 * Create a new event
 * @param {Object} eventData - Event data
 * @param {string} eventData.creatorId - ID of the event creator
 * @returns {Object} Created event
 */
export async function createEvent(eventData) {
  // Check if the creator is a manager or admin to allow event creation
  const creator = await prisma.user.findUnique({
    where: { id: eventData.creatorId },
    select: { role: true }
  });
  
  if (!creator || (creator.role !== 'MANAGER' && creator.role !== 'ADMIN')) {
    throw new Error('Only managers and admins can create events');
  }
  
  const event = await prisma.event.create({
    data: {
      ...eventData,
      creatorId: eventData.creatorId,
      status: 'DRAFT' // Events default to draft status
    },
    include: {
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      }
    }
  });
  
  return event;
}

/**
 * Get events with optional filters
 * @param {Object} filters - Filter options
 * @returns {Array} Events matching filters
 */
export async function getEvents(filters = {}) {
  const whereClause = {};
  
  if (filters.category) whereClause.category = filters.category;
  if (filters.location) whereClause.location = filters.location;
  if (filters.status) whereClause.status = filters.status;
  
  if (filters.startDate || filters.endDate) {
    whereClause.OR = [];
    if (filters.startDate) {
      whereClause.OR.push({
        startDate: {
          gte: new Date(filters.startDate)
        }
      });
    }
    if (filters.endDate) {
      whereClause.OR.push({
        endDate: {
          lte: new Date(filters.endDate)
        }
      });
    }
  }
  
  // Only return approved/published events to the general public
  whereClause.status = whereClause.status || {
    in: ['APPROVED', 'COMPLETED'] // Only show approved or completed events
  };
  
  const events = await prisma.event.findMany({
    where: whereClause,
    include: {
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      }
    }
  });
  
  return events;
}

/**
 * Get event by ID
 * @param {string} id - Event ID
 * @returns {Object} Event or null if not found
 */
export async function getEventById(id) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      }
    }
  });
  
  return event;
}

/**
 * Update event
 * @param {string} eventId - Event ID
 * @param {Object} updateData - Update data
 * @param {string} userId - User ID making the update
 * @returns {Object} Updated event or null if not authorized
 */
export async function updateEvent(eventId, updateData, userId) {
  // Check if the user is the event creator
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { creatorId: true, status: true }
  });
  
  if (!event) return null;
  
  // Only allow updates if the user is the creator and the event is not yet approved
  if (event.creatorId !== userId) {
    throw new Error('You can only update events you created');
  }
  
  // Prevent editing if the event has already been approved
  if (event.status === 'APPROVED' || event.status === 'REJECTED') {
    throw new Error('Cannot edit event once it has been approved or rejected');
  }
  
  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: updateData,
    include: {
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      }
    }
  });
  
  return updatedEvent;
}

/**
 * Delete event
 * @param {string} eventId - Event ID
 * @param {string} userId - User ID requesting deletion
 * @param {string} userRole - User role
 * @returns {boolean} True if deleted, false if not authorized
 */
export async function deleteEvent(eventId, userId, userRole) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { creatorId: true, status: true }
  });
  
  if (!event) return false;
  
  // Allow deletion if:
  // 1. User is the event creator and event is not yet approved
  // 2. User is an admin (can delete any event)
  if ((event.creatorId === userId && event.status !== 'APPROVED' && event.status !== 'COMPLETED') || userRole === 'ADMIN') {
    await prisma.event.delete({
      where: { id: eventId }
    });
    return true;
  }
  
  return false;
}

/**
 * Submit event for approval
 * @param {string} eventId - Event ID
 * @param {string} userId - User ID submitting the event
 * @param {string} note - Submission note
 * @returns {Object} Updated event or null if not authorized
 */
export async function submitEventForApproval(eventId, userId, note) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { creatorId: true, status: true }
  });
  
  if (!event || event.creatorId !== userId) return null;
  
  // Only allow submission if the event is in draft status
  if (event.status !== 'DRAFT') {
    throw new Error('Event must be in draft status to submit for approval');
  }
  
  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: {
      status: 'SUBMITTED',
      submissionNote: note
    },
    include: {
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      }
    }
  });
  
  return updatedEvent;
}

/**
 * Get events for a specific manager
 * @param {string} managerId - Manager ID
 * @returns {Array} Events created by the manager
 */
export async function getManagerEvents(managerId) {
  const events = await prisma.event.findMany({
    where: { creatorId: managerId },
    include: {
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  return events;
}