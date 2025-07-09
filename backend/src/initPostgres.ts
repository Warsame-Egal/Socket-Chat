import dotenv from 'dotenv';
import pool from './db';
import bcrypt from 'bcrypt';
import { connectRedis } from './redisClient';
import logger from './logger';

dotenv.config();

interface DemoUser {
  username: string;
  password: string;
}

function parseDemoUsers(): DemoUser[] {
  const raw = process.env.DEMO_USERS || 'luffy:luffypass,zoro:zoropass';
  return raw.split(',').map((pair) => {
    const [username, password] = pair.split(':');
    return { username, password } as DemoUser;
  });
}

async function init() {
  const redis = await connectRedis();
  const demoUsers = parseDemoUsers();

  for (const { username, password } of demoUsers) {
    const userKey = await redis.get(`username:${username}`);
    if (!userKey) {
      logger.warn(`User ${username} not found in Redis, skipping`);
      continue;
    }
    const id = parseInt(userKey.split(':')[1], 10);
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (id, username, password_hash) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
      [id, username, hashedPassword]
    );
  }

  await pool.query(
    "SELECT setval(pg_get_serial_sequence('users','id'), (SELECT MAX(id) FROM users))"
  );

  logger.info('Postgres initialization complete');
  await redis.quit();
  await pool.end();
}

init().catch((err) => {
  logger.error(`Postgres initialization failed: ${err}`);
});