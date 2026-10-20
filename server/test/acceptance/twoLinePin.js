// THE TWO-LINE REWRITE, pinned (docs/CARD-STYLE-SAMPLES.md, approved 2026-10-17; applied at 014d24a).
// Every card the rewrite touched, with its approved decision and buying_tips verbatim (plus the egg
// feed sources its line 2 rests on, and the cart picks lintSections moved to follow three new fronts). Older batch
// tests overlay these onto their own baselines with withTwoLine(), so each keeps guarding its
// other fields while the rewrite itself stays pinned here: change a line on a card, change it here.
// concern-deli also pins every edited field on its seven cards and two picks; beforeTwoLine
// restores those fields for historical comparisons without changing their fixtures.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nonEmpty } from '../../lib/testGuards.js';

export const TWO_LINE = {
  "salmon_wild_vs_farmed": {
    "decision": "Wild salmon, frozen wild Alaskan before fresh farmed.",
    "buying_tips": [
      "Wild salmon eats krill and small fish; farmed eats plant protein and vegetable oil.",
      "Sockeye and coho are almost always wild, and their color is deep because of diet, not dye.",
      "A 2004 Science study found 14 contaminants, PCBs and dioxins included, all higher in farmed salmon. Levels were well below FDA tolerance levels for bought fish.",
      "Canned wild salmon comes next; for farmed salmon, read the country of origin.",
      "Frozen wild Alaskan is the same fish, frozen at its best. ‘Fresh’ at the counter is often previously-frozen, so ask."
    ],
    "watch_out": [
      "Atlantic salmon is farmed, effectively without exception. Wild Atlantic is off the market.",
      "Antibiotic use on farms varies enormously by country of origin. Seafood Watch rates two-thirds of Chilean farmed salmon red for high antibiotic use.",
      "Alaska law limits aquatic farming to shellfish and seaweeds, so Alaska salmon is not net-pen farmed. Hatchery ‘ranching’ there releases juveniles to supplement wild runs, not replace them."
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
      }
    ]
  },
  "shrimp_imported_vs_domestic": {
    "decision": "Wild American or Gulf shrimp; read the country of origin.",
    "buying_tips": [
      "Country of origin is printed by law, and wild American traces to a managed fishery.",
      "Second choice is pond-raised shrimp labeled Naturland or Aquaculture Stewardship Council; last is imported shrimp.",
      "A 2015 Consumer Reports test found antibiotics in 11 of 205 raw imported pond-raised samples, from Vietnam, Thailand and Bangladesh.",
      "Uniform size and a flawless look point to pond-raised; wild shrimp come in a wide range of sizes.",
      "‘Fresh’ at the case is nearly always thawed, so frozen raw is the same shrimp. Ask the case if it is dry, since wet shrimp holds extra water."
    ],
    "watch_out": [
      "Where wild American is not stocked, check for a BAP or ASC certification. A label alone is not proof; antibiotics showed on four samples carrying one common label.",
      "Consumer Reports found bacteria on 20 percent of raw U.S. wild samples and 42 to 83 percent of imported pond-raised. Cooking through kills most of it, yet 16 percent of cooked samples carried bacteria.",
      "A 2014 Oceana DNA test found 30 percent of shrimp labels misleading, with some pond-raised shrimp sold as wild. The Southern Shrimp Alliance, a domestic industry group, counts India, Indonesia and Vietnam first in FDA refusals for drug residues."
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
      }
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
    "decision": "Pasture-raised or organic rotisserie chicken, salt and spices only.",
    "buying_tips": [
      "A solution bird was injected with water and seasoning before it went on the spit.",
      "Look for a pasture-raised or certified organic bird on the sticker.",
      "Read the sticker, not the name. ‘Seasoned’, ‘original’ and ‘traditional’ are marketing; the ingredient list is regulated.",
      "The shortest list wins: chicken, salt, spices. Water as the second ingredient means a solution was added.",
      "Sodium phosphate, a starch or a sweetener after the water means a solution bird. The shorter the seasoning line, the plainer the chicken.",
      "A bird held under the lamp is held hot for a reason. Take one that is steaming, not one that has sat.",
      "Check the sticker for oil in the seasoning; choose olive oil or a bird with no added oil.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Skip a bird seasoned with avocado oil too."
    ],
    "sources": [
      "9 CFR § 381.117 Name of product and other labeling (law.cornell.edu) https://www.law.cornell.edu/cfr/text/9/381.117",
      "9 CFR § 381.118 Ingredients statement (law.cornell.edu) https://www.law.cornell.edu/cfr/text/9/381.118",
      "9 CFR § 424.21 Use of food ingredients and sources of radiation (law.cornell.edu) https://www.law.cornell.edu/cfr/text/9/424.21",
      "USDA FSIS, Chicken from Farm to Table, Ready-Prepared Chicken https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/chicken-farm-table",
      "USDA FSIS, ‘Danger Zone’ (40°F - 140°F) https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/danger-zone-40f-140f",
      "USDA FSIS, Meat and Poultry Labeling Terms, Basted / Self basted https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/meat-and-poultry-labeling-terms",
      "Whole Foods Market Organic Rotisserie Chicken, ingredient list from the package (EWG Food Scores, UPC 099482803568) https://www.ewg.org/foodscores/products/099482803568-WholeFoodsMarketOrganicRotisserieChicken/",
      {
        "name": "Dr. Cate Shanahan: The Hateful Eight seed oils",
        "url": "https://drcate.com/hateful-eight/"
      }
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
    "decision": "Organic produce, first on everything eaten skin-on.",
    "buying_tips": [
      "Residue sits on the skin, so a peel you throw away takes it with it.",
      "The USDA Organic seal on the sign or sticker is the standard to read.",
      "Ask one question at the shelf: does the skin get eaten? Berries, greens, apples, grapes and potatoes, yes. That is where the money goes."
    ]
  },
  "frozen_vs_fresh_produce": {
    "decision": "Plain organic frozen produce, picked ripe and frozen within hours.",
    "buying_tips": [
      "Freezing holds produce at peak ripeness, while fresh can lose nutrients in transit.",
      "Frozen organic bags carry the same USDA Organic seal and rules as fresh.",
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
    "decision": "Organic in-season produce, or frozen when out of season.",
    "buying_tips": [
      "In season, it travels less and reaches you closer to ripe, so it tastes better.",
      "In-season organic produce carries the USDA Organic seal, fresh or frozen.",
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
      "Look for grass-fed on the wrapper; cream and salt are the whole list.",
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
      "The shortest date on the shelf usually means the least processing, not worse milk.",
      "rBST is a synthetic growth hormone given to dairy cows. Certified organic milk comes from cows that cannot receive it.",
      "For the rBST label, certified organic comes first. Next, find “from cows not treated with rBST” on the carton. A carton with neither claim comes last. US labels need not say whether cows received it."
    ],
    "aliases": [
      "whole milk",
      "2% milk",
      "skim milk",
      "reduced fat milk",
      "low fat milk",
      "milk fat",
      "which milk",
      "what milk",
      "milk should i buy",
      "a2 milk",
      "a2",
      "a1 milk",
      "a1",
      "a2 vs a1",
      "beta casein",
      "bcm 7",
      "jersey milk",
      "guernsey",
      "a2 yogurt",
      "a1 yogurt",
      "a2 protein",
      "milk protein type",
      "ultra pasteurized",
      "uht milk",
      "pasteurized milk",
      "homogenized",
      "non homogenized",
      "cream top milk",
      "why does organic milk last so long",
      "milk processing",
      "milk carton",
      "milk cartons",
      "gallon of milk",
      "carton of milk",
      "Low-temp pasteurized grass-fed whole milk",
      "100% grass-fed low-temp pasteurized whole milk"
    ],
    "cart_pick": "100% grass-fed low-temp pasteurized whole milk",
    "question": "Should you buy whole or low-fat milk?",
    "sources": [
      "reviews of dairy-fat and cardiometabolic outcomes (contested literature)",
      "Michigan State University Extension, dairy processing article (milk standardized to skim, 1%, 2% and whole through separators)",
      "Florida Dairy Farmers “How Much Fat is in Whole Milk?” https://www.floridamilk.com/in-the-news/blog/nutrition/how-much-fat-is-in-whole-milk-whole-2-low-fat-and-skim-milk-explained.stml",
      "characterization of the A1 and A2 beta-casein variants and BCM-7 release in digestion",
      "human digestive-comfort trials on A2 milk (small, inconsistent, several industry-funded)",
      "University of Minnesota Extension “A2 milk and A2 genetics” https://extension.umn.edu/agriculture/animals-and-livestock/dairy/a2-milk-and-a2-genetics",
      "FDA Pasteurized Milk Ordinance (time and temperature standards)",
      "FDA milk labeling and processing definitions",
      "Michigan State University Extension, dairy processing article https://www.canr.msu.edu/news/they_did_what_to_your_milk (homogenization forces milk at high pressure through small holes so fat does not rise; no health benefits or risks associated with it; non-homogenized milk available from some bottlers)",
      "CDC “Raw Milk” https://www.cdc.gov/food-safety/foods/raw-milk.html",
      {
        "name": "Cornell LII: 7 CFR § 205.238 Organic livestock hormone rules",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.238"
      },
      {
        "name": "BCPP: rBGH / rBST labeling",
        "url": "https://www.bcpp.org/resource/rbgh-rbst/"
      }
    ]
  },
  "cheese_real_vs_processed": {
    "decision": "Grass-fed block cheese: milk, cultures, salt, enzymes, nothing else.",
    "buying_tips": [
      "Bagged shreds are coated in starch to keep them apart, which is why they melt poorly.",
      "Look for grass-fed milk named on the block.",
      "Look for a short list: milk, salt, cultures, enzymes/rennet.",
      "Blocks are cheaper per pound than pre-sliced or shredded, and they melt smoothly.",
      "‘Parmesan’ is a generic word in the US. ‘Parmigiano-Reggiano’ is a protected one with a stamped rind.",
      "Keep hard-cheese rinds. They belong in a pot of beans or soup.",
      "The milk for cheese may come from cows given the synthetic growth hormone rBST. Certified organic rules exclude its use.",
      "Certified organic block cheese is the first choice. Next, find a wrapper stating the cheese uses milk from cows given no rBST. Cheese with neither claim is last. US labeling does not require a statement about rBST use."
    ],
    "question": "Should you buy block cheese, slices, or pre-shredded?",
    "sources": [
      "FDA standards of identity for cheese",
      "FDA process-cheese labeling rules",
      "Mason Dixie Foods “Natural Cheese vs. Processed” https://masondixiefoods.com/blogs/faqs/natural-cheese-vs-processed",
      {
        "name": "Cornell LII: 7 CFR § 205.238 Organic livestock hormone rules",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.238"
      },
      {
        "name": "BCPP: rBGH / rBST labeling",
        "url": "https://www.bcpp.org/resource/rbgh-rbst/"
      }
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
      "Whole-milk versions are more filling and less tinkered with than fat-free.",
      "rBST names a synthetic growth hormone used in dairy cows. Certified organic yogurt rules bar it in the herd.",
      "For this herd treatment, take certified organic yogurt first. Next is a tub stating its milk comes from cows not given rBST. Tubs bearing neither claim rank last. US labels need not disclose whether cows received rBST.",
      "Read the ingredient list for synthetic dyes: Red 40, Yellow 5, Yellow 6 or Blue 1. Take the list with no added color over one naming a dye. “Lake” means a dye that does not dissolve in water; it still counts."
    ],
    "question": "What should you look for in yogurt?",
    "sources": [
      "USDA FoodData Central",
      "FDA added-sugars labeling requirements",
      "University of Florida IFAS Extension “All About Yogurt” (FS185) https://ask.ifas.ufl.edu/publication/FS185",
      "FDA standards of identity for yogurt",
      "National Yogurt Association ‘Live & Active Cultures’ seal criteria",
      {
        "name": "Cornell LII: 7 CFR § 205.238 Organic livestock hormone rules",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.238"
      },
      {
        "name": "BCPP: rBGH / rBST labeling",
        "url": "https://www.bcpp.org/resource/rbgh-rbst/"
      },
      {
        "name": "CSPI: Artificial colorings (synthetic food dyes)",
        "url": "https://www.cspi.org/node/7436"
      }
    ],
    "kristy_take": "Big tub of plain, add your own berries. Plain has no added sugar."
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
      "Bulk oats are pennies per serving.",
      "Choose certified organic oats over conventional. Conventional oats may be sprayed with glyphosate shortly before harvest to dry the crop. Organic farming does not allow glyphosate. Drift can still leave residues on organic oats."
    ],
    "sources": [
      "USDA FoodData Central",
      "Michigan State University Extension “Love your oats” https://www.canr.msu.edu/news/love_your_oats (glycemic index measured at 42 for steel-cut oats, 55 for rolled and 83 for instant)",
      {
        "name": "Cornucopia Institute: Glyphosate Used to Kill and Prepare Crops for Harvest",
        "url": "https://www.cornucopia.org/2017/10/glyphosate-used-kill-prepare-crops-harvest"
      },
      {
        "name": "FoodPrint: Glyphosate Residue in Food",
        "url": "https://foodprint.org/blog/glyphosate-residue-in-food/"
      },
      {
        "name": "Environmental Working Group: Glyphosate in oat-based products",
        "url": "https://www.ewg.org/news-insights/news/2023/04/going-going-gone-ewg-finds-glyphosate-levels-drop-oat-based-products"
      }
    ],
    "question": "What kind of oats should you buy?",
    "detail": "The more an oat is cut, rolled, and pre-cooked, the faster it cooks and the faster it digests, which nudges blood-sugar response up a little. Plain rolled oats are still a clean whole food. The real problem is flavored instant packets, which are mostly added sugar. Plain oats in bulk are one of the cheapest breakfasts there is. Steel-cut are the least processed (chewy, slow to cook, gentlest on blood sugar); rolled/old-fashioned are steamed and flattened (quick, versatile); instant are pre-cooked and often come pre-sweetened. The measured number is the glycemic index: 42 for steel-cut, 55 for rolled and 83 for instant, in one extension comparison.",
    "labels_decoded": [
      {
        "term": "Instant / flavored",
        "meaning": "Pre-cooked and usually pre-sweetened. Read the added sugar."
      }
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
      "Whole beans with unbroken skins cook evenly. Split ones turn to mush.",
      "Choose certified organic beans over conventional, dried or canned. Conventional beans and other pulses may receive glyphosate before harvest for weed control. Organic farming does not allow glyphosate. Drift can still leave residues on organic beans."
    ],
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
      }
    ],
    "labels_decoded": [
      {
        "term": "BPA-free",
        "meaning": "Can lining without BPA. A minor plus if it matters to you."
      }
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
      "Choose certified organic first, with Non-GMO Project Verified a close second. Next is an unlabeled package; read any bioengineered disclosure.",
      "Ignore ‘non-GMO’ on foods that have no GMO version anyway.",
      "Look near the ingredients for “bioengineered” or “Contains Bioengineered Food Ingredients”, rather than “GMO”. A phone number or QR code may lead to the disclosure, which does not name the ingredient."
    ],
    "watch_out": [
      "Most U.S. soybeans, corn, sugar beets, cotton and canola are bioengineered. On oils, sugars and syrups, “derived from bioengineering” is voluntary because processing leaves no modified DNA.",
      "Restaurants, very small companies and most alcohol are exempt, as are foods whose major ingredient is meat, poultry or eggs.",
      "Non-GMO says nothing about pesticides, feed or practices, and the government does not approve non-GMO claims. The Non-GMO Project says its Verified mark follows its own standard, including testing, traceability and segregation."
    ],
    "sources": [
      "USDA National Organic Program",
      "Non-GMO Project standards",
      {
        "name": "CSPI: New GMO disclosures",
        "url": "https://www.cspi.org/article/what-know-about-new-gmo-disclosures"
      },
      {
        "name": "Non-GMO Project: GMO FAQ",
        "url": "https://www.nongmoproject.org/gmo-faq/"
      }
    ]
  },
  "label_cage_free": {
    "decision": "Pasture-raised eggs with printed soy-free or corn-free feed.",
    "buying_tips": [
      "Cage-free, free-range and pasture-raised describe space; feed is a separate claim.",
      "Cage-free hens usually live indoors, and free-range sets no size or hours for the door.",
      "Cage-free means uncaged, usually indoors. It does not mean outdoor access.",
      "Free-range = some outdoor access, with the amount and quality undefined.",
      "For real outdoor time: ‘pasture-raised’ plus a certifier seal.",
      "For eggs both are defined terms; on other products they carry much less.",
      "Look for soy-free or corn-free feed printed outright alongside pasture-raised and a certifier’s seal.",
      "Next choose pasture-raised organic, then organic, then cage-free. Organic feed can still contain soy and corn."
    ],
    "short_answer": "None of cage-free, free-range or pasture-raised says what the hen ate. Find soy-free or corn-free feed printed outright. Next choose pasture-raised organic, then organic, then cage-free.",
    "sources": [
      "USDA egg-labeling definitions",
      "USDA FSIS ‘free-range’ guidance",
      "Certified Humane / AWA space standards",
      {
        "name": "The Cornucopia Institute: Organic Egg Scorecard Criteria",
        "url": "https://www.cornucopia.org/egg-scorecard-criteria/"
      },
      {
        "name": "Consumer Reports: Egg Carton Labels Explained",
        "url": "https://www.consumerreports.org/health/food-labeling/egg-carton-labels-explained-a1022347027/"
      }
    ],
    "pick_steps": [
      "Find soy-free or corn-free feed printed outright on the carton.",
      "Pick “pasture-raised” eggs with a certifier seal for real outdoor time.",
      "Next: pasture-raised organic, then organic, then cage-free."
    ],
    "tier_note": "Pasture-raised means time outdoors on pasture, audited only with a certifier’s seal."
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
    "decision": "Pasture-raised eggs with soy-free or corn-free feed printed outright.",
    "buying_tips": [
      "Most pasture-raised hens still eat soy and corn; pasture describes space, not feed.",
      "Space claims and feed claims are separate. Read the carton for both; one never implies the other.",
      "Look for pasture-raised plus “soy-free” or “corn-free” feed printed explicitly.",
      "Organic requires organic feed, usually organic soy and corn. It answers how it was grown, not what it is.",
      "For beef, the equivalent word is grass-FINISHED. “Grass-fed” alone can still end on grain.",
      "Next choose pasture-raised organic, then organic, then cage-free.",
      "“Vegetarian fed” means no animal byproducts in the feed. It says nothing about pasture or time outdoors.",
      "Hens on pasture eat insects and forage. Read the feed claim separately from the outdoor claim."
    ],
    "short_answer": "Most pasture-raised hens still eat soy and corn. “Vegetarian fed” means no animal byproducts in the feed. It says nothing about pasture or time outdoors. Hens on pasture eat insects and forage.",
    "detail": "USDA has no regulatory definition of “pasture-raised” at all; where it means something, it is because a third-party certifier defined it. Certified Humane, for instance, requires 108 square feet of outdoor space per hen. Those standards govern housing and outdoor access. They do not specify a ration. “Certified organic” reaches feed, and it requires the feed be organic, which in practice is usually organic soy and organic corn. Organic answers how the feed was grown; it does not answer what the feed is. This is the single widest gap between what a carton implies and what it guarantees, and it is why two cartons with identical front-of-pack language can come from birds raised on completely different diets. These labels tell you how much room the animal had and whether it got outside. Look for pasture-raised with “soy-free” or “corn-free” feed printed outright. Next choose pasture-raised organic, then organic, then cage-free. “Vegetarian fed” means no animal byproducts in the supplied feed. It says nothing about pasture or time outdoors and does not tell whether a hen foraged. Hens on pasture eat insects and forage.",
    "sources": [
      "USDA FSIS labeling policy — no regulatory definition of “pasture-raised”",
      "Certified Humane pasture-raised standards (outdoor space requirements)",
      "USDA National Organic Program, 7 CFR 205.237 (livestock feed requirements)",
      {
        "name": "The Cornucopia Institute: Organic Egg Scorecard Criteria",
        "url": "https://www.cornucopia.org/egg-scorecard-criteria/"
      },
      {
        "name": "100 Days of Real Food: Egg Labels: What To Look For",
        "url": "https://www.100daysofrealfood.com/egg-labels-whats-to-look-for/"
      },
      {
        "name": "Consumer Reports: Egg Carton Labels Explained",
        "url": "https://www.consumerreports.org/health/food-labeling/egg-carton-labels-explained-a1022347027/"
      }
    ],
    "kristy_take": "Pasture-raised with a printed soy-free or corn-free feed claim. Next, pasture-raised organic, then organic, then cage-free. “Vegetarian fed” describes the supplied feed. It does not say whether the hen went outdoors.",
    "watch_out": [
      "Cage-free, free-range and pasture-raised are all SPACE claims. None says a word about feed.",
      "Organic reaches feed, but requires it be organic. That usually means organic soy and corn.",
      "“Grass-fed” on beef is the same trap: it can still end on grain.",
      "“Vegetarian fed” says nothing about pasture or time outdoors."
    ],
    "pick_steps": [
      "Find pasture-raised eggs with “soy-free” or “corn-free” feed printed on the carton.",
      "Next choose pasture-raised organic, then organic, then cage-free.",
      "On beef, look for grass-finished; “grass-fed” alone can still end on grain."
    ],
    "science": "Cage-free, free-range and pasture-raised describe space. Most pasture-raised hens still eat soy and corn. USDA has no regulatory definition of pasture-raised; certifiers set outdoor requirements. Organic requires organic feed, usually soy and corn. It describes how feed was grown. “Vegetarian fed” means no animal byproducts in the feed, with no promise about outdoor time. Hens on pasture eat insects and forage."
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
    "decision": "100% grass-fed soup bones and a whole chuck, freshly ground.",
    "buying_tips": [
      "A butcher can tell you how it was raised and when it was cut; a package cannot.",
      "Ask which farm the bones came from and what the cattle were fed.",
      "Ask what came in today.",
      "Ask for a whole chuck ground fresh, which lets you choose the cut.",
      "Ask the sourcing question outright: how it was raised and where from.",
      "Ask for bones and trim. Often cheap or free.",
      "Ask them to portion it. Cutting, tying and boning are usually included."
    ]
  },
  "chicken_cuts_basics": {
    "decision": "Air-chilled pasture-raised whole chicken, then bone-in, skin-on thighs.",
    "buying_tips": [
      "Water-chilled birds hold water from the chilling tank; skin that starts dry crisps.",
      "Look for air-chilled printed on the whole bird or the thigh pack.",
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
    "decision": "Organic or pasture-raised pork with no added solution.",
    "buying_tips": [
      "Much retail pork is pumped with water, salt and phosphates, then sold by weight.",
      "Read for ‘contains X% added solution’. That is injected water and salt.",
      "The solution’s ingredients follow, heaviest first.",
      "Hormones are banned in pork production, so ‘no added hormones’ on pork is a freebie.",
      "Organic uses organic feed. The ingredient list still needs checking for added solution."
    ],
    "question": "Which pork cut should you buy, and what does ‘solution added’ mean?",
    "short_answer": "A raw meat product with added solution must say so in its name, with the percentage. One example is ‘contains 15% added solution of water and salt’. The solution’s ingredients are listed in descending order by weight.",
    "detail": "A large share of retail pork is pumped with a solution of water, salt and phosphates to hold moisture. The law requires the share as a number with a percent sign, like ‘contains 15% added solution’. It is the solution weighed against the raw meat, so 15% means 15 parts to 100. The ingredients in the solution are listed in descending order by weight. The rule is written for raw meat products, not pork alone.",
    "sources": [
      "USDA FSIS labeling requirements for enhanced and solution-added meat",
      "USDA Institutional Meat Purchase Specifications (pork cut nomenclature)",
      "9 CFR § 317.2 labeling of raw meat and poultry containing added solutions (Cornell LII) https://www.law.cornell.edu/cfr/text/9/317.2",
      "Consumer Reports: Decoding the labels on meat packages https://www.consumerreports.org/food/decoding-the-labels-on-meat-packages/",
      "Reverence Farms: Organic feed and non-GMO feed https://reverencefarms.com/blogs/news/why-is-it-so-important-to-feed-organic-feed-isn-t-non-gmo-almost-as-good",
      "The Virtual Weber Bullet: Enhanced meat https://www.virtualweberbullet.com/enhanced-meat/",
      "CSPI: Food additive safety ratings https://www.cspi.org/page/chemical-cuisine-food-additive-safety-ratings"
    ],
    "kristy_take": "An ‘up to 12% solution’ line means some of that pack is added water. Raw meat with added solution must give its name, percentage and contents beside the product name.",
    "watch_out": [
      "The word ‘enhanced’ cannot be used in the product name. The law requires a number with a percent sign, like ‘contains 15% added solution’. That figure is what to find.",
      "The percentage is the solution weighed against the raw meat without it. So 15% means 15 parts solution to 100 parts meat."
    ],
    "science": "A large share of retail pork is pumped with water, salt and phosphates to hold moisture. The law requires the share as a number with a percent sign. It is the solution weighed against the raw meat, so 15% means 15 parts to 100. Hormones are banned in pork production, so ‘no added hormones’ is a freebie. ‘Natural’ on meat says nothing about raising.",
    "instead": "An organic or pasture-raised shoulder or roast with pork alone in the ingredient list.",
    "tier_note": "Organic pork cuts: certified organic feed and outdoor access; pasture: time outdoors on pasture, audited only with a certifier’s seal.",
    "cart_pick": "Organic or pasture-raised pork shoulder"
  },
  "deli_meat_uncured": {
    "decision": "Organic or pasture-raised whole roasted meat, sliced thin.",
    "buying_tips": [
      "Next, counter-sliced meat with a short ingredient list, every curing agent named.",
      "Find the asterisk on “no nitrates added”; it can point to celery powder or juice.",
      "Celery powder or juice supplies nitrite during curing. It is still a curing agent.",
      "Ask for the counter’s ingredient list; slicing there does not change what went into the meat.",
      "Whole roasted meat sliced thin does the same sandwich job with nothing added."
    ],
    "why": "Whole roasted meat leaves the curing step out. The ingredient list names added curing agents and binders.",
    "short_answer": "‘Uncured’ meat is cured, using celery powder instead of added nitrite. Read the qualifier and the full ingredient list.",
    "detail": "“Uncured” and “no nitrates or nitrites added” can appear on meat cured with celery powder or juice. Celery supplies nitrate that is converted to nitrite during curing. The qualifier names this plant source. Sodium nitrite names a directly added curing agent; celery changes the source, not the curing chemistry. Organic describes the feed standard and pasture-raised describes outdoor access. Neither claim tells you which curing agents or binders were used.",
    "sources": [
      "USDA FSIS labeling policy on ‘uncured’ and ‘no nitrate or nitrite added’ claims",
      "Peer-reviewed comparisons of residual nitrite in conventionally and naturally cured meats",
      "Niche Meat Processor Assistance Network “Uncured Bacon” https://www.nichemeatprocessing.org/uncured-bacon/",
      "9 CFR § 317.17 curing-agent declaration and “uncured” labeling (Cornell LII) https://www.law.cornell.edu/cfr/text/9/317.17"
    ],
    "kristy_take": "Whole roasted meat leaves out added curing agents. At the deli counter, ask for the full ingredient list, including added binders.",
    "labels_decoded": [
      {
        "term": "Uncured",
        "meaning": "May use celery powder or juice to supply nitrite during curing; read the qualifier."
      },
      {
        "term": "No nitrates or nitrites added*",
        "meaning": "The asterisk reads ‘except those naturally occurring in celery powder’."
      }
    ],
    "tier_note": "Organic deli meat: certified organic feed and outdoor access; pasture: time outdoors on pasture, audited only with a certifier’s seal.",
    "watch_out": [
      "In deli meat, “uncured” or “no nitrates added” can still mean celery powder or juice supplies nitrite. Read the qualifier beside the claim.",
      "Every curing substance has to be named in the ingredients statement, so read the list, not only the asterisk.",
      "Skip sodium phosphate and other phosphates used to hold water. Leave out binders such as carrageenan, modified food starch or maltodextrin that thicken the meat."
    ],
    "pick_steps": [
      "Read the “no nitrates added” qualifier for celery powder or juice.",
      "Read the ingredients list; every curing substance has to be named there.",
      "Pick whole roasted meat first, then counter-sliced meat before the prepacked tub."
    ],
    "science": "‘Uncured’ meat is cured, using celery powder instead of added nitrite. Celery powder is a concentrated natural nitrate source, so it is a curing agent, not the absence of one. Celery nitrate becomes nitrite during meat preservation. Read the qualifier for celery powder or juice and the ingredient list for phosphates and binders."
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
      "The list should read fish, oil or water, salt. Anything longer is a sauce.",
      "Pick a can that says BPA-free; many food cans have an epoxy lining made with BPA. Fresh or frozen fish has no can lining.",
      "Skipjack, labeled ‘light’, is lower-mercury than albacore, labeled ‘white’.",
      "‘Vegetable oil’ on a tin is nearly always a seed oil blend it will not name.",
      "Bone-in and skin-on sardines and salmon. The bones soften completely."
    ],
    "watch_out": [
      "‘Dolphin-safe’ speaks to dolphins only, and Seafood Watch says it does not mean the tuna is sustainable. The terms that do are FAD-free, free school or school-caught. They mean purse seines used without a floating device, which draws in juvenile fish, sharks and other bycatch.",
      "‘Ahi’ is usually yellowfin but may be bigeye.",
      "BPA-free is a claim from the maker. EWG found makers define it as they wish. Its survey found that makers dropping BPA did not disclose their replacement lining."
    ],
    "sources": [
      "USDA FoodData Central (canned fish composition)",
      "Product ingredient labeling",
      "Seafood Watch, Monterey Bay Aquarium “Tips for choosing sustainable canned tuna” https://www.seafoodwatch.org/stories/tips-for-choosing-sustainable-canned-tuna (FAD-free / school-caught terms, the scope of ‘dolphin-safe’, the species behind ‘light’, ‘white’ and ‘ahi’)",
      {
        "name": "EWG: BPA in Canned Food",
        "url": "https://www.ewg.org/research/bpa-canned-food"
      }
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
      "Berries are eaten whole, so the USDA Organic seal on the clamshell is the standard.",
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
    "decision": "Grass-fed heavy cream or half-and-half: cream and milk only.",
    "buying_tips": [
      "Cream carries a legal milkfat minimum; creamer is oil and sweetener imitating it.",
      "Look for a carton naming grass-fed cows, with cream and milk only.",
      "Heavy cream is 36% milkfat or more. Half-and-half is 10.5 to 18%. Those numbers are fixed by law.",
      "‘Non-dairy creamer’ is oil, sweetener and emulsifiers. It is not cream.",
      "Even real cream can carry carrageenan or gellan gum. A short list is still worth checking.",
      "Flavored creamers are where the added sugar sits. Read the panel.",
      "Whole milk or half-and-half does the same job with a two-word ingredient list.",
      "rBST is a synthetic hormone given to cows for milk production. The certified organic rules bar this growth hormone.",
      "Start with certified organic cream or half-and-half. Follow with a carton stating the cows were not treated with rBST, then one with neither. US companies need not label rBST use.",
      "Even certified organic cream can list carrageenan, a thickener derived from seaweed. Read the ingredients and take cream with none listed."
    ],
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
      }
    ]
  },
  "flour_basics": {
    "decision": "Whole wheat flour; on white flour, unbleached and unbromated.",
    "buying_tips": [
      "Whole wheat flour keeps the bran and germ that refining takes off white flour.",
      "‘Enriched’ means vitamins and iron added back after refining. Standard on white flour.",
      "‘Unbleached’ was aged with air. ‘Bleached’ was chemically whitened.",
      "Read for “bromated”, and pick flour without potassium bromate.",
      "Whole wheat carries the oil in the germ. Buy small and keep it in the freezer.",
      "Choose certified organic wheat flour over conventional. Conventional wheat may be sprayed with glyphosate shortly before harvest to dry the crop. Organic farming does not allow glyphosate. Drift can still leave residues on organic wheat."
    ],
    "sources": [
      "FDA standards of identity for enriched flour, 21 CFR 137",
      "FDA regulations on flour bleaching and maturing agents",
      "USDA FoodData Central",
      "NC State Extension, More Food project “All About Flour” https://morefoodproject.org/blog/all-about-flour (heat, air, and moisture are the enemies of whole wheat flour; sealing air out of the container keeps other flavors and odors from absorbing into it; stored in a pantry at room temperature, discard after one month)",
      "https://www.law.cornell.edu/cfr/text/21/137.105",
      "https://www.law.cornell.edu/cfr/text/21/137.155",
      "https://www.law.cornell.edu/cfr/text/21/137.200",
      {
        "name": "Cornucopia Institute: Glyphosate Used to Kill and Prepare Crops for Harvest",
        "url": "https://www.cornucopia.org/2017/10/glyphosate-used-kill-prepare-crops-harvest"
      },
      {
        "name": "FoodPrint: Glyphosate Residue in Food",
        "url": "https://foodprint.org/blog/glyphosate-residue-in-food/"
      }
    ],
    "question": "Which flour should you buy, and what does ‘enriched’ mean?"
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
      "Same reading for almond, cashew and sunflower butters.",
      "Read the jar’s ingredients for added oils; choose nuts and salt, with no added fat.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Skip avocado oil added to a nut butter as well."
    ],
    "sources": [
      "FDA standards of identity for peanut butter, 21 CFR 164.150",
      "Product ingredient labeling",
      "USDA FoodData Central",
      "MaraNatha “Nut Butter FAQs” https://www.maranathafoods.com/health-facts/nut-butter-faqs/ (a maker’s own label-reading page: oil separation occurs naturally when no ingredient is added to keep the oil from separating, so those jars need stirring; a small amount of palm oil is what keeps a no-stir jar together; without stabilizers a jar left warm for an extended period can become rancid, so refrigerate)",
      {
        "name": "Dr. Cate Shanahan: The Hateful Eight seed oils",
        "url": "https://drcate.com/hateful-eight/"
      }
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
    "decision": "Cold-pressed or expeller-pressed olive or coconut oil.",
    "buying_tips": [
      "Most supermarket oil is solvent-extracted, then refined, bleached and deodorized.",
      "Read the oil name and ingredients first: choose olive or coconut oil. A cold-pressed seed oil stays a seed oil.",
      "‘Expeller-pressed’ means mechanical, no solvent. Friction heat still happens.",
      "‘Cold-pressed’ means pressed with the temperature held down. Tightly defined only for olive oil.",
      "‘Refined’, ‘pure’, or no process word at all usually means solvent-extracted and refined.",
      "Unrefined oils taste like their source. Refined ones taste like nothing, which is the point of refining them.",
      "Dark bottle, cool shelf, and a size you will finish. Pressed oils are the least stable.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Skip avocado oil regardless of the pressing words; its label cannot prove purity."
    ],
    "sources": [
      "International Olive Council definitions of cold extraction",
      "FDA labeling regulations (no federal definition of ‘cold-pressed’ for most oils)",
      "Food-science references on solvent extraction and oil refining",
      {
        "name": "Dr. Cate Shanahan: The Hateful Eight seed oils",
        "url": "https://drcate.com/hateful-eight/"
      }
    ],
    "pick_steps": [
      "Pick olive or coconut oil first; then match cold-pressed or expeller-pressed.",
      "Expeller-pressed or cold-pressed means mechanical; “refined,” “pure” or no word usually means solvent-extracted.",
      "Pressed oils are least stable: dark bottle, cool shelf, a size you will finish."
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
      "For salmon, choose wild-caught first. For farm-raised salmon, read the country of origin.",
      "‘Color added’ on farm-raised salmon means astaxanthin in the feed sets the pink, not a dye after harvest. Wild salmon get their color from krill and shrimp.",
      "Origin can mean where it was processed, not where it was caught; a staffed counter can usually say.",
      "Cooked and breaded seafood falls outside the labeling rule."
    ],
    "watch_out": [
      "Country of origin is a real signal within farmed seafood. It does not tell you wild from farmed, which is its own required line."
    ],
    "sources": [
      "USDA AMS Country of Origin Labeling (COOL) requirements for fish and shellfish",
      "FDA Seafood List (acceptable market names)",
      "Peer-reviewed and government studies of seafood species substitution",
      {
        "name": "Quartz: Here is why your farmed salmon has color added to it",
        "url": "https://qz.com/358811/heres-why-your-farmed-salmon-has-color-added-to-it"
      }
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
    "decision": "Organic sprouts from the cold case, white roots, crisp stems.",
    "buying_tips": [
      "Warm, damp growing conditions also multiply any bacteria already on the seed.",
      "Sprouts are eaten raw and whole, so the USDA Organic seal is the standard here.",
      "The refrigerated case only. Room-temperature sprouts have been left in growing conditions.",
      "Roots still white and threadlike, stems crisp rather than limp.",
      "No condensation fogging the clamshell and no sour smell through the vents.",
      "A pack date you can read. Days old, not a week.",
      "Or a jar, a mesh lid and a scoop of seed. Three days on the counter."
    ]
  },
  "produce_root_vegetables": {
    "decision": "Organic potatoes and carrots, firm, with nothing soft or sprouting.",
    "buying_tips": [
      "Potatoes rank high for residue in USDA testing, and the skin often gets eaten.",
      "The USDA Organic seal on the bag is the standard for potatoes and carrots.",
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
    "decision": "Organic broccoli, cauliflower and cabbage, tight heads, no soft spots.",
    "buying_tips": [
      "Florets and leaves are eaten whole, with no peel to take surface residue away.",
      "The USDA Organic seal is the standard for broccoli, cauliflower and cabbage.",
      "Broccoli: dark green florets, closed tight, on stems that are not thick and tough.",
      "Cauliflower: a head with no bruises or damage.",
      "Cabbage: outer leaves fresh, not wilted or insect-damaged. Remove any that are.",
      "Broccoli keeps in the refrigerator in a plastic bag with holes. Use it within three days.",
      "Cabbage keeps several weeks in a plastic bag or wrap in the refrigerator, at 41°F or below.",
      "Cut out the cabbage core and rinse the leaves under cool running water before using."
    ]
  },
  "produce_onions_garlic": {
    "decision": "Organic onions and garlic, firm, with a dry neck.",
    "buying_tips": [
      "A dry neck and papery skins mark a well-cured bulb; soft or scented ones are fading.",
      "Organic onions and garlic are grown and certified to the USDA Organic standard.",
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
      "Leaves are eaten whole, so the USDA Organic seal is the standard for greens.",
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
      "The skin gets eaten, so the USDA Organic seal is the standard for peppers.",
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
      "Apples and pears are eaten skin-on, so the USDA Organic seal is the standard.",
      "Apples: firm and crisp, free of bruising, decay, cracks, and insect injury.",
      "Pears: free of bruising, insect damage, and decay; a firm green Bartlett ripens off the tree.",
      "Store in the dark at 30 to 32°F, up to 40°F, in a ventilated box or a perforated bag.",
      "Do not wash before storing; the moisture hastens decay.",
      "McIntosh and Honeycrisp: store at 38°F, since they are prone to chilling injury.",
      "Refrigerated apples keep up to a month."
    ]
  },
  "produce_citrus": {
    "decision": "Organic oranges, lemons and limes, firm with a smooth rind.",
    "buying_tips": [
      "A partly green orange can be fully mature, so firmness and a smooth rind tell more.",
      "Organic citrus carries the USDA Organic seal, which covers the peel used for zest.",
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
      "Stone fruit is eaten skin-on, so the USDA Organic seal is the standard here.",
      "Peaches and nectarines: ground color gone from green to yellow, no bruises or damage.",
      "Plums: skin color turned for the variety, no bruises or damage.",
      "Cherries: full color across the surface, green fleshy stems, no cracks, pecks, or shriveling.",
      "Store just above freezing, 30.5 to 32°F; cherries at or below 41°F.",
      "Plums that still need to ripen: keep them out of the 36 to 46°F range.",
      "Skin staining on a peach or nectarine is cosmetic; a bruise is not."
    ]
  },
  "sandwich_bread": {
    "decision": "Whole wheat sandwich bread: flour, water, yeast, salt, little else.",
    "buying_tips": [
      "A loaf called just “wheat” may be refined; whole wheat keeps the bran and germ.",
      "Look for a short list: whole wheat flour, water, yeast and salt.",
      "Check for whole wheat flour in the ingredients.",
      "Without a stamp, use the flour names to check the loaf.",
      "Check which stamp is shown: 100%, 50%+, or Basic have different grain requirements.",
      "Choose certified organic whole wheat bread over conventional. Conventional wheat may be sprayed with glyphosate shortly before harvest to dry the crop. Organic farming does not allow glyphosate. Drift can still leave residues on organic wheat."
    ],
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/136.180",
      "https://www.law.cornell.edu/cfr/text/21/137.200",
      "https://wholegrainscouncil.org/whole-grains-101/whats-whole-grain-refined-grain/existing-standards-whole-grains",
      "https://wholegrainscouncil.org/whole-grain-stamp",
      {
        "name": "Cornucopia Institute: Glyphosate Used to Kill and Prepare Crops for Harvest",
        "url": "https://www.cornucopia.org/2017/10/glyphosate-used-kill-prepare-crops-harvest"
      },
      {
        "name": "FoodPrint: Glyphosate Residue in Food",
        "url": "https://foodprint.org/blog/glyphosate-residue-in-food/"
      }
    ]
  },
  "sourdough": {
    "decision": "Whole wheat sourdough: flour, water, salt and a starter.",
    "buying_tips": [
      "Some loaves called sourdough use commercial yeast and added acids for the sour taste.",
      "Look for whole wheat flour as the first ingredient, ahead of any white flour.",
      "Look for flour, water, salt, and a culture or starter.",
      "Ask about the starter when the label does not list it separately.",
      "Read for added vinegar or acetic acid; ask about fermentation rather than infer it from sour flavor."
    ]
  },
  "bagels": {
    "decision": "Whole wheat bagels, boiled before the oven, ingredients named.",
    "buying_tips": [
      "The boil sets the outside and gives a bagel its chew.",
      "Look for whole wheat flour on the bag, named before any other flour.",
      "Read the ingredient list on the bag, or ask the bakery for it.",
      "Ask the bakery about boiling before buying.",
      "Without a process label, ask the baker rather than infer boiling from the shape.",
      "Ask about the bath ingredients; baking soda changes alkalinity and browning."
    ]
  },
  "tortillas": {
    "decision": "Organic corn tortillas of masa, water and salt.",
    "buying_tips": [
      "Masa is corn cooked and soaked in limewater; some packaged corn tortillas add wheat.",
      "Choose certified organic corn tortillas first, with Non-GMO Project Verified a close second.",
      "Most U.S. corn is bioengineered. Corn becomes grain, syrup, oil and starch.",
      "For a flour tortilla, check the flour and the named fat rather than infer them from the color."
    ],
    "watch_out": [
      "Some packaged corn tortillas contain wheat. Corn on the front is not a complete ingredient statement.",
      "A QR code or phone number on the tortilla package may lead to the bioengineered disclosure."
    ],
    "sources": [
      "https://www.tastingtable.com/1066360/masa-harina-vs-corn-flour-whats-the-difference/",
      "https://www.healthline.com/nutrition/corn-vs-flour-tortilla",
      "https://www.ebi.ac.uk/europepmc/webservices/rest/PMC11811476/fullTextXML",
      {
        "name": "CSPI: New GMO disclosures",
        "url": "https://www.cspi.org/article/what-know-about-new-gmo-disclosures"
      },
      {
        "name": "Non-GMO Project: GMO FAQ",
        "url": "https://www.nongmoproject.org/gmo-faq/"
      }
    ]
  },
  "turkey_whole": {
    "decision": "Pasture-raised whole turkey, without an injected basting solution.",
    "buying_tips": [
      "A basted or self-basted bird carries added broth, stock, fat or water.",
      "Look for a pasture-raised whole turkey, sold unbasted.",
      "Read the solution ingredients beside the product name.",
      "A frozen whole turkey can be checked for the same added-solution statement.",
      "Read retained-water wording separately from the flavoring-solution statement."
    ]
  },
  "ground_turkey": {
    "decision": "Pasture-raised or organic ground turkey, fat content printed.",
    "buying_tips": [
      "The name ground turkey sets no one fat level, so two packs can differ.",
      "Look for pasture-raised or certified organic ground turkey, sold plain.",
      "Choose a formulation listing turkey without added seasonings or a flavoring solution.",
      "Without a percent-lean claim, use the Nutrition Facts fat line to compare packs.",
      "Compare the fat content of the actual packs rather than assume one level for all ground turkey."
    ]
  },
  "breakfast_cereal": {
    "decision": "Unfortified whole-grain cereal or granola, less added sugar, no dyes.",
    "buying_tips": [
      "Whole grain and added sugar are separate checks; a stamp covers only the grain.",
      "Look for a grain list with no added vitamins or minerals below it.",
      "Check the 100% stamp rather than assume every stamp means all grain is whole.",
      "Without a stamp, read the grain ingredients and the added-sugars line.",
      "Read the added-sugars line even when honey or syrup is the named sweetener.",
      "For oat cereal or granola, choose certified organic over conventional. Conventional oats may be sprayed with glyphosate shortly before harvest to dry the crop. Organic farming does not allow glyphosate. Drift can still leave residues on organic oats.",
      "Read the ingredient list for synthetic dyes: Red 40, Yellow 5, Yellow 6 or Blue 1. Take the list with no added color over one naming a dye. “Lake” means a dye that does not dissolve in water; it still counts.",
      "BHA, BHT and TBHQ are preservatives added to fats and fat-containing foods. Read the ingredient list for BHA, BHT or TBHQ. Take a list without them over one naming any.",
      "BHT and TBHQ are used in cereals. BHT can appear on the list as “butylated hydroxytoluene.” Certified organic rules prohibit BHT."
    ],
    "sources": [
      "https://wholegrainscouncil.org/whole-grain-stamp",
      "https://www.fda.gov/food/nutrition-facts-label/added-sugars-nutrition-facts-label",
      {
        "name": "Cornucopia Institute: Glyphosate Used to Kill and Prepare Crops for Harvest",
        "url": "https://www.cornucopia.org/2017/10/glyphosate-used-kill-prepare-crops-harvest"
      },
      {
        "name": "FoodPrint: Glyphosate Residue in Food",
        "url": "https://foodprint.org/blog/glyphosate-residue-in-food/"
      },
      {
        "name": "Environmental Working Group: Glyphosate in oat-based products",
        "url": "https://www.ewg.org/news-insights/news/2023/04/going-going-gone-ewg-finds-glyphosate-levels-drop-oat-based-products"
      },
      {
        "name": "CSPI: Artificial colorings (synthetic food dyes)",
        "url": "https://www.cspi.org/node/7436"
      },
      {
        "name": "CSPI: TBHQ preservative uses",
        "url": "https://www.cspi.org/node/7416"
      },
      {
        "name": "EWG: BHT in food and on ingredient lists",
        "url": "https://www.ewg.org/foodscores/8806-article-dirty-dozen-food-chemicals-bht/"
      }
    ]
  },
  "pasta_dry": {
    "decision": "Dry pasta of durum semolina and water.",
    "buying_tips": [
      "The standard also allows farina or other flour; the list shows which is in the box.",
      "Look for durum semolina and water in the list.",
      "Plain dry pasta can be checked by ingredients without a bronze-cut claim.",
      "Read enrichment separately from the flour name and any bronze-cut claim.",
      "Choose certified organic wheat pasta over conventional. Conventional wheat may be sprayed with glyphosate shortly before harvest to dry the crop. Organic farming does not allow glyphosate. Drift can still leave residues on organic wheat."
    ],
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/139.110",
      "https://www.law.cornell.edu/cfr/text/21/139.115",
      "https://wholegrainscouncil.org/whole-grains-101/whats-whole-grain-refined-grain/existing-standards-whole-grains",
      "https://scienceinsights.org/why-is-bronze-cut-pasta-better-than-regular-pasta/",
      {
        "name": "Cornucopia Institute: Glyphosate Used to Kill and Prepare Crops for Harvest",
        "url": "https://www.cornucopia.org/2017/10/glyphosate-used-kill-prepare-crops-harvest"
      },
      {
        "name": "FoodPrint: Glyphosate Residue in Food",
        "url": "https://foodprint.org/blog/glyphosate-residue-in-food/"
      }
    ]
  },
  "oat_milk": {
    "instead": "A short-list unsweetened almond milk is the next plant drink.",
    "decision": "Unsweetened, unfortified oat milk with nothing added, never seed oil.",
    "buying_tips": [
      "Oat drinks vary carton to carton in stabilizers, protein and added vitamins.",
      "Look for oats and water alone, with no vitamins, minerals or oil added.",
      "Some certified organic oat drinks still use carrageenan, a seaweed thickener; pick one without it.",
      "Read the ingredient list for stabilizers, and the carton for protein and added vitamins and minerals."
    ],
    "sources": [
      "https://www.ebi.ac.uk/europepmc/webservices/rest/PMC10877596/fullTextXML",
      {
        "name": "Cornucopia Institute: Carrageenan report and buyer’s guide",
        "url": "https://www.cornucopia.org/research/carrageenan/"
      },
      {
        "name": "CSPI: Carrageenan",
        "url": "https://www.cspi.org/node/7465"
      }
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
    "decision": "Organic or pasture-raised bacon with a short curing list.",
    "buying_tips": [
      "Look for pork, salt and named curing agents; read each added ingredient.",
      "Read any exception naming naturally occurring nitrates in celery powder.",
      "Compare the disclosed curing ingredients across available bacon packs.",
      "Read each ingredient in the curing mixture, including salt, sugar, and curing agents.",
      "For smoked bacon, choose wood-smoked with no added smoke flavoring or liquid smoke. Liquid smoke is condensed smoke added for flavor."
    ],
    "sources": [
      "https://www.npr.org/sections/thesalt/2019/08/29/755115208/duped-in-the-deli-aisle-no-nitrates-added-labels-are-often-misleading",
      "https://www.law.cornell.edu/cfr/text/9/317.17",
      "Consumer Reports: Decoding the labels on meat packages https://www.consumerreports.org/food/decoding-the-labels-on-meat-packages/",
      "Reverence Farms: Organic feed and non-GMO feed https://reverencefarms.com/blogs/news/why-is-it-so-important-to-feed-organic-feed-isn-t-non-gmo-almost-as-good",
      "Iowa State University Extension: Liquid smoke https://blogs.extension.iastate.edu/answerline/2019/04/18/liquid-smoke-that-controversial-condiment/"
    ],
    "watch_out": [
      "On bacon labeled “uncured” or “no nitrates added”, celery powder or juice may supply the nitrite for curing. Find the asterisk and read its exception.",
      "An uncured label does not by itself establish the absence of nitrates or nitrites.",
      "The source set does not establish a health advantage from choosing celery-based curing."
    ],
    "tier_note": "Organic bacon: certified organic feed and outdoor access; pasture: time outdoors on pasture, audited only with a certifier’s seal.",
    "cart_pick": "Organic or pasture-raised sliced bacon"
  },
  "hot_dogs": {
    "decision": "Organic beef hot dogs with no phosphates or binders.",
    "buying_tips": [
      "Named meat first, with no mechanically separated chicken or turkey.",
      "Look for a list with no sodium phosphate, carrageenan or modified food starch.",
      "Look for the named meat and read all other ingredients.",
      "Compare formulations across available packs rather than assume a species claim describes every ingredient.",
      "Check whether the list names mechanically separated chicken or turkey.",
      "Read smoky hot dogs for “smoke flavoring” or “liquid smoke”, both added condensed smoke. Choose wood-smoked versions without those ingredients.",
      "On beef packs, look for grass-fed and grass-finished with a certifier’s seal."
    ],
    "sources": [
      "https://www.law.cornell.edu/cfr/text/9/319.180",
      "https://www.law.cornell.edu/cfr/text/9/381.173",
      "https://www.npr.org/sections/thesalt/2019/08/29/755115208/duped-in-the-deli-aisle-no-nitrates-added-labels-are-often-misleading"
    ],
    "watch_out": [
      "“Uncured” and “no nitrates added” hot dogs may use celery juice or powder, a plant source of nitrite. The ingredients name that curing source.",
      "“Uncured” can still accompany celery-based curing. Read the qualifier.",
      "The standard permits nonmeat ingredients. A beef species claim is not an ingredient list.",
      "Pass on sodium phosphate and other water-holding phosphates. Skip carrageenan, modified food starch and maltodextrin binders added for texture."
    ],
    "tier_note": "Organic hot dogs mean certified organic feed and outdoor access; grass-fed names the cattle’s diet.",
    "cart_pick": "Organic packaged beef hot dogs"
  },
  "canned_tuna": {
    "decision": "Canned light tuna, or a can naming skipjack.",
    "buying_tips": [
      "FDA puts canned light tuna in Best Choices for mercury, and albacore in Good Choices.",
      "Pick a can that says BPA-free; many food cans use an epoxy lining made with BPA. Fresh or frozen tuna comes with no can lining.",
      "Read the packing medium separately from the light or white designation."
    ],
    "watch_out": [
      "Light is not one species. Do not assume every light can is skipjack.",
      "FDA’s frequency advice is specific to pregnancy, breastfeeding, and children. Use its age and life-stage guidance rather than one rule for everyone.",
      "The maker supplies the BPA-free claim. EWG’s survey says makers can define BPA-free as they wish. Those that dropped BPA did not disclose what lining replaced it."
    ],
    "sources": [
      "https://www.fda.gov/food/consumers/advice-about-eating-fish",
      "https://www.fda.gov/food/consumers/questions-answers-fdaepa-advice-about-eating-fish-those-who-might-become-or-are-pregnant-or",
      "https://www.law.cornell.edu/cfr/text/21/161.190",
      {
        "name": "EWG: BPA in Canned Food",
        "url": "https://www.ewg.org/research/bpa-canned-food"
      }
    ]
  },
  "chicken_breast": {
    "decision": "Pasture-raised or organic bone-in, skin-on breast; no solution added.",
    "buying_tips": [
      "Boneless skinless breast dries fast in the pan; bone and skin cook better.",
      "Look for pasture-raised or certified organic breast, sold plain.",
      "Read the full product name for the solution percentage and ingredients.",
      "Fresh or frozen breast can be checked for the same solution disclosure.",
      "Read retained-water wording separately from the added flavoring ingredients."
    ]
  },
  "produce_mushrooms": {
    "decision": "Organic mushrooms, dry and firm, with no dark spots.",
    "buying_tips": [
      "Moisture is what spoils mushrooms, so a dry, firm cap is the fresh one.",
      "Organic mushrooms carry the USDA Organic seal, loose or packed.",
      "Feel for a dry, firm cap and pass on any with dark spots.",
      "Pick closed caps for a mild flavor and open caps for a stronger one.",
      "Buy them loose to take only the amount needed."
    ]
  },
  "produce_bananas": {
    "decision": "Organic bananas, green, to finish ripening on the counter.",
    "buying_tips": [
      "Bananas get sweeter as the green fades, and ripening on the plant often splits them.",
      "Organic bananas are grown and certified to the USDA Organic standard.",
      "Take the greenest bunch for the week; it keeps ripening at home.",
      "Keep green bananas out of the fridge. Cold below 56°F can stop them ripening.",
      "Pass on fruit with skin splits or dark streaks."
    ]
  },
  "produce_green_beans": {
    "decision": "Smooth, crisp, slender organic beans, without bulging seeds.",
    "buying_tips": [
      "Bulging seeds mean an older bean, turning tough, stringy and starchy.",
      "The whole pod gets eaten, so the USDA Organic seal is the standard for beans.",
      "Pick smooth, slender pods with no seeds bulging through.",
      "Leave beans with brown or rust spots behind.",
      "Store them cold and cook them within five days."
    ]
  },
  "egg_duck_quail": {
    "decision": "Pasture-raised duck or quail eggs with organic feed.",
    "buying_tips": [
      "Look for printed soy-free or corn-free feed; otherwise choose organic feed.",
      "Quail eggs held at room temperature lose quality sharply, so cold matters.",
      "Open the carton and check that every shell is clean and uncracked.",
      "Buy from a refrigerated case and keep them cold at home.",
      "Plan a longer cooking time for duck eggs, which are larger than hen’s eggs.",
      "Cook duck and quail eggs until white and yolk are solid."
    ],
    "sources": [
      "https://www.fsai.ie/news-and-alerts/latest-news/advice-issued-on-the-safe-consumption-of-duck-eggs",
      "https://webarchive.library.unt.edu/eot2008/20090117011150mp_/http:/www.cfsan.fda.gov/~dms/fs-eggs.html",
      "https://scielo.br/j/asas/a/BzZDRQJ9ZpDR4bvH53Z5qjf/?lang=en",
      "https://www.americastestkitchen.com/how_tos/6577-duck-eggs-versus-chicken-eggs",
      {
        "name": "The Cornucopia Institute: Organic Egg Scorecard Criteria",
        "url": "https://www.cornucopia.org/egg-scorecard-criteria/"
      }
    ],
    "cart_pick": "Pasture-raised organic duck or quail eggs",
    "pick_steps": [
      "Pasture-raised means time outdoors on pasture, audited only with a certifier’s seal.",
      "Open the carton and check that every shell is clean and uncracked.",
      "Buy from a refrigerated case and keep them cold at home."
    ],
    "tier_note": "Organic means certified organic feed and outdoor access for the ducks or quail."
  },
  "ham": {
    "decision": "Organic or pasture-raised ham named just “Ham”.",
    "buying_tips": [
      "Next, “Ham With Natural Juices”; “Water Added” means more added solution.",
      "Read the product name for “Water Added” or a percent of added ingredients.",
      "Check whether the label says fully cooked or cook before eating.",
      "Find where water sits in the ingredients statement.",
      "On smoked ham, favor wood smoking over liquid smoke or smoke flavoring. Those ingredients add condensed smoke to the meat."
    ],
    "detail": "US labeling ties ham names to protein. “Ham” needs at least 20.5% protein in the lean portion. “Ham With Natural Juices” needs at least 18.5%. “Ham, Water Added” needs at least 17.0%, with 10% added solution. “Ham and Water Product” must state the percent of weight that is added ingredients. Fresh ham is the uncured leg of pork and is labeled “fresh” or “uncured”.",
    "sources": [
      "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/meat-catfish/hams-and-food-safety",
      "https://www.canr.msu.edu/news/ham_for_the_holidays_and_all_year_long",
      "Consumer Reports: Decoding the labels on meat packages https://www.consumerreports.org/food/decoding-the-labels-on-meat-packages/",
      "Reverence Farms: Organic feed and non-GMO feed https://reverencefarms.com/blogs/news/why-is-it-so-important-to-feed-organic-feed-isn-t-non-gmo-almost-as-good",
      "NPR: No nitrates added labels and celery-based curing https://www.npr.org/sections/thesalt/2019/08/29/755115208/duped-in-the-deli-aisle-no-nitrates-added-labels-are-often-misleading",
      "The Conversation: How deli meat is made https://theconversation.com/how-is-deli-meat-made-the-food-science-behind-the-turkey-ham-and-other-cold-cuts-in-your-lunch-283597",
      "CSPI: Food additive safety ratings https://www.cspi.org/page/chemical-cuisine-food-additive-safety-ratings",
      "CSPI: Carrageenan https://www.cspi.org/node/7465",
      "True Story Foods: Deli meat additives https://www.truestoryfoods.com/blog/deli-meat-additives/",
      "Iowa State University Extension: Liquid smoke https://blogs.extension.iastate.edu/answerline/2019/04/18/liquid-smoke-that-controversial-condiment/"
    ],
    "watch_out": [
      "Packaged ham marked “uncured” or “no nitrates added” can get nitrite from celery powder or juice. Fresh ham is the raw leg and needs cooking.",
      "“Ham and Water Product” states the share of its weight that is added ingredients.",
      "Fresh ham and country ham are not fully cooked and need cooking before eating.",
      "Choose ham without added phosphates, used to retain water. Pass on binders such as carrageenan, modified food starch and maltodextrin, which thicken or bind it."
    ],
    "science": "Ham is the cured leg of pork, and its product name tells how much water the curing added. Plain “Ham” comes before “Ham With Natural Juices”, then “Ham, Water Added”. Phosphates help hold water; binders such as carrageenan thicken it. Celery powder or juice can supply nitrite even on an “uncured” pack. Check whether the label says fully cooked or cook before eating.",
    "labels_decoded": [
      {
        "term": "Ham With Natural Juices",
        "meaning": "Cured ham with more added water than plain “Ham”, but less than “Ham, Water Added”."
      },
      {
        "term": "Ham, Water Added",
        "meaning": "Cured ham with more added solution than “Ham With Natural Juices”."
      },
      {
        "term": "Fresh ham",
        "meaning": "Uncured leg of pork, prepared without nitrate or nitrite."
      }
    ],
    "tier_note": "Organic ham: certified organic feed and outdoor access; pasture: time outdoors on pasture, audited only with a certifier’s seal.",
    "cart_pick": "Organic or pasture-raised sliced ham"
  },
  "turkey_bacon": {
    "decision": "Organic or pasture-raised turkey bacon with no added sugar.",
    "buying_tips": [
      "Read the named turkey cut and each curing ingredient after the meat.",
      "Look for a curing list that names no sugar after the turkey.",
      "Read the descriptive name beside “turkey bacon” for the meat used.",
      "Read each curing ingredient in the ingredients statement.",
      "On “Uncured” packs, read the qualifier and check for celery powder or juice in the curing list."
    ],
    "detail": "Under US labeling, “bacon” alone means cured pork belly. Bacon made from poultry needs a descriptive name that says which meat was used. Each substance in a curing mixture, such as salt, sugar, or sodium nitrite, must be listed. “Uncured” and “No Nitrate or Nitrite Added” may accompany celery-based curing; the qualifier names that plant source of nitrite.",
    "sources": [
      "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/meat-catfish/bacon-and-food-safety",
      "https://www.law.cornell.edu/cfr/text/9/317.17",
      "https://health.clevelandclinic.org/turkey-bacon-how-healthy-is-it-really",
      "Consumer Reports: Decoding the labels on meat packages https://www.consumerreports.org/food/decoding-the-labels-on-meat-packages/",
      "Reverence Farms: Organic feed and non-GMO feed https://reverencefarms.com/blogs/news/why-is-it-so-important-to-feed-organic-feed-isn-t-non-gmo-almost-as-good",
      "NPR: No nitrates added labels and celery-based curing https://www.npr.org/sections/thesalt/2019/08/29/755115208/duped-in-the-deli-aisle-no-nitrates-added-labels-are-often-misleading"
    ],
    "watch_out": [
      "With “uncured” turkey bacon, celery powder or juice can supply nitrite. A “no nitrates added” claim needs its qualifier read too.",
      "Turkey bacon is still a cured product, and its curing ingredients are on the label."
    ],
    "pick_steps": [
      "Read the descriptive name beside “turkey bacon” for the meat used.",
      "Read each curing ingredient in the ingredients statement.",
      "Read the “Uncured” qualifier for celery powder or juice supplying nitrite."
    ],
    "science": "Under US labeling, “bacon” alone means cured pork belly. Bacon made from poultry needs a descriptive name that says which meat was used. Turkey bacon is still a cured product. Each substance in a curing mixture, such as salt, sugar, or sodium nitrite, must be listed. “Uncured” may still mean celery powder or juice supplies the nitrite; read the qualifier.",
    "labels_decoded": [
      {
        "term": "Cured turkey thigh meat",
        "meaning": "The descriptive name that says which turkey meat the bacon is made from."
      },
      {
        "term": "Uncured",
        "meaning": "Celery powder or juice can supply nitrite in turkey bacon carrying this word. Read the exception beside the claim."
      }
    ],
    "tier_note": "Organic turkey bacon: certified organic feed and outdoor access; pasture: time outdoors on pasture, audited only with a certifier’s seal.",
    "cart_pick": "Organic or pasture-raised turkey bacon strips"
  },
  "cured_pork": {
    "decision": "Organic or pasture-raised pork, with cut and curing ingredients named.",
    "buying_tips": [
      "A short curing list names the salt, spices and any added curing agents.",
      "Read the product name for the cut, such as ham, belly, or jowl.",
      "Read each curing ingredient in the ingredients statement.",
      "Check whether the package says ready to eat or cook before eating.",
      "Guanciale is worth buying on the same terms: cut named, curing listed."
    ],
    "detail": "Prosciutto is an Italian-style dry-cured raw ham, not smoked. Its low water content lets it be eaten raw. Salami is a fermented, dried, and cured ground meat product. Pancetta is Italian belly bacon, usually cured in salt and spices and air-dried. Cured pork from the cheeks must carry its true product name, such as pork jowl. “Uncured” and “No Nitrate or Nitrite Added” may accompany celery-based curing; the qualifier names that plant source of nitrite.",
    "sources": [
      "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/meat-catfish/hams-and-food-safety",
      "https://extension.oregonstate.edu/catalog/pnw-784-making-cured-bacon-home",
      "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/meat-catfish/bacon-and-food-safety",
      "https://www.law.cornell.edu/cfr/text/9/317.17",
      "Consumer Reports: Decoding the labels on meat packages https://www.consumerreports.org/food/decoding-the-labels-on-meat-packages/",
      "Reverence Farms: Organic feed and non-GMO feed https://reverencefarms.com/blogs/news/why-is-it-so-important-to-feed-organic-feed-isn-t-non-gmo-almost-as-good",
      "NPR: No nitrates added labels and celery-based curing https://www.npr.org/sections/thesalt/2019/08/29/755115208/duped-in-the-deli-aisle-no-nitrates-added-labels-are-often-misleading"
    ],
    "watch_out": [
      "On salami or pancetta, “uncured” and “no nitrates added” can point to nitrite from celery juice or celery powder. Check the ingredient list for that plant source.",
      "An “Uncured” product that is not dried or heavily salted must say “Not Preserved, Keep Refrigerated”."
    ],
    "labels_decoded": [
      {
        "term": "Prosciutto",
        "meaning": "Italian-style dry-cured raw ham, not smoked."
      },
      {
        "term": "Pancetta",
        "meaning": "Italian belly bacon, usually cured in salt and spices, then air-dried."
      },
      {
        "term": "Uncured",
        "meaning": "Check for a plant-derived curing ingredient such as celery powder or juice, which supplies nitrite."
      }
    ],
    "tier_note": "Organic pork: certified organic feed and outdoor access; pasture: time outdoors on pasture, audited only with a certifier’s seal.",
    "cart_pick": "Organic or pasture-raised guanciale pork jowl"
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
    "decision": "100% grass-fed or pasture-raised organ meats, cooked within two days.",
    "buying_tips": [
      "Organ meats keep less time than steaks and roasts, just 1 to 2 days cold.",
      "Ask the counter which farm the liver or heart came from.",
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
    "decision": "Wild-caught white fish by its named species, firm, mild-smelling.",
    "buying_tips": [
      "A fillet is hard to identify by eye, so the species name does that work.",
      "Look for how it was caught and the species, on the sign or label.",
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
    "decision": "Wild-caught smoked salmon, nova or lox, kept cold.",
    "buying_tips": [
      "Shelf-stable smoked fish is heat-treated and sealed; nova and lox rely on the cold.",
      "Look for wild-caught on the pack, and no ‘color added’ line.",
      "Choose smoked wild salmon first. For farmed smoked salmon, read the country of origin.",
      "Wild salmon get their color from krill and shrimp. Farmed salmon flesh is gray until astaxanthin in the feed sets the pink, which ‘color added’ means.",
      "Pick it from a refrigerated case and put it in the fridge soon after buying.",
      "Choose canned or jarred smoked fish to keep on the shelf."
    ],
    "watch_out": [
      "Cold smoking and refrigeration do not kill Listeria.",
      "Pregnant, older or immune-weakened? Ask a doctor about refrigerated smoked fish."
    ],
    "sources": [
      "https://www.cdc.gov/listeria/causes/meat-fish.html",
      "https://www.fda.gov/food/buy-store-serve-safe-food/selecting-and-serving-fresh-and-frozen-seafood-safely",
      "https://extension.umaine.edu/publications/3110e/",
      {
        "name": "Quartz: Here is why your farmed salmon has color added to it",
        "url": "https://qz.com/358811/heres-why-your-farmed-salmon-has-color-added-to-it"
      }
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
    "decision": "Gluten-free bread with its flours named and the fewest gums.",
    "buying_tips": [
      "Every gluten-free wording meets one federal limit; a gum gives back some stretch.",
      "Look for a single gum binder, such as xanthan gum, not two or more.",
      "Check for one of the four gluten-free claim wordings.",
      "Read which flours and starches replace the wheat.",
      "Look for the gum that binds the loaf."
    ]
  },
  "buns_rolls": {
    "decision": "Whole wheat buns and rolls with no added sugar.",
    "buying_tips": [
      "Whole wheat buns use whole wheat flour with no white flour; enriched buns do not.",
      "Look for a list with no sugar or soybean oil after the whole wheat flour.",
      "Read the name on the bag for “whole wheat”.",
      "Check the first ingredient for whole wheat flour.",
      "Read “enriched buns” as made with enriched flour, not whole wheat."
    ]
  },
  "pastries_muffins": {
    "decision": "All-butter bakery pastries, no shortening or hydrogenated oil.",
    "buying_tips": [
      "Butter is Danish pastry’s traditional fat; factory-made often uses other fats.",
      "Look for butter as the only fat, with no shortening or hydrogenated oil.",
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
      "Check whether the bag says toasted.",
      "Choose certified organic muesli over conventional. Conventional oats may be sprayed with glyphosate shortly before harvest to dry the crop. Organic farming does not allow glyphosate. Drift can still leave residues on organic oats."
    ],
    "sources": [
      "https://www.healthline.com/nutrition/muesli-vs-granola",
      "https://en.wikipedia.org/wiki/Muesli",
      {
        "name": "Cornucopia Institute: Glyphosate Used to Kill and Prepare Crops for Harvest",
        "url": "https://www.cornucopia.org/2017/10/glyphosate-used-kill-prepare-crops-harvest"
      },
      {
        "name": "FoodPrint: Glyphosate Residue in Food",
        "url": "https://foodprint.org/blog/glyphosate-residue-in-food/"
      },
      {
        "name": "Environmental Working Group: Glyphosate in oat-based products",
        "url": "https://www.ewg.org/news-insights/news/2023/04/going-going-gone-ewg-finds-glyphosate-levels-drop-oat-based-products"
      }
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
    "decision": "Grass-fed sour cream: cream and cultures, nothing else added.",
    "buying_tips": [
      "Cultured means bacteria did the souring; acidified tubs use added acids.",
      "Look for a grass-fed tub listing only cream and cultures.",
      "Pick a tub named “sour cream” or “cultured sour cream”.",
      "Read the optional ingredients added for texture or shelf life.",
      "Check the name for a declared flavor.",
      "A synthetic growth hormone called rBST can be given to dairy cows. Certified organic sour cream excludes that treatment.",
      "On sour cream, prefer certified organic. Next, look for a printed statement that rBST was not used on the dairy cows. Without either claim, the tub ranks last. Use of rBST need not appear on US dairy labels.",
      "Carrageenan is made from seaweed and used to thicken foods, including some certified organic ones. Read your sour cream’s list and pick a tub without carrageenan."
    ],
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/131.160",
      "https://www.law.cornell.edu/cfr/text/21/131.162",
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
      }
    ]
  },
  "cream_cheese": {
    "decision": "Grass-fed cream cheese by its standard name, no stabilizers.",
    "buying_tips": [
      "The standard allows up to 0.5 percent stabilizers; the list shows who skipped them.",
      "Look for grass-fed cream cheese that lists no stabilizers.",
      "Look for “cream cheese” as the name on the package.",
      "Find a culture in the ingredient list.",
      "Swap in Neufchâtel in most recipes; the two taste similar.",
      "rBST is the synthetic growth hormone used to increase milk production in cows. Certified organic cream cheese rules prohibit it.",
      "Choose certified organic cream cheese first. Next is a pack stating the milk comes from cows untreated with rBST. Both outrank a pack with neither. US labels can omit whether the cows received rBST.",
      "Some certified organic foods contain carrageenan, a seaweed-derived thickener. Look through the cream cheese ingredients and take the version that lists no carrageenan."
    ],
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/133.133",
      "https://www.masterclass.com/articles/neufchatel-cheese-vs-cream-cheese-explained",
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
      }
    ]
  },
  "cottage_cheese": {
    "decision": "Grass-fed cottage cheese, curd set by a culture, no carrageenan.",
    "buying_tips": [
      "A culture sets the curd unless the tub prints “directly set” beside the name.",
      "Look for milk, cream, salt and cultures alone, with no carrageenan or gum.",
      "Read the milkfat statement beside the name.",
      "Look for “directly set” or “curd set by direct acidification”.",
      "Pick dry curd cottage cheese for the version under 0.5 percent milkfat.",
      "Milk for cottage cheese can come from cows treated with rBST. That synthetic growth hormone is barred in certified organic dairy.",
      "For cottage cheese, certified organic is the first rung. Then comes a tub whose printed claim says the milk comes from cows that received no rBST. A tub with neither is last; US law does not require rBST-use labeling.",
      "The seaweed-derived thickener carrageenan appears even in some certified organic foods. Check the cottage cheese ingredient list for it; choose a tub that lists none."
    ],
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/133.128",
      "https://www.law.cornell.edu/cfr/text/21/133.129",
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
      }
    ]
  },
  "ice_cream": {
    "decision": "Grass-fed ice cream of cream, milk and sugar, no gums.",
    "buying_tips": [
      "The name ice cream needs 10 percent milkfat and no oils beyond incidental amounts.",
      "Look for cream, milk and sugar first, with no carrageenan or guar gum.",
      "Read the name on the carton, not the picture.",
      "Look for “frozen dairy dessert” in the small print.",
      "Read the ingredients for oils such as coconut or palm oil.",
      "Ice cream starts with dairy from cows that may receive rBST, a synthetic growth hormone. Certified organic production prohibits it.",
      "Certified organic ice cream leads this label ladder. Next is a carton stating its milk came from cows that were not treated with rBST. A carton with neither claim ranks last: US rules let rBST use go unlabeled.",
      "Carrageenan thickens foods and comes from seaweed. Some certified organic foods use it too, so read the ice cream’s ingredient list and choose one without it."
    ],
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/135.110",
      "https://www.mentalfloss.com/food/ice-cream/ice-cream-vs-frozen-dairy-dessert-what-is-difference",
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
      }
    ]
  },
  "ghee": {
    "decision": "Grass-fed ghee or clarified butter, butter the only ingredient.",
    "buying_tips": [
      "Plain ghee is butter simmered down to its fat; flavored jars add spices.",
      "Look for butter as the single ingredient on the jar, with nothing added.",
      "Read the ingredient list for butter alone.",
      "Expect spices on the list if the jar is flavored.",
      "Choose ghee for its nutty taste and aroma."
    ]
  },
  "goat_sheep_dairy": {
    "decision": "Grass-fed goat or sheep milk, yogurt and cheese, nothing added.",
    "buying_tips": [
      "The animal on the list decides the food; goat butter, for one, comes out white.",
      "Look for goat or sheep milk, cultures and salt alone on a cheese or yogurt list.",
      "Read the ingredients for goat milk or sheep milk.",
      "Look for feta, pecorino romano, Roquefort or Manchego for sheep milk cheese.",
      "Expect goat butter to be white, not yellow."
    ]
  },
  "almond_milk": {
    "instead": "A short-list oat milk is the next plant drink.",
    "decision": "Unsweetened, unfortified almond milk, a short list, never seed oil.",
    "buying_tips": [
      "Almond drinks vary in added sugars, so the carton panel is the guide.",
      "Look for unsweetened on the carton and no added vitamins or minerals on the list.",
      "Pick unsweetened over sweetened, vanilla or chocolate.",
      "Some certified organic almond drinks still use carrageenan, a seaweed thickener; choose a carton with none listed.",
      "Compare protein, vitamin D, calcium and potassium across cartons.",
      "Check saturated fat on the panel."
    ],
    "sources": [
      "https://en.wikipedia.org/wiki/Almond_milk",
      "https://www.fda.gov/food/food-labeling-nutrition/plant-based-milk-alternatives-pbma",
      {
        "name": "Cornucopia Institute: Carrageenan report and buyer’s guide",
        "url": "https://www.cornucopia.org/research/carrageenan/"
      },
      {
        "name": "CSPI: Carrageenan",
        "url": "https://www.cspi.org/node/7465"
      }
    ]
  },
  "soy_milk": {
    "decision": "Unsweetened, unfortified soy milk: soybeans and water, little else.",
    "cart_pick": "Unsweetened, unfortified soy milk",
    "kristy_take": "A short list of soybeans and water stays closest to the bean.",
    "pick_steps": [
      "Pick the shortest list, soybeans and water with little else.",
      "Pick unsweetened over flavored."
    ],
    "buying_tips": [
      "Every addition is another ingredient; soybeans and water stays closest to the bean.",
      "Look for unsweetened soy milk with no vitamins or minerals in the ingredient list.",
      "Most U.S. soybeans are bioengineered, so choose certified organic first, with Non-GMO Project Verified a close second.",
      "Carrageenan, a seaweed thickener, appears in some certified organic foods too; choose a soy milk with none listed.",
      "A short-list unsweetened almond milk ranks above soy milk."
    ],
    "sources": [
      "https://en.wikipedia.org/wiki/Soy_milk",
      "https://www.fda.gov/food/food-labeling-nutrition/plant-based-milk-alternatives-pbma",
      {
        "name": "Cornucopia Institute: Carrageenan report and buyer’s guide",
        "url": "https://www.cornucopia.org/research/carrageenan/"
      },
      {
        "name": "CSPI: Carrageenan",
        "url": "https://www.cspi.org/node/7465"
      },
      {
        "name": "CSPI: New GMO disclosures",
        "url": "https://www.cspi.org/article/what-know-about-new-gmo-disclosures"
      },
      {
        "name": "Non-GMO Project: GMO FAQ",
        "url": "https://www.nongmoproject.org/gmo-faq/"
      }
    ],
    "watch_out": [
      "FDA counts only fortified soy in the dairy group, yet fortifying adds vitamins and minerals, each another ingredient.",
      "Soy lecithin and soy protein come from the same soybeans. A QR code or phone number may lead to the bioengineered disclosure.",
      "Dairy shoppers can read the Milk card.",
      "Fortified soy milk is the second pick, behind a carton of soybeans and water."
    ]
  },
  "coconut_milk_beverage": {
    "decision": "Unsweetened, unfortified carton coconut milk, fewest added gums.",
    "buying_tips": [
      "The carton is coconut milk thinned with water, and gums like gellan thicken it back.",
      "Look for coconut and water at the top, with no vitamins added below.",
      "Read “beverage” in the name: coconut milk thinned with water.",
      "Find it in the nondairy milk section, next to the soy milk.",
      "Check for sugar and flavors on a sweetened carton.",
      "Reach for the can, not the carton, for full-fat coconut milk.",
      "Carrageenan adds thickness and is derived from seaweed. It can occur in certified organic foods, so check the coconut beverage’s ingredients and take one with none listed."
    ],
    "sources": [
      "https://www.cookscountry.com/how_tos/6667-canned-coconut-milk-vs-carton-packed-coconut-milk-beverage",
      "https://www.tastingtable.com/1527981/canned-coconut-milk-carton-difference",
      {
        "name": "Cornucopia Institute: Carrageenan report and buyer’s guide",
        "url": "https://www.cornucopia.org/research/carrageenan/"
      },
      {
        "name": "CSPI: Carrageenan",
        "url": "https://www.cspi.org/node/7465"
      }
    ]
  },
  "plant_butter": {
    "decision": "Coconut or olive oil plant butter, never seed oil.",
    "buying_tips": [
      "Plant butters differ in their oils, and the ingredient list names each one.",
      "Look for oils, water and salt, with no lecithin or natural flavors listed.",
      "Choose coconut or olive oil in the ingredients, then check every other oil in the spread.",
      "Check whether a nut milk or culture is listed, as in some versions.",
      "Compare the fat line on the Nutrition Facts.",
      "Skip seed oils and avocado oil, even when coconut or olive oil comes first."
    ],
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/166.110",
      "https://www.wegmans.com/shop/product/980978",
      {
        "name": "Dr. Cate Shanahan: The Hateful Eight seed oils",
        "url": "https://drcate.com/hateful-eight/"
      }
    ]
  },
  "dairy_case": {
    "decision": "Choose the dairy type first, then read the carton.",
    "buying_tips": [
      "Each type has its own card; the carton adds vitamins, pasture and filtering.",
      "Choose the type first: milk, yogurt, cheese, butter, cream or a plant drink.",
      "Check the milk label for vitamins A and D.",
      "Read a filtered milk panel for its protein and sugar lines.",
      "Dairy cows can receive rBST, a synthetic growth hormone. Organic certification bars that treatment.",
      "Choose certified organic dairy before a package stating “from cows not treated with rBST”. A package with neither ranks last, since rBST use need not be disclosed in the US."
    ],
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/131.110",
      "https://www.dairyreporter.com/Article/2026/03/13/how-ultrafiltered-milk-is-made-benefits-protein-process/",
      "https://www.law.cornell.edu/cfr/text/7/205.240",
      "https://www.farmanddairy.com/?p=14321",
      {
        "name": "Cornell LII: 7 CFR § 205.238 Organic livestock hormone rules",
        "url": "https://www.law.cornell.edu/cfr/text/7/205.238"
      },
      {
        "name": "BCPP: rBGH / rBST labeling",
        "url": "https://www.bcpp.org/resource/rbgh-rbst/"
      }
    ]
  },
  "kombucha": {
    "decision": "Plain kombucha from the refrigerated case, kept cold.",
    "buying_tips": [
      "Bottled kombucha can keep fermenting, and its alcohol can climb.",
      "Look for tea and sugar first on the list, with no fruit juice added.",
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
    "decision": "Organic miso of soybeans, salt and koji, any grain named.",
    "buying_tips": [
      "White miso is mild and sweet, and red is the saltiest, so a little goes far.",
      "Look for organic soybeans, koji and salt on the list, with any grain named.",
      "Read the ingredients for soybeans, salt, koji and the grain: rice, barley or none.",
      "Pick white miso if buying only one.",
      "Pick red miso knowing it is the saltiest kind.",
      "Keep the tub in the fridge after opening."
    ]
  },
  "tempeh": {
    "decision": "Organic tempeh in a firm cake, bound white all through.",
    "buying_tips": [
      "A finished cake holds together as one piece; a loose, crumbly one is unfinished.",
      "Look for a tempeh list of organic soybeans alone or with one named grain.",
      "Press the pack and feel for a firm cake that holds as one piece.",
      "Read the ingredients for soybeans alone or added grains.",
      "Pass on any pack with noticeable mold or odd discoloration.",
      "Keep it cold, or freeze an unopened block."
    ]
  },
  "natto": {
    "decision": "Organic natto in sealed trays, chilled or frozen.",
    "buying_tips": [
      "Chilled natto keeps only days; frozen, it keeps for months.",
      "Look for USDA Organic on the pack, with whole soybeans listed first.",
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
    "decision": "Iodized salt with no anti-caking agent on the list.",
    "buying_tips": [
      "Salt without iodine says “does not supply iodide” beside its name.",
      "Look for iodide named on the list, with no anti-caking agent beside it.",
      "Read the list: iodized salt lists added iodine.",
      "Check the list for an anti-caking agent.",
      "Pickling or canning salt is pure salt with nothing added."
    ]
  },
  "sugars": {
    "decision": "Organic coconut or maple sugar first, each from one sap.",
    "buying_tips": [
      "Each stays closer to its plant than sugar crystallized from cane or beet juice.",
      "Look for certified organic coconut sugar or pure maple sugar.",
      "Read the list: coconut sugar or maple sugar alone, with nothing added.",
      "Look for pure maple sugar; a maple-flavored product is not maple sugar.",
      "Plain “sugar” names no crop, so choose certified organic first; organic must come from non-GMO plants. Non-GMO Project Verified is a close second.",
      "Pick light or dark brown sugar; dark carries more molasses."
    ],
    "watch_out": [
      "Coconut sugar is made mostly of sucrose, like other sugar.",
      "More than half of granulated sugar sold comes from bioengineered sugar beets.",
      "No modified DNA remains in sugar from bioengineered beets, so the “derived from bioengineering” line is voluntary."
    ],
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/184.1854",
      "https://extension.illinois.edu/blogs/simply-nutritious-quick-and-delicious/2020-02-03-what-makes-brown-sugar-brown",
      "https://extension.oregonstate.edu/food/preservation/sweeteners-nutritive-non-nutritive",
      "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/guidance-industry-declaration-added-sugars-honey-maple-syrup-other-single-ingredient-sugars-and",
      {
        "name": "CSPI: New GMO disclosures",
        "url": "https://www.cspi.org/article/what-know-about-new-gmo-disclosures"
      },
      {
        "name": "Non-GMO Project: GMO FAQ",
        "url": "https://www.nongmoproject.org/gmo-faq/"
      },
      "https://www.law.cornell.edu/regulations/vermont/20-002-Code-Vt-R-20-011-002-X"
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
    "decision": "Olive or coconut oil, or tallow for cooking.",
    "buying_tips": [
      "“Vegetable oil” on a label names a category, without any seed or fruit.",
      "Skip sunflower, safflower, canola, soybean, corn and cottonseed oils; the last four come from mostly bioengineered crops.",
      "Skip avocado oil too: the label cannot prove the oil is pure.",
      "Read the list for BHA, BHT, TBHQ or propyl gallate, preservatives added to oils, and choose a list without them.",
      "Read the label for the oil’s name first, then refined or unrefined."
    ],
    "short_answer": "The standard is tallow, olive oil, or coconut oil. Read every oil in the ingredient list. “Vegetable oil” names no single oil. Store oils are usually refined, bleached and deodorized; the bottle says refined or unrefined.",
    "sources": [
      "https://extension.psu.edu/processing-edible-oils",
      "https://extension.illinois.edu/blogs/live-well-eat-well/2014-09-22-attention-home-cooks-are-you-using-right-oil-right-job",
      "https://cris.msu.edu/news/cooking-oils/cooking-oils-overview/",
      {
        "name": "Dr. Cate Shanahan: The Hateful Eight seed oils",
        "url": "https://drcate.com/hateful-eight/"
      },
      {
        "name": "CSPI: TBHQ preservative uses",
        "url": "https://www.cspi.org/node/7416"
      },
      {
        "name": "EWG: Food chemicals guide, preservative uses",
        "url": "https://www.ewg.org/consumer-guides/ewgs-dirty-dozen-guide-food-chemicals-top-12-avoid"
      },
      {
        "name": "CSPI: New GMO disclosures",
        "url": "https://www.cspi.org/article/what-know-about-new-gmo-disclosures"
      },
      {
        "name": "Non-GMO Project: GMO FAQ",
        "url": "https://www.nongmoproject.org/gmo-faq/"
      }
    ],
    "cart_pick": "Olive or coconut cooking oil",
    "watch_out": [
      "Oil that starts smoking in the pan is no longer fit to use.",
      "The “derived from bioengineering” line on these oils is voluntary when processing leaves no modified DNA."
    ]
  },
  "lard_tallow": {
    "decision": "Pasture-raised leaf lard or grass-fed tallow, nothing added to harden.",
    "buying_tips": [
      "Lard may be hardened with lard stearin or hydrogenated lard, and the label says so.",
      "Look for pasture-raised on the lard tub, and one fat in the list.",
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
    "decision": "Unfortified nutritional yeast flakes, granules or powder.",
    "buying_tips": [
      "The two look alike in the bag; only the list shows whether vitamins were added.",
      "Look for inactive dried yeast and nothing more, with no vitamins listed.",
      "Read the ingredient list to tell fortified from unfortified.",
      "Pick flakes, granules or powder by how it will be used.",
      "Look in the spice aisle or the bulk bins."
    ]
  },
  "canned_coconut_milk": {
    "decision": "Canned coconut milk listing coconut alone, no gum added.",
    "buying_tips": [
      "Many cans add a gum such as guar gum to thicken the milk and hold it steady.",
      "Look for coconut alone on the list, with no guar gum or other gum.",
      "Pick a can that says BPA-free; many cans have an epoxy lining made with BPA. Where the same coconut milk is sold in glass, the jar has no can lining.",
      "Compare two cans by how much the list holds beyond coconut.",
      "Read the ingredients for guar gum or another gum."
    ],
    "watch_out": [
      "The carton coconut milk drink is a different product, covered on its own card.",
      "BPA-free rests on the maker’s word. EWG’s survey found that makers define it as they wish. Makers who dropped BPA did not name the lining used in its place."
    ],
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/184.1339",
      "https://www.americastestkitchen.com/articles/8108-coconut-cream-vs-coconut-milk",
      {
        "name": "EWG: BPA in Canned Food",
        "url": "https://www.ewg.org/research/bpa-canned-food"
      }
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
    "decision": "Pasta sauce of tomatoes and olive oil, no added sweetener.",
    "buying_tips": [
      "Ingredients run most first, so anything ahead of the tomatoes outweighs them.",
      "Look for tomatoes first, olive oil as the oil, and no added sweetener.",
      "Read the first ingredient; tomatoes should lead.",
      "Count what follows the tomatoes; a short list is the craft standard.",
      "On canned tomatoes, read the “with” words for added spices, seasonings or vegetables."
    ]
  },
  "jam": {
    "decision": "Jam or preserves of fruit, sugar and pectin, nothing else.",
    "buying_tips": [
      "Jam and preserves start from the fruit itself; jelly is strained juice.",
      "Look for fruit first, then sugar and pectin, and nothing more on the jar.",
      "Read the name for “Jam” or “Preserves” with the fruit named.",
      "Preserves hold small whole fruits or uniform pieces in a thick syrup.",
      "In a mixed-fruit jam, the fruits are listed most first.",
      "Refrigerate the jar once opened.",
      "At farmers markets, cottage-food jam labels name the maker and address."
    ]
  },
  "ketchup_mustard": {
    "decision": "Unsweetened ketchup from tomato; mustard of seed, vinegar, spice.",
    "buying_tips": [
      "Ketchup’s federal standard starts from tomato; sweeteners and spices are optional.",
      "Look for a ketchup list of tomato, vinegar and spices, with no sweetener.",
      "Read the ketchup label for tomato concentrate and vinegar.",
      "Read the mustard label for mustard seed, vinegar and spices.",
      "Stone ground mustard shows visible specks of seed.",
      "Dijon carries mild white wine notes; yellow mustard is mild.",
      "Use an open condiment before opening a new one."
    ]
  },
  "mayo": {
    "decision": "Mayonnaise with olive oil alone, egg yolk and an acid.",
    "buying_tips": [
      "A jar sold on avocado or olive oil can carry other oils; the list shows which leads.",
      "Look for olive oil as the only oil in the ingredient list.",
      "Check that the name on the jar is Mayonnaise.",
      "Choose olive oil mayonnaise with egg yolk and vinegar or citrus juice. Check every oil in the ingredient list.",
      "Compare jars by what they add beyond oil, egg yolk, acid and salt.",
      "Once opened, keep it in the fridge and use it within 1 to 2 months.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Skip avocado oil mayo too, even if it names no other oil."
    ],
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/169.140",
      "https://www.law.cornell.edu/cfr/text/21/169.150",
      "https://extension.illinois.edu/blogs/simply-nutritious-quick-and-delicious/2023-07-21-mayonnaise-versus-salad-dressing-popular",
      "https://blogs.extension.iastate.edu/wellness/2019/05/21/refrigerated-condiment-safety-tips/",
      {
        "name": "Dr. Cate Shanahan: The Hateful Eight seed oils",
        "url": "https://drcate.com/hateful-eight/"
      }
    ],
    "cart_pick": "Olive oil only mayonnaise"
  },
  "hot_soy_sauce": {
    "decision": "Organic soy sauce, traditionally brewed, not made fast with acid.",
    "buying_tips": [
      "Brewed soy sauce ferments for months; the fast method makes it with acid in hours.",
      "Look for the words naturally brewed, with organic soybeans named first.",
      "Read the ingredients for wheat, on tamari too.",
      "Read the front for a gluten-free claim.",
      "On hot sauce, read the ingredients for vinegar; some fermented sauces have none added."
    ]
  },
  "canned_soup": {
    "decision": "Low-sodium canned soup, short list, no added flavors, can undented.",
    "buying_tips": [
      "Low sodium is a fixed ceiling; reduced sodium only means less than a named soup.",
      "Look for a short list with no added flavors, starches or sugar.",
      "Pick a can that says BPA-free; many food cans are lined with an epoxy made with BPA. Fresh or frozen soup has no can lining.",
      "Leave cans with deep dents, seam dents, leaks, rust or bulging lids on the shelf."
    ],
    "watch_out": [
      "“No salt added” is not “sodium free”; the soup can still carry sodium.",
      "BPA-free is the maker’s word. EWG’s survey found makers define it as they wish. Makers that dropped BPA did not disclose the lining that replaced it.",
      "Store cans cool and dry, between 50 °F and 70 °F, with the oldest in front. Wipe the lid before opening, and move opened soup to a covered container in the refrigerator."
    ],
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/101.61",
      "https://extension.psu.edu/making-use-of-canned-foods",
      "https://hgic.clemson.edu/factsheet/safe-handling-of-canned-goods/",
      {
        "name": "EWG: BPA in Canned Food",
        "url": "https://www.ewg.org/research/bpa-canned-food"
      }
    ]
  },
  "olives": {
    "decision": "Brine-cured olives, fermented in water and salt, nothing else.",
    "buying_tips": [
      "Lye works quickly and leaves a neutral olive; brine keeps a salty, fermented flavor.",
      "Look for a jar of olives, water and salt, with no ferrous gluconate.",
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
    "decision": "Pure coconut water, high-pressure processed, with nothing added.",
    "buying_tips": [
      "Brands differ, and some add sugar; the list shows whether yours did.",
      "Look for HPP or high-pressure processed on the carton, and coconut water alone.",
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
    "decision": "Whole grain crackers with olive oil, coconut oil or butter.",
    "buying_tips": [
      "Plain “wheat flour” is not whole grain, and multigrain often means refined grains.",
      "Look for whole grain flour, olive oil and salt, and little else, on the list.",
      "Read the ingredient list for oil; take crackers made with olive oil, coconut oil or butter.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Read the first ingredient; a whole grain there leads the cracker.",
      "Look for “whole wheat flour” on the list, not just “wheat flour.”",
      "For a fermented cracker, look to soda crackers, raised with yeast, or sourdough crackers made from starter.",
      "BHA, BHT and TBHQ are preservatives added to fats and fat-containing foods. Read the ingredient list for BHA, BHT or TBHQ. Take a list without them over one naming any."
    ],
    "detail": "Under 21 CFR 101.4, ingredients are listed in descending order of predominance. FDA draft guidance says the ingredient list should show whether the first ingredient is a whole grain. “Wheat flour” is a synonym of flour, so it is not a whole grain flour. Soda crackers are fermented and leavened with yeast. The finest soda crackers take a long sponge fermentation, where most of the flour ferments first as a pre-ferment. Sourdough crackers are made from sourdough starter. Docking holes are poked in the dough to stop large air pockets while baking. Animal crackers are crackers in name only, and modern graham crackers are sweet. Olive oil, coconut oil or butter is Kristy’s standard for crackers. Skip seed oils and avocado oil.",
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/101.4",
      "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/draft-guidance-industry-and-fda-staff-whole-grain-label-statements",
      "https://www.nutritionletter.tufts.edu/?p=148621",
      "https://en.wikipedia.org/wiki/Cracker_(food)",
      "https://bakerpedia.com/processes/crackers/",
      "https://www.masterclass.com/articles/sourdough-crackers",
      {
        "name": "Dr. Cate Shanahan: The Hateful Eight seed oils",
        "url": "https://drcate.com/hateful-eight/"
      },
      {
        "name": "Weston A. Price Foundation: FAQ, fats and oils",
        "url": "https://www.westonaprice.org/health-topics/faq-fats-and-oils/"
      },
      {
        "name": "CSPI: TBHQ preservative uses",
        "url": "https://www.cspi.org/node/7416"
      },
      {
        "name": "EWG: Food chemicals guide, preservative uses",
        "url": "https://www.ewg.org/consumer-guides/ewgs-dirty-dozen-guide-food-chemicals-top-12-avoid"
      }
    ],
    "watch_out": [
      "A front that leads with whole-grain words can still list refined flour first.",
      "Skip avocado oil too: the label cannot prove the oil is pure."
    ]
  },
  "tortilla_chips": {
    "decision": "Organic masa tortilla chips in olive oil or tallow.",
    "buying_tips": [
      "Lime-cooked corn grinds into masa, a dough; untreated cornmeal cannot form one.",
      "Look for the USDA Organic seal, then masa, one named fat and salt.",
      "Check the frying fat in the ingredients; choose masa chips cooked in olive oil, coconut oil, tallow or lard.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Choose certified organic tortilla chips first, with Non-GMO Project Verified a close second.",
      "Most U.S. corn is bioengineered. Corn becomes grain, syrup, oil and starch."
    ],
    "detail": "The step is nixtamalization: dry corn is soaked and cooked in a solution of slaked lime and water. Slaked lime is calcium hydroxide, called “cal.” The cooked corn, called nixtamal, is washed, then ground into a dough, masa. The word comes from Nahuatl, the Aztec language. Cornmeal from untreated corn cannot form a dough with water alone. Masa harina means “dough flour,” the powder ground from nixtamal. Masa flour made at scale is based on the traditional method. Restaurant-style chips are tortillas cut into wedges and fried. Most bagged chips are shaped straight from coarse masa dough and fried. For chips, Kristy’s standard is olive oil, coconut oil, tallow or lard. Skip seed oils and avocado oil.",
    "sources": [
      "https://en.wikipedia.org/wiki/Nixtamalization",
      "https://www.fao.org/4/t0395e/T0395E05.htm",
      "https://www.americastestkitchen.com/articles/8026-what-s-the-difference-between-corn-chips-and-tortilla-chips-ask-paul",
      "https://sporked.com/article/what-is-masa/",
      "https://anchoviesandeclairs.wordpress.com/2018/01/16/the-secret-behind-making-nixtamal-and-tortillas/",
      "https://mininatortilla.com/blogs/news/traditional-vs-factory-made-tortilla-chips",
      {
        "name": "Dr. Cate Shanahan: The Hateful Eight seed oils",
        "url": "https://drcate.com/hateful-eight/"
      },
      {
        "name": "Weston A. Price Foundation: FAQ, fats and oils",
        "url": "https://www.westonaprice.org/health-topics/faq-fats-and-oils/"
      },
      {
        "name": "CSPI: New GMO disclosures",
        "url": "https://www.cspi.org/article/what-know-about-new-gmo-disclosures"
      },
      {
        "name": "Non-GMO Project: GMO FAQ",
        "url": "https://www.nongmoproject.org/gmo-faq/"
      }
    ],
    "cart_pick": "Organic masa tortilla chips: olive oil",
    "watch_out": [
      "Some corn chips are made from corn that was never cooked in lime.",
      "Skip avocado oil too: the label cannot prove the oil is pure.",
      "Canola, soy or corn frying oil in tortilla chips is typically derived from bioengineering."
    ]
  },
  "potato_chips": {
    "decision": "Sliced potato chips in olive oil, coconut oil or tallow.",
    "buying_tips": [
      "Stacked crisps start as dried potato flakes and cornstarch pressed into one shape.",
      "Read the ingredient list for the frying fat; take chips cooked in olive oil, coconut oil, tallow or lard.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Read the ingredients; a sliced chip starts with potatoes.",
      "Identical, stackable shapes point to a crisp pressed from flakes.",
      "Expect irregular sizes and folds in a bag of sliced chips.",
      "BHA, BHT and TBHQ are preservatives added to fats and fat-containing foods. Read the ingredient list for BHA, BHT or TBHQ. Take a list without them over one naming any."
    ],
    "detail": "The FDA classifies potato chips as thin slices of potatoes fried in deep fat. A stacked crisp starts from dehydrated potato flakes mixed with cornstarch and water. That mix gives every piece the same shape for stacking. The FDA let one such product use the name potato chips only with a prominent disclaimer: “potato chips made from dried potatoes.” Its maker chose “potato crisps,” the British term, instead. For chips, Kristy’s standard is olive oil, coconut oil, tallow or lard. Skip seed oils and avocado oil.",
    "sources": [
      "https://www.smithsonianmag.com/arts-culture/curious-history-potato-chip-180979232/",
      "https://www.chowhound.com/1803980/pringles-arent-potato-chips/",
      "https://www.thetakeout.com/1833928/why-pringles-not-real-potato-chips/",
      {
        "name": "Dr. Cate Shanahan: The Hateful Eight seed oils",
        "url": "https://drcate.com/hateful-eight/"
      },
      {
        "name": "Weston A. Price Foundation: FAQ, fats and oils",
        "url": "https://www.westonaprice.org/health-topics/faq-fats-and-oils/"
      },
      {
        "name": "CSPI: TBHQ preservative uses",
        "url": "https://www.cspi.org/node/7416"
      },
      {
        "name": "EWG: Food chemicals guide, preservative uses",
        "url": "https://www.ewg.org/consumer-guides/ewgs-dirty-dozen-guide-food-chemicals-top-12-avoid"
      }
    ],
    "cart_pick": "Sliced potato chips: olive oil",
    "watch_out": [
      "“Potato crisps” can name a product pressed from dried potato flakes, not slices.",
      "Skip avocado oil too: the label cannot prove the oil is pure."
    ]
  },
  "popcorn": {
    "decision": "Plain popcorn kernels, popped at home in coconut oil.",
    "buying_tips": [
      "Plain kernels pop with no oil, so any butter, oil or salt is your call.",
      "Look for a bag of kernels with popcorn as the only ingredient.",
      "Pop kernels at home in coconut oil, butter or tallow, then salt to taste.",
      "Microwave and ready-popped bags name their oil in the list; skip sunflower, safflower, canola, soybean, corn and cottonseed oil.",
      "CSPI says popcorn is never bioengineered, so a non-GMO seal on plain kernels adds nothing."
    ],
    "detail": "Popcorn is a variety of corn, Zea mays everta. Its hard outer hull is the pericarp. Inside, moisture runs about 13 to 14.5 percent of the kernel. As the water heats, the kernel acts as a pressure cooker until the hull ruptures. Kernels with cuts or weak spots in the hull let the moisture escape and stay unpopped. In one study, 4 to 47 percent of kernels failed to pop, depending on variety. Two popped shapes are grown, butterfly and mushroom. Mushroom popcorn is often sold prepopped and coated with flavorings. For popping at home, Kristy’s standard is coconut oil, butter or tallow. Skip seed oils and avocado oil.",
    "sources": [
      "https://ag.purdue.edu/news/2020/02/whats-under-the-shell-of-this-popular-snack.html",
      "https://www.nbcnews.com/id/wbna7584284",
      "https://share.america.gov/popcorn-hails-from-americas-heartland/",
      "https://www.csmonitor.com/The-Culture/Food/Stir-It-Up/2014/0903/The-easier-cheaper-way-to-make-air-popped-popcorn",
      "https://blogs.extension.iastate.edu/answerline/2026/05/19/popcorn/",
      {
        "name": "Dr. Cate Shanahan: The Hateful Eight seed oils",
        "url": "https://drcate.com/hateful-eight/"
      },
      {
        "name": "Weston A. Price Foundation: FAQ, fats and oils",
        "url": "https://www.westonaprice.org/health-topics/faq-fats-and-oils/"
      },
      {
        "name": "CSPI: New GMO disclosures",
        "url": "https://www.cspi.org/article/what-know-about-new-gmo-disclosures"
      }
    ],
    "watch_out": [
      "Prepopped popcorn is often coated with flavorings before it reaches the shelf.",
      "Skip avocado oil too: the label cannot prove the oil is pure.",
      "Canola, soy or corn oil in ready-popped bags is typically derived from bioengineering."
    ],
    "pick_steps": [
      "Buy plain kernels to pop at home in coconut oil, butter or tallow.",
      "Prepopped popcorn is often coated with flavorings before it reaches the shelf."
    ]
  },
  "pretzels": {
    "decision": "Whole wheat pretzels with a short ingredient list.",
    "buying_tips": [
      "The alkaline bath gives a pretzel its chew and glossy brown crust.",
      "Look for whole wheat flour, not enriched flour, at the top of the list.",
      "Read the list for flour, malt syrup, oil, salt, yeast and soda.",
      "Hard and soft pretzels both take the bath; a hard one bakes about twice as long.",
      "A paler pretzel can point to the milder baking soda bath."
    ]
  },
  "snack_bars": {
    "decision": "Organic bars with oats or another whole grain listed first.",
    "buying_tips": [
      "Ingredients run by amount, so the first one leads; rolled oats count as whole grain.",
      "Look for organic oats first and fruit or honey as the only sweetener.",
      "Find the oil in the ingredient list; take bars made with olive oil, coconut oil or butter.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Read the first ingredients; oats or another whole grain should lead.",
      "Look for fruit, honey or syrups as the sweetener, with nuts and seeds.",
      "Many bars carry sugar and high fructose corn syrup, and the list shows which.",
      "Choose certified organic oat bars over conventional. Conventional oats may be sprayed with glyphosate shortly before harvest to dry the crop. Organic farming does not allow glyphosate. Drift can still leave residues on organic oats.",
      "Read the ingredient list for synthetic dyes: Red 40, Yellow 5, Yellow 6 or Blue 1. Take the list with no added color over one naming a dye. “Lake” means a dye that does not dissolve in water; it still counts."
    ],
    "detail": "Under 21 CFR 101.4, ingredients are listed in descending order of predominance. FDA guidance counts rolled oats as whole grain, since simple flattening or steaming keeps every part of the whole oat. An extension guide favors bars with whole grains such as oats, sweetened with fruit, honey or syrups, with nuts and seeds. The same guide advises avoiding bars with hydrogenated oils. Granola is rolled oats, nuts, seeds and honey or another sweetener, usually baked. A granola bar mixes granola with honey or syrup, pressed and baked into a bar. For added fat in bars, Kristy’s standard is olive oil, coconut oil or butter. Skip seed oils and avocado oil.",
    "sources": [
      "https://www.law.cornell.edu/cfr/text/21/101.4",
      "https://blogs.extension.iastate.edu/answerline/2024/02/01/making-granola-bars-a-healthy-treat/",
      "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/draft-guidance-industry-and-fda-staff-whole-grain-label-statements",
      "https://www.fda.gov/food/nutrition-facts-label/added-sugars-nutrition-facts-label",
      "https://en.wikipedia.org/wiki/Granola",
      {
        "name": "Dr. Cate Shanahan: The Hateful Eight seed oils",
        "url": "https://drcate.com/hateful-eight/"
      },
      {
        "name": "Weston A. Price Foundation: FAQ, fats and oils",
        "url": "https://www.westonaprice.org/health-topics/faq-fats-and-oils/"
      },
      {
        "name": "Cornucopia Institute: Glyphosate Used to Kill and Prepare Crops for Harvest",
        "url": "https://www.cornucopia.org/2017/10/glyphosate-used-kill-prepare-crops-harvest"
      },
      {
        "name": "FoodPrint: Glyphosate Residue in Food",
        "url": "https://foodprint.org/blog/glyphosate-residue-in-food/"
      },
      {
        "name": "Environmental Working Group: Glyphosate in oat-based products",
        "url": "https://www.ewg.org/news-insights/news/2023/04/going-going-gone-ewg-finds-glyphosate-levels-drop-oat-based-products"
      },
      {
        "name": "CSPI: Artificial colorings (synthetic food dyes)",
        "url": "https://www.cspi.org/node/7436"
      }
    ],
    "watch_out": [
      "Enriched refined grains listed first mean refined grain leads the bar, not oats.",
      "Skip avocado oil too: the label cannot prove the oil is pure."
    ]
  },
  "trail_mix": {
    "decision": "Trail mix of nuts and dried fruit alone, nothing added.",
    "buying_tips": [
      "Ingredients run by amount, so a long list can push nuts and fruit to the back.",
      "Look for a bag of only nuts and dried fruit, with no candy, oil or salt.",
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
      "Read “multigrain” as several grains, not whole grains.",
      "Read the ingredient list for synthetic dyes: Red 40, Yellow 5, Yellow 6 or Blue 1. Take the list with no added color over one naming a dye. “Lake” means a dye that does not dissolve in water; it still counts."
    ],
    "sources": [
      "https://www.nutritionletter.tufts.edu/?p=148621",
      "https://www.law.cornell.edu/cfr/text/21/101.4",
      "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/draft-guidance-industry-and-fda-staff-whole-grain-label-statements",
      "https://blogs.extension.iastate.edu/answerline/2024/02/01/making-granola-bars-a-healthy-treat/",
      {
        "name": "CSPI: Artificial colorings (synthetic food dyes)",
        "url": "https://www.cspi.org/node/7436"
      }
    ]
  },
  "hummus": {
    "decision": "Organic hummus of chickpeas and tahini, with no gums.",
    "buying_tips": [
      "Hummus bi tahina names its two parts, so chickpeas and tahini should lead the list.",
      "Look for certified organic chickpeas and tahini, with no gum on the list.",
      "Read the list for chickpeas and tahini at the top.",
      "Look for lemon or citric acid; an acid balances the chickpeas and tahini.",
      "A tub listing guar gum runs thicker; without it, water and grind set the texture.",
      "Check the tub’s ingredients for added oil; choose olive oil or a hummus with no added oil.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Skip hummus made with avocado oil, even when the front calls the tub traditional.",
      "Choose certified organic hummus over conventional. Conventional chickpeas may receive glyphosate before harvest for weed control. Organic farming does not allow glyphosate. Drift can still leave residues on organic chickpeas."
    ],
    "sources": [
      "https://www.britannica.com/topic/hummus",
      "https://www.pilgrimaps.com/hummus-discovering-the-spread-that-conquered-the-world/",
      "https://www.americastestkitchen.com/taste_tests/2747-the-best-supermarket-hummus",
      "https://mndaily.com/uncategorized/sharing-food-hommous-bi-tahini/01/18/2021/snoadmin/",
      {
        "name": "Dr. Cate Shanahan: The Hateful Eight seed oils",
        "url": "https://drcate.com/hateful-eight/"
      },
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
      }
    ]
  },
  "deli_salads": {
    "decision": "Deli salads from the cold case, eaten within days.",
    "buying_tips": [
      "Cold food stays at 40°F or below, and egg, tuna or macaroni salad keeps 3 to 5 days.",
      "Buy salads from a refrigerated case.",
      "Check the Sell-By date, and skip a tub past it.",
      "Get it home cold; two hours out at most, one hour above 90°F.",
      "Read the salad’s ingredient label, including the dressing: choose olive oil or mayonnaise made with olive oil.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Skip avocado oil in the dressing as well. Ask for the ingredient list at the deli counter."
    ],
    "sources": [
      "https://hgic.clemson.edu/factsheet/deli-other-take-out-foods/",
      "https://www.foodrepublic.com/1611339/how-long-does-chicken-salad-lasts-fridge",
      "https://www.tastingtable.com/1907890/avoid-deli-food-display-red-flag",
      "https://extension.uconn.edu/?p=20521",
      {
        "name": "Dr. Cate Shanahan: The Hateful Eight seed oils",
        "url": "https://drcate.com/hateful-eight/"
      }
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
    "decision": "Fresh pasta of flour and egg, with nothing added.",
    "buying_tips": [
      "Many packs add nothing, and some add ascorbic or citric acid, which the list shows.",
      "Look for flour and egg alone, with no ascorbic or citric acid added.",
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
    "decision": "Whole wheat frozen pizza, crust of flour, water, salt, yeast.",
    "buying_tips": [
      "That short list is the traditional Neapolitan dough, with nothing else in it.",
      "Look for real cheese on the list; “imitation cheese” marks a substitute.",
      "Read the crust list for flour, water, salt and yeast.",
      "On a whole wheat crust, look for whole wheat flour listed first.",
      "At home, double-wrap a pizza for the freezer: plastic wrap, then foil.",
      "Air touching the surface leaves freezer burn, grayish-brown leathery spots."
    ]
  },
  "frozen_meals": {
    "decision": "Frozen meals named for their meat, no binders or extenders.",
    "buying_tips": [
      "The name sets a floor: at least 25 percent meat in a stew, 18 in a poultry dinner.",
      "Look for a meat named in the title and no binders or extenders in the list.",
      "Read the product name first: it sets the meat minimum.",
      "Check the package for the inspection mark.",
      "Read the label, since some products must be cooked from frozen.",
      "At home, use frozen dinners within 3 to 4 months for best quality."
    ]
  },
  "frozen_fries": {
    "decision": "Frozen fries in tallow, olive oil or coconut oil.",
    "buying_tips": [
      "At home, hash browns take potatoes, oil, salt and pepper; the bag lists anything more.",
      "The bag’s ingredient list names the frying or par-frying oil. Choose tallow, olive oil, or coconut oil; no added oil also fits.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Read the bag’s ingredient list for potatoes, salt and the oil by name.",
      "Compare bags by what each one lists beyond potatoes, salt and that oil.",
      "In an air fryer, preheat about 3 minutes and shake the basket halfway.",
      "Do not overcrowd the air fryer basket, so the fries cook evenly.",
      "From an oven recipe, lower the air fryer temperature 25 to 30 F and the time by 20%.",
      "BHA, BHT and TBHQ are preservatives added to fats and fat-containing foods. Read the ingredient list for BHA, BHT or TBHQ. Take a list without them over one naming any."
    ],
    "detail": "The federal grade standard describes frozen french fries as mature white potatoes, washed, sorted and trimmed. They may be cut or left whole. They are deep-fried or blanched in fat or oil, then frozen. Blanching is a short cook in hot water or steam. In a plant, the strips are peeled, cut and blanched, then par-fried, meaning partly fried, and frozen. Blanching also leaches sugars from the strips. The fries are finish-fried from frozen to develop color and crispness. Why it works: frying is first a dehydration process, meaning it drives water out of the food. The drier the food going in, the better the crust. So cooks fry once, freeze, and fry again. As food cools, moisture moves from the center to the surface. The second fry boils it off. The first fry also leaves simpler pathways inside, so water escapes more easily the second time. An air fryer is a convection appliance, meaning it circulates hot air. It cooks faster than an oven and gives a crisp outside. French fries cook well in one. For added fat, Kristy’s standard is tallow, olive oil, or coconut oil. Skip seed oils and avocado oil.",
    "sources": [
      "https://www.ams.usda.gov/sites/default/files/media/Frozen_French_Fried_Potatoes_Standard%5B1%5D.pdf",
      "https://www.wgbh.org/news/2016-03-24/fry-and-fry-again-the-science-secrets-to-the-double-fry",
      "https://patents.google.com/patent/US4254153",
      "https://www.recipetineats.com/french-fries/",
      "https://www.crunchycreamysweet.com/hash-browns-recipe/",
      "https://extension.illinois.edu/sites/default/files/2024-12/air_fryer.pdf",
      "https://brunswick.ces.ncsu.edu/2022/07/freezing",
      {
        "name": "Dr. Cate Shanahan: The Hateful Eight seed oils",
        "url": "https://drcate.com/hateful-eight/"
      },
      {
        "name": "Weston A. Price Foundation: FAQ, fats and oils",
        "url": "https://www.westonaprice.org/health-topics/faq-fats-and-oils/"
      },
      {
        "name": "CSPI: TBHQ preservative uses",
        "url": "https://www.cspi.org/node/7416"
      }
    ],
    "kristy_take": "A short list is the standard here: potatoes, salt and one fat, tallow, olive oil or coconut oil. At home, starchy Russets fry crisp once rinsed of starch and dried. Home cooks freeze fries after the first fry, then do the second from frozen.",
    "cart_pick": "Frozen fries: tallow",
    "watch_out": [
      "Fried foods frozen at home may lose their crispness.",
      "Skip avocado oil too: the label cannot prove the oil is pure."
    ],
    "pick_steps": [
      "Read the bag for potatoes, salt, and tallow, olive oil, or coconut oil.",
      "No added oil also fits; compare anything listed beyond potatoes and salt."
    ]
  },
  "frozen_waffles": {
    "decision": "Whole grain frozen waffles with no dyes or enriched flour.",
    "buying_tips": [
      "“Wheat flour” is plain flour, and front grain claims are undefined, so the list decides.",
      "Look for whole wheat flour first and no enriched flour or dye anywhere on the list.",
      "Read the first ingredient for a whole grain, such as whole wheat flour.",
      "Graham flour and rolled oats count as whole grain on the list.",
      "Regular waffles rise with baking powder or soda, and yeast waffles rise with yeast.",
      "At home, freeze cooled waffles airtight with parchment between, then toast them from frozen.",
      "Read the ingredient list for synthetic dyes: Red 40, Yellow 5, Yellow 6 or Blue 1. Take the list with no added color over one naming a dye. “Lake” means a dye that does not dissolve in water; it still counts."
    ],
    "sources": [
      "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/draft-guidance-industry-and-fda-staff-whole-grain-label-statements",
      "https://www.ams.usda.gov/sites/default/files/media/CID%20Griddle%20Bread%2C%20Shelf%20Stable%20%28Waffles%2C%20Pancakes%2C%20French%20toast%2C%20Belgian%20Waffles%29.pdf",
      "https://www.onceuponachef.com/recipes/waffle-recipe.html",
      "https://www.abakershouse.com/overnight-belgian-style-yeast-waffles/",
      {
        "name": "CSPI: Artificial colorings (synthetic food dyes)",
        "url": "https://www.cspi.org/node/7436"
      }
    ]
  },
  "frozen_nuggets": {
    "decision": "Organic or pasture-raised white meat nuggets, one solid piece.",
    "buying_tips": [
      "“White meat” means 100 percent light meat; “mostly white meat” can be 66 percent.",
      "Look for certified organic on the box and a plain “Chicken Nugget” name.",
      "Find the frying or par-frying oil in the ingredient list. Take nuggets with tallow, olive oil, or coconut oil; no added oil also fits.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Read the name: a plain “Chicken Nugget” is a solid piece of meat or poultry.",
      "Look for “Chopped and Formed” beside the name, which means chopped and formed meat or poultry.",
      "A nugget labeled “breaded” holds no more than 30 percent breading.",
      "BHA, BHT and TBHQ are preservatives added to fats and fat-containing foods. Read the ingredient list for BHA, BHT or TBHQ. Take a list without them over one naming any."
    ],
    "detail": "On poultry labels, “white meat” or “light meat” means 100 percent light meat. “Mostly white meat” means 66 percent or more light meat. “Natural proportions” means 50 to 65 percent light meat. A nugget is an irregular, usually bite-sized piece, usually breaded and fried, meant as finger food. “Chicken Nugget” with no qualifier means a solid piece of meat or poultry. “Chopped and Formed” beside the name means chopped and formed meat or poultry. With binders, extenders or water, “nugget” is only a fanciful name. A descriptive name then follows, such as “Breaded Nugget-Shaped Chicken Patties”. A product labeled “breaded” carries batter and breading of no more than 30 percent of the finished product. “Ice glazed” beside the name means an ice glaze set the breading. “Mechanically Separated Chicken” is poultry with most of the bone removed by machine, in a paste-like form. Its bone solids are at most 1 percent. For added fat, Kristy’s standard is tallow, olive oil, or coconut oil. Skip seed oils and avocado oil.",
    "sources": [
      "https://www.law.cornell.edu/cfr/text/9/381.156",
      "https://www.law.cornell.edu/cfr/text/9/381.166",
      "https://www.law.cornell.edu/cfr/text/9/319.880",
      "https://web.archive.org/web/2023id_/https://www.fsis.usda.gov/sites/default/files/import/Labeling-Policy-Book.pdf",
      "https://www.law.cornell.edu/cfr/text/9/381.173",
      "https://www.americastestkitchen.com/recipes/15619-tiny-chicken-tenders",
      {
        "name": "Dr. Cate Shanahan: The Hateful Eight seed oils",
        "url": "https://drcate.com/hateful-eight/"
      },
      {
        "name": "Weston A. Price Foundation: FAQ, fats and oils",
        "url": "https://www.westonaprice.org/health-topics/faq-fats-and-oils/"
      },
      {
        "name": "CSPI: TBHQ preservative uses",
        "url": "https://www.cspi.org/node/7416"
      }
    ],
    "watch_out": [
      "“Nugget-Shaped” in the name marks chopped meat that may hold binders, extenders or water.",
      "Skip avocado oil too: the label cannot prove the oil is pure."
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

// Existing consumers enumerate full cards, which have buying_tips and a two-line front.
// Picks have only a decision. Keep their pins accessible as TWO_LINE[id] without changing
// that enumeration contract; the test below checks every own property, including the concern picks.
const PICK_PINS = {
  "pick_sausage": {
    "decision": "Sausage with named meat and spices; celery powder supplies nitrite.",
    "sources": [
      {
        "name": "Cornell LII: 9 CFR § 319.140 Sausage",
        "url": "https://www.law.cornell.edu/cfr/text/9/319.140"
      },
      {
        "name": "Cornell LII: 9 CFR § 319.141 Fresh pork sausage",
        "url": "https://www.law.cornell.edu/cfr/text/9/319.141"
      },
      {
        "name": "Cornell LII: 9 CFR § 317.17 Curing agents in the ingredients statement",
        "url": "https://www.law.cornell.edu/cfr/text/9/317.17"
      },
      {
        "name": "Consumer Reports: Decoding the labels on meat packages",
        "url": "https://www.consumerreports.org/food/decoding-the-labels-on-meat-packages/"
      },
      {
        "name": "NPR: No nitrates added labels and celery-based curing",
        "url": "https://www.npr.org/sections/thesalt/2019/08/29/755115208/duped-in-the-deli-aisle-no-nitrates-added-labels-are-often-misleading"
      }
    ]
  },
  "pick_jerky": {
    "decision": "Beef jerky with a short list; celery powder supplies nitrite.",
    "sources": [
      {
        "name": "NDSU Extension: Jerky",
        "url": "https://www.ndsu.edu/agriculture/extension/publications/jerky-native-american-inspired-snack-we-all-can-enjoy-today"
      },
      {
        "name": "Cornell LII: 9 CFR § 317.17 Curing agents in the ingredients statement",
        "url": "https://www.law.cornell.edu/cfr/text/9/317.17"
      },
      {
        "name": "Consumer Reports: Decoding the labels on meat packages",
        "url": "https://www.consumerreports.org/food/decoding-the-labels-on-meat-packages/"
      },
      {
        "name": "NPR: No nitrates added labels and celery-based curing",
        "url": "https://www.npr.org/sections/thesalt/2019/08/29/755115208/duped-in-the-deli-aisle-no-nitrates-added-labels-are-often-misleading"
      }
    ]
  },
  "pick_juice": {
    "decision": "Usually pasteurized, with untreated cold-case juice bearing warning labels; read ingredients: no added color over dyes.",
    "sources": [
      {
        "name": "FDA: What You Need to Know About Juice Safety",
        "url": "https://www.fda.gov/food/buy-store-serve-safe-food/what-you-need-know-about-juice-safety"
      },
      {
        "name": "CSPI: Artificial colorings (synthetic food dyes)",
        "url": "https://www.cspi.org/node/7436"
      }
    ]
  },
  "pick_canned_tomatoes": {
    "decision": "Skip dented, rusted or swollen cans and read for BPA-free; the date is a quality mark.",
    "sources": [
      {
        "name": "Nebraska Extension: Food Storage",
        "url": "https://food.unl.edu/free-resource/food-storage/"
      },
      {
        "name": "EWG: BPA in Canned Food",
        "url": "https://www.ewg.org/research/bpa-canned-food"
      }
    ]
  }
};

Object.defineProperties(TWO_LINE, Object.fromEntries(
  Object.entries(PICK_PINS).map(([id, pin]) => [id, { value: pin, enumerable: false }]),
));

test('every full-card and concern pick pin matches the live KB', () => {
  const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
  const cards = nonEmpty(kb.entries.filter((e) => e.kind !== 'pick'), 'full cards', 180);
  const picks = ['pick_sausage', 'pick_jerky', 'pick_juice', 'pick_canned_tomatoes'];
  const pinnedIds = nonEmpty(Object.getOwnPropertyNames(TWO_LINE), 'all two-line pins', 185);
  assert.deepEqual(pinnedIds.toSorted(), [...cards.map((e) => e.id), ...picks].toSorted(), 'missing or stale pin');
  for (const id of pinnedIds) {
    const entry = kb.entries.find((e) => e.id === id);
    assert.ok(entry, `${id} pin has no live entry`);
    if (picks.includes(id)) assert.equal(entry.kind, 'pick', `${id} must stay a pick`);
    for (const [field, expected] of nonEmpty(Object.entries(TWO_LINE[id]), `${id} pinned fields`)) {
      assert.deepEqual(entry[field], expected, `${id}.${field} differs from its pin`);
    }
  }
});

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

// Concern batches add archived sources from docs/sources/concerns; older batches froze or
// archived sources elsewhere, so they read each concern card's sources as of 5a53252.
// Concern acceptance tests own the new URLs and copy; TWO_LINE pins every changed field.
const CONCERN = new Set(['deli_meat_uncured', 'bacon', 'hot_dogs', 'ham', 'turkey_bacon', 'cured_pork', 'pick_sausage', 'pick_jerky', 'pork_cuts_and_enhanced', 'egg_duck_quail', 'label_cage_free', 'label_pasture_raised_feed', 'cooking_oils', 'nut_butter_ingredients', 'plant_butter', 'label_cold_pressed_expeller', 'mayo', 'deli_salads', 'hummus', 'rotisserie_chicken', 'potato_chips', 'tortilla_chips', 'crackers', 'frozen_fries', 'frozen_nuggets', 'snack_bars', 'popcorn', 'whole_vs_reduced_fat_milk', 'dairy_case', 'cheese_real_vs_processed', 'yogurt_plain_vs_flavored', 'ice_cream', 'cream_vs_creamer', 'cottage_cheese', 'sour_cream', 'cream_cheese', 'almond_milk', 'oat_milk', 'soy_milk', 'coconut_milk_beverage', 'oats_steelcut_rolled_instant', 'breakfast_cereal', 'muesli', 'flour_basics', 'sandwich_bread', 'beans_dried_vs_canned', 'pasta_dry', 'frozen_waffles', 'pick_juice', 'snacks', 'canned_soup', 'canned_fish_choosing', 'canned_tuna', 'pick_canned_tomatoes', 'canned_coconut_milk', 'salmon_wild_vs_farmed', 'smoked_salmon', 'label_wild_vs_farm_raised', 'shrimp_imported_vs_domestic', 'label_nonGMO_vs_organic', 'sugars', 'tortillas']);
const PRE_CONCERN = JSON.parse(execFileSync('git', ['show', '5a53252:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
// Historical pass rules freeze sources and label definitions. Restore labels only when
// TWO_LINE pins their current copy, leaving live fronts available to source checks.
// Other historical copy assertions opt into all pinned fields with copy: true.
// Every restored field remains checked against the live KB above.
export const beforeConcern = (e, { copy = false } = {}) => {
  if (!e || !CONCERN.has(e.id)) return e;
  const pre = PRE_CONCERN.entries.find((x) => x.id === e.id);
  const fields = copy ? Object.keys(TWO_LINE[e.id])
    : ['sources', ...Object.keys(TWO_LINE[e.id]).filter((field) => field === 'labels_decoded')];
  return { ...e, ...Object.fromEntries(fields.map((field) => [field, pre[field]])) };
};

test('beforeConcern restores frozen labels while preserving other live copy and its input', () => {
  const live = {
    id: 'oats_steelcut_rolled_instant',
    question: 'What kind of oats should you buy?',
    buying_tips: ['Choose certified organic oats over conventional.'],
    sources: [{ name: 'Current source', url: 'https://example.com/current' }],
    labels_decoded: [{ term: 'Instant / flavored', meaning: 'Pre-cooked and usually pre-sweetened. Read the added sugar.' }],
  };
  const original = structuredClone(live);
  const historical = beforeConcern(live);
  assert.deepEqual(historical.labels_decoded, [
    { term: 'Instant / flavored', meaning: 'Pre-cooked and usually pre-sweetened — read the added sugar.' },
  ]);
  assert.deepEqual(historical.sources, [
    'USDA FoodData Central',
    'Michigan State University Extension “Love your oats” https://www.canr.msu.edu/news/love_your_oats (glycemic index measured at 42 for steel-cut oats, 55 for rolled and 83 for instant)',
  ]);
  assert.deepEqual({ ...historical, sources: live.sources, labels_decoded: live.labels_decoded }, original);
  assert.deepEqual(live, original);
  const unpinnedLabels = { ...live, id: 'hummus' };
  assert.deepEqual(beforeConcern(unpinnedLabels).labels_decoded, original.labels_decoded);
  const outsideConcern = { ...live, id: 'fixture_outside_concern' };
  assert.equal(beforeConcern(outsideConcern), outsideConcern);
});

// Card-tidy owns the live copy; historical batches keep the cards as they stood at 8264bd0.
const TIDIED = new Set(['salmon_wild_vs_farmed', 'shrimp_imported_vs_domestic', 'label_nonGMO_vs_organic', 'canned_fish_choosing', 'label_wild_vs_farm_raised', 'pick_canned_tomatoes', 'tortillas', 'oat_milk', 'canned_tuna', 'smoked_salmon', 'almond_milk', 'soy_milk', 'sugars', 'cooking_oils', 'canned_coconut_milk', 'canned_soup', 'tortilla_chips', 'popcorn']);
const PRE_TIDY = JSON.parse(execFileSync('git', ['show', '8264bd0:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
export const preTidy = (e) => (e && TIDIED.has(e.id) ? PRE_TIDY.entries.find((x) => x.id === e.id) : e);

// clean-pick-1 (2026-10-20) moved these cards' fronts (and five poultry tier notes) on; older
// batch tests read them as of ede90e7, and cleanPick1.test.js owns the new text.
export const CLEAN_PICK_1 = new Set(['sugars', 'rotisserie_chicken', 'chicken_breast', 'chicken_cuts_basics', 'ground_turkey', 'turkey_whole', 'grassfed_butter', 'cheese_real_vs_processed', 'cream_vs_creamer', 'sour_cream', 'cream_cheese', 'sandwich_bread', 'tortillas', 'mayo', 'pasta_sauce', 'white_fish']);
const PRE_CP1 = JSON.parse(execFileSync('git', ['show', 'ede90e7:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
export const preCleanPick = (e) => (e && CLEAN_PICK_1.has(e.id) ? PRE_CP1.entries.find((x) => x.id === e.id) : e);

// clean-pick-2 (2026-10-20) moved these produce fronts on; older batch tests read them as of 74237ce, and cleanPick2.test.js owns the new text.
export const CLEAN_PICK_2 = new Set(['organic_worth_it_by_type', 'frozen_vs_fresh_produce', 'produce_seasonality', 'sprouts_raw', 'berries_picking', 'produce_leafy_greens', 'produce_peppers', 'produce_apples_pears', 'produce_stone_fruit', 'produce_green_beans', 'produce_root_vegetables', 'produce_brassicas', 'produce_onions_garlic', 'produce_citrus', 'produce_mushrooms', 'produce_bananas']);
const PRE_CP2 = JSON.parse(execFileSync('git', ['show', '74237ce:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
export const preCleanPick2 = (e) => (e && CLEAN_PICK_2.has(e.id) ? PRE_CP2.entries.find((x) => x.id === e.id) : e);

// clean-pick-3 (2026-10-20) moved these dairy, plant-milk, meat, seafood and frozen fronts on; older batch tests read them as of 2ab7f2f, and cleanPick3.test.js owns the new text.
export const CLEAN_PICK_3 = new Set(['almond_milk', 'soy_milk', 'oat_milk', 'coconut_milk_beverage', 'plant_butter', 'cottage_cheese', 'ghee', 'goat_sheep_dairy', 'ice_cream', 'butcher_counter_asking', 'organ_meats', 'lard_tallow', 'smoked_salmon', 'frozen_nuggets', 'hot_dogs', 'turkey_bacon', 'frozen_pizza', 'frozen_waffles', 'frozen_meals', 'canned_coconut_milk', 'coconut_water']);
const PRE_CP3 = JSON.parse(execFileSync('git', ['show', '2ab7f2f:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
export const preCleanPick3 = (e) => (e && CLEAN_PICK_3.has(e.id) ? PRE_CP3.entries.find((x) => x.id === e.id) : e);

// clean-pick-4 (2026-10-20) moved these bread and grain fronts on; older batch tests read them as of f488733, and cleanPick4.test.js owns the new text.
export const CLEAN_PICK_4 = new Set(['sourdough', 'bagels', 'breakfast_cereal', 'gluten_free_bread', 'buns_rolls', 'pastries_muffins', 'crackers', 'pretzels', 'fresh_pasta']);
const PRE_CP4 = JSON.parse(execFileSync('git', ['show', 'f488733:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
export const preCleanPick4 = (e) => (e && CLEAN_PICK_4.has(e.id) ? PRE_CP4.entries.find((x) => x.id === e.id) : e);

// clean-pick-5 (2026-10-20) moved these corn, soy, ferment, condiment and snack fronts on; older batch tests read them as of 6db979f, and cleanPick5.test.js owns the new text.
export const CLEAN_PICK_5 = new Set(['tortilla_chips', 'popcorn', 'miso', 'tempeh', 'natto', 'hot_soy_sauce', 'kombucha', 'jam', 'ketchup_mustard', 'canned_soup', 'olives', 'salt', 'nutritional_yeast', 'snack_bars', 'trail_mix', 'hummus']);
const PRE_CP5 = JSON.parse(execFileSync('git', ['show', '6db979f:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
export const preCleanPick5 = (e) => (e && CLEAN_PICK_5.has(e.id) ? PRE_CP5.entries.find((x) => x.id === e.id) : e);
