/* The trip loop, driven through the REAL CartMoment.
 *
 * The trips table and the lifecycle functions are SERVER code — trips.js reaches the
 * perimeter KB through node:fs, so it cannot be imported into a browser bundle. That split
 * is deliberate rather than a limitation: the lifecycle semantics (archived not erased, one
 * active per user, adoption once) are proven against the real functions in
 * server/lib/trips.test.js, and what a browser can prove is the half a node test cannot —
 * that the completion door appears and fires, and that a seeded trip RENDERS as unchecked
 * rows with their cards still attached.
 *
 * `window.__SEED` is the output of the real `buildNextTripList`, computed in node by
 * loop.mjs and injected before load. So the payload under test is genuinely produced by
 * shipping code; only the transport is faked.
 */

import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import CartMoment from '../src/components/CartMoment.jsx';
import { cartProgress } from '../src/lib/cart.js';
import '../src/index.css';

const START = window.__START;
window.__loop = { rows: [{ id: 't1', status: 'active', items: START.items }], completedCount: 0 };

function Harness() {
  const [list, setList] = useState({ goal: null, intro: '', items: START.items });
  const [seedable, setSeedable] = useState({ seedable: false, items: 0 });

  const write = (next) => {
    const active = window.__loop.rows.find((r) => r.status === 'active');
    if (active) active.items = next.items;
    setList(next);
  };

  const cart = {
    list, premium: true, loading: false, busy: '', note: '', gated: false,
    hasCart: list.items.length > 0,
    progress: cartProgress(list),
    seedable,
    setNote: () => {}, setGated: () => {},
    toggle: (id) => write({ ...list, items: list.items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)) }),
    remove: (id) => write({ ...list, items: list.items.filter((i) => i.id !== id) }),
    add: () => {}, refine: () => {}, keepItem: () => {}, takeOffer: () => {},
    addScan: () => {}, addSwaps: () => {}, applyList: () => {},
    compose: async () => ({ ok: false }), rebuild: () => {}, startNewTrip: () => {},

    // Archive, don't erase — the row stays and flips status, exactly as completeTrip does.
    async completeTrip() {
      const active = window.__loop.rows.find((r) => r.status === 'active');
      if (!active) return { ok: false };
      active.status = 'completed';
      active.completed_at = new Date().toISOString();
      window.__loop.completedCount += 1;
      setList({ goal: null, intro: '', items: [] });
      setSeedable({ seedable: true, items: active.items.filter((i) => i.source !== 'swap').length });
      return { ok: true };
    },

    // The seed the REAL buildNextTripList produced, in node, from the completed trip.
    async seedFromLast() {
      const next = window.__SEED;
      window.__loop.rows.push({ id: 't2', status: 'active', items: next.items, completed_at: null });
      setList(next);
      return { ok: true };
    },
  };

  return <CartMoment cart={cart} goals={['eating_cleaner']} goal="eating cleaner" onComplete={() => cart.completeTrip()} />;
}

createRoot(document.getElementById('root')).render(<Harness />);
