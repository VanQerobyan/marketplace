const express = require('express');
const { param } = require('express-validator');
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/auth.middleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');
const validateRequest = require('../middlewares/validation.middleware');
const { updateMeValidator, searchUsersValidator } = require('../validators/user.validator');

const router = express.Router();

router.get('/', searchUsersValidator, validateRequest, userController.searchUsers);
router.get('/me', authenticate, userController.getMe);
router.patch('/me', authenticate, updateMeValidator, validateRequest, userController.updateMe);
router.patch('/me/avatar', authenticate, uploadAvatar, userController.updateAvatar);
router.get('/:id', param('id').isInt({ min: 1 }), validateRequest, userController.getUserById);

module.exports = router;
