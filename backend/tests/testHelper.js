import request from 'supertest';
import app from '../index.js';
import prisma from '../db.js';
import bcrypt from 'bcrypt';

// Test helper functions
const testHelper = {
  // Clear database before tests
  async clearDatabase() {
    await prisma.like.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.webPushSubscription.deleteMany({});
    await prisma.registration.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.user.deleteMany({});
  },

  // Create a test user
  async createTestUser(userData = {}) {
    const defaultUserData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'VOLUNTEER'
    };

    const finalUserData = { ...defaultUserData, ...userData };
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(finalUserData.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        ...finalUserData,
        password: hashedPassword
      }
    });

    return user;
  },

  // Get app instance for testing
  getApp() {
    return app;
  },

  // Get request instance for testing
  getRequest() {
    return request(app);
  },

  // Close database connection
  async closeDatabase() {
    await prisma.$disconnect();
  }
};

export default testHelper;