const express = require('express');
const controller = require('../controllers/message.controller');
const authenticate = require('../middlewares/auth.middleware');
const validateRequest = require('../middlewares/validation.middleware');
const { sendMessageValidator, userIdValidator, paginationValidator } = require('../validators/message.validator');

const router = express.Router();
router.use(authenticate);
router.post('/', sendMessageValidator, validateRequest, controller.sendMessage);
router.get('/conversations', paginationValidator, validateRequest, controller.getConversations);
router.get('/user/:userId', userIdValidator, paginationValidator, validateRequest, controller.getMessages);
router.patch('/user/:userId/read', userIdValidator, validateRequest, controller.markConversationAsRead);

module.exports = router;
