
import prisma from '../db.js';

async function main() {
    const user = await prisma.user.findFirst();
    console.log('User ID:', user?.id);
    console.log('User Email:', user?.email);
    console.log('User First Name:', user?.firstName);
    await prisma.$disconnect();
}

main();
