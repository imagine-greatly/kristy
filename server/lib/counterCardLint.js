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

export const MAX_DO_WORDS = 12 + 2;
export const MAX_HEADLINE_WORDS = 12;

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
