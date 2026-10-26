// clean-sweep-J1 (2026-10-22, clean-pick final sweep): produce, potato and four picks, against the live stance flags at 52b0a8c.
// Rung rows move the decision (potato, frozen, peppers, green beans, cucumbers, egg whites); the rest add register
// avoid lines and archived sources only. cart_pick never moves. Older pins read these ids as of 52b0a8c (cartPlain.js preCleanJ1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { lintCard, lintPick } from '../../lib/counterCardLint.js';
import { projectEntry } from '../../lib/counterCards.js';
import { preFamilyCascade, CLEAN_J1, preCompleteness, notGap, CLEAN_J1_BASE, preCleanJ3, preCleanJ4, preCleanJ5, preCleanJ6, preCleanJ7, preCleanJ8, preCleanJ9, preDialed } from './cartPlain.js';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
// Later batches restore their own ids to the J1 commit (J3: preCleanJ3, J4: preCleanJ4, J5: preCleanJ5, J6: preCleanJ6, J7: preCleanJ7, J8: preCleanJ8, J9: preCleanJ9).
const raw = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const kb = { ...raw, entries: preFamilyCascade(raw.entries).filter(notGap).map(preCompleteness).map(preDialed).map(preCleanJ3).map(preCleanJ4).map(preCleanJ5).map(preCleanJ6).map(preCleanJ7).map(preCleanJ8).map(preCleanJ9) };
const base = JSON.parse(execFileSync('git', ['show', `${CLEAN_J1_BASE}:server/kristy_perimeter_kb.json`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const doLines = JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'));
const live = (id) => kb.entries.find((e) => e.id === id);
const was = (id) => base.entries.find((e) => e.id === id);
// Batches after J1 that edit these entries add their ids here.
const LATER = new Set([]);
const RUNG = new Set(['produce_root_vegetables', 'frozen_vs_fresh_produce', 'produce_peppers', 'produce_green_beans', 'pick_cucumbers', 'pick_egg_whites']);

// Every field J1 set, verbatim.
const BECAME = {
  "organic_worth_it_by_type": {
    "buying_tips": [
      "Residue sits on the skin, so a peel you throw away takes it with it.",
      "Above the seal: a local grower’s “grown without sprays”, the grower’s word, not a seal.",
      "The USDA Organic seal on the sign or sticker is the floor to read.",
      "One question at the shelf: does the skin get eaten? Berries, greens, apples, grapes and potatoes, yes. Those come first."
    ]
  },
  "frozen_vs_fresh_produce": {
    "decision": "Frozen bags listing only the food, picked ripe, then organic."
  },
  "produce_root_vegetables": {
    "decision": "Local potatoes labeled grown without sprays, fresh-dug, then organic.",
    "why": "Potatoes rank high for residue in USDA testing, and the skin often gets eaten."
  },
  "produce_peppers": {
    "decision": "Local or greenhouse peppers labeled grown without sprays.",
    "sources": [
      "UC Davis Postharvest Technology Center, Bell Pepper fact sheet, https://postharvest.ucdavis.edu/produce-facts-sheets/bell-pepper",
      "Michigan State University Extension, Michigan Fresh: Peppers, https://www.canr.msu.edu/resources/michigan_fresh_peppers",
      {
        "name": "EWG Shopper’s Guide to Pesticides in Produce 2026, summary",
        "url": "https://www.ewg.org/foodnews/summary.php"
      },
      {
        "name": "Certified Naturally Grown: FAQs",
        "url": "https://www.naturallygrown.org/faqs/"
      },
      {
        "name": "7 CFR 205.206, organic crop pest and weed management standard",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.206"
      },
      {
        "name": "Northwest Horticultural Council: Fruit Coatings (Wax)",
        "url": "https://nwhort.org/technicalbulletins/fruitcoatings/"
      }
    ],
    "watch_out": [
      "A dark, sunken lesion at the blossom end: blossom end rot.",
      "Shriveling, which is water loss from warm storage.",
      "Pitting, softening, or a discolored seed cavity after a long stay in the refrigerator: chilling injury.",
      "A glossy shine can be an added carnauba or shellac coating; look for uncoated peppers."
    ]
  },
  "produce_citrus": {
    "sources": [
      "UC Davis Postharvest Technology Center, Orange fact sheet, https://postharvest.ucdavis.edu/produce-facts-sheets/orange",
      "UC Davis Postharvest Technology Center, Lemon fact sheet, https://postharvest.ucdavis.edu/produce-facts-sheets/lemon",
      "UC Davis Postharvest Technology Center, Lime fact sheet, https://postharvest.ucdavis.edu/produce-facts-sheets/lime",
      "USDA SNAP-Ed Connection, Seasonal Produce Guide: Oranges, https://snaped.fns.usda.gov/resources/nutrition-education-materials/seasonal-produce-guide/oranges",
      "https://www.ams.usda.gov/sites/default/files/media/PDPAnnualSummary.pdf",
      {
        "name": "PMC: postharvest fungicides on citrus",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11989162/"
      },
      {
        "name": "Northwest Horticultural Council: Fruit Coatings (Wax)",
        "url": "https://nwhort.org/technicalbulletins/fruitcoatings/"
      }
    ],
    "watch_out": [
      "Drying and shriveling on lemons, dryness on limes: the fruit is past its best.",
      "Decay on any citrus.",
      "Grading an orange by color alone: degreening sets the color and says nothing about the inside.",
      "Conventional citrus is often treated after harvest with imazalil or thiabendazole fungicides on the peel; organic for zest.",
      "Citrus rind can carry an added carnauba or shellac coating; for zest, look for uncoated."
    ]
  },
  "produce_stone_fruit": {
    "sources": [
      "UC Davis Postharvest Technology Center, Nectarine & Peach fact sheet, https://postharvest.ucdavis.edu/produce-facts-sheets/peach",
      "UC Davis Postharvest Technology Center, Plum fact sheet, https://postharvest.ucdavis.edu/produce-facts-sheets/plum",
      "UC Davis Postharvest Technology Center, Cherry fact sheet, https://postharvest.ucdavis.edu/produce-facts-sheets/cherry",
      "Michigan State University Extension, Michigan Fresh: Peaches, https://www.canr.msu.edu/resources/michigan_fresh_peaches",
      "Michigan State University Extension, Michigan Fresh: Plums, https://www.canr.msu.edu/resources/michigan_fresh_plums",
      "Michigan State University Extension, Michigan Fresh: Cherries, https://www.canr.msu.edu/resources/michigan_fresh_cherries",
      "EWG Shopper’s Guide to Pesticides in Produce, full list, https://www.ewg.org/foodnews/full-list.php",
      "https://www.ewg.org/foodnews/dirty-dozen.php",
      {
        "name": "Certified Naturally Grown: FAQs",
        "url": "https://www.naturallygrown.org/faqs/"
      },
      {
        "name": "7 CFR 205.206, organic crop pest and weed management standard",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.206"
      },
      {
        "name": "EWG Shopper’s Guide to Pesticides in Produce 2026, summary",
        "url": "https://www.ewg.org/foodnews/summary.php"
      }
    ],
    "watch_out": [
      "Bruised or damaged fruit, on every sheet the first thing to leave behind.",
      "Plums stored in the 36 to 46°F range: mealiness, browning, and failure to ripen.",
      "Dents in cherries: pitting, thought to come from impact injury.",
      "Fludioxonil, a PFAS fungicide, showed up on nearly 90% of peaches and plums in EWG’s 2026 testing."
    ]
  },
  "pick_canned_tomatoes": {
    "avoid": "Skip cans without a BPA-free lining stated on the label."
  },
  "pick_cucumbers": {
    "decision": "Local or greenhouse cucumbers labeled grown without sprays, firm to the touch, else organic.",
    "avoid": "Pass on cucumbers coated with wax, shellac or carnauba.",
    "sources": [
      {
        "name": "Nebraska Extension: Cucumbers",
        "url": "https://food.unl.edu/article/cucumbers"
      },
      {
        "name": "Northwest Horticultural Council: Fruit Coatings (Wax)",
        "url": "https://nwhort.org/technicalbulletins/fruitcoatings/"
      }
    ]
  },
  "pick_juice": {
    "avoid": "Skip juice drinks listing benzoates, benzoic acid, BVO or artificial color.",
    "sources": [
      {
        "name": "FDA: What You Need to Know About Juice Safety",
        "url": "https://www.fda.gov/food/buy-store-serve-safe-food/what-you-need-know-about-juice-safety"
      },
      {
        "name": "CSPI: Artificial colorings (synthetic food dyes)",
        "url": "https://www.cspi.org/node/7436"
      },
      {
        "name": "CSPI: Sodium benzoate",
        "url": "https://www.cspi.org/node/7451"
      },
      {
        "name": "EWG: Beware of the chemical BVO in fruit-flavored drinks",
        "url": "https://www.ewg.org/news-insights/news/2025/04/beware-chemical-bvo-fruit-flavored-drinks"
      }
    ]
  },
  "produce_green_beans": {
    "decision": "Local, in-season beans labeled grown without sprays."
  },
  "pick_egg_whites": {
    "decision": "Whites from soy-free, corn-free pastured hens, then certified organic feed and outdoor access; pasteurized by law.",
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
      },
      {
        "name": "Cornucopia Institute: Egg Scorecard criteria",
        "url": "https://www.cornucopia.org/egg-scorecard-criteria/"
      }
    ]
  }
};

// P4 current owned-field pins; historical fixtures below still serve their archive guards.
const PILOT_FIELDS = {
  "pick_juice": {
    "sources": [
      {
        "name": "Weston A. Price Foundation",
        "url": "https://www.westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/"
      }
    ]
  }
};

test('JC0 the batch is the BECAME table, and every id exists at base', () => {
  assert.deepEqual(nonEmpty(Object.keys(BECAME), 'J1 ids', 11).toSorted(), [...CLEAN_J1].toSorted());
  for (const id of CLEAN_J1) assert.ok(was(id) && live(id), id);
});

test('JC1 each batch id carries its current owned fields', () => {
  for (const [id, fields] of Object.entries(BECAME)) {
    if (LATER.has(id)) continue;
    // retired: pilot merge replaced this batch's text (P4)
    for (const [f, value] of Object.entries({ ...fields, ...PILOT_FIELDS[id] })) assert.deepEqual(live(id)[f], value, `${id}.${f}`);
  }
});

test("JC2 pilot corpus size in the batch view and top-level metadata", () => {
  // retired: pilot merge replaced this batch's text (P4)
  assert.equal(kb.entries.length, 292);
  assert.deepEqual({ ...kb, entries: [] }, { ...base, entries: [] });
});

test("JC3 rung rows remain present", () => {
  // retired: pilot merge replaced this batch's text (P4)
  for (const id of RUNG) assert.ok(live(id), `${id} missing`);
});

test('JC4 potato: grown without sprays, then organic; firmness lives in the tips', () => {
  const e = live('produce_root_vegetables');
  assert.equal(e.decision, 'Local potatoes labeled grown without sprays, fresh-dug, then organic.');
  assert.doesNotMatch(e.decision, /\bfirm\b|carrot/i);
  assert.ok(nonEmpty(e.buying_tips, 'potato tips').some((t) => /^Potatoes: firm\b/.test(t)), 'firmness tip');
});

test('JC5 no decision leads with organic, and no cart_pick names it', () => {
  for (const id of RUNG) {
    const first = live(id).decision.split(/\s+first\b|,\s*(?:then|else)\b|;\s*then\b|\bnever\b/i)[0];
    assert.doesNotMatch(first, /\borganic\b/i, id);
  }
  for (const id of CLEAN_J1) assert.doesNotMatch(live(id).cart_pick ?? '', /organic/i, id);
});

test('JC6 every batch entry is lint-clean', () => {
  for (const id of CLEAN_J1) {
    const e = live(id);
    assert.deepEqual(e.kind === 'pick' ? lintPick(e) : lintCard(projectEntry(e, { doLine: doLines[id] || '' })), [], id);
  }
});

test('JC7 every new source URL is archived verbatim under docs/sources/concerns', () => {
  const url = (s) => s.url ?? s;
  const urls = nonEmpty(Object.entries(BECAME).flatMap(([id, f]) => (f.sources ?? []).map(url).filter((u) => !(was(id).sources ?? []).some((s) => url(s) === u))), 'new URLs', 7);
  const archive = execFileSync('grep', ['-rhF', 'url:', 'docs/sources/concerns'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
  for (const u of urls) assert.ok(archive.includes(u), `${u} not archived`);
});
