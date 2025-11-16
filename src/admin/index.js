import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import AdminJSSequelize from "@adminjs/sequelize";
import { ComponentLoader } from "adminjs";

import express from "express";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Component Loader (AdminJS v7)

const componentLoader = new ComponentLoader();

const DashboardComponent = componentLoader.add(
  "Dashboard",
  path.join(__dirname, "components", "Dashboard.jsx") // FULLY FIXED PATH
);

// Sequelize Adapter

AdminJS.registerAdapter({
  Resource: AdminJSSequelize.Resource,
  Database: AdminJSSequelize.Database,
});

// AdminJS Configuration

const adminJs = new AdminJS({
  rootPath: "/admin",
  databases: [sequelize],
  componentLoader, // IMPORTANT

  resources: [
    // ---------------------- User ----------------------
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

    // ---------------------- Category ----------------------
    { resource: Category },

    // ---------------------- Product ----------------------
    {
      resource: Product,
      options: {
        properties: { categoryId: { reference: "categories" } },
      },
    },

    // ---------------------- Order ----------------------
    {
      resource: Order,
      options: {
        properties: { userId: { reference: "users" } },
      },
    },

    // ---------------------- OrderItem ----------------------
    {
      resource: OrderItem,
      options: {
        properties: {
          productId: { reference: "products" },
          orderId: { reference: "orders" },
        },
      },
    },

    // ---------------------- Setting ----------------------
    { resource: Setting },
  ],

  // Dashboard (AdminJS v7)

  dashboard: {
    handler: async () => {
      const usersCount = await User.count();
      const ordersCount = await Order.count();
      const productsCount = await Product.count();

      const totals = await Order.findAll({ attributes: ["total"] });
      const revenue = totals.reduce(
        (s, o) => s + parseFloat(o.total || 0),
        0
      );

      return { usersCount, ordersCount, productsCount, revenue };
    },
    component: DashboardComponent,
  },

  branding: {
    companyName: "eCommerce Admin",
  },
});

// Router (JWT Protected)

const router = AdminJSExpress.buildRouter(adminJs);

const adminRouter = express.Router();
adminRouter.use(adminJwtMiddleware);
adminRouter.use(adminJs.options.rootPath, router);

export default adminRouter;
