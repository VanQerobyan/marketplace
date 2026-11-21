const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const authenticateAccessToken = require('../utils/authenticateAccessToken');

const authenticate = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required');
  }

  const { user } = await authenticateAccessToken(authorization.split(' ')[1]);
  req.user = user;
  next();
});

module.exports = authenticate;
