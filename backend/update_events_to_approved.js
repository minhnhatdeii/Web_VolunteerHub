import prisma from './db.js';

async function updateEventsToApproved() {
  try {
    // Update all events with PENDING_APPROVAL status to APPROVED
    const updatedEvents = await prisma.event.updateMany({
      where: {
        status: 'PENDING_APPROVAL'
      },
      data: {
        status: 'APPROVED'
      }
    });

    console.log(`${updatedEvents.count} events updated to APPROVED status`);

    // Also update any DRAFT events to APPROVED for testing
    const updatedDrafts = await prisma.event.updateMany({
      where: {
        status: 'DRAFT'
      },
      data: {
        status: 'APPROVED'
      }
    });

    console.log(`${updatedDrafts.count} draft events updated to APPROVED status`);

    console.log('All pending and draft events are now APPROVED and should appear on the events page.');
  } catch (error) {
    console.error('Error updating events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
updateEventsToApproved();