/* ═══════════════════════ THE READ METER — ONE MECHANIC ═══════════════════════

   Three free full reads, then the gate. This is the only place a read is spent.

   IT WAS ALREADY TWO COPIES. `AisleMoment` and `CartMoment` each carried their own
   `unlocked` map and their own `requestFull` — same call, same counter, same words, written
   out twice. CartMoment's own comment says why that is dangerous, and says it about itself:

     "THE SAME CALL AND THE SAME METER THE COUNTER USES … not a second one wearing the
      cart's clothes. A card opened from a list row and the same card opened by browsing
      must cost a shopper exactly the same thing, or the meter is two mechanics that will
      drift and the gate copy stops being true on one of them."

   That was true and it was enforced by nobody — the two implementations agreed because
   somebody kept them agreeing. Adding a THIRD caller (the ask, now shared across the
   counter, the dashboard and shop mode) is what made copying it indefensible, so it is one
   function now and the callers hold no meter logic at all.

   ESSENTIALS COME BACK UNLOCKED AND SPEND NOTHING. The SERVER decides that, not this file:
   it answers `spent: false` and the count is left alone. A client-side "is this essential"
   check would be a second opinion about the paid boundary, which is a server boundary.   */

import { useCallback, useState } from 'react';
import { fetchCounterFull } from './perimeter.js';
import { readsSpent, spendRead } from './readMeter.js';

/**
 * @param {() => void} onGated fired when the meter is spent — the ONE ask moment.
 * @returns {{ unlocked: Record<string, object>, requestFull: (slug: string) => Promise<void>,
 *            view: (card: object) => object }}
 *   `view` swaps a summary for its unlocked full read when this session has paid for it.
 */
export function useCardMeter(onGated) {
  const [unlocked, setUnlocked] = useState({});

  const requestFull = useCallback(
    async (slug) => {
      if (!slug || unlocked[slug]) return;
      try {
        const out = await fetchCounterFull(slug, readsSpent());
        if (out.gated) {
          onGated?.();
          return;
        }
        if (out.spent) spendRead();
        setUnlocked((u) => ({ ...u, [slug]: out.card }));
      } catch {
        /* leave it locked; the teaser still reads */
      }
    },
    [unlocked, onGated]
  );

  const view = useCallback((card) => (card && unlocked[card.slug]) || card, [unlocked]);

  return { unlocked, requestFull, view };
}
