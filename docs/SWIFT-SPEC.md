# SWIFT-SPEC — Kristy, native iOS client

Written 2026-08-05. **A document, not a prompt.** It will be iterated on; the "what is thin"
section at the end is honest about where it is weakest.

---

## 0. THE FRAME. Read this before anything else.

**This is a NEW CLIENT against the existing API. It is not a port.**

Roughly **80% of the product is server-side and does not move.** The knowledge bases, the
verdict engine, the matcher, the lint, the claim lock, the tier system, retrieval, the trip
lifecycle, the paid boundary, the gap log, telemetry — all of it stays exactly where it is,
on Railway, unchanged. Swift makes HTTP calls and renders what comes back.

**The React client is the BEHAVIORAL SPECIFICATION, not the thing being translated.** It is
the only complete statement of what a shopper experiences, and much of that statement was
arrived at by measurement rather than design — the contrast floor, the hero rule, the active-
section rule, the type inversion, the one-filled-action count. Those are **rules to satisfy**.

**A literal transliteration of React patterns produces bad SwiftUI.** `useState` chains
become `@State` soup; a component that exists because JSX needed a wrapper becomes a
`ViewModifier` that means nothing; `moment === 'shop'` becomes a string enum where SwiftUI
wants a `NavigationStack` path or a full-screen cover. **Read §F before writing views.**

**One thing to internalise from the web client's history:** `GuestApp.jsx` is what every real
visitor reaches, because phone sign-in is blocked on 10DLC and `session` is null for
everybody. `App.jsx`'s own surface stack has **never rendered for a real shopper**. Do not
reproduce that architecture. In Swift there is one surface stack, and the signed-out state is
a *capability* difference inside it, not a second app.

---

## A — WHAT DOES NOT MOVE

Swift calls these. `URLSession` + `Codable`, no logic on top. Auth is a Supabase session
bearer token; `optionalAuth` routes work with or without it.

### Counter — the moat. Public.

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/counter/sections` | Section index with per-section shortcuts |
| GET | `/api/counter/sections/:id` | One section's cards (summaries) |
| GET | `/api/counter/essentials` | **The eight. Always FULL, never metered.** |
| GET | `/api/counter/cards` | Summaries for the corpus |
| GET | `/api/counter/summaries` | Batch summaries (list attachment feeds off this) |
| GET | `/api/counter/cards/:slug` | One card, summarized |
| GET | `/api/counter/cards/:slug/full` | **The paid side.** Depth, or the teaser |
| POST | `/api/counter/ask` | Retrieval → answer, generation on a miss |

`/perimeter/*` mirrors this over the older KB (`GET /api/perimeter`, `/perimeter/sections`,
`/perimeter/sections/:id`, `/perimeter/:id`, `POST /api/perimeter/ask`).

### Scan and verdict

`POST /api/scan/barcode` · `POST /api/scan/label` (multipart image) · `POST /api/verdict` ·
`POST /api/barcode` · guest equivalents under `/api/guest/verdict` and `/api/guest/scan`.

**The verdict engine's matched-entry shape is consumed directly and must not be reshaped**
(non-negotiable #5). Decode it as-is; extend additively.

### List and trips

`GET /api/list` · `POST /api/list` · `POST /api/list/rebuild` · `POST /api/list/compose` ·
`POST /api/list/import` · `POST /api/list/attach` · `POST /api/list/swaps` ·
`POST /api/trips/complete` · `POST /api/trips/new` · `POST /api/trips/next` ·
`GET /api/trips/seedable`

⚠️ **`POST /api/list/import` is broken today** — `routes/list.js` reads `req.userId`, which is
set nowhere, so it 503s for every caller after paying for the vision call. It also has **no
guest endpoint** and no route-level test. Fix before Swift depends on it. See §G.

### Everything else

`POST /api/chat` · `GET /api/haul` · `POST /api/haul/scan` · `GET /api/history/:date` ·
`POST /api/onboarding/coach` · `POST /api/onboarding/full` · `GET /api/preferences/taxonomy`
· `POST /api/preferences/interpret` · `GET /api/ingredients/search` · `GET /api/subscription`
· `POST /api/subscription/trial` · `POST /api/billing/checkout` · `POST /api/billing/portal` ·
`DELETE /api/account` · `POST /api/push/register`

**Guest, no auth, shared IP budget:** `POST /api/guest/chat` · `POST /api/guest/list` ·
`POST /api/guest/list/compose` · `POST /api/guest/list/attach` · `POST /api/guest/verdict` ·
`POST /api/guest/scan`.

⚠️ **`/api/guest/chat` has no cart-command branch**, so a guest talking to the composer cannot
edit their cart. On web that is every visitor. Decide deliberately for Swift rather than
inheriting it.

### Purchasing is the one real divergence

Web uses Stripe (`/api/billing/checkout` → hosted page). **iOS must use StoreKit 2** —
App Store rules make a web checkout for digital goods a rejection. `revenuecat.js` and
`POST /api/revenuecat` already exist for exactly this and are the intended path. Prices are
authored in `client/src/lib/pricing.js` (`MONTHLY_CENTS`, `ANNUAL_CENTS`) and everything else
is arithmetic; StoreKit products must agree with those two numbers or the pricing copy lies.

---

## B — WHAT SWIFT MUST REIMPLEMENT, AND WHY IT CANNOT BE SERVER-SIDE

Four things, each for a reason that is not "it was already client-side".

**1. Guest storage** (`guestState.js`, 127 lines) → `UserDefaults` (or a small file). A guest
has no account by definition, so there is no server row to hold their scans, cart, prefs or
onboarding flag. It must also survive sign-in: guest scans are replayed into the account's
Haul rather than discarded.

**2. `rowMatch`** (88 lines) → Swift. **It must work with no network, mid-aisle, in a
basement.** A scan resolving to a row already on the list is offered as "Check off [row]";
anything else joins the section the shopper is standing in. Port the rules exactly, and port
the asymmetry with them: **a missed match costs one extra row; a WRONG match ticks something
never bought, and the list is a record that seeds next week and feeds the shopping profile.**
Specifically — every content word of the row must appear in the product; a state word
(frozen/canned/dried/fresh) present on both sides that disagrees vetoes; an ambiguous tie is
no match at all; digits and weight units are stripped as stop-words.

**3. `normalizeBarcode` / `sameGtin`** (`barcode.js`, 87 lines) → Swift. **VisionKit hands
back a payload string, not a validated GTIN.** Checksum before any lookup. `sameGtin`
tolerates zero-padding **on purpose** — a 12-digit UPC-A is commonly stored as a 13-digit
EAN, and a strict compare turns correct US scans into misses. One decode per camera opening;
every scan takes a monotonic ticket and a stale response is dropped entirely.

**4. The guest half of the read meter** (`cardMeter.js`, 57 lines). Signed-in metering is
server-side (`free_reads_used`) and stays there. Signed-out metering is local — an IP-keyed
meter would break the counter's no-personal-data claim to enforce a limit that clearing
storage defeats anyway. **`free_reads_used` is its own counter, NOT the `free_notes_used`
pool** (that meters personalized verdict notes on the scan path). Same mechanic, same words,
different column.

**Everything else that looks client-side is presentation.** Do not port `listSections.js`
grouping logic, `cart.js` state management, or `data.js` readers as *logic* — re-derive them
from the rules in §D.

---

## C — WHERE SWIFT IS BETTER. This is the justification for the work.

**1. `VNRecognizeTextRequest` on the live preview — the biggest single quality difference
between the two clients.** Today the panel readability check happens *after* a full round
trip: the shopper takes a photo, it uploads, the model reads it, and only then does anyone
learn it was unusable. On device, text recognition runs on the preview frames, so
**readability is known BEFORE the model call** — free, instant, and in time to say "move
closer" while the camera is still up. Every failure mode of the photo path (glare, motion
blur, 6pt type, a cropped panel) becomes a live hint instead of a wasted call and a confusing
result. The audit measured the cost of the current arrangement indirectly: a partial read may
not produce a clean approval, so an unreadable photo silently downgrades to "flags stand,
approval withheld" — correct, but the shopper is never told why.

**2. `AVFoundation` focus and exposure lock, and full-sensor stills.** The browser hands back
whatever `getUserMedia` defaults to — commonly 640×480 — for **6pt ingredient type on a
curved foil bag**. Native gets the full sensor, continuous autofocus locked on the panel, and
exposure compensation for freezer-case glare. This is the difference between a legible
ingredient list and a coin flip.

**3. VisionKit reading a barcode and text from ONE frame.** Web needs two flows: `@zxing`
video decode for barcodes, a file input for panels. `DataScannerViewController` returns both
from the same session. That is the **join key that fills the catalog** — a barcode plus a
transcribed panel in one capture is exactly the `off/full > vision/full > vision/partial`
precedence the product store already implements, and it makes `coverageStats.fromVision`
climb faster. That number is the only evidence the self-heal loop runs in production.

**4. `SFSpeechRecognizer` instead of web speech, which we measured as not clearing the bar.**
Web Speech on iOS is `webkitSpeechRecognition`, partial on every version since 14.5, sends
audio to Apple's servers behind a second permission prompt, dies silently in continuous mode
(no `onend`, no `onerror`, mic indicator stays lit), and is **reported broken in installed
standalone PWAs** — which Kristy is (`manifest.json`, `display: standalone`). `SFSpeechRecognizer`
supports on-device recognition, gives real authorization states, and has a working end-of-
utterance signal. **Voice was deferred on web for these reasons and is a legitimate Swift
feature.** It still lands in the field for review, not straight into compose: the list is a
record that seeds next week, and food and brand nouns are where transcription degrades.

**5. `UIApplication.shared.isIdleTimerDisabled` replaces `wakeLock.js` — 118 lines and its
re-acquire dance.** The browser releases a screen wake lock whenever the document hides, so
acquire-once code passes every test ever written for it and then dies at the first
notification, permanently, for the rest of the walk. `shop.mjs` had to hide and restore the
document for real to catch it. On iOS this is one boolean with no lifecycle to defend, and
the whole class of defect disappears. (Web support ~93%, and installed iOS PWAs were broken
below 18.4 — a live case that also just disappears.)

**6. `ImageRenderer` replaces `verdictCanvas.js` + `haulCanvas.js` — 492 lines.** Both exist
to draw share cards pixel-exactly, deliberately avoiding `html2canvas` so what you see is what
exports. `ImageRenderer` renders the *actual SwiftUI view* to a `UIImage`, so the share card
and the on-screen card cannot drift by construction — which is the property those 492 lines
were hand-written to approximate. Font loading (`ensureCardFonts`) stops being a problem.

**Also worth having, not on the original list:** `ShareLink` and the native share sheet;
Live Text on a saved photo of a list; haptics for the check-off in shop mode (a real
one-handed-in-a-trolley affordance the web has no access to); and `ScrollViewReader` making
the exact scroll restoration in §D3 trivial rather than something to defend with a test.

---

## D — BEHAVIOR SPECS, AS RULES NOT CODE

Everything the browser suites encode. **A Swift implementation must satisfy these; it must
not mirror the components that currently satisfy them.**

### D1 — The dashboard hero

- **Five states**, resolved from cart progress and seedability, storing no new concept:
  `empty` · `completed` · `ready` · `midtrip` · `finished`.
- **`finished` is not `midtrip`.** A trip with every box ticked answers FINISH, not RESUME.
  Folded together, a shopper who just walked their whole list is told to resume it.
- The hero **is the first element and carries the largest type on the surface, in every
  state.** Nothing renders above it; nothing is set larger; its copy is not repeated below it.
- **EXACTLY ONE filled ("bone") action per screen, and it is the hero's.** Both failure
  directions shipped and were caught only by counting in a browser: `finished` had **zero**
  (a gold-bordered button — the quietest answer of the five, in the state where a shopper most
  wants to be done) and `completed` had **two** (the hero plus the trip question's "Go").
  Resolve by stepping the *other* control down, never the hero.
- **An action needs a label AND a handler, or it must not render.** An unwired control that
  paints and accepts taps is invisible to every check that looks for failure, because it does
  not fail. Make it vanish instead.
- Dominance comes from **fill, not area**: relative luminance of the hero action ≈ 0.816
  against a chrome chip ≈ 0.024, a 34× separation no resize can fake.

### D2 — Shop mode

- **A MODE, not a tab.** Entered deliberately from the hero, exited deliberately. Owns the
  viewport above the tab bar and **below every sheet**. The tab bar and the docked composer
  are suppressed while it is up.
- **The type inverts.** The DO LINE leads (17.5pt) and the item name demotes to an 11.5pt
  eyebrow; the cart has those at 15/13.5 the other way round. An UNMATCHED row keeps its name
  in the lead slot. **The inversion is a claim that the do line is more useful, not a house
  style.** One prose line per row, inherited not relaxed.
- **A spent instruction is demoted by SIZE, never by opacity.** The first fix was 11.5pt at
  50% — **2.90:1** against the ground where WCAG needs 4.5:1, so a shopper who checked
  something by mistake could not read back what they had dismissed. 13pt at full muted is
  7.84:1. **Transparency removes contrast from exactly the people who need it and still looks
  fine to whoever shipped it.**
- **Advancing is free scroll, and the active section is the one filling the most screen** —
  not "the last section whose top crossed the viewport top". A collapsed (completed) section
  is ~66pt tall, so that rule leaves the header naming a section entirely off screen.
- **Every branch out of shop mode is an OVERLAY, never a navigation.** It is never unmounted,
  so "return to the same section and scroll position" needs no restoration code. This leaked
  twice on web. In Swift: `fullScreenCover`/`sheet` over a retained view, never a
  `NavigationLink` that pops the walk.
- **Exact scroll restoration**, asserted as an exact offset — not "roughly the same section" —
  through four paths: deep scroll → scan → close; scan open → backgrounded → restored →
  close; ask → real submitted query → close; and the ask reached from *inside* the scan
  overlay.
- **A scan in shop mode acts on the list in front of the shopper** (§B2).
- The screen stays awake **in shop mode only**.

### D3 — The cart and the list

- **The item always stays.** A row the shopper added is never removed, renamed or struck.
  Kristy attaches a note *beside* it. A model-proposed removal cannot touch an owned row
  unless the shopper's own words name it — **including by category**: "no seafood" names the
  salmon. A vague instruction ("make this healthier") names nothing and removes nothing.
- **The summary may not outrun the edit.** If any proposed removal was declined, the model's
  line is discarded and replaced by a true one. A summary claiming "Seafood out." with the
  seafood still on the list is worse than no summary.
- **A build REPLACES, so it is only correct when there is something to build.** A build with
  nothing to add must never empty a populated list.
- **Flag once.** Every row Kristy inspects is stamped, including the ones that earned no
  comment, and the stamp survives the round trip. The same gentle note on every load is
  nagging however kindly worded, and it is what gets an app deleted.
- **A no is permanent, and it suppresses the ITEM, not just the note.**
- **One prose line per row, and when there is a card it is the CARD's.** A matched row is
  name + eyebrow + do line; the authored `why` is suppressed. Suppression keys on whether the
  attachment has *arrived*, not on whether the row has a slug — otherwise the row is blank for
  the length of the fetch.
- **A row sorts by the section it displays, and never displays one it is not sorted into.**
- **An authored `perimeterId` outranks retrieval.** Retrieval overrode 6 of 22 authored ids and
  lost a 7th — a 27% error rate on the only rows where ground truth exists.
- **44pt check targets**, zero horizontal overflow at 390pt.

### D4 — The counter

- **Asking leads.** A question in plain words returns the same sourced answer browsing does.
- **Every answer is decision-first**: the call in one line, the why in one line, the
  checklist, then the full sourced read on tap.
- **Scope is too tight, never too loose — four corrections, all the same direction.** When in
  doubt, admit and let the downstream filters refuse. A wrongly-admitted question costs one
  discarded model call; a wrongly-refused one tells a shopper their question does not belong.
- **A no-match gets the honest miss, never the coach.**
- **`home` (kitchen technique) cards suppress add-to-cart.**

### D5 — The seal, the claim lock, and tiers

- **The gold "Kristy Approved" seal renders only when `tier === 'approved'`.** Every tier
  below gets a plain verdict bar. No exceptions, no "approved-ish" state.
- **A partial label read may not produce a clean approval.** Flags stand (everything matched
  was really printed); only `approved` is withheld, because the unread tail is where the
  canola hides. Low confidence is a miss.
- **The claim lock**: every health/ingredient claim traces to a matched KB entry. Swift
  renders what the server sends and **never composes a claim from parts** — no client-side
  string that says something about a food the server did not say.
- **The tier is a SENTENCE, not a chip.** `tier_note` renders below the do line and is FREE.
  Do not reintroduce a bare tier badge to "make the tier scannable" — a bare classification
  word has no referent. Distribution: established 49 · kristys_standard 24 · time_tested 5 ·
  credible_concern 3.
- **Voice: zero first person.** No "I/me/my", no em-dash asides, half the words. Kristy's
  spoken text is the display face in italic; all factual/UI/ingredient text is the UI face.

### D6 — Money

- **The paid boundary is a SERVER boundary.** Free forever: the card summary (eyebrow,
  headline, do line, cart pick, **and the tier sentence**), all scanning, unlimited asking
  including generation, all browsing, and **the entire list**. Paid: the seven depth fields.
  Swift never receives the depth for a free viewer, so there is nothing to hide.
- **The eight essentials are always full and never touch the meter.**
- **The teaser ships GEOMETRY, never words** — the real first check in full, then true
  character lengths faded, then true counts ("4 more checks, 2 traps").
- **ONE ask component, ONE read meter, and the ask appears at exactly ONE moment**: the
  fourth full-read tap. **Not on open, not on a scan, not on a save, never a banner.** The
  checkable shape of the defect is *an upgrade affordance whose render condition contains no
  action* — tier alone is not a moment, because every non-member satisfies it on every render.
  Three separate asks were removed for this. Chrome (a settings row, a sidebar entry) is
  excluded: those are destinations a shopper navigated to.
- **The list is free, including building it**, behind a daily budget, not a gate.
- **No price, ever, and no price LABEL** — never the words "cheap" or "expensive".

---

## E — THE TEST GAP

`client/test/*.mjs` is Playwright/CDP-driven and **does not port**. What replaces it:

| Rule | Swift analogue | Confidence |
| --- | --- | --- |
| Hero first, largest, not repeated | Snapshot tests per state + XCUITest element order | Good |
| One filled action per state | XCUITest: count filled buttons per state | Good |
| Type inversion (17.5/11.5 vs 15/13.5) | Snapshot per row kind | Good |
| Exact scroll restoration, 4 paths | XCUITest with `XCUIElement` offsets | Good — arguably easier than CDP |
| Overlays never navigate | Unit test on the navigation model + XCUITest back-stack assertion | Good |
| One ask, one meter | Unit test: only one type may call the spend function | **Better than web** (compiler can enforce with access control) |
| Summary/full-read boundary | Unit test over decoded models | Good |
| Seal conditions | Unit tests over fixtures | Good |
| rowMatch / normalizeBarcode | Plain unit tests | Best — pure functions |
| Trip loop (build → check → complete → seed) | XCUITest end-to-end | Good |
| **WCAG contrast off RENDERED colour, folding in every ancestor opacity** | **No cheap analogue** | ⚠️ see below |

### The one with no cheap Swift analogue

**Contrast computed from rendered colour.** `shop.mjs` reads the *composited* colour off the
DOM, so any ancestor opacity anywhere above the text is folded in automatically. That is what
caught the **2.90:1** regression — 11.5px at 50% opacity, which looked fine to whoever
shipped it and was unreadable to the shopper who most needed it. Nothing else saw it: not the
build, not a snapshot diff (the change was subtle and *intentional-looking*), not a reviewer.

SwiftUI has no equivalent read. `Color` does not resolve to a composited RGB you can query,
and `.opacity()` on any ancestor multiplies invisibly. Options, none free:

1. **Render to a bitmap and sample pixels.** `ImageRenderer` → `CGImage` → read the text
   pixel and the background pixel → compute the ratio. Closest to the web check and actually
   viable; the hard part is locating the text pixel reliably (needs a known-position probe
   view, or sampling the darkest/lightest pixel in a known rect).
2. **Forbid the mechanism instead of measuring the outcome.** A lint/unit rule that no text
   style may carry `.opacity(< 1)`, with demotion expressed only as size and a semantic
   colour token. Cheap, and it encodes the actual lesson — *demote by size, never by
   opacity* — but it does not catch a low-contrast token pair chosen honestly.
3. **Precompute the token matrix.** Assert contrast for every (text token, ground token) pair
   used, from the asset catalog values. Catches bad pairings, misses ancestor opacity.

### THE SHIPPING RECOMMENDATION IS 2 + 3. OPTION 1 IS A SPIKE.

**Ship the cheap floor:**

- **(2) Forbid the mechanism.** A unit/lint rule: no text style may carry `.opacity(< 1)`.
  Demotion is expressed as **size and a semantic colour token, never transparency**. This
  encodes the actual lesson and costs nothing. It does not catch an honestly-chosen bad pair.
- **(3) Precompute the token matrix.** Assert the contrast ratio for every (text token, ground
  token) pair the app uses, read from the asset catalog. Catches bad pairings; misses ancestor
  opacity — which (2) has already forbidden.

**⚠️ Option 1 (`ImageRenderer` → `CGImage` → sample pixels) is UNPROVEN and is marked a spike,
not a plan.** I have not verified that it can locate a text pixel reliably enough to read a
contrast ratio in a test. Plausible; undemonstrated. **Do not put it on a critical path.** If
the spike succeeds, run it for shop mode specifically — that is where the 2.90:1 regression
happened and where the stakes are highest: one hand, moving, poor light.

**Do not ship shop mode without (2) and (3) at minimum.**

---

## F — WHAT NOT TO COPY

- **The component tree.** `CartMoment`, `AisleMoment`, `HaulMoment`, `MomentStub` are JSX
  containers, several of which exist because a `moment` string needed a branch. SwiftUI wants
  a navigation model and small views. `CartHeader` was extracted and then **deleted** on web
  once rendering showed the hero superseded it — do not resurrect it from this doc.
- **`moment` as a string.** It is a state machine with five dashboard states plus a mode.
  Model it as an enum with associated values; a dead state name (`setMoment("list")` with no
  `'list'` branch) shipped on web and painted nothing.
- **Tokens as a JS object.** `lib/tokens.js` becomes a **Color asset catalog** with light/dark
  variants and semantic names. Never a Swift dictionary of hex strings — that reintroduces the
  problem the asset catalog solves.
- **`useState`/`useCallback` shapes.** `cart.js` is ~750 lines of hook plumbing around a small
  amount of real behaviour. Re-derive from §D3.
- **The two-surface split (`App` vs `GuestApp`).** One stack; signed-out is a capability.
- **Anything in §D is a RULE to satisfy, not a structure to mirror.**

---

## G — OPEN ITEMS THE SWIFT CLIENT INHERITS

So the new session does not rediscover them.

1. **`POST /api/list/import` is broken** — `req.userId` is set nowhere; 503s for every caller
   after paying for the vision call. No route test. No guest endpoint. `onImport` is not
   passed in `GuestApp`, so the photo-import sheet is unreachable in production.
2. **listVision reinstates crossed-out items** — reproducible on 2 of 3 input shapes, 3/3
   runs each. A struck row is a deliberate removal; putting it back is worse than missing it.
3. **listVision never flags `unreadable`** — zero flags in nine runs, while cursive "tp" came
   back as a confident "butter". `needsFix` and the row `note` have **no renderer**, so the
   server writes "tap to fix it" for a tap that does not exist. **Photo output must land
   EDITABLE.** This is the same shape as a false gold seal: a confident wrong read, presented
   as fact.
4. **`/api/guest/chat` has no cart-command branch.**
5. **`GuestApp` / `App` divergence audit is not done.** Two known divergences were found by
   accident (hero handlers, `onImport`). Nothing says they are the only two — and in Swift the
   right answer is one stack, so this audit is really "what capabilities differ".
6. **Harness sweep for the props-supplied pattern.** `cartHarness`, `shopHarness`,
   `loopHarness`, `composedHarness`, `skim-harness` all construct props; each is a candidate
   for the blindness that let a dead hero ship. **A harness proves the component; only the
   real call site proves the wiring.** The Swift equivalent is a preview that supplies what a
   real screen owns.
7. **Phone sign-in is not live** (10DLC in verification at Twilio). Until it lands every
   visitor is a guest, and **no purchase is possible** — no account, no purchase. Guests are
   deliberately offered no plan buttons for exactly this reason.
8. **`push_tokens` migration outstanding**, deferred with Expo push. Swift would use APNs
   directly; the table is still needed.
9. **Quantity and headcount are deferred**, with measurements recorded in
   `docs/QUANTITY-PROPOSAL.md`. Do not relitigate from intuition.
10. **Scan card is still a full-height takeover; the bottom sheet is specced and unbuilt** —
    and the approved state should be the SMALLEST state in the app. In SwiftUI this is a
    `presentationDetents` sheet over a live camera, which is the natural shape. **Doing it in
    Swift first is defensible.**
11. **Scan card thumbnail** — on a photo read the image slot is empty. Client-side crop, in
    memory for the session, nothing persisted or uploaded beyond the vision call that already
    happens.
12. **List-attachment eyebrow — report only, do not change.** Does "PICKING PRODUCE" above an
    instruction earn its line?
13. **Known-dead code**, unrouted since macro tracking was removed: `/api/photo`,
    `/api/weight`, the weekly-summary pipeline, `mealResolver`. **Do not port any of it.**
14. **The four content duplications** (`GOAL_TEMPLATES`/`FOCUS_ITEMS`, `coachGoals.js`,
    tier→prose, `verdictRamp` strings). See the survey — three of the four are **not** what
    they look like, and only one needs an endpoint before Swift.

---

## What is thin, honestly

- **§A endpoint shapes are names, not schemas.** I listed paths and methods; I did not write
  request/response `Codable` structs. That is the single biggest gap for someone actually
  starting, and it should be generated from the routes rather than hand-written here.
- **§D is comprehensive on rules and silent on layout.** It says the hero is largest; it does
  not say what the dashboard looks like. That is deliberate (§F) but it means a Swift dev has
  no visual target and will need the running web app or screenshots.
- **§E option 1 is unproven.** I have not verified that `ImageRenderer` → pixel sampling
  actually works for a text-on-background contrast read in a test. It is plausible, not
  demonstrated. Treat as a spike, not a plan.
- **StoreKit ↔ RevenueCat ↔ `subscriptions` is sketched, not specified.** The trial has one
  explicit idempotent door and `ensureTrial` is idempotent *by existence*, so a stray write
  permanently spends a shopper's only trial. That interaction with StoreKit needs its own
  section before anyone writes purchase code.
- **Offline behaviour is barely covered.** §B2 says rowMatch must work offline; nothing says
  what the rest of the app does with no network mid-aisle, which is a real store condition and
  a place native could be much better than web.
- **Nothing about App Store review**: the demo/screenshot story, the privacy manifest,
  `NSCameraUsageDescription`/`NSSpeechRecognitionUsageDescription` copy, or account deletion
  (which is required, and which the server already implements at `DELETE /api/account` with a
  `USER_TABLES` sweep). `mobile/docs/LAUNCH_CHECKLIST.md` has some of this.
- **Accessibility beyond contrast** — VoiceOver order, Reduce Motion — is absent. Dynamic Type
  is resolved below rather than left open.

### Dynamic Type versus the type inversion — RESOLVED IN FAVOUR OF DYNAMIC TYPE

**Dynamic Type wins, and §D2 loses nothing, because the rule was never the numbers.**

The rule is **"the do line leads and the item name demotes to an eyebrow"** — a claim that the
instruction is more useful than the name. `17.5pt` and `11.5pt` are how the web client
*expresses* that at one type size; they are not the invariant. A Swift implementation satisfies
the rule at **any** type size by using semantic text styles with the same ordering — e.g. the do
line at `.headline` and the name at `.caption`, or a custom pair with a fixed ratio — so the
hierarchy survives from xSmall to AX5.

What must be tested is therefore **the relationship, not the value**: at every Dynamic Type
size, the do line's rendered size is strictly greater than the item name's, the name still
reads as an eyebrow, and one prose line per row still holds. That last one is where Dynamic Type
genuinely bites — at AX sizes a single prose line will wrap, and **wrapping is acceptable where
truncation is not.** The 44pt check target grows with the type; do not pin it to 44.

The same reframing applies to every other number in §D: the hero being *largest* is a
comparison, not a point size; the 2.90:1 contrast floor is a ratio and is type-size
independent. **Where §D states a number, treat it as evidence of the rule, and port the rule.**
