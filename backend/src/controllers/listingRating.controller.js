const listingRatingService = require('../services/listingRating.service');
const asyncHandler = require('../utils/asyncHandler');

const createListingRating = asyncHandler(async (req, res) => {
  const rating = await listingRatingService.createListingRating(
    req.user.id,
    Number(req.params.listingId),
    req.body
  );
  res.status(201).json({ success: true, data: rating });
});

const getListingRatings = asyncHandler(async (req, res) => {
  const result = await listingRatingService.getListingRatings(Number(req.params.listingId));
  res.json({ success: true, data: result });
});

module.exports = { createListingRating, getListingRatings };
