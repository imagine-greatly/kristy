import { Router } from 'express';
import { requireAuth, supabase } from '../lib/supabase.js';
import { userRateLimit, listComposeLimited, LIST_COMPOSE_BUDGET_MESSAGE } from '../lib/rateLimit.js';
import {
  getFullProfile,
  getShoppingList,
  saveShoppingList,
  appendPendingSwaps,
  clearPendingSwaps,
} from '../lib/store.js';
import { premiumForReq } from '../lib/subscription.js';
import { generateList, mergePendingSwaps, listSignature, canonicalItem, EMPTY_SIGNALS } from '../lib/list.js';
import { composeListEdit } from '../lib/listCompose.js';
import { parseListText, specifyImportedItems, importSummary } from '../lib/listImport.js';
import { readListPhoto } from '../lib/listVision.js';
import { imageUpload } from '../lib/upload.js';
import { migrateGoalSet } from '../lib/taxonomy.js';
import { sanitizeList, applyCompose, buildCart } from '../lib/cartEdit.js';
import { attachOffers } from '../lib/listVoice.js';
import { attachCards } from '../lib/listMatch.js';
import { activeTripOrAdopt, activeTrip, insertTrip, saveTripItems, tripToList } from '../lib/trips.js';
import { buildBaseline, suppressedByBaseline } from '../lib/listBaseline.js';

// The List — server-persisted and server-gated (Step 8 → durable).
//
//   GET  /api/list              the persisted list (generated on first use)
//   POST /api/list              save the user's edited list (+ signals)
//   POST /api/list/rebuild      regenerate from the profile
//   POST /api/list/swaps        queue Haul swaps to appear on the next load
//
// The coaching inputs (goal / focuses / hard lines) and the premium flag are read
// from the DB, never from the request body — so a tampering client cannot obtain
// premium capabilities (focus-aware items, haul-swap integration) it isn't entitled
// to. Persistence is best-effort: if the table isn't migrated yet the list still
// renders (just isn't saved), matching the rest of the app's degrade-don't-break posture.

const router = Router();

function profileInputs(profile) {
  // Migrate the two retired goals (budget_clean / kids_snacks) → goal + constraint at
  // read time, so a pre-migration DB row shops correctly with no data backfill. Goals
  // are a SET now — read coach_goals, falling back to [coach_goal] on an older row.
  const { goals, constraints } = migrateGoalSet({
    goals: Array.isArray(profile?.coach_goals) ? profile.coach_goals : [],
    goal: profile?.coach_goal || null,
    constraints: Array.isArray(profile?.constraints) ? profile.constraints : [],
  });
  return {
    goals,
    goal: goals[0] || null,
    constraints,
    nonNegotiables: Array.isArray(profile?.non_negotiables) ? profile.non_negotiables : [],
    focuses: Array.isArray(profile?.focuses) ? profile.focuses : [],
  };
}

function normalizeSignals(s) {
  const arr = (v) => (Array.isArray(v) ? v.map((x) => String(x)).slice(0, 200) : []);
  const out = {
    removed: arr(s?.removed),
    kept: arr(s?.kept),
    acceptedSwaps: arr(s?.acceptedSwaps),
    // A swap the shopper turned down. Kristy stops offering it — a declined
    // suggestion is a preference learned, not a thing to keep pushing.
    declinedSwaps: arr(s?.declinedSwaps),
  };
  if (s?.sig) out.sig = String(s.sig).slice(0, 400);
  return out;
}

/* When the profile changes, the cart LEANS. It does not get rebuilt.

   It used to: a goal toggle regenerated from the fresh template and carried over only
   the shopper's own adds, so every row Kristy had suggested was silently swapped for a
   different set — mid-trip, without being asked. That is an overhaul dressed as
   coaching, and it is the fastest way to make a list stop feeling like the shopper's.

   The stored cart is the spine. A profile change folds in a few things the new goal
   genuinely brings that are not already there, and changes nothing else. Nobody hits
   their goals in one haul; a list that quietly gets a little better is the whole idea. */
const NUDGE_CAP = 3;

function nudgeTowardProfile(fresh, stored, baseline) {
  const items = stored?.items || [];
  // Compared on the canonical name so "Plain Greek yogurt" does not arrive beside the
  // "Greek yogurt" already in the cart.
  const present = new Set(items.map((i) => canonicalItem(i.name)));
  const additions = [];
  for (const it of fresh.items || []) {
    if (additions.length >= NUDGE_CAP) break;
    // Haul callouts arrive through mergePendingSwaps; they are the shopper's own
    // accepted swaps and must not compete with the nudge for room.
    if (it.source === 'swap') continue;
    // Anything they have already removed or already turned down. A declined swap that
    // reappears as a "nudge" is the same suggestion wearing a different hat, and it
    // is exactly what makes an app feel like it is not listening.
    if (suppressedByBaseline(it.name, baseline)) continue;
    const key = canonicalItem(it.name);
    if (!key || present.has(key)) continue;
    present.add(key);
    additions.push(it);
  }
  if (!additions.length) return stored;
  return { ...stored, items: [...items, ...additions] };
}

/* PERSIST WRITES THE ACTIVE TRIP, and falls back to creating one.
   `signals` still goes to shopping_lists, because it is cross-trip pattern memory and
   filing it per trip would forget the shopper every week. So one call, two destinations,
   split by what the data actually is rather than by where it used to live. */
async function persist(userId, patch) {
  try {
    if (patch.signals !== undefined) {
      await saveShoppingList(userId, { signals: patch.signals });
    }
    if (patch.list !== undefined) {
      const live = await activeTrip(userId, supabase);
      if (live) await saveTripItems(live.id, patch.list, supabase);
      // No active trip and something to save → this IS the start of a trip. A scan in the
      // aisle before the shopper has said what the trip is for has to work.
      else if (patch.list?.items?.length) await insertTrip(userId, patch.list, supabase);
    }
  } catch (err) {
    console.warn('[kristy] list persist skipped:', err.message);
  }
}

router.get('/list', requireAuth, async (req, res) => {
  const userId = req.user.id;
  try {
    const premium = await premiumForReq(req);
    const profile = await getFullProfile(userId).catch(() => ({}));
    const { goals, goal, nonNegotiables, focuses, constraints } = profileInputs(profile);
    const row = await getShoppingList(userId);
    const signals = normalizeSignals(row?.signals || EMPTY_SIGNALS);
    const pending = Array.isArray(row?.next_list) ? row.next_list : [];

    /* THE ACTIVE TRIP IS THE LIST NOW. `shopping_lists.list` is the fossil: read once, on a
       shopper who has never had a trip, and adopted as their first one. After that it is
       never read again — see adoptLegacyList for why the gate is "no trips at all" rather
       than "no active trip". `signals` and `next_list` on that same row stay live and
       cross-trip, which is why the row is not retired outright. */
    const trip = await activeTripOrAdopt(userId, row?.list, supabase);
    const stored = trip ? tripToList(trip) : null;

    const sig = listSignature({ goals, nonNegotiables, focuses, constraints });
    const storedSig = row?.signals?.sig || null;
    // A saved-but-empty cart is a deliberate state ("start a new trip"), not an
    // absent one — it must not be treated as stale and refilled from the template.
    const emptied = stored && stored.items.length === 0;
    const stale = stored && !emptied && storedSig && storedSig !== sig;

    let list;
    let consumedPending = false;
    if (!stored) {
      // NO CART YET → we do NOT invent one. A pre-generated "nutrient-dense whole
      // foods" template is a guess dressed up as coaching: we don't know what this
      // trip is FOR until she asks. The client renders Kristy's question instead,
      // and the answer builds the cart. `null` is the honest empty.
      return res.json({ list: null, premium, pendingSwaps: pending.length });
    } else if (emptied) {
      // An intentionally-emptied cart (the shopper started a new trip). Stay empty —
      // regenerating here would put the default template back and re-break the flow.
      list = stored;
    } else if (stale) {
      // Goal / hard lines / focuses / constraints changed since this list was built.
      // The cart LEANS toward the new profile — a few additions at most — rather than
      // being regenerated out from under the shopper. "Rebuild" is still there for
      // anyone who actually wants the fresh template; it is a choice, not a side
      // effect of tapping a goal.
      const fresh = generateList({ goals, nonNegotiables, focuses, constraints, nextList: pending, signals, premium });
      list = nudgeTowardProfile(fresh, mergePendingSwaps(stored, pending, premium), buildBaseline(signals));
      consumedPending = premium && pending.length > 0;
      await persist(userId, { list, signals: { ...signals, sig } });
    } else if (premium && pending.length) {
      // Existing list → fold in newly-added Haul swaps so they appear without a rebuild.
      list = mergePendingSwaps(stored, pending, premium);
      if (list !== stored) {
        consumedPending = true;
        await persist(userId, { list });
      }
    } else {
      list = stored;
    }

    // Clear the queue only once it's actually been merged in — a non-premium user's
    // pending swaps wait so they appear the moment they upgrade.
    if (consumedPending) {
      try { await clearPendingSwaps(userId); } catch { /* best-effort */ }
    }

    /* CARDS ATTACH ON READ TOO, not only on write. A list that already existed before this
       shipped has no `carded` rows and would otherwise sit uncarded until the shopper
       happened to edit it. attachCards returns the SAME OBJECT when nothing needed looking
       at, so this is free on every subsequent load and the persist below never fires
       spuriously. */
    const carded = attachCards(list);
    if (carded !== list) {
      list = carded;
      await persist(userId, { list });
    }

    return res.json({ list, premium });
  } catch (err) {
    console.error('[kristy] GET /api/list error:', err.message);
    return res.status(500).json({ error: 'Could not load your list.' });
  }
});

router.post('/list', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const clean = sanitizeList(req.body?.list);
  if (!clean) return res.status(400).json({ error: 'list is required' });
  const signals = req.body?.signals !== undefined ? normalizeSignals(req.body.signals) : undefined;
  try {
    // Preserve the generation signature across a user edit, so staleness tracking
    // isn't reset by the shopper checking off or adding items.
    let stored = null;
    if (signals && !signals.sig) {
      stored = await getShoppingList(userId).catch(() => null);
      if (stored?.signals?.sig) signals.sig = stored.signals.sig;
    }

    // KRISTY'S ONE COMMENT. A row the shopper just added gets looked at exactly once;
    // `offered` is stamped on every row it inspects, so this same call on the next
    // save is a no-op. Nothing is removed or renamed here — the most that happens is
    // a note appearing beside an item the shopper is still buying.
    const declined = signals?.declinedSwaps || stored?.signals?.declinedSwaps || [];
    // Both are idempotent by a stamped flag (`offered` / `carded`), so a row added on this
    // save is looked at exactly once and every later save is a no-op over it.
    const list = attachCards(attachOffers(clean, { declined }));

    await persist(userId, { list, signals });
    // The list rides back so the offer lands on the row the shopper is looking at,
    // rather than waiting for a reload to appear.
    return res.json({ ok: true, list });
  } catch (err) {
    console.error('[kristy] POST /api/list error:', err.message);
    return res.status(500).json({ error: 'Could not save your list.' });
  }
});

router.post('/list/rebuild', requireAuth, async (req, res) => {
  const userId = req.user.id;
  try {
    const premium = await premiumForReq(req);
    const profile = await getFullProfile(userId).catch(() => ({}));
    const { goals, goal, nonNegotiables, focuses, constraints } = profileInputs(profile);
    const row = await getShoppingList(userId);
    const signals = normalizeSignals(row?.signals || EMPTY_SIGNALS);
    const pending = Array.isArray(row?.next_list) ? row.next_list : [];

    const sig = listSignature({ goals, nonNegotiables, focuses, constraints });
    const list = attachCards(
      generateList({ goals, nonNegotiables, focuses, constraints, nextList: pending, signals, premium })
    );
    await persist(userId, { list, signals: { ...signals, sig } });
    if (premium && pending.length) {
      try { await clearPendingSwaps(userId); } catch { /* best-effort */ }
    }
    return res.json({ list, premium });
  } catch (err) {
    console.error('[kristy] POST /api/list/rebuild error:', err.message);
    return res.status(500).json({ error: 'Could not rebuild your list.' });
  }
});

// POST /api/list/compose  { instruction, mode?: 'edit' | 'build' }
// The conversational editor: natural language → a list edit. PREMIUM only (reads
// premium from the DB, never the body) — free users get a Kristy-voiced, in-card
// nudge (no wall). The one model call is claim-safe: it emits grocery item names +
// sections + a one-line summary, and we apply add/remove deterministically.
router.post('/list/compose', requireAuth, userRateLimit, async (req, res) => {
  const userId = req.user.id;
  const instruction = String(req.body?.instruction || '').trim();
  const mode = req.body?.mode === 'build' ? 'build' : 'edit';
  if (!instruction) return res.status(400).json({ error: 'instruction is required' });

  try {
    // A BUDGET, NOT A GATE. Building a list is building a list, and the list is free — a
    // guest already got this. Free callers get their own daily ceiling; see
    // LIST_COMPOSE_FREE_LIMIT for why it is twelve a day rather than an hourly bucket.
    const premium = await premiumForReq(req);
    if (!premium && listComposeLimited(userId)) {
      return res.status(429).json({ error: true, message: LIST_COMPOSE_BUDGET_MESSAGE });
    }

    const profile = await getFullProfile(userId).catch(() => ({}));
    const { goals, goal, nonNegotiables, focuses, constraints } = profileInputs(profile);
    const row = await getShoppingList(userId);
    // No cart yet → an EMPTY one, not a generated template. The shopper's sentence is
    // what the cart is built from; seeding a default first would put items in it that
    // they never asked for and can't tell apart from the ones they did.
    const current =
      row?.list && Array.isArray(row.list.items)
        ? row.list
        : { goal, intro: '', items: [] };

    const { add, remove, summary } = await composeListEdit({
      instruction,
      mode,
      currentItems: current.items.map((i) => i.name),
      // Their real basket, so a build leans from where they actually are rather than
      // from a blank ideal. Evidence, never a request — the prompt may not add from it.
      staples: buildBaseline(normalizeSignals(row?.signals || EMPTY_SIGNALS)).staples,
      goal,
      goals,
      focuses,
      hardLines: nonNegotiables,
      constraints,
    });

    const list =
      mode === 'build'
        ? buildCart(current, add, { goal, summary })
        : applyCompose(current, { add, remove }, { instruction });

    const clean = attachCards(sanitizeList(list) || list);
    // Stamp the CURRENT preference signature onto a conversationally-built cart.
    // Without this a cart built after a goal change reads as stale on the next load
    // and gets regenerated from the template — silently throwing away the cart the
    // shopper just asked for.
    const signals = normalizeSignals(row?.signals || EMPTY_SIGNALS);
    await persist(userId, {
      list: clean,
      signals: { ...signals, sig: listSignature({ goals, nonNegotiables, focuses, constraints }) },
    });
    return res.json({ list: clean, summary, premium: true });
  } catch (err) {
    console.error('[kristy] POST /api/list/compose error:', err.message);
    return res.status(503).json({
      error: true,
      message: "I couldn't put that together just now — give me a second and try again.",
    });
  }
});

router.post('/list/swaps', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const swaps = Array.isArray(req.body?.swaps)
    ? req.body.swaps
        .filter((s) => s && s.product_name)
        .map((s) => ({
          product_name: String(s.product_name).slice(0, 140),
          tier: s.tier ? String(s.tier).slice(0, 40) : null,
        }))
        .slice(0, 50)
    : [];
  if (!swaps.length) return res.json({ ok: true, pending: 0 });
  try {
    const next = await appendPendingSwaps(userId, swaps);
    return res.json({ ok: true, pending: next.length });
  } catch (err) {
    console.warn('[kristy] POST /api/list/swaps skipped:', err.message);
    return res.json({ ok: true, pending: 0 });
  }
});

/* ═══════════════ POST /api/list/import — the shopper's OWN list, specified ═══════════════
   Two ways in, one pipeline out: a typed/pasted list (`text`) or a photo of one
   (multipart `image`, transcribed by listVision). Either way the raw strings run
   through the SAME deterministic specification, so a photographed list and a pasted
   one produce the same quality of cart.

   Not premium-gated. Reading a label with vision is free for everyone including
   guests (it's the acquisition hook); reading a shopping list is the same act, and
   gating it would make importing feel like a toll on work the shopper already did.
   `premium` is still passed through, so the constraint-tuned specifics stay a paid
   capability exactly as they are in generateList.

   Preferences come from the DB, never the request body — same rule as every other
   route here, so a tampering client can't obtain the tuned picks. */
async function rawItemsFromRequest(req) {
  if (req.file) {
    const base64 = req.file.buffer.toString('base64');
    const mediaType = req.file.mimetype || 'image/jpeg';
    const { items } = await readListPhoto({ base64, mediaType });
    // Vision hands back {text, unreadable}; the unreadable ones ride through so the
    // shopper gets a row to fix instead of a silent omission or an invented item.
    return items;
  }
  return parseListText(req.body?.text);
}

router.post('/list/import', requireAuth, userRateLimit, imageUpload.single('image'), async (req, res) => {
  const userId = req.userId;
  try {
    const rawItems = await rawItemsFromRequest(req);
    if (!rawItems.length) {
      return res.json({
        list: null,
        summary: "I couldn't make out a list in that — type it in and I'll take it from there.",
        imported: 0,
      });
    }

    const premium = await premiumForReq(req);
    const profile = await getFullProfile(userId).catch(() => ({}));
    const { goal, nonNegotiables, constraints } = profileInputs(profile);

    const { items, specified, offers } = specifyImportedItems(rawItems, {
      nonNegotiables,
      constraints,
      premium,
    });

    const row = await getShoppingList(userId);
    const current =
      row?.list && Array.isArray(row.list.items) ? row.list : { goal, intro: '', items: [] };

    const summary = importSummary({ items, specified, offers });
    // Imported items are APPENDED, never a replacement — an import must not silently
    // wipe a cart the shopper was already building.
    const merged = {
      ...current,
      goal: current.goal ?? goal,
      intro: summary,
      items: [...current.items, ...items],
    };

    const clean = attachCards(sanitizeList(merged) || merged);
    await saveShoppingList(userId, { list: clean });
    return res.json({ list: clean, summary, imported: items.length, specified });
  } catch (err) {
    console.error(`[kristy] /api/list/import error @ ${new Date().toISOString()}:`, err?.message || err);
    return res.status(503).json({
      error: true,
      message: "I couldn't read that list just now — try again, or type it in.",
    });
  }
});

export default router;
