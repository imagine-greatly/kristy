// Scan-pipeline stress test — the make-or-break of the product, proven not assumed.
// Runs a realistic mix of US grocery products through the FULL scan → verdict path
// (extraction + engine, exactly what the routes run) and reports, per item:
//   • did we get ingredients?  • from which source (Open Food Facts vs vision)?
//   • did a coherent verdict come back?
// Then aggregates the real hit rate and buckets the failures.
//
//   node --use-system-ca scripts/scan.stresstest.js
// Requires ANTHROPIC_API_KEY (vision) + outbound network to Open Food Facts.
// No composeNote call — this measures EXTRACTION + engine coherence (the input
// pipeline), which is where scans succeed or die. Note wording is Step 2's concern.

import 'dotenv/config';
import { extractFromBarcode } from '../lib/scanExtract.js';
import { readLabelIngredients } from '../lib/labelVision.js';
import { evaluateIngredients, tokenizeIngredients, TIERS } from '../lib/verdictEngine.js';

const UA = { 'User-Agent': 'Kristy/1.0 (nutrition app)' };
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// OFF throttles rapid callers with an HTML challenge page (not JSON). Space calls
// out and retry once on a non-JSON body so throttling doesn't masquerade as "missing".
async function getJson(url, tries = 2) {
  for (let i = 0; i < tries; i++) {
    await delay(800);
    try {
      const r = await fetch(url, { headers: UA });
      const text = await r.text();
      if (text.trim().startsWith('{')) return JSON.parse(text);
    } catch {
      /* retry */
    }
    await delay(1500);
  }
  return null;
}

// A deliberate mix: common US brands likely in OFF, a few likely-missing/random,
// and a known found-but-no-ingredients case.
const BARCODES = [
  ['028400642255', 'Doritos Spicy Sweet Chili'],
  ['044000032029', 'Oreo'],
  ['016000275287', 'Cheerios'],
  ['038000138416', 'Pringles Original'],
  ['070847811169', 'Monster Energy'],
  ['037600106340', 'Skippy Peanut Butter'],
  ['051000012517', "Campbell's Tomato Soup"],
  ['030000010501', 'Quaker Oats'],
  ['052000328844', 'Gatorade'],
  ['021130126026', 'Store-brand water'],
  ['028400090728', 'Doritos (no ingredients in OFF)'],
  ['012000005015', 'Pepsi (US)'],
  ['049000006344', 'Coca-Cola (US)'],
  ['018627703679', 'Random/private label'],
  ['000000000000', 'Invalid barcode'],
];

// 4–5 photographed ingredient panels (real user uploads on OFF — curved, low-light,
// partial as they come). Stand-ins for the photo-of-label path.
const LABEL_CODES = ['028400642255', '016000275287', '044000032029', '038000138416', '070847811169'];

const pad = (s, n) => String(s).slice(0, n).padEnd(n);

// Coarse heuristic for a likely matcher miss: a long processed ingredient list that
// nonetheless flags NOTHING (tier 'approved'). Real clean products are short; a long
// list scoring approved is a smell that the matcher didn't parse the concerns.
function suspiciousApproved(tier, ingredients) {
  const n = tokenizeIngredients(ingredients).length;
  return tier === 'approved' && n >= 8;
}

const rows = [];

async function panelImageUrl(code) {
  const d = await getJson(
    `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=image_ingredients_url`
  );
  return d?.product?.image_ingredients_url || null;
}

// Confirm a not-found is genuine OFF absence (not a throttle hiccup).
async function trulyMissing(code) {
  const d = await getJson(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=status`);
  return !d || d.status !== 1;
}

console.log('\n═══ BARCODE PATHS ═══');
console.log(pad('barcode', 14), pad('product', 26), pad('found', 6), pad('source', 7), pad('tier', 18), 'flags/tokens');
for (const [code, label] of BARCODES) {
  await delay(500); // space OFF calls
  try {
    const ex = await extractFromBarcode(code);
    if (!ex.found || !ex.ingredients.trim()) {
      let reason = !ex.found ? 'missing' : 'no-ingredients';
      if (reason === 'missing' && !(await trulyMissing(code))) reason = 'throttled?'; // don't blame OFF coverage for a hiccup
      rows.push({ code, label, kind: 'barcode', ok: false, reason, source: ex.source });
      console.log(pad(code, 14), pad(label, 26), pad(ex.found, 6), pad(ex.source, 7), pad('—', 18), reason);
      continue;
    }
    const ev = evaluateIngredients(ex.ingredients);
    const coherent = TIERS.includes(ev.tier);
    const susp = suspiciousApproved(ev.tier, ex.ingredients);
    rows.push({ code, label, kind: 'barcode', ok: coherent, source: ex.source, tier: ev.tier, flags: ev.matched.length, tokens: tokenizeIngredients(ex.ingredients).length, suspicious: susp });
    console.log(
      pad(code, 14), pad(label, 26), pad('yes', 6), pad(ex.source, 7), pad(ev.tier + (susp ? ' (?)' : ''), 18),
      `${ev.matched.length}/${tokenizeIngredients(ex.ingredients).length}`
    );
  } catch (e) {
    rows.push({ code, label, kind: 'barcode', ok: false, reason: 'error:' + e.message });
    console.log(pad(code, 14), pad(label, 26), 'ERROR', e.message);
  }
}

console.log('\n═══ PHOTO-OF-LABEL PATHS (vision) ═══');
console.log(pad('barcode', 14), pad('read', 6), pad('#ing', 5), pad('tier', 18), 'flags/tokens');
for (const code of LABEL_CODES) {
  try {
    const url = await panelImageUrl(code);
    if (!url) { rows.push({ code, kind: 'label', ok: false, reason: 'no-panel-image' }); console.log(pad(code, 14), 'no panel image'); continue; }
    const ir = await fetch(url, { headers: UA });
    const buf = Buffer.from(await ir.arrayBuffer());
    const { ingredients } = await readLabelIngredients({
      base64: buf.toString('base64'),
      mediaType: (ir.headers.get('content-type') || 'image/jpeg').split(';')[0],
    });
    if (!ingredients.length) { rows.push({ code, kind: 'label', ok: false, reason: 'vision-empty' }); console.log(pad(code, 14), pad('no', 6), 0, 'vision returned nothing'); continue; }
    const joined = ingredients.join(', ');
    const ev = evaluateIngredients(joined);
    rows.push({ code, kind: 'label', ok: TIERS.includes(ev.tier), source: 'vision', tier: ev.tier, flags: ev.matched.length, tokens: ingredients.length, ingCount: ingredients.length });
    console.log(pad(code, 14), pad('yes', 6), pad(ingredients.length, 5), pad(ev.tier, 18), `${ev.matched.length}/${ingredients.length}`);
  } catch (e) {
    rows.push({ code, kind: 'label', ok: false, reason: 'error:' + e.message });
    console.log(pad(code, 14), 'ERROR', e.message);
  }
}

/* ── Aggregate ── */
const total = rows.length;
const ok = rows.filter((r) => r.ok);
const bySource = { off: rows.filter((r) => r.source === 'off').length, vision: rows.filter((r) => r.source === 'vision').length };
const missing = rows.filter((r) => r.reason === 'missing');
const noIng = rows.filter((r) => r.reason === 'no-ingredients');
const throttled = rows.filter((r) => r.reason === 'throttled?');
const visionEmpty = rows.filter((r) => r.reason === 'vision-empty' || r.reason === 'no-panel-image');
const suspicious = rows.filter((r) => r.suspicious);

console.log('\n═══ SUMMARY ═══');
console.log(`  Total products run: ${total}`);
console.log(`  Coherent verdict (ingredients + valid tier): ${ok.length}/${total} = ${Math.round((ok.length / total) * 100)}%`);
console.log(`  Source: Open Food Facts=${bySource.off}  vision=${bySource.vision}`);
console.log(`  FAIL — missing barcode (not in OFF):        ${missing.length}  [${missing.map((r) => r.code).join(', ')}]`);
console.log(`  FAIL — found but no ingredients:            ${noIng.length}  [${noIng.map((r) => r.code).join(', ')}]`);
console.log(`  NOISE — throttled (not a real miss):        ${throttled.length}  [${throttled.map((r) => r.code).join(', ')}]`);
console.log(`  FAIL — vision returned nothing:             ${visionEmpty.length}  [${visionEmpty.map((r) => r.code).join(', ')}]`);
console.log(`  SMELL — long list scored 'approved' (?):    ${suspicious.length}  [${suspicious.map((r) => r.code).join(', ')}]`);
console.log('');
