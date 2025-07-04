// Business logic for managing chat rooms
import RoomRepository from '../repositories/RoomRepository';

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

  // Permanently remove a room
  deleteRoom(id: number) {
    return this.roomRepo.delete(id);
  }
}