const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { sequelize } = require('../src/config/database');
const { User, Rating, Notification } = require('../src/models');
const notificationService = require('../src/services/notification.service');
const ratingController = require('../src/controllers/rating.controller');

afterEach((context) => context.mock.restoreAll());

test('rating notifications use the authenticated actor instead of a submitted actorId', async (context) => {
  const rating = { id: 10, raterId: 2, ratedUserId: 5, rating: 4 };
  const transaction = { testTransaction: true };
  context.mock.method(User, 'findByPk', async () => ({ id: 5 }));
  context.mock.method(Rating, 'findOne', async () => null);
  context.mock.method(Rating, 'create', async () => rating);
  context.mock.method(sequelize, 'transaction', async (callback) => callback(transaction));
  const create = context.mock.method(Notification, 'create', async (values) => values);
  const response = await new Promise((resolve, reject) => {
    ratingController.createRating(
      { user: { id: 2 }, params: { userId: '5' }, body: { rating: 4, actorId: 999 } },
      { status(code) { assert.equal(code, 201); return this; }, json: resolve },
      reject
    );
  });

  assert.equal(response.data, rating);
  assert.equal(create.mock.calls.length, 1);
  assert.deepEqual(create.mock.calls[0].arguments[0], {
    userId: '5', actorId: 2, type: 'rating', message: 'You received a new rating',
    listingId: null, isRead: false
  });
  assert.equal(create.mock.calls[0].arguments[1].transaction, transaction);
  assert.equal(Rating.create.mock.calls[0].arguments[1].transaction, transaction);
});

test('notifications can still be created without an actor', async (context) => {
  context.mock.method(Notification, 'create', async (values) => values);
  const result = await notificationService.createNotification({
    userId: 5, type: 'system', message: 'Welcome'
  });
  assert.equal(result.actorId, null);
  assert.equal(result.userId, 5);
});

const assertActorQuery = (sql) => {
  // Exercise Sequelize's real SQL generation, including field selection.
  assert.match(sql, /LEFT OUTER JOIN "users" AS "actor"/);
  const actorFields = [...sql.matchAll(/AS "actor\.([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(actorFields.sort(), ['avatar', 'firstName', 'id', 'lastName', 'username']);
  assert.doesNotMatch(sql, /"password"|"email"/);
};

test('list queries keep recipient filtering and include only public actor fields', async (context) => {
  let sql;
  context.mock.method(sequelize, 'query', async (query) => { sql = query; return []; });
  assert.deepEqual(await notificationService.getNotifications(5), []);
  assertActorQuery(sql);
  assert.match(sql, /WHERE "Notification"\."userId" = 5/);
  assert.match(sql, /ORDER BY "Notification"\."createdAt" DESC/);
});

test('mark-as-read preserves actor details and remains scoped to the recipient', async (context) => {
  const notification = Notification.build({
    id: 10, userId: 5, actorId: 2, type: 'rating', message: 'You received a new rating',
    isRead: false,
    actor: { id: 2, firstName: 'Aram', lastName: 'Sargsyan', username: 'aram', avatar: null }
  }, { isNewRecord: false, include: [{ association: 'actor' }] });
  const save = context.mock.method(notification, 'save', async () => notification);
  let sql;
  context.mock.method(sequelize, 'query', async (query) => { sql = query; return notification; });

  const result = await notificationService.markAsRead(5, 10);
  assertActorQuery(sql);
  assert.match(sql, /"Notification"\."userId" = 5/);
  assert.match(sql, /"Notification"\."id" = 10/);
  assert.equal(save.mock.calls.length, 1);
  assert.equal(result.isRead, true);
  assert.equal(result.toJSON().actor.username, 'aram');
});

test('mark-as-read rejects notifications outside the recipient scope', async (context) => {
  context.mock.method(sequelize, 'query', async () => null);
  await assert.rejects(notificationService.markAsRead(5, 10), { statusCode: 404 });
});
