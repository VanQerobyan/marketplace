const sanitizeUser = (user) => {
  if (!user) return null;

  const plainUser = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
  plainUser.hasPassword = Boolean(plainUser.password);
  delete plainUser.password;
  delete plainUser.googleId;
  return plainUser;
};

module.exports = sanitizeUser;
