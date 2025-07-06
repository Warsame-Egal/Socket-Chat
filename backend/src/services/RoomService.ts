// Business logic for managing chat rooms
import RoomRepository from '../repositories/RoomRepository';
import ChatService from './ChatService';

export default class RoomService {
  constructor(private roomRepo = new RoomRepository()) {}

  // Create a room if it doesn't already exist
  async createRoom(name: string) {
    const existing = await this.roomRepo.findByName(name);
    if (existing) {
      throw new Error('Room already exists');
    }
    return this.roomRepo.create(name);
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
  deleteRoom(id: number) {
    return this.roomRepo.delete(id);
  }
}