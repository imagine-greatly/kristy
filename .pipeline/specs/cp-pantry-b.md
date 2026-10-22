# cp-pantry-b: completeness-pass card patch (pantry-b)

```json
{
  "id": "cp-pantry-b",
  "tier": "T2",
  "ui": false,
  "owns": [
    "docs/research/completeness/patches/pantry-b.json"
  ],
  "read_full": [
    "docs/research/completeness/DECISIONS-2026-10-22.md",
    "VOICE_SPEC.md",
    "server/kristy_perimeter_kb.json",
    "server/scripts/twoLineCheck.js",
    "server/test/acceptance/patchGuard.js",
    "docs/research/completeness/pantry-b.md"
  ],
  "verify": "node --test server/test/acceptance/patch-pantry-b.test.js && node server/scripts/applyCardPatches.js --check docs/research/completeness/patches/pantry-b.json",
  "stay_green": []
}
```

## Alignment
Kristy guides a shopper to the healthiest version of every item: nature first, closest to source, organic a floor, small over big (never named), holistic and traditional sources judge. Not a calorie tracker. Stance calls are fixed in DECISIONS-2026-10-22.md; follow them, do not re-derive. Claim lock: health and ingredient claims trace to a source archived under archive/completeness/ (put the human-readable source name in `sources`); copy adds tone, never a new claim. Advocacy wording about disease, cancer, DNA, detox, neurotoxin is never used. No treatment, cure, prevent or risk-lowering wording. Zero first person, no em dashes. No price. No negative claims about named brands; no brand picks. Cards the report marks COMPLETE get `{}` or a sources-only swap.

## Change
- No patch exists for the cards listed in the Acceptance test → write docs/research/completeness/patches/pantry-b.json: an object keyed by card id; value = the fields to replace (KB card schema fields only; new cards allowed with title, aliases, category, decision).
- For each card read its RECOMMENDED CALL / gap list in pantry-b.md (under docs/research/completeness/) and its current text in server/kristy_perimeter_kb.json, then: rewrite mainstream-reassurance lines (decision, why, short_answer, detail, watch_out, buying_tips) to the nature-first ladder; add the missing rung (grower, no sprays, local-seasonal, homogenization, soak or sprout, etc.) as one array entry; replace non-holistic `sources` with the holistic source names from the report (drop a government, extension, EWG or certifier source rather than keep it, except for the raw meaning of a label term).
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
{"criteria": [{"id": "C1", "impl": ["docs/research/completeness/patches/pantry-b.json"], "tests": ["server/test/acceptance/patch-pantry-b.test.js"], "dependents": []}, {"id": "C2", "impl": ["docs/research/completeness/patches/pantry-b.json"], "tests": ["server/test/acceptance/patch-pantry-b.test.js"], "dependents": []}, {"id": "C3", "impl": ["docs/research/completeness/patches/pantry-b.json"], "tests": ["server/test/acceptance/patch-pantry-b.test.js"], "dependents": []}], "env": {"executables": ["node"], "browsers": [], "temp": "none", "network": false}}
```

## Acceptance server/test/acceptance/patch-pantry-b.test.js
```js
// Completeness-pass patch guard for pantry-b. Do not edit. Tests: C1 C2 C3 (see patchGuard.js).
import { patchSuite } from './patchGuard.js';
patchSuite('pantry-b', ["cooking_oils", "lard_tallow", "cocoa", "seeds", "dried_fruit", "nutritional_yeast", "canned_coconut_milk", "dried_herbs", "tea", "vinegar", "pasta_sauce", "jam", "ketchup_mustard", "mayo", "hot_soy_sauce", "canned_soup", "olives", "seaweed", "salsa", "coconut_water", "condiments", "crackers", "tortilla_chips", "potato_chips", "popcorn", "pretzels", "snack_bars", "trail_mix", "snacks", "hummus", "deli_salads", "prepared_meals", "fresh_pasta", "deli", "frozen_pizza", "frozen_meals", "frozen_fries", "frozen_waffles", "frozen_nuggets", "frozen"]);
```

## ANCHOR [new-file] docs/research/completeness/patches/pantry-b.json
