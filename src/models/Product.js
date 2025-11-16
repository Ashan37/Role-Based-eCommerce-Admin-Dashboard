import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Product = sequelize.define(
  "Product",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },

    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

    categoryId: { type: DataTypes.INTEGER, allowNull: true },
  },
  { tableName: "products" }
);

export default Product;
