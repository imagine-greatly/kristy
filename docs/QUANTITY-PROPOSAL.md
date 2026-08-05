# Quantity on a list row — DECIDED: DEFERRED

> ## ⛔ Decided 2026-08-05: NOT NOW. Do not relitigate this from intuition.
>
> **Quantity is a display feature, not an intelligence one.** It cannot make a list fit a
> family, which is the only reason it was wanted. Two measurements decide it, both in §2:
>
> 1. **Handed the household explicitly** (`{adults:2, kids:4}` vs `{adults:1, kids:0}`),
>    **5 of 6 overlapping items came back identical** — a household of six and a household
>    of one were both told to buy **1 dozen eggs** and **5 lbs of potatoes**. The model treats
>    an amount as a property of the food, not of the household.
> 2. **Three identical calls returned 11, 12 and 14 items**, with different amounts for the
>    same food (`2 boxes pasta` / `2 boxes` / `1 lb pasta`). The amount is not stable, so
>    nothing can key off it.
>
> **And the cost is a third interaction kind** on a surface that has only ever checked and
> deleted — no text entry anywhere, 44px targets sized for one-handed use with a trolley
> (§6).
>
> **If it comes back, it comes back with deterministic scaling in code** — a one-person base
> amount multiplied by headcount, rather than the model scaling it. That is the ONE argument
> for a structured `qty`+`unit` schema over the free string this proposal otherwise
> recommends, because multiplying "1 dozen" requires parsing it. **Measure deterministic vs
> prompt-driven scaling BEFORE choosing the shape.** Everything below stands as the record of
> what was measured; the recommendation in §1 is conditional on that measurement, not
> settled.
>
> **Headcount stays out of onboarding until something can scale with it.** Capturing a fact
> the output visibly ignores is the failure mode named for photo import: the server writing
> copy that tells the shopper to tap something that does not exist.
>
> **Done instead:** the equipment fact (§7) — no quantity work, no dependencies, and the
> thing that made the student's list good in the audit.

Written 2026-08-05. **Report only, nothing built.** Follows the list-creation audit
(`LIST-CREATION-AUDIT.md` §C), which found that a family of five gets 7 rows and a student
gets 10 because no row can carry an amount, and that **headcount is useless until one can.**

Every number below is measured. The compose runs are the shipping `LIST_COMPOSE_SYSTEM` with
an amount clause appended and the household passed in the payload; nothing in the repo was
modified to produce them.

---

## 1. What a row carries: a free string, in its own field

**The model's natural amount vocabulary is wider than any enum, and one of its best answers
is not a number at all.**

Measured over four generations, the units it reached for unprompted:

> `2` (bare) · `1 loaf` · `2 loaves` · `1 package` · `1 dozen` · `2 dozen` · `1 gallon` ·
> `3 lbs` · `1 lb` · `1 box` · `2 boxes` · `1 jar` · `2 jars` · `1 container` · `2 cans` ·
> `1 head` · `1 bunch` · `1 bottle` · `1 pack` · **`as needed`**

`as needed` was the amount for "Salt and pepper", and it is **correct** — nobody buys a
quantity of salt and pepper for a week. Given the structured schema instead, the model was
forced to emit `1 pack` for the same row, which is wrong. **The enum did not prevent a bad
amount; it prevented an honest one.**

And the enum leaked anyway. Handed an explicit 14-value list
(`each·lb·oz·bunch·dozen·pack·can·jar·loaf·head·bag·container·gal·qt`) it returned
**`bottle`** on the first run — off-enum, for olive oil, where `bottle` is obviously the
right word and the omission was mine.

| | free string | `qty` + `unit` enum |
| --- | --- | --- |
| coverage | **27/27 items** across 5 runs | **25/25** across 2 runs |
| off-vocabulary | n/a | 1 (`bottle`), run 1 |
| can express "as needed" | yes | **no** — forced to `1 pack` |
| length | 1–11 chars | — |

**Recommendation: `amount`, a free string, capped (12 chars is above the measured max of 11),
sanitized on the enum-free pattern `sanitizeList` already uses for `why` and `alt`.** A
rigid schema fights how groceries are actually counted, and the thing it buys — arithmetic
on the amount — is not something any surface needs. Nothing sorts, sums or compares
quantities; the row displays it and the shopper reads it.

**The claim-lock consequence is nil and worth stating.** An amount is a grocery fact of the
same class as a name — no health claim, no statistic, no price — so it needs no whitelist
widening. It does need one guard: `NO PRICE, ever` (non-negotiable #8) must extend to the
amount field, because "2 lbs" and "$8 worth" are the same shape of string.

## 2. Can the model produce it reliably? Yes. Can it SCALE it? No.

Coverage is not the problem: **100% of items carried an amount in every run**, sections
stayed valid, no price appeared in any amount.

**Scaling is the problem, and it is the finding that matters** — because scaling is the
entire reason headcount would be captured. With `household: {adults:2, kids:4}` versus
`{adults:1, kids:0}` **in the payload**, comparing the same food across the two lists:

**Free string — 5 of 6 overlapping items identical:**

| item | 5-person household | 1-person household |
| --- | --- | --- |
| Eggs | 1 dozen | **1 dozen** |
| Apples | 3 lbs | **3 lbs** |
| Carrots | 2 lbs | **2 lbs** |
| Potatoes | 5 lbs | **5 lbs** |
| Peanut butter | 1 jar | **1 jar** |
| Pasta | 1 box | 1 lb *(a unit change, not a scale change)* |

**Structured — 3 of 5 scaled:** sweet potatoes 3lb→2lb, carrots 2lb→1lb, eggs 2 dozen→1
dozen; rice (2lb) and butter (1lb) did not move.

So a household of six and a household of one were told to buy **the same dozen eggs and the
same five pounds of potatoes.** The model treats the amount as a property of the food, not of
the household, most of the time. (n is small — 11 comparisons — so read this as "does not
reliably scale", not as a rate.)

**And the amount is not stable.** Three identical calls returned 11, 12 and 14 items, and the
same food got different amounts: `2 boxes Whole wheat pasta` / `2 boxes` / `1 lb
Whole-wheat pasta`. **Nothing may ever key off an amount.** That is an argument for the
separate field on its own.

**Aside, a real defect found in passing and not part of this proposal.** All four
budget-constrained runs put the word **"cheap"** in the summary — "Cheap protein and carbs
that cook together" — and `LIST_COMPOSE_SYSTEM` forbids exactly that: *"never a dollar figure
or a 'cheap/expensive' label on the item."* `listCompose.livetest.js` already greps for
`\bcheap(er)?\b`, so the check exists and no case exercises it with a `budget` constraint.
Reproduced 4/4.

## 3. What breaks — measured, and the answer is: only if it goes in the NAME

Every one of the five keys off the name, as suspected. Testing bare name vs
quantity-folded-into-name:

| | bare | with amount in the name | verdict |
| --- | --- | --- | --- |
| **`canonicalItem`** (blend dedup key) | `"chicken thighs"` | `"lbs chicken thighs"` | **5/5 keys DIFFER** |
| | `"eggs"` | `"dozen eggs"` | |
| | `"marinara sauce"` | `"jars marinara sauce"` | |
| **`listBaseline`** `kept` frequency | keyed on `canonicalItem` | same fragmentation | **every stored shopping profile resets**, and "2 lbs chicken" vs "3 lbs chicken" become two staples |
| **`rowMatch.words`** | `["chicken","thighs"]` | `["dozen","eggs"]`, `["jars","marinara","sauce"]` | **4/5 gain a content word** |
| **`rowMatch` end to end** | match | **NO MATCH** | **3 of 4 matching rows stop matching** — a scan can no longer tick the row off |
| **`matchItemToCard`** | `egg_labels` | `egg_labels` | **unaffected, 5/5** |

Two details worth having:

- **`rowMatch` is already half-hardened, which is why this is subtle.** Its `STOP` set holds
  `oz, lb, lbs, g, kg, ml, l, ct, pack, size, count` and `words()` matches `[a-z][a-z-]{2,}`,
  so digits and weight units vanish cleanly — `"2 lbs Chicken thighs"` still matches. It is
  **count and container units** that break it: `dozen`, `bunch`, `loaves`, `jars`, `box`,
  `container`, `bottle`, `gallon`. So a name-folded quantity would work in testing and fail
  on eggs, bread and sauce.
- **`matchItemToCard` survives because aliases are matched by whole-phrase containment** — a
  prefix cannot break containment. That is the one place the name can absorb a quantity, and
  it is not enough to justify doing it.

`canonicalItem` also carries a warning already recorded in CLAUDE.md: *"`listBaseline` keys
`kept` frequency on the NAME so renaming resets every stored shopping profile."* Folding an
amount in is a rename of every row.

## 4. Beside the row, never in it

**A separate `amount` field on the cart row.** It is strictly safer for all five consumers:
four of them read the name and would need per-consumer stop-lists (a second vocabulary, and
this repo has been bitten five consecutive times by exactly that), while a separate field
they simply do not read is unbreakable by construction.

What it needs:

- `sanitizeList` — one more optional field, same shape as `why` / `alt`. It must **survive
  the round-trip**, or the amount vanishes when the shopper checks a box.
- The compose contract — `{ name, section, amount }`, `parseComposeJSON` accepting and
  capping it.
- **`buildNextTripList` must decide whether an amount is a grocery or a spent artifact.**
  The existing rule: a seeded row keeps `why`/`perimeterId`/`alt` and drops `tier` and the
  offer set. An amount is a grocery — you buy a dozen eggs every week — so it should
  **carry**, unlike a verdict. But if headcount later drives it, a carried amount is a
  *stale* computation, and re-deriving is the same argument that strips `cardSlug`. **This is
  the one open question in the proposal and it should be decided before anything is built.**
- `listImport.js` — vision is currently instructed to **drop** quantities ("2 lbs chicken" →
  "chicken"). With a field to put them in, that instruction is wrong, and changing it is a
  prompt edit plus a new field on the transcription shape. Not free, and it is where the
  shopper's own written amount would come from.

## 5. Rendering at 390px: the slot exists and is contested

`CartRow`'s head is one flex row: **44px tap target · flexible `rowBody` · optional
`catLabel` · 40px remove button**, with `padding: '3px 11px 3px 4px'`. At 390px that leaves
roughly 291px for the body and any trailing element.

`catLabel` is the precedent and the problem. It already occupies a trailing inline slot —
`fontSize: 9.5`, uppercase, `flex: '0 0 auto'`, `alignSelf: 'center'`, `whiteSpace: 'nowrap'`
— and adds no line. An amount can do the same thing on the same axis.

**But they compete exactly where it hurts.** `catLabel` renders only when
`!item.cardSlug && TRAILING_LABEL(item)` — i.e. on **unmatched** rows, which are also the
only rows that keep their `why`. So a matched row has the trailing slot free, and an
unmatched row would carry name + `why` + category label + amount on a 291px body. That is
the case to measure, and the composed-list numbers say it is tight: `composed.mjs` measured
**6.10 lines per matched row** after the double-prose fix, page 2002px.

Two shapes worth putting in front of the design review, neither built:

- **Leading, before the name** — `2 lbs · Chicken thighs` inline, one text node, no new flex
  child, and it reads in the order a shopper says it. Risk: it pushes the name right and the
  name is the row's subject.
- **Trailing, beside `catLabel`** — reuses the established slot and treatment. Risk: it
  inherits `catLabel`'s 9.5px, and an amount is functional text a shopper acts on, not a
  quiet tag. 9.5px at `textMuted` also needs the contrast check that killed the 50%-opacity
  demotion in shop mode.

**Shop mode inverts the type** (do line 17.5px lead, name demoted to an 11.5px eyebrow), so
the amount's slot there is a separate decision, not a free inheritance. `shop.mjs` and
`cart.mjs` both need a case.

## 6. What a shopper edits — and this is the largest unbudgeted piece

**The cart today supports exactly two row interactions: check and delete.** Both are single
taps with no text entry, and the 44px target exists because it is used one-handed with a
trolley. An editable amount is a **third interaction of a new kind** — a tap that opens
input, on a surface with no inline editing anywhere.

The options, unranked because this is the design review's call:

- **Not editable at first.** The amount is Kristy's suggestion; the shopper reads it and
  buys what they buy. Cheapest, and consistent with the row being a record rather than a
  form. But an amount you cannot correct is an amount you learn to ignore, and a wrong one
  ("1 dozen eggs" for six people) is exactly what §2 says will happen.
- **Stepper.** Two 44px targets per row. On a 291px body, beside a name, a `why` and a
  category label, at 390px — the geometry is almost certainly not there.
- **Tap the amount → the existing add-row input, pre-filled.** Reuses `submitAdd`'s field
  and needs no new control. Closest to the surface's current vocabulary.

**Whatever is chosen, it is a real interaction-design item and it should be scoped
separately from emitting the amount.** Emitting it is a field and a prompt clause; editing
it is a new interaction on the most-used surface in the app.

---

## 7. What headcount could then do, and whether the three facts still earn their place

**Headcount unblocks, but it does not deliver — because §2 shows the model does not scale
reliably even when told.** Handed `{adults:2, kids:4}` explicitly it still prescribed one
dozen eggs and five pounds of potatoes to both households. So capturing headcount and
passing it to the same prompt would produce **a captured fact that is visibly ignored**,
which is worse than not asking: it is the shape of defect the audit named for photo import
("the server writes copy telling the shopper to tap something that does not exist").

That changes what headcount is for. Two honest uses, in order of confidence:

1. **Deterministic scaling, in code, from a per-item base amount.** The model emits a
   one-person base; the row multiplies. This is checkable, testable, and cannot drift — the
   same reasoning that keeps `decision`/`why`/`cart_pick` out of `sanitizeForModel`. It also
   makes the free-string choice harder: multiplying "1 dozen" needs parsing, which is the one
   argument for the structured schema. **Worth measuring before committing to either.**
2. **Prompt reinforcement plus a test.** Keep it in the model, and pin it: same instruction,
   two households, assert the amount differs on scalable staples. That test does not exist
   and would fail today.

**Do the three onboarding facts still earn their place? Two do, one is downgraded.**

- **Headcount — YES, and it is now the only one that needs a number.** It is the fact that
  fixes the measured 7-rows-for-five-people inversion, and nobody retypes their household
  weekly. But it must land **with** a scaling mechanism, not before one.
- **What you cook in (one pan / oven / full kitchen) — YES, and it is the strongest of the
  three.** It needs no quantity work at all. It is what made the student's list good in the
  audit, it arrived only because they typed the words "one pan", and nothing stored it. It
  pays off on the very next trip. **This is the one to do first, and it is independent of
  everything above.**
- **How much you cook (three-way) — DOWNGRADED to a fix, not a new fact.** `short_on_time`
  already exists and compose already honours it; the audit's complaint was that "no time"
  and "one pan" collapse into one bit and that `no_kitchen` is a wrong third option. That is
  a refinement of an existing chip row, not a new fact to capture, and it should ride along
  with the equipment fact rather than being argued for separately.

**Suggested order, all still report-gated:** equipment fact (standalone, no dependencies) →
decide the seeded-row question in §4 → measure deterministic vs prompt-driven scaling →
then the `amount` field, and only then headcount.
