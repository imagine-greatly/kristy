/* ═══════════════════════ THE SCREEN WAKE LOCK — shop mode only ═══════════════════════

   A phone that sleeps every thirty seconds in an aisle makes the whole mode unusable. This
   holds the screen awake while a shopper is walking their list, and releases it the moment
   they leave.

   ─── THE HALF THAT FAILS SILENTLY ──────────────────────────────────────────────────
   THE LOCK IS RELEASED BY THE BROWSER WHENEVER THE DOCUMENT BECOMES HIDDEN. Per spec, only
   a visible document may hold one, and "previously acquired locks are automatically released
   when the document becomes inactive." So the first notification, app-switch, or glance at a
   text on a real trip drops it — and nothing tells you. Acquire-once code passes every test
   ever written for it and then dies forty seconds into the first real trip, permanently, for
   the rest of the walk.

   `visibilitychange` re-acquisition is therefore not a refinement, it is the feature. It is
   verified in shop.mjs by actually hiding and restoring the document and asserting a NEW
   sentinel exists afterwards — not by asserting a handler is bound, which is the check that
   would pass while the bug shipped.

   ─── SUPPORT, VERIFIED 2026-08-03 ──────────────────────────────────────────────────
   Safari iOS/iPadOS 16.4+, Safari desktop 16.4+, Chrome 85+, Firefox 126+, Samsung 14+.
   ~93% global (caniuse); Baseline "newly available" since March 2025.

   TWO CAVEATS THAT ARE HANDLED HERE RATHER THAN ASSUMED AWAY:

   1. INSTALLED PWAs ON iOS WERE BROKEN UNTIL 18.4. There is a manifest.json in
      client/public, so Kristy is installable, and a shopper on iOS 16.4–18.3 who added it to
      their home screen hits a long-standing WebKit bug where the request does not hold. It
      degrades to a no-op here. There is no workaround and NoSleep.js-style video hacks are
      not worth the battery or the autoplay fight — the mode still works, the screen just
      sleeps on its normal timer, exactly as it does today.

   2. A REJECTION IS NORMAL AND SILENT. `NotAllowedError` fires when the document is hidden,
      not fully active, blocked by permissions policy, or the platform declines (low battery,
      power save). None of those is worth a message: a shopper who cannot get a wake lock is
      not helped by being told about a browser API mid-aisle. Every failure is swallowed.

   Secure context is required. Production is HTTPS on Vercel and `localhost` counts as
   secure, so dev works too.

   ─── BATTERY ───────────────────────────────────────────────────────────────────────
   This prevents the screen DIMMING; it does not keep the CPU busy or the radio awake. The
   cost is roughly one screen-on hour per shopping hour — real, bounded, and exactly the
   duration the shopper chose by entering the mode. It does NOT override a manual power-button
   lock, and the system may revoke it under power save. Releasing on exit is the whole
   discipline, so `stop()` runs on unmount as well as on an explicit exit.                 */

import { useEffect, useRef, useState } from 'react';

export const wakeLockSupported = () =>
  typeof navigator !== 'undefined' && 'wakeLock' in navigator;

/**
 * Hold the screen awake while `active` is true.
 *
 * @param   {boolean} active
 * @returns {{ supported: boolean, held: boolean }} `held` is for verification and telemetry,
 *          never for UI — the shopper is never told about this.
 */
export function useWakeLock(active) {
  const sentinelRef = useRef(null);
  const [held, setHeld] = useState(false);
  const supported = wakeLockSupported();

  useEffect(() => {
    if (!active || !supported) return undefined;
    let alive = true;

    const acquire = async () => {
      // Only a VISIBLE document may hold one; requesting while hidden is a guaranteed
      // NotAllowedError, so this is a guard rather than an optimisation.
      if (document.visibilityState !== 'visible') return;
      if (sentinelRef.current && !sentinelRef.current.released) return;
      try {
        const sentinel = await navigator.wakeLock.request('screen');
        if (!alive) {
          // Unmounted while the request was in flight. Releasing here is what stops a
          // lock outliving the mode that asked for it.
          sentinel.release?.().catch(() => {});
          return;
        }
        sentinelRef.current = sentinel;
        setHeld(true);
        // The platform can drop it on its own (power save, low battery). Reflect that
        // rather than continuing to claim it is held.
        sentinel.addEventListener?.('release', () => {
          if (alive) setHeld(false);
        });
      } catch {
        // Denied, hidden, policy-blocked, or an installed iOS PWA below 18.4. Silent.
        if (alive) setHeld(false);
      }
    };

    // THE RE-ACQUIRE. The browser released it when the document hid; nothing else will ask
    // for it again.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') acquire();
      else if (alive) setHeld(false);
    };

    acquire();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      alive = false;
      document.removeEventListener('visibilitychange', onVisibility);
      const s = sentinelRef.current;
      sentinelRef.current = null;
      setHeld(false);
      // Release on the way out, always. A lock that survives the mode is the failure that
      // drains a battery in a pocket.
      if (s && !s.released) s.release?.().catch(() => {});
    };
  }, [active, supported]);

  return { supported, held };
}
