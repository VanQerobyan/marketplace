const messageService = require('../services/message.service');
const asyncHandler = require('../utils/asyncHandler');

const sendMessage = asyncHandler(async (req, res) => {
  const message = await messageService.sendMessage(req.user.id, req.body);
  res.status(201).json({ success: true, data: message });
});

const getMessages = asyncHandler(async (req, res) => {
  const result = await messageService.getMessages(req.user.id, Number(req.params.userId), req.query);
  res.json({ success: true, ...result });
});

const getConversations = asyncHandler(async (req, res) => {
  const result = await messageService.getConversations(req.user.id, req.query);
  res.json({ success: true, ...result });
});

const markConversationAsRead = asyncHandler(async (req, res) => {
  const result = await messageService.markConversationAsRead(req.user.id, Number(req.params.userId));
  res.json({ success: true, data: result });
});

module.exports = { sendMessage, getMessages, getConversations, markConversationAsRead };
