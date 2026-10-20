// clean-pick-12 (Devon 2026-10-20, register avoid gaps): B12 names the register's avoid items on 12 bread, sauce, condiment, drink, soup and bar cards, at most 3 per card; breakfast_cereal's chlormequat and snack_bars' glyphosate and seed-oil tips sit in detail. Five ids already closed (sugars, flour_basics, crackers, hummus, tortilla_chips) leave the batch unchanged. decision and cart_pick byte-equal to 52cfde3.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { lintCard } from '../../lib/counterCardLint.js';
import { projectEntry } from '../../lib/counterCards.js';
import { preCleanPick8, prePickAvoid } from './twoLinePin.js';

const BASE = '52cfde3';
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const git = (ref) => execFileSync('git', ['show', ref], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
import { preT6_4 } from './twoLinePin.js';
kb.entries = kb.entries.map(preT6_4); // t6-4: produce/label pins read 2f67540; t6_4.test.js owns live copy.
import { preT6_3 } from './twoLinePin.js';
kb.entries = kb.entries.map(preT6_3); // t6-3: pantry pins read 6d6ca49; t6_3.test.js owns live copy.
import { preT6_1, preT6_2 } from "./twoLinePin.js";
kb.entries = kb.entries.map(preT6_2); // t6-2: dairy/egg pins read ca32bef; t6_2.test.js owns live copy.
kb.entries = kb.entries.map(preT6_1); // t6-1: the 15 meat/seafood cards read as of 85c399e; t6_1.test.js owns them now
const base = JSON.parse(git(`${BASE}:server/kristy_perimeter_kb.json`));
const doLines = JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'));
const find = (k, id) => k.entries.find((e) => e.id === id);
const live = (id) => find(kb, id);
const was = (id) => find(base, id);
// Batches after B12 that edit these entries add their ids here.
const LATER = new Set([]);

// Every field B12 set, verbatim.
const SET = {
  "tortillas": {
    "sources": [
      "https://www.tastingtable.com/1066360/masa-harina-vs-corn-flour-whats-the-difference/",
      "https://www.healthline.com/nutrition/corn-vs-flour-tortilla",
      "https://www.ebi.ac.uk/europepmc/webservices/rest/PMC11811476/fullTextXML",
      {
        "name": "CSPI: New GMO disclosures",
        "url": "https://www.cspi.org/article/what-know-about-new-gmo-disclosures"
      },
      {
        "name": "Non-GMO Project: GMO FAQ",
        "url": "https://www.nongmoproject.org/gmo-faq/"
      },
      {
        "name": "EWG: Dirty Dozen guide to food chemicals",
        "url": "https://www.ewg.org/consumer-guides/ewgs-dirty-dozen-guide-food-chemicals-top-12-avoid"
      },
      {
        "name": "Chris Kresser: How industrial seed oils are making us sick",
        "url": "https://chriskresser.com/how-industrial-seed-oils-are-making-us-sick/"
      }
    ],
    "buying_tips": [
      "Masa is corn cooked and soaked in limewater; some packaged corn tortillas add wheat.",
      "Choose certified organic corn tortillas first, with Non-GMO Project Verified a close second.",
      "Most U.S. corn is bioengineered. Corn becomes grain, syrup, oil and starch.",
      "For a flour tortilla, check the flour and the named fat rather than infer them from the color.",
      "For flour tortillas, skip soybean, canola or other seed oil on the list and look for butter or olive oil."
    ],
    "watch_out": [
      "Some packaged corn tortillas contain wheat. Corn on the front is not a complete ingredient statement.",
      "A QR code or phone number on the tortilla package may lead to the bioengineered disclosure.",
      "Propylparaben is a preservative used in some tortillas and pastries; take a tortilla list with no paraben."
    ]
  },
  "sandwich_bread": {
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/136.180",
      "https://www.law.cornell.edu/cfr/text/21/137.200",
      "https://wholegrainscouncil.org/whole-grains-101/whats-whole-grain-refined-grain/existing-standards-whole-grains",
      "https://wholegrainscouncil.org/whole-grain-stamp",
      {
        "name": "Cornucopia Institute: Glyphosate Used to Kill and Prepare Crops for Harvest",
        "url": "https://www.cornucopia.org/2017/10/glyphosate-used-kill-prepare-crops-harvest"
      },
      {
        "name": "FoodPrint: Glyphosate Residue in Food",
        "url": "https://foodprint.org/blog/glyphosate-residue-in-food/"
      },
      {
        "name": "Chris Kresser: How industrial seed oils are making us sick",
        "url": "https://chriskresser.com/how-industrial-seed-oils-are-making-us-sick/"
      }
    ],
    "buying_tips": [
      "A loaf called just “wheat” may be refined; whole wheat keeps the bran and germ.",
      "Look for a short list: whole wheat flour, water, yeast and salt.",
      "Check for whole wheat flour in the ingredients.",
      "Without a stamp, use the flour names to check the loaf.",
      "Check which stamp is shown: 100%, 50%+, or Basic have different grain requirements.",
      "Choose certified organic whole wheat bread over conventional. Conventional wheat may be sprayed with glyphosate shortly before harvest to dry the crop. Organic farming does not allow glyphosate. Drift can still leave residues on organic wheat.",
      "Skip a loaf listing soybean, canola or other seed oil; look for olive oil or butter, or no added fat."
    ]
  },
  "pasta_sauce": {
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/101.4",
      "https://www.law.cornell.edu/cfr/text/21/155.190",
      "https://www.law.cornell.edu/cfr/text/21/114.3",
      "https://extension.psu.edu/canning-tomatoes-dos-and-donts",
      "https://ouritaliantable.com/sugo-di-pomodoro/",
      {
        "name": "CSPI: Caramel coloring",
        "url": "https://www.cspi.org/node/7417"
      },
      {
        "name": "UCSF SugarScience: Hidden in plain sight",
        "url": "https://sugarscience.ucsf.edu/hidden-in-plain-sight/"
      }
    ],
    "watch_out": [
      "An ingredient listed ahead of the tomatoes outweighs them in the jar.",
      "Caramel color on a sauce list is added coloring. The kind made with ammonia carries a contaminant, so take a list without it.",
      "Corn syrup, high fructose corn syrup or dextrose on a sauce list is added sugar under another name."
    ]
  },
  "breakfast_cereal": {
    "detail": "FDA’s added-sugars guidance distinguishes sugars added during processing from naturally occurring sugars. Honey and syrups count as added sugars. The Whole Grains Council’s stamp rules describe grain content; they do not set an added-sugar ceiling. Chlormequat is a plant growth regulator. In commissioned lab tests it turned up in 12 of 13 conventional oat cereals, granolas and other oat foods, and not in the one organic granola tested. For oat cereal, certified organic is the way to skip it.",
    "sources": [
      "https://wholegrainscouncil.org/whole-grain-stamp",
      "https://www.fda.gov/food/nutrition-facts-label/added-sugars-nutrition-facts-label",
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
        "name": "CSPI: Artificial colorings (synthetic food dyes)",
        "url": "https://www.cspi.org/node/7436"
      },
      {
        "name": "CSPI: TBHQ preservative uses",
        "url": "https://www.cspi.org/node/7416"
      },
      {
        "name": "EWG: BHT in food and on ingredient lists",
        "url": "https://www.ewg.org/foodscores/8806-article-dirty-dozen-food-chemicals-bht/"
      },
      {
        "name": "EWG: Chlormequat found in popular oat-based foods",
        "url": "https://www.EWG.org/research/ewg-investigation-dangerous-agricultural-chemical-chlormequat-found-popular-oat-based"
      }
    ]
  },
  "buns_rolls": {
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/136.110",
      "https://www.law.cornell.edu/cfr/text/21/136.180",
      "https://www.law.cornell.edu/cfr/text/21/136.115",
      "https://smartlabel.syndigo.com/id/bdce1b9a-cc48-4c26-8003-92bf9073231d",
      {
        "name": "CSPI: Potassium bromate petition",
        "url": "https://www.cspinet.org/new/bromate.html"
      },
      {
        "name": "EWG: Dirty Dozen guide to food chemicals",
        "url": "https://www.ewg.org/consumer-guides/ewgs-dirty-dozen-guide-food-chemicals-top-12-avoid"
      }
    ],
    "watch_out": [
      "Enriched buns use enriched flour in place of whole wheat flour.",
      "Federal surveys found rolls and buns especially likely to carry potassium bromate; skip a list naming it or bromated flour.",
      "Azodicarbonamide on a bun list is a flour bleaching agent and dough strengthener; take a list without it."
    ]
  },
  "bagels": {
    "sources": [
      "https://www.tastingtable.com/1606040/why-boil-bagels-before-baking/",
      "https://www.tastingtable.com/1412083/baking-soda-bath-golden-homemade-bagels/",
      {
        "name": "CSPI: Potassium bromate petition",
        "url": "https://www.cspinet.org/new/bromate.html"
      }
    ],
    "watch_out": [
      "Boiling and browning are processing and texture facts. The archived articles establish no health advantage.",
      "Potassium bromate or bromated flour on a bagel list is a flour improver banned in many countries. Look for unbromated flour."
    ]
  },
  "pastries_muffins": {
    "sources": [
      "https://en.wikipedia.org/wiki/Danish_pastry",
      "https://en.wikipedia.org/wiki/Muffin",
      {
        "name": "EWG: Dirty Dozen guide to food chemicals",
        "url": "https://www.ewg.org/consumer-guides/ewgs-dirty-dozen-guide-food-chemicals-top-12-avoid"
      }
    ],
    "watch_out": [
      "Factory-made Danish pastry often uses other fats in place of butter, such as hydrogenated sunflower oil.",
      "Propylparaben is a preservative used in pastries; skip a pastry or muffin list that names it."
    ]
  },
  "hot_soy_sauce": {
    "sources": [
      "https://pureadmin.qub.ac.uk/ws/portalfiles/portal/609323809/The_crucial_importance_of_soy_sauce_authenticity.pdf",
      "https://www.law.cornell.edu/cfr/text/21/101.91",
      "https://extension.oregonstate.edu/ask-extension/featured/how-do-i-start-selling-homemade-hot-sauce-oregon",
      "https://www.ams.usda.gov/sites/default/files/media/Notice_of_validation_for_CID_Soy_Sauce_10292020.pdf",
      "https://tastecooking.com/a-tale-of-two-tamaris/",
      "https://repository.lsu.edu/gradschool_disstheses/4217",
      {
        "name": "CSPI: Caramel coloring",
        "url": "https://www.cspi.org/node/7417"
      }
    ],
    "watch_out": [
      "Little or no wheat is not the same as a gluten-free claim.",
      "Shoyu is made from roughly equal parts wheat and soybeans.",
      "Caramel color on a soy sauce list is added coloring. The kind made with ammonia carries a contaminant, so take a list without it."
    ]
  },
  "ketchup_mustard": {
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/155.194",
      "https://www.ams.usda.gov/sites/default/files/media/CID%20Mustard%2C%20Prepared.pdf",
      "https://blogs.extension.iastate.edu/wellness/2019/05/21/refrigerated-condiment-safety-tips/",
      "https://culinarylore.com/food-history:origin-of-ketchup/",
      {
        "name": "CSPI: Sodium benzoate",
        "url": "https://www.cspi.org/node/7451"
      },
      {
        "name": "UCSF SugarScience: Hidden in plain sight",
        "url": "https://sugarscience.ucsf.edu/hidden-in-plain-sight/"
      }
    ],
    "watch_out": [
      "A ketchup that falls below the federal quality standard must say so on its label.",
      "Opened condiments on the fridge door are easy to forget.",
      "Sodium benzoate or benzoic acid on a condiment list is a preservative for acidic foods; take a list without it.",
      "Corn syrup, high fructose corn syrup or dextrose on a ketchup list is added sugar under another name."
    ]
  },
  "kombucha": {
    "sources": [
      "https://en.wikipedia.org/wiki/Kombucha",
      "https://www.ttb.gov/kombucha/general-requirements",
      "https://www.law.cornell.edu/uscode/text/26/5052",
      {
        "name": "CSPI: Artificial and natural flavoring",
        "url": "https://www.cspi.org/node/7457"
      }
    ],
    "watch_out": [
      "Hard kombucha is an alcoholic drink, sold at over 5 percent alcohol.",
      "Pregnant, nursing or on medication? Ask a doctor about the alcohol in kombucha.",
      "“Natural flavors” on a kombucha list can be a mix of many compounds the label does not name. Look for flavor from a named food, such as ginger."
    ]
  },
  "canned_soup": {
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/101.61",
      "https://extension.psu.edu/making-use-of-canned-foods",
      "https://hgic.clemson.edu/factsheet/safe-handling-of-canned-goods/",
      {
        "name": "EWG: BPA in Canned Food",
        "url": "https://www.ewg.org/research/bpa-canned-food"
      },
      {
        "name": "CSPI: Monosodium glutamate",
        "url": "https://www.cspi.org/node/7459"
      },
      {
        "name": "CSPI: Chemical Cuisine ratings",
        "url": "https://www.cspi.org/page/chemical-cuisine-food-additive-safety-ratings"
      }
    ],
    "buying_tips": [
      "Low sodium is a fixed ceiling; reduced sodium only means less than a named soup.",
      "Look for a short list with no added flavors, starches or sugar.",
      "Pick a can that says BPA-free; many food cans are lined with an epoxy made with BPA. Fresh or frozen soup has no can lining.",
      "Leave cans with deep dents, seam dents, leaks, rust or bulging lids on the shelf.",
      "MSG, yeast extract or hydrolyzed protein on a soup list adds flavor in place of more real ingredients. Look for soup seasoned with named herbs and spices."
    ]
  },
  "snack_bars": {
    "detail": "Under 21 CFR 101.4, ingredients are listed in descending order of predominance. FDA guidance counts rolled oats as whole grain, since simple flattening or steaming keeps every part of the whole oat. An extension guide favors bars with whole grains such as oats, sweetened with fruit, honey or syrups, with nuts and seeds. The same guide advises avoiding bars with hydrogenated oils. Granola is rolled oats, nuts, seeds and honey or another sweetener, usually baked. A granola bar mixes granola with honey or syrup, pressed and baked into a bar. For added fat in bars, Kristy’s standard is olive oil, coconut oil or butter. Skip seed oils and avocado oil. Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed. Choose certified organic oat bars over conventional. Conventional oats may be sprayed with glyphosate shortly before harvest to dry the crop. Organic farming does not allow glyphosate. Drift can still leave residues on organic oats. Many bars carry sugar and high fructose corn syrup, and the list shows which.",
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/101.4",
      "https://blogs.extension.iastate.edu/answerline/2024/02/01/making-granola-bars-a-healthy-treat/",
      "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/draft-guidance-industry-and-fda-staff-whole-grain-label-statements",
      "https://www.fda.gov/food/nutrition-facts-label/added-sugars-nutrition-facts-label",
      "https://en.wikipedia.org/wiki/Granola",
      {
        "name": "Dr. Cate Shanahan: The Hateful Eight seed oils",
        "url": "https://drcate.com/hateful-eight/"
      },
      {
        "name": "Weston A. Price Foundation: FAQ, fats and oils",
        "url": "https://www.westonaprice.org/health-topics/faq-fats-and-oils/"
      },
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
        "name": "CSPI: Artificial colorings (synthetic food dyes)",
        "url": "https://www.cspi.org/node/7436"
      },
      {
        "name": "Consumer Reports: Best and worst energy bars",
        "url": "https://www.consumerreports.org/health/healthy-snacks/best-and-worst-energy-bars-a1145410603/"
      },
      {
        "name": "CSPI: Chemical Cuisine ratings",
        "url": "https://www.cspi.org/page/chemical-cuisine-food-additive-safety-ratings"
      }
    ],
    "buying_tips": [
      "Ingredients run by amount, so the first one leads; rolled oats count as whole grain.",
      "Look for organic oats first and fruit or honey as the only sweetener.",
      "Find the oil in the ingredient list; take bars made with olive oil, coconut oil or butter.",
      "Read the first ingredients; oats or another whole grain should lead.",
      "Look for fruit, honey or syrups as the sweetener, with nuts and seeds.",
      "Read the ingredient list for synthetic dyes: Red 40, Yellow 5, Yellow 6 or Blue 1. Take the list with no added color over one naming a dye. “Lake” means a dye that does not dissolve in water; it still counts.",
      "A bar with zero added sugar may use sucralose, aspartame or acesulfame potassium instead; take one sweetened with dried fruit.",
      "“No added sugar” on a bar can still mean maltitol, erythritol or another sugar alcohol on the list. Look for fruit or honey as the sweetener."
    ]
  }
};
const IDS = Object.keys(SET);
const CLOSED = ['sugars', 'flour_basics', 'crackers', 'hummus', 'tortilla_chips'];
const BATCH = [...IDS, ...CLOSED];
const OWNED = ['buying_tips', 'watch_out', 'detail', 'science', 'sources'];
const urls = (e) => (e.sources || []).map((s) => (typeof s === 'string' ? s : s.url)).filter(Boolean);
const strings = (e) => Object.entries(e).filter(([k]) => k !== 'sources' && k !== 'id').flatMap(([, v]) => [v].flat()).filter((v) => typeof v === 'string');
const sentences = (s) => s.split(/(?<=[.!?:;])\s+/).filter(Boolean);
const fresh = (id) => {
  const old = strings(was(id)).join('\n');
  return strings(live(id)).flatMap(sentences).filter((s) => !old.includes(s));
};
const allFresh = () => IDS.flatMap(fresh);

test('C1 every B12 field equals the set value, only owned fields, nothing else on the 12 entries moved', () => {
  nonEmpty(IDS, 'B12 ids', 12);
  for (const id of IDS) {
    assert.ok(live(id) && was(id), `${id} missing`);
    nonEmpty(Object.keys(SET[id]), `${id} fields`, 1);
    for (const k of Object.keys(SET[id])) assert.ok(OWNED.includes(k), `${id}.${k} not owned`);
    assert.deepEqual(live(id), { ...structuredClone(was(id)), ...structuredClone(SET[id]) }, id);
  }
});

test('C1b decision and cart_pick byte-equal to 52cfde3 on all 17 batch ids; the 5 closed ids are untouched', () => {
  nonEmpty(BATCH, 'batch', 17);
  for (const id of BATCH) {
    assert.equal(live(id).decision, was(id).decision, `${id} decision`);
    assert.equal(live(id).cart_pick, was(id).cart_pick, `${id} cart_pick`);
  }
  for (const id of CLOSED) assert.deepEqual(live(id), was(id), id);
});

test('C2 every entry outside B12 deepEquals 52cfde3; count and top-level keys unchanged', () => {
  const others = kb.entries.map(prePickAvoid).map(preCleanPick8).filter((e) => !IDS.includes(e.id) && !LATER.has(e.id));
  nonEmpty(others, 'others', 199);
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of others) assert.deepEqual(e, was(e.id), e.id);
  assert.deepEqual(Object.keys(kb).sort(), Object.keys(base).sort());
  for (const k of Object.keys(base)) if (k !== 'entries') assert.deepEqual(kb[k], base[k], k);
});

test('C3 the projected cards lint clean', () => {
  for (const id of IDS) assert.deepEqual(lintCard(projectEntry(live(id), { doLine: doLines[id] || '' })), [], `${id} lintCard`);
});

test('C4 no new sentence carries a banned word, first person or an em-dash', () => {
  const all = allFresh();
  nonEmpty(all, 'fresh sentences', 20);
  for (const s of all) {
    assert.doesNotMatch(s, /\b(health|healthy|healthier|safer|safe|risk|cancer|disease|toxic|toxin|detox|treat|treats|cure|cures|prevent|prevents|lowers?|price|cost|cheap|expensive)\b/i, s);
    assert.doesNotMatch(s, /\b(poison\w*|chemicals?|spray-free)\b/i, s);
    assert.doesNotMatch(s, /—|\b(I|me|my)\b/, s);
  }
});

// snack_bars moved its added-sugar, seed-oil and glyphosate tips into detail under the cap of three.
const MOVED = {
  snack_bars: [
    'Many bars carry sugar and high fructose corn syrup, and the list shows which.',
    'Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.',
    'Choose certified organic oat bars over conventional. Conventional oats may be sprayed with glyphosate shortly before harvest to dry the crop. Organic farming does not allow glyphosate. Drift can still leave residues on organic oats.',
  ],
};

test('C8 every base tip survives in tips or detail, every base watch_out in watch_out; moved tips sit verbatim in detail', () => {
  let n = 0;
  for (const id of IDS) {
    const now = [...(live(id).buying_tips || []), live(id).detail || ''].join('\n');
    for (const t of was(id).buying_tips || []) { n++; assert.ok(now.includes(t), `${id} lost "${t}"`); }
    for (const w of was(id).watch_out || []) assert.ok((live(id).watch_out || []).includes(w), `${id} lost watch_out "${w}"`);
    for (const t of MOVED[id] || []) {
      assert.ok(live(id).detail.includes(t), `${id} detail lacks "${t}"`);
      assert.ok(!live(id).buying_tips.includes(t), `${id} still tips "${t}"`);
    }
  }
  assert.ok(n >= 50, `base tips checked ${n}`);
  for (const id of BATCH) for (const s of [...(live(id).buying_tips || []), ...(live(id).watch_out || [])]) assert.doesNotMatch(s, /organic (is )?the standard/i, `${id}: ${s}`);
});

test('C14 no new sentence names a brand', () => {
  const ALLOW = new Set(['USDA', 'Organic', 'Certified', 'Naturally', 'Grown', 'PFAS', 'Real', 'Project', 'Regenerative', 'Glyphosate', 'Residue', 'Free', 'American', 'Grassfed', 'Association']);
  for (const s of allFresh()) {
    const words = s.split(/\s+/).slice(1).map((w) => w.replace(/^[“"‘(]+|[^\w%]+$/g, ''));
    for (const w of words) if (/^[A-Z]/.test(w)) assert.ok(ALLOW.has(w), `"${w}" in: ${s}`);
  }
});

test('C15 every source URL new in B12 sits verbatim on a url: line under docs/sources/; no source dropped', () => {
  const files = [];
  const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : files.push(p); } };
  walk(join(ROOT, 'docs/sources'));
  const lines = new Set(files.flatMap((f) => readFileSync(f, 'utf8').split('\n')).filter((l) => l.startsWith('url: ')).map((l) => l.slice(5).trim()));
  const added = IDS.flatMap((id) => urls(live(id)).filter((u) => !urls(was(id)).includes(u)));
  nonEmpty(added, 'new B12 urls', 18);
  for (const u of added) assert.ok(lines.has(u), u);
  for (const id of IDS) for (const u of urls(was(id))) assert.ok(urls(live(id)).includes(u), `${id} dropped ${u}`);
});

test('C17 no "ask" lands in decision or cart; new asks sit with a counter', () => {
  for (const s of allFresh()) if (/\bask\b/i.test(s)) assert.match(s, /(counter|butcher|baker|bakery|deli|market|grower)/i, s);
  for (const id of BATCH) for (const t of [live(id).decision, live(id).cart_pick || '']) assert.doesNotMatch(t, /\bask\b/i, `${id}: ${t}`);
});

const T = {
  synthetic_dyes: [/Red 40|Yellow 5|Yellow 6|Blue 1|synthetic dyes?|artificial colou?r/i],
  bha_bht: [/\bBHA\b|\bBHT\b/],
  tbhq_propyl_gallate: [/TBHQ|propyl gallate/],
  potassium_bromate: [/potassium bromate/i, /bromated flour/i],
  azodicarbonamide: [/azodicarbonamide/i],
  propylparaben: [/propylparaben/i],
  caramel_color: [/caramel color/i],
  sodium_benzoate: [/sodium benzoate/i, /benzoic acid/i],
  natural_flavors: [/natural flavors?/i],
  hidden_glutamates: [/\bMSG\b/, /yeast extract/i, /hydrolyzed protein/i],
  hidden_sugars: [/dextrose/i, /corn syrup/i],
  artificial_sweeteners: [/sucralose/i, /aspartame/i, /acesulfame potassium/i],
  sugar_alcohols: [/maltitol/i, /erythritol/i, /sugar alcohol/i],
  seed_oils: [/\b(canola|cottonseed|soybean oil|sunflower|safflower|grapeseed|vegetable oil|seed oils?)\b/i],
  glyphosate_desiccation: [/glyphosate/i],
  chlormequat: [/chlormequat/i],
  bioengineered: [/bioengineer/i],
};
// Rows B12 wrote, per id; every listed pattern must appear in watch_out + buying_tips[2..] (or detail for the 4th).
const AVOID = {
  tortillas: ['propylparaben', 'seed_oils'],
  sandwich_bread: ['seed_oils'],
  pasta_sauce: ['caramel_color', 'hidden_sugars'],
  buns_rolls: ['potassium_bromate', 'azodicarbonamide'],
  bagels: ['potassium_bromate'],
  pastries_muffins: ['propylparaben'],
  hot_soy_sauce: ['caramel_color'],
  ketchup_mustard: ['sodium_benzoate', 'hidden_sugars'],
  kombucha: ['natural_flavors'],
  canned_soup: ['hidden_glutamates'],
  snack_bars: ['artificial_sweeteners', 'sugar_alcohols'],
};
const DETAIL_4TH = { breakfast_cereal: ['chlormequat'], snack_bars: ['hidden_sugars', 'glyphosate_desiccation', 'seed_oils'] };
const listLines = (e) => [...(e.watch_out || []), ...(e.buying_tips || []).slice(2)].join('\n');

test('C18 each card names its register label terms, at most 3 register items in tips/watch_out, the 4th in detail, register evidence on file', () => {
  const reg = readFileSync(join(ROOT, 'docs/CONCERN-REGISTER.md'), 'utf8').split('\n');
  for (const id of IDS) {
    const e = live(id);
    const named = Object.keys(T).filter((rid) => T[rid].some((t) => t.test(listLines(e))));
    // breakfast_cereal already named 4 at 52cfde3 (dyes, BHA/BHT, TBHQ, glyphosate); B12 adds none there and cuts no base line (C8).
    const before = Object.keys(T).filter((rid) => T[rid].some((t) => t.test(listLines(was(id)))));
    assert.ok(named.length <= 3 || (named.length === before.length && id === 'breakfast_cereal'), `${id} ${named.length} avoid items: ${named}`);
  }
  for (const [id, rows] of Object.entries(AVOID)) {
    const e = live(id);
    for (const rid of rows) {
      for (const t of T[rid]) assert.match(listLines(e), t, `${id} ${rid} ${t}`);
      for (const top of [e.decision, e.cart_pick || '']) for (const t of T[rid]) assert.doesNotMatch(top, t, `${id} avoid term in headline`);
    }
  }
  for (const [id, rows] of Object.entries(DETAIL_4TH)) {
    for (const rid of rows) {
      assert.ok(T[rid].some((t) => t.test(live(id).detail)), `${id} detail lacks ${rid}`);
      assert.ok(!T[rid].some((t) => t.test(listLines(live(id)))), `${id} ${rid} in tips/watch_out`);
    }
  }
  const rows = [...new Set([...Object.values(AVOID), ...Object.values(DETAIL_4TH)].flat())];
  nonEmpty(rows, 'B12 register rows', 13);
  for (const rid of rows) {
    const row = reg.find((l) => l.startsWith(`| \`${rid}\``));
    assert.ok(row, `register ${rid}`);
    const files = [...row.matchAll(/`([\w-]+\/[\w.-]+\.md)`/g)].map((m) => m[1]);
    nonEmpty(files, `${rid} evidence`, 1);
    for (const f of files) assert.ok(existsSync(join(ROOT, 'docs/sources/concerns', f)), `${rid} ${f}`);
  }
  const has = (id, rid) => T[rid].some((t) => t.test(strings(live(id)).join('\n')));
  const ALREADY = {
    sugars: ['bioengineered'], flour_basics: ['glyphosate_desiccation'], crackers: ['bha_bht', 'tbhq_propyl_gallate', 'seed_oils'],
    hummus: ['glyphosate_desiccation', 'seed_oils'], tortilla_chips: ['bioengineered', 'seed_oils'],
    tortillas: ['bioengineered'], sandwich_bread: ['glyphosate_desiccation'], breakfast_cereal: ['synthetic_dyes', 'bha_bht', 'glyphosate_desiccation'], snack_bars: ['synthetic_dyes'],
  };
  for (const [id, rids] of Object.entries(ALREADY)) for (const rid of rids) assert.ok(has(id, rid), `${id} already-closed ${rid}`);
});

test('C18b no glyphosate or residue-free headline on bread, flour, hummus, cereal or bars', () => {
  for (const id of ['sandwich_bread', 'flour_basics', 'hummus', 'breakfast_cereal', 'snack_bars', 'buns_rolls', 'bagels', 'tortillas']) {
    for (const t of [live(id).decision, live(id).cart_pick || '']) assert.doesNotMatch(t, /glyphosate|residue[ -]free|tested/i, `${id}: ${t}`);
  }
});

test('C19 no reassurance line on the batch', () => {
  for (const id of IDS) for (const s of strings(live(id))) assert.doesNotMatch(s, /(within (legal |safe )?limits|well below|tolerance|safe levels?)/i, `${id}: ${s}`);
});

test('C20 a new seed-oil mention says skip; recommended fats are only butter, ghee, tallow, olive oil or coconut oil', () => {
  const SEED = /\b(canola|cottonseed|soybean|sunflower|safflower|grapeseed|corn oil|vegetable oil|seed oils?)\b/i;
  const seen = allFresh().filter((s) => SEED.test(s));
  nonEmpty(seen, 'new seed-oil sentences', 2);
  for (const s of seen) assert.match(s, /\b(skip|avoid|instead of|never|not|no)\b/i, s);
  for (const s of allFresh()) {
    assert.doesNotMatch(s, /avocado oil/i, s);
    const after = s.split(/look for|take (?:a |one |bars )?/i).slice(1).join(' ');
    for (const m of after.matchAll(/(\w+) oil\b/gi)) assert.ok(/^(olive|coconut)$/i.test(m[1]), `"${m[0]}" recommended in: ${s}`);
  }
});
