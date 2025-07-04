# Socket Chat

A real-time chat application built with Node.js, Express, TypeScript, Socket.IO, Redis, and React. Messages are transmitted using WebSockets. PostgreSQL is used for authentication and storage.

## Features

- Real-time messaging with Socket.IO
- Responsive front-end using React and Tailwind CSS
- Backend built with Node.js Express and TypeScript
- Redis-backed caching for rooms, users and chat history

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Warsame-Egal/Socket-Chat.git
cd Socket-Chat
```

---

### 2. Backend Setup

```bash
cd backend
```

#### Install dependencies:

```bash
npm install
```

```bash
cp .env.example .env
```

Set the Redis connection string in `.env` (if different from the default):

```env
REDIS_URL=redis://localhost:6379
```

Optionally customize the demo users seeded on initialization:

```env
DEMO_USERS=luffy:luffypass,zoro:zoropass
```

#### Initialize demo data in Redis:

```bash
npm run init-redis
```

#### Start the backend server:

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd ../frontend
```

Copy the example environment variables file:

```bash
cp .env.example .env
```

#### Install dependencies:

```bash
npm install
```

#### Start the front-end dev server:

```bash
npm run dev
```

Open your browser and go to:

```
http://localhost:5173
```

---

## Project Structure

```
Socket-Chat/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── db.ts
│   │   └── ...
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   └── ...
│   └── package.json
```
