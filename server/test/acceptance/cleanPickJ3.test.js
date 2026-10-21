// clean-sweep-J3 (2026-10-22, clean-pick final sweep): meat and poultry, against the live stance flags at 69bb605.
// Rung rows move the decision (sausage, jerky); the rest add register terms, place-named asks and archived sources only.
// cart_pick never moves. Older pins read these ids as of 69bb605 (cartPlain.js preCleanJ3).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { lintCard, lintPick } from '../../lib/counterCardLint.js';
import { projectEntry } from '../../lib/counterCards.js';
import { CLEAN_J3, CLEAN_J3_BASE, preCleanJ4, preCleanJ5 } from './cartPlain.js';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
// Later batches restore their own ids to the J3 commit (J4: preCleanJ4, J5: preCleanJ5).
const raw = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const kb = { ...raw, entries: raw.entries.map(preCleanJ4).map(preCleanJ5) };
const base = JSON.parse(execFileSync('git', ['show', `${CLEAN_J3_BASE}:server/kristy_perimeter_kb.json`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const doLines = JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'));
const live = (id) => kb.entries.find((e) => e.id === id);
const was = (id) => base.entries.find((e) => e.id === id);
// Batches after J3 that edit these entries add their ids here.
const LATER = new Set([]);
const RUNG = new Set(['pick_sausage', 'pick_jerky']);

// Every field J3 set, verbatim.
const BECAME = {
  'beef_grassfed_vs_grainfed': {
    'short_answer': 'On a beef label, ‘grass-fed’ alone rests on the producer. FSIS reads ‘100% grass-fed’ as grass after weaning, no grain, and pasture access. A certifier’s seal is what audits it. That seal is the one to look for.',
    'instead': 'Grass-finished ground beef or chuck: grass after weaning, no grain or feedlot, in the everyday cuts.',
    'buying_tips': [
      '“Grass-fed” alone can mean a grain finish; grass to the end makes leaner beef.',
      '‘100% grass-fed’ and ‘grass-finished’ mean the same thing. Either one is the claim.',
      'When steaks are a stretch, ground beef and chuck still come from a whole-life grass animal.',
      'At the counter, ask what the animal was finished on and for how long.',
      'Look for no added hormones and a certifier’s seal behind the claim.',
      'Grain-finished cattle are often given antibiotics; look for ‘no antibiotics ever’ or the American Grassfed seal.',
      '‘No added hormones’ does not rule out ractopamine, a feed drug for leanness. Look for ‘raised without ractopamine’.'
    ],
    'watch_out': [
      'Where grass-finished is not on the shelf, organic grain-finished is the floor. Well-raised grain-finished beef beats poorly-raised anything.',
      'Pasture artwork on the package is not a claim. The words are the claim.',
      'A grass finish leaves a leaner animal, so it cooks faster and dries out at feedlot-beef heat.',
      'USDA withdrew its grass-fed claim standard in 2016. A ‘grass-fed’ label today points at a standard the company chose; look for a certifier’s seal behind it.'
    ],
    'science': 'FSIS reads a ‘grass-fed’ claim as grass after weaning, no grain, and pasture access. USDA withdrew its grass-fed claim standard in 2016, so the bare claim rests on the producer and any seal. The fat profile follows the finish, not the start. A grass finish leaves a leaner animal that dries out at feedlot-beef heat. Ground beef and chuck still come from the same whole-life grass animal.'
  },
  'butcher_counter_asking': {
    'short_answer': 'The service counter answers what a package never will. Ask the butcher what came in today and ask the sourcing question directly. At the counter, ask for a whole cut ground fresh, and for bones and trim.',
    'sources': [
      'USDA Institutional Meat Purchase Specifications (cut nomenclature)',
      'MakeFoodSafe.com “Meat Grinding at Home Safety Tips” https://www.makefoodsafe.com/meat-grinding-at-home-safety-tips/',
      'Rising Star Custom Meats “4 Questions You Should Always Ask Your Local Butchers” https://www.risingstarmeats.com/4-questions-you-should-always-ask-your-local-butchers',
      'The Butcher’s Handbook “How to Order Meat Like a Pro: Butcher Counter Communication Guide” https://butchershandbook.com/guides/butcher-counter-terminology',
      {
        'name': 'A Greener World: Animal Welfare Approved standards',
        'url': 'https://agreenerworld.org/certifications/animal-welfare-approved/standards/'
      },
      {
        'name': 'ASPCA: Food certification label guide',
        'url': 'https://www.aspca.org/shopkind/guide/food-certification-label-guide'
      }
    ],
    'buying_tips': [
      'A butcher can tell you how it was raised and when it was cut; a package cannot.',
      'Ask the butcher which farm the bones came from and what the cattle were fed.',
      'Ask the butcher what came in today.',
      'At the counter, ask for a whole chuck ground fresh, which lets you choose the cut.',
      'Ask the butcher the sourcing question outright: how it was raised and where from.',
      'Ask the butcher for bones and trim.',
      'Ask the butcher to portion it. Cutting, tying and boning are usually included.',
      'Ask the butcher whether the farm holds an Animal Welfare Approved seal, beyond “pasture raised”.'
    ],
    'watch_out': [
      '‘Aged’ covers two different things. Wet-aged beef rests in a vacuum bag and keeps its moisture. Dry-aged beef rests in open air and loses weight. Ask the butcher which one it is.',
      'Silverskin is connective tissue. Ask the butcher to remove it from a tenderloin or ribs.',
      'Thickness is not fixed. Say how thick the steak should be, what size piece is needed and what lean-to-fat ratio the grind should have.',
      'Unsure of the cut, name the section first: a piece from the chuck, a cut from the loin. That opens a real conversation about what is fresh.',
      'Blade or mechanically tenderized: see Steak.'
    ],
    'pick_steps': [
      'Soup bones: ask the butcher for marrow or knuckle bones.',
      'How it was raised: see Beef.',
      'Ask the butcher to portion it; cutting, tying and boning are usually included.'
    ]
  },
  'bacon': {
    'sources': [
      'https://www.npr.org/sections/thesalt/2019/08/29/755115208/duped-in-the-deli-aisle-no-nitrates-added-labels-are-often-misleading',
      'https://www.law.cornell.edu/cfr/text/9/317.17',
      'Consumer Reports: Decoding the labels on meat packages https://www.consumerreports.org/food/decoding-the-labels-on-meat-packages/',
      'Reverence Farms: Organic feed and non-GMO feed https://reverencefarms.com/blogs/news/why-is-it-so-important-to-feed-organic-feed-isn-t-non-gmo-almost-as-good',
      'Iowa State University Extension: Liquid smoke https://blogs.extension.iastate.edu/answerline/2019/04/18/liquid-smoke-that-controversial-condiment/',
      {
        'name': 'UCSF SugarScience: Hidden in plain sight',
        'url': 'https://sugarscience.ucsf.edu/hidden-in-plain-sight/'
      }
    ],
    'watch_out': [
      'On bacon labeled “uncured” or “no nitrates added”, celery powder or juice may supply the nitrite for curing. Find the asterisk and read its exception.',
      'An uncured label does not by itself establish the absence of nitrates or nitrites.',
      'The source set does not establish a health advantage from choosing celery-based curing.',
      'Dextrose in a curing list is added sugar under another name.'
    ]
  },
  'ham': {
    'sources': [
      'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/meat-catfish/hams-and-food-safety',
      'https://www.canr.msu.edu/news/ham_for_the_holidays_and_all_year_long',
      'Consumer Reports: Decoding the labels on meat packages https://www.consumerreports.org/food/decoding-the-labels-on-meat-packages/',
      'Reverence Farms: Organic feed and non-GMO feed https://reverencefarms.com/blogs/news/why-is-it-so-important-to-feed-organic-feed-isn-t-non-gmo-almost-as-good',
      'NPR: No nitrates added labels and celery-based curing https://www.npr.org/sections/thesalt/2019/08/29/755115208/duped-in-the-deli-aisle-no-nitrates-added-labels-are-often-misleading',
      'The Conversation: How deli meat is made https://theconversation.com/how-is-deli-meat-made-the-food-science-behind-the-turkey-ham-and-other-cold-cuts-in-your-lunch-283597',
      'CSPI: Food additive safety ratings https://www.cspi.org/page/chemical-cuisine-food-additive-safety-ratings',
      'CSPI: Carrageenan https://www.cspi.org/node/7465',
      'True Story Foods: Deli meat additives https://www.truestoryfoods.com/blog/deli-meat-additives/',
      'Iowa State University Extension: Liquid smoke https://blogs.extension.iastate.edu/answerline/2019/04/18/liquid-smoke-that-controversial-condiment/',
      {
        'name': 'Weston A. Price Foundation: Pork',
        'url': 'https://www.westonaprice.org/health-topics/food-features/pork/'
      }
    ],
    'buying_tips': [
      'Next, “Ham With Natural Juices”; “Water Added” means more added solution.',
      'Read the product name for “Water Added” or a percent of added ingredients.',
      'Check whether the label says fully cooked or cook before eating.',
      'Find where water sits in the ingredients statement.',
      'On smoked ham, favor wood smoking over liquid smoke or smoke flavoring. Those ingredients add condensed smoke to the meat.',
      'Above a quick-cured ham: one dry cured with salt and time, as in prosciutto.'
    ],
    'watch_out': [
      'Packaged ham marked “uncured” or “no nitrates added” can get nitrite from celery powder or juice. Fresh ham is the raw leg and needs cooking.',
      '“Ham and Water Product” states the share of its weight that is added ingredients.',
      'Fresh ham and country ham are not fully cooked and need cooking before eating.',
      'Choose ham without added phosphates such as sodium phosphate, used to retain water. Pass on binders such as carrageenan, modified food starch and maltodextrin, which thicken or bind it.'
    ]
  },
  'pick_sausage': {
    'decision': 'Pastured local-farm sausage, then certified organic feed and outdoor access; “uncured” celery powder supplies nitrite.',
    'sources': [
      {
        'name': 'Cornell LII: 9 CFR § 319.140 Sausage',
        'url': 'https://www.law.cornell.edu/cfr/text/9/319.140'
      },
      {
        'name': 'Cornell LII: 9 CFR § 319.141 Fresh pork sausage',
        'url': 'https://www.law.cornell.edu/cfr/text/9/319.141'
      },
      {
        'name': 'Cornell LII: 9 CFR § 317.17 Curing agents in the ingredients statement',
        'url': 'https://www.law.cornell.edu/cfr/text/9/317.17'
      },
      {
        'name': 'Consumer Reports: Decoding the labels on meat packages',
        'url': 'https://www.consumerreports.org/food/decoding-the-labels-on-meat-packages/'
      },
      {
        'name': 'NPR: No nitrates added labels and celery-based curing',
        'url': 'https://www.npr.org/sections/thesalt/2019/08/29/755115208/duped-in-the-deli-aisle-no-nitrates-added-labels-are-often-misleading'
      },
      {
        'name': 'Cornell LII: 7 CFR § 205.237 Livestock feed',
        'url': 'https://www.law.cornell.edu/cfr/text/7/205.237'
      },
      {
        'name': 'Cornell LII: 7 CFR § 205.239 Livestock living conditions',
        'url': 'https://www.law.cornell.edu/cfr/text/7/205.239'
      },
      {
        'name': 'Wikipedia: Mechanically separated meat',
        'url': 'https://en.wikipedia.org/wiki/Mechanically_separated_meat'
      },
      {
        'name': 'Reverence Farms: Organic feed and non-GMO feed',
        'url': 'https://reverencefarms.com/blogs/news/why-is-it-so-important-to-feed-organic-feed-isn-t-non-gmo-almost-as-good'
      }
    ],
    'avoid': 'Skip sausage listing mechanically separated chicken, turkey or pork.'
  },
  'pick_jerky': {
    'decision': 'Whole-muscle grass-fed, grass-finished beef jerky with a short list; celery powder in “uncured” jerky supplies nitrite.',
    'sources': [
      {
        'name': 'NDSU Extension: Jerky',
        'url': 'https://www.ndsu.edu/agriculture/extension/publications/jerky-native-american-inspired-snack-we-all-can-enjoy-today'
      },
      {
        'name': 'Cornell LII: 9 CFR § 317.17 Curing agents in the ingredients statement',
        'url': 'https://www.law.cornell.edu/cfr/text/9/317.17'
      },
      {
        'name': 'Consumer Reports: Decoding the labels on meat packages',
        'url': 'https://www.consumerreports.org/food/decoding-the-labels-on-meat-packages/'
      },
      {
        'name': 'NPR: No nitrates added labels and celery-based curing',
        'url': 'https://www.npr.org/sections/thesalt/2019/08/29/755115208/duped-in-the-deli-aisle-no-nitrates-added-labels-are-often-misleading'
      },
      {
        'name': 'American Grassfed Association: Our Standards',
        'url': 'https://www.americangrassfed.org/about-us/our-standards/'
      },
      {
        'name': 'Iowa State University Extension: Liquid smoke',
        'url': 'https://blogs.extension.iastate.edu/answerline/2019/04/18/liquid-smoke-that-controversial-condiment/'
      }
    ],
    'avoid': 'Skip jerky listing liquid smoke or smoke flavoring.'
  },
  'rotisserie_chicken': {
    'sources': [
      '9 CFR § 381.117 Name of product and other labeling (law.cornell.edu) https://www.law.cornell.edu/cfr/text/9/381.117',
      '9 CFR § 381.118 Ingredients statement (law.cornell.edu) https://www.law.cornell.edu/cfr/text/9/381.118',
      '9 CFR § 424.21 Use of food ingredients and sources of radiation (law.cornell.edu) https://www.law.cornell.edu/cfr/text/9/424.21',
      'USDA FSIS, Chicken from Farm to Table, Ready-Prepared Chicken https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/chicken-farm-table',
      'USDA FSIS, ‘Danger Zone’ (40°F - 140°F) https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/danger-zone-40f-140f',
      'USDA FSIS, Meat and Poultry Labeling Terms, Basted / Self basted https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/meat-and-poultry-labeling-terms',
      'Whole Foods Market Organic Rotisserie Chicken, ingredient list from the package (EWG Food Scores, UPC 099482803568) https://www.ewg.org/foodscores/products/099482803568-WholeFoodsMarketOrganicRotisserieChicken/',
      {
        'name': 'Dr. Cate Shanahan: The Hateful Eight seed oils',
        'url': 'https://drcate.com/hateful-eight/'
      },
      {
        'name': 'A Greener World: Animal Welfare Approved standards',
        'url': 'https://agreenerworld.org/certifications/animal-welfare-approved/standards/'
      },
      {
        'name': 'ASPCA: Food certification label guide',
        'url': 'https://www.aspca.org/shopkind/guide/food-certification-label-guide'
      }
    ],
    'buying_tips': [
      'A solution bird was injected with water and seasoning before it went on the spit.',
      'Look for a pasture-raised or certified organic bird on the sticker.',
      'Read the sticker, not the name. ‘Seasoned’, ‘original’ and ‘traditional’ are marketing; the ingredient list is regulated.',
      'The shortest list wins: chicken, salt, spices. Water as the second ingredient means a solution was added.',
      'Sodium phosphate, a starch or a sweetener after the water means a solution bird. The shorter the seasoning line, the plainer the chicken.',
      'A bird held under the lamp is held hot for a reason. Take one that is steaming, not one that has sat.',
      'Check the sticker for oil in the seasoning; choose olive oil or a bird with no added oil.',
      'Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.',
      'Skip a bird seasoned with avocado oil too.',
      'Look for “raised without antibiotics” on the sticker, with organic or Animal Welfare Approved behind it.'
    ]
  },
  'chicken_cuts_basics': {
    'sources': [
      'USDA FoodData Central (poultry composition)',
      'USDA FSIS poultry labeling terms',
      '9 CFR § 441.10 “Retained water in raw meat and poultry products” (Cornell LII) https://www.law.cornell.edu/cfr/text/9/441.10',
      'USDA FSIS poultry-chilling references',
      'USDA FSIS ‘raised without antibiotics’ guidance',
      'FDA antibiotic-residue rules',
      'Consumer Reports “Decoding the Labels on Meat Packages” https://www.consumerreports.org/food/decoding-the-labels-on-meat-packages/decoding-the-labels-on-meat-packages.html',
      'Rebel Pastures “The Truth About Chicken Labels: What You Need to Know” https://rebelpastures.com/blogs/real-talk-from-the-pasture/the-truth-about-chicken-labels-what-you-need-to-know',
      {
        'name': 'The Virtual Weber Bullet: Enhanced meat',
        'url': 'https://www.virtualweberbullet.com/enhanced-meat/'
      },
      {
        'name': 'A Greener World: Animal Welfare Approved standards',
        'url': 'https://agreenerworld.org/certifications/animal-welfare-approved/standards/'
      },
      {
        'name': 'ASPCA: Food certification label guide',
        'url': 'https://www.aspca.org/shopkind/guide/food-certification-label-guide'
      }
    ],
    'watch_out': [
      'Boneless skinless costs the most for the same bird.',
      'Water-chilled packages disclose ‘retained water up to’ a percentage. That percentage is the tank.',
      'No ‘retained water’ line on the label means none is allowed inside. The disclosure is required, not optional.',
      'Where air-chilled is not stocked, a regular bird still does the job. Pat it dry before it goes in the pan.',
      'Safe handling matters far more than the chilling method.',
      '‘Raised without antibiotics’ rests on the producer’s own affidavit to USDA. The agency does not inspect the farm, so oversight is weak. A third-party seal is what makes it checkable.',
      '‘Natural’ says nothing about antibiotics. It means no artificial ingredients were added after processing and the meat is minimally processed. A natural bird can be raised with antibiotics.',
      '‘No hormones’ on chicken is an empty claim. Hormones and steroids are not allowed in poultry, so every bird already qualifies.',
      'Organic is the seal that carries the antibiotic rule: organic feed only, no antibiotics.',
      'Skip chicken labeled “enhanced” or “contains up to X% of a solution”: water, salt and phosphates injected into the meat.',
      'A Certified Humane seal means the farm was audited; Animal Welfare Approved also requires pasture.'
    ]
  },
  'chicken_breast': {
    'sources': [
      'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/water-meat-poultry',
      'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7365903/',
      {
        'name': 'ASPCA: Food certification label guide',
        'url': 'https://www.aspca.org/shopkind/guide/food-certification-label-guide'
      },
      {
        'name': 'The Virtual Weber Bullet: Enhanced meat',
        'url': 'https://www.virtualweberbullet.com/enhanced-meat/'
      }
    ],
    'buying_tips': [
      'Boneless skinless breast dries fast in the pan; bone and skin cook better.',
      'Look for pasture-raised or certified organic breast, sold plain.',
      'Read the full product name for the solution percentage and ingredients.',
      'Fresh or frozen breast can be checked for the same solution disclosure.',
      'Read retained-water wording separately from the added flavoring ingredients.',
      'Look for “raised without antibiotics” and a Certified Humane seal on the pack.',
      'Air chilled or water chilled: see Chicken.'
    ],
    'watch_out': [
      '“Natural” does not exclude a flavoring solution.',
      'Retained chilling water is different from an added flavoring solution.',
      'The archived woody-breast study does not establish a dependable visual test for shoppers.',
      '“Enhanced” on a breast pack means an injected solution; the label states the percent.'
    ]
  },
  'turkey_whole': {
    'sources': [
      'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/turkey-farm-table',
      'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/water-meat-poultry',
      {
        'name': 'A Greener World: Animal Welfare Approved standards',
        'url': 'https://agreenerworld.org/certifications/animal-welfare-approved/standards/'
      },
      {
        'name': 'Reverence Farms: Organic feed and non-GMO feed',
        'url': 'https://reverencefarms.com/blogs/news/why-is-it-so-important-to-feed-organic-feed-isn-t-non-gmo-almost-as-good'
      },
      {
        'name': 'Food & Meat Co-op: Air chilled vs water chilled chicken',
        'url': 'https://foodandmeatcoop.com/blogs/news/air-chilled-vs-water-chilled-chicken-what-s-the-difference'
      },
      {
        'name': 'The Virtual Weber Bullet: Enhanced meat',
        'url': 'https://www.virtualweberbullet.com/enhanced-meat/'
      },
      {
        'name': 'ASPCA: Food certification label guide',
        'url': 'https://www.aspca.org/shopkind/guide/food-certification-label-guide'
      }
    ],
    'buying_tips': [
      'A basted or self-basted bird carries added broth, stock, fat or water.',
      'Look for a pasture-raised whole turkey, sold unbasted.',
      'Read the solution ingredients beside the product name.',
      'A frozen whole turkey can be checked for the same added-solution statement.',
      'Read retained-water wording separately from the flavoring-solution statement.',
      'Above pasture raised: Animal Welfare Approved, organic feed and “raised without antibiotics”.',
      'Air chilled turkey stays out of the water tank; “water chilled” birds retain some.'
    ],
    'watch_out': [
      '“Natural” can appear on products containing a flavoring solution.',
      'Retained water from chilling and an injected flavoring solution are different label disclosures.',
      '“Self-basting” or “enhanced” on the wrapper means an injected solution.'
    ]
  },
  'ground_turkey': {
    'sources': [
      'https://www.govinfo.gov/content/pkg/FR-2010-12-29/html/2010-32485.htm',
      'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/turkey-farm-table',
      {
        'name': 'Food & Meat Co-op: Air-chilled vs water-chilled chicken',
        'url': 'https://foodandmeatcoop.com/blogs/news/air-chilled-vs-water-chilled-chicken-what-s-the-difference'
      },
      {
        'name': 'A Greener World: Animal Welfare Approved standards',
        'url': 'https://agreenerworld.org/certifications/animal-welfare-approved/standards/'
      }
    ],
    'buying_tips': [
      'The name ground turkey sets no one fat level, so two packs can differ.',
      'Look for pasture-raised or certified organic ground turkey, sold plain.',
      'Look for “air-chilled” on the turkey pack.',
      'Choose a formulation listing turkey without added seasonings or a flavoring solution.',
      'Without a percent-lean claim, use the Nutrition Facts fat line to compare packs.',
      'Compare the fat content of the actual packs rather than assume one level for all ground turkey.',
      'An Animal Welfare Approved seal and “raised without antibiotics” back the pasture claim.'
    ]
  }
};

test('JC0 the batch is the BECAME table, and every id exists at base', () => {
  assert.deepEqual(nonEmpty(Object.keys(BECAME), 'J3 ids', 11).toSorted(), [...CLEAN_J3].toSorted());
  for (const id of CLEAN_J3) assert.ok(was(id) && live(id), id);
});

test('JC1 each batch id equals its base entry with only the BECAME fields set', () => {
  for (const [id, fields] of Object.entries(BECAME)) {
    if (LATER.has(id)) continue;
    assert.deepEqual(live(id), { ...was(id), ...fields }, id);
  }
});

test('JC2 every entry outside the batch is byte-equal to base', () => {
  const others = nonEmpty(kb.entries.filter((e) => !CLEAN_J3.has(e.id)), 'non-batch entries', 200);
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of others) assert.deepEqual(e, was(e.id), e.id);
});

test('JC3 decision moves only on rung rows; cart_pick never moves', () => {
  for (const id of CLEAN_J3) {
    if (LATER.has(id)) continue;
    assert.equal(live(id).cart_pick, was(id).cart_pick, `${id} cart_pick`);
    if (!RUNG.has(id)) assert.equal(live(id).decision, was(id).decision, `${id} decision`);
    else assert.notEqual(live(id).decision, was(id).decision, `${id} rung row kept its decision`);
  }
});

test('JC4 beef names no cost: the floor rung is relative, and the lowest-cost line is gone', () => {
  const text = JSON.stringify(live('beef_grassfed_vs_grainfed'));
  assert.doesNotMatch(text, /lowest-cost|costs? least|paying for|\bcheap/i);
  assert.ok(live('beef_grassfed_vs_grainfed').buying_tips.includes('When steaks are a stretch, ground beef and chuck still come from a whole-life grass animal.'));
  assert.doesNotMatch(JSON.stringify(live('butcher_counter_asking')), /cheap|free\./i);
});

test('JC5 no rung decision leads with organic, and no cart_pick names it', () => {
  for (const id of RUNG) {
    const first = live(id).decision.split(/\s+first\b|,\s*(?:then|else)\b|;\s*then\b|\bnever\b/i)[0];
    assert.doesNotMatch(first, /\borganic\b/i, id);
  }
  for (const id of CLEAN_J3) assert.doesNotMatch(live(id).cart_pick ?? '', /organic/i, id);
});

test('JC6 every batch entry is lint-clean', () => {
  for (const id of CLEAN_J3) {
    const e = live(id);
    assert.deepEqual(e.kind === 'pick' ? lintPick(e) : lintCard(projectEntry(e, { doLine: doLines[id] || '' })), [], id);
  }
});

test('JC7 every new source URL is archived verbatim under docs/sources/concerns', () => {
  const url = (s) => s.url ?? s;
  const urls = nonEmpty(Object.entries(BECAME).flatMap(([id, f]) => (f.sources ?? []).map(url).filter((u) => !(was(id).sources ?? []).some((s) => url(s) === u))), 'new URLs', 19);
  const archive = execFileSync('grep', ['-rhF', 'url:', 'docs/sources/concerns'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
  for (const u of urls) assert.ok(archive.includes(u), `${u} not archived`);
});
