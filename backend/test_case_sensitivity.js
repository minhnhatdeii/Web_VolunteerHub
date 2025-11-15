// Test to confirm case sensitivity fix for role registration
import request from 'supertest';
import app from './index.js';
import prisma from './db.js';

async function testCaseSensitivity() {
  console.log("Testing case sensitivity for role registration...");

  try {
    // Test with lowercase 'manager'
    console.log("\n1. Testing registration with lowercase 'manager':");
    const managerLowercase = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test_manager_lowercase@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'ManagerLower',
        role: 'manager'
      });

    console.log(`Status: ${managerLowercase.status}`);
    if (managerLowercase.body.user) {
      console.log(`Role assigned: ${managerLowercase.body.user.role}`);
    }
    if (managerLowercase.body.error) {
      console.log(`Error: ${managerLowercase.body.error}`);
    }

    // Test with mixed case 'Manager'
    console.log("\n2. Testing registration with mixed case 'Manager':");
    const managerMixedCase = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test_manager_mixed@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'ManagerMixed',
        role: 'Manager'
      });

    console.log(`Status: ${managerMixedCase.status}`);
    if (managerMixedCase.body.user) {
      console.log(`Role assigned: ${managerMixedCase.body.user.role}`);
    }
    if (managerMixedCase.body.error) {
      console.log(`Error: ${managerMixedCase.body.error}`);
    }

    // Test with lowercase 'volunteer'
    console.log("\n3. Testing registration with lowercase 'volunteer':");
    const volunteerLowercase = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test_volunteer_lowercase@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'VolunteerLower',
        role: 'volunteer'
      });

    console.log(`Status: ${volunteerLowercase.status}`);
    if (volunteerLowercase.body.user) {
      console.log(`Role assigned: ${volunteerLowercase.body.user.role}`);
    }
    if (volunteerLowercase.body.error) {
      console.log(`Error: ${volunteerLowercase.body.error}`);
    }

    console.log("\nCase sensitivity test completed successfully!");
  } catch (error) {
    console.error("Test failed with error:", error.message);
  } finally {
    // Cleanup test users
    try {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [
              'test_manager_lowercase@example.com',
              'test_manager_mixed@example.com',
              'test_volunteer_lowercase@example.com'
            ]
          }
        }
      });
      console.log("\nCleanup completed.");
    } catch (cleanupError) {
      console.error("Cleanup failed:", cleanupError.message);
    }

    await prisma.$disconnect();
  }
}

// Run the test
testCaseSensitivity();