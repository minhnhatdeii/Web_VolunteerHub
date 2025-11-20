import prisma from './db.js';

async function checkUser() {
  try {
    // Check for admin@example.com user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });

    if (adminUser) {
      console.log('Admin user found!');
      console.log('Email:', adminUser.email);
      console.log('ID:', adminUser.id);
      console.log('Role:', adminUser.role);
      console.log('First Name:', adminUser.firstName);
      console.log('Last Name:', adminUser.lastName);
      console.log('Created at:', adminUser.createdAt);
    } else {
      console.log('No user found with email: admin@example.com');
    }
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();