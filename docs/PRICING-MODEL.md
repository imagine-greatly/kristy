# PRICING MODEL — locked 2026-08-14

The rule lives in `CLAUDE.md` § **Money**. This is the account: the model, the five
questions answered against measured state, and the decisions that are still open.

⚠️ **FIVE RULINGS LANDED 2026-08-14, AFTER THE FIRST DRAFT, AND TWO OF THEM CHANGED THE MODEL
AS ORIGINALLY STATED.** They are folded into the sections below rather than appended, so there
is one description of the model and not two. Recorded here only as an index of what moved:

1. **The account gates the ASK, not the trial** (§1). Trips 1–2 counted on-device, no account.
   Signing in is what continues past the ask, and from that moment the count is server-side.
2. ⚠️ **THE 0-FOREVER FINDING IS THE BLOCKER AND COMES FIRST** (§3). No client writes trips.
3. ⚠️ **THE HAUL IS FREE AFTER THE TRIAL** (§4) — it was "members only" in the original model
   and is not any more. Withholding a record of what someone already did is punitive rather
   than persuasive, and its value comes from trips they can no longer take.
4. **The lapsed dashboard is the greyed last list, with the Counter card the only live
   control** (§4).
5. **The end-of-trip-2 copy is approved as a proposal only** (§5) and ships when signed off.

⚠️ **NOTHING HERE IS BUILT.** Every line below describes an intended state. What ships today
is the *old* boundary — depth-is-paid, three free reads, the fourth-tap ask — and the two
disagree on nearly every point. Where a section says what exists today it is marked
**MEASURED**; everything else is a proposal.

---

## 0. THE MODEL

- **Trips 1 and 2: everything, nothing gated.**
- **The ask lands at the END OF TRIP 2, on Finish** — not at the start of trip 3. The highest-
  intent moment the product will ever produce: they have just walked a store with it. Kristy
  can be specific. Trip 3 is a **reminder**, not the ask.
- **After the trial the Counter stays free**: full cards, the ask, scanning. **Making a list
  and walking a trip are members only.**
- ⚠️ **THE HAUL IS FREE TOO** (ruled 2026-08-14, superseding "the Haul is members only" as
  first stated). It is a record of what they already did, and **withholding it is punitive
  rather than persuasive** — its value comes from trips they can no longer take, which is the
  same argument as the greyed list. **What stays locked is SEEDING**, because "same as last
  week" builds an active trip, and an active trip is the list. See §4.
- **$5.99/month, $44.99/year.**

### Why the Counter stays free — a conversion argument, not generosity

A locked app gets deleted and a deleted app never converts. An app that still answers a
question in an aisle stays installed and keeps proving it knows things, and every answer is an
advert for the thing they cannot do anymore. The corpus has no marginal cost and is
categorically not the product.

**It is deliberately a reference book next to something they have already had. That gap is
the pitch.**

### ⚠️ THE HARD CONSTRAINT: THE GATE NEVER LANDS INSIDE A TRIP

An in-progress trip always completes. This is satisfied *mechanically* rather than by care:
**the allowance is spent at COMPLETION, never at start.** A trip that began while allowance
remained cannot be interrupted, because nothing between start and Finish reads the allowance.

### ⚠️ NO PARTIAL LIST, EVER

Not one free item. Not the list without cards. Not a limited trip. Not a three-row cap.

**The moment the list works at all for free, the trial stops meaning anything and the model
collapses back into freemium.** The list is binary: a member has it, a lapsed shopper reads a
dead copy of their last one. There is no middle setting and no experiment that adds one.

---

## 1. THE ACCOUNT QUESTION

### What each option costs

**Server-side counting** needs an account before trip one. The stated cost is conversions at
the front door, and that is real — but it is not the largest cost, and the largest one is
structural:

- ⚠️ **It inverts the single decision that made the trip loop reachable at all.**
  `Kristy/Core/GuestTrips.swift` exists because all four `/api/trips/*` routes are
  `requireAuth`, so `seedable` was permanently false and a completed list stayed a live cart
  forever. Moving the count to the server puts the whole product back behind that door.
- ⚠️ **MEASURED: the account rail has never once worked end to end.** `apple: true` on the
  live project (2026-08-13), and **no token exchange has ever completed** — the simulator has
  no Apple Account, and there are two `auth.users` rows, both unconfirmed, neither ever signed
  in. Requiring an account before trip one gates 100% of the product behind a rail with zero
  successful runs.
- **MEASURED: `trips` holds 0 rows** (`content-range: */0`, service-role `select`, 2026-08-14).
  So does `subscriptions`, `shopping_lists` and `haul_scans`.

**On-device counting** is trivially reset, and the honest question is what a reset costs the
person doing it:

- A reset is delete-and-reinstall, which clears `UserDefaults`. That takes the trip count —
  **and the trip archive, the active cart, the read meter and the preferences with it.**
- ⚠️ **So the reset is defeated by the same act that destroys the thing they are being asked
  to pay for.** Someone willing to lose their record every two trips is not a lost
  conversion; they were never going to be one, and they still keep the app installed and
  still keep reading the Counter.
- **This is already the shipped posture for the read meter** (`kristy.counter.freeReadsUsed`,
  `CardMeter`), with the reasoning already ruled: an identifier-keyed meter breaks a privacy
  claim to enforce a limit that clearing storage defeats anyway.

### What each leaks

| | leaks |
| --- | --- |
| server-side count | Nothing new about the trip itself — `trips` is already per-user and inside the `USER_TABLES` sweep. What it costs is that **every shopper who wants to walk one trip must first exist as a row in `auth.users`.** |
| on-device count | **Nothing.** No identifier, no IP, no row. |

⚠️ **REJECTED, EXPLICITLY: an IDFV- or IP-keyed server counter.** IDFV survives reinstall
within a vendor, which is exactly why it is tempting. It is a per-device identifier stored
server-side against shopping behaviour, it has no `user_id`, and therefore **the privacy sweep
structurally cannot cover it** — `privacyLine.test.js` parses migrations for tables
referencing `auth.users`, and a table with no such reference is invisible to it. Do not build
this table.

### ⚠️ THE FINDING THAT DECIDES IT: THERE IS NO SERVER-ENFORCEABLE GATE FOR A GUEST

Everything a guest does goes through `/api/guest/*`, which by definition has no account to
check. **The server cannot gate a guest's trips today and could not be made to without an
identifier it must not have.** So for the shoppers who actually exist, the gate is a client
claim whatever else is decided. Any statement that the gate is "enforced" is a statement about
the client.

### ⚠️ RULED 2026-08-14 — COUNT LOCALLY, GATE THE **ASK** ON THE ACCOUNT, NOT THE TRIAL

**A guest can build a list and walk a store today, and that is the thing that sells the app.
Requiring an account before trip one puts a wall in front of the value.**

- **Trips 1 and 2 are counted on-device. No account, no sign-in, nothing asked for.**
- **The ask at the end of trip 2 requires signing in to continue.** Sign-in is the door
  through the ask, not a prerequisite for reaching it.
- **From that moment the count is server-side and cannot be reset.**

⚠️ **THE REINSTALL LOOPHOLE IS ACCEPTED DELIBERATELY. IT IS NOT AN OVERSIGHT AND MUST NOT BE
"FIXED" LATER.** Someone who wipes and reinstalls to dodge a $5.99 ask was never converting.
The cost of blocking them is **every shopper who bounces at a sign-in screen before seeing the
product** — a much larger number, made of exactly the people who would have paid. Any future
proposal to close this hole (a device identifier, a server-side fingerprint, a receipt check
before trip one) is trading a real conversion population for a fake one, and this paragraph is
the answer to it.

### How that ruling is implemented

1. The device holds a **monotonic `tripsCompleted` integer** in `GuestTripBook`, incremented
   in `GuestTripRecord.complete()`.
   ⚠️ **DO NOT DERIVE IT FROM THE ARCHIVE.** `archive` is capped at `archiveLimit = 25` and
   trims from the front (`dropped` counts the loss), so `archive.filter { $0.ending ==
   .completed }.count` under-reports from trip 26 onward — a count that silently starts
   forgiving. It must be its own field, written once, never recomputed.
2. On sign-in, `POST /api/trips/import` carries the completed trips up and **the server count
   becomes authoritative from that moment.** A shopper who reinstalls and signs back in gets
   their real count back; the reset only works for someone who has never signed in.
3. The reset therefore costs the archive and works exactly once per willingness to lose
   everything.

**Accepted leak, named rather than plugged:** a shopper who *never finishes* a trip shops free
forever. Abandoned trips do not count (correctly — see §3), and an untouched trip is reused
rather than archived, so neither can be farmed. What they give up is the entire record: no
Haul, no seeding, no "same as last week". The product's value is in the record, so declining
the record is not an exploit.

---

## 2. WHAT A TRIP-COUNTED ENTITLEMENT COSTS THE SERVER

### Blast radius on `evaluatePremium`: it should be ZERO, and that is a requirement

`evaluatePremium(row, now)` is pure over a `subscriptions` row — no I/O, eleven call sites
through `premiumForReq`, and **mirrored in SQL** as `public.is_premium(uid)`
(`supabase/schema.sql:364`), which RLS depends on.

A trip count is not a subscription. Three shapes were considered:

| shape | verdict |
| --- | --- |
| **(i)** Convert two trips into a time-boxed `trialing` row at grant time | **Rejected.** Dishonest — a shopper who shops once in three weeks loses a trial they never spent. |
| **(ii)** New granting branch inside `evaluatePremium` (`provider='trips'`, `trial_trips_remaining > 0`) | **Rejected.** It is the `grants()` this codebase deliberately refused, one layer down: entitlement stops being a function of time, and **the SQL mirror must change too or it is wrong in one place.** `TRIAL-AND-ENTITLEMENT.md` §3.2 already flags that the mirror is a comment asserting an invariant with nothing enforcing it. |
| **(iii)** Leave `evaluatePremium` untouched; add one narrow helper | **Recommended.** |

**(iii) in full:** one helper, `canRunATrip(req)`, which internally is
`await premiumForReq(req) || allowanceRemaining(req)`. Every gated route calls the helper;
**no gated route calls `premiumForReq` directly.**

⚠️ **ONE HELPER, NOT A RULE TO RETYPE.** This is the `readSwap` lesson exactly: a rule that
must be applied at four send sites was applied at three, and a field was lost. The cost of
(iii) is that a second thing can now grant access — so it gets one name, one definition, and a
test that fails if a gated route reads `premiumForReq` on its own.

### The real cost is not the counting — THE PAID BOUNDARY INVERTS

| | today (**MEASURED**) | under this model |
| --- | --- | --- |
| **paid** | card depth: `DEPTH_FIELDS` = `why, look_for, watch_out, detail, kristy_take, labels_decoded, sources`, stripped by `summarize()` / `forViewer()` before leaving the box | **making a list, walking a trip, the Haul** |
| **free** | the list, all scanning, all asking, all browsing, card summaries | **the entire Counter including the depth**, all scanning, all asking |

What that costs, concretely:

**Retires** (do not delete quietly — each is load-bearing somewhere):
- `DEPTH_FIELDS`, `summarize()`, and `forViewer()`'s withholding branch. `forViewer` becomes
  identity for the depth.
- The read meter end to end: `FREE_READ_LIMIT`, the `free_reads_used` column,
  `GET /counter/cards/:slug/full`'s 402, `CardMeter`, `UpgradeMoment`.
- **The teaser** — geometry, `faded_lengths`, `remaining` counts. Nothing is withheld, so
  there is nothing to tease.
- ⚠️ **The eight essentials lose their REASON, not their order.** They exist so free depth on
  the shelf proves the reads are worth having while the meter proves breadth is what the
  membership buys. With all depth free, the demo has no contrast. **`ESSENTIAL_RANK` survives
  as an editorial shelf — two per section, authored order, never sorted — and that ruling
  stands on its own merits.** Say so explicitly, or the next session deletes it as dead.
- `paidBoundary.test.js` must be **rewritten, not deleted.** It exists because the boundary
  had no test and a field walked across it silently. The new boundary needs the same teeth in
  the same file.

**Gains a gate it has never had:** `GET/POST /api/list`, `/list/rebuild`, `/list/compose`,
`/list/import`, all four `/trips/*`, and `/haul`.
⚠️ **The list has never been gated at all, and one test actively asserts that.**
`cartFree.test.js` greps everything a shopper reads across `client/src` for a save-list ask and
fails if one appears. Under this model that test asserts the opposite of policy — on a client
that is **frozen and cannot be changed.**

**Not affected:** `premiumForReq` at `list.js:131 / :246 / :415` gates *personalization inside*
the list, not the list itself. `list.js:283` is a **budget, not a gate**
(`LIST_COMPOSE_FREE_LIMIT`, 12/day). Those three are a different axis and stay.

### ⚠️ The frozen web client, and why it turns out not to block this

`client/src` is frozen and serves `kristyapproved.com`. Gating the authed routes would strand
a list surface it cannot stop rendering — except that **`GuestApp` is production there and it
calls `/api/guest/*`**, not the authed routes. So gating `/api/list` + `/trips/*` + `/haul`
changes nothing for any web visitor.

Which lands back on §1's finding from the other side: **the guest doors are the product for
every shopper who exists, and they cannot be gated server-side.** The gate is on the device.

### One decision this forces: THERE CANNOT BE TWO TRIALS

The trip allowance **is** the trial. The existing 7-day promo trial —
`POST /api/subscription/trial`, `ensureTrial`, `TrialDoor`, `backfill_trials.sql` — is a second
one, and `ensureTrial`'s idempotency-by-existence **would not catch the overlap**, because the
two are different mechanisms counting different things. One shopper could hold both.
**Decide: the trip allowance supersedes the 7-day trial, or the 7-day trial is deleted.**
Not both, and not by accident.

---

## 3. IS A COMPLETED TRIP COUNTABLE IN `trips` TODAY?

**The schema supports it exactly. The data is empty. For the shoppers who exist it is
structurally uncountable.**

**MEASURED 2026-08-14**, service-role `select` against the live project:

```
trips: http=200  content-range: */0
subscriptions: http=200  content-range: */0
shopping_lists: http=200  content-range: */0
haul_scans: http=200  content-range: */0
```

200 rather than a `42P01`, so the migration is applied. Zero rows in all four.

**Countable by construction:**
- `status text check (status in ('active','completed','abandoned'))` and `completed_at
  timestamptz` (`supabase/trips.sql:48,63`).
- `completeTrip` writes `{status:'completed', completed_at: now}` (`server/lib/trips.js:145`).
- The count is index-backed: `trips_user_completed on trips (user_id, completed_at desc) where
  status = 'completed'`. `select count(*) … where user_id=? and status='completed'` rides it.

**Three caveats, and the second one needs a ruling:**

1. **Nobody can produce a row.** All four routes are `requireAuth`; no one has ever signed in.
2. ⚠️ **`importGuestTrips` writes `status:'completed'`** (`trips.js:362`), up to
   `IMPORT_MAX_TRIPS = 25`, with timestamps clamped to `[now − 1y, now]`. **So the conversion
   door is also the allowance-consumption door:** a converting guest importing two completed
   trips would exhaust a trip-counted trial the instant they signed in — on the same tap that
   was supposed to reward them. **Recommendation: import SETS the count from the device rather
   than adding to it**, because it is the same two trips being carried, not two more.
3. **`abandoned` is correctly excluded**, and two existing rules mean the allowance cannot be
   farmed or accidentally burnt: an untouched trip is **reused, never archived**
   (`startNew`), and completing is **an explicit tap, never the last checkbox**.

**On the device**, the equivalent count today is
`book.archive.filter { $0.ending == .completed }` — **and it is not durable.** See §1's
monotonic-field requirement.

---

## 3a. ⚠️ THE 0-FOREVER BLOCKER, AND WHAT IT TAKES TO MAKE A COMPLETED TRIP REAL

**MEASURED: no client writes trips. `completedTripCount` has never been non-zero on any
account, and could not have been.** This is the blocker and it is upstream of the model.

The tell is `CLAUDE.md` §1.8's: **a `false` that is constant rather than conditional.** Every
piece of the trip lifecycle is built, tested and correct — three statuses, the partial unique
index, the reuse rule, the re-matching seed — and **none of it has ever executed for a real
shopper.** It is unbuilt in effect rather than untested.

### What is actually missing, per side

**Server — nothing is missing. It is finished and unreached.**
`POST /trips/complete`, `/trips/new`, `/trips/next`, `GET /trips/seedable` are all written,
all `requireAuth`, all covered. `completeTrip` writes `{status:'completed', completed_at}`.
The table is applied and indexed. **The server needs one addition and it is small:** nothing
exposes a *count*. `/trips/seedable` answers seedable/items/completedAt, not "how many". Add
`completedTrips` to that response rather than a new route — one field on a door the client
already has to call, versus a second door onto the same fact.

**Client — everything is missing, and the reason is recorded rather than accidental.**
**MEASURED: `KristyAPI` implements no `/api/trips/*` route at all**, and says so under
*"Not implemented, and why"*: each authed route is its own unit of work with its own surface,
and a `Codable` written from `api-shapes.generated.md` and never exercised is a comment
asserting an invariant. That reasoning stands. What it means for this model is that
**"make a completed trip real for a member" is a client project, not a server one.**

**The device before sign-in — mostly built.** `GuestTripRecord.complete()` archives with
`ending: .completed`; the reuse rule and the explicit-tap rule are ported and pinned in
`Tools/triploop`. Two gaps:
1. **The monotonic count does not exist** (§1). `archive` is capped at 25 and trims from the
   front, so the archive cannot carry it.
2. ⚠️ **`CarryOverNotice` is built and has no production call site.** It computes the exact
   disclosure the ask needs — what carries, what is lost — is exercised by `triploop`, and
   renders in `DesignProposals`. **It appears nowhere in `SignInSurface`.** That is finding
   #4's shape exactly: a harness proves the component, only the real call site proves the
   wiring. It is the single cheapest piece of this whole model, and it is already written.

### ⚠️ THE RECONCILIATION AT THE MOMENT OF THE ASK — USE `/trips/import`

**It is the same shape as the conversion door because it IS the conversion door.** The ask at
the end of trip 2 is a converting guest signing in with an archive on the phone. That is
precisely what `importGuestTrips` was written for, and reusing it is right for reasons that
are already load-bearing rather than convenient:

- **The order hazard is already solved inside it.** Adoption of the live cart happens *before*
  the archive is filed, both inside one function, because a caller that sequenced them
  backwards would strand the shopper's active cart forever. **A caller cannot get the order
  wrong because a caller cannot perform either half.** A new reconciliation path would have to
  re-solve that, and would not.
- **It is one-shot on "has this user ever had a trip at all"** — the same gate as adoption. It
  cannot be replayed to inflate history and a second call declines (409) rather than
  duplicating.
- **`status` is server-written**, every row goes through `sanitizeList`, and **timestamps are
  clamped to `[now − 1y, now]` with `started ≤ completed`** — which matters more here than it
  did before, because these rows now decide whether someone has paid. An unclamped
  `completedAt` would sit at the top of `lastCompletedTrip` forever.

**So the reconciliation is: the device count is the truth until sign-in; import carries the
trips; the server count is the truth afterwards.** Three details make that work:

1. ⚠️ **IMPORT SETS THE COUNT, IT DOES NOT ADD TO IT.** These are the same two trips being
   carried, not two more. `imported.length` is already returned. **Getting this backwards
   means the ask consumes the allowance it was asking about** — the shopper signs in to
   continue and is immediately out again, on the same tap.
2. ⚠️ **THE DEVICE COUNT AND `imported.length` WILL DISAGREE, LEGITIMATELY, AND THE SERVER
   MUST WIN.** Import skips empty trips (`reason: 'empty'`) and over-limit ones
   (`'over_limit'`), and abandoned trips never cross. A monotonic device count of 2 can
   therefore import as 1. **The server count is what gates from then on**, and the difference
   is disclosed rather than silently resolved — which is what `CarryOverNotice` is for.
3. **`IMPORT_MAX_TRIPS = 25` already mirrors `GuestTripBook.archiveLimit = 25`.** They must
   stay equal; a comment says so on both sides and nothing enforces it.

⚠️ **AND THE ONE PIECE THAT IS MISSING FROM THE IMPORT PATH ITSELF:** step 1 adopts the live
cart from `shopping_lists.list`, and the thing that puts it there is **`claimGuestWork`, which
lives in `client/src/App.jsx` — the frozen web client, and the inert half of it.** There is no
iOS equivalent. **So on iOS the import door files the archive correctly and the shopper's
ACTIVE cart crosses through nothing.** Both repos' comments describe `claimGuestWork` as
though it were shared infrastructure; it is one function in a file that can never be edited.
**This must be built on the iOS side before the ask can be honest about "your list, twelve
items" carrying over.**

### The order of work this implies

1. The monotonic device count, and `CarryOverNotice` wired into `SignInSurface`.
2. The iOS equivalent of `claimGuestWork` — the active cart's own door.
3. `POST /trips/import` in `KristyAPI`, verified with real HTTP. ⚠️ **It is committed and
   deliberately unpushed. A cleared blocker is not an approval** — it gets reviewed against
   what the client actually needs before it ships, and it is not pushed to make a client work.
4. `completedTrips` on `/trips/seedable`, and the rest of `/api/trips/*` as their surfaces
   get built.

**All four are downstream of one completed Sign in with Apple token exchange, which has still
never happened.**

---

## 4. SURFACE BY SURFACE — WHAT A LAPSED SHOPPER SEES

Lapsed = finished trip 2, did not buy. Guest or member; today, always guest.

### On launch

**The app opens on Home. It always opens on Home.** No interstitial, no modal on open, no
paywall as a launch screen. `initialMoment` has no condition in it and does not get one.

### The dashboard — THEIR LAST LIST, GREYED

⚠️ **NOT AN EMPTY STATE.** Show them **their** last list, intact, greyed, unusable, with the
ask on it. Their twelve items, their four sections.

That is a far stronger reminder than an empty Counter tab, and **it costs nothing to build**:
**MEASURED** — `cart.completedTrips` already returns `[ArchivedGuestTrip]`, each holding the
complete `GuestTrip.items`, every `ListRow` with its name, `cardSection`, `cardSlug` and
checked state. `HaulSurface.FinishedTripCard` already renders exactly this data. **No new
storage, no new fetch, no server call.**

Shape:
- A **sixth hero state, `.lapsed`**, resolved before `.completed` when the allowance is 0. One
  branch at the top of `HeroState.of`. The hero is the ask: it is the answer to *what happens
  next*, and for this shopper the answer is the membership.
- The greyed list renders below the hero, in authored order, with its sections.
- **`TripBar` does not render.** There is no active trip and nothing to resume.
- **One primary action on the surface, and it is the hero's** — `onePrimaryActionAtMost`
  already enforces this on `HomeSurface`.

⚠️ **THE GREYED ROWS ARE NOT INTERACTIVE. NO TAPS, NO CHEVRONS, NO CARD SHEETS FROM HERE.**
The tempting alternative — leave the card chevrons live, since the Counter is free anyway —
is **rejected**: it turns the greyed list into a working browsing index, which is a list that
works, which is the partial list the model forbids. Nothing is lost by killing the taps.
Every one of those cards is one question away on the Counter tab.

⚠️ **THE COUNTER CARD SITS UNDER THE GREYED LIST AND IS THE ONLY LIVE CONTROL ON THE SURFACE**
(ruled 2026-08-14). One card, below the dead list, pointing at the thing that still works.
That is what makes the surface a *contrast* rather than a wall: everything above it is theirs
and frozen, the one thing below it is alive and free.
- **It is not a second primary.** The hero's action is the ask; the Counter card is tier 3 or
  quieter. `onePrimaryActionAtMost("HomeSurface")` already fails the build if that slips.
- **It carries no ask and no price.** It is the free surface's door, and putting a membership
  line on it would be the ask appearing twice on one screen.

### Counter — FREE, AND MORE GENEROUS THAN TODAY

Full cards, unlimited asking including generation, unlimited browsing, every section.

**Where the ask appears: NOWHERE.** The Counter carries no upgrade affordance at all. That is
the entire conversion argument — it is the reason the app stays installed, and an ask on it
would be charging rent on the thing that is doing the selling.

Consequence: `UpgradeMoment` is deleted from the Counter path, and with it the read meter, the
402, and the teaser (§2).

### Scan — FREE

Barcode, label photo, the verdict, the flags, the stamp. Unchanged.
**Where the ask appears: nowhere new.** One ask, one moment (§5).

**Open decision, small:** the personalized verdict note (`decidePersonalization`,
`free_notes_used`, three free tastes) is a *preference-driven* read and belongs with the list
rather than with scanning. Recommendation: **the verdict is free, personalization stays a
member benefit.** It already has its own meter and its own honest fallback, so this needs no
new mechanism — only a decision that "scanning is free" does not silently annex it.

### The list — MEMBERS ONLY, AND READ-ONLY RATHER THAN GONE

A lapsed shopper sees their list. They cannot add, compose, refine, check off, or walk it.

**Read-only, not deleted, not hidden.** The product's standing promise is that the item always
stays — `applyCompose` protects `user` and `imported` rows from a model-proposed removal, and
Kristy attaches a note beside a row and never over it. Taking away the shopper's own writing
to sell it back is the one move that contradicts what the list is.

**Where the ask appears:** on the disabled compose field, once, as its replacement — not as a
banner above the list.

### Shop mode — MEMBERS ONLY, GATED AT THE DOOR AND NOWHERE ELSE

Entering shop mode is walking a trip. **The gate is on ENTRY only.** Never on a row, never on
a section, never on the finish door.

The hard constraint holds mechanically: **allowance is spent at completion, so a trip that
started while allowance remained always completes.** Nothing between entry and Finish reads
the allowance, so there is no code path on which a gate could appear mid-walk even by mistake.

### Haul — ⚠️ FREE (ruled 2026-08-14, superseding "members only")

A lapsed shopper reads their Haul in full. Every finished trip, every bought row, every left-
behind row.

**Withholding a record of what someone already did is punitive rather than persuasive**, and
its value comes from trips they can no longer take — so charging for it charges for the
absence of the thing they are actually being sold. Same logic as the greyed list, and the
same logic that keeps the Counter free: it is a reference to something they have already had,
and that gap is the pitch.

⚠️ **WHAT STAYS LOCKED IS SEEDING, AND THE BOUNDARY IS EASY TO LOSE HERE.** "Same as last
week", carry-forward and the next-trip build all **create an active trip**, and an active trip
is the list. A Haul that seeds is a list that works for free, which is the partial list the
model forbids. **"The Haul is free" means the Haul is READABLE, not that its doors open.**

**Where the ask appears:** on the locked seed door, and nowhere else on the surface.

### Summary of every ask location

| surface | ask |
| --- | --- |
| launch | **none** |
| Counter | **none, ever** |
| Scan | **none** |
| Dashboard | inside the hero action, above the greyed list. Never a banner. |
| The list | on the disabled compose field |
| Shop mode | on entry only |
| Haul | on the locked seed door only — **the record itself is free** |

---

## 5. THE END-OF-TRIP-2 ASK

### Where it renders

On **Finish** — which today exists in **two** places: `HomeSurface.heroAction` in the
`.finished` state, and `ShopMode.finishDoor`.

⚠️ **TWO CALL SITES FOR ONE MOMENT IS THE DEFECT THIS REPO KEEPS FINDING.** So: one component,
presented by whichever door completed the trip, and `completeTrip()` returns whether *this*
completion spent the last allowance. A check fails if any other file presents it — the same
shape as `counter_rules.sh` on `counterCardFull`.

### What it renders

Kristy can be specific, and every number must be true. Available locally at that moment:

| number | source | state |
| --- | --- | --- |
| items | `trip.shoppable.count` | ✅ have it |
| sections | distinct walk sections on the trip | ✅ have it |
| picked up | `rows.filter { $0.checked == true }.count` | ✅ have it |
| **cards read** | — | ⚠️ **NOT RECORDED** |

⚠️ **"Nine cards read" does not exist today and must not be claimed until it does.**
`CardMeter.unlockedCards` is session-only and keyed by slug; `use_count` is a per-card server
counter, not per-shopper. It needs a small per-trip counter on the device. **If it is not
built, the line comes out** — a number in that sentence is arithmetic the shopper can check,
which is the same class of error as an overstated saving on a pricing page.

### The copy — PROPOSAL, for sign-off before it ships

Voice: zero first person, no em-dash asides, half the words. Kristy's spoken line in Playfair
italic; every factual and UI line in Inter.

#### Worked example — a real trip 2: 12 rows, 4 sections, 11 picked up, 9 cards opened

> ### *Two trips, walked.*
> *(Kristy, Playfair italic, largest type on the sheet)*
>
> **Twelve items. Four sections. Eleven picked up.**
> **Nine cards read at the counter.**
> *(Inter, factual — these are the numbers, and they are theirs)*
>
> That was the free run. Building a list and walking it are the membership from here.
>
> The counter does not change. Every card, every question, every scan stays free. So does the
> haul.
>
> $5.99 a month, or $44.99 a year.
>
> *Two finished trips come with you.* *(the `CarryOverNotice`, only when it has something)*
>
> **[ Sign in to continue ]**
> **[ Not now ]**

#### The template, and where every number comes from

| slot | source | fallback if absent |
| --- | --- | --- |
| `{items}` items | `trip.shoppable.count` | ✅ always present |
| `{sections}` sections | distinct walk sections on the trip | **drop the clause** if 1 |
| `{checked}` picked up | `rows.filter { $0.checked == true }.count` | **drop the clause** if 0 |
| `{cards}` cards read | ⚠️ **NOT RECORDED TODAY** — needs a per-trip counter | **drop the whole line** |
| carry-over line | `CarryOverNotice.of(book)` | **render nothing** — it returns nil when there is nothing to disclose |

⚠️ **A NUMBER THAT IS NOT MEASURED DOES NOT GO IN THE SENTENCE.** "Nine cards read" is
arithmetic the shopper can check, in the same class as an overstated saving on a pricing page.
If the per-trip card counter is not built, **that line is cut and the ask is four lines
instead of five.** It is not filled with an estimate, a session count, or `use_count`.

#### Why the buttons read that way

- **`Sign in to continue` names the act, not the promise.** The ruling is that the account
  gates the ask; the tap opens sign-in, not a purchase. A button reading *"See the
  membership"* would be describing what happens two steps later, and a guest cannot complete
  a purchase from here — `canPurchase` is false for a guest by construction, and buying needs
  an account.
- ⚠️ **THE PRICE IS DISCLOSED IN THE BODY, NOT ON THE BUTTON, AND THAT IS THE RECONCILIATION
  OF TWO RULES THAT PULL OPPOSITE WAYS.** `auth.md` §9 says no price is named to anyone who
  cannot pay it, because a price beside a door that does not open is the dead "Start shopping"
  with a number attached. Here the door **does** open, onto sign-in. **Concealing the price to
  win a sign-in would be the worse violation of the same principle** — it makes the tap a
  trick. So: the number is said plainly in the body, and the button promises only the sign-in
  it can actually deliver.
- **Both prices are derived, never authored here.** `Pricing.monthlyCents = 599` and
  `annualCents = 4499` are the only two numbers written down anywhere.
  `purchase_rules.sh` fails if a currency amount appears in any other Swift file, **so this
  copy must interpolate them and must not spell them.**
- **"Not now" must actually work.** Trip 3 is a reminder, not the ask. Declining costs nothing
  beyond a quieter door, and nothing on trip 3 re-presents this sheet.

#### The three lines that are load-bearing, and why each stays

1. **"That was the free run."** It names the trial as having been a trial. Without it the gate
   reads as something that was switched on, rather than something that was spent.
2. **"The counter does not change… So does the haul."** This is the pitch. It makes the free
   half legible as a **decision** rather than as leftovers, and it is the sentence that keeps
   the app installed. ⚠️ **The haul clause is newly true** and is the part most likely to be
   dropped by someone working from the original model.
3. **The numbers.** Generic copy at this moment wastes the highest-intent moment the product
   will ever produce. *They have just walked a store with it.* "Twelve items, four sections,
   eleven picked up" is evidence; "unlock the full experience" is a banner.

#### What the copy must never do here

- **Never name what they lose.** No "you will lose your list", no countdown, no strike-through.
  The greyed dashboard already shows them, and showing beats threatening.
- **Never apologise for the ask**, and never soften it into a question. One verdict per
  headline is a voice rule and it applies to this sheet too.
- **No em-dash asides. No "I", "me", "my", "we" or "our".** The draft above is clean; check any
  revision against `VOICE_SPEC.md` rather than against this file.
- **Never a price on the button, and never a price anywhere for a shopper who cannot reach a
  purchase at all** if that state ever exists again.

### Trip 3 — the reminder is the state of the door, not a new thing on screen

No modal, no banner, no second sheet, no re-presentation of the ask. On trip 3 the hero's
action **is** the membership door, above the greyed list, with the Counter card below it. That
is the whole reminder.

It satisfies the standing rule that an upgrade affordance whose render condition contains no
action is a banner: the render condition here is **a spent allowance and a real door**, not a
tier check that every non-member satisfies on every render.

---

## 6. ⚠️ THE BOTTOM LINE THAT OUTRANKS ALL FIVE

**MEASURED: nobody can buy anything today, under any model.**

- `Purchasing.isAvailable` is `provider != nil`, and **no provider is ever injected** — no
  RevenueCat package, no key, no products. Constant false.
- `Capabilities.canPurchase` is false for every real visitor, because every real visitor is a
  guest.
- **Sign in with Apple has never completed a token exchange once.** `apple: true` on the live
  project, and the simulator has no Apple Account to mint one with.

So the ask, however well built, currently terminates in a door that does not open. **The
StoreKit adapter and one completed sign-in are upstream of every line in this document**, and
building the pricing model before them produces a paywall nobody can pay.

---

## 7. OPEN DECISIONS

**Closed 2026-08-14 by ruling:** the account question (§1), the Haul (§4), the lapsed
dashboard (§4), and **import SETS the count rather than adding to it** (§3a).

Still open:

1. **Two trials cannot both exist** (§2). Does the trip allowance supersede the 7-day promo
   trial, or is the promo deleted? ⚠️ `ensureTrial`'s idempotency-by-existence **would not
   catch the overlap**, because the two count different things.
2. **Is personalized verdict-note metering annexed by "scanning is free"?** (§4).
   Recommendation: no.
3. **What replaces `paidBoundary.test.js`'s assertions** once the boundary inverts (§2). The
   file must not simply be deleted.
4. **Does the web client keep the old model forever?** It is frozen, it is served by
   `/api/guest/*`, and gating the authed routes leaves it untouched — so the answer is
   probably "yes, by omission", and that should be a decision rather than a side effect.
5. **The end-of-trip-2 copy** (§5) is a proposal awaiting sign-off.
