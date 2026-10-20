// clean-pick-7 (Devon 2026-10-20, "organic, no additives, no synthetic, as close to the source as possible"): B7b, 9 picks name their item's cleanest version; sausage, egg whites and soup bones are held.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { lintCard, lintPick, words as lintWords } from '../../lib/counterCardLint.js';
import { attachCards, matchItemToCard, matchItemToPick } from '../../lib/listMatch.js';
import { CLEAN_PICK_9, CLEAN_PICK_10, preCleanPick11, preCleanPick12, preCleanPick8, CLEAN_PICK_8, prePickAvoid } from './twoLinePin.js';

// clean-pick-10 owns its ids now; this batch skips them like the clean-pick-9 ids.
const CP9or10 = (id) => CLEAN_PICK_9.has(id) || CLEAN_PICK_10.has(id);

const BASE = 'e3b4a68';
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const git = (ref) => execFileSync('git', ['show', ref], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
import { preT6_1, preT6_2 } from "./twoLinePin.js";
kb.entries = kb.entries.map(preT6_2); // t6-2: dairy/egg pins read ca32bef; t6_2.test.js owns live copy.
kb.entries = kb.entries.map(preT6_1); // t6-1: the 15 meat/seafood cards read as of 85c399e; t6_1.test.js owns them now
const base = JSON.parse(git(`${BASE}:server/kristy_perimeter_kb.json`));
const find = (k, id) => k.entries.find((e) => e.id === id);
const live = (id) => preCleanPick8(find(kb, id));
const was = (id) => find(base, id);
// clean-pick-9 moved eight review headlines; every other line stays.
const strip9 = (t) => t.split('\n').filter((l) => !(l.startsWith('| `') && (CP9or10(l.split('`')[1]) || CLEAN_PICK_8.has(l.split('`')[1])))).join('\n');

const BECAME = {
  pick_frozen_peas: { decision: 'Organic peas frozen solid, with no pack drips or off smell.', carry: /^Organic peas\b/, keep: [/frozen solid, with no pack drips or off smell/] },
  pick_frozen_broccoli: { decision: 'Organic broccoli frozen solid; pack drips or off smell mean it thawed.', carry: /^Organic broccoli\b/, keep: [/pack drips or off smell mean it thawed/] },
  pick_canned_tomatoes: { decision: 'Organic tomatoes: skip dented, rusted or swollen cans and read for BPA-free; the date marks quality.', carry: /^Organic tomatoes\b/, keep: [/dented, rusted or swollen cans and read for BPA-free/, /\bdate\b/, /\bquality\b/] },
  pick_tofu: { decision: 'Organic tofu by firmness: soybeans, water, coagulant such as nigari or gypsum.', carry: /^Organic tofu\b/, keep: [/soybeans, water, coagulant such as nigari or gypsum/] },
  pick_jerky: { decision: 'Whole-muscle beef jerky with a short list; celery powder supplies nitrite.', carry: /^Whole-muscle beef jerky\b/, keep: [/jerky with a short list; celery powder supplies nitrite/] },
  pick_fish_sticks: { decision: 'Wild-caught fish sticks from whole fillet, not ones labeled “made from minced fish” in bold.', carry: /^Wild-caught fish sticks\b/, keep: [/“made from minced fish”/, /\bbold\b/] },
  pick_juice: { decision: 'Juice not from concentrate: pasteurized, or untreated with warning labels; no added color over dyes.', carry: /^Juice not from concentrate\b/, keep: [/pasteurized/, /untreated/, /warning labels/, /no added color over dyes/] },
  pick_english_muffins: { decision: 'English muffins with whole wheat flour as the first ingredient, no preservatives or seed oil.', carry: /^English muffins with whole wheat flour\b/, keep: [/English muffins with whole wheat flour as the first ingredient/] },
  pick_pita_naan: { decision: 'Unenriched pita with whole wheat flour first; naan is the richer one, made with yogurt.', carry: /^Unenriched pita\b/, keep: [/whole wheat flour first/, /naan is the richer one, made with yogurt/] },
};
const IDS = Object.keys(BECAME);
const ORGANIC_IDS = ['pick_frozen_peas', 'pick_frozen_broccoli', 'pick_canned_tomatoes', 'pick_tofu'];
const HELD = ['pick_sausage', 'pick_egg_whites', 'pick_soup_bones'];
const BANNED = /\b(health|healthy|healthier|safer|risk|cancer|disease|toxic|toxin|detox|pesticide-free|synthetic|price|cost|cheap|expensive)\b/i;
const TREATMENT = /\b(causes?|prevents?|lowers? (the )?risk|carcinogen|cancer|tumou?rs?|toxic|unsafe|harm\w*|risks?|linked to|hyperactiv|behaviou?r|attention|neurobehavioral|exacerbate)/i;
const GENERIC = /\borganic (produce|vegetables?|veg|fruits?|food)\b/i;
const ORGANIC = /\borganic\b/i;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isPick = (e) => e && e.kind === 'pick';
const ws = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;

nonEmpty(IDS, 'IDS', 9);

test('C1 the 9 picks equal their base entries with only the decision replaced, each leading with its own standard', () => {
  for (const id of IDS) {
    assert.ok(live(id) && was(id), `${id} missing`);
    assert.deepEqual(prePickAvoid(live(id)), { ...structuredClone(was(id)), decision: BECAME[id].decision }, id);
    assert.match(live(id).decision, BECAME[id].carry, `${id} carry`);
  }
});

test('C2 every new pick line passes lintPick and lintCard and holds 16 words or fewer', () => {
  for (const id of IDS) {
    assert.deepEqual(lintPick(live(id)), [], `${id} lintPick`);
    assert.deepEqual(lintCard(live(id)), [], `${id} lintCard`);
    assert.ok(lintWords(live(id).decision) <= 16, `${id} ${lintWords(live(id).decision)} words`);
  }
});

test('C3 the base mechanical read survives in every new line', () => {
  for (const id of IDS) {
    for (const re of nonEmpty(BECAME[id].keep, `${id} keep`, 1)) {
      assert.match(was(id).decision, re, `${id} keep ${re} not in base`);
      assert.match(live(id).decision, re, `${id} keep ${re} lost`);
    }
  }
});

test('C4 no new line carries a banned or treatment word, first person, a dash, a straight apostrophe, a digit or a question mark', () => {
  const all = IDS.map((id) => BECAME[id].decision);
  nonEmpty(all, 'decisions', 9);
  for (const s of all) {
    assert.doesNotMatch(s, BANNED, s);
    assert.doesNotMatch(s, TREATMENT, s);
    assert.doesNotMatch(s, /\b(I|me|my|mine|we|our|ours|us)\b/, s);
    assert.ok(!s.includes('—') && !s.includes('–'), s);
    assert.ok(!s.includes("'"), s);
    assert.doesNotMatch(s, /[0-9?]/, s);
  }
});

test('C5 organic is new on exactly the four organic-standard picks and unchanged on every other pick', () => {
  for (const id of IDS) {
    assert.doesNotMatch(was(id).decision, ORGANIC, `${id} base already organic`);
    if (ORGANIC_IDS.includes(id)) assert.ok(live(id).decision.startsWith('Organic '), `${id} lacks organic`);
    else assert.doesNotMatch(live(id).decision, ORGANIC, `${id} gained organic`);
  }
  const otherPicks = (k) => k.entries.filter((e) => isPick(e) && !IDS.includes(e.id) && !CP9or10(e.id));
  nonEmpty(otherPicks(base), 'other picks', 14);
  const count = (k) => otherPicks(k).filter((e) => ORGANIC.test(e.decision || '')).length;
  assert.equal(count({ entries: kb.entries.map(preCleanPick8) }), count(base));
});

test('C6 entries outside the batch deepEqual the base; count and top-level keys unchanged', () => {
  const others = kb.entries.map(prePickAvoid).map(preCleanPick8).map(preCleanPick12).map(preCleanPick11).filter((e) => !IDS.includes(e.id) && !CP9or10(e.id));
  nonEmpty(others, 'others', 180);
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of others) assert.deepEqual(e, was(e.id), e.id);
  assert.deepEqual(Object.keys(kb).sort(), Object.keys(base).sort());
  for (const k of Object.keys(base)) if (k !== 'entries') assert.deepEqual(kb[k], base[k], k);
});

test('C7 doLines.json and do-lines-review.md are unchanged from the base', () => {
  const now = JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'));
  assert.deepEqual(now, JSON.parse(git(`${BASE}:server/lib/doLines.json`)));
  const review = readFileSync(new URL('../../../docs/do-lines-review.md', import.meta.url), 'utf8');
  nonEmpty(review.split('\n'), 'review lines', 150);
  assert.equal(strip9(review), strip9(git(`${BASE}:docs/do-lines-review.md`)));
});

test('C8 each line names its own item, never another batch pick or a generic phrase', () => {
  const heads = IDS.map((id) => [id, live(id).aliases[0]]);
  nonEmpty(heads, 'heads', 9);
  for (const id of IDS) {
    const d = live(id).decision;
    assert.doesNotMatch(d, GENERIC, `${id} generic`);
    for (const [other, a] of heads) {
      if (other === id) continue;
      assert.doesNotMatch(d, new RegExp(`\\b${esc(a)}\\b`, 'i'), `${id} names ${a}`);
    }
  }
});

test('C9 every alias of the 9 reaches its own pick and no card', () => {
  const rows = IDS.flatMap((id) => live(id).aliases.map((a) => [a, id]));
  nonEmpty(rows, 'aliases', 40);
  for (const [a, id] of rows) {
    assert.equal(matchItemToPick(a)?.id, id, `${a} -> pick ${matchItemToPick(a)?.id}`);
    assert.equal(matchItemToCard(a), null, `${a} -> card ${matchItemToCard(a)?.slug}`);
  }
});

test('C10 the 9 lines are distinct and none sits on more than 2 entries', () => {
  const all = IDS.map((id) => BECAME[id].decision);
  assert.equal(new Set(all).size, 9);
  for (const s of all) {
    const n = kb.entries.filter((e) => [e.decision, e.cart_pick, e.tier_note, ...(e.buying_tips || []), ...(e.watch_out || [])].includes(s)).length;
    assert.ok(n <= 2, `${s} on ${n} entries`);
  }
});

test('C11 a list row of each pick’s first alias carries the new line', () => {
  for (const id of IDS) {
    const name = live(id).aliases[0];
    const row = attachCards({ items: [{ name, source: 'user' }] }, { log: false }).items[0];
    assert.equal(row.pickId, id, `${name} pickId ${row.pickId}`);
    assert.equal(row.pickLine, CLEAN_PICK_8.has(id) ? find(kb, id).decision : BECAME[id].decision, `${name} pickLine`);
    assert.equal(row.cardSlug, undefined, `${name} cardSlug ${row.cardSlug}`);
  }
});

test('C12 every pick alias, bare and organic, resolves to the same pick as at the base', () => {
  const queries = base.entries.filter(isPick).flatMap((e) => (e.aliases || []).flatMap((a) => [a, `organic ${a}`]));
  nonEmpty(queries, 'queries', 140);
  for (const q of queries) {
    const now = matchItemToPick(q, kb.entries)?.id;
    const then = matchItemToPick(q, base.entries)?.id;
    assert.equal(now, then, `${q}: ${then} -> ${now}`);
  }
});

test('C13 the live-guard facts hold and the three held picks are untouched', () => {
  const j = live('pick_juice').decision;
  for (const re of [/pasteurized/i, /warning label/i, /\bdyes?\b/i, /no added colou?r/i]) assert.match(j, re, `pick_juice ${re}`);
  assert.ok(ws(j) <= 20, `pick_juice ${ws(j)} words`);
  const k = live('pick_jerky').decision;
  assert.match(k, /celery/i, 'pick_jerky celery');
  assert.doesNotMatch(k, /grass-(fed|finished)/i, 'pick_jerky grass term');
  assert.ok(ws(k) <= 14, `pick_jerky ${ws(k)} words`);
  assert.match(live('pick_canned_tomatoes').decision, /BPA-free/, 'pick_canned_tomatoes BPA-free');
  for (const id of nonEmpty(HELD, 'held', 3)) {
    assert.ok(live(id) && was(id), `${id} missing`);
    assert.deepEqual(live(id), was(id), `${id} moved`);
  }
});
