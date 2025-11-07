# Authentication Testing Guide

This guide shows how to test the JWT authentication system using curl commands.

## 1. Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

Save the response, especially the `accessToken` and `refreshToken`.

## 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

## 3. Access Protected Routes

Use the access token from the login response to access protected routes:

```bash
curl -X GET http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## 4. Refresh Token

When your access token expires, use the refresh token:

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

## 5. Update User Profile

```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "firstName": "Jane",
    "bio": "Updated bio"
  }'
```

## 6. Test Admin-Only Route

To test an admin-only route, you first need to update the user's role to ADMIN in the database, then access the route:

```bash
curl -X GET http://localhost:5000/api/examples/admin \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## 7. Test Manager-Only Route

Similarly for manager role:

```bash
curl -X GET http://localhost:5000/api/examples/manager \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## 8. Lock/Unlock User Account

For this, you need admin or manager privileges:

```bash
curl -X POST http://localhost:5000/api/users/USER_ID_HERE/lock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN_HERE" \
  -d '{
    "isLocked": true
  }'
```

## Note

- Replace `YOUR_ACCESS_TOKEN_HERE` with the actual access token from login
- Replace `YOUR_REFRESH_TOKEN_HERE` with the actual refresh token
- Replace `USER_ID_HERE` with the actual user ID
- Make sure the server is running on `http://localhost:5000`
- The default port is 5000, but this can be changed in the environment variables