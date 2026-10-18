// Written by the planner; do not edit.
// ca-3a: docs/CARD-ALIGNMENT-PLAN.md "CA-3 Meat batch"; worked example and fold table verbatim.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as lint from '../../lib/counterCardLint.js';
import * as pass from './passRule.js';
import { RETIRED, projectEntry } from '../../lib/counterCards.js';
import { TRY_POOL } from '../../lib/tryPool.js';
import { TWO_LINE, withTwoLine } from './twoLinePin.js';

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ROOT = join(SERVER, '..');
const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
const doLines = JSON.parse(readFileSync(join(SERVER, 'lib', 'doLines.json'), 'utf8'));
const review = readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8');
const reviewHeadline = (id) => {
  const line = review.split('\n').find((l) => l.startsWith(`| \`${id}\` |`));
  return line ? line.split('|')[3].trim() : null;
};
const PRE = JSON.parse(execFileSync('git', ['show', '8b49633:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const now = (id) => kb.entries.find((e) => e.id === id);
const pre = (id) => PRE.entries.find((e) => e.id === id);
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const flat = (r) => (Array.isArray(r) ? r : (r && r.violations) || []);
const RETIRED_IDS = new Set([...(RETIRED || [])].map((r) => (typeof r === 'string' ? r : r.id)));
const run = (tips, entries) => lint.lintSections(tips, entries);

const BATCH = ['beef_grassfed_vs_grainfed', 'ground_beef_lean_ratio', 'beef_cuts_basics', 'organ_meats', 'butcher_counter_asking',
  'judging_meat_at_the_case', 'bison', 'venison_game', 'lamb_goat', 'pick_soup_bones'];
const RUMINANT_FRONTS = new Set(['beef_grassfed_vs_grainfed', 'bison', 'venison_game', 'lamb_goat']);
// The approved two-line samples (docs/CARD-STYLE-SAMPLES.md, 2026-10-17) put grass-fed on the steak and ground beef fronts.
const APPROVED_GRASS_FRONTS = new Set(['ground_beef_lean_ratio', 'beef_cuts_basics']);
const MEAT_TIP = { section: 'meat', rule: 'A local butcher comes first; at the case, choose meat from animals raised on grass and open pasture.', checks: ['Ask what the animal ate and how it lived; a butcher counter can answer.', 'Organs come from the same animal; liver and heart belong in the cart too.', 'On packaged meat, look for an ingredient list of meat, salt, and spices.'] };
const G1 = '“grass-fed” is the producer’s own word unless a certifier’s seal audits it';
const POINTER = 'How it was raised: see Beef.';
const COPY_SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'category', 'evidence_tier']);
const BRAND = /force of nature|seven sons|certified angus|whole foods|tyson|perdue|hormel|oscar mayer|applegate/i;
const CLAIM = /healthier|healthiest|better for you|lowers|exposure|protein|calorie/i;
const PRICE = /\bcheapest\b|\bprice\b|\$[0-9]/i;

const LEAN = {
  decision: 'An organ blend, or 100% grass-fed ground beef.', // two-line rule, 2026-10-17
  tier_note: 'Organ blends grind beef liver or heart in with the muscle meat.',
  instead: 'Plain ground beef and a small piece of liver from the counter. The share is whatever goes in the pan.',
  cart_pick: 'Organ blend ground beef',
  short_answer: 'Pick an organ blend, or ground beef with nothing added. How the cattle were raised is on the Beef card.',
  why: 'An organ blend folds liver and heart into a familiar grind.',
  pick_steps: ['How it was raised: see Beef.', 'Organ blend: liver or heart named on the label.', 'Next: plain ground beef; skip “hamburger,” which allows added beef fat.'],
};
const LEAN_DO = 'Read the label for liver or heart in the ingredients.';
const D6_SENTENCE = 'Two label examples: one blend states 8 percent organ meats (4 percent liver, 4 percent heart, 92 percent muscle); another states 92 percent ground beef, 5 percent liver, 3 percent heart.';

// Step 1c: the named fields per card; every other field stays as at 8b49633.
const SPEC_1C = {
  beef_cuts_basics: {
    decision: "Whole chuck or round, without needles or blades pushed through.",
    why: "Chuck is shoulder and round is rear leg: both are working muscles, sold whole.",
    kristy_take: "The cut name tells you where on the animal the meat came from. Raw beef pushed through needles or blades must also say ‘mechanically tenderized’ in its name.",
    instead: 'Loin or rib cuts, whole, with no ‘mechanically tenderized’ in the name.',
  },
  organ_meats: {
    decision: "Organ meats for cooking within one to two days.",
    why: "Heart and tongue suit cooking in liquid. Liver can be pan-fried; tripe needs a braise to turn tender.",
    kristy_take: "Choose the organ with a meal in mind: variety meats keep less time than steaks and roasts. Cook within one to two days, and take all organ meats to 160°F.",
    tier_note: 'Organ meats keep a shorter time in the refrigerator than steaks and roasts.',
    instead: 'A beef blend with liver and heart ground in.',
    pick_steps: ['Ask the counter or a farmer which organs they offer.', 'How it was raised: see Beef.', 'Match each organ to its method; heart and tongue go in liquid.'],
  },
  judging_meat_at_the_case: {
    decision: "The meat pack with the newest ‘packaged on’ date.",
    why: "Oxygen turns a cut steak cherry-red; a vacuum-packed roast stays purple. Color alone cannot tell you freshness.",
    kristy_take: "Choose a sealed pack without leaks, then smell the meat at home. No off smell or slime: those checks tell you more than the store’s sticker.",
    tier_note: 'Fresh tray-wrapped meat keeps up to three days refrigerated after packaging, so that date sets the clock.',
    instead: 'A well-sealed vacuum pack, which keeps up to seven days refrigerated from purchase.',
    pick_steps: ['‘Packaged on’: the packing day, not a safety cutoff.', 'Take a sealed, leak-free package from the back, where the case is coldest.'],
  },
  butcher_counter_asking: {
    decision: "Beef soup bones and a whole chuck, freshly ground.",
    why: "A whole chuck ground at the counter lets you choose the cut. The butcher can tell you when it was cut.",
    kristy_take: "Start with what came in today, then how it was raised and what was added. Bones, trim and portioning are worth asking for while you are at the counter.",
    tier_note: 'Soup bones come from the counter, and a whole chuck ground fresh lets the shopper choose the cut.',
    instead: 'A whole chuck roast, cut, tied or boned to order at the counter.',
    cart_pick: 'Beef soup bones from the butcher counter',
    pick_steps: ['Soup bones: ask for marrow or knuckle bones.', 'How it was raised: see Beef.', 'Ask them to portion it; cutting, tying and boning are usually included.'],
  },
  bison: {
    decision: "Bison with 100% grass-fed or grass-finished labeling and an inspection mark.",
    why: "Bison is a bovine meat with no marbling, so expect a deeper red than beef. High heat can turn it tough.",
    kristy_take: "Find a federal or state inspection mark, then follow beef’s keeping and cooking rules. Ground bison should be cooked or frozen within 2 days.",
    tier_note: 'Many bison finish on grain; “grass-fed” is the producer’s own word unless a certifier’s seal audits it.',
    instead: 'Bison labeled grass-fed with no seal; it may have eaten grain for its last 90 to 120 days.',
    cart_pick: '100% grass-fed or grass-finished bison',
  },
  venison_game: {
    decision: "Fat-trimmed venison from a fully refrigerated processor.",
    why: "Game often comes through small shops. Cold handling at the processor decides its safety.",
    kristy_take: "Plan a meal within two or three days of bringing unfrozen venison home. Trim the fat and cook whole cuts to 145°F, ground game to 160°F.",
    tier_note: 'Game is often processed by small shops, so cold handling at every step decides its safety.',
    instead: 'Wrapped frozen venison from the same refrigerated processor; it keeps 9 to 12 months frozen.',
  },
  lamb_goat: {
    decision: "Lamb or goat labeled 100% grass-fed or grass-finished.",
    why: "For goat, look at the flesh: firm and fine-grained with white fat. There are no goat quality grades to guide you.",
    kristy_take: "Lamb grading is voluntary and takes age into account. Check for firm, fine-textured meat with white marbling, and read the cut name, such as shoulder or leg.",
    tier_note: 'Grass seals cover sheep and goats, and “grass-fed” is the producer’s own word unless a certifier’s seal audits it.',
    instead: 'Graded lamb, or goat that is firm and fine-grained, when no grass seal is on the shelf.',
    cart_pick: '100% grass-fed or grass-finished lamb',
  },
  pick_soup_bones: {
    decision: "Ask your meat counter for marrow or knuckle soup bones.",
    decision: 'Ask your meat counter for marrow or knuckle soup bones.',
  },
};
// Step 1c cards with a do row: the do line stays as it was.
const DO_KEPT = {
  judging_meat_at_the_case: 'Check the package is sealed and not leaking juices, then smell it.',
  butcher_counter_asking: 'Ask what came in today and when it was cut.',
  bison: 'Find the triangle inspection seal or a state mark on the package.',
  lamb_goat: 'Press goat for firm, fine-grained flesh and white fat.',
  organ_meats: 'Check the use-by date against the night it will be cooked.',
  venison_game: 'Ask whether each animal was handled separately and kept cold throughout.',
  beef_cuts_basics: 'Read the grade and the sourcing as two separate answers.',
};

test('C1 Ground beef front equals the worked example', () => {
  const e = now('ground_beef_lean_ratio');
  for (const [f, v] of Object.entries(LEAN)) assert.deepEqual(e[f], v, `lean_ratio.${f}`);
  assert.equal(doLines.ground_beef_lean_ratio, LEAN_DO);
});

test('C2 Ground beef additive fields hold every fold fact', () => {
  const e = now('ground_beef_lean_ratio');
  const old = pre('ground_beef_lean_ratio');
  const fold = pre('ground_beef_organ_blend');
  // Devon 2026-10-18: "just an organ blend is fine" — the fold's percentage-checking lines were dropped,
  // the vitamin A cap and the printed-share example kept.
  assert.deepEqual(e.watch_out, [...old.watch_out,
    'Liver sets the vitamin A. By NIH figures, 3 ounces of pan-fried beef liver holds more than twice the adult daily upper intake. Keep servings ordinary.',
    'Producers print shares such as 8 percent organ, or 5 percent liver plus 3 percent heart. At those shares the blend tastes like regular ground beef.']);
  assert.equal(fold.watch_out.length, 3);
  assert.deepEqual(e.buying_tips, [TWO_LINE.ground_beef_lean_ratio.buying_tips[0], ...old.buying_tips, 'The product name will not say ‘ground beef’ alone; a blend has to carry its own descriptive name.']);
  const label = (t) => (e.labels_decoded || []).find((l) => l.term === t);
  assert.equal(label('80/20, 85/15, 90/10').meaning, 'Lean % to fat % by weight; higher first number = leaner.');
  assert.equal(label('Organ blend').meaning, 'Beef with liver, heart, or other organs mixed in, sold under its own descriptive name, not as ‘ground beef’.');
  assert.equal(label('Hamburger').meaning, 'Chopped beef that may have beef fat added; ‘ground beef’ may not.');
  for (const l of fold.labels_decoded) assert.deepEqual(label(l.term), l);
  assert.doesNotMatch(JSON.stringify(e.labels_decoded), /—/);
  assert.equal(e.kristy_take, "Federal rules keep added water, binders and organs out of ‘ground beef’, so a blend needs its own name. Plain ‘ground beef’ allows no added fat either; ‘hamburger’ may add fat.");
  for (const s of [D6_SENTENCE, '25 percent', '9 CFR 317.2', '6,582 mcg RAE', '3,000 mcg', old.detail, old.short_answer, old.why]) assert.ok(e.detail.includes(s), `detail lacks: ${s}`);
  assert.doesNotMatch(e.detail, BRAND);
  assert.equal(e.science, old.science);
});

test('C3 the organ-blend fold is complete and the pass rule holds', (t) => {
  assert.equal(now('ground_beef_organ_blend'), undefined, 'organ_blend still in the KB');
  assert.ok(RETIRED_IDS.has('ground_beef_organ_blend'), 'organ_blend not RETIRED');
  const e = now('ground_beef_lean_ratio');
  const fold = pre('ground_beef_organ_blend');
  for (const f of ['aliases', 'asked_as']) for (const v of fold[f]) assert.ok(e[f].includes(v), `${f} lost ${v}`);
  for (const s of fold.sources) assert.ok(e.sources.some((x) => JSON.stringify(x) === JSON.stringify(s)), `source lost ${JSON.stringify(s)}`);
  for (const id of BATCH) pass.assertPassRule(t, pre(id), now(id));
});

test('C4 the Beef front carries G1 and drops the grain-finish line', () => {
  const b = now('beef_grassfed_vs_grainfed');
  assert.equal(b.decision, '100% grass-fed or grass-finished beef.'); // two-line rule, 2026-10-17
  assert.equal(b.cart_pick, '100% grass-fed or grass-finished ground beef');
  assert.equal(b.kristy_take, 'Go gently with the heat: this leaner beef dries out at feedlot-beef heat. Look for whole-life words backed by a seal.');
  assert.ok(b.tier_note.includes(G1), 'beef tier_note lacks the G1 gloss');
  assert.equal(b.why, 'Grass after weaning, no grain and no feedlot. A grass finish gives you leaner beef with a different fat balance.');
  const said = [b.why, b.short_answer, b.science, JSON.stringify(b.labels_decoded)].join(' ');
  assert.doesNotMatch(said, /allows a grain finish|may still have been grain-finished|eat feedlot grain for the last months/i);
});

test('C5 plan cart_picks are byte-equal', () => {
  assert.equal(now('butcher_counter_asking').cart_pick, 'Beef soup bones from the butcher counter');
});

test('C6 D1 limits hold on every batch card', () => {
  for (const id of BATCH) {
    const e = now(id);
    assert.ok(e, `${id} missing`);
    assert.ok(words(e.decision) <= 14, `${id} decision ${words(e.decision)} words`);
    if (Array.isArray(e.pick_steps)) assert.ok(e.pick_steps.length >= 1 && e.pick_steps.length <= 3, `${id} pick_steps ${e.pick_steps.length}`);
    if (e.kind === 'pick') continue;
    const n = String(e.tier_note || '').trim();
    assert.ok(words(n) >= 5 && words(n) <= 20, `${id} tier_note ${words(n)} words`);
    assert.doesNotMatch(n, /[.!?]\s+\S/, `${id} tier_note is more than one sentence`);
    assert.ok(String(e.instead || '').trim().length > 0, `${id} instead empty`);
  }
});

test('C7 only ruminant fronts print a grass term', () => {
  for (const id of BATCH) {
    if (RUMINANT_FRONTS.has(id)) continue;
    const e = now(id);
    if (!APPROVED_GRASS_FRONTS.has(id)) assert.doesNotMatch(String(e.decision || ''), /grass-(fed|finished)/i, `${id} decision`);
    if (!APPROVED_GRASS_FRONTS.has(id)) assert.doesNotMatch(String(e.cart_pick || ''), /grass-(fed|finished)/i, `${id} cart_pick`);
  }
  for (const id of ['ground_beef_lean_ratio', 'butcher_counter_asking']) assert.ok(JSON.stringify(now(id)).includes(POINTER), `${id} lost the POINTER`);
});

test('C8 brand claim and price greps are zero over changed copy fields', () => {
  let changed = 0;
  for (const id of BATCH) {
    const e = now(id);
    const p = pre(id);
    for (const [f, v] of Object.entries(e)) {
      if (COPY_SKIP.has(f) || JSON.stringify(v) === JSON.stringify(p[f])) continue;
      changed++;
      const s = JSON.stringify(v);
      assert.doesNotMatch(s, BRAND, `${id}.${f} brand`);
      assert.doesNotMatch(s, CLAIM, `${id}.${f} claim-lock word`);
      assert.doesNotMatch(s, PRICE, `${id}.${f} price`);
      assert.doesNotMatch(s, /—/, `${id}.${f} em-dash`);
      assert.doesNotMatch(s, /\b(I|me|my|mine)\b/, `${id}.${f} first person`);
    }
  }
  assert.ok(changed >= 10, `only ${changed} changed copy fields`);
});

test('C9 meat section lints are clean for batch ids', () => {
  const hits = run([{ ...MEAT_TIP, tip_aligned: true, cards_aligned: true }], kb.entries);
  assert.ok(Array.isArray(hits));
  const mine = hits.filter((h) => (h.id && BATCH.includes(h.id)) || (Array.isArray(h.ids) && h.ids.every((i) => BATCH.includes(i))));
  assert.deepEqual(mine.filter((h) => h.code !== 'SECTION_TIP_HANDLING'), []);
});

test('C10 plumbing repointed and per-card lints clean', () => {
  assert.equal(TRY_POOL[0], 'ground_beef_lean_ratio');
  assert.ok(!TRY_POOL.includes('ground_beef_organ_blend'));
  assert.ok(!JSON.stringify(lint.OWNED_FACTS).includes('ground_beef_organ_blend'));
  for (const id of ['ground_beef_lean_ratio', 'beef_grassfed_vs_grainfed']) {
    const e = now(id);
    assert.deepEqual(lint.lintCard(projectEntry(e, { doLine: doLines[id] })), [], `${id} lintCard`);
    assert.deepEqual(flat(lint.readability(e)), [], `${id} readability`);
    assert.deepEqual(flat(lint.lintPickSteps(e)), [], `${id} lintPickSteps`);
  }
});

test('C12 Step 1c cards equal the spec', () => {
  for (const [id, spec] of Object.entries(SPEC_1C)) {
    const p = pre(id);
    assert.ok(p, `${id} missing at 8b49633`);
    const want = withTwoLine({ ...p, ...spec });
    if (id === 'judging_meat_at_the_case') want.watch_out = [...p.watch_out.slice(1), p.watch_out[0], p.decision, p.pick_steps[1]];
    assert.deepEqual(now(id), want, `${id} differs from Step 1c`);
  }
  assert.equal(now('judging_meat_at_the_case').watch_out.length, 7);
  assert.ok(!('cart_pick' in now('judging_meat_at_the_case')), 'judging gained a cart_pick');
  for (const [id, d] of Object.entries(DO_KEPT)) {
    assert.equal(reviewHeadline(id), now(id).decision, `${id} review headline`);
    assert.equal(doLines[id], d, `${id} do line changed`);
  }
});
