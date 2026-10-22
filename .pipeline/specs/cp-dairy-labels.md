# cp-dairy-labels: completeness-pass card patch (dairy-labels)

```json
{
  "id": "cp-dairy-labels",
  "tier": "T2",
  "ui": false,
  "owns": [
    "docs/research/completeness/patches/dairy-labels.json"
  ],
  "read_full": [
    "docs/research/completeness/DECISIONS-2026-10-22.md",
    "VOICE_SPEC.md",
    "server/kristy_perimeter_kb.json",
    "server/scripts/twoLineCheck.js",
    "server/test/acceptance/patchGuard.js",
    "docs/research/completeness/dairy.md",
    "docs/research/completeness/label-terms.md"
  ],
  "verify": "node --test server/test/acceptance/patch-dairy-labels.test.js && node server/scripts/applyCardPatches.js --check docs/research/completeness/patches/dairy-labels.json",
  "stay_green": []
}
```

## Alignment
Kristy guides a shopper to the healthiest version of every item: nature first, closest to source, organic a floor, small over big (never named), holistic and traditional sources judge. Not a calorie tracker. Stance calls are fixed in DECISIONS-2026-10-22.md; follow them, do not re-derive. Claim lock: health and ingredient claims trace to a source archived under archive/completeness/ (put the human-readable source name in `sources`); copy adds tone, never a new claim. Advocacy wording about disease, cancer, DNA, detox, neurotoxin is never used. No treatment, cure, prevent or risk-lowering wording. Zero first person, no em dashes. No price. No negative claims about named brands; no brand picks. Cards the report marks COMPLETE get `{}` or a sources-only swap.

## Change
- No patch exists for the cards listed in the Acceptance test → write docs/research/completeness/patches/dairy-labels.json: an object keyed by card id; value = the fields to replace (KB card schema fields only; new cards allowed with title, aliases, category, decision).
- For each card read its RECOMMENDED CALL / gap list in dairy.md, label-terms.md (under docs/research/completeness/) and its current text in server/kristy_perimeter_kb.json, then: rewrite mainstream-reassurance lines (decision, why, short_answer, detail, watch_out, buying_tips) to the nature-first ladder; add the missing rung (grower, no sprays, local-seasonal, homogenization, soak or sprout, etc.) as one array entry; replace non-holistic `sources` with the holistic source names from the report (drop a government, extension, EWG or certifier source rather than keep it, except for the raw meaning of a label term).
- Keep `decision` and `buying_tips` within the two-line rule (see server/scripts/twoLineCheck.js).
- Where the report says GAP, invent nothing: strike the reassurance and state only what existing sourced material supports plus the grower, no-sprays, local-seasonal rung. Use `{}` when nothing is wrong.
- When you change an array field give the full new array; omit fields you do not change.
- If the report names a missing coverage item as a new card, add it under a new id in the same file.

## Criteria
- C1 [test] Given the patch file, When loaded, Then every listed card id has an entry.
- C2 [test] Given the patch, When scanned, Then no first person, em dash, price, reassurance phrase, treatment verb, "her", non-holistic source, pick edit or non-schema field appears.
- C3 Given the patch, When `applyCardPatches.js --check` runs, Then it exits 0.

## Contract
```json
{"criteria": [{"id": "C1", "impl": ["docs/research/completeness/patches/dairy-labels.json"], "tests": ["server/test/acceptance/patch-dairy-labels.test.js"], "dependents": []}, {"id": "C2", "impl": ["docs/research/completeness/patches/dairy-labels.json"], "tests": ["server/test/acceptance/patch-dairy-labels.test.js"], "dependents": []}, {"id": "C3", "impl": ["docs/research/completeness/patches/dairy-labels.json"], "tests": ["server/test/acceptance/patch-dairy-labels.test.js"], "dependents": []}], "env": {"executables": ["node"], "browsers": [], "temp": "none", "network": false}}
```

## Acceptance server/test/acceptance/patch-dairy-labels.test.js
```js
// Completeness-pass patch guard for dairy-labels. Do not edit. Tests: C1 C2 C3 (see patchGuard.js).
import { patchSuite } from './patchGuard.js';
patchSuite('dairy-labels', ["grassfed_butter", "whole_vs_reduced_fat_milk", "cheese_real_vs_processed", "yogurt_plain_vs_flavored", "raw_milk", "label_natural", "label_made_with_real", "label_no_added_hormones", "label_nonGMO_vs_organic", "label_cage_free", "label_grass_fed_term", "label_pasture_raised_feed", "label_organic_scope", "label_multigrain_vs_whole_grain", "label_lightly_sweetened", "label_no_artificial_flavors", "cream_vs_creamer", "label_front_vs_back", "label_ingredient_order", "label_third_party_seals", "label_cold_pressed_expeller", "label_sugar_free_substitutes", "label_wild_vs_farm_raised", "label_serving_size", "label_artificial_color", "raw_kefir", "raw_aged_cheese", "oat_milk", "plain_kefir", "sour_cream", "cream_cheese", "cottage_cheese", "ice_cream", "ghee", "goat_sheep_dairy", "almond_milk", "soy_milk", "coconut_milk_beverage", "plant_butter", "dairy_case"]);
```

## ANCHOR [new-file] docs/research/completeness/patches/dairy-labels.json
