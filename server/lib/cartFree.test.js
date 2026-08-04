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

/* ═══════════════ THE ASK APPEARS AT ONE MOMENT, AND THIS IS THE THIRD REMOVAL ═══════════

   The list-save control went, the guest "Keep it" banner went, and the premium Nudge on the
   cart went with this test. All three broke the same rule and none of the existing checks
   saw the third: it carried no `[data-save-list]`, said nothing about saving or keeping, and
   was not in GuestApp — it just rendered "Basic cart. Membership shapes it…" plus "Unlock
   the full cart" whenever `premium === false` and the cart had rows. On open. As a banner.
   Above the shopper's own list. Every single load.

   THE SHAPE, NAMED: an upgrade affordance whose render condition contains NO ACTION. Tier
   alone is not a moment — every non-member satisfies it on every render, which is what makes
   it a banner rather than an ask. That is the checkable thing, and it is what these pin.

   CHROME IS NOT A BANNER, and the distinction is deliberate rather than a loophole. The
   sidebar entry, the settings row and the header's premium mark are DESTINATIONS a shopper
   navigated to or a persistent affordance in the app frame — none of them interrupts a
   surface with a pitch about the content on it. The rule is about CONTENT surfaces, so the
   list below is content surfaces, by name. */

const CONTENT_SURFACES = [
  'Dashboard.jsx', 'CartMoment.jsx', 'TripQuestion.jsx', 'FillRow.jsx',
  'AisleMoment.jsx', 'ScanHome.jsx', 'HaulMoment.jsx', 'GuestApp.jsx', 'ScanSheet.jsx',
];

// Tier alone, with no action beside it.
const TIER_ONLY = /(premium\s*===\s*false|!\s*premium\s*&&|\{\s*premium\s*\?)/;
// Something that opens the paywall.
const UPGRADE_CTA = /(onUpgrade\s*\(|onUpgradeSheet\s*\(|askToUpgrade\s*\(|<\s*Nudge\b|<\s*Upgrade\b)/;

test('no content surface renders an upgrade ask under a tier-only condition', () => {
  // Bound at the collection. A renamed component would otherwise empty this list and the
  // loop below would report success over nothing — the exact failure `nonEmpty` exists for.
  const files = nonEmpty(
    CONTENT_SURFACES.map((n) => join(CLIENT_SRC, 'components', n)).filter((p) => {
      try { statSync(p); return true; } catch { return false; }
    }),
    'content surfaces',
    CONTENT_SURFACES.length
  );

  const offenders = [];
  for (const f of files) {
    const lines = stripComments(readFileSync(f, 'utf8')).split('\n');
    lines.forEach((code, i) => {
      if (!TIER_ONLY.test(code)) return;
      // The block the condition opens. A window rather than a parser: the defect is a JSX
      // branch a few lines long, and a window that reaches too far reports a neighbour,
      // which is a cheap and visible failure rather than a silent miss.
      const block = lines.slice(i, i + 15).join('\n');
      if (UPGRADE_CTA.test(block)) {
        offenders.push(`${f.replace(CLIENT_SRC, 'client/src')}:${i + 1}  ${code.trim()}`);
      }
    });
  }
  assert.deepEqual(
    offenders,
    [],
    'an upgrade ask renders on tier alone — every non-member sees it on every load, which is '
      + `a banner, not a moment:\n${offenders.join('\n')}`
  );
});

test('the ask has exactly one reason, and it is the full read', () => {
  // THE ONE MOMENT: the fourth full-read tap. A second key here is a second moment, which is
  // how the list-save ask existed at all — it had its own `UPGRADE_COPY.list` entry.
  const pricing = readFileSync(join(CLIENT_SRC, 'lib', 'pricing.js'), 'utf8');
  const copy = stripComments(pricing);
  const block = copy.slice(copy.indexOf('export const UPGRADE_COPY'));
  const keys = [...block.slice(0, block.indexOf('\n};')).matchAll(/^  ([a-z_]+):/gm)].map((m) => m[1]);
  assert.deepEqual(keys, ['read'], `UPGRADE_COPY must carry exactly one reason, got: ${keys.join(', ')}`);

  // And every call site must ask for that one. `askToUpgrade('save')` would sail past the
  // check above — its condition would be an action — and still be a second moment.
  const app = stripComments(readFileSync(join(CLIENT_SRC, 'App.jsx'), 'utf8'));
  const reasons = [...app.matchAll(/askToUpgrade\(\s*'([^']+)'/g)].map((m) => m[1]);
  assert.ok(reasons.length > 0, 'no askToUpgrade call site found — this test would pass vacuously');
  assert.deepEqual(
    [...new Set(reasons)],
    ['read'],
    `the ask fires for a reason other than the full read: ${reasons.join(', ')}`
  );
});

test('the removed nudge copy stays removed', () => {
  // The copy is the promise. "Basic cart" is a judgement on something the shopper built,
  // printed above their own rows; it is the specific sentence, so it is the specific check.
  const offenders = [];
  for (const f of FILES) {
    stripComments(readFileSync(f, 'utf8')).split('\n').forEach((code, i) => {
      if (/Basic cart|Unlock the full cart/i.test(code)) {
        offenders.push(`${f.replace(CLIENT_SRC, 'client/src')}:${i + 1}  ${code.trim()}`);
      }
    });
  }
  assert.deepEqual(offenders, [], `the cart nudge is back:\n${offenders.join('\n')}`);
});

/* ═══════════════ ONE ASK, ONE METER — enforced, not remembered ═══════════════

   Every full read costs a shopper one of three. A card opened standing in an aisle must cost
   exactly what the same card costs from the couch, or the gate copy is false on one surface
   and nobody finds out, because the surface that drifted still looks right.

   IT HAD ALREADY DRIFTED INTO TWO. `AisleMoment` and `CartMoment` each carried their own
   `unlocked` map and their own `requestFull` — same call, same counter, same words, written
   out twice. CartMoment's own comment warned about exactly that risk, about itself, and the
   two agreed only because somebody kept them agreeing. Shop mode's ask overlay would have
   been the third.

   So there is one ask component and one meter, and these fail if a fourth surface starts its
   own. A grep is the right instrument: the failure mode is a COPY, and a copy is precisely
   what a second call site looks like. */

test('only CounterAsk asks the counter', () => {
  const offenders = [];
  for (const f of FILES) {
    // Paths are normalised to forward slashes once: a separator class in a regex is the
    // kind of detail that silently stops matching on one platform and takes the whole
    // check with it.
    const rel = f.replace(CLIENT_SRC, '').replace(/\\/g, '/');
    if (rel.endsWith('/components/CounterAsk.jsx')) continue;
    if (rel.endsWith('/lib/perimeter.js')) continue; // the client that defines it
    const src = stripComments(readFileSync(f, 'utf8'));
    if (/\baskCounter\s*\(/.test(src)) offenders.push(`client/src${rel}`);
  }
  assert.deepEqual(
    offenders,
    [],
    `a second ask implementation is a second read meter:\n${offenders.join('\n')}`
  );
});

test('only useCardMeter spends a read', () => {
  const offenders = [];
  for (const f of FILES) {
    const rel = f.replace(CLIENT_SRC, '').replace(/\\/g, '/');
    if (/^\/lib\/(cardMeter|readMeter|perimeter)\.js$/.test(rel)) continue;
    const src = stripComments(readFileSync(f, 'utf8'));
    for (const call of [/\bfetchCounterFull\s*\(/, /\bspendRead\s*\(/, /\breadsSpent\s*\(/]) {
      if (call.test(src)) offenders.push(`client/src${rel} calls ${call.source}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `the read meter is one mechanic — a second caller is a second meter that will drift:\n${offenders.join('\n')}`
  );
});

test('the ask renders on all three surfaces from the one component', () => {
  // Bound at the collection: a renamed surface would empty this and the loop would report
  // success over nothing.
  const surfaces = nonEmpty(
    ['AisleMoment.jsx', 'Dashboard.jsx', 'ShopMode.jsx'].map((n) => join(CLIENT_SRC, 'components', n)),
    'ask surfaces',
    3
  );
  for (const f of surfaces) {
    assert.match(
      stripComments(readFileSync(f, 'utf8')),
      /<CounterAsk\b/,
      `${f.replace(CLIENT_SRC, 'client/src')} must render the shared ask, not its own`
    );
  }
});

/* SHOP MODE MUST NOT NAVIGATE. Every branch out of it is an overlay, because the mode is
   never unmounted and that is what makes "return to the same scroll position" free rather
   than a restoration mechanism that can be wrong. A `setMoment` reachable from inside it is
   the leak: it shipped twice already — the ask branch button wired to `setMoment('aisle')`,
   and the scan sheet's chat ask, one layer down and invisible because the sheet looks the
   same on every surface. */
test('shop mode branches to overlays, never to another surface', () => {
  const src = stripComments(readFileSync(join(CLIENT_SRC, 'components', 'ShopMode.jsx'), 'utf8'));
  assert.ok(!/setMoment\s*\(/.test(src), 'ShopMode must not change the app surface — that unmounts it');
  // The one exit is a prop the caller owns, which is the deliberate way out.
  assert.match(src, /onExit/, 'ShopMode needs an explicit exit');
});
