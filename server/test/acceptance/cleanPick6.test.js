import { restoreOrganicCarts, liveDecision } from './cartPlain.js';
// clean-pick-6 (Devon 2026-10-20, Q1 A organic on every produce): B7a, the 17 produce picks name their own item organic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { lintCard, lintPick, words as lintWords } from '../../lib/counterCardLint.js';
import { attachCards, matchItemToCard, matchItemToPick } from '../../lib/listMatch.js';
import { CLEAN_PICK_7, CLEAN_PICK_9, CLEAN_PICK_10, preCleanPick10, preCleanPick9, preCleanPick11, preCleanPick12, preCleanPick8, CLEAN_PICK_8, prePickAvoid } from './twoLinePin.js';

// clean-pick-10 owns its ids now; this batch skips them like the clean-pick-9 ids.
const CP9or10 = (id) => CLEAN_PICK_9.has(id) || CLEAN_PICK_10.has(id);

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const git = (ref) => execFileSync('git', ['show', ref], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
const kb = restoreOrganicCarts(JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8')));
import { preSwapPicks1 } from './twoLinePin.js';
kb.entries = preSwapPicks1(kb.entries); // swap-picks-1: 8 swap picks + 2 aliases after 58d6160; swap_picks_1.test.js owns them.
import { preT6_4 } from './twoLinePin.js';
kb.entries = kb.entries.map(preT6_4); // t6-4: produce/label pins read 2f67540; t6_4.test.js owns live copy.
import { preT6_3 } from './twoLinePin.js';
kb.entries = kb.entries.map(preT6_3); // t6-3: pantry pins read 6d6ca49; t6_3.test.js owns live copy.
import { preT6_1, preT6_2 } from "./twoLinePin.js";
kb.entries = kb.entries.map(preT6_2); // t6-2: dairy/egg pins read ca32bef; t6_2.test.js owns live copy.
kb.entries = kb.entries.map(preT6_1); // t6-1: the 15 meat/seafood cards read as of 85c399e; t6_1.test.js owns them now
const base = JSON.parse(git('c6d3ff2:server/kristy_perimeter_kb.json'));
const find = (k, id) => k.entries.find((e) => e.id === id);
// clean-pick-9 owns pick_celery and pick_cucumbers now; this batch reads them as of 96d61e2.
const live = (id) => preCleanPick9(preCleanPick10(find(kb, id)));
// clean-pick-9 moved eight review headlines; every other line stays.
const strip9 = (t) => t.split('\n').filter((l) => !(l.startsWith('| `') && (CP9or10(l.split('`')[1]) || CLEAN_PICK_8.has(l.split('`')[1])))).join('\n');
const was = (id) => find(base, id);

const BECAME = {
  pick_cucumbers: { decision: 'Organic cucumbers, firm and dark green, without soft spots or a bulging middle.', carry: /^Organic cucumbers\b/, keep: /bulging middle/ },
  pick_asparagus: { decision: 'Organic asparagus with dry, closed, compact tips and no limp stalks.', carry: /^Organic asparagus\b/, keep: /closed, compact tips/ },
  pick_corn: { decision: 'Organic corn with green husks and fresh silk, without dried-out ears.', carry: /^Organic corn\b/, keep: /green husks and fresh silk/ },
  pick_eggplant: { decision: 'Organic eggplant, heavy, shiny and smooth, with a green stem free of mold.', carry: /^Organic eggplant\b/, keep: /green stem free of mold/ },
  pick_zucchini: { decision: 'Organic zucchini, small-to-medium, glossy and firm, that feel heavy for their size.', carry: /^Organic zucchini\b/, keep: /heavy for their size/ },
  pick_cilantro: { decision: 'Organic cilantro in bright, upright bunches, without yellow or brown leaves.', carry: /^Organic cilantro\b/, keep: /yellow or brown leaves/ },
  pick_parsley: { decision: 'Organic parsley, upright and bright green, without brown spots or yellowed leaves.', carry: /^Organic parsley\b/, keep: /brown spots or yellowed leaves/ },
  pick_basil: { decision: 'Organic basil, bright and upright, with no limp leaves or brown spots.', carry: /^Organic basil\b/, keep: /no limp leaves or brown spots/ },
  pick_snap_peas: { decision: 'Organic snap peas in firm, bright green pods, without blemishes.', carry: /^Organic snap peas\b/, keep: /without blemishes/ },
  pick_kohlrabi: { decision: 'Organic kohlrabi bulbs, firm and heavy in your hand, without cracks or bruises.', carry: /^Organic kohlrabi\b/, keep: /cracks or bruises/ },
  pick_okra: { decision: 'Organic okra, firm and bright green, without limp, moldy or dried-out pods.', carry: /^Organic okra\b/, keep: /limp, moldy or dried-out pods/ },
  pick_swiss_chard: { decision: 'Organic chard, dark green, with unsplit stalks and no discoloration.', carry: /^Organic chard\b/, keep: /unsplit stalks and no discoloration/ },
  pick_mangoes: { decision: 'Organic mangoes that yield slightly to gentle pressure; red color does not indicate ripeness.', carry: /^Organic mangoes\b/, keep: /red color does not indicate ripeness/ },
  pick_celery: { decision: 'Organic celery with tight, crisp stalks, without any limpness in the bunch.', carry: /^Organic celery\b/, keep: /tight, crisp stalks/ },
  pick_winter_squash: { decision: 'Organic winter squash, firm and heavy-for-size, with hard skin and no sunken or moldy spots.', carry: /^Organic winter squash\b/, keep: /heavy-for-size/ },
  pick_ginger_turmeric: { decision: 'Organic ginger and turmeric roots, firm, ginger smooth and uncracked; keep both sealed and refrigerated.', carry: /^Organic ginger and turmeric\b/, keep: /sealed and refrigerated/ },
  pick_microgreens: { decision: 'Organic microgreens, rarely washed before packing, for you to rinse before use.', carry: /^Organic microgreens\b/, keep: /rinse before use/ },
};
const IDS = Object.keys(BECAME);
const BANNED = /\b(health|healthy|healthier|safer|risk|cancer|disease|toxic|toxin|detox|pesticide-free|synthetic|price|cost|cheap|expensive)\b/i;
const TREATMENT = /\b(causes?|prevents?|lowers? (the )?risk|carcinogen|cancer|tumou?rs?|toxic|unsafe|harm\w*|risks?|linked to|hyperactiv|behaviou?r|attention|neurobehavioral|exacerbate)/i;
const GENERIC = /\borganic (produce|vegetables?|veg|fruits?|herbs?|greens)\b/i;
const ORGANIC = /\borganic\b/i;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isPick = (e) => e && e.kind === 'pick';

nonEmpty(IDS, 'IDS', 17);

test('C1 the 17 picks equal their base entries with only the decision replaced, each naming its own item organic', () => {
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
    assert.match(was(id).decision, BECAME[id].keep, `${id} keep phrase not in base`);
    assert.match(live(id).decision, BECAME[id].keep, `${id} keep phrase lost`);
  }
});

test('C4 no new line carries a banned or treatment word, first person, a dash, a straight apostrophe, a digit or a question mark', () => {
  const all = IDS.map((id) => BECAME[id].decision);
  nonEmpty(all, 'decisions', 17);
  for (const s of all) {
    assert.doesNotMatch(s, BANNED, s);
    assert.doesNotMatch(s, TREATMENT, s);
    assert.doesNotMatch(s, /\b(I|me|my|mine|we|our|ours|us)\b/, s);
    assert.ok(!s.includes('—') && !s.includes('–'), s);
    assert.ok(!s.includes("'"), s);
    assert.doesNotMatch(s, /[0-9?]/, s);
  }
});

test('C5 organic is new on all 17 lines and unchanged on every other pick', () => {
  for (const id of IDS) {
    assert.doesNotMatch(was(id).decision, ORGANIC, `${id} base already organic`);
    assert.ok(live(id).decision.startsWith('Organic '), id);
  }
  const otherPicks = (k) => k.entries.filter((e) => isPick(e) && !IDS.includes(e.id) && !CLEAN_PICK_7.has(e.id));
  nonEmpty(otherPicks(base), 'other picks', 4);
  const count = (k) => otherPicks(k).filter((e) => ORGANIC.test(e.decision || '')).length;
  assert.equal(count({ entries: kb.entries.map(preCleanPick8) }), count(base));
});

test('C6 entries outside the batch deepEqual c6d3ff2; count and top-level keys unchanged', () => {
  const others = kb.entries.map(preCleanPick8).map(preCleanPick12).map(preCleanPick11).filter((e) => !IDS.includes(e.id) && !CLEAN_PICK_7.has(e.id) && !CP9or10(e.id));
  nonEmpty(others, 'others', 170);
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of others) assert.deepEqual(e, was(e.id), e.id);
  assert.deepEqual(Object.keys(kb).sort(), Object.keys(base).sort());
  for (const k of Object.keys(base)) if (k !== 'entries') assert.deepEqual(kb[k], base[k], k);
});

test('C7 doLines.json and do-lines-review.md are unchanged from c6d3ff2', () => {
  const now = JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'));
  assert.deepEqual(now, JSON.parse(git('c6d3ff2:server/lib/doLines.json')));
  const review = readFileSync(new URL('../../../docs/do-lines-review.md', import.meta.url), 'utf8');
  nonEmpty(review.split('\n'), 'review lines', 150);
  assert.equal(strip9(review), strip9(git('c6d3ff2:docs/do-lines-review.md')));
});

test('C8 each line names its own item, never another batch pick or generic produce', () => {
  const heads = IDS.map((id) => [id, live(id).aliases[0]]);
  nonEmpty(heads, 'heads', 17);
  for (const id of IDS) {
    const d = live(id).decision;
    assert.doesNotMatch(d, GENERIC, `${id} generic`);
    for (const [other, a] of heads) {
      if (other === id) continue;
      assert.doesNotMatch(d, new RegExp(`\\b${esc(a)}\\b`, 'i'), `${id} names ${a}`);
    }
  }
});

test('C9 every alias of the 17 reaches its own pick and no card', () => {
  const rows = IDS.flatMap((id) => live(id).aliases.map((a) => [a, id]));
  nonEmpty(rows, 'aliases', 70);
  for (const [a, id] of rows) {
    assert.equal(matchItemToPick(a)?.id, id, `${a} -> pick ${matchItemToPick(a)?.id}`);
    assert.equal(matchItemToCard(a), null, `${a} -> card ${matchItemToCard(a)?.slug}`);
  }
});

test('C10 the 17 lines are distinct and none sits on more than 2 entries', () => {
  const all = IDS.map((id) => BECAME[id].decision);
  assert.equal(new Set(all).size, 17);
  for (const s of all) {
    const n = kb.entries.filter((e) => [e.decision, e.cart_pick, e.tier_note, ...(e.buying_tips || []), ...(e.watch_out || [])].includes(s)).length;
    assert.ok(n <= 2, `${s} on ${n} entries`);
  }
});

test('C11 a list row of each pick’s first alias carries the new organic line', () => {
  for (const id of IDS) {
    const name = live(id).aliases[0];
    const row = attachCards({ items: [{ name, source: 'user' }] }, { log: false }).items[0];
    assert.equal(row.pickId, id, `${name} pickId ${row.pickId}`);
    assert.equal(row.pickLine, liveDecision(id), `${name} pickLine`);
    assert.equal(row.cardSlug, undefined, `${name} cardSlug ${row.cardSlug}`);
  }
});

test('C12 every pick alias, bare and organic, resolves to the same pick as at c6d3ff2', () => {
  const queries = base.entries.filter(isPick).flatMap((e) => (e.aliases || []).flatMap((a) => [a, `organic ${a}`]));
  nonEmpty(queries, 'queries', 140);
  for (const q of queries) {
    const now = matchItemToPick(q, kb.entries)?.id;
    const then = matchItemToPick(q, base.entries)?.id;
    assert.equal(now, then, `${q}: ${then} -> ${now}`);
  }
});
