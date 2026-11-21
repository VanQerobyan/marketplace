const { OAuth2Client } = require('google-auth-library');
const env = require('../config/env');
const ApiError = require('./ApiError');

const client = new OAuth2Client();

const verifyGoogleCredential = async (credential, nonce) => {
  if (!env.googleClientId) throw new ApiError(503, 'Google sign-in is currently unavailable');

  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: env.googleClientId });
    payload = ticket.getPayload();
  } catch (error) {
    if (error.code || error.response?.status >= 500) {
      throw new ApiError(503, 'Unable to reach Google. Please try again.');
    }
    throw new ApiError(401, 'Invalid or expired Google credential. Please try again.');
  }

  if (!payload || typeof payload.sub !== 'string' || !payload.sub || payload.sub.length > 255 ||
      payload.email_verified !== true || typeof payload.email !== 'string' ||
      payload.nonce !== nonce) {
    throw new ApiError(401, 'Unable to verify your Google account. Please try again.');
  }

  return payload;
};

module.exports = verifyGoogleCredential;
