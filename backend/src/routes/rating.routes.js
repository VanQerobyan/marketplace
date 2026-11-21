const express = require('express');
const ratingController = require('../controllers/rating.controller');
const listingRatingController = require('../controllers/listingRating.controller');
const authenticate = require('../middlewares/auth.middleware');
const validateRequest = require('../middlewares/validation.middleware');
const { createRatingValidator, userIdParamValidator } = require('../validators/rating.validator');
const { createListingRatingValidator, listingIdParamValidator } = require('../validators/listingRating.validator');

const router = express.Router();

router.get('/user/:userId', userIdParamValidator, validateRequest, ratingController.getUserRatings);
router.post('/user/:userId', authenticate, createRatingValidator, validateRequest, ratingController.createRating);
router.get('/listing/:listingId', listingIdParamValidator, validateRequest, listingRatingController.getListingRatings);
router.post('/listing/:listingId', authenticate, createListingRatingValidator, validateRequest, listingRatingController.createListingRating);

module.exports = router;
