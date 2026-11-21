const { Server } = require('socket.io');
const { validationResult } = require('express-validator');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const authenticateAccessToken = require('../utils/authenticateAccessToken');
const { sendMessageValidator } = require('../validators/message.validator');
const messageService = require('../services/message.service');
const messageEvents = require('./message.events');

const roomFor = (userId) => `user:${userId}`;
const errorResponse = (error) => ({
  success: false,
  statusCode: error instanceof ApiError ? error.statusCode : 500,
  message: error instanceof ApiError ? error.message : 'Internal server error',
  ...(error instanceof ApiError && error.details ? { errors: error.details } : {})
});

const validateMessage = async (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ApiError(400, 'Message payload must be an object');
  }
  const req = { body: { ...payload } };
  await Promise.all(sendMessageValidator.map((validator) => validator.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array().map(({ path, msg }) => ({ field: path, message: msg })));
  }
  return req.body;
};

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
    allowRequest: (req, callback) => callback(null, !req.headers.origin || req.headers.origin === env.clientUrl),
    maxHttpBufferSize: 32 * 1024
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const { user, expiresAt } = await authenticateAccessToken(token);
      socket.data.userId = user.id;
      socket.data.expiresAt = expiresAt;
      next();
    } catch (error) {
      const response = errorResponse(error);
      const connectionError = new Error(response.message);
      connectionError.data = response;
      next(connectionError);
    }
  });

  io.on('connection', (socket) => {
    // Clients cannot choose rooms or impersonate another account.
    socket.join(roomFor(socket.data.userId));
    let expiryTimer;
    const scheduleExpiry = () => {
      if (!socket.data.expiresAt) return;
      const remaining = socket.data.expiresAt - Date.now();
      if (remaining <= 0) {
        socket.emit('message:error', { success: false, statusCode: 401, message: 'Invalid or expired token' });
        socket.disconnect(true);
        return;
      }
      expiryTimer = setTimeout(scheduleExpiry, Math.min(remaining, 2147483647));
      expiryTimer.unref();
    };
    scheduleExpiry();
    socket.on('disconnect', () => clearTimeout(expiryTimer));

    const handle = (action) => async (payload, acknowledge) => {
      try {
        // Recheck expiry and account existence for every write on a long-lived connection.
        const { user } = await authenticateAccessToken(socket.handshake.auth.token);
        const data = await action(user.id, payload);
        if (typeof acknowledge === 'function') acknowledge({ success: true, data });
      } catch (error) {
        const response = errorResponse(error);
        if (typeof acknowledge === 'function') acknowledge(response);
        else socket.emit('message:error', response);
        if (response.statusCode === 401) socket.disconnect(true);
      }
    };

    socket.on('message:send', handle(async (userId, payload) => {
      const body = await validateMessage(payload);
      return messageService.sendMessage(userId, body);
    }));
    socket.on('message:read', handle(async (userId, payload) => {
      if (!payload || !Number.isInteger(payload.userId) || payload.userId < 1 || payload.userId > 2147483647) {
        throw new ApiError(400, 'User ID must be a positive integer');
      }
      return messageService.markConversationAsRead(userId, payload.userId);
    }));
  });

  const publishMessage = (message) => {
    io.to(roomFor(message.senderId)).to(roomFor(message.receiverId)).emit('message:new', message);
  };
  const publishRead = (receipt) => {
    io.to(roomFor(receipt.readerId)).to(roomFor(receipt.senderId)).emit('message:read', receipt);
  };
  messageEvents.on('message:new', publishMessage);
  messageEvents.on('message:read', publishRead);
  httpServer.once('close', () => {
    messageEvents.off('message:new', publishMessage);
    messageEvents.off('message:read', publishRead);
  });
  return io;
};

module.exports = initializeSocket;
