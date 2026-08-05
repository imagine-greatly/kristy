// docs/api-shapes.generated.md is a BUILD PRODUCT of the route handlers, and this is the only
// thing holding them together.
//
// SWIFT-SPEC.md §A listed paths and methods and no response shapes, which was the biggest gap
// for anyone starting the Swift client cold. Hand-writing ~40 Codable structs against a server
// that changes weekly produces a document that is wrong within a fortnight — a comment
// asserting an invariant, at document scale. So the shapes are derived from the handlers, and
// this test fails when the committed file and the source disagree.
//
// Same arrangement as docs/do-lines-review.md → lib/doLines.json, for the same reason: a
// generated file that nothing checks is a file that drifts. Edit a handler, run
// `node server/scripts/buildApiShapes.js`, commit both.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { nonEmpty } from './testGuards.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER = join(__dirname, '..');
const DOC = join(SERVER, '..', 'docs', 'api-shapes.generated.md');

const doc = readFileSync(DOC, 'utf8');

test('the generated shapes file is not stale', () => {
  // --check re-derives from the handlers and exits 1 on any difference, so this asserts the
  // committed file IS what the current source produces — not merely that it exists.
  try {
    execFileSync(process.execPath, [join(SERVER, 'scripts', 'buildApiShapes.js'), '--check'], {
      cwd: SERVER,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    assert.fail(
      'docs/api-shapes.generated.md is stale — a route response changed and the file was not ' +
        'regenerated. Run: node server/scripts/buildApiShapes.js\n' +
        (err.stderr || err.stdout || err.message)
    );
  }
});

test('it covers every route file that mounts handlers', () => {
  // A route file the generator stopped seeing would silently drop its endpoints from the spec.
  const sections = nonEmpty([...doc.matchAll(/^## ([a-z0-9]+\.js)$/gm)].map((m) => m[1]), 'route file sections', 15);
  for (const f of ['list.js', 'counter.js', 'verdict.js', 'scan.js', 'trips.js', 'guest.js', 'subscription.js']) {
    assert.ok(sections.includes(f), `${f} is missing from the generated shapes — did the route regex drift?`);
  }
});

test('it carries the honesty caveat and a hand-check list', () => {
  // The value of this document is that it distinguishes what was derived from what was guessed.
  // Strip either and it becomes a confident fabrication, which is worse than no document.
  assert.match(doc, /NEEDS HAND-CHECK/);
  assert.match(doc, /Request bodies are NOT derived/);
  const listed = [...doc.matchAll(/^- `(GET|POST|PUT|PATCH|DELETE) /gm)];
  assert.ok(listed.length >= 10, `only ${listed.length} hand-check entries — the section looks empty`);
});

test('every handler is either derived or listed as needing a hand-check', () => {
  // No third category. A handler that is neither would be a shape a reader trusts by default
  // and nobody verified.
  const m = doc.match(/_(\d+) handlers, (\d+) literal responses derived\._/);
  assert.ok(m, 'the summary footer is missing — the generator changed shape');
  const handlers = Number(m[1]);
  const handCheck = Number((doc.match(/^(\d+) of (\d+) handlers have at least one/m) || [])[1] || 0);
  assert.ok(handlers > 40, `only ${handlers} handlers found; the route regex has drifted`);
  assert.ok(handCheck > 0, 'zero hand-checks reported — implausible, and it would mean the flagging broke');
  assert.ok(handCheck <= handlers, 'more hand-checks than handlers');
});
