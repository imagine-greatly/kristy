import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { requireAuth } from '../lib/supabase.js';
import {
  getFullProfile,
  getShoppingList,
  saveShoppingList,
  appendPendingSwaps,
  clearPendingSwaps,
} from '../lib/store.js';
import { premiumForReq } from '../lib/subscription.js';
import { generateList, mergePendingSwaps, EMPTY_SIGNALS } from '../lib/list.js';

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
  return {
    goal: profile?.coach_goal || null,
    nonNegotiables: Array.isArray(profile?.non_negotiables) ? profile.non_negotiables : [],
    focuses: Array.isArray(profile?.focuses) ? profile.focuses : [],
  };
}

function normalizeSignals(s) {
  const arr = (v) => (Array.isArray(v) ? v.map((x) => String(x)).slice(0, 200) : []);
  return { removed: arr(s?.removed), kept: arr(s?.kept), acceptedSwaps: arr(s?.acceptedSwaps) };
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
    const { goal, nonNegotiables, focuses } = profileInputs(profile);
    const row = await getShoppingList(userId);
    const signals = normalizeSignals(row?.signals || EMPTY_SIGNALS);
    const pending = Array.isArray(row?.next_list) ? row.next_list : [];
    const stored = row?.list && Array.isArray(row.list.items) ? row.list : null;

    let list;
    let consumedPending = false;
    if (!stored) {
      // First use → generate from the profile. Premium consumes pending swaps.
      list = generateList({ goal, nonNegotiables, focuses, nextList: pending, signals, premium });
      consumedPending = premium && pending.length > 0;
      await persist(userId, { list, signals });
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
    const { goal, nonNegotiables, focuses } = profileInputs(profile);
    const row = await getShoppingList(userId);
    const signals = normalizeSignals(row?.signals || EMPTY_SIGNALS);
    const pending = Array.isArray(row?.next_list) ? row.next_list : [];

    const list = generateList({ goal, nonNegotiables, focuses, nextList: pending, signals, premium });
    await persist(userId, { list, signals });
    if (premium && pending.length) {
      try { await clearPendingSwaps(userId); } catch { /* best-effort */ }
    }
    return res.json({ list, premium });
  } catch (err) {
    console.error('[kristy] POST /api/list/rebuild error:', err.message);
    return res.status(500).json({ error: 'Could not rebuild your list.' });
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
