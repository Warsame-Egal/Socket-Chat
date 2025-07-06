// Express routes for managing chat rooms
import { Router } from 'express';
import RoomService from '../services/RoomService';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = Router();
const roomService = new RoomService();

// Retrieve a list of rooms
router.get('/', verifyToken, async (_req, res) => {
  try {
    const rooms = await roomService.listRooms();
    res.json(rooms);
  } catch (err) {
    console.error('Failed to list rooms:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Retrieve rooms with their latest message
router.get('/latest', verifyToken, async (_req, res) => {
  try {
    const rooms = await roomService.listRoomsWithLatest();
    res.json(rooms);
  } catch (err) {
    console.error('Failed to list rooms with latest:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new room
router.post('/', verifyToken, async (req: AuthRequest, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ message: 'Room name required' });
    return;
  }
  try {
    const room = await roomService.createRoom(name, req.userId!);
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
router.delete('/:id', verifyToken, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }
  try {
    await roomService.deleteRoom(id, req.userId!);
    res.sendStatus(204);
  } catch (err) {
    console.error('Failed to delete room:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave a room
router.post('/:name/leave', verifyToken, async (req: AuthRequest, res) => {
  const roomName = req.params.name;
  try {
    await roomService.removeMember(roomName, req.userId!);
    res.sendStatus(204);
  } catch (err) {
    console.error('Failed to leave room:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;