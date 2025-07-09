// Express routes related to authentication
import { Router } from 'express';
import AuthService from '../services/AuthService';
import logger from '../logger';

const router = Router();
const authService = new AuthService();

// Create a new user account
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }
  try {
    await authService.register(username, password);
    res.sendStatus(201);
  } catch (err: any) {
    if (err.message === 'Username already taken') {
      res.status(409).json({ message: err.message });
    } else {
      logger.error(`Registration failed: ${err}`);
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Authenticate an existing user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }
  try {
    const { token } = await authService.login(username, password);
    res.cookie('token', token, { httpOnly: true }).json({ token });
  } catch {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Clear the auth cookie and log the user out
router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

export default router;