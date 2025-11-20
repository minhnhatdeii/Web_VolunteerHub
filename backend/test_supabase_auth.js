import 'dotenv/config';
import { supabase } from './config/supabase.js';
import { signUpWithSupabase, signInWithSupabase } from './helpers/supabase-auth.js';

// Test Supabase authentication
async function testSupabaseAuth() {
  console.log('Testing Supabase authentication...');

  // Test sign up
  try {
    console.log('Testing user registration...');
    const signUpResult = await signUpWithSupabase({
      email: 'test@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User'
    });

    console.log('Sign up result:', signUpResult);
  } catch (error) {
    console.error('Sign up error:', error.message);
  }

  // Test sign in
  try {
    console.log('\nTesting user login...');
    const signInResult = await signInWithSupabase({
      email: 'test@example.com',
      password: 'testpassword123'
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