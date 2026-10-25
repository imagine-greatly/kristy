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

BATCH: labels. Cards: label_natural label_made_with_real label_no_added_hormones label_nonGMO_vs_organic label_cage_free label_grass_fed_term label_pasture_raised_feed label_organic_scope label_multigrain_vs_whole_grain label_lightly_sweetened label_no_artificial_flavors label_front_vs_back label_ingredient_order label_third_party_seals label_cold_pressed_expeller label_sugar_free_substitutes label_wild_vs_farm_raised label_serving_size label_artificial_color. Label-term cards: say what the wording does and does not guarantee, and which seal or ingredient-line fact to check instead. Output names: dial/labels.json and dial/labels-sources.tsv.
