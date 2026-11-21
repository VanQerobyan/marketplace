const { randomBytes } = require('node:crypto');
const { Op, UniqueConstraintError } = require('sequelize');
const validator = require('validator');
const bcrypt = require('bcrypt');
const verifyGoogleCredential = require('../utils/verifyGoogleCredential');
const requireModel = require('../utils/requireModel');
const ApiError = require('../utils/ApiError');
const sanitizeUser = require('../utils/sanitizeUser');
const generateToken = require('../utils/generateToken');
const generateRefreshToken = require('../utils/generateRefreshToken');

const sessionFor = (user) => ({
  user: sanitizeUser(user),
  token: generateToken(user.id),
  refreshToken: generateRefreshToken(user.id)
});

const googleSignIn = async ({ credential, nonce, password }) => {
  const profile = await verifyGoogleCredential(credential, nonce);
  const User = requireModel('User');
  // Match the normalization used by password registration, including Gmail aliases.
  const email = validator.normalizeEmail(profile.email);
  if (!email || email.length > 255 || !validator.isEmail(email)) {
    throw new ApiError(401, 'Your Google account does not have a valid email address');
  }

  // A Google subject is the stable identity; an email may change later.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const linked = await User.findOne({ where: { googleId: profile.sub } });
    if (linked) return sessionFor(linked);

    const existing = await User.findOne({ where: { email: { [Op.iLike]: email } } });
    if (existing) {
      if (existing.googleId && existing.googleId !== profile.sub) {
        throw new ApiError(409, 'An account with this email already exists. Please sign in with your username and password.');
      }
      // Email alone does not prove ownership of an existing local account.
      // Ask for its password once before binding the stable Google subject.
      if (!existing.password) throw new ApiError(409, 'This email belongs to another account. Please use its existing sign-in method.');
      if (!password) throw new ApiError(409, 'Enter your existing account password to connect Google.', [{ code: 'GOOGLE_LINK_REQUIRED' }]);
      if (!await bcrypt.compare(password, existing.password)) {
        throw new ApiError(401, 'Incorrect account password. Please try again.', [{ code: 'GOOGLE_LINK_REQUIRED' }]);
      }
      try {
        const [updated] = await User.update(
          { googleId: profile.sub },
          { where: { id: existing.id, email: existing.email, password: existing.password, googleId: null } }
        );
        if (updated) return sessionFor(await User.findByPk(existing.id));
      } catch (error) {
        if (!(error instanceof UniqueConstraintError)) throw error;
      }
      continue;
    }

    try {
      const user = await User.create({
        firstName: (profile.given_name || profile.name || 'Google user').trim().slice(0, 50),
        lastName: (profile.family_name || '').trim().slice(0, 50),
        username: `user_${randomBytes(10).toString('hex')}`,
        email,
        googleId: profile.sub,
        password: null
      });
      return sessionFor(user);
    } catch (error) {
      // A concurrent sign-in may have just created or linked the account.
      if (!(error instanceof UniqueConstraintError)) throw error;
    }
  }

  throw new ApiError(409, 'Your account changed during sign-in. Please try again.');
};

module.exports = { googleSignIn };
