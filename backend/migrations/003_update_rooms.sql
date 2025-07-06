-- Add creator_id to rooms and create memberships table
ALTER TABLE rooms
  ADD COLUMN creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

CREATE TABLE memberships (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);