const express = require('express');
const { param } = require('express-validator');
const favoriteController = require('../controllers/favorite.controller');
const authenticate = require('../middlewares/auth.middleware');
const validateRequest = require('../middlewares/validation.middleware');

const router = express.Router();
const listingIdValidator = [param('listingId').isInt({ min: 1 }), validateRequest];

router.use(authenticate);
router.get('/', favoriteController.getFavorites);
router.post('/:listingId', listingIdValidator, favoriteController.addFavorite);
router.delete('/:listingId', listingIdValidator, favoriteController.removeFavorite);

module.exports = router;
