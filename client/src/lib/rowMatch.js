/* ═══════════════ A SCANNED PRODUCT AGAINST A ROW ALREADY ON THE LIST ═══════════════

   In shop mode a scan is usually a thing the shopper WROTE DOWN and has now picked up. So
   the verdict sheet offers "Check off Wild-caught salmon" instead of adding a second row for
   the item they are standing there holding. Anything unmatched offers to join the section
   they are in.

   THE ASYMMETRY IS THE WHOLE DESIGN. A missed match costs one extra row the shopper can
   uncheck. A WRONG match ticks something they never bought, and the list is a record — it
   seeds next week's trip and feeds the shopping profile, so a false tick is a lie that
   propagates. This is therefore deliberately conservative and refuses far more than it
   could: same rule as `stateContradicts` on the list matcher, and for the same reason.

   IT MATCHES THE SHOPPER'S OWN WORDS AGAINST A PRODUCT NAME, WHICH IS NOT A JUDGEMENT.
   Nothing here reads a brand or makes a claim about one — it answers "is this the row you
   wrote", and the verdict itself comes from the scan pipeline exactly as it always does. */

const STOP = new Set([
  'the', 'and', 'or', 'with', 'without', 'a', 'an', 'of', 'in', 'on', 'for', 'no', 'free',
  'style', 'brand', 'organic', 'natural', 'fresh', 'whole', 'original', 'classic', 'value',
  'pack', 'size', 'count', 'oz', 'lb', 'lbs', 'g', 'kg', 'ml', 'l', 'ct',
]);

/** Content words: 3+ letters, lowercased, stop-words dropped. */
export function words(s) {
  return (String(s || '').toLowerCase().match(/[a-z][a-z-]{2,}/g) || []).filter((w) => !STOP.has(w));
}

/* A STATE WORD IS A SUBJECT. "Frozen broccoli" is not "broccoli" for the purpose of ticking
   a row off — a shopper with both on one list must not have the wrong one checked. Mirrors
   `stateContradicts` in the list matcher: both sides must name a state for this to veto. */
const STATES = ['frozen', 'canned', 'dried', 'fresh', 'raw', 'cooked', 'smoked', 'cured'];
const statesIn = (s) => STATES.filter((w) => new RegExp(`\\b${w}\\b`, 'i').test(String(s || '')));

function stateConflict(a, b) {
  const sa = statesIn(a);
  const sb = statesIn(b);
  if (!sa.length || !sb.length) return false;
  return !sa.some((s) => sb.includes(s));
}

/**
 * The row a scanned product is, or null.
 *
 * @param {string} productName  what the scan resolved to
 * @param {Array}  rows         cart rows
 * @param {string} [sectionId]  the section the shopper is standing in — preferred, never required
 */
export function matchRow(productName, rows = [], sectionId = null) {
  const p = words(productName);
  if (p.length === 0) return null;

  const candidates = rows.filter((r) => r && r.source !== 'swap' && r.name);
  const scored = [];

  for (const row of candidates) {
    const r = words(row.name);
    if (!r.length) continue;
    if (stateConflict(productName, row.name)) continue;

    const shared = r.filter((w) => p.includes(w));
    if (!shared.length) continue;

    /* EVERY CONTENT WORD OF THE ROW MUST APPEAR IN THE PRODUCT. A shopper writes "Greek
       yogurt" and scans "Fage Total 5% Greek Yogurt" — the row is contained in the product,
       which is the direction that actually happens. The reverse ("yogurt" written, "Greek
       yogurt raisins" scanned) is exactly the over-match this refuses. */
    const rowCovered = r.every((w) => p.includes(w));
    if (!rowCovered) continue;

    // A single 3-letter overlap is not evidence. Require real substance.
    const substance = shared.some((w) => w.length >= 4);
    if (!substance) continue;

    // A row in the section the shopper is standing in wins a tie: they are looking at it.
    scored.push({ row, score: shared.length * 10 + (row.cardSection === sectionId ? 5 : 0) + (row.checked ? 0 : 1) });
  }

  if (!scored.length) return null;
  scored.sort((a, b) => b.score - a.score);

  /* AN AMBIGUOUS MATCH IS NO MATCH. Two rows scoring identically means the product could be
     either, and picking one would tick the wrong item half the time. Adding a row is the
     honest fallback. */
  if (scored.length > 1 && scored[0].score === scored[1].score) return null;

  return scored[0].row;
}
