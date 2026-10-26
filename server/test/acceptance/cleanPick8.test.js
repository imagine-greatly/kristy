import { restoreOrganicCarts, liveDecision, withoutGapKeys, withoutGapRows } from './cartPlain.js';
// clean-pick-8 (docs/CLEAN-PICK-PLAN.md B8 r2): 17 pantry ids and carried picks under the stance. Written by the builder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { lintCard, lintPick, lintSections, words as lintWords } from '../../lib/counterCardLint.js';
import { projectEntry } from '../../lib/counterCards.js';
import { attachCards, matchItemToCard, matchItemToPick } from '../../lib/listMatch.js';
import { CLEAN_PICK_8, prePickAvoid } from './twoLinePin.js';

const BASE = '125244d';
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
const base = JSON.parse(git(`${BASE}:server/kristy_perimeter_kb.json`));
const doLines = JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'));
const sectionRules = JSON.parse(readFileSync(new URL('../../lib/sectionRules.json', import.meta.url), 'utf8'));
const find = (k, id) => k.entries.find((e) => e.id === id);
const live = (id) => find(kb, id);
const was = (id) => find(base, id);
const isPick = (e) => e.kind === 'pick';
const ws = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;

// Every field B8 set, verbatim.
const SET = {
  "oats_steelcut_rolled_instant": {
    "decision": "Plain organic oats, steel-cut or rolled.",
    "sources": [
      "USDA FoodData Central",
      "Michigan State University Extension “Love your oats” https://www.canr.msu.edu/news/love_your_oats (glycemic index measured at 42 for steel-cut oats, 55 for rolled and 83 for instant)",
      {
        "name": "Cornucopia Institute: Glyphosate Used to Kill and Prepare Crops for Harvest",
        "url": "https://www.cornucopia.org/2017/10/glyphosate-used-kill-prepare-crops-harvest"
      },
      {
        "name": "FoodPrint: Glyphosate Residue in Food",
        "url": "https://foodprint.org/blog/glyphosate-residue-in-food/"
      },
      {
        "name": "Environmental Working Group: Glyphosate in oat-based products",
        "url": "https://www.ewg.org/news-insights/news/2023/04/going-going-gone-ewg-finds-glyphosate-levels-drop-oat-based-products"
      },
      {
        "name": "EWG: Chlormequat found in popular oat-based foods",
        "url": "https://www.EWG.org/research/ewg-investigation-dangerous-agricultural-chemical-chlormequat-found-popular-oat-based"
      }
    ],
    "cart_pick": "Organic steel-cut oats",
    "buying_tips": [
      "Same grain in every form; the flavored packets are where the sugar is.",
      "Look for USDA Organic oats, with a Glyphosate Residue Free label on top where the bag carries it.",
      "Plain oats in any form; steel-cut if you like chew and have time.",
      "Skip flavored instant packets. Check the sugar on the label.",
      "Bulk oats are pennies per serving.",
      "Choose certified organic oats over conventional. Conventional oats may be sprayed with glyphosate shortly before harvest to dry the crop. Organic farming does not allow glyphosate. Drift can still leave residues on organic oats."
    ],
    "watch_out": [
      "Steel-cut, rolled and instant are the same grain cut and cooked differently. The processing shows in a measured blood-sugar number. One extension comparison put it at 42 for steel-cut, 55 for rolled and 83 for instant.",
      "Chlormequat is a plant growth regulator. In commissioned lab tests it turned up in 12 of 13 conventional oat foods; the one organic sample had none."
    ]
  },
  "beans_dried_vs_canned": {
    "decision": "Organic dried beans, whole with unbroken skins.",
    "cart_pick": "Organic dried beans",
    "buying_tips": [
      "Cooking dried beans yourself is the only way to set the salt.",
      "Look for USDA Organic on the bag of dried beans.",
      "Dried beans cost a fraction of canned per serving.",
      "A slow cooker or pressure cooker removes the planning problem.",
      "Whole beans with unbroken skins cook evenly. Split ones turn to mush.",
      "Choose certified organic beans over conventional, dried or canned. Conventional beans and other pulses may receive glyphosate before harvest for weed control. Organic farming does not allow glyphosate. Drift can still leave residues on organic beans."
    ]
  },
  "grains_beyond_rice": {
    "decision": "Organic grains with the bran still on, not polished off.",
    "sources": [
      "USDA FoodData Central",
      "FDA guidance on inorganic arsenic in rice",
      "Whole Grains Council grain reference",
      "Jerry James Stone “Why You Should Always Rinse Quinoa Before Cooking” https://www.jerryjamesstone.com/2019/06/17/why-you-should-always-rinse-quinoa-before-cooking/ (quinoa’s outer hull is coated with saponin, a bitter natural coating, and rinsing before cooking is how it comes off)",
      "https://wholegrainscouncil.org/whole-grains-101/whole-grains-101-orphan-pages-found/types-barley",
      {
        "name": "Cornucopia Institute: Glyphosate Used to Kill and Prepare Crops for Harvest",
        "url": "https://www.cornucopia.org/2017/10/glyphosate-used-kill-prepare-crops-harvest"
      },
      {
        "name": "FoodPrint: Glyphosate residue in food",
        "url": "https://foodprint.org/blog/glyphosate-residue-in-food/"
      }
    ],
    "cart_pick": "Organic whole or hulled grain, not pearled",
    "watch_out": [
      "Quinoa carries a bitter natural coating on its outer hull. Rinse it before cooking. That is what takes the bitterness off.",
      "Conventional wheat and barley may be sprayed with glyphosate shortly before harvest to dry the crop. Organic farming does not allow glyphosate."
    ],
    "buying_tips": [
      "Pearled grains have some or all of the bran polished off; hulled loses only the hull.",
      "Look for USDA Organic on the bag or the bulk bin label.",
      "Buckwheat, millet, sorghum and quinoa carry no gluten. Barley, farro and bulgur do.",
      "Buy from the bulk bins where you can.",
      "Cook a big batch. They keep several days and reheat straight from cold."
    ]
  },
  "pick_sausage": {
    "decision": "Pastured pork sausage from a local farm; celery powder supplies nitrite.",
    "sources": [
      {
        "name": "Cornell LII: 9 CFR § 319.140 Sausage",
        "url": "https://www.law.cornell.edu/cfr/text/9/319.140"
      },
      {
        "name": "Cornell LII: 9 CFR § 319.141 Fresh pork sausage",
        "url": "https://www.law.cornell.edu/cfr/text/9/319.141"
      },
      {
        "name": "Cornell LII: 9 CFR § 317.17 Curing agents in the ingredients statement",
        "url": "https://www.law.cornell.edu/cfr/text/9/317.17"
      },
      {
        "name": "Consumer Reports: Decoding the labels on meat packages",
        "url": "https://www.consumerreports.org/food/decoding-the-labels-on-meat-packages/"
      },
      {
        "name": "NPR: No nitrates added labels and celery-based curing",
        "url": "https://www.npr.org/sections/thesalt/2019/08/29/755115208/duped-in-the-deli-aisle-no-nitrates-added-labels-are-often-misleading"
      },
      {
        "name": "Cornell LII: 7 CFR § 205.237 Livestock feed",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.237"
      },
      {
        "name": "Cornell LII: 7 CFR § 205.239 Livestock living conditions",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.239"
      }
    ]
  },
  "pasta_dry": {
    "decision": "Organic dry pasta of durum semolina and water.",
    "cart_pick": "Organic dry durum semolina pasta",
    "buying_tips": [
      "The standard also allows farina or other flour; the list shows which is in the box.",
      "Look for USDA Organic on the box of durum semolina pasta.",
      "Look for durum semolina and water in the list.",
      "Plain dry pasta can be checked by ingredients without a bronze-cut claim.",
      "Read enrichment separately from the flour name and any bronze-cut claim.",
      "Choose certified organic wheat pasta over conventional. Conventional wheat may be sprayed with glyphosate shortly before harvest to dry the crop. Organic farming does not allow glyphosate. Drift can still leave residues on organic wheat."
    ]
  },
  "coffee_beans": {
    "sources": [
      "https://www.ebi.ac.uk/europepmc/webservices/rest/PMC11243642/fullTextXML",
      "https://www.ebi.ac.uk/europepmc/webservices/rest/PMC12607991/fullTextXML",
      {
        "name": "Consumer Reports: What you need to know about process contaminants",
        "url": "https://www.consumerreports.org/health/food-contaminants/what-you-need-to-know-about-process-contaminants-a8019192822/"
      }
    ],
    "watch_out": [
      "The sources include ground pods and accelerated storage tests. They do not prove a health advantage for a particular roast or bean.",
      "No universal number of fresh days is established for all retail bags.",
      "Acrylamide forms as foods brown at high heat, and coffee is one of the foods it is found in. Labels are not required to list it."
    ]
  },
  "pick_egg_whites": {
    "decision": "Organic whites: certified organic feed and outdoor access, pasteurized per federal standard.",
    "sources": [
      {
        "name": "USDA FSIS: Egg Products and Food Safety",
        "url": "https://www.fsis.usda.gov/es/node/3373"
      },
      {
        "name": "21 CFR 160.140, Egg whites",
        "url": "https://www.law.cornell.edu/cfr/text/21/160.140"
      },
      {
        "name": "Cornell LII: 7 CFR § 205.237 Livestock feed",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.237"
      },
      {
        "name": "Cornell LII: 7 CFR § 205.239 Livestock living conditions",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.239"
      }
    ]
  },
  "pick_jerky": {
    "decision": "Whole-muscle grass-fed, grass-finished beef jerky with a short list; celery powder supplies nitrite.",
    "sources": [
      {
        "name": "NDSU Extension: Jerky",
        "url": "https://www.ndsu.edu/agriculture/extension/publications/jerky-native-american-inspired-snack-we-all-can-enjoy-today"
      },
      {
        "name": "Cornell LII: 9 CFR § 317.17 Curing agents in the ingredients statement",
        "url": "https://www.law.cornell.edu/cfr/text/9/317.17"
      },
      {
        "name": "Consumer Reports: Decoding the labels on meat packages",
        "url": "https://www.consumerreports.org/food/decoding-the-labels-on-meat-packages/"
      },
      {
        "name": "NPR: No nitrates added labels and celery-based curing",
        "url": "https://www.npr.org/sections/thesalt/2019/08/29/755115208/duped-in-the-deli-aisle-no-nitrates-added-labels-are-often-misleading"
      },
      {
        "name": "American Grassfed Association: Our Standards",
        "url": "https://www.americangrassfed.org/about-us/our-standards/"
      }
    ]
  },
  "pick_soup_bones": {
    "decision": "Ask your meat counter for grass-fed, grass-finished marrow or knuckle soup bones.",
    "sources": [
      {
        "name": "MSU Extension: Are you throwing away valuable food? Part three: Meat",
        "url": "https://www.canr.msu.edu/news/are_you_throwing_away_valuable_food_part_three_meat"
      },
      {
        "name": "American Grassfed Association: Our Standards",
        "url": "https://www.americangrassfed.org/about-us/our-standards/"
      }
    ]
  },
  "raw_cider_vinegar": {
    "decision": "Raw, unfiltered cider vinegar from organic apples, with the mother.",
    "sources": [
      "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cpg-sec-525825-vinegar-definitions-adulteration-vinegar-eels",
      "https://en.wikipedia.org/wiki/Vinegar",
      "https://en.wikipedia.org/wiki/Apple_cider_vinegar",
      {
        "name": "USDA AMS Pesticide Data Program Annual Summary",
        "url": "https://www.ams.usda.gov/sites/default/files/media/PDPAnnualSummary.pdf"
      }
    ],
    "cart_pick": "Organic raw cider vinegar with the mother",
    "buying_tips": [
      "Cider vinegar is fermented apple juice; unfiltered bottles can keep the mother.",
      "Look for USDA Organic on the bottle. In USDA residue testing, about 94 percent of fresh apple samples carried at least one pesticide.",
      "Look for unfiltered or with the mother on the label.",
      "Check that the label does not say diluted.",
      "Read the name for a second vinegar in a blend."
    ]
  },
  "tea": {
    "sources": [
      "https://lpi.oregonstate.edu/mic/food-beverages/tea",
      "https://www.law.cornell.edu/cfr/text/21/173.228",
      "https://www.mentalfloss.com/food/beverages/decaffeinated-vs-caffeine-free-tea-whats-the-difference",
      {
        "name": "PMC: Microplastics from plastic tea bags",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10389239/"
      }
    ],
    "watch_out": [
      "“Herbal tea” on a box means other plants, not the tea leaf.",
      "Some tea bags are made of nylon or PET plastic and steep at brewing heat; loose leaf skips the bag. Many paper bags also carry plastic fibers in the seal."
    ]
  },
  "potato_chips": {
    "decision": "Sliced organic potato chips in olive oil, coconut or tallow.",
    "detail": "The FDA classifies potato chips as thin slices of potatoes fried in deep fat. A stacked crisp starts from dehydrated potato flakes mixed with cornstarch and water. That mix gives every piece the same shape for stacking. The FDA let one such product use the name potato chips only with a prominent disclaimer: “potato chips made from dried potatoes.” Its maker chose “potato crisps,” the British term, instead. For chips, Kristy’s standard is olive oil, coconut oil, tallow or lard. Skip seed oils and avocado oil. High-heat frying browns starchy slices, and darker browning forms more of a heat-made compound. Look for lighter browning: golden chips over dark ones.",
    "sources": [
      "https://www.smithsonianmag.com/arts-culture/curious-history-potato-chip-180979232/",
      "https://www.chowhound.com/1803980/pringles-arent-potato-chips/",
      "https://www.thetakeout.com/1833928/why-pringles-not-real-potato-chips/",
      {
        "name": "Dr. Cate Shanahan: The Hateful Eight seed oils",
        "url": "https://drcate.com/hateful-eight/"
      },
      {
        "name": "Weston A. Price Foundation: FAQ, fats and oils",
        "url": "https://www.westonaprice.org/health-topics/faq-fats-and-oils/"
      },
      {
        "name": "CSPI: TBHQ preservative uses",
        "url": "https://www.cspi.org/node/7416"
      },
      {
        "name": "EWG: Food chemicals guide, preservative uses",
        "url": "https://www.ewg.org/consumer-guides/ewgs-dirty-dozen-guide-food-chemicals-top-12-avoid"
      },
      {
        "name": "USDA AMS Pesticide Data Program Annual Summary",
        "url": "https://www.ams.usda.gov/sites/default/files/media/PDPAnnualSummary.pdf"
      },
      {
        "name": "Consumer Reports: What you need to know about process contaminants",
        "url": "https://www.consumerreports.org/health/food-contaminants/what-you-need-to-know-about-process-contaminants-a8019192822/"
      }
    ],
    "cart_pick": "Sliced organic potato chips: olive oil",
    "buying_tips": [
      "Stacked crisps start as dried potato flakes and cornstarch pressed into one shape.",
      "Look for USDA Organic on the bag. In USDA residue testing, about 98 percent of fresh potato samples carried at least one pesticide.",
      "Read the ingredient list for the frying fat; take chips cooked in olive oil, coconut oil, tallow or lard.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Read the ingredients; a sliced chip starts with potatoes.",
      "Identical, stackable shapes point to a crisp pressed from flakes.",
      "Expect irregular sizes and folds in a bag of sliced chips.",
      "BHA, BHT and TBHQ are preservatives added to fats and fat-containing foods. Read the ingredient list for BHA, BHT or TBHQ. Take a list without them over one naming any."
    ]
  },
  "popcorn": {
    "decision": "Organic plain popcorn kernels, popped at home in coconut oil.",
    "sources": [
      "https://ag.purdue.edu/news/2020/02/whats-under-the-shell-of-this-popular-snack.html",
      "https://www.nbcnews.com/id/wbna7584284",
      "https://share.america.gov/popcorn-hails-from-americas-heartland/",
      "https://www.csmonitor.com/The-Culture/Food/Stir-It-Up/2014/0903/The-easier-cheaper-way-to-make-air-popped-popcorn",
      "https://blogs.extension.iastate.edu/answerline/2026/05/19/popcorn/",
      {
        "name": "Dr. Cate Shanahan: The Hateful Eight seed oils",
        "url": "https://drcate.com/hateful-eight/"
      },
      {
        "name": "Weston A. Price Foundation: FAQ, fats and oils",
        "url": "https://www.westonaprice.org/health-topics/faq-fats-and-oils/"
      },
      {
        "name": "CSPI: New GMO disclosures",
        "url": "https://www.cspi.org/article/what-know-about-new-gmo-disclosures"
      },
      {
        "name": "Consumer Reports: Dangerous PFAS chemicals are in your food packaging",
        "url": "https://www.consumerreports.org/health/food-contaminants/dangerous-pfas-chemicals-are-in-your-food-packaging-a3786252074/"
      }
    ],
    "cart_pick": "Organic plain popcorn kernels",
    "buying_tips": [
      "Plain kernels pop with no oil, so any butter, oil or salt is your call.",
      "Look for USDA Organic on the bag of kernels.",
      "Look for a bag of kernels with popcorn as the only ingredient.",
      "Pop kernels at home in coconut oil, butter or tallow, then salt to taste.",
      "Microwave and ready-popped bags name their oil in the list; skip sunflower, safflower, canola, soybean, corn and cottonseed oil.",
      "CSPI says popcorn is never bioengineered, so a non-GMO seal on plain kernels adds nothing."
    ],
    "watch_out": [
      "Prepopped popcorn is often coated with flavorings before it reaches the shelf.",
      "Skip avocado oil too: the label cannot prove the oil is pure.",
      "Canola, soy or corn oil in ready-popped bags is typically derived from bioengineering.",
      "Microwave popcorn bags are grease-lined, and grease-resistant packaging can carry PFAS. Pop plain kernels on the stove instead."
    ]
  }
};

// P4 current owned-field pins; historical fixtures below still serve their archive guards.
// retired (P4): the pilot soup_bones text named a brand-free seal we could not archive; the base text stays (C11/C14/C15).
const PILOT_FIELDS = {};
const IDS = Object.keys(SET);
const MEMBERS = ['pick_sausage', 'pick_egg_whites', 'pick_soup_bones', 'pick_jerky', 'popcorn', 'oats_steelcut_rolled_instant', 'beans_dried_vs_canned', 'pasta_dry', 'grains_beyond_rice', 'coffee_beans', 'tea', 'cocoa', 'maple_syrup', 'raw_cider_vinegar', 'vinegar', 'potato_chips', 'dried_fruit'];
// Already at their own top rung or waiting on a source: byte-equal to the base.
const UNCHANGED = ['cocoa', 'maple_syrup', 'vinegar', 'dried_fruit'];
const PICKS = ['pick_sausage', 'pick_egg_whites', 'pick_soup_bones', 'pick_jerky'];
// Cards whose top rung moved: decision and cart_pick change; coffee_beans and tea are avoid-only.
const RUNG = ['popcorn', 'oats_steelcut_rolled_instant', 'beans_dried_vs_canned', 'pasta_dry', 'grains_beyond_rice', 'raw_cider_vinegar', 'potato_chips'];
const AVOID_ONLY = ['coffee_beans', 'tea'];
const G4 = 'certified organic feed and outdoor access';
const GRASS = /grass-fed, grass-finished/i;
const OWNED_CARD = ['decision', 'cart_pick', 'buying_tips', 'watch_out', 'detail', 'science', 'sources'];
const urls = (e) => (e.sources || []).map((s) => (typeof s === 'string' ? s : s.url)).filter(Boolean);
const strings = (e) => Object.entries(e).filter(([k]) => !['sources', 'id', 'labels_decoded'].includes(k)).flatMap(([, v]) => [v].flat()).filter((v) => typeof v === 'string');
const sentences = (s) => s.split(/(?<=[.!?:;])\s+/).filter(Boolean);
const fresh = (id) => {
  const old = strings(was(id)).join('\n');
  return strings(live(id)).flatMap(sentences).filter((s) => !old.includes(s));
};
const allFresh = () => IDS.flatMap(fresh);

test('C0 the batch set is the 13 changed members; CLEAN_PICK_8 names exactly them', () => {
  nonEmpty(IDS, 'B8 ids', 13);
  assert.deepEqual([...IDS].sort(), MEMBERS.filter((id) => !UNCHANGED.includes(id)).sort());
  assert.deepEqual([...CLEAN_PICK_8].sort(), [...IDS].sort());
  assert.deepEqual([...RUNG, ...AVOID_ONLY, ...PICKS].sort(), [...IDS].sort());
});

test('C1 every B8 owned field equals its current value', () => {
  for (const id of IDS) {
    assert.ok(live(id) && was(id), `${id} missing`);
    const owned = PICKS.includes(id) ? ['decision', 'sources'] : AVOID_ONLY.includes(id) ? ['watch_out', 'sources'] : OWNED_CARD;
    for (const k of Object.keys(SET[id])) assert.ok(owned.includes(k), `${id}.${k} not owned`);
    // retired: pilot merge replaced this batch's text (P4)
    for (const [f, value] of Object.entries({ ...SET[id], ...PILOT_FIELDS[id] })) assert.deepEqual(live(id)[f], value, `${id}.${f}`);
  }
});

test('C1b the 4 unchanged members are byte-equal to the base; avoid-only cards keep decision and cart', () => {
  for (const id of UNCHANGED) assert.equal(JSON.stringify(live(id)), JSON.stringify(was(id)), id);
  for (const id of AVOID_ONLY) {
    assert.equal(live(id).decision, was(id).decision, `${id} decision`);
    assert.equal(live(id).cart_pick, was(id).cart_pick, `${id} cart_pick`);
  }
});

test("C2 pilot corpus size in the batch view and top-level metadata", () => {
  // retired: pilot merge replaced this batch's text (P4)
  assert.equal(kb.entries.length, 284);
  assert.deepEqual({ ...kb, entries: [] }, { ...base, entries: [] });
});

test('C3 the projected cards lint clean; picks pass lintPick and lintCard', () => {
  for (const id of [...RUNG, ...AVOID_ONLY]) assert.deepEqual(lintCard(projectEntry(live(id), { doLine: doLines[id] || '' })), [], `${id} lintCard`);
  for (const id of PICKS) {
    assert.deepEqual(lintPick(live(id)), [], `${id} lintPick`);
    assert.deepEqual(lintCard(live(id)), [], `${id} lintCard`);
  }
});

test('C4 no new sentence carries a banned word, first person, an em-dash or a bodily acrylamide claim', () => {
  const all = allFresh();
  nonEmpty(all, 'fresh sentences', 15);
  for (const s of all) {
    assert.doesNotMatch(s, /\b(health|healthy|healthier|safer|safe|risk|cancer|carcinogen\w*|disease|toxic|toxin|detox|treat|treats|cure|cures|prevent|prevents|lowers?|price|cost|cheap|expensive)\b/i, s);
    assert.doesNotMatch(s, /\b(poison\w*|chemicals?|spray-free)\b/i, s);
    assert.doesNotMatch(s, /—|\b(I|me|my)\b/, s);
  }
  assert.ok(!fresh('potato_chips').some((s) => /acrylamide/i.test(s)), 'potato_chips names acrylamide');
  assert.ok(fresh('potato_chips').some((s) => /lighter browning/i.test(s)), 'potato_chips lighter browning');
});

// retired: pilot merge replaced this batch's text (P4)

test('C8 every base tip and watch_out survives verbatim; no line calls organic the standard', () => {
  let n = 0;
  for (const id of IDS) {
    const now = [...(live(id).buying_tips || []), live(id).detail || ''].join('\n');
    for (const t of was(id).buying_tips || []) { n++; assert.ok(now.includes(t), `${id} lost "${t}"`); }
    for (const w of was(id).watch_out || []) assert.ok((live(id).watch_out || []).includes(w), `${id} lost watch_out "${w}"`);
  }
  assert.ok(n >= 40, `base tips checked ${n}`);
  for (const id of MEMBERS) for (const s of strings(live(id))) assert.doesNotMatch(s, /organic (is )?the standard/i, `${id}: ${s}`);
  // The new look-for sits at tips[1] on each rung card.
  for (const id of RUNG) assert.match(live(id).buying_tips[1], /^Look for USDA Organic/, `${id} tips[1]`);
});

test('C9 each new cart routes to its own card (grains_beyond_rice: as its base cart did, to none)', () => {
  for (const id of RUNG) {
    const want = id === 'grains_beyond_rice' ? undefined : id;
    if (id === 'grains_beyond_rice') assert.equal(matchItemToCard(was(id).cart_pick)?.slug, undefined, 'grains base cart');
    assert.equal(matchItemToCard(live(id).cart_pick)?.slug, want, `${live(id).cart_pick}`);
  }
});

test('C10 no new string sits on more than 2 entries', () => {
  const all = IDS.flatMap((id) => strings(live(id)).filter((s) => !strings(was(id)).includes(s)));
  nonEmpty(all, 'new strings', 13);
  for (const s of all) {
    const n = kb.entries.filter((e) => strings(e).includes(s)).length;
    assert.ok(n <= 2, `${s} on ${n} entries`);
  }
});

test('C11 the 4 picks: decision and sources only, keep phrases, short, grass on 2, G4 gloss on 2', () => {
  const KEEP = { pick_sausage: [/sausage/i, /celery powder supplies nitrite/i], pick_egg_whites: [/whites/i, /pasteurized/i, /federal standard/i], pick_soup_bones: [/Ask your meat counter/, /marrow or knuckle soup bones/], pick_jerky: [/Whole-muscle/, /beef jerky with a short list/, /celery powder supplies nitrite/] };
  for (const id of PICKS) {
    const d = live(id).decision;
    for (const re of KEEP[id]) { assert.match(d, re, `${id} ${re}`); assert.match(was(id).decision, re, `${id} base ${re}`); }
    assert.ok(ws(d) <= 14, `${id} ${ws(d)} words`);
    assert.ok(lintWords(d) <= 16, `${id} ${lintWords(d)} lint words`);
    assert.equal(GRASS.test(d), ['pick_soup_bones', 'pick_jerky'].includes(id), `${id} grass term`);
    assert.equal(d.includes(G4), id === 'pick_egg_whites', `${id} G4 gloss`);
    assert.equal(/\borganic\b/i.test(d), id === 'pick_egg_whites', `${id} organic`);
  }
  // retired: pilot merge replaced this batch's text (P4)
});

test('C12 lintSections L4 reads a pick’s own decision for its gloss; cards still do not count it', () => {
  assert.deepEqual(lintSections(sectionRules, kb.entries), []);
  const swap = (e) => kb.entries.map((x) => (x.id === 'pick_egg_whites' ? e : x));
  const bare = { ...live('pick_egg_whites'), decision: 'Organic egg whites, pasteurized, to the federal standard.' };
  assert.ok(lintSections(sectionRules, swap(bare)).some((v) => v.code === 'TERM_UNGLOSSED' && v.id === 'pick_egg_whites'), 'unglossed pick passes');
  const { kind, ...asCard } = live('pick_egg_whites');
  assert.equal(kind, 'pick');
  assert.ok(lintSections(sectionRules, swap(asCard)).some((v) => v.code === 'TERM_UNGLOSSED' && v.id === 'pick_egg_whites'), 'card decision counted as gloss');
});

test('C13 pick routing equals the base; each pick row carries its new line', () => {
  const queries = base.entries.filter(isPick).flatMap((e) => (e.aliases || []).flatMap((a) => [a, `organic ${a}`]));
  nonEmpty(queries, 'queries', 140);
  for (const q of queries) assert.equal(matchItemToPick(q, kb.entries)?.id, matchItemToPick(q, base.entries)?.id, q);
  for (const id of PICKS) {
    const name = live(id).aliases[0];
    const row = attachCards({ items: [{ name, source: 'user' }] }, { log: false }).items[0];
    assert.equal(row.pickId, id, `${name} pickId ${row.pickId}`);
    assert.equal(row.pickLine, liveDecision(id), `${name} pickLine`);
    assert.equal(row.cardSlug, undefined, `${name} cardSlug ${row.cardSlug}`);
  }
});

test('C14 no new sentence names a brand', () => {
  const ALLOW = new Set(['USDA', 'Organic', 'Glyphosate', 'Residue', 'Free', 'PFAS', 'PET', 'Microwave', 'Chlormequat', 'In', 'Acrylamide', 'No', 'Look', 'Organic', 'Raw', 'Sliced', 'Whole-muscle', 'Ask', 'Conventional', 'Some', 'Many', 'Pop', 'High-heat']);
  for (const s of allFresh()) {
    const words = s.split(/\s+/).slice(1).map((w) => w.replace(/^[“"‘(]+|[^\w%]+$/g, ''));
    for (const w of words) if (/^[A-Z]/.test(w)) assert.ok(ALLOW.has(w), `"${w}" in: ${s}`);
  }
});

test('C15 every source URL new in B8 sits verbatim on a url: line under docs/sources/; no source dropped', () => {
  const files = [];
  const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : files.push(p); } };
  walk(join(ROOT, 'docs/sources'));
  const lines = new Set(files.flatMap((f) => readFileSync(f, 'utf8').split('\n')).filter((l) => l.startsWith('url: ')).map((l) => l.slice(5).trim()));
  const added = IDS.flatMap((id) => urls(live(id)).filter((u) => !urls(was(id)).includes(u)));
  nonEmpty(added, 'new B8 urls', 13);
  for (const u of added) assert.ok(lines.has(u), u);
  for (const id of IDS) for (const u of urls(was(id))) assert.ok(urls(live(id)).includes(u), `${id} dropped ${u}`);
});

test('C17 no "ask" lands in a card decision or cart; new asks sit with a counter', () => {
  for (const s of allFresh()) if (/\bask\b/i.test(s)) assert.match(s, /(counter|butcher|baker|bakery|deli|market|grower)/i, s);
  for (const id of MEMBERS) if (!PICKS.includes(id)) for (const t of [live(id).decision, live(id).cart_pick || '']) assert.doesNotMatch(t, /\bask\b/i, `${id}: ${t}`);
  for (const id of PICKS) assert.equal(/\bask\b/i.test(live(id).decision), id === 'pick_soup_bones', id);
});

const T = {
  glyphosate_desiccation: [/glyphosate/i],
  chlormequat: [/chlormequat/i],
  bioengineered: [/bioengineer/i],
  pfas_packaging: [/PFAS/, /grease/i],
  bha_bht: [/\bBHA\b|\bBHT\b/],
  plastic_teabags: [/nylon|PET plastic/i],
  acrylamide: [/acrylamide|lighter browning/i],
  seed_oils: [/\b(canola|cottonseed|soybean oil|sunflower|safflower|grapeseed|vegetable oil|seed oils?)\b/i],
};
// Rows B8 wrote, per id; each pattern sits in watch_out + buying_tips[2..], or detail where noted.
const AVOID = { popcorn: ['pfas_packaging'], oats_steelcut_rolled_instant: ['chlormequat'], grains_beyond_rice: ['glyphosate_desiccation'], tea: ['plastic_teabags'], coffee_beans: ['acrylamide'] };
const DETAIL = { potato_chips: ['acrylamide'] };
// Closed at the base by register label terms; B8 adds nothing for them.
const ALREADY = { popcorn: ['bioengineered'], oats_steelcut_rolled_instant: ['glyphosate_desiccation'], beans_dried_vs_canned: ['glyphosate_desiccation'], pasta_dry: ['glyphosate_desiccation'], potato_chips: ['bha_bht'], dried_fruit: [] };
const listLines = (e) => [...(e.watch_out || []), ...(e.buying_tips || []).slice(2)].join('\n');

test('C18 avoid lines land where named, at most 3 register items in tips/watch_out, register evidence on file', () => {
  for (const id of IDS) {
    const named = Object.keys(T).filter((rid) => T[rid].some((t) => t.test(listLines(live(id)))));
    assert.ok(named.length <= 3, `${id} ${named.length} avoid items: ${named}`);
  }
  for (const [id, rids] of Object.entries(AVOID)) for (const rid of rids) {
    assert.ok(T[rid].every((t) => t.test(listLines(live(id)))), `${id} ${rid}`);
    assert.ok(!T[rid].some((t) => t.test(listLines(was(id)))), `${id} ${rid} was already closed`);
    for (const top of [live(id).decision, live(id).cart_pick || '']) assert.ok(!T[rid].some((t) => t.test(top)), `${id} avoid term in headline`);
  }
  for (const [id, rids] of Object.entries(DETAIL)) for (const rid of rids) assert.ok(T[rid].some((t) => t.test(live(id).detail)), `${id} detail lacks ${rid}`);
  for (const [id, rids] of Object.entries(ALREADY)) for (const rid of rids) assert.ok(T[rid].some((t) => t.test(strings(was(id)).join('\n'))), `${id} already-closed ${rid}`);
  const reg = readFileSync(join(ROOT, 'docs/CONCERN-REGISTER.md'), 'utf8').split('\n');
  const rows = [...new Set([...Object.values(AVOID), ...Object.values(DETAIL)].flat())];
  nonEmpty(rows, 'B8 register rows', 5);
  for (const rid of rows) {
    const row = reg.find((l) => l.startsWith(`| \`${rid}\``));
    assert.ok(row, `register ${rid}`);
    const files = [...row.matchAll(/`([\w-]+\/[\w.-]+\.md)`/g)].map((m) => m[1]);
    nonEmpty(files, `${rid} evidence`, 1);
    for (const f of files) assert.ok(existsSync(join(ROOT, 'docs/sources/concerns', f)), `${rid} ${f}`);
  }
});

test('C18b no glyphosate, residue-free or tested headline on the grain cards', () => {
  for (const id of ['oats_steelcut_rolled_instant', 'beans_dried_vs_canned', 'pasta_dry', 'grains_beyond_rice']) {
    for (const t of [live(id).decision, live(id).cart_pick || '']) assert.doesNotMatch(t, /glyphosate|residue[ -]free|tested/i, `${id}: ${t}`);
  }
});

test('C19 no reassurance line on the batch', () => {
  for (const id of MEMBERS) for (const s of strings(live(id))) assert.doesNotMatch(s, /(within (legal |safe )?limits|well below|tolerance|safe levels?)/i, `${id}: ${s}`);
});

test('C20 recommended fats are only olive oil, coconut or tallow; never seed oil or avocado oil', () => {
  const SEED = /\b(canola|cottonseed|soybean|sunflower|safflower|grapeseed|corn oil|vegetable oil|seed oils?|avocado oil)\b/i;
  for (const id of ['potato_chips', 'popcorn']) for (const t of [live(id).decision, live(id).cart_pick]) {
    assert.doesNotMatch(t, SEED, `${id}: ${t}`);
    for (const m of t.matchAll(/(\w+) oil\b/gi)) assert.ok(/^(olive|coconut)$/i.test(m[1]), `${id}: ${t}`);
  }
  assert.match(live('potato_chips').decision, /olive oil, coconut or tallow/);
  for (const s of allFresh()) assert.doesNotMatch(s, /avocado oil/i, s);
});
