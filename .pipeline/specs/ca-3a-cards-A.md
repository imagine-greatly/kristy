# ca-3a cards A: beef_cuts_basics, organ_meats, judging_meat_at_the_case, butcher_counter_asking

Planner@opus, 2026-10-15, at `5267f05`. Fills four of the eight `TODO` cards in `.pipeline/specs/ca-3a.md` Step 1c. Same layout as Step 1a/1b. Fields not named stay byte-identical. Curly quotes only (‘ ’ “ ”). No em-dash in any changed string. Word counts are whitespace tokens (builder re-counts with the lint's counter).

Pins read before writing: counterDecision.test.js:173 (Steak "Chuck" in first 3 words), ic5a.test.js:88-90 (prime/choice/select on Steak; use-by|sell-by on judging; C5 every folded buying_tips/watch_out sentence stays verbatim on the survivor), ic5b.test.js:47 (judging front), ic5b C5 (reviewHeadline === decision, lintCard with do line, tier_note unique), ca-3a C6/C7/C8/C9 (D1 limits, POINTER on butcher, BRAND regex includes `certified angus` and runs over any CHANGED copy field).

Meat tip (CA-5, for the L1 check): rule "A local butcher comes first; at the case, choose meat from animals raised on grass and open pasture."; check 1 "Ask what the animal ate and how it lived; a butcher counter can answer."; check 2 "Organs come from the same animal; liver and heart belong in the cart too."; check 3 "On packaged meat, look for an ingredient list of meat, salt, and spices." No new string below shares a 5-word run with any of them (checked by hand; C9 is the arbiter).

#### 1c-i. `beef_cuts_basics` ("Steak") (R, front kept)

| field | old | new |
| --- | --- | --- |
| instead | (absent) | Loin or rib cuts, whole, with no ‘mechanically tenderized’ in the name. |

Kept byte-identical, with reasons:
- decision "Chuck or round, whole, with no needles or blades pushed through." [11]: already D1; counterDecision.test.js:173 pins "Chuck" in the first 3 words; it is the cut and whole-muscle front the inventory asks for.
- tier_note [17], one sentence, carries the term bridge from "needles or blades" to ‘mechanically tenderized’.
- cart_pick "Whole chuck, not mechanically tenderized": agrees with the front; no shared term (L5).
- pick_steps (3): already holds the POINTER "How it was raised: see Beef." (inventory "plus POINTER" is satisfied).
- watch_out (7), **byte-identical on purpose** (Open question 1, option a). Item 5 ("‘Angus’ on a package is not a grade. Certified Angus Beef is a brand with its own checklist. ...") is a folded `beef_grades_usda` sentence that ic5a C5 requires verbatim, and any edit to this field makes ca-3a C8's BRAND regex (`certified angus`) fire on the whole field. D6 exception, named: a word-for-word pin from an earlier test.
- buying_tips, labels_decoded (prime/choice/select stay for ic5a :88), why, short_answer, detail, kristy_take, sources, aliases.
- do line "Read the name for “mechanically tenderized” before the cut name." and review row :44: unchanged (decision unchanged).

Word counts: decision 11; tier_note 17; instead 12; pick_steps 11/6/9.

#### 1c-ii. `organ_meats` (R, front kept)

| field | old | new |
| --- | --- | --- |
| tier_note | The 1 to 2 day cook window and 160°F come from USDA handling guidance for organ meats. | Organ meats keep a shorter time in the refrigerator than steaks and roasts. |
| instead | (absent) | A beef blend with liver and heart ground in, each with its percentage printed. |
| pick_steps | ["Buy only for a cook within one to two days.", "Match each organ to its method; heart and tongue go in liquid."] | ["Ask the counter or a farmer which organs they offer.", "How it was raised: see Beef.", "Match each organ to its method; heart and tongue go in liquid."] |

Reasons:
- tier_note: the old line names where the numbers came from, not why this version. The new line is the why (organs keep less time, so they are bought for a set cook). 160°F stays in short_answer and science; the USDA source stays in sources.
- instead: the front already holds the rung (fresh organs for a planned cook), so this is the sideways move to a different food: the Ground beef card's best rung (organ blend with printed shares). No grass term; no 5-word run with tip check 2.
- pick_steps: step 1 restated the front and is already verbatim in buying_tips[0] ("Buy organ meats for a cook within one to two days."), so it gives way. buying_tips[1] moves up verbatim. The POINTER is added per D2 rule 3 (organ meats do not print the shared term).

Kept byte-identical, with reasons:
- decision "Organ meats bought for a cook within one to two days." [10]: already D1. The KB holds no traced quality rung among organs (no source ranks liver over heart, or fresh over frozen), so any other front would invent a claim. Do line "Check the use-by date against the night it will be cooked." and review row :139 unchanged.
- cart_pick "Organ meat for a cook within two days": agrees with the front; no shared term.
- watch_out (1): the pregnancy → doctor safety line, verbatim.
- why, short_answer, detail, science, kristy_take, buying_tips, labels_decoded.
- sources, aliases, asked_as: K15 id, nothing added.

Word counts: decision 10; tier_note 13; instead 14; pick_steps 10/6/12.

#### 1c-iii. `judging_meat_at_the_case` (★ essential, R)

| field | old | new |
| --- | --- | --- |
| decision | Color comes from oxygen and packaging, not from how fresh it is. | The pack with the newest ‘packaged on’ date in the case. |
| tier_note | Color coming from oxygen is settled chemistry, which is why a sealed package and a smell test read more than the shade. | Fresh tray-wrapped meat keeps up to three days refrigerated after packaging, so that date sets the clock. |
| instead | (absent) | A well-sealed vacuum pack, which keeps up to seven days refrigerated from purchase. |
| pick_steps | ["Take a sealed, leak-free package from the back, where the case is coldest.", "Pass on slime or any off smell; color alone is not the test."] | ["‘Packaged on’: the packing day, not a safety cutoff.", "Take a sealed, leak-free package from the back, where the case is coldest."] |
| watch_out | 5 items: [0] Brownish…, [1] ‘packaged on’…, [2] Sell-by…, [3] Store names…, [4] Ungraded… | 7 items: old [1], [2], [3], [4], then old [0], then the old decision, then the old pick_steps[1], each verbatim (below) |

watch_out, new, byte-exact:
1. A ‘packaged on’ date is not a safety cutoff. Fresh tray-wrapped meat generally holds up to three days refrigerated after packaging. A well-sealed vacuum pack can go up to seven.
2. Sell-by and use-by dates are set voluntarily by the packer or store. Federal law does not require them, and they are not a safety indicator.
3. Store names for one cut vary by region, so read the primal cut instead.
4. Ungraded beef is inspected, but its quality may be higher or lower than graded beef.
5. Brownish or discolored meat is not automatically spoiled. Judge it by the seal and the smell, not the color alone.
6. Color comes from oxygen and packaging, not from how fresh it is.
7. Pass on slime or any off smell; color alone is not the test.

Reasons:
- decision: the front names something only the package shows (inventory). The color fact leaves the front and moves, verbatim, to watch_out 6. No seal/leak/smell word in the front, so it shares no term with the do line (OBSERVABLE_IN_BOTH: `termsOf` has no stemming; "packaged" ≠ "package").
- tier_note: the why for the date. The old tier_note is dropped, not moved: it is 22 words (over SENTENCE_MAX 20 for watch_out, and it may not be reworded), and its content is already in `why` ("Color is oxygen. A sealed package that is not leaking, and no off smell, tell you more.") and kristy_take.
- instead: the next pick when the newest tray is not there; the vacuum figure is already on the card (watch_out item 1).
- pick_steps: step 1 glosses the front's label term. The slime/smell step is a safety line, so it moves verbatim to watch_out 7 (never deleted). Step "Take a sealed, leak-free package…" stays.
- watch_out: color/smell lines to the end, per inventory; no sentence reworded (ic5a C5); nothing dropped. Items 5 and 7 overlap with buying_tips[0]/[6]; OK rough edge.

Kept byte-identical, with reasons:
- No `cart_pick` field exists on this card; none is added (a judging card has no shelf item; nothing for L5 to check).
- why, short_answer, detail, science, kristy_take, buying_tips, labels_decoded ("Sell-by date" stays for ic5a :90), sources, aliases, asked_as, eyebrow_short.
- do line "Check the package is sealed and not leaking juices, then smell it." unchanged (not handling trivia for this card; shares no distinctive term with the new front).

Word counts: decision 10; tier_note 17; instead 13; pick_steps 8/13; watch_out items unchanged.

Plumbing for this card:
- `docs/do-lines-review.md` :75 headline cell → `The pack with the newest ‘packaged on’ date in the case.`; do cell unchanged. Regenerate `doLines.json`.
- ic5b.test.js :47 → `  assert.match(now('judging_meat_at_the_case').decision, /packaged on/i, 'judging front lost its package fact');`

#### 1c-iv. `butcher_counter_asking` (R)

| field | old | new |
| --- | --- | --- |
| decision | Ask the butcher how it was raised and when it was cut. | Ask for beef soup bones, and a whole chuck ground fresh. |
| tier_note | Asking how it was raised and when it was cut is a shopping habit, not a meat claim. | Soup bones come from the counter, and a whole chuck ground fresh lets the shopper choose the cut. |
| instead | (absent) | A whole chuck roast, cut, tied or boned to order at the counter. |
| cart_pick | Grass-finished beef soup bones | Beef soup bones from the butcher counter |
| pick_steps | ["Ask for a whole chuck ground fresh, which lets you choose the cut.", "How it was raised: see Beef.", "Ask them to portion it; cutting, tying and boning are usually included."] | ["Soup bones: ask for marrow or knuckle bones.", "How it was raised: see Beef.", "Ask them to portion it; cutting, tying and boning are usually included."] |

Reasons:
- decision: the old front was tip check 1 in other words (ask how it was raised). The new front is what only this counter hands over: the bones and a fresh grind of a named cut. Its first rung is the cart_pick (soup bones). No 5-word run with check 1. Shares only "ask"/"and" with the do line (not distinctive).
- tier_note: the why for both halves of the front; the old line echoed check 1.
- instead: sideways, the same cut kept whole and cut to order.
- cart_pick: plan string (fixed). Prints no shared term; the front prints none either (L5, C7).
- pick_steps: step 1 restated the new front, so it becomes the soup-bone gloss; "which lets you choose the cut" lives on in tier_note and buying_tips[1]. The POINTER stays (C7).

Kept byte-identical, with reasons:
- why, short_answer, detail, science, kristy_take, watch_out (4), labels_decoded ([]), sources, aliases, asked_as.
- buying_tips: kept, but see open note B.
- do line "Ask what came in today and when it was cut." unchanged; review row :76 headline cell → the new decision; regenerate `doLines.json`.

Word counts: decision 11; tier_note 18; instead 13; cart_pick 7; pick_steps 8/6/12.

## Claim-trace rows (append to ca-3a.md table; replace the "TODO cards" row for these four)

| # | card.field | new sentence | trace |
| --- | --- | --- | --- |
| 31 | steak.instead | Loin or rib cuts, whole, with no ‘mechanically tenderized’ in the name. | card short_answer "Chuck and round are working muscles; loin and rib sit along the back and do little work."; card why "A cut pushed through needles or blades must say ‘mechanically tenderized’ in its name." |
| 32 | organ.tier_note | Organ meats keep a shorter time in the refrigerator than steaks and roasts. | card why "Variety meats keep a shorter time than steaks and roasts."; card science "Variety meats keep a shorter time than steaks and roasts, 1 to 2 days refrigerated." |
| 33 | organ.instead | A beef blend with liver and heart ground in, each with its percentage printed. | Ground beef card (ca-3a 1b) tier_note "Organ blends grind beef liver or heart into the meat; printed percentages show how much of each."; fold cart_pick "Liver and heart beef blend, shares stated" |
| 34 | organ.pick_steps 1 | Ask the counter or a farmer which organs they offer. | card buying_tips[1], verbatim |
| 35 | organ.pick_steps 2 | How it was raised: see Beef. | POINTER (D2 rule 3) |
| 36 | judging.decision | The pack with the newest ‘packaged on’ date in the case. | meat:647 MSU "Dates on meat packages" (https://www.canr.msu.edu/news/dates_on_meat_packages_sell_by_use_by_freeze_by_packaged_on_expiration_date): "Packaged on – This type of date is often used on fresh meat ... Most fresh meat can be stored at refrigerated temperatures for up to three days after packaging"; card watch_out[1] |
| 37 | judging.tier_note | Fresh tray-wrapped meat keeps up to three days refrigerated after packaging, so that date sets the clock. | card watch_out[1] "Fresh tray-wrapped meat generally holds up to three days refrigerated after packaging."; meat:647 (same quote) |
| 38 | judging.instead | A well-sealed vacuum pack, which keeps up to seven days refrigerated from purchase. | card watch_out[1] "A well-sealed vacuum pack can go up to seven."; meat:647 "Longer storage time of up to seven days from retail purchase can be used if the product is vacuum packaged with a good seal and the air is removed from the package." |
| 39 | judging.pick_steps 1 | ‘Packaged on’: the packing day, not a safety cutoff. | card watch_out[1] "A ‘packaged on’ date is not a safety cutoff." |
| — | judging.watch_out 6, 7 | (old decision; old pick_steps[1]) | card, verbatim moves |
| 40 | butcher.decision | Ask for beef soup bones, and a whole chuck ground fresh. | card buying_tips "Ask for bones and trim." and "Ask for a whole chuck ground fresh, which lets you choose the cut."; cart_pick (plan string) |
| 41 | butcher.tier_note | Soup bones come from the counter, and a whole chuck ground fresh lets the shopper choose the cut. | `pick_soup_bones` decision "Soup bones come from the meat counter; ask for marrow or knuckle bones."; card buying_tips[1] (as row 40) |
| 42 | butcher.instead | A whole chuck roast, cut, tied or boned to order at the counter. | card detail "They will grind a whole chuck fresh ... Cutting, tying, grinding and boning are usually included."; card pick_steps[2] |
| 43 | butcher.cart_pick | Beef soup bones from the butcher counter | plan string (CARD-ALIGNMENT-PLAN inventory, CA-3a) |
| 44 | butcher.pick_steps 1 | Soup bones: ask for marrow or knuckle bones. | `pick_soup_bones` decision (row 41) |

## Open notes for the planner merging this

- A. ic5b C5 and C9 run `lintCard`/`readability`/L1-L5 on these strings; I checked FALLBACK_OUTRIGHT, OBSERVABLE_IN_BOTH (`termsOf`, `quotedTerms`) and INSTEAD_ECHOES_REFUSED by reading the lint, not by running it. Scout/admin: run `counts.mjs` and `node --test server/test/acceptance/ic5b.test.js` after the build.
- B. `butcher_counter_asking.buying_tips[3]` "Ask for bones and trim. Often cheap or free." is unchanged and passes the C8 PRICE regex (field not changed), but "cheap or free" sits close to non-negotiable 8. Devon's call; not changed here.
- C. Scout before build: does any test other than ic5b :47 pin the old judging or butcher decision string (e.g. counterDecision.test.js, k-series)? `grep -rn "Color comes from oxygen and packaging\|Ask the butcher how it was raised" server/` (expect 0 test hits outside ic5b/KB/review/doLines).
- D. The organ POINTER "How it was raised: see Beef." also sits over chicken livers/hearts (aliases). Per D2 rule 3 as written; OK rough edge.
