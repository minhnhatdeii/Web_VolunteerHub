import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import prisma from './db.js';

async function createAdminUser() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Supabase URL and Service Role Key are required');
      return;
    }

    // Create a client with the service role key to create users
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    const email = 'volunteerhub.admin@example.com'; // Different admin email
    const password = 'AdminPassword123!'; // Change this to a secure password

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,  // Skip email confirmation
      user_metadata: {
        first_name: 'VolunteerHub',
        last_name: 'Admin'
      }
    });

    if (error) {
      if (error.message.includes('email address is already registered')) {
        console.log('Admin user already exists in Supabase Auth. Retrieving existing user...');
        // Try to find the existing user
        const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
        if (userError) {
          console.error('Error listing users:', userError.message);
          return;
        }
        
        const existingUser = userData.users.find(user => user.email === email);
        if (!existingUser) {
          console.error('Could not find existing user in Supabase Auth');
          return;
        }
        
        // Check if local database record exists
        let localUser = await prisma.user.findUnique({
          where: { email: email }
        });
        
        if (!localUser) {
          // Create local record only if it doesn't exist
          localUser = await prisma.user.create({
            data: {
              email: email,
              password: await bcrypt.hash(password, 10), // Still hash for compatibility
              firstName: 'VolunteerHub',
              lastName: 'Admin',
              role: 'ADMIN',
              externalId: existingUser.id, // Store the Supabase user ID
            },
          });
          console.log('Local admin user created successfully!');
        } else {
          console.log('Local admin user already exists in the database');
        }
        
        console.log('Admin user verified/created successfully in both Supabase and local database!');
        console.log('Email:', localUser.email);
        console.log('ID:', localUser.id);
        console.log('Supabase ID:', existingUser.id);
        console.log('Role:', localUser.role);
        return;
      } else {
        console.error('Error creating user in Supabase:', error.message);
        return;
      }
    }

    const { user } = data;

    // Check if the user already exists in our local database
    let localUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (localUser) {
      console.log('Admin user already exists in local database');
      console.log('Email:', localUser.email);
      console.log('ID:', localUser.id);
      console.log('Role:', localUser.role);
      return;
    }

    // Create the admin user in our local database
    localUser = await prisma.user.create({
      data: {
        email: email,
        password: await bcrypt.hash(password, 10), // Still hash for compatibility
        firstName: 'VolunteerHub',
        lastName: 'Admin',
        role: 'ADMIN',
        externalId: user.id, // Store the Supabase user ID
      },
    });

    console.log('Admin user created successfully in both Supabase and local database!');
    console.log('Email:', localUser.email);
    console.log('ID:', localUser.id);
    console.log('Supabase ID:', user.id);
    console.log('Role:', localUser.role);
    console.log('Note: Please change the default password after first login for security.');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createAdminUser();