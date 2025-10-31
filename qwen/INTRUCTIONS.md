# VolunteerHub Infrastructure Setup Guide

This document provides instructions for setting up the VolunteerHub application infrastructure for development and preview purposes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **pnpm** package manager
- **PostgreSQL** database (local installation or Docker)
- **Git** for version control
- **Supabase account** (if using cloud storage)

## Project Structure

```
Web_VolunteerHub/
├── backend/              # Backend API server
│   ├── prisma/           # Database schema and migrations
│   ├── routes/           # API route handlers
│   ├── middleware/       # Express middleware
│   ├── config/           # Configuration files
│   └── utils/            # Utility functions
└── frontend/             # Frontend application
    ├── app/              # Next.js pages and components
    ├── components/       # React components
    ├── lib/              # Utility libraries
    └── public/           # Static assets
```

## Backend Setup

### 1. Database Setup

#### Option A: Local PostgreSQL Setup

1. Install PostgreSQL on your system
2. Create a database named `volunteer_hub`
3. Create a user with appropriate permissions:
   ```sql
   CREATE USER postgres WITH PASSWORD 'postgres';
   GRANT ALL PRIVILEGES ON DATABASE volunteer_hub TO postgres;
   ```

#### Option B: Docker PostgreSQL Setup

If you prefer using Docker, run this command:

```bash
docker run --name volunteerhub-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=volunteer_hub -p 5433:5432 -d postgres:15
```
FRONTEND PORT IS 3000
BACKEND PORT IS 5000
Note: The database runs on port 5433 instead of the default 5432 to avoid conflicts with other PostgreSQL instances.

### 2. Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Copy the environment file and update the values:
   ```bash
   # Create .env file from the example
   cp .env.example .env  # If an example file exists, or edit .env directly
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/volunteer_hub"
   JWT_SECRET="your-jwt-secret-key-here"
   JWT_EXPIRES_IN="24h"
   REFRESH_TOKEN_SECRET="your-refresh-token-secret"
   REFRESH_TOKEN_EXPIRES_IN="7d"
   SUPABASE_URL="your-supabase-project-url"
   SUPABASE_ANON_KEY="your-supabase-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
   VAPID_PUBLIC_KEY="your-vapid-public-key"
   VAPID_PRIVATE_KEY="your-vapid-private-key"
   VAPID_SUBJECT="mailto:admin@volunteerhub.com"
   PORT=5000
   NODE_ENV=development
   ```

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Start the backend server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   The backend server will be available at `http://localhost:5000`

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   # or
   pnpm install
   ```

3. Create environment file with the backend API URL:
   ```bash
   # Create .env.local file with:
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   The frontend will be available at `http://localhost:3000`

## Supabase Setup (Optional)

If you plan to use Supabase for file storage and authentication:

1. Create an account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to the Project Settings → API
4. Copy the Project URL and anon key to your environment files

### Database Configuration in Supabase

1. In your Supabase dashboard, go to SQL Editor
2. You can run custom SQL if needed, but Prisma will handle table creation

### Storage Configuration

1. In your Supabase dashboard, go to Storage
2. Create buckets for:
   - `event-thumbnails` - for event image uploads
   - `user-avatars` - for user profile pictures
   - `post-images` - for images in posts

3. Set up policies for these buckets based on your application needs

## Running the Application

### Development Mode

1. Ensure your PostgreSQL database is running
2. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```
3. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

### Using Docker Compose (Alternative)

If you prefer using Docker to run the PostgreSQL database:

1. The `docker-compose.yml` file is located in the project root directory (C:\MyCode\Web_VolunteerHub\):
   ```yaml
   services:
     postgres:
       image: postgres:15
       container_name: volunteer_hub_postgres
       restart: always
       environment:
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: postgres
         POSTGRES_DB: volunteer_hub
       ports:
         - "5433:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U postgres"]
         interval: 10s
         timeout: 5s
         retries: 5

   volumes:
     postgres_data:
   ```

2. Start the PostgreSQL database:
   ```bash
   # From the project root directory
   docker-compose up -d
   ```

   Note: The database runs on port 5433 instead of the default 5432 to avoid conflicts with other PostgreSQL instances.

## Testing the Setup

1. Backend health check: `GET http://localhost:5000/health`
2. Frontend: Navigate to `http://localhost:3000`
3. You should see the application running with:
   - Successful database connections
   - API endpoints accessible
   - Frontend communicating with backend

## Troubleshooting

### Common Issues

1. **Port already in use**: Ensure ports 3000, 5000, and 5433 are available (Note: PostgreSQL runs on port 5433 to avoid conflicts)
2. **Database connection errors**: Verify PostgreSQL is running and credentials are correct
3. **Prisma errors**: Ensure Prisma is properly installed and schema is valid
4. **Environment variables missing**: Check that all required .env files are properly configured

### Resetting the Database

If you need to reset your database:

```bash
cd backend
npx prisma migrate reset
```

### Prisma Client Issues

If you encounter the error `@prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.`, try these steps:

1. Generate the Prisma client:
   ```bash
   cd backend
   npx prisma generate
   ```

2. Run database migrations:
   ```bash
   npx prisma db push
   # or
   npx prisma migrate dev
   ```

3. If the error persists, ensure the import in `backend/db.js` points to the generated client:
   ```javascript
   import { PrismaClient } from './generated/prisma/index.js';
   ```

## Production Deployment

For deploying to production:

1. Use environment variables appropriate for production
2. Ensure secure VAPID keys for web push notifications
3. Set up proper SSL certificates
4. Configure production database connection
5. Set up proper Supabase project for production
6. Use a reverse proxy like Nginx in front of both services

## Support

If you encounter issues with the setup:

1. Check the application logs in your terminal
2. Verify all prerequisites are properly installed
3. Ensure all environment variables are correctly set
4. Consult the README files in both backend and frontend directories