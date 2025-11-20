import { supabase } from '../config/supabase.js';
import { create as createUser, findByEmail as findUserByEmail, findById as findUserById } from '../repositories/user.repo.js';

/**
 * Sign up a new user using Supabase Auth
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @param {string} userData.firstName - User's first name
 * @param {string} userData.lastName - User's last name
 * @param {string} [userData.role='VOLUNTEER'] - User's role (defaults to VOLUNTEER)
 * @returns {Object} - Result with user data and session or error
 */
export async function registerWithSupabase({ email, password, firstName, lastName, role = 'VOLUNTEER' }) {
  try {
    // Check if user already exists in our database
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return { error: 409, message: 'User with this email already exists' };
    }

    // Sign up with Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          role: role.toUpperCase()
        }
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return { error: 400, message: authError.message };
    }

    // Extract user from the response
    const { user } = data;
    if (!user) {
      return { error: 500, message: 'Registration failed, no user data returned' };
    }

    // Create user in our database if it doesn't exist
    // Extract custom user data from user's app_metadata or user_metadata
    const userData = user.user_metadata || user.app_metadata || {};
    
    // Create user record in our database
    const newUser = await createUser({
      email: user.email,
      firstName: userData.firstName || firstName,
      lastName: userData.lastName || lastName,
      role: userData.role || role.toUpperCase()
    }, {
      id: true, 
      email: true, 
      firstName: true, 
      lastName: true, 
      role: true, 
      createdAt: true, 
      updatedAt: true
    });

    // Return success with user data
    return {
      user: newUser,
      session: data.session,
      message: 'User registered successfully'
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 500, message: 'Internal server error during registration' };
  }
}

/**
 * Sign in user using Supabase Auth
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Object} - Result with user data and session or error
 */
export async function loginWithSupabase({ email, password }) {
  try {
    // Sign in with Supabase Auth
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      // Return 401 for authentication errors
      return { error: 401, message: 'Invalid email or password' };
    }

    const { user, session } = data;
    
    if (!user) {
      return { error: 500, message: 'Login failed, no user data returned' };
    }

    // Check if user exists in our database, if not, create it
    let localUser = await findUserByEmail(user.email);
    
    if (!localUser) {
      // Create user in our local database
      const userData = user.user_metadata || user.app_metadata || {};
      localUser = await createUser({
        email: user.email,
        firstName: userData.firstName || userData.first_name || '',
        lastName: userData.lastName || userData.last_name || '',
        role: userData.role || 'VOLUNTEER' // Default role if not specified
      }, {
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true, 
        role: true, 
        createdAt: true, 
        updatedAt: true
      });
    }

    // Check if account is locked in our database (for additional security)
    if (localUser.isLocked) {
      return { error: 401, message: 'Account is locked' };
    }

    // Return success with user data
    return {
      user: localUser,
      session,
      message: 'Login successful'
    };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 500, message: 'Internal server error during login' };
  }
}

/**
 * Get user session from Supabase
 * @param {string} accessToken - Access token from request
 * @returns {Object} - User session data or null if invalid
 */
export async function getUserSession(accessToken) {
  try {
    // Use Supabase's built-in method to get user from access token
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error) {
      console.error('Error getting user from Supabase:', error);
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Error verifying Supabase token:', error);
    return null;
  }
}

/**
 * Refresh Supabase session
 * @param {string} refreshToken - Refresh token to use
 * @returns {Object} - New session data or error
 */
export async function refreshSupabaseSession(refreshToken) {
  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      console.error('Error refreshing session:', error);
      return { error: 403, message: 'Invalid or expired refresh token' };
    }

    const { user, session } = data;
    if (!user || !session) {
      return { error: 403, message: 'Session refresh failed' };
    }

    // Check if user exists in our local database
    const localUser = await findUserByEmail(user.email);
    if (!localUser || localUser.isLocked) {
      return { error: 401, message: 'User not found or account is locked' };
    }

    return {
      user: localUser,
      session,
      message: 'Token refreshed successfully'
    };
  } catch (error) {
    console.error('Session refresh error:', error);
    return { error: 500, message: 'Internal server error during token refresh' };
  }
}

/**
 * Sign out user from Supabase
 * @param {string} accessToken - Access token to sign out
 * @returns {Object} - Result of sign out operation
 */
export async function signOutUser(accessToken) {
  try {
    const { error } = await supabase.auth.signOut({
      session: { access_token: accessToken } // This is optional, will sign out current session by default
    });

    if (error) {
      console.error('Error signing out:', error);
      return { error: 500, message: 'Error during sign out' };
    }

    return { message: 'Sign out successful' };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: 500, message: 'Internal server error during sign out' };
  }
}

/**
 * Update user password
 * @param {string} accessToken - Current access token
 * @param {string} newPassword - New password to set
 * @returns {Object} - Result of password update
 */
export async function updatePassword(accessToken, newPassword) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('Error updating password:', error);
      return { error: 500, message: error.message };
    }

    return {
      user: data.user,
      message: 'Password updated successfully'
    };
  } catch (error) {
    console.error('Update password error:', error);
    return { error: 500, message: 'Internal server error during password update' };
  }
}