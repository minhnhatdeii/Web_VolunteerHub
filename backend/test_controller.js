import { PrismaClient } from './generated/prisma/index.js';
import { getPendingEvents } from './controllers/admin.controller.js';

// Mock request and response objects for testing the controller function directly
const mockReq = {
  query: {}, // No query parameters, should return all events
  user: { id: 'c974752e-5c27-46f6-bf16-dc4235a0c3f5', role: 'ADMIN' } // Mock admin user
};

const mockRes = {
  json: (data) => {
    console.log('API Response:', JSON.stringify(data, null, 2));
  },
  status: (code) => {
    console.log(`Response status: ${code}`);
    return mockRes; // Return self to allow chaining
  },
  json: (data) => {
    console.log('API Response:', JSON.stringify(data, null, 2));
  }
};

// Override the json method to make it work properly with chaining
let responseStatus = 200;
let responseJson = null;

mockRes.status = (code) => {
  responseStatus = code;
  console.log(`Response status: ${code}`);
  return mockRes;
};

mockRes.json = (data) => {
  responseJson = data;
  console.log('API Response:', JSON.stringify(data, null, 2));
};

// We need a custom implementation to handle the response properly
async function testGetPendingEvents() {
  console.log('Testing getPendingEvents controller function directly...');
  
  // Create a custom response object
  const response = {
    status: (code) => {
      console.log(`Response status: ${code}`);
      return response;
    },
    json: (data) => {
      console.log('API Response:', JSON.stringify(data, null, 2));
      console.log('\n--- Summary ---');
      console.log(`Total events returned: ${data.data.length}`);
      if (data.data && data.data.length > 0) {
        const statusCounts = {};
        data.data.forEach(event => {
          statusCounts[event.status] = (statusCounts[event.status] || 0) + 1;
        });
        console.log('Events by status:', statusCounts);
        console.log('Sample event:', {
          id: data.data[0].id,
          title: data.data[0].title,
          status: data.data[0].status
        });
      }
    }
  };

  try {
    await getPendingEvents(mockReq, response);
  } catch (error) {
    console.error('Error calling getPendingEvents:', error);
  }
}

testGetPendingEvents();