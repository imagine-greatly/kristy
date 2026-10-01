import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nonEmpty } from './testGuards.js';
import { supabase, requireAuth } from './supabase.js';
import { requireTripAllowance } from './tripGate.js';

// Import the actual routers and walk Express's stack; no HTTP or external services.
// Anthropic needs a key at construction, but these tests make no model calls.
process.env.ANTHROPIC_API_KEY ||= 'trip-gate-test-only';
const [{ default: list }, { default: trips }, { default: haul }] = await Promise.all([
  import('../routes/list.js'),
  import('../routes/trips.js'),
  import('../routes/haul.js'),
]);

const GATED = nonEmpty([
  'GET /list', 'POST /list', 'POST /list/rebuild', 'POST /list/compose',
  'POST /list/swaps', 'POST /list/import', 'POST /trips/new', 'POST /trips/next',
], 'expected gated routes', 8);
const UNGATED = nonEmpty([
  'POST /trips/complete', 'POST /trips/import', 'GET /trips/seedable', 'GET /haul',
], 'expected ungated routes', 4);
const routes = nonEmpty([list, trips, haul].flatMap((router) => router.stack
  .filter((layer) => layer.route)
  .flatMap(({ route }) => Object.keys(route.methods).filter((method) => route.methods[method])
    .map((method) => ({ key: `${method.toUpperCase()} ${route.path}`, handles: route.stack.map((layer) => layer.handle) })))),
'collected routes', GATED.length);
const gatedRoutes = nonEmpty(routes.filter(({ key }) => GATED.includes(key)), 'collected gated routes', GATED.length);
const ungatedRoutes = nonEmpty(routes.filter(({ key }) => UNGATED.includes(key)), 'collected ungated routes', UNGATED.length);
const isGate = (handle) => handle === requireTripAllowance;
const findRoute = (key) => {
  const route = routes.find((route) => route.key === key);
  assert.ok(route, `${key} exists`);
  return route;
};
const response = () => ({
  statusCode: 200, body: null,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

// Run the actual post-auth stack for a signed-in request. Denials must stop even
// before the rate-limit/upload middleware, and members reach the real trip handler.
async function runSignedIn(route, req, res) {
  for (const handle of route.handles.slice(1)) {
    let continued = false;
    await handle(req, res, () => { continued = true; });
    if (!continued) return;
  }
}

function fakeClient(completedCount) {
  const db = {
    rows: Array.from({ length: completedCount }, (_, i) => ({ id: `t${i}`, user_id: 'u1', status: 'completed' })),
    writes: [],
    from(table) {
      assert.equal(table, 'trips');
      const filters = [];
      let limit;
      let inserted;
      const q = {
        select() { return q; },
        eq(col, val) { filters.push([col, val]); return q; },
        limit(n) { limit = n; return q; },
        insert(row) { db.writes.push(row); db.rows.push(row); inserted = row; return q; },
        single() { return Promise.resolve({ data: inserted, error: null }); },
        then(resolve) {
          const matches = db.rows.filter((row) => filters.every(([col, val]) => row[col] === val));
          return Promise.resolve({ data: limit == null ? matches : matches.slice(0, limit), count: matches.length, error: null }).then(resolve);
        },
      };
      return q;
    },
  };
  return db;
}

test('all eight gated routes enforce trip allowance after auth and before every handler', () => {
  assert.deepEqual(gatedRoutes.map(({ key }) => key).sort(), [...GATED].sort());
  for (const { key, handles } of gatedRoutes) {
    assert.equal(handles[0], requireAuth, `${key}: auth first`);
    assert.equal(handles[1], requireTripAllowance, `${key}: trip allowance before rate limits, uploads, and handler`);
    assert.equal(handles.filter(isGate).length, 1, `${key}: one gate`);
  }
  for (const { key, handles } of ungatedRoutes) {
    assert.equal(handles.some(isGate), false, `${key}: intentionally ungated`);
  }
});

test('two completed trips yield 402 and no writes through every actual gated stack', async (t) => {
  const db = fakeClient(2);
  const before = structuredClone(db.rows);
  t.mock.method(supabase, 'from', db.from.bind(db));
  for (const route of gatedRoutes) {
    const res = response();
    await runSignedIn(route, { user: { id: 'u1' }, _premiumChecked: true, _premium: false }, res);
    assert.equal(res.statusCode, 402, route.key);
    assert.deepEqual(res.body, { error: 'trip_allowance', allowanceRemaining: 0 }, route.key);
    assert.deepEqual(db.writes, [], route.key);
    assert.deepEqual(db.rows, before, route.key);
  }
});

test('a member with five completed trips reaches POST /trips/new and receives 200', async (t) => {
  const db = fakeClient(5);
  t.mock.method(supabase, 'from', db.from.bind(db));
  const res = response();
  await runSignedIn(findRoute('POST /trips/new'), { user: { id: 'u1' }, _premiumChecked: true, _premium: true }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.trip.status, 'active');
  assert.equal(db.writes.length, 1);
});

test('seedable adds the actual completed count without changing its existing fields', async (t) => {
  t.mock.method(supabase, 'from', (table) => {
    assert.equal(table, 'trips');
    let options;
    const q = {
      select(_columns, opts) { options = opts; return q; },
      eq() { return q; }, order() { return q; }, limit() { return q; },
      then(resolve) {
        const data = options?.count
          ? [{ id: 't1' }, { id: 't2' }]
          : [{ completed_at: '2026-10-01T00:00:00Z', items: [{ source: 'user' }, { source: 'swap' }] }];
        return Promise.resolve({ data, count: 2, error: null }).then(resolve);
      },
    };
    return q;
  });
  const res = response();
  await findRoute('GET /trips/seedable').handles.at(-1)({ user: { id: 'u1' } }, res);
  assert.deepEqual(res.body, { seedable: true, items: 1, completedAt: '2026-10-01T00:00:00Z', completedTrips: 2 });
});

test('seedable preserves the seed when only the completed count query fails', async (t) => {
  t.mock.method(supabase, 'from', (table) => {
    assert.equal(table, 'trips');
    let options;
    const q = {
      select(_columns, opts) { options = opts; return q; },
      eq() { return q; }, order() { return q; }, limit() { return q; },
      then(resolve) {
        const result = options?.count
          ? { data: null, count: null, error: { message: 'count unavailable' } }
          : { data: [{ completed_at: '2026-10-01T00:00:00Z', items: [{ source: 'user' }, { source: 'swap' }] }], error: null };
        return Promise.resolve(result).then(resolve);
      },
    };
    return q;
  });
  const res = response();
  await findRoute('GET /trips/seedable').handles.at(-1)({ user: { id: 'u1' } }, res);
  assert.deepEqual(res.body, { seedable: true, items: 1, completedAt: '2026-10-01T00:00:00Z', completedTrips: null });
});

test('seedable fallback reports an unknown count as null, never zero', async (t) => {
  t.mock.method(supabase, 'from', () => { throw new Error('database unreachable'); });
  const res = response();
  await findRoute('GET /trips/seedable').handles.at(-1)({ user: { id: 'u1' } }, res);
  assert.deepEqual(res.body, { seedable: false, items: 0, completedAt: null, completedTrips: null });
});

test('seedable reports null when the database returns an error rather than throwing', async (t) => {
  t.mock.method(supabase, 'from', () => {
    const q = {
      select() { return q; }, eq() { return q; }, order() { return q; }, limit() { return q; },
      then(resolve) { return Promise.resolve({ data: null, count: null, error: { message: 'unavailable' } }).then(resolve); },
    };
    return q;
  });
  const res = response();
  await findRoute('GET /trips/seedable').handles.at(-1)({ user: { id: 'u1' } }, res);
  assert.deepEqual(res.body, { seedable: false, items: 0, completedAt: null, completedTrips: null });
});
