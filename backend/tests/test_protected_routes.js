import testHelper from './testHelper.js';
import { generateAccessToken } from '../utils/jwt.js';

describe('Protected Route Access', () => {
  let app, request;
  let testUser, validToken, invalidToken;

  beforeAll(async () => {
    app = testHelper.getApp();
    request = testHelper.getRequest();
    await testHelper.clearDatabase();
    
    // Create a test user
    testUser = await testHelper.createTestUser();
    
    // Generate a valid token for the user
    validToken = generateAccessToken({
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role
    });
    
    // Create an invalid token format
    invalidToken = 'invalid.token.format';
  });

  afterAll(async () => {
    await testHelper.closeDatabase();
  });

  test('should access user profile with valid token', async () => {
    const response = await request
      .get('/api/users/me')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', testUser.id);
    expect(response.body).toHaveProperty('email', testUser.email);
    expect(response.body).toHaveProperty('firstName', testUser.firstName);
    expect(response.body).toHaveProperty('role', testUser.role);
  });

  test('should return 401 when accessing protected route without token', async () => {
    const response = await request
      .get('/api/users/me')
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Access token is required');
  });

  test('should return 403 when accessing protected route with invalid token', async () => {
    const response = await request
      .get('/api/users/me')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(403);

    expect(response.body).toHaveProperty('error', 'Invalid or expired token');
  });

  test('should update user profile with valid token', async () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      bio: 'Updated bio'
    };

    const response = await request
      .put('/api/users/me')
      .set('Authorization', `Bearer ${validToken}`)
      .send(updateData)
      .expect(200);

    expect(response.body).toHaveProperty('firstName', 'Updated');
    expect(response.body).toHaveProperty('lastName', 'Name');
    expect(response.body).toHaveProperty('bio', 'Updated bio');
  });

  test('should return 401 when updating profile without token', async () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name'
    };

    const response = await request
      .put('/api/users/me')
      .send(updateData)
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Access token is required');
  });

  test('should not access other users profile without proper authorization', async () => {
    // First create another user
    const otherUser = await testHelper.createTestUser({
      email: 'other@example.com'
    });

    // Try to access other user's profile with current user's token
    // This should fail with a 403 or 404 depending on implementation
    const response = await request
      .get(`/api/users/${otherUser.id}`)
      .set('Authorization', `Bearer ${validToken}`)
      .expect(401); // Should be 401 because user is not admin/manager

    // The exact response depends on the implementation in the route
    // The route requires ADMIN/MANAGER role which the test user doesn't have
  });

  test('should access public route without token', async () => {
    const response = await request
      .get('/api/examples/public')
      .expect(200);

    expect(response.body).toHaveProperty('message', 'This is a public route accessible to everyone');
  });

  test('should verify token user context is passed correctly', async () => {
    // Make a request to a protected route and verify req.user contains correct information
    const response = await request
      .get('/api/examples/protected')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('id', testUser.id);
    expect(response.body.user).toHaveProperty('email', testUser.email);
    expect(response.body.user).toHaveProperty('role', testUser.role);
  });
});