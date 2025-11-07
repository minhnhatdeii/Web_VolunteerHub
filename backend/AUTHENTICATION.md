# JWT Authentication System

This document explains how to use the JWT authentication system implemented in the VolunteerHub backend.

## Components

The authentication system consists of:

1. **JWT Utilities** (`utils/jwt.js`): Handles JWT creation and verification
2. **Auth Middleware** (`middleware/auth.js`): Contains authentication and authorization functions
3. **Auth Routes** (`routes/auth.js`): Handles registration, login, refresh, and logout
4. **User Routes** (`routes/users.js`): Protected routes for user management

## Environment Variables

Make sure your `.env` file contains these JWT-related variables:

```
JWT_SECRET="your-jwt-secret-key-here"
JWT_EXPIRES_IN="24h"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
REFRESH_TOKEN_EXPIRES_IN="7d"
```

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
    "email": "user@example.com",
    "password": "securepassword",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
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

- Access tokens expire after the duration specified in `JWT_EXPIRES_IN` (default: 24h)
- Refresh tokens expire after the duration specified in `REFRESH_TOKEN_EXPIRES_IN` (default: 7d)
- When an access token expires, use the refresh endpoint to get a new one
- Refresh tokens should be stored securely on the client-side (e.g., in httpOnly cookies or secure local storage)

## Security Considerations

- Always hash passwords using bcrypt
- Store JWT secrets securely and never expose them in client-side code
- Use HTTPS in production to protect tokens in transit
- Validate and sanitize all inputs
- Consider implementing rate limiting for authentication endpoints
- For production, implement refresh token blacklisting for better security