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
  return out;
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
    fail('TIER_NOTE_MISSING', 'the tier chip has no reasoning behind it');
  } else if (echoesRubric(tierNote)) {
    fail(
      'TIER_NOTE_IS_RUBRIC',
      `the tier note repeats the rubric's definition instead of saying why THIS call carries this tier — "${tierNote.slice(0, 70)}…"`
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

  return {
    violations,
    report: { verbs, emDashShare: share, total: list.length },
  };
}
