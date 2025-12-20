/**
 * Helper script to login as admin and get access token
 */

const BASE_URL = 'http://localhost:3000/api';

// Default admin credentials - update if different
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'AdminPassword123!';

async function loginAsAdmin() {
    console.log('Attempting to login as admin...');
    console.log('Email:', ADMIN_EMAIL);

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
            console.log('\n✓ Login successful!');
            console.log('\nAccess Token:');
            console.log(data.accessToken);
            console.log('\nUser Info:');
            console.log('Role:', data.user?.role);
            console.log('Name:', data.user?.firstName, data.user?.lastName);
            console.log('\nCopy this token to test_milestone10.js');
            return data.accessToken;
        } else {
            console.log('\n✗ Login failed:', data.error);
            console.log('Please check if admin account exists and credentials are correct');
            return null;
        }
    } catch (error) {
        console.error('✗ Request failed:', error.message);
        console.log('\nMake sure the backend server is running on port 3000');
        return null;
    }
}

loginAsAdmin();
