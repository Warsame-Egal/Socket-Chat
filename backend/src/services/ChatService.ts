// Provides higher level chat operations used by WebSocket handlers
import MessageRepository from '../repositories/MessageRepository';
import RedisMessageRepository from '../repositories/RedisMessageRepository';
import UserRepository from '../repositories/UserRepository';
import RedisUserRepository from '../repositories/RedisUserRepository';
import pool from '../db';

export default class ChatService {
  constructor(
    private messageRepo = new MessageRepository(),
    private redisMessageRepo = new RedisMessageRepository(),
    private userRepo = new UserRepository(),
    private redisUserRepo = new RedisUserRepository()
  ) {}  

  // Persist a chat message
  async saveMessage(room: string, authorId: number, content: string) {
    await Promise.all([
      this.messageRepo.create(room, authorId, content),
      this.redisMessageRepo.create(room, authorId, content),
    ]);  }

  // Retrieve the last 50 messages from a room
  async getHistory(room: string) {
    const redisMessages = await this.redisMessageRepo.getByRoom(room, 50);
      if (redisMessages.length === 0) {
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

    const transformed = [] as { message: string; time: Date; author: string }[];
    for (const entry of redisMessages) {
      let user = await this.redisUserRepo.findById(entry.from);
      if (!user) {
        user = await this.userRepo.findById(entry.from);
        if (user) {
          await this.redisUserRepo.cacheUser(user);
        }
      }
      transformed.push({
        message: entry.message,
        time: new Date(entry.date),
        author: user ? user.username : 'Unknown',
      });
    }
    return transformed;
  }
}