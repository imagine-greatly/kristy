/* THE REAL GuestApp, WITH NOTHING SUPPLIED TO IT BUT WHAT App SUPPLIES.
 *
 * This is the whole point of the file and the reason it is not another `?view=` on
 * dashHarness. That harness CONSTRUCTS Dashboard's props — including the hero handlers —
 * so it is structurally incapable of noticing a call site that forgets them. It measured a
 * wiring production never runs, and "Start shopping" was dead on kristyapproved.com for
 * every real visitor the entire time that suite was green.
 *
 * So this mounts GuestApp itself and passes only the two props App passes it. Every hero
 * handler under test is wired by GuestApp's own source or not at all. If someone deletes
 * `onStartShopping` from that call site again, the button here goes inert exactly as it did
 * in production, and heroAction.mjs fails on a real pointer click.
 *
 * GUEST, not the account path, because that IS production: phone sign-in is blocked on
 * 10DLC, so `session` is null for everyone and App returns GuestApp long before its own
 * dashboard branch. The correctly-wired call site in App.jsx is unreachable today.
 *
 * The cart is seeded through the SHIPPING storage key rather than injected as a prop —
 * useGuestCart reads `guestList()` in a useState initialiser, so the component builds its
 * own state from it the way it does for a returning stranger.
 */

import { createRoot } from 'react-dom/client';
import GuestApp from '../src/components/GuestApp.jsx';
import FIXTURE from './tripFixture.json';
import '../src/index.css';

const view = new URLSearchParams(location.search).get('view') || 'ready';

/* The two states whose hero enters shop mode. `ready` is nothing checked; `midtrip` is the
   fixture as authored, which carries 4 of 15 already ticked. `finished` is here to prove the
   OTHER half of the fix — a guest has no account, so that hero must render with no button
   rather than a completion door that cannot file anything. */
const STATES = {
  ready: (items) => items.map((i) => ({ ...i, checked: false })),
  midtrip: (items) => items,
  finished: (items) => items.map((i) => ({ ...i, checked: true })),
};

localStorage.setItem(
  'kristy:guest',
  JSON.stringify({
    scans: [],
    goal: null,
    onboarded: true,
    prefs: { coach_goals: [], non_negotiables: [], focuses: [], constraints: [] },
    list: { goal: null, intro: '', items: (STATES[view] || STATES.ready)(FIXTURE.items) },
  })
);

createRoot(document.getElementById('root')).render(
  <GuestApp onOpenIngredient={() => {}} onEditPrefs={() => {}} />
);
