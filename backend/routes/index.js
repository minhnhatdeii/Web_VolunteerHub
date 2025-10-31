import express from 'express';
const router = express.Router();

// Import route modules
import authRoutes from './auth.js';
import userRoutes from './users.js';
import eventRoutes from './events.js';
import registrationRoutes from './registrations.js';

// Root route
router.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the VolunteerHub API!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      events: '/api/events',
      registrations: '/api/registrations'
    }
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/events', eventRoutes);
router.use('/api/registrations', registrationRoutes);

export default router;