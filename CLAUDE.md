# CLAUDE.md — Kristy Grocery-Coach Overhaul

Working branch: `overhaul/grocery-coach`. This file holds the non-negotiables for the overhaul. They apply to **every** step and must survive a `/clear`. The step-by-step plan lives in `BUILD_QUEUE.md`; the full brief in `OVERHAUL.md`; the condition-focus + education extension in `STEP1b_focuses_and_education_prompt.md`.

## What we're building

Repositioning Kristy from a chat-first nutrition logger into a **grocery coach**. Scan is the front door, chat is the moat, and the primary nav is three moments: **List (before) · Scan (in aisle) · Haul (after)**. The coaching relationship stays — it just anchors to concrete artifacts (a scan, a haul, a list) instead of a blank chat box.

## Non-negotiables (inherit these on every step)

1. **Reuse the locked brand. Never invent.** Near-black forest green, gold accents, Playfair Display + Inter, thin gold thread/dot motif. Import from the centralized tokens module (Step 0). Kristy's coaching/spoken text = `kristyVoice` (Playfair italic); all factual/UI/ingredient text = Inter. Never substitute a color or face.

2. **The claim lock is law.** Every health/ingredient claim comes from a matched entry in `kristy_ingredient_knowledge_base.json`. The model may rephrase tone but may NEVER introduce a concern, cancer link, or claim not in the data it was given. Enforce structurally (strip entries to allowed fields before the model call), not just in the prompt. This is the liability shield — it holds on every surface that speaks in Kristy's voice: verdict note, haul read, list reasoning, chat.

3. **No-treatment rule.** Kristy is a coach, not a doctor. Dietary focuses are preferences the user turns on about themselves, never inferences. Never claim to treat/manage/lower/reverse/cure a condition, never state or imply the user has a diagnosis, never give a medical directive. Preference framing only ("you're watching sodium…").

4. **The stamp is earned.** The gold "Kristy Approved" seal renders only when `tier === 'approved'`. Every tier below gets a plain verdict bar. Never show the seal for a swap or skip.

5. **Don't reshape the Step 1 engine output.** The matched-entry object shape from `server/lib/verdictEngine.js` is consumed directly by the note composer and the card. Extend it additively if needed; never restructure it — the tests and the claim lock depend on it.

6. **Preserve what works.** Guest mode (IP rate-limited, soft-gated at the 4-exchange threshold), phone OTP auth (Supabase + Twilio), the `isPremium()` gate (provider-agnostic: RevenueCat for Apple IAP, Stripe on web), USDA macro logging, weight logging + adaptive TDEE, Vercel Web Analytics, privacy policy / ToS, 7-day memory context, the weekly Sunday-summary and proactive-insight triggers. This is a repositioning of the surface and value prop, not a rewrite of the plumbing.

## Architecture

The verdict engine is authoritative and lives **server-side** on Railway (`kristy-server`): KB + matching + tier scoring + the one claim-locked Haiku note call, behind `POST /verdict`. The web SPA and the Expo/RN app are thin clients that render the returned verdict object. Build the web SPA first as the reference; the RN port for App Store submission comes after the queue.

## Workflow

- One step at a time, in `BUILD_QUEUE.md` order. Build → run the step's acceptance check → commit → continue.
- One commit per step, message prefixed `feat(<area>): … (Step N)`.
- Pause only if an acceptance check fails or you hit a real decision. Don't ask permission between passing steps.
- If a git object write fails with "permission denied," it's the OneDrive sync locking `.git` — retry the commit; if it persists, stop and tell me. Never hand-edit the KB or committed files to recover.
- Verify against the engine + live scripts, not the old client (the old scan path 400s against the new `/verdict` contract until Step 4 repoints it — that's expected mid-overhaul).

## Status

Keep this current as steps land.
- ✅ Step 0 — design tokens centralized
- ✅ Step 1 — KB-driven verdict engine (`caedf1f`)
- ✅ Step 2 — `/verdict` + claim-locked Haiku note (`97c8ea0`)
- ✅ Step 3 — scan verdict card (`client/src/components/ScanVerdictCard.jsx`)
- ✅ Step 4 — scan paths repointed to `/verdict` (barcode + label-vision extraction → card; OFF→vision fallback; `server/routes/scan.js`, `server/lib/{scanExtract,labelVision}.js`, client `runProductScan` + `ScanSheet`)
- ✅ Step 5 — three-moment nav List·Scan·Haul (`BottomNav`, Scan centered/primary opens camera; chat demoted; guest scanning live w/ universal layer; `ScanHome`, `MomentStub`)
- ✅ Step 6 — 60-second onboarding: goal + non-negotiables → `user_goals.{coach_goal,non_negotiables}` (new `/api/onboarding/coach` + trial), header `GoalChip`, config-driven `coachGoals.js` (focuses append-ready), first-scan payoff. Feeds goal+nonNegotiables into every /verdict. Grocery onboarding is now the gate; TDEE `Onboarding.jsx` preserved. ⚠️ DB persist path not live-exercised (no Supabase in env); goal→note change verified live.
- ✅ Hardening — scan input pipeline: (1) barcode miss / unreadable auto-pivots to the label-photo path (`ScanSheet.onLabelFile`); (2) language guard (`pickEnglishText` + `looksNonEnglish`) rejects non-English OFF text AND foreign vision transcription so an unreadable product never gets a silent stamp. Verified: guard unit + live invariant (extraction never returns a foreign string); English products still resolve.
- ✅ Focuses + Education extension (A–D): KB condition tags (`glycemic_impact`, `cardiovascular_relevance`); engine thresholds (`SODIUM_HIGH`/`ADDED_SUGAR_HIGH`; sat-fat read-not-penalized) + bounded focus escalation (never skip via focus, no fabrication, stamp preserved, focus-relevant surfaces first); onboarding focus multi-select + one-time coach-not-doctor disclaimer + `focuses` persistence; note guardrail (preference framing, no treat/manage/diagnose, traces to KB/nutrition); `kristy_education.json` + one-ism-per-card selection + ambient rotation. Verified: 24 unit + `extension.livetest.js` (engine/education/live note) + client render checks.
- ✅ Step 7 — Haul surface: scans recorded to `haul_scans`; `HaulMoment` shows trip/week distribution bar (approved/note/swap), scrollable item list w/ tiers, and Kristy's weekly read (`generateHaulRead` — claim-locked, kristyVoice, next-week nudge). Actions: Add to next list (→ `kristy:nextList`, feeds Step 8), Share haul (web share; Step 10 adds the branded card). Verified: `haul.livetest.js` (distribution + live read) + render checks.
- ✅ Step 8 — List builder (HYBRID line, user-chosen): `ListMoment` — goal-templated checklist (`lib/list.js`) minus non-negotiables, with Haul swaps prepended; add/remove/check, persisted. Learning signals (keep/remove/accepted-swap) logged from day one → removed items never re-suggested; sets up the later scoring upgrade over hauls/memory/training with no rebuild. Client-only (localStorage) for now. Verified: generation/filter/learning + render checks.
- ✅ Step 9 — chat as connective tissue: no blank box. `ChatLauncher` offers concrete artifact entry points (scan/haul/list) when the thread is empty; each artifact (verdict card, Haul, List) has "Ask Kristy about this" → `openChat` seeds an AI opener grounded in that artifact (rides in conversationHistory → memory/rate-limit/errors unchanged via `/api/chat`). Meal logging + coaching preserved. Verified: launcher + affordance renders; build.
- ✅ Step 10 — shareable haul card: `haulCanvas.js` draws the scorecard to a branded 1080×1350 PNG (forest green + gold, thread/dot, distribution + legend + Kristy's read + wordmark + CTA); `HaulShareCard` overlay wires Share → web share sheet (PNG file). "Hide personal data" toggle strips the read + switches counts to %; branding stays. Verified: recording-ctx draw checks + build.
- ✅ Step 11 — repositioned free/paid gate on the provider-agnostic `isPremium` (RevenueCat + Stripe, trial preserved). Free = scan + universal layer, always; paid = personalized note + focus escalation, Haul weekly read, List builder. Twist: first 3 personalized notes free regardless of trial state (lifetime `free_notes_used` counter), then gated. Upsell + Upgrade copy name the specific value in Kristy's voice (not "go premium"). Verified: `premium.livetest.js` (3-tastes→gate, provider-agnostic) + client gating renders; build.
- ✅ Step 12 — final audit delivered (findings ranked; no fixes auto-committed). Fixes since, per user direction: H-1 (`791786c`) chat prompt no-treatment/no-diagnosis guardrail + "coach not doctor" reframe (live-verified redirect); M-1 + M-2 (this commit) analytics `track()` on scan/verdict/haul-share/list-build + guest scan card sign-in nudge. Deferred (user): L-1..L-4 (a11y/soft-gate polish), L-2 won't-fix (counter race favors user). Live-smoke TODO (needs migration applied): onboarding/haul_scans/free_notes_used persistence; List is localStorage-only (not cross-device).
- ℹ️ Scan stress-test (`scan.stresstest.js`): #1 failure = OFF-US barcode coverage gap (~40% hit); vision path robust. Both proposed fixes now built (above). Remaining ops idea: OFF backoff+cache so throttling ≠ false-missing.

### Post-queue blocks (A–D)
- ✅ Block A — favicon set generated from the hair silhouette (`client/tools/make_favicons.py`, reproducible): 16/32/48/180 + `.ico`, forest ground baked in. Small sizes simplify by *thickness* (open the interior dark regions so sub-pixel strand gaps fill; seed-and-regrow the negative-space face) rather than blurring, which blobs the contour. Wired into app/landing/privacy/terms + manifest. Leaf emoji gone repo-wide, incl. the RN entry loader (`984edac`).
- ✅ Block B — verdict card was already listing every matched flag; the KB one_liners and the 5 `history` entries were already why-first and verbatim. Real work was two defects found while verifying: `severityColor` mapped high+moderate to the same gold (4 severities, 3 dots) and guests got untappable flag rows despite the endpoint being public. `scripts/ingredient.livetest.js` (`60148ae`).
- ✅ Block C — **hard lines are now deterministic** (`server/lib/hardLines.js`): they were prompt-only, so "no seed oils" never actually blocked anything. A declared line resolves to KB ids, escalates on the bounded ladder, and withholds the seal; custom lines are `kb:<id>` from a name+alias search. `gluten-free`/`dairy-free` stay ADVISORY — the KB has no such data and claiming to check it would be fabrication. Hard lines apply on free + gated paths (KB read, no model call). Taxonomy +6 goals/+4 focuses/+8 lines, every new focus backed by a real KB category or nutrition field. Free-text intake maps onto the enum and is re-filtered against it server-side (`preferenceMap.js`). Premium reachable in one tap from 6 places; chat given its own persistent affordance above the moment row (not a 4th tab — the three moments are a sequence); List tags Kristy-added/haul items; first-ever `max-width` breakpoint at 400px. `scripts/preferences.livetest.js` (`6d68e42`, `3215ab7`).
- ✅ Block D — landing on the forest ground (flat, not a page gradient: body's background propagates to the canvas and sizes from the root box); all four beat visuals in a phone silhouette; Yuka named once in the hero (+ verbatim meta), comparison generic; tier cards carry the framing sentence + explicit verdicts; gym register retired; 430px breakpoint (`766db53`).
- ⚠️ **Verify mobile over CDP, not `--window-size`.** Chrome enforces a ~500px minimum window on Windows: `--window-size=390` renders at 504 and crops the screenshot, which looks exactly like horizontal overflow. Use `Emulation.setDeviceMetricsOverride` (see the scratchpad `shot.mjs` pattern).
- ❓ Open decision — **no `margarine` entry in the KB.** `margarine` is deliberately NOT aliased onto `partially_hydrogenated_oil`: most US margarine was reformulated PHO-free after the ban, so that alias would tell a user their trans-fat-free tub "contains artificial trans fat." Either leave unmatched or add a `margarine` entry with its own honest severity/tier.
