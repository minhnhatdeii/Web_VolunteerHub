import { supabase } from '../config/supabase.js';
import { create, findByEmail, findByExternalId, updateByExternalId } from '../repositories/user.repo.js';

// Function to sign up a new user with Supabase Auth
export const signUpWithSupabase = async ({ email, password, firstName, lastName, role = 'VOLUNTEER' }) => {
  // Check if user already exists in our database
  const existingUser = await findByEmail(email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Sign up with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Redirect to the confirmation page after email confirmation
      emailRedirectTo: process.env.SUPABASE_REDIRECT_URL || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/confirmation`
    }
  });

  if (error) {
    console.error('Supabase sign up error:', error);
    throw new Error(error.message);
  }

  const { user, session } = data;
  if (!user) {
    throw new Error('User registration failed');
  }

  // Check if user profile already exists in our database from a previous session
  let userProfile = await findByExternalId(user.id);

  if (!userProfile) {
    // Create user profile in our database
    userProfile = await create({
      email: user.email,
      firstName,
      lastName,
      role: role.toUpperCase(),
      externalId: user.id, // Store Supabase user ID
    });
  }

  return {
    user: userProfile,
    session, // Include session if available
    // Return both access and refresh tokens
    accessToken: session?.access_token,
    refreshToken: session?.refresh_token
  };
};

// Function to sign in with Supabase Auth
export const signInWithSupabase = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Supabase sign in error:', error);
    throw new Error(error.message);
  }

  const { user, session } = data;

  // Get user profile from our database using the external ID
  let userProfile = await findByExternalId(user.id);

  // If user profile doesn't exist in our database, create it
  if (!userProfile) {
    userProfile = await create({
      email: user.email,
      firstName: user.user_metadata?.first_name || '',
      lastName: user.user_metadata?.last_name || '',
      role: 'VOLUNTEER', // Default role for new users
      externalId: user.id, // Store Supabase user ID
    });
  }

  return {
    user: userProfile,
    session,
    // Return both access and refresh tokens for consistency
    accessToken: session?.access_token,
    refreshToken: session?.refresh_token
  };
};

// Function to get user profile by Supabase user ID
export const getUserProfileByExternalId = async (externalId) => {
  return await findByExternalId(externalId);
};