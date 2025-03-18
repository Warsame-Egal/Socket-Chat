import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Enable CORS to allow frontend to communicate with backend
app.use(cors({ origin: "http://localhost:5000", credentials: true }));

// Middleware for parsing JSON requests
app.use(express.json());

// Middleware for handling cookies
app.use(cookieParser());

// Define a route for testing API status
app.get("/", (req: Request, res: Response) => {
  res.send("Chat API is running");
});

// Use dynamic port from environment variables, default to 5000
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
