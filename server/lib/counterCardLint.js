// The counter card's shape rules, as executable checks.
//
// WHY THIS IS A MODULE AND NOT A SCRIPT: Pass 3 generates cards for questions the KB
// cannot answer, and a generated card renders in exactly the same component as a curated
// one. A bar that only ran over the authored corpus would hold for 80 cards and then let
// every card after them through. `lintCard` takes a CARD — curated or generated — so the
// generation path can refuse to persist one that fails, and the test suite can hold the
// authored corpus to the identical rules.
//
// Every rule here was a defect found by hand on 2026-07-31 and written down so it cannot
// recur silently. The reasoning for each is in docs/do-lines-review.md.

/* ═══════════════════════════ Words ═══════════════════════════ */

// Hyphenated compounds and possessives are ONE word: "grass-finished" and "farmers’-market"
// are single things a shopper looks for, and splitting them would make the 14-word bar
// punish precision.
export const words = (s) => (String(s || '').match(/[\w’'-]+/g) || []).length;

/* ═══════════════════════════ The tier note ═══════════════════════════ */

// THE TIER NOTE IS AUTHORED, NOT DEFINED. It must say why THIS card's call carries THIS
// tier — not what the tier means in general.
//
// The whole corpus failed this. 75 of 80 curated cards fell back to the KB's rubric, so a
// reader tapping into a card about picking a cantaloupe was told "Strong scientific
// consensus, major health organization classification, or regulatory action in multiple
// countries". The tier chip is the one piece of the card that says what KIND of claim it
// is, and pointing all of them at four generic definitions retires that signal entirely.
//
// The rubric belongs in the PROMPT, as guidance for choosing a tier. It may never appear
// in output.
import perimeterKb from '../kristy_perimeter_kb.json' with { type: 'json' };

const RUBRICS = Object.values(perimeterKb.evidence_tiers || {});

const normText = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9']+/g, ' ')
    .trim();

// Six consecutive words shared with a rubric is a quotation, not a coincidence — it also
// catches the paraphrase that keeps the rubric's spine and swaps a word or two.
const SHARED_RUN = 6;

export function echoesRubric(note) {
  const n = normText(note);
  if (!n) return false;
  for (const rubric of RUBRICS) {
    const r = normText(rubric);
    if (!r) continue;
    if (r.includes(n) || n.includes(r)) return true;
    const rw = r.split(' ');
    for (let i = 0; i + SHARED_RUN <= rw.length; i++) {
      if (n.includes(rw.slice(i, i + SHARED_RUN).join(' '))) return true;
    }
  }
  return false;
}

export const MAX_DO_WORDS = 12 + 2;

// An alias is matched as a phrase inside a question, so it has to be a subject phrase
// rather than a sentence. Past four words it stops appearing verbatim in real questions.
export const MAX_ALIAS_WORDS = 4;
export const MAX_HEADLINE_WORDS = 12;

/* ═══════════════════════════ Copy hygiene ═══════════════════════════ */

// AMERICAN SPELLING AND TYPOGRAPHIC PUNCTUATION, on every card.
//
// Pass 1 swept the whole corpus for this and the generator never inherited it: the first
// card that shipped to production said "not its netted rind colour". A generated card
// renders in the same component as a curated one and is supposed to be indistinguishable
// from it — a British spelling is the exact kind of tell that makes it distinguishable.
//
// The raw batch of curated entries missed the sweep too, so this is not a generator-only
// rule and it is not applied only to generated cards.
const BRITISH = [
  [/\bcolour(s|ed|ing|ful|less)?\b/gi, 'color$1'],
  [/\bflavour(s|ed|ing|ful|less)?\b/gi, 'flavor$1'],
  [/\bfavour(s|ed|ing|ite|ites)?\b/gi, 'favor$1'],
  [/\bneighbour(s|ing|hood|hoods)?\b/gi, 'neighbor$1'],
  [/\bbehaviour(s|al)?\b/gi, 'behavior$1'],
  [/\blitre(s)?\b/gi, 'liter$1'],
  [/\bfibre(s)?\b/gi, 'fiber$1'],
  [/\bcentre(s|d)?\b/gi, 'center$1'],
  [/\bmetre(s)?\b/gi, 'meter$1'],
  [/\bgrey(ish)?\b/gi, 'gray$1'],
  [/\borganis(e|es|ed|ing|ation|ations)\b/gi, 'organiz$1'],
  [/\brecognis(e|es|ed|ing)\b/gi, 'recogniz$1'],
  [/\banalys(e|es|ed|ing)\b/gi, 'analyz$1'],
  [/\bdefence\b/gi, 'defense'],
  [/\blicence\b/gi, 'license'],
];

// A straight quote or apostrophe. Kristy's copy uses “ ” and ’ everywhere else, so a
// straight one is a card authored outside the house style.
const STRAIGHT_QUOTE = /["']/;

/**
 * Rewrite British spellings to American, preserving the original capitalisation of the
 * first letter. Exported because the corpus needed fixing as well as checking.
 */
export function americanize(text) {
  let out = String(text ?? '');
  for (const [re, replacement] of BRITISH) {
    out = out.replace(re, (match, suffix = '') => {
      const base = replacement.replace('$1', suffix || '');
      // "Colour" → "Color", "colour" → "color".
      return match[0] === match[0].toUpperCase() ? base[0].toUpperCase() + base.slice(1) : base;
    });
  }
  return out;
}

/** Straight quotes and apostrophes → typographic ones. */
export function typographic(text) {
  return String(text ?? '')
    // An apostrophe inside a word is always a right single quote.
    .replace(/(\w)'(\w)/g, '$1’$2')
    .replace(/(\w)'(\s|$|[.,;:!?)])/g, '$1’$2')
    // Opening double quote after start, whitespace or an opening bracket; closing otherwise.
    .replace(/(^|[\s([{—–-])"/g, '$1“')
    .replace(/"/g, '”')
    .replace(/(^|[\s([{])'/g, '$1‘')
    .replace(/'/g, '’');
}

export function britishSpellings(text) {
  const found = [];
  for (const [re] of BRITISH) {
    for (const m of String(text ?? '').matchAll(re)) found.push(m[0]);
  }
  return found;
}

/* ═══════════════════════════ Voice tics ═══════════════════════════ */

// ONE mechanically-detectable AI cadence. REPORT ONLY — it does not fail a card. It is a
// pattern-matcher over prose, and those are wrong often enough that gating on one would
// reject good writing.
//
// TWO OTHER CHECKS WERE TRIED AND DROPPED, both for the same reason: they cannot tell the
// tic from the voice.
//
//   "not X, but Y" where X appears nowhere else — flagged 45% of the corpus. "X, not Y" is
//   the load-bearing shape here, because most of these cards exist to correct a belief:
//   "flagged as a standard, not as settled science", "'Multigrain' is a headcount, not a
//   standard". Separating a strawman from a contrast the reader needs requires knowing
//   whether anyone actually holds the belief, which is not in the text.
//
//   Abstract subject + animate verb — a noun list narrow enough to be quiet catches
//   nothing real, and one wide enough to catch something is noisier than the tic.

const TIC_STOP = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'from', 'has', 'in', 'is',
  'it', 'its', 'no', 'not', 'of', 'on', 'or', 'that', 'the', 'their', 'them', 'then',
  'there', 'they', 'this', 'to', 'up', 'was', 'what', 'when', 'which', 'with', 'you', 'your',
]);

const contentTokens = (s) =>
  (String(s || '').toLowerCase().match(/[a-z][a-z-]{2,}/g) || []).filter((w) => !TIC_STOP.has(w));

/**
 * TIC 1 — the antithesis snapclip. A clause, then the same clause inverted or intensified
 * for weight: "The half of the store with no label. The half that matters most."
 *
 * The test is INFORMATION, not shape. A two-part line is fine — "Whole grain. 'Multigrain'
 * is a headcount, not a standard" earns its second half. It chimes when the second clause
 * repeats a content word from the first and introduces no new noun of its own.
 */
export function antithesisChime(text) {
  const s = String(text || '').trim();
  const parts = s.split(/(?:\.|;|—)\s+/).map((p) => p.trim()).filter((p) => p.split(/\s+/).length >= 2);
  const hits = [];
  for (let i = 1; i < parts.length; i++) {
    const first = new Set(contentTokens(parts[i - 1]));
    const second = contentTokens(parts[i]);
    if (!first.size || !second.length) continue;
    const echoed = second.filter((w) => first.has(w));
    const fresh = second.filter((w) => !first.has(w));
    // Echoes something, and brings nothing of its own.
    if (echoed.length && fresh.length <= 1) {
      hits.push({ echo: echoed[0], clause: parts[i] });
    }
  }
  return hits;
}

/* ═══════════════════════════ Intra-card contradiction ═══════════════════════════ */

// A DEFECT CLASS FOUND BY HAND, 2026-08-01. A do line read "the American Grassfed seal,
// the only whole-life claim on the case" while look_for on the SAME CARD listed two seals
// that both audit the whole life. The card contradicted itself one tap apart, every field
// passed every existing check, and nothing would have caught it.
//
// REPORT ONLY, and it stays that way unless it earns more. The general problem — does
// this card disagree with itself — needs to know what the words mean. What is tractable
// is the narrow shape that actually shipped: an EXCLUSIVITY claim in the verdict or the
// action, next to a field that ENUMERATES more than one of the thing.
//
// MEASURED ON 2026-08-01 across all 82: 5 cards flagged, 2 of them real — the live
// `grassfed_vs_grassfinished` do line making the same false "the only whole-life claim"
// I had just fixed one card over, and `label_cold_pressed_expeller`, whose headline says
// "Only one is mechanical" while its own body explains that expeller-pressed AND
// cold-pressed are both mechanical. Three false positives, all the same shape: "nothing
// else" used to mean "no other INGREDIENTS" (honey, real cheese), where a list elsewhere
// on the card is not an enumeration of the excluded thing. That ratio earns a report.
//
// NARROWING IT TO PROPER NOUNS ONLY WAS TRIED AND REJECTED: it drops to zero hits and
// loses both real finds, because a card enumerates its instances as quoted label terms as
// often as it names certifiers.
//
// A COUNT CHECK WAS BUILT AND DELETED. "A number in the verdict contradicted by a list
// elsewhere" produced 13 hits and NOT ONE was real: "30 ounces", "two months", "three
// things", "both sides of the carton", "the first three ingredients". Every one compares
// a count of something in the WORLD against the length of a list on the CARD, which is a
// category error the shape cannot escape. Same failure as the two checks dropped in
// Pass 3, and dropped on the same standard.

const EXCLUSIVITY = /\b(the only|the sole|nothing else|no other|the one and only|only one)\b/i;

/**
 * The nameable things in a piece of text: multi-word proper nouns (a certifier, a brand,
 * a standard) and quoted terms (a printed label word). These are what a card enumerates
 * when it lists instances, and they are the only enumeration a regex can see honestly.
 */
/* ═══════════════════════════ TIC — the copula abstraction ═══════════════════════════ */

// A SECOND CLAUSE THAT INVERTS THE FIRST AND LANDS ON AN ABSTRACT NOUN.
//
//   "The cart is yours. Keeping it is the membership."
//
// That was caught by eye during the monetization copy pass, and `antithesisChime` PASSED
// it — the two checks look for different things. The chime is LEXICAL: a clause that
// repeats a content word from the one before and brings nothing new. Here nothing is
// repeated at all. The defect is that the second clause restates the relationship in the
// abstract, so it reads as cadence and carries no information a reader can act on.
//
// REPORT-ONLY, deliberately. It fires on a rhetorical shape rather than a checkable fact,
// which is a weaker footing than every other rule in this file, and a noisy report is
// cheap where a noisy failure blocks authoring.
//
// ⚠️ DO NOT PROMOTE THIS OUT OF REPORT-ONLY ON "ZERO FALSE POSITIVES ACROSS THE CORPUS."
// That was the bar this comment used to set, and it is the wrong bar — a check with a
// narrow closed vocabulary produces zero false positives BY CONSTRUCTION, so the number
// measures the size of the word list rather than the quality of the rule.
//
// THE FALSE NEGATIVE, measured 2026-08-09. Any content noun that is not in
// ABSTRACT_PAYLOAD counts as the rescuing concrete noun, so ONE unlisted abstraction
// clears the clause:
//
//     "The trip is over. The record is the point."   → PASSES
//
// `point` is on the list and `record` is not, so `concrete` comes back non-empty and the
// hit is suppressed. `record` is no more concrete than `point`. **The check can only
// catch abstraction it already has the word for**, and the fix is not a longer list:
// abstract nouns are an open class, and every word added moves the same defect one word
// further out. See kristy-ios/CLAUDE.md §1.8e/§1.8f — this is the third link in a chain
// where each checker was written for what the previous one missed and then missed in the
// same direction.
//
// A THIRD SHAPE THIS CANNOT SEE AT ALL: an abstract noun as SUBJECT with a lexical verb
// of existing — "The real food lives on the perimeter." No copula, so the COPULA gate
// never opens, and the abstraction is in the subject rather than the payload. It is
// shipped copy on the frozen web client. Deliberately NOT given a third checker.
const COPULA = /\b(is|are|was|were)\b/i;

// Nouns that name a relationship rather than a thing. A clause whose only payload is one
// of these has told the reader nothing they can do.
const ABSTRACT_PAYLOAD = new Set([
  'membership', 'point', 'difference', 'deal', 'idea', 'trick', 'answer', 'reason',
  'catch', 'question', 'secret', 'purpose', 'upgrade', 'value', 'benefit', 'advantage',
]);

// Words that carry no concreteness of their own, so they cannot rescue a clause: bare
// gerunds of doing, and the pronoun-ish subjects these lines lean on.
const NOT_CONCRETE = new Set([
  'keeping', 'saving', 'having', 'being', 'doing', 'getting', 'making', 'taking',
  'that', 'this', 'these', 'those', 'one', 'ones', 'yours', 'ours', 'theirs',
]);

/**
 * The copula-abstraction hits in a string. Empty is the passing state.
 * @returns {Array<{clause:string, noun:string}>}
 */
export function copulaAbstraction(text) {
  const s = String(text || '').trim();
  const parts = s.split(/(?:\.|;|—)\s+/).map((p) => p.trim()).filter((p) => p.split(/\s+/).length >= 2);
  const hits = [];
  for (let i = 1; i < parts.length; i++) {
    const p = parts[i];
    if (!COPULA.test(p)) continue;
    const toks = contentTokens(p);
    const abstract = toks.filter((t) => ABSTRACT_PAYLOAD.has(t));
    if (!abstract.length) continue;
    const concrete = toks.filter((t) => !ABSTRACT_PAYLOAD.has(t) && !NOT_CONCRETE.has(t));
    if (concrete.length === 0) hits.push({ clause: p, noun: abstract[0] });
  }
  return hits;
}

export function nameables(text) {
  const s = String(text || '');
  const propers = s.match(/\b[A-Z][a-z]+(?:\s+(?:by\s+)?[A-Z][A-Za-z]+)+\b/g) || [];
  const quoted = [...s.matchAll(/[‘“]([^’”]{2,40})[’”]/g)].map((m) => m[1].trim());
  return [...new Set([...propers, ...quoted])];
}

/**
 * Where a card appears to disagree with itself. Empty is the passing state, and a hit is
 * a prompt to look, never a verdict.
 *
 * @returns {Array<{code:string, detail:string}>}
 */
export function contradictions(card) {
  const out = [];
  const verdict = [card?.headline, card?.do ?? card?.do_line].filter(Boolean).map(String);
  const elsewhere = {
    why: card?.why,
    detail: card?.detail,
    kristy_take: card?.kristy_take,
    look_for: (card?.look_for || []).join(' · '),
    watch_out: (card?.watch_out || []).join(' · '),
    labels_decoded: (card?.labels_decoded || []).map((l) => `${l?.term} ${l?.meaning}`).join(' · '),
  };

  // 1. Exclusivity in the verdict, enumeration everywhere else.
  const exclusive = verdict.find((t) => EXCLUSIVITY.test(t));
  if (exclusive) {
    for (const [field, text] of Object.entries(elsewhere)) {
      const named = nameables(text);
      if (named.length >= 2) {
        out.push({
          code: 'CONTRADICTION_EXCLUSIVITY',
          detail: `"${exclusive.match(EXCLUSIVITY)[0]}" in the verdict, but ${field} names ${named.length}: ${named
            .slice(0, 3)
            .map((n) => `"${n}"`)
            .join(', ')}`,
        });
      }
    }
  }

  return out;
}

/**
 * Report the tics on a card. Never part of lintCard — these do not gate anything.
 */
export function voiceTics(card) {
  const fields = {
    headline: card?.headline,
    do: card?.do ?? card?.do_line,
    why: card?.why,
    tier_note: card?.tier_note,
  };
  const out = [];
  for (const [field, text] of Object.entries(fields)) {
    if (!text) continue;
    for (const h of antithesisChime(text)) {
      out.push({ code: 'TIC_ANTITHESIS', field, detail: `"${h.clause}" echoes "${h.echo}" and adds nothing` });
    }
  }
  out.push(...contradictions(card).map((c) => ({ ...c, field: 'card' })));
  return out;
}

/* ═══════════════════════════ One verdict per headline ═══════════════════════════ */

// THE HEDGE MAY NOT LIVE IN THE VERDICT. The corpus shipped nine headlines shaped
// "standard, then retreat" — "Wild if it is in reach. Farmed or nothing, buy the farmed",
// "Grass-fed when the price is fair. Otherwise regular beef", "Worth it if the budget
// stretches. Otherwise the plain carton". Each is two verdicts where the second cancels
// the first, and Kristy negotiates with herself before the shopper has asked. The
// standard goes in the headline undiluted; the fallback moves to look_for or watch_out,
// where it reads as practical rather than as a retreat.
//
// A TWO-CLAUSE HEADLINE IS NOT THE DEFECT, and this is the whole difficulty. Four
// headlines split by TYPE or USE CASE and are correct:
//
//   "Organic on thin-skinned produce. Conventional on anything peeled."
//   "Meaningful on beef and dairy. A freebie on chicken and pork."
//   "Pay for grade on a quick-cooked steak. Skip it on anything braised."
//   "80/20 for burgers. 90/10 for anything you drain."
//
// Those are discrimination — the standard differs by what is in your hand. Banning two
// clauses would delete them along with the hedges, so the check tests WHAT THE SECOND
// CLAUSE IS CONDITIONED ON instead. A condition about the FOOD is discrimination. A
// condition about the SHOPPER'S CIRCUMSTANCES — their budget, what the store happens to
// stock, how much time they have — is the retreat.

// The fallback stated outright. `otherwise` and `unless` have no innocent reading in a
// verdict, and neither does the "X or nothing, buy the X" construction.
//
// "or nothing" needs the comma or a following imperative: "Clean seawater or nothing
// means yes" is a description of a smell, not a fallback, and it was the false positive
// that made a bare /or nothing/ useless.
const FALLBACK_OUTRIGHT = [
  [/\botherwise\b/i, 'otherwise'],
  [/\bunless\b/i, 'unless'],
  [/\bor nothing,/i, 'or nothing,'],
  [/\bor nothing\b\s+(buy|take|get|grab)\b/i, 'or nothing + imperative'],
];

// A conditional marker. On its own this proves nothing — "Wash it when you eat it" is
// temporal and correct — so it only counts alongside a circumstance below.
const CONDITIONAL = /\b(if|when|whenever|where|as long as|provided)\b/i;

// THE SHOPPER'S CIRCUMSTANCES. This list is the load-bearing part of the check: a
// condition drawn from here is about the person, not the food, and a standard that bends
// to it is a standard being withdrawn.
const CIRCUMSTANCE =
  /\b(budget|price|prices|priced|afford|affordable|cost|costs|money|cheap|cheaper|expensive|worth it|stretch(es)?|fair|reasonable|close)\b|\b(in reach|available|in stock|they have it|the store (has|carries|stocks)|it is there|there is (any|some)|you can find|carries it)\b|\b(time|hurry|busy|quick enough|convenience|convenient)\b|\b(you want|you like|you prefer|if that matters|you care)\b/i;

// A QUESTION IN THE HEADLINE IS A CONDITIONAL FRAME. "Paying grass-fed prices? Buy
// grass-FINISHED" reads as firm and is still "if you are paying…". The card states the
// standard for everyone or it is not a standard.
const QUESTION_FRAME = /\?/;

// THE RETREAT WITH NO KEYWORD. "Whole milk. Buy the one the household actually drinks."
// carries no conditional at all and does the identical thing: names the pick, then hands
// the choice back. A keyword scan misses it, so the deference phrasing is matched
// directly.
const DEFERENCE = [
  [/\bwhatever\b/i, 'whatever'],
  [/\bwhichever\b/i, 'whichever'],
  [/\bthe one (you|they|the household|your|he|she)\b/i, 'the one you/they/the household'],
  [/\bup to you\b/i, 'up to you'],
  [/\byour call\b/i, 'your call'],
  [/\bwhat works (for|best)\b/i, 'what works for'],
  [/\bactually (drinks?|eats?|uses?|cooks?)\b/i, 'what they actually drink/eat'],
];

/**
 * The hedges in a headline. Empty is the passing state.
 *
 * @returns {Array<{kind:string, detail:string}>}
 */
export function headlineHedge(headline) {
  const h = String(headline || '').trim();
  if (!h) return [];
  const hits = [];

  for (const [re, name] of FALLBACK_OUTRIGHT) {
    if (re.test(h)) hits.push({ kind: 'fallback', detail: `"${name}" states a fallback in the verdict` });
  }
  const cond = h.match(CONDITIONAL);
  const circ = h.match(CIRCUMSTANCE);
  if (cond && circ) {
    hits.push({
      kind: 'circumstance',
      detail: `"${cond[0]}" conditions the verdict on "${circ[0]}" — the shopper's circumstances, not the food`,
    });
  }
  if (QUESTION_FRAME.test(h)) {
    hits.push({ kind: 'question', detail: 'a question frames the verdict as conditional' });
  }
  for (const [re, name] of DEFERENCE) {
    const m = h.match(re);
    if (m) hits.push({ kind: 'deference', detail: `"${m[0]}" (${name}) hands the decision back to the shopper` });
  }
  return hits;
}

/* ═══════════════════════════ Accuracy: the false mechanisms ═══════════════════════════ */

// FIRMER IS NOT LOOSER WITH FACTS. Kristy's authority comes from being right, and one
// wrong claim costs more than ten soft ones. Each rule here is a claim that would make a
// TRUE position sound more convincing by resting it on something false — which is the one
// way a firmer voice can do real damage.
//
// These are not hypothetical. The accurate case against farmed salmon is strong on its
// own: a feed-driven fat profile with a far worse omega-3 to omega-6 ratio, astaxanthin
// in the ration because the flesh is otherwise gray, sea lice and their treatments, and
// antibiotic use that varies enormously by country. None of it needs propping up.

const FARMED_FISH = /\b(farmed|farm-raised|aquaculture|penned)\b/i;
const SALMON_CONTEXT = /\b(salmon|farmed fish|aquaculture)\b/i;

const MECHANISMS = [
  {
    id: 'salmon_hormones',
    // FALSE. Growth hormones are not used in commercial salmon farming anywhere. The
    // claim is a persistent myth and it is the fastest way to lose the whole argument.
    test: (t) => SALMON_CONTEXT.test(t) && /\bhormones?\b/i.test(t),
    why: 'growth hormones in farmed salmon — they are not used in commercial salmon farming, and the claim is false',
  },
  {
    id: 'salmon_omega3_amount',
    // The claim is ALWAYS the RATIO, never the amount. Farmed salmon is fatter, so a
    // serving often carries as much total omega-3 as wild or more. "Less omega-3" is
    // false and it is the easy thing to reach for.
    test: (t) =>
      FARMED_FISH.test(t) && /\b(less|lower|fewer|little|hardly any|not much|no real)\s+omega-3\b/i.test(t),
    why: 'farmed fish having less omega-3 — the claim is about the omega-3 to omega-6 RATIO, never the amount',
  },
  {
    id: 'antibiotics_flat',
    // Antibiotic use in aquaculture varies enormously by country of origin: Norwegian
    // farming runs close to zero on the back of vaccination, others run far higher. A
    // flat claim is false for the best producers and unfalsifiable for the rest.
    test: (t) =>
      /\b(full of|pumped (full )?of|loaded with|riddled with|swimming in|dosed with)\s+antibiotics\b/i.test(t),
    why: 'a flat antibiotic claim — use varies enormously by country of origin and must be framed that way',
  },
  {
    id: 'antibiotics_unframed',
    // Naming antibiotics on a farmed-fish card WITHOUT the country framing is the same
    // claim by omission. This is a required-context rule rather than a banned phrase,
    // because the defect is what the sentence leaves out.
    test: (t) =>
      FARMED_FISH.test(t) &&
      /\bantibiotic/i.test(t) &&
      !/\b(countr\w+|origin|varies|varying|vary|by producer|norway|norwegian|chile|chilean)\b/i.test(t),
    why:
      'antibiotics named on a farmed-fish card with no country framing — always "varies by country of origin", ' +
      'never a flat claim',
  },
];

/**
 * The false mechanisms on a card. Empty is the passing state.
 * @returns {Array<{id:string, why:string}>}
 */
export function falseMechanisms(card) {
  const text = [
    card?.headline,
    card?.do ?? card?.do_line,
    card?.why,
    card?.detail,
    card?.kristy_take,
    card?.tier_note,
    ...(card?.look_for || []),
    ...(card?.watch_out || []),
    ...(card?.labels_decoded || []).map((l) => `${l?.term} ${l?.meaning}`),
  ]
    .filter(Boolean)
    .join('  ');
  return MECHANISMS.filter((m) => m.test(text)).map(({ id, why }) => ({ id, why }));
}

/* ═══════════════════════════ Imperative ═══════════════════════════ */

// A `do` line is an instruction, so its first token is a verb. Detecting that properly
// needs a part-of-speech tagger; an explicit list is more honest and is inspectable in
// review. Adding a verb is a deliberate act — which is the point, because the failure
// this catches is a line that opens "Organic is generally…" and describes instead of
// instructing.
export const IMPERATIVE_VERBS = new Set([
  'ask', 'avoid', 'bring', 'buy', 'call', 'carry', 'check', 'choose', 'compare', 'count',
  'cover', 'decide', 'fill', 'find', 'flip', 'freeze', 'get', 'grab', 'hold', 'ignore',
  'keep', 'leave', 'lift', 'look', 'move', 'open', 'pass', 'pick', 'pop', 'pour', 'press',
  'pull', 'push', 'put', 'read', 'reach', 'rinse', 'rotate', 'rub', 'scan', 'scoop',
  'scrub', 'search', 'skip', 'smell', 'sort', 'spend', 'split', 'squeeze', 'start', 'stop',
  'store', 'swap', 'take', 'taste', 'tip', 'touch', 'trace', 'try', 'turn', 'walk', 'wash',
  'watch', 'weigh', 'wrap',
  // The sensory batch. Produce and the counters are judged by hand and nose, and the list
  // was rejecting the most natural verbs for it — a generated cantaloupe card opened with
  // "Sniff" and cost a full retry for being right.
  'peel', 'shake', 'sniff', 'tap', 'thump',
  // The KITCHEN batch, added with the `home` technique cards on 2026-08-02. This list was
  // built for aisle actions — read, check, look, take — and a card whose observable is at
  // the stove has a different vocabulary. Every one of these was a card that could not
  // state its own action: the baking-soda card opens "Soak", the bean card "Stir", the
  // greens card "Trim", the freezing card "Blanch", the spice card "Toast". Adding a verb
  // stays a deliberate act, which is the point of the list being explicit.
  'blanch', 'soak', 'stir', 'toast', 'trim',
]);

export const firstToken = (s) =>
  String(s || '').trim().split(/\s+/)[0].replace(/[^A-Za-z’'-]/g, '').toLowerCase();

/* ═══════════════════════════ The observable ═══════════════════════════ */

// RULING 4, the defect that recurs: when the printed word a shopper looks for sits in the
// headline, every honest `do` line restates it, and the card wastes its most valuable
// line. Detected as a distinctive term appearing in BOTH.
//
// "Distinctive" is doing real work. A headline and a `do` line about the same food will
// always share ordinary words, and flagging those would make the check useless. So a
// shared term counts only when it is specific enough to BE the observable: hyphenated
// ("soy-free", "grass-finished"), or a long-enough word that is neither grammar nor the
// name of a container, a surface, or the act of reading one.

const GRAMMAR = new Set([
  'and', 'any', 'anything', 'are', 'because', 'been', 'before', 'both', 'but', 'does',
  'every', 'for', 'from', 'has', 'have', 'into', 'its', 'means', 'more', 'most', 'much',
  'never', 'not', 'nothing', 'only', 'over', 'own', 'same', 'says', 'should', 'still',
  'than', 'that', 'the', 'their', 'them', 'then', 'there', 'they', 'this', 'through',
  'under', 'until', 'what', 'when', 'where', 'which', 'while', 'with', 'without', 'you',
  'your',
  // Rhetoric — long enough to look distinctive, but they name nothing in a store.
  'actually', 'anyway', 'always', 'entirely', 'explicitly', 'generally', 'implies',
  'instead', 'otherwise', 'really', 'simply', 'usually',
]);

// Containers, surfaces, and the act of consulting one. Two cards about the same aisle
// share these constantly and it means nothing — a `do` line has to name a package.
const NEUTRAL = new Set([
  'aisle', 'back', 'bag', 'bottle', 'box', 'bunch', 'can', 'canister', 'carton', 'case',
  'claim', 'claims', 'clamshell', 'container', 'counter', 'date', 'front', 'ingredient',
  'ingredients', 'jar', 'jug', 'label', 'line', 'list', 'lid', 'package', 'packet',
  'panel', 'piece', 'pound', 'price', 'print', 'printed', 'produce', 'seal', 'shelf',
  'side', 'sticker', 'store', 'tag', 'tub', 'wording', 'word', 'words', 'wrapper',
  // the verbs of consulting one
  'buy', 'check', 'find', 'look', 'read', 'take',
]);

const MIN_DISTINCTIVE = 6;

const termsOf = (s) =>
  new Set(
    String(s || '')
      .toLowerCase()
      .replace(/[“”‘’]/g, '')
      .match(/[a-z][a-z-]{2,}/g) || []
  );

const isDistinctive = (t) =>
  !GRAMMAR.has(t) && !NEUTRAL.has(t) && (t.includes('-') || t.length >= MIN_DISTINCTIVE);

// The terms sitting inside quotation marks — by construction, the printed word a shopper
// hunts for. This is the observable in its least ambiguous form.
//
// A quoted QUESTION is excluded: "was this previously frozen?" is something the shopper
// says out loud at the counter, not something printed on a package. Counting speech as a
// printed observable flagged a perfectly good card.
function quotedTerms(s) {
  const out = new Set();
  for (const m of String(s || '').matchAll(/[“"']([^”"']{2,60})[”"']|‘([^’]{2,60})’/g)) {
    const span = m[1] || m[2];
    if (span.trim().endsWith('?')) continue;
    for (const t of termsOf(span)) out.add(t);
  }
  return out;
}

/**
 * The distinctive terms a headline and a `do` line share. Empty is the passing state.
 *
 * TWO SIGNALS, because one alone is either too loose or too tight:
 *
 *   · A shared term that is QUOTED on either side. A quoted term IS the printed word;
 *     if the headline already handed it over, the `do` line has nothing left to add.
 *     One is enough.
 *   · TWO OR MORE shared distinctive terms, quoted or not. One shared subject noun is
 *     normal and healthy — a card about grass-fed beef says "grass-fed" twice and the
 *     `do` line still earns its place by naming the cut. Two shared terms means the line
 *     is orbiting the headline rather than adding to it.
 */
export function sharedObservables(headline, doLine) {
  const h = termsOf(headline);
  const d = termsOf(doLine);
  const shared = [...h].filter((t) => d.has(t)).filter(isDistinctive);
  if (!shared.length) return [];

  const quoted = new Set([...quotedTerms(headline), ...quotedTerms(doLine)]);
  const sharedQuoted = shared.filter((t) => quoted.has(t));

  if (sharedQuoted.length) return sharedQuoted;
  return shared.length >= 2 ? shared : [];
}

/* ═══════════════════════════ Per-card ═══════════════════════════ */

/**
 * Lint one card — curated or generated.
 * @returns {Array<{code:string, detail:string}>} empty when the card passes.
 */
export function lintCard(card) {
  const out = [];
  const fail = (code, detail) => out.push({ code, detail });

  const headline = String(card?.headline || '').trim();
  const doLine = String(card?.do ?? card?.do_line ?? '').trim();

  if (!headline) fail('HEADLINE_MISSING', 'the card has no verdict');
  else if (words(headline) > MAX_HEADLINE_WORDS) {
    fail('HEADLINE_TOO_LONG', `${words(headline)}w > ${MAX_HEADLINE_WORDS}: ${headline}`);
  }

  // ONE VERDICT PER HEADLINE. The fallback belongs in look_for or watch_out.
  for (const h of headlineHedge(headline)) {
    fail('HEADLINE_HEDGED', `${h.detail}. State the standard undiluted; move the fallback to watch_out`);
  }

  // Accuracy outranks firmness. A claim that needs a false mechanism is a wrong claim.
  for (const m of falseMechanisms(card)) {
    fail('CLAIM_FALSE_MECHANISM', m.why);
  }

  if (!doLine) {
    fail('DO_MISSING', 'the card has no physical action');
  } else {
    if (words(doLine) > MAX_DO_WORDS) {
      fail('DO_TOO_LONG', `${words(doLine)}w > ${MAX_DO_WORDS}: ${doLine}`);
    }
    const verb = firstToken(doLine);
    if (!IMPERATIVE_VERBS.has(verb)) {
      fail('DO_NOT_IMPERATIVE', `opens with "${verb}", which is not a known imperative verb`);
    }
  }

  // A GENERATED card must carry aliases, because aliases are the only way it can ever be
  // RETRIEVED again. The deterministic matcher scores alias phrases; a card with none
  // scores zero against every future question, so the next shopper asking the identical
  // thing regenerates it. That is not a cosmetic gap — it is an unbounded spend loop and
  // a corpus that forks into near-duplicates of the same answer.
  if (card?.source === 'generated') {
    const aliases = Array.isArray(card.aliases) ? card.aliases.filter((a) => String(a || '').trim()) : [];
    if (aliases.length < 2) {
      fail(
        'ALIASES_MISSING',
        `a generated card needs at least 2 aliases to be findable again; got ${aliases.length}`
      );
    }

    // AN ALIAS HAS TO BE SHORT, and this is not a style rule. The matcher looks for each
    // alias as a run of words INSIDE the question, so a full sentence never matches
    // anything: "how to tell if a cantaloupe is ripe" is not contained in "how do I pick a
    // good cantaloupe". The first generated card shipped six aliases, every one of them a
    // sentence, and it regenerated on every ask because none could ever hit.
    const longOnes = aliases.filter((a) => words(a) > MAX_ALIAS_WORDS);
    if (longOnes.length) {
      fail(
        'ALIASES_TOO_LONG',
        `an alias is matched as a phrase inside a question, so it must be short. Over ${MAX_ALIAS_WORDS} words: ${longOnes.map((a) => `"${a}"`).join(', ')}`
      );
    }
    if (!aliases.some((a) => words(a) <= 2)) {
      fail(
        'ALIASES_NO_SHORT_FORM',
        'at least one alias must be one or two words — usually the bare subject noun, which is the most likely hit'
      );
    }
  }

  // Copy hygiene, across every readable field. A card is one voice, so a British spelling
  // in watch_out is the same defect as one in the headline.
  const copy = [
    headline,
    doLine,
    card?.why,
    card?.tier_note,
    card?.topic,
    card?.eyebrow,
    card?.cta_item,
    card?.detail,
    card?.kristy_take,
    ...(card?.look_for || []),
    ...(card?.watch_out || []),
  ]
    .filter(Boolean)
    .map(String);

  const brit = [...new Set(copy.flatMap(britishSpellings))];
  if (brit.length) {
    fail('COPY_BRITISH', `British spelling: ${brit.map((w) => `"${w}"`).join(', ')} — the corpus is American`);
  }
  const straight = copy.filter((t) => STRAIGHT_QUOTE.test(t));
  if (straight.length) {
    fail(
      'COPY_STRAIGHT_QUOTE',
      `a straight quote or apostrophe in: "${straight[0].slice(0, 60)}…" — the corpus uses “ ” and ’`
    );
  }

  const tierNote = String(card?.tier_note || '').trim();
  if (!tierNote) {
    fail('TIER_NOTE_MISSING', 'the tier has no sentence carrying it on the free surface');
  } else if (echoesRubric(tierNote)) {
    fail(
      'TIER_NOTE_IS_RUBRIC',
      `the tier note repeats the rubric's definition instead of saying why THIS call carries this tier — "${tierNote.slice(0, 70)}…"`
    );
  }

  /* THE NOTE MAY NOT POINT AT THE TIER, because there is nothing to point at. The chip that
     named it was removed on 2026-08-04 (a classification rendered as a badge labels nothing),
     and `tier_note` took over its job on the free summary. Four curated cards — raw_milk,
     raw_kefir, raw_aged_cheese, sprouts_raw — shared one sentence reading "This tier is
     Kristy's sourcing standard", which the moment the chip went became a definite reference
     to a thing no longer on screen. Exactly the referent-less problem the chip had, inverted.

     They also slipped `TIER_NOTE_IS_RUBRIC`: near-paraphrases of the rubric rather than the
     rubric itself, and that check only catches the literal text. This one is structural. */
  if (tierNote && /\b(this|the)\s+tier\b/i.test(tierNote)) {
    fail(
      'TIER_NOTE_SELF_REFERENCE',
      `the tier note says "${tierNote.match(/\b(?:this|the)\s+tier\b/i)[0]}" — nothing on the ` +
        'card names the tier any more, so the phrase points at nothing. Say what the claim ' +
        'IS about this food instead.'
    );
  }

  if (headline && doLine) {
    const shared = sharedObservables(headline, doLine);
    if (shared.length) {
      fail(
        'OBSERVABLE_IN_BOTH',
        `${shared.map((t) => `"${t}"`).join(', ')} appears in the headline AND the do line — ` +
          'the headline keeps the verdict, the observable moves down'
      );
    }
  }

  return out;
}

/* ═══════════════════════════ Corpus-level ═══════════════════════════ */

// An em-dash-then-justification clause is a good shape. Half the corpus wearing it is not:
// eighty cards that all sound alike read as generated even when each line is correct. The
// ceiling is the share the 2026-07-31 sweep landed at (20%) plus room to breathe, so
// ordinary authoring does not trip it and a slide back toward a monoculture does.
export const MAX_EMDASH_SHARE = 0.28;

export const hasEmDashJustification = (doLine) => /—/.test(String(doLine || ''));

// The closing construction: whatever follows the last clause break. "— that percentage is
// water" and "— that percentage is brine" are the same line wearing two nouns.
//
// A line with NO clause break has no closing construction, and returns nothing. This
// matters: comparing whole lines instead flagged every pair of cards that talked about
// the same food, because two meat cards naturally share "ground beef" and "chuck". That
// is shared subject matter, not a repeated construction.
//
// Grammar words are KEPT. The defect is a repeated frame — "that percentage is ___" — and
// the frame is made of exactly the words a content-only bag would throw away.
export function closingConstruction(doLine) {
  const s = String(doLine || '').trim();
  if (!/[—:;]|\.\s+\S/.test(s)) return [];
  const tail = s.split(/[—:;]|\.\s+/).pop() || '';
  return tail.toLowerCase().match(/[a-z][a-z-]+/g) || [];
}

// Two closings collide when they OPEN the same way — the shared frame, not the shared
// vocabulary. "that percentage is water" / "that percentage is brine" share three leading
// tokens and differ only in the final noun.
const MIN_SHARED_PREFIX = 2;

export function sharedPrefix(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return a.slice(0, i);
}

// A prefix of pure grammar ("it should", "and it is") is not a construction anybody
// notices; it has to carry at least one word with content in it.
const isConstruction = (prefix) =>
  prefix.length >= MIN_SHARED_PREFIX &&
  prefix.some((t) => !GRAMMAR.has(t) && !NEUTRAL.has(t) && t.length >= 3);

/**
 * Lint a whole corpus.
 *
 * PROXIMITY RULE: duplication is scored WITHIN a section and never across one. Sections
 * are aisles — nobody reads a label-terms card and a seafood card in the same breath, so
 * a shared construction between them is not repetition anybody can perceive. Scoring it
 * globally produces rewrites that make individual lines worse in exchange for a variety no
 * shopper experiences.
 *
 * @returns {{violations:Array, report:{verbs:Array, emDashShare:number, total:number}}}
 */
export function lintCorpus(cards) {
  const violations = [];
  const list = (cards || []).filter(Boolean);
  const doOf = (c) => String(c?.do ?? c?.do_line ?? '').trim();

  // ── em-dash share ──
  const withEmDash = list.filter((c) => hasEmDashJustification(doOf(c)));
  const share = list.length ? withEmDash.length / list.length : 0;
  if (share > MAX_EMDASH_SHARE) {
    violations.push({
      code: 'EMDASH_SHARE',
      detail:
        `${withEmDash.length}/${list.length} do lines (${Math.round(share * 100)}%) use the ` +
        `em-dash-then-justification shape, over the ${Math.round(MAX_EMDASH_SHARE * 100)}% ceiling`,
    });
  }

  // ── within-section closing duplication ──
  const bySection = new Map();
  for (const c of list) {
    const key = String(c?.section || 'unsectioned');
    if (!bySection.has(key)) bySection.set(key, []);
    bySection.get(key).push(c);
  }
  for (const [section, group] of bySection) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = closingConstruction(doOf(group[i]));
        const b = closingConstruction(doOf(group[j]));
        if (!a.length || !b.length) continue;
        const prefix = sharedPrefix(a, b);
        if (isConstruction(prefix)) {
          violations.push({
            code: 'CLOSING_DUPLICATE',
            detail:
              `${section}: ${group[i].slug} and ${group[j].slug} close the same way — ` +
              `"${prefix.join(' ')}…" in both ("${a.join(' ')}" / "${b.join(' ')}")`,
          });
        }
      }
    }
  }

  // ── verb distribution: REPORTED, NEVER FAILED ──
  // Twenty-one lines open with "Read" because twenty-one cards are about reading a label,
  // and that is the physical act. Swapping in synonyms to flatten a histogram makes each
  // line less precise and the corpus no less repetitive. Precision beats variety, so this
  // is a number to look at, not a gate.
  const counts = new Map();
  for (const c of list) {
    const v = firstToken(doOf(c));
    if (v) counts.set(v, (counts.get(v) || 0) + 1);
  }
  const verbs = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([verb, n]) => ({ verb, n }));

  // ── copula abstraction: REPORTED, NEVER FAILED ──
  // Added 2026-08-02 after the monetization copy pass, where `antithesisChime` PASSED a
  // line that was rejected on sight ("The cart is yours. Keeping it is the membership").
  // It fires on a rhetorical shape rather than a checkable fact, which is weaker footing
  // than anything else here, so it reports. Measured at zero across 961 corpus fields on
  // the day it landed — promote it to a violation only if that holds over time.
  const copula = [];
  for (const c of list) {
    for (const [field, text] of Object.entries({
      headline: c?.headline, do: doOf(c), why: c?.why, tier_note: c?.tier_note,
      detail: c?.detail, kristy_take: c?.kristy_take,
    })) {
      if (!text) continue;
      for (const h of copulaAbstraction(text)) {
        copula.push({ slug: c.slug, field, clause: h.clause, noun: h.noun });
      }
    }
  }

  return {
    violations,
    report: { verbs, emDashShare: share, total: list.length, copulaAbstraction: copula },
  };
}
