import prisma from '../db.js';

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
  
  return { 
    success: true, 
    message: 'Registration approved successfully', 
    registration: updatedRegistration 
  };
}