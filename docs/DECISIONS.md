# Load-bearing decisions — the full account

> Extracted verbatim from `CLAUDE.md` on 2026-08-10, when that file passed the 150,000-character
> context limit and its tail stopped loading. **`CLAUDE.md` holds the RULE; this file holds the
> ACCOUNT** — the incident, the measurement, the superseded version, the reasoning that was paid
> for once and must not be re-derived. Nothing was deleted in the move.
>
> **If you are changing a rule, change it in `CLAUDE.md` and add the account here.** A rule that
> lives only in this file is a rule that stops applying.

## Load-bearing decisions (do not regress these)

**Scoring and the KB**
- `matched` is **concerns-only**. Every `severity_level` is a *concern* level, so a
  positive entry landing in `matched` would strip the seal from any product containing
  garlic. Affirmations ride in `affirmed` / `affirmationLayer` instead.
- **Whole-food fats are clean because the KB holds no entry for them.** A regression
  test is the tripwire: no future entry, positive OR negative, may match
  butter/ghee/tallow and cost a clean product its stamp.
- **Affirming entries are excluded from REVERSE matching.** Reverse resolves a token
  *up* to a longer alias, so bare "olive oil" would silently become "extra virgin olive
  oil" and earn a badge the label never gave.
- **Margarine is deliberately NOT aliased to `partially_hydrogenated_oil`.** US
  margarine was reformulated PHO-free, so a trans-fat claim would be false. It has its
  own `seed_oil` entry on its real modern composition.
- **Tradition (`time_tested`) justifies food-worth ONLY, never a health outcome.**
  `sanitizeAffirmed` withholds `history` as well as `why`/`kristy_note` — history is the
  richest source of a tempting "used as a remedy for…" claim.
- `gluten-free` / `dairy-free` stay **advisory**. The KB has no such data and claiming
  to check it would be fabrication.
- Two harmless alias collisions exist (`partially hydrogenated soybean oil`,
  `bleached flour`); exact/longest-first priority resolves them.

**Reading a label**
- `tokenizeIngredients` restores the head noun onto sub-items: `"Vegetable oil (canola,
  soybean)"` used to flag canola and **silently miss soybean**, the commonest way a US
  label prints a seed-oil blend. Scoped to an oil/fat head, because flagging tofu for
  seed oil would be a false claim — worse than a missed one.
- **A partial read may not produce a clean approval.** A half-read list can never falsely
  *flag* (everything matched was really printed) but it can falsely *approve*, because
  the unread tail is where the canola hides. Flags stand; only `approved` is withheld.
- Low confidence is a miss. Placeholder text ("n/a", "-") matches nothing in the KB and
  would score zero concerns — a silent stamp on a product never read.

**Lookups**
- One decode per camera opening; every scan takes a monotonic ticket and a stale
  response is dropped entirely. A barcode is checksum-validated before any lookup.
- `sameGtin` tolerates zero-padding on purpose (a 12-digit UPC-A is commonly stored as a
  13-digit EAN; a strict compare would turn correct US scans into misses).
- `scanned_products` holds **products, not people** — no `user_id` column, ever (a test
  greps for it). Precedence `off/full > vision/full > vision/partial` so a legible photo
  can't overwrite an OFF record, which also closes the tampering path. The store holds
  ingredients, **never judgments**: a cached hit re-runs the full engine.
- **The self-heal loop is proven by behaviour, not by reading the source.** The Supabase
  client is injectable on `lookupProduct` / `retainProduct` / `coverageStats` for exactly
  that reason, and `productStoreLoop.test.js` runs the real sequence: a vision read of a
  product OFF can't answer for, then a second scan of the same barcode resolving from our
  own store. The claim is a sequence, so only a sequence demonstrates it.
- **`coverageStats.fromVision` is the moat, counted.** `fromOff` is coverage we borrow;
  `fromVision` is coverage we own. That number climbing over time is the only evidence the
  loop is running in production rather than merely wired correctly.
- **Wiring is not running.** `scripts/growthLoops.livetest.js` is the only thing that can
  confirm production capture — it writes a probe row to the live DB, resolves it back,
  checks the row carries no identity, and cleans up. Unit tests cannot do this.

**Swaps — three phases, and the order is the whole decision** (ruled 2026-08-08)

- ⚠️ **THE INGREDIENT-LEVEL SWAP IS NOT A PRODUCT RECOMMENDATION AND NEVER WAS. It is cut
  from the scan card.** `genericSwap` returns the `swap` sentence off the highest-severity
  matched **INGREDIENT** entry, and an ingredient entry answers *"what do I use instead of
  this ingredient"* — a question asked **in a kitchen, by someone cooking.** The scan card
  is read by someone holding a sealed package in an aisle. Scan a protein bar sweetened
  with agave and `agave_syrup` answers *"small amounts of raw honey, 100% pure maple syrup,
  or Medjool dates"*: baking advice, in her voice, to someone who cannot bake the bar.
  **Measured over all 67 swap sentences in the KB**: 14 are explicit kitchen instructions
  ("make your own dressings", "home-popped popcorn with butter", "for any application
  requiring solid fat"); **4 are editorial notes addressed to a KB maintainer** and were
  being rendered verbatim to shoppers — `neotame` reads, in full, *"See aspartame swap
  recommendations."*; and the ones that do name a shelf product are right by accident of
  authoring rather than by construction — `cottonseed_oil` says *"Read every peanut butter
  label"* to anyone scanning a cracker. **The field is still sent and still decoded.**
  Deleting it client-side would be a decoder that cannot see its subject (the
  `approvedRead` defect). The one place it is legitimately the right answer is the
  **ingredient page** (`scan.md` §5), which is a cooking-context surface and is unbuilt.
  ⚠️ **`client/src` is FROZEN, so kristyapproved.com keeps rendering it.** That divergence
  is accepted, not overlooked: the web client is the behavioural spec, not the product.
- **THE REPLACEMENT IS SAME CATEGORY, BETTER VERSION. A bad bar swaps for a good bar** —
  not for steak, not for parmesan, not for "eat a whole food instead". Three reasons, and
  they are recorded so this is not relitigated from intuition:
  - **A swap must be actionable at the shelf.** Someone holding a bar at 4pm needs
    something they can eat in a car. "Have steak" does not answer the question they asked.
  - **It is the coach's move.** Kristy meets someone inside the choice they have already
    made and improves it. Telling them the choice itself is wrong is moralizing, which
    `VOICE_SPEC.md` forbids.
  - **The whole-food position is expressed through WHICH product she approves.** A bar that
    is dates, nuts and salt is a whole food in a wrapper. **The standard lives in the pick,
    not in refusing to answer.**
- ⏳ **THE CATALOG IS THE PREREQUISITE, THE PHOTO PATH IS WHAT FILLS IT, AND THE FEATURE IS
  SMALL ONCE THE DATA EXISTS AND IMPOSSIBLE BEFORE.** A product-level swap needs to know
  what a thing IS to know what it can be swapped for, and **nothing in this repo carries a
  product category.** `scanned_products` has no such column; `ismContext`'s `categories` are
  INGREDIENT categories (`seed_oil`, `sugar_alias`) and answer a different question; and the
  one category-like value that exists — OFF's `aisle`, derived from `categories_tags` in
  `scanExtract.js:177` — **is computed, put on the response, and then discarded at
  retention**, because `retainProduct` has nowhere to put it. The catalog is at 4 rows.
  **Adding the field to the write path is nearly free today and cannot be backfilled**: a
  year of scans retained without a category is a year of rows that can never answer "what
  else is this". So the field lands first and the feature waits for the rows.
  **Do not build the swap engine before then** — a suggestion drawn from a handful of rows
  is not a thin feature, it is an absurd one, and it would be absurd in Kristy's voice.

**The counter**
- The free layer is **public** (`optionalAuth`): a deterministic KB read with no model
  call and no stored data. Requiring an account bought nothing and cost a stranger the
  exact thing they came to try. Only the *personalized* read is premium. A guest's
  counter answer also does **not** spend their free chat run — the model was never called.
- `cart_pick` is a grocery **NAME** and is deliberately not one of the seven fields
  `sanitizeForModel` passes, so the model can never mint one. **`decision` and `why`
  are excluded for the same reason**: the call a shopper acts on can never be generated.
  The whitelist stayed at seven when they were added — they are compressions of fields
  the model already has, so widening it would buy nothing.
- **A counter question with no KB match gets the honest miss, never the coach.**
  `looksLikeCounterQuestion` (a counter SUBJECT *and* a buying intent, cooking verbs
  vetoed) is consulted only after the matcher returns empty. Both signals are required:
  either alone is somebody else's question, and answering "how much protein is in
  chicken" with "no solid read" is a worse regression than the improvisation it closes.
- **A bare either/or is a question**, and it took two fixes in two places. "wild or
  farmed", "brown or white eggs" carry no question word and no punctuation, and used to
  route past the KB entirely. `looksLikeCounterQuestion` was fixed first; **`inScope` was
  not**, so `/counter/ask` still answered "that one is outside the store" while the
  Counter's own placeholder read "Wild or farmed salmon?". `isBareEitherOr` closes it —
  both sides must survive `contentWords`, which is what keeps "when does the store close
  or open" out. Only the plain "or" was ever broken; `GROCERY_ACT` already listed "vs".
- **SCOPE HAS BEEN WRONG IN ONE DIRECTION EVERY TIME. It is too tight, never too loose.**
  Four corrections now, and all four were the gate refusing a real shopper: requiring a
  known food noun and rejecting "how do I pick a good cantaloupe" with "name the food";
  landing "is bagged salad safe" as off-topic; rejecting a bare either/or on `inScope`
  after `looksLikeCounterQuestion` was already fixed; and rejecting seven of twelve `what
  is X` queries over words the KB itself teaches. Zero corrections have gone the other
  way. The file's own header says the two failure modes "are not symmetric" and it is
  right, but the asymmetry has never once been the one it was written to guard against —
  the deny list has held. **When in doubt here, admit and let the downstream filters
  refuse**: the matcher returns nothing, the generator's "insufficient" escape discards,
  and the claim lock and lint sit on the way out. A wrongly-admitted question costs one
  discarded model call. A wrongly-refused one tells a shopper their question does not
  belong, on the surface built to win them.
- **A LABEL QUESTION IS THE LABEL SECTION'S WHOLE JOB, and scope was refusing it.** "does no
  antibiotics mean anything", "what does lightly sweetened mean", "do the seals on packages
  mean anything" — none carries a grocery verb, most name a phrase the vocabulary has never
  heard, and all were `off_topic`. This was the single largest block of `asked_as` rejections.
  `isMeaningQuestion` admits them: mean/means as a **VERB**, plus a subject that is not
  itself filler. The noun form is excluded deliberately — the first draft admitted "what is
  the meaning of life", and the existing off-topic test caught it, the same way it caught the
  capital of France. `read` was also never in `GROCERY_ACT`, on a product whose entire job is
  reading labels; nor was the bare word `meat`.
- **A definitional question is a counter question, and the length bound is what makes it
  safe.** "what is skyr" was answered "that one is outside the store". Probed over twelve
  `what is X` queries where X is a word the KB *itself teaches*, **seven were rejected** —
  skyr, clabber, natamycin, bulgur, astaxanthin, skipjack, BCM-7. A shopper reading an
  unfamiliar word off a package has no grocery verb in the sentence and often no word the
  vocabulary knows, so neither the subject check nor the act check can see it.
  `isBareDefinitional` admits it, bounded to **≤5 words and ≤2 content words** — a package
  word is short, a question with structure ("what is the capital of France") is not. The
  first version had no bound and the existing off-topic test caught it in one run; the fix
  was the bound, never a weaker guard. Both directions are pinned by tests.
- **THE RETRIEVAL FLOOR IS ONE ALIAS HIT, and it is asserted in alias hits — not in a
  threshold.** Curated and generated retrieval must admit on the same evidence. That was
  claimed in a comment three times and enforced zero times, drifting a different way each
  time: (1) different constants, justified by an unmeasured premise about alias counts;
  (2) same constants, different OPERATORS (`>` vs `>=`), so curated silently needed one
  more point; (3) same constants AND operators, still not parity — because `scoreGenerated`
  reads ONLY aliases while `scoreEntries` adds title-word overlap, so a curated score of 2
  can be two generic title words and no food at all. `"is guanciale worth buying"` scored 2
  on `farmed_fish_by_species` off its title "Which farmed fish are worth buying" — the words
  "worth" and "buying" — and would have answered a cured-pork question with a farmed-fish
  card. **A number cannot express this; the unit has to.** `scoreEntries` reports
  `aliasScore` separately and the gate requires `aliasScore > 0`. Note `score >= 2` is
  vacuous on the curated side (scoreEntries floors its own results at 2), so the alias check
  does all the work. `counterFloor.test.js` pins both paths to one statement of the floor.
  Each drift cost money: a curated card rejected at the floor regenerates as a duplicate,
  and two of the generator's cards were exactly that.
- **Retrieval confidence and the gap log's weak ceiling are DIFFERENT NUMBERS.** They were
  one constant under "one number, one meaning", and they are two meanings: one is a
  retrieval judgment with a generation bill attached, the other an editorial judgment about
  the authoring backlog. Sharing it pinned the curated gate at `> 3`, which is
  **structurally unreachable for the commonest question shape** — a single-word alias
  scores 2, a title overlap on that same noun adds 1, and nothing else lands, so a query
  whose only content word is a bare noun tops out at exactly 3 forever. "best yogurt to
  buy" hit the correct card, with no runner-up, and paid for a 20-second generation every
  time. `CONFIDENT` is now its own constant at `> 2`; `WEAK_MATCH_CEILING` stays at 3.
  Measured 2026-08-02: 10 curated hits of 20 became 15, every rescued query scored 3 with
  no runner-up, and the 17-query miss rate went 35% → 6%.
- **The premise that held the gate up was never measured.** The comment justifying the
  higher curated bar claimed curated entries carry "a dozen aliases" against a generated
  card's six. Actual curated counts: **min 3, median 7, mean 7.11, max 19** — generated
  cards are authored with 6 to 8. There was no alias advantage and never had been. Record
  measured numbers, not characterizations; this is the second time a written-down
  conclusion stopped anyone checking.
- **ALIAS AUTHORING DIFFERS BY SURFACE: QUESTIONS FOR ASK, BARE NOUNS FOR LIST.** An alias
  is matched by whole-phrase containment, so `"how to pick tomatoes"` can only ever be found
  by someone typing that sentence — and a shopper writing a list types `tomatoes`. Measured
  2026-08-02 over a 30-item list: `tomato` AND `tomatoes` both missed a card that authors
  "Tomatoes: fragrant at the stem"; `nuts` hit while `almonds` missed; `cheese` hit while
  `cheddar` missed; `uncured bacon` hit while `bacon` missed. **It is not a plural problem
  and stemming would not have fixed it** — it is that the aliases were written in the card's
  own topic vocabulary. Every card now needs both: the phrasings people ASK, and the bare
  nouns they WRITE. This is the fifth consecutive time this defect has shipped, and the list
  is the first surface whose input is bare nouns exclusively.
- **EVERY CARD CARRIES ITS OWN QUESTIONS, IN `asked_as`, AND A TEST ASKS THEM.** Three or
  more realistic phrasings per card, authored **from the question, never from the card's own
  vocabulary** — "my lettuce went limp", not "wilted greens revival". They live on the entry
  rather than in a fixture, because a fixture is a second list that drifts. `counterReach.test.js`
  runs all of them through the real gate and fails if any lands on another card, on title
  words alone, or on nothing. **A new card is not done until it can be found.**
  Run over the corpus for the first time on 2026-08-02 it failed **75 of 243 phrasings across
  42 of 81 cards** — it was never a new-card problem, only a new-card *symptom*. Four
  generated duplicates had already been paid for: `gen_picking_a_ripe_cantaloupe`,
  `gen_picking_good_produce`, `gen_strawberry_freshness_check` and `gen_limp_lettuce_revival`,
  the last regenerated within an hour of `revive_greens` being authored. The causes, in size
  order: the scope gate refusing label questions; hub cards outscoring their references;
  missing bare nouns; and title-only matches the alias gate correctly rejects.
- **Be SPECIFIC, not numerous, when a hub steals a question.** The matcher scores by phrase
  length, so a reference out-ranks its hub with one longer alias rather than five short ones —
  and a short generic alias is actively dangerous: `meat any good` on
  `judging_meat_at_the_case` matched "is goat meat any good", a species the KB says nothing
  about. It is `this meat any good` now.
- **KITCHEN TECHNIQUE IS A CARD CLASS, and `kind='home'` is what carries it.** Kristy knows
  what works at home, not only what to buy. Six technique cards landed 2026-08-02:
  `baking_soda_soak`, `bean_soak_salt`, `dry_brine`, `revive_greens`, `freezing_produce`
  (all `home`) and `whole_spices` (`shelf`). The bar is identical to a shelf card — firm
  verdict, accurate mechanism, honest tier — plus one rule of its own: **mechanical only.
  What happens to the food and why. Never a bodily outcome**, which is where this category
  fails if it fails. `home` suppresses the add-to-cart in the projection AND the client, so
  a card whose verdict is a PURCHASE decision must be `shelf` however kitchen-shaped its do
  line is; `whole_spices` was authored `home` and moved for exactly that reason.
- **The imperative-verb list was aisle-shaped, and launching the class widened it.** Five of
  the six cards could not state their own action: `soak`, `stir`, `trim`, `blanch`, `toast`
  were all missing from `IMPERATIVE_VERBS`, which held `read`/`check`/`look`/`take`. The
  guard was right to stop the cards and the fix was to widen it deliberately with the
  reasoning recorded in the list, not to reword six cards around a vocabulary gap. Adding a
  verb stays a deliberate act — that is the point of the list being explicit rather than a
  heuristic.
- **Where the popular claim outruns the evidence, the card states the narrower true thing
  and the gap goes in `watch_out`.** `baking_soda_soak` exists because of this: the
  circulating "removes 90% of pesticides" line overstates Yang et al. 2017, which measured
  **two** compounds on apples the researchers had dosed themselves, at 80% and 96% after a
  **twelve-to-fifteen-minute soak** — and found thiabendazole eighty micrometers *inside*
  the fruit, where nothing applied outside reaches. A 2025 comparison put baking soda alone
  lower still and had a commercial product ahead of it, so the drafted claim "beats
  commercial washes" was **dropped before authoring**. Verify the study, not the retelling.
- **A HUB CARD'S DO LINE MUST WORK FOR WHATEVER BROUGHT THE SHOPPER THERE.**
  `produce_ripeness_by_item` answers 14 items and its do line named one: a question about
  melon returned an instruction about berries, in the most prominent line on the card. That
  is a wrong instruction, not a related-card tradeoff, and lowering the retrieval gate made
  it worse by routing every ripeness query there. The line is now the second generalizing
  check the card already taught ("smell the stem end on anything that ripens after
  picking") — the headline carries weight, the do line carries smell, and the 14 per-item
  checks stay in `look_for` one tap down. **A swept audit found this on exactly one card**,
  so it is a fixed defect and not a pattern; the other hubs already generalize. Per-item do
  lines matched to the query were considered and rejected for now: browse has no query, so
  the card would render differently when asked than when browsed.
- **GENERALIZING A HUB'S DO LINE ORPHANS WHATEVER THE GENERALIZATION EXCLUDES.** The fix
  above is a qualifier — "anything that ripens after picking" — and a qualifier is a
  boundary. That one is the climacteric/non-climacteric split and it covers **4 of the
  hub's 11 items**: cantaloupe, tomatoes and stone fruit exactly, avocado only in part
  (it ripens after picking, but the action is the stem nub, not smell). Orphaned:
  **watermelon, pineapple, citrus, grapes, cherries** (none ripen after picking) and
  **asparagus, broccoli, leafy greens** (never ripen at all). The defect class did improve
  — the old berry line gave a WRONG instruction to ten of eleven items, a qualifier is
  merely silent — but silence is not coverage. **Check the boundary before shipping a
  qualifier, and count what falls outside it.**
- **The generator has been trying to decompose that hub the whole time, and it is worth
  listening to.** Three of the four cards Pass 3 has ever written were produce per-item
  cards: cantaloupe, pineapple, berries. Two were folded back as duplicates and were
  genuinely duplicates. `berries_picking` was not — it appeared *after* the hub's do line
  stopped covering berries, so it was coverage, and it was promoted to curated rather than
  retired. A generated card that owns a subject belongs in version control where it can be
  edited; a generated card restating a curated verdict gets folded. The difference is
  whether the hub still holds that verdict.
- **Decision-first is content, not styling.** `decision`/`why` are authored per entry in
  the KB, re-ranked from its own short_answer/kristy_take/tips — never new research.
  The depth is demoted, never deleted. The **tier stays above the tap** — as `tier_note`, a
  sentence below the do line, free. The chip that used to hold that slot is gone: the
  decision is a claim and settled science must never render identically to a whole-food
  standard, but a bare classification badge said which tier without saying what it was
  classifying. See the tier-sentence entry under **Money**.
- Section `shortcuts` carry no content — a `q` in the shopper's words and an `id` that
  must already be browsable in that section. A second, drifting index of the counter is
  the thing they must not become.
- A section that doesn't cover something says so (`thinNote`). Naming the gap is what
  makes the covered part trustworthy.
- **The misses are logged, and they are the authoring backlog.** Every counter question
  the KB answers badly (`miss` = nothing matched, `weak` = an entry exists and answers
  it poorly) lands in `counter_gaps`, frequency-ranked by `gapFeed`. You cannot
  retroactively collect week-one questions, so this captures from day one. `/perimeter/ask`
  logs unconditionally — the endpoint *is* the counter. **Chat and guest chat log only
  behind `looksLikeCounterQuestion`**, the strict test: the loose `looksLikePerimeterQuestion`
  exists to make a cheap KB check worthwhile, and logging on it would sweep ordinary
  conversation into a shared dataset.
- **The free counter layer stores no PERSONAL data — that is the precise claim.** It used
  to be "no stored data". `counter_gaps` carries a normalized topic, an outcome and a
  timestamp; no user key, no IP, no session. The question text is scrubbed of emails and
  long digit runs and capped at 160 chars *before* the insert, because free text typed by
  a stranger is the one place identity arrives by accident.

**The dashboard and shop mode**
- **THE HERO IS THE ANSWER TO "WHAT NEXT", AND IT IS MEASURED, NOT ASSERTED.** Five states —
  `empty` / `completed` / `ready` / `midtrip` / `finished` — resolved from `cart.progress` and
  `cart.seedable`, storing no new concept. `dash.mjs` reads the rendered boxes and fails if
  anything renders above the hero, if anything is set larger than it, or if the hero copy is
  repeated below it.
- **THERE ARE FIVE STATES, NOT FOUR, AND THE FIFTH NEARLY SHIPPED AS A BUG.** A trip with
  every box ticked is not "mid-trip" and its answer is not RESUME, it is FINISH. Folded in, a
  shopper who had just walked their whole list would have been told to resume it.
- **EXACTLY ONE BONE-FILLED ACTION PER SCREEN, AND IT IS THE HERO'S.** Both halves were wrong
  until they were COUNTED in a browser: `finished` had **zero** (a gold-bordered button — the
  quietest answer of the five, in the state where a shopper most wants to be done) and
  `completed` had **two** (the hero plus TripQuestion's "Go"). Neither is visible in a
  stylesheet — one is an absence, the other is two components each correct alone. Resolved by
  stepping the FIELD down (`submitTone="quiet"`), never the hero. Counted per state in
  `dash.mjs`.
- **`CartHeader` WAS EXTRACTED AND THEN DELETED**, and that is the right sequence rather than
  churn. Splitting it is what made the seam measurable; rendering the composition showed the
  hero does not *relocate* it but *supersedes* it — title, standing and completion door all
  move up. A component nothing renders is dead code describing an abandoned decision.
- **THE TYPE INVERTS IN SHOP MODE.** The DO LINE leads at 17.5px and the item name demotes to
  an 11.5px eyebrow; the cart has those at 15px/13.5px the other way round. An UNMATCHED row
  keeps its name in the lead slot — the inversion is a claim that the do line is more useful,
  not a house style. One prose line per row is inherited, not relaxed.
- **A SPENT INSTRUCTION IS DEMOTED BY SIZE, NEVER BY OPACITY.** The first fix was 11.5px at
  50% — **2.90:1** against the ground, where WCAG needs 4.5:1, so a shopper who checked
  something by mistake could not read back what they had dismissed. Transparency removes
  contrast from exactly the people who need it and still looks fine to whoever shipped it.
  13px at full `textMuted` is 7.84:1. `shop.mjs` computes contrast from RENDERED colour,
  folding in every ancestor opacity, so a fade reintroduced anywhere above fails.
- **ADVANCING IS FREE SCROLL, AND THE ACTIVE SECTION IS THE ONE FILLING THE MOST SCREEN.**
  Not "the last section whose top crossed the viewport top" — a COLLAPSED section breaks that:
  once produce is done it is 66px tall, so a shopper well into meat still had the header
  naming a section entirely off screen. The collapse and the header rule were each right
  alone and wrong together, visible only with a completed section behind you.
- **EVERY BRANCH OUT OF SHOP MODE IS AN OVERLAY, NEVER A NAVIGATION.** It is never unmounted,
  so "return to the same section and scroll position" needs no restoration code — there is
  nothing to restore. **This leaked twice**: the Ask branch button wired to
  `setMoment('aisle')`, and one layer down the scan sheet's chat ask (`askAboutScan` →
  `setMoment('chat')`), invisible because the sheet looks identical on every surface. The
  chat ask is now withheld in shop mode on its own merits too — chat is the deep-input
  surface, and a shopper holding a product with a verdict on screen does not want a thread.
  A test forbids `setMoment` inside `ShopMode.jsx`.
- **A SCAN IN SHOP MODE ACTS ON THE LIST IN FRONT OF THE SHOPPER.** Resolving to a row already
  there offers "Check off [row]"; anything else joins the section they are standing in.
  `rowMatch.js` is deliberately conservative and refuses far more than it could — a missed
  match costs one extra row, a WRONG match ticks something never bought, and the list is a
  record that seeds next week and feeds the shopping profile. Every content word of the row
  must appear in the product, a state word (frozen/canned/dried/fresh) on both sides that
  disagrees vetoes, and an ambiguous tie is no match at all.
  ⚠️ **EXCEPT FOR A ONE-WORD ROW, WHERE IT IS NOT CONSERVATIVE AT ALL — see Open items.**
  "Every content word of the row must appear in the product" is trivially true when the row
  has one word, so a row reading "Yogurt" is ticked by "Greek Yogurt Covered Raisins". The
  comment above that rule names that exact example as the over-match it refuses; it does not
  refuse it, and never did.
- **THE SCREEN WAKE LOCK IS SHOP MODE ONLY, AND THE RE-ACQUIRE IS THE FEATURE.** The browser
  releases the lock whenever the document hides, so acquire-once code passes every test ever
  written for it and then dies at the first notification, permanently, for the rest of the
  walk. `shop.mjs` HIDES and RESTORES the document for real and asserts a NEW sentinel;
  verified to fail on acquire-once code before being trusted. Support (2026-08-03): iOS/iPadOS
  Safari 16.4+, Chrome 85+, Firefox 126+, Samsung 14+, ~93%. **Installed iOS PWAs were broken
  below 18.4** and there IS a `manifest.json`, so that is a live case — it degrades to a
  no-op, and no NoSleep.js video hack. Every rejection is silent: a shopper who cannot get a
  wake lock is not helped by being told about a browser API mid-aisle.

**Trips — the list is a record, not a scratchpad**
- **`shopping_lists` HELD ONE OVERWRITTEN LIST PER USER, and that blocked everything.**
  `user_id` was its primary key, so a finished trip could not be archived, "same as last
  week" had no last week, and `startNewTrip` wrote `{items: []}` over a completed trip and
  destroyed the record. `trips` (`supabase/trips.sql`) is that record: many per shopper,
  exactly one active, held by a **partial unique index** rather than a code path — the
  failure mode is concurrency, and a double-tapped button cannot see the other request.
- **`signals` and `next_list` DO NOT MOVE.** `signals` is cross-trip pattern memory and
  filed per trip it would forget the shopper every week; `next_list` spans the boundary
  between trips by definition. So `shopping_lists` survives as the shopping *profile*, its
  `list` column becomes a fossil, and `buildBaseline` / the swap queue are untouched.
- **Three statuses, and the third is the honest one.** "Start a new trip" fires at 3-of-12.
  Under active/completed alone it must either mark a half-finished trip `completed` — which
  lies to the Haul and lets it seed the next trip — or delete it, which is the bug being
  removed. **An untouched trip is REUSED rather than archived**: filing a no-op as history
  fills the archive with evidence of nothing.
- **Completing is an explicit tap, never the last checkbox.** Auto-completing would thrash
  on an uncheck-and-recheck and would take the decision away while the shopper is still
  standing in the store.
- **ADOPTION IS GATED ON "NO TRIPS AT ALL", NOT "NO ACTIVE TRIP".** There is no backfill —
  a pre-trips list becomes that shopper's first trip on their next read. Gating on the
  absence of an *active* trip would resurrect the legacy list as a new trip on every single
  completion, forever, because `shopping_lists.list` keeps its items. Pinned by a test that
  completes an adopted trip and asserts it does not come back.
- **ONE SEEDING DOOR: `POST /api/trips/next`.** `/api/haul/next` was a second one, with its
  own pick-list and button on the Haul. Two doors onto one act is how a record drifts —
  they can disagree about what a new trip starts from and nothing says which is right. Its
  carry-forward computation survives *inside* the new endpoint; the button does not. There
  is no `accept` parameter: everything is preselected and the cart is itself the editing
  surface, so a selection UI in front of it is the same choice made twice.
- **THE CONVERSION DOOR IS `POST /api/trips/import`, AND ADOPTION HAPPENS INSIDE IT.** A guest
  completes three trips on the device, signs in, and is told there is no last week — a lie told
  at the moment of conversion, about the mechanic retention runs on. Declaring local trips
  session-scoped was the cheaper answer and the wrong one: it makes the archive real right up to
  the moment it would start paying. ⚠️ **THE ORDER IS THE WHOLE FEATURE AND IT IS SILENTLY
  DESTRUCTIVE BACKWARDS.** `adoptLegacyList` gates on "has this user ever had a trip at all";
  import WRITES trips. Land the archive first and that gate closes forever, stranding the
  shopper's ACTIVE cart in `shopping_lists.list` — the one list they were actually holding, gone,
  with nothing to fail. So both halves live inside `importGuestTrips` and a caller cannot
  sequence them wrongly **because a caller cannot perform either half.** One-shot on that same
  gate, which is where its idempotency comes from: an account with trips is declined (409), never
  merged into. Completed trips only — the seeder and the Haul both filter to `completed`, so
  importing abandoned ones is archive weight with a forgery surface and no consumer, **and that
  loss belongs in the sign-in copy.** `status` is server-written, every row goes through
  `sanitizeList`, and **timestamps are clamped to `[now − 1y, now]` with `started ≤ completed`**:
  `lastCompletedTrip` orders by `completed_at desc`, so an unclamped year-3000 value does not
  merely look wrong, it becomes the thing every future seed reads, forever, on an account that
  has since shopped for real. `clientId` is echoed and never stored — letting a client choose a
  row id lets it collide with one. Nothing derived crosses: no `haul_scans`, no `use_count`, no
  `counter_gaps`, no verdicts recomputed, so an imported trip cannot move an aggregate or
  anything money-adjacent. **`trip_id` on `haul_scans` is NOT part of this** — scan association
  stays lost, as its own migration and its own decision.
- **A SEEDED ROW IS RE-MATCHED, not copied with its card.** `carded`/`cardSlug` are stripped
  on the way in. Keeping them would freeze the list against a corpus that grows weekly, and
  an item bought every single trip is the likeliest to have had a card authored for it
  since. It re-logs the misses, which is correct rather than noisy: they bought it again,
  and frequency is exactly what `counter_gaps` exists to capture. The row also drops `tier`
  (a verdict belongs to the scan that produced it) and the whole offer set (a resolved offer
  is spent), and keeps the groceries — `why`, `perimeterId`, `alt`.
- **`missed` is gone as a concept.** It meant "on the cart, never checked off" and only
  existed because there was no trip record to seed from. The whole trip now seeds unchecked.
- **THE HAUL READS COMPLETED TRIPS; IT DOES NOT WRITE BOUGHT ROWS.** `haul_scans`'s unit is
  a scan carrying a verdict tier, and `tierBucket` returns `'swap'` for anything it does not
  recognise — so a tier-less bought item would render RED on the distribution bar. **The bar
  is a distribution of VERDICTS and an unscanned item honestly has none**, so `bought` rides
  as its own field with its own count and the bar stays scans-only. No migration, nothing
  miscoloured.

**The composed row is a different input shape from the typed one, and everything below
was invisible until something rendered one**
- **A MOCK IS NOT A RENDER, AND A FIXTURE COPIED FROM A MOCK INHERITS ITS BLIND SPOT.**
  The Phase 2 mock was hand-authored HTML built from the bare nouns the Phase 1 probe
  invented; `cartHarness.jsx` was then modelled on the mock. So the mock, the probe and the
  browser test that measured the build all used twelve bare nouns carrying **no `why`** —
  and the product's own compose flow puts a `why` on all 51 PICKS. The double-prose row
  could not be seen by any artifact in that chain. **A for-approval mock renders the real
  component or it is not evidence**; hand-built HTML shows intent, must be labelled as
  intent, and may never become the basis of a fixture. Full account in `PASS3-HANDOFF.md` §7.
- **A BROWSER FIXTURE IS BUILT, NEVER WRITTEN.** `client/test/buildFixture.mjs` is the one
  place they come from — the shipping `attachCards` over the shipping `PICKS` — and both
  `cart.mjs` and `composed.mjs` regenerate before every run, so a fixture cannot drift from
  the matcher. **`cart.mjs`'s expectations are DERIVED from its fixture**, not written beside
  it: hardcoding "12 rows, 6 attachments" is how a fixture and its assertions drift together
  into agreeing about a shape the product cannot emit. It throws rather than passing
  vacuously if the fixture loses its collapse or matches nothing.
- **ONE PROSE LINE PER ROW, AND WHEN THERE IS A CARD IT IS THE CARD'S.** A matched row is
  name + eyebrow + do line; the PICK's `why` is suppressed. The `why` sells the item to
  someone who already wrote it down, the do line tells them how to buy it at the shelf, and
  only the second does work in a store. An unmatched row keeps its `why` — it is the only
  prose it has. Suppression keys on the block's `hasCard`, **not** on `item.cardSlug`: the
  attachment renders only once its summary has arrived, so keying on the slug would blank
  the prose for the length of that fetch and leave the row empty if it failed. Measured at
  390px over the twelve: 8.22 → 6.10 lines per matched row, page 2290px → 2002px.
- **AN AUTHORED `perimeterId` IS GROUND TRUTH AND OUTRANKS RETRIEVAL.** A PICK names the
  entry its judgment came from; retrieval is a guess about a string. Running the guess over
  a row that already carried the answer is how "Canned skipjack tuna" reached
  `fish_freshness_at_counter` — "check it is bedded in ice" — on the bare alias "tuna".
  Measured over the 51 PICKS: 22 carry an authored id and retrieval overrode **6** of them
  and lost a 7th, a 27% error rate on the only rows where a ground truth exists. The
  authored id is still validated (retired, home or non-aisle falls through), so this cannot
  attach something the corpus no longer stands behind.
- **THE PHASE 1 PROBE MEASURED "DID SOMETHING MATCH", NEVER "DID THE RIGHT THING MATCH".**
  It reported 71%→83% with zero false positives, and both numbers were true of what it
  asked. Its false-positive class was only the six items it expected to match *nothing*; an
  item that matched the WRONG card counted as a hit. It also fed bare nouns it invented,
  not the composed names the compose flow emits. **A probe's input shape and its failure
  definition are both part of the claim** — state them, or the number means less than it
  looks like. `server/scripts/listMatchProbe.js` replaces it: correctness against the
  authored id and against food-word overlap, **exiting non-zero on a wrong match** while a
  miss only reports (coverage is `counter_gaps`'s job, a wrong do line is nobody's).
  Verified it can fail by simulating the pre-fix matcher — it names all six defects and
  exits 1. Current: **0 wrong, 31/31 attached correct, 22/22 against authored truth.**
- **A STATE WORD IS A SUBJECT, and a card about a different state of the same food is a
  wrong answer no score can catch.** `fish_freshness_at_counter` really carries "tuna" and
  `beans_dried_vs_canned` really carries "beans"; both cleared the alias floor honestly.
  `stateContradicts` vetoes a candidate when the item names a state (frozen/canned/dried/
  fresh) and the card names only others. **Both sides must name one for it to fire**, which
  is what stops it over-refusing — "Raw or dry-roasted almonds" names a state and
  `nuts_raw_vs_roasted` names none. It is a veto, never a score: it can only make the list
  decline a card the ask would serve, which is the asymmetry "a wrong do line is worse than
  no do line" asks for. Explicit list, widened deliberately, like `IMPERATIVE_VERBS`.
- **A BARE PROCESS WORD IS NOT A SUBJECT EITHER.** `raw_milk` carried the alias
  `unpasteurized`, which matched "Unpasteurized miso" — and would have matched unpasteurized
  juice, cheese or sauerkraut. Removed; `unpasteurized milk` and `raw milk` remain and all
  three of the card's `asked_as` phrasings say "raw milk". Same defect as `meat any good` on
  `judging_meat_at_the_case`. `label_natural` and `label_organic_scope` still carry bare
  `natural` / `organic`, which is correct on the ASK path and now unreachable from a list.
- **A LABEL CARD IS NOT AN AISLE CARD.** `label_terms` is a reference section — its own
  comment in `LIST_SECTIONS` says nobody walks to it — but the matcher did not know that, so
  `label_pasture_raised_feed` (8) beat `egg_labels` (6) on "Pasture-raised eggs". The row
  then carried a card, showed no trailing label *because* it had one, and sat in "Everything
  else" anyway. It falls through like a home card: same category error, same treatment.
- **A ROW SORTS BY THE SECTION IT DISPLAYS, AND NEVER DISPLAYS ONE IT IS NOT SORTED INTO.**
  Sorting read `cardSection` (only set on a match); the label read the cart `category`
  (always set). "Baby spinach" sorted to the trailing group wearing the word Produce, three
  times on one twelve-item list — two vocabularies again. `CATEGORY_SECTION` translates the
  handful of cart categories that name the SAME aisle a walk section names, and the output
  is always a counter section id, so the counter's vocabulary still wins. Deliberately tiny:
  'Protein' spans meat, seafood and dairy and maps to nothing; Bakery and Snacks are not
  aisles the counter covers and stay labels. `TRAILING_LABEL` additionally refuses to emit
  any `LIST_SECTIONS` title, so a label is structurally incapable of naming a section again.
- **THE CART CATEGORY IS A FALLBACK, NEVER AN OVERRIDE.** A stored `cardSection` still wins,
  or a refiled corpus would stop moving rows where it files them.
- **WHEN A PICK'S CARD AND ITS `why` DISAGREE, THE `why` MOVES.** `canned_fish` pointed at
  `mercury_by_fish`, whose do line is "Check the species name on the case tag" — a fish-
  COUNTER instruction on a can, the same location error as the ice line one notch quieter.
  Retargeted to `canned_fish_choosing` and the `why` rewritten to lead with the pack medium,
  that card's actual verdict. **`sardines` deliberately stays on `mercury_by_fish`** —
  `list.test.js` pins it with a stated reason (small fish sit lower on the chain), which is
  a claim about the fish rather than about the tin.
- **COMPOSED PICK NAMES STAY COMPOSED.** 12 of 51 carry an " or "/" and "/em-dash shape and
  it is tempting to flatten them. Measured at 390px, **none of them wraps** — what wrapped
  was the `why` beneath, now suppressed. `canonicalItem` splits on the em-dash and strips a
  qualifier list to drive blend dedup, `listBaseline` keys `kept` frequency on the NAME so
  renaming resets every stored shopping profile, and `applyCompose` protects rows by
  name-in-instruction matching. The matching harm is handled by the guards above instead.

**The list is the shopper's**
- ⚠️ **KRISTY CARRIES ANYTHING AND JUDGES ONLY FOOD.** Ruled 2026-08-09, after compose
  refused `"add dish soap"` over a twelve-row cart and returned the summary *"Dish soap is
  not a grocery item — it belongs in household supplies, not on the food list."* It was
  right that dish soap is not food and wrong about what follows.
  - **A non-food row goes on the list.** Trailing group, no card, no do line, no
    attachment. She has nothing to say about it and **her silence is honest** — it is what
    makes the rows she *does* speak on visibly the food ones.
  - **She never scores, flags, approves or swaps a non-food item.** Scanned, the answer is
    *"that isn't something Kristy reads."* Not a verdict, not a score, not a tier.
    🐞 ⚠️ **THIS HALF IS VIOLATED IN PRODUCTION TODAY — see Open items, "the gold seal reaches
    a bottle of dish soap". The list half holds and is verified; the scan half does not.**
  - **Compose may never refuse to add what a shopper asked for, and may never explain why
    it declined.** That refusal is finding **H** — a server fix, held, and explicitly not
    worked around in a client.

  Three reasons, recorded so this is not relitigated from intuition:
  - **Nobody makes two lists.** If dish soap cannot go on ours they keep the other half in
    Notes, and **the incomplete list is the one that gets abandoned.** The list is the
    retention engine; refusing half a grocery trip is the most expensive thing it can do.
  - **Judging cleaners needs a second knowledge base and a second claim discipline.** It is
    the fight Yuka picked and lost — their cosmetics scoring is their weakest surface, and
    a mediocre score on a bottle of detergent would put every claim in non-negotiable #2 on
    ground the KB cannot stand on.
  - **Refusing to score a non-food item is a POSITIONING STATEMENT, and it is stronger than
    a mediocre score.** "That isn't something Kristy reads" says exactly what she is for.

  ⚠️ **The silence is the feature, so do not "improve" it later with a household KB, a
  generic tidiness note, or an eyebrow reading "no guidance".** Each of those turns an
  honest absence into a weak claim, which is the trade this ruling exists to refuse.

  **THE SCOPE BOUNDARY, RULED 2026-08-09 so it is not re-derived every time the silence
  looks like a gap.** Kristy is **food and food-adjacent only.**
  - **Future scope, if any: cookware, storage, water filters, foil, parchment** — the things
    food *touches*, judged with the same whole-food logic one step out. What a pan is coated
    with and what a container leaches are the same question the KB already answers.
  - **NOT household cleaners. NOT cosmetics. NOT general grocery.** This is a boundary on the
    product, not a backlog.

  Four reasons, and the last one is the decisive one:
  - **The moat is hand-authored and it does not transfer.** Measured 2026-08-09: **82 curated
    counter cards and 74 ingredient entries**, plus the tier system, the claim lock and the
    lint that sit on top of them. Cleaners need every one of those rebuilt from zero against
    a literature nobody here has read.
  - **The honest answer in that category is usually "it doesn't matter much."** A knowledge
    base whose truthful output is a shrug is a knowledge base that makes the app feel thinner
    for having it — and saying so honestly is worse for the product than not being there.
  - **The purchase frequency is wrong for a habit.** Dish soap is bought every few months.
    The list is the retention engine because groceries are weekly; a category nobody shops
    on a weekly rhythm cannot carry a weekly product.
  - ⚠️ **It is the fight Yuka picked and lost.** Their cosmetics scoring is their weakest
    surface and it is the one most often used to argue their food scores are unreliable. A
    mediocre score in a second category does not add a category — **it discounts the first
    one.**
- **The item always stays.** A row the shopper added is never removed, renamed or
  struck. Kristy attaches a note *beside* it. `applyCompose` protects `user` and
  `imported` rows from a model-proposed removal unless the shopper's own words name the
  item — so "take the soda off" works and "make this healthier" cannot empty the cart.
- **Flag once.** `attachOffers` stamps `offered` on every row it inspects, including the
  ones that earned no comment, and the flag survives `sanitizeList`. It is idempotent by
  construction. The same gentle note repeated on every load is nagging however kindly
  it is worded, and it is the thing that gets an app deleted.
- **A no is permanent**, and it suppresses the *item*, not just the note. A declined
  swap that reappears as a "nudge" is the same suggestion by a side door.
- **The offer table matches generic food words only.** `cola` matched Coca-Cola,
  `wonder bread` matched Wonder, `frosted \w+` matched Frosted Flakes — each would have
  had Kristy judging a named product from its name alone. A typed brand stays unremarked;
  a barcode is how she reads a box.
- **Goals weight the margins.** A profile change *leans* the stored cart (≤3 additions),
  it does not regenerate it; focus/constraint anchors are capped at 4. Rebuild is still
  a choice, never a side effect of tapping a goal.
- ⚠️ **A STORED PREFERENCE ONLY EVER BUYS THE THING A SHOPPER WOULD NOT BOTHER SAYING AGAIN,
  AND THAT WAS MEASURED AT NEARLY ZERO ON THE ONE SURFACE THAT TRIED IT.** `LIST-CREATION-AUDIT.md`
  §C: the same sentence handed to compose twice, once bare and once with the full profile,
  produced lists that **barely differed** — because the sentence already carried the context.
  Someone who types "steak night for four" has said the goal, the constraint and the occasion
  in six words, and a stored `family` flag adds nothing to it.

  **THIS IS THE STANDING ARGUMENT AGAINST PERSONALIZATION-BY-GENERATION, and it should be
  quoted rather than re-derived.** The recurring proposal is that the corpus feels static and
  the answer is per-shopper generated guidance. It is not, on three grounds and the first is
  the measurement above:
  - **The marginal value of knowing the shopper is small where they are already speaking.**
    Compose, ask and scan all take an utterance or a barcode. The input carries the context.
  - **The corpus is trustworthy *because* it is pre-decided.** Every curated card passed
    tiering, the claim lock, `lintCard`, `counterReach` and an editorial pass. Per-shopper
    generation gets none of those at request time, and **the generated cards are where the
    worst defects have lived** — a card contradicting a curated verdict, four paid-for
    duplicates, a hub answering a question about a species the KB says nothing about.
  - **`/counter/ask` already covers the edges**, with generation behind the retrieval floor,
    the lint and the claim lock. The uncovered question is a logged gap and an authoring
    decision, which is the slow correct path.

  **What IS missing is the app knowing anything about a shopper — and the answer to that is
  SELECTION, never authorship.** Same cards, different ones surfaced, by a selector that is
  itself authored and reviewable. See the essentials-never-reorder ruling under **Money** for
  the shape, and its counter-example for how a selector goes wrong.
- The baseline holds grocery **names** only — what they keep buying, what they removed,
  what they declined. `kept` is deliberately not deduped: occurrences are the frequency.
- **The pattern memory is private, and it leaves with the shopper.** `shopping_lists`
  holds the most personal thing Kristy stores and was **missing from the account-deletion
  sweep**, along with `haul_scans` and `push_tokens` — all three added to the schema after
  `USER_TABLES` was written. The cascade collected them, so nothing survived a deletion,
  but the explicit sweep exists so the guarantee does not *depend* on the cascade.
  `privacyLine.test.js` now parses the migrations and fails if any table referencing
  `auth.users` is absent from `USER_TABLES`, so it cannot drift again.
- **Individual behaviour never joins the aggregate pool, by construction.** The two
  shared-pool writers (`productStore`, `counterGaps`) may not import the per-user readers
  at all — a test forbids the import, because that import is what a join would have to
  look like and it is far easier to forbid than to detect afterwards.

**Seeing the loops run**
- **The internal growth view is OFF unless deliberately turned on.** `/api/internal/growth`
  (+ `.html`) 404s entirely unless `INTERNAL_DASHBOARD_TOKEN` is set to **24+ chars**; a
  shorter one degrades to unset rather than to a weak gate. Unauthorized gets **404, never
  401** — a 401 confirms the endpoint exists and invites another try.
- It reads **only** `coverageStats` / `gapFeed` / `topScannedProducts`. Aggregate is a
  property of what it reads, not a filter it applies: both tables hold no identity, so
  there is no individual data to redact. A test forbids it importing any per-user reader.
- It is **not a Kristy surface** and deliberately uses none of her brand — inventing a
  treatment for an ops page is the drift the brand lock exists to prevent.
- **A `head:true` count cannot tell a missing table from an empty one.** PostgREST answers
  204 / null count / no error for a table that does not exist, which reads as "available,
  zero products" — i.e. "waiting for shoppers" when the truth is "capturing nothing,
  forever". `coverageStats` treats a null count as unavailable, and reachability checks use
  a real `select`, never a head.

**The ambient line — fixed per surface, never rotated** (ruled 2026-08-09)

- **A LINE THAT CHANGES EVERY LOAD IS DECORATION. A FIXED LINE BECOMES WHAT THAT SURFACE
  SAYS.** The web client picks randomly from a shared pool of three on every mount
  (`nextAmbientIsm`, `AmbientIsm.jsx`), which makes the line a property of the *render*
  rather than of the *surface* — a fortune cookie. Fixed, it reads like a person who says
  the same true thing about the same place every time.
- **NO SHARED POOL. Each surface that earns one gets its OWN line, about what THAT surface
  is for.** A pool is what forces the lines to be generic enough to fit anywhere, which is
  exactly what makes them feel like filler wherever they land.
- ⚠️ **THE TEST IS "IS THERE AN ACTION HERE", NOT "IS THE SURFACE QUIET."** They earn the
  space by being rare and by sitting where there is nothing else to do — a shopper mid-aisle
  does not want an aphorism, someone looking at an empty Haul does. **Quietness is the
  tempting test and it is the wrong one: the empty dashboard is the quietest screen in the
  app and must NEVER carry one**, because the single thing a shopper came to do is sitting
  on it. A line there competes with the answer instead of filling a gap.
- **Approved, 2026-08-09 — the empty Haul, and it is the only surface that qualifies in the
  iOS client:** *"Finish a trip and it lands here. Next week starts from what you actually
  bought."* Concrete subject in both clauses, no lexical echo, no copula, and it says what
  the surface is FOR rather than offering an aphorism about food — which is the whole reason
  the shared pool was dropped. **Exactly one surface qualifying is the right answer, not a
  thin one.** Linted clean against `antithesisChime` and `copulaAbstraction` before approval.
- ⚠️ **NEVER in shop mode, on the scan sheet, or on any surface a shopper reads while
  standing in a store.** Transient states are worse than busy ones: a line nobody finishes
  reading before it disappears is decoration that also wasted the wait.
- **The three existing lines are WEB-ONLY and the server's copy of them is dead.**
  `AMBIENT` is exported from `server/lib/education.js` and imported by nothing; the lines
  that ship come from the frozen `client/src/lib/education.js`. iOS renders **none** — it
  renders only the *contextual* (triggered) isms on the scan card, which are a different
  thing and are not covered by this rule.

**Demo and failure**
- **Demo must never fabricate, and never under-report.** It once silently engaged on a
  misconfigured production build and served a fixture for every scan; separately, hand-
  maintained demo mirrors of the counter and of chat went stale and made the product look
  thinner than it is. Demo now reads the real public endpoints and keeps a fallback only
  for its actual purpose: no backend at all. Fake data is never the safer failure.
- A missing env var **names itself**; three layers catch a bad deploy (null client, React
  error boundary, an inline boot guard in `app.html` — the only one that can catch a
  module-evaluation crash). `VITE_API_URL` is required in a production build.

**Phone sign-in**
- **Twilio, via Supabase's BUILT-IN phone provider. Nothing server-side.** It is configured
  entirely in the Supabase dashboard (Auth → Providers → Phone → Twilio): Supabase mints
  the code, Twilio delivers it, and this repo is not in the path. `SignInForm` calls
  `supabase.auth.signInWithOtp({ phone })`, which is provider-agnostic — it needs no change
  when the dashboard config lands.
- **BIRD IS DELETED, and do not bring it back.** A custom Send SMS Hook once routed
  delivery through Bird. That approach was abandoned in favour of the built-in integration,
  and the code was left in the repo — `birdSms.js`, `sendSmsHook.js`, `routes/authHooks.js`,
  the `@messagebird/sdk` dependency, `BIRD_API_KEY`, `SEND_SMS_HOOK_SECRETS`, and a mount
  in `index.js`. Removed 2026-08-02. It had been describing a plan nobody was following for
  long enough to mislead a reader into reporting Bird as the live provider — which is
  exactly what happened. **Dead code that describes an abandoned decision is worse than no
  code: it is documentation that lies.**
- **Do not add a delivery hook back without a reason the dashboard cannot meet.** The hook
  existed only to work around Bird; the built-in provider needs none.
- **No second auth rail.** Email OTP was proposed as a faster path and rejected: building a
  parallel sign-in days before the first one clears is two things to maintain and one more
  surface to get wrong. Supabase has `email: false` and it stays that way.
  ⚠️ **REVERSED 2026-08-18, DELIBERATELY, AND THE ACCOUNT ABOVE IS WHY IT HELD FOR SO LONG.**
  The provider is now `email: true`, measured live. What changed is not the maintenance
  argument — that still stands — but the arrival of a proof that needs a second rail:
  RevenueCat's restore-transfer behaviour (blocker E) can only be demonstrated by signing the
  same purchase into a second account, and Apple's rail cannot produce two accounts on one
  device on demand. **The rule was right on its own terms and was outlived by a requirement it
  did not know about.** Kept in full rather than deleted, because the maintenance cost it names
  is now a cost being paid rather than one avoided.

**Legal pages and 10DLC**
- `/privacy` and `/terms` are **static pages in `client/public/`**, rewritten to clean
  URLs in both `vercel.json` and the vite middleware so dev, preview and production agree
  about a URL that is printed on an external carrier form. The `.html` paths still resolve,
  so older links do not break.
- **The carrier sentence sits on ONE unbroken source line with no tags inside it.** A2P
  10DLC review is often automated against raw HTML, and a line wrap a human would never
  notice fails the match — rejection code **805**. Do not re-wrap it to fit the column.
  Verified in source, in `dist/`, and over HTTP.
- The pages must also carry: OTP purpose, that entering a number *constitutes consent*,
  one message per sign-in request, STOP/HELP, "message and data rates may apply", and the
  processor list. These are checked, not decorative.
- **The SMS consent line lives in `SignInForm`, not on the surrounding screen.** Both
  sign-in surfaces render that form and only `GuestGate` used to carry any legal text —
  the full-page `Auth` had none. Carriers look for the opt-in wording beside the phone field.

**Money**
- **THE PAID BOUNDARY IS A SERVER BOUNDARY.** Free forever, on every surface: the card
  SUMMARY (eyebrow, headline, do line, cart pick, **and the tier sentence**), all scanning,
  unlimited asking including generation, all browsing, and **the entire list** — building it,
  saving it, keeping it across trips, the cards attached to its items. Paid: the depth
  (`why`, `look_for`, `watch_out`, `detail`, `kristy_take`, `labels_decoded`, `sources`). `summarize()` / `forViewer()` in counterCards.js strip the depth **before it
  leaves the server** — a client that merely hides it has already received it, and before
  this every card route handed the whole corpus to any unauthenticated caller in one GET.
- **THE LIST IS FREE, AND THE ONE TIME IT WAS SOLD IT WAS ALREADY GIVEN AWAY.** A "Save
  this list" button rendered for non-premium shoppers and opened the upgrade ask — but
  `POST /api/list` is `requireAuth` with no premium check and every cart mutation calls it,
  so the save had happened before the button was drawn. It asked for money for a completed
  action, which is worse than a wall: a wall is at least honest about where the boundary
  is. Removed 2026-08-02, along with `UPGRADE_COPY.list`. **The list is the retention
  engine and metering it works against what it is for** — the thing that brings someone
  back next week is the thing you least want a toll on.
  **AND IT CAME BACK TWICE, BECAUSE A SELECTOR IS NOT A RULE.** `gate.mjs` greps
  `[data-save-list]` on the authenticated cart, so it saw neither of the two controls
  shipped afterwards: **"Save this cart"** in the GUEST header, and **"Keep it"** under
  "Save your cart" — a permanent BANNER above the guest list whenever a cart existed, which
  is the shape the ask rule names outright ("not on a save, never a banner"). Both removed
  2026-08-03. `cartFree.test.js` greps what a SHOPPER READS across all of `client/src`,
  because a button can drop an attribute, change class or move component and still say the
  same wrong thing to the same person. `gate.mjs` asserts no
  `[data-save-list]` control exists on any tier.
- **THE FREE SURFACE STATES THE CALL; THE COST OF THE CALL LIVES IN THE DEPTH. THAT IS THE
  GATE WORKING, NOT A DEFECT.** A card with a real tradeoff puts the verdict in the headline
  and what the verdict costs in `watch_out` — which is paid. `rice_arsenic` is the clearest
  case (buy white; the bran's magnesium, fiber, manganese and B6 are what you give up), but
  it is a property of **every** card that names a downside, not of that one. It looks like a
  card hiding its own cost and it is not: **the tier SENTENCE is free and it is the honest
  signal**, saying whether the line above it is settled science, a credible concern or a
  standard. A shopper who never pays still learns that a `kristys_standard` verdict is a
  preference. **Do not "fix" this by promoting `watch_out` into the free layer** — that is
  the depth, it is what the membership buys, and the eight essentials already exist to prove
  the depth is worth having. If a specific card's cost is load-bearing enough to be free, the
  lever is making that card an essential, not widening the boundary for all eighty-two.
- **THE TIER IS A SENTENCE, NOT A CHIP — AND THE SENTENCE HAD TO BE MADE FREE BEFORE THE CHIP
  COULD GO.** "Credible concern" sat above a card about buying organic: a classification
  rendered as furniture, naming a claim the card never made, with nothing for the reader to
  attach it to. Removed 2026-08-04 from `CounterCard`, `ShopMode`'s sheet and
  `PerimeterAnswer`. The list attachment never had one — `CartMoment` had already reasoned it
  out ("a list is things to buy; a tier is a claim about evidence, and on a row it is
  furniture raising a question nobody is asking mid-task"). **But non-negotiable #6 binds and
  `tier_note` was PAID.** Only the eight essentials are ever full, so dropping the chip alone
  would have left **74 of 82 cards** stating a verdict to a free shopper with no tier signal
  at all. So `tier_note` left `DEPTH_FIELDS` in the same change and renders below the do line
  — a **swap of one free signal for a better one**, not a widening. It buys no depth: `why`,
  `look_for` and `watch_out` are untouched. Scale, measured: **established 49 ·
  kristys_standard 25 · time_tested 5 · credible_concern 3** — the objected-to label was on
  three cards. **Do not restore the chip to "make the tier scannable"**; a bare tier word is
  precisely what has no referent.
- **THE PAID BOUNDARY HAD NO TEST AT ALL, which is how a field moved out of it silently.**
  `summarize()` / `forViewer()` in `counterCards.js` are the money boundary, and 507 tests
  passed after `tier_note` was moved off the paid side. That is not evidence the move was
  safe — it is evidence the boundary was held up by a comment, the same shape as the
  retrieval floor being wrong three times. `paidBoundary.test.js` pins both halves over the
  real corpus: the seven depth fields never reach a free viewer, and **every card tells a
  free reader what kind of claim it is**. Put `tier_note` back in `DEPTH_FIELDS` and the #6
  assertion fails by name. It also pins that the replacement stays a SENTENCE — a `tier_note`
  under five words, or equal to the tier's own name, is the chip growing back inside a `<p>`.
- **THE EIGHT ESSENTIALS ARE ALWAYS FULL and never touch the meter.** They sit on the index
  before any navigation: a shopper who spends three reads on the shelf never reaches the
  counter and never learns the other seventy-three exist. Free depth on the shelf proves
  the reads are worth having; the meter proves BREADTH is what the membership buys.
- ⚠️ **THE ESSENTIALS NEVER REORDER. MARK THE ONES ON THIS SHOPPER'S LIST; KEEP AUTHORED
  ORDER.** Ruled 2026-08-10, when per-shopper selection was surveyed. Sorting the shelf by
  what is in the cart is the tempting version and it is worse than the fixed one, for two
  reasons neither of which is visible in the diff that would do it:
  - **The order encodes an invariant that sorting destroys silently.** `ESSENTIALS` is
    authored **two per section** *"so the shelf stays balanced and a cut to six does not need
    rebalancing"* (`counterCards.js`). Sort by a produce-heavy cart and both produce cards go
    to the top, the balance is gone, and **nothing fails** — there is no assertion that could,
    because the property belongs to the authored list and a sort is applied after it.
  - **Position is what a shelf is for.** Eight cards a shopper learns the position of is a
    small durable map of the product. A shelf that rearranges itself is eight cards nobody
    ever learns, and it costs precisely the returning shopper — the population the whole
    retention argument is about.

  **This is the same ruling `counterCards.js:201` already made about `use_count`**, one notch
  weaker in the sample: that comment refuses to derive *membership* from popularity because it
  *"would fill the most valuable space on the surface with whatever happened to be asked most
  last week."* Reordering per shopper is that argument with a sample of one person and one
  week. **Membership and order are the same editorial decision and both stay in version
  control.**

  **What is allowed, and it gets the whole intent:** leave the eight where they are and *mark*
  the ones matching the shopper's list. Same eight, same positions, one extra signal. It needs
  no new stored state — `POST /api/guest/list/attach` already computes a `cardSlug` per row, so
  "is an essential on this list" is a set intersection over data the client already holds, and
  it works for a guest with no account.
- **THE TEASER SHIPS GEOMETRY, NEVER WORDS.** Past the meter, "The full read" shows the
  card's real first check in full, then the next few as true CHARACTER LENGTHS faded out,
  then true counts ("4 more checks, 2 traps"). Sending the actual withheld text would leak
  a third of every card to an unpaid caller in the same change that stops leaking all of
  it. A padlock says no; this says look how much of this there is.
- **`free_reads_used` is its own counter, NOT the `free_notes_used` pool.** That one meters
  personalized verdict notes on the SCAN path. Sharing an integer would spend the counter's
  depth on three scans and make the gate copy false. Same mechanic, same words, different
  column. Signed-out shoppers are metered client-side in localStorage — an IP-keyed meter
  would break the counter's no-personal-data claim to enforce a limit a cleared storage
  defeats anyway.
- **GUESTS ARE OFFERED NO PLAN BUTTONS** (`purchasable={false}`). Buying needs an account,
  an account needs a phone code, and phone codes are blocked on 10DLC — a guest who tapped
  a plan would type a number, press Send code, and wait for a message that cannot arrive.
  They keep the whole free surface and the teaser. Restore the buttons the day sign-in works.
- **The ask appears at ONE moment and nowhere else**: the fourth full-read tap. It was two
  until the list-save ask was removed as dishonest (above). Not on open, not on a scan, not
  on an ask, not on a save, never a banner.
  **AND THERE WAS A THIRD, WHICH SURVIVED BOTH EARLIER REMOVALS.** The premium `Nudge` on the
  cart rendered whenever `premium === false` and the cart had rows — "Basic cart. Membership
  shapes it…" plus "Unlock the full cart", **on open, as a banner, above the shopper's own
  list, every load**. It carried no `[data-save-list]`, said nothing about saving, and was not
  in `GuestApp`, so every existing check missed it. Removed 2026-08-03. Its copy was also the
  weakest argument available for membership: "Basic cart" is a judgement on something the
  shopper built themselves. **The checkable shape is an upgrade affordance whose render
  condition contains NO ACTION** — tier alone is not a moment, because every non-member
  satisfies it on every render, which is exactly what makes it a banner. `cartFree.test.js`
  pins that over nine named content surfaces, and separately pins that `UPGRADE_COPY` has
  exactly one key and every `askToUpgrade` call site passes it (a second key is how the
  list-save ask existed at all). **Chrome is deliberately excluded**: the sidebar entry, the
  settings row and the header's premium mark are destinations a shopper navigated to, not an
  interruption of a surface with a pitch about the content on it.
- **ONE ASK COMPONENT, ONE READ METER, AND BOTH ARE ENFORCED.** `CounterAsk` renders on the
  Counter index, the dashboard and the shop-mode overlay; `useCardMeter` is the only thing
  that spends a read. **The meter had already drifted into two copies** — `AisleMoment` and
  `CartMoment` each carried their own `requestFull`, agreeing only because somebody kept them
  agreeing, under a comment in `CartMoment` warning about that exact risk. Shop mode's overlay
  would have been the third. A card opened in an aisle must cost exactly what the same card
  costs from the couch, or the gate copy is false on one surface and nobody finds out.
  `cartFree.test.js` fails if any file outside `CounterAsk` calls `askCounter`, or any file
  outside `cardMeter` calls `fetchCounterFull` / `spendRead` / `readsSpent`.

- Price *ids* are configuration, never hardcoded, and the client never sees them.
  Displayed prices have exactly one source per client (`lib/pricing`).
- The trial has **one explicit door** (`POST /api/subscription/trial`), idempotent.
  Setting a goal grants nothing — coupling them silently spent a 7-day trial on a casual
  goal-tap and killed the 3-free-notes taste mechanic.
- **`ensureTrial` is idempotent BY EXISTENCE**: any `subscriptions` row at all, in any
  status, is returned untouched. So a row the shopper did not ask for permanently spends
  the only trial they had. That makes a stray write expensive, not merely untidy.
- **Applying the schema must never change what a user has, and a test enforces it.** The
  trial backfill used to sit at the bottom of `schema.sql` and fired on **every re-run** —
  it granted the one live account a trial twice, through two different doors, each time as
  a side effect of applying the schema to pick up a missing table. `on conflict do nothing`
  reads as idempotent and is, per user at one moment; across time it is not, because anyone
  who signed up since the last apply has no row to conflict with. It now lives in
  **`supabase/backfill_trials.sql`**, run deliberately and never as part of a schema apply,
  and `schemaSafety.test.js` fails if any other `supabase/*.sql` file contains an
  `insert`/`update`/`delete`/`truncate` outside a function body. **Never put a data write
  in a schema file.**
- Free = scan + the universal layer + the counter's free layer + **the whole list**,
  always. Paid = personalized note, focus/constraint-aware cart, haul read.
- **BUILDING A CART FROM A SENTENCE IS FREE, BEHIND A BUDGET — NOT A GATE.** It was premium
  on both doors (`/api/list/compose` and the `looksLikeCartCommand` branch in chat), and a
  signed-out GUEST could already do it through `composeGuestList`. So signing up bought a
  shopper LESS of the thing the cart is for. `LIST_COMPOSE_FREE_LIMIT` is **12 per day** for
  free callers, premium exempt: a day because a build is a per-TRIP act and an hourly bucket
  lets someone hit a wall mid-build then resets at 4am, and twelve because one build plus ten
  refinements is past any real session while sitting above the guest's shared eight — so the
  incoherence is fixed rather than inverted. **Both doors move together or the gate just
  relocates** to whichever one the shopper did not try first. The over-budget line is not an
  upsell; the ask still appears at exactly one moment.
- **WHICH BUCKET A GUEST DOOR DRAWS IS DERIVED FROM "DOES THIS REACH A MODEL", NEVER DECIDED
  PER ROUTE.** `guestRate.js` has said *"only real inference requests should consume a slot"*
  since the day it was written, and by eye that question has now been answered wrongly on four
  routes in three different directions: the counter spent an inference slot on a KB read, the
  cart build spent one on a template, `/guest/scan/barcode` spent one on a Supabase read plus
  an Open Food Facts fetch, and `/guest/verdict` spent one on a scoring pass whose handler is
  not even `async`. **They point different ways precisely because each was decided separately,
  which is why fixing any one never surfaced the others.** Fixed 2026-08-09 and verified live:
  the two model-free scan hops moved to their own bucket, `/guest/scan/label` stayed on the
  inference budget because it is a real vision call, and `guestBudget.test.js` asserts the
  split per HANDLER — a file-wide grep cannot, because `scan.js` legitimately contains both.
- ⚠️ **A BUDGET SPENT IN HOPS CANNOT BE READ AS A BUDGET FOR ANYTHING A SHOPPER DOES, AND
  THAT GAP HALVED THIS ONE WITH NOBODY EDITING A NUMBER.** `MAX_PER_WINDOW = 8` was authored
  2026-07-13, when `/api/guest/verdict` **was** the vision call: a guest scan was one hop
  through one door and eight meant eight scans. Three days later (`a672ca8`) the scan doors
  took over extraction and the verdict door became deterministic — so a scan became two hits
  and the ceiling became **four**, silently, with no edit to make it happen and nothing to
  report it. **So 8 was never sized against the doubled cost; it predates the doubling.** The
  fix restores what it was chosen to mean rather than raising it. The scan bucket is therefore
  sized in **SCANS** — 30 an hour, 2 hits each on the barcode path — with the multiplication
  exported and asserted, so a third hop fails a test instead of halving it again.

---

## The auth rail, extracted verbatim 2026-08-15

These entries had no account anywhere in `docs/` when the second CLAUDE.md split ran.
What this file already carried about phone sign-in was the 2026-08-10 version, written
before the DORMANT ruling and before the provider was measured off — **a superseded
account is worse than an absent one**, so the current text is copied in whole rather
than reconciled. Copied byte-for-byte out of CLAUDE.md before any condensation.

**Phone sign-in — ⚠️ DORMANT, NOT PENDING (ruled 2026-08-11)**
- ⚠️ **THE iOS RAIL IS SIGN IN WITH APPLE. PHONE OTP IS RETAINED DELIBERATELY, UNUSED, AND
  CANNOT CARRY TRAFFIC WITHOUT 10DLC RE-REGISTRATION.** It is **a fallback that was kept on
  purpose, not a path in progress** — the distinction is the whole entry. Read as "in
  progress" it sends someone to finish a registration nothing is waiting on; read as deleted
  it gets rebuilt later for real money. **Keep the code, keep the honest label.**
- **This is the Bird shape with the threat inverted, which is why it is written down.** Bird
  was dead code describing an abandoned decision and a session read it as the plan. Phone OTP
  is *live* code describing a **deferred** decision, and the same misreading is available: the
  rule below says dead code that lies is worse than no code, and **an unlabelled dormant rail
  lies in exactly the same way.**
- ✅ **THE PROVIDER IS NOW OFF, MEASURED 2026-08-13: `phone: false`.** The owner turned it off
  when Sign in with Apple was enabled. So the honest branch is the one that fires:
  `friendlySendError` renders *"Text sign-in is switched off for this app right now"*, which is
  now **true** rather than aspirational, and it took **no edit to the frozen client** — exactly
  as this entry predicted. The previous state is kept below because the prediction is the part
  worth trusting next time.
  ⚠️ **The dormant-not-deleted ruling is UNCHANGED by the toggle.** The code stays, the label
  stays. A provider switched off is still a rail that can be revived from a dashboard; what
  would make it dead is deleting `signInWithOtp`, and that is not done and is not proposed.
  *(Superseded, 2026-08-11: `external_phone_enabled: true` — a send was attempted and failed at
  Twilio for want of an approved campaign, rendering "The text couldn't be sent from our end.")*
- **Nobody has ever signed in, on any rail.** Two `auth.users` rows exist (2026-07-27,
  2026-08-03), **both unconfirmed, both `last_sign_in_at` null**, one of them a 555 test
  number. There is no user to migrate, no session to preserve, and no revenue depending on it.
- **Twilio, via Supabase's BUILT-IN phone provider. Nothing server-side.** `SignInForm` calls
  `supabase.auth.signInWithOtp({ phone })`, which needs no change if the rail is ever revived.
- **BIRD IS DELETED, and do not bring it back.** **Dead code that describes an abandoned decision is
  worse than no code: it is documentation that lies.**
- **Do not add a delivery hook back without a reason the dashboard cannot meet.**
- ⚠️ **No second auth rail — REVERSED 2026-08-18.** `email: true`, measured live. See the
  account above and `kristy-ios/docs/PURCHASING.md` §7.0 blocker H.
