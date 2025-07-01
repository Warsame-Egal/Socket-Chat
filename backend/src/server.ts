import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Chat API is running");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// Keep track of users
const userMap = new Map<string, { username: string; room: string }>();

io.on("connection", (socket: Socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data: { room: string; username: string }) => {
    const { room, username } = data;
    socket.join(room);
    userMap.set(socket.id, { username, room });

    console.log(`User with ID: ${socket.id} (${username}) joined room: ${room}`);

    socket.to(room).emit("receive_message", {
      room,
      id: "system",
      author: "System",
      message: `${username} has joined the chat.`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  });

  socket.on("send_message", (data: {
    room: string;
    id: string;
    author: string;
    message: string;
    time: string;
  }) => {
    socket.to(data.room).emit("receive_message", data);
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
    }

    console.log(`User Disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
