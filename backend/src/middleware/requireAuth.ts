import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export default function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token || (req.headers.authorization?.split(' ')[1] ?? '');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    (req as any).userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
}
