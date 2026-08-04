/* SHOP MODE, mounted against a real composed trip.
 *
 * `?state=` picks the row state; `?wake=` selects a wake-lock platform to run against.
 * shop.mjs drives one page load per case.
 *
 * THE WAKE LOCK PLATFORM IS SELECTABLE BECAUSE HEADLESS CHROMIUM CANNOT GRANT ONE. The real
 * `navigator.wakeLock` exists in headless and rejects every request with `NotAllowedError:
 * Wake Lock permission request denied` — there is no screen to keep awake. That makes the
 * REAL API perfect for testing the degrade path and useless for testing re-acquisition, so:
 *
 *   ?wake=real     — leave navigator.wakeLock alone. A real rejection, so "a denied lock is
 *                    silent and shop mode still works" is verified against the real platform.
 *   ?wake=none     — delete navigator.wakeLock. The unsupported browser / pre-16.4 iOS case.
 *   ?wake=spec     — a sentinel that implements the SPEC's observable behaviour: a request
 *                    while hidden rejects NotAllowedError, and an outstanding lock is
 *                    RELEASED BY THE PLATFORM when the document hides. Every acquisition is
 *                    recorded on window.__wake so the sequence can be asserted.
 *
 * `spec` models the platform, never the component: the hook, its visibilitychange handler,
 * the event, and `document.visibilityState` are all real. The thing being modelled is the
 * one thing headless cannot provide, and it is modelled to the behaviour that causes the
 * bug — the automatic release. A test that stubs away the release would pass on exactly the
 * acquire-once code this is meant to catch.
 */

import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import ShopMode from '../src/components/ShopMode.jsx';
import ScanSheet from '../src/components/ScanSheet.jsx';
import { matchRow } from '../src/lib/rowMatch.js';
import { cartProgress } from '../src/lib/cart.js';
import FIXTURE from './tripFixture.json';
import '../src/index.css';

const params = new URLSearchParams(location.search);
const state = params.get('state') || 'midtrip';
const wake = params.get('wake') || 'spec';

/* ── The wake-lock platform, installed BEFORE React mounts ── */
window.__wake = { acquired: 0, released: 0, live: () => window.__wake.acquired - window.__wake.released };

if (wake === 'none') {
  // `wakeLock` is an accessor on Navigator.prototype, not an own property of `navigator`, so
  // `delete navigator.wakeLock` is a silent no-op and `'wakeLock' in navigator` stays true.
  // Deleting it from the prototype is what actually models a browser that never had it.
  delete Navigator.prototype.wakeLock;
} else if (wake === 'spec') {
  let outstanding = null;
  Object.defineProperty(navigator, 'wakeLock', {
    configurable: true,
    value: {
      async request(type) {
        // Per spec: only a visible document may acquire one.
        if (document.visibilityState !== 'visible') {
          const err = new Error('Wake Lock permission request denied');
          err.name = 'NotAllowedError';
          throw err;
        }
        const listeners = [];
        const sentinel = {
          type,
          released: false,
          addEventListener: (_e, fn) => listeners.push(fn),
          async release() {
            if (sentinel.released) return;
            sentinel.released = true;
            window.__wake.released += 1;
            listeners.forEach((fn) => fn());
          },
        };
        outstanding = sentinel;
        window.__wake.acquired += 1;
        return sentinel;
      },
    },
  });

  // THE PLATFORM'S OWN RELEASE-ON-HIDE. This is the behaviour that breaks acquire-once code
  // in the real world and the reason the re-acquire exists. Registered in CAPTURE so it runs
  // before the hook's own listener, exactly as the browser's internal release precedes the
  // event reaching page script.
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.visibilityState === 'hidden' && outstanding && !outstanding.released) {
        outstanding.release();
      }
    },
    true
  );
}

const STATES = {
  fresh: (items) => items.map((i) => ({ ...i, checked: false })),
  midtrip: (items) => items,
  // Produce fully checked and nothing else — the collapsed-section case.
  produceDone: (items) =>
    items.map((i) => ({ ...i, checked: i.cardSection === 'produce' || /^(Baby spinach|Sweet potatoes|Bananas and apples)$/.test(i.name) })),
  allDone: (items) => items.map((i) => ({ ...i, checked: true })),
};

/* THE SCAN THAT LANDS. `?scan=` picks which product the fake scan resolves to:
     match   — a product that IS a row already on the list ("Check off …")
     nomatch — one that is not ("Add to <section>")
   The SCAN PIPELINE is App's and is not reimplemented here; what is faked is the network
   result, in the exact shape runProductScan returns. Everything downstream of it — the real
   ScanSheet, the real matchRow, the real cart mutation — is shipping code. */
const SCANS = {
  match: {
    mode: 'barcode',
    found: true,
    product: { name: 'Blueberries or strawberries', brand: 'Driscoll', barcode: '0000000000001' },
    verdict: { tier: 'approved', headline: 'Clean.', note: '', signals: {} },
  },
  nomatch: {
    mode: 'barcode',
    found: true,
    product: { name: 'Dark chocolate almonds', brand: '', barcode: '0000000000002' },
    verdict: { tier: 'approved_with_note', headline: 'Fine, with a note.', note: '', signals: {} },
  },
};

function Harness() {
  const [list, setList] = useState({ goal: null, intro: '', items: (STATES[state] || STATES.midtrip)(FIXTURE.items) });
  const [scan, setScan] = useState(null);
  const [section, setSection] = useState(null);
  const mutate = (fn) => setList((c) => fn(c));

  const cart = {
    list,
    hasCart: true,
    premium: true,
    loading: false,
    progress: cartProgress(list),
    toggle: (id) => mutate((c) => ({ ...c, items: c.items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)) })),
    add: (name) => mutate((c) => ({ ...c, items: [...c.items, { id: `n${c.items.length}`, name, category: 'Added', checked: false, source: 'user' }] })),
  };

  // The scan sheet is composed the way App composes it — including `shop`, computed with the
  // shipping matchRow — so what is under test is the real contextual action, not a mock of it.
  const shopCtx = scan
    ? {
        row: matchRow(scan.product?.name, list.items, section?.id),
        sectionTitle: section?.title || 'the cart',
        onCheckOff: (id) => { cart.toggle(id); setScan(null); },
        onAddToSection: () => { cart.add(scan.product?.name); setScan(null); },
      }
    : undefined;

  return (
    <>
      <ShopMode
        cart={cart}
        cards={FIXTURE.cards}
        onExit={() => { window.__exited = true; }}
        onScan={() => setScan(SCANS[params.get('scan') || 'match'])}
        onSection={setSection}
        onComplete={() => { window.__completed = true; }}
      />
      {scan && (
        <ScanSheet
          scan={scan}
          onClose={() => setScan(null)}
          shop={shopCtx}
          /* onAsk is deliberately ABSENT, exactly as App withholds it in shop mode: it routes
             to the chat thread, which unmounts shop mode and loses the position. */
        />
      )}
    </>
  );
}

createRoot(document.getElementById('root')).render(<Harness />);
