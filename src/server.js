import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/db.js";
import adminRouter from "./admin/index.js";
import authRoutes from "./routes/auth.js";
import adminLoginRouter from "./routes/adminLogin.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "session_secret",
    resave: false,
    saveUninitialized: true,
  })
);

// API routes
app.use("/api", authRoutes);

// Dev-friendly admin login page: GET /admin/login
app.use(adminLoginRouter);

// Admin 
// Compatibility middleware: rewrite older/capitalized resource ids to actual ids
app.use((req, res, next) => {
  try {
    // Map of possible incoming resource ids -> actual registered AdminJS ids
    const map = {
      Category: "categories",
      Product: "products",
      User: "users",
      Order: "orders",
      OrderItem: "order_items",
      Setting: "settings",
    };

    const match = req.url.match(/^\/admin\/api\/resources\/([^\/]+)\//);
    if (match) {
      const incoming = match[1];
      if (map[incoming]) {
        req.url = req.url.replace(`/admin/api/resources/${incoming}/`, `/admin/api/resources/${map[incoming]}/`);
      }
    }
  } catch (e) {
    // ignore and continue
  }
  next();
});

app.use(adminRouter);

// Health
app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");
    await sequelize.sync({ alter: true }); // dev only
    // seed admin if none found
    const { User } = await import("./models/index.js");
    const admin = await User.findOne({ where: { role: "admin" } });
    if (!admin) {
      const bcrypt = (await import("bcrypt")).default;
      const hash = await bcrypt.hash("adminpass", 10);
      await User.create({
        name: "Admin",
        email: "admin@example.com",
        password_hash: hash,
        role: "admin",
      });
      console.log("Seeded admin: admin@example.com / adminpass");
    }

    app.listen(PORT, () =>
      console.log(`Server started at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
