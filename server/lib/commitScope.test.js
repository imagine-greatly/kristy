// Nothing this repo carries may reference a file git does not track.
//
// THE SECOND MEMBER OF A FAMILY. `nonEmpty` exists because `[].every(fn)` is `true` — a
// check whose collection is empty by accident reports success. This exists because a check
// whose FILES are missing from the commit reports success the same way: every test runs
// against the working tree, and the working tree has the file whether or not git does.
// Both are "the check passed because it could not see the thing", and both are worse than
// no check, because the suite now carries a green tick where the coverage used to be.
//
// It has happened twice. The clearest case: `3267c95 The list becomes the trip, and the
// whole list is free` landed the list matcher and NOT the trips feature — `server/lib/
// trips.js`, `server/routes/trips.js`, `trips.test.js` and the loop harness stayed
// untracked for a day, under a commit title asserting they had shipped, while
// `server/index.js` imported one of them.
//
// `scripts/commitGuard.js` is the same logic run against the STAGED set before a commit.
// This runs it against the tracked tree, so `npm test` fails too — a guard nobody
// remembers to invoke is a guard that catches the case nobody remembered.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { danglingReferences, trackedSources, GUARDED } from '../scripts/commitGuard.js';
import { nonEmpty } from './testGuards.js';

// Bound at the collection. If git is unavailable or the repo is not a checkout, every
// assertion below would pass over an empty list — which is the exact defect this file is
// about, reproduced inside the file that exists to prevent it.
const SOURCES = nonEmpty(trackedSources(), 'tracked source files', 50);

test('no tracked file imports a file git does not track', () => {
  const bad = danglingReferences({ mode: 'tree' });
  assert.deepEqual(
    bad.map((b) => `${b.from} -> ${b.resolved}`),
    [],
    'these resolve to untracked files, so a commit carrying them would be green locally and ' +
      'incomplete on main — git add them, or drop the import'
  );
});

test('the guard reads more than it guards', () => {
  // GUARDED says where an UNTRACKED file is a problem. It must never also decide what gets
  // READ: `server/index.js` matches none of those prefixes and is the file that mounts
  // every route, so filtering sources by GUARDED silently exempted the mount point. The
  // first draft did exactly that and missed index.js importing ./routes/trips.js.
  assert.ok(SOURCES.includes('server/index.js'), 'index.js must be scanned — it is where routes are mounted');
  assert.ok(
    !GUARDED.some((d) => 'server/index.js'.startsWith(`${d}/`)),
    'index.js is outside GUARDED, which is precisely why sources must not be filtered by it'
  );
});

test('the guarded directories are the ones where an untracked file means an incomplete commit', () => {
  for (const d of nonEmpty(GUARDED, 'guarded directories', 4)) {
    assert.match(d, /^(server|client|mobile)\//, `${d} should be a source directory`);
  }
  // A scratchpad file or a local .env is deliberately out of scope: untracked is correct
  // for those, and a guard that shouts about them gets switched off.
  assert.ok(!GUARDED.includes('server'), 'guarding all of server/ would sweep in .env and scratch files');
});
