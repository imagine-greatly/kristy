// clean-pick-10 (Devon 2026-10-20, beyond-organic stance): B10, leafy greens, berries and five herb and green picks lead with grown without sprays, organic the floor; cream goes grass-fed, not ultra-pasteurized; turkey and chicken gain avoid lines only.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { lintCard, lintPick } from '../../lib/counterCardLint.js';
import { projectEntry } from '../../lib/counterCards.js';
import { matchItemToCard } from '../../lib/listMatch.js';
import { preCleanPick11, preCleanPick12, preCleanPick8, prePickAvoid } from './twoLinePin.js';

const BASE = '117ab78';
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const git = (ref) => execFileSync('git', ['show', ref], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const base = JSON.parse(git(`${BASE}:server/kristy_perimeter_kb.json`));
const doLines = JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'));
const find = (k, id) => k.entries.find((e) => e.id === id);
const live = (id) => find(kb, id);
const was = (id) => find(base, id);
// Batches after B10 that edit these entries add their ids here.
const LATER = new Set([]);

// Every field B10 set, verbatim.
const SET = {
  "produce_leafy_greens": {
    "decision": "Lettuce grown without sprays, bagged or head, then organic.",
    "sources": [
      "UC Davis Postharvest Technology Center, Lettuce (Romaine) fact sheet, https://postharvest.ucdavis.edu/produce-facts-sheets/lettuce-romaine",
      "UC Davis Postharvest Technology Center, Spinach fact sheet, https://postharvest.ucdavis.edu/produce-facts-sheets/spinach",
      "Michigan State University Extension, Featured local foods for institutions (kale), https://www.canr.msu.edu/news/2016_featured_local_foods_for_institutions",
      "EWG Shopper’s Guide to Pesticides in Produce, full list, https://www.ewg.org/foodnews/full-list.php",
      "https://www.ewg.org/foodnews/dirty-dozen.php",
      {
        "name": "USDA AMS Pesticide Data Program, Annual Summary, Calendar Year 2024",
        "url": "https://www.ams.usda.gov/sites/default/files/media/PDPAnnualSummary.pdf"
      },
      {
        "name": "7 CFR 205.206, organic crop pest and weed management standard",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.206"
      },
      {
        "name": "7 CFR 205.601, Synthetic substances allowed for use in organic crop production",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.601"
      },
      {
        "name": "National Agricultural Law Center: Ninth Circuit memorandum on hydroponic organic certification (2022)",
        "url": "https://nationalaglawcenter.org/wp-content/uploads/2022/09/Ninth-Cir.-memo.pdf"
      },
      {
        "name": "UC IPM Pest Management Guidelines: Lettuce",
        "url": "https://ipm.ucanr.edu/agriculture/lettuce/"
      },
      {
        "name": "FDA Leafy Green Risk Assessment Model: free chlorine in fresh-cut leafy green wash water (Risk Analysis, 2022)",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC9544649/"
      }
    ],
    "cart_pick": "Lettuce: grown without sprays, or organic",
    "buying_tips": [
      "Lettuce is eaten as the leaf, and the leaf is what gets sprayed.",
      "Look for local or greenhouse lettuce labeled grown without sprays; greenhouse or hydroponic alone does not say it.",
      "Organic is the store fallback; organic rules still allow approved sprays.",
      "By weight, spinach carries more pesticide residue than any other produce.",
      "Leaves are eaten whole, so the USDA Organic seal is the floor for greens.",
      "Lettuce: crisp leaves, bright to dark green outside and pale at the heart, free of decay or damage.",
      "Romaine: a head that is neither very loose nor very hard. Loose is immature; hard is overmature.",
      "Spinach: uniformly green, fully crisp, fairly clean.",
      "Kale: firm, deep colored leaves on moist, hardy stems. Smaller leaves are more tender and milder.",
      "Store lettuce and spinach as close to 32°F as the refrigerator gets.",
      "Kale: plastic bag, air pressed out, unwashed, about five days in the refrigerator."
    ],
    "watch_out": [
      "Yellow-green spinach or yellowing lettuce leaves.",
      "Browning, yellow, or small holes on kale.",
      "Washing kale before storing: water on the leaves brings faster spoilage.",
      "Bagged, pre-washed greens go through a sanitizing wash, often chlorinated water."
    ]
  },
  "berries_picking": {
    "decision": "Berries from a local farm, grown without sprays, then organic.",
    "sources": [
      "postharvest handling references for soft fruit (non-climacteric ripening, decay by contact)",
      "USDA produce grading and handling standards",
      "Ohio State University Extension “Selecting, Storing, and Serving Ohio Berries” (HYG-5531) https://ohioline.osu.edu/factsheet/HYG-5531",
      "Independent pesticide screen commissioned by Mamavation, May 2026, EPA-certified laboratory; scientific review by Dr. Craig Downs, Haereticus Environmental Laboratory",
      "USDA National Organic Program, 7 CFR Part 205",
      "https://www.ewg.org/foodnews/dirty-dozen.php",
      {
        "name": "USDA AMS Pesticide Data Program, Annual Summary, Calendar Year 2024",
        "url": "https://www.ams.usda.gov/sites/default/files/media/PDPAnnualSummary.pdf"
      },
      {
        "name": "EWG Shopper’s Guide to Pesticides in Produce 2026, summary",
        "url": "https://www.ewg.org/foodnews/summary.php"
      },
      {
        "name": "7 CFR 205.206, organic crop pest and weed management standard",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.206"
      },
      {
        "name": "Certified Naturally Grown: FAQs",
        "url": "https://www.naturallygrown.org/faqs/"
      }
    ],
    "cart_pick": "Berries: grown without sprays, or organic",
    "buying_tips": [
      "The bottom berries carry the weight and mold first, while the top still looks fresh.",
      "Look for berries from a local farm or market, u-pick included, labeled or stated grown without sprays.",
      "Organic is the store fallback, and organic frozen out of season; organic rules still allow approved sprays.",
      "Berries are eaten whole, so the USDA Organic seal on the clamshell is the floor.",
      "A dry, unstained bottom on the carton. That is the whole check.",
      "No fuzzy white or gray spot on any berry. One takes the punnet.",
      "Green caps still fresh on strawberries, not browned and dry.",
      "Deep, even color for the variety, and uniform size in the container.",
      "Buy them cold, from the refrigerated display rather than a room-temperature stack.",
      "No USDA Organic seal on the clamshell means conventional, whatever the box says.",
      "Read the seal, not the photograph; the two cartons look almost identical.",
      "Frozen organic strawberries: same seal and same rules."
    ],
    "watch_out": [
      "Berries do not ripen after picking. Buying firm and waiting does not work the way it does for stone fruit.",
      "Condensation fogging the plastic traps moisture and speeds the mold.",
      "Clamshells re-stacked at the store hide older fruit under a fresh top layer.",
      "A carton that already smells sweet or fermented is past it.",
      "Juice stains on the bottom of the container mean crushed or moldy berries inside.",
      "One box of each, screened once, and the testers call it a spot-check. It is a reason to buy organic, not a measurement of a brand.",
      "Certified organic restricts synthetic pesticides. It is not a promise of a blank screen on every box.",
      "The organic box was screened for more than 500 pesticides, including ones approved for organic use, and came back non-detect. One sample, one time.",
      "Bifenthrin, a PFAS pesticide, was found most commonly on blackberries in USDA residue data."
    ]
  },
  "pick_swiss_chard": {
    "decision": "Local chard labeled grown without sprays, else organic, dark green with unsplit stalks.",
    "sources": [
      {
        "name": "Nebraska Extension: Swiss Chard",
        "url": "https://food.unl.edu/article/swiss-chard"
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
  "pick_cilantro": {
    "decision": "Local cilantro labeled grown without sprays, else organic, in bright, upright bunches.",
    "sources": [
      {
        "name": "Nebraska Extension: Fresh Herbs",
        "url": "https://food.unl.edu/article/fresh-herbs"
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
  "pick_parsley": {
    "decision": "Local parsley labeled grown without sprays, else organic, upright and bright green.",
    "sources": [
      {
        "name": "Nebraska Extension: Fresh Herbs",
        "url": "https://food.unl.edu/article/fresh-herbs"
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
  "pick_basil": {
    "decision": "Basil labeled grown without sprays from a small local grower, else organic, bright and upright.",
    "sources": [
      {
        "name": "Nebraska Extension: Fresh Herbs",
        "url": "https://food.unl.edu/article/fresh-herbs"
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
  "pick_microgreens": {
    "decision": "Microgreens labeled grown without sprays from a small local grower, else organic; rinse before use.",
    "sources": [
      {
        "name": "Science Meets Food: Microgreens",
        "url": "https://sciencemeetsfood.org/microgreens/"
      },
      {
        "name": "Penn State Extension: Ensuring Food Safety in Microgreens Production",
        "url": "https://extension.psu.edu/ensuring-food-safety-in-microgreens-production"
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
  "cream_vs_creamer": {
    "decision": "Grass-fed cream from a small dairy, pasteurized, not ultra-pasteurized.",
    "detail": "Heavy cream is at least 36% milkfat, light whipping 30 to 36, half-and-half 10.5 to 18. Standards of identity fix what cream can mean, which is why those fat percentages are consistent across every carton. Creamer has no such standard because it is a formulated product. The oil in it is usually a refined seed oil, and the sweetness usually comes from corn syrup solids or sugar, with the flavored versions adding more of both. Some cartons of real cream carry stabilizers like carrageenan or gellan gum, so a short list is worth checking on the dairy side too. Whole milk, half-and-half or real cream all do the job with a list you can read out loud. Read the two ingredient lists side by side and it takes three seconds. rBST is a synthetic hormone given to cows for milk production. The certified organic rules bar this growth hormone. Start with certified organic cream or half-and-half. Follow with a carton stating the cows were not treated with rBST, then one with neither. US companies need not label rBST use.",
    "sources": [
      "FDA standards of identity for cream products, 21 CFR 131",
      "FDA food labeling regulations",
      "Product ingredient labeling",
      "Morning Fresh Dairy “Coffee Creamer, Half & Half, and Whipping Cream” https://www.morningfreshdairy.com/moo-news/an-explanation-on-coffee-creamer-half-half-and-whipping-cream.html",
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
        "name": "21 CFR 131.3, pasteurized and ultra-pasteurized defined",
        "url": "https://www.law.cornell.edu/cfr/text/21/131.3"
      },
      {
        "name": "Weston A. Price Foundation: FAQ, dairy",
        "url": "https://www.westonaprice.org/health-topics/faq-dairy/"
      },
      {
        "name": "American Grassfed Association: Our Standards",
        "url": "https://www.americangrassfed.org/about-us/our-standards/"
      },
      {
        "name": "CSPI: Titanium dioxide",
        "url": "https://www.cspi.org/node/8046"
      },
      {
        "name": "CSPI: Polysorbate 60, 65 and 80",
        "url": "https://www.cspi.org/node/7467"
      },
      {
        "name": "CSPI Chemical Cuisine: food additive safety ratings",
        "url": "https://www.cspi.org/page/chemical-cuisine-food-additive-safety-ratings"
      }
    ],
    "cart_pick": "Grass-fed cream or half-and-half",
    "buying_tips": [
      "Cream carries a legal milkfat minimum; creamer is oil and sweetener imitating it.",
      "Look for grass-fed cream or half-and-half from a small dairy, pasteurized and not ultra-pasteurized.",
      "Grass-fed ultra-pasteurized cream is the store fallback.",
      "Look for a carton naming grass-fed cows, with cream and milk only.",
      "Heavy cream is 36% milkfat or more. Half-and-half is 10.5 to 18%. Those numbers are fixed by law.",
      "‘Non-dairy creamer’ is oil, sweetener and emulsifiers. It is not cream.",
      "Even real cream can carry carrageenan or gellan gum. A short list is still worth checking.",
      "Flavored creamers are where the added sugar sits. Read the panel.",
      "Whole milk or half-and-half does the same job with a two-word ingredient list.",
      "Even certified organic cream can list carrageenan, a thickener derived from seaweed. Read the ingredients and take cream with none listed."
    ],
    "watch_out": [
      "Most coffee creamers are dairy-free. Water, sugar and vegetable oil are the usual first three ingredients. Many are built on almond, oat or coconut milk rather than cream.",
      "The flavored creamers carry the most sugar. That line on the panel is the one to read first.",
      "Real cream can still carry carrageenan or gellan gum. The fat number is fixed by law; the list is not.",
      "Cartons marked ultra-pasteurized were heated to at least 280 °F for 2 seconds.",
      "In creamers, skip titanium dioxide, polysorbate 80 and carboxymethylcellulose on the list."
    ]
  },
  "ground_turkey": {
    "sources": [
      "https://www.govinfo.gov/content/pkg/FR-2010-12-29/html/2010-32485.htm",
      "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/turkey-farm-table",
      {
        "name": "Food & Meat Co-op: Air-chilled vs water-chilled chicken",
        "url": "https://foodandmeatcoop.com/blogs/news/air-chilled-vs-water-chilled-chicken-what-s-the-difference"
      }
    ],
    "buying_tips": [
      "The name ground turkey sets no one fat level, so two packs can differ.",
      "Look for pasture-raised or certified organic ground turkey, sold plain.",
      "Look for “air-chilled” on the turkey pack.",
      "Choose a formulation listing turkey without added seasonings or a flavoring solution.",
      "Without a percent-lean claim, use the Nutrition Facts fat line to compare packs.",
      "Compare the fat content of the actual packs rather than assume one level for all ground turkey."
    ],
    "watch_out": [
      "Do not infer a fat level from the animal name. Read each pack.",
      "Ground turkey labeled “water chilled” or “contains up to X% retained water” holds water from the chilling tank."
    ]
  },
  "chicken_cuts_basics": {
    "sources": [
      "USDA FoodData Central (poultry composition)",
      "USDA FSIS poultry labeling terms",
      "9 CFR § 441.10 “Retained water in raw meat and poultry products” (Cornell LII) https://www.law.cornell.edu/cfr/text/9/441.10",
      "USDA FSIS poultry-chilling references",
      "USDA FSIS ‘raised without antibiotics’ guidance",
      "FDA antibiotic-residue rules",
      "Consumer Reports “Decoding the Labels on Meat Packages” https://www.consumerreports.org/food/decoding-the-labels-on-meat-packages/decoding-the-labels-on-meat-packages.html",
      "Rebel Pastures “The Truth About Chicken Labels: What You Need to Know” https://rebelpastures.com/blogs/real-talk-from-the-pasture/the-truth-about-chicken-labels-what-you-need-to-know",
      {
        "name": "The Virtual Weber Bullet: Enhanced meat",
        "url": "https://www.virtualweberbullet.com/enhanced-meat/"
      }
    ],
    "watch_out": [
      "Boneless skinless costs the most for the same bird.",
      "Water-chilled packages disclose ‘retained water up to’ a percentage. That percentage is the tank.",
      "No ‘retained water’ line on the label means none is allowed inside. The disclosure is required, not optional.",
      "Where air-chilled is not stocked, a regular bird still does the job. Pat it dry before it goes in the pan.",
      "Safe handling matters far more than the chilling method.",
      "‘Raised without antibiotics’ rests on the producer’s own affidavit to USDA. The agency does not inspect the farm, so oversight is weak. A third-party seal is what makes it checkable.",
      "‘Natural’ says nothing about antibiotics. It means no artificial ingredients were added after processing and the meat is minimally processed. A natural bird can be raised with antibiotics.",
      "‘No hormones’ on chicken is an empty claim. Hormones and steroids are not allowed in poultry, so every bird already qualifies.",
      "Organic is the seal that carries the antibiotic rule: organic feed only, no antibiotics.",
      "Skip chicken labeled “enhanced” or “contains up to X% of a solution”: water, salt and phosphates injected into the meat."
    ]
  }
};
const IDS = Object.keys(SET);
const RUNG = ['produce_leafy_greens', 'berries_picking', 'pick_swiss_chard', 'pick_cilantro', 'pick_parsley', 'pick_basil', 'pick_microgreens', 'cream_vs_creamer'];
const AVOID_ONLY = ['ground_turkey', 'chicken_cuts_basics'];
const urls = (e) => (e.sources || []).map((s) => (typeof s === 'string' ? s : s.url)).filter(Boolean);
const strings = (e) => Object.entries(e).filter(([k]) => k !== 'sources' && k !== 'id').flatMap(([, v]) => [v].flat()).filter((v) => typeof v === 'string');
const sentences = (s) => s.split(/(?<=[.!?:;])\s+/).filter(Boolean);
// Sentences B10 wrote: in a live string field, absent from every string field of the base entry.
const fresh = (id) => {
  const old = strings(was(id)).join('\n');
  return strings(live(id)).flatMap(sentences).filter((s) => !old.includes(s));
};
const allFresh = () => IDS.flatMap(fresh);

test('C1 every B10 field equals the set value and nothing else on the 10 entries moved', () => {
  nonEmpty(IDS, 'B10 ids', 10);
  for (const id of IDS) {
    assert.ok(live(id) && was(id), `${id} missing`);
    nonEmpty(Object.keys(SET[id]), `${id} fields`, 2);
    for (const [f, v] of Object.entries(SET[id])) assert.deepEqual(live(id)[f], v, `${id}.${f}`);
    assert.deepEqual(live(id), { ...structuredClone(was(id)), ...structuredClone(SET[id]) }, id);
  }
});

test('C2 every entry outside B10 deepEquals 117ab78; count and top-level keys unchanged', () => {
  const others = kb.entries.map(prePickAvoid).map(preCleanPick8).map(preCleanPick12).map(preCleanPick11).filter((e) => !IDS.includes(e.id) && !LATER.has(e.id));
  nonEmpty(others, 'others', 201);
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

test('C4 and C4b no new sentence carries a banned word; the grower word stays on rung rows', () => {
  const all = allFresh();
  nonEmpty(all, 'fresh sentences', 25);
  for (const s of all) {
    assert.doesNotMatch(s, /\b(health|healthy|healthier|safer|risk|cancer|disease|toxic|toxin|detox|pesticide-free|synthetic|price|cost|cheap|expensive)\b/i, s);
    assert.doesNotMatch(s, /\b(poison\w*|chemicals?|spray-free)\b/i, s);
    assert.doesNotMatch(s, /—|\b(I|me|my)\b/, s);
  }
  for (const id of IDS) {
    if (fresh(id).some((s) => /\b(unsprayed|without sprays)\b/i.test(s))) assert.ok(RUNG.includes(id), `${id} grower word off a rung row`);
  }
});

test('C5b the rung rows equal the ids whose decision or cart moved, each with its rung phrase; organic only as the fallback', () => {
  const moved = IDS.filter((id) => live(id).decision !== was(id).decision || live(id).cart_pick !== was(id).cart_pick);
  assert.deepEqual(moved.sort(), [...RUNG].sort());
  for (const id of RUNG) {
    const top = [live(id).decision, live(id).cart_pick || ''];
    const phrase = id === 'cream_vs_creamer' ? /grass-fed.*not ultra-pasteurized/i : /grown without sprays/i;
    assert.match(live(id).decision, phrase, `${id} decision rung`);
    for (const t of top) for (const m of t.matchAll(/\borganic\b/gi)) {
      assert.match(t.slice(0, m.index), /\b(or|then|else)\b[^.]*$/i, `${id}: organic leads "${t}"`);
    }
    (live(id).buying_tips || []).forEach((t, i) => { if (/\borganic\b/i.test(t)) assert.ok(i >= 1, `${id} tips[${i}] leads with organic`); });
  }
  for (const id of AVOID_ONLY) {
    assert.equal(live(id).decision, was(id).decision, `${id} decision`);
    assert.deepEqual(live(id).cart_pick, was(id).cart_pick, `${id} cart_pick`);
  }
});

// Admin ruling: two kept base tips called organic "the standard", against the organic-floor stance; reworded to "the floor".
const REWORD = {
  "Leaves are eaten whole, so the USDA Organic seal is the standard for greens.": "Leaves are eaten whole, so the USDA Organic seal is the floor for greens.",
  "Berries are eaten whole, so the USDA Organic seal on the clamshell is the standard.": "Berries are eaten whole, so the USDA Organic seal on the clamshell is the floor.",
};
const reworded = (t) => REWORD[t] || t;

test('C8 every base buying tip of a batch card survives in tips, watch_out or detail', () => {
  let n = 0;
  for (const id of IDS) {
    const now = [...(live(id).buying_tips || []), ...(live(id).watch_out || []), live(id).detail || ''].join('\n');
    for (const t of (was(id).buying_tips || []).map(reworded)) { n++; assert.ok(now.includes(t), `${id} lost "${t}"`); }
  }
  assert.ok(n >= 20, `base tips checked ${n}`);
});

test('C9 each moved cart pick matches its own card', () => {
  const carts = RUNG.filter((id) => live(id).cart_pick && live(id).cart_pick !== was(id).cart_pick);
  nonEmpty(carts, 'moved carts', 3);
  for (const id of carts) assert.equal(matchItemToCard(live(id).cart_pick)?.slug, id, live(id).cart_pick);
});

test('C14 no new sentence names a brand', () => {
  const ALLOW = new Set(['USDA', 'Organic', 'Certified', 'Naturally', 'Grown', 'PFAS', 'Real', 'Project', 'Regenerative', 'Glyphosate', 'Residue', 'Free', 'American', 'Grassfed', 'Association', 'UHT', 'F', 'US', 'X']);
  for (const s of allFresh()) {
    const words = s.split(/\s+/).slice(1).map((w) => w.replace(/^[“"‘(]+|[^\w%]+$/g, ''));
    for (const w of words) if (/^[A-Z]/.test(w)) assert.ok(ALLOW.has(w.replace(/%$/, '')), `"${w}" in: ${s}`);
  }
});

test('C15 every source URL new in B10 sits verbatim on a url: line under docs/sources/', () => {
  const files = [];
  const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : files.push(p); } };
  walk(join(ROOT, 'docs/sources'));
  const lines = new Set(files.flatMap((f) => readFileSync(f, 'utf8').split('\n')).filter((l) => l.startsWith('url: ')).map((l) => l.slice(5).trim()));
  const added = IDS.flatMap((id) => urls(live(id)).filter((u) => !urls(was(id)).includes(u)));
  nonEmpty(added, 'new B10 urls', 16);
  for (const u of added) assert.ok(lines.has(u), u);
  const NEED = {
    produce_leafy_greens: ['https://pmc.ncbi.nlm.nih.gov/articles/PMC9544649/', 'https://www.law.cornell.edu/cfr/text/7/205.206', 'https://nationalaglawcenter.org/wp-content/uploads/2022/09/Ninth-Cir.-memo.pdf'],
    berries_picking: ['https://www.ewg.org/foodnews/summary.php', 'https://www.naturallygrown.org/faqs/'],
    cream_vs_creamer: ['https://www.law.cornell.edu/cfr/text/21/131.3', 'https://www.cspi.org/node/8046', 'https://www.cspi.org/node/7467'],
    ground_turkey: ['https://foodandmeatcoop.com/blogs/news/air-chilled-vs-water-chilled-chicken-what-s-the-difference'],
    chicken_cuts_basics: ['https://www.virtualweberbullet.com/enhanced-meat/'],
  };
  for (const [id, need] of Object.entries(NEED)) for (const u of need) assert.ok(urls(live(id)).includes(u), `${id} cites ${u}`);
});

test('C16 each rung row keeps a findable close second, and organic lines say what organic still allows', () => {
  for (const id of RUNG) {
    if (id.startsWith('pick_')) { assert.match(live(id).decision, /\belse organic\b/, id); continue; }
    const second = id === 'cream_vs_creamer' ? /ultra-pasteurized cream is the store fallback/ : /^Organic is the store fallback.*approved sprays\.$/;
    assert.ok(live(id).buying_tips.some((t) => second.test(t)), `${id} close second`);
    if (id !== 'cream_vs_creamer') assert.ok(urls(live(id)).includes('https://www.law.cornell.edu/cfr/text/7/205.206'), `${id} S3`);
  }
});

test('C17 every new "ask" sits with a counter, market or grower; none in decision or cart', () => {
  for (const s of allFresh()) if (/\bask\b/i.test(s)) assert.match(s, /(counter|butcher|fishmonger|deli|bakery|market|farm stand|grower)/i, s);
  for (const id of IDS) for (const t of [live(id).decision, live(id).cart_pick || '']) assert.doesNotMatch(t, /\bask\b/i, `${id}: ${t}`);
});

test('C18 each avoid row names its label terms, at most 3 register items per card, register evidence on file', () => {
  const reg = readFileSync(join(ROOT, 'docs/CONCERN-REGISTER.md'), 'utf8').split('\n');
  // Label terms as the archived sources print them ("prewashed" as the register spells it, retained water and % of a solution as the label wording).
  const AVOID = {
    produce_leafy_greens: { bagged_greens_wash: [/pre-washed/i, /sanitizing wash/i, /chlorinated/i] },
    berries_picking: { pfas_pesticides: [/PFAS pesticide/] },
    cream_vs_creamer: { ultra_pasteurized: [/marked ultra-pasteurized/], titanium_dioxide: [/titanium dioxide/], synthetic_emulsifiers: [/polysorbate 80/, /carboxymethylcellulose/] },
    ground_turkey: { poultry_chill_wash: [/“water chilled”/, /retained water/, /“air-chilled”/] },
    chicken_cuts_basics: { enhanced_meat: [/“enhanced”/, /% of a solution/] },
  };
  for (const [id, rows] of Object.entries(AVOID)) {
    const e = live(id);
    const lines = [...(e.watch_out || []), ...(e.buying_tips || []).slice(2)].join('\n');
    const hit = Object.keys(rows).length;
    assert.ok(hit <= 3, `${id} ${hit} avoid items`);
    for (const [rid, terms] of Object.entries(rows)) {
      for (const t of terms) assert.match(lines, t, `${id} ${rid} ${t}`);
      const row = reg.find((l) => l.startsWith(`| \`${rid}\``));
      assert.ok(row, `register ${rid}`);
      const files = [...row.matchAll(/`([\w-]+\/[\w.-]+\.md)`/g)].map((m) => m[1]);
      nonEmpty(files, `${rid} evidence`, 1);
      for (const f of files) assert.ok(existsSync(join(ROOT, 'docs/sources/concerns', f)), `${rid} ${f}`);
      for (const t of terms) for (const top of [e.decision, e.cart_pick || '']) {
        assert.doesNotMatch(top.replace(/not ultra-pasteurized/g, ''), t, `${id} avoid term in headline`);
      }
    }
  }
  // S18: rBST is cream's 4th item, so it sits in detail and nowhere in the top three slots.
  const cream = live('cream_vs_creamer');
  assert.match(cream.detail, /rBST is a synthetic hormone/);
  assert.doesNotMatch([...cream.watch_out, ...cream.buying_tips].join('\n'), /rBST/);
  assert.ok(reg.some((l) => l.startsWith('| `rbst`') && l.includes('bcpp-rbgh-rbst.md')), 'rbst register row');
});

test('C19 and C20 no mainstream verdict and no recommended seed oil on a batch id', () => {
  for (const id of IDS) {
    for (const s of strings(live(id))) assert.doesNotMatch(s, /(within (legal |safe )?limits|tolerance|safe levels?|conventional is fine|buy conventional|eat more|heart[- ]healthy|debated|contested|credible concern at most)/i, `${id}: ${s}`);
    for (const s of live(id).sources || []) assert.notEqual(typeof s === 'string' ? s : s.name, 'EPA tolerance limits', id);
  }
  for (const s of allFresh()) if (/\b(avocado|canola|soybean|sunflower|safflower|corn|cottonseed|grapeseed|rice bran|vegetable|seed) oils?\b/i.test(s)) assert.match(s, /\b(skip|avoid|instead of|never|not|no)\b/i, s);
});

test('independent check: lettuce matches the worked example (cart in its sourced revision)', () => {
  const e = live('produce_leafy_greens');
  assert.equal(e.decision, 'Lettuce grown without sprays, bagged or head, then organic.');
  // Worked example "Lettuce grown without sprays, or organic" matches no card (head word "or"); the KB colon form carries the same words.
  assert.equal(e.cart_pick, 'Lettuce: grown without sprays, or organic');
  assert.deepEqual(e.buying_tips.slice(0, 3), [
    'Lettuce is eaten as the leaf, and the leaf is what gets sprayed.',
    'Look for local or greenhouse lettuce labeled grown without sprays; greenhouse or hydroponic alone does not say it.',
    'Organic is the store fallback; organic rules still allow approved sprays.',
  ]);
  assert.deepEqual(e.buying_tips.slice(3), was('produce_leafy_greens').buying_tips.map(reworded));
  assert.ok(e.watch_out.includes('Bagged, pre-washed greens go through a sanitizing wash, often chlorinated water.'));
});

test('independent check: hydroponic or greenhouse only with "alone does not"; no ask in headlines; turkey and chicken headlines at base', () => {
  let n = 0;
  for (const id of IDS) {
    for (const line of strings(live(id))) if (/hydroponic|greenhouse/i.test(line)) { n++; assert.match(line, /alone does not/, `${id}: ${line}`); }
    for (const t of [live(id).decision, live(id).cart_pick || '']) assert.doesNotMatch(t, /\bask\b/i, id);
  }
  assert.ok(n >= 1, 'greenhouse line present');
  for (const id of AVOID_ONLY) {
    assert.equal(live(id).decision, was(id).decision);
    assert.deepEqual(live(id).cart_pick, was(id).cart_pick);
  }
});
