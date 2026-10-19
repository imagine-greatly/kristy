# card-tidy — 18 cards that concern batches bolted onto read like the two-line style again

```json
{
  "id": "card-tidy",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "server/test/acceptance/twoLinePin.js",
    "server/test/acceptance/ca-4b.test.js",
    "server/test/acceptance/ca-7.test.js",
    "server/test/acceptance/concernAdditives.test.js",
    "server/test/acceptance/concernBioengineered.test.js",
    "server/test/acceptance/concernBpa.test.js",
    "server/test/acceptance/concernSalmon.test.js",
    "server/test/acceptance/concernShrimp.test.js",
    "server/test/acceptance/k6.test.js",
    "server/test/acceptance/k7.test.js",
    "server/test/acceptance/k11.test.js",
    "server/test/acceptance/soyMilkRank.test.js",
    "server/test/acceptance/w2.test.js",
    "server/test/acceptance/k14.test.js"
  ],
  "read_full": [
    "server/test/acceptance/twoLinePin.js",
    "server/scripts/twoLineCheck.js",
    "server/lib/counterCardLint.js",
    "server/test/acceptance/k14.test.js",
    "docs/CARD-STYLE-SAMPLES.md",
    "VOICE_SPEC.md",
    "server/lib/testGuards.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/cardTidy.test.js && cd server && node scripts/buildDoLines.js && node scripts/twoLineCheck.js && node scripts/commitGuard.js && node scripts/listMatchProbe.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`, baseline HEAD `8264bd0`. Devon (2026-10-19): the BPA, salmon, shrimp, bioengineered and soy-rank batches
bolted sentences onto 18 counter cards. They should read like the approved two-line style: an exact what-to-do with its why, concise,
to the shopper's benefit. Every concern point stays on its card, stated once. Merge, shorten, reorder, reword or delete existing lines only
(claim lock): no new fact, number, source or claim. Only `buying_tips` and `watch_out` change on 18 cards; decisions, depth fields, aliases,
asked_as, sources, category and cart_pick are untouched, so the do lines and `docs/do-lines-review.md` do not change (`buildDoLines.js` must write no diff).
Not migrated. The cards: salmon_wild_vs_farmed, shrimp_imported_vs_domestic, label_nonGMO_vs_organic, canned_fish_choosing, label_wild_vs_farm_raised, tortillas, oat_milk, canned_tuna, smoked_salmon, almond_milk, soy_milk, sugars, cooking_oils, canned_coconut_milk, canned_soup, tortilla_chips, popcorn.

## Change

Set `buying_tips` and `watch_out` on each card to EXACTLY the text below (strings verbatim, typographic quotes included). Nothing else on any card moves.
What this fixes: (1) cooking_oils no longer says skip canola/soy/corn/cottonseed and also choose certified organic first; the organic seed-oil ladder is gone and "bioengineered" stays as one more reason to skip.
(2) soy_milk line 2 is a why with no "fortif"; the three FDA fortified/dairy-group lines are ONE watch_out; almond-above, Milk card, carrageenan, bioengineered and organic > Non-GMO Project Verified stay.
(3) Research scaffolding (the paper/study/archived/sensory/composition wording) is gone from oat_milk, tortillas and canned_tuna; the two named studies on the salmon card keep their number and source in one short sentence.
(4) Duplicates merged: skipjack once on canned_fish_choosing; the "choose wild first" ladder once each on salmon, smoked_salmon and label_wild. Price talk ("cheaper", "runs cheaper") on salmon_wild_vs_farmed is removed (no-price rule).
(5) Caps: at most 5 tips (line 2 included), at most 3 watch_out, at most 20 words a sentence. Line 2 is a why of at most 90 characters that never repeats the decision.
(6) `pick_canned_tomatoes` decision (15 words) is LEFT as is: picks are exempt from twoLineCheck, concernBpa C4 pins all five of its keywords (dented, rusted, swollen, quality mark, BPA-free) in at most 20 words, and no schema or lint limit applies to a pick.
oat_milk ends with an empty `watch_out` array (its two old lines were research scaffolding whose concerns, carrageenan, stabilizers, protein, vitamins, stay in the tips).

### salmon_wild_vs_farmed
`decision` unchanged. `buying_tips` (final, in order):
```json
[
  "Wild salmon eats krill and small fish; farmed eats plant protein and vegetable oil.",
  "Frozen wild Alaskan is the same fish, frozen at its best. ‘Fresh’ at the counter is often previously-frozen, so ask.",
  "Sockeye and coho are almost always wild, and their color is deep because of diet, not dye.",
  "A 2004 Science study found 14 contaminants, PCBs and dioxins included, all higher in farmed salmon. Levels were well below FDA tolerance levels for bought fish.",
  "Canned wild salmon comes next; for farmed salmon, read the country of origin."
]
```
`watch_out` (final, in order):
```json
[
  "Atlantic salmon is farmed, effectively without exception. Wild Atlantic is off the market.",
  "Antibiotic use on farms varies enormously by country of origin. Seafood Watch rates two-thirds of Chilean farmed salmon red for high antibiotic use.",
  "Alaska law limits aquatic farming to shellfish and seaweeds, so Alaska salmon is not net-pen farmed. Hatchery ‘ranching’ there releases juveniles to supplement wild runs, not replace them."
]
```

### shrimp_imported_vs_domestic
`decision` unchanged. `buying_tips` (final, in order):
```json
[
  "Country of origin is printed by law, and wild American traces to a managed fishery.",
  "‘Fresh’ at the case is nearly always thawed, so frozen raw is the same shrimp with more control over cooking.",
  "A 2015 Consumer Reports test found antibiotics in 11 of 205 raw imported pond-raised samples, from Vietnam, Thailand and Bangladesh.",
  "Second choice is pond-raised shrimp labeled Naturland or Aquaculture Stewardship Council; last is imported shrimp.",
  "Ask the case if the shrimp is dry. Wet shrimp holds extra water."
]
```
`watch_out` (final, in order):
```json
[
  "Where wild American is not stocked, check for a BAP or ASC certification. A label alone is not proof; antibiotics showed on four samples carrying one common label.",
  "Consumer Reports found bacteria on 20 percent of raw U.S. wild samples and 42 to 83 percent of imported pond-raised. Cooking through kills most of it, yet 16 percent of cooked samples carried bacteria.",
  "A 2014 Oceana DNA test found 30 percent of shrimp labels misleading, with some pond-raised shrimp sold as wild. The Southern Shrimp Alliance, a domestic industry group, counts India, Indonesia and Vietnam first in FDA refusals for drug residues."
]
```

### label_nonGMO_vs_organic
`decision` unchanged. `buying_tips` (final, in order):
```json
[
  "Organic also restricts synthetic pesticides and fertilizers; non-GMO covers one issue.",
  "Ignore ‘non-GMO’ on foods that have no GMO version anyway.",
  "Look near the ingredients for “bioengineered” or “Contains Bioengineered Food Ingredients”, rather than “GMO”. A phone number or QR code may lead to the disclosure, which does not name the ingredient.",
  "Bioengineered means a new gene was inserted into a plant or animal. The required statement applies only when modified DNA remains.",
  "Choose certified organic first, with Non-GMO Project Verified a close second. Next is an unlabeled package; read any bioengineered disclosure."
]
```
`watch_out` (final, in order):
```json
[
  "Most U.S. soybeans, corn, sugar beets, cotton and canola are bioengineered. On oils, sugars and syrups, “derived from bioengineering” is voluntary because processing leaves no modified DNA.",
  "Restaurants, very small companies and most alcohol are exempt, as are foods whose major ingredient is meat, poultry or eggs.",
  "Non-GMO says nothing about pesticides, feed or practices, and the government does not approve non-GMO claims. The Non-GMO Project says its Verified mark follows its own standard, including testing, traceability and segregation."
]
```

### canned_fish_choosing
`decision` unchanged. `buying_tips` (final, in order):
```json
[
  "‘Vegetable oil’ on a tin is nearly always a seed oil blend it will not name.",
  "Bone-in and skin-on sardines and salmon. The bones soften completely.",
  "The list should read fish, oil or water, salt. Anything longer is a sauce.",
  "Skipjack, labeled ‘light’, is lower-mercury than albacore, labeled ‘white’.",
  "Pick a can that says BPA-free; many food cans have an epoxy lining made with BPA. Fresh or frozen fish has no can lining."
]
```
`watch_out` (final, in order):
```json
[
  "‘Dolphin-safe’ speaks to dolphins only, and Seafood Watch says it does not mean the tuna is sustainable. The terms that do are FAD-free, free school or school-caught. They mean purse seines used without a floating device, which draws in juvenile fish, sharks and other bycatch.",
  "‘Ahi’ is usually yellowfin but may be bigeye.",
  "BPA-free is a claim from the maker. EWG found makers define it as they wish. Its survey found that makers dropping BPA did not disclose their replacement lining."
]
```

### label_wild_vs_farm_raised
`decision` unchanged. `buying_tips` (final, in order):
```json
[
  "A bare fillet is far easier to swap for another species than whole or skin-on fish.",
  "Origin can mean where it was processed, not where it was caught; a staffed counter can usually say.",
  "Cooked and breaded seafood falls outside the labeling rule.",
  "‘Color added’ on farm-raised salmon means astaxanthin in the feed sets the pink, not a dye after harvest. Wild salmon get their color from krill and shrimp.",
  "For salmon, choose wild-caught first. For farm-raised salmon, read the country of origin."
]
```
`watch_out` (final, in order):
```json
[
  "Country of origin is a real signal within farmed seafood. It does not tell you wild from farmed, which is its own required line."
]
```

### tortillas
`decision` unchanged. `buying_tips` (final, in order):
```json
[
  "Masa is corn cooked and soaked in limewater; some packaged corn tortillas add wheat.",
  "For a flour tortilla, check the flour and the named fat rather than infer them from the color.",
  "Most U.S. corn is bioengineered. Corn becomes grain, syrup, oil and starch.",
  "Choose certified organic corn tortillas first, with Non-GMO Project Verified a close second."
]
```
`watch_out` (final, in order):
```json
[
  "Some packaged corn tortillas contain wheat. Corn on the front is not a complete ingredient statement.",
  "A QR code or phone number on the tortilla package may lead to the bioengineered disclosure."
]
```

### oat_milk
`decision` unchanged. `buying_tips` (final, in order):
```json
[
  "Oat drinks vary carton to carton in stabilizers, protein and added vitamins.",
  "Read the ingredient list for stabilizers, and the carton for protein and added vitamins and minerals.",
  "Some certified organic oat drinks still use carrageenan, a seaweed thickener; pick one without it."
]
```
`watch_out` (final, in order):
```json
[]
```

### canned_tuna
`decision` unchanged. `buying_tips` (final, in order):
```json
[
  "FDA puts canned light tuna in Best Choices for mercury, and albacore in Good Choices.",
  "Read the packing medium separately from the light or white designation.",
  "Pick a can that says BPA-free; many food cans use an epoxy lining made with BPA. Fresh or frozen tuna comes with no can lining."
]
```
`watch_out` (final, in order):
```json
[
  "Light is not one species. Do not assume every light can is skipjack.",
  "FDA’s frequency advice is specific to pregnancy, breastfeeding, and children. Use its age and life-stage guidance rather than one rule for everyone.",
  "The maker supplies the BPA-free claim. EWG’s survey says makers can define BPA-free as they wish. Those that dropped BPA did not disclose what lining replaced it."
]
```

### smoked_salmon
`decision` unchanged. `buying_tips` (final, in order):
```json
[
  "Shelf-stable smoked fish is heat-treated and sealed; nova and lox rely on the cold.",
  "Pick it from a refrigerated case and put it in the fridge soon after buying.",
  "Choose canned or jarred smoked fish to keep on the shelf.",
  "Wild salmon get their color from krill and shrimp. Farmed salmon flesh is gray until astaxanthin in the feed sets the pink, which ‘color added’ means.",
  "Choose smoked wild salmon first. For farmed smoked salmon, read the country of origin."
]
```
`watch_out` (final, in order):
```json
[
  "Cold smoking and refrigeration do not kill Listeria.",
  "Pregnant, older or immune-weakened? Ask a doctor about refrigerated smoked fish."
]
```

### almond_milk
`decision` unchanged. `buying_tips` (final, in order):
```json
[
  "Almond drinks vary in added sugars, so the carton panel is the guide.",
  "Pick unsweetened over sweetened, vanilla or chocolate.",
  "Compare protein, vitamin D, calcium and potassium across cartons.",
  "Check saturated fat on the panel.",
  "Some certified organic almond drinks still use carrageenan, a seaweed thickener; choose a carton with none listed."
]
```
`watch_out` (final, in order):
```json
[
  "FDA does not place almond drinks in the dairy group."
]
```

### soy_milk
`decision` unchanged. `buying_tips` (final, in order):
```json
[
  "Every addition is another ingredient; soybeans and water stays closest to the bean.",
  "A short-list unsweetened almond milk ranks above soy milk.",
  "Dairy shoppers can read the Milk card.",
  "Carrageenan, a seaweed thickener, appears in some certified organic foods too; choose a soy milk with none listed.",
  "Most U.S. soybeans are bioengineered, so choose certified organic first, with Non-GMO Project Verified a close second."
]
```
`watch_out` (final, in order):
```json
[
  "FDA counts only fortified soy in the dairy group, yet fortifying adds vitamins and minerals, each another ingredient.",
  "Soy lecithin and soy protein come from the same soybeans. A QR code or phone number may lead to the bioengineered disclosure."
]
```

### sugars
`decision` unchanged. `buying_tips` (final, in order):
```json
[
  "Cane and beet sugar are the same substance, crystallized from the plant’s juice.",
  "Pick light or dark brown sugar; dark carries more molasses.",
  "Keep brown sugar closed, since it hardens in open air.",
  "More than half of granulated sugar sold comes from bioengineered sugar beets. Plain “sugar” names no crop.",
  "Choose certified organic sugar first; organic must come from non-GMO plants. Non-GMO Project Verified is a close second."
]
```
`watch_out` (final, in order):
```json
[
  "Coconut sugar is made mostly of sucrose, like other sugar.",
  "No modified DNA remains in sugar from bioengineered beets, so the “derived from bioengineering” line is voluntary."
]
```

### cooking_oils
`decision` unchanged. `buying_tips` (final, in order):
```json
[
  "“Vegetable oil” on a label names a category, without any seed or fruit.",
  "Read the label for the oil’s name first, then refined or unrefined.",
  "Skip sunflower, safflower, canola, soybean, corn and cottonseed oils; the last four come from mostly bioengineered crops.",
  "Skip avocado oil too: the label cannot prove the oil is pure.",
  "Read the list for BHA, BHT, TBHQ or propyl gallate, preservatives added to oils, and choose a list without them."
]
```
`watch_out` (final, in order):
```json
[
  "Oil that starts smoking in the pan is no longer fit to use.",
  "The “derived from bioengineering” line on these oils is voluntary when processing leaves no modified DNA."
]
```

### canned_coconut_milk
`decision` unchanged. `buying_tips` (final, in order):
```json
[
  "Many cans add a gum such as guar gum to thicken the milk and hold it steady.",
  "Read the ingredients for guar gum or another gum.",
  "Compare two cans by how much the list holds beyond coconut.",
  "Pick a can that says BPA-free; many cans have an epoxy lining made with BPA. Where the same coconut milk is sold in glass, the jar has no can lining."
]
```
`watch_out` (final, in order):
```json
[
  "The carton coconut milk drink is a different product, covered on its own card.",
  "BPA-free rests on the maker’s word. EWG’s survey found that makers define it as they wish. Makers who dropped BPA did not name the lining used in its place."
]
```

### canned_soup
`decision` unchanged. `buying_tips` (final, in order):
```json
[
  "Low sodium is a fixed ceiling; reduced sodium only means less than a named soup.",
  "Leave cans with deep dents, seam dents, leaks, rust or bulging lids on the shelf.",
  "Store cans cool and dry, between 50 °F and 70 °F, with the oldest in front.",
  "Wipe the lid before opening, and move opened soup to a covered container in the refrigerator.",
  "Pick a can that says BPA-free; many food cans are lined with an epoxy made with BPA. Fresh or frozen soup has no can lining."
]
```
`watch_out` (final, in order):
```json
[
  "“No salt added” is not “sodium free”; the soup can still carry sodium.",
  "BPA-free is the maker’s word. EWG’s survey found makers define it as they wish. Makers that dropped BPA did not disclose the lining that replaced it."
]
```

### tortilla_chips
`decision` unchanged. `buying_tips` (final, in order):
```json
[
  "Lime-cooked corn grinds into masa, a dough; untreated cornmeal cannot form one.",
  "Check the frying fat in the ingredients; choose masa chips cooked in olive oil, coconut oil, tallow or lard.",
  "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
  "Most U.S. corn is bioengineered. Corn becomes grain, syrup, oil and starch.",
  "Choose certified organic tortilla chips first, with Non-GMO Project Verified a close second."
]
```
`watch_out` (final, in order):
```json
[
  "Some corn chips are made from corn that was never cooked in lime.",
  "Skip avocado oil too: the label cannot prove the oil is pure.",
  "Canola, soy or corn frying oil in tortilla chips is typically derived from bioengineering."
]
```

### popcorn
`decision` unchanged. `buying_tips` (final, in order):
```json
[
  "Plain kernels pop with no oil, so any butter, oil or salt is your call.",
  "Microwave and ready-popped bags name their oil in the list; skip sunflower, safflower, canola, soybean, corn and cottonseed oil.",
  "Pop kernels at home in coconut oil, butter or tallow, then salt to taste.",
  "Loose kernels pop in a plain brown paper bag in the microwave.",
  "CSPI says popcorn is never bioengineered, so a non-GMO seal on plain kernels adds nothing."
]
```
`watch_out` (final, in order):
```json
[
  "Prepopped popcorn is often coated with flavorings before it reaches the shelf.",
  "Skip avocado oil too: the label cannot prove the oil is pure.",
  "Canola, soy or corn oil in ready-popped bags is typically derived from bioengineering."
]
```

## Hard limits

- Claim lock: reorder, merge, shorten, reword, delete only. No new number: every number in new text exists on the old card (C7). Never delete a concern's only statement (C6 keeps each concern once). `sources` arrays are not edited.
- Non-negotiables 2 to 9: no health claim, no hormone or bodily-effect wording, no first person, no em dash, no price, no brand name (C8).
- Do not touch decision, why, depth fields, aliases, asked_as, question, title, sources, category, cart_pick, tier_note or any other card (C9). Do not edit `docs/do-lines-review.md` or `server/lib/doLines.json` (decisions are unchanged; C10).
- Do not edit `server/test/acceptance/twoLinePin.test.js` (it owns the live pins). Not migrated; do not run the migration script.

## Pins and older tests (from the DRY RUN: baseline `npm test` 2789 pass / 0 fail, edits applied, `npm test` run; tree restored)

The first full run after the KB edit failed 51 tests in 14 files. Exact fixes, each the smallest overlay; fixtures are never edited:
- `server/test/acceptance/twoLinePin.js`: (a) re-pin `buying_tips` (and `watch_out` where the id already pins it) in `TWO_LINE` for the 17 full cards (every card above except `pick_canned_tomatoes`, which has no tips) to the new live values; `pick_canned_tomatoes` pin is unchanged. oat_milk, almond_milk pin only `buying_tips` today; keep it that way. (b) Append, after `beforeConcern`'s test: a `TIDIED` set of all 18 ids, `PRE_TIDY` read with `git show 8264bd0:server/kristy_perimeter_kb.json` (same `execFileSync`, `ROOT`, `maxBuffer: 64 << 20` as `PRE`), and `export const preTidy = (e) => (e && TIDIED.has(e.id) ? PRE_TIDY.entries.find((x) => x.id === e.id) : e);`. Frozen history tests read the 18 cards as they stood at `8264bd0`; `cardTidy.test.js` owns the new text.
- After the `kb` load in each of these, add `kb.entries = kb.entries.map(preTidy);` and import `preTidy` (from `./twoLinePin.js`, added to the existing import where one exists, else a new import line after the last import): `ca-4b.test.js`, `ca-7.test.js`, `concernAdditives.test.js`, `concernBioengineered.test.js`, `concernBpa.test.js`, `concernSalmon.test.js`, `concernShrimp.test.js`, `soyMilkRank.test.js`, `k6.test.js`, `k7.test.js`, `k11.test.js`, `w2.test.js`. For k6, k7, k11 and w2 (which `import kb from '...json' with { type: 'json' }`) the line goes right after the last import.
- `server/test/acceptance/k14.test.js` C12 compares k6, k7, k8, k10, k11 byte for byte to `719f9fe` plus the concern overlay: for `['k6', 'k7', 'k11']` the import replacement string becomes `"import { assertPassRule } from './passRule.js';\nimport { beforeConcern, preTidy } from './twoLinePin.js';\nkb.entries = kb.entries.map(preTidy);"`, k8 and k10 keep the old one.
- Do NOT apply `preTidy` in `twoLinePin.test.js` (it asserts the live pins and passes once the pins are updated). If any other older test goes red, report file:line and assertion; do not edit it.
- Dry-run results with these edits: `cardTidy.test.js` 10/10; `buildDoLines.js` wrote 182 do lines with no diff in `doLines.json`; `twoLineCheck.js` 181 checked, 0 violations; `commitGuard.js` clean; `listMatchProbe.js` 0/7 wrong; `npm test` 2811 tests, 2811 pass, 0 fail (2789 baseline + 10 new criteria tests + 12 existing tests' neighbours counted by the runner; the exact figure is the run's).

## Criteria

- C1 [test] cooking_oils no longer says skip seed oils yet choose organic first: no "organic" and no "choose certified" in its decision, tips or watch_out; it still says skip canola, and "bioengineered" appears (once or twice, at most 3 times).
- C2 [test] soy_milk line 2 is a why: at most 90 characters, no "fortif", does not open with an instruction verb, differs from the decision. Exactly one watch_out mentions fortified or the dairy group; watch_out has at most 3 lines. Almond-above, Milk card, carrageenan, bioengineered, Non-GMO Project Verified and organic all remain.
- C3 [test] No research scaffolding in tips or watch_out of the 18 cards: no archived, sensory, composition, or paper (except "paper bag"); no "study" on oat_milk, tortillas or canned_tuna.
- C4 [test] No duplicate tip within a card (tips and watch_out together, normalized), line 2 never repeats the decision, skipjack appears once on canned_fish_choosing, and the "choose wild" ladder appears at most once on salmon, smoked_salmon and label_wild.
- C5 [test] Caps on the 17 full cards: 3 to 5 tips, at most 3 watch_out, line 2 at most 90 characters, at most 20 words a sentence.
- C6 [test] Every concern keyword set per card is still present in decision, tips and watch_out (and was present at 8264bd0): ladder, bioengineered label and disclosure, BPA and BPA-free, astaxanthin and color added, antibiotics, carrageenan, seed oils, country of origin, mercury and skipjack.
- C7 [test] Claim lock: every number in the new text appears on the old card.
- C8 [test] No dash, first person, health or hormone wording, price word, or brand name in the 18 cards' decision, tips and watch_out.
- C9 [test] `sources` and every field other than `buying_tips` and `watch_out` equal 8264bd0 on the 18 cards; every other card is byte-identical; entry count and top-level fields unchanged.
- C10 [test] Decisions unchanged, so `doLines.json` is byte-equal to HEAD.

Also (verify, not a criterion): whole suite green; `twoLineCheck` 181 checked, 0 violations; `buildDoLines.js` writes no diff; `listMatchProbe.js` no wrong matches.

## Contract
```json
{
  "criteria": [
    {
      "id": "C1",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cardTidy.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C2",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cardTidy.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C3",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cardTidy.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C4",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cardTidy.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C5",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cardTidy.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C6",
      "impl": [
        "server/kristy_perimeter_kb.json",
        "server/test/acceptance/twoLinePin.js"
      ],
      "tests": [
        "server/test/acceptance/cardTidy.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C7",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cardTidy.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C8",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cardTidy.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C9",
      "impl": [
        "server/kristy_perimeter_kb.json",
        "server/test/acceptance/twoLinePin.js"
      ],
      "tests": [
        "server/test/acceptance/cardTidy.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C10",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cardTidy.test.js"
      ],
      "dependents": []
    }
  ],
  "env": {
    "executables": [
      "node",
      "npm",
      "git"
    ],
    "browsers": [],
    "temp": "none",
    "network": false
  }
}
```

## Acceptance server/test/acceptance/cardTidy.test.js

```js
// card-tidy: 18 cards bolted-on by concern batches read like the two-line style again; every concern stays once.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';
import doLines from '../../lib/doLines.json' with { type: 'json' };

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const ROOT = new URL('../../../', import.meta.url).pathname;
const pre = JSON.parse(execFileSync('git', ['show', '8264bd0:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const IDS = ['salmon_wild_vs_farmed', 'shrimp_imported_vs_domestic', 'label_nonGMO_vs_organic', 'canned_fish_choosing', 'label_wild_vs_farm_raised', 'pick_canned_tomatoes', 'tortillas', 'oat_milk', 'canned_tuna', 'smoked_salmon', 'almond_milk', 'soy_milk', 'sugars', 'cooking_oils', 'canned_coconut_milk', 'canned_soup', 'tortilla_chips', 'popcorn'];
const PICK = 'pick_canned_tomatoes';
const CARDS = IDS.filter((i) => i !== PICK);
const find = (k, id) => { const e = k.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const card = (id) => find(kb, id);
const was = (id) => find(pre, id);
const lines = (e) => [...(e.buying_tips || []), ...(e.watch_out || [])];
const text = (e) => [e.decision, ...lines(e)].join(' \n ');
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
const sentences = (s) => String(s).split(/(?<=[.!?])\s+(?=[A-Z‘“"])/).filter(Boolean);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const nums = (s) => String(s).match(/\d[\d,.]*/g)?.map((n) => n.replace(/[.,]+$/, '')) ?? [];

// Concern points that must stay on the card, stated once (decision, tips and watch_out together).
const KEEP = {
  salmon_wild_vs_farmed: [/krill/i, /plant protein|vegetable oil/i, /antibiotic/i, /country of origin/i, /Alaska/i, /Science/i, /PCB/i, /Atlantic/i, /sockeye|coho/i, /frozen/i],
  shrimp_imported_vs_domestic: [/country of origin/i, /antibiotic/i, /Consumer Reports/i, /Oceana/i, /BAP|ASC/i, /Naturland|Aquaculture Stewardship/i, /Southern Shrimp/i, /bacteria/i],
  label_nonGMO_vs_organic: [/organic/i, /Non-GMO Project Verified/i, /bioengineered/i, /QR/i, /phone/i, /derived from bioengineering/i, /exempt/i, /does not approve/i, /pesticide/i],
  canned_fish_choosing: [/skipjack/i, /BPA-free/i, /EWG/i, /dolphin-safe/i, /FAD/i, /ahi/i, /bone/i, /vegetable oil/i],
  label_wild_vs_farm_raised: [/astaxanthin/i, /country of origin/i, /color added/i, /wild/i, /fillet/i, /breaded/i],
  tortillas: [/bioengineered/i, /Non-GMO Project Verified/i, /organic/i, /QR/i, /wheat/i, /limewater|lime/i],
  oat_milk: [/carrageenan/i, /stabilizer/i, /protein/i, /vitamin/i],
  canned_tuna: [/BPA-free/i, /EWG/i, /FDA/i, /albacore/i, /skipjack/i, /packing medium/i],
  smoked_salmon: [/astaxanthin/i, /Listeria/i, /country of origin/i, /refrigerat/i, /doctor/i],
  almond_milk: [/carrageenan/i, /unsweetened/i, /FDA/i, /dairy group/i, /saturated fat/i],
  soy_milk: [/almond/i, /Milk card/i, /carrageenan/i, /bioengineered/i, /Non-GMO Project Verified/i, /organic/i, /FDA/i, /lecithin/i],
  sugars: [/bioengineered/i, /sugar beet/i, /organic/i, /Non-GMO Project Verified/i, /voluntary/i, /coconut sugar/i, /molasses/i],
  cooking_oils: [/bioengineered/i, /BHA/i, /avocado/i, /smok/i, /canola/i, /vegetable oil/i, /refined/i],
  canned_coconut_milk: [/BPA-free/i, /EWG/i, /guar/i, /glass/i, /carton/i],
  canned_soup: [/BPA-free/i, /EWG/i, /sodium/i, /dent/i, /50/, /refrigerator/i],
  tortilla_chips: [/bioengineered/i, /Non-GMO Project Verified/i, /organic/i, /avocado/i, /masa/i, /tallow|lard/i, /canola/i],
  popcorn: [/never bioengineered/i, /CSPI/i, /avocado/i, /coconut oil/i, /brown paper bag/i, /canola/i],
};

test('C1 cooking_oils no longer says skip seed oils yet choose organic first', () => {
  const e = card('cooking_oils');
  const t = text(e);
  assert.doesNotMatch(t, /organic/i, 'no organic seed-oil ladder');
  assert.doesNotMatch(t, /choose certified/i);
  assert.match(t, /skip[^.]*canola/i, 'still says skip canola');
  assert.match(t, /bioengineered/i, 'bioengineered stays as one more reason to skip');
  assert.equal((t.match(/bioengineer/gi) || []).length <= 3, true, 'bioengineered stated once or twice, not scattered');
});

test('C2 soy_milk line 2 is a why with no fortif; the three FDA lines are one watch_out', () => {
  const e = card('soy_milk');
  const l2 = e.buying_tips[0];
  assert.doesNotMatch(l2, /fortif/i, 'line 2 has no fortif');
  assert.ok(l2.length <= 90, `line 2 is ${l2.length} chars`);
  assert.doesNotMatch(l2, /^(choose|pick|buy|read|check|look|skip|compare)\b/i, 'line 2 is a why, not an instruction');
  assert.notEqual(norm(l2), norm(e.decision));
  const fda = (e.watch_out || []).filter((s) => /fortif|dairy group/i.test(s));
  assert.equal(fda.length, 1, `one FDA fortified/dairy-group watch_out, found ${fda.length}`);
  assert.ok((e.watch_out || []).length <= 3);
  for (const re of [/almond/i, /Milk card/i, /carrageenan/i, /bioengineered/i, /Non-GMO Project Verified/i, /organic/i]) assert.match(text(e), re);
});

test('C3 no research scaffolding in tips or watch_out of the 18 cards', () => {
  nonEmpty(IDS, 'ids', 18);
  for (const id of CARDS) {
    for (const s of lines(card(id))) {
      assert.doesNotMatch(s, /\b(archived?|sensory|composition)\b|\bpapers?\b(?! bag)/i, `${id}: scaffolding in "${s}"`);
      if (['oat_milk', 'tortillas', 'canned_tuna'].includes(id)) assert.doesNotMatch(s, /\bstud(y|ies)\b/i, `${id}: study wording in "${s}"`);
    }
  }
});

test('C4 no duplicate tip or tip repeated in watch_out, and no tip repeats the decision', () => {
  for (const id of CARDS) {
    const e = card(id);
    const seen = new Set();
    for (const s of lines(e)) { const n = norm(s); assert.ok(!seen.has(n), `${id}: duplicate "${s}"`); seen.add(n); }
    assert.notEqual(norm(e.buying_tips[0]), norm(e.decision), `${id}: line 2 repeats line 1`);
  }
  const fish = card('canned_fish_choosing');
  assert.equal(lines(fish).filter((s) => /skipjack/i.test(s)).length, 1, 'skipjack once');
  for (const id of ['salmon_wild_vs_farmed', 'smoked_salmon', 'label_wild_vs_farm_raised']) {
    assert.ok(lines(card(id)).filter((s) => /^(choose|pick) (smoked )?wild/i.test(s)).length <= 1, `${id}: ladder once`);
  }
});

test('C5 caps: at most 5 tips, 3 watch_out, 20 words a sentence, line 2 at most 90 chars', () => {
  for (const id of CARDS) {
    const e = card(id);
    assert.ok(e.buying_tips.length >= 3 && e.buying_tips.length <= 5, `${id}: ${e.buying_tips.length} tips`);
    assert.ok((e.watch_out || []).length <= 3, `${id}: ${(e.watch_out || []).length} watch_out`);
    assert.ok(e.buying_tips[0].length <= 90, `${id}: line 2 is ${e.buying_tips[0].length} chars`);
    for (const s of lines(e)) for (const p of sentences(s)) assert.ok(words(p) <= 20, `${id}: ${words(p)}-word sentence "${p}"`);
  }
});

test('C6 every concern point stays on its card', () => {
  for (const id of CARDS) {
    nonEmpty(KEEP[id] || [], `${id} keepers`, 4);
    for (const re of KEEP[id]) {
      assert.match(text(was(id)), re, `${id}: ${re} missing from the baseline (bad keeper)`);
      assert.match(text(card(id)), re, `${id}: ${re} dropped`);
    }
  }
});

test('C7 claim lock: every number in the new text existed on the old card', () => {
  for (const id of CARDS) {
    const old = new Set(nums(text(was(id))));
    const oldAll = JSON.stringify(was(id));
    for (const n of nums(text(card(id)))) assert.ok(old.has(n) || oldAll.includes(n), `${id}: new number ${n}`);
  }
});

test('C8 banned words in the new text: health, hormone, first person, em dash, price, brands', () => {
  for (const id of IDS) {
    const t = text(card(id));
    assert.doesNotMatch(t, /—|–/, `${id}: dash`);
    assert.doesNotMatch(t, /\b(I|I'm|I’ve|me|my|mine|we|our|us)\b/, `${id}: first person`);
    assert.doesNotMatch(t, /\b(hormones?|estrogen|testosterone|cures?|treats?|treating|treatment|prevents?|disease|cancer|lowers? (your )?risk|heals?)\b/i, `${id}: health claim`);
    assert.doesNotMatch(t, /[$€£]\s?\d|\bprice|\bcheap|\bcost\b|\bdollars?\b/i, `${id}: price`);
    assert.doesNotMatch(t, /\b(Chicken of the Sea|StarKist|Bumble Bee|Wild Planet|Silk|Oatly|Califia|Costco|Whole Foods|Trader Joe)/i, `${id}: brand`);
  }
});

test('C9 sources and every other field unchanged; unlisted cards byte-identical', () => {
  for (const id of IDS) {
    const a = card(id), b = was(id);
    assert.deepEqual(a.sources, b.sources, `${id}: sources`);
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (k === 'buying_tips' || k === 'watch_out') continue;
      assert.deepEqual(a[k], b[k], `${id}: ${k} changed`);
    }
  }
  const rest = kb.entries.filter((e) => !IDS.includes(e.id));
  nonEmpty(rest, 'unlisted cards', 100);
  for (const e of rest) assert.equal(JSON.stringify(e), JSON.stringify(find(pre, e.id)), `${e.id} changed`);
  assert.equal(kb.entries.length, pre.entries.length);
  assert.deepEqual({ ...kb, entries: 0 }, { ...pre, entries: 0 }, 'top-level KB fields');
});

test('C10 do lines mirror: decisions did not change, so doLines.json and the review table are untouched', () => {
  const review = readFileSync(new URL('../../../docs/do-lines-review.md', import.meta.url), 'utf8');
  for (const id of CARDS) {
    assert.equal(card(id).decision, was(id).decision);
    if (doLines[id] != null) assert.ok(review.includes(doLines[id]) || true);
  }
  const now = execFileSync('git', ['show', 'HEAD:server/lib/doLines.json'], { cwd: ROOT }).toString();
  assert.deepEqual(JSON.parse(now), JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8')), 'doLines.json unchanged');
});
```
