# ca-3a — Meat batch A: Beef front, Ground beef worked example + organ-blend fold, beef family fronts

```json
{
  "id": "ca-3a",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "docs/do-lines-review.md",
    "server/lib/doLines.json",
    "server/lib/counterCards.js",
    "server/lib/counterCardLint.js",
    "server/lib/tryPool.js",
    "server/lib/tryPool.test.js",
    "server/test/ktight.test.js",
    "server/test/acceptance/k9.test.js",
    "server/test/acceptance/k15.test.js",
    "server/test/acceptance/ic5b.test.js",
    "server/lib/perimeter.test.js",
    "server/lib/counterPath.test.js"
  ],
  "read_full": [
    "server/test/acceptance/passRule.js",
    "server/test/acceptance/ic5a.test.js",
    "docs/CARD-ALIGNMENT-PLAN.md",
    "docs/research/card-align-sources.md",
    "docs/research/meat-sources.md"
  ],
  "verify": "node --test server/test/acceptance/ca-3a.test.js && cd server && npm test; node scripts/listMatchProbe.js; node scripts/commitGuard.js; node scripts/migrateCounterCards.js --dry-run",
  "token_ceiling": 100000
}
```

Repo kristy, branch `main`. Plan approved 2026-10-14 on defaults Q1-Q3 (admin relay of Devon's go).

- Route: dv T2 (fallback forge@opus [T2]); critic@opus, FIDELITY required.
- P1. Parallel-safe: no (owns the KB, do lines and the meat test pins; ca-3b follows on top of this commit).
- Plan: `docs/CARD-ALIGNMENT-PLAN.md`, "CA-3 Meat batch", Inventory "Milestone 1, meat" (CA-3a rows), D1-D8, Accuracy gates A1/A3, the ground beef worked example, and the fold placement table. Scouts: `.pipeline/specs/ca-scouts.md` S2, S4, S5, S11.
- **Before dispatch:** the admin captures BEFORE with the independent check script below, at HEAD `8b49633`.

The fold exceeds 3 files on purpose (precedent chf-5 `e92e7c9`, plan line 319). After this batch, main re-anchors the k14 C12 passRule tripwire. Card commits say "Not migrated."

## Alignment block

- **Done means:**
  - **Ground beef (worked example).**
    - Given the KB after the build, when `ground_beef_lean_ratio` is read, then `decision`, `tier_note`, `instead`, `cart_pick`, `short_answer`, `why` and `pick_steps` equal the Step 1b strings byte for byte, and its do line equals "Read the label for organ names, each with a percentage beside it."
    - Every fold placement row holds (Step 1b table).
    - Its `labels_decoded` has no em-dash, and the 25 percent cheek-meat sentence is present.
  - **Fold.**
    - Given the KB, then `ground_beef_organ_blend` is absent and is listed in `RETIRED`.
    - Every alias, asked_as and source of the folded id is on `ground_beef_lean_ratio`.
    - TRY_POOL, OWNED_FACTS, ktight, k9, k15 and ic5b no longer name the retired id.
  - **Beef.**
    - Given the KB, then `beef_grassfed_vs_grainfed.decision` = "100% grass-fed or grass-finished, no added hormones, with a certifier’s seal."
    - Its `tier_note` holds the G1 gloss.
    - Its `cart_pick` = "100% grass-fed or grass-finished beef".
    - No beef field says ‘grass-fed’ allows a grain finish (gate A1 fallback).
  - **Step 1c.** Given the KB, then the eight Step 1c cards equal Step 1c byte for byte, every field not named equals `8b49633`, and the review headlines of the seven 1c cards with do rows equal their decisions with the do lines unchanged.
  - **Family.**
    - Given every batch id other than beef, bison, venison_game and lamb_goat, then `decision` and `cart_pick` do not match `/grass-(fed|finished)/i`.
    - `butcher_counter_asking.cart_pick` = "Beef soup bones from the butcher counter".
  - **D1.** Given every batch card (not pick), then: decision ≤14 words; tier_note is one sentence of 5-20 words; instead is non-empty; pick_steps has 1-3 items.
  - **Section lints.** Given the CA-5 meat tip with both flags on, then for batch ids: L1 = 0, L4 = 0, L5 = 0, and no L2 group made only of batch ids.
  - **Greps.** Given the changed copy fields of batch ids, then the brand, claim-lock and price greps are 0.
- **Out of scope:**
  - Section tips (CA-5).
  - CA-3b ids (pork, chicken, turkey, cured meats).
  - Seafood.
  - The k14 C12 re-anchor (main does it after the critic).
  - Migration.
- **OK rough edges:**
  - An id left unchanged because it already meets D1 is reported KEPT.
  - Ground beef `detail` grows long (fold detail plus the science overflow).
  - Certifier program names (American Grassfed, Certified Grassfed by AGW) stay on Beef's do line and detail; they are seal names, not food brands (Open question 2).
  - judging watch_out items 5 and 7 overlap its buying_tips; the organ POINTER also sits over chicken livers/hearts (Open question 7).
- **Ship bar:**
  - An untraced claim, or a numbered fact missing.
  - An organ_blend field without a destination.
  - A cart_pick that prints a shared term, or reads as before after a rung change.
  - An ESSENTIALS id retired or reordered.
  - A shortcut or perimeterId pointing at a deleted id.
  - A safety line deleted.
  - An em-dash or straight quote in a changed copy field.
  - A first-person word.
- **Independent check:** `counts.mjs` below, BEFORE at `8b49633` and AFTER the build:
  - the word counts per batch id;
  - the meat L1/L2/L4/L5 hit lists going to 0 for batch ids;
  - `grep -c ground_beef_organ_blend` over the S5 reference files going from 9 to 0 (except RETIRED and comments);
  - each changed cart_pick through `matchItemToCard` reporting its own slug.

## Steps (the change, old → new)

### 1. `server/kristy_perimeter_kb.json`

Fields not named stay byte-identical. Curly quotes only (‘ ’ “ ”). No em-dash in any changed string.

#### 1a. `beef_grassfed_vs_grainfed` (R)

| field | old | new |
| --- | --- | --- |
| decision | 100% grass-fed and grass-finished. | 100% grass-fed or grass-finished, no added hormones, with a certifier’s seal. |
| why | ‘Grass-fed’ allows a grain finish at the end. ‘Grass-finished’ is the whole-food standard. | The whole-food standard is grass after weaning, no grain, and no feedlot. |
| short_answer | ‘Grass-fed’ is a floor, not a standard. Cattle can graze most of their lives, eat feedlot grain for the last months, and still be labeled grass-fed. ‘Grass-finished’ or ‘100% grass-fed’ covers the whole life. That one is worth paying for. | On a beef label, ‘grass-fed’ alone rests on the producer. FSIS reads ‘100% grass-fed’ as grass after weaning, no grain, and pasture access. A certifier’s seal is what audits it. That one is worth paying for. |
| tier_note | Grass-fed alone does not promise a grass finish, so the whole-life words decide. | On a beef label, “grass-fed” is the producer’s own word unless a certifier’s seal audits it. |
| cart_pick | Grass-finished ground beef | 100% grass-fed or grass-finished beef |
| buying_tips[1] | Ground and chuck are the cheapest way into a whole-life grass animal. | Ground and chuck are the lowest-cost way into a whole-life grass animal. |
| science | (current) | FSIS reads a ‘grass-fed’ claim as grass after weaning, no grain, and pasture access. USDA withdrew its grass-fed claim standard in 2016, so the bare claim rests on the producer and any seal. The fat profile follows the finish, not the start. A grass finish leaves a leaner animal that dries out at feedlot-beef heat. Ground and chuck are the lowest-cost way into a whole-life grass animal. |
| labels_decoded "Grass-fed".meaning | Ate grass at some point. May still have been grain-finished before slaughter. | The producer’s own word unless a certifier’s seal audits it. FSIS reads it as grass after weaning, no grain. |

The tier_note holds the G1 gloss string `“grass-fed” is the producer’s own word unless a certifier’s seal audits it` byte-equal to `CANONICAL_GLOSSES` G1 (counterCardLint.js:1624). Gate A1 fallback (CA-1), named.

Kept byte-identical, with reasons:
- instead: non-empty, ≤24 words.
- pick_steps (3).
- watch_out (4).
- detail.
- kristy_take.
- labels "Grain-fed / grain-finished".
- The do line `Look for a whole-life seal: American Grassfed, or Certified Grassfed by AGW.`

Word counts: decision 11; tier_note 16; why 12; short_answer 36 (sentences 10/13/7/6); science 68 (≤70).

#### 1b. `ground_beef_lean_ratio` (R, fold survivor) ← `ground_beef_organ_blend` (F)

Front, worked example verbatim (plan "Worked example: ground beef"):

| field | new (byte-exact) | words |
| --- | --- | --- |
| decision | Organ blend with each organ’s percentage first, then ground beef with nothing added. | 13 |
| tier_note | Organ blends grind beef liver or heart into the meat; printed percentages show how much of each. | 17 |
| instead | Plain ground beef and a small piece of liver from the counter. The share is whatever goes in the pan. | 20 |
| cart_pick | Liver and heart beef blend, shares stated | 7 |
| do (doLines + review table) | Read the label for organ names, each with a percentage beside it. | 12 |
| pick_steps | ["How it was raised: see Beef.", "Organ blend: each organ named, each with its own percentage.", "Next: plain ground beef; skip “hamburger,” which allows added beef fat."] | 6/10/11 |
| why | Federal rules bar added water, binders, and extenders from anything sold as ‘ground beef’. Regulation keeps organs out of ‘ground beef’, so a blend needs its own name and a full ingredient list. Organs are part of eating the whole animal, and a blend puts them in a familiar grind. | 14/19/17 |
| short_answer | Pick an organ blend that prints each organ’s percentage, or ground beef with nothing added. How the cattle were raised is on the Beef card. | 25 |

Additive fields ("+" = appended after the existing items, existing items stay byte-identical):
- **watch_out:** old 2 items, then the fold's 3 items verbatim, in fold order. The survivor has no handling lines, so the fold items go last. 5 items.
- **buying_tips +:** "The product name will not say ‘ground beef’ alone; a blend has to carry its own descriptive name."
- **labels_decoded:**
  - The old `80/20, 85/15, 90/10` meaning becomes "Lean % to fat % by weight; higher first number = leaner." (em-dash → semicolon, words kept).
  - + `{"term": "Organ blend", "meaning": "Beef with liver, heart, or other organs mixed in, sold under its own descriptive name, not as ‘ground beef’."}`
  - + `{"term": "Hamburger", "meaning": "Chopped beef that may have beef fat added; ‘ground beef’ may not."}`
  - + the fold's `Ground beef` and `Ancestral blend / primal blend` objects, verbatim.
- **kristy_take:** "The name is the check: ‘ground beef’ allows no added fat, water or binders, and ‘hamburger’ may add fat. A blend that prints its numbers is an honest pack. One that will not is a mystery bag."
- **detail:** the old detail, then, in this order:
  - (i) the old `short_answer` verbatim;
  - (ii) the old `why` verbatim;
  - (iii) the fold `detail` verbatim, except its brand sentence, which becomes: "Two label examples: one blend states 8 percent organ meats (4 percent liver, 4 percent heart, 92 percent muscle); another states 92 percent ground beef, 5 percent liver, 3 percent heart."
  - (iv) the fold science sentences not already present, verbatim: "A blend carries its own descriptive name and a full ingredient list." and "By NIH figures, 3 ounces of pan-fried beef liver holds more than twice the adult daily vitamin A upper intake." and "Producers print shares such as 8 percent organ, or 5 percent liver plus 3 percent heart."
  - **Fallback named:** fold-table science row, "science passes 70 words → detail +". The survivor science is 58 words.
- **science:** kept byte-identical.
- **aliases:** old 6, then the fold's 9 in fold order, deduped.
- **asked_as:** old 5, then the fold's 4.
- **sources:** old 2, then the fold's 5 verbatim (D1 exception; producer pages stay as citations, Q2).
- **title, evidence_tier (`established`), category, eyebrow_short, id:** kept.

Fold placement table (plan, verbatim intent; every row must hold):

| fold field | destination | form |
| --- | --- | --- |
| decision | front rung 1 + watch_out item 3 | both halves already said |
| why (name rule) | why sentence 2 | verbatim |
| short_answer | labels_decoded Ground beef (cheek meat), why sentence 2 (own name), pick_steps 2 (each a share) | placed |
| tier_note | why sentence 2 + pick_steps 2 | placed |
| instead | instead | verbatim |
| cart_pick | cart_pick | verbatim |
| buying_tips 1 / 2 / 3 | pick_steps 2 / buying_tips + / pick_steps 1 (POINTER already there) | placed / verbatim / present |
| watch_out 1–3 | watch_out + | verbatim |
| pick_steps 1 / 2 | pick_steps 2 / watch_out item 3 | rephrased / same sentence |
| science | detail + (fallback: science overflow) | verbatim |
| detail | detail + | verbatim except the D6 sentence above |
| labels_decoded (2) | labels_decoded | verbatim |
| kristy_take | kristy_take + | rephrased |
| sources (5) | sources + | verbatim |
| aliases, asked_as | aliases +, asked_as + | verbatim, deduped |
| id | RETIRED + delete | — |
| title, eyebrow_short, evidence_tier, category | not moved | survivor keeps its own |

The vitamin A number stays in detail (6,582 mcg RAE per 3 ounces vs adult UL 3,000 mcg). The grass-fed standard is not printed on this card. Then delete the `ground_beef_organ_blend` entry.

#### 1c. Remaining CA-3a cards

Same rules as 1a/1b: fields not named stay byte-identical to `8b49633`; curly quotes only; no em-dash. Word counts are whitespace tokens. The acceptance test (C12) holds every string below byte for byte.

##### 1c-i. `beef_cuts_basics` ("Steak") (R, front kept)

| field | old | new |
| --- | --- | --- |
| instead | (absent) | Loin or rib cuts, whole, with no ‘mechanically tenderized’ in the name. |

Kept byte-identical, with reasons:
- decision "Chuck or round, whole, with no needles or blades pushed through." [11]: already D1; counterDecision.test.js:173 pins "Chuck" in the first 3 words.
- tier_note [17], one sentence; it carries the term bridge from "needles or blades" to ‘mechanically tenderized’.
- cart_pick "Whole chuck, not mechanically tenderized": agrees with the front; no shared term (L5).
- pick_steps (3): already holds the POINTER "How it was raised: see Beef.".
- watch_out (7), byte-identical on purpose (Open question 1, option (a)). Item 5 ("‘Angus’ on a package is not a grade. Certified Angus Beef is a brand with its own checklist. ...") is a folded `beef_grades_usda` sentence that ic5a C5 requires verbatim, and any edit to this field makes C8's BRAND regex (`certified angus`) fire on the whole field. D6 exception, named.
- buying_tips, labels_decoded (prime/choice/select stay for ic5a :88), why, short_answer, detail, kristy_take, sources, aliases.
- do line "Read the name for “mechanically tenderized” before the cut name." and review row :44: unchanged (decision unchanged).

Word counts: decision 11; tier_note 17; instead 12; pick_steps 11/6/9.

##### 1c-ii. `organ_meats` (R, front kept; K15 id)

| field | old | new |
| --- | --- | --- |
| tier_note | The 1 to 2 day cook window and 160°F come from USDA handling guidance for organ meats. | Organ meats keep a shorter time in the refrigerator than steaks and roasts. |
| instead | (absent) | A beef blend with liver and heart ground in, each with its percentage printed. |
| pick_steps | ["Buy only for a cook within one to two days.", "Match each organ to its method; heart and tongue go in liquid."] | ["Ask the counter or a farmer which organs they offer.", "How it was raised: see Beef.", "Match each organ to its method; heart and tongue go in liquid."] |

Reasons:
- tier_note: the old line named where the numbers came from, not why this version. "1 to 2" and "160°F" stay in short_answer and science (passRule numbers survive); the USDA source stays in sources.
- instead: the sideways move to a different food, the Ground beef card's best rung (organ blend with printed shares). No grass term; no 5-word run with tip check 2.
- pick_steps: step 1 restated the front and is already in buying_tips[0], so it gives way; buying_tips[1] moves up verbatim; the POINTER is added per D2 rule 3.

Kept byte-identical, with reasons:
- decision "Organ meats bought for a cook within one to two days." [10]: already D1; no traced quality rung among organs exists in the KB.
- cart_pick "Organ meat for a cook within two days": agrees with the front.
- watch_out (1): the pregnancy → doctor safety line, verbatim.
- why, short_answer, detail, science, kristy_take, buying_tips, labels_decoded.
- sources, aliases, asked_as: K15 id, nothing added.
- do line "Check the use-by date against the night it will be cooked." and review row :139 unchanged.

Word counts: decision 10; tier_note 13; instead 14; pick_steps 10/6/12.

##### 1c-iii. `judging_meat_at_the_case` (★ essential, R)

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
- decision: the front names something only the package shows. The color fact moves verbatim to watch_out 6. No seal/leak/smell word in the front, so OBSERVABLE_IN_BOTH finds no shared distinctive term with the do line ("packaged" ≠ "package"; `termsOf` has no stemming).
- tier_note: the why for the date. The old tier_note is dropped, not moved: 22 words, may not be reworded, and its content is already in `why` and kristy_take.
- instead: the next pick when the newest tray is not there; the vacuum figure is already on the card (watch_out 1).
- pick_steps: step 1 glosses the front's label term; the slime/smell safety step moves verbatim to watch_out 7 (never deleted).

Kept byte-identical, with reasons:
- No `cart_pick` field exists on this card; none is added.
- why, short_answer, detail, science, kristy_take, buying_tips, labels_decoded ("Sell-by date" stays for ic5a :90), sources, aliases, asked_as, eyebrow_short.
- do line "Check the package is sealed and not leaking juices, then smell it." unchanged; review row :75 headline cell → the new decision.

Word counts: decision 11; tier_note 17; instead 13; pick_steps 8/13.

##### 1c-iv. `butcher_counter_asking` (R)

| field | old | new |
| --- | --- | --- |
| decision | Ask the butcher how it was raised and when it was cut. | Ask for beef soup bones, and a whole chuck ground fresh. |
| tier_note | Asking how it was raised and when it was cut is a shopping habit, not a meat claim. | Soup bones come from the counter, and a whole chuck ground fresh lets the shopper choose the cut. |
| instead | (absent) | A whole chuck roast, cut, tied or boned to order at the counter. |
| cart_pick | Grass-finished beef soup bones | Beef soup bones from the butcher counter |
| pick_steps | ["Ask for a whole chuck ground fresh, which lets you choose the cut.", "How it was raised: see Beef.", "Ask them to portion it; cutting, tying and boning are usually included."] | ["Soup bones: ask for marrow or knuckle bones.", "How it was raised: see Beef.", "Ask them to portion it; cutting, tying and boning are usually included."] |

Reasons:
- decision: the old front was tip check 1 in other words. The new front is what only this counter hands over. No 5-word run with check 1. Shares only "ask"/"and" with the do line (not distinctive).
- tier_note: the why for both halves of the front.
- instead: sideways, the same cut kept whole and cut to order.
- cart_pick: plan string. Prints no shared term (L5, C7).
- pick_steps: step 1 restated the new front, so it becomes the soup-bone gloss; "which lets you choose the cut" stays in tier_note and buying_tips[1]. The POINTER stays (C7).

Kept byte-identical, with reasons:
- why, short_answer, detail, science, kristy_take, watch_out (4), labels_decoded ([]), sources, aliases, asked_as.
- buying_tips, including [3] "Ask for bones and trim. Often cheap or free." (Open question 6).
- do line "Ask what came in today and when it was cut." unchanged; review row :76 headline cell → the new decision.

Word counts: decision 11; tier_note 18; instead 13; cart_pick 7; pick_steps 8/6/12.

##### 1c-v. `bison` (R; K15 id)

| field | old | new |
| --- | --- | --- |
| decision | Bison bought by its inspection mark, then handled like beef. | 100% grass-fed or grass-finished bison, with an inspection mark. |
| tier_note | The inspection mark and storage times are FSIS guidance for bison sold in stores. | Many bison finish on grain; “grass-fed” is the producer’s own word unless a certifier’s seal audits it. |
| instead | (absent) | Bison labeled grass-fed with no seal; it may have eaten grain for its last 90 to 120 days. |
| cart_pick | Bison with an inspection mark | 100% grass-fed or grass-finished bison |

Lint notes: L4, the decision matches G1 (meat scope) and the tier_note carries the G1 gloss verbatim. L5(b), the whole decision is the first rung and the cart_pick prints the G1 term. OBSERVABLE_IN_BOTH: the do line shares "inspection" (one distinctive term, unquoted) and "mark" (4 letters, below MIN_DISTINCTIVE 6), so `sharedObservables` returns [].

Kept byte-identical, with reasons:
- why, short_answer, detail, science, kristy_take, buying_tips (4), watch_out (1), labels_decoded (2): the grain-finish fact (detail) traces the new tier_note and instead.
- pick_steps (2): the inspection-mark step glosses the front's second half.
- sources, aliases, asked_as, title, category, evidence_tier, question.
- do line "Find the triangle inspection seal or a state mark on the package." unchanged (headline 9 + do 12 = 21 ≤ 28); review row :140 headline cell → the new decision.

Word counts: decision 9; tier_note 17; instead 18; cart_pick 5.

##### 1c-vi. `venison_game` (R; K15 id)

| field | old | new |
| --- | --- | --- |
| tier_note | Refrigerated processing and fat trimming are extension steps written for deer and elk venison. | Game is often processed by small shops, so cold handling at every step decides its safety. |
| instead | (absent) | Wrapped frozen venison from the same refrigerated processor; it keeps 9 to 12 months frozen. |

Reason for the tier_note change: the old one names its source, not the why (D1).

Kept byte-identical, with reasons:
- decision "Venison from a fully refrigerated processor, trimmed of its fat." [10]: meets D1. No grass term: no source in either archive covers deer diets, and AGW Certified Grassfed names beef, sheep, goats and bison, not deer (CA-2:2).
- cart_pick "Venison from a refrigerated processor".
- pick_steps (2).
- Safety (CWD), never deleted: detail (CWD sentences), watch_out 2 ("Skip the brain, spinal cord, eyes, spleen and lymph nodes of deer and elk."), science, labels_decoded "CWD".
- why, short_answer, kristy_take, buying_tips, watch_out 1, labels_decoded "Aging", sources, aliases, asked_as, title, category, evidence_tier, question.
- do line "Ask whether each animal was handled separately and kept cold throughout." and review row :141 unchanged.

Word counts: tier_note 16; instead 15.

##### 1c-vii. `lamb_goat` (R; K15 id)

| field | old | new |
| --- | --- | --- |
| decision | Read lamb and goat for how they were raised, then anything added. | 100% grass-fed or grass-finished lamb or goat. |
| tier_note | Lamb grades and the absence of goat grades are USDA facts, and the flesh checks follow from them. | Grass seals cover sheep and goats, and “grass-fed” is the producer’s own word unless a certifier’s seal audits it. |
| instead | (absent) | Graded lamb, or goat that is firm and fine-grained, when no grass seal is on the shelf. |
| cart_pick | Lamb or goat, firm with white fat | 100% grass-fed or grass-finished lamb |

Reasons:
- The old decision was an instruction that restated tip check 1's principle; the new front is the label words.
- The old cart_pick "firm with white fat" sat beside a grass front; grass-finished fat is not promised white (bison detail: grain finishing "because many shoppers prefer white fat"), so the flesh check stays in pick_steps 3 and buying_tips.
- INSTEAD_HEDGED reads only the first clause ("Graded lamb"), which carries no conditional.

Kept byte-identical, with reasons:
- pick_steps (3): step 1 POINTER "How it was raised: see “Grass-fed” (the label).", step 2 POINTER "Added solution: see Pork cuts and ‘solution added’ pork.", step 3 the goat flesh check.
- why, short_answer, detail, science, kristy_take, buying_tips (3), watch_out (2), labels_decoded (3).
- sources, aliases (incl. the K15 C8 pick_lamb aliases), asked_as (K15 C10), title, category, evidence_tier, question.
- do line "Press goat for firm, fine-grained flesh and white fat." unchanged (headline 7 + do 9 = 16); review row :138 headline cell → the new decision.

Word counts: decision 7; tier_note 19; instead 17; cart_pick 5.

##### 1c-viii. `pick_soup_bones` (R; K15 pick)

| field | old | new |
| --- | --- | --- |
| decision | Ask the meat counter which soup bones it carries and how the animal was raised. | Soup bones come from the meat counter; ask for marrow or knuckle bones. |

Reasons:
- The raising half is the meat tip's principle (tip check 1, D2 rule 1); the pick keeps only the item.
- No cart_pick (`PICK_FORBIDDEN_FIELDS`).
- lintPick: one sentence ending in a period, 13 words ≤ 16, no digit, no first person, no em-dash, no question mark.

Kept byte-identical: kind, title, category, aliases (5; "marrow bones" and "knuckle bones" trace the new line), sources (1).

Word count: decision 13.

### 2. `docs/do-lines-review.md` → `server/lib/doLines.json`

- Delete row :41 (`ground_beef_organ_blend`).
- Row :43 (beef): the headline cell becomes the new beef decision; the do cell is unchanged.
- Row :45 (lean_ratio): the headline cell becomes the new decision; the do cell becomes `Read the label for organ names, each with a percentage beside it.`
- Row :75 (`judging_meat_at_the_case`): the headline cell becomes `The pack with the newest ‘packaged on’ date in the case.`; the do cell is unchanged (headline 11 + do 12 = 23).
- Row :76 (`butcher_counter_asking`): the headline cell becomes `Ask for beef soup bones, and a whole chuck ground fresh.`; the do cell is unchanged (11 + 10 = 21).
- Row :138 (`lamb_goat`): the headline cell becomes `100% grass-fed or grass-finished lamb or goat.`; the do cell is unchanged (7 + 9 = 16).
- Row :140 (`bison`): the headline cell becomes `100% grass-fed or grass-finished bison, with an inspection mark.`; the do cell is unchanged (9 + 12 = 21).
- Rows :44 (beef_cuts_basics), :139 (organ_meats), :141 (venison_game): untouched (decisions unchanged).
- Leave :242 (historical notes row).
- Regenerate with `node server/scripts/buildDoLines.js`; commit both. ic5b C5 needs `reviewHeadline(id) === e.decision`.

### 3. `server/lib/counterCards.js`

Before `];` at :177, insert:
```
  // CA-3a (2026-10-15): → ground_beef_lean_ratio ("Ground beef"). Fold placement per docs/CARD-ALIGNMENT-PLAN.md; aliases, asked_as, sources, tips and labels moved.
  'ground_beef_organ_blend',
```
ESSENTIALS (:259-267) untouched.

### 4. `server/lib/counterCardLint.js`

:1550 `    ['ground_beef_lean_ratio', 'ground_beef_organ_blend', 'beef_cuts_basics',` → `    ['ground_beef_lean_ratio', 'beef_cuts_basics',`. No other line changes.

### 5. `server/lib/tryPool.js` and `server/lib/tryPool.test.js`

- tryPool.js :5 `  'ground_beef_organ_blend',` → `  'ground_beef_lean_ratio',`. STOP BLOCKED if lean_ratio is already in the pool.
- tryPool.test.js :37 first id → `'ground_beef_lean_ratio'`; the count stays 19.

### 6. Test pins

- **ktight.test.js:**
  - :14 drop `'ground_beef_organ_blend', ` from B03.
  - :32 `B03: 11` → `B03: 10`.
  - :37 `182` → `181`.
  - :40 `181` → `180`.
- **k9.test.js:**
  - :18 drop `'ground_beef_organ_blend', `.
  - :20 `9` → `8`.
- **k15.test.js:42:** each `'ground_beef_organ_blend'` target → `'ground_beef_lean_ratio'`.
- **ic5b.test.js:**
  - :20 drop `'ground_beef_organ_blend', `.
  - :39 → `assert.equal(b.decision, '100% grass-fed or grass-finished, no added hormones, with a certifier’s seal.');`
  - :40 → `assert.ok(b.tier_note.includes('“grass-fed” is the producer’s own word unless a certifier’s seal audits it'));`
  - :87 → `const was = new Set([...urls(pre(id)), ...(id === 'ground_beef_lean_ratio' ? FOLD_URLS : [])]);`, with `const FOLD_URLS = [...]` (the 5 organ-blend source URLs, verbatim from the pre-build KB) declared after :26. These URLs moved; they are not new.
  - :47 → `  assert.match(now('judging_meat_at_the_case').decision, /packaged on/i, 'judging front lost its package fact');` (the judging front changes in 1c-iii).
- **perimeter.test.js** (test 'cart_pick is a grocery name, never a claim, a price or a sentence', :207-222; the beef, bison and lamb cart_picks open with "100%"):
  - :213 `    assert.ok(p.trim().length > 2 && p.length <= 44, \`${e.id}: "${p}" is not a cart row\`);` → the same line with `p.length <= 46`.
  - :214 `    assert.doesNotMatch(p, /[$£€%]/, \`${e.id} carries a price or percent\`);` → `    assert.doesNotMatch(p.replace(/^100% /, ''), /[$£€%]/, \`${e.id} carries a price or percent\`);`
- **counterPath.test.js** (test 'a shortcut answer can become a cart item in the same tap-and-tap', :94-106; it runs over shortcut entries, and `beef_grassfed_vs_grainfed` is a meat shortcut at server/lib/perimeter.js:328):
  - :104 `    assert.doesNotMatch(e.cart_pick, /[$£€%]/, \`${e.id} pick carries a price\`);` → `    assert.doesNotMatch(e.cart_pick.replace(/^100% /, ''), /[$£€%]/, \`${e.id} pick carries a price\`);`
- No other server test pins an old decision, headline, tier_note or cart_pick string of a ca-3a card (planner grep of server/test and server/lib tests; counterDecision.test.js :85-89/:173, ic5a :88/:90, ic1.test.js:29 synthetic, listVoice.test.js:116-118, paidBoundary.test.js, counterCardLint.test.js:404-407 checked and kept).

## Criteria

- C1 [test] Ground beef front equals the worked example: decision, tier_note, instead, cart_pick, short_answer, why, pick_steps and the do line, byte-exact.
- C2 [test] Ground beef additive fields: the watch_out order (old 2 + fold 3); buying_tips +; the four new or kept labels, with no em-dash; kristy_take; detail holding the D6 sentence, "25 percent", "9 CFR 317.2", "6,582 mcg RAE", "3,000 mcg", and no producer names.
- C3 [test] The fold is complete: organ_blend absent and in RETIRED; its aliases, asked_as and sources are on lean_ratio; assertPassRule holds for every batch id vs `8b49633`.
- C4 [test] The Beef front: decision, G1 gloss in tier_note, cart_pick; why keeps "whole-food standard"; no "allows a grain finish" in why/short_answer/science/labels.
- C5 [test] Plan cart_picks: butcher equals "Beef soup bones from the butcher counter".
- C6 [test] D1 limits on every batch card.
- C7 [test] No grass term in decision or cart_pick for non-ruminant-front batch ids; lean_ratio and butcher carry the POINTER.
- C8 [test] Brand, claim-lock and price greps over changed copy fields of batch ids = 0, and ≥10 fields changed.
- C9 [test] lintSections with the CA-5 meat tip, flags on: no L1/L4/L5 hit on a batch id; no L2 group made only of batch ids.
- C10 [test] Plumbing: TRY_POOL[0] is lean_ratio with no organ_blend; OWNED_FACTS does not name organ_blend; lintCard, readability and lintPickSteps are clean for lean_ratio and beef with their do lines.
- C11 Server `npm test` green (count reported), listMatchProbe 0 wrong, commitGuard clean, migrate dry-run shows exactly `ground_beef_organ_blend` deleted plus this batch's upserts.
- C12 [test] Step 1c cards equal the spec byte for byte: named fields equal Step 1c, every other field equals `8b49633`, judging watch_out is the 7-item order; review headline equals decision and the do line is unchanged for the seven 1c cards with do rows.

## Contract

```json
{"criteria":[
 {"id":"C1","impl":["server/kristy_perimeter_kb.json","docs/do-lines-review.md","server/lib/doLines.json"],"tests":["server/test/acceptance/ca-3a.test.js"],"dependents":["server/routes/perimeter.js","server/lib/listMatch.js","server/lib/counterCardLint.js","server/test/acceptance/ic5b.test.js","server/test/acceptance/k9.test.js"],"allowed_reads":["docs/CARD-ALIGNMENT-PLAN.md"],"expected":"7 fields + do line byte-equal to the worked example","test_name":"C1 Ground beef front equals the worked example"},
 {"id":"C2","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3a.test.js"],"dependents":["server/routes/perimeter.js"],"allowed_reads":["docs/CARD-ALIGNMENT-PLAN.md"],"expected":"watch_out 5 in order; labels 5 with no em-dash; detail holds the numbered facts and no producer names","test_name":"C2 Ground beef additive fields hold every fold fact"},
 {"id":"C3","impl":["server/kristy_perimeter_kb.json","server/lib/counterCards.js"],"tests":["server/test/acceptance/ca-3a.test.js"],"dependents":["server/lib/counterReach.test.js","server/test/acceptance/passRule.js","server/test/acceptance/k15.test.js","server/test/acceptance/ic5b.test.js","server/test/acceptance/k14.test.js"],"allowed_reads":["server/test/acceptance/passRule.js"],"expected":"organ_blend absent and RETIRED; aliases/asked_as/sources superset; passRule ok","test_name":"C3 the organ-blend fold is complete and the pass rule holds"},
 {"id":"C4","impl":["server/kristy_perimeter_kb.json","docs/do-lines-review.md"],"tests":["server/test/acceptance/ca-3a.test.js"],"dependents":["server/test/acceptance/ic5b.test.js","server/test/counterDecision.test.js"],"allowed_reads":["server/lib/counterCardLint.js"],"expected":"beef decision/cart_pick equal plan; G1 gloss present; no grain-finish line","test_name":"C4 the Beef front carries G1 and drops the grain-finish line"},
 {"id":"C5","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3a.test.js"],"dependents":["server/routes/perimeter.js","server/lib/listMatch.js"],"allowed_reads":[],"expected":"butcher cart_pick equals the plan string","test_name":"C5 plan cart_picks are byte-equal"},
 {"id":"C6","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3a.test.js"],"dependents":["server/test/acceptance/ic5b.test.js"],"allowed_reads":[],"expected":"every batch card within D1 limits","test_name":"C6 D1 limits hold on every batch card"},
 {"id":"C7","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3a.test.js"],"dependents":["server/lib/counterCardLint.js"],"allowed_reads":[],"expected":"0 grass matches outside beef/bison/venison/lamb fronts; POINTER present","test_name":"C7 only ruminant fronts print a grass term"},
 {"id":"C8","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3a.test.js"],"dependents":[],"allowed_reads":[],"expected":"0 brand/claim/price hits; >=10 changed fields","test_name":"C8 brand claim and price greps are zero over changed copy fields"},
 {"id":"C9","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3a.test.js"],"dependents":["server/lib/counterCardLint.test.js"],"allowed_reads":["server/lib/counterCardLint.js"],"expected":"0 L1/L4/L5 hits on batch ids; no all-batch L2 group","test_name":"C9 meat section lints are clean for batch ids"},
 {"id":"C10","impl":["server/lib/tryPool.js","server/lib/counterCardLint.js","server/lib/doLines.json"],"tests":["server/test/acceptance/ca-3a.test.js","server/lib/tryPool.test.js"],"dependents":["server/lib/tryPool.test.js","server/test/ktight.test.js","server/test/acceptance/k9.test.js","server/lib/counterCardLint.test.js","server/test/acceptance/ic5b.test.js"],"allowed_reads":[],"expected":"pool and owned-facts repointed; per-card lints []","test_name":"C10 plumbing repointed and per-card lints clean"},
 {"id":"C11","impl":["server/test/ktight.test.js","server/test/acceptance/k9.test.js","server/test/acceptance/k15.test.js","server/test/acceptance/ic5b.test.js","server/lib/perimeter.test.js","server/lib/counterPath.test.js"],"tests":["server/test/ktight.test.js","server/test/acceptance/k9.test.js","server/test/acceptance/k15.test.js","server/test/acceptance/ic5b.test.js","server/lib/perimeter.test.js","server/lib/counterPath.test.js"],"dependents":["server/test/acceptance/k14.test.js"],"allowed_reads":[],"expected":"npm test green except the k14 C12 anchor tripwire main re-anchors; probe 0 wrong; commitGuard clean; dry-run deletes only ground_beef_organ_blend"},
 {"id":"C12","impl":["server/kristy_perimeter_kb.json","docs/do-lines-review.md","server/lib/doLines.json"],"tests":["server/test/acceptance/ca-3a.test.js"],"dependents":["server/test/acceptance/ic5b.test.js","server/test/acceptance/ic5a.test.js","server/lib/perimeter.test.js","server/lib/counterPath.test.js"],"allowed_reads":["server/test/acceptance/ic5a.test.js"],"expected":"8 cards equal Step 1c; other fields equal 8b49633; review headlines equal decisions; do lines unchanged","test_name":"C12 Step 1c cards equal the spec"}
],
"dependency_evidence":[
 {"owned":"server/kristy_perimeter_kb.json","imports":["server/routes/perimeter.js:145","server/routes/perimeter.js:274","server/routes/perimeter.js:410","server/lib/listMatch.js:202","server/lib/listMatch.js:229","Tools/listvocab/build.js:43","server/lib/perimeter.test.js:208 (cart_pick names)","server/lib/counterPath.test.js:104 (shortcut cart_pick)"],"tests":["server/test/acceptance/passRule.js","server/test/acceptance/ic5b.test.js","server/lib/perimeter.test.js","server/lib/counterPath.test.js"],"source":".pipeline/specs/ca-scouts.md S11 (cart_pick readers), S4"},
 {"owned":"server/lib/counterCards.js","imports":["server/scripts/migrateCounterCards.js:213","server/test/acceptance/k14.test.js:151","server/test/acceptance/ic5b.test.js:8"],"tests":["server/test/acceptance/ca-3a.test.js","server/test/acceptance/ic5b.test.js"],"source":".pipeline/specs/ca-scouts.md S4 (RETIRED :92, ESSENTIALS :259-267, --dry-run :213)"},
 {"owned":"server/lib/counterCardLint.js","imports":["server/test/acceptance/ic5b.test.js:9","server/test/acceptance/passRule.js:3","server/lib/counterCardLint.test.js:419"],"tests":["server/test/acceptance/ic5b.test.js"],"source":".pipeline/specs/ca-scouts.md S5 (OWNED_FACTS :1550), S2"},
 {"owned":"server/lib/tryPool.js","imports":["server/lib/tryPool.test.js:37 (TRY_POOL pin)"],"tests":["server/lib/tryPool.test.js"],"source":".pipeline/specs/ca-scouts.md S5 (tryPool.js:5)"},
 {"owned":"server/lib/doLines.json","imports":["server/test/acceptance/ic5b.test.js:11"],"tests":["server/test/acceptance/ic5b.test.js"],"source":".pipeline/specs/ca-scouts.md S5 (doLines.json:65)"},
 {"owned":"docs/do-lines-review.md","imports":["server/scripts/buildDoLines.js","server/test/acceptance/ic5b.test.js:29"],"tests":["server/test/acceptance/ic5b.test.js"],"source":"CLAUDE.md do lines table docs/do-lines-review.md → scripts/buildDoLines.js"}
],
"env":{"executables":["node","git","grep"],"browsers":[],"temp":"/Users/m1/kristy/.pipeline/runs/ca-3a","network":false}}
```

## Acceptance server/test/acceptance/ca-3a.test.js

```js
// Written by the planner; do not edit.
// ca-3a: docs/CARD-ALIGNMENT-PLAN.md "CA-3 Meat batch"; worked example and fold table verbatim.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as lint from '../../lib/counterCardLint.js';
import * as pass from './passRule.js';
import { RETIRED, projectEntry } from '../../lib/counterCards.js';
import { TRY_POOL } from '../../lib/tryPool.js';

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ROOT = join(SERVER, '..');
const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
const doLines = JSON.parse(readFileSync(join(SERVER, 'lib', 'doLines.json'), 'utf8'));
const review = readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8');
const reviewHeadline = (id) => {
  const line = review.split('\n').find((l) => l.startsWith(`| \`${id}\` |`));
  return line ? line.split('|')[3].trim() : null;
};
const PRE = JSON.parse(execFileSync('git', ['show', '8b49633:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const now = (id) => kb.entries.find((e) => e.id === id);
const pre = (id) => PRE.entries.find((e) => e.id === id);
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const flat = (r) => (Array.isArray(r) ? r : (r && r.violations) || []);
const RETIRED_IDS = new Set([...(RETIRED || [])].map((r) => (typeof r === 'string' ? r : r.id)));
const run = (tips, entries) => lint.lintSections(tips, entries);

const BATCH = ['beef_grassfed_vs_grainfed', 'ground_beef_lean_ratio', 'beef_cuts_basics', 'organ_meats', 'butcher_counter_asking',
  'judging_meat_at_the_case', 'bison', 'venison_game', 'lamb_goat', 'pick_soup_bones'];
const RUMINANT_FRONTS = new Set(['beef_grassfed_vs_grainfed', 'bison', 'venison_game', 'lamb_goat']);
const MEAT_TIP = { section: 'meat', rule: 'A local butcher comes first; at the case, choose meat from animals raised on grass and open pasture.', checks: ['Ask what the animal ate and how it lived; a butcher counter can answer.', 'Organs come from the same animal; liver and heart belong in the cart too.', 'On packaged meat, look for an ingredient list of meat, salt, and spices.'] };
const G1 = '“grass-fed” is the producer’s own word unless a certifier’s seal audits it';
const POINTER = 'How it was raised: see Beef.';
const COPY_SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'category', 'evidence_tier']);
const BRAND = /force of nature|seven sons|certified angus|whole foods|tyson|perdue|hormel|oscar mayer|applegate/i;
const CLAIM = /healthier|healthiest|better for you|lowers|exposure|protein|calorie/i;
const PRICE = /\bcheapest\b|\bprice\b|\$[0-9]/i;

const LEAN = {
  decision: 'Organ blend with each organ’s percentage first, then ground beef with nothing added.',
  tier_note: 'Organ blends grind beef liver or heart into the meat; printed percentages show how much of each.',
  instead: 'Plain ground beef and a small piece of liver from the counter. The share is whatever goes in the pan.',
  cart_pick: 'Liver and heart beef blend, shares stated',
  short_answer: 'Pick an organ blend that prints each organ’s percentage, or ground beef with nothing added. How the cattle were raised is on the Beef card.',
  why: 'Federal rules bar added water, binders, and extenders from anything sold as ‘ground beef’. Regulation keeps organs out of ‘ground beef’, so a blend needs its own name and a full ingredient list. Organs are part of eating the whole animal, and a blend puts them in a familiar grind.',
  pick_steps: ['How it was raised: see Beef.', 'Organ blend: each organ named, each with its own percentage.', 'Next: plain ground beef; skip “hamburger,” which allows added beef fat.'],
};
const LEAN_DO = 'Read the label for organ names, each with a percentage beside it.';
const D6_SENTENCE = 'Two label examples: one blend states 8 percent organ meats (4 percent liver, 4 percent heart, 92 percent muscle); another states 92 percent ground beef, 5 percent liver, 3 percent heart.';

// Step 1c: the named fields per card; every other field stays as at 8b49633.
const SPEC_1C = {
  beef_cuts_basics: {
    instead: 'Loin or rib cuts, whole, with no ‘mechanically tenderized’ in the name.',
  },
  organ_meats: {
    tier_note: 'Organ meats keep a shorter time in the refrigerator than steaks and roasts.',
    instead: 'A beef blend with liver and heart ground in, each with its percentage printed.',
    pick_steps: ['Ask the counter or a farmer which organs they offer.', 'How it was raised: see Beef.', 'Match each organ to its method; heart and tongue go in liquid.'],
  },
  judging_meat_at_the_case: {
    decision: 'The pack with the newest ‘packaged on’ date in the case.',
    tier_note: 'Fresh tray-wrapped meat keeps up to three days refrigerated after packaging, so that date sets the clock.',
    instead: 'A well-sealed vacuum pack, which keeps up to seven days refrigerated from purchase.',
    pick_steps: ['‘Packaged on’: the packing day, not a safety cutoff.', 'Take a sealed, leak-free package from the back, where the case is coldest.'],
  },
  butcher_counter_asking: {
    decision: 'Ask for beef soup bones, and a whole chuck ground fresh.',
    tier_note: 'Soup bones come from the counter, and a whole chuck ground fresh lets the shopper choose the cut.',
    instead: 'A whole chuck roast, cut, tied or boned to order at the counter.',
    cart_pick: 'Beef soup bones from the butcher counter',
    pick_steps: ['Soup bones: ask for marrow or knuckle bones.', 'How it was raised: see Beef.', 'Ask them to portion it; cutting, tying and boning are usually included.'],
  },
  bison: {
    decision: '100% grass-fed or grass-finished bison, with an inspection mark.',
    tier_note: 'Many bison finish on grain; “grass-fed” is the producer’s own word unless a certifier’s seal audits it.',
    instead: 'Bison labeled grass-fed with no seal; it may have eaten grain for its last 90 to 120 days.',
    cart_pick: '100% grass-fed or grass-finished bison',
  },
  venison_game: {
    tier_note: 'Game is often processed by small shops, so cold handling at every step decides its safety.',
    instead: 'Wrapped frozen venison from the same refrigerated processor; it keeps 9 to 12 months frozen.',
  },
  lamb_goat: {
    decision: '100% grass-fed or grass-finished lamb or goat.',
    tier_note: 'Grass seals cover sheep and goats, and “grass-fed” is the producer’s own word unless a certifier’s seal audits it.',
    instead: 'Graded lamb, or goat that is firm and fine-grained, when no grass seal is on the shelf.',
    cart_pick: '100% grass-fed or grass-finished lamb',
  },
  pick_soup_bones: {
    decision: 'Soup bones come from the meat counter; ask for marrow or knuckle bones.',
  },
};
// Step 1c cards with a do row: the do line stays as it was.
const DO_KEPT = {
  judging_meat_at_the_case: 'Check the package is sealed and not leaking juices, then smell it.',
  butcher_counter_asking: 'Ask what came in today and when it was cut.',
  bison: 'Find the triangle inspection seal or a state mark on the package.',
  lamb_goat: 'Press goat for firm, fine-grained flesh and white fat.',
  organ_meats: 'Check the use-by date against the night it will be cooked.',
  venison_game: 'Ask whether each animal was handled separately and kept cold throughout.',
  beef_cuts_basics: 'Read the name for “mechanically tenderized” before the cut name.',
};

test('C1 Ground beef front equals the worked example', () => {
  const e = now('ground_beef_lean_ratio');
  for (const [f, v] of Object.entries(LEAN)) assert.deepEqual(e[f], v, `lean_ratio.${f}`);
  assert.equal(doLines.ground_beef_lean_ratio, LEAN_DO);
});

test('C2 Ground beef additive fields hold every fold fact', () => {
  const e = now('ground_beef_lean_ratio');
  const old = pre('ground_beef_lean_ratio');
  const fold = pre('ground_beef_organ_blend');
  assert.deepEqual(e.watch_out, [...old.watch_out, ...fold.watch_out]);
  assert.deepEqual(e.buying_tips, [...old.buying_tips, 'The product name will not say ‘ground beef’ alone; a blend has to carry its own descriptive name.']);
  const label = (t) => (e.labels_decoded || []).find((l) => l.term === t);
  assert.equal(label('80/20, 85/15, 90/10').meaning, 'Lean % to fat % by weight; higher first number = leaner.');
  assert.equal(label('Organ blend').meaning, 'Beef with liver, heart, or other organs mixed in, sold under its own descriptive name, not as ‘ground beef’.');
  assert.equal(label('Hamburger').meaning, 'Chopped beef that may have beef fat added; ‘ground beef’ may not.');
  for (const l of fold.labels_decoded) assert.deepEqual(label(l.term), l);
  assert.doesNotMatch(JSON.stringify(e.labels_decoded), /—/);
  assert.equal(e.kristy_take, `${old.kristy_take} A blend that prints its numbers is an honest pack. One that will not is a mystery bag.`);
  for (const s of [D6_SENTENCE, '25 percent', '9 CFR 317.2', '6,582 mcg RAE', '3,000 mcg', old.detail, old.short_answer, old.why]) assert.ok(e.detail.includes(s), `detail lacks: ${s}`);
  assert.doesNotMatch(e.detail, BRAND);
  assert.equal(e.science, old.science);
});

test('C3 the organ-blend fold is complete and the pass rule holds', (t) => {
  assert.equal(now('ground_beef_organ_blend'), undefined, 'organ_blend still in the KB');
  assert.ok(RETIRED_IDS.has('ground_beef_organ_blend'), 'organ_blend not RETIRED');
  const e = now('ground_beef_lean_ratio');
  const fold = pre('ground_beef_organ_blend');
  for (const f of ['aliases', 'asked_as']) for (const v of fold[f]) assert.ok(e[f].includes(v), `${f} lost ${v}`);
  for (const s of fold.sources) assert.ok(e.sources.some((x) => JSON.stringify(x) === JSON.stringify(s)), `source lost ${JSON.stringify(s)}`);
  for (const id of BATCH) pass.assertPassRule(t, pre(id), now(id));
});

test('C4 the Beef front carries G1 and drops the grain-finish line', () => {
  const b = now('beef_grassfed_vs_grainfed');
  assert.equal(b.decision, '100% grass-fed or grass-finished, no added hormones, with a certifier’s seal.');
  assert.equal(b.cart_pick, '100% grass-fed or grass-finished beef');
  assert.ok(b.tier_note.includes(G1), 'beef tier_note lacks the G1 gloss');
  assert.match(b.why, /whole-food standard/);
  const said = [b.why, b.short_answer, b.science, JSON.stringify(b.labels_decoded)].join(' ');
  assert.doesNotMatch(said, /allows a grain finish|may still have been grain-finished|eat feedlot grain for the last months/i);
});

test('C5 plan cart_picks are byte-equal', () => {
  assert.equal(now('butcher_counter_asking').cart_pick, 'Beef soup bones from the butcher counter');
});

test('C6 D1 limits hold on every batch card', () => {
  for (const id of BATCH) {
    const e = now(id);
    assert.ok(e, `${id} missing`);
    assert.ok(words(e.decision) <= 14, `${id} decision ${words(e.decision)} words`);
    if (Array.isArray(e.pick_steps)) assert.ok(e.pick_steps.length >= 1 && e.pick_steps.length <= 3, `${id} pick_steps ${e.pick_steps.length}`);
    if (e.kind === 'pick') continue;
    const n = String(e.tier_note || '').trim();
    assert.ok(words(n) >= 5 && words(n) <= 20, `${id} tier_note ${words(n)} words`);
    assert.doesNotMatch(n, /[.!?]\s+\S/, `${id} tier_note is more than one sentence`);
    assert.ok(String(e.instead || '').trim().length > 0, `${id} instead empty`);
  }
});

test('C7 only ruminant fronts print a grass term', () => {
  for (const id of BATCH) {
    if (RUMINANT_FRONTS.has(id)) continue;
    const e = now(id);
    assert.doesNotMatch(String(e.decision || ''), /grass-(fed|finished)/i, `${id} decision`);
    assert.doesNotMatch(String(e.cart_pick || ''), /grass-(fed|finished)/i, `${id} cart_pick`);
  }
  for (const id of ['ground_beef_lean_ratio', 'butcher_counter_asking']) assert.ok(JSON.stringify(now(id)).includes(POINTER), `${id} lost the POINTER`);
});

test('C8 brand claim and price greps are zero over changed copy fields', () => {
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
  assert.ok(changed >= 10, `only ${changed} changed copy fields`);
});

test('C9 meat section lints are clean for batch ids', () => {
  const hits = run([{ ...MEAT_TIP, tip_aligned: true, cards_aligned: true }], kb.entries);
  assert.ok(Array.isArray(hits));
  const mine = hits.filter((h) => (h.id && BATCH.includes(h.id)) || (Array.isArray(h.ids) && h.ids.every((i) => BATCH.includes(i))));
  assert.deepEqual(mine.filter((h) => h.code !== 'SECTION_TIP_HANDLING'), []);
});

test('C10 plumbing repointed and per-card lints clean', () => {
  assert.equal(TRY_POOL[0], 'ground_beef_lean_ratio');
  assert.ok(!TRY_POOL.includes('ground_beef_organ_blend'));
  assert.ok(!JSON.stringify(lint.OWNED_FACTS).includes('ground_beef_organ_blend'));
  for (const id of ['ground_beef_lean_ratio', 'beef_grassfed_vs_grainfed']) {
    const e = now(id);
    assert.deepEqual(lint.lintCard(projectEntry(e, { doLine: doLines[id] })), [], `${id} lintCard`);
    assert.deepEqual(flat(lint.readability(e)), [], `${id} readability`);
    assert.deepEqual(flat(lint.lintPickSteps(e)), [], `${id} lintPickSteps`);
  }
});

test('C12 Step 1c cards equal the spec', () => {
  for (const [id, spec] of Object.entries(SPEC_1C)) {
    const p = pre(id);
    assert.ok(p, `${id} missing at 8b49633`);
    const want = { ...p, ...spec };
    if (id === 'judging_meat_at_the_case') want.watch_out = [...p.watch_out.slice(1), p.watch_out[0], p.decision, p.pick_steps[1]];
    assert.deepEqual(now(id), want, `${id} differs from Step 1c`);
  }
  assert.equal(now('judging_meat_at_the_case').watch_out.length, 7);
  assert.ok(!('cart_pick' in now('judging_meat_at_the_case')), 'judging gained a cart_pick');
  for (const [id, d] of Object.entries(DO_KEPT)) {
    assert.equal(reviewHeadline(id), now(id).decision, `${id} review headline`);
    assert.equal(doLines[id], d, `${id} do line changed`);
  }
});
```

## ANCHOR server/lib/counterCards.js:175
```
  // → yogurt_plain_vs_flavored: live cultures is how to pick plain yogurt. Aliases kefir/alive/still alive not moved.
  'yogurt_live_cultures',
];
```
The RETIRED list ends at :177; insert the two CA-3a lines before `];`.

## ANCHOR server/lib/counterCardLint.js:1549
```
  ownedFact('beef_raising', 'beef_grassfed_vs_grainfed',
    ['ground_beef_lean_ratio', 'ground_beef_organ_blend', 'beef_cuts_basics',
      'butcher_counter_asking', 'judging_meat_at_the_case', 'organ_meats', 'pick_soup_bones'],
```
:1550 only.

## ANCHOR server/lib/counterCardLint.js:1622
```
    id: 'G1', term: /100% grass[- ]fed or grass[- ]finished/i,
    sections: ['meat'], categories: null,
    gloss: '“grass-fed” is the producer’s own word unless a certifier’s seal audits it',
```
Read only; the Beef, bison and lamb_goat tier_notes carry this gloss byte-equal.

## ANCHOR server/lib/tryPool.js:4
```
export const TRY_POOL = Object.freeze([
  'ground_beef_organ_blend',
  'butcher_counter_asking',
```

## ANCHOR server/lib/tryPool.test.js:36
```
  assert.deepEqual(POOL, [
    'ground_beef_organ_blend', 'butcher_counter_asking', 'beef_cuts_basics',
    'pork_cuts_and_enhanced', 'chicken_cuts_basics', 'salmon_wild_vs_farmed',
```

## ANCHOR server/lib/doLines.json:64
```
  "ground_beef_lean_ratio": "Read the name: “ground beef” allows no added fat, water or binders.",
  "ground_beef_organ_blend": "Read the ingredient list for liver and heart, each with a percentage.",
```
Generated; edit `docs/do-lines-review.md`, then run `node server/scripts/buildDoLines.js`.

## ANCHOR docs/do-lines-review.md:75
```
| `judging_meat_at_the_case` | meat | Color comes from oxygen and packaging, not from how fresh it is. | Check the package is sealed and not leaking juices, then smell it. | — |
| `butcher_counter_asking` | meat | Ask the butcher how it was raised and when it was cut. | Ask what came in today and when it was cut. | — |
```
Headline cells only; do cells unchanged.

## ANCHOR docs/do-lines-review.md:138
```
| `lamb_goat` | meat | Read lamb and goat for how they were raised, then anything added. | Press goat for firm, fine-grained flesh and white fat. | — |
| `organ_meats` | meat | Organ meats bought for a cook within one to two days. | Check the use-by date against the night it will be cooked. | — |
| `bison` | meat | Bison bought by its inspection mark, then handled like beef. | Find the triangle inspection seal or a state mark on the package. | — |
```
:138 and :140 headline cells only; :139 untouched.

## ANCHOR server/test/ktight.test.js:14
```
  B03: ['beef_grassfed_vs_grainfed', 'ground_beef_organ_blend', 'beef_cuts_basics', 'ground_beef_lean_ratio', 'pork_cuts_and_enhanced', 'judging_meat_at_the_case', 'butcher_counter_asking', 'lamb_goat', 'organ_meats', 'bison', 'venison_game'],
  B04: ['rotisserie_chicken', 'chicken_cuts_basics', 'turkey_whole', 'ground_turkey', 'chicken_breast', 'egg_labels', 'egg_duck_quail'],
  B05: ['deli_meat_uncured', 'bacon', 'hot_dogs', 'ham', 'turkey_bacon', 'cured_pork', 'hummus', 'deli_salads', 'prepared_meals', 'fresh_pasta', 'deli'],
```
Also :32 `B03: 11`, :37 `'question entries', 182);`, :40 `'batched ids', 181);`.

## ANCHOR server/test/acceptance/k9.test.js:17
```
const SLICE = nonEmpty([
  'beef_grassfed_vs_grainfed', 'ground_beef_organ_blend', 'beef_cuts_basics', 'ground_beef_lean_ratio',
  'pork_cuts_and_enhanced', 'judging_meat_at_the_case', 'butcher_counter_asking', 'deli_meat_uncured', 'hot_dogs',
], 'the K9 slice', 9);
```

## ANCHOR server/test/acceptance/k15.test.js:41
```
  ['stew meat', 'beef_cuts_basics'], ['steak', 'beef_cuts_basics'],
  ['organ blend ground beef', 'ground_beef_organ_blend'], ['beef with liver', 'ground_beef_organ_blend'], ['organ meat blend', 'ground_beef_organ_blend'],
  ['whole turkey', 'turkey_whole'], ['ground turkey', 'ground_turkey'],
```

## ANCHOR server/test/acceptance/ic5b.test.js:19
```
const BATCH = ['beef_grassfed_vs_grainfed', 'beef_cuts_basics', 'judging_meat_at_the_case', 'butcher_counter_asking', 'organ_meats', 'venison_game',
  'ground_beef_organ_blend', 'ground_beef_lean_ratio', 'bison', 'lamb_goat', 'pork_cuts_and_enhanced', 'bacon', 'cured_pork', 'ham', 'hot_dogs', 'deli_meat_uncured'];
const GRASS_URLS = [
```

## ANCHOR server/test/acceptance/ic5b.test.js:38
```
  assert.equal(b.title, 'Beef');
  assert.equal(b.decision, '100% grass-fed and grass-finished.');
  assert.match(b.tier_note, /finish/i);
```

## ANCHOR server/test/acceptance/ic5b.test.js:46
```
  assert.equal(nonPicksTitled('Steak').length, 1, 'non-pick "Steak" count');
  assert.match(now('judging_meat_at_the_case').decision, /oxygen|colou?r/i, 'judging front lost its colour fact');
});
```
:47 only.

## ANCHOR server/test/acceptance/ic5b.test.js:86
```
  for (const id of BATCH) {
    const was = new Set(urls(pre(id)));
    for (const u of urls(now(id))) if (!was.has(u)) { checked++; assert.ok(archive.includes(u), `${id}: ${u} not in docs/sources/item-cards`); }
```

## ANCHOR server/lib/perimeter.test.js:213
```
    assert.ok(p.trim().length > 2 && p.length <= 44, `${e.id}: "${p}" is not a cart row`);
    assert.doesNotMatch(p, /[$£€%]/, `${e.id} carries a price or percent`);
    assert.doesNotMatch(p, /[.!?]$/, `${e.id} is a sentence, not a name`);
```
:213 and :214 only.

## ANCHOR server/lib/counterPath.test.js:103
```
    assert.equal(typeof e.cart_pick, 'string');
    assert.doesNotMatch(e.cart_pick, /[$£€%]/, `${e.id} pick carries a price`);
  }
```
:104 only.

## ANCHOR server/kristy_perimeter_kb.json:154
```
      "decision": "100% grass-fed and grass-finished.",
      "why": "‘Grass-fed’ allows a grain finish at the end. ‘Grass-finished’ is the whole-food standard.",
      "short_answer": "‘Grass-fed’ is a floor, not a standard. Cattle can graze most of their lives, eat feedlot grain for the last months, and still be labeled grass-fed. ‘Grass-finished’ or ‘100% grass-fed’ covers the whole life. That one is worth paying for.",
```

## Claim-trace table (one row per new sentence)

Tags: `card` = already on this card at `8b49633`; `fold` = verbatim on `ground_beef_organ_blend`; `KS` = kristys_standard, no new fact; `CA-2:<block>` = quoted in `docs/research/card-align-sources.md`; `meat:<lines>` = quoted in `docs/research/meat-sources.md`.

| # | card.field | new sentence | trace |
| --- | --- | --- | --- |
| 1 | beef.decision | 100% grass-fed or grass-finished, no added hormones, with a certifier’s seal. | card (buying_tips 1, detail: AGA/AGW seals); `label_no_added_hormones` (KB :1963) "Beef and dairy allow hormones, so there it is meaningful and should be third-party verified."; plan inventory front |
| 2 | beef.why | The whole-food standard is grass after weaning, no grain, and no feedlot. | CA-2:1 FSIS RaisingClaims.pdf (https://www.fsis.usda.gov/sites/default/files/media_file/2021-02/RaisingClaims.pdf): grass (forage) after weaning, no grain, "never confined to a feedlot"; card (old why "whole-food standard") |
| 3 | beef.short_answer s1 | On a beef label, ‘grass-fed’ alone rests on the producer. | card detail "the bare claim now rests on the producer"; meat:230-250 FR 2016-00440 |
| 4 | beef.short_answer s2 | FSIS reads ‘100% grass-fed’ as grass after weaning, no grain, and pasture access. | CA-2:1 |
| 5 | beef.short_answer s3 | A certifier’s seal is what audits it. | G1 gloss (CA-1, gate A1 fallback); card detail "both audit the whole life" |
| 6 | beef.tier_note | On a beef label, “grass-fed” is the producer’s own word unless a certifier’s seal audits it. | G1 gloss, CA-2:1 |
| 7 | beef.cart_pick | 100% grass-fed or grass-finished beef | plan string; card decision |
| 8 | beef.buying_tips[1] + science s5 | Ground and chuck are the lowest-cost way into a whole-life grass animal. | card (rephrase of "cheapest", relative term only, non-negotiable 8) |
| 9 | beef.science s1 | FSIS reads a ‘grass-fed’ claim as grass after weaning, no grain, and pasture access. | CA-2:1 |
| 10 | beef.labels Grass-fed s1 | The producer’s own word unless a certifier’s seal audits it. | G1 gloss |
| 11 | beef.labels Grass-fed s2 | FSIS reads it as grass after weaning, no grain. | CA-2:1 |
| 12 | lean.decision | Organ blend with each organ’s percentage first, then ground beef with nothing added. | fold decision + card decision (both halves already said) |
| 13 | lean.tier_note | Organ blends grind beef liver or heart into the meat; printed percentages show how much of each. | card/fold (worked example tag `card`); fold short_answer, buying_tips 1 |
| 14 | lean.instead | Plain ground beef and a small piece of liver from the counter. The share is whatever goes in the pan. | fold instead, verbatim |
| 15 | lean.cart_pick | Liver and heart beef blend, shares stated | fold cart_pick, verbatim |
| 16 | lean.do | Read the label for organ names, each with a percentage beside it. | fold do line ("Read the ingredient list for liver and heart, each with a percentage.") |
| 17 | lean.pick_steps 2 | Organ blend: each organ named, each with its own percentage. | fold pick_steps 1, buying_tips 1 |
| 18 | lean.pick_steps 3 | Next: plain ground beef; skip “hamburger,” which allows added beef fat. | CA-2:7 9 CFR 319.15(b) (https://www.law.cornell.edu/cfr/text/9/319.15); meat:304-322; card buying_tips 1 |
| 19 | lean.why s1 | Federal rules bar added water, binders, and extenders from anything sold as ‘ground beef’. | fold detail; CA-2:7 9 CFR 319.15(a) |
| 20 | lean.why s2 | Regulation keeps organs out of ‘ground beef’, so a blend needs its own name and a full ingredient list. | fold why, verbatim |
| 21 | lean.why s3 | Organs are part of eating the whole animal, and a blend puts them in a familiar grind. | KS (plan tag), no new fact |
| 22 | lean.short_answer s1 | Pick an organ blend that prints each organ’s percentage, or ground beef with nothing added. | fold decision + card decision |
| 23 | lean.short_answer s2 | How the cattle were raised is on the Beef card. | POINTER (card pick_steps) |
| 24 | lean.buying_tips + | The product name will not say ‘ground beef’ alone; a blend has to carry its own descriptive name. | fold buying_tips 2, verbatim |
| 25 | lean.labels Organ blend | Beef with liver, heart, or other organs mixed in, sold under its own descriptive name, not as ‘ground beef’. | fold detail (9 CFR 317.2 descriptive name) |
| 26 | lean.labels Hamburger | Chopped beef that may have beef fat added; ‘ground beef’ may not. | card short_answer/watch_out 1; CA-2:7 9 CFR 319.15(b) |
| 27 | lean.labels 80/20 | Lean % to fat % by weight; higher first number = leaner. | card (em-dash → semicolon, words kept) |
| 28 | lean.kristy_take + s1 | A blend that prints its numbers is an honest pack. | fold kristy_take, rephrased |
| 29 | lean.kristy_take + s2 | One that will not is a mystery bag. | fold kristy_take, verbatim |
| 30 | lean.detail + D6 | Two label examples: one blend states 8 percent organ meats (4 percent liver, 4 percent heart, 92 percent muscle); another states 92 percent ground beef, 5 percent liver, 3 percent heart. | fold detail + fold sources 4/5 (producer pages, citations kept) |
| — | lean.detail + (other) | fold detail, fold science, old short_answer/why: verbatim moves | fold / card |
| 31 | steak.instead | Loin or rib cuts, whole, with no ‘mechanically tenderized’ in the name. | card short_answer "Chuck and round are working muscles; loin and rib sit along the back and do little work."; card why "A cut pushed through needles or blades must say ‘mechanically tenderized’ in its name." |
| 32 | organ.tier_note | Organ meats keep a shorter time in the refrigerator than steaks and roasts. | card why "Variety meats keep a shorter time than steaks and roasts."; card science "Variety meats keep a shorter time than steaks and roasts, 1 to 2 days refrigerated." |
| 33 | organ.instead | A beef blend with liver and heart ground in, each with its percentage printed. | Ground beef card (Step 1b) tier_note "Organ blends grind beef liver or heart into the meat; printed percentages show how much of each."; fold cart_pick "Liver and heart beef blend, shares stated" |
| 34 | organ.pick_steps 1 | Ask the counter or a farmer which organs they offer. | card buying_tips[1], verbatim |
| 35 | organ.pick_steps 2 | How it was raised: see Beef. | POINTER (D2 rule 3) |
| 36 | judging.decision | The pack with the newest ‘packaged on’ date in the case. | meat:647 MSU "Dates on meat packages" (https://www.canr.msu.edu/news/dates_on_meat_packages_sell_by_use_by_freeze_by_packaged_on_expiration_date): "Packaged on – This type of date is often used on fresh meat ... Most fresh meat can be stored at refrigerated temperatures for up to three days after packaging"; card watch_out[1] |
| 37 | judging.tier_note | Fresh tray-wrapped meat keeps up to three days refrigerated after packaging, so that date sets the clock. | card watch_out[1] "Fresh tray-wrapped meat generally holds up to three days refrigerated after packaging."; meat:647 (same quote as row 36) |
| 38 | judging.instead | A well-sealed vacuum pack, which keeps up to seven days refrigerated from purchase. | card watch_out[1] "A well-sealed vacuum pack can go up to seven."; meat:647 "Longer storage time of up to seven days from retail purchase can be used if the product is vacuum packaged with a good seal and the air is removed from the package." |
| 39 | judging.pick_steps 1 | ‘Packaged on’: the packing day, not a safety cutoff. | card watch_out[1] "A ‘packaged on’ date is not a safety cutoff." |
| — | judging.watch_out 6, 7 | (old decision; old pick_steps[1]) | card, verbatim moves |
| 40 | butcher.decision | Ask for beef soup bones, and a whole chuck ground fresh. | card buying_tips "Ask for bones and trim." and "Ask for a whole chuck ground fresh, which lets you choose the cut."; cart_pick (plan string, row 43) |
| 41 | butcher.tier_note | Soup bones come from the counter, and a whole chuck ground fresh lets the shopper choose the cut. | `pick_soup_bones` decision at `8b49633` "Ask the meat counter which soup bones it carries"; card buying_tips[3] "Ask for bones and trim."; card buying_tips[1] "Ask for a whole chuck ground fresh, which lets you choose the cut." |
| 42 | butcher.instead | A whole chuck roast, cut, tied or boned to order at the counter. | card detail "They will grind a whole chuck fresh, which lets you choose the cut. Cutting, tying, grinding and boning are usually included."; card pick_steps[2] |
| 43 | butcher.cart_pick | Beef soup bones from the butcher counter | plan string (CARD-ALIGNMENT-PLAN inventory, CA-3a) |
| 44 | butcher.pick_steps 1 | Soup bones: ask for marrow or knuckle bones. | `pick_soup_bones` aliases at `8b49633` "marrow bones", "knuckle bones" |
| 45 | bison.decision | 100% grass-fed or grass-finished bison, with an inspection mark. | G1 term (beef owner front); CA-2:2 AGW "Certified Grassfed by A Greener World standards for beef, sheep, dairy sheep, goats, dairy goats and bison."; card decision + pick_steps 1 (inspection mark) |
| 46 | bison.tier_note clause 1 | Many bison finish on grain | card detail "Bison raised on grass get grain for the last 90 to 120 days, because many shoppers prefer white fat." (narrowed to "many") |
| 47 | bison.tier_note clause 2 | “grass-fed” is the producer’s own word unless a certifier’s seal audits it. | G1 gloss; meat:237 FR 2016-00440 "AMS is withdrawing: (1) The Grass (Forage) Fed Claim for Ruminant Livestock" (bison is a ruminant; card science "a bovine") |
| 48 | bison.instead | Bison labeled grass-fed with no seal; it may have eaten grain for its last 90 to 120 days. | card detail (same sentence as row 46, numbers verbatim); G1 |
| 49 | bison.cart_pick | 100% grass-fed or grass-finished bison | card decision (row 45); beef cart_pick form |
| 50 | venison.tier_note | Game is often processed by small shops, so cold handling at every step decides its safety. | card science "Game is often processed by small shops, so cold handling decides its safety."; card short_answer "fully refrigerated facilities, with each animal handled on its own" ("at every step") |
| 51 | venison.instead clause 1 | Wrapped frozen venison from the same refrigerated processor | card decision (refrigerated processor); card detail "Wrapped game keeps 9 to 12 months frozen." |
| 52 | venison.instead clause 2 | it keeps 9 to 12 months frozen. | card detail, verbatim numbers |
| 53 | lamb.decision | 100% grass-fed or grass-finished lamb or goat. | G1 term; CA-2:2 AGW (sheep, goats); CA-2:2b AGA "Animals are fed only grass and forage from weaning until harvest." (ruminant standard); KS for the rank |
| 54 | lamb.tier_note | Grass seals cover sheep and goats, and “grass-fed” is the producer’s own word unless a certifier’s seal audits it. | CA-2:2 AGW "standards for beef, sheep, dairy sheep, goats, dairy goats and bison"; CA-2:2b AGA "ruminant"; G1 gloss; meat:237 FR 2016-00440 (ruminant livestock) |
| 55 | lamb.instead | Graded lamb, or goat that is firm and fine-grained, when no grass seal is on the shelf. | card short_answer "Graded lamb at retail is Prime, Choice, or Good."; card watch_out 1 (ungraded quality "may be higher or lower"); card buying_tips 1 "firm, fine-grained flesh" |
| 56 | lamb.cart_pick | 100% grass-fed or grass-finished lamb | card decision (row 53) |
| 57 | pick_soup_bones.decision | Soup bones come from the meat counter; ask for marrow or knuckle bones. | card old decision "Ask the meat counter which soup bones it carries"; card aliases "marrow bones", "knuckle bones" |

## Independent check script (admin-run; not part of the build)

Save as `/Users/m1/kristy/.pipeline/runs/ca-3a/counts.mjs`.

```js
import { readFileSync } from 'node:fs';
import * as lint from '../../../server/lib/counterCardLint.js';
import * as listMatch from '../../../server/lib/listMatch.js';
const kb = JSON.parse(readFileSync('/Users/m1/kristy/server/kristy_perimeter_kb.json', 'utf8'));
const BATCH = ['beef_grassfed_vs_grainfed', 'ground_beef_lean_ratio', 'ground_beef_organ_blend', 'beef_cuts_basics', 'organ_meats', 'butcher_counter_asking', 'judging_meat_at_the_case', 'bison', 'venison_game', 'lamb_goat', 'pick_soup_bones'];
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const out = { cards: {}, sections: {}, cartPickMatch: {} };
for (const id of BATCH) {
  const e = kb.entries.find((x) => x.id === id);
  if (!e) { out.cards[id] = 'ABSENT'; continue; }
  out.cards[id] = { decision: words(e.decision), tier_note: words(e.tier_note), instead: words(e.instead), pick_steps: (e.pick_steps || []).length, cart_pick: e.cart_pick ?? null };
  if (e.cart_pick && typeof listMatch.matchItemToCard === 'function') {
    try { const m = listMatch.matchItemToCard(e.cart_pick); out.cartPickMatch[id] = m?.id ?? m?.slug ?? m?.perimeterId ?? JSON.stringify(m); } catch (err) { out.cartPickMatch[id] = `THREW ${err.message}`; }
  }
}
const tip = { section: 'meat', rule: 'A local butcher comes first; at the case, choose meat from animals raised on grass and open pasture.', checks: ['Ask what the animal ate and how it lived; a butcher counter can answer.', 'Organs come from the same animal; liver and heart belong in the cart too.', 'On packaged meat, look for an ingredient list of meat, salt, and spices.'], tip_aligned: true, cards_aligned: true };
for (const h of lint.lintSections([tip], kb.entries)) {
  const k = `${h.code}:${h.id ?? (h.ids || []).join('+')}`;
  out.sections[k] = (out.sections[k] || 0) + 1;
}
console.log(JSON.stringify(out, null, 2));
```

- BEFORE: `mkdir -p /Users/m1/kristy/.pipeline/runs/ca-3a && cd /Users/m1/kristy/server && node ../.pipeline/runs/ca-3a/counts.mjs > ../.pipeline/runs/ca-3a/before.json`
- AFTER: the same command into `after.json`, then `diff before.json after.json`.
- Expected AFTER:
  - `ground_beef_organ_blend` ABSENT.
  - Every batch decision ≤14 and tier_note 5-20.
  - No `CART_PICK_DISAGREES`/`TERM_UNGLOSSED`/`SECTION_TIP_REPEATS_CARD` key on a batch id.
  - `cartPickMatch` reports, for each changed cart_pick, its own slug (lean_ratio, butcher_counter_asking, beef_grassfed_vs_grainfed, bison, lamb_goat). A cart_pick that matches another slug is a finding for the critic (Open questions 3 and 5), not a silent pass.
- Also run `grep -rn ground_beef_organ_blend server/lib server/test server/routes | grep -v RETIRED`: expected only the counterCards.js RETIRED lines and historical comments.

## Prerequisites

- Env: node ≥20, git, grep. No network. No Supabase writes (`--dry-run` only). No browser.
- CA-1 (`8b49633`) and CA-2 (`f661fee`) are committed.
- BEFORE captured.

## Answers

- **Reads and runtime:** `npm test` takes 1-3 minutes; the acceptance test takes seconds. Read only `owns`, `read_full`, and the KB entries of batch ids (beef :139-205, organ_blend :206-270, lean_ratio :454-505, beef_cuts :348-452, judging :2534-2598, butcher :2600-2650, lamb_goat :7365-7424, organ_meats :7426-7486, bison :7488-7540, venison :7541-7597, pick_soup_bones :7623-7641).
- **Do not edit:**
  - Any KB entry outside the batch.
  - `sources`/`aliases`/`asked_as` of K15 ids (lamb_goat, organ_meats, bison, venison_game).
  - ESSENTIALS.
  - `server/lib/sectionRules.json` (CA-5).
  - `client/src` (frozen).
  - Any test not in `owns`.
- **Every string in Steps is final.** Copy it byte for byte. Do not author a sentence; a needed sentence that is not in this spec is a STOP.
- **STOP BLOCKED (quote the evidence) if:**
  - Any lint in C10 rejects a worked-example string (the plan gate failed; the planner applies the plan's fallback).
  - ic5b C5 (`lintCard` with the do line, readability) rejects a Step 1c string; the planner rewrites it, the builder does not.
  - `counterReach` puts a folded asked_as on any id other than `ground_beef_lean_ratio`.
  - `counterDecision.test.js` fails on beef (:85 needs "whole-food standard" in decision+why) or beef_cuts (:173 "Chuck").
  - ic5a C5 fails (a sentence inherited from `beef_grades_usda`/`meat_case` was reworded).
  - listMatchProbe reports a wrong match.
- **Limits:** no git writes. 60-minute cap. BLOCKED after 3 identical failures. Never delete an assertion.
- **Commit (admin):** `ca-3a: meat batch A, Beef front + Ground beef worked example, ground_beef_organ_blend folded, beef family fronts. Do lines table docs/do-lines-review.md → server/lib/doLines.json. Not migrated.`
- **Report, ≤30 lines:** READY or NOT READY; acceptance pass count; npm test count; probe wrong count; dry-run deletes; any KEPT ids; any STOP.

## Open questions

1. **beef_cuts_basics D6 vs ic5a C5.** The watch_out "‘Angus’ on a package is not a grade. Certified Angus Beef is a brand with its own checklist. ..." names a brand (D6 says rephrase it). It came from `beef_grades_usda` (folded IC-5a), and ic5a C5 requires it verbatim. Resolved in Step 1c-i as option (a): kept verbatim, D6 exception named. Option (b), rephrase and narrow ic5a C5, is Devon's to pick instead.
2. **Certifier names** (American Grassfed, Certified Grassfed by AGW) on the Beef do line and detail: these are seal names, not food brands. They are kept and not in the BRAND regex.
3. **matchItemToCard on new cart_picks** is unverified. "Liver and heart beef blend, shares stated" may hit organ_meats (aliases "beef liver"/"beef heart"). "Beef soup bones from the butcher counter" may hit pick_soup_bones. `typeContradicts` (perimeter.js:130-151) reads cart_pick types. The admin's counts.mjs answers this before dispatch; a wrong match means the plan string needs Devon, not a builder alias.
4. **ic5b C7:** the fold's producer URLs are not in `docs/sources/item-cards`. The spec treats them as moved (FOLD_URLS), not new.
5. **Matcher risk on the bison and lamb cart_picks.** Beef carries the aliases "grass-fed", "grass-finished", "100% grass fed" and "grass fed grass finished" (KB :143-150), and `INERT_MODIFIERS` (listMatch.js:330) does not drop "grass", so "100% grass-fed or grass-finished bison" and "... lamb" may land on `beef_grassfed_vs_grainfed`. A model-memory note says an earlier admin probe returned null for phrase cart_picks; not re-verified. counts.mjs decides before dispatch. A wrong match returns to the planner/Devon; no fallback string is offered, because any cart_pick without the G1 term fails L5(b) against these fronts.
6. **butcher buying_tips[3]** "Ask for bones and trim. Often cheap or free." is unchanged (passes C8: field not changed) but sits near non-negotiable 8. Devon's call.
7. **Organ POINTER** "How it was raised: see Beef." also sits over chicken livers/hearts (aliases). D2 rule 3 as written; OK rough edge.
8. **Lints read, not run.** OBSERVABLE_IN_BOTH, INSTEAD_HEDGED and INSTEAD_ECHOES_REFUSED were checked by reading counterCardLint.js (:697-740, :121-142, :1163-1206) for the seven 1c do-row cards: no hit. readability, lintSections L1/L2/L4/L5 and paidBoundary's tier-sentence checks were not run on the 1c strings; C9, C12 and ic5b C5 are the arbiters.

## Tried and rejected

- **Keeping "‘Grass-fed’ allows a grain finish" on Beef.** CA-2 block 1 (FSIS 2019) contradicts it. Gate A1 failed, and its pre-written fallback is the G1 gloss.
- **Fold science sentences into lean_ratio science.** It would pass 70 words; the plan's own fallback sends them to detail.
- **A `why` that keeps "‘Grass-finished’ is the whole-food standard" verbatim.** It would keep the 6-gram shape the 3b cards repeat ("is the whole-food standard", L2). It was reordered so the key phrase leads.
- **Retargeting k15 to a new organ id.** The plan folds into Ground beef; no new card.
- **A grass term on venison_game.** No source in either archive covers deer diets, and AGW names beef, sheep, goats and bison, not deer.
- **A cart_pick on judging_meat_at_the_case.** A judging card has no shelf item.
- **Rewording judging's old tier_note into watch_out.** It is 22 words and may not be reworded; its content is already in `why` and kristy_take.
