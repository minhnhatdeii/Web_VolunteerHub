import testHelper from './testHelper.js';
import { generateAccessToken } from '../utils/jwt.js';

describe('Role-Based Access Control', () => {
  let app, request;
  let volunteerUser, managerUser, adminUser;
  let volunteerToken, managerToken, adminToken;

  beforeAll(async () => {
    app = testHelper.getApp();
    request = testHelper.getRequest();
    await testHelper.clearDatabase();
    
    // Create users with different roles
    volunteerUser = await testHelper.createTestUser({
      email: 'volunteer@example.com',
      role: 'VOLUNTEER'
    });
    
    managerUser = await testHelper.createTestUser({
      email: 'manager@example.com',
      role: 'MANAGER'
    });
    
    adminUser = await testHelper.createTestUser({
      email: 'admin@example.com',
      role: 'ADMIN'
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
    await testHelper.closeDatabase();
  });

  test('VOLUNTEER should not have access to admin-only endpoint', async () => {
    const response = await request
      .get('/api/examples/admin')
      .set('Authorization', `Bearer ${volunteerToken}`)
      .expect(403);

    expect(response.body).toHaveProperty('error', 'Insufficient permissions');
  });

  test('MANAGER should not have access to admin-only endpoint', async () => {
    const response = await request
      .get('/api/examples/admin')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(403);

    expect(response.body).toHaveProperty('error', 'Insufficient permissions');
  });

  test('ADMIN should have access to admin-only endpoint', async () => {
    const response = await request
      .get('/api/examples/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'This is an admin-only route');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('role', 'ADMIN');
  });

  test('VOLUNTEER should not have access to manager-only endpoint', async () => {
    const response = await request
      .get('/api/examples/manager')
      .set('Authorization', `Bearer ${volunteerToken}`)
      .expect(403);

    expect(response.body).toHaveProperty('error', 'Insufficient permissions');
  });

  test('MANAGER should have access to manager endpoint', async () => {
    const response = await request
      .get('/api/examples/manager')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'This route is for managers and admins');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('role', 'MANAGER');
  });

  test('ADMIN should have access to manager endpoint', async () => {
    const response = await request
      .get('/api/examples/manager')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'This route is for managers and admins');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('role', 'ADMIN');
  });

  test('VOLUNTEER should have access to general protected endpoint', async () => {
    const response = await request
      .get('/api/examples/protected')
      .set('Authorization', `Bearer ${volunteerToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'This is a protected route');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('role', 'VOLUNTEER');
  });

  test('MANAGER should have access to general protected endpoint', async () => {
    const response = await request
      .get('/api/examples/protected')
      .set('Authorization', `Bearer ${managerToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'This is a protected route');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('role', 'MANAGER');
  });

  test('ADMIN should have access to general protected endpoint', async () => {
    const response = await request
      .get('/api/examples/protected')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'This is a protected route');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('role', 'ADMIN');
  });
});