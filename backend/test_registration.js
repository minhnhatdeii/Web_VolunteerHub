// Simple test to confirm our registration with role functionality works
// This is not a Jest test but a simple node script to validate the functionality

import bcrypt from 'bcrypt';
import request from 'supertest';
import app from './index.js';
import prisma from './db.js';

async function testRoleRegistration() {
  console.log("Testing role-based registration...");

  try {
    // Test 1: Register with volunteer role
    console.log("\n1. Testing registration with VOLUNTEER role:");
    const volunteerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test_volunteer@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Volunteer',
        role: 'VOLUNTEER'
      });
    
    console.log(`Status: ${volunteerResponse.status}`);
    if (volunteerResponse.body.user) {
      console.log(`Role assigned: ${volunteerResponse.body.user.role}`);
    }
    if (volunteerResponse.body.error) {
      console.log(`Error: ${volunteerResponse.body.error}`);
    }

    // Test 2: Register with manager role
    console.log("\n2. Testing registration with MANAGER role:");
    const managerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test_manager@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Manager',
        role: 'MANAGER'
      });
    
    console.log(`Status: ${managerResponse.status}`);
    if (managerResponse.body.user) {
      console.log(`Role assigned: ${managerResponse.body.user.role}`);
    }
    if (managerResponse.body.error) {
      console.log(`Error: ${managerResponse.body.error}`);
    }

    // Test 3: Try to register with invalid role
    console.log("\n3. Testing registration with invalid role:");
    const invalidResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test_invalid@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Invalid',
        role: 'HACKER'
      });
    
    console.log(`Status: ${invalidResponse.status}`);
    if (invalidResponse.body.error) {
      console.log(`Error: ${invalidResponse.body.error}`);
    }

    // Test 4: Try to register without specifying role (should default to VOLUNTEER)
    console.log("\n4. Testing registration without role (should default to VOLUNTEER):");
    const defaultResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test_default@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Default'
        // No role specified
      });
    
    console.log(`Status: ${defaultResponse.status}`);
    if (defaultResponse.body.user) {
      console.log(`Role assigned: ${defaultResponse.body.user.role}`);
    }
    if (defaultResponse.body.error) {
      console.log(`Error: ${defaultResponse.body.error}`);
    }

    console.log("\nTest completed successfully!");
  } catch (error) {
    console.error("Test failed with error:", error.message);
  } finally {
    // Cleanup test users
    try {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [
              'test_volunteer@example.com',
              'test_manager@example.com',
              'test_invalid@example.com',
              'test_default@example.com'
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
testRoleRegistration();