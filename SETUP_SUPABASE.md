# Setting up Supabase Database for VolunteerHub

This guide will walk you through setting up your Supabase database for the VolunteerHub project.

## Step 1: Create a Supabase Account and Project

1. Go to [supabase.com](https://supabase.com) and click "Start your project"
2. Sign up with your preferred method (email, GitHub, etc.)
3. Create a new project:
   - Choose a project name (e.g., "volunteerhub")
   - Select your desired region
   - Create a secure password for the database
   - Click "Create new project"
4. Wait for the project to be provisioned (this may take a minute)

## Step 2: Get Your Database Connection Information

1. Once your project is ready, navigate to your project page
2. Go to the "Project Settings" tab (gear icon in the left sidebar)
3. Select "Database" from the settings options
4. Note down the connection string information:
   - Host: Usually appears as [project-ref].supabase.co
   - Port: 5432 (default)
   - Database: postgres
   - Username: postgres
   - Password: The one you created in step 1

## Step 3: Update Your Environment Variables

1. In your project's `backend/.env` file, update the `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_PROJECT_ID.supabase.co:5432/postgres"
   ```

2. Keep your Supabase URL and keys (these should already be in your .env file):
   ```env
   SUPABASE_URL="https://[project-id].supabase.co"
   SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

## Step 4: Create Database Schema

Your project already has the schema defined in `backend/prisma/schema.prisma`. The schema includes:

- User table (with roles: VOLUNTEER, MANAGER, ADMIN)
- Event table (with status: DRAFT, SUBMITTED, PENDING_APPROVAL, APPROVED, REJECTED, COMPLETED, CANCELLED)
- Registration table (with status: PENDING, APPROVED, REJECTED, CANCELLED, ATTENDED)
- Related tables (Post, Comment, Like, Notification, WebPushSubscription)

## Step 5: Run Prisma Migrations

1. In your terminal, navigate to the backend directory:
   ```bash
   cd C:\MyCode\Web_VolunteerHub\backend
   ```

2. Install dependencies if you haven't already:
   ```bash
   npm install
   ```

3. Run the Prisma migration:
   ```bash
   npx prisma migrate dev --name init
   ```
   
   This will:
   - Create all tables based on your schema file
   - Set up relationships between tables
   - Create indexes and constraints

## Step 6: Create Admin User

After successfully connecting to the database, create your admin user:
```bash
node create_admin_supabase.js
```

This script will:
- Create a user in Supabase Auth system
- Create the corresponding record in the local users table
- Set the user role to ADMIN

## Step 7: Verify the Connection

1. Test the database connection:
   ```bash
   node test_supabase_connection.js
   ```

2. Check your database in Supabase Studio:
   ```bash
   npx prisma studio
   ```

## Troubleshooting

### Common Issues:

1. **Connection Error**: Make sure your database password is correct and properly URL-encoded if it contains special characters.

2. **Migration Fails**: Ensure your `DATABASE_URL` is properly formatted and the database is accessible.

3. **Admin Creation Fails**: Verify that your `SUPABASE_SERVICE_ROLE_KEY` has sufficient permissions.

### Security Notes:

1. Never commit your `.env` file to version control
2. Use strong passwords for your Supabase database
3. Rotate your keys periodically for security
4. The `SUPABASE_SERVICE_ROLE_KEY` has full database access - keep it secure

## Optional: Configure Supabase Authentication

Your project is already configured to use Supabase Auth, which provides:
- User registration and login
- Email verification
- Password recovery
- OAuth providers (if needed)

For email configuration:
1. Go to your Supabase project dashboard
2. Navigate to Authentication → Settings
3. Configure email templates and SMTP settings if needed

## Using the Database

Once set up, your application will:
- Store user information in both Supabase Auth and your PostgreSQL tables
- Handle event management with status tracking
- Manage registrations and attendance
- Provide notification services
- Support role-based access control

That's it! Your VolunteerHub application is now connected to a production-ready Supabase database.