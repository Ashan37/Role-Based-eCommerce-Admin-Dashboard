import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/db.js";

import { adminJs, adminJsRouter } from "./admin/index.js";
import authRoutes from "./routes/auth.js";
import adminLoginRouter from "./routes/adminLogin.js";
import { adminJwtMiddleware } from "./auth.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "session_secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/api", authRoutes);

app.use(adminLoginRouter);

app.get("/admin", (req, res) => {
  console.log("Redirecting /admin root to /admin/dashboard");
  res.redirect("/admin/dashboard");
});

app.use((req, res, next) => {
  if (!req.path.startsWith("/admin")) {
    return next();
  }

  if (req.path === "/admin/login") {
    return next();
  }

  console.log("🔍 Checking JWT for path:", req.path);

  adminJwtMiddleware(req, res, (err) => {
    if (err) {
      console.log("JWT middleware error:", err);
      return next(err);
    }

    if (req.user) {
      console.log("JWT valid - User:", req.user.email, "Role:", req.user.role);
      if (!req.session) {
        console.log("⚠️  No session object!");
        req.session = {};
      }
      req.session.adminUser = req.user;
      console.log("Session set:", req.session.adminUser);
    } else {
      console.log("No valid JWT token - redirecting to login");
      return res.redirect("/admin/login");
    }
    next();
  });
});

app.use(adminJsRouter);
console.log("AdminJS mounted at", adminJs.options.rootPath);

app.get("/health", (req, res) => res.json({ ok: true }));

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`Server started at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
