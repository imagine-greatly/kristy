/* Mount the REAL CartMoment against a fixture cart. See cart.html for why.
 *
 * The fixture is the 12-item list from the Phase 2 approval, in the exact shape the server
 * returns it — `cardSlug` and `cardSection` are what attachCards() stamps, not values
 * invented here. Seven match a card across four sections; five do not.
 */

import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import CartMoment from '../src/components/CartMoment.jsx';
import { cartProgress } from '../src/lib/cart.js';
import '../src/index.css';

const ITEMS = [
  ['Blueberries', 'berries_picking', 'produce', true],
  ['Bananas', null, null, false],
  ['Pineapple', 'produce_ripeness_by_item', 'produce', false],
  ['Strawberries', 'berries_picking', 'produce', true],
  ['Ground beef', 'ground_beef_lean_ratio', 'meat', false],
  ['Eggs', 'egg_labels', 'eggs_dairy', true],
  ['Whole milk', 'whole_vs_reduced_fat_milk', 'eggs_dairy', false],
  ['Olive oil', 'olive_oil_grades', 'bulk_pantry', false],
  ['Sourdough', null, null, false],
  ['Tortillas', null, null, false],
  ['Coffee', null, null, false],
  ['Paper towels', null, null, false],
].map(([name, cardSlug, cardSection, checked], i) => ({
  id: `i${i}`,
  name,
  category: name === 'Sourdough' ? 'Bakery' : 'Added',
  checked,
  source: 'user',
  carded: true,
  ...(cardSlug ? { cardSlug, cardSection } : {}),
}));

function Harness() {
  const [list, setList] = useState({ goal: null, intro: '', items: ITEMS });
  const mutate = (fn) => setList((cur) => fn(cur));

  const cart = {
    list,
    premium: true, // suppress the membership nudge; it is not what is being measured
    loading: false,
    busy: '',
    note: '',
    hasCart: true,
    progress: cartProgress(list),
    setNote: () => {},
    setGated: () => {},
    toggle: (id) =>
      mutate((c) => ({ ...c, items: c.items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)) })),
    remove: (id) => mutate((c) => ({ ...c, items: c.items.filter((i) => i.id !== id) })),
    add: (name) =>
      mutate((c) => ({
        ...c,
        items: [...c.items, { id: `n${c.items.length}`, name, category: 'Added', checked: false, source: 'user' }],
      })),
    refine: () => {},
    keepItem: () => {},
    takeOffer: () => {},
    addScan: () => {},
    addSwaps: () => {},
    applyList: () => {},
    compose: async () => ({ ok: false }),
    rebuild: () => {},
    startNewTrip: () => mutate(() => ({ goal: null, intro: '', items: [] })),
  };

  return <CartMoment cart={cart} goals={['eating_cleaner']} goal="eating cleaner" />;
}

createRoot(document.getElementById('root')).render(<Harness />);
