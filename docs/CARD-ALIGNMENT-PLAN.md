# Plan: card alignment, written so the cards never need redialing (2026-10-14). Not built. Go 2026-10-14 (Devon: "continue the dialing", taken as approval on defaults Q1-Q3).

**Authority.** This plan follows the alignment block Devon approved on 2026-10-14 (GOAL, the principle, the three KB layers, and refinements A/B/C), plus the 2026-10-14 ruling "Cards talk, rules guide". Approving this plan approves every alignment block below and every worked-example string, word for word.

**Problem.** In TestFlight build 4, the cards read as label checklists: "100% grass-fed and grass-finished." The section rules are handling trivia: "Take a sealed package that is not leaking." The same standard is printed on many cards in a section. Some label words appear with no plain meaning. Avocado oil, the natural fats and drinks have no settled place.
**Underlying need.** The shopper should get one coach's voice per aisle. One principle sits at the top of the section. One card per item names the best version and a close second in label words, says why in one plain sentence, and explains every label word it uses. Nothing is said twice.

## Decisions (made here; the batches execute them as written)

### D1. The card template: existing fields only, additive, engine untouched
| Slot (layer 1) | KB field | Shown | Limit (lint) | What goes in it |
| --- | --- | --- | --- | --- |
| Item name | `title` | free | none | The word the shopper writes on a list ("Ground beef"). |
| **Front = the best version** | `decision` | free | ≤14 words (MAX_HEADLINE_WORDS); one verdict; no hedge on the shopper's circumstances | Exact label words in buying order. Rank form ("X first, then Y") is allowed when the close second fits. |
| **Why line** | `tier_note` | free | 1 sentence, 5–20 words, unique in the corpus | Why this version, for this item. It carries the term bridge (C) for terms in the front that are not glossed in `pick_steps`. It carries the use bridge (A) only where the use is the reason for the pick. |
| **Close second** | `instead` | free | ≤24 words (MAX_INSTEAD_WORDS) | The next rung that still clears the floor, in label words. If the front already holds that rung, this slot holds the sideways move instead: a *different food* (VOICE_SPEC "the best available"). It is never empty. |
| **One-tap add** | `cart_pick` | free (`routes/chat.js` publicEntry) | the existing cart_pick limit, if any (S11 names it) | The front's best rung as a shelf item, in its label words. When that rung is not a shelf item (raw milk from a farmer), it names the first shelf rung. It never prints a shared term the card's front does not print (D2 rule 3). Checked by L5. |
| **How to spot it** | `do` (`docs/do-lines-review.md` → `server/lib/doLines.json`) | free | ≤14 words; headline + do ≤28 | The in-aisle action. Per ITEM-CARDS D2, it changes only if it is handling trivia, its card folds, or it trips OBSERVABLE_IN_BOTH. |
| **Ladder and glosses** | `pick_steps` | free | 1–3 steps, ≤14 words each, no new numbers (KT_NEW_NUMBER) | Glosses of label terms (C), rungs below the front, and the POINTER line (`<Fact>: see <Owner title>.`) when the shared standard lives on an owner card. |
| **What to skip, and why** | `watch_out` | paid | ≤20 words per sentence | Each skip with its reason. Sourcing lines first, then processing, then packaging/handling (VOICE_SPEC "the thing outranks handling"). Existing items are never dropped. |
| Glossary | `labels_decoded` | paid | none | `{term, meaning}` entries. Each meaning is true as written (accuracy outranks firmness). |
| Depth | `why`, `short_answer` (≤40), `detail`, `science` (≤70), `kristy_take`, `buying_tips`, `look_for` | paid | SENTENCE_MAX 20 | Rephrased, never deleted. A sentence moves to the owner card (or becomes a POINTER) if it restates a section tip or an owner card. |
| Preserved | `sources`, `aliases`, `asked_as`, `category`, `evidence_tier`, `id`, `eyebrow_short` | none | none | Byte-identical. Exceptions: `aliases`/`asked_as` grow (never shrink) when a fold or a produce group moves them in, and a fold survivor's `sources` grows by the folded card's entries (D8). |

No new field, column, SQL, iOS decode, or money-boundary change. `verdictEngine.js` is not touched (non-negotiable #5). The engine KB is not merged.

### D2. The section tip template and the ownership rule (refinement B)
Section tips live in `server/lib/sectionRules.json`. Each row has these fields:
- `section`: unchanged.
- `rule`: one sentence, ≤20 words. It is the section's natural-state principle in plain words, with its plain why. It uses no label term that would need a gloss.
- `checks`: 0–3 lines, ≤16 words each [PLACEHOLDER]. They are cross-item habits in plain words (ask, read the ingredient line, organs count too). They never contain one item's deciding label, and never handling, safety or storage.
- `sources`: kept as the internal claim trace. It is not served (`server/lib/sectionRules.js` already drops it).
- New internal flags `tip_aligned` and `cards_aligned`. These are not served either: `loadSectionRules` returns only `{section, rule, checks}`.

**Ownership: one fact, one owner, at each layer.**
1. **The section tip owns the principle**, in plain words. No item card links to it and it links to none. It never restates a card line.
2. **One owner card per shared fact** owns the depth: the label term, its ladder, seals, numbers, history and sources. This uses the existing `OWNED_FACTS` (for example `beef_raising` → `beef_grassfed_vs_grainfed`).
3. **Every other card owns only item-specific content**: the grind, the cut, the organ blend, the strain, the frying fat. A sibling prints a shared label term in its front only when Devon's goal line names that term for that item (milk, yogurt and eggs do; ground beef, steak and organ meats do not). Otherwise it carries the existing POINTER ("How it was raised: see Beef."), and its `cart_pick` does not print the term either (L5).
4. **A shared term's gloss is one fixed phrase per scope**, defined once in the `CANONICAL_GLOSSES` table (D3). A card that prints the term carries the phrase of the row scoped to its walk section. This is the one sanctioned repeat (refinement C beats the repetition budget for a gloss, and only for a gloss). Explanation and why-it-matters never repeat.

### D3. The mechanical checks (CA-1). These extend `counterCardLint.js`; nothing is rebuilt
- **L1 `SECTION_TIP_REPEATS_CARD`.** Fires when a tip's `rule` or `checks` share an n-gram of ≥5 words [PLACEHOLDER] (lowercased, punctuation stripped, ≥2 non-stopword tokens) with any card in that walk section. Card fields checked: `decision` plus the `REPEATED_CLAIM_FIELDS` list. Canonical-gloss phrases are exempt. Runs on rows with `tip_aligned: true`.
- **L2 `SECTION_PHRASE_REPEATED`.** Fires when an n-gram of ≥6 words [PLACEHOLDER] in `REPEATED_CLAIM_FIELDS` appears on ≥3 cards [PLACEHOLDER] of one walk section. A second form fires when an n-gram of ≥4 words appears in `decision`/`tier_note` on ≥3 cards. POINTER lines and `CANONICAL_GLOSSES` term/gloss phrases are exempt. Runs on sections with `cards_aligned: true`.
- **L3 `SECTION_TIP_HANDLING`.** Fires when a tip's `rule` or `checks` match the handling lexicon: `seal(ed)?|leak|smell|odor|color|cold|temperature|sell-by|use-by|expir|dent|bulg|bruise|wash|store|fridge` [PLACEHOLDER list]. Runs on rows with `tip_aligned: true`.
- **L4 `TERM_UNGLOSSED`.** Fires when a card's `decision` matches a `CANONICAL_GLOSSES` term in scope for that card, but none of `tier_note`, `pick_steps` or `instead` contains that row's gloss phrase verbatim. Runs on sections with `cards_aligned: true`. **Scope resolution, in order:**
  1. The card's walk section is `sectionForCategory(card.category)` (`SECTION_BY_CATEGORY`, `server/lib/counterCards.js:41-49`; S2).
  2. The candidate rows are those whose Scope lists that section and, where the row names categories, the card's category.
  3. Candidate terms are matched against the decision longest first. A matched span is consumed, so a shorter term inside it is not tested again (`100% grass-fed` inside `100% grass-fed or grass-finished`).
  4. Each surviving match needs its own row's gloss. A gloss from another scope does not satisfy it (the animals "organic" gloss on a produce card still fires).
  5. A card whose section has no scoped row is not checked by L4.
- **L5 `CART_PICK_DISAGREES`.** Fires when either holds; runs on sections with `cards_aligned: true`:
  - (a) `cart_pick` matches a shared-term family the card's `decision` does not match. Families: `/grass-(fed|finished)|pasture-raised|organic|wild-caught/i` [PLACEHOLDER; S1 may substitute the OWNED_FACTS patterns].
  - (b) A scoped `CANONICAL_GLOSSES` term found in the decision's first rung appears in `cart_pick` neither as the term nor as its gloss phrase. The first rung is the decision text before the first ` first`, `, then`, `; then` or `never` [PLACEHOLDER split list].
- **`CANONICAL_GLOSSES`** (exported; first entries; each traces to an owner card or an archive row). Scope names are walk sections from `SECTION_BY_CATEGORY`/`sectionForCategory` in `server/lib/counterCards.js` (S2; `listMatch.js` `CATEGORY_SECTION` is a different, list-only map). A table test asserts that no two rows with the same term share a section.
  | Id | Term (regex) | Scope (walk section; category filter) | Gloss phrase | Owner / trace |
  | --- | --- | --- | --- | --- |
  | G1 | `100% grass-fed or grass-finished` | meat | “grass-fed” is the producer’s own word unless a certifier’s seal audits it (A1 fallback; CA-2 block 1) | beef_grassfed_vs_grainfed tier_note; **gate A1** |
  | G2 | `100% grass-fed` | eggs_dairy; category `dairy` only | the cows ate grass and hay, never grain | **gate A2** |
  | G3 | `pasture-raised` | meat, eggs_dairy | time outdoors on pasture, audited only with a certifier’s seal | label_pasture_raised_feed |
  | G4 | `organic` | meat, eggs_dairy | certified organic feed and outdoor access | 7 CFR 205.237/205.239 (CA-2) |
  | G5 | `organic` | produce | grown without synthetic pesticides beyond a short approved list | 7 CFR 205.105/205.601 (CA-2, M3) |
  | G6 | `natural fat` | bulk_pantry, frozen, eggs_dairy | tallow, olive oil, or coconut oil | Devon ruling, `kristys_standard` |
  | G7 | `seed oil` | bulk_pantry, frozen, eggs_dairy | sunflower, safflower, canola, soybean, corn, and cottonseed | the engine KB `seed_oil` entry's own names (S9) |
- The tip-vs-served-shape check goes in the sectionRules test: the served row keys are exactly `section, rule, checks`.

### D4. The use bridge (refinement A)
It is at most one clause, in `tier_note` (the why line), only where the use is the reason for the pick. In milestone 1 only yogurt qualifies. No recipe, no meal, no macro. `lintCulinaryAim` stays as it is. Any card outside an allow-list (`USE_BRIDGE_IDS = [yogurt_plain_vs_flavored]` [PLACEHOLDER], held in the batch acceptance test) that matches `/at home with|stir|top it|mix it/i` fails.

### D5. Produce groups (layer 3) need no new dedupe code
Dedupe already exists on both sides:
- Server: `server/lib/listMatch.js` `attachCards` stamps `cardSlug`. `collapseByCard` (line 448; its comment cites blueberries + strawberries → berries_picking) feeds `groupForWalk` (line 477).
- iOS: `Kristy/Core/Walk.swift` `CartBlock` (line 118) and `collapse` (line 154) render rows that share a `cardSlug` as one block with one card. `ListSelection.swift:106` shows one chip per card.

A group card therefore needs only **aliases that cover each family member**, so every member row lands on one slug, plus a rendered check. Absorbed picks retire (picks never migrate), and their aliases move to the group card. If S8 shows a list surface that bypasses `Walk.collapse`, the produce milestone adds one iOS piece. That is not assumed here.

### D6. No brand names in copy
Every copy field is brand-free. Copy fields are all fields except `sources`, `aliases`, `asked_as`, `id`, `category` and `evidence_tier`. Brand names found in `detail`/`watch_out` (for example, the organ-blend detail) are rephrased into label words. Preserved fields are governed by the rewriting rule; Q2 asks Devon about them.

### D7. Avocado oil and seed oils
Avocado oil is a skip alongside the seed oils. This is a settled Devon ruling: the label cannot prove the oil is pure. `evidence_tier` stays as each card has it, and the reason is printed as Kristy's standard. **No study search; no researcher row for avocado oil.**

### D8. Folds and retirements
Folds are same-subject only, per the ITEM-CARDS D3 / chf-5 process: RETIRED plus delete, move aliases and asked_as, repoint shortcuts, and move each unique fact with its source. Every field of a folded card gets a destination in a placement table; ground_beef_organ_blend's is under the Ground beef worked example. Milestone 1 does these:
- `ground_beef_organ_blend` folds into `ground_beef_lean_ratio`.
- `pick_milk` retires. Its "find the word pasteurized" line contradicts raw-first, and the Milk card answers "milk".
- `chicken_breast` folds into `chicken_cuts_basics` **only if** S5 shows no recorded reason for keeping it at IC-4a. Otherwise it gets a rewrite. If it folds, CA-3b writes its placement table in the same form before the spec ships.

## Accuracy gates (these bind the batch criteria; accuracy outranks firmness)
- **A1, beef "grass-fed".** CA-2 fetches the current FSIS animal-raising-claims labeling guideline. If it says an unqualified "grass fed" claim already requires a grass/forage-only diet, the G1 gloss changes to the seal fact: “grass-fed” is the producer’s own word unless a certifier’s seal audits it. Devon's wording stands only if the fetched text supports it.
- **A2, dairy "grass-fed".** The "never grain" gloss stands only on a fetched certifier standard for 100% grassfed dairy. The fallback is “no grain, audited by a certifier’s seal”.
- **A3, numbers.** Pasteurization temperatures, the 9 CFR 319.15 ground-beef terms, and the NIH vitamin A figures trace to a fetched quote or to verbatim text already on the card (or on the card folding in). The milk numbers are in `docs/research/item-cards-sources.md` if IC-2 marked them SATISFIABLE (S7).
- **A4, "made from dried potatoes".** The chip step stands only on a fetched FDA naming source. Otherwise the step is cut and the existing slice fact stays where it is.

## Worked examples (full text; every string counted against the lint limits)
Conventions: [n] = word count, whitespace tokens (the builder re-counts with the lint's own counter). "kept" = byte-identical. "+" = appended; existing items stay. Trace tags name the claim-lock path: `card` = already on this card; `fold` = verbatim on the card folding in; `KS` = `kristys_standard`, no new fact; `CA-2:<row>` = must be quoted in the CA-2 archive before the sentence ships.

### Section tip: meat
- **rule:** A local butcher comes first; at the case, choose meat from animals raised on grass and open pasture. [18]
- **checks:**
  1. Ask what the animal ate and how it lived; a butcher counter can answer. [14]
  2. Organs come from the same animal; liver and heart belong in the cart too. [14]
  3. On packaged meat, look for an ingredient list of meat, salt, and spices. [13]
- `sources` (internal): beef_grassfed_vs_grainfed, butcher_counter_asking, organ_meats, deli_meat_uncured. Not served; no card link.

### Section tip: eggs and dairy (one walk section, `eggs_dairy`; see Q1)
- **rule:** Eggs and dairy start with how the animal ate and lived: cows on grass, hens on pasture. [17]
- **checks:**
  1. Read how the animal lived and what it ate before anything else on the label. [15]
  2. Dairy needs few ingredients: milk or cream, cultures, salt, and enzymes for cheese. [13] `card: cheese_real_vs_processed`
- `sources` (internal): egg_labels, whole_vs_reduced_fat_milk, cheese_real_vs_processed.

### Ground beef (`ground_beef_lean_ratio`; `ground_beef_organ_blend` folds in)
- **decision:** Organ blend with each organ’s percentage first, then ground beef with nothing added. [13] (kept as written; the plan review confirmed it passes the cover test)
- **tier_note:** Organ blends grind beef liver or heart into the meat; printed percentages show how much of each. [17] `card`
- **instead:** Plain ground beef and a small piece of liver from the counter. The share is whatever goes in the pan. [20] `fold: instead, verbatim`. The front holds both rungs, so this is the sideways move. The butcher-grind line stays on butcher_counter_asking, its owner.
- **cart_pick:** Liver and heart beef blend, shares stated [7] `fold: cart_pick, verbatim`. It replaces "Ground beef, grass-fed and grass-finished", which printed the shared term (D2 rule 3) and pointed past the front's first rung.
- **do:** Read the label for organ names, each with a percentage beside it. [12] (headline + do = 25)
- **pick_steps:** (1) How it was raised: see Beef. [existing POINTER] (2) Organ blend: each organ named, each with its own percentage. [10] `fold: pick_steps 1, buying_tips 1` (3) Next: plain ground beef; skip “hamburger,” which allows added beef fat. [11] `CA-2: 9 CFR 319.15`
- **why:** Federal rules bar added water, binders, and extenders from anything sold as ‘ground beef’. [14] `fold: detail, 9 CFR 319.15(a)` Regulation keeps organs out of ‘ground beef’, so a blend needs its own name and a full ingredient list. [19] `fold: why, verbatim (9 CFR 317.2)` Organs are part of eating the whole animal, and a blend puts them in a familiar grind. [17] `KS`
- **short_answer:** Pick an organ blend that prints each organ’s percentage, or ground beef with nothing added. How the cattle were raised is on the Beef card. [25]
- **watch_out +:** the fold's three items, verbatim, placed after the survivor's sourcing lines and before its handling lines. They carry no brand names. The vitamin A number stays in `detail` (fold, verbatim): 6,582 mcg RAE per 3 ounces against an adult upper intake of 3,000 mcg.
- **buying_tips +:** The product name will not say ‘ground beef’ alone; a blend has to carry its own descriptive name. `fold: buying_tips 2, verbatim (9 CFR 317.2)`
- **labels_decoded +:**
  - {Organ blend: Beef with liver, heart, or other organs mixed in, sold under its own descriptive name, not as ‘ground beef’.} `fold: why, buying_tips 2`
  - {Hamburger: Chopped beef that may have beef fat added; ‘ground beef’ may not.} `CA-2: 9 CFR 319.15`
  - The fold's {Ground beef: …cheek meat up to 25 percent… liver and heart are not.} and {Ancestral blend / primal blend: …}, verbatim. The fold's Ground beef entry replaces any survivor entry with the same term.
  - The survivor's existing 80/20 entry contains an em-dash. CA-3a replaces the dash with a colon or semicolon and keeps the words.
- **kristy_take +:** A blend that prints its numbers is an honest pack. One that will not is a mystery bag. [18] `fold: kristy_take, rephrased`. The fold's "honest ground beef" contradicted the name rule.
- The grass-fed standard is not printed here (B). The meat tip and the Beef card own it.

**Fold placement table: `ground_beef_organ_blend` → `ground_beef_lean_ratio`.** A field the table misses (S6 prints the full entry) goes verbatim into the survivor's matching field. If the survivor already holds that fact, the claim-trace table names the duplicate instead.
| Fold field | Destination on the survivor | Form |
| --- | --- | --- |
| `decision` (shares named: buy; no numbers: pass) | front rung 1 + watch_out item 3 | both halves already said |
| `why` (name rule) | `why` sentence 2 | verbatim |
| `short_answer` | labels_decoded Ground beef (cheek meat), `why` sentence 2 (own name), pick_steps 2 (each a share) | placed |
| `tier_note` | `why` sentence 2 + pick_steps 2 | placed (one tier_note per card) |
| `instead` | `instead` | verbatim |
| `cart_pick` | `cart_pick` | verbatim |
| `buying_tips` 1 / 2 / 3 | pick_steps 2 / buying_tips + / pick_steps 1 (POINTER already there) | placed / verbatim / present |
| `watch_out` 1–3 | `watch_out` + | verbatim |
| `pick_steps` 1 / 2 | pick_steps 2 / watch_out item 3 | rephrased / same sentence |
| `science` | `science` +, each sentence not already present, verbatim. If science passes 70 words, those sentences go to `detail` + (named in the report). | verbatim |
| `detail` | `detail` + | verbatim, except the brand-named examples (D6), which become: "Two label examples: one blend states 8 percent organ meats (4 percent liver, 4 percent heart, 92 percent muscle); another states 92 percent ground beef, 5 percent liver, 3 percent heart." The 9 CFR 319.15(a) 25 percent cheek-meat fact, the 9 CFR 317.2 descriptive-name fact and the NIH figures stay verbatim. |
| `labels_decoded` (2) | `labels_decoded` | verbatim |
| `kristy_take` | `kristy_take` + | rephrased (above) |
| `sources` (5) | `sources` + (D1 exception) | verbatim; the producer pages stay as citations (Q2) |
| `aliases`, `asked_as` | `aliases` +, `asked_as` + | verbatim, deduped |
| `id` | RETIRED + delete | — |
| `title`, `eyebrow_short`, `evidence_tier`, `category` | not moved | the survivor keeps its own |

### Eggs (`egg_labels`, essential)
- **decision:** Pasture-raised, organic, and corn- and soy-free, all three together. [9] (Devon's ladder, best rung)
- **tier_note:** Corn- and soy-free means neither is in the hens’ feed; “soy-free” alone can still mean corn. [16] `card: egg_feed_claims fact, both words printed`
- **instead:** Soy-free, organic, and pasture-raised, then organic and pasture-raised; each keeps pasture and organic feed. [14] `KS`
- **cart_pick:** Pasture-raised organic corn- and soy-free eggs [6]. It replaces "Soy-free pasture-raised eggs", which skipped organic and corn-free.
- **do:** Find all three words on one carton, plus a certifier’s pasture seal. [12] (headline + do = 21)
- **pick_steps:** (1) “Pasture-raised” means time outdoors on pasture, audited only with a certifier’s seal. [12] (G3) (2) “Organic” means certified organic feed and outdoor access. [8] (G4, `CA-2`) (3) Skip “cage-free” and “vegetarian-fed” cartons; neither promises time outdoors. [9] `card: label_cage_free`
- **why:** Hens eat what they are given; the carton words show that feed and that life. [15] `KS`
- **short_answer:** Look for pasture-raised, organic, and corn- and soy-free together. Next is soy-free organic pasture-raised, then organic pasture-raised. A certifier’s seal backs the pasture claim. [24]
- **watch_out:** kept, reordered so that sourcing lines lead and storage/grade lines go last. No item is dropped.
- **buying_tips:** kept, except that the word "cheapest" is rephrased out of its sentence (rule 8, no price). The fact stays.
- **labels_decoded +:** {Corn- and soy-free: The feed contains neither corn nor soy; both words must be printed.}

### Milk (`whole_vs_reduced_fat_milk`, essential)
- **decision:** Raw from a trusted local farmer first, then low-temp pasteurized, 100% grass-fed. [12] (Devon's goal line)
- **tier_note:** Vat, or low-temp, pasteurizing holds milk at 145°F for 30 minutes; regular gets 161°F for 15 seconds. [17] `CA-2 / item-cards-sources pasteurization row` (cut from 20 words, which sat at the cap)
- **instead:** Organic, low-temp pasteurized whole milk: organic rules put cows on pasture through grazing season. [14] `CA-2: 7 CFR 205.237/205.239`
- **cart_pick:** Low-temp pasteurized grass-fed whole milk [6] ("100%" dropped 2026-10-15: the no-price check reads % as a price). Raw milk from a farmer is not a one-tap shelf add, so the pick names the first shelf rung (D1).
- **do:** Check the side panel for the pasteurization words and a grass-fed seal. [12] (headline + do = 24)
- **pick_steps:** (1) Raw means unpasteurized: milk that skipped the heat step. [9] `KS` (2) Next: “vat pasteurized” or “low-temperature” printed with 100% grass-fed. [9] (3) 100% grass-fed on milk means the cows ate grass and hay, never grain. [13] (G2, gate A2)
- **why:** Each step between the cow and the carton changes milk: heat, homogenizing, and skimming. [14] `card (milk_processing fact)` Whole milk keeps its milkfat; reduced-fat milk has some of it removed. [12] `card`
- **short_answer:** Raw milk from a trusted local farmer comes first. Next is low-temp pasteurized, 100% grass-fed whole milk. Ultra-pasteurized milk is heated to about 280°F. [24] `CA-2`
- **watch_out +:** “Ultra-pasteurized” or “UHT” on the carton means about 280°F for a few seconds: skip it. [15] `CA-2`. The existing CDC raw-milk lines and the named-group line (pregnancy, under five, immunocompromised) are kept verbatim.
- **labels_decoded +:** {Vat pasteurized: Held at 145°F for 30 minutes; also printed as low-temperature pasteurized.} {Ultra-pasteurized: Heated to about 280°F for about 2 seconds.} `CA-2`

### Yogurt (`yogurt_plain_vs_flavored`)
- **decision:** Plain Greek yogurt made from 100% grass-fed milk. [8] (Devon's goal line)
- **tier_note:** Plain means no added sugar, so sweeten it at home with fruit or honey. [14] **The use bridge (A): the only one in milestone 1.**
- **instead:** Plain organic whole-milk yogurt, Greek or regular, is next when no 100% grass-fed tub is there. [16] `KS`
- **cart_pick:** Plain Greek yogurt, 100% grass-fed [6]
- **do:** Check the ingredients for milk and cultures, with nothing after them. [11] (headline + do = 19)
- **pick_steps:** (1) Greek means strained, so the yogurt is thicker and holds less whey. [12] `card` (2) 100% grass-fed on the tub means the cows ate grass and hay, never grain. [14] (G2) (3) Skip flavored and fruit-on-the-bottom tubs; that is where the added sugar is. [12] `card`
- **why:** Flavored yogurt carries added sugar; plain is milk and cultures. [10] (the old front, moved here, not deleted) Whole-milk yogurt keeps the milkfat the milk came with. [9]
- **short_answer:** Plain Greek yogurt from 100% grass-fed milk. Plain organic whole-milk yogurt is next. Flavored tubs are where the added sugar is. [22]
- **watch_out:** kept. The "higher protein" sentences are rephrased to the mechanism (strained, thicker), with no macro word. This is pending Q3.
- **labels_decoded +:** {Greek: Yogurt strained to remove whey, which leaves it thicker.} {Plain: No added sugar or flavoring.}

### Berries group card (`berries_picking`, title "Berries"; built in milestone 3)
- **decision:** Organic berries first, then organic frozen berries with nothing added. [10]
- **tier_note:** Berries are eaten whole with no peel; organic means grown without synthetic pesticides beyond a short approved list. [18] (G5, `CA-2`)
- **instead:** With no organic berries, fresh or frozen, pick a peeled fruit such as oranges or bananas. [16] (sideways, a different food; consistent with the skin rule)
- **cart_pick:** Organic berries [2]
- **do:** Turn the carton over and pass on any with juice stains or soft berries. [14] (the old front's "underside decides" fact, kept; headline + do = 24)
- **pick_steps:** (1) A local farm that says it never sprays is a match for organic. [13] `KS` (2) Frozen: the bag should list berries and nothing else. [9]
- **why:** Berries are eaten skin and all, with nothing to peel away. [11] Organic frozen berries carry the same fruit into the freezer aisle. [10]
- **short_answer:** Organic berries, fresh first and frozen next. A local farm that says it never sprays is a match. Turn the carton over and pass on juice stains. [27]
- **watch_out:** kept (the EWG and residue lines).
- **aliases +:** blueberries, blackberries, raspberries, strawberries, mixed berries (only those not already present; S8). **asked_as +:** which blueberries should i buy · are blackberries worth buying organic · fresh or frozen berries.
- **Group behavior:** a list holding "blueberries" and "blackberries" stamps both rows `cardSlug=berries_picking`, and `collapseByCard`/`Walk.collapse` show one Berries card, once.

### Potato chips (`potato_chips`; built in milestone 4)
- **decision:** Sliced potatoes, salt, and a natural fat, never seed oil or avocado oil. [13]
- **tier_note:** A chip is cooked in its fat, so look for tallow, olive oil, or coconut oil on the bag. [19] (G6)
- **instead:** With no bag cooked in those fats, plain salted nuts with no added oil fill the spot. [17] (sideways)
- **cart_pick:** Potato chips cooked in tallow, olive oil, or coconut oil [10] (carries the G6 gloss, so L5(b) passes)
- **do:** Turn the bag over and read the ingredient line first. [10] (headline + do = 23)
- **pick_steps:** (1) Sliced potatoes: “made from dried potatoes” means a shaped dough. [10] (gate A4) (2) Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed. [11] (G7) (3) Avocado oil too: the label cannot prove the oil is pure. [11] `Devon ruling`
- **why:** Potato chips began in 1853 as thin potato slices, fried and salted. [12] `card` A bag that keeps to that holds three ingredients. [9]
- **short_answer:** Look for sliced potatoes, salt, and tallow, olive oil, or coconut oil. Skip seed oils and avocado oil. Chips made from dried potatoes are a shaped dough. [27]
- **watch_out +:** Bags cooked in sunflower, canola, or another seed oil: skip, whatever the front says. [13]
- **labels_decoded +:** {Seed oil: Oil from seeds such as sunflower, canola, soybean, or corn.} {Natural fat: Kristy’s standard: tallow, olive oil, or coconut oil.}

### Section-tip rewrites for the other four sections (CA-5; removes today's trivia)
- **produce.** rule: Choose produce grown organic or unsprayed, and pick it whole and in season. [13] · checks: (1) Local and in season comes first; ask the produce staff what that is this week. [15] (2) Frozen fruit and vegetables with nothing added count as whole food too. [12]
- **seafood.** rule: Wild-caught fish ate its natural diet; choose wild first and ask where it was caught. [15] · checks: (1) Ask the counter where the fish was caught and how. [10]
- **bulk_pantry.** rule: Choose packages with a short list of real ingredients and only natural fats: tallow, olive oil, coconut oil. [18] · checks: (1) Skip seed oils and avocado oil, whatever the front of the package says. [12] (2) The ingredient line tells more than the front; read it first. [11]
- **frozen.** rule: Frozen food counts as whole when the bag lists the food and nothing else. [14] · checks: (1) Frozen meals follow the pantry rule: real ingredients, natural fats only. [11]

## Inventory (182 cards + 31 picks at HEAD `e1aa8d8`; grep of `server/kristy_perimeter_kb.json`)
Codes: **R** rewrite to D1 · **F→x** fold · **G** produce group (←absorbs) · **RT** retire pick · **K** keep; touched only if a new lint fires · **N** new · ★ essential (keeps its id). Walk-section mapping per S2. Every R card's `cart_pick` is brought into agreement with its new front (L5).
**Milestone 1, meat** (categories beef, pork, poultry, meat_counter, deli; S2 confirms):
- CA-3a:
  - ★beef_grassfed_vs_grainfed "Beef" R. Owner of the shared term. Front: "100% grass-fed or grass-finished, no added hormones, with a certifier’s seal." [11]; tier_note carries G1 (gate A1). cart_pick: "100% grass-fed or grass-finished beef" [5].
  - ground_beef_lean_ratio R (worked above).
  - ground_beef_organ_blend F→ground_beef_lean_ratio (placement table above).
  - beef_cuts_basics "Steak" R (cut and whole-muscle, plus POINTER).
  - organ_meats R.
  - butcher_counter_asking R (must not echo tip check 1). cart_pick: "Beef soup bones from the butcher counter" [6], replacing "Grass-finished beef soup bones".
  - ★judging_meat_at_the_case R (the color/smell lines move to the end of watch_out; the front names something only the package shows).
  - bison R · venison_game R · lamb_goat R.
  - pick_soup_bones R (its cart_pick drops any raising term its new front does not print).
- CA-3b:
  - pork_cuts_and_enhanced R · pick_sausage R · pick_jerky R.
  - chicken_cuts_basics R · chicken_breast F→chicken_cuts_basics or R (D8).
  - rotisserie_chicken R · turkey_whole R · ground_turkey R.
  - bacon R · ham R · hot_dogs R · turkey_bacon R · cured_pork R · deli_meat_uncured R.
**Milestone 1, eggs and dairy** (poultry_eggs, dairy):
- CA-4a:
  - ★egg_labels R (worked above) · egg_duck_quail R · pick_egg_whites R.
  - ★whole_vs_reduced_fat_milk R (worked above) · pick_milk RT (aliases → Milk where absent) · raw_milk R (the named-group line stays).
  - yogurt_plain_vs_flavored R (worked above).
  - grassfed_butter "Butter" R · ghee R.
- CA-4b:
  - plain_kefir R · raw_kefir R · sour_cream R · cream_cheese R · cottage_cheese R.
  - cheese_real_vs_processed R · raw_aged_cheese R · goat_sheep_dairy R.
  - cream_vs_creamer R · ice_cream R · dairy_case R (hub; must not echo the tip).
  - Plant milks under the fat rule: almond_milk R · oat_milk R · soy_milk R · coconut_milk_beverage R · plant_butter R (sideways to butter).
**Milestone 2, seafood:** ★salmon_wild_vs_farmed R · shrimp_imported_vs_domestic, white_fish, crab, lobster, scallops, clams_mussels_oysters, smoked_salmon, canned_tuna, canned_fish_choosing, seafood_counter (hub), pick_fish_sticks, pick_anchovies R · mercury_by_fish, farmed_fish_by_species, seafood_certifications K (audit).
**Milestone 3, produce (layer 3):**
- Groups:
  - berries_picking **G** (worked above).
  - produce_leafy_greens G ← pick_swiss_chard, pick_microgreens.
  - produce_brassicas G ← pick_kohlrabi.
  - produce_root_vegetables G ← pick_ginger_turmeric.
  - produce_stone_fruit G ← pick_mangoes.
  - produce_peppers G "Peppers and eggplant" ← pick_eggplant.
  - produce_green_beans G "Beans and peas" ← pick_snap_peas.
  - produce_onions_garlic, produce_apples_pears, produce_citrus, produce_mushrooms G (aliases only).
- New groups:
  - **N produce_herbs** [PLACEHOLDER id] "Herbs" ← pick_cilantro, pick_parsley, pick_basil.
  - **N produce_squash_cucumbers** [PLACEHOLDER id] "Squash and cucumbers" ← pick_cucumbers, pick_zucchini, pick_winter_squash.
- Rewrites: ★organic_worth_it_by_type R (owner of the skin rule) · produce_bananas R · ★produce_ripeness_by_item R · pick_asparagus, pick_corn, pick_okra, pick_celery R.
- Keep:
  - pick_tofu K (its category is preserved).
  - pick_frozen_peas, pick_frozen_broccoli K.
  - frozen_vs_fresh_produce, produce_seasonality, precut_produce_tradeoffs, sprouts_raw K (audit).
  - washing_produce, baking_soda_soak, revive_greens, freezing_produce, produce_storage K (home technique).
- Source needs: USDA PDP residue rows for each group (reuse the IC-2 rows); herbs; cucumbers and squash including the wax-coating declaration.
**Milestone 4, pantry fats and packaged:**
- Fat owners: cooking_oils · lard_tallow · olive_oil_grades · label_cold_pressed_expeller · canned_coconut_milk.
- Packaged R: mayo · potato_chips (worked above) · tortilla_chips · crackers · popcorn · pretzels · snack_bars · trail_mix · snacks (hub) · hummus · nut_butter_ingredients · condiments · ketchup_mustard · salsa · pasta_sauce · canned_soup · deli_salads · prepared_meals · fresh_pasta · deli (hub) · olives · seaweed · nuts_raw_vs_roasted · seeds · dried_fruit · cocoa · nutritional_yeast · pick_canned_tomatoes.
- Frozen R: frozen (hub) · frozen_pizza · frozen_meals · frozen_fries · frozen_waffles · frozen_nuggets.
- Pantry staples, audit only: honey_adulteration · sugars · maple_syrup · salt · broth · vinegar · raw_cider_vinegar · jam · hot_soy_sauce · whole_spices · dried_herbs · bulk_bins_buying · rancidity_check (home).
- Sweep: every card that recommends avocado oil or a seed oil (S9) is R.
**Milestone 5, drinks and alcohol:**
- R: coffee_beans · tea · kombucha · bottled_water_buying · coconut_water.
- pick_juice RT → **N juice** [PLACEHOLDER id].
- **N wine**, **N beer**, **N spirits** [PLACEHOLDER ids]: category `bulk_pantry`, so there is no SECTIONS change.
- Source needs (CA-2 pattern; law.cornell.edu/govinfo for CFR):
  - Juice: 21 CFR 101.30 percent juice · 102.33 blend naming · 101.17(g) unpasteurized warning · "not from concentrate".
  - Wine: 27 CFR 4.32(e) sulfites · 27 CFR 24.246 authorized treating materials · NOP/TTB "organic" vs "made with organic grapes".
  - Beer: 27 CFR part 7 (no ingredient list required) · adjuncts · organic beer.
  - Spirits: 27 CFR 5.22 standards of identity (straight whiskey, bourbon) · 27 CFR 5.23 coloring/flavoring materials.
  - Kombucha: TTB 0.5% ABV guidance.
- Voice: ingredients and process only. No health, benefit, amount or moderation line (no-treatment rule; TTB bars health claims).
**Milestone 6, rest-of-store audit (lint-driven, K unless a lint fires):**
- Grains and bread: rice_arsenic, oats_steelcut_rolled_instant, beans_dried_vs_canned, flour_basics, grains_beyond_rice, specialty_flours, sandwich_bread, sourdough, bagels, tortillas, buns_rolls, sprouted_grain_bread, sprouted_grains, gluten_free_bread, pastries_muffins, breakfast_cereal, muesli, pasta_dry, bread_aisle (hub), pick_english_muffins, pick_pita_naan.
- Ferments: sauerkraut (live_ferment owner), kimchi, fermented_pickles, miso, tempeh, natto, fermented (hub).
- Label decoders (glossary owners, never folded): label_natural, label_made_with_real, label_no_added_hormones, label_nonGMO_vs_organic, label_cage_free, label_grass_fed_term, label_pasture_raised_feed, label_organic_scope, label_multigrain_vs_whole_grain, label_lightly_sweetened, label_no_artificial_flavors, label_front_vs_back, label_ingredient_order, label_third_party_seals, label_sugar_free_substitutes, label_wild_vs_farm_raised, label_serving_size, label_artificial_color.
**Totals, milestone 1:** about 50 ids in meat and eggs_dairy, 2 folds (3 if chicken_breast qualifies), and 1 pick retired. Live `counter_cards` goes 183 → 181 or 180 [re-count after S6]. The pick retirement does not change the table (picks never migrate).

## Scout first (admin-run; ANCHORs come only from VERIFIED lines)
- S1 `dv scout "counterCardLint.js: print the OWNED_FACTS rows for beef_raising, milk_processing, ruminant_grass_term, bird_pig_raising, live_ferment (owner, ownerTitle, family, pattern); the CO_EQUAL, EXCLUSIVITY, HEADLINE_HEDGED and OBSERVABLE_IN_BOTH patterns; the fields lintCulinaryAim checks; the lint test file path; and which existing function a cross-card n-gram check should mirror (lintRepeatedClaim or lintCorpus)." --terms OWNED_FACTS,lintRepeatedClaim,lintCorpus,CO_EQUAL,OBSERVABLE_IN_BOTH,lintCulinaryAim`
- S2 `dv scout "Where is CATEGORY_SECTION defined, and which walk section does each KB category (beef, poultry, poultry_eggs, pork, meat_counter, deli, dairy, seafood, produce, bulk_pantry, label_terms) map to? Do frozen_* ids reach the frozen section by cardSection or by category? Can counterCardLint.js import it without a cycle?" --terms CATEGORY_SECTION,cardSection,SECTIONS`
- S3 `dv scout "sectionRules.json, sectionRules.js, sectionRules.test.js, sectionRulesContent.test.js and the ic3a/ic6a acceptance tests: which assertions pin rule or checks text, the check count, sources ids, or the row's exact key set? Does any server or iOS code read sectionRules sources? Which acceptance test is the best one to mirror?" --terms loadSectionRules,sectionRules,ShopRuleCard,topCard`
- S4 `dv scout "passRule.js path; the ITEM_CARD_REWRITE and HEALTH_FIRST_REWRITE sets and their allowances; the k14.test.js C12 anchor; RETIRED and RETIRED_GENERATED in counterCards.js; the ESSENTIALS ids; the counterReach test path; migrateCounterCards.js dry-run flag name" --terms ITEM_CARD_REWRITE,HEALTH_FIRST_REWRITE,RETIRED,ESSENTIALS,counterReach`
- S5 `dv scout "Every reference outside kristy_perimeter_kb.json, in both repos, to ground_beef_organ_blend, pick_milk and chicken_breast (list.js perimeterId, shortcuts, ESSENTIALS, OWNED_FACTS family, doLines.json, do-lines-review.md, prompts, tests, kristy-ios CardFan.swift and DebugTripFixtures). Is there a recorded reason chicken_breast was not folded at IC-4a?" --terms perimeterId,shortcuts,OWNED_FACTS,chicken_breast`
- S6 `dv ask --role scout "For every id in the meat and eggs_dairy walk sections (per sectionForCategory), print id, title, decision, tier_note, instead, cart_pick, pick_steps, the doLines.json do line and evidence_tier. Print ground_beef_organ_blend and ground_beef_lean_ratio in full, every field. Flag any card whose decision, tier_note or do is handling/storage/safety, and any copy field (not sources/aliases/asked_as) that names a brand, a price word, or an em-dash. Give the per-section count." --cd /Users/m1/kristy`
- S7 `dv ask --role scout "List the source archives (docs/research/*-sources.md, .firecrawl/, docs/sources/) that cover: vat/LTLT, HTST and UHT temperatures; 100% grassfed dairy certifier standards; the FSIS animal-raising-claims guideline (grass fed); organic livestock feed and pasture (7 CFR 205.237, 205.239); pasture-raised egg seal definitions; 9 CFR 319.15; the NIH ODS vitamin A beef liver figure; FDA 'made from dried potatoes'. Mark each present or absent, with its path and SATISFIABLE status." --cd /Users/m1/kristy`
- S8 `dv scout "kristy-ios: do CartList.swift (Home list) and ShopMode.swift both render rows through Walk.collapse/CartBlock? Is there a list surface that bypasses it? Which listMatch.js aliases land 'blueberries', 'blackberries', 'raspberries', 'strawberries' today, and on which slug?" --terms collapse,CartBlock,collapseByCard,attachCards`
- S9 `dv ask --role scout "Grep the KB for 'avocado' and for seed-oil names (canola, sunflower, safflower, soybean oil, corn oil, cottonseed, rice bran) in decision/instead/pick_steps/cart_pick/tier_note; list each id and whether it currently recommends that oil. Print the engine KB seed_oil entry's names." --cd /Users/m1/kristy`
- S10 `dv ask --role scout "Does /Users/m1/kristy/.claude/stakes.json exist (min tier)? Does ~/kristy-corpus (branch corpus) hold unmerged commits touching kristy_perimeter_kb.json, sectionRules.json or doLines.json?" --cd /Users/m1/kristy`
- S11 `dv scout "Every reader of cart_pick in both repos (routes/chat.js publicEntry, listMatch.js, attachOffers, the iOS decode and one-tap add); any lint limit on cart_pick in counterCardLint.js; and the function to call so that a cart_pick string, added as a list item, reports which card slug it matches." --terms cart_pick,publicEntry,attachOffers,attachCards`
- **Reuse, named:** OWNED_FACTS + POINTER, lintRepeatedClaim, RETIRED fold process, the do-lines pipeline, ESSENTIALS, `collapseByCard`, `Walk.collapse`, `ShopRuleCard`, `GET /api/counter/section-rules`. **No new field, table, route, screen, or dedupe code.**

## Intent
A shopper opens shop mode at the meat case. One plain line sits at the top: a local butcher first, then meat from animals raised on grass and open pasture. The Ground beef row names the package to take: an organ blend with percentages, or ground beef with nothing added. A tap shows one sentence of why, and every label word on the card comes with what it means. No card in the section repeats another card or the line at the top. **The moment that must land:** at the dairy case, the yogurt card says plain Greek from 100% grass-fed milk, and in the same breath, to sweeten it at home with fruit or honey.

## Non-goals
- No engine change, no new field, column, SQL, route, or iOS screen. No change to DEPTH_FIELDS, `summarize()`, `forViewer()`, or Ruling F.
- No iOS layout change. Milestone 1 touches iOS only to sync the CardFan copy (main, T0).
- `label_*` decoders and home technique cards are not folded.
- No avocado-oil study search (D7).
- The scan card, the frozen `client/src`, and the web are not touched.
- **Displaces:** the pricing/SIWA launch queue for about 2 days in milestone 1 [PLACEHOLDER]; milestones 2–6 cost about 5 more days [PLACEHOLDER]. Milestone 1 cost: 6 Codex builds + 5 critic@opus + 1 critic@sonnet + 1 researcher + main release + 1 qa.

## Pieces (milestone 1: the system, then meat, eggs and dairy)
All server pieces edit corpus files in strict sequence. Only CA-1 and CA-2 are parallel-safe. The fold pieces exceed 3 files on purpose: a fold lands in one commit or `npm test` goes red on a dangling id (precedent chf-5 `e92e7c9`). After each batch, main re-anchors k14 C12 (chf precedent). Card commits say "Not migrated."

### CA-1 Lint: the repetition budget, tip ownership, term bridge, pick agreement  [T2]
- **What it is:** L1–L5 and the scoped `CANONICAL_GLOSSES` (D3) added to the lint, plus a `CARD_ALIGN_REWRITE` id set in passRule.
- **Files:**
  - `server/lib/counterCardLint.js`
  - the S1 lint test file
  - the S4 `passRule.js`
  - Acceptance: `server/test/acceptance/ca-1.test.js` (not owned; listed in verify).
- **Done means:**
  - Given the KB and sectionRules at HEAD with no `tip_aligned`/`cards_aligned` flags, when `cd server && npm test` runs, then it passes, and every pre-existing rule's hit count is unchanged.
  - Given a fixture tip whose check shares a 5-word phrase with a card in its section, then L1 fires. Given a 4-word overlap, then it does not.
  - Given 3 fixture cards in one section sharing a 6-word phrase in `why`, then L2 fires. Given 2 cards, or a POINTER line, or the G6 phrase, then it does not.
  - Given 3 fronts sharing "100% grass-fed or grass-finished", then L2 does not fire (canonical term exempt).
  - Given a tip check "Take a sealed package that is not leaking.", then L3 fires.
  - **L4, one red and one green fixture per row, each card's category inside that row's scope:**
    - G1: a beef card with decision "100% grass-fed or grass-finished beef" and no G1 gloss fires; with the G1 gloss in `tier_note` it passes. G2's gloss is absent from both and G2 never fires on them (longest match consumed the span, and the meat scope excludes G2).
    - G2: a `dairy` card with decision "Plain yogurt from 100% grass-fed milk" and no G2 gloss fires; with it in `pick_steps` it passes. The same decision on a `poultry_eggs` card is not tested by G2 (category filter).
    - G3 and G4: an eggs_dairy card fires without each gloss and passes with it.
    - G5: a produce card with "organic" in its decision fires without G5, and still fires when it carries only the G4 gloss; with G5 it passes.
    - G6 and G7: a bulk_pantry card fires without each gloss and passes with it.
    - A seafood card with "organic" in its decision is not checked (no scoped row).
    - A table test: no two rows with the same term share a section.
  - **L5:** given a meat card with decision "Organ blend with each organ’s percentage first, then ground beef with nothing added." and cart_pick "Ground beef, grass-fed and grass-finished", then L5(a) fires. With cart_pick "Liver and heart beef blend, shares stated", it passes. Given the egg worked-example decision with cart_pick "Soy-free pasture-raised eggs", then L5(b) fires (organic missing). With "Pasture-raised organic corn- and soy-free eggs", it passes. Given the milk worked-example decision with cart_pick "Low-temp pasteurized 100% grass-fed whole milk", then it passes (no term in the first rung).
  - Given a `CARD_ALIGN_REWRITE` id with a changed decision, tier_note, instead, cart_pick, pick_steps, do or D1 Depth/Glossary field, or added aliases/asked_as, then passRule passes. Added `sources` entries pass only on a fold survivor (ground_beef_lean_ratio; chicken_cuts_basics if D8 folds). Given the same change on an id outside the set, a removed or edited `sources` entry, or a changed `category`/`evidence_tier`, then it fails.
- **Out of scope:** card or tip edits.
- **OK rough edges:** the n-grams are lexical (a paraphrase passes; the critic owns the spirit). L5 is lexical too: a cart_pick that names a different rung in other words passes.
- **Ship bar:** any existing rule loosened; L1/L2/L4/L5 active on a section without its flag; HEAD red.
- **Route:** dv T2 (fallback forge@opus); critic@opus. **Parallel-safe:** yes, with CA-2. **Dial:** P1. **Independent check:** a `node -e` run over all cards printing hits per rule, before and after. It must be identical for the old rules. Running L1/L2/L4/L5 with every flag forced on prints the meat and eggs_dairy baseline (the expected work list for CA-3/CA-4).
- **Dispatch:** spec `.pipeline/specs/ca-1.md`.

### CA-2 Source pack  [researcher]
- **What it is:** fetched quotes for every `CA-2` tag and gates A1–A4. Rows that S7 marks as already archived and SATISFIABLE are reused, not refetched.
- **File:** `docs/research/card-align-sources.md` [new-file].
- **Done means:**
  - Given each row (FSIS grass-fed guideline; 100% grassfed dairy certifier standard; 7 CFR 205.237 and 205.239; pasture-raised egg seal definitions; PMO pasteurization temperatures, if not already archived; UHT temperature; 9 CFR 319.15 text, including the hamburger beef-fat clause; NIH ODS beef liver vitamin A and the adult UL; FDA "made from dried potatoes"), then the file has one block: verbatim URL, quote, SATISFIABLE / NOT.
  - Each URL has a `.firecrawl/*.md` scrape file.
- **Out of scope:** avocado oil (D7); drinks and alcohol rows (milestone 5).
- **OK rough edges:** NOT rows. Their sentence is cut, and the gate's fallback wording ships.
- **Ship bar:** a URL with no scrape file; a quote that is not in its scrape file.
- **Route:** researcher@sonnet with Firecrawl [T1] (.gov 403s on this box → law.cornell.edu / govinfo.gov). **Parallel-safe:** yes, with CA-1. **Dial:** P2 (external unknowns A1–A4). **Independent check:** `grep -c` of URLs in the pack equals the count of matching scrape files.

### CA-3 Meat batch  [T2]: CA-3a beef, game and organs (1 fold), then CA-3b pork, poultry and deli
- **What it is:** every meat id rewritten to D1 under the D2 ownership rule.
- **Files (a):**
  - `server/kristy_perimeter_kb.json`
  - `docs/do-lines-review.md`
  - `server/lib/doLines.json` (via `node server/scripts/buildDoLines.js`)
  - `server/lib/counterCards.js` (RETIRED)
  - the S4 counterReach test
  - the S5 reference files for ground_beef_organ_blend
- **Files (b):** the first three of (a), plus the chicken_breast references if S5 approves the fold.
- **Done means:**
  - Given ground_beef_lean_ratio, then every field the worked example writes equals it verbatim, except where a gate's fallback applies (named in the report). Every row of the fold placement table holds in the KB: each fold field's text, or its stated rephrase, is found in its destination field.
  - Given the survivor's labels_decoded, then no entry contains an em-dash, and the 25 percent cheek-meat sentence is present.
  - Given beef_grassfed_vs_grainfed, then its decision equals the inventory front, and its tier_note or pick_steps carries G1 (or the A1 fallback).
  - Given every meat id other than beef_grassfed_vs_grainfed, bison, venison_game and lamb_goat, then neither its decision nor its cart_pick matches `/grass-(fed|finished)/i`. The ids that fold their raising into Beef carry the POINTER.
  - Given the cart_picks of ground_beef_lean_ratio, butcher_counter_asking and beef_grassfed_vs_grainfed, then each equals the string in this plan.
  - Given the meat section with flags forced on in the acceptance test, then L1 = 0 against the meat tip text above, and L2, L4 and L5 = 0.
  - Given every batch id: decision ≤14 words; tier_note one sentence, 5–20 words; `instead` non-empty; pick_steps 1–3.
  - The brand grep over copy fields = 0. `grep -ciE "healthier|healthiest|better for you|lowers|exposure|protein|calorie"` over changed fields = 0. The price grep `grep -ciE '\bcheapest\b|\bprice\b|\$[0-9]'` over changed copy fields = 0.
  - The migration dry-run shows exactly ground_beef_organ_blend deleted (plus chicken_breast in b, if folded).
  - Every asked_as of a folded id lands on its survivor in counterReach.
  - `listMatchProbe.js` 0 wrong; `npm test` green. A claim-trace table has one row per new sentence.
- **Out of scope:** the tips (CA-5); seafood.
- **OK rough edges:** an id left unchanged because it already meets D1 (reported as KEPT).
- **Ship bar:**
  - an untraced claim, or a numbered fact missing from the survivor;
  - a ground_beef_organ_blend field with no destination, or a destination that does not hold it (the fold placement table);
  - a cart_pick that prints a shared term its front does not print, or that still reads as before on a card whose front changed rung;
  - an ESSENTIALS id retired or reordered;
  - a shortcut or perimeterId pointing at a deleted id;
  - a safety line deleted;
  - an em-dash or a straight quote;
  - a first-person word.
- **Route:** dv T2 (fallback forge@opus); critic@opus, `FIDELITY required`. **Parallel-safe:** no. **Dial:** P1. **Independent check:**
  - the S5 reference count before equals moved + deleted after;
  - a word-count script over the batch ids;
  - the L2 and L5 hit lists for meat go from the CA-1 baseline to 0;
  - each changed cart_pick, passed to the S11 matcher as a list item, reports its own card's slug.

### CA-4 Eggs and dairy batch  [T2]: CA-4a eggs, milk, yogurt, butter (1 pick retired), then CA-4b the rest of dairy and the plant milks
- **What it is:** every eggs_dairy id rewritten to D1. Eggs, Milk and Yogurt fronts follow Devon's goal lines.
- **Files (a):**
  - `server/kristy_perimeter_kb.json`
  - `docs/do-lines-review.md`
  - `server/lib/doLines.json`
  - the S5 reference files for pick_milk
- **Files (b):** the first three of (a).
- **Done means:**
  - Given egg_labels, whole_vs_reduced_fat_milk and yogurt_plain_vs_flavored, then every field equals its worked example verbatim (cart_pick included), gate fallbacks named.
  - Given egg_labels, then no copy field contains "cheapest", and the fact its buying_tips sentence carried is still present.
  - Given the milk decision, then HEADLINE_HEDGED does not fire, and the CDC raw-milk lines and the named-group line are byte-identical to HEAD. Given the milk card, then no field contains "test results".
  - Given any eggs_dairy id other than yogurt_plain_vs_flavored, then no `tier_note` matches the D4 use-bridge pattern.
  - Given pick_milk, then it is absent from the KB, and "milk", "whole milk" and "a gallon of milk" land on whole_vs_reduced_fat_milk in `listMatchProbe.js`.
  - Given oat_milk, almond_milk, soy_milk, coconut_milk_beverage and plant_butter, then any seed oil in their ingredient guidance is a skip, and each carries G7 where it names seed oil.
  - L1 = 0 against the eggs_dairy tip text; L2, L4 and L5 = 0 (flags forced in the acceptance test).
  - Brand grep = 0; the claim-lock grep = 0; the price grep = 0; probe 0 wrong; `npm test` green; claim-trace table.
- **Out of scope:** meat; produce.
- **OK rough edges:** the yogurt protein sentence kept as written, if Devon answers Q3 "keep".
- **Ship bar:** as CA-3, plus any raw-milk risk sentence altered.
- **Route:** dv T2 (fallback forge@opus); critic@opus, `FIDELITY required`. **Parallel-safe:** no. **Dial:** P1. **Independent check:** a diff of the milk `watch_out` against HEAD shows additions only; the L2 and L5 hit lists for eggs_dairy go to 0; each changed cart_pick, passed to the S11 matcher, reports its own card's slug.

### CA-5 Section tips and section flags  [T1]
- **What it is:** all six tips replaced with the text above, verbatim. `tip_aligned: true` on all six; `cards_aligned: true` on meat and eggs_dairy only.
- **Files:**
  - `server/lib/sectionRules.json`
  - `server/test/sectionRulesContent.test.js`
  - `server/test/sectionRules.test.js` (only if S3 shows it pins text)
- **Done means:**
  - Given `GET /api/counter/section-rules`, then the six rows' `rule`/`checks` equal this plan's strings byte-for-byte, and each row's keys are exactly `section, rule, checks` (no slug, id or sources).
  - Given `npm test`, then L1 = 0 on all six sections, L3 = 0, and L2/L4/L5 = 0 on meat and eggs_dairy.
  - Every rule is ≤20 words, every check ≤16, ≤3 checks per row.
- **Out of scope:** card text; iOS (ShopRuleCard already renders the served rule).
- **OK rough edges:** produce, seafood, pantry and frozen tips are reworded again in their milestone if their card batch shows a better principle.
- **Ship bar:** a served card link; any L1/L3 hit; meat or eggs_dairy cards red under L2/L4/L5.
- **Route:** dv T1 (fallback forge@sonnet); critic@sonnet. **Parallel-safe:** no (it flips lints over CA-3/CA-4 output). **Dial:** P1. **Independent check:** `curl` the local endpoint and diff it against the plan strings.

### CA-6 Release, CardFan sync, rendered check, Devon's device gate  [main]
1. Run `cd server && npm test` (last 2537/0 on main, 2026-10-14, `e1aa8d8`; record the new count), `node server/scripts/listMatchProbe.js` → 0 wrong, and `node server/scripts/commitGuard.js`.
2. Run the migration dry-run (S4 flag), diffing the KB against the table first. Expected: 2 or 3 deleted, about 48 updated, 0 inserted [re-count]. Then migrate, commit "… Migrated.", push `main` and `main:held`, run the four-step verify, re-count, and update the CLAUDE.md corpus count. Read back: the row count equals KB cards + 1 generated; folded slugs return 0 rows; 10 sampled decisions and their cart_picks are byte-equal to the KB, and each sampled cart_pick passes L5 against its decision.
3. kristy-ios (T0, copy only): change the egg/beef/milk strings in `Kristy/Surfaces/Auth/CardFan.swift` to the migrated decisions, verbatim (grep). Run `bash Tools/checks/runners_compile.sh`, commit, push.
4. **Rendered check (simulator; the UI suite is not re-run):**
   - (a) In shop mode, the meat and dairy sections each open with the new tip, and tapping it opens no card.
   - (b) A list with "ground beef" and "organ blend ground beef" shows one Ground beef card, once (`Walk.collapse`).
   - (c) A **baseline** list with "blueberries" and "blackberries": record whether one Berries card shows. This is not a milestone 1 ship bar; it becomes milestone 3's first criterion.
   - (d) The one-tap add on Ground beef and on Eggs puts the new cart_pick in the list, and the added row shows its own card.
   - Screenshots go under `.pipeline/runs/ca-6/`.
5. Upload with `bash ~/kristy-ios/Tools/testflight.sh` and report the build number.
6. **Gate:** Devon reads Ground beef, Eggs, Milk, Yogurt and the two tips on device before any milestone 2 plan is dispatched.
- **Ship bar:** a count mismatch; a folded slug answering; a tip that links a card; a one-tap add that puts an old cart_pick in the list. **Dial:** P1. **Independent check:** the readback in step 2.

### CA-7 QA  [qa@sonnet]
- Ask the live counter API: ground beef, organ blend, steak, beef, eggs, pasture raised eggs, milk, raw milk, a gallon of milk, yogurt, greek yogurt, butter, oat milk.
- Each must land on its survivor, with the front, the why line, `instead` and `cart_pick` present, the cart_pick equal to the KB, and no brand in any copy field.
- Ask `GET /api/counter/section-rules`: six rows, no card key.
- ≤8 findings. Blockers and majors become the next plan's first pieces.

## Follow-on milestones (each gets its own plan, in this same shape, after the CA-6 gate)
- **M2 seafood:** batch plus tip alignment.
- **M3 produce layer 3:** groups and absorbed picks. The CA-6 4(c) dedupe check becomes the ship bar.
- **M4 pantry fats and packaged:** the avocado/seed-oil sweep, plus the frozen items.
- **M5 drinks and alcohol:** researcher first, then new entries.
- **M6 rest-of-store audit:** driven by L2/L4/L5 with every flag on.

## Dispatch prompts
- **Specs.** `.pipeline/specs/ca-{1,3a,3b,4a,4b,5}.md` are written by a **planner re-dispatch after S1–S11 return**. This dispatch may write only this plan file. `## Contract` dependents come only from S2/S4/S5/S11, `## Acceptance` blocks go under `server/test/acceptance/`, and ANCHORs come only from VERIFIED scout lines. Each spec embeds the worked-example strings, the fold placement table and the tip strings from this plan, verbatim, as acceptance fixtures.
- **Each Codex piece:**
  1. `dv check <spec>` → PASS
  2. `dv route T<n> --plan docs/CARD-ALIGNMENT-PLAN.md`
  3. `dv build <spec>`, in the background
  4. Critic: critic@opus (critic@sonnet for CA-5): "[T<n>] RUN <runs dir>, runId <id>, SPEC <spec>, FIDELITY required. Item 1: grep every changed sources URL and every CA-2 quote against docs/research/*-sources.md and the .firecrawl scrapes. Item 2: claim-trace table, one row per new sentence. Item 3: worked-example strings byte-equal, and every fold placement row holds. Item 4: D2 ownership (no sibling front or cart_pick prints a shared term unless its goal line names it; no tip echo; L5 = 0). Item 5: claim-lock, brand and price greps = 0. Report ≤30 lines."
- **Fallback:** forge@opus [T2] (forge@sonnet [T1] for CA-5), `SPEC <spec>`.
- **CA-2:** researcher@sonnet [T1]. Prompt: "Firecrawl only. Rows: the CA-2 Done-means list in docs/CARD-ALIGNMENT-PLAN.md; skip any row S7 marks archived and SATISFIABLE. Do not search for avocado oil. .gov via law.cornell.edu or govinfo.gov. [new-file] docs/research/card-align-sources.md, one block per row: verbatim URL, fetched quote, SATISFIABLE/NOT. Every URL needs a .firecrawl scrape. Verify: grep -c of URLs in the pack equals the count of matching scrape files. Report ≤30 lines."
- **Verify (every server piece):**
  - `cd server && npm test` → green, new count recorded
  - `node server/scripts/listMatchProbe.js` → 0 wrong
  - `node server/scripts/commitGuard.js` → clean
  - `cd server && node scripts/migrateCounterCards.js --dry-run` (S4 flag) → only this batch's ids changed
  - The commit message names the do-lines table and says "Not migrated."

## What broken looks like
- The meat section still opens with "Judge by seal and smell" or any sealed/leaking line.
- Tapping a section tip opens an item card.
- Ground beef, Steak and Organ meats each print the grass-fed phrase in their front.
- The one-tap add on Ground beef puts "grass-fed and grass-finished" beef in the list, or the Eggs add leaves out organic.
- The meat tip and the Beef card print the same sentence.
- A card's front says "100% grass-fed" and nothing on the card says what that means.
- The milk front reads "if you can get it", or the raw-milk risk line is gone.
- A card other than yogurt tells the shopper how to use the food.
- Any card names a brand in its copy, a price, a protein figure, or "I".
- "organ blend" or "a gallon of milk" misses, or lands on a retired id.
- The Ground beef card loses the organ-blend vitamin A number, the 25 percent cheek-meat fact, or the descriptive-name rule.
- After milestone 3, blueberries and blackberries render two Berries cards.

## Risks
1. **The A1 grass-fed gloss may be false as Devon worded it.** FSIS guidance may already require grass/forage-only feed for an unqualified "grass fed". Early check: CA-2's FSIS row lands before the CA-3a spec is written; the A1 fallback is pre-written.
2. **L2 baseline noise.** Shared stock phrases across the corpus could make the repeat lint unworkable. Early check: the CA-1 forced-flag baseline. If meat + eggs_dairy show more than 40 hits [PLACEHOLDER], thresholds (n=6, N=3) are revisited before CA-3.
3. **Card view after B.** Without the grass-fed word, the Ground beef front leans on the POINTER and the meat tip. Early check: the CA-6 device gate, before any other section repeats the pattern.

## Open questions (Devon's call only)
- **Q1.** Eggs and dairy are one walk section with one tip (default, as written above). Or should dairy get its own tip? That means a SECTIONS change that moves the iOS walk order.
- **Q2.** Brand words in preserved fields:
  - aliases and asked_as (driscoll/driscolls/driscoll’s; "are driscolls strawberries safe");
  - source entries (the egg and chip sources; the organ-blend makers).
  - Default: keep them. They are the shopper's own words for matching and the citation of record; copy fields go brand-free.
- **Q3.** The yogurt "higher protein" sentences: rephrase to "strained, so thicker" and drop the macro word (default, under "not a calorie tracker"), or keep them under "rephrase, never delete"?
- **Q4.** Alcohol cards (milestone 5) may change the App Store age rating (alcohol references). Confirm before M5 is planned.
