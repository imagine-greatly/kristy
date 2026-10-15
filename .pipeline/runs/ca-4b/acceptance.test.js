// CA-4b: the other sixteen eggs_dairy cards (docs/CARD-ALIGNMENT-PLAN.md CA-4). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as lint from '../../lib/counterCardLint.js';
import { projectEntry, parseReviewTable, sectionForCategory } from '../../lib/counterCards.js';
import { matchItemToCard } from '../../lib/listMatch.js';
import { nonEmpty } from '../../lib/testGuards.js';
import { assertPassRule } from './passRule.js';

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ROOT = join(SERVER, '..');
const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
const base = JSON.parse(execFileSync('git', ['show', 'a392e36:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const reviewText = readFileSync(join(ROOT, 'docs', 'do-lines-review.md'), 'utf8');
const reviewed = parseReviewTable(reviewText);
const reviewHeadline = id => reviewText.split('\n').find(line => line.startsWith('| `' + id + '` |'))?.split('|')[3].trim();
const doLines = JSON.parse(readFileSync(join(SERVER, 'lib', 'doLines.json'), 'utf8'));
const now = (id) => kb.entries.find((e) => e.id === id);
const was = (id) => base.entries.find((e) => e.id === id);
const without = (e, keys) => Object.fromEntries(Object.entries(e ?? {}).filter(([k]) => !keys.includes(k)));
const COPY = ['decision', 'short_answer', 'why', 'detail', 'kristy_take', 'tier_note', 'question', 'buying_tips', 'watch_out', 'pick_steps', 'science', 'instead', 'cart_pick', 'labels_decoded', 'eyebrow_short'];
const leaves = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(leaves) : v && typeof v === 'object' ? Object.values(v).flatMap(leaves) : []);
const copy = (e) => COPY.flatMap((f) => leaves(e?.[f]));
const fresh = (id) => { const old = new Set(copy(was(id))); return copy(now(id)).filter((s) => !old.has(s)); };
const words = (s) => s.trim().split(/\s+/).length;

const SPEC = {
  "plain_kefir": {
    "decision": "Plain kefir from 100% grass-fed whole milk.",
    "cart_pick": "100% grass-fed whole-milk plain kefir",
    "instead": "Plain organic whole-milk kefir is the next bottle down.",
    "pick_steps": [
      "Pick the bottle labeled plain, not flavored.",
      "100% grass-fed on kefir means the cows ate grass and hay, never grain.",
      "Take it from the refrigerated case and keep it cold."
    ]
  },
  "raw_kefir": {
    "tier_note": "Culturing milk is among the oldest preservation methods, barely studied; the case is the ferment, not a health outcome.",
    "instead": "Plain kefir from 100% grass-fed whole milk, the next bottle down from raw."
  },
  "sour_cream": {
    "decision": "Sour cream made from cream soured by bacteria, nothing else added.",
    "cart_pick": "Cream and cultures only sour cream",
    "instead": "Plain whole-milk yogurt, its only sugar the lactose from the milk.",
    "pick_steps": [
      "Pick sour cream or cultured sour cream before acidified sour cream.",
      "Read the ingredients for cream and cultures, with nothing listed after them.",
      "Check the name for “acidified”; added acids did the souring."
    ]
  },
  "cream_cheese": {
    "decision": "Cream cheese by its standard name, at least 33% milkfat, no stabilizers.",
    "cart_pick": "Stabilizer-free cream cheese",
    "instead": "Cream cheese with stabilizers listed, held by the standard to 0.5 percent at most.",
    "pick_steps": [
      "Look for “cream cheese” as the name; that name carries the standard.",
      "Stabilizers are allowed up to 0.5 percent; choose the package that lists none."
    ]
  },
  "cottage_cheese": {
    "instead": "Cottage cheese marked “directly set”, where a food-grade acid sets the curd instead of a culture."
  },
  "cheese_real_vs_processed": {
    "decision": "Block cheese with a short list, real cheese by its front name.",
    "tier_note": "The starch and cellulose on shreds are printed facts; the uncoated block is the standard.",
    "instead": "Bagged shreds named cheese: real cheese, coated so the strands stay apart.",
    "short_answer": "Real cheese is basically milk, salt, cultures and enzymes. ‘Pasteurized process cheese’, ‘cheese product’ or ‘cheese food’ means emulsifiers and added ingredients blended in. Bagged shreds are real cheese with an anti-caking coating. Buy the block.",
    "science": "Real cheese is milk, salt, cultures and enzymes. ‘Pasteurized process cheese product’ needs only 51% cheese, and the name on the front is the only warning. Shreds carry a coating so the strands do not knit back together, which is why they resist melting. ‘Parmesan’ is a generic word in the US; ‘Parmigiano-Reggiano’ is protected, with a stamped rind."
  },
  "raw_aged_cheese": {
    "decision": "Raw-milk cheese aged past sixty days, its maker and herd named.",
    "tier_note": "Aging raw milk into cheese predates refrigeration; the months on the rind are history, not health evidence.",
    "instead": "Thermized cheese, heated below pasteurization: not raw, and not fully pasteurized either."
  },
  "goat_sheep_dairy": {
    "why": "Goat milk has less lactose than cow’s milk.",
    "short_answer": "Goat milk averages about 3.5 percent butterfat. It contains lactose, less than cow’s milk. Goat butter is white. Popular sheep cheeses include feta, pecorino romano, Roquefort and Manchego.",
    "instead": "Goat yogurt or goat butter, with goat milk named in the ingredients."
  },
  "cream_vs_creamer": {
    "decision": "Half-and-half is milk and cream; non-dairy creamer is oil and sugar.",
    "instead": "Heavy cream with cream as the only ingredient on the list.",
    "pick_steps": [
      "Read the milkfat: heavy cream is 36% or more, half-and-half 10.5 to 18%.",
      "Read the list too: even real cream can carry carrageenan or gellan gum.",
      "A creamer list that opens on water, sugar and oil is the skip."
    ]
  },
  "ice_cream": {
    "decision": "Ice cream that earns the name, with milkfat and no added oils.",
    "instead": "Frozen custard, which is ice cream made with egg yolk solids."
  },
  "dairy_case": {
    "instead": "Plain whole milk that has not been ultrafiltered."
  },
  "plant_butter": {
    "decision": "Plant butter built on coconut or olive oil, never seed oil or avocado oil.",
    "tier_note": "Each oil in a plant butter is named on its ingredient list, so the skip is in plain sight.",
    "instead": "Butter: cream, and salt if salted.",
    "cart_pick": "Coconut or olive oil plant butter",
    "pick_steps": [
      "Find each oil named in the list; note which one comes first.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Check whether a nut milk or culture is listed, as in some versions."
    ]
  },
  "almond_milk": {
    "decision": "Unsweetened almond milk with a short ingredient list, never seed oil.",
    "tier_note": "An unsweetened carton with no seed oil on its list stays closest to the almond itself.",
    "instead": "Fortified unsweetened soy milk is the next plant drink.",
    "pick_steps": [
      "Pick unsweetened over sweetened, vanilla or chocolate.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed."
    ]
  },
  "oat_milk": {
    "decision": "Oat milk with few stabilizers in the ingredients, never seed oil.",
    "tier_note": "Oat drinks differ in stabilizers and fortification, so the carton’s own list decides the pick.",
    "instead": "Fortified unsweetened soy milk is the next plant drink.",
    "pick_steps": [
      "Read the ingredient list for stabilizers; formulations can differ in stabilizer use.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed."
    ]
  },
  "soy_milk": {
    "decision": "Fortified, unsweetened soy milk, the one plant drink in the dairy group.",
    "tier_note": "Calcium and vitamin D on the panel show the fortification.",
    "instead": "Unsweetened almond milk."
  },
  "coconut_milk_beverage": {
    "decision": "Unsweetened carton coconut milk with the fewest added gums.",
    "tier_note": "A carton labeled beverage is a drink, judged by its thickeners and sugar.",
    "instead": "Canned coconut milk, shredded coconut steeped and pressed."
  }
};
const DO = {
  "almond_milk": "Read the Nutrition Facts for added sugars, then calcium and vitamin D.",
  "oat_milk": "Read the ingredients for added vitamins and minerals, then the stabilizers."
};
const IDS = nonEmpty(Object.keys(SPEC), 'CA-4b ids', 16);
const TIP = {
  section: 'eggs_dairy',
  rule: 'Eggs and dairy start with how the animal ate and lived: cows on grass, hens on pasture.',
  checks: ['Read how the animal lived and what it ate before anything else on the label.', 'Dairy needs few ingredients: milk or cream, cultures, salt, and enzymes for cheese.'],
  tip_aligned: true,
  cards_aligned: true,
};
const CLAIM_LOCK = /healthier|healthiest|better for you|lowers|exposure|protein|calorie/i;
const PRICE = /\bcheapest\b|\bprice\b|\$[0-9]/i;
const BRAND = /kerrygold|oikos|siggi|chobani|fage|stonyfield|horizon organic|organic valley|tillamook|land o.?lakes|kalona|maple hill|straus|alexandre|lifeway|philadelphia|daisy|good culture|ben (and|&) jerry|haagen|silk|oatly|califia|planet oat|elmhurst|earth balance|country crock|miyoko|coffee mate|international delight/i;
const D4 = /at home with|stir|top it|mix it/i;

for (const id of IDS) test(`C1 ${id} carries the spec text`, () => {
  const want = SPEC[id];
  assert.ok(Object.keys(want).length > 0, `${id}: spec text not filled`);
  for (const [k, v] of Object.entries(want)) assert.deepEqual(now(id)[k], v, `${id}.${k}`);
  assert.deepEqual(without(now(id), Object.keys(want)), without(was(id), Object.keys(want)), `${id}: a field outside the spec changed`);
});

for (const id of IDS) test(`C2 ${id} has an instead`, () => {
  const e = now(id);
  assert.ok(typeof e.instead === 'string' && e.instead.trim(), `${id}: no instead`);
  assert.ok(words(e.instead) <= 24, `${id}: instead runs ${words(e.instead)} words`);
  assert.notEqual(e.instead, e.cart_pick);
});

for (const id of IDS) test(`C3 ${id}: pass rule and every card lint are clean`, () => {
  const e = now(id);
  assertPassRule(null, was(id), e);
  assert.deepEqual(lint.readability(e), []);
  assert.deepEqual(lint.headlineHedge(e.decision), []);
  assert.ok(e.decision.length <= 90, `${id}: decision exceeds 90 characters`);
  assert.ok(e.why.length <= 120, `${id}: why exceeds 120 characters`);
  assert.ok(words(e.tier_note) >= 5 && words(e.tier_note) <= 20, `${id}: tier_note budget`);
  assert.doesNotMatch(e.tier_note, /[.!?]\s+\S/);
  assert.equal(kb.entries.filter(x => x.tier_note === e.tier_note).length, 1, `${id}: tier_note not unique`);
  assert.ok(e.cart_pick.length <= 46, `${id}: cart_pick exceeds 46 characters`);
  assert.doesNotMatch(e.cart_pick.replace(/^100% /, ''), /[$£€%]/, `${id}: counterPath price check`);
  if (SPEC[id].cart_pick) assert.equal(matchItemToCard(e.cart_pick)?.slug, id, `${id}: cart_pick match`);
  assert.deepEqual(lint.lintCard(projectEntry(e, { doLine: reviewed.get(id)?.do || '' })), []);
  for (const f of [lint.lintPickSteps, lint.lintCulinaryAim, lint.lintRepeatedClaim]) assert.deepEqual(f(e), [], `${id} ${f.name}`);
});

test('C4 the eggs_dairy section is clean under forced section lints', () => {
  for (const id of IDS) assert.notDeepEqual(now(id), was(id), `${id} unchanged`);
  assert.deepEqual(lint.lintSections([TIP], kb.entries), []);
  assert.deepEqual(lint.lintCorpus(kb.entries.filter(e => e.kind !== 'pick').map(e => projectEntry(e, {doLine: doLines[e.id]}))).violations, []);
});

test('C5 new copy passes the claim-lock, price, punctuation, brand and D4 greps', () => {
  const added = nonEmpty([...IDS.flatMap(fresh), ...Object.values(DO)], 'CA-4b new strings', 32);
  for (const s of added) {
    assert.doesNotMatch(s, CLAIM_LOCK, s);
    assert.doesNotMatch(s, PRICE, s);
    assert.doesNotMatch(s, /—/, s);
    assert.doesNotMatch(s, /["']/, s);
    assert.doesNotMatch(s, BRAND, s);
    // US in retained cheese depth is a country abbreviation, not first-person us.
    assert.doesNotMatch(s.replace(/\bUS\b/g, 'United States'), /\b(I|me|my|mine|myself|we|us|our|ours|ourselves)\b/i, s);
  }
  for (const id of IDS) {
    const e = now(id);
    assert.doesNotMatch(e.tier_note ?? '', D4, id);
    assert.doesNotMatch([e.decision, e.tier_note, e.instead, e.cart_pick, ...e.pick_steps, reviewed.get(id)?.do].join(' '), /protein/i, `${id}: protein on free front`);
    assert.doesNotMatch(copy(e).join(' '), BRAND, id);
  }
});

test('C6 review table and doLines.json follow the new fronts', () => {
  for (const id of IDS) {
    if (now(id).decision !== was(id).decision) assert.equal(reviewHeadline(id), now(id).decision, id);
    if (DO[id]) assert.equal(reviewed.get(id)?.do, DO[id], `${id}: exact do line`);
    const d = reviewed.get(id)?.do;
    if (d) assert.equal(doLines[id], d, id);
  }
});

test('C1 corpus counts and every other entry stay at the shipped baseline', () => {
  assert.equal(kb.entries.filter(e => e.kind !== 'pick').length, 181);
  assert.equal(kb.entries.filter(e => e.kind === 'pick').length, 30);
  assert.equal(kb.entries.filter(e => e.kind !== 'pick' && sectionForCategory(e.category) === 'eggs_dairy').length, 23);
  assert.deepEqual(kb.entries.map(e => e.id), base.entries.map(e => e.id));
  for (const e of kb.entries.filter(e => !IDS.includes(e.id))) assert.deepEqual(e, was(e.id), e.id);
  for (const id of ['raw_kefir', 'raw_aged_cheese']) assert.deepEqual(now(id).watch_out, was(id).watch_out, id);
});
