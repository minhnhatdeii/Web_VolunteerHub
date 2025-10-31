import express from 'express';
const router = express.Router();

// Placeholder routes for authentication (to be implemented in Milestone 2)
router.post('/register', (req, res) => {
  res.status(501).json({ error: 'Register endpoint not implemented yet' });
});

router.post('/login', (req, res) => {
  res.status(501).json({ error: 'Login endpoint not implemented yet' });
});

router.post('/refresh', (req, res) => {
  res.status(501).json({ error: 'Refresh token endpoint not implemented yet' });
});

router.post('/logout', (req, res) => {
  res.status(501).json({ error: 'Logout endpoint not implemented yet' });
});

export default router;