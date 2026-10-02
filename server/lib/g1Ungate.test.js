import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requireTripAllowance } from './tripGate.js';

process.env.ANTHROPIC_API_KEY ||= 'trip-gate-test-only';
const [{ default: list }, { default: trips }] = await Promise.all([
  import('../routes/list.js'),
  import('../routes/trips.js'),
]);
const routes = [list, trips].flatMap((router) => router.stack
  .filter((layer) => layer.route)
  .flatMap(({ route }) => Object.keys(route.methods).filter((m) => route.methods[m])
    .map((m) => ({ key: `${m.toUpperCase()} ${route.path}`, handles: route.stack.map((l) => l.handle) }))));
const gated = (key) => {
  const r = routes.find((x) => x.key === key);
  assert.ok(r, `${key} exists`);
  return r.handles.includes(requireTripAllowance);
};

test('C1 list creation and editing are free (Ruling F)', () => {
  for (const key of ['GET /list', 'POST /list', 'POST /list/rebuild', 'POST /list/compose',
    'POST /list/swaps', 'POST /list/import', 'POST /trips/next']) {
    assert.equal(gated(key), false, `${key} must not be gated`);
  }
});

test('C2 starting a trip (shop mode) stays gated', () => {
  assert.equal(gated('POST /trips/new'), true);
});
