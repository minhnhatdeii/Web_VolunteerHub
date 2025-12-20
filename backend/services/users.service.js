import bcrypt from 'bcrypt';
import { findById, updateById } from '../repositories/user.repo.js';
import { supabase } from '../config/supabase.js';

const baseSelect = {
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
  updatedAt: true,
};

export async function getMeService(userId) {
  const user = await findById(userId, baseSelect);
  if (!user) return { error: 404, message: 'User not found' };
  return { user };
}

export async function updateMeService(userId, payload) {
  console.log('updateMeService called with userId:', userId);
  console.log('updateMeService payload:', JSON.stringify(payload));

  const { firstName, lastName, bio, avatarUrl, pushNotifications, currentPassword, newPassword } = payload || {};
  const data = {};
  if (firstName !== undefined && firstName !== null) data.firstName = firstName;
  if (lastName !== undefined && lastName !== null) data.lastName = lastName;
  if (bio !== undefined) data.bio = bio;
  if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
  if (pushNotifications !== undefined) data.pushNotifications = pushNotifications;

  // Ensure data was built correctly
  console.log('updateMeService data to update:', JSON.stringify(data));

  if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
    return { error: 400, message: 'Both currentPassword and newPassword are required to update password' };
  }

  if (currentPassword && newPassword) {
    const current = await findById(userId, { password: true });
    if (!current) return { error: 404, message: 'User not found' };
    const ok = await bcrypt.compare(currentPassword, current.password);
    if (!ok) return { error: 400, message: 'Current password is incorrect' };
    const saltRounds = 10;
    data.password = await bcrypt.hash(newPassword, saltRounds);
  }

  if (Object.keys(data).length === 0) {
    console.log('updateMeService: No data to update, returning current user');
    const currentUser = await findById(userId, baseSelect);
    return { user: currentUser };
  }

  console.log('updateMeService: executing updateById with data keys:', Object.keys(data));
  const updatedUser = await updateById(userId, data, baseSelect);
  console.log('updateMeService updatedUser:', JSON.stringify(updatedUser));
  return { user: updatedUser };
}

export async function uploadAvatarService(userId, { dataUrl, base64, contentType }) {
  console.log('uploadAvatarService called with:', { userId, hasDataUrl: !!dataUrl, hasBase64: !!base64, contentType });

  let fileBuffer;
  let mimeType = contentType || 'image/jpeg';
  if (dataUrl && typeof dataUrl === 'string') {
    console.log('dataUrl length:', dataUrl.length, 'starts with:', dataUrl.substring(0, 50));
    const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
    if (!match) {
      console.error('Invalid dataUrl format - regex failed');
      return { error: 400, message: 'Invalid dataUrl format' };
    }
    mimeType = match[1] || mimeType;
    fileBuffer = Buffer.from(match[2], 'base64');
  } else if (base64 && typeof base64 === 'string') {
    fileBuffer = Buffer.from(base64, 'base64');
  } else {
    console.error('No dataUrl or base64 provided');
    return { error: 400, message: 'Provide dataUrl or base64 image data' };
  }
  if (!fileBuffer || fileBuffer.length === 0) return { error: 400, message: 'Empty file data' };

  const ext = (mimeType.split('/')[1] || 'jpg').toLowerCase();
  const fileName = `${userId}_avatar.${ext}`;
  const filePath = `avatars/${userId}/${fileName}`;

  console.log('Uploading to Supabase bucket user-avatar, path:', filePath);
  const { error: uploadError, data: uploadData } = await supabase
    .storage
    .from('user-avatar')
    .upload(filePath, fileBuffer, { contentType: mimeType, upsert: true });
  if (uploadError) {
    console.error('Supabase upload error:', uploadError);
    return { error: 500, message: `Upload failed: ${uploadError.message}` };
  }

  console.log('Supabase upload SUCCESS, uploadData:', uploadData);

  const { data: publicUrlData } = supabase
    .storage
    .from('user-avatar')
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData?.publicUrl;
  console.log('Public URL:', publicUrl);

  const updatedUser = await updateById(userId, { avatarUrl: publicUrl }, baseSelect);
  console.log('User updated with new avatarUrl');
  return { user: updatedUser, file: { path: uploadData?.path, publicUrl } };
}

export async function getUserByIdService(id) {
  const user = await findById(id, baseSelect);
  if (!user) return { error: 404, message: 'User not found' };
  return { user };
}

export async function lockUserService(id, isLocked, actorId) {
  const target = await findById(id, { id: true });
  if (!target) return { error: 404, message: 'User not found' };
  if (id === actorId) return { error: 400, message: 'Cannot lock your own account' };
  const updated = await updateById(id, { isLocked }, { id: true, email: true, firstName: true, lastName: true, role: true, isLocked: true });
  return { user: updated };
}

export async function updateUserByIdService(id, payload) {
  const { firstName, lastName, bio, avatarUrl, role, pushNotifications } = payload || {};
  const data = {};
  if (firstName) data.firstName = firstName;
  if (lastName) data.lastName = lastName;
  if (bio !== undefined) data.bio = bio;
  if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
  if (role) data.role = role;
  if (pushNotifications !== undefined) data.pushNotifications = pushNotifications;
  const updated = await updateById(id, data, baseSelect);
  return { user: updated };
}

