// Chat room details stored in the database
export interface Room {
  id: number;
  name: string;
  created_at: Date;
  creator_id: number;
}