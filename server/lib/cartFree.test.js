// THE LIST IS FREE, AND NO SURFACE MAY ASK TO SAVE IT. This is the test that makes that
// true rather than remembered.
//
// It has been removed twice. The first control was a "Save this list" button on the
// authenticated cart that opened the upgrade ask over a save `POST /api/list` had already
// performed. `gate.mjs` was written to stop it coming back and greps `[data-save-list]` on
// the cart tab — which is a selector, not a rule. Two more controls were shipped afterwards
// and it saw neither of them:
//
//   • "Save this cart" in the GUEST header — a different component, no attribute
//   • "Keep it" under "Save your cart" — a BANNER standing above the guest list whenever a
//     cart existed, which is the shape the money rule names outright: the ask appears at one
//     moment and nowhere else, "not on a save, never a banner"
//
// So this greps what a SHOPPER READS instead of what a test author remembered to tag. A
// button can drop an attribute, move component or change class and still say the same
// wrong thing to the same person; the copy is the part that cannot be renamed without
// changing what is being promised.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from './testGuards.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLIENT_SRC = join(__dirname, '..', '..', 'client', 'src');

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(jsx?|tsx?)$/.test(name)) out.push(p);
  }
  return out;
}

// Bound at the collection: an empty sweep would pass every assertion below and report a
// green tick where the coverage used to be.
const FILES = nonEmpty(walk(CLIENT_SRC), 'client source files', 20);

/* The promise, in the words it can be made in. Deliberately about SAVING/KEEPING a CART or
   LIST — not the word "save" alone, which legitimately appears on "Save image" in the
   verdict and haul share cards, and on the saveList() plumbing that performs the free
   persistence this rule exists to protect. */
const SAVE_THE_LIST = /\b(save|keep)\s+(this|your|the)\s+(cart|list)\b/i;

/* Comments blanked, LINE NUMBERS KEPT. A line that only NAMES the rule is not the rule
   being broken: the reasoning above each removal quotes the dead copy verbatim, which is
   how it stays dead, and this test caught its own explanation on the first run. Block
   comments must be stripped across lines — a JSX `{​/* … *​/}` spans several, and stripping
   only single lines leaves every continuation looking like live code. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, ' '));
}

test('no client surface offers to save or keep the cart', () => {
  const offenders = [];
  for (const f of FILES) {
    const src = readFileSync(f, 'utf8');
    stripComments(src).split('\n').forEach((code, i) => {
      if (SAVE_THE_LIST.test(code)) {
        offenders.push(`${f.replace(CLIENT_SRC, 'client/src')}:${i + 1}  ${code.trim()}`);
      }
    });
  }
  assert.deepEqual(
    offenders,
    [],
    `the list is free — persistence already happened, so asking for it is asking over a done action:\n${offenders.join('\n')}`
  );
});

test('the guest list surface carries no standing banner', () => {
  const code = stripComments(readFileSync(join(CLIENT_SRC, 'components', 'GuestApp.jsx'), 'utf8'));
  assert.ok(
    !/taste-banner/.test(code),
    'the taste banner is back above the guest cart — the ask appears at one moment and never as a banner'
  );
});

/* ═══════════════ One prose line per row ═══════════════

   THE DEFECT FOUR LAYERS OF VERIFICATION COULD NOT SEE. Every matched row rendered the
   PICK's `why` AND the matched card's do line — two prose lines where the mock had one.
   The mock could not show it (hand-authored HTML, bare nouns, no `why` anywhere), the
   probe could not show it (bare nouns it invented), the harness could not show it (copied
   from the mock), and the browser test could not show it (ran the harness).

   `cart.mjs` now asserts this on the rendered component, which is where a rendering rule
   belongs. This asserts the SOURCE can still express it — a cheap, fast tripwire that fails
   in `npm test` without a browser or a running API, so the rule cannot be quietly deleted
   between browser runs. Two checks, because the rule has two halves and dropping either
   one is a regression:

     matched   -> name, eyebrow, do line. The `why` is suppressed.
     unmatched -> name, `why`. It is the only prose that row has. */

test('a matched row suppresses its why; an unmatched row keeps it', () => {
  const src = readFileSync(join(CLIENT_SRC, 'components', 'CartMoment.jsx'), 'utf8');

  // The suppression itself. Keyed on the BLOCK's hasCard, never on item.cardSlug — the
  // attachment renders only once its summary arrives, so keying on the slug would blank
  // the prose for the length of that fetch and leave the row empty if it failed.
  assert.match(
    stripComments(src),
    /\{item\.why\s*&&\s*!hasCard\s*&&/,
    'the why must be suppressed when the block carries a card'
  );
  assert.match(
    stripComments(src),
    /hasCard=\{hasCard\}/,
    'CartBlock must pass hasCard down, or the row cannot know the do line is on screen'
  );
  // And the reason, because the next person will read a suppressed field as an oversight.
  assert.match(src, /ONE PROSE LINE PER ROW/);
});

test('the browser test actually asserts the prose rule', () => {
  // A rule enforced only in source is a rule enforced only where nobody stands. The claim
  // is about what RENDERS, so the rendered assertion has to exist too — this fails if the
  // browser check is deleted while the source check survives.
  const cart = readFileSync(join(CLIENT_SRC, '..', 'test', 'cart.mjs'), 'utf8');
  assert.match(cart, /data-why/, 'cart.mjs must inspect the rendered why');
  assert.match(cart, /no matched row renders a why beside its do line/);
});
