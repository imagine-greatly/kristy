# PRICING MODEL — locked 2026-08-14

The rule lives in `CLAUDE.md` § **Money**. This is the account: the model, the five
questions answered against measured state, and the decisions that are still open.

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
- **After the trial the Counter stays free**: full cards, the ask, scanning. **Making a list,
  walking a trip, and the Haul are members only.**
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

### RECOMMENDATION

**Count on-device. Make the account the thing that PRESERVES the count, not the thing that
enforces it.**

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

### Haul — MEMBERS ONLY, EXCEPT THEIR OWN HISTORY

Same argument as the list: a lapsed shopper keeps **reading** the trips they finished. Locking
someone out of their own record is the same mistake as deleting their list.

What is locked is the **seeding** — "same as last week", carry-forward, the next-trip build.

**Where the ask appears:** on the locked seed door.

### Summary of every ask location

| surface | ask |
| --- | --- |
| launch | **none** |
| Counter | **none, ever** |
| Scan | **none** |
| Dashboard | inside the hero action, above the greyed list. Never a banner. |
| The list | on the disabled compose field |
| Shop mode | on entry only |
| Haul | on the locked seed door |

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

### The copy

Voice: zero first person, no em-dash asides, half the words. Kristy's spoken line in Playfair
italic; every factual and UI line in Inter.

> **Two trips, walked.** *(Kristy, Playfair italic — largest type on the sheet)*
>
> Twelve items. Four sections. Nine cards read. *(Inter, factual)*
>
> That was the free run. Building a list, walking it, and reading the haul are the membership
> now.
>
> The counter does not change. Every card, every question, every scan stays free.
>
> **[ See the membership ]**  $44.99/year · $3.75/month, billed yearly
> **[ Not now ]**

Notes on the copy:
- The third line is the pitch and it must stay. It is the sentence that makes the Counter's
  freeness legible as a *decision* rather than as leftovers.
- **Both prices are derived, never authored here.** `Pricing.monthlyCents = 599` and
  `annualCents = 4499` are the only two numbers written down, and `$3.75` is arithmetic with
  the saving **floored**. `purchase_rules.sh` fails if a currency amount appears in any other
  Swift file.
- **"Not now" must actually work.** Trip 3 is a reminder, not the ask; declining costs nothing
  beyond a quieter door.

### Trip 3 — the reminder is the state of the door, not a new thing on screen

No modal, no banner, no second sheet. On trip 3 the hero's action **is** the membership door,
sitting above the greyed list from §4. That is the whole reminder. It satisfies "an upgrade
affordance whose render condition contains no action is a banner" — the render condition is a
completed allowance and a real door, not a tier check.

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

## 7. OPEN DECISIONS — none of these are made here

1. **Two trials cannot both exist** (§2). Does the trip allowance supersede the 7-day promo
   trial, or is the promo deleted?
2. **Does import set or add the count?** (§3, caveat 2). Recommendation: set.
3. **Is personalized verdict-note metering annexed by "scanning is free"?** (§4).
   Recommendation: no.
4. **What replaces `paidBoundary.test.js`'s assertions** once the boundary inverts (§2). The
   file must not simply be deleted.
5. **Does the web client keep the old model forever?** It is frozen, it is served by
   `/api/guest/*`, and gating the authed routes leaves it untouched — so the answer is
   probably "yes, by omission", and that should be a decision rather than a side effect.
