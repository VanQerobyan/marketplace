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
const transaction = { testTransaction: true };

beforeEach((context) => {
  context.mock.method(User, 'findByPk', async (id) => ({ id: Number(id) }));
  context.mock.method(Listing, 'findByPk', async (id) => ({ id: Number(id), userId: 8 }));
  context.mock.method(Rating, 'findOne', async () => null);
  context.mock.method(Rating, 'create', async (values) => ({ id: 1, ...values }));
  context.mock.method(Notification, 'create', async (values) => values);
  context.mock.method(sequelize, 'transaction', async (callback) => callback(transaction));
});
afterEach((context) => context.mock.restoreAll());

const request = (method, url, body = {}, token = jwt.sign({ userId: 2 }, env.jwt.secret)) => new Promise((resolve, reject) => {
  const req = { method, url, body, headers: token ? { authorization: `Bearer ${token}` } : {} };
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

test('user ratings use authenticated identity, trim comments and save notifications in the same transaction', async () => {
  const response = await request('POST', '/user/5', { rating: 4, comment: '  Helpful seller  ', raterId: 99, actorId: 99 });
  assert.equal(response.status, 201);
  assert.deepEqual(response.body.data, { id: 1, raterId: 2, ratedUserId: '5', rating: 4, comment: 'Helpful seller' });
  assert.equal(Rating.create.mock.calls[0].arguments[1].transaction, transaction);
  assert.equal(Notification.create.mock.calls[0].arguments[1].transaction, transaction);
  assert.equal(Notification.create.mock.calls[0].arguments[0].actorId, 2);
});

test('invalid user ratings, comments and IDs fail before any writes', async () => {
  for (const body of [
    {}, { rating: 0 }, { rating: 6 }, { rating: 2.5 }, { rating: '4' }, { rating: [4] },
    { rating: 4, comment: 42 }, { rating: 4, comment: ['hello'] }, { rating: 4, comment: 'x'.repeat(1001) }
  ]) assert.equal((await request('POST', '/user/5', body)).status, 400, JSON.stringify(body));
  for (const id of ['0', '-1', 'abc', '1.5', '2147483648']) {
    assert.equal((await request('POST', `/user/${id}`, { rating: 4 })).status, 400);
    assert.equal((await request('GET', `/user/${id}`)).status, 400);
  }
  assert.equal(Rating.create.mock.calls.length, 0);
  assert.equal(Notification.create.mock.calls.length, 0);
});

test('user rating comments are optional or null', async () => {
  for (const body of [{ rating: 5 }, { rating: 1, comment: null }]) {
    const response = await request('POST', '/user/5', body);
    assert.equal(response.status, 201);
    assert.equal(response.body.data.comment, null);
  }
});

test('self ratings, missing users and duplicate submissions are rejected', async (context) => {
  assert.equal((await request('POST', '/user/2', { rating: 4 })).status, 400);
  context.mock.method(User, 'findByPk', async (id) => Number(id) === 2 ? { id: 2 } : null);
  assert.equal((await request('POST', '/user/5', { rating: 4 })).status, 404);
  context.mock.method(User, 'findByPk', async (id) => ({ id: Number(id) }));
  context.mock.method(Rating, 'findOne', async () => ({ id: 1 }));
  assert.equal((await request('POST', '/user/5', { rating: 4 })).status, 409);
  assert.equal(Rating.create.mock.calls.length, 0);
});

test('concurrent duplicate submissions return 409 and cannot create another notification', async (context) => {
  context.mock.method(Rating, 'create', async () => { throw new UniqueConstraintError({ errors: [] }); });
  assert.equal((await request('POST', '/user/5', { rating: 4 })).status, 409);
  assert.equal(Notification.create.mock.calls.length, 0);
});

test('notification failures reject the whole rating transaction', async (context) => {
  let transactionRejected = false;
  context.mock.method(sequelize, 'transaction', async (callback) => {
    try { return await callback(transaction); } catch (error) { transactionRejected = true; throw error; }
  });
  context.mock.method(Notification, 'create', async () => { throw new Error('Notification failed'); });
  assert.equal((await request('POST', '/user/5', { rating: 4 })).status, 500);
  assert.equal(transactionRejected, true);
});

test('listing ratings are publicly readable with scoped items, average and count', async (context) => {
  context.mock.method(ListingRating, 'findAll', async (options) => {
    assert.deepEqual(options.where, { listingId: 5 });
    return [{ id: 1, listingId: 5, raterId: 2, rating: 4, comment: null }];
  });
  context.mock.method(ListingRating, 'findOne', async (options) => {
    assert.deepEqual(options.where, { listingId: 5 });
    return { averageRating: '4.3333333', ratingsCount: '3' };
  });
  const response = await request('GET', '/listing/5', {}, null);
  assert.deepEqual(response, { status: 200, body: { success: true, data: {
    averageRating: 4.33, ratingsCount: 3,
    items: [{ id: 1, listingId: 5, raterId: 2, rating: 4, comment: null }]
  } } });
});

test('empty listing ratings return zero summary and missing listings return 404', async (context) => {
  context.mock.method(ListingRating, 'findAll', async () => []);
  context.mock.method(ListingRating, 'findOne', async () => ({ averageRating: null, ratingsCount: '0' }));
  assert.deepEqual((await request('GET', '/listing/5')).body.data, { averageRating: 0, ratingsCount: 0, items: [] });
  context.mock.method(Listing, 'findByPk', async () => null);
  assert.equal((await request('GET', '/listing/999')).status, 404);
});

test('listing rating reads reject malformed IDs', async () => {
  for (const id of ['0', '-1', 'abc', '1.5', '2147483648']) {
    assert.equal((await request('GET', `/listing/${id}`)).status, 400);
  }
  assert.equal(Listing.findByPk.mock.calls.length, 0);
});
