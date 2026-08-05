import { useState } from 'react';
import CartMoment from '../src/components/CartMoment.jsx';

// The row shapes listImport emits for an unreadable line: one with partial letters, one with
// nothing legible at all (it falls back to 'Unreadable item').
const SEED = {
  goal: null,
  intro: '',
  items: [
    { id: 'a', name: 'Chicken thighs', category: 'Protein', checked: false, source: 'imported' },
    { id: 'b', name: 'ch??se', category: 'Pantry', checked: false, source: 'imported', needsFix: true, note: "Couldn't read this one — tap to fix it." },
    { id: 'c', name: 'Unreadable item', category: 'Pantry', checked: false, source: 'imported', needsFix: true, note: "Couldn't read this one — tap to fix it." },
  ],
};

export default function Harness() {
  const [list, setList] = useState(SEED);
  // The shipping refine semantics, mirrored here only because the hook needs a store: name in,
  // refined stamped, needsFix and note cleared. cart.refine is what CartMoment actually calls.
  const refine = (id, newName) =>
    setList((cur) => ({
      ...cur,
      items: cur.items.map((i) =>
        i.id === id ? { ...i, name: newName, refined: true, needsFix: false, note: '' } : i
      ),
    }));
  const cart = {
    list, loading: false, busy: '', note: '', premium: true, gated: false,
    progress: { total: list.items.length, checked: 0, remaining: list.items.length, complete: false },
    seedable: { seedable: false, items: 0 },
    toggle: () => {}, remove: (id) => setList((c) => ({ ...c, items: c.items.filter((i) => i.id !== id) })),
    add: () => {}, refine, keepItem: () => {}, takeOffer: () => {}, setNote: () => {}, setGated: () => {},
    rebuild: () => {}, compose: async () => ({ ok: true }), seedFromLast: async () => ({ ok: false }),
  };
  return (
    <div style={{ width: 390 }}>
      <CartMoment cart={cart} goals={[]} premium />
    </div>
  );
}
