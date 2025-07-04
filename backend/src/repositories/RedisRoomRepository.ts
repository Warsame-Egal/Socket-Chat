// Redis-backed repository for user records and caching
import { connectRedis } from '../redisClient';
import { User } from '../models/User';

export default class RedisUserRepository {
  private async client() {
    return connectRedis();
  }

  async cacheUser(user: User): Promise<void> {
    const client = await this.client();
    const key = `user:${user.id}`;
    await client.set(`username:${user.username}`, key);
    await client.hSet(key, { username: user.username, password: user.password_hash });
  }

  async findByUsername(username: string): Promise<User | null> {
    const client = await this.client();
    const key = await client.get(`username:${username}`);
    if (!key) return null;
    const data = await client.hGetAll(key);
    if (!data.username || !data.password) return null;
    const id = parseInt(key.split(':')[1], 10);
    return { id, username: data.username, password_hash: data.password };
  }

  async create(username: string, passwordHash: string): Promise<number> {
    const client = await this.client();
    const id = await client.incr('total_users');
    const key = `user:${id}`;
    await client.set(`username:${username}`, key);
    await client.hSet(key, { username, password: passwordHash });
    return id;
  }

  async findById(id: number): Promise<User | null> {
    const client = await this.client();
    const data = await client.hGetAll(`user:${id}`);
    if (!data.username || !data.password) return null;
    return { id, username: data.username, password_hash: data.password };
  }
}