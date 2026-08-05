// THE IMPORT ROUTE HAD NO TEST, AND A ONE-WORD TYPO MADE IT 503 FOR EVERY CALLER.
//
// `routes/list.js` read `const userId = req.userId`. `requireAuth` sets `req.user` and nothing
// else; NO middleware in this server has ever assigned `req.userId`. So on every request:
// `getShoppingList(undefined)` failed and was swallowed to null — dropping the cart the shopper
// was already building, defeating the route's own "APPENDED, never a replacement" guarantee —
// and then `saveShoppingList(undefined, …)` upserted a row with no user_id, threw, and the catch
// returned 503. After the vision call had already been paid for.
//
// It survived because nothing could see it. `listImport.test.js` covers the lib functions and
// never the route. The only caller is `ImportList`, imported only by `App.jsx`, whose surface
// stack has never rendered for a real visitor. So: green suite, correct-looking file, broken
// endpoint, no artifact anywhere except a shopper watching a spinner fail.
//
// This tests the ROUTE FILE'S CONTRACT statically rather than over HTTP, because standing up
// express + a Supabase double here would test the double. What it pins is the thing that was
// actually wrong: which request property the handler reads, and that the handler's guarantees
// are still expressed in its code.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { nonEmpty } from './testGuards.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROUTES = join(__dirname, '..', 'routes');
const listSrc = readFileSync(join(ROUTES, 'list.js'), 'utf8');
const guestSrc = readFileSync(join(ROUTES, 'guest.js'), 'utf8');
const authSrc = readFileSync(join(__dirname, 'supabase.js'), 'utf8');

/* CODE ONLY. These assertions are about what the handler READS, and the handler now carries a
   comment explaining the `req.userId` bug in detail — which the first draft of this test matched,
   so it failed on the very fix it was written to verify. A check that cannot tell code from prose
   about code is the same family as every other member here: it could not see its own subject.
   Strings are kept; a comment is not. */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1');
}

/** The body of one route handler, from its definition to the next one. */
function handler(src, method, path) {
  const start = src.indexOf(`.${method}('${path}'`);
  if (start === -1) return null;
  const after = src.slice(start + 5);
  const next = after.search(/\n(?:router|[a-zA-Z]*Router)\.(?:get|post|put|patch|delete)\(/);
  return next === -1 ? after : after.slice(0, next);
}

const authedImport = handler(listSrc, 'post', '/list/import');
const guestImport = handler(guestSrc, 'post', '/list/import');

test('both import handlers exist — this suite is not vacuously passing', () => {
  assert.ok(authedImport, 'POST /list/import is missing from routes/list.js');
  assert.ok(guestImport, 'POST /list/import is missing from routes/guest.js');
});

/* ═══════════ THE BUG THAT SHIPPED ═══════════ */

test('requireAuth sets req.user, and nothing anywhere sets req.userId', () => {
  // The premise of the fix. If a future middleware DOES set req.userId this test should be
  // revisited deliberately rather than the assertion below quietly becoming wrong.
  assert.match(authSrc, /req\.user\s*=\s*user/, 'requireAuth no longer assigns req.user');
  const setters = stripComments([listSrc, guestSrc, authSrc].join('\n')).match(/req\.userId\s*=/g) || [];
  assert.deepEqual(setters, [], 'something now assigns req.userId — reconcile this test with it');
});

test('the authed import handler reads req.user.id, never req.userId', () => {
  const code = stripComments(authedImport);
  assert.match(code, /req\.user\.id/, 'the handler must read the property requireAuth sets');
  assert.ok(
    !/req\.userId/.test(code),
    'req.userId is undefined on every request — this is the typo that made the route 503 for ' +
      'every caller after paying for the vision call'
  );
});

test('no handler in either route file reads req.userId', () => {
  // Widened past the one site, because the defect class is "reads a property nothing sets".
  for (const [name, src] of nonEmpty(
    [['routes/list.js', listSrc], ['routes/guest.js', guestSrc]],
    'route sources',
    2
  )) {
    assert.deepEqual(stripComments(src).match(/req\.userId\b/g) || [], [], `${name} still reads req.userId`);
  }
});

/* ═══════════ THE GUARANTEES THE HANDLERS CARRY ═══════════ */

test('an import APPENDS to the current cart and never replaces it', () => {
  // A photographed list must not wipe a cart in progress. Both doors spread the current items
  // before the imported ones.
  for (const [name, body] of nonEmpty(
    [['authed', authedImport], ['guest', guestImport]],
    'import handlers',
    2
  )) {
    assert.match(body, /\.\.\.current\.items/, `${name} import no longer appends to the existing cart`);
  }
});

test('the guest door exists, is unauthenticated, and stores nothing', () => {
  // Reading a label with vision is free for everyone including guests; reading a shopping LIST
  // is the same act. And every real visitor is currently a guest, so an authed-only import is
  // an import nobody can reach.
  assert.ok(!/\/list\/import',\s*requireAuth/.test(guestSrc), 'the guest import must not require auth');
  assert.ok(
    !/saveShoppingList|insertTrip|saveTripItems/.test(guestImport),
    'the guest import must persist nothing — the cart rides back in the response'
  );
  assert.match(guestImport, /rateLimited/, 'it makes a vision call, so it draws on the guest IP budget');
});

test('both doors run the shopper text through the same deterministic specification', () => {
  // One pipeline, so a photographed list and a pasted one produce the same quality of cart.
  for (const [name, body] of nonEmpty(
    [['authed', authedImport], ['guest', guestImport]],
    'import handlers',
    2
  )) {
    assert.match(body, /specifyImportedItems/, `${name} import bypasses the shared specification`);
    assert.match(body, /importSummary/, `${name} import does not build the shared summary`);
  }
});

test('an unreadable row survives to the client as needsFix, and the client renders it', () => {
  // The server has written `needsFix` + "tap to fix it" since imports shipped and NOTHING
  // rendered it, so a confident misread ("tp" transcribed as "butter") landed as an ordinary
  // row and shopped like a real one. Measured after the vision prompt was tightened: a misread
  // still recurred 1 in 9 runs, so the editable path is the fix, not the prompt.
  const listImport = readFileSync(join(__dirname, 'listImport.js'), 'utf8');
  assert.match(listImport, /needsFix:\s*true/, 'the server no longer flags an unreadable row');

  const cartMoment = readFileSync(
    join(__dirname, '..', '..', 'client', 'src', 'components', 'CartMoment.jsx'),
    'utf8'
  );
  assert.match(cartMoment, /item\.needsFix/, 'the client must render the unreadable flag');
  assert.match(cartMoment, /data-needs-fix/, 'and expose it to the browser suites');
  assert.match(cartMoment, /onFix/, 'and offer a way to correct it');

  // `sanitizeList` has to preserve both or the flag dies on the round trip.
  const cartEdit = readFileSync(join(__dirname, 'cartEdit.js'), 'utf8');
  assert.match(cartEdit, /needsFix/, 'sanitizeList must preserve needsFix');
  assert.match(cartEdit, /it\.note/, 'sanitizeList must preserve the note');
});

/* ═══════════ THE VISION PROMPT'S TWO MEASURED RULES ═══════════ */

test('the vision prompt forbids reinstating a crossed-out item, in the strongest terms', () => {
  const vision = readFileSync(join(__dirname, 'listVision.js'), 'utf8');
  // Measured 2026-08-05: the struck row came back on 2 of 3 input shapes, 3/3 runs each —
  // including the clean line-through of a Notes screenshot, so it was never a legibility
  // problem. After this rule it drops 9/9.
  assert.match(vision, /CROSSED-OUT ITEM IS NOT ON THE LIST/i);
  assert.match(vision, /readability is not the test/i, 'the stroke, not the legibility, is the test');
  assert.ok(
    !/crossed-out.*unreadable|unreadable.*crossed-out/i.test(vision.replace(/not even marked unreadable/i, '')),
    'a crossed-out row must be omitted entirely, not returned marked unreadable'
  );
});

test('the vision prompt biases toward "unreadable" over a confident guess', () => {
  const vision = readFileSync(join(__dirname, 'listVision.js'), 'utf8');
  assert.match(vision, /would not bet on the word/i);
  assert.match(vision, /choose "unreadable": true/i, 'the tie must break toward the flag');
});
