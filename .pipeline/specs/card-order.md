# card-order — the 17 card-tidy cards read what to look for and how to shop it, health and holistic first

```json
{
  "id": "card-order",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "server/test/acceptance/twoLinePin.js",
    "server/test/acceptance/cardTidy.test.js"
  ],
  "read_full": [
    "server/test/acceptance/twoLinePin.js",
    "server/test/acceptance/cardTidy.test.js",
    "server/scripts/twoLineCheck.js",
    "server/lib/counterCardLint.js",
    "docs/CARD-STYLE-SAMPLES.md",
    "VOICE_SPEC.md",
    "server/lib/testGuards.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/cardOrder.test.js && cd server && node scripts/buildDoLines.js && node scripts/twoLineCheck.js && node scripts/commitGuard.js && node scripts/listMatchProbe.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`, baseline HEAD `81b63d5`. Devon (2026-10-19): "what to look for how to shop health and holistic first, go". On the 17 full cards card-tidy shipped (not `pick_canned_tomatoes`, untouched), every buying_tips list reads: line 2 the why (W), then health and holistic look-fors (H: organic > Non-GMO Project Verified, skip seed oils, no carrageenan, BPA-free, wild/feed/no color added, country of origin, low-mercury species, short ingredient list, unsweetened), then how to shop the shelf or case (S: frozen vs thawed, ask if dry, read the cut, which can). Not-shopping lines (X: storage, cooking method, chemistry trivia, card pointers) are deleted when not a concern, else moved to watch_out (cap 3).
Claim lock: reorder, merge, shorten, reword, delete, or restore text from 8264bd0 or the card's own fields. No new fact or number. Not migrated.

## Change

Set `buying_tips` (and `watch_out` only where shown) on each card to EXACTLY the text below (strings verbatim, typographic quotes and the degree sign included). Nothing else moves. Summary: 15 of 17 cards only reorder; shrimp gains one restored look-for; sugars gets a new line 2 and loses 2 lines; nonGMO, popcorn lose one X line; soy_milk and canned_soup move X lines into watch_out.

### salmon_wild_vs_farmed
`decision` unchanged. Class order W H H H S. W H H H S. Sockeye/coho, the Science study and the canned-wild/country ladder come before the frozen-or-ask shelf tip.
`buying_tips` (final, in order):
```json
[
  "Wild salmon eats krill and small fish; farmed eats plant protein and vegetable oil.",
  "Sockeye and coho are almost always wild, and their color is deep because of diet, not dye.",
  "A 2004 Science study found 14 contaminants, PCBs and dioxins included, all higher in farmed salmon. Levels were well below FDA tolerance levels for bought fish.",
  "Canned wild salmon comes next; for farmed salmon, read the country of origin.",
  "Frozen wild Alaskan is the same fish, frozen at its best. ‘Fresh’ at the counter is often previously-frozen, so ask."
]
```
`watch_out` unchanged from 81b63d5.

### shrimp_imported_vs_domestic
`decision` unchanged. Class order W H H H S. W H H H S. RESTORED from 8264bd0: the uniform-size look-for, condensed to one 17-word sentence (count-per-pound grading dropped). The two shelf tips (thawed, ask if dry) merge into one so the card stays at 5.
`buying_tips` (final, in order):
```json
[
  "Country of origin is printed by law, and wild American traces to a managed fishery.",
  "Second choice is pond-raised shrimp labeled Naturland or Aquaculture Stewardship Council; last is imported shrimp.",
  "A 2015 Consumer Reports test found antibiotics in 11 of 205 raw imported pond-raised samples, from Vietnam, Thailand and Bangladesh.",
  "Uniform size and a flawless look point to pond-raised; wild shrimp come in a wide range of sizes.",
  "‘Fresh’ at the case is nearly always thawed, so frozen raw is the same shrimp. Ask the case if it is dry, since wet shrimp holds extra water."
]
```
`watch_out` unchanged from 81b63d5.

### label_nonGMO_vs_organic
`decision` unchanged. Class order W H H S. W H H S. DELETED: "Bioengineered means a new gene was inserted..." (definition; the voluntary/no-modified-DNA fact is stated once in watch_out, bioengineered stays everywhere else).
`buying_tips` (final, in order):
```json
[
  "Organic also restricts synthetic pesticides and fertilizers; non-GMO covers one issue.",
  "Choose certified organic first, with Non-GMO Project Verified a close second. Next is an unlabeled package; read any bioengineered disclosure.",
  "Ignore ‘non-GMO’ on foods that have no GMO version anyway.",
  "Look near the ingredients for “bioengineered” or “Contains Bioengineered Food Ingredients”, rather than “GMO”. A phone number or QR code may lead to the disclosure, which does not name the ingredient."
]
```
`watch_out` unchanged from 81b63d5.

### canned_fish_choosing
`decision` unchanged. Class order W H H H S. W H H H S. Line 2 becomes the card's own why ("The list should read fish, oil or water, salt..."), BPA-free and skipjack lead, bone-in is the shelf tip.
`buying_tips` (final, in order):
```json
[
  "The list should read fish, oil or water, salt. Anything longer is a sauce.",
  "Pick a can that says BPA-free; many food cans have an epoxy lining made with BPA. Fresh or frozen fish has no can lining.",
  "Skipjack, labeled ‘light’, is lower-mercury than albacore, labeled ‘white’.",
  "‘Vegetable oil’ on a tin is nearly always a seed oil blend it will not name.",
  "Bone-in and skin-on sardines and salmon. The bones soften completely."
]
```
`watch_out` unchanged from 81b63d5.

### label_wild_vs_farm_raised
`decision` unchanged. Class order W H H S S. W H H S S. watch_out unchanged.
`buying_tips` (final, in order):
```json
[
  "A bare fillet is far easier to swap for another species than whole or skin-on fish.",
  "For salmon, choose wild-caught first. For farm-raised salmon, read the country of origin.",
  "‘Color added’ on farm-raised salmon means astaxanthin in the feed sets the pink, not a dye after harvest. Wild salmon get their color from krill and shrimp.",
  "Origin can mean where it was processed, not where it was caught; a staffed counter can usually say.",
  "Cooked and breaded seafood falls outside the labeling rule."
]
```
`watch_out` unchanged from 81b63d5.

### tortillas
`decision` unchanged. Class order W H H S. W H H S.
`buying_tips` (final, in order):
```json
[
  "Masa is corn cooked and soaked in limewater; some packaged corn tortillas add wheat.",
  "Choose certified organic corn tortillas first, with Non-GMO Project Verified a close second.",
  "Most U.S. corn is bioengineered. Corn becomes grain, syrup, oil and starch.",
  "For a flour tortilla, check the flour and the named fat rather than infer them from the color."
]
```
`watch_out` unchanged from 81b63d5.

### oat_milk
`decision` unchanged. Class order W H S. W H S. watch_out stays empty.
`buying_tips` (final, in order):
```json
[
  "Oat drinks vary carton to carton in stabilizers, protein and added vitamins.",
  "Some certified organic oat drinks still use carrageenan, a seaweed thickener; pick one without it.",
  "Read the ingredient list for stabilizers, and the carton for protein and added vitamins and minerals."
]
```
`watch_out` unchanged from 81b63d5.

### canned_tuna
`decision` unchanged. Class order W H S. W H S.
`buying_tips` (final, in order):
```json
[
  "FDA puts canned light tuna in Best Choices for mercury, and albacore in Good Choices.",
  "Pick a can that says BPA-free; many food cans use an epoxy lining made with BPA. Fresh or frozen tuna comes with no can lining.",
  "Read the packing medium separately from the light or white designation."
]
```
`watch_out` unchanged from 81b63d5.

### smoked_salmon
`decision` unchanged. Class order W H H S S. W H H S S.
`buying_tips` (final, in order):
```json
[
  "Shelf-stable smoked fish is heat-treated and sealed; nova and lox rely on the cold.",
  "Choose smoked wild salmon first. For farmed smoked salmon, read the country of origin.",
  "Wild salmon get their color from krill and shrimp. Farmed salmon flesh is gray until astaxanthin in the feed sets the pink, which ‘color added’ means.",
  "Pick it from a refrigerated case and put it in the fridge soon after buying.",
  "Choose canned or jarred smoked fish to keep on the shelf."
]
```
`watch_out` unchanged from 81b63d5.

### almond_milk
`decision` unchanged. Class order W H H S S. W H H S S.
`buying_tips` (final, in order):
```json
[
  "Almond drinks vary in added sugars, so the carton panel is the guide.",
  "Pick unsweetened over sweetened, vanilla or chocolate.",
  "Some certified organic almond drinks still use carrageenan, a seaweed thickener; choose a carton with none listed.",
  "Compare protein, vitamin D, calcium and potassium across cartons.",
  "Check saturated fat on the panel."
]
```
`watch_out` unchanged from 81b63d5.

### soy_milk
`decision` unchanged. Class order W H H S. W H H S. MOVED to watch_out: "Dairy shoppers can read the Milk card." (card pointer; keeper for cardTidy C6). watch_out is now 3. NOT restored: "Compare protein and potassium across cartons." (a nutrient comparison, not a holistic look-for; the card's stance is the short list).
`buying_tips` (final, in order):
```json
[
  "Every addition is another ingredient; soybeans and water stays closest to the bean.",
  "Most U.S. soybeans are bioengineered, so choose certified organic first, with Non-GMO Project Verified a close second.",
  "Carrageenan, a seaweed thickener, appears in some certified organic foods too; choose a soy milk with none listed.",
  "A short-list unsweetened almond milk ranks above soy milk."
]
```
`watch_out` (final, in order):
```json
[
  "FDA counts only fortified soy in the dairy group, yet fortifying adds vitamins and minerals, each another ingredient.",
  "Soy lecithin and soy protein come from the same soybeans. A QR code or phone number may lead to the bioengineered disclosure.",
  "Dairy shoppers can read the Milk card."
]
```

### sugars
`decision` unchanged. Class order W H S. W H S. Line 2 is now the card's own bioengineered-beets fact (78 chars; it was the cane-and-beet chemistry line). That line, "Keep brown sugar closed..." (storage) and the bare "Plain sugar names no crop" sentence are folded: "Plain sugar names no crop" joins the organic ladder. DELETED: the cane/beet same-substance line and the brown-sugar-closed line. NOT restored: "Read the added sugars line as a percent Daily Value on a plain sugar." (panel trivia, not a holistic look-for).
`buying_tips` (final, in order):
```json
[
  "More than half of granulated sugar sold comes from bioengineered sugar beets.",
  "Plain “sugar” names no crop, so choose certified organic first; organic must come from non-GMO plants. Non-GMO Project Verified is a close second.",
  "Pick light or dark brown sugar; dark carries more molasses."
]
```
`watch_out` unchanged from 81b63d5.

### cooking_oils
`decision` unchanged. Class order W H H H S. W H H H S.
`buying_tips` (final, in order):
```json
[
  "“Vegetable oil” on a label names a category, without any seed or fruit.",
  "Skip sunflower, safflower, canola, soybean, corn and cottonseed oils; the last four come from mostly bioengineered crops.",
  "Skip avocado oil too: the label cannot prove the oil is pure.",
  "Read the list for BHA, BHT, TBHQ or propyl gallate, preservatives added to oils, and choose a list without them.",
  "Read the label for the oil’s name first, then refined or unrefined."
]
```
`watch_out` unchanged from 81b63d5.

### canned_coconut_milk
`decision` unchanged. Class order W H H S. W H H S.
`buying_tips` (final, in order):
```json
[
  "Many cans add a gum such as guar gum to thicken the milk and hold it steady.",
  "Pick a can that says BPA-free; many cans have an epoxy lining made with BPA. Where the same coconut milk is sold in glass, the jar has no can lining.",
  "Compare two cans by how much the list holds beyond coconut.",
  "Read the ingredients for guar gum or another gum."
]
```
`watch_out` unchanged from 81b63d5.

### canned_soup
`decision` unchanged. Class order W H S. W H S. MOVED to watch_out (one merged line): storage "Store cans cool and dry, between 50 °F and 70 °F..." and "Wipe the lid... covered container in the refrigerator" (both X; 50 and refrigerator are cardTidy C6 keepers). watch_out is now 3.
`buying_tips` (final, in order):
```json
[
  "Low sodium is a fixed ceiling; reduced sodium only means less than a named soup.",
  "Pick a can that says BPA-free; many food cans are lined with an epoxy made with BPA. Fresh or frozen soup has no can lining.",
  "Leave cans with deep dents, seam dents, leaks, rust or bulging lids on the shelf."
]
```
`watch_out` (final, in order):
```json
[
  "“No salt added” is not “sodium free”; the soup can still carry sodium.",
  "BPA-free is the maker’s word. EWG’s survey found makers define it as they wish. Makers that dropped BPA did not disclose the lining that replaced it.",
  "Store cans cool and dry, between 50 °F and 70 °F, with the oldest in front. Wipe the lid before opening, and move opened soup to a covered container in the refrigerator."
]
```

### tortilla_chips
`decision` unchanged. Class order W H H H H. W H H H H. Organic ladder now precedes its bioengineered reason. watch_out unchanged.
`buying_tips` (final, in order):
```json
[
  "Lime-cooked corn grinds into masa, a dough; untreated cornmeal cannot form one.",
  "Check the frying fat in the ingredients; choose masa chips cooked in olive oil, coconut oil, tallow or lard.",
  "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
  "Choose certified organic tortilla chips first, with Non-GMO Project Verified a close second.",
  "Most U.S. corn is bioengineered. Corn becomes grain, syrup, oil and starch."
]
```
`watch_out` unchanged from 81b63d5.

### popcorn
`decision` unchanged. Class order W H H H. W H H H. DELETED: "Loose kernels pop in a plain brown paper bag in the microwave." (cooking method, not a concern). "old maids" stays dropped. watch_out unchanged.
`buying_tips` (final, in order):
```json
[
  "Plain kernels pop with no oil, so any butter, oil or salt is your call.",
  "Pop kernels at home in coconut oil, butter or tallow, then salt to taste.",
  "Microwave and ready-popped bags name their oil in the list; skip sunflower, safflower, canola, soybean, corn and cottonseed oil.",
  "CSPI says popcorn is never bioengineered, so a non-GMO seal on plain kernels adds nothing."
]
```
`watch_out` unchanged from 81b63d5.

## Hard limits

- Claim lock above. Never delete a concern's only statement (C8 keepers stay green; cardTidy C6 keepers stay green).
- Non-negotiables 2 to 9: no health or treatment claim, no hormone or bodily-effect wording, no first person, no em dash, no price, no brand name.
- Do not touch decision, why, depth fields, sources, aliases, asked_as, cart_pick, tier_note, `pick_canned_tomatoes`, or any other card. Decisions unchanged, so `docs/do-lines-review.md` and `server/lib/doLines.json` do not change (`buildDoLines.js` must write no diff).
- Never edit `fixtures/*`, `*.before.json`, or `twoLinePin.test.js`. Not migrated; do not run the migration script.

## Pins and older tests (from the DRY RUN: baseline `npm test` 2811 pass / 0 fail)

- `server/test/acceptance/twoLinePin.js`: re-pin `buying_tips` in `TWO_LINE` for the 17 cards to the live values (`watch_out` too for soy_milk and canned_soup, the only pins that carry a changed watch_out). `twoLinePin.test.js` asserts pins equal live and passes after this. No new overlay is needed: the older frozen-history tests already read the 18 cards through `preTidy` (8264bd0), whose text this change does not touch; a `preOrder` overlay is NOT added.
- `server/test/acceptance/cardTidy.test.js`: the only edit is deleting `/brown paper bag/i` from the `popcorn` row of `KEEP` (line 43). That keeper pinned the cooking-method line this change deletes as X; every other cardTidy invariant (caps, no scaffolding, concern keepers, byte-identity) is untouched and green. It does not pin order or exact text, so it needs no overlay.
- Dry-run results with these edits: `cardOrder.test.js` 10/10; baseline (before the KB edit) it was RED on C1, C2, C3, C4, C5 and C9 (C6, C7, C8, C10 are guards and pass on both sides); `buildDoLines.js` wrote 182 do lines with no diff; `twoLineCheck.js` 181 checked, 0 violations; `commitGuard.js` clean (files staged); `listMatchProbe.js` 0/7 wrong; `npm test` 2821 tests, 2821 pass, 0 fail (2811 baseline + 10 new). Tree restored afterwards.

## Criteria

- C1 [test] `buying_tips` of the 17 cards deep-equal the final arrays below, in order.
- C2 [test] Class order per card is W then H then S (why, health/holistic look-fors, shelf how-to): tagged by per-card regexes, equal to the stated order, no H after an S, no untagged tip.
- C3 [test] Line 2 contains and equals no decision text; it is byte-equal to 81b63d5 line 2 except sugars (and canned_fish_choosing, whose own why line moves to line 2); sugars line 2 is the bioengineered-beets sentence, at most 90 characters, not an instruction.
- C4 [test] No not-shopping line in `buying_tips`: brown sugar closed, paper bag, Milk card, can storage, wipe the lid, gene definition, cane/beet same substance, old maids. The Milk card line is in soy_milk `watch_out`; the storage line is in canned_soup `watch_out`; popcorn `watch_out` is unchanged.
- C5 [test] Shrimp carries the uniform-size look-for (starts "Uniform size and a flawless look point to pond-raised", at most 20 words, text from 8264bd0). soy_milk has no "Compare protein"; sugars has no "added sugars line"; popcorn has no "old maids".
- C6 [test] Caps on the 17 cards: 3 to 5 tips, at most 3 watch_out, at most 20 words a sentence, line 2 at most 90 characters, no duplicate line.
- C7 [test] Claim lock: every number in the new text appears on the card at 8264bd0 or 81b63d5; no dash, first person, health or hormone wording, price word.
- C8 [test] Concern keepers: for 55 concern regexes (bioengineered, organic, Non-GMO Project Verified, carrageenan, BPA-free, EWG, antibiotic, country of origin, astaxanthin, color added, Listeria, skipjack, mercury, avocado, QR, BHA, guar, 50 °F, refrigerat, Milk card, ...), whatever a card matched at 81b63d5 it still matches.
- C9 [test] Every field other than `buying_tips` equals 81b63d5 on the 17 cards and on `pick_canned_tomatoes` (watch_out differs only on soy_milk and canned_soup, by the exact final arrays); every unlisted card is byte-identical; entry count and top-level fields unchanged.
- C10 [test] Decisions unchanged, so `doLines.json` equals 81b63d5.

Also (verify, not a criterion): whole suite green; `twoLineCheck` 181 checked, 0 violations; `buildDoLines.js` writes no diff; `listMatchProbe.js` no wrong matches.

## Contract
```json
{
  "criteria": [
    {
      "id": "C1",
      "impl": [
        "server/kristy_perimeter_kb.json",
        "server/test/acceptance/twoLinePin.js"
      ],
      "tests": [
        "server/test/acceptance/cardOrder.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C2",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cardOrder.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C3",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cardOrder.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C4",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cardOrder.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C5",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cardOrder.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C6",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cardOrder.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C7",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cardOrder.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C8",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cardOrder.test.js"
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
        "server/test/acceptance/cardOrder.test.js"
      ],
      "dependents": []
    },
    {
      "id": "C10",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/cardOrder.test.js"
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

## Acceptance server/test/acceptance/cardOrder.test.js

```js
// card-order: the 17 card-tidy cards read what to look for and how to shop it, health and holistic first (Devon 2026-10-19).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';
import doLines from '../../lib/doLines.json' with { type: 'json' };

const ROOT = new URL('../../../', import.meta.url).pathname;
const git = (ref) => JSON.parse(execFileSync('git', ['show', `${ref}:server/kristy_perimeter_kb.json`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const base = git('81b63d5'); // the tidied cards as shipped
const old = git('8264bd0'); // before card-tidy, for restored text and the claim lock
const find = (k, id) => { const e = k.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const card = (id) => find(kb, id);
const lines = (e) => [...(e.buying_tips || []), ...(e.watch_out || [])];
const text = (e) => [e.decision, ...lines(e)].join(' \n ');
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
const sentences = (s) => String(s).split(/(?<=[.!?])\s+(?=[A-Z‘“"])/).filter(Boolean);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const nums = (s) => String(s).match(/\d[\d,.]*/g)?.map((n) => n.replace(/[.,]+$/, '')) ?? [];

// F = final buying_tips, WO = final watch_out where it changes, CL = class order (W why, H health/holistic look-for, S shelf/case how-to).
const { F, WO, CL } = {
  "F": {
    "salmon_wild_vs_farmed": [
      "Wild salmon eats krill and small fish; farmed eats plant protein and vegetable oil.",
      "Sockeye and coho are almost always wild, and their color is deep because of diet, not dye.",
      "A 2004 Science study found 14 contaminants, PCBs and dioxins included, all higher in farmed salmon. Levels were well below FDA tolerance levels for bought fish.",
      "Canned wild salmon comes next; for farmed salmon, read the country of origin.",
      "Frozen wild Alaskan is the same fish, frozen at its best. ‘Fresh’ at the counter is often previously-frozen, so ask."
    ],
    "shrimp_imported_vs_domestic": [
      "Country of origin is printed by law, and wild American traces to a managed fishery.",
      "Second choice is pond-raised shrimp labeled Naturland or Aquaculture Stewardship Council; last is imported shrimp.",
      "A 2015 Consumer Reports test found antibiotics in 11 of 205 raw imported pond-raised samples, from Vietnam, Thailand and Bangladesh.",
      "Uniform size and a flawless look point to pond-raised; wild shrimp come in a wide range of sizes.",
      "‘Fresh’ at the case is nearly always thawed, so frozen raw is the same shrimp. Ask the case if it is dry, since wet shrimp holds extra water."
    ],
    "label_nonGMO_vs_organic": [
      "Organic also restricts synthetic pesticides and fertilizers; non-GMO covers one issue.",
      "Choose certified organic first, with Non-GMO Project Verified a close second. Next is an unlabeled package; read any bioengineered disclosure.",
      "Ignore ‘non-GMO’ on foods that have no GMO version anyway.",
      "Look near the ingredients for “bioengineered” or “Contains Bioengineered Food Ingredients”, rather than “GMO”. A phone number or QR code may lead to the disclosure, which does not name the ingredient."
    ],
    "canned_fish_choosing": [
      "The list should read fish, oil or water, salt. Anything longer is a sauce.",
      "Pick a can that says BPA-free; many food cans have an epoxy lining made with BPA. Fresh or frozen fish has no can lining.",
      "Skipjack, labeled ‘light’, is lower-mercury than albacore, labeled ‘white’.",
      "‘Vegetable oil’ on a tin is nearly always a seed oil blend it will not name.",
      "Bone-in and skin-on sardines and salmon. The bones soften completely."
    ],
    "label_wild_vs_farm_raised": [
      "A bare fillet is far easier to swap for another species than whole or skin-on fish.",
      "For salmon, choose wild-caught first. For farm-raised salmon, read the country of origin.",
      "‘Color added’ on farm-raised salmon means astaxanthin in the feed sets the pink, not a dye after harvest. Wild salmon get their color from krill and shrimp.",
      "Origin can mean where it was processed, not where it was caught; a staffed counter can usually say.",
      "Cooked and breaded seafood falls outside the labeling rule."
    ],
    "tortillas": [
      "Masa is corn cooked and soaked in limewater; some packaged corn tortillas add wheat.",
      "Choose certified organic corn tortillas first, with Non-GMO Project Verified a close second.",
      "Most U.S. corn is bioengineered. Corn becomes grain, syrup, oil and starch.",
      "For a flour tortilla, check the flour and the named fat rather than infer them from the color."
    ],
    "oat_milk": [
      "Oat drinks vary carton to carton in stabilizers, protein and added vitamins.",
      "Some certified organic oat drinks still use carrageenan, a seaweed thickener; pick one without it.",
      "Read the ingredient list for stabilizers, and the carton for protein and added vitamins and minerals."
    ],
    "canned_tuna": [
      "FDA puts canned light tuna in Best Choices for mercury, and albacore in Good Choices.",
      "Pick a can that says BPA-free; many food cans use an epoxy lining made with BPA. Fresh or frozen tuna comes with no can lining.",
      "Read the packing medium separately from the light or white designation."
    ],
    "smoked_salmon": [
      "Shelf-stable smoked fish is heat-treated and sealed; nova and lox rely on the cold.",
      "Choose smoked wild salmon first. For farmed smoked salmon, read the country of origin.",
      "Wild salmon get their color from krill and shrimp. Farmed salmon flesh is gray until astaxanthin in the feed sets the pink, which ‘color added’ means.",
      "Pick it from a refrigerated case and put it in the fridge soon after buying.",
      "Choose canned or jarred smoked fish to keep on the shelf."
    ],
    "almond_milk": [
      "Almond drinks vary in added sugars, so the carton panel is the guide.",
      "Pick unsweetened over sweetened, vanilla or chocolate.",
      "Some certified organic almond drinks still use carrageenan, a seaweed thickener; choose a carton with none listed.",
      "Compare protein, vitamin D, calcium and potassium across cartons.",
      "Check saturated fat on the panel."
    ],
    "soy_milk": [
      "Every addition is another ingredient; soybeans and water stays closest to the bean.",
      "Most U.S. soybeans are bioengineered, so choose certified organic first, with Non-GMO Project Verified a close second.",
      "Carrageenan, a seaweed thickener, appears in some certified organic foods too; choose a soy milk with none listed.",
      "A short-list unsweetened almond milk ranks above soy milk."
    ],
    "sugars": [
      "More than half of granulated sugar sold comes from bioengineered sugar beets.",
      "Plain “sugar” names no crop, so choose certified organic first; organic must come from non-GMO plants. Non-GMO Project Verified is a close second.",
      "Pick light or dark brown sugar; dark carries more molasses."
    ],
    "cooking_oils": [
      "“Vegetable oil” on a label names a category, without any seed or fruit.",
      "Skip sunflower, safflower, canola, soybean, corn and cottonseed oils; the last four come from mostly bioengineered crops.",
      "Skip avocado oil too: the label cannot prove the oil is pure.",
      "Read the list for BHA, BHT, TBHQ or propyl gallate, preservatives added to oils, and choose a list without them.",
      "Read the label for the oil’s name first, then refined or unrefined."
    ],
    "canned_coconut_milk": [
      "Many cans add a gum such as guar gum to thicken the milk and hold it steady.",
      "Pick a can that says BPA-free; many cans have an epoxy lining made with BPA. Where the same coconut milk is sold in glass, the jar has no can lining.",
      "Compare two cans by how much the list holds beyond coconut.",
      "Read the ingredients for guar gum or another gum."
    ],
    "canned_soup": [
      "Low sodium is a fixed ceiling; reduced sodium only means less than a named soup.",
      "Pick a can that says BPA-free; many food cans are lined with an epoxy made with BPA. Fresh or frozen soup has no can lining.",
      "Leave cans with deep dents, seam dents, leaks, rust or bulging lids on the shelf."
    ],
    "tortilla_chips": [
      "Lime-cooked corn grinds into masa, a dough; untreated cornmeal cannot form one.",
      "Check the frying fat in the ingredients; choose masa chips cooked in olive oil, coconut oil, tallow or lard.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Choose certified organic tortilla chips first, with Non-GMO Project Verified a close second.",
      "Most U.S. corn is bioengineered. Corn becomes grain, syrup, oil and starch."
    ],
    "popcorn": [
      "Plain kernels pop with no oil, so any butter, oil or salt is your call.",
      "Pop kernels at home in coconut oil, butter or tallow, then salt to taste.",
      "Microwave and ready-popped bags name their oil in the list; skip sunflower, safflower, canola, soybean, corn and cottonseed oil.",
      "CSPI says popcorn is never bioengineered, so a non-GMO seal on plain kernels adds nothing."
    ]
  },
  "WO": {
    "soy_milk": [
      "FDA counts only fortified soy in the dairy group, yet fortifying adds vitamins and minerals, each another ingredient.",
      "Soy lecithin and soy protein come from the same soybeans. A QR code or phone number may lead to the bioengineered disclosure.",
      "Dairy shoppers can read the Milk card."
    ],
    "canned_soup": [
      "“No salt added” is not “sodium free”; the soup can still carry sodium.",
      "BPA-free is the maker’s word. EWG’s survey found makers define it as they wish. Makers that dropped BPA did not disclose the lining that replaced it.",
      "Store cans cool and dry, between 50 °F and 70 °F, with the oldest in front. Wipe the lid before opening, and move opened soup to a covered container in the refrigerator."
    ]
  },
  "CL": {
    "salmon_wild_vs_farmed": "WHHHS",
    "shrimp_imported_vs_domestic": "WHHHS",
    "label_nonGMO_vs_organic": "WHHS",
    "canned_fish_choosing": "WHHHS",
    "label_wild_vs_farm_raised": "WHHSS",
    "tortillas": "WHHS",
    "oat_milk": "WHS",
    "canned_tuna": "WHS",
    "smoked_salmon": "WHHSS",
    "almond_milk": "WHHSS",
    "soy_milk": "WHHS",
    "sugars": "WHS",
    "cooking_oils": "WHHHS",
    "canned_coconut_milk": "WHHS",
    "canned_soup": "WHS",
    "tortilla_chips": "WHHHH",
    "popcorn": "WHHH"
  }
};
const IDS = Object.keys(F);
const PICK = 'pick_canned_tomatoes';

// Shelf-and-case tips, one per card where there is one. Everything else after the why is a health/holistic look-for.
const SHELF = {
  salmon_wild_vs_farmed: /^Frozen wild Alaskan/,
  shrimp_imported_vs_domestic: /^‘Fresh’ at the case/,
  label_nonGMO_vs_organic: /^Look near the ingredients/,
  canned_fish_choosing: /^Bone-in/,
  label_wild_vs_farm_raised: /^(Origin can mean|Cooked and breaded)/,
  tortillas: /^For a flour tortilla/,
  oat_milk: /^Read the ingredient list/,
  canned_tuna: /^Read the packing medium/,
  smoked_salmon: /^(Pick it from a refrigerated|Choose canned or jarred)/,
  almond_milk: /^(Compare protein|Check saturated)/,
  soy_milk: /almond milk ranks above/,
  sugars: /^Pick light or dark/,
  cooking_oils: /^Read the label for the oil/,
  canned_coconut_milk: /^Read the ingredients for guar/,
  canned_soup: /^Leave cans with/,
};
const HEALTH = /organic|Non-GMO|bioengineered|carrageenan|BPA|mercury|antibiotic|country of origin|[Ss]kip|color|wild|unsweetened|seed oil|Naturland|pond-raised|BHA|coconut|tallow|Science|vegetable oil|beyond|Bone|list should/i;
const klass = (id, t, i) => (i === 0 ? 'W' : SHELF[id]?.test(t) ? 'S' : HEALTH.test(t) ? 'H' : '?');

// Concern points that must survive: if the card said it at 81b63d5, it still does (order is the only thing that moved).
const CONCERNS = [/bioengineered/i, /Non-GMO Project Verified/i, /organic/i, /carrageenan/i, /BPA-free/i, /EWG/i, /antibiotic/i, /country of origin/i, /astaxanthin/i, /color added/i, /Listeria/i, /skipjack/i, /mercury/i, /avocado/i, /QR/, /phone number/i, /BHA/, /guar/i, /glass/i, /sodium/i, /dent/i, /50 °F/, /refrigerat/i, /Milk card/i, /molasses/i, /coconut sugar/i, /voluntary/i, /krill/i, /Alaska/i, /Science/, /PCB/, /Oceana/i, /Consumer Reports/i, /Southern Shrimp/i, /Naturland/i, /stabilizer/i, /protein/i, /vitamin/i, /saturated fat/i, /dairy group/i, /lecithin/i, /masa/i, /tallow/i, /canola/i, /CSPI/, /doctor/i, /fillet/i, /breaded/i, /packing medium/i, /albacore/i, /bone/i, /vegetable oil/i, /refined/i, /wheat/i, /lime/i];

test('C1 buying_tips of the 17 cards are exactly the final arrays, in order', () => {
  nonEmpty(IDS, 'cards', 17);
  for (const id of IDS) assert.deepEqual(card(id).buying_tips, F[id], `${id}: buying_tips`);
});

test('C2 each card reads W then H then S: the why, health and holistic look-fors, then shelf how-to; no H after an S', () => {
  for (const id of IDS) {
    const got = card(id).buying_tips.map((t, i) => klass(id, t, i)).join('');
    assert.equal(got, CL[id], `${id}: ${got}`);
    assert.doesNotMatch(got, /S.*H/, `${id}: an H tip follows an S tip`);
    assert.doesNotMatch(got, /\?/, `${id}: untagged tip`);
  }
});

test('C3 line 2 is a why: unchanged where it already was, never repeats the decision; sugars takes the bioengineered-beets why', () => {
  for (const id of IDS) {
    const e = card(id), l2 = e.buying_tips[0];
    assert.ok(!norm(l2).includes(norm(e.decision)) && norm(l2) !== norm(e.decision), `${id}: line 2 contains the decision`);
    assert.ok(l2.length <= 90 || id !== 'sugars', `${id}: ${l2.length} chars`);
    if (id !== 'sugars') assert.equal(l2, find(base, id).buying_tips[id === 'canned_fish_choosing' ? 2 : 0], `${id}: line 2 changed`);
  }
  assert.equal(card('sugars').buying_tips[0], 'More than half of granulated sugar sold comes from bioengineered sugar beets.');
  assert.doesNotMatch(card('sugars').buying_tips[0], /^(choose|pick|buy|read|check|look|skip|compare)\b/i);
});

test('C4 not-shopping lines (brown sugar closed, brown paper bag, Milk card, can storage, gene definition) are out of buying_tips', () => {
  for (const id of IDS) for (const t of card(id).buying_tips) {
    assert.doesNotMatch(t, /brown sugar closed|Keep brown sugar|paper bag|Milk card|Store cans|Wipe the lid|new gene was inserted|same substance|old maids/i, `${id}: "${t}"`);
  }
  assert.ok(card('soy_milk').watch_out.includes('Dairy shoppers can read the Milk card.'), 'Milk card moved to watch_out');
  assert.match(card('canned_soup').watch_out.at(-1), /50 °F[\s\S]*Wipe the lid[\s\S]*refrigerator/, 'storage moved to watch_out');
  assert.equal(JSON.stringify(card('popcorn').watch_out), JSON.stringify(find(base, 'popcorn').watch_out), 'popcorn paper bag deleted, not moved');
});

test('C5 restored look-for: shrimp has the uniform-size tip; soy compare and sugars added-sugars stay out', () => {
  const t = card('shrimp_imported_vs_domestic').buying_tips.find((s) => /^Uniform size and a flawless look point to pond-raised/.test(s));
  assert.ok(t, 'shrimp uniform-size tip');
  assert.ok(words(t) <= 20, `${words(t)} words`);
  assert.ok(lines(find(old, 'shrimp_imported_vs_domestic')).some((s) => s.includes('Uniform size and a flawless look point to pond-raised') && s.includes('a wide range of sizes')), 'text comes from 8264bd0');
  assert.doesNotMatch(text(card('soy_milk')), /Compare protein/i);
  assert.doesNotMatch(text(card('sugars')), /added sugars line/i);
  assert.doesNotMatch(text(card('popcorn')), /old maids/i);
});

test('C6 caps: 3 to 5 tips, at most 3 watch_out, 20 words a sentence, line 2 at most 90 characters', () => {
  for (const id of IDS) {
    const e = card(id);
    assert.ok(e.buying_tips.length >= 3 && e.buying_tips.length <= 5, `${id}: ${e.buying_tips.length} tips`);
    assert.ok((e.watch_out || []).length <= 3, `${id}: ${(e.watch_out || []).length} watch_out`);
    assert.ok(e.buying_tips[0].length <= 90, `${id}: line 2 is ${e.buying_tips[0].length} chars`);
    for (const s of lines(e)) for (const p of sentences(s)) assert.ok(words(p) <= 20, `${id}: ${words(p)}-word sentence "${p}"`);
    const seen = new Set();
    for (const s of lines(e)) { const n = norm(s); assert.ok(!seen.has(n), `${id}: duplicate "${s}"`); seen.add(n); }
  }
});

test('C7 claim lock: every number in the new text existed at 8264bd0 or 81b63d5; no banned wording', () => {
  for (const id of IDS) {
    const had = JSON.stringify(find(old, id)) + JSON.stringify(find(base, id));
    for (const n of nums(text(card(id)))) assert.ok(had.includes(n), `${id}: new number ${n}`);
    const t = text(card(id));
    assert.doesNotMatch(t, /—|–/, `${id}: dash`);
    assert.doesNotMatch(t, /\b(I|I'm|I’ve|me|my|mine|we|our|us)\b/, `${id}: first person`);
    assert.doesNotMatch(t, /\b(hormones?|estrogen|testosterone|cures?|treats?|treatment|prevents?|disease|cancer|heals?)\b/i, `${id}: health claim`);
    assert.doesNotMatch(t, /[$€£]\s?\d|\bprice|\bcheap|\bcost\b|\bdollars?\b/i, `${id}: price`);
  }
});

test('C8 concern keepers: whatever a card said at 81b63d5 it still says', () => {
  nonEmpty(CONCERNS, 'concern regexes', 40);
  for (const id of IDS) for (const re of CONCERNS) {
    if (re.test(text(find(base, id)))) assert.match(text(card(id)), re, `${id}: ${re} dropped`);
  }
});

test('C9 everything else is byte-identical to 81b63d5: decisions, watch_out outside soy_milk and canned_soup, depth fields, other cards, top level', () => {
  for (const id of [...IDS, PICK]) {
    const a = card(id), b = find(base, id);
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (k === 'buying_tips') continue;
      if (k === 'watch_out' && WO[id]) { assert.deepEqual(a.watch_out, WO[id], `${id}: watch_out`); continue; }
      assert.deepEqual(a[k], b[k], `${id}: ${k} changed`);
    }
    if (id === PICK) assert.deepEqual(a.buying_tips, b.buying_tips);
  }
  const rest = kb.entries.filter((e) => !IDS.includes(e.id) && e.id !== PICK);
  nonEmpty(rest, 'unlisted cards', 100);
  for (const e of rest) assert.equal(JSON.stringify(e), JSON.stringify(find(base, e.id)), `${e.id} changed`);
  assert.equal(kb.entries.length, base.entries.length);
  assert.deepEqual({ ...kb, entries: 0 }, { ...base, entries: 0 }, 'top-level KB fields');
});

test('C10 decisions unchanged, so doLines.json equals HEAD 81b63d5', () => {
  const now = execFileSync('git', ['show', '81b63d5:server/lib/doLines.json'], { cwd: ROOT }).toString();
  assert.deepEqual(JSON.parse(now), doLines);
});
```
