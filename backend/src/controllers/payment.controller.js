const paymentService = require('../services/payment.service');
const stripeConfig = require('../config/stripe');
const asyncHandler = require('../utils/asyncHandler');

const getConfig = (req, res) => {
  res.json({ success: true, data: { enabled: stripeConfig.isTestPaymentConfigured(), testMode: true } });
};

const createCheckout = asyncHandler(async (req, res) => {
  const result = await paymentService.createCheckout(req.user.id, req.body.listingId);
  res.json({ success: true, data: result });
});

const confirmPayment = asyncHandler(async (req, res) => {
  const order = await paymentService.confirmPayment(req.user.id, req.body.sessionId);
  res.json({ success: true, data: order });
});

const getMyPurchases = asyncHandler(async (req, res) => {
  const result = await paymentService.getMyPurchases(req.user.id, req.query);
  res.json({ success: true, data: result.items, pagination: result.pagination });
});

module.exports = { getConfig, createCheckout, confirmPayment, getMyPurchases };
