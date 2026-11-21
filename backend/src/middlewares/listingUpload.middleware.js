const multer = require('multer');
const path = require('path');
const { randomUUID } = require('crypto');
const { mkdir } = require('fs');
const ApiError = require('../utils/ApiError');
const { imageTypes, hasImageSignature } = require('./upload.middleware');
const { listingImagesDirectory, listingImagesPrefix, maxListingImages } = require('../utils/listingImages');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      mkdir(listingImagesDirectory, { recursive: true }, (error) => callback(error, listingImagesDirectory));
    },
    filename: (req, file, callback) => {
      callback(null, `${randomUUID()}${imageTypes[file.mimetype].extension}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: maxListingImages, fields: 5, parts: maxListingImages + 5 },
  fileFilter: (req, file, callback) => {
    const type = imageTypes[file.mimetype];
    const extension = path.extname(file.originalname).toLowerCase();
    if (!type || !type.acceptedExtensions.includes(extension)) {
      return callback(new ApiError(400, 'Only JPEG, PNG and WebP images are allowed'));
    }
    callback(null, true);
  }
}).array('images', maxListingImages);

const uploadListingImages = (req, res, next) => {
  upload(req, res, async (error) => {
    req.listingImageUploads = (req.files || []).map((file) => `${listingImagesPrefix}${file.filename}`);

    if (error) {
      if (error instanceof multer.MulterError) {
        const tooLarge = error.code === 'LIMIT_FILE_SIZE';
        return next(new ApiError(tooLarge ? 413 : 400, tooLarge
          ? 'Each listing image must be at most 5 MB'
          : `Upload at most ${maxListingImages} images using the images field, with at most 5 listing fields`));
      }
      return next(error);
    }

    try {
      for (const file of req.files || []) {
        if (!await hasImageSignature(file)) {
          throw new ApiError(400, 'File contents do not match the image type');
        }
      }
      next();
    } catch (validationError) {
      next(validationError);
    }
  });
};

module.exports = uploadListingImages;
