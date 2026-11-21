const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const requireModel = require('../utils/requireModel');

const requireListingOwner = asyncHandler(async (req, res, next) => {
  const Listing = requireModel('Listing');
  const listing = await Listing.findByPk(req.params.id);

  if (!listing) {
    throw new ApiError(404, 'Listing not found');
  }

  if (Number(listing.userId) !== Number(req.user.id)) {
    throw new ApiError(403, 'You are not allowed to modify this listing');
  }

  req.listing = listing;
  next();
});

module.exports = {
  requireListingOwner
};
