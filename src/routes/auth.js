import express from "express";
import bcrypt from "bcrypt";
import { signJwt } from "../auth.js";
import { User } from "../models/index.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  console.log("Login attempt:", req.body.email);
  const { email, password } = req.body;
  if (!email || !password) {
    console.log("Missing credentials");
    return res.status(400).json({ message: "Email & password required" });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    console.log("User not found:", email);
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    console.log("Invalid password for:", email);
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = signJwt({ id: user.id, email: user.email, role: user.role });
  console.log("Login successful:", email, "Role:", user.role);
  console.log("Setting cookie with token");

  res.cookie(process.env.ADMIN_COOKIE_NAME || "adminToken", token, {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 8,
    path: "/",
  });

  console.log("Sending response with user data");
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

export default router;
