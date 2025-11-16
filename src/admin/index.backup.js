import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import AdminJSSequelize from "@adminjs/sequelize";
import { ComponentLoader } from "adminjs";
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

const componentLoader = new ComponentLoader();
const DashboardComponent = componentLoader.add(
  "Dashboard",
  path.join(__dirname, "components", "Dashboard.jsx")
);

AdminJS.registerAdapter({
  Resource: AdminJSSequelize.Resource,
  Database: AdminJSSequelize.Database,
});

const adminJs = new AdminJS({
  rootPath: "/admin",
  databases: [sequelize],
  componentLoader,
  
  getCurrentAdmin: (context) => {
    const currentAdmin = context.session?.adminUser || context.req?.user;
    console.log('📋 getCurrentAdmin called:', currentAdmin?.email, 'Role:', currentAdmin?.role);
    return currentAdmin;
  },

  resources: [
    {
      resource: User,
      options: {
        isAccessible: ({ currentAdmin }) =>
          currentAdmin && currentAdmin.role === "admin",
        
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

    {
      resource: Category,
      options: {
        isAccessible: ({ currentAdmin }) => !!currentAdmin,
        actions: {
          new: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === 'admin' },
          edit: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === 'admin' },
          delete: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === 'admin' },
        }
      },
    },

    {
      resource: Product,
      options: {
        properties: { categoryId: { reference: "categories" } },
        isAccessible: ({ currentAdmin }) => !!currentAdmin,
        actions: {
          new: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === 'admin' },
          edit: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === 'admin' },
          delete: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === 'admin' },
        }
      },
    },

    {
      resource: Order,
      options: {
        properties: { userId: { reference: "users" } },
        isAccessible: ({ currentAdmin }) => !!currentAdmin,
        actions: {
          delete: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === 'admin' },
        }
      },
    },

    {
      resource: OrderItem,
      options: {
        properties: {
          productId: { reference: "products" },
          orderId: { reference: "orders" },
        },
        isAccessible: ({ currentAdmin }) => !!currentAdmin,
        actions: {
          new: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === 'admin' },
          edit: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === 'admin' },
          delete: { isAccessible: ({ currentAdmin }) => currentAdmin?.role === 'admin' },
        }
      },
    },

    {
      resource: Setting,
      options: {
        isAccessible: ({ currentAdmin }) =>
          currentAdmin && currentAdmin.role === "admin",
      },
    },
  ],

  dashboard: {
    handler: async (request, response, context) => {
      const currentAdmin = context.currentAdmin;
      if (currentAdmin?.role === "admin") {
        const usersCount = await User.count();
        const ordersCount = await Order.count();
        const productsCount = await Product.count();
        const totals = await Order.findAll({ attributes: ["total"] });
        const revenue = totals.reduce(
          (s, o) => s + parseFloat(o.total || 0),
          0
        );
        return {
          usersCount,
          ordersCount,
          productsCount,
          revenue,
          role: "admin",
        };
      }
      if (currentAdmin?.id) {
        const productsCount = await Product.count();
        const categoriesCount = await Category.count();
        const ordersCount = await Order.count();
        const orderItemsCount = await OrderItem.count();
        const recentProducts = await Product.findAll({
          limit: 5,
          order: [["id", "DESC"]],
          raw: true,
        });
        const recentOrders = await Order.findAll({
          limit: 5,
          order: [["id", "DESC"]],
          raw: true,
        });
        return {
          productsCount,
          categoriesCount,
          ordersCount,
          orderItemsCount,
          recentProducts,
          recentOrders,
          userName: currentAdmin.email,
          role: "user",
        };
      }
      return { role: "guest" };
    },
    component: DashboardComponent,
  },

  branding: {
    companyName: "eCommerce Admin",
  },
});

const adminJsRouter = AdminJSExpress.buildAuthenticatedRouter(
  adminJs,
  {
    authenticate: async (email, password, context) => {
      const user = context?.req?.session?.adminUser;
      if (user) {
        console.log('✅ AdminJS authenticate - User found in session:', user.email);
        return user;
      }
      
      console.log('❌ AdminJS authenticate - No user in session');
      return null;
    },
    cookieName: 'adminjs',
    cookiePassword: process.env.SESSION_SECRET || 'session-secret',
  },
  null,
  {
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || 'session-secret',
  }
);

console.log('✅ AdminJS router built successfully');

export { adminJsRouter, adminJs };