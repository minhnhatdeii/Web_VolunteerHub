import prisma from '../db.js';
import { createNotification } from './notification.service.js';

/**
 * Register user for an event
 * @param {string} userId - User ID
 * @param {string} eventId - Event ID
 * @returns {Object} Registration object or error
 */
export async function registerForEvent(userId, eventId) {
  // Check if event exists and is still open for registration
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      maxParticipants: true,
      currentParticipants: true,
      startDate: true,
      status: true
    }
  });

  if (!event) {
    return { error: 'Event not found', statusCode: 404 };
  }

  // Check if event is approved and has space
  if (event.status !== 'APPROVED') {
    return { error: 'Event is not approved for registration', statusCode: 400 };
  }

  if (event.currentParticipants >= event.maxParticipants) {
    return { error: 'Event is at maximum capacity', statusCode: 400 };
  }

  // Check if user is already registered
  const existingRegistration = await prisma.registration.findFirst({
    where: {
      userId: userId,
      eventId: eventId
    }
  });

  if (existingRegistration) {
    return { error: 'User is already registered for this event', statusCode: 400 };
  }

  // Create the registration with PENDING status
  const registration = await prisma.registration.create({
    data: {
      userId: userId,
      eventId: eventId,
      status: 'PENDING'
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      event: {
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          location: true
        }
      }
    }
  });

  // Update the event's current participant count
  await prisma.event.update({
    where: { id: eventId },
    data: {
      currentParticipants: { increment: 1 }
    }
  });

  // Notify the event manager about the new registration
  const eventWithCreator = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      creatorId: true,
      title: true
    }
  });

  if (eventWithCreator) {
    await createNotification({
      userId: eventWithCreator.creatorId,
      title: 'Đăng ký mới',
      message: `${registration.user.firstName} ${registration.user.lastName} đã đăng ký sự kiện "${eventWithCreator.title}"`,
      type: 'new_registration',
      data: {
        eventId: eventId,
        eventTitle: eventWithCreator.title,
        registrationId: registration.id
      }
    });
  }

  return registration;
}

/**
 * Cancel user's registration for an event
 * @param {string} userId - User ID
 * @param {string} eventId - Event ID
 * @returns {Object} Result of cancellation
 */
export async function cancelRegistration(userId, eventId) {
  // Find the existing registration
  const registration = await prisma.registration.findFirst({
    where: {
      userId: userId,
      eventId: eventId
    }
  });

  if (!registration) {
    return {
      success: false,
      error: 'Registration not found',
      statusCode: 404
    };
  }

  // Check if registration can be canceled (not attended or completed already)
  if (registration.status === 'ATTENDED' || registration.status === 'CANCELLED') {
    return {
      success: false,
      error: 'Cannot cancel registration that has already been attended or cancelled',
      statusCode: 400
    };
  }

  // Update the registration status to CANCELLED
  await prisma.registration.update({
    where: { id: registration.id },
    data: { status: 'CANCELLED' }
  });

  // Update the event's current participant count
  await prisma.event.update({
    where: { id: eventId },
    data: {
      currentParticipants: { decrement: 1 }
    }
  });

  return {
    success: true,
    message: 'Registration canceled successfully'
  };
}

/**
 * Get user's registrations
 * @param {string} userId - User ID
 * @returns {Array} User's registrations
 */
export async function getUserRegistrations(userId) {
  const registrations = await prisma.registration.findMany({
    where: {
      userId: userId
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          endDate: true,
          location: true,
          status: true
        }
      }
    },
    orderBy: {
      appliedAt: 'desc'
    }
  });

  return registrations;
}

/**
 * Approve a registration
 * @param {string} eventId - Event ID
 * @param {string} registrationId - Registration ID
 * @param {string} managerId - Manager ID performing the approval
 * @param {string} managerRole - Manager's role
 * @returns {Object} Result of approval
 */
export async function approveRegistration(eventId, registrationId, managerId, managerRole) {
  // First, verify that the manager has permission to approve this event's registrations
  // Check if the manager is the event creator or an admin
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      creatorId: true,
      title: true
    }
  });

  if (!event) {
    return {
      success: false,
      error: 'Event not found',
      statusCode: 404
    };
  }

  // Only the event creator (manager) or an admin can approve registrations
  if (event.creatorId !== managerId && managerRole !== 'ADMIN') {
    return {
      success: false,
      error: 'You do not have permission to approve this registration',
      statusCode: 403
    };
  }

  // Verify the registration exists and belongs to the event
  const registration = await prisma.registration.findFirst({
    where: {
      id: registrationId,
      eventId: eventId
    }
  });

  if (!registration) {
    return {
      success: false,
      error: 'Registration not found for this event',
      statusCode: 404
    };
  }

  // Update the registration status to APPROVED
  const updatedRegistration = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      status: 'APPROVED',
      approvedAt: new Date()
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      event: {
        select: {
          id: true,
          title: true,
          startDate: true
        }
      }
    }
  });

  // Create notification for the user whose registration was approved
  await createNotification({
    userId: updatedRegistration.user.id,
    title: 'Đăng ký được duyệt',
    message: `Đăng ký của bạn cho sự kiện "${updatedRegistration.event.title}" đã được duyệt!`,
    type: 'registration_approved',
    data: {
      eventId: eventId,
      eventTitle: updatedRegistration.event.title,
      registrationId: registrationId
    }
  });

  return {
    success: true,
    message: 'Registration approved successfully',
    registration: updatedRegistration
  };
}

/**
 * Reject a registration
 * @param {string} eventId - Event ID
 * @param {string} registrationId - Registration ID
 * @param {string} managerId - Manager ID performing the rejection
 * @param {string} managerRole - Manager's role
 * @returns {Object} Result of rejection
 */
export async function rejectRegistration(eventId, registrationId, managerId, managerRole) {
  // Check permission
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      creatorId: true,
      title: true,
      currentParticipants: true
    }
  });

  if (!event) {
    return {
      success: false,
      error: 'Event not found',
      statusCode: 404
    };
  }

  // Only event creator or admin can reject
  if (event.creatorId !== managerId && managerRole !== 'ADMIN') {
    return {
      success: false,
      error: 'You do not have permission to reject this registration',
      statusCode: 403
    };
  }

  const registration = await prisma.registration.findFirst({
    where: {
      id: registrationId,
      eventId: eventId
    },
    select: {
      id: true,
      status: true
    }
  });

  if (!registration) {
    return {
      success: false,
      error: 'Registration not found for this event',
      statusCode: 404
    };
  }

  // Check if registration is eligible for rejection
  if (registration.status === 'CANCELLED' || registration.status === 'REJECTED') {
    return {
      success: false,
      error: 'This registration has already been cancelled or rejected',
      statusCode: 400
    };
  }

  // If it was previously APPROVED → decrement participant count
  if (registration.status === 'APPROVED') {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        currentParticipants: { decrement: 1 }
      }
    });
  }

  // Update registration to REJECTED
  const updatedRegistration = await prisma.registration.update({
    where: { id: registrationId },
    data: {
      status: 'REJECTED',
      completedAt: new Date()
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      event: {
        select: {
          id: true,
          title: true
        }
      }
    }
  });

  // Create notification for the user whose registration was rejected
  await createNotification({
    userId: updatedRegistration.user.id,
    title: 'Đăng ký bị từ chối',
    message: `Đăng ký của bạn cho sự kiện "${updatedRegistration.event.title}" đã bị từ chối.`,
    type: 'registration_rejected',
    data: {
      eventId: eventId,
      eventTitle: updatedRegistration.event.title,
      registrationId: registrationId
    }
  });

  return {
    success: true,
    message: 'Registration rejected successfully',
    registration: updatedRegistration
  };
}


/**
 * Get registrations for a specific event
 * @param {string} eventId - Event ID
 * @param {Object} options
 * @param {string[]} [options.status] - Optional array of statuses to filter
 * @param {boolean} [options.countOnly=false] - If true, return only the count
 * @returns {Promise<Object|Array>} Registrations list or count
 */
export async function getEventRegistrations(eventId, options = {}) {
  const { status, countOnly = false } = options;

  const whereClause = { eventId };
  if (status && Array.isArray(status) && status.length > 0) {
    whereClause.status = { in: status };
  }

  if (countOnly) {
    const count = await prisma.registration.count({ where: whereClause });
    return { count };
  } else {
    const registrations = await prisma.registration.findMany({
      where: whereClause,
      select: {
        id: true,
        userId: true,
        status: true,
        appliedAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
    return registrations;
  }
}

