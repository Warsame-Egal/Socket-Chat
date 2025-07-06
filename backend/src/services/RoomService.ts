// Business logic for managing chat rooms
import RoomRepository from '../repositories/RoomRepository';
import ChatService from './ChatService';
import MessageRepository from '../repositories/MessageRepository';
import RedisMessageRepository from '../repositories/RedisMessageRepository';
import RedisRoomMembershipRepository from '../repositories/RedisRoomMembershipRepository';

export default class RoomService {
  constructor(private roomRepo = new RoomRepository()) {}

  // Create a room if it doesn't already exist
  async createRoom(name: string, creatorId: number) {
    const existing = await this.roomRepo.findByName(name);
    if (existing) {
      throw new Error('Room already exists');
    }
    return this.roomRepo.create(name, creatorId);
  }

  // Return all existing rooms
  listRooms() {
    return this.roomRepo.list();
  }

  // Return rooms with their latest message
  async listRoomsWithLatest(chatService = new ChatService()) {
    const rooms = await this.roomRepo.list();
    const result = [] as any[];
    for (const room of rooms) {
      const latest = await chatService.getLatestMessage(room.name);
      result.push({ ...room, latestMessage: latest });
    }
    return result;
  }

  // Permanently remove a room
  async deleteRoom(id: number) {
    return this.roomRepo.delete(id);
  }

  // Delete a room and all associated data, ensuring the user is the creator
  async deleteRoomWithData(id: number, userId: number) {
    const room = await this.roomRepo.findById(id);
    if (!room) throw new Error('Room not found');
    if (room.creator_id !== userId) throw new Error('Forbidden');

    const messageRepo = new MessageRepository();
    const redisMessageRepo = new RedisMessageRepository();
    const membershipRepo = new RedisRoomMembershipRepository();

    await Promise.all([
      messageRepo.deleteByRoom(room.name),
      redisMessageRepo.deleteByRoom(room.name),
      membershipRepo.removeRoom(room.name),
    ]);

    await this.roomRepo.delete(id);
  }
}