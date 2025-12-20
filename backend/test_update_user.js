import prisma from './db.js';

async function testUpdate() {
    try {
        const updated = await prisma.user.update({
            where: { email: '22028262@vnu.edu.vn' },
            data: {
                firstName: 'Test',
                lastName: 'User'
            }
        });
        console.log('Updated user:');
        console.log('firstName:', updated.firstName);
        console.log('lastName:', updated.lastName);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testUpdate();
