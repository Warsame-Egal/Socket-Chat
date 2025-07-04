import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export default class AuthService {
  constructor(private userRepo = new UserRepository()) {}

  async register(username: string, password: string): Promise<void> {
    const existing = await this.userRepo.findByUsername(username);
    if (existing) {
      throw new Error('Username already taken');
    }
    const hash = await bcrypt.hash(password, 10);
    await this.userRepo.create(username, hash);
  }

  async login(username: string, password: string): Promise<{ token: string }> {
    const user = await this.userRepo.findByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    return { token };
  }
}