const { Op, fn, col } = require('sequelize');
const path = require('path');
const { unlink } = require('fs/promises');
const ApiError = require('../utils/ApiError');
const requireModel = require('../utils/requireModel');
const sanitizeUser = require('../utils/sanitizeUser');

const searchUsers = async (query) => {
  const User = requireModel('User');
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 12;
  const terms = query.search.trim().split(/\s+/);

  const { rows, count } = await User.findAndCountAll({
    attributes: ['id', 'firstName', 'lastName', 'username', 'avatar'],
    where: {
      [Op.and]: terms.map((term) => {
        // Treat LIKE wildcards literally, including underscores in usernames.
        const pattern = `%${term.replace(/[\\%_]/g, '\\$&')}%`;
        return {
          [Op.or]: ['firstName', 'lastName', 'username'].map((field) => ({
            [field]: { [Op.iLike]: pattern }
          }))
        };
      })
    },
    order: [['username', 'ASC'], ['id', 'ASC']],
    limit,
    offset: (page - 1) * limit
  });

  return {
    items: rows,
    pagination: { page, limit, totalItems: count, totalPages: Math.ceil(count / limit) }
  };
};

const getAverageRating = async (userId) => {
  const Rating = requireModel('Rating');

  const result = await Rating.findOne({
    attributes: [
      [fn('AVG', col('rating')), 'averageRating'],
      [fn('COUNT', col('id')), 'ratingsCount']
    ],
    where: { ratedUserId: userId },
    raw: true
  });

  return {
    averageRating: result?.averageRating ? Number(Number(result.averageRating).toFixed(2)) : 0,
    ratingsCount: Number(result?.ratingsCount || 0)
  };
};

const getMe = async (userId) => {
  const User = requireModel('User');
  const user = await User.findByPk(userId);

  if (!user) throw new ApiError(404, 'User not found');

  const rating = await getAverageRating(userId);
  return { ...sanitizeUser(user), ...rating };
};

const getPublicUser = async (userId) => {
  const User = requireModel('User');
  const user = await User.findByPk(userId);

  if (!user) throw new ApiError(404, 'User not found');

  const plain = sanitizeUser(user);
  const rating = await getAverageRating(userId);

  return {
    id: plain.id,
    firstName: plain.firstName,
    lastName: plain.lastName,
    username: plain.username,
    avatar: plain.avatar ?? null,
    createdAt: plain.createdAt,
    ...rating
  };
};

const updateMe = async (userId, updates) => {
  const User = requireModel('User');
  const user = await User.findByPk(userId);

  if (!user) throw new ApiError(404, 'User not found');

  if (updates.username || updates.email) {
    const conditions = [];
    if (updates.username) conditions.push({ username: updates.username });
    if (updates.email) conditions.push({ email: updates.email });

    const duplicate = await User.findOne({
      where: {
        id: { [Op.ne]: userId },
        [Op.or]: conditions
      }
    });

    if (duplicate) {
      if (updates.username && duplicate.username === updates.username) {
        throw new ApiError(409, 'Username already exists');
      }
      if (updates.email && duplicate.email === updates.email) {
        throw new ApiError(409, 'Email already exists');
      }
    }
  }

  const allowedFields = ['firstName', 'lastName', 'username', 'email'];
  for (const field of allowedFields) {
    if (updates[field] !== undefined) user[field] = updates[field];
  }

  await user.save();
  return sanitizeUser(user);
};

const removeAvatarFile = async (avatar) => {
  const prefix = '/uploads/avatars/';
  if (!avatar || !avatar.startsWith(prefix)) return;
  const filename = avatar.slice(prefix.length);
  if (!filename || path.basename(filename) !== filename) return;

  try {
    await unlink(path.resolve(__dirname, '../../uploads/avatars', filename));
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Failed to remove avatar:', error.message);
  }
};

const updateAvatar = async (userId, filename) => {
  const avatar = `/uploads/avatars/${filename}`;
  let user;
  let previousAvatar;

  try {
    const User = requireModel('User');
    user = await User.findByPk(userId);
    if (!user) throw new ApiError(404, 'User not found');

    previousAvatar = user.avatar;
    user.avatar = avatar;
    await user.save();
  } catch (error) {
    await removeAvatarFile(avatar);
    throw error;
  }

  if (previousAvatar !== avatar) await removeAvatarFile(previousAvatar);
  return sanitizeUser(user);
};

module.exports = {
  searchUsers,
  getMe,
  getPublicUser,
  updateMe,
  updateAvatar,
  getAverageRating
};
