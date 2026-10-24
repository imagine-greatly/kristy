# fam-animal — T2 findings

Research date: 2026-10-23. Scope: F08–F11, 23 member cards. Findings for the separate card builder; no KB changes. Inputs: `FAMILY-BRIEF.md`, relevant assignments/flags in `FAMILIES.md`, `groups.json`, consolidated `meat.md`/`meat-r2.md`, `pantryd.md`/`pantryd-r2.md` for nuggets, locked completeness decisions, and current member entries.

The best/close/floor/skip ordering applies the locked editorial stance, not a demonstrated health-outcome ranking. Small, seasonal, local, trusted producers lead; organic remains the floor. Producer names stay out of proposed shopper wording. Linked producer pages document practices or formulations, not recommended products or proof that every product satisfies the whole ladder. Every external URL below was found through live search and opened or attempted this session. Two blocked label references are explicitly `[unverified]`; their legal details remain gaps. Government material supplies label meaning only.

### F08 Grass-finished ruminant meat

RULE (true for all members):

1. **BEST:** look for **“organic” + “100% grass-fed” + explicit grass/forage finishing**, with the supplying small local farm identified on the pack, shelf information or linked farm description. Require the account to cover the finishing ration; grass, hay and browse are compatible with the preferred forage system. This applies to the meat in a frank or organ blend as well as a cut. [S01] [S03] [S06]
2. **CLOSE:** the same organic/no-grain-finish specification with less local husbandry detail, including sealed frozen stock. Freezing does not demote a qualifying source; seasonal harvest can supply the freezer later. [S02]
3. **FLOOR:** **“organic”** ruminant meat in the item's qualifying form, with finish unestablished or explicitly grain-finished, clearly below the 100% forage rung. Organic production does not itself require an exclusively forage diet. This is the retained lower fallback, not permission to call that meat grass-finished. [S03]
4. **SKIP:** non-organic packs and a distant, year-round commercial assortment whose heavy front branding offers only **“natural,” “regenerative,” “grass-fed”** or pasture pictures without the required organic and finishing evidence. These visible traits trigger the stance's sourcing screen; they do not prove a particular farm's practices. [S01] [S03]
5. **ALL FORMS:** identify species and actual recipe. Apply the global ingredient screen to formulated products, but never require every member to be intact, raw, unground or one-ingredient: organ blends and beef franks are members too. [S05] [S06]

BEYOND THE STORE: A small farm's meat CSA, farm pickup or farmers' market can supply individual cuts and seasonal frozen portions. Apply the same product-specific organic/finish check; membership in a farm box is not a sourcing certificate. [S01] [S02]

SEASON/STORAGE: No universal calendar peak or refrigerator duration belongs here. Use the actual package's fresh/frozen and cooking instructions; portion size should fit the intended use. Seasonal frozen meat and fully cooked frozen franks are both documented, so neither “always fresh” nor a raw-ground-meat use window covers the family. [S02] [S06]

SHARED SKIP LIST: Unresolved species/finish claims; undisclosed blend composition; the applicable **global ingredient avoid list in `FAMILIES.md`, “One shared ingredient-list avoid list.”** Keep tenderization in the cut delta and casing/cure in the frank delta. “Water” in a frank recipe is not the same purchase issue as solution added to a raw steak. [S05] [S06] [S10]

SHOPPER QUESTIONS the family answers:

- Does organic mean 100% grass-finished? [S03]
- Does winter hay disqualify the top rung? [S01]
- Can frozen seasonal meat occupy the best rung? [S02]
- Does the farm's organic status cover this exact product or batch? [S01]
- Does the same source check apply to a steak, grind, organ blend and frank? [S05] [S06]

SOURCES:

- [S01] — mixed grazing farm: no-grain beef/lamb, winter forage, product-specific organic status, seasonal poultry/eggs and CSA/market routes; no comparative health claims adopted.
- [S02] — seasonal farm explains freezing harvests and supplying storage/thaw instructions; its absolute “no negative effects” assertion is not adopted.
- [S03] — organic label scope: feed and production requirements; organic differs from 100% forage finishing and from merely buying organic feed.
- [S04] — whole-animal cut guide: muscle structure and cooking method, including beef, pork, sheep and goats.
- [S05] — disclosed beef/organ recipe distinguishes lean/fat ratio from organ percentages.
- [S06] — grass-finished beef frank recipe, water, sheep casing, fully cooked status and frozen supply; example has no listed celery cure.
- [S07] — bison grind: actual lean percentage, no fillers and explicit grass finish.
- [S08] — bison steak descriptions explicitly include ribeye marbling.

[S01]: https://applecreekfarm.me/pages/how-we-farm
[S02]: https://www.farm2fork.co.uk/pages/why-we-freeze-our-meat
[S03]: https://www.ams.usda.gov/grades-standards/organic-standards
[S04]: https://goodmeatproject.org/resources/is-that-cut-tough-or-tender
[S05]: https://millersbiofarm.com/store/product/ancestral-blend
[S06]: https://northstarbison.com/products/beef-hotdogs-100-grass-fed-and-finished
[S07]: https://northstarbison.com/products/bison-ground-100-grass-fed-and-finished?variant=15400973991971
[S08]: https://northstarbison.com/collections/bison-steaks

ITEM DELTAS:

- `beef_grassfed_vs_grainfed`: **NONE** — its sourcing decision is fully carried by the family, including organic versus finishing and winter forage. [S01] [S03]
- `beef_cuts_basics`: **Match the intact cut to the meal:** chuck/shank for a braise; rib/loin steak for quick cooking. Retain the closest-source preference to skip **“mechanically tenderized,” “needle tenderized,” “blade tenderized”**; do not turn chuck/round into a health hierarchy or apply intact-cut rules to ground meat. Cut-to-method is supported; precise mandatory US tenderization-label wording remains an unverified legal detail from the old card, not a new legal assertion. [S04]
- `ground_beef_lean_ratio`: **Read lean/fat and organ shares separately.** “80/20” can describe lean/fat while an organ blend has a separate muscle/liver/heart recipe. Choose beef-only or an intentionally selected blend naming its organs and shares; “ancestral” alone supplies no fixed recipe. Delete the obligatory organ-blend upgrade and default counter request. [S05]
- `lamb_goat`: **For goat, establish forage/browse and no grain finish rather than relying on a grazing picture.** Choose cut and bone-in/boneless form for the recipe; lamb/goat age, grade, flesh or fat color cannot replace the family source check. Do not import a universal spring-buying rule. The old “no goat quality grade” legal statement is not reverified here and is unnecessary to the sourcing delta. [S01] [S04]
- `bison`: **Read “bison” and the actual grind recipe/fat percentage; species alone does not establish finish.** Remove the current categorical “no marbling” assertion: ribeye marbling is documented. Keep the inspection-mark explanation and numerical raw-ground storage window at L4 pending their own label/handling verification, rather than claiming they apply to franks or all F08 meat. [S07] [S08]
- `hot_dogs`: **Beef franks need meat, casing, cure and cooking-status reads.** Choose organic 100% grass-finished beef with a disclosed short recipe; skip phosphate/binder/extender formulations under the global screen. “All beef” does not identify the casing animal; look separately for sheep/pork/collagen. Read “fully cooked” versus cooking directions. Neither water in the emulsion nor “uncured” alone decides quality; some uncured recipes list no celery. A qualifying plain beef burger is the closer-source alternative. [S06] [S09]

### F09 Pastured poultry and pork

RULE (true for all members):

1. **BEST:** look for **“organic” + “pasture-raised,”** a small local farm and written outdoor/rotation and organic-ration details tied to the actual meat. For pigs, a described pasture/woodland rooting system is relevant. Grain supplementation is compatible with this family; do not impose F08's no-grain requirement. [S11] [S12] [S14]
2. **CLOSE:** organic pastured meat meeting the same source/formula checks, with less local or seasonal detail. **“Soy-free”/“corn-free”** can refine specified items, but neither is a universal F09 gate or a substitute for organic. [S11] [S12] [S13]
3. **FLOOR:** **“organic chicken/turkey/duck/pork”** in the relevant plain or minimally formulated form. Finished-product organic status and **“fed organic feed”** are different evidence; a feed statement alone does not establish the whole product's organic status. [S03]
4. **SKIP:** non-organic or unresolved sources; distant year-round, heavily branded packs whose only sourcing cues are **“natural,” “heritage,” “cage-free,” “vegetarian-fed”** or **“non-GMO.”** Treat this as a missing-evidence/stance screen, not an inference that every pictured farm is confined. [S03] [S11] [S12]
5. **ALL FORMS:** check the meat, recipe and cooking/storage status separately. Raw cuts, a hot roasted chicken and frozen breaded nuggets cannot share **“raw,” “one ingredient,” “no breading”** or one storage duration. Added solution and retained processing water are different disclosures; a process word such as **“air-chilled”** cannot replace the recipe read. [S10] [S14] [S17]

BEYOND THE STORE: Small-farm pickup and seasonal poultry batches are real routes; documented frozen whole duck is another. Use the posted source and product descriptions to select a pack; no default farmer interrogation is needed. [S11] [S14]

SEASON/STORAGE: No family-wide harvest month, chilling method or refrigerator window. Carry frozen/raw/ready-to-eat instructions with the item; the family must not apply raw poultry timing to a hot rotisserie bird or infer that breaded frozen nuggets are cooked. Seasonal freezing remains eligible within the source rung. [S02] [S14] [S17]

SHARED SKIP LIST: Undisclosed source/recipe; raw cuts labeled **“enhanced,” “self-basted,” “contains … solution”** when the intended purchase is plain meat. For preparations, use the **global ingredient avoid list** and read subingredients. Do not equate retained chilling water with phosphate injection, or reject every nugget because it has a coating. [S10] [S17]

SHOPPER QUESTIONS the family answers:

- Does pasture-raised poultry or pork mean grass-only feeding? [S11] [S12] [S13]
- Does an organic-feed claim establish organic meat? [S03]
- Can a pasture bird still have a brine, coating or seasoning formula? [S10] [S17]
- Are air chilling, retained water and added solution the same thing? [S10] [S15]
- Can a frozen farm bird qualify, and are frozen prepared products necessarily cooked? [S14] [S17]

SOURCES:

- [S03] — organic production/finished-label scope, used only for label meaning.
- [S09] — traditional shopping criteria: pastured meat preference and preparation screens; a stance source, not proof of health superiority.
- [S10] — niche barbecue process explanation: enhancement, label examples and retained-water distinction; dated legal assertions not adopted.
- [S11] — small mixed farm documents chicken/turkey pasture and organic supplemental feed separately.
- [S12] — pig husbandry account documents woodland/pasture plus organic supplemental ration; does not certify every finished SKU.
- [S13] — turkey feed account separates pasture, organic ration and corn/soy exclusions; no nutrient-ratio promise adopted.
- [S14] — whole frozen duck with daily pasture moves and organic feed.
- [S15] — on-farm poultry processing account describes air chilling; no universal antimicrobial-free claim inferred.
- [S16] — dark-meat turkey grind with a printed lean percentage; composition and fat are separate checks.
- [S17] — whole chicken pieces, arrowroot, spices and coconut oil provide a simple nugget benchmark; no visual-doneness advice adopted.
- [S18] — plain wing protocol: pasture, ration, air chilling and frozen/refrigerated-thaw formats.
- [S19] — traditional duck-fat preference, including soy-free feed as a preference, not a measured product outcome.
- [S20] **[unverified]** — US added-solution/retained-water label reference found by search; opening returned 403. No new mandatory wording or numerical threshold depends on it.

[S09]: https://www.westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/
[S10]: https://www.virtualweberbullet.com/enhanced-meat/
[S11]: https://firstfruitssustainablefarms.com/our-philosophy
[S12]: https://northstarbison.com/pages/why-northstar-pork
[S13]: https://northstarbison.com/pages/why-northstar-turkey
[S14]: https://www.cackleberryfg.com/product-page/pasture-raised-duck
[S15]: https://www.maplewindfarm.com/blogs/clean-food/why-our-processing-unit-matters-for-animals-quality-and-the-future-of-food
[S16]: https://northstarbison.com/products/ground-turkey
[S17]: https://mommypotamus.com/homemade-chicken-nuggets-gluten-free-paleo/
[S18]: https://millersbiofarm.com/store/product/3-pack-chicken-wings
[S19]: https://www.westonaprice.org/health-topics/fats-oils-faq/
[S20]: https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/water-meat-poultry

ITEM DELTAS:

- `chicken_cuts_basics`: **Whole bird first for whole-animal use; bone-in, skin-on thighs or the suitable cut next.** Look separately for **“air-chilled.”** These are use/process preferences, not evidence that boneless meat is unhealthy. Organic corn/soy-free feed can refine the top choice where documented; the family still accepts ordinary organic pasture rations. [S01] [S11] [S15]
- `turkey_whole`: **Look for a plain bird; skip “self-basted,” “injected” or added-solution wording.** Check package weight and fresh/frozen status before choosing; pasture and organic feed do not answer the basting question. Heritage is optional, with no promotion merely for the breed word. Exact compulsory US labeling language remains `[unverified]`. [S10] [S13] [S20]
- `ground_turkey`: **Check the actual fat percentage and stated meat/skin composition, then turkey-only ingredients.** A documented all-dark grind is 95% lean, so dark meat does not establish one fat level. Read patties or seasoned turkey as their own recipe; do not transfer a seller's storage duration to all raw grinds. [S16]
- `chicken_breast`: **Look for “bone-in, skin-on” for the preferred roasting form, or plain boneless breast for the intended dish.** Read air-chilling, retained-water and added-solution information independently; retained water alone does not establish injection. The US legal-disclosure reference is `[unverified]`, while the process distinction is supported. [S10] [S15] [S20]
- `poultry_duck`: **Choose plain whole duck or a named raw cut; look separately for soy-free feed when offered.** Whole frozen duck can meet the husbandry specification. Retain rendered duck fat as a traditional cooking option without a quantified fatty-acid or health promise; prepared confit/smoked duck needs its own recipe and cooking-status check. [S14] [S19]
- `poultry_chicken_wings`: **Choose plain unbreaded wings; distinguish whole wings from split pieces on the pack.** Corn/soy-free feed and air chilling are additional documented preferences. Reject the old universal 3:1-versus-8:1 fat-ratio promise: a feed protocol is not a measurement of the purchased pack. Inspect sauces/coatings under the global screen. [S18]
- `pork_cuts_and_enhanced`: **Plain pork, no added solution; inspect the product name and ingredients together.** Match shoulder/working cuts to slow cooking and loin/chops to quicker methods. Woodland/pasture, organic feed and a breed description are separate checks; soy-free can refine the choice without becoming a family requirement. [S04] [S10] [S12]
- `rotisserie_chicken`: **Target chicken, salt and named herbs/spices with full seasoning ingredients visible.** Choose a qualifying ready-cooked bird or a qualifying raw whole bird to cook at home when the prepared formula/source is unresolved. Do not claim water-second or phosphate presence proves needle injection: enhancement has several methods. Hot holding/preparation-time verification remains a deli L4 gap; steam and browned skin are not evidence supplied by these sources. [S09] [S10]
- `frozen_nuggets`: **Look for explicit whole chicken pieces/whole-muscle tenders, then read batter, breading and every frying-oil sublist.** Home-cut qualifying chicken with a simple coating is the closer-source alternative. “White meat,” “gluten-free,” “air fryer” and the bare name “Chicken Nugget” do not establish the required sourcing or intact-piece specification. Keep raw/fully-cooked status and package cooking instructions with this item; the recipe source does not verify every retail label shortcut. [S17]

### F10 Eggs: pasture plus feed

RULE (true for all members):

1. **BEST:** look for **“organic” + documented pasture access + “corn-free” AND “soy-free” feed**, from a small local flock whose outdoor conditions and ration are described. Apply the words to the selected species/carton; do not transfer a chicken flock's practices to duck or quail eggs. [S11] [S21] [S22]
2. **CLOSE:** organic pasture eggs with **“soy-free”** feed, then organic pasture eggs on an ordinary disclosed organic ration. Corn-free alone does not establish soy-free, and either feed exclusion alone leaves the organic and outdoor checks unresolved. This ordering is a feed preference under the locked stance. [S11] [S21]
3. **FLOOR:** **“organic eggs”** with the species and table-egg identity clear. Organic chicken eggs are the fallback when suitable specialty eggs cannot be established; organic does not mean corn/soy-free. [S03] [S21] [S24]
4. **SKIP:** cracked/leaking eggs and non-organic or unresolved sourcing; distant year-round commercial cartons relying on **“farm fresh,” “cage-free,” “omega-3”** or pastoral imagery without the required feed/outdoor evidence. Housing, feed and supplier transparency require separate checks. [S21]
5. **ALL SPECIES:** inspect carton information and shells; read the product's storage directions and keep refrigerated purchases refrigerated. Do not use a sinking egg as clearance to eat it: floating reflects age, not a reliable contamination test. [S01] [S23]

BEYOND THE STORE: Farm stands, market stalls, local pickup and egg add-ons to vegetable subscriptions are documented routes. Buy explicitly **table/eating eggs**, not hatching stock, and retain the actual batch's washing/storage information. [S01] [S24]

SEASON/STORAGE: No universal laying calendar or ambient-storage permission. Farmed duck eggs may already be washed; some quail flocks stop laying in winter. Use the selected producer's seasonal disclosure and carton instructions, not “farm fresh” as storage guidance. [S24] [S25]

SHARED SKIP LIST: Shell damage, unknown table-versus-hatching identity, feed claims used in place of husbandry, and preserved/flavored eggs mistaken for plain shell eggs. The **global ingredient avoid list** applies to the brine/sauce of a prepared egg product; it is not an ingredient checklist for an intact shell egg. [S21] [S24]

SHOPPER QUESTIONS the family answers:

- Do organic eggs automatically come from corn/soy-free feed? [S03] [S11] [S21]
- Does an outdoor claim actually describe pasture, including for quail? [S21] [S22]
- Can farm eggs already be washed? [S11] [S25]
- Does a sinking egg establish that it is suitable to eat? [S23]
- Are these eating eggs or hatching eggs, and does winter availability vary? [S24]

SOURCES:

- [S03] — organic label scope only.
- [S11] — chicken and duck flocks with pasture and organic corn/soy-free ration; collected/washed eggs. Organic feed is documented, not certification of every finished egg carton.
- [S21] — egg criteria separate outdoor-space quality, flock management, feed and transparency; no named product rankings adopted.
- [S22] — quail producer documents outdoor housing and organic corn/soy-free feed; **does not establish ground access or rotational pasture**.
- [S23] — flock keeper distinguishes age/float behavior from contamination; permissive storage-duration advice elsewhere on the page is not adopted.
- [S24] — table versus hatching quail eggs, organic feed, variable egg size and a winter laying pause.
- [S25] — pastured duck eggs with organic feed, larger size and washing before sale.

[S21]: https://www.cornucopia.org/egg-scorecard-criteria/
[S22]: https://quailguy.net/our-products-and-services/
[S23]: https://www.fresheggsdaily.blog/2012/10/the-float-test.html
[S24]: https://bearhousefarm.com/
[S25]: https://gladeroadgrowing.com/duck-eggs/

ITEM DELTAS:

- `egg_labels`: **NONE for the chicken-egg source ladder** once pasture, organic and separate corn/soy checks sit in the family. The proposed blanket “verify pasture certification” delta should not imply that every seal covers the same practice or that outdoor-space detail is unnecessary; any particular seal's meaning belongs in its label explainer. [S21]
- `egg_duck_quail`: **Read species and “table/eating eggs”; use the recipe's egg quantity by weight where size matters.** Duck eggs are larger; quail sizes vary, so a fixed count is only approximate. Species is not a sourcing upgrade or an allergy-substitution claim. [S24] [S25]
  **Quail boundary gap:** the reopened example proves outdoor housing and feed, not pasture. The top rung remains a look-for specification, not a verified available quail product. If outdoor housing is intended to qualify as the top quail rung, split this combined card into duck-pasture and quail-outdoor branches before publishing; do not silently redefine pasture for the whole family. [S22]

### F11 Prepared pastured meats

RULE (true for all members):

1. **BEST:** look for **“organic” + “pasture-raised,”** an identifiable small local source, named meat/organ species and a fully disclosed short recipe. The species-specific source test still applies: ruminant ingredients inherit F08 finishing; poultry/pork inherit F09 pasture and feed. Preparation never establishes how the animal was raised. [S09] [S12] [S13]
2. **CLOSE:** the same organic pasture-source and recipe specification with less local detail, in a clearly identified roasted, cured, fermented or liver preparation. Choose the least elaborate suitable recipe within that form; do not require every family member to be a whole muscle or salt-cured. [S26] [S27] [S29]
3. **FLOOR:** **“organic”** prepared meat with named species, complete formulation and the item's required ingredient/form checks; pasture/finish details unresolved means a lower rung. “Made with organic …” or an organic-feed story is not the same finished-product claim. [S03]
4. **SKIP:** non-organic or opaque sources; distant year-round commercial packs using **“artisan,” “natural,” “uncured”** or **“no nitrates added”** as their sourcing argument; undeclared recipe detail or the applicable global formulation flags. This is the stance's pack-selection rule, not an allegation about a named maker. [S09] [S28]
5. **ALL FORMS:** read meat, fat, cure/seasoning, allergens and **“ready to eat/fully cooked/cook before eating”** or storage instructions separately. “Uncured” does not decide whether celery was used; named nitrite/ascorbate is not automatically rejected by the traditional guide. There is no family-wide zero-water, zero-sugar or no-culture rule. [S06] [S09] [S26] [S27] [S29]

BEYOND THE STORE: A small local meat producer working with a processor can be a route to prepared products, but the recipe and animal source must both be documented. A seller's general farm story cannot be transferred to every prepared item it stocks. [S30]

SEASON/STORAGE: No shared buying season or unopened shelf-life rule. Read **“Keep Refrigerated”** versus **“Refrigerate After Opening”** and the actual cooking directions; dry curing does not establish one storage method for every format. Pâté may be portion-frozen with a texture change; that is an item option, not a family instruction. [S26] [S29]

SHARED SKIP LIST: Unidentified meat/organs/fats, recipe gaps and unwanted extender/moisture systems; point to the **global ingredient avoid list** for the actual ingredients. Preserve exceptions for declared traditional animal fats, ordinary cure ingredients, salami starter cultures and small curing/fermentation sugar. Turkey bacon's no-added-sugar preference remains item-specific. [S09] [S27] [S29]

SHOPPER QUESTIONS the family answers:

- Does “uncured” mean no curing ingredients or no celery? [S06] [S28]
- Can a traditional cure contain named nitrite, ascorbate or some sugar? [S09]
- Does whole muscle establish no added brine? [S10]
- Are salt-cured, fermented, roasted and liver preparations one recipe? [S26] [S27] [S29]
- Is this ready to eat, and does refrigeration begin before or after opening? [S26]
- Does a farm shop necessarily raise the animals for every prepared product sold there? [S30]

SOURCES:

- [S03] — finished-product organic versus “made with” label scope only.
- [S09] — traditional preference for pasture-source preparations; explicitly accommodates small curing sugar and named nitrite with ascorbate/erythorbate. Its phosphate fallback is stricter in this project's global screen; do not present that project exclusion as agreement among all holistic sources.
- [S10] — enhancement can occur in whole-muscle meat; no injection inference from ingredient order.
- [S26] — traditional charcuterie maker distinguishes ready-to-eat products, rear-leg ham, and “Keep Refrigerated”/“Refrigerate After Opening.”
- [S27] — fermented pork recipe contains culture, dextrose and celery powder, with refrigeration instructions; method/formula example only.
- [S28] — holistic curing discussion supplies the narrow celery-cure distinction; broad disease-risk assurances and quantitative comparisons are excluded.
- [S29] — traditional pâté recipe uses butter/ghee with liver; discusses texture and portion freezing.
- [S30] — turkey-bacon listing separately identifies thigh meat, complete cure and outsourced-product status; used only to demonstrate separate label fields, with no product recommendation or negative named-company claim.
- [S31] — craft butcher describes dry rub versus wet curing; dry cure can include ingredients beyond salt.
- [S32] — traditional whole-leg salt-curing process; no organic/pasture inference from geographical identity.
- [S33] **[unverified]** — US ham product-name reference found by search; opening returned 403. Exact protein/water-category thresholds are not promoted as verified findings.

[S26]: https://delducafood.com/faq/
[S27]: https://shop.smokinggoose.com/collections/salumi/products/spanish-chorizo
[S28]: https://chriskresser.com/the-nitrate-and-nitrite-myth-another-reason-not-to-fear-bacon/comment-page-15/
[S29]: https://nourishedkitchen.com/chicken-liver-pate/
[S30]: https://johnhenrys.net/products/turkey-bacon
[S31]: https://www.truebites.co.uk/blogs/ask-the-butcher/what-is-dry-cured-bacon
[S32]: https://www.prosciuttodiparma.com/en/making-parma-ham/
[S33]: https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/meat-catfish/hams-and-food-safety

ITEM DELTAS:

- `deli_meat_uncured`: **Prefer a whole roast with a disclosed simple recipe, sliced for sandwiches.** Whole muscle can still be enhanced. Distinguish an ordinary uncured roast from a celery-cured preparation; delete “uncured meat is always cured with celery.” Home roasting is a process alternative only when its own recipe also qualifies. [S10] [S28]
- `bacon`: **Look for a disclosed short dry cure; read smoking and cure ingredients separately.** Dry-cured describes method, not automatic absence of sugar/nitrite. A short disclosed wet cure is a lower process preference, not a demonstrated health disadvantage. Fresh pork belly is a closer-source alternative, not another kind of bacon. [S09] [S31]
- `ham`: **Separate raw fresh leg, cooked slicing ham and ready-to-eat dry-cured ham.** Within cured ham, prefer qualifying whole-muscle dry cure, then qualifying plain cooked ham with a short disclosed brine; skip glaze/formed water-product formulations under the item's screen. Do not use bare “Ham” as proof of zero added water. Exact “Ham / natural juices / water added / ham and water product” legal thresholds remain `[unverified]`; retain the full ingredient read. [S26] [S32] [S33]
- `turkey_bacon`: **Read the named turkey meat, intact-versus-formed description and complete cure independently; retain “no added sugar” as this item's preference.** “Thigh meat” does not establish intact strips or a simple cure. Plain qualifying turkey cooked at home is the closer-source alternative. No reopened source verifies a stocked SKU satisfying organic, pasture, no added sugar and every formulation exclusion together; retain this as a look-for specification. [S13] [S30]
- `cured_pork`: **Separate whole-muscle dry cure from fermented ground salami; read the actual cut and cooking status.** Whole-leg pork-and-salt curing is documented, so additional curing salts are not universal. A declared salami starter culture and small fermentation sugar are compatible with the traditional-process branch; celery powder still needs recognition as a curing ingredient. Do not make whole-muscle or no-culture a family rule. [S26] [S27] [S32]
- `deli_liverwurst_pate`: **Name the liver/other organs and the fat; same-species fat is unnecessary.** Butter/ghee or suitable traditional poultry/pork fat can be part of the recipe; read dairy/egg and other allergens. Do not require liver-first or transfer a sausage category's minimum-liver percentage to every pâté. Fresh spread, sliceable sausage and sealed shelf-stable products need their own storage directions; pâté freezing may change texture. [S29]

AISLE BRIEFING

1. **Meat & eggs:** choose the source first—100% forage finish for F08; pasture and organic ration for F09/F10; then inspect the specific cut, carton or recipe. [S03] [S11] [S12]
2. Organic, pasture, feed exclusions and meat form are separate checks; front pictures and a local address cannot supply missing product evidence. [S03] [S21] [S30]
3. Frozen seasonal meat can retain its sourcing rung. Match cooking and storage instructions to raw, hot-cooked, frozen-prepared or cured format. [S02] [S06] [S26]
4. **Deli/frozen crossover:** F09 owns rotisserie/nugget sourcing, F08 owns beef-frank sourcing, and F11 owns other prepared meats; the applicable item delta carries coatings, curing and cooking status. [S06] [S17] [S27]
5. **Shelf action:** read the selected pack and its full subingredients; use the global screen with the cure/culture exceptions. Staffed-butcher clarification is optional for a genuinely counter-sold cut, not the default shopping step. [S04] [S09] [S27]

FAMILY DISAGREEMENTS / GAPS FOR THE BUILDER:

- **F08 title versus floor:** the retained organic fallback can be grain-finished. Keep that explicitly a lower alternative, or rename the family “Ruminant meat: grass-finished first”; do not claim every fallback meets the heading. The close rung keeps the same finish standard. [S03]
- **F09/F10 feed:** organic corn/soy-free is an upper preference for selected poultry/egg items, not F09's universal rule. A corn/soy-free ration can contain other seeds/meals; it cannot substantiate a fixed fat profile. [S13] [S18]
- **F10 quail:** outdoor housing is documented; actual pasture remains unestablished in the reopened quail source. Preserve the gap or split the housing branches. [S22]
- **F11 species/form:** beef deli roast or beef liverwurst cannot inherit a pig-feed rule; poultry and pork cannot inherit grass-only feeding. Roast, dry cure, fermented salami and pâté need separate form deltas. Split F11 by preparation only if a future family rule insists on whole muscle, salt curing or another non-shared process. [S03] [S09] [S27] [S29]
- **Preserve the source disagreements:** the traditional guide permits small curing sugar, nitrite with antioxidants and a phosphate-containing lower tier; the project screen is stricter on phosphates. Keep the preference explicit and do not invent universal source agreement or health claims. [S09]
- **Verification boundaries:** US solution and ham legal references were blocked; bison inspection, goat grading, mandatory tenderization wording and precise holding/storage times were not newly established. These are L4 gaps, not reasons to infer a shelf-life, legal guarantee or health outcome from appearance. [S20] [S33]
