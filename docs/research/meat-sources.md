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
