import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function checkEvents() {
  try {
    const allEvents = await prisma.event.findMany();
    console.log(`Total events in database: ${allEvents.length}`);

    console.log('\nAll events:');
    allEvents.forEach(event => {
      console.log(`- ID: ${event.id}`);
      console.log(`  Title: ${event.title}`);
      console.log(`  Status: ${event.status}`);
      console.log(`  CreatedAt: ${event.createdAt}`);
      console.log(`  CreatorId: ${event.creatorId}`);
      console.log('---');
    });

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