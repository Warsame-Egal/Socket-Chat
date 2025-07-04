import pool from '../db';
import { User } from '../models/User';

export default class UserRepository {
  async findByUsername(username: string): Promise<User | null> {
    const result = await pool.query<User>('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  }

  async create(username: string, passwordHash: string): Promise<void> {
    await pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [username, passwordHash]);
  }

  async findById(id: number): Promise<User | null> {
    const result = await pool.query<User>('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }
}