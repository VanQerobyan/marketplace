const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const ApiError = require('../utils/ApiError');
const requireModel = require('../utils/requireModel');
const { LISTING_STATUS } = require('../constants/listingStatus');
const { removeListingImages } = require('../utils/listingImages');

const createListing = async (userId, payload, images = []) => {
  const Listing = requireModel('Listing');

  return Listing.create({
    userId,
    title: payload.title,
    description: payload.description,
    price: payload.price,
    category: payload.category ?? null,
    images,
    status: LISTING_STATUS.ACTIVE,
    viewsCount: 0
  });
};

const buildSort = (sort) => {
  const sortMap = {
    newest: [['createdAt', 'DESC']],
    oldest: [['createdAt', 'ASC']],
    price_asc: [['price', 'ASC']],
    price_desc: [['price', 'DESC']]
  };

  return sortMap[sort] || sortMap.newest;
};

const getListings = async (query) => {
  const Listing = requireModel('Listing');
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 12, 1), 50);
  const offset = (page - 1) * limit;

  const where = {};

  if (query.userId !== undefined) where.userId = Number(query.userId);

  if (query.search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${query.search}%` } },
      { description: { [Op.iLike]: `%${query.search}%` } }
    ];
  }

  if (query.status) where.status = query.status;
  if (query.category) where.category = query.category;

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {};
    if (query.minPrice !== undefined) where.price[Op.gte] = Number(query.minPrice);
    if (query.maxPrice !== undefined) where.price[Op.lte] = Number(query.maxPrice);
  }

  const { rows, count } = await Listing.findAndCountAll({
    where,
    order: buildSort(query.sort),
    limit,
    offset
  });

  return {
    items: rows,
    pagination: {
      page,
      limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};

const getListingById = async (listingId, { viewerId = null, incrementView = true } = {}) => {
  const Listing = requireModel('Listing');
  const listing = await Listing.findByPk(listingId);

  if (!listing) throw new ApiError(404, 'Listing not found');

  if (incrementView && viewerId && Number(viewerId) !== Number(listing.userId)) {
    await sequelize.transaction(async (transaction) => {
      const [, created] = await requireModel('ListingView').findOrCreate({
        where: { listingId: listing.id, viewerId },
        transaction
      });
      if (created) {
        await listing.increment('viewsCount', { by: 1, transaction, silent: true });
      }
    });
    await listing.reload();
  }

  return listing;
};

const getMyListings = async (userId, query = {}) => {
  const Listing = requireModel('Listing');
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 12, 1), 50);
  const offset = (page - 1) * limit;
  const where = { userId };

  if (query.status) where.status = query.status;

  const { rows, count } = await Listing.findAndCountAll({
    where,
    order: buildSort(query.sort),
    limit,
    offset
  });

  return {
    items: rows,
    pagination: {
      page,
      limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};

const updateListing = async (listing, payload, images = []) => {
  const allowedFields = ['title', 'description', 'price', 'category', 'status'];
  const previousImages = listing.images || [];

  for (const field of allowedFields) {
    if (payload[field] !== undefined) listing[field] = payload[field];
  }

  if (images.length) listing.images = images;

  await listing.save();
  if (images.length) await removeListingImages(previousImages);
  return listing;
};

const updateListingStatus = async (listing, status) => {
  listing.status = status;
  await listing.save();
  return listing;
};

const deleteListing = async (listing) => {
  await listing.destroy();
  await removeListingImages(listing.images || []);
};

module.exports = {
  createListing,
  getListings,
  getListingById,
  getMyListings,
  updateListing,
  updateListingStatus,
  deleteListing
};
