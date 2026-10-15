# ca-4b cards, part I: almond_milk, oat_milk, soy_milk, coconut_milk_beverage

Status: DRAFT COMPLETE (planner@opus, 2026-10-15). Drop-in text for `.pipeline/specs/ca-4b.md` Step 1 rows. Not built. Not migrated. No lint or test was run on this text; every check below is a hand count against the rules as read.

KB locations at e6760e1 (`server/kristy_perimeter_kb.json`): oat_milk :6542, almond_milk :9135, soy_milk :9186, coconut_milk_beverage :9240. All four are category "dairy" (walk section eggs_dairy), evidence_tier "kristys_standard", and in `CARD_ALIGN_REWRITE`. coconut_milk_beverage is also in `HEALTH_FIRST_REWRITE` (`server/test/acceptance/passRule.js:15`).

G7 gloss (verified): `sunflower, safflower, canola, soybean, corn, and cottonseed` at `server/lib/counterCardLint.js:1660`.

## Finding that changes ca-4b.md

None of the four cards names seed oil today. The CA-4 Done line ("each carries G7 where it names seed oil") is therefore a choice, not a fix. This draft names seed oil on almond_milk and oat_milk, the two ids whose ca-4b direction mentions it, and carries the G7 step there. It does not name seed oil on soy_milk or coconut_milk_beverage, so G7 is vacuous on those two. On soy_milk the gloss would also tell a shopper buying a soybean drink to skip "soybean", which misreads. The allowed sources hold nothing on plant-milk oil content (see the claim trace). So "never seed oil" is a Kristy's-standard skip (D7 plus the G7 row), not a statement that these drinks contain seed oil.

## almond_milk (category dairy, evidence kristys_standard)

| field | old | new |
| --- | --- | --- |
| decision | Unsweetened almond milk, read as a drink rather than a milk swap. | Unsweetened almond milk with a short ingredient list, never seed oil. |
| tier_note | Added sugars and protein on the panel decide the pick, not the name. | An unsweetened carton with no seed oil on its list stays closest to the almond itself. |
| instead | (absent) | Unsweetened soy milk, fortified, the plant drink FDA places in the dairy group. |
| pick_steps | ["Pick unsweetened over sweetened, vanilla or chocolate."] | ["Pick unsweetened over sweetened, vanilla or chocolate.", "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed."] |

Kept byte-identical, with reasons:
- cart_pick "Unsweetened almond milk". The first rung changed only by adding a qualifier. A bare cart pick is what the list matcher hits, and a phrase cart pick returned null in the 2026-10-15 probe. It carries no L5(a) term.
- why, short_answer, kristy_take, buying_tips ×3, watch_out, labels_decoded (Fortified, Almond milk), science, aliases, asked_as, sources. The detail keeps "0.4" and "100", which passRule requires to survive. The FDA "not in the dairy group" lines stay: they are the reason the old decision called it a drink, and they still back the instead.
- The do line "Read the Nutrition Facts for added sugars, then the protein." is unchanged (Step 2: a do line changes only on a collision). See open question 1.

Checks by hand:
- Decision is 11 words and one sentence, with no hedge, no "?" and no culinary word. Its L5(b) first rung is "Unsweetened almond milk with a short ingredient list" (text before "never"). Headline plus do line = 11 + 10 = 21 (≤28).
- OBSERVABLE_IN_BOTH: the decision's distinctive terms are unsweetened and almond ("ingredient", "list" are NEUTRAL). The do line's are nutrition, sugars and protein. They share none, and neither quotes a term.
- L4: the decision names G7 "seed oil", and pick_steps[1] carries the gloss verbatim.
- tier_note is 16 words, one sentence, and contains no "protein" (ca-4b direction). It shares "unsweetened" and "almond" with the decision, so TIER_NOTE_ORPHANED is clean. It contains no tier name, no "this/the tier", and no D4 phrase.
- instead is 13 words. It opens on "Unsweetened", not a conditional, and has no CO_EQUAL phrase. Soy milk is a different product from the cart pick. The decision has no ".", "/" or ";" mid-sentence, so there are no refused terms.
- pick_steps: 9 and 11 words. Both end in ".", with no digit, no "?" and no em-dash. Neither copies the do line.
- New strings checked against ca-4b C5 (claim lock, price, brand, em-dash, straight quotes) and k19 C10 banned words: none present.

## oat_milk (category dairy, evidence kristys_standard)

| field | old | new |
| --- | --- | --- |
| decision | Oat milk with its protein and fortification checked on the carton. | Oat milk with few stabilizers in the ingredients, never seed oil. |
| tier_note | Protein and added vitamins are composition checks; using the carton rather than assuming equivalence is the whole-food standard. | Oat drinks differ in stabilizers and fortification, so the carton’s own list decides the pick. |
| instead | (absent) | Fortified unsweetened soy milk, which the Dietary Guidelines count in the dairy group. |
| pick_steps | ["Read the protein line and the added vitamins and minerals on the carton.", "Read the ingredient list for stabilizers; formulations can differ in stabilizer use."] | ["Read the ingredient list for stabilizers; formulations can differ in stabilizer use.", "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed."] |

Kept byte-identical, with reasons:
- cart_pick "Oat milk". It is a bare name the matcher hits, and the first rung still opens with it.
- why = kristy_take "Oat drinks vary in composition and fortification. The carton is the basis for choosing." Also short_answer (the six-drink study), detail, buying_tips ×3 (the protein tip stays here, an unchanged back-of-card field), watch_out ×2 (the study-limit and no-health-effect lines are never deleted), science, labels_decoded (Fortified), aliases, asked_as and sources. The old text holds no digits, so passRule's number check is trivially met.
- The do line "Compare the protein line and read the ingredients for added vitamins and minerals." is unchanged (Step 2). It still covers fortification, which is why pick_steps no longer repeat it. See open question 1.

Checks by hand:
- Decision is 11 words and contains no "protein" (ca-4b direction). It has no hedge and no culinary word. Its L5(b) first rung is "Oat milk with few stabilizers in the ingredients". Headline plus do line = 11 + 13 = 24.
- OBSERVABLE_IN_BOTH: the decision's distinctive term is stabilizers ("ingredients" is NEUTRAL). The do line's are compare, protein, vitamins and minerals. They share none.
- L4: the decision names "seed oil", and pick_steps[1] carries the gloss.
- tier_note is 15 words, one sentence, with a curly apostrophe. It shares "stabilizers" with the decision. It leaves the "is the whole-food standard" L2 group and drops "protein".
- instead is 13 words, not conditional, with no CO_EQUAL phrase and no refused terms.
- pick_steps: 12 and 11 words. The dropped protein step was the only front-of-card "protein" outside the do line. Its fact survives in buying_tips[0].

## soy_milk (category dairy, evidence kristys_standard)

| field | old | new |
| --- | --- | --- |
| instead | (absent) | Unsweetened almond milk, read as a drink rather than a milk swap. |

Kept byte-identical, with reasons:
- decision "Fortified, unsweetened soy milk, the one plant drink in the dairy group." It is 12 words and already names the first rung (fortified, unsweetened). ca-4b gives no direction for soy_milk. Keeping it leaves the review headline row alone.
- tier_note "Calcium and vitamin D on the panel show the fortification." It is 10 words and shares "calcium" and "vitamin" with the do line, so it is not orphaned. It is already unique (ic7b C5 passes at HEAD).
- cart_pick "Fortified unsweetened soy milk", plus pick_steps ×2, why, short_answer, detail (keeps "1–4"), kristy_take, buying_tips ×3, watch_out, labels_decoded (Fortified, Soy beverage), science, aliases, asked_as and sources.
- No seed-oil naming: see the finding above.

Checks by hand:
- instead is 11 words. It opens on "Unsweetened", not a conditional. "rather than" is not in CO_EQUAL (`counterCardLint.js:113`). Almond milk is a different product from the cart pick. The decision has commas only, so there are no refused terms. The text is the almond card's own old decision, so it is already claim-traced and lint-clean as a headline.

## coconut_milk_beverage (category dairy, evidence kristys_standard, HEALTH_FIRST_REWRITE)

| field | old | new |
| --- | --- | --- |
| decision | Carton coconut milk is a drink: coconut milk thinned with water. | Unsweetened carton coconut milk with the fewest added gums. |
| instead | (absent) | Canned coconut milk, shredded coconut steeped and pressed. |

Kept byte-identical, with reasons:
- tier_note "A carton labeled beverage is a drink, judged by its thickeners and sugar." It is 13 words and already states the new decision's reasoning. It shares "beverage" and "thickeners" with the do line, so it is not orphaned.
- cart_pick "Unsweetened coconut milk beverage". The first rung's subject is unchanged, and the bare name matches.
- pick_steps ×3, unchanged. "Read the name: a carton saying beverage is coconut milk thinned with water." now carries the definition the old decision held. "Check the list for sugar and thickeners such as gellan gum." is the observable behind "fewest added gums". "For the full-fat kind, reach for the can, not the carton." stays.
- why, short_answer, detail (including the tasters' line), kristy_take, buying_tips ×4, watch_out (the cooking stand-in line), labels_decoded ("Coconut milk beverage"), aliases, asked_as, and sources (cookscountry, tastingtable).

Checks by hand:
- Decision is 9 words, one sentence, with no hedge and no culinary word. Its L5(b) first rung is the whole sentence. Headline plus do line = 9 + 11 = 20.
- OBSERVABLE_IN_BOTH: the do line quotes “beverage” and names thickeners. The decision avoids both words on purpose: a shared quoted term alone fires, and so would two shared terms. The decision's distinctive terms are unsweetened, coconut and fewest ("carton" is NEUTRAL). Nothing is shared.
- L2 front form: the decision does not repeat oat_milk's "milk with few stabilizers" 4-gram or almond's "milk with a short" 4-gram.
- instead is 8 words, not conditional, with no CO_EQUAL phrase and no refused terms (no mid-sentence ". / ;"). Canned coconut milk is a different product, and its own card exists (`canned_coconut_milk`, bulk_pantry, `docs/do-lines-review.md:188`).

## Claim trace

KS = Kristy's standard: closest-to-nature, plus D7 (seed oils and avocado oil are skips; `docs/CARD-ALIGNMENT-PLAN.md`) and the G7 row (`server/lib/counterCardLint.js:1658-1661`). Quoted card text was grep-confirmed verbatim in `server/kristy_perimeter_kb.json` at the line given.

| # | card.field | new sentence | trace |
| --- | --- | --- | --- |
| 1 | almond_milk.decision | Unsweetened almond milk with a short ingredient list, never seed oil. | :9147 "It comes sweetened, unsweetened, vanilla and chocolate."; KS (short list); KS D7/G7 (seed oil skip, not a composition claim) |
| 2 | almond_milk.tier_note | An unsweetened carton with no seed oil on its list stays closest to the almond itself. | KS (closest-to-nature); KS D7/G7 |
| 3 | almond_milk.instead | Unsweetened soy milk, fortified, the plant drink FDA places in the dairy group. | soy_milk :9199 "FDA notes the Dietary Guidelines count only fortified soy drinks in the dairy group."; soy_milk decision (`docs/do-lines-review.md:165`) "Fortified, unsweetened soy milk, the one plant drink in the dairy group."; almond_milk :9162 "FDA does not place almond drinks in the dairy group." |
| 4 | almond_milk.pick_steps[1] | Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed. | `counterCardLint.js:1660` gloss verbatim; KS D7. The same line was approved on the potato chips card in CARD-ALIGNMENT-PLAN |
| 5 | oat_milk.decision | Oat milk with few stabilizers in the ingredients, never seed oil. | :6564 "Read for stabilizers in the ingredient list; the study compared formulations with different stabilizer use."; KS (few); KS D7/G7 |
| 6 | oat_milk.tier_note | Oat drinks differ in stabilizers and fortification, so the carton’s own list decides the pick. | :6552 "Oat drinks vary in composition and fortification."; :6564 (stabilizer use differs) |
| 7 | oat_milk.instead | Fortified unsweetened soy milk, which the Dietary Guidelines count in the dairy group. | soy_milk :9199 "FDA notes the Dietary Guidelines count only fortified soy drinks in the dairy group." |
| 8 | oat_milk.pick_steps[1] | Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed. | as row 4 |
| 9 | soy_milk.instead | Unsweetened almond milk, read as a drink rather than a milk swap. | almond_milk old decision :9145, verbatim; almond_milk :9162 "FDA does not place almond drinks in the dairy group." |
| 10 | coconut_milk_beverage.decision | Unsweetened carton coconut milk with the fewest added gums. | :9254 "thickeners such as gellan gum"; cart_pick "Unsweetened coconut milk beverage"; old decision "Carton coconut milk is a drink" (`docs/do-lines-review.md:166`); KS (fewest) |
| 11 | coconut_milk_beverage.instead | Canned coconut milk, shredded coconut steeped and pressed. | :9253 "Canned coconut milk is shredded coconut steeped and pressed."; :9266 "Reach for the can, not the carton, for full-fat coconut milk." |

Source gap, stated plainly: neither `docs/research/dairy-eggs-sources.md` nor `docs/research/card-align-sources.md` says anything about seed oil (or any oil) in plant milks. The nearest line is about coffee creamers, not plant milks. No new sentence asserts that any of these drinks contains seed oil. Rows 1, 2, 4, 5 and 8 rest on KS only. In row 10, "gums" generalizes from the card's one named gum (gellan) under "thickeners". If the critic reads that as beyond the card, the fallback decision is "Unsweetened carton coconut milk with the fewest added thickeners." That fallback shares "thickeners" with the do line: one unquoted term, which is still clean.

## SPEC entries (ca-4b.test.js `SPEC`)

```js
almond_milk: {
  decision: 'Unsweetened almond milk with a short ingredient list, never seed oil.',
  tier_note: 'An unsweetened carton with no seed oil on its list stays closest to the almond itself.',
  instead: 'Unsweetened soy milk, fortified, the plant drink FDA places in the dairy group.',
  pick_steps: [
    'Pick unsweetened over sweetened, vanilla or chocolate.',
    'Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.',
  ],
},
oat_milk: {
  decision: 'Oat milk with few stabilizers in the ingredients, never seed oil.',
  tier_note: 'Oat drinks differ in stabilizers and fortification, so the carton’s own list decides the pick.',
  instead: 'Fortified unsweetened soy milk, which the Dietary Guidelines count in the dairy group.',
  pick_steps: [
    'Read the ingredient list for stabilizers; formulations can differ in stabilizer use.',
    'Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.',
  ],
},
soy_milk: {
  decision: 'Fortified, unsweetened soy milk, the one plant drink in the dairy group.',
  tier_note: 'Calcium and vitamin D on the panel show the fortification.',
  instead: 'Unsweetened almond milk, read as a drink rather than a milk swap.',
},
coconut_milk_beverage: {
  decision: 'Unsweetened carton coconut milk with the fewest added gums.',
  tier_note: 'A carton labeled beverage is a drink, judged by its thickeners and sugar.',
  instead: 'Canned coconut milk, shredded coconut steeped and pressed.',
},
```

soy_milk and coconut_milk_beverage tier_notes, and the soy_milk decision, are unchanged HEAD strings. If ca-4b C5 greps only NEW strings, the builder should mark them unchanged rather than new. cart_pick is unchanged on all four, so no cart_pick key is set.

## do-lines-review rows (headline column = new decision; do line unchanged)

```
| `oat_milk` | eggs_dairy | Oat milk with few stabilizers in the ingredients, never seed oil. | Compare the protein line and read the ingredients for added vitamins and minerals. | — |
| `almond_milk` | eggs_dairy | Unsweetened almond milk with a short ingredient list, never seed oil. | Read the Nutrition Facts for added sugars, then the protein. | — |
| `coconut_milk_beverage` | eggs_dairy | Unsweetened carton coconut milk with the fewest added gums. | Read the carton for “beverage” in the name, then the thickeners. | — |
```

These replace `docs/do-lines-review.md` :129, :164 and :166. The soy_milk row :165 is unchanged.

## For the builder and merger

- ic7b C5 / ic5b: the review headline must equal the KB decision for the three changed ids. After editing the table, run `node server/scripts/buildDoLines.js`. The expected `server/lib/doLines.json` diff is none, because do lines are unchanged. That expectation was not checked.
- L2 merge check (not run): plant_butter (another fragment) may also carry the G7 pick step and a "never seed oil" decision. That would put the G7 step on 3 eggs_dairy cards. The G term and gloss are cut before n-gramming, so the step should leave no 6-gram. Confirm by running lintSections on the merged KB. Also check that no sibling decision repeats "milk with a short" or "with the fewest added".
- passRule: all four sit in CA_RELAXED for instead. No frozen field other than instead changes. pick_steps are not frozen. No old digit lives in a changed field.

## Open questions

1. The almond_milk and oat_milk do lines still say "protein". ca-4b removes it from the almond tier_note and the oat decision, but Step 2 keeps a do line unless it collides. If Devon wants "protein" off the front entirely, here are drop-in do lines (hand-checked against OBSERVABLE_IN_BOTH and the 28-word cap). oat: "Read the ingredients for added vitamins and minerals, then the stabilizers." (shares only "stabilizers", one term). almond: "Read the Nutrition Facts for added sugars, then calcium and vitamin D." Either one also changes `server/lib/doLines.json`.
2. Should soy_milk and coconut_milk_beverage name seed oil too? This draft says no (see the finding at the top). The G7 "soybean" entry misreads on a soy card.
