// Barcode normalization + validation — the honesty guard on the scan front door.
//
// Why this exists: a scan that resolves to the WRONG product is far worse than a
// scan that resolves to nothing. "I don't have this one" costs a photo; a confident
// card for a product the shopper isn't holding costs the whole relationship.
//
// Two real failure modes this closes:
//   1. A misdecoded symbol. ZXing checksums most symbologies, but a partial/blurred
//      read can still surface a digit string that is not a valid GTIN. Looking that
//      up is a lottery ticket on someone else's product — so we refuse to send it.
//   2. UPC-E vs UPC-A. A US shelf is full of 8-digit UPC-E codes (small packages).
//      Open Food Facts is keyed on the EXPANDED form, so the compressed digits
//      either miss or, worse, collide with an unrelated code. We expand before
//      lookup rather than guessing at the API.
//
// Nothing here decides what a product IS — it only decides whether the digits we
// hold are a real GTIN worth asking about.

/** GTIN mod-10 check digit over the payload (every digit except the trailing check). */
function checkDigit(payload) {
  let sum = 0;
  // Weights run 3,1,3,1… from the RIGHT of the payload, for every GTIN length.
  for (let i = payload.length - 1, w = 3; i >= 0; i--, w = w === 3 ? 1 : 3) {
    sum += Number(payload[i]) * w;
  }
  return (10 - (sum % 10)) % 10;
}

/** Does this all-digit code carry a valid GTIN check digit? */
export function hasValidCheckDigit(code) {
  const c = String(code || '');
  if (!/^\d+$/.test(c) || c.length < 8) return false;
  return checkDigit(c.slice(0, -1)) === Number(c[c.length - 1]);
}

/**
 * Expand a UPC-E (8-digit, zero-suppressed) code to its UPC-A (12-digit) form.
 * Returns '' when `code` isn't a well-formed UPC-E. The expansion table is the
 * GS1 standard, keyed on the last data digit.
 */
export function expandUpcE(code) {
  const c = String(code || '');
  if (!/^\d{8}$/.test(c)) return '';
  const ns = c[0];
  if (ns !== '0' && ns !== '1') return ''; // only number systems 0/1 are UPC-E
  const d = c.slice(1, 7); // six data digits
  const check = c[7];
  const last = d[5];

  let mid;
  if (last === '0' || last === '1' || last === '2') {
    mid = `${d[0]}${d[1]}${last}0000${d[2]}${d[3]}${d[4]}`;
  } else if (last === '3') {
    mid = `${d[0]}${d[1]}${d[2]}00000${d[3]}${d[4]}`;
  } else if (last === '4') {
    mid = `${d[0]}${d[1]}${d[2]}${d[3]}00000${d[4]}`;
  } else {
    mid = `${d[0]}${d[1]}${d[2]}${d[3]}${d[4]}0000${last}`;
  }
  return `${ns}${mid}${check}`;
}

/**
 * Normalize a decoded symbol into a GTIN we're willing to look up.
 * @returns {{ ok:true, code:string } | { ok:false, reason:'empty'|'shape'|'checksum' }}
 *
 * `ok:false` is NOT an error state — it's the honest "I couldn't read that" that
 * routes the shopper to the label photo. It must never fall through to a lookup.
 */
export function normalizeBarcode(raw) {
  const c = String(raw || '').trim().replace(/[\s-]/g, '');
  if (!c) return { ok: false, reason: 'empty' };
  if (!/^\d+$/.test(c)) return { ok: false, reason: 'shape' };

  // UPC-E → UPC-A, so the lookup key matches how the databases are indexed.
  if (c.length === 8) {
    const expanded = expandUpcE(c);
    if (expanded && hasValidCheckDigit(expanded)) return { ok: true, code: expanded };
    // Not a UPC-E; may still be a legitimate EAN-8.
    if (hasValidCheckDigit(c)) return { ok: true, code: c };
    return { ok: false, reason: 'checksum' };
  }

  if (c.length !== 12 && c.length !== 13 && c.length !== 14) return { ok: false, reason: 'shape' };
  if (!hasValidCheckDigit(c)) return { ok: false, reason: 'checksum' };
  return { ok: true, code: c };
}
