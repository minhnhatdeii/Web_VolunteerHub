/**
 * Automated test script for Milestone 10 - Reporting and Export endpoints
 */

const BASE_URL = 'http://localhost:5000/api';

// Admin credentials
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'AdminPassword123!';

let adminToken = null;

async function loginAsAdmin() {
    console.log('Logging in as admin...');

    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD
            })
        });

        const data = await response.json();

        if (response.ok) {
            adminToken = data.accessToken;
            console.log('✓ Login successful!\n');
            return true;
        } else {
            console.log('✗ Login failed:', data.error);
            return false;
        }
    } catch (error) {
        console.error('✗ Request failed:', error.message);
        return false;
    }
}

async function testEventsByMonth() {
    console.log('=== Testing GET /api/admin/reports/events-by-month ===');

    try {
        const response = await fetch(`${BASE_URL}/admin/reports/events-by-month?year=2025`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('✓ Events by month endpoint works!\n');
            return true;
        } else {
            console.log('✗ Error:', data.error, '\n');
            return false;
        }
    } catch (error) {
        console.error('✗ Request failed:', error.message, '\n');
        return false;
    }
}

async function testDashboardStats() {
    console.log('=== Testing GET /api/admin/reports/dashboard-stats ===');

    try {
        const response = await fetch(`${BASE_URL}/admin/reports/dashboard-stats`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log('✓ Dashboard stats endpoint works!\n');
            return true;
        } else {
            console.log('✗ Error:', data.error, '\n');
            return false;
        }
    } catch (error) {
        console.error('✗ Request failed:', error.message, '\n');
        return false;
    }
}

async function testExportEvents() {
    console.log('=== Testing GET /api/admin/export/events.csv ===');

    try {
        const response = await fetch(`${BASE_URL}/admin/export/events.csv`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Content-Type:', response.headers.get('content-type'));
        console.log('First 300 chars:', text.substring(0, 300));

        if (response.ok) {
            console.log('✓ Events CSV export works!');
            console.log('CSV length:', text.length, 'characters\n');
            return true;
        } else {
            console.log('✗ Error:', text, '\n');
            return false;
        }
    } catch (error) {
        console.error('✗ Request failed:', error.message, '\n');
        return false;
    }
}

async function testExportRegistrations() {
    console.log('=== Testing GET /api/admin/export/registrations.csv ===');

    try {
        const response = await fetch(`${BASE_URL}/admin/export/registrations.csv`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Content-Type:', response.headers.get('content-type'));
        console.log('First 300 chars:', text.substring(0, 300));

        if (response.ok) {
            console.log('✓ Registrations CSV export works!');
            console.log('CSV length:', text.length, 'characters\n');
            return true;
        } else {
            console.log('✗ Error:', text, '\n');
            return false;
        }
    } catch (error) {
        console.error('✗ Request failed:', error.message, '\n');
        return false;
    }
}

async function runTests() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║   Milestone 10: Reporting & Export - Test Suite      ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');
    console.log('Base URL:', BASE_URL, '\n');

    // Login first
    const loginSuccess = await loginAsAdmin();
    if (!loginSuccess) {
        console.log('Cannot proceed without admin authentication.');
        return;
    }

    // Run tests
    const results = {
        eventsByMonth: await testEventsByMonth(),
        dashboardStats: await testDashboardStats(),
        exportEvents: await testExportEvents(),
        exportRegistrations: await testExportRegistrations()
    };

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('                    TEST SUMMARY                       ');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Events by Month:         ${results.eventsByMonth ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`Dashboard Stats:         ${results.dashboardStats ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`Export Events CSV:       ${results.exportEvents ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`Export Registrations CSV: ${results.exportRegistrations ? '✓ PASS' : '✗ FAIL'}`);
    console.log('═══════════════════════════════════════════════════════');

    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => r).length;
    console.log(`\nResult: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Milestone 10 implementation is complete.\n');
    } else {
        console.log('⚠️  Some tests failed. Please review the errors above.\n');
    }
}

runTests();
