import request from 'supertest';
import app from '../index.js';
import prisma from '../db.js';
import { generateAccessToken } from '../utils/jwt.js';
import testHelper from '../tests/testHelper.js';

let adminToken;
let volunteerToken;
let managerToken;
let adminUser;
let event;

// Clean up after tests
afterEach(async () => {
  // Clean up any test data created
  await prisma.notification.deleteMany({
    where: {
      OR: [
        { title: { contains: 'Event Approved' } },
        { title: { contains: 'Event Rejected' } }
      ]
    }
  });

  await prisma.event.deleteMany({
    where: {
      title: { in: ['Test Event for Admin Approval', 'Approved Test Event', 'Rejected Test Event'] }
    }
  });

  await prisma.user.deleteMany({
    where: {
      email: { in: ['admin_test@example.com', 'volunteer_test@example.com', 'manager_test@example.com'] }
    }
  });
});

beforeEach(async () => {
  // Create test users
  adminUser = await testHelper.createTestUser({
    email: 'admin_test@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    externalId: 'test_supabase_admin_id_' + Date.now()
  });

  const volunteerUser = await testHelper.createTestUser({
    email: 'volunteer_test@example.com',
    firstName: 'Volunteer',
    lastName: 'User',
    role: 'VOLUNTEER',
    externalId: 'test_supabase_volunteer_id_' + Date.now()
  });

  const managerUser = await testHelper.createTestUser({
    email: 'manager_test@example.com',
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

  volunteerToken = generateAccessToken({
    userId: volunteerUser.id,
    externalId: volunteerUser.externalId,
    email: volunteerUser.email,
    role: volunteerUser.role
  });

  managerToken = generateAccessToken({
    userId: managerUser.id,
    externalId: managerUser.externalId,
    email: managerUser.email,
    role: managerUser.role
  });

  // Create a test event in PENDING_APPROVAL status
  event = await prisma.event.create({
    data: {
      title: 'Test Event for Admin Approval',
      description: 'This is a test event that needs admin approval',
      startDate: new Date(Date.now() + 86400000), // Tomorrow
      endDate: new Date(Date.now() + 2 * 86400000), // In 2 days
      location: 'Test Location',
      category: 'Test Category',
      maxParticipants: 50,
      creatorId: managerUser.id,
      status: 'PENDING_APPROVAL' // This is the key status we're testing
    }
  });
});

describe('Admin Event Approval System - GET /api/admin/events', () => {
  test('should return 401 if no token is provided', async () => {
    const response = await request(app)
      .get('/api/admin/events')
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Access token is required');
  });

  test('should return 403 if user is not an admin', async () => {
    const response = await request(app)
      .get('/api/admin/events')
      .set('Authorization', `Bearer ${volunteerToken}`)
      .expect(403);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Insufficient permissions');
  });

  test('should return pending events for admin', async () => {
    const response = await request(app)
      .get('/api/admin/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.pagination).toHaveProperty('total');
  });

  test('should return events with specific status when status filter is applied', async () => {
    const response = await request(app)
      .get('/api/admin/events?status=PENDING_APPROVAL')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');
    expect(Array.isArray(response.body.data)).toBe(true);
    if (response.body.data.length > 0) {
      expect(response.body.data[0]).toHaveProperty('status', 'PENDING_APPROVAL');
    }
  });

  test('should return paginated results', async () => {
    // Create additional events to test pagination
    const eventsToCreate = [];
    for (let i = 0; i < 5; i++) {
      eventsToCreate.push(
        prisma.event.create({
          data: {
            title: `Test Event ${i} for Admin Approval`,
            description: 'This is a test event that needs admin approval',
            startDate: new Date(Date.now() + 86400000),
            endDate: new Date(Date.now() + 2 * 86400000),
            location: 'Test Location',
            category: 'Test Category',
            maxParticipants: 50,
            creatorId: adminUser.id,
            status: 'PENDING_APPROVAL'
          }
        })
      );
    }
    await Promise.all(eventsToCreate);

    const response = await request(app)
      .get('/api/admin/events?page=1&limit=3')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');
    expect(response.body.data).toHaveLength(3);
    expect(response.body.pagination).toHaveProperty('page', 1);
    expect(response.body.pagination).toHaveProperty('limit', 3);
    expect(response.body.pagination).toHaveProperty('pages');
  });
});

describe('Admin Event Approval System - POST /api/admin/events/:id/approve', () => {
  test('should return 401 if no token is provided', async () => {
    const response = await request(app)
      .post(`/api/admin/events/${event.id}/approve`)
      .send({})
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Access token is required');
  });

  test('should return 403 if user is not an admin', async () => {
    const response = await request(app)
      .post(`/api/admin/events/${event.id}/approve`)
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send({})
      .expect(403);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Insufficient permissions');
  });

  test('should approve event successfully', async () => {
    const response = await request(app)
      .post(`/api/admin/events/${event.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Event approved successfully');
    expect(response.body).toHaveProperty('event');
    expect(response.body.event).toHaveProperty('id', event.id);
    expect(response.body.event).toHaveProperty('status', 'APPROVED');
  });

  test('should approve event with reason', async () => {
    const reason = 'This event looks good and beneficial to the community.';
    const response = await request(app)
      .post(`/api/admin/events/${event.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason })
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Event approved successfully');
    expect(response.body).toHaveProperty('event');
    expect(response.body.event).toHaveProperty('id', event.id);
    expect(response.body.event).toHaveProperty('status', 'APPROVED');
  });

  test('should create notification when event is approved', async () => {
    // Get manager user (event creator) to verify notification
    const managerUser = await prisma.user.findFirst({
      where: { email: 'manager_test@example.com' }
    });

    const response = await request(app)
      .post(`/api/admin/events/${event.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Approved for community benefit' })
      .expect(200);

    // Check if notification was created
    const notifications = await prisma.notification.findMany({
      where: {
        userId: managerUser.id,
        title: 'Event Approved'
      }
    });

    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0]).toHaveProperty('message');
    expect(notifications[0].message).toContain('has been approved');
  });

  test('should return 404 if event does not exist', async () => {
    const fakeId = 'nonexistentid12345';
    const response = await request(app)
      .post(`/api/admin/events/${fakeId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(404);

    expect(response.body).toHaveProperty('error', 'Event not found');
  });

  test('should return 400 if event is not in PENDING_APPROVAL status', async () => {
    // Create an event with different status
    const approvedEvent = await prisma.event.create({
      data: {
        title: 'Approved Test Event',
        description: 'This event is already approved',
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 2 * 86400000),
        location: 'Test Location',
        category: 'Test Category',
        maxParticipants: 50,
        creatorId: adminUser.id,
        status: 'APPROVED'
      }
    });

    const response = await request(app)
      .post(`/api/admin/events/${approvedEvent.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Only pending approval events can be approved');
  });
});

describe('Admin Event Approval System - POST /api/admin/events/:id/reject', () => {
  test('should return 401 if no token is provided', async () => {
    const response = await request(app)
      .post(`/api/admin/events/${event.id}/reject`)
      .send({ reason: 'Inappropriate content' })
      .expect(401);

    expect(response.body).toHaveProperty('error', 'Access token is required');
  });

  test('should return 403 if user is not an admin', async () => {
    const response = await request(app)
      .post(`/api/admin/events/${event.id}/reject`)
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send({ reason: 'Inappropriate content' })
      .expect(403);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('Insufficient permissions');
  });

  test('should reject event successfully with reason', async () => {
    const reason = 'This event contains inappropriate content.';
    const response = await request(app)
      .post(`/api/admin/events/${event.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason })
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Event rejected successfully');
    expect(response.body).toHaveProperty('event');
    expect(response.body.event).toHaveProperty('id', event.id);
    expect(response.body.event).toHaveProperty('status', 'REJECTED');
  });

  test('should return 400 if reason is not provided', async () => {
    const response = await request(app)
      .post(`/api/admin/events/${event.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Rejection reason is required');
  });

  test('should create notification when event is rejected', async () => {
    // Get manager user (event creator) to verify notification
    const managerUser = await prisma.user.findFirst({
      where: { email: 'manager_test@example.com' }
    });

    const reason = 'Event does not meet our guidelines';
    const response = await request(app)
      .post(`/api/admin/events/${event.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason })
      .expect(200);

    // Check if notification was created
    const notifications = await prisma.notification.findMany({
      where: {
        userId: managerUser.id,
        title: 'Event Rejected'
      }
    });

    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0]).toHaveProperty('message');
    expect(notifications[0].message).toContain('has been rejected');
    expect(notifications[0].message).toContain(reason);
  });

  test('should return 404 if event does not exist', async () => {
    const fakeId = 'nonexistentid12345';
    const response = await request(app)
      .post(`/api/admin/events/${fakeId}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Inappropriate content' })
      .expect(404);

    expect(response.body).toHaveProperty('error', 'Event not found');
  });

  test('should return 400 if event is not in PENDING_APPROVAL status', async () => {
    // Create an event with different status
    const rejectedEvent = await prisma.event.create({
      data: {
        title: 'Rejected Test Event',
        description: 'This event is already rejected',
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 2 * 86400000),
        location: 'Test Location',
        category: 'Test Category',
        maxParticipants: 50,
        creatorId: adminUser.id,
        status: 'REJECTED'
      }
    });

    const response = await request(app)
      .post(`/api/admin/events/${rejectedEvent.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Inappropriate content' })
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Only pending approval events can be rejected');
  });
});