import bcrypt from 'bcrypt';
import { create, findByEmail, findById } from '../repositories/user.repo.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

export async function registerService({ email, password, firstName, lastName, role = 'VOLUNTEER' }) {
  const existing = await findByEmail(email);
  if (existing) {
    return { error: 409, message: 'User with this email already exists' };
  }
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Only allow VOLUNTEER and MANAGER roles during registration (prevent users from registering as admin)
  // Normalize role to uppercase for comparison
  const roleToCheck = role ? role.toUpperCase() : 'VOLUNTEER';
  const allowedRole = ['VOLUNTEER', 'MANAGER'].includes(roleToCheck) ? roleToCheck : 'VOLUNTEER';

  const user = await create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    role: allowedRole
  }, {
    id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true, updatedAt: true
  });
  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id });
  return { user, accessToken, refreshToken };
}

export async function loginService({ email, password }) {
  const user = await findByEmail(email, {
    id: true, email: true, password: true, firstName: true, lastName: true, role: true, isLocked: true, createdAt: true, updatedAt: true
  });
  if (!user) return { error: 401, message: 'Invalid email or password' };
  if (user.isLocked) return { error: 401, message: 'Account is locked' };
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return { error: 401, message: 'Invalid email or password' };
  const { password: _pw, ...userWithoutPassword } = user;
  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id });
  return { user: userWithoutPassword, accessToken, refreshToken };
}

export async function refreshService(refreshToken) {
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) return { error: 403, message: 'Invalid or expired refresh token' };
  const user = await findById(decoded.userId, { id: true, email: true, role: true, isLocked: true });
  if (!user || user.isLocked) return { error: 401, message: 'User not found or account is locked' };
  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  return { accessToken };
}

