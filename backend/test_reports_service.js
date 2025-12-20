/**
 * Test the reports service directly to see the actual error
 */

import * as reportsService from './services/reports.service.js';

async function testReportsService() {
    console.log('Testing reports service...\n');

    try {
        console.log('1. Testing getEventsByMonth...');
        const eventsByMonth = await reportsService.getEventsByMonth(2025);
        console.log('✓ Success:', JSON.stringify(eventsByMonth, null, 2));
    } catch (error) {
        console.error('✗ Error in getEventsByMonth:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
    }

    console.log('\n---\n');

    try {
        console.log('2. Testing getDashboardStats...');
        const stats = await reportsService.getDashboardStats();
        console.log('✓ Success:', JSON.stringify(stats, null, 2));
    } catch (error) {
        console.error('✗ Error in getDashboardStats:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
    }

    console.log('\n---\n');

    try {
        console.log('3. Testing getEventReport...');
        const events = await reportsService.getEventReport();
        console.log(`✓ Success: ${events.length} events`);
        if (events.length > 0) {
            console.log('First event:', JSON.stringify(events[0], null, 2));
        }
    } catch (error) {
        console.error('✗ Error in getEventReport:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
    }

    console.log('\n---\n');

    try {
        console.log('4. Testing getRegistrationReport...');
        const regs = await reportsService.getRegistrationReport();
        console.log(`✓ Success: ${regs.length} registrations`);
        if (regs.length > 0) {
            console.log('First registration:', JSON.stringify(regs[0], null, 2));
        }
    } catch (error) {
        console.error('✗ Error in getRegistrationReport:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
    }

    process.exit(0);
}

testReportsService();
