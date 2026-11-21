const Stripe = require('stripe');
const env = require('./env');
const ApiError = require('../utils/ApiError');

const isTestPaymentConfigured = () => /^sk_test_[A-Za-z0-9]+$/.test(env.stripeTestSecretKey);

const getStripeClient = () => {
  // Ընդունում ենք միայն test բանալի. live բանալիով վճարում չի ստեղծվի։
  if (!isTestPaymentConfigured()) {
    throw new ApiError(503, 'Test payments are unavailable. Only Stripe test keys are allowed.');
  }

  return new Stripe(env.stripeTestSecretKey, { timeout: 15000, maxNetworkRetries: 1 });
};

module.exports = { isTestPaymentConfigured, getStripeClient };
