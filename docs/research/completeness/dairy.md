# Completeness: dairy (23 cards, 2026-10-22). Findings only; no KB edits.

## Failed / not fetched (first)
- Six guessed WAPF URLs (ghee-and-clarified-butter, the-skinny-on-fats-and-dairy, the-great-ice-cream-scoop, carrageenan, dairy/a2-milk, the-case-for-butter) all returned 404. Not used, nothing saved.
- Shopping-Guide-2025.pdf: bulk_get errored on the PDF; its text appears only as search highlights (not archived). Not cited. The shopping-guide-categories page (archived) carries the same BEST/GOOD/AVOID text for milk, cheese, cream, yogurt/kefir, butter/ghee, ice cream.
- Not found from holistic sources: carrageenan/gums in dairy, cultured butter vs sweet, sour cream/cream cheese specifics beyond the WAPF categories, A2 beyond WAPF FAQ. Cornucopia cottage-cheese PDF surfaced in search: excluded by brief, not fetched.
- Not checked: whether any dairy card text is wrong against federal definitions (out of scope).

## Archive (archive/completeness/dairy/, URL on line 1 of each)
Pre-existing, read and kept (all holistic; Cornucopia files were already deleted):
- wapf-faq-dairy.md (westonaprice.org/health-topics/faq-dairy/)
- wapf-principles-traditional-diets.md, wapf-values-fat-soluble-activators.md, wapf-xfactor-k2.md
- realmilk-brochure.md, realmilk-questions-for-farmer.md
Added this pass:
- wapf-shopping-guide-categories.md (westonaprice.org/health-topics/abcs-of-nutrition/shopping-guide-categories/)
- foodrenegade-healthy-cheese.md (foodrenegade.com/healthy-cheese-what-to-buy/)
Both new files are full page dumps incl. nav and comments.

## Reassurance grep (short_answer, detail, why, decision, watch_out, kristy_take, buying_tips, science, labels_decoded)
Searched: safe levels, buy conventional, considered safe, FDA says, low-residue, just as good, broadly comparable, equivalent, no difference, similar.
- No hits on the listed mainstream-reassurance phrases in any dairy card.
- almond_milk why: "FDA does not count almond drinks in the dairy group. Their overall nutrition is not similar to milk." (also detail, science, watch_out). Gov raw fact, not reassurance; but the card leads with FDA as authority. Fine under the gov-for-label-meaning rule.
- almond_milk labels_decoded: "A name FDA says is established by common usage."  Label meaning only.
- soy_milk watch_out: "FDA counts only fortified soy in the dairy group". Same.
- cream_cheese buying_tips: "Swap in Neufchâtel in most recipes; the two taste similar." Taste, not health. OK.
- Certifier framing (not testing verdicts, but rank-by-certification): dairy_case, cream_cheese, cottage_cheese, sour_cream, ice_cream buying_tips rank "certified organic ... then rBST-free ... then neither". This is label-ladder, not a Cornucopia-style verdict; note only.

## Cross-card gaps found against holistic sources (apply to many cards)
G1. Homogenization is absent from 12 dairy cards (grep: homogen appears only in milk, raw_milk, raw_aged_cheese, goat_sheep_dairy, dairy_case). WAPF shopping guide: AVOID "yogurt and kefir from homogenized milk", "homogenized ... cream, cultured cream and sour cream", fresh cheese "made from homogenized milk and/or cream", aged cheese "made from homogenized milk" (wapf-shopping-guide-categories.md). Cream, yogurt, plain_kefir, sour_cream, cream_cheese, cottage_cheese, cheese_real_vs_processed, ice_cream, grassfed_butter have no "non-homogenized / cream-top" pick step.
G2. Low-fat is on the AVOID list across the whole case: "All lowfat and fat-free cottage cheese, cream cheese and fresh cheese", "Lowfat and sweetened yogurt and kefir", "Lowfat and processed cheese" (same file). cottage_cheese buying_tips currently recommends "Pick dry curd cottage cheese for the version under 0.5 percent milkfat": conflicts with WAPF; cards should say whole-milk/creamed.
G3. Added vitamins: WAPF AVOID "yogurt and kefir with added vitamins" and "milk with added vitamins" (same file). Yogurt/kefir cards do not say it; only plant-milk cards mention fortified.
G4. 100% grass-fed as the only bar. realmilk-questions-for-farmer.md Q4: grain supplementation at milking is "common and fine"; only grain-sensitive people seek 100% grass-fed; best = organic, non-GMO, no soy, ideally sprouted. Cards (raw_milk, yogurt, kefir, cream) treat "100% grass-fed" as the pick; a farm that supplements grain is not a fail for raw. Pasture + winter hay is the real test (Q1-2).
G5. Natural flavors in butter/ghee: WAPF AVOID "butter and ghee containing natural flavors", "whipped butter", "spreads combining butter with vegetable oils". ghee/grassfed_butter cover spices and spreadable butter but not "natural flavors" or whipped.
G6. Plant milks: WAPF lists "processed imitation milk made from soy, rice, almonds, oats, hemp" as AVOID (also soy cheeses). Cards oat/almond/soy/coconut_milk_beverage and plant_butter are a ladder for shoppers who buy them anyway. Not a gap; a stance difference to be aware of. The WAPF-aligned coconut pick is canned whole coconut milk without additives, not aseptic carton (shopping guide line ~381); coconut card says "reach for the can" but not "not aseptic box".

## Per card
- whole_vs_reduced_fat_milk: DIALED per brief, skipped.
- raw_milk: COMPLETE on pick. GAP (small): farmer-question checklist exists and is executable (realmilk-questions-for-farmer.md: pasture, winter feed, sprays, grain, minerals, vaccines, mastitis handling, udder cleaning, closed stainless milking, chilling); card lists only herd tests, cold chain, glass, date. Candidate adds: pasture + winter hay, no sprays, quick chill.
- raw_kefir: COMPLETE. Source supports (WAPF FAQ: "raw kefir would be very safe, especially if the pH is 4.0 or under"; wapf-faq-dairy.md).
- raw_aged_cheese: COMPLETE. Shopping guide adds: "heated no higher than 110°"; some "raw" cheeses are heated to just below pasteurization and rank Good not Best; animal or non-GMO vegetable rennet; natural smoke only. Candidate add: ask whether it was heat-treated (the card only checks age).
- cheese_real_vs_processed: GAP: no raw/non-homogenized/whole step; no "natural smoke" or rennet source; adds bagged shred (covered) but pick stops at grass-fed block. Food Renegade ladder: raw grass-fed A2 (Jersey/Guernsey/goat/sheep) > grass-fed no hormones/antibiotics > no hormones/antibiotics; deli counter and imported European cheeses are the easiest raw finds; US import law needs 60 days so raw soft cheeses come from farmers' markets/artisan shops (foodrenegade-healthy-cheese.md).
- grassfed_butter: GAP (small): add raw/cultured as top rung (WAPF BEST = raw butter from grass-fed animals; cultured butter on the farm-sold list), natural flavors/whipped on avoid. Color-as-carotene is supported (wapf-xfactor-k2.md: butterfat K2/Activator X "proportional to the richness of its yellow or orange color"); realmilk-brochure.md: pale hay-fed butter can carry colorings added to imitate it. Card's winter-pale point is right; add "color added" check (annatto).
- ghee: GAP: card only says "butter the only ingredient". WAPF: pasteurized butter or ghee without natural flavors, preferably grass-fed = Good; raw grass-fed = Best; cultured ghee exists; goat ghee exists; "must be real ghee, not the fake stuff made of vegetable oil" (wapf-faq-dairy.md). Add: no natural flavors; butter source (grass-fed).
- cream_vs_creamer: GAP: WAPF cream ladder: BEST fresh or cultured raw from grass-fed (farm/cow-share); GOOD pasteurized non-homogenized; AVOID ultra-pasteurized, homogenized, additives, canned whipped, imitation whipped, non-dairy creamers. Card covers ultra and creamers; misses non-homogenized and the raw step; WAPF FAQ also advises pasteurized (not UHT) cream diluted with water when raw milk is unavailable.
- pick_whipped_topping: COMPLETE (grass-fed heavy cream, not UHT). Add "canned whipped cream" avoid if the card has room (WAPF AVOID).
- yogurt_plain_vs_flavored: GAP: WAPF BEST raw plain whole non-homogenized; GOOD plain whole non-homogenized without added vitamins; AVOID lowfat, sweetened, homogenized, added vitamins. Card has plain and whole but not homogenized or vitamins. Note WAPF FAQ: yogurt cultured from raw milk is heated to 180F then cooled in Nourishing Traditions recipe; not a buying issue.
- plain_kefir: GAP: same as yogurt (whole, non-homogenized, no added vitamins; best raw). Card is the thinnest dairy-ferment card (4 tips).
- sour_cream: GAP: card ranks cultured vs acidified (good) but WAPF avoids homogenized cultured cream/sour cream and additives; BEST is raw cultured cream, GOOD non-homogenized with no additives. Card also ranks organic then rBST-free, no pasture/homogenization step beyond "grass-fed".
- cream_cheese: GAP: WAPF BEST raw whole grass-fed no additives; GOOD pasteurized whole non-homogenized, no additives; AVOID lowfat, additives, homogenized. Card's "up to 0.5% stabilizers" is the federal standard; WAPF line is no additives at all, which matches the card's decision ("no stabilizers").
- cottage_cheese: GAP (conflict): buying tip points to dry curd under 0.5% milkfat; WAPF AVOID all lowfat and fat-free. Also no raw/non-homogenized/no-additive step beyond carrageenan.
- ice_cream: GAP: decision "cream, milk and sugar, no gums" is close, but WAPF says simple flavors made with rBGH-free milk, cream, egg yolks, real vanilla = Good; Best = homemade from grass-fed (preferably raw) cream; AVOID no-cream ices, extenders, soy, powdered milk, powdered egg yolk, agave, artificial or natural flavors, vanilla flavor, chocolate/cocoa, additives; claims all commercial ice cream contains unlisted propylene glycol and homogenized cream (WAPF claim, one source; do not repeat as fact without a second). Card has none of this.
- goat_sheep_dairy: COMPLETE on pick. Supports: raw goat/sheep "also excellent" (realmilk-brochure.md); goat milk always A2 per WAPF FAQ (wapf-faq-dairy.md); goat milk lower lactose claim in card has no holistic source archived (unverified here). WAPF A2 is "secondary" to raw and full fat.
- dairy_case: COMPLETE as router. GAP-adjacent: add non-homogenized and no-added-vitamins to the router tips (G1, G3).
- pick_margarine: COMPLETE (WAPF AVOID margarines/spreads; principles page cites "Margarine eaters have twice the rate of heart disease as butter eaters", wapf-principles-traditional-diets.md, a claim to verify before reuse).
- plant_butter, oat_milk, almond_milk, soy_milk, coconut_milk_beverage: NOT holistically sourced either way (WAPF rejects the category); no source archived for gums, fortification or oil rules here. Marked unverified, not wrong. Coconut: see G6 for can vs aseptic carton.
