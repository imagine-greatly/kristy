import { Router } from 'express';
import { randomUUID } from 'node:crypto';
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
import { migratePreferences } from '../lib/taxonomy.js';

const rid = () => randomUUID();

// The withheld conversational-building capability, in Kristy's voice (named value,
// not "go premium"). Free users still get a real basic list + manual add/remove.
const LIST_COMPOSE_UPSELL =
  "Building your cart from a sentence — 'add taco night', 'three high-protein dinners for four' — is part of a membership. Want me to run with it?";

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
  // read time, so a pre-migration DB row shops correctly with no data backfill.
  const { goal, constraints } = migratePreferences({
    goal: profile?.coach_goal || null,
    constraints: Array.isArray(profile?.constraints) ? profile.constraints : [],
  });
  return {
    goal,
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
// user's OWN additions and any haul-swap callouts, so a goal switch refreshes the
// template without discarding what the shopper explicitly put on the list.
function preserveUserItems(fresh, stored) {
  const keepers = (stored?.items || []).filter((i) => i.source === 'user' || i.source === 'swap');
  const names = new Set((fresh.items || []).map((i) => i.name.toLowerCase()));
  const carried = keepers.filter((i) => !names.has(i.name.toLowerCase()));
  return { ...fresh, items: [...fresh.items, ...carried] };
}

function sanitizeList(list) {
  if (!list || !Array.isArray(list.items)) return null;
  const items = list.items
    .slice(0, 200)
    .map((it) => ({
      id: String(it.id || randomUUID()).slice(0, 64),
      name: String(it.name || '').slice(0, 140),
      category: String(it.category || 'Added').slice(0, 60),
      checked: !!it.checked,
      source: ['template', 'swap', 'user'].includes(it.source) ? it.source : 'user',
      ...(it.productName ? { productName: String(it.productName).slice(0, 140) } : {}),
    }))
    .filter((it) => it.name);
  return {
    goal: list.goal ? String(list.goal).slice(0, 60) : null,
    intro: list.intro ? String(list.intro).slice(0, 400) : '',
    items,
  };
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
    const { goal, nonNegotiables, focuses, constraints } = profileInputs(profile);
    const row = await getShoppingList(userId);
    const signals = normalizeSignals(row?.signals || EMPTY_SIGNALS);
    const pending = Array.isArray(row?.next_list) ? row.next_list : [];
    const stored = row?.list && Array.isArray(row.list.items) ? row.list : null;

    const sig = listSignature({ goal, nonNegotiables, focuses, constraints });
    const storedSig = row?.signals?.sig || null;
    const stale = stored && storedSig && storedSig !== sig;

    let list;
    let consumedPending = false;
    if (!stored) {
      // First use → generate from the profile. Premium consumes pending swaps.
      list = generateList({ goal, nonNegotiables, focuses, constraints, nextList: pending, signals, premium });
      consumedPending = premium && pending.length > 0;
      await persist(userId, { list, signals: { ...signals, sig } });
    } else if (stale) {
      // Goal / hard lines / focuses / constraints changed since this list was built
      // → regenerate, carrying over the user's own adds + haul swaps. No manual
      // "Rebuild" needed.
      const fresh = generateList({ goal, nonNegotiables, focuses, constraints, nextList: pending, signals, premium });
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
    const { goal, nonNegotiables, focuses, constraints } = profileInputs(profile);
    const row = await getShoppingList(userId);
    const signals = normalizeSignals(row?.signals || EMPTY_SIGNALS);
    const pending = Array.isArray(row?.next_list) ? row.next_list : [];

    const sig = listSignature({ goal, nonNegotiables, focuses, constraints });
    const list = generateList({ goal, nonNegotiables, focuses, constraints, nextList: pending, signals, premium });
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

// Apply a claim-safe compose result (add/remove by name) to the current list,
// deterministically — the model only proposed names + sections; we do the edit.
function applyCompose(current, { add = [], remove = [] }) {
  const items = Array.isArray(current?.items) ? [...current.items] : [];
  const rm = remove.map((r) => String(r).toLowerCase()).filter(Boolean);
  const dropped = (name) => {
    const n = String(name).toLowerCase();
    return rm.some((r) => n === r || n.includes(r) || r.includes(n));
  };
  // Never remove a haul-swap callout via a text instruction; those are Kristy's notes.
  const kept = items.filter((it) => it.source === 'swap' || !dropped(it.name));
  const present = new Set(kept.map((it) => it.name.toLowerCase()));
  const added = [];
  for (const a of add) {
    const key = String(a.name).toLowerCase();
    if (!key || present.has(key)) continue;
    present.add(key);
    added.push({ id: rid(), name: a.name, category: a.section || 'Pantry', checked: false, source: 'template' });
  }
  return { ...current, items: [...kept, ...added] };
}

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
    const { goal, nonNegotiables, focuses, constraints } = profileInputs(profile);
    const row = await getShoppingList(userId);
    const current =
      row?.list && Array.isArray(row.list.items)
        ? row.list
        : generateList({ goal, nonNegotiables, focuses, constraints, premium });

    const { add, remove, summary } = await composeListEdit({
      instruction,
      mode,
      currentItems: current.items.map((i) => i.name),
      goal,
      focuses,
      hardLines: nonNegotiables,
      constraints,
    });

    let list;
    if (mode === 'build') {
      // A fresh cart. Keep any haul-swap callouts leading; replace the rest.
      const swaps = current.items.filter((i) => i.source === 'swap');
      const seen = new Set();
      const items = [];
      for (const a of add) {
        const key = String(a.name).toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        items.push({ id: rid(), name: a.name, category: a.section || 'Pantry', checked: false, source: 'template' });
      }
      list = { goal: goal || null, intro: summary || current.intro || '', items: [...swaps, ...items] };
    } else {
      list = applyCompose(current, { add, remove });
    }

    const clean = sanitizeList(list) || list;
    await persist(userId, { list: clean });
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

export default router;
