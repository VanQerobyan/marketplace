const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ListingRating = sequelize.define(
  'ListingRating',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    raterId: { type: DataTypes.INTEGER, allowNull: false },
    listingId: { type: DataTypes.INTEGER, allowNull: false },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { isInt: true, min: 1, max: 5 }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: { len: [0, 1000] }
    }
  },
  {
    tableName: 'listing_ratings',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['raterId', 'listingId'], name: 'listing_ratings_rater_listing_unique' },
      { fields: ['listingId'] }
    ]
  }
);

module.exports = ListingRating;
