import prisma from './db.js';

async function resetParticipants() {
    try {
        // Reset currentParticipants to 0 for all events
        const result = await prisma.event.updateMany({
            data: { currentParticipants: 0 }
        });
        console.log(`Reset currentParticipants to 0 for ${result.count} events`);

        // Verify
        const events = await prisma.event.findMany({
            select: { title: true, currentParticipants: true, maxParticipants: true }
        });
        console.log('\nUpdated events:');
        events.forEach(e => console.log(`- ${e.title}: ${e.currentParticipants}/${e.maxParticipants}`));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetParticipants();
