// Representation of a user row in the database
export interface User {
  id: number;
  username: string;
  password_hash: string;
}