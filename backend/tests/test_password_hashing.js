import bcrypt from 'bcrypt';
import testHelper from './testHelper.js';

describe('Password Hashing', () => {
  beforeAll(async () => {
    await testHelper.clearDatabase();
  });

  afterAll(async () => {
    await testHelper.closeDatabase();
  });

  test('should properly hash passwords using bcrypt', async () => {
    const plainPassword = 'mySecurePassword123!';
    const saltRounds = 10;

    // Hash the password
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    // Verify the password matches the hash
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);

    expect(isMatch).toBe(true);
    expect(hashedPassword).not.toBe(plainPassword); // Should not be the same as plain text
    expect(typeof hashedPassword).toBe('string');
    expect(hashedPassword).toMatch(/^\$2[ayb]\$.*/); // bcrypt hash format check
  });

  test('should not match incorrect passwords', async () => {
    const plainPassword = 'mySecurePassword123!';
    const wrongPassword = 'wrongPassword';
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    const isMatch = await bcrypt.compare(wrongPassword, hashedPassword);

    expect(isMatch).toBe(false);
  });

  test('should use appropriate salt rounds (10)', async () => {
    const plainPassword = 'testPassword';
    const saltRounds = 10; // As used in auth routes

    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    
    // Extract the salt rounds from the hash (format: $algorithm$rounds$salt$hash)
    const parts = hashedPassword.split('$');
    const rounds = parseInt(parts[2], 10);
    
    expect(rounds).toBe(saltRounds);
  });

  test('should work for user registration', async () => {
    const userData = {
      email: 'hashtest@example.com',
      password: 'hashTestPassword123',
      firstName: 'Hash',
      lastName: 'Test'
    };

    // Simulate what happens during registration
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // The hashed password should be different from the original
    expect(hashedPassword).not.toBe(userData.password);

    // Should be verifiable
    const isMatch = await bcrypt.compare(userData.password, hashedPassword);
    expect(isMatch).toBe(true);

    // Create user in database with hashed password to ensure functionality
    const user = await testHelper.createTestUser({
      email: userData.email,
      password: userData.password, // This gets hashed in the helper
      firstName: userData.firstName,
      lastName: userData.lastName
    });

    // Confirm that the stored password is indeed hashed
    expect(user.password).not.toBe(userData.password);
    const isValid = await bcrypt.compare(userData.password, user.password);
    expect(isValid).toBe(true);
  });

  test('should work for user login verification', async () => {
    const email = 'loginhash@example.com';
    const plainPassword = 'loginPassword123';

    // Create a user with a hashed password
    const user = await testHelper.createTestUser({
      email,
      password: plainPassword
    });

    // Verify that the plain password matches the stored hash
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    expect(isMatch).toBe(true);

    // Verify that a different password doesn't match
    const wrongMatch = await bcrypt.compare('wrongpassword', user.password);
    expect(wrongMatch).toBe(false);
  });
});