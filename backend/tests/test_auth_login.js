import request from 'supertest';
import app from '../index.js';
import prisma from '../db.js';
import bcrypt from 'bcrypt';

// Test suite for User Login (Milestone 2)
describe('User Login (POST /api/auth/login)', () => {
  let testUser;

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
    
    // Create a test user for login tests
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);
    testUser = await prisma.user.create({
      data: {
        email: 'testlogin@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Login'
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should successfully login with valid credentials', async () => {
    const loginData = {
      email: testUser.email,
      password: 'password123' // Use the original password, not hashed
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('id', testUser.id);
    expect(response.body.user).toHaveProperty('email', testUser.email);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    
    // Tokens should be strings
    expect(typeof response.body.accessToken).toBe('string');
    expect(typeof response.body.refreshToken).toBe('string');
  });

  test('should return 400 when email or password is missing', async () => {
    // Test with missing email
    let response = await request(app)
      .post('/api/auth/login')
      .send({
        password: 'password123'
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');

    // Test with missing password
    response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  test('should return 401 with invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123'
      })
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Invalid email or password');
  });

  test('should return 401 with invalid password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      })
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Invalid email or password');
  });

  test('should return 401 for locked account', async () => {
    // Create a locked user
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);
    const lockedUser = await prisma.user.create({
      data: {
        email: 'lockedlogin@example.com',
        password: hashedPassword,
        firstName: 'Locked',
        lastName: 'User',
        isLocked: true
      }
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: lockedUser.email,
        password: 'password123'
      })
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Account is locked');
  });
});