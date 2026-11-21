const { test, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { once } = require('node:events');
const jwt = require('jsonwebtoken');
const { io: connect } = require('socket.io-client');

process.env.NODE_ENV = 'production';
const env = require('../src/config/env');
const { sequelize } = require('../src/config/database');
const { User, Listing, Message, Notification } = require('../src/models');
const app = require('../src/app');
const initializeSocket = require('../src/realtime/socket');
const messageEvents = require('../src/realtime/message.events');

let io;
let origin;
let clients = [];
let deletedUsers;
let nextId;
let committed;
const tokenFor = (userId, options = {}) => jwt.sign({ userId }, env.jwt.secret, { expiresIn: '1h', ...options });

before(async () => {
  const server = createServer(app);
  io = initializeSocket(server);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  origin = `http://127.0.0.1:${server.address().port}`;
});

beforeEach((context) => {
  nextId = 0;
  committed = false;
  deletedUsers = new Set();
  context.mock.method(User, 'findByPk', async (id) => deletedUsers.has(Number(id)) ? null : User.build({
    id: Number(id), username: `user${id}`, firstName: 'Test', lastName: 'User',
    password: 'private-password', email: 'private@example.com'
  }));
  context.mock.method(Listing, 'findByPk', async (id) => ({ id: Number(id) }));
  context.mock.method(sequelize, 'transaction', async (callback) => {
    const result = await callback({ testTransaction: true });
    committed = true;
    return result;
  });
  context.mock.method(Message, 'create', async (values) => Message.build({ id: ++nextId, ...values }));
  context.mock.method(Notification, 'create', async (values) => values);
  context.mock.method(Notification, 'update', async () => [0]);
  context.mock.method(Message, 'update', async () => [2]);
});

afterEach(async (context) => {
  for (const client of clients) client.disconnect();
  clients = [];
  // Ensure the server has finished removing this test's sockets before restoring mocks.
  io.disconnectSockets(true);
  context.mock.restoreAll();
});

after(async () => {
  await new Promise((resolve) => io.close(resolve));
  assert.equal(messageEvents.listenerCount('message:new'), 0);
  assert.equal(messageEvents.listenerCount('message:read'), 0);
});

const createClient = (auth, options = {}) => {
  const client = connect(origin, {
    auth, transports: ['websocket'], reconnection: false, forceNew: true, autoConnect: false, ...options
  });
  clients.push(client);
  return client;
};

const connected = async (userId) => {
  const client = createClient({ token: tokenFor(userId) });
  const ready = once(client, 'connect');
  client.connect();
  await ready;
  return client;
};

const emit = (client, event, payload) => client.timeout(3000).emitWithAck(event, payload);
const barrier = async (client, userId) => {
  const received = once(client, 'test:barrier');
  io.to(`user:${userId}`).emit('test:barrier');
  await received;
};

test('handshake rejects missing, invalid, expired and refresh tokens, plus deleted users', { timeout: 5000 }, async () => {
  deletedUsers.add(9);
  for (const auth of [
    {}, { token: 'invalid' }, { token: tokenFor(2, { expiresIn: -1 }) },
    { token: jwt.sign({ userId: 2, type: 'refresh' }, env.jwt.secret) }, { token: tokenFor(9) }
  ]) {
    const client = createClient(auth);
    const rejected = once(client, 'connect_error');
    client.connect();
    const [error] = await rejected;
    assert.equal(error.data.statusCode, 401);
    assert.equal(client.connected, false);
  }
});

test('WebSocket handshakes reject an unrelated browser origin', { timeout: 5000 }, async () => {
  const client = createClient({ token: tokenFor(2) }, { extraHeaders: { Origin: 'https://unrelated.example' } });
  const rejected = once(client, 'connect_error');
  client.connect();
  await rejected;
  assert.equal(client.connected, false);
});

test('the default polling-to-WebSocket connection works for the configured browser origin', { timeout: 5000 }, async () => {
  const client = createClient({ token: tokenFor(2) }, {
    transports: ['polling', 'websocket'], extraHeaders: { Origin: env.clientUrl }
  });
  const ready = once(client, 'connect');
  client.connect();
  await ready;
  assert.equal((await emit(client, 'message:send', { receiverId: 3, content: 'Browser client' })).success, true);
});

test('writes without acknowledgement callbacks report validation errors through message:error', { timeout: 5000 }, async () => {
  const client = await connected(2);
  const error = once(client, 'message:error');
  client.emit('message:send', { receiverId: 3, content: '  ' });
  assert.equal((await error)[0].statusCode, 400);
  assert.equal(Message.create.mock.calls.length, 0);
});

test('a socket send is saved before delivery to both participants and all their tabs, excluding outsiders', { timeout: 5000 }, async () => {
  const sender = await connected(2);
  const senderTab = await connected(2);
  const receiver = await connected(3);
  const outsider = await connected(4);
  const outsideMessages = [];
  outsider.on('message:new', (message) => outsideMessages.push(message));
  outsider.emit('join', 'user:2'); // No client-controlled room subscription exists.
  const received = [sender, senderTab, receiver].map((client) => once(client, 'message:new'));
  const response = await emit(sender, 'message:send', {
    receiverId: 3, content: '  Բարև  ', senderId: 4, isRead: true, listingId: 5
  });
  assert.equal(response.success, true);
  assert.equal(committed, true);
  assert.equal(response.data.senderId, 2);
  assert.equal(response.data.isRead, false);
  assert.equal(response.data.content, 'Բարև');
  for (const [message] of await Promise.all(received)) assert.deepEqual(message, response.data);
  assert.equal(Notification.create.mock.calls.length, 1);
  await barrier(outsider, 4);
  assert.deepEqual(outsideMessages, []);
});

test('REST sends also notify sockets after the transaction commits', { timeout: 5000 }, async () => {
  const receiver = await connected(3);
  const incoming = once(receiver, 'message:new');
  const onPublished = () => assert.equal(committed, true);
  messageEvents.once('message:new', onPublished);
  const response = await fetch(`${origin}/api/messages`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFor(2)}` },
    body: JSON.stringify({ receiverId: 3, content: 'From REST' })
  });
  assert.equal(response.status, 201);
  const body = await response.json();
  const [message] = await incoming;
  assert.deepEqual(message, body.data);
});

test('socket payload validation rejects malformed data without writes or deliveries', { timeout: 5000 }, async () => {
  const sender = await connected(2);
  for (const payload of [
    null, [], 'hello', {}, { receiverId: '3', content: 'Hi' }, { receiverId: 3, content: '   ' },
    { receiverId: 3, content: ['Hi'] }, { receiverId: 3, content: 'x'.repeat(5001) },
    { receiverId: 3, content: 'Hi', listingId: 0 }, { receiverId: 2, content: 'Hi' }
  ]) {
    assert.equal((await emit(sender, 'message:send', payload)).statusCode, 400);
  }
  deletedUsers.add(3);
  assert.equal((await emit(sender, 'message:send', { receiverId: 3, content: 'Hi' })).statusCode, 404);
  assert.equal(Message.create.mock.calls.length, 0);
  assert.equal(Notification.create.mock.calls.length, 0);
});

test('database failures return a safe error and publish no message', { timeout: 5000 }, async (context) => {
  const sender = await connected(2);
  const receiver = await connected(3);
  const messages = [];
  receiver.on('message:new', (message) => messages.push(message));
  context.mock.method(Notification, 'create', async () => { throw new Error('private database credentials'); });
  assert.deepEqual(await emit(sender, 'message:send', { receiverId: 3, content: 'Hi' }), {
    success: false, statusCode: 500, message: 'Internal server error'
  });
  assert.equal(committed, false);
  await barrier(receiver, 3);
  assert.deepEqual(messages, []);
});

test('read receipts affect only incoming messages and reach only the participants', { timeout: 5000 }, async () => {
  const reader = await connected(2);
  const sender = await connected(3);
  const outsider = await connected(4);
  const outsideReceipts = [];
  outsider.on('message:read', (receipt) => outsideReceipts.push(receipt));
  const receipts = [once(reader, 'message:read'), once(sender, 'message:read')];
  const result = await emit(reader, 'message:read', { userId: 3, readerId: 4 });
  assert.deepEqual(result, { success: true, data: { updatedCount: 2 } });
  for (const [receipt] of await Promise.all(receipts)) {
    assert.deepEqual(receipt, { readerId: 2, senderId: 3, updatedCount: 2 });
  }
  assert.deepEqual(Message.update.mock.calls[0].arguments[1].where, { senderId: 3, receiverId: 2, isRead: false });
  assert.deepEqual(Notification.update.mock.calls[0].arguments[1].where, {
    userId: 2, actorId: 3, type: 'message', isRead: false
  });
  await barrier(outsider, 4);
  assert.deepEqual(outsideReceipts, []);
  for (const payload of [null, {}, { userId: '3' }, { userId: 0 }, { userId: 2147483648 }]) {
    assert.equal((await emit(reader, 'message:read', payload)).statusCode, 400);
  }
});

test('REST read updates publish receipts, while repeated reads publish nothing', { timeout: 5000 }, async (context) => {
  const sender = await connected(3);
  const receipt = once(sender, 'message:read');
  const response = await fetch(`${origin}/api/messages/user/3/read`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${tokenFor(2)}` }
  });
  assert.equal(response.status, 200);
  assert.equal((await receipt)[0].readerId, 2);
  const receipts = [];
  sender.on('message:read', (value) => receipts.push(value));
  context.mock.method(Message, 'update', async () => [0]);
  assert.equal((await emit(sender, 'message:read', { userId: 2 })).data.updatedCount, 0);
  await barrier(sender, 3);
  assert.deepEqual(receipts, []);
});

test('deleted users cannot write over an already connected socket', { timeout: 5000 }, async () => {
  const sender = await connected(2);
  deletedUsers.add(2);
  const disconnected = once(sender, 'disconnect');
  assert.equal((await emit(sender, 'message:send', { receiverId: 3, content: 'Hi' })).statusCode, 401);
  await disconnected;
  assert.equal(Message.create.mock.calls.length, 0);
});

test('connections stop receiving private events when their access token expires', { timeout: 5000 }, async () => {
  const client = createClient({ token: tokenFor(2, { expiresIn: 2 }) });
  const ready = once(client, 'connect');
  client.connect();
  await ready;
  const disconnected = once(client, 'disconnect');
  const error = once(client, 'message:error');
  assert.equal((await error)[0].statusCode, 401);
  await disconnected;
  assert.equal(client.connected, false);
});
