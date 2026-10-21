PIECE kristy/swap-picks-1 (corpus, T2, Codex-built; critic@opus afterwards, not yours)
REPO /Users/m1/kristy  BASE = HEAD after scan-door-1 commit. Baseline: run `cd server && npm test` first and record the count.

## Alignment
Devon approved 2026-10-21: when a shopper puts a poor item on a list, the row gets a gentle nudge toward a better choice, in "Look for X" tone, never criticism. The list never refuses or removes the item, and never explains a decline. Today these items get no card and no line at all. The nudge reuses the existing pick mechanism (`kind:'pick'` entries in server/kristy_perimeter_kb.json → `matchItemToPick` → `{id, line: decision, avoid?}` on the list row) or, where the better choice is the same food in a better form, one specific alias on the existing card.

## Read first
server/lib/listMatch.js `matchItemToCard` (~L202) and `matchItemToPick` (~L229, `aliasCoversRow`). Every existing `kind:'pick'` entry in server/kristy_perimeter_kb.json (30 of them; copy their shape exactly, e.g. pick_juice). server/lib/pickReach.test.js and server/lib/listAliasReach.test.js (style and any per-pick invariants these enforce). The source cards named below (their decision, cart_pick, buying_tips, sources). CLAUDE.md non-negotiables 2, 3, 6, 7, 8, 9 and "The counter" bullet "Hub steal → one longer specific alias, never many dangerous short generics".

## Build (server/kristy_perimeter_kb.json only, plus one test file)
For each row item below, today `matchItemToCard` and `matchItemToPick` both return null (measured 2026-10-21). Make each one land, using the route given:
A. Alias on an existing card (same food, better form; the card's own cart_pick is the nudge):
   - "white bread" → sandwich_bread
   - "pancake syrup" → maple_syrup
   - "artificial sweetener" / "sweetener packets": only if `matchItemToCard` cannot reach label_sugar_free_substitutes by design (label/home cards are skipped); then a pick (route B) from the sugars and maple_syrup cards.
B. New swap picks `pick_<item>` (shape identical to existing picks; `category` = the section the typed item would sit in; `aliases` = the typed item plus its plain plural/variant forms only; `decision` = one "Look for …" line whose every food and qualifier is taken from the named source card(s) cart_pick/decision/buying_tips, rephrased at most; `sources` = copied verbatim from those source cards, so every URL is already archived; `avoid` only when a source card already names a label term for this item, else omit):
   - margarine, vegetable spread → grassfed_butter (and plant_butter only if its text supports it; olive/coconut, never seed oil)
   - shortening → lard_tallow
   - soda, diet soda, soft drink → bottled_water_buying (plain sparkling water) and kombucha (plain refrigerated)
   - sports drink → coconut_water
   - energy drink → tea and/or coffee_beans
   - fruit snacks → dried_fruit
   - whipped topping, cool whip → the card that covers heavy/whipping cream (find it: cream_vs_creamer or another)
   - ranch dressing, salad dressing → olive_oil_grades plus a vinegar card if one exists; if no card supports a dressing line, CARRY it
   - candy, cookies, instant noodles, chips (bare) → CARRY unless an existing card plainly supports a same-use better choice; "chips" bare is a dangerous short generic (chocolate chips) so never alias it.
   CARRY = no entry; list it in the report with the reason.
C. Copy rules for every new decision/avoid: no first person, no em dash, no price or cost words, no brand names, no health/treatment/risk words (healthier, safer, lowers, prevents, causes, toxic, bad for you), no claim the source card does not make. "Look for" opens the decision. Never name the typed item as bad. ≤ 20 words.

## Tests: new server/test/acceptance/swap_picks_1.test.js (node:test, nonEmpty from lib/testGuards.js)
- Each item from A/B that is not CARRIED: `matchItemToCard(name)` returns the named card (A), or `matchItemToCard` null and `matchItemToPick(name).id` the new pick (B), and its `line` starts with "Look for".
- Negatives, none may hit a new pick or a new alias: "baking soda", "club soda" (may hit soda pick only if its line still reads true for it; assert whichever you decide and say why), "chocolate chips", "cookie sheet", "white bread flour", "bread flour", "pancake mix", "dressing" alone, "soda bread", "cooking spray", "vegetable broth", "salad greens", "candy thermometer".
- Each new pick's sources are a subset of its source cards' sources (deep-equal objects); each URL appears verbatim under docs/sources (same walk as server/test/acceptance/t6_3.test.js).
- Each new decision/avoid passes the C copy regex: /\b(I|me|my)\b|—|\$|price|cheap|healthier|safer|lowers|prevents|causes|toxic|bad for you/i is absent.
- The 30 existing picks and every existing card alias are unchanged (compare to `git show <BASE>:server/kristy_perimeter_kb.json`), except the A aliases added.

OWNS: server/kristy_perimeter_kb.json, server/test/acceptance/swap_picks_1.test.js [new]. Nothing else. If a test elsewhere goes red, report it, do not edit it.

VERIFY (run, report numbers): from server/: `node --test test/acceptance/swap_picks_1.test.js`, `npm test` (≥ baseline, 0 fail), `node scripts/listMatchProbe.js | grep "WRONG ("` (all 0), `node scripts/twoLineCheck.js | tail -1`, `node scripts/commitGuard.js`. No git writes, no network.

REPORT ≤30 lines: each item → route and id and its decision line verbatim; CARRIED items with reasons; whether any card alias changed (then the corpus needs a migration); test counts; READY or NOT READY.
