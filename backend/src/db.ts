import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "chat_app",
  port: parseInt(process.env.DB_PORT || "5432"),
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

export default pool;
