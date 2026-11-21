const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const qs = require('qs');
const { sequelize } = require('../src/config/database');
const { User, Rating } = require('../src/models');
const userService = require('../src/services/user.service');
const router = require('../src/routes/user.routes');

afterEach((context) => context.mock.restoreAll());

// Exercise routing, validation, controller, and service without a listening socket.
const request = (url) => new Promise((resolve, reject) => {
  const req = { method: 'GET', url, query: qs.parse(url.split('?')[1]), headers: {} };
  const res = { json: (body) => resolve({ status: 200, body }) };
  router.handle(req, res, (error) => {
    if (!error) return reject(new Error(`No route matched ${url}`));
    resolve({ status: error.statusCode || 500, error });
  });
});

test('search route returns public results and pagination', async (context) => {
  const user = { id: 5, firstName: 'Aram', lastName: 'Petrosyan', username: 'aram_5', avatar: null };
  context.mock.method(User, 'findAndCountAll', async () => ({ rows: [user], count: 3 }));
  const response = await request('/?search=%20Aram%20&page=2&limit=1');
  assert.deepEqual(response, {
    status: 200,
    body: {
      success: true, data: [user],
      pagination: { page: 2, limit: 1, totalItems: 3, totalPages: 3 }
    }
  });
});

test('empty results use the default page size and zero total pages', async (context) => {
  context.mock.method(User, 'findAndCountAll', async () => ({ rows: [], count: 0 }));
  const response = await request('/?search=nobody');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    success: true, data: [],
    pagination: { page: 1, limit: 12, totalItems: 0, totalPages: 0 }
  });
});

test('invalid search and pagination never reach the database', async (context) => {
  const find = context.mock.method(User, 'findAndCountAll', async () => assert.fail('Unexpected database query'));
  const invalid = [
    '', 'search=', 'search=%20%20', `search=${'a'.repeat(102)}`,
    'search=a&search=b', 'search[name]=aram',
    'search=aram&page=0', 'search=aram&page=1.5', 'search=aram&page=1000001',
    'search=aram&page=1&page=2', 'search=aram&limit=0', 'search=aram&limit=51',
    'search=aram&limit=abc', 'search=aram&limit[]=2'
  ];
  for (const query of invalid) {
    assert.equal((await request(`/?${query}`)).status, 400, query);
  }
  assert.equal(find.mock.calls.length, 0);
});

test('generated SQL searches every word across public name fields and excludes private fields', async (context) => {
  const statements = [];
  context.mock.method(sequelize, 'query', async (sql) => {
    statements.push(sql);
    return /count\(/i.test(sql) ? { count: '0' } : [];
  });
  await userService.searchUsers({ search: 'ArAm   Petrosyan', page: '2', limit: '5' });
  assert.equal(statements.length, 2);
  const select = statements.find((sql) => !/count\(/i.test(sql));
  assert.match(select, /SELECT "id", "firstName", "lastName", "username", "avatar" FROM/);
  for (const field of ['firstName', 'lastName', 'username']) {
    assert.ok(select.includes(`"${field}" ILIKE '%ArAm%'`));
    assert.ok(select.includes(`"${field}" ILIKE '%Petrosyan%'`));
  }
  assert.match(select, / AND /);
  assert.match(select, /ORDER BY "User"\."username" ASC, "User"\."id" ASC LIMIT 5 OFFSET 5/);
  for (const sql of statements) assert.doesNotMatch(sql, /"email"|"password"/);
});

test('LIKE wildcards and apostrophes are escaped in generated SQL', async (context) => {
  let select;
  context.mock.method(sequelize, 'query', async (sql) => {
    if (/count\(/i.test(sql)) return { count: '0' };
    select = sql;
    return [];
  });
  await userService.searchUsers({ search: "aram_50%\\O'Neil" });
  const escapedPattern = sequelize.escape("%aram\\_50\\%\\\\O'Neil%");
  assert.ok(select.includes(`"username" ILIKE ${escapedPattern}`));
});

test('existing profile routes retain their behavior', async (context) => {
  context.mock.method(User, 'findByPk', async () => null);
  assert.equal((await request('/me')).status, 401);
  assert.equal((await request('/123')).status, 404);
  assert.equal((await request('/invalid-id')).status, 400);
});

test('public profile includes avatar and ratings without private account data', async (context) => {
  const publicFields = {
    id: 5, firstName: 'Aram', lastName: 'Petrosyan', username: 'aram_5',
    avatar: '/uploads/avatars/aram.png', createdAt: '2026-01-01T00:00:00.000Z'
  };
  context.mock.method(User, 'findByPk', async () => User.build({
    ...publicFields, email: 'private@example.com', password: 'private-password'
  }));
  context.mock.method(Rating, 'findOne', async () => ({ averageRating: '4.5', ratingsCount: '2' }));
  const response = await request('/5');
  assert.deepEqual(response, {
    status: 200,
    body: {
      success: true,
      data: { ...publicFields, createdAt: new Date(publicFields.createdAt), averageRating: 4.5, ratingsCount: 2 }
    }
  });
});
