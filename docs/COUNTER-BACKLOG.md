# The counter backlog — what the corpus could not answer

**Compiled 2026-09-07 by `server/scripts/compileGapBacklog.js`.**
Regenerate it; do not hand-edit it. Every number here was measured on the run that wrote it.

- **36** distinct topics, from **2836** loggings, read from **2836** rows — and the table reports **2836**, which is the same number, asserted rather than assumed.
- Against a corpus of **84** perimeter entries.
- Split by surface: **10** from the ask, **26** from a list.

## ⚠️ Read this before treating any row as demand

**7 of 36 topics also appear in this repo's own test fixtures**, and the counts say the same thing: the top rows sit at several hundred loggings each, within three of one another, which is a loop and not a week of shoppers. `/perimeter/ask` logs unconditionally and the list-attach path logs every uncarded item, both are public routes, and `scripts/*.livetest.js` and `listMatchProbe.js` drive them against production deliberately. **They are marked ⚠️ and kept, not dropped** — dropping them would hide the contamination, and the contamination is the finding. The fix is upstream and is not proposed here: nothing in the table distinguishes a test run from a shopper.

## The three kinds of work, and they are not the same job

- **card** (23) — nothing in the corpus comes close. Someone writes a card.
- **alias** (7) — the corpus holds the answer and the matcher did not find it. Minutes, not hours. ⚠️ **Author the question form AND the bare noun**: an alias is matched by whole-phrase containment, so a shopper writing a list types `tomatoes` while a shopper asking types `are tomatoes…`. This defect has shipped five times.
- **improve** (6) — a card matched and answered badly. `top_entry_id` names it.

## From the ask — a shopper wanted a read and got none

_Curiosity. Weaker evidence of demand, stronger evidence of what the counter is for._

| # | Topic | Times | Work | Nearest the corpus has | First | Last |
| ---: | --- | ---: | --- | --- | --- | --- |
| 1 | how do i pick a good cantaloupe | 6 | improve | produce_ripeness_by_item | 2026-07-31 | 2026-07-31 |
| 2 | how do i pick a good pineapple | 3 | improve | produce_ripeness_by_item | 2026-07-31 | 2026-07-31 |
| 3 | fermented food | 1 | card | seafood_certifications (only shares "food") | 2026-08-03 | 2026-08-03 |
| 4 | is goat meat any good | 1 | card | beef_cuts_basics (only shares "meat") | 2026-08-02 | 2026-08-02 |
| 5 | my lettuce went limp | 1 | alias | revive_greens (alias in question) | 2026-08-02 | 2026-08-02 |
| 6 | is guanciale worth buying | 1 | improve | farmed_fish_by_species | 2026-08-02 | 2026-08-02 |
| 7 | are these strawberries fresh | 1 | improve | berries_picking | 2026-08-02 | 2026-08-02 |
| 8 | how do i pick berries | 1 | alias | berries_picking (alias in question) | 2026-08-02 | 2026-08-02 |
| 9 | a1 or a2 yogurt | 1 | improve | yogurt_plain_vs_flavored | 2026-08-02 | 2026-08-02 |
| 10 | how do i pick good produce | 1 | improve | produce_picking_ripeness | 2026-08-02 | 2026-08-02 |

## From a list — a shopper is buying this and the corpus is silent

_Intent. Stronger evidence of demand (`supabase/list_attach.sql`), and the reason the two are never collapsed into one number._

| # | Topic | Times | Work | Nearest the corpus has | First | Last |
| ---: | --- | ---: | --- | --- | --- | --- |
| 1 | ⚠️ frozen peas | 852 | card | fresh_vs_previously_frozen_fish (only shares "frozen") | 2026-08-05 | 2026-09-05 |
| 2 | ⚠️ baby spinach | 849 | card | — | 2026-08-07 | 2026-09-05 |
| 3 | ⚠️ lemons | 845 | card | — | 2026-08-07 | 2026-09-05 |
| 4 | ⚠️ dish soap | 84 | card | — | 2026-08-08 | 2026-09-05 |
| 5 | ⚠️ nutella | 44 | card | — | 2026-08-07 | 2026-09-05 |
| 6 | ⚠️ aluminum foil | 41 | card | — | 2026-08-09 | 2026-09-05 |
| 7 | ⚠️ paper towels | 41 | card | — | 2026-08-09 | 2026-09-05 |
| 8 | sourdough | 8 | card | — | 2026-08-05 | 2026-08-05 |
| 9 | fairlife 2 | 5 | card | — | 2026-08-05 | 2026-08-05 |
| 10 | apples honeycrisp | 5 | alias | honey_adulteration (alias in question) | 2026-08-05 | 2026-08-05 |
| 11 | eggs pasture raised | 5 | alias | label_pasture_raised_feed (alias in question) | 2026-08-05 | 2026-08-05 |
| 12 | toilet paper | 5 | card | — | 2026-08-05 | 2026-08-05 |
| 13 | salsa | 5 | card | — | 2026-08-05 | 2026-08-05 |
| 14 | orange juice | 5 | card | egg_shell_color (only shares "orange") | 2026-08-05 | 2026-08-05 |
| 15 | doritos | 5 | card | — | 2026-08-05 | 2026-08-05 |
| 16 | oreos | 4 | card | — | 2026-08-05 | 2026-08-05 |
| 17 | diet soda | 4 | card | baking_soda_soak (only shares "soda") | 2026-08-05 | 2026-08-05 |
| 18 | kombucha | 3 | card | — | 2026-08-07 | 2026-08-24 |
| 19 | sourdough bread | 2 | card | label_multigrain_vs_whole_grain (only shares "bread") | 2026-08-07 | 2026-08-24 |
| 20 | sweet potatoes | 1 | alias | organic_worth_it_by_type (alias in question) | 2026-08-10 | 2026-08-10 |
| 21 | dog food | 1 | card | seafood_certifications (only shares "food") | 2026-08-09 | 2026-08-09 |
| 22 | bleach | 1 | card | flour_basics (only shares "bleach") | 2026-08-09 | 2026-08-09 |
| 23 | sparkling water | 1 | alias | bottled_water_buying (alias in question) | 2026-08-05 | 2026-08-05 |
| 24 | frozen broccoli | 1 | card | fresh_vs_previously_frozen_fish (only shares "frozen") | 2026-08-05 | 2026-08-05 |
| 25 | whole grain bread | 1 | alias | label_multigrain_vs_whole_grain (alias in question) | 2026-08-05 | 2026-08-05 |
| 26 | apples | 1 | card | — | 2026-08-05 | 2026-08-05 |

## Before writing any card from this list

- **Every card carries its own questions in `asked_as`, three or more, authored FROM the question and never from the card’s own vocabulary.** `counterReach.test.js` fails if one lands on another card, on title words alone, or on nothing. **A new card is not done until it can be found.**
- **Be specific, not numerous, when a hub already steals the question.** The matcher scores by phrase length, so one longer alias out-ranks a hub. A short generic alias is actively dangerous.
- **Where the popular claim outruns the evidence, state the narrower true thing and put the gap in `watch_out`.** Verify the study, not the retelling, and fetch every source before it ships.
- **A purchase decision is a `shelf` card however kitchen-shaped its do line is** — `kind='home'` suppresses add-to-cart.
- ⚠️ **Kristy carries anything and judges only food.** Several rows here are household goods. A non-food row belongs on a list with no card and no do line, and **her silence there is the feature** — it is not a gap to be filled with a household KB.
- ⚠️ **Editing the KB is a two-step act.** `routes/counter.js` serves from the `counter_cards` table, so a card reaches iOS only when `node server/scripts/migrateCounterCards.js` runs from `server/`. **And a migration publishes everything the KB is ahead by, not only the card you came to ship — diff the KB against the table first.**
