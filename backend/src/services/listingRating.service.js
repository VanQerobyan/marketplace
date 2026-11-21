const { UniqueConstraintError, fn, col } = require('sequelize');
const ApiError = require('../utils/ApiError');
const requireModel = require('../utils/requireModel');

const createListingRating = async (raterId, listingId, payload) => {
  const Listing = requireModel('Listing');
  const ListingRating = requireModel('ListingRating');

  const listing = await Listing.findByPk(listingId);
  if (!listing) throw new ApiError(404, 'Listing not found');

  if (Number(listing.userId) === Number(raterId)) {
    throw new ApiError(400, 'You cannot rate your own listing');
  }

  const existing = await ListingRating.findOne({ where: { raterId, listingId } });
  if (existing) throw new ApiError(409, 'You have already rated this listing');

  try {
    return await ListingRating.create({
      raterId,
      listingId,
      rating: payload.rating,
      comment: payload.comment ?? null
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new ApiError(409, 'You have already rated this listing');
    }
    throw error;
  }
};

const getListingRatings = async (listingId) => {
  const Listing = requireModel('Listing');
  const ListingRating = requireModel('ListingRating');
  if (!await Listing.findByPk(listingId)) throw new ApiError(404, 'Listing not found');
  const items = await ListingRating.findAll({
    where: { listingId }, order: [['createdAt', 'DESC'], ['id', 'DESC']]
  });
  const summary = await ListingRating.findOne({
    attributes: [
      [fn('AVG', col('rating')), 'averageRating'],
      [fn('COUNT', col('id')), 'ratingsCount']
    ],
    where: { listingId }, raw: true
  });
  return {
    averageRating: Number(Number(summary?.averageRating || 0).toFixed(2)),
    ratingsCount: Number(summary?.ratingsCount || 0),
    items
  };
};

module.exports = { createListingRating, getListingRatings };
