import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import { sequelize } from "./config/db.js";
import { adminRouter } from "./admin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

//routes
app.use(adminRouter); // AdminJS routes

//test API
app.get("/api", (req, res) => {
  res.json({ message: "API running" });
});

// Sync DB and start server
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database connected and synced");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("DB sync error:", err));
