# Shop-dial family reconcile (2026-10-25, unreviewed)
One canonical entry per id in reconcile.json; merge should take it over every batch variant. Spelling normalised to US. Fields kept: id, kind, decision, buying_tips, plus title (botanicals, from bulk-3) and sources (meat-a/meat-b, unioned).

- fam_whole_grains: bulk-1 base (Real Organic, sprouted first) + bulk-5 crop date and pack damage. No delta repeats.
- fam_nuts_seeds: bulk-1 base + bulk-4 candy/isolates skip. No delta repeats.
- fam_named_sweeteners: bulk-3 base + bulk-1 beekeeper/lot. Process words (raw, unsulphured, whole cane) left to the honey and molasses deltas.
- fam_pulses: bulk-1 base, pest check folded into the grower tip; bulk-4 cooked-pulse pick kept for hummus. No delta repeats.
- fam_specialty_flours: bulk-2 base + bulk-5 refined/enriched skip. flour_basics delta glosses "100% extraction"; it explains the tip, it does not repeat it.
- fam_botanicals: bulk-3 base (covers salt and yeast) + bulk-4 origin + bulk-1 whole form. whole_spices delta overlaps the whole-form pick (it names the spices); keep or trim.
- fam_cooking_fats: bulk-3 base; tip 3 now names grass-fed dairy fat and pasture-raised lard and tallow. Grades moved out of the tip so cooking_oils delta (extra virgin/virgin) does not repeat it. plant_butter delta ("read every oil listed") overlaps tip 2; trim to the coconut/olive point.
- fam_whole_grain_baking: bulk-1/bulk-5 merge. Fat-pick tip dropped; oil blends are in the skip. No delta repeats.
- fam_whole_grain_sourdough: bulk-1 base. Fermentation time left to the sourdough delta.
- fam_masa_foods: bulk-4 base + bulk-1 preservatives skip. tortillas and tortilla_chips deltas both gloss "lime means calcium hydroxide" (near repeat across members, not of a tip).
- fam_unheated_refrigerated_ferments: dairy + bulk-4 base; wording is food-neutral so raw_kefir and the kraut/kimchi/kombucha/olive/condiment members all fit. No delta repeats.
- fam_vinegar: bulk-3 base + bulk-2 glass bottle. raw_cider_vinegar and vinegar deltas both say "with the mother" (member-to-member overlap).
- fam_fermented_soy: bulk-4 base + bulk-2 cultures and sauce packet. No delta repeats.
- fam_bone_broth_soups: bulk-4 base + bulk-3 grass-fed and yeast extract. No delta repeats.
- fam_occasional_cocoa: bulk-3 ROC + bulk-5 origin and lead/cadmium results. The ingredient tip stays generic so the dark_chocolate delta (named sweetener, cocoa butter) does not repeat it.
- fam_plain_fruit_preparations: bulk-5 base + bulk-3 oil coatings/sulfites. No delta repeats.
- fam_whole_coconut_cooking_milk: bulk-3 base + dairy coconut origin. "Whole or full-fat" left to the canned_coconut_milk delta. Existing DIAL_REPEAT: canned_coconut_milk and coconut_milk_beverage share "Compare the printed coconut percentage" (bulk-3 vs dairy); fix one delta at merge.
- fam_dressings_deli_salads: bulk-5 base + bulk-4 local kitchen. deli_salads "all dressing ingredients printed" overlaps tip 2; trim to the date.
- fam_prepared_meats: meat-b base (Real Organic, curing skip) + bulk-5 AGA beef and smoke/MSG skip. hot_dogs delta "AGA grassfed seal for the beef" now repeats tip 2; trim to the mechanically separated/starch/phosphate skip.
- fam_poultry_pork: meat-b feed-vs-pasture tip + meat-a family farm + bulk-5 coating. No delta repeats.
- fam_buy_at_eating_quality: one wording, the produce-b frame with produce-a ripeness and split skins.
