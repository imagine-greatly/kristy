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

import { danglingReferences, trackedSources, GUARDED, isSuiteFile } from '../scripts/commitGuard.js';
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
    // `docs` earns its place because a build script RESOLVES one of them: buildDoLines.js
    // reads docs/do-lines-review.md, and that file not shipping is why every curated `do`
    // line was missing in production.
    assert.match(d, /^(server|client|mobile)\/|^docs$/, `${d} should be a source or resolved-content directory`);
  }
  // A scratchpad file or a local .env is deliberately out of scope: untracked is correct
  // for those, and a guard that shouts about them gets switched off.
  assert.ok(!GUARDED.includes('server'), 'guarding all of server/ would sweep in .env and scratch files');
});

/* ═══════════ A REFERENCE IS NOT ALWAYS AN IMPORT ═══════════
   2026-08-05: commitGuard printed "nothing this commit carries references an untracked
   file" while `server/lib/listRefine.test.js` — eighteen tests, the whole proof of a
   three-bug fix — sat untracked in a guarded directory. Nothing imports a test file, so an
   import graph is structurally incapable of seeing one. The guard built to catch a missing
   test could not catch a missing test: the third member of this family, and the first one
   found inside the guard itself.

   WHY THE TREE-STATE CHECK IS THE CLI'S JOB AND NOT THIS FILE'S. An untracked test file is
   a defect at COMMIT time, not at test time — `npm test` runs in the working tree, where
   the file is present and running. Asserting tree state here would go red every time
   anyone wrote a test before staging it, which is most of the time, and a suite that cries
   wolf during ordinary work is a suite people stop reading. So `commitGuard.js` enforces
   the state before a commit, and this pins the LOGIC — that discovery counts as a
   reference, and that the pattern still matches the real corpus. A regex that has drifted
   off the naming convention is a comment asserting an invariant, in executable clothing. */

test('the suite-file pattern still matches every suite file git actually tracks', () => {
  // The drift guard. If the convention moves (`foo.spec.js`) or a browser suite lands with
  // a new extension, this fails rather than the guard quietly covering less than it says.
  const tracked = nonEmpty(
    SOURCES.filter((f) => /\.test\.[cm]?js$/.test(f) || f.startsWith('client/test/')),
    'tracked suite files',
    20
  );
  const missed = tracked.filter((f) => !isSuiteFile(f) && !f.endsWith('.json'));
  assert.deepEqual(missed, [], 'these are suite files the guard would not recognise as one');
});

test('an untracked suite file is reported even though nothing imports it', () => {
  // Synthetic, so it holds whatever the tree happens to look like right now.
  for (const f of nonEmpty(
    ['server/lib/listRefine.test.js', 'server/lib/anything.test.js', 'client/test/newSuite.mjs', 'client/test/newHarness.jsx'],
    'suite-shaped paths'
  )) {
    assert.ok(isSuiteFile(f), `${f} is discovered by the runner, so it is referenced`);
  }
  // And the things that are NOT suite files stay out, or the guard fails on scratch modules.
  for (const f of ['server/lib/cartEdit.js', 'client/src/App.jsx', 'docs/LIST-CREATION-AUDIT.md']) {
    assert.ok(!isSuiteFile(f), `${f} is not found by the runner`);
  }
});

test('a bare filename counts as a path — the browser fixtures are reached that way', () => {
  // `join(__dirname, 'tripFixture.json')` has no leading './', so PATH_LITERAL missed every
  // one of them: cartFixture, composedFixture, tripFixture, skim-harness, shot-harness.
  // Proven by the tree-mode scan being clean while those files are tracked; the assertion
  // that matters is that the scan RESOLVES them at all, which it now does by name.
  const bad = danglingReferences({ mode: 'tree' });
  assert.deepEqual(bad.map((b) => `${b.from} -> ${b.resolved}`), [], 'a bare-name reference must resolve like any other');
});
