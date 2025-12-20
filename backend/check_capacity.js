import prisma from './db.js';

async function checkCapacity() {
    try {
        const events = await prisma.event.findMany({
            select: {
                id: true,
                title: true,
                status: true,
                currentParticipants: true,
                maxParticipants: true
            }
        });

        console.log('Events capacity:');
        events.forEach(e => {
            const full = e.currentParticipants >= e.maxParticipants ? ' [FULL]' : '';
            console.log(`- ${e.title}: ${e.currentParticipants}/${e.maxParticipants} (${e.status})${full}`);
        });

        // Check registrations count
        const regs = await prisma.registration.findMany({
            select: { id: true, userId: true, eventId: true, status: true }
        });
        console.log(`\nTotal registrations in DB: ${regs.length}`);
        regs.forEach(r => console.log(`  - Event: ${r.eventId}, User: ${r.userId}, Status: ${r.status}`));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkCapacity();
