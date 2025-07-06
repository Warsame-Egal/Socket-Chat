-- Add creator_id column to rooms table
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS creator_id INTEGER REFERENCES users(id);
