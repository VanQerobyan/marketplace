const { body, param, query } = require('express-validator');

const isId = (value) => Number.isInteger(value) && value >= 1 && value <= 2147483647;

const sendMessageValidator = [
  body('receiverId').custom(isId).withMessage('Receiver ID must be a positive integer'),
  body('content').isString().bail().trim().isLength({ min: 1, max: 5000 })
    .withMessage('Message must contain between 1 and 5000 characters'),
  body('listingId').optional({ nullable: true }).custom(isId)
    .withMessage('Listing ID must be a positive integer')
];

const userIdValidator = [
  param('userId').isInt({ min: 1, max: 2147483647 }).withMessage('Invalid user ID')
];

const paginationValidator = [
  query('page').optional().isString().bail().isInt({ min: 1, max: 1000000 }),
  query('limit').optional().isString().bail().isInt({ min: 1, max: 100 })
];

module.exports = { sendMessageValidator, userIdValidator, paginationValidator };
