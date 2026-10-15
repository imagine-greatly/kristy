# ca-4b cards, part H: cream_vs_creamer, ice_cream, dairy_case, plant_butter

Status: DRAFT COMPLETE (planner@opus, 2026-10-15). Drop-in text for `.pipeline/specs/ca-4b.md` Step 1 rows. Not built. Not migrated. No lint or test was run on this text; every check below is a hand count against the rules as read in `server/lib/counterCardLint.js` and `server/test/acceptance/passRule.js`.

KB locations: cream_vs_creamer :3550 (decision :3565), ice_cream :8968 (decision :8978), plant_butter :9291 (decision :9301), dairy_case :9339 (decision :9351). All four are category "dairy", so their section is eggs_dairy. These line numbers were read in the working tree at 93fe2e2. They were not diffed against 8b49633. The commits since then are spec-only wip, so the KB is expected to match, but that is not checked. C1 compares against 8b49633, so the builder must confirm it.

## Findings that change ca-4b.md

1. The C5 grep `/["']/` also catches a straight apostrophe. Every new string below uses ’ or no apostrophe at all.
2. dairy_case `:9367` "Read a filtered milk panel for its protein and sugar lines." sits in `buying_tips`, which D1 treats as paid depth (the projected `look_for`), not on the free front. The direction says it leaves the front "if it sits there", and it does not. It stays byte-identical. Rewriting it would make it a new string, and C5 then greps it. An optional replacement is under Open questions.
3. dairy_case `science` holds "400 International Units", not the literal "400 IU". A new "400 IU" in `science` would trip KT_CLAIM_DOSING (`\d+\s*(mg|mcg|iu)\b`). `science` stays byte-identical, so it keeps "120 days" and "400 International Units".

## cream_vs_creamer (category dairy, evidence established)

| field | old | new |
| --- | --- | --- |
| decision | Non-dairy creamer is oil, sugar and thickeners, with no milk. | Half-and-half is milk and cream; non-dairy creamer is oil and sugar. |
| instead | (absent) | Heavy cream with cream as the only ingredient on the list. |
| pick_steps[2] | On flavored creamers, read the sugar line first. | A creamer list that opens on water, sugar and oil is the skip. |

Kept byte-identical, with reasons:
- cart_pick "Half-and-half". The new front's first rung is half-and-half, so the pick already matches it.
- tier_note "Cream carries a federal milkfat minimum, and creamer carries none because it is not dairy." It is 15 words and shares "cream"/"creamer" with the new decision, so TIER_NOTE_ORPHANED is clean. It contains no D4 token and no "this/the tier".
- pick_steps[0] and [1]: the milkfat step and the carrageenan step. Their numbers (36%, 10.5, 18%) also appear in buying_tips, so KT_NEW_NUMBER is clean.
- why, short_answer, detail, kristy_take, buying_tips ×5, watch_out ×3, science, labels_decoded ×3, aliases, asked_as, sources. None of them contradicts the new front: detail already says "Whole milk, half-and-half or real cream all do the job". They hold 36%, 30, 36, 10.5, 18 and 18%, which passRule requires to survive.
- Do line (review :88) "Read the panel for milkfat percent — real cream states 36% or 10.5%." No lint or tip collision, so it stays (see Open questions 1 on its em-dash).

Checks by hand:
- The decision is 11 words, has one semicolon (no READ_STACKED) and no conditional. With the do line (13 tokens, counting the dash) the total is 24 (≤28).
- OBSERVABLE_IN_BOTH: the decision's terms are half-and-half, non-dairy and creamer. The do line's are milkfat, percent and states. Nothing is shared, and neither has a quoted term.
- Refused terms come from the decision after ";": non-dairy, creamer, sugar. The instead holds none of them; "cream" is not `\bcreamer\b`.
- The instead is 11 words, opens on "Heavy cream" (no conditional), has no co-equal phrase, and differs from cart_pick.
- pick_steps[2] is 13 words, ends ".", has no digit, no CULINARY_LEXICON token and is not the do line. No tip 5-gram: "water sugar and oil" is not in the tip.
- No scoped term (organic, grass-fed, pasture-raised, seed oil, natural fat) is in the decision, so L4 and L5 do not apply.

SPEC entry:
```js
  cream_vs_creamer: {
    decision: 'Half-and-half is milk and cream; non-dairy creamer is oil and sugar.',
    instead: 'Heavy cream with cream as the only ingredient on the list.',
    pick_steps: [
      'Read the milkfat: heavy cream is 36% or more, half-and-half 10.5 to 18%.',
      'Read the list too: even real cream can carry carrageenan or gellan gum.',
      'A creamer list that opens on water, sugar and oil is the skip.',
    ],
  },
```

do-lines-review row (the headline changes, the do line does not):
```
| `cream_vs_creamer` | eggs_dairy | Half-and-half is milk and cream; non-dairy creamer is oil and sugar. | Read the panel for milkfat percent — real cream states 36% or 10.5%. | — |
```

## ice_cream (category dairy, evidence established)

| field | old | new |
| --- | --- | --- |
| decision | Ice cream that meets the standard, not a lookalike. | Ice cream that earns the name, with milkfat and no added oils. |
| instead | (absent) | Frozen custard, which is ice cream made with egg yolk solids. |

Kept byte-identical, with reasons:
- cart_pick "A carton named “ice cream”". The first rung is still a carton carrying the legal name.
- tier_note "FDA defines the ice cream name, so the print on the carton decides." It is 13 words, shares "cream"/"name" with the decision, and has no D4 token.
- pick_steps ×3: the name step, the "frozen dairy dessert" step and the oils step. The oils step already carries the new front's "no added oils" into the aisle.
- why, short_answer, detail, kristy_take, buying_tips ×3, watch_out ×1, science, labels_decoded ×3, aliases, asked_as, sources. They hold 10, 4.5, 135.110, 21 and 1.4 for passRule.
- Do line (review :161) "Read the small print under the flavor for “frozen dairy dessert”." No collision.

Checks by hand:
- The decision is 12 words. With the do line (11) the total is 23.
- OBSERVABLE_IN_BOTH: the decision's only term is milkfat. The do line has flavor and the quoted “frozen dairy dessert”. Nothing is shared.
- CULINARY: the decision has no lexicon token. "flavor" sits only in the do line, which lintCulinaryAim does not scan.
- The decision has no "." or ";" mid-sentence, so it has no refused terms. The instead is 11 words, not conditional, not co-equal, and differs from cart_pick.
- The old decision has no number, so passRule loses nothing.

SPEC entry:
```js
  ice_cream: {
    decision: 'Ice cream that earns the name, with milkfat and no added oils.',
    instead: 'Frozen custard, which is ice cream made with egg yolk solids.',
  },
```

do-lines-review row:
```
| `ice_cream` | eggs_dairy | Ice cream that earns the name, with milkfat and no added oils. | Read the small print under the flavor for “frozen dairy dessert”. | — |
```

## dairy_case (category dairy, evidence kristys_standard; hub)

| field | old | new |
| --- | --- | --- |
| instead | (absent) | Plain whole milk that has not been ultrafiltered. |

Kept byte-identical, with reasons:
- decision "Pick the dairy type first, then read what the carton promises." The hub's first rung is the type, and each type card carries its own rung. A hub front that names how the animal ate or how few ingredients a carton holds would restate the CA-5 rule or check 2, which the direction forbids. The decision is unchanged, so the review row is unchanged.
- tier_note "Added vitamins and grazing are label facts, read rather than assumed." It is 11 words and shares "vitamins"/"grazing" with the do line. It holds no tip 5-gram.
- cart_pick "Dairy picked by type, label read". The first rung did not change.
- science, byte-identical: it keeps "120 days" and "400 International Units" (Finding 3).
- buying_tips ×3, including `:9367` (Finding 2), plus pick_steps ×1, why, short_answer, detail, kristy_take, watch_out ×1, labels_decoded ×2, aliases (ultrafiltered milk ×2), asked_as and sources. They hold 21, 131.110, 400, 7, 205.240 and 120 for passRule.
- Do line (review :168) "Read the side panel for added vitamins, then any grazing or filtering claim." No collision.

Checks by hand:
- The instead is 8 words, opens on "Plain whole milk" and has no co-equal phrase. The decision has no "." or ";" mid-sentence, so it has no refused terms. The instead differs from cart_pick.
- It answers the asked_as "is ultrafiltered milk worth buying" sideways, without "protein".
- C4 requires the card to change, and it does: `instead` is added.

SPEC entry:
```js
  dairy_case: {
    instead: 'Plain whole milk that has not been ultrafiltered.',
  },
```

do-lines-review: no change (the decision is unchanged).

## plant_butter (category dairy, evidence kristys_standard)

| field | old | new |
| --- | --- | --- |
| decision | Plant butter, read for which oils it is made from. | Plant butter built on coconut or olive oil, never seed oil or avocado oil. |
| tier_note | Knowing which oil leads the list is the standard for any spread. | Each oil in a plant butter is named on its ingredient list, so the skip is in plain sight. |
| instead | (absent) | Butter: cream, and salt if salted. [PLACEHOLDER, per ca-4b.md direction] |
| cart_pick | Plant butter with its oils named | Plant butter built on coconut or olive oil |
| pick_steps | Find each oil named in the list; note which one comes first. / Check whether a nut milk or culture is listed, as in some versions. | Find each oil named in the list; note which one comes first. / Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed. / Check whether a nut milk or culture is listed, as in some versions. |

Kept byte-identical, with reasons:
- why "The oils differ from one plant butter to the next, and the ingredient list names them." It agrees with the new front.
- short_answer, detail and science. Their one-label example lists sunflower oil. That is a label description, not a recommendation, so it does not contradict the front. They hold 21, 166.110 and 80 for passRule. See Open questions 4.
- kristy_take, buying_tips ×3, watch_out ×1 ("The name alone does not say which oils went in."), labels_decoded ×1, aliases, asked_as, sources.
- Do line (review :167) "Read the ingredient list and find which oil comes first." No collision. It is the aisle action for the new front.

Checks by hand:
- The decision is 14 words (the MAX_HEADLINE_WORDS limit). With the do line (10) the total is 24.
- The decision splits at "never" (FIRST_RUNG_SPLIT). The first rung, "Plant butter built on coconut or olive oil,", holds no scoped term, so L5(b) is clean. The cart_pick has no FAMILIES term, so L5(a) is clean.
- L4: the decision names `seed oil` (G7, scoped eggs_dairy). The G7 gloss "sunflower, safflower, canola, soybean, corn, and cottonseed" appears verbatim in pick_steps[1], one of the allowed strings, so TERM_UNGLOSSED is clean. "olive oil" and "coconut oil" are not the G6 term (`natural fat`), so G6 does not trigger.
- OBSERVABLE_IN_BOTH: the decision's terms are coconut, avocado and butter. The do line's are none ("ingredient" is NEUTRAL). Nothing is shared.
- tier_note is 19 words and shares "plant"/"butter" with the decision. It has no D4 token (no "stir" substring) and no "this/the tier".
- The instead is 6 words. Its first clause before `[.,;]` is "Butter: cream", with no conditional. The decision has no "." or ";" mid-sentence, so it has no refused terms. The instead differs from cart_pick.
- pick_steps[1] is 11 words, ends ".", has no digit and one colon. Section n-grams cut both the term "seed oils" and the gloss, so this step contributes no L2 n-gram.
- None of the new strings contains "protein", a price word, an em-dash, a straight quote or a brand.

SPEC entry:
```js
  plant_butter: {
    decision: 'Plant butter built on coconut or olive oil, never seed oil or avocado oil.',
    tier_note: 'Each oil in a plant butter is named on its ingredient list, so the skip is in plain sight.',
    instead: 'Butter: cream, and salt if salted.',
    cart_pick: 'Plant butter built on coconut or olive oil',
    pick_steps: [
      'Find each oil named in the list; note which one comes first.',
      'Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.',
      'Check whether a nut milk or culture is listed, as in some versions.',
    ],
  },
```

do-lines-review row:
```
| `plant_butter` | eggs_dairy | Plant butter built on coconut or olive oil, never seed oil or avocado oil. | Read the ingredient list and find which oil comes first. | — |
```

## Claim trace

KB line numbers come from the working tree at 93fe2e2 (see the KB locations line). "plan" = `docs/CARD-ALIGNMENT-PLAN.md`; "de" = `docs/research/dairy-eggs-sources.md`. Each quote below was checked this session as an exact substring at the cited line (KB by Read; de, plan and do-lines-review by grep).

| # | card.field | new sentence | trace |
| --- | --- | --- | --- |
| 1 | cream_vs_creamer.decision | Half-and-half is milk and cream; non-dairy creamer is oil and sugar. | card.labels_decoded :3603 "10.5 to 18% milkfat. Milk and cream."; card.buying_tips :3580 "‘Non-dairy creamer’ is oil, sweetener and emulsifiers. It is not cream."; de:97 "coffee creamers are water, sugar, and vegetable oil." |
| 2 | cream_vs_creamer.instead | Heavy cream with cream as the only ingredient on the list. | de:90 "heavy cream is defined as having no less than 36% milkfat content."; card.buying_tips :3581 "Even real cream can carry carrageenan or gellan gum. A short list is still worth checking."; KS (cream alone on the list is the closest-to-nature carton) |
| 3 | cream_vs_creamer.pick_steps[2] | A creamer list that opens on water, sugar and oil is the skip. | card.watch_out :3586 "Water, sugar and vegetable oil are the usual first three ingredients."; KS (skip) |
| 4 | ice_cream.decision | Ice cream that earns the name, with milkfat and no added oils. | card.tier_note :9017 "FDA defines the ice cream name"; card.why :8979 "The name “ice cream” needs at least 10 percent milkfat."; card.detail :8981 "Ice cream excludes other food fats, except incidental amounts." |
| 5 | ice_cream.instead | Frozen custard, which is ice cream made with egg yolk solids. | card.detail :8981 "Frozen custard is ice cream with 1.4 percent egg yolk solids."; card.labels_decoded :9014 "Ice cream made with 1.4 percent egg yolk solids." |
| 6 | dairy_case.instead | Plain whole milk that has not been ultrafiltered. | card.detail :9354 "Ultrafiltered milk is pushed through a porous membrane under pressure, a process called ultrafiltration."; KS (the unfiltered carton is the closer-to-nature pick) |
| 7 | plant_butter.decision | Plant butter built on coconut or olive oil, never seed oil or avocado oil. | card.short_answer :9303 "Plant butter is built on plant oils, and the ingredient list names them." and "One example lists coconut oil"; plan:62 G6 "tallow, olive oil, or coconut oil" (Devon ruling, `kristys_standard`); plan:80 "Avocado oil is a skip alongside the seed oils."; plan:414 "any seed oil in their ingredient guidance is a skip". **The plan is not on the ca-4b.md :234 source list**; the olive-oil and both skip clauses rest on it as KS. |
| 8 | plant_butter.tier_note | Each oil in a plant butter is named on its ingredient list, so the skip is in plain sight. | card.why :9302 "The oils differ from one plant butter to the next, and the ingredient list names them."; KS (the skip, per row 7) |
| 9 | plant_butter.instead | Butter: cream, and salt if salted. | de:45 "fat from these processes is used in cream, ice cream, butter, dry milk, and other products." (butter is made from milk fat). **"and salt if salted" is UNTRACED in the allowed sources.** The same words are the sibling grassfed_butter review headline (`docs/do-lines-review.md:54` "Grass-fed butter first, then any real butter: cream, and salt if salted."), which is not this card's own field. |
| 10 | plant_butter.cart_pick | Plant butter built on coconut or olive oil | card (row 7, the decision's first rung) |
| 11 | plant_butter.pick_steps[1] | Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed. | plan:63 G7 gloss "sunflower, safflower, canola, soybean, corn, and cottonseed" (the engine KB `seed_oil` entry's own names); card.short_answer :9303 names "sunflower oil"; plan:414 (skip). Off the :234 list, like row 7. |

## For the builder and merger

- `docs/do-lines-review.md`: the headline column changes for cream_vs_creamer (:88), ice_cream (:161) and plant_butter (:167), using the rows above. dairy_case (:168) does not change. No do line changes, so `doLines.json` content should not move. Run `node scripts/buildDoLines.js` anyway, per ca-4b.md Step 2.
- L2 merge check (forced eggs_dairy section, ≥3 cards). The phrases from this part most likely to be reused by other parts: "no added oils" (front 4-gram "and no added oils"; part I plant milks may use it), "coconut or olive oil" and "is the skip". Run the L2 count after merging every ca-4b part with CA-4a.
- C5 has a floor of 32 new strings, and this part contributes 11: cream 3, ice_cream 2, dairy_case 1, plant_butter 5. The floor depends on the other parts.
- C6: confirm that `parseReviewTable` exposes `headline` (ca-4b.md :220 TODO) before relying on the review rows above.

## Open questions

1. The cream_vs_creamer do line carries an em-dash: "Read the panel for milkfat percent — real cream states 36% or 10.5%." No lint fails it, because em-dash do lines are capped by corpus share (`MAX_EMDASH_SHARE`), not per card, so it stays. If Devon wants it gone, a replacement that keeps both numbers is "Read the panel for milkfat: real cream states 36% or 10.5%." (11 words). It shares no observable with the new decision.
2. dairy_case `:9367`, if the admin counts `buying_tips` as front: the optional replacement is "Compare an ultrafiltered milk panel with a plain milk panel, line by line." It rephrases without "protein" and has no number to lose.
3. plant_butter instead: is "and salt if salted" acceptable as Kristy's standard (KS), mirroring grassfed_butter? If not, "Butter, which is made from cream." traces fully to de:45.
4. plant_butter short_answer, detail and science keep a label example that lists sunflower oil. This is not a contradiction. An additive sentence, "Its sunflower oil is a seed oil, the skip." (8 words), was not added, because a new string in `science` must then pass KT checks and every new string must pass C5.
