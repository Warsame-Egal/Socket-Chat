import pool from '../db';

export default class MembershipRepository {
  async add(userId: number, roomId: number): Promise<void> {
    await pool.query('INSERT INTO memberships (user_id, room_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, roomId]);
  }

  async remove(userId: number, roomId: number): Promise<void> {
    await pool.query('DELETE FROM memberships WHERE user_id = $1 AND room_id = $2', [userId, roomId]);
  }

  async removeAllForRoom(roomId: number): Promise<void> {
    await pool.query('DELETE FROM memberships WHERE room_id = $1', [roomId]);
  }

  async isMember(userId: number, roomId: number): Promise<boolean> {
    const result = await pool.query('SELECT 1 FROM memberships WHERE user_id = $1 AND room_id = $2', [userId, roomId]);
    return (result.rowCount ?? 0) > 0;
  }
}