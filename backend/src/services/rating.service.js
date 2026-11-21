const { fn, col, UniqueConstraintError } = require('sequelize');
const { sequelize } = require('../config/database');
const notificationService = require('./notification.service');
const ApiError = require('../utils/ApiError');
const requireModel = require('../utils/requireModel');

const createRating = async (raterId, ratedUserId, payload) => {
  const User = requireModel('User');
  const Rating = requireModel('Rating');

  if (Number(raterId) === Number(ratedUserId)) {
    throw new ApiError(400, 'You cannot rate yourself');
  }

  const ratedUser = await User.findByPk(ratedUserId);
  if (!ratedUser) throw new ApiError(404, 'User not found');

  const existing = await Rating.findOne({ where: { raterId, ratedUserId } });
  if (existing) throw new ApiError(409, 'You have already rated this user');

  try {
    return await sequelize.transaction(async (transaction) => {
      const rating = await Rating.create({
        raterId, ratedUserId, rating: payload.rating, comment: payload.comment ?? null
      }, { transaction });
      await notificationService.createNotification({
        userId: ratedUserId, actorId: raterId, type: 'rating', message: 'You received a new rating'
      }, { transaction });
      return rating;
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) throw new ApiError(409, 'You have already rated this user');
    throw error;
  }
};

const getUserRatings = async (ratedUserId) => {
  const Rating = requireModel('Rating');

  const ratings = await Rating.findAll({
    where: { ratedUserId },
    order: [['createdAt', 'DESC']]
  });

  const summary = await Rating.findOne({
    attributes: [
      [fn('AVG', col('rating')), 'averageRating'],
      [fn('COUNT', col('id')), 'ratingsCount']
    ],
    where: { ratedUserId },
    raw: true
  });

  return {
    averageRating: summary?.averageRating ? Number(Number(summary.averageRating).toFixed(2)) : 0,
    ratingsCount: Number(summary?.ratingsCount || 0),
    items: ratings
  };
};

module.exports = {
  createRating,
  getUserRatings
};
