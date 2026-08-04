// Did the flip to photo-first work — and did it work on the web, or only in Swift?
//
// One row per scan ATTEMPT. `scanned_products` is the catalog and only ever holds scans
// that produced a row, so every failure worth knowing about is invisible to it: the
// unreadable photo, the shopper who gave up on the third try, the barcode that missed.
// This is the funnel, and it is the only place those live.
//
// NOT JOINABLE TO THE CATALOG, ON PURPOSE. No barcode column, because a barcode plus a
// timestamp plus a tier, in sequence, is a shopping trip — the closest thing this schema
// could hold to a fingerprint. "Which products fail most" is already answered by
// `scanned_products.scan_count`, from a table with no timeline in it.
//
// NO IMAGE, EVER, INCLUDING IN LOGS. The label photo is held in memory
// (`multer.memoryStorage`), sent to the vision call, and dropped. Nothing here — and
// nothing on the scan path — writes it to disk, to a column, or to a log line. Retaining
// pictures of what people buy is a different privacy posture, a different storage bill
// and a different compliance surface than this product has or wants. If you are adding a
// debug line below, you have to delete this paragraph first.

import { supabase } from './supabase.js';

const str = (x) => String(x ?? '').trim();
const int = (x) => (Number.isFinite(Number(x)) ? Math.round(Number(x)) : null);
const bool = (x) => (typeof x === 'boolean' ? x : null);

// Closed vocabularies. An unrecognized value becomes null rather than being stored,
// because a column with a typo in it reads as a real category forever and nobody
// notices until they are dividing by it.
const PATHS = new Set(['barcode_store', 'barcode_off', 'photo', 'conflict', 'miss']);
const OUTCOMES = new Set(['verdict', 'no_ingredients', 'reshoot', 'unreadable', 'abandoned', 'error']);
const PANELS = new Set(['full', 'partial', 'none']);
const CATALOG = new Set(['new_row', 'repeat', 'not_retained']);
const CLIENTS = new Set(['web', 'ios']);

const oneOf = (set, x) => (set.has(str(x)) ? str(x) : null);

/**
 * Record one scan attempt. FIRE AND FORGET — never awaited by a caller, because a
 * verdict must never wait on, or fail because of, a metric. `scanEvents.test.js`
 * greps for `await recordScan` and fails if anyone changes that.
 *
 * The client is injectable for the same reason it is on `productStore`: so the
 * behaviour can be proven by a test rather than by reading this and trusting it.
 */
export async function recordScan({
  path,
  outcome,
  panel = null,
  attempt = 1,
  sugarInFrame = null,
  barcodeInFrame = null,
  tier = null,
  stamp = null,
  ingredientsRead = null,
  catalog = null,
  latencyMs = null,
  visionMs = null,
  client: clientName = 'web',
  clientVersion = null,
  db = supabase,
} = {}) {
  const row = {
    path: oneOf(PATHS, path),
    outcome: oneOf(OUTCOMES, outcome),
    panel: oneOf(PANELS, panel),
    // Attempt 1 is the first shot at this product. Floored at 1 so a client bug cannot
    // write a 0 that silently halves every re-shoot rate computed from this column.
    attempt: Math.max(1, int(attempt) ?? 1),
    sugar_in_frame: bool(sugarInFrame),
    barcode_in_frame: bool(barcodeInFrame),
    tier: str(tier) || null,
    stamp: bool(stamp),
    ingredients_read: int(ingredientsRead),
    catalog: oneOf(CATALOG, catalog),
    latency_ms: int(latencyMs),
    vision_ms: int(visionMs),
    client: oneOf(CLIENTS, clientName) || 'web',
    client_version: str(clientVersion).slice(0, 40) || null,
  };

  // path and outcome are the two columns every question is grouped by. A row missing
  // either is noise that would quietly skew every rate computed from the table.
  if (!row.path || !row.outcome) return { recorded: false, reason: 'path and outcome are required' };

  try {
    const { error } = await db.from('scan_events').insert(row);
    if (error) throw new Error(error.message);
    return { recorded: true };
  } catch (err) {
    // Unmigrated table or a transient failure. Logged, never surfaced, never thrown.
    console.warn('[kristy] scan event not recorded:', err?.message || err);
    return { recorded: false, reason: err?.message || 'error' };
  }
}

/**
 * How the funnel is going, grouped the way the questions are actually asked.
 * AGGREGATE: counts of scans, by path and by client. There is no identity in the table
 * to narrow by, so this cannot be pointed at a person.
 *
 * Never throws: an unmigrated table reports `available: false`.
 */
export async function scanFunnel({ db = supabase, days = 30 } = {}) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  try {
    const { data, error } = await db
      .from('scan_events')
      .select('path, outcome, panel, attempt, catalog, sugar_in_frame, latency_ms, vision_ms, client, client_version')
      .gte('created_at', since)
      .limit(5000);
    if (error) throw new Error(error.message);
    return { available: true, days, ...summarize(data || []) };
  } catch (err) {
    console.warn('[kristy] scan funnel unavailable:', err?.message || err);
    return { available: false, days, total: 0, byPath: {}, byOutcome: {}, byClient: {} };
  }
}

/** The arithmetic, separated so it can be tested without a database. */
export function summarize(rows) {
  const tally = (key) => rows.reduce((a, r) => ((a[r[key] ?? 'unknown'] = (a[r[key] ?? 'unknown'] || 0) + 1), a), {});
  const median = (xs) => {
    const v = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
    if (!v.length) return null;
    const m = Math.floor(v.length / 2);
    return v.length % 2 ? v[m] : Math.round((v[m - 1] + v[m]) / 2);
  };

  const photos = rows.filter((r) => r.path === 'photo');
  /* SCOPED TO PHOTO READS, AND THAT IS THE WHOLE POINT OF THE METRIC.
     A `barcode_store` hit is a `repeat` BY DEFINITION — it resolved because the row was
     already there. Counting those would drag the growth rate toward zero in exact
     proportion to how well the catalog is working, so a compounding database would
     report as a failing one. The question is "does a PHOTO read add something new", and
     only the photo path can answer it. */
  const retained = photos.filter((r) => r.catalog === 'new_row' || r.catalog === 'repeat');
  const sugarAsked = photos.filter((r) => r.sugar_in_frame !== null);

  return {
    total: rows.length,
    byPath: tally('path'),
    byOutcome: tally('outcome'),
    byClient: tally('client'),
    // Median latency per door — the number that says what a shopper waits for.
    latencyByPath: Object.fromEntries(
      [...new Set(rows.map((r) => r.path))].map((p) => [p, median(rows.filter((r) => r.path === p).map((r) => r.latency_ms))])
    ),
    photo: {
      total: photos.length,
      byPanel: photos.reduce((a, r) => ((a[r.panel ?? 'unknown'] = (a[r.panel ?? 'unknown'] || 0) + 1), a), {}),
      // THE VIABILITY NUMBER. Not "did anyone re-shoot" but how many tries it took —
      // a second attempt is friction, a fourth is a shopper about to give up.
      firstTry: photos.filter((r) => r.attempt === 1 && r.outcome === 'verdict').length,
      medianAttempts: median(photos.map((r) => r.attempt)),
      maxAttempts: photos.reduce((a, r) => Math.max(a, r.attempt || 1), 0),
      abandoned: photos.filter((r) => r.outcome === 'abandoned').length,
      medianVisionMs: median(photos.map((r) => r.vision_ms)),
      // Was the seal gate's number reachable from a frame composed for ingredients?
      sugarInFrameRate: sugarAsked.length
        ? Math.round((sugarAsked.filter((r) => r.sugar_in_frame).length / sugarAsked.length) * 100)
        : null,
    },
    // THE MOAT METRIC. Climbing means the catalog compounds; flat near zero means the
    // same twenty products getting rescanned forever.
    catalogGrowthRate: retained.length
      ? Math.round((retained.filter((r) => r.catalog === 'new_row').length / retained.length) * 100)
      : null,
  };
}
