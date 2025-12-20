/**
 * Test script for Milestone 10 - Reporting and Export endpoints
 * Run this after logging in as an admin user
 */

const BASE_URL = 'http://localhost:3000/api';

// You'll need to replace this with an actual admin token
// Login as admin first, then copy the access token here
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE';

const headers = {
    'Authorization': `Bearer ${ADMIN_TOKEN}`,
    'Content-Type': 'application/json'
};

async function testEventsByMonth() {
    console.log('\n=== Testing GET /api/admin/reports/events-by-month ===');

    try {
        const response = await fetch(`${BASE_URL}/admin/reports/events-by-month?year=2025`, {
            headers
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('✓ Events by month endpoint works!');
        } else {
            console.log('✗ Error:', data.error);
        }
    } catch (error) {
        console.error('✗ Request failed:', error.message);
    }
}

async function testDashboardStats() {
    console.log('\n=== Testing GET /api/admin/reports/dashboard-stats ===');

    try {
        const response = await fetch(`${BASE_URL}/admin/reports/dashboard-stats`, {
            headers
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('✓ Dashboard stats endpoint works!');
        } else {
            console.log('✗ Error:', data.error);
        }
    } catch (error) {
        console.error('✗ Request failed:', error.message);
    }
}

async function testExportEvents() {
    console.log('\n=== Testing GET /api/admin/export/events.csv ===');

    try {
        const response = await fetch(`${BASE_URL}/admin/export/events.csv`, {
            headers
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Content-Type:', response.headers.get('content-type'));
        console.log('First 200 chars:', text.substring(0, 200));

        if (response.ok) {
            console.log('✓ Events CSV export works!');
            console.log('CSV length:', text.length, 'characters');
        } else {
            console.log('✗ Error:', text);
        }
    } catch (error) {
        console.error('✗ Request failed:', error.message);
    }
}

async function testExportRegistrations() {
    console.log('\n=== Testing GET /api/admin/export/registrations.csv ===');

    try {
        const response = await fetch(`${BASE_URL}/admin/export/registrations.csv`, {
            headers
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Content-Type:', response.headers.get('content-type'));
        console.log('First 200 chars:', text.substring(0, 200));

        if (response.ok) {
            console.log('✓ Registrations CSV export works!');
            console.log('CSV length:', text.length, 'characters');
        } else {
            console.log('✗ Error:', text);
        }
    } catch (error) {
        console.error('✗ Request failed:', error.message);
    }
}

async function runTests() {
    console.log('Starting Milestone 10 endpoint tests...');
    console.log('Base URL:', BASE_URL);

    if (ADMIN_TOKEN === 'YOUR_ADMIN_TOKEN_HERE') {
        console.error('\n⚠️  Please set ADMIN_TOKEN in the script before running tests!');
        console.log('\nTo get an admin token:');
        console.log('1. Login as admin: POST /api/auth/login');
        console.log('2. Copy the accessToken from the response');
        console.log('3. Replace ADMIN_TOKEN in this script');
        return;
    }

    await testEventsByMonth();
    await testDashboardStats();
    await testExportEvents();
    await testExportRegistrations();

    console.log('\n=== All tests completed ===');
}

runTests();
