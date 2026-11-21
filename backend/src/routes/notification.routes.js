const express = require('express');
const { param } = require('express-validator');
const notificationController = require('../controllers/notification.controller');
const authenticate = require('../middlewares/auth.middleware');
const validateRequest = require('../middlewares/validation.middleware');

const router = express.Router();

router.use(authenticate);
router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', param('id').isInt({ min: 1 }), validateRequest, notificationController.markAsRead);
router.delete('/:id', param('id').isInt({ min: 1 }), validateRequest, notificationController.deleteNotification);

module.exports = router;
