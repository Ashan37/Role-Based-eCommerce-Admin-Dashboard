import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Setting = sequelize.define('Setting', {
  key: { type: DataTypes.STRING, unique: true },
  value: { type: DataTypes.STRING },
});

export default Setting;
