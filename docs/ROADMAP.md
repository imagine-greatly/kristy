# ROADMAP — the path to production

Written 2026-09-21 against `main` `02c1c42`. **Verified** here means one of: a command run this
session with its number quoted, a file read back from disk, or a dated owner measurement in a
companion doc. Anything else is marked *unknown, needs measure*. Re-count numbers; never carry them.

**The product:** a beautifully useful and warm guided grocery shopping app that helps a shopper
navigate the store in its entirety and emerge as healthy as possible with their haul: the right
goods in every section, and guidance on how to shop for each item.

## 1. Where we are

| area | state | evidence | dialed? |
| --- | --- | --- | --- |
| engine + ingredient KB | 74 entries, claim lock, whole-food fat tripwire, 730/0 suite | `cd server && npm test` → 730 pass, 0 fail, `main` 02c1c42, 2026-09-21 | yes |
| counter corpus | 97 live rows (94 curated + 3 generated); KB 116 (94 cards + 22 picks). Bar A 65/65 shelf cards. Gaps: `watch_out` empty on 2 cards; `sources` missing on `judging_meat_at_the_case`, `produce_storage` | migration count 2026-09-21; `docs/research/depth-gap.md` | no (4 fields) |
| iOS surfaces | Home, Scan, Counter, Haul, ShopMode, CardSheet, Auth, Membership, Settings all built to spec; no TODO markers | `kristy-ios/docs/ios-specs/*.md` (14 specs); last UI run 2026-09-08: 42 pass / 8 fail, re-anchored same day, **not re-run since** | unknown, needs measure |
| visuals | 18 colorsets, **0 imagesets**. App icon exists (`AppIcon_1024.png`, 1024², universal) but is the **dark-stock brand**: near-black ground, brass hair silhouette. Seal artwork not made (`seal.md` §0). Warm pass PROPOSED, unbuilt (`warm-pass.md` §0) | `kristy-ios/Kristy/Resources/Assets.xcassets/AppIcon.appiconset/`; `kristy-ios/docs/ios-specs/seal.md`, `warm-pass.md` | no |
| money | Ships depth-is-paid + 3 free reads + 4th-tap ask. Locked model (`PRICING-MODEL.md`) NOT built. RevenueCat adapter built 2026-08-15, never transacted. PURCHASING §7.0 blockers A–H all closed 2026-08-18 | `docs/PRICING-MODEL.md` §0–§3a; `kristy-ios/docs/PURCHASING.md` §0, §7.0 | no (decision §3) |
| accounts | `apple: true`, `email: true`; **no Sign in with Apple token exchange has ever completed**; zero accounts on any rail | `PURCHASING.md` §0; `CLAUDE.md` Infrastructure state | no (needs device) |
| store listing | Copy, keywords, privacy answers, review notes written and counted. Five shots exist, split across three dirs, and **stale** (card copy moved on migration) | `docs/APP-STORE-LISTING.md` §1–§8 | no (reshoot last) |
| infra | `push_tokens.sql` not applied; `hello@kristyapproved.com` receipt unverified; local `ANTHROPIC_API_KEY` placeholder | `CLAUDE.md` Infrastructure state; `supabase/push_tokens.sql` exists | no |

## 2. Is it dialed?

The engine and corpus are dialed; the store half of "beautifully useful" is real and measured. "Warm"
is carried by copy alone today: there is not one image, plate or illustration in the app (0
imagesets), the seal renders as geometry with no artwork, and the only ambient line on iOS is the
empty Haul's (`kristy-ios/Kristy/Surfaces/HaulSurface.swift:133`). The app icon is the old dark-stock
brand with brass off the plate, against non-negotiable #1. `warm-pass.md` measured the flatness
(44 bare card fills at 1.110:1) and its fix is proposed, not built. Whether the surfaces still pass is
unknown: the UI suite has not run since 2026-09-08. Nothing on the money or account path has ever
executed for a real person.

## 3. Decisions Devon makes before step 1

**Money.** (a) *Baseline, today:* depth-is-paid, 3 free reads, ask on the 4th tap; listing copy
already matches; nothing to build. (b) *Build the locked model first:* counter free, list + trip paid,
ask at end of trip 2; client project (`KristyAPI` trips routes, monotonic `tripsCompleted`,
`CarryOverNotice` wiring, `canRunATrip` server helper, `paidBoundary.test.js` rewrite, listing
rewrite); weeks, untestable until P0. (c) *Ship (a), build (b) as 1.1 after two weeks of real trips.*
**Recommended: (c).** The model's own §1 says the gate is a client claim either way; building it
blind ahead of the first real sign-in stacks unproven on unproven, and VISION.md's sequencing rule
(mechanics first, then depth) applies to money too.

**Visuals.** (a) icon on paper + seal artwork only; (b) (a) + six section plates (Produce, Meat,
Seafood, Dairy & Eggs, Pantry & Bulk, Label terms) for the counter index; (c) full illustration pass
across every surface. **Recommended: (b).** The icon is a brand-rule violation and the seal is the
stamp that is earned; plates give the counter its warmth in six images without touching layout. All
via Higgsfield (`generate_image_batch` + `jobs_wait`); **spends credits, confirm before each batch.**

## 4. The path to production

Owners: **Devon** (needs hands on a device or a dashboard) · forge@tier · scout · critic · researcher
· Higgsfield · main (T0). SSH = doable now from the Mac mini.

**P0 Gate — Sign in with Apple on a real device (Devon, physically)**
1. Complete one token exchange on hardware per `kristy-ios/docs/ios-specs/siwa-config-runbook.md`;
   verify per `device-verification-protocol.md`. Verification: `auth.users` gains one confirmed row;
   `GET /api/subscription` returns a body on the device. Unblocks: P3, P6 (IAP must be purchasable).
2. Sandbox buy / restore / cancel / lapse per `PURCHASING.md` §6 step 5 and §7.3 (Devon). Verification:
   `subscriptions` row with `provider='apple'`; RevenueCat transfer proven (§7.0 E).

**P1 Corpus close-out (SSH now)**
3. researcher@sonnet: fetch sources for `judging_meat_at_the_case` and `produce_storage`, and
   `watch_out` material for the two empty cards; append dated sections to
   `docs/research/meat-sources.md` and `docs/research/produce-sources.md`. Verification: every URL
   fetched, quotes archived. (Step 1 below.)
4. scout@haiku: `path:line` anchors for the four KB entries in `server/kristy_perimeter_kb.json` and
   the two watch_out-empty slugs (depth-gap.md lists `egg_storage`, `judging_meat_at_the_case`,
   `produce_storage` as KB `watch_out` N; confirm which two the session measured).
5. forge@sonnet [T1]: author the four fields from the archive only, claim-locked. Verification:
   `cd server && npm test` → 730/0; `node server/scripts/listMatchProbe.js` exit 0; grep each cited
   URL verbatim against the archive. Then migrate (`node server/scripts/migrateCounterCards.js`
   from `server/`) and record the post-upsert count in `CLAUDE.md` Infrastructure state.

**P2 Visuals (Higgsfield; SSH now; credits)**
6. Higgsfield: app icon on the paper stance. Direction: ground `#CFBA8E` kraft, mark in green-black
   ink `#14251A`, Fraunces wordmark if any (seal.md §0: the icon may carry words, the seal may not),
   **no brass** (brass is plate-only). Anti-slop: no photoreal produce, no gradient globe, no
   silhouette-of-a-woman (today's icon). Reference: a printed grocer's paper bag stamp. Replace
   `AppIcon_1024.png`. Verification: `Tools/checks/palette_mirror.sh` unchanged and green; icon
   read back visually. [PLACEHOLDER: wordmark yes/no, Devon]
7. Higgsfield: seal artwork per `seal.md` (no words; forest green + brass on the plate only). Add as
   the first imageset. Verification: renders only on `tier == approved` (CardSheet), static.
8. Higgsfield: six section plates, one batch, same palette, ink-line engraving style on kraft, no
   text. [PLACEHOLDER style anchor: 19th-c. seed-catalogue engravings]. forge@sonnet [T1] wires
   them into the counter index rows. Verification: `Tools/checks/contrast.sh` green; UI run in P5.
9. Devon decides `warm-pass.md` (two named decisions at its foot). If yes: forge@opus [T2] per that
   doc's pieces, Swift only, zero server change.

**P3 Money (per §3)**
10. If (a)/(c): nothing to build; re-read `APP-STORE-LISTING.md` §3 "three full reads" line against
    `CardMeter.freeReads` (still 3). If (b): planner@fable writes the model plan from
    `PRICING-MODEL.md` §0–§3a; T4 tournament for the client trip routes (N=2). Blocked on P0.

**P4 Infra**
11. scout: does the shipping iOS build register a push token? If yes, Devon applies
    `supabase/push_tokens.sql` in the SQL editor; verification: real `select` on `push_tokens`
    returns 200 (`docs/SCHEMA-AUDIT.md` shape). If no, defer and say so. SSH for the scout.
12. Devon: send one mail to `hello@kristyapproved.com` from an outside account and read it back.
    An MX record is not proof.

**P5 UI run + fixes (SSH; one run, ~23 attaches vs 20/hour; erase device first)**
13. `kristy-ios/Tools/checks/runners_compile.sh` then `Tools/checks/run_all.sh`, then one
    `Tools/uisuite/run.sh` on iPhone 17 Pro Max only. Reds → fixer@sonnet with the failure text.
    Record the count with date. Runs after P1 migration and P2 land, never inside an hour of a shoot.

**P6 Listing, shots, submit**
14. main (T0): re-run the counts in `APP-STORE-LISTING.md` §1–§4; re-check §6 age rating (new cards
    add no alcohol reference). Devon: App Store Connect fields, privacy answers verbatim from §7.
15. Reshoot as the LAST act: `APP-STORE-LISTING.md` §8 runbook, `-only-testing:KristyUITests/AppStoreShots`,
    `export_shots.sh`, five slots, 1320×2868, clock 9:41. Read each PNG by eye. SSH-doable.
16. Archive + upload (SSH `xcodebuild archive` is possible with the signing team from PURCHASING §7.0 F;
    the Connect submission clicks are Devon's). Then re-read blocker B (`Ready to Submit`).

Order over SSH while P0 waits: 3 → 4 → 5 → 6 → 7 → 8 → 9 → 11 → 13. Needs Devon physically: 1, 2,
12, and the clicks in 14/16.

## 5. Step 1 — next session

Task: P1 step 3. Paste:

```
researcher model: sonnet [T1]
Fetch sources (Firecrawl; .gov 403s from this box, use govinfo.gov / law.cornell.edu / extension
sites) for two counter cards and archive them. Cards: `judging_meat_at_the_case` (meat, shelf:
colour, purge, marbling, pack date, "enhanced"/solution disclosure) and `produce_storage` (produce,
home: ethylene producers vs sensitive, crisper humidity, counter vs fridge). Also gather watch_out
material for the two cards whose KB `watch_out` is empty (depth-gap.md names egg_storage,
judging_meat_at_the_case, produce_storage; archive for all three).
Append a dated `## Roadmap P1 sources (2026-09-2x)` section to
/Users/m1/kristy/docs/research/meat-sources.md and /Users/m1/kristy/docs/research/produce-sources.md:
per source URL, fetch date, 2–5 verbatim quotes, and which card field each quote can support.
Rules: no health-outcome claims, no prices, no brand criticism (CLAUDE.md non-negotiables 3, 8, 9);
2+ sources per card, 1+ with a fetched URL. Do not edit the KB. Report ≤20 lines: sources per card,
any card with <2 fetchable sources.
```

## 6. Not on the path

- `VISION.md` character work: sequenced after real store use, by its own rule.
- Swap engine: catalog is the prerequisite (`docs/CATEGORY-CAPTURE.md`); rows do not exist.
- Category capture: held proposal.
- Phone sign-in: dead product-wide, ruled 2026-08-19.
- `client/src`: frozen; inspiration only.
- `PASS3-HANDOFF.md` §14 #2 (list design review), #6 (eyebrow report), #8 (harness sweep): web-client
  work on a frozen client. §14 #4/#5 (scan bottom sheet, photo thumbnail) stay open items, post-1.0.
  #7 (GuestApp/App divergence audit) is planned and parked: run it only if a Swift session finds
  itself opening `App.jsx` for a spec.
- `mobile/` Expo client and `mobile/docs/LAUNCH_CHECKLIST.md`: not the live build; its listing copy
  (macros, Health & Fitness, SMS) contradicts the product and must not be copied.

Supersedes as the queue: `docs/PASS3-HANDOFF.md` §14; that section's remaining items are listed in §6
above or folded here (#10 rotisserie shipped 2026-09-21).
