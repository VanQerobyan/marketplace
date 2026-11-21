const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Listing = sequelize.define(
  'Listing',
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

    title: {
      type: DataTypes.STRING(150),
      allowNull: false
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },

    category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    images: {
      type: DataTypes.ARRAY(DataTypes.STRING(255)),
      allowNull: false,
      defaultValue: []
    },

    status: {
      type: DataTypes.ENUM('active', 'reserved', 'sold'),
      allowNull: false,
      defaultValue: 'active'
    },

    viewsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  },
  {
    tableName: 'listings',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['category']
      },
      {
        fields: ['createdAt']
      }
    ]
  }
);

module.exports = Listing;
