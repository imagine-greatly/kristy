// W4: warmth is a tone edit, with a corpus-level repetition ratchet.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import before from './w4.before.json' with { type: 'json' };
import doLines from '../../lib/doLines.json' with { type: 'json' };
import tips from '../../lib/sectionRules.json' with { type: 'json' };
import * as lint from '../../lib/counterCardLint.js';
import { projectEntry } from '../../lib/counterCards.js';
import { nonEmpty } from '../../lib/testGuards.js';

// Independent of the production predicate: a narrowed scope cannot hide cards.
const categories = new Set(['beef', 'poultry', 'poultry_eggs', 'meat_counter', 'pork', 'produce']);
const breads = new Set(['sandwich_bread', 'sourdough', 'bagels', 'tortillas', 'sprouted_grain_bread', 'gluten_free_bread', 'bread_aisle']);
const pilot = nonEmpty(kb.entries.filter((e) => (categories.has(e.category) && e.decision) || breads.has(e.id)), 'W4 live PILOT', 60);
nonEmpty(before, 'W4 before PILOT', 60);
// W5 re-pins buying tips only; all other W4 locks stay intact.
const W5_TIPS = {
  "beef_grassfed_vs_grainfed": [
    "On the label, “100% grass-fed” or “grass-finished” tells you the finish. Look for no added hormones and a certifier’s seal, too.",
    "Ground and chuck are the lowest-cost way into a whole-life grass animal.",
    "At the counter, ask what the animal was finished on and for how long.",
    "‘100% grass-fed’ and ‘grass-finished’ mean the same thing. Either one is the claim."
  ],
  "rotisserie_chicken": [
    "Turn to the sticker: chicken, salt and spices make a plain bird. “Seasoned”, “original” and “traditional” alone tell you little.",
    "The shortest list wins: chicken, salt, spices. Water as the second ingredient means a solution was added.",
    "Sodium phosphate, a starch or a sweetener after the water means a solution bird. The shorter the seasoning line, the plainer the chicken.",
    "A bird held under the lamp is held hot for a reason. Take one that is steaming, not one that has sat.",
    "Read the sticker, not the name. ‘Seasoned’, ‘original’ and ‘traditional’ are marketing; the ingredient list is regulated."
  ],
  "beef_cuts_basics": [
    "The name tells you whether needles or blades went through it: look for “mechanically”, “needle” or “blade” tenderized.",
    "Loin and rib sit along the back and do little work.",
    "Read the name for ‘mechanically’, ‘needle’ or ‘blade’ tenderized.",
    "Ground chuck runs around 80/20 lean to fat.",
    "Prime, Choice, Select is a marbling scale, top to bottom.",
    "Grading is voluntary. Ungraded is not a downgrade.",
    "Grade and sourcing are separate questions. Neither answers the other.",
    "Chuck is shoulder and round is rear leg: the working muscles."
  ],
  "ground_beef_lean_ratio": [
    "Check the printed percentages for liver and heart; they tell you how much organ is folded into the grind.",
    "Read the ingredient list: beef, with seasoning at most, no water or phosphates.",
    "‘Ground chuck/round/sirloin’ tells you the cut it came from.",
    "The product name will not say ‘ground beef’ alone; a blend has to carry its own descriptive name.",
    "Read the name: ‘ground beef’ may not have beef fat added as such; ‘hamburger’ may."
  ],
  "egg_labels": [
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
  ],
  "organic_worth_it_by_type": [
    "Think about the peel here: berries and apples keep theirs. Conventional fruit you peel leaves surface residue behind with the skin.",
    "Anything peeled goes in plain, however soft it looks. Avocado, kiwi, mango, banana, citrus and onion all test low.",
    "Soak the conventional eaten-whole ones. A baking soda soak takes more surface residue off than a rinse.",
    "Ask one question at the shelf: does the skin get eaten? Berries, greens, apples, grapes and potatoes, yes. That is where the money goes."
  ],
  "frozen_vs_fresh_produce": [
    "Inside this bag, you want just fruit or vegetables, without sauce or added sugar; freezing needs no additives.",
    "Frozen berries and spinach are staples that never spoil.",
    "Great for smoothies, soups, and sheet-pan roasts.",
    "Check the bag lists just the vegetable/fruit. No sauces or added sugar."
  ],
  "freezing_produce": [
    "For those beans, plan sixty seconds in boiling water, then ice water. The scald keeps them from turning gray and tasting of hay.",
    "Freeze it flat on a tray before bagging, or it fuses into one brick.",
    "Press the air out of the bag. Air is what burns it.",
    "Fruit needs no blanching. Berries, banana and stone fruit go in as they are.",
    "Date the bag. Frozen is not indefinite.",
    "Sixty seconds in boiling water, then straight into ice water to stop the cooking."
  ],
  "produce_seasonality": [
    "Those abundant piles give you a clue to what’s in season locally. It usually has less distance to travel.",
    "Off-season, reach for frozen instead of sad ‘fresh’.",
    "Farmers’ markets are a fast read on what’s actually in season locally.",
    "Spring: asparagus, peas, radishes, artichokes, strawberries, tender greens.",
    "Summer: tomatoes, corn, zucchini, peppers, cucumbers, stone fruit, melon, berries.",
    "Autumn: winter squash, sweet potatoes, apples, pears, brussels sprouts, grapes.",
    "Winter: citrus, cabbage, kale, leeks, beets, parsnips, storage onions and potatoes.",
    "Storage crops (apples, onions, potatoes, squash, carrots) stay good long past their season.",
    "The cheapest, most abundant produce this week is usually what’s in season."
  ],
  "washing_produce": [
    "Before adding a produce wash, remember that running water and rubbing lift dirt; bottled washes haven’t proved better.",
    "Wash right before eating, not before storing (moisture = mold).",
    "No soap or bleach. Plain water is the recommendation.",
    "Rinse under cold running water; rub firm produce or use a brush."
  ],
  "baking_soda_soak": [
    "With conventional apples, grapes or berries, plan a teaspoon in two cups of water. It works on some surface residue.",
    "Twelve to fifteen minutes in the bowl. Thirty seconds under the tap is not the same thing.",
    "Worth the trouble on thin-skinned conventional fruit you eat whole: apples, grapes, berries.",
    "Rinse the soda off with plain water afterward.",
    "A teaspoon of baking soda per two cups of water, enough to cover the fruit."
  ],
  "precut_produce_tradeoffs": [
    "At the cut-fruit case, think about the next couple of days. An opened pack spoils quickly; whole fruit can wait.",
    "Use pre-cut within a couple of days. It spoils fast once opened.",
    "Give ‘pre-washed’ greens a rinse anyway.",
    "Whole produce is cheaper per pound and keeps far longer."
  ],
  "judging_meat_at_the_case": [
    "Feel the pack and notice any smell: slime or an off smell means leave it. Purple vacuum-packed beef alone isn’t spoilage.",
    "The package should be fully sealed, with no holes, tears or punctures, and not leaking meat juices.",
    "Purple beef is vacuum-packed, not spoiled. Brown edges mean older, not unsafe.",
    "Take it from the back of the case where it is coldest, and get it home cold.",
    "Read the primal cut on the label, such as chuck or round.",
    "Check the use-by date, and freeze what will not be used in time.",
    "Skip any package that smells off or feels slimy.",
    "Not slimy, and no off smell. Both, not either."
  ],
  "butcher_counter_asking": [
    "Ask what arrived today, and about soup bones while you’re there. The counter can tell you when the meat was cut.",
    "Ask for a whole chuck ground fresh, which lets you choose the cut.",
    "Ask the sourcing question outright: how it was raised and where from.",
    "Ask for bones and trim. Often cheap or free.",
    "Ask them to portion it. Cutting, tying and boning are usually included.",
    "Ask what came in today."
  ],
  "chicken_cuts_basics": [
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
  ],
  "pork_cuts_and_enhanced": [
    "Beside the name, “contains X% added solution” means water and salt were injected; that’s the line to check here.",
    "The solution’s ingredients follow, heaviest first.",
    "Hormones are banned in pork production, so ‘no added hormones’ on pork is a freebie.",
    "Read for ‘contains X% added solution’. That is injected water and salt."
  ],
  "produce_ripeness_by_item": [
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
  ],
  "berries_picking": [
    "Turn the cold carton over: you want a dry, unstained bottom and no fuzzy berries. The top can hide older fruit.",
    "No fuzzy white or gray spot on any berry. One takes the punnet.",
    "Green caps still fresh on strawberries, not browned and dry.",
    "Deep, even color for the variety, and uniform size in the container.",
    "Buy them cold, from the refrigerated display rather than a room-temperature stack.",
    "No USDA Organic seal on the clamshell means conventional, whatever the box says.",
    "Read the seal, not the photograph; the two cartons look almost identical.",
    "Frozen organic strawberries: same seal and same rules.",
    "A dry, unstained bottom on the carton. That is the whole check."
  ],
  "produce_storage": [
    "As you bag greens and berries, keep apples and bananas apart from them; their ripening gas speeds things along.",
    "Do not wash anything until you are about to use it.",
    "Never refrigerate: tomatoes, potatoes, onions, garlic, whole melon, unripe stone fruit.",
    "Herbs and asparagus: stand them in a little water, loosely covered.",
    "Greens: dry, with a paper towel in the bag to take up moisture.",
    "Buy at staggered ripeness so the whole week does not turn on Tuesday.",
    "Separate the gas producers (apples, bananas, avocados, tomatoes, stone fruit) from greens and berries."
  ],
  "revive_greens": [
    "Check whether the leaves are just limp or breaking down. Cold water firms limp ones in thirty minutes, an hour for the worst.",
    "Cut a sliver off the stem end first, the way you would for cut flowers.",
    "Spin or pat them dry afterward, or the water you just added rots them in the drawer.",
    "Thirty minutes in cold water covers most of it. An hour for the worst of them."
  ],
  "sprouts_raw": [
    "Here in the refrigerated case, check for white roots and no sour smell. Warm, damp growing conditions also suit bacteria.",
    "Roots still white and threadlike, stems crisp rather than limp.",
    "No condensation fogging the clamshell and no sour smell through the vents.",
    "A pack date you can read. Days old, not a week.",
    "Or a jar, a mesh lid and a scoop of seed. Three days on the counter.",
    "The refrigerated case only. Room-temperature sprouts have been left in growing conditions."
  ],
  "produce_root_vegetables": [
    "Give each root a gentle press: no soft spots, nicks or sprouts. Wilted beet leaves matter less than a firm root.",
    "Carrots: firm and well colored. With the tops on, choose bright green, fresh-looking tops.",
    "Sweet potatoes: smooth and firm, even in shape and size, peel color even for the variety, free of damage.",
    "Beets: firm and round with a slender tap root. The leaves on top say nothing certain about the root. Wilted leaves say little as long as the root is firm.",
    "Potatoes: a cool, dark, ventilated place, 45 to 50°F, for up to a month.",
    "Carrots: a closed bag or container in the refrigerator, tops removed, up to two weeks. A wilted carrot revives in cold water.",
    "Beets: stem trimmed to an inch, root end left on, refrigerated in a food-safe container up to two weeks.",
    "Potatoes: firm, with no bruises, nicks, or soft spots."
  ],
  "produce_brassicas": [
    "For broccoli alongside them, look for closed, dark green florets; open or yellowish ones have gone past fresh.",
    "Cauliflower: a head with no bruises or damage.",
    "Cabbage: outer leaves fresh, not wilted or insect-damaged. Remove any that are.",
    "Broccoli keeps in the refrigerator in a plastic bag with holes. Use it within three days.",
    "Cabbage keeps several weeks in a plastic bag or wrap in the refrigerator, at 41°F or below.",
    "Cut out the cabbage core and rinse the leaves under cool running water before using.",
    "Broccoli: dark green florets, closed tight, on stems that are not thick and tough."
  ],
  "produce_onions_garlic": [
    "At the neck, you want dry, papery skin and little scent. Softness, sprouts or mold are reasons to leave a bulb.",
    "An onion neck that is completely dry to the touch, not slippery.",
    "Garlic well cured: dried neck, dry outer skins, cloves firm to the touch.",
    "Some loose skins on an onion are normal.",
    "Whole onions: cool, dry, dark, with air moving. Never in plastic.",
    "Cut onions go in a sealed container for up to seven days.",
    "Onions firm for their size, with little to no scent."
  ],
  "produce_leafy_greens": [
    "A glance through the bunch helps: even green, no yellowing or decay. Smaller kale leaves will be milder and more tender.",
    "Romaine: a head that is neither very loose nor very hard. Loose is immature; hard is overmature.",
    "Spinach: uniformly green, fully crisp, fairly clean.",
    "Kale: firm, deep colored leaves on moist, hardy stems. Smaller leaves are more tender and milder.",
    "Store lettuce and spinach as close to 32°F as the refrigerator gets.",
    "Kale: plastic bag, air pressed out, unwashed, about five days in the refrigerator.",
    "Lettuce: crisp leaves, bright to dark green outside and pale at the heart, free of decay or damage."
  ],
  "produce_peppers": [
    "Turn each pepper to check for even color and no cracks or soft spots. Wrinkling tells you it has lost water.",
    "Colored peppers: at least half of the surface colored.",
    "Free of cracks, decay, sunburn, disease, or insect damage.",
    "Skip a bruised or damaged pepper.",
    "Store around 45°F where possible; at 41°F, plan on about two weeks.",
    "Red, yellow, and orange peppers tolerate the cold better than green.",
    "Firm, with uniform shape, size, and color for the variety."
  ],
  "produce_apples_pears": [
    "Check each side for bruises and decay. Apples should feel crisp; a firm green Bartlett pear can still ripen at home.",
    "Pears: free of bruising, insect damage, and decay; a firm green Bartlett ripens off the tree.",
    "Store in the dark at 30 to 32°F, up to 40°F, in a ventilated box or a perforated bag.",
    "Do not wash before storing; the moisture hastens decay.",
    "McIntosh and Honeycrisp: store at 38°F, since they are prone to chilling injury.",
    "Refrigerated apples keep up to a month.",
    "Apples: firm and crisp, free of bruising, decay, cracks, and insect injury."
  ],
  "produce_citrus": [
    "Feel the rind for firmness and smoothness, without shriveling. A partly green orange can be mature; yellow limes carry more juice.",
    "Lemons: even yellow, firm, smooth, no drying, rind stains, or shriveling.",
    "Limes: firm and smooth, no bruises, oil spotting, or dryness; yellow ones have more juice.",
    "Oranges: room temperature up to a week, refrigerator up to three weeks.",
    "Lemons and limes hold best in the 50s °F, warmer than the refrigerator.",
    "Use the yellowed lemons and limes first; the green-picked ones keep longest.",
    "Oranges: even color, firm, smooth, no decay, bruising, or blemishes."
  ],
  "produce_stone_fruit": [
    "Under a peach’s blush, green should have turned yellow. Check plums and cherries for full color too, and leave bruised fruit behind.",
    "Plums: skin color turned for the variety, no bruises or damage.",
    "Cherries: full color across the surface, green fleshy stems, no cracks, pecks, or shriveling.",
    "Store just above freezing, 30.5 to 32°F; cherries at or below 41°F.",
    "Plums that still need to ripen: keep them out of the 36 to 46°F range.",
    "Skin staining on a peach or nectarine is cosmetic; a bruise is not.",
    "Peaches and nectarines: ground color gone from green to yellow, no bruises or damage."
  ],
  "sandwich_bread": [
    "The flour name is your guide: look for “whole wheat” in the ingredients, which keeps the bran and germ together.",
    "Without a stamp, use the flour names to check the loaf.",
    "Check which stamp is shown: 100%, 50%+, or Basic have different grain requirements.",
    "Check for whole wheat flour in the ingredients."
  ],
  "sourdough": [
    "Ask the baker how the dough rises. Flour, water, salt and a culture or starter tell you more than sour flavor alone.",
    "Ask about the starter when the label does not list it separately.",
    "Read for added vinegar or acetic acid; ask about fermentation rather than infer it from sour flavor.",
    "Look for flour, water, salt, and a culture or starter."
  ],
  "bagels": [
    "At the bakery, ask about boiling and the ingredient list. The bath sets the outside; the shape alone won’t tell you.",
    "Ask the bakery about boiling before buying.",
    "Without a process label, ask the baker rather than infer boiling from the shape.",
    "Ask about the bath ingredients; baking soda changes alkalinity and browning.",
    "Read the ingredient list on the bag, or ask the bakery for it."
  ],
  "tortillas": [
    "In the ingredients, masa or masa harina means lime-treated corn; water and salt complete it. Check for wheat flour added alongside.",
    "For a flour tortilla, check the flour and the named fat rather than infer them from the color.",
    "Check whether the corn tortilla also lists wheat flour.",
    "Read the list for masa or masa harina, water, and salt."
  ],
  "turkey_whole": [
    "Next to the name, check for a basting solution and its ingredients. Broth, stock, fat or water can be added that way.",
    "A frozen whole turkey can be checked for the same added-solution statement.",
    "Read retained-water wording separately from the flavoring-solution statement.",
    "Read the solution ingredients beside the product name."
  ],
  "ground_turkey": [
    "Compare the packs’ fat lines; the grinds can differ. Then check for turkey without added seasonings or a flavoring solution.",
    "Without a percent-lean claim, use the Nutrition Facts fat line to compare packs.",
    "Compare the fat content of the actual packs rather than assume one level for all ground turkey.",
    "Choose a formulation listing turkey without added seasonings or a flavoring solution."
  ],
  "chicken_breast": [
    "Read beside the product name for an added solution’s percentage and ingredients; a plain breast has none, fresh or frozen.",
    "Fresh or frozen breast can be checked for the same solution disclosure.",
    "Read retained-water wording separately from the added flavoring ingredients.",
    "Bone-in and skin-on cook better than boneless skinless, which dries fast.",
    "Read the full product name for the solution percentage and ingredients."
  ],
  "produce_mushrooms": [
    "Look underneath the cap: closed means milder, open gills mean stronger flavor. Dark spots are a reason to leave them.",
    "Pick closed caps for a mild flavor and open caps for a stronger one.",
    "Buy them loose to take only the amount needed.",
    "Feel for a dry, firm cap and pass on any with dark spots."
  ],
  "produce_bananas": [
    "Along the skins, check for splits or dark streaks; leave those behind. The green will fade and the fruit sweeten at home.",
    "Keep green bananas out of the fridge. Cold below 56°F can stop them ripening.",
    "Pass on fruit with skin splits or dark streaks.",
    "Take the greenest bunch for the week; it keeps ripening at home."
  ],
  "produce_green_beans": [
    "Look along each pod for smooth skin without bulges; swollen seeds tell you the bean is getting tough and stringy.",
    "Leave beans with brown or rust spots behind.",
    "Store them cold and cook them within five days.",
    "Pick smooth, slender pods with no seeds bulging through."
  ],
  "egg_duck_quail": [
    "Open this carton for a look at the shells: clean and uncracked. Plan to cook both white and yolk solid.",
    "Buy from a refrigerated case and keep them cold at home.",
    "Plan a longer cooking time for duck eggs, which are larger than hen’s eggs.",
    "Open the carton and check that every shell is clean and uncracked."
  ],
  "lamb_goat": [
    "Look closely at the goat meat: firm, fine-grained flesh with white fat. There are no goat quality grades to guide you.",
    "Pick lamb that is fine textured and firm, with white marbling.",
    "Read the primal cut on the label, such as shoulder or leg.",
    "Pick goat with firm, fine-grained flesh and well-distributed white fat."
  ],
  "organ_meats": [
    "Tell the butcher how you’ll cook them: liver can be pan-fried, while heart and tongue suit cooking in liquid.",
    "Ask the counter or a farmer which organs they offer.",
    "Match the organ to the method, with heart and tongue braised.",
    "Buy organ meats for a cook within one to two days."
  ],
  "bison": [
    "The triangle “U.S. Inspected and Passed” seal or a state mark tells you it was inspected. Expect deeper red than beef.",
    "Expect a deeper red than beef, since bison has no marbling.",
    "Cook or freeze ground bison within 2 days, steaks within 3 to 5.",
    "Bag the package separately to contain any leaks.",
    "Look for the triangle “U.S. Inspected and Passed” seal or a state mark."
  ],
  "venison_game": [
    "Ask whether each animal is handled individually, and look for meat without bruises or debris; trim the fat before cooking.",
    "Choose a processor with fully refrigerated facilities.",
    "Use unfrozen venison within two or three days.",
    "Ask whether the processor handles each animal individually."
  ],
  "sprouted_grain_bread": [
    "In the cold or freezer case, check for sprouted whole grains first, without added flour. Some loaves blend the two.",
    "Check the list for added flour or wheat gluten.",
    "Look in the refrigerated or freezer case.",
    "Read the first ingredients for sprouted whole grains."
  ],
  "gluten_free_bread": [
    "Then read the flours, starches and gum binder. Those replace wheat and give the loaf some of the stretch gluten provides.",
    "Read which flours and starches replace the wheat.",
    "Look for the gum that binds the loaf.",
    "Check for one of the four gluten-free claim wordings."
  ],
  "bread_aisle": [
    "Now turn to the first flour and look for “whole”. The Whole Grain Stamp helps distinguish whole from refined grain.",
    "Trust “100% whole wheat” or “100% whole grain” on the label.",
    "Check which Whole Grain Stamp is shown, if any.",
    "Read the first ingredient for “whole”."
  ]
};
const frozen = ['id', 'title', 'aliases', 'asked_as', 'category', 'question', 'cart_pick', 'sources', 'evidence_tier', 'tier_note', 'eyebrow_short', 'labels_decoded', 'buying_tips', 'watch_out', 'pick_steps', 'science', 'detail'];
const changed = ['decision', 'why', 'kristy_take', 'instead', 'short_answer'];
const voice = ['decision', 'why', 'kristy_take'];
const codes = (cards) => lint.lintCorpus(cards).violations.filter((v) => v.code === 'OPENER_REPEATED');

test('W4 (a) four normalized why openers fail; three pass', () => {
  const rows = ['“YOU can check” the label.', 'You, can check another label.', 'you can check the package.', 'YOU CAN CHECK a seal.'].map((why, i) => ({ id: `w4_${i}`, category: 'beef', decision: `Beef cut ${i}.`, why }));
  const hits = codes(rows);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].field, 'why');
  assert.equal(hits[0].opener, 'you can check');
  assert.deepEqual(new Set(hits[0].ids), new Set(rows.map((e) => e.id)));
  assert.deepEqual(codes(rows.slice(0, 3)), []);
});

test('W4 opener rule covers every field, separates fields and respects scope', () => {
  for (const field of voice) {
    const rows = Array.from({ length: 4 }, (_, i) => ({ id: `scope_${i}`, category: 'produce', decision: `Pick ${i} fruit.`, [field]: 'You can check each label.' }));
    assert.equal(codes(rows).filter((v) => v.field === field).length, 1, field);
    assert.deepEqual(codes(rows.map((e) => ({ ...e, category: 'seafood' }))), []);
    assert.deepEqual(codes([...rows.slice(0, 3), rows[0]]), [], 'count distinct cards');
  }
  const mixed = Array.from({ length: 4 }, (_, i) => ({ id: `mixed_${i}`, category: 'beef', decision: `Beef cut ${i}.`, [i < 2 ? 'why' : 'kristy_take']: 'You can check the label.' }));
  assert.deepEqual(codes(mixed), []);
});

test('W4 (b) live PILOT passes opener repetition and all existing card lints', () => {
  assert.equal(typeof lint.lintOpenerRepetition, 'function');
  assert.deepEqual(pilot.filter(lint.isWarmthPilot).map((e) => e.id), pilot.map((e) => e.id));
  assert.deepEqual(lint.lintOpenerRepetition(pilot), []);
  const cards = pilot.map((e) => e.kind === 'pick' ? e : projectEntry(e, { doLine: doLines[e.id] }));
  assert.deepEqual(codes(cards), []);
  for (const [i, e] of pilot.entries()) {
    assert.deepEqual(lint.lintCard(cards[i]), [], e.id);
    assert.deepEqual(lint.readability(e), [], e.id);
    // Audit the authored W4 prose; projection also appends unchanged short_answer sentences.
    assert.deepEqual(lint.voiceTics({ ...cards[i], why: e.why }), [], e.id);
    assert.deepEqual(lint.lintPickSteps(e), [], e.id);
    assert.deepEqual(lint.lintCulinaryAim(e), [], e.id);
    assert.deepEqual(lint.lintRepeatedClaim(e), [], e.id);
    assert.ok(lint.words(e.decision) <= 12, `${e.id}: decision exceeds 12 words`);
  }
  assert.deepEqual(lint.lintSections(tips, pilot), []);
  assert.deepEqual(lint.lintCorpus(cards).violations, []);
});

test('W4 (c/e) PILOT identities, locked fields, numbers and voice survive', () => {
  assert.deepEqual(pilot.map((e) => e.id), before.map((e) => e.id));
  for (const previous of before) {
    const old = { ...previous, ...(W5_TIPS[previous.id] ? { buying_tips: W5_TIPS[previous.id] } : {}) };
    const now = pilot.find((e) => e.id === old.id);
    for (const field of frozen) assert.equal(JSON.stringify(now[field]), JSON.stringify(old[field]), `${old.id}.${field}`);
    const strip = (e) => Object.fromEntries(Object.entries(e).filter(([f]) => !changed.includes(f)));
    assert.deepEqual(strip(now), strip(old), `${old.id}: only authorized fields change`);
    const numbers = (s) => String(s || '').match(/\d+(?:\.\d+)?%?/g) || [];
    const retained = new Set([...voice, 'short_answer', 'detail'].flatMap((f) => numbers(now[f])));
    for (const n of voice.flatMap((f) => numbers(old[f]))) assert.ok(retained.has(n), `${old.id}: lost ${n}`);
    for (const field of changed) {
      if (old[field]) assert.ok(now[field]?.trim(), `${old.id}.${field} emptied`);
      assert.doesNotMatch(now[field] || '', /\b(?:I|me|my|we|our)\b|!/i, `${old.id}.${field}`);
    }
  }
});

test('W4 (d) no sentence repeats within or across PILOT why/kristy_take', () => {
  const holders = new Map();
  for (const e of pilot) for (const field of ['why', 'kristy_take']) for (const sentence of lint.sentences(e[field])) {
    const key = sentence.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
    assert.ok(!holders.has(key), `${e.id}.${field} repeats ${holders.get(key)}: ${sentence}`);
    holders.set(key, `${e.id}.${field}`);
  }
  nonEmpty([...holders], 'W4 actual sentences', 60);
});

test('W4 PILOT gives a food reason instead of the whole-food standard label', () => {
  for (const entry of pilot) for (const field of voice) {
    assert.doesNotMatch(entry[field] || '', /whole-food standard/i, `${entry.id}.${field}`);
    assert.doesNotMatch(entry[field] || '', /\bthe standard\b/i, `${entry.id}.${field}: give the actual reason`);
  }
});
