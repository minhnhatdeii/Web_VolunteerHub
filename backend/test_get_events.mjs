import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function testGetEvents() {
  try {
    // Replicate the same logic as in the getEvents controller
    const where = {}; // Empty where clause since no query params are passed
    
    const events = await prisma.event.findMany({
      where,
      include: { creator: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    console.log('Events that should be returned from API:');
    console.log('Total count:', events.length);
    events.forEach(event => {
      console.log('- ID:', event.id, 'Title:', event.title, 'Status:', event.status, 'Creator:', event.creator.firstName + ' ' + event.creator.lastName);
    });
  } catch (error) {
    console.error('Error getting events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGetEvents();