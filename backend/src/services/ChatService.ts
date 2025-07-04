import MessageRepository from '../repositories/MessageRepository';
import pool from '../db';

export default class ChatService {
  constructor(private messageRepo = new MessageRepository()) {}

  async saveMessage(room: string, authorId: number, content: string) {
    await this.messageRepo.create(room, authorId, content);
  }

  async getHistory(room: string) {
    const result = await pool.query(
      `SELECT content AS message, sent_at AS time, u.username AS author
       FROM messages m
       JOIN users u ON m.author_id = u.id
       WHERE room = $1
       ORDER BY sent_at ASC
       LIMIT 50`,
      [room]
    );
    return result.rows;
  }
}