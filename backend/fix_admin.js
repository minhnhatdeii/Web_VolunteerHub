import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function fixAdminUser() {
  try {
    // Find the admin user by email
    const adminUser = await prisma.user.findUnique({
      where: {
        email: 'admin@example.com'
      }
    });

    if (adminUser) {
      // Update the user role to ADMIN if it's not already set
      const updatedUser = await prisma.user.update({
        where: {
          email: 'admin@example.com'
        },
        data: {
          role: 'ADMIN',
          firstName: 'Admin',
          lastName: 'User'
        }
      });
      
      console.log('Updated admin user:', {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName
      });
    } else {
      console.log('Admin user not found in database');
    }
  } catch (error) {
    console.error('Error updating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminUser();