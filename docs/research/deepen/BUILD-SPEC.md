# Family cascade build spec (Devon approved 2026-10-24: "build everything and ship onto testflight")

Decisions: free/paid split B. FREE: aisle briefing, family id/title/section/one-line rule (`decision`), and the `family` pointer on member cards. PAID (omit for free viewers, absent keys not null): family depth (`why`, `buying_tips`, `watch_out`, `shopper_questions`, `season_storage`, `sources`) and every card `delta`. Family/aisle entries are never matchable (no aliases, excluded from every scorer, from explicit perimeterId attach, from migration/counter_cards). No "ask the counter" coaching except staffed meat/fish counter cards. Brands never named; avoidance by trait. No price, no first person, no treat/cure/prevent claims.
Flour card: decision becomes "sprouted or freshly ground first, soaked at home next" so it agrees with its short answer.

## KB entry shapes (server/kristy_perimeter_kb.json, appended to `entries`)
family: {id:"fam_<slug>", kind:"family", title, category:"<aisle id>", decision:"<one-line rule, true for every member>", why:"<2-4 sentences>", buying_tips:["look-for/skip lines, each <=140 chars"], watch_out:[..], shopper_questions:["..",".."], season_storage:"<string or empty>", sources:[{name,url}]}
aisle: {id:"aisle_<slug>", kind:"aisle", title, category:"<same id>", decision:"<one-line briefing headline>", buying_tips:["3-5 lines"]}
member card gains: family:"fam_<slug>", delta:"<item exception, key point first; 1-3 short sentences; <=400 chars>" (delta only when the item differs).
Aisle ids: aisle_produce, aisle_meat_eggs, aisle_seafood, aisle_dairy_alt, aisle_pantry_bulk, aisle_bread_bakery, aisle_ferments, aisle_condiments, aisle_snacks, aisle_drinks, aisle_deli_prepared, aisle_frozen.

## Build artifacts (content runs write these; server merges)
docs/research/deepen/build/<group>.json = {"families":[entries],"aisles":[entries],"patches":{"<cardId>":{"family":"fam_x","delta":"..."}}}
groups: produce animal seafood dairy pantrya pantryb. Server script `server/scripts/mergeFamilyBuild.js` merges all build/*.json (idempotent: replace by id), applies patches, then lints.
