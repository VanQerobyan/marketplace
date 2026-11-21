const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Favorite = sequelize.define(
  'Favorite',
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

    listingId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: 'favorites',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'listingId'],
        name: 'favorites_user_listing_unique'
      },
      {
        fields: ['userId']
      },
      {
        fields: ['listingId']
      }
    ]
  }
);

module.exports = Favorite;