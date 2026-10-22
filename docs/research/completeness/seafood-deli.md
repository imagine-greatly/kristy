# Completeness research: seafood-deli (22 cards)
2026-10-22. Findings only; no KB, code, test or commit changes.

## 1. What failed or was not fetched (read first)
- TOOL DEVIATION: the first batch of sources (before the context break) was fetched with curl plus a python HTML-to-text strip, not mcp__scrapling__*. The last two articles (WAPF oysters, Downeast dry scallops) were fetched with mcp__scrapling__bulk_get. Archive bodies are text extractions, verbatim article text, with site nav/footer/comments dropped on the two scrapling files.
- First attempts on 3 pages failed (Downeast "local_rate_limited" x2 URLs, WAPF oysters Cloudflare block). Retried once with scrapling: oysters and dry-scallops now fetched and archived. NOT fetched, stub deleted: https://downeastdayboat.com/ "Scallops 101" page (rate-limited, never retried successfully).
- DELETED as non-holistic (NGO/advocacy): foodprint-shrimp.md (foodprint.org), conservefish-small-boat.md (conservefish.org).
- Not researched (budget): fish sticks, anchovies, canned tuna/canned-fish brand choice, crab, lobster, white fish, turkey bacon, hot dogs, ham specifics. No holistic source archived for these; marked GAP-UNSOURCED below, not asserted.
- Not verified: I did not re-fetch live KB sources; findings about card text come from reading server/kristy_perimeter_kb.json.

## 2. Archive (archive/completeness/seafood-deli/, URL on line 1 of each)
- kresser-fish-safe.md, kresser-mercury-selenium.md (Kresser: fish benefit, mercury vs selenium)
- kresser-nitrite-myth.md (Kresser: nitrite/bacon)
- wapf-save-your-bacon.md (WAPF: celery-salt "uncured", nitrites)
- wapf-something-fishy.md, wapf-sardines.md, wapf-oysters.md (WAPF)
- wellnessmama-fish-farming.md, phoenixhelix-seafood.md (farmed vs wild, sustainable seafood skepticism)
- keylargo-shrimp.md (Key Largo Fisheries: wild vs farmed shrimp)
- kweejack-smoked-salmon.md (Kwee-Jack: wild Alaskan smoked salmon)
- harborfish-day-boat-scallops.md (Harbor Fish: day-boat scallops)
- downeast-dry-scallops.md (Togue Brawn, Downeast Dayboat: what "dry" means, TSP, trip-boat water)

## 3. Mainstream-reassurance grep
Phrases from the brief (safe levels, buy conventional, considered safe, FDA says, low-residue, just as good, broadly comparable) plus safe to eat, nothing to worry, no need to worry, fine to, perfectly safe, negligible, reassur, searched in short_answer, detail, why, decision, watch_out, kristy_take: ZERO hits in all 22 cards.
Non-holistic SOURCING found instead (government/NGO/certifier framing, not reassurance phrasing):
- canned_tuna, why: "The FDA fish advice separates canned light tuna from albacore by mercury category"
- canned_tuna, buying_tips: "FDA puts canned light tuna in Best Choices for mercury, and albacore in Good Choices."
- mercury_by_fish, decision: built on FDA/EPA tiers and EWG
- seafood_certifications: whole card is MSC/ASC/BAP/Seafood Watch verdict framing
- farmed_fish_by_species: cites Seafood Watch "Super Green"
- shrimp_imported_vs_domestic: cites Consumer Reports 2015, Oceana 2014
- salmon_wild_vs_farmed: cites a 2004 Science study and Seafood Watch
- seafood_counter: cites FDA DNA test (85% figure)
- pick_fish_sticks sources: Cornell LII 21 CFR 102.45, Seafood Watch, SeafoodSource
- pick_anchovies sources: Saveur, NOAA

## 4. Per card
Seafood (16)
- salmon_wild_vs_farmed: COMPLETE on decision (wild first). GAP on sourcing: replace 2004 Science/Seafood Watch with holistic; support in wapf-something-fishy.md, wellnessmama-fish-farming.md, kweejack-smoked-salmon.md.
- shrimp_imported_vs_domestic: COMPLETE on decision. GAP on sourcing: Consumer Reports/Oceana; holistic support keylargo-shrimp.md (wild Gulf/Florida vs farmed), phoenixhelix-seafood.md.
- mercury_by_fish: GAP. Tiering rests on FDA/EPA/EWG and implies mercury fear. Holistic view (selenium protects; eat fish, favor small/wild) in kresser-mercury-selenium.md, kresser-fish-safe.md. Pick: reframe to selenium-rich small fish first; keep the tiers only as raw fact.
- canned_fish_choosing: COMPLETE-ish; sardines support in wapf-sardines.md. Add wild, bones-in/skin-on, olive oil or water, BPA-free note only if a holistic source is archived (none is; not asserted).
- farmed_fish_by_species: GAP sourcing (Seafood Watch Super Green). Holistic: wellnessmama-fish-farming.md, wapf-something-fishy.md (farmed feed, color additives).
- seafood_certifications: GAP. Certifier verdict framing is excluded by brief. Phoenixhelix-seafood.md ("does healthy sustainable seafood exist") supports a skeptical rewrite: certifications are not health claims; ask the fisher/counter source and catch method.
- canned_tuna: GAP. FDA tier framing (quotes above). Kresser-mercury-selenium.md supports tuna with selenium surplus; no holistic source archived on skipjack vs albacore, so no pick asserted.
- white_fish: GAP-UNSOURCED. Card not checked against any holistic source; none archived.
- crab: GAP-UNSOURCED. None archived.
- lobster: GAP-UNSOURCED. None archived.
- scallops: GAP, small. Decision "Dry or dry-packed scallops, with no phosphate or water listed" is right but incomplete: downeast-dry-scallops.md says "dry" is unregulated (FDA dropped the water-added labeling in 2004), trip-boat scallops absorb ice water, additives are hard to detect at a counter with no label. Executable add: buy day-boat or fishmonger-trusted scallops, ask landing boat and whether they touch fresh water; frozen from a named boat is fine; wet scallops weigh more raw, lose ~32% cooked vs ~14% for dry (single-brand test, cite as such). Also harborfish-day-boat-scallops.md.
- clams_mussels_oysters: GAP. Oyster zinc/selenium/DHA nutrient case and eat-raw-fresh-whole stance in wapf-oysters.md; no clam/mussel source archived. Add oysters as the zinc pick.
- smoked_salmon: COMPLETE on wild-caught, no added color, wood-smoked. Support kweejack-smoked-salmon.md. Listeria note for the vulnerable stays.
- seafood_counter: GAP sourcing. FDA 85% DNA test is mainstream framing; the executable point (ask species, wild or farmed, country, when landed) is supported by phoenixhelix-seafood.md and keylargo-shrimp.md.
- pick_fish_sticks: GAP. Only a decision and an avoid line, no why or tips; sources are CFR/Seafood Watch/SeafoodSource. No holistic source archived; do not assert.
- pick_anchovies: GAP. Decision only, sources Saveur/NOAA. wapf-sardines.md supports small oily fish as a nutrient pick; anchovy-specific advice not sourced.

Deli (6)
- deli_meat_uncured: COMPLETE. "Uncured" celery-powder qualifier and phosphate/binder avoidance are backed by wapf-save-your-bacon.md and kresser-nitrite-myth.md.
- bacon: COMPLETE (same sources).
- hot_dogs: COMPLETE on nitrite/celery-powder logic (same sources); no holistic source on casing/animal source archived.
- ham: COMPLETE on same logic; GAP-UNSOURCED on added water/phosphate specifics.
- turkey_bacon: COMPLETE on same logic.
- cured_pork: COMPLETE on same logic.
Note for deli: the archived Kresser file argues nitrite itself is not the villain while WAPF argues celery salt "uncured" is mislabeling. The cards' stance (avoid binders, read the real curing agent) is consistent with both; do not add a "nitrite is dangerous" claim.

## 5. Tally
COMPLETE: 8 (smoked_salmon + 6 deli, canned_fish_choosing provisional). GAP with an archived holistic source ready: 8. GAP-UNSOURCED (no holistic source archived): 6 (white_fish, crab, lobster, pick_fish_sticks, pick_anchovies, canned_tuna brand pick).
