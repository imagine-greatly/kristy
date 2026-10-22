# Completeness: meat-eggs (beef, pork, poultry, poultry_eggs, meat_counter; 21 cards)
Researched 2026-10-22. Findings only; KB, code and tests untouched, nothing committed.

## Failed / not fetched / caveats (first)
- Not fetched (no source, so no claim made): any Healthy Traditions pork page, Seven Sons / Firsthand sausage pages, the WAPF 2023/2025 shopping-guide PDFs, Eatwild. Pork-specific holistic evidence is therefore thin (see pork GAPs; only the WAPF guide tiers and the lard podcast are archived).
- Provenance: the 4 pre-existing files (wapf-grassfed-culinary, wapf-liver-files, wapf-organ-meats-barry, wapf-splendor-from-grass) were fetched by an earlier run with Firecrawl, not scrapling. Content is verbatim WAPF text and holistic, so kept; not re-fetched.
- My first extraction of 4 new files had a JSON-wrapper bug (chickens-omnivores looked truncated). All 5 new-batch files were re-extracted cleanly and sizes now match the fetched length. A stray ".md" duplicate was deleted.
- wapf-lard-podcast.md is a transcript of a lard-skincare podcast (Charles Mayfield); only its pork-raising remarks are usable, treated as a producer's view.
- Four dairy URLs in a parallel batch returned 404; they belong to the dairy group, not saved here.

## Archive files (archive/completeness/meat-eggs/, URL on line 1)
- wapf-grassfed-culinary.md, wapf-liver-files.md, wapf-organ-meats-barry.md, wapf-splendor-from-grass.md (Firecrawl, see above)
- wapf-eat-your-eggs.md (eggs, soy-free feed, hen diet)
- wapf-chickens-omnivores.md (poultry/hog feed, soy-free alternatives)
- wapf-shopping-guide-categories.md (BEST/GOOD/AVOID tiers: eggs, meat, processed meat, jerky, stock)
- wapf-shopping-guide-2020-p36-processed-meat.md (sausage/bacon curing tiers)
- wapf-fat-soluble-activators.md (pastured liver and yolks vs conventional)
- wapf-lard-podcast.md (pork raised indoors vs outdoors, lard)
- millers-bio-farm-soy-free-eggs.md (producer: soy-free eggs)
- simplygrassfed-pastured-chicken.md (producer: Freedom Ranger vs Cornish Cross, soy-free feed)
- maplewind-air-chill.md (producer: air-chilling)

## Mainstream-reassurance and certifier phrases in cards
- beef_cuts_basics buying_tips: "Grading is voluntary. Ungraded is not a downgrade."
- judging_meat_at_the_case watch_out: "A 'packaged on' date is not a safety cutoff." science: "Sell-by dates are voluntary and not a safety indicator."
- chicken_cuts_basics watch_out: "Safe handling matters far more than the chilling method." (undercuts the air-chill pick)
- chicken_cuts_basics buying_tips: "All chicken is required to be residue-free at sale, labeled or not." (residue reassurance)
- pork_cuts_and_enhanced buying_tips: "Hormones are banned in pork production, so 'no added hormones' on pork is a freebie."
- Certifier framing: beef_grassfed_vs_grainfed "a certifier's seal behind it" / "American Grassfed seal"; chicken_cuts_basics "third-party seal".
- Phrases from the brief ("safe levels", "buy conventional", "FDA says", "just as good", "broadly comparable", "low-residue") were not found by my grep as exact strings; the list above is the closest set. Not exhaustive per field: I sampled, not read every field of all 21 cards.

## Per card
Beef
- beef_grassfed_vs_grainfed: GAP (small). Pick is right (WAPF BEST = animals allowed to graze). Drop "American Grassfed seal / certifier" framing; farmer-direct (eatwild-style) is the holistic route. Source: wapf-shopping-guide-categories.md.
- beef_cuts_basics: COMPLETE on pick. Remove the "ungraded is not a downgrade" reassurance line only if Devon wants it gone.
- ground_beef_lean_ratio: COMPLETE. Organ-blend decision matches WAPF "meat with the fat, organ meats; lean meat can lead to deficiencies" (wapf-shopping-guide-categories.md, wapf-liver-files.md).
Poultry
- rotisserie_chicken: COMPLETE (pasture, soy noted).
- chicken_cuts_basics: GAP. Add breed and feed: heritage Freedom Ranger on soy-free feed vs Cornish Cross on soy feed (simplygrassfed-pastured-chicken.md); WAPF prefers soy-free (wapf-chickens-omnivores.md). Remove the two reassurance lines above.
- turkey_whole, ground_turkey, chicken_breast: GAP (same soy-free / breed point; WAPF tier "preferably soy-free and GMO-free", wapf-shopping-guide-categories.md). Picks themselves are right.
Eggs
- egg_labels: COMPLETE (soy-free, corn-free, pasture matches WAPF BEST and Miller's soy-free page). Source: wapf-shopping-guide-categories.md, wapf-eat-your-eggs.md, millers-bio-farm-soy-free-eggs.md.
- egg_duck_quail: GAP (small). Safety framing is not holistic; keep pasture pick, add soy-free feed for duck/quail where offered. Source: wapf-shopping-guide-categories.md.
- pick_egg_whites: COMPLETE as a pick; note WAPF values yolks (fat-soluble activators: pastured yolks highest, wapf-fat-soluble-activators.md), so whites alone is a weaker food. Flag for Devon, not a blocker.
Pork
- pork_cuts_and_enhanced: GAP. Decision (pasture-raised, no solution) is right but no pork-specific holistic source beyond the WAPF tier (AVOID most commercial pork from confinement; lard podcast says most US pork is raised indoors). Hormones "freebie" line is reassurance; remove. Sources: wapf-shopping-guide-categories.md, wapf-lard-podcast.md.
- pick_sausage: GAP (small). WAPF ranks celery-cured as GOOD, salt/sugar/natural smoke or plain nitrite+ascorbate in pastured meat as BEST, and flags MSG hidden in "spices/natural flavors/hydrolyzed protein/citric acid". No card mentions MSG. Source: wapf-shopping-guide-2020-p36-processed-meat.md, wapf-shopping-guide-categories.md.
- pick_jerky: GAP (same MSG / liquid smoke / torula yeast avoid list). Source: wapf-shopping-guide-categories.md.
- pick_soup_bones: COMPLETE (WAPF stock tier: bones of pastured animals).
Meat counter
- judging_meat_at_the_case: COMPLETE on pick; the sell-by reassurance lines are the only holistic gap.
- butcher_counter_asking: COMPLETE (soup bones, fat, freshly ground).
- lamb_goat, bison: COMPLETE (100% grass-fed; WAPF BEST/GOOD tiers).
- organ_meats: COMPLETE; strongly supported (liver files, Barry, pastured chicken liver highest vitamin A, wapf-fat-soluble-activators.md).
- venison_game: GAP. "Fat-trimmed" conflicts with WAPF "eat meat with the fat; lean meat can lead to deficiencies" (game is BEST); add that venison is lean so pair it with a pastured fat. Source: wapf-shopping-guide-categories.md.

## Summary
COMPLETE 10, GAP 11. Largest real gaps: soy-free feed and breed on all poultry cards, MSG on sausage and jerky, pork sourcing, venison fat, and the reassurance/certifier lines listed above.
