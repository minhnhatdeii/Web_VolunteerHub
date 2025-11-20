# Supabase Authentication System

This document explains how to use the Supabase authentication system implemented in the VolunteerHub backend.

## Components

The authentication system consists of:

1. **Supabase Client Configuration** (`config/supabase.js`): Handles Supabase client initialization
2. **Supabase Auth Helper** (`helpers/supabase-auth.js`): Handles Supabase authentication logic
3. **Auth Middleware** (`middleware/auth.js`): Contains authentication and authorization functions
4. **Auth Routes** (`routes/auth.js`): Handles registration, login, refresh, and logout
5. **User Routes** (`routes/users.js`): Protected routes for user management

## Environment Variables

Make sure your `.env` file contains these Supabase-related variables:

```
SUPABASE_URL="your-supabase-project-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

## Important: Supabase Email Validation Configuration

By default, Supabase may have email validation rules that restrict which email addresses can be registered. If you encounter an "Email address is invalid" error:

1. **Check your Supabase dashboard**: Go to Authentication > Settings in your Supabase project
2. **Adjust email settings**: You may need to update the allowed email domains or validation rules
3. **For testing**: Use real email addresses or temporary email services that pass validation

## Available Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (client-side token removal)

### User Endpoints

- `GET /api/users/me` - Get current user profile (requires auth)
- `PUT /api/users/me` - Update current user profile (requires auth)
- `GET /api/users/:id` - Get user by ID (requires ADMIN/MANAGER role)
- `PUT /api/users/:id` - Update user by ID (requires ADMIN/MANAGER role)
- `POST /api/users/:id/lock` - Lock/unlock user account (requires ADMIN/MANAGER role)

## Usage Examples

### Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-real-email@example.com",
    "password": "securepassword123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-real-email@example.com",
    "password": "securepassword123!"
  }'
```

### Access Protected Route

```bash
curl -X GET http://localhost:5000/api/examples/protected \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## Middleware Functions

### authenticateToken

Use this middleware to require authentication for a route:

```javascript
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});
```

### authorizeRole

Use this middleware to restrict access to specific roles:

```javascript
router.get('/admin', authenticateToken, authorizeRole(['ADMIN']), (req, res) => {
  res.json({ message: 'Admin-only route' });
});
```

### requireRole

Use this middleware to require a specific role:

```javascript
router.get('/specific-role', authenticateToken, requireRole('MANAGER'), (req, res) => {
  res.json({ message: 'Manager-only route' });
});
```

### requireOwnResource

Use this middleware to ensure users can only access their own resources:

```javascript
router.put('/me', authenticateToken, requireOwnResource(), (req, res) => {
  // This ensures req.user.id matches req.params.id
});
```

## Token Management

- Access tokens are managed by Supabase and automatically expire
- Use the refresh endpoint to get a new token when the current one expires
- Tokens should be stored securely on the client-side (e.g., in httpOnly cookies or secure local storage)

## Security Considerations

- Supabase handles password hashing and storage automatically
- Use HTTPS in production to protect tokens in transit
- Validate and sanitize all inputs
- Consider implementing rate limiting for authentication endpoints
- Use Supabase's built-in security features and policies