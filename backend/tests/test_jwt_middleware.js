import request from 'supertest';
import app from '../index.js';
import prisma from '../db.js';
import bcrypt from 'bcrypt';
import { generateAccessToken } from '../utils/jwt.js';

// Test suite for JWT Middleware Authentication (Milestone 2)
describe('JWT Middleware Authentication', () => {
  let validUser, validToken;

  beforeAll(async () => {
    // Clear database before running tests
    await prisma.like.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.webPushSubscription.deleteMany({});
    await prisma.registration.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.user.deleteMany({});
    
    // Create a test user
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);
    validUser = await prisma.user.create({
      data: {
        email: 'middleware@example.com',
        password: hashedPassword,
        firstName: 'Middleware',
        lastName: 'Test',
        role: 'VOLUNTEER'
      }
    });
    
    // Generate a valid token for the user
    validToken = generateAccessToken({
      userId: validUser.id,
      email: validUser.email,
      role: validUser.role
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should allow access to protected route with valid token', async () => {
    const response = await request(app)
      .get('/api/examples/protected')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'This is a protected route');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('id', validUser.id);
    expect(response.body.user).toHaveProperty('email', validUser.email);
    expect(response.body.user).toHaveProperty('role', validUser.role);
  });

  test('should return 401 when no token is provided', async () => {
    const response = await request(app)
      .get('/api/examples/protected')
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Access token is required');
  });

  test('should return 403 when invalid token is provided', async () => {
    const response = await request(app)
      .get('/api/examples/protected')
      .set('Authorization', 'Bearer invalid.token.here')
      .expect(403);

    expect(response.body).toHaveProperty('error', 'Invalid or expired token');
  });

  test('should return 403 when expired token is provided', async () => {
    // For this test, we'll use a shorter expiration time in a separate token
    const { sign } = await import('jsonwebtoken');
    const expiredToken = sign(
      { userId: validUser.id, email: validUser.email, role: validUser.role },
      process.env.JWT_SECRET || 'fallback_secret_for_tests',
      { expiresIn: '1s' }
    );
    
    // Wait for it to expire
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    const response = await request(app)
      .get('/api/examples/protected')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(403);

    expect(response.body).toHaveProperty('error', 'Invalid or expired token');
  });

  test('should return 401 when token belongs to non-existent user', async () => {
    // Create a token with a fake user ID
    const { sign } = await import('jsonwebtoken');
    const fakeToken = sign(
      { userId: 'fake-user-id', email: 'fake@example.com', role: 'VOLUNTEER' },
      process.env.JWT_SECRET || 'fallback_secret_for_tests'
    );

    const response = await request(app)
      .get('/api/examples/protected')
      .set('Authorization', `Bearer ${fakeToken}`)
      .expect(401);

    expect(response.body).toHaveProperty('error', 'User not found');
  });

  test('should return 401 when token belongs to locked user', async () => {
    // Create a locked user
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);
    const lockedUser = await prisma.user.create({
      data: {
        email: 'lockedmiddleware@example.com',
        password: hashedPassword,
        firstName: 'Locked',
        lastName: 'Middleware',
        isLocked: true
      }
    });
    
    const lockedUserToken = generateAccessToken({
      userId: lockedUser.id,
      email: lockedUser.email,
      role: lockedUser.role
    });

    const response = await request(app)
      .get('/api/examples/protected')
      .set('Authorization', `Bearer ${lockedUserToken}`)
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Account is locked');
  });
});