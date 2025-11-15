import { sequelize } from '../config/db.js';
import User from './User.js';
import Category from './Category.js';
import Product from './Product.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Setting from './Setting.js';

// Define relationships
Category.hasMany(Product);
Product.belongsTo(Category);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

export { sequelize, User, Category, Product, Order, OrderItem, Setting };
