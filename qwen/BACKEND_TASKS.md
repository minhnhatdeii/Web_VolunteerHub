# Backend Implementation Tasks - Milestones for VolunteerHub

## Milestone 1: Project Setup and Database Configuration

- [ ] Set up Node.js/Express or NestJS project
- [ ] Configure Prisma ORM with PostgreSQL
- [ ] Define database schema matching the specified models:
  - users table
  - events table
  - registrations table
  - posts table
  - comments table
  - likes table
  - notifications table
  - web_push_subscriptions table
- [ ] Set up PostgreSQL database (local/Supabase)
- [ ] Initialize Supabase project and configure storage buckets
- [ ] Run initial database migrations
- [ ] Set up environment variables and configuration
- [ ] Implement basic server structure with routing

## Milestone 2: Authentication System

- [ ] Implement user registration endpoint (POST /api/auth/register)
- [ ] Implement user login endpoint (POST /api/auth/login)
- [ ] Create JWT authentication middleware
- [ ] Implement refresh token functionality (POST /api/auth/refresh)
- [ ] Implement logout endpoint (POST /api/auth/logout)
- [ ] Create password hashing with bcrypt
- [ ] Add input validation for auth endpoints
- [ ] Implement role-based access control (RBAC)

## Milestone 3: User Management

- [ ] Create GET /api/users/me endpoint to retrieve user profile
- [ ] Create PUT /api/users/me endpoint for profile updates
- [ ] Implement file upload for avatar (to Supabase Storage)
- [ ] Add user setting management (push notifications on/off)
- [ ] Implement admin endpoint to lock/unlock accounts (POST /api/users/:id/lock)

## Milestone 4: Event Management

- [ ] Create GET /api/events endpoint (list with filters)
- [ ] Create GET /api/events/:id endpoint (event details)
- [ ] Create POST /api/events endpoint (create event - manager only)
- [ ] Create PUT /api/events/:id endpoint (edit event - owner only)
- [ ] Create DELETE /api/events/:id endpoint (delete event)
- [ ] Implement event submission for approval (POST /api/events/:id/submit)
- [ ] Create GET /api/managers/:id/events endpoint (manager's events)
- [ ] Add validation for event creation/update
- [ ] Add thumbnail upload to Supabase Storage for events

## Milestone 5: Event Approval System (Admin)

- [ ] Create GET /api/admin/events endpoint (with pending status filter)
- [ ] Create POST /api/admin/events/:id/approve endpoint (admin only)
- [ ] Create POST /api/admin/events/:id/reject endpoint (admin only)
- [ ] Implement approval notification system
- [ ] Add approval/rejection reason functionality

## Milestone 6: Registration System

- [ ] Create POST /api/events/:id/register endpoint (volunteer sign-up)
- [ ] Create POST /api/events/:id/cancel endpoint (cancel registration)
- [ ] Create GET /api/users/me/registrations endpoint (user history)
- [ ] Create POST /api/events/:id/registrations/:regId/approve (manager approval)
- [ ] Implement registration status workflow (pending, approved, rejected, cancelled, attended)

## Milestone 7: Communication Channel (Posts/Comments)

- [ ] Create GET /api/events/:id/posts endpoint (with limit pagination)
- [ ] Create POST /api/events/:id/posts endpoint (create post with optional file upload to Supabase Storage)
- [ ] Create POST /api/posts/:id/comments endpoint (add comment)
- [ ] Create POST /api/posts/:id/like endpoint (like functionality)
- [ ] Create DELETE /api/posts/:id endpoint (hide/delete for managers/admins)
- [ ] Implement basic polling (every 10s) for real-time updates
- [ ] Add content sanitization to prevent XSS

## Milestone 8: Real-time Features (Socket.io)

- [ ] Integrate Supabase Realtime for real-time updates on events
- [ ] Implement Socket.io for fallback real-time updates on /events/:id namespace
- [ ] Push new posts/comments to connected clients
- [ ] Set up Redis adapter for multi-instance scaling (if needed)
- [ ] Add fallback to polling for compatibility

## Milestone 9: Notification System

- [ ] Create GET /api/users/me/notifications endpoint
- [ ] Create POST /api/users/me/webpush endpoint (register push subscriptions)
- [ ] Implement POST /api/notify/send endpoint (admin-triggered notifications)
- [ ] Set up web push functionality using web-push library
- [ ] Store push subscriptions in web_push_subscriptions table
- [ ] Implement notifications for event approval/registration status changes

## Milestone 10: Reporting and Export

- [ ] Create GET /api/admin/reports/events-by-month endpoint (for charts)
- [ ] Create GET /api/admin/export/events.csv endpoint (download)
- [ ] Create GET /api/admin/export/registrations.csv endpoint (download)
- [ ] Implement aggregation queries for dashboard statistics
- [ ] Add admin dashboard data endpoints

## Milestone 11: Security and Validations

- [ ] Add comprehensive input validation using Zod/Joi
- [ ] Implement rate limiting for auth endpoints
- [ ] Add security headers (HSTS, CORS whitelist)
- [ ] Implement file upload protection (mime-type, size limits) for Supabase Storage
- [ ] Configure Supabase Storage policies for public/private access
- [ ] Add SQL injection prevention via ORM
- [ ] Implement CSP headers
- [ ] Add proper error handling and logging

## Milestone 12: Deployment and CI/CD

- [ ] Dockerize the application
- [ ] Set up GitHub Actions for CI/CD pipeline
- [ ] Configure deployment to Google Cloud Run
- [ ] Set up environment variables in Cloud Run
- [ ] Configure database migrations in deployment pipeline
- [ ] Connect to Supabase backend services
- [ ] Test deployment and connectivity