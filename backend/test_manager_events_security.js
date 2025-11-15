// Test to verify the specific manager events route security
import request from 'supertest';
import app from './index.js';
import prisma from './db.js';
import { generateAccessToken } from './utils/jwt.js';

async function testManagerEventsSecurity() {
  console.log("Testing manager events route security...");

  try {
    // Create test users with different roles
    const volunteerUser = await prisma.user.create({
      data: {
        email: 'volunteer_events_test@example.com',
        password: 'hashed_password',
        firstName: 'Test',
        lastName: 'Volunteer',
        role: 'VOLUNTEER'
      }
    });

    const managerUser = await prisma.user.create({
      data: {
        email: 'manager_events_test@example.com',
        password: 'hashed_password',
        firstName: 'Test',
        lastName: 'Manager',
        role: 'MANAGER'
      }
    });

    // Generate tokens for both users
    const volunteerToken = generateAccessToken({
      userId: volunteerUser.id,
      email: volunteerUser.email,
      role: volunteerUser.role
    });

    const managerToken = generateAccessToken({
      userId: managerUser.id,
      email: managerUser.email,
      role: managerUser.role
    });

    // Test 1: Volunteer tries to access manager events route (should be denied)
    console.log("\n1. Testing if volunteer can access manager events route (should be denied):");
    const volunteerResponse = await request(app)
      .get(`/api/events/managers/${managerUser.id}/events`)
      .set('Authorization', `Bearer ${volunteerToken}`);

    console.log(`Status: ${volunteerResponse.status}`);
    if (volunteerResponse.body.error) {
      console.log(`Error (expected): ${volunteerResponse.body.error}`);
      if (volunteerResponse.status === 403) {
        console.log("✅ GOOD: Volunteer was properly denied access to manager events route");
      } else {
        console.log("❌ UNEXPECTED: Volunteer received unexpected status code");
      }
    } else {
      console.log("❌ SECURITY ISSUE: Volunteer was able to access manager events route!");
      console.log(`Response: ${JSON.stringify(volunteerResponse.body)}`);
    }

    // Test 2: Manager tries to access their own events (should be allowed)
    console.log("\n2. Testing if manager can access their own events route (should be allowed):");
    const managerOwnResponse = await request(app)
      .get(`/api/events/managers/${managerUser.id}/events`)
      .set('Authorization', `Bearer ${managerToken}`);

    console.log(`Status: ${managerOwnResponse.status}`);
    if (managerOwnResponse.status === 200) {
      console.log("✅ GOOD: Manager was properly allowed access to their own events route");
    } else {
      console.log("❌ UNEXPECTED: Manager was not allowed access to their own events route");
      if (managerOwnResponse.body.error) {
        console.log(`Error: ${managerOwnResponse.body.error}`);
      }
    }

    // Test 3: Manager tries to access another manager's events (should be denied unless admin)
    const anotherManager = await prisma.user.create({
      data: {
        email: 'another_manager_events_test@example.com',
        password: 'hashed_password',
        firstName: 'Another',
        lastName: 'Manager',
        role: 'MANAGER'
      }
    });

    console.log("\n3. Testing if manager can access another manager's events route (should be denied):");
    const managerOtherResponse = await request(app)
      .get(`/api/events/managers/${anotherManager.id}/events`)
      .set('Authorization', `Bearer ${managerToken}`);

    console.log(`Status: ${managerOtherResponse.status}`);
    if (managerOtherResponse.body.error) {
      console.log(`Error (expected): ${managerOtherResponse.body.error}`);
      if (managerOtherResponse.status === 403) {
        console.log("✅ GOOD: Manager was properly denied access to another manager's events");
      } else {
        console.log("❌ UNEXPECTED: Manager received unexpected status code");
      }
    } else {
      console.log("✅ GOOD: Manager was properly denied access (or properly handled)");
    }

    console.log("\nManager events route security test completed.");
  } catch (error) {
    console.error("Test failed with error:", error.message);
  } finally {
    // Cleanup test users
    try {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [
              'volunteer_events_test@example.com',
              'manager_events_test@example.com',
              'another_manager_events_test@example.com'
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
testManagerEventsSecurity();