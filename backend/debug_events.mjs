import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function debugEvents() {
  try {
    const allEvents = await prisma.event.findMany();
    console.log('Total events in database:', allEvents.length);
    console.log('Event details:');
    allEvents.forEach(event => {
      console.log('- ID:', event.id, 'Title:', event.title, 'Status:', event.status, 'Created:', event.createdAt);
    });
    
    // Also check what statuses exist
    const statusCounts = await prisma.event.groupBy({
      by: ['status'],
      _count: true,
    });
    console.log('\nEvent count by status:');
    statusCounts.forEach(statusGroup => {
      console.log(`${statusGroup.status}: ${statusGroup._count}`);
    });
  } catch (error) {
    console.error('Error checking events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugEvents();