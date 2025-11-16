import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/db.js";
import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import AdminJSSequelize from "@adminjs/sequelize";
import { ComponentLoader } from "adminjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

import {
  User,
  Category,
  Product,
  Order,
  OrderItem,
  Setting,
} from "./models/index.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

const componentLoader = new ComponentLoader();
const DashboardComponent = componentLoader.add(
  "Dashboard",
  path.join(__dirname, "components", "dashboard")
);

AdminJS.registerAdapter({
  Resource: AdminJSSequelize.Resource,
  Database: AdminJSSequelize.Database,
});

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
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

const adminJs = new AdminJS({
  rootPath: "/admin",
  databases: [sequelize],
  componentLoader,
  resources: [
    {
      resource: User,
      options: {
        navigation: { name: "Management", icon: "User" },
        properties: {
          password_hash: { isVisible: false },
          password: {
            isVisible: { list: false, filter: false, show: false, edit: true },
          },
        },
        actions: {
          new: {
            before: async (request) => {
              if (request.payload?.password) {
                request.payload.password_hash = await bcrypt.hash(
                  request.payload.password,
                  10
                );
                delete request.payload.password;
              }
              return request;
            },
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === "admin",
          },
          edit: {
            before: async (request) => {
              if (request.payload?.password) {
                request.payload.password_hash = await bcrypt.hash(
                  request.payload.password,
                  10
                );
                delete request.payload.password;
              }
              return request;
            },
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === "admin",
          },
          delete: {
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === "admin",
          },
          list: {
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === "admin",
          },
          show: {
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === "admin",
          },
        },
      },
    },
    {
      resource: Category,
      options: {
        navigation: { name: "Store", icon: "Tag" },
        actions: {
          new: {
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === "admin",
          },
          edit: {
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === "admin",
          },
          delete: {
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === "admin",
          },
        },
      },
    },
    {
      resource: Product,
      options: {
        navigation: { name: "Store", icon: "ShoppingCart" },
        properties: {
          categoryId: { reference: "categories" },
        },
        actions: {
          new: {
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === "admin",
          },
          edit: {
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === "admin",
          },
          delete: {
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === "admin",
          },
        },
      },
    },
    {
      resource: Order,
      options: {
        navigation: { name: "Orders", icon: "List" },
        properties: {
          userId: { reference: "users" },
        },
        actions: {
          delete: {
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === "admin",
          },
        },
      },
    },
    {
      resource: OrderItem,
      options: {
        navigation: { name: "Orders", icon: "List" },
        properties: {
          productId: { reference: "products" },
          orderId: { reference: "orders" },
        },
        actions: {
          new: {
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === "admin",
          },
          edit: {
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === "admin",
          },
          delete: {
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === "admin",
          },
        },
      },
    },
    {
      resource: Setting,
      options: {
        navigation: { name: "Management", icon: "Settings" },
        actions: {
          new: {
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === "admin",
          },
          edit: {
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === "admin",
          },
          delete: {
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === "admin",
          },
          list: {
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === "admin",
          },
          show: {
            isAccessible: ({ currentAdmin }) => currentAdmin?.role === "admin",
          },
        },
      },
    },
  ],
  dashboard: {
    component: DashboardComponent,
    handler: async (request, response, context) => {
      const currentAdmin = context.currentAdmin;

      if (!currentAdmin) {
        return { message: "Please log in" };
      }

      try {
        const stats = {
          usersCount: await User.count(),
          categoriesCount: await Category.count(),
          productsCount: await Product.count(),
          ordersCount: await Order.count(),
          orderItemsCount: await OrderItem.count(),
          settingsCount: await Setting.count(),
        };

        const orders = await Order.findAll({ attributes: ["total"] });
        const totalRevenue = orders.reduce(
          (sum, order) => sum + parseFloat(order.total || 0),
          0
        );

        const recentOrders = await Order.findAll({
          limit: 5,
          order: [["createdAt", "DESC"]],
          raw: true,
        });

        const recentProducts = await Product.findAll({
          limit: 5,
          order: [["createdAt", "DESC"]],
          raw: true,
        });

        return {
          stats,
          totalRevenue: totalRevenue.toFixed(2),
          recentOrders,
          recentProducts,
          userRole: currentAdmin.role,
          userName: currentAdmin.email,
        };
      } catch (error) {
        console.error("Dashboard error:", error);
        return {
          error: "Failed to load dashboard data",
          message: error.message,
        };
      }
    },
  },
  branding: {
    companyName: "eCommerce Admin Dashboard",
    softwareBrothers: false,
  },
});

const adminRouter = AdminJSExpress.buildRouter(adminJs);

app.use("/api", authRoutes);

app.get("/admin/login", (req, res) => {
  res.type("html").send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Admin Login</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>
          body{font-family:Arial,sans-serif;padding:30px;background:#f5f5f5;margin:0}
          .container{max-width:400px;margin:50px auto;background:white;padding:40px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
          h2{text-align:center;color:#333;margin-bottom:30px}
          label{display:block;margin-top:15px;margin-bottom:5px;font-weight:bold;color:#555}
          input,select{width:100%;padding:12px;margin-bottom:15px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box;font-size:14px}
          button{width:100%;padding:14px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;font-size:16px;margin-top:10px;font-weight:bold}
          button:hover{background:#0056b3}
          .error{color:red;text-align:center;margin-top:15px;font-weight:bold}
          .info{font-size:12px;color:#666;margin-top:-10px;margin-bottom:15px}
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🔐 Admin Login</h2>
          <form id="loginForm">
            <label for="role">Login As:</label>
            <select id="role" required>
              <option value="">-- Select Role --</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <div class="info" id="roleInfo"></div>
            
            <label for="email">Email:</label>
            <input id="email" type="email" placeholder="Enter your email" required />
            
            <label for="password">Password:</label>
            <input id="password" type="password" placeholder="Enter your password" required />
            
            <button type="submit">Sign In</button>
          </form>
          <div class="error" id="error"></div>
        </div>
        <script>
          const roleSelect = document.getElementById('role');
          const roleInfo = document.getElementById('roleInfo');
          const emailInput = document.getElementById('email');
          const passwordInput = document.getElementById('password');
          const form = document.getElementById('loginForm');
          const errorDiv = document.getElementById('error');
          
          roleSelect.addEventListener('change', () => {
            const role = roleSelect.value;
            if (role === 'admin') {
              emailInput.value = 'admin@example.com';
              passwordInput.value = 'adminpass';
              roleInfo.textContent = 'Admin: Full access to all resources';
            } else if (role === 'user') {
              emailInput.value = 'user@example.com';
              passwordInput.value = 'userpass';
              roleInfo.textContent = 'User: Limited access (no Users/Settings)';
            } else {
              emailInput.value = '';
              passwordInput.value = '';
              roleInfo.textContent = '';
            }
          });
          
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorDiv.textContent = '';
            
            const role = roleSelect.value;
            const email = emailInput.value;
            const password = passwordInput.value;
            
            if (!role) {
              errorDiv.textContent = 'Please select a role';
              return;
            }
            
            try {
              const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
              });
              
              if (!response.ok) {
                const data = await response.json().catch(() => ({message: 'Login failed'}));
                errorDiv.textContent = data.message || 'Login failed';
                return;
              }
              
              const data = await response.json();
              console.log('Login successful:', data);
              
              window.location.href = '/admin';
            } catch (err) {
              errorDiv.textContent = err.message || 'Network error';
            }
          });
        </script>
      </body>
    </html>
  `);
});

app.get("/admin/logout", (req, res) => {
  res.clearCookie(process.env.ADMIN_COOKIE_NAME || "adminToken");
  if (req.session) {
    req.session.destroy();
  }
  res.redirect("/admin/login");
});

app.use("/admin", (req, res, next) => {
  if (req.path === "/login" || req.path === "/logout") {
    return next();
  }

  const token = req.cookies?.[process.env.ADMIN_COOKIE_NAME || "adminToken"];

  if (!token) {
    console.log("No token found, redirecting to login");
    return res.redirect("/admin/login");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    req.session.adminUser = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    console.log("User authenticated:", payload.email, "Role:", payload.role);
    next();
  } catch (err) {
    console.log("Invalid token:", err.message);
    res.clearCookie(process.env.ADMIN_COOKIE_NAME || "adminToken");
    return res.redirect("/admin/login");
  }
});

app.use(adminJs.options.rootPath, adminRouter);

app.get("/admin", (req, res) => {
  res.redirect("/admin/resources");
});

app.get("/health", (req, res) => res.json({ ok: true }));

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    await sequelize.sync();
    console.log("Database synced");

    const adminExists = await User.findOne({
      where: { email: "admin@example.com" },
    });
    if (!adminExists) {
      await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password_hash: await bcrypt.hash("adminpass", 10),
        role: "admin",
      });
      console.log("Admin user created");
    }

    const userExists = await User.findOne({
      where: { email: "user@example.com" },
    });
    if (!userExists) {
      await User.create({
        name: "Regular User",
        email: "user@example.com",
        password_hash: await bcrypt.hash("userpass", 10),
        role: "user",
      });
      console.log("Regular user created");
    }

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Admin login at http://localhost:${PORT}/admin/login`);
    });
  } catch (err) {
    console.error("Server error:", err);
    process.exit(1);
  }
})();
