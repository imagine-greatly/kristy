// clean-pick-11 (Devon 2026-10-20, register avoid gaps): B11 names the register's avoid items on 10 packaged cards, at most 3 per card; rBST, ice cream's 4th, sits in detail. Five ids already closed (sour_cream, cream_cheese, cottage_cheese, coconut_milk_beverage, frozen_waffles) leave the batch unchanged. decision and cart_pick byte-equal to c2785ed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { lintCard } from '../../lib/counterCardLint.js';
import { projectEntry } from '../../lib/counterCards.js';
import { preCleanPick12, preCleanPick8 } from './twoLinePin.js';

const BASE = 'c2785ed';
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const git = (ref) => execFileSync('git', ['show', ref], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const base = JSON.parse(git(`${BASE}:server/kristy_perimeter_kb.json`));
const doLines = JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'));
const find = (k, id) => k.entries.find((e) => e.id === id);
const live = (id) => find(kb, id);
const was = (id) => find(base, id);
// Batches after B11 that edit these entries add their ids here.
const LATER = new Set([]);

// Every field B11 set, verbatim.
const SET = {
  "ice_cream": {
    "detail": "Under 21 CFR 135.110, ice cream holds at least 10 percent milkfat and at least 4.5 pounds to the gallon. The pounds-per-gallon floor limits how much air is whipped in. Ice cream excludes other food fats, except incidental amounts. Frozen custard is ice cream with 1.4 percent egg yolk solids. A frozen dairy dessert may list oils such as coconut, palm or soybean oil. Ice cream starts with dairy from cows that may receive rBST, a synthetic growth hormone. Certified organic production prohibits it. Certified organic ice cream leads this label ladder. Next is a carton stating its milk came from cows that were not treated with rBST. A carton with neither claim ranks last: US rules let rBST use go unlabeled.",
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/135.110",
      "https://www.mentalfloss.com/food/ice-cream/ice-cream-vs-frozen-dairy-dessert-what-is-difference",
      {
        "name": "Cornell LII: 7 CFR § 205.238 Organic livestock hormone rules",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.238"
      },
      {
        "name": "BCPP: rBGH / rBST labeling",
        "url": "https://www.bcpp.org/resource/rbgh-rbst/"
      },
      {
        "name": "Cornucopia Institute: Carrageenan report and buyer’s guide",
        "url": "https://www.cornucopia.org/research/carrageenan/"
      },
      {
        "name": "CSPI: Carrageenan",
        "url": "https://www.cspi.org/node/7465"
      },
      {
        "name": "CSPI: Polysorbate 60, 65 and 80",
        "url": "https://www.cspi.org/node/7467"
      },
      {
        "name": "CSPI Chemical Cuisine: food additive safety ratings",
        "url": "https://www.cspi.org/page/chemical-cuisine-food-additive-safety-ratings"
      },
      {
        "name": "Cleveland Clinic: Erythritol and other sugar alcohols",
        "url": "https://health.clevelandclinic.org/erythritol"
      }
    ],
    "buying_tips": [
      "The name ice cream needs 10 percent milkfat and no oils beyond incidental amounts.",
      "Look for cream, milk and sugar first, with no carrageenan or guar gum.",
      "Read the name on the carton, not the picture.",
      "Look for “frozen dairy dessert” in the small print.",
      "Read the ingredients for oils such as coconut or palm oil.",
      "Carrageenan thickens foods and comes from seaweed. Some certified organic foods use it too, so read the ice cream’s ingredient list and choose one without it."
    ],
    "watch_out": [
      "“Frozen dairy dessert” means the carton missed the ice cream standard.",
      "Skip polysorbate 80 and cellulose gum on the list; both are added emulsifiers.",
      "Sugar-free ice cream commonly carries erythritol, a sugar alcohol; skip erythritol, maltitol and sorbitol on the list."
    ]
  },
  "almond_milk": {
    "detail": "Almond milk holds about 0.4 grams of protein per 100 ml. It is usually fortified with added vitamins and minerals. FDA notes that almond- and oat-based drinks are not part of the dairy group in the Dietary Guidelines. Their overall nutritional content is not similar to milk. FDA notes the name “almond milk” is established by common usage.",
    "sources": [
      "https://en.wikipedia.org/wiki/Almond_milk",
      "https://www.fda.gov/food/food-labeling-nutrition/plant-based-milk-alternatives-pbma",
      {
        "name": "Cornucopia Institute: Carrageenan report and buyer’s guide",
        "url": "https://www.cornucopia.org/research/carrageenan/"
      },
      {
        "name": "CSPI: Carrageenan",
        "url": "https://www.cspi.org/node/7465"
      },
      {
        "name": "Joi: 5 common plant milk additives (gums)",
        "url": "https://addjoi.com/blogs/news/5-common-plant-milk-additives-and-why-you-should-avoid-them"
      }
    ],
    "buying_tips": [
      "Almond drinks vary in added sugars, so the carton panel is the guide.",
      "Look for unsweetened on the carton and no added vitamins or minerals on the list.",
      "Pick unsweetened over sweetened, vanilla or chocolate.",
      "Some certified organic almond drinks still use carrageenan, a seaweed thickener; choose a carton with none listed."
    ],
    "watch_out": [
      "FDA does not place almond drinks in the dairy group.",
      "Fortified almond milk comes second, since each added vitamin or mineral joins the list.",
      "Gellan gum, guar gum or locust bean gum are added thickeners; pick almonds and water without them."
    ],
    "science": "Almond milk is watery, with a nutty flavor and no lactose. It holds about 0.4 grams of protein per 100 ml. It is usually fortified with added vitamins and minerals. FDA does not place almond drinks in the dairy group, and their overall nutrition is not similar to milk."
  },
  "oat_milk": {
    "sources": [
      "https://www.ebi.ac.uk/europepmc/webservices/rest/PMC10877596/fullTextXML",
      {
        "name": "Cornucopia Institute: Carrageenan report and buyer’s guide",
        "url": "https://www.cornucopia.org/research/carrageenan/"
      },
      {
        "name": "CSPI: Carrageenan",
        "url": "https://www.cspi.org/node/7465"
      },
      {
        "name": "Joi: 5 common plant milk additives (gums)",
        "url": "https://addjoi.com/blogs/news/5-common-plant-milk-additives-and-why-you-should-avoid-them"
      }
    ],
    "watch_out": [
      "A fortified oat milk ranks second; its added vitamins and minerals lengthen the list.",
      "Skip gellan gum, guar gum and locust bean gum on an oat carton; they thicken and stop separation."
    ]
  },
  "soy_milk": {
    "why": "Soy milk is soybeans soaked, ground, boiled and filtered. Soybeans and water stays closest to the bean.",
    "detail": "Soy milk is made by soaking and grinding soybeans, boiling the mixture and filtering out particles. Its protein content runs 1–4 percent, depending on the method of production. It may be sweetened, flavored and fortified with micronutrients.",
    "sources": [
      "https://en.wikipedia.org/wiki/Soy_milk",
      "https://www.fda.gov/food/food-labeling-nutrition/plant-based-milk-alternatives-pbma",
      {
        "name": "Cornucopia Institute: Carrageenan report and buyer’s guide",
        "url": "https://www.cornucopia.org/research/carrageenan/"
      },
      {
        "name": "CSPI: Carrageenan",
        "url": "https://www.cspi.org/node/7465"
      },
      {
        "name": "CSPI: New GMO disclosures",
        "url": "https://www.cspi.org/article/what-know-about-new-gmo-disclosures"
      },
      {
        "name": "Non-GMO Project: GMO FAQ",
        "url": "https://www.nongmoproject.org/gmo-faq/"
      },
      {
        "name": "Joi: 5 common plant milk additives (gums)",
        "url": "https://addjoi.com/blogs/news/5-common-plant-milk-additives-and-why-you-should-avoid-them"
      }
    ],
    "watch_out": [
      "FDA counts only fortified soy in the dairy group, yet fortifying adds vitamins and minerals, each another ingredient.",
      "Soy lecithin and soy protein come from the same soybeans. A QR code or phone number may lead to the bioengineered disclosure.",
      "Dairy shoppers can read the Milk card.",
      "Fortified soy milk is the second pick, behind a carton of soybeans and water.",
      "Gums such as gellan gum, guar gum or locust bean gum stop separation; pick soybeans and water without them."
    ],
    "science": "Soy milk is made by soaking and grinding soybeans, boiling the mixture and filtering out particles. Its protein runs 1–4 percent, depending on the method of production. It may be sweetened, flavored and fortified with micronutrients."
  },
  "hot_dogs": {
    "watch_out": [
      "“Uncured” and “no nitrates added” hot dogs may use celery juice or powder, a plant source of nitrite. The ingredients name that curing source.",
      "“Uncured” can still accompany celery-based curing. Read the qualifier.",
      "The standard permits nonmeat ingredients. A beef species claim is not an ingredient list.",
      "Pass on sodium phosphate and other water-holding phosphates. Skip carrageenan, modified food starch and maltodextrin binders added for texture.",
      "Sodium nitrite or sodium nitrate on the list is an added curing salt that preserves the meat."
    ]
  },
  "turkey_bacon": {
    "sources": [
      "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/meat-catfish/bacon-and-food-safety",
      "https://www.law.cornell.edu/cfr/text/9/317.17",
      "https://health.clevelandclinic.org/turkey-bacon-how-healthy-is-it-really",
      "Consumer Reports: Decoding the labels on meat packages https://www.consumerreports.org/food/decoding-the-labels-on-meat-packages/",
      "Reverence Farms: Organic feed and non-GMO feed https://reverencefarms.com/blogs/news/why-is-it-so-important-to-feed-organic-feed-isn-t-non-gmo-almost-as-good",
      "NPR: No nitrates added labels and celery-based curing https://www.npr.org/sections/thesalt/2019/08/29/755115208/duped-in-the-deli-aisle-no-nitrates-added-labels-are-often-misleading",
      {
        "name": "The Conversation: How deli meat is made (phosphates hold water)",
        "url": "https://theconversation.com/how-is-deli-meat-made-the-food-science-behind-the-turkey-ham-and-other-cold-cuts-in-your-lunch-283597"
      },
      {
        "name": "CSPI Chemical Cuisine: food additive safety ratings",
        "url": "https://www.cspi.org/page/chemical-cuisine-food-additive-safety-ratings"
      }
    ],
    "watch_out": [
      "With “uncured” turkey bacon, celery powder or juice can supply nitrite. A “no nitrates added” claim needs its qualifier read too.",
      "Turkey bacon is still a cured product, and its curing ingredients are on the label.",
      "Skip sodium phosphate or sodium tripolyphosphate in the curing list; phosphates help the meat hold onto water."
    ]
  },
  "frozen_nuggets": {
    "sources": [
      "https://www.law.cornell.edu/cfr/text/9/381.156",
      "https://www.law.cornell.edu/cfr/text/9/381.166",
      "https://www.law.cornell.edu/cfr/text/9/319.880",
      "https://web.archive.org/web/2023id_/https://www.fsis.usda.gov/sites/default/files/import/Labeling-Policy-Book.pdf",
      "https://www.law.cornell.edu/cfr/text/9/381.173",
      "https://www.americastestkitchen.com/recipes/15619-tiny-chicken-tenders",
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
        "name": "The Conversation: How deli meat is made (phosphates hold water)",
        "url": "https://theconversation.com/how-is-deli-meat-made-the-food-science-behind-the-turkey-ham-and-other-cold-cuts-in-your-lunch-283597"
      },
      {
        "name": "CSPI Chemical Cuisine: food additive safety ratings",
        "url": "https://www.cspi.org/page/chemical-cuisine-food-additive-safety-ratings"
      }
    ],
    "watch_out": [
      "“Nugget-Shaped” in the name marks chopped meat that may hold binders, extenders or water.",
      "Skip avocado oil too: the label cannot prove the oil is pure.",
      "Pass on nuggets listing sodium phosphate; added phosphates help the chicken soak up and hold water."
    ]
  },
  "frozen_meals": {
    "sources": [
      "https://www.law.cornell.edu/cfr/text/9/319.304",
      "https://www.law.cornell.edu/cfr/text/9/319.306",
      "https://www.law.cornell.edu/cfr/text/9/381.167",
      "https://www.law.cornell.edu/cfr/text/9/381.158",
      "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/freezing-and-food-safety",
      "https://web.archive.org/web/2024id_/https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/freezing-and-food-safety",
      {
        "name": "CSPI: MSG (monosodium glutamate)",
        "url": "https://www.cspi.org/node/7459"
      },
      {
        "name": "CSPI Chemical Cuisine: food additive safety ratings",
        "url": "https://www.cspi.org/page/chemical-cuisine-food-additive-safety-ratings"
      }
    ],
    "watch_out": [
      "Cream sauce is one food that does not freeze well.",
      "Skip monosodium glutamate and autolyzed yeast extract on the list. Pick a meal seasoned with named herbs and spices."
    ]
  },
  "broth": {
    "sources": [
      "https://extension.illinois.edu/blogs/simply-nutritious-quick-and-delicious/2025-05-16-bone-broth-hype-or-healthy",
      "https://brunswick.ces.ncsu.edu/2023/03/stockbrothor-bone-brothwhats-the-difference",
      "https://extension.illinois.edu/blogs/simply-nutritious-quick-and-delicious/2015-04-02-broth-or-stock-whats-difference",
      {
        "name": "CSPI: MSG (monosodium glutamate)",
        "url": "https://www.cspi.org/node/7459"
      },
      {
        "name": "CSPI Chemical Cuisine: food additive safety ratings",
        "url": "https://www.cspi.org/page/chemical-cuisine-food-additive-safety-ratings"
      }
    ],
    "watch_out": [
      "Broth may have salt added, so a plain-looking carton can still run high in sodium.",
      "Skip a broth listing MSG or autolyzed yeast extract, both added flavorings."
    ]
  },
  "salmon_wild_vs_farmed": {
    "buying_tips": [
      "Wild salmon eats krill and small fish; farmed eats plant protein and vegetable oil.",
      "Sockeye and coho are almost always wild, and their color is deep because of diet, not dye.",
      "A 2004 Science study found 14 contaminants, PCBs and dioxins included, all higher in farmed salmon.",
      "Canned wild salmon comes next; for farmed salmon, read the country of origin.",
      "Frozen wild Alaskan is the same fish, frozen at its best. ‘Fresh’ at the counter is often previously-frozen, so ask."
    ]
  }
};
const IDS = Object.keys(SET);
const CLOSED = ['sour_cream', 'cream_cheese', 'cottage_cheese', 'coconut_milk_beverage', 'frozen_waffles'];
const BATCH = [...IDS, ...CLOSED];
const urls = (e) => (e.sources || []).map((s) => (typeof s === 'string' ? s : s.url)).filter(Boolean);
const strings = (e) => Object.entries(e).filter(([k]) => k !== 'sources' && k !== 'id').flatMap(([, v]) => [v].flat()).filter((v) => typeof v === 'string');
const sentences = (s) => s.split(/(?<=[.!?:;])\s+/).filter(Boolean);
// Sentences B11 wrote: in a live string field, absent from every string field of the base entry.
const fresh = (id) => {
  const old = strings(was(id)).join('\n');
  return strings(live(id)).flatMap(sentences).filter((s) => !old.includes(s));
};
const allFresh = () => IDS.flatMap(fresh);

test('C1 every B11 field equals the set value and nothing else on the 10 entries moved', () => {
  nonEmpty(IDS, 'B11 ids', 10);
  for (const id of IDS) {
    assert.ok(live(id) && was(id), `${id} missing`);
    nonEmpty(Object.keys(SET[id]), `${id} fields`, 1);
    assert.ok(!('decision' in SET[id]) && !('cart_pick' in SET[id]), `${id} headline in SET`);
    if (id !== 'soy_milk') assert.ok(!('why' in SET[id]), `${id} why moved`);
    assert.deepEqual(live(id), { ...structuredClone(was(id)), ...structuredClone(SET[id]) }, id);
  }
});

test('C1b decision and cart_pick byte-equal to c2785ed on all 15 batch ids; the 5 closed ids are untouched', () => {
  nonEmpty(BATCH, 'batch', 15);
  for (const id of BATCH) {
    assert.equal(live(id).decision, was(id).decision, `${id} decision`);
    assert.equal(live(id).cart_pick, was(id).cart_pick, `${id} cart_pick`);
  }
  for (const id of CLOSED) assert.deepEqual(live(id), was(id), id);
});

test('C2 every entry outside B11 deepEquals c2785ed; count and top-level keys unchanged', () => {
  const others = kb.entries.map(preCleanPick8).map(preCleanPick12).filter((e) => !IDS.includes(e.id) && !LATER.has(e.id));
  nonEmpty(others, 'others', 201);
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
  nonEmpty(all, 'fresh sentences', 10);
  for (const s of all) {
    assert.doesNotMatch(s, /\b(health|healthy|healthier|safer|safe|risk|cancer|disease|toxic|toxin|detox|treat|treats|cure|cures|prevent|prevents|lowers?|price|cost|cheap|expensive)\b/i, s);
    assert.doesNotMatch(s, /\b(poison\w*|chemicals?)\b/i, s);
    assert.doesNotMatch(s, /—|\b(I|me|my)\b/, s);
  }
});

// Admin rulings: almond drops its compare-fortification and saturated-fat tips; salmon tips[2] drops its tolerance sentence.
const DROPPED = { almond_milk: ['Compare protein, vitamin D, calcium and potassium across cartons.', 'Check saturated fat on the panel.'] };
const REWORD = {
  'A 2004 Science study found 14 contaminants, PCBs and dioxins included, all higher in farmed salmon. Levels were well below FDA tolerance levels for bought fish.': 'A 2004 Science study found 14 contaminants, PCBs and dioxins included, all higher in farmed salmon.',
};

test('C8 every base buying tip survives in tips, watch_out or detail, except the ruled drops', () => {
  let n = 0;
  for (const id of IDS) {
    const now = [...(live(id).buying_tips || []), ...(live(id).watch_out || []), live(id).detail || ''].join('\n');
    for (const t of was(id).buying_tips || []) {
      if ((DROPPED[id] || []).includes(t)) { assert.ok(!now.includes(t), `${id} kept dropped "${t}"`); continue; }
      n++; assert.ok(now.includes(REWORD[t] || t), `${id} lost "${t}"`);
    }
  }
  assert.ok(n >= 40, `base tips checked ${n}`);
  const salmon = live('salmon_wild_vs_farmed').buying_tips;
  assert.deepEqual(salmon.filter((_, i) => i !== 2), was('salmon_wild_vs_farmed').buying_tips.filter((_, i) => i !== 2));
});

test('C10 almond drops its FDA-suggestion and saturated-fat lines; soy also drops its Dietary Guidelines lines', () => {
  for (const id of ['almond_milk', 'soy_milk']) {
    const e = live(id);
    for (const f of ['detail', 'science', 'buying_tips', 'watch_out']) {
      const s = [e[f] || ''].flat().join('\n');
      assert.doesNotMatch(s, id === "soy_milk" ? /FDA suggests|saturated fat|Dietary Guidelines/ : /FDA suggests|saturated fat/, `${id}.${f}`);
    }
  }
  assert.notEqual(live('soy_milk').why, was('soy_milk').why);
  assert.match(live('soy_milk').why, /Soybeans and water/);
});

test('C14 no new sentence names a brand', () => {
  const ALLOW = new Set(['MSG', 'Pick', 'Skip', 'Science', 'PCBs', 'FDA', 'Sodium', 'Gums', 'Soybeans']);
  for (const s of allFresh()) {
    const words = s.split(/\s+/).slice(1).map((w) => w.replace(/^[“"‘(]+|[^\w%]+$/g, ''));
    for (const w of words) if (/^[A-Z]/.test(w)) assert.ok(ALLOW.has(w), `"${w}" in: ${s}`);
  }
});

test('C15 every source URL new in B11 sits verbatim on a url: line under docs/sources/', () => {
  const files = [];
  const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : files.push(p); } };
  walk(join(ROOT, 'docs/sources'));
  const lines = new Set(files.flatMap((f) => readFileSync(f, 'utf8').split('\n')).filter((l) => l.startsWith('url: ')).map((l) => l.slice(5).trim()));
  const added = IDS.flatMap((id) => urls(live(id)).filter((u) => !urls(was(id)).includes(u)));
  nonEmpty(added, 'new B11 urls', 14);
  for (const u of added) assert.ok(lines.has(u), u);
  for (const id of IDS) for (const u of urls(was(id))) assert.ok(urls(live(id)).includes(u), `${id} dropped ${u}`);
});

test('C17 no "ask" lands in decision or cart; new asks sit with a counter', () => {
  for (const s of allFresh()) if (/\bask\b/i.test(s)) assert.match(s, /(counter|butcher|fishmonger|deli|market|grower)/i, s);
  for (const id of BATCH) for (const t of [live(id).decision, live(id).cart_pick || '']) assert.doesNotMatch(t, /\bask\b/i, `${id}: ${t}`);
});

test('C18 each card names its register label terms, at most 3 register items per card, register evidence on file', () => {
  const reg = readFileSync(join(ROOT, 'docs/CONCERN-REGISTER.md'), 'utf8').split('\n');
  // Terms as the register's label-term column prints them.
  const T = {
    carrageenan: [/carrageenan/i],
    gums_stabilizers: [/gellan gum/i, /guar gum/i, /locust bean gum/i],
    synthetic_emulsifiers: [/polysorbate 80/i, /cellulose gum/i],
    sugar_alcohols: [/erythritol/i, /maltitol/i, /sorbitol/i, /sugar alcohol/i],
    phosphate_additives: [/sodium phosphate/i],
    added_nitrite: [/sodium nitrite/i, /sodium nitrate/i],
    hidden_glutamates: [/MSG|monosodium glutamate/, /autolyzed yeast extract/i],
    tbhq: [/TBHQ/],
  };
  const AVOID = {
    ice_cream: ['carrageenan', 'synthetic_emulsifiers', 'sugar_alcohols'],
    almond_milk: ['carrageenan', 'gums_stabilizers'],
    oat_milk: ['carrageenan', 'gums_stabilizers'],
    soy_milk: ['carrageenan', 'gums_stabilizers'],
    hot_dogs: ['phosphate_additives', 'added_nitrite'],
    turkey_bacon: ['phosphate_additives'],
    frozen_nuggets: ['tbhq', 'phosphate_additives'],
    frozen_meals: ['hidden_glutamates'],
    broth: ['hidden_glutamates'],
  };
  for (const [id, rows] of Object.entries(AVOID)) {
    const e = live(id);
    const lines = [...(e.watch_out || []), ...(e.buying_tips || []).slice(2)].join('\n');
    const named = Object.keys(T).filter((rid) => T[rid].some((t) => t.test(lines)));
    assert.ok(named.length <= 3, `${id} ${named.length} avoid items: ${named}`);
    for (const rid of rows) {
      for (const t of T[rid]) assert.match(lines, t, `${id} ${rid} ${t}`);
      const row = reg.find((l) => l.startsWith(`| \`${rid}\``));
      if (rid === 'tbhq') continue; // TBHQ predates B11 on the nugget card.
      assert.ok(row, `register ${rid}`);
      const files = [...row.matchAll(/`([\w-]+\/[\w.-]+\.md)`/g)].map((m) => m[1]);
      nonEmpty(files, `${rid} evidence`, 1);
      for (const f of files) assert.ok(existsSync(join(ROOT, 'docs/sources/concerns', f)), `${rid} ${f}`);
      for (const top of [e.decision, e.cart_pick || '']) for (const t of T[rid]) assert.doesNotMatch(top, t, `${id} avoid term in headline`);
    }
  }
  // Already closed: the five ids leave the batch because their register items are on the card.
  const has = (id, re) => re.test(strings(live(id)).join('\n'));
  for (const id of ['sour_cream', 'cream_cheese', 'cottage_cheese', 'coconut_milk_beverage']) assert.ok(has(id, /carrageenan/i), `${id} carrageenan`);
  for (const id of ['sour_cream', 'cream_cheese', 'cottage_cheese']) assert.ok(has(id, /rBST/), `${id} rBST`);
  assert.ok(has('frozen_waffles', /Red 40|Yellow 5|synthetic dyes?/i), 'frozen_waffles dyes');
  // rBST is ice cream's 4th item: detail only, neutral wording.
  const ice = live('ice_cream');
  assert.match(ice.detail, /rBST/);
  assert.doesNotMatch([...ice.watch_out, ...ice.buying_tips].join('\n'), /rBST/);
  assert.ok(reg.some((l) => l.startsWith('| `rbst`') && l.includes('bcpp-rbgh-rbst.md')), 'rbst register row');
});

test('C19 the tolerance reassurance and saturated-fat lines are gone from the whole KB', () => {
  const all = kb.entries.flatMap(strings).join('\n');
  nonEmpty(kb.entries, 'kb', 200);
  for (const s of ['well below FDA tolerance', 'Check saturated fat on the panel', 'lower saturated fat']) assert.ok(!all.includes(s), s);
  for (const id of IDS) for (const s of strings(live(id))) assert.doesNotMatch(s, /(within (legal |safe )?limits|well below|tolerance|safe levels?)/i, `${id}: ${s}`);
});
