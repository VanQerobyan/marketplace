const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');
const generateRefreshToken = require('../utils/generateRefreshToken');
const requireModel = require('../utils/requireModel');
const sanitizeUser = require('../utils/sanitizeUser');

const register = async ({ firstName, lastName, username, email, password }) => {
  const User = requireModel('User');

  const existingUser = await User.findOne({
    where: {
      [Op.or]: [
        { username },
        { email }
      ]
    }
  });

  if (existingUser) {
    if (existingUser.username === username) {
      throw new ApiError(409, 'Username already exists');
    }
    if (existingUser.email === email) {
      throw new ApiError(409, 'Email already exists');
    }
    throw new ApiError(409, 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    password: hashedPassword
  });

  return {
    user: sanitizeUser(user)
  };
};

const login = async ({ username, password }) => {
  const User = requireModel('User');

  const user = await User.findOne({ where: { username } });

  if (!user || !user.password) {
    throw new ApiError(401, 'Invalid username or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid username or password');
  }

  return {
    user: sanitizeUser(user),
    token: generateToken(user.id),
    refreshToken: generateRefreshToken(user.id)
  };
};

const refresh = async ({ refreshToken }) => {
  let decoded;

  try {
    decoded = jwt.verify(refreshToken, env.jwt.secret, { algorithms: ['HS256'] });
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  if (decoded.type !== 'refresh' || !decoded.userId) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const User = requireModel('User');
  const user = await User.findByPk(decoded.userId);

  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }

  return { token: generateToken(user.id) };
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const User = requireModel('User');
  const user = await User.findByPk(userId);

  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }

  const previousHash = user.password;
  if (!previousHash) {
    throw new ApiError(400, 'This account uses Google sign-in. Manage your password in your Google Account.');
  }
  const passwordMatches = await bcrypt.compare(currentPassword, previousHash);

  if (!passwordMatches) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  // Do not overwrite a password changed by another request after verification.
  const [updatedCount] = await User.update(
    { password: hashedPassword },
    { where: { id: userId, password: previousHash } }
  );

  if (!updatedCount) {
    throw new ApiError(409, 'Password changed during this request. Please try again');
  }
};

module.exports = {
  register,
  login,
  refresh,
  changePassword
};
