TIER: T2
# Shop-dial research batch (Devon 2026-10-25). Read first: docs/research/deepen/SHOP-DIAL-BRIEF.md and SHOP-DIAL-PLAN.md (sections 2 and 3 P2), CLAUDE.md non-negotiables 2-9.

Question for every item: "What does the healthiest <item> in a grocery store look like?" Answer as what a shopper can SEE, READ or (at a staffed counter only) ASK. Nature first, closest to source, organic a floor, small over big (never name brands; describe by trait). Holistic sources judge (WAPF, Real Milk, Eatwild, AGA/PCO and Real Organic standards pages, Cornucopia criteria, small-farm pages); government sources only as raw fact via law.cornell.edu or govinfo.gov (.gov 403s).

HARD RULES
- NEVER write "no sprays", "unsprayed", "pesticide-free", "grown without sprays", "not sprayed": nothing in a store says it. Use shelf language instead: seals (USDA Organic, Certified Naturally Grown, Real Organic, Regenerative Organic Certified, Demeter, AGA/PCO grassfed, pasture-raised), origin sticker, PLU code (state whether PLU is reliable), ingredient line, farm name, test date.
- No price, no health outcome / treatment claims, no first person, no em-dash asides, no named brands. Raw milk/cheese/organ blends: phrase as what to look for or ask for where legally sold, no outcome claims.
- No hedges ("does not establish", "not a health ranking", "editorial preference") in decision, tips or delta.
- Sources: every URL you cite must be fetched by you; the quoted fact must appear verbatim in the page. Do not write URLs from memory. Record in dial/<batch>-sources.tsv: item<TAB>url<TAB>verbatim fact string.

OUTPUT (write only these two files under docs/research/deepen/dial/, no KB edits, no git):
1. dial/<batch>.json: {"families":[],"aisles":[],"patches":{"<card id>":{"decision":"...","delta":"...","family":"<existing fam_ id>"}},"groups":[{"id":"...","title":"...","members":["<card ids>"],"why_same":"..."}]}
   - Reuse existing family ids (see server/kristy_perimeter_kb.json kind=family). A family patch (put in "families" with the same id) is: decision <=90 chars; buying_tips 3-4 steps, each <=90 chars, each starting Look for / Read / Check / Pick / Skip (Ask only at staffed meat/fish counters), each naming something visible; no why/watch_out/shopper_questions/season_storage.
   - Item delta: <=120 chars, <=2 clauses (split on ; : .), only what differentiates the item (season months, wax, ripeness cue, species). Never a family step. No sentence repeated in two deltas. Example: "No wax; in season Aug-Nov."
   - Item decision: the item's top rung as the shelf shows it, <=90 chars.
   - groups: items shopped the same way (apples/pears/peaches) so they can share one card; list members and why.
2. dial/<batch>-sources.tsv.
Self-check before finishing: node server/lib/dialRules.js dial/<batch>.json must print 0 findings (it accepts {families,patches} wrapped; if the CLI does not read your shape, check your fields by eye against the limits). Final reply <=12 lines: files written, item count, dialRules result, any item you could not source.

BATCH: bulk-4. Cards: hot_soy_sauce canned_soup olives seaweed salsa coconut_water condiments crackers tortilla_chips potato_chips popcorn pretzels snack_bars trail_mix snacks hummus deli_salads prepared_meals. Pantry, bakery, ferment, snack and frozen aisles. Family cards are shared aisle steps; reuse an existing fam_ id from KB where one fits. Decision = the top rung as seen on the shelf; deltas differentiate only. Short ingredient line, real fermentation (live, unpasteurised, refrigerated) where it applies, sprouted/sourdough/whole grain by what the label must read. Output names: dial/bulk-4.json and dial/bulk-4-sources.tsv.
