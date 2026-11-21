const { body, query } = require('express-validator');

const checkoutValidator = [
  body('listingId').custom((value) => Number.isInteger(value) && value > 0 && value <= 2147483647)
    .withMessage('Invalid listing id')
];

const confirmPaymentValidator = [
  body('sessionId').isString().bail().isLength({ max: 255 }).matches(/^cs_test_[A-Za-z0-9]+$/)
    .withMessage('A Stripe test session is required')
];

const purchasesValidator = [
  query('page').optional().isInt({ min: 1, max: 1000000 }).withMessage('Invalid page')
];

module.exports = { checkoutValidator, confirmPaymentValidator, purchasesValidator };
