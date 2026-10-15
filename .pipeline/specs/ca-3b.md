# ca-3b — Meat batch B: pork, poultry, cured meats (14 cards, no fold)

```json
{
  "id": "ca-3b",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "docs/do-lines-review.md",
    "server/lib/doLines.json"
  ],
  "read_full": [
    "server/test/acceptance/passRule.js",
    "server/lib/counterCards.js",
    "server/lib/counterCardLint.js",
    "server/lib/counterCardLint.test.js",
    "server/lib/counterReach.test.js",
    "server/test/ktight.test.js",
    "server/test/counterProbe48.test.js",
    "server/test/acceptance/ic4achicken.test.js",
    "server/test/acceptance/ic4b.test.js",
    "server/test/acceptance/ic5b.test.js",
    "server/test/acceptance/k9.test.js",
    "server/test/acceptance/k14.test.js",
    "docs/CARD-ALIGNMENT-PLAN.md",
    "docs/research/card-align-sources.md",
    "docs/research/meat-sources.md"
  ],
  "verify": "node --test server/test/acceptance/ca-3b.test.js && cd server && npm test; node scripts/listMatchProbe.js; node scripts/commitGuard.js; node scripts/migrateCounterCards.js --dry-run",
  "token_ceiling": 100000
}
```

Repo kristy, branch `main`. Plan approved 2026-10-14 on defaults Q1-Q3 (admin relay of Devon's go).

- Route: dv T2 (fallback forge@opus [T2]); critic@opus, FIDELITY required.
- P1. Parallel-safe: no. It builds on the ca-3a commit: same KB, same do-line files, and the full-meat-section lint assertion needs ca-3a's cards.
- Plan: `docs/CARD-ALIGNMENT-PLAN.md`, "CA-3 Meat batch", Inventory "Milestone 1, meat" (CA-3b rows), D1-D8, the meat tip. Scouts: `.pipeline/specs/ca-scouts.md` S2, S4, S5, S11.
- **Before dispatch:** the admin captures BEFORE with the independent check script below, at the ca-3a commit `aa12a3d`. ca-3a folded `ground_beef_organ_blend`, so the corpus at `aa12a3d` is 181 curated cards.
- **Spec status: COMPLETE (splice 2026-10-15).** The 14 card texts are spliced from `.pipeline/specs/ca-3b-cards-C.md`, `-D.md` and `-E.md`. Every old text was re-read against `server/kristy_perimeter_kb.json` at `aa12a3d` and matches byte for byte (0 mismatches). Two fragment-D `instead` strings were changed at splice to clear lintCard (see Splice notes). No lint, test or script was run on the new texts; every check is by hand.

**D8 decision: `chicken_breast` is REWRITTEN, not folded.** S5 evidence:
- `server/lib/counterCards.js:159` records the IC-4a reason for keeping it ("chicken_breast stays (type veto)").
- The live readers in S5:
  - `server/lib/list.js:120-122, 344, 366, 370, 378`;
  - `server/lib/listImport.js:78`;
  - `server/lib/counterCardLint.js:1564`;
  - `server/lib/doLines.json:23`.
- The tests in S5:
  - `server/test/ktight.test.js:15`;
  - `counterProbe48.test.js:20, 137-138`;
  - `ic4achicken.test.js:42-43, 69-72, 101`;
  - `ic4b.test.js:97-103`.

The plan's condition for a fold ("only if S5 shows no recorded reason") is not met. No RETIRED change, and the dry-run deletes nothing.

## Alignment block

- **Done means:**
  - **D1.** Given the KB after the build, when each CA-3b id is read, then: decision ≤14 words with no hedge; tier_note is one sentence of 5-20 words; instead is non-empty and ≤24 words; pick_steps has 1-3 items of ≤14 words; watch_out never shrinks.
  - **Grass terms.** Given every CA-3b id, then `decision` and `cart_pick` do not match `/grass-(fed|finished)/i`. `pork_cuts_and_enhanced` keeps its existing POINTER (“How it was raised: see What “pasture-raised” does and does not tell you.”); no poultry or cured front prints a raising term, so no new POINTER is added.
  - **Whole-meat-section lints.** Given the CA-5 meat tip with both flags on, then `lintSections` returns zero L1, L2, L4 and L5 hits for the whole meat section (ca-3a + ca-3b ids). L3 handling hits are out of scope (tip side, CA-5).
  - **Greps.** Given the changed copy fields, then the brand, claim-lock (`healthier|healthiest|better for you|lowers|exposure|protein|calorie`) and price (`\bcheapest\b|\bprice\b|\$[0-9]`) greps are 0, with no em-dash and no first-person word.
  - **Cures.** Given a cure sentence on bacon, ham, hot_dogs, turkey_bacon, cured_pork or deli_meat_uncured, then it is one of `PRESERVATION_CURE_SENTENCES` (counterCardLint.js:1485) verbatim.
  - **chicken_breast.** Given `chicken_breast`, then it stays in the KB, is not in RETIRED, and its `cart_pick` still names "breast", so `typeContradicts` (perimeter.js:130-151) keeps its type veto.
- **Out of scope:**
  - Section tips (CA-5).
  - CA-3a ids.
  - Eggs and dairy (CA-4).
  - Seafood.
  - Migration.
  - Any fold.
- **OK rough edges:**
  - An id already within D1 with no grass term and no L1/L2 hit is reported KEPT.
  - `detail` grows where rephrased depth moves down.
- **Ship bar:**
  - An untraced claim, or a numbered fact missing (passRule).
  - A safety line deleted: rotisserie FSIS reheating, ham cook-before-eating, cured_pork "Not Preserved, Keep Refrigerated".
  - A cart_pick that changes type (breast/thigh/whole/ground/deli) or prints a shared term.
  - An ESSENTIALS id reordered.
  - An em-dash or straight quote.
  - A first-person word.
  - A protein or price figure in a changed copy field.
- **Independent check:** `counts.mjs` below, BEFORE at `aa12a3d` and AFTER the build:
  - the per-id word counts;
  - the full meat-section L1/L2/L4/L5 hit list going to 0;
  - each changed cart_pick through `matchItemToCard` reporting its own slug.

## Steps (the change, old → new)

### 1. `server/kristy_perimeter_kb.json`

Fields not named stay byte-identical. Curly quotes only. No em-dash in a changed string. Cure sentences only from `PRESERVATION_CURE_SENTENCES` (`server/lib/counterCardLint.js:1485`). Re-locate every entry by id; the line numbers are as of `aa12a3d`.

| id | KB line at aa12a3d | fields changed | constraints the text satisfies |
| --- | --- | --- | --- |
| pork_cuts_and_enhanced | 2747 | instead | Enhanced/solution sentence keeps its numbers; 9 CFR 317.2 descriptive name (meat:338-362); in TRY_POOL, keep id |
| pick_sausage | 6010 | decision | pick: decision only (`PICK_FORBIDDEN_FIELDS`, counterCardLint.js:827-832, bars pick_steps, tier_note, instead and cart_pick on picks); sausage quotes meat:70-133 |
| pick_jerky | 7584 | none (KEPT) | pick; no protein figure |
| chicken_cuts_basics | 2635 | decision, tier_note, instead, why, short_answer, kristy_take, buying_tips, watch_out, pick_steps, labels_decoded | "cheapest"/"priciest" → relative words; "protein" sentence rephrased (claim grep); em-dashes in labels → colon/semicolon; air-chilled 9 CFR 441.10 (meat:168-190) |
| chicken_breast | 6780 | decision, instead, why, kristy_take, pick_steps, buying_tips | R per D8; cart_pick keeps "breast"; ic4achicken :42-43, :69-72, :101 and ic4b :97-103 pins unread, re-pin only if a decision change breaks them (then add the file to owns) |
| rotisserie_chicken | 207 | detail | detail brand "Whole Foods Market’s" → label words (D6); FSIS safety lines kept |
| turkey_whole | 6312 | tier_note, instead, why, kristy_take | L2 "is the whole-food standard" group: no shared 6-gram |
| ground_turkey | 6366 | tier_note, instead, why, kristy_take | same L2 group |
| bacon | 6617 | decision, tier_note, instead, cart_pick | same L2 group; uncured wording from NMPAN (meat:285-302) and PRESERVATION_CURE_SENTENCES |
| ham | 7152 | decision, tier_note, instead, cart_pick | same L2 group; protein figures stay in KEPT fields only; cook-before-eating line kept |
| hot_dogs | 6671 | tier_note, instead | same L2 group; in K9 slice |
| turkey_bacon | 7215 | decision, tier_note, instead, cart_pick | same L2 group |
| cured_pork | 7269 | decision, tier_note, instead, cart_pick | "Not Preserved, Keep Refrigerated" kept verbatim |
| deli_meat_uncured | 2808 | instead | tip check 3 ("ingredient list of meat, salt, and spices") must not be echoed as a 5-gram (L1) |

#### pork_cuts_and_enhanced

| field | old | new |
| --- | --- | --- |
| instead | (absent) | Pork with the lowest stated solution percentage on the shelf. |

KEPT byte-identical: decision, tier_note, cart_pick `Pork shoulder`, pick_steps (both, including the POINTER), why, short_answer, detail, kristy_take, buying_tips, watch_out, science, labels_decoded, aliases, asked_as, sources. They hold the numbers 15%, 15, 100 and 12% that passRule requires.

#### pick_sausage (kind pick)

| field | old | new |
| --- | --- | --- |
| decision | Sausage is a seasoned grind; the ingredient list must name any curing agents beyond the meat. | Sausage is seasoned ground meat; its ingredient list names every curing agent used. |

KEPT: sources (319.140, 319.141, 317.17), aliases, asked_as. No pick_steps added (picks are barred from them). New decision: 13 words, no digit, no veto word, one sentence ending ".".

#### pick_jerky (kind pick)

No field changes. The decision "Jerky is dried meat; the ingredients name the meat and any curing agent." is 13 words, carries no protein figure, and is pinned lint-clean by k15 C7.

#### chicken_cuts_basics

| field | old | new |
| --- | --- | --- |
| decision | Air-chilled first, then bone-in, skin-on thighs over breast. | Air-chilled whole chicken first, then bone-in, skin-on thighs. |
| tier_note | Water-chilled packages can hold retained water, and thighs carry more fat than breast. | A whole bird yields both meats and a stock frame; water-chilled packs can hold retained water. |
| instead | (absent) | A regular whole bird or bone-in thighs, patted dry before the pan. |
| why | Dark meat is forgiving and hard to overcook. Boneless skinless is the priciest form of it. | Dark meat is forgiving and hard to overcook. Boneless skinless costs the most for the same bird. |
| short_answer, sentence 1 only | Whole bird: cheapest per pound, and the carcass makes stock. | Whole bird: lowest cost per pound, and the carcass makes stock. |
| kristy_take | Bone-in thighs are the most forgiving protein in the store. A whole bird is the cheapest, and the frame makes stock. | Bone-in thighs are the most forgiving cut in the case. A whole bird costs least per pound, and the frame makes stock. |
| buying_tips[0] | Whole bird: cheapest per pound, and the carcass makes stock. | Whole bird: lowest cost per pound, and the carcass makes stock. |
| buying_tips[1] | Thighs, bone-in and skin-on: forgiving, cheap, hard to overcook. | Thighs, bone-in and skin-on: forgiving, low-cost, hard to overcook. |
| buying_tips[3] | Boneless skinless is the priciest form of the same bird. | Boneless skinless costs the most for the same bird. |
| watch_out[0] | Boneless skinless is the priciest form of the same bird. | Boneless skinless costs the most for the same bird. |
| watch_out[3] | Where air-chilled is not stocked, a regular bird is still a clean cheap protein. Pat it dry before it goes in the pan. | Where air-chilled is not stocked, a regular bird still does the job. Pat it dry before it goes in the pan. |
| pick_steps[1] | A whole bird is cheapest per pound, and the frame makes stock. | A whole bird costs least per pound, and the frame makes stock. |
| labels_decoded “Contains up to X% retained water”, meaning | Water absorbed during water-chilling — you’re paying for it by weight. | Water absorbed during water-chilling; you’re paying for it by weight. |
| labels_decoded “Raised without antibiotics”, meaning | No antibiotics used in raising — meaningful, best when third-party verified. | No antibiotics used in raising: meaningful, best when third-party verified. |
| labels_decoded “No antibiotic residues”, meaning | True of all chicken by law — not a differentiator. | True of all chicken by law; not a differentiator. |

KEPT byte-identical:
- cart_pick `Air-chilled whole chicken or bone-in thighs` (pinned, ic4achicken.test.js:101; now the front's first rung in the same words, L5).
- pick_steps[0] and pick_steps[2] (pinned verbatim, ic4achicken.test.js:100); pick_steps stays 3 items.
- short_answer sentences 2-4; buying_tips[2] and [4]-[8]; watch_out[1], [2] and [4]-[8] (seven ic4achicken C5 pinned sentences live here).
- detail, science, all five labels_decoded terms, the do line, title `Chicken`, aliases, asked_as, sources, category, evidence_tier, question.

#### chicken_breast (R per D8, not folded)

| field | old | new |
| --- | --- | --- |
| decision | Plain breast, fresh or frozen, over any with added flavoring solution. | Plain breast, no added solution; bone-in and skin-on before boneless skinless. |
| instead | (absent) | Chicken thighs: more fat, more flavor, and hard to overcook. |
| why | Added flavoring solution changes the formulation. Plain chicken breast is the whole-food standard. | Added flavoring solution changes the formulation. A plain breast carries nothing but the chicken. |
| kristy_take | Added flavoring solution changes the formulation. Plain chicken breast is the whole-food standard. | Added flavoring solution changes the formulation. The product name has to admit it, so the plain pack is easy to find. |
| pick_steps[2] | Choose fresh or frozen plain breast without an added flavoring solution. | Take bone-in, skin-on breast; boneless skinless dries fast in the pan. |
| buying_tips[3] (appended; the 3 existing items unchanged) | (absent) | Bone-in and skin-on cook better than boneless skinless, which dries fast. |

KEPT byte-identical:
- tier_note `Any added flavoring solution has to appear in the product name, with its amount.`
- cart_pick `Plain chicken breast without added solution` (names “breast”: C3, type veto, counterProbe48 breast rows).
- pick_steps[0] and [1] ([1] keeps “fresh or frozen” on the card's steps).
- short_answer, detail, science, watch_out (3, including the woody-breast line), labels_decoded (2), the do line, title, aliases, asked_as, sources, category, evidence_tier, question.

#### rotisserie_chicken (D6 only)

| field | old | new |
| --- | --- | --- |
| detail, one parenthetical only | (Whole Foods Market’s organic rotisserie chicken lists ‘organic chicken’ and nothing else) | (one store’s organic rotisserie chicken lists ‘organic chicken’ and nothing else) |

The rest of `detail` stays byte-identical (every CFR number and percentage kept). KEPT: decision, tier_note, instead, cart_pick `Plain rotisserie chicken`, pick_steps, why, short_answer, kristy_take, buying_tips, science, labels_decoded, the do line, and the FSIS safety lines (2-hour, 140°F hold, 40 to 140°F, 165°F reheat, 3 to 4 days, 4 months). `sources` keeps the Whole Foods/EWG entry (preserved field); the brand name leaves the spoken text only.

#### turkey_whole

| field | old | new |
| --- | --- | --- |
| tier_note | Basting and added-solution statements describe documented processing; choosing a plain bird is the whole-food standard. | A basted or self-basted bird was injected or marinated with a solution the label must name. |
| instead | (absent) | A frozen whole turkey with no added-solution statement; frozen describes temperature history, not formulation. |
| why | An added basting solution is a separate formulation. Plain whole turkey is the whole-food standard. | An added basting solution is a separate formulation. A plain bird is turkey with nothing added. |
| kristy_take | An added basting solution is a separate formulation. Plain whole turkey is the whole-food standard. | An added basting solution is a separate formulation. Fresh or frozen, the plain bird is the pick. |

KEPT byte-identical: decision `Whole turkey without an injected basting solution.`, cart_pick `Whole turkey without added solution`, pick_steps (3), buying_tips (3), watch_out (2), short_answer, detail, science, labels_decoded, the do line, question, title, aliases, asked_as, sources. Decision unchanged, so the review table is untouched.

#### ground_turkey

| field | old | new |
| --- | --- | --- |
| tier_note | The ingredient and percent-fat statements are documented label information; selecting plain ground turkey is the whole-food standard. | Ground turkey alone names no fat level, and a percent-lean claim must carry its percent fat. |
| instead | (absent) | Plain ground turkey with no lean claim; compare packs by the Nutrition Facts fat line. |
| why | Grinding does not specify the fat content. A plain formulation is the whole-food standard. | Grinding does not specify the fat content. A plain pack is turkey with no seasoning or solution added. |
| kristy_take | Grinding does not specify the fat content. A plain formulation is the whole-food standard. | Grinding does not specify the fat content. So read the fat line, and take the pack with nothing added. |

KEPT byte-identical: decision `Plain ground turkey with its ingredients and fat content stated.`, cart_pick `Plain ground turkey`, pick_steps (1), buying_tips (3), watch_out (1), short_answer, detail, science, labels_decoded, the do line, question, title, aliases, asked_as, sources. Decision unchanged, so the review table is untouched.

#### bacon

| field | old | new |
| --- | --- | --- |
| decision | Bacon chosen by its curing ingredients, with the qualifier read. | Bacon with the shortest label list: pork, salt and its named curing agents. |
| tier_note | The asterisk and curing ingredients are documented label facts; choosing by them is the whole-food standard. | Each curing agent on bacon has to be listed, so the shortest list is easy to find. |
| instead | (absent) | Bacon that adds sugar and wood smoke to the pork and salt. |
| cart_pick | Bacon with disclosed curing ingredients | Bacon with the shortest label list |

KEPT byte-identical: why and kristy_take (set #8 plus the uncured caveat), short_answer, detail, buying_tips (3), labels_decoded (Uncured, “No nitrates added*”), science, watch_out (2, including set #9), pick_steps (3), aliases (bacon, sliced bacon), asked_as, sources.

#### ham

| field | old | new |
| --- | --- | --- |
| decision | Ham chosen by its label class, read for added water. | Ham named just “Ham” first, then “Ham With Natural Juices.” |
| tier_note | The water-added classes are USDA labeling definitions; choosing the least added water is the whole-food standard. | The product name tells how much water went in, and just “Ham” means the least. |
| instead | (absent) | Fresh ham: the leg of pork itself, which needs cooking before eating. |
| cart_pick | Ham with natural juices | Ham named just “Ham” |

KEPT byte-identical: why, kristy_take, short_answer (holds “highest protein level”), detail, science, labels_decoded (hold 20.5%, 18.5%, 17.0%, 10%), pick_steps (2; step 2 is the cook-before-eating safety line), watch_out (2; item 2 is the safety line), buying_tips, the do line, question, title, aliases, asked_as, sources, category, evidence_tier. The old cart_pick was the second rung; the new one is the first rung, same type (deli ham).

#### hot_dogs

| field | old | new |
| --- | --- | --- |
| tier_note | The meat ingredients and byproducts wording disclose regulated processing distinctions; choosing named meat is the whole-food standard. | Mechanically separated poultry is a paste-like product of tissue taken off bones, and the list must name it. |
| instead | (absent) | Fresh sausage from the butcher counter, its meat named and nothing mechanically separated. |

KEPT byte-identical: decision `Hot dogs with named meat and no mechanically separated poultry.`, cart_pick `Hot dogs with named meat`, pick_steps (2; step 2 is a PRESERVATION_CURE_SENTENCES member), why, kristy_take (“… The whole-food standard favors named meat.”), short_answer, detail, science, watch_out (2), buying_tips, labels_decoded, the do line, and all preserved fields. Decision unchanged, so the review table is untouched.

#### turkey_bacon

| field | old | new |
| --- | --- | --- |
| decision | Turkey bacon read by its descriptive name and curing ingredients. | Turkey bacon with the fewest ingredients after the turkey. |
| tier_note | The descriptive name and curing list are USDA labeling requirements, so reading them is the whole-food standard. | Turkey bacon is turkey meat pressed into bacon form, so fewer additions keep it closer to the meat. |
| instead | (absent) | Pork bacon, the belly cut that “bacon” alone names on a US label. |
| cart_pick | Turkey bacon with listed curing ingredients | Turkey bacon with the fewest ingredients |

KEPT byte-identical: pick_steps (3; step 2 is a PRESERVATION_CURE_SENTENCES member), why, kristy_take, short_answer, watch_out (1, “Turkey bacon is still a cured product, …”), detail, science, buying_tips, labels_decoded, the do line, and all preserved fields.

#### cured_pork

| field | old | new |
| --- | --- | --- |
| decision | Cured pork, guanciale included, judged by its cut and curing ingredients. | Cured pork, guanciale included, with its cut named and a short curing list. |
| tier_note | The asterisk and curing ingredients are USDA labeling rules for “uncured” claims. | The cut name and each curing ingredient are label requirements; favoring a short list is judgment. |
| instead | (absent) | Cured pork with spices and sugar beyond salt, every curing ingredient still listed. |
| cart_pick | Cured pork with listed curing ingredients | Cured pork with a short curing list |

KEPT byte-identical: watch_out “An “Uncured” product that is not dried or heavily salted must say “Not Preserved, Keep Refrigerated”.” (safety line), why and kristy_take (set #16 plus the cut sentence), short_answer (the guanciale answer behind the k15:128 ask pin), detail, buying_tips (3), science, labels_decoded (Prosciutto, Pancetta, Uncured), pick_steps (3), aliases (prosciutto, salami, pancetta, guanciale), asked_as, sources.

#### deli_meat_uncured

| field | old | new |
| --- | --- | --- |
| instead | (absent) | Whole roasted meat sliced thin does the same sandwich job with nothing added. |

KEPT byte-identical: decision (the deliberate cure sentence, a PRESERVATION_CURE_SENTENCES member), tier_note, pick_steps (3), why, short_answer, kristy_take, detail, science, watch_out (2), buying_tips, labels_decoded, the do line, and all preserved fields. No cart_pick is added (the card has none today and keeps none).

#### Splice notes (where this spec departs from the fragments)

- `chicken_cuts_basics.instead`: fragment D's "Where air-chilled is not stocked, a regular whole bird or bone-in thighs, patted dry before the pan." opens on "Where", which is INSTEAD_HEDGED. The spec text drops the conditional clause.
- `chicken_breast.instead`: fragment D's "Bone-in, skin-on thighs: more fat, more flavor, and hard to overcook." echoes "bone-in" and "skin-on", which the new decision names after its ";". That is INSTEAD_ECHOES_REFUSED. The spec text says "Chicken thighs" instead.
- `deli_meat_uncured.cart_pick` (fragment E, E12) is not applied, by admin rule.
- The pick row constraint reads "decision only", because PICK_FORBIDDEN_FIELDS bars pick_steps on picks.

### 2. `docs/do-lines-review.md` → `server/lib/doLines.json`

- The review-table headline cell becomes the new decision for chicken_cuts_basics, chicken_breast, bacon, ham, turkey_bacon and cured_pork. The other eight rows are unchanged. No do line changes.
- Regenerate with `node server/scripts/buildDoLines.js`; commit both.
- doLines lines at `aa12a3d` (read 2026-10-15):
  - :3 bacon;
  - :23 chicken_breast;
  - :24 chicken_cuts_basics;
  - :37 cured_pork;
  - :40 deli_meat_uncured;
  - :65 ground_turkey;
  - :66 ham;
  - :68 hot_dogs;
  - :120 pork_cuts_and_enhanced;
  - :146 rotisserie_chicken;
  - :174 turkey_bacon;
  - :175 turkey_whole.

## Criteria

- C1 [test] D1 limits hold on every CA-3b card.
- C2 [test] No CA-3b decision or cart_pick prints a grass term.
- C3 [test] chicken_breast survives (D8 rewrite): present, not RETIRED, cart_pick names breast.
- C4 [test] The pass rule holds for every CA-3b id vs `aa12a3d`.
- C5 [test] Brand, claim-lock and price greps are 0 over changed copy fields; ≥14 fields changed.
- C6 [test] The full meat section is lint-clean (L1, L2, L4, L5) under the CA-5 meat tip with flags on.
- C7 [test] Every cure sentence in a changed field is a `PRESERVATION_CURE_SENTENCES` member.
- C8 [test] Per-card lintCard, readability and lintPickSteps are clean for every changed non-pick card, and reviewHeadline equals decision.
- C9 Server `npm test` green (count reported), listMatchProbe 0 wrong, commitGuard clean, migrate dry-run deletes nothing and upserts only CA-3b ids.

## Contract

```json
{"criteria":[
 {"id":"C1","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3b.test.js"],"dependents":["server/test/acceptance/ic5b.test.js","server/test/ktight.test.js","server/lib/counterReach.test.js"],"allowed_reads":["docs/CARD-ALIGNMENT-PLAN.md"],"expected":"every CA-3b card within D1","test_name":"C1 D1 limits hold on every CA-3b card"},
 {"id":"C2","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3b.test.js"],"dependents":["server/lib/counterCardLint.js"],"allowed_reads":[],"expected":"0 grass matches","test_name":"C2 no CA-3b decision or cart_pick prints a grass term"},
 {"id":"C3","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3b.test.js"],"dependents":["server/lib/list.js","server/lib/listImport.js","server/lib/counterCardLint.js","server/test/acceptance/ic4achicken.test.js","server/test/acceptance/ic4b.test.js","server/test/counterProbe48.test.js"],"allowed_reads":["server/lib/counterCards.js"],"expected":"chicken_breast present, not RETIRED, cart_pick /breast/i","test_name":"C3 chicken_breast survives as a rewrite"},
 {"id":"C4","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3b.test.js"],"dependents":["server/test/acceptance/passRule.js"],"allowed_reads":["server/test/acceptance/passRule.js"],"expected":"assertPassRule ok for 14 ids","test_name":"C4 the pass rule holds for every CA-3b id"},
 {"id":"C5","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3b.test.js"],"dependents":[],"allowed_reads":[],"expected":"0 brand/claim/price hits; >=14 changed fields","test_name":"C5 brand claim and price greps are zero over changed copy fields"},
 {"id":"C6","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3b.test.js"],"dependents":["server/lib/counterCardLint.test.js"],"allowed_reads":["server/lib/counterCardLint.js"],"expected":"0 L1/L2/L4/L5 hits in section meat","test_name":"C6 the full meat section is lint-clean under the meat tip"},
 {"id":"C7","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3b.test.js"],"dependents":["server/lib/counterCardLint.js"],"allowed_reads":["server/lib/counterCardLint.js"],"expected":"every cure sentence is a PRESERVATION_CURE_SENTENCES member","test_name":"C7 cure sentences come only from the shared set"},
 {"id":"C8","impl":["server/kristy_perimeter_kb.json","docs/do-lines-review.md","server/lib/doLines.json"],"tests":["server/test/acceptance/ca-3b.test.js"],"dependents":["server/test/acceptance/ic5b.test.js","server/test/acceptance/k9.test.js"],"allowed_reads":[],"expected":"per-card lints []","test_name":"C8 per-card lints are clean and headlines match"},
 {"id":"C9","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/k14.test.js"],"dependents":[],"allowed_reads":[],"expected":"npm test green except the k14 C12 anchor tripwire main re-anchors; probe 0 wrong; commitGuard clean; dry-run deletes 0"}
],
"dependency_evidence":[
 {"owned":"server/kristy_perimeter_kb.json","imports":["server/routes/perimeter.js:145","server/routes/perimeter.js:274","server/routes/perimeter.js:410","server/lib/listMatch.js:202","server/lib/listMatch.js:229","Tools/listvocab/build.js:43","chicken_breast id readers: server/lib/list.js:120","server/lib/list.js:344","server/lib/list.js:366","server/lib/list.js:370","server/lib/list.js:378","server/lib/listImport.js:78","server/lib/counterCardLint.js:1564","server/lib/doLines.json:23","server/lib/counterCardLint.js sectionForCategory (section map)"],"tests":["server/lib/counterReach.test.js","server/test/acceptance/passRule.js","server/test/ktight.test.js","server/test/counterProbe48.test.js","server/test/acceptance/ic4achicken.test.js","server/test/acceptance/ic4b.test.js","server/lib/counterCardLint.test.js"],"source":".pipeline/specs/ca-scouts.md S11, S4, S5, S2"}
],
"env":{"executables":["node","git","grep"],"browsers":[],"temp":"/Users/m1/kristy/.pipeline/runs/ca-3b","network":false}}
```

## Acceptance server/test/acceptance/ca-3b.test.js

```js
// Written by the planner; do not edit.
// ca-3b: docs/CARD-ALIGNMENT-PLAN.md "CA-3 Meat batch", CA-3b rows. D8: chicken_breast is rewritten, not folded.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as lint from '../../lib/counterCardLint.js';
import * as pass from './passRule.js';
import { RETIRED, projectEntry } from '../../lib/counterCards.js';

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ROOT = join(SERVER, '..');
const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
const doLines = JSON.parse(readFileSync(join(SERVER, 'lib', 'doLines.json'), 'utf8'));
const BASE = 'aa12a3d';
const PRE = JSON.parse(execFileSync('git', ['show', `${BASE}:server/kristy_perimeter_kb.json`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const now = (id) => kb.entries.find((e) => e.id === id);
const pre = (id) => PRE.entries.find((e) => e.id === id);
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const flat = (r) => (Array.isArray(r) ? r : (r && r.violations) || []);
const RETIRED_IDS = new Set([...(RETIRED || [])].map((r) => (typeof r === 'string' ? r : r.id)));

const BATCH = ['pork_cuts_and_enhanced', 'pick_sausage', 'pick_jerky', 'chicken_cuts_basics', 'chicken_breast', 'rotisserie_chicken',
  'turkey_whole', 'ground_turkey', 'bacon', 'ham', 'hot_dogs', 'turkey_bacon', 'cured_pork', 'deli_meat_uncured'];
const CURED = ['bacon', 'ham', 'hot_dogs', 'turkey_bacon', 'cured_pork', 'deli_meat_uncured'];
const MEAT_TIP = { section: 'meat', rule: 'A local butcher comes first; at the case, choose meat from animals raised on grass and open pasture.', checks: ['Ask what the animal ate and how it lived; a butcher counter can answer.', 'Organs come from the same animal; liver and heart belong in the cart too.', 'On packaged meat, look for an ingredient list of meat, salt, and spices.'] };
const COPY_SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'category', 'evidence_tier']);
const BRAND = /whole foods|tyson|perdue|hormel|oscar mayer|applegate|boar.s head|smithfield|jimmy dean|hillshire|butterball|jennie-o|foster farms/i;
const CLAIM = /healthier|healthiest|better for you|lowers|exposure|protein|calorie/i;
const PRICE = /\bcheapest\b|\bprice\b|\$[0-9]/i;
const CURE_WORD = /\b(cured|uncured|nitrite|nitrate|celery powder|celery juice)\b/i;

test('C1 D1 limits hold on every CA-3b card', () => {
  for (const id of BATCH) {
    const e = now(id);
    assert.ok(e, `${id} missing`);
    assert.ok(words(e.decision) <= 14, `${id} decision ${words(e.decision)} words`);
    if (Array.isArray(e.pick_steps)) {
      assert.ok(e.pick_steps.length >= 1 && e.pick_steps.length <= 3, `${id} pick_steps ${e.pick_steps.length}`);
      for (const s of e.pick_steps) assert.ok(words(s) <= 14, `${id} pick_step "${s}"`);
    }
    if (e.kind === 'pick') continue;
    const n = String(e.tier_note || '').trim();
    assert.ok(words(n) >= 5 && words(n) <= 20, `${id} tier_note ${words(n)} words`);
    assert.doesNotMatch(n, /[.!?]\s+\S/, `${id} tier_note is more than one sentence`);
    assert.ok(String(e.instead || '').trim().length > 0 && words(e.instead) <= 24, `${id} instead`);
  }
});

test('C2 no CA-3b decision or cart_pick prints a grass term', () => {
  for (const id of BATCH) {
    const e = now(id);
    assert.doesNotMatch(String(e.decision || ''), /grass-(fed|finished)/i, `${id} decision`);
    assert.doesNotMatch(String(e.cart_pick || ''), /grass-(fed|finished)/i, `${id} cart_pick`);
  }
});

test('C3 chicken_breast survives as a rewrite', () => {
  const e = now('chicken_breast');
  assert.ok(e, 'chicken_breast was removed');
  assert.ok(!RETIRED_IDS.has('chicken_breast'), 'chicken_breast is RETIRED');
  assert.match(String(e.cart_pick || ''), /breast/i);
  assert.notEqual(JSON.stringify(e), JSON.stringify(pre('chicken_breast')), 'chicken_breast unchanged');
});

test('C4 the pass rule holds for every CA-3b id', (t) => {
  for (const id of BATCH) pass.assertPassRule(t, pre(id), now(id));
});

test('C5 brand claim and price greps are zero over changed copy fields', () => {
  let changed = 0;
  for (const id of BATCH) {
    const e = now(id);
    const p = pre(id);
    for (const [f, v] of Object.entries(e)) {
      if (COPY_SKIP.has(f) || JSON.stringify(v) === JSON.stringify(p[f])) continue;
      changed++;
      const s = JSON.stringify(v);
      assert.doesNotMatch(s, BRAND, `${id}.${f} brand`);
      assert.doesNotMatch(s, CLAIM, `${id}.${f} claim-lock word`);
      assert.doesNotMatch(s, PRICE, `${id}.${f} price`);
      assert.doesNotMatch(s, /—/, `${id}.${f} em-dash`);
      assert.doesNotMatch(s, /\b(I|me|my|mine)\b/, `${id}.${f} first person`);
    }
  }
  assert.ok(changed >= 14, `only ${changed} changed copy fields`);
});

test('C6 the full meat section is lint-clean under the meat tip', () => {
  const hits = lint.lintSections([{ ...MEAT_TIP, tip_aligned: true, cards_aligned: true }], kb.entries);
  const bad = hits.filter((h) => h.section === 'meat' && ['SECTION_TIP_REPEATS_CARD', 'SECTION_PHRASE_REPEATED', 'TERM_UNGLOSSED', 'CART_PICK_DISAGREES'].includes(h.code));
  assert.deepEqual(bad, []);
});

test('C7 cure sentences come only from the shared set', () => {
  const allowed = new Set(lint.PRESERVATION_CURE_SENTENCES);
  assert.ok(allowed.size > 0, 'PRESERVATION_CURE_SENTENCES empty');
  for (const id of CURED) {
    const e = now(id);
    const p = pre(id);
    for (const f of ['decision', 'tier_note', 'why', 'short_answer', 'kristy_take']) {
      if (JSON.stringify(e[f]) === JSON.stringify(p[f])) continue;
      for (const s of String(e[f] || '').split(/(?<=[.!?])\s+/)) {
        if (CURE_WORD.test(s) && !/^Cured\b|^Uncured\b/.test(s.trim())) assert.ok(allowed.has(s.trim()), `${id}.${f} authored a cure sentence: ${s}`);
      }
    }
  }
});

test('C8 per-card lints are clean and headlines match', () => {
  for (const id of BATCH) {
    const e = now(id);
    if (e.kind === 'pick' || JSON.stringify(e) === JSON.stringify(pre(id))) continue;
    assert.deepEqual(lint.lintCard(projectEntry(e, { doLine: doLines[id] })), [], `${id} lintCard`);
    assert.deepEqual(flat(lint.readability(e)), [], `${id} readability`);
    assert.deepEqual(flat(lint.lintPickSteps(e)), [], `${id} lintPickSteps`);
  }
});
```

## ANCHOR server/test/ktight.test.js:15
```
  B04: ['rotisserie_chicken', 'chicken_cuts_basics', 'turkey_whole', 'ground_turkey', 'chicken_breast', 'egg_labels', 'egg_duck_quail'],
  B05: ['deli_meat_uncured', 'bacon', 'hot_dogs', 'ham', 'turkey_bacon', 'cured_pork', 'hummus', 'deli_salads', 'prepared_meals', 'fresh_pasta', 'deli'],
```
Read only: no CA-3b id leaves a batch, so ktight needs no edit.

## ANCHOR server/lib/doLines.json:64
```
  "ground_beef_lean_ratio": "Read the label for organ names, each with a percentage beside it.",
  "ground_turkey": "Read the ingredient list and the fat statement beside any percent-lean claim.",
  "ham": "Read the product name for “Water Added” or “Ham and Water Product”.",
```
Read at `aa12a3d` (ca-3a removed `ground_beef_organ_blend`). No do line changes in ca-3b; `buildDoLines.js` regenerates this file from the review table, and these lines stay as they are.

## Claim-trace table (one row per new sentence)

Allowed traces:
- the card's own fields (`card`);
- another KB card (`KB:<id>.<field>`);
- kristys_standard, no new fact (`KS`);
- `PRESERVATION_CURE_SENTENCES` (`set #n` = nth member in file order, counterCardLint.js:1485);
- `docs/research/meat-sources.md` (`meat:<lines>`):
  - :32-69 Illinois Extension;
  - :70-133 sausage;
  - :168-190 air chilled 9 CFR 441.10;
  - :285-302 NMPAN uncured bacon (https://www.nichemeatprocessing.org/uncured-bacon/);
  - :338-362 9 CFR 317.2;
  - :611-692 MSU myoglobin, FSIS dating;
- `docs/sources/k15/cured-pork-fsis-bacon.md:<line>` (`k15-src`, the archived FSIS bacon page);
- `docs/research/rotisserie-chicken-sources.md` §9 (`rot:9`);
- `docs/research/card-align-sources.md` blocks.

Never a URL from memory. Row ids C-n are fragment C rows, not criteria.

| # | card.field | new sentence | trace |
| --- | --- | --- | --- |
| C-1 | pork_cuts_and_enhanced.instead | Pork with the lowest stated solution percentage on the shelf. | meat:338-362 (9 CFR 317.2) "The percentage of added solution must appear as a number (such as, 15, 20, 30) and the percent symbol (%)"; card.why "Raw meat with added solution must name it, give the percentage and list what is in it."; KS (less added solution = closer to plain pork) |
| C-2 | pick_sausage.decision | Sausage is seasoned ground meat; its ingredient list names every curing agent used. | meat:70-133 (319.140) "the coarse or finely comminuted meat food product … usually seasoned with condimented proportions of condimental substances, and frequently cured."; meat:70-133 (317.17) "any substance mixed with another substance to cure a product must be identified in the ingredients statement on the label of such product." |
| C-3 | bacon.decision | Bacon with the shortest label list: pork, salt and its named curing agents. | k15-src :764 "Yes, bacon is made with salt as a curing agent."; set #15 "Each substance in a curing mixture, such as salt, sugar, or sodium nitrite, must be listed."; KS (shortest list) |
| C-4 | bacon.tier_note | Each curing agent on bacon has to be listed, so the shortest list is easy to find. | set #15; set #7 "US curing-label policy requires curing-mixture ingredients to be listed individually."; KS |
| C-5 | bacon.instead | Bacon that adds sugar and wood smoke to the pork and salt. | k15-src :764 "Bacon may also contain other additives such as sugars, maple sugar, wood smoke, flavorings and spices." |
| C-6 | bacon.cart_pick | Bacon with the shortest label list | card (C-3, the decision) |
| C-7 | cured_pork.decision | Cured pork, guanciale included, with its cut named and a short curing list. | card.short_answer "Guanciale is worth buying on the same terms: the cut named and the curing ingredients listed."; KS (short list) |
| C-8 | cured_pork.tier_note | The cut name and each curing ingredient are label requirements; favoring a short list is judgment. | set #19 "Pancetta is cured belly, and cheek meat must carry its true name, such as pork jowl."; set #15; k15-src :953 "The true product name, e.g., "Pork Jowl Dixie Bacon, Cured and Smoked" shall appear on the label."; KS (the second clause states that it is a judgment) |
| C-9 | cured_pork.instead | Cured pork with spices and sugar beyond salt, every curing ingredient still listed. | k15-src :961 "It is usually cured in salt and spices and then air-dried."; k15-src :764 "such as sugars"; set #15 |
| C-10 | cured_pork.cart_pick | Cured pork with a short curing list | card (C-7, the decision) |
| D1 | chicken_cuts_basics.decision | Air-chilled whole chicken first, then bone-in, skin-on thighs. | card cart_pick “Air-chilled whole chicken or bone-in thighs” (pinned); card old decision “Air-chilled first, then bone-in, skin-on thighs” |
| D2 | chicken_cuts_basics.tier_note | A whole bird yields both meats and a stock frame; water-chilled packs can hold retained water. | card detail “A whole bird broken down at home gives you both kinds of meat plus a frame for broth”; card old tier_note “Water-chilled packages can hold retained water” |
| D3 | chicken_cuts_basics.instead | A regular whole bird or bone-in thighs, patted dry before the pan. | card watch_out[3] “a regular bird … Pat it dry before it goes in the pan.”; card cart_pick “Air-chilled whole chicken or bone-in thighs” |
| D4 | chicken_cuts_basics.why s2 / buying_tips[3] / watch_out[0] | Boneless skinless costs the most for the same bird. | card old “the priciest form of the same bird” (relative term, non-negotiable 8); card pick_steps[0] “boneless skinless costs the most” |
| D5 | chicken_cuts_basics.short_answer s1 / buying_tips[0] | Whole bird: lowest cost per pound, and the carcass makes stock. | card old “cheapest per pound”; card detail “at the lowest cost per pound in the store” |
| D6 | chicken_cuts_basics.kristy_take s1 | Bone-in thighs are the most forgiving cut in the case. | card detail “bone-in skin-on thighs are the most forgiving thing in the case” |
| D7 | chicken_cuts_basics.kristy_take s2 / pick_steps[1] | A whole bird costs least per pound, and the frame makes stock. | card detail “at the lowest cost per pound in the store”; card old pick_steps[1] “and the frame makes stock” |
| D8 | chicken_cuts_basics.buying_tips[1] | Thighs, bone-in and skin-on: forgiving, low-cost, hard to overcook. | card old (“cheap” → “low-cost”) |
| D9 | chicken_cuts_basics.watch_out[3] s1 | Where air-chilled is not stocked, a regular bird still does the job. | card old watch_out[3] (“clean cheap protein” removed: price word and claim grep) |
| D10 | chicken_cuts_basics.labels_decoded ×3 | (three meanings) | card, em-dash → semicolon/colon, words kept |
| D11 | chicken_breast.decision | Plain breast, no added solution; bone-in and skin-on before boneless skinless. | card cart_pick “Plain chicken breast without added solution”; KB:chicken_cuts_basics.detail “Bone-in and skin-on cost less and cook better than boneless skinless” |
| D12 | chicken_breast.instead | Chicken thighs: more fat, more flavor, and hard to overcook. | KB:chicken_cuts_basics.detail “Thighs are dark meat: more fat, more flavor, and very hard to overcook.” |
| D13 | chicken_breast.why s2 | A plain breast carries nothing but the chicken. | KS; card cart_pick “Plain chicken breast without added solution” |
| D14 | chicken_breast.kristy_take s2 | The product name has to admit it, so the plain pack is easy to find. | card short_answer “Flavoring solutions added to poultry must be disclosed as part of the product name, including their amount.” |
| D15 | chicken_breast.pick_steps[2] | Take bone-in, skin-on breast; boneless skinless dries fast in the pan. | KB:chicken_cuts_basics.detail “Boneless skinless breast is convenience paid for twice, once at the register and again in how fast it dries”; KB:chicken_cuts_basics.short_answer “Bone-in, skin-on cuts cost less and cook better than boneless skinless.” |
| D16 | chicken_breast.buying_tips[3] | Bone-in and skin-on cook better than boneless skinless, which dries fast. | KB:chicken_cuts_basics.detail (the two quotes in D11 and D15) |
| D17 | rotisserie_chicken.detail (parenthetical) | (one store’s organic rotisserie chicken lists ‘organic chicken’ and nothing else) | rot:9 “ORGANIC CHICKEN\*.” (EWG, UPC 099482803568, ingredient list from the package); card sources (the EWG entry); D6 brand → plain words |
| D18 | turkey_whole.tier_note | A basted or self-basted bird was injected or marinated with a solution the label must name. | card short_answer “A basted or self-basted turkey has been injected or marinated with a solution. The solution and its ingredients must be identified on the label.” |
| D19 | turkey_whole.instead | A frozen whole turkey with no added-solution statement; frozen describes temperature history, not formulation. | card buying_tips[1] “A frozen whole turkey can be checked for the same added-solution statement.”; card detail “Fresh and frozen describe temperature history, so read the formulation on either bird.” |
| D20 | turkey_whole.why s2 | A plain bird is turkey with nothing added. | KS; card cart_pick “Whole turkey without added solution” |
| D21 | turkey_whole.kristy_take s2 | Fresh or frozen, the plain bird is the pick. | card pick_steps[2] “Choose fresh or frozen turkey without an injected basting solution.” |
| D22 | ground_turkey.tier_note | Ground turkey alone names no fat level, and a percent-lean claim must carry its percent fat. | card detail “The words ground turkey alone do not identify one fat level.”; card short_answer “a percent-lean claim must be accompanied by a percent-fat statement” |
| D23 | ground_turkey.instead | Plain ground turkey with no lean claim; compare packs by the Nutrition Facts fat line. | card buying_tips[1] “Without a percent-lean claim, use the Nutrition Facts fat line to compare packs.” |
| D24 | ground_turkey.why s2 | A plain pack is turkey with no seasoning or solution added. | card buying_tips[0] “Choose a formulation listing turkey without added seasonings or a flavoring solution.” |
| D25 | ground_turkey.kristy_take s2 | So read the fat line, and take the pack with nothing added. | card buying_tips[1] (fat line) + buying_tips[0] |
| E1 | ham.decision | Ham named just “Ham” first, then “Ham With Natural Juices.” | card short_answer "A ham labeled plain “Ham” must meet the highest protein level. “Water Added” and “Ham and Water Product” mean more added solution."; card detail "“Ham” needs at least 20.5% … “Ham With Natural Juices” needs at least 18.5%." (rung order = class order) |
| E2 | ham.tier_note | The product name tells how much water went in, and just “Ham” means the least. | card why "Its product name tells how much water the curing added."; card short_answer (plain “Ham” = highest level; the others "mean more added solution") |
| E3 | ham.instead | Fresh ham: the leg of pork itself, which needs cooking before eating. | card labels_decoded "Fresh ham": "Uncured leg of pork, prepared without nitrate or nitrite."; card watch_out 2 "Fresh ham and country ham are not fully cooked and need cooking before eating." |
| E4 | ham.cart_pick | Ham named just “Ham” | E1 first rung; form follows the existing cart_pick "A carton named “ice cream”" (KB) |
| E5 | hot_dogs.tier_note | Mechanically separated poultry is a paste-like product of tissue taken off bones, and the list must name it. | card short_answer "Mechanically separated poultry is a paste-like product, made by separating attached tissue from bones. Its name belongs in the ingredient statement."; card sources 9 CFR 381.173 |
| E6 | hot_dogs.instead | Fresh sausage from the butcher counter, its meat named and nothing mechanically separated. | meat:102-105 9 CFR 319.141 (https://www.law.cornell.edu/cfr/text/9/319.141): "'Fresh Pork Sausage' is sausage prepared with fresh pork … and may contain Mechanically Separated (Species)" (so the check carries over); card decision/pick_steps 1 (named meat, no mechanically separated); KS sideways move |
| E7 | turkey_bacon.decision | Turkey bacon with the fewest ingredients after the turkey. | KS (closest-to-nature, no new fact); card evidence_tier `kristys_standard`; card science "Each substance in a curing mixture … must be listed."; meat:121-122 9 CFR 317.17 "any substance mixed with another substance to cure a product must be identified in the ingredients statement" |
| E8 | turkey_bacon.tier_note | Turkey bacon is turkey meat pressed into bacon form, so fewer additions keep it closer to the meat. | card why "Turkey bacon is turkey meat seasoned and pressed into bacon form."; KS clause (no health claim) |
| E9 | turkey_bacon.instead | Pork bacon, the belly cut that “bacon” alone names on a US label. | card detail/science "Under US labeling, “bacon” alone means cured pork belly." (cure word omitted, statement narrowed, not changed); KS sideways move (whole cut over a pressed form, per card why) |
| E10 | turkey_bacon.cart_pick | Turkey bacon with the fewest ingredients | E7 first rung |
| E11 | deli_meat_uncured.instead | Whole roasted meat sliced thin does the same sandwich job with nothing added. | card buying_tips 4, verbatim |

This batch adds no number, statistic or source to a card. The URLs above are the ones already quoted in the archives they cite.

## Independent check script (admin-run; not part of the build)

Save as `/Users/m1/kristy/.pipeline/runs/ca-3b/counts.mjs`. It is the ca-3a script with these changes:
- `BATCH` = the 14 ids above;
- the section tally keeps every `section === 'meat'` hit (not only batch ids).

- BEFORE: `mkdir -p /Users/m1/kristy/.pipeline/runs/ca-3b && cd /Users/m1/kristy/server && node ../.pipeline/runs/ca-3b/counts.mjs > ../.pipeline/runs/ca-3b/before.json`
- AFTER: the same command into `after.json`, then `diff`.
- Expected AFTER:
  - 0 meat L1/L2/L4/L5 keys;
  - every changed cart_pick matches its own slug (chicken_breast → chicken_breast, not chicken_cuts_basics).

## Prerequisites

- Env: node ≥20, git, grep. No network. No Supabase writes (`--dry-run` only). No browser.
- ca-3a is built, critic SHIP, and committed at `aa12a3d`.
- k14 C12 was re-anchored to `719f9fe` inside `aa12a3d`. If the ca-3b KB change trips it again, main re-anchors it after the critic, as in ca-3a (C9 allows this one failure).
- Step 1 is complete (splice 2026-10-15).

## Answers

- **Reads and runtime:** `npm test` takes 1-3 minutes. Read only `owns`, `read_full`, and the 14 KB entries by id.
- **Do not edit:**
  - Any non-batch entry.
  - RETIRED, ESSENTIALS, TRY_POOL.
  - `sectionRules.json`.
  - `client/src`.
  - Any test not in `owns`.
- **Every string in Step 1 is final; copy it byte for byte.** A needed sentence that is not in this spec is a STOP.
- **STOP BLOCKED (quote the evidence) if:**
  - A pinned test outside `owns` fails (ic4achicken, ic4b, counterProbe48, counterDecision, ic5b, k9). The planner re-pins or rewrites; the builder never does.
  - listMatchProbe reports a wrong match.
  - A Step 1 row has no new text, or an old text is not found in the KB.
- **Limits:** no git writes. 60-minute cap. BLOCKED after 3 identical failures. Never delete an assertion.
- **Commit (admin):** `ca-3b: meat batch B, pork/poultry/cured fronts to D1, chicken_breast rewritten (D8, counterCards.js:159). Do lines table docs/do-lines-review.md → server/lib/doLines.json. Not migrated.`
- **Report, ≤30 lines:** READY or NOT READY; acceptance and npm counts; probe wrong count; dry-run deletes (expect 0); KEPT ids; any STOP.

## Open questions

1. The ic4achicken, ic4b and counterProbe48 pin contents were not read or run. Fragment D expects them to hold. If a chicken decision change breaks them, they join `owns` with exact re-pins.
2. The BRAND regex list was written by the planner, not from a corpus scan. The critic's Item 5 grep is the real gate.
3. L2 over KEPT text in the whole meat section was not hand-checked beyond the shared-set sentences: “Read each curing ingredient in the ingredients statement.” sits on 2 cards (turkey_bacon, cured_pork), and “whole-food standard” on 2 (hot_dogs, the ca-3a beef why). Both are under the 3-card threshold. The BEFORE run of counts.mjs shows any kept-text hit before dispatch.
4. The ham decision ends in `.”` (the period inside the closing quote). If lintCard requires a final ".", the planner moves the period outside the quote.
5. The `k15-src` URL may not be in the bacon or cured_pork `sources` arrays. Adding it is additive, and passRule allows that.
6. The deli front stays the cure sentence. Fragment E's option B (a version front) is not applied.

## Tried and rejected

- **Folding chicken_breast into chicken_cuts_basics.** D8's condition fails: counterCards.js:159 records the IC-4a type-veto reason, and S5 shows 8 live code readers.
- **Splitting the L2 "is the whole-food standard" fix across batches.** All six cards that hold it are in CA-3b, so one batch clears the group.
- **Fragment D's two `instead` strings verbatim.** They fail INSTEAD_HEDGED (chicken_cuts_basics) and INSTEAD_ECHOES_REFUSED (chicken_breast).
- **A cart_pick on deli_meat_uncured.** Dropped by admin rule. It may also pull toward a generic meat card in `matchItemToCard`.
