import { signUpWithSupabase, signInWithSupabase } from '../helpers/supabase-auth.js';
import { findByExternalId } from '../repositories/user.repo.js';
import { supabase } from '../config/supabase.js';

export async function registerService({ email, password, firstName, lastName, role = 'VOLUNTEER' }) {
  try {
    // Only allow VOLUNTEER and MANAGER roles during registration (prevent users from registering as admin)
    // Normalize role to uppercase for comparison
    const roleToCheck = role ? role.toUpperCase() : 'VOLUNTEER';
    const allowedRole = ['VOLUNTEER', 'MANAGER'].includes(roleToCheck) ? roleToCheck : 'VOLUNTEER';

    const result = await signUpWithSupabase({
      email,
      password,
      firstName,
      lastName,
      role: allowedRole
    });

    // Return the user data and session tokens
    return {
      user: result.user,
      accessToken: result.session?.access_token,
      refreshToken: result.session?.refresh_token
    };
  } catch (error) {
    if (error.message.includes('User with this email already exists')) {
      return { error: 409, message: 'User with this email already exists' };
    }
    return { error: 500, message: error.message };
  }
}

export async function loginService({ email, password }) {
  try {
    const result = await signInWithSupabase({
      email,
      password
    });

    return {
      user: result.user,
      accessToken: result.session?.access_token,
      refreshToken: result.session?.refresh_token
    };
  } catch (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 401, message: 'Invalid email or password' };
    }
    return { error: 500, message: error.message };
  }
}

export async function refreshService(refreshToken) {
  // Use Supabase to refresh the token
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken
  });

  if (error) {
    console.error('Supabase token refresh error:', error);
    return { error: 403, message: 'Invalid or expired refresh token' };
  }

  const { session } = data;
  if (!session) {
    return { error: 403, message: 'Invalid or expired refresh token' };
  }

  // Get user profile from our database
  const userProfile = await findByExternalId(session.user.id);
  if (!userProfile) {
    return { error: 401, message: 'User not found' };
  }

  return {
    accessToken: session.access_token
  };
}

