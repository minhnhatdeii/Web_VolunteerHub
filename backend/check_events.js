import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function checkEvents() {
  try {
    // Count events by status
    const allEvents = await prisma.event.findMany();
    console.log(`Total events in database: ${allEvents.length}`);

    const pendingApprovalEvents = await prisma.event.findMany({
      where: {
        status: 'PENDING_APPROVAL'
      }
    });
    console.log(`Events with status PENDING_APPROVAL: ${pendingApprovalEvents.length}`);
    
    if (pendingApprovalEvents.length > 0) {
      console.log('Details of PENDING_APPROVAL events:');
      pendingApprovalEvents.forEach(event => {
        console.log(`- ID: ${event.id}, Title: ${event.title}, Status: ${event.status}, Created: ${event.createdAt}`);
      });
    }

    // Also check for other statuses
    const otherStatuses = await prisma.event.groupBy({
      by: ['status'],
      _count: true,
    });
    console.log('\nEvent count by status:');
    otherStatuses.forEach(statusGroup => {
      console.log(`${statusGroup.status}: ${statusGroup._count}`);
    });

  } catch (error) {
    console.error('Error checking events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEvents();