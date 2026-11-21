const favoriteService = require('../services/favorite.service');
const asyncHandler = require('../utils/asyncHandler');

const addFavorite = asyncHandler(async (req, res) => {
  const favorite = await favoriteService.addFavorite(req.user.id, req.params.listingId);
  res.status(201).json({ success: true, data: favorite });
});

const removeFavorite = asyncHandler(async (req, res) => {
  await favoriteService.removeFavorite(req.user.id, req.params.listingId);
  res.status(204).send();
});

const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await favoriteService.getFavorites(req.user.id);
  res.json({ success: true, data: favorites });
});

module.exports = { addFavorite, removeFavorite, getFavorites };
