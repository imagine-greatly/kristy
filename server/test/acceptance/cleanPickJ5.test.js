// clean-sweep-J5 (2026-10-22, clean-pick final sweep): dairy and plant milks, against the live stance flags at 5706fee.
// Saturated-fat, debated and contested lines go (T7); seed/vegetable-oil sentences take a skip or not word (C20);
// register terms land with archived sources. No rung rows: decision and cart_pick never move.
// Older pins read these ids as of 5706fee (cartPlain.js preCleanJ5). raw_aged_cheese (M8 only) is untouched.
// cheese_real_vs_processed keeps M7 phthalates_bisphenols: the register cell parses to one literal term
// "none on label; cheese powder", which no card should say; the card names cheese powder.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { nonEmpty } from "../../lib/testGuards.js";
import { lintCard, lintPick } from "../../lib/counterCardLint.js";
import { projectEntry } from "../../lib/counterCards.js";
import { CLEAN_J5, CLEAN_J5_BASE, preCleanJ6, preCleanJ7, preCleanJ8, preCleanJ9 } from "./cartPlain.js";

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const raw = JSON.parse(readFileSync(new URL("../../kristy_perimeter_kb.json", import.meta.url), "utf8"));
// Later batches restore their own ids to the J5 commit (J6: preCleanJ6, J7: preCleanJ7, J8: preCleanJ8, J9: preCleanJ9).
const kb = { ...raw, entries: raw.entries.map(preCleanJ6).map(preCleanJ7).map(preCleanJ8).map(preCleanJ9) };
const base = JSON.parse(execFileSync("git", ["show", `${CLEAN_J5_BASE}:server/kristy_perimeter_kb.json`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const doLines = JSON.parse(readFileSync(new URL("../../lib/doLines.json", import.meta.url), "utf8"));
const live = (id) => kb.entries.find((e) => e.id === id);
const was = (id) => base.entries.find((e) => e.id === id);
const textOf = (e) => JSON.stringify({ ...e, sources: undefined });
// Batches after J5 that edit these entries add their ids here.
const LATER = new Set([]);

// Every field J5 set, verbatim.
const BECAME = {
  "grassfed_butter": {
    "detail": "Butter is cream, and salt if it is salted. A tub spread is a formulation, not butter: vegetable or seed oils, water, emulsifiers and flavoring, built to behave like butter. Within real butter, the grass difference is a feed difference showing up three ways at once: in the color, in the fat, and on the tongue. European-style butters are churned to a higher fat content, which is a separate axis from what the cows ate and the reason they bake and finish differently. The taste and the way it behaves in a hot pan are differences people can actually pick out, which is more than most sourcing claims manage. The fatty-acid profile shifts modestly too.",
    "watch_out": [
      "A tub spread is not butter. It is oils, water and emulsifiers built to behave like it, and the list says so.",
      "‘Spreadable butter’ is butter cut with canola or olive oil. The ingredient list says which.",
      "Color tracks the season as well as the standard. The same dairy churns paler in winter.",
      "The softness is mechanical. Cream from cows on grass carries a softer fat, which melts lower. So the bar gives at room temperature, where a grain-fed one stays firm."
    ],
    "science": "Cows on grass eat carotene, and it goes straight into the fat, so grass-fed butter runs deep yellow toward orange. The same dairy churns paler in winter. Grass-fed cream carries a softer fat, which melts lower, so the bar gives at room temperature. European-style butter is higher in fat, a separate axis from the feed. ‘Spreadable butter’ is butter cut with canola or olive oil."
  },
  "whole_vs_reduced_fat_milk": {
    "detail": "Whole milk is the one that had the least done to it. For years the guidance was ‘always low-fat dairy’, and the evidence behind that for otherwise-healthy people has weakened. Whole milk is a whole-food-standard pick rather than a finding. The handling is plain: skimming, standardizing and often ultra-pasteurizing are steps, and whole minimally-processed milk has fewer of them. A doctor’s advice for a specific person outranks a shelf standard.",
    "sources": [
      "reviews of dairy-fat and cardiometabolic outcomes",
      "Michigan State University Extension, dairy processing article (milk standardized to skim, 1%, 2% and whole through separators)",
      "Florida Dairy Farmers “How Much Fat is in Whole Milk?” https://www.floridamilk.com/in-the-news/blog/nutrition/how-much-fat-is-in-whole-milk-whole-2-low-fat-and-skim-milk-explained.stml",
      "characterization of the A1 and A2 beta-casein variants and BCM-7 release in digestion",
      "human digestive-comfort trials on A2 milk (small, inconsistent, several industry-funded)",
      "University of Minnesota Extension “A2 milk and A2 genetics” https://extension.umn.edu/agriculture/animals-and-livestock/dairy/a2-milk-and-a2-genetics",
      "FDA Pasteurized Milk Ordinance (time and temperature standards)",
      "FDA milk labeling and processing definitions",
      "Michigan State University Extension, dairy processing article https://www.canr.msu.edu/news/they_did_what_to_your_milk (homogenization forces milk at high pressure through small holes so fat does not rise; no health benefits or risks associated with it; non-homogenized milk available from some bottlers)",
      "CDC “Raw Milk” https://www.cdc.gov/food-safety/foods/raw-milk.html",
      {
        "name": "Cornell LII: 7 CFR § 205.238 Organic livestock hormone rules",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.238"
      },
      {
        "name": "BCPP: rBGH / rBST labeling",
        "url": "https://www.bcpp.org/resource/rbgh-rbst/"
      },
      {
        "name": "Milk proteins and human health: A1/A2 milk hypothesis",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC3475924/"
      }
    ]
  },
  "cheese_real_vs_processed": {
    "sources": [
      "FDA standards of identity for cheese",
      "FDA process-cheese labeling rules",
      "Mason Dixie Foods “Natural Cheese vs. Processed” https://masondixiefoods.com/blogs/faqs/natural-cheese-vs-processed",
      {
        "name": "Cornell LII: 7 CFR § 205.238 Organic livestock hormone rules",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.238"
      },
      {
        "name": "BCPP: rBGH / rBST labeling",
        "url": "https://www.bcpp.org/resource/rbgh-rbst/"
      },
      {
        "name": "U.S. Dairy Export Council: Milk protein concentrates technical report",
        "url": "https://www.thinkusadairy.org/assets/Documents/Customer%20Site/C3-Using%20Dairy/C3.7-Resources%20and%20Insights/03-Application%20and%20Technical%20Materials/Milk_Protein_Concentrates_Technical_Report.pdf"
      },
      {
        "name": "Center for Food Safety: Phthalates in macaroni and cheese powders",
        "url": "https://centerforfoodsafety.org/press-release/toxic-industrial-chemicals-found-in-10-varieties-of-macaroni-and-cheese-powders/"
      },
      {
        "name": "Food Packaging Forum: Phthalates found in mac and cheese",
        "url": "https://foodpackagingforum.org/news/phthalates-found-in-mac-and-cheese"
      }
    ],
    "buying_tips": [
      "Bagged shreds are coated in starch to keep them apart, which is why they melt poorly.",
      "Look for grass-fed milk named on the block.",
      "Look for a short list: milk, salt, cultures, enzymes/rennet.",
      "Blocks are cheaper per pound than pre-sliced or shredded, and they melt smoothly.",
      "‘Parmesan’ is a generic word in the US. ‘Parmigiano-Reggiano’ is a protected one with a stamped rind.",
      "Keep hard-cheese rinds. They belong in a pot of beans or soup.",
      "The milk for cheese may come from cows given the synthetic growth hormone rBST. Certified organic rules exclude its use.",
      "Certified organic block cheese is the first choice. Next, find a wrapper stating the cheese uses milk from cows given no rBST. Cheese with neither claim is last. US labeling does not require a statement about rBST use.",
      "“rBST free” on a wrapper points to milk from cows not given rBST."
    ],
    "watch_out": [
      "‘Cheese product’, ‘cheese food’ and ‘pasteurized process’ all mean emulsifiers blended in. That is a different product from cheese.",
      "Bagged shreds carry potato starch, powdered cellulose and natamycin. Minor, but it is why they resist melting.",
      "‘Pasteurized process cheese product’ needs only 51% cheese. The other 49% can be salt, dyes, preservatives, extra dairy, emulsifiers or other additions. The name on the front is the only warning.",
      "Processed cheese lists can name milk protein concentrate, a filtered milk powder; a block lists milk.",
      "Boxed mac and cheese powder tests higher in phthalates than block cheese, so buy the block."
    ]
  },
  "yogurt_plain_vs_flavored": {
    "buying_tips": [
      "100% grass-fed means grass and hay, never grain; flavored tubs carry added sugar.",
      "Plain over flavored. Sweeten it yourself with fruit.",
      "Compare the added-sugars line on the plain tub against the fruit cup. That gap is the decision.",
      "Greek or strained yogurt is thicker; whole-milk versions are more filling.",
      "A short list is the sign: milk and cultures. Thickeners do the job straining does, for less.",
      "Greek and skyr are strained: thicker, with less whey.",
      "Kefir is drinkable and carries a wider mix of cultures than yogurt.",
      "Whole-milk versions are more filling and less tinkered with than fat-free.",
      "rBST names a synthetic growth hormone used in dairy cows. Certified organic yogurt rules bar it in the herd.",
      "For this herd treatment, take certified organic yogurt first. Next is a tub stating its milk comes from cows not given rBST. Tubs bearing neither claim rank last. US labels need not disclose whether cows received rBST.",
      "“rBST free” means the milk comes from cows not given that synthetic hormone.",
      "Skip artificial color on the yogurt list.",
      "Read the yogurt list for Red 40, Yellow 5, Yellow 6 or Blue 1, all synthetic dyes. Take the tub with no added color over one naming a dye. “Lake” means a dye that does not dissolve in water; it still counts."
    ]
  },
  "cream_vs_creamer": {
    "detail": "Heavy cream is at least 36% milkfat, light whipping 30 to 36, half-and-half 10.5 to 18. Standards of identity fix what cream can mean, which is why those fat percentages are consistent across every carton. Creamer has no such standard because it is a formulated product. The oil in it is usually a refined seed oil, not milkfat, and the sweetness usually comes from corn syrup solids or sugar, with the flavored versions adding more of both. Some cartons of real cream carry stabilizers like carrageenan or gellan gum, so a short list is worth checking on the dairy side too. Whole milk, half-and-half or real cream all do the job with a list you can read out loud. Read the two ingredient lists side by side and it takes three seconds. rBST is a synthetic hormone given to cows for milk production. The certified organic rules bar this growth hormone. Start with certified organic cream or half-and-half. Follow with a carton stating the cows were not treated with rBST, then one with neither. US companies need not label rBST use.",
    "watch_out": [
      "Most coffee creamers are dairy-free. Water, sugar and vegetable oil, not cream, are the usual first three ingredients. Many are built on almond, oat or coconut milk rather than cream.",
      "The flavored creamers carry the most sugar. That line on the panel is the one to read first.",
      "Real cream can still carry carrageenan or gellan gum. The fat number is fixed by law; the list is not.",
      "Cartons marked ultra-pasteurized were heated to at least 280 °F for 2 seconds.",
      "In creamers, skip titanium dioxide, polysorbate 80 and carboxymethylcellulose on the list.",
      "Skip a creamer listing sunflower oil or canola oil."
    ],
    "science": "Cream is dairy with a legal fat minimum fixed by standards of identity. ‘Non-dairy creamer’ has no such standard because it is a formulated product. Water, sugar and vegetable oil, not cream, are the usual first three ingredients, with emulsifiers and thickeners. Many are built on almond, oat or coconut milk rather than cream. Whole milk or half-and-half does the same job with a two-word list."
  },
  "ice_cream": {
    "detail": "Under 21 CFR 135.110, ice cream holds at least 10 percent milkfat and at least 4.5 pounds to the gallon. The pounds-per-gallon floor limits how much air is whipped in. Ice cream excludes other food fats, except incidental amounts. Frozen custard is ice cream with 1.4 percent egg yolk solids. A frozen dairy dessert may list oils such as coconut, palm or soybean oil, so skip it for real ice cream. Ice cream starts with dairy from cows that may receive rBST, a synthetic growth hormone. Certified organic production prohibits it. Certified organic ice cream leads this label ladder. Next is a carton stating its milk came from cows that were not treated with rBST. A carton with neither claim ranks last: US rules let rBST use go unlabeled.",
    "buying_tips": [
      "The name ice cream needs 10 percent milkfat and no oils beyond incidental amounts.",
      "Look for cream, milk and sugar first, with no carrageenan or guar gum.",
      "Read the name on the carton, not the picture.",
      "Look for “frozen dairy dessert” in the small print.",
      "Read the ingredients for oils such as coconut or palm oil.",
      "Carrageenan thickens foods and comes from seaweed. Some certified organic foods use it too, so read the ice cream’s ingredient list and choose one without it.",
      "Look for certified organic first, then “rBST free” on the carton."
    ],
    "science": "The name “ice cream” requires at least 10 percent milkfat and 4.5 pounds to the gallon. The pounds-per-gallon floor limits how much air is whipped in. Ice cream excludes other food fats, except incidental amounts. A product short of the standard is sold as “frozen dairy dessert”, with more air and less milk fat. It may list coconut, palm or soybean oil, which ice cream does not."
  },
  "goat_sheep_dairy": {
    "watch_out": [
      "Lactose intolerance or a milk allergy? Ask a doctor which milks fit.",
      "For the A2 milk question, see the Milk card."
    ]
  },
  "plant_butter": {
    "short_answer": "Plant butter is built on plant oils, and the ingredient list names them. Skip one that adds a seed oil such as sunflower oil, and pick coconut or olive oil first.",
    "detail": "The federal margarine standard, 21 CFR 166.110, is a reference point here, not a definition of plant butter. A food sold as margarine holds at least 80 percent fat. That fat comes from vegetable or rendered animal fats and oils. Those fats may have gone through an accepted process of physico-chemical modification, a physical or chemical change to the fat. Margarine must contain vitamin A. One label lists coconut oil, cultured cashew milk, water and sunflower oil, so not every plant butter skips seed oil.",
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/166.110",
      "https://www.wegmans.com/shop/product/980978",
      {
        "name": "Dr. Cate Shanahan: The Hateful Eight seed oils",
        "url": "https://drcate.com/hateful-eight/"
      },
      {
        "name": "CSPI Chemical Cuisine: Trans fat (partially hydrogenated vegetable oil)",
        "url": "https://www.cspi.org/chemical-cuisine/trans-fat-partially-hydrogenated-vegetable-oil"
      },
      {
        "name": "CSPI Chemical Cuisine: Interesterified oil",
        "url": "https://www.cspi.org/chemical-cuisine/inter-esterified-oil"
      },
      {
        "name": "Oklahoma State Extension: Properties of palm oil",
        "url": "https://extension.okstate.edu/fact-sheets/properties-of-palm-oil"
      }
    ],
    "watch_out": [
      "The name alone does not say which oils went in.",
      "Skip a spread listing palm oil, hydrogenated oil or interesterified oil."
    ],
    "science": "Plant butter is built on plant oils, and the oils differ from one plant butter to the next. The name alone does not say which oils went in; the ingredient list does. One label lists coconut oil, cashew milk, water and sunflower oil, so skip a seed oil like that. The federal margarine standard is a reference point, not a definition of plant butter."
  },
  "dairy_case": {
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/131.110",
      "https://www.dairyreporter.com/Article/2026/03/13/how-ultrafiltered-milk-is-made-benefits-protein-process/",
      "https://www.law.cornell.edu/cfr/text/7/205.240",
      "https://www.farmanddairy.com/?p=14321",
      {
        "name": "Cornell LII: 7 CFR § 205.238 Organic livestock hormone rules",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.238"
      },
      {
        "name": "BCPP: rBGH / rBST labeling",
        "url": "https://www.bcpp.org/resource/rbgh-rbst/"
      },
      {
        "name": "Cornell LII: 21 CFR § 131.3 Ultra-pasteurized definition",
        "url": "https://www.law.cornell.edu/cfr/text/21/131.3"
      },
      {
        "name": "Weston A. Price Foundation: Milk homogenization",
        "url": "https://www.westonaprice.org/health-topics/know-your-fats/milk-homogenization-heart-disease/"
      },
      {
        "name": "HealthyUWellness: Packaged shredded cheese additives",
        "url": "https://www.healthyuwellness.org/post/packaged-shredded-cheese-is-toxic"
      }
    ],
    "watch_out": [
      "Vitamins in milk are optional, so check the label rather than assume.",
      "“Ultra-pasteurized” means heated to at least 280°F for at least two seconds, for a longer refrigerated shelf life.",
      "“Non-homogenized” milk skips the step that breaks fat globules into smaller droplets.",
      "Pre-shredded cheese carries cellulose or potato starch against caking; see the Cheese card."
    ]
  },
  "almond_milk": {
    "detail": "Almond milk holds about 0.4 grams of protein per 100 ml. It is usually fortified with added vitamins and minerals. FDA notes that almond- and oat-based drinks are not part of the dairy group. Their overall nutritional content is not similar to milk. FDA notes the name “almond milk” is established by common usage.",
    "watch_out": [
      "FDA does not place almond drinks in the dairy group.",
      "Fortified almond milk comes second, since each added vitamin or mineral joins the list.",
      "Gellan gum, guar gum or locust bean gum are added thickeners; pick almonds and water without them.",
      "Skip an almond carton listing sunflower oil or canola oil."
    ]
  },
  "soy_milk": {
    "watch_out": [
      "FDA counts only fortified soy in the dairy group, yet fortifying adds vitamins and minerals, each another ingredient.",
      "Soy lecithin and soy protein come from the same soybeans. A QR code or phone number may lead to the bioengineered disclosure.",
      "Dairy shoppers can read the Milk card.",
      "Fortified soy milk is the second pick, behind a carton of soybeans and water.",
      "Gums such as gellan gum, guar gum or locust bean gum stop separation; pick soybeans and water without them.",
      "Skip a soy carton that adds sunflower oil or canola oil."
    ]
  },
  "coconut_milk_beverage": {
    "watch_out": [
      "The carton beverage does not stand in for canned coconut milk in cooking.",
      "A fortified carton comes second; the vitamins in it are added ingredients.",
      "Skip a coconut carton naming sunflower oil or canola oil."
    ]
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
      },
      {
        "name": "Seed Oil Free Certified: Does oat milk contain seed oils",
        "url": "https://www.seedoilfreecertified.com/seed-oils-guide/everyday-foods/does-oat-milk-contain-seed-oils"
      }
    ],
    "watch_out": [
      "A fortified oat milk ranks second; its added vitamins and minerals lengthen the list.",
      "Skip gellan gum, guar gum and locust bean gum on an oat carton; they thicken and stop separation.",
      "Some oat milks add sunflower, canola or rapeseed oil, so skip those cartons."
    ]
  }
};

test("JC0 the batch is the BECAME table, and every id exists at base", () => {
  assert.deepEqual(nonEmpty(Object.keys(BECAME), "J5 ids", 13).toSorted(), [...CLEAN_J5].toSorted());
  for (const id of CLEAN_J5) assert.ok(was(id) && live(id), id);
});

test("JC1 each batch id equals its base entry with only the BECAME fields set", () => {
  for (const [id, fields] of Object.entries(BECAME)) {
    if (LATER.has(id)) continue;
    assert.deepEqual(live(id), { ...was(id), ...fields }, id);
  }
});

test("JC2 every entry outside the batch is byte-equal to base", () => {
  const others = nonEmpty(kb.entries.filter((e) => !CLEAN_J5.has(e.id)), "non-batch entries", 200);
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of others) assert.deepEqual(e, was(e.id), e.id);
});

test("JC3 decision and cart_pick never move", () => {
  for (const id of CLEAN_J5) {
    if (LATER.has(id)) continue;
    assert.equal(live(id).cart_pick, was(id).cart_pick, `${id} cart_pick`);
    assert.equal(live(id).decision, was(id).decision, `${id} decision`);
  }
});

test("JC4 every seed/vegetable oil sentence carries a skip word; T7 lines are gone", () => {
  const OIL = /\b(vegetable|seed|soybean|cottonseed|canola|sunflower|rapeseed|safflower) oils?\b/i;
  const SKIP = /\b(skip|avoid|instead of|never|not|no)\b/i;
  const hits = nonEmpty([...CLEAN_J5].flatMap((id) => textOf(live(id)).split(/[.!?;]/).filter((s) => OIL.test(s))), "oil sentences", 10);
  for (const s of hits) assert.match(s, SKIP, s);
  for (const id of CLEAN_J5) assert.doesNotMatch(JSON.stringify(live(id)), /saturated fat|debated|contested|Dietary Guidelines/i, id);
});

test("JC5 register terms land on their home cards", () => {
  const TERMS = {
    cheese_real_vs_processed: ["rbst free", "milk protein concentrate", "cheese powder"],
    ice_cream: ["rbst free"],
    goat_sheep_dairy: ["a2 milk"],
    plant_butter: ["hydrogenated", "interesterified", "palm oil"],
    dairy_case: ["cellulose"],
    cream_vs_creamer: ["sunflower oil"],
    almond_milk: ["sunflower oil"],
    soy_milk: ["sunflower oil"],
    coconut_milk_beverage: ["sunflower oil"],
    oat_milk: ["sunflower"],
  };
  for (const [id, terms] of Object.entries(TERMS)) for (const t of terms) assert.ok(textOf(live(id)).toLowerCase().includes(t), `${id} lacks ${t}`);
  for (const id of CLEAN_J5) assert.doesNotMatch(live(id).cart_pick ?? "", /organic/i, id);
});

test("JC6 every batch entry is lint-clean", () => {
  for (const id of CLEAN_J5) {
    const e = live(id);
    assert.deepEqual(e.kind === "pick" ? lintPick(e) : lintCard(projectEntry(e, { doLine: doLines[id] || "" })), [], id);
  }
});

test("JC7 every new source URL is archived verbatim under docs/sources", () => {
  const urlOf = (s) => (s.url ?? String(s).match(/https?:\/\/\S+/)?.[0]);
  const urls = nonEmpty(Object.entries(BECAME).flatMap(([id, f]) => (f.sources ?? []).map(urlOf).filter((u) => u && !(was(id).sources ?? []).some((s) => urlOf(s) === u))), "new URLs", 8);
  const archive = execFileSync("grep", ["-rhiE", "^(url: *)?https?://", "docs/sources"], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
  for (const u of urls) assert.ok(archive.includes(u), `${u} not archived`);
});
