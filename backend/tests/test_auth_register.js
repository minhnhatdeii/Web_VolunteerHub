import request from 'supertest';
import app from '../index.js';
import prisma from '../db.js';
import bcrypt from 'bcrypt';

// Test suite for User Registration (Milestone 2)
describe('User Registration (POST /api/auth/register)', () => {
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
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should successfully register a new user', async () => {
    const userData = {
      email: 'newuser@example.com',
      password: 'securepassword123',
      firstName: 'New',
      lastName: 'User'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'User registered successfully');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user).toHaveProperty('email', userData.email);
    expect(response.body.user).toHaveProperty('firstName', userData.firstName);
    expect(response.body.user).toHaveProperty('lastName', userData.lastName);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    
    // Access and refresh tokens should be strings
    expect(typeof response.body.accessToken).toBe('string');
    expect(typeof response.body.refreshToken).toBe('string');
  });

  test('should return 400 when required fields are missing', async () => {
    // Test with missing email
    let response = await request(app)
      .post('/api/auth/register')
      .send({
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');

    // Test with missing password
    response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');

    // Test with missing firstName
    response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        lastName: 'User'
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');

    // Test with missing lastName
    response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test'
      })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  test('should return 409 when email already exists', async () => {
    // First registration
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'password123',
        firstName: 'Duplicate',
        lastName: 'User'
      })
      .expect(201);

    // Second registration with same email
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'password123',
        firstName: 'Duplicate',
        lastName: 'User2'
      })
      .expect(409);

    expect(response.body).toHaveProperty('error', 'User with this email already exists');
  });
});