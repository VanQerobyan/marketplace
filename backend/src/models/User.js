const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },

    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },

    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 30],
        is: /^[A-Za-z0-9_]+$/i
      }
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },

    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    googleId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true
    }
  },
  {
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['username']
      },
      {
        unique: true,
        fields: ['email']
      }
    ]
  }
);

module.exports = User;
