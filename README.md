# Socket Chat

A real-time chat application built with Node.js, TypeScript, Express, Socket.IO, and React. Messages are transmitted using WebSockets. PostgreSQL will be added for authentication and storage.

## Features

- Real-time messaging with Socket.IO
- Responsive front-end using React and Tailwind CSS
- Backend built with Node.js Express and TypeScript

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

#### Start the backend server:

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd ../frontend
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
