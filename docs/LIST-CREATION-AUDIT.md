# List creation — audit A–E

Run 2026-08-05, against `main` at `fcad019`. **Report only. Nothing built, nothing designed,
no product code touched** (`git status` clean before and after). This is item 1 of
`PASS3-HANDOFF.md` §14.

Everything below was either read off the source or **measured by running it**. Where a claim
is a run, the probe and its output are quoted. Where something could not be verified from
this machine, it says so instead of guessing — §14 asked for that explicitly on voice.

---

## The one-paragraph answer

**The compose engine already refines.** `mode: 'edit'` takes "no seafood" against an existing
list and returns a removal, not a rebuild — measured, below. So refinement is **not** the core
work; the core work is that **nothing in the product can reach it.** There is exactly one
compose call site in the entire client, it hardcodes `mode: 'build'`, and it only renders while
the list is **empty**. Of the four inputs the queue names, **exactly one works on production
today** — typing, into an empty list. Photo is unreachable *and* its endpoint is broken by a
one-word typo. Voice does not exist. "Same as last week" can never render for a guest, and
§13.1 means every visitor is a guest.

---

## A — Compose as it stands

### A1. `/api/list/compose` is two-mode, and the edit mode is genuinely iterative

`server/routes/list.js:273`. Body is `{ instruction, mode?: 'edit' | 'build' }`, defaulting to
`edit`. `requireAuth`, then a **budget not a gate** (`listComposeLimited`, 12/day for free
callers, premium exempt).

The model call is one shot and claim-safe by construction: `composeListEdit` returns only
`{ add: [{name, section}], remove: [name], summary }`, and `lib/cartEdit.js` applies it in plain
code. Then the branch at `list.js:313`:

```js
const list = mode === 'build'
  ? buildCart(current, add, { goal, summary })      // replaces
  : applyCompose(current, { add, remove }, { instruction });  // edits in place
```

`applyCompose` (`cartEdit.js:122`) keeps every current row unless the model named it in
`remove`, then appends the additions. **It does not rebuild.** Measured, over a 9-row list
(`Rotisserie chicken · Wild-caught salmon fillets · Frozen shrimp · Brown rice or pasta ·
Frozen broccoli · Eggs · Whole-grain bread · Apples · Cheddar cheese`), profile
`family + picky_kids + short_on_time`:

| instruction | `remove` | `add` | rows after |
| --- | --- | --- | --- |
| `no seafood` | salmon, shrimp | — | 9 → **7** |
| `the kids will not eat fish` | salmon, shrimp | — | 9 → **7** |
| `take the salmon off` | salmon | — | 9 → **8** |
| `make it cheaper` | salmon, shrimp | whole chicken, dried beans/lentils, seasonal fruit in bulk | 9 → **10** |
| `nothing that needs an oven` | — | sweet potatoes, carrots, butter | 9 → **12** |

Four of five are correct refinements against the list in front of it. So:

> **Refining does NOT rebuild from scratch. The engine is not the feature work — the wiring
> is.** Everything in §14 item 3's ordering ("iterative compose first") is already built
> server-side and has never once run for a shopper.

The fifth row is a real content defect and it is the interesting one: **"nothing that needs an
oven" is a constraint, and the only vocabulary compose has is add/remove, so it answered a
restriction by ADDING three items** — and left the salmon fillets on the list under a summary
reading "No-oven meals". It also violates the prompt's own `DO NOT PAD`. A restriction the
schema cannot express gets answered in the one shape it can.

### A2. Nothing in the UI can reach `mode: 'edit'`

Traced end to end:

- **One compose call site in the whole client.** `grep -rn "cart.compose\|\.compose\b" client/src`
  returns exactly `TripQuestion.jsx:50` → `cart.compose(answer, 'build')`. Hardcoded.
- **`TripQuestion` renders only when the list is empty.** `Dashboard.jsx:239` gates it on
  `st === 'empty' || st === 'completed'`, and `dashboardState` (`Dashboard.jsx:51`) returns
  those two only when `cart.progress.total === 0`.
- **Once one row exists there is no text input at all.** `CartMoment`'s only textual
  affordance is `+ Add an item` → `submitAdd` → `cart.add(name)` (`CartMoment.jsx:340`): a
  literal row append, no model, no instruction.
- **The other door is unreachable in production.** `routes/chat.js:219` has a real cart branch
  behind `looksLikeCartCommand`, on `/api/chat` (`requireAuth`). Per §13.1 every visitor is a
  guest, and `/api/guest/chat` has **no cart branch** — `routes/guest.js` imports
  `looksLikePerimeterQuestion` and `looksLikeCounterQuestion` and nothing else. A guest typing
  into the docked composer gets a conversational reply.

> **The `edit` half of a working engine has never executed for a real shopper, and the `build`
> half is only offered while there is nothing to refine.** This is the same shape as §13.1/13.2:
> the capability is present, correct, tested, and not connected.

### A3. Three defects that go live the moment refinement is wired

These are latent today *because* nothing reaches `edit`. They are not hypothetical — each was
measured.

**(a) `applyCompose` cannot honour a category instruction on the shopper's own rows.**
`OWNED = new Set(['user','imported'])`; an owned row survives a removal unless
`namedInInstruction(instruction, name)`, which needs a ≥3-char non-stopword **from the row
name** to appear in the instruction. "no seafood" shares no word with "Wild-caught salmon
fillets". Measured, same model output applied to the same names at two sources:

```
mode='edit'  "no seafood"   remove: ["Wild-caught salmon fillets","Frozen shrimp"]
  applied over source='template':  7 rows   REMOVED: [salmon, shrimp]
  applied over source='user':      9 rows   REMOVED: none
```

The spine rule this implements is right and should stay — "make this healthier" must not empty
a cart. But it means a refinement **works on Kristy's list and silently no-ops on the
shopper's own**, which is the reverse of what a shopper would predict, and the typed/imported
list is the one people care most about.

**(b) The summary claims the removal happened anyway.** In that second run the returned
summary was:

> "Seafood out. Rotisserie chicken, eggs, and cheese cover protein for quick family meals."

…with both seafood rows still on the list. `/api/list/compose` returns the model's `summary`
verbatim (`list.js:328`) and `CartMoment.jsx:378` renders it in Kristy's voice. The guard for
this already exists — `describeCartResult` (`chat.js:139`), whose comment is exactly right
("It reads the FINAL list, so it can only describe rows that really exist — it never claims an
item it didn't add") — but `chat.js:272` is `summary || describeCartResult(list, mode)`, so it
runs **only when the model returned no summary at all**. The honest-summary discipline is a
fallback, not the path. Same family as every other invariant-in-a-comment in this repo:
the sentence is true about a function that almost never runs.

**(c) `cartCommandMode` picks the destructive mode for every refinement phrasing, and it
destroys the list.** Measured:

```
"no seafood"                    cartCommand=false  mode=build
"the kids will not eat fish"    cartCommand=false  mode=build
"take the salmon off"           cartCommand=false  mode=build
"make it cheaper"               cartCommand=false  mode=build
"nothing that needs an oven"    cartCommand=false  mode=build
```

`cartCommandMode` returns `'build'` unless `EDIT_LEAD` matches, and `EDIT_LEAD` is
`^(add|put|remove|delete|drop|swap|replace|cross|toss|take off)` — anchored, so even "take the
salmon off" misses it. Then:

```
mode='build'  "no seafood"   ADD: []      (correct — there is nothing to add)
RESULT: 0 rows (was 9)
```

`buildCart` carries forward only `swap` and `scan` rows, so a refinement that correctly
proposes no additions **wipes the cart to zero**. It is unreachable today only because
`looksLikeCartCommand` returns `false` first for all five strings. That is two gates that have
to agree with no test binding them — precisely the `looksLikeCounterQuestion` vs `inScope`
defect recorded in CLAUDE.md, where one was fixed and the other was not.

---

## B — The two lists, verbatim

`composeListEdit` as it ships, `mode: 'build'`, empty list, no staples, Haiku 4.5
(`lib/anthropic.js:12`). Each persona run twice: **bare** (what a shopper who skipped
onboarding actually has) and with the **closest profile the taxonomy can express**.

### Parent, four kids, no time, wants them to eat it

Instruction typed: `I have four kids, no time to cook, and they actually need to eat it`

**A1 · bare profile** — no goals, no constraints, no staples

> **Summary:** "No-cook proteins and real carbs: rotisserie chicken, sweet potatoes,
> whole-grain bread, eggs, yogurt. Frozen veg and fruit round it out."

```
[Meat & Seafood]  Rotisserie chicken
[Produce]         Sweet potatoes
[Frozen]          Broccoli or carrots, frozen
[Bakery]          Whole-grain bread
[Produce]         Apples or bananas
[Dairy & Eggs]    Eggs
[Dairy & Eggs]    Plain whole-milk yogurt
```

**A2 · best available profile** — goal `family`, constraints `picky_kids` + `short_on_time`

> **Summary:** "No-prep proteins and sides four kids will eat: rotisserie chicken, rice or
> pasta, frozen veg, eggs, bread, fruit, cheese."

```
[Meat & Seafood]  Rotisserie chicken
[Pantry]          Brown rice or pasta
[Frozen]          Frozen broccoli
[Dairy & Eggs]    Eggs
[Bakery]          Whole-grain bread
[Produce]         Apples
[Dairy & Eggs]    Cheddar cheese
```

### College student, no money, one pan

Instruction typed: `college student, no money, one pan`

**B1 · bare profile**

> **Summary:** "One-pan staples: lentils, rice, canned tomatoes, onion, garlic, eggs, butter.
> Cheap protein and carbs that cook together."

```
[Pantry]        Dried lentils or split peas
[Pantry]        Brown or jasmine rice
[Pantry]        Canned tomatoes
[Produce]       Onions
[Produce]       Garlic
[Dairy & Eggs]  Eggs
[Pantry]        Butter or oil
[Pantry]        Salt and pepper
```

**B2 · best available profile** — constraints `budget` + `cooking_for_one`

> **Summary:** "One-pan staples: lentils, rice, eggs, oats, peanut butter, canned tomatoes,
> onions, carrots, fruit. Cheap, filling, minimal equipment."

```
[Pantry]        Dried lentils or split peas
[Pantry]        Brown or jasmine rice
[Pantry]        Canned tomatoes
[Produce]       Onions
[Produce]       Carrots
[Dairy & Eggs]  Eggs
[Dairy & Eggs]  Butter
[Pantry]        Oats
[Pantry]        Peanut butter
[Produce]       Apples or bananas
```

### What this measures

**Generation is in better shape than the framing assumed.** The two lists are genuinely
different — different sections, different protein strategy (pre-cooked vs dried), different
starch, and the student's list is built around things that cook in one vessel. Nothing is
padded, no price appears, no health claim appears, no brand is invented, every section is
valid. The prompt's `THE SHOPPER DRIVES` rule is doing real work.

**The profile adds almost nothing, because the sentence already said it.** A1→A2 changed three
rows and kept the same shape; B1→B2 added two and swapped garlic for carrots. The instruction
carries the household context; the stored constraints mostly re-state it. That is worth
knowing before designing anything around onboarding: **the marginal value of a stored fact is
only in what a shopper would not bother to retype.**

**The one hard failure is scale, and it is measurable.** The family of five or six gets
**7 rows**. The single student gets **10**. Nothing in the pipeline knows how many people are
being fed, so the biggest household on the list gets the smallest cart. And there is **no
quantity concept anywhere** — not in `SECTIONS`, not in the compose schema, not on a cart row
(`sanitizeList` has no quantity field), and `listVision` is explicitly instructed to *drop*
quantities. "Four kids" is unexpressible even if it were known.

---

## C — Household context

### What `user_goals` actually captures

Four live preference dimensions, all `text[]`, all optional and multi-select
(`supabase/schema.sql:74-84`, taxonomy at `server/lib/taxonomy.js`):

| dimension | values |
| --- | --- |
| `coach_goals` | eating_cleaner · high_protein · low_sugar · **family** · gut_health · avoiding_junk · weight_loss · muscle_strength · pregnancy_postpartum · athlete_performance |
| `constraints` | **budget** · **short_on_time** · **picky_kids** · **no_kitchen** · **cooking_for_one** |
| `focuses` | 8 health things to watch |
| `non_negotiables` | hard lines |

Plus dead macro-era columns still on the table (`age`, `sex`, `height_*`, `weight_*`, `sport`,
`training_frequency`, `eating_pattern`, `eating_window_*`, `dietary_preferences`).

**Nothing captures household size, who is being fed, cooking time, or budget level.**
Confirmed by sweep — no `household`, `headcount`, `servings`, `cooking_time` or `minutes`
anywhere in `server/lib`, `server/routes`, `supabase/*.sql` or `coachGoals.js`. The closest
five facts are all binary or directional:

- `family` — a **direction**, not a count.
- `cooking_for_one` — the only headcount fact in the system, and it is one bit.
- `picky_kids` — that there are kids. Not how many, not how old.
- `short_on_time` / `no_kitchen` — time and equipment, one bit each, and `no_kitchen` means
  *no kitchen*, which is not what "one pan" means.
- `budget` — cost-conscious selection. Correctly carries no number (non-negotiable #8).

### Does compose use any of it?

**Yes, all four, as labels.** `buildComposeInput` (`listCompose.js:79`) maps ids to display
labels through the taxonomy and passes them as `shopper.{goals,focuses,hardLines,constraints}`.
The system prompt acts on them in one line:

> "Honor CONSTRAINTS: budget → cheaper staples; short on time or no kitchen → no-prep; picky
> kids → familiar; cooking for one → portionable. Still just item names."

It also receives `staples` — the shopper's real basket from `buildBaseline` — as evidence it
may lean on but never add from. So the plumbing is fine. The vocabulary is what is missing.

### The smallest set of facts that would make B's two lists actually differ

Three, and the test for each is *would a shopper bother to retype this every trip*:

1. **How many people you're feeding** — one integer, e.g. `2 adults + 3 kids`, or a single
   count with a kids flag. This is the only fact that fixes the 7-vs-10 inversion, and it is
   the one nobody retypes. **It cannot be used until a quantity exists to attach it to** — see
   the caveat below, which is why this is a report and not a proposal to build.
2. **How much cooking you actually do** — a three-way, not the current `short_on_time` bit:
   *assemble only* / *20 minutes* / *I'll cook*. "No time" and "one pan" are different
   answers today collapsed into one, and `no_kitchen` is a wrong third option that a student
   with a hob would decline.
3. **What you cook in** — one pan / oven / full kitchen. This is the fact that made B's
   student list good and it arrived only because the shopper typed the words "one pan"; nothing
   stored it, so trip two loses it.

Deliberately **not** proposed: budget level (a number is forbidden and `budget` already covers
selection), ages, dietary labels (`dietary_preferences` is already dead and hard lines cover
it), or anything medical.

**Where they get asked: `CoachOnboarding`, once.** It already has the shape for this — three
multi-select chip rows plus a confirm step (`CoachOnboarding.jsx:201-219`), it is already the
once-ever surface, and guests already go through it (`guestOnboarded`). Two of the three are
chip rows exactly like the existing ones; the headcount is the only new control. **Never per
trip** — the trip question is "what are you getting", and asking a shopper to restate their
household in front of it turns the leanest surface in the app into a form, which is the
specific thing `TripQuestion`'s header comment says it exists to avoid.

> **Caveat that outranks all three: a headcount is useless until the list can express
> amount.** There is no quantity on a cart row, in the compose schema, or in the vision
> output. Capturing "four kids" and then emitting the same seven unquantified names is worse
> than not asking — it takes an answer and visibly ignores it. **Quantity is a prerequisite,
> not a follow-up**, and it is a change to `sanitizeList`, `SECTIONS`, the compose contract,
> the row renderer, `canonicalItem`/`listBaseline` keying, and `rowMatch`. That is the real
> size of "make the two lists differ".

---

## D — The four inputs

### Summary, on production, today

| input | state |
| --- | --- |
| 1. Photo of a written list | **Unreachable, and the endpoint is broken.** Three independent blockers. |
| 2. Voice | **Does not exist.** No speech code anywhere in `client/` or `mobile/`. |
| 3. Type | **Works — only while the list is empty** (A2). |
| 4. Same as last week | **Never renders.** `useGuestCart` returns `seedable: {seedable:false}` unconditionally, and every visitor is a guest. |

### D1 — Photo. `listVision.js`

**What it does.** OCR transcription and nothing else — the system prompt forbids judging,
ranking, correcting or adding, and every judgment happens afterwards and deterministically in
`listImport.js`. Four rules: one entry per item, expand only unambiguous shorthand; drop
quantities and units but keep descriptors; **never guess — flag `unreadable: true` instead**;
ignore headings, prices, totals, and **skip crossed-out items entirely**. Returns
`{ items: [{ text, unreadable }] }`, parsed defensively, capped at 60 items / 80 chars.

**Where it is called.** Exactly once: `rawItemsFromRequest` (`routes/list.js:377`), reached only
from `POST /api/list/import` when the request carries a file. Text and photo then converge on
the same `specifyImportedItems` pipeline, which is the right design.

**Does anything in the UI reach it?** **No, for three independent reasons.**

1. **No entry point on the surface that ships.** `ImportList` is imported only in
   `App.jsx:60`, opened by `setImportOpen(true)` from the `onImport` prop passed at
   `App.jsx:1105`. `Dashboard` forwards `onImport` to `CartMoment`, which renders the button
   only `{onImport && ...}` (`CartMoment.jsx:392`). **`GuestApp` does not pass `onImport`**
   (its `<Dashboard>` call site, `GuestApp.jsx:292-322`, passes ten props and not that one).
   So the button correctly vanishes, and per §13.1 that is the only home surface anyone
   reaches. **This is a second instance of the §13.2 divergence, found by looking rather than
   by accident** — and it belongs to queue item 7.
2. **The endpoint is broken for every caller, account or not.** `routes/list.js:386` reads
   `const userId = req.userId;` — and **`req.userId` is set nowhere in `server/`**. `grep -rn
   "\.userId *=" server/` returns nothing; `requireAuth` (`lib/supabase.js:87`) sets
   `req.user` only, which is what `/list/compose` and every other route in the file read.
   Consequence: `getShoppingList(undefined)` fails and is swallowed to `null`, so the existing
   cart is dropped — defeating the route's own "Imported items are APPENDED, never a
   replacement" guarantee — and then `saveShoppingList(undefined, …)` upserts a row with no
   `user_id`, throws, and the catch returns **503 "I couldn't read that list just now"**,
   after the vision call has already been paid for. **There is no route-level test for
   `/api/list/import`**; `listImport.test.js` covers the lib functions only, and no livetest
   names it. A one-word typo in the only route behind the feature, invisible because the only
   caller is in the inert file.
3. **No guest endpoint exists.** `importList` posts to `/api/list/import` with a Bearer token;
   `routes/guest.js` has `/list`, `/list/attach`, `/list/compose` and no import. Wiring
   `onImport` into `GuestApp` would produce a 401.

**Accuracy.** Three inputs, same 14-line authored list in all three (a heading, two
abbreviations — `OJ`, `tp` — four quantities, a brand `Fairlife 2%`, a parenthetical `eggs
(pasture raised)`, and one **crossed-out** row, `soda`). Correct output is 12 items: heading
and struck row omitted, quantities dropped, descriptors kept. **Each case run 3× — every run
byte-identical, so these are reproducible behaviours, not sampling noise.**

| input | matched | quantities dropped | heading ignored | struck row | unreadable flags | failure mode |
| --- | --- | --- | --- | --- | --- | --- |
| **iOS Notes screenshot** (lossless PNG) | **12/12** | ✅ all | ✅ | ❌ **"soda" kept, 3/3 runs** | 0 | Crossed-out item re-added to the list |
| **Printed handwriting**, photographed (Ink Free, tilted, grained, JPEG q72) | **12/12** | ✅ all | ✅ | ✅ skipped, 3/3 | 0 | none observed |
| **Rushed cursive**, photographed (Mistral, tilted, grained, JPEG q64) | **11/12** | ✅ all | ✅ | ❌ **"soda" kept, 3/3** | 0 | **`tp` → "butter"**, confidently, 3/3 |

> **⚠️ These numbers are a CEILING, not a measurement.** The two handwriting cases are rendered
> from Windows handwriting *fonts* onto a paper ground, then tilted, lit unevenly, grained and
> JPEG-compressed. **A font is uniform where real handwriting is not** — no inconsistent
> letterforms, no connected ambiguity, no personal quirks, no real optics. The Notes case is a
> true lossless screenshot and is the only one of the three directly representative. Real-paper
> accuracy is unmeasured and this probe cannot measure it. Rendered images kept alongside this
> report's probe output.

**Two defects, both reproducible, both in the rules the module says matter most:**

- **The crossed-out row survives on 2 of 3 inputs.** Rule 4 says "Skip crossed-out items
  entirely; they were removed on purpose." The strike is unmistakable in both renders — a clean
  `line-through` in Notes, a pen stroke running past the word in cursive — and it was honoured
  only in Ink Free. So this is **not a legibility problem.** It is the worst single item to get
  wrong: the one thing the shopper explicitly took off comes back on, and on the Notes
  screenshot, which is the commonest real input.
- **Zero `unreadable` flags in nine runs, and the one word it could not read came back as a
  confident wrong item.** Cursive `tp` → **"butter"**, every run. Rule 3 is the module's
  headline rule — "A guess is worse than a blank here — someone will shop from this" — and it
  did not fire once. The mechanism is unexercised in both directions, because
  **`needsFix` and the row's `note` are never rendered by any client component**: `listImport.js:181`
  writes `needsFix: true` and `note: "Couldn't read this one — tap to fix it."`, `sanitizeList`
  preserves both, and `grep` for them across `client/src` finds no reader. The copy tells the
  shopper to tap something that does not exist.

**Items or a sentence?** Items — `{ text, unreadable }` per entry, never prose. And
**quantities are dropped by design** ("2 lbs chicken thighs" → "chicken thighs"), verified in
all three cases. There is no quantity field to put them in, which is the same gap as C.

### D2 — Voice

**Nothing exists.** `grep -rn "SpeechRecognition\|webkitSpeech\|MediaRecorder\|getUserMedia\|
mediaDevices" client/src mobile/src` → no matches. (`server/lib/listVoice.js` is unrelated
despite the name — it is the flag-once swap-offer module.)

**What I verified about iOS Safari, and what I could not.**

Verified from sources:

- Supported from **iOS/iPadOS 14.5** (Safari 14.1 on macOS), under the **`webkitSpeechRecognition`
  prefix**; caniuse lists every iOS version 14.5 → 26.5 as **partial**, never full. Global
  support 87.24%.
- **Audio is sent to Apple's servers.** Safari shows an "Access Speech Recognition" prompt for
  permission to send audio to Apple for processing, separate from the microphone permission,
  on first use. It is a cloud service, so it does not work offline.
- **Reported broken in iOS standalone PWAs.** Developer reports say `webkitSpeechRecognition`
  works in Safari but stops working once the app is added to the Home Screen. **Kristy has
  `client/public/manifest.json` with `"display": "standalone"` and `"start_url": "/app"`**, so
  an installed Kristy is exactly that case — the same live-case reasoning as the wake lock.
- **Continuous mode is documented as unreliable**: after the first phrase `onresult` stops
  firing while the red mic indicator stays up, and **neither `onerror` nor `onend` fires**, so
  the failure is silent to the page. Reported since 2021, issue still open. Also a documented
  conflict with video play/pause, and a needed 2–3s delay after the permission grant.

**Not verified, and not verifiable from this machine:** actual behaviour on a real iPhone, in
Safari and in an installed PWA, on current iOS. Every point above is a source, not a device
test. **That test is the gate on this input** and I am not going to launder a search result
into a capability claim — §14 asked for verification precisely because the assumption is
cheap and wrong.

**On the question asked — direct to compose, or into the field for review?** Two things point
the same way, and neither depends on the device test:

- **Silent failure with no `onend`** means a "listening…" state can hang forever with nothing
  to catch it. Handing that straight to a model call spends a compose budget on a partial
  sentence with no way to tell it was partial.
- **Kristy's inputs are dense with brand and food words** — "Fairlife", "skyr", "guanciale",
  "honeycrisp", "kefir" — and cloud dictation of proper nouns is exactly where transcription
  degrades. The list is a **record that seeds next week** and feeds the shopping profile
  (`listBaseline` keys frequency on the NAME), so a misheard row is not a one-trip cost. The
  repo already made this call for a weaker case: `rowMatch.js` "refuses far more than it
  could" because a wrong match ticks something never bought.

**So: into the field, for review, on the merits — not as a fallback.** It also costs nothing
structurally, because the field is already there.

**And the zero-code option should be measured before any of this is built.** iOS's software
keyboard has a dictation key that types into any focused text input, with no Web Speech API,
no permission plumbing, no PWA caveat and no Apple-servers prompt from our side. `TripQuestion`
already renders a plain `<input>`. **A shopper on production today can already dictate their
trip** — the question is whether an in-app mic button beats the one already on their keyboard,
and that is a design question for item 2, answered with a device in hand.

### D3/D4 — Type and same-as-last-week

Both exist. Both are narrower than "exists" suggests:

- **Type** is the one input that works, and only in the `empty`/`completed` dashboard states
  (A2). There is no typed path to a list that already has rows.
- **Same as last week** is `TripQuestion.jsx:116`, gated on `cart.seedable?.seedable`, and
  `useGuestCart` returns `seedable: { seedable: false, items: 0 }` unconditionally
  (`cart.js:721`) with a correct comment explaining why — a guest has no trips row. Since
  every visitor is a guest, **the highest-value tap on that screen has never rendered in
  production.** This is honest rather than broken, and it is blocked on phone sign-in, not on
  this work. Worth stating because it means the queue's "SAME AS LAST WEEK — exists" is true
  of the code and false of the product.

---

## E — One camera, three targets

### There are two capture mechanisms today, not three, and the split is not where you'd guess

| target | mechanism | component |
| --- | --- | --- |
| Barcode | **In-app live video**, continuous decode | `CameraModal.jsx` — `@zxing/browser`, `decodeFromVideoDevice`, one-decode ticket, gold corner brackets, real permission-error copy |
| Ingredient panel | **OS camera via file input** | `ScanHome.jsx:52-63` — `<input type="file" accept="image/*" capture="environment">` |
| Written list | **OS camera via file input** | `ImportList.jsx:61-72` — byte-for-byte the same input, plus `e.target.value = ''` to allow re-selection |

So **the panel and the list already share a mechanism — by duplication, not by component.**
Two identical hidden inputs, two identical reset lines, two identical comments. The barcode is
the odd one out, and it has to be: continuous decode needs a live stream and cannot be a file
picker.

Also relevant to what is queued: **there is no client-side image preparation anywhere.** No
downscale, no crop, no re-encode on any of the three paths — the raw file goes into a
`FormData` and the server caps it at 12MB (`lib/upload.js`). Nothing is retained.

### Should they share a component?

**The two file-input paths, yes — and it is a small, honest extraction.** They are the same
three lines of DOM with the same reset quirk, differing only in the button that triggers them
and what happens to the resulting `File`. Something like a `PhotoInput` owning the input, the
`capture` attribute, the reset, and (later) the crop, taking a target and a handler. **The
value is not tidiness — it is that the queued work lands once instead of twice.**

**The barcode path, no.** Folding a live `zxing` stream and a file picker into one component
means a mode flag on top of a live decoder, and `CameraModal` is carrying real hard-won
behaviour (the one-decode ticket that exists because a shelf sweep fired two lookups and the
last response won — "a wrong-product bug by construction"). That is not a place to add a
branch for reading handwriting.

**One shared decision, three targets: what the shopper sees before the camera opens.** The
three surfaces currently disagree — ScanHome says "Photograph the label" with a measured
argument for why the photo leads, ImportList says "Photograph a list / Handwritten is fine",
and the barcode opens straight into brackets. If a single capture affordance is worth having,
it is at that layer, not at the camera layer.

### What this does to the queued capture work

Two items in §14 touch the same code, and doing the extraction **first** is what makes them
land once:

- **Item 5 — scan-card thumbnail from the shopper's photo.** The spec is a client-side crop
  and downscale, in memory for the session, nothing persisted. That crop has **no home today**,
  which is why item 5's first deliverable is a report on where the slot is fed. A shared
  `PhotoInput` is that home, and the same crop is what a *list* photo wants too — a
  photographed list is a document, and the accuracy findings in D1 (a confident misread on
  the least legible line) are exactly what a straighten-and-crop step improves. **Built once
  in the shared component, both targets get it. Built in `ScanHome`, the list path needs it
  again later.**
- **Item 4 — scan card as a bottom sheet with the camera live behind it.** This is the one
  place the two mechanisms genuinely diverge: "camera stays live behind the sheet" is only
  meaningful for the live-video path, and a file-input capture has no persistent stream to
  stay live. **So item 4 is a `CameraModal`-and-sheet concern and the extraction does not
  touch it** — which is the useful finding, because it means these two items can be worked in
  either order without colliding.

**Net: the extraction is small, it is a prerequisite for item 5 rather than a competitor to
it, and it does not block or complicate item 4.** But it should not be done before the photo
path can actually run — a shared capture component feeding an endpoint that 503s for every
caller (D1, blocker 2) is polish in front of a wall.

---

## Findings ranked, for whoever picks this up

1. **`routes/list.js:386` — `req.userId` is undefined.** The only endpoint behind photo import
   fails for every caller, after paying for the vision call. One word. No route-level test
   exists.
2. **There is no refinement path in the product**, on any tier, on any surface — while a
   working `mode: 'edit'` engine sits behind it. Wiring, not engine.
3. **`GuestApp` does not pass `onImport`.** Second confirmed instance of §13.1's divergence
   class, found deliberately this time. Belongs to queue item 7.
4. **A crossed-out item comes back onto the list**, reproducibly, on the commonest input shape.
5. **`applyCompose` silently no-ops a category removal on the shopper's own rows — and the
   summary says it worked.** Both halves needed before refinement ships.
6. **`cartCommandMode` returns `'build'` for every refinement phrasing, and `build` + a
   refinement empties the cart.** Two gates, no test binding them.
7. **A headcount is unusable until a quantity exists.** The family of five gets 7 rows; the
   student gets 10. Quantity is a prerequisite for C, not a follow-up.
8. **`needsFix` / row `note` have no renderer.** The don't-guess mechanism is unexercised at
   both ends.
9. **Voice needs a device test before anything else.** Standalone-PWA breakage is a live case
   for this app; OS keyboard dictation already works and should be the baseline it beats.

**Nothing above was fixed, designed, or committed.** Stopping here, per the queue.
