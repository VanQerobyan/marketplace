const { body, query } = require('express-validator');

const searchUsersValidator = [
  query('search').isString().bail().trim().isLength({ min: 1, max: 101 })
    .withMessage('Search must contain between 1 and 101 characters'),
  query('page').optional().isString().bail().isInt({ min: 1, max: 1000000 }),
  query('limit').optional().isString().bail().isInt({ min: 1, max: 50 })
];

const updateMeValidator = [
  body('firstName').optional().trim().notEmpty().isLength({ max: 50 }),
  body('lastName').optional().trim().notEmpty().isLength({ max: 50 }),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[A-Za-z0-9_]+$/),
  body('email').optional().trim().isEmail().normalizeEmail()
];

module.exports = {
  searchUsersValidator,
  updateMeValidator
};
