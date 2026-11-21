const { test, before, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'production';
process.env.JWT_SECRET = 'isolated-password-endpoint-test-secret';

// Run the real auth route and bcrypt against an isolated in-memory model.
const users = new Map();
const currentPassword = 'OriginalPass1!';
const newPassword = 'ChangedPass2!';
let originalHash;
let writes;
let failWrite;
const User = {
  async findByPk(id) {
    const user = users.get(Number(id));
    return user ? { ...user } : null;
  },
  async findOne({ where }) {
    return [...users.values()].find((user) => user.username === where.username) || null;
  },
  async update(values, { where }) {
    assert.deepEqual(Object.keys(values), ['password']);
    assert.deepEqual(Object.keys(where).sort(), ['id', 'password']);
    if (failWrite) throw new Error('Simulated database failure');
    const user = users.get(Number(where.id));
    if (!user || user.password !== where.password) return [0];
    users.set(user.id, { ...user, ...values });
    writes += 1;
    return [1];
  }
};
const requireModelPath = require.resolve('../src/utils/requireModel');
require(requireModelPath);
require.cache[requireModelPath].exports = (name) => {
  assert.equal(name, 'User');
  return User;
};

const env = require('../src/config/env');
const app = express();
app.use(express.json());
app.use('/api/auth', require('../src/routes/auth.routes'));
app.use(require('../src/middlewares/error.middleware'));
let server;
let origin;

before(async () => {
  originalHash = await bcrypt.hash(currentPassword, 4);
  server = await new Promise((resolve, reject) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
    listener.once('error', reject);
  });
  origin = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(() => {
  users.clear();
  for (const id of [1, 2]) {
    users.set(id, { id, username: `user${id}`, email: `user${id}@example.com`, password: originalHash });
  }
  writes = 0;
  failWrite = false;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
});

const request = async (body, token = jwt.sign({ userId: 1 }, env.jwt.secret), path = '/change-password') => {
  const response = await fetch(`${origin}/api/auth${path}`, {
    method: path === '/login' ? 'POST' : 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body)
  });
  return { status: response.status, body: await response.json() };
};

test('requires an access token for an existing account', async () => {
  for (const token of [
    null,
    'invalid-token',
    jwt.sign({ userId: 1, exp: 1 }, env.jwt.secret),
    jwt.sign({ userId: 1, type: 'refresh' }, env.jwt.secret),
    jwt.sign({ userId: 999 }, env.jwt.secret)
  ]) {
    assert.equal((await request({ currentPassword, newPassword }, token)).status, 401);
  }
  assert.equal(writes, 0);
});

test('validates both passwords without reflecting their values in errors', async () => {
  for (const body of [
    {}, { newPassword }, { currentPassword },
    { currentPassword: '', newPassword },
    { currentPassword: null, newPassword },
    { currentPassword: 12345678, newPassword },
    { currentPassword: {}, newPassword },
    { currentPassword, newPassword: null },
    { currentPassword, newPassword: ['ChangedPass2!'] },
    { currentPassword, newPassword: 'weak' },
    { currentPassword, newPassword: 'lowercase1!' },
    { currentPassword, newPassword: 'UPPERCASE1!' },
    { currentPassword, newPassword: 'NoDigitsHere!' },
    { currentPassword, newPassword: 'NoSpecial123' },
    { currentPassword, newPassword: 'Invalid Space1!' },
    { currentPassword, newPassword: `Aa1!${'a'.repeat(69)}` }
  ]) {
    const response = await request(body);
    assert.equal(response.status, 400);
    assert.ok(response.body.errors.length);
    for (const error of response.body.errors) assert.equal(Object.hasOwn(error, 'value'), false);
  }
  assert.equal(writes, 0);
});

test('rejects an incorrect current password without modifying the account', async () => {
  const response = await request({ currentPassword: 'WrongPassword1!', newPassword });
  assert.equal(response.status, 401);
  assert.equal(response.body.message, 'Current password is incorrect');
  assert.equal(users.get(1).password, originalHash);
  assert.equal(writes, 0);
});

test('changes only the authenticated password; login accepts the new password and rejects the old one', async () => {
  const before = { ...users.get(1) };
  const response = await request({ currentPassword, newPassword, userId: 2, id: 2 });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { success: true, message: 'Password changed successfully' });
  const updated = users.get(1);
  assert.deepEqual({ ...updated, password: originalHash }, before);
  assert.notEqual(updated.password, newPassword);
  assert.equal(bcrypt.getRounds(updated.password), 12);
  assert.equal(await bcrypt.compare(newPassword, updated.password), true);
  assert.equal(users.get(2).password, originalHash);
  assert.equal(writes, 1);

  assert.equal((await request({ username: 'user1', password: currentPassword }, null, '/login')).status, 401);
  const login = await request({ username: 'user1', password: newPassword }, null, '/login');
  assert.equal(login.status, 200);
  assert.ok(login.body.data.token);
  assert.equal(Object.hasOwn(login.body.data.user, 'password'), false);
});

test('accepts the 72-character bcrypt boundary without trimming the password', async () => {
  const password = `Aa1!${'a'.repeat(68)}`;
  assert.equal((await request({ currentPassword, newPassword: password })).status, 200);
  assert.equal(await bcrypt.compare(password, users.get(1).password), true);
});

test('concurrent requests cannot overwrite a newly changed password using the old password', async () => {
  const responses = await Promise.all([
    request({ currentPassword, newPassword }),
    request({ currentPassword, newPassword: 'AnotherPass3!' })
  ]);
  assert.deepEqual(responses.map(({ status }) => status).sort(), [200, 409]);
  assert.equal(writes, 1);
});

test('propagates database write failure without reporting success or modifying the password', async () => {
  failWrite = true;
  assert.equal((await request({ currentPassword, newPassword })).status, 500);
  assert.equal(users.get(1).password, originalHash);
  assert.equal(writes, 0);
});
