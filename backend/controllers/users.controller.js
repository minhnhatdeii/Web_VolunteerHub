import { getMeService, updateMeService, uploadAvatarService, getUserByIdService, lockUserService, updateUserByIdService } from '../services/users.service.js';

export async function getMe(req, res) {
  try {
    const result = await getMeService(req.user.id);
    if (result.error) return res.status(result.error).json({ error: result.message });
    return res.json({ success: true, data: result.user });
  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateMe(req, res) {
  try {
    console.log('updateMe controller received body:', JSON.stringify(req.body));
    const result = await updateMeService(req.user.id, req.body);
    if (result.error) return res.status(result.error).json({ error: result.message });
    return res.json({ success: true, data: result.user });
  } catch (error) {
    console.error('Update user profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function uploadAvatar(req, res) {
  try {
    const result = await uploadAvatarService(req.user.id, req.body || {});
    if (result.error) return res.status(result.error).json({ error: result.message });
    return res.json({ message: 'Avatar uploaded successfully', file: result.file, user: result.user });
  } catch (error) {
    console.error('Upload avatar error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getUserById(req, res) {
  try {
    const result = await getUserByIdService(req.params.id);
    if (result.error) return res.status(result.error).json({ error: result.message });
    return res.json(result.user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function lockUser(req, res) {
  try {
    const { isLocked } = req.body || {};
    if (typeof isLocked !== 'boolean') {
      return res.status(400).json({ error: 'isLocked field is required and must be a boolean' });
    }
    const result = await lockUserService(req.params.id, isLocked, req.user.id);
    if (result.error) return res.status(result.error).json({ error: result.message });
    return res.json({ message: `User account ${isLocked ? 'locked' : 'unlocked'} successfully`, user: result.user });
  } catch (error) {
    console.error('Lock/unlock user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateUserById(req, res) {
  try {
    const result = await updateUserByIdService(req.params.id, req.body);
    if (result.error) return res.status(result.error).json({ error: result.message });
    return res.json(result.user);
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

