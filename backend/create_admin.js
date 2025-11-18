import bcrypt from 'bcrypt';
import prisma from './db.js';

async function createAdminUser() {
  try {
    const email = 'admin@example.com'; // Change this to the desired admin email
    const password = 'AdminPassword123!'; // Change this to a secure password
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      },
    });

    console.log('Admin user created successfully!');
    console.log('Email:', adminUser.email);
    console.log('ID:', adminUser.id);
    console.log('Role:', adminUser.role);
    console.log('Note: Please change the default password after first login for security.');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createAdminUser();