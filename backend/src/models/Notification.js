const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define(
  'Notification',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    actorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    },

    type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },

    message: {
      type: DataTypes.STRING(500),
      allowNull: false
    },

    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },

    listingId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: 'notifications',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['userId', 'isRead']
      },
      {
        fields: ['listingId']
      }
    ]
  }
);

module.exports = Notification;
