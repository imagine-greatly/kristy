# The seal must not reach a bottle of Dawn — proposal

**Status: PROPOSED, not built.** Server change, its own scope, its own approval
(`CLAUDE.md`, "this repo has two halves"). Written 2026-08-09 against finding **I**
(`kristy-ios/docs/API-FINDINGS.md` §12), which is live in production today.

## The defect in one line

`stamp = tier === 'approved' && ...`, and `approved` means **zero KB entries matched**
(`verdictEngine.js:281`). A detergent matches nothing, so **Dawn Platinum Plus Powerwash
(`0030772117484`) returns `stamp: true`** with the line *"A few ingredients, all real. This is
what food used to look like."*

⚠️ **The collision is designed, so no scoring fix reaches it.** `CLAUDE.md` records as
load-bearing that *whole-food fats are clean because the KB holds no entry for them*, with a
regression test guarding it. **Matching nothing is the signature of the cleanest possible food
and of something that is not food.** The ingredient list cannot separate them and no new KB
entry ever will.

## The ruling this is built under

**FAIL CLOSED.** A wrong refusal costs the shopper a seal and a sentence. A wrong approval is
a gold seal on a cleaning product. ⚠️ **Do not carry the counter's "when in doubt, admit"
across** — that rule exists because a wrongly-refused *question* tells a shopper they do not
belong, and it has been wrong in one direction four times. **This is the inverse case and the
analogy is the most likely way to get it wrong.**

---

## 1. The condition

### The signal is not "no calories". It is "a source that would have said so, did not."

A thing sold to be eaten declares calories. Measured over four products: both Dawns carry only
OFF's *computed* keys (`nova-group`, `fruits-vegetables-…-estimate-from-ingredients`, a derived
`added-sugars`) and **no `energy-kcal` at all**; Nutella carries 52 keys including real energy
and carbohydrate values.

⚠️ **BUT A BARE `energy == null` TEST IS A CATASTROPHE, AND IT IS THE OBVIOUS IMPLEMENTATION.**
`nutritionFromOFF` returns `{ sodium, addedSugar, fiber, caffeine }` — **energy is not extracted
anywhere today** — and the *photo* path discards it on purpose: `labelVision.js`'s prompt says
*"calories, protein, fat and sodium are not wanted."* So on a naive check, **every product read
from a photo, and every authed `/verdict` call that sends no nutrition, loses its seal.** The
fix for a false seal on detergent would strip the seal from every clean food a shopper
photographs.

**So the field is tri-state and the absence has to be attributable:**

```js
// nutritionPanel — WHO SAID SO, not merely what is missing.
//   'present'  a source that publishes energy for food published one
//   'absent'   that same source was consulted and had none          → WITHHOLD
//   'unknown'  nothing that could answer was asked                  → withhold NOTHING
```

| path | today | after |
| --- | --- | --- |
| barcode / OFF | energy never read | `present` if `energy-kcal_100g` (or `energy_100g` kJ) resolves, else `absent` |
| label photo | prompt refuses calories | `unknown` — **unchanged, no regression**, until §5 is taken deliberately |
| authed `/verdict`, no `nutrition` | n/a | `unknown` |

```js
// scanExtract.js — nutritionFromOFF gains one derived field, no extra request.
const energyKcal = num(n['energy-kcal_100g'])
  ?? (num(n['energy_100g']) != null ? num(n['energy_100g']) / 4.184 : null);
return { sodium, addedSugar, fiber, caffeine, nutritionPanel: energyKcal == null ? 'absent' : 'present' };

// verdictEngine.js — beside sugarHeavy, in the same expression, on the same terms.
const unverifiedAsFood = tier === 'approved' && nutrition?.nutritionPanel === 'absent';
const stamp = tier === 'approved' && violated.length === 0 && !sugarHeavy && !unverifiedAsFood;
```

**`!== 'absent'` and never `=== 'present'`.** Requiring `present` makes `unknown` withhold,
which is the photo-path catastrophe above written a second way. The default must be inert.

### It withholds and can never grant

Identical shape to the two levers already in that expression. `verdictEngine.js:640` says it of
sugar: *"Withholding only; it can never grant a seal."* This adds a third term to a boolean AND,
so it **cannot make any product's tier worse, cannot add a flag, cannot manufacture a swap, and
cannot move `universalLayer`.** The strongest thing it can do to a real food is leave it
unstamped.

### What it does to a real food with a thin OFF record

**That shopper loses a seal they would have got.** A genuine food whose OFF entry has an
ingredient list and no nutrition facts returns `approved` with no stamp.

**Acceptable — and here is precisely what they see**, which is the part that makes it
acceptable:

- `tier` stays **`approved`**. No flag, no red, no swap, no warning. Nothing says the product
  is bad, because nothing found anything.
- `universalLayer` stays empty and `hardLines.violated` stays empty.
- They lose the gold seal and gain one sentence (§2).

The cost is a missing endorsement, not a false accusation. **That asymmetry is the whole
argument**: the failure mode of this change is *silence about a good product*, and the failure
mode it removes is *a gold seal on a cleaning product*.

⚠️ **GATE ON MEASURING IT FIRST.** How many real foods in OFF carry ingredients and no energy
is **not known**, and it decides whether this is a rounding error or a visible regression. Run
`scanned_products` (barcode, 4 rows today) and a sample of OFF food categories before shipping.
**If the rate is high, this still ships** — fail closed — but the copy in §2 carries more weight
than expected and should be reviewed against that number.

---

## 2. The copy

⚠️ **THIS IS A WITHHOLDING, NOT A REFUSAL, AND THE COPY MAY NOT OUTRUN THE SIGNAL.** The ruling's
scan answer is *"That isn't something Kristy reads."* **That sentence is not available here.** It
asserts the product is not food; the evidence is that a database had no calorie figure. A real
food with a thin record would be told it is not food, which is a fabricated claim and
non-negotiable #2. Saying the strong sentence on weak evidence is the same error as the seal,
pointing the other way.

**Proposed, in her voice — zero first person, no em-dash aside, half the words:**

> **No nutrition panel on this one. The seal needs a food label behind it.**

It states what is missing, states the rule, and claims nothing about the product. It is exactly
right about Dawn without ever asserting Dawn is not food, and it is honest to the shopper whose
obscure olive oil has a thin OFF entry.

The read above it survives as the factual line it already is:

> **Read all 13. None of them are on the list.**

That was true of the detergent and stays true. What must go is what it was used to *conclude*.

The strong sentence keeps its home: **§4's category signal is a positive observation and can
carry it.** Two strengths of evidence, two sentences, and they must not be collapsed.

### 2a. ⚠️ REVISED 2026-08-09, AFTER LOOKING AT IT — and the copy is the smaller half

**Shipped copy above is correct and reads as a shortfall.** It leads with an absence
(*"No nutrition panel on this one"*), which sounds like a lookup that failed rather than a
standard being applied, and it frames the rule around what *the seal* needs rather than
around what she is willing to stand behind. The ask that produced this revision: **it should
sound like Kristy declining, not like the app failing.**

**Proposed replacement for `why` — one sentence, no apology, no "not supported", no hint that
it is coming later:**

> **The seal is earned on a food label, and this one has no panel to read.**

Why this one:
- **It leads with the standard, not the absence.** That inversion is the entire complaint.
- **"Earned" is non-negotiable #4's own word** — *the stamp is earned*. The refusal speaks the
  product's existing rule rather than improvising an excuse for this scan, which is what makes
  a boundary read as deliberate rather than as a gap.
- **It still claims nothing about the product.** It says what the seal requires and what this
  scan had. The obscure olive oil with a thin OFF record gets the same true sentence.
- Linted clean on `antithesisChime` and `copulaAbstraction`; 16 words, zero first person, no
  em-dash aside.

⚠️ **A CLEAN LINT IS NOT EVIDENCE THE COPY IS GOOD HERE.** Six candidates were run through both
checks and **all six passed, including the one being replaced** — the rules are lexical and this
judgment is editorial. Recording that so the pass is not later cited as a measurement, which is
the *"zero false positives by construction"* trap `copulaAbstraction`'s own header warns about.

⚠️ **THE TEMPTING CANDIDATE, AND WHY IT IS OUT.** *"Kristy stamps food, and food comes with a
panel. This one carries none."* names her, sounds most like her, and **smuggles the forbidden
claim in as an inference**: if food comes with a panel and this has none, the reader concludes
it is not food. That is the copy outrunning the signal by implication instead of by assertion,
which is harder to see and exactly as wrong. Every candidate that mentions what food *has* fails
this way.

⚠️ **AND THE COPY IS THE SMALLER HALF, BECAUSE NOTHING RENDERS IT.** `VerdictResponse` in
`kristy-ios` declares no `unverifiedRead`, so today the sentence is dropped on the floor and the
card reads **"Approved."** over *"That's what's in it…"* over **[ Add to the cart ]** — an
endorsement of dish soap with the gold seal removed and nothing else changed. **Rewording this
field changes nothing a shopper sees until the client decodes it**, so the wording and the
decoding ship together. Full render and evidence: `kristy-ios/docs/SWIFT-HANDOFF.md` §3, item 0f.

**Not proposed: a change to `checked`.** *"Read all 12. None of them are on the list."* is the
endorsement sentence reused on the withheld card, and it does read as praise the `why` then
retracts. It is also **true**, and the alternative is a second sentence about the product on a
card that just declined to make one. Flagged, not changed — and it should be decided with the
render in hand rather than from the field list.

---

## 3. The education line and `approvedRead` — both currently narrate surfactants as clean food

Neither is cosmetic. Both are the endorsement.

**`education` → suppressed.** The live response carried `clean_label`: *"A few ingredients, all
real. This is what food used to look like."* about dipropylene glycol butyl ether. It is keyed
off the approved tier, and **approved-without-a-panel is not a clean-label claim**. When
`unverifiedAsFood`, no education line renders. Not a replacement Kristy-ism — the absence.

**`approvedRead` → `null`, and a new field carries the withheld read.**

```js
approvedRead:   unverifiedAsFood ? null : (tier === 'approved' ? buildApprovedRead(raw) : null),
unverifiedRead: unverifiedAsFood ? { checked: '…', why: 'No nutrition panel on this one. …' } : null,
```

⚠️ **`approvedRead` GOING NULL IS THE LOAD-BEARING HALF, AND IT IS ABOUT OLD CLIENTS.** Keeping
it and adding a sibling flag means **every already-shipped client renders the endorsement
unchanged** — it does not know the new field exists. A client cannot fail closed on a field it
has never heard of. Nulling the old one degrades correctly on every build ever shipped: they
render nothing where they used to render the seal's justification.

`approvedRead.names` is the specific defect — it reads the surfactants back **as the evidence of
cleanliness**. `checked` is defensible and can carry over into `unverifiedRead`; `names` does
not come with it.

---

## 4. `categories_tags` — land it, but not as this fix

**It is a different signal supporting a different sentence, and that is the reason to want it.**

| | evidence | what it supports |
| --- | --- | --- |
| no nutrition panel | an **absence** in a record | withhold the seal · the soft sentence (§2) |
| `en:dishwashing-liquid` | a **positive observation** | refuse the read · *"That isn't something Kristy reads"* |

**Worth landing alongside: yes.** It is the only signal that can deliver the ruling's actual
answer, and it costs nothing — `aisleFromCategories` already derives it (`scanExtract.js:177`),
the response already carries it as `product.aisle`, and `retainProduct` throws it away for want
of a column. `docs/CATEGORY-CAPTURE.md` already proposes exactly this, and **finding I is a
second and stronger justification than the same-category swap it was written for.**

⚠️ **It is NOT the fix and must not be mistaken for one. Measured: it gates 1 of 3.** Mrs.
Meyer's carries `en:dishwashing-liquid`; **both Dawns carry `categories_tags: []`.** Ship
category capture alone and the product that produced this finding **is still stamped.** OFF's
`product_type` is worse than useless — it says `food` for all three detergents.

**Order:** §1 is the fix and ships first. Category capture ships on its own merits and adds the
strong refusal where the tag exists. Neither waits for the other.

---

## 4a. ⚠️ The scope boundary this sits inside — ruled 2026-08-09

Recorded so the question is not re-opened every time the silence looks like a gap, and
because it is the reason §4 stops where it does. **Kristy is food and food-adjacent only.**

**Future scope, if any: cookware, storage, water filters, foil, parchment** — the things food
*touches*, judged with the same whole-food logic one step out. **Not household cleaners, not
cosmetics, not general grocery.**

- **The moat is hand-authored and does not transfer.** Measured: **81 curated counter cards,
  74 ingredient entries**, plus the tier system, the claim lock and the lint on top of them.
- **The honest answer for cleaners is usually "it doesn't matter much"** — a KB whose truthful
  output is a shrug makes the app thinner for having it.
- **The purchase frequency is wrong for a habit.** The list retains because groceries are
  weekly; dish soap is bought every few months.
- ⚠️ **It is the fight Yuka picked and lost.** A mediocre score in a second category does not
  add a category — **it discounts the first one.**

**What this means for §1:** the gate is not a step toward scoring cleaners and must never be
built as one. It exists so the seal stays inside the category the corpus can stand behind.
Full statement in `CLAUDE.md` under "The list is the shopper's".

---

## 5. Deliberately out of scope

**Asking vision for calories.** It would give the photo path the same signal and make the gate
uniform instead of `unknown` on one door — and there is a precedent *inside the guard that would
have to change*: `labelVerdict.test.js` whitelists `sugarsG`/`servingG` and explains they were
"added for the seal gate", are "copied off a printed panel", and "can only ever withhold a seal,
never grant one." **Energy would be the third field on identical terms.**

That same comment is why this is a separate decision and not a line in this proposal: *"calories,
protein, fat and sodium have no consumer in this codebase, and **a field with no consumer is
where the next claim gets in**."* This proposal would give calories a consumer, which is exactly
the argument that unlocks it — and exactly the argument that deserves its own scope rather than
riding in on a fix for something else.

It also needs a distinction the barcode path does not: *"there is no Nutrition Facts panel on
this package"* and *"I could not read one in this photo"* are different facts, and only the first
is evidence. That is the `panel: full|partial|none` pattern the ingredient read already uses,
applied a second time.

---

## 6. Verification, and it can now actually run

⚠️ **NODE IS INSTALLED ON THIS MACHINE AS OF 2026-08-09.** `brew install node`, no sudo, under a
minute — Homebrew was already at `/opt/homebrew/bin/brew` and simply not on the non-interactive
shell's `PATH`. **The premise that blocked the entire held stack was wrong**, and it was written
down in two `CLAUDE.md` files as a fact about the machine.

What to run:
- `cd server && npm test` — **596 tests, 594 passing** as of this writing (see §7).
- New unit coverage owed by §1, each verified to fail on the defect it names:
  - `nutritionPanel: 'absent'` withholds the seal at `tier === 'approved'`.
  - `'unknown'` withholds **nothing** — the photo-path regression, pinned in the direction that
    matters.
  - It can never change `tier`, `universalLayer`, `hardLines` or `swap`.
  - `approvedRead` is `null` whenever the seal is withheld this way (the old-client rule).
- The live proof, against production once deployed: `0030772117484` must return `stamp: false`,
  and `3017620422003` (Nutella) must still return its normal verdict with the panel present.

---

## 7. Two tests were already failing, and nobody could have known

Running the suite for the first time turned up **2 failures, both in the held stack, neither
caused by this proposal**:

1. **`vision returns identity + list + panel completeness, and no judgment`** —
   `unexpected field from vision: category`. The held category-capture commit (`8be5978`) added
   the fifth `category` field to the vision contract and **did not add it to that test's
   whitelist**. The guard is working: it is a whitelist over the vision contract, written
   because *"a field with no consumer is where the next claim gets in."* Whether `category`
   belongs on that list is a real decision about the contract — it is a description of the
   product, never a judgement, which is the argument for admitting it — and it is **not made
   here**.
2. **`the generated shapes file is not stale`** — mechanical. The held commits changed route
   responses; `node server/scripts/buildApiShapes.js` regenerates. ⚠️ Note finding **B**: that
   script drops nine handler bodies (`buildApiShapes.js:154`), so **fix B first or the
   regeneration bakes the loss in.**

**Neither is fixed here.** They are held-stack decisions and a finding is not a fix. But they
retire the assumption the hold rested on: the held code was believed untested-but-probably-fine,
and **it is not fine — it breaks an existing guard.**
