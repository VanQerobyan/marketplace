const express = require('express');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/auth.middleware');
const validateRequest = require('../middlewares/validation.middleware');
const { registerValidator, loginValidator, refreshValidator, changePasswordValidator, googleValidator } = require('../validators/auth.validator');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const router = express.Router();

router.get('/google/config', authController.googleConfig);
router.post('/google', (req, res, next) => {
  // GIS uses a JS callback followed by JSON, rather than an automatic form POST.
  // Reject simple cross-origin form submissions to prevent login CSRF.
  if (!req.is('application/json') || (req.get('origin') && req.get('origin') !== env.clientUrl)) {
    return next(new ApiError(403, 'Invalid Google sign-in request origin or content type'));
  }
  next();
}, googleValidator, validateRequest, authController.googleSignIn);

router.post('/register', registerValidator, validateRequest, authController.register);
router.post('/login', loginValidator, validateRequest, authController.login);
router.post('/refresh', refreshValidator, validateRequest, authController.refresh);
router.get('/me', authenticate, authController.me);
router.patch('/change-password', authenticate, changePasswordValidator, validateRequest, authController.changePassword);

module.exports = router;
