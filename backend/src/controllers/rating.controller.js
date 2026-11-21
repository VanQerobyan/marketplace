const ratingService = require('../services/rating.service');
const asyncHandler = require('../utils/asyncHandler');

const createRating = asyncHandler(async (req, res) => {
  const rating = await ratingService.createRating(req.user.id, req.params.userId, req.body);

  res.status(201).json({ success: true, data: rating });
});

const getUserRatings = asyncHandler(async (req, res) => {
  const result = await ratingService.getUserRatings(req.params.userId);
  res.json({ success: true, data: result });
});

module.exports = { createRating, getUserRatings };
