# Open items — the full account

> Extracted verbatim from `CLAUDE.md` on 2026-08-10, when that file passed the 150,000-character
> context limit and its tail stopped loading. **`CLAUDE.md` holds the RULE; this file holds the
> ACCOUNT** — the incident, the measurement, the superseded version, the reasoning that was paid
> for once and must not be re-derived. Nothing was deleted in the move.
>
> **If you are changing a rule, change it in `CLAUDE.md` and add the account here.** A rule that
> lives only in this file is a rule that stops applying.

## Open items

- ✅ **CLOSED ON PRODUCTION 2026-08-09 — THE CARD READS AS KRISTY DECLINING, ON BOTH HALVES.**
  Server shipped (cherry-picked past the hold, `6ae8a8e`): `why` leads with the standard
  — *"The seal is earned on a food label, and this one has no panel to read."* — `checked` is
  the work only (*"Read all 13."*, and *"One ingredient."* at n=1; the second sentence and the
  named ingredient were the endorsement surviving the withholding), and the `needsGoal` branch
  no longer drops the field. Client shipped: `unverifiedRead` decoded, rendered in the
  endorsement's slot, **`VerdictBar` gains a `withheld` axis** reading *"No verdict on this
  one."* in the neutral treatment, and the guest upsell is suppressed. **The cart action stays**
  — she carries anything and judges only food. Driven live on `0030772117484`; a clean food with
  a declared panel and one with no panel data both keep `stamp:true` and their full read.

- 🐞⚠️ **THE PANEL SIGNAL IS WEAKER THAN THE GATE ASSUMES, AND IT IS MISFIRING ON PRODUCTION
  TODAY — BOTTLED WATER.** Measured 2026-08-09 against Open Food Facts over real foods that
  carry an ingredient list: **2.7% of the most-scanned products (n=480) have no `energy` key at
  all**, rising to **8.8% at the thin end (n=160)**. Those are not exotic — Raisin Bran, cut
  green beans, popcorn, ranch seasoning mix. **And the single largest cluster in the
  most-scanned sample is WATER, which has no calories because it is water.** Driven live:
  `6111035002175` (Sidi Ali mineral water) returns `nutritionPanel:"absent"`, **`stamp:false`**
  and the withheld-read sentence. **A real grocery item is being told the seal needs a food
  label behind it.**
  ⚠️ **THE COPY IS WHAT KEEPS THIS SURVIVABLE, AND THAT WAS THE POINT OF WRITING IT THAT WAY.**
  It states the standard and claims nothing about the product, so on a bottle of water it is
  *odd* rather than *false* — the failure mode the wording was built for, now observed rather
  than hypothesised. **Do not "fix" this by making the sentence more specific about the
  product.**
  **The real fix is a second signal:** `product_category` — which is **on `origin/main`, not
  held** (corrected 2026-08-10, see the held-stack entry). ⚠️ **So the second signal's code has
  shipped and this defect is still live**, which narrows the question to the wiring, the
  migration, or both — and the migration question is the one to settle first.
  `nutritionPanel === 'absent'` AND no food category is far more specific than either alone.
  Until then the gate trades a false seal on a detergent for a withheld seal on water, which is
  the right side of the asymmetry and is not free.

- 🐞 **THE DYED DAWN IS STILL READ AS FOOD, AND `unverifiedAsFood` IS STRUCTURALLY UNABLE TO
  REACH IT.** `0030772006023` comes back `swap_recommended` on `yellow_5`/`blue_1`, and the gate
  requires `tier === 'approved'` (`verdictEngine.js:689`) — so on production she objects to dish
  soap's **colouring**, her education line reads *"That color isn't food. It's petroleum in a
  costume."*, and `genericSwap` offers *"naturally colored products using turmeric, saffron, or
  annatto"*. **A product is protected from the food treatment only by NOT containing a flagged
  food ingredient**, which is exactly backwards.
  **The panel signal is orthogonal to the tier and the gate should not be conditioned on it** —
  ruled 2026-08-09. What that decoupling must and must not touch:
  - **NULL `education` and `swap` on every tier.** Both are food claims: one is her voice
    asserting something about the product, the other a purchase recommendation inside the food
    category. These are the two lines that make the dyed Dawn absurd.
  - **POPULATE `unverifiedRead` on every tier**, which is what moves the bar to *"No verdict on
    this one."* and stops *"Swap it. There's a better pick."* being said about a detergent.
  - ⚠️ **NEVER SUPPRESS `universalLayer`. FLAGS STAND.** Same rule as a partial read: a matched
    concern was really printed on the label, so it can never be false, and suppressing it is the
    one move that could hide a genuine concern on a genuine food. **Withholding is about
    refusing to ENDORSE, never about silencing a warning** — `verdictEngine.js:640` already says
    the lever *"can never grant a seal, escalate a tier, add a flag or manufacture a swap"*, and
    the inverse of "never add" is not "sometimes remove".
  ⚠️ **THE COST IS MEASURED AND IT IS NOT ZERO: a flagged REAL food with a thin OFF record loses
  its verdict WORD** (the bar reads "No verdict on this one." instead of "Skip. Put it back.")
  **while keeping every flag.** At the rates above that is ~3% of scanned products, ~9% at the
  thin end. Flags surviving is what makes the trade acceptable; if `universalLayer` were
  suppressed too it would not be.

- 🐞⚠️ **HISTORICAL — FIXED 2026-08-09, kept for the mechanism. THE SEAL WAS WITHHELD AND THE
  CARD STILL SAID "APPROVED." — THE iOS CLIENT NEVER
  LEARNED `unverifiedRead`.** Found 2026-08-09 by reading the Swift after the server went
  green, which is the same order that found the `NutritionInput` gap one layer up. Driven
  live, `POST /api/guest/verdict` on `0030772117484` with `nutritionPanel:"absent"` returns
  `stamp:false`, `approvedRead:null`, `education:null` and `unverifiedRead:{checked, why}`.
  **`ScanModels.swift` declares no such field**, so on the product itself:
  - `stamp:false` swaps `KristySeal()` for `VerdictBar(tier:)` — and `VerdictBar`'s call for
    `.approved` is the single word **"Approved."**, in Playfair pull-quote, seafoam on a mint
    border. **The gold seal came off and the green light stayed on.**
  - `approvedRead:null` removes the evidence block, correctly.
  - `unverifiedRead` is **dropped on the floor**, so the one sentence that says why the seal
    was withheld never renders.
  - What is left is a bar reading "Approved.", nothing under it, and the withheld-read
    upsell.
  ⚠️ **THIS IS WHY THE COPY QUESTION IS NOT YET A COPY QUESTION.** There is no refusal on
  screen to improve — improving `unverifiedRead`'s wording changes nothing a shopper sees
  until the client decodes it. **The proposal and the decoding land together or neither
  does.** Same family as every other entry here: correct server, correct null, correct
  degradation-by-nulling — and a client that cannot see the subject. Note the nulling of
  `approvedRead` did exactly its job (no false evidence); it is `VerdictBar` that has no
  concept of a withheld approval, because until this gate existed there was no such state.
- ⏳ **THE GUEST BUDGET IS A PROPERTY OF UPTIME, NOT OF THE SHOPPER. FINE NOW, WRONG AT
  SCALE.** All four buckets in `guestRate.js` are module-level `Map`s in one process, so
  **every deploy hands every IP a full budget back** and Railway redeploys on every push to
  `main`. The file has always said so (*"good enough for a single instance; swap for a shared
  store if this ever runs multi-process"*) — what was not written down is that the reset is
  not only a multi-process problem: a single instance restarting is enough. Three consequences
  worth having in one place: the ceiling a shopper actually experiences is bounded by
  **deploy frequency**, not by the number; a busy release day quietly makes the free tier
  unlimited; and **it cannot be measured** — there is no counter to read, and `rateLimited`
  records a hit when it is NOT limited, so asking whether budget remains spends the slot that
  answers. **Not urgent**: the limiter exists for abuse and cost, both of which are still
  bounded per-instance, and a stranger cannot know when a deploy happened. **It becomes real
  the moment a second instance exists** — at that point the budget is divided by the instance
  count and the numbers stop meaning anything at all. Recorded here rather than rediscovered.

- ✅ **CLOSED ON PRODUCTION 2026-08-09 — THE CACHE PATH NO LONGER WALKS AROUND THE SEAL GATE,
  AND THE TWO NAMED FALSE SEALS ARE CLEARED.** Migration applied, code deployed, driven live:
  `POST /api/guest/scan/barcode` on **`0030772117484`** now answers `source:"store"` with
  `nutrition.nutritionPanel:"absent"`, and the verdict door returns **`stamp:false`**,
  `education:null` — the *"A few ingredients, all real. This is what food used to look like"*
  line is gone — `approvedRead:null`, and `unverifiedRead` in its place: *"No nutrition panel on
  this one. The seal needs a food label behind it."* **Non-negotiable #4 holds on the cache
  path.** Both Dawn rows carry `absent`, which is how the `update`'s row count was confirmed
  without database access: **2**.
  **Verified in the other direction too, which matters more:** a clean food with a declared
  panel keeps `stamp:true` and its `approvedRead`, and so does one with **no panel data at all**
  — `unknown` withholds nothing, so nothing already in the catalog lost its seal.
  ⚠️ **THE DYED DAWN (`0030772006023`) IS STILL REFUSED BY COINCIDENCE, NOT BY THIS GATE.** It
  comes back `swap_recommended` on `yellow_5`/`blue_1`, and `unverifiedAsFood` requires
  `tier === 'approved'`, so the gate is *structurally unable* to act on it. If OFF ever loses
  those dye entries the gate catches it — but do not read that product's refusal as evidence
  this works. The dye-free SKU one barcode over is the one that proves it.
  ⚠️ **`unverifiedAsFood` IS NOT ON THE WIRE.** The engine returns it, `routes/verdict.js` does
  not forward it; a client keys off `unverifiedRead`/`stamp` instead, which is deliberate (a
  client cannot fail closed on a field it has never heard of). Do not add it to a decoder
  expecting it to arrive.
  **Kept for the mechanism, which is load-bearing:** the gate only ever fires where the
  nutrition came from OFF, and `scanned_products` stored **no nutrition at all** — so before
  this, a product already in our own catalog resolved to `unknown`, `unknown` withheld nothing,
  and **the self-heal loop reopened the hole for every product it cached.**
  ✅ **THE CODE IS BUILT AND COMMITTED, 2026-08-09. THE MIGRATION IS NOT APPLIED.**
  `nutrition_panel` on `scanned_products`, written by `retainProduct` when the OFF read carried
  one, returned by `lookupProduct`, and handed back by `extractFromBarcode`'s store branch as a
  `nutrition` object shaped like the OFF path's — so the engine cannot tell which door the panel
  came in through. It lives in the SAME migration as `product_category.sql`, not a third one:
  two runs against one table for one reason is how the second gets forgotten, and a forgotten
  one here leaves a deployed gate that cannot fire. **613 tests**, ten of them new, each verified
  to fail on the defect it names. `nutritionPanelCache.test.js` drives the real
  `extractFromBarcode` (its client is now injectable for exactly this) rather than rebuilding the
  mapping, because a test that assembled its own `nutrition` object would be the props-supplied
  harness defect — which is how this shipped in the first place.
  ⚠️ **`lookupProduct` RETRIES ONCE WITHOUT THE COLUMN.** PostgREST fails the whole select on an
  undeclared column, so pre-migration this would answer null for **every** row and take the
  entire self-heal loop down — not the panel, the loop. That is the read side of "silently stops
  retaining", and worse: retention failing loses tomorrow's coverage, this loses today's answers.
  ⚠️ **APPLYING THE MIGRATION DOES NOT CLEAR A PRODUCT ALREADY CACHED, AND TWO NAMED FALSE SEALS
  ARE IN THAT STATE.** Every existing row is NULL, NULL reads as `unknown`, and the store branch
  returns *before* any OFF fetch — so nothing ever re-reads it. `0030772117484` and
  `0030772006023` (both Dawn) stay gold-sealed indefinitely, and a label photo cannot fix them
  either (vision ranks below off, so the panel write is skipped). Clearing them is a **data
  write**, deliberately not in the migration (`schemaSafety.test.js`), and it is one `update`.
  ⚠️ **"CANNOT BE BACKFILLED" IS NARROWER THAN THIS ENTRY CLAIMED.** Measured 2026-08-09 by
  re-querying OFF for both Dawns: it still answers, with no energy key, so a panel that came
  from OFF is re-derivable at one free request per barcode — and so is `category`, off the same
  response. What is genuinely unrecoverable is a **vision** row's, because the photo is never
  stored. The clock is real and it runs on the vision rows, which are the moat. The old wording
  read as "the whole catalog is lost", which would make anyone conclude the cached false seals
  are permanent. They are not.
  ⚠️ **The web client keeps the false seal regardless**: `client/src` is frozen and never
  forwarded `nutrition` either. That is accepted — the web client is the behavioural spec,
  not the product.

- ✅ **FIXED 2026-08-09 — the gold seal no longer reaches a bottle of dish soap.**
  Kept here rather than deleted because the mechanism is load-bearing and the CACHE half above
  is still open. `stamp` gains a third withholding term, `unverifiedAsFood`, on the same terms
  as `sugarHeavy` and `hardLines`: it can never grant a seal, escalate a tier, add a flag or
  manufacture a swap. `approvedRead` goes **null** when it fires (a client cannot fail closed
  on a field it has never heard of), `unverifiedRead` takes its place, and `selectCardIsm`
  returns nothing at all — every ism in that file is a claim about food.
  ⚠️ **THE CLIENT NEVER HANDED THE FIELD BACK, AND THAT NEARLY MADE ALL OF IT DECORATION.**
  The server computes `nutritionPanel` on the barcode door and judges on the verdict door;
  iOS's `VerdictRequest` declared a `NutritionInput` and **populated it at neither call site**.
  Correct server, correct decoder, correct call sites, no gate — the findings family, found by
  reading the client after the server was green. Fixed in `kristy-ios` the same day.
  **Old statement of the defect, kept for the mechanism:**

- 🐞⚠️ **THE GOLD SEAL REACHES A BOTTLE OF DISH SOAP, AND IT IS LIVE.** Driven against
  production 2026-08-09. `POST /api/guest/verdict` on **`0030772117484` (Dawn Platinum Plus
  Powerwash)** — a real barcode `/api/guest/scan/barcode` resolves `found: true` from OFF,
  with OFF's own ingredient string — returns **`tier: "approved"`, `stamp: true`**, `education`
  *"A few ingredients, all real. This is what food used to look like"*, and an `approvedRead`
  that reads the surfactants back by name as the evidence: *"Read all 13. None of them are on
  the list."* **Non-negotiable #4 says the stamp is earned. It is being given to a cleaning
  product.**

  **`stamp` has one producer — `tier === 'approved' && !violated && !sugarHeavy`
  (`verdictEngine.js:645`) — and `approved` means ZERO KB ENTRIES MATCHED (`:281`, and the
  file's own comment at `:290`).** ⚠️ **The collision is DESIGNED and that is why no scoring
  fix reaches it:** this file records, as load-bearing, that *whole-food fats are clean because
  the KB holds no entry for them*, with a regression test guarding it. **Matching nothing is
  the signature of the cleanest possible food and of something that is not food.** The
  ingredient list cannot separate them and no new entry ever will — a detergent is invisible to
  a food KB by construction, and being invisible is what earns the seal.

  ⚠️ **WHAT PROTECTS A PRODUCT TODAY IS A COINCIDENCE.** The other Dawn (`0030772006023`) came
  back `swap_recommended` — but only because it carries `yellow_5` and `blue_1`, so she read
  dish soap as food, objected to its **colouring**, and offered *"naturally colored products
  using turmeric, saffron, or annatto"*. The dye-free formula one SKU over sails through.

  **`unreadable()` (`routes/verdict.js:111`) does not and should not cover this.** It refuses
  `placeholder` and `language` — *"we could not read this"*, never *"this is not food"*. A
  detergent panel is long, English and perfectly readable. Widening it would make "unreadable"
  mean two things.

  **The gating signal, measured over four products:** OFF's `product_type` says `food` for all
  three detergents; `categories_tags` is present on **one of three**, so **category capture
  (below) would gate Mrs. Meyer's and miss both Dawns — a real argument for landing it, and NOT
  a closure of this**; the strongest discriminator is the absence of a *measured* nutrition
  panel (no `energy-kcal` at all, against Nutella's 52 keys). ⚠️ **That cannot be a refusal** —
  a real food with a thin OFF record looks identical — **but it can be a seal WITHHOLDING, and
  that lever already exists**: `sugarHeavy` and `hardLines` withhold and can never grant
  (`verdictEngine.js:640`, *"Withholding only; it can never grant a seal"*). Same shape, same
  expression.

  ⚠️ **FAIL CLOSED, AND DO NOT CARRY THE COUNTER'S ASYMMETRY ACROSS — it points the other way.**
  On the counter, scope has been wrong in one direction every time (too tight) and the rule is
  *when in doubt, admit*, because a wrongly-refused question tells a shopper they do not belong.
  **Here a wrong approval is a gold seal on bleach; a wrong refusal is "that isn't something
  Kristy reads"**, which is the ruling's own honest answer and costs nothing.

  Full evidence, verbatim responses and the signal table: `kristy-ios/docs/API-FINDINGS.md` §12,
  queued as item **I** at the top of that repo's `SWIFT-HANDOFF.md` §3. **No client workaround** —
  a food detector in Swift is a second opinion about what food is.

- 🐞 **TWO OF THE THREE AMBIENT PULL-QUOTES ARE SHIPPED LINT FAILURES, AND THE SERVER'S COPY
  OF THEM IS DEAD CODE.** Measured 2026-08-09 with the real `antithesisChime`:
  - `read_the_back` — *"Read the back, not the front. The front is marketing; the back is the
    truth."* echoes **front**, second clause brings nothing of its own.
  - `no_label` — *"The best foods don't have an ingredient list. They are the ingredient."*
    echoes **ingredient**.
  - `shop_the_edges` passes both checks and is still wrong — *"The real food lives on the
    perimeter"* is the third defect class nothing can see (`kristy-ios/CLAUDE.md` §1.8e).

  **Rate: 2 of 3 ambient lines fail, against 0 of 12 contextual ones.** Pull-quote copy is
  measurably the loosest in the product, and it is loose precisely because no rule owns it.

  ⚠️ **NOT BEING FIXED, AND THAT IS A DECISION.** `client/src` is **frozen** — the lines that
  actually ship come from `client/src/lib/education.js` and rewriting them would be an edit to
  the behavioural spec for copy on a client that is no longer the product. **And the other copy
  is dead:** `AMBIENT` was exported from `server/lib/education.js` and **imported by nothing**,
  so `kristy_education.json`'s three ambient entries are the source of record for a feature no
  route serves. iOS renders none of them.
  ✅ **THE DEAD EXPORT IS GONE — deleted 2026-08-09 in the dedicated pass** (below), which is
  where this entry asked for it rather than on its own. **The three JSON entries STAY**, and
  the two failures above are why: nothing reads them, so they cost nothing, and the record of
  a measured defect is worth more than the tidiness of deleting the evidence for it. **The
  lint failures themselves are still not fixed and still will not be** — the lines that ship
  come from the frozen `client/src/lib/education.js`.

- ✅ **FIXED IN SWIFT 2026-08-09 — a one-word row is a CATEGORY, not an identity. `rowMatch.js`
  KEEPS THE OVER-MATCH, DELIBERATELY.** Rule 5 — every content word of the ROW must appear in
  the product — is vacuous at one word, so `words("yogurt") ⊆ words("Greek yogurt raisins")`
  and the shopper was offered **"Check off Yogurt"** for a bag of raisins. The list is a
  record, so accepting it seeds next week's trip and feeds the shopping profile: a miss costs
  one uncheck, this costs a lie that propagates. **The comment on that rule names this exact
  example as the over-match it refuses**, and the code never did — a comment asserting an
  invariant, in the file whose whole argument is that it refuses more than it could.

  ⚠️ **IT WAS NEVER ONE EXAMPLE.** Measured against the real JS matcher over ten cases:
  `Yogurt`→"Greek Yogurt Covered Raisins", `Milk`→"Oat Milk Creamer", `Butter`→"Peanut Butter
  Cups", `Rice`→"Rice Krispies Treats". **Four wrong ticks in ten, every one in the expensive
  direction.** The single documented example made it look like an edge case.

  ⚠️ **THE FIX THIS ENTRY PRESCRIBED DOES NOT WORK, AND IT WOULD HAVE SHIPPED LOOKING LIKE A
  FIX.** It said to floor the ROW's own substance — "one long enough to be a product rather
  than a category". **"Yogurt" is six letters and "bananas" is seven**, so no floor separates
  them; measured, that fix still gets 2 of the 4 wrong, including the named example. Length was
  the wrong axis. **The fix is the PRODUCT'S HEAD NOUN**: English puts the head last in a
  compound, so the question is whether the row's word is what the product fundamentally IS —
  "Greek Yogurt Covered Raisins" is raisins. A tail of **cut/form words** may follow (`fillet`,
  `breast`, `steak`, `loin`…), which is what keeps `Salmon`→"Wild-Caught Salmon Fillet" and
  `Chicken`→"Chicken Breast" matching — the two cases a bare head-noun rule breaks. `cups`,
  `bites`, `bars`, `chips` and `treats` are deliberately excluded: they name a different product
  *made out of* the row's ingredient, which is the over-match being closed. Rule 5 is untouched.

  ⚠️ **"JS FIRST, THEN BOTH CLIENTS" DESCRIBED A ROUTE THAT DOES NOT EXIST.** `rowMatch.js` is
  in **`client/src`, which is FROZEN** — so the fix could not land there first and could never
  reach the web client at all. Ruled 2026-08-09: **Swift only.** `kristyapproved.com` keeps the
  over-match, as **accepted divergence on the same terms as the ingredient-level swap** — the
  web client is the behavioural spec, not the product. Do not "finish the job" by editing
  `rowMatch.js`; that is the freeze, and the divergence is the recorded decision.

  **The pinned iOS check did its job.** It asserted the DEFECT on purpose, so the fix turned it
  red with its own name on it — `1 of 107 failed, got nil, wanted Optional("Yogurt")` — and was
  flipped in the commit *after* the fix, never the same one. Now 114 checks, and the head-noun
  rule, the `cutWords` allowance and the exclusion of `cups` were each verified to fail on the
  defect they name. Full statement: iOS repo's `docs/SWIFT-HANDOFF.md` §3 item 0a.

- ⏸ **THE UNPUSHED COMMITS ON `main` ARE DELIBERATE, NOT FORGOTTEN — AND WHAT IS HELD IS THE
  IMPORT ROUTE, NOT THE WHOLE STACK.** `POST /api/trips/import` is held:
  nothing can reach it (`requireAuth`, sign-in blocked on 10DLC), and pushing this repo
  deploys. **The full reasoning lives in the iOS repo's `docs/SWIFT-HANDOFF.md` §3, item 0** —
  one queue, not two. Do not push it to be helpful.
  ⚠️ **RULED 2026-08-09: ITS TEST CONDITION CLEARED AND IT IS STILL HELD.** Node is installed,
  so `trips.test.js` runs and passes 27/27 — and that was only ever *one* of three reasons.
  Nothing can still call it, and it was written ahead of a client whose guest trip record has
  changed since. **It gets reviewed against what the iOS client actually needs before it
  ships, not pushed because it now passes.** A cleared blocker is not an approval.
  ⚠️ **DO NOT IDENTIFY HELD WORK BY HASH OR BY "AHEAD N" — neither survives a split, a rebase
  or a partial push, and this entry has been wrong with both.** It named `a5c5d22`, which
  stopped resolving when the commit was split; then `e8770c8`, which stopped resolving when
  the stack was replayed. **Only the SUBJECT is stable.** Compute the rest:

  ```
  git log --oneline --reverse origin/main..HEAD
  ```

  ✅ **BOUGHT-VS-SKIPPED HAS SHIPPED** — `boughtLast` in `cartEdit.js` and `trips.js`, on
  `origin/main` since 2026-08-08. This entry called it "FREE TO SHIP" and described it as
  sitting below the import route for a day *after it had already gone live*. It was ordered
  first precisely so it could go alone, and it did.
  ⚠️ **THE FINDING I SEAL GATE AND THE `buildApiShapes` FIX ALSO SHIPPED — CHERRY-PICKED PAST
  THE HOLD, NOT PUSHED WITH IT.** That is the move when something above the hold is urgent and
  the hold still stands, and it is why stack timestamps interleave with `origin/main`'s.
  **A reader reconstructing this history from commit dates alone will get the order wrong.**
  🐞 ⚠️ **CATEGORY CAPTURE IS NOT ON THE STACK. IT IS ON `origin/main`, AND THIS ENTRY SAID
  OTHERWISE FOR TWO DAYS — SO DID `CLAUDE.md` AND THE iOS REPO'S `SWIFT-HANDOFF.md` §3 item
  0b.** Corrected 2026-08-10 by computing it. `server/lib/productCategory.js`,
  `productCategory.test.js` and `supabase/product_category.sql` all resolve on `origin/main`,
  and all three commits are ancestors of it — `2ce5f9f` (the field a same-category swap needs),
  `860f573` (`nutrition_panel` on `scanned_products`), `3f0ada4` (what the migration does not
  fix):

  ```
  git merge-base --is-ancestor 2ce5f9f origin/main && echo "on main"
  git ls-tree origin/main -- server/lib/productCategory.js
  ```

  ⚠️ **THIS IS NOT A TIDY-UP, BECAUSE THE CLAIM THAT WENT STALE WAS AN ORDERING RULE.** The
  line below it read *"apply `supabase/product_category.sql` BEFORE the code deploys."* **The
  code is pushed, and `main` auto-deploys.** So that ordering has already been settled one way
  or the other, and every document that was supposed to prompt someone to check said the code
  was still sitting on a laptop.

  ⚠️ **THE OPEN QUESTION IS WHETHER THE MIGRATION WAS APPLIED, AND IT CANNOT BE ANSWERED FROM
  THIS MACHINE** — no `server/.env`, no `supabase` CLI, no `psql`. It needs a human in the
  dashboard. **The cheapest answer first:** `productStore.js`'s read path retries without
  `nutrition_panel` and logs a named line — *"scanned_products.nutrition_panel is missing —
  apply supabase/product_category.sql"* — so **grep the Railway logs for it before doing
  anything else.** The write path has no such retry: the insert names `category`,
  `category_raw` and `nutrition_panel` literally and does `if (error) throw`, so absent columns
  break the retain of every **new** product.
  ⚠️ **`docs/SCHEMA-AUDIT.md` does not mention `product_category` at all**, so the one document
  whose job is to compare the live schema against the migrations is silent on the newest one.

  ⚠️ **THE CLOCK IS UNCHANGED AND IT IS WHY THIS MATTERS EITHER WAY.** A category cannot be
  backfilled from a vision row (the photo is never stored), so every scan retained without the
  columns is a row that can never answer "what else is this". An OFF row *is* re-derivable at
  one free request per barcode. Proposal: `docs/CATEGORY-CAPTURE.md`.

  📋 **The lesson is this entry's own, turned on itself.** It correctly forbids identifying held
  work by hash or by "ahead N", prescribes computing it by SUBJECT — **and then named a subject
  that was not on the stack.** The rule held; nobody ran the command. **Computing it is only a
  fix if someone computes it**, and three documents stating the same wrong thing is exactly what
  removes a reader's chance of noticing.

- ⏳ **QUEUED — DERIVE A BASELINE FROM THE DEVICE TRIP ARCHIVE. It is the unlock for every
  per-shopper mechanic downstream, and it is the only one whose computation already exists.**
  Ruled 2026-08-10 out of the selection survey. `buildBaseline` is written, tested and correct
  and its server-side input is permanently empty (see **Verifying**, the second constant-false
  composition); `GuestTripBook.archive` on device holds exactly the input shape it wants. The
  work is to run that computation over the archive **in the client**, giving `staples` /
  `avoided` for a guest with **no account, no server change and no new stored data** — the
  archive is already persisted, so this reads what is there rather than capturing anything new.

  **Nothing is proposed to consume it yet, and that is deliberate** — it is the signal, not a
  surface. The candidates it unblocks, in the order they were ranked: marking the essentials
  that are on this shopper's list (**never reordering them** — see **Money**); then attachment
  ties broken by purchase history.

  ⚠️ **PRICE THE `canonicalItem` DUPLICATION BEFORE STARTING; IT IS THE REAL COST AND IT IS NOT
  THE PART THAT LOOKS EXPENSIVE.** `buildBaseline`'s frequency counting is trivial — twenty
  lines. What it depends on is `canonicalItem`, which is what makes "Bananas" and "bananas, ripe"
  the same staple, and which exists as **JS in `server/lib` and in the frozen `client/src`**.
  Running the computation on device means a **third implementation, in Swift**, of a
  canonicalizer whose disagreements would be silent: the two copies would file the same grocery
  under different staples and no test spans both languages. That is a second source of truth
  arriving exactly the way the no-vendoring rule forbids. **The alternatives are to be
  considered before any Swift is written**, not after: run the derivation server-side over an
  uploaded archive (needs an endpoint a guest can reach, which is the whole reason this is
  device-side), or narrow the on-device version to exact-name matching and **state that
  narrower claim** rather than reimplementing the canonicalizer badly.

  ⚠️ **DO NOT LET THIS BECOME A CAPTURE PROJECT.** The temptation on reading it is to start
  storing what shoppers buy. **The record already exists** — the whole finding is that it is
  collected and unread. Anything that adds a new store here is a different item with a
  different privacy argument, and it does not inherit this one's.

- 📋 **THE FULL QUEUE, IN ORDER, LIVES IN `docs/PASS3-HANDOFF.md` §14** (written 2026-08-04
  so a cold start needs no thread): list-creation audit A–E → design review → build (blocked
  on explicit approval) · scan card bottom sheet · photo thumbnail · attachment-eyebrow report
  · **GuestApp/App divergence audit** · **harness sweep for the props-supplied pattern** ·
  Swift prerequisites (§10's four content duplications, then `SWIFT-SPEC.md`). §13 of the same
  doc holds this session's findings in full.

- ⚠️ **One migration outstanding.** Verified against the live Supabase in `server/.env`
  on 2026-07-30: `scanned_products`, `shopping_lists`, `haul_scans`, `verdicts`,
  `subscriptions`, `meal_logs`, `weight_logs`, `chat_messages`, `weekly_summaries` and
  every `user_goals` column (`coach_goals`, `constraints`, `macro_tracking`, `focuses`,
  `free_notes_used`, `non_negotiables`) are all **applied**. Re-verified column-by-column
  on 2026-07-31, when **`counter_cards`** (**85 rows as of 2026-08-10: 82 curated + 3
  generated**, audited row-by-row against the KB — every curated slug has a row and no row is
  unauthored. The generated three are `gen_guanciale_worth_buying`, `gen_goat_meat_quality` and
  `gen_live_fermented_foods`, all at `use_count` 0; this line said "81 + 1" for eight days while
  two more were live, because a generated row is written by the pipeline and never appears in a
  diff. **Re-count it here, do not carry it forward.**), **`counter_gaps`** and the
  `counter_gap_feed` view also landed — full audit in `docs/SCHEMA-AUDIT.md`. **`trips`** (`supabase/trips.sql`) and the `counter_gaps.source` column plus the
  `bump_card_use_count` RPC (`supabase/list_attach.sql`) were applied 2026-08-02. Still
  missing: **`push_tokens`** (`supabase/push_tokens.sql`), deferred with Expo push. Code
  degrades gracefully without it.
- ⚠️ **Phone sign-in is not live yet, and it gates revenue** — no account, no purchase.
  **10DLC brand + campaign are SUBMITTED and in verification at Twilio** (as of 2026-08-02);
  nothing else is expected to block it. Remaining, all in the Supabase dashboard: Auth →
  Providers → Phone → enable, select **Twilio**, and fill **Account SID**, **Auth Token**
  and **Message Service SID** from the Twilio console. **No server work, no env vars, no
  redeploy** — the app is already correct for this and needs nothing.
- ⚠️ **The scan card is still the full-height takeover, and the replacement is specced but
  unbuilt.** It should be a **bottom sheet**: summary, full read on tap, the camera staying
  live behind it, and the approved state as the SMALLEST state in the app — Yuka's shape
  (photo, name, verdict, detail on tap), which is the one thing about Yuka worth taking.
  Recorded here on 2026-08-04 because it was queued in conversation and written down
  **nowhere** — not in `docs/`, not here, not in a commit. A decision that lives only in a
  thread does not survive a `/clear`, which is the same class of defect as a comment
  asserting an invariant: it reads as tracked precisely because someone remembers it.
  Related and also queued: on a **photo** read the card's image slot is empty (OFF has no
  stored image for a product read off a panel) — the fix is a client-side crop of the
  shopper's own photo, held in memory for the session, **nothing persisted or uploaded
  beyond the vision call that already happens**, so the no-images-stored rule is unchanged.
- ✅ **THE DEDICATED PASS RAN 2026-08-09. THE SERVER HALF IS GONE; THE CLIENT HALF CANNOT
  BE DONE AND THAT IS NOT AN OVERSIGHT.** Deleted: `routes/photo.js`, `routes/weight.js`,
  `routes/weeklySummary.js`, `lib/weekly.js`, `lib/mealResolver.js`, `store.js
  setMacroTracking`, and — unreachable once those went — `lib/usda.js`,
  `lib/historyRecall.js`, `cron.js` and the `node-cron` dependency. `lib/insights.js` was
  already imported by nothing and went with them. The dead `AMBIENT` export left
  `lib/education.js` in the same pass, as its own entry above asked. **No database change**:
  `meal_logs`, `weight_logs`, `weekly_summaries` and `user_goals.macro_tracking` all stay
  declared, because a code deletion is not a data write.
  ⚠️ **THE CRON WAS LIVE AND IT WAS A WEEKLY BILL.** `startCron` fired every Sunday at 8am
  and `generateAllWeeklySummaries` makes one model call per user over a table nothing has
  written since macro tracking was removed. Dead code that costs money every week is the
  Bird lesson with an invoice attached.
  ⚠️ **THE CLIENT HALF IS BLOCKED BY THE FREEZE, PERMANENTLY.** `lib/logging.js sendPhoto`,
  `api.js sendWeightLog`, the `data.js` readers and `lib/dayBoundary.js` are all in
  `client/src`, which is frozen — *"not a typo, not a token, not a dead import"*. So they
  stay, and `kristyapproved.com` keeps shipping functions that now post to routes that
  return 404. **That is accepted on the same terms as the ingredient-level swap and the
  `rowMatch` over-match**: the web client is the behavioural spec, not the product. Nothing
  in `client/src` calls either function, so no surface changes.
  ⚠️ **ONE CALL SITE DID DIE: `mobile/src/context/AppProvider.tsx:471` calls `sendPhoto`.**
  `mobile/` is the unfinished Expo port, superseded by `kristy-ios` on 2026-08-08, and
  shipping that call site would require un-removing macro tracking, which `macroGuard`
  forbids structurally. Recorded rather than repaired.
  **Not deleted, and each for a reason:** `lib/push.js` (`pushToUser`) — Expo push is
  *deferred*, not abandoned, and `routes/push.js` still registers tokens; note the weekly
  cron was its only CALLER, so push now has a registration door and no send path.
  `routes/barcode.js` — not on the list, still mounted, and the only remaining caller of
  `store.js saveMeal`; whether it is superseded by `/api/scan/barcode` is a real question
  and a separate one. **Unused EXPORTS inside still-live modules were left alone**
  (`store.js` meal/weekly readers, `weightLog.js` trend helpers, `context.js` builders):
  that is a different pass with a different risk profile, and mixing it in is how a live
  reader gets deleted under a "dead code" heading.
- **TWO PRICE NUMBERS ARE AUTHORED. THE EFFECTIVE MONTHLY AND THE SAVING ARE DERIVED.**
  `MONTHLY_CENTS` and `ANNUAL_CENTS` in `client/src/lib/pricing.js` (mirrored in
  `mobile/src/lib/pricing.ts`) are the only places a price is written down. Everything
  else — `$3.75/month, billed yearly`, `Save 37%` — is arithmetic.
  **This was hand-written twice and wrong twice.** At $7.99/$59.99 the note read "About
  $5/month", correct then; when monthly moved to $5 that line advertised annual as
  IDENTICAL to monthly. Rewritten to "$3.75/month … Save 25%", right for $5/$45 and wrong
  the moment the real prices ($5.99/$44.99) landed — the true saving is **37%**, because
  the baseline is $5.99 × 12 = $71.88, not $60. A wrong percentage on a pricing page is
  the one copy error that costs trust immediately.
  The saving is **FLOORED, never rounded**: overstating a saving is the error that
  matters, understating by a fraction of a point costs nothing.
  `server/lib/pricing.test.js` asserts the rendered strings against the arithmetic AND
  fails if any price, saving or per-month figure is hardcoded anywhere else — it caught
  the mobile module and a boot log the same day it was written.
- **A STALE Stripe price id is the one billing failure nothing can detect.** Absent is safe
  and loud (`missingStripeConfig()` names the vars, billing 503s, and there is no fallback
  anywhere in `lib/stripe.js`). Stale is silent: the id resolves to a real live price with
  the OLD amount and checkout charges it against a page showing the new one. **Recreate the
  Stripe Price objects and update `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL` whenever
  the displayed price changes** — they are not in this repo and no test can reach them.

---

## ❓ THE UPSTREAM QUESTION: `approved` ON A MINERAL PANEL (opened 2026-08-10)

**Ruled open as a QUESTION, not a fix, and it OUTRANKS the water exemption** (part 3 of
`docs/CATEGORY-CAPTURE.md`, which now waits on the answer).

✅ **RE-MEASURED ON PRODUCTION 2026-08-11 AND UNCHANGED.** Driven through the guest path,
`6111035002175`:

```
POST /api/guest/scan/barcode   → source:"store", nutritionPanel:"absent", category:"other"
POST /api/guest/verdict        → tier:"approved", stamp:false,
                                 unverifiedRead:{checked:"Read all 7.", …},
                                 education:null, swap:null, universalLayer:[]
```

**Both halves of the containment are working and the read underneath is still wrong.** The seal
is withheld, the withheld read prints, the depth is nulled — and the engine still scores a
seven-token mineral analysis as a clean list and still calls it `approved`. Recorded as a
re-measurement rather than a new finding, because **the value of this entry is that the number
stops being a memory**: the tier is the thing that would silently change if somebody "fixed" the
read, and nothing else on this page would move if it did.

### What was found

Sidi Ali's ingredient list, as the engine receives it, is a **mineral analysis** —
`"sodium, calcium, magnesium…"`, seven tokens of water chemistry. It is not an ingredient list in
any sense the KB was built for, and the engine read it as a **clean** one: no token matched a KB
concern, zero concerns scored, so the product earned **`approved`**.

**The panel gate is the only thing between that and a gold seal.** `unverifiedAsFood` fires on
`tier === 'approved' && nutritionPanel === 'absent'`, and bottled water satisfies both — which is
why the withheld-read sentence appears on a water bottle at all.

### ⚠️ Why this reorders the queue

Part 3 is an **exemption from that gate**, keyed on the product's category. Ship it first and the
water is exempted — which means the `approved` it already earned on a seven-token mineral panel
goes through to the seal. **So the exemption's effect depends entirely on whether the upstream read
is right, and nobody had asked.** The gate is currently doing two jobs: the one it was designed for
(*is this food at all*) and one nobody assigned it (*catching a tier earned on a non-ingredient
list*). Removing it for water removes the second silently.

That is the same shape as the findings-family entry on constant `false` flags: the exemption reasons
correctly in isolation, and the defect only appears when you add it to what the engine already did.

### The question, stated so it can be answered

**What should a thin or non-ingredient list produce?** Sub-questions, none of them settled:

- Is there a **token floor** below which no tier is earned, or is a count the wrong instrument —
  salt is one ingredient and legitimately clean?
- Is a **mineral analysis** a recognisable shape (all tokens are minerals / the list reads as a
  chemical panel), and if so is it its own answer rather than a clean read?
- Does `approved` on a list that matched **nothing at all** differ from `approved` on a list that
  matched nothing *after* matching something? Zero concerns from zero recognised food is not the
  same evidence as zero concerns from a full label.
- Which of these is a **KB** question and which is an **engine** question? A mineral entry in the
  ingredient KB would be the wrong instrument — the KB is concerns-only, and minerals are not a
  concern.

### ⚠️ What this does NOT license

- **No fix is proposed and none should be inferred.** The measurement is one product.
- **FLAGS STAND, whatever the answer.** Anything here that withholds a verdict WORD may never
  suppress `universalLayer`. A matched concern was really printed and cannot be false.
- **It is not a reason to make the withheld-read sentence more specific about the product.** That
  copy is what keeps the water case survivable: it states the standard and claims nothing about
  what is in the bottle, so on water it is *odd* rather than *false*.
- **The dyed-Dawn tier decoupling is ruled WITH part 3**, not with this. Same gate, same function,
  one change — but it lands after the question is answered, because decoupling the gate from the
  tier changes which products reach the exemption at all.

---

## 🐞 THE `ingredients_lc` GUARD: OFF PARSES ONE LANGUAGE AND KRISTY READS ANOTHER

**Queued, separately proposed, NOT built** (found 2026-08-10, re-measured 2026-08-11).
The rule is in `CLAUDE.md` under **Queued**; this is the account.

### What was found

`ingredients_lc` names the language Open Food Facts **actually parsed**. It is not decoration and
it is not the display language — it is the field that says which text the structured
`ingredients` array was derived from. **When it is not `en`, the parse and the English text can be
two different documents about the same product**, and nothing in the code notices.

Cristaline `3274080005003`, re-fetched from OFF 2026-08-11 and byte-for-byte as first recorded:

| field | value |
| --- | --- |
| `ingredients_lc` | `"fr"` |
| parsed `ingredients` | **one** entry — `en:spring-water` |
| `ingredients_text_fr` | `"Eau de source"` — **correct** |
| `ingredients_text_en` | `"Eau de source Noemie ⏎ Calcium Ca2+ 113 mg/l ⏎ Magnesium Mg2+ 228 mg/l ⏎ …"` — a **nine-line mineral table** a contributor filled |

So **the record contains a right answer and a wrong one, in different language fields**, and
`pickEnglishText` reads the wrong one *by preferring English* — which is the correct preference
for every other product in the database. The French field is right and is never consulted; the
structured parse is right and is never consulted either.

⚠️ **THE ENGLISH FIELD IS NOT A TRANSLATION, IT IS A DIFFERENT DOCUMENT.** That is the whole
finding. A language guard that asked *"is this text English"* would pass it — the mineral table is
in English. `looksNonEnglish` returns false on it, correctly, and lets it through. **The defect is
invisible to every check the language layer already has**, because the language layer's question is
the wrong question.

### ⚠️ This is the two-lists disagreement on a new axis, and `sameVerdict` is the precedent

Same shape as the Heinz live-vs-imported defect: **one product, two ingredient lists, no way to
tell which is on the shelf.** Same fix available and already written for the other axis — score
both, compare the tier, and **refuse to guess when they differ.**

⚠️ **The existing guard cannot engage here.** `sameVerdict` compares the live field against the
**raw import**, and `pickImportedText` returns `''` for this product — there is no import to
disagree with. The second document is a different **LANGUAGE** field, which that guard has never
looked at. So the machinery exists, the precedent is settled, and the axis is unwatched.

### ⚠️ What this does NOT cover — and why it must not be folded into the panel gate

**It does not catch Sidi Ali `6111035002175`, and that is the reason it is its own item.**
Measured the same way, 2026-08-11:

```
ingredients_lc      = "fr"
ingredients_text_fr = "Sodium, Calcium, Magnésium, Potassium, Bicarbonates, Sulfates, Chlorures,"
```

**The French field is the mineral list too.** Parse and text AGREE there, and they are wrong
together — so a disagreement guard sees nothing to disagree about and passes it through. Sidi Ali
is the **upstream question** above (*what should a thin or non-ingredient list produce*), not this.

**Two products, one symptom, two unrelated causes.** Folding them into one fix would ship a guard
that appears to solve bottled water and silently covers half of it — and the half it misses is the
one already earning `approved` on production today. **They are recorded apart on purpose.**

### Scope, stated so it is not underestimated

**It changes what text is read for products well beyond water.** Any product whose
`ingredients_lc` is not `en` is in range, which is most of the non-US catalog. That is why it is
**separately proposed** and not a footnote to the water work: the blast radius is the whole
non-English half of Open Food Facts, and the fix's failure direction has to be argued before it is
written, not after.

---

## 🐞 `/privacy` AND `/terms` DESCRIBE AN SMS PRACTICE, AND THE APP STORE IS ABOUT TO POINT AT THEM

**Queued 2026-08-11 from the iOS side. NOT started, and the first step is a product ruling
rather than an edit.**

### What was found

`client/public/privacy.html` and `client/public/terms.html` were written for **A2P 10DLC
review**: OTP purpose, consent-by-entry, one message per sign-in request, STOP/HELP,
"message and data rates may apply", the processor list. Measured: **16 SMS/OTP-shaped
matches in `privacy.html` and 6 in `terms.html`.**

**Sign in with Apple replaced the phone rail on iOS on 2026-08-11.** The iOS client has no
phone field, sends no SMS, and asks for no phone number — `requestedScopes = [.email]` and
nothing else. So for the client that is about to ship, these pages describe a data practice
that does not exist.

### ⚠️ THE OBVIOUS FIX IS THE WRONG ONE, AND IT IS DESTRUCTIVE IN A WAY GIT CANNOT SHOW YOU

The natural move — *"the phone rail is gone, delete the SMS language"* — breaks two things
that are still live:

1. **THE WEB CLIENT STILL HAS THE PHONE RAIL, AND IT CAN NEVER BE CHANGED.**
   `client/src/components/Auth.jsx:117` calls `supabase.auth.signInWithOtp({ phone })`.
   `client/src` is **frozen** — no edit, for any reason — so that call site is permanent.
   The pages are the privacy policy for `kristyapproved.com` too, and for that client they
   are arguably still accurate.
2. **10DLC IS STILL IN VERIFICATION AT TWILIO.** The brand and campaign were submitted and
   have not been withdrawn. ⚠️ **The carrier sentence sits on ONE unbroken source line with
   no tags inside it, because A2P review is often automated against raw HTML and a line wrap
   fails the match — rejection code 805.** An editor rewriting this page for iOS reasons has
   every incentive to re-wrap that line and no reason to know why it is shaped that way.
   **Deleting it outright fails a review that is currently pending.**

### The ruling that has to come first

**Is phone sign-in dead product-wide, or superseded only on iOS?** Nothing in either repo
answers this, and the two answers produce opposite edits:

- **Dead product-wide** → the SMS content comes out, the 10DLC campaign is *withdrawn* at
  Twilio rather than left pending, and the one-unbroken-line rule dies with it. The frozen
  web `signInWithOtp` becomes permanently dead code, which the freeze makes acceptable but
  should be stated rather than discovered.
- **Superseded on iOS only** → the SMS content **stays**, and the work is an **addition**:
  a Sign in with Apple section covering what Apple returns (email or its private relay,
  never a name), plus the account-deletion disclosure. Nothing is deleted.

**The second is more likely correct and is the safe default**, because it is the only one
that does not touch a pending carrier review. It is recorded as a question anyway: the
default is a default, not a finding.

### Why it is not urgent and is also not optional

`docs/SWIFT-HANDOFF.md` §3 item 18 needs a **privacy URL** as a required App Store metadata
field, and the **privacy nutrition labels must match what the policy says.** So this lands
on submission day whether or not it is queued — which is the classic shape item 18 was
written about. ⚠️ **A policy describing SMS consent, attached to an app with no phone
field, is a reviewer question at best.**

### Scope

`client/public/` only — **NOT `client/src`**, which is frozen, and not the server. But
`main` here **auto-deploys to production**, and these are the pages a carrier and an App
Store reviewer read. So it is **separately proposed and separately approved work with its
own prompt**, and the rewrite is checked against `vercel.json` and the vite middleware,
which both rewrite these to clean URLs so dev, preview and production agree about a URL
printed on an external form.
