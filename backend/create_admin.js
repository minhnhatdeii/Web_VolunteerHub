import bcrypt from 'bcrypt';
import prisma from './db.js';

async function createAdminUser() {
  try {
    const email = 'admin@example.com'; // Change this to the desired admin email
    const password = 'AdminPassword123!'; // Change this to a secure password

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      console.log(`Admin user with email ${email} already exists!`);
      console.log('Email:', existingUser.email);
      console.log('ID:', existingUser.id);
      console.log('Role:', existingUser.role);
      console.log('First Name:', existingUser.firstName);
      console.log('Last Name:', existingUser.lastName);
      return;
    }

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