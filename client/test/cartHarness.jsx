/* Mount the REAL CartMoment against a REAL composed cart. See cart.html for why.
 *
 * THE FIXTURE IS BUILT, NOT WRITTEN. It used to be twelve bare nouns — "Blueberries",
 * "Eggs", "Olive oil" — with no `why` on any row, transcribed from the Phase 2 mock, which
 * was hand-authored HTML rather than a render of this component. The product never emits
 * that shape: all 51 shipping PICKS carry a `why` and 22 carry an authored `perimeterId`.
 * A row rendering both a `why` and a card's do line was therefore invisible to this test,
 * to the mock it came from, and to the probe the mock came from.
 *
 * `cart.mjs` now regenerates `cartFixture.json` from the shipping PICKS through the
 * shipping `attachCards` before every run, so what is measured here is what a shopper gets.
 */

import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import CartMoment from '../src/components/CartMoment.jsx';
import { cartProgress } from '../src/lib/cart.js';
import FIXTURE from './cartFixture.json';
import '../src/index.css';

function Harness() {
  const [list, setList] = useState({ goal: null, intro: '', items: FIXTURE });
  const mutate = (fn) => setList((cur) => fn(cur));

  const cart = {
    list,
    hasCart: true,
    loading: false,
    progress: cartProgress(list),
    toggle: (id) =>
      mutate((c) => ({ ...c, items: c.items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)) })),
    remove: (id) => mutate((c) => ({ ...c, items: c.items.filter((i) => i.id !== id) })),
    add: (name) =>
      mutate((c) => ({
        ...c,
        items: [...c.items, { id: `n${c.items.length}`, name, category: 'Added', checked: false, source: 'user' }],
      })),
    keep: () => {},
    takeOffer: () => {},
    compose: async () => {},
    startNewTrip: () => mutate(() => ({ goal: null, intro: '', items: [] })),
  };

  return <CartMoment cart={cart} goals={[]} goal={null} />;
}

createRoot(document.getElementById('root')).render(<Harness />);
