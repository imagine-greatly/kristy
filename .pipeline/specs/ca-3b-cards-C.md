# ca-3b cards, part C: pork_cuts_and_enhanced, pick_sausage, pick_jerky, bacon, cured_pork

Status: DRAFT COMPLETE (planner@opus, 2026-10-15). Drop-in text for `.pipeline/specs/ca-3b.md` Step 1 rows. Not built. Not migrated. No lint or test was run on this text; every check below is a hand count against the rules as read.

KB locations at 5267f05: pork_cuts_and_enhanced :2767, pick_sausage :6030, bacon :6637, cured_pork :7289, pick_jerky :7599 (kind "pick", category "pork").

Cure-set export (verified): `export const PRESERVATION_CURE_SENTENCES` at `server/lib/counterCardLint.js:1485` (Object.freeze(new Set), 19 exact strings). "Set #n" below = nth member in file order.

## Finding that changes ca-3b.md

Picks cannot carry `pick_steps`, `tier_note`, `instead` or `cart_pick`: `PICK_FORBIDDEN_FIELDS` (`server/lib/counterCardLint.js:827-832`). The ca-3b.md row "pick: decision + pick_steps only" must read "pick: decision only". lintPick decision bar: one sentence ending ".", ≤16 words (MAX_PICK_WORDS; C1 tightens to ≤14), no digits, no "?", mechanicalVeto (treat/cure/prevent/heal/lower/boost/cause/fight/protect/support and their -s/-es/-ing forms; "cured" and "curing" pass). So neither pick below gets pick_steps.

## pork_cuts_and_enhanced (category pork, evidence established)

| field | old | new |
| --- | --- | --- |
| instead | (absent) | Pork with the lowest stated solution percentage on the shelf. |

Kept byte-identical, with reasons:
- decision "Pork whose label carries no added-solution percentage, only pork." Already names the closest-to-nature buy (pork with nothing added), 10 words, no hedge. It shares no quoted or ≥6-letter term with the do line ("contains", "weight"), and it is the review headline in `docs/do-lines-review.md`, so keeping it leaves that table alone.
- tier_note "Added solution must be disclosed by weight, which is what makes the fine print worth finding." 16 words, one sentence, not a tier name. It shares "print"/"weight" with the do line (TIER_NOTE_ORPHANED clean), and it is not in an L2 group as far as the pack shows.
- cart_pick "Pork shoulder". A cut name with no shared label term, so it is L5-safe.
- pick_steps both: "Find the ‘% added solution’ figure and the solution’s listed ingredients." (11 words) and the POINTER "How it was raised: see What “pasture-raised” does and does not tell you." The pointer is the only legal home for "pasture-raised" on this card (bird_pig_raising owned fact). Neither step echoes a meat tip check (L1).
- why, short_answer, detail, kristy_take ("up to 12% solution"), buying_tips (hormone freebie line), watch_out ×2, science, labels_decoded, aliases, asked_as, sources. They hold the numbers 15%, 15, 100 and 12%, which passRule requires to survive.

Word counts: instead 10 (≤24). The decision has no "." "/" or ";" mid-sentence, so instead has no refused terms. It does not open on a conditional and has no co-equal phrase.

## pick_sausage (kind pick, category pork)

| field | old | new |
| --- | --- | --- |
| decision | Sausage is a seasoned grind; the ingredient list must name any curing agents beyond the meat. | Sausage is seasoned ground meat; its ingredient list names every curing agent used. |

Kept: sources (319.140, 319.141, 317.17; picks must keep sources), aliases, asked_as. Reason for the change: the old decision is 16 words, over C1's 14.

Word count: 13. No digits, no veto word, one sentence.

## pick_jerky (kind pick, category pork)

No field changes.

Kept byte-identical, with reasons:
- decision "Jerky is dried meat; the ingredients name the meat and any curing agent." 13 words (≤14). It traces to the NDSU archive (`docs/sources/k15/jerky-ndsu.md:89` "A cure is a specific food-safe chemical (often sodium nitrite) that can be added to your seasoning or marinade") and 317.17. It carries no protein figure, and k15 C7 pins it lint-clean. Rewording risks that pin for no gain.
- sources (NDSU URL, 317.17), aliases ("meat sticks" k16 pin), asked_as.

## bacon (category deli, evidence kristys_standard)

| field | old | new |
| --- | --- | --- |
| decision | Bacon chosen by its curing ingredients, with the qualifier read. | Bacon with the shortest label list: pork, salt and its named curing agents. |
| tier_note | The asterisk and curing ingredients are documented label facts; choosing by them is the whole-food standard. | Each curing agent on bacon has to be listed, so the shortest list is easy to find. |
| instead | (absent) | Bacon that adds sugar and wood smoke to the pork and salt. |
| cart_pick | Bacon with disclosed curing ingredients | Bacon with the shortest label list |

Kept byte-identical, with reasons:
- why = kristy_take "The curing ingredients describe the process. An uncured claim alone does not establish nitrate-free bacon." Set #8 plus the uncured caveat. These fields are unchanged, so C7 does not re-judge them.
- short_answer, detail, buying_tips ×3, labels_decoded (Uncured, "No nitrates added*"), science. Each holds set sentences or the NMPAN qualifier wording.
- watch_out ×2, including set #9 "The source set does not establish a health advantage from choosing celery-based curing." It is a safety and limit line and is never deleted.
- pick_steps ×3: "Read any exception naming nitrates naturally occurring in celery powder." has no `\bcur(e|ed|es|ing)\b` token, because "occurring" is not a word match. The other two steps are set #4 and set #5, both exact members. None echoes a meat tip check.
- aliases (bacon, sliced bacon; listMatch.test and counterProbe48 pins) and asked_as.

Checks by hand:
- Decision is 13 words. With the do line (12) the total is 25 (≤28).
- OBSERVABLE_IN_BOTH: the decision's ≥6-letter terms are shortest, curing and agents. The do line's are asterisk, beside, nitrates, curing and ingredients. They share one term ("curing"), no quoted term, and no "ingredients" (avoided on purpose).
- tier_note is 17 words. It shares "curing" with the do line and "bacon"/"shortest"/"list" with the decision. It leaves the "whole-food standard" L2 group and contains no cured/uncured/nitrite/nitrate/celery token, so it is C7 clean.
- The decision is also C7 clean: no regex token.
- instead is 12 words, not conditional. There are no refused terms, because the decision's ":" is not a ./; split.

## cured_pork (category deli, evidence kristys_standard)

| field | old | new |
| --- | --- | --- |
| decision | Cured pork, guanciale included, judged by its cut and curing ingredients. | Cured pork, guanciale included, with its cut named and a short curing list. |
| tier_note | The asterisk and curing ingredients are USDA labeling rules for “uncured” claims. | The cut name and each curing ingredient are label requirements; favoring a short list is judgment. |
| instead | (absent) | Cured pork with spices and sugar beyond salt, every curing ingredient still listed. |
| cart_pick | Cured pork with listed curing ingredients | Cured pork with a short curing list |

Kept byte-identical, with reasons:
- watch_out "An “Uncured” product that is not dried or heavily salted must say “Not Preserved, Keep Refrigerated”." This is a SAFETY line and stays verbatim.
- why = kristy_take: set #16 + "The label names the cut and lists every curing ingredient."
- short_answer, which carries the guanciale "worth buying" answer behind the k15:128 ask pin. Also detail, buying_tips ×3, science, and labels_decoded (Prosciutto, Pancetta, Uncured).
- pick_steps ×3: the cut-name step, set #12, and the ready-to-eat-or-cook safety step. None echoes a meat tip check.
- aliases (prosciutto, salami, pancetta, guanciale; k15 pins) and asked_as.
- "guanciale included" stays in the decision so the k15 ask surface does not move.

Checks by hand:
- Decision is 13 words and opens "Cured", so C7 exempts it. With the do line (11) the total is 24. It shares no term with the do line (asterisk, beside, “uncured”, points).
- tier_note is 16 words and has one semicolon. It contains no regex token, because "curing" does not match. It shares "curing"/"short"/"list" with the decision.
- instead is 13 words, not conditional, with no refused terms.
- Old tier_note shared the 4-gram "the asterisk and curing ingredients" with the old bacon tier_note. Both are reworded, so that pair is gone.

## Claim trace

| # | card.field | new sentence | trace |
| --- | --- | --- | --- |
| 1 | pork_cuts_and_enhanced.instead | Pork with the lowest stated solution percentage on the shelf. | meat:338-362 (9 CFR 317.2) "The percentage of added solution must appear as a number (such as, 15, 20, 30) and the percent symbol (%)"; card.why "Raw meat with added solution must name it, give the percentage and list what is in it."; KS (less added solution = closer to plain pork) |
| 2 | pick_sausage.decision | Sausage is seasoned ground meat; its ingredient list names every curing agent used. | meat:70-133 (319.140) "the coarse or finely comminuted meat food product … usually seasoned with condimented proportions of condimental substances, and frequently cured."; meat:70-133 (317.17) "any substance mixed with another substance to cure a product must be identified in the ingredients statement on the label of such product." |
| 3 | bacon.decision | Bacon with the shortest label list: pork, salt and its named curing agents. | `docs/sources/k15/cured-pork-fsis-bacon.md:764` "Yes, bacon is made with salt as a curing agent."; set #15 "Each substance in a curing mixture, such as salt, sugar, or sodium nitrite, must be listed."; KS (shortest list) |
| 4 | bacon.tier_note | Each curing agent on bacon has to be listed, so the shortest list is easy to find. | set #15; set #7 "US curing-label policy requires curing-mixture ingredients to be listed individually."; KS |
| 5 | bacon.instead | Bacon that adds sugar and wood smoke to the pork and salt. | `docs/sources/k15/cured-pork-fsis-bacon.md:764` "Bacon may also contain other additives such as sugars, maple sugar, wood smoke, flavorings and spices." |
| 6 | bacon.cart_pick | Bacon with the shortest label list | card (row 3, the decision) |
| 7 | cured_pork.decision | Cured pork, guanciale included, with its cut named and a short curing list. | card.short_answer "Guanciale is worth buying on the same terms: the cut named and the curing ingredients listed."; KS (short list) |
| 8 | cured_pork.tier_note | The cut name and each curing ingredient are label requirements; favoring a short list is judgment. | set #19 "Pancetta is cured belly, and cheek meat must carry its true name, such as pork jowl."; set #15; `docs/sources/k15/cured-pork-fsis-bacon.md:953` "The true product name, e.g., "Pork Jowl Dixie Bacon, Cured and Smoked" shall appear on the label."; KS (the second clause states that it is a judgment) |
| 9 | cured_pork.instead | Cured pork with spices and sugar beyond salt, every curing ingredient still listed. | `docs/sources/k15/cured-pork-fsis-bacon.md:961` "It is usually cured in salt and spices and then air-dried."; :764 "such as sugars"; set #15 |
| 10 | cured_pork.cart_pick | Cured pork with a short curing list | card (row 7, the decision) |

Tag note: the `k15-src` rows cite the archived FSIS bacon page (`docs/sources/k15/cured-pork-fsis-bacon.md`) by line. It is a verbatim archive, not memory. Whether that URL sits in the bacon or cured_pork `sources` array was not checked. If ca-3b requires a trace into the card's own sources, add the URL to `sources` (an additive change, which passRule allows).

## For the builder and merger

- `docs/do-lines-review.md` headline column must equal the new decision for bacon and cured_pork (ic5b C5). The do lines themselves do not change.
- L2 4-gram merge check: the sibling cured cards (ham, hot_dogs, turkey_bacon, deli_meat_uncured, written by another planner) may reuse "the shortest label list", "each curing ingredient", "every curing ingredient" or "curing agent" in a decision or tier_note. Run the L2 group count after merging all ca-3b parts.
- Picks: no pick_steps (see the finding above).

## Open questions

1. ca-3b C1 says decision ≤14 words for picks, while lint allows 16. Is C1 meant to bind picks? This draft meets 14 either way.
2. If the ca-3b acceptance test requires `instead` on every CA card, it must skip kind "pick" ids (pick_sausage, pick_jerky). PICK_FORBIDDEN_FIELDS bans it on picks.
