# K-TIGHT polish: the shopper-at-the-shelf bar

Devon 2026-10-08: "make everything as good as possible then ship ... really think about every item and how a customer is shopping for them ... grocery store most wonderful."

The K-TIGHT spec (.pipeline/specs/KTIGHT.md, A1–A7, Ship bar) still binds every word. This pass judges `pick_steps` and `science` only, card by card, against the shopper below. Old fields are never edited.

## The shopper
The shopper is in the aisle, cart in one hand and phone in the other, and spends about 5 seconds on a card. They want to know: which one do I take, and how do I tell?

## Bar (in order of weight)
1. **Step 1 decides.** It is the single check that settles most picks of this item. Order the steps by how much each one decides.
2. **Doable here.** Each step is done at the shelf, case or bin, with the eyes, hands, nose or label: look, press, flip, smell, read a named word. A fact with no action is rewritten into the check it implies, or moved to science.
3. **Concrete.** Name the exact thing to see: a label word, a color, a texture, a sound. Never "quality" or "freshness" alone.
4. **The common case first.** Steps fit the everyday version of the item. Variant-only checks give way to common ones, using the depth-only ledger and the cap.
5. **Science earns its place.** It answers "why do these checks work" in plain words. The first sentence carries the core mechanism. No trivia that serves no step, and no sentence that only repeats a step.
6. **Reads as one voice.** Same verbs and same shape across a section. No half sentences, and no jargon the label does not use.
7. **Leave good cards alone.** Rewrite only when it is clearly better for the shopper, and log "kept" otherwise. Churn is not quality.

## Hard rules (unchanged)
- **Claim lock:** every clause traces to the card's OWN fields. No new fact, number, concern or outcome, and hedges are kept.
- **Banned in the new fields:** treatment wording, redirects to another item or card, price or spending, brands, first person, em dashes.
- **Caps:** steps 1 to 3, each ≤14 words. Science ≤70 words, each sentence ≤20.
- **Coverage ledger:** ≤2 depth-only WHOLE bt/w points per card.
- **Lints:** never weaken a lint or edit counterClaimLock.js / counterCardLint.js. Never run a global sed on the KB.

## Out of scope: log, don't fix
- A shopper check the card's fields lack, or a KB fact that looks wrong. Append it to `docs/ktight/GAPS.md` as `id | what is missing or wrong | why a shopper needs it`. Fixing it needs sources, which is a later research pass.

## Per pass
- Resolve the K-TIGHT ship notes for the pass's batches (handoff ~/.claude/handoffs/kristy-corpus.md, "K-TIGHT B.." lines) when they are in scope.
- Update each batch trace `docs/ktight/Bxx.md` for every changed line: words, traces and ledger.
- Append to `docs/ktight/POLISH.md` one line per card: `id | kept` or `id | changed: what and why (shopper terms)`.
- Checks: npm test 0 fail; listMatchProbe unchanged; `git diff kristy_perimeter_kb.json | grep -c '^-[^-]'` counts only pick_steps/science lines; dry-run 202 placed.
