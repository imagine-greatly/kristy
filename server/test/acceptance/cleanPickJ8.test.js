// clean-sweep-J8 (2026-10-22, clean-pick final sweep): bread, grains and drinks, against the live stance flags at e8cf851.
// "Ask" lines name the bakery or baker (M3); seed-oil sentences take a skip word (M2); cost words go (plan C4);
// register terms land (M7): sprouted / sourdough and bleached / enriched flour on bread, interesterified on pastry,
// rice flour / brown rice arsenic on gluten-free bread and grains, hidden sugar names, bioengineered and whole-grain
// label tricks on cereal. One rung row: oats' decision puts Glyphosate Residue Free first, organic the floor (M5);
// its cart_pick never moves. Older pins read these ids as of e8cf851 (cartPlain.js preCleanJ8).
// Left flagged on purpose: tea keeps M7 plastic_teabags (the archived teabag study names neither silken nor
// pyramid bags, so the register term would be an unsourced claim).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { nonEmpty } from "../../lib/testGuards.js";
import { lintCard, lintPick } from "../../lib/counterCardLint.js";
import { projectEntry } from "../../lib/counterCards.js";
import { CLEAN_J8, preCompleteness, notGap, CLEAN_J8_BASE, preCleanJ9, preDialed } from "./cartPlain.js";

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const raw = JSON.parse(readFileSync(new URL("../../kristy_perimeter_kb.json", import.meta.url), "utf8"));
// Later J9 ids read their pre-sweep entries; J8 continues to own its live copy.
const kb = { ...raw, entries: raw.entries.filter(notGap).map(preCompleteness).map(preDialed).map(preCleanJ9) };
const base = JSON.parse(execFileSync("git", ["show", `${CLEAN_J8_BASE}:server/kristy_perimeter_kb.json`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const doLines = JSON.parse(readFileSync(new URL("../../lib/doLines.json", import.meta.url), "utf8"));
const live = (id) => kb.entries.find((e) => e.id === id);
const was = (id) => base.entries.find((e) => e.id === id);
const textOf = (e) => JSON.stringify({ ...e, sources: undefined });
// Batches after J8 that edit these entries add their ids here.
const LATER = new Set([]);
// Leaf strings the batch wrote that base did not already carry.
const leaves = (v) => (typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(leaves) : []);
const fresh = (id) => { const old = new Set(leaves(was(id))); return leaves({ ...BECAME[id], sources: undefined }).filter((s) => !old.has(s)); };
// The one rung row in this batch.
const RUNG = { oats_steelcut_rolled_instant: "Plain oats, Glyphosate Residue Free first, then organic." };

// Every field the batch set, verbatim.
const BECAME = {
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
      },
      "https://www.westonaprice.org/health-topics/vegetarianism-and-plant-foods/living-with-phytic-acid/",
      "https://www.healthline.com/nutrition/bleached-vs-unbleached-flour"
    ],
    "buying_tips": [
      "A loaf called just “wheat” may be refined; whole wheat keeps the bran and germ.",
      "Look for a short list: whole wheat flour, water, yeast and salt.",
      "Check for whole wheat flour in the ingredients.",
      "Without a stamp, use the flour names to check the loaf.",
      "Check which stamp is shown: 100%, 50%+, or Basic have different grain requirements.",
      "Choose certified organic whole wheat bread over conventional. Conventional wheat may be sprayed with glyphosate shortly before harvest to dry the crop. Organic farming does not allow glyphosate. Drift can still leave residues on organic wheat.",
      "Skip a loaf listing soybean, canola or other seed oil; look for olive oil or butter, or no added fat.",
      "Look for “sprouted” or true sourdough whole wheat; both reduce phytic acid.",
      "Skip a list naming “bleached” or “enriched flour”; look for unbleached whole wheat."
    ]
  },
  "bagels": {
    "sources": [
      "https://www.tastingtable.com/1606040/why-boil-bagels-before-baking/",
      "https://www.tastingtable.com/1412083/baking-soda-bath-golden-homemade-bagels/",
      {
        "name": "CSPI: Potassium bromate petition",
        "url": "https://www.cspinet.org/new/bromate.html"
      },
      "https://www.healthline.com/nutrition/bleached-vs-unbleached-flour"
    ],
    "kristy_take": "Ask the bakery what went into the dough and the boiling bath, or read the ingredients on the bag. Boiling explains the texture; the archived baking articles establish no health advantage.",
    "buying_tips": [
      "The boil sets the outside and gives a bagel its chew.",
      "Look for whole wheat flour on the bag, named before any other flour.",
      "Read the ingredient list on the bag, or ask the bakery for it.",
      "Ask the bakery about boiling before buying.",
      "Without a process label, ask the baker rather than infer boiling from the shape.",
      "Ask the bakery about the bath ingredients; baking soda changes alkalinity and browning.",
      "Skip bagels of “bleached” or “enriched flour”; whole wheat flour should lead the list."
    ]
  },
  "gluten_free_bread": {
    "sources": [
      "https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-101/subpart-F/section-101.91",
      "https://www.law.cornell.edu/cfr/text/21/101.91",
      "https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/gluten-free-labeling-foods",
      "https://research.ucc.ie/en/publications/gluten-free-breads/",
      "https://www.consumerreports.org/health/food-contaminants/arsenic-in-rice-reducing-risk-a8972350937/"
    ],
    "buying_tips": [
      "Every gluten-free wording meets one federal limit; a gum gives back some stretch.",
      "Look for a single gum binder, such as xanthan gum, not two or more.",
      "Check for one of the four gluten-free claim wordings.",
      "Read which flours and starches replace the wheat.",
      "Look for the gum that binds the loaf.",
      "Look for flours beyond rice flour; rice picks up more arsenic than other crops."
    ]
  },
  "buns_rolls": {
    "detail": "Federal rule 21 CFR 136.110 sets one standard for bread, rolls and buns. Under 136.180, whole wheat buns, whole wheat rolls and graham buns are made from whole wheat flour, and no plain white flour is used. Under 136.115, enriched buns use enriched flour in place of some or all of the flour. A typical enriched hot dog bun lists enriched flour, water, yeast, sugar and soybean oil, a seed oil to skip."
  },
  "pastries_muffins": {
    "detail": "Danish pastry is laminated, meaning butter is folded into a yeast dough in thin layers. Butter is the traditional fat. Industrial production often uses other fats, not butter, such as hydrogenated sunflower oil. The American muffin is a quick bread, a bread raised by baking soda instead of yeast. Butter or shortening, eggs and flavourings such as fruit go into the batter.",
    "sources": [
      "https://en.wikipedia.org/wiki/Danish_pastry",
      "https://en.wikipedia.org/wiki/Muffin",
      {
        "name": "EWG: Dirty Dozen guide to food chemicals",
        "url": "https://www.ewg.org/consumer-guides/ewgs-dirty-dozen-guide-food-chemicals-top-12-avoid"
      },
      "https://www.cspi.org/chemical-cuisine/inter-esterified-oil",
      "https://www.healthline.com/nutrition/bleached-vs-unbleached-flour"
    ],
    "buying_tips": [
      "Butter is Danish pastry’s traditional fat; factory-made often uses other fats.",
      "Look for butter as the only fat, with no shortening or hydrogenated oil.",
      "Read the ingredients for butter by name.",
      "Ask the baker which fat goes into the pastry.",
      "Read a muffin’s ingredients for butter or shortening.",
      "Skip “interesterified” or “fully hydrogenated” oil on the list; butter is the traditional fat.",
      "Look for unbleached flour; skip a pastry list naming “bleached” flour."
    ],
    "watch_out": [
      "Skip factory-made Danish pastry made with hydrogenated sunflower oil in place of butter.",
      "Propylparaben is a preservative used in pastries; skip a pastry or muffin list that names it."
    ],
    "pick_steps": [
      "Read the ingredients for butter by name, or ask the baker.",
      "On factory-made Danish, skip a list naming hydrogenated sunflower oil.",
      "On a muffin, read whether the fat is butter or shortening."
    ]
  },
  "breakfast_cereal": {
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
      },
      "https://sugarscience.ucsf.edu/hidden-in-plain-sight/",
      "https://www.cspi.org/article/what-know-about-new-gmo-disclosures",
      "https://www.consumerreports.org/food-labeling/decoding-bread-labels/"
    ],
    "buying_tips": [
      "Whole grain and added sugar are separate checks; a stamp covers only the grain.",
      "Look for a grain list with no added vitamins or minerals below it.",
      "Check the 100% stamp rather than assume every stamp means all grain is whole.",
      "Without a stamp, read the grain ingredients and the added-sugars line.",
      "Read the added-sugars line even when honey or syrup is the named sweetener.",
      "For oat cereal or granola, choose certified organic over conventional. Conventional oats may be sprayed with glyphosate shortly before harvest to dry the crop. Organic farming does not allow glyphosate. Drift can still leave residues on organic oats.",
      "Read the ingredient list for synthetic dyes: Red 40, Yellow 5, Yellow 6 or Blue 1. Take the list with no added color over one naming a dye. “Lake” means a dye that does not dissolve in water; it still counts.",
      "Read the cereal list for BHA, BHT or TBHQ, preservatives added to fat-containing foods. Take a list without them.",
      "BHT and TBHQ are used in cereals. BHT can appear on the list as “butylated hydroxytoluene.” Certified organic rules prohibit BHT.",
      "Read for sugar under other names: dextrose, corn syrup, evaporated cane juice.",
      "A “bioengineered” label or disclosure QR code marks GMO ingredients; organic rules exclude them.",
      "“Made with whole grains” or “multigrain” can still be mostly refined grain."
    ]
  },
  "oats_steelcut_rolled_instant": {
    "decision": "Plain oats, Glyphosate Residue Free first, then organic.",
    "detail": "The more an oat is cut, rolled, and pre-cooked, the faster it cooks and the faster it digests, which nudges blood-sugar response up a little. Plain rolled oats are still a clean whole food. The real problem is flavored instant packets, which are mostly added sugar. Steel-cut are the least processed (chewy, slow to cook, gentlest on blood sugar); rolled/old-fashioned are steamed and flattened (quick, versatile); instant are pre-cooked and often come pre-sweetened. The measured number is the glycemic index: 42 for steel-cut, 55 for rolled and 83 for instant, in one extension comparison.",
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
      },
      "https://www.westonaprice.org/health-topics/vegetarianism-and-plant-foods/living-with-phytic-acid/"
    ],
    "buying_tips": [
      "Same grain in every form; the flavored packets are where the sugar is.",
      "Look for USDA Organic oats, with a Glyphosate Residue Free label on top where the bag carries it.",
      "Plain oats in any form; steel-cut if you like chew and have time.",
      "Skip flavored instant packets. Check the sugar on the label.",
      "Plain oats also come by the scoop from a bulk bin.",
      "Choose certified organic oats over conventional. Conventional oats may be sprayed with glyphosate shortly before harvest to dry the crop. Organic farming does not allow glyphosate. Drift can still leave residues on organic oats.",
      "Look for “sprouted” oats; soaking alone barely lowers the phytic acid in oats."
    ]
  },
  "grains_beyond_rice": {
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
      },
      "https://www.consumerreports.org/health/food-contaminants/arsenic-in-rice-reducing-risk-a8972350937/"
    ],
    "buying_tips": [
      "Pearled grains have some or all of the bran polished off; hulled loses only the hull.",
      "Look for USDA Organic on the bag or the bulk bin label.",
      "Buckwheat, millet, sorghum and quinoa carry no gluten. Barley, farro and bulgur do.",
      "Buy from the bulk bins where you can.",
      "Cook a big batch. They keep several days and reheat straight from cold.",
      "Brown rice generally carries more arsenic than white; rotate in farro, quinoa or sorghum."
    ]
  },
  "sourdough": {
    "buying_tips": [
      "Some loaves called sourdough use commercial yeast and added acids for the sour taste.",
      "Look for whole wheat flour as the first ingredient, ahead of any white flour.",
      "Look for flour, water, salt, and a culture or starter.",
      "Ask the baker about the starter when the label does not list it separately.",
      "Read for added vinegar or acetic acid; ask the baker about fermentation rather than infer it from sour flavor."
    ]
  }
};

test("JC0 the batch is the BECAME table, and every id exists at base", () => {
  assert.deepEqual(nonEmpty(Object.keys(BECAME), "J8 ids", 9).toSorted(), [...CLEAN_J8].toSorted());
  for (const id of CLEAN_J8) assert.ok(was(id) && live(id), id);
});

test("JC1 each batch id equals its base entry with only the BECAME fields set", () => {
  for (const [id, fields] of Object.entries(BECAME)) {
    if (LATER.has(id)) continue;
    assert.deepEqual(live(id), { ...was(id), ...fields }, id);
  }
});

test("JC2 every entry outside the batch is byte-equal to base", () => {
  const others = nonEmpty(kb.entries.filter((e) => !CLEAN_J8.has(e.id)), "non-batch entries", 200);
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of others) assert.deepEqual(e, was(e.id), e.id);
});

test("JC3 cart_pick never moves; decision moves only on the rung row, and its first rung is not organic", () => {
  for (const id of CLEAN_J8) {
    if (LATER.has(id)) continue;
    assert.equal(live(id).cart_pick, was(id).cart_pick, `${id} cart_pick`);
    assert.equal(live(id).decision, RUNG[id] ?? was(id).decision, `${id} decision`);
  }
  for (const [id, d] of Object.entries(RUNG)) assert.doesNotMatch(d.split(/, then|; then/)[0], /organic/i, id);
});

test("JC4 every new seed/vegetable oil sentence (beyond a cooked-in description, X10) carries a skip word; T7 lines are absent", () => {
  const OIL = /\b(vegetable|seed|soybean|cottonseed|canola|sunflower|rapeseed|safflower) oils?\b/i;
  const SKIP = /\b(skip|avoid|instead of|never|not|no)\b/i;
  const hits = nonEmpty([...CLEAN_J8].flatMap((id) => fresh(id).flatMap((v) => v.split(/[.!?;]/)).filter((s) => OIL.test(s) && !/\bcooked in\b/.test(s))), "new oil sentences", 3);
  for (const s of hits) assert.match(s, SKIP, s);
  for (const id of CLEAN_J8) assert.doesNotMatch(JSON.stringify(BECAME[id]), /saturated fat|debated|contested|Dietary Guidelines/i, id);
});

test("JC5 register terms land on their home cards; no organic in cart_pick", () => {
  const TERMS = {
    sandwich_bread: ["sprouted", "sourdough", "bleached", "enriched flour"],
    bagels: ["bleached", "enriched flour"],
    gluten_free_bread: ["rice flour"],
    pastries_muffins: ["interesterified", "fully hydrogenated", "bleached"],
    breakfast_cereal: ["dextrose", "corn syrup", "evaporated cane juice", "bioengineered", "qr code", "made with whole grains", "multigrain"],
    oats_steelcut_rolled_instant: ["sprouted", "organic"],
    grains_beyond_rice: ["brown rice"],
  };
  for (const [id, terms] of Object.entries(TERMS)) for (const t of terms) assert.ok(textOf(live(id)).toLowerCase().includes(t), `${id} lacks ${t}`);
  for (const id of CLEAN_J8) assert.doesNotMatch(live(id).cart_pick ?? "", /organic/i, id);
});

test("JC5b no cost words in batch copy (plan C4); shopper-phrased fields are exempt", () => {
  const COST = /\b(cheap\w*|cost\w*|price\w*|pricing|budget|afford\w*|dollars?|value)\b/i;
  for (const id of CLEAN_J8) {
    const { sources, aliases, asked_as, question, ...copy } = live(id);
    assert.doesNotMatch(JSON.stringify(copy), COST, id);
  }
});

// bagels' kristy_take only gained "the bakery" after "Ask"; its no-health-advantage sentence stood at base.
const CARRIED = new Set([BECAME.bagels.kristy_take]);
test("JC5c new lines carry no health, safety or treatment wording", () => {
  assert.ok(was("bagels").kristy_take.includes("no health advantage"));
  for (const id of CLEAN_J8) for (const v of nonEmpty(fresh(id), `${id} new lines`).filter((v) => !CARRIED.has(v)))
    assert.doesNotMatch(v, /\b(health\w*|safe\w*|protein|trans fats?|prevents?|cures?|causes?|lowers? risk|toxic\w*|cancer\w*|I|me|my)\b/i, `${id}: ${v}`);
});

test("JC6 every batch entry is lint-clean", () => {
  for (const id of CLEAN_J8) {
    const e = live(id);
    assert.deepEqual(e.kind === "pick" ? lintPick(e) : lintCard(projectEntry(e, { doLine: doLines[id] || "" })), [], id);
  }
});

test("JC7 every new source URL is archived verbatim under docs/sources", () => {
  const urlOf = (s) => (s.url ?? String(s).match(/https?:\/\/\S+/)?.[0]);
  const urls = nonEmpty(Object.entries(BECAME).flatMap(([id, f]) => (f.sources ?? []).map(urlOf).filter((u) => u && !(was(id).sources ?? []).some((s) => urlOf(s) === u))), "new URLs", 3);
  const archive = execFileSync("grep", ["-rhiE", "^(url: *)?https?://", "docs/sources"], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
  for (const u of urls) assert.ok(archive.includes(u), `${u} not archived`);
});
