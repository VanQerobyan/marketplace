const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Rating = sequelize.define(
  'Rating',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    raterId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    ratedUserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1,
        max: 5
      }
    },

    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: { len: [0, 1000] }
    }
  },
  {
    tableName: 'ratings',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['raterId', 'ratedUserId'],
        name: 'ratings_rater_rated_user_unique'
      },
      {
        fields: ['raterId']
      },
      {
        fields: ['ratedUserId']
      }
    ]
  }
);

module.exports = Rating;
