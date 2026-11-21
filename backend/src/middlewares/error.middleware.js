const { UniqueConstraintError, ValidationError } = require('sequelize');
const { removeListingImages } = require('../utils/listingImages');

const errorHandler = async (err, req, res, next) => {
  if (req.listingImageUploads && !req.listingImagesSaved) {
    await removeListingImages(req.listingImageUploads);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details || null;

  if (err instanceof UniqueConstraintError) {
    statusCode = 409;
    message = 'A record with these unique values already exists';
    details = err.errors?.map((item) => ({ field: item.path, message: item.message })) || null;
  }

  if (err instanceof ValidationError) {
    statusCode = 400;
    message = 'Database validation failed';
    details = err.errors?.map((item) => ({ field: item.path, message: item.message })) || null;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { errors: details } : {})
  });
};

module.exports = errorHandler;
