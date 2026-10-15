# ca-4b cards, part F: plain_kefir, raw_kefir, sour_cream, cream_cheese

Status: DRAFT COMPLETE (planner@opus, 2026-10-15). Drop-in text for the `.pipeline/specs/ca-4b.md` Step 1 rows and the `SPEC` object in its acceptance test. Not built. Not migrated. No lint or test was run on this text. Every check below is a hand count against the rules as read in `server/lib/counterCardLint.js`, `server/test/acceptance/passRule.js` and ca-4b.md :127-205.

KB locations at 8b49633 (KB unchanged since; later commits are spec-only): raw_kefir :4701 (tier_note :4752), plain_kefir :4755 (decision :8765), sour_cream :8808 (decision :8817), cream_cheese :8859 (decision :8869). Do-line rows: `docs/do-lines-review.md` :105, :157, :158, :159.

## Findings that change ca-4b.md

1. The ca-4b.md row for raw_kefir cites the tier_note at :4712. That line is the decision; the tier_note is at :4752. The row also says the HEAD tier_note is 30 words. A whitespace count gives 31. Either way it is over the cap of 20.
2. The plain_kefir `cart_pick` carries "100%". `perimeter.test.js:213-214` forbids `%` in cart_pick until ca-4a Step 6 lands its "100%" exemption and raises the cap to 46 (see ca-4a.md :84). So ca-4b must merge after ca-4a, or it must carry the same edit.

## plain_kefir (category dairy, evidence kristys_standard, family milk_processing)

| field | old | new |
| --- | --- | --- |
| decision | Plain kefir: milk and cultures alone. | Plain kefir from 100% grass-fed whole milk. |
| cart_pick | Plain kefir from the cold case | Plain whole-milk kefir, 100% grass-fed |
| instead | (absent) | Plain organic whole-milk kefir is the next bottle down. |
| pick_steps | ["Pick the bottle labeled plain, not flavored.", "Take it from the refrigerated case and keep it cold."] | ["Pick the bottle labeled plain, not flavored.", "100% grass-fed on kefir means the cows ate grass and hay, never grain.", "Take it from the refrigerated case and keep it cold."] |

Do-lines row :157. The headline changes and the do line stays:
`| \`plain_kefir\` | eggs_dairy | Plain kefir from 100% grass-fed whole milk. | Read the ingredient list for milk and kefir cultures only. | — |`

Kept byte-identical, with reasons:
- tier_note "Milk and cultures alone is the whole-food reading of a kefir bottle." It is 12 words, one sentence and not a tier name. It shares "kefir" and "milk" with the new decision and "milk", "cultures" and "kefir" with the do line, so TIER_NOTE_ORPHANED is clean. It does not contradict the new front.
- The do line. It shares no quoted term and no distinctive term (hyphenated or 6+ letters) with the new decision, since "grass-fed" appears only in the decision. No lint or tip collision forces a change.
- why, short_answer, detail, kristy_take, buying_tips ×3, watch_out, science, labels_decoded ×2, sources ×3, asked_as ×3, aliases. None contradicts a grass-fed, whole-milk front. None contains "homogenized" or "ultra-pasteurized", so lintRepeatedClaim (milk_processing) is clean.

Checks by hand:
- Decision is 7 words, with no hedge or conditional words. With the do line (10 words) the total is 17, under 28.
- L4: the decision carries the G2 term "100% grass-fed". Its gloss "the cows ate grass and hay, never grain" appears verbatim in pick_steps[1]. That step follows the ca-4a Milk and Yogurt pattern.
- L5(a): both cart_pick and the decision match the grass-fed family. L5(b): the decision has no rung split, so the whole decision is the first rung. Its scoped term "100% grass-fed" is in cart_pick.
- cart_pick is 38 characters. Its only "%" is the literal "100%" (see Finding 2).
- pick_steps: three steps of 7, 13 and 10 words, each ending in ".". The only digit, 100, also appears in the decision, so KT_NEW_NUMBER is clean. No step copies the do line.
- L2: when the canonical term and gloss are cut out of the new step, only "on kefir means" is left, which has no 6-gram. The decision's 4-grams contain "kefir", and no other eggs_dairy card is named kefir except raw_kefir, which has no shared run.
- instead is 9 words. It does not open on a conditional and has no co-equal phrase. The decision has no "." or ";" before its end, so no words are refused. "organic" in instead needs no G4 gloss, because L4 reads the decision only (same as ca-4a's Yogurt instead).

SPEC entry:
```js
plain_kefir: {
  decision: 'Plain kefir from 100% grass-fed whole milk.',
  cart_pick: 'Plain whole-milk kefir, 100% grass-fed',
  instead: 'Plain organic whole-milk kefir is the next bottle down.',
  pick_steps: ['Pick the bottle labeled plain, not flavored.', '100% grass-fed on kefir means the cows ate grass and hay, never grain.', 'Take it from the refrigerated case and keep it cold.'],
},
```

## raw_kefir (category dairy, evidence time_tested)

| field | old | new |
| --- | --- | --- |
| tier_note | Culturing milk to keep it is among the oldest preservation methods and barely studied as a modern product, so the case for it is the live ferment, not a health outcome. | Culturing milk is among the oldest preservation methods, barely studied; the case is the ferment, not a health outcome. |
| instead | (absent) | Plain kefir from 100% grass-fed whole milk, the next bottle down from raw. |

Do-lines row :105 is unchanged, because the decision is unchanged.

Kept byte-identical, with reasons:
- watch_out ×4, including "Raw dairy is not for every household. The raw milk card names who, once." It is held byte-identical by direction (a safety line, never reworded).
- decision "Kefir is milk fermented with live grains, and worth buying plain." It is 11 words, names the pick (plain) and is the review headline, so keeping it leaves :105 alone.
- cart_pick "Plain raw kefir". The first rung is unchanged.
- why, card_why, short_answer, detail, kristy_take, buying_tips ×4, pick_steps ×3, science, labels_decoded ×2, sources ×3, asked_as, aliases.

Checks by hand:
- The new tier_note is 19 words and one sentence with one semicolon. It is not a tier name, has no "this tier" or "the tier", and does not match D4. Every phrase in it is cut from the HEAD tier_note: "Culturing milk", "among the oldest preservation methods", "barely studied", "the case", "ferment", "not a health outcome". It shares "milk" with the decision and "case" with the do line, so TIER_NOTE_ORPHANED is clean.
- passRule: the HEAD raw_kefir REWRITABLE text holds no digits, so no number can be lost.
- instead is 13 words, not conditional, with no co-equal phrase. The decision has no mid-sentence "." or ";", so no words are refused. It names the plain_kefir first rung, so the two kefir cards point the same way.
- raw_kefir is not in the milk_processing family, and the new strings contain no "homogenized" or "ultra-pasteurized" anyway.

SPEC entry:
```js
raw_kefir: {
  tier_note: 'Culturing milk is among the oldest preservation methods, barely studied; the case is the ferment, not a health outcome.',
  instead: 'Plain kefir from 100% grass-fed whole milk, the next bottle down from raw.',
},
```

## sour_cream (category dairy, evidence established)

| field | old | new |
| --- | --- | --- |
| decision | Sour cream soured by bacteria, not by an added acid. | Sour cream made from cream soured by bacteria, nothing else added. |
| cart_pick | Cultured sour cream | Sour cream, cream and cultures only |
| instead | (absent) | Plain whole-milk yogurt, its only sugar the lactose from the milk. `[PLACEHOLDER]` (product choice from ca-4b.md :76) |
| pick_steps | ["Pick sour cream or cultured sour cream before acidified sour cream.", "Check the name for “acidified”; added acids did the souring."] | ["Pick sour cream or cultured sour cream before acidified sour cream.", "Read the ingredients for cream and cultures, with nothing listed after them.", "Check the name for “acidified”; added acids did the souring."] |

Do-lines row :158. The headline changes and the do line stays:
`| \`sour_cream\` | eggs_dairy | Sour cream made from cream soured by bacteria, nothing else added. | Read the name on the tub for “cultured” or “acidified”. | — |`

Kept byte-identical, with reasons:
- tier_note "Souring by bacteria is the craft standard; acidified tubs meet a federal standard of their own." It is 16 words and shares "bacteria" with the new decision. It does not contradict the new front.
- why, short_answer, detail, science (all of which hold "18", which passRule requires), kristy_take, buying_tips ×3 ("Read the optional ingredients added for texture or shelf life." now points at the new step), watch_out, labels_decoded ×2, sources ×2, asked_as, aliases.
- The do line. The decision avoids the words "cultured" and "acidified" on purpose: the do line quotes both, and this draft did not confirm whether OBSERVABLE_IN_BOTH stems words. "cultures" sits in cart_pick and pick_steps, which that lint does not read.

Checks by hand:
- Decision is 11 words, with no hedge or conditional words. With the do line (10 words) the total is 21.
- cart_pick is 35 characters, with no "%" and no culinary-aim word.
- pick_steps: three steps of 10, 12 and 9 words, each ending in ".". There are no digits. The new step shares no 5-gram with the tip check "Dairy needs few ingredients: milk or cream, cultures, salt, and enzymes for cheese." (L1) and does not copy the do line.
- instead is 12 words. Its first clause is "Plain whole-milk yogurt" and is not conditional. No words are refused. It names a different product from cart_pick, so C2 holds.

SPEC entry:
```js
sour_cream: {
  decision: 'Sour cream made from cream soured by bacteria, nothing else added.',
  cart_pick: 'Sour cream, cream and cultures only',
  instead: 'Plain whole-milk yogurt, its only sugar the lactose from the milk.',
  pick_steps: ['Pick sour cream or cultured sour cream before acidified sour cream.', 'Read the ingredients for cream and cultures, with nothing listed after them.', 'Check the name for “acidified”; added acids did the souring.'],
},
```

## cream_cheese (category dairy, evidence established, family milk_processing)

| field | old | new |
| --- | --- | --- |
| decision | Cream cheese by its standard name, at least 33% milkfat. | Cream cheese by its standard name, at least 33% milkfat, no stabilizers. |
| cart_pick | Cream cheese with a culture listed | Cream cheese with no stabilizers listed |
| instead | (absent) | Cream cheese with stabilizers listed, held by the standard to 0.5 percent at most. |
| pick_steps | ["Look for “cream cheese” as the name; that name carries the standard.", "Find a culture in the list; stabilizers may follow, up to 0.5 percent."] | ["Look for “cream cheese” as the name; that name carries the standard.", "Stabilizers are allowed up to 0.5 percent; choose the package that lists none."] |

Do-lines row :159. The headline changes and the do line stays:
`| \`cream_cheese\` | eggs_dairy | Cream cheese by its standard name, at least 33% milkfat, no stabilizers. | Read the ingredients for a culture, then count the stabilizers after it. | — |`

Kept byte-identical, with reasons:
- The string "at least 33% milkfat" stays in the decision, as directed (the pass rule tracks "33%").
- tier_note "A culture in the ingredients is what the federal standard requires." It is 11 words and shares "standard" with the decision and "culture" and "ingredients" with the do line.
- why, short_answer, detail, science, labels_decoded (which hold 33, 55 and 0.5), kristy_take, buying_tips ×3, watch_out "Stabilizers are allowed, up to 0.5 percent of the cheese.", sources ×2, asked_as, aliases. None contains "homogenized" or "ultra-pasteurized".
- The do line. "count the stabilizers after it" reads as zero for the new pick. It shares one distinctive term ("stabilizers") with the decision; the lint fires at two or more, and neither line quotes it.

Checks by hand:
- Decision is 12 words, with no hedge or conditional words. With the do line (12 words) the total is 24.
- cart_pick is 39 characters, with no "%" ("33%" stays out of cart_pick on purpose).
- pick_steps: two steps of 12 and 13 words, each ending in ".". The digit 0.5 also appears in why and watch_out, so KT_NEW_NUMBER is clean. Neither step copies the do line. The culture check now lives only in the do line and tier_note, not in a step.
- passRule: "33%", "33", "55" and "0.5" all survive in REWRITABLE text, because the decision keeps "33%" and why, short_answer and watch_out are unchanged.
- instead is 14 words, not conditional, with no co-equal phrase. The decision has no mid-sentence "." or ";", so no words are refused. It differs from cart_pick.

SPEC entry:
```js
cream_cheese: {
  decision: 'Cream cheese by its standard name, at least 33% milkfat, no stabilizers.',
  cart_pick: 'Cream cheese with no stabilizers listed',
  instead: 'Cream cheese with stabilizers listed, held by the standard to 0.5 percent at most.',
  pick_steps: ['Look for “cream cheese” as the name; that name carries the standard.', 'Stabilizers are allowed up to 0.5 percent; choose the package that lists none.'],
},
```

## Claim trace

KS = Kristy’s standard (a ranking judgment, not a fact claim). "dairy-eggs" = `docs/research/dairy-eggs-sources.md`; "card-align" = `docs/research/card-align-sources.md`. Card fields are quoted at 8b49633.

| # | card.field | new sentence | trace |
| --- | --- | --- | --- |
| 1 | plain_kefir.decision | Plain kefir from 100% grass-fed whole milk. | card.decision "Plain kefir: milk and cultures alone."; card-align :16-17 "“100% Grass Fed” claims may only be applied to meat and meat product labels derived from cattle that were only (100%) fed grass (forage)"; card-align :42 "the diet of grassfed animals must solely be derived from grass and forage throughout their lives."; KS (whole milk and grass-fed first, per ca-4b.md :74) |
| 2 | plain_kefir.cart_pick | Plain whole-milk kefir, 100% grass-fed | row 1 |
| 3 | plain_kefir.instead | Plain organic whole-milk kefir is the next bottle down. | card-align :61 "## 3a. 7 CFR 205.237 Livestock feed"; KS (organic is the second rung, per ca-4b.md :74) |
| 4 | plain_kefir.pick_steps[1] | 100% grass-fed on kefir means the cows ate grass and hay, never grain. | card-align :18-19 "The diet must be derived solely from forage, and animals cannot be fed grain or grain by-products"; card-align :22-23 "Hay, haylage, baleage, silage, crop residue without grain"; G2 canonical gloss (counterCardLint.js CANONICAL_GLOSSES) |
| 5 | raw_kefir.tier_note | Culturing milk is among the oldest preservation methods, barely studied; the case is the ferment, not a health outcome. | card.tier_note (HEAD :4752) "Culturing milk to keep it is among the oldest preservation methods and barely studied as a modern product, so the case for it is the live ferment, not a health outcome." (shortened, nothing added) |
| 6 | raw_kefir.instead | Plain kefir from 100% grass-fed whole milk, the next bottle down from raw. | card.detail "Made from raw milk it is the same sourcing question as the milk"; card.detail "Plain is the only version worth buying."; rows 1 and 4 sources (card-align :16-19, :42); KS (raw first, then the plain_kefir front) |
| 7 | sour_cream.decision | Sour cream made from cream soured by bacteria, nothing else added. | card.science "Sour cream, or cultured sour cream, is pasteurized cream soured by lactic acid bacteria."; card.science "Optional ingredients may improve texture, extend shelf life, or stop liquid separating out."; KS (no optional ingredients) |
| 8 | sour_cream.cart_pick | Sour cream, cream and cultures only | row 7; card.labels_decoded "Cream soured by bacteria, the same food as sour cream." |
| 9 | sour_cream.instead | Plain whole-milk yogurt, its only sugar the lactose from the milk. | dairy-eggs :168-169 "Whole-milk yogurt" (in "Whole-milk yogurt\n> contains 3.25% fat"); dairy-eggs :174-175 "In plain yogurt, the sugar content will be\n> from lactose only." (one sentence across two quote lines); product choice `[PLACEHOLDER]` per ca-4b.md :76 |
| 10 | sour_cream.pick_steps[1] | Read the ingredients for cream and cultures, with nothing listed after them. | card.buying_tips "Read the optional ingredients added for texture or shelf life."; card.detail "Optional ingredients may improve texture, extend shelf life, or stop syneresis"; KS |
| 11 | cream_cheese.decision | Cream cheese by its standard name, at least 33% milkfat, no stabilizers. | card.decision (HEAD) "Cream cheese by its standard name, at least 33% milkfat."; card.why "stabilizers at 0.5 percent at most"; KS (none is closest to milk, cream and culture) |
| 12 | cream_cheese.cart_pick | Cream cheese with no stabilizers listed | row 11 |
| 13 | cream_cheese.instead | Cream cheese with stabilizers listed, held by the standard to 0.5 percent at most. | card.why "The standard sets at least 33 percent milkfat, a bacterial culture, and stabilizers at 0.5 percent at most." |
| 14 | cream_cheese.pick_steps[1] | Stabilizers are allowed up to 0.5 percent; choose the package that lists none. | card.watch_out "Stabilizers are allowed, up to 0.5 percent of the cheese."; KS (choose none) |

Untraced: none as a fact claim. Rows 3, 6, 11 and 14 rest partly on KS, which marks the rung order as judgment. Row 3's "organic" cites a source heading, not a quoted organic rule. If ca-4b requires a quoted line for "organic", the 205.237 body at card-align :68 is a markdown-linked line and was not quoted here.

## For the builder and merger

- `docs/do-lines-review.md` headline column must equal the new decision for plain_kefir (:157), sour_cream (:158) and cream_cheese (:159) (C6, `ic7b.test.js:87`). raw_kefir :105 is unchanged. No do line changes, so `server/scripts/buildDoLines.js` output should not move. Rebuild `doLines.json` and confirm that it does not.
- Merge after ca-4a (Finding 2), or plain_kefir's cart_pick fails the `%` check in `perimeter.test.js`.
- L2 merge check across all ca-4b fragments (F, G, H, I) and ca-4a: "take it from the refrigerated case" is already on plain_kefir and raw_kefir at HEAD, so a third eggs_dairy card using that 6-gram fails L2. "among the oldest preservation methods" and "not a health outcome" in raw_kefir's tier_note would collide if fragment G's raw_aged_cheese tier_note reuses either 4-gram. Run the L2 count after splicing.
- Every new apostrophe or quote is curly (’ “ ”). Check that the splice does not straighten them (C5).

## Open questions

1. cream_cheese: this draft adds "no stabilizers" as the first rung, which changes the headline. The alternative keeps the HEAD decision and adds only instead. That alternative leaves the decision naming the legal standard rather than a rung. Recommended: the change as written.
2. sour_cream instead: plain whole-milk yogurt is a `[PLACEHOLDER]` from ca-4b.md :76. Devon may prefer a different sideways product.
3. OBSERVABLE_IN_BOTH stemming was not read. If it does not stem, the sour_cream decision could say "cream and cultures" verbatim, as directed, without a do-line change.
