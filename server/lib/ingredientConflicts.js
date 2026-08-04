// Where Open Food Facts disagrees with itself — the sample that decides the rule.
//
// A record can carry a live, contributor-editable `ingredients_text_en` AND a raw
// `ingredients_text_en_imported` from the source database. When those two would score
// to different tiers, the product has two answers and Kristy refuses to pick one (see
// `sameVerdict` in scanExtract.js). That refusal costs the shopper a photo, so it has
// to be rare — and the only way to know whether it is rare, and whether the imported
// field is reliably the correct one, is to collect the disagreements as they happen.
//
// TWENTY PRODUCTS IS NOT A RULE. Measured on the first sample the imported field was
// right 2 times out of 2, which is exactly the sample size that talks people into
// shipping a preference they cannot defend. This table is how that number grows on
// real scans instead.
//
// PRODUCTS, NOT PEOPLE — the same discipline as `scanned_products` and `counter_gaps`.
// A row records a barcode, two ingredient strings and the tiers they scored. There is
// no user key, no IP and no session, so there is nothing here to narrow to a shopper.
// The strings are label text off a package, not anything a person typed.

import { supabase } from './supabase.js';

const TABLE = 'ingredient_conflicts';
const str = (x) => String(x ?? '').trim();

// Ingredient lists are long and the value here is the disagreement, not the full text.
// Capped so one pathological record cannot bloat the table.
const MAX_TEXT = 2000;

/**
 * Record one live-vs-imported disagreement. Fire-and-forget by design: this is a
 * research asset and must never delay or break the scan the shopper is waiting on.
 *
 * Idempotent per barcode — a product that disagrees disagrees on every scan, and
 * 500 rows for one ketchup teaches nothing that one row plus a counter doesn't.
 *
 * The client is injectable for the same reason it is on `productStore`: so the
 * behaviour can be proven by a test rather than by reading this and trusting it.
 */
export async function recordConflict({
  barcode = null,
  name = null,
  brand = null,
  live,
  imported,
  tiers = [],
  client = supabase,
} = {}) {
  const code = str(barcode) || null;
  const liveText = str(live).slice(0, MAX_TEXT);
  const importedText = str(imported).slice(0, MAX_TEXT);
  if (!code || !liveText || !importedText) return { logged: false, reason: 'nothing to log' };

  try {
    const { data: existing } = await client
      .from(TABLE)
      .select('id, seen_count')
      .eq('barcode', code)
      .maybeSingle();

    if (existing) {
      const { error } = await client
        .from(TABLE)
        .update({ seen_count: (existing.seen_count || 1) + 1, last_seen: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) throw new Error(error.message);
      return { logged: true, created: false };
    }

    const { error } = await client.from(TABLE).insert({
      barcode: code,
      name,
      brand,
      live_text: liveText,
      imported_text: importedText,
      live_tier: str(tiers[0]) || null,
      imported_tier: str(tiers[1]) || null,
    });
    if (error) throw new Error(error.message);
    return { logged: true, created: true };
  } catch (err) {
    // Unmigrated table or a transient failure. Logged to the console so the signal is
    // not lost entirely while the migration is outstanding, never surfaced.
    console.warn(
      `[kristy] ingredient conflict ${code} (${str(tiers[0])} vs ${str(tiers[1])}) not persisted:`,
      err?.message || err
    );
    return { logged: false, reason: err?.message || 'error' };
  }
}

/**
 * The disagreements, most-repeated first — the backlog that decides whether the
 * imported field should be preferred outright. AGGREGATE: products and how often each
 * one has been seen to disagree, across everyone.
 *
 * Never throws: an unmigrated table reports `available: false` rather than breaking
 * whatever is reading it.
 */
export async function conflictFeed({ client = supabase, limit = 50 } = {}) {
  try {
    const { data, error } = await client
      .from(TABLE)
      .select('barcode, name, brand, live_tier, imported_tier, seen_count, first_seen, last_seen')
      .order('seen_count', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return { available: true, conflicts: data || [] };
  } catch (err) {
    console.warn('[kristy] conflict feed unavailable:', err?.message || err);
    return { available: false, conflicts: [] };
  }
}
