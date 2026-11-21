const { Op, QueryTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const ApiError = require('../utils/ApiError');
const requireModel = require('../utils/requireModel');
const messageEvents = require('../realtime/message.events');

const publicUserFields = ['id', 'firstName', 'lastName', 'username', 'avatar'];

const requireOtherUser = async (userId, otherUserId) => {
  if (Number(userId) === Number(otherUserId)) throw new ApiError(400, 'You cannot message yourself');
  const user = await requireModel('User').findByPk(otherUserId, { attributes: ['id'] });
  if (!user) throw new ApiError(404, 'User not found');
};

const paginationFor = (query, totalItems) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  return { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) };
};

const sendMessage = async (senderId, payload) => {
  const { receiverId, content } = payload;
  const listingId = payload.listingId ?? null;
  await requireOtherUser(senderId, receiverId);
  if (listingId !== null && !await requireModel('Listing').findByPk(listingId, { attributes: ['id'] })) {
    throw new ApiError(404, 'Listing not found');
  }

  // A failed notification must not leave a sent message behind and invite retries.
  const savedMessage = await sequelize.transaction(async (transaction) => {
    const message = await requireModel('Message').create({
      senderId, receiverId, content, listingId, isRead: false
    }, { transaction });
    await requireModel('Notification').create({
      userId: receiverId,
      actorId: senderId,
      type: 'message',
      message: 'You have a new message',
      listingId,
      isRead: false
    }, { transaction });
    return message;
  });
  messageEvents.emit('message:new', typeof savedMessage.toJSON === 'function' ? savedMessage.toJSON() : savedMessage);
  return savedMessage;
};

const getMessages = async (userId, otherUserId, query) => {
  await requireOtherUser(userId, otherUserId);
  const { page, limit } = paginationFor(query, 0);
  const { rows, count } = await requireModel('Message').findAndCountAll({
    where: {
      [Op.or]: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    },
    include: [
      { association: 'sender', attributes: publicUserFields },
      { association: 'receiver', attributes: publicUserFields }
    ],
    order: [['id', 'DESC']],
    limit,
    offset: (page - 1) * limit
  });
  return { data: rows, pagination: paginationFor(query, count) };
};

const getConversations = async (userId, query) => {
  const { page, limit } = paginationFor(query, 0);
  // One row per peer, with the latest message and incoming unread count.
  // Filtering before grouping prevents access to other users' conversations.
  const [result] = await sequelize.query(`
    WITH relevant AS (
      SELECT m.*, CASE WHEN "senderId" = :userId THEN "receiverId" ELSE "senderId" END AS "peerId"
      FROM messages m WHERE "senderId" = :userId OR "receiverId" = :userId
    ), ranked AS (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY "peerId" ORDER BY id DESC) AS position,
        COUNT(*) FILTER (WHERE "receiverId" = :userId AND "isRead" = false)
          OVER (PARTITION BY "peerId") AS "unreadCount"
      FROM relevant
    ), summaries AS (
      SELECT r.id AS "lastMessageId",
        json_build_object('id', u.id, 'firstName', u."firstName", 'lastName', u."lastName",
          'username', u.username, 'avatar', u.avatar) AS "user",
        json_build_object('id', r.id, 'senderId', r."senderId", 'receiverId', r."receiverId",
          'content', r.content, 'listingId', r."listingId", 'isRead', r."isRead",
          'createdAt', r."createdAt", 'updatedAt', r."updatedAt") AS "lastMessage",
        r."unreadCount"::integer AS "unreadCount"
      FROM ranked r JOIN users u ON u.id = r."peerId" WHERE r.position = 1
    )
    SELECT (SELECT COUNT(*)::integer FROM summaries) AS "totalItems",
      COALESCE((SELECT json_agg(p) FROM (
        SELECT "user", "lastMessage", "unreadCount" FROM summaries
        ORDER BY "lastMessageId" DESC LIMIT :limit OFFSET :offset
      ) p), '[]'::json) AS data
  `, { replacements: { userId, limit, offset: (page - 1) * limit }, type: QueryTypes.SELECT });
  return { data: result.data, pagination: paginationFor(query, result.totalItems) };
};

const markConversationAsRead = async (userId, otherUserId) => {
  await requireOtherUser(userId, otherUserId);
  const { updatedCount, notificationCount } = await sequelize.transaction(async (transaction) => {
    const [updatedCount] = await requireModel('Message').update({ isRead: true }, {
      where: { senderId: otherUserId, receiverId: userId, isRead: false },
      transaction
    });
    const [notificationCount] = await requireModel('Notification').update({ isRead: true }, {
      where: { userId, actorId: otherUserId, type: 'message', isRead: false },
      transaction
    });
    return { updatedCount, notificationCount };
  });
  if (updatedCount > 0 || notificationCount > 0) {
    messageEvents.emit('message:read', { readerId: userId, senderId: otherUserId, updatedCount });
  }
  return { updatedCount };
};

module.exports = { sendMessage, getMessages, getConversations, markConversationAsRead };
