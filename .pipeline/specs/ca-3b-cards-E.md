# ca-3b cards, part E: ham, hot_dogs, turkey_bacon, deli_meat_uncured

Status: DRAFT COMPLETE (planner@opus, 2026-10-15). Drop-in text for `.pipeline/specs/ca-3b.md` Step 1 rows. Not built. Not migrated.

KB locations at 5267f05: deli_meat_uncured :2828, hot_dogs :6691, ham :7172, turkey_bacon :7235 (all category `deli`, meat walk section).

Fields not named stay byte-identical. Curly quotes only. No em-dash in a changed string. Every authored sentence is free of the C7 cure words (`cured|uncured|nitrite|nitrate|celery powder|celery juice`) and of `cure`/`curing`; the only cure sentences on these cards are KEPT ones or verbatim `PRESERVATION_CURE_SENTENCES` members (counterCardLint.js:1485).

Common to all four: `instead` is ABSENT today on every one of them, so each gets a new `instead` (D1: never empty). The old tier_notes of ham, hot_dogs and turkey_bacon all end "… the whole-food standard" (L2 front form, 4-gram "the whole food standard" on ≥3 cards); each is rewritten without it.

## Pins found (server/test, grep by id and by field phrase)

- No test pins a string from decision, tier_note, instead, cart_pick, pick_steps, why, short_answer, kristy_take, watch_out or labels_decoded of these four ids (phrase grep for Water Added, named meat, mechanically separated, celery, asterisk, descriptive name, natural juices, whole roasted, fully cooked, thigh meat, byproducts: 0 hits outside fixtures).
- Alias → slug pins only (aliases are untouched, so all hold):
  - `server/test/acceptance/k15.test.js:26-27` ham, sliced ham, spiral ham, ham steak → ham; turkey bacon → turkey_bacon. `:40` deli meat, lunch meat, deli turkey, sliced turkey → deli_meat_uncured.
  - `server/test/acceptance/k23.test.js:40-41` lunch meat, deli meat, cold cuts, deli counter, deli turkey → deli_meat_uncured; deli ham → ham. `:141` those rows stay off LUNCH_HOMES.
  - `server/test/acceptance/k16.test.js:48` smoked ham → ham.
  - `server/test/counterProbe48.test.js:19` deli turkey → deli_meat_uncured; `:58` hot dogs → hot_dogs.
- Id lists only (not read; fields they check unknown to this planner): `ktight.test.js:16` (B05), `passRule.js:35` (CARD_ALIGN_REWRITE), `ca-1.test.js:48`, `ic5b.test.js:20` (ham, hot_dogs, deli_meat_uncured), `k9.test.js:19` (deli_meat_uncured, hot_dogs), `ic4b.test.js:22` (turkey_bacon), `k15.test.js:21` (ham, turkey_bacon), `k15.test.js:57` and `k23.test.js:51` (deli_meat_uncured as an ask owner).
- passRule numbers: ham's 20.5%, 18.5%, 17.0%, 10% live in `detail`, `science`, `labels_decoded`, all KEPT. No new number is authored on any card.

## ham (R)

| field | old | new | words |
| --- | --- | --- | --- |
| decision | Ham chosen by its label class, read for added water. | Ham named just “Ham” first, then “Ham With Natural Juices.” | 10 |
| tier_note | The water-added classes are USDA labeling definitions; choosing the least added water is the whole-food standard. | The product name tells how much water went in, and just “Ham” means the least. | 15 |
| instead | (absent) | Fresh ham: the leg of pork itself, which needs cooking before eating. | 12 |
| cart_pick | Ham with natural juices | Ham named just “Ham” | 4 |

Do line (doLines :67) KEPT: "Read the product name for “Water Added” or “Ham and Water Product”." Headline + do = 10 + 12 = 22 (≤28). Step 2 review-table headline cell becomes the new decision.

KEPT byte-identical, with reasons:
- why, kristy_take: "Ham is the cured leg of pork. …" Unchanged, so C7 skips them; no L2 front form (not decision/tier_note).
- short_answer: holds "highest protein level"; kept byte-identical so no changed field carries "protein" (row constraint).
- detail, science, labels_decoded: hold every protein figure (20.5%, 18.5%, 17.0%, 10%); kept byte-identical (row constraint, passRule numbers).
- pick_steps (2): step 1 is the ladder check; step 2 "Check whether the label says fully cooked or cook before eating." is the cook-before-eating safety line (ship bar).
- watch_out (2): item 2 "Fresh ham and country ham are not fully cooked and need cooking before eating." is the safety line; never shrinks.
- buying_tips, question, title, aliases, asked_as, sources, category, evidence_tier.

Note: the front ranks plain “Ham” above “Ham With Natural Juices”, so the old cart_pick (the second rung) moves to the first rung. Same type (deli ham).

## hot_dogs (R)

| field | old | new | words |
| --- | --- | --- | --- |
| decision | Hot dogs with named meat and no mechanically separated poultry. | KEPT | 10 |
| tier_note | The meat ingredients and byproducts wording disclose regulated processing distinctions; choosing named meat is the whole-food standard. | Mechanically separated poultry is a paste-like product of tissue taken off bones, and the list must name it. | 18 |
| instead | (absent) | Fresh sausage from the butcher counter, its meat named and nothing mechanically separated. | 13 |
| cart_pick | Hot dogs with named meat | KEPT | 5 |

Do line (doLines :69) KEPT. Decision unchanged, so the review-table headline cell is unchanged.

KEPT byte-identical, with reasons:
- decision: 10 words, one verdict, no hedge, no grass term, no tip 5-gram.
- cart_pick: already the front's first rung in label words; no shared term (L5).
- pick_steps (2): step 1 glosses the front; step 2 "“Uncured” can still mean celery-based curing; read the qualifier." is a PRESERVATION_CURE_SENTENCES member.
- why, kristy_take ("… The whole-food standard favors named meat."): not in the L2 front form; the 6-gram "the whole food standard favors named" needs 3 meat cards to fire. Rewrite only if counts.mjs shows it on ≥3 (see Open questions).
- short_answer (31 words), detail, science, watch_out (2), buying_tips, labels_decoded, and all preserved fields.

## turkey_bacon (R)

| field | old | new | words |
| --- | --- | --- | --- |
| decision | Turkey bacon read by its descriptive name and curing ingredients. | Turkey bacon with the fewest ingredients after the turkey. | 9 |
| tier_note | The descriptive name and curing list are USDA labeling requirements, so reading them is the whole-food standard. | Turkey bacon is turkey meat pressed into bacon form, so fewer additions keep it closer to the meat. | 18 |
| instead | (absent) | Pork bacon, the belly cut that “bacon” alone names on a US label. | 13 |
| cart_pick | Turkey bacon with listed curing ingredients | Turkey bacon with the fewest ingredients | 6 |

Do line (doLines :175) KEPT: "Read the small print under the name for the meat cuts used." Headline + do = 9 + 12 = 21. Step 2 review-table headline cell becomes the new decision. The new decision names no observable the do line names (the meat name stays in the do line and pick_steps 1), to stay clear of OBSERVABLE_IN_BOTH.

KEPT byte-identical, with reasons:
- pick_steps (3): step 1 "Read the descriptive name beside “turkey bacon” for the meat used." (11); step 2 "Read each curing ingredient in the ingredients statement." is a PRESERVATION_CURE_SENTENCES member; step 3 "Find any “Uncured” claim and the “No Nitrate or Nitrite Added” beside it." (13). All within D1 and they gloss the label the front sends the shopper to.
- why, kristy_take, short_answer: no L2 front form; unchanged, so C7 skips them.
- watch_out (1): "Turkey bacon is still a cured product, …" never shrinks.
- detail, science, buying_tips, labels_decoded, and all preserved fields.

Note: the old cart_pick printed "curing"; the new one carries the front's first rung and prints no cure word. Same type (turkey bacon).

## deli_meat_uncured (R, light)

| field | old | new | words |
| --- | --- | --- | --- |
| decision | ‘Uncured’ meat is cured, using celery powder instead of added nitrite. | KEPT | 11 |
| tier_note | Celery powder being the same nitrate chemistry as added nitrite is settled labeling fact, whichever cut the counter slices. | KEPT | 19 |
| instead | (absent) | Whole roasted meat sliced thin does the same sandwich job with nothing added. | 13 |
| cart_pick | (absent) | Counter-sliced whole roasted meat | 4 |

Do line (doLines :40) KEPT: "Ask the counter to slice whole roasted meat thin instead." Decision unchanged, so the review-table headline cell is unchanged.

KEPT byte-identical, with reasons:
- decision: the cure sentence kept on purpose (PRESERVATION_CURE_SENTENCES member, also science s1). 11 words, no hedge.
- tier_note: one sentence, 19 words, no "whole-food standard", no tip 5-gram. Rewriting it would need a new cure sentence, which only the shared set may supply; the one candidate ("Celery powder is a concentrated natural nitrate source, so it is a curing agent, not the absence of one.", 19 words) already sits in science, so swapping it in adds a second copy on this card and raises the L2 risk with bacon. Kept.
- pick_steps (3): step 2 is a PRESERVATION_CURE_SENTENCES member; step 3 is the ladder (whole roasted meat, then counter-sliced, before the tub).
- why, short_answer (38 words), kristy_take, detail, science, watch_out (2), buying_tips, labels_decoded, and all preserved fields.
- L1 (row constraint): no field on this card shares a 5-gram with tip check 3 ("On packaged meat, look for an ingredient list of meat, salt, and spices."). Closest: buying_tips 3 "a shorter ingredient list than" and pick_steps 2 "the ingredients list" (different token), both clear. The two new fields (instead, cart_pick) are not in `REPEATED_CLAIM_FIELDS`, so they cannot create an L1 or L2 hit.

cart_pick is ADDED (the card has none today). D1 makes cart_pick the one-tap add; the front here is a fact, not a rung, so it names the first shelf rung from pick_steps 3. If the dispatcher rules this question card takes no one-tap add, drop this row; nothing else depends on it.

## Claim-trace table (one row per new sentence)

Tags as in ca-3a: `card` = already on this card; `KS` = kristys_standard, no new fact; `meat:<lines>` = quoted in `docs/research/meat-sources.md`.

| # | card.field | new sentence | trace |
| --- | --- | --- | --- |
| E1 | ham.decision | Ham named just “Ham” first, then “Ham With Natural Juices.” | card short_answer "A ham labeled plain “Ham” must meet the highest protein level. “Water Added” and “Ham and Water Product” mean more added solution."; card detail "“Ham” needs at least 20.5% … “Ham With Natural Juices” needs at least 18.5%." (rung order = class order) |
| E2 | ham.tier_note | The product name tells how much water went in, and just “Ham” means the least. | card why "Its product name tells how much water the curing added."; card short_answer (plain “Ham” = highest level; the others "mean more added solution") |
| E3 | ham.instead | Fresh ham: the leg of pork itself, which needs cooking before eating. | card labels_decoded "Fresh ham": "Uncured leg of pork, prepared without nitrate or nitrite."; card watch_out 2 "Fresh ham and country ham are not fully cooked and need cooking before eating." |
| E4 | ham.cart_pick | Ham named just “Ham” | E1 first rung; form follows the existing cart_pick "A carton named “ice cream”" (KB :8988) |
| E5 | hot_dogs.tier_note | Mechanically separated poultry is a paste-like product of tissue taken off bones, and the list must name it. | card short_answer "Mechanically separated poultry is a paste-like product, made by separating attached tissue from bones. Its name belongs in the ingredient statement."; card sources 9 CFR 381.173 |
| E6 | hot_dogs.instead | Fresh sausage from the butcher counter, its meat named and nothing mechanically separated. | meat:102-105 9 CFR 319.141 (https://www.law.cornell.edu/cfr/text/9/319.141): "'Fresh Pork Sausage' is sausage prepared with fresh pork … and may contain Mechanically Separated (Species)" (so the check carries over); card decision/pick_steps 1 (named meat, no mechanically separated); KS sideways move |
| E7 | turkey_bacon.decision | Turkey bacon with the fewest ingredients after the turkey. | KS (closest-to-nature, no new fact); card evidence_tier `kristys_standard`; card science "Each substance in a curing mixture … must be listed." (the list is complete, so counting it is meaningful); meat:121-122 9 CFR 317.17 "any substance mixed with another substance to cure a product must be identified in the ingredients statement" |
| E8 | turkey_bacon.tier_note | Turkey bacon is turkey meat pressed into bacon form, so fewer additions keep it closer to the meat. | card why "Turkey bacon is turkey meat seasoned and pressed into bacon form."; KS clause (no health claim) |
| E9 | turkey_bacon.instead | Pork bacon, the belly cut that “bacon” alone names on a US label. | card detail/science "Under US labeling, “bacon” alone means cured pork belly." (cure word omitted, statement narrowed, not changed); KS sideways move (whole cut over a pressed form, per card why) |
| E10 | turkey_bacon.cart_pick | Turkey bacon with the fewest ingredients | E7 first rung |
| E11 | deli_meat_uncured.instead | Whole roasted meat sliced thin does the same sandwich job with nothing added. | card buying_tips 4, verbatim |
| E12 | deli_meat_uncured.cart_pick | Counter-sliced whole roasted meat | card pick_steps 3 "Pick whole roasted meat first, then counter-sliced meat before the prepacked tub."; do line "Ask the counter to slice whole roasted meat thin instead." |

## Self-check against the rules (by hand; counts.mjs re-counts)

- D1: decisions 10 / 10 / 9 / 11 words; tier_notes 15 / 18 / 18 / 19, one sentence each; instead 12 / 13 / 13 / 13; pick_steps unchanged (2 / 2 / 3 / 3, each ≤14).
- C2: no grass term in any decision or cart_pick.
- C5 over changed fields: no brand, no `healthier|healthiest|better for you|lowers|exposure|protein|calorie`, no `cheapest|price|$`, no em-dash, no I/me/my/mine. Ham's "protein" stays only in KEPT fields.
- C7: no changed decision/tier_note/why/short_answer/kristy_take holds a cure word.
- L1: no new string shares a 5-gram with the meat tip (rule or checks 1-3). L4/L5: no CANONICAL_GLOSSES term in any decision or cart_pick here.
- CULINARY_LEXICON: no new decision, cart_pick or pick_step uses a lexicon word ("roasted" does not match `\broast\b`, and it appears only in deli instead/cart_pick, existing wording).
- D4: no `/at home with|stir|top it|mix it/i`.
- Safety lines: ham pick_steps 2 and watch_out 2 kept byte-identical.

## Open questions

1. L2 across parts C and E (cannot be checked from here; counts.mjs decides): shared-set sentences are not L2-exempt. If bacon and cured_pork (part C) reuse "“Uncured” can still mean celery-based curing; read the qualifier." (hot_dogs pick_steps 2), "Read each curing ingredient in the ingredients statement." (turkey_bacon pick_steps 2), "Each substance in a curing mixture, such as salt, sugar, or sodium nitrite, must be listed." (turkey_bacon detail/science) or "Under US labeling, “bacon” alone means cured pork belly." (turkey_bacon detail/science), that is 3 meat cards and L2 fires. The fix lands on whichever card is not the term's owner; part C should avoid adding a third copy.
2. deli_meat_uncured front: KEPT as the deliberate cure sentence, which is a fact, not a "best version" (D1). If the dispatcher wants a version front instead, option B is "Whole roasted meat sliced at the counter first, then counter-sliced before the tub." (12 words, card pick_steps 3), with the cure sentence staying in science s1. Not applied.
3. deli_meat_uncured cart_pick is a new field on this card (E12); confirm a one-tap add is wanted on it, and that "Counter-sliced whole roasted meat" routes to deli_meat_uncured through `matchItemToCard` (it may pull toward a generic meat card).
4. hot_dogs why/kristy_take keep "The whole-food standard favors named meat." Rewrite only if counts.mjs shows the 6-gram on ≥3 meat cards (pick_sausage in part C is the likely second holder).
