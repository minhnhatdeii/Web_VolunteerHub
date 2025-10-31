import { PrismaClient } from './generated/prisma/index.js';
import 'dotenv/config';

console.log('Attempting to create Prisma client...');

try {
  const prisma = new PrismaClient();
  console.log('Prisma client created successfully');
  
  // Try to connect to the database
  await prisma.$connect();
  console.log('Connected to database successfully');
  
  // Disconnect
  await prisma.$disconnect();
  console.log('Disconnected from database');
} catch (error) {
  console.error('Error:', error.message);
}