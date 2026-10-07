# K3 — Every way a shopper writes a list word (Track K, list layer)

Drafted 2026-10-07 by the planner on `corpus` (`b82d18f`). **Nothing here is built or migrated.**

**Problem.** A shopper writes "fish" (meaning salmon), "veggies", "oil" or "salt" and the row gets nothing, or gets a narrow card about something else.
**Need.** Every word a shopper writes lands on the right layer. (1) A broad word lands on a hub that holds whichever member they had in mind. (2) A group word or species lands on the shared group card. (3) A common item lands on its own card. Nothing gets stolen on the way.

**Measured vs traced.** The planner had no shell, so nothing below was run. Every "today" cell was hand-traced from `scorePool` (perimeter.js:169–224) and `matchItemToCard` (listMatch.js:201). **K3-0a replaces this column with measured output before any build is dispatched.** A mismatch between the trace and the run is the first finding.

**Three mechanics drive every row (read from source):**
- **M1. Exact-word scoring.** `scorePool` matches whole aliases with no plural folding. "cooking oils" never hits "cooking oil"; "fries" never hits "frozen fries". 12 of the 15 K25 residue rows are this miss.
- **M2. Row labels with "and".** "ginger and turmeric root" and "pita and naan" miss only because `aliasCoversRow` needs every word, "and" included, inside one alias. **K25 was wrong about these two:** `pick_ginger_turmeric` (KB:7067) and `pick_pita_naan` (KB:8591) both exist. All 15 residue rows are wording; none needs a new card.
- **M3. The buying alias is steal-proof by construction.** `which <word> should i buy` goes in `aliases` AND `asked_as`, on exactly one card. It reaches a bare row only through the fallback at perimeter.js:198, which fires only when NO alias hit anywhere, the row is ≤3 words and has no stopwords. Every compound row ("olive oil", "fish sauce") already has an alias hit, so the fallback never sees it. That is why `meat` → `meat_case` and `seafood` → `seafood_counter` work today. **M3 is the default for every broad word, never a bare alias.** A bare alias is used only where M3 cannot fire (the row carries an alias hit, e.g. "sweetener"); each such exception is listed below.

## Sweep: list word → today (TRACED) → target

Layer key: L1 = hub, L2 = group card, L3 = dedicated card. ✓ = already correct (becomes a baseline probe row).

| Section | List word(s) | Today (traced) | Target | Mechanism | Piece |
| --- | --- | --- | --- | --- | --- |
| Seafood | fish | none (no bare alias, no owner of "which fish should i buy", title hits 1 < floor 2) | L1 `seafood_counter` | M3 + hub clause holding salmon/oily fish | K3-1 |
| Seafood | seafood | `seafood_counter` ✓ (M3 already) | L1 | — | baseline |
| Seafood | shellfish | none | L1 `seafood_counter` | M3 | K3-1 |
| Seafood | cod, grouper, snapper, red snapper, mahi mahi, mahi, sole, whiting, rockfish, sea bass, branzino, perch, walleye, swai, basa, monkfish | none (only compounds like "cod fillets") | L2 `white_fish` | aliases | K3-1 |
| Seafood | halibut, tilapia, haddock, pollock, flounder, hake, white fish, fish fillets | `white_fish` ✓ | L2 | — | baseline |
| Seafood | salmon | `salmon_wild_vs_farmed` ✓ (KB order wins any tie with `fish_freshness_at_counter`'s "salmon") | L3 | — | baseline |
| Seafood | salmon fillets, wild salmon | measure: the head "fillet" may reject the salmon card and fall to `fish_freshness_at_counter` | L3 salmon | aliases | K3-1 |
| Seafood | salmon/tuna/halibut/swordfish steak(s) | **`beef_cuts_basics`**, a live steal: bare "steak" (KB:382) ties at 2 and wins on KB order. The probe's overlap rule calls it CORRECT because "steak" is shared | owner per species | "<x> steak(s)" aliases (3 > 2) | K3-1/K3-2 |
| Seafood | tuna | `fish_freshness_at_counter` (bare "tuna", KB:3095) | Q2 → `canned_tuna` | move alias | K3-2 |
| Seafood | ahi, ahi tuna, tuna steak | `fish_freshness_at_counter` / `beef_cuts_basics` | L3 new `tuna_steak` | new card | K3-2 |
| Seafood | trout · catfish | none ("farmed trout"/"smoked trout" are compounds) | L3 new `trout` · `catfish` | new cards | K3-2 |
| Seafood | swordfish | `mercury_by_fish` (a comparison card; breaks the no-redirect rule on this row) | L3 new `swordfish` (title +1 wins) | new card | K3-2 |
| Seafood | shrimp, crab, scallops, lobster, clams, mussels, oysters, fish sticks, sardines, anchovies, canned fish, smoked salmon | existing owners ✓ (measure) | — | — | baseline |
| Meat | meat ✓ (M3) · meats → none | `meat_case` | L1 `meat_case` | M3 "meats" | K3-4 |
| Meat | chicken | `air_chilled_chicken` (bare alias KB:546), a narrow card | Q4 → `chicken_cuts_basics` | move alias | K3-4 |
| Meat | beef · pork · steak · lunch meat | `beef_grassfed_vs_grainfed` · `pork_cuts_and_enhanced` · `beef_cuts_basics` · `deli_meat_uncured` ✓ | keep | — | baseline |
| Meat | duck | none (`duck_meat` has only compounds) | L3 `duck_meat` | M3 | K3-3 |
| Meat | ground meat, turkey, lamb, bison, venison, sausage, poultry | measure | per K3-0a | per K3-0a | K3-4 |
| Produce | produce | `produce_ripeness_by_item` ✓ (bare alias KB:3369) | L1 | — | baseline |
| Produce | fruit, fruits, vegetables, veggies, veggie · greens | none (title hits 1 < 2) · measure | L1 `produce_ripeness_by_item` · L2 `produce_leafy_greens` | M3 ×6 + hub clause | K3-4 |
| Produce | ginger, turmeric | `pick_ginger_turmeric` ✓ (M2) | — | universe `list_words` | K3-3 |
| Eggs/Dairy | eggs · cheese · yogurt · butter · goat milk, goat cheese, sheep cheese | `egg_labels` · `cheese_real_vs_processed` · `yogurt_plain_vs_flavored` · `grassfed_butter` · `goat_sheep_dairy` ✓ | keep | — | baseline |
| Dairy | dairy · milk, cream | none (no owner of "which dairy should i buy") · measure | L1 `dairy_case` · per K3-0a | M3 | K3-4 |
| Bread | bread | `sandwich_bread` (owns "which bread should i buy" in asked_as) | Q4 → L1 `bread_aisle` | move | K3-4 |
| Bread | breads · buns · rolls | none | `bread_aisle` · `buns_rolls` · `buns_rolls` | M3 | K3-3/4 |
| Bread | pita, naan | `pick_pita_naan` ✓ (M2) | — | universe `list_words` | K3-3 |
| Pantry | oil · cooking oils | none · none (M1) | L1 `cooking_oils` + hub clause holding olive/avocado/coconut | M3 + alias "cooking oils" | K3-3/4 |
| Pantry | salt · seeds · tea · vinegar · sugar, sweeteners | none ×6 | `salt` · `seeds` · `tea` · `vinegar` · `sugars` | M3 | K3-3 |
| Pantry | sweetener | the label card hits but is skipped as non-aisle, so M3 cannot fire → none | `sugars` | bare alias (exception) | K3-3 |
| Pantry | baking soda · baking powder | measure (`baking_soda_soak` may be home) · `baking_soda_powder` | `baking_soda_powder` | alias if needed | K3-3 |
| Pantry | sauce · spices · beans · nuts · rice · flour · honey · broth, stock | none · `whole_spices` ✓ · cards ✓ · measure | `condiments` for sauce | M3 | K3-4 |
| Snacks/Frozen/Deli/Drinks | snacks, chips, frozen, deli, juice, coffee, water | measure | the K2 broad card per section | M3 where none | K3-4 |
| Frozen | fries · waffles · nuggets | none ×3 (M1) | `frozen_fries` · `frozen_waffles` · `frozen_nuggets` | M3 | K3-3 |

## Collision check per generic: a bare alias (rejected) vs M3 (chosen)

All traced. K3-0a measures every compound row today, and each piece's acceptance test asserts the compound rows are unchanged. On the list path, `aliasNamesHead` rejects any compound whose head word differs ("fish sauce" has the head "sauce"). The bare-alias damage is where the head is the bare word, plus the ask path, which has no head guard.

| Generic | Compound rows checked | Damage a bare alias would do (traced) | With M3 |
| --- | --- | --- | --- |
| fish | fish sauce, fish sticks, fish oil, fresh fish, smoked fish, fish tacos, goldfish | List path safe (head guard; longer aliases win). Ask path: +2 to every question that says "fish" → hub steal | unchanged |
| oil | olive oil, coconut oil, sesame oil, fish oil, motor oil, baby oil | olive keeps (3 > 2). **Fish oil, motor oil and baby oil land on `cooking_oils`** | unchanged (none) |
| salt | salted butter, salt pork, sea salt, garlic salt, epsom salt | salted butter safe (word boundary), salt pork rejected. **Epsom salt lands on `salt`** | unchanged |
| tea · seeds · vinegar | iced tea, tea tree oil · bird seed, sesame seeds · cleaning vinegar, balsamic | **Bird seed lands on `seeds`; cleaning vinegar lands on `vinegar`** | unchanged |
| duck | duck eggs, duck fat, duck sauce | eggs keep (3 > 2); fat and sauce rejected by the head guard | unchanged |
| bread | garlic bread, banana bread, bread crumbs, bread flour | **Garlic bread and banana bread land on the bread hub** | unchanged |
| fries · nuggets · waffles | sweet potato fries · chicken nuggets · waffle mix | sweet potato fries land on `frozen_fries` (acceptable); waffle mix rejected | unchanged |
| sweetener (bare alias, the exception) | artificial sweetener, monk fruit sweetener | the label card is skipped, so **`sugars` attaches**. The critic judges whether the card holds this | same |

## Content stance (every K3 criterion; NN2/3/6/8/9 unchanged)

- **Holistic.** Raw milk, farmers market, whole food. No treatment, prevention or bodily claim. No price. No negative claim about a named brand. Zero first person.
- **No-redirect rule (Devon, 2026-10-07).** A card coaches only the item it is on: its `decision`, `cart_pick`, `buying_tips` and do line name only its subject or a member of its family. `grep -iE "instead|swap|rather than|switch to"` over those fields on every card K3 creates or edits returns 0 hits.
- **A hub holds its members.** The fish hub tells a salmon shopper something true about salmon; the oil hub does the same for olive oil; the produce hub for a fruit and a vegetable. Each clause traces to an archived source.

## Scout first (admin-run; only VERIFIED lines become ANCHORs)

1. `dv ask --role scout "print decision, cart_pick, title for seafood_counter, produce_ripeness_by_item, cooking_oils, chicken_cuts_basics, bread_aisle, mercury_by_fish, canned_tuna, fish_freshness_at_counter, salmon_wild_vs_farmed, sugars" --cd /Users/m1/kristy-corpus`
2. `dv scout "which tests pin 'which bread should i buy' on sandwich_bread or bare 'chicken' on air_chilled_chicken or bare 'tuna' on fish_freshness_at_counter" --terms counterReach,OWNED_BY,MODIFIED_ROWS`
3. `dv scout "kindFor result for baking_soda_soak; does baking_soda_powder carry 'baking soda'" --terms kindFor`
4. `dv scout "K24 spec and acceptance file to mirror; seafood source archive dir from K16" --terms k24,k16`
5. *Does anything already do part of this?* Answered: the M3 fallback (perimeter.js:198) and `--universe` mode (listMatchProbe.js:92). Reuse both; no new matcher code.

## Pieces (BUILD/PASS shapes, verification and dispatch as in K2-COVERAGE-PLAN.md "Shared blocks")

**K3-0a Measure.** Run a read-only node script under `$TMPDIR` that imports `attachCards` and `scoreEntries` in-process (no network) over every word in the sweep and every compound row above, printing word → card/pick → top-3 ids and scores. The admin pastes the output into this plan's "today" column.
- **Files:** none in the repo. **Done means:** given the run, every traced cell is confirmed or corrected in the plan. **Ship bar:** any cell left "measure".
- **Route:** main [T0]. **Parallel-safe:** yes. **Dial:** P1. **Independent check:** "fish" → none and "salmon steak" → `beef_cuts_basics` reproduce.

**K3-0b List-word probe.** Add optional `list_words: []` to `--universe` rows: when present, each word goes through `attachCards`; the row counts covered only if every word attaches, and is WRONG if any word attaches an id ≠ `expect`. Print `MISSING n` and exit 1 under `--strict`. Create `docs/coverage/list-words.json` holding only the ✓ baseline rows, each with `expect`.
- **Files:** `server/scripts/listMatchProbe.js`, `docs/coverage/list-words.json`, `server/test/acceptance/k3-0.test.js`.
- **Done means:** given a fixture row `list_words: ["pita","naan"]`, `expect: "pick_pita_naan"`, it counts covered; given a word expected on a different id, exit 1; given `--strict` on list-words.json, 0 wrong and 0 missing. **Out of scope:** KB edits. **Ship bar:** default probe mode output changes.
- **Route:** `dv T1` (fallback forge@sonnet [T1]); critic@sonnet. **Parallel-safe:** yes, with K3-0a. **Dial:** P1.
- **ANCHOR server/scripts/listMatchProbe.js:104**
  ```
      const row = attachCards({ items: [{ name: u.item, source: 'user' }] }, { log: false }).items[0];
      const got = row.cardSlug || row.pickId || null;
      if (u.mechanism === 'carried') { carried.push({ item: u.item, got }); continue; }
  ```

**K3-1 Seafood L1 + L2 (PASS-like edit on 3 cards, no new cards).** `seafood_counter` gains M3 for fish and shellfish plus one archived clause on fatty fish (salmon: colour, white fat lines, smell). `white_fish` gains the 16 species aliases, halibut steak(s), and 3+ `asked_as` naming grouper/snapper. `salmon_wild_vs_farmed` gains salmon fillet(s), wild salmon, salmon steak(s).
- **Files:** `server/kristy_perimeter_kb.json` (those 3 ids only), `docs/coverage/list-words.json` (seafood rows), `server/test/acceptance/k3-1.test.js`. Sources: reuse the K16 archive; a new clause without an archived quote leaves the piece.
- **Done means:** given every seafood list word, `--strict` shows 0 wrong / 0 missing; given the collision rows (fish sauce, fish sticks, fish oil, fresh fish, canned fish, smoked fish, ask "what should fish smell like"), each match is unchanged from K3-0a; `lintCard` + `readability` give []; the no-redirect grep gives 0.
- **Out of scope:** new cards, tuna. **OK rough edges:** `white_fish` detail still names only 4 species. **Ship bar:** any steal, uncited clause, or NN breach.
- **Route:** `dv T2` (fallback forge@opus [T2]); critic@opus `FIDELITY required`. **Parallel-safe:** no (the KB is serial). **Dial:** P1. **Independent check:** the K3-0a before/after table for the 7 collision rows.

**K3-2 Seafood L3 (BUILD a + b, 4 cards).** `trout`, `catfish` (the U.S. catfish label rule, fetched from govinfo/cornell), `tuna_steak` (ahi; "sushi grade" as label truth), `swordfish` (the FDA/EPA advice as the archive states it, naming no other fish); "<x> steak(s)" aliases; bare "tuna" moves to `canned_tuna` per Q2. Pins: cards 202 → 206, do lines +4.
- **Files:** BUILD a `docs/sources/k3-2/`; BUILD b the KB, `docs/do-lines-review.md`, `server/lib/doLines.json`, `server/test/acceptance/k3-2.test.js`.
- **Done means:** the K2 BUILD b block, plus: "swordfish" lands on `swordfish`, not `mercury_by_fish`; "farmed trout" and "smoked trout" are unchanged.
- **Route:** a researcher@sonnet [T1]; b `dv T2` (fallback forge@opus [T2]); critic@opus. **Dial:** P1.

**K3-3 Residue: the 15 K25 rows (aliases only, no prose).** M3 + plural aliases on `salt`, `sugars` (+ the bare "sweetener" exception), `cooking_oils` (alias "cooking oils"), `seeds`, `tea`, `vinegar`, `baking_soda_powder`, `duck_meat`, `buns_rolls`, `frozen_fries`, `frozen_waffles`, `frozen_nuggets`, `goat_sheep_dairy`; `list_words` on all 15 universe rows, labels byte-identical.
- **Files:** the KB (those ids' `aliases`/`asked_as` only), `docs/coverage/universe.json`, `server/test/acceptance/k3-3.test.js`.
- **Done means:** `--universe docs/coverage/universe.json --strict` gives 206/206, 0 wrong; the collision rows (olive oil, epsom salt, salted butter, bird seed, cleaning vinegar, duck eggs, duck sauce, chicken nuggets) are unchanged; counterReach 0 fail.
- **Out of scope:** card prose, including the oil hub clause (K3-4). **Ship bar:** any changed compound match or a reworded universe label.
- **Route:** `dv T1` (fallback forge@sonnet [T1]); critic@sonnet. **Dial:** P1.

**K3-4 Broad words outside seafood (L1 hubs + moves).** M3 for meats, fruit(s), vegetables, veggies, veggie, greens, dairy, breads, oil, sauce, plus whatever K3-0a leaves "none" in snacks/frozen/deli/drinks. One archived hub clause each on `produce_ripeness_by_item` (holds a vegetable) and `cooking_oils` (holds olive oil). Q4 moves: "which bread should i buy" → `bread_aisle`; bare "chicken" → `chicken_cuts_basics`.
- **Files:** the KB (named ids), `docs/coverage/list-words.json`, `server/test/acceptance/k3-4.test.js`. The `MODIFIED_ROWS`/`OWNED_BY` edits the moves need go in this piece's spec, per scout 2.
- **Done means:** list-words.json `--strict` gives 0 wrong / 0 missing; garlic bread, banana bread, bread crumbs, rotisserie chicken, chicken nuggets, olive oil, fish oil, pasta sauce and hot sauce are each unchanged or land on the owner named in the spec; the no-redirect grep on edited cards gives 0.
- **Route:** `dv T2` (fallback forge@opus [T2]); critic@opus `FIDELITY required`. **Dial:** P1.

**K3-5 Close.** Both probes `--strict`: list-words 0 wrong / 0 missing; universe 206/206; npm test, listMatchProbe, dry-run and commitGuard all green; every commit says "Not migrated." **Route:** main [T0]. No QA piece: no UI change, nothing migrated.

## What broken looks like

- "olive oil" leaves `olive_oil_grades`; "fish sauce", "fish oil", "epsom salt", "bird seed" or "garlic bread" gains a card.
- "salmon steak" still lands on a beef card; a hub sends a salmon shopper toward another fish; "swordfish" lands on a card telling the shopper to buy something else.
- A universe label gets reworded so the row passes.

## Risks

1. **Moving an alias breaks reach tests** ("bread", "chicken", "tuna"). *Early check:* scout 2 before K3-4 and K3-2 are specced.
2. **A hub clause invents a member fact.** *Early check:* the K3-1 critic diffs the new clause against the archive quote before K3-2 is dispatched.

## Open questions (recommended default first)

1. **Fish hub.** *Default:* extend `seafood_counter` (it already teaches species, ice and smell for any fish; reuse). *Alternative:* a new `fish` card that only fish rows reach.
2. **Bare "tuna".** *Default:* `canned_tuna`, the form most lists mean; "ahi" and "tuna steak" go to the new card. *Alternative:* keep `fish_freshness_at_counter`.
3. **L3 set.** *Default:* trout, catfish, tuna steak and swordfish get cards; grouper, snapper, halibut, tilapia and mahi stay in `white_fish`. *Alternative:* add grouper and snapper cards (+2).
4. **Moves.** *Default:* "bread" → `bread_aisle` and "chicken" → `chicken_cuts_basics`, if scout 1 shows both decisions are cut-agnostic; otherwise they stay.
5. **No-redirect scope.** *Default:* K3-created and K3-edited cards only; K3-0a prints a count of existing cards whose fields hit the grep, and a retro pass becomes its own plan (it may conflict with the lint's `instead` field). *Alternative:* retro-fit now.
6. **Universe `list_words`.** *Default:* yes; the label stays and the probe judges the words a shopper writes. *Alternative:* leave 191/206 as the standing figure.
