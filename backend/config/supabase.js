import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for storage operations
// Service role key bypasses RLS policies
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase environment variables are not set. Please check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export { supabase };
export default supabase;