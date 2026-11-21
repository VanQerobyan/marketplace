const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: 'refresh' }, env.jwt.secret, {
    expiresIn: env.jwt.refreshExpiresIn
  });
};

module.exports = generateRefreshToken;
