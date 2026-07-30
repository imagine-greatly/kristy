// Acceptance — the data-growth loops, AGAINST A REAL DATABASE.
//
//   node --use-system-ca scripts/growthLoops.livetest.js
//
// The unit tests prove the loops are wired correctly. They cannot prove the loops are
// RUNNING, because a fake client always answers and a real one needs a migration, a
// service-role key, and a deployed server. That gap is the whole point of Block 2:
// "confirm it compounds in PRODUCTION, not just in tests." This script is how that
// confirmation is actually made, and it is the only thing that can make it.
//
// Point it at whatever environment you want to check by setting SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY in the server env. Run it against production after the
// first real shoppers arrive, and again periodically — the number that should be
// climbing is `fromVision`.
//
// It WRITES a probe row to scanned_products (a reserved barcode that is not a real
// product) and deletes it again, so it proves the write path rather than assuming it.
// It never writes to counter_gaps: that table only ever fills from real questions,
// and seeding it with fakes would corrupt the exact ranking it exists to produce.

import 'dotenv/config';
import { supabase } from '../lib/supabase.js';
import { lookupProduct, retainProduct, coverageStats } from '../lib/productStore.js';
import { gapFeed } from '../lib/counterGaps.js';

let fails = 0;
const ck = (n, c) => {
  console.log(`  ${c ? '✓' : '✗ FAIL'} ${n}`);
  if (!c) fails++;
};

// A barcode in the GS1 "restricted distribution" range, so it can never collide with
// a real product a shopper might scan.
const PROBE = '0200000000000';

console.log('\n═══ Connection ═══');
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('  ✗ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — nothing to verify.');
  console.log('    This script is meaningless without a real database. Set them and re-run.\n');
  process.exit(1);
}
console.log(`  → ${process.env.SUPABASE_URL}`);

/* ═══════════════ 1. The tables exist ═══════════════ */
console.log('\n═══ Migrations ═══');

// A REAL select, not a head+count. PostgREST answers a head request against a table
// that does not exist with 204, no error and a null count — so the head form reports a
// missing table as a healthy empty one, which is the exact false reassurance this
// script exists to rule out.
async function tableReachable(name) {
  const { error } = await supabase.from(name).select('*').limit(1);
  if (error) console.log(`    ${name}: ${error.message}`);
  return !error;
}

const productsOk = await tableReachable('scanned_products');
const gapsOk = await tableReachable('counter_gaps');
ck('scanned_products is migrated and reachable', productsOk);
ck('counter_gaps is migrated and reachable', gapsOk);

/* ═══════════════ 2. The write path fires ═══════════════ */
console.log('\n═══ Capture — does a resolved scan actually land? ═══');

if (productsOk) {
  await supabase.from('scanned_products').delete().eq('barcode', PROBE);

  const wrote = await retainProduct({
    barcode: PROBE,
    name: 'Growth-loop probe (not a real product)',
    ingredients: 'Probe ingredient one, probe ingredient two',
    source: 'vision',
    panel: 'full',
  });
  ck('a vision read writes to the live table', wrote.retained === true && wrote.created === true);

  /* ═══════════════ 3. The gap closes — the whole moat, in one assertion ═══════════════ */
  const resolved = await lookupProduct(PROBE);
  ck('the same barcode now resolves from our own store', resolved?.source === 'store');
  ck('the ingredient text round-tripped intact',
    resolved?.ingredients === 'Probe ingredient one, probe ingredient two');
  ck('provenance survived the round trip', resolved?.originalSource === 'vision');

  const repeat = await retainProduct({
    barcode: PROBE,
    ingredients: 'Probe ingredient one, probe ingredient two',
    source: 'vision',
    panel: 'full',
  });
  ck('a repeat sighting updates rather than duplicating', repeat.created === false);

  // Products, not people — read the live row back and check it carries no identity.
  const { data: liveRow } = await supabase
    .from('scanned_products')
    .select('*')
    .eq('barcode', PROBE)
    .maybeSingle();
  const columns = Object.keys(liveRow || {}).join(' ');
  ck('the live product row carries no identifying column',
    !/user|account|session|device|\bip\b/i.test(columns));

  await supabase.from('scanned_products').delete().eq('barcode', PROBE);
  const { data: gone } = await supabase
    .from('scanned_products')
    .select('barcode')
    .eq('barcode', PROBE)
    .maybeSingle();
  ck('the probe row cleaned itself up', !gone);
}

/* ═══════════════ 4. The moat, counted ═══════════════ */
console.log('\n═══ Coverage — is it compounding? ═══');

const stats = await coverageStats();
ck('coverage is readable', stats.available === true);
console.log(`    products learned   ${stats.total}`);
console.log(`    from Open Food Facts ${stats.fromOff}   (coverage we borrow)`);
console.log(`    from vision reads    ${stats.fromVision}   (coverage we OWN — the moat)`);
console.log(`    low confidence       ${stats.lowConfidence}   (the curation queue)`);
console.log(`    learned in ${stats.recentDays}d       ${stats.learnedRecently}`);

if (stats.available && stats.total === 0) {
  console.log('\n    NOTE: zero products. Either no scans have happened in this');
  console.log('    environment yet, or the write path is not firing. Re-run after a');
  console.log('    real scan — this is the check that distinguishes the two.');
}

/* ═══════════════ 5. The counter's backlog ═══════════════ */
console.log('\n═══ Counter gaps — what shoppers asked that the KB missed ═══');

const feed = await gapFeed({ limit: 15 });
ck('the gap feed is readable', feed.unavailable !== true);
if (feed.rows.length === 0) {
  console.log('    (nothing logged yet — expected until real questions arrive)');
} else {
  for (const r of feed.rows) {
    const tag = r.outcome === 'miss' ? 'MISS' : 'weak';
    const reached = r.top_entry_id ? ` → ${r.top_entry_id}` : '';
    console.log(`    ${String(r.times_asked).padStart(4)}×  ${tag}  ${r.question}${reached}`);
  }
}

console.log(`\n${fails === 0 ? '✓ all checks passed' : `✗ ${fails} check(s) failed`}\n`);
process.exit(fails === 0 ? 0 : 1);
