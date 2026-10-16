# Warmth + list-capture plan (Devon, 2026-10-16)

Devon's ask is the approval. Order: W1–W4 build, then a separate session walks the app as
shoppers (several households, full lists) before the next TestFlight.

## Alignment

| Devon said | Piece |
| --- | --- |
| Speaking a list captures about half; items don't isolate | W1 |
| Two of the same on the list → track one | W1 |
| Fruits get "organic on anything with skin" over and over; group like berries | W2 |
| "Organic on anything you eat the skin of" is a general rule, not a card | W2 |
| Farmers-market line is bland; warm, encouraging, Kristy | W3 |
| Meat (and all) section rules too long → a few concise, actionable tips | W3 |
| Cards (beef, sourdough) read like a spec sheet; warmth without repetition or cheese over weeks | W4 |

## W1 — spoken list capture + one row per food (kristy-ios, T2 Astra high)
Facts (scout 2026-10-16): live dictation rows break on a 0.55 s pause or punctuation
(`LiveListDraft.swift:37`, `:120`); unpunctuated runs fall to `ListNameSplitter` vocabulary,
unknown phrases stay merged (`ListNameSplitter.swift:35–86`); spoken text also goes through
server compose, which applies only what the model proposes (`listCompose.js:176`, `cartEdit.js:285`).
`Cart.add` never dedupes (`Cart.swift:334`); compose dedupes exact names only (`cartEdit.js:283`).
- Every food the shopper says becomes a row: deterministic split first; the model can add/remove
  but never silently drops a spoken food. Fixture transcripts (unpunctuated, "and"-joined, fast,
  fillers like "um, we need") with expected rows; ≥95% rows on the fixture set.
- One row per food: normalized name (case, plural, articles) on every add path; a repeat is a no-op.
  No quantity UI (amend already carries "x2").

## W2 — produce: general rule vs cards (server corpus, T2)
- `organic_worth_it_by_type` keeps its question aliases (is organic worth it, dirty dozen…) and
  loses item aliases (apples, onions, potatoes, kale, spinach, lettuce, grapes, kiwi). Each item
  lands on its family card (`produce_apples_pears`, `produce_onions_garlic`, `produce_root_vegetables`,
  `produce_leafy_greens`, `berries_picking`…); grapes/kiwi get a family or an honest miss.
- Produce section rule carries the skin rule; no family card repeats it as its headline.
- `collapseByCard` already groups list rows by card (blueberries + strawberries → one berries card).
- Lint: no two produce cards share a decision opener; `listMatchProbe` 0 wrong.

## W3 — section rules, every section (server `lib/sectionRules.json`, T1)
- `rule` ≤ 70 chars, 2–3 `checks` each ≤ 60 chars, imperative, one action each.
- `beyond` warm and encouraging, second person, true. Farmers market draft:
  "Try the farmers market this week; most of it was picked days ago, not weeks."
  (Devon's "fresher than anything in a store" overclaims; accuracy outranks firmness.)

## W4 — card warmth (server corpus, T2, pilot then batches)
- VOICE_SPEC amendment: warm second person allowed and wanted; still zero first person, no
  exclamation, no praise of the shopper, no stock openers. Lint: an opener shared by >3 cards fails.
- Pilot: meat, bakery, produce `decision`/`cart_pick` (≈60 cards) → Devon reads → remaining sections.
- Claim lock unchanged: warmth is tone; no new claims.

## Gates
npm test, counterCardLint, listMatchProbe 0 wrong, homedraft/runners_compile, critic per piece.
Corpus migrates after W2+W4 land; no TestFlight until the shopper walk session.
