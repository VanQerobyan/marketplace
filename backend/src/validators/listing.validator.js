const { body, param, query } = require('express-validator');
const { LISTING_STATUS_VALUES } = require('../constants/listingStatus');

const listingIdParam = [
  param('id').isInt({ min: 1 }).withMessage('Invalid listing id')
];

const createListingValidator = [
  body('title').trim().notEmpty().isLength({ min: 3, max: 150 }),
  body('description').trim().notEmpty().isLength({ min: 10, max: 5000 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be 0 or greater'),
  body('category').optional({ nullable: true }).trim().isLength({ max: 100 })
];

const updateListingValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid listing id'),
  body('title').optional().trim().isLength({ min: 3, max: 150 }),
  body('description').optional().trim().isLength({ min: 10, max: 5000 }),
  body('price').optional().isFloat({ min: 0 }),
  body('category').optional({ nullable: true }).trim().isLength({ max: 100 }),
  body('status').optional().isIn(LISTING_STATUS_VALUES)
];

const updateStatusValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid listing id'),
  body('status').notEmpty().isIn(LISTING_STATUS_VALUES).withMessage('Invalid listing status')
];

const listQueryValidator = [
  query('userId').optional().isString().bail().isInt({ min: 1, max: 2147483647 })
    .withMessage('Invalid user id'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('status').optional().isIn(LISTING_STATUS_VALUES),
  query('sort').optional().isIn(['newest', 'oldest', 'price_asc', 'price_desc'])
];

module.exports = {
  listingIdParam,
  createListingValidator,
  updateListingValidator,
  updateStatusValidator,
  listQueryValidator
};
