import pool from '../db';
import { Message } from '../models/Message';

export default class MessageRepository {
  async create(room: string, authorId: number, content: string): Promise<void> {
    await pool.query('INSERT INTO messages (room, author_id, content) VALUES ($1, $2, $3)', [room, authorId, content]);
  }

  async getByRoom(room: string, limit = 50): Promise<Message[]> {
    const result = await pool.query<Message>(
      `SELECT m.id, m.room, m.author_id, m.content, m.sent_at
       FROM messages m
       WHERE m.room = $1
       ORDER BY m.sent_at ASC
       LIMIT $2`,
      [room, limit]
    );
    return result.rows;
  }
}