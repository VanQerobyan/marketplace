const { body } = require('express-validator');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const registerValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 50 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 50 }),
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
    .matches(/^[A-Za-z0-9_]+$/).withMessage('Username can contain only letters, numbers and underscore'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .matches(PASSWORD_REGEX)
    .withMessage('Password must be at least 8 characters and include uppercase, lowercase, number and special character')
];

const loginValidator = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const refreshValidator = [
  body('refreshToken').isString().bail().trim().notEmpty().withMessage('Refresh token is required')
];

const googleValidator = [
  body('credential').isString().bail().isLength({ min: 1, max: 16384 })
    .withMessage('Google credential is required').hide(),
  body('nonce').isString().bail().matches(/^[a-f0-9]{64}$/)
    .withMessage('Invalid Google sign-in request').hide(),
  body('password').optional().isString().bail().isLength({ min: 1, max: 72 })
    .withMessage('Invalid account password').hide()
];

const changePasswordValidator = [
  body('currentPassword')
    .isString().withMessage('Current password must be a string').bail()
    .notEmpty().withMessage('Current password is required')
    .hide(),
  body('newPassword')
    .isString().withMessage('New password must be a string').bail()
    .isLength({ min: 8, max: 72 }).withMessage('New password must be 8-72 characters').bail()
    .matches(PASSWORD_REGEX)
    .withMessage('New password must include uppercase, lowercase, number and a special character from @$!%*?&')
    .hide()
];

module.exports = {
  PASSWORD_REGEX,
  registerValidator,
  loginValidator,
  refreshValidator,
  googleValidator,
  changePasswordValidator
};
