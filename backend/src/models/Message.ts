// Single chat message stored in the database
export interface Message {
  id: number;
  room: string;
  author_id: number;
  content: string;
  sent_at: Date;
}