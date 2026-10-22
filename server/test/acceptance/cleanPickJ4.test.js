// clean-sweep-J4 (2026-10-22, clean-pick final sweep): seafood, against the live stance flags at 8bd7ba5.
// Seed/vegetable-oil sentences take a skip or not word (C20); shrimp names sulfur dioxide; asks name the counter;
// register terms land with archived sources. One rung row moves the decision (anchovies, off a lead 'plump').
// cart_pick never moves. Older pins read these ids as of 6d98564 (cartPlain.js preCleanJ4).
// Unflagged J4 ids (seafood_certifications, canned_tuna, clams_mussels_oysters) are untouched.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { lintCard, lintPick } from '../../lib/counterCardLint.js';
import { projectEntry } from '../../lib/counterCards.js';
import { CLEAN_J4, CLEAN_J4_BASE, preCleanJ5, preCleanJ6, preCleanJ7, preCleanJ8, preCleanJ9 } from './cartPlain.js';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const raw = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
// Later batches restore their own ids to the J4 commit (J5: preCleanJ5, J6: preCleanJ6, J7: preCleanJ7, J8: preCleanJ8, J9: preCleanJ9).
const kb = { ...raw, entries: raw.entries.map(preCleanJ5).map(preCleanJ6).map(preCleanJ7).map(preCleanJ8).map(preCleanJ9) };
const base = JSON.parse(execFileSync('git', ['show', `${CLEAN_J4_BASE}:server/kristy_perimeter_kb.json`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const doLines = JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'));
const live = (id) => kb.entries.find((e) => e.id === id);
const was = (id) => base.entries.find((e) => e.id === id);
// Batches after J4 that edit these entries add their ids here.
const LATER = new Set([]);
const RUNG = new Set(['pick_anchovies']);

// Every field J4 set, verbatim.
const BECAME = {
  "salmon_wild_vs_farmed": {
    "short_answer": "Two different animals sold under one name. Wild salmon eats krill and small fish across open ocean. Farmed salmon eats a ration of plant protein and vegetable oil, not krill.",
    "buying_tips": [
      "Farmed salmon eats plant protein and vegetable oil, not krill and small fish like wild.",
      "Sockeye and coho are almost always wild, and their color is deep because of diet, not dye.",
      "A 2004 Science study found 14 contaminants, PCBs and dioxins included, all higher in farmed salmon.",
      "Canned wild salmon comes next; for farmed salmon, read the country of origin.",
      "Frozen wild Alaskan is the same fish, frozen at its best. ‘Fresh’ at the counter is often previously-frozen, so ask."
    ],
    "science": "Farmed salmon eats a ration built largely on plant protein and vegetable oil, not krill and small fish. That leaves a worse omega-3 to omega-6 ratio. Its flesh comes out gray without added astaxanthin; sockeye and coho get their color from diet. Alaska law limits farming to shellfish and seaweeds, so Alaska salmon is not net-pen farmed. ‘Fresh’ at the counter is often previously frozen, which is not a downgrade.",
    "labels_decoded": [
      {
        "term": "Farm-raised",
        "meaning": "Required on the case label. On salmon it almost always means Atlantic in a pen."
      },
      {
        "term": "Wild-caught / Alaskan",
        "meaning": "Caught in the wild; Alaskan fisheries are well managed."
      },
      {
        "term": "Color added",
        "meaning": "Astaxanthin in the feed set the pink; farmed flesh is gray without it."
      }
    ],
    "sources": [
      "NOAA Fisheries / Seafood Watch",
      "USDA FoodData Central (fatty-acid composition)",
      "Alaska Sea Grant, University of Alaska Fairbanks “Aquaculture” https://alaskaseagrant.org/our-work/aquaculture/ (Alaska law limits aquatic farming to shellfish and seaweeds; salmon ranching by nonprofit hatcheries supplements, not replaces, wild stocks)",
      {
        "name": "WebMD via NBC News: Do risks of farmed salmon outweigh benefits?",
        "url": "https://www.nbcnews.com/id/wbna3980525"
      },
      {
        "name": "Monterey Bay Aquarium: Farmed salmon in Chile",
        "url": "https://www.montereybayaquarium.org/change-impact/our-conservation-work/global-ocean-conservation-programs/global-seafood-projects/farmed-salmon-in-chile"
      },
      {
        "name": "Quartz: Here is why your farmed salmon has color added to it",
        "url": "https://qz.com/358811/heres-why-your-farmed-salmon-has-color-added-to-it"
      }
    ]
  },
  "shrimp_imported_vs_domestic": {
    "buying_tips": [
      "Country of origin is printed by law, and wild American traces to a managed fishery.",
      "Second choice is pond-raised shrimp labeled Naturland or Aquaculture Stewardship Council; last is imported shrimp.",
      "A 2015 Consumer Reports test found antibiotics in 11 of 205 raw imported pond-raised samples, from Vietnam, Thailand and Bangladesh.",
      "Uniform size and a flawless look point to pond-raised; wild shrimp come in a wide range of sizes.",
      "‘Fresh’ at the case is nearly always thawed, so frozen raw is the same shrimp. Ask at the counter if it is dry, since wet shrimp holds extra water.",
      "Read the bag for the country of origin; the antibiotics Consumer Reports found were in imported shrimp raised on farms."
    ],
    "watch_out": [
      "Where wild American is not stocked, check for a BAP or ASC certification. A label alone is not proof; antibiotics showed on four samples carrying one common label.",
      "Consumer Reports found bacteria on 20 percent of raw U.S. wild samples and 42 to 83 percent of imported pond-raised. Cooking through kills most of it, yet 16 percent of cooked samples carried bacteria.",
      "A 2014 Oceana DNA test found 30 percent of shrimp labels misleading, with some pond-raised shrimp sold as wild. The Southern Shrimp Alliance, a domestic industry group, counts India, Indonesia and Vietnam first in FDA refusals for drug residues.",
      "Fresh, frozen, canned or dried shrimp may contain sulfites, such as sulfur dioxide. Check the label."
    ],
    "sources": [
      "NOAA Fisheries country-of-origin data",
      "Monterey Bay Seafood Watch",
      "North Carolina Sea Grant, Coastwatch “Curbing the Import Appetite: Selling American Shrimp in the U.S. Market” https://ncseagrant.ncsu.edu/coastwatch/curbing-the-import-appetite-selling-american-shrimp-in-the-u-s-market/ (pond-raised imports vs. wild-caught: flavor, size uniformity, appearance)",
      {
        "name": "Consumer Reports: Shrimp safety",
        "url": "https://www.consumerreports.org/cro/magazine/2015/06/shrimp-safety/index.htm"
      },
      {
        "name": "Southern Shrimp Alliance: FDA refusal report",
        "url": "https://shrimpalliance.com/august-2026-fda-antibiotic-contaminated-shrimp-import-refusal-report/"
      },
      {
        "name": "The Fish Site: STPP in fish",
        "url": "https://thefishsite.com/articles/warnings-of-sodium-tripolyphosphate-in-fish"
      },
      {
        "name": "UF/IFAS Extension: Sulfites, separating fact from fiction (FY731)",
        "url": "https://ask.ifas.ufl.edu/publication/FY731"
      }
    ]
  },
  "canned_fish_choosing": {
    "short_answer": "Read what it is packed in. Olive oil or water are the clean options. Skip tins in soybean, cottonseed or unnamed ‘vegetable oil’. Buy sardines and salmon with the bones and skin left in.",
    "detail": "Canned fish is one of the best value whole foods in the store, and the differences between tins are almost entirely the pack medium and what else went in. Oil-packed carries more flavor and, in good olive oil, is worth using in the dish rather than pouring away. Water-packed is leaner and neutral. ‘Vegetable oil’ on a tin is nearly always a seed oil blend and the label will not name which. Skin-on, bone-in sardines and salmon keep the whole small fish intact, which is much of why the tin is worth buying. Flavored tins in sauces bring added sugar and a long list, so read those like any packaged food. Skip soybean, cottonseed or unnamed ‘vegetable oil’ if seed oils are a line you hold. The ingredient list should read fish, oil or water, and salt; anything longer is a sauce.",
    "labels_decoded": [
      {
        "term": "Packed in vegetable oil (skip)",
        "meaning": "Nearly always a seed oil blend, and the tin will not name which."
      },
      {
        "term": "Packed in olive oil",
        "meaning": "Check it says olive oil, not ‘olive oil blend’."
      },
      {
        "term": "Skinless, boneless",
        "meaning": "Both removed. Convenient, and it takes out the part that makes a whole small fish worth eating."
      }
    ]
  },
  "farmed_fish_by_species": {
    "buying_tips": [
      "Mussels and oysters filter their food from the water and need no feed.",
      "Mussels, oysters and clams are farmed almost everywhere and need no feed.",
      "Farmed trout, arctic char and barramundi are generally well regarded.",
      "For salmon and shrimp, ask the counter for the country, and look for a credible certification.",
      "Country-of-origin is required on unprocessed seafood. Read it.",
      "‘Farmed’ alone is not a verdict. The species and the operation are the question.",
      "On ‘farm raised’ salmon, read the country: Chile uses more antibiotics than any other salmon-farming country."
    ]
  },
  "white_fish": {
    "short_answer": "Ask the counter which species it is, since a fillet is hard to identify by eye. Then look for shiny, firm flesh that springs back, a mild sea smell, and no dried or dark edges.",
    "buying_tips": [
      "A fillet is hard to identify by eye, so the species name does that work.",
      "Look for how it was caught and the species, on the sign or label.",
      "Ask the counter which species the fillet is.",
      "Press the flesh and check that it springs back.",
      "Skip fillets with dried, dark or discolored edges.",
      "Dry packed fillets: see Scallops."
    ],
    "pick_steps": [
      "Ask the counter for the species; a fillet is hard to identify by eye.",
      "Press it: firm flesh springs back, with no dried or dark edges.",
      "Take a piece with a mild sea smell."
    ]
  },
  "smoked_salmon": {
    "buying_tips": [
      "Shelf-stable smoked fish is heat-treated and sealed; nova and lox rely on the cold.",
      "Look for wild-caught on the pack, and no ‘color added’ line.",
      "Choose smoked wild salmon first. For farmed smoked salmon, read the country of origin.",
      "Wild salmon get their color from krill and shrimp. Farmed salmon flesh is gray until astaxanthin in the feed sets the pink, which ‘color added’ means.",
      "Pick it from a refrigerated case and put it in the fridge soon after buying.",
      "Choose canned or jarred smoked fish to keep on the shelf.",
      "Skip packs listing liquid smoke or smoke flavoring; look for wood-smoked.",
      "On a pack marked ‘farm raised’, read the country; a 2004 study found farmed salmon higher in PCBs and dioxins."
    ],
    "sources": [
      "https://www.cdc.gov/listeria/causes/meat-fish.html",
      "https://www.fda.gov/food/buy-store-serve-safe-food/selecting-and-serving-fresh-and-frozen-seafood-safely",
      "https://extension.umaine.edu/publications/3110e/",
      {
        "name": "Quartz: Here is why your farmed salmon has color added to it",
        "url": "https://qz.com/358811/heres-why-your-farmed-salmon-has-color-added-to-it"
      },
      {
        "name": "Iowa State Extension AnswerLine: Liquid smoke",
        "url": "https://blogs.extension.iastate.edu/answerline/2019/04/18/liquid-smoke-that-controversial-condiment/"
      },
      {
        "name": "WebMD via NBC News: Do risks of farmed salmon outweigh benefits?",
        "url": "https://www.nbcnews.com/id/wbna3980525"
      }
    ]
  },
  "seafood_counter": {
    "short_answer": "Name the species, then ask the counter where it came from and whether it was farmed. Fish should sit refrigerated or on a thick bed of ice. It should smell mild, and cooked seafood sits apart from raw.",
    "buying_tips": [
      "Red gills mean recently slaughtered; brown, gray or green means past fresh.",
      "Ask the counter for the species name.",
      "Ask the counter where it came from and whether it was farmed.",
      "Check that the fish sits on ice or in a refrigerated case.",
      "Check that cooked seafood is kept apart from raw.",
      "Ask the counter ‘was this previously frozen?’ The answer is often yes.",
      "Buy frozen and thaw at home on your own schedule.",
      "Don’t re-freeze fish that was sold thawed.",
      "Smell it. Clean and briny is right. Sharp, fishy or ammonia is not.",
      "Whole fish: clear domed eyes, bright red gills, tight scales, flesh that springs back.",
      "Fillets: a translucent sheen, flakes holding together, no browning at the edge.",
      "It should sit on plenty of ice, not in a pool of its own liquid.",
      "Ask the counter when it came in and whether it was previously frozen. Both are fair questions.",
      "At the counter, ask for dry packed scallops and fillets; ‘wet’ means soaked in sodium tripolyphosphate, which adds water weight.",
      "Tuna labeled ‘tasteless smoke’ or ‘treated with carbon monoxide’ stays red as it ages; untreated tuna browns.",
      "FDA’s fish chart lists canned light tuna, skipjack included, as a Best Choice; albacore is a Good Choice."
    ],
    "sources": [
      "https://www.fda.gov/food/buy-store-serve-safe-food/selecting-and-serving-fresh-and-frozen-seafood-safely",
      "https://extension.umaine.edu/publications/3110e/",
      "https://hgic.clemson.edu/factsheet/safe-handling-of-seafood/",
      "https://www.fda.gov/food/seafood-guidance-documents-regulatory-information/fda-dna-testing-wholesale-level-evaluate-proper-labeling-seafood-species",
      "https://www.fisheries.noaa.gov/insight/noaas-seafood-inspection-program",
      "https://www.americastestkitchen.com/lessons/articles/431-buying-and-storing-white-fish",
      "NOAA Fisheries handling guidance",
      "USDA/FDA seafood storage guidance",
      "Alaska Longline Fishermen’s Association “Why Frozen?” https://www.alfafish.org/why-frozen (frozen rapidly to at least -10° F in a few hours of catch, often fresher than ‘fresh’ fish after days in transit)",
      "Whidbey Seafoods “Why Flash-Frozen Seafood Is the Freshest Choice You Can Make” https://whidbeyseafoods.com/blogs/education/why-flash-frozen-seafood-is-the-freshest-choice-you-can-make (frozen almost immediately after being caught, often right on the boat; rapid freezing locks in freshness, flavor and nutrients, and no large ice crystals form, so texture and integrity remain)",
      "FDA Fish and Fishery Products Hazards and Controls Guidance (sensory evaluation)",
      "NOAA Fisheries seafood handling guidance",
      "Nofima “How to check how fresh fish is” https://nofima.com/worth-knowing/how-to-check-how-fresh-fish-is/ (gills as the single best freshness check; eye and skin sheen; the date alone is not reliable)",
      "The Fish Site “Warnings of sodium tripolyphosphate in fish” https://thefishsite.com/articles/warnings-of-sodium-tripolyphosphate-in-fish",
      "Nordic Catch “Tuna treated with carbon monoxide” https://nordiccatch.com/blogs/news/tuna-treated-with-carbon-monoxide",
      "FDA “Advice about Eating Fish” https://www.fda.gov/food/consumers/advice-about-eating-fish (Best Choices list: canned light tuna, skipjack included; albacore a Good Choice)"
    ]
  },
  "pick_fish_sticks": {
    "avoid": "Skip Vietnam swai or basa; critics call ‘MSC certified’ a low bar.",
    "sources": [
      {
        "name": "Cornell LII: 21 CFR § 102.45 Fish sticks or portions made from minced fish",
        "url": "https://www.law.cornell.edu/cfr/text/21/102.45"
      },
      {
        "name": "Monterey Bay Aquarium Seafood Watch: Catfish and pangasius buying guide",
        "url": "https://www.montereybayaquarium.org/animals-the-ocean/how-to-choose-sustainable-seafood/sustainable-seafood-guides/catfish-and-pangasius-buying-guide"
      },
      {
        "name": "SeafoodSource: Multiple groups call newest Marine Stewardship Council standards too lax",
        "url": "https://www.seafoodsource.com/news/environment-sustainability/multiple-groups-call-newest-marine-stewardship-council-standards-too-lax"
      }
    ]
  },
  "pick_anchovies": {
    "decision": "Anchovy fillets packed in olive oil or salt, plump, in a tin or jar."
  }
};

test('JC0 the batch is the BECAME table, and every id exists at base', () => {
  assert.deepEqual(nonEmpty(Object.keys(BECAME), 'J4 ids', 9).toSorted(), [...CLEAN_J4].toSorted());
  for (const id of CLEAN_J4) assert.ok(was(id) && live(id), id);
});

test('JC1 each batch id equals its base entry with only the BECAME fields set', () => {
  for (const [id, fields] of Object.entries(BECAME)) {
    if (LATER.has(id)) continue;
    assert.deepEqual(live(id), { ...was(id), ...fields }, id);
  }
});

test('JC2 every entry outside the batch is byte-equal to base', () => {
  const others = nonEmpty(kb.entries.filter((e) => !CLEAN_J4.has(e.id)), 'non-batch entries', 200);
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of others) assert.deepEqual(e, was(e.id), e.id);
});

test('JC3 decision moves only on rung rows; cart_pick never moves', () => {
  for (const id of CLEAN_J4) {
    if (LATER.has(id)) continue;
    assert.equal(live(id).cart_pick, was(id).cart_pick, `${id} cart_pick`);
    if (!RUNG.has(id)) assert.equal(live(id).decision, was(id).decision, `${id} decision`);
    else assert.notEqual(live(id).decision, was(id).decision, `${id} rung row kept its decision`);
  }
  assert.doesNotMatch(live('pick_anchovies').decision, /^plump\b/i);
});

test('JC4 every vegetable/seed oil sentence carries a skip word; shrimp names sulfur dioxide', () => {
  const OIL = /\b(vegetable|seed|soybean|cottonseed|canola) oils?\b/i;
  const SKIP = /\b(skip|avoid|instead of|never|not|no)\b/i;
  const hits = nonEmpty(['salmon_wild_vs_farmed', 'canned_fish_choosing'].flatMap((id) => JSON.stringify(live(id)).split(/[.!?;]/).filter((s) => OIL.test(s))), 'oil sentences', 6);
  for (const s of hits) assert.match(s, SKIP, s);
  assert.ok(live('shrimp_imported_vs_domestic').watch_out.some((w) => /sulfur dioxide/.test(w)));
});

test('JC5 no rung decision leads with organic, and no cart_pick names it', () => {
  for (const id of RUNG) assert.doesNotMatch(live(id).decision, /^organic\b/i, id);
  for (const id of CLEAN_J4) assert.doesNotMatch(live(id).cart_pick ?? '', /organic/i, id);
});

test('JC6 every batch entry is lint-clean', () => {
  for (const id of CLEAN_J4) {
    const e = live(id);
    assert.deepEqual(e.kind === 'pick' ? lintPick(e) : lintCard(projectEntry(e, { doLine: doLines[id] || '' })), [], id);
  }
});

test('JC7 every new source URL is archived verbatim under docs/sources', () => {
  const urlOf = (s) => (s.url ?? String(s).match(/https?:\/\/\S+/)?.[0]);
  const urls = nonEmpty(Object.entries(BECAME).flatMap(([id, f]) => (f.sources ?? []).map(urlOf).filter((u) => u && !(was(id).sources ?? []).some((s) => urlOf(s) === u))), 'new URLs', 7);
  const archive = execFileSync('grep', ['-rhiE', '^(url: *)?https?://', 'docs/sources'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
  for (const u of urls) assert.ok(archive.includes(u), `${u} not archived`);
});
