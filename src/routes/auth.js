import express from "express";
import bcrypt from "bcrypt";
import { signJwt } from "../auth.js";
import { User } from "../models/index.js";

const router = express.Router();

// POST /api/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "email & password required" });

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: "invalid credentials" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: "invalid credentials" });

  const token = signJwt({ id: user.id, email: user.email, role: user.role });

  // set cookie (so browser-based AdminJS can pick it up)
  res.cookie(process.env.ADMIN_COOKIE_NAME || "adminToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 8,
  });

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

export default router;
