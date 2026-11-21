const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { UniqueConstraintError } = require('sequelize');

process.env.NODE_ENV = 'production';

const env = require('../src/config/env');
const { sequelize } = require('../src/config/database');
const { User, Listing, Rating, ListingRating, Notification } = require('../src/models');
const router = require('../src/routes/rating.routes');
const errorHandler = require('../src/middlewares/error.middleware');

beforeEach((context) => {
  context.mock.method(sequelize, 'transaction', async (callback) => callback({ testTransaction: true }));
  context.mock.method(User, 'findByPk', async (id) => ({ id: Number(id) }));
  context.mock.method(Listing, 'findByPk', async (id) => ({ id: Number(id), userId: 35 }));
  context.mock.method(ListingRating, 'findOne', async () => null);
  context.mock.method(ListingRating, 'create', async (values) => ({ id: 1, ...values }));
});

afterEach((context) => context.mock.restoreAll());

// Real routing, authentication, validation, controller and service; no live DB writes.
const request = (url, body, token = jwt.sign({ userId: 2 }, env.jwt.secret)) => new Promise((resolve, reject) => {
  const req = { method: 'POST', url, body, headers: token ? { authorization: `Bearer ${token}` } : {} };
  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(value) { resolve({ status: this.statusCode, body: value }); }
  };
  router.handle(req, res, (error) => {
    if (!error) return reject(new Error(`No route matched ${url}`));
    Promise.resolve(errorHandler(error, req, res, reject)).catch(reject);
  });
});

test('listing rating uses the authenticated rater and path listing, ignoring submitted IDs', async () => {
  const response = await request('/listing/5', {
    rating: 4, comment: '  Good product  ', raterId: 999, listingId: 999, ratedUserId: 999
  });
  assert.deepEqual(response, {
    status: 201,
    body: { success: true, data: { id: 1, raterId: 2, listingId: 5, rating: 4, comment: 'Good product' } }
  });
});

test('comments are optional and nullable', async () => {
  for (const body of [{ rating: 1 }, { rating: 5, comment: null }]) {
    const response = await request('/listing/5', body);
    assert.equal(response.status, 201);
    assert.equal(response.body.data.comment, null);
  }
});

test('missing and invalid access tokens are rejected before accessing the listing', async () => {
  for (const token of [null, 'invalid', jwt.sign({ userId: 2, type: 'refresh' }, env.jwt.secret)]) {
    assert.equal((await request('/listing/5', { rating: 4 }, token)).status, 401);
  }
  assert.equal(Listing.findByPk.mock.calls.length, 0);
});

test('invalid payloads and listing IDs cannot create ratings', async () => {
  for (const body of [
    {}, { rating: 0 }, { rating: 6 }, { rating: 2.5 }, { rating: '4' },
    { rating: [4] }, { rating: 4, comment: 123 }, { rating: 4, comment: ['ok'] },
    { rating: 4, comment: 'a'.repeat(1001) }
  ]) {
    assert.equal((await request('/listing/5', body)).status, 400, JSON.stringify(body));
  }
  for (const id of ['0', '-1', 'abc', '2.5', '2147483648']) {
    assert.equal((await request(`/listing/${id}`, { rating: 4 })).status, 400, id);
  }
  assert.equal(Listing.findByPk.mock.calls.length, 0);
  assert.equal(ListingRating.create.mock.calls.length, 0);
});

test('nonexistent listings return 404', async (context) => {
  context.mock.method(Listing, 'findByPk', async () => null);
  assert.equal((await request('/listing/999', { rating: 4 })).status, 404);
  assert.equal(ListingRating.create.mock.calls.length, 0);
});

test('owners cannot rate their own listings', async (context) => {
  context.mock.method(Listing, 'findByPk', async () => ({ id: 5, userId: 2 }));
  const response = await request('/listing/5', { rating: 4 });
  assert.equal(response.status, 400);
  assert.equal(response.body.message, 'You cannot rate your own listing');
  assert.equal(ListingRating.create.mock.calls.length, 0);
});

test('an existing rating from this rater for this listing returns 409', async (context) => {
  context.mock.method(ListingRating, 'findOne', async ({ where }) => {
    assert.deepEqual(where, { raterId: 2, listingId: 5 });
    return { id: 10 };
  });
  assert.equal((await request('/listing/5', { rating: 4 })).status, 409);
  assert.equal(ListingRating.create.mock.calls.length, 0);
});

test('a database uniqueness conflict from concurrent submissions also returns 409', async (context) => {
  context.mock.method(ListingRating, 'create', async () => { throw new UniqueConstraintError({ errors: [] }); });
  assert.equal((await request('/listing/5', { rating: 4 })).status, 409);
});

test('different raters and listings are independent', async () => {
  const first = await request('/listing/5', { rating: 4 });
  const second = await request('/listing/5', { rating: 3 }, jwt.sign({ userId: 3 }, env.jwt.secret));
  const third = await request('/listing/6', { rating: 5 });
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.equal(third.status, 201);
  assert.deepEqual(ListingRating.findOne.mock.calls.map((call) => call.arguments[0].where), [
    { raterId: 2, listingId: 5 }, { raterId: 3, listingId: 5 }, { raterId: 2, listingId: 6 }
  ]);
});

test('the model enforces rating bounds and cascading references', async () => {
  for (const rating of [0, 6, 1.5]) {
    await assert.rejects(ListingRating.build({ raterId: 2, listingId: 5, rating }).validate());
  }
  assert.equal(ListingRating.getAttributes().raterId.references.model, 'users');
  assert.equal(ListingRating.getAttributes().raterId.onDelete, 'CASCADE');
  assert.equal(ListingRating.getAttributes().listingId.references.model, 'listings');
  assert.equal(ListingRating.getAttributes().listingId.onDelete, 'CASCADE');
  assert.ok(ListingRating.options.indexes.some((index) => (
    index.unique && index.fields.join(',') === 'raterId,listingId'
  )));
});

test('user rating endpoint still uses user ratings and its existing notification', async (context) => {
  context.mock.method(Rating, 'findOne', async () => null);
  context.mock.method(Rating, 'create', async (values) => ({ id: 8, ...values }));
  context.mock.method(Notification, 'create', async (values) => values);
  const response = await request('/user/35', { rating: 4, comment: 'Helpful seller' });
  assert.equal(response.status, 201);
  assert.equal(response.body.data.ratedUserId, '35');
  assert.equal(response.body.data.raterId, 2);
  assert.equal(response.body.data.rating, 4);
  assert.equal(Rating.create.mock.calls.length, 1);
  assert.equal(Notification.create.mock.calls.length, 1);
  assert.equal(ListingRating.create.mock.calls.length, 0);
});
