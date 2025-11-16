import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Order = sequelize.define(
  "Order",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER },
    total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    status: {
      type: DataTypes.ENUM("pending", "paid", "shipped", "cancelled"),
      defaultValue: "pending",
    },
  },
  { tableName: "orders" }
);

export default Order;
