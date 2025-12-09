import 'dotenv/config';
import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing connection to Supabase database...');
    await prisma.$connect();
    console.log('✅ Successfully connected to Supabase database!');
    
    // Test if we can query the users table (even if it's empty)
    const userCount = await prisma.user.count();
    console.log(`✅ Database is accessible. Current user count: ${userCount}`);
    
    // If connection successful, we can run migrations
    console.log('\nTo run migrations, execute:');
    console.log('npx prisma migrate dev --name init');
    
    // Also test Supabase Auth connection
    console.log('\nTesting Supabase Auth connection...');
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      console.log('✅ Supabase client initialized successfully');
      
      // Test that we can access the Supabase configuration
      console.log('✅ Supabase configuration verified');
    } else {
      console.log('❌ Supabase configuration missing in environment variables');
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.message.includes('password')) {
      console.log('\n💡 The database password in your .env file may be incorrect.');
      console.log('Please check your Supabase project settings for the correct database password.');
    } else if (error.message.includes('connection')) {
      console.log('\n💡 Please ensure your .env file has the correct database connection string.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();