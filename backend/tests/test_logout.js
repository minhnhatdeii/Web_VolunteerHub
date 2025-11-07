import testHelper from './testHelper.js';

describe('Logout (POST /api/auth/logout)', () => {
  let app, request;

  beforeAll(async () => {
    app = testHelper.getApp();
    request = testHelper.getRequest();
    await testHelper.clearDatabase();
  });

  afterAll(async () => {
    await testHelper.closeDatabase();
  });

  test('should successfully logout', async () => {
    const response = await request
      .post('/api/auth/logout')
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Logout successful');
  });

  // Note: In our implementation, logout is client-side only
  // The server just acknowledges the logout request
  test('should handle logout request even without authentication', async () => {
    const response = await request
      .post('/api/auth/logout')
      .send({}) // No token needed
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Logout successful');
  });

  test('should handle logout request with authentication', async () => {
    // Even with a token, logout should still work
    const response = await request
      .post('/api/auth/logout')
      .set('Authorization', 'Bearer some-token')
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Logout successful');
  });
});