# chf-4a — REWRITE batch 4a: meat and eggs, health-first, one fact one owner (Not migrated)

```json
{
  "id": "chf-4a",
  "tier": "T2",
  "ui": false,
  "owns": ["server/kristy_perimeter_kb.json", "server/lib/counterCardLint.js", "server/test/healthFirst.test.js", "server/test/counterReach.test.js", "server/lib/doLines.json", "docs/do-lines-review.md"],
  "read_full": ["docs/plans/card-health-first-plan.md", ".pipeline/specs/chf-3a.md", "docs/research/health-first-sources.md"],
  "verify": ["cd server && node --test test/healthFirst.test.js", "cd server && npm test", "node server/scripts/listMatchProbe.js"]
}
```

**Problem.** Plan `docs/plans/card-health-first-plan.md`: "Decisions" (D1b, D2b, D3b, D7b, D8b), "One fact, one owner" (card skeleton, Beef / Poultry and eggs / Pork, lamb, game tables), "Claim-lock path", Piece 4. The owners (beef_grassfed_vs_grainfed, air_chilled_chicken, label_pasture_raised_feed, egg_labels, pork_cuts_and_enhanced, label_grass_fed_term, judging_meat_at_the_case) are the reference: siblings point at them. Product aim (Devon): every card leads to the closest-to-nature version. Beef: 100% grass-fed AND grass-finished first. Eggs: egg_labels already carries the order (corn- and soy-free feed, then organic, then pasture-raised) and is the model; do not change egg_labels.

## Batch ids (9)
ground_beef_lean_ratio (D1b: title "Ground beef"), beef_cuts_basics (OWNER mechanically tenderized), beef_grades_usda, meat_case (hub, OWNER of the reading order), butcher_counter_asking, pick_soup_bones (pick: cart_pick + pointer), egg_grades_sizes, pork_cuts_and_enhanced (OWNER added solution, all meat), lamb_goat (D9b: thin entry card, reading order + pointers).

## Change
1. KB, only these ids. Each card follows the card skeleton exactly (title, decision, why, cart_pick, pick_steps order, labels_decoded/watch_out, the rest). Use each row's "Only it says" cell and its owners.
   - `decision`: the closest-to-nature version in this card's own terms, never a dish or cook use. ground_beef_lean_ratio's cart_pick may carry the owner's term: "Ground beef, 100% grass-fed and grass-finished".
   - Owned facts on a non-owner: one pointer pick_step each, `<Read>: see <ownerTitle>.` with ownerTitle from `OWNED_FACTS`.
   - Claim lock: every new non-pointer sentence restates (i) a sentence on this card at HEAD, with its source verbatim; (ii) an engine KB entry; or (iii) a quote in `docs/research/health-first-sources.md`. Piece 2 narrowings bind (ground beef omits store-ground vs pre-packed; "solution added" cites 9 CFR 317.2 for red meat only, not poultry). A `sources` URL you add must appear verbatim in that archive file. Never cite from memory, never fetch.
   - No "healthier", "healthiest", "better for you", "nutritious", "lowers", "supports". Raising preferences keep `evidence_tier` `kristys_standard`. No price figures. No brand names negatively.
   - Keep `id`, food aliases, ESSENTIALS order. Drop cook-verb aliases on beef_cuts_basics (plan row). Keep each card's cooking-phrased `asked_as` question; each card ends with ≥3 `asked_as` that reach it (add asked_as phrased as a shopper asks; add matching asks to `counterReach.test.js`, never remove an existing ask). "ground beef" must reach ground_beef_lean_ratio, never beef_grassfed_vs_grainfed.
   - tier_note: unique, ≥5 words, no self-reference, not the tier name.
2. Do lines for these ids: edit their rows in `docs/do-lines-review.md`, then `node server/scripts/buildDoLines.js`; no other rows.
3. Remove the 9 ids from `HEALTH_FIRST_PENDING`; lower the ratchet ceiling in healthFirst.test.js to the new size (that line only).

## Done means
CULINARY_AIM = 0 and REPEATED_CLAIM = 0 on the batch; `npm test` 0 fail; probe no wrong matches; `grep -ciE "healthier|healthiest|better for you"` over changed fields = 0. Report: a claim-trace table, one row per new non-pointer sentence (card, sentence ≤12 words, trace i/ii/iii with path:line), and the URL grep result.

## Out of scope
Any id outside the 9 (owners included), retire/fold, iOS, routes, egg_labels.

## OK rough edges
lamb_goat stays thin. A card with 2 tips.

## Ship bar
A claim with no trace; a URL not in the archive; an ESSENTIALS order change; an existing test edited except adding counterReach asks and the ratchet line; "ground beef" landing anywhere but ground_beef_lean_ratio.

Hard cap 60 min. If the same test fails 3 runs in a row, stop and report BLOCKED. Report ≤30 lines, READY or NOT READY. Do not commit or touch git.
