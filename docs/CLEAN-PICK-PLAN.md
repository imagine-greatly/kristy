# CLEAN-PICK PLAN: every pick names the item's best version

Planned 2026-10-20 against `server/kristy_perimeter_kb.json` at `ede90e7` (211 entries: 181 cards + 30 `kind: "pick"`).
Status: B1–B7b shipped organic-first (B1 `230dd1e` through B7b `6ff7930`). Amended 2026-10-20 by Devon's directions 4, 5 and 6:
- **Beyond organic** (below) supersedes organic-first for B8 onward.
- Every item gets a "best self" ladder and a sourced avoid list.
- Kristy takes a holistic stance: a government source is used for raw fact only.
- The shipped (b) items go back through B9–B13, plus 2 of the unchanged 84 that carry a mainstream reassurance verdict.
- The plan is aligned to the locked stance (`docs/DECISIONS.md`, "The stance — locked 2026-10-20", commit `2b23393`). Where this plan and the stance differ, the stance wins. The stance also adds one piece, **SR** (section rules), below.

B8's spec (`.pipeline/specs/clean-pick-8.md`) is held and is redefined below. Run order: B9 → SR → B10 → B11 → B12 → B13 → B8. Devon approves this amendment before anything is dispatched.

## Devon's direction (2026-10-20, verbatim)

1. "we are clear throughout the app on the 'dont get any synthetic shit' right, like someone shouldnt just be grabbing run of the mil coconut or maples ugar but organic, no bs tpye of thing, and thats the case for every item, it should be."
2. "everything should be organic, no additives, no synthetic bs, from nature, as close to the source as possible"
3. "we dont want to just tack on a 'get organic' to every single item but rather, point them to the cleanest and healthiest version of the item they are getting that means wild caught salmon, 100% grass fed beef, things like that"
4. "another thing about us, how we exist to guide someone into getting the healthiest and most natural food from the grocery store as possible is i dont want to stick strictly to "organic" becuase that doesnt really do it now adays and there is still many bad things in organic stuff, most of the time so if there is a better alternative to it then go ahead, we should also be stressing small brands big brands like driscoll berries are literally poison obviously we cant call it that in the app but we should be saying to avoid the big brands, etc. i want you to take on the healthiest and most natural holistic mindset throughout all of this do you understand, like lettucwe ofr example, heavily, heavily sprayed, so you are to look for a not sprayed greenhouse grown yada yada, sometimes organic doesnt mean what we want it to and i want to address that do you get it?"
5. "yea thats great the lettuce is good example, also no one is "asking" anyone about the lettuce or at least not a good portion of time like people buy lettuce in bags as well as heads so the language should be a nutral kind of "look for" same with everything else, obviously if you can ask like at the meat counter then you should, things like that, like weve said before we exist to guide people into getting the healthiest version that means knowing the healthiest version of every product, and we know what to avoid, every niche chemical, every synthetic spray, etc. for every item, each items best self"
6. "i agree with the backed by evidence thing but i foremostly want you to take on a holistic mindset when it comes to this app, the whole point is that we are anti-mainstream no seed oils no additivies, as close to nature as possible so when we feed our card knowledge base with mainstream USDA "conventional is fine, seed oils are good" type of thing we lose the plot of the holistic and natural healthiest version of every food rhetoric we have worked so hard to outline, do you get it? holistic sources, natural sources, not main stream government stuff"

**Problem.** A shopper who reads only the headline and the cart pick buys the ordinary version. Today:
- "Coconut sugar or pure maple sugar" leads to plain coconut sugar.
- "Deep yellow butter" doesn't say grass-fed.
- "Half-and-half" leads to a carton with gums.
- "Plain chicken breast" doesn't say how the bird was raised.

**Problem after B1–B7b (directions 4 and 5).**
- Where the shipped headline is "organic", the shopper stops at the organic seal. For some items the seal is not the best real version:
  - Organic lettuce can still be sprayed with organic-approved inputs.
  - Organic cream can still be ultra-pasteurized.
  - A small local grower may beat both.
- Many shipped cards also never name what to avoid on that item. Examples are wax on apples, post-harvest fungicide on citrus peel, and a chlorinated wash on bagged greens. The shopper can't avoid what the card never names.
- The produce aisle's section rule in shop mode reads "Organic on anything you eat the skin of." That makes organic the goal of the whole aisle, against stance point 3.

**Problem (direction 6).** Some cards carry a mainstream reassurance as if it were Kristy's own view. Examples:
- "residues are generally within legal limits";
- "if organic means fewer vegetables, buy conventional and eat more";
- "conventional is fine there";
- farmed-salmon contaminants "well below FDA tolerance levels".

A shopper who reads one of those learns that the ordinary version is fine, which is the opposite of the app's point. The grep that found them is listed in the Revisit section.

**Need.** Each card's top lines name the best version *of that item*, using the item's own standard:
- wild-caught salmon;
- 100% grass-fed and grass-finished beef;
- pasture-raised eggs and poultry;
- ~~organic where organic is the item's defining standard~~ the item's top findable rung, with organic as the fallback rung (direction 4, below);
- nothing added;
- unfortified;
- the least-processed form.

The top lines are `decision`, `cart_pick` (on a pick, its `decision`), and `buying_tips[0..1]`. Each card also names the item's own sourced avoid list (direction 5), and no line on it carries a mainstream reassurance verdict (direction 6).

## Beyond organic (Devon 2026-10-20, directions 4, 5 and 6): supersedes organic-first

**Alignment to the locked stance (`docs/DECISIONS.md`, "The stance — locked 2026-10-20").** The stance is Devon's ruling. This section implements it, and its points map onto the plan as follows.

| Stance point | Where in this plan | What the alignment adds |
|---|---|---|
| 1. Why we exist | Intent | — |
| 2. Nature first: fewer ingredients, natural fats only (butter, ghee, tallow, olive oil, coconut oil, never avocado oil), unfortified first | T2–T4, Q5, B12, B8 `potato_chips` | **C20**: no new line recommends avocado oil or a seed oil. `potato_chips` names a stance fat. |
| 3. Per-item ladder, organic the floor, "the best version and a findable close second", "Kristy never refuses an item" | The ladder, T5, C16 | **C16 widened** from market-rung cards to every changed card. Produce fallback tips name what organic still allows *on that item*. `egg_labels` feed-first is confirmed by R1. Refusing an item is a failure. |
| 4. Every item has an avoid list (incl. seed oils, celery powder, gums, glyphosate on oats and beans, citrus fungicide, apple wax, chlorine wash on greens, potato sprout inhibitors, rBST, ultra-pasteurization, packaging chemicals) | T6, C18, Revisit, B9–B13 | rBST is checked by R3 (S18). An avoid item past the cap of 3 moves to `detail` and is never cut. |
| 5. Small over big, unnamed | Small growers | — |
| 6. Neutral "look for"; "ask" only where a person exists; one holistic principle per aisle, never safety or handling trivia; every label term glossed | Look for, C17, L4 gloss | **New piece SR.** It rewrites the organic-first produce rule and the handling-trivia checks in `server/lib/sectionRules.json`. |
| 7. Holistic and independent sources set the position; government gives raw fact; "a missing holistic angle → fetch sources for it, never cut it" | Holistic stance and sources, S table, Claim lock | Adds the American Grassfed Association (S17) and archived farmer, rancher and traditional-food-writer sources. **Every "goes to ship notes" for a source gap becomes "goes on the fetch list"**: the line waits for its source and is never dropped. |
| 8. Guardrails (#2, #3, #9, no price, no first person) | Claim lock, C4, C14 | — |

**Each item's best self (direction 5).** A card has two jobs:
- It names the item's healthiest findable version as a ladder, top rung first.
- It names what to avoid on that item: the niche chemicals, synthetic sprays and processing aids that apply to it. Every avoid item is sourced.

The avoid lists are the concern register. They come from `docs/CONCERN-REGISTER.md` (100 concerns, each with its evidence files under `docs/sources/concerns/`) and its gap list, `docs/CONCERN-COVERAGE.md`. This plan never builds a second register:
- An avoid item is a register concern whose home cards include this card.
- A concern that is missing from the register, or sits in its "Unsourced" list, is not authored yet. It goes on the fetch list, gets an archived source and a register row, and lands in the next batch (stance 7: fetch, never cut).
- The rows that apply to B9–B13 are listed below, with what still needs a new source.

**Holistic stance and sources (direction 6, stance 7).**
- **Stance.** Kristy is holistic and anti-mainstream: no seed oils, no additives, as close to nature as possible. A card never adopts a mainstream conclusion as Kristy's position. Examples of conclusions it never adopts:
  - "conventional is fine";
  - "residues are within legal limits" or "within tolerance";
  - "seed oils are heart-healthy";
  - "eat more produce, organic or not";
  - "the concern is debated, so it rates a credible concern at most".
- **Preferred sources.** Holistic and independent sources set the position: EWG, the Weston A. Price Foundation, the Cornucopia Institute, the Real Organic Project, Regenerative Organic Certified, the American Grassfed Association (AGA), independent residue testing (The Detox Project's Glyphosate Residue Free certification), and farmers, ranchers and traditional food writers (S2, S12–S17 below). Any of them counts once it is archived.
- **Government sources give raw fact only, never a verdict.** A government source may back a fact:
  - a residue was detected (PDP);
  - a processing aid is permitted (21 CFR, 7 CFR 205.601);
  - a term's legal definition (21 CFR 131.3, 9 CFR).

  Its verdict ("within tolerance", "safe", "the guidelines count fortified drinks") is never cited. A `sources` string that names only a government verdict, such as "EPA tolerance limits", is removed from the rows that cite it.
- **A missing holistic angle is fetched, never cut (stance 7).** A rung, avoid item or why that lacks an archived source waits on the admin's fetch list. Its card keeps the current line until the file exists. The line is never dropped from the plan.
- **The claim lock (#2) and the no-treatment rule (#3) still stand.**
  - A claim stays about the food: how it was grown, raised or processed, and what is on it. It never says what the food does to a body.
  - A holistic source counts as a source when it is archived under `docs/sources/` with its `url:` line. Only its food facts are taken from it. A bodily or healing claim in a holistic source is never carried, the same as for any other source.
  - Cornucopia's brand scorecards are never cited: they rank named brands (#9). Only its criteria and practice reports are.
- **What a reassurance verdict is grounds for.** A shipped line or tip that carries a mainstream reassurance verdict is grounds for a (b) rewrite (Revisit, ground 3). The rewrite does two things:
  - It replaces the verdict with the holistic ranking. For example: "When organic runs short, peeled produce waits; skin-on comes first", in place of "buy conventional and eat more".
  - It keeps any raw fact the line held, such as "carrots test low", which is a fact.

  A budget or stock retreat stays (rule 7), stated as a floor rung, never as "fine". Whether a conventional floor may still be named is open question 1.

**The ladder (stance 3).** Each item climbs its own ladder, top rung first.
- The top rung is the best real version of *that* item. Depending on the item, that means:
  - grown without sprays, or from a local small farm;
  - pasture-raised, regenerative or wild;
  - glyphosate-tested;
  - raw or minimally processed (for example, pasteurized but not ultra-pasteurized);
  - and so on.
- The stance's own ladders bind:
  - meat: butcher first, then 100% grass-fed and grass-finished beef and lamb, and pasture-raised pork and poultry;
  - eggs: feed first (soy-free, corn-free, pasture-raised), then organic;
  - dairy: grass-fed, few ingredients, no gums, raw or gently pasteurized above ultra-pasteurized;
  - fish: wild-caught, and ask the fish counter where it was caught;
  - produce: local, in season and unsprayed, then organic with a note on what organic still allows. Frozen counts when the bag lists only the food;
  - packaged: a short list of real ingredients, natural fats only;
  - sweeteners: raw honey, pure maple, organic coconut sugar.
- Every card gives the best version and a findable close second (C16). Kristy never refuses an item.
- Organic is a lower rung or the fallback, not the headline, wherever something better can really be found.
- Where organic is still the top findable rung, it stays the headline. That is class (c) below, and it is not a failure.

**Look for, not ask (direction 5, stance 6).**
- Lines are written in the neutral "look for" voice. Most shoppers buy bagged and boxed food with nobody to ask. Lettuce, for example, comes in bags as well as heads.
- "Ask" appears only where a person is there to answer:
  - the meat or butcher counter;
  - the fish counter;
  - the deli;
  - the bakery;
  - a farmers market or farm stand.
- Every new sentence containing "ask" also names that counter or market (C17).
- A rung that can only be confirmed by asking is not a headline for a bagged or shelf item. It goes in a tip for the market.

**The avoid list.**
- It lives in `watch_out` or in `buying_tips` at index ≥2. It never goes in `decision` or `cart_pick`.
- A card carries at most 3 avoid items [PLACEHOLDER] in `watch_out`/`buying_tips`, in register order. A 4th or later sourced item goes in `detail`, never cut (stance 4 and 7).
- Each avoid item names the label term the shopper can read, such as "coated with food-grade wax", "processed with alkali", "water chilled" or "imazalil".
- Some concerns have no label term, such as pesticide residue or PFAS-class pesticides. For those, the rung does the avoiding, plus at most one sourced fact line.
- Lines say what the thing is and where it shows up. They never say what it does to a body. Some register rows have bodily wording (for example, `sulfites` "affect sensitive people"); that wording is not carried (no-treatment rule, rule 3).
- An avoid line cites the register row's archived file. A row whose only evidence is WEAK needs a STRONG file or the CFR alongside it before it lands, and that file goes on the fetch list. Today that applies to `ultra_pasteurized` and `irradiation`.
- A general fact stays on its one owner card (C10, ≤2 entries). Item cards carry only their own item's version of it.

**Where organic falls short, the card teaches what to look for.**
- Organic rules still allow approved sprays. Organic or hydroponic produce can be sprayed.
- For livestock, organic means organic feed and outdoor access, not pasture. That is the G4 gloss.
- Organic dairy can still be ultra-pasteurized.
- No boilerplate (C10). The general facts are stated once, on `organic_worth_it_by_type` and `label_organic_scope` (B9).
- Stance 3 asks every produce card whose close second is organic to carry "a note on what organic still allows". That note is the item's own: it uses the item's words and its own source. Lettuce, for example: "organic rules still allow approved sprays" (S3). Cream: "look for pasteurized, not ultra-pasteurized". An item whose own allowance has no archived source yet keeps its fallback tip without the note, and the source goes on the fetch list.

**Small growers, generically, never a brand.**
- Cards stress small and local growers, farmers markets and small producers over national labels.
- **Non-negotiable #9 is the line.** The app never names a brand, and no line says a named brand is worse.
  - Devon's own example, "driscoll berries are literally poison", is exactly the line we never cross.
  - No card names Driscoll's or any other brand.
  - No line calls any food "poison". That would break the no-treatment rule and the claim lock.
  - "berries from a local farm or market over a national label" is the furthest the app goes.
- The reason a small grower ranks higher must be true without a study: the grower can say how it was grown, on the label or at the stand. No line claims a big brand sprays more or is worse unless an archived source says so.
- C10 still holds: a "small grower" sentence never sits verbatim on more than 2 entries.

**Claim lock.**
- Every spray, residue, avoid-item and processing claim traces to an archived source under `docs/sources/`. Sources include the USDA Pesticide Data Program (PDP), the EWG residue lists, the holistic sources S12–S17 and the register's concern files. Never write such a claim from memory.
- EWG and the holistic sources rank. PDP and the CFR supply raw fact only (direction 6). A why line cites PDP or the CFR for the detection or the definition, and never for a tolerance or safety verdict.
- `.gov` fetches 403 from this box. The admin fetches through Firecrawl, govinfo.gov or law.cornell.edu and archives the file with its `url:` line before the batch spec is written.
- **No-treatment rule.** Claims stay about how the food is grown or processed ("sprayed through the season", "heated above the pasteurization line", "washed in chlorinated water"). They never describe what residue or processing does to a body.
- A rung or avoid line whose source is not archived does not land in that batch. The card keeps its current line, the source goes on the admin's fetch list, and the line lands in the first batch after the file is archived (stance 7: fetch, never cut). The planner tracks these as **carried lines** in each spec's `## Tried and rejected` section, never as dropped work.

**Sources: what is already archived, and what to fetch before the B9–B13, SR and B8 specs (admin, Firecrawl or law.cornell.edu / govinfo):**

| # | Source | Status | Backs | Needed by |
|---|---|---|---|---|
| S1 | USDA PDP Annual Summary, latest year (ams.usda.gov, 403 → Firecrawl/govinfo) | **fetch**. Raw detection fact only; its tolerance comparisons are never cited | residue detected, by commodity: apples, pears, peaches, nectarines, cherries, bell/hot peppers, green beans, celery, cucumbers, potatoes, lettuce, spinach, kale/collards, strawberries, blueberries, cilantro, raisins, tea if tested | B9, B10, B8 conditionals |
| S2 | EWG Shopper's Guide 2026 | **archived**: `docs/sources/concerns/produce_seafood/ewg-dirty-dozen-2026.md`, `ewg-clean-fifteen-2026.md`, `ewg-shoppers-guide-summary-2026.md` (register `dirty_dozen`, `clean_fifteen`, `pfas_pesticides`) | the impact order; the PFAS-class pesticide line on stone fruit and berries | B9, B10 |
| S3 | 7 CFR 205.206 and 205.601 (law.cornell.edu) | **fetch**. The existing 205.105 file covers only the prohibited list | organic production still allows approved pest inputs, natural and listed synthetic | B9 teaching cards, lettuce, berries, SR |
| S4 | USDA NOP statement on hydroponic/container organic certification (403 → Firecrawl), or the 9th Cir. *Center for Food Safety v. Vilsack* (2022) opinion | **fetch** | hydroponic produce can be certified organic | B9 teaching cards, lettuce |
| S5 | UC IPM greenhouse/lettuce pest-management guidelines (ipm.ucanr.edu) | **fetch** | greenhouse or hydroponic growing alone does not mean unsprayed | lettuce, peppers, cucumbers, basil, microgreens |
| S6 | 21 CFR 131.3 (law.cornell.edu) | **fetch**. The register's `ultra_pasteurized` evidence is WEAK only | the definitions of pasteurized and ultra-pasteurized | cream_vs_creamer |
| S7 | 7 CFR 205.239 (law.cornell.edu); fetch only if scout R3 finds it unarchived | **check** | organic livestock means outdoor access, not pasture | B9 teaching cards, pick_sausage |
| S8 | Certified Naturally Grown standards (naturallygrown.org) | **fetch** | a real peer-audited small-farm rung, named only as a certification and never as a brand | B9 produce, B10 greens/berries |
| S9 | Glyphosate and chlormequat on oats, pulses and grains | **archived**: register `glyphosate_desiccation` (7 STRONG files incl. `pantry/saskpulse-harvest-aid-pulses.md`, `pantry/ewg-glyphosate-oats-2023.md`) and `chlormequat` (`produce_seafood/ewg-chlormequat-oats.md`) | the pre-harvest glyphosate and chlormequat avoid lines | B8, B12 |
| S10 | Sanitizer and chlorine wash on fresh-cut and bagged leafy greens (a university postharvest or extension source, or FDA guidance via Firecrawl) | **fetch, new register row** | the bagged-greens avoid line | B10 lettuce, leafy greens |
| S11 | Post-harvest sprout inhibitors on potatoes (chlorpropham/CIPC; EPA via Firecrawl, or a university extension) | **fetch, new register row** | the potatoes avoid line | B9 `produce_root_vegetables` |
| S12 | Real Organic Project standards (realorganicproject.org) | **fetch** | a soil-grown, add-on certification above the organic seal: no hydroponic, pasture for livestock. A look-for tip, not a headline (see Findability) | B9 teaching cards, B9/B10 produce |
| S13 | Regenerative Organic Certified framework (regenorganic.org) | **fetch** | what the ROC seal adds over organic. Used only as a look-for; the plain word "regenerative" stays not findable | B9 teaching cards |
| S14 | The Detox Project, Glyphosate Residue Free certification (detoxproject.org) | **fetch** | the label a shopper can look for on oats (independent residue testing) | B8 `oats_steelcut_rolled_instant` |
| S15 | Weston A. Price Foundation, on dairy handling and pasture (westonaprice.org) | **check**: R3 reports whether it is already archived | food facts on pasture dairy and pasteurization only, never its health claims | B10 `cream_vs_creamer`; context for the B9 rewrites |
| S16 | Cornucopia Institute reports on organic integrity (hydroponic, organic livestock; cornucopia.org) | **fetch** | where the organic seal falls short in practice. Its criteria only, never its brand scorecards (#9) | B9 teaching cards |
| S17 | American Grassfed Association standards (americangrassfed.org) | **fetch** (stance 7 names AGA) | what "100% grass-fed, grass-finished" and pasture-raised mean when audited; a look-for tip | B8 `pick_soup_bones`, `pick_jerky`; B10 `cream_vs_creamer`; the T6 sweep's meat cards |
| S18 | rBST/rbGH on dairy (stance 4 names it): the register row and its evidence | **check**: R3 reports whether `docs/CONCERN-REGISTER.md` has a sourced row. If not, fetch and add a row | the "from cows not treated with rBST" look-for on dairy | B11 dairy ids (`sour_cream`, `cream_cheese`, `cottage_cheese`, `ice_cream`), B10 `cream_vs_creamer` |
| — | Already archived and used as is: `produce_coatings` (`produce_seafood/nwhort-fruit-coatings.md`), `citrus_fungicides` (`produce_seafood/pmc-citrus-postharvest-fungicides.md`), `poultry_chill_wash` (`meat/npr-chlorinated-chicken.md`, `meat/pmc-air-vs-water-chilling-chicken.md`), `sulfites`, `bioengineered`, `pfas_packaging`, `plastic_teabags`, and the additive rows | **archived** | the B9–B13 avoid lists | B9–B13, B8 |
| — | Register "Unsourced" (imazalil classification, shellac health, nitrofuran/fluoroquinolone by name, and the rest of that list) | **fetch list** (stance 7: fetched, never cut). Not authored until archived; the bodily framing in any of them is never carried | — | the batch after each one is archived |

**Findability.**
- The two-line limits still apply:
  - card `decision` ≤10 words;
  - `cart_pick` ≤46 characters;
  - pick `decision` ≤14 whitespace words, with no digit.
- Accuracy outranks firmness (rule 7). Name a rung only if a shopper can actually find it at a store or a market, in the form they buy it (bag, head, box, carton).
- Every card whose top lines change keeps a findable close second in its `buying_tips` (C16, stance 3). That is normally organic on a grower or market rung.
- **Judged not findable as a headline:**
  - regenerative, on any item. A Regenerative Organic Certified or Real Organic Project seal may be a look-for tip ("look for the Real Organic Project seal over the organic seal alone"), never a headline, because most stores carry neither [judgement];
  - grown without sprays, for citrus, bananas, mangoes or ginger/turmeric (imported, so no local grower for most shoppers);
  - pasture-raised rotisserie chicken;
  - pasture-raised nuggets;
  - pasture-raised carton egg whites;
  - a glyphosate-tested label on beans, pasta or grains. This rung is a look-for on oats only (S14); the avoid line still runs on all three;
  - raw (unpasteurized) juice;
  - local dried beans or popcorn.
  These items keep their current rung. Their avoid lists still apply.
- "Grown without sprays" is the grower's word, on a label or at a stand; no seal audits it. It prints only with a gloss that says so (scout R2, B9 lint piece), never as a certified fact.

**Lettuce, worked example (`produce_leafy_greens`, B10) [DRAFT].**
- **Best self, top rung first:**
  1. Local or greenhouse lettuce grown without sprays, bagged or head. Greenhouse or hydroponic alone does not say it, so the shopper looks for the words.
  2. Organic.
  3. Conventional, washed.
- **Why this order:**
  - Lettuce is eaten as the leaf itself, raw and unpeeled. The leaf is the part that is sprayed (S1 lettuce detection line required, or this why waits on the fetch list).
  - Organic rules still allow approved sprays (S3), and hydroponic lettuce can be certified organic (S4). So the seal does not settle it, and a label or grower that says "grown without sprays" does.
  - Greenhouse and local lettuce is findable year-round in bags, clamshells and heads at many stores and markets. Organic stays the store fallback.
- decision (9 words): "Lettuce grown without sprays, bagged or head, then organic."
- cart_pick (40 chars): "Lettuce grown without sprays, or organic"
- buying_tips[0] (why, not imperative): "Lettuce is eaten as the leaf, and the leaf is what gets sprayed." Lands only on the S1 lettuce line.
- buying_tips[1] (look-for): "Look for local or greenhouse lettuce labeled grown without sprays; greenhouse or hydroponic alone does not say it."
- buying_tips[2] (store fallback, close second, with what organic still allows on lettuce): "Organic is the store fallback; organic rules still allow approved sprays."
- Avoid list, in `watch_out`: "Bagged, pre-washed greens go through a sanitizing wash, often chlorinated water." Lands only on S10, which also adds a register row.
- At a farmers market, one tip may say "ask the grower about sprays", per C17. It is optional and is never the headline.
- Every base tip is kept, shifted down (C8).

**Criteria added for B8–B13.** They extend the common table; C5 is replaced by C5b.

| # | Criterion |
|---|---|
| **C5b [test]** | The ids whose `decision` or `cart_pick` gain a rung phrase equal exactly the batch table's rung rows, and each carries its row's verbatim rung phrase. On each rung row, "organic" survives only as the fallback: in `buying_tips` at index ≥1, or after "or"/"then" in the decision or cart. Avoid-only and reassurance-only rows keep `decision` and `cart_pick` equal to the base ref. |
| **C4b [test]** | C4's banned list gains `poison`, `chemicals?` and `spray-free`. "unsprayed" and "without sprays" appear only on rows whose L4 gloss says it is the grower's word (lintSections `[]`). |
| **C14 [test]** | No new string names a brand. Every capitalized token that is not sentence-initial is in the allowlist `USDA, Organic, Certified, Naturally, Grown, PFAS, Real, Project, Regenerative, Glyphosate, Residue, Free, American, Grassfed, Association` [PLACEHOLDER list]. |
| **C15 [test]** | Every new spray, residue, avoid-item or processing line carries a `sources` entry. Its url appears verbatim on a `url:` line of a file under `docs/sources/`; the test greps the archive, never memory. |
| **C16 [test]** | (Widened by stance 3.) Every rung row, and every batch card whose `decision` or `cart_pick` changes, keeps one `buying_tips` line naming a findable close second: organic, or the item's store standard. On a produce card whose close second is organic, the spec states whether that line also names what organic still allows on that item. If it does, the line's source is in the row (C15). If the source is not yet archived, the row is listed as a carried line. |
| **C17 [test]** | Every new or changed string matching `/\bask\b/i` also matches `/(counter|butcher|fishmonger|deli|bakery|market|farm stand|grower)/i` in the same sentence. No new `decision` or `cart_pick` contains "ask". |
| **C18 [test]** | For each avoid row in the batch table, `watch_out` or `buying_tips[2..]` contains the row's verbatim avoid phrase. The phrase names its register id's label term (or the term is "none on label" and the line is the rung's one fact line). The register id's evidence file exists under `docs/sources/concerns/`. There are at most 3 avoid phrases per card across `watch_out` and `buying_tips`, and any further sourced item sits in `detail`. No avoid phrase sits in `decision` or `cart_pick`. |
| **C19 [test]** | Direction 6 has two checks. (1) Each reassurance row in the Revisit hits table: its quoted base string is absent from every field of that entry after the batch. `## Change` lists it as dropped, so C8 exempts it. (2) No new or changed string on a batch id matches `/(within (legal |safe )?limits|tolerance|safe levels?|conventional is fine|buy conventional|eat more|heart[- ]healthy|debated|contested|credible concern at most)/i`, and no `sources` string on a batch id equals "EPA tolerance limits". |
| **C20 [test]** | (Stance 2.) Every new or changed string matching `/\b(avocado|canola|soybean|sunflower|safflower|corn|cottonseed|grapeseed|rice bran|vegetable|seed) oils?\b/i` also matches `/\b(skip|avoid|instead of|never|not|no)\b/i` in the same sentence. A fat a line recommends is one of butter, ghee, tallow, olive oil, coconut oil (lard: open question 5). |

## The four tests (per entry, on its pick)

| Test | Passes when the top lines name… | Fails when… |
|---|---|---|
| **T1 Best standard** | the item-specific standard: wild-caught (seafood), 100% grass-fed / grass-finished (beef, lamb, bison, dairy), pasture-raised (eggs, poultry, pork), raw from a named farm (raw dairy), organic only where it is the defining standard (see below) | the item has such a standard and neither `decision` nor `cart_pick` names it |
| **T2 No additives** | a list that rules out the gums, carrageenan, natural flavors, preservatives, added sugar, seed oil or colors *the default shelf version carries* | the usual version carries one and nothing in the top lines rules it out |
| **T3 No synthetic** | unfortified, unenriched, no synthetic sweetener | the pick allows a fortified or enriched version |
| **T4 Closest to source** | the least-processed form *of the same food* | a less-processed form of the same food exists and is not named |
| **T5 Top rung (B8 on)** | the item's top findable rung from Beyond organic, with organic as a fallback where something better is findable | organic heads the top lines while a findable, sourced rung above it exists |
| **T6 Avoid list (B8 on)** | `watch_out` or `buying_tips[2..]` names the item's sourced register concerns (≤3; more go in `detail`) | the card is a home card for a sourced register concern and names none of its terms |
| **T7 No mainstream verdict (B8 on)** | every line ranks by the holistic standard; government sources back raw fact only | any field carries a mainstream reassurance verdict (Revisit ground 3, C19) |

**Where organic is the defining standard (B1–B7b; from B8 on, organic is the fallback rung here, and the top rung leads wherever T5 finds one):**
- produce;
- the crops grown as bioengineered in the US: corn, soy, sugar. That covers tortillas, popcorn, tortilla chips, tofu, tempeh, miso, natto, soy sauce, soy milk and plain sugar;
- poultry and pork, as "pasture-raised or organic". That pairing is already used on the pork, bacon and ham cards.

Elsewhere organic is added only if scout question 7 quotes the card's own material already ranking organic (the 12 candidates in B8). Otherwise the card keeps its item standard. *Superseded for B8 by B8's new entry rule.*

**Fixed rules:**
- **No boilerplate (Devon, quote 3).** No sentence is added to many cards.
  - What USDA organic means stays where it already lives: `label_organic_scope`, `label_nonGMO_vs_organic`, `organic_worth_it_by_type`. All three already say organic "restricts" synthetic pesticides or names "the prohibited list".
  - One blunt line remains: `organic_worth_it_by_type` `labels_decoded` says "no SYNTHETIC pesticides" (KB line 840). B2 narrows it to "synthetic pesticides outside an approved list". The source is `docs/sources/item-cards/7cfr205.105-prohibited-substances.md` (url `https://www.law.cornell.edu/cfr/text/7/205.105`).
  - No new or changed string may appear on more than 2 entries (C10).
- **"Healthiest" is a ranking, not a claim.** Lines rank by processing and standard ("closest to the plant", "one ingredient", "nothing added"). No bodily or health wording (rules 2 and 3), no price (rule 8), no brands (rule 9). No new line says "synthetic" outside that one narrowing.
- **T4 stays within the card's food.** Nuggets become whole-muscle nuggets. A card never sends the shopper to a different food, and never refuses the item (stance 3).
- **Two-line rule.**
  - `decision` is ≤10 words.
  - `buying_tips[0]` is a why; `buying_tips[1]` is the look-for naming the standard. Shop mode shows the headline and the first tip, so the why is the line the shopper reads at the shelf (stance 6).
  - A line that gets displaced moves down or into `watch_out`/`detail` and is never deleted. The exception is a reassurance-verdict string (C19), which is dropped and listed in `## Change`.
  - Verdict subjects hold (rule 7) unless a ruling below changes them.

## Rulings needed (each gates only its own cards; B1 is gated by none)

| Q | What | Today | A | B | Gates |
|---|---|---|---|---|---|
| **Q1** | 6 produce cards decide *conventional* (`produce_root_vegetables` carrots, `produce_brassicas`, `produce_onions_garlic`, `produce_citrus`, `produce_mushrooms`, `produce_bananas`), defended by `organic_worth_it_by_type` and `label_organic_scope` | Conventional for peeled | **Recommended:** organic on every produce card. The peel/residue reasoning stays as a fact in `detail`; "if organic means fewer vegetables, buy conventional and eat more" stays as `watch_out` *(direction 6 drops this line; see B9)* | Keep the 6 conventional verdicts | 8 cards in B2; peeled picks in B7a |
| **Q2** | Cured meats: their own material says "celery powder supplies nitrite" | Organic or pasture-raised, cure named | Name the no-nitrite form where it exists (salt-only cured, fresh). `bacon`/`hot_dogs` change subject | **Recommended:** keep. The cure is named honestly and is not synthetic | `deli_meat_uncured`, `bacon`, `ham`, `cured_pork` |
| **Q3** | `salt` decides *iodized, anti-caking named*; its cart is *pickling or canning salt*. The two disagree | Mixed | **Recommended:** keep iodized (rule 7) and align the cart to it | Flip to salt with nothing added, iodine to `watch_out` | `salt` (B6) |
| **Q5** | Fortification. `soy_milk` resolved a fortified trade-off on 2026-10-19; `nutritional_yeast` decides "either type" | Fortified allowed | **Recommended:** Devon's quote 2 is the ruling: unfortified first, fortified named second in `watch_out` | Keep fortified as an equal choice | `soy_milk`, `oat_milk`, `almond_milk`, `coconut_milk_beverage`, `nutritional_yeast`, `breakfast_cereal` |

(Q4 from the earlier draft, raw dairy, is dissolved. "Raw from a farm you can name" is the item standard, so those cards pass.)

## Classification and failures

The calls come from the top lines at `ede90e7` plus what the default shelf product carries. Before each spec, scout question 7 confirms each T2/T3/T4 call against the card's own material. A call it cannot back never becomes a claim from memory. From B8 on, its source goes on the fetch list (stance 7).

| Class | Entries | Pass all four | Fail ≥1 (definite) | Conditional |
|---|---|---|---|---|
| A, farm/packaged food | 123 | 30 | 77 | 16 (12 organic candidates, B8 + 4 under Q2 = A) |
| B, wild / water / salt / seaweed | 17 | 14 | 3 (`white_fish`, `smoked_salmon`, `salt`) | — |
| C, label / technique / hub | 41 | 39 | 2 (`organic_worth_it_by_type`, `label_organic_scope`, Q1) | — |
| P, picks | 30 | 1 (`pick_anchovies`) | 29 | — |
| **Total** | **211** | **84** | **111** (82 cards + 29 picks) | **16** |

Every id below was checked against the KB's id list at `ede90e7`.

### Failures by test (cards; one card can fail several)

**T1 Best standard (46):**

| Standard missing | Cards |
|---|---|
| Pasture-raised or organic | `rotisserie_chicken`, `chicken_breast`, `chicken_cuts_basics`, `turkey_whole`, `ground_turkey`, `frozen_nuggets` |
| 100% grass-fed / pasture-raised | `butcher_counter_asking`, `organ_meats`, `lard_tallow` |
| Grass-fed dairy | `grassfed_butter` (cart only), `cheese_real_vs_processed`, `cream_vs_creamer`, `sour_cream`, `cream_cheese`, `cottage_cheese`, `ice_cream`, `ghee`, `goat_sheep_dairy` (pasture) |
| Wild-caught | `white_fish`, `smoked_salmon` |
| Organic produce | `frozen_vs_fresh_produce`, `produce_seasonality`, `sprouts_raw`; `cart_pick` only on `berries_picking`, `produce_leafy_greens`, `produce_peppers`, `produce_apples_pears`, `produce_stone_fruit`, `produce_green_beans`; Q1: `produce_root_vegetables`, `produce_brassicas`, `produce_onions_garlic`, `produce_citrus`, `produce_mushrooms`, `produce_bananas`, `organic_worth_it_by_type`, `label_organic_scope` |
| Organic (bioengineered crop) | `sugars`, `tortillas`, `tortilla_chips`, `popcorn`, `soy_milk`, `miso`, `tempeh`, `natto`, `hot_soy_sauce` |

**T2 No additives (37):**
- Dairy and plant milks: `cheese_real_vs_processed`, `cream_vs_creamer`, `cottage_cheese`, `ice_cream`, `almond_milk`, `oat_milk`, `coconut_milk_beverage`, `canned_coconut_milk`, `coconut_water`, `plant_butter`.
- Bread and grains: `sandwich_bread`, `bagels`, `buns_rolls`, `gluten_free_bread`, `pastries_muffins`, `breakfast_cereal`, `crackers`, `pretzels`.
- Snacks: `snack_bars`, `trail_mix`.
- Condiments, ferments and soup: `pasta_sauce`, `jam`, `ketchup_mustard`, `mayo`, `hummus`, `olives`, `kombucha`, `broth`, `canned_soup`.
- Frozen: `frozen_pizza`, `frozen_meals`, `frozen_waffles`, `frozen_nuggets`.
- Meat and seafood: `hot_dogs`, `turkey_bacon`, `smoked_salmon`.
- `salt` (Q3).

**T3 No synthetic (16):**
- Fortified (Q5): `breakfast_cereal`, `oat_milk`, `almond_milk`, `soy_milk`, `coconut_milk_beverage`, `nutritional_yeast`.
- Enriched flour not ruled out: `bagels`, `sourdough`, `pastries_muffins`, `pretzels`, `fresh_pasta`, `frozen_pizza`, `frozen_waffles`, `flour_basics` (white-flour half), `rice_arsenic`.
- `salt` (potassium iodide, Q3).

**T4 Closest to source (3):**
- `rice_arsenic`: white over brown. Held by rule 7; the arsenic reasoning stands.
- `breakfast_cereal`: extruded over muesli-type.
- `frozen_nuggets`: formed over whole-muscle.

**Union: 82 cards** (46 T1 + 31 more from T2 + 5 more from T3: `nutritional_yeast`, `sourdough`, `fresh_pasta`, `flour_basics`, `rice_arsenic`). These are batches B1–B6: 18 + 17 + 11 + 10 + 10 + 16 = 82.

**Organic candidates, conditional (12):** `oats_steelcut_rolled_instant`, `beans_dried_vs_canned`, `grains_beyond_rice`, `pasta_dry`, `coffee_beans`, `tea`, `cocoa`, `maple_syrup`, `raw_cider_vinegar`, `vinegar`, `potato_chips`, `dried_fruit`. Each passes on its item standard today (one ingredient, whole, pure, raw). Organic is added only if its own material already ranks it.

**Under Q2 = A only (4):** `deli_meat_uncured`, `bacon`, `ham`, `cured_pork`.

### Unchanged: all four pass (84, plus the 16 conditional cards if they stay as they are)

| Group | Count | Entries |
|---|---|---|
| Class A | 30 | `beef_grassfed_vs_grainfed`, `beef_cuts_basics`, `ground_beef_lean_ratio`, `lamb_goat`, `bison`, `pork_cuts_and_enhanced`, `egg_labels`, `egg_duck_quail`, `whole_vs_reduced_fat_milk`, `yogurt_plain_vs_flavored`, `plain_kefir`, `raw_milk`, `raw_kefir`, `raw_aged_cheese`, `nuts_raw_vs_roasted`, `seeds`, `nut_butter_ingredients`, `cooking_oils`, `olive_oil_grades`, `whole_spices`, `dried_herbs`, `sprouted_grain_bread`, `sprouted_grains`, `specialty_flours`, `muesli`, `sauerkraut`, `kimchi`, `fermented_pickles`, `salsa`, `frozen_fries` |
| Class B | 14 | `salmon_wild_vs_farmed`, `shrimp_imported_vs_domestic`, `honey_adulteration`, `mercury_by_fish`, `canned_fish_choosing`, `farmed_fish_by_species`, `bottled_water_buying`, `canned_tuna`, `venison_game`, `crab`, `lobster`, `scallops`, `clams_mussels_oysters`, `seaweed` |
| Class C | 39 | 18 `label_*` cards (all 19 except `label_organic_scope`); 12 technique cards: `freezing_produce`, `washing_produce`, `baking_soda_soak`, `precut_produce_tradeoffs`, `judging_meat_at_the_case`, `seafood_certifications`, `produce_ripeness_by_item`, `produce_storage`, `revive_greens`, `rancidity_check`, `deli_salads`, `prepared_meals`; 9 hubs: `bulk_bins_buying`, `seafood_counter`, `bread_aisle`, `dairy_case`, `fermented`, `condiments`, `snacks`, `deli`, `frozen` |
| Picks | 1 | `pick_anchovies` |

Scout question 7 re-confirms every pass that sits next to a batch's cards. A pass it cannot confirm goes to ship notes, not into a batch.

These 84 passed the four tests. They have **not** been checked for T6, the avoid lists. Some are home cards with register gaps at 2026-10-18; examples are `shrimp_imported_vs_domestic` (sulfites), `whole_spices` (irradiation), `frozen_fries` (TBHQ, acrylamide), `washing_produce` (coatings) and `dairy_case` (ultra-pasteurized). They form the follow-on sweep after B8 (see "After B8").

Two of the 84 fail T7 on a grep of the live KB and move into batches now: `salmon_wild_vs_farmed` (B11) and `label_nonGMO_vs_organic` (B9). See the Revisit hits table.

The stance (point 3) makes eggs feed-first, then organic. `egg_labels` is in the unchanged 84 and is believed feed-first since 2026-10-18. R1 quotes its live decision. If the decision does not lead with feed, `egg_labels` joins B11 as a rung row.

### Picks (30; 29 fail)

| Test | Count | Picks |
|---|---|---|
| T1 organic produce | 20 | 17 fresh: `pick_cucumbers`, `pick_asparagus`, `pick_corn`, `pick_eggplant`, `pick_zucchini`, `pick_cilantro`, `pick_parsley`, `pick_basil`, `pick_snap_peas`, `pick_kohlrabi`, `pick_okra`, `pick_swiss_chard`, `pick_mangoes`, `pick_celery`, `pick_winter_squash`, `pick_ginger_turmeric`, `pick_microgreens`; 3 processed: `pick_frozen_peas`, `pick_frozen_broccoli`, `pick_canned_tomatoes` |
| T1 item standard | 6 | `pick_tofu` (organic soy), `pick_soup_bones` (100% grass-fed), `pick_egg_whites` (pasture-raised), `pick_sausage` (pasture-raised or organic), `pick_jerky` (100% grass-fed), `pick_fish_sticks` (wild-caught) |
| T2 | 3 | `pick_juice`, `pick_jerky`, `pick_english_muffins` |
| T3 | 1 | `pick_pita_naan` (enriched flour) |
| T4 | 3 | `pick_juice` (from fruit, not concentrate), `pick_fish_sticks` (fillet, not minced), `pick_jerky` (whole-muscle) |
| Passes all four | 1 | `pick_anchovies` |

## Scout first (admin-run before each batch's spec)

1. `dv scout "For each id in batch <N>, which files under server/test and server/lib assert its decision, cart_pick, buying_tips, watch_out or doLines value, and do they read the live KB or a git ref?" --terms TWO_LINE,BECAME,RANKED,IDS,doLines`
2. `dv scout "Which ids do cardOrder.test.js and cardTidy.test.js pin via RANKED/card(), and where do they deepEqual doLines.json minus an exception?" --terms RANKED,card,doLines`
3. `dv scout "Does counterCardLint.js constrain cart_pick (length, overlap with decision, duplicate lines across cards)?" --terms lintCard,lintSections,cart_pick`
4. `dv scout "Does matchItemToCard map a cart_pick prefixed 'Pasture-raised ', 'Grass-fed ', 'Organic ' or 'Wild-caught ' to its own card; does listMatchProbe.js exercise cart_pick text?" --terms matchItemToCard,cart_pick`
5. `dv scout "What reads a kind:'pick' entry's decision (listMatch, compose, list row why), and does twoLineCheck.js include or skip picks?" --terms kind,pick,twoLineCheck`
6. `dv scout "In scripts/buildDoLines.js, is the do-line headline copied from the KB decision or authored in docs/do-lines-review.md?" --terms buildDoLines,headline`
7. `dv ask --role scout "For each batch-<N> card, quote every line (detail, science, watch_out, buying_tips, labels_decoded, kristy_take) mentioning organic, wild, grass-fed, grass-finished, pasture, gum, carrageenan, natural flavor, preservative, added sugar, seed oil, color, fortified, enriched, bioengineered, nitrite, whole-muscle or formed, with field and index" --cd /Users/m1/kristy`. This confirms or drops each call and supplies the line-2 why from existing material.
8. `dv ask --role scout "Under docs/sources, which archived files state what enrichment/fortification adds, what gums/carrageenan are, or that corn/soy/sugar beets are mostly bioengineered, with the url: line?" --cd /Users/m1/kristy`

**Added for Beyond organic (before the B9 spec, and R1/R6/R8 again before each later batch):**

- R1. `dv ask --role scout "For every id in the Revisit table of docs/CLEAN-PICK-PLAN.md, plus egg_labels, quote its live decision, cart_pick, buying_tips[0..2] and watch_out" --cd /Users/m1/kristy`. This confirms each (a)/(b)/(c) call and the stance's feed-first eggs. A call the live text contradicts moves class, and the move is recorded in ship notes.
- R2. `dv scout "Which terms does lintSections L4 resolve via CANONICAL_GLOSSES (quote G1-G<n> term and gloss), and would 'unsprayed', 'without sprays', 'local', 'small farm', 'farmers market', 'Certified Naturally Grown' or 'ultra-pasteurized' resolve any term? Quote the G3 gloss and its word count." --terms CANONICAL_GLOSSES,lintSections,TERM_UNGLOSSED`
- R3. `dv ask --role scout "Under docs/sources, which files (with url: line) cover 7 CFR 205.206, 205.601, 205.239, 21 CFR 131.3, USDA PDP residue data, hydroponic organic certification, Certified Naturally Grown, chlorine or sanitizer washes on bagged greens, potato sprout inhibitors (chlorpropham), Real Organic Project, Regenerative Organic Certified, The Detox Project Glyphosate Residue Free, Weston A. Price Foundation, Cornucopia Institute and the American Grassfed Association? Does docs/CONCERN-REGISTER.md have an rBST/rbGH row, and with which evidence file?" --cd /Users/m1/kristy`. Whatever comes back missing is the admin's fetch list (the S rows marked fetch or check).
- R4. `dv ask --role scout "Does produce_root_vegetables cover potatoes; does produce_brassicas cover kale or collards? Quote field and index." --cd /Users/m1/kristy`
- R5. `dv scout "Does matchItemToCard map carts beginning 'Lettuce grown without sprays', 'Local ' or 'Farmers market ' to the card named after them (lettuce, berries, apples, peppers, cream)?" --terms matchItemToCard,cart_pick`
- R6. `dv ask --role scout "Re-run the docs/CONCERN-COVERAGE.md method at <base ref> for the ids of batch <N>: for each id, list every docs/CONCERN-REGISTER.md concern that names it as a home card, and say whether its live decision, short_answer, detail, buying_tips, watch_out, labels_decoded or pick_steps contains that concern's label terms (quote field and index)." --cd /Users/m1/kristy`. The concerns it reports missing are that batch's avoid rows. An id with none drops to its rung class only.
- R7. `dv scout "Which fields does a kind:'pick' entry carry and which of them render on iOS or in list rows (decision, pick_steps, watch_out)?" --terms kind,pick,pick_steps`. This settles whether a pick can hold an avoid item (B13).
- R8. Re-run the direction-6 grep at each batch's base over every field of every entry, with the C19 regex plus `well below`, `generally within`, `fine there`, `organic or not`, `Dietary Guidelines` and `saturated fat`. A new hit on a batch id joins that batch as a reassurance row. A hit outside the batch goes to the sweep list. The planner can run this itself (it is a Grep of the KB), so no scout is needed.
- R9 (before the B9 spec, because SR may need B9 to carry an aligned tip). `dv scout "Which files read server/lib/sectionRules.json (route, iOS renderer, tests), what does each assert about rule, checks, beyond, sources, tip_aligned and cards_aligned (word cap, lint, a card tip that must match the rule), and which tests pin the produce, eggs_dairy and frozen strings verbatim (w2.test.js:102, ca-5.test.js:18, any others)?" --terms sectionRules,tip_aligned,cards_aligned,sectionTips`

**Pattern to mirror:** `server/test/acceptance/sugarsRank.test.js`. It has a git-ref baseline, a verbatim `BECAME` table, the `nonEmpty` guard, a doLines plus review-row check, and `matchItemToCard`. No existing test checks the four tests. From B8 on, also mirror `server/test/acceptance/cleanPick7.test.js` (the latest shipped batch). No existing test checks an avoid list against the register (C18 is new), none checks a reassurance string's absence (C19 is new), and none checks fats (C20 is new). The archive grep in C15 mirrors the url check that the concern-register batches already use (`url:` lines under `docs/sources/concerns`). For SR, mirror the pin that `server/test/acceptance/ca-5.test.js` keeps on `sectionRules.json`, and overlay it to a git ref the same way `sugarsRank` was repointed in B1.

## Intent

A shopper opens Salmon, Beef, Chicken, Butter, Sugar or Oat milk. In every case the headline and cart pick name that item's best version: wild-caught, 100% grass-fed and grass-finished, pasture-raised, organic sugar, unsweetened and unfortified with nothing added. Adding the cart pick puts that version on the list. Every card's line reads specific to its own food. None of them reads like "buy organic".

From B8 on, the same holds when the shopper opens Lettuce, Berries, Apples or Cream:
- The top line names the item's best findable self, such as lettuce grown without sprays (bagged or head), berries from a local farm, or cream that is not ultra-pasteurized.
- The card says what to look for, and what to avoid on that item: wax on apples, fungicide on citrus peel, a chlorinated wash on bagged greens.
- Organic sits in the tips as the findable close second, never as the finish line.
- No line anywhere on the card tells the shopper the ordinary version is fine.

In shop mode, the produce aisle's rule reads local and in season first, with organic as the floor, not "Organic on anything you eat the skin of".

## Non-goals

- Depth fields (`detail`, `science`, `labels_decoded`). They only receive demoted lines, plus the one narrowing on `organic_worth_it_by_type`, plus B9's "where organic falls short" facts on `organic_worth_it_by_type` and `label_organic_scope`. `watch_out` also receives avoid lists from B8 on, and `detail` receives avoid items past the cap of 3. The exception is a depth line that carries a mainstream reassurance verdict (direction 6): it is rewritten in its batch.
- New register concerns, except S10, S11 and S18 (if R3 finds no rBST row). Each gains one row in `docs/CONCERN-REGISTER.md` when its source is archived. That edit is the admin's, not a batch's.
- Section rules beyond the three rows SR names (meat, seafood and bulk_pantry already state a holistic principle).
- The ingredient KB and the verdict engine (rule 5).
- iOS, the frozen `client/src`, and the scan card.
- `aliases`/`asked_as`, except where scout question 4 or R5 shows a cart pick missing its own card.
- Any verdict-subject change without a ruling.
- Migration inside a batch. Every batch commit says `Not migrated.`
- Naming any brand, or any line that ranks brands rather than practices (rule 9).
- Adopting a holistic source's bodily or healing claims (rules 2 and 3).

## Criteria (every batch spec repeats these over its own ids)

| # | Criterion |
|---|---|
| **C1 [test]** | For each `(id, test)` row in the batch table, the spec names the carrying phrase, and `decision` or `cart_pick` (the pick's `decision` on picks) contains it verbatim. |
| **C2 [test]** | Card `decision` ≤10 words; `node server/scripts/twoLineCheck.js` reports 0 of 181. |
| **C3 [test]** | `buying_tips[0]` does not match `/^(choose|pick|buy|read|check|look|skip|compare)\b/i` and does not equal `decision`; `buying_tips[1]` names the card's T1 standard or its T2/T3 phrase. |
| **C4 [test]** | No string new or changed against the base ref matches `/\b(health|healthy|healthier|safer|risk|cancer|disease|toxic|toxin|detox|pesticide-free|synthetic|price|cost|cheap|expensive)\b/i`. The only exemption is `synthetic` in B2's one narrowed `organic_worth_it_by_type` line. On `rice_arsenic`, no sentence pairs a standard with "arsenic". (B8 on: plus C4b. "Detox" inside the S14 source name sits only in `sources`, which C4 does not scan [PLACEHOLDER: confirm the C4 field scope in the spec].) |
| **C5 [test]** | (B1–B7b; B8 on uses C5b.) The ids that gain the word "organic" equal exactly the batch table's rows whose standard includes organic (organic produce, bioengineered crop, "pasture-raised or organic"). No other card gains it. |
| **C6 [test]** | Every entry outside the batch, picks included, deepEquals its base-ref entry. |
| **C7 [test]** | `doLines.json` `headline` equals `decision` for each batch id; every other entry equals the base ref; the `docs/do-lines-review.md` row carries the same two cells. |
| **C8 [test]** | Every base-ref `buying_tips` string of a batch card still appears in its `buying_tips`, `watch_out` or `detail`, unless `## Change` lists it as dropped. A C19 reassurance string is always listed as dropped. |
| **C9 [test]** | `matchItemToCard(<new cart_pick>)` returns the card's own id; `node server/scripts/listMatchProbe.js` reports no wrong match. |
| **C10 [test]** | No new or changed `decision`, `cart_pick` or `buying_tips` string appears verbatim on more than 2 entries in the KB [PLACEHOLDER threshold]. This is the no-boilerplate guard. |

C4b, C5b and C14–C20 (Beyond organic and the stance) apply to B8–B13.

**Common alignment.**
- **Out of scope:** ids outside the batch, aliases, depth rewrites beyond the avoid lines in `watch_out`, the avoid overflow in `detail` and the C19 reassurance rewrites.
- **OK rough edges:** headlines lead with their standard word. A call that scout question 7, R6 or R8 cannot back stays unchanged in this batch, and its source goes on the fetch list as a carried line (stance 7), not into ship notes as dropped.
- **Ship bar:** C1–C10 red (plus C4b, C5b, C14–C20 from B8 on); `npm test` below start + new; a verdict subject changed without a ruling (the critic compares the old→new table in the spec).

**Common route:**
- **Build:** `dv T2` (fallback forge@opus [T2]). The copy is pinned verbatim, and the pin overlays across git refs branch.
- **Review:** critic@opus with FIDELITY required.
- **Parallel-safe:** no. Batches share the KB, doLines and pins, so they run serially, each based on the previous batch's commit.
- **Dial:** P1. Reversible by git ref.

**Common owns:**
- the batch ids' entries in `server/kristy_perimeter_kb.json`;
- their rows in `server/lib/doLines.json` and `docs/do-lines-review.md`;
- the pin overlays scout question 1 names (`server/test/acceptance/twoLinePin.js` entries; `cardOrder.test.js`/`cardTidy.test.js` exceptions where the batch touches their ids).

More than 3 pin files beyond these → split the batch.

**Common verify.** The start count is recorded on the pre-batch tree: 2831 at `ede90e7`, per its commit message, not re-run here.
```
cd server && npm test                          # start + new, 0 fail
node scripts/twoLineCheck.js                   # 0/181
node scripts/listMatchProbe.js                 # no wrong match
node scripts/commitGuard.js                    # clean
```

**Common dispatch.**
1. Scout questions 1–8 return.
2. The planner writes `.pipeline/specs/clean-pick-<N>.md`. It holds:
   - a verbatim `BECAME` per card;
   - `## Acceptance test/acceptance/cleanPick<N>.test.js` (in verify, not owns);
   - `## Contract`;
   - `Env: node, git; server/.env not needed`.
3. The admin runs `dv check .pipeline/specs/clean-pick-<N>.md` → PASS.
4. `dv route T2 --plan docs/CLEAN-PICK-PLAN.md`.
5. `dv build .pipeline/specs/clean-pick-<N>.md` in the background.
6. critic@opus on the runId, the spec, FIDELITY required.

From B8 on, two steps come before step 1:
- 0a. R1–R9 return before B9. R1, R6 and R8 re-run at each batch's base.
- 0b. The admin fetches and archives every S row that R3 reports missing, each with its `url:` line, and adds the S10/S11 (and S18 if needed) register rows. The planner writes no spray, residue, avoid or processing line until its source file exists. A line whose source has not arrived is carried to the next batch, not dropped.

---

## B1: staples incl. sugars (18), no ruling needed

All drafts are [DRAFT]. Each standard word must be quoted from the card's own material by scout question 7; if it is absent, the draft drops back to the card's current standard.

| id | fails | decision (≤10 words) | cart_pick |
|---|---|---|---|
| sugars | T1 (organic, already ranked in its tip 4) | Organic coconut or maple sugar first, each from one sap. | Organic coconut sugar or pure maple sugar |
| rotisserie_chicken | T1 | Pasture-raised or organic rotisserie chicken, salt and spices only. | Organic or pasture-raised plain rotisserie chicken |
| chicken_breast | T1 | Pasture-raised bone-in, skin-on breast before boneless; no solution added. | Pasture-raised or organic chicken breast, no added solution |
| chicken_cuts_basics | T1 | Air-chilled pasture-raised whole chicken, then bone-in, skin-on thighs. | Air-chilled pasture-raised whole chicken or thighs |
| ground_turkey | T1 | Pasture-raised or organic ground turkey, fat content printed. | Pasture-raised or organic plain ground turkey |
| turkey_whole | T1 | Pasture-raised whole turkey, without an injected basting solution. | Pasture-raised whole turkey, no added solution |
| grassfed_butter | T1 (cart) | *(unchanged)* | Grass-fed butter, cream and salt only |
| cheese_real_vs_processed | T1 T2 | Grass-fed block cheese: milk, cultures, salt, enzymes, nothing else. | Grass-fed block cheese, nothing added |
| cream_vs_creamer | T1 T2 | Grass-fed heavy cream or half-and-half: cream and milk only. | Grass-fed half-and-half, milk and cream only |
| sour_cream | T1 | Grass-fed sour cream: cream and cultures, nothing else added. | Grass-fed sour cream, cream and cultures only |
| cream_cheese | T1 | Grass-fed cream cheese by its standard name, no stabilizers. | Grass-fed cream cheese, no stabilizers |
| sandwich_bread | T2 | Whole wheat sandwich bread: flour, water, yeast, salt, little else. | Whole wheat sandwich bread with a short list |
| flour_basics | T3 | Whole wheat flour; white flour unbleached, unbromated, unenriched. | *(unchanged)* |
| tortillas | T1 (bioengineered corn) | Organic corn tortillas of masa, water and salt. | Organic corn tortillas |
| mayo | T2 | Mayonnaise with olive oil alone, egg yolk and an acid. | Mayonnaise made with olive oil only |
| pasta_sauce | T2 | Pasta sauce of tomatoes and olive oil, no added sugar. | Pasta sauce with no added sugar |
| broth | T2 | Broth of named bones, meat or vegetables, no yeast extract. | Broth with bones or vegetables named, nothing else added |
| white_fish | T1 (wild) | Wild-caught white fish by its named species, firm, mild-smelling. | A named wild-caught white fish fillet, firm and on ice |

**Card-specific conditions:**
- `flour_basics` "unenriched", `mayo` "olive oil alone", `broth` "yeast extract" and `tortillas` "organic" each land only if scout questions 7/8 find them in the card's material or an archived source. Otherwise that cell stays as it is today.

**Sugars pins:**
- `server/test/acceptance/sugarsRank.test.js` reads the live card (line 16) for `BECAME`, and its C3 matches `/^Coconut or maple sugar first/`; the B1 decision breaks both. Repoint `live` to `git show ede90e7:server/kristy_perimeter_kb.json` and its doLines/review reads to `ede90e7`, so it keeps proving the 10-19 change at its own commit. clean-pick-1 owns the live card from here.
- `cardOrder`/`cardTidy` pin sugars to `b284f0b` and need only their doLines exception widened.

**Independent check:**
- A `node -e` diff against `ede90e7` lists exactly the 18 B1 ids as changed.
- Of the 18 B1 entries, exactly 5 contain "organic" in `decision` or `cart_pick` (4 if `tortillas` drops back): `sugars`, `rotisserie_chicken`, `chicken_breast`, `ground_turkey`, `tortillas`. The other 13 carry their own item standard or a nothing-added list. A count near 18 means boilerplate.

## B2: produce (17), held on Q1
- **Definite:** `frozen_vs_fresh_produce`, `produce_seasonality`, `sprouts_raw`.
- **`cart_pick` only:** `berries_picking`, `produce_leafy_greens`, `produce_peppers`, `produce_apples_pears`, `produce_stone_fruit`, `produce_green_beans`.
- **Q1:** `produce_root_vegetables`, `produce_brassicas`, `produce_onions_garlic`, `produce_citrus`, `produce_mushrooms`, `produce_bananas`, `organic_worth_it_by_type` (also carries the one "no SYNTHETIC pesticides" narrowing), `label_organic_scope`.

All are T1. Organic here *is* the item standard, so C5 expects every one of them.
- **Extra C11 [test] (Q1 = A):** no batch `decision` contains "conventional" (6 do today).
- Under Q1 = B, B2 is 9 cards, plus the narrowing on `organic_worth_it_by_type`.
- Each cart pick names its produce item ("Organic carrots", not "Organic produce"), so C10 holds.

## B3: dairy and plant milks (11)

| Fails | Cards | Standard |
|---|---|---|
| T1 | `ghee`, `goat_sheep_dairy` | grass-fed; pasture |
| T1 T2 | `cottage_cheese`, `ice_cream` | grass-fed; cultured; no gums |
| T1 T3 (Q5) | `soy_milk` | organic soybeans, unfortified |
| T2 T3 (Q5) | `almond_milk`, `oat_milk`, `coconut_milk_beverage` | — |
| T2 | `canned_coconut_milk`, `coconut_water`, `plant_butter` | — |

- `cardTidy` pins `almond_milk`, `soy_milk`, `oat_milk` and `canned_coconut_milk`.
- Q5 supersedes the 2026-10-19 soy-milk trade-off.

## B4: meat, seafood and frozen (10, or 14 under Q2 = A)

| Fails | Cards | Standard |
|---|---|---|
| T1 | `butcher_counter_asking` | 100% grass-fed bones |
| T1 | `organ_meats` | 100% grass-fed / pasture-raised |
| T1 | `lard_tallow` | pasture-raised lard, grass-fed tallow |
| T1 T2 | `smoked_salmon` | wild-caught |
| T1 T2 T4 | `frozen_nuggets` | pasture-raised or organic, whole-muscle |
| T2 | `hot_dogs`, `turkey_bacon`, `frozen_meals` | — |
| T2 T3 | `frozen_pizza`, `frozen_waffles` | — |
| Q2 = A only | `deli_meat_uncured`, `bacon`, `ham`, `cured_pork` | — |

## B5: bread and grains (10)

| Fails | Cards |
|---|---|
| T2 | `buns_rolls`, `crackers` |
| T2, gum inherent (the fewest gums, named) | `gluten_free_bread` |
| T2 T3 | `bagels`, `pastries_muffins`, `pretzels` |
| T2 T3 T4 (Q5) | `breakfast_cereal` |
| T3 | `sourdough`, `fresh_pasta` |
| T3, if "unenriched" is in its material | `rice_arsenic` (T4 held) |

## B6: corn, soy, ferments, condiments, snacks (16)

| Fails | Cards |
|---|---|
| T1 organic (bioengineered crop) | `tortilla_chips`, `popcorn`, `miso`, `tempeh`, `natto`, `hot_soy_sauce` |
| T2 | `kombucha`, `jam`, `ketchup_mustard`, `hummus`, `olives`, `canned_soup`, `snack_bars`, `trail_mix` |
| T3 (Q5) | `nutritional_yeast` |
| T2 T3 (Q3) | `salt` |

`tortilla_chips`, `popcorn` and `canned_soup` are also pinned by `cardTidy`/`cardOrder`.

## B7a / B7b: picks (17 + 12)

The tests apply to each pick's `decision`. That field feeds lists, and picks never migrate. Scout question 5 settles whether twoLineCheck covers picks.
- **B7a:** the 17 fresh-produce picks in the table above (the peeled ones follow Q1).
- **B7b:** `pick_frozen_peas`, `pick_frozen_broccoli`, `pick_canned_tomatoes`, `pick_tofu`, `pick_soup_bones`, `pick_egg_whites`, `pick_sausage`, `pick_jerky`, `pick_fish_sticks`, `pick_juice`, `pick_english_muffins`, `pick_pita_naan`.
- **Extra C12 [test]:** every pick resolves through `matchItemToCard` to the same id it does at the base ref.
- **Shipped (B7b `6ff7930`):** 9 changed. `pick_sausage`, `pick_egg_whites` and `pick_soup_bones` were held at base and moved to B8.

---

## Revisit: B1–B7b under Beyond organic [DRAFT, R1, R6 and R8 confirm]

All of B1–B7b shipped organic-first (B1 `230dd1e` through B7b `6ff7930`). Each shipped card and pick has three grounds for a (b) rewrite:
- **rung (direction 4, stance 3):** organic is the headline, or the only standard named, and a better findable rung exists;
- **avoid (direction 5, stance 4):** the entry is a home card for a sourced register concern and names none of its terms;
- **reassurance (direction 6, stance 7):** a field carries a mainstream reassurance verdict (the hits table below).

The classes:
- **(a)** at its top rung, with no avoid gap and no reassurance hit;
- **(b)** rewrite, on any ground;
- **(c)** organic is the right floor, because no findable rung sits above it, and there is no avoid gap or reassurance hit.

How the calls were made:
- Rung calls come from each batch's table plus the item's ladder.
- Avoid calls come from `docs/CONCERN-COVERAGE.md` §A "home cards missing", built 2026-10-18, before B1–B7b shipped. Those calls are stale: B1–B6's T2 fixes ("no gums", "no carrageenan", "no added sugar") may already have closed some of them.
- R6 re-greps each batch at its base. An avoid call it finds closed drops that id out of (b), unless the id also has a rung or reassurance call. R1 confirms the rung calls.
- The reassurance calls are the exception: they come from a grep of the live KB at `6ff7930`, run while this amendment was written. They are the only calls here made from live text.
- Each id sits in exactly one cell. An id with both a rung call and avoid concerns sits in the rung column, with its concerns in parentheses. The "(b) avoid" column holds avoid-only ids, whose rung stays unchanged. "[D6 hit]" in a cell marks a direction-6 reassurance hit (hits table below); it does not move the id between columns.

| Batch | (a) | (b) rung | (b) avoid (register concerns) | (c) |
|---|---|---|---|---|
| B1 (18) | `chicken_breast`, `turkey_whole`, `grassfed_butter`, `cheese_real_vs_processed`, `mayo`, `white_fish` (6) | `cream_vs_creamer`: grass-fed, but pasteurized and not ultra-pasteurized is a findable rung above (S6). Also avoid: `ultra_pasteurized`, `titanium_dioxide`, `synthetic_emulsifiers` (1) | `sour_cream`, `cream_cheese` (carrageenan); `pasta_sauce` (caramel_color, hidden_sugars); `tortillas` (propylparaben, bioengineered); `sugars` (bioengineered); `ground_turkey` (poultry_chill_wash); `chicken_cuts_basics` (enhanced_meat); `flour_basics`, `sandwich_bread` (glyphosate_desiccation); `broth` (hidden_glutamates) (10) | `rotisserie_chicken` (pasture-raised rotisserie judged not findable) (1) |
| B2 (17) | none | `organic_worth_it_by_type` (also pfas_pesticides) [D6 hit], `label_organic_scope` (also irradiation), `produce_apples_pears` (also produce_coatings), `produce_stone_fruit` (also pfas_pesticides), `produce_peppers` (also produce_coatings), `produce_green_beans`, `produce_seasonality`, `produce_leafy_greens`, `berries_picking` (also pfas_pesticides), `produce_root_vegetables` (potatoes rung conditional on R4; also S11 sprout inhibitor) [D6 hit; this hit alone keeps it in (b)] (10); conditional on R4: `produce_brassicas` (kale or collards) (1) | `produce_citrus` (citrus_fungicides, produce_coatings) (1) | `frozen_vs_fresh_produce`, `sprouts_raw`, `produce_onions_garlic`, `produce_mushrooms`, `produce_bananas` (5) |
| B3 (11) | `ghee`, `goat_sheep_dairy`, `canned_coconut_milk`, `coconut_water`, `plant_butter` (5) | none | `almond_milk` [D6 hit], `oat_milk`, `soy_milk` [D6 hit] (carrageenan, gums_stabilizers); `coconut_milk_beverage`, `cottage_cheese` (carrageenan); `ice_cream` (carrageenan, synthetic_emulsifiers, sugar_alcohols) (6) | none |
| B4 (10) | `butcher_counter_asking`, `organ_meats`, `lard_tallow`, `smoked_salmon`, `frozen_pizza` (5) | none | `hot_dogs` (phosphate_additives, added_nitrite); `turkey_bacon` (phosphate_additives); `frozen_nuggets` (tbhq_propyl_gallate, phosphate_additives); `frozen_waffles` (synthetic_dyes); `frozen_meals` (hidden_glutamates) (5) | none |
| B5 (10) | `gluten_free_bread`, `pretzels`, `sourdough`, `fresh_pasta`, `rice_arsenic` (5) | none | `breakfast_cereal` (synthetic_dyes, bha_bht, glyphosate_desiccation, chlormequat); `crackers` (bha_bht, tbhq_propyl_gallate); `buns_rolls` (potassium_bromate, azodicarbonamide); `bagels` (potassium_bromate); `pastries_muffins` (propylparaben) (5) | none |
| B6 (16) | `jam`, `olives`, `trail_mix`, `nutritional_yeast`, `salt` (5) | `popcorn` moves to B8 (it shipped without organic; also pfas_packaging, bioengineered) (1, not counted in B9–B13) | `hot_soy_sauce` (caramel_color); `ketchup_mustard` (sodium_benzoate, hidden_sugars); `kombucha` (natural_flavors); `canned_soup` (hidden_glutamates); `snack_bars` (synthetic_dyes, artificial_sweeteners, sugar_alcohols, glyphosate_desiccation); `hummus` (glyphosate_desiccation); `tortilla_chips` (bioengineered) (7) | `miso`, `tempeh`, `natto` (3) |
| B7a (17) | none | `pick_celery`, `pick_cucumbers` (also produce_coatings), `pick_swiss_chard` (also dirty_dozen), `pick_cilantro`, `pick_parsley`, `pick_basil`, `pick_microgreens` (7) | `pick_corn` (bioengineered), R7-gated (1) | `pick_asparagus`, `pick_eggplant`, `pick_zucchini`, `pick_snap_peas`, `pick_kohlrabi`, `pick_okra`, `pick_mangoes`, `pick_winter_squash`, `pick_ginger_turmeric` (9) |
| B7b (9 shipped) | `pick_fish_sticks`, `pick_english_muffins`, `pick_pita_naan` (3) | `pick_jerky` moves to B8 (grass-fed, grass-finished rung; also added_nitrite, celery_powder_uncured) (1, not counted in B9–B13) | `pick_juice` (synthetic_dyes, sodium_benzoate, bvo); `pick_tofu` (bioengineered); both R7-gated (2) | `pick_frozen_peas`, `pick_frozen_broccoli`, `pick_canned_tomatoes` (3) |
| **Total 108** | **29** | **19** (18 + 1 conditional), **+2 to B8** | **37** | **21** |

**Reconciliation:**
- 29 (a) + 19 (b) rung + 37 (b) avoid + 21 (c) + 2 to B8 = 108.
- Shipped: 18 + 17 + 11 + 10 + 10 + 16 + 17 + 9 = 108.
- The 56 shipped (b) ids go to B9–B13. With the 2 reassurance ids from the unchanged 84, the batches hold 58: 12 + 11 + 15 + 17 + 3.
- 50 stay as shipped: 29 (a) + 21 (c).
- Compared with the direction-4-only revisit, the 37 avoid rows came out of the earlier (a) (29) and the earlier (c) (8).
- `produce_root_vegetables` is no longer conditional. Its reassurance hit keeps it in (b) whatever R4 says about potatoes; R4 now decides only its potatoes rung and the S11 line.
- R1, R6 and R8 may move ids between cells (R1 may also add `egg_labels` to B11). The planner recounts at each batch base, and no batch depends on the total.

**Direction-6 reassurance hits (grep of the live KB at `6ff7930`, 2026-10-20).**

The grep covered every field of all 211 entries. Terms searched:
- `conventional is fine`, `buy conventional`, `conventional` (all hits read), `within limits`/`within tolerance`/`tolerance`, `safe levels`;
- `well below`, `fine`, `okay`, `just as good`, `not worth`, `harmless`, `recommend`, `Dietary Guidelines`, `heart-healthy`/`heart health`, `saturated fat`;
- `canola`, `vegetable oil`, `seed oils? (is|are)`, `contested`, `debated`, `unproven`.

Every hit line was read. Only lines that adopt a mainstream verdict as Kristy's position are listed.

| id | field | base string (verbatim fragment) | call | batch |
|---|---|---|---|---|
| `organic_worth_it_by_type` | `detail` | "Pesticide residues on conventional produce are generally within legal limits, and washing removes some." / "The specific “Dirty Dozen” ranking and its risk framing are debated by scientists, so it rates a credible concern at most, never a settled fact. Eating more produce, organic or not, is the win." | (b), drop the verdicts, keep the peel facts | B9 (already in) |
| `organic_worth_it_by_type` | `watch_out[3]`, `watch_out[4]` | "The “Dirty Dozen” ranking is contested on its methodology. The eaten-whole reasoning holds; the list order does not." / "If organic means fewer vegetables in the cart, buy conventional and eat more." | (b). [4] becomes the holistic retreat ("when organic runs short, peeled produce waits; skin-on comes first"), subject to open question 1 | B9 |
| `organic_worth_it_by_type` | `science` | "The Dirty Dozen order is contested; the eaten-whole reasoning holds. If organic means fewer vegetables, buy conventional and eat more." | (b) | B9 |
| `organic_worth_it_by_type` | `sources`, `evidence_tier` | "EPA tolerance limits"; `evidence_tier: "credible_concern"` | (b): drop the verdict source. The tier is the spec's call [PLACEHOLDER: keep or raise], never lowered | B9 |
| `produce_root_vegetables` | `detail` | "Carrots rank among the lowest for pesticide residue, so conventional is fine there." | (b), keep "carrots rank among the lowest" (an S2 fact), drop "so conventional is fine there" | B9 (now unconditional) |
| `label_nonGMO_vs_organic` | `detail`, `science` | "Whether GMOs are a concern at all is a separate, debated question, and it stays honest here rather than oversold." / "Whether GMOs are a concern at all is a separate, debated question." | (b), drop the hedge; the register's `bioengineered` row states the label fact | B9 (new, from the unchanged 84) |
| `salmon_wild_vs_farmed` | `buying_tips[2]` | "Levels were well below FDA tolerance levels for bought fish." | (b), keep the 2004 study's finding (14 contaminants, all higher in farmed), drop the tolerance reassurance | B11 (new, from the unchanged 84) |
| `soy_milk` | `why` (a top line), `detail`, `science` | "FDA notes the Dietary Guidelines count only fortified soy drinks in the dairy group." / "FDA suggests choosing drinks higher in protein, vitamin D, calcium and potassium. It also suggests lower saturated fat and added sugars." | (b). `why` becomes a soybean-and-water line from the card's own material, since the government framing argues against its own unfortified decision (Q5). The FDA suggestion lines are dropped | B11 (already in) |
| `almond_milk` | `buying_tips[5]`, `detail`, `science` | "Check saturated fat on the panel." / "FDA suggests choosing drinks higher in protein, vitamin D, calcium and potassium. It also suggests lower saturated fat and added sugars." | (b), drop both. `buying_tips[4]` "Compare protein, vitamin D, calcium and potassium across cartons" is a fortification shopping cue against Q5's unfortified pick, so it is dropped too [judgement] | B11 (already in) |

**Seen, not counted as verdicts.** These hits are food handling, are holistic-aligned, or are permitted retreats. Devon may add any of the first three (open question 4):
- `egg_labels`: "Plain conventional eggs are still one of the lowest-cost animal foods in the store." This is a rule-7 budget retreat, not a health verdict. It is held pending open question 1.
- `washing_produce`: its tier note calls a plain-water rinse "the settled published recommendation". It ranks plain water over bottled washes, and the card sends residue to the baking-soda soak.
- `whole_vs_reduced_fat_milk`: its dairy-fat "honest debate" line and "contested literature" source reject the low-fat guidance rather than adopting it, though they hedge.
- `venison_game`: CWD "no evidence shows it passing to humans" is a handling fact.
- `nuts_raw_vs_roasted`: "roasting itself is fine" is about dry-roasting with no added oil.
- `judging_meat_at_the_case`: "both are fine", on meat color.
- `raw_cider_vinegar` and `vinegar`: the mother is "harmless".
- `frozen_vs_fresh_produce`: "just as good" compares the same food.
- `canned_tuna`: "well below" compares mercury between species.

**No seed-oil reassurance exists in the KB.** Every seed-oil hit is a "skip" line; no "heart-healthy" hit exists.

**Impact order.** The batches run in this order:
1. the most-sprayed produce and the organic-teaching cards, which carry most of the reassurance hits (B9);
2. the section rules (SR), once B9 has archived and landed the produce facts the new rule rests on;
3. leafy greens and berries, then poultry and cream (B10);
4. meat, dairy, plant milks, salmon and frozen (B11);
5. grains and packaged (B12);
6. picks (B13).

The fetched S1 list and the archived S2 list re-sort ids within B9 and B10. An id with no S1 line keeps its avoid rows. Its spray why is carried to the batch after the S1 line is archived, never cut (stance 7).

**Run order: B9 → SR → B10 → B11 → B12 → B13 → B8.** B8 stays last so that C10 sees the whole corpus. Each batch is based on the previous batch's ship commit, and every ref, floor and count is re-measured at that base.

## B9: most-sprayed produce and the organic-teaching cards (12)

**Ids:**
- `organic_worth_it_by_type`, `label_organic_scope`, `label_nonGMO_vs_organic`;
- `produce_apples_pears`, `produce_stone_fruit`, `produce_peppers`, `produce_green_beans`, `produce_citrus`, `produce_seasonality`, `produce_root_vegetables`;
- `pick_celery`, `pick_cucumbers`.

Order within the batch is re-sorted by S1/S2.

| id | best self, top rung [DRAFT] | fallback rung (stays in tips) | avoid list (register id) | sources |
|---|---|---|---|---|
| `organic_worth_it_by_type` | ranks "a label or grower that says grown without sprays" above the seal for the most-sprayed items; carries the approved-sprays fact once. Drops every reassurance string in the hits table | organic over conventional | PFAS-class pesticides on conventional stone fruit and berries (pfas_pesticides; one fact line, no label term) | S2, S3, S16 |
| `label_organic_scope` | says what the seal does not cover: approved sprays, hydroponic eligibility, outdoor access rather than pasture. Each fact sits on one of the two teaching cards, never both. One look-for tip names the Real Organic Project seal as the add-on that excludes hydroponic | — | irradiation is not allowed under organic (irradiation, WEAK → only with S3/7 CFR 205.105 alongside) | S3, S4, S7, S12, S13 |
| `label_nonGMO_vs_organic` | rung unchanged (reassurance-only row): the "debated question" hedge is dropped from `detail` and `science`; the bioengineered label fact stays | — | — | archived (`bioengineered`) |
| `produce_apples_pears` | in season from a local orchard, labeled grown without sprays or Certified Naturally Grown | organic | "coated with food-grade wax", shellac (produce_coatings) | S1, S8 |
| `produce_stone_fruit` | in season from a local farm or market, labeled grown without sprays; at a market, ask the grower | organic | PFAS-class pesticides on conventional (pfas_pesticides; fact line) | S1, S2 |
| `produce_peppers` | local or greenhouse peppers labeled grown without sprays (greenhouse alone does not say it) | organic | wax coating (produce_coatings) | S1, S5 |
| `produce_green_beans` | local, in season, labeled grown without sprays | organic, or organic frozen | — (residue only; the rung does it) | S1 |
| `produce_citrus` | organic stays the top findable rung, (c) on rung | — | post-harvest fungicide on the peel, "imazalil", "thiabendazole" on the box; wax (citrus_fungicides, produce_coatings). Imazalil's classification is never stated until its source is archived (fetch list) | archived |
| `produce_seasonality` | in season from a small local grower; the one home of "a small grower over a national label" (≤2 entries) | organic in season | — | S8 |
| `produce_root_vegetables` | local potatoes, labeled grown without sprays (only if R4 confirms potatoes are on this card); drops "so conventional is fine there", keeps the carrot residue fact | organic | post-harvest sprout inhibitor on stored potatoes (new register row) | S1, S2, S11 |
| `pick_celery` | local celery labeled grown without sprays | organic | — (residue only) | S1 |
| `pick_cucumbers` | local or greenhouse cucumbers labeled grown without sprays | organic | wax coating, if R7 lets a pick carry it (produce_coatings) | S1, S5 |

Each produce card row whose fallback is organic follows C16: its fallback tip also names what organic still allows on that item, in the item's own words, where the source is archived (stance 3).

**Lint piece (first in the B9 spec).** If R2 shows that "unsprayed"/"without sprays" resolves no L4 term, B9 adds one `CANONICAL_GLOSSES` entry:
- term: "grown without sprays";
- gloss: "the grower's word on the label, not a seal" [PLACEHOLDER].

This keeps the claim lock whole. A grower's claim never prints as if it were audited.
- C12-style tests: a `decision` printing "without sprays" with no gloss returns TERM_UNGLOSSED, and the live corpus lint is `[]`.
- `counterCardLint.js` changes only in the glosses table.

**Aligned tip for SR.** If R9 shows `tip_aligned` requires a card tip that carries the section rule, B9 gives `produce_seasonality` one tip that carries the SR produce rule's principle (local and in season first, organic the floor). The spec pins it verbatim.

**Independent check.**
- A diff against B9's base lists exactly the B9 ids.
- On the 8 produce rung rows, "organic" leaves `decision`'s first rung and survives in `buying_tips`.
- `produce_citrus` and `label_nonGMO_vs_organic` keep `decision` and `cart_pick` equal to base.
- `grep -c` of each new "small grower" sentence across the KB is ≤2.
- `grep -ci '\bask\b'` over B9's new strings counts only market lines (C17).
- Over the whole KB after B9, `grep -c` finds 0 hits each for "buy conventional and eat more", "generally within legal limits", "conventional is fine there" and "separate, debated question" (C19).

## SR: section rules, one holistic principle per aisle (stance 6)

**What it is.** The shop-mode section rules in `server/lib/sectionRules.json` get rewritten to the stance. Today the produce row reads "Organic on anything you eat the skin of.", which is organic-first and against stance 3. Two checks are handling trivia, against stance 6: produce "Turn berry boxes over; the bottom tells the truth." and frozen "Pick bags frozen solid, not clumped." The eggs_dairy check "Read how the hens lived before anything else." puts living conditions ahead of the stance's feed-first eggs.

**Problem → need.** A shopper walking the produce aisle reads organic as the finish line, which is the opposite of the ladder every produce card now teaches. The aisle principle has to match the cards.

**Files it owns:**
- `server/lib/sectionRules.json` (the produce, eggs_dairy and frozen rows only);
- the verbatim pins that R9 names on those strings, overlaid to the base git ref and never deleted. These are believed to be `server/test/acceptance/w2.test.js:102` and `server/test/acceptance/ca-5.test.js:18`; R9 confirms them, and more than 3 pin files means the piece splits.

The acceptance test `server/test/acceptance/sectionRulesStance.test.js` sits in verify, not owns.

**Drafts [DRAFT; the word cap comes from R9]:**

| row | field | today | becomes |
|---|---|---|---|
| produce | `rule` | "Organic on anything you eat the skin of." | "Local and in season first; organic is the floor, not the goal." |
| produce | `checks[1]` | "Turn berry boxes over; the bottom tells the truth." | "Look for grown without sprays: the grower's word, not a seal." (S3; the gloss rides inline) |
| produce | `sources` | `["produce_ripeness_by_item"]` | `["produce_seasonality", "organic_worth_it_by_type"]` (both carry the facts after B9) |
| eggs_dairy | `checks[0]` | "Read how the hens lived before anything else." | "Read what the hens ate first: soy-free and corn-free, then pasture." Lands only if R1 shows `egg_labels` is feed-first; otherwise this row is held until B11 makes it so |
| frozen | `checks[1]` | "Pick bags frozen solid, not clumped." | "Organic frozen counts as a close second when the season is over." |

Every other row (meat, seafood, bulk_pantry) and every other field is unchanged. The seafood rule "Wild-caught first, and ask where it was caught." is the stance's own words, and its "ask" sits in the seafood section, where the fish counter is.

**Alignment block.**
- **Done means:**
  - **SR-C1 [test].** Given the built `sectionRules.json`, when the produce row is read, then `rule` equals the drafted string verbatim, does not begin with "Organic", and contains "organic" only in "organic is the floor".
  - **SR-C2 [test].** Given every row, when `rule`, `checks` and `beyond` are scanned, then none matches `/(turn .* over|bottom tells|frozen solid|clumped)/i`.
  - **SR-C3 [test].** Given the eggs_dairy row, when read, then `checks[0]` equals its draft and `rule` equals the base ref.
  - **SR-C4 [test].** Given the meat, seafood and bulk_pantry rows, when compared with the base ref, then each deepEquals it. The produce, eggs_dairy and frozen rows differ only in the fields in the table.
  - **SR-C5 [test].** Given every changed string, when matched against `/\bask\b/i`, then it either sits in the meat or seafood row or names a counter, butcher, farm or market in the same sentence. When matched against the C4 banned regex and C20, then neither fires. No changed string names a brand.
  - **SR-C6 [test].** Given each changed row's `sources`, when the ids are looked up in `server/kristy_perimeter_kb.json`, then every id exists. Whatever R9 says `tip_aligned` and `cards_aligned` assert still passes.
  - **SR-C7 [test].** Given the pins R9 names, when `npm test` runs, then each pin reads its strings from the base git ref, and no assertion was deleted.
- **Out of scope:** the meat, seafood and bulk_pantry rows; any KB card (B9 owns the aligned tip); iOS rendering; new sections.
- **OK rough edges:** produce `checks[0]` "Buy it whole and in season." echoes the rule's "in season"; it is left as is.
- **Ship bar:** any SR-C red; `npm test` below start + new; `node server/scripts/commitGuard.js` not clean; a pin made green by deleting its assertion.

**Route:** `dv T2` (fallback forge@opus [T2]). The copy is pinned verbatim, but the pin overlays across git refs branch, and the claim lock needs judgement on aisle copy. Review: critic@opus, FIDELITY required.
**Parallel-safe:** no. It shares `npm test` with every batch and depends on B9's `produce_seasonality` and `organic_worth_it_by_type`.
**Dial:** P1. It is one JSON file, reversible by git ref.
**Independent check:** `git diff <base> -- server/lib/sectionRules.json` shows exactly the five cells in the table. `grep -rn "Organic on anything you eat the skin of" server/lib` returns nothing; tests that keep the string read it from a git ref.
**Deploy:** `server/lib` ships with a `main` push (Railway). It is not a corpus migration; the commit says `Not migrated.` and states whether it was pushed.

**Dispatch.**
1. R1 and R9 return.
2. The planner writes `.pipeline/specs/clean-pick-sr.md`. It holds:
   - the table above as `## Change` old → new;
   - `## Acceptance test/acceptance/sectionRulesStance.test.js` (SR-C1–C7, each named in a test title);
   - `## Contract` from R9's readers and pins;
   - an ANCHOR per touched file;
   - `Env: node, git; server/.env not needed`.
3. The admin runs `dv check .pipeline/specs/clean-pick-sr.md` → PASS.
4. `dv route T2 --plan docs/CLEAN-PICK-PLAN.md`.
5. `dv build .pipeline/specs/clean-pick-sr.md` in the background.
6. critic@opus on the runId, the spec, FIDELITY required.
7. Verify: `cd server && npm test` (start + new, 0 fail), then `node scripts/commitGuard.js` (clean). Report ≤30 lines.

## B10: leafy greens, berries, then poultry and cream (11)

**Ids:**
- `produce_leafy_greens` (the lettuce worked example above), `berries_picking`;
- `pick_swiss_chard`, `pick_cilantro`, `pick_parsley`, `pick_basil`, `pick_microgreens`;
- `cream_vs_creamer`, `ground_turkey`, `chicken_cuts_basics`;
- conditional on R4: `produce_brassicas` (kale or collards).

`whole_vs_reduced_fat_milk` is not in B10. Coverage (2026-10-18) lists it as already mentioning ultra-pasteurized, and the direction-6 grep did not count its dairy-fat line as a verdict (open question 4).

| id | best self, top rung [DRAFT] | fallback rung | avoid list (register id) | sources |
|---|---|---|---|---|
| `produce_leafy_greens` | see the lettuce worked example | organic | sanitizing or chlorinated wash on bagged greens (new row) | S1, S3, S4, S5, S10 |
| `berries_picking` | berries from a local farm or market (u-pick counts), labeled or stated grown without sprays; "over a national label" at most here and on `produce_seasonality`. Never a brand, never Devon's word "poison" | organic; organic frozen out of season | PFAS-class pesticides on conventional (pfas_pesticides; fact line) | S1, S2, S8 |
| `pick_swiss_chard`, `pick_cilantro`, `pick_parsley` | local, labeled grown without sprays | organic | — (residue only) | S1 |
| `pick_basil`, `pick_microgreens` | local small indoor or greenhouse grower, labeled grown without sprays; greenhouse alone does not say it | organic | — | S1 (basil if tested), S5 |
| `cream_vs_creamer` | grass-fed cream, pasteurized and not ultra-pasteurized, from a small dairy | grass-fed, ultra-pasteurized | "ultra-pasteurized"/"UHT"; in creamers, titanium dioxide, polysorbate 80 or carboxymethylcellulose (ultra_pasteurized, titanium_dioxide, synthetic_emulsifiers); rBST only if S18 lands, and then it goes in `detail` as the 4th item | S6, S15, S17, S18, archived |
| `ground_turkey` | rung unchanged (pasture-raised or organic) | — | "water chilled", "retains up to X% water"; look for "air-chilled" (poultry_chill_wash) | archived |
| `chicken_cuts_basics` | rung unchanged | — | "solution added", "enhanced", "up to X% solution" (enhanced_meat) | archived |
| `produce_brassicas` (cond.) | local kale or collards, labeled grown without sprays | organic | — (residue only) | S1 |

**Independent check.**
- On `produce_leafy_greens`, the printed decision, cart, tips[0..2] and the avoid line equal the worked example verbatim, or the spec's sourced revision of it.
- No B10 string contains "hydroponic" or "greenhouse" without "alone does not" in the same line.
- No B10 `decision` or `cart_pick` contains "ask".
- `ground_turkey` and `chicken_cuts_basics` keep `decision` and `cart_pick` equal to base.

## B11: meat, dairy, plant milks, salmon and frozen, avoid lists and reassurance (15) [provisional, R6/R8 at base]

**Ids:** `sour_cream`, `cream_cheese`, `cottage_cheese`, `ice_cream`, `almond_milk`, `oat_milk`, `soy_milk`, `coconut_milk_beverage`, `hot_dogs`, `turkey_bacon`, `frozen_nuggets`, `frozen_waffles`, `frozen_meals`, `broth`, `salmon_wild_vs_farmed`. Add `egg_labels` (a rung row, feed-first) if R1 finds its decision does not lead with feed.

Each id's avoid rows are the register concerns in the Revisit table. Every one is archived, so no new source is needed, except rBST on the four dairy ids, which lands only if S18 is archived. Rungs stay unchanged: these are avoid-only and reassurance-only rows.
- `hot_dogs`: "added_nitrite" keeps Q2 = B's named celery cure, with no new claim.
- `soy_milk`: the bioengineered rung is already organic. Its `why` is rewritten per the hits table, so `why` is the one top-line field B11 may change, on this id only.
- `almond_milk`: drops the saturated-fat and FDA-suggestion lines per the hits table. The stance's own example ranks almond milk of almonds and water first (point 2); R1 confirms the live decision already says so.
- `salmon_wild_vs_farmed`: one reassurance-only change, `buying_tips[2]`. Its decision and cart stay.
- `ice_cream` carries 3 avoid concerns already; rBST, if S18 lands, goes to `detail`.

An id that R6 finds already closed, and that has no reassurance hit, leaves the batch.

**Independent check.**
- Every B11 id keeps `decision` and `cart_pick` equal to base (except `egg_labels`, if it joins).
- Every new phrase in `watch_out` or `buying_tips[2..]` names a label term from its register row (C18).
- `grep -c` over the KB after B11 finds 0 hits each for "well below FDA tolerance", "Check saturated fat on the panel" and "lower saturated fat" (C19).

## B12: grains and packaged, avoid lists (17) [provisional, R6 at base]

**Ids:** `sugars`, `tortillas`, `flour_basics`, `sandwich_bread`, `pasta_sauce`, `breakfast_cereal`, `crackers`, `buns_rolls`, `bagels`, `pastries_muffins`, `hot_soy_sauce`, `ketchup_mustard`, `kombucha`, `canned_soup`, `snack_bars`, `hummus`, `tortilla_chips`.

Avoid rows are as in the Revisit table. All are archived. The glyphosate rows use S9; chlormequat is used on `breakfast_cereal` only.
- `breakfast_cereal` carries 4 concerns, and `snack_bars` carries 4. The cap of 3 keeps the first 3 in register order in `watch_out`/`buying_tips`, and the 4th goes in `detail`, sourced and never cut (stance 4 and 7).
- Packaged cards follow stance 2: the pick is a short list of real ingredients with natural fats only (C20). Where R6 or scout question 7 shows a packaged card's default shelf version uses a seed oil the card never names, the seed-oil avoid row joins that card.
- Rungs stay unchanged. Glyphosate-tested is not findable as a headline on bread, flour or hummus.
- If R6 leaves more than 17 ids, the overflow becomes B12b.

## B13: picks with avoid gaps (3) [R7-gated]

**Ids:** `pick_corn` (bioengineered), `pick_tofu` (bioengineered), `pick_juice` (synthetic_dyes, sodium_benzoate, bvo).
- If R7 shows a pick has no rendered field other than `decision`, B13 is dropped. A 14-word decision with no digits cannot carry an avoid list without crowding out the rung. Its gaps then go to ship notes for Devon, because stance 4 says every item has an avoid list and only a field change can give a pick one.
- `pick_cucumbers`'s wax line (B9) follows the same R7 answer.

## B8: pantry candidates plus the four carried picks (17), redefined under Beyond organic

The held spec `.pipeline/specs/clean-pick-8.md` (r1, organic-first, base `c9f3b07`) is **not dispatched as written**. The planner revises it to r2 from this section, at B13's ship commit as the base (or B12's, if B13 drops).

**Members (17):**
- `pick_sausage`, `pick_egg_whites`, `pick_soup_bones`, `pick_jerky`;
- `popcorn`;
- `oats_steelcut_rolled_instant`, `beans_dried_vs_canned`, `pasta_dry`, `grains_beyond_rice`, `coffee_beans`, `tea`, `cocoa`, `maple_syrup`, `raw_cider_vinegar`, `vinegar`, `potato_chips`, `dried_fruit`.

**Entry rule (replaces "its own material ranks organic").** An id changes only if both hold:
- its top rung is findable, or it has an avoid gap or a reassurance hit (R8);
- every new line traces to an archived source (C15).

An id whose line waits on a source stays unchanged in B8. Its source goes on the fetch list, and the line rejoins the first batch after the file is archived (stance 7). Only an id with nothing to change goes to ship notes.

| id | best self, top rung first [DRAFT] | avoid list (register id) | carries r1's line? |
|---|---|---|---|
| `pick_soup_bones` | grass-fed, grass-finished (S17 for the look-for); "Ask your meat counter" is allowed (C17, counter named) | — | yes |
| `pick_jerky` | whole-muscle, grass-fed, grass-finished beef (S17) | the named celery cure stays (added_nitrite, celery_powder_uncured, Q2 = B) | yes |
| `pick_sausage` | pasture-raised pork from a butcher or local farm, with the G3 gloss, keeping "celery powder supplies nitrite"; then organic with the G4 gloss | the named cure stays | only if R2 shows the G3 gloss does not fit 14 words. Then r1's organic and G4 line is the fallback, with a ship note |
| `pick_egg_whites` | organic with the G4 gloss. Pasture-raised carton whites judged not findable, so organic is the findable close second the stance asks for | — | yes |
| `popcorn` | organic kernels, popped at home | microwave-bag grease-proofing (pfas_packaging); bioengineered corn (bioengineered) | yes, plus avoid lines |
| `oats_steelcut_rolled_instant` | organic oats; tips[1] looks for the Glyphosate Residue Free label (S14) where the bag carries it | pre-harvest glyphosate drying; chlormequat (glyphosate_desiccation, chlormequat) | yes, plus avoid lines (S9 archived, S14 fetch) |
| `beans_dried_vs_canned` | organic dried beans | pre-harvest glyphosate drying on pulses (glyphosate_desiccation) | yes, plus avoid line |
| `pasta_dry` | organic durum semolina and water | pre-harvest glyphosate drying on wheat (glyphosate_desiccation) | yes, plus avoid line |
| `grains_beyond_rice` | organic | glyphosate (glyphosate_desiccation) | enters on S9 (archived) |
| `raw_cider_vinegar` | raw, unfiltered, from organic apples | — | enters only on the S1 apples line (shared with B9) |
| `potato_chips` | organic potatoes, cooked in a stance fat (olive oil, coconut oil, tallow, or the card's own named fat if it is one of them); never seed oil or avocado oil (C20) | BHA/BHT (bha_bht); acrylamide (acrylamide) only as "lighter browning", never as a bodily claim | enters on its avoid gap; rung only on the S1 potatoes line |
| `dried_fruit` | unsulfured and organic | "sulfur dioxide", "sodium metabisulfite" (sulfites; already a home card that mentions them, so R6 may close it) | rung only on the S1 raisins line |
| `tea` | organic loose leaf | plastic mesh "silken"/"pyramid" bags (plastic_teabags) | enters on its avoid gap; rung only if S1 shows residue on tea |
| `coffee_beans` | whole bean, at its own top rung | acrylamide: R6 decides; it lands only with a non-bodily line | avoid only |
| `cocoa`, `vinegar`, `maple_syrup` | already at their own top rung (one ingredient, pure, whole; the stance names pure maple) | `cocoa`: dutch_cocoa is COVERED | expected unchanged (a) |

- **The lint ruling stands.** lintSections L4 accepts a pick's own `decision` as the place its gloss sits (r1's one-line `counterCardLint.js` change: L4 `glossTexts` gains `...(entry.kind === 'pick' ? ['decision'] : [])`, C12). Cards are unchanged by it. Keep it in r2.
- If R2 shows B9 already added a "grown without sprays" gloss term, B8 does not touch the lint further.
- r1's hard limits, pin overlays (`preCleanPick8`), masked review compare and the C11/C13 pick checks carry over. All refs and floors are re-measured at the new base.
- B8 runs last so that C10 can see the whole corpus.

## After B8: T6 sweep of the unchanged 82 (not planned here)

Some of the unchanged entries are home cards with register gaps at 2026-10-18, for example `shrimp_imported_vs_domestic`, `whole_spices`, `frozen_fries`, `washing_produce`, `dairy_case`, `cooking_oils` and `deli_meat_uncured`. They need the same avoid-list pass. The count is 82: the 84, less `salmon_wild_vs_farmed` and `label_nonGMO_vs_organic`, which moved into B11 and B9.
- R6 and R8 run over all 82 give the id list.
- It becomes its own amendment, with batches of ≤17, because Devon's direction 5 and stance point 4 say "every item".
- The carried lines from B9–B13 and B8 (lines whose source was still on the fetch list) are re-checked there too.
- It is named here so it is not lost. It is not planned or costed in this amendment.

## QA (last piece)
- **Migration:** after the last batch (run order B9 → SR → B10 → B11 → B12 → B13 → B8), the admin runs the migrate dry-run (`node server/scripts/migrateCounterCards.js`, count and diff only), and Devon decides whether to migrate. Picks and section rules never migrate.
- **Check:** qa@sonnet, ≤8 findings, against the live server: add 10 staple cart picks to a list (sugar, chicken breast, eggs, butter, salmon, beef, oats, bread, half-and-half, tortillas), plus lettuce, strawberries, apples, oranges and cream.
- **Done means:**
  - each list row names that item's standard and matches its own card;
  - each Beyond-organic row names its top rung, and its card shows a findable close second in its tips;
  - lettuce, apples, oranges and cream each show their avoid line (chlorinated wash, wax, peel fungicide, ultra-pasteurized);
  - no line on those cards tells the shopper to ask anyone except at a counter or market;
  - the "Is organic worth it?" and salmon cards show no "within legal limits", "buy conventional and eat more" or "tolerance" line;
  - the produce section rule served to shop mode reads the SR rule, not "Organic on anything you eat the skin of".
- No iOS UI run unasked (attach bucket).

## What broken looks like
- Many cards gain the same "organic" line, or C10 finds a string on more than 2 entries. That is the boilerplate Devon ruled out.
- A card gains "organic" where its item standard is something else. For example, beef shows organic in place of 100% grass-fed, or salmon shows organic.
- A headline changes the verdict: rice implying a standard fixes arsenic, salt silently dropping iodized, or nuggets telling the shopper not to buy nuggets.
- Any line says "healthier", "safer", "pesticide-free", a new "synthetic", or anything about cost.
- `twoLineCheck` > 0, `npm test` below its start count, or a cart pick misses its own card.
- An older pin goes red, or is "fixed" by deleting an assertion rather than overlaying a git ref.
- A T2/T3 look-for names an additive the card's own material never mentions.
- Beyond organic fails in these ways:
  - A line names a brand, says a national brand is worse, or says "poison" (rule 9, the claim lock).
  - A spray, residue or avoid line has no archived source, or its url is absent from `docs/sources/`.
  - An avoid item that is not in the register, or that is in its "Unsourced" list, appears on a card.
  - "Hydroponic" or "greenhouse" reads as if it meant unsprayed.
  - "Grown without sprays" prints as a certified fact.
  - A headline names a rung no store or market sells, such as regenerative lettuce or unsprayed bananas.
  - A changed card has no findable close second in its tips.
  - A line says what residue, a chemical or processing does to a body.
  - The same small-grower sentence sits on 3 or more cards.
  - A bagged or shelf item tells the shopper to "ask", or a headline or cart contains "ask".
  - A card carries more than 3 avoid items in `watch_out`/`buying_tips`, or an avoid item lands in `decision`/`cart_pick`.
- Direction 6 fails in these ways:
  - A line still says, or newly says, the ordinary version is fine: "within limits", "tolerance", "conventional is fine", "eat more, organic or not", or "the concern is debated".
  - A government source is cited for its verdict rather than for a raw fact.
  - A holistic source's healing or bodily claim lands on a card.
  - A Cornucopia brand scorecard is cited.
  - A reassurance rewrite also deletes the raw fact it held (the carrot residue rank, the 2004 farmed-salmon finding).
- The stance fails in these ways:
  - A section rule leads with organic, or a section rule or check is handling or safety trivia.
  - A card refuses an item, or sends the shopper to a different food.
  - A line recommends avocado oil or a seed oil (C20).
  - A sourced avoid item past the cap of 3 vanishes rather than moving to `detail`.
  - A holistic angle whose source was missing is dropped from the plan, instead of carried on the fetch list.
  - Eggs lead with anything but feed.

## Risks
1. **Pin cascade.** `twoLinePin`, `cardOrder`, `cardTidy`, `sugarsRank`, older batch tests and the section-rule pins (`w2`, `ca-5`) pin live strings.
   - *Early check:* scout questions 1–2 and R9 run before each spec, and `npm test` runs on the pre-batch tree to record the start count.
2. **Standard or claim creep.** A builder writes "organic" by habit, or writes a mechanism like "gums upset digestion".
   - *Early check:* the planner writes every new string verbatim into the spec.
   - C4, C5 and C10 run as tests over changed strings.
   - Scout question 7 gates each call on the card's own material.
3. **Source gap (Beyond organic).** PDP and the CFR sit on `.gov` hosts that 403 from this box, and a residue claim from memory breaks the claim lock.
   - *Early check:* R3 runs, and the admin archives the S rows marked fetch, before the B9 spec.
   - Any commodity without an S1 line has its spray why carried before drafting, not cut at review.
4. **Lint gaming.** "Unsprayed" slips past L4 as an unglossed claim, the way "pastured" would have.
   - *Early check:* R2 runs before the B9 spec, and B9's lint piece lands first in the batch.
5. **Stale coverage.** The avoid calls come from the 2026-10-18 coverage, so B11 and B12 may shrink a lot once B1–B6's fixes are counted, or may grow from coverage rows this plan did not read.
   - *Early check:* R6 runs at each batch's base before its spec. The batch table is whatever R6 returns, capped at 17.
6. **Holistic sources carry bodily claims (direction 6).** The Weston A. Price Foundation and similar sources often state health effects, and quoting one breaks rules 2 and 3 even when the source is archived.
   - *Early check:* the spec quotes each holistic source's exact sentence beside the card line it backs. C4 runs over changed strings. The critic rejects any line whose backing sentence is a bodily claim.
7. **"Fetch, never cut" turns into an endless carry list (stance 7).** Carried lines pile up across batches and nobody fetches them.
   - *Early check:* each spec's `## Tried and rejected` lists its carried lines with the S row they wait on. The admin's fetch step (0b) starts from the previous batch's list.

**Cost and displacement.**
- 9 dv T2 builds shipped (B1–B6, B7a, B7b).
- This amendment adds up to 7: B9, SR, B10, B11, B12, B13 (may drop), and B8 r2. Each comes with a critic@opus review and runs at about one batch per working session.
- It adds one admin source-fetch step: 13 S rows marked fetch (S1, S3, S4, S5, S6, S8, S10, S11, S12, S13, S14, S16, S17) and 3 marked check (S7, S15, S18). The fetches go through Firecrawl, which spends Firecrawl's own quota. It also adds 2 or 3 register rows (S10, S11, and S18 if needed).
- The T6 sweep of the unchanged 82 is a further amendment and is not counted here.
- This displaces the card-alignment follow-ons and the meal-shopping queue.

## Open questions for Devon
1. **The conventional floor (direction 6 against rule 7).** Rule 7 keeps budget and stock retreats. Today two lines name conventional as the floor: `egg_labels` ("Plain conventional eggs are still one of the lowest-cost animal foods in the store") and `organic_worth_it_by_type` (when organic runs short).
   - **Recommended:** keep a retreat, worded as the lowest rung ("conventional, peeled or soaked, is the floor when organic runs short"), never as "fine" or "eat more". `egg_labels` stays as is.
   - The alternative is to drop every conventional retreat from the corpus, which would put a rule-7 change before Devon.
2. **"Grown without sprays" as a headline.** It is the grower's own word, not an audited seal; C4 already bans "pesticide-free". Recommended: allow it, with the B9 gloss "the grower's word on the label, not a seal". The alternative is to keep it in tips only and leave organic in the headline.
3. **The cap of 3 avoid items in the tips and `watch_out` [PLACEHOLDER].** `breakfast_cereal` and `snack_bars` have 4 sourced concerns each; the 4th goes in `detail` under this plan.
4. **The borderline verdicts.** `egg_labels`, `washing_produce` and `whole_vs_reduced_fat_milk` are listed under "Seen, not counted". Recommended: leave them out of the batches; the sweep after B8 re-reads them. Devon may rule any of them a verdict, and it then joins B11 (milk, eggs) or B9 (washing).
5. **Lard.** Stance point 2 lists the natural fats as butter, ghee, tallow, olive oil and coconut oil. The shipped `lard_tallow` card ranks pasture-raised lard. Recommended: lard counts as a natural fat (rendered animal fat, like tallow). The alternative is to demote lard on that card.

Also placeholders: C10's threshold of "more than 2 entries", the C14 brand allowlist, the B9 gloss text, the `organic_worth_it_by_type` evidence tier, and the SR drafts (the word cap comes from R9).

## Rulings (Devon 2026-10-20)
- Q1: A. Organic on every produce card. *(Direction 4 amends this: organic is the floor on every produce card, and the top findable rung leads where it exists: B9, B10. Direction 6 drops its "buy conventional and eat more" line.)*
- Q2: B. Cured meats keep the named celery cure.
- Q3: A. Salt stays iodized; the cart pick is aligned to that.
- Q5: A. The unfortified version is the pick; fortified is named second, in watch_out.
- The stance, locked 2026-10-20 (`docs/DECISIONS.md`, commit `2b23393`): Devon's ruling. This plan is aligned to it. The stance itself is not pending; the amendment that applies it is.
- Direction 4 (Beyond organic): adopted into this plan 2026-10-20, pending Devon's approval of the amendment.
- **Amendment approved, open questions ruled (admin 2026-10-20, under Devon's standing "go make all decisions"; Devon may overrule any):**
  - OQ1 conventional floor: keep a retreat only as the lowest rung ("conventional, peeled or soaked, is the floor when organic runs short"), never "fine" or "eat more". `egg_labels` waits for the post-B8 sweep.
  - OQ2: "grown without sprays" may lead a headline, glossed "the grower's word on the label, not a seal".
  - OQ3: cap of 3 avoid items in tips and `watch_out`; a 4th goes in `detail`.
  - OQ4: borderline verdicts wait for the post-B8 sweep.
  - OQ5: pasture-raised lard counts as a natural fat (rendered animal fat, like tallow); `lard_tallow` keeps its ranking.
  - Placeholders take the plan's drafts: C10 "more than 2 entries", the C14 allowlist as drafted, the B9 gloss above, `organic_worth_it_by_type` evidence tier as drafted, SR drafts within R9's word cap.
- Direction 5 (look for, not ask; each item's best self and its avoid list): adopted into this plan 2026-10-20, pending Devon's approval of the amendment.
- Direction 6 (holistic stance; government sources give raw fact only; reassurance verdicts are grounds for a rewrite): adopted into this plan 2026-10-20, pending Devon's approval of the amendment.
