import request from 'supertest';
import app from '../index.js';
import prisma from '../db.js';
import { generateAccessToken } from '../utils/jwt.js';
import testHelper from '../tests/testHelper.js';

let adminToken;
let managerToken;
let adminUser;
let managerUser;

// Clean up after tests
afterEach(async () => {
  // Clean up any test data created
  await prisma.event.deleteMany({
    where: {
      OR: [
        { title: { contains: 'Manager Test Event' } },
        { title: { contains: 'Admin Test Event' } }
      ]
    }
  });

  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { contains: 'admin_all_events_test@example.com' } },
        { email: { contains: 'manager_all_events_test@example.com' } }
      ]
    }
  });
});

beforeEach(async () => {
  // Create test users
  adminUser = await testHelper.createTestUser({
    email: 'admin_all_events_test@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    externalId: 'test_supabase_admin_id_' + Date.now()
  });

  managerUser = await testHelper.createTestUser({
    email: 'manager_all_events_test@example.com',
    firstName: 'Manager',
    lastName: 'User',
    role: 'MANAGER',
    externalId: 'test_supabase_manager_id_' + Date.now()
  });

  // Generate tokens
  adminToken = generateAccessToken({
    userId: adminUser.id,
    externalId: adminUser.externalId,
    email: adminUser.email,
    role: adminUser.role
  });

  managerToken = generateAccessToken({
    userId: managerUser.id,
    externalId: managerUser.externalId,
    email: managerUser.email,
    role: managerUser.role
  });

  // Create various events with different statuses from the manager
  await prisma.event.create({
    data: {
      title: 'Manager Draft Event',
      description: 'This is a draft event',
      startDate: new Date(Date.now() + 86400000), // Tomorrow
      endDate: new Date(Date.now() + 2 * 86400000), // In 2 days
      location: 'Test Location',
      category: 'Test Category',
      maxParticipants: 50,
      creatorId: managerUser.id,
      status: 'DRAFT'
    }
  });

  await prisma.event.create({
    data: {
      title: 'Manager Pending Approval Event',
      description: 'This is a pending approval event',
      startDate: new Date(Date.now() + 86400000), // Tomorrow
      endDate: new Date(Date.now() + 2 * 86400000), // In 2 days
      location: 'Test Location',
      category: 'Test Category',
      maxParticipants: 50,
      creatorId: managerUser.id,
      status: 'PENDING_APPROVAL'
    }
  });

  await prisma.event.create({
    data: {
      title: 'Manager Approved Event',
      description: 'This is an approved event',
      startDate: new Date(Date.now() + 86400000), // Tomorrow
      endDate: new Date(Date.now() + 2 * 86400000), // In 2 days
      location: 'Test Location',
      category: 'Test Category',
      maxParticipants: 50,
      creatorId: managerUser.id,
      status: 'APPROVED'
    }
  });

  await prisma.event.create({
    data: {
      title: 'Manager Rejected Event',
      description: 'This is a rejected event',
      startDate: new Date(Date.now() + 86400000), // Tomorrow
      endDate: new Date(Date.now() + 2 * 86400000), // In 2 days
      location: 'Test Location',
      category: 'Test Category',
      maxParticipants: 50,
      creatorId: managerUser.id,
      status: 'REJECTED'
    }
  });
});

describe('Admin Can See All Events Test', () => {
  test('admin can see all events (not just pending approval)', async () => {
    // First, get all events to establish baseline
    const response = await request(app)
      .get('/api/admin/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');
    expect(Array.isArray(response.body.data)).toBe(true);

    // Verify that the response contains events with different statuses
    const statuses = response.body.data.map(event => event.status);
    expect(statuses).toContain('DRAFT');
    expect(statuses).toContain('PENDING_APPROVAL');
    expect(statuses).toContain('APPROVED');
    expect(statuses).toContain('REJECTED');

    // Verify that events include creator information
    for (const event of response.body.data) {
      expect(event).toHaveProperty('creator');
      expect(event.creator).toHaveProperty('id');
      expect(event.creator).toHaveProperty('firstName');
      expect(event.creator).toHaveProperty('lastName');
      expect(event.creator).toHaveProperty('email');
      // All events should be created by the manager we created
      // Note: There might be additional events from other tests, so we only verify the ones we created have correct creator
      if (event.title.includes('Manager')) {
        expect(event.creator.id).toBe(managerUser.id);
      }
    }
  });

  test('admin can still filter by specific status', async () => {
    const response = await request(app)
      .get('/api/admin/events?status=DRAFT')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    // Should contain at least our draft event (there might be more from other tests)
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    // All returned events should have DRAFT status
    for (const event of response.body.data) {
      expect(event.status).toBe('DRAFT');
    }
  });

  test('admin can filter by PENDING_APPROVAL status specifically', async () => {
    const response = await request(app)
      .get('/api/admin/events?status=PENDING_APPROVAL')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0]).toHaveProperty('status', 'PENDING_APPROVAL');
  });

  test('should return 401 if no token is provided', async () => {
    const response = await request(app)
      .get('/api/admin/events')
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Access token is required');
  });

  test('should return 403 if user is not an admin', async () => {
    const response = await request(app)
      .get('/api/admin/events')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(403);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Insufficient permissions');
  });
});