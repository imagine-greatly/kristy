# g1-ungate-list — the trip gate follows Ruling F (free list, paid shop)

```json
{
  "id": "g1-ungate-list",
  "tier": "T2",
  "ui": false,
  "owns": ["server/routes/list.js", "server/routes/trips.js", "server/lib/tripGateRoutes.test.js", "server/lib/tripGate.js"],
  "read_full": ["server/lib/tripGate.js", "server/lib/tripGateRoutes.test.js"],
  "verify": "node --test server/lib/g1Ungate.test.js && cd server && npm test"
}
```

Approved: "Devon approves G1 (server, production push)." (2026-10-02).
Ruling F (Devon): "free users can edit and create their lists but they can only put them to use in shopmode which is paid, the creation of their list encourages buying shop mode".

## Change
- `requireTripAllowance` on GET /list, POST /list, POST /list/rebuild, POST /list/compose, POST /list/swaps, POST /list/import (server/routes/list.js) and POST /trips/next (server/routes/trips.js) → removed; `requireAuth` and any `userRateLimit` stay; LIST_COMPOSE_FREE_LIMIT untouched.
- POST /trips/new keeps `requireTripAllowance` (starting a trip is shop mode).
- tripGateRoutes.test.js expected sets → GATED = ['POST /trips/new'] (nonEmpty min 1); UNGATED = the seven routes above plus POST /trips/complete, POST /trips/import, GET /trips/seedable, GET /haul (min 11). Any test in that file asserting a list route returns 402 is rewritten to assert it does not.
- Drop the `requireTripAllowance` import from list.js if unused. tripGate.js: comments naming the gated set only, no logic change.

## Criteria
- C1 [test] Given the real routers, When the list routes and POST /trips/next are walked, Then none has requireTripAllowance in its stack.
- C2 [test] Given the real routers, When POST /trips/new is walked, Then requireTripAllowance is in its stack.

## Acceptance server/lib/g1Ungate.test.js
```js
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
```

## ANCHOR server/routes/list.js:129
```
router.get('/list', requireAuth, requireTripAllowance, async (req, res) => {
  const userId = req.user.id;
  try {
```

## ANCHOR server/routes/trips.js:46
```
router.post('/trips/new', requireAuth, requireTripAllowance, async (req, res) => {
  try {
    const out = await startNewTrip(req.user.id, supabase);
```

## ANCHOR server/lib/tripGateRoutes.test.js:16
```
const GATED = nonEmpty([
  'GET /list', 'POST /list', 'POST /list/rebuild', 'POST /list/compose',
  'POST /list/swaps', 'POST /list/import', 'POST /trips/new', 'POST /trips/next',
```
