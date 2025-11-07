#!/usr/bin/env node

/**
 * JWT Secret Generator
 * 
 * This script generates secure JWT secrets for your application.
 * Run this script to generate new secrets for your .env file.
 */

import crypto from 'crypto';

function generateSecret(length = 64) {
  // Generate a cryptographically secure random string
  return crypto.randomBytes(length).toString('hex');
}

function displayInstructions() {
  console.log('\n🔐 JWT Secret Generator');
  console.log('========================\n');
  console.log('This script will generate secure secrets for your JWT authentication.\n');
  
  console.log('📋 Generated secrets will be:');
  console.log('  • JWT_SECRET: For signing access tokens');
  console.log('  • REFRESH_TOKEN_SECRET: For signing refresh tokens\n');
  
  console.log('⚠️  SECURITY NOTES:');
  console.log('  • Keep these secrets safe and never commit them to version control');
  console.log('  • Use different secrets for development and production');
  console.log('  • Generate new secrets if they are ever compromised\n');
}

function generateAndDisplaySecrets() {
  console.log('🔐 Generated Secrets:\n');
  
  // Generate secrets
  const jwtSecret = generateSecret(64); // 64 bytes = 512 bits
  const refreshTokenSecret = generateSecret(64);
  
  // Display in .env format
  console.log('# JWT Configuration');
  console.log(`JWT_SECRET="${jwtSecret}"`);
  console.log(`JWT_EXPIRES_IN="24h"`);
  console.log(`REFRESH_TOKEN_SECRET="${refreshTokenSecret}"`);
  console.log(`REFRESH_TOKEN_EXPIRES_IN="7d"`);
  console.log('');
  
  // Also provide them separately for clarity
  console.log('📋 Individual Secrets:');
  console.log(`JWT_SECRET:           ${jwtSecret}`);
  console.log(`REFRESH_TOKEN_SECRET: ${refreshTokenSecret}\n`);
}

function displaySetupInstructions() {
  console.log('💾 Setup Instructions:\n');
  console.log('1. Copy the generated secrets above');
  console.log('2. Open your .env file in the backend directory');
  console.log('3. Replace the existing JWT_SECRET and REFRESH_TOKEN_SECRET values');
  console.log('4. Save the file\n');
  console.log('📁 Example .env file location:');
  console.log('   C:\\MyCode\\Web_VolunteerHub\\backend\\.env\n');
}

function main() {
  displayInstructions();
  generateAndDisplaySecrets();
  displaySetupInstructions();
  
  console.log('✅ Done! Remember to restart your server after updating the .env file.');
}

// Run the script
main();