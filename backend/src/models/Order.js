const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define(
  'Order',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    buyerId: { type: DataTypes.INTEGER, allowNull: false },
    listingId: { type: DataTypes.INTEGER, allowNull: true },
    title: { type: DataTypes.STRING(150), allowNull: false },
    // Գումարը պահվում է ցենտերով. 1250 նշանակում է $12.50։
    amount: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 50, max: 99999999 } },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'usd', validate: { isIn: [['usd']] } },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'paid_test', validate: { isIn: [['paid_test']] } },
    stripeSessionId: { type: DataTypes.STRING(255), allowNull: false, unique: true }
  },
  {
    tableName: 'orders',
    timestamps: true,
    indexes: [{ fields: ['buyerId'] }]
  }
);

module.exports = Order;
