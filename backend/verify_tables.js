import { prisma } from './db-client.js';

async function verifyTables() {
  try {
    console.log('Checking if database tables exist...\n');

    // Check if users table has any records
    const userCount = await prisma.user.count();
    console.log(`✓ Users table exists - Found ${userCount} users`);

    // Check if events table has any records
    const eventCount = await prisma.event.count();
    console.log(`✓ Events table exists - Found ${eventCount} events`);

    // Check if posts table has any records
    const postCount = await prisma.post.count();
    console.log(`✓ Posts table exists - Found ${postCount} posts`);

    // Check if registrations table has any records
    const registrationCount = await prisma.registration.count();
    console.log(`✓ Registrations table exists - Found ${registrationCount} registrations`);

    // Check if comments table has any records
    const commentCount = await prisma.comment.count();
    console.log(`✓ Comments table exists - Found ${commentCount} comments`);

    // Check if likes table has any records
    const likeCount = await prisma.like.count();
    console.log(`✓ Likes table exists - Found ${likeCount} likes`);

    // Check if notifications table has any records
    const notificationCount = await prisma.notification.count();
    console.log(`✓ Notifications table exists - Found ${notificationCount} notifications`);

    console.log('\n✅ All tables verified successfully!');
    console.log('The PostgreSQL database is properly connected with all required tables.');
  } catch (error) {
    console.error('❌ Error verifying tables:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTables();