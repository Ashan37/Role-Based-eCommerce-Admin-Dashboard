import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Setting = sequelize.define(
  "Setting",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    key: { type: DataTypes.STRING, allowNull: false, unique: true },
    value: { type: DataTypes.TEXT },
  },
  { tableName: "settings" }
);

export default Setting;
