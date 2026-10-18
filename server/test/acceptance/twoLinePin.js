// THE TWO-LINE REWRITE, pinned (docs/CARD-STYLE-SAMPLES.md, approved 2026-10-17; applied at 014d24a).
// Every card the rewrite touched, with its approved decision and buying_tips verbatim (plus the egg
// feed sources its line 2 rests on, and the cart picks lintSections moved to follow three new fronts). Older batch
// tests overlay these onto their own baselines with withTwoLine(), so each keeps guarding its
// other fields while the rewrite itself stays pinned here: change a line on a card, change it here.
export const TWO_LINE = {
  "salmon_wild_vs_farmed": {
    "decision": "Wild salmon, frozen wild Alaskan before fresh farmed.",
    "buying_tips": [
      "Wild salmon eats krill and small fish; farmed eats plant protein and vegetable oil.",
      "Frozen wild Alaskan is often cheaper and fresher than ‘fresh’ farmed that has been in transit.",
      "Sockeye and coho are almost always wild, and their color is deep because of diet, not dye.",
      "‘Fresh’ at the counter is frequently previously-frozen. Ask. It is not a downgrade."
    ]
  },
  "shrimp_imported_vs_domestic": {
    "decision": "Wild American or Gulf shrimp; read the country of origin.",
    "buying_tips": [
      "Country of origin is printed by law, and wild American traces to a managed fishery.",
      "Country-of-origin is required on the label. Read it before anything on the front.",
      "Frozen raw gives the most control over the cooking, and usually the best value."
    ]
  },
  "beef_grassfed_vs_grainfed": {
    "decision": "100% grass-fed or grass-finished beef.",
    "buying_tips": [
      "“Grass-fed” alone can mean a grain finish; grass to the end makes leaner beef.",
      "‘100% grass-fed’ and ‘grass-finished’ mean the same thing. Either one is the claim.",
      "Ground and chuck are the lowest-cost way into a whole-life grass animal.",
      "At the counter, ask what the animal was finished on and for how long.",
      "Look for no added hormones and a certifier’s seal behind the claim."
    ]
  },
  "rotisserie_chicken": {
    "decision": "Rotisserie chicken with salt and spices, without phosphate or starch.",
    "buying_tips": [
      "A solution bird was injected with water and seasoning before it went on the spit.",
      "Read the sticker, not the name. ‘Seasoned’, ‘original’ and ‘traditional’ are marketing; the ingredient list is regulated.",
      "The shortest list wins: chicken, salt, spices. Water as the second ingredient means a solution was added.",
      "Sodium phosphate, a starch or a sweetener after the water means a solution bird. The shorter the seasoning line, the plainer the chicken.",
      "A bird held under the lamp is held hot for a reason. Take one that is steaming, not one that has sat."
    ]
  },
  "beef_cuts_basics": {
    "decision": "100% grass-fed or grass-finished steak, not mechanically tenderized.",
    "buying_tips": [
      "How it was raised matters more than the cut; Prime and Choice only grade marbling.",
      "Chuck is shoulder and round is rear leg: the working muscles.",
      "Loin and rib sit along the back and do little work.",
      "Read the name for ‘mechanically’, ‘needle’ or ‘blade’ tenderized.",
      "Ground chuck runs around 80/20 lean to fat.",
      "Prime, Choice, Select is a marbling scale, top to bottom.",
      "Grading is voluntary. Ungraded is not a downgrade.",
      "Grade and sourcing are separate questions. Neither answers the other."
    ],
    "cart_pick": "100% grass-fed or grass-finished whole chuck",
    "pick_steps": [
      "Read the name for ‘mechanically tenderized’, ‘needle tenderized’ or ‘blade tenderized’.",
      "Raised: “grass-fed” is the producer’s own word unless a certifier’s seal audits it.",
      "Added solution: see Pork cuts and ‘solution added’ pork."
    ]
  },
  "ground_beef_lean_ratio": {
    "why": "An organ blend folds liver and heart into a familiar grind.",
    "short_answer": "Pick an organ blend, or ground beef with nothing added. How the cattle were raised is on the Beef card.",
    "detail": "Both ‘ground beef’ and ‘hamburger’ cap at 30% fat, so the name is where the difference lives. ‘Ground chuck’, ‘round’ or ‘sirloin’ names the cut it came from. The ingredient list should be beef, with seasoning at most. ‘Ground beef’ may not contain added water, phosphates, binders or extenders, and may not have beef fat added as such. ‘Hamburger’ may. The ratio on the pack is lean to fat by weight. 80/20 is 20% fat; 90/10 is leaner. The name ‘ground beef’ allows no added water, phosphates, binders or extenders. 9 CFR 319.15(a) defines ‘Ground Beef’ as chopped fresh or frozen beef, fat capped at 30 percent, no added water, binders or extenders, with trimmed cheek meat the one allowed addition and capped at 25 percent. A product with liver or heart in it falls outside that definition, and 9 CFR 317.2 then requires a common or usual name or a truthful descriptive designation plus a full ingredient statement in descending order. ‘Ancestral blend’ and ‘primal blend’ are producer names for exactly this product, not standardized terms. Two label examples: one blend states 8 percent organ meats (4 percent liver, 4 percent heart, 92 percent muscle); another states 92 percent ground beef, 5 percent liver, 3 percent heart. Liver is the retinol-dense ingredient: the NIH fact sheet lists pan-fried beef liver at 6,582 mcg RAE per 3 ounces, against a tolerable upper intake of 3,000 mcg a day for adults. A blend that states its shares is plain ground beef with a measured amount of organ folded in. A blend carries its own descriptive name and a full ingredient list. By NIH figures, 3 ounces of pan-fried beef liver holds more than twice the adult daily vitamin A upper intake. Producers print shares such as 8 percent organ, or 5 percent liver plus 3 percent heart. Organs are part of eating the whole animal, and a blend puts them in a familiar grind.",
    "tier_note": "Organ blends grind beef liver or heart in with the muscle meat.",
    "watch_out": [
      "‘Ground beef’ may not have beef fat added as such; ‘hamburger’ may. Both cap at 30% fat, so the name is where the difference lives.",
      "‘Ground beef’ may not contain added water, phosphates, binders or extenders. Its ingredient list should be beef, with seasoning at most.",
      "Liver sets the vitamin A. By NIH figures, 3 ounces of pan-fried beef liver holds more than twice the adult daily upper intake. Keep servings ordinary.",
      "Producers print shares such as 8 percent organ, or 5 percent liver plus 3 percent heart. At those shares the blend tastes like regular ground beef."
    ],
    "pick_steps": [
      "How it was raised: see Beef.",
      "Organ blend: liver or heart named on the label.",
      "Next: plain ground beef; skip “hamburger,” which allows added beef fat."
    ],
    "decision": "An organ blend, or 100% grass-fed ground beef.",
    "cart_pick": "Organ blend ground beef",
    "buying_tips": [
      "A few percent liver and heart still tastes like regular ground beef.",
      "Read the name: ‘ground beef’ may not have beef fat added as such; ‘hamburger’ may.",
      "Read the ingredient list: beef, with seasoning at most, no water or phosphates.",
      "‘Ground chuck/round/sirloin’ tells you the cut it came from.",
      "The product name will not say ‘ground beef’ alone; a blend has to carry its own descriptive name."
    ]
  },
  "egg_labels": {
    "decision": "Soy-free, corn-free eggs from hens on pasture.",
    "buying_tips": [
      "Most hens eat corn and soy, organic ones too, and her feed becomes the egg.",
      "‘Soy-free’ and ‘corn-free’ are the only words on the carton about the ration.",
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
      "Unwashed farm eggs can stay on the counter. Once washed, they need the fridge for good, not back and forth."
    ],
    "sources": [
      "USDA egg labeling guidance",
      "Certified Humane standards",
      "The Cornucopia Institute “Organic Egg Scorecard Criteria”, “Add On Labels” section https://www.cornucopia.org/egg-scorecard-criteria/",
      "USDA Egg Grading Manual (shell color and breed)",
      "Poultry-science references on eggshell pigmentation",
      "Hendrix Genetics “Eggshell color Eggsplained” https://layinghens.hendrix-genetics.com/en/articles/eggshell-color-eggsplained/",
      "USDA FSIS shell-egg dating and Julian pack codes",
      "USDA Egg Grading Manual (air cell and interior quality)",
      "University of Nebraska–Lincoln Extension “Cracking the Date Code on Egg Cartons” https://food.unl.edu/article/cracking-date-code-egg-cartons/ (Julian pack date; eggs keep 4 to 5 weeks past the pack date refrigerated)",
      "USDA Egg Grading Manual (AA, A and B standards)",
      "USDA AMS shell egg size and weight classes",
      "American Egg Board “Egg Grades and Sizes” (Grade AA, A and B scored on interior and shell quality at packing, separate from the weight classes)",
      "Pete & Gerry’s “Guide to Egg Sizes and Weights” https://www.peteandgerrys.com/blogs/field-notes/egg-size-guide",
      "USDA FSIS labeling policy on feed claims",
      "USDA National Organic Program, 7 CFR 205.237 (livestock feed requirements)",
      "Poultry-science literature on omega-3 enrichment of eggs",
      "The Cornucopia Institute, egg scorecard criteria, “Feed Sourcing” section https://www.cornucopia.org/egg-scorecard-criteria/ (feed grown on-farm ranks above local organic growers, above multiple suppliers with no traceability standard; feed traceability concerns, no brands named)",
      "USDA FSIS shell egg refrigeration requirements (45F)",
      "FDA Egg Safety Final Rule",
      "EU marketing standards for eggs (unwashed, ambient storage)",
      "Feed Strategy, “Feed formulations for US white layers in the production phase” (corn the main energy source, soybean meal the main protein) https://www.feedstrategy.com/animal-feed-formulations-library/us-white-layers-production-phase",
      "7 CFR § 205.237 Livestock feed (organic livestock fed organically produced feed) https://www.law.cornell.edu/cfr/text/7/205.237"
    ],
    "cart_pick": "Corn- and soy-free eggs from hens on pasture"
  },
  "organic_worth_it_by_type": {
    "decision": "Organic for produce eaten whole; conventional for what you peel.",
    "buying_tips": [
      "Residue sits on the skin, so a peel you throw away takes it with it.",
      "Ask one question at the shelf: does the skin get eaten? Berries, greens, apples, grapes and potatoes, yes. That is where the money goes.",
      "Anything peeled goes in plain, however soft it looks. Avocado, kiwi, mango, banana, citrus and onion all test low.",
      "Soak the conventional eaten-whole ones. A baking soda soak takes more surface residue off than a rinse."
    ]
  },
  "frozen_vs_fresh_produce": {
    "decision": "Plain frozen produce, picked ripe and frozen within hours.",
    "buying_tips": [
      "Freezing holds produce at peak ripeness, while fresh can lose nutrients in transit.",
      "Check the bag lists just the vegetable/fruit. No sauces or added sugar.",
      "Frozen berries and spinach are staples that never spoil.",
      "Great for smoothies, soups, and sheet-pan roasts."
    ]
  },
  "freezing_produce": {
    "decision": "Briefly scalded vegetables for the freezer; fruit goes in raw.",
    "buying_tips": [
      "A brief scald stops the enzymes that leave frozen beans gray and tasting of hay.",
      "Sixty seconds in boiling water, then straight into ice water to stop the cooking.",
      "Freeze it flat on a tray before bagging, or it fuses into one brick.",
      "Press the air out of the bag. Air is what burns it.",
      "Fruit needs no blanching. Berries, banana and stone fruit go in as they are.",
      "Date the bag. Frozen is not indefinite."
    ]
  },
  "produce_seasonality": {
    "decision": "In-season produce, or frozen when it is out of season.",
    "buying_tips": [
      "In season, it travels less and reaches you closer to ripe, so it tastes better.",
      "The cheapest, most abundant produce this week is usually what’s in season.",
      "Off-season, reach for frozen instead of sad ‘fresh’.",
      "Farmers’ markets are a fast read on what’s actually in season locally.",
      "Spring: asparagus, peas, radishes, artichokes, strawberries, tender greens.",
      "Summer: tomatoes, corn, zucchini, peppers, cucumbers, stone fruit, melon, berries.",
      "Autumn: winter squash, sweet potatoes, apples, pears, brussels sprouts, grapes.",
      "Winter: citrus, cabbage, kale, leeks, beets, parsnips, storage onions and potatoes.",
      "Storage crops (apples, onions, potatoes, squash, carrots) stay good long past their season."
    ]
  },
  "washing_produce": {
    "decision": "Plain cold water for produce; no soap or produce wash.",
    "buying_tips": [
      "Water and a little rubbing lift dirt and microbes; washes have not proved better.",
      "Rinse under cold running water; rub firm produce or use a brush.",
      "Wash right before eating, not before storing (moisture = mold).",
      "No soap or bleach. Plain water is the recommendation."
    ]
  },
  "baking_soda_soak": {
    "decision": "Baking soda water for residue that a plain rinse leaves.",
    "buying_tips": [
      "Baking soda breaks down some skin residue; running water mostly moves it around.",
      "A teaspoon of baking soda per two cups of water, enough to cover the fruit.",
      "Twelve to fifteen minutes in the bowl. Thirty seconds under the tap is not the same thing.",
      "Worth the trouble on thin-skinned conventional fruit you eat whole: apples, grapes, berries.",
      "Rinse the soda off with plain water afterward."
    ]
  },
  "precut_produce_tradeoffs": {
    "decision": "Whole produce before pre-cut: cutting starts vitamin loss and browning.",
    "buying_tips": [
      "Whole produce waits for the day you need it; once cut, it keeps days, not weeks.",
      "Whole produce is cheaper per pound and keeps far longer.",
      "Use pre-cut within a couple of days. It spoils fast once opened.",
      "Give ‘pre-washed’ greens a rinse anyway."
    ]
  },
  "grassfed_butter": {
    "decision": "Deep yellow grass-fed butter: cream, and salt if salted.",
    "buying_tips": [
      "Deep yellow toward orange is carotene from grass. Pale is a hay-fed winter churn.",
      "European-style butters are higher in fat, a separate axis from what the cows ate.",
      "Salted or unsalted is a cooking choice. Unsalted gives control."
    ]
  },
  "whole_vs_reduced_fat_milk": {
    "decision": "Trusted raw milk from a farm, or low-temp pasteurized 100% grass-fed.",
    "buying_tips": [
      "Every bit of heat changes milk; 100% grass-fed means grass and hay, never grain.",
      "Whole milk is 3.25% milkfat by federal standard. Reduced-fat is 2%, low-fat 1%, skim under half a percent.",
      "Grass-fed and pasture milk is a further layer, and a separate question from the fat.",
      "Cream-top means non-homogenized. The cream line is the visible version of fewer steps.",
      "The ladder runs four steps. Raw from a farm you can name. Then low-temp pasteurized and cream-top. Then A2, then the carton in front of you.",
      "Jersey and Guernsey are the A2 breeds. Small dairies name the breed; the big labels only print the seal.",
      "A2 yogurt and A2 cheese are the same milk cultured. The breed question does not change.",
      "‘Ultra-pasteurized’ or ‘UHT’ on the carton explains a date months out.",
      "Ultra-pasteurized milk resists culturing. Skip it for homemade yogurt.",
      "‘Cream-top’ or ‘non-homogenized’ means the fat separates. Shake it.",
      "Non-homogenized is still pasteurized. Two different processes.",
      "The shortest date on the shelf usually means the least processing, not worse milk."
    ],
    "aliases": ["whole milk","2% milk","skim milk","reduced fat milk","low fat milk","milk fat","which milk","what milk","milk should i buy","a2 milk","a2","a1 milk","a1","a2 vs a1","beta casein","bcm 7","jersey milk","guernsey","a2 yogurt","a1 yogurt","a2 protein","milk protein type","ultra pasteurized","uht milk","pasteurized milk","homogenized","non homogenized","cream top milk","why does organic milk last so long","milk processing","milk carton","milk cartons","gallon of milk","carton of milk","Low-temp pasteurized grass-fed whole milk","100% grass-fed low-temp pasteurized whole milk"],
    "cart_pick": "100% grass-fed low-temp pasteurized whole milk"
  },
  "cheese_real_vs_processed": {
    "decision": "Block cheese with a short list: milk, cultures, salt, enzymes.",
    "buying_tips": [
      "Bagged shreds are coated in starch to keep them apart, which is why they melt poorly.",
      "Look for a short list: milk, salt, cultures, enzymes/rennet.",
      "Blocks are cheaper per pound than pre-sliced or shredded, and they melt smoothly.",
      "‘Parmesan’ is a generic word in the US. ‘Parmigiano-Reggiano’ is a protected one with a stamped rind.",
      "Keep hard-cheese rinds. They belong in a pot of beans or soup."
    ]
  },
  "yogurt_plain_vs_flavored": {
    "decision": "Plain Greek yogurt made from 100% grass-fed milk.",
    "buying_tips": [
      "100% grass-fed means grass and hay, never grain; flavored tubs carry added sugar.",
      "Plain over flavored. Sweeten it yourself with fruit.",
      "Compare the added-sugars line on the plain tub against the fruit cup. That gap is the decision.",
      "Greek or strained yogurt is thicker; whole-milk versions are more filling.",
      "A short list is the sign: milk and cultures. Thickeners do the job straining does, for less.",
      "Greek and skyr are strained: thicker, with less whey.",
      "Kefir is drinkable and carries a wider mix of cultures than yogurt.",
      "Whole-milk versions are more filling and less tinkered with than fat-free."
    ]
  },
  "raw_milk": {
    "decision": "Raw grass-fed milk from a farm you can name.",
    "buying_tips": [
      "The farmer makes the difference, and the good ones publish their herd test results.",
      "Grass and pasture, small herd, milked into a cold chain that never breaks.",
      "Glass bottles and a bottling date you can read. Days, not weeks.",
      "A cream line at the top. That is the milk telling you what it is.",
      "Raw cultured dairy from the same farm: kefir, clabber, aged raw cheese.",
      "Buy an extra bottle and let one sit out a day or two. Live raw milk clabbers into something worth eating; pasteurized milk only spoils."
    ]
  },
  "rice_arsenic": {
    "decision": "White basmati or sushi rice.",
    "buying_tips": [
      "Arsenic collects in the bran, so brown rice tests about half again higher than white.",
      "Boil it in plenty of water and pour the water off. That step takes out 40 to 60 percent.",
      "Basmati and sushi rice test lowest. Plain long-grain and parboiled test highest.",
      "California, India and Pakistan on the bag run lower than Arkansas, Louisiana, Mississippi, Missouri or Texas.",
      "Vary grains, such as oats, quinoa and barley, so rice isn’t every meal."
    ]
  },
  "oats_steelcut_rolled_instant": {
    "decision": "Plain oats, steel-cut or rolled.",
    "buying_tips": [
      "Same grain in every form; the flavored packets are where the sugar is.",
      "Plain oats in any form; steel-cut if you like chew and have time.",
      "Skip flavored instant packets. Check the sugar on the label.",
      "Bulk oats are pennies per serving."
    ]
  },
  "nuts_raw_vs_roasted": {
    "decision": "Raw or dry-roasted nuts, with no added oil.",
    "buying_tips": [
      "Many roasted nuts are cooked in cottonseed or soybean oil; dry-roasted is just the nut.",
      "Look for ‘dry roasted’ or ‘raw’, with no added oil.",
      "Read the ingredient line: many roasted nuts list cottonseed/soybean oil.",
      "Bulk bins are cheaper than jars for the same nut."
    ]
  },
  "honey_adulteration": {
    "decision": "Raw honey from a named, local or single-source producer.",
    "buying_tips": [
      "Supermarket honey is often blended, filtered or cut with cheap syrups.",
      "Ingredient list should read ‘honey’ and nothing else.",
      "Local, single-source, or ‘raw’ honey is the most trustworthy.",
      "It’s still a sweetener. Use it with intention."
    ]
  },
  "beans_dried_vs_canned": {
    "decision": "Dried beans, whole with unbroken skins.",
    "buying_tips": [
      "Cooking dried beans yourself is the only way to set the salt.",
      "Dried beans cost a fraction of canned per serving.",
      "A slow cooker or pressure cooker removes the planning problem.",
      "Whole beans with unbroken skins cook evenly. Split ones turn to mush."
    ]
  },
  "label_natural": {
    "decision": "A defined label claim and the ingredient list over ‘natural’.",
    "buying_tips": [
      "On meat, ‘natural’ only means no artificial ingredients and minimal processing.",
      "Don’t pay a premium for ‘natural’. It is rarely enforced.",
      "Look for defined terms instead: organic, grass-finished, pasture-raised.",
      "The ingredient list beats any front-of-pack adjective."
    ]
  },
  "label_made_with_real": {
    "decision": "The ‘real’ ingredient listed before added sugar and refined flour.",
    "buying_tips": [
      "The claim sets no minimum, and the list runs in weight order, so late means a trace.",
      "Check where the ‘real’ ingredient falls in the list. Early means more; late means a trace.",
      "Compare to added sugar and refined flour higher in the list.",
      "Front-of-pack claims are marketing; the ingredient panel is the truth."
    ]
  },
  "label_no_added_hormones": {
    "decision": "On beef and dairy, a third-party verified ‘no added hormones’.",
    "buying_tips": [
      "Pork and poultry ban hormones by law, so every producer there can print it.",
      "Chicken/pork: hormones are banned anyway. Don’t pay extra for the words.",
      "Beef/dairy: the claim is meaningful; look for verification.",
      "Poultry labels must add ‘no hormones are used in poultry’ by rule."
    ]
  },
  "label_nonGMO_vs_organic": {
    "decision": "USDA Organic, which already includes non-GMO.",
    "buying_tips": [
      "Organic also restricts synthetic pesticides and fertilizers; non-GMO covers one issue.",
      "Organic already implies non-GMO. You don’t need both seals.",
      "Ignore ‘non-GMO’ on foods that have no GMO version anyway.",
      "Decide if GMOs actually matter to you before paying up for the seal."
    ]
  },
  "label_cage_free": {
    "decision": "Pasture-raised eggs with a certifier seal over cage-free or free-range.",
    "buying_tips": [
      "Cage-free hens usually live indoors, and free-range sets no size or hours for the door.",
      "Cage-free means uncaged, usually indoors. It does not mean outdoor access.",
      "Free-range = some outdoor access, with the amount and quality undefined.",
      "For real outdoor time: ‘pasture-raised’ plus a certifier seal.",
      "For eggs both are defined terms; on other products they carry much less."
    ]
  },
  "label_grass_fed_term": {
    "decision": "‘100% grass-fed’ beef, ideally third-party certified.",
    "buying_tips": [
      "A bare ‘grass-fed’ can still end on grain in the feedlot before slaughter.",
      "‘100% grass-fed’ / ‘grass-finished’ beats a bare ‘grass-fed’.",
      "Third-party certification is the strongest backing.",
      "Ask the butcher. They’ll usually know the sourcing."
    ]
  },
  "label_pasture_raised_feed": {
    "decision": "Eggs printed ‘soy-free’ or ‘corn-free’ on the carton.",
    "buying_tips": [
      "Most pasture-raised hens still eat soy and corn; pasture describes space, not feed.",
      "Space claims and feed claims are separate. Read the carton for both; one never implies the other.",
      "If feed matters to you, look for “soy-free” or “corn-free” printed explicitly.",
      "Organic requires organic feed, usually organic soy and corn. It answers how it was grown, not what it is.",
      "For beef, the equivalent word is grass-FINISHED. “Grass-fed” alone can still end on grain."
    ]
  },
  "label_organic_scope": {
    "decision": "Organic thin-skinned produce eaten whole; still read the ingredient panel.",
    "buying_tips": [
      "The seal covers inputs and practices, and an organic cookie is still a cookie.",
      "Organic is about inputs and practices. Read the ingredient panel separately.",
      "It is not pesticide-free; approved natural pesticides are permitted.",
      "It carries the most weight on thin-skinned produce you eat whole, and the least on processed food.",
      "On animal products it does reach feed. It means organic feed, not a different kind of feed."
    ]
  },
  "label_multigrain_vs_whole_grain": {
    "decision": "‘100% whole grain’, a whole grain listed first.",
    "buying_tips": [
      "Multigrain only counts grains, and every one of them can be refined.",
      "Read the first ingredient. “Whole wheat flour” counts; “wheat flour” and “enriched flour” do not.",
      "“100% whole grain” is a real claim. “Made with whole grains” permits any fraction.",
      "Ignore the color. Brown can be caramel coloring on white flour."
    ]
  },
  "label_lightly_sweetened": {
    "decision": "‘Unsweetened’, or read the ‘Added Sugars’ line on the panel.",
    "buying_tips": [
      "‘Lightly sweetened’ has no definition; added sugars is the one defined number.",
      "Go straight to “Added Sugars” on the panel. It is the one number that is defined.",
      "“No sugar added” still allows the food’s own sugars, which can be substantial.",
      "“Reduced sugar” is relative to a reference product; 25% less than very sweet is still sweet.",
      "Check the ingredient list for the aliases: syrups, cane juice, concentrates."
    ]
  },
  "label_no_artificial_flavors": {
    "decision": "Short ingredient lists of recognisable foods over flavor claims.",
    "buying_tips": [
      "Natural flavors are still engineered and can hide dozens of substances in two words.",
      "The claim rules out artificial flavoring only. Natural flavoring is still permitted.",
      "Both are engineered; the legal difference is the starting material, not the process.",
      "“Natural flavors” can carry solvents and carriers that need no separate declaration.",
      "A short ingredient list with recognisable food names beats any flavor claim on the front."
    ]
  },
  "judging_meat_at_the_case": {
    "decision": "Sealed, leak-free meat with the newest ‘packaged on’ date.",
    "buying_tips": [
      "Color only shows oxygen and packaging; the seal and the smell tell you more.",
      "Not slimy, and no off smell. Both, not either.",
      "The package should be fully sealed, with no holes, tears or punctures, and not leaking meat juices.",
      "Purple beef is vacuum-packed, not spoiled. Brown edges mean older, not unsafe.",
      "Take it from the back of the case where it is coldest, and get it home cold.",
      "Read the primal cut on the label, such as chuck or round.",
      "Check the use-by date, and freeze what will not be used in time.",
      "Skip any package that smells off or feels slimy."
    ]
  },
  "butcher_counter_asking": {
    "decision": "Beef soup bones and a whole chuck, freshly ground.",
    "buying_tips": [
      "A butcher can tell you how it was raised and when it was cut; a package cannot.",
      "Ask what came in today.",
      "Ask for a whole chuck ground fresh, which lets you choose the cut.",
      "Ask the sourcing question outright: how it was raised and where from.",
      "Ask for bones and trim. Often cheap or free.",
      "Ask them to portion it. Cutting, tying and boning are usually included."
    ]
  },
  "chicken_cuts_basics": {
    "decision": "Air-chilled whole chicken first, then bone-in, skin-on thighs.",
    "buying_tips": [
      "Water-chilled birds hold water from the chilling tank; skin that starts dry crisps.",
      "Whole bird: lowest cost per pound, and the carcass makes stock.",
      "Thighs, bone-in and skin-on: forgiving, low-cost, hard to overcook.",
      "Breast: fast and lean. Pull it the moment it is done.",
      "Boneless skinless costs the most for the same bird.",
      "‘Air-chilled’ is printed on the package when it applies.",
      "Skin that starts dry is the skin that crisps.",
      "‘USDA Process Verified’ or a third-party seal backs a ‘raised without antibiotics’ claim.",
      "All chicken is required to be residue-free at sale, labeled or not.",
      "‘Raised without antibiotics’ is a management and resistance choice, not a cleaner-meat guarantee."
    ]
  },
  "pork_cuts_and_enhanced": {
    "decision": "Plain pork, with no added-solution percentage on its label.",
    "buying_tips": [
      "Much retail pork is pumped with water, salt and phosphates, then sold by weight.",
      "Read for ‘contains X% added solution’. That is injected water and salt.",
      "The solution’s ingredients follow, heaviest first.",
      "Hormones are banned in pork production, so ‘no added hormones’ on pork is a freebie."
    ]
  },
  "deli_meat_uncured": {
    "decision": "Whole roasted meat sliced thin, then counter-sliced deli meat.",
    "buying_tips": [
      "‘Uncured’ packs are still cured, just with celery powder as the nitrate source.",
      "Find the asterisk. ‘Uncured’ is always qualified on the label.",
      "Celery powder is a natural nitrate source. It is a curing agent, not the absence of one.",
      "Sliced at the counter is usually a shorter ingredient list than the pre-packed tub.",
      "Whole roasted meat sliced thin does the same sandwich job with nothing added."
    ]
  },
  "mercury_by_fish": {
    "decision": "Sardines, anchovies, salmon and canned light tuna, small and short-lived.",
    "buying_tips": [
      "Mercury builds with size and lifespan, so big long-lived predators carry the most.",
      "Lowest: sardines, anchovies, salmon, shrimp, scallops, tilapia, cod, pollock, catfish, canned light tuna.",
      "Middle: albacore and yellowfin tuna, halibut, grouper, snapper, mahi mahi.",
      "Highest: swordfish, shark, king mackerel, marlin, orange roughy, bigeye tuna, Gulf tilefish.",
      "‘Light’ tuna is usually skipjack and sits well below ‘white’ albacore.",
      "FDA and EPA aim the advice at pregnant and nursing women and young children. Anything medical is a doctor’s call.",
      "Sardines and canned salmon, bones left in, are shelf-stable and low on the chain. Canned is the cheapest way to eat either one."
    ]
  },
  "canned_fish_choosing": {
    "decision": "Fish in olive oil or water, bone-in and skin-on.",
    "buying_tips": [
      "‘Vegetable oil’ on a tin is nearly always a seed oil blend it will not name.",
      "Read the pack medium: olive oil or water, not ‘vegetable oil’.",
      "Bone-in and skin-on sardines and salmon. The bones soften completely.",
      "The list should read fish, oil or water, salt. Anything longer is a sauce.",
      "Good oil-packed tins are worth using in the dish rather than draining.",
      "Skipjack, labeled ‘light’, sits lower on the mercury range than albacore, labeled ‘white’.",
      "Skipjack, labeled ‘light’, is lower-mercury than albacore, labeled ‘white’."
    ]
  },
  "farmed_fish_by_species": {
    "decision": "Trout, arctic char, barramundi and shellfish needing no feed.",
    "buying_tips": [
      "Mussels and oysters filter their food from the water and need no feed.",
      "Mussels, oysters and clams are farmed almost everywhere and need no feed.",
      "Farmed trout, arctic char and barramundi are generally well regarded.",
      "For salmon and shrimp, ask the country and look for a credible certification.",
      "Country-of-origin is required on unprocessed seafood. Read it.",
      "‘Farmed’ alone is not a verdict. The species and the operation are the question."
    ]
  },
  "seafood_certifications": {
    "decision": "Blue MSC on wild fish; ASC or BAP on farmed.",
    "buying_tips": [
      "MSC audits a wild fishery’s stock and habitat; the farm seals set a floor.",
      "Blue MSC label: a wild fishery, audited for stock and habitat impact.",
      "ASC: a farm, audited on environmental and social standards.",
      "BAP one to four stars: how many links were audited, from plant up to feed mill.",
      "Seafood Watch is a guide to look up, not a seal to spot.",
      "No seal speaks to freshness. That is still your nose and your eyes."
    ]
  },
  "produce_ripeness_by_item": {
    "decision": "The heavier of two same-size pieces, for more juice.",
    "buying_tips": [
      "More weight means more water rather than pith, a better guide than color.",
      "Cantaloupe: creamy gold under the netting, a sweet smell at the stem end, slight give.",
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
      "A shorter trip usually means it was picked closer to ripe. That is transit, not country."
    ]
  },
  "berries_picking": {
    "decision": "Cold organic berries with a dry, clean carton bottom.",
    "buying_tips": [
      "The bottom berries carry the weight and mold first, while the top still looks fresh.",
      "A dry, unstained bottom on the carton. That is the whole check.",
      "No fuzzy white or gray spot on any berry. One takes the punnet.",
      "Green caps still fresh on strawberries, not browned and dry.",
      "Deep, even color for the variety, and uniform size in the container.",
      "Buy them cold, from the refrigerated display rather than a room-temperature stack.",
      "No USDA Organic seal on the clamshell means conventional, whatever the box says.",
      "Read the seal, not the photograph; the two cartons look almost identical.",
      "Frozen organic strawberries: same seal and same rules."
    ]
  },
  "produce_storage": {
    "decision": "Unwashed produce for storing; wash it when you use it.",
    "buying_tips": [
      "Water left on a leaf or berry is where mold starts, so dry greens last longer.",
      "Separate the gas producers (apples, bananas, avocados, tomatoes, stone fruit) from greens and berries.",
      "Do not wash anything until you are about to use it.",
      "Never refrigerate: tomatoes, potatoes, onions, garlic, whole melon, unripe stone fruit.",
      "Herbs and asparagus: stand them in a little water, loosely covered.",
      "Greens: dry, with a paper towel in the bag to take up moisture.",
      "Buy at staggered ripeness so the whole week does not turn on Tuesday."
    ]
  },
  "revive_greens": {
    "decision": "Limp greens without decay, ready for a cold-water soak.",
    "buying_tips": [
      "Cold water refills a limp leaf’s slack cells, and the leaf stands firm again.",
      "Thirty minutes in cold water covers most of it. An hour for the worst of them.",
      "Cut a sliver off the stem end first, the way you would for cut flowers.",
      "Spin or pat them dry afterward, or the water you just added rots them in the drawer."
    ]
  },
  "cream_vs_creamer": {
    "decision": "Half-and-half or heavy cream, with a short ingredient list.",
    "buying_tips": [
      "Cream carries a legal milkfat minimum; creamer is oil and sweetener imitating it.",
      "Heavy cream is 36% milkfat or more. Half-and-half is 10.5 to 18%. Those numbers are fixed by law.",
      "‘Non-dairy creamer’ is oil, sweetener and emulsifiers. It is not cream.",
      "Even real cream can carry carrageenan or gellan gum. A short list is still worth checking.",
      "Flavored creamers are where the added sugar sits. Read the panel.",
      "Whole milk or half-and-half does the same job with a two-word ingredient list."
    ]
  },
  "flour_basics": {
    "decision": "Whole wheat flour; on white flour, unbleached and unbromated.",
    "buying_tips": [
      "Whole wheat flour keeps the bran and germ that refining takes off white flour.",
      "‘Enriched’ means vitamins and iron added back after refining. Standard on white flour.",
      "‘Unbleached’ was aged with air. ‘Bleached’ was chemically whitened.",
      "Read for “bromated”, and pick flour without potassium bromate.",
      "Whole wheat carries the oil in the germ. Buy small and keep it in the freezer."
    ]
  },
  "bulk_bins_buying": {
    "decision": "Rice, oats, beans, lentils and spices from a busy bin.",
    "buying_tips": [
      "A full, busy bin turns over; oil in nuts and whole-grain flour goes rancid in a slow one.",
      "Best value: rice, oats, beans, lentils, dried fruit and especially spices.",
      "Riskiest: nuts, seeds and whole-grain flours. Oil goes rancid in a slow bin.",
      "Full busy bins turn over. A dusty half-empty one does not.",
      "Smell it before it goes in the cart. Rancid reads as paint, crayon or bitter.",
      "Buy what you will use in a month, and store it airtight and dark."
    ]
  },
  "whole_spices": {
    "decision": "Whole spices, bought small and ground as you go.",
    "buying_tips": [
      "Whole spices hold their oils for a couple of years; ground ones fade within months.",
      "A dry pan over medium heat, until you can smell them across the kitchen.",
      "Buy from a bin that turns over, in the smallest amount you will finish."
    ]
  },
  "rancidity_check": {
    "decision": "Oil in a dark bottle, finished within two months.",
    "buying_tips": [
      "Heat, light and air turn oil rancid, and the printed date does not predict it.",
      "Buy oil in a dark bottle, in a size you will finish inside two months.",
      "Keep whole-grain flour and shelled nuts in the freezer. The germ oil is what turns.",
      "Smell a bulk bin before you fill a bag from it."
    ]
  },
  "olive_oil_grades": {
    "decision": "Extra virgin olive oil with a recent harvest date.",
    "buying_tips": [
      "“Pure”, “classic” and “light” are refined oil; extra virgin uses no heat or solvent.",
      "Extra virgin: mechanically extracted, no heat or solvent, taste-panel tested.",
      "Look for a HARVEST date, not just ‘best by’. Buy recent.",
      "Dark glass or tin protects it from light; store away from the stove.",
      "Single country of origin, named with ‘product of’.",
      "‘First cold pressed’ is a legacy phrase and adds nothing legally."
    ]
  },
  "nut_butter_ingredients": {
    "decision": "Nut butter with just nuts and salt, oil on top.",
    "buying_tips": [
      "The no-stir texture comes from added palm or hydrogenated oil, usually with sugar.",
      "The list should read peanuts, and salt if you want it. Nothing else is needed.",
      "Oil separated on top is the good sign. Nothing was added to hold it in.",
      "Reduced-fat versions usually replace the fat with sugar and starch.",
      "Store natural jars upside down in the fridge. The oil redistributes on its own.",
      "Same reading for almond, cashew and sunflower butters."
    ]
  },
  "grains_beyond_rice": {
    "decision": "Grains with the bran still on, not polished off.",
    "buying_tips": [
      "Pearled grains have some or all of the bran polished off; hulled loses only the hull.",
      "Buckwheat, millet, sorghum and quinoa carry no gluten. Barley, farro and bulgur do.",
      "Buy from the bulk bins where you can.",
      "Cook a big batch. They keep several days and reheat straight from cold."
    ]
  },
  "bottled_water_buying": {
    "decision": "Spring water from a named spring, in glass.",
    "buying_tips": [
      "Spring water comes from a place; purified is a process, often run on city water.",
      "A spring with a name and a town behind it. “Bottled at the source” means something when the source is printed.",
      "Glass where the water is sold in glass. It is inert, it adds nothing, and it takes nothing.",
      "“Mineral water” is spring water with the dissolved solids to prove the ground it came from. Nothing may be added to it.",
      "Sparkling from a named spring is the same decision with bubbles in it. Read the label the same way.",
      "“Purified”, “distilled”, “deionized” and “reverse osmosis” are processes. The source is not on that label, and it does not have to be."
    ]
  },
  "label_front_vs_back": {
    "decision": "A short list of recognizable foods, read on the back.",
    "buying_tips": [
      "The back is regulated and had to be true; only some front words are defined.",
      "Turn it over first. Decide from the back, then look at the front if at all.",
      "Ingredient list, added-sugars line, serving size. Those three answer most questions.",
      "Front-of-pack words like natural, wholesome and farm fresh carry little or no definition.",
      "When the front and the back disagree, the back is the one that was checked.",
      "A short list of recognizable foods beats any claim printed on the front."
    ]
  },
  "label_ingredient_order": {
    "decision": "Ingredients led by foods, ahead of split sugars or flour.",
    "buying_tips": [
      "The list runs heaviest first, so the first three are most of the package.",
      "Read the first three. They are most of the package by weight.",
      "Everything after ‘contains 2% or less of’ is a trace amount, in any order.",
      "Watch for split sugars: syrups, concentrates, dextrose and honey listed separately.",
      "The added-sugars line totals them all, whatever each one was named.",
      "A first ingredient of ‘enriched wheat flour’ is not ‘whole wheat flour’."
    ]
  },
  "label_third_party_seals": {
    "decision": "A seal naming a program with an outside auditor.",
    "buying_tips": [
      "A badge a company gives itself has no published standard and no outside auditor.",
      "Look for a named program, not a decorative badge. If the standard cannot be looked up, it is marketing.",
      "Each seal covers one scope. Organic is not welfare, welfare is not pesticides, non-GMO is neither.",
      "Third-party audited beats self-declared, every time.",
      "More seals is not a better food. It is a food that bought more audits.",
      "The ingredient panel still decides what the thing actually is."
    ]
  },
  "label_cold_pressed_expeller": {
    "decision": "Cold-pressed or expeller-pressed olive, avocado or coconut oil.",
    "buying_tips": [
      "Most supermarket oil is solvent-extracted, then refined, bleached and deodorized.",
      "Which oil it is comes first. Olive, avocado and coconut are the ones worth pressing well; a cold-pressed canola is still canola.",
      "‘Expeller-pressed’ means mechanical, no solvent. Friction heat still happens.",
      "‘Cold-pressed’ means pressed with the temperature held down. Tightly defined only for olive oil.",
      "‘Refined’, ‘pure’, or no process word at all usually means solvent-extracted and refined.",
      "Unrefined oils taste like their source. Refined ones taste like nothing, which is the point of refining them.",
      "Dark bottle, cool shelf, and a size you will finish. Pressed oils are the least stable."
    ]
  },
  "label_sugar_free_substitutes": {
    "decision": "‘Unsweetened’; on ‘sugar-free’, read which substitute is listed.",
    "buying_tips": [
      "Sugar-free means under half a gram of sugar; something else does the sweetening.",
      "Read the list for which substitute: erythritol, maltitol, xylitol, stevia, monk fruit, sucralose, aspartame.",
      "‘Unsweetened’ is the plainer word. It generally means nothing sweet was added at all.",
      "‘Naturally sweetened’ has no definition. Honey, syrup and juice concentrate all qualify.",
      "Sugar alcohols are totalled on the panel under their own line."
    ]
  },
  "label_wild_vs_farm_raised": {
    "decision": "Whole or skin-on fish labeled with species, method and country.",
    "buying_tips": [
      "A bare fillet is far easier to swap for another species than whole or skin-on fish.",
      "Look for all three: species, wild or farm-raised, and country of origin.",
      "Origin can mean where it was processed, not where it was caught. Ask if it matters.",
      "Cooked and breaded seafood falls outside the labeling rule.",
      "Skin-on and whole fish are far harder to substitute than a bare fillet.",
      "A staffed counter can usually answer the origin question directly."
    ]
  },
  "label_serving_size": {
    "decision": "Packs compared at matching serving sizes, times servings per container.",
    "buying_tips": [
      "Every number on the panel is per serving, and a package can hold 2.5 of them.",
      "Start with servings per container, then serving size. Then read the numbers.",
      "Serving sizes reflect what people typically eat. They are not a recommendation.",
      "Comparing two products only works if their serving sizes match. Check both.",
      "Larger packages carry a per-package column. Use it.",
      "Added sugars has its own line now. It is the number that cannot be spun."
    ]
  },
  "label_artificial_color": {
    "decision": "Colors named on the list, like Red 40.",
    "buying_tips": [
      "‘Artificial color’ can cover titanium dioxide without naming it on the panel.",
      "Certified dyes appear by name and number. “Red 40” is always “Red 40.”",
      "“Artificial color” and “color added” cover the colors that need no name.",
      "“Colored with titanium dioxide” is that additive named on purpose, not by rule.",
      "Color sits low on an ingredient list, because the amounts used are small."
    ]
  },
  "raw_kefir": {
    "decision": "Plain raw kefir from a named farm, sold cold.",
    "buying_tips": [
      "Kefir is only as good as its milk, and the ferment stays live only when cold.",
      "The same farm name as the milk. Kefir is only as good as what went into it.",
      "A culture or bottling date on the bottle, not only a best-by.",
      "Glass, and a pour thick enough to cling to the side.",
      "Plain. Sweetened kefir is a dessert wearing a ferment’s name."
    ]
  },
  "raw_aged_cheese": {
    "decision": "Aged raw milk or lait cru cheese, 60 days minimum.",
    "buying_tips": [
      "Aged raw-milk cheese tastes of one herd and season; a commodity block, of very little.",
      "“Raw milk” or “lait cru” printed on the rind label, with an age beside it.",
      "A named maker and a named herd, not just a country of origin.",
      "The cut-to-order counter over the pre-wrapped wall.",
      "Hard, aged styles first: alpine, aged cheddar, manchego, pecorino.",
      "Keep the rinds. They belong in a pot of beans or soup."
    ]
  },
  "sprouts_raw": {
    "decision": "Cold-case sprouts with white roots and crisp stems.",
    "buying_tips": [
      "Warm, damp growing conditions also multiply any bacteria already on the seed.",
      "The refrigerated case only. Room-temperature sprouts have been left in growing conditions.",
      "Roots still white and threadlike, stems crisp rather than limp.",
      "No condensation fogging the clamshell and no sour smell through the vents.",
      "A pack date you can read. Days old, not a week.",
      "Or a jar, a mesh lid and a scoop of seed. Three days on the counter."
    ]
  },
  "produce_root_vegetables": {
    "decision": "Firm organic potatoes, conventional carrots, with nothing soft or sprouting.",
    "buying_tips": [
      "Carrots rank among the lowest for pesticide residue, so conventional is fine there.",
      "Potatoes: firm, with no bruises, nicks, or soft spots.",
      "Carrots: firm and well colored. With the tops on, choose bright green, fresh-looking tops.",
      "Sweet potatoes: smooth and firm, even in shape and size, peel color even for the variety, free of damage.",
      "Beets: firm and round with a slender tap root. The leaves on top say nothing certain about the root. Wilted leaves say little as long as the root is firm.",
      "Potatoes: a cool, dark, ventilated place, 45 to 50°F, for up to a month.",
      "Carrots: a closed bag or container in the refrigerator, tops removed, up to two weeks. A wilted carrot revives in cold water.",
      "Beets: stem trimmed to an inch, root end left on, refrigerated in a food-safe container up to two weeks."
    ]
  },
  "produce_brassicas": {
    "decision": "Conventional cabbage and cauliflower, tight heads, no soft spots.",
    "buying_tips": [
      "Cabbage and cauliflower rank among the lowest produce for pesticide residue.",
      "Broccoli: dark green florets, closed tight, on stems that are not thick and tough.",
      "Cauliflower: a head with no bruises or damage.",
      "Cabbage: outer leaves fresh, not wilted or insect-damaged. Remove any that are.",
      "Broccoli keeps in the refrigerator in a plastic bag with holes. Use it within three days.",
      "Cabbage keeps several weeks in a plastic bag or wrap in the refrigerator, at 41°F or below.",
      "Cut out the cabbage core and rinse the leaves under cool running water before using."
    ]
  },
  "produce_onions_garlic": {
    "decision": "Conventional onions and garlic, firm with a dry neck.",
    "buying_tips": [
      "A dry neck and papery skins mark a well-cured bulb; soft or scented ones are fading.",
      "Onions firm for their size, with little to no scent.",
      "An onion neck that is completely dry to the touch, not slippery.",
      "Garlic well cured: dried neck, dry outer skins, cloves firm to the touch.",
      "Some loose skins on an onion are normal.",
      "Whole onions: cool, dry, dark, with air moving. Never in plastic.",
      "Cut onions go in a sealed container for up to seven days."
    ]
  },
  "produce_leafy_greens": {
    "decision": "Crisp organic greens, evenly colored, without wilt or yellowing.",
    "buying_tips": [
      "By weight, spinach carries more pesticide residue than any other produce.",
      "Lettuce: crisp leaves, bright to dark green outside and pale at the heart, free of decay or damage.",
      "Romaine: a head that is neither very loose nor very hard. Loose is immature; hard is overmature.",
      "Spinach: uniformly green, fully crisp, fairly clean.",
      "Kale: firm, deep colored leaves on moist, hardy stems. Smaller leaves are more tender and milder.",
      "Store lettuce and spinach as close to 32°F as the refrigerator gets.",
      "Kale: plastic bag, air pressed out, unwashed, about five days in the refrigerator."
    ]
  },
  "produce_peppers": {
    "decision": "Firm organic peppers, evenly colored, without cracks or soft spots.",
    "buying_tips": [
      "A firm pepper still holds its water; wrinkled skin means it dried out in storage.",
      "Firm, with uniform shape, size, and color for the variety.",
      "Colored peppers: at least half of the surface colored.",
      "Free of cracks, decay, sunburn, disease, or insect damage.",
      "Skip a bruised or damaged pepper.",
      "Store around 45°F where possible; at 41°F, plan on about two weeks.",
      "Red, yellow, and orange peppers tolerate the cold better than green."
    ]
  },
  "produce_apples_pears": {
    "decision": "Unbruised organic apples and pears, with no spoiled fruit alongside.",
    "buying_tips": [
      "Bruised fruit makes the sound fruit beside it ripen and rot faster.",
      "Apples: firm and crisp, free of bruising, decay, cracks, and insect injury.",
      "Pears: free of bruising, insect damage, and decay; a firm green Bartlett ripens off the tree.",
      "Store in the dark at 30 to 32°F, up to 40°F, in a ventilated box or a perforated bag.",
      "Do not wash before storing; the moisture hastens decay.",
      "McIntosh and Honeycrisp: store at 38°F, since they are prone to chilling injury.",
      "Refrigerated apples keep up to a month."
    ]
  },
  "produce_citrus": {
    "decision": "Firm, smooth citrus: conventional to eat, organic for zest.",
    "buying_tips": [
      "A partly green orange can be fully mature, so firmness and a smooth rind tell more.",
      "Oranges: even color, firm, smooth, no decay, bruising, or blemishes.",
      "Lemons: even yellow, firm, smooth, no drying, rind stains, or shriveling.",
      "Limes: firm and smooth, no bruises, oil spotting, or dryness; yellow ones have more juice.",
      "Oranges: room temperature up to a week, refrigerator up to three weeks.",
      "Lemons and limes hold best in the 50s °F, warmer than the refrigerator.",
      "Use the yellowed lemons and limes first; the green-picked ones keep longest."
    ]
  },
  "produce_stone_fruit": {
    "decision": "Unbruised organic peaches, nectarines, plums and cherries, color fully turned.",
    "buying_tips": [
      "A bruise stays for good, and peaches and cherries both make the Dirty Dozen.",
      "Peaches and nectarines: ground color gone from green to yellow, no bruises or damage.",
      "Plums: skin color turned for the variety, no bruises or damage.",
      "Cherries: full color across the surface, green fleshy stems, no cracks, pecks, or shriveling.",
      "Store just above freezing, 30.5 to 32°F; cherries at or below 41°F.",
      "Plums that still need to ripen: keep them out of the 36 to 46°F range.",
      "Skin staining on a peach or nectarine is cosmetic; a bruise is not."
    ]
  },
  "sandwich_bread": {
    "decision": "Whole wheat sandwich bread, made with whole wheat flour.",
    "buying_tips": [
      "A loaf called just “wheat” may be refined; whole wheat keeps the bran and germ.",
      "Check for whole wheat flour in the ingredients.",
      "Without a stamp, use the flour names to check the loaf.",
      "Check which stamp is shown: 100%, 50%+, or Basic have different grain requirements."
    ]
  },
  "sourdough": {
    "decision": "Sourdough of flour, water, salt and a starter.",
    "buying_tips": [
      "Some loaves called sourdough use commercial yeast and added acids for the sour taste.",
      "Look for flour, water, salt, and a culture or starter.",
      "Ask about the starter when the label does not list it separately.",
      "Read for added vinegar or acetic acid; ask about fermentation rather than infer it from sour flavor."
    ]
  },
  "bagels": {
    "decision": "Bagels boiled before the oven, with their ingredients named.",
    "buying_tips": [
      "The boil sets the outside and gives a bagel its chew.",
      "Read the ingredient list on the bag, or ask the bakery for it.",
      "Ask the bakery about boiling before buying.",
      "Without a process label, ask the baker rather than infer boiling from the shape.",
      "Ask about the bath ingredients; baking soda changes alkalinity and browning."
    ]
  },
  "tortillas": {
    "decision": "Corn tortillas of masa, water and salt.",
    "buying_tips": [
      "Masa is corn cooked and soaked in limewater; some packaged corn tortillas add wheat.",
      "Read the list for masa or masa harina, water, and salt.",
      "For a flour tortilla, check the flour and the named fat rather than infer them from the color.",
      "Check whether the corn tortilla also lists wheat flour."
    ]
  },
  "turkey_whole": {
    "decision": "Plain whole turkey, without an injected basting solution.",
    "buying_tips": [
      "A basted or self-basted bird carries added broth, stock, fat or water.",
      "Read the solution ingredients beside the product name.",
      "A frozen whole turkey can be checked for the same added-solution statement.",
      "Read retained-water wording separately from the flavoring-solution statement."
    ]
  },
  "ground_turkey": {
    "decision": "Plain ground turkey with its fat content printed.",
    "buying_tips": [
      "The name ground turkey sets no one fat level, so two packs can differ.",
      "Choose a formulation listing turkey without added seasonings or a flavoring solution.",
      "Without a percent-lean claim, use the Nutrition Facts fat line to compare packs.",
      "Compare the fat content of the actual packs rather than assume one level for all ground turkey."
    ]
  },
  "breakfast_cereal": {
    "decision": "Whole-grain cereal or granola with less added sugar.",
    "buying_tips": [
      "Whole grain and added sugar are separate checks; a stamp covers only the grain.",
      "Check the 100% stamp rather than assume every stamp means all grain is whole.",
      "Without a stamp, read the grain ingredients and the added-sugars line.",
      "Read the added-sugars line even when honey or syrup is the named sweetener."
    ]
  },
  "pasta_dry": {
    "decision": "Dry pasta of durum semolina and water.",
    "buying_tips": [
      "The standard also allows farina or other flour; the list shows which is in the box.",
      "Look for durum semolina and water in the list.",
      "Plain dry pasta can be checked by ingredients without a bronze-cut claim.",
      "Read enrichment separately from the flour name and any bronze-cut claim."
    ]
  },
  "oat_milk": {
    "decision": "Oat milk with few stabilizers, never seed oil.",
    "buying_tips": [
      "Oat drinks vary carton to carton in stabilizers, protein and added vitamins.",
      "Read the protein line and the added vitamins and minerals on the carton.",
      "Compare the labels of available oat drinks; the formulation can differ.",
      "Read for stabilizers in the ingredient list; the study compared formulations with different stabilizer use."
    ]
  },
  "coffee_beans": {
    "decision": "Beans in a sealed bag that limits air.",
    "buying_tips": [
      "Oxygen exposure changes coffee’s aroma and chemistry as it sits in storage.",
      "Check that the packaging is sealed.",
      "A bag without a valve can still be checked for an intact seal. The valve alone is not the full packaging specification.",
      "Keep the sealed coffee away from heat; the archived storage studies describe heat-related changes."
    ]
  },
  "bacon": {
    "decision": "Bacon with a short list: pork, salt, named curing agents.",
    "buying_tips": [
      "‘Uncured’ bacon can still be cured with celery powder, and the list names it.",
      "Read any exception naming naturally occurring nitrates in celery powder.",
      "Compare the disclosed curing ingredients across available bacon packs.",
      "Read each ingredient in the curing mixture, including salt, sugar, and curing agents."
    ]
  },
  "hot_dogs": {
    "decision": "Hot dogs with named meat and no mechanically separated poultry.",
    "buying_tips": [
      "Mechanically separated poultry is a paste of tissue separated from the bones.",
      "Look for the named meat and read all other ingredients.",
      "Compare formulations across available packs rather than assume a species claim describes every ingredient.",
      "Check whether the list names mechanically separated chicken or turkey."
    ]
  },
  "canned_tuna": {
    "decision": "Canned light tuna, or a can naming skipjack.",
    "buying_tips": [
      "FDA puts canned light tuna in Best Choices for mercury, and albacore in Good Choices.",
      "Check the light designation or a named skipjack species.",
      "Canned light tuna can be chosen without a separately stated skipjack name.",
      "Read the packing medium separately from the light or white designation."
    ]
  },
  "chicken_breast": {
    "decision": "Plain bone-in, skin-on breast before boneless skinless; no added solution.",
    "buying_tips": [
      "Boneless skinless breast dries fast in the pan; bone and skin cook better.",
      "Read the full product name for the solution percentage and ingredients.",
      "Fresh or frozen breast can be checked for the same solution disclosure.",
      "Read retained-water wording separately from the added flavoring ingredients."
    ]
  },
  "produce_mushrooms": {
    "decision": "Dry, firm conventional mushrooms with no dark spots.",
    "buying_tips": [
      "Moisture is what spoils mushrooms, so a dry, firm cap is the fresh one.",
      "Feel for a dry, firm cap and pass on any with dark spots.",
      "Pick closed caps for a mild flavor and open caps for a stronger one.",
      "Buy them loose to take only the amount needed."
    ]
  },
  "produce_bananas": {
    "decision": "Green bananas to finish ripening on your counter.",
    "buying_tips": [
      "Bananas get sweeter as the green fades, and ripening on the plant often splits them.",
      "Take the greenest bunch for the week; it keeps ripening at home.",
      "Keep green bananas out of the fridge. Cold below 56°F can stop them ripening.",
      "Pass on fruit with skin splits or dark streaks."
    ]
  },
  "produce_green_beans": {
    "decision": "Smooth, crisp, slender organic beans, without bulging seeds.",
    "buying_tips": [
      "Bulging seeds mean an older bean, turning tough, stringy and starchy.",
      "Pick smooth, slender pods with no seeds bulging through.",
      "Leave beans with brown or rust spots behind.",
      "Store them cold and cook them within five days."
    ]
  },
  "egg_duck_quail": {
    "decision": "Clean, uncracked duck or quail eggs from a refrigerated case.",
    "buying_tips": [
      "Quail eggs held at room temperature lose quality sharply, so cold matters.",
      "Open the carton and check that every shell is clean and uncracked.",
      "Buy from a refrigerated case and keep them cold at home.",
      "Plan a longer cooking time for duck eggs, which are larger than hen’s eggs.",
      "Cook duck and quail eggs until white and yolk are solid."
    ]
  },
  "ham": {
    "decision": "Ham named just “Ham” first, then “Ham With Natural Juices.”",
    "buying_tips": [
      "The name tells the water: plain “Ham” has the least, and each step down adds more.",
      "Read the product name for “Water Added” or a percent of added ingredients.",
      "Check whether the label says fully cooked or cook before eating.",
      "Find where water sits in the ingredients statement."
    ]
  },
  "turkey_bacon": {
    "decision": "Turkey bacon with the fewest ingredients after the turkey.",
    "buying_tips": [
      "Turkey bacon is still a cured product, and every curing ingredient is on the label.",
      "Read the descriptive name beside “turkey bacon” for the meat used.",
      "Read each curing ingredient in the ingredients statement.",
      "Find any “Uncured” claim and the “No Nitrate or Nitrite Added” statement with it."
    ]
  },
  "cured_pork": {
    "decision": "Cured pork naming its cut, with a short curing list.",
    "buying_tips": [
      "Each is pork cured with salt and curing agents, so the list shows what went in.",
      "Read the product name for the cut, such as ham, belly, or jowl.",
      "Read each curing ingredient in the ingredients statement.",
      "Check whether the package says ready to eat or cook before eating.",
      "Guanciale is worth buying on the same terms: cut named, curing listed."
    ]
  },
  "lamb_goat": {
    "decision": "Lamb or goat labeled 100% grass-fed or grass-finished.",
    "buying_tips": [
      "Goat has no quality grade, so firm, fine-grained flesh with white fat is the check.",
      "Pick goat with firm, fine-grained flesh and well-distributed white fat.",
      "Pick lamb that is fine textured and firm, with white marbling.",
      "Read the primal cut on the label, such as shoulder or leg."
    ]
  },
  "organ_meats": {
    "instead": "A beef blend with liver and heart ground in.",
    "decision": "Organ meats you will cook within one to two days.",
    "buying_tips": [
      "Organ meats keep less time than steaks and roasts, just 1 to 2 days cold.",
      "Buy organ meats for a cook within one to two days.",
      "Ask the counter or a farmer which organs they offer.",
      "Match the organ to the method, with heart and tongue braised."
    ]
  },
  "bison": {
    "decision": "Bison labeled 100% grass-fed or grass-finished, with an inspection mark.",
    "buying_tips": [
      "Grass-raised bison often get grain for their last 90 to 120 days.",
      "Look for the triangle “U.S. Inspected and Passed” seal or a state mark.",
      "Expect a deeper red than beef, since bison has no marbling.",
      "Cook or freeze ground bison within 2 days, steaks within 3 to 5.",
      "Bag the package separately to contain any leaks."
    ]
  },
  "venison_game": {
    "decision": "Fat-trimmed venison from a fully refrigerated processor.",
    "buying_tips": [
      "Game often comes through small shops, where cold handling decides its safety.",
      "Ask whether the processor handles each animal individually.",
      "Choose a processor with fully refrigerated facilities.",
      "Use unfrozen venison within two or three days."
    ]
  },
  "white_fish": {
    "decision": "White fish sold by its named species, firm and mild-smelling.",
    "buying_tips": [
      "A fillet is hard to identify by eye, so the species name does that work.",
      "Ask which species the fillet is.",
      "Press the flesh and check that it springs back.",
      "Skip fillets with dried, dark or discolored edges."
    ]
  },
  "crab": {
    "decision": "Live crab that moves, or cooked with bright orange-red shells.",
    "buying_tips": [
      "Crabs spoil fast after death, and moving legs show the crab is alive.",
      "Check that live crabs move their legs.",
      "Look for bright orange to red shells on cooked crab.",
      "Smell cooked crab and skip any with an off odor.",
      "Buy unpackaged cooked crab only from a case kept apart from raw seafood."
    ]
  },
  "lobster": {
    "decision": "A live lobster that moves, or hard-frozen tails.",
    "buying_tips": [
      "A dead lobster spoils fast, and a tail that curls under shows a lively one.",
      "Ask the counter to lift the lobster and watch the tail.",
      "Check that the claws and legs move.",
      "Pick frozen tails that are hard-frozen, with clear white meat.",
      "Skip frozen packs that are torn or show ice crystals."
    ]
  },
  "scallops": {
    "decision": "Dry or dry-packed scallops, with no phosphate or water listed.",
    "buying_tips": [
      "Wet scallops are treated with phosphate and water so they hold extra water.",
      "Read the ingredients for a phosphate and water.",
      "Ask the counter whether the scallops are dry.",
      "Skip packs sitting in excess liquid.",
      "Smell for a sweetish odor."
    ]
  },
  "clams_mussels_oysters": {
    "decision": "Live shellfish with a tag, closed shells and none cracked.",
    "buying_tips": [
      "The tag names the certified shipper, the harvest date and the harvest area.",
      "Ask to see the shellfish tag.",
      "Tap any open shell and check that it closes.",
      "Skip cracked or broken shells.",
      "Read the date on shucked containers."
    ]
  },
  "smoked_salmon": {
    "decision": "Nova or lox smoked salmon, bought cold and kept cold.",
    "buying_tips": [
      "Shelf-stable smoked fish is heat-treated and sealed; nova and lox rely on the cold.",
      "Read the label for nova, lox or kippered.",
      "Pick it from a refrigerated case.",
      "Put it in the fridge soon after buying.",
      "Choose canned or jarred smoked fish to keep on the shelf."
    ]
  },
  "seafood_counter": {
    "decision": "Named species on ice, clean briny smell, springy flesh.",
    "buying_tips": [
      "Red gills mean recently slaughtered; brown, gray or green means past fresh.",
      "Ask the counter for the species name.",
      "Ask where it came from and whether it was farmed.",
      "Check that the fish sits on ice or in a refrigerated case.",
      "Check that cooked seafood is kept apart from raw.",
      "Ask the counter ‘was this previously frozen?’ The answer is often yes.",
      "Buy frozen and thaw at home on your own schedule.",
      "Don’t re-freeze fish that was sold thawed.",
      "Smell it. Clean and briny is right. Sharp, fishy or ammonia is not.",
      "Whole fish: clear domed eyes, bright red gills, tight scales, flesh that springs back.",
      "Fillets: a translucent sheen, flakes holding together, no browning at the edge.",
      "It should sit on plenty of ice, not in a pool of its own liquid.",
      "Ask when it came in and whether it was previously frozen. Both are fair questions."
    ]
  },
  "sprouted_grain_bread": {
    "decision": "Bread with sprouted whole grains first and no added flour.",
    "buying_tips": [
      "Some sprouted loaves add flour or wheat gluten, so the name alone does not settle it.",
      "Read the first ingredients for sprouted whole grains.",
      "Check the list for added flour or wheat gluten.",
      "Look in the refrigerated or freezer case."
    ]
  },
  "sprouted_grains": {
    "decision": "Grain labeled sprouted whole grain.",
    "buying_tips": [
      "The word sprouted has no regulated definition; sprouted whole grain keeps the kernel.",
      "Look for “sprouted whole” before the grain’s name.",
      "Read “sprouted” alone as a term with no regulated definition.",
      "Check that the ingredients name the grain as whole."
    ]
  },
  "specialty_flours": {
    "decision": "Specialty flour with “whole” in its name or first ingredient.",
    "buying_tips": [
      "A stone mill’s flour can still have its bran sifted out; “whole” is what settles it.",
      "Look for “whole” in the flour’s name or first ingredient.",
      "Check the fat line: about 2.5% for whole wheat flour, under 1% for white.",
      "Read almond flour as usually skinned, and almond meal as either."
    ]
  },
  "gluten_free_bread": {
    "decision": "Bread labeled gluten-free, with its flours and gum binder named.",
    "buying_tips": [
      "Every gluten-free wording meets one federal limit; a gum gives back some stretch.",
      "Check for one of the four gluten-free claim wordings.",
      "Read which flours and starches replace the wheat.",
      "Look for the gum that binds the loaf."
    ]
  },
  "buns_rolls": {
    "decision": "Buns and rolls named whole wheat.",
    "buying_tips": [
      "Whole wheat buns use whole wheat flour with no white flour; enriched buns do not.",
      "Read the name on the bag for “whole wheat”.",
      "Check the first ingredient for whole wheat flour.",
      "Read “enriched buns” as made with enriched flour, not whole wheat."
    ]
  },
  "pastries_muffins": {
    "decision": "Pastry made with butter, named on the label.",
    "buying_tips": [
      "Butter is Danish pastry’s traditional fat; factory-made often uses other fats.",
      "Read the ingredients for butter by name.",
      "Ask the baker which fat goes into the pastry.",
      "Read a muffin’s ingredients for butter or shortening."
    ]
  },
  "muesli": {
    "decision": "Muesli of just oats, fruit, nuts and seeds.",
    "buying_tips": [
      "Granola adds oil and sweetener before baking; plain muesli is a raw mix.",
      "Read the ingredients for sugar, honey or syrup.",
      "Pick a bag that lists only grains, fruit, nuts and seeds.",
      "Check whether the bag says toasted."
    ]
  },
  "bread_aisle": {
    "decision": "Your chosen bread, with “whole” in the first flour.",
    "buying_tips": [
      "“Enriched flour”, “bran” and “wheat germ” never mean whole grain on a list.",
      "Read the first ingredient for “whole”.",
      "Trust “100% whole wheat” or “100% whole grain” on the label.",
      "Check which Whole Grain Stamp is shown, if any."
    ]
  },
  "plain_kefir": {
    "decision": "Plain kefir from 100% grass-fed whole milk.",
    "buying_tips": [
      "100% grass-fed means the cows ate grass and hay, never grain.",
      "Pick the bottle with no flavor named on the label.",
      "Take it from the refrigerated case and keep it cold.",
      "Use plain kefir in place of buttermilk or yogurt in recipes."
    ]
  },
  "sour_cream": {
    "decision": "Sour cream soured by bacteria, with nothing else added.",
    "buying_tips": [
      "Cultured means bacteria did the souring; acidified tubs use added acids.",
      "Pick a tub named “sour cream” or “cultured sour cream”.",
      "Read the optional ingredients added for texture or shelf life.",
      "Check the name for a declared flavor."
    ]
  },
  "cream_cheese": {
    "decision": "Cream cheese by its standard name, at least 33% milkfat.",
    "buying_tips": [
      "The standard allows up to 0.5 percent stabilizers; the list shows who skipped them.",
      "Look for “cream cheese” as the name on the package.",
      "Find a culture in the ingredient list.",
      "Swap in Neufchâtel in most recipes; the two taste similar."
    ]
  },
  "cottage_cheese": {
    "decision": "Cottage cheese with its curd set by a culture.",
    "buying_tips": [
      "A culture sets the curd unless the tub prints “directly set” beside the name.",
      "Read the milkfat statement beside the name.",
      "Look for “directly set” or “curd set by direct acidification”.",
      "Pick dry curd cottage cheese for the version under 0.5 percent milkfat."
    ]
  },
  "ice_cream": {
    "decision": "A carton named “ice cream”, with no added oils listed.",
    "buying_tips": [
      "The name ice cream needs 10 percent milkfat and no oils beyond incidental amounts.",
      "Read the name on the carton, not the picture.",
      "Look for “frozen dairy dessert” in the small print.",
      "Read the ingredients for oils such as coconut or palm oil."
    ]
  },
  "ghee": {
    "decision": "Ghee or clarified butter with butter as the only ingredient.",
    "buying_tips": [
      "Plain ghee is butter simmered down to its fat; flavored jars add spices.",
      "Read the ingredient list for butter alone.",
      "Expect spices on the list if the jar is flavored.",
      "Choose ghee for its nutty taste and aroma."
    ]
  },
  "goat_sheep_dairy": {
    "decision": "Goat or sheep dairy with goat or sheep milk listed.",
    "buying_tips": [
      "The animal on the list decides the food; goat butter, for one, comes out white.",
      "Read the ingredients for goat milk or sheep milk.",
      "Look for feta, pecorino romano, Roquefort or Manchego for sheep milk cheese.",
      "Expect goat butter to be white, not yellow."
    ]
  },
  "almond_milk": {
    "decision": "Unsweetened almond milk, a short list, never seed oil.",
    "buying_tips": [
      "Almond drinks vary in added sugars, so the carton panel is the guide.",
      "Pick unsweetened over sweetened, vanilla or chocolate.",
      "Compare protein, vitamin D, calcium and potassium across cartons.",
      "Check saturated fat on the panel."
    ]
  },
  "soy_milk": {
    "decision": "Fortified, unsweetened soy milk.",
    "buying_tips": [
      "Fortified soy holds key nutrients similar to milk, so the dairy group counts it.",
      "Pick unsweetened over flavored.",
      "Compare protein and potassium across cartons.",
      "Check saturated fat on the label."
    ]
  },
  "coconut_milk_beverage": {
    "decision": "Unsweetened carton coconut milk with the fewest added gums.",
    "buying_tips": [
      "The carton is coconut milk thinned with water, and gums like gellan thicken it back.",
      "Read “beverage” in the name: coconut milk thinned with water.",
      "Find it in the nondairy milk section, next to the soy milk.",
      "Check for sugar and flavors on a sweetened carton.",
      "Reach for the can, not the carton, for full-fat coconut milk."
    ]
  },
  "plant_butter": {
    "decision": "Coconut or olive oil plant butter, never seed oil.",
    "buying_tips": [
      "Plant butters differ in their oils, and the ingredient list names each one.",
      "Find each oil named in the ingredient list.",
      "Check whether a nut milk or culture is listed, as in some versions.",
      "Compare the fat line on the Nutrition Facts.",
      "Seed oils and avocado oil are the two to pass over on the list."
    ]
  },
  "dairy_case": {
    "decision": "Choose the dairy type first, then read the carton.",
    "buying_tips": [
      "Each type has its own card; the carton adds vitamins, pasture and filtering.",
      "Choose the type first: milk, yogurt, cheese, butter, cream or a plant drink.",
      "Check the milk label for vitamins A and D.",
      "Read a filtered milk panel for its protein and sugar lines."
    ]
  },
  "kombucha": {
    "decision": "Kombucha from the refrigerated case, kept cold.",
    "buying_tips": [
      "Bottled kombucha can keep fermenting, and its alcohol can climb.",
      "Pick bottles from the refrigerated case.",
      "Read the Nutrition Facts for added sugars.",
      "Look for an alcohol statement on the label.",
      "Keep it cold once home."
    ]
  },
  "sauerkraut": {
    "decision": "Raw sauerkraut from the refrigerated case.",
    "buying_tips": [
      "Shelf-stable kraut is heated in the jar, which stops fermenting; raw is never heated.",
      "Look for raw on the label.",
      "Pick it from the refrigerated case.",
      "Keep raw kraut cold once home.",
      "Choose a shelf-stable jar for the pantry, knowing it was heated."
    ]
  },
  "kimchi": {
    "decision": "Kimchi of cabbage, red pepper, garlic, ginger and salt.",
    "buying_tips": [
      "The packed date shows its stage: crisp and bright is fresh, softer is well fermented.",
      "Read the list for cabbage, red pepper powder, garlic, ginger and salt.",
      "Check the label for the packed date.",
      "Look for crisp, plump, bright cabbage for fresh kimchi.",
      "Read the ingredients for fish sauce or shrimp."
    ]
  },
  "fermented_pickles": {
    "decision": "Pickles fermented in salt brine, sold refrigerated.",
    "buying_tips": [
      "Quick pickles are soured with vinegar in a day or two; brined ones sour for weeks.",
      "Pick from the refrigerated case.",
      "Read the ingredients for salt and no vinegar.",
      "Choose half-sour for a crisp, bright green pickle.",
      "Choose full-sour for a fully fermented pickle."
    ]
  },
  "raw_cider_vinegar": {
    "decision": "Raw, unfiltered cider vinegar, with the mother.",
    "buying_tips": [
      "Cider vinegar is fermented apple juice; unfiltered bottles can keep the mother.",
      "Look for unfiltered or with the mother on the label.",
      "Check that the label does not say diluted.",
      "Read the name for a second vinegar in a blend."
    ]
  },
  "miso": {
    "decision": "Miso of soybeans, salt and koji, with any grain named.",
    "buying_tips": [
      "White miso is mild and sweet, and red is the saltiest, so a little goes far.",
      "Read the ingredients for soybeans, salt, koji and the grain: rice, barley or none.",
      "Pick white miso if buying only one.",
      "Pick red miso knowing it is the saltiest kind.",
      "Keep the tub in the fridge after opening."
    ]
  },
  "tempeh": {
    "decision": "Tempeh in a firm cake, bound white all through.",
    "buying_tips": [
      "A finished cake holds together as one piece; a loose, crumbly one is unfinished.",
      "Press the pack and feel for a firm cake that holds as one piece.",
      "Read the ingredients for soybeans alone or added grains.",
      "Pass on any pack with noticeable mold or odd discoloration.",
      "Keep it cold, or freeze an unopened block."
    ]
  },
  "natto": {
    "decision": "Natto in sealed trays from the cold case or freezer.",
    "buying_tips": [
      "Chilled natto keeps only days; frozen, it keeps for months.",
      "Check the date on the pack.",
      "Look for trays kept cold or frozen.",
      "Freeze what will not be eaten within days.",
      "Expect a strong smell and sticky strings."
    ]
  },
  "fermented": {
    "decision": "Pick the food first, then read whether it was heated.",
    "buying_tips": [
      "Heat stops fermenting, and vinegar sours a food without it.",
      "Pick the food first, then open its own card.",
      "Check the label for raw or unpasteurized.",
      "Read the ingredients for vinegar.",
      "Look in the cold case, but trust the label over the shelf."
    ]
  },
  "broth": {
    "decision": "Broth whose list names the bones, meat or vegetables.",
    "buying_tips": [
      "The list shows what was simmered: stock is made from bones, and broth includes meat.",
      "Read the list for named bones, meat and vegetables.",
      "Read the Nutrition Facts for sodium.",
      "Look for low sodium or unsalted on the carton."
    ]
  },
  "salt": {
    "decision": "Iodized salt, with any anti-caking agent named on the list.",
    "buying_tips": [
      "Salt without iodine says “does not supply iodide” beside its name.",
      "Read the list: iodized salt lists added iodine.",
      "Check the list for an anti-caking agent.",
      "Pickling or canning salt is pure salt with nothing added."
    ]
  },
  "sugars": {
    "decision": "Sugar alone on the list; brown sugar adds molasses.",
    "buying_tips": [
      "Cane and beet sugar are the same substance, crystallized from the plant’s juice.",
      "Pick light or dark brown sugar; dark carries more molasses.",
      "Read the added sugars line as a percent Daily Value on a plain sugar.",
      "Keep brown sugar closed, since it hardens in open air."
    ]
  },
  "maple_syrup": {
    "decision": "Maple syrup by name, any Grade A color.",
    "buying_tips": [
      "Table syrup that claims maple need hold only 10 percent maple syrup.",
      "Check that the name says maple syrup, not table or pancake syrup.",
      "Any Grade A color, Golden to Very Dark, is pure maple syrup."
    ]
  },
  "cooking_oils": {
    "decision": "An oil the label names by its source.",
    "buying_tips": [
      "“Vegetable oil” on a label names a category, without any seed or fruit.",
      "Read the label for the oil’s name first.",
      "Look for refined or unrefined on the bottle.",
      "A bottle that says only “vegetable oil” names no oil."
    ]
  },
  "lard_tallow": {
    "decision": "Leaf lard or tallow, with nothing added to harden it.",
    "buying_tips": [
      "Lard may be hardened with lard stearin or hydrogenated lard, and the label says so.",
      "Pick leaf lard for lard from the abdominal fat.",
      "Read the ingredients for one fat: pork for lard, beef for tallow.",
      "Check that a tub called shortening is not taken for plain lard."
    ]
  },
  "cocoa": {
    "decision": "Cocoa with one ingredient on the list: cocoa.",
    "buying_tips": [
      "Dutch cocoa is treated with an alkali, and its name has to say so.",
      "Read the list for one ingredient: cocoa.",
      "Read the name for “processed with alkali”; that is Dutch cocoa.",
      "“Unsweetened cocoa” is often natural cocoa, not processed with alkali."
    ]
  },
  "seeds": {
    "decision": "Whole chia, hulled hemp, and ground flaxseed or whole flax.",
    "buying_tips": [
      "Flax needs grinding before use, while hulled hemp and chia go straight from the bag.",
      "Buy flax already ground, or whole for grinding at home.",
      "Pick hulled hemp seeds when no grinding is wanted.",
      "Pick chia whole or ground; soaked chia turns to gel."
    ]
  },
  "dried_fruit": {
    "decision": "Dried fruit with only the fruit on the ingredient list.",
    "buying_tips": [
      "Sulfites added to stop browning must be declared, so the list shows them.",
      "Pick a bag whose list names only the fruit.",
      "Expect added sugar on dried cranberries, since the fruit is tart.",
      "Compare two bags of the same fruit by their lists."
    ]
  },
  "nutritional_yeast": {
    "decision": "Fortified or unfortified nutritional yeast flakes, granules or powder.",
    "buying_tips": [
      "The two look alike in the bag; only the list shows whether vitamins were added.",
      "Read the ingredient list to tell fortified from unfortified.",
      "Pick flakes, granules or powder by how it will be used.",
      "Look in the spice aisle or the bulk bins."
    ]
  },
  "canned_coconut_milk": {
    "decision": "Canned coconut milk, read for anything added beyond coconut.",
    "buying_tips": [
      "Many cans add a gum such as guar gum to thicken the milk and hold it steady.",
      "Read the ingredients for guar gum or another gum.",
      "Compare two cans by how much the list holds beyond coconut."
    ]
  },
  "dried_herbs": {
    "decision": "A single herb, named on the jar.",
    "buying_tips": [
      "Basil and oregano count as spices, so a blend can list them only as “spice.”",
      "Pick a single herb when the name on the jar matters.",
      "Read a blend’s list for “spice” standing in for herb names.",
      "Look for “spice and coloring” where a spice also adds color."
    ]
  },
  "tea": {
    "decision": "The tea leaf alone: black, green, white or oolong.",
    "buying_tips": [
      "Every true tea is one plant’s leaf; herbal blends come from other plants.",
      "Read the list for the tea leaf alone.",
      "Read herbal blends for the plants inside, since none is true tea.",
      "Read the box for “decaffeinated” when caffeine matters."
    ]
  },
  "vinegar": {
    "decision": "Vinegar by its printed acidity; 5 percent for pickling.",
    "buying_tips": [
      "Bottles at 4 percent are sold too, and tested pickling recipes rely on 5.",
      "Read the label for percent acidity.",
      "Choose 5 percent acidity for canning or pickling.",
      "An unpasteurized vinegar says so on its label.",
      "On balsamic, read for the full protected name and its aging words.",
      "Store vinegar cool, dark and tightly capped."
    ]
  },
  "pasta_sauce": {
    "decision": "Pasta sauce with tomatoes first and a short list.",
    "buying_tips": [
      "Ingredients run most first, so anything ahead of the tomatoes outweighs them.",
      "Read the first ingredient; tomatoes should lead.",
      "Count what follows the tomatoes; a short list is the craft standard.",
      "On canned tomatoes, read the “with” words for added spices, seasonings or vegetables."
    ]
  },
  "jam": {
    "decision": "Jam or preserves by name, made from fruit, not juice.",
    "buying_tips": [
      "Jam and preserves start from the fruit itself; jelly is strained juice.",
      "Read the name for “Jam” or “Preserves” with the fruit named.",
      "Preserves hold small whole fruits or uniform pieces in a thick syrup.",
      "In a mixed-fruit jam, the fruits are listed most first.",
      "Refrigerate the jar once opened.",
      "At farmers markets, cottage-food jam labels name the maker and address."
    ]
  },
  "ketchup_mustard": {
    "decision": "Ketchup led by tomato; mustard of seed, vinegar and spice.",
    "buying_tips": [
      "Ketchup’s federal standard starts from tomato; sweeteners and spices are optional.",
      "Read the ketchup label for tomato concentrate and vinegar.",
      "Read the mustard label for mustard seed, vinegar and spices.",
      "Stone ground mustard shows visible specks of seed.",
      "Dijon carries mild white wine notes; yellow mustard is mild.",
      "Use an open condiment before opening a new one."
    ]
  },
  "mayo": {
    "decision": "Mayonnaise by name: oil, egg yolk and an acid.",
    "buying_tips": [
      "A jar sold on avocado or olive oil can carry other oils; the list shows which leads.",
      "Check that the name on the jar is Mayonnaise.",
      "Read which oil the ingredient list names first.",
      "Compare jars by what they add beyond oil, egg yolk, acid and salt.",
      "Once opened, keep it in the fridge and use it within 1 to 2 months."
    ]
  },
  "hot_soy_sauce": {
    "decision": "Traditionally brewed soy sauce, not made fast with acid.",
    "buying_tips": [
      "Brewed soy sauce ferments for months; the fast method makes it with acid in hours.",
      "Read the ingredients for wheat, on tamari too.",
      "Read the front for a gluten-free claim.",
      "On hot sauce, read the ingredients for vinegar; some fermented sauces have none added."
    ]
  },
  "canned_soup": {
    "decision": "Low-sodium canned soup with a short list, can undented.",
    "buying_tips": [
      "Low sodium is a fixed ceiling; reduced sodium only means less than a named soup.",
      "Read the front for low sodium versus reduced sodium.",
      "Check reduced sodium claims for the named soup they compare against.",
      "Check each can for deep dents, seam dents, leaks, rust and bulging lids.",
      "Store cans cool and dry, between 50 °F and 70 °F.",
      "Put new cans behind older ones and use the oldest first.",
      "Wipe the lid before opening.",
      "Move opened soup to a covered glass or plastic container in the refrigerator."
    ]
  },
  "olives": {
    "decision": "Brine-cured olives, fermented slowly in water and salt.",
    "buying_tips": [
      "Lye works quickly and leaves a neutral olive; brine keeps a salty, fermented flavor.",
      "Read the jar for the curing method: brine, lye or dry salt.",
      "Greek-style olives are near-ripe purple fruit cured in brine.",
      "Spanish-style green olives are treated with lye, rinsed, then fermented.",
      "California-style black ripe olives are the mildest and least bitter: a style, not a flaw.",
      "Finish an opened jar within about 2 weeks."
    ]
  },
  "seaweed": {
    "decision": "Sea vegetables labeled by kind: nori, kombu or kelp.",
    "buying_tips": [
      "Kinds differ widely, and a study found species mislabeled on several products.",
      "Read the package for the kind: nori, kombu, kelp or another.",
      "Laver, or nori, is soaked briefly or toasted dry.",
      "Sugar kelp is soaked briefly, then simmered into broths.",
      "Dulse is eaten as a snack straight from the bag."
    ]
  },
  "salsa": {
    "decision": "Salsa with onions, peppers and tomatoes plus an acid.",
    "buying_tips": [
      "Shelf jars are acidified and heat-processed; a tub sold cold is meant to stay cold.",
      "Look for onions, peppers and tomatoes alongside an acid on the list.",
      "A fresh tub from the cold case goes straight back in the refrigerator.",
      "Homemade salsa keeps up to one week in the refrigerator.",
      "In Virginia, a home-kitchen jar sells directly to shoppers and names its maker, address and phone."
    ]
  },
  "coconut_water": {
    "decision": "Coconut water alone on the list, with nothing added.",
    "buying_tips": [
      "Brands differ, and some add sugar; the list shows whether yours did.",
      "Read the ingredients: coconut water alone, or with sugar added.",
      "Canned coconut water is heat-treated so it keeps.",
      "A whole young coconut in its husk keeps longer than a trimmed one."
    ]
  },
  "condiments": {
    "decision": "Condiments read by their first ingredient, spoon to spoon.",
    "buying_tips": [
      "Ingredients run most first, so the first one is what the jar mostly holds.",
      "Read the first ingredient; it is the one present in the largest amount.",
      "Check the serving size before comparing two jars.",
      "Write the open date on a jar the day it is opened.",
      "Use an open condiment before opening a new one."
    ]
  },
  "crackers": {
    "decision": "Crackers with a whole grain listed first on the ingredients.",
    "buying_tips": [
      "Plain “wheat flour” is not whole grain, and multigrain often means refined grains.",
      "Read the first ingredient; a whole grain there leads the cracker.",
      "Look for “whole wheat flour” on the list, not just “wheat flour.”",
      "For a fermented cracker, look to soda crackers, raised with yeast, or sourdough crackers made from starter."
    ]
  },
  "tortilla_chips": {
    "decision": "Corn masa tortilla chips, the corn cooked in limewater.",
    "buying_tips": [
      "Lime-cooked corn grinds into masa, a dough; untreated cornmeal cannot form one.",
      "Read the ingredients for masa or corn masa.",
      "A trace of lime on the list points to the traditional cooking step.",
      "“Restaurant-style” chips are tortillas cut into wedges and fried."
    ]
  },
  "potato_chips": {
    "decision": "Thin-sliced potato chips, the way chips began.",
    "buying_tips": [
      "Stacked crisps start as dried potato flakes and cornstarch pressed into one shape.",
      "Read the ingredients; a sliced chip starts with potatoes.",
      "Identical, stackable shapes point to a crisp pressed from flakes.",
      "Expect irregular sizes and folds in a bag of sliced chips."
    ]
  },
  "popcorn": {
    "decision": "Plain popcorn kernels, popped at home.",
    "buying_tips": [
      "Plain kernels pop with no oil, so any butter, oil or salt is your call.",
      "Buy plain kernels and add butter or oil and salt at home, if wanted.",
      "Loose kernels pop in a plain brown paper bag in the microwave.",
      "Unpopped “old maids” come from hulls with cuts or weak spots."
    ]
  },
  "pretzels": {
    "decision": "Pretzels listing flour, malt, oil, salt, yeast and soda.",
    "buying_tips": [
      "The alkaline bath gives a pretzel its chew and glossy brown crust.",
      "Read the list for flour, malt syrup, oil, salt, yeast and soda.",
      "Hard and soft pretzels both take the bath; a hard one bakes about twice as long.",
      "A paler pretzel can point to the milder baking soda bath."
    ]
  },
  "snack_bars": {
    "decision": "Bars with oats or another whole grain listed first.",
    "buying_tips": [
      "Ingredients run by amount, so the first one leads; rolled oats count as whole grain.",
      "Read the first ingredients; oats or another whole grain should lead.",
      "Look for fruit, honey or syrups as the sweetener, with nuts and seeds.",
      "Many bars carry sugar and high fructose corn syrup, and the list shows which."
    ]
  },
  "trail_mix": {
    "decision": "Trail mix of nuts and dried fruit, little else listed.",
    "buying_tips": [
      "Ingredients run by amount, so a long list can push nuts and fruit to the back.",
      "Read the first few ingredients; nuts and fruit should lead.",
      "Compare mixes by how short the list runs beyond nuts and fruit."
    ]
  },
  "snacks": {
    "decision": "Snacks with a whole grain, vegetable or bean listed first.",
    "buying_tips": [
      "Ingredients run by amount, and multigrain often means several refined grains.",
      "Read the first ingredient before the front of the bag.",
      "Look for a whole grain, vegetable or bean listed first.",
      "Read “multigrain” as several grains, not whole grains."
    ]
  },
  "hummus": {
    "decision": "Hummus of chickpeas and tahini, the traditional pairing.",
    "buying_tips": [
      "Hummus bi tahina names its two parts, so chickpeas and tahini should lead the list.",
      "Read the list for chickpeas and tahini at the top.",
      "Look for lemon or citric acid; an acid balances the chickpeas and tahini.",
      "A tub listing guar gum runs thicker; without it, water and grind set the texture."
    ]
  },
  "deli_salads": {
    "decision": "Deli salads from the cold case, eaten within days.",
    "buying_tips": [
      "Cold food stays at 40°F or below, and egg, tuna or macaroni salad keeps 3 to 5 days.",
      "Buy salads from a refrigerated case.",
      "Check the Sell-By date, and skip a tub past it.",
      "Get it home cold; two hours out at most, one hour above 90°F."
    ]
  },
  "prepared_meals": {
    "decision": "Hot food held hot and cold food held cold.",
    "buying_tips": [
      "Hot food belongs at 140°F or above and cold food below 40°F.",
      "Find the thermometer facing out and read it before choosing.",
      "Pick pans filled to the rim, not piled into mounds.",
      "Look for a sneeze guard and a separate utensil for each dish.",
      "At home, two hours out at most, then into the fridge."
    ]
  },
  "fresh_pasta": {
    "decision": "Fresh pasta of flour and egg, with little else listed.",
    "buying_tips": [
      "Many packs add nothing, and some add ascorbic or citric acid, which the list shows.",
      "Read the list; flour and egg with little else marks a plain pack.",
      "Pick a pack that is vacuum sealed or holds an oxygen packet."
    ]
  },
  "deli": {
    "decision": "Deli food from a cold case, or a hot one.",
    "buying_tips": [
      "Breads and dry snacks keep fine out of the cold; meats, cheeses and salads need it.",
      "Check that meats, cheeses and salads sit in a refrigerated case.",
      "For hot food, look for a case held at 140°F or above.",
      "Ask about one food by name: deli salads, prepared meals or lunch meat."
    ]
  },
  "frozen_pizza": {
    "decision": "Frozen pizza whose crust lists flour, water, salt, yeast.",
    "buying_tips": [
      "That short list is the traditional Neapolitan dough, with nothing else in it.",
      "Read the crust list for flour, water, salt and yeast.",
      "On a whole wheat crust, look for whole wheat flour listed first.",
      "At home, double-wrap a pizza for the freezer: plastic wrap, then foil.",
      "Air touching the surface leaves freezer burn, grayish-brown leathery spots."
    ]
  },
  "frozen_meals": {
    "decision": "Frozen meals named for their meat, inspection mark shown.",
    "buying_tips": [
      "The name sets a floor: at least 25 percent meat in a stew, 18 in a poultry dinner.",
      "Read the product name first: it sets the meat minimum.",
      "Check the package for the inspection mark.",
      "Read the label, since some products must be cooked from frozen.",
      "At home, use frozen dinners within 3 to 4 months for best quality."
    ]
  },
  "frozen_fries": {
    "decision": "Frozen fries of potatoes, oil and salt, little else.",
    "buying_tips": [
      "At home, hash browns take potatoes, oil, salt and pepper; the bag lists anything more.",
      "Read the bag’s ingredient list for potatoes, oil and salt.",
      "Compare bags by what each one lists beyond potatoes, oil and salt.",
      "In an air fryer, preheat about 3 minutes and shake the basket halfway.",
      "Do not overcrowd the air fryer basket, so the fries cook evenly.",
      "From an oven recipe, lower the air fryer temperature 25 to 30 F and the time by 20%."
    ]
  },
  "frozen_waffles": {
    "decision": "Frozen waffles with a whole grain listed first.",
    "buying_tips": [
      "“Wheat flour” is plain flour, and front grain claims are undefined, so the list decides.",
      "Read the first ingredient for a whole grain, such as whole wheat flour.",
      "Graham flour and rolled oats count as whole grain on the list.",
      "Regular waffles rise with baking powder or soda, and yeast waffles rise with yeast.",
      "At home, freeze cooled waffles airtight with parchment between, then toast them from frozen."
    ]
  },
  "frozen_nuggets": {
    "decision": "Chicken nuggets that say white meat on the label.",
    "buying_tips": [
      "“White meat” means 100 percent light meat; “mostly white meat” can be 66 percent.",
      "Read the name: a plain “Chicken Nugget” is a solid piece of meat or poultry.",
      "Look for “Chopped and Formed” beside the name, which means chopped and formed meat or poultry.",
      "A nugget labeled “breaded” holds no more than 30 percent breading."
    ]
  },
  "frozen": {
    "decision": "Frozen food that is frozen solid, picked up last.",
    "buying_tips": [
      "Food held at 0°F or below keeps its color, flavor and texture better.",
      "Pick up frozen food just before checkout, and buy only food frozen solid.",
      "Get it into the home freezer as soon as possible.",
      "Keep the freezer at 0°F or below, and 5°F at most.",
      "Ice cream that is not brick-hard means the freezer runs warm.",
      "Label and date frozen food, and use the oldest first.",
      "Cook or thaw by the label instructions."
    ]
  }
};

export const withTwoLine = (entry) => (entry && TWO_LINE[entry.id] ? { ...entry, ...TWO_LINE[entry.id] } : entry);

// The same fields as they stood the commit before the rewrite (a6979b0), for older tests that pin
// the copy they shipped (the ca7Superseded.js pattern); twoLinePin.test.js owns the new text.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PRE = JSON.parse(execFileSync('git', ['show', 'a6979b0:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
export const beforeTwoLine = (e) => {
  if (!e || !TWO_LINE[e.id]) return e;
  const p = PRE.entries.find((x) => x.id === e.id);
  return { ...e, ...Object.fromEntries(Object.keys(TWO_LINE[e.id]).map((k) => [k, p[k]])) };
};
