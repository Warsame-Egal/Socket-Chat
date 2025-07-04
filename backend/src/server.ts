import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import pool from "./db";
import authRoutes from "./routes/auth";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Chat API is running");
});

// Create HTTP and WebSocket server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true, // Cookies & auth
  },
});

// Socket authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log("Received token:", token);

  if (!token) {
    return next(new Error("Token missing"));
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    socket.data.userId = payload.userId;
    next();
  } catch (err) {
    console.error("Socket auth failed:", err);
    next(new Error("Unauthorized"));
  }
});

const userMap = new Map<string, { username: string; room: string }>();
const roomUsers = new Map<string, Set<string>>();

io.on("connection", (socket: Socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data: { room: string; username: string }) => {
    const { room, username } = data;
    socket.join(room);
    userMap.set(socket.id, { username, room });

    // Track users per room
    const users = roomUsers.get(room) || new Set<string>();
    users.add(username);
    roomUsers.set(room, users);

    console.log(`User ${username} joined room: ${room}`);

    // Notify room
    socket.to(room).emit("receive_message", {
      room,
      id: "system",
      author: "System",
      message: `${username} has joined the chat.`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    // Send chat history
    pool
      .query(
        `SELECT content AS message, sent_at AS time, u.username AS author
         FROM messages m
         JOIN users u ON m.author_id = u.id
         WHERE room = $1
         ORDER BY sent_at ASC
         LIMIT 50`,
        [room]
      )
      .then((result) => {
        socket.emit("chat_history", result.rows);
      })
      .catch((err) => console.error("Error loading chat history:", err));
      
    io.to(room).emit("user_list", Array.from(users));
  });

  socket.on("send_message", (data: {
    room: string;
    id: string;
    author: string;
    message: string;
    time: string;
  }) => {
    pool
      .query(
        "INSERT INTO messages (room, author_id, content) VALUES ($1, $2, $3)",
        [data.room, socket.data.userId, data.message]
      )
      .catch((err) => console.error("Error saving message:", err));

    socket.to(data.room).emit("receive_message", data);
  });

    socket.on("typing", (data: { room: string; username: string }) => {
    socket.to(data.room).emit("typing", data.username);
  });

  socket.on("disconnect", () => {
    const user = userMap.get(socket.id);
    if (user) {
      const { username, room } = user;

      socket.to(room).emit("receive_message", {
        room,
        id: "system",
        author: "System",
        message: `${username} has left the chat.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });

      userMap.delete(socket.id);
      
      const users = roomUsers.get(room);
      if (users) {
        users.delete(username);
        if (users.size === 0) {
          roomUsers.delete(room);
        }
        io.to(room).emit("user_list", Array.from(users));
      }
    }

    console.log(`User Disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
