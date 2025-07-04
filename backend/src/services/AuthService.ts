// Business logic for registering and logging in users
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository';
import RedisUserRepository from '../repositories/RedisUserRepository';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export default class AuthService {
  // Use both Postgres and Redis repositories
  constructor(
    private userRepo = new UserRepository(),
    private redisRepo = new RedisUserRepository()
  ) {}

  // Create a new user record with hashed password
  async register(username: string, password: string): Promise<void> {
    let existing = await this.redisRepo.findByUsername(username);
    if (!existing) {
      existing = await this.userRepo.findByUsername(username);
      if (existing) {
        await this.redisRepo.cacheUser(existing);
      }
    }    if (existing) {
      throw new Error('Username already taken');
    }
    const hash = await bcrypt.hash(password, 10);
    await this.userRepo.create(username, hash);
    const created = await this.userRepo.findByUsername(username);
    if (created) {
      await this.redisRepo.cacheUser(created);
    }
  }

  // Verify user credentials and return a JWT
  async login(username: string, password: string): Promise<{ token: string }> {
    let user = await this.redisRepo.findByUsername(username);
    if (!user) {
      user = await this.userRepo.findByUsername(username);
      if (user) {
        await this.redisRepo.cacheUser(user);
      }
    }    if (!user) {
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