import prisma from './db.js';

async function checkUserDetail() {
    try {
        const u = await prisma.user.findUnique({
            where: { email: '22028262@vnu.edu.vn' }
        });
        console.log('User details:');
        console.log(JSON.stringify(u, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUserDetail();
