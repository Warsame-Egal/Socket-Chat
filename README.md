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

## Docker Compose

You can build and start the entire stack using Docker Compose. This will launch
Postgres, Redis, the backend API and the frontend server.

```bash
docker-compose up --build
```

Once running, access the app at:

```
http://localhost:5173
```

The backend API will be available on [http://localhost:5000](http://localhost:5000).
Docker Compose sets default credentials for Postgres and Redis as defined in
`docker-compose.yml`. Adjust the environment variables there if needed.
