const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { readdir } = require('fs/promises');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'production';

// Exercise the real HTTP routes, authentication, validation, services, and disk
// uploads while keeping database state isolated from the developer's database.
const records = new Map();
let nextId = 1;
let failWrite = false;

class ListingRecord {
  constructor(values) { Object.assign(this, structuredClone(values)); }
  async save() {
    if (failWrite) {
      failWrite = false;
      throw new Error('Simulated database write failure');
    }
    records.set(this.id, structuredClone({ ...this }));
    return this;
  }
  async increment(field, { by }) { this[field] += by; await this.save(); }
  async reload() { Object.assign(this, structuredClone(records.get(this.id))); return this; }
  async destroy() { records.delete(this.id); }
}

const Listing = {
  async create(values) {
    const listing = new ListingRecord({ id: nextId++, ...values });
    return listing.save();
  },
  async findByPk(id) {
    const values = records.get(Number(id));
    return values ? new ListingRecord(values) : null;
  },
  async findAndCountAll({ where, limit, offset }) {
    const rows = [...records.values()].filter((record) => (
      (!where.userId || record.userId === where.userId)
      && (!where.status || record.status === where.status)
    ));
    return { rows: rows.slice(offset, offset + limit).map((row) => new ListingRecord(row)), count: rows.length };
  },
  async findAll({ where }) {
    return [...records.values()].filter((row) => where.id.includes(row.id)).map((row) => new ListingRecord(row));
  }
};

const modelStubs = {
  Listing,
  User: { async findByPk(id) { return { id: Number(id), username: `user${id}` }; } },
  Favorite: { async findAll() { return [...records.values()].map((row) => ({ id: row.id, userId: 1, listingId: row.id })); } }
};
const requireModelPath = require.resolve('../src/utils/requireModel');
require(requireModelPath);
require.cache[requireModelPath].exports = (name) => {
  assert.ok(modelStubs[name], `Unexpected model ${name}`);
  return modelStubs[name];
};

const app = require('../src/app');
const env = require('../src/config/env');
const { listingImagesDirectory, removeListingImages } = require('../src/utils/listingImages');
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=', 'base64');
const payload = { title: 'Test phone', description: 'A phone in excellent condition.', price: 150 };
let server;
let origin;
let originalFiles;

const filesOnDisk = async () => {
  try { return (await readdir(listingImagesDirectory)).sort(); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
};

before(async () => {
  originalFiles = await filesOnDisk();
  server = await new Promise((resolve, reject) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
    listener.once('error', reject);
  });
  origin = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  const added = (await filesOnDisk()).filter((name) => !originalFiles.includes(name));
  await removeListingImages(added.map((name) => `/uploads/listings/${name}`));
  if (server) await new Promise((resolve) => server.close(resolve));
});

const multipart = (fields = {}, files = []) => {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  for (const file of files) {
    form.append(file.field || 'images', new Blob([file.bytes || png], { type: file.type || 'image/png' }), file.name || 'photo.png');
  }
  return form;
};

const request = async (method, path, body, userId = 1) => {
  const headers = {};
  if (userId) headers.Authorization = `Bearer ${jwt.sign({ userId }, env.jwt.secret)}`;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }
  const response = await fetch(`${origin}${path}`, { method, headers, body });
  const result = response.status === 204 ? null : await response.json();
  return { status: response.status, body: result };
};

test('listing image lifecycle through existing endpoints', async () => {
  const empty = await request('POST', '/api/listings', payload);
  assert.equal(empty.status, 201);
  assert.equal(empty.body.data.status, 'active');
  assert.deepEqual(empty.body.data.images, []);

  const created = await request('POST', '/api/listings', multipart(payload, [{}, {}]));
  assert.equal(created.status, 201);
  assert.equal(created.body.data.status, 'active');
  const { id, images } = created.body.data;
  assert.equal(images.length, 2);
  assert.notEqual(images[0], images[1]);
  assert.match(images[0], /^\/uploads\/listings\/[\w-]+\.png$/);
  for (const image of images) {
    const response = await fetch(`${origin}${image}`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'image/png');
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), png);
  }

  const all = await request('GET', '/api/listings');
  assert.deepEqual(all.body.data.find((item) => item.id === id).images, images);
  assert.equal(all.body.pagination.totalItems, 2);
  const mine = await request('GET', '/api/listings/mine');
  assert.deepEqual(mine.body.data.find((item) => item.id === id).images, images);
  const single = await request('GET', `/api/listings/${id}`);
  assert.deepEqual(single.body.data.images, images);
  assert.equal(single.body.data.viewsCount, 0);
  const favorites = await request('GET', '/api/favorites');
  assert.deepEqual(favorites.body.data.find((item) => item.listingId === id).listing.images, images);

  const updated = await request('PATCH', `/api/listings/${id}`, { price: 175, images: ['/uploads/listings/untrusted.png'] });
  assert.equal(updated.status, 200);
  assert.deepEqual(updated.body.data.images, images);
  const noFiles = await request('PATCH', `/api/listings/${id}`, multipart({ title: 'Updated phone' }));
  assert.deepEqual(noFiles.body.data.images, images);
  const status = await request('PATCH', `/api/listings/${id}/status`, { status: 'reserved' });
  assert.equal(status.status, 200);
  assert.equal(status.body.data.status, 'reserved');
  assert.deepEqual(status.body.data.images, images);

  const beforeForbidden = await filesOnDisk();
  assert.equal((await request('PATCH', `/api/listings/${id}`, multipart({}, [{}]), 2)).status, 403);
  assert.equal((await request('POST', '/api/listings', multipart(payload, [{}]), null)).status, 401);
  assert.equal((await request('PATCH', '/api/listings/99999', multipart({}, [{}]))).status, 404);
  assert.equal((await request('PATCH', '/api/listings/invalid', multipart({}, [{}]))).status, 400);
  assert.deepEqual(await filesOnDisk(), beforeForbidden);

  const replacement = await request('PATCH', `/api/listings/${id}`, multipart({}, [{}]));
  assert.equal(replacement.status, 200);
  assert.equal(replacement.body.data.images.length, 1);
  for (const image of images) assert.equal((await fetch(`${origin}${image}`)).status, 404);
  const newImage = replacement.body.data.images[0];
  assert.equal((await fetch(`${origin}${newImage}`)).status, 200);
  assert.equal((await request('DELETE', `/api/listings/${id}`)).status, 204);
  assert.equal((await fetch(`${origin}${newImage}`)).status, 404);
  assert.equal((await request('DELETE', `/api/listings/${empty.body.data.id}`)).status, 204);
  assert.deepEqual(await filesOnDisk(), originalFiles);
});

test('creation uses server-controlled active status and owners can change it later', async () => {
  for (const body of [
    { ...payload, status: 'sold' },
    multipart({ ...payload, status: 'reserved' }, [{}])
  ]) {
    const created = await request('POST', '/api/listings', body);
    assert.equal(created.status, 201);
    assert.equal(created.body.data.status, 'active');
    const { id } = created.body.data;

    for (const status of ['reserved', 'sold']) {
      const updated = await request('PATCH', `/api/listings/${id}/status`, { status });
      assert.equal(updated.status, 200);
      assert.equal(updated.body.data.status, status);
    }
    assert.equal((await request('PATCH', `/api/listings/${id}/status`, { status: 'invalid' })).status, 400);
    assert.equal((await request('PATCH', `/api/listings/${id}/status`, { status: 'reserved' }, 2)).status, 403);
    assert.equal((await request('GET', `/api/listings/${id}`)).body.data.status, 'sold');
    assert.equal((await request('DELETE', `/api/listings/${id}`)).status, 204);
  }
});

test('failed uploads and validation leave no new files on disk', async () => {
  const baseline = await filesOnDisk();
  const cases = [
    [multipart({ ...payload, title: 'x' }, [{}]), 400],
    [multipart(payload, [{}, { name: 'fake.png', bytes: Buffer.from('not an image') }]), 400],
    [multipart(payload, [{}, { name: 'photo.txt', type: 'text/plain' }]), 400],
    [multipart(payload, [{ field: 'image' }]), 400],
    [multipart(payload, Array.from({ length: 11 }, () => ({}))), 400],
    [multipart(payload, [{ bytes: Buffer.alloc(5 * 1024 * 1024 + 1) }]), 413]
  ];
  for (const [body, expectedStatus] of cases) {
    const response = await request('POST', '/api/listings', body);
    assert.equal(response.status, expectedStatus, JSON.stringify(response.body));
    assert.deepEqual(await filesOnDisk(), baseline);
  }
});

test('database failures clean new files and preserve previous images', async () => {
  const baseline = await filesOnDisk();
  failWrite = true;
  assert.equal((await request('POST', '/api/listings', multipart(payload, [{}]))).status, 500);
  assert.deepEqual(await filesOnDisk(), baseline);

  const created = await request('POST', '/api/listings', multipart(payload, [{}]));
  const { id, images } = created.body.data;
  const afterCreate = await filesOnDisk();
  failWrite = true;
  assert.equal((await request('PATCH', `/api/listings/${id}`, multipart({}, [{}]))).status, 500);
  assert.deepEqual(await filesOnDisk(), afterCreate);
  assert.deepEqual((await request('GET', `/api/listings/${id}`)).body.data.images, images);
  assert.equal((await fetch(`${origin}${images[0]}`)).status, 200);
  await request('DELETE', `/api/listings/${id}`);
  assert.deepEqual(await filesOnDisk(), baseline);
});
