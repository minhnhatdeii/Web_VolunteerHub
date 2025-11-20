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

    const email = 'admin@example.com'; // Change this to the desired admin email
    const password = 'AdminPassword123!'; // Change this to a secure password

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,  // Skip email confirmation
      user_metadata: {
        first_name: 'Admin',
        last_name: 'User'
      }
    });

    if (error) {
      console.error('Error creating user in Supabase:', error.message);
      return;
    }

    const { user } = data;

    // Create the admin user in our local database
    const adminUser = await prisma.user.create({
      data: {
        email: email,
        password: await bcrypt.hash(password, 10), // Still hash for compatibility
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        externalId: user.id, // Store the Supabase user ID
      },
    });

    console.log('Admin user created successfully in both Supabase and local database!');
    console.log('Email:', adminUser.email);
    console.log('ID:', adminUser.id);
    console.log('Supabase ID:', user.id);
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