import 'dotenv/config';
import { supabase } from './config/supabase.js';
import { signUpWithSupabase, signInWithSupabase } from './helpers/supabase-auth.js';

// Test Supabase authentication with a more realistic email
async function testSupabaseAuth() {
  console.log('Testing Supabase authentication with realistic email...');

  // Use a more realistic email that might pass validation
  const testEmail = `testuser${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  console.log(`Using email: ${testEmail}`);

  // Test sign up
  try {
    console.log('Testing user registration...');
    const signUpResult = await signUpWithSupabase({
      email: testEmail,
      password: testPassword,
      firstName: 'Test',
      lastName: 'User'
    });
    
    console.log('Sign up result:', signUpResult);
  } catch (error) {
    console.error('Sign up error:', error.message);
  }

  // Test sign in with the same credentials
  try {
    console.log('\nTesting user login...');
    const signInResult = await signInWithSupabase({
      email: testEmail,
      password: testPassword
    });
    
    console.log('Sign in result:', signInResult);
  } catch (error) {
    console.error('Sign in error:', error.message);
  }

  // Clean up: sign out
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error.message);
    } else {
      console.log('\nSuccessfully signed out');
    }
  } catch (error) {
    console.error('Sign out error:', error.message);
  }

  console.log('\nSupabase authentication test completed.');
}

// Run the test
testSupabaseAuth().catch(console.error);