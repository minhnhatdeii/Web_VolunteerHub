import request from 'supertest';
import app from '../index.js';
import prisma from '../db.js';
import bcrypt from 'bcrypt';
import { generateAccessToken } from '../utils/jwt.js';

describe('Role-Based Registration and Access Control Tests', () => {
  let volunteerToken, managerToken, adminToken;
  let testEventId;

  beforeAll(async () => {
    // Clear any existing test data
    await prisma.registration.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['volunteer@test.com', 'manager@test.com', 'admin@test.com']
        }
      }
    });

    // Create test users with different roles
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const volunteerUser = await prisma.user.create({
      data: {
        email: 'volunteer@test.com',
        password: hashedPassword,
        firstName: 'Volunteer',
        lastName: 'User',
        role: 'VOLUNTEER'
      }
    });
    
    const managerUser = await prisma.user.create({
      data: {
        email: 'manager@test.com',
        password: hashedPassword,
        firstName: 'Manager',
        lastName: 'User',
        role: 'MANAGER'
      }
    });
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      }
    });
    
    // Generate tokens for each user
    volunteerToken = generateAccessToken({ 
      userId: volunteerUser.id, 
      email: volunteerUser.email, 
      role: volunteerUser.role 
    });
    
    managerToken = generateAccessToken({ 
      userId: managerUser.id, 
      email: managerUser.email, 
      role: managerUser.role 
    });
    
    adminToken = generateAccessToken({ 
      userId: adminUser.id, 
      email: adminUser.email, 
      role: adminUser.role 
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.registration.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['volunteer@test.com', 'manager@test.com', 'admin@test.com', 'test_volunteer@example.com', 'test_manager@example.com', 'test_invalid@example.com']
        }
      }
    });
    await prisma.$disconnect();
  });

  test('Manager can create event', async () => {
    const response = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        title: 'Test Event',
        description: 'Test event description',
        startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endDate: new Date(Date.now() + 2 * 86400000).toISOString(), // Day after tomorrow
        location: 'Test Location',
        category: 'Community',
        maxParticipants: 50
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    testEventId = response.body.id;
  });

  test('Volunteer cannot create event', async () => {
    const response = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send({
        title: 'Unauthorized Event',
        description: 'This should fail',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        location: 'Test Location',
        category: 'Community',
        maxParticipants: 30
      });
    
    expect(response.status).toBe(403); // Forbidden
    expect(response.body).toHaveProperty('error');
  });

  test('Manager can update their own event', async () => {
    const response = await request(app)
      .put(`/api/events/${testEventId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        title: 'Updated Test Event'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Test Event');
  });

  test('Volunteer cannot update event they did not create', async () => {
    const response = await request(app)
      .put(`/api/events/${testEventId}`)
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send({
        title: 'Hacked Event Title'
      });
    
    expect(response.status).toBe(403); // Forbidden
    expect(response.body).toHaveProperty('error');
  });

  test('Volunteer can register for an event', async () => {
    const response = await request(app)
      .post(`/api/events/${testEventId}/register`)
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send({});
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message');
  });

  test('Manager can approve a registration', async () => {
    // First, get the registration ID
    const registrationsResponse = await request(app)
      .get('/api/users/me/registrations')
      .set('Authorization', `Bearer ${volunteerToken}`);
    
    const registration = registrationsResponse.body.find(r => r.eventId === testEventId);
    
    if (registration) {
      const response = await request(app)
        .post(`/api/events/${testEventId}/registrations/${registration.id}/approve`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({});
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    }
  });

  test('User can register with volunteer role', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test_volunteer@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Volunteer',
        role: 'VOLUNTEER'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.role).toBe('VOLUNTEER');
  });

  test('User can register with manager role', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test_manager@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Manager',
        role: 'MANAGER'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.role).toBe('MANAGER');
  });

  test('Registration fails with invalid role', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test_invalid@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Invalid',
        role: 'HACKER'
      });
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});