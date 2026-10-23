// clean-sweep-J9: live flags at 53c6f90, plus the explicitly pinned rBST label.
// Only potato_chips is a rung row. cart_pick never moves; J1-J8 stay byte-identical.
// snack_bars/protein_isolates is carried: every register term contains lint-banned "protein".
// snacks/health_halo is carried unchanged: the archive does not substantiate its label terms.
// Irradiation, palm fat and MSG overflow stay in detail; prior avoids are retained.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { nonEmpty } from "../../lib/testGuards.js";
import { lintCard, readability, words, mechanicalVeto } from "../../lib/counterCardLint.js";
import { projectEntry } from "../../lib/counterCards.js";
import { load, run } from "../../scripts/stanceSweep.js";
import { CLEAN_J9, preCompleteness, notGap, CLEAN_J9_BASE, preCleanJ9, preDialed, COMPLETENESS_BASE } from "./cartPlain.js";

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const kb = JSON.parse(readFileSync(new URL("../../kristy_perimeter_kb.json", import.meta.url), "utf8"));
kb.entries = kb.entries.filter(notGap).map(preCompleteness).map(preDialed); // dialed-1 restores salt to 9d7898e.
const base = JSON.parse(execFileSync("git", ["show", `${CLEAN_J9_BASE}:server/kristy_perimeter_kb.json`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const doLines = JSON.parse(readFileSync(new URL("../../lib/doLines.json", import.meta.url), "utf8"));
const live = (id) => kb.entries.find((e) => e.id === id);
const was = (id) => base.entries.find((e) => e.id === id);
const leaves = (v) => typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(leaves) : [];
const fresh = (id) => { const old = new Set(leaves(was(id))); return leaves({ ...BECAME[id], sources: undefined }).filter((s) => !old.has(s)); };
const RUNG = { potato_chips: "Sliced potato chips: olive oil first, then organic." };
const J9_SCOPE = new Set("mayo crackers potato_chips popcorn snack_bars snacks label_nonGMO_vs_organic label_organic_scope label_cold_pressed_expeller label_no_added_hormones condiments tortilla_chips label_lightly_sweetened label_third_party_seals label_artificial_color".split(" "));

// Every field the batch sets, verbatim. Unlisted fields remain at the named base.
const BECAME =
{
  "label_no_added_hormones": {
    "detail": "By federal rule, hormones can’t be used in raising pigs or chickens, so any ‘hormone-free’ chicken label must also note that no poultry is raised with hormones. For beef and dairy the claim actually distinguishes producers. Knowing which animal you’re looking at tells you whether the claim is information or filler. It depends on the animal. rBST, also called rBGH, is a hormone given to dairy cows to increase milk production. The U.S. does not require a label declaring its use; “rBST free” is a voluntary claim.",
    "sources": [
      "USDA FSIS hormone-labeling rules",
      "FDA rules on hormone use in livestock",
      "https://www.bcpp.org/resource/rbgh-rbst/"
    ],
    "buying_tips": [
      "Pork and poultry ban hormones by law, so every producer there can print it.",
      "Chicken/pork: hormones are banned anyway. Look for the required explanatory statement.",
      "Beef/dairy: the claim is meaningful; look for verification.",
      "Poultry labels must add ‘no hormones are used in poultry’ by rule.",
      "On dairy, look for “from cows not treated with rBST”; this describes the producer’s claim."
    ]
  },
  "label_nonGMO_vs_organic": {
    "kristy_take": "Organic covers growing practices as well as GMOs. Read the ingredient list alongside the seal.",
    "buying_tips": [
      "Organic also restricts pesticides and fertilizers; non-GMO covers one issue.",
      "Choose certified organic first, with Non-GMO Project Verified a close second. Next is an unlabeled package; read any bioengineered disclosure.",
      "Ignore ‘non-GMO’ on foods that have no GMO version anyway.",
      "Look near the ingredients for “bioengineered” or “Contains Bioengineered Food Ingredients”, rather than “GMO”. A phone number or QR code may lead to the disclosure, which does not name the ingredient."
    ]
  },
  "label_organic_scope": {
    "why": "It covers inputs and practices, not nutrition or processing. Approved sprays are still allowed.",
    "short_answer": "Organic is a production standard. It excludes prohibited pesticides and GMOs. Animals get organic feed, with no routine antibiotics or added hormones. Approved sprays are allowed. An organic cookie is a cookie.",
    "detail": "The National Organic Program defines organic as a set of permitted and prohibited INPUTS and practices, verified by certification. That is a real, enforced standard and worth something. What it is not is a nutrition claim: the seal is silent on whether the food is nutrient-dense or minimally processed, and ultra-processed foods can carry it in full compliance. Reading it as a shorthand for “good food” is the most common way it gets misused. Organic tells you how something was grown or raised, and you still have to look at what the thing actually is. Certified organic means no pesticides from the prohibited list. A short list of approved sprays is permitted, and it makes no claim at all about nutrient density, how well an animal was raised beyond the baseline, or how processed the food is. Organic is a floor, not the finish line: a grower who uses no sprays sits above it, and hydroponic crops can carry the seal too. Organic rules prohibit ionizing radiation. On non-organic foods, the Radura symbol and “treated with irradiation” identify this process.",
    "sources": [
      "USDA National Organic Program, 7 CFR Part 205 (permitted and prohibited substances)",
      "USDA AMS organic labeling and certification requirements",
      {
        "name": "7 CFR 205.206, organic crop pest and weed management standard",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.206"
      },
      {
        "name": "7 CFR 205.601, Synthetic substances allowed for use in organic crop production",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.601"
      },
      {
        "name": "Real Organic Project: Standards",
        "url": "https://realorganicproject.org/standards/"
      },
      {
        "name": "National Agricultural Law Center: Ninth Circuit memorandum on hydroponic organic certification (2022)",
        "url": "https://nationalaglawcenter.org/wp-content/uploads/2022/09/Ninth-Cir.-memo.pdf"
      },
      "https://www.law.cornell.edu/cfr/text/7/205.105",
      "https://centerforfoodsafety.org/press-release/citizens-consumer-groups-oppose-proposed-irradiation-labeling-change/"
    ],
    "buying_tips": [
      "The seal covers inputs and practices, and an organic cookie is still a cookie.",
      "Organic is about inputs and practices. Read the ingredient panel separately.",
      "A short list of approved sprays is permitted under the organic standard.",
      "It carries the most weight on thin-skinned produce you eat whole, and the least on processed food.",
      "On animal products it does reach feed. It means organic feed, not a different kind of feed.",
      "Real Organic Project on top of the USDA seal means soil-grown, never hydroponic."
    ],
    "watch_out": [
      "Organic rules permit a short list of approved sprays.",
      "It is a production standard, not a quality grade. An organic cookie is still a cookie.",
      "“Made with organic ___” needs only 70%, and cannot carry the USDA seal.",
      "Hydroponic crops can carry the USDA Organic seal, grown in water rather than soil."
    ],
    "science": "Certified organic is a production standard, not a quality grade. It means no pesticides from the prohibited list, no GMOs, and organic feed for animals. A short list of approved sprays is permitted. It makes no claim about nutrient density or how processed the food is. An organic cookie is still a cookie."
  },
  "label_cold_pressed_expeller": {
    "buying_tips": [
      "Most supermarket oil is solvent-extracted, then refined, bleached and deodorized.",
      "Read the oil name and ingredients first: choose olive or coconut oil. Skip seed oil even when cold-pressed.",
      "‘Expeller-pressed’ means mechanical, no solvent. Friction heat still happens.",
      "‘Cold-pressed’ means pressed with the temperature held down. Tightly defined only for olive oil.",
      "‘Refined’, ‘pure’, or no process word at all usually means solvent-extracted and refined.",
      "Unrefined oils taste like their source. Refined ones taste like nothing, which is the point of refining them.",
      "Dark bottle, cool shelf, and a size you will finish. Pressed oils are the least stable.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Skip avocado oil regardless of the pressing words; its label cannot prove purity.",
      "Skip canola, sunflower and vegetable oil; “expeller-pressed” describes pressing, not the plant."
    ],
    "watch_out": [
      "Skip pressed seed oil too. These words rank how the oil was made and say nothing about what it was made from.",
      "No process word at all usually means solvent-extracted and refined.",
      "“Cold-pressed” is tightly defined only for olive oil."
    ]
  },
  "mayo": {
    "detail": "Under 21 CFR 169.140, the name of the food is “Mayonnaise.” It is an emulsified semisolid food made from oil, an acid and egg yolk. The acid is vinegar, or lemon or lime juice. The lecithin in the yolk is what lets the oil and the liquid mix into a creamy texture. Optional ingredients include salt, sweeteners and spices. A sequestrant such as calcium disodium EDTA may be added to preserve color or flavor. No spice may give the jar a color that imitates egg yolk. Skip industrial seed oils, refined, bleached and deodorized, regardless of pressing words.",
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/169.140",
      "https://www.law.cornell.edu/cfr/text/21/169.150",
      "https://extension.illinois.edu/blogs/simply-nutritious-quick-and-delicious/2023-07-21-mayonnaise-versus-salad-dressing-popular",
      "https://blogs.extension.iastate.edu/wellness/2019/05/21/refrigerated-condiment-safety-tips/",
      {
        "name": "Dr. Cate Shanahan: The Hateful Eight seed oils",
        "url": "https://drcate.com/hateful-eight/"
      },
      "https://chriskresser.com/how-industrial-seed-oils-are-making-us-sick/",
      "https://www.ucdavis.edu/food/news/avocado-oil-chip-youre-eating-may-not-be-made-pure-avocado-oil"
    ],
    "buying_tips": [
      "A jar sold on avocado or olive oil can carry other oils; the list shows which leads.",
      "Look for olive oil as the only oil in the ingredient list.",
      "Check that the name on the jar is Mayonnaise.",
      "Choose olive oil mayonnaise with egg yolk and vinegar or citrus juice. Check every oil in the ingredient list.",
      "Compare jars by what they add beyond oil, egg yolk, acid and salt.",
      "Once opened, keep it in the fridge and use it within 1 to 2 months.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Skip “made with avocado oil” mayo too, even if it names no other oil."
    ]
  },
  "crackers": {
    "detail": "Under 21 CFR 101.4, ingredients are listed in descending order of predominance. FDA draft guidance says the ingredient list should show whether the first ingredient is a whole grain. “Wheat flour” is a synonym of flour, so it is not a whole grain flour. Soda crackers are fermented and leavened with yeast. The finest soda crackers take a long sponge fermentation, where most of the flour ferments first as a pre-ferment. Sourdough crackers are made from sourdough starter. Docking holes are poked in the dough to stop large air pockets while baking. Animal crackers are crackers in name only, and modern graham crackers are sweet. Olive oil, coconut oil or butter is Kristy’s standard for crackers. Skip seed oils and avocado oil. Skip “partially hydrogenated” or “interesterified” oil on the list; look for olive oil, coconut oil or butter. Skip refined palm oil or fractionated palm kernel oil in crackers; look for butter or olive oil. Brown rice generally carries more arsenic than white rice; rotate rice-flour crackers with whole wheat or oat crackers.",
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/101.4",
      "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/draft-guidance-industry-and-fda-staff-whole-grain-label-statements",
      "https://www.nutritionletter.tufts.edu/?p=148621",
      "https://en.wikipedia.org/wiki/Cracker_(food)",
      "https://bakerpedia.com/processes/crackers/",
      "https://www.masterclass.com/articles/sourdough-crackers",
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
      "https://www.cspi.org/chemical-cuisine/trans-fat-partially-hydrogenated-vegetable-oil",
      "https://www.cspi.org/chemical-cuisine/inter-esterified-oil",
      "https://extension.okstate.edu/fact-sheets/properties-of-palm-oil",
      "https://www.consumerreports.org/health/food-contaminants/arsenic-in-rice-reducing-risk-a8972350937/"
    ]
  },
  "potato_chips": {
    "decision": "Sliced potato chips: olive oil first, then organic.",
    "detail": "The FDA classifies potato chips as thin slices of potatoes fried in deep fat. A stacked crisp starts from dehydrated potato flakes mixed with cornstarch and water. That mix gives every piece the same shape for stacking. The FDA let one such product use the name potato chips only with a prominent disclaimer: “potato chips made from dried potatoes.” Its maker chose “potato crisps,” the British term, instead. For chips, Kristy’s standard is olive oil, coconut oil, tallow or lard. Skip seed oils and avocado oil. High-heat frying browns starchy slices, and darker browning forms more of a heat-made compound. Look for lighter browning: golden chips over dark ones. Monosodium glutamate is a flavor enhancer used in chips; skip it on the ingredient list and look for potatoes, oil and salt.",
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
      },
      "https://www.cspi.org/node/7459",
      "https://www.ucdavis.edu/food/news/avocado-oil-chip-youre-eating-may-not-be-made-pure-avocado-oil"
    ],
    "watch_out": [
      "“Potato crisps” can name a product pressed from dried potato flakes, not slices.",
      "Skip chips labeled “made with avocado oil” too; the label cannot prove the oil is pure."
    ]
  },
  "popcorn": {
    "watch_out": [
      "Prepopped popcorn is often coated with flavorings before it reaches the shelf.",
      "Skip avocado oil too: the label cannot prove the oil is pure.",
      "Skip canola, soy or corn oil in ready-popped bags; these oils are typically derived from bioengineering.",
      "Microwave popcorn bags are grease-lined, and grease-resistant packaging can carry PFAS. Pop plain kernels on the stove instead."
    ]
  },
  "snack_bars": {
    "detail": "Under 21 CFR 101.4, ingredients are listed in descending order of predominance. FDA guidance counts rolled oats as whole grain, since simple flattening or steaming keeps every part of the whole oat. An extension guide favors bars with whole grains such as oats, sweetened with fruit, honey or syrups, with nuts and seeds. The same guide advises avoiding bars with hydrogenated oils. Granola is rolled oats, nuts, seeds and honey or another sweetener, usually baked. A granola bar mixes granola with honey or syrup, pressed and baked into a bar. For added fat in bars, Kristy’s standard is olive oil, coconut oil or butter. Skip seed oils and avocado oil. Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed. Choose certified organic oat bars over conventional. Conventional oats may be sprayed with glyphosate shortly before harvest to dry the crop. Organic farming does not allow glyphosate. Drift can still leave residues on organic oats. Many bars carry sugar and high fructose corn syrup, and the list shows which. Skip refined palm oil or fractionated palm kernel oil in bars; look for coconut oil, olive oil or butter.",
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
      },
      "https://extension.okstate.edu/fact-sheets/properties-of-palm-oil"
    ]
  }
}
;

test("JC0 J9 owns exactly eight live-flagged ids and the explicit rBST pin at 53c6f90", () => {
  assert.equal(CLEAN_J9_BASE, "53c6f90");
  assert.deepEqual(nonEmpty(Object.keys(BECAME), "J9 ids", 9).toSorted(), [...CLEAN_J9].toSorted());
  const before = run(CLEAN_J9_BASE);
  for (const id of CLEAN_J9) {
    assert.ok(was(id) && live(id), id);
    assert.ok(J9_SCOPE.has(id), id);
    if (id !== "label_no_added_hormones") assert.ok(before.flagged.includes(id), `${id} was frozen`);
  }
  assert.ok(before.frozen.includes("label_no_added_hormones"));
});

test("JC1 every batch entry equals base with only the pinned BECAME fields set", () => {
  for (const [id, fields] of Object.entries(BECAME)) assert.deepEqual(live(id), { ...was(id), ...fields }, id);
});

test("JC2 every other entry, including J1-J8 and unflagged J9 ids, is byte-equal to base", () => {
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of nonEmpty(kb.entries.filter((e) => !CLEAN_J9.has(e.id)), "non-batch entries", 200)) assert.deepEqual(e, was(e.id), e.id);
  const { entries: _a, ...meta } = kb;
  const { entries: _b, ...oldMeta } = base;
  assert.deepEqual(meta, oldMeta);
});

test("JC3 carts never move; only the potato rung moves decision, with organic the fallback", () => {
  for (const id of CLEAN_J9) {
    assert.equal(live(id).cart_pick, was(id).cart_pick, `${id} cart`);
    assert.equal(live(id).decision, RUNG[id] ?? was(id).decision, `${id} decision`);
    assert.doesNotMatch(live(id).cart_pick ?? "", /organic/i, id);
  }
  assert.doesNotMatch(live("potato_chips").decision.split(/, then/)[0], /organic/i);
  assert.match(live("potato_chips").buying_tips[1], /USDA Organic/);
});

test("JC4 every new seed-oil sentence has a skip word, and new copy carries no reassurance", () => {
  const OIL = /\b(avocado|canola|soybean|sunflower|safflower|corn|cottonseed|grapeseed|rice bran|vegetable|seed) oils?\b/i;
  const SKIP = /\b(skip|avoid|instead of|never|not|no)\b/i;
  const oilLines = nonEmpty([...CLEAN_J9].flatMap((id) => fresh(id).flatMap((s) => s.split(/(?<=[.!?;])\s+/)).filter((s) => OIL.test(s))), "new oil sentences", 4);
  for (const s of oilLines) assert.match(s, SKIP, s);
  for (const id of CLEAN_J9) for (const s of fresh(id)) assert.doesNotMatch(s, /within (legal |safe )?limits|\btolerance|safe levels?|conventional is fine|buy conventional|eat more|heart[- ]healthy|debated|contested|saturated fat/i, id);
});

test("JC5 sourced register terms land on the home cards, with overflow in detail", () => {
  const TERMS = {
    mayo: ["refined", "made with avocado oil"],
    crackers: ["partially hydrogenated", "interesterified", "palm oil", "fractionated palm kernel oil", "brown rice"],
    potato_chips: ["monosodium glutamate", "made with avocado oil"],
    snack_bars: ["palm oil", "fractionated palm kernel oil"],
    label_organic_scope: ["Radura symbol", "treated with irradiation", "ionizing radiation"],
    label_no_added_hormones: ["rBST free", "from cows not treated with rBST", "voluntary claim"],
  };
  for (const [id, terms] of Object.entries(TERMS)) for (const term of terms) assert.ok(JSON.stringify({ ...live(id), sources: undefined }).toLowerCase().includes(term.toLowerCase()), `${id}: ${term}`);
  for (const [id, term] of [["crackers", "partially hydrogenated"], ["potato_chips", "monosodium glutamate"], ["snack_bars", "fractionated palm kernel oil"], ["label_organic_scope", "ionizing radiation"]]) assert.ok(live(id).detail.toLowerCase().includes(term.toLowerCase()), id);
});

test("JC5b pesticide-free wording is gone and batch copy has no cost wording", () => {
  for (const id of CLEAN_J9) {
    const { sources, aliases, asked_as, question, ...copy } = live(id);
    assert.doesNotMatch(JSON.stringify(copy), /pesticide-free|\b(cheap\w*|cost\w*|price\w*|pricing|budget|afford\w*|dollars?|pay|paying)\b/i, id);
  }
});

test("JC5c changed prose has no claim-lock, treatment, first-person or C4/C4b wording", () => {
  for (const id of CLEAN_J9) for (const s of nonEmpty(fresh(id), `${id} fresh lines`)) {
    assert.doesNotMatch(s, /\b(health\w*|safe\w*|protein|trans fats?|prevents?|cures?|causes?|risk|toxic\w*|cancer\w*|disease|detox|synthetic|poison|chemicals?|spray-free|I|me|my)\b|—/i, `${id}: ${s}`);
    if (/\bask\b/i.test(s)) assert.match(s, /counter|butcher|fishmonger|deli|bakery|market|farm stand|grower/i, id);
  }
});

test("JC6 every batch entry is readable and lint-clean; every step is at most 14 words", () => {
  for (const id of CLEAN_J9) {
    const e = live(id);
    assert.deepEqual(readability(e), [], id);
    assert.deepEqual(lintCard(projectEntry(e, { doLine: doLines[id] || "" })), [], id);
    for (const step of nonEmpty(e.pick_steps, `${id} steps`)) assert.ok(words(step) <= 14, `${id}: ${step}`);
  }
});

const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const archive = nonEmpty(walk(join(ROOT, "docs/sources")), "archive files", 10).map((p) => readFileSync(p, "utf8"));
const urlOf = (s) => s.url ?? String(s).match(/https?:\/\/\S+/)?.[0];
test("JC7 every new source URL occurs verbatim on an archived url line", () => {
  const urls = nonEmpty(Object.entries(BECAME).flatMap(([id, fields]) => (fields.sources ?? []).map(urlOf).filter((u) => u && !(was(id).sources ?? []).some((s) => urlOf(s) === u))), "new URLs", 8);
  for (const u of urls) {
    assert.ok(archive.some((s) => s.split("\n").some((line) => /^url:\s*/i.test(line) && line.slice(line.indexOf(":") + 1).trim() === u)), `${u} lacks a verbatim url line`);
    assert.doesNotMatch(u, /\b(prevents?|cures?|causes?)\b/i);
  }
});

test("JC8 rBST teaches production and a voluntary claim; organic retains approved sprays", () => {
  const e = live("label_no_added_hormones");
  assert.match(e.detail, /rBST, also called rBGH, is a hormone given to dairy cows to increase milk production/);
  assert.match(e.detail, /does not require a label declaring its use; “rBST free” is a voluntary claim/);
  assert.ok(e.buying_tips.includes("On dairy, look for “from cows not treated with rBST”; this describes the producer’s claim."));
  assert.equal(live("label_organic_scope").decision, was("label_organic_scope").decision);
  for (const f of ["why", "short_answer", "detail", "science"]) assert.match(live("label_organic_scope")[f], /approved sprays/i, f);
});

// C8 replacements: remove C4 pesticide-free/synthetic and price wording, name the
// avocado front-label phrase, and add an explicit skip to the cold-pressed warning.
const REPLACED_TIPS = {
  label_no_added_hormones: [1], label_nonGMO_vs_organic: [0],
  label_organic_scope: [2], label_cold_pressed_expeller: [1], mayo: [7],
};
test("JC9 every base tip survives or is an explicitly declared replacement; sources never drop", () => {
  for (const id of CLEAN_J9) {
    const e = live(id), old = was(id);
    const text = [...e.buying_tips, ...e.watch_out, e.detail].join("\n");
    for (const [i, tip] of old.buying_tips.entries()) {
      if (REPLACED_TIPS[id]?.includes(i)) assert.notEqual(e.buying_tips[i], tip, `${id}: declared replacement`);
      else assert.ok(text.includes(tip), `${id}: lost tip ${i}`);
    }
    for (const source of old.sources) assert.ok(e.sources.some((s) => JSON.stringify(s) === JSON.stringify(source)), `${id}: source lost`);
  }
});

test("JC10 preCleanJ9 restores only batch ids and does not mutate live entries", () => {
  for (const id of CLEAN_J9) {
    const entry = structuredClone(live(id)), before = structuredClone(entry);
    const restored = preCleanJ9(entry);
    assert.deepEqual(restored, was(id), id);
    assert.deepEqual(entry, before, `${id}: mutated`);
    assert.notEqual(restored, entry);
  }
  assert.equal(preCleanJ9(live("snacks")), live("snacks"));
});

test("JC11 J9 leaves only reasoned M7 carries; M8 does not shrink by cutting sources", () => {
  const before = run(CLEAN_J9_BASE), after = run(COMPLETENESS_BASE); // snapshot pin: the completeness pass supersedes this sweep (DECISIONS-2026-10-22)
  assert.equal(before.flagged.length, 15);
  assert.equal(after.flagged.length, 8);
  assert.deepEqual(after.flagged.filter((id) => J9_SCOPE.has(id)).toSorted(), ["snack_bars", "snacks"]);
  assert.deepEqual(after.flags.snack_bars.filter((f) => f.code !== "M8"), [{ code: "M7", detail: "protein_isolates" }]);
  assert.deepEqual(after.flags.snacks.filter((f) => f.code !== "M8"), [{ code: "M7", detail: "health_halo" }]);
  const terms = nonEmpty(load().register.find((r) => r.concern === "protein_isolates").terms, "isolate register terms", 3);
  for (const term of terms) assert.ok(mechanicalVeto(term), term);
  assert.deepEqual(live("snacks"), was("snacks"));
  assert.equal(after.counts.M8, before.counts.M8);
});
