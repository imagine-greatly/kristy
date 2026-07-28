# CLAUDE.md — Kristy

Branch: `main`. This file is the **current state** of the product and the rules that
bind every change to it. It must survive a `/clear`. It is not a task log: when a
decision stops being load-bearing, delete it from here.

---

## What Kristy is

A **grocery coach for the whole store**, not a scanner with a list.

The store has two halves and Kristy covers both. The **labeled** half you scan
(boxes, bags, cans). The **unlabeled** half no scanner can read: meat, fish, eggs,
produce, dairy, bulk. The unlabeled half is the moat — a barcode reader is a weekend
build; a deep, sourced, honestly-tiered knowledge base for the counter is not.

The **cart is the center**. Scanning vets packaged things *for* the cart, the counter
answers the unpackaged things going *in* the cart, and the haul reads how it came out.
Everything orbits the cart; nothing outranks it.

**Kristy is not a calorie tracker.** Macro tracking was removed as a feature (not
hidden, not opt-in). No macro cards, no meal logging, no "logged it" UI, and no
qualitative macro asides in chat. This is enforced structurally by `macroGuard`, not
only by prompt.

---

## Non-negotiables

1. **Reuse the locked brand. Never invent.** Near-black forest green, gold accents,
   Playfair Display + Inter, thin gold thread/dot motif. Import from `lib/tokens.js`.
   Kristy's spoken text = `kristyVoice` (Playfair italic); all factual/UI/ingredient
   text = Inter. Never substitute a color or a face.

2. **The claim lock is law.** Every health/ingredient claim traces to a matched entry
   in a knowledge base. The model may rephrase tone but may NEVER introduce a concern,
   a statistic, or a claim it was not given. Enforced **structurally** — entries are
   stripped to an allowed-field whitelist before the model call — not just in the
   prompt. It holds on every surface that speaks in Kristy's voice: verdict note, haul
   read, cart reasoning, perimeter answer, chat.

3. **No-treatment rule, and it is symmetric.** Kristy is a coach, not a doctor. No food
   treats, manages, cures, prevents, or lowers the risk of anything — and none *causes*
   a disease either. The guardrail once forbade curing but not causing, which let "seed
   oils cause heart disease" through. Objections are rooted in processing, which is
   checkable. Focuses are preferences the user turns on about themselves, never
   inferences. Anything medical defers to a doctor.

4. **The stamp is earned.** The gold "Kristy Approved" seal renders only when
   `tier === 'approved'`. Every tier below gets a plain verdict bar.

5. **Never reshape the engine output.** The matched-entry shape from
   `server/lib/verdictEngine.js` is consumed directly by the note composer and the card.
   Extend additively; never restructure. The tests and the claim lock depend on it.

6. **Voice: zero first person.** See `VOICE_SPEC.md`. No "I/me/my", no em-dash asides,
   half the words. The tier ownership is *rephrased, not deleted*: "flagged on the
   whole-food standard, not settled science". A reader must always know whether a claim
   is settled science, a credible concern, or a standard.

7. **No price, ever.** Kristy does not know what anything costs. Budget means
   cost-conscious food *selection*. Relative terms only, never a number.

8. **No negative claims about named brands.** Teach the label truth instead ("pasture-
   raised means space, not feed — the word to find is soy-free"). It is defensible,
   never goes stale, and makes the shopper competent at every product.

---

## Architecture

- **Server is authoritative** (`server/`, Railway). KB + matching + tier scoring + the
  claim-locked model calls. Clients are thin renderers.
- **Two knowledge bases, never merged.**
  `kristy_ingredient_knowledge_base.json` (74 entries) scores products — it is the only
  thing the verdict engine sees. `kristy_perimeter_kb.json` (77 entries) answers
  *questions* about the counter and is **never** fed to the engine.
- **Web SPA is the reference client**; `mobile/` (Expo/RN) is the App Store port.

---

## The interface

**Nav: Cart · Scan · Counter · Haul** — four equal tabs, no throne. Scan and Counter are
identical in size and treatment because they are the two ways to fill the cart, and that
equality *is* the positioning.

- **Cart** is home, unconditionally. Empty, it asks what the trip is for rather than
  dumping a template; the answer builds it. Chat-editable from the docked composer.
- **Scan** = the packaged half: barcode, or a label photo that reads anything.
- **Counter** = the unlabeled half. Browsable by section (Produce · Meat · Seafood ·
  Dairy & Eggs · Pantry & Bulk · Label terms) *or* asked in plain words from the
  composer on any surface. Its picks add to the cart in one tap.
- **Haul** reads the trip back and carries items forward.

---

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

**The counter**
- The free layer is **public** (`optionalAuth`): a deterministic KB read with no model
  call and no stored data. Requiring an account bought nothing and cost a stranger the
  exact thing they came to try. Only the *personalized* read is premium.
- `cart_pick` is a grocery **NAME** and is deliberately not one of the seven fields
  `sanitizeForModel` passes, so the model can never mint one.
- A section that doesn't cover something says so (`thinNote`). Naming the gap is what
  makes the covered part trustworthy.

**Demo and failure**
- **Demo must never fabricate, and never under-report.** It once silently engaged on a
  misconfigured production build and served a fixture for every scan; separately, hand-
  maintained demo mirrors of the counter and of chat went stale and made the product look
  thinner than it is. Demo now reads the real public endpoints and keeps a fallback only
  for its actual purpose: no backend at all. Fake data is never the safer failure.
- A missing env var **names itself**; three layers catch a bad deploy (null client, React
  error boundary, an inline boot guard in `app.html` — the only one that can catch a
  module-evaluation crash). `VITE_API_URL` is required in a production build.

**Money**
- Price *ids* are configuration, never hardcoded, and the client never sees them.
  Displayed prices have exactly one source per client (`lib/pricing`).
- The trial has **one explicit door** (`POST /api/subscription/trial`), idempotent.
  Setting a goal grants nothing — coupling them silently spent a 7-day trial on a casual
  goal-tap and killed the 3-free-notes taste mechanic.
- Free = scan + the universal layer + the counter's free layer, always. Paid =
  personalized note, focus/constraint-aware cart, haul read, conversational cart edits.

---

## Verifying

- **Verify mobile over CDP, not `--window-size`.** Chrome enforces a ~500px minimum
  window on Windows: `--window-size=390` renders at 504 and crops, which looks exactly
  like horizontal overflow. Use `Emulation.setDeviceMetricsOverride`.
- Measure, don't eyeball: geometry claims ("equal weight") should be read off
  `getBoundingClientRect`, not judged from a screenshot.
- `cd server && npm test` (197 tests). Client: `cd client && npx vite build`.
- If a git write fails with "permission denied", it's OneDrive locking `.git` — retry.
  Never hand-edit the KB or committed files to recover.

---

## Open items

- ⚠️ **Nothing is deployed.** No Vercel project has ever existed for this repo (no
  `.vercel/`, `list_projects` returns empty). Pushing to GitHub publishes nothing.
- ⚠️ **Migrations not applied to a live DB** (`supabase/schema.sql`): `scanned_products`,
  `shopping_lists`, and the `user_goals` columns `coach_goals` / `constraints` /
  `macro_tracking`. Code degrades gracefully without them, so this is untested against a
  real database, not broken.
- ⚠️ **Phone OTP** needs the Supabase dashboard corrected (provider + Twilio creds). The
  client call is correct and now names the distinct failure modes instead of blaming the
  typed number.
- **Known-dead, left in place**: `/api/photo`, `/api/weight`, the weekly-summary
  pipeline, `mealResolver`, `store.js setMacroTracking`; client `lib/logging.js
  sendPhoto`, `api.js sendWeightLog`, several `data.js` readers, `lib/dayBoundary.js`.
  Unrouted since macro tracking was removed; DB tables untouched. Delete in a dedicated
  pass.
- `mobile/docs/LAUNCH_CHECKLIST.md` still lists the pre-launch prices ($8.99/$49.99);
  shipped pricing is $7.99/mo and $59.99/yr.

---

## Companion docs

| File | What it is |
| --- | --- |
| `VOICE_SPEC.md` | The voice rule, in full. Still enforced in all six model prompts. |
| `VISION.md` | Character direction. Deliberately post-mechanics, largely unbuilt. |
| `README.md` | How the thing runs: setup, endpoints, data flow. |
| `BARCODE_COVERAGE.md` | Provider options assessed, none integrated. A decision doc. |
| `mobile/docs/LAUNCH_CHECKLIST.md` | Unfinished App Store submission work. |

One-shot task specs are deleted once shipped; the reasoning worth keeping lives above.
