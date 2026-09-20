# Seafood holistic sources — bar A pass (2026-09-20)

Retrieved via Firecrawl (`firecrawl scrape` / `firecrawl search`) only — WebFetch 403s on .gov and
was not used. Sourcing stance: holistic, not a government channel — extension services (Sea Grant),
independent fishers/sellers, and watchdogs (Seafood Watch/Monterey Bay Aquarium, MSC, EWG), over
regulatory pages. Regulation is not cited in this batch as the argument's spine anywhere. Quotes are
verbatim blockquotes from the fetched page; `fills:` names the KB card (`server/kristy_perimeter_kb.json`,
field `id`) the source supports, and `Judgment call:` records where a source's own wording was excluded
under the claim lock and the symmetric no-treatment rule (no food/practice treats, cures, prevents, or
causes disease), the no-price rule, or the no-named-brand rule (extended here to exclude positive
brand/retailer lists too, since Kristy teaches label literacy, not brand shopping). This file does not
edit the KB or `docs/research/depth-gap.md`.

Dropped sources: `.firecrawl/edf-seafood-tool.md` (EDF, "New Consumer Tool for Seafood Selection") —
scraped fully; it is a 2008 press release announcing a mobile tool, with no per-species mercury/omega-3
data of its own to quote, so it is not cited below. `.firecrawl/mba-sardine-guide.md` (Monterey Bay
Aquarium sardine/anchovy/herring guide) was scraped but not needed once Seafood Watch's own canned-tuna
page and the NAA/Seafood Watch "Super Green" piece covered `canned_fish_choosing` and
`farmed_fish_by_species` to bar A; kept on disk, not cited, not a scrape failure.

## 1. Salmon: wild vs. farmed

### Source: Alaska Sea Grant / University of Alaska Fairbanks, "Aquaculture" (akseagrant-aquaculture)
- URL: https://alaskaseagrant.org/our-work/aquaculture/ (fetched, Firecrawl, 2026-09-20)
- Publisher: Alaska Sea Grant, University of Alaska Fairbanks
- Retrieved: 2026-09-20

> Under Alaska state law, aquatic farming is limited to shellfish and seaweeds.

> The term mariculture refers specifically to the cultivation of marine organisms such as shellfish
> and seaweeds in a marine environment, distinguishing it from aquaculture, which encompasses all
> aquatic farming, including anadromous and freshwater species like salmon and trout.

> Salmon ranching is distinct from aquatic farming. It is conducted by private nonprofit hatcheries
> that release juvenile salmon into the ocean to enhance natural populations. These programs operate
> under the management of the Alaska Department of Fish and Game and are designed to supplement, not
> replace, wild stocks.

fills: `salmon_wild_vs_farmed` — the structural fact that closes this card's gap: salmon farming is
legally prohibited in Alaska (only shellfish/seaweed aquaculture is allowed there), so Alaska salmon
is categorically wild-caught or hatchery-ranched, never net-pen farmed — the real distinction from
farmed Atlantic salmon (typically net-pen raised in Norway/Chile/Canada).

## 2. Shrimp: imported vs. domestic

### Source: NC Sea Grant, Coastwatch, "Curbing the Import Appetite: Selling American Shrimp in the U.S. Market" (ncseagrant-shrimp)
- URL: https://ncseagrant.ncsu.edu/coastwatch/curbing-the-import-appetite-selling-american-shrimp-in-the-u-s-market/ (fetched, Firecrawl, 2026-09-20)
- Publisher: North Carolina Sea Grant, Coastwatch (article by Kathleen Angione, Dec. 1, 2007)
- Retrieved: 2026-09-20

> Nearly 90 percent of shrimp consumed in this country are imported, and half of those imports are
> raised in earthen ponds, not caught at sea.

> Many imported shrimp are pond-raised and fed grain products, so they have a bland flavor... Wild-caught
> shrimp are feeding off plankton and other protein sources, so they have a more savory flavor.
> — Barry Nash, NC Sea Grant seafood technology specialist

> In general, farm-raised shrimp are more uniform in size than wild shrimp — a factor that American
> consumers have come to accept as a standard of quality for shrimp... Wild shrimp are harvested in a
> wide range of sizes and are usually graded to a count per pound.
> — Scott Baker, NC Sea Grant fisheries specialist

> Foreign, pond-raised shrimp look perfect because workers pull them from ponds and immerse them in
> ice water immediately... Farm-raised products are not crushed or exposed to the elements the way
> wild-caught shrimp can be.
> — Barry Nash

fills: `shrimp_imported_vs_domestic` — flavor, size-uniformity, and appearance differences between
pond-raised imports and wild-caught domestic shrimp, each attributed to a named NC Sea Grant
specialist.

Judgment call: the article gives a specific historical price-per-pound figure and names retailers and
a branding company; both are excluded under the no-price and no-brand rules. The "nearly 90 percent
imported" statistic is from a 2007 article — noted here as dated, not to be presented as a current
figure without a fresher source.

## 3. Fresh vs. previously frozen

### Source: Alaska Longline Fishermen's Association, "Why Frozen?" (alfa-whyfrozen)
- URL: https://www.alfafish.org/why-frozen (fetched, Firecrawl, prior session 2026-09-20)
- Publisher: Alaska Longline Fishermen's Association (independent fishers' association)
- Retrieved: 2026-09-20

> Flash freezing is a process in which seafood is frozen rapidly to at least -10° F in a few hours.
> This essentially locks the fish in time allowing for a two year shelf life at premium quality.
> Locking the fish in this fresh state halts cellular degradation so that when you thaw your seafood
> it is as fresh as the day it was frozen.

> "Fresh" fish may have been out of the water for 10-14 days or more, which greatly impacts quality.

fills: `fresh_vs_previously_frozen_fish`, corroborating source alongside Whidbey below.

### Source: Whidbey Seafoods, "Why Flash-Frozen Seafood Is the Freshest Choice You Can Make" (whidbey-flashfrozen)
- URL: https://whidbeyseafoods.com/blogs/education/why-flash-frozen-seafood-is-the-freshest-choice-you-can-make (fetched, Firecrawl, prior session 2026-09-20)
- Publisher: Whidbey Seafoods (independent seafood seller)
- Retrieved: 2026-09-20

> Flash freezing is a process where seafood is frozen almost immediately after being caught—often
> right on the boat. This rapid freezing method locks in freshness, flavor, and nutrients by freezing
> the product at extremely low temperatures in a very short amount of time. Unlike traditional
> freezing, it prevents large ice crystals from forming, so the texture and integrity of the fish
> remain just like it was when it came out of the water.

fills: `fresh_vs_previously_frozen_fish` — this slug's bar A gap was already closed in the prior
session; carried forward here unchanged, no re-scrape performed.

## 4. Fish freshness at the counter

### Source: Nofima, "How to check how fresh fish is" (nofima-freshness)
- URL: https://nofima.com/worth-knowing/how-to-check-how-fresh-fish-is/ (fetched, Firecrawl, 2026-09-20)
- Publisher: Nofima (independent Norwegian food research institute); sensory scientist Mats Carlehög
- Retrieved: 2026-09-20 (page last updated 2025-06-19)

> The skin should have a mother-of-pearl sheen and be free of marks.

> With fresh fish, the eyes should be clear, dark and with a metallic sheen. If they are turning grey,
> matte and sunken, the fish is already in an early stage of decomposing.
> — Mats Carlehög

> If you could pick only one parameter for assessing the freshness of fish, choose the gills. The
> gills are the lungs of the fish and where fresh blood meets air. If the gills are still red, the
> fish was slaughtered only a short time ago. If their colour is turning brown, grey or green, the
> fish is no longer fresh.

> The decomposition process begins immediately after the fish is slaughtered. Chemical and enzymatic
> reactions and bacteria break down the fish, which appears as changes in shine, texture, colour and
> smell. The decomposition time depends on how the fish has been treated during slaughter and how it
> has been stored. That is why you cannot always rely on the last day of use date.

fills: `fish_freshness_at_counter`. Candidate watch_out (grounded in the above, card currently has
`watch_out: null`): "The single best tell is the gills — red means recently caught, brown/grey/green
means it's past its best, and a sell-by date alone doesn't guarantee freshness."

Judgment call: the page also states fish that is "no longer completely fresh" is still safe to eat
"as long as you heat it properly" — a food-safety reassurance bordering on a health claim; excluded
here rather than risk drifting into medical-claim territory.

## 5. Canned fish, choosing

### Source: Seafood Watch (Monterey Bay Aquarium), "Tips for choosing sustainable canned tuna" (seafoodwatch-canned-tuna)
- URL: https://www.seafoodwatch.org/stories/tips-for-choosing-sustainable-canned-tuna (fetched, Firecrawl, 2026-09-20)
- Publisher: Seafood Watch, Monterey Bay Aquarium
- Retrieved: 2026-09-20

> The terms FAD-free, free school, and school-caught mean the tuna was caught with purse seines
> without using a fish aggregating device (FAD). A FAD is a natural or artificial floating object that
> lures tuna to an area, so catching them is much easier. Unfortunately, the FAD also attracts juvenile
> fish, sharks, and a lot of other marine life that end up as bycatch. The amount of bycatch is a lot
> less when FADs are not used.

> "Dolphin-safe" doesn't mean the canned tuna is sustainable, so you'll also want to look for the
> above terms on the label.

> Skipjack tuna is the most prevalent species sold in cans in North America and is marketed as "chunk
> light" or "light" tuna. Albacore is also very popular and is marketed as "white" tuna. "Ahi" canned
> tuna is usually yellowfin tuna, but it may be bigeye tuna.

> Purse seines surround tuna with a large wall of netting that's closed like a drawstring purse to
> capture them. Drifting longlines can be up to 50 miles long and have thousands of baited hooks, so
> bycatch of turtles, seabirds, sharks, and many other vulnerable species can be very high.

fills: `canned_fish_choosing`. Candidate watch_out (grounded in the above, card currently has
`watch_out: null`): "'Dolphin-safe' is a bycatch label for dolphins only — it doesn't mean the catch
method was low-bycatch overall; look for pole-caught, troll-caught, FAD-free, or school-caught instead."

Judgment call: the page's "Canned tuna brands to look for" and "Grocery stores that sell sustainable
canned tuna" sections name specific brands and retailers; excluded under the no-named-brand rule as
applied here (positive brand lists included, not just negative ones — Kristy teaches label terms, not
brand shopping).

## 6. Farmed fish, by species

### Source: National Aquaculture Association, "Seafood Watch Points to U.S. Farmed Fish, Shellfish and Seaweed as 'Super Green'" (naa-farmed-species)
- URL: https://members.nationalaquaculture.org/news/Details/seafood-watch-points-to-u-s-farmed-fish-shellfish-and-seaweed-as-super-green-246504 (fetched, Firecrawl, 2026-09-20)
- Publisher: National Aquaculture Association, reporting Seafood Watch/Monterey Bay Aquarium's list
- Retrieved: 2026-09-20 (article dated 2025-01-17)

> Seven of the ten Super Green rated seafoods are U.S. farmed!
> Catfish, Clams, Hybrid Striped Bass, Mussels, Oysters, Trout and Steelhead, Seaweed

> In addition to the Super Green rankings, the Aquarium recognizes more U.S. farmed seafoods as Green
> or Best Buy consumer choices: Abalone, Almaco Jack, Red swamp crawfish, Red drum, Yellow perch,
> Florida pompano, White leg shrimp (RAS and ponds), Sturgeon (Russian, Siberian, White), Tilapia
> (hybrid red, Mozambique, Nile).

fills: `farmed_fish_by_species`. Candidate watch_out (grounded in the above, card currently has
`watch_out: null` despite `depth-gap.md` marking this slug's served watch_out column `Y` — flagged
below as an unresolved discrepancy, not corrected here): "Farmed species vary a lot by sustainability
rating — bivalves (clams, mussels, oysters) and catfish/trout are consistently rated favorably;
species and farming method both matter more than 'farmed' as a single word."

Judgment call: the source quotes Seafood Watch calling the list "nutritious and healthy" and "high in
omega-3 fatty acids, low in mercury" — these are descriptive/compositional claims (nutrient content),
not disease-outcome claims, so they were left in; no claim that any of these foods treats, prevents, or
lowers risk of a disease appears in the source and none is introduced here.

## 7. Mercury by fish

### Source: Environmental Working Group, "EWG's Consumer Guide to Seafood" (ewg-seafood-guide)
- URL: https://www.ewg.org/consumer-guides/ewgs-consumer-guide-seafood (fetched, Firecrawl, 2026-09-20)
- Publisher: Environmental Working Group
- Retrieved: 2026-09-20

> Best Bets (Very High Omega-3s, Low Mercury, Sustainable): wild salmon, sardines, mussels, rainbow
> trout, Atlantic mackerel.

> Good Choices (High Omega-3s, Low Mercury): oysters, anchovies, pollock/imitation crab, herring.

> Low Mercury But Also Low Omega-3s: shrimp, catfish, tilapia, clams, scallops, pangasius.

> Mercury Risks Add Up — Pregnant Women And Children Should Limit Or Avoid: canned light/albacore
> tuna, halibut, lobster, mahi mahi, sea bass.

> Avoid — Mercury Levels Too High To Eat Regularly: shark, swordfish, tilefish, king mackerel, marlin,
> bluefin/bigeye tuna, orange roughy.

fills: `mercury_by_fish` — the per-species mercury/omega-3 tiering the card needs.

Judgment call: EWG's executive summary states pregnant mothers eating low-mercury, high-omega-3 fish
have children with "better cognition and behavior," and that people at risk for heart disease "can
lower their blood cholesterol levels and reduce the risk of heart attacks and strokes" by eating
seafood routinely. Both are disease-outcome claims and are excluded under the symmetric no-treatment
rule; only the descriptive tier/species list above is usable. Mercury itself is framed
mechanistically (tracks species/size/lifespan), never as an outcome claim, consistent with the rule.

## 8. Seafood certifications

### Source: Marine Stewardship Council, "The MSC blue fish label: what it means for you" (msc-bluelabel)
- URL: https://www.msc.org/en-us/the-msc-blue-fish-label-what-it-means-for-you (fetched, Firecrawl, 2026-09-20)
- Publisher: Marine Stewardship Council
- Retrieved: 2026-09-20

> When you see the MSC blue fish label on fish and seafood products, it means you're choosing
> wild-caught fish from fisheries that have been independently assessed as meeting the MSC's
> requirements for environmentally sustainable fishing practices.

> Choosing seafood with the MSC blue fish label means the fishing operations have been assessed
> against three principles: Fish populations are protected... Other ocean life is cared for... Fisheries
> are well managed.

> Fishing must be managed so that fish populations remain healthy and productive over the long-term.
> Independent assessors look at whether stock levels are high enough to support continued
> reproduction, whether current harvest rates are sustainable, and whether a robust strategy exists to
> meet these goals. Where a stock has already been depleted, there must be clear evidence that a
> rebuilding plan is in place and working.

> Fisheries must show that incidental catch — species caught unintentionally during fishing — does not
> deplete non-target populations. This includes having effective measures in place to minimize
> unwanted catch and prevent population decline.

fills: `seafood_certifications` — what the MSC blue label certifies in practice (wild-caught only,
stock health, bycatch, fishery management), directly from the certifying body.

### Source: Seafood Watch (Monterey Bay Aquarium), "Tips for choosing sustainable canned tuna" (seafoodwatch-canned-tuna)
- URL: https://www.seafoodwatch.org/stories/tips-for-choosing-sustainable-canned-tuna (fetched, Firecrawl, 2026-09-20; same scrape as §5)
- Publisher: Seafood Watch, Monterey Bay Aquarium
- Retrieved: 2026-09-20

> "Dolphin-safe" doesn't mean the canned tuna is sustainable, so you'll also want to look for the
> above terms on the label.

fills: `seafood_certifications` — second, independent source: a named consumer-facing label
("dolphin-safe") that certifies one narrow thing and is not a sustainability certification, contrasted
with MSC's broader third-party assessment above.

## Bar A status, all 8 slugs

| slug | real-URL source count | independent (non-gov) source count | bar A satisfiable |
| --- | --- | --- | --- |
| salmon_wild_vs_farmed | 1 (Alaska Sea Grant) | 1 | Y — already has a KB watch_out |
| shrimp_imported_vs_domestic | 1 (NC Sea Grant) | 1 | Y — already has a KB watch_out |
| fresh_vs_previously_frozen_fish | 2 (ALFA, Whidbey) | 2 | Y — already has a KB watch_out (closed prior session) |
| fish_freshness_at_counter | 1 (Nofima) | 1 | Y — candidate watch_out authored above, currently null in KB |
| canned_fish_choosing | 1 (Seafood Watch) | 1 | Y — candidate watch_out authored above, currently null in KB |
| farmed_fish_by_species | 1 (NAA/Seafood Watch) | 1 | Y — candidate watch_out authored above; see discrepancy note below |
| mercury_by_fish | 1 (EWG, with one exclusion) | 1 | Y — needs a watch_out authored from the tier list; card's current watch_out status not reverified here |
| seafood_certifications | 2 (MSC, Seafood Watch) | 2 | Y — already listed with sources in depth-gap.md; already has a KB watch_out |

All 8 slugs are bar A satisfiable on sourcing. None failed to fetch; no boilerplate-only scrapes this
pass. Two sources were scraped and deliberately not cited (EDF press release — no usable per-species
data; MBA sardine guide — not needed once other sources covered their cards) — see "Dropped sources"
above.

Unresolved observation, not corrected here (forbidden — no KB/depth-gap.md edits from this file):
`depth-gap.md` marks `farmed_fish_by_species`'s "served watch_out" column `Y`, but the raw KB field for
that card is `watch_out: null`. Whoever migrates this batch should reconcile which is true before
treating this slug as already passing.
