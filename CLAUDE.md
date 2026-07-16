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
- ⬜ Step 7 → 12 + focuses/education extension — pending
- ℹ️ Scan stress-test done (`scan.stresstest.js`): ~40% barcode hit (OFF-US coverage gap = #1 failure) vs robust vision path; localized-text false-approve = #2. Fixes NOT built — awaiting go-ahead.
