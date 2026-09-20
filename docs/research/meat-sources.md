# Meat sources — archive for grocery-counter cards

Same method and rules as `docs/research/produce-sources.md`: every quote below was fetched in
this session (firecrawl-style WebFetch or Cornell LII text render), retrieved 2026-09-16.
Quotes are verbatim, truncation marked `[…]`. No prices, no yield figures, no medical claims
added beyond what a source states. `fsis.usda.gov` and `snaped.fns.usda.gov` were not used —
both return 403 from this box. Path note: written to `docs/research/meat-sources.md` (sibling
of `produce-sources.md`), not the literal `docs/meat-sources.md` named in the dispatch, for
consistency with the existing `docs/research/` layout.

## Dropped sources (fetched or attempted, noted so they are not re-fetched)

- MSU Extension, "What to look for when buying meat"
  (`https://www.canr.msu.edu/news/what_to_look_for_when_buying_meat`) — Incapsula bot-protection
  blocks this box on both `curl` and WebFetch (`Request unsuccessful. Incapsula incident ID:
  978000450914188448-875108077774441328`). Unreachable, not a content judgment.
- AMSA / meatscience.org, "What is the liquid in my meat package?"
  (`https://meatscience.org/TheMeatWeEat/topics/fresh-meat/article/2016/04/14/what-is-the-liquid-in-my-meat-package`)
  — HTTP 500 on two separate attempts.
- Texas A&M Meat Science, "Meat Selection" (`https://meat.tamu.edu/texas-bbq/meat-selection/`) —
  reachable, but page covers only named BBQ cuts (brisket, ribs, etc.), no freshness/texture/purge
  content.
- Gunnison, CSU Extension, "Meat Buying Guide"
  (`https://gunnison.extension.colostate.edu/agriculture/meat-buying-guide/`) — 301-redirects to a
  generic county hub page; the guide content is no longer at that URL.
- Ohio State Extension (Ohioline), `hyg-5512` — reachable, but that factsheet number is Ohio
  produce (broccoli/Brussels sprouts/cauliflower), not meat; wrong document, dropped.
- ecfr.gov (all Part 319/317 sections) — every direct WebFetch 302-redirects to
  `unblock.federalregister.gov`, a bot-check wall; not fetchable from this tool. Used
  `law.cornell.edu` (Cornell LII), an .edu mirror of the same CFR text, instead — see below.

## 1. Fresh meat at the case — selection cues

Searched specifically for authoritative support of two claims in `judging_meat_at_the_case`:
(a) meat should feel firm/springy, springs back when pressed; (b) a tray sitting in a lot of
liquid ("purge") is a sign to avoid, dry tray preferred.

**Finding: cue (a), "springs back when pressed," could not be sourced to any authoritative
page about selecting RAW meat at the store.** A targeted web search on the exact phrase
returns only content about judging the *doneness of cooked meat* (the "touch test" — rare vs.
medium vs. well-done), e.g. results describing "if a piece of meat feels moderately firm and
resilient, and springs back readily when pressed" as an indicator of medium doneness, not
freshness at purchase. No .edu/.gov source found in this session applies springiness to a
raw meat case-selection decision. This cue should be treated as unsupported for the card.

**Cue (b), purge/liquid in the package, has partial, indirect support** from Illinois
Extension — see below. No source used the word "purge" itself, and none framed a dry tray as
explicitly preferred over one with visible liquid; the supported claim is narrower: the package
should not be leaking.

### Source: University of Illinois Extension — "Meat Shopping Safety Guidelines" (Shopping)

- URL: https://extension.illinois.edu/meat-safety/shopping
- Publisher: University of Illinois Extension
- Retrieved: 2026-09-16

> "Look for packaging that is fully sealed, has no holes, tears, or punctures, and is not
> leaking meat juices."

> "Avoid meat with 'off smells' or slimy texture"

> "Fresh meat should be 'mold-free'" [sic — quoted phrasing as returned by fetch]

Notes: this page supports "package should not be leaking juices" as a purchase check. It does
**not** mention purge volume, a wet vs. dry tray, or meat texture/springiness at all — the only
texture-adjacent language is "slimy," which is a spoilage sign, not a freshness/firmness cue.
The card's "firm/springy" assertion and its "dry tray preferred" framing both go beyond what
this source states.

## 2. Sausage labeling

9 CFR Part 319 Subpart E (Sausage) and Part 317 (Labeling), fetched via law.cornell.edu (Cornell
Legal Information Institute), an .edu mirror of the same regulatory text — ecfr.gov itself
bot-blocked this tool (302 to `unblock.federalregister.gov` on every attempt).

### Source: Cornell Legal Information Institute — 9 CFR § 319.140, "Sausage"

- URL: https://www.law.cornell.edu/cfr/text/9/319.140
- Publisher: Cornell Law School, Legal Information Institute (mirroring 9 CFR)
- Retrieved: 2026-09-16

> "the coarse or finely comminuted meat food product prepared from one or more kinds of meat or
> meat and meat byproducts, containing various amounts of water as provided for elsewhere in
> this part, and usually seasoned with condimented proportions of condimental substances, and
> frequently cured."

Binders/extenders and moisture, as rendered from the same section: approved binders/extenders
include pork collagen (up to 3.5%) and transglutaminase enzyme (up to 65 ppm); uncooked sausage
may have water or ice added not exceeding 3% of total ingredients; cooked varieties such as
Polish sausage and braunschweiger may contain no more than 10% added water in the finished
product; phosphates are generally prohibited unless specifically permitted in cooked sausage
formulations. [Paraphrase of the fetch tool's rendering of the regulation's numeric limits —
the definitional sentence above is the direct verbatim quote; the numeric limits should be
re-verified against the primary text before being quoted as exact regulatory wording.]

### Source: Cornell Legal Information Institute — 9 CFR § 319.141, "Fresh pork sausage"

- URL: https://www.law.cornell.edu/cfr/text/9/319.141
- Publisher: Cornell Law School, Legal Information Institute (mirroring 9 CFR)
- Retrieved: 2026-09-16

> "'Fresh Pork Sausage' is sausage prepared with fresh pork or frozen pork or both, but not
> including pork byproducts, and may contain Mechanically Separated (Species) in accordance
> with § 319.6, and may be seasoned with condimental substances as permitted under part 318 of
> this subchapter."

> "The finished product shall not contain more than 50 percent fat."

> "Water or ice may be used in an amount not to exceed 3 percent of the total ingredients
> used."

Note: this section states fat and water/ice limits explicitly; it does not itself set a
separate binder/extender or nonfat-dry-milk limit for fresh pork sausage.

### Source: Cornell Legal Information Institute — 9 CFR § 317.17, curing-agent declaration

- URL: https://www.law.cornell.edu/cfr/text/9/317.17
- Publisher: Cornell Law School, Legal Information Institute (mirroring 9 CFR)
- Retrieved: 2026-09-16

> "any substance mixed with another substance to cure a product must be identified in the
> ingredients statement on the label of such product."

Curing-mixture ingredients named in the section as needing individual listing: water, salt,
sugar, sodium phosphate, sodium nitrate, and sodium nitrite or other permitted substances.
The section separately addresses "Uncured" labeling for products made without nitrate or
nitrite. No sentence restricting use of the word "fresh" on a cured/sausage label was found in
this section on direct fetch — the earlier WebSearch-only summary claiming such a restriction
was NOT verified against the primary text and is not included as sourced.

No fetchable .edu page specifically about *reading a sausage label* (as opposed to the raw CFR
text) was found in this session; the bonus source was not obtained.

## Depth audit, bar A — 10 failing meat shelf cards (fetched 2026-09-20)

Scope: `air_chilled_chicken, beef_cuts_basics, beef_grades_usda, beef_grassfed_vs_grainfed,
butcher_counter_asking, chicken_cuts_basics, deli_meat_uncured, ground_beef_lean_ratio,
no_antibiotics_poultry, pork_cuts_and_enhanced` — per `docs/research/depth-gap.md`. Research
only; no KB edits made in this pass.

### Dropped sources (this pass)

- `https://www.ams.usda.gov/rules-regulations/united-states-standards-grades-carcass-beef-0` —
  HTTP 403.
- `https://www.usda.gov/about-usda/news/blog/understanding-ams-withdrawal-two-voluntary-marketing-claim-standards` —
  HTTP 403.
- `https://www.fsis.usda.gov/sites/default/files/media_file/2021-02/RaisingClaims.pdf` — HTTP 403.
- `https://www.usda.gov/sites/default/files/guidance-documents/FSIS.%20FSIS%20Guideline%20on%20Substantiating%20Animal-Raising%20or%20Environment-Related%20Labeling%20Claims.pdf` —
  HTTP 403.
- `https://www.ams.usda.gov/services/remote-beef-grading/understanding` — HTTP 403. Confirms
  `ams.usda.gov` is blocked from this box across every path tried, same as `fsis.usda.gov`.
- `https://www.canr.msu.edu/resources/antibiotic-label-claims` — fetched, but returned as empty
  content (no body text) to the fetch tool; not usable, not an Incapsula block this time but
  still no content retrieved.
- `https://www.federalregister.gov/documents/2016/01/12/2016-00440/...` — 302-redirects to the
  `unblock.federalregister.gov` bot wall, same as `ecfr.gov`. Worked around with the `govinfo.gov`
  mirror of the same Federal Register notice (below) — a second .gov mirror route, alongside the
  `law.cornell.edu` CFR mirror already in this file.
- `https://www.law.cornell.edu/cfr/text/7/54.103` and `.../7/54.104` — both HTTP 404; Cornell LII
  does not mirror 7 CFR Part 54 (voluntary meat grading) at those section numbers.
- `https://extension.k-state.edu/news/stories/2015/10/ground-meat102115.html` — the original URL
  itself 301-redirected further to a generic "news-and-publications" hub page with no article
  content (the story was pulled down); no content recovered from this source.
- `https://www.makefoodsafe.com/meat-grinding-at-home-safety-tips/` — fetched; only generic
  "prevent cross-contamination" / "sanitize equipment" advice recovered, no mechanism-of-spread
  sentence. Used anyway below as weak supporting material (not government/university).

### air_chilled_chicken

KB already has an authored `watch_out` (retained-water percentage) and a served watch_out; only
gap is a fetched URL source.

**Source: Cornell Legal Information Institute — 9 CFR § 441.10, "Retained water in raw meat and
poultry products"**
- URL: https://www.law.cornell.edu/cfr/text/9/441.10
- Publisher: Cornell Law School, Legal Information Institute (mirroring 9 CFR)
- Retrieved: 2026-09-20

> "Raw single-ingredient meat and poultry products (e.g., a whole broiler, a steak) must not
> contain retained water unless the retained water is unavoidable and a result of the processing
> that is essential to achieve the required food safety attributes of the product."

> "Any raw single-ingredient meat or poultry product containing retained water must bear a label
> that discloses the presence of the retained water, e.g., '[Name of product], contains up to __%
> retained water.'"

Supports both the card's existing claim (air-chilling is the alternative to a water-immersion
chill that adds retained water) and its watch_out (checking the label for a stated retained-water
percentage on wet-processed chicken).

### beef_cuts_basics

**No supporting source found.** Multiple searches for a checkable, non-medical buying/label
pitfall specific to beef primal/subprimal cut naming (the card's stated gap: cut names are not
standardized and vary by retailer/region) did not surface a fetchable .gov/.edu page addressing
naming inconsistency directly; only USDA IMPS (Institutional Meat Purchase Specifications)
material was found, and it was not fetched this session. **Marked as unsourced — do not add a
watch_out to this card from memory.** Needs a dedicated follow-up search (IMPS numbering vs.
retail names, or a NAMP/extension chart) in a future pass.

### beef_grades_usda

**Source: South Dakota State University Extension — "USDA Beef Quality Grades: What do they
mean?"**
- URL: https://extension.sdstate.edu/usda-beef-quality-grades-what-do-they-mean
- Publisher: South Dakota State University Extension
- Retrieved: 2026-09-20

> "Young carcasses can be graded as USDA Prime, Choice, Select, or Standard"

> "the grader will determine the amount of marbling, or flecks of fat, within the ribeye muscle"

Notes: this fetch did not return separate verbatim definitions of Prime vs. Choice vs. Select, or
a sentence stating grading is a voluntary fee-for-service program (the KB's existing 2 sources —
not re-verified this session, per dispatch scope — are understood to already carry that claim).
This source supports only: grading is based on marbling in the ribeye, graded categories include
Prime/Choice/Select/Standard. **The "voluntary, paid for by the packer" claim remains without a
freshly-fetched verbatim source in this session** — every `ams.usda.gov` URL tried returned 403,
and Cornell LII does not mirror 7 CFR Part 54 at the section numbers tried. This card now has a
fetched URL source; the voluntary/paid claim specifically should be treated as carried over from
the KB's existing non-URL sources, not as freshly verified here.

No watch_out passage was targeted for this card in this pass (KB shows no authored watch_out
requested for it in the failing-slug note beyond the URL gap).

### beef_grassfed_vs_grainfed

KB already has an authored `watch_out`; gap was a fetched URL source.

**Source: GovInfo.gov (GPO) — Federal Register, "United States Standards for Livestock and Meat
Marketing Claims, Withdrawal"**
- URL: https://www.govinfo.gov/content/pkg/FR-2016-01-12/html/2016-00440.htm
- Publisher: U.S. Government Publishing Office (govinfo.gov), mirroring the Federal Register
  notice by USDA AMS
- Retrieved: 2026-09-20

> "AMS is withdrawing: (1) The Grass (Forage) Fed Claim for Ruminant Livestock"

> "the U.S. Standards for Livestock and Meat Marketing Claims do not always help facilitate the
> marketing of agricultural products"

> "applicants must identify a new Grass-fed Standard their company intends to meet by February 11,
> 2016 and must implement the new standard by April 11, 2016"

Notes: the fetch tool returned these as short truncated fragments (character counts noted
alongside each in the raw tool output) rather than full sentences — flagging per this file's
existing precedent that a fragment should not be presented as a complete verbatim sentence. The
substance (AMS withdrew the grass-fed marketing claim standard in 2016; companies using it had to
adopt a private/new standard by set 2016 deadlines) supports the card's existing watch_out that
"grass-fed" on a beef label is not backed by a single enforced USDA definition today.

### butcher_counter_asking

**Source: MakeFoodSafe.com — "Meat Grinding at Home Safety Tips"**
- URL: https://www.makefoodsafe.com/meat-grinding-at-home-safety-tips/
- Publisher: MakeFoodSafe.com (Pritzker Hageman law-firm-affiliated food-safety site — not
  government or university; flagged as the weakest-tier source in this archive)
- Retrieved: 2026-09-20

> "Prevent Cross-Contamination: Use separate cutting boards and utensils for raw meat and any
> other food items."

> "Sanitize Equipment and Surfaces: Wash hands, all grinder components...before and after use."

Notes: this is a consumer safety-tips page, not a regulatory or university source, and it does
not itself state that a store's grinder handles multiple customers' orders or multiple meat lots.
**Treat as weak, secondary support only** for a watch_out along the lines of "ask whether the
counter's grinder is cleaned between orders/lots" — it establishes that grinder cleaning between
uses is a recognized food-safety practice, not that stores reliably do it or that a shopper should
distrust a counter that doesn't say so. A second, stronger (.gov/.edu) source was searched for and
not found this session; the original state-extension candidate
(`extension.k-state.edu/.../ground-meat102115.html`) no longer resolves to article content (see
Dropped sources). This card is at 1 fetched URL source; still below the ≥2-sources bar without a
second source.

### chicken_cuts_basics

Reuses the 9 CFR § 441.10 retained-water source already fetched for `air_chilled_chicken` above
(same URL, same retrieval date, same passage) — the card's `buying_tips` already reference
checking for retained water on the label, so this source is directly on-point as this card's URL
source. No separate new fetch was needed or made for this card.

### deli_meat_uncured

**Source: Niche Meat Processor Assistance Network — "Uncured Bacon"**
- URL: https://www.nichemeatprocessing.org/uncured-bacon/
- Publisher: Niche Meat Processor Assistance Network (NMPAN)
- Retrieved: 2026-09-20

> "No nitrate or nitrite added except those naturally occurring in celery juice powder."

Notes: this is the required qualifying label statement quoted verbatim from the page; the fetch
tool reported it could not additionally verify, verbatim, a sentence explaining that the product
still contains nitrite despite the "uncured" claim — that explanatory framing should not be added
to the card from memory.

Combined with the already-archived **9 CFR § 317.17** (curing-agent declaration, section 2 above,
`https://www.law.cornell.edu/cfr/text/9/317.17`, fetched 2026-09-16), which requires every curing
substance including nitrate/nitrite to be individually listed in the ingredients statement, this
card now has 2 sources with 1 fetched URL, and material supporting a watch_out: an "uncured" deli
meat carries a natural-source nitrite (e.g., celery powder) and the specific qualifying phrase to
look for on the label, rather than being free of nitrite.

### ground_beef_lean_ratio

**Source: Cornell Legal Information Institute — 9 CFR § 319.15, "Ground beef; hamburger"**
- URL: https://www.law.cornell.edu/cfr/text/9/319.15
- Publisher: Cornell Law School, Legal Information Institute (mirroring 9 CFR)
- Retrieved: 2026-09-20 (re-confirmed; originally fetched this session for this pass)

> "'Ground Beef' ... shall consist of ground beef prepared from fresh and/or frozen beef with or
> without seasoning and without the addition of beef fat as such, shall not contain more than 30
> percent fat, and shall not contain added water, phosphates, binders, or extenders."

> "'Hamburger' ... may have skeletal fat in excess of that occurring in the beef prior to
> comminution and used in an amount as needed to make hamburger and shall not contain more than 30
> percent fat."

Notes: this directly supports the card's lean/fat-percentage claim (30% fat cap on both) and gives
a checkable watch_out: "Ground Beef" cannot legally have added fat mixed in, while "Hamburger" can
— a label distinction most shoppers don't know to look for. Both terms are capped at 30% fat;
neither can carry added water/phosphates/binders/extenders.

### no_antibiotics_poultry

**No fetchable source obtained this session, despite four attempts.** Tried, in order:
`fsis.usda.gov/.../RaisingClaims.pdf` (403), `usda.gov/.../FSIS Guideline on Substantiating
Animal-Raising...pdf` (403), `ams.usda.gov` process-verified pages (403, same domain-wide block
as beef grading above), and `canr.msu.edu/resources/antibiotic-label-claims` (fetched but returned
empty content, no body text extracted). A WebSearch (not a direct fetch, and therefore excluded
per this file's verbatim-fetch rule) surfaced language that FSIS must approve "no antibiotics
added" claims before they go on a label and that documentation must be submitted to substantiate
them — but this was **not independently verified against a fetched primary source this session**
and is not included as sourced material. **This card remains without a bar-A source; flagged for
a follow-up session that can reach `fsis.usda.gov` or `ams.usda.gov` from a different network, or
that finds a reachable university-extension mirror of the same guidance.**

### pork_cuts_and_enhanced

**Source: Cornell Legal Information Institute — 9 CFR § 317.2(e)(2), raw meat/poultry products
containing added solutions**
- URL: https://www.law.cornell.edu/cfr/text/9/317.2
- Publisher: Cornell Law School, Legal Information Institute (mirroring 9 CFR)
- Retrieved: 2026-09-20

> "The percentage of added solution (total weight of the solution ingredients divided by the
> weight of the raw meat without solution or any other added ingredients multiplied by 100). The
> percentage of added solution must appear as a number (such as, 15, 20, 30) and the percent
> symbol (%). The percentage of added solution may be declared by the words 'containing' or
> 'contains'..."

> "The word 'enhanced' cannot be used in the product name."

Notes: the fetch tool's response wrapped this in its own framing sentence ("The regulation
states...") before the quoted text — flagging per this file's existing precedent that the
surrounding sentence is the tool's own rendering, not part of the regulation; the quoted material
itself is presented by the tool as direct text. This supports the card's "enhanced"/"solution
added" claim and gives a checkable watch_out: the product name must state the percentage of added
solution by law, and "enhanced" is banned from the name — so a shopper should read the fine print
on the front label for a percentage rather than trusting a marketing word that legally cannot
appear there.
