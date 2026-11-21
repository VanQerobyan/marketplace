const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const qs = require('qs');

process.env.NODE_ENV = 'production';
const env = require('../src/config/env');
const { sequelize } = require('../src/config/database');
const { Listing, ListingView, User } = require('../src/models');
const listingService = require('../src/services/listing.service');
const router = require('../src/routes/listing.routes');

const transaction = { testTransaction: true };
let listings;
let views;
let failIncrement;

beforeEach((context) => {
  views = new Set();
  failIncrement = false;
  listings = new Map([5, 6].map(id => [id, {
    id, userId: 1, viewsCount: 7, updatedAt: '2026-11-21T00:00:00.000Z',
    async increment(field, options) {
      assert.equal(options.transaction, transaction);
      assert.equal(options.silent, true);
      this[field] += options.by;
      if (failIncrement) throw new Error('Counter update failed');
    },
    async reload() { return this; }
  }]));
  context.mock.method(User, 'findByPk', async id => ({ id: Number(id) }));
  context.mock.method(Listing, 'findByPk', async id => listings.get(Number(id)) || null);
  context.mock.method(ListingView, 'findOrCreate', async ({ where, transaction: activeTransaction }) => {
    assert.equal(activeTransaction, transaction);
    const key = `${where.listingId}:${where.viewerId}`;
    const created = !views.has(key);
    views.add(key);
    return [where, created];
  });
  context.mock.method(sequelize, 'transaction', async callback => {
    const originalViews = new Set(views);
    const originalCounts = new Map([...listings].map(([id, listing]) => [id, listing.viewsCount]));
    try {
      return await callback(transaction);
    } catch (error) {
      views = originalViews;
      for (const [id, count] of originalCounts) listings.get(id).viewsCount = count;
      throw error;
    }
  });
});
afterEach(context => context.mock.restoreAll());

const tokenFor = userId => jwt.sign({ userId }, env.jwt.secret);
const request = (path, token) => new Promise((resolve, reject) => {
  const req = {
    method: 'GET', url: path, query: qs.parse(path.split('?')[1]),
    headers: token ? { authorization: `Bearer ${token}` } : {}
  };
  router.handle(req, {
    json(body) { resolve({ status: 200, body: JSON.parse(JSON.stringify(body)) }); }
  }, error => error
    ? resolve({ status: error.statusCode || 500 })
    : reject(new Error(`No route matched ${path}`)));
});

test('owners can open their own listing repeatedly without adding views', async () => {
  for (let count = 0; count < 3; count++) {
    const response = await request('/5', tokenFor(1));
    assert.equal(response.status, 200);
    assert.equal(response.body.data.viewsCount, 7);
  }
  assert.equal(views.size, 0);
  assert.equal(sequelize.transaction.mock.calls.length, 0);
});

test('a viewer is counted once across repeat reads and newly issued access tokens', async () => {
  assert.equal((await request('/5', tokenFor(2))).body.data.viewsCount, 8);
  const anotherSession = jwt.sign({ userId: 2, session: 'another-tab' }, env.jwt.secret);
  assert.equal((await request('/5', anotherSession)).body.data.viewsCount, 8);
  assert.deepEqual([...views], ['5:2']);
  assert.equal(listings.get(5).updatedAt, '2026-11-21T00:00:00.000Z');
});

test('different viewers each add one view and deduplication is scoped per listing', async () => {
  assert.equal((await request('/5', tokenFor(2))).body.data.viewsCount, 8);
  assert.equal((await request('/5', tokenFor(3))).body.data.viewsCount, 9);
  assert.equal((await request('/6', tokenFor(2))).body.data.viewsCount, 8);
  assert.equal((await request('/5', tokenFor(2))).body.data.viewsCount, 9);
  assert.equal((await request('/5', tokenFor(1))).body.data.viewsCount, 9);
  assert.equal(views.size, 3);
});

test('anonymous public reads and forged query identities do not add views', async () => {
  assert.equal((await request('/5?viewerId=2&userId=2')).body.data.viewsCount, 7);
  assert.equal((await request('/5?viewerId=2&userId=2', tokenFor(1))).body.data.viewsCount, 7);
  assert.equal((await request('/5?viewerId=99', tokenFor(2))).body.data.viewsCount, 8);
  assert.deepEqual([...views], ['5:2']);
});

test('invalid, expired, forged and refresh tokens cannot record views', async () => {
  for (const token of [
    'invalid',
    jwt.sign({ userId: 2 }, env.jwt.secret, { expiresIn: -1 }),
    jwt.sign({ userId: 2 }, 'wrong-secret'),
    jwt.sign({ userId: 2, type: 'refresh' }, env.jwt.secret)
  ]) {
    assert.equal((await request('/5', token)).status, 401);
  }
  assert.equal(ListingView.findOrCreate.mock.calls.length, 0);
  assert.equal(listings.get(5).viewsCount, 7);
});

test('deleted users cannot record views', async context => {
  context.mock.method(User, 'findByPk', async () => null);
  assert.equal((await request('/5', tokenFor(2))).status, 401);
  assert.equal(views.size, 0);
});

test('missing listings and invalid IDs never create view records', async () => {
  assert.equal((await request('/999', tokenFor(2))).status, 404);
  assert.equal((await request('/invalid', tokenFor(2))).status, 400);
  assert.equal(ListingView.findOrCreate.mock.calls.length, 0);
});

test('counter failures roll back the view record so the next read can retry', async () => {
  failIncrement = true;
  assert.equal((await request('/5', tokenFor(2))).status, 500);
  assert.equal(views.size, 0);
  assert.equal(listings.get(5).viewsCount, 7);
  failIncrement = false;
  assert.equal((await request('/5', tokenFor(2))).body.data.viewsCount, 8);
  assert.equal(views.size, 1);
});

test('internal reads can explicitly skip counting', async () => {
  const listing = await listingService.getListingById(5, { viewerId: 2, incrementView: false });
  assert.equal(listing.viewsCount, 7);
  assert.equal(views.size, 0);
});

test('view model enforces one record per listing and viewer with cascading references', () => {
  assert.ok(ListingView.options.indexes.some(index => index.unique &&
    index.fields.join(',') === 'listingId,viewerId'));
  for (const [field, table] of [['listingId', 'listings'], ['viewerId', 'users']]) {
    assert.equal(ListingView.getAttributes()[field].references.model, table);
    assert.equal(ListingView.getAttributes()[field].onDelete, 'CASCADE');
  }
});
