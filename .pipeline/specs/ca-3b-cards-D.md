# ca-3b card texts, group D: poultry (planner@opus, 2026-10-15)

Fills the ca-3b Step 1 TODO rows for `chicken_cuts_basics`, `chicken_breast`, `rotisserie_chicken`, `turkey_whole`, `ground_turkey`. Paste each block into `.pipeline/specs/ca-3b.md` Step 1 and the claim-trace rows into its claim-trace table.

Fields not named stay byte-identical. Curly quotes only (‘ ’ “ ”). No em-dash in any changed string. [n] = whitespace word count (builder re-counts with the lint's counter). KB entries read at `5267f05`.

Poultry raising POINTER: none added. No front or cart_pick in this group prints a raising term (`pasture-raised`, `organic`, `grass-`), and the `bird_pig_raising` owner is `label_pasture_raised_feed` (title “What “pasture-raised” does and does not tell you”), which no pointer string has been decided for. See Open questions.

---

#### chicken_cuts_basics (R; owner of `chill_water`, counterCardLint.js:1563)

Front: the cart_pick is pinned (ic4achicken.test.js:101), so the front is brought to it: the whole bird joins the first rung, breast leaves the front (D2: breast is `chicken_breast`'s front).

| field | old | new |
| --- | --- | --- |
| decision | Air-chilled first, then bone-in, skin-on thighs over breast. | Air-chilled whole chicken first, then bone-in, skin-on thighs. [8] |
| tier_note | Water-chilled packages can hold retained water, and thighs carry more fat than breast. | A whole bird yields both meats and a stock frame; water-chilled packs can hold retained water. [16] |
| instead | (absent) | Where air-chilled is not stocked, a regular whole bird or bone-in thighs, patted dry before the pan. [17] |
| why | Dark meat is forgiving and hard to overcook. Boneless skinless is the priciest form of it. | Dark meat is forgiving and hard to overcook. Boneless skinless costs the most for the same bird. [8/9] |
| short_answer | Whole bird: cheapest per pound, and the carcass makes stock. Thighs carry … | Whole bird: lowest cost per pound, and the carcass makes stock. (rest byte-identical) [39 total, ≤40] |
| kristy_take | Bone-in thighs are the most forgiving protein in the store. A whole bird is the cheapest, and the frame makes stock. | Bone-in thighs are the most forgiving cut in the case. A whole bird costs least per pound, and the frame makes stock. [10/12] |
| buying_tips[0] | Whole bird: cheapest per pound, and the carcass makes stock. | Whole bird: lowest cost per pound, and the carcass makes stock. |
| buying_tips[1] | Thighs, bone-in and skin-on: forgiving, cheap, hard to overcook. | Thighs, bone-in and skin-on: forgiving, low-cost, hard to overcook. |
| buying_tips[3] | Boneless skinless is the priciest form of the same bird. | Boneless skinless costs the most for the same bird. |
| watch_out[0] | Boneless skinless is the priciest form of the same bird. | Boneless skinless costs the most for the same bird. |
| watch_out[3] | Where air-chilled is not stocked, a regular bird is still a clean cheap protein. Pat it dry before it goes in the pan. | Where air-chilled is not stocked, a regular bird still does the job. Pat it dry before it goes in the pan. |
| pick_steps[1] | A whole bird is cheapest per pound, and the frame makes stock. | A whole bird costs least per pound, and the frame makes stock. [12] |
| labels_decoded "Contains up to X% retained water".meaning | Water absorbed during water-chilling — you’re paying for it by weight. | Water absorbed during water-chilling; you’re paying for it by weight. |
| labels_decoded "Raised without antibiotics".meaning | No antibiotics used in raising — meaningful, best when third-party verified. | No antibiotics used in raising: meaningful, best when third-party verified. |
| labels_decoded "No antibiotic residues".meaning | True of all chicken by law — not a differentiator. | True of all chicken by law; not a differentiator. |

KEPT byte-identical, with reasons:
- cart_pick `Air-chilled whole chicken or bone-in thighs`: pinned `assert.equal` (ic4achicken.test.js:101); now equals the new front's first rung in label words (L5 clean: no shared-term family, no scoped CANONICAL_GLOSSES term in the front).
- pick_steps[0] (already “costs the most”), pick_steps[2] (pinned, ic4achicken.test.js:100). pick_steps stays 3.
- buying_tips[2], [4]–[8]; watch_out[1], [2], [4]–[8] (seven of these are ic4achicken C5 pinned sentences).
- detail, science (no “cheapest”/“priciest”/“protein” in either; detail's “most expensive” is a relative term, not a price grep hit).
- labels_decoded terms (all five kept; passRule and ic4achicken C5 check terms).
- do line `Take the pack with the skin still on. It bastes itself.` (not handling trivia; headline 8 + do 11 = 19 ≤ 28).
- title `Chicken` (ic4b.test.js:49), aliases (ic4b.test.js:53), asked_as, sources, category, evidence_tier, question.

Step 2: review-table headline for `chicken_cuts_basics` becomes the new decision (ic4b.test.js:77 compares them).

Pins touching this card (keep): ic4achicken C1–C7 (C5: nine sentences in spoken fields, pick_steps air-chilled step verbatim, cart_pick equal, labels terms; C6: TRY_POOL[4], OWNED_FACTS chill_water owner, do line exists; C7: lintCard/readability/lintRepeatedClaim = [] and RULE4); ic4b C2 (title, decision /thigh/i, air-chill in back fields, aliases), C5 (front ≤14, no hedge, tier_note 1 sentence ≥5 words unique, lint, readability, review headline), C6 (RULE4 decision+tier_note); counterProbe48.test.js:134-165 (matching by aliases/type veto; no alias changes here); k15.test.js:33 (`duck legs` alias); k8, k24 owners; ktight B04.

---

#### chicken_breast (R per D8; NOT folded; `chill_water` family member)

Front owns only breast-specific content: plain (no added solution), then the breast's own form (bone-in, skin-on before boneless skinless). No air-chill/water-chill/retained-water text is added (the `chill_water` pattern belongs to the owner).

| field | old | new |
| --- | --- | --- |
| decision | Plain breast, fresh or frozen, over any with added flavoring solution. | Plain breast, no added solution; bone-in and skin-on before boneless skinless. [11] |
| instead | (absent) | Bone-in, skin-on thighs: more fat, more flavor, and hard to overcook. [12] |
| why | Added flavoring solution changes the formulation. Plain chicken breast is the whole-food standard. | Added flavoring solution changes the formulation. A plain breast carries nothing but the chicken. [6/8] |
| kristy_take | Added flavoring solution changes the formulation. Plain chicken breast is the whole-food standard. | Added flavoring solution changes the formulation. The product name has to admit it, so the plain pack is easy to find. [6/15] |
| pick_steps[2] | Choose fresh or frozen plain breast without an added flavoring solution. | Bones conduct heat slowly and skin bastes; boneless skinless dries fast. [11] |
| buying_tips + | (3 items) | + "Bone-in and skin-on cook better than boneless skinless, which dries fast." (4 items) |

KEPT byte-identical, with reasons:
- tier_note `Any added flavoring solution has to appear in the product name, with its amount.` [14]: one sentence, 5–20 words, unique, not a tier name, and it is the why for the front's first rung (no added solution). ic4b C2b `words ≥ 5` holds.
- cart_pick `Plain chicken breast without added solution`: still names “breast” (ca-3b C3, type veto, counterProbe48.test.js:137-138); equals the front's first rung (plain, no added solution). L5 clean.
- pick_steps[0], [1] (step 2 keeps “fresh or frozen”, so that fact stays on the front-adjacent ladder).
- short_answer, detail, science, watch_out (3), labels_decoded (2): no L2 phrase, no grep hit, woody-breast lines kept.
- do line `Read the front for any added liquid percentage, then check the ingredients.` (headline 11 + do 12 = 23 ≤ 28).
- title, aliases, asked_as, sources, category, evidence_tier, question.

Step 2: review-table headline for `chicken_breast` becomes the new decision (ic4b.test.js:102).

Pins touching this card (keep): ic4achicken C1 (:42-43 present, not RETIRED), C3 (:69-70 counter and list “chicken breast” → chicken_breast; title/aliases untouched), C7 (:120-124 lintCard/readability/lintRepeatedClaim as `chill_water` family); ic4b C2b (:100 decision ≠ the `a6a8cc7` decision; the new text is new wording, builder confirms with the test; :101 tier_note ≥5; :102 review headline; :103-104 lintCard, readability); counterProbe48.test.js:20, 134-138; ktight B04; ca-3b C3 (entry changed, cart_pick /breast/i).

---

#### rotisserie_chicken (R, D6 only)

| field | old | new |
| --- | --- | --- |
| detail (one parenthetical) | (Whole Foods Market’s organic rotisserie chicken lists ‘organic chicken’ and nothing else) | (one store’s organic rotisserie chicken lists ‘organic chicken’ and nothing else) |

Everything else in `detail` byte-identical (all CFR numbers, 0.5 percent, 3 percent kept; passRule number check).

KEPT byte-identical, with reasons:
- decision `Chicken and salt on the label: buy. Phosphate and starch: pass.` [11]: within D1, label words, no grass term, no L1 5-gram with tip check 3 (“an ingredient list of meat, salt, and spices”); its 5-grams were compared, none shared.
- tier_note `Two federal label rules settle it; the ingredient list just needs reading.` [12]: one sentence, unique, no L2 phrase.
- instead (non-empty, 19 words), cart_pick `Plain rotisserie chicken` (front's first rung, no shared term), pick_steps (3).
- Safety lines (ship bar): watch_out[0] FSIS 2-hour line, watch_out[1] 140°F hold line, watch_out[2] “reheated to 165°F” line, and the science sentences carrying them: all byte-identical.
- why, short_answer, kristy_take, buying_tips, science, labels_decoded, do line.
- sources (incl. the EWG/Whole Foods source entry): preserved field, D1 and plan Q2.

Pins touching this card (keep): ic4b C5/C6/C7 (BATCH :22; front, tier_note, lint, readability, review headline unchanged, no source change); k23.test.js:41, 51 and k24.test.js:35, 43 (owner of asks; aliases/asked_as untouched); k8.test.js:18; ktight B04.

---

#### turkey_whole (R, L2 “whole-food standard” group)

| field | old | new |
| --- | --- | --- |
| tier_note | Basting and added-solution statements describe documented processing; choosing a plain bird is the whole-food standard. | A basted or self-basted bird was injected or marinated with a solution the label must name. [16] |
| instead | (absent) | A frozen whole turkey with no added-solution statement; frozen describes temperature history, not formulation. [14] |
| why | An added basting solution is a separate formulation. Plain whole turkey is the whole-food standard. | An added basting solution is a separate formulation. A plain bird is turkey with nothing added. [8/9] |
| kristy_take | An added basting solution is a separate formulation. Plain whole turkey is the whole-food standard. | An added basting solution is a separate formulation. Fresh or frozen, the plain bird is the pick. [8/9] |

KEPT byte-identical, with reasons:
- decision `Whole turkey without an injected basting solution.` [7]: within D1; the tier_note now carries the term bridge for “basting” (basted/self-basted gloss).
- cart_pick `Whole turkey without added solution` (front's rung, type “whole” unchanged, no shared term).
- pick_steps (3), buying_tips (3), watch_out (2), short_answer, detail, science, labels_decoded, do line, question, title, aliases, asked_as, sources.

Step 2: decision unchanged, review table untouched.

Pins touching this card (keep): ic4b C5/C6/C7 (tier_note one sentence, ≥5 words, unique; lint; readability); k15.test.js:43 (`whole turkey`); counterProbe48.test.js:17 (`turkey`); ktight B04.

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

Pins touching this card (keep): ic4b C5/C6/C7; k15.test.js:43 (`ground turkey`); counterProbe48.test.js:18, 169 (the :169 row is a synthetic entry, not the KB card); ktight B04.

---

## Claim-trace rows (append to ca-3b's table)

Tags as in ca-3a: `card` = already on this card; `KB:<id>.<field>` = on another KB card; `KS` = kristys_standard, no new fact; `rot:9` = `docs/research/rotisserie-chicken-sources.md` §9.

| # | card.field | new sentence | trace |
| --- | --- | --- | --- |
| D1 | chicken_cuts_basics.decision | Air-chilled whole chicken first, then bone-in, skin-on thighs. | card cart_pick “Air-chilled whole chicken or bone-in thighs” (pinned) + old decision “Air-chilled first, then bone-in, skin-on thighs” |
| D2 | chicken_cuts_basics.tier_note | A whole bird yields both meats and a stock frame; water-chilled packs can hold retained water. | card detail “A whole bird broken down at home gives you both kinds of meat plus a frame for broth”; card old tier_note “Water-chilled packages can hold retained water” |
| D3 | chicken_cuts_basics.instead | Where air-chilled is not stocked, a regular whole bird or bone-in thighs, patted dry before the pan. | card watch_out[3] “Where air-chilled is not stocked, a regular bird … Pat it dry before it goes in the pan.” |
| D4 | chicken_cuts_basics.why s2 / buying_tips[3] / watch_out[0] | Boneless skinless costs the most for the same bird. | card old “the priciest form of the same bird” (relative term, non-negotiable 8); card pick_steps[0] “boneless skinless costs the most” |
| D5 | chicken_cuts_basics.short_answer s1 / buying_tips[0] | Whole bird: lowest cost per pound, and the carcass makes stock. | card old “cheapest per pound”; card detail “at the lowest cost per pound in the store” |
| D6 | chicken_cuts_basics.kristy_take s1 | Bone-in thighs are the most forgiving cut in the case. | card old kristy_take (“protein” → “cut”, claim grep); card detail “the most forgiving thing in the case” |
| D7 | chicken_cuts_basics.kristy_take s2 / pick_steps[1] | A whole bird costs least per pound, and the frame makes stock. | card detail “lowest cost per pound”; card old pick_steps[1] |
| D8 | chicken_cuts_basics.buying_tips[1] | Thighs, bone-in and skin-on: forgiving, low-cost, hard to overcook. | card old (“cheap” → “low-cost”) |
| D9 | chicken_cuts_basics.watch_out[3] s1 | Where air-chilled is not stocked, a regular bird still does the job. | card old watch_out[3] (“clean cheap protein” removed: claim grep and price word) |
| D10 | chicken_cuts_basics.labels ×3 | (three meanings) | card, em-dash → semicolon/colon, words kept |
| D11 | chicken_breast.decision | Plain breast, no added solution; bone-in and skin-on before boneless skinless. | card old decision/cart_pick (“plain”, “without added solution”); KB:chicken_cuts_basics.detail “Bone-in and skin-on cost less and cook better than boneless skinless” |
| D12 | chicken_breast.instead | Bone-in, skin-on thighs: more fat, more flavor, and hard to overcook. | KB:chicken_cuts_basics.detail “Thighs are dark meat: more fat, more flavor, and very hard to overcook”; buying_tips[1] |
| D13 | chicken_breast.why s2 | A plain breast carries nothing but the chicken. | KS; card cart_pick “Plain chicken breast without added solution” |
| D14 | chicken_breast.kristy_take s2 | The product name has to admit it, so the plain pack is easy to find. | card short_answer “Flavoring solutions added to poultry must be disclosed as part of the product name, including their amount.” |
| D15 | chicken_breast.pick_steps[2] | Bones conduct heat slowly and skin bastes; boneless skinless dries fast. | KB:chicken_cuts_basics.science “Bones conduct heat slowly, and skin renders and bastes.”; KB:chicken_cuts_basics.detail “again in how fast it dries” |
| D16 | chicken_breast.buying_tips + | Bone-in and skin-on cook better than boneless skinless, which dries fast. | KB:chicken_cuts_basics.detail (same two quotes as D11, D15) |
| D17 | rotisserie_chicken.detail (parenthetical) | (one store’s organic rotisserie chicken lists ‘organic chicken’ and nothing else) | rot:9 “ORGANIC CHICKEN\*.” (EWG, UPC 099482803568, from the package); card sources[6]; D6 brand → label words |
| D18 | turkey_whole.tier_note | A basted or self-basted bird was injected or marinated with a solution the label must name. | card short_answer “A basted or self-basted turkey has been injected or marinated with a solution. The solution and its ingredients must be identified on the label.” |
| D19 | turkey_whole.instead | A frozen whole turkey with no added-solution statement; frozen describes temperature history, not formulation. | card buying_tips[1] “A frozen whole turkey can be checked for the same added-solution statement.”; card detail “Fresh and frozen describe temperature history, so read the formulation on either bird.” |
| D20 | turkey_whole.why s2 | A plain bird is turkey with nothing added. | KS; card decision/cart_pick (“without added solution”) |
| D21 | turkey_whole.kristy_take s2 | Fresh or frozen, the plain bird is the pick. | card pick_steps[2] “Choose fresh or frozen turkey without an injected basting solution.” |
| D22 | ground_turkey.tier_note | Ground turkey alone names no fat level, and a percent-lean claim must carry its percent fat. | card detail “The words ground turkey alone do not identify one fat level.”; card short_answer “a percent-lean claim must be accompanied by a percent-fat statement” (FR 2010-32485, card sources[0]) |
| D23 | ground_turkey.instead | Plain ground turkey with no lean claim; compare packs by the Nutrition Facts fat line. | card buying_tips[1] “Without a percent-lean claim, use the Nutrition Facts fat line to compare packs.” |
| D24 | ground_turkey.why s2 | A plain pack is turkey with no seasoning or solution added. | card buying_tips[0] “Choose a formulation listing turkey without added seasonings or a flavoring solution.” |
| D25 | ground_turkey.kristy_take s2 | So read the fat line, and take the pack with nothing added. | card buying_tips[1] (fat line) + buying_tips[0] |

No new number, URL, statistic or source in this group. Greps over the changed strings: no em-dash, no straight quote, no first person, no `healthier|healthiest|better for you|lowers|exposure|protein|calorie`, no `\bcheapest\b|\bprice\b|\$[0-9]`, no brand (the one brand left is in `rotisserie_chicken.sources`, a preserved field).

## Open questions

1. Poultry raising POINTER: no card here prints a raising term in its front, so none is added. If the ca-3b Grass-terms criterion is read as “any card whose back speaks to raising” (chicken_cuts_basics watch_out on antibiotics/organic), a pointer needs a decided string; the owner title “What “pasture-raised” does and does not tell you” is too long for a `<Fact>: see <Owner title>.` step (≤14 words), and chicken_cuts_basics has no free pick_steps slot (3 used, one pinned).
2. L2 and the D3 4-gram form were checked by reading, not by running `lintSections`: the “whole-food standard” sentence is gone from all three poultry cards that had it; “Read retained-water wording separately from the” stays on 2 cards (turkey_whole, chicken_breast), under the ≥3 threshold. The builder's counts.mjs AFTER run is the real check.
3. ic4b C2b compares the chicken_breast decision against `a6a8cc7`; not read here (no git in this session). The new text is new wording, so equality is not expected.
