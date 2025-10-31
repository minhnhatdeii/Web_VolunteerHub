import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // Run the Prisma migration command
    const { stdout, stderr } = await execAsync('npx prisma migrate dev --name init');
    
    console.log('Migration output:', stdout);
    if (stderr) {
      console.error('Migration errors:', stderr);
    }
    
    console.log('Database migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error.message);
    if (error.stderr) {
      console.error('Error details:', error.stderr);
    }
    process.exit(1);
  }
}

// Check if this script is run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}` || 
    (process.argv[1] && process.argv[1].endsWith('migrate.js'))) {
  runMigrations();
}

export { runMigrations };