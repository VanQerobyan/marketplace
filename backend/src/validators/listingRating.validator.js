const { body, param } = require('express-validator');

const listingIdParamValidator = [
  param('listingId').isInt({ min: 1, max: 2147483647 }).withMessage('Invalid listing id')
];

const createListingRatingValidator = [
  ...listingIdParamValidator,
  body('rating')
    .custom((value) => Number.isInteger(value) && value >= 1 && value <= 5)
    .withMessage('Rating must be an integer from 1 to 5'),
  body('comment').optional({ nullable: true }).isString().bail().trim().isLength({ max: 1000 })
];

module.exports = { createListingRatingValidator, listingIdParamValidator };
