const ApiError = require('../utils/ApiError');
const requireModel = require('../utils/requireModel');

const addFavorite = async (userId, listingId) => {
  const Favorite = requireModel('Favorite');
  const Listing = requireModel('Listing');

  const listing = await Listing.findByPk(listingId);
  if (!listing) throw new ApiError(404, 'Listing not found');

  const existing = await Favorite.findOne({ where: { userId, listingId } });
  if (existing) throw new ApiError(409, 'Listing is already in favorites');

  return Favorite.create({ userId, listingId });
};

const removeFavorite = async (userId, listingId) => {
  const Favorite = requireModel('Favorite');
  const favorite = await Favorite.findOne({ where: { userId, listingId } });

  if (!favorite) throw new ApiError(404, 'Favorite not found');
  await favorite.destroy();
};

const getFavorites = async (userId) => {
  const Favorite = requireModel('Favorite');
  const Listing = requireModel('Listing');

  const favorites = await Favorite.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']]
  });

  const listingIds = favorites.map((favorite) => favorite.listingId);
  if (!listingIds.length) return [];

  const listings = await Listing.findAll({ where: { id: listingIds } });
  const listingMap = new Map(listings.map((listing) => [Number(listing.id), listing]));

  return favorites.map((favorite) => ({
    id: favorite.id,
    userId: favorite.userId,
    listingId: favorite.listingId,
    createdAt: favorite.createdAt,
    listing: listingMap.get(Number(favorite.listingId)) || null
  }));
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites
};
