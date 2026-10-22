# Completeness research: pantry-b (last 45 bulk_pantry cards, lard_tallow .. pick_fruit_snacks)

Findings only. No KB, code or tests edited, nothing committed. Researcher: Sonnet agent, 2026-10-22.

## 1. What failed or was not fetched (read first)
- Hummus source (naturopathicearth.com/2017/11/07/hummus/): scrapling bulk_get errored twice (once in a 4-URL batch, once alone). NOT FETCHED, NOT CITED.
- The 4-URL batch (WAPF shopping guide, WAPF pantry intervention, naturopathicearth hummus, WAPF HVP full story) errored twice as a batch. The first two were then fetched singly (status 200). The WAPF HVP page was never fetched, so it is not cited.
- No holistic fetch was made for: vinegar, jam, mayo, olives (beyond the existing McEvoy file), hummus, frozen foods, deli, pretzels, trail mix, canned soup sodium, dried fruit, dried herbs, popcorn technique, fresh pasta. Where WAPF's shopping guide has a category line, it is used (section 4); otherwise the card is marked unsourced this pass.
- Exa was used only to discover URLs. Nothing in this report rests on an Exa snippet.
- Existing files in the folder (6) were vetted as holistic and kept. leadsafemama-cocoa.md is an independent lead-testing advocate (tamararubin.com); treat its "testing" framing as borderline and do not use it as a verdict source.
- wapf-great-iodine-debate.md and wapf-shopping-guide-categories.md include reader comments; those are not WAPF positions.
- Budget: about 30 tool calls used of about 40.

## 2. Archive files (archive/completeness/pantry-b/, URL on line 1 of each)
Kept from earlier run: leadsafemama-cocoa.md, mcevoy-fake-olive-oil.md, octavia-loose-leaf-tea.md, wapf-faq-fats-oils.md, wapf-faq-grains-nuts.md, wapf-rendering-lard-tallow.md.
New this pass:
- kresser-coconut-milk.md (chriskresser.com/3-reasons-why-coconut-milk-may-not-be-your-friend/): BPA in cans, BPA-free brands, guar gum.
- kresser-guar-gum.md (chriskresser.com/harmful-or-harmless-guar-gum-locust-bean-gum-and-more/): gum ranking.
- kresser-bpa-free-plastics.md (chriskresser.com/re-examining-the-evidence-on-bpa-and-bpa-free-plastics/): BPS/TPP substitutes are estrogenic; avoid cans.
- drberg-nutritional-yeast.md (drberg.com/blog/fortified-vs-non-fortified-nutritional-yeast).
- wapf-great-iodine-debate.md (westonaprice.org/.../the-great-iodine-debate/): seaweed iodine varies by species and drying.
- wapf-guide-to-superfoods.md (westonaprice.org/.../guide-to-superfoods/): yeast low-temperature processed; kelp "don't overdo".
- wapf-shopping-guide-categories.md (westonaprice.org/.../shopping-guide-categories/): BEST/GOOD/AVOID for condiments, snacks, sweeteners, beverages, soups, spices, crackers, nuts, fats, produce.
- wapf-pantry-intervention.md (westonaprice.org/pantry-intervention-video-by-sarah-pope-2/): canned BPA, canned soup MSG, "soy sauce is fine if traditionally brewed", frozen dinners MSG.

## 3. Mainstream-reassurance phrase grep (45 cards, all fields incl. sources)
- Exact phrases ("safe levels", "buy conventional", "considered safe", "FDA says", "low-residue", "just as good", "broadly comparable"): ZERO hits in short_answer, detail, why, decision, watch_out, kristy_take.
- Related items found (not the listed phrases, but same register; Devon decides):
  - potato_chips buying_tips: "In USDA residue testing, about 98 percent of fresh potato samples carried at least one pesticide." Government statistic used as the reason for organic. Direction is right, source type is government.
  - canned_soup / canned_coconut_milk watch_out: "BPA-free is the maker's word. EWG's survey found makers define it as they wish." Consistent with Kresser and WAPF (BPA substitutes). Cited source is EWG, a mainstream-adjacent advocacy outlet, not on the holistic list.
  - sources[] arrays are heavily government, extension, standards-of-identity and mainstream (cornell CFR, USDA AMS, FDA guidance, Iowa State, Clemson, UF IFAS, America's Test Kitchen, CSPI, EWG). By a domain regex for the holistic sites I fetched, only 0-1 of each card's URLs match (lard_tallow 0/4, hummus 0/8, vinegar 0/8, frozen_meals 0/9). I did not classify the rest by hand. The regex hits on crackers, tortilla_chips, potato_chips, popcorn, snack_bars, frozen_fries, frozen_nuggets, mayo were not inspected.
  - That is raw label-meaning use (allowed); the gap is that no card carries a holistic source for its "pick" direction.

## 4. Per card (COMPLETE needs decision dialed AND holistic source in archive; none qualify on source alone, so most are GAP-source)
Legend: DIRECTION OK = card pick matches what a holistic source in the archive says. GAP = difference or addition the holistic sources support.

- lard_tallow: DIRECTION OK. WAPF fats best is pastured lard, tallow and suet from grass-fed animals (shopping guide; wapf-rendering-lard-tallow.md, wapf-faq-fats-oils.md). Add pasture/grass-fed as the pick criterion if the card lacks it. Source: wapf-shopping-guide-categories.md.
- cocoa: GAP. WAPF guide marks chocolate, cocoa and cacao as AVOID in breads, crackers, snacks, beverages, ice cream. Card says only "one ingredient: cocoa". Lead/cadmium note in leadsafemama-cocoa.md (borderline source). Devon decision on stance.
- seeds: DIRECTION OK in part. WAPF: raw organic seeds in sealed packages not bins, soaked and dried; hemp seeds avoid. Check card covers soaking and bins. Source: wapf-shopping-guide-categories.md, wapf-faq-grains-nuts.md.
- dried_fruit: unsourced this pass. WAPF guide has no dried-fruit line; sweeteners AVOID "concentrated fruit juices", jam with citric/ascorbic acid.
- nutritional_yeast: GAP. Holistic point is low-temperature processed, and fortified vs unfortified (check the list shows yeast only). Sources: wapf-guide-to-superfoods.md, drberg-nutritional-yeast.md.
- canned_coconut_milk: DIRECTION OK. BPA lining, BPA-free brand named (Native Forest, Arroy-D), guar gum is a concern, homemade is an option; WAPF GOOD is whole canned coconut milk without additives, not aseptic boxes. Sources: kresser-coconut-milk.md, kresser-guar-gum.md, kresser-bpa-free-plastics.md, wapf-shopping-guide-categories.md. Card could add: take a list with no gum, and note that "BPA-free" linings (BPS) are not neutral.
- dried_herbs: GAP. WAPF: non-irradiated, no additives, avoid herbs from China (even organic). Source: wapf-shopping-guide-categories.md.
- tea: DIRECTION OK on loose leaf (octavia-loose-leaf-tea.md). Note WAPF guide lists tea as AVOID except organic black tea for kombucha; Devon decision on whether tea stays a pick card or gets a caffeine note.
- vinegar: GAP-source. WAPF BEST is organic raw vinegar and aged balsamic; GOOD is pasteurized without natural flavors or caramel; AVOID distilled. Source: wapf-shopping-guide-categories.md.
- pasta_sauce: GAP. WAPF: canned tomato products organic, no sugar, no citric acid, BPA-free container, not aseptic boxes. Source: wapf-shopping-guide-categories.md (fruits and vegetables line).
- jam: GAP. WAPF GOOD is organic jam with natural sweeteners and no ascorbic or citric acid; AVOID sugar-sweetened. Source: wapf-shopping-guide-categories.md (sweeteners).
- ketchup_mustard: GAP. WAPF BEST is organic fermented ketchup; GOOD is ketchup sweetened with organic sugar or natural sweeteners; AVOID most commercial ketchup. Card's "unsweetened" pick is stricter than WAPF's GOOD. Source: wapf-shopping-guide-categories.md.
- mayo: unsourced this pass. Olive-oil pick fits wapf-faq-fats-oils.md and mcevoy-fake-olive-oil.md (olive oil fraud).
- hot_soy_sauce: DIRECTION OK. Traditionally brewed matches WAPF ("Soy sauce is fine if it is traditionally brewed", wapf-pantry-intervention.md) and BEST/GOOD lists. Add: avoid liquid amino acids and hydrolyzed protein (MSG). Source: wapf-shopping-guide-categories.md.
- canned_soup: GAP. WAPF: most canned soups are loaded with MSG; BPA in lining; best is bone broth; GOOD is GMO-free canned broth without additives. Card focuses on sodium. Source: wapf-pantry-intervention.md, wapf-shopping-guide-categories.md.
- olives: partially sourced. McEvoy file covers olive oil fraud only, not table olives. GAP-source.
- seaweed: GAP. Iodine varies hugely by species and drying; kelp "don't overdo". WAPF guide avoids seaweed from China. Card already asks for the kind named (DIRECTION OK). Source: wapf-great-iodine-debate.md, wapf-guide-to-superfoods.md, wapf-shopping-guide-categories.md.
- salsa: unsourced. WAPF has lacto-fermented vegetables BEST (unheated, glass jars, unrefined salt/culture, not vinegar). Source: wapf-shopping-guide-categories.md.
- coconut_water: GAP-source. WAPF BEST lists coconut water "extracted from fresh coconuts". Card's pick is high-pressure processed. No holistic source on HPP in archive; do not assert.
- condiments: GAP, same as ketchup_mustard.
- crackers: GAP. WAPF BEST is sourdough, soaked or sprouted; GOOD organic whole grain; AVOID non-organic, soy flour, unsoaked quinoa, agave. Source: wapf-shopping-guide-categories.md.
- tortilla_chips, potato_chips: GAP. WAPF BEST is organic chips cooked in pastured lard, ghee, coconut or palm oil; GOOD includes olive/avocado/high-oleic oils. Note: card's popcorn and snack_bars watch_out says avocado oil purity cannot be proven, WAPF GOOD says avocado oil "tested pure". Source: wapf-shopping-guide-categories.md.
- popcorn: DIRECTION OK. Plain kernels popped at home in coconut oil; WAPF BEST is home-popped in lard, ghee, coconut or palm oil; AVOID microwave popcorn. Source: wapf-shopping-guide-categories.md.
- pretzels: unsourced.
- snack_bars: GAP. WAPF AVOID granola bars and energy bars (soy protein), most commercial bars. Card's pick is "oat bars, oats first". Devon decision. Source: wapf-shopping-guide-categories.md.
- trail_mix, snacks: unsourced (nuts and seeds line in WAPF applies).
- hummus: unsourced (hummus fetch failed).
- deli_salads, prepared_meals, fresh_pasta, deli: unsourced.
- frozen_pizza, frozen_meals, frozen_fries, frozen_waffles, frozen_nuggets, frozen: GAP. WAPF says frozen dinners are a major MSG source; no holistic page fetched on frozen foods. Source: wapf-pantry-intervention.md.
- pick_artificial_sweetener: DIRECTION OK. Pure maple syrup; WAPF BEST lists maple syrup, and AVOID sucralose, aspartame, stevia extracts, sugar alcohols, agave. Source: wapf-shopping-guide-categories.md.
- pick_shortening: DIRECTION OK in spirit (WAPF AVOID all shortenings; BEST lard/tallow/palm). Source: wapf-shopping-guide-categories.md, wapf-faq-fats-oils.md.
- pick_soda, pick_sports_drink, pick_energy_drink: GAP. WAPF AVOID soft drinks, juices, flavored/added-vitamin drinks, caffeine; BEST kombucha, kvass, plain mineral water. Source: wapf-shopping-guide-categories.md.
- pick_fruit_snacks: GAP-source. WAPF AVOID concentrated fruit juices; no direct fruit snack line.

## 5. Net for Devon
- No card is COMPLETE on sourcing: every card's sources[] is government, extension or mainstream, and the archive now holds holistic support for about 25 of 45.
- Biggest direction questions (WAPF vs card): cocoa, tea, snack_bars, ketchup (unsweetened vs fermented), coconut_water (HPP vs fresh), avocado oil purity, canned_soup (MSG not only sodium).
- Not done: 20 cards with no holistic source fetched.

## Wave 3 (2026-10-22): holistic sources and RECOMMENDED CALL per unsourced card
Findings only. All claims are attributed to the source; none are Kristy's.

### W3.1 Failed or not fetched (first)
- naturopathicearth hummus: failed twice earlier, still NOT FETCHED. WAPF HVP page: never fetched, not cited.
- No holistic page was fetched for: dried fruit (the only hits were Bon Appetit, ATK, Saveur, diet-health.info: all non-holistic, rejected), pretzels, fresh pasta, deli salads, frozen fries, frozen waffles, frozen meals, tea/cocoa beyond existing files, coconut water HPP, olive oil grades beyond McEvoy, Sisson, Cultured Food Life. Those cards stay GAP.
- First bulk_get of the last three pages saved under shifted names; renamed and re-checked, URL on line 1 of all 25 files.
- Budget: about 24 tool calls of 45.

### W3.2 New archive files (URL on line 1; all status 200)
wapf-healthy-snacks-sarah-pope, nourishedkitchen-sprouted-hummus, nourishedkitchen-unrefined-fats-oils, tcs-healthy-mayonnaise, wapf-principles-healthy-diets, wapf-salt-cured-beef-lunch-meat, tcs-lacto-fermented-ketchup, nourishedkitchen-fermented-salsa, wapf-sourdough-pizza-dough, mommypotamus-chicken-nuggets, wapf-faq-grains-seeds-nuts-beans (all .md in archive/completeness/pantry-b/).

### W3.3 Wording to flag (attribute, never repeat as Kristy voice)
- wapf-principles-healthy-diets.md: MSG/HVP and caffeine framed as "neurotoxins"/"toxic"; disease-adjacent. wapf-healthy-snacks-sarah-pope.md and the sourdough/grains FAQ: "anti-nutrients", gluten "toxic" for some. All advocacy claims; card copy must stay mechanical (no treat/prevent wording, claim lock 2, 3).
- nourishedkitchen-sprouted-hummus.md: raw sprouted legumes warned against by the author; a pick-rule, not a cure claim.

### W3.4 Per card (COMPLETE needs decision dialed AND a holistic source; GAP says what is missing)
- mayo: SOURCED. TCS: egg yolks plus cold- or expeller-pressed olive, coconut or avocado oil. CALL: pick mayo whose oil is olive or avocado, no soybean/canola; for the egg-and-oil list shorter is better. File: tcs-healthy-mayonnaise.md (also nourishedkitchen-unrefined-fats-oils.md rejects canola/grapeseed/rice bran).
- hummus: SOURCED. Nourished Kitchen: chickpeas cooked (sprouted then cooked), tahini, extra virgin olive oil, lemon, garlic. CALL: take the list that is chickpeas, tahini, olive oil, lemon, garlic; pass on soybean/canola oil and preservatives. File: nourishedkitchen-sprouted-hummus.md.
- salsa: SOURCED. Nourished Kitchen fermented salsa; WAPF BEST is lacto-fermented, unheated. CALL: refrigerated or fermented salsa, vegetables first, no vinegar-heat-stable shelf version as the top pick. Files: nourishedkitchen-fermented-salsa.md, wapf-shopping-guide-categories.md.
- ketchup_mustard / condiments: SOURCED. TCS fermented ketchup (tomato paste, whey, raw ACV, maple/honey); WAPF BEST organic fermented ketchup, GOOD organic-sugar or natural-sweetener ketchup, AVOID most commercial. CALL: fermented or organic ketchup with a named natural sweetener and no HFCS; mustard organic. Files: tcs-lacto-fermented-ketchup.md, wapf-shopping-guide-categories.md. Card's "unsweetened" is stricter than WAPF GOOD; Devon call.
- trail_mix / snacks: SOURCED. Sarah Pope (WAPF): trail mix of soaked and dried nuts with raisins, dried cranberries, unsulphured apricots; bought crackers/cookies carry rancid oils. CALL: raw or soaked nuts plus dried fruit with no sulfur, no added oil, sugar or candy pieces. File: wapf-healthy-snacks-sarah-pope.md.
- dried_fruit: PARTIAL. Only the "unsulphured apricots" point (Pope) and WAPF Best "no added sugar, oil, additives, preservatives, not from China" (shopping guide line 269). CALL: dried fruit with one ingredient, unsulphured, no oil or sugar coating, not from China. Files: wapf-healthy-snacks-sarah-pope.md, wapf-shopping-guide-categories.md.
- cooking_oils / avocado oil: SOURCED. Nourished Kitchen favors extra virgin olive, virgin coconut, pastured lard, butter, ghee; avoids grapeseed, canola, rice bran. WAPF principles list EVOO, sesame, flax, coconut, palm. CALL: olive or coconut for heat tolerance of choice, pastured lard or tallow where a neutral fat is needed; seed oils not picked. Avocado oil: TCS accepts it for mayo; WAPF GOOD lists it for chips; purity doubt on card is not a holistic source point, leave as is. Files: nourishedkitchen-unrefined-fats-oils.md, wapf-principles-healthy-diets.md, wapf-faq-fats-oils.md.
- olive_oil_grades: GAP-partial. McEvoy covers fraud, not grades. CALL: extra virgin only, from a named producer with a harvest date. File: mcevoy-fake-olive-oil.md.
- deli / prepared_meals: PARTIAL. WAPF lists highly processed lunch meats and canned foods under dietary dangers; homemade salt-cured beef or pork named; packaged naturally-cured options named in the page as Epic, Grassland, US Wellness. CALL: whole-muscle meat cured with salt only, from pasture-raised animals; skip meat with HVP, MSG, corn syrup. Files: wapf-salt-cured-beef-lunch-meat.md, wapf-principles-healthy-diets.md.
- canned_soup: SOURCED. WAPF: most canned soups carry MSG/HVP; BPA lining; BEST bone broth, GOOD GMO-free canned broth without additives. CALL: bone-broth based, ingredient list with no "yeast extract", "hydrolyzed" or "natural flavor"; BPA-free is not neutral (Kresser). Files: wapf-pantry-intervention.md, wapf-shopping-guide-categories.md, kresser-bpa-free-plastics.md.
- cocoa: AVOID per WAPF guide (caffeine, habit). CALL: if bought, a plain cocoa with one ingredient, small amounts; lead/cadmium note is from an independent advocate (borderline). Files: wapf-shopping-guide-categories.md, leadsafemama-cocoa.md.
- tea: SOURCED partly. WAPF guide: tea AVOID except organic black for kombucha, herb teas GOOD in moderation. CALL: loose-leaf, single herb or plain leaf, organic. Files: wapf-shopping-guide-categories.md, octavia-loose-leaf-tea.md.
- snack_bars: AVOID per WAPF (granola and energy bars, soy protein). CALL: only bars whose list is nuts, seeds, dates, nothing else; granola bar styles are not a pick. File: wapf-shopping-guide-categories.md.
- coconut_water: GAP on HPP. WAPF BEST is water from fresh coconuts, GOOD canned (not aseptic box). CALL: fresh coconut water, else canned, ingredient list "coconut water" only. HPP point has no holistic source: do not assert. File: wapf-shopping-guide-categories.md.
- pretzels: GAP. Closest source is WAPF snack guide (chips and snacks cooked in good fats, organic grain, AVOID non-organic grain). CALL tentative: organic, sourdough if offered. File: wapf-shopping-guide-categories.md.
- fresh_pasta: GAP. Only the shopping-guide pasta line (organic whole grain, buckwheat, corn, brown rice, legume) and the grains FAQ (sourdough best, commercial sprouted breads doubted). CALL tentative: organic, fewest ingredients. Files: wapf-shopping-guide-categories.md, wapf-faq-grains-seeds-nuts-beans.md.
- frozen_pizza: PARTIAL. WAPF sourdough pizza (sprouted flour, starter, olive oil, sea salt, fresh mozzarella). CALL: a crust listing sourdough or sprouted flour, olive oil, real mozzarella; nothing packaged that lists soybean oil or HVP. Files: wapf-sourdough-pizza-dough.md, wapf-pantry-intervention.md.
- frozen_nuggets: PARTIAL. Mommypotamus nuggets: chicken, arrowroot, paprika, salt, onion powder, coconut oil. CALL: whole chicken pieces only, minimal coating, fried in coconut oil or lard; read the breading list. File: mommypotamus-chicken-nuggets.md.
- frozen_meals / frozen: PARTIAL. WAPF: frozen dinners a major MSG source. CALL: frozen whole vegetables, fish or meat with no sauce; frozen fruit and vegetables without ascorbic or citric acid. Files: wapf-pantry-intervention.md, wapf-shopping-guide-categories.md.
- frozen_fries, frozen_waffles, deli_salads: GAP, no holistic page fetched. Chip-oil line (WAPF: lard, ghee, coconut, palm, or avocado/olive GOOD) is the only usable one for fries. File: wapf-shopping-guide-categories.md.

### W3.5 Net
- Newly sourced and executable: mayo, hummus, salsa, ketchup_mustard/condiments, trail_mix/snacks, cooking_oils, canned_soup. Partial: dried_fruit, deli/prepared, frozen group. GAP: pretzels, fresh_pasta, frozen_fries, frozen_waffles, deli_salads, olive_oil_grades, coconut_water HPP.
- Devon calls: cocoa and tea stay cards or get a caffeine note; snack_bars pick vs WAPF AVOID; ketchup unsweetened vs fermented/organic-sugar.
