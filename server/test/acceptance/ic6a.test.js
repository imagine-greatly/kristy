// IC-6a: seafood folds, fresh_vs_previously_frozen_fish and fish_freshness_at_counter → seafood_counter (docs/ITEM-CARDS-PLAN.md IC-6a). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { scoreEntries, PERIMETER_SECTIONS } from '../../lib/perimeter.js';
import { inScope } from '../../lib/counterScope.js';
import { RETIRED, ESSENTIALS, projectEntry, parseReviewTable } from '../../lib/counterCards.js';
import { lintCard, readability, lintRepeatedClaim, OWNED_FACTS } from '../../lib/counterCardLint.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import { preCleanJ4 } from './cartPlain.js';
kb.entries = kb.entries.map(preCleanJ4); // clean-sweep-J4: seafood pins read 6d98564; cleanPickJ4.test.js owns live copy.
import doLines from '../../lib/doLines.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const PRE = JSON.parse(execFileSync('git', ['show', '663ca3d:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const pre = (id) => PRE.entries.find((e) => e.id === id);
const now = (id) => kb.entries.find((e) => e.id === id);
const admits = (top) => !!(top && top.score >= 2 && top.aliasScore > 0);
const TO = 'seafood_counter';
const FOLDED = ['fresh_vs_previously_frozen_fish', 'fish_freshness_at_counter'];
const WITHHELD = new Set(['salmon', 'fresh salmon', 'tuna']);
const EXTRA_ASKS = ['fresh fish', 'frozen fish', 'fish counter', 'what should fish smell like'];
const SAFETY = ["Don't re-freeze fish that was sold thawed.", 'Smell it. Clean and briny is right. Sharp, fishy or ammonia is not.'];
const SPOKEN = ['decision', 'why', 'short_answer', 'detail', 'kristy_take', 'tier_note', 'buying_tips', 'watch_out', 'look_for', 'pick_steps', 'science', 'labels_decoded'];
const strings = (e) => SPOKEN.flatMap((f) => [].concat(e?.[f] ?? [])).flatMap((x) => (typeof x === 'string' ? [x] : Object.values(x ?? {}).filter((v) => typeof v === 'string')));
const norm = (s) => String(s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
const sentences = (s) => norm(s).split(/(?<=[.!?])\s+/).filter(Boolean);
const POINTER = /^[A-Z][^:]{0,40}: see (.+)\.$/;
const ownedElsewhere = (s, to) => OWNED_FACTS.some((r) => r.owner !== to && r.family.includes(to) && r.pattern.test(s));
const term = (l) => norm(typeof l === 'string' ? l : (l.term ?? Object.values(l)[0]));
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const review = parseReviewTable(readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8'));

test('C1 folded ids are retired everywhere', () => {
  for (const id of FOLDED) {
    assert.ok(pre(id), `${id} missing from 663ca3d`);
    assert.equal(now(id), undefined, `${id} still in the KB`);
    assert.ok(RETIRED.includes(id), `${id} not in RETIRED`);
    assert.equal(doLines[id], undefined, `${id} still has a do line`);
    assert.ok(!review.has(id), `${id} still in do-lines-review`);
    for (const r of OWNED_FACTS) assert.ok(r.owner !== id && !r.family.includes(id), `${id} in OWNED_FACTS ${r.fact}`);
  }
});

test('C2 aliases and asked_as moved', () => {
  const to = now(TO);
  for (const id of FOLDED) {
    for (const a of nonEmpty(pre(id).aliases, `${id} aliases`, 5)) {
      if (WITHHELD.has(a)) continue;
      assert.ok(to.aliases.includes(a), `${id} alias "${a}" not on ${TO}`);
    }
    for (const q of nonEmpty(pre(id).asked_as, `${id} asked_as`, 3)) assert.ok(to.asked_as.includes(q), `${id} ask "${q}" not on ${TO}`);
  }
  for (const a of WITHHELD) assert.ok(!to.aliases.includes(a), `${TO} took withheld alias "${a}"`);
});

test('C3 folded questions reach the survivor', () => {
  const asks = [...FOLDED.flatMap((id) => pre(id).asked_as), ...EXTRA_ASKS];
  for (const q of nonEmpty(asks, 'asks', 10)) {
    assert.ok(inScope(q).ok, `"${q}" out of scope`);
    const top = scoreEntries(q, 3)[0];
    assert.ok(admits(top), `"${q}" not admitted`);
    assert.equal(top.entry.id, TO, `"${q}" → ${top.entry.id}`);
  }
});

test('C4 sources moved', () => {
  const have = new Set(now(TO).sources.map((s) => JSON.stringify(s)));
  for (const id of FOLDED) for (const s of nonEmpty(pre(id).sources, `${id} sources`, 3)) assert.ok(have.has(JSON.stringify(s)), `${id} source lost: ${JSON.stringify(s)}`);
  assert.ok(JSON.stringify(now(TO).sources).includes('https://nofima.com/worth-knowing/how-to-check-how-fresh-fish-is/'), 'nofima source lost');
});

test('C5 tips, watch-outs, labels and safety sentences moved', () => {
  const body = norm(strings(now(TO)).join('\n'));
  for (const id of FOLDED) {
    for (const f of ['buying_tips', 'watch_out']) {
      for (const s of nonEmpty([].concat(pre(id)[f] ?? []).flatMap(sentences), `${id} ${f}`, 2)) {
        if (POINTER.test(s) || ownedElsewhere(s, TO)) continue;
        // No-price rule (#8): the fold drops "for the best price and control" from this one tip.
        if (/best price/.test(s)) { assert.ok(body.includes(norm('Buy frozen and thaw at home on your own schedule.')), 'price-free frozen tip missing'); continue; }
        assert.ok(body.includes(s), `${id} ${f} sentence not on ${TO}: ${s}`);
      }
    }
    for (const l of pre(id).labels_decoded ?? []) {
      if (ownedElsewhere(JSON.stringify(l), TO)) continue;
      assert.ok((now(TO).labels_decoded ?? []).map(term).includes(term(l)), `${id} label "${term(l)}" not on ${TO}`);
    }
  }
  const terms = (now(TO).labels_decoded ?? []).map(term);
  assert.equal(new Set(terms).size, terms.length, `${TO} label terms repeat`);
  for (const s of SAFETY) assert.ok(body.includes(norm(s)), `safety sentence lost: ${s}`);
});

test('C6 essentials, shortcuts, section rules and try pool intact', () => {
  assert.deepEqual([...ESSENTIALS], ['organic_worth_it_by_type', 'egg_labels', 'salmon_wild_vs_farmed', 'label_front_vs_back',
    'produce_ripeness_by_item', 'beef_grassfed_vs_grainfed', 'judging_meat_at_the_case', 'whole_vs_reduced_fat_milk']);
  for (const id of ESSENTIALS) assert.ok(now(id), `essential ${id} missing`);
  const sections = nonEmpty(PERIMETER_SECTIONS, 'sections', 6);
  for (const { id } of nonEmpty(sections.flatMap((s) => s.shortcuts ?? []), 'shortcuts', 12)) {
    assert.ok(!FOLDED.includes(id), `shortcut names folded ${id}`);
    assert.ok(now(id), `shortcut names missing ${id}`);
  }
  for (const s of sections) {
    const ids = (s.shortcuts ?? []).map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length, `section shortcut ids repeat: ${ids}`);
  }
  const files = execFileSync('git', ['ls-files'], { cwd: ROOT }).toString().split('\n').filter((f) => /server\/.*(sectionRules\.json|tryPool\.js)$/.test(f));
  nonEmpty(files, 'sectionRules/tryPool files', 2);
  for (const f of files) {
    const src = readFileSync(join(ROOT, f), 'utf8');
    for (const id of FOLDED) assert.ok(!src.includes(id), `${f} still names ${id}`);
  }
});

test('C7 survivor lints clean', () => {
  const e = now(TO);
  assert.deepEqual(lintCard(projectEntry(e, { doLine: doLines[TO] })), [], `${TO} lint`);
  assert.deepEqual(readability(e), [], `${TO} readability`);
  assert.deepEqual(lintRepeatedClaim(e), [], `${TO} repeated claim`);
  const was = new Set(strings(pre(TO)).flatMap(sentences));
  for (const s of strings(e).flatMap(sentences)) if (!was.has(s)) assert.doesNotMatch(s, RULE4, `${TO}: ${s}`);
  assert.equal(OWNED_FACTS.length, 14);
});
