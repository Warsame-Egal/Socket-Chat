-- Base user and message tables
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  room TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW()
);
