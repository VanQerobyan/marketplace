const listingService = require('../services/listing.service');
const asyncHandler = require('../utils/asyncHandler');

const createListing = asyncHandler(async (req, res) => {
  const listing = await listingService.createListing(req.user.id, req.body, req.listingImageUploads);
  req.listingImagesSaved = true;
  res.status(201).json({ success: true, data: listing });
});

const getListings = asyncHandler(async (req, res) => {
  const result = await listingService.getListings(req.query);
  res.json({ success: true, data: result.items, pagination: result.pagination });
});

const getListingById = asyncHandler(async (req, res) => {
  const listing = await listingService.getListingById(req.params.id, { viewerId: req.user?.id });
  res.json({ success: true, data: listing });
});

const getMyListings = asyncHandler(async (req, res) => {
  const result = await listingService.getMyListings(req.user.id, req.query);
  res.json({ success: true, data: result.items, pagination: result.pagination });
});

const updateListing = asyncHandler(async (req, res) => {
  const listing = await listingService.updateListing(req.listing, req.body, req.listingImageUploads);
  req.listingImagesSaved = true;
  res.json({ success: true, data: listing });
});

const updateListingStatus = asyncHandler(async (req, res) => {
  const listing = await listingService.updateListingStatus(req.listing, req.body.status);
  res.json({ success: true, data: listing });
});

const deleteListing = asyncHandler(async (req, res) => {
  await listingService.deleteListing(req.listing);
  res.status(204).send();
});

module.exports = {
  createListing,
  getListings,
  getListingById,
  getMyListings,
  updateListing,
  updateListingStatus,
  deleteListing
};
