import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    orderId: { type: DataTypes.INTEGER },   // FIXED
    productId: { type: DataTypes.INTEGER }, // FIXED

    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    unit_price: { type: DataTypes.DECIMAL(10, 2) },
  },
  { tableName: "order_items" }
);

export default OrderItem;
