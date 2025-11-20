import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function findAdminInSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Supabase URL and Service Role Key are required');
    return;
  }

  // Create a client with the service role key to manage users
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  });

  try {
    // List all users to find the admin user
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error listing users:', error.message);
      return;
    }

    const adminUser = data.users.find(user => user.email === 'admin@example.com');
    
    if (adminUser) {
      console.log('Found admin user in Supabase:');
      console.log('ID:', adminUser.id);
      console.log('Email:', adminUser.email);
      console.log('Created at:', adminUser.created_at);
      console.log('User metadata:', adminUser.user_metadata);
      
      // Return the external ID
      return adminUser.id;
    } else {
      console.log('Admin user not found in Supabase');
      // List all users for debugging
      console.log('All Supabase users:');
      data.users.forEach(user => {
        console.log(`- ID: ${user.id}, Email: ${user.email}`);
      });
      return null;
    }
  } catch (error) {
    console.error('Error finding admin in Supabase:', error);
    return null;
  }
}

findAdminInSupabase();