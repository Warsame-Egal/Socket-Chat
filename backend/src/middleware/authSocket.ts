// Middleware to authenticate incoming Socket.IO connections using JWT
import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export function verifySocket(socket: Socket, next: (err?: Error) => void) {
  // Read token sent during the handshake
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication required"));
  }
  try {
    // Attach the user id from the token to the socket instance
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    socket.data.userId = payload.userId;
    next();
  } catch {
    // Token validation failed
    next(new Error("Invalid token"));
  }
}