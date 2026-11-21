const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const qs = require('qs');
const { Op, QueryTypes } = require('sequelize');

process.env.NODE_ENV = 'production';
const env = require('../src/config/env');
const { sequelize } = require('../src/config/database');
const { User, Listing, Message, Notification } = require('../src/models');
const router = require('../src/routes/message.routes');
const errorHandler = require('../src/middlewares/error.middleware');

const transaction = { testTransaction: true };
beforeEach((context) => {
  context.mock.method(User, 'findByPk', async (id) => ({ id: Number(id) }));
  context.mock.method(Listing, 'findByPk', async (id) => ({ id: Number(id) }));
  context.mock.method(sequelize, 'transaction', async (callback) => callback(transaction));
  context.mock.method(Message, 'create', async (values) => ({ id: 10, ...values }));
  context.mock.method(Notification, 'create', async (values) => values);
  context.mock.method(Notification, 'update', async () => [0]);
  context.mock.method(Message, 'findAndCountAll', async () => ({ rows: [], count: 0 }));
  context.mock.method(Message, 'update', async () => [0]);
  context.mock.method(sequelize, 'query', async () => [{ data: [], totalItems: 0 }]);
});
afterEach((context) => context.mock.restoreAll());

// Exercise real routing, authentication, validation, controllers and services without a DB.
const request = (method, url, body = {}, token = jwt.sign({ userId: 2 }, env.jwt.secret)) => new Promise((resolve, reject) => {
  const req = {
    method, url, body, query: qs.parse(url.split('?')[1]),
    headers: token ? { authorization: `Bearer ${token}` } : {}
  };
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

test('send uses the authenticated sender and server read state, ignoring forged fields', async () => {
  const response = await request('POST', '/', {
    receiverId: 3, content: '  Բարև, ապրանքը կա՞։  ', senderId: 99, isRead: true, id: 500
  });
  assert.deepEqual(response, {
    status: 201,
    body: { success: true, data: {
      id: 10, senderId: 2, receiverId: 3, content: 'Բարև, ապրանքը կա՞։', listingId: null, isRead: false
    } }
  });
  assert.deepEqual(Notification.create.mock.calls[0].arguments, [{
    userId: 3, actorId: 2, type: 'message', message: 'You have a new message', listingId: null, isRead: false
  }, { transaction }]);
  assert.equal(Message.create.mock.calls[0].arguments[1].transaction, transaction);
});

test('optional listing context is validated and attached to the notification', async () => {
  assert.equal((await request('POST', '/', { receiverId: 3, content: 'Available?', listingId: 5 })).status, 201);
  assert.equal(Message.create.mock.calls[0].arguments[0].listingId, 5);
  assert.equal(Notification.create.mock.calls[0].arguments[0].listingId, 5);
  assert.equal((await request('POST', '/', { receiverId: 3, content: 'Hello', listingId: null })).status, 201);
});

test('every messaging route rejects missing, invalid and refresh tokens', async () => {
  for (const [method, path] of [['POST', '/'], ['GET', '/conversations'], ['GET', '/user/3'], ['PATCH', '/user/3/read']]) {
    for (const token of [null, 'invalid', jwt.sign({ userId: 2, type: 'refresh' }, env.jwt.secret)]) {
      assert.equal((await request(method, path, { receiverId: 3, content: 'Hi' }, token)).status, 401);
    }
  }
  assert.equal(Message.create.mock.calls.length, 0);
  assert.equal(Message.findAndCountAll.mock.calls.length, 0);
  assert.equal(Message.update.mock.calls.length, 0);
  assert.equal(sequelize.query.mock.calls.length, 0);
});

test('invalid message bodies fail before any write', async () => {
  for (const body of [
    {}, { receiverId: 3 }, { receiverId: '3', content: 'Hi' }, { receiverId: [3], content: 'Hi' },
    { receiverId: 0, content: 'Hi' }, { receiverId: 2147483648, content: 'Hi' },
    { receiverId: 3, content: '' }, { receiverId: 3, content: ' \n\t ' },
    { receiverId: 3, content: null }, { receiverId: 3, content: ['Hi'] },
    { receiverId: 3, content: 42 }, { receiverId: 3, content: 'x'.repeat(5001) },
    { receiverId: 3, content: 'Hi', listingId: '5' }, { receiverId: 3, content: 'Hi', listingId: -1 }
  ]) {
    assert.equal((await request('POST', '/', body)).status, 400, JSON.stringify(body));
  }
  assert.equal(Message.create.mock.calls.length, 0);
  assert.equal(Notification.create.mock.calls.length, 0);
});

test('self messaging and missing participants or listings cannot create a message', async (context) => {
  assert.equal((await request('POST', '/', { receiverId: 2, content: 'Hi' })).status, 400);
  context.mock.method(User, 'findByPk', async (id) => Number(id) === 2 ? { id: 2 } : null);
  assert.equal((await request('POST', '/', { receiverId: 99, content: 'Hi' })).status, 404);
  context.mock.method(User, 'findByPk', async (id) => ({ id: Number(id) }));
  context.mock.method(Listing, 'findByPk', async () => null);
  assert.equal((await request('POST', '/', { receiverId: 3, content: 'Hi', listingId: 99 })).status, 404);
  assert.equal(Message.create.mock.calls.length, 0);
});

test('notification failure propagates out of the message transaction', async (context) => {
  context.mock.method(Notification, 'create', async () => { throw new Error('Notification failed'); });
  let rolledBack = false;
  context.mock.method(sequelize, 'transaction', async (callback) => {
    try { return await callback(transaction); } catch (error) { rolledBack = true; throw error; }
  });
  assert.equal((await request('POST', '/', { receiverId: 3, content: 'Hi' })).status, 500);
  assert.equal(rolledBack, true);
});

test('history is restricted to both directions between the authenticated user and the peer', async (context) => {
  context.mock.method(Message, 'findAndCountAll', async (options) => {
    assert.deepEqual(options.where[Op.or], [
      { senderId: 2, receiverId: 3 }, { senderId: 3, receiverId: 2 }
    ]);
    assert.deepEqual(options.order, [['id', 'DESC']]);
    assert.equal(options.limit, 5);
    assert.equal(options.offset, 5);
    for (const include of options.include) {
      assert.deepEqual(include.attributes, ['id', 'firstName', 'lastName', 'username', 'avatar']);
    }
    return { rows: [{ id: 10, content: 'Hi' }], count: 6 };
  });
  const response = await request('GET', '/user/3?page=2&limit=5&senderId=9&receiverId=10');
  assert.deepEqual(response, { status: 200, body: {
    success: true, data: [{ id: 10, content: 'Hi' }],
    pagination: { page: 2, limit: 5, totalItems: 6, totalPages: 2 }
  } });
});

test('empty histories have default pagination and reading does not mark messages as read', async () => {
  const response = await request('GET', '/user/3');
  assert.deepEqual(response.body, {
    success: true, data: [], pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 0 }
  });
  assert.equal(Message.update.mock.calls.length, 0);
});

test('inbox binds the authenticated user, limits results and returns public peer details', async () => {
  const response = await request('GET', '/conversations?page=2&limit=5&userId=99');
  assert.deepEqual(response.body, {
    success: true, data: [], pagination: { page: 2, limit: 5, totalItems: 0, totalPages: 0 }
  });
  const [sql, options] = sequelize.query.mock.calls[0].arguments;
  assert.deepEqual(options, { replacements: { userId: 2, limit: 5, offset: 5 }, type: QueryTypes.SELECT });
  assert.doesNotMatch(sql, /email|password/i);
});

test('mark read only changes unread incoming messages from the selected peer and is idempotent', async (context) => {
  context.mock.method(Message, 'update', async (values, options) => {
    assert.deepEqual(values, { isRead: true });
    assert.deepEqual(options.where, { senderId: 3, receiverId: 2, isRead: false });
    assert.equal(options.transaction, transaction);
    return [4];
  });
  context.mock.method(Notification, 'update', async (values, options) => {
    assert.deepEqual(values, { isRead: true });
    assert.deepEqual(options.where, { userId: 2, actorId: 3, type: 'message', isRead: false });
    assert.equal(options.transaction, transaction);
    return [4];
  });
  assert.deepEqual(await request('PATCH', '/user/3/read', { receiverId: 99, senderId: 99 }), {
    status: 200, body: { success: true, data: { updatedCount: 4 } }
  });
  context.mock.method(Message, 'update', async () => [0]);
  context.mock.method(Notification, 'update', async () => [0]);
  assert.equal((await request('PATCH', '/user/3/read')).body.data.updatedCount, 0);
});

test('reading a conversation clears only its incoming message notifications', async (context) => {
  const events = require('../src/realtime/message.events');
  context.mock.method(events, 'emit', () => true);
  const notifications = [
    { userId: 2, actorId: 3, type: 'message', isRead: false },
    { userId: 2, actorId: 4, type: 'message', isRead: false },
    { userId: 3, actorId: 2, type: 'message', isRead: false },
    { userId: 2, actorId: 3, type: 'rating', isRead: false },
  ];
  context.mock.method(Notification, 'update', async (values, { where }) => {
    const matches = notifications.filter(notification =>
      Object.entries(where).every(([key, value]) => notification[key] === value));
    for (const notification of matches) Object.assign(notification, values);
    return [matches.length];
  });
  assert.equal((await request('PATCH', '/user/3/read')).status, 200);
  assert.deepEqual(notifications.map(notification => notification.isRead), [true, false, false, false]);
  assert.deepEqual(events.emit.mock.calls[0].arguments, [
    'message:read', { readerId: 2, senderId: 3, updatedCount: 0 }
  ]);
  assert.equal((await request('PATCH', '/user/3/read')).status, 200);
  assert.deepEqual(notifications.map(notification => notification.isRead), [true, false, false, false]);
  assert.equal(events.emit.mock.calls.length, 1);
});

test('notification read failures abort the transaction and do not publish a read receipt', async (context) => {
  const events = require('../src/realtime/message.events');
  const receipts = [];
  const listener = receipt => receipts.push(receipt);
  events.on('message:read', listener);
  context.mock.method(Message, 'update', async () => [1]);
  context.mock.method(Notification, 'update', async () => { throw new Error('Notification read failed'); });
  let rolledBack = false;
  context.mock.method(sequelize, 'transaction', async (callback) => {
    try { return await callback(transaction); } catch (error) { rolledBack = true; throw error; }
  });
  try {
    assert.equal((await request('PATCH', '/user/3/read')).status, 500);
    assert.equal(rolledBack, true);
    assert.deepEqual(receipts, []);
  } finally {
    events.off('message:read', listener);
  }
});

test('invalid route IDs and pagination fail before reading or updating messages', async () => {
  for (const id of ['0', '-1', 'x', '1.5', '2147483648']) {
    assert.equal((await request('GET', `/user/${id}`)).status, 400);
    assert.equal((await request('PATCH', `/user/${id}/read`)).status, 400);
  }
  for (const query of ['page=0', 'page=1.5', 'page=1000001', 'page=1&page=2', 'limit=101', 'limit[]=2']) {
    assert.equal((await request('GET', `/user/3?${query}`)).status, 400);
    assert.equal((await request('GET', `/conversations?${query}`)).status, 400);
  }
  assert.equal(Message.findAndCountAll.mock.calls.length, 0);
  assert.equal(Message.update.mock.calls.length, 0);
  assert.equal(sequelize.query.mock.calls.length, 0);
});

test('history and read endpoints reject self and missing peers', async (context) => {
  for (const method of ['GET', 'PATCH']) {
    assert.equal((await request(method, `/user/2${method === 'PATCH' ? '/read' : ''}`)).status, 400);
  }
  context.mock.method(User, 'findByPk', async (id) => Number(id) === 2 ? { id: 2 } : null);
  assert.equal((await request('GET', '/user/99')).status, 404);
  assert.equal((await request('PATCH', '/user/99/read')).status, 404);
  assert.equal(Message.findAndCountAll.mock.calls.length, 0);
  assert.equal(Message.update.mock.calls.length, 0);
});

test('message model validates content and declares the intended reference behavior', async () => {
  for (const content of ['', ' \n ', 'x'.repeat(5001)]) {
    await assert.rejects(Message.build({ senderId: 2, receiverId: 3, content }).validate());
  }
  await assert.rejects(Message.build({ senderId: 2, receiverId: 2, content: 'Hi' }).validate());
  await Message.build({ senderId: 2, receiverId: 3, content: 'Բարև' }).validate();
  for (const field of ['senderId', 'receiverId']) {
    assert.equal(Message.getAttributes()[field].references.model, 'users');
    assert.equal(Message.getAttributes()[field].onDelete, 'CASCADE');
  }
  assert.equal(Message.getAttributes().listingId.onDelete, 'SET NULL');
});
