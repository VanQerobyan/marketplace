const ApiError = require('../utils/ApiError');
const requireModel = require('../utils/requireModel');

const actorInclude = {
  association: 'actor',
  attributes: ['id', 'firstName', 'lastName', 'username', 'avatar'],
  required: false
};

const createNotification = async ({ userId, actorId = null, type, message, listingId = null }, options = {}) => {
  const Notification = requireModel('Notification');
  return Notification.create({ userId, actorId, type, message, listingId, isRead: false }, options);
};

const getNotifications = async (userId) => {
  const Notification = requireModel('Notification');
  return Notification.findAll({
    where: { userId },
    include: [actorInclude],
    order: [['createdAt', 'DESC']]
  });
};

const markAsRead = async (userId, notificationId) => {
  const Notification = requireModel('Notification');
  const notification = await Notification.findOne({
    where: { id: notificationId, userId },
    include: [actorInclude]
  });

  if (!notification) throw new ApiError(404, 'Notification not found');

  notification.isRead = true;
  await notification.save();
  return notification;
};

const markAllAsRead = async (userId) => {
  const Notification = requireModel('Notification');
  await Notification.update({ isRead: true }, { where: { userId, isRead: false } });
};

const deleteNotification = async (userId, notificationId) => {
  const Notification = requireModel('Notification');
  const notification = await Notification.findOne({ where: { id: notificationId, userId } });

  if (!notification) throw new ApiError(404, 'Notification not found');
  await notification.destroy();
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
