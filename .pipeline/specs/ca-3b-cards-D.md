# ca-3b card texts, group D: poultry (planner@opus, 2026-10-15)

Fills the ca-3b Step 1 TODO rows for `chicken_cuts_basics`, `chicken_breast`, `rotisserie_chicken`, `turkey_whole`, `ground_turkey`. Paste each block into `.pipeline/specs/ca-3b.md` Step 1 and the claim-trace rows into its claim-trace table.

Fields not named stay byte-identical. Curly quotes only (‘ ’ “ ”). No em-dash in any changed string. [n] = whitespace word count (builder re-counts with the lint's counter). Old text read from `server/kristy_perimeter_kb.json` at `5267f05` (chicken_cuts_basics 2655-2765, turkey_whole 6332-6384, ground_turkey 6386-6430, chicken_breast 6800-6852, rotisserie_chicken detail line 291).

Poultry raising POINTER: none added. No front or cart_pick in this group prints a raising term (`pasture-raised`, `organic`, `grass-`), and the `bird_pig_raising` owner is `label_pasture_raised_feed` (title “What “pasture-raised” does and does not tell you”), for which no pointer string has been decided. See Open questions.

---

#### chicken_cuts_basics (R; owner of `chill_water`)

Front: the cart_pick is pinned (`assert.equal`, ic4achicken.test.js:101), so the front is brought to it: the whole bird joins the first rung and breast leaves the front (D2: breast is `chicken_breast`'s front).

| field | old | new |
| --- | --- | --- |
| decision | Air-chilled first, then bone-in, skin-on thighs over breast. | Air-chilled whole chicken first, then bone-in, skin-on thighs. [8] |
| tier_note | Water-chilled packages can hold retained water, and thighs carry more fat than breast. | A whole bird yields both meats and a stock frame; water-chilled packs can hold retained water. [16] |
| instead | (absent) | Where air-chilled is not stocked, a regular whole bird or bone-in thighs, patted dry before the pan. [17] |
| why | Dark meat is forgiving and hard to overcook. Boneless skinless is the priciest form of it. | Dark meat is forgiving and hard to overcook. Boneless skinless costs the most for the same bird. [8/9] |
| short_answer s1 | Whole bird: cheapest per pound, and the carcass makes stock. | Whole bird: lowest cost per pound, and the carcass makes stock. (s2–s4 byte-identical; 39 words total, old 38) |
| kristy_take | Bone-in thighs are the most forgiving protein in the store. A whole bird is the cheapest, and the frame makes stock. | Bone-in thighs are the most forgiving cut in the case. A whole bird costs least per pound, and the frame makes stock. [10/12] |
| buying_tips[0] | Whole bird: cheapest per pound, and the carcass makes stock. | Whole bird: lowest cost per pound, and the carcass makes stock. |
| buying_tips[1] | Thighs, bone-in and skin-on: forgiving, cheap, hard to overcook. | Thighs, bone-in and skin-on: forgiving, low-cost, hard to overcook. |
| buying_tips[3] | Boneless skinless is the priciest form of the same bird. | Boneless skinless costs the most for the same bird. |
| watch_out[0] | Boneless skinless is the priciest form of the same bird. | Boneless skinless costs the most for the same bird. |
| watch_out[3] | Where air-chilled is not stocked, a regular bird is still a clean cheap protein. Pat it dry before it goes in the pan. | Where air-chilled is not stocked, a regular bird still does the job. Pat it dry before it goes in the pan. |
| pick_steps[1] | A whole bird is cheapest per pound, and the frame makes stock. | A whole bird costs least per pound, and the frame makes stock. [12] |
| labels_decoded “Contains up to X% retained water”.meaning | Water absorbed during water-chilling — you’re paying for it by weight. | Water absorbed during water-chilling; you’re paying for it by weight. |
| labels_decoded “Raised without antibiotics”.meaning | No antibiotics used in raising — meaningful, best when third-party verified. | No antibiotics used in raising: meaningful, best when third-party verified. |
| labels_decoded “No antibiotic residues”.meaning | True of all chicken by law — not a differentiator. | True of all chicken by law; not a differentiator. |

KEPT byte-identical, with reasons:
- cart_pick `Air-chilled whole chicken or bone-in thighs`: pinned (ic4achicken.test.js:101); now the new front's first rung in the same words (L5: every cart_pick term is printed by the front).
- pick_steps[0] (already says “costs the most”), pick_steps[2] (pinned verbatim, ic4achicken.test.js:100). pick_steps stays 3 (:99 requires 1–3).
- buying_tips[2], [4]–[8]; watch_out[1], [2], [4]–[8]: seven ic4achicken C5 pinned sentences live in these; none carries a price word or claim-grep hit.
- detail, science: no `cheapest`/`priciest`/`protein`; detail's “most expensive way to buy the same bird” is a relative term, kept (passRule allows a rewrite but nothing requires it).
- labels_decoded terms (all five; passRule and ic4achicken C5 check terms). Only the three meanings with em-dashes change.
- do line `Take the pack with the skin still on. It bastes itself.` (headline 8 + do 11 = 19 ≤ 28; not a meat tip echo).
- title `Chicken` (ic4b C2), aliases (ic4b C2, counterProbe48), asked_as, sources, category, evidence_tier, question.

Step 2: the review-table headline for `chicken_cuts_basics` becomes the new decision (ic4b C5 compares them).

Pins touching this card, all expected to hold with the text above (not run): ic4achicken C5 (nine sentences, pinned step, cart_pick equal, label terms), C6 (OWNED_FACTS chill_water owner, do line), C7 (lintCard/readability/lintRepeatedClaim empty, RULE4 grep); ic4b C2 (title, decision /thigh/i, air-chill present in back since decision says air-chilled: buying_tips[4], pick_steps[2]), C5/C6 (front ≤14, no hedge, tier_note one sentence ≥5 words and unique, lint, readability, review headline); counterProbe48 (aliases untouched); k15 `duck legs`; ktight B04.

---

#### chicken_breast (R per D8; NOT folded; `chill_water` family member)

Front owns only breast-specific content: plain (no added solution), then the breast's own form (bone-in, skin-on before boneless skinless). No new air-chill/water-chill/retained-water text is added; the existing `Retained water` label term and the retained-water back lines stay as they are.

| field | old | new |
| --- | --- | --- |
| decision | Plain breast, fresh or frozen, over any with added flavoring solution. | Plain breast, no added solution; bone-in and skin-on before boneless skinless. [11] |
| instead | (absent) | Bone-in, skin-on thighs: more fat, more flavor, and hard to overcook. [12] |
| why | Added flavoring solution changes the formulation. Plain chicken breast is the whole-food standard. | Added flavoring solution changes the formulation. A plain breast carries nothing but the chicken. [6/8] |
| kristy_take | Added flavoring solution changes the formulation. Plain chicken breast is the whole-food standard. | Added flavoring solution changes the formulation. The product name has to admit it, so the plain pack is easy to find. [6/15] |
| pick_steps[2] | Choose fresh or frozen plain breast without an added flavoring solution. | Take bone-in, skin-on breast; boneless skinless dries fast in the pan. [11] |
| buying_tips (append [3]) | (3 items) | Bone-in and skin-on cook better than boneless skinless, which dries fast. |

KEPT byte-identical, with reasons:
- tier_note `Any added flavoring solution has to appear in the product name, with its amount.` [14]: one sentence, 5–20 words, unique, not a tier name, and it is the why behind the front's first rung. ic4b C2b `≥5 words` holds.
- cart_pick `Plain chicken breast without added solution`: names “breast” (ca-3b C3 /breast/i, type veto, counterProbe48 breast rows) and is the front's first rung.
- pick_steps[0], [1]: [1] keeps “fresh or frozen”, so that fact stays on the card's steps after it leaves the decision.
- short_answer, detail, science, watch_out (3, incl. the woody-breast line), labels_decoded (2): no L2 phrase found, no grep hit.
- do line `Read the front for any added liquid percentage, then check the ingredients.` (headline 11 + do 12 = 23 ≤ 28).
- title, aliases, asked_as, sources, category, evidence_tier, question.

Step 2: the review-table headline for `chicken_breast` becomes the new decision (ic4b C2b).

Pins touching this card, all expected to hold (not run): ic4achicken C1 (present, not RETIRED), C3 (counter and list “chicken breast” → chicken_breast; title and aliases untouched), C7 (lint as `chill_water` family); ic4b C2b (decision differs from the `a6a8cc7` decision; tier_note ≥5; review headline; lintCard, readability); counterProbe48 breast rows; ktight B04; ca-3b C3.

---

#### rotisserie_chicken (R, D6 only)

| field | old | new |
| --- | --- | --- |
| detail (one parenthetical) | (Whole Foods Market’s organic rotisserie chicken lists ‘organic chicken’ and nothing else) | (one store’s organic rotisserie chicken lists ‘organic chicken’ and nothing else) |

The rest of `detail` byte-identical (every CFR number and percentage kept; passRule number check).

KEPT byte-identical, with reasons:
- decision `Chicken and salt on the label: buy. Phosphate and starch: pass.` [11]: within D1, label words, no grass term; its 5-grams compared by hand against meat tip check 3, none shared.
- tier_note `Two federal label rules settle it; the ingredient list just needs reading.` [12]: one sentence, unique, no L2 phrase found.
- instead (non-empty), cart_pick `Plain rotisserie chicken` (front's first rung), pick_steps (3).
- Safety lines (never deleted): the FSIS 2-hour, 140°F hold, 40 to 140°F, 165°F reheat, 3 to 4 days and 4 months lines in watch_out and science, all byte-identical.
- why, short_answer, kristy_take, buying_tips, science, labels_decoded, do line.
- sources, including the Whole Foods/EWG entry (KB line 300): preserved field, D1 and plan Q2. The brand name leaves the spoken text only.

Pins touching this card, all expected to hold (not run): ic4b C5/C6/C7 (front, tier_note, lint, readability, review headline unchanged; no source change); k23, k24, k8 asks (aliases/asked_as untouched); ktight B04.

---

#### turkey_whole (R, L2 “whole-food standard” group)

| field | old | new |
| --- | --- | --- |
| tier_note | Basting and added-solution statements describe documented processing; choosing a plain bird is the whole-food standard. | A basted or self-basted bird was injected or marinated with a solution the label must name. [16] |
| instead | (absent) | A frozen whole turkey with no added-solution statement; frozen describes temperature history, not formulation. [14] |
| why | An added basting solution is a separate formulation. Plain whole turkey is the whole-food standard. | An added basting solution is a separate formulation. A plain bird is turkey with nothing added. [8/8] |
| kristy_take | An added basting solution is a separate formulation. Plain whole turkey is the whole-food standard. | An added basting solution is a separate formulation. Fresh or frozen, the plain bird is the pick. [8/9] |

KEPT byte-identical, with reasons:
- decision `Whole turkey without an injected basting solution.` [7]: within D1; the new tier_note glosses “basting” (basted/self-basted).
- cart_pick `Whole turkey without added solution` (front's rung; type “whole” unchanged).
- pick_steps (3), buying_tips (3), watch_out (2), short_answer, detail, science, labels_decoded, do line, question, title, aliases, asked_as, sources.

Step 2: decision unchanged, review table untouched.

Pins touching this card, all expected to hold (not run): ic4b C5/C6/C7 (tier_note one sentence, ≥5 words, unique; lint; readability); k15 `whole turkey`; counterProbe48 `turkey`; ktight B04.

---

#### ground_turkey (R, L2 “whole-food standard” group)

| field | old | new |
| --- | --- | --- |
| tier_note | The ingredient and percent-fat statements are documented label information; selecting plain ground turkey is the whole-food standard. | Ground turkey alone names no fat level, and a percent-lean claim must carry its percent fat. [16] |
| instead | (absent) | Plain ground turkey with no lean claim; compare packs by the Nutrition Facts fat line. [15] |
| why | Grinding does not specify the fat content. A plain formulation is the whole-food standard. | Grinding does not specify the fat content. A plain pack is turkey with no seasoning or solution added. [7/11] |
| kristy_take | Grinding does not specify the fat content. A plain formulation is the whole-food standard. | Grinding does not specify the fat content. So read the fat line, and take the pack with nothing added. [7/12] |

KEPT byte-identical, with reasons:
- decision `Plain ground turkey with its ingredients and fat content stated.` [10]: within D1, no grass term.
- cart_pick `Plain ground turkey` (type “ground” unchanged).
- pick_steps (1), buying_tips (3), watch_out (1), short_answer, detail, science, labels_decoded, do line, question, title, aliases, asked_as, sources.

Step 2: decision unchanged, review table untouched.

Pins touching this card, all expected to hold (not run): ic4b C5/C6/C7; k15 `ground turkey`; counterProbe48 ground-turkey rows; ktight B04.

---

## Claim-trace rows (append to ca-3b's table)

Tags as in ca-3a: `card` = already on this card; `KB:<id>.<field>` = on another KB card; `KS` = kristys_standard, no new fact; `rot:9` = `docs/research/rotisserie-chicken-sources.md` §9.

| # | card.field | new sentence | trace |
| --- | --- | --- | --- |
| D1 | chicken_cuts_basics.decision | Air-chilled whole chicken first, then bone-in, skin-on thighs. | card cart_pick “Air-chilled whole chicken or bone-in thighs” (pinned); card old decision “Air-chilled first, then bone-in, skin-on thighs” |
| D2 | chicken_cuts_basics.tier_note | A whole bird yields both meats and a stock frame; water-chilled packs can hold retained water. | card detail “A whole bird broken down at home gives you both kinds of meat plus a frame for broth”; card old tier_note “Water-chilled packages can hold retained water” |
| D3 | chicken_cuts_basics.instead | Where air-chilled is not stocked, a regular whole bird or bone-in thighs, patted dry before the pan. | card watch_out[3] “Where air-chilled is not stocked, a regular bird … Pat it dry before it goes in the pan.” |
| D4 | chicken_cuts_basics.why s2 / buying_tips[3] / watch_out[0] | Boneless skinless costs the most for the same bird. | card old “the priciest form of the same bird” (relative term, non-negotiable 8); card pick_steps[0] “boneless skinless costs the most” |
| D5 | chicken_cuts_basics.short_answer s1 / buying_tips[0] | Whole bird: lowest cost per pound, and the carcass makes stock. | card old “cheapest per pound”; card detail “at the lowest cost per pound in the store” |
| D6 | chicken_cuts_basics.kristy_take s1 | Bone-in thighs are the most forgiving cut in the case. | card detail “bone-in skin-on thighs are the most forgiving thing in the case” |
| D7 | chicken_cuts_basics.kristy_take s2 / pick_steps[1] | A whole bird costs least per pound, and the frame makes stock. | card detail “at the lowest cost per pound in the store”; card old pick_steps[1] “and the frame makes stock” |
| D8 | chicken_cuts_basics.buying_tips[1] | Thighs, bone-in and skin-on: forgiving, low-cost, hard to overcook. | card old (“cheap” → “low-cost”) |
| D9 | chicken_cuts_basics.watch_out[3] s1 | Where air-chilled is not stocked, a regular bird still does the job. | card old watch_out[3] (“clean cheap protein” removed: price word and claim grep) |
| D10 | chicken_cuts_basics.labels_decoded ×3 | (three meanings) | card, em-dash → semicolon/colon, words kept |
| D11 | chicken_breast.decision | Plain breast, no added solution; bone-in and skin-on before boneless skinless. | card cart_pick “Plain chicken breast without added solution”; KB:chicken_cuts_basics.detail “Bone-in and skin-on cost less and cook better than boneless skinless” |
| D12 | chicken_breast.instead | Bone-in, skin-on thighs: more fat, more flavor, and hard to overcook. | KB:chicken_cuts_basics.detail “Thighs are dark meat: more fat, more flavor, and very hard to overcook.” |
| D13 | chicken_breast.why s2 | A plain breast carries nothing but the chicken. | KS; card cart_pick “Plain chicken breast without added solution” |
| D14 | chicken_breast.kristy_take s2 | The product name has to admit it, so the plain pack is easy to find. | card short_answer “Flavoring solutions added to poultry must be disclosed as part of the product name, including their amount.” |
| D15 | chicken_breast.pick_steps[2] | Take bone-in, skin-on breast; boneless skinless dries fast in the pan. | KB:chicken_cuts_basics.detail “Boneless skinless breast is convenience paid for twice, once at the register and again in how fast it dries”; KB:chicken_cuts_basics.short_answer “Bone-in, skin-on cuts cost less and cook better than boneless skinless.” |
| D16 | chicken_breast.buying_tips[3] | Bone-in and skin-on cook better than boneless skinless, which dries fast. | KB:chicken_cuts_basics.detail (the two quotes in D11 and D15) |
| D17 | rotisserie_chicken.detail (parenthetical) | (one store’s organic rotisserie chicken lists ‘organic chicken’ and nothing else) | rot:9 “ORGANIC CHICKEN\*.” (EWG, UPC 099482803568, ingredient list from the package); card sources, KB line 300; D6 brand → plain words |
| D18 | turkey_whole.tier_note | A basted or self-basted bird was injected or marinated with a solution the label must name. | card short_answer “A basted or self-basted turkey has been injected or marinated with a solution. The solution and its ingredients must be identified on the label.” |
| D19 | turkey_whole.instead | A frozen whole turkey with no added-solution statement; frozen describes temperature history, not formulation. | card buying_tips[1] “A frozen whole turkey can be checked for the same added-solution statement.”; card detail “Fresh and frozen describe temperature history, so read the formulation on either bird.” |
| D20 | turkey_whole.why s2 | A plain bird is turkey with nothing added. | KS; card cart_pick “Whole turkey without added solution” |
| D21 | turkey_whole.kristy_take s2 | Fresh or frozen, the plain bird is the pick. | card pick_steps[2] “Choose fresh or frozen turkey without an injected basting solution.” |
| D22 | ground_turkey.tier_note | Ground turkey alone names no fat level, and a percent-lean claim must carry its percent fat. | card detail “The words ground turkey alone do not identify one fat level.”; card short_answer “a percent-lean claim must be accompanied by a percent-fat statement” |
| D23 | ground_turkey.instead | Plain ground turkey with no lean claim; compare packs by the Nutrition Facts fat line. | card buying_tips[1] “Without a percent-lean claim, use the Nutrition Facts fat line to compare packs.” |
| D24 | ground_turkey.why s2 | A plain pack is turkey with no seasoning or solution added. | card buying_tips[0] “Choose a formulation listing turkey without added seasonings or a flavoring solution.” |
| D25 | ground_turkey.kristy_take s2 | So read the fat line, and take the pack with nothing added. | card buying_tips[1] (fat line) + buying_tips[0] |

This group adds no number, URL, statistic or source. Checked by reading the changed strings (no grep run): no em-dash, no straight quote, no first person, none of `healthier|healthiest|better for you|lowers|exposure|protein|calorie`, no `cheapest|price|$`, no brand name. The one brand left on these cards is in `rotisserie_chicken.sources`, a preserved field.

## Open questions

1. Poultry raising POINTER: no card here prints a raising term in its front, so none is added. If ca-3b's grass-terms criterion is meant to cover any card whose back speaks to raising (chicken_cuts_basics watch_out on antibiotics and organic), a pointer string has to be decided. The owner title is too long for a ≤14-word `<Fact>: see <Owner title>.` step, and chicken_cuts_basics has no free pick_steps slot (3 used, one pinned).
2. L1/L2/L4 and lintCard were checked by reading, not run. The “whole-food standard” sentence is gone from all three poultry cards that had it. “Read retained-water wording separately from the” stays on 2 cards (turkey_whole, chicken_breast), under the 3-card threshold. turkey_whole's new tier_note shares the 6-gram “injected or marinated with a solution” with its own short_answer and science; that is one card, but if another card (ham, pork_cuts_and_enhanced) prints the same 6-gram, L2 fires. The builder's counts.mjs AFTER run is the real check.
3. ic4b C2b compares the chicken_breast decision against `a6a8cc7`; that commit was not read here. The new text is new wording, so equality is not expected; the test confirms.
