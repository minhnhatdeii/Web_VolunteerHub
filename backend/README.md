# VolunteerHub Backend

This is the backend service for the VolunteerHub application.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables by copying the example:
   ```bash
   # Create a .env file with your configuration
   ```

3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

4. Run database migrations (requires PostgreSQL database running):
   ```bash
   npm run migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

The following environment variables need to be set:

- `DATABASE_URL`: PostgreSQL database connection string
- `JWT_SECRET`: Secret for JWT token signing
- `JWT_EXPIRES_IN`: JWT expiration time
- `REFRESH_TOKEN_SECRET`: Secret for refresh token signing
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `VAPID_PUBLIC_KEY`: VAPID public key for web push notifications
- `VAPID_PRIVATE_KEY`: VAPID private key for web push notifications
- `PORT`: Port number for the server (default: 5000)

## API Endpoints

- `GET /` - API root endpoint with documentation
- `GET /health` - Health check with database status
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get specific event
- `POST /api/events` - Create new event
- `POST /api/events/:id/register` - Register for event
- `POST /api/events/:id/cancel` - Cancel registration

## Project Structure

```
backend/
├── index.js              # Main server file
├── db.js                 # Database connection
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
├── prisma/               # Prisma schema and migrations
│   └── schema.prisma     # Database schema
├── routes/               # API route handlers
│   ├── index.js          # Main router
│   ├── auth.js           # Authentication routes
│   ├── users.js          # User management routes
│   ├── events.js         # Event management routes
│   └── registrations.js  # Registration routes
├── middleware/           # Express middleware
│   └── auth.js           # Authentication middleware
├── config/               # Configuration files
│   └── supabase.js       # Supabase configuration
├── utils/                # Utility functions
│   └── fileUpload.js     # File upload utilities
└── scripts/              # Utility scripts
    └── migrate.js        # Database migration script
```

## Development

To run the development server with auto-restart on file changes:
```bash
npm run dev
```

To view the database in Prisma Studio:
```bash
npm run prisma:studio
```

## Database

This project uses Prisma ORM with PostgreSQL. The database schema is defined in `prisma/schema.prisma`.

## Supabase

This project integrates with Supabase for file storage and authentication. Make sure to configure your Supabase project and update the environment variables accordingly.