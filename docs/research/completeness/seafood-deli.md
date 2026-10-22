# Completeness research: seafood-deli (22 cards)
2026-10-22. Findings only; no KB, code, test or commit changes.

## 1. What failed or was not fetched (read first)
- TOOL DEVIATION: the first batch of sources (before the context break) was fetched with curl plus a python HTML-to-text strip, not mcp__scrapling__*. The last two articles (WAPF oysters, Downeast dry scallops) were fetched with mcp__scrapling__bulk_get. Archive bodies are text extractions, verbatim article text, with site nav/footer/comments dropped on the two scrapling files.
- First attempts on 3 pages failed (Downeast "local_rate_limited" x2 URLs, WAPF oysters Cloudflare block). Retried once with scrapling: oysters and dry-scallops now fetched and archived. Scallops 101 now fetched in pass 2 (correct path /pages/scallops-101; the /scallops-101/ path 404s).
- DELETED as non-holistic (NGO/advocacy): foodprint-shrimp.md (foodprint.org), conservefish-small-boat.md (conservefish.org).
- Not researched (budget): turkey bacon, hot dogs, ham specifics (no holistic source archived; not asserted).
- PASS 2 (2026-10-22, all scrapling bulk_get/make_request; WebSearch only to find URLs): NOT fetched: Vital Choice /v/shellfish/crab and cod product page (nav only), Mercola tuna (empty page). Vital Choice crab/white-fish product pages are retail, not cited. NO holistic source found for fish sticks: pick_fish_sticks stays GAP-UNSOURCED. Three archive files are text-extractions retyped from fetched markdown (downeast-scallops-101, patagonia-provisions-anchovies, leadsafemama-canned-fish-chart): curly quotes and dashes normalised, nav dropped, wording otherwise verbatim.
- PASS 2 source-quality flags: patagonia-provisions-anchovies and wildplanet-mercury-in-fish are BRAND pages and both lean on AHA/FDA/EPA framing (excluded as framing; used only for product facts). leadsafemama chart is a lab-test ordering, borderline, not a holistic stance. vitalchoice-types-of-white-fish quotes an Academy of Nutrition spokesperson: mainstream, weak.
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
Pass 2 additions:
- downeast-scallops-101.md (fisher-owner: trip boat vs dayboat, "diver" mislabeling, "dry" unpoliced)
- downeast-maine-lobster-fishery.md (fisher-family blog on Maine lobster industry; policy, little health content)
- wapf-crab-high-vitamin.md (WAPF, Ramiel Nagel: crab and lobster as vitamin-rich "butter of the sea")
- wapf-sardine-anchovy-pate.md (WAPF: sardines/anchovies with skin and bones, BPA-free can)
- wellnessmama-hartnell-radiation-mercury-seafood.md (Randy Hartnell, Vital Choice fisher-founder: small vs 800-lb tuna, canned salmon/tuna)
- wildplanet-mercury-in-fish.md (brand: pole-and-troll young tuna; FDA framing)
- patagonia-provisions-anchovies.md (brand: anchovy types, sodium); leadsafemama-canned-fish-chart.md (lab ordering)
- vitalchoice-types-of-white-fish.md, vitalchoice-types-of-crab.md, vitalchoice-scallop-facts.md, wildforsalmon-dungeness-crab.md (seller pages, culinary/retail, weak)

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
- canned_tuna: GAP. FDA tier framing (quotes above). Holistic: wellnessmama-hartnell-radiation-mercury-seafood.md (Hartnell, fisher: "10-pound tuna that live 2 or 3 years" vs "800-pound tuna that live decades"; the broad "avoid all tuna" brush is wrong; only big billfish and marine mammals are the exception), kresser-mercury-selenium.md. Executable add: prefer small/young tuna (skipjack, pole-and-troll or troll caught, per wildplanet-mercury-in-fish.md, brand page, catch method only). Brand pick NOT supported by a holistic source: the lab chart (leadsafemama-canned-fish-chart.md) ranks Safe Catch Elite skipjack and Ahi below Wild Planet Albacore on mercury, one lab, borderline source. BPA-free can: wapf-sardine-anchovy-pate.md recommends a "BPA-free can" for sardines; no holistic lining verdict, so keep the card claim "maker's own claim".
- white_fish: GAP-UNSOURCED (pass 2: still no holistic source). Only vitalchoice-types-of-white-fish.md: seller page quoting an Academy of Nutrition spokesperson; its facts (lower omega-3 than salmon, cod/halibut standouts, "white fish" is a marketing umbrella) are mainstream-sourced, do not cite. Card decision (named species, wild) is consistent with wapf-something-fishy.md and wellnessmama-fish-farming.md (wild over farmed).
- crab: GAP, source ready. wapf-crab-high-vitamin.md: crab is among the richest vitamin sources, good selenium, zinc, copper, B12; the yellow hepatopancreas "butter" is the fat-soluble-vitamin part; buy whole or "crack and clean" from a fishmonger, not dead raw crab; Dungeness named. Caveat in the comments: a commenter warns viscera color (green = do not eat) and the article hedges on algal toxins. Executable add: ask for whole/cracked-and-cleaned, keep the yellow butter, wild-caught named origin. Imitation crab (pollock) line stays; no holistic source on surimi additives.
- lobster: GAP, thin source. wapf-crab-high-vitamin.md "Lobster And Crawfish" section: same fat-soluble "butter" in the fatty organs (tomalley), citing Weston Price on Maori children; downeast-maine-lobster-fishery.md is fisher-family advocacy on the industry (traps, regulation), nothing on buying. Executable add: eat the tomalley when the water is clean; live or hard-frozen stays.
- scallops: GAP, small, now sourced to Scallops 101. Decision "Dry or dry-packed scallops, with no phosphate or water listed" is right but incomplete: downeast-scallops-101.md and downeast-dry-scallops.md say "dry" is unpoliced and "essentially meaningless" on its own, trip boats (95% of US sea scallops) store catch in cloth bags in melting ice that "soaks into the scallops", and "diver" scallops are mostly mislabeled drag-caught (true dive <0.01%). Executable add: buy dayboat (under 24 hours at sea, buckets, ice never touches the scallop) or from a fishmonger who names the boat/landing port; ask whether treated with sodium tripolyphosphate; wet scallops weigh more raw, lose ~32% cooked vs ~14% for dry (single-brand test, cite as such). Also harborfish-day-boat-scallops.md, vitalchoice-scallop-facts.md (seller, weak).
- clams_mussels_oysters: GAP. Oyster zinc/selenium/DHA nutrient case and eat-raw-fresh-whole stance in wapf-oysters.md; no clam/mussel source archived. Add oysters as the zinc pick.
- smoked_salmon: COMPLETE on wild-caught, no added color, wood-smoked. Support kweejack-smoked-salmon.md. Listeria note for the vulnerable stays.
- seafood_counter: GAP sourcing. FDA 85% DNA test is mainstream framing; the executable point (ask species, wild or farmed, country, when landed) is supported by phoenixhelix-seafood.md and keylargo-shrimp.md.
- pick_fish_sticks: GAP-UNSOURCED after pass 2. Searches turned up only brand/retail and mainstream pages (all excluded); nothing archived. Do not assert; leave decision-only or hold the card.
- pick_anchovies: GAP, source ready. wapf-sardine-anchovy-pate.md: sardines/anchovies in salt water or olive oil, skin and bones kept, "BPA-free can", bones are a calcium source. patagonia-provisions-anchovies.md (brand): anchovy types (typical salt-cured fillets, salt-packed whole with bones that need rinsing, white anchovies milder and less sodium); small serving because of salt. Executable add: olive oil or salt-packed, bones in, small portion for the sodium, BPA-free can. No holistic source on a brand pick.

Deli (6)
- deli_meat_uncured: COMPLETE. "Uncured" celery-powder qualifier and phosphate/binder avoidance are backed by wapf-save-your-bacon.md and kresser-nitrite-myth.md.
- bacon: COMPLETE (same sources).
- hot_dogs: COMPLETE on nitrite/celery-powder logic (same sources); no holistic source on casing/animal source archived.
- ham: COMPLETE on same logic; GAP-UNSOURCED on added water/phosphate specifics.
- turkey_bacon: COMPLETE on same logic.
- cured_pork: COMPLETE on same logic.
Note for deli: the archived Kresser file argues nitrite itself is not the villain while WAPF argues celery salt "uncured" is mislabeling. The cards' stance (avoid binders, read the real curing agent) is consistent with both; do not add a "nitrite is dangerous" claim.

## 5. Tally
COMPLETE: 8 (smoked_salmon + 6 deli, canned_fish_choosing provisional). GAP with an archived holistic source ready: 12 (adds crab, lobster-thin, pick_anchovies, scallops sourced, canned_tuna method pick). GAP-UNSOURCED (no holistic source archived): 2 (white_fish, pick_fish_sticks). canned_tuna BRAND pick stays unsupported by a holistic source (lab chart is borderline).
