// Redis-backed repository for chat messages
import { connectRedis } from '../redisClient';

interface StoredMessage {
  from: number;
  date: number;
  message: string;
  roomId: string;
}

export default class RedisMessageRepository {
  // Add a message to the sorted set for the room
  async create(roomId: string, authorId: number, content: string): Promise<void> {
    const client = await connectRedis();
    const date = Date.now();
    const entry: StoredMessage = { from: authorId, date, message: content, roomId };
    await client.zAdd(`room:${roomId}`, [{ score: date, value: JSON.stringify(entry) }]);
  }

  // Retrieve the most recent messages from a room
  async getByRoom(roomId: string, limit = 50): Promise<StoredMessage[]> {
    const client = await connectRedis();
    const entries = await client.zRange(`room:${roomId}`, -limit, -1);
    return entries.map((e) => JSON.parse(e) as StoredMessage);
  }
  
  // Retrieve the latest message from a room
  async getLatestByRoom(roomId: string): Promise<StoredMessage | null> {
    const client = await connectRedis();
    const entry = await client.zRange(`room:${roomId}`, -1, -1);
    return entry[0] ? (JSON.parse(entry[0]) as StoredMessage) : null;
  }
}