// CA-7: the "If you can't get it" ladder on fifteen eggs_dairy cards. Written by the admin; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as lint from '../../lib/counterCardLint.js';
import { projectEntry } from '../../lib/counterCards.js';
import { nonEmpty } from '../../lib/testGuards.js';

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ROOT = join(SERVER, '..');
const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
const base = JSON.parse(execFileSync('git', ['show', '9854ae1:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const doLines = JSON.parse(readFileSync(join(SERVER, 'lib', 'doLines.json'), 'utf8'));
const now = (id) => kb.entries.find((e) => e.id === id);
const was = (id) => base.entries.find((e) => e.id === id);

const IDS = ['whole_vs_reduced_fat_milk', 'raw_milk', 'egg_labels', 'grassfed_butter', 'cheese_real_vs_processed',
  'yogurt_plain_vs_flavored', 'raw_kefir', 'plain_kefir', 'raw_aged_cheese', 'sour_cream', 'cream_cheese',
  'cottage_cheese', 'ice_cream', 'ghee', 'goat_sheep_dairy'];
const LADDER = /^If you can['’]t get [^:]{2,40}: [^:]+\.$/;
const FIRST_PERSON = /\b(i|me|my|we|our|us)\b/i;
const PRICE = /\$|\b(price|prices|cost|costs|cheap|cheaper|expensive|budget|dollars?|save|savings|deal)\b/i;
const BANNED = /\b(treat\w*|prevent\w*|risk\w*|cure\w*|heal\w*|detox\w*|avocado oil)\b/i;

test('A1 every batch card exists and carries a ladder instead line', () => {
  nonEmpty(IDS.map(now).filter(Boolean), 'batch cards', IDS.length);
  for (const id of IDS) {
    const { instead } = now(id);
    assert.match(instead ?? '', LADDER, `${id}: instead not in "If you can't get X: Y." form`);
    assert.ok(instead.length <= 110, `${id}: instead over 110 chars`);
    for (const re of [FIRST_PERSON, PRICE, BANNED, /—/]) assert.doesNotMatch(instead, re, `${id}: ${re}`);
  }
});

test('A2 milk names the store shelf as a raw source and the full next rung', () => {
  const milk = now('whole_vs_reduced_fat_milk');
  assert.doesNotMatch(milk.decision, /farmer/i, 'milk decision still assumes a farmer');
  assert.match(milk.decision, /raw/i);
  assert.match(milk.instead, /^If you can['’]t get raw: /);
  for (const w of [/low-temp/i, /organic/i, /100% grass-fed/i]) assert.match(milk.instead, w);
});

test('A3 batch cards stay lint-clean; corpus clean', () => {
  for (const id of IDS) {
    const e = now(id);
    assert.deepEqual(lint.lintCard(projectEntry(e, { doLine: doLines[id] || '' })), [], id);
    assert.deepEqual(lint.headlineHedge(e.decision), [], id);
    assert.ok(e.decision.length <= 90, `${id}: decision over 90 chars`);
    for (const re of [FIRST_PERSON, PRICE, BANNED, /—/]) assert.doesNotMatch(e.decision, re, `${id}: ${re}`);
  }
  assert.deepEqual(lint.lintCorpus(kb.entries.filter((e) => e.kind !== 'pick').map((e) => projectEntry(e, { doLine: doLines[e.id] }))).violations, []);
});

// W4/W5 exact-copy re-pins; all other historical fields remain asserted below.
const W4_COPY = {
  "beef_grassfed_vs_grainfed": {
    "decision": "You’re looking for grass-finished beef, raised on grass all the way.",
    "why": "Grass after weaning, no grain and no feedlot. A grass finish gives you leaner beef with a different fat balance.",
    "kristy_take": "Go gently with the heat: this leaner beef dries out at feedlot-beef heat. Look for whole-life words backed by a seal.",
    "instead": "Grass-finished ground beef or chuck: grass after weaning, no grain or feedlot, in the cut that costs least.",
    "buying_tips": [
      "On the label, “100% grass-fed” or “grass-finished” tells you the finish. Look for no added hormones and a certifier’s seal, too.",
      "Ground and chuck are the lowest-cost way into a whole-life grass animal.",
      "At the counter, ask what the animal was finished on and for how long.",
      "‘100% grass-fed’ and ‘grass-finished’ mean the same thing. Either one is the claim."
    ]
  },
  "rotisserie_chicken": {
    "decision": "The plain rotisserie chicken is the one to bring home.",
    "why": "A plain bird is chicken, salt and spices, roasted in the store. Phosphate and starch go in with a needle.",
    "kristy_take": "Take a steaming bird from under the lamp and turn to the sticker. Every ingredient runs in descending order; a solution must name its percent and contents.",
    "buying_tips": [
      "Turn to the sticker: chicken, salt and spices make a plain bird. “Seasoned”, “original” and “traditional” alone tell you little.",
      "The shortest list wins: chicken, salt, spices. Water as the second ingredient means a solution was added.",
      "Sodium phosphate, a starch or a sweetener after the water means a solution bird. The shorter the seasoning line, the plainer the chicken.",
      "A bird held under the lamp is held hot for a reason. Take one that is steaming, not one that has sat.",
      "Read the sticker, not the name. ‘Seasoned’, ‘original’ and ‘traditional’ are marketing; the ingredient list is regulated."
    ]
  },
  "beef_cuts_basics": {
    "decision": "Whole chuck or round gives you beef without needles or blades.",
    "why": "Chuck is shoulder and round is rear leg: both are working muscles, sold whole.",
    "kristy_take": "The cut name tells you where on the animal the meat came from. Raw beef pushed through needles or blades must also say ‘mechanically tenderized’ in its name.",
    "buying_tips": [
      "The name tells you whether needles or blades went through it: look for “mechanically”, “needle” or “blade” tenderized.",
      "Loin and rib sit along the back and do little work.",
      "Read the name for ‘mechanically’, ‘needle’ or ‘blade’ tenderized.",
      "Ground chuck runs around 80/20 lean to fat.",
      "Prime, Choice, Select is a marbling scale, top to bottom.",
      "Grading is voluntary. Ungraded is not a downgrade.",
      "Grade and sourcing are separate questions. Neither answers the other.",
      "Chuck is shoulder and round is rear leg: the working muscles."
    ]
  },
  "ground_beef_lean_ratio": {
    "decision": "A beef organ blend works when you know each organ’s share.",
    "why": "An organ blend folds liver and heart into a familiar grind. Printed shares tell you how much of each.",
    "kristy_take": "Federal rules keep added water, binders and organs out of ‘ground beef’, so a blend needs its own name. Plain ‘ground beef’ allows no added fat either; ‘hamburger’ may add fat.",
    "buying_tips": [
      "Check the printed percentages for liver and heart; they tell you how much organ is folded into the grind.",
      "Read the ingredient list: beef, with seasoning at most, no water or phosphates.",
      "‘Ground chuck/round/sirloin’ tells you the cut it came from.",
      "The product name will not say ‘ground beef’ alone; a blend has to carry its own descriptive name.",
      "Read the name: ‘ground beef’ may not have beef fat added as such; ‘hamburger’ may."
    ]
  },
  "egg_labels": {
    "decision": "For eggs, organic feed and pasture-raised belong on the same carton.",
    "why": "A hen eats what she is given. Organic, pasture and feed words tell you about both her food and her life.",
    "kristy_take": "Pasture alone leaves the feed question open. Find all three claims together, then check the pack date: a fresh egg fries with a tall yolk and tight white.",
    "buying_tips": [
      "On one carton, you want pasture-raised, organic, corn-free and soy-free. The feed words tell you what went into the hens’ trough.",
      "Organic reaches the feed from another direction: organic feed, no GMOs, no routine antibiotics.",
      "‘Pasture-raised’ plus Certified Humane or Animal Welfare Approved is the strongest space claim.",
      "Farm stands and farmers markets are where soy-free actually lives. Ask the person who keeps the hens.",
      "Plain conventional eggs are still one of the lowest-cost animal foods in the store.",
      "Shell color is the breed. White and brown are the same egg inside.",
      "Speckles and small rough patches are normal shell variation.",
      "Find the three-digit pack date beside the plant code. Closer to today is fresher.",
      "Open the carton and check for cracks and leaks before it goes in the cart.",
      "Float test at home: flat on the bottom is fresh, standing on end is old, floating goes out.",
      "A fresh egg fries with a tall yolk and a tight white. A flat, spreading one is old, not unsafe.",
      "AA vs A is firmness of the white. Freshness matters more than either.",
      "Organic requires organic feed, usually organic soy and corn. Not a different kind of feed.",
      "Keep them in the carton. It slows moisture loss and keeps odors out.",
      "Unwashed farm eggs can stay on the counter. Once washed, they need the fridge for good, not back and forth.",
      "‘Soy-free’ and ‘corn-free’ are the only words on the carton about the ration."
    ]
  },
  "organic_worth_it_by_type": {
    "decision": "Organic makes most sense for produce you’ll eat whole.",
    "why": "Surface residue leaves with a discarded peel. On berries and apples, you eat the skin along with the flesh.",
    "kristy_take": "An avocado or kiwi can feel delicate and still have a peel you throw away. Choose conventional there; keep organic for the produce you eat whole.",
    "buying_tips": [
      "Think about the peel here: berries and apples keep theirs. Conventional fruit you peel leaves surface residue behind with the skin.",
      "Anything peeled goes in plain, however soft it looks. Avocado, kiwi, mango, banana, citrus and onion all test low.",
      "Soak the conventional eaten-whole ones. A baking soda soak takes more surface residue off than a rinse.",
      "Ask one question at the shelf: does the skin get eaten? Berries, greens, apples, grapes and potatoes, yes. That is where the money goes."
    ]
  },
  "frozen_vs_fresh_produce": {
    "decision": "Plain frozen vegetables give you produce held at its picked ripeness.",
    "why": "Freezing holds vegetables at the ripeness they were picked. ‘Fresh’ produce can lose nutrients over days in transit.",
    "kristy_take": "Leave half a freezer for vegetables and berries to use in soups, smoothies and sheet-pan roasts. Plain frozen produce needs no additives and is there in every season, with no spoilage waste.",
    "buying_tips": [
      "Inside this bag, you want just fruit or vegetables, without sauce or added sugar; freezing needs no additives.",
      "Frozen berries and spinach are staples that never spoil.",
      "Great for smoothies, soups, and sheet-pan roasts.",
      "Check the bag lists just the vegetable/fruit. No sauces or added sugar."
    ]
  },
  "freezing_produce": {
    "decision": "Vegetables for freezing need a brief scald; fruit can go raw.",
    "why": "A brief scald stops the enzymes that would leave frozen beans gray and tasting of hay months later.",
    "kristy_take": "Sixty seconds in boiling water, then straight into ice water. Dry the vegetables and freeze them on a tray before bagging, so the pieces stay separate.",
    "buying_tips": [
      "For those beans, plan sixty seconds in boiling water, then ice water. The scald keeps them from turning gray and tasting of hay.",
      "Freeze it flat on a tray before bagging, or it fuses into one brick.",
      "Press the air out of the bag. Air is what burns it.",
      "Fruit needs no blanching. Berries, banana and stone fruit go in as they are.",
      "Date the bag. Frozen is not indefinite.",
      "Sixty seconds in boiling water, then straight into ice water to stop the cooking."
    ]
  },
  "produce_seasonality": {
    "decision": "Produce in season reaches you closer to ripe.",
    "why": "A January orange tastes better than a July one. Produce in season usually travels less and reaches you closer to ripe.",
    "kristy_take": "Let the piles in the produce section guide the week: spring greens, summer tomatoes, autumn squash, winter citrus. Off-season, reach for frozen over pale fresh produce.",
    "buying_tips": [
      "Those abundant piles give you a clue to what’s in season locally. It usually has less distance to travel.",
      "Off-season, reach for frozen instead of sad ‘fresh’.",
      "Farmers’ markets are a fast read on what’s actually in season locally.",
      "Spring: asparagus, peas, radishes, artichokes, strawberries, tender greens.",
      "Summer: tomatoes, corn, zucchini, peppers, cucumbers, stone fruit, melon, berries.",
      "Autumn: winter squash, sweet potatoes, apples, pears, brussels sprouts, grapes.",
      "Winter: citrus, cabbage, kale, leeks, beets, parsnips, storage onions and potatoes.",
      "Storage crops (apples, onions, potatoes, squash, carrots) stay good long past their season.",
      "The cheapest, most abundant produce this week is usually what’s in season."
    ]
  },
  "washing_produce": {
    "decision": "Plain cold water is all your produce needs for washing.",
    "why": "Cold water and a little rubbing lift dirt, microbes and some residue. Produce washes have not proved better.",
    "kristy_take": "Brush firm produce; rinse and spin leafy greens. Leave berries and mushrooms dry until you are ready to eat them, and skip the ‘veggie wash’.",
    "buying_tips": [
      "Before adding a produce wash, remember that running water and rubbing lift dirt; bottled washes haven’t proved better.",
      "Wash right before eating, not before storing (moisture = mold).",
      "No soap or bleach. Plain water is the recommendation.",
      "Rinse under cold running water; rub firm produce or use a brush."
    ]
  },
  "baking_soda_soak": {
    "decision": "Baking soda gives thin-skinned fruit a soak beyond a rinse.",
    "why": "Bicarbonate needs minutes to break down some residue on fruit skin. A quick rinse moves dirt.",
    "kristy_take": "Give the soak twelve to fifteen minutes, then rinse the soda off with plain water. Residue already inside the fruit stays there.",
    "buying_tips": [
      "With conventional apples, grapes or berries, plan a teaspoon in two cups of water. It works on some surface residue.",
      "Twelve to fifteen minutes in the bowl. Thirty seconds under the tap is not the same thing.",
      "Worth the trouble on thin-skinned conventional fruit you eat whole: apples, grapes, berries.",
      "Rinse the soda off with plain water afterward.",
      "A teaspoon of baking soda per two cups of water, enough to cover the fruit."
    ]
  },
  "precut_produce_tradeoffs": {
    "decision": "Whole produce gives you more time to use it.",
    "why": "Whole produce can wait for the day you need it. Once cut, it keeps for days rather than weeks.",
    "kristy_take": "Two minutes of cutting at home buys a week longer in the fridge. For pre-cut melon or pineapple, choose it on the day you will eat it.",
    "buying_tips": [
      "At the cut-fruit case, think about the next couple of days. An opened pack spoils quickly; whole fruit can wait.",
      "Use pre-cut within a couple of days. It spoils fast once opened.",
      "Give ‘pre-washed’ greens a rinse anyway.",
      "Whole produce is cheaper per pound and keeps far longer."
    ]
  },
  "judging_meat_at_the_case": {
    "decision": "Your meat pick starts with the newest “packaged on” date.",
    "why": "Oxygen turns a cut steak cherry-red; a vacuum-packed roast stays purple. Color alone cannot tell you freshness.",
    "kristy_take": "Choose a sealed pack without leaks, then smell the meat at home. No off smell or slime: those checks tell you more than the store’s sticker.",
    "buying_tips": [
      "Feel the pack and notice any smell: slime or an off smell means leave it. Purple vacuum-packed beef alone isn’t spoilage.",
      "The package should be fully sealed, with no holes, tears or punctures, and not leaking meat juices.",
      "Purple beef is vacuum-packed, not spoiled. Brown edges mean older, not unsafe.",
      "Take it from the back of the case where it is coldest, and get it home cold.",
      "Read the primal cut on the label, such as chuck or round.",
      "Check the use-by date, and freeze what will not be used in time.",
      "Skip any package that smells off or feels slimy.",
      "Not slimy, and no off smell. Both, not either."
    ]
  },
  "butcher_counter_asking": {
    "decision": "The butcher can grind a whole beef chuck just for you.",
    "why": "A whole chuck ground at the counter lets you choose the cut. The butcher can tell you when it was cut.",
    "kristy_take": "Start with what came in today, then how it was raised and what was added. Bones, trim and portioning are worth asking for while you are at the counter.",
    "buying_tips": [
      "Ask what arrived today, and about soup bones while you’re there. The counter can tell you when the meat was cut.",
      "Ask for a whole chuck ground fresh, which lets you choose the cut.",
      "Ask the sourcing question outright: how it was raised and where from.",
      "Ask for bones and trim. Often cheap or free.",
      "Ask them to portion it. Cutting, tying and boning are usually included.",
      "Ask what came in today."
    ]
  },
  "chicken_cuts_basics": {
    "decision": "Air-chilled whole chicken gives you thighs, breast and bones for stock.",
    "why": "Thighs carry more fat and flavor, so they stay juicy and are hard to overcook. The skin renders and bastes as they cook.",
    "kristy_take": "A whole bird gives you breast, dark meat and a frame for stock. For thighs, keep the bone and skin: they give you more room at the stove than boneless skinless.",
    "buying_tips": [
      "You’ll find “air-chilled” printed on the pack. If you’re choosing thighs, bone-in and skin-on give you more room before they dry out.",
      "Thighs, bone-in and skin-on: forgiving, low-cost, hard to overcook.",
      "Breast: fast and lean. Pull it the moment it is done.",
      "Boneless skinless costs the most for the same bird.",
      "‘Air-chilled’ is printed on the package when it applies.",
      "Skin that starts dry is the skin that crisps.",
      "‘USDA Process Verified’ or a third-party seal backs a ‘raised without antibiotics’ claim.",
      "All chicken is required to be residue-free at sale, labeled or not.",
      "‘Raised without antibiotics’ is a management and resistance choice, not a cleaner-meat guarantee.",
      "Whole bird: lowest cost per pound, and the carcass makes stock."
    ]
  },
  "pork_cuts_and_enhanced": {
    "decision": "Plain pork is the one without an injected solution.",
    "why": "Pork is often pumped with water, salt and phosphates to hold moisture. A plain pack leaves that solution out.",
    "kristy_take": "An ‘up to 12% solution’ line means some of that pack is added water. Raw meat with added solution must give its name, percentage and contents beside the product name.",
    "buying_tips": [
      "Beside the name, “contains X% added solution” means water and salt were injected; that’s the line to check here.",
      "The solution’s ingredients follow, heaviest first.",
      "Hormones are banned in pork production, so ‘no added hormones’ on pork is a freebie.",
      "Read for ‘contains X% added solution’. That is injected water and salt."
    ]
  },
  "produce_ripeness_by_item": {
    "decision": "The fruit that feels heavier for its size usually has more juice.",
    "why": "Compare two pieces in your hands. More weight means more water rather than pith, a better guide than color.",
    "kristy_take": "Use your palm to feel a peach’s shoulder for a little give; fingertips leave bruises. Choose staggered firmness so the fruit ripens across the week.",
    "buying_tips": [
      "Hold two of the same size, one in each hand. The extra weight tells you more about water than color does.",
      "Watermelon: a deep yellow field spot, heavy for its size, a hollow thunk.",
      "Pineapple: sweet at the base, deep green leaves, a slight give in the shell. Color is not the tell.",
      "Tomatoes: fragrant at the stem, heavy for their size, and never from the cold case.",
      "Stone fruit: fragrant, with a slight give at the shoulder rather than the tip.",
      "Citrus: heavy for its size, with thin smooth skin. Weight beats color.",
      "Asparagus: tight closed tips and a cut end that is not dried and split.",
      "Broccoli and cauliflower: tight dense heads, no yellowing between the florets.",
      "Leafy greens: perky rather than limp, with no slimy dark patches at the stem base.",
      "Avocado: pop the stem nub. Green under it means ripe, brown means overripe, and stuck fast means give it days.",
      "Press with your palm, never your fingertips. Fingertip pressure is what bruises the bin.",
      "Buy at staggered firmness so they ripen across the week rather than all on Tuesday.",
      "A shorter trip usually means it was picked closer to ripe. That is transit, not country.",
      "Cantaloupe: creamy gold under the netting, a sweet smell at the stem end, slight give."
    ]
  },
  "berries_picking": {
    "decision": "Organic berries should be ready to eat today.",
    "why": "The bottom berries carry the weight and mold first, while the top can still look fresh.",
    "kristy_take": "Berries will not ripen further at home, so buy them ready. Turn the carton over: a dry bottom, no fuzzy fruit. Keep them cold and wash just before eating.",
    "buying_tips": [
      "Turn the cold carton over: you want a dry, unstained bottom and no fuzzy berries. The top can hide older fruit.",
      "No fuzzy white or gray spot on any berry. One takes the punnet.",
      "Green caps still fresh on strawberries, not browned and dry.",
      "Deep, even color for the variety, and uniform size in the container.",
      "Buy them cold, from the refrigerated display rather than a room-temperature stack.",
      "No USDA Organic seal on the clamshell means conventional, whatever the box says.",
      "Read the seal, not the photograph; the two cartons look almost identical.",
      "Frozen organic strawberries: same seal and same rules.",
      "A dry, unstained bottom on the carton. That is the whole check."
    ]
  },
  "produce_storage": {
    "decision": "Unwashed produce will keep better until you’re ready to use it.",
    "why": "Water left on a leaf or berry is where mold starts. Keeping greens dry gives them longer in the drawer.",
    "kristy_take": "Half of what rots in a fridge was rinsed on the way in. Store greens dry with a towel, away from ripening-gas fruit; stand herbs and asparagus in a little water.",
    "buying_tips": [
      "As you bag greens and berries, keep apples and bananas apart from them; their ripening gas speeds things along.",
      "Do not wash anything until you are about to use it.",
      "Never refrigerate: tomatoes, potatoes, onions, garlic, whole melon, unripe stone fruit.",
      "Herbs and asparagus: stand them in a little water, loosely covered.",
      "Greens: dry, with a paper towel in the bag to take up moisture.",
      "Buy at staggered ripeness so the whole week does not turn on Tuesday.",
      "Separate the gas producers (apples, bananas, avocados, tomatoes, stone fruit) from greens and berries."
    ]
  },
  "revive_greens": {
    "decision": "Limp greens can perk up, as long as there’s no decay.",
    "why": "Cold water refills a limp leaf’s slack cells. As the water returns, the leaf stands firm again.",
    "kristy_take": "Give wilted greens half an hour in cold water, then dry them before putting them away. Yellowing, slime or a smell means decay; a soak cannot bring those leaves back.",
    "buying_tips": [
      "Check whether the leaves are just limp or breaking down. Cold water firms limp ones in thirty minutes, an hour for the worst.",
      "Cut a sliver off the stem end first, the way you would for cut flowers.",
      "Spin or pat them dry afterward, or the water you just added rots them in the drawer.",
      "Thirty minutes in cold water covers most of it. An hour for the worst of them."
    ]
  },
  "sprouts_raw": {
    "decision": "Your sprouts belong in a cold clamshell with crisp stems.",
    "why": "Crisp stems and white roots are what to look for in a cold clamshell. Sprouts go slick and sour before they look wrong.",
    "kristy_take": "A jar and a mesh lid let you grow your own crop and know where it came from. Bought sprouts belong in the cold case; warm displays leave them in growing conditions.",
    "buying_tips": [
      "Here in the refrigerated case, check for white roots and no sour smell. Warm, damp growing conditions also suit bacteria.",
      "Roots still white and threadlike, stems crisp rather than limp.",
      "No condensation fogging the clamshell and no sour smell through the vents.",
      "A pack date you can read. Days old, not a week.",
      "Or a jar, a mesh lid and a scoop of seed. Three days on the counter.",
      "The refrigerated case only. Room-temperature sprouts have been left in growing conditions."
    ]
  },
  "produce_root_vegetables": {
    "decision": "Organic potatoes and conventional carrots should feel solid in your hand.",
    "why": "Potatoes, carrots, beets and sweet potatoes should feel firm. Soft, shriveled or sprouting roots stay behind.",
    "kristy_take": "Wilted beet leaves need not put you off a firm root. Cut the tops off carrots before storing them; left attached, they wilt the carrot.",
    "buying_tips": [
      "Give each root a gentle press: no soft spots, nicks or sprouts. Wilted beet leaves matter less than a firm root.",
      "Carrots: firm and well colored. With the tops on, choose bright green, fresh-looking tops.",
      "Sweet potatoes: smooth and firm, even in shape and size, peel color even for the variety, free of damage.",
      "Beets: firm and round with a slender tap root. The leaves on top say nothing certain about the root. Wilted leaves say little as long as the root is firm.",
      "Potatoes: a cool, dark, ventilated place, 45 to 50°F, for up to a month.",
      "Carrots: a closed bag or container in the refrigerator, tops removed, up to two weeks. A wilted carrot revives in cold water.",
      "Beets: stem trimmed to an inch, root end left on, refrigerated in a food-safe container up to two weeks.",
      "Potatoes: firm, with no bruises, nicks, or soft spots."
    ]
  },
  "produce_brassicas": {
    "decision": "Tight heads are your cue for conventional cabbage and cauliflower.",
    "why": "Tight, dark green broccoli florets are fresh. Enlarged, open or yellowish-green ones are past fresh.",
    "kristy_take": "A soft or slippery head is spoiling. Use broccoli early in the week; it keeps about three days, while wrapped cabbage can wait several weeks in the fridge.",
    "buying_tips": [
      "For broccoli alongside them, look for closed, dark green florets; open or yellowish ones have gone past fresh.",
      "Cauliflower: a head with no bruises or damage.",
      "Cabbage: outer leaves fresh, not wilted or insect-damaged. Remove any that are.",
      "Broccoli keeps in the refrigerator in a plastic bag with holes. Use it within three days.",
      "Cabbage keeps several weeks in a plastic bag or wrap in the refrigerator, at 41°F or below.",
      "Cut out the cabbage core and rinse the leaves under cool running water before using.",
      "Broccoli: dark green florets, closed tight, on stems that are not thick and tough."
    ]
  },
  "produce_onions_garlic": {
    "decision": "Conventional onions and garlic should feel firm in your hand.",
    "why": "A well-cured bulb feels dry at the neck and papery outside. A soft, scented or sprouting bulb is already on its way out.",
    "kristy_take": "A few loose onion skins are normal. Squeeze for firmness and little scent, then store whole onions where air can move, away from damp potatoes.",
    "buying_tips": [
      "At the neck, you want dry, papery skin and little scent. Softness, sprouts or mold are reasons to leave a bulb.",
      "An onion neck that is completely dry to the touch, not slippery.",
      "Garlic well cured: dried neck, dry outer skins, cloves firm to the touch.",
      "Some loose skins on an onion are normal.",
      "Whole onions: cool, dry, dark, with air moving. Never in plastic.",
      "Cut onions go in a sealed container for up to seven days.",
      "Onions firm for their size, with little to no scent."
    ]
  },
  "produce_leafy_greens": {
    "decision": "Organic greens with leaves that stand crisp are the ones.",
    "why": "Spinach is highly perishable, and kale wilts in warmth. A leaf that still stands crisp tells you it has freshness left.",
    "kristy_take": "For milder, more tender kale, choose the smaller leaves on moist stems. Keep the bunch cold from the cart to the crisper, and wash it when you use it.",
    "buying_tips": [
      "A glance through the bunch helps: even green, no yellowing or decay. Smaller kale leaves will be milder and more tender.",
      "Romaine: a head that is neither very loose nor very hard. Loose is immature; hard is overmature.",
      "Spinach: uniformly green, fully crisp, fairly clean.",
      "Kale: firm, deep colored leaves on moist, hardy stems. Smaller leaves are more tender and milder.",
      "Store lettuce and spinach as close to 32°F as the refrigerator gets.",
      "Kale: plastic bag, air pressed out, unwashed, about five days in the refrigerator.",
      "Lettuce: crisp leaves, bright to dark green outside and pale at the heart, free of decay or damage."
    ]
  },
  "produce_peppers": {
    "decision": "Organic peppers should feel firm beneath your fingers.",
    "why": "A pepper should feel firm when you hold it. Wrinkled skin means it has lost water in storage.",
    "kristy_take": "Red, yellow and orange peppers tolerate cold better than green ones. In a fridge at 41°F, plan on about two weeks; leave any cracked or bruised pepper at the bin.",
    "buying_tips": [
      "Turn each pepper to check for even color and no cracks or soft spots. Wrinkling tells you it has lost water.",
      "Colored peppers: at least half of the surface colored.",
      "Free of cracks, decay, sunburn, disease, or insect damage.",
      "Skip a bruised or damaged pepper.",
      "Store around 45°F where possible; at 41°F, plan on about two weeks.",
      "Red, yellow, and orange peppers tolerate the cold better than green.",
      "Firm, with uniform shape, size, and color for the variety."
    ]
  },
  "produce_apples_pears": {
    "decision": "Sound organic apples and pears are the fruit to take home.",
    "why": "Apples should feel crisp. A firm green Bartlett pear can ripen at home, turning sweet, juicy and buttery.",
    "kristy_take": "Turn each fruit before bagging it. Damaged fruit spoils in storage and speeds ripening and rot in its sound neighbors, so leave bruised apples and pears behind.",
    "buying_tips": [
      "Check each side for bruises and decay. Apples should feel crisp; a firm green Bartlett pear can still ripen at home.",
      "Pears: free of bruising, insect damage, and decay; a firm green Bartlett ripens off the tree.",
      "Store in the dark at 30 to 32°F, up to 40°F, in a ventilated box or a perforated bag.",
      "Do not wash before storing; the moisture hastens decay.",
      "McIntosh and Honeycrisp: store at 38°F, since they are prone to chilling injury.",
      "Refrigerated apples keep up to a month.",
      "Apples: firm and crisp, free of bruising, decay, cracks, and insect injury."
    ]
  },
  "produce_citrus": {
    "decision": "Conventional citrus works here; organic is the pick when you’ll use zest.",
    "why": "Yellow limes carry more juice. A partly green orange can be fully mature, so feel for a firm, smooth rind.",
    "kristy_take": "UC Davis’s checks are firmness and a sound rind: leave decay and shriveling behind. Use yellowed lemons and limes first; green-picked ones keep longest.",
    "buying_tips": [
      "Feel the rind for firmness and smoothness, without shriveling. A partly green orange can be mature; yellow limes carry more juice.",
      "Lemons: even yellow, firm, smooth, no drying, rind stains, or shriveling.",
      "Limes: firm and smooth, no bruises, oil spotting, or dryness; yellow ones have more juice.",
      "Oranges: room temperature up to a week, refrigerator up to three weeks.",
      "Lemons and limes hold best in the 50s °F, warmer than the refrigerator.",
      "Use the yellowed lemons and limes first; the green-picked ones keep longest.",
      "Oranges: even color, firm, smooth, no decay, bruising, or blemishes."
    ]
  },
  "produce_stone_fruit": {
    "decision": "For organic peaches and plums, let the background color guide you.",
    "why": "A peach’s green background turns yellow as it readies. Michigan Fresh advises unbruised peaches, plums and cherries.",
    "kristy_take": "Nectarines turn from green to yellow too; plums need their variety’s color. Check cherries for green, fleshy stems and full color. Skin staining can be cosmetic, but bruises and damage stay behind.",
    "buying_tips": [
      "Under a peach’s blush, green should have turned yellow. Check plums and cherries for full color too, and leave bruised fruit behind.",
      "Plums: skin color turned for the variety, no bruises or damage.",
      "Cherries: full color across the surface, green fleshy stems, no cracks, pecks, or shriveling.",
      "Store just above freezing, 30.5 to 32°F; cherries at or below 41°F.",
      "Plums that still need to ripen: keep them out of the 36 to 46°F range.",
      "Skin staining on a peach or nectarine is cosmetic; a bruise is not.",
      "Peaches and nectarines: ground color gone from green to yellow, no bruises or damage."
    ]
  },
  "pick_frozen_peas": {
    "decision": "Frozen peas should be solid, without pack drips or off smells."
  },
  "pick_frozen_broccoli": {
    "decision": "Frozen broccoli should feel solid; drips suggest it has thawed."
  },
  "pick_cucumbers": {
    "decision": "A cucumber should feel firm, with no soft or bulging middle."
  },
  "pick_asparagus": {
    "decision": "Closed, dry tips are your guide to asparagus with firm stalks."
  },
  "pick_corn": {
    "decision": "For corn, fresh silk and green husks are your cues."
  },
  "pick_eggplant": {
    "decision": "An eggplant should feel heavy, with shiny skin and a green stem."
  },
  "pick_zucchini": {
    "decision": "A smaller, glossy zucchini should feel firm and heavy for its size."
  },
  "pick_cilantro": {
    "decision": "Cilantro should stand upright, with bright leaves throughout the bunch."
  },
  "pick_parsley": {
    "decision": "Parsley should stand upright, with green leaves throughout."
  },
  "pick_basil": {
    "decision": "Basil should stand bright and upright, without limp or spotted leaves."
  },
  "pick_snap_peas": {
    "decision": "Snap peas should feel firm, with unblemished green pods."
  },
  "pick_kohlrabi": {
    "decision": "Kohlrabi should feel heavy and firm, without cracks or bruises."
  },
  "pick_okra": {
    "decision": "Fresh okra feels firm; leave limp or dried-out pods behind."
  },
  "pick_swiss_chard": {
    "decision": "Dark green leaves and unsplit stalks guide you to sound chard."
  },
  "pick_mangoes": {
    "decision": "Mangoes yield gently when ripe; red skin won’t tell you."
  },
  "pick_sausage": {
    "decision": "With seasoned sausage, the ingredients should name every curing agent."
  },
  "pick_tofu": {
    "decision": "Choose your tofu’s firmness; soybeans, water and a nigari or gypsum coagulant."
  },
  "pick_celery": {
    "decision": "A celery bunch should feel tight and crisp in your hand."
  },
  "sandwich_bread": {
    "decision": "Whole wheat sandwich bread keeps the whole grain in your loaf.",
    "why": "Whole wheat flour keeps the bran and germ along with the rest of the grain, in their natural proportions.",
    "kristy_take": "A loaf called “wheat” may still use refined flour. Turn it over and find whole wheat flour in the ingredients before choosing it.",
    "buying_tips": [
      "The flour name is your guide: look for “whole wheat” in the ingredients, which keeps the bran and germ together.",
      "Without a stamp, use the flour names to check the loaf.",
      "Check which stamp is shown: 100%, 50%+, or Basic have different grain requirements.",
      "Check for whole wheat flour in the ingredients."
    ]
  },
  "sourdough": {
    "decision": "Sourdough should get its rise from a starter.",
    "why": "A flour-and-water starter lets wild yeast and bacteria raise the dough and develop its sour flavor.",
    "kristy_take": "That sourness can also come from added acids. If the starter is missing from the list, the baker can tell you how the loaf rose.",
    "buying_tips": [
      "Ask the baker how the dough rises. Flour, water, salt and a culture or starter tell you more than sour flavor alone.",
      "Ask about the starter when the label does not list it separately.",
      "Read for added vinegar or acetic acid; ask about fermentation rather than infer it from sour flavor.",
      "Look for flour, water, salt, and a culture or starter."
    ]
  },
  "bagels": {
    "decision": "Your bagel should have a boil before it reaches the oven.",
    "why": "The boil sets a bagel’s outside and gives it that chew. A longer boil can make the crust chewier and the middle denser.",
    "kristy_take": "Ask what went into the dough and the boiling bath, or read the ingredients on the bag. Boiling explains the texture; the archived baking articles establish no health advantage.",
    "buying_tips": [
      "At the bakery, ask about boiling and the ingredient list. The bath sets the outside; the shape alone won’t tell you.",
      "Ask the bakery about boiling before buying.",
      "Without a process label, ask the baker rather than infer boiling from the shape.",
      "Ask about the bath ingredients; baking soda changes alkalinity and browning.",
      "Read the ingredient list on the bag, or ask the bakery for it."
    ]
  },
  "tortillas": {
    "decision": "Corn tortillas made from masa are the ones to reach for.",
    "why": "Masa is corn cooked and soaked in limewater, then ground into dough. Water and salt complete the tortilla recipe.",
    "kristy_take": "Masa harina is the dried, ground dough; plain corn flour is a different ingredient. Check the bag for wheat too, since some corn tortillas contain both.",
    "buying_tips": [
      "In the ingredients, masa or masa harina means lime-treated corn; water and salt complete it. Check for wheat flour added alongside.",
      "For a flour tortilla, check the flour and the named fat rather than infer them from the color.",
      "Check whether the corn tortilla also lists wheat flour.",
      "Read the list for masa or masa harina, water, and salt."
    ]
  },
  "turkey_whole": {
    "decision": "A plain whole turkey gives you a bird with nothing added.",
    "why": "A plain turkey has nothing added. A basted bird can carry broth, stock, fat or water in an added solution.",
    "kristy_take": "Fresh or frozen, read beside the name for a basting solution and its ingredients. Water left from chilling is a separate disclosure, so read the two lines separately.",
    "buying_tips": [
      "Next to the name, check for a basting solution and its ingredients. Broth, stock, fat or water can be added that way.",
      "A frozen whole turkey can be checked for the same added-solution statement.",
      "Read retained-water wording separately from the flavoring-solution statement.",
      "Read the solution ingredients beside the product name."
    ]
  },
  "ground_turkey": {
    "decision": "Plain ground turkey lets you choose the fat content yourself.",
    "why": "Two packs of ground turkey can have different fat contents. Read the fat line to see what you are taking home.",
    "kristy_take": "Look for turkey on the ingredient list, with no added seasoning or flavoring solution. A percent-lean claim must have its percent-fat statement alongside.",
    "buying_tips": [
      "Compare the packs’ fat lines; the grinds can differ. Then check for turkey without added seasonings or a flavoring solution.",
      "Without a percent-lean claim, use the Nutrition Facts fat line to compare packs.",
      "Compare the fat content of the actual packs rather than assume one level for all ground turkey.",
      "Choose a formulation listing turkey without added seasonings or a flavoring solution."
    ]
  },
  "chicken_breast": {
    "decision": "Chicken breast cooks better with its bone and skin still on.",
    "why": "Bone-in, skin-on breast cooks better than boneless skinless, which dries fast in the pan.",
    "kristy_take": "A plain breast gives you only chicken. Added flavoring solution must appear in the product name with its amount, even on a pack labeled ‘natural’.",
    "buying_tips": [
      "Read beside the product name for an added solution’s percentage and ingredients; a plain breast has none, fresh or frozen.",
      "Fresh or frozen breast can be checked for the same solution disclosure.",
      "Read retained-water wording separately from the added flavoring ingredients.",
      "Bone-in and skin-on cook better than boneless skinless, which dries fast.",
      "Read the full product name for the solution percentage and ingredients."
    ]
  },
  "produce_mushrooms": {
    "decision": "Dry, firm conventional mushrooms are your starting point.",
    "why": "Closed caps taste milder; open caps with gills showing taste stronger. Dry, firm caps are the fresh ones.",
    "kristy_take": "Choose closed or slightly open caps and take only as many as you need. Keep them cold and unwashed in paper; trapped moisture spoils mushrooms.",
    "buying_tips": [
      "Look underneath the cap: closed means milder, open gills mean stronger flavor. Dark spots are a reason to leave them.",
      "Pick closed caps for a mild flavor and open caps for a stronger one.",
      "Buy them loose to take only the amount needed.",
      "Feel for a dry, firm cap and pass on any with dark spots."
    ]
  },
  "produce_bananas": {
    "decision": "A green bunch of bananas can ripen along with your week.",
    "why": "Bananas get sweeter as the green fades at home. Left to ripen on the plant, they often split and lose texture.",
    "kristy_take": "Take the greenest bunch for the week and let the counter finish it. Conventional is fine here, since the peel comes off; keep green bananas out of the fridge.",
    "buying_tips": [
      "Along the skins, check for splits or dark streaks; leave those behind. The green will fade and the fruit sweeten at home.",
      "Keep green bananas out of the fridge. Cold below 56°F can stop them ripening.",
      "Pass on fruit with skin splits or dark streaks.",
      "Take the greenest bunch for the week; it keeps ripening at home."
    ]
  },
  "produce_green_beans": {
    "decision": "Young organic green beans feel crisp, with the seeds still flat.",
    "why": "A crisp pod with flat seeds is a young bean. Bulging seeds mean an older bean turning tough, stringy and starchy.",
    "kristy_take": "Run your eye along the pods for smooth sides and hidden seeds. Keep the beans cold and use them within five days, leaving any sticky or brown-spotted ones behind.",
    "buying_tips": [
      "Look along each pod for smooth skin without bulges; swollen seeds tell you the bean is getting tough and stringy.",
      "Leave beans with brown or rust spots behind.",
      "Store them cold and cook them within five days.",
      "Pick smooth, slender pods with no seeds bulging through."
    ]
  },
  "egg_duck_quail": {
    "decision": "Duck and quail eggs should come from the refrigerated case.",
    "why": "Duck eggs need longer to cook than hens’ eggs. Salmonella incidents are the reason to cook them thoroughly.",
    "kristy_take": "Open the carton for clean, uncracked shells and keep the eggs cold at home. Duck or quail, cook until both yolk and white are firm.",
    "buying_tips": [
      "Open this carton for a look at the shells: clean and uncracked. Plan to cook both white and yolk solid.",
      "Buy from a refrigerated case and keep them cold at home.",
      "Plan a longer cooking time for duck eggs, which are larger than hen’s eggs.",
      "Open the carton and check that every shell is clean and uncracked."
    ]
  },
  "pick_winter_squash": {
    "decision": "Winter squash should feel heavy, with firm flesh and hard skin."
  },
  "pick_ginger_turmeric": {
    "decision": "Ginger and turmeric should feel firm; ginger’s skin should be uncracked."
  },
  "pick_microgreens": {
    "decision": "Microgreens usually need a rinse; they’re rarely washed before packing."
  },
  "pick_egg_whites": {
    "decision": "Carton egg whites come pasteurized or otherwise treated to destroy Salmonella."
  },
  "lamb_goat": {
    "decision": "Your lamb or goat should be 100% grass-fed or grass-finished.",
    "why": "For goat, look at the flesh: firm and fine-grained with white fat. There are no goat quality grades to guide you.",
    "kristy_take": "Lamb grading is voluntary and takes age into account. Check for firm, fine-textured meat with white marbling, and read the cut name, such as shoulder or leg.",
    "buying_tips": [
      "Look closely at the goat meat: firm, fine-grained flesh with white fat. There are no goat quality grades to guide you.",
      "Pick lamb that is fine textured and firm, with white marbling.",
      "Read the primal cut on the label, such as shoulder or leg.",
      "Pick goat with firm, fine-grained flesh and well-distributed white fat."
    ]
  },
  "organ_meats": {
    "decision": "Organ meats are for cooking in the next day or two.",
    "why": "Heart and tongue suit cooking in liquid. Liver can be pan-fried; tripe needs a braise to turn tender.",
    "kristy_take": "Choose the organ with a meal in mind: variety meats keep less time than steaks and roasts. Cook within one to two days, and take all organ meats to 160°F.",
    "buying_tips": [
      "Tell the butcher how you’ll cook them: liver can be pan-fried, while heart and tongue suit cooking in liquid.",
      "Ask the counter or a farmer which organs they offer.",
      "Match the organ to the method, with heart and tongue braised.",
      "Buy organ meats for a cook within one to two days."
    ]
  },
  "bison": {
    "decision": "For bison, you’re looking for 100% grass-fed or grass-finished.",
    "why": "Bison is a bovine meat with no marbling, so expect a deeper red than beef. High heat can turn it tough.",
    "kristy_take": "Find a federal or state inspection mark, then follow beef’s keeping and cooking rules. Ground bison should be cooked or frozen within 2 days.",
    "buying_tips": [
      "The triangle “U.S. Inspected and Passed” seal or a state mark tells you it was inspected. Expect deeper red than beef.",
      "Expect a deeper red than beef, since bison has no marbling.",
      "Cook or freeze ground bison within 2 days, steaks within 3 to 5.",
      "Bag the package separately to contain any leaks.",
      "Look for the triangle “U.S. Inspected and Passed” seal or a state mark."
    ]
  },
  "venison_game": {
    "decision": "For venison, start with a processor who keeps everything refrigerated.",
    "why": "Game often comes through small shops. Cold handling at the processor decides its safety.",
    "kristy_take": "Plan a meal within two or three days of bringing unfrozen venison home. Trim the fat and cook whole cuts to 145°F, ground game to 160°F.",
    "buying_tips": [
      "Ask whether each animal is handled individually, and look for meat without bruises or debris; trim the fat before cooking.",
      "Choose a processor with fully refrigerated facilities.",
      "Use unfrozen venison within two or three days.",
      "Ask whether the processor handles each animal individually."
    ]
  },
  "pick_jerky": {
    "decision": "With jerky, the ingredients name the meat and any curing agent."
  },
  "pick_soup_bones": {
    "decision": "Your butcher can point you to marrow or knuckle soup bones."
  },
  "sprouted_grain_bread": {
    "decision": "Sprouted whole grain bread gives you a denser, heavier loaf.",
    "why": "The grains sprout before milling, and the loaf tends to feel denser and heavier than bread made from flour.",
    "kristy_take": "Look in the cold or freezer case for sprouted whole grains first on the list, with no extra flour following. Sprouted wheat still contains gluten.",
    "buying_tips": [
      "In the cold or freezer case, check for sprouted whole grains first, without added flour. Some loaves blend the two.",
      "Check the list for added flour or wheat gluten.",
      "Look in the refrigerated or freezer case.",
      "Read the first ingredients for sprouted whole grains."
    ]
  },
  "gluten_free_bread": {
    "decision": "For gluten-free bread, start with the claim on the package.",
    "why": "Blended flours and starches replace wheat. A gum binder gives back some of the stretch gluten would provide.",
    "kristy_take": "Four label wordings share one federal gluten limit, and that claim covers gluten alone. Read which flours and binder hold this particular loaf together.",
    "buying_tips": [
      "Then read the flours, starches and gum binder. Those replace wheat and give the loaf some of the stretch gluten provides.",
      "Read which flours and starches replace the wheat.",
      "Look for the gum that binds the loaf.",
      "Check for one of the four gluten-free claim wordings."
    ]
  },
  "bread_aisle": {
    "decision": "Your usual bread type is the starting point for whole grain.",
    "why": "The first flour and the Whole Grain Stamp help you find a whole grain loaf among the refined ones.",
    "kristy_take": "“Wheat flour”, “multigrain” and “stoneground” on the front can leave the grain question open. “100% whole wheat” or “100% whole grain” gives you a clearer answer.",
    "buying_tips": [
      "Now turn to the first flour and look for “whole”. The Whole Grain Stamp helps distinguish whole from refined grain.",
      "Trust “100% whole wheat” or “100% whole grain” on the label.",
      "Check which Whole Grain Stamp is shown, if any.",
      "Read the first ingredient for “whole”."
    ]
  },
  "pick_english_muffins": {
    "decision": "For English muffins, whole wheat flour first is your guide."
  },
  "pick_pita_naan": {
    "decision": "For pita, whole wheat comes first; naan’s yogurt adds richness."
  }
};

test('A4 only decision and instead moved on batch cards; nothing else in the KB moved', () => {
  assert.equal(kb.entries.length, base.entries.length, 'entry count changed');
  const strip = (e) => { const { decision, instead, ...rest } = e; return rest; };
  // W2 supersedes only these produce fields; its acceptance test owns the new values.
  const w2 = {
    organic_worth_it_by_type: ['aliases', 'decision'], revive_greens: ['aliases'],
    produce_root_vegetables: ['aliases'], produce_onions_garlic: ['aliases', 'decision'],
    produce_leafy_greens: ['aliases'], produce_stone_fruit: ['decision'], produce_mushrooms: ['decision'],
  };
  const stripW2 = (e) => Object.fromEntries(Object.entries(e).filter(([f]) => !(w2[e.id] || []).includes(f)));
  for (const e of base.entries) {
    if (IDS.includes(e.id)) assert.deepEqual(strip(now(e.id)), strip({ ...e, ...W4_COPY[e.id] }), `${e.id}: a field beyond decision/instead moved`);
    else assert.deepEqual(stripW2(now(e.id)), stripW2({ ...e, ...W4_COPY[e.id] }), `${e.id}: outside the batch and W2, changed`);
  }
});

test('A5 the ladder exemption does not hide a hedge inside the opener', () => {
  const milk = now('whole_vs_reduced_fat_milk');
  const codes = (instead) => lint.lintCard({ ...milk, instead }).map((v) => v.code ?? v.rule ?? v);
  assert.ok(!codes(milk.instead).includes('INSTEAD_HEDGED'), 'the real ladder line passes');
  for (const bad of ["If you can't get raw when in a hurry: whole milk.", "If you can't get raw on a budget: whole milk."]) {
    assert.ok(codes(bad).includes('INSTEAD_HEDGED'), bad);
  }
});
