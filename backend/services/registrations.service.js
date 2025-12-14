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
          location: true,
          creatorId: true
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

  // Create notification for the volunteer
  try {
    await createNotification({
      userId: userId,
      title: 'Đăng ký sự kiện thành công',
      message: `Bạn đã đăng ký tham gia sự kiện "${registration.event.title}". Vui lòng chờ quản lý phê duyệt.`,
      type: 'REGISTRATION_CREATED',
      data: {
        eventId: registration.event.id,
        eventTitle: registration.event.title,
        registrationId: registration.id,
        status: 'PENDING'
      }
    });
  } catch (notifError) {
    console.error('Failed to create registration notification:', notifError);
  }

  // Create notification for event manager
  try {
    console.log('Creating notification for event manager:', {
      userId: registration.event.creatorId,
      eventTitle: registration.event.title,
      userName: `${registration.user.firstName} ${registration.user.lastName}`
    });

    const notification = await createNotification({
      userId: registration.event.creatorId,
      title: 'New Registration Request',
      message: `${registration.user.firstName} ${registration.user.lastName} has registered for "${registration.event.title}"`,
      type: 'NEW_REGISTRATION',
      data: {
        eventId: registration.event.id,
        eventTitle: registration.event.title,
        registrationId: registration.id,
        userId: registration.user.id,
        userName: `${registration.user.firstName} ${registration.user.lastName}`
      }
    });

    console.log('Successfully created notification:', notification);
  } catch (notifError) {
    console.error('Failed to create registration notification:', notifError);
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

  // Create notification for the user
  try {
    console.log('Creating approval notification for user:', {
      userId: updatedRegistration.user.id,
      eventTitle: updatedRegistration.event.title
    });

    const notification = await createNotification({
      userId: updatedRegistration.user.id,
      title: 'Registration Approved',
      message: `Your registration for "${updatedRegistration.event.title}" has been approved!`,
      type: 'REGISTRATION_APPROVED',
      data: {
        eventId: updatedRegistration.event.id,
        eventTitle: updatedRegistration.event.title,
        startDate: updatedRegistration.event.startDate
      }
    });

    console.log('Successfully created approval notification:', notification);
  } catch (notifError) {
    console.error('Failed to create notification:', notifError);
  }

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

  // Create notification for the user
  try {
    console.log('Creating rejection notification for user:', {
      userId: updatedRegistration.user.id,
      eventTitle: updatedRegistration.event.title
    });

    const notification = await createNotification({
      userId: updatedRegistration.user.id,
      title: 'Registration Rejected',
      message: `Your registration for "${updatedRegistration.event.title}" has been rejected.`,
      type: 'REGISTRATION_REJECTED',
      data: {
        eventId: updatedRegistration.event.id,
        eventTitle: updatedRegistration.event.title
      }
    });

    console.log('Successfully created rejection notification:', notification);
  } catch (notifError) {
    console.error('Failed to create notification:', notifError);
  }

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

