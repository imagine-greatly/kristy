// A HERO ACTION THAT RENDERS MUST BE ABLE TO ACT.
//
// "Start shopping" was dead on production for every real visitor and no check saw it, because
// an inert button DOES NOT FAIL — it succeeds at doing nothing. Nothing throws, so there is
// nothing in a console, nothing for the error boundary to catch, and nothing for a build to
// report. This is the same family as an assertion over an empty collection and a commit that
// omits its file: the check passed because it could not see the thing.
//
// THE MECHANISM, precisely. Dashboard's Hero gated its button on `action &&` — a string
// literal, so always true — and then bound `onClick={onAction}` to whatever it was handed.
// `GuestApp` renders Dashboard and passed no hero handlers at all, so the button painted,
// took the tap, and did nothing.
//
// WHY IT WAS PRODUCTION-ONLY, and why local testing could never have found it. Phone sign-in
// is blocked on 10DLC, so `session` is null for everyone; App returns GuestApp long before
// its own dashboard branch. The correctly-wired call site at App.jsx was unreachable in
// production the entire time it was being read and reviewed.
//
// WHY THE BROWSER SUITE MISSED IT. dash.mjs mounts Dashboard through dashHarness.jsx, which
// CONSTRUCTS the props itself. A harness that supplies handlers is structurally incapable of
// noticing a call site that forgets them — it measures a wiring production never runs. That
// is not a gap in the harness's coverage, it is a gap the harness's shape creates, which is
// why the fix is a test over the REAL call sites rather than another view in that harness.
//
// Two rules below, and they are different claims. The first is that the guard exists at all;
// the second is that the two states with no alternative door are wired everywhere Dashboard
// is rendered. heroAction.mjs proves the behaviour with a real pointer click on the real
// GuestApp; this proves it without a browser, on every commit.

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

// Bound at the COLLECTION, not at the loop: a module-level nonEmpty throws at import, so
// every test in this file is honest by construction rather than by discipline. An empty
// sweep here would report "no unwired call sites" for the same reason the bug shipped.
const FILES = nonEmpty(walk(CLIENT_SRC), 'client source files', 20);

/** Every `<Dashboard … />` element in the tree, with the prop text of each.
 *
 *  Scans forward from the tag tracking brace depth, because the props contain JSX
 *  expressions (`prefs={{ … }}`) whose braces would otherwise end the match early. */
function dashboardCallSites() {
  const sites = [];
  for (const file of FILES) {
    const src = readFileSync(file, 'utf8');
    let i = src.indexOf('<Dashboard');
    while (i !== -1) {
      // Guard against matching a longer identifier, e.g. `<DashboardThing`.
      const after = src[i + '<Dashboard'.length];
      if (!/[A-Za-z0-9_]/.test(after)) {
        let depth = 0;
        let j = i;
        for (; j < src.length; j++) {
          const c = src[j];
          if (c === '{') depth++;
          else if (c === '}') depth--;
          else if (c === '>' && depth === 0 && src[j - 1] === '/') break;
        }
        sites.push({ file: file.slice(CLIENT_SRC.length + 1), props: src.slice(i, j + 1) });
      }
      i = src.indexOf('<Dashboard', i + 1);
    }
  }
  return sites;
}

const SITES = nonEmpty(dashboardCallSites(), '<Dashboard> call sites', 2);

/* THE TWO STATES WITH NO OTHER DOOR.
 *
 *   ready   → "Start shopping"  → onStartShopping
 *   midtrip → "Resume shopping" → onResume
 *
 * Both enter shop mode, and shop mode has NO other entry point anywhere in the product —
 * it is a mode, not a tab, entered from this hero and nowhere else. An unwired hero here
 * does not degrade the surface, it removes the walking half of the app entirely.
 *
 * `onComplete` is deliberately NOT on this list. Completing writes a `trips` row keyed to
 * an account and a guest has none, so GuestApp omits it on purpose and the hero renders
 * that state doorless rather than offering a button that cannot do what it says. Requiring
 * it here would fail the correct code and teach the next reader to pass a handler that
 * lies. The Hero guard below is what makes that omission safe. */
const REQUIRED = ['onStartShopping', 'onResume'];

test('every <Dashboard> call site wires the hero actions that enter shop mode', () => {
  for (const site of SITES) {
    for (const prop of REQUIRED) {
      assert.ok(
        new RegExp(`\\b${prop}\\s*=`).test(site.props),
        `${site.file} renders <Dashboard> without ${prop}. The hero button for that state ` +
          `will paint, accept the tap and do nothing — silently, with no console error. ` +
          `Shop mode has no other entry point.`
      );
    }
  }
});

test('every <Dashboard> call site passes real handlers, not literal undefined', () => {
  // Passing `onStartShopping={undefined}` would satisfy the presence check above while
  // reproducing the exact defect. Cheap to write by accident when threading props through.
  for (const site of SITES) {
    for (const prop of REQUIRED) {
      assert.ok(
        !new RegExp(`\\b${prop}\\s*=\\s*\\{\\s*undefined\\s*\\}`).test(site.props),
        `${site.file} passes ${prop}={undefined}, which is an inert button with extra steps.`
      );
    }
  }
});

test('Hero renders its action only when it has BOTH a label and a handler', () => {
  // THE STRUCTURAL HALF. Wiring every current call site fixes today; this is what stops the
  // class. With the conjunction in place an unwired action VANISHES rather than going inert,
  // and a missing button is loud — dash.mjs counts exactly one bone-filled action per state,
  // so the defect converts from invisible into a failure of a test that already exists.
  const dashboard = readFileSync(join(CLIENT_SRC, 'components', 'Dashboard.jsx'), 'utf8');
  assert.ok(
    /\{\s*action\s*&&\s*onAction\s*&&/.test(dashboard),
    'Dashboard.jsx Hero must gate its button on `action && onAction &&`. Gating on `action` ' +
      'alone renders a button whose onClick is undefined — it paints, it takes the tap, and ' +
      'it does nothing. That is how "Start shopping" was dead on production.'
  );
});

test('GuestApp mounts ShopMode, or its hero actions lead nowhere', () => {
  // The handler existing is not the feature. GuestApp had no 'shop' moment and never
  // imported ShopMode, so even a wired setMoment('shop') would have unmounted the dashboard
  // and rendered an empty surface — a different silent failure with the same symptom.
  const guest = readFileSync(join(CLIENT_SRC, 'components', 'GuestApp.jsx'), 'utf8');
  assert.match(guest, /import ShopMode from/, 'GuestApp must import ShopMode.');
  assert.match(
    guest,
    /moment\s*===\s*'shop'\s*&&/,
    "GuestApp must render ShopMode on the 'shop' moment. Without it the hero sets a state " +
      'nothing renders, and the shopper gets a blank screen instead of a dead button.'
  );
});

test('no surface sets a moment nothing renders', () => {
  /* THE SAME DEFECT ONE STEP LATER, found while diagnosing the hero: App.jsx carried
     `setMoment("list")` and there is no 'list' moment — the union is
     scan|home|aisle|haul|chat|shop — so importing a list navigated to a surface with no
     branch and painted nothing. A dead state name is an inert button that has already been
     pressed. Both call sites are checked because both maintain their own moment union. */
  const SURFACES = {
    'App.jsx': ['scan', 'home', 'aisle', 'haul', 'chat', 'shop'],
    'components/GuestApp.jsx': ['scan', 'home', 'aisle', 'haul', 'chat', 'shop'],
  };
  for (const [rel, known] of Object.entries(SURFACES)) {
    const src = readFileSync(join(CLIENT_SRC, rel), 'utf8');
    const set = nonEmpty(
      [...src.matchAll(/setMoment\(\s*['"]([a-z]+)['"]\s*\)/g)].map((m) => m[1]),
      `setMoment literals in ${rel}`,
      3
    );
    for (const m of set) {
      assert.ok(
        known.includes(m),
        `${rel} calls setMoment('${m}') and nothing renders that moment. ` +
          `Known moments: ${known.join('|')}.`
      );
    }
  }
});
