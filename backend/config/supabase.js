import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Please check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase };
export default supabase;