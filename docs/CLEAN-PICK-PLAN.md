# CLEAN-PICK PLAN: every pick names the item's best version

Planned 2026-10-20 against `server/kristy_perimeter_kb.json` at `ede90e7` (211 entries: 181 cards + 30 `kind: "pick"`).
Status: PLAN only, nothing has been built. Devon approves before anything is dispatched.

## Devon's direction (2026-10-20, verbatim)

1. "we are clear throughout the app on the 'dont get any synthetic shit' right, like someone shouldnt just be grabbing run of the mil coconut or maples ugar but organic, no bs tpye of thing, and thats the case for every item, it should be."
2. "everything should be organic, no additives, no synthetic bs, from nature, as close to the source as possible"
3. "we dont want to just tack on a 'get organic' to every single item but rather, point them to the cleanest and healthiest version of the item they are getting that means wild caught salmon, 100% grass fed beef, things like that"

**Problem.** A shopper who reads only the headline and the cart pick buys the ordinary version. Today:
- "Coconut sugar or pure maple sugar" leads to plain coconut sugar.
- "Deep yellow butter" doesn't say grass-fed.
- "Half-and-half" leads to a carton with gums.
- "Plain chicken breast" doesn't say how the bird was raised.

**Need.** Each card's top lines name the best version *of that item*, using the item's own standard:
- wild-caught salmon;
- 100% grass-fed and grass-finished beef;
- pasture-raised eggs and poultry;
- organic where organic is the item's defining standard;
- nothing added;
- unfortified;
- the least-processed form.

The top lines are `decision`, `cart_pick` (on a pick, its `decision`), and `buying_tips[0..1]`.

## The four tests (per entry, on its pick)

| Test | Passes when the top lines name… | Fails when… |
|---|---|---|
| **T1 Best standard** | the item-specific standard: wild-caught (seafood), 100% grass-fed / grass-finished (beef, lamb, bison, dairy), pasture-raised (eggs, poultry, pork), raw from a named farm (raw dairy), organic only where it is the defining standard (see below) | the item has such a standard and neither `decision` nor `cart_pick` names it |
| **T2 No additives** | a list that rules out the gums, carrageenan, natural flavors, preservatives, added sugar, seed oil or colors *the default shelf version carries* | the usual version carries one and nothing in the top lines rules it out |
| **T3 No synthetic** | unfortified, unenriched, no synthetic sweetener | the pick allows a fortified or enriched version |
| **T4 Closest to source** | the least-processed form *of the same food* | a less-processed form of the same food exists and is not named |

**Where organic is the defining standard:**
- produce;
- the crops grown as bioengineered in the US: corn, soy, sugar. That covers tortillas, popcorn, tortilla chips, tofu, tempeh, miso, natto, soy sauce, soy milk and plain sugar;
- poultry and pork, as "pasture-raised or organic". That pairing is already used on the pork, bacon and ham cards.

Elsewhere organic is added only if scout question 7 quotes the card's own material already ranking organic (the 12 candidates in B8). Otherwise the card keeps its item standard.

**Fixed rules:**
- **No boilerplate (Devon, quote 3).** No sentence is added to many cards.
  - What USDA organic means stays where it already lives: `label_organic_scope`, `label_nonGMO_vs_organic`, `organic_worth_it_by_type`. All three already say organic "restricts" synthetic pesticides or names "the prohibited list".
  - One blunt line remains: `organic_worth_it_by_type` `labels_decoded` says "no SYNTHETIC pesticides" (KB line 840). B2 narrows it to "synthetic pesticides outside an approved list". The source is `docs/sources/item-cards/7cfr205.105-prohibited-substances.md` (url `https://www.law.cornell.edu/cfr/text/7/205.105`).
  - No new or changed string may appear on more than 2 entries (C10).
- **"Healthiest" is a ranking, not a claim.** Lines rank by processing and standard ("closest to the plant", "one ingredient", "nothing added"). No bodily or health wording (rules 2 and 3), no price (rule 8), no brands (rule 9). No new line says "synthetic" outside that one narrowing.
- **T4 stays within the card's food.** Nuggets become whole-muscle nuggets. A card never sends the shopper to a different food.
- **Two-line rule.**
  - `decision` is ≤10 words.
  - `buying_tips[0]` is a why; `buying_tips[1]` is the look-for naming the standard.
  - A line that gets displaced moves down or into `watch_out`/`detail` and is never deleted.
  - Verdict subjects hold (rule 7) unless a ruling below changes them.

## Rulings needed (each gates only its own cards; B1 is gated by none)

| Q | What | Today | A | B | Gates |
|---|---|---|---|---|---|
| **Q1** | 6 produce cards decide *conventional* (`produce_root_vegetables` carrots, `produce_brassicas`, `produce_onions_garlic`, `produce_citrus`, `produce_mushrooms`, `produce_bananas`), defended by `organic_worth_it_by_type` and `label_organic_scope` | Conventional for peeled | **Recommended:** organic on every produce card. The peel/residue reasoning stays as a fact in `detail`; "if organic means fewer vegetables, buy conventional and eat more" stays as `watch_out` | Keep the 6 conventional verdicts | 8 cards in B2; peeled picks in B7a |
| **Q2** | Cured meats: their own material says "celery powder supplies nitrite" | Organic or pasture-raised, cure named | Name the no-nitrite form where it exists (salt-only cured, fresh). `bacon`/`hot_dogs` change subject | **Recommended:** keep. The cure is named honestly and is not synthetic | `deli_meat_uncured`, `bacon`, `ham`, `cured_pork` |
| **Q3** | `salt` decides *iodized, anti-caking named*; its cart is *pickling or canning salt*. The two disagree | Mixed | **Recommended:** keep iodized (rule 7) and align the cart to it | Flip to salt with nothing added, iodine to `watch_out` | `salt` (B6) |
| **Q5** | Fortification. `soy_milk` resolved a fortified trade-off on 2026-10-19; `nutritional_yeast` decides "either type" | Fortified allowed | **Recommended:** Devon's quote 2 is the ruling: unfortified first, fortified named second in `watch_out` | Keep fortified as an equal choice | `soy_milk`, `oat_milk`, `almond_milk`, `coconut_milk_beverage`, `nutritional_yeast`, `breakfast_cereal` |

(Q4 from the earlier draft, raw dairy, is dissolved. "Raw from a farm you can name" is the item standard, so those cards pass.)

## Classification and failures

The calls come from the top lines at `ede90e7` plus what the default shelf product carries. Before each spec, scout question 7 confirms each T2/T3/T4 call against the card's own material. A call it cannot back is dropped into ship notes and never becomes a new claim.

| Class | Entries | Pass all four | Fail ≥1 (definite) | Conditional |
|---|---|---|---|---|
| A, farm/packaged food | 123 | 30 | 77 | 16 (12 organic candidates, B8 + 4 under Q2 = A) |
| B, wild / water / salt / seaweed | 17 | 14 | 3 (`white_fish`, `smoked_salmon`, `salt`) | — |
| C, label / technique / hub | 41 | 39 | 2 (`organic_worth_it_by_type`, `label_organic_scope`, Q1) | — |
| P, picks | 30 | 1 (`pick_anchovies`) | 29 | — |
| **Total** | **211** | **84** | **111** (82 cards + 29 picks) | **16** |

Every id below was checked against the KB's id list at `ede90e7`.

### Failures by test (cards; one card can fail several)

**T1 Best standard (46):**

| Standard missing | Cards |
|---|---|
| Pasture-raised or organic | `rotisserie_chicken`, `chicken_breast`, `chicken_cuts_basics`, `turkey_whole`, `ground_turkey`, `frozen_nuggets` |
| 100% grass-fed / pasture-raised | `butcher_counter_asking`, `organ_meats`, `lard_tallow` |
| Grass-fed dairy | `grassfed_butter` (cart only), `cheese_real_vs_processed`, `cream_vs_creamer`, `sour_cream`, `cream_cheese`, `cottage_cheese`, `ice_cream`, `ghee`, `goat_sheep_dairy` (pasture) |
| Wild-caught | `white_fish`, `smoked_salmon` |
| Organic produce | `frozen_vs_fresh_produce`, `produce_seasonality`, `sprouts_raw`; `cart_pick` only on `berries_picking`, `produce_leafy_greens`, `produce_peppers`, `produce_apples_pears`, `produce_stone_fruit`, `produce_green_beans`; Q1: `produce_root_vegetables`, `produce_brassicas`, `produce_onions_garlic`, `produce_citrus`, `produce_mushrooms`, `produce_bananas`, `organic_worth_it_by_type`, `label_organic_scope` |
| Organic (bioengineered crop) | `sugars`, `tortillas`, `tortilla_chips`, `popcorn`, `soy_milk`, `miso`, `tempeh`, `natto`, `hot_soy_sauce` |

**T2 No additives (37):**
- Dairy and plant milks: `cheese_real_vs_processed`, `cream_vs_creamer`, `cottage_cheese`, `ice_cream`, `almond_milk`, `oat_milk`, `coconut_milk_beverage`, `canned_coconut_milk`, `coconut_water`, `plant_butter`.
- Bread and grains: `sandwich_bread`, `bagels`, `buns_rolls`, `gluten_free_bread`, `pastries_muffins`, `breakfast_cereal`, `crackers`, `pretzels`.
- Snacks: `snack_bars`, `trail_mix`.
- Condiments, ferments and soup: `pasta_sauce`, `jam`, `ketchup_mustard`, `mayo`, `hummus`, `olives`, `kombucha`, `broth`, `canned_soup`.
- Frozen: `frozen_pizza`, `frozen_meals`, `frozen_waffles`, `frozen_nuggets`.
- Meat and seafood: `hot_dogs`, `turkey_bacon`, `smoked_salmon`.
- `salt` (Q3).

**T3 No synthetic (16):**
- Fortified (Q5): `breakfast_cereal`, `oat_milk`, `almond_milk`, `soy_milk`, `coconut_milk_beverage`, `nutritional_yeast`.
- Enriched flour not ruled out: `bagels`, `sourdough`, `pastries_muffins`, `pretzels`, `fresh_pasta`, `frozen_pizza`, `frozen_waffles`, `flour_basics` (white-flour half), `rice_arsenic`.
- `salt` (potassium iodide, Q3).

**T4 Closest to source (3):**
- `rice_arsenic`: white over brown. Held by rule 7; the arsenic reasoning stands.
- `breakfast_cereal`: extruded over muesli-type.
- `frozen_nuggets`: formed over whole-muscle.

**Union: 82 cards** (46 T1 + 31 more from T2 + 5 more from T3: `nutritional_yeast`, `sourdough`, `fresh_pasta`, `flour_basics`, `rice_arsenic`). These are batches B1–B6: 18 + 17 + 11 + 10 + 10 + 16 = 82.

**Organic candidates, conditional (12):** `oats_steelcut_rolled_instant`, `beans_dried_vs_canned`, `grains_beyond_rice`, `pasta_dry`, `coffee_beans`, `tea`, `cocoa`, `maple_syrup`, `raw_cider_vinegar`, `vinegar`, `potato_chips`, `dried_fruit`. Each passes on its item standard today (one ingredient, whole, pure, raw). Organic is added only if its own material already ranks it.

**Under Q2 = A only (4):** `deli_meat_uncured`, `bacon`, `ham`, `cured_pork`.

### Unchanged: all four pass (84, plus the 16 conditional cards if they stay as they are)

| Group | Count | Entries |
|---|---|---|
| Class A | 30 | `beef_grassfed_vs_grainfed`, `beef_cuts_basics`, `ground_beef_lean_ratio`, `lamb_goat`, `bison`, `pork_cuts_and_enhanced`, `egg_labels`, `egg_duck_quail`, `whole_vs_reduced_fat_milk`, `yogurt_plain_vs_flavored`, `plain_kefir`, `raw_milk`, `raw_kefir`, `raw_aged_cheese`, `nuts_raw_vs_roasted`, `seeds`, `nut_butter_ingredients`, `cooking_oils`, `olive_oil_grades`, `whole_spices`, `dried_herbs`, `sprouted_grain_bread`, `sprouted_grains`, `specialty_flours`, `muesli`, `sauerkraut`, `kimchi`, `fermented_pickles`, `salsa`, `frozen_fries` |
| Class B | 14 | `salmon_wild_vs_farmed`, `shrimp_imported_vs_domestic`, `honey_adulteration`, `mercury_by_fish`, `canned_fish_choosing`, `farmed_fish_by_species`, `bottled_water_buying`, `canned_tuna`, `venison_game`, `crab`, `lobster`, `scallops`, `clams_mussels_oysters`, `seaweed` |
| Class C | 39 | 18 `label_*` cards (all 19 except `label_organic_scope`); 12 technique cards: `freezing_produce`, `washing_produce`, `baking_soda_soak`, `precut_produce_tradeoffs`, `judging_meat_at_the_case`, `seafood_certifications`, `produce_ripeness_by_item`, `produce_storage`, `revive_greens`, `rancidity_check`, `deli_salads`, `prepared_meals`; 9 hubs: `bulk_bins_buying`, `seafood_counter`, `bread_aisle`, `dairy_case`, `fermented`, `condiments`, `snacks`, `deli`, `frozen` |
| Picks | 1 | `pick_anchovies` |

Scout question 7 re-confirms every pass that sits next to a batch's cards. A pass it cannot confirm goes to ship notes, not into a batch.

### Picks (30; 29 fail)

| Test | Count | Picks |
|---|---|---|
| T1 organic produce | 20 | 17 fresh: `pick_cucumbers`, `pick_asparagus`, `pick_corn`, `pick_eggplant`, `pick_zucchini`, `pick_cilantro`, `pick_parsley`, `pick_basil`, `pick_snap_peas`, `pick_kohlrabi`, `pick_okra`, `pick_swiss_chard`, `pick_mangoes`, `pick_celery`, `pick_winter_squash`, `pick_ginger_turmeric`, `pick_microgreens`; 3 processed: `pick_frozen_peas`, `pick_frozen_broccoli`, `pick_canned_tomatoes` |
| T1 item standard | 6 | `pick_tofu` (organic soy), `pick_soup_bones` (100% grass-fed), `pick_egg_whites` (pasture-raised), `pick_sausage` (pasture-raised or organic), `pick_jerky` (100% grass-fed), `pick_fish_sticks` (wild-caught) |
| T2 | 3 | `pick_juice`, `pick_jerky`, `pick_english_muffins` |
| T3 | 1 | `pick_pita_naan` (enriched flour) |
| T4 | 3 | `pick_juice` (from fruit, not concentrate), `pick_fish_sticks` (fillet, not minced), `pick_jerky` (whole-muscle) |
| Passes all four | 1 | `pick_anchovies` |

## Scout first (admin-run before each batch's spec)

1. `dv scout "For each id in batch <N>, which files under server/test and server/lib assert its decision, cart_pick, buying_tips, watch_out or doLines value, and do they read the live KB or a git ref?" --terms TWO_LINE,BECAME,RANKED,IDS,doLines`
2. `dv scout "Which ids do cardOrder.test.js and cardTidy.test.js pin via RANKED/card(), and where do they deepEqual doLines.json minus an exception?" --terms RANKED,card,doLines`
3. `dv scout "Does counterCardLint.js constrain cart_pick (length, overlap with decision, duplicate lines across cards)?" --terms lintCard,lintSections,cart_pick`
4. `dv scout "Does matchItemToCard map a cart_pick prefixed 'Pasture-raised ', 'Grass-fed ', 'Organic ' or 'Wild-caught ' to its own card; does listMatchProbe.js exercise cart_pick text?" --terms matchItemToCard,cart_pick`
5. `dv scout "What reads a kind:'pick' entry's decision (listMatch, compose, list row why), and does twoLineCheck.js include or skip picks?" --terms kind,pick,twoLineCheck`
6. `dv scout "In scripts/buildDoLines.js, is the do-line headline copied from the KB decision or authored in docs/do-lines-review.md?" --terms buildDoLines,headline`
7. `dv ask --role scout "For each batch-<N> card, quote every line (detail, science, watch_out, buying_tips, labels_decoded, kristy_take) mentioning organic, wild, grass-fed, grass-finished, pasture, gum, carrageenan, natural flavor, preservative, added sugar, seed oil, color, fortified, enriched, bioengineered, nitrite, whole-muscle or formed, with field and index" --cd /Users/m1/kristy`. This confirms or drops each call and supplies the line-2 why from existing material.
8. `dv ask --role scout "Under docs/sources, which archived files state what enrichment/fortification adds, what gums/carrageenan are, or that corn/soy/sugar beets are mostly bioengineered, with the url: line?" --cd /Users/m1/kristy`

**Pattern to mirror:** `server/test/acceptance/sugarsRank.test.js`. It has a git-ref baseline, a verbatim `BECAME` table, the `nonEmpty` guard, a doLines plus review-row check, and `matchItemToCard`. No existing test checks the four tests.

## Intent

A shopper opens Salmon, Beef, Chicken, Butter, Sugar or Oat milk. In every case the headline and cart pick name that item's best version: wild-caught, 100% grass-fed and grass-finished, pasture-raised, organic sugar, unsweetened and unfortified with nothing added. Adding the cart pick puts that version on the list. Every card's line reads specific to its own food. None of them reads like "buy organic".

## Non-goals

- Depth fields (`detail`, `science`, `watch_out`, `labels_decoded`). They only receive demoted lines, plus the one narrowing on `organic_worth_it_by_type`.
- The ingredient KB and the verdict engine (rule 5).
- iOS, the frozen `client/src`, and the scan card.
- `aliases`/`asked_as`, except where scout question 4 shows a cart pick missing its own card.
- Any verdict-subject change without a ruling.
- Migration inside a batch. Every batch commit says `Not migrated.`

## Criteria (every batch spec repeats these over its own ids)

| # | Criterion |
|---|---|
| **C1 [test]** | For each `(id, test)` row in the batch table, the spec names the carrying phrase, and `decision` or `cart_pick` (the pick's `decision` on picks) contains it verbatim. |
| **C2 [test]** | Card `decision` ≤10 words; `node server/scripts/twoLineCheck.js` reports 0 of 181. |
| **C3 [test]** | `buying_tips[0]` does not match `/^(choose|pick|buy|read|check|look|skip|compare)\b/i` and does not equal `decision`; `buying_tips[1]` names the card's T1 standard or its T2/T3 phrase. |
| **C4 [test]** | No string new or changed against the base ref matches `/\b(health|healthy|healthier|safer|risk|cancer|disease|toxic|toxin|detox|pesticide-free|synthetic|price|cost|cheap|expensive)\b/i`. The only exemption is `synthetic` in B2's one narrowed `organic_worth_it_by_type` line. On `rice_arsenic`, no sentence pairs a standard with "arsenic". |
| **C5 [test]** | The ids that gain the word "organic" equal exactly the batch table's rows whose standard includes organic (organic produce, bioengineered crop, "pasture-raised or organic"). No other card gains it. |
| **C6 [test]** | Every entry outside the batch, picks included, deepEquals its base-ref entry. |
| **C7 [test]** | `doLines.json` `headline` equals `decision` for each batch id; every other entry equals the base ref; the `docs/do-lines-review.md` row carries the same two cells. |
| **C8 [test]** | Every base-ref `buying_tips` string of a batch card still appears in its `buying_tips`, `watch_out` or `detail`, unless `## Change` lists it as dropped. |
| **C9 [test]** | `matchItemToCard(<new cart_pick>)` returns the card's own id; `node server/scripts/listMatchProbe.js` reports no wrong match. |
| **C10 [test]** | No new or changed `decision`, `cart_pick` or `buying_tips` string appears verbatim on more than 2 entries in the KB [PLACEHOLDER threshold]. This is the no-boilerplate guard. |

**Common alignment.**
- **Out of scope:** ids outside the batch, aliases, depth rewrites.
- **OK rough edges:** headlines lead with their standard word; a call that scout question 7 cannot back stays unchanged and goes to ship notes.
- **Ship bar:** C1–C10 red; `npm test` below start + new; a verdict subject changed without a ruling (the critic compares the old→new table in the spec).

**Common route:**
- **Build:** `dv T2` (fallback forge@opus [T2]). The copy is pinned verbatim, and the pin overlays across git refs branch.
- **Review:** critic@opus with FIDELITY required.
- **Parallel-safe:** no. Batches share the KB, doLines and pins, so they run serially, each based on the previous batch's commit.
- **Dial:** P1. Reversible by git ref.

**Common owns:**
- the batch ids' entries in `server/kristy_perimeter_kb.json`;
- their rows in `server/lib/doLines.json` and `docs/do-lines-review.md`;
- the pin overlays scout question 1 names (`server/test/acceptance/twoLinePin.js` entries; `cardOrder.test.js`/`cardTidy.test.js` exceptions where the batch touches their ids).

More than 3 pin files beyond these → split the batch.

**Common verify.** The start count is recorded on the pre-batch tree: 2831 at `ede90e7`, per its commit message, not re-run here.
```
cd server && npm test                          # start + new, 0 fail
node scripts/twoLineCheck.js                   # 0/181
node scripts/listMatchProbe.js                 # no wrong match
node scripts/commitGuard.js                    # clean
```

**Common dispatch.**
1. Scout questions 1–8 return.
2. The planner writes `.pipeline/specs/clean-pick-<N>.md`. It holds:
   - a verbatim `BECAME` per card;
   - `## Acceptance test/acceptance/cleanPick<N>.test.js` (in verify, not owns);
   - `## Contract`;
   - `Env: node, git; server/.env not needed`.
3. The admin runs `dv check .pipeline/specs/clean-pick-<N>.md` → PASS.
4. `dv route T2 --plan docs/CLEAN-PICK-PLAN.md`.
5. `dv build .pipeline/specs/clean-pick-<N>.md` in the background.
6. critic@opus on the runId, the spec, FIDELITY required.

---

## B1: staples incl. sugars (18), no ruling needed

All drafts are [DRAFT]. Each standard word must be quoted from the card's own material by scout question 7; if it is absent, the draft drops back to the card's current standard.

| id | fails | decision (≤10 words) | cart_pick |
|---|---|---|---|
| sugars | T1 (organic, already ranked in its tip 4) | Organic coconut or maple sugar first, each from one sap. | Organic coconut sugar or pure maple sugar |
| rotisserie_chicken | T1 | Pasture-raised or organic rotisserie chicken, salt and spices only. | Organic or pasture-raised plain rotisserie chicken |
| chicken_breast | T1 | Pasture-raised bone-in, skin-on breast before boneless; no solution added. | Pasture-raised or organic chicken breast, no added solution |
| chicken_cuts_basics | T1 | Air-chilled pasture-raised whole chicken, then bone-in, skin-on thighs. | Air-chilled pasture-raised whole chicken or thighs |
| ground_turkey | T1 | Pasture-raised or organic ground turkey, fat content printed. | Pasture-raised or organic plain ground turkey |
| turkey_whole | T1 | Pasture-raised whole turkey, without an injected basting solution. | Pasture-raised whole turkey, no added solution |
| grassfed_butter | T1 (cart) | *(unchanged)* | Grass-fed butter, cream and salt only |
| cheese_real_vs_processed | T1 T2 | Grass-fed block cheese: milk, cultures, salt, enzymes, nothing else. | Grass-fed block cheese, nothing added |
| cream_vs_creamer | T1 T2 | Grass-fed heavy cream or half-and-half: cream and milk only. | Grass-fed half-and-half, milk and cream only |
| sour_cream | T1 | Grass-fed sour cream: cream and cultures, nothing else added. | Grass-fed sour cream, cream and cultures only |
| cream_cheese | T1 | Grass-fed cream cheese by its standard name, no stabilizers. | Grass-fed cream cheese, no stabilizers |
| sandwich_bread | T2 | Whole wheat sandwich bread: flour, water, yeast, salt, little else. | Whole wheat sandwich bread with a short list |
| flour_basics | T3 | Whole wheat flour; white flour unbleached, unbromated, unenriched. | *(unchanged)* |
| tortillas | T1 (bioengineered corn) | Organic corn tortillas of masa, water and salt. | Organic corn tortillas |
| mayo | T2 | Mayonnaise with olive oil alone, egg yolk and an acid. | Mayonnaise made with olive oil only |
| pasta_sauce | T2 | Pasta sauce of tomatoes and olive oil, no added sugar. | Pasta sauce with no added sugar |
| broth | T2 | Broth of named bones, meat or vegetables, no yeast extract. | Broth with bones or vegetables named, nothing else added |
| white_fish | T1 (wild) | Wild-caught white fish by its named species, firm, mild-smelling. | A named wild-caught white fish fillet, firm and on ice |

**Card-specific conditions:**
- `flour_basics` "unenriched", `mayo` "olive oil alone", `broth` "yeast extract" and `tortillas` "organic" each land only if scout questions 7/8 find them in the card's material or an archived source. Otherwise that cell stays as it is today.

**Sugars pins:**
- `server/test/acceptance/sugarsRank.test.js` reads the live card (line 16) for `BECAME`, and its C3 matches `/^Coconut or maple sugar first/`; the B1 decision breaks both. Repoint `live` to `git show ede90e7:server/kristy_perimeter_kb.json` and its doLines/review reads to `ede90e7`, so it keeps proving the 10-19 change at its own commit. clean-pick-1 owns the live card from here.
- `cardOrder`/`cardTidy` pin sugars to `b284f0b` and need only their doLines exception widened.

**Independent check:**
- A `node -e` diff against `ede90e7` lists exactly the 18 B1 ids as changed.
- Of the 18 B1 entries, exactly 5 contain "organic" in `decision` or `cart_pick` (4 if `tortillas` drops back): `sugars`, `rotisserie_chicken`, `chicken_breast`, `ground_turkey`, `tortillas`. The other 13 carry their own item standard or a nothing-added list. A count near 18 means boilerplate.

## B2: produce (17), held on Q1
- **Definite:** `frozen_vs_fresh_produce`, `produce_seasonality`, `sprouts_raw`.
- **`cart_pick` only:** `berries_picking`, `produce_leafy_greens`, `produce_peppers`, `produce_apples_pears`, `produce_stone_fruit`, `produce_green_beans`.
- **Q1:** `produce_root_vegetables`, `produce_brassicas`, `produce_onions_garlic`, `produce_citrus`, `produce_mushrooms`, `produce_bananas`, `organic_worth_it_by_type` (also carries the one "no SYNTHETIC pesticides" narrowing), `label_organic_scope`.

All are T1. Organic here *is* the item standard, so C5 expects every one of them.
- **Extra C11 [test] (Q1 = A):** no batch `decision` contains "conventional" (6 do today).
- Under Q1 = B, B2 is 9 cards, plus the narrowing on `organic_worth_it_by_type`.
- Each cart pick names its produce item ("Organic carrots", not "Organic produce"), so C10 holds.

## B3: dairy and plant milks (11)

| Fails | Cards | Standard |
|---|---|---|
| T1 | `ghee`, `goat_sheep_dairy` | grass-fed; pasture |
| T1 T2 | `cottage_cheese`, `ice_cream` | grass-fed; cultured; no gums |
| T1 T3 (Q5) | `soy_milk` | organic soybeans, unfortified |
| T2 T3 (Q5) | `almond_milk`, `oat_milk`, `coconut_milk_beverage` | — |
| T2 | `canned_coconut_milk`, `coconut_water`, `plant_butter` | — |

- `cardTidy` pins `almond_milk`, `soy_milk`, `oat_milk` and `canned_coconut_milk`.
- Q5 supersedes the 2026-10-19 soy-milk trade-off.

## B4: meat, seafood and frozen (10, or 14 under Q2 = A)

| Fails | Cards | Standard |
|---|---|---|
| T1 | `butcher_counter_asking` | 100% grass-fed bones |
| T1 | `organ_meats` | 100% grass-fed / pasture-raised |
| T1 | `lard_tallow` | pasture-raised lard, grass-fed tallow |
| T1 T2 | `smoked_salmon` | wild-caught |
| T1 T2 T4 | `frozen_nuggets` | pasture-raised or organic, whole-muscle |
| T2 | `hot_dogs`, `turkey_bacon`, `frozen_meals` | — |
| T2 T3 | `frozen_pizza`, `frozen_waffles` | — |
| Q2 = A only | `deli_meat_uncured`, `bacon`, `ham`, `cured_pork` | — |

## B5: bread and grains (10)

| Fails | Cards |
|---|---|
| T2 | `buns_rolls`, `crackers` |
| T2, gum inherent (the fewest gums, named) | `gluten_free_bread` |
| T2 T3 | `bagels`, `pastries_muffins`, `pretzels` |
| T2 T3 T4 (Q5) | `breakfast_cereal` |
| T3 | `sourdough`, `fresh_pasta` |
| T3, if "unenriched" is in its material | `rice_arsenic` (T4 held) |

## B6: corn, soy, ferments, condiments, snacks (16)

| Fails | Cards |
|---|---|
| T1 organic (bioengineered crop) | `tortilla_chips`, `popcorn`, `miso`, `tempeh`, `natto`, `hot_soy_sauce` |
| T2 | `kombucha`, `jam`, `ketchup_mustard`, `hummus`, `olives`, `canned_soup`, `snack_bars`, `trail_mix` |
| T3 (Q5) | `nutritional_yeast` |
| T2 T3 (Q3) | `salt` |

`tortilla_chips`, `popcorn` and `canned_soup` are also pinned by `cardTidy`/`cardOrder`.

## B7a / B7b: picks (17 + 12)

The tests apply to each pick's `decision`. That field feeds lists, and picks never migrate. Scout question 5 settles whether twoLineCheck covers picks.
- **B7a:** the 17 fresh-produce picks in the table above (the peeled ones follow Q1).
- **B7b:** `pick_frozen_peas`, `pick_frozen_broccoli`, `pick_canned_tomatoes`, `pick_tofu`, `pick_soup_bones`, `pick_egg_whites`, `pick_sausage`, `pick_jerky`, `pick_fish_sticks`, `pick_juice`, `pick_english_muffins`, `pick_pita_naan`.
- **Extra C12 [test]:** every pick resolves through `matchItemToCard` to the same id it does at the base ref.

## B8: organic candidates (≤12), conditional
`oats_steelcut_rolled_instant`, `beans_dried_vs_canned`, `grains_beyond_rice`, `pasta_dry`, `coffee_beans`, `tea`, `cocoa`, `maple_syrup`, `raw_cider_vinegar`, `vinegar`, `potato_chips`, `dried_fruit`.
- A card enters the spec only if scout question 7 quotes its own material ranking organic, or Devon names it. Any card that does not enter stays unchanged.
- B8 runs last so that C10 can see the whole corpus.

## QA (last piece)
- **Migration:** after B8, the admin runs the migrate dry-run (`node server/scripts/migrateCounterCards.js`, count and diff only), and Devon decides whether to migrate. Picks never migrate.
- **Check:** qa@sonnet, ≤8 findings, against the live server: add 10 staple cart picks to a list (sugar, chicken breast, eggs, butter, salmon, beef, oats, bread, half-and-half, tortillas).
- **Done means:** each list row names that item's standard and matches its own card.
- No iOS UI run unasked (attach bucket).

## What broken looks like
- Many cards gain the same "organic" line, or C10 finds a string on more than 2 entries. That is the boilerplate Devon ruled out.
- A card gains "organic" where its item standard is something else. For example, beef shows organic in place of 100% grass-fed, or salmon shows organic.
- A headline changes the verdict: rice implying a standard fixes arsenic, salt silently dropping iodized, or nuggets telling the shopper not to buy nuggets.
- Any line says "healthier", "safer", "pesticide-free", a new "synthetic", or anything about cost.
- `twoLineCheck` > 0, `npm test` below its start count, or a cart pick misses its own card.
- An older pin goes red, or is "fixed" by deleting an assertion rather than overlaying a git ref.
- A T2/T3 look-for names an additive the card's own material never mentions.

## Risks
1. **Pin cascade.** `twoLinePin`, `cardOrder`, `cardTidy`, `sugarsRank` and older batch tests pin live strings.
   - *Early check:* scout questions 1–2 run before each spec, and `npm test` runs on the pre-batch tree to record the start count.
2. **Standard or claim creep.** A builder writes "organic" by habit, or writes a mechanism like "gums upset digestion".
   - *Early check:* the planner writes every new string verbatim into the spec.
   - C4, C5 and C10 run as tests over changed strings.
   - Scout question 7 gates each call on the card's own material.

**Cost and displacement.** 9–10 dv T2 builds (B1–B6, B7a, B7b, B8) plus the same number of critic@opus reviews, about one per working session. This displaces the card-alignment follow-ons and the meal-shopping queue.

## Open questions for Devon
- Rulings Q1, Q2, Q3, Q5 (table above). B1 can start without any of them.
- C10's threshold of "more than 2 entries" is a placeholder.
