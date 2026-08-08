// Shared cart-edit primitives — the deterministic half of the conversational editor.
//
// The model is only ever allowed to PROPOSE grocery names + sections + a one-line
// summary (see listCompose.js). Everything that actually changes the cart happens
// here, in plain code: we add, we remove, we sanitize. That's what makes the editor
// claim-safe by construction — a shopping list is grocery NAMES ONLY, and no model
// output is ever written to the cart unfiltered.
//
// Lives in lib/ because two callers need it: POST /api/list/compose (the cart's own
// editor) and the chat route (the docked composer, which is the same editor reached
// by talking). One implementation, so the two paths can't drift apart.

import { randomUUID } from 'node:crypto';
import { annotateFromPicks } from './list.js';

const rid = () => randomUUID();

// The verdict tiers a scanned cart row may carry. Display-only on the list — the
// verdict engine remains the only thing that assigns one, and a tier here can never
// restore a seal or move a score.
export const CART_TIERS = [
  'approved',
  'approved_with_note',
  'use_with_intention',
  'swap_recommended',
  'skip',
];

// Sources a cart row may claim. 'scan' is a product the shopper scanned and kept;
// 'swap' is one of Kristy's haul callouts; 'user' is a manual add; 'template' is
// hers from the goal blend.
const SOURCES = ['template', 'swap', 'user', 'scan', 'imported'];

export function sanitizeList(list) {
  if (!list || !Array.isArray(list.items)) return null;
  const items = list.items
    .slice(0, 200)
    .map((it) => ({
      id: String(it.id || randomUUID()).slice(0, 64),
      name: String(it.name || '').slice(0, 140),
      category: String(it.category || 'Added').slice(0, 60),
      checked: !!it.checked,
      // BOUGHT-VS-SKIPPED, CARRIED ACROSS THE TRIP BOUNDARY. `checked` is about the trip
      // in hand; `boughtLast` is what the row did on the trip before it, stamped by the
      // seeder. An item that goes on the list every week and is never ticked is the most
      // useful thing the record knows, and it was being thrown away at seed time.
      //
      // THIS ENTRY IS WHY THE OTHER THREE SITES WORK. The whitelist is strict, so a field
      // it does not name is dropped on the first save — and `buildNextTripList` sanitizes
      // its own output, so without this line the seeder would erase its own stamp before
      // returning it, and every test that never saves would still pass.
      //
      // TRI-STATE, DELIBERATELY: `true` bought, `false` on the list and skipped, ABSENT
      // never seeded at all. A row the shopper typed this morning has not skipped
      // anything, and collapsing it into `false` would invent a week that never happened.
      // Hence the typeof guard rather than the truthy spread used below.
      ...(typeof it.boughtLast === 'boolean' ? { boughtLast: it.boughtLast } : {}),
      source: SOURCES.includes(it.source) ? it.source : 'user',
      ...(it.productName ? { productName: String(it.productName).slice(0, 140) } : {}),
      // A scanned row carries the verdict it came in with, so the cart keeps showing
      // Kristy's read on it without re-asking. Enum-guarded: a client can't invent one.
      ...(CART_TIERS.includes(it.tier) ? { tier: it.tier } : {}),
      // Set by the Perimeter refinement ("Olive oil" → "Fresh, dark-bottle EVOO").
      ...(it.refined ? { refined: true } : {}),
      // Kristy's one-line reasoning for this pick — rendered inline on the row, so it
      // has to survive the round-trip when the shopper checks something off.
      ...(it.why ? { why: String(it.why).slice(0, 200) } : {}),
      // The perimeter KB entry this pick's judgment came from. Enum-free but id-shaped,
      // and only ever used to READ a KB entry — never to write one.
      ...(it.perimeterId ? { perimeterId: String(it.perimeterId).slice(0, 64) } : {}),
      ...(it.alt ? { alt: String(it.alt).slice(0, 160) } : {}),

      /* ── The counter card this item matched (listMatch.js) ──
         `cardSlug` IS NOT `perimeterId`, and they are kept apart on purpose even though a
         curated card's slug and a KB entry's id are the same string. `perimeterId` means
         "the authored PICK on this row cites this entry"; `cardSlug` means "what the shopper
         wrote matched this card". One is a citation, the other a retrieval hit, they render
         differently — an authored `why` versus the card's `do` line — and a generated card
         (`gen_*`) has a slug but no KB entry at all, so the namespaces are not even fully
         shared. Collapsing them would make an authored line indistinguishable from a match. */
      ...(it.cardSlug ? { cardSlug: String(it.cardSlug).slice(0, 64) } : {}),
      // Denormalized from the card at match time so a COMPLETED trip keeps the walking order
      // it was actually shopped in, even after the corpus is refiled or the card retired.
      ...(it.cardSection ? { cardSection: String(it.cardSection).slice(0, 32) } : {}),
      // MATCH ONCE. The same discipline as `offered`: stamped on every row the matcher
      // inspects, including the ones that matched nothing, so a reload can never re-run
      // retrieval over a row or log its miss a second time. It has to survive the round trip
      // or the gap log becomes a count of how often the app was opened.
      ...(it.carded ? { carded: true } : {}),
      // ── Imported-list fields (Block 8). These carry the AUTONOMY guarantees, so
      // they have to survive the save or the promise breaks on reload: what the
      // shopper originally wrote, a swap we only OFFERED, and a row we couldn't read
      // and refuse to guess at.
      ...(it.specifiedFrom ? { specifiedFrom: String(it.specifiedFrom).slice(0, 140) } : {}),
      ...(it.swapOffer ? { swapOffer: String(it.swapOffer).slice(0, 200) } : {}),
      // FLAG ONCE. `offered` is the record that this row has already had Kristy's one
      // comment, so a reload, a save or a rebuild can never produce a second. It has
      // to survive the round-trip or the whole no-nagging promise breaks on refresh.
      ...(it.offered ? { offered: true } : {}),
      ...(it.offerId ? { offerId: String(it.offerId).slice(0, 40) } : {}),
      ...(it.swapTo ? { swapTo: String(it.swapTo).slice(0, 140) } : {}),
      ...(it.needsFix ? { needsFix: true } : {}),
      ...(it.note ? { note: String(it.note).slice(0, 200) } : {}),
    }))
    .filter((it) => it.name);
  return {
    goal: list.goal ? String(list.goal).slice(0, 60) : null,
    intro: list.intro ? String(list.intro).slice(0, 400) : '',
    items,
  };
}

/* THE SPINE. A row the SHOPPER put on the list is theirs, and the model does not get
   to take it off because the instruction was vague. "Make this healthier" must never
   quietly delete the thing they are actually buying — that is the failure that turns
   a coach into a parent.

   But "remove the soda" has to work, so the protection is not absolute: their own row
   comes off when their own words name it. Kristy's rows (template) stay removable by
   a loose instruction, because those were her suggestion in the first place. */
const REMOVE_STOPWORDS = new Set(
  'and or the a an of my our some more less any all with for from that this those these plain fresh frozen whole real organic'.split(' ')
);

const words = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

/* ── A CATEGORY IS A NAME ──────────────────────────────────────────────────────────
   The check below required a word from the ROW to appear in the instruction, and
   "Wild-caught salmon fillets" shares nothing with "no seafood". So the protection
   refused the shopper's own explicit exclusion: measured 2026-08-05, the same model
   output that removed both seafood rows from a template list removed NEITHER from a
   typed one, and the summary said "Seafood out." either way. Refinement worked on
   Kristy's list and silently no-opped on the shopper's, which is the reverse of what
   anyone would predict and the wrong way round for the list people care about.

   The table is EXPLICIT AND SMALL, widened deliberately — the same discipline as
   `IMPERATIVE_VERBS` and listMatch's state words. It exists so a VAGUE instruction
   still names nothing: "make this healthier" carries no category, so it reaches no
   owned row, so the spine rule is untouched. A category earns an entry only if a
   shopper would type it as an exclusion AND its membership is readable off a label.

   THE ALTERNATIVE, AND WHY IT LOST. The cheaper fix is to detect an exclusion SHAPE
   ("no X", "without X", "won't eat X") and trust the model's `remove` whenever one is
   present. That needs no vocabulary and generalizes to "no nightshades" for free — but
   it hands the spine rule to the model, and "no more junk in this cart" is an exclusion
   shape too. An explicit table fails in the safe direction instead: an unnamed category
   declines the removal, and (c) below makes a declined removal VISIBLE rather than
   silent, so the cost is one honest sentence instead of a row the shopper loses.

   `fish` and `shellfish` both resolve to the whole seafood category on purpose. A
   shopper who types "no fish" and gets their shrimp back has been answered on a
   technicality. `meat` deliberately does NOT reach seafood — someone who means no
   animal flesh at all says so, and under-removing is now honest where over-removing is
   never recoverable.

   `unless` is a VETO, never a score, and it is the reason the table is safe to have:
   `milk` and `butter` are dairy words that appear in things that are not dairy, so
   without it "no dairy" takes the oat milk and the peanut butter off a list the shopper
   typed by hand. Same shape as `stateContradicts` in listMatch.js. */
const CATEGORIES = [
  {
    names: ['seafood', 'fish', 'fishes', 'shellfish'],
    members: [
      'fish', 'seafood', 'salmon', 'tuna', 'skipjack', 'shrimp', 'shrimps', 'prawn', 'prawns',
      'cod', 'tilapia', 'halibut', 'trout', 'sardine', 'sardines', 'anchovy', 'anchovies',
      'mackerel', 'herring', 'crab', 'lobster', 'scallop', 'scallops', 'mussel', 'mussels',
      'clam', 'clams', 'oyster', 'oysters', 'squid', 'calamari', 'pollock', 'snapper',
      'catfish', 'swordfish',
    ],
  },
  {
    names: ['dairy'],
    members: [
      'milk', 'cheese', 'cheddar', 'mozzarella', 'parmesan', 'ricotta', 'cottage', 'yogurt',
      'yoghurt', 'skyr', 'kefir', 'butter', 'ghee', 'cream', 'creamer', 'buttermilk', 'clabber',
    ],
    // "Oat milk", "almond milk", "coconut cream", "peanut butter", "apple butter", "cocoa butter".
    unless: ['oat', 'oats', 'almond', 'cashew', 'soy', 'coconut', 'peanut', 'nut', 'apple', 'cocoa', 'hemp', 'rice'],
  },
  {
    names: ['meat', 'meats'],
    members: [
      'beef', 'steak', 'brisket', 'pork', 'bacon', 'ham', 'prosciutto', 'guanciale', 'pancetta',
      'lamb', 'mutton', 'veal', 'venison', 'chicken', 'turkey', 'duck', 'sausage', 'salami',
      'pepperoni', 'chorizo', 'liver',
    ],
    unless: ['plant', 'vegan', 'mock', 'meatless', 'tofu', 'tempeh', 'veggie'],
  },
  {
    names: ['pork'],
    members: ['pork', 'bacon', 'ham', 'prosciutto', 'guanciale', 'pancetta', 'chorizo', 'lard'],
  },
  {
    names: ['egg', 'eggs'],
    members: ['egg', 'eggs'],
  },
  {
    names: ['nuts', 'nut'],
    members: [
      'nuts', 'almond', 'almonds', 'cashew', 'cashews', 'walnut', 'walnuts', 'pecan', 'pecans',
      'pistachio', 'pistachios', 'hazelnut', 'hazelnuts', 'macadamia', 'peanut', 'peanuts',
    ],
  },
  {
    names: ['gluten', 'wheat'],
    members: [
      'bread', 'sourdough', 'pasta', 'flour', 'tortilla', 'tortillas', 'bagel', 'bagels',
      'cracker', 'crackers', 'couscous', 'barley', 'rye', 'wheat', 'farro', 'bulgur', 'seitan',
    ],
    unless: ['free', 'gf'],
  },
];

/** Exported for the test that keeps the table explicit — Sets, so membership is exact. */
export const EXCLUSION_CATEGORIES = CATEGORIES.map((c) => ({
  names: c.names,
  members: new Set(c.members),
  unless: new Set(c.unless || []),
}));

/* Does the instruction name a CATEGORY this row belongs to? Triggers are matched as whole
   words, so "no meatballs" cannot fire the meat category off a prefix.

   Note this only ever widens what counts as "named" for a removal the MODEL ALREADY
   PROPOSED, against a list it was given. It cannot originate a removal, so "add more
   seafood" — where nothing is proposed for removal — never reaches it. */
function namedByCategory(instructionWords, rowWords) {
  for (const cat of EXCLUSION_CATEGORIES) {
    if (!cat.names.some((n) => instructionWords.has(n))) continue;
    if (rowWords.some((w) => cat.unless.has(w))) continue; // the veto
    if (rowWords.some((w) => cat.members.has(w))) return true;
  }
  return false;
}

function namedInInstruction(instruction, name) {
  const instrWords = words(instruction);
  if (!instrWords.length) return false;
  const rowWords = words(name);
  // Their own words naming the item itself. Unchanged.
  const text = ` ${instrWords.join(' ')} `;
  if (rowWords.some((w) => w.length >= 3 && !REMOVE_STOPWORDS.has(w) && text.includes(` ${w}`))) {
    return true;
  }
  return namedByCategory(new Set(instrWords), rowWords);
}

/* One predicate for "does this proposed removal name this row", used by the edit AND by
   the outcome report below. Two copies of a fuzzy name match is how a summary and a list
   end up disagreeing about what happened, which is the defect (c) exists to close. */
export function matchesRemoval(name, proposedRemoval) {
  const n = String(name ?? '').toLowerCase();
  const r = String(proposedRemoval ?? '').toLowerCase();
  if (!n || !r) return false;
  return n === r || n.includes(r) || r.includes(n);
}

// Apply a claim-safe compose result (add/remove by name) to the current cart,
// deterministically — the model only proposed names + sections; we do the edit.
export function applyCompose(current, { add = [], remove = [] }, { instruction = '' } = {}) {
  const items = Array.isArray(current?.items) ? [...current.items] : [];
  const rm = remove.map((r) => String(r).toLowerCase()).filter(Boolean);
  const dropped = (name) => rm.some((r) => matchesRemoval(name, r));
  // Never remove a haul-swap callout via a text instruction; those are Kristy's notes,
  // not shopping rows. A scanned row is the shopper's own decision — also protected.
  // The shopper's own adds and their imported list are protected the same way, unless
  // the instruction names them.
  const OWNED = new Set(['user', 'imported']);
  const kept = items.filter((it) => {
    if (it.source === 'swap' || it.source === 'scan') return true;
    if (!dropped(it.name)) return true;
    return OWNED.has(it.source) && !namedInInstruction(instruction, it.name);
  });
  const present = new Set(kept.map((it) => it.name.toLowerCase()));
  const added = [];
  for (const a of add) {
    const key = String(a.name).toLowerCase();
    if (!key || present.has(key)) continue;
    present.add(key);
    added.push({ id: rid(), name: a.name, category: a.section || 'Pantry', checked: false, source: 'template' });
  }
  // A row with no reason is a checkbox. The reasons are LOOKED UP from the authored
  // picks, never generated — see annotateFromPicks.
  return { ...current, items: [...kept, ...annotateFromPicks(added)] };
}

/* A fresh cart from one sentence ("three high-protein dinners for four"). Her haul
   callouts and anything already scanned into the trip lead; the rest is replaced.

   AND IT REFUSES TO REPLACE SOMETHING WITH NOTHING. Measured 2026-08-05: "no seafood"
   routed here (see cartCommandMode), the composer correctly proposed nothing to add —
   there is nothing to add — and a nine-row list came back with zero rows. A build with
   no items is not a cart; it is a deletion wearing a build's name, and there is no
   instruction for which emptying the shopper's list is the right reading.

   This is the STRUCTURAL half of that fix and it is deliberately redundant with the
   routing half. A phrasing gate is one gate, and this repo has twice shipped two gates
   that were each meant to hold the same rule and quietly disagreed. The intro is left
   alone too: stamping a summary that describes a build which did not happen is defect
   (c) arriving by a side door. */
export function buildCart(current, add = [], { goal, summary } = {}) {
  const existing = current?.items || [];
  const usable = (add || []).filter((a) => String(a?.name ?? '').trim());
  if (!usable.length && existing.length) return current;
  const carried = existing.filter((i) => i.source === 'swap' || i.source === 'scan');
  const seen = new Set(carried.map((i) => String(i.name).toLowerCase()));
  const items = [];
  for (const a of add) {
    const key = String(a.name).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    items.push({ id: rid(), name: a.name, category: a.section || 'Pantry', checked: false, source: 'template' });
  }
  return {
    goal: goal || null,
    intro: summary || current?.intro || '',
    items: [...carried, ...annotateFromPicks(items)],
  };
}

/* ═══════════════ THE SUMMARY MAY NOT OUTRUN THE EDIT ═══════════════
   The line the shopper reads came straight from the model, and the model is told what was
   PROPOSED, never what was applied. So when the protection above declined a removal, she
   said "Seafood out." with the seafood still on the list — measured 2026-08-05, on the
   shopper's own rows, which is the case the protection makes commonest.

   `describeCartResult` in routes/chat.js was written for exactly this, and its comment is
   right: "It reads the FINAL list, so it can only describe rows that really exist — it
   never claims an item it didn't add." But it was reached as `summary || describeCartResult(...)`,
   so it ran only when the model returned nothing at all. The honest path was the rare one.

   These two functions are how all three doors get the same answer. `composeOutcome` reads
   the two LISTS — before and after — so it cannot be fooled by what the model intended,
   and `reconcileSummary` discards her line whenever a proposal was declined.

   IT DISCARDS RATHER THAN EDITS, deliberately. The model was never told which rows are
   protected, so it cannot have been right about the refusal by accident, and rewriting a
   sentence in her voice by regex is how a voice becomes a template. A whole line, replaced
   by a true one, beats a half-true one every time. */

const lower = (s) => String(s ?? '').toLowerCase();
const joinNames = (arr) =>
  arr.length > 1 ? `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}` : arr[0] || '';
const sentence = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/**
 * What an edit ACTUALLY did. Read off the two lists, never off the proposal.
 * `refused` is the number the summary must not contradict: removals the model asked for,
 * against rows that were really there, which are still there afterwards.
 */
export function composeOutcome(before, after, proposed = {}) {
  const beforeNames = (before?.items || []).map((i) => String(i.name));
  const afterNames = (after?.items || []).map((i) => String(i.name));
  const afterSet = new Set(afterNames.map(lower));
  const beforeSet = new Set(beforeNames.map(lower));

  const removed = beforeNames.filter((n) => !afterSet.has(lower(n)));
  const added = afterNames.filter((n) => !beforeSet.has(lower(n)));

  const refused = [];
  for (const r of proposed.remove || []) {
    const hit = beforeNames.filter((n) => matchesRemoval(n, r));
    if (!hit.length) continue; // it named nothing on the list; there was nothing to refuse
    const survivors = hit.filter((n) => afterSet.has(lower(n)));
    refused.push(...survivors);
  }

  return {
    removed,
    added,
    refused: [...new Set(refused)],
    changed: removed.length > 0 || added.length > 0,
    beforeCount: beforeNames.length,
    afterCount: afterNames.length,
  };
}

// Rows the shopper added come off with a tap, and saying so once is what makes a declined
// removal read as their authority rather than as a failure.
const OWNERSHIP = 'Rows you added come off with a tap.';

/** Her line, or a true one. Never a line that claims something the list refused. */
export function reconcileSummary(summary, outcome, mode = 'edit') {
  if (!outcome) return summary;

  if (outcome.refused.length) {
    const kept = joinNames(outcome.refused.slice(0, 3).map(lower));
    const kicker = outcome.removed.length
      ? `${sentence(joinNames(outcome.removed.slice(0, 3).map(lower)))} off.`
      : 'Nothing came off.';
    return `${kicker} ${sentence(kept)} stayed. ${OWNERSHIP}`;
  }

  // A build that had nothing to build. The list was kept (see buildCart), so a summary
  // describing a new cart is describing something that did not happen.
  if (mode === 'build' && !outcome.changed && outcome.beforeCount > 0) {
    return 'Nothing in that to build a cart from. The list is as it was.';
  }

  return summary;
}

// NOTHING IS WITHHELD HERE ANY MORE. `LIST_COMPOSE_UPSELL` lived here — "building a cart
// from one sentence is part of a membership" — and it went when composing became free
// behind a daily budget (LIST_COMPOSE_FREE_LIMIT in lib/rateLimit.js). A guest could
// already do this through the public composer, so selling it to a signed-in shopper meant
// signing up bought them LESS. The list is free, building it included, on both the cart's
// own editor and the docked composer in chat.
