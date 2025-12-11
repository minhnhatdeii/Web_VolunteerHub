import express from 'express';
const router = express.Router();

// Import route modules
import authRoutes from './auth.js';
import userRoutes from './users.js';
import eventRoutes from './events.js';
import registrationRoutes from './registrations.js';
import exampleRoutes from './examples.js';
import adminRoutes from './admin.js';
import managerRoutes from './managers.js';
import postRoutes from './posts.js';
import { getRealtimeStatus } from '../realtime/index.js';

// Root route
router.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the VolunteerHub API!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      events: '/api/events',
      registrations: '/api/registrations',
      examples: '/api/examples'
    }
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    realtime: getRealtimeStatus()
  });
});

// API routes
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/events', eventRoutes);
router.use('/api/registrations', registrationRoutes);
router.use('/api/examples', exampleRoutes);
router.use('/api/admin', adminRoutes);
router.use('/api/managers', managerRoutes);
router.use('/api', postRoutes);

export default router;
