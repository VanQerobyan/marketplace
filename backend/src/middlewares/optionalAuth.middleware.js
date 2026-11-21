const authenticate = require('./auth.middleware');

// Public listing reads may identify a signed-in viewer without requiring a login.
module.exports = (req, res, next) => {
  if (!req.headers.authorization) return next();
  return authenticate(req, res, next);
};
