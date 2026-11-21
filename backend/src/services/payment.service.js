const env = require('../config/env');
const stripeConfig = require('../config/stripe');
const ApiError = require('../utils/ApiError');
const requireModel = require('../utils/requireModel');

const createCheckout = async (buyerId, listingId) => {
  const stripe = stripeConfig.getStripeClient();
  const listing = await requireModel('Listing').findByPk(listingId);

  if (!listing) throw new ApiError(404, 'Listing not found');
  if (Number(listing.userId) === Number(buyerId)) throw new ApiError(400, 'You cannot buy your own listing');
  if (listing.status !== 'active') throw new ApiError(409, 'This listing is not available for purchase');

  // Գինը վերցնում ենք բազայից, ոչ թե frontend-ից։
  const amount = Math.round(Number(listing.price) * 100);
  if (!Number.isSafeInteger(amount) || amount < 50 || amount > 99999999) {
    throw new ApiError(400, 'Test checkout supports prices from $0.50 to $999,999.99');
  }

  const clientUrl = env.clientUrl.replace(/\/$/, '');
  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      allowed_payment_method_types: ['card'],
      adaptive_pricing: { enabled: false },
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: listing.title },
          unit_amount: amount
        },
        quantity: 1
      }],
      metadata: { buyerId: String(buyerId), listingId: String(listing.id), title: listing.title, amount: String(amount) },
      success_url: `${clientUrl}/account/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/account/listings/${listing.id}?payment=cancelled`
    });
  } catch (error) {
    throw new ApiError(502, 'Unable to open test checkout. Please check the Stripe test key and try again.');
  }

  if (session.livemode !== false || !session.id.startsWith('cs_test_') || !session.url) {
    throw new ApiError(502, 'Only test checkout sessions are allowed');
  }

  return { url: session.url };
};

const confirmPayment = async (buyerId, sessionId) => {
  const stripe = stripeConfig.getStripeClient();
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    if (error.code === 'resource_missing') throw new ApiError(404, 'Test payment not found');
    throw new ApiError(502, 'Unable to check the test payment. Please try again.');
  }

  if (session.livemode !== false || session.id !== sessionId || !session.id.startsWith('cs_test_')) {
    throw new ApiError(400, 'Only test payments are allowed');
  }
  if (session.metadata?.buyerId !== String(buyerId)) throw new ApiError(404, 'Test payment not found');
  if (session.mode !== 'payment' || session.status !== 'complete' || session.payment_status !== 'paid') {
    throw new ApiError(409, 'The test payment has not completed. No purchase was saved.');
  }

  const amount = Number(session.metadata.amount);
  const listingId = Number(session.metadata.listingId);
  const title = session.metadata.title;
  if (!Number.isSafeInteger(amount) || amount < 50 || amount > 99999999 || session.amount_total !== amount ||
      session.currency !== 'usd' || !Number.isInteger(listingId) || listingId < 1 || listingId > 2147483647 ||
      typeof title !== 'string' || !title || title.length > 150) {
    throw new ApiError(400, 'Test payment details do not match the purchase');
  }

  const listing = await requireModel('Listing').findByPk(listingId);
  // Էջի refresh-ը նույն պատվերը երկրորդ անգամ չի ստեղծում։
  const [order] = await requireModel('Order').findOrCreate({
    where: { stripeSessionId: session.id },
    defaults: { buyerId, listingId: listing ? listingId : null, title, amount, currency: 'usd', status: 'paid_test' }
  });
  return order;
};

const getMyPurchases = async (buyerId, query) => {
  const page = Number(query.page || 1);
  const limit = 12;
  const { rows, count } = await requireModel('Order').findAndCountAll({
    where: { buyerId },
    order: [['id', 'DESC']],
    limit,
    offset: (page - 1) * limit
  });
  return { items: rows, pagination: { page, limit, totalItems: count, totalPages: Math.ceil(count / limit) } };
};

module.exports = { createCheckout, confirmPayment, getMyPurchases };
