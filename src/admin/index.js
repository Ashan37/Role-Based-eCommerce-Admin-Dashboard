import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import AdminJSSequelize from "@adminjs/sequelize";
import { ComponentLoader } from "adminjs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import bcrypt from "bcrypt";
import sequelize from "../config/db.js";

import {
  User,
  Category,
  Product,
  Order,
  OrderItem,
  Setting,
} from "../models/index.js";

import { adminJwtMiddleware } from "../auth.js";

// Component loader initialization
const componentLoader = new ComponentLoader();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register your custom dashboard component here
const DashboardComponent = componentLoader.add(
  "Dashboard",
  path.join(__dirname, "components", "Dashboard.jsx")
);

AdminJS.registerAdapter({
  Resource: AdminJSSequelize.Resource,
  Database: AdminJSSequelize.Database,
});

const adminJs = new AdminJS({
  databases: [sequelize],
  rootPath: "/admin",
  componentLoader, // <-- IMPORTANT!
  resources: [
    {
      resource: User,
      options: {
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
          },
        },
      },
    },
    { resource: Category },
    {
      resource: Product,
      options: {
        properties: {
          categoryId: { reference: "Category" },
        },
      },
    },
    {
      resource: Order,
      options: {
        properties: {
          userId: { reference: "User" },
        },
      },
    },
    {
      resource: OrderItem,
      options: {
        properties: {
          productId: { reference: "Product" },
          orderId: { reference: "Order" },
        },
      },
    },
    { resource: Setting },
  ],

  // IMPORTANT: New style dashboard config for AdminJS v7
  dashboard: {
    handler: async () => {
      const usersCount = await User.count();
      const ordersCount = await Order.count();
      const productsCount = await Product.count();

      const rows = await Order.findAll({ attributes: ["total"] });
      const revenue = rows.reduce(
        (sum, row) => sum + parseFloat(row.total || 0),
        0
      );

      return { usersCount, ordersCount, productsCount, revenue };
    },
    component: DashboardComponent, // <--- FIX HERE
  },

  branding: {
    companyName: "eCommerce Admin",
  },
});

// JWT Middleware FIRST
const router = AdminJSExpress.buildRouter(adminJs);

const adminRouter = express.Router();
adminRouter.use(adminJwtMiddleware);
adminRouter.use(adminJs.options.rootPath, router);

export default adminRouter;
