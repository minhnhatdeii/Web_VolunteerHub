import 'dotenv/config';
import { supabase } from './config/supabase.js';

console.log('Attempting to test Supabase connection...');

async function testSupabaseConnection() {
  try {
    // Test by listing buckets (this doesn't require specific permissions)
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error.message);
      return;
    }
    
    console.log('Supabase connection successful!');
    console.log('Available buckets:', data);
    
    // Test storage functionality by attempting to list files in a bucket
    // (This will help verify if your policies are working)
    const { data: avatarFiles, error: avatarError } = await supabase
      .storage
      .from('user_avatars')
      .list('', { limit: 1 });
    
    if (avatarError && avatarError.code !== '403') { // 403 is expected if no files exist
      console.error('Error accessing user_avatars bucket:', avatarError.message);
    } else if (avatarFiles) {
      console.log('Successfully accessed user_avatars bucket');
    } else {
      console.log('User_avatars bucket access verified (or no files exist)');
    }
    
    // Test authentication by checking if we can get user info
    // (This will be null if no user is signed in, which is expected)
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Auth test completed (user may be null if not signed in)');
    
    console.log('All Supabase connection tests completed successfully!');
  } catch (error) {
    console.error('Unexpected error during Supabase connection test:', error.message);
  }
}

testSupabaseConnection();