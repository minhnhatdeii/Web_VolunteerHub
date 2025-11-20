import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    // Find the admin user by email
    const adminUser = await prisma.user.findUnique({
      where: {
        email: 'admin@example.com'
      }
    });

    if (adminUser) {
      console.log('Admin user details:', {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        externalId: adminUser.externalId
      });
    } else {
      console.log('Admin user not found in database');
    }
  } catch (error) {
    console.error('Error checking admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();