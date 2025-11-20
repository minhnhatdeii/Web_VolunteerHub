import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function updateAdminExternalId() {
  try {
    // Update the admin user with the correct externalId
    const updatedUser = await prisma.user.update({
      where: {
        email: 'admin@example.com'
      },
      data: {
        externalId: 'ce1201e0-5dc1-41b0-98e2-1c385fe7d800'  // The Supabase user ID found earlier
      }
    });
    
    console.log('Updated admin user with externalId:', {
      id: updatedUser.id,
      email: updatedUser.email,
      externalId: updatedUser.externalId
    });
    
    console.log('Admin user should now be able to login successfully!');
  } catch (error) {
    console.error('Error updating admin user externalId:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminExternalId();