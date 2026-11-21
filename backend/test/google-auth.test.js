const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { generateKeyPairSync } = require('node:crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const { Op, UniqueConstraintError } = require('sequelize');
const { User } = require('../src/models');
const env = require('../src/config/env');
const router = require('../src/routes/auth.routes');

const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
const certificate = keys.publicKey.export({ type: 'spki', format: 'pem' });
const clientId = 'test-client.apps.googleusercontent.com';
const nonce = 'a'.repeat(64);
const records = [];
let creates;
let updates;
let savedClientId;

const credential = (claims = {}, key = keys.privateKey) => jwt.sign({
  sub: 'google-subject-123', email: 'new.user@gmail.com', email_verified: true,
  given_name: 'Aram', family_name: 'Petrosyan', nonce,
  ...claims
}, key, {
  algorithm: 'RS256', keyid: 'test-key', audience: clientId,
  issuer: 'https://accounts.google.com', expiresIn: '1h'
});

const request = (body, options = {}) => new Promise((resolve, reject) => {
  const contentType = options.contentType || 'application/json';
  const headers = { 'content-type': contentType, ...(options.origin ? { origin: options.origin } : {}) };
  const req = {
    method: options.method || 'POST', url: options.path || '/google', body, headers, query: {},
    is: (type) => contentType === type, get: (name) => headers[name.toLowerCase()]
  };
  const res = { statusCode: 200, status(code) { this.statusCode = code; return this; },
    json(value) { resolve({ status: this.statusCode, body: value }); } };
  router.handle(req, res, (error) => error
    ? resolve({ status: error.statusCode || 500, error })
    : reject(new Error('Route did not respond')));
});

beforeEach((context) => {
  savedClientId = env.googleClientId;
  env.googleClientId = clientId;
  records.length = 0;
  creates = 0;
  updates = 0;
  // Keep Google's real signature/audience/issuer/expiry verification; only replace key download.
  context.mock.method(OAuth2Client.prototype, 'getFederatedSignonCertsAsync', async () => ({
    certs: { 'test-key': certificate }
  }));
  context.mock.method(User, 'findOne', async ({ where }) => records.find((user) =>
    where.googleId !== undefined ? user.googleId === where.googleId
      : where.username !== undefined ? user.username === where.username
      : user.email.toLowerCase() === where.email[Op.iLike].toLowerCase()) || null);
  context.mock.method(User, 'findByPk', async (id) => records.find((user) => user.id === id) || null);
  context.mock.method(User, 'create', async (values) => {
    await User.build(values).validate();
    const user = { ...values, id: records.length + 1, avatar: null };
    records.push(user);
    creates += 1;
    return user;
  });
  context.mock.method(User, 'update', async (values, { where }) => {
    const user = records.find((item) => item.id === where.id && item.email === where.email && item.password === where.password && !item.googleId);
    if (!user) return [0];
    Object.assign(user, values);
    updates += 1;
    return [1];
  });
});

afterEach((context) => {
  env.googleClientId = savedClientId;
  context.mock.restoreAll();
});

test('configuration exposes only a public client ID and handles disabled sign-in', async () => {
  assert.deepEqual((await request(undefined, { method: 'GET', path: '/google/config' })).body,
    { success: true, data: { clientId } });
  env.googleClientId = '';
  assert.equal((await request(undefined, { method: 'GET', path: '/google/config' })).body.data.clientId, null);
  assert.equal((await request({ credential: credential(), nonce })).status, 503);
  assert.equal(creates, 0);
});

test('creates a Google account and issues existing JWT session format without trusting submitted user fields', async () => {
  const response = await request({ credential: credential(), nonce, id: 999, email: 'attacker@gmail.com', password: 'Injected1!' });
  assert.equal(response.status, 200);
  const { user, token, refreshToken } = response.body.data;
  assert.equal(user.email, 'newuser@gmail.com');
  assert.equal(user.firstName, 'Aram');
  assert.match(user.username, /^[A-Za-z0-9_]{3,30}$/);
  assert.equal(user.hasPassword, false);
  assert.equal(Object.hasOwn(user, 'password'), false);
  assert.equal(Object.hasOwn(user, 'googleId'), false);
  assert.equal(records[0].password, null);
  assert.equal(records[0].googleId, 'google-subject-123');
  assert.equal(jwt.verify(token, env.jwt.secret).userId, user.id);
  assert.equal(jwt.verify(refreshToken, env.jwt.secret).type, 'refresh');
});

test('repeat sign-in finds the stable Google subject even if Google email has changed', async () => {
  const first = await request({ credential: credential(), nonce });
  const second = await request({ credential: credential({ email: 'changed@gmail.com' }), nonce });
  assert.equal(second.body.data.user.id, first.body.data.user.id);
  assert.equal(creates, 1);
});

test('links an existing Gmail account while preserving password and profile', async () => {
  const password = await bcrypt.hash('ExistingPass1!', 4);
  records.push({ id: 10, email: 'newuser@gmail.com', username: 'existing', firstName: 'Existing', password, googleId: null });
  assert.equal((await request({ credential: credential(), nonce })).status, 409);
  assert.equal((await request({ credential: credential(), nonce, password: 'WrongPass1!' })).status, 401);
  assert.equal(updates, 0);
  const response = await request({ credential: credential(), nonce, password: 'ExistingPass1!' });
  assert.equal(response.status, 200);
  assert.equal(response.body.data.user.id, 10);
  assert.equal(response.body.data.user.hasPassword, true);
  assert.equal(response.body.data.user.firstName, 'Existing');
  assert.equal(records[0].password, password);
  assert.equal(updates, 1);
  assert.equal(creates, 0);
});

test('does not silently link a third-party email or a different Google subject', async () => {
  records.push({ id: 10, email: 'member@example.com', password: 'existing', googleId: null });
  assert.equal((await request({ credential: credential({ email: 'member@example.com' }), nonce })).status, 409);
  records[0].email = 'newuser@gmail.com';
  records[0].googleId = 'another-subject';
  assert.equal((await request({ credential: credential(), nonce })).status, 409);
  assert.equal(updates, 0);
});

test('can create a verified third-party Google account without linking an existing account', async () => {
  const response = await request({ credential: credential({ email: 'member@example.com' }), nonce });
  assert.equal(response.status, 200);
  assert.equal(response.body.data.user.email, 'member@example.com');
});

test('rejects forged signatures, wrong audience and issuer, expired tokens and unverified email before database writes', async () => {
  const otherKeys = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const now = Math.floor(Date.now() / 1000);
  const expired = jwt.sign({ sub: '123', email: 'newuser@gmail.com', email_verified: true, nonce,
    aud: clientId, iss: 'https://accounts.google.com', iat: now - 7200, exp: now - 3600
  }, keys.privateKey, { algorithm: 'RS256', keyid: 'test-key' });
  const wrongAudience = jwt.sign({ sub: '123', nonce, aud: 'another-client', email_verified: true },
    keys.privateKey, { algorithm: 'RS256', keyid: 'test-key', issuer: 'https://accounts.google.com', expiresIn: '1h' });
  const wrongIssuer = jwt.sign({ sub: '123', nonce, email_verified: true }, keys.privateKey,
    { algorithm: 'RS256', keyid: 'test-key', audience: clientId, issuer: 'https://attacker.example', expiresIn: '1h' });
  for (const token of [
    'invalid', credential({}, otherKeys.privateKey), wrongAudience, wrongIssuer, expired,
    credential({ email_verified: false }), credential({ sub: '' }), credential({ nonce: 'b'.repeat(64) })
  ]) {
    const result = await request({ credential: token, nonce });
    assert.equal(result.status, 401);
    assert.equal(result.error.message.includes(token), false);
  }
  assert.equal(creates, 0);
  assert.equal(updates, 0);
});

test('rejects malformed requests and does not reflect credential values', async () => {
  for (const body of [{}, { credential: 12, nonce }, { credential: 'secret' },
    { credential: 'secret', nonce: 'bad' }, { credential: 'x'.repeat(16385), nonce }]) {
    const result = await request(body);
    assert.equal(result.status, 400);
    assert.ok(result.error.details.every((item) => !Object.hasOwn(item, 'value')));
  }
  assert.equal(creates, 0);
});

test('blocks cross-origin and form requests while permitting the configured browser origin', async () => {
  const body = { credential: credential(), nonce };
  assert.equal((await request(body, { contentType: 'application/x-www-form-urlencoded' })).status, 403);
  assert.equal((await request(body, { origin: 'https://attacker.example' })).status, 403);
  assert.equal((await request(body, { origin: env.clientUrl })).status, 200);
});

test('a concurrent account creation recovers through the stable Google subject', async (context) => {
  context.mock.method(User, 'create', async (values) => {
    records.push({ ...values, id: 42 });
    throw new UniqueConstraintError({ errors: [] });
  });
  const response = await request({ credential: credential(), nonce });
  assert.equal(response.status, 200);
  assert.equal(response.body.data.user.id, 42);
  assert.equal(records.length, 1);
});

test('Google-only accounts reject password login and password changes without a server error', async () => {
  const result = await request({ credential: credential(), nonce });
  const user = records[0];
  const service = require('../src/services/auth.service');
  await assert.rejects(service.login({ username: user.username, password: 'Guess1!' }), { statusCode: 401 });
  await assert.rejects(service.changePassword(user.id, { currentPassword: 'Guess1!', newPassword: 'NewPass1!' }), { statusCode: 400 });
  assert.ok(result.body.data.refreshToken);
});
