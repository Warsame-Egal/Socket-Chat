import { connectRedis } from '../redisClient';

export default class RedisRoomMembershipRepository {
  private async client() {
    return connectRedis();
  }

  async addUserToRoom(userId: number, room: string): Promise<void> {
    const client = await this.client();
    await Promise.all([
      client.sAdd(`user:${userId}:rooms`, room),
      client.sAdd(`room:${room}:users`, userId.toString()),
    ]);
  }

  async removeUserFromRoom(userId: number, room: string): Promise<void> {
    const client = await this.client();
    await Promise.all([
      client.sRem(`user:${userId}:rooms`, room),
      client.sRem(`room:${room}:users`, userId.toString()),
    ]);
  }

  async getUsersInRoom(room: string): Promise<number[]> {
    const client = await this.client();
    const members = await client.sMembers(`room:${room}:users`);
    return members.map((m) => parseInt(m, 10));
  }

  async removeRoom(room: string): Promise<void> {
    const client = await this.client();
    const members = await client.sMembers(`room:${room}:users`);
    for (const id of members) {
      await client.sRem(`user:${id}:rooms`, room);
    }
    await client.del(`room:${room}:users`);
  }
}
