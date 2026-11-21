const userService = require('../services/user.service');
const asyncHandler = require('../utils/asyncHandler');

const searchUsers = asyncHandler(async (req, res) => {
  const { items, pagination } = await userService.searchUsers(req.query);
  res.json({ success: true, data: items, pagination });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getMe(req.user.id);
  res.json({ success: true, data: user });
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateMe(req.user.id, req.body);
  res.json({ success: true, data: user });
});

const updateAvatar = asyncHandler(async (req, res) => {
  const user = await userService.updateAvatar(req.user.id, req.file.filename);
  res.json({ success: true, data: user });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getPublicUser(req.params.id);
  res.json({ success: true, data: user });
});

module.exports = { searchUsers, getMe, updateMe, updateAvatar, getUserById };
