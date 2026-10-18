// W2: the produce rule belongs to the section; grocery rows reach food families.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import tips from '../../lib/sectionRules.json' with { type: 'json' };
import { nonEmpty } from '../../lib/testGuards.js';
import { beforeTwoLine } from './twoLinePin.js';
import { attachCards, collapseByCard, matchItemToCard } from '../../lib/listMatch.js';
import { answerCounterQuestion } from '../../lib/counterAskPipeline.js';
import { kindFor } from '../../lib/counterCards.js';
import { lintSections } from '../../lib/counterCardLint.js';

const entries = nonEmpty(kb.entries, 'W2 corpus');
const byId = (id) => {
  const entry = entries.find((e) => e.id === id);
  assert.ok(entry, `${id} missing`);
  return entry;
};
const ITEM_ALIASES = nonEmpty([
  'onions', 'onion', 'kiwi', 'kiwis', 'potatoes', 'potato', 'apples', 'apple',
  'grapes', 'leafy greens', 'kale', 'spinach', 'lettuce',
], 'W2 item aliases', 13);
const FAMILIES = nonEmpty([
  ['produce_apples_pears', ['apples', 'apple']],
  ['produce_onions_garlic', ['onions', 'onion']],
  ['produce_root_vegetables', ['potatoes', 'potato']],
  ['produce_leafy_greens', ['leafy greens', 'kale', 'spinach', 'lettuce']],
], 'W2 family owners', 4);

test('W2 organic question card carries no grocery item aliases', () => {
  const aliases = nonEmpty(byId('organic_worth_it_by_type').aliases, 'organic question aliases');
  for (const alias of ITEM_ALIASES) assert.ok(!aliases.includes(alias), `organic hub owns ${alias}`);
});

test('W2 each moved noun reaches its family, including lettuce rather than home technique', () => {
  for (const [id, nouns] of FAMILIES) {
    const aliases = nonEmpty(byId(id).aliases, `${id} aliases`);
    for (const noun of nonEmpty(nouns, `${id} grocery nouns`)) {
      assert.ok(aliases.includes(noun), `${id} lacks ${noun}`);
      assert.equal(matchItemToCard(noun)?.slug, id, noun);
    }
  }
  assert.equal(kindFor('revive_greens'), 'home');
  assert.ok(!nonEmpty(byId('revive_greens').aliases, 'revival aliases').includes('lettuce'));
});

test('W2 eight produce rows collapse to five family cards without losing foods', () => {
  const names = nonEmpty([
    'apples', 'onions', 'potatoes', 'kale', 'spinach', 'blueberries', 'strawberries', 'raspberries',
  ], 'W2 grocery list', 8);
  const list = attachCards({ items: names.map((name) => ({ name, source: 'user', category: 'Produce' })) }, { log: false });
  const rows = nonEmpty(list.items, 'W2 attached rows', 8);
  const groups = nonEmpty(collapseByCard(rows), 'W2 collapsed cards', 5);
  assert.deepEqual(groups.map(({ slug, items }) => [slug, items.map((i) => i.name)]), [
    ['produce_apples_pears', ['apples']],
    ['produce_onions_garlic', ['onions']],
    ['produce_root_vegetables', ['potatoes']],
    ['produce_leafy_greens', ['kale', 'spinach']],
    ['berries_picking', ['blueberries', 'strawberries', 'raspberries']],
  ]);
  for (const row of rows) assert.notEqual(row.cardSlug, 'organic_worth_it_by_type');
});

test('W2 counter still answers is organic worth it from the organic card', async () => {
  // Keep the pipeline's usage-count bookkeeping in memory.
  const offline = {
    from() {
      let chain;
      chain = new Proxy({}, {
        get: (_, key) => key === 'then'
          ? (resolve) => Promise.resolve({ data: [], error: null }).then(resolve)
          : () => chain,
      });
      return chain;
    },
  };
  const out = await answerCounterQuestion({
    query: 'is organic worth it', allowGeneration: false,
    client: offline,
  });
  assert.equal(out.matched, true);
  assert.equal(out.card?.slug, 'organic_worth_it_by_type');
  assert.equal(out.source, 'curated');
});

test('W2 grapes and kiwi remain honest misses in the produce section', () => {
  const names = nonEmpty(['grapes', 'grape', 'kiwi', 'kiwis'], 'W2 uncovered fruit', 4);
  const list = attachCards({ items: names.map((name) => ({ name, source: 'user', category: 'Produce' })) }, { log: false });
  for (const group of nonEmpty(collapseByCard(list.items), 'W2 uncovered groups', 4)) {
    assert.equal(group.slug, null);
    assert.equal(group.section, 'produce');
    for (const row of nonEmpty(group.items, 'W2 uncovered rows')) assert.equal(row.pickId, undefined);
  }
});

test('W2 produce fronts leave the skin rule in the section and have distinct openers', () => {
  const produce = nonEmpty(entries.filter((e) => e.category === 'produce' && e.kind !== 'pick'), 'W2 produce cards');
  const sectionTips = nonEmpty(tips.filter((t) => t.section === 'produce'), 'W2 produce section');
  assert.equal(sectionTips[0].rule, 'Organic on anything you eat the skin of.');
  assert.deepEqual(lintSections(sectionTips, produce), []);
  const openers = new Map();
  for (const e of produce) {
    assert.ok(e.decision?.trim(), `${e.id} has no decision`);
    assert.ok(!(/organic/i.test(e.decision) && /skin/i.test(e.decision)), `${e.id}: organic + skin front`);
    const opener = e.decision.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).slice(0, 3).join(' ');
    assert.ok(!openers.has(opener), `${e.id} shares opener with ${openers.get(opener)}`);
    openers.set(opener, e.id);
  }
});

// W4 exact-copy re-pins; all other historical fields remain asserted below.
const W4_COPY = {
  "beef_grassfed_vs_grainfed": {
    "decision": "100% grass-fed or grass-finished beef, no added hormones, a certifier’s seal.",
    "why": "Grass after weaning, no grain and no feedlot. A grass finish gives you leaner beef with a different fat balance.",
    "kristy_take": "Go gently with the heat: this leaner beef dries out at feedlot-beef heat. Look for whole-life words backed by a seal.",
    "instead": "Grass-finished ground beef or chuck: grass after weaning, no grain or feedlot, in the cut that costs least."
  },
  "rotisserie_chicken": {
    "decision": "Rotisserie chicken with salt and spices, without phosphate or starch.",
    "why": "A plain bird is chicken, salt and spices, roasted in the store. Phosphate and starch go in with a needle.",
    "kristy_take": "Take a steaming bird from under the lamp and turn to the sticker. Every ingredient runs in descending order; a solution must name its percent and contents."
  },
  "beef_cuts_basics": {
    "decision": "Whole chuck or round, without needles or blades pushed through.",
    "why": "Chuck is shoulder and round is rear leg: both are working muscles, sold whole.",
    "kristy_take": "The cut name tells you where on the animal the meat came from. Raw beef pushed through needles or blades must also say ‘mechanically tenderized’ in its name."
  },
  "ground_beef_lean_ratio": {
    "decision": "Organ blend with each organ’s percentage first, then nothing-added ground beef.",
    "why": "An organ blend folds liver and heart into a familiar grind. Printed shares tell you how much of each.",
    "kristy_take": "Federal rules keep added water, binders and organs out of ‘ground beef’, so a blend needs its own name. Plain ‘ground beef’ allows no added fat either; ‘hamburger’ may add fat."
  },
  "egg_labels": {
    "decision": "Eggs with pasture-raised, organic, corn- and soy-free on one carton.",
    "why": "A hen eats what she is given. Organic, pasture and feed words tell you about both her food and her life.",
    "kristy_take": "Pasture alone leaves the feed question open. Find all three claims together, then check the pack date: a fresh egg fries with a tall yolk and tight white."
  },
  "organic_worth_it_by_type": {
    "decision": "Organic produce eaten whole; conventional fruit and vegetables you peel.",
    "why": "Surface residue leaves with a discarded peel. On berries and apples, you eat the skin along with the flesh.",
    "kristy_take": "An avocado or kiwi can feel delicate and still have a peel you throw away. Choose conventional there; keep organic for the produce you eat whole."
  },
  "frozen_vs_fresh_produce": {
    "decision": "Frozen vegetables, picked ripe and frozen within hours.",
    "why": "Freezing holds vegetables at the ripeness they were picked. ‘Fresh’ produce can lose nutrients over days in transit.",
    "kristy_take": "Leave half a freezer for vegetables and berries to use in soups, smoothies and sheet-pan roasts. Plain frozen produce needs no additives and is there in every season, with no spoilage waste."
  },
  "freezing_produce": {
    "decision": "Briefly scalded vegetables for the freezer; fruit goes in raw.",
    "why": "A brief scald stops the enzymes that would leave frozen beans gray and tasting of hay months later.",
    "kristy_take": "Sixty seconds in boiling water, then straight into ice water. Dry the vegetables and freeze them on a tray before bagging, so the pieces stay separate."
  },
  "produce_seasonality": {
    "decision": "In-season produce, picked closer to ripe with less distance to travel.",
    "why": "A January orange tastes better than a July one. Produce in season usually travels less and reaches you closer to ripe.",
    "kristy_take": "Let the piles in the produce section guide the week: spring greens, summer tomatoes, autumn squash, winter citrus. Off-season, reach for frozen over pale fresh produce."
  },
  "washing_produce": {
    "decision": "Plain cold water for produce, as effective as a produce wash.",
    "why": "Cold water and a little rubbing lift dirt, microbes and some residue. Produce washes have not proved better.",
    "kristy_take": "Brush firm produce; rinse and spin leafy greens. Leave berries and mushrooms dry until you are ready to eat them, and skip the ‘veggie wash’."
  },
  "baking_soda_soak": {
    "decision": "Baking soda water for residue that a plain rinse leaves.",
    "why": "Bicarbonate needs minutes to break down some residue on fruit skin. A quick rinse moves dirt.",
    "kristy_take": "Give the soak twelve to fifteen minutes, then rinse the soda off with plain water. Residue already inside the fruit stays there."
  },
  "precut_produce_tradeoffs": {
    "decision": "Whole produce before pre-cut: cutting starts vitamin loss and browning.",
    "why": "Whole produce can wait for the day you need it. Once cut, it keeps for days rather than weeks.",
    "kristy_take": "Two minutes of cutting at home buys a week longer in the fridge. For pre-cut melon or pineapple, choose it on the day you will eat it."
  },
  "judging_meat_at_the_case": {
    "decision": "The meat pack with the newest ‘packaged on’ date.",
    "why": "Oxygen turns a cut steak cherry-red; a vacuum-packed roast stays purple. Color alone cannot tell you freshness.",
    "kristy_take": "Choose a sealed pack without leaks, then smell the meat at home. No off smell or slime: those checks tell you more than the store’s sticker."
  },
  "butcher_counter_asking": {
    "decision": "Beef soup bones and a whole chuck, freshly ground.",
    "why": "A whole chuck ground at the counter lets you choose the cut. The butcher can tell you when it was cut.",
    "kristy_take": "Start with what came in today, then how it was raised and what was added. Bones, trim and portioning are worth asking for while you are at the counter."
  },
  "chicken_cuts_basics": {
    "decision": "Air-chilled whole chicken first, then bone-in, skin-on thighs.",
    "why": "Thighs carry more fat and flavor, so they stay juicy and are hard to overcook. The skin renders and bastes as they cook.",
    "kristy_take": "A whole bird gives you breast, dark meat and a frame for stock. For thighs, keep the bone and skin: they give you more room at the stove than boneless skinless."
  },
  "pork_cuts_and_enhanced": {
    "decision": "Plain pork, with no added-solution percentage on its label.",
    "why": "Pork is often pumped with water, salt and phosphates to hold moisture. A plain pack leaves that solution out.",
    "kristy_take": "An ‘up to 12% solution’ line means some of that pack is added water. Raw meat with added solution must give its name, percentage and contents beside the product name."
  },
  "produce_ripeness_by_item": {
    "decision": "The heavier of two same-size pieces of fruit for more juice.",
    "why": "Compare two pieces in your hands. More weight means more water rather than pith, a better guide than color.",
    "kristy_take": "Use your palm to feel a peach’s shoulder for a little give; fingertips leave bruises. Choose staggered firmness so the fruit ripens across the week."
  },
  "berries_picking": {
    "decision": "Organic berries in a cold carton with a dry, clean underside.",
    "why": "The bottom berries carry the weight and mold first, while the top can still look fresh.",
    "kristy_take": "Berries will not ripen further at home, so buy them ready. Turn the carton over: a dry bottom, no fuzzy fruit. Keep them cold and wash just before eating."
  },
  "produce_storage": {
    "decision": "Unwashed produce for storing; wash it when you use it.",
    "why": "Water left on a leaf or berry is where mold starts. Keeping greens dry gives them longer in the drawer.",
    "kristy_take": "Half of what rots in a fridge was rinsed on the way in. Store greens dry with a towel, away from ripening-gas fruit; stand herbs and asparagus in a little water."
  },
  "revive_greens": {
    "decision": "Limp greens without decay, ready for a cold-water soak.",
    "why": "Cold water refills a limp leaf’s slack cells. As the water returns, the leaf stands firm again.",
    "kristy_take": "Give wilted greens half an hour in cold water, then dry them before putting them away. Yellowing, slime or a smell means decay; a soak cannot bring those leaves back."
  },
  "sprouts_raw": {
    "decision": "Cold-case sprouts; warm, damp growing conditions also suit bacteria.",
    "why": "Crisp stems and white roots are what to look for in a cold clamshell. Sprouts go slick and sour before they look wrong.",
    "kristy_take": "A jar and a mesh lid let you grow your own crop and know where it came from. Bought sprouts belong in the cold case; warm displays leave them in growing conditions."
  },
  "produce_root_vegetables": {
    "decision": "Firm organic potatoes, conventional carrots, with nothing soft or sprouting.",
    "why": "Potatoes, carrots, beets and sweet potatoes should feel firm. Soft, shriveled or sprouting roots stay behind.",
    "kristy_take": "Wilted beet leaves need not put you off a firm root. Cut the tops off carrots before storing them; left attached, they wilt the carrot."
  },
  "produce_brassicas": {
    "decision": "Conventional cabbage and cauliflower with tight heads and no soft spots.",
    "why": "Tight, dark green broccoli florets are fresh. Enlarged, open or yellowish-green ones are past fresh.",
    "kristy_take": "A soft or slippery head is spoiling. Use broccoli early in the week; it keeps about three days, while wrapped cabbage can wait several weeks in the fridge."
  },
  "produce_onions_garlic": {
    "decision": "Conventional onions and garlic: firm, dry, papery skins, no sprouts or mold.",
    "why": "A well-cured bulb feels dry at the neck and papery outside. A soft, scented or sprouting bulb is already on its way out.",
    "kristy_take": "A few loose onion skins are normal. Squeeze for firmness and little scent, then store whole onions where air can move, away from damp potatoes."
  },
  "produce_leafy_greens": {
    "decision": "Crisp organic greens, evenly colored, without wilt or yellowing.",
    "why": "Spinach is highly perishable, and kale wilts in warmth. A leaf that still stands crisp tells you it has freshness left.",
    "kristy_take": "For milder, more tender kale, choose the smaller leaves on moist stems. Keep the bunch cold from the cart to the crisper, and wash it when you use it."
  },
  "produce_peppers": {
    "decision": "Firm organic peppers, evenly colored, without cracks or soft spots.",
    "why": "A pepper should feel firm when you hold it. Wrinkled skin means it has lost water in storage.",
    "kristy_take": "Red, yellow and orange peppers tolerate cold better than green ones. In a fridge at 41°F, plan on about two weeks; leave any cracked or bruised pepper at the bin."
  },
  "produce_apples_pears": {
    "decision": "Unbruised organic apples and pears, with no spoiled fruit alongside.",
    "why": "Apples should feel crisp. A firm green Bartlett pear can ripen at home, turning sweet, juicy and buttery.",
    "kristy_take": "Turn each fruit before bagging it. Damaged fruit spoils in storage and speeds ripening and rot in its sound neighbors, so leave bruised apples and pears behind."
  },
  "produce_citrus": {
    "decision": "Firm, smooth conventional citrus; organic for zest, without drying or shriveling.",
    "why": "Yellow limes carry more juice. A partly green orange can be fully mature, so feel for a firm, smooth rind.",
    "kristy_take": "UC Davis’s checks are firmness and a sound rind: leave decay and shriveling behind. Use yellowed lemons and limes first; green-picked ones keep longest."
  },
  "produce_stone_fruit": {
    "decision": "Unbruised organic peaches, plums, nectarines and cherries, with fully turned color.",
    "why": "A peach’s green background turns yellow as it readies. Michigan Fresh advises unbruised peaches, plums and cherries.",
    "kristy_take": "Nectarines turn from green to yellow too; plums need their variety’s color. Check cherries for green, fleshy stems and full color. Skin staining can be cosmetic, but bruises and damage stay behind."
  },
  "pick_frozen_peas": {
    "decision": "Peas frozen solid, with no pack drips or off smell."
  },
  "pick_frozen_broccoli": {
    "decision": "Broccoli frozen solid; pack drips or off smell mean it thawed."
  },
  "pick_cucumbers": {
    "decision": "Firm, dark green cucumbers, without soft spots or a bulging middle."
  },
  "pick_asparagus": {
    "decision": "Asparagus with dry, closed, compact tips and no limp stalks."
  },
  "pick_corn": {
    "decision": "Corn with green husks and fresh silk, without dried-out ears."
  },
  "pick_eggplant": {
    "decision": "Heavy, shiny, smooth eggplant, with a green stem free of mold."
  },
  "pick_zucchini": {
    "decision": "Small-to-medium zucchini, glossy and firm, that feel heavy for their size."
  },
  "pick_cilantro": {
    "decision": "Bright, upright cilantro bunches, without yellow or brown leaves."
  },
  "pick_parsley": {
    "decision": "Upright, bright green parsley, without brown spots or yellowed leaves."
  },
  "pick_basil": {
    "decision": "Bright, upright basil with no limp leaves or brown spots."
  },
  "pick_snap_peas": {
    "decision": "Firm, bright green snap pea pods, without blemishes."
  },
  "pick_kohlrabi": {
    "decision": "Firm kohlrabi bulbs, heavy in your hand, without cracks or bruises."
  },
  "pick_okra": {
    "decision": "Firm, bright green okra, without limp, moldy or dried-out pods."
  },
  "pick_swiss_chard": {
    "decision": "Dark green chard with unsplit stalks and no discoloration."
  },
  "pick_mangoes": {
    "decision": "Mangoes yielding slightly under gentle pressure; red color does not indicate ripeness."
  },
  "pick_sausage": {
    "decision": "Seasoned ground-meat sausage with every curing agent named in its ingredients."
  },
  "pick_tofu": {
    "decision": "Tofu by firmness: soybeans, water, coagulant such as nigari or gypsum."
  },
  "pick_celery": {
    "decision": "Celery with tight, crisp stalks, without any limpness in the bunch."
  },
  "sandwich_bread": {
    "decision": "Whole wheat sandwich bread, with the grain’s bran and germ intact.",
    "why": "Whole wheat flour keeps the bran and germ along with the rest of the grain, in their natural proportions.",
    "kristy_take": "A loaf called “wheat” may still use refined flour. Turn it over and find whole wheat flour in the ingredients before choosing it."
  },
  "sourdough": {
    "decision": "Sourdough raised with a starter of wild yeast and bacteria.",
    "why": "A flour-and-water starter lets wild yeast and bacteria raise the dough and develop its sour flavor.",
    "kristy_take": "That sourness can also come from added acids. If the starter is missing from the list, the baker can tell you how the loaf rose."
  },
  "bagels": {
    "decision": "Bagels boiled before the oven, with their ingredients named.",
    "why": "The boil sets a bagel’s outside and gives it that chew. A longer boil can make the crust chewier and the middle denser.",
    "kristy_take": "Ask what went into the dough and the boiling bath, or read the ingredients on the bag. Boiling explains the texture; the archived baking articles establish no health advantage."
  },
  "tortillas": {
    "decision": "Corn tortillas made with lime-treated corn, water and salt.",
    "why": "Masa is corn cooked and soaked in limewater, then ground into dough. Water and salt complete the tortilla recipe.",
    "kristy_take": "Masa harina is the dried, ground dough; plain corn flour is a different ingredient. Check the bag for wheat too, since some corn tortillas contain both."
  },
  "turkey_whole": {
    "decision": "Plain whole turkey, without an injected basting solution.",
    "why": "A plain turkey has nothing added. A basted bird can carry broth, stock, fat or water in an added solution.",
    "kristy_take": "Fresh or frozen, read beside the name for a basting solution and its ingredients. Water left from chilling is a separate disclosure, so read the two lines separately."
  },
  "ground_turkey": {
    "decision": "Plain ground turkey, with ingredients and fat content on the label.",
    "why": "Two packs of ground turkey can have different fat contents. Read the fat line to see what you are taking home.",
    "kristy_take": "Look for turkey on the ingredient list, with no added seasoning or flavoring solution. A percent-lean claim must have its percent-fat statement alongside."
  },
  "chicken_breast": {
    "decision": "Plain bone-in, skin-on breast before boneless skinless; no added solution.",
    "why": "Bone-in, skin-on breast cooks better than boneless skinless, which dries fast in the pan.",
    "kristy_take": "A plain breast gives you only chicken. Added flavoring solution must appear in the product name with its amount, even on a pack labeled ‘natural’."
  },
  "produce_mushrooms": {
    "decision": "Dry, firm conventional mushrooms with no dark spots.",
    "why": "Closed caps taste milder; open caps with gills showing taste stronger. Dry, firm caps are the fresh ones.",
    "kristy_take": "Choose closed or slightly open caps and take only as many as you need. Keep them cold and unwashed in paper; trapped moisture spoils mushrooms."
  },
  "produce_bananas": {
    "decision": "Green bananas to finish ripening on your counter.",
    "why": "Bananas get sweeter as the green fades at home. Left to ripen on the plant, they often split and lose texture.",
    "kristy_take": "Take the greenest bunch for the week and let the counter finish it. Conventional is fine here, since the peel comes off; keep green bananas out of the fridge."
  },
  "produce_green_beans": {
    "decision": "Smooth, crisp, slender organic beans, without bulging seeds.",
    "why": "A crisp pod with flat seeds is a young bean. Bulging seeds mean an older bean turning tough, stringy and starchy.",
    "kristy_take": "Run your eye along the pods for smooth sides and hidden seeds. Keep the beans cold and use them within five days, leaving any sticky or brown-spotted ones behind."
  },
  "egg_duck_quail": {
    "decision": "Clean, cold duck and quail eggs; cook white and yolk solid.",
    "why": "Duck eggs need longer to cook than hens’ eggs. Salmonella incidents are the reason to cook them thoroughly.",
    "kristy_take": "Open the carton for clean, uncracked shells and keep the eggs cold at home. Duck or quail, cook until both yolk and white are firm."
  },
  "pick_winter_squash": {
    "decision": "Firm, heavy-for-size squash with hard skin, without sunken or moldy spots."
  },
  "pick_ginger_turmeric": {
    "decision": "Firm roots, ginger smooth and uncracked; keep both sealed and refrigerated."
  },
  "pick_microgreens": {
    "decision": "Microgreens, rarely washed before packing, for you to rinse before use."
  },
  "pick_egg_whites": {
    "decision": "Carton whites: pasteurized or otherwise treated per federal standard, destroying Salmonella."
  },
  "lamb_goat": {
    "decision": "Lamb or goat labeled 100% grass-fed or grass-finished.",
    "why": "For goat, look at the flesh: firm and fine-grained with white fat. There are no goat quality grades to guide you.",
    "kristy_take": "Lamb grading is voluntary and takes age into account. Check for firm, fine-textured meat with white marbling, and read the cut name, such as shoulder or leg."
  },
  "organ_meats": {
    "decision": "Organ meats for cooking within one to two days.",
    "why": "Heart and tongue suit cooking in liquid. Liver can be pan-fried; tripe needs a braise to turn tender.",
    "kristy_take": "Choose the organ with a meal in mind: variety meats keep less time than steaks and roasts. Cook within one to two days, and take all organ meats to 160°F."
  },
  "bison": {
    "decision": "Bison with 100% grass-fed or grass-finished labeling and an inspection mark.",
    "why": "Bison is a bovine meat with no marbling, so expect a deeper red than beef. High heat can turn it tough.",
    "kristy_take": "Find a federal or state inspection mark, then follow beef’s keeping and cooking rules. Ground bison should be cooked or frozen within 2 days."
  },
  "venison_game": {
    "decision": "Fat-trimmed venison from a fully refrigerated processor.",
    "why": "Game often comes through small shops. Cold handling at the processor decides its safety.",
    "kristy_take": "Plan a meal within two or three days of bringing unfrozen venison home. Trim the fat and cook whole cuts to 145°F, ground game to 160°F."
  },
  "pick_jerky": {
    "decision": "Dried-meat jerky with the meat and any curing agent named in ingredients."
  },
  "pick_soup_bones": {
    "decision": "Ask your meat counter for marrow or knuckle soup bones."
  },
  "sprouted_grain_bread": {
    "decision": "Sprouted whole grains first in your bread, without added flour.",
    "why": "The grains sprout before milling, and the loaf tends to feel denser and heavier than bread made from flour.",
    "kristy_take": "Look in the cold or freezer case for sprouted whole grains first on the list, with no extra flour following. Sprouted wheat still contains gluten."
  },
  "gluten_free_bread": {
    "decision": "Gluten-free labeled bread, with its flours and binder checked.",
    "why": "Blended flours and starches replace wheat. A gum binder gives back some of the stretch gluten would provide.",
    "kristy_take": "Four label wordings share one federal gluten limit, and that claim covers gluten alone. Read which flours and binder hold this particular loaf together."
  },
  "bread_aisle": {
    "decision": "Your chosen bread type, with “whole” in the first flour.",
    "why": "The first flour and the Whole Grain Stamp help you find a whole grain loaf among the refined ones.",
    "kristy_take": "“Wheat flour”, “multigrain” and “stoneground” on the front can leave the grain question open. “100% whole wheat” or “100% whole grain” gives you a clearer answer."
  }
};

test('W2 changes only named produce aliases and fronts, preserving claims and card count', () => {
  const before = JSON.parse(execFileSync('git', ['show', '9fea1ee:server/kristy_perimeter_kb.json'], {
    cwd: fileURLToPath(new URL('../../../', import.meta.url)), maxBuffer: 64 << 20,
  }).toString());
  const oldEntries = nonEmpty(before.entries, 'W2 baseline corpus');
  const decisions = {
    organic_worth_it_by_type: 'Organic produce eaten whole; conventional fruit and vegetables you peel.',
    produce_onions_garlic: 'Conventional onions and garlic: firm, dry, papery skins, no sprouts or mold.',
    produce_stone_fruit: 'Unbruised organic peaches, plums, nectarines and cherries, with fully turned color.',
    produce_mushrooms: 'Dry, firm conventional mushrooms with no dark spots.',
  };
  const moved = new Map(FAMILIES);
  const expected = oldEntries.map((old) => {
    const e = structuredClone(old);
    if (e.id === 'organic_worth_it_by_type') e.aliases = e.aliases.filter((a) => !ITEM_ALIASES.includes(a));
    if (e.id === 'revive_greens') e.aliases = e.aliases.filter((a) => a !== 'lettuce');
    const added = (moved.get(e.id) || []).filter((a) => !e.aliases.includes(a));
    if (added.length) e.aliases = [...added, ...e.aliases];
    if (decisions[e.id]) e.decision = decisions[e.id];
    return { ...e, ...W4_COPY[e.id] };
  });
  // The two-line rewrite (2026-10-17) owns decision/buying_tips now: twoLinePin.test.js.
  assert.deepEqual({ ...kb, entries: kb.entries.map(beforeTwoLine) }, { ...before, entries: expected });
  assert.equal(entries.filter((e) => e.kind !== 'pick').length, 181);
});
