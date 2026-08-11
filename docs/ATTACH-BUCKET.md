# The attach bucket — a door metered by a budget sized for a different act

**Status: PROPOSED 2026-08-11. Not written, not applied.** Scoped server work with its own
prompt, per `CLAUDE.md` → "This repo has two halves". Found from the iOS side while measuring
why the UI suite cannot complete on a clean bucket; the finding is client-observed, the change
is entirely server-side.

---

## The rule that settles it is already in the file

`server/lib/guestRate.js` opens with it:

> ⚠️ **THE RULE IS "DOES THIS REACH A MODEL", AND IT IS ANSWERED PER CALL SITE — NEVER PER
> ROUTE BY HAND.** […] Before adding a limiter to a new door, name the model call it protects.
> If you cannot, it belongs in one of the bucketed ceilings below.

`POST /api/guest/list/attach` cannot name one. Its handler is three statements —
`sanitizeList`, `attachCards`, `res.json` — and `attachCards` is a synchronous scan of an
in-memory KB. No model call, no DB write, no outbound request. The route's own comment says so:
*"Deterministic, no model call, so it costs a KB scan of an in-memory array and is not
metered."*

**So it is already on the right side of the model question, and that is not what is wrong with
it.** It draws `cartBuildLimited` — the 20-per-hour **cart-build** bucket — and that is a
ceiling sized for a different act entirely.

### This is the fourth instance of one correction, not a new defect

Every bucket in that file exists because "which budget does this door draw" was answered by eye:

| door | was drawing | corrected to | why |
| --- | --- | --- | --- |
| `/perimeter/ask` | inference (8/hr) | `counterAsk` — 40/hr | deterministic KB read |
| onboarding cart build | inference (8/hr) | `cartBuild` — 20/hr | deterministic template |
| `/guest/scan/barcode` | inference (8/hr) | `scanLookup` — 60/hr | Supabase read + OFF fetch |
| `/guest/verdict` | inference (8/hr) | `scanLookup` — 60/hr | deterministic KB scoring |
| **`/guest/list/attach`** | **`cartBuild` — 20/hr** | **its own bucket** | **deterministic KB scan, and a different act from a cart build** |

The first four moved a door **out of the inference pool**. This one is a step the same
reasoning has not yet been applied to: having established that a deterministic door gets a
bucketed ceiling **sized for the act it protects**, attach was put in the nearest existing
bucket rather than given one. The file's own scan-bucket ruling is the precedent:

> ⚠️ **A BUDGET SPENT IN HOPS CANNOT BE READ AS A BUDGET FOR ANYTHING A SHOPPER DOES.**

A cart build is something a shopper does **once**, at the start of a trip. An attach is
something the **client** does — on every cold launch carrying uncarded rows, and once per added
item. They are not the same act, they are not the same frequency, and one ceiling cannot be
sized for both. Twenty is generous for cart builds and too small for attaches, which is exactly
what a shared ceiling always is: right for whichever act it was named after.

---

## The measurement

### The ceiling is 20. The UI suite needs ~23, and it cannot go lower.

`Cart.attachCards()` fires when the list holds any `user`/`imported`/`template` row with
`carded != true`. Counted from the call sites in `kristy-ios/KristyUITests`, by fixture — a
fixture with no active list (`empty`, `completed`, `haulmixed`) cannot produce one:

| test class | attach-triggering launches |
| --- | --- |
| `ShopModeShots` | **11** — `ready` ×6, `midtrip` ×4, `scanmatch` ×1 |
| `HomeSurfaceShots` | **7** — the 6-state loop contributes 4, plus `ready` ×2 and `nonfood` ×1 |
| `ComposeRoomShots` | **2** — `ready` ×2 |
| `AuthSurfaceShots`, `OnboardingShots`, `TabShellUITests`, `DesignProposalShots` | 0 — all launch `empty` |
| `HaulSurfaceShots` | 0 — `empty`, `completed`, `haulmixed` all have `active: nil` |
| `CounterUITests`, `ScanSurfaceShots` | **unbounded, ≤15** — see below |

**The deterministic floor is 20 — exactly the ceiling — before the last two rows contribute
anything.** Measured total on the last full run: ~23.

⚠️ **`CounterUITests` and `ScanSurfaceShots` set no `-kristy.debug.trip`, so they inherit
whatever the previous test seeded**, because the fixture writes to `UserDefaults` and the
simulator keeps it across launches. Whether those 15 launches attach depends on whether the
rows they inherit are already carded — which depends on whether the earlier attaches
**succeeded**. That is the next finding.

### ⚠️ A refused attach makes MORE attaches, not fewer

`Cart.merge` writes `carded` back through `save()` → `record.saveCart(list)`. So:

- attach **succeeds** → rows persist as `carded: true` → later launches make **no call**.
- attach **is refused** → rows persist uncarded → **every later launch retries**.

The bucket has positive feedback. Once it is spent, the population of uncarded rows on the
device stops shrinking, so the call rate goes **up** for the rest of the window. This is why
the suite total is a range rather than a number, and why "re-run on a fresh hour" — which four
skip messages currently advise — is a weaker remedy than it sounds: the second run starts from
a device whose rows are still uncarded and asks for more attaches than the first.

### Why the suite is evidence about shoppers, not just about the suite

The reflex reading is "the test suite is a heavy client, size the bucket for CI". That is not
the argument, and sizing for the suite would be the same mistake one layer along.

**A real shopper exceeds 20 on an ordinary trip.** One attach per added item is the shipping
behaviour (`Cart.add` → `attachCards`), and the fixture list this repo uses as "a trip" is
twelve items. A shopper who builds a list of twelve, adds eight more in the aisle, and opens
the app cold three times has spent 23 — the same number, for none of the reasons the suite
spends it. The suite is a *detector* here, not the subject: it made a shopper-facing ceiling
measurable by exceeding it reproducibly.

---

## What is proposed

**A bucket of its own, sized in attaches, with the arithmetic written down** — the shape the
scan bucket already established so a later change cannot halve it in silence.

```
/* ── Card attachment — a SEPARATE bucket, and the fourth time this correction is made ──
   POST /api/guest/list/attach reaches no model: sanitizeList, then a synchronous scan of an
   in-memory KB. Per this file's rule at the top it never belonged in the inference pool, and
   it is not in it. What it WAS in is `cartBuild`, sized for an act a shopper performs once a
   trip — while an attach is performed by the CLIENT, on every cold launch carrying uncarded
   rows and once per added item.

   ⚠️ SIZED IN ATTACHES, AND THE MULTIPLICATION IS THE POINT. A shopper's trip is one build
   plus one call per item added plus one per cold launch. Twelve-item list, eight aisle
   additions, three launches = 23 — over the 20 it used to share. …
*/
const ATTACH_WINDOW_MS = 60 * 60 * 1000;
const ATTACH_ADDS_PER_TRIP = 20;   // list build + items added in the aisle
const ATTACH_LAUNCHES_PER_TRIP = 10;
const ATTACH_TRIPS_PER_WINDOW = 2;
const ATTACH_MAX_PER_WINDOW =
  (ATTACH_ADDS_PER_TRIP + ATTACH_LAUNCHES_PER_TRIP) * ATTACH_TRIPS_PER_WINDOW;  // 60
```

**60** lands it alongside `scanLookup`, which is the right neighbour: both are per-act client
calls made while someone walks a store, and both are cheap enough that the ceiling exists to
stop corpus-walking rather than to ration cost.

It still needs a ceiling, and the route comment already says why: *"Rate-limited on the shared
cart bucket only so it cannot be used to walk the corpus."* That reason survives the move
unchanged — every card it names is free to read at `/api/counter/cards/:slug` anyway.

### The files

| file | change |
| --- | --- |
| `server/lib/guestRate.js` | `attachLimited(ip)` + the constants above; add `attach` to the exported `BUDGETS` with `adds`/`launches`/`trips` alongside `max`, so a test asserts the relationship rather than restating the number |
| `server/routes/guest.js` | `/list/attach` calls `attachLimited` instead of `cartBuildLimited`. **One call site — `cartBuildLimited` stays on `/list/build` untouched** |
| `server/lib/guestBudget.test.js` | assert the split **per handler**, per `CLAUDE.md` — a file-wide grep cannot, because `guest.js` legitimately contains both |

### Rejected: raising `CART_MAX_PER_WINDOW`

One-line, and it is the defect this file's header is about. It leaves two unrelated acts on one
ceiling, so the next person to size it has to satisfy both and can only get it right for one —
and it makes the cart-build budget move for a reason that has nothing to do with cart builds.
**The point of the correction is separation, not headroom.**

### Not proposed, deliberately

- **No change to the response shape.** `/list/attach` answers **429 `{error:'rate_limited'}`**
  while the scan doors answer **200 `{gate:true}`**. That inconsistency is real, but the client
  swallows an attach failure by design (*"a list with no cards on it is still a list"*), so no
  shopper can currently tell the two apart. It is a finding, not part of this change.
- **No client change.** `Cart.attachCards` catching silently stays correct: card attachment must
  never be able to break someone's trip. What the client should gain is the ability to *report*
  a refusal to the suite — separate, and iOS-side.
- **Nothing about `POST /api/list/attach`** (the authed twin). Different door, `requireAuth`, no
  guest bucket.

---

## What this does not fix

Recorded because it is the standing risk the whole file sits under, from `CLAUDE.md`:

> ⏳ **THE GUEST BUDGET IS A PROPERTY OF UPTIME, NOT OF THE SHOPPER.** All four buckets are
> module-level `Map`s in one process, so every deploy hands every IP a full budget back.

Five buckets after this change, same property. Raising a ceiling that resets on every deploy is
still worth doing — the ceiling is what a shopper hits mid-trip, and mid-trip is not when
Railway happens to redeploy — but this change does not touch that and must not be read as
having addressed it.
