# ca-3a Step 1c fill, part B: bison, venison_game, lamb_goat, pick_soup_bones

Written by planner@opus 2026-10-15 at `5267f05` for paste into `.pipeline/specs/ca-3a.md` Step 1c (replacing the two TODO bullets for these ids) and the claim-trace table (rows 31-42). Fields not named stay byte-identical. Curly quotes only (‘ ’ “ ”). No em-dash in any changed string. The G1 gloss string below is byte-equal to `CANONICAL_GLOSSES` G1: `“grass-fed” is the producer’s own word unless a certifier’s seal audits it`.

#### 1c-B1. `bison` (R; K15 id)

| field | old | new |
| --- | --- | --- |
| decision | Bison bought by its inspection mark, then handled like beef. | 100% grass-fed or grass-finished bison, with an inspection mark. |
| tier_note | The inspection mark and storage times are FSIS guidance for bison sold in stores. | Many bison finish on grain; “grass-fed” is the producer’s own word unless a certifier’s seal audits it. |
| instead | (absent) | Bison labeled grass-fed with no seal; it may have eaten grain for its last 90 to 120 days. |
| cart_pick | Bison with an inspection mark | 100% grass-fed or grass-finished bison |
| do-lines-review row :140 headline cell | Bison bought by its inspection mark, then handled like beef. | 100% grass-fed or grass-finished bison, with an inspection mark. (do cell unchanged) |

Lint notes:
- L4: the decision matches G1 (meat scope); tier_note carries the G1 gloss verbatim.
- L5(b): no split token in the decision, so the whole decision is the first rung; cart_pick prints the G1 term.
- L1: no 5-gram shared with the meat tip (rule "animals raised on grass and open pasture" vs nothing on the changed fields).
- L2 (4-gram, decision/tier_note): the only words shared with Beef and Lamb sit inside the G1 term or the G1 gloss (exempt). "with an inspection mark" appears on no other meat decision.

Kept byte-identical, with reasons:
- why, short_answer, detail, science, kristy_take, buying_tips (4), watch_out (1), labels_decoded (2): paid depth, already true; the grain-finish fact (detail s4) is the trace for the new tier_note and instead.
- pick_steps (2): ≤14 words each, no new number; the inspection-mark step glosses the front's second half.
- do cell "Find the triangle inspection seal or a state mark on the package.": not trivia, no fold, headline 9 + do 12 = 21 ≤ 28.
- sources, aliases, asked_as, title, category, evidence_tier, question: preserved (D1).

Word counts: decision 9; tier_note 17; instead 18; cart_pick 5.

#### 1c-B2. `venison_game` (R; K15 id)

| field | old | new |
| --- | --- | --- |
| tier_note | Refrigerated processing and fat trimming are extension steps written for deer and elk venison. | Game is often processed by small shops, so cold handling at every step decides its safety. |
| instead | (absent) | Wrapped frozen venison from the same refrigerated processor; it keeps 9 to 12 months frozen. |

Reason for the tier_note change: the old one names its source, not the why (D1 "Why this version, for this item").

Kept byte-identical, with reasons:
- decision "Venison from a fully refrigerated processor, trimmed of its fat." [10]: meets D1 (≤14, one verdict, no tip echo). No grass term: no source in either archive covers deer diets, and AGW Certified Grassfed names beef, sheep, goats and bison, not deer (CA-2:2). Its do-lines row :141 is untouched.
- cart_pick "Venison from a refrigerated processor": agrees with the unchanged front; no shared-term family.
- pick_steps (2): ≤14 words each.
- **Safety (CWD), never deleted:** detail (CWD sentences), watch_out 2 ("Skip the brain, spinal cord, eyes, spleen and lymph nodes of deer and elk."), science s2-s3, labels_decoded "CWD". All byte-identical.
- why, short_answer, kristy_take, buying_tips, watch_out 1, labels_decoded "Aging", sources, aliases, asked_as, title, category, evidence_tier, question.

Word counts: tier_note 16; instead 15.

#### 1c-B3. `lamb_goat` (R; K15 id)

| field | old | new |
| --- | --- | --- |
| decision | Read lamb and goat for how they were raised, then anything added. | 100% grass-fed or grass-finished lamb or goat. |
| tier_note | Lamb grades and the absence of goat grades are USDA facts, and the flesh checks follow from them. | Grass seals cover sheep and goats, and “grass-fed” is the producer’s own word unless a certifier’s seal audits it. |
| instead | (absent) | Graded lamb, or goat that is firm and fine-grained, when no grass seal is on the shelf. |
| cart_pick | Lamb or goat, firm with white fat | 100% grass-fed or grass-finished lamb |
| do-lines-review row :138 headline cell | Read lamb and goat for how they were raised, then anything added. | 100% grass-fed or grass-finished lamb or goat. (do cell unchanged) |

Reasons:
- The old decision was an instruction ("read ... for how they were raised"), not a best version, and restated meat tip check 1's principle. The new front is the label words.
- The old cart_pick "firm with white fat" sat beside a grass front; grass-finished fat is not promised white (the bison detail records grain finishing "because many shoppers prefer white fat"), so the flesh check stays in pick_steps 3 and buying_tips, not in the one-tap add.

Lint notes:
- L4: G1 term in the decision; tier_note carries the G1 gloss verbatim.
- L5(b): whole decision is the first rung; cart_pick prints the G1 term.
- L2: tier_note opens "Grass seals cover sheep and goats", bison opens "Many bison finish on grain", beef opens "On a beef label": no 4-gram outside the gloss is shared.
- Instead: no CO_EQUAL word.

Kept byte-identical, with reasons:
- pick_steps (3): step 1 POINTER "How it was raised: see “Grass-fed” (the label)." still points at the label card that owns the depth; step 2 POINTER (added solution, Pork) keeps "anything added" covered now that it left the front; step 3 FSIS goat flesh check. Each ≤14 words.
- do cell "Press goat for firm, fine-grained flesh and white fat.": not trivia, no fold, headline 7 + do 9 = 16 ≤ 28.
- why, short_answer, detail, science, kristy_take, buying_tips (3), watch_out (2), labels_decoded (3): paid depth, true as written.
- sources, aliases (incl. the K15 C8 pick_lamb aliases), asked_as (K15 C10 "how do i judge goat meat quality"), title, category, evidence_tier, question.

Word counts: decision 7; tier_note 19; instead 17; cart_pick 5.

#### 1c-B4. `pick_soup_bones` (R; K15 pick)

| field | old | new |
| --- | --- | --- |
| decision | Ask the meat counter which soup bones it carries and how the animal was raised. | Soup bones come from the meat counter; ask for marrow or knuckle bones. |

Reasons:
- The raising half ("how the animal was raised") is the meat tip's principle (tip check 1, D2 rule 1); the pick keeps only the item: where it is sold and which bones to name.
- No cart_pick (a pick forbids one, `PICK_FORBIDDEN_FIELDS`), so the inventory's "cart_pick drops any raising term" holds by absence.
- lintPick: one sentence ending in a period, 13 words ≤ 16, no digit, no first person, no em-dash, no question mark.
- Family criterion: no `grass-(fed|finished)` in decision.

Kept byte-identical: kind, title, category, aliases (5; "marrow bones" and "knuckle bones" are the trace for the new line), sources (1).

Word count: decision 13.

## Claim-trace rows (append to the ca-3a table, replacing the "TODO cards" row for these ids)

| # | card.field | new sentence | trace |
| --- | --- | --- | --- |
| 31 | bison.decision | 100% grass-fed or grass-finished bison, with an inspection mark. | G1 term (beef owner front); CA-2:2 AGW "Certified Grassfed by A Greener World standards for beef, sheep, dairy sheep, goats, dairy goats and bison."; card decision + pick_steps 1 (inspection mark) |
| 32 | bison.tier_note s1 clause 1 | Many bison finish on grain | card detail "Bison raised on grass get grain for the last 90 to 120 days, because many shoppers prefer white fat." (narrowed to "many") |
| 33 | bison.tier_note clause 2 | “grass-fed” is the producer’s own word unless a certifier’s seal audits it. | G1 gloss; meat:237 FR 2016-00440 "AMS is withdrawing: (1) The Grass (Forage) Fed Claim for Ruminant Livestock" (bison is a ruminant; card science "a bovine") |
| 34 | bison.instead | Bison labeled grass-fed with no seal; it may have eaten grain for its last 90 to 120 days. | card detail (same sentence as row 32, numbers verbatim); G1 |
| 35 | bison.cart_pick | 100% grass-fed or grass-finished bison | card decision (row 31); beef cart_pick form |
| 36 | venison.tier_note | Game is often processed by small shops, so cold handling at every step decides its safety. | card science s1 "Game is often processed by small shops, so cold handling decides its safety."; card short_answer "fully refrigerated facilities, with each animal handled on its own" ("at every step") |
| 37 | venison.instead s1 | Wrapped frozen venison from the same refrigerated processor | card decision (refrigerated processor); card detail "Wrapped game keeps 9 to 12 months frozen." |
| 38 | venison.instead s1 clause 2 | it keeps 9 to 12 months frozen. | card detail, verbatim numbers |
| 39 | lamb.decision | 100% grass-fed or grass-finished lamb or goat. | G1 term; CA-2:2 AGW (sheep, goats); CA-2:2b AGA "Animals are fed only grass and forage from weaning until harvest." (ruminant standard); KS for the rank |
| 40 | lamb.tier_note | Grass seals cover sheep and goats, and “grass-fed” is the producer’s own word unless a certifier’s seal audits it. | CA-2:2 AGW "standards for beef, sheep, dairy sheep, goats, dairy goats and bison"; CA-2:2b AGA "ruminant"; G1 gloss; meat:237 FR 2016-00440 (ruminant livestock) |
| 41 | lamb.instead | Graded lamb, or goat that is firm and fine-grained, when no grass seal is on the shelf. | card short_answer "Graded lamb at retail is Prime, Choice, or Good."; card watch_out 1 (ungraded quality "may be higher or lower"); card buying_tips 1 "firm, fine-grained flesh" |
| 41b | lamb.cart_pick | 100% grass-fed or grass-finished lamb | card decision (row 39) |
| 42 | pick_soup_bones.decision | Soup bones come from the meat counter; ask for marrow or knuckle bones. | card old decision "Ask the meat counter which soup bones it carries"; card aliases "marrow bones", "knuckle bones" |

## Open for the admin before dv check

1. **Matcher risk on two cart_picks.** Beef carries the aliases "grass-fed", "grass-finished", "100% grass fed" and "grass fed grass finished" (KB :143-150), and `INERT_MODIFIERS` (listMatch.js:330) does not drop "grass". So `matchItemToCard("100% grass-fed or grass-finished bison")` and `"... lamb"` may land on `beef_grassfed_vs_grainfed`, not their own slug. The independent check (each changed cart_pick through the matcher) decides. If it reports beef: either the one-tap add carries `perimeterId` (then retrieval never runs for it; confirm by scout), or the admin returns this to the planner. Not settled here; no fallback string is offered, because any cart_pick without the G1 term fails L5(b) against these fronts.
2. **K15 C2/C6 run on these ids.** `lintCard(projectEntry(...))` and `readability` must stay []; not run here (planner does not run code).
