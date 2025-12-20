
import { updateMeService } from './services/users.service.js';
import prisma from './db.js';

async function test() {
    const userId = '969c6594-36c8-4c1b-96f0-5e96fc6e677e';
    const payload = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast'
    };

    console.log('Testing updateMeService...');
    try {
        const result = await updateMeService(userId, payload);
        console.log('Result:', JSON.stringify(result, null, 2));

        if (result.user) {
            console.log('New Name:', result.user.firstName, result.user.lastName);
        }
    } catch (err) {
        console.error('Error:', err);
    }

    await prisma.$disconnect();
}

test();
