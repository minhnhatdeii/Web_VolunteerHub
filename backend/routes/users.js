import express from 'express';
import { authenticateToken, authorizeRole, requireOwnResource } from '../middleware/auth.js';
import prisma from '../db.js';
import bcrypt from 'bcrypt';

const router = express.Router();

/**
 * Get current user profile
 * GET /api/users/me
 * Requires authentication
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatarUrl: true,
        role: true,
        isLocked: true,
        pushNotifications: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update current user profile
 * PUT /api/users/me
 * Requires authentication
 */
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, bio, avatarUrl, pushNotifications, currentPassword, newPassword } = req.body;

    // Build update data
    const updateData = {};
    
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (pushNotifications !== undefined) updateData.pushNotifications = pushNotifications;

    // Handle password update
    if (currentPassword && newPassword) {
      // Get current user to check password
      const currentUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { password: true }
      });

      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(newPassword, saltRounds);
    } else if (currentPassword || newPassword) {
      return res.status(400).json({ error: 'Both currentPassword and newPassword are required to update password' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatarUrl: true,
        role: true,
        isLocked: true,
        pushNotifications: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get user by ID
 * GET /api/users/:id
 * Requires authentication and appropriate role
 */
router.get('/:id', authenticateToken, authorizeRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatarUrl: true,
        role: true,
        isLocked: true,
        pushNotifications: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Lock/unlock user account
 * POST /api/users/:id/lock
 * Requires admin or manager role
 */
router.post('/:id/lock', authenticateToken, authorizeRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const { id } = req.params;
    const { isLocked } = req.body;

    if (typeof isLocked !== 'boolean') {
      return res.status(400).json({ error: 'isLocked field is required and must be a boolean' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent locking own account
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot lock your own account' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isLocked },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isLocked: true
      }
    });

    res.json({
      message: `User account ${isLocked ? 'locked' : 'unlocked'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Lock/unlock user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update user by ID
 * PUT /api/users/:id
 * Requires admin or manager role
 */
router.put('/:id', authenticateToken, authorizeRole(['ADMIN', 'MANAGER']), requireOwnResource('id'), async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, bio, avatarUrl, role, pushNotifications } = req.body;

    const updateData = {};
    
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (role) updateData.role = role;
    if (pushNotifications !== undefined) updateData.pushNotifications = pushNotifications;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatarUrl: true,
        role: true,
        isLocked: true,
        pushNotifications: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;