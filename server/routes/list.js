import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { userRateLimit } from '../lib/rateLimit.js';
import {
  getFullProfile,
  getShoppingList,
  saveShoppingList,
  appendPendingSwaps,
  clearPendingSwaps,
} from '../lib/store.js';
import { premiumForReq } from '../lib/subscription.js';
import { generateList, mergePendingSwaps, listSignature, EMPTY_SIGNALS } from '../lib/list.js';
import { composeListEdit } from '../lib/listCompose.js';
import { parseListText, specifyImportedItems, importSummary } from '../lib/listImport.js';
import { readListPhoto } from '../lib/listVision.js';
import { imageUpload } from '../lib/upload.js';
import { migrateGoalSet } from '../lib/taxonomy.js';
import { sanitizeList, applyCompose, buildCart, LIST_COMPOSE_UPSELL } from '../lib/cartEdit.js';

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
  const out = { removed: arr(s?.removed), kept: arr(s?.kept), acceptedSwaps: arr(s?.acceptedSwaps) };
  if (s?.sig) out.sig = String(s.sig).slice(0, 400);
  return out;
}

// When the profile changed since a list was built, regenerate but carry over the
// user's OWN additions, anything they scanned into the trip, and any haul-swap
// callouts — so a goal switch refreshes the template without discarding what the
// shopper explicitly put in the cart.
const CARRIED_SOURCES = new Set(['user', 'swap', 'scan']);
function preserveUserItems(fresh, stored) {
  const keepers = (stored?.items || []).filter((i) => CARRIED_SOURCES.has(i.source));
  const names = new Set((fresh.items || []).map((i) => i.name.toLowerCase()));
  const carried = keepers.filter((i) => !names.has(i.name.toLowerCase()));
  return { ...fresh, items: [...fresh.items, ...carried] };
}

async function persist(userId, patch) {
  try {
    await saveShoppingList(userId, patch);
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
    const stored = row?.list && Array.isArray(row.list.items) ? row.list : null;

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
      // Goal / hard lines / focuses / constraints changed since this list was built
      // → regenerate, carrying over the user's own adds + haul swaps. No manual
      // "Rebuild" needed.
      const fresh = generateList({ goals, nonNegotiables, focuses, constraints, nextList: pending, signals, premium });
      list = preserveUserItems(fresh, stored);
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

    return res.json({ list, premium });
  } catch (err) {
    console.error('[kristy] GET /api/list error:', err.message);
    return res.status(500).json({ error: 'Could not load your list.' });
  }
});

router.post('/list', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const list = sanitizeList(req.body?.list);
  if (!list) return res.status(400).json({ error: 'list is required' });
  const signals = req.body?.signals !== undefined ? normalizeSignals(req.body.signals) : undefined;
  try {
    // Preserve the generation signature across a user edit, so staleness tracking
    // isn't reset by the shopper checking off or adding items.
    if (signals && !signals.sig) {
      const existing = await getShoppingList(userId).catch(() => null);
      if (existing?.signals?.sig) signals.sig = existing.signals.sig;
    }
    await persist(userId, { list, signals });
    return res.json({ ok: true });
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
    const list = generateList({ goals, nonNegotiables, focuses, constraints, nextList: pending, signals, premium });
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
    const premium = await premiumForReq(req);
    if (!premium) {
      return res.json({ gated: true, premium: false, upsell: LIST_COMPOSE_UPSELL });
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
      goal,
      focuses,
      hardLines: nonNegotiables,
      constraints,
    });

    const list =
      mode === 'build'
        ? buildCart(current, add, { goal, summary })
        : applyCompose(current, { add, remove });

    const clean = sanitizeList(list) || list;
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

    const clean = sanitizeList(merged) || merged;
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
