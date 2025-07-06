// Logic for managing chat rooms
import RoomRepository from '../repositories/RoomRepository';
import ChatService from './ChatService';
import MembershipRepository from '../repositories/MembershipRepository';
import MessageRepository from '../repositories/MessageRepository';
import RedisMessageRepository from '../repositories/RedisMessageRepository';

export default class RoomService {
  constructor(
    private roomRepo = new RoomRepository(),
    private membershipRepo = new MembershipRepository(),
    private messageRepo = new MessageRepository(),
    private redisMessageRepo = new RedisMessageRepository()
  ) {}

  // Create a room if it doesn't already exist
  async createRoom(name: string, creatorId: number) {
    const existing = await this.roomRepo.findByName(name);
    if (existing) {
      throw new Error('Room already exists');
    }
    const room = await this.roomRepo.create(name, creatorId);
    await this.membershipRepo.add(creatorId, room.id);
    return room;
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
  async deleteRoom(id: number, requesterId: number) {
    const room = await this.roomRepo.findById(id);
    if (!room) throw new Error('Room not found');
    if (room.creator_id !== requesterId) {
      throw new Error('Not owner');
    }
    await Promise.all([
      this.membershipRepo.removeAllForRoom(id),
      this.messageRepo.deleteByRoom(room.name),
      this.redisMessageRepo.deleteByRoom(room.name),
      this.roomRepo.delete(id),
    ]);
  }

  async addMember(roomName: string, userId: number) {
    const room = await this.roomRepo.findByName(roomName);
    if (room) {
      await this.membershipRepo.add(userId, room.id);
    }
  }

  async removeMember(roomName: string, userId: number) {
    const room = await this.roomRepo.findByName(roomName);
    if (room) {
      await this.membershipRepo.remove(userId, room.id);
    }
  }
}