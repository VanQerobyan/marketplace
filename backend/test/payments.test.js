const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'production';
const env = require('../src/config/env');
const stripeConfig = require('../src/config/stripe');
const realGetStripeClient = stripeConfig.getStripeClient;
const { User, Listing, Order } = require('../src/models');
const router = require('../src/routes/payment.routes');
const errorHandler = require('../src/middlewares/error.middleware');

let listing;
let checkout;
let paidSession;
let stripe;
let orders;
let savedKey;

beforeEach((context) => {
  savedKey = env.stripeTestSecretKey;
  env.stripeTestSecretKey = 'sk_test_onlyForTests';
  listing = { id: 5, userId: 35, title: 'Test phone', price: '12.50', status: 'active' };
  checkout = { id: 'cs_test_demo', livemode: false, url: 'https://checkout.stripe.com/c/pay/cs_test_demo' };
  paidSession = {
    id: 'cs_test_demo', livemode: false, mode: 'payment', status: 'complete', payment_status: 'paid',
    currency: 'usd', amount_total: 1250,
    metadata: { buyerId: '2', listingId: '5', title: 'Test phone', amount: '1250' }
  };
  orders = new Map();
  stripe = { checkout: { sessions: { create: async () => checkout, retrieve: async () => paidSession } } };
  context.mock.method(stripe.checkout.sessions, 'create');
  context.mock.method(stripe.checkout.sessions, 'retrieve');
  context.mock.method(stripeConfig, 'getStripeClient', () => stripe);
  context.mock.method(User, 'findByPk', async (id) => ({ id: Number(id) }));
  context.mock.method(Listing, 'findByPk', async () => listing);
  context.mock.method(Order, 'findOrCreate', async ({ where, defaults }) => {
    if (orders.has(where.stripeSessionId)) return [orders.get(where.stripeSessionId), false];
    const order = { id: orders.size + 1, ...defaults, ...where };
    orders.set(where.stripeSessionId, order);
    return [order, true];
  });
  context.mock.method(Order, 'findAndCountAll', async () => ({ rows: [], count: 0 }));
});

afterEach((context) => {
  env.stripeTestSecretKey = savedKey;
  context.mock.restoreAll();
});

const request = (method, url, body = {}, token = jwt.sign({ userId: 2 }, env.jwt.secret)) => new Promise((resolve, reject) => {
  const req = { method, url, body, query: Object.fromEntries(new URL(url, 'http://test').searchParams), headers: token ? { authorization: `Bearer ${token}` } : {} };
  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(value) { resolve({ status: this.statusCode, body: value }); }
  };
  router.handle(req, res, (error) => {
    if (!error) return reject(new Error(`No route matched ${method} ${url}`));
    Promise.resolve(errorHandler(error, req, res, reject)).catch(reject);
  });
});

test('every payment endpoint requires an access token', async () => {
  for (const [method, url, body] of [
    ['GET', '/config'], ['GET', '/mine'], ['POST', '/checkout', { listingId: 5 }], ['POST', '/confirm', { sessionId: 'cs_test_demo' }]
  ]) {
    for (const token of [null, 'invalid', jwt.sign({ userId: 2, type: 'refresh' }, env.jwt.secret)]) {
      assert.equal((await request(method, url, body, token)).status, 401);
    }
  }
  assert.equal(stripeConfig.getStripeClient.mock.calls.length, 0);
});

test('missing and live keys disable payments before a Stripe request; config never returns keys', async () => {
  stripeConfig.getStripeClient.mock.restore();
  for (const key of ['', 'sk_live_doNotUse', 'rk_live_doNotUse', 'rk_test_notSupported', 'sk_test_']) {
    env.stripeTestSecretKey = key;
    assert.deepEqual((await request('GET', '/config')).body, { success: true, data: { enabled: false, testMode: true } });
    assert.equal((await request('POST', '/checkout', { listingId: 5 })).status, 503);
    assert.equal((await request('POST', '/confirm', { sessionId: 'cs_test_demo' })).status, 503);
    assert.throws(() => realGetStripeClient(), error => error.statusCode === 503);
  }
  env.stripeTestSecretKey = 'sk_test_onlyForTests';
  assert.equal(stripeConfig.isTestPaymentConfigured(), true);
  assert.doesNotThrow(() => realGetStripeClient());
  assert.deepEqual((await request('GET', '/config')).body, { success: true, data: { enabled: true, testMode: true } });
});

test('checkout uses the stored price and authenticated buyer, ignoring submitted price and identity', async () => {
  const response = await request('POST', '/checkout', { listingId: 5, amount: 1, price: 0.01, buyerId: 999, currency: 'eur' });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { success: true, data: { url: checkout.url } });
  const [payload] = stripe.checkout.sessions.create.mock.calls[0].arguments;
  assert.equal(payload.mode, 'payment');
  assert.deepEqual(payload.allowed_payment_method_types, ['card']);
  assert.equal(Object.hasOwn(payload, 'payment_method_types'), false);
  assert.deepEqual(payload.adaptive_pricing, { enabled: false });
  assert.deepEqual(payload.line_items, [{ price_data: { currency: 'usd', product_data: { name: 'Test phone' }, unit_amount: 1250 }, quantity: 1 }]);
  assert.deepEqual(payload.metadata, { buyerId: '2', listingId: '5', title: 'Test phone', amount: '1250' });
  assert.equal(payload.success_url, `${env.clientUrl.replace(/\/$/, '')}/account/payments/success?session_id={CHECKOUT_SESSION_ID}`);
  assert.equal(payload.cancel_url, `${env.clientUrl.replace(/\/$/, '')}/account/listings/5?payment=cancelled`);
  assert.equal(Order.findOrCreate.mock.calls.length, 0);
});

test('invalid listing IDs and live or malformed session IDs never reach Stripe', async () => {
  for (const listingId of [undefined, 0, -1, 2.5, '5', [5], {}, 2147483648]) {
    assert.equal((await request('POST', '/checkout', { listingId })).status, 400);
  }
  for (const sessionId of [undefined, 123, ['cs_test_demo'], 'cs_live_demo', 'cs_test_', 'cs_test_a/b', `cs_test_${'a'.repeat(255)}`]) {
    assert.equal((await request('POST', '/confirm', { sessionId })).status, 400);
  }
  assert.equal(stripeConfig.getStripeClient.mock.calls.length, 0);
});

test('missing, own, reserved and sold listings cannot open checkout', async () => {
  listing = null;
  assert.equal((await request('POST', '/checkout', { listingId: 5 })).status, 404);
  listing = { id: 5, userId: 2, title: 'Own listing', price: '12.50', status: 'active' };
  assert.equal((await request('POST', '/checkout', { listingId: 5 })).status, 400);
  listing.userId = 35;
  for (const status of ['sold', 'reserved']) {
    listing.status = status;
    assert.equal((await request('POST', '/checkout', { listingId: 5 })).status, 409);
  }
  assert.equal(stripe.checkout.sessions.create.mock.calls.length, 0);
});

test('Stripe amount boundaries are checked and dollars convert to cents', async () => {
  for (const price of ['0.00', '0.49', '1000000.00', 'invalid', 'Infinity']) {
    listing.price = price;
    assert.equal((await request('POST', '/checkout', { listingId: 5 })).status, 400);
  }
  for (const [price, cents] of [['0.50', 50], ['19.99', 1999], ['999999.99', 99999999]]) {
    listing.price = price;
    assert.equal((await request('POST', '/checkout', { listingId: 5 })).status, 200);
    assert.equal(stripe.checkout.sessions.create.mock.calls.at(-1).arguments[0].line_items[0].price_data.unit_amount, cents);
  }
});

test('a live checkout response or provider failure cannot redirect to payment', async (context) => {
  checkout.livemode = true;
  assert.equal((await request('POST', '/checkout', { listingId: 5 })).status, 502);
  checkout.livemode = false;
  checkout.id = 'cs_live_demo';
  assert.equal((await request('POST', '/checkout', { listingId: 5 })).status, 502);
  context.mock.method(stripe.checkout.sessions, 'create', async () => { throw new Error('private provider details'); });
  const response = await request('POST', '/checkout', { listingId: 5 });
  assert.equal(response.status, 502);
  assert.doesNotMatch(JSON.stringify(response.body), /private provider details/);
});

test('confirmed Stripe payment saves the trusted snapshot and repeated returns use the same order', async () => {
  listing.price = '900.00';
  listing.title = 'Changed after checkout';
  const response = await request('POST', '/confirm', { sessionId: 'cs_test_demo', amount: 1, buyerId: 999, status: 'paid' });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body.data, {
    id: 1, buyerId: 2, listingId: 5, title: 'Test phone', amount: 1250,
    currency: 'usd', status: 'paid_test', stripeSessionId: 'cs_test_demo'
  });
  const repeated = await Promise.all([request('POST', '/confirm', { sessionId: 'cs_test_demo' }), request('POST', '/confirm', { sessionId: 'cs_test_demo' })]);
  assert.equal(orders.size, 1);
  assert.ok(repeated.every(result => result.body.data.id === 1));
  assert.deepEqual(Order.findOrCreate.mock.calls[0].arguments[0].where, { stripeSessionId: 'cs_test_demo' });
  assert.equal(listing.status, 'active');
});

test('another buyer, a live session, incomplete or unpaid checkout cannot create an order', async () => {
  const original = structuredClone(paidSession);
  for (const [patch, status] of [
    [{ metadata: { ...original.metadata, buyerId: '999' } }, 404],
    [{ livemode: true }, 400], [{ id: 'cs_test_other' }, 400],
    [{ mode: 'subscription' }, 409], [{ status: 'open' }, 409], [{ status: 'expired' }, 409],
    [{ payment_status: 'unpaid' }, 409], [{ payment_status: 'no_payment_required' }, 409],
    [{ amount_total: 50 }, 400], [{ currency: 'eur' }, 400],
    [{ metadata: { ...original.metadata, title: '' } }, 400],
    [{ metadata: { ...original.metadata, listingId: 'invalid' } }, 400]
  ]) {
    paidSession = { ...original, ...patch };
    assert.equal((await request('POST', '/confirm', { sessionId: 'cs_test_demo' })).status, status);
  }
  assert.equal(Order.findOrCreate.mock.calls.length, 0);
});

test('provider and database failures never report payment success', async (context) => {
  context.mock.method(stripe.checkout.sessions, 'retrieve', async () => { throw new Error('secret provider failure'); });
  const providerFailure = await request('POST', '/confirm', { sessionId: 'cs_test_demo' });
  assert.equal(providerFailure.status, 502);
  assert.doesNotMatch(JSON.stringify(providerFailure.body), /secret provider failure/);
  assert.equal(Order.findOrCreate.mock.calls.length, 0);
  context.mock.method(stripe.checkout.sessions, 'retrieve', async () => { throw Object.assign(new Error('missing'), { code: 'resource_missing' }); });
  assert.equal((await request('POST', '/confirm', { sessionId: 'cs_test_demo' })).status, 404);
  context.mock.method(stripe.checkout.sessions, 'retrieve', async () => paidSession);
  context.mock.method(Order, 'findOrCreate', async () => { throw new Error('Database unavailable'); });
  assert.equal((await request('POST', '/confirm', { sessionId: 'cs_test_demo' })).body.success, false);
});

test('a deleted listing preserves the verified purchase snapshot', async () => {
  listing = null;
  const response = await request('POST', '/confirm', { sessionId: 'cs_test_demo' });
  assert.equal(response.status, 200);
  assert.equal(response.body.data.listingId, null);
  assert.equal(response.body.data.title, 'Test phone');
});

test('purchase history is restricted to the authenticated buyer and validates pagination', async () => {
  const response = await request('GET', '/mine?page=2&buyerId=999');
  assert.deepEqual(response.body, { success: true, data: [], pagination: { page: 2, limit: 12, totalItems: 0, totalPages: 0 } });
  assert.deepEqual(Order.findAndCountAll.mock.calls[0].arguments[0], { where: { buyerId: 2 }, order: [['id', 'DESC']], limit: 12, offset: 12 });
  for (const page of ['0', '-1', '1.5', '1000001', 'invalid']) {
    assert.equal((await request('GET', `/mine?page=${page}`)).status, 400);
  }
});
