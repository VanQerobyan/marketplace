const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ListingView = sequelize.define('ListingView', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  listingId: { type: DataTypes.INTEGER, allowNull: false },
  viewerId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'listing_views',
  timestamps: true,
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['listingId', 'viewerId'], name: 'listing_views_listing_viewer_unique' },
    { fields: ['viewerId'], name: 'listing_views_viewer_id' }
  ]
});

module.exports = ListingView;
