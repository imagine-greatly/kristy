// clean-sweep-J6 (2026-10-22, clean-pick final sweep): deli, eggs and frozen, against the live stance flags at 8600937.
// Seed/vegetable-oil sentences take a skip word (M2); the egg grower ask sits at the stand (M3); the old cost rung
// becomes a feed-first floor rung with no price words; shared lines are reworded per card (M13); register terms land (M7).
// No rung rows: decision, cart_pick and pick_steps never move. Older pins read these ids as of 8600937 (cartPlain.js preCleanJ6).
// Left flagged on purpose: frozen_meals and prepared_meals keep M7 phthalates_bisphenols (the register cell parses to one
// literal term "none on label; cheese powder"; frozen_meals names cheese powder). frozen_nuggets keeps M7 protein_isolates:
// every register term contains "protein", which k24 C10 bans on frozen cards. deli_meat_uncured cites no new source: k9
// (frozen at 719f9fe) freezes its sources, as concernDeli.test.js records.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { nonEmpty } from "../../lib/testGuards.js";
import { lintCard, lintPick } from "../../lib/counterCardLint.js";
import { projectEntry } from "../../lib/counterCards.js";
import { CLEAN_J6, preCompleteness, CLEAN_J6_BASE, preCleanJ7, preCleanJ8, preCleanJ9, preDialed } from "./cartPlain.js";

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const raw = JSON.parse(readFileSync(new URL("../../kristy_perimeter_kb.json", import.meta.url), "utf8"));
// Later batches restore their own ids to the J6 commit (J7: preCleanJ7, J8: preCleanJ8, J9: preCleanJ9).
const kb = { ...raw, entries: raw.entries.map(preCompleteness).map(preDialed).map(preCleanJ7).map(preCleanJ8).map(preCleanJ9) };
const base = JSON.parse(execFileSync("git", ["show", `${CLEAN_J6_BASE}:server/kristy_perimeter_kb.json`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const doLines = JSON.parse(readFileSync(new URL("../../lib/doLines.json", import.meta.url), "utf8"));
const live = (id) => kb.entries.find((e) => e.id === id);
const was = (id) => base.entries.find((e) => e.id === id);
const textOf = (e) => JSON.stringify({ ...e, sources: undefined });
// Batches after J6 that edit these entries add their ids here.
const LATER = new Set([]);

// Every field J6 set, verbatim.
const BECAME = {
  "egg_labels": {
    "buying_tips": [
      "Most hens eat corn and soy, organic ones too, and her feed becomes the egg.",
      "‘Soy-free’ and ‘corn-free’ are the only words on the carton about the ration.",
      "Organic reaches the feed from another direction: organic feed, no GMOs, no routine antibiotics.",
      "‘Pasture-raised’ plus Certified Humane or Animal Welfare Approved is the strongest space claim.",
      "Farm stands and farmers markets are where soy-free actually lives. At the stand, ask the grower who keeps the hens.",
      "Where no carton names the feed, certified organic is the floor rung, since organic rules cover the ration.",
      "Shell color is the breed. White and brown are the same egg inside.",
      "Speckles and small rough patches are normal shell variation.",
      "Find the three-digit pack date beside the plant code. Closer to today is fresher.",
      "Open the carton and check for cracks and leaks before it goes in the cart.",
      "Float test at home: flat on the bottom is fresh, standing on end is old, floating goes out.",
      "A fresh egg fries with a tall yolk and a tight white. A flat, spreading one is old, not unsafe.",
      "AA vs A is firmness of the white. Freshness matters more than either.",
      "Organic requires organic feed, usually organic soy and corn. Not a different kind of feed.",
      "Keep them in the carton. It slows moisture loss and keeps odors out.",
      "Unwashed farm eggs can stay on the counter. Once washed, they need the fridge for good, not back and forth."
    ],
    "science": "Cage-free, free-range and pasture-raised are space claims; none says what the hen ate. Organic reaches the feed another way: organic feed, no GMOs, no routine antibiotics. ‘Vegetarian-fed’ keeps her off animal foods, yet a hen on real pasture eats bugs. Yolk color is not a feed tell; marigold in the ration deepens it too. With no feed named, certified organic is the floor; its rules reach the ration."
  },
  "deli_meat_uncured": {
    "watch_out": [
      "In deli meat, “uncured” or “no nitrates added” can still mean celery powder or juice supplies nitrite. Read the qualifier beside the claim.",
      "Every curing substance has to be named in the ingredients statement, so read the list, not only the asterisk.",
      "Skip sodium phosphate and other phosphates used to hold water. Leave out binders such as carrageenan, modified food starch or maltodextrin that thicken the meat.",
      "Skip “natural flavor” or “flavoring” on a deli meat list; the label need not say what the flavor is.",
      "Skip “mechanically separated chicken” or turkey on the list: a meat paste pressed from the bone, labeled by law."
    ]
  },
  "deli_salads": {
    "buying_tips": [
      "Cold food stays at 40°F or below, and egg, tuna or macaroni salad keeps 3 to 5 days.",
      "Buy salads from a refrigerated case.",
      "Check the Sell-By date, and skip a tub past it.",
      "Get it home cold; two hours out at most, one hour above 90°F.",
      "Read the salad’s ingredient label, including the dressing: choose olive oil or mayonnaise made with olive oil.",
      "Skip a deli dressing listing vegetable oil such as sunflower, safflower, canola, soybean, corn or cottonseed oil.",
      "Skip avocado oil in the dressing as well. Ask for the ingredient list at the deli counter."
    ]
  },
  "frozen_pizza": {
    "sources": [
      "https://ilfattoalimentare.it/pizza-napoletana-disciplinare.html",
      "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/draft-guidance-industry-and-fda-staff-whole-grain-label-statements",
      "https://web.archive.org/web/2023id_/https://www.fsis.usda.gov/sites/default/files/import/Labeling-Policy-Book.pdf",
      "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/freezing-and-food-safety",
      "https://www.tastingtable.com/1768445/double-wrap-homemade-frozen-pizza-freezer-burn",
      {
        "name": "CSPI Chemical Cuisine: Trans fat (partially hydrogenated vegetable oil)",
        "url": "https://www.cspi.org/chemical-cuisine/trans-fat-partially-hydrogenated-vegetable-oil"
      }
    ],
    "watch_out": [
      "A meat named on the box sets no minimum amount of that meat.",
      "Skip a pizza listing hydrogenated or partially hydrogenated oil in the crust or toppings."
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
      },
      {
        "name": "Center for Food Safety: Phthalates in macaroni and cheese powders",
        "url": "https://centerforfoodsafety.org/press-release/toxic-industrial-chemicals-found-in-10-varieties-of-macaroni-and-cheese-powders/"
      }
    ],
    "watch_out": [
      "Cream sauce is one food that does not freeze well.",
      "Skip monosodium glutamate and autolyzed yeast extract on the list. Pick a meal seasoned with named herbs and spices.",
      "Look for real cheese on a frozen mac and cheese list, not cheese powder; testing found phthalates in the powders."
    ]
  },
  "frozen_fries": {
    "buying_tips": [
      "At home, hash browns take potatoes, oil, salt and pepper; the bag lists anything more.",
      "The bag’s ingredient list names the frying or par-frying oil. Choose tallow, olive oil, or coconut oil; no added oil also fits.",
      "Skip frozen fries listing vegetable oil: sunflower, safflower, canola, soybean, corn or cottonseed oil.",
      "Read the bag’s ingredient list for potatoes, salt and the oil by name.",
      "Compare bags by what each one lists beyond potatoes, salt and that oil.",
      "In an air fryer, preheat about 3 minutes and shake the basket halfway.",
      "Do not overcrowd the air fryer basket, so the fries cook evenly.",
      "From an oven recipe, lower the air fryer temperature 25 to 30 F and the time by 20%.",
      "The fat in a fry bag can carry BHA, BHT or TBHQ, preservatives added to fats. Take a bag listing none of them."
    ]
  },
  "frozen_nuggets": {
    "buying_tips": [
      "“White meat” means 100 percent light meat; “mostly white meat” can be 66 percent.",
      "Look for certified organic on the box and a plain “Chicken Nugget” name.",
      "Find the frying or par-frying oil in the ingredient list. Take nuggets with tallow, olive oil, or coconut oil; no added oil also fits.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Read the name: a plain “Chicken Nugget” is a solid piece of meat or poultry.",
      "Look for “Chopped and Formed” beside the name, which means chopped and formed meat or poultry.",
      "A nugget labeled “breaded” holds no more than 30 percent breading.",
      "Nugget frying fats can carry BHA, BHT or TBHQ, preservatives added to fats. Take a box listing none of them."
    ]
  },
  "frozen_waffles": {
    "buying_tips": [
      "“Wheat flour” is plain flour, and front grain claims are undefined, so the list decides.",
      "Look for whole wheat flour first and no enriched flour or dye anywhere on the list.",
      "Read the first ingredient for a whole grain, such as whole wheat flour.",
      "Graham flour and rolled oats count as whole grain on the list.",
      "Regular waffles rise with baking powder or soda, and yeast waffles rise with yeast.",
      "At home, freeze cooled waffles airtight with parchment between, then toast them from frozen.",
      "Skip a waffle list naming Red 40, Yellow 5, Yellow 6 or Blue 1. Each is a synthetic dye, and a “Lake” dye still counts."
    ]
  }
};

test("JC0 the batch is the BECAME table, and every id exists at base", () => {
  assert.deepEqual(nonEmpty(Object.keys(BECAME), "J6 ids", 8).toSorted(), [...CLEAN_J6].toSorted());
  for (const id of CLEAN_J6) assert.ok(was(id) && live(id), id);
});

test("JC1 each batch id equals its base entry with only the BECAME fields set", () => {
  for (const [id, fields] of Object.entries(BECAME)) {
    if (LATER.has(id)) continue;
    assert.deepEqual(live(id), { ...was(id), ...fields }, id);
  }
});

test("JC2 every entry outside the batch is byte-equal to base", () => {
  const others = nonEmpty(kb.entries.filter((e) => !CLEAN_J6.has(e.id)), "non-batch entries", 200);
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of others) assert.deepEqual(e, was(e.id), e.id);
});

test("JC3 decision and cart_pick never move", () => {
  for (const id of CLEAN_J6) {
    if (LATER.has(id)) continue;
    assert.equal(live(id).cart_pick, was(id).cart_pick, `${id} cart_pick`);
    assert.equal(live(id).decision, was(id).decision, `${id} decision`);
  }
});

test("JC4 every seed/vegetable oil sentence carries a skip word; T7 lines are gone", () => {
  const OIL = /\b(vegetable|seed|soybean|cottonseed|canola|sunflower|rapeseed|safflower) oils?\b/i;
  const SKIP = /\b(skip|avoid|instead of|never|not|no)\b/i;
  const hits = nonEmpty([...CLEAN_J6].flatMap((id) => textOf(live(id)).split(/[.!?;]/).filter((s) => OIL.test(s))), "oil sentences", 3);
  for (const s of hits) assert.match(s, SKIP, s);
  for (const id of CLEAN_J6) assert.doesNotMatch(JSON.stringify(live(id)), /saturated fat|debated|contested|Dietary Guidelines/i, id);
});

test("JC5 register terms land on their home cards", () => {
  const TERMS = {
    deli_meat_uncured: ["natural flavor", "mechanically separated chicken"],
    frozen_pizza: ["hydrogenated"],
    frozen_meals: ["cheese powder"],
    frozen_waffles: ["red 40"],
    frozen_fries: ["bha", "sunflower"],
    deli_salads: ["sunflower"],
  };
  for (const [id, terms] of Object.entries(TERMS)) for (const t of terms) assert.ok(textOf(live(id)).toLowerCase().includes(t), `${id} lacks ${t}`);
  for (const id of CLEAN_J6) assert.doesNotMatch(live(id).cart_pick ?? "", /organic/i, id);
});

test("JC5b egg_labels: the floor rung is feed-first, with no cost words, and the grower ask sits at the stand", () => {
  const t = textOf(live("egg_labels"));
  assert.doesNotMatch(t, /lowest-cost|\b(cheap\w*|cost\w*|price\w*|budget|afford\w*|dollars?)\b/i);
  assert.match(t, /floor rung, since organic rules cover the ration/);
  assert.match(t, /At the stand, ask the grower/);
});

test("JC5c new lines carry no health, safety or treatment wording", () => {
  for (const id of CLEAN_J6) for (const f of ["buying_tips", "watch_out", "science"]) for (const s of [].concat(BECAME[id][f] ?? []))
    assert.doesNotMatch(s, /\b(health\w*|safe\w*|protein|trans fats?|prevents?|cures?|causes?|lowers? risk|toxic\w*|cancer\w*|I|me|my)\b/i, `${id}: ${s}`);
});

test("JC6 every batch entry is lint-clean", () => {
  for (const id of CLEAN_J6) {
    const e = live(id);
    assert.deepEqual(e.kind === "pick" ? lintPick(e) : lintCard(projectEntry(e, { doLine: doLines[id] || "" })), [], id);
  }
});

test("JC7 every new source URL is archived verbatim under docs/sources", () => {
  const urlOf = (s) => (s.url ?? String(s).match(/https?:\/\/\S+/)?.[0]);
  const urls = nonEmpty(Object.entries(BECAME).flatMap(([id, f]) => (f.sources ?? []).map(urlOf).filter((u) => u && !(was(id).sources ?? []).some((s) => urlOf(s) === u))), "new URLs", 2);
  const archive = execFileSync("grep", ["-rhiE", "^(url: *)?https?://", "docs/sources"], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
  for (const u of urls) assert.ok(archive.includes(u), `${u} not archived`);
});
