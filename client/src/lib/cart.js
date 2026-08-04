/* ═══════════════════════ The cart — one object, several views ═══════════════════════
   The trip is a single artifact. The cart surface renders it, a scan adds to it, the
   Haul reads back from it, and the nav shows its progress — so this state can't live
   inside one screen. It's lifted here as a hook App owns and passes down.

   The server stays the source of truth (persistence + the premium capabilities); this
   is the same thin client the List surface always used, with the mutations moved off
   the component so every surface performs them identically. localStorage remains a
   read-through cache for instant first paint. */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  loadCachedList,
  fetchList,
  saveList,
  rebuildList,
  recordRemoved,
  recordKept,
  recordAcceptedSwap,
  recordDeclinedSwap,
  composeList,
  composeGuestList,
  buildGuestList,
  attachGuestCards,
  tripSeedable,
  seedFromLastTrip,
  completeTrip as completeTripRemote,
  startNewTripRemote,
} from './list.js';
import { trackEvent } from './analytics.js';
import { guestList, recordGuestList } from './guestState.js';

const rid = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID()) ||
  `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

/* ───────── Derived reads (pure — safe anywhere, incl. before the hook mounts) ───────── */

/** Checked / total for the current trip, plus whether a trip is actually underway. */
export function cartProgress(list) {
  const items = Array.isArray(list?.items) ? list.items : [];
  // Haul swap callouts are Kristy's notes, not things you put in a cart — they'd
  // skew the count toward "never finished". Progress is over shoppable rows only.
  const shoppable = items.filter((i) => i.source !== 'swap');
  const total = shoppable.length;
  const checked = shoppable.filter((i) => i.checked).length;
  return {
    total,
    checked,
    remaining: total - checked,
    pct: total ? Math.round((checked / total) * 100) : 0,
    started: checked > 0,
    complete: total > 0 && checked === total,
  };
}

/** The surface to open on. Synchronous (cache only) — never delays or blocks boot. */
export function initialMoment() {
  // HOME, UNCONDITIONALLY — and the word is the only thing that changed. This used to open
  // a just-finished trip on the Haul, which was a real convenience and a small lie about
  // what the app is: the answer to "where does this open" has to be one place.
  //
  // IT STAYS UNCONDITIONAL EVEN THOUGH SHOP MODE EXISTS, and that is the point of the
  // dashboard rather than an oversight. A shopper who backgrounds the app mid-aisle and
  // comes back needs to land exactly where they were — but auto-entering a full-screen mode
  // on boot would put a shopper standing at home into the store, and it would make this
  // function depend on state it cannot read synchronously. Instead the dashboard's mid-trip
  // hero IS the resume: loudest thing on the surface, one deliberate tap, and it names the
  // aisle it is returning to. The trip is never lost; it is announced where they already are.
  return 'home';
}

/** Scanned products the shopper kept, as cart rows (used by the Haul's trip view). */
export const scannedItems = (list) =>
  (Array.isArray(list?.items) ? list.items : []).filter((i) => i.source === 'scan');

/* ───────── The hook ───────── */

export function useCart(prefs) {
  const [list, setList] = useState(() => loadCachedList());
  // App rebuilds the prefs object every render; hold it in a ref so the mutations
  // below stay referentially stable and never re-trigger a caller's effects.
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(() => loadCachedList() == null);
  const [busy, setBusy] = useState(''); // 'edit' | 'build' while composing
  const [note, setNote] = useState(''); // Kristy’s one-line summary after a compose
  const [gated, setGated] = useState(false); // free user hit the NL editor

  // Load the authoritative cart on app open — not on the cart screen's mount — so it
  // exists for every surface: a scan can land in the trip before that screen has ever
  // been opened, and the nav can show progress from the start.
  //
  // Re-runs when the shopping preferences CHANGE, which matters because App owns this
  // now: at first render the profile hasn't loaded (and a first-run user hasn't chosen
  // goals yet), so the opening fetch is goal-less and the server answers with the
  // generic template. Without this dependency the shopper finishes onboarding and
  // still gets the `_default` cart. The server regenerates off its own signature and
  // carries over anything they added, so this is a re-read, not a reset.
  const prefSig = JSON.stringify([
    prefs?.goals || [],
    prefs?.nonNegotiables || [],
    prefs?.focuses || [],
    prefs?.constraints || [],
  ]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { list: fresh, premium: prem } = await fetchList(prefsRef.current);
      if (!alive) return;
      if (fresh) {
        listRef.current = fresh;
        setList(fresh);
      }
      setPremium(prem);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [prefSig]);

  // Mutations read the live list through a ref and compute the next one eagerly, so
  // the learning signals and the persist call are plain side effects — never inside a
  // setState updater, which React is free to invoke twice.
  const listRef = useRef(list);
  useEffect(() => {
    listRef.current = list;
  }, [list]);

  // Merge ONLY the offer fields from the server's copy, row by row. Rows that have
  // since been removed, renamed or checked are left exactly as the shopper left them.
  const mergeOffers = useCallback((serverList) => {
    if (!serverList || !Array.isArray(serverList.items)) return;
    const offers = new Map(
      serverList.items.filter((i) => i.offered).map((i) => [i.id, i])
    );
    if (!offers.size) return;
    const cur = listRef.current;
    if (!cur || !Array.isArray(cur.items)) return;
    let changed = false;
    const items = cur.items.map((i) => {
      const o = offers.get(i.id);
      if (!o || i.offered) return i;
      changed = true;
      return {
        ...i,
        offered: true,
        ...(o.swapOffer ? { swapOffer: o.swapOffer, offerId: o.offerId, swapTo: o.swapTo } : {}),
      };
    });
    if (!changed) return;
    const next = { ...cur, items };
    listRef.current = next;
    setList(next);
  }, []);

  const mutate = useCallback(
    (fn) => {
      // A trip can begin with an ACTION, not only an answer — scanning something in
      // the aisle before ever telling Kristy what the trip is for has to work. So a
      // missing cart is materialized here rather than dropping the mutation.
      const cur =
        listRef.current && Array.isArray(listRef.current.items)
          ? listRef.current
          : { goal: null, intro: '', items: [] };
      const next = fn(cur);
      if (!next || next === cur) return;
      listRef.current = next;
      setList(next);
      // The save round-trip is where Kristy's one comment on a newly-added row comes
      // back. Only the offer fields are merged, matched by row id — replacing the
      // whole list would silently undo whatever the shopper did while it was in flight.
      Promise.resolve(saveList(next)).then((res) => mergeOffers(res?.list));
    },
    [mergeOffers]
  );

  /* ── Tap actions. Every one of these is reachable by a button; none needs typing. ── */

  const toggle = useCallback(
    (id) =>
      mutate((cur) => {
        const item = cur.items.find((i) => i.id === id);
        if (item && !item.checked && item.source === 'swap') recordAcceptedSwap(item.productName);
        // Checking a row off is the shopper saying they actually bought it. That is
        // the baseline every future nudge leans from — where they really are, rather
        // than a blank ideal restated every trip.
        if (item && !item.checked && item.source !== 'swap') recordKept(item.name);
        return { ...cur, items: cur.items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)) };
      }),
    [mutate]
  );

  const remove = useCallback(
    (id) =>
      mutate((cur) => {
        const item = cur.items.find((i) => i.id === id);
        // Learning signal: a template row the shopper removed is never re-suggested.
        if (item && item.source === 'template') recordRemoved(item.name);
        return { ...cur, items: cur.items.filter((i) => i.id !== id) };
      }),
    [mutate]
  );

  const add = useCallback(
    (name, category = 'Added') => {
      const clean = String(name || '').trim();
      if (!clean) return;
      mutate((cur) => ({
        ...cur,
        items: [...cur.items, { id: rid(), name: clean, category, checked: false, source: 'user' }],
      }));
      trackEvent('cart-add', { source: 'tap' });
    },
    [mutate]
  );

  /* ── Kristy's one offer, and the two honest answers to it ──────────────────────
     Both answers END the conversation about that row. Neither removes anything, and
     neither is ever raised again: the item was the shopper's call from the start. */

  // "Keep it." The offer disappears and the swap is recorded as declined, so it is
  // never proposed again on any future trip. Respect over repetition — this is the
  // single most important behaviour in the whole feature, because a suggestion that
  // comes back after a no is a suggestion that was never really optional.
  const keepItem = useCallback(
    (id) => {
      const item = listRef.current?.items?.find((i) => i.id === id);
      if (item?.offerId) recordDeclinedSwap(item.offerId);
      mutate((cur) => ({
        ...cur,
        items: cur.items.map((i) =>
          i.id === id ? { ...i, swapOffer: undefined, swapTo: undefined, offered: true } : i
        ),
      }));
      trackEvent('list-offer', { action: 'kept', offer: item?.offerId || null });
    },
    [mutate]
  );

  // "Take the swap." The row becomes the better item, by the shopper's own tap. The
  // offer is cleared either way, so the row is never annotated twice.
  const takeOffer = useCallback(
    (id) => {
      const item = listRef.current?.items?.find((i) => i.id === id);
      if (!item?.swapTo) return;
      mutate((cur) => ({
        ...cur,
        items: cur.items.map((i) =>
          i.id === id
            ? { ...i, name: item.swapTo, refined: true, swapOffer: undefined, swapTo: undefined, offered: true }
            : i
        ),
      }));
      trackEvent('list-offer', { action: 'taken', offer: item.offerId || null });
    },
    [mutate]
  );

  // The Perimeter loop's refinement, applied in place: "Olive oil" → "Fresh,
  // dark-bottle extra-virgin olive oil". Kristy's better pick, one tap.
  const refine = useCallback(
    (id, newName) => {
      if (!newName) return;
      mutate((cur) => ({
        ...cur,
        items: cur.items.map((i) => (i.id === id ? { ...i, name: newName, refined: true } : i)),
      }));
      trackEvent('perimeter-refine', { item: newName });
    },
    [mutate]
  );

  // A scan lands in the trip. The verdict tier rides along so the cart can show what
  // she made of it without re-asking — the coaching stays attached to the item.
  const addScan = useCallback(
    ({ name, tier, barcode, category }) => {
      const clean = String(name || '').trim();
      if (!clean) return;
      mutate((cur) => {
        // Same product scanned twice in a trip → keep one row, freshest verdict.
        const dupe = cur.items.find(
          (i) => i.source === 'scan' && i.name.toLowerCase() === clean.toLowerCase()
        );
        if (dupe) {
          return { ...cur, items: cur.items.map((i) => (i.id === dupe.id ? { ...i, tier: tier || i.tier } : i)) };
        }
        return {
          ...cur,
          items: [
            ...cur.items,
            {
              id: rid(),
              name: clean,
              category: category || 'Scanned',
              checked: true, // it’s in your hands — it’s in the cart
              source: 'scan',
              tier: tier || null,
              ...(barcode ? { productName: clean } : {}),
            },
          ],
        };
      });
      trackEvent('cart-add', { source: 'scan', tier: tier || null });
    },
    [mutate]
  );

  /* ── The deep input: natural language → a cart edit (premium). ── */

  const compose = useCallback(
    async (instruction, mode = 'edit') => {
      const text = String(instruction || '').trim();
      if (!text || busy) return { ok: false };
      // NO PREMIUM CHECK. Building the cart from a sentence is free — a guest could always
      // do it, so refusing a signed-in shopper here made an account worth less than none.
      // The server holds a daily budget instead of a gate; `gated` survives only because
      // the composer can still come back over budget.
      setBusy(mode);
      setNote('');
      setGated(false);
      const res = await composeList({ instruction: text, mode, prefs: prefsRef.current });
      setBusy('');
      if (res?.budget) {
        // A ceiling, not a wall — so it says so and offers no plan. `note` is the same
        // channel her compose summaries use, which is where the shopper is already looking.
        setNote(res.message || '');
        return { ok: false, budget: true };
      }
      if (res?.list) {
        listRef.current = res.list;
        setList(res.list);
        if (res.summary) setNote(res.summary);
        trackEvent('list-compose', { mode });
        return { ok: true, summary: res.summary };
      }
      return { ok: false, error: true };
    },
    [busy, premium]
  );

  // A cart edit that happened elsewhere (Kristy editing it from chat) lands here, so
  // the shopper switches back to the cart and simply finds it changed.
  const applyList = useCallback((next, summary) => {
    if (!next || !Array.isArray(next.items)) return;
    listRef.current = next;
    setList(next);
    if (summary) setNote(summary);
  }, []);

  /* ── The trip lifecycle. All three are SERVER acts now. ──
     Starting over used to write `{items: []}` over the stored list, which is exactly how a
     finished trip got destroyed with no record of it. The server decides whether the trip
     it is replacing is archived (something was checked) or simply reused (nothing was), so
     the client cannot get that wrong by forgetting to ask. */
  const startNewTrip = useCallback(async () => {
    const { list: fresh } = await startNewTripRemote();
    const next = fresh || { goal: null, intro: '', items: [] };
    listRef.current = next;
    setList(next);
    setNote('');
    setGated(false);
    trackEvent('cart-new-trip', {});
  }, []);

  // Finish the trip. Archived, never erased — this is what "same as last week" reads.
  const completeTrip = useCallback(async () => {
    const res = await completeTripRemote();
    if (res?.error) return { ok: false };
    const next = res.list || { goal: null, intro: '', items: [] };
    listRef.current = next;
    setList(next);
    trackEvent('trip-complete', {});
    return { ok: true };
  }, []);

  // "Same as last week" — the ONE seeding act.
  const seedFromLast = useCallback(async () => {
    const res = await seedFromLastTrip();
    if (res?.error || !res.list) return { ok: false, reason: res?.reason };
    listRef.current = res.list;
    setList(res.list);
    setNote(res.list.intro || '');
    trackEvent('trip-seed', { items: res.list.items?.length || 0 });
    return { ok: true };
  }, []);

  // Whether to OFFER it. Checked on mount and after a completion, so the control never
  // appears for a shopper with no completed trip behind them.
  const [seedable, setSeedable] = useState({ seedable: false, items: 0 });
  useEffect(() => {
    let alive = true;
    tripSeedable().then((s) => alive && setSeedable(s));
    return () => { alive = false; };
  }, [list?.items?.length === 0]);

  const rebuild = useCallback(async () => {
    trackEvent('list-build', { source: 'rebuild' });
    const { list: fresh, premium: prem } = await rebuildList(prefsRef.current);
    if (fresh) {
      listRef.current = fresh;
      setList(fresh);
    }
    setPremium(prem);
  }, []);

  // A haul swap accepted from the Haul surface appears in the cart immediately,
  // rather than waiting for the next server round-trip.
  const addSwaps = useCallback(
    (swaps) =>
      mutate((cur) => {
        const have = new Set(
          cur.items.filter((i) => i.source === 'swap' && i.productName).map((i) => i.productName.toLowerCase())
        );
        const fresh = (swaps || [])
          .filter((s) => s?.product_name && !have.has(s.product_name.toLowerCase()))
          .map((s) => ({
            id: rid(),
            name: `Swap out: ${s.product_name}`,
            category: 'From your haul',
            checked: false,
            source: 'swap',
            productName: s.product_name,
          }));
        return fresh.length ? { ...cur, items: [...fresh, ...cur.items] } : cur;
      }),
    [mutate]
  );

  return {
    list,
    premium,
    loading,
    busy,
    note,
    gated,
    // Is a trip actually underway? A null cart (never started) and an emptied one
    // (new trip) both read as "no cart" — that's the state where Kristy asks what
    // the trip is for instead of handing over a template.
    hasCart: Array.isArray(list?.items) && list.items.length > 0,
    startNewTrip,
    completeTrip,
    seedFromLast,
    seedable,
    progress: cartProgress(list),
    setNote,
    setGated,
    toggle,
    remove,
    add,
    refine,
    keepItem,
    takeOffer,
    addScan,
    addSwaps,
    applyList,
    compose,
    rebuild,
  };
}

/* ═══════════════════ The stranger's cart — the same object, no account ═══════════════════
   A stranger finishes onboarding and gets a real cart before being asked for anything.
   That cart has to behave like a cart — check a row, remove one, add one, take a scan —
   or the payoff is a screenshot rather than the product.

   So this returns the SAME shape useCart does, which is what lets CartMoment render it
   without knowing whether there's an account behind it. Only the two ends differ:
   persistence goes to guest state instead of the server, and the actions that genuinely
   require an account (the conversational composer, a rebuild) call onNeedsAccount, which
   surfaces the save-your-work sign-in offer rather than failing silently.

   `premium` is reported TRUE on purpose. This cart was generated at full tailoring — the
   one-time taste — so its rows already are the paid capability. Showing "upgrade for
   focus-aware picks" on a cart that visibly has them would be incoherent. The taste is
   named honestly by the banner on the surface instead. */
export function useGuestCart({ onNeedsAccount, prefs } = {}) {
  const [list, setList] = useState(() => guestList());
  const [note, setNote] = useState('');
  const [gated, setGated] = useState(false);
  const [busy, setBusy] = useState('');

  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  const listRef = useRef(list);
  useEffect(() => {
    listRef.current = list;
  }, [list]);

  /* CARD ATTACHMENT IS NOT GATED, so a guest gets it too — and their cart never touches the
     server, so it has to be asked for explicitly.

     Fires only when a MATCHABLE row has not been looked at yet, which is what makes this
     quiet: adding an item triggers one call, and checking things off for the next forty
     minutes triggers none. The server stamps `carded` on every row it inspects including
     the misses, so a row is never re-sent.

     Merged by ROW ID rather than replacing the list, for the same reason mergeOffers does
     it: the shopper may have checked or removed something while the call was in flight, and
     their edit outranks our annotation. */
  const uncarded = (list?.items || []).some(
    (i) => !i.carded && (i.source === 'user' || i.source === 'imported' || i.source === 'template')
  );

  useEffect(() => {
    if (!uncarded) return;
    let alive = true;
    (async () => {
      const carded = await attachGuestCards(listRef.current);
      if (!alive || !carded) return;
      const byId = new Map(carded.items.map((i) => [i.id, i]));
      const cur = listRef.current;
      if (!cur || !Array.isArray(cur.items)) return;
      let changed = false;
      const items = cur.items.map((i) => {
        const c = byId.get(i.id);
        if (!c || i.carded) return i;
        changed = true;
        return {
          ...i,
          carded: true,
          ...(c.cardSlug ? { cardSlug: c.cardSlug, cardSection: c.cardSection } : {}),
        };
      });
      if (!changed) return;
      const next = { ...cur, items };
      listRef.current = next;
      setList(next);
      recordGuestList(next);
    })();
    return () => {
      alive = false;
    };
  }, [uncarded]);

  // Same discipline as useCart: compute the next list eagerly and persist as a plain
  // side effect, never inside a setState updater React may run twice.
  const mutate = useCallback((fn) => {
    const cur =
      listRef.current && Array.isArray(listRef.current.items)
        ? listRef.current
        : { goal: null, intro: '', items: [] };
    const next = fn(cur);
    if (!next || next === cur) return;
    listRef.current = next;
    setList(next);
    recordGuestList(next);
  }, []);

  const toggle = useCallback(
    (id) =>
      mutate((cur) => ({
        ...cur,
        items: cur.items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
      })),
    [mutate]
  );

  const remove = useCallback(
    (id) => mutate((cur) => ({ ...cur, items: cur.items.filter((i) => i.id !== id) })),
    [mutate]
  );

  const add = useCallback(
    (name, category = 'Added') => {
      const clean = String(name || '').trim();
      if (!clean) return;
      mutate((cur) => ({
        ...cur,
        items: [...cur.items, { id: rid(), name: clean, category, checked: false, source: 'user' }],
      }));
      trackEvent('cart-add', { source: 'tap', guest: true });
    },
    [mutate]
  );

  const refine = useCallback(
    (id, newName) => {
      if (!newName) return;
      mutate((cur) => ({
        ...cur,
        items: cur.items.map((i) => (i.id === id ? { ...i, name: newName, refined: true } : i)),
      }));
    },
    [mutate]
  );

  const addScan = useCallback(
    ({ name, tier, barcode, category }) => {
      const clean = String(name || '').trim();
      if (!clean) return;
      mutate((cur) => {
        const dupe = cur.items.find(
          (i) => i.source === 'scan' && i.name.toLowerCase() === clean.toLowerCase()
        );
        if (dupe) {
          return { ...cur, items: cur.items.map((i) => (i.id === dupe.id ? { ...i, tier: tier || i.tier } : i)) };
        }
        return {
          ...cur,
          items: [
            ...cur.items,
            {
              id: rid(),
              name: clean,
              category: category || 'Scanned',
              checked: true,
              source: 'scan',
              tier: tier || null,
              ...(barcode ? { productName: clean } : {}),
            },
          ],
        };
      });
      trackEvent('cart-add', { source: 'scan', tier: tier || null, guest: true });
    },
    [mutate]
  );

  // The cart Kristy just built during onboarding.
  const applyList = useCallback((next, summary) => {
    if (!next || !Array.isArray(next.items)) return;
    listRef.current = next;
    setList(next);
    recordGuestList(next);
    if (summary) setNote(summary);
  }, []);

  const startNewTrip = useCallback(() => {
    const empty = { goal: null, intro: '', items: [], emptied: true };
    listRef.current = empty;
    setList(empty);
    recordGuestList(empty);
    setNote('');
  }, []);

  /* Building the cart by talking is THE flow, so it works with no account. The public
     composer runs the same claim-locked model call and returns the same shape; nothing
     is stored server-side, and the result lands in guest state like every other edit.
     Only when the shared guest budget runs out does this become a sign-in moment —
     which is honest, because that is the point where an account actually buys something. */
  const compose = useCallback(
    async (instruction, mode = 'edit') => {
      const text = String(instruction || '').trim();
      if (!text || busy) return { ok: false };
      setBusy(mode);
      setNote('');
      setGated(false);
      const res = await composeGuestList({
        instruction: text,
        mode,
        prefs: prefsRef.current || {},
        list: listRef.current,
      });
      setBusy('');
      if (res?.gate) {
        onNeedsAccount?.();
        return { ok: false, needsAccount: true };
      }
      if (res?.list && Array.isArray(res.list.items)) {
        listRef.current = res.list;
        setList(res.list);
        recordGuestList(res.list);
        if (res.summary) setNote(res.summary);
        trackEvent('list-compose', { mode, guest: true });
        return { ok: true, summary: res.summary };
      }
      return { ok: false, error: true };
    },
    [busy, onNeedsAccount]
  );

  /* "Build me a full cart" — the opt-in for anyone who does want one handed to them.
     Deterministic (no model call), generated by the same generateList the account path
     uses, and free. It is a CHOICE here, never the landing state. */
  const rebuild = useCallback(async () => {
    setBusy('build');
    try {
      const p = prefsRef.current || {};
      const { list: fresh } = await buildGuestList({
        coach_goals: p.coach_goals || [],
        non_negotiables: p.non_negotiables || [],
        focuses: p.focuses || [],
        constraints: p.constraints || [],
      });
      if (fresh && Array.isArray(fresh.items)) {
        listRef.current = fresh;
        setList(fresh);
        recordGuestList(fresh);
        trackEvent('list-build', { source: 'guest-full-build', items: fresh.items.length, guest: true });
      }
    } catch {
      // Needs at least one goal, or the network failed. The question is still on
      // screen and typing an answer is the other way through.
      onNeedsAccount?.();
    } finally {
      setBusy('');
    }
  }, [onNeedsAccount]);

  return {
    list,
    premium: true,
    loading: false,
    busy,
    note,
    gated,
    hasCart: Array.isArray(list?.items) && list.items.length > 0,
    startNewTrip,
    /* A GUEST HAS NO TRIP HISTORY, and that is honest rather than a gap: trips are rows
       keyed to an account, and there is no account. So the two acts that read history are
       absent and `seedable` is false, which is what stops the cart offering "same as last
       week" to someone who has no last week the server could find. */
    completeTrip: async () => ({ ok: false }),
    seedFromLast: async () => ({ ok: false }),
    seedable: { seedable: false, items: 0 },
    progress: cartProgress(list),
    setNote,
    setGated,
    toggle,
    remove,
    add,
    refine,
    addScan,
    addSwaps: () => {},
    applyList,
    compose,
    rebuild,
  };
}
