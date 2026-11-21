const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateToken = (userId) => {
  return jwt.sign({ userId }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn
  });
};

module.exports = generateToken;
