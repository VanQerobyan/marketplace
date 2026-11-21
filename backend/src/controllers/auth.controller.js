const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const googleAuthService = require('../services/googleAuth.service');
const env = require('../config/env');

const googleConfig = (req, res) => {
  res.json({ success: true, data: { clientId: env.googleClientId || null } });
};

const googleSignIn = asyncHandler(async (req, res) => {
  const result = await googleAuthService.googleSignIn(req.body);
  res.json({ success: true, data: result });
});

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, data: result });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body);
  res.status(200).json({ success: true, data: result });
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  res.status(200).json({ success: true, message: 'Password changed successfully' });
});

module.exports = { register, login, me, refresh, changePassword, googleConfig, googleSignIn };
