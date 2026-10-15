# ca-4b cards, part G: cottage_cheese, cheese_real_vs_processed, raw_aged_cheese, goat_sheep_dairy

Status: DRAFT COMPLETE (planner@opus, 2026-10-15). Drop-in text for `.pipeline/specs/ca-4b.md` Step 1 rows `:78-81`, its SPEC object and its Claim trace. Not built. Not migrated. No lint or test was run on this text; every check below is a hand count against the rules as read in `server/lib/counterCardLint.js`.

KB locations (working tree at e6760e1; the commits after 8b49633 are spec-only by their messages, not diffed): cheese_real_vs_processed :1340, raw_aged_cheese :4761, cottage_cheese :8911, goat_sheep_dairy :9076. All category "dairy", section eggs_dairy.

## Findings that bear on ca-4b.md

- L1 (SECTION_TIP_REPEATS_CARD) runs at `SECTION_TIP_N = 5` (`counterCardLint.js:1672`) over the decision plus every REPEATED_CLAIM_FIELDS string. HEAD cheese_real_vs_processed does NOT fire it at 5: the card says "milk cultures salt and enzymes", the tip says "cream cultures salt and enzymes for", and they share the 4-gram "cultures salt and enzymes" only. The rewrite below still takes the run out of decision, short_answer and science, so the card stops restating the tip and holds if N ever drops to 4 or 3.
- L2 front form is a 4-gram over decision + tier_note on ≥3 eggs_dairy cards (`:1674-1675`). Fragment I's almond_milk decision uses "with a short ingredient list", so this fragment avoids that phrase.
- `instead` is not in REPEATED_CLAIM_FIELDS, so it is outside L1/L2 and outside lintRepeatedClaim.
- EXCLUSIVITY (`:298`) is report-only and scoped to the verdict; HEAD cheese decision "and nothing else" leaves with the rewrite anyway.

## cottage_cheese (category dairy, evidence established)

| field | old | new |
| --- | --- | --- |
| instead | (absent) | Cottage cheese marked “directly set”, where a food-grade acid sets the curd instead of a culture. |

Kept byte-identical, with reasons:
- decision :8921 "Cottage cheese with its curd set by a culture." Already names the first rung (culture-set curd), 9 words, no hedge. It shares no ≥6-letter term with the do line ("beside", "directly", "wording"), so OBSERVABLE_IN_BOTH stays clean, and keeping it leaves review row :160 alone.
- tier_note :8960 "Culture-set curd is the craft standard; a directly set tub still meets the federal one." 15 words, one sentence, not a tier name; shares "curd" with the decision (TIER_NOTE_ORPHANED clean).
- cart_pick :8931 "Cottage cheese with no “directly set”". The first rung does not change.
- pick_steps :8941-8943, why, detail (the 21 CFR 133.129 sentences), watch_out :8938, labels_decoded, aliases, asked_as, sources.

Checks by hand:
- instead is 16 words (≤24). Its first segment before the comma, "Cottage cheese marked “directly set”", has no conditional ("where" sits after the comma), so INSTEAD_HEDGED is clean. The decision has no "." or ";" mid-sentence, so there are no refused terms. No co-equal phrase. Differs from cart_pick.
- C4 change: instead is the only change, which is enough for `notDeepEqual(now, was)`.

## cheese_real_vs_processed (category dairy, evidence kristys_standard)

| field | old | new |
| --- | --- | --- |
| decision | Block cheese is milk, cultures, salt and enzymes, and nothing else. | Block cheese with a short list, real cheese by its front name. |
| tier_note | The starch, cellulose and natamycin on the bag are printed facts; buying the block instead is the whole-food standard. | The starch and cellulose on shreds are printed facts; the uncoated block is the standard. |
| instead | (absent) | Bagged shreds named cheese: real cheese, coated so the strands stay apart. |
| short_answer | Real cheese is basically milk, cultures, salt and enzymes. ‘Pasteurized process cheese’, ‘cheese product’ or ‘cheese food’ means emulsifiers and added ingredients blended in. Bagged shreds are real cheese with an anti-caking coating. Buy the block. | Real cheese is basically milk, salt, cultures and enzymes. ‘Pasteurized process cheese’, ‘cheese product’ or ‘cheese food’ means emulsifiers and added ingredients blended in. Bagged shreds are real cheese with an anti-caking coating. Buy the block. |
| science | Real cheese is milk, cultures, salt and enzymes. ‘Pasteurized process cheese product’ needs only 51% cheese, and the name on the front is the only warning. Shreds carry a coating so the strands do not knit back together, which is why they resist melting. ‘Parmesan’ is a generic word in the US; ‘Parmigiano-Reggiano’ is protected, with a stamped rind. | Real cheese is milk, salt, cultures and enzymes. ‘Pasteurized process cheese product’ needs only 51% cheese, and the name on the front is the only warning. Shreds carry a coating so the strands do not knit back together, which is why they resist melting. ‘Parmesan’ is a generic word in the US; ‘Parmigiano-Reggiano’ is protected, with a stamped rind. |

short_answer and science change only their first sentence: "cultures, salt and" becomes "salt, cultures and", the order the card's own pick_steps[1] already uses ("milk, salt, cultures, enzymes or rennet"). Every other sentence is byte-identical; "51%" stays for the pass rule.

Kept byte-identical, with reasons:
- cart_pick :1374 "Block cheese". The first rung is still the block.
- why :1364 "Real cheese is milk, cultures, salt, enzymes. Shreds add a coating to keep them apart." No 4-gram with the tip ("milk cultures salt enzymes" vs "cream cultures salt and").
- pick_steps :1398-1400 (front-name step, short-list step, block step), detail, kristy_take, buying_tips, labels_decoded, watch_out (51%/49%), aliases, asked_as, sources.

Checks by hand:
- decision is 11 words, one sentence, no hedge, no culinary word. With the do line (12) the total is 23 (≤28). It shares no term with the do line (read, bag, potato, starch, cellulose, natamycin, before, buying, shreds), so OBSERVABLE_IN_BOTH is clean. No EXCLUSIVITY phrase. No tip 4-gram and no "few ingredients".
- tier_note is 15 words with one semicolon. It shares starch/cellulose/shreds with the do line and "block" with the decision. It leaves the "whole-food standard" group (20 tier_notes corpus-wide). Not a tier name; no D4 word.
- instead is 12 words. First segment "Bagged shreds named cheese: real cheese" has no conditional. No refused terms (decision has no ./;). Differs from cart_pick.
- short_answer stays 37 words (≤40).

## raw_aged_cheese (category dairy, evidence time_tested)

| field | old | new |
| --- | --- | --- |
| decision | Raw-milk cheese aged past sixty days is legal and already stocked. | Raw-milk cheese aged past sixty days, its maker and herd named. |
| tier_note | Aging raw milk into cheese predates refrigeration and the sixty-day rule; the months on the rind are history as the evidence, not a health claim. | Aging raw milk into cheese predates refrigeration; the months on the rind are history, not health evidence. |
| instead | (absent) | Thermized cheese, heated below pasteurization: not raw, and not fully pasteurized either. |

Kept byte-identical, with reasons:
- watch_out :4786-4789. Raw-dairy risk lines; the ship bar forbids any change.
- cart_pick :4812 "Aged raw-milk cheddar". The first rung (raw-milk cheese past sixty days) is unchanged; the decision only adds who made it.
- pick_steps :4792-4794, buying_tips :4779-4783, labels_decoded :4799-4804, why, short_answer, detail, science, aliases, asked_as, sources.

Checks by hand:
- decision is 11 words; with the do line (9) the total is 20. It shares no term with the do line (read, rind, label, age, months; "aged" and "age" are different tokens). It avoids the pick_steps[1] 5-gram "a named maker and herd".
- tier_note goes from 25 words to 17 (≤20). It shares rind/months with the do line and cheese/raw with the decision. It drops the 4-gram "not a health claim", which CA-4a's raw_milk tier_note now carries. "health" alone is not in the C5 CLAIM_LOCK regex.
- instead is 12 words. First segment "Thermized cheese" has no conditional; no refused terms; differs from cart_pick. "pasteurized" is safe: raw_aged_cheese is in no OWNED_FACTS family (only the comment at `:1111` names it), and the milk_processing pattern matches only ultra-pasteurized/homogenized anyway. It mirrors CA-4a raw_milk's ladder (raw first, then gentle heat).

## goat_sheep_dairy (category dairy, evidence kristys_standard)

| field | old | new |
| --- | --- | --- |
| why | Goat milk has less lactose than cow’s milk and different forms of proteins. | Goat milk has less lactose than cow’s milk. |
| short_answer | Goat milk averages about 3.5 percent butterfat. It contains lactose, less than cow’s milk, with different forms of proteins. Goat butter is white. Popular sheep cheeses include feta, pecorino romano, Roquefort and Manchego. | Goat milk averages about 3.5 percent butterfat. It contains lactose, less than cow’s milk. Goat butter is white. Popular sheep cheeses include feta, pecorino romano, Roquefort and Manchego. |
| instead | (absent) | Goat yogurt or goat butter, with goat milk named in the ingredients. |

Kept byte-identical, with reasons:
- decision :9092 "Goat or sheep dairy with the animal’s milk named on the list." Names the first rung, 12 words. With the do line it shares one distinctive term ("animals" after quote stripping; "milk" is under the length bar), so OBSERVABLE_IN_BOTH stays clean and review row :163 stays.
- tier_note :9127 "The animal’s milk named in the ingredients is the whole standard here." 12 words, shares terms with both lines.
- cart_pick :9102, pick_steps :9112-9114 (the third is the POINTER "Homogenized or ultra-pasteurized: see Milk.", the only legal home for those words here), buying_tips, watch_out :9109 (medical → doctor), labels_decoded, aliases, asked_as, sources.
- detail :9095 and science :9116 keep "different forms of proteins" as depth. The direction removes protein wording from the front only (why, short_answer). Flagged for the critic below.

Checks by hand:
- No new string contains "grass-fed"/"grass-finished" (ruminant_grass_term family), "ultra-pasteurized" or "homogenized" (milk_processing family), or "protein" (C5 CLAIM_LOCK).
- "3.5" stays in short_answer (rewritable text), and in detail and science.
- short_answer is 28 words. why is one 8-word sentence.
- instead is 12 words, first segment "Goat yogurt or goat butter" has no conditional, no refused terms, differs from cart_pick "Goat cheese or a sheep milk cheese".

## Acceptance SPEC entries (paste into `server/test/acceptance/ca-4b.test.js` SPEC)

```js
  cottage_cheese: {
    instead: 'Cottage cheese marked “directly set”, where a food-grade acid sets the curd instead of a culture.',
  },
  cheese_real_vs_processed: {
    decision: 'Block cheese with a short list, real cheese by its front name.',
    tier_note: 'The starch and cellulose on shreds are printed facts; the uncoated block is the standard.',
    instead: 'Bagged shreds named cheese: real cheese, coated so the strands stay apart.',
    short_answer: 'Real cheese is basically milk, salt, cultures and enzymes. ‘Pasteurized process cheese’, ‘cheese product’ or ‘cheese food’ means emulsifiers and added ingredients blended in. Bagged shreds are real cheese with an anti-caking coating. Buy the block.',
    science: 'Real cheese is milk, salt, cultures and enzymes. ‘Pasteurized process cheese product’ needs only 51% cheese, and the name on the front is the only warning. Shreds carry a coating so the strands do not knit back together, which is why they resist melting. ‘Parmesan’ is a generic word in the US; ‘Parmigiano-Reggiano’ is protected, with a stamped rind.',
  },
  raw_aged_cheese: {
    decision: 'Raw-milk cheese aged past sixty days, its maker and herd named.',
    tier_note: 'Aging raw milk into cheese predates refrigeration; the months on the rind are history, not health evidence.',
    instead: 'Thermized cheese, heated below pasteurization: not raw, and not fully pasteurized either.',
  },
  goat_sheep_dairy: {
    why: 'Goat milk has less lactose than cow’s milk.',
    short_answer: 'Goat milk averages about 3.5 percent butterfat. It contains lactose, less than cow’s milk. Goat butter is white. Popular sheep cheeses include feta, pecorino romano, Roquefort and Manchego.',
    instead: 'Goat yogurt or goat butter, with goat milk named in the ingredients.',
  },
```

Every quote in these strings is curly (‘ ’ “ ”); no straight ' or " inside a string, no em-dash, no brand from the BRAND regex, no price word. Fresh strings this part adds to C5's count: 12 (cottage 1, cheese 5, raw_aged 3, goat 3).

## Do-lines rows (`docs/do-lines-review.md`)

Only the headline column changes; no do line changes, so `server/lib/doLines.json` is unaffected beyond the rebuild.

- :56 old `| \`cheese_real_vs_processed\` | eggs_dairy | Block cheese is milk, cultures, salt and enzymes, and nothing else. | Read the bag for potato starch, cellulose and natamycin before buying shreds. | — |`
  new `| \`cheese_real_vs_processed\` | eggs_dairy | Block cheese with a short list, real cheese by its front name. | Read the bag for potato starch, cellulose and natamycin before buying shreds. | — |`
- :106 old `| \`raw_aged_cheese\` | eggs_dairy | Raw-milk cheese aged past sixty days is legal and already stocked. | Read the rind label for an age in months. | — |`
  new `| \`raw_aged_cheese\` | eggs_dairy | Raw-milk cheese aged past sixty days, its maker and herd named. | Read the rind label for an age in months. | — |`
- :160 cottage_cheese and :163 goat_sheep_dairy: unchanged (decisions unchanged).

## Claim trace

| # | card.field | new sentence | trace |
| --- | --- | --- | --- |
| 1 | cottage_cheese.instead | Cottage cheese marked “directly set”, where a food-grade acid sets the curd instead of a culture. | card.watch_out :8938 "“Directly set” means food-grade acid formed the curd, not a culture."; card.detail :8924 "Direct acidification means an acid, not bacteria, sets the curd."; card.tier_note :8960 "a directly set tub still meets the federal one" |
| 2 | cheese_real_vs_processed.decision | Block cheese with a short list, real cheese by its front name. | card.kristy_take :1373 "Buy the block."; card.pick_steps :1399 "Look for a short list: milk, salt, cultures, enzymes or rennet."; card.pick_steps :1398 "Read the front name: ‘cheese product’"; card.labels_decoded :1384 "Not cheese by the standard of identity" |
| 3 | cheese_real_vs_processed.tier_note | The starch and cellulose on shreds are printed facts; the uncoated block is the standard. | card.tier_note :1391 "The starch, cellulose and natamycin on the bag are printed facts"; card.detail :1366 "The shred coating is usually potato starch or powdered cellulose"; KS (the block as the standard, evidence kristys_standard) |
| 4 | cheese_real_vs_processed.instead | Bagged shreds named cheese: real cheese, coated so the strands stay apart. | card.short_answer :1365 "Bagged shreds are real cheese with an anti-caking coating."; card.detail :1366 "so the strands do not knit back together" |
| 5 | cheese_real_vs_processed.short_answer, sentence 1 | Real cheese is basically milk, salt, cultures and enzymes. | card.short_answer :1365 "Real cheese is basically milk" (same four ingredients, reordered); card.pick_steps :1399 "Look for a short list: milk, salt, cultures, enzymes or rennet." |
| 6 | cheese_real_vs_processed.science, sentence 1 | Real cheese is milk, salt, cultures and enzymes. | card.science :1402 "Real cheese is milk" (same four ingredients, reordered); card.pick_steps :1399 as row 5 |
| 7 | raw_aged_cheese.decision | Raw-milk cheese aged past sixty days, its maker and herd named. | card.decision :4772 "Raw-milk cheese aged past sixty days"; card.buying_tips :4780 "A named maker and a named herd, not just a country of origin."; `docs/research/dairy-eggs-sources.md:125-126` "all raw cheese must be aged at least" / "60 days." (quote wraps across the two lines) |
| 8 | raw_aged_cheese.tier_note | Aging raw milk into cheese predates refrigeration; the months on the rind are history, not health evidence. | card.tier_note :4813 "Aging raw milk into cheese predates refrigeration" and "the months on the rind are history as the evidence" (trimmed; the HEAD sentence's "not a health claim" restated as "not health evidence") |
| 9 | raw_aged_cheese.instead | Thermized cheese, heated below pasteurization: not raw, and not fully pasteurized either. | card.labels_decoded :4804 (Thermized) "Heated below pasteurization. Not raw, and not fully pasteurized either."; KS (thermized as the next rung after raw, the same ladder CA-4a gives raw_milk) |
| 10 | goat_sheep_dairy.why | Goat milk has less lactose than cow’s milk. | card.why :9093 "Goat milk has less lactose than cow’s milk" (the protein clause removed) |
| 11 | goat_sheep_dairy.short_answer, sentence 2 | It contains lactose, less than cow’s milk. | card.short_answer :9094 "It contains lactose, less than cow’s milk, with different forms of proteins." (the protein clause removed). The other three sentences are byte-identical. |
| 12 | goat_sheep_dairy.instead | Goat yogurt or goat butter, with goat milk named in the ingredients. | card.detail :9095 "Goat milk is made into cheese, butter, ice cream and yogurt."; card.pick_steps :9112 "Read the ingredients for goat milk or sheep milk."; card.tier_note :9127 "The animal’s milk named in the ingredients" |

Every quoted card substring above was grepped verbatim against `server/kristy_perimeter_kb.json` in this session, except row 11's, which was read directly at :9094. Row 7's source quote was read at `dairy-eggs-sources.md:124-126`. No URL is cited.

## For the builder and merger

- `docs/do-lines-review.md` headline column must equal the new decision for cheese_real_vs_processed (:56) and raw_aged_cheese (:106) (C6). Do lines do not change; run `node scripts/buildDoLines.js` from `server/` once after all ca-4b parts merge.
- L2 front 4-gram merge check after fragments F, H and I are spliced: "with a short list" (cheese decision) and "is the craft standard" (cottage tier_note, already on sour_cream :8851) are each on fewer than three eggs_dairy cards here; a third card from another fragment adopting either trips SECTION_PHRASE_REPEATED.
- The do-lines-review notes at :243 and :301 discuss the old cheese decision ("nothing else belongs"); they are history, not table rows, and need no edit for C6.
- `server/test/acceptance/fixtures/kb-pre-readability.json` contains the old cheese/goat strings; it is a frozen fixture, not a pin, and must not be edited.

## Open questions

1. goat_sheep_dairy detail and science keep "different forms of proteins". The ca-4b direction scopes the removal to the front (why, short_answer); a critic reading "protein wording leaves the card" more broadly would need two more science/detail edits (one clause each).
2. raw_aged_cheese instead names thermized cheese as the next rung. That ladder is Kristy's judgment (KS), consistent with CA-4a raw_milk; if Devon prefers aged pasteurized cheese from a named maker as the second rung, the alternative is "Aged cheese from pasteurized milk, its maker named on the label." [PLACEHOLDER] (11 words).
3. The cheese short_answer/science reorder is defensive (L1 does not fire on HEAD at N=5). Dropping it narrows the diff to three fields but leaves the tip's 4-gram "cultures salt and enzymes" on the card.
