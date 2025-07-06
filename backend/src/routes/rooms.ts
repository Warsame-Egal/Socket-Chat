// Express routes for managing chat rooms
import { Router } from 'express';
import RoomService from '../services/RoomService';
import requireAuth from '../middleware/requireAuth';
import RedisRoomMembershipRepository from '../repositories/RedisRoomMembershipRepository';

const router = Router();
const roomService = new RoomService();

// Retrieve a list of rooms
router.get('/', async (_req, res) => {
  try {
    const rooms = await roomService.listRooms();
    res.json(rooms);
  } catch (err) {
    console.error('Failed to list rooms:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Retrieve rooms with their latest message
router.get('/latest', async (_req, res) => {
  try {
    const rooms = await roomService.listRoomsWithLatest();
    res.json(rooms);
  } catch (err) {
    console.error('Failed to list rooms with latest:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new room
router.post('/', requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ message: 'Room name required' });
    return;
  }
  try {
    const room = await roomService.createRoom(name, (req as any).userId);
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

// Remove a room by id
router.delete('/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }
  try {
    await roomService.deleteRoomWithData(id, (req as any).userId);
    res.sendStatus(204);
  } catch (err) {
    console.error('Failed to delete room:', err);
    if ((err as any).message === 'Forbidden') {
      res.status(403).json({ message: 'Forbidden' });
    } else if ((err as any).message === 'Room not found') {
      res.status(404).json({ message: 'Room not found' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Leave a room
router.post('/:name/leave', requireAuth, async (req, res) => {
  const roomName = req.params.name;
  const repo = new RedisRoomMembershipRepository();
  try {
    await repo.removeUserFromRoom((req as any).userId, roomName);
    res.sendStatus(204);
  } catch (err) {
    console.error('Failed to leave room:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;