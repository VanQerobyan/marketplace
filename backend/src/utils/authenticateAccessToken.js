const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('./ApiError');
const requireModel = require('./requireModel');
const sanitizeUser = require('./sanitizeUser');

// Shared by HTTP and Socket.IO so both transports accept the same credentials.
const authenticateAccessToken = async (token) => {
  if (typeof token !== 'string' || !token) throw new ApiError(401, 'Authentication required');
  let decoded;
  try {
    decoded = jwt.verify(token, env.jwt.secret);
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token');
  }
  if (!decoded.userId || decoded.type === 'refresh') throw new ApiError(401, 'Invalid or expired token');
  const user = await requireModel('User').findByPk(decoded.userId);
  if (!user) throw new ApiError(401, 'User no longer exists');
  return { user: sanitizeUser(user), expiresAt: decoded.exp ? decoded.exp * 1000 : null };
};

module.exports = authenticateAccessToken;
