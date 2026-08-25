# Category capture — the field the catalog has never carried

**Status: written and committed 2026-08-08. HELD — not pushed, not applied.**
Approved as server work with its own scope. It cannot be tested on the machine it was
written on (no Node) and `main` auto-deploys, so it sits on the held stack until one of
those changes. See `CLAUDE.md` → Open items.

---

## Why this lands before the feature that needs it

The ruling is **same category, better version**: a bad bar swaps for a good bar, never for
steak. A swap has to know what a thing **is** to know what it can be swapped for.

**Nothing in this repo carries that.** Verified by reading, 2026-08-08:

| looks like the answer | what it actually is |
| --- | --- |
| `scanned_products` | barcode · hash · name · brand · ingredients · source · confidence · tier · counters. **No category column of any kind.** |
| `ismContext().categories` | **INGREDIENT** categories — `seed_oil`, `sugar_alias`, `emulsifier`. What kind of *problem* was found, never what kind of *product* it was found in. |
| OFF's `product.aisle` | A real product category, derived at `scanExtract.js:177`, put on the response — **and then discarded**, because `retainProduct` had nowhere to put it. |

That last row is the best part of this change and the cheapest: **we already receive a
category on every Open Food Facts hit and throw it away.** No extra request, no extra field
on the fetch, no model call. One argument on a function call that is already happening.

### ⚠️ The asymmetry that makes it urgent

**A category cannot be backfilled.**

- A **vision** row's category was knowable only while a model was looking at the package,
  and the photo is never stored (`scan.md` §8, and the rule is real — `multer.memoryStorage()`
  plus `productStore.js` writing `image: null`).
- An **OFF** row's category was on a response we did not keep.

So every scan retained between now and this landing is a row that can **never** answer "what
else is this". Cost today: one migration and one enum value on a call already being made.
Cost later: re-fetching or re-reading the whole catalog, for the rows where that is even
possible. The catalog is at 4 rows — which is the argument for doing it now, not the
argument for waiting.

---

## The vocabulary: closed **and** raw, both

Neither alone works.

- **A free string fragments.** `protein bar` / `energy bar` / `snack bar` / `nutrition bar`
  are four categories to a `group by` and one category to a shopper. A swap engine that
  cannot group them suggests nothing.
- **A closed list alone loses silently.** It will miss things, and the model has no way to
  say so — it picks the least-wrong value and nothing records that it was wrong. That is
  this repo's most expensive failure shape.

So: `category` is the closed vocabulary (26 values, `lib/productCategory.js`) and
`category_raw` keeps whatever the source actually said. **Everything that lands in `other`
stays visible and frequency-rankable**, which makes the list correctable from evidence
rather than from intuition — the same argument `counter_gaps` makes for the counter's
authoring backlog, and the same reason `coverageStats.fromVision` is counted rather than
assumed. Without the raw column, discovering in a year that a third of the catalog is
`other` tells you nothing about what it should have been.

The list is sized to the aisles a **scan** reaches — the labeled half. The counter's
unlabeled half has its own sections and no barcode points at a fish counter.

---

## The four pieces

| # | file | what changes |
| --- | --- | --- |
| 1 | `server/lib/productCategory.js` | **new.** The vocabulary, `normalizeCategory`, the OFF-aisle map, `categoryFields`. One list, both doors. |
| 2 | `server/lib/labelVision.js` | a **fifth** returned field on the vision call, validated against the list |
| 3 | `supabase/product_category.sql` | **new.** `category` + `category_raw` + a partial index. Idempotent, no data write. |
| 4 | `server/lib/productStore.js` | `retainProduct` accepts `category` / `aisle` and writes both columns |
| 4b | `server/lib/scanExtract.js` | the OFF door passes `product.aisle` instead of dropping it |
| 4c | `server/routes/scan.js` | the vision door passes the model's `category` through |
| — | `server/lib/productCategory.test.js` | **new.** Pins the closed list, the `other` collapse, and the order-dependence of the aisle map. |

### Decisions inside it worth not relitigating

- **An unrecognized value collapses to `other`, never to null and never to a guess.** Same
  posture as `PANELS` in `labelVision.js`. `other` plus the raw string says *"we looked and
  it did not fit"*; a null says *"nobody looked"*. Different facts, and only one is
  diagnosable.
- **The OFF aisle map is order-dependent and the order is not alphabetical.** The specific
  sits above the generic it would be eaten by — `energy drink` before `soda`, `nut butter`
  before `butter`, `breakfast cereal` before `bar`. A tidy alphabetical sort would break it
  silently, so the test pins four order traps.
- **The category moves under the same trust rule as the ingredients, and only inside the
  `incomingBeats` branch.** A weaker read overwriting the category is the same defect as a
  weaker read overwriting the list: one cropped photo filed under a known-good barcode would
  retitle the product for everyone. It also may not be written unconditionally — a resolved
  `other` landing on a real value is a silent downgrade.
- **No `CHECK` constraint on `category`.** It would put a second copy of the vocabulary in a
  second language, and the two would drift the moment the list is widened — the migration
  would have to be re-run in lockstep with a deploy, and the failure mode is an insert
  rejected in production for a category that legitimately *is* part of the vocabulary. That
  is the frozen-`tokens.js` shape: a check whose only escape hatch is editing something you
  are not deploying.
- **The insert spells the two columns out rather than spreading them in.**
  `schemaContract.test.js` sweeps inline insert/update literals for top-level keys; a
  `...spread` produces no key, so spreading would write two columns the one check watching
  for undeclared columns is structurally blind to.
- **The category is retained, never returned to the client.** A category on the verdict card
  would be a claim about the product the claim lock never authorised, and no client has a
  use for it.

---

## What this does NOT do

- **It does not build the swap engine.** That is later and deliberately so: a suggestion
  drawn from a handful of rows is not a thin feature, it is an absurd one, and it would be
  absurd in Kristy's voice. The catalog fills as people scan.
- **It does not backfill.** Existing rows stay uncategorised; there is no honest way to give
  them one, and a guess written into a record is worse than a null.
- **It does not touch the ingredient KB, the verdict engine, the claim lock or any tier.**
  Nothing here can change a verdict.

---

## Before this is pushed

1. **Run the tests.** `cd server && npm test`. ⚠️ **`productCategory.test.js` has never
   executed** — Node is not on the machine this was written on, so those assertions are
   source, not evidence. Do not repeat "tests pass" until someone has run them.
2. **`node server/scripts/commitGuard.js`** — this adds files that other files import.
3. **Apply the migration** (`supabase/product_category.sql`) **before** the code deploys, or
   every retain logs `product retain skipped: column ... does not exist` and silently stops
   retaining. It degrades quietly, which is the worst way for it to fail.
4. **Verify the OFF door first**, because it needs no model call: scan a barcode OFF answers
   and read the row back. `3017620422003` is the one the tests use; its aisle should map to
   a real category rather than to `other`.
5. **Then check `other` rate**, and treat it as the authoring backlog it is designed to be —
   `select category_raw, count(*) from scanned_products where category = 'other' group by 1
   order by 2 desc`.

📎 **Step 1 is now DONE and its warning is spent.** Node is on this machine (v26.7.0,
2026-08-10) and `productCategory.test.js` runs: **8 tests, 8 pass**, inside a full server
suite of **623 pass / 0 fail**. Those assertions are evidence now, not source. The warning
is left above because it was true when written and the correction is the useful part.

---

# ⏸ HELD FOR THE SERVER QUEUE — the water widening (proposed 2026-08-10)

**Not implemented. This is a proposal, and it is a SERVER change**, so it gets its own prompt
and its own approval per CLAUDE.md's two-halves rule. Recorded here with its evidence.

## What prompted it

The bottled-water defect in CLAUDE.md's **Live defects**: `6111035002175` comes back
`nutritionPanel:"absent"`, `stamp:false` and the withheld-read sentence, because the product
has no `energy` key. That entry names the fix as *"a second signal — `product_category`"*, and
notes the confusing part: **the category code is shipped on `origin/main` and the defect is
still live.**

## ⚠️ THE FIRST FINDING IS THAT THE WIDENING IS NOT THE FIX, AND ON ITS OWN WOULD CHANGE NOTHING

Two independent gaps, and only the first is the one that was being looked for.

### (A) The vocabulary gap — real, and measured

`PRODUCT_CATEGORIES` has **no water value**, so bottled water lands in `other`. Measured
2026-08-10 by running the live OFF record for `6111035002175` through `categoryFromAisle`:

```
OFF categories_tags : en:beverages … en:waters, en:spring-waters,
                      en:mineral-waters, en:natural-mineral-waters
derived aisle       : "natural mineral waters"
categoryFromAisle   : other
  waters          -> other      sparkling water -> other
  spring waters   -> other      beverages       -> other
  mineral waters  -> other
energy keys in OFF  : []   ← none, which is what makes the panel 'absent'
```

### (B) ⚠️ THE WIRING GAP — bigger, and it is why the migration could never have blocked this

**`category` is WRITE-ONLY today.** Traced 2026-08-10:

- `categoryFields()` is called from **exactly one place**: `productStore.js:202`, the retain
  path. Nothing else in `lib/` or `routes/` calls it.
- `verdictEngine.js:727` is the gate — `unverifiedAsFood = tier === 'approved' &&
  nutrition?.nutritionPanel === 'absent'`. **It never sees a category**, and `verdictEngine.js`
  contains no reference to a product category at all (its `category` hits are KB *ingredient*
  categories — `sugar_alias`, additives — which is the exact confusion `productCategory.js`'s
  own header warns about).

**So the field is being collected correctly and read by nothing.** Applying the migration,
which is done, could not have closed this defect, and neither can adding `water` on its own —
the row would simply be right and unread.

📋 **This document said so itself and nobody joined it up.** *"It does not touch the ingredient
KB, the verdict engine, the claim lock or any tier. Nothing here can change a verdict."* That
was a correct scoping decision when written. It is also, read against the open item, the
statement that **the fix named in Live defects lies outside what was built** — and the two
documents have sat one directory apart saying compatible things that nobody put together.
Same shape as the category-capture-is-held error: two documents, each locally coherent.

## The change, in three parts and in this order

**1. Widen the vocabulary — TWO files, because the list is stated twice.**

- `server/lib/productCategory.js` — add `water` to `PRODUCT_CATEGORIES`.
- `server/lib/labelVision.js:70` — add `water` to the inline list in the prompt.

⚠️ **A one-file change is a red suite, and that is the test working.** `productCategory.test.js`
asserts `PRODUCT_CATEGORIES ⊆ LABEL_VISION_SYSTEM` — *"THE PROMPT AND THE VOCABULARY ARE ONE
LIST"* — so a value the model is never offered fails immediately rather than silently becoming
unreturnable.

**2. Add the OFF aisle patterns**, in `OFF_AISLE_PATTERNS`. ⚠️ **Order is significant and is not
alphabetical** (the file says so). `water` must sit **above** `juice` and `soda_drink`: OFF's
water tags are compound and `sparkling water` must not be eaten by a `soda` pattern. Proposed
entry, placed above `soda_drink`:

```js
['water', ['water', 'waters', 'mineral water', 'spring water', 'sparkling water', 'seltzer']],
```

**3. THE PART THAT ACTUALLY FIXES THE DEFECT — thread the category into the gate.** This is the
one that crosses the boundary this document drew, so it is the one that needs the argument, not
the two above.

## ⚠️ What part 3 must not become

- **It is loosening a FAIL-CLOSED guard, and the guard's comment is right.** *"A wrong approval
  is a gold seal on a cleaning product and a wrong refusal is a missing endorsement."* So the
  exemption is an **explicit allowlist of categories that legitimately declare no energy**, not
  a general "if we know the category, trust the panel". Bottled water is the clear member. Every
  other candidate — `seasoning`, `supplement` — gets argued individually or stays out.
- **The exemption must key on a category the SOURCE asserted, never on one inferred from a
  thin record.** A product with no OFF data lands in `other`, and `other` must never be
  exempt — that is precisely the thin-record case the gate exists for.
- ⚠️ **It must not suppress anything but the withholding.** Same rule the dyed-Dawn entry
  states: flags stand. This only ever restores a verdict WORD to a product that earned it.

## What it needs before it is written

⚠️ **The vocabulary's own widening rule is the gate, and this machine cannot satisfy it.**
`productCategory.js`: *"Do not add a value because it sounds missing; add it because rows are
sitting in `other` asking for it."* The evidence query needs DB credentials this box does not
have (no `server/.env`, no `supabase` CLI, no `psql`) — **the same wall the migration question
hit**:

```sql
select category_raw, count(*) from scanned_products
where category = 'other' group by 1 order by 2 desc;
```

**Water rows in that result are the go-ahead** for part 1. Parts 2 and 3 stand on the OFF
measurement above regardless, and the CLAUDE.md open item's own numbers — 2.7% of the
most-scanned products carry no `energy` key at all, 8.8% at the thin end, **largest single
cluster is water** — are what makes this worth queueing rather than filing.

**`category_raw` is collecting that evidence now**, which is the column doing the exact job it
was added for.

---

## ✅ THE EVIDENCE QUERY HAS NOW BEEN RUN (2026-08-10, live `scanned_products`)

Read-only, service-role, `select` only. **The wall is down** — `server/.env` carries
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` on this box now.

**First result, and it closes a question this document opened: the migration is applied AND the
write path works.** The query returned rather than erroring on a missing column, and rows carry
real values. **Retention is not silently broken.**

**The catalog is 15 rows.** 13 carry `category: NULL` (retained before the columns existed and
**not backfillable**); **2 carry a category, and both are `other`.**

| `category` | `nutrition_panel` | name | `category_raw` |
| --- | --- | --- | --- |
| `other` | `absent` | Sidi Ali | `"natural mineral waters"` |
| `other` | `absent` | Cristaline | `"unsweetened beverages"` |

### ⚠️ BOTH CATEGORIZED ROWS ARE BOTTLED WATER, AND BOTH WOULD MISFIRE

`6111035002175` is in the table in exactly the predicted state — `other` / `absent`. **And it is
not alone: Cristaline is a second bottled water**, landing in `other` by a different raw string
(`unsweetened beverages`, not a water word at all). **So a `water` value plus water-only aisle
patterns would still miss Cristaline** — the OFF tag that reached it was a beverage tag. That is
an argument for the patterns covering the beverage aisle, not only the word "water", and it is
exactly the kind of thing the raw column exists to reveal.

### ⚠️⚠️ THE FIND THAT CHANGES PART 3 — THE PANEL SIGNAL'S OTHER HALF IS SITTING IN THE SAME TABLE

**Four rows carry `nutrition_panel: 'absent'`. Two are the waters. The other two are `Dish Soap`
and `Dawn Platinum Plus Powerwash`.**

**That is the entire problem in one 15-row table.** `absent` is doing two completely different
jobs — *"water, which legitimately declares no calories"* and *"dish soap, which is not food"* —
and **the panel signal cannot tell them apart, which is precisely why it is the thing standing
between Dawn and a gold seal.**

⚠️ **SO PART 3 IS NOT "RELAX THE GATE WHEN WE KNOW THE CATEGORY". THE TWO DISH-SOAP ROWS CARRY
`category: NULL`, AND IF RESCANNED TODAY WOULD ALMOST CERTAINLY CARRY `other`** — the same value
the waters carry. **A rule keyed on "we have a category" would exempt dish soap.** The allowlist
must be *specific values that are food and legitimately calorie-free*, and **`other` and `NULL`
must both be non-exempt, permanently.** This document already said `other` must never be exempt;
the live table is now the evidence for it, and it is stronger than the argument was.

### What this does and does not license

- ✅ **The mechanism is proven**: water reaches `other`, the raw string survives, it is
  diagnosable. Part 1 and part 2 are justified.
- ⚠️ **The FREQUENCY case is not made, and should not be claimed.** Two rows out of fifteen is
  not a frequency ranking — it is a 15-row catalog with 13 pre-migration nulls. **The honest
  justification for widening is the live defect plus the OFF-wide measurement, NOT "the `other`
  bucket shows demand".** Anyone re-reading this later should not inflate n=2 into a trend.
- **Re-run this query once the catalog is larger.** It is the same query; the answer will
  actually rank something.

---

## ✅ PARTS 1 AND 2 ARE SHIPPED (2026-08-10). ⚠️ SO IS PART 3 — CORRECTED 2026-08-12.

> ⚠️ **THIS HEADING READ "PART 3 IS HELD ON AN UPSTREAM QUESTION" UNTIL 2026-08-12 AND IT WAS
> WRONG.** `FOOD_CATEGORIES = new Set(['water'])` sits at `verdictEngine.js:462`, is read by
> `nothingConfirmsFood` at `:481`, and is on **`origin/main`** — it landed inside `22b35a8`, the
> predicate commit. **Three documents carried the held claim** (this one, `CLAUDE.md` and
> `docs/OPEN-ITEMS.md`) and the code disagreed with all three, which is this document's own
> recorded failure repeated on its own subject. Verify by computing, never by reading:
> `git show origin/main:server/lib/verdictEngine.js | grep -n 'FOOD_CATEGORIES = '`.
>
> **What IS still true is that no production row is exempt**, because the waters still read
> `category: other` — the cache-hit finding. The exemption is **live and unreachable**, and the
> cache fix is what turns it on. The current state and every ordering constraint live in
> `CLAUDE.md` **Open items**; that is the authority, not this file.

Committed, not pushed (the stack carries the held import route). Server suite **627 pass / 0 fail**.

**What shipped:** `water` in `PRODUCT_CATEGORIES` and in `labelVision.js`'s inline list, plus the
OFF aisle patterns placed below `energy drink` and above `soda` and `juice`, as specced.

**Measured on the live OFF record**, not asserted: `6111035002175` → derived aisle
`natural mineral waters` → **`water`**. Every water tag on that record (`waters`, `spring waters`,
`mineral waters`, `natural mineral waters`) now maps; the two `beverages` tags still return
`other`, which is correct — they are not a water claim.

### ⚠️ THE PATTERN IS `waters`, NOT THE `water` THIS DOCUMENT PROPOSED

The proposal above named the bare word. Matching is `includes`, so bare `water` also matches:

| aisle | what it really is | what bare `water` made it |
| --- | --- | --- |
| `watermelons` | produce | `water` |
| `water chestnuts` | canned vegetable | `water` |
| `water biscuits` | cracker | `water` |

The plural cannot match any of them — the next character is `m`, ` c`, ` b` — and it is the form
OFF's own tags already use (`en:waters`, `en:mineral-waters`, `en:spring-waters`), so the safe
form is also the accurate one. The singular compounds (`mineral water`, `sparkling water`, …) are
spelled out rather than bought with a substring.

⚠️ **Why this is not a tidiness point.** Part 3 keys on the category to let a product past a
**fail-closed** gate. In that world a watermelon in `water` is not a mis-shelved row, it is a
**wrong approval** — the exact failure this document says the guard exists to prevent. The three
rows above are asserted in `productCategory.test.js`, and the assertion was **proven to fail on
`watermelons`** before it was trusted.

### ⚠️ CRISTALINE IS STILL `other`, AND THE FIX THIS DOCUMENT FLOATED IS THE WRONG ONE

Above, the Cristaline row prompted: *"an argument for the patterns covering the beverage aisle,
not only the word water"*. **Measured against the live OFF record for `3274080005003`, that is the
wrong conclusion — the water evidence is already on the record and the aisle derivation throws it
away:**

```
[0] beverages and beverages preparations → other
[1] beverages                           → other
[2] waters                              → water   ← the answer is right here
[3] spring waters                       → water   ← and here
[4] unsweetened beverages               → other   ← LAST, so this is the aisle we use
```

**`aisleFromCategories` takes the LAST tag on the premise that it is the most specific. That
premise is false.** `en:unsweetened-beverages` is not more specific than `en:spring-waters`; it is
an orthogonal **dietary** axis, and OFF's tag order is not a specificity hierarchy. So the row
lands in `other` while carrying two tags that say `water`.

**Widening the water patterns to swallow `beverages` would be the wrong fix twice over:** it would
not be true (an unsweetened tea is not water), and it would make `water` the beverage catch-all —
in a vocabulary whose whole purpose is to gate a fail-closed exemption.

**The right shape is to map the category from the TAG LIST rather than from the single derived
aisle string**, taking the most specific *mapped* hit rather than the last tag.

✅ **SHIPPED 2026-08-25 — `f82cf9e`, on `origin/held`.** Implemented at `aisleFromCategories` in
`scanExtract.js` rather than at `categoryFromAisle`, which is what kept the input contract intact:
the walk picks the most specific *mapped* tag and hands `categoryFromAisle` a single aisle string
exactly as before, so nothing downstream changed shape. **One producer, two consumers** (the
response's `nutrition.category` and the retain path's `aisle`), so the read and write paths agree
by construction rather than by discipline. The unmapped fallback is unchanged and deliberate: when
nothing maps, the LAST tag still comes back verbatim, because `other` plus the string that failed
is what keeps `category_raw` a rankable backlog.

⚠️ **AND THE PREREQUISITE THIS DOCUMENT DEMANDED WAS HONOURED, WHICH IS THE PART WORTH KEEPING.**
The predicted danger was real and measured: the fix DOES resolve Cristaline to `water`, which IS
the exempt category. It is safe only because `languageConflict` (`aa97026`) landed first and sits
UPSTREAM of the category — the record is refused before a category is ever consulted. Driven live
through the whole gate the same day:

```
3274080005003  aisle "spring waters" → water   languageConflict TRUE  ⇒ conflict, NO STAMP
06175700       aisle "extruded crispbreads" → cracker, conflict       ⇒ conflict, NO STAMP
7622210449283  a genuine translation, unaffected           ⇒ reads swap_recommended
```

📎 **The composition is pinned as its own test** — the aisle resolving to `water` AND the refusal
landing upstream of it, asserted together — because each site reasons correctly alone and no file
owns the sum. ⛔ **If it goes red, do not loosen it: it means a bottle of water is one step from
the seal again.**

📋 **This also generalises past water.** Any product whose last tag is a dietary one — unsweetened,
no-added-sugar, organic — loses its aisle the same way. That is a category-capture defect, not a
water defect, and `category_raw` is what made it visible.

### Stored rows are not rewritten

`categoryFromAisle` runs at **retain** time only, so the two live rows keep `other` until they are
scanned again. Sidi Ali would now be `water`; Cristaline would still be `other`.
