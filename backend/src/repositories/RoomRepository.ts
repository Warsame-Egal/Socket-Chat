import pool from '../db';
import { Room } from '../models/Room';

export default class RoomRepository {
  async create(name: string): Promise<Room> {
    const result = await pool.query<Room>(
      'INSERT INTO rooms (name) VALUES ($1) RETURNING id, name, created_at',
      [name]
    );
    return result.rows[0];
  }

  async findByName(name: string): Promise<Room | null> {
    const result = await pool.query<Room>(
      'SELECT id, name, created_at FROM rooms WHERE name = $1',
      [name]
    );
    return result.rows[0] || null;
  }

  async list(): Promise<Room[]> {
    const result = await pool.query<Room>(
      'SELECT id, name, created_at FROM rooms ORDER BY created_at ASC'
    );
    return result.rows;
  }

  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM rooms WHERE id = $1', [id]);
  }
}