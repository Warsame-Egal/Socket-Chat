import { connectRedis } from './redisClient';
import bcrypt from 'bcrypt';

interface DemoUser {
  username: string;
  password: string;
}

async function createUser(username: string, password: string) {
  const client = await connectRedis();
  const hashedPassword = await bcrypt.hash(password, 10);
  const nextId = await client.incr('total_users');
  const userKey = `user:${nextId}`;
  await client.set(`username:${username}`, userKey);
  await client.hSet(userKey, {
    username,
    password: hashedPassword,
  });
  await client.sAdd(`user:${nextId}:rooms`, '0');
  return nextId;
}

async function addMessage(roomId: string, from: number, message: string) {
  const client = await connectRedis();
  const date = Math.floor(Date.now() / 1000);
  const entry = JSON.stringify({ from, date, message, roomId });
  await client.zAdd(`room:${roomId}`, [{ score: date, value: entry }]);
}

function parseDemoUsers(): DemoUser[] {
  const raw = process.env.DEMO_USERS || 'luffy:luffypass,zoro:zoropass';
  return raw.split(',').map((pair) => {
    const [username, password] = pair.split(':');
    return { username, password } as DemoUser;
  });
}

async function init() {
  const client = await connectRedis();
  const exists = await client.exists('total_users');
  if (!exists) {
    await client.set('total_users', '0');
    await client.set('room:0:name', 'General');

    const demoUsers = parseDemoUsers();
    const userIds: number[] = [];
    for (const { username, password } of demoUsers) {
      const id = await createUser(username, password);
      userIds.push(id);
    }

    if (userIds.length >= 2) {
      const roomId = `${Math.min(userIds[0], userIds[1])}:${Math.max(
        userIds[0],
        userIds[1]
      )}`;
      await client.sAdd(`user:${userIds[0]}:rooms`, roomId);
      await client.sAdd(`user:${userIds[1]}:rooms`, roomId);

      await addMessage('0', userIds[0], 'Welcome to the general room');
      await addMessage(roomId, userIds[0], `Hello ${demoUsers[1].username}`);
      await addMessage(roomId, userIds[1], `Hi ${demoUsers[0].username}`);
    } else if (userIds.length === 1) {
      await addMessage('0', userIds[0], 'Welcome to the general room');
    }
  }
  console.log('Redis initialization complete');
  client.disconnect();
}

init().catch((err) => {
  console.error('Redis initialization failed', err);
});