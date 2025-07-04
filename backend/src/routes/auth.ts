import { Router } from 'express';
import AuthService from '../services/AuthService';

const router = Router();
const authService = new AuthService();

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
      console.error('Registration failed:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
});

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

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

export default router;
