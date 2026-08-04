/* THE DASHBOARD, IN THE REAL APP FRAME.
 *
 * `?view=` selects one of the five states; dash.mjs drives one page load per view.
 *
 * IT MOUNTS THE REAL TopBar ABOVE IT, and that is the whole reason this harness is not just
 * the Dashboard on its own. The hero rule is "the answer to what-next is the largest and
 * highest thing on screen", and the proto render measured it with nothing above — which made
 * `hero top = 0px` a fact about the harness rather than about the app. TopBar is what
 * actually sits there, it carries a goal chip and a premium mark, and whether either
 * competes with the hero at 390px cannot be answered by a component rendered alone.
 *
 * The cart object is the shape useCart returns, so the real CartMoment beneath the hero
 * behaves exactly as it does in the app.
 */

import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import Dashboard from '../src/components/Dashboard.jsx';
import TopBar from '../src/components/TopBar.jsx';
import { cartProgress } from '../src/lib/cart.js';
import FIXTURE from './tripFixture.json';
import '../src/index.css';

const view = new URLSearchParams(location.search).get('view') || 'ready';

const STATES = {
  empty: () => [],
  completed: () => [],
  ready: (items) => items.map((i) => ({ ...i, checked: false })),
  midtrip: (items) => items,
  finished: (items) => items.map((i) => ({ ...i, checked: true })),
};

// A REALISTIC GOAL CHIP, not a short one. The chip truncates, so a two-word label would
// under-report how much horizontal weight it can take beside the hero.
const GOAL_LABEL = 'Eating cleaner';

function Harness() {
  const initial = (STATES[view] || STATES.ready)(FIXTURE.items);
  const [list, setList] = useState({ goal: null, intro: '', items: initial });
  const seedable = view === 'completed' ? { seedable: true, items: 15 } : { seedable: false, items: 0 };
  const mutate = (fn) => setList((c) => fn(c));

  const cart = {
    list,
    hasCart: initial.length > 0,
    premium: false, // the tier that used to raise a banner — proves it no longer does
    loading: false,
    busy: '',
    // Her one line back, on the state where a shopper has just typed something.
    note: view === 'empty' ? '' : '',
    seedable,
    progress: cartProgress(list),
    toggle: (id) => mutate((c) => ({ ...c, items: c.items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)) })),
    remove: (id) => mutate((c) => ({ ...c, items: c.items.filter((i) => i.id !== id) })),
    add: (name) => mutate((c) => ({ ...c, items: [...c.items, { id: `n${c.items.length}`, name, category: 'Added', checked: false, source: 'user' }] })),
    keepItem: () => {},
    takeOffer: () => {},
    compose: async () => ({ ok: true }),
    rebuild: () => {},
    seedFromLast: async () => ({ ok: true }),
    startNewTrip: () => mutate(() => ({ goal: null, intro: '', items: [] })),
    completeTrip: async () => ({ ok: true }),
  };

  return (
    <div className="app">
      <TopBar
        onMenu={() => {}}
        goalLabel={GOAL_LABEL}
        onGoalClick={() => {}}
        showPremium
        onPremium={() => {}}
        onAsk={() => {}}
      />
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Dashboard
          cart={cart}
          goals={['eating_cleaner']}
          goal="eating cleaner"
          onSetGoal={() => {}}
          onUpgrade={() => {}}
          onScan={() => {}}
          onAskAisle={() => {}}
          onImport={() => {}}
          onHaul={() => {}}
          onStartShopping={() => {}}
          onResume={() => {}}
          onComplete={() => {}}
        />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<Harness />);
