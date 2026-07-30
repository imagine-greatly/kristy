// Kristy's voice on the list — flag once, offer better, respect the choice.
//
// THE PRINCIPLE: the shopper knows themselves better than Kristy ever will. The list
// is THEIRS. She sharpens it; she never dictates it. Two things have to be true at
// once, and they are not in tension:
//   • Their authority is absolute. A user-added item is never removed, struck, or
//     replaced. They are buying it. That is final.
//   • She still speaks up. One brief offer of a better version, then silence.
// That is what a good friend does: tells you the truth once, then lets you live.
//
// The failure mode this exists to prevent is the one that gets nutrition apps
// deleted — the same item flagged again on every load, which reads as nagging no
// matter how gently it is worded. So an offer fires ONCE, on the row, and the row
// carries `offered` forever after. Declining it is a preference learned, not a thing
// to try again next week.
//
// CLAIM LOCK. An offer names a grocery and nothing else. There is no free text here:
// the line is a fixed template, the alternative is an authored NAME (the same class
// of value as a perimeter `cart_pick`), and no model is anywhere near this path. It
// therefore cannot carry a health claim, a statistic, or a price.
//
// NO BRAND CLAIMS, which is why the table matches GENERIC food words only. Kristy has
// no read on "Lucky Charms" from the name alone, and inventing one would be both a
// fabricated claim and a negative statement about a named product. The honest answer
// is that a barcode is how she reads a branded box — a scanned row already carries a
// real tier from the verdict engine, and the cart's own "find a better pick" action
// is grounded in that. A typed brand name simply stays, unremarked.

/* ── The offer table ───────────────────────────────────────────────────────────
   Generic categories only. `better` is a grocery NAME, chosen to match an authored
   PICK wherever one exists so a taken swap inherits that pick's claim-safe reason.
   `id` is stable and is what a decline is recorded against, so re-wording a row here
   never resurrects an offer somebody already turned down. */
export const SWAP_OFFERS = [
  // Generic words only, and checked against real brand names. "cola" was here and it
  // matched Coca-Cola; "wonder bread" and "frosted anything" were here and they
  // matched Wonder and Frosted Flakes. Each one would have made Kristy comment on a
  // named product from its name alone, which is the exact line she does not cross.
  { id: 'soda', match: /\b(sodas?|pop|soft ?drinks?|energy ?drinks?)\b/i, better: 'Sparkling water' },
  { id: 'candy', match: /\b(candy|candy ?bars?|chocolate ?bars?|gummies|gummy ?bears?|gummy ?worms?)\b/i, better: 'Dark chocolate' },
  { id: 'cereal', match: /\b(cereals?|sugary cereal|kids'? cereal)\b/i, better: 'Steel-cut oats' },
  { id: 'instant_oats', match: /\b(instant oatmeal|oatmeal packets?|flavou?red oatmeal)\b/i, better: 'Steel-cut oats' },
  { id: 'white_bread', match: /\b(white bread|sandwich bread)\b/i, better: 'Sprouted whole-grain bread' },
  { id: 'chips', match: /\b(chips|crisps|cheese ?puffs)\b/i, better: 'Popcorn kernels' },
  { id: 'fruit_snacks', match: /\b(fruit ?snacks?|fruit roll ?ups?|juice ?boxes?|fruit juice)\b/i, better: 'Whole fruit, any two kinds' },
  { id: 'deli_meat', match: /\b(hot ?dogs?|lunch ?meat|luncheon meat|deli meat|bologna|salami)\b/i, better: 'Roast chicken, sliced at the counter' },
  { id: 'margarine', match: /\b(margarine|buttery spread|vegetable spread)\b/i, better: 'Grass-fed butter' },
  // Named without the pick's "— dark bottle" qualifier: an em-dash reads as an aside
  // mid-sentence, and the name still resolves to the same authored pick.
  { id: 'seed_oil', match: /\b(vegetable oil|canola|soybean oil|corn oil|shortening)\b/i, better: 'Extra-virgin olive oil' },
  { id: 'creamer', match: /\b(coffee creamer|non-?dairy creamer|creamer)\b/i, better: 'Half-and-half' },
  { id: 'flavored_yogurt', match: /\b(flavou?red yogurt|yogurt (cups?|tubes?)|fruit yogurt)\b/i, better: 'Plain whole-milk Greek yogurt' },
  { id: 'white_rice', match: /\bwhite rice\b/i, better: 'Brown or jasmine rice' },
];

/* ── The line ──────────────────────────────────────────────────────────────────
   One sentence. It opens by confirming the item STAYS, because that is the whole
   promise, and closes with a door held open. No paragraph about sugar or dyes, no
   guilt, no first person, no em-dash aside. A friend mentioning, not a parent
   scolding — and short enough that it never reads as a lecture. */
export function offerLine(itemName, better) {
  return `${String(itemName).trim()} stays. ${better} if you want the same thing cleaner.`;
}

const declinedSet = (declined) =>
  new Set((Array.isArray(declined) ? declined : []).map((d) => String(d)));

/**
 * The grocery NAMES a set of declined offer ids resolves to.
 *
 * Lives here, beside the table, so list generation can suppress the item as well as
 * the note. Silencing only the offer while still generating "Brown or jasmine rice"
 * for somebody who said keep my white rice is the same suggestion arriving by a side
 * door, and it reads as an app that did not listen.
 */
export function declinedItemNames(declined = []) {
  const ids = declinedSet(declined);
  return SWAP_OFFERS.filter((r) => ids.has(r.id)).map((r) => r.better);
}

/**
 * The offer for one item, or null. Null is the common and correct answer: most
 * groceries are simply groceries, and silence is the default.
 *
 * @returns {{ offerId:string, swapTo:string, swapOffer:string } | null}
 */
export function offerForItem(name, { declined = [] } = {}) {
  const clean = String(name || '').trim();
  if (!clean) return null;
  const dead = declinedSet(declined);
  for (const row of SWAP_OFFERS) {
    if (!row.match.test(clean)) continue;
    // Turned down before → never offered again. Respect over repetition.
    if (dead.has(row.id)) return null;
    // Already the better thing. Offering somebody the item they are holding is the
    // clearest possible signal that nobody is reading the list.
    if (clean.toLowerCase() === row.better.toLowerCase()) return null;
    return { offerId: row.id, swapTo: row.better, swapOffer: offerLine(clean, row.better) };
  }
  return null;
}

/**
 * Attach offers to a list, ONCE per row.
 *
 * Idempotent by construction: a row is evaluated only while `offered` is unset, and
 * the flag is stamped whether or not an offer was actually found. So a second save,
 * a reload, a rebuild and a goal switch all leave the list exactly as it stands —
 * which is the difference between Kristy having an opinion and Kristy nagging.
 *
 * Rows Kristy authored herself (`template`) are skipped: she chose those, so
 * second-guessing them would be arguing with her own cart.
 */
export function attachOffers(list, { declined = [] } = {}) {
  if (!list || !Array.isArray(list.items)) return list;
  let touched = false;
  const items = list.items.map((it) => {
    if (it.offered || it.source === 'template' || it.source === 'swap') return it;
    touched = true;
    const offer = offerForItem(it.name, { declined });
    // `offered` is stamped either way. A row that earned no comment must never be
    // re-examined later under a table that has since grown.
    return offer
      ? { ...it, offered: true, offerId: offer.offerId, swapTo: offer.swapTo, swapOffer: offer.swapOffer }
      : { ...it, offered: true };
  });
  return touched ? { ...list, items } : list;
}
