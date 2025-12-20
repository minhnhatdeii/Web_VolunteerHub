import prisma from './db.js';

async function checkUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                updatedAt: true
            },
            orderBy: { updatedAt: 'desc' },
            take: 5
        });

        console.log('Most recently updated users:');
        users.forEach(u => {
            console.log(`- ${u.email}: ${u.firstName} ${u.lastName} (${u.role})`);
            console.log(`  ID: ${u.id}`);
            console.log(`  Updated: ${u.updatedAt}`);
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
