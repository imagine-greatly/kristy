# EU SOURCES — what they surface that the corpus does not, 2026-08-24

Searched EFSA, FSAI, UK FSA and the EU additive/labelling literature against both knowledge
bases. **Most of what came back is already covered**, and that is the useful half of the result.

## Already covered — do not re-author

| topic | where it already lives |
| --- | --- |
| nitrites / nitrates in cured meat | **both** KBs (9 counter hits, 13 ingredient hits). EFSA's ADI (0.07 mg/kg bw/day nitrite) agrees with the existing framing. |
| mercury by species | counter KB, 20 hits — `mercury_by_fish`. EFSA's advice (swap large predators for small oily fish) is the card's own line. |
| free-range / pasture claims | counter KB, 22 and 48 hits. Heavily covered. |
| country-of-origin | counter KB, 17 hits. |
| titanium dioxide · potassium bromate · azodicarbonamide · BHA · BHT · BVO | **ingredient KB only** (2–7 hits each) — correct by design: those are *label* ingredients found by scanning, not counter questions. |

## Genuine gaps, ranked

**1. ✅ CLOSED 2026-08-25 — `label_artificial_color`, AND THE SOURCES NARROWED IT ON THE WAY IN.**
Authored as a titanium-dioxide anchor rather than the hub of five this entry proposed, because
**only titanium dioxide is genuinely hidden**: 21 CFR 101.22(k)(1) requires every certified dye
to be declared by name, and (k)(2) lets colors exempt from certification ride as *"Artificial
Color"* or *"Color Added"*. Bromate, ADA, BHA and BHT are all named on the panel, so a hub do
line would have generalized away the one tell worth teaching.
⚠️ **AND THE SAFETY FRAME THIS ENTRY IMPLIED DOES NOT SURVIVE ITS OWN SOURCES.** EFSA's words
are *"could not exclude genotoxicity"* and *"could not establish a safe level"* — an inability
to prove safety, not a finding of harm; it also found the evidence for general toxic effects
inconclusive. **JECFA re-evaluated in 2023 and concluded it is safe**, and the UK FSA, Health
Canada and FSANZ all declined to follow the EU. NTP carcinogenicity studies found no cancer.
So the card teaches the **labeling rule**, which is written down and `established`, and the
regulatory disagreement rides in `watch_out` — the popular-claim-outruns-evidence rule applied
to a claim this document was about to repeat. **BVO is not on the card: the FDA revoked it, and
the ingredient KB's own entry already said so.**

📝 **TWO FINDINGS, NEITHER FIXED, BOTH SEPARATELY-SCOPED SERVER WORK:**
- ⚠️ **THE SCOPE GATE HAS NEVER HEARD OF AN ADDITIVE.** `COUNTER_SUBJECT` and `GROCERY_SUBJECT`
  are explicit vocabulary lists holding counter nouns and label words, and **no additive or
  color name is in either.** So `is titanium dioxide banned` and `is titanium dioxide in candy`
  reach `off_topic` while retrieval scores the right card every time — measured, not inferred.
  The card is reachable only through incidental paths (`isBareDefinitional` carries *what is
  titanium dioxide*, `isMeaningQuestion` carries *what does artificial color mean*), and its
  `asked_as` was authored to in-scope phrasings rather than widening the gate. **This is the
  too-tight direction the rule says scope has been wrong in every time.**
- ⚠️ **THE INGREDIENT KB'S `titanium_dioxide` ENTRY IS ONE-SIDED AGAINST THESE SOURCES.** It
  cites EFSA and calls it *"Another EU-banned, US-permitted situation"* with no mention of
  JECFA 2023, the NTP result, or the four regulators who disagreed. **It is `credible_concern`
  scoring data, so changing it changes verdicts** — a finding, not a fix.

*Superseded proposal, kept because the reasoning still holds for the four named additives:*

**⚠️ A `label_terms` CARD ON THE ADDITIVES THE EU BANNED AND THE US DID NOT.**
The ingredient KB scores them; **nothing teaches a shopper to recognise them.** That is the
"teach the label truth" principle exactly — defensible, never goes stale, makes the shopper
competent at every product rather than suspicious of one brand. Titanium dioxide (E171) is the
strongest anchor: banned as a food additive in the EU since 2022, still permitted in the US, and
it appears on US labels as *"artificial color"* — **a word that does not name it.**
⛔ **Bounded by non-negotiable #9: no negative claims about named brands.** The card teaches the
words, never the products carrying them.

**2. ACRYLAMIDE — zero hits in BOTH knowledge bases.** Forms in starchy food cooked hot; the EU
regulates it with benchmark levels (Reg. 2017/2158). ⚠️ **Mostly a COOKING decision, not a
buying one**, so it is a `kind='home'` card if it is anything — **mechanical only, what happens
to the food, never a bodily outcome**, per the home-card rule.

**3. ⏳ THE EU LABELLING SET — HELD ON A PRODUCT QUESTION, NOT AN AUTHORING ONE.**
- **The egg code.** Every egg in the EU is stamped `0` organic · `1` free-range · `2` barn ·
  `3` cage. **A single digit that outranks every marketing word on the carton** — the best
  single find in this scan and, on its merits, a card that would rank among the strongest in
  the corpus.
- **Nutri-Score**, and the EU country-of-origin marks.

⛔ **NONE OF THESE ARE AUTHORED, AND THE REASON IS SCOPE RATHER THAN EFFORT.**

## ⚠️ THE SCAN'S REAL FINDING: THE CORPUS IS MEASURABLY US-ANCHORED

Its sources are **USDA, FDA, EPA, EWG** and the "Dirty Dozen" — every one a US programme. The
organic card rewritten today cites **EWG's Shopper's Guide, which is a sampling of the US food
supply**, and EU organic is a different standard under a different approved-pesticide list.

**So an EU shopper would get advice measured against the wrong backdrop — quietly, and on cards
that are correct where they were written.** Nothing is wrong today, because the product ships
in one market. ⏳ **The question is a PRODUCT one and it is the owner's: does Kristy ship
outside the US?** Until that is answered, authoring EU-only cards would put entries in the
corpus that no shopper can use, and **an unusable card is the same defect as an unused brand
colour.**

**Sources:** EFSA nitrites re-evaluation · EFSA fish/mercury consumption advice · FSAI egg
marking rules · UK FSA nitrates and nitrites review · EU Reg. 2017/2158 (acrylamide).
