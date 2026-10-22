// clean-sweep-J7 (2026-10-22, clean-pick final sweep): pantry and fats, against the live stance flags at 974ec27.
// Seed/vegetable-oil sentences take a skip word (M2); cost words go (plan C4: "cheap", "price"); register terms land (M7):
// BPA-free lining / non-BPA on cans, sprouted / soaked on beans. One rung row: raw_cider_vinegar's decision drops
// organic from the first rung (M5); its cart_pick never moves. whole_spices gains the organic-floor irradiation line
// (7 CFR 205.105, archived); its Radura line already stood. Older pins read these ids as of 974ec27 (cartPlain.js preCleanJ7).
// Left flagged on purpose: cocoa keeps M7 chocolate_metals (the register cell parses to the literal "none on label
// (test results only)", a register-parse artifact).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { nonEmpty } from "../../lib/testGuards.js";
import { lintCard, lintPick } from "../../lib/counterCardLint.js";
import { projectEntry } from "../../lib/counterCards.js";
import { CLEAN_J7, CLEAN_J7_BASE, preCleanJ8, preCleanJ9, preDialed } from "./cartPlain.js";

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const raw = JSON.parse(readFileSync(new URL("../../kristy_perimeter_kb.json", import.meta.url), "utf8"));
// Later batches restore their own ids to the J7 commit (J8: preCleanJ8, J9: preCleanJ9).
const kb = { ...raw, entries: raw.entries.map(preDialed).map(preCleanJ8).map(preCleanJ9) };
const base = JSON.parse(execFileSync("git", ["show", `${CLEAN_J7_BASE}:server/kristy_perimeter_kb.json`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const doLines = JSON.parse(readFileSync(new URL("../../lib/doLines.json", import.meta.url), "utf8"));
const live = (id) => kb.entries.find((e) => e.id === id);
const was = (id) => base.entries.find((e) => e.id === id);
const textOf = (e) => JSON.stringify({ ...e, sources: undefined });
// Batches after J7 that edit these entries add their ids here.
const LATER = new Set([]);
// Leaf strings the batch wrote that base did not already carry.
const leaves = (v) => (typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(leaves) : []);
const fresh = (id) => { const old = new Set(leaves(was(id))); return leaves({ ...BECAME[id], sources: undefined }).filter((s) => !old.has(s)); };
// The one rung row in this batch.
const RUNG = { raw_cider_vinegar: "Raw, unfiltered cider vinegar with the mother, then organic apples." };

// Every field the batch set, verbatim.
const BECAME = {
  "nuts_raw_vs_roasted": {
    "why": "Skip nuts roasted in cottonseed or soybean oil, the usual roasting mediums. Dry-roasted keeps it to the nut.",
    "detail": "Raw and dry-roasted nuts are simply the nut; oil-roasted adds a seed-oil coating nobody needs. Skip seed oils, the whole-food standard: read the tiny ingredient line on the nut tub. Skip the common tub reading ‘peanuts, cottonseed oil, salt’. Roasting itself is fine; the added oil is the part to notice. The chemical treatment for “raw” almonds is PPO. Look for “soaked” when choosing nuts prepared in water before drying; raw and dry-roasted name different preparation steps.",
    "kristy_take": "Raw or dry-roasted. Skip the seed oil in roasted almonds; it is the easiest swap in the store.",
    "buying_tips": [
      "Many roasted nuts are cooked in cottonseed or soybean oil; dry-roasted is just the nut.",
      "Look for ‘dry roasted’ or ‘raw’, with no added oil.",
      "Read the ingredient line, and skip roasted nuts listing cottonseed or soybean oil.",
      "Read the ingredient list on bulk-bin nuts as well as jars."
    ],
    "labels_decoded": [
      {
        "term": "Dry roasted",
        "meaning": "Roasted with no added oil."
      },
      {
        "term": "Roasted (in oil)",
        "meaning": "Cooked in added oil, often a seed oil to skip; check the list."
      }
    ],
    "pick_steps": [
      "Look for “dry roasted” or “raw”, with no added oil.",
      "Skip roasted nuts whose ingredient line lists cottonseed or soybean oil."
    ]
  },
  "honey_adulteration": {
    "why": "Widely cut with corn or rice syrup. It is still a sweetener, just a real and old one.",
    "short_answer": "Some honey is cut with corn or rice syrup or heavily filtered. Look for a local or single-source producer, ‘raw’, and a label that reads only ‘honey’. It is still a sugar, a sweetener to use with intention.",
    "buying_tips": [
      "Supermarket honey is often blended, filtered or cut with corn or rice syrup.",
      "Ingredient list should read ‘honey’ and nothing else.",
      "Local, single-source, or ‘raw’ honey is the most trustworthy.",
      "It’s still a sweetener. Use it with intention."
    ]
  },
  "beans_dried_vs_canned": {
    "short_answer": "Dried beans are the bean closest to the field, with nothing added. Cooking them yourself is the only way to set the salt. Canned are close, and a rinse removes much of the sodium.",
    "detail": "Nutritionally dried and canned beans are very close. Canned adds convenience and some sodium (rinsing removes a good chunk). Where canned, look for a “BPA-free lining” or “non-BPA” can, or a carton. Soaking or sprouting dried beans before cooking reduces their phytic acid. Dried beans ask for planning rather than skill: a slow cooker or a pressure cooker takes the work out.",
    "sources": [
      "USDA FoodData Central",
      "Today’s Dietitian, sodium and canned beans https://www.todaysdietitian.com/newarchives/canned-beans-sodium.html (rinsing and draining canned beans can reduce their sodium content)",
      {
        "name": "Cornucopia Institute: Glyphosate Used to Kill and Prepare Crops for Harvest",
        "url": "https://www.cornucopia.org/2017/10/glyphosate-used-kill-prepare-crops-harvest"
      },
      {
        "name": "FoodPrint: Glyphosate Residue in Food",
        "url": "https://foodprint.org/blog/glyphosate-residue-in-food/"
      },
      {
        "name": "Saskatchewan Pulse Growers: Harvest Aid Options for Pulses",
        "url": "https://saskpulse.com/resources/harvest-aid-options-for-pulses/"
      },
      {
        "name": "EWG: BPA in Canned Food",
        "url": "https://www.ewg.org/research/bpa-canned-food"
      },
      "https://www.westonaprice.org/health-topics/vegetarianism-and-plant-foods/living-with-phytic-acid/"
    ],
    "buying_tips": [
      "Cooking dried beans yourself is the only way to set the salt.",
      "Look for USDA Organic on the bag of dried beans.",
      "Look for “sprouted” beans, or soak dried ones before cooking; both reduce phytic acid.",
      "A slow cooker or pressure cooker removes the planning problem.",
      "Whole beans with unbroken skins cook evenly. Split ones turn to mush.",
      "Choose certified organic beans over conventional, dried or canned. Conventional beans and other pulses may receive glyphosate before harvest for weed control. Organic farming does not allow glyphosate. Drift can still leave residues on organic beans."
    ],
    "labels_decoded": [
      {
        "term": "BPA-free",
        "meaning": "Can lining without BPA; also printed as “BPA-free lining” or “non-BPA”."
      }
    ],
    "tier_note": "That rinsing removes much of the canning sodium is measured, and dried beans leave the salt to the cook.",
    "science": "Nutritionally, dried and canned beans are very close. Canned adds convenience and some sodium. Cooking dried beans yourself is the only way to set the salt. They ask for planning rather than skill, and a slow cooker or pressure cooker takes the work out. For canned, a “BPA-free lining” is the can to look for."
  },
  "bulk_bins_buying": {
    "why": "Turnover is everything. Oil in nuts and flour goes rancid in a slow bin.",
    "short_answer": "Yes, when the bin turns over. Grains, beans, lentils, oats, rice and spices keep well by the scoop. Nuts, seeds and whole-grain flours carry oil that goes rancid. Pick a full, busy bin and smell what you scoop.",
    "detail": "Bulk strips out the packaging and the brand. Spices are the extreme case, where a scoop from a bin is usually fresher than a jar because the bin moves. The risk sits entirely with the fatty items. Rancidity is the real quality question in this aisle, and it announces itself: rancid nuts and seeds smell like old paint or crayons and taste sharp and bitter. Bring your own jars where the store allows it, and note the tare weight. With spices especially, you buy exactly what you need. The catch is turnover: nuts, seeds and whole-grain flours carry oil that goes rancid, so a slow bin is a bad buy every time.",
    "buying_tips": [
      "A full, busy bin turns over; oil in nuts and whole-grain flour goes rancid in a slow one.",
      "Best by the scoop: rice, oats, beans, lentils, dried fruit and especially spices.",
      "Riskiest: nuts, seeds and whole-grain flours. Oil goes rancid in a slow bin.",
      "Full busy bins turn over. A dusty half-empty one does not.",
      "Smell it before it goes in the cart. Rancid reads as paint, crayon or bitter.",
      "Buy what you will use in a month, and store it airtight and dark."
    ]
  },
  "cooking_oils": {
    "kristy_take": "The label names the oil. Skip “vegetable oil,” which names no single one; the ingredient list names the oils.",
    "buying_tips": [
      "Skip “vegetable oil” on a label; it names a category, not one seed or fruit.",
      "Skip sunflower, safflower, canola, soybean, corn and cottonseed oils; the last four come from mostly bioengineered crops.",
      "Skip avocado oil too, blends and “made with avocado oil” included; the label cannot prove the oil is pure.",
      "Read the list for BHA, BHT, TBHQ or propyl gallate, preservatives added to oils, and choose a list without them.",
      "Read the label for the oil’s name first, then refined or unrefined."
    ]
  },
  "lard_tallow": {
    "detail": "Under 9 CFR 319.702, lard is the fat rendered from clean and sound edible tissues from swine. Rendered fat is fat cooked out of the tissue. “Leaf lard” is lard from fresh leaf, or abdominal, fat. Lard may be hardened with lard stearin or hydrogenated lard, two lard-based hardeners, and the label must state it. Lard is white when solid. Tallow is the rendered fat from a beef animal, and no federal standard for it is cited here. Rendered animal fat, or a mix containing it, may contain no added water under 9 CFR 319.703. Skip shortening made from meat fats and vegetable oils; it is a different product, named for the fats in it under 9 CFR 319.701.",
    "science": "Lard is fat rendered from pork tissue, and tallow is rendered beef fat. Rendered fat is fat cooked out of the tissue. Leaf lard comes from the abdominal fat. Lard may be hardened with lard stearin or hydrogenated lard, and the label must state it. Rendered animal fat may contain no added water. Shortening of meat fats and vegetable oils is not plain lard; it is named for those fats.",
    "labels_decoded": [
      {
        "term": "Leaf lard",
        "meaning": "Lard from fresh leaf, or abdominal, fat."
      },
      {
        "term": "Hydrogenated lard",
        "meaning": "A hardener that must be stated on a lard label."
      },
      {
        "term": "Mixed fat shortening",
        "meaning": "Meat fats mixed with vegetable oils, not plain lard, named in order of predominance."
      }
    ]
  },
  "canned_coconut_milk": {
    "buying_tips": [
      "Many cans add a gum such as guar gum to thicken the milk and hold it steady.",
      "Look for coconut alone on the list, with no guar gum or other gum.",
      "Pick a can that says “BPA-free lining” or “non-BPA”; many cans have an epoxy lining made with BPA. Where the same coconut milk is sold in glass, the jar has no can lining.",
      "Compare two cans by how much the list holds beyond coconut.",
      "Read the ingredients for guar gum or another gum."
    ]
  },
  "canned_soup": {
    "buying_tips": [
      "Low sodium is a fixed ceiling; reduced sodium only means less than a named soup.",
      "Look for a short list with no added flavors, starches or sugar.",
      "Pick a soup can marked “non-BPA” or “BPA-free lining”; many food cans are lined with an epoxy made with BPA. Fresh or frozen soup has no can lining.",
      "Leave cans with deep dents, seam dents, leaks, rust or bulging lids on the shelf.",
      "MSG, yeast extract or hydrolyzed protein on a soup list adds flavor in place of more real ingredients. Look for soup seasoned with named herbs and spices."
    ]
  },
  "raw_cider_vinegar": {
    "decision": "Raw, unfiltered cider vinegar with the mother, then organic apples."
  },
  "whole_spices": {
    "sources": [
      "volatile-compound retention studies on whole versus ground spice storage",
      "food-science references on dry-roasting and aromatic release",
      "Aradwad et al. “Key issues and challenges in spice grinding,” Cleaner Engineering and Technology Vol. 5, Dec 2021 https://www.sciencedirect.com/science/article/pii/S2666790821003074 (heat-induced quality loss is a primary technical challenge in spice grinding; grinding needs special emphasis considering significant quality loss due to heat generation)",
      "https://centerforfoodsafety.org/press-release/citizens-consumer-groups-oppose-proposed-irradiation-labeling-change/",
      "https://www.law.cornell.edu/cfr/text/7/205.105"
    ],
    "buying_tips": [
      "Whole spices hold their oils for a couple of years; ground ones fade within months.",
      "A dry pan over medium heat, until you can smell them across the kitchen.",
      "Buy from a bin that turns over, in the smallest amount you will finish.",
      "Certified organic spices are never irradiated; the organic rules prohibit ionizing radiation."
    ]
  }
};

test("JC0 the batch is the BECAME table, and every id exists at base", () => {
  assert.deepEqual(nonEmpty(Object.keys(BECAME), "J7 ids", 10).toSorted(), [...CLEAN_J7].toSorted());
  for (const id of CLEAN_J7) assert.ok(was(id) && live(id), id);
});

test("JC1 each batch id equals its base entry with only the BECAME fields set", () => {
  for (const [id, fields] of Object.entries(BECAME)) {
    if (LATER.has(id)) continue;
    assert.deepEqual(live(id), { ...was(id), ...fields }, id);
  }
});

test("JC2 every entry outside the batch is byte-equal to base", () => {
  const others = nonEmpty(kb.entries.filter((e) => !CLEAN_J7.has(e.id)), "non-batch entries", 200);
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of others) assert.deepEqual(e, was(e.id), e.id);
});

test("JC3 cart_pick never moves; decision moves only on the rung row, and its first rung is not organic", () => {
  for (const id of CLEAN_J7) {
    if (LATER.has(id)) continue;
    assert.equal(live(id).cart_pick, was(id).cart_pick, `${id} cart_pick`);
    assert.equal(live(id).decision, RUNG[id] ?? was(id).decision, `${id} decision`);
  }
  for (const [id, d] of Object.entries(RUNG)) assert.doesNotMatch(d.split(/, then|; then/)[0], /organic/i, id);
});

test("JC4 every new seed/vegetable oil sentence (beyond a cooked-in description, X10) carries a skip word; T7 lines are absent", () => {
  const OIL = /\b(vegetable|seed|soybean|cottonseed|canola|sunflower|rapeseed|safflower) oils?\b/i;
  const SKIP = /\b(skip|avoid|instead of|never|not|no)\b/i;
  const hits = nonEmpty([...CLEAN_J7].flatMap((id) => fresh(id).flatMap((v) => v.split(/[.!?;]/)).filter((s) => OIL.test(s) && !/\bcooked in\b/.test(s))), "new oil sentences", 3);
  for (const s of hits) assert.match(s, SKIP, s);
  for (const id of CLEAN_J7) assert.doesNotMatch(JSON.stringify(BECAME[id]), /saturated fat|debated|contested|Dietary Guidelines/i, id);
});

test("JC5 register terms land on their home cards; no organic in cart_pick", () => {
  const TERMS = {
    beans_dried_vs_canned: ["bpa-free lining", "non-bpa", "sprouted", "soak"],
    canned_coconut_milk: ["bpa-free lining", "non-bpa"],
    canned_soup: ["bpa-free lining", "non-bpa"],
    whole_spices: ["radura", "irradiat"],
  };
  for (const [id, terms] of Object.entries(TERMS)) for (const t of terms) assert.ok(textOf(live(id)).toLowerCase().includes(t), `${id} lacks ${t}`);
  for (const id of CLEAN_J7) assert.doesNotMatch(live(id).cart_pick ?? "", /organic/i, id);
});

test("JC5b no cost words in batch copy (plan C4); shopper-phrased fields are exempt", () => {
  const COST = /\b(cheap\w*|cost\w*|price\w*|pricing|budget|afford\w*|dollars?|value)\b/i;
  for (const id of CLEAN_J7) {
    const { sources, aliases, asked_as, question, ...copy } = live(id);
    assert.doesNotMatch(JSON.stringify(copy), COST, id);
  }
});

test("JC5c new lines carry no health, safety or treatment wording", () => {
  for (const id of CLEAN_J7) for (const v of nonEmpty(fresh(id), `${id} new lines`))
    assert.doesNotMatch(v, /\b(health\w*|safe\w*|protein|trans fats?|prevents?|cures?|causes?|lowers? risk|toxic\w*|cancer\w*|I|me|my)\b/i, `${id}: ${v}`);
});

test("JC6 every batch entry is lint-clean", () => {
  for (const id of CLEAN_J7) {
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
