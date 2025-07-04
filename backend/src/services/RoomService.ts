import RoomRepository from '../repositories/RoomRepository';

export default class RoomService {
  constructor(private roomRepo = new RoomRepository()) {}

  async createRoom(name: string) {
    const existing = await this.roomRepo.findByName(name);
    if (existing) {
      throw new Error('Room already exists');
    }
    return this.roomRepo.create(name);
  }

  listRooms() {
    return this.roomRepo.list();
  }

  deleteRoom(id: number) {
    return this.roomRepo.delete(id);
  }
}