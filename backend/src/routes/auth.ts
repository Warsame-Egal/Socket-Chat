import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Username and password are required" });
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
    [username, hash]
  );
  res.sendStatus(201);
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: "Username and password are required" });
    return;
  }
  const result = await pool.query(
    "SELECT * FROM users WHERE username = $1",
    [username]
  );
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  res.cookie("token", token, { httpOnly: true }).json({ token });
});


export default router;