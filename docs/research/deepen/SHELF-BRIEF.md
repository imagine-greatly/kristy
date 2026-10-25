# Shelf brief (Devon, 2026-10-25) — read fully before writing

IT IS ALL INSIDE A GROCERY STORE. Kristy is a guided grocery list: for every item on the shopper's list, it guides them to the healthiest version *that is on the shelf in front of them*, holistic and organic first. The shopper is standing at the shelf with a phone. Every line must pass: **"what do I look at, on the shelf, right now?"**

## What failed
Produce cards (and many others) all say "organic X from a named small farm / local farm / small orchard / grove". A supermarket shelf has no farm name, no "local" claim anyone can verify. Long blocks, one repeated sentence, no steps.

## Shelf-visible vocabulary (use these; verify each against the sources you fetch)
- Produce: PLU sticker (4 digits conventional; a leading 9 = organic, 5 digits); USDA Organic seal; Real Organic Project label (soil-grown); Certified Naturally Grown sign; country-of-origin sticker/sign; "Product of"; wax/"coated with food-grade vegetable/shellac-based wax" signage; ripeness cues per item (colour, give at stem end, weight, bloom, dry neck, tight heads); clamshell fog/leak/mold; bulk vs bagged; frozen: frost/ice clumps, ingredient list = just the vegetable; cut/bagged salads: date, "triple washed" is not a quality cue.
- Packaged: ingredient list (short, first ingredient, oils named, sugars named), USDA Organic, Non-GMO Project verified (not an organic substitute), AGA 100% Grassfed, Certified Humane / Animal Welfare Approved / Global Animal Partnership step, Regenerative Organic Certified, MSC / ASC, "wild" / "Alaska" / species name on seafood, harvest/roast/pack dates, glass vs plastic/can lining, "keep refrigerated", cold-case position, bag/label words ("natural", "cage-free", "pasture-raised" with and without third-party seal), fat %, culture names in yogurt, cheese: rind, "cheese food/product".
- Meat/seafood/dairy: label words and seals above; counter questions to ask staff ("Is this wild or farmed? Where from?") are allowed as an Ask tip when the answer is knowable at a counter.

## Banned wording (lint DIAL_VAGUE / DIAL_UNLEGIBLE enforce this in decision, delta, buying_tips, pick_steps, short_answer)
local, locally, small farm/orchard/grower/farmer/maker/roaster/beekeeper, named (small) farm/grove/orchard/grower/roaster, small grove, "grown without sprays", no sprays, unsprayed, pesticide-free, not sprayed. If a fact about sourcing is true but un-checkable at a shelf, it belongs in `why`/`detail`/`science` (not shown first), not in decision/tips/delta.

## Shape
- Family `decision` ≤ 90 chars: the one-line rule of what the best shelf version is. Realistic for a supermarket (the best thing actually sold there), not a fantasy farm.
- Family `buying_tips`: exactly 4, each ≤ 90 chars, starting `Look for ` / `Read ` / `Check ` / `Pick ` / `Skip ` / `Ask `, each naming a visible thing.
- Item `delta` ≤ 120 chars, ≤ 2 clauses (split on `; : . ! ? —`): only what differs for THIS item vs its family (item-specific ripeness/colour/shape/label cue). No sentence may repeat across items; never restate a family tip.
- Item `decision` (headline): ≤ 10 words, item-specific, what the best version of THIS item is; two items must not share a decision sentence.
- Item `short_answer` ≤ 40 words, plain. `pick_steps`: ≤ 3 steps, each ≤ 14 words, an imperative naming something visible. No cross-reference steps ("see Beef").
- Do not claim food treats/prevents anything (no-treatment rule); no prices; no negative claims about named brands; no first person; no she/her for Kristy.
- Organic is a floor, closest to nature is the aim: when an item has no organic version in stores, say what is next-best and visible.
- Items that are not sold in a typical grocery (raw milk, organ-blend beef) must not be the lead; lead with the best shelf-available option, mention the ideal in `why`.

## Method
1. For your area, list the cards/families from `server/kristy_perimeter_kb.json` (entries with `kind:'family'` / cards). Print current decision, buying_tips, delta for each (do not dump whole file).
2. For each family and item, ask: "What does the healthiest X in a grocery store look like?" Fetch vetted organic / holistic sources (Real Organic Project, Cornucopia Institute, Organic Consumers Association, Weston A. Price Foundation, Environmental Working Group, USDA AMS organic pages via govinfo/law.cornell.edu if .gov 403s, Monterey Bay Seafood Watch, American Grassfed Association, Certified Humane, Regenerative Organic Alliance, University extension ripeness guides). Use `mcp__scrapling__*` or WebFetch / exa. Every shelf cue you write must be backed by a fetched source; record each as a row in `docs/research/deepen/dial/shelf-<area>-sources.tsv` (id<TAB>url<TAB>quote). Never cite from memory.
3. Write ONE file `docs/research/deepen/dial/shelf-<area>.json` shaped like the existing batches there: `{ "families":[...], "aisles":[...], "patches":{ "<card id>": {field:value,...} } }`. Include every family/aisle/card in your area that needs a change; a patch only needs the fields it changes (decision, delta, short_answer, pick_steps, buying_tips, watch_out, tier_note). Merge layers field-by-field, shelf-* files win.
4. Validate: `node server/lib/dialRules.js docs/research/deepen/dial/shelf-<area>.json` must print `0 findings`. Fix until 0.
5. DO NOT run the merge, edit the KB, run the full suite, or commit. Read-only elsewhere. Report ≤ 25 lines: counts, anything you could not source, open choices.
