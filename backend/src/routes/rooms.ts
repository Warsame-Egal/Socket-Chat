import { Router } from 'express';
import RoomService from '../services/RoomService';

const router = Router();
const roomService = new RoomService();

router.get('/', async (_req, res) => {
  try {
    const rooms = await roomService.listRooms();
    res.json(rooms);
  } catch (err) {
    console.error('Failed to list rooms:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ message: 'Room name required' });
    return;
  }
  try {
    const room = await roomService.createRoom(name);
    res.status(201).json(room);
  } catch (err: any) {
    if (err.message === 'Room already exists') {
      res.status(409).json({ message: err.message });
    } else {
      console.error('Failed to create room:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }
  try {
    await roomService.deleteRoom(id);
    res.sendStatus(204);
  } catch (err) {
    console.error('Failed to delete room:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;