import testHelper from './testHelper.js';
import { generateRefreshToken } from '../utils/jwt.js';

describe('Refresh Token (POST /api/auth/refresh)', () => {
  let app, request;
  let testUser, refreshToken;

  beforeAll(async () => {
    app = testHelper.getApp();
    request = testHelper.getRequest();
    await testHelper.clearDatabase();
    
    // Create a test user
    testUser = await testHelper.createTestUser();
    
    // Generate a refresh token for the user
    refreshToken = generateRefreshToken({
      userId: testUser.id
    });
  });

  afterAll(async () => {
    await testHelper.closeDatabase();
  });

  test('should successfully refresh access token with valid refresh token', async () => {
    const response = await request
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Token refreshed successfully');
    expect(response.body).toHaveProperty('accessToken');
    expect(typeof response.body.accessToken).toBe('string');
  });

  test('should return 401 when no refresh token is provided', async () => {
    const response = await request
      .post('/api/auth/refresh')
      .send({})
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Refresh token is required');
  });

  test('should return 403 when invalid refresh token is provided', async () => {
    const response = await request
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid.refresh.token' })
      .expect(403);

    expect(response.body).toHaveProperty('error', 'Invalid or expired refresh token');
  });

  test('should return 403 when expired refresh token is provided', async () => {
    // Create an expired refresh token (1 second ago with 1 second expiration)
    const expiredRefreshToken = generateRefreshToken({
      userId: testUser.id
    }, { expiresIn: '1s' });
    
    // Wait for it to expire
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    const response = await request
      .post('/api/auth/refresh')
      .send({ refreshToken: expiredRefreshToken })
      .expect(403);

    expect(response.body).toHaveProperty('error', 'Invalid or expired refresh token');
  });

  test('should return 401 when refresh token belongs to non-existent user', async () => {
    // Create a refresh token with a fake user ID
    const fakeRefreshToken = generateRefreshToken({
      userId: 'fake-user-id'
    });

    const response = await request
      .post('/api/auth/refresh')
      .send({ refreshToken: fakeRefreshToken })
      .expect(401);

    expect(response.body).toHaveProperty('error', 'User not found or account is locked');
  });

  test('should return 401 when refresh token belongs to locked user', async () => {
    // Create a locked user
    const lockedUser = await testHelper.createTestUser({
      email: 'lockedrefresh@example.com',
      isLocked: true
    });
    
    const lockedUserRefreshToken = generateRefreshToken({
      userId: lockedUser.id
    });

    const response = await request
      .post('/api/auth/refresh')
      .send({ refreshToken: lockedUserRefreshToken })
      .expect(401);

    expect(response.body).toHaveProperty('error', 'User not found or account is locked');
  });
});