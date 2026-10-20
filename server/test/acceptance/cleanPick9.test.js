// clean-pick-9 (Devon 2026-10-20, beyond-organic stance): B9, the organic teaching cards and most-sprayed produce lead with grown-without-sprays and local rungs; organic is the floor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { CLEAN_PICK_10, preCleanPick11, preCleanPick12, preCleanPick8, prePickAvoid } from './twoLinePin.js';
import { lintCard, lintPick } from '../../lib/counterCardLint.js';
import { projectEntry } from '../../lib/counterCards.js';

const BASE = '96d61e2';
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const git = (ref) => execFileSync('git', ['show', ref], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
import { preT6_1 } from "./twoLinePin.js";
kb.entries = kb.entries.map(preT6_1); // t6-1: the 15 meat/seafood cards read as of 85c399e; t6_1.test.js owns them now
const base = JSON.parse(git(`${BASE}:server/kristy_perimeter_kb.json`));
const doLines = JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'));
const find = (k, id) => k.entries.find((e) => e.id === id);
const live = (id) => find(kb, id);
const was = (id) => find(base, id);
// Batches after B9 that edit these entries add their ids here.
const LATER = new Set([...CLEAN_PICK_10]);

// Every field B9 set, verbatim.
const SET = {
  "organic_worth_it_by_type": {
    "decision": "Grown without sprays first on skin-on produce, then organic.",
    "short_answer": "A local grower’s “grown without sprays” on skin-on produce first, then organic. When organic runs thin, start with what gets eaten skin-on: berries, greens, apples, grapes, potatoes. Peeled fruit like avocado, kiwi, mango and citrus can wait.",
    "kristy_take": "Organic is the floor across the produce aisle, and a local grower who sprays nothing sits above it. An avocado or kiwi can feel delicate and still have a peel you throw away, so it waits when organic runs short.",
    "pick_steps": [
      "On skin-on produce, look for “grown without sprays” from a local grower, then organic.",
      "When organic runs short, start with skin-on produce: berries, greens, apples, grapes, potatoes.",
      "Read the USDA Organic seal as the floor; Natural means nothing on produce."
    ],
    "tier_note": "Surface residue on berries and greens eaten whole is a credible concern, so they come first.",
    "buying_tips": [
      "Residue sits on the skin, so a peel you throw away takes it with it.",
      "Above the seal: a local grower’s “grown without sprays”, the grower’s word, not a seal.",
      "The USDA Organic seal on the sign or sticker is the floor to read.",
      "Ask one question at the shelf: does the skin get eaten? Berries, greens, apples, grapes and potatoes, yes. That is where the money goes."
    ],
    "watch_out": [
      "When organic runs short, go by the SKIN, not how thick it feels. Avocado and kiwi read as delicate and get peeled, so they can wait. A potato reads as sturdy and gets eaten skin-on, so it cannot.",
      "Sturdy vegetables eaten whole are the gap the skin rule does not cover. Asparagus, cabbage, cauliflower, mushrooms and carrots test low, so they can wait when organic runs short.",
      "Organic is not pesticide-free. It is a different approved list: copper, spinosad and pyrethrins are all permitted organic pesticides. The claim is fewer synthetic residues, never none.",
      "Fludioxonil, a fungicide also identified as a PFAS, was the pesticide found most often in EWG’s 2026 produce testing summary."
    ],
    "detail": "The surface-residue reasoning is sound as a prioritization tool: the peel carries the residue, so what gets discarded carries it away. Organic is not the finish line: the standard still permits approved sprays when other controls fall short, so a local grower who grows without sprays sits above it. Avocado tests among the cleanest produce in the country. The part that was sprayed is the part that goes in the bin. Anything peeled goes in plain, however soft it looks. Avocado, kiwi, mango, banana, citrus and onion all test low. Soak the conventional eaten-whole ones. A baking soda soak takes more surface residue off than a rinse.",
    "science": "Residue sits on the surface, so the part that gets peeled takes it away. A potato is eaten skin-on, so it counts; sturdy vegetables like cabbage and carrots test low anyway. Organic is not pesticide-free, just a different approved list with fewer synthetic residues. A grower who uses no sprays at all sits above the seal.",
    "sources": [
      "USDA Pesticide Data Program",
      "EWG Shopper's Guide to Pesticides in Produce (2025)",
      "Environmental Working Group “The Clean Fifteen” https://www.ewg.org/foodnews/clean-fifteen.php",
      "Environmental Working Group “Shopper’s Guide to Pesticides in Produce, full list” https://www.ewg.org/foodnews/full-list.php",
      {
        "name": "7 CFR 205.206, organic crop pest and weed management standard",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.206"
      },
      {
        "name": "EWG Shopper’s Guide to Pesticides in Produce 2026, summary",
        "url": "https://www.ewg.org/foodnews/summary.php"
      },
      {
        "name": "Certified Naturally Grown: FAQs",
        "url": "https://www.naturallygrown.org/faqs/"
      }
    ]
  },
  "label_organic_scope": {
    "decision": "Organic as the floor; the seal still allows approved sprays.",
    "buying_tips": [
      "The seal covers inputs and practices, and an organic cookie is still a cookie.",
      "Organic is about inputs and practices. Read the ingredient panel separately.",
      "It is not pesticide-free; a short list of approved sprays, some synthetic, is permitted.",
      "It carries the most weight on thin-skinned produce you eat whole, and the least on processed food.",
      "On animal products it does reach feed. It means organic feed, not a different kind of feed.",
      "Real Organic Project on top of the USDA seal means soil-grown, never hydroponic."
    ],
    "watch_out": [
      "Organic is not pesticide-free. A short list of approved sprays, some synthetic, is permitted.",
      "It is a production standard, not a quality grade. An organic cookie is still a cookie.",
      "“Made with organic ___” needs only 70%, and cannot carry the USDA seal.",
      "Hydroponic crops can carry the USDA Organic seal, grown in water rather than soil."
    ],
    "detail": "The National Organic Program defines organic as a set of permitted and prohibited INPUTS and practices, verified by certification. That is a real, enforced standard and worth something. What it is not is a nutrition claim: the seal is silent on whether the food is nutrient-dense or minimally processed, and ultra-processed foods can carry it in full compliance. Reading it as a shorthand for “good food” is the most common way it gets misused. Organic tells you how something was grown or raised, and you still have to look at what the thing actually is. Certified organic means no synthetic pesticides from the prohibited list. It does not mean pesticide-free (a short list of approved sprays, some synthetic, is permitted), and it makes no claim at all about nutrient density, how well an animal was raised beyond the baseline, or how processed the food is. Organic is a floor, not the finish line: a grower who uses no sprays sits above it, and hydroponic crops can carry the seal too.",
    "science": "Certified organic is a production standard, not a quality grade. It means no synthetic pesticides from the prohibited list, no GMOs, and organic feed for animals. It is not pesticide-free; a short list of approved sprays, some synthetic, is permitted. It makes no claim about nutrient density or how processed the food is. An organic cookie is still a cookie.",
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
      }
    ]
  },
  "label_nonGMO_vs_organic": {
    "detail": "The ‘Non-GMO Project Verified’ butterfly is a single-issue claim: no genetically-engineered ingredients. USDA Organic covers that and much more. Also worth knowing: ‘non-GMO’ on a food with no GMO version (like non-GMO salt or oats) is marketing noise. Organic includes non-GMO; non-GMO doesn’t include organic.",
    "science": "Certified-organic food is also non-GMO. Organic also restricts synthetic pesticides and fertilizers and requires certain practices. A non-GMO seal addresses genetic engineering only. It says nothing about pesticides, feed or practices."
  },
  "produce_apples_pears": {
    "decision": "Local in-season apples and pears, labeled grown without sprays.",
    "buying_tips": [
      "Bruised fruit makes the sound fruit beside it ripen and rot faster.",
      "Look for “grown without sprays” or Certified Naturally Grown; the first is the grower’s word, not a seal.",
      "Organic is the fallback, and the organic standard still permits approved sprays when other pest controls fall short.",
      "Apples: firm and crisp, free of bruising, decay, cracks, and insect injury.",
      "Pears: free of bruising, insect damage, and decay; a firm green Bartlett ripens off the tree.",
      "Store in the dark at 30 to 32°F, up to 40°F, in a ventilated box or a perforated bag.",
      "Do not wash before storing; the moisture hastens decay.",
      "McIntosh and Honeycrisp: store at 38°F, since they are prone to chilling injury.",
      "Refrigerated apples keep up to a month."
    ],
    "watch_out": [
      "Bruised or damaged fruit stored with sound fruit: it makes the sound fruit ripen and rot faster.",
      "A pear ripened on the tree turns mealy; Bartletts are meant to be picked green.",
      "Gala softens quickly when it is not cooled.",
      "A high shine can be an added coating of carnauba or shellac, applied after washing strips the natural wax."
    ],
    "sources": [
      "Oregon State University Extension, Picking and storing apples and pears (FS 147), https://extension.oregonstate.edu/gardening/fruit-vegetable/picking-storing-apples-pears",
      "UC Davis Postharvest Technology Center, Apple (Gala) fact sheet, https://postharvest.ucdavis.edu/produce-facts-sheets/apple-gala",
      "UC Davis Postharvest Technology Center, Pear (Bartlett) fact sheet, https://postharvest.ucdavis.edu/produce-facts-sheets/pear-bartlett",
      "Michigan State University Extension, Michigan Fresh: Apples, https://www.canr.msu.edu/resources/michigan_fresh_apples",
      "Michigan State University Extension, Michigan Fresh: Pears, https://www.canr.msu.edu/resources/michigan_fresh_pears",
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
        "name": "Northwest Horticultural Council: Fruit Coatings",
        "url": "https://nwhort.org/technicalbulletins/fruitcoatings/"
      }
    ]
  },
  "produce_stone_fruit": {
    "decision": "In-season local peaches, plums and cherries labeled grown without sprays.",
    "buying_tips": [
      "A bruise stays for good, and peaches and cherries both make the Dirty Dozen.",
      "In season, look for a local farm’s “grown without sprays”, the grower’s word, not a seal; at a market, ask.",
      "Organic stone fruit is the fallback; the organic list still allows approved sprays when other controls fail.",
      "Peaches and nectarines: ground color gone from green to yellow, no bruises or damage.",
      "Plums: skin color turned for the variety, no bruises or damage.",
      "Cherries: full color across the surface, green fleshy stems, no cracks, pecks, or shriveling.",
      "Store just above freezing, 30.5 to 32°F; cherries at or below 41°F.",
      "Plums that still need to ripen: keep them out of the 36 to 46°F range.",
      "Skin staining on a peach or nectarine is cosmetic; a bruise is not."
    ],
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
      }
    ]
  },
  "produce_peppers": {
    "decision": "Firm local or greenhouse peppers labeled grown without sprays.",
    "tier_note": "Peppers rank high for pesticide residue in testing, and the skin gets eaten.",
    "buying_tips": [
      "A firm pepper still holds its water; wrinkled skin means it dried out in storage.",
      "Look for peppers labeled “grown without sprays”, the grower’s word, not a seal; greenhouse alone does not say it.",
      "Organic peppers are the fallback; organic growers may still use approved sprays when other controls fail.",
      "Firm, with uniform shape, size, and color for the variety.",
      "Colored peppers: at least half of the surface colored.",
      "Free of cracks, decay, sunburn, disease, or insect damage.",
      "Skip a bruised or damaged pepper.",
      "Store around 45°F where possible; at 41°F, plan on about two weeks.",
      "Red, yellow, and orange peppers tolerate the cold better than green."
    ],
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
      }
    ]
  },
  "produce_green_beans": {
    "decision": "Crisp, slender local beans labeled grown without sprays.",
    "tier_note": "Green beans rank high for pesticide residue, and the whole pod gets eaten.",
    "buying_tips": [
      "Bulging seeds mean an older bean, turning tough, stringy and starchy.",
      "Look for local, in-season beans labeled “grown without sprays”, the grower’s word, not a seal.",
      "Organic beans, fresh or frozen, are the fallback; the organic list still permits approved sprays.",
      "Pick smooth, slender pods with no seeds bulging through.",
      "Leave beans with brown or rust spots behind.",
      "Store them cold and cook them within five days."
    ],
    "sources": [
      "https://ohioline.osu.edu/factsheet/hyg-5509",
      "https://spendsmart.extension.iastate.edu/?p=1508",
      "https://extension.umaine.edu/publications/4255e/",
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
      }
    ]
  },
  "produce_citrus": {
    "watch_out": [
      "Drying and shriveling on lemons, dryness on limes: the fruit is past its best.",
      "Decay on any citrus.",
      "Grading an orange by color alone: degreening sets the color and says nothing about the inside.",
      "Conventional citrus is often treated after harvest with imazalil or thiabendazole fungicides on the peel; organic for zest."
    ],
    "sources": [
      "UC Davis Postharvest Technology Center, Orange fact sheet, https://postharvest.ucdavis.edu/produce-facts-sheets/orange",
      "UC Davis Postharvest Technology Center, Lemon fact sheet, https://postharvest.ucdavis.edu/produce-facts-sheets/lemon",
      "UC Davis Postharvest Technology Center, Lime fact sheet, https://postharvest.ucdavis.edu/produce-facts-sheets/lime",
      "USDA SNAP-Ed Connection, Seasonal Produce Guide: Oranges, https://snaped.fns.usda.gov/resources/nutrition-education-materials/seasonal-produce-guide/oranges",
      "https://www.ams.usda.gov/sites/default/files/media/PDPAnnualSummary.pdf",
      {
        "name": "PMC: postharvest fungicides on citrus",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11989162/"
      }
    ]
  },
  "produce_seasonality": {
    "decision": "In-season produce from a small local grower, or frozen off-season.",
    "buying_tips": [
      "In season, it travels less and reaches you closer to ripe, so it tastes better.",
      "A small grower over a national label: at a farmers’ market, ask how the crop was grown.",
      "Organic in season is the fallback, fresh or frozen.",
      "The cheapest, most abundant produce this week is usually what’s in season.",
      "Off-season, reach for frozen instead of sad ‘fresh’.",
      "Farmers’ markets are a fast read on what’s actually in season locally.",
      "Spring: asparagus, peas, radishes, artichokes, strawberries, tender greens.",
      "Summer: tomatoes, corn, zucchini, peppers, cucumbers, stone fruit, melon, berries.",
      "Autumn: winter squash, sweet potatoes, apples, pears, brussels sprouts, grapes.",
      "Winter: citrus, cabbage, kale, leeks, beets, parsnips, storage onions and potatoes.",
      "Storage crops (apples, onions, potatoes, squash, carrots) stay good long past their season."
    ],
    "sources": [
      "USDA Agricultural Marketing Service shipping-point season data",
      "USDA seasonal produce guides",
      "Michigan State University Extension “A How-To Guide to Eating for the Season” https://www.canr.msu.edu/news/a_how_to_guide_to_eating_for_the_season",
      {
        "name": "Certified Naturally Grown: FAQs",
        "url": "https://www.naturallygrown.org/faqs/"
      }
    ]
  },
  "produce_root_vegetables": {
    "decision": "Firm local potatoes and carrots labeled grown without sprays.",
    "tier_note": "Potatoes rank high for residue in USDA testing, and carrots rank low.",
    "buying_tips": [
      "Potatoes rank high for residue in USDA testing, and the skin often gets eaten.",
      "Look for local potatoes labeled “grown without sprays”, the grower’s word, not a seal.",
      "Organic is the fallback for potatoes and carrots; the standard still permits approved sprays.",
      "Potatoes: firm, with no bruises, nicks, or soft spots.",
      "Carrots: firm and well colored. With the tops on, choose bright green, fresh-looking tops.",
      "Sweet potatoes: smooth and firm, even in shape and size, peel color even for the variety, free of damage.",
      "Beets: firm and round with a slender tap root. The leaves on top say nothing certain about the root. Wilted leaves say little as long as the root is firm.",
      "Potatoes: a cool, dark, ventilated place, 45 to 50°F, for up to a month.",
      "Carrots: a closed bag or container in the refrigerator, tops removed, up to two weeks. A wilted carrot revives in cold water.",
      "Beets: stem trimmed to an inch, root end left on, refrigerated in a food-safe container up to two weeks."
    ],
    "watch_out": [
      "A green tint, shriveling, or many sprouts on a potato: throw it away.",
      "Green shoulders, wilt, flab, or cracks on a carrot.",
      "Sweet potatoes kept cold take chilling injury: decay, internal browning, and shriveling. Cool and dry, never the refrigerator.",
      "Stored potatoes are often treated with chlorpropham, a post-harvest sprout inhibitor, so fresh-dug local potatoes come first."
    ],
    "detail": "Potatoes keep up to a month in a cool, dark place with good ventilation, ideally 45 to 50°F. Throw away any that turn shriveled or green or grow many sprouts. Sweet potatoes want cool and dry, 55 to 59°F: colder brings chilling injury (fungal decay, internal browning, shriveling) and warmer speeds sprouting. Carrots go in a closed bag or container in the refrigerator for up to two weeks. Cut the tops off first, since attached tops wilt the root, and a wilted carrot revives in a soak of cold water. Beets: trim the leafy stem to an inch, leave the root end on, and refrigerate in a food-safe container for up to two weeks. Carrots also sit on EWG’s Clean Fifteen, a standard ranking residues from USDA data, among the items with the lowest pesticide residues. Carrots rank among the lowest for pesticide residue. Potatoes rank high for residue in USDA testing and carrots rank low, so the bag decides.",
    "sources": [
      "Michigan State University Extension, Michigan Fresh: Selecting and Storing Potatoes, https://www.canr.msu.edu/resources/michigan_fresh_selecting_and_storing_potatoes_e3079",
      "University of Maine Cooperative Extension, Carrots 101, https://extension.umaine.edu/publications/carrots-101/",
      "UC Davis Postharvest Technology Center, Sweet Potato fact sheet, https://postharvest.ucdavis.edu/produce-facts-sheets/sweet-potato",
      "Ohio State University Extension, Selecting, Storing, and Serving Ohio Beets (HYG-5510), https://ohioline.osu.edu/factsheet/hyg-5510",
      "EWG Shopper’s Guide to Pesticides in Produce, full list, https://www.ewg.org/foodnews/full-list.php",
      "https://www.ewg.org/foodnews/dirty-dozen.php",
      "https://www.ewg.org/foodnews/clean-fifteen.php",
      {
        "name": "Certified Naturally Grown: FAQs",
        "url": "https://www.naturallygrown.org/faqs/"
      },
      {
        "name": "7 CFR 205.206, organic crop pest and weed management standard",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.206"
      },
      {
        "name": "University of Idaho: chlorpropham (CIPC) sprout inhibitor in potato storage",
        "url": "https://content-hub.uidaho.edu/api/public/content/98db1601ff1d433da66ee73c42117ec6?v=ed199f61"
      }
    ]
  },
  "pick_celery": {
    "decision": "Celery labeled grown without sprays from a local grower, else organic, with crisp stalks."
  },
  "pick_cucumbers": {
    "decision": "Firm cucumbers labeled grown without sprays from a local or greenhouse grower, else organic."
  }
};
const IDS = Object.keys(SET);
const RETIRED = ['buy conventional and eat more', 'generally within legal limits', 'conventional is fine there', 'separate, debated question'];
const urls = (e) => (e.sources || []).map((s) => (typeof s === 'string' ? s : s.url)).filter(Boolean);

test('C1 every B9 field equals the set value and nothing else on the 12 entries moved', () => {
  nonEmpty(IDS, 'B9 ids', 12);
  for (const id of IDS) {
    assert.ok(live(id) && was(id), `${id} missing`);
    nonEmpty(Object.keys(SET[id]), `${id} fields`, 1);
    for (const [f, v] of Object.entries(SET[id])) assert.deepEqual(live(id)[f], v, `${id}.${f}`);
    assert.deepEqual(prePickAvoid(live(id)), { ...structuredClone(was(id)), ...structuredClone(SET[id]) }, id);
  }
});

test('C2 every entry outside B9 deepEquals 96d61e2; count and top-level keys unchanged', () => {
  const others = kb.entries.map(prePickAvoid).map(preCleanPick8).map(preCleanPick12).map(preCleanPick11).filter((e) => !IDS.includes(e.id) && !LATER.has(e.id));
  nonEmpty(others, 'others', 189);
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of others) assert.deepEqual(e, was(e.id), e.id);
  assert.deepEqual(Object.keys(kb).sort(), Object.keys(base).sort());
  for (const k of Object.keys(base)) if (k !== 'entries') assert.deepEqual(kb[k], base[k], k);
});

test('C3 the projected cards and picks lint clean', () => {
  for (const id of IDS) {
    const e = live(id);
    if (id.startsWith('pick_')) {
      assert.deepEqual(lintPick(e), [], `${id} lintPick`);
      assert.deepEqual(lintCard(e), [], `${id} lintCard`);
    } else {
      assert.deepEqual(lintCard(projectEntry(e, { doLine: doLines[id] || '' })), [], `${id} lintCard`);
    }
  }
});

test('C4 the four retired reassurance phrases are gone from the whole KB', () => {
  const text = JSON.stringify(kb).toLowerCase();
  nonEmpty(kb.entries, 'kb entries', 200);
  for (const p of RETIRED) assert.equal(text.split(p).length - 1, 0, p);
});

test('C5 every source URL new in B9 is archived verbatim under docs/sources/', () => {
  const files = [];
  const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : files.push(p); } };
  walk(join(ROOT, 'docs/sources'));
  const archive = files.map((f) => readFileSync(f, 'utf8')).join('\n');
  const fresh = IDS.flatMap((id) => urls(live(id)).filter((u) => !urls(was(id)).includes(u)));
  nonEmpty(fresh, 'new B9 urls', 5);
  for (const u of fresh) assert.ok(archive.includes(u), u);
});

test('C6 the concern register carries the chlorpropham (CIPC) row with its archived source', () => {
  const reg = readFileSync(join(ROOT, 'docs/CONCERN-REGISTER.md'), 'utf8');
  const row = reg.split('\n').find((l) => l.startsWith('| `') && /chlorpropham \(CIPC\)/.test(l));
  assert.ok(row, 'CIPC row');
  assert.match(row, /produce_seafood\/uidaho-cipc-sprout-inhibitor\.md` STRONG/);
  assert.match(row, /produce_root_vegetables/);
  assert.ok(statSync(join(ROOT, 'docs/sources/concerns/produce_seafood/uidaho-cipc-sprout-inhibitor.md')).size > 0);
});

test('C7 produce_citrus and label_nonGMO_vs_organic keep their 96d61e2 decision and cart_pick', () => {
  for (const id of ['produce_citrus', 'label_nonGMO_vs_organic']) {
    assert.equal(live(id).decision, was(id).decision, `${id} decision`);
    assert.deepEqual(live(id).cart_pick, was(id).cart_pick, `${id} cart_pick`);
  }
});
