const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const qs = require('qs');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../src/config/database');
const env = require('../src/config/env');
const { Listing, User } = require('../src/models');
const router = require('../src/routes/listing.routes');

afterEach((context) => context.mock.restoreAll());

const request = (url, authorization) => new Promise((resolve, reject) => {
  router.handle(
    { method: 'GET', url, query: qs.parse(url.split('?')[1]), headers: { authorization } },
    { json: (body) => resolve({ status: 200, body }) },
    (error) => error
      ? resolve({ status: error.statusCode || 500, error })
      : reject(new Error(`No route matched ${url}`))
  );
});

const records = [
  { id: 1, userId: 5, title: 'Phone', images: ['/uploads/listings/phone.png'] },
  { id: 2, userId: 8, title: 'Laptop', images: [] },
  { id: 3, userId: 5, title: 'Bike', images: [] }
];

const stubListings = (context) => context.mock.method(Listing, 'findAndCountAll', async ({ where, limit, offset }) => {
  const matches = records.filter((record) => where.userId === undefined || record.userId === where.userId);
  return { rows: matches.slice(offset, offset + limit), count: matches.length };
});

test('public user listings exclude other owners and paginate within the selected user', async (context) => {
  stubListings(context);
  const response = await request('/?userId=5&page=2&limit=1');
  assert.deepEqual(response, {
    status: 200,
    body: {
      success: true, data: [records[2]],
      pagination: { page: 2, limit: 1, totalItems: 2, totalPages: 2 }
    }
  });
  const firstPage = await request('/?userId=5&page=1&limit=1');
  assert.deepEqual(firstPage.body.data[0].images, records[0].images);
});

test('omitting userId preserves listings across all owners', async (context) => {
  stubListings(context);
  const response = await request('/');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body.data, records);
  assert.equal(response.body.pagination.totalItems, 3);
});

test('users without listings receive an empty paginated response', async (context) => {
  stubListings(context);
  const response = await request('/?userId=999');
  assert.deepEqual(response.body, {
    success: true, data: [],
    pagination: { page: 1, limit: 12, totalItems: 0, totalPages: 0 }
  });
});

test('invalid user IDs are rejected before any database query', async (context) => {
  const find = context.mock.method(Listing, 'findAndCountAll', async () => assert.fail('Unexpected query'));
  for (const query of [
    'userId=', 'userId=0', 'userId=-1', 'userId=abc', 'userId=1.5',
    'userId=2147483648', 'userId=5&userId=8', 'userId[]=5', 'userId[value]=5'
  ]) {
    assert.equal((await request(`/?${query}`)).status, 400, query);
  }
  assert.equal(find.mock.calls.length, 0);
});

test('real SQL scopes both results and count while preserving other filters and sorting', async (context) => {
  const statements = [];
  context.mock.method(sequelize, 'query', async (sql) => {
    statements.push(sql);
    return /count\(/i.test(sql) ? { count: '0' } : [];
  });
  assert.equal((await request('/?userId=5&search=phone&status=active&category=Electronics&minPrice=10&maxPrice=100&page=2&limit=3&sort=price_asc')).status, 200);
  assert.equal(statements.length, 2);
  for (const sql of statements) {
    assert.match(sql, /"Listing"\."userId" = 5/);
    assert.match(sql, /"Listing"\."status" = 'active'/);
    assert.match(sql, /"Listing"\."category" = 'Electronics'/);
    assert.match(sql, /ILIKE '%phone%'/);
    assert.match(sql, /"Listing"\."price" >= 10/);
    assert.match(sql, /"Listing"\."price" <= 100/);
  }
  const select = statements.find((sql) => !/count\(/i.test(sql));
  assert.match(select, /ORDER BY "Listing"\."price" ASC LIMIT 3 OFFSET 3/);
});

test('mine stays scoped to the authenticated user even if userId is supplied', async (context) => {
  context.mock.method(User, 'findByPk', async () => ({ id: 8 }));
  stubListings(context);
  const token = jwt.sign({ userId: 8 }, env.jwt.secret);
  const response = await request('/mine?userId=5', `Bearer ${token}`);
  assert.equal(response.status, 200);
  assert.deepEqual(response.body.data, [records[1]]);
  assert.equal(response.body.pagination.totalItems, 1);
});
