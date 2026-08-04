// Kristy's own product dataset — the compounding asset.
//
// Every resolved scan is retained here, whether it came from Open Food Facts or off
// a photographed label. The vision reads are the valuable half: they are, by
// definition, the products no barcode database had. Retaining one means the NEXT
// shopper to scan that barcode resolves instantly from Kristy's own store instead
// of missing again — so the coverage gap closes itself from real usage rather than
// from an enterprise contract.
//
// Three disciplines, all load-bearing:
//
//   PRODUCTS, NOT PEOPLE. Nothing here records who scanned anything. The per-user
//   record already exists in haul_scans; mixing identity into the catalog would turn
//   a shared asset into a surveillance log for no product benefit.
//
//   A BAD PHOTO MAY NOT POISON A GOOD PRODUCT. A partial vision read is stored at
//   low confidence and can never overwrite a high-confidence entry — it only bumps
//   the sighting counters. Confidence travels with the row so later curation can
//   see which entries were guesses.
//
//   THE STORE HOLDS INGREDIENTS, NEVER JUDGMENTS. A cached row feeds the same
//   engine + KB + claim lock as a fresh OFF hit; the tier is recomputed from the
//   ingredients on every scan. The `tier` column is provenance for future curation,
//   never a shortcut around the engine.

import { createHash } from 'node:crypto';
import { supabase } from './supabase.js';

const TABLE = 'scanned_products';
const str = (x) => String(x ?? '').trim();

/** Stable identity for a label-only read (no barcode to key on). */
export function productHash(name, ingredients) {
  const basis = `${str(name).toLowerCase()}|${str(ingredients).toLowerCase()}`;
  return createHash('sha256').update(basis).digest('hex').slice(0, 32);
}

/** Confidence for a retained read. A partial panel is the only 'low' case. */
export function confidenceFor({ source, panel }) {
  if (source === 'off') return 'high'; // a database record, not an OCR guess
  return panel === 'partial' ? 'low' : 'high';
}

/**
 * Look a barcode up in Kristy's own store — the FIRST resolver, ahead of OFF.
 * Returns the same shape the OFF path produces so callers are agnostic about
 * which layer answered.
 *
 * Never throws: an unmigrated table or a database blip must degrade to "not in
 * our store" and let OFF answer, exactly like a network failure would.
 *
 * The client is injectable so the self-heal loop can be proven by BEHAVIOUR rather
 * than by reading the source and trusting it. It defaults to the real one, so every
 * caller in the app is untouched.
 *
 * @returns {Promise<null | { found:true, source:'store', product:object,
 *   ingredients:string, confidence:string, originalSource:string }>}
 */
export async function lookupProduct(barcode, { client = supabase } = {}) {
  const code = str(barcode);
  if (!code) return null;
  try {
    const { data, error } = await client
      .from(TABLE)
      .select('barcode, name, brand, ingredients, source, confidence, tier')
      .eq('barcode', code)
      .maybeSingle();
    if (error || !data || !str(data.ingredients)) return null;
    return {
      found: true,
      source: 'store',
      product: {
        barcode: code,
        name: data.name || null,
        brand: data.brand || null,
        image: null,
        aisle: '',
      },
      ingredients: data.ingredients,
      confidence: data.confidence || 'high',
      // Where the ingredient text originally came from, kept for honesty in logs
      // and for later curation ("this row is an OCR read, not an OFF record").
      originalSource: data.source || 'unknown',
    };
  } catch (err) {
    console.warn('[kristy] product store lookup skipped:', err?.message || err);
    return null;
  }
}

/* How much a row is trusted, by where it came from AND how complete it was.
   Source matters as much as legibility: an Open Food Facts record is a database
   entry that many people can see and correct, while a vision read is one shopper's
   photo. So a vision read — even a perfectly legible one — may NOT overwrite an OFF
   row. That's the "don't let one bad read poison a known-good product" rule, and it
   also closes the tampering path: since the label endpoint accepts a client-supplied
   barcode, without this someone could photograph one product and file it under
   another product's code.

     off    / full     3   a shared, correctable database record
     vision / full     2   a legible panel photo — good, but one person's read
     vision / partial  1   candidate data; may be missing the tail of the list

   Equal rank replaces, so a fresh vision read supersedes an older vision read
   (products get reformulated) but never an OFF record. */
function trustRank(source, confidence) {
  if (source === 'off' || source === 'store') return 3;
  return confidence === 'low' ? 1 : 2;
}

/**
 * Retain a resolved scan. Idempotent per identity: a repeat sighting bumps the
 * counters, and a BETTER read replaces a worse one — never the other way round.
 *
 * Fire-and-forget by design. Retention is a background asset, so a failure here
 * must never disturb the verdict the shopper is waiting on.
 */
export async function retainProduct({
  barcode = null,
  name = null,
  brand = null,
  ingredients,
  source,
  panel = 'full',
  tier = null,
  client = supabase,
}) {
  const text = str(ingredients);
  if (!text || !source) return { retained: false, reason: 'nothing to retain' };

  const code = str(barcode) || null;
  // Barcode-keyed when we have one; otherwise hashed so a label-only read still
  // de-dupes against its own repeats.
  const hash = code ? null : productHash(name, text);
  const confidence = confidenceFor({ source, panel });

  try {
    const key = code ? { barcode: code } : { product_hash: hash };
    const { data: existing } = await client
      .from(TABLE)
      .select('id, ingredients, source, confidence, scan_count')
      .match(key)
      .maybeSingle();

    if (!existing) {
      const { error } = await client.from(TABLE).insert({
        barcode: code,
        product_hash: hash,
        name,
        brand,
        ingredients: text,
        source,
        confidence,
        tier,
      });
      if (error) throw new Error(error.message);
      return { retained: true, created: true, confidence };
    }

    const incomingBeats =
      trustRank(source, confidence) >=
      trustRank(existing.source || 'off', existing.confidence || 'high');
    const patch = {
      last_seen: new Date().toISOString(),
      scan_count: (existing.scan_count || 1) + 1,
    };

    if (incomingBeats) {
      // Same or better standing → this read is authoritative.
      Object.assign(patch, { ingredients: text, source, confidence });
      if (name) patch.name = name;
      if (brand) patch.brand = brand;
      if (tier) patch.tier = tier;
    }
    // Otherwise: a weaker read against a better-sourced row. Count the sighting,
    // keep the good data. One cropped photo — or one photo filed under the wrong
    // barcode — can't degrade a product every other shopper resolves correctly.

    const { error } = await client.from(TABLE).update(patch).eq('id', existing.id);
    if (error) throw new Error(error.message);
    return { retained: true, created: false, replaced: incomingBeats, confidence };
  } catch (err) {
    // Unmigrated table / transient failure. Logged, never surfaced.
    console.warn('[kristy] product retain skipped:', err?.message || err);
    return { retained: false, reason: err?.message || 'error' };
  }
}

/**
 * How big the moat actually is — the compounding asset, counted.
 *
 * The number that matters is `fromVision`: products a barcode database could not
 * answer for, which one shopper photographed once and every shopper after them
 * resolves instantly. `fromOff` is coverage we borrow; `fromVision` is coverage we
 * own, and watching the second grow is the only way to know the loop is running in
 * production rather than merely being wired up correctly.
 *
 * AGGREGATE ONLY — counts of products, never a row about a person. There is nothing
 * here that could be narrowed to one shopper because the table it reads holds no
 * identity to narrow by.
 *
 * Never throws: an unmigrated table reports `available: false` rather than breaking
 * the dashboard that displays it.
 */
export async function coverageStats({ client = supabase, recentDays = 30 } = {}) {
  const since = new Date(Date.now() - recentDays * 24 * 60 * 60 * 1000).toISOString();

  // A head+count query against a table that DOES NOT EXIST comes back 204 with no
  // error and a null count — indistinguishable, on the error channel, from success.
  // Reporting that as `available: true, total: 0` would read as "the loop is wired,
  // nobody has scanned yet" when the truth is "this can never capture anything",
  // which is the single most expensive thing this metric could get wrong. A table
  // that exists always answers with a number, so a null count IS the missing table.
  const tally = async (apply) => {
    let q = client.from(TABLE).select('id', { count: 'exact', head: true });
    if (apply) q = apply(q);
    const { count, error } = await q;
    if (error) throw new Error(error.message);
    if (count == null) throw new Error(`${TABLE} returned no count — table not migrated?`);
    return count;
  };

  try {
    const [total, fromOff, fromVision, lowConfidence, learnedRecently] = await Promise.all([
      tally(null),
      tally((q) => q.eq('source', 'off')),
      tally((q) => q.eq('source', 'vision')),
      // Rows built from a partial panel. Worth surfacing: they are the curation
      // queue, the entries most likely to be missing the tail of a list.
      tally((q) => q.eq('confidence', 'low')),
      tally((q) => q.gte('first_seen', since)),
    ]);
    return { available: true, total, fromOff, fromVision, lowConfidence, learnedRecently, recentDays };
  } catch (err) {
    console.warn('[kristy] coverage stats unavailable:', err?.message || err);
    return {
      available: false,
      total: 0,
      fromOff: 0,
      fromVision: 0,
      lowConfidence: 0,
      learnedRecently: 0,
      recentDays,
    };
  }
}

/**
 * The most-scanned products in the catalog — what shoppers actually pick up.
 *
 * AGGREGATE: a product and how many times it has been sighted, across everyone.
 * `scan_count` is a property of the PRODUCT, not of a person; there is no way to
 * narrow it to a shopper because the table holds no identity to narrow by.
 *
 * Internal curation only. Never rendered to a shopper — "popular" is not a health
 * signal and Kristy does not rank food by what sells.
 */
export async function topScannedProducts({ client = supabase, limit = 20 } = {}) {
  try {
    const { data, error } = await client
      .from(TABLE)
      .select('name, brand, source, confidence, tier, scan_count, last_seen')
      .order('scan_count', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return data || [];
  } catch (err) {
    console.warn('[kristy] top products unavailable:', err?.message || err);
    return [];
  }
}

/**
 * Stamp the verdict tier onto an already-retained product.
 *
 * UPDATE ONLY — deliberately never inserts. The barcode association arrives from
 * the client on the /verdict call, and an update-only path means a tampering
 * client can at worst write a wrong tier onto a row that already exists; it can
 * never introduce a product or its ingredients. The tier itself is computed
 * server-side by the engine, and every scan recomputes it, so this column can
 * never become a wrong verdict.
 */
export async function stampTier(barcode, tier) {
  const code = str(barcode);
  if (!code || !str(tier)) return;
  try {
    await supabase.from(TABLE).update({ tier }).eq('barcode', code);
  } catch (err) {
    console.warn('[kristy] product tier stamp skipped:', err?.message || err);
  }
}

/**
 * The curation queue — rows built from a partial vision read, most-hit first.
 *
 * `coverageStats` reports HOW MANY low-confidence rows exist; this reports WHICH, which
 * is the difference between knowing there is a backlog and being able to work it.
 * Ordered by `scan_count` on purpose: the shaky row twelve shoppers hit is worth acting
 * on and the one nobody has hit since it was written is not.
 *
 * THE ACTION IS DELETE, NOT EDIT. A hand-typed ingredient list is a vision read with
 * worse provenance and no confidence signal — it arrives as `high` because a person
 * wrote it, carries no record of who or when, and can never be corrected by the loop
 * that produced it. Deleting the row costs one shopper one photo and puts the product
 * back in front of the self-heal path, which is the thing that actually improves.
 * Promotion needs no action at all: `trustRank` already lets a later `vision/full` read
 * replace a `vision/partial` one, so most of this queue drains itself.
 *
 * AGGREGATE: products and how often each was seen. The table holds no identity to
 * narrow by. Never throws — an unmigrated table reports an empty queue.
 */
export async function lowConfidenceRows({ client = supabase, limit = 40 } = {}) {
  try {
    const { data, error } = await client
      .from(TABLE)
      .select('barcode, name, brand, ingredients, source, scan_count, first_seen, last_seen')
      .eq('confidence', 'low')
      .order('scan_count', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return { available: true, rows: data || [] };
  } catch (err) {
    console.warn('[kristy] curation queue unavailable:', err?.message || err);
    return { available: false, rows: [] };
  }
}
