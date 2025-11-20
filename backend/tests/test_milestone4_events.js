import request from 'supertest';
import app from '../index.js';
import prisma from '../db.js';
import { generateAccessToken } from '../utils/jwt.js';
import testHelper from '../tests/testHelper.js';

let managerUser, adminUser, volunteerUser;
let managerToken, adminToken, volunteerToken;
let testEvent;

// Clean up after tests
afterEach(async () => {
  // Clean up test events
  if (testEvent) {
    await prisma.event.deleteMany({
      where: {
        title: { contains: 'Test Event for Milestone 4' }
      }
    });
  }
  
  // Clean up test users
  await prisma.user.deleteMany({
    where: {
      email: { in: ['manager_ms4@test.com', 'admin_ms4@test.com', 'volunteer_ms4@test.com'] }
    }
  });
});

beforeEach(async () => {
  // Create test users
  managerUser = await testHelper.createTestUser({
    email: 'manager_ms4@test.com',
    firstName: 'Manager',
    lastName: 'Milestone4',
    role: 'MANAGER',
    externalId: 'test_supabase_manager_ms4_' + Date.now()
  });

  adminUser = await testHelper.createTestUser({
    email: 'admin_ms4@test.com',
    firstName: 'Admin',
    lastName: 'Milestone4',
    role: 'ADMIN',
    externalId: 'test_supabase_admin_ms4_' + Date.now()
  });

  volunteerUser = await testHelper.createTestUser({
    email: 'volunteer_ms4@test.com',
    firstName: 'Volunteer',
    lastName: 'Milestone4',
    role: 'VOLUNTEER',
    externalId: 'test_supabase_volunteer_ms4_' + Date.now()
  });

  // Generate tokens
  managerToken = generateAccessToken({
    userId: managerUser.id,
    externalId: managerUser.externalId,
    email: managerUser.email,
    role: managerUser.role
  });

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
});

describe('Milestone 4 - Event Management Tests', () => {
  
  describe('GET /api/events - List events with filters', () => {
    test('should return all events (public endpoint)', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should return events with category filter', async () => {
      // Create a test event first
      const testEvent = await prisma.event.create({
        data: {
          title: 'Test Event with Category',
          description: 'This is a test event',
          startDate: new Date(Date.now() + 86400000), // Tomorrow
          endDate: new Date(Date.now() + 2 * 86400000), // In 2 days
          location: 'Test Location',
          category: 'Education',
          maxParticipants: 50,
          creatorId: managerUser.id,
          status: 'APPROVED'
        }
      });

      const response = await request(app)
        .get('/api/events?category=Education')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('category', 'Education');
      }
    });

    test('should return events with location filter', async () => {
      const response = await request(app)
        .get('/api/events?location=Test')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should return events with search query', async () => {
      const response = await request(app)
        .get('/api/events?q=test')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should return events with status filter', async () => {
      const response = await request(app)
        .get('/api/events?status=APPROVED')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/events/:id - Event details', () => {
    test('should return event details by ID', async () => {
      // Create a test event
      const event = await prisma.event.create({
        data: {
          title: 'Test Event Details',
          description: 'This is a test event for details',
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 2 * 86400000),
          location: 'Test Location',
          category: 'Education',
          maxParticipants: 50,
          creatorId: managerUser.id,
          status: 'APPROVED'
        }
      });

      const response = await request(app)
        .get(`/api/events/${event.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', event.id);
      expect(response.body).toHaveProperty('title', 'Test Event Details');
      expect(response.body).toHaveProperty('creator');
    });

    test('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .get('/api/events/nonexistentid12345')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Event not found');
    });
  });

  describe('POST /api/events - Create event (Manager only)', () => {
    test('should create event successfully when authenticated as manager', async () => {
      const eventData = {
        title: 'Test Event for Creation',
        description: 'This is a test event created by manager',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        location: 'Test Location',
        category: 'Technology',
        maxParticipants: 30
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(eventData)
        .expect(201);

      expect(response.body).toHaveProperty('title', 'Test Event for Creation');
      expect(response.body).toHaveProperty('status', 'PENDING_APPROVAL');
      expect(response.body).toHaveProperty('creatorId', managerUser.id);
      testEvent = response.body;
    });

    test('should return 403 when volunteer tries to create event', async () => {
      const eventData = {
        title: 'Unauthorized Event Creation',
        description: 'This should fail',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        location: 'Test Location',
        category: 'Technology',
        maxParticipants: 30
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${volunteerToken}`)
        .send(eventData)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    test('should return 401 when no token is provided', async () => {
      const eventData = {
        title: 'Unauthorized Event Creation',
        description: 'This should fail',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        location: 'Test Location',
        category: 'Technology',
        maxParticipants: 30
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token is required');
    });

    test('should return 400 with validation errors for invalid data', async () => {
      const invalidEventData = {
        title: 'A', // Too short
        description: 'A'.repeat(1001), // Too long
        startDate: 'invalid-date',
        endDate: 'invalid-date',
        location: 'A', // Too short
        category: '',
        maxParticipants: 0 // Less than 1
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(invalidEventData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Validation failed');
    });
  });

  describe('PUT /api/events/:id - Update event (Owner only)', () => {
    let testEventForUpdate;

    beforeEach(async () => {
      testEventForUpdate = await prisma.event.create({
        data: {
          title: 'Test Event for Update',
          description: 'Original description',
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 2 * 86400000),
          location: 'Original Location',
          category: 'Original Category',
          maxParticipants: 20,
          creatorId: managerUser.id,
          status: 'PENDING_APPROVAL'
        }
      });
    });

    test('should update event successfully when authenticated as owner', async () => {
      const updateData = {
        title: 'Updated Test Event',
        description: 'Updated description',
        maxParticipants: 40
      };

      const response = await request(app)
        .put(`/api/events/${testEventForUpdate.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id', testEventForUpdate.id);
      expect(response.body).toHaveProperty('title', 'Updated Test Event');
      expect(response.body).toHaveProperty('description', 'Updated description');
      expect(response.body).toHaveProperty('maxParticipants', 40);
    });

    test('should return 403 when non-owner tries to update event', async () => {
      // Create another manager user
      const otherManager = await testHelper.createTestUser({
        email: 'other_manager_update@test.com',
        firstName: 'Other',
        lastName: 'Manager',
        role: 'MANAGER',
        externalId: 'test_supabase_other_update_' + Date.now()
      });

      const otherManagerToken = generateAccessToken({
        userId: otherManager.id,
        externalId: otherManager.externalId,
        email: otherManager.email,
        role: otherManager.role
      });

      const updateData = {
        title: 'Attempted Update by Other Manager'
      };

      const response = await request(app)
        .put(`/api/events/${testEventForUpdate.id}`)
        .set('Authorization', `Bearer ${otherManagerToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Only the event owner can update');
    });

    test('should return 404 for non-existent event', async () => {
      const updateData = {
        title: 'Non-existent Event Update'
      };

      const response = await request(app)
        .put('/api/events/nonexistentid12345')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Event not found');
    });
  });

  describe('DELETE /api/events/:id - Delete event (Owner or Admin)', () => {
    let testEventForDelete;

    beforeEach(async () => {
      testEventForDelete = await prisma.event.create({
        data: {
          title: 'Test Event for Delete',
          description: 'Event to be deleted',
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 2 * 86400000),
          location: 'Test Location',
          category: 'Technology',
          maxParticipants: 25,
          creatorId: managerUser.id,
          status: 'DRAFT'
        }
      });
    });

    test('should delete event successfully when authenticated as owner', async () => {
      const response = await request(app)
        .delete(`/api/events/${testEventForDelete.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Event deleted successfully');

      // Verify event is actually deleted
      const getResponse = await request(app)
        .get(`/api/events/${testEventForDelete.id}`)
        .expect(404);

      expect(getResponse.body).toHaveProperty('error', 'Event not found');
    });

    test('should delete event successfully when authenticated as admin', async () => {
      // Create another event by a different manager
      const eventByOtherManager = await prisma.event.create({
        data: {
          title: 'Event by Other Manager',
          description: 'Event to be deleted by admin',
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 2 * 86400000),
          location: 'Test Location',
          category: 'Technology',
          maxParticipants: 25,
          creatorId: managerUser.id,
          status: 'PENDING_APPROVAL'
        }
      });

      const response = await request(app)
        .delete(`/api/events/${eventByOtherManager.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Event deleted successfully');
    });

    test('should return 403 when volunteer tries to delete event', async () => {
      const response = await request(app)
        .delete(`/api/events/${testEventForDelete.id}`)
        .set('Authorization', `Bearer ${volunteerToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Insufficient permissions');
    });

    test('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .delete('/api/events/nonexistentid12345')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Event not found');
    });
  });

  describe('POST /api/events/:id/submit - Submit for approval', () => {
    let draftEvent;

    beforeEach(async () => {
      draftEvent = await prisma.event.create({
        data: {
          title: 'Draft Event for Submission',
          description: 'Event to be submitted for approval',
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 2 * 86400000),
          location: 'Test Location',
          category: 'Technology',
          maxParticipants: 25,
          creatorId: managerUser.id,
          status: 'DRAFT'
        }
      });
    });

    test('should submit draft event for approval successfully', async () => {
      const response = await request(app)
        .post(`/api/events/${draftEvent.id}/submit`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Event submitted for approval');
      expect(response.body.event).toHaveProperty('id', draftEvent.id);
      expect(response.body.event).toHaveProperty('status', 'PENDING_APPROVAL');
    });

    test('should return 403 when non-owner tries to submit event', async () => {
      // Create another manager user (we need to create a new one to avoid conflicts)
      const otherManager = await testHelper.createTestUser({
        email: 'other_manager_submit_unique@test.com',
        firstName: 'Other',
        lastName: 'Submitter',
        role: 'MANAGER',
        externalId: 'test_supabase_other_submit_unique_' + Date.now()
      });

      const otherManagerToken = generateAccessToken({
        userId: otherManager.id,
        externalId: otherManager.externalId,
        email: otherManager.email,
        role: otherManager.role
      });

      const response = await request(app)
        .post(`/api/events/${draftEvent.id}/submit`)
        .set('Authorization', `Bearer ${otherManagerToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Only the event owner can submit');
    });

    test('should return 400 when trying to submit a non-draft event', async () => {
      // Create an already approved event
      const approvedEvent = await prisma.event.create({
        data: {
          title: 'Already Approved Event',
          description: 'This event is already approved',
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 2 * 86400000),
          location: 'Test Location',
          category: 'Technology',
          maxParticipants: 25,
          creatorId: managerUser.id,
          status: 'APPROVED'
        }
      });

      const response = await request(app)
        .post(`/api/events/${approvedEvent.id}/submit`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Only draft events can be submitted');
    });

    test('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .post('/api/events/nonexistentid12345/submit')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Event not found');
    });
  });

  describe('GET /api/managers/:id/events - Manager\'s events', () => {
    let managerEvents;

    beforeEach(async () => {
      // Create multiple events for the manager
      managerEvents = await Promise.all([
        prisma.event.create({
          data: {
            title: 'Manager Event 1',
            description: 'First event by manager',
            startDate: new Date(Date.now() + 86400000),
            endDate: new Date(Date.now() + 2 * 86400000),
            location: 'Location 1',
            category: 'Tech',
            maxParticipants: 20,
            creatorId: managerUser.id,
            status: 'PENDING_APPROVAL'
          }
        }),
        prisma.event.create({
          data: {
            title: 'Manager Event 2',
            description: 'Second event by manager',
            startDate: new Date(Date.now() + 3 * 86400000),
            endDate: new Date(Date.now() + 4 * 86400000),
            location: 'Location 2',
            category: 'Education',
            maxParticipants: 30,
            creatorId: managerUser.id,
            status: 'PENDING_APPROVAL'
          }
        })
      ]);
    });

    test('should return all events created by a specific manager', async () => {
      const response = await request(app)
        .get(`/api/managers/${managerUser.id}/events`)
        .expect(200);

      expect(response.body).toHaveProperty('manager');
      expect(response.body).toHaveProperty('events');
      expect(Array.isArray(response.body.events)).toBe(true);
      
      // Should contain at least the two events we created
      expect(response.body.events.length).toBeGreaterThanOrEqual(2);
      
      // Check that the events belong to the correct manager
      for (const event of response.body.events) {
        expect(event.creatorId).toBe(managerUser.id);
      }
    });

    test('should return 404 for non-existent manager', async () => {
      const response = await request(app)
        .get('/api/managers/nonexistentid12345/events')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });

    test('should return empty array for manager with no events', async () => {
      // Create a new manager with no events
      const newManager = await testHelper.createTestUser({
        email: 'new_manager_no_events@test.com',
        firstName: 'New',
        lastName: 'Manager',
        role: 'MANAGER',
        externalId: 'test_supabase_new_manager_no_events_' + Date.now()
      });

      const response = await request(app)
        .get(`/api/managers/${newManager.id}/events`)
        .expect(200);

      expect(response.body).toHaveProperty('manager');
      expect(response.body).toHaveProperty('events');
      expect(Array.isArray(response.body.events)).toBe(true);
      expect(response.body.events).toHaveLength(0);
    });
  });
});