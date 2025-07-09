// Main server file that sets up Express and Socket.IO
// and wires up all API and WebSocket handlers.
import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import roomRoutes from "./routes/rooms";
import authRoutes from "./routes/auth";
import ChatService from "./services/ChatService";
import RoomService from "./services/RoomService";
import logger from "./logger";

dotenv.config();

const app = express();
// Pull configuration from environment variables with sensible defaults
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Middleware
// Express middleware configuration
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/rooms", roomRoutes);

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
// Intercept socket connections and validate JWT tokens
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  logger.info(`Received token: ${token}`);

   if (!token) {
    return next(new Error("Token missing"));
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    socket.data.userId = payload.userId;
    next();
  } catch (err) {
    logger.error(`Socket auth failed: ${err}`);
    next(new Error("Unauthorized"));
  }
});

const userMap = new Map<string, { username: string; room: string }>();
const roomUsers = new Map<string, Set<string>>();
const chatService = new ChatService();
const roomService = new RoomService();

// Handle a new client connection and register event listeners
io.on("connection", (socket: Socket) => {
  logger.info(`User Connected: ${socket.id}`);

  // User is joining a chat room
  socket.on("join_room", async (data: { room: string; username: string }) => {
    const { room, username } = data;
    roomService
      .createRoom(room, socket.data.userId)
      .catch((err) => logger.error(`Error creating room: ${err}`));
    await roomService.addMember(room, socket.data.userId);
    socket.join(room);
    userMap.set(socket.id, { username, room });

    // Track users per room
    const users = roomUsers.get(room) || new Set<string>();
    users.add(username);
    roomUsers.set(room, users);

    logger.info(`User ${username} joined room: ${room}`);

    // Notify room
    socket.to(room).emit("receive_message", {
      room,
      id: "system",
      author: "System",
      message: `${username} has joined the chat.`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    // Send chat history using service
    chatService
      .getHistory(room)
      .then((history) => {
        socket.emit("chat_history", history);
      })
      .catch((err) => logger.error(`Error loading chat history: ${err}`));
      
    io.to(room).emit("user_list", Array.from(users));
  });

  // Broadcast a chat message to the room
  socket.on("send_message", (data: {
    room: string;
    id: string;
    author: string;
    message: string;
    time: string;
  }) => {
    chatService
      .saveMessage(data.room, socket.data.userId, data.message)
      .catch((err) => logger.error(`Error saving message: ${err}`));

    socket.to(data.room).emit("receive_message", data);
  });

  // Notify others that a user is typing
  socket.on("typing", (data: { room: string; username: string }) => {
    socket.to(data.room).emit("typing", data.username);
  });

  socket.on("leave_room", async (data: { room: string; username: string }) => {
    const { room, username } = data;
    socket.leave(room);
    await roomService.removeMember(room, socket.data.userId);
    const users = roomUsers.get(room);
    if (users) {
      users.delete(username);
      if (users.size === 0) roomUsers.delete(room);
      io.to(room).emit("user_list", Array.from(users));
    }
    socket.to(room).emit("receive_message", {
      room,
      id: "system",
      author: "System",
      message: `${username} has left the chat.`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  });

  // Clean up when a user disconnects
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

      roomService
        .removeMember(room, socket.data.userId)
        .catch((err) => logger.error(`Error removing member: ${err}`));
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

    logger.info(`User Disconnected: ${socket.id}`);
  });
});

// Start the HTTP/WebSocket server
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});