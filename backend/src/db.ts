// PostgreSQL connection pool used throughout the backend
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  // Use environment variables for database configuration
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "socketchat",
  port: parseInt(process.env.DB_PORT || "5432"),
});

// Log a message once the connection is established
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

export default pool;