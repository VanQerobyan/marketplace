const express = require('express');
const listingController = require('../controllers/listing.controller');
const authenticate = require('../middlewares/auth.middleware');
const optionalAuthenticate = require('../middlewares/optionalAuth.middleware');
const { requireListingOwner } = require('../middlewares/authorization.middleware');
const validateRequest = require('../middlewares/validation.middleware');
const uploadListingImages = require('../middlewares/listingUpload.middleware');
const {
  listingIdParam,
  createListingValidator,
  updateListingValidator,
  updateStatusValidator,
  listQueryValidator
} = require('../validators/listing.validator');

const router = express.Router();

router.get('/', listQueryValidator, validateRequest, listingController.getListings);
router.get('/mine', authenticate, listQueryValidator, validateRequest, listingController.getMyListings);
router.get('/:id', listingIdParam, validateRequest, optionalAuthenticate, listingController.getListingById);
router.post('/', authenticate, uploadListingImages, createListingValidator, validateRequest, listingController.createListing);
router.patch('/:id', authenticate, listingIdParam, validateRequest, requireListingOwner, uploadListingImages, updateListingValidator, validateRequest, listingController.updateListing);
router.patch('/:id/status', authenticate, updateStatusValidator, validateRequest, requireListingOwner, listingController.updateListingStatus);
router.delete('/:id', authenticate, listingIdParam, validateRequest, requireListingOwner, listingController.deleteListing);

module.exports = router;
