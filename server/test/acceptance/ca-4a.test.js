// CA-4a: Eggs and Milk fronts, the dairy ladder, pick_milk retired (docs/CARD-ALIGNMENT-PLAN.md CA-4). Written by the planner; do not edit.
import { beforeCa7 } from './ca7Superseded.js';
import { beforeTwoLine } from './twoLinePin.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as lint from '../../lib/counterCardLint.js';
import { projectEntry, parseReviewTable } from '../../lib/counterCards.js';
import { matchItemToCard, matchItemToPick } from '../../lib/listMatch.js';
import { nonEmpty } from '../../lib/testGuards.js';
import { assertPassRule } from './passRule.js';

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ROOT = join(SERVER, '..');
const BASE_REF = 'd707172';
const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
const base = JSON.parse(execFileSync('git', ['show', `${BASE_REF}:server/kristy_perimeter_kb.json`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const reviewText = readFileSync(join(ROOT, 'docs', 'do-lines-review.md'), 'utf8');
const reviewed = parseReviewTable(reviewText);
const doLines = JSON.parse(readFileSync(join(SERVER, 'lib', 'doLines.json'), 'utf8'));
const now = (id) => {
  const e = beforeTwoLine(kb.entries.find((e) => e.id === id));
  const prior = beforeCa7(e);
  return id === 'egg_labels' ? { ...prior, decision: e.decision } : prior;
};
const was = (id) => base.entries.find((e) => e.id === id);
const idOf = (m) => (m ? m.slug ?? m.id ?? m.entry?.id ?? null : null);
const without = (e, keys) => Object.fromEntries(Object.entries(e ?? {}).filter(([k]) => !keys.includes(k)));
const COPY = ['decision', 'short_answer', 'why', 'detail', 'kristy_take', 'tier_note', 'question', 'buying_tips', 'watch_out', 'pick_steps', 'science', 'instead', 'cart_pick', 'labels_decoded', 'eyebrow_short'];
const leaves = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(leaves) : v && typeof v === 'object' ? Object.values(v).flatMap(leaves) : []);
const copy = (e) => COPY.flatMap((f) => leaves(e?.[f]));
const fresh = (id) => { const old = new Set(copy(was(id))); return copy(now(id)).filter((s) => !old.has(s)); };

const MILK_ID = 'whole_vs_reduced_fat_milk';
const YOG_ID = 'yogurt_plain_vs_flavored';
const EGG = {
  decision: 'Eggs with pasture-raised, organic, corn- and soy-free on one carton.',
  tier_note: 'Corn- and soy-free means neither is in the hens’ feed; “soy-free” alone can still mean corn.',
  instead: 'Soy-free, organic, and pasture-raised, then organic and pasture-raised; each keeps pasture and organic feed.',
  cart_pick: 'Pasture-raised organic corn- and soy-free eggs',
  aliases: [...was('egg_labels').aliases, 'Pasture-raised organic corn- and soy-free eggs', 'organic corn- and soy-free eggs'],
  pick_steps: ['“Pasture-raised” means time outdoors on pasture, audited only with a certifier’s seal.', '“Organic” means certified organic feed and outdoor access.', 'Skip “cage-free” and “vegetarian-fed” cartons; neither promises time outdoors.'],
  why: 'A hen eats what she is given. Organic, pasture and feed words tell you about both her food and her life.',
  short_answer: 'Look for pasture-raised, organic, and corn- and soy-free together. Next is soy-free organic pasture-raised, then organic pasture-raised. A certifier’s seal backs the pasture claim.',
  kristy_take: 'Pasture alone leaves the feed question open. Find all three claims together, then check the pack date: a fresh egg fries with a tall yolk and tight white.',
};
const EGG_DO = 'Find all three words on one carton, plus a certifier’s pasture seal.';
const EGG_WATCH_ORDER = [0, 12, 1, 11, 3, 4, 2, 5, 6, 10, 7, 8, 9, 13, 14, 15, 16];
const EGG_OLD_CHEAP = 'Plain conventional eggs are still one of the cheapest complete proteins in the store.';
const EGG_SCIENCE_OLD = '‘Vegetarian-fed’ keeps her off animal protein, yet a hen on real pasture eats bugs.';
const EGG_SCIENCE_NEW = '‘Vegetarian-fed’ keeps her off animal foods, yet a hen on real pasture eats bugs.';
const EGG_CHEAP = 'Plain conventional eggs are still one of the lowest-cost animal foods in the store.';
const EGG_DETAIL_OLD = 'The order is what she ate, then how it was grown, then how much room she had.';
const EGG_DETAIL_NEW = 'The standard is all three on one carton: what she ate, how it was grown, and how much room she had.';
const EGG_LABEL = { term: 'Corn- and soy-free', meaning: 'The feed contains neither corn nor soy; both words must be printed.' };

const MILK = {
  decision: 'Raw from a trusted local farmer first, then low-temp pasteurized, 100% grass-fed.',
  tier_note: 'Vat, or low-temp, pasteurizing holds milk at 145°F for 30 minutes; regular gets 161°F for 15 seconds.',
  instead: 'Organic, low-temp pasteurized whole milk: organic rules put cows on pasture through grazing season.',
  cart_pick: 'Low-temp pasteurized grass-fed whole milk',
  pick_steps: ['Raw means unpasteurized: milk that skipped the heat step.', 'Next: “vat pasteurized” or “low-temperature” printed with 100% grass-fed.', '100% grass-fed on milk means the cows ate grass and hay, never grain.'],
  why: 'Heat, homogenizing and skimming each change milk. Whole milk keeps its milkfat; reduced-fat milk has some removed.',
  short_answer: 'Raw milk from a trusted local farmer comes first. Next is low-temp pasteurized, 100% grass-fed whole milk. Ultra-pasteurized milk is heated to about 280°F.',
};
const MILK_DO = 'Check the side panel for the pasteurization words and a grass-fed seal.';
const MILK_UHT = '“Ultra-pasteurized” or “UHT” on the carton means about 280°F for a few seconds: skip it.';
const MILK_LABELS = [
  { term: 'Vat pasteurized', meaning: 'Held at 145°F for 30 minutes; also printed as low-temperature pasteurized.' },
  { term: 'Ultra-pasteurized', meaning: 'Heated to about 280°F for about 2 seconds.' },
];

const YOG = {
  decision: 'Plain Greek yogurt made from 100% grass-fed milk.',
  tier_note: 'Plain means no added sugar, so sweeten it at home with fruit or honey.',
  instead: 'Plain organic whole-milk yogurt, Greek or regular, is next when no 100% grass-fed tub is there.',
  cart_pick: 'Plain Greek yogurt, 100% grass-fed',
  aliases: [...was(YOG_ID).aliases, 'Plain Greek yogurt, 100% grass-fed'],
  pick_steps: ['Greek means strained, so the yogurt is thicker and holds less whey.', '100% grass-fed on the tub means the cows ate grass and hay, never grain.', 'Skip flavored and fruit-on-the-bottom tubs; that is where the added sugar is.'],
  why: 'Flavored yogurt carries added sugar; plain is milk and cultures. Whole-milk yogurt keeps the milkfat the milk came with.',
  short_answer: 'Plain Greek yogurt from 100% grass-fed milk. Plain organic whole-milk yogurt is next. Flavored tubs are where the added sugar is.',
};
const YOG_DO = 'Check the ingredients for milk and cultures, with nothing after them.';
const YOG_TIPS = {
  'Greek/strained is higher protein; whole-milk versions are more filling.': 'Greek or strained yogurt is thicker; whole-milk versions are more filling.',
  'Greek and skyr are strained: thicker, more protein per spoon.': 'Greek and skyr are strained: thicker, with less whey.',
};
const YOG_DETAIL_OLD = 'Plain yogurt, especially Greek or strained, is a clean high-protein whole food.';
const YOG_DETAIL_NEW = 'Plain yogurt, especially Greek or strained, is a whole food: milk and cultures.';
const YOG_SKYR = 'Strained. Thicker, with less whey.';
const YOG_LABELS = [
  { term: 'Greek', meaning: 'Yogurt strained to remove whey, which leaves it thicker.' },
  { term: 'Plain', meaning: 'No added sugar or flavoring.' },
];

const BUTTER = {
  decision: 'Deepest yellow butter: cream, and salt if salted.',
  tier_note: 'Color is the reading: carotene from grass turns the fat deep yellow.',
  why: 'Carotene from the grass goes into the fat. The fatty-acid profile shifts with it, omega-3 included.',
  cart_pick: 'Deep yellow butter',
  pick_steps: ['Skip tubs and spreads; butter comes as a block or a stick.', 'How it was raised: see Milk.'],
};
const BUTTER_DO = 'Look through the wrapper window before choosing a block.';
const OTHERS = {
  raw_milk: {
    tier_note: 'Milk from a known herd is old practice with thin study; the farm is the standard, not a health claim.',
    instead: 'Vat or low-temp pasteurized whole milk: gently heated, and the next rung down from raw.',
  },
  egg_duck_quail: { decision: "Clean, cold duck and quail eggs; cook white and yolk solid.", why: "Duck eggs need longer to cook than hens’ eggs. Salmonella incidents are the reason to cook them thoroughly.", kristy_take: "Open the carton for clean, uncracked shells and keep the eggs cold at home. Duck or quail, cook until both yolk and white are firm.", instead: 'Pasture-raised organic hen’s eggs from the refrigerated case, with clean, uncracked shells.' },
  ghee: { instead: 'Plain butter, the same dairy fat before the water and milk solids come out.' },
  grassfed_butter: BUTTER,
  pick_egg_whites: { decision: "Carton whites: pasteurized or otherwise treated per federal standard, destroying Salmonella." },
};
const CHANGED = ['egg_labels', MILK_ID, YOG_ID, 'raw_milk', 'egg_duck_quail', 'ghee', 'grassfed_butter'];
const MINE = new Set([...CHANGED, 'pick_egg_whites']);
const MILK_ROWS = ['milk', 'whole milk', 'a gallon of milk', 'gallon of milk', 'milk carton', 'carton of milk'];
const TIP = {
  section: 'eggs_dairy',
  rule: 'Eggs and dairy start with how the animal ate and lived: cows on grass, hens on pasture.',
  checks: ['Read how the animal lived and what it ate before anything else on the label.', 'Dairy needs few ingredients: milk or cream, cultures, salt, and enzymes for cheese.'],
  tip_aligned: true,
  cards_aligned: true,
};
const CLAIM_LOCK = /healthier|healthiest|better for you|lowers|exposure|protein|calorie/i;
const PRICE = /\bcheapest\b|\bprice\b|\$[0-9]/i;
const BRAND = /kerrygold|oikos|siggi|chobani|fage|stonyfield|horizon organic|organic valley|vital farms|pete (and|&) gerry|happy egg|tillamook|land o.?lakes|kalona|maple hill|straus|alexandre/i;
const D4 = /at home with|stir|top it|mix it/i;

test('C1 the Eggs card carries the worked example', () => {
  const e = now('egg_labels');
  const b = was('egg_labels');
  for (const [k, v] of Object.entries(EGG)) assert.deepEqual(e[k], v, `egg_labels.${k}`);
  assert.equal(reviewed.get('egg_labels')?.do, EGG_DO);
  assert.equal(b.watch_out.length, EGG_WATCH_ORDER.length, 'HEAD watch_out count moved; spec is stale');
  assert.deepEqual(e.watch_out, EGG_WATCH_ORDER.map((i) => b.watch_out[i]));
  assert.deepEqual(e.labels_decoded, [...b.labels_decoded, EGG_LABEL]);
  assert.ok(b.buying_tips.includes(EGG_OLD_CHEAP) && b.science.includes(EGG_OLD_CHEAP) && b.detail.includes(EGG_DETAIL_OLD), 'HEAD strings moved; spec is stale');
  assert.deepEqual(e.buying_tips, b.buying_tips.map((s) => (s === EGG_OLD_CHEAP ? EGG_CHEAP : s)));
  assert.ok(b.science.includes(EGG_SCIENCE_OLD), 'HEAD vegetarian-fed science moved');
  assert.equal(e.science, b.science.replace(EGG_OLD_CHEAP, EGG_CHEAP).replace(EGG_SCIENCE_OLD, EGG_SCIENCE_NEW));
  assert.equal(e.detail, b.detail.replace(EGG_DETAIL_OLD, EGG_DETAIL_NEW));
  const named = [...Object.keys(EGG), 'watch_out', 'labels_decoded', 'buying_tips', 'science', 'detail'];
  assert.deepEqual(without(e, named), without(b, named), 'egg_labels: a field outside the spec changed');
  assert.doesNotMatch(copy(e).join('\n'), /cheapest/i);
});

test('C2 the Milk card carries the worked example; raw-milk risk lines unchanged', () => {
  const m = now(MILK_ID);
  const b = was(MILK_ID);
  for (const [k, v] of Object.entries(MILK)) assert.deepEqual(m[k], v, `milk.${k}`);
  assert.equal(reviewed.get(MILK_ID)?.do, MILK_DO);
  assert.equal(m.watch_out[2], MILK_UHT);
  assert.deepEqual(m.watch_out.filter((s) => s !== MILK_UHT), b.watch_out, 'milk watch_out: additions only');
  assert.deepEqual(m.labels_decoded, [...b.labels_decoded, ...MILK_LABELS]);
  const moved = nonEmpty(was('pick_milk')?.aliases ?? [], 'pick_milk aliases at HEAD', 1);
  assert.deepEqual(m.aliases, [...b.aliases, ...moved.filter((a) => !b.aliases.includes(a)), MILK.cart_pick]);
  const named = [...Object.keys(MILK), 'watch_out', 'labels_decoded', 'aliases'];
  assert.deepEqual(without(m, named), without(b, named), 'milk: a field outside the spec changed');
  assert.deepEqual(lint.headlineHedge(m.decision), []);
  assert.doesNotMatch(JSON.stringify(m), /test results/i);
  assert.deepEqual(now('raw_milk').watch_out, was('raw_milk').watch_out, 'raw-milk risk lines');
});

test('C3 the Yogurt card carries the worked example', () => {
  const y = now(YOG_ID);
  const b = was(YOG_ID);
  for (const [k, v] of Object.entries(YOG)) assert.deepEqual(y[k], v, `yogurt.${k}`);
  assert.equal(reviewed.get(YOG_ID)?.do, YOG_DO);
  for (const old of Object.keys(YOG_TIPS)) assert.ok(b.buying_tips.includes(old), `HEAD tip moved: ${old}`);
  assert.deepEqual(y.buying_tips, b.buying_tips.map((s) => YOG_TIPS[s] ?? s));
  assert.ok(b.detail.startsWith(YOG_DETAIL_OLD), 'HEAD detail moved; spec is stale');
  assert.equal(y.detail, YOG_DETAIL_NEW + b.detail.slice(YOG_DETAIL_OLD.length));
  assert.ok(b.labels_decoded.some((l) => l.term === 'Greek / skyr'), 'HEAD label moved');
  assert.deepEqual(y.labels_decoded, [...b.labels_decoded.map((l) => (l.term === 'Greek / skyr' ? { ...l, meaning: YOG_SKYR } : l)), ...YOG_LABELS]);
  const named = [...Object.keys(YOG), 'buying_tips', 'detail', 'labels_decoded'];
  assert.deepEqual(without(y, named), without(b, named), 'yogurt: a field outside the spec changed');
});

test('C4 raw milk, duck and quail eggs, ghee and butter carry the spec text', () => {
  for (const [id, want] of Object.entries(OTHERS)) {
    const e = now(id);
    assert.ok(e, `${id} missing`);
    for (const [k, v] of Object.entries(want)) assert.deepEqual(e[k], v, `${id}.${k}`);
    assert.deepEqual(without(e, Object.keys(want)), without(was(id), Object.keys(want)), `${id}: a field outside the spec changed`);
  }
  assert.equal(reviewed.get('grassfed_butter')?.do, BUTTER_DO);
  assert.match(now('raw_milk').tier_note, /not a health claim/i);
});

test('C5 pick_milk is retired and the Milk card answers its rows', () => {
  assert.ok(was('pick_milk'), 'pick_milk missing at HEAD');
  assert.equal(now('pick_milk'), undefined);
  assert.equal(kb.entries.filter((e) => e.kind !== 'pick').length, 181);
  assert.equal(kb.entries.filter((e) => e.kind === 'pick').length, 30);
  for (const row of MILK_ROWS) {
    assert.equal(idOf(matchItemToCard(row)), MILK_ID, row);
    assert.notEqual(idOf(matchItemToPick(row)), 'pick_milk', row);
  }
  for (const id of ['egg_labels', MILK_ID, YOG_ID, 'grassfed_butter']) {
    assert.equal(idOf(matchItemToCard(now(id).cart_pick)), id, `${id} cart_pick "${now(id).cart_pick}"`);
  }
});

for (const id of CHANGED) test(`C6 ${id}: pass rule and every card lint are clean`, () => {
  const e = now(id);
  assert.notDeepEqual(e, was(id), `${id} unchanged`);
  assertPassRule(null, was(id), e);
  assert.deepEqual(lint.readability(e), []);
  assert.deepEqual(lint.lintCard(projectEntry(e, { doLine: reviewed.get(id)?.do || '' })), []);
  for (const f of [lint.lintPickSteps, lint.lintCulinaryAim, lint.lintRepeatedClaim]) assert.deepEqual(f(e), [], `${id} ${f.name}`);
});

test('C6 pick_egg_whites: unchanged and pick-lint clean', () => {
  assert.deepEqual(now('pick_egg_whites'), { ...was('pick_egg_whites'), decision: "Carton whites: pasteurized or otherwise treated per federal standard, destroying Salmonella." });
  assert.deepEqual(lint.lintPick(now('pick_egg_whites')), []);
});

test('C7 new copy passes the claim-lock, price, punctuation and brand greps', () => {
  const added = nonEmpty([...CHANGED.flatMap(fresh), EGG_DO, MILK_DO, YOG_DO, BUTTER_DO], 'CA-4a new strings', 20);
  for (const s of added) {
    assert.doesNotMatch(s, CLAIM_LOCK, s);
    assert.doesNotMatch(s, PRICE, s);
    assert.doesNotMatch(s, /—/, s);
    assert.doesNotMatch(s, /["']/, s);
    assert.doesNotMatch(s, /\b(I|me|my|mine|we|us|our|ours)\b/i, s);
  }
  for (const id of MINE) assert.doesNotMatch(copy(now(id)).join('\n'), BRAND, id);
  for (const id of [...MINE].filter((i) => i !== YOG_ID)) assert.doesNotMatch(now(id).tier_note ?? '', D4, id);
});

test('C8 forced section lints: no hit on a CA-4a card', () => {
  for (const id of CHANGED) assert.notDeepEqual(now(id), was(id), `${id} unchanged`);
  const hits = lint.lintSections([TIP], kb.entries);
  assert.deepEqual(hits.filter((h) => h.id && MINE.has(h.id)), []);
  assert.deepEqual(hits.filter((h) => h.code === 'SECTION_PHRASE_REPEATED' && h.ids.every((i) => MINE.has(i))), []);
  assert.deepEqual(hits.filter((h) => h.code === 'SECTION_TIP_HANDLING'), []);
});

test('C9 doLines.json carries the new do lines', () => {
  for (const [id, line] of Object.entries({ egg_labels: EGG_DO, [MILK_ID]: MILK_DO, [YOG_ID]: YOG_DO, grassfed_butter: BUTTER_DO })) {
    assert.equal(doLines[id], line, id);
    const row = reviewText.split('\n').find((l) => l.startsWith(`| \`${id}\` |`))?.split('|').map((c) => c.trim());
    assert.equal(row?.[3], kb.entries.find((e) => e.id === id).decision, `${id} review headline`);
  }
});
