// Trips — the shopper's record of what they actually shop, and the end of the
// one-overwritten-list-per-user era.
//
// `shopping_lists` has `user_id` as its PRIMARY KEY: one row, one list, overwritten in
// place. That single fact blocked everything downstream — a finished trip could not be
// archived because there was nowhere to put it, "same as last week" had no last week to
// read, and starting a new trip wrote `{items: []}` over a completed one and destroyed the
// record of it.
//
// WHAT DOES NOT MOVE. `shopping_lists.signals` and `.next_list` stay exactly where they
// are. `signals` is CROSS-trip pattern memory — buildBaseline reads it over time to work
// out what someone actually buys — and filed per trip it would forget the shopper every
// week, which is the one thing it exists not to do. `next_list` is the Haul → next-trip
// queue and spans the boundary between trips by definition. So the carry-forward loop, the
// baseline and the staleness signature are all untouched by this file.
//
// THE CLIENT IS INJECTABLE on every function here, exactly as it is on productStore and
// counterCards, and for the same reason: the lifecycle is a SEQUENCE — active → completed →
// seeded — and only a sequence can demonstrate it. `trips.test.js` runs the real one
// against a fake client rather than asserting that the source looks right.

import { randomUUID } from 'node:crypto';
import { sanitizeList } from './cartEdit.js';
import { attachCards } from './listMatch.js';
import { buildCarryForward } from './haul.js';

export const TABLE = 'trips';

const TRIP_COLUMNS = 'id, user_id, status, goal, intro, items, started_at, completed_at, updated_at';

/** A trip row → the list doc shape every existing consumer already renders. */
export function tripToList(trip) {
  if (!trip) return null;
  return {
    goal: trip.goal || null,
    intro: trip.intro || '',
    items: Array.isArray(trip.items) ? trip.items : [],
  };
}

/* ═══════════════════════════ Reading ═══════════════════════════ */

async function selectTrips(client, apply) {
  if (!client) return null;
  try {
    const { data, error } = await apply(client.from(TABLE).select(TRIP_COLUMNS));
    if (error) return null;
    return data || [];
  } catch {
    return null;
  }
}

/** The one active trip, or null. */
export async function activeTrip(userId, client) {
  const rows = await selectTrips(client, (q) => q.eq('user_id', userId).eq('status', 'active').limit(1));
  return rows?.[0] || null;
}

/** The most recent COMPLETED trip. Abandoned trips are excluded on purpose — a
 *  half-finished trip is not a week worth repeating, and seeding from one would hand the
 *  shopper a list they had already walked away from. */
export async function lastCompletedTrip(userId, client) {
  const rows = await selectTrips(client, (q) =>
    q.eq('user_id', userId).eq('status', 'completed').order('completed_at', { ascending: false }).limit(1)
  );
  return rows?.[0] || null;
}

/** Completed trips finished since a timestamp — what the shopper actually BOUGHT in the
 *  window. The Haul reads these rather than writing bought items into `haul_scans`: that
 *  table's unit is a scan carrying a verdict tier, and `tierBucket` returns 'swap' for
 *  anything it does not recognise, so a tier-less bought row would render red on the
 *  distribution bar. Reading the trip needs no migration and cannot miscolour anything. */
export async function completedTripsSince(userId, sinceIso, client) {
  const rows = await selectTrips(client, (q) =>
    q.eq('user_id', userId).eq('status', 'completed').gte('completed_at', sinceIso)
      .order('completed_at', { ascending: false })
  );
  return rows || [];
}

/** Has this user ever had a trip at all? The adoption gate — see adoptLegacyList. */
async function hasAnyTrip(userId, client) {
  const rows = await selectTrips(client, (q) => q.eq('user_id', userId).limit(1));
  return rows === null ? null : rows.length > 0;
}

/* ═══════════════════════════ Writing ═══════════════════════════ */

export async function insertTrip(userId, { goal = null, intro = '', items = [] }, client) {
  if (!client) return null;
  try {
    const { data, error } = await client
      .from(TABLE)
      .insert({ id: randomUUID(), user_id: userId, status: 'active', goal, intro, items })
      .select(TRIP_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return data;
  } catch (err) {
    // The partial unique index rejects a second active trip. That is the guard working,
    // not an outage: the caller checks first and this is the concurrency backstop.
    console.warn('[kristy] trip not created:', err?.message || err);
    return null;
  }
}

export async function saveTripItems(tripId, list, client) {
  if (!client || !tripId) return null;
  try {
    const { data, error } = await client
      .from(TABLE)
      .update({
        goal: list?.goal || null,
        intro: list?.intro || '',
        items: Array.isArray(list?.items) ? list.items : [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', tripId)
      .select(TRIP_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return data;
  } catch (err) {
    console.warn('[kristy] trip not saved:', err?.message || err);
    return null;
  }
}

/**
 * Finish the active trip.
 *
 * COMPLETING IS AN EXPLICIT TAP, never the last checkbox. Auto-completing on all-checked
 * would thrash on an uncheck-and-recheck, and it would take the decision away at exactly
 * the moment the shopper is still standing in the store deciding.
 */
export async function completeTrip(userId, client) {
  const trip = await activeTrip(userId, client);
  if (!trip) return { ok: false, reason: 'no_active_trip' };
  try {
    const now = new Date().toISOString();
    const { data, error } = await client
      .from(TABLE)
      .update({ status: 'completed', completed_at: now, updated_at: now })
      .eq('id', trip.id)
      .select(TRIP_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, trip: data };
  } catch (err) {
    console.error('[kristy] trip not completed:', err?.message || err);
    return { ok: false, reason: 'error' };
  }
}

/**
 * "Start a new trip."
 *
 * ABANDON ONLY IF ANYTHING WAS ACTUALLY CHECKED. An untouched trip is reused rather than
 * archived — filing a no-op as a historical record would fill the archive with evidence of
 * nothing, and "same as last week" reads completed trips anyway so it would never surface.
 * A trip with even one checked row is real history and is kept, as `abandoned` rather than
 * `completed`: it did not finish, and marking it completed would lie to the Haul and let a
 * half-built list seed the next trip.
 */
export async function startNewTrip(userId, client) {
  const trip = await activeTrip(userId, client);
  if (!trip) return { ok: true, trip: await insertTrip(userId, {}, client), reused: false };

  const touched = (trip.items || []).some((i) => i.checked);
  if (!touched) {
    // Reuse: same row, emptied. No archive entry, no second active trip.
    const cleared = await saveTripItems(trip.id, { goal: trip.goal, intro: '', items: [] }, client);
    return { ok: true, trip: cleared || trip, reused: true };
  }

  try {
    const now = new Date().toISOString();
    await client.from(TABLE).update({ status: 'abandoned', updated_at: now }).eq('id', trip.id);
  } catch (err) {
    console.warn('[kristy] trip not abandoned:', err?.message || err);
    return { ok: false, reason: 'error' };
  }
  return { ok: true, trip: await insertTrip(userId, { goal: trip.goal }, client), reused: false };
}

/* ═══════════════════════════ Adoption ═══════════════════════════ */

/**
 * The migration path, and there is no backfill.
 *
 * A bulk `insert into trips select ... from shopping_lists` would be a data write in a
 * schema apply, which is the exact shape that granted the one live account two trials
 * through two different doors. It is also unnecessary: a shopper's list can become their
 * first trip the next time they open the app.
 *
 * GATED ON HAVING NO TRIPS AT ALL, not on having no ACTIVE trip. That distinction is the
 * whole safety of it — gating on the absence of an active trip would resurrect the adopted
 * list as a brand-new trip every single time the shopper completed one, because
 * `shopping_lists.list` keeps its items forever. Adoption is a once-per-shopper event and
 * "has this user ever had a trip" is the only condition that expresses that.
 */
export async function adoptLegacyList(userId, legacyList, client) {
  const items = Array.isArray(legacyList?.items) ? legacyList.items : [];
  if (!items.length) return null;
  const ever = await hasAnyTrip(userId, client);
  if (ever !== false) return null; // has trips already, or the table could not be read
  return insertTrip(userId, { goal: legacyList.goal || null, intro: legacyList.intro || '', items }, client);
}

/**
 * The active trip, adopting a pre-trips list on first read. Returns null when there is
 * genuinely nothing — which is the honest empty the cart renders its question for.
 */
export async function activeTripOrAdopt(userId, legacyList, client) {
  const live = await activeTrip(userId, client);
  if (live) return live;
  return adoptLegacyList(userId, legacyList, client);
}

/* ═══════════════════════════ Seeding the next trip ═══════════════════════════ */

// What a row loses on its way into a new trip. Each of these is a fact about the trip that
// just ended, not about the thing being bought again.
export function seedItem(item) {
  const {
    checked: _checked,
    tier: _tier,
    // A resolved offer is SPENT. Carrying `offered` forward would mean the swap could never
    // be raised again on a future trip; carrying the offer itself would re-ask a question
    // the shopper already answered. Both are wrong, so the whole set goes.
    offered: _offered,
    swapOffer: _swapOffer,
    offerId: _offerId,
    swapTo: _swapTo,
    // The card match is re-run — see below.
    carded: _carded,
    cardSlug: _cardSlug,
    cardSection: _cardSection,
    specifiedFrom: _specifiedFrom,
    needsFix: _needsFix,
    note: _note,
    id: _id,
    ...keep
  } = item;
  return { ...keep, id: randomUUID(), checked: false };
}

/**
 * Build next week's trip from the last completed one.
 *
 * THE CARD MATCH IS RE-RUN, and that is deliberate rather than lazy. Keeping `cardSlug`
 * would be cheaper and would freeze the list against a corpus that grows every week — an
 * item someone buys every single trip is exactly the one most likely to have had a card
 * authored for it since, and it would never see it. Re-matching also re-logs the misses,
 * which is correct rather than noisy: they bought it again, and frequency is precisely the
 * signal counter_gaps exists to capture.
 *
 * @param {object} p
 * @param {object} p.completed  the last completed trip
 * @param {Array}  p.scans      the week's haul scans
 */
export function buildNextTripList({ completed, scans = [] }) {
  const items = (completed?.items || []).map(seedItem);
  const present = new Set(items.map((i) => String(i.name).toLowerCase()));

  // `/api/haul/next`'s surviving behaviour. `missed` is gone as a concept: it meant "on the
  // cart and never checked off", and the whole trip now seeds UNCHECKED, so those rows are
  // already here. It only ever existed because there was no trip record to seed from.
  const cf = buildCarryForward({ scans, cartItems: completed?.items || [] });

  // Scanned, no objection, and not already a row — worth repeating.
  for (const k of cf.keep) {
    const key = k.name.toLowerCase();
    if (present.has(key)) continue;
    present.add(key);
    items.push({ id: randomUUID(), name: k.name, category: 'From your haul', checked: false, source: 'user' });
  }

  // She would have picked differently. A SUGGESTION, never preselected and never a
  // shoppable row — carrying a product she flagged into next week on the shopper's behalf
  // would be putting words in their mouth.
  const suggestions = cf.replace.map((r) => ({
    id: randomUUID(),
    name: `Swap out: ${r.name}`,
    category: 'From your haul',
    checked: false,
    source: 'swap',
    productName: r.name,
    why: 'Scanned last trip, and there’s a better pick. Open it for one.',
  }));

  const list = {
    goal: completed?.goal || null,
    intro: 'Same as last week, unchecked. Edit anything that changed.',
    items: [...suggestions, ...items],
  };
  return attachCards(sanitizeList(list) || list);
}
