
import prisma from '../db.js';

async function main() {
    const events = await prisma.event.findMany({
        select: { title: true, startDate: true, status: true }
    });
    const now = new Date();
    console.log('Now:', now);
    console.log('Events:');
    events.forEach(e => {
        console.log(`- ${e.title}: ${e.startDate} (Future: ${new Date(e.startDate) > now})`);
    });
    await prisma.$disconnect();
}
main();
