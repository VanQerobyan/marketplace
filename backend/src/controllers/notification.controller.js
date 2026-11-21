const notificationService = require('../services/notification.service');
const asyncHandler = require('../utils/asyncHandler');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getNotifications(req.user.id);
  res.json({ success: true, data: notifications });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.user.id, req.params.id);
  res.json({ success: true, data: notification });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);
  res.json({ success: true, message: 'All notifications marked as read' });
});

const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.user.id, req.params.id);
  res.status(204).send();
});

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
