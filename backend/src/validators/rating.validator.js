const { body, param } = require('express-validator');

const createRatingValidator = [
  param('userId').isInt({ min: 1, max: 2147483647 }).withMessage('Invalid user id'),
  body('rating').custom((value) => Number.isInteger(value) && value >= 1 && value <= 5)
    .withMessage('Rating must be an integer from 1 to 5'),
  body('comment').optional({ nullable: true }).isString().bail().trim().isLength({ max: 1000 })
];

const userIdParamValidator = [
  param('userId').isInt({ min: 1, max: 2147483647 }).withMessage('Invalid user id')
];

module.exports = {
  createRatingValidator,
  userIdParamValidator
};
