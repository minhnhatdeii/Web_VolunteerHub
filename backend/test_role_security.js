// Test to verify if volunteers can improperly access manager routes
import request from 'supertest';
import app from './index.js';
import prisma from './db.js';
import { generateAccessToken } from './utils/jwt.js';

async function testRoleBasedAccess() {
  console.log("Testing role-based access control...");

  try {
    // Create test users with different roles
    const volunteerUser = await prisma.user.create({
      data: {
        email: 'test_volunteer_access@example.com',
        password: 'hashed_password', // This is just for testing, real password is hashed
        firstName: 'Test',
        lastName: 'Volunteer',
        role: 'VOLUNTEER'
      }
    });

    const managerUser = await prisma.user.create({
      data: {
        email: 'test_manager_access@example.com',
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

    // Test 1: Volunteer tries to access manager route (should be denied)
    console.log("\n1. Testing if volunteer can access manager route (should be denied):");
    const volunteerResponse = await request(app)
      .get('/api/examples/manager')
      .set('Authorization', `Bearer ${volunteerToken}`);

    console.log(`Status: ${volunteerResponse.status}`);
    if (volunteerResponse.body.error) {
      console.log(`Error (expected): ${volunteerResponse.body.error}`);
    } else {
      console.log(`Response: ${JSON.stringify(volunteerResponse.body)}`);
      if (volunteerResponse.status === 200) {
        console.log("❌ SECURITY ISSUE: Volunteer was able to access manager route!");
      } else {
        console.log("✅ GOOD: Volunteer was properly denied access to manager route");
      }
    }

    // Test 2: Manager tries to access manager route (should be allowed)
    console.log("\n2. Testing if manager can access manager route (should be allowed):");
    const managerResponse = await request(app)
      .get('/api/examples/manager')
      .set('Authorization', `Bearer ${managerToken}`);

    console.log(`Status: ${managerResponse.status}`);
    if (managerResponse.body.message) {
      console.log(`Message: ${managerResponse.body.message}`);
      if (managerResponse.status === 200 && managerResponse.body.user?.role === 'MANAGER') {
        console.log("✅ GOOD: Manager was properly allowed access to manager route");
      } else {
        console.log("❌ UNEXPECTED: Manager was not allowed access to manager route");
      }
    } else {
      console.log(`Response: ${JSON.stringify(managerResponse.body)}`);
    }

    // Test 3: Check events route access for volunteers vs managers
    console.log("\n3. Testing if volunteer can access events creation (should be denied):");
    const volunteerEventResponse = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send({
        title: 'Test Event',
        description: 'A test event',
        startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endDate: new Date(Date.now() + 2*86400000).toISOString(), // In 2 days
        location: 'Test Location',
        category: 'Test',
        maxParticipants: 10
      });

    console.log(`Status: ${volunteerEventResponse.status}`);
    if (volunteerEventResponse.body.error) {
      console.log(`Error (expected): ${volunteerEventResponse.body.error}`);
      if (volunteerEventResponse.status === 403) {
        console.log("✅ GOOD: Volunteer was properly denied access to create event");
      } else {
        console.log("❓ UNEXPECTED ERROR STATUS: " + volunteerEventResponse.status);
      }
    } else {
      console.log("❌ SECURITY ISSUE: Volunteer was able to create event!");
    }

    console.log("\nRole-based access control test completed.");
  } catch (error) {
    console.error("Test failed with error:", error.message);
  } finally {
    // Cleanup test users
    try {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [
              'test_volunteer_access@example.com',
              'test_manager_access@example.com'
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
testRoleBasedAccess();