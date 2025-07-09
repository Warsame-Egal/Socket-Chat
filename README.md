# Socket Chat

A chat application built with Node.js, Express, TypeScript, Socket.IO, Redis, and React.
Messages are transmitted using WebSockets, with Redis used for temporary caching.
PostgreSQL stores user data and chat history, while JWT (JSON Web Tokens) is used for secure user authentication.

## Architecture

The backend uses the Repository pattern to separate data access from business
logic. Redis-specific repositories like `RedisUserRepository` and
`RedisMessageRepository` handle caching and real-time operations, while
`UserRepository`, `MessageRepository`, and others store persistent data in
PostgreSQL. Higher-level services such as `ChatService` compose these
repositories, keeping the codebase modular, testable and simple to extend.

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

#### Initialize demo users in Postgres:

```bash
npm run init-db
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
