import bcrypt from 'bcrypt';
import prisma from './db.js';

async function createAdminAccount() {
  try {
    const email = 'minhnhatyt2004@gmail.com';
    const password = '123123';
    const firstName = 'Admin';
    const lastName = 'User';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      console.log(`User with email ${email} already exists!`);
      console.log('Email:', existingUser.email);
      console.log('ID:', existingUser.id);
      console.log('Role:', existingUser.role);
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
        firstName: firstName,
        lastName: lastName,
        role: 'ADMIN',
      },
    });

    console.log('Admin account created successfully!');
    console.log('Email:', adminUser.email);
    console.log('ID:', adminUser.id);
    console.log('Role:', adminUser.role);
    console.log('First Name:', adminUser.firstName);
    console.log('Last Name:', adminUser.lastName);
    console.log('Password has been securely hashed.');
  } catch (error) {
    console.error('Error creating admin account:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createAdminAccount();