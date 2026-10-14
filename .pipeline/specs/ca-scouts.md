# Card-align scouts S1-S5, S9-S11 (Explore haiku, 2026-10-14, read-only). VERIFIED = line read.

S1 VERIFIED. server/lib/counterCardLint.js
- beef_raising: owner beef_grassfed_vs_grainfed; family [ground_beef_lean_ratio, ground_beef_organ_blend, beef_cuts_basics, butcher_counter_asking, judging_meat_at_the_case, organ_meats, pick_soup_bones]; pattern grass/grain-fed-finished (:1549-1552)
- milk_processing: owner whole_vs_reduced_fat_milk; family [plain_kefir, cream_cheese, goat_sheep_dairy, grassfed_butter, ghee]; pattern ultra-pasteurized|homogenized (:1568-1569)
- ruminant_grass_term: owner label_grass_fed_term; family [lamb_goat, bison, venison_game, goat_sheep_dairy] (:1553-1554)
- bird_pig_raising: owner label_pasture_raised_feed; family [chicken_cuts_basics, pork_cuts_and_enhanced] (:1561-1562)
- live_ferment: owner sauerkraut; family [kimchi, miso, fermented_pickles, olives] (:1574-1575)
- CO_EQUAL regex :113; EXCLUSIVITY regex :298; HEADLINE_HEDGED emitted :1014 via headlineHedge() :517; OBSERVABLE_IN_BOTH emitted :1202 via sharedObservables() :729.
- lintCulinaryAim :1527 checks decision :1533, cart_pick :1535, pick_steps :1536-1538. lintCorpus :1269; lintRepeatedClaim :1595.
- Test file: server/lib/counterCardLint.test.js

S2 VERIFIED (correction: plan's CATEGORY_SECTION is the wrong symbol).
- Category->section map: SECTION_BY_CATEGORY server/lib/counterCards.js:40-44, built from PERIMETER_SECTIONS server/lib/perimeter.js:301; sectionForCategory counterCards.js:47.
- produce->produce (:306); beef, poultry, pork, deli, meat_counter->meat (:324); seafood (:338); poultry_eggs, dairy->eggs_dairy (:351); bulk_pantry (:364); label_terms (:383).
- listMatch.js:81-84 CATEGORY_SECTION is a different, list-only map.
- No cycle: counterCardLint.js already imports counterCards.js (:35) and listMatch.js (:36); none import counterCardLint.

S3 VERIFIED.
- server/lib/sectionRules.json (6: produce, meat, seafood, eggs_dairy, bulk_pantry, frozen; each has sources); sectionRules.js SECTIONS :5, key-set comment :9, push drops sources :20.
- Tests: server/test/sectionRules.test.js (4 checks rejected :37; route payload :43-46); server/test/sectionRulesContent.test.js (ALLOWED key set :8; >=5 sections :17; order :21; checks <=3 :28; 1-8 words/check :29; sources exist in KB :33-36); server/test/acceptance/ic3a.test.js (:88 count>=6 + sources exist; :89 produce sources deepEqual ['produce_ripeness_by_item']); ic6a.test.js:109-110 path only.
- No test pins exact rule/check text. Nothing at runtime or iOS reads sources (route strips them; iOS SectionRule CounterModels.swift:259-263).

S4 VERIFIED.
- passRule: server/test/acceptance/passRule.js; HEALTH_FIRST_REWRITE :11; ITEM_CARD_REWRITE :22.
- k14 C12 anchor: server/test/acceptance/k14.test.js:151
- RETIRED counterCards.js:92; RETIRED_GENERATED :196; ESSENTIALS :259-267 (organic_worth_it_by_type, egg_labels, salmon_wild_vs_farmed, label_front_vs_back, produce_ripeness_by_item, beef_grassfed_vs_grainfed, judging_meat_at_the_case, whole_vs_reduced_fat_milk).
- counterReach: server/lib/counterReach.test.js. Migration dry-run flag: --dry-run (migrateCounterCards.js:213).

S5 VERIFIED (code/tests; docs and .pipeline/specs omitted).
- ground_beef_organ_blend: counterCardLint.js:1550; doLines.json:65; tryPool.js:5; tryPool.test.js:37; counterCardLint.test.js:419; test/ktight.test.js:14; acceptance/k9.test.js:18; ic5b.test.js:20; k15.test.js:42. iOS none.
- pick_milk: test/counterProbe48.test.js:184-185; lib/trips.test.js:193. iOS none.
- chicken_breast: list.js:120-122 (perimeterId), :344,366,370,378; listImport.js:78; counterCardLint.js:1564; doLines.json:23; ktight.test.js:15; counterProbe48.test.js:20,137-138; acceptance/ic4achicken.test.js:42-43,69-72,101; ic4b.test.js:97-103. iOS none.
- Fixture copies: test/acceptance/fixtures/kb-pre-readability.json.

S9 VERIFIED.
- label_cold_pressed_expeller pick_steps :4413 "Pick olive, avocado or coconut oil first" — RECOMMENDS avocado oil (conflicts D7).
- nuts_raw_vs_roasted :1739/:1743 and pastries_muffins :8568/:8572 name seed oils as warnings.
- organic_worth_it_by_type :822, produce_storage :3477: avocado the fruit, fine.
- canned_fish_choosing :2995 short_answer mentions soybean tins — stance UNVERIFIED.

S10 VERIFIED. ~/kristy-corpus branch corpus: no commits beyond main touching KB, sectionRules.json, doLines.json.

S11 VERIFIED.
- cart_pick readers: perimeter.js:145 (typeContradicts), :274 (publicEntry), :410 (topicCard); counterCardLint.js:829 (PICK_FORBIDDEN_FIELDS), :1535 (lintCulinaryAim); Tools/listvocab/build.js:43.
- iOS decodes cta_item, not cart_pick (CounterModels.swift:94,154; CounterSummaryCache.swift:78,93; CounterCardView.swift:126,:325-326). Server cart_pick->cta_item mapping NOT_FOUND by scout (check publicEntry :274).
- Name->slug: matchItemToCard(name) listMatch.js:202 (cardForItem :354); matchItemToPick :229.

S6, S7 not run (S7 folded into CA-2 researcher; S6 left to planner to read directly).
