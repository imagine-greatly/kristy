// clean-pick-1: batch B1 of docs/CLEAN-PICK-PLAN.md (Devon 2026-10-20). Each staple's front names its own
// cleanest version (pasture-raised or organic poultry, grass-fed dairy, organic sugar and corn, wild-caught fish,
// short-list bread, olive oil mayo and sauce), not a blanket "get organic". Base ede90e7 (3ca18db, dfbef8a plan-only).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';
import { preCleanPick10, CLEAN_PICK_10, preCleanPick11, preCleanPick12, preCleanPick8, CLEAN_PICK_8 } from './twoLinePin.js';
import doLines from '../../lib/doLines.json' with { type: 'json' };
import { scoreEntries } from '../../lib/perimeter.js';
import { matchItemToCard } from '../../lib/listMatch.js';

const ROOT = new URL('../../../', import.meta.url).pathname;
const git = (spec) => execFileSync('git', ['show', spec], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
import { preT6_1, preT6_2 } from "./twoLinePin.js";
kb.entries = kb.entries.map(preT6_2); // t6-2: dairy/egg pins read ca32bef; t6_2.test.js owns live copy.
kb.entries = kb.entries.map(preT6_1); // t6-1: the 15 meat/seafood cards read as of 85c399e; t6_1.test.js owns them now
const base = JSON.parse(git('ede90e7:server/kristy_perimeter_kb.json'));
const find = (k, id) => { const e = k.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;

const BECAME = {
  sugars: {
    decision: "Organic coconut or maple sugar first, each from one sap.",
    cart_pick: "Organic coconut sugar or pure maple sugar",
    buying_tips: [
      "Each stays closer to its plant than sugar crystallized from cane or beet juice.",
      "Look for certified organic coconut sugar or pure maple sugar.",
      "Read the list: coconut sugar or maple sugar alone, with nothing added.",
      "Look for pure maple sugar; a maple-flavored product is not maple sugar.",
      "Plain “sugar” names no crop, so choose certified organic first; organic must come from non-GMO plants. Non-GMO Project Verified is a close second.",
      "Pick light or dark brown sugar; dark carries more molasses.",
    ],
  },
  rotisserie_chicken: {
    decision: "Pasture-raised or organic rotisserie chicken, salt and spices only.",
    cart_pick: "Organic or pasture-raised rotisserie chicken",
    buying_tips: [
      "A solution bird was injected with water and seasoning before it went on the spit.",
      "Look for a pasture-raised or certified organic bird on the sticker.",
      "Read the sticker, not the name. ‘Seasoned’, ‘original’ and ‘traditional’ are marketing; the ingredient list is regulated.",
      "The shortest list wins: chicken, salt, spices. Water as the second ingredient means a solution was added.",
      "Sodium phosphate, a starch or a sweetener after the water means a solution bird. The shorter the seasoning line, the plainer the chicken.",
      "A bird held under the lamp is held hot for a reason. Take one that is steaming, not one that has sat.",
      "Check the sticker for oil in the seasoning; choose olive oil or a bird with no added oil.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Skip a bird seasoned with avocado oil too.",
    ],
    tier_note: "Organic rotisserie chicken: certified organic feed and outdoor access; pasture: time outdoors on pasture, audited only with a certifier’s seal.",
  },
  chicken_breast: {
    decision: "Pasture-raised or organic bone-in, skin-on breast; no solution added.",
    cart_pick: "Pasture-raised or organic chicken breast",
    buying_tips: [
      "Boneless skinless breast dries fast in the pan; bone and skin cook better.",
      "Look for pasture-raised or certified organic breast, sold plain.",
      "Read the full product name for the solution percentage and ingredients.",
      "Fresh or frozen breast can be checked for the same solution disclosure.",
      "Read retained-water wording separately from the added flavoring ingredients.",
    ],
    tier_note: "Organic chicken breast: certified organic feed and outdoor access; pasture: time outdoors on pasture, audited only with a certifier’s seal.",
  },
  chicken_cuts_basics: {
    decision: "Air-chilled pasture-raised whole chicken, then bone-in, skin-on thighs.",
    cart_pick: "Pasture-raised whole chicken or bone-in thighs",
    buying_tips: [
      "Water-chilled birds hold water from the chilling tank; skin that starts dry crisps.",
      "Look for air-chilled printed on the whole bird or the thigh pack.",
      "Whole bird: lowest cost per pound, and the carcass makes stock.",
      "Thighs, bone-in and skin-on: forgiving, low-cost, hard to overcook.",
      "Breast: fast and lean. Pull it the moment it is done.",
      "Boneless skinless costs the most for the same bird.",
      "‘Air-chilled’ is printed on the package when it applies.",
      "Skin that starts dry is the skin that crisps.",
      "‘USDA Process Verified’ or a third-party seal backs a ‘raised without antibiotics’ claim.",
      "All chicken is required to be residue-free at sale, labeled or not.",
      "‘Raised without antibiotics’ is a management and resistance choice, not a cleaner-meat guarantee.",
    ],
    tier_note: "Pasture on a chicken label: time outdoors on pasture, audited only with a certifier’s seal.",
  },
  ground_turkey: {
    decision: "Pasture-raised or organic ground turkey, fat content printed.",
    cart_pick: "Pasture-raised or organic plain ground turkey",
    buying_tips: [
      "The name ground turkey sets no one fat level, so two packs can differ.",
      "Look for pasture-raised or certified organic ground turkey, sold plain.",
      "Choose a formulation listing turkey without added seasonings or a flavoring solution.",
      "Without a percent-lean claim, use the Nutrition Facts fat line to compare packs.",
      "Compare the fat content of the actual packs rather than assume one level for all ground turkey.",
    ],
    tier_note: "Organic ground turkey: certified organic feed and outdoor access; pasture: time outdoors on pasture, audited only with a certifier’s seal.",
  },
  turkey_whole: {
    decision: "Pasture-raised whole turkey, without an injected basting solution.",
    cart_pick: "Pasture-raised whole turkey",
    buying_tips: [
      "A basted or self-basted bird carries added broth, stock, fat or water.",
      "Look for a pasture-raised whole turkey, sold unbasted.",
      "Read the solution ingredients beside the product name.",
      "A frozen whole turkey can be checked for the same added-solution statement.",
      "Read retained-water wording separately from the flavoring-solution statement.",
    ],
    tier_note: "Pasture-raised turkey: time outdoors on pasture, audited only with a certifier’s seal.",
  },
  grassfed_butter: {
    cart_pick: "Grass-fed butter",
    buying_tips: [
      "Deep yellow toward orange is carotene from grass. Pale is a hay-fed winter churn.",
      "Look for grass-fed on the wrapper; cream and salt are the whole list.",
      "European-style butters are higher in fat, a separate axis from what the cows ate.",
      "Salted or unsalted is a cooking choice. Unsalted gives control.",
    ],
  },
  cheese_real_vs_processed: {
    decision: "Grass-fed block cheese: milk, cultures, salt, enzymes, nothing else.",
    cart_pick: "Grass-fed block cheese",
    buying_tips: [
      "Bagged shreds are coated in starch to keep them apart, which is why they melt poorly.",
      "Look for grass-fed milk named on the block.",
      "Look for a short list: milk, salt, cultures, enzymes/rennet.",
      "Blocks are cheaper per pound than pre-sliced or shredded, and they melt smoothly.",
      "‘Parmesan’ is a generic word in the US. ‘Parmigiano-Reggiano’ is a protected one with a stamped rind.",
      "Keep hard-cheese rinds. They belong in a pot of beans or soup.",
      "The milk for cheese may come from cows given the synthetic growth hormone rBST. Certified organic rules exclude its use.",
      "Certified organic block cheese is the first choice. Next, find a wrapper stating the cheese uses milk from cows given no rBST. Cheese with neither claim is last. US labeling does not require a statement about rBST use.",
    ],
  },
  cream_vs_creamer: {
    decision: "Grass-fed heavy cream or half-and-half: cream and milk only.",
    cart_pick: "Grass-fed half-and-half",
    buying_tips: [
      "Cream carries a legal milkfat minimum; creamer is oil and sweetener imitating it.",
      "Look for a carton naming grass-fed cows, with cream and milk only.",
      "Heavy cream is 36% milkfat or more. Half-and-half is 10.5 to 18%. Those numbers are fixed by law.",
      "‘Non-dairy creamer’ is oil, sweetener and emulsifiers. It is not cream.",
      "Even real cream can carry carrageenan or gellan gum. A short list is still worth checking.",
      "Flavored creamers are where the added sugar sits. Read the panel.",
      "Whole milk or half-and-half does the same job with a two-word ingredient list.",
      "rBST is a synthetic hormone given to cows for milk production. The certified organic rules bar this growth hormone.",
      "Start with certified organic cream or half-and-half. Follow with a carton stating the cows were not treated with rBST, then one with neither. US companies need not label rBST use.",
      "Even certified organic cream can list carrageenan, a thickener derived from seaweed. Read the ingredients and take cream with none listed.",
    ],
  },
  sour_cream: {
    decision: "Grass-fed sour cream: cream and cultures, nothing else added.",
    cart_pick: "Grass-fed sour cream",
    buying_tips: [
      "Cultured means bacteria did the souring; acidified tubs use added acids.",
      "Look for a grass-fed tub listing only cream and cultures.",
      "Pick a tub named “sour cream” or “cultured sour cream”.",
      "Read the optional ingredients added for texture or shelf life.",
      "Check the name for a declared flavor.",
      "A synthetic growth hormone called rBST can be given to dairy cows. Certified organic sour cream excludes that treatment.",
      "On sour cream, prefer certified organic. Next, look for a printed statement that rBST was not used on the dairy cows. Without either claim, the tub ranks last. Use of rBST need not appear on US dairy labels.",
      "Carrageenan is made from seaweed and used to thicken foods, including some certified organic ones. Read your sour cream’s list and pick a tub without carrageenan.",
    ],
  },
  cream_cheese: {
    decision: "Grass-fed cream cheese by its standard name, no stabilizers.",
    cart_pick: "Grass-fed stabilizer-free cream cheese",
    buying_tips: [
      "The standard allows up to 0.5 percent stabilizers; the list shows who skipped them.",
      "Look for grass-fed cream cheese that lists no stabilizers.",
      "Look for “cream cheese” as the name on the package.",
      "Find a culture in the ingredient list.",
      "Swap in Neufchâtel in most recipes; the two taste similar.",
      "rBST is the synthetic growth hormone used to increase milk production in cows. Certified organic cream cheese rules prohibit it.",
      "Choose certified organic cream cheese first. Next is a pack stating the milk comes from cows untreated with rBST. Both outrank a pack with neither. US labels can omit whether the cows received rBST.",
      "Some certified organic foods contain carrageenan, a seaweed-derived thickener. Look through the cream cheese ingredients and take the version that lists no carrageenan.",
    ],
  },
  sandwich_bread: {
    decision: "Whole wheat sandwich bread: flour, water, yeast, salt, little else.",
    cart_pick: "Short-list whole wheat sandwich bread",
    buying_tips: [
      "A loaf called just “wheat” may be refined; whole wheat keeps the bran and germ.",
      "Look for a short list: whole wheat flour, water, yeast and salt.",
      "Check for whole wheat flour in the ingredients.",
      "Without a stamp, use the flour names to check the loaf.",
      "Check which stamp is shown: 100%, 50%+, or Basic have different grain requirements.",
      "Choose certified organic whole wheat bread over conventional. Conventional wheat may be sprayed with glyphosate shortly before harvest to dry the crop. Organic farming does not allow glyphosate. Drift can still leave residues on organic wheat.",
    ],
  },
  tortillas: {
    decision: "Organic corn tortillas of masa, water and salt.",
    cart_pick: "Organic corn tortillas",
  },
  mayo: {
    decision: "Mayonnaise with olive oil alone, egg yolk and an acid.",
    cart_pick: "Olive oil only mayonnaise",
    buying_tips: [
      "A jar sold on avocado or olive oil can carry other oils; the list shows which leads.",
      "Look for olive oil as the only oil in the ingredient list.",
      "Check that the name on the jar is Mayonnaise.",
      "Choose olive oil mayonnaise with egg yolk and vinegar or citrus juice. Check every oil in the ingredient list.",
      "Compare jars by what they add beyond oil, egg yolk, acid and salt.",
      "Once opened, keep it in the fridge and use it within 1 to 2 months.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Skip avocado oil mayo too, even if it names no other oil.",
    ],
  },
  pasta_sauce: {
    decision: "Pasta sauce of tomatoes and olive oil, no added sweetener.",
    cart_pick: "Tomato and olive oil pasta sauce",
    buying_tips: [
      "Ingredients run most first, so anything ahead of the tomatoes outweighs them.",
      "Look for tomatoes first, olive oil as the oil, and no added sweetener.",
      "Read the first ingredient; tomatoes should lead.",
      "Count what follows the tomatoes; a short list is the craft standard.",
      "On canned tomatoes, read the “with” words for added spices, seasonings or vegetables.",
    ],
  },
  white_fish: {
    decision: "Wild-caught white fish by its named species, firm, mild-smelling.",
    cart_pick: "Wild-caught white fish fillet",
    buying_tips: [
      "A fillet is hard to identify by eye, so the species name does that work.",
      "Look for how it was caught and the species, on the sign or label.",
      "Ask which species the fillet is.",
      "Press the flesh and check that it springs back.",
      "Skip fillets with dried, dark or discolored edges.",
    ],
  },
};
const IDS = Object.keys(BECAME);
// Later clean-pick batches own these ids; cleanPick1 no longer freezes them. Each batch appends its ids.
const LATER = new Set([/* clean-pick-2 */ 'frozen_vs_fresh_produce', 'produce_seasonality', 'sprouts_raw', 'berries_picking', 'produce_leafy_greens', 'produce_peppers', 'produce_apples_pears', 'produce_stone_fruit', 'produce_green_beans', 'produce_root_vegetables', 'produce_brassicas', 'produce_onions_garlic', 'produce_citrus', 'produce_mushrooms', 'produce_bananas', 'organic_worth_it_by_type', 'label_organic_scope',
  /* clean-pick-3 */ 'almond_milk', 'soy_milk', 'oat_milk', 'coconut_milk_beverage', 'plant_butter', 'cottage_cheese', 'ghee', 'goat_sheep_dairy', 'ice_cream', 'butcher_counter_asking', 'organ_meats', 'lard_tallow', 'smoked_salmon', 'frozen_nuggets', 'hot_dogs', 'turkey_bacon', 'frozen_pizza', 'frozen_waffles', 'frozen_meals', 'canned_coconut_milk', 'coconut_water',
  /* clean-pick-4 */ 'sourdough', 'bagels', 'breakfast_cereal', 'gluten_free_bread', 'buns_rolls', 'pastries_muffins', 'crackers', 'pretzels', 'fresh_pasta',
  /* clean-pick-5 */ 'tortilla_chips', 'popcorn', 'miso', 'tempeh', 'natto', 'hot_soy_sauce', 'kombucha', 'jam', 'ketchup_mustard', 'canned_soup', 'olives', 'salt', 'nutritional_yeast', 'snack_bars', 'trail_mix', 'hummus',
  /* clean-pick-6 */ 'pick_cucumbers', 'pick_asparagus', 'pick_corn', 'pick_eggplant', 'pick_zucchini', 'pick_cilantro', 'pick_parsley', 'pick_basil', 'pick_snap_peas', 'pick_kohlrabi', 'pick_okra', 'pick_swiss_chard', 'pick_mangoes', 'pick_celery', 'pick_winter_squash', 'pick_ginger_turmeric', 'pick_microgreens',
  /* clean-pick-7 */ 'pick_frozen_peas', 'pick_frozen_broccoli', 'pick_canned_tomatoes', 'pick_tofu', 'pick_jerky', 'pick_fish_sticks', 'pick_juice', 'pick_english_muffins', 'pick_pita_naan',
  /* clean-pick-9 */ 'label_organic_scope', 'label_nonGMO_vs_organic']);
// Lint-forced (lintSections L4 TERM_UNGLOSSED): a meat front naming pasture-raised or organic carries the
// G3/G4 gloss in tier_note; the old tier_note moves to the end of detail, never deleted.
const GLOSSED = IDS.filter((id) => BECAME[id].tier_note);
const CARRY = {
  sugars: 'Organic coconut', rotisserie_chicken: 'Pasture-raised or organic', chicken_breast: 'Pasture-raised or organic',
  chicken_cuts_basics: 'Air-chilled pasture-raised', ground_turkey: 'Pasture-raised or organic', turkey_whole: 'Pasture-raised',
  grassfed_butter: 'Grass-fed', cheese_real_vs_processed: 'Grass-fed', cream_vs_creamer: 'Grass-fed', sour_cream: 'Grass-fed',
  cream_cheese: 'Grass-fed', sandwich_bread: 'flour, water, yeast, salt', tortillas: 'Organic corn', mayo: 'olive oil alone',
  pasta_sauce: 'tomatoes and olive oil', white_fish: 'Wild-caught',
};
// tips[1] is the look-for naming the standard. chicken_cuts_basics and white_fish belong to owned-fact families
// (bird_pig_raising, wild_farmed: lintRepeatedClaim), so their look-for names air-chilled and the catch method instead.
const STANDARD = {
  sugars: /certified organic/, rotisserie_chicken: /pasture-raised or certified organic/, chicken_breast: /pasture-raised or certified organic/,
  chicken_cuts_basics: /air-chilled/, ground_turkey: /pasture-raised or certified organic/, turkey_whole: /pasture-raised/,
  grassfed_butter: /grass-fed/, cheese_real_vs_processed: /grass-fed/, cream_vs_creamer: /grass-fed/, sour_cream: /grass-fed/,
  cream_cheese: /grass-fed/, sandwich_bread: /whole wheat flour, water, yeast and salt/, tortillas: /certified organic/,
  mayo: /olive oil as the only oil/, pasta_sauce: /olive oil/, white_fish: /how it was caught/,
};
const ORGANIC = ['chicken_breast', 'ground_turkey', 'rotisserie_chicken', 'sugars', 'tortillas'];
const DROPPED = []; // no base buying_tips line leaves its card
const BANNED = /\b(health|healthy|healthier|safer|risk|cancer|disease|toxic|toxin|detox|pesticide-free|synthetic|price|cost|cheap|expensive)\b/i;
// clean-pick-10 owns chicken_cuts_basics and ground_turkey now; this batch reads them as of 117ab78.
const live = (id) => preCleanPick10(preCleanPick12(find(kb, id)));
const was = (id) => find(base, id);
// Strings this batch wrote: changed front fields, new tips, the gloss, and what detail gained.
const written = (id) => {
  const e = live(id), b = was(id), out = [];
  for (const k of ['decision', 'cart_pick', 'tier_note']) if (e[k] !== b[k]) out.push(e[k]);
  for (const t of e.buying_tips) if (!b.buying_tips.includes(t)) out.push(t);
  if (e.detail !== b.detail) out.push(e.detail.slice(b.detail.length));
  return out;
};

test('C1 each card carries the final values, and its standard in decision or cart_pick', () => {
  nonEmpty(IDS, 'B1 ids', 16);
  for (const id of IDS) {
    for (const [k, v] of Object.entries(BECAME[id])) assert.deepEqual(live(id)[k], v, `${id}.${k}`);
    if (GLOSSED.includes(id)) assert.equal(live(id).detail, `${was(id).detail} ${was(id).tier_note}`, `${id}.detail keeps the old tier_note`);
    const changed = new Set([...Object.keys(BECAME[id]), ...(GLOSSED.includes(id) ? ['detail'] : [])]);
    for (const k of new Set([...Object.keys(live(id)), ...Object.keys(was(id))])) {
      if (!changed.has(k)) assert.deepEqual(live(id)[k], was(id)[k], `${id}.${k} outside the change`);
    }
    assert.ok(live(id).decision.includes(CARRY[id]) || live(id).cart_pick.includes(CARRY[id]), `${id}: carrying phrase`);
  }
});

test('C2 decisions at most 10 words; twoLineCheck reports 0 violations', () => {
  for (const id of IDS) assert.ok(words(live(id).decision) <= 10, `${id}: ${words(live(id).decision)} words`);
  const out = execFileSync('node', ['scripts/twoLineCheck.js'], { cwd: new URL('../../', import.meta.url).pathname }).toString();
  assert.match(out, /\b0 with violations/);
});

test('C3 tips[0] is a why, not an instruction or the decision; tips[1] names the standard', () => {
  for (const id of IDS) {
    const [t0, t1] = nonEmpty(live(id).buying_tips, `${id} tips`, 2);
    assert.doesNotMatch(t0, /^(choose|pick|buy|read|check|look|skip|compare)\b/i, `${id}: tips[0] is an instruction`);
    assert.notEqual(t0, live(id).decision, `${id}: tips[0] repeats the decision`);
    assert.match(t1, STANDARD[id], `${id}: tips[1] standard`);
  }
});

test('C4 no new or changed string carries a health, risk, synthetic or price word; claim-lock voice', () => {
  const all = nonEmpty(IDS.flatMap(written), 'written strings', 40);
  for (const s of all) {
    assert.doesNotMatch(s, BANNED, s);
    assert.doesNotMatch(s, /—|–|'/, `dash or straight apostrophe: ${s}`);
    assert.doesNotMatch(s, /\b(I|I’m|me|my|we|our|us)\b/, `first person: ${s}`);
  }
});

test('C5 the organic set is exact: organic leads decision or cart_pick on these five B1 cards only', () => {
  const got = IDS.filter((id) => /\borganic\b/i.test(`${live(id).decision} ${live(id).cart_pick}`));
  assert.deepEqual(got.toSorted(), ORGANIC);
});

test('C6 every entry outside the batch, picks included, the entry count and top level equal ede90e7', () => {
  const rest = nonEmpty(kb.entries.map(preCleanPick8).map(preCleanPick12).map(preCleanPick11).filter((e) => !IDS.includes(e.id) && !LATER.has(e.id)), 'other entries', 101);
  for (const e of rest) assert.deepEqual(e, was(e.id), `${e.id} changed`);
  assert.equal(kb.entries.length, base.entries.length);
  assert.deepEqual({ ...kb, entries: 0 }, { ...base, entries: 0 }, 'top-level KB fields');
});

test('C7 do lines stay; the review rows for batch ids carry the new headline; nothing else in the table moves', () => {
  assert.deepEqual(doLines, JSON.parse(git('ede90e7:server/lib/doLines.json')), 'doLines.json equals ede90e7');
  const review = readFileSync(new URL('../../../docs/do-lines-review.md', import.meta.url), 'utf8').split('\n');
  const old = git('ede90e7:docs/do-lines-review.md').split('\n');
  assert.equal(review.length, old.length);
  let seen = 0;
  for (let i = 0; i < old.length; i++) {
    const id = IDS.find((x) => old[i].startsWith(`| \`${x}\` |`) && old[i].includes(` | ${was(x).decision} | `));
    if (!id) {
      if (old[i].startsWith('| `') && (LATER.has(old[i].split('`')[1]) || CLEAN_PICK_8.has(old[i].split('`')[1]))) continue;
      assert.equal(review[i], old[i], `review line ${i + 1}`);
      continue;
    }
    seen++;
    // clean-pick-10 moved cream_vs_creamer's headline again; its row carries the live decision.
    const head = CLEAN_PICK_10.has(id) ? find(kb, id).decision : live(id).decision;
    assert.equal(review[i], old[i].replace(` | ${was(id).decision} | `, ` | ${head} | `), `${id} review row`);
    assert.ok(review[i].includes(` | ${head} | ${doLines[id]} |`), `${id} headline and do`);
  }
  assert.equal(seen, IDS.length, 'one review row per batch id');
});

test('C8 every base buying_tips line is still on its card (tips, watch_out or detail)', () => {
  for (const id of IDS) {
    const e = live(id), keep = [...e.buying_tips, ...(e.watch_out ?? [])];
    for (const t of nonEmpty(was(id).buying_tips, `${id} base tips`, 2)) {
      if (DROPPED.includes(t)) continue;
      assert.ok(keep.includes(t) || String(e.detail).includes(t), `${id}: lost "${t}"`);
    }
  }
});

test('C9 each new cart_pick lands on its own card; chicken asks and rows still land on chicken_cuts_basics', () => {
  for (const id of IDS) assert.equal(matchItemToCard(live(id).cart_pick)?.slug, id, `${id} cart_pick`);
  for (const row of ['whole chicken', 'chicken thighs']) assert.equal(matchItemToCard(row)?.slug, 'chicken_cuts_basics', row);
  for (const q of ['whole chicken', 'chicken thighs']) assert.equal(scoreEntries(q, 3)[0]?.entry.id, 'chicken_cuts_basics', q);
});

test('C10 no new or changed decision, cart_pick or tip appears on more than 2 entries', () => {
  const count = (s) => kb.entries.filter((e) => [e.decision, e.cart_pick, ...(e.buying_tips ?? [])].includes(s)).length;
  const fresh = nonEmpty(IDS.flatMap((id) => [live(id).decision, live(id).cart_pick, ...live(id).buying_tips.filter((t) => !was(id).buying_tips.includes(t))]), 'fresh lines', 30);
  for (const s of fresh) assert.ok(count(s) <= 2, `"${s}" on ${count(s)} entries`);
});
