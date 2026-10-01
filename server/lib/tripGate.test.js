import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canRunATrip, allowanceRemaining, completedTrips, requireTripAllowance } from './tripGate.js';

const USER = 'u1';
const request = (premium = false) => ({ user: { id: USER }, _premiumChecked: true, _premium: premium });
const finished = (n) => Array.from({ length: n }, (_, i) => ({ id: `t${i}`, user_id: USER, status: 'completed' }));

// Like trips.test.js: table-aware rows, eq filters, and an awaitable PostgREST query.
// Record every mutation so a denial proves that it did not write anything.
function fakeClient({ rows = [], error = null, throws = false, countOverride } = {}) {
  const api = { rows: structuredClone(rows), reads: [], writes: [] };
  api.from = (table) => {
    assert.equal(table, 'trips');
    const filters = [];
    const q = {
      select(columns, options) { api.reads.push({ columns, options }); return q; },
      eq(col, val) { filters.push([col, val]); return q; },
      insert(input) { api.writes.push({ insert: input }); api.rows.push(input); return q; },
      update(patch) { api.writes.push({ update: patch }); return q; },
      upsert(input) { api.writes.push({ upsert: input }); return q; },
      delete() { api.writes.push({ delete: true }); return q; },
      then(resolve, reject) {
        if (throws) return Promise.reject(new Error('database unreachable')).then(resolve, reject);
        const data = api.rows.filter((row) => filters.every(([col, val]) => row[col] === val));
        const count = countOverride === undefined ? data.length : countOverride;
        return Promise.resolve({ data: error ? null : data, count, error }).then(resolve, reject);
      },
    };
    return q;
  };
  return api;
}

function response() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test('two completed trips without premium exhaust the allowance', async () => {
  const db = fakeClient({ rows: finished(2) });
  assert.equal(await canRunATrip(request(), db), false);
  assert.equal(await allowanceRemaining(request(), db), 0);
});

test('one completed trip without premium leaves one trip', async () => {
  const db = fakeClient({ rows: finished(1) });
  assert.equal(await canRunATrip(request(), db), true);
  assert.equal(await allowanceRemaining(request(), db), 1);
});

test('premium permits a trip even after five completed trips', async () => {
  const db = fakeClient({ rows: finished(5) });
  assert.equal(await canRunATrip(request(true), db), true);
  const res = response();
  let nextCalls = 0;
  await requireTripAllowance(request(true), res, () => { nextCalls++; }, db);
  assert.equal(nextCalls, 1);
  assert.equal(res.body, null);
});

test('completedTrips counts only this user\'s completed rows with a real exact select', async () => {
  const db = fakeClient({ rows: [
    ...finished(1),
    { id: 'active', user_id: USER, status: 'active' },
    { id: 'abandoned', user_id: USER, status: 'abandoned' },
    { id: 'other', user_id: 'u2', status: 'completed' },
  ] });
  assert.equal(await completedTrips(USER, db), 1);
  assert.deepEqual(db.reads, [{ columns: 'id', options: { count: 'exact', head: false } }]);
  assert.equal(await allowanceRemaining(request(), fakeClient()), 2);
  assert.equal(await allowanceRemaining(request(), fakeClient({ rows: finished(5) })), 0);
  // The exact count, rather than returned-page length, is authoritative.
  assert.equal(await completedTrips(USER, fakeClient({ rows: finished(1), countOverride: 1001 })), 1001);
});

test('a database error fails closed with 503, without next or writes', async () => {
  const db = fakeClient({ error: { message: 'trips unavailable' } });
  const res = response();
  let nextCalls = 0;
  await requireTripAllowance(request(), res, () => { nextCalls++; }, db);
  assert.equal(res.statusCode, 503);
  assert.equal(nextCalls, 0);
  assert.deepEqual(db.writes, []);
});

test('a thrown database failure also fails closed', async () => {
  const res = response();
  let nextCalls = 0;
  await requireTripAllowance(request(), res, () => { nextCalls++; }, fakeClient({ throws: true }));
  assert.equal(res.statusCode, 503);
  assert.equal(nextCalls, 0);
});

test('an unavailable count is never treated as zero allowance used', async () => {
  const res = response();
  let nextCalls = 0;
  await requireTripAllowance(request(), res, () => { nextCalls++; }, fakeClient({ countOverride: null }));
  assert.equal(res.statusCode, 503);
  assert.equal(nextCalls, 0);
});

test('402 stops the handler and writes nothing to the fake client', async () => {
  const db = fakeClient({ rows: finished(2) });
  const before = structuredClone(db.rows);
  const res = response();
  let nextCalls = 0;
  await requireTripAllowance(request(), res, () => {
    nextCalls++;
    db.from('trips').insert({ user_id: USER, status: 'active' });
  }, db);
  assert.equal(res.statusCode, 402);
  assert.deepEqual(res.body, { error: 'trip_allowance', allowanceRemaining: 0 });
  assert.equal(nextCalls, 0);
  assert.deepEqual(db.writes, []);
  assert.deepEqual(db.rows, before);
});
