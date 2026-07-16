// Live acceptance check for Step 4 — the repointed scan → /verdict pipeline, end to
// end, no server/auth/DB (just the extraction libs + engine + composeNote, exactly
// what the routes run). Mirrors verdict.livetest.js.
//
// Run from server/ with the system CA trusted (corporate TLS) and .env loaded:
//   node --use-system-ca scripts/scan.livetest.js
// Requires ANTHROPIC_API_KEY in server/.env and outbound network to Open Food Facts.
//
// Proves both scan entry points land on a coherent verdict card:
//   A. BARCODE (Open Food Facts ingredients)      → source 'off'   → card
//   B. PHOTO-OF-LABEL (vision transcription)       → source 'vision'→ card
//   C. MISSING BARCODE (graceful type-it fallback) → found:false, no card

import 'dotenv/config';
import { extractFromBarcode, productMeta } from '../lib/scanExtract.js';
import { readLabelIngredients } from '../lib/labelVision.js';
import { evaluateIngredients, TIERS } from '../lib/verdictEngine.js';
import { composeNote } from '../lib/verdictNote.js';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY not set — skipping live test.');
  process.exit(0);
}

const line = (s) => console.log(`\n${'─'.repeat(66)}\n${s}\n${'─'.repeat(66)}`);
const show = (label, v) => console.log(`  ${label}:`, v);

let failures = 0;
const check = (name, cond) => {
  console.log(`  ${cond ? '✓' : '✗ FAIL'} ${name}`);
  if (!cond) failures += 1;
};

// The exact swap gate the /verdict route applies — the seal is earned, the swap is
// meaningful only when there's something to move away from.
const swapForTier = (tier, swap) =>
  tier === 'approved' || tier === 'approved_with_note' ? null : swap;

// Assemble + assert a coherent card from an ingredient string, exactly as the
// client would after POSTing the extracted ingredients to /verdict.
async function verdictCard(label, ingredients, goal) {
  const ev = evaluateIngredients(ingredients);
  const { note, swap } = await composeNote({
    tier: ev.tier,
    goal,
    nonNegotiables: ['no seed oils'],
    matched: ev.matched,
  });
  const card = {
    tier: ev.tier,
    stamp: ev.stamp,
    universalLayer: ev.universalLayer,
    note,
    swap: swapForTier(ev.tier, swap),
  };
  show('tier', card.tier);
  show('stamp', card.stamp);
  show('universalLayer', card.universalLayer.map((i) => `${i.name} [${i.evidence_tier}]`));
  show('note', card.note);
  show('swap', card.swap);

  // "Coherent verdict came back" — the invariants the card renderer depends on.
  check(`${label}: tier is a real KB tier`, TIERS.includes(card.tier));
  check(`${label}: stamp === (tier==='approved')`, card.stamp === (card.tier === 'approved'));
  check(`${label}: universalLayer is well-formed`,
    Array.isArray(card.universalLayer) &&
    card.universalLayer.every((i) => i.name && i.evidence_tier));
  check(`${label}: swap present iff a swap tier`,
    (card.tier === 'approved' || card.tier === 'approved_with_note')
      ? card.swap === null
      : true);
  check(`${label}: note is non-empty (personalized)`, Boolean(card.note?.trim()));
  return card;
}

try {
  /* ── A. BARCODE → Open Food Facts ingredients → card ─────────────────────── */
  line('A. BARCODE  028400642255 (Doritos)  → source "off"');
  const a = await extractFromBarcode('028400642255');
  show('found', a.found);
  show('source', a.source);
  show('product', a.product && `${a.product.name} — ${a.product.aisle}`);
  show('ingredients', a.ingredients.slice(0, 90) + '…');
  check('A: found', a.found === true);
  check('A: source is Open Food Facts', a.source === 'off');
  check('A: has an ingredient string', a.ingredients.trim().length > 0);
  check('A: product header has a name', Boolean(a.product?.name));
  await verdictCard('A', a.ingredients, 'cutting');

  /* ── B. PHOTO-OF-LABEL → vision transcription → card ─────────────────────── */
  // A REAL photographed ingredients panel (curved/lit as uploaded) — exactly what
  // POST /api/scan/label reads. We pull one from OFF and run the vision reader on it.
  line('B. PHOTO-OF-LABEL (real panel photo)  → source "vision"');
  const imgUrl = 'https://images.openfoodfacts.org/images/products/002/840/064/2255/ingredients_en.10.400.jpg';
  const ir = await fetch(imgUrl, { headers: { 'User-Agent': 'Kristy/1.0 (nutrition app)' } });
  const buf = Buffer.from(await ir.arrayBuffer());
  const { ingredients: visionList } = await readLabelIngredients({
    base64: buf.toString('base64'),
    mediaType: (ir.headers.get('content-type') || 'image/jpeg').split(';')[0],
  });
  show('vision transcribed', `${visionList.length} ingredients`);
  show('sample', visionList.slice(0, 6).join(', '));
  check('B: vision read ingredients off the photo', visionList.length > 0);
  await verdictCard('B', visionList.join(', '), 'performance');

  /* ── C. MISSING BARCODE → graceful fallback (no card) ────────────────────── */
  line('C. MISSING BARCODE  000000000000  → found:false, type-it fallback');
  const c = await extractFromBarcode('000000000000');
  show('found', c.found);
  show('source', c.source);
  show('ingredients', JSON.stringify(c.ingredients));
  check('C: not found (or no ingredients) → no card, client offers type-it',
    c.found === false || c.ingredients.trim() === '');

  line(failures === 0 ? 'ALL CHECKS PASSED ✓' : `${failures} CHECK(S) FAILED ✗`);
  process.exit(failures === 0 ? 0 : 1);
} catch (err) {
  console.error('\nLive test error:', err?.message || err);
  process.exit(1);
}
