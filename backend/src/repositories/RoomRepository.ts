// Repository for interacting with chat room records
import pool from '../db';
import { Room } from '../models/Room';

export default class RoomRepository {
  // Insert a new chat room and return it
  async create(name: string, creatorId: number): Promise<Room> {
    const result = await pool.query<Room>(
      'INSERT INTO rooms (name, creator_id) VALUES ($1, $2) RETURNING id, name, creator_id, created_at',
      [name, creatorId]
    );
    return result.rows[0];
  }

  // Find a room by its name
  async findByName(name: string): Promise<Room | null> {
    const result = await pool.query<Room>(
      'SELECT id, name, creator_id, created_at FROM rooms WHERE name = $1',
      [name]
    );
    return result.rows[0] || null;
  }

  async findById(id: number): Promise<Room | null> {
    const result = await pool.query<Room>(
      'SELECT id, name, creator_id, created_at FROM rooms WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  // Return list of all rooms
  async list(): Promise<Room[]> {
    const result = await pool.query<Room>(
      'SELECT id, name, creator_id, created_at FROM rooms ORDER BY created_at ASC'
    );
    return result.rows;
  }

  // Delete a room by id
  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM rooms WHERE id = $1', [id]);
  }
}