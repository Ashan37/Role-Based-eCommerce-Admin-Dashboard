import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSSequelize from '@adminjs/sequelize';
import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import { User, Product, Category, Order, OrderItem, Setting } from './models/index.js';

dotenv.config();


AdminJS.registerAdapter(AdminJSSequelize);


const admin = new AdminJS({
  resources: [
    { resource: User, options: { properties: { password: { isVisible: false } } } },
    { resource: Product },
    { resource: Category },
    { resource: Order },
    { resource: OrderItem },
    { resource: Setting },
  ],
  rootPath: '/admin',
  dashboard: {
    handler: async () => ({ message: 'Welcome to Admin Dashboard' }),
    component: false,
  },
  branding: {
    companyName: 'My eCommerce Admin',
  },
});

const adminRouter = AdminJSExpress.buildRouter(admin);

export { adminRouter };
