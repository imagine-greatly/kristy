// Look-for scope (S3): LOOKFOR_OFF_TOPIC over the curated KB. Look for names the healthiest
// version; storing, ripening, rinsing, cooking and tasting belong to the five home cards.
// Lines still on a card sit in LOOKFOR_GRANDFATHER, which can only shrink.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import kb from '../kristy_perimeter_kb.json' with { type: 'json' };
import { nonEmpty } from '../lib/testGuards.js';
import {
  LOOKFOR_OFF_TOPIC, LOOKFOR_ALLOW, LOOKFOR_HOME, LOOKFOR_GRANDFATHER, lookforOffTopic, lintLookforScope,
  lintTierNoteVsLookFor,
} from '../lib/counterCardLint.js';
import { projectEntry } from '../lib/counterCards.js';

const byId = new Map(kb.entries.map((e) => [e.id, e]));
const cards = nonEmpty(kb.entries.filter((e) => e.buying_tips || e.pick_steps || e.look_for), 'look-for corpus', 250);

test('every curated entry is clean outside the grandfather list and the home cards', () => {
  const bad = cards.flatMap((e) => lintLookforScope(e).map((v) => `${e.id}.${v.field}: ${v.text}`));
  assert.deepEqual(bad, [], `off-topic Look for lines:\n  ${bad.join('\n  ')}`);
});

test('the grandfather list only shrinks: every listed line is still on its card and still hits', () => {
  nonEmpty([...LOOKFOR_GRANDFATHER], 'LOOKFOR_GRANDFATHER', 1);
  assert.ok(LOOKFOR_GRANDFATHER.size <= 8, `LOOKFOR_GRANDFATHER grew: ${LOOKFOR_GRANDFATHER.size} > 8 (S3 left 8)`);
  for (const [key, why] of LOOKFOR_GRANDFATHER) {
    const [id, line] = key.split('\t');
    const e = byId.get(id);
    assert.ok(e, `grandfathered card ${id} is gone; drop it from LOOKFOR_GRANDFATHER`);
    const on = ['buying_tips', 'pick_steps', 'look_for'].some((f) => (e[f] || []).includes(line));
    assert.ok(on, `grandfathered line gone from ${id}; drop it from LOOKFOR_GRANDFATHER: ${line}`);
    assert.ok(lookforOffTopic(line), `grandfathered line no longer hits; drop it: ${id}: ${line}`);
    assert.ok(why.length > 10, `${id}: every grandfathered line names its reason`);
  }
});

test('a new offending line goes red, in each field and for each vocabulary family', () => {
  const samples = {
    storage: 'Keep the jar in the fridge after opening.',
    ripening: 'Let them ripen on the counter.',
    rinse: 'Rinse them before eating.',
    cook: 'Toast them in a dry pan.',
    taste: 'Grass-fed butter tastes of the pasture.',
  };
  assert.deepEqual(Object.keys(samples).sort(), Object.keys(LOOKFOR_OFF_TOPIC).sort(), 'one sample per vocabulary family');
  for (const [family, line] of nonEmpty(Object.entries(samples), 'samples', 5)) {
    assert.equal(lookforOffTopic(line), family, line);
    for (const field of ['look_for', 'pick_steps', 'buying_tips']) {
      const v = lintLookforScope({ id: 'x_new_card', [field]: ['Look for USDA Organic.', line] });
      assert.equal(v.length, 1, `${field}: ${line}`);
      assert.equal(v[0].code, 'LOOKFOR_OFF_TOPIC');
    }
  }
  // A real card plus one offending line: the corpus test would go red.
  const frozen = byId.get('frozen');
  assert.equal(lintLookforScope({ ...frozen, buying_tips: [...frozen.buying_tips, 'Thaw it overnight in the fridge.'] }).length, 1);
  // The grandfather key is the exact line, not the card: a reworded copy of a held line fails.
  assert.equal(lintLookforScope({ ...frozen, buying_tips: ['Keep the home freezer at 0°F.'] }).length, 1);
});

test('home cards are exempt, and real criteria do not hit', () => {
  assert.equal(LOOKFOR_HOME.size, 5);
  for (const id of LOOKFOR_HOME) assert.ok(byId.has(id), `home card ${id} exists`);
  assert.deepEqual(lintLookforScope({ id: 'washing_produce', buying_tips: ['Rinse under running water.'] }), []);
  for (const ok of [
    'Look for USDA Organic and 100% grass-fed on the label.',
    'Pick it from the refrigerated case.',
    'Read the list: tomatoes and salt, nothing added.',
    'Look for ‘tree-ripened’ on the box.',
    'Pick cold-pressed oil in dark glass.',
  ]) assert.equal(lookforOffTopic(ok), null, ok);
});

test('every allowlist phrase would hit without its mask', () => {
  for (const [re, why] of nonEmpty(LOOKFOR_ALLOW, 'LOOKFOR_ALLOW', 1)) {
    const phrase = 'tree-ripened vine ripened'.match(new RegExp(re.source, 'i'))?.[0];
    assert.ok(phrase, `allow ${re} has no sample`);
    assert.ok(Object.values(LOOKFOR_OFF_TOPIC).some((v) => v.test(phrase)), `allow ${re} masks nothing (${why})`);
  }
});

test('tier_note never restates look_for[0] on any projected card; a restating one goes red', () => {
  const projected = nonEmpty(cards.filter((e) => e.tier_note).map((e) => projectEntry(e)), 'cards with a tier_note', 100);
  const bad = projected.flatMap((c) => lintTierNoteVsLookFor(c).map((v) => `${c.slug ?? c.id}: ${v.detail}`));
  assert.deepEqual(bad, [], bad.join('\n  '));
  const chicken = projectEntry(byId.get('chicken'));
  assert.deepEqual(lintTierNoteVsLookFor(chicken), [], 'chicken passes');
  const v = lintTierNoteVsLookFor({ ...chicken, tier_note: `${chicken.look_for[0]} Audited.` });
  assert.equal(v[0]?.code, 'TIER_NOTE_RESTATES_LOOK_FOR');
  assert.equal(lintTierNoteVsLookFor({ buying_tips: ['Certified Humane Pasture-Raised logo on the pack.'], tier_note: 'Certified Humane pasture-raised, on the pack.' })[0]?.code, 'TIER_NOTE_RESTATES_LOOK_FOR', 'reads buying_tips on a KB entry');
});

test('chicken v3-flat Look for: five noun-phrase lines, no duplicate, no Non-GMO row', () => {
  const c = projectEntry(byId.get('chicken'));
  const lines = [...c.look_for, ...c.pick_steps];
  assert.equal(lines.length, 5, lines.join(' | '));
  assert.equal(new Set(lines).size, 5);
  for (const l of lines) assert.doesNotMatch(l, /^(look|read|pick|choose|check|buy|find|skip|ask)\b/i, l);
  assert.doesNotMatch(lines.join(' '), /non-gmo/i);
  assert.ok(!c.labels_decoded.some((l) => c.instead.includes(l.term)), 'the Can\u2019t-find-it line borrows no label meaning');
});

// add_card rows (scripts/lookfor/addCard.mjs, ADD-CARD.md): a new item card, or a pick promoted to one.
import { checkAddCard, applyAddCard } from '../scripts/lookfor/addCard.mjs';
import doLines from '../lib/doLines.json' with { type: 'json' };
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const archiveDir = mkdtempSync(join(tmpdir(), 'addcard-'));
const tuna = byId.get('canned_tuna');
writeFileSync(join(archiveDir, 'tuna.md'), `Fetched ${tuna.sources[0].url}\nPole-and-troll caught tuna is a best choice.\n`);
const opts = { doLines: { ...doLines, zz_new_tuna: doLines.canned_tuna }, archiveDir, evidenceTiers: kb.evidence_tiers };
const entry = (over = {}) => ({ ...structuredClone(tuna), id: 'zz_new_tuna', aliases: ['zz tinned fish'], watch_out: tuna.watch_out.slice(0, 3), ...over });
const row = (over = {}, e = {}) => ({ op: 'add_card', entry: entry(e), fetched: [{ url: tuna.sources[0].url, fetched: true, archive: 'tuna.md' }], ...over });
const check = (r, entries = kb.entries) => checkAddCard(r, entries, opts);

test('add_card: a lint-clean card with fetched sources adds once, then reads as already applied', () => {
  assert.deepEqual(check(row()), { status: 'add', errors: [] });
  const entries = structuredClone(kb.entries);
  applyAddCard(entries, row());
  assert.equal(entries.length, kb.entries.length + 1);
  assert.equal(entries[entries.findLastIndex((e) => !e.kind)].id, 'zz_new_tuna', 'goes after the last item card');
  assert.deepEqual(check(row(), entries), { status: 'already', errors: [] });
  assert.match(check(row({}, { decision: 'Other tuna.' }), entries).errors[0], /duplicate id/);
});

test('add_card refuses duplicate ids, a kind, unknown fields and missing required fields', () => {
  for (const id of ['chicken', 'pick_juice', 'fam_tinned_fish']) assert.match(check(row({}, { id })).errors.join(), /duplicate id/, id);
  assert.match(check(row({}, { kind: 'pick' })).errors.join(), /no kind/);
  assert.match(check(row({}, { price: 'cheap' })).errors.join(), /unknown field price/);
  assert.match(check(row({}, { asked_as: undefined })).errors.join(), /missing asked_as/);
  assert.match(check(row({}, { asked_as: ['a?', 'a?', 'b?'] })).errors.join(), /asked_as needs 3/);
  assert.match(check(row({}, { buying_tips: tuna.buying_tips.slice(0, 2) })).errors.join(), /buying_tips holds 2/);
  assert.match(check(row({}, { family: 'fam_nope' })).errors.join(), /family fam_nope/);
  assert.match(check(row({}, { watch_out: tuna.watch_out })).errors.join(), /watch_out holds 4/);
});

test('add_card refuses sources that were not fetched and recorded in the row', () => {
  assert.match(check(row({ fetched: [] })).errors.join(), /no fetched:true record/);
  assert.match(check(row({ fetched: [{ url: tuna.sources[0].url, archive: 'tuna.md' }] })).errors.join(), /no fetched:true record/);
  assert.match(check(row({ fetched: [{ url: tuna.sources[0].url, fetched: true, archive: 'gone.md' }] })).errors.join(), /not found/);
  writeFileSync(join(archiveDir, 'other.md'), 'some other page');
  assert.match(check(row({ fetched: [{ url: tuna.sources[0].url, fetched: true, archive: 'other.md' }] })).errors.join(), /URL not verbatim/);
  assert.match(check(row({ fetched: [{ url: tuna.sources[0].url, fetched: true, archive: 'tuna.md', quote: 'made up line' }] })).errors.join(), /quote not verbatim/);
  assert.deepEqual(check(row({ fetched: [{ url: tuna.sources[0].url, fetched: true, quote: 'Pole-and-troll caught tuna is a best choice.' }] })).errors, []);
  assert.match(check(row({ fetched: [{ url: tuna.sources[0].url, fetched: true }] })).errors.join(), /archive path or a quote/);
  assert.match(check(row({}, { sources: ['Seafood Watch, from memory'] })).errors.join(), /must be \{name, url\}/);
});

test('add_card refuses an alias that steals a card alias unless it is longer and more specific', () => {
  assert.match(check(row({}, { aliases: ['Canned tuna'] })).errors.join(), /steals canned_tuna's "canned tuna"/);
  assert.match(check(row({}, { aliases: ['tuna'] })).errors.join(), /steals canned_tuna.*shorter, generic/);
  assert.match(check(row({}, { aliases: ['wild caught canned tuna fish'] })).errors.join(), /over 4 words/);
  assert.deepEqual(check(row({}, { aliases: ['canned tuna in oil'] })).errors, []);
});

test('add_card runs the lint bar and the two-line rule', () => {
  assert.match(check(row({}, { tier_note: "Light tuna's label." })).errors.join(), /lint COPY_STRAIGHT_QUOTE/);
  assert.match(check(row({}, { decision: 'Pole- or troll-caught light skipjack tuna in olive oil, water or its own juice.' })).errors.join(), /two-line: decision/);
  assert.match(check(row({}, { buying_tips: ['Keep the opened can in the fridge.', ...tuna.buying_tips.slice(1)] })).errors.join(), /LOOKFOR_OFF_TOPIC/);
  assert.match(checkAddCard(row(), kb.entries, { ...opts, doLines }).errors.join(), /no do line/);
});

// v3-newcards (ef4f2f8): pick_frozen_peas became the frozen_peas card; the fixture pick is a live one.
test('add_card with promotes replaces the pick in its slot; the pick aliases move with it', () => {
  const pick = byId.get('pick_english_muffins');
  const r = row({ promotes: pick.id }, { aliases: pick.aliases });
  assert.deepEqual(check(r).errors, []);
  assert.match(check(row({ promotes: 'pick_nope' })).errors.join(), /no such pick/);
  assert.match(check(row({ promotes: 'chicken' })).errors.join(), /no such pick/);
  const entries = structuredClone(kb.entries);
  const at = entries.findIndex((e) => e.id === pick.id);
  applyAddCard(entries, r);
  assert.equal(entries.length, kb.entries.length);
  assert.equal(entries[at].id, 'zz_new_tuna');
  assert.ok(!entries.some((e) => e.id === pick.id));
  assert.deepEqual(check(r, entries), { status: 'already', errors: [] });
});
