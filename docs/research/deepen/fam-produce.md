# fam-produce — T2 family findings

Run: 2026-10-23. Scope: F01–F06; all 13 assigned member cards. Inputs reviewed: FAMILY-BRIEF.md, FAMILIES.md, groups.json, produce.md, produce-r2.md, the completeness decisions and the current member entries. Findings for the separate card builder; no KB changes.

**Evidence convention.** The best/close/floor/skip rankings implement the locked editorial stance; they are not measured health rankings. The traditional-food [shopping framework](https://www.westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/) supports seasonal organic produce and plain organic frozen alternatives. Its conventional seasonal fallback and geographic exclusions are not adopted. Crop sources below support the specified practices and handling, not every editorial ranking.

**Shelf interpretation across these families.** Look for “organic,” the growing location, and a grower's explicit “grown without pesticide sprays” statement on the pack, shelf sign or linked growing description. A small local grower's disclosed organic practices plus no sprays qualify for the best rung; an unexplained “local,” “natural” or “farm fresh” claim does not. Certification and no sprays are separate checks: the [organic crop standard](https://www.law.cornell.edu/cfr/text/7/205.206) permits specified treatments under stated conditions. If the extra practice information is absent, retain the organic floor rather than inventing it. No counter conversation is required.

**Commercial-pattern skip.** Throughout this report, the brief's skip means choosing away from distant-origin, heavily branded, year-round supply when an eligible small seasonal source is available. These are observable selection traits, not proof of spraying, poor condition or harm. Year-round local cultivation and sound local storage crops require the exceptions below. The [seasonal/local preference](https://www.westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/) supports the direction; the packaging-and-distance screen is an editorial implementation.

### F01 Buy firm, finish at home

RULE (true for all members, 3–6 lines):
- **Best:** Whole fruit from a small trusted grower, with “organic” or disclosed organic practices, “grown without pesticide sprays,” and origin/harvest information; choose local seasonal supply where the crop is actually grown. Match maturity to the eating day, rather than always buying the hardest fruit. [Banana handling](https://www.riverford.co.uk/a-to-z-of-veg/banana); [avocado selection](https://californiaavocado.com/how-to/how-to-choose-and-use-an-avocado/); [tomato handling](https://www.riverford.co.uk/a-to-z-of-veg/tomatoes).
- **Close:** Sound whole “organic” fruit, preferably in season at its stated origin; use “ripe & ready” or “ripen at home” only as timing cues and check the actual fruit. These words do not establish the extra growing practices. [Selection example](https://californiaavocado.com/how-to/how-to-choose-and-use-an-avocado/); [organic scope](https://www.law.cornell.edu/cfr/text/7/205.206).
- **Floor:** Whole “organic” fruit at usable maturity, including firm fruit bought ahead; if unavailable, choose another organic item. No universal frozen-fruit floor is established for this family. [Whole-fruit handling](https://www.riverford.co.uk/a-to-z-of-veg/banana); [avocado timing](https://californiaavocado.com/how-to/how-to-choose-and-use-an-avocado/).
- **Skip:** No organic/practice evidence; distant-origin, heavily branded “year-round” packs when a qualifying seasonal lot is available; visibly decaying fruit. Do not buy firm fruit for immediate eating merely because the family permits home ripening. [Sourcing framework](https://www.westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/); [readiness checks](https://californiaavocado.com/how-to/how-to-choose-and-use-an-avocado/).

BEYOND THE STORE: Seasonal farm stands, farm shares and self-service farm shops are real routes for tomatoes. Availability must be crop- and region-specific; no temperate-local banana or avocado supply is assumed. [Direct-sale example](https://www.cincyurbanfarm.com/get-our-produce).

SEASON/STORAGE: Plan room-temperature finishing and check readiness regularly; ripe fruit can move to refrigeration when more holding time is needed, with the tomato qualification below. No common ripening timetable, skin-color test or harvest month applies. [Bananas](https://www.riverford.co.uk/a-to-z-of-veg/banana); [avocados](https://californiaavocado.com/how-to/how-to-choose-and-use-an-avocado/); [tomatoes](https://www.riverford.co.uk/a-to-z-of-veg/tomatoes).

SHARED SKIP LIST: Rotten softness or leaking/decaying flesh; treating attractive color or a front claim as the entire maturity check. Prepared fruit needs its own ingredient review: route additions to FAMILIES.md → “One shared ingredient-list avoid list,” with its scope exceptions. The whole-food preference does not establish that every prepared additive causes harm. [Selection](https://californiaavocado.com/how-to/how-to-choose-and-use-an-avocado/); [formulation preference](https://www.westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/).

SHOPPER QUESTIONS the family answers:
- Ready tonight, or bought ahead for later in the week?
- Which fruit should finish on the counter, and when can it move cold?
- Does a variety name or dark skin establish readiness?
- Is frozen flesh automatically a plain substitute for whole fruit?

SOURCES:
- https://www.riverford.co.uk/a-to-z-of-veg/banana — room-temperature ripening, ripe refrigeration and peeled freezing.
- https://californiaavocado.com/how-to/how-to-choose-and-use-an-avocado/ — gentle palm pressure, variety-dependent color, counter ripening and chilled cut-fruit handling.
- https://www.riverford.co.uk/a-to-z-of-veg/tomatoes — room temperature for near-term use; refrigeration for longer keeping.
- https://www.cincyurbanfarm.com/tomato — independent, brief refrigeration exception for very ripe tomatoes; variety/use examples.
- https://www.cincyurbanfarm.com/get-our-produce — actual farm-share, market and self-service routes.
- https://www.law.cornell.edu/cfr/text/7/205.206 — organic label scope only.
- https://www.westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/ — traditional sourcing and formulation framework, within the limits stated above.

ITEM DELTAS:
- `produce_bananas`: Select yellow fruit for near-term eating and greener fruit for later; “buy green” is not an unconditional rule. Keep green fruit at room temperature; ripe surplus can be chilled or peeled and frozen. Specialty cooking bananas need their own use cue. [Banana guide](https://www.riverford.co.uk/a-to-z-of-veg/banana).
- `produce_avocados`: Gentle whole-palm give establishes readiness better than color; some ripe varieties remain green. Firm organic fruit bought ahead is the demonstrated floor, replacing the current conventional fallback; neither Hass-only selection nor a fixed four-day refrigerator-ripening promise survives. Wash before cutting; cover and refrigerate cut flesh. [Avocado guide](https://californiaavocado.com/how-to/how-to-choose-and-use-an-avocado/).
- `produce_tomatoes`: Replace “never chilled whole”: keep near-term fruit at room temperature, but briefly chill very ripe surplus. Grower advice differs on duration, so omit a universal limit. “Vine-on,” “heirloom” and “dry-farmed” must not substitute for the growing-practice check; preserved organic tomatoes are a separate cooking fallback, not a fresh slicing equivalent. [First handling source](https://www.riverford.co.uk/a-to-z-of-veg/tomatoes); [independent exception](https://www.cincyurbanfarm.com/tomato); [preserved-form framework](https://www.westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/).

### F02 Buy ready; no later sweetening

RULE (true for all members, 3–6 lines):
- **Best:** Whole fruit at eating quality from a small seasonal local grower with disclosed organic practices and “grown without pesticide sprays.” The practical rule is buy ready; do not plan to rescue an underripe purchase on the counter. [Ripe-picked berries](https://www.riverford.co.uk/a-to-z-of-veg/strawberries-raspberries); [grape maturity](https://www.earlsorganic.com/blog/california-grapes-are-in-full-swing); [citrus maturity cues](https://floridaindianrivergroves.com/fundraising/frequently-asked-questions/).
- **Close:** Sound fresh “organic” fruit, with origin and variety visible; inspect the entire pack or fruit, not just the presentation layer. [Berry handling](https://www.riverford.co.uk/a-to-z-of-veg/strawberries-raspberries); [grape selection](https://www.earlsorganic.com/blog/california-grapes-are-in-full-swing).
- **Floor:** Sound whole “organic” fruit already suitable for its intended use. Frozen berries/grapes are item-specific alternatives; there is no single frozen fallback for berries, grapes and whole citrus alike. [Berry freezing](https://jonesfamilyfarms.com/seasons/strawberries/caring-your-strawberries); [whole citrus](https://www.riverford.co.uk/shop/products/lemons-medium).
- **Skip:** Mold, wet breakdown or crushed/leaking packs; distant-origin, heavily branded “year-round” supply when a qualifying seasonal source is stocked. Do not use peel brightness as a universal readiness rule. [Sourcing framework](https://www.westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/); [citrus appearance](https://floridaindianrivergroves.com/fundraising/frequently-asked-questions/).

BEYOND THE STORE: Seasonal berry picking is a real direct route, subject to the same disclosed-practice standard. A picking venue alone does not qualify fruit for the best rung. [Farm picking/handling example](https://jonesfamilyfarms.com/seasons/strawberries/caring-your-strawberries).

SEASON/STORAGE: Refrigeration supports keeping across this family, but berries need especially prompt use and citrus need not inherit a berry deadline. Protect fruit from crushing and pooled moisture; wash near use. Region and cultivar determine season, not one aisle-wide month range. [Berries](https://jonesfamilyfarms.com/seasons/strawberries/caring-your-strawberries); [grapes](https://www.earlsorganic.com/blog/california-grapes-are-in-full-swing); [citrus](https://floridaindianrivergroves.com/fundraising/frequently-asked-questions/).

SHARED SKIP LIST: Moldy or leaking fruit; packs hiding crushed wet fruit underneath. Do not generalize a natural surface bloom into a spray finding, or an ordinary sweet aroma into decay. Fruit cups, syrups and dried preparations route to their own forms and the global ingredient avoid list. [Berry handling](https://www.riverford.co.uk/a-to-z-of-veg/strawberries-raspberries); [natural grape bloom](https://www.earlsorganic.com/blog/california-grapes-are-in-full-swing).

SHOPPER QUESTIONS the family answers:
- Will waiting on the counter fix this purchase?
- What should be checked underneath the fruit?
- Is white bloom or green citrus peel necessarily a defect?
- Do “organic,” “unwaxed” and “untreated after harvest” answer the same question?

SOURCES:
- https://www.riverford.co.uk/a-to-z-of-veg/strawberries-raspberries — ripe-picked, soil-grown berries, prompt use and gentle handling.
- https://jonesfamilyfarms.com/seasons/strawberries/caring-your-strawberries — independent cold handling, washing near use and unsweetened freezing.
- https://www.earlsorganic.com/blog/california-grapes-are-in-full-swing — plump grapes, pliable stems, natural bloom and refrigerated storage; grapes do not ripen off the vine.
- https://www.riverford.co.uk/shop/products/lemons-medium — organic plus unwaxed, ripe greenish lemons and peel use.
- https://floridaindianrivergroves.com/fundraising/frequently-asked-questions/ — naturally green ripe oranges, degreening and ventilated cold storage.
- https://www.law.cornell.edu/cfr/text/7/205.206 — organic growing rules do not establish an all-treatments-absent claim.
- https://www.westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/ — sourcing/formulation preference.

ITEM DELTAS:
- `berries_picking`: Inspect the base without inverting delicate fruit: no pooled juice, crushed wet layer or fuzzy mold. Soil-grown is a preferred disclosed method, not demonstrated nutritional superiority. A dry base does not establish a recent packing date; ordinary berry aroma is not a rejection criterion. Plain organic frozen berries suit specified uses, following pack preparation directions. [Berry grower](https://www.riverford.co.uk/a-to-z-of-veg/strawberries-raspberries); [independent handling/freezing](https://jonesfamilyfarms.com/seasons/strawberries/caring-your-strawberries).
- `produce_grapes`: Choose plump berries on pliable stems; refrigerate unwashed and rinse gently near eating. Natural bloom alone does not identify spray history. Red, green, black, seeded and seedless are preference/variety cues, not health ranks; keep this distinct from the growing-method requirement. [Grape selection and varieties](https://www.earlsorganic.com/blog/california-grapes-are-in-full-swing).
- `produce_citrus`: For zest/peel, seek “organic” plus “unwaxed/no added coating”; “no post-harvest treatment” is a further disclosure, not something implied by unwaxed. Greenish lemons and oranges can be mature; degreening alters appearance and does not explain every green peel. Omit the unsupported universal yellow-lime juice advantage. [Lemon disclosure](https://www.riverford.co.uk/shop/products/lemons-medium); [orange color/process](https://floridaindianrivergroves.com/fundraising/frequently-asked-questions/); [organic scope](https://www.law.cornell.edu/cfr/text/7/205.206).

### F03 Living leaf

RULE (true for all members, 3–6 lines):
- **Best:** Crisp whole greens from a small local grower with organic practices and “grown without pesticide sprays”; the accepted alternative is “living lettuce/roots attached” with an explicit no-pesticide statement, including greenhouse/hydroponic production. [Disclosed living cultivation](https://www.vermillion-farms.com/); [organic-method and root-intact example](https://www.revolgreens.com/service-product/test-product-faq/).
- **Close:** Whole “organic” heads or bunches; inspect leaf bases as well as the top. Whole attached leaves are a useful keeping choice over chopped salad. [Whole-head handling](https://www.riverford.co.uk/a-to-z-of-veg/lettuce).
- **Floor:** Plain “organic” loose/bagged leaves; organic frozen cooking greens for a cooked dish. Read “ready to eat” versus “wash before use” and the date/storage directions. [Pack-specific washing](https://www.revolgreens.com/service-product/test-product-faq/); [frozen-form preference](https://www.westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/).
- **Skip:** Slimy, decaying leaf bases and pooled-liquid packs; distant-origin, heavily branded “year-round” leaf supply over a qualifying nearby crop. “Greenhouse” or “hydroponic” alone is insufficient; year-round local living lettuce remains eligible. [Growing-method disclosure](https://www.revolgreens.com/service-product/test-product-faq/); [freshness/handling](https://ripleyorganicfarm.com/how-store-your-veggies-make-them-last/).

BEYOND THE STORE: A local CSA or living-lettuce market pickup is a demonstrated route; select from its posted growing description and current harvest. [CSA handling](https://ripleyorganicfarm.com/how-store-your-veggies-make-them-last/); [market pickup](https://www.vermillion-farms.com/).

SEASON/STORAGE: Keep harvested leaves cold and protected from drying; stored leaves should not sit in pooled water. Follow the particular living pack's root/storage instructions rather than imposing one damp-root method. Use the pack date and condition, not the current card's commercial-storage or three-week home promise. [Leaf moisture protection](https://ripleyorganicfarm.com/how-store-your-veggies-make-them-last/); [whole heads](https://www.riverford.co.uk/a-to-z-of-veg/lettuce); [pack directions](https://www.revolgreens.com/service-product/test-product-faq/).

SHARED SKIP LIST: Decay and wet collapse; treating every hole, red leaf or loss of crispness as the same defect. “Living” does not establish spray history. Salad-kit dressings and additions route to the global ingredient avoid list; do not describe every prewashed bag as having one specific wash treatment. [Leaf varieties](https://www.riverford.co.uk/a-to-z-of-veg/lettuce); [separate product/wash descriptions](https://www.revolgreens.com/service-product/test-product-faq/).

SHOPPER QUESTIONS the family answers:
- Whole head, loose leaves or roots attached?
- Does greenhouse-grown establish no sprays?
- Does this pack require washing?
- How can leaves stay hydrated without being stored wet?

SOURCES:
- https://www.vermillion-farms.com/ — a small grower's no-pesticide/herbicide/fungicide and roots-attached claims; market access. Shelf-life multiplier not adopted.
- https://www.revolgreens.com/service-product/test-product-faq/ — independent organic-method, no-pesticide, root-intact and wash-direction disclosures; not a brand recommendation.
- https://www.riverford.co.uk/a-to-z-of-veg/lettuce — whole-head handling, refrigeration and natural variety differences.
- https://ripleyorganicfarm.com/how-store-your-veggies-make-them-last/ — cold storage with moisture protection; real CSA route.
- https://www.westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/ — organic frozen formulation preference.

ITEM DELTAS:
- `produce_leafy_greens`: NONE — whole heads, bunches, bagged leaves and the accepted living-lettuce branch are covered above. Do not export the roots-attached option to every leaf species.

### F04 Dark, cool storage crops

RULE (true for all members, 3–6 lines):
- **Best:** Whole storage crops from a small local grower, with organic practices and “grown without pesticide sprays”; identify “maincrop/storage potatoes” or “dry/cured” onions and garlic before applying this family’s pantry rule. [Potato forms](https://www.riverford.co.uk/a-to-z-of-veg/potatoes); [garlic curing](https://filareefarm.com/organic-seed-garlic-growing-guide/).
- **Close:** Firm, intact “organic” storage tubers or cured bulbs with origin and storage/form information; seasonal local stored harvest remains eligible after harvest season. [Storage forms](https://www.riverford.co.uk/a-to-z-of-veg/potatoes); [cured keeping](https://filareefarm.com/organic-seed-garlic-growing-guide/).
- **Floor:** Sound whole “organic” storage crops even when extra treatment details are unavailable. “Organic” is not proof of no post-harvest treatment. [Historical organic sprout-control practices](https://organicfederation.ca/infobio/organic-sprout-inhibitors-potatoes-caught-in-red-tape/).
- **Skip:** Soft, wet, moldy or decaying stock; distant-origin, heavily branded “year-round” packs over qualifying local stored crops. Do not put fresh/green alliums or new potatoes through an unconditional pantry-storage rule. [Form-dependent storage](https://ripleyorganicfarm.com/how-store-your-veggies-make-them-last/); [new-potato exception](https://www.riverford.co.uk/a-to-z-of-veg/potatoes).

BEYOND THE STORE: CSA storage-crop shares are a real route; use the listed crop/form and storage instructions to distinguish a keeping crop from a fresh harvest needing prompt use. [CSA example](https://ripleyorganicfarm.com/how-store-your-veggies-make-them-last/).

SEASON/STORAGE: **Applies only to whole storage forms:** cool, dry surroundings with ventilation; keep potatoes dark and avoid enclosing cured bulbs in moisture-trapping bags. This does not establish identical temperature/humidity needs or shared-container suitability. [Onions](https://www.riverford.co.uk/a-to-z-of-veg/onions); [cured garlic](https://filareefarm.com/organic-seed-garlic-growing-guide/); [potatoes](https://www.riverford.co.uk/a-to-z-of-veg/potatoes).

SHARED SKIP LIST: Wet rot, softened tissue and mold; opaque presentation that prevents a useful condition check. Prepared/minced forms route to the global ingredient avoid list and their refrigeration directions. Sprouting is not one interchangeable judgment across garlic and potatoes; retain item-specific selection below. [Curing/keeping](https://filareefarm.com/organic-seed-garlic-growing-guide/); [form distinctions](https://ripleyorganicfarm.com/how-store-your-veggies-make-them-last/).

SHOPPER QUESTIONS the family answers:
- Is this a cured storage crop or a fresh, perishable form?
- What belongs in a dark pantry, and what needs refrigeration?
- Does organic establish no sprout-control treatment?
- Does a stored local harvest still fit the seasonal preference?

SOURCES:
- https://www.riverford.co.uk/a-to-z-of-veg/onions — dry, airy onion storage.
- https://filareefarm.com/organic-seed-garlic-growing-guide/ — curing, ventilation and variety-dependent keeping; no universal home-life guarantee adopted.
- https://ripleyorganicfarm.com/how-store-your-veggies-make-them-last/ — fresh garlic/bunching onions refrigerated; dry bulbs and storage potatoes in cool pantry conditions.
- https://www.riverford.co.uk/a-to-z-of-veg/potatoes — maincrop versus new/salad storage and waxy/floury uses.
- https://organicfederation.ca/infobio/organic-sprout-inhibitors-potatoes-caught-in-red-tape/ — 2021 evidence of organic post-harvest sprout-control methods, not current legal status or current-lot treatment prevalence.

ITEM DELTAS:
- `produce_onions_garlic`: For keeping, select dry necks, papery outer skins and firm bulbs/cloves. “Fresh/green garlic” and bunching onions are a refrigerated branch, not failed curing. Do not turn the preference for unsprouted keeping bulbs into a universal inedibility claim about a sprouted garlic clove. [Curing](https://filareefarm.com/organic-seed-garlic-growing-guide/); [fresh-form storage](https://ripleyorganicfarm.com/how-store-your-veggies-make-them-last/).
- `produce_potatoes`: Read “new/early/salad” versus “maincrop,” then “waxy/boiling” versus “floury/baking” for use. New/salad potatoes have a colder storage route. Choose sound tubers without green patches or heavy sprouting; a clean, sprout-free appearance does not establish untreated storage. Seek an explicit “no post-harvest sprout treatment” disclosure for the best rung; absence leaves the treatment unknown. [Forms/uses](https://www.riverford.co.uk/a-to-z-of-veg/potatoes); [treatment distinction](https://organicfederation.ca/infobio/organic-sprout-inhibitors-potatoes-caught-in-red-tape/).
  Sweet potatoes, if offered as a substitution, must also meet the locked organic floor and suit the dish. Drop current sample percentages and blanket treatment assertions: the inherited sources do not identify the treatment of this bag. [Limits of historical treatment evidence](https://organicfederation.ca/infobio/organic-sprout-inhibitors-potatoes-caught-in-red-tape/).

### F05 Crisp heads and pods

RULE (true for all members, 3–6 lines):
- **Best:** Whole vegetables from a small seasonal local grower with disclosed organic practices and “grown without pesticide sprays”; protected-grown peppers can qualify when the practices are stated. [Organic no-pesticide growing example](https://www.riverford.co.uk/growers/naturcharc).
- **Close:** Whole “organic” heads, peppers or pods, firm and appropriate to their variety/use; inspect stalks, stem ends and undersides rather than demanding identical colors or shapes. [Broccoli](https://www.riverford.co.uk/a-to-z-of-veg/calabrese-broccoli); [peppers](https://www.riverford.co.uk/a-to-z-of-veg/peppers); [beans](https://www.riverford.co.uk/a-to-z-of-veg/french-beans).
- **Floor:** Plain “organic” prepared vegetables or frozen vegetables for an appropriate cooked use; ingredient wording should identify the vegetables alone. “Florets,” “rice,” “strips” and “French-cut” describe form, not growing practice. [Plain-frozen preference](https://www.westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/); [bean forms](https://www.johnnyseeds.com/growers-library/vegetables/beans/beans-basic-types.html).
- **Skip:** Wet breakdown, mold and slimy packs; “with sauce,” “seasoned” or oil-added versions when buying plain vegetables; distant-origin, heavily branded “year-round” stock over a qualifying seasonal crop. [Formulation framework](https://www.westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/); [crop freshness](https://www.riverford.co.uk/a-to-z-of-veg/french-beans).

BEYOND THE STORE: Farm shares and seasonal stands are real alternatives; their crop list and growing disclosure must still meet the selection standard. [Direct routes](https://www.cincyurbanfarm.com/get-our-produce).

SEASON/STORAGE: Refrigerate these fresh vegetables; protect beans and leafy heads from drying. Do not assign one shelf life or one shared harvest season: peppers/beans and different brassicas have distinct growing windows. [Crop storage groups](https://ripleyorganicfarm.com/how-store-your-veggies-make-them-last/); [broccoli](https://www.riverford.co.uk/a-to-z-of-veg/calabrese-broccoli); [peppers](https://www.riverford.co.uk/a-to-z-of-veg/peppers).

SHARED SKIP LIST: Wet decay and sliminess; maturity unsuitable for the intended dish. Do not make harmless variety differences or a little loss of firmness equivalent to rot. For sauce, fat and additive screens, link the global ingredient avoid list rather than reproducing it here. [Broccoli condition/use](https://www.riverford.co.uk/a-to-z-of-veg/calabrese-broccoli); [pepper varieties](https://www.riverford.co.uk/a-to-z-of-veg/peppers).

SHOPPER QUESTIONS the family answers:
- Whole vegetable, plain cut form or frozen for cooking?
- What part of the head, pepper or pod shows its condition?
- Does an unusual color or shape mean deterioration?
- Does greenhouse-grown establish no sprays?
- Are maturity and variety appropriate to the dish?

SOURCES:
- https://www.riverford.co.uk/growers/naturcharc — organic protected production without pesticide use; compost and natural pest-management practices.
- https://www.riverford.co.uk/a-to-z-of-veg/calabrese-broccoli — refrigeration, edible stalks and distinct broccoli forms.
- https://www.riverford.co.uk/a-to-z-of-veg/peppers — green versus mature sweet peppers, Romano form and refrigeration.
- https://www.riverford.co.uk/a-to-z-of-veg/french-beans — crisp pods, refrigerated bag storage and preparation.
- https://www.johnnyseeds.com/growers-library/vegetables/beans/beans-basic-types.html — snap versus shell/dry beans, filet/haricots verts and wax-bean distinctions.
- https://ripleyorganicfarm.com/how-store-your-veggies-make-them-last/ — refrigeration with crop-specific moisture protection.
- https://www.cincyurbanfarm.com/get-our-produce — direct seasonal access routes.
- https://www.westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/ — plain organic frozen preference.

ITEM DELTAS:
- `produce_brassicas`: Tight, sound standard broccoli crowns, sound cauliflower curds and firm cabbage heads need different visual checks; sprouting broccoli is a distinct form, not automatically an old loose crown. Use sound broccoli stalks. Fresh heads, florets/rice and fermented cabbage are different forms; fermented cabbage belongs in its own family. [Broccoli forms/stalks](https://www.riverford.co.uk/a-to-z-of-veg/calabrese-broccoli); [fresh versus fermented framework](https://www.westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/).
- `produce_peppers`: Read “sweet bell,” “Romano/Italian frying” or “hot” rather than inferring heat from shape. Green bells are less sweet than their mature colored forms; long sweet peppers need not be hot. Check stem end, firmness and wet sunken deterioration; gloss alone does not establish coating, and color is not a health rank. [Pepper guide](https://www.riverford.co.uk/a-to-z-of-veg/peppers).
- `produce_green_beans`: Choose young snap pods rather than mature shelling beans; look for crispness and little seed bulging, without snapping store stock. “Haricots verts/filet,” yellow “wax” and purple snap forms are variety cues; wax does not mean an applied coating. Whole/trimmed/cut forms retain the same sourcing standard. [Bean types](https://www.johnnyseeds.com/growers-library/vegetables/beans/beans-basic-types.html); [freshness and storage](https://www.riverford.co.uk/a-to-z-of-veg/french-beans).

### F06 Dry, firm mushrooms

RULE (true for all members, 3–6 lines):
- **Best:** Fresh whole culinary mushrooms from a small nearby cultivator with disclosed organic growing/substrate practices and “grown without pesticides”; look for species and harvest information. Soil-grown is not a universal requirement. [Organic substrate cultivation](https://smallhold.com/pages/faqs); [no-pesticide cultivation](https://www.kingmushroomfarm.com/faq).
- **Close:** Whole “organic” mushrooms with species identified, dry surfaces and firm, sound tissue; inspect beneath the pack for condensation or pooled liquid. [Cultivator handling](https://smallhold.com/pages/faqs).
- **Floor:** Plain organic sliced mushrooms for prompt cooking, or a clearly identified dried organic culinary species for a dried-mushroom dish. The dried form does not inherit fresh refrigeration instructions. [Fresh/dried forms](https://www.kingmushroomfarm.com/faq); [dried-food preference](https://www.westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/).
- **Skip:** Slimy, deteriorating, liquid-filled packs and unidentified wild collections; distant-origin, heavily branded “year-round” packs over a qualifying nearby cultivator. Year-round local indoor cultivation itself is not a defect. [Growing and storage](https://smallhold.com/pages/faqs); [cultivated forms](https://www.kingmushroomfarm.com/faq).

BEYOND THE STORE: Local cultivator market pickup is a real option, with posted species and growing practices; it does not require a wild-foraging route. [Market access](https://www.kingmushroomfarm.com/shipping).

SEASON/STORAGE: Fresh mushrooms go in the refrigerator in breathable paper or suitable original packaging; buy an amount usable within days and clean near cooking. Dried products follow their pack storage directions. Cultivated supply does not share one outdoor mushroom season. [Fresh handling](https://www.riverford.co.uk/a-to-z-of-veg/mushrooms); [paper-bag and dried forms](https://www.kingmushroomfarm.com/faq); [indoor cultivation](https://smallhold.com/pages/faqs).

SHARED SKIP LIST: Trapped moisture and sliminess; using cap/gill color as a universal identity or freshness test. “Compostable packaging” does not establish the substrate or every production material. Seasoned dried products and prepared mushrooms route to the global ingredient avoid list. [Species and handling](https://www.riverford.co.uk/a-to-z-of-veg/mushrooms); [substrate/packaging distinctions](https://smallhold.com/pages/faqs).

SHOPPER QUESTIONS the family answers:
- Which culinary species is this, and is it cultivated?
- What growing-medium and spray information is actually disclosed?
- Whole, sliced or dried for the planned dish?
- Paper bag or moisture-trapping storage?
- Is this natural species coloration or deterioration?

SOURCES:
- https://smallhold.com/pages/faqs — organic sawdust/seedhull/grain cultivation, dry paper-bag refrigeration, and retail-pack versus growing-material distinctions; producer reassurance claims not adopted.
- https://www.kingmushroomfarm.com/faq — independent indoor no-pesticide/herbicide disclosure, refrigerated paper-bag storage and dried form.
- https://www.riverford.co.uk/a-to-z-of-veg/mushrooms — cold storage, prompt use, cleaning and species differences.
- https://www.kingmushroomfarm.com/shipping — real market pickup route.
- https://www.westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/ — plain dried organic formulation preference.

ITEM DELTAS:
- `produce_mushrooms`: Restrict the current closed-cap/mild versus open-cap/stronger cue to the button/cremini/portobello context; it is not a rule for oyster, shiitake or other species. Portobello is a mature cremini; naturally dark caps/gills are not automatically deterioration. [Species distinctions](https://www.riverford.co.uk/a-to-z-of-veg/mushrooms). Gap: the checked grower sources do not establish a precise cap-opening flavor scale, so omit that scale rather than promote it to family copy.

## AISLE BRIEFING

- Read “organic” and origin, then any explicit growing-practice disclosure; local, greenhouse and no sprays are different pieces of information. [Organic scope](https://www.law.cornell.edu/cfr/text/7/205.206); [disclosed protected growing](https://www.riverford.co.uk/growers/naturcharc).
- Choose the eating day: F01 can finish at home; F02 should already suit eating. Softening, color change and sweetening are not interchangeable purchase promises. [Avocado readiness](https://californiaavocado.com/how-to/how-to-choose-and-use-an-avocado/); [grape maturity](https://www.earlsorganic.com/blog/california-grapes-are-in-full-swing); [citrus appearance](https://floridaindianrivergroves.com/fundraising/frequently-asked-questions/).
- Inspect bases, stem ends and pack bottoms; favor sound whole produce and use plain organic prepared forms where the item allows them. [Whole heads](https://www.riverford.co.uk/a-to-z-of-veg/lettuce); [grape selection](https://www.earlsorganic.com/blog/california-grapes-are-in-full-swing).
- Assign storage before buying: ripening fruit, refrigerated leaves/heads/pods, dry storage crops, or mushrooms in cold breathable packaging. Apply the item exceptions. [Vegetable storage groups](https://ripleyorganicfarm.com/how-store-your-veggies-make-them-last/); [mushroom handling](https://www.kingmushroomfarm.com/faq).
- Prefer eligible small seasonal sources over distant, heavily branded year-round supply; retain local stored crops and the disclosed living-lettuce/cultivated-mushroom options. [Sourcing framework](https://www.westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/); [living cultivation](https://www.vermillion-farms.com/); [mushroom cultivation](https://smallhold.com/pages/faqs).

**Family disagreements, boundaries and gaps for the builder:**

- **Source hierarchy conflict resolved by the run brief:** FAMILIES.md preserves the current avocado availability exception and warns against a shared organic floor. The later locked stance and both produce research rounds supersede that editorial limitation. All store floors here remain organic; no new health inference from discarded peel or residue rankings is needed. The no-sprays and organic checks remain distinct under the [organic crop standard](https://www.law.cornell.edu/cfr/text/7/205.206).
- **F04 needs a form split:** Propose “whole cured/storage crops” versus “fresh/new/peeled/cut forms” as separate routes within the two existing member cards. If the builder cannot expose this branch, split the storage family rather than publishing one pantry rule for the full card scopes. [Fresh alliums](https://ripleyorganicfarm.com/how-store-your-veggies-make-them-last/); [new/salad potatoes](https://www.riverford.co.uk/a-to-z-of-veg/potatoes).
- **F01 versus F02:** The useful shared distinction is home finishing versus buy-ready. F02 must not claim identical post-harvest biology for every berry and citrus species. The reused sources directly establish grape behavior and ripe-picked berry/citrus selection, but do not validate a species-complete absolute “no later sweetening” statement. Keep that title as a shopping cue, or rename it “Buy at eating quality.” [Grapes](https://www.earlsorganic.com/blog/california-grapes-are-in-full-swing); [berries](https://www.riverford.co.uk/a-to-z-of-veg/strawberries-raspberries); [citrus](https://floridaindianrivergroves.com/fundraising/frequently-asked-questions/).
- **No universal frozen floor:** The earlier rounds did not establish additive-free frozen banana/avocado products; citrus also lacks a shared whole-fruit frozen alternative. Retain whole organic fruit as the F01/F02 common floor and item-specific frozen routes. “Frozen” alone is not an ingredient declaration. [Formulation framework](https://www.westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/).
- **Season and growing system differ:** Soil-grown berries remain a preference, living hydroponic lettuce remains an accepted option, and cultivated mushrooms can use wood/grain substrates. None supports a universal soil-only or fixed-season aisle rule. [Berry method](https://www.riverford.co.uk/a-to-z-of-veg/strawberries-raspberries); [living-lettuce method](https://www.vermillion-farms.com/); [mushroom substrate](https://smallhold.com/pages/faqs).
- **Claims not established by these sources:** A dry berry carton proving recent packing; universally superior nutrition from a color, shape or growing system; no sprouts proving no storage treatment; fixed home shelf lives; and mandatory rewashing of every ready-to-eat pack. Preserve observable condition checks and actual pack directions instead. [Berry handling](https://jonesfamilyfarms.com/seasons/strawberries/caring-your-strawberries); [storage treatments](https://organicfederation.ca/infobio/organic-sprout-inhibitors-potatoes-caught-in-red-tape/); [wash directions](https://www.revolgreens.com/service-product/test-product-faq/).
- **L4 boundaries retained:** Mixed apples/pears, stone/tropical fruits, melons, refrigerated roots and sprouts remain outside these assignments. Do not transfer F01 ripening, F04 pantry storage or F03 leaf handling to those mixed-scope decisions. This is the supplied FAMILIES.md routing boundary, not a new product claim.

All source URLs listed above were found through search in this session and opened; no inaccessible URL is used as verified evidence. No source-level endorsement of a named product or grower is intended.
