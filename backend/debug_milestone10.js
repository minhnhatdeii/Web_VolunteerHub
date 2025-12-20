/**
 * Simple debug script to test endpoints one by one
 */

const BASE_URL = 'http://localhost:5000/api';

async function getAdminToken() {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@example.com',
            password: 'AdminPassword123!'
        })
    });

    const data = await response.json();
    return data.accessToken;
}

async function testEndpoint(endpoint) {
    const token = await getAdminToken();

    console.log(`\nTesting: ${endpoint}`);
    console.log('='.repeat(60));

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('json')) {
        const data = await response.json();
        console.log('JSON Response:', JSON.stringify(data, null, 2));
    } else if (contentType && contentType.includes('csv')) {
        const text = await response.text();
        console.log('CSV Response (first 500 chars):');
        console.log(text.substring(0, 500));
    } else {
        const text = await response.text();
        console.log('Text Response (first 500 chars):');
        console.log(text.substring(0, 500));
    }
}

async function runDebug() {
    try {
        await testEndpoint('/admin/reports/events-by-month?year=2025');
    } catch (err) {
        console.error('Error:', err.message);
        console.error('Stack:', err.stack);
    }
}

runDebug();
