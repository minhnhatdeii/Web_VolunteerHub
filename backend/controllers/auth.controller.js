import { loginService, refreshService, registerService } from '../services/auth.service.js';

export async function register(req, res) {
  try {
    const { email, password, firstName, lastName } = req.body || {};
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, password, firstName, and lastName are required' });
    }
    const result = await registerService({ email, password, firstName, lastName });
    if (result.error) return res.status(result.error).json({ error: result.message });
    return res.status(201).json({ message: 'User registered successfully', ...result });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const result = await loginService({ email, password });
    if (result.error) return res.status(result.error).json({ error: result.message });
    return res.json({ message: 'Login successful', ...result });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
}

export async function refresh(req, res) {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token is required' });
    const result = await refreshService(refreshToken);
    if (result.error) return res.status(result.error).json({ error: result.message });
    return res.json({ message: 'Token refreshed successfully', accessToken: result.accessToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ error: 'Internal server error during token refresh' });
  }
}

