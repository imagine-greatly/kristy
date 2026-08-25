# APP STORE LISTING — Kristy 1.0

**Everything App Store Connect asks for, written once, with the character counts measured
rather than estimated.** Copy the fenced blocks verbatim; the prose around them is the
reasoning, and it is here so a later session does not re-derive a decision or quietly widen a
claim.

⚠️ **THE PRIVACY ANSWERS ARE A SIGNED STATEMENT ABOUT WHAT THIS APP DOES WITH A SHOPPER'S
DATA.** They were derived by reading source and the two vendors' shipped manifests on
2026-08-20, not from a template and not from memory. **§7 names the one thing that has to
change in the app before they are true.** Over-declaring is not the safe direction here: the
label is a claim, and a false generous one is still false.

⚠️ **EVERY COUNT IN THIS FILE IS MEASURED. RE-COUNT AFTER ANY EDIT, DO NOT CARRY IT FORWARD** —
this repo's own recurring defect. `python3 -c "print(len(open('f').read()))"` on the block.

---

## 1. Subtitle — 30 max

```
Grocery coach for every aisle
```

**29 characters.** The app name carries no meaning to someone who has never heard it, so the
subtitle does the entire job of saying what this is: **grocery** (the category), **coach** (not
a scanner, not a tracker), **every aisle** (the positioning — the counter is included).

⚠️ **`grocery` IS SPENT HERE ON PURPOSE AND IT IS NOT LOST.** Apple indexes the app name and the
subtitle alongside the keyword field, so a term in the subtitle is searchable *and* readable.
Putting the single biggest term where a human also sees it is the efficient move; it is also why
`grocery`, `coach`, `for`, `every` and `aisle` may not appear in §2.

Alternates, if this one is ever changed — **each frees and spends different keywords, so §2 must
be re-checked with it:**

| candidate | chars | note |
| --- | --- | --- |
| `The whole store, not just cans` | 30 | Strongest positioning, weakest search. "cans" is not a term anyone types. |
| `Shop the whole store better` | 27 | Reads well, says nothing a competitor could not say. |
| `A grocery coach for the counter` | 31 | **Over the limit.** Listed because it is the obvious next thought and it does not fit. |

---

## 2. Keywords — 100 max, comma-separated, no spaces

```
shopping,list,food,ingredient,label,scanner,barcode,produce,meat,seafood,dairy,eggs,organic,healthy
```

**99 characters, 14 terms.** No space follows a comma — a space is a wasted character
and Apple does not need one.

✅ **RULED 2026-08-20 BY THE OWNER: THE LAST SLOT IS `healthy`, AND IT IS SETTLED.** The
argument is reach, not rank: **`healthy` is what someone types when they do not know what they
want**, which is a bigger surface than `butcher` or `pantry` — **and both of those are already
implied by the description**, which names the counter and the sections outright. ⛔ **Do not
re-open the swap table below to re-argue this**; it is kept for its measurements, not as a live
question.

**Nothing here repeats the app name or the subtitle.** Excluded for that reason and that reason
only: `kristy`, `grocery`, `coach`, `for`, `every`, `aisle`.

**Why singular, and why no phrases.** Apple builds search phrases by combining the tokens, so
`shopping` + `list` already covers "shopping list" and spending nine characters on a literal
phrase buys the same result twice. Singulars are used throughout because Apple stems; `scanner`
is preferred over `scan` because it stems *down* to cover both and the noun is what people type.

**The last slot was the one to argue about, and it is now decided** (ruling above). `additive`
held it because it is a term this app can plausibly rank for; it lost to reach. The alternatives,
kept for their measurements:

| swap `additive` → | total | why you might |
| --- | --- | --- |
| ✅ `healthy` | **99** | **CHOSEN.** Much larger volume and a new app will not rank on it — but it is the word for a shopper with no noun yet, and that is the surface neither of the next two reach. |
| `butcher` | 99 | Narrow and very on-message for the counter. **Already implied by the description.** |
| `pantry` | 98 | Broad, generic, competitive. **Already implied by the description.** |
| `market` | 98 | Stems to "supermarket"/"farmers market". |

⚠️ **THE TOTALS IN THAT TABLE WERE THREE LOW AND ARE RE-MEASURED ABOVE.** Every row was computed
against an 89-character base; the string without `additive` is 92 including its trailing comma.
Nothing changes — all four fit either way — but **a number in this file is a measurement, and one
carried forward without being re-run is how the corpus count drifted for eight days.**

⛔ **DO NOT ADD A HEALTH-OUTCOME TERM** — `keto`, `paleo`, `detox`, `cholesterol`, `antiinflammatory`.
Kristy's no-treatment rule is structural in the product, and a keyword that promises an outcome
the app is built never to claim is a promise the first screenshot contradicts.

---

## 3. Description

⚠️ **THE FIRST 157 CHARACTERS ARE THE WHOLE HOOK.** A search result and the product page above
the fold show roughly two to three lines before "more", and nobody taps "more" to find out
whether they care. **The paragraph below the rule is what most people will ever read.** Do not
open with a greeting, a tagline or the app's name.

```
The store has two halves. A scanner reads the boxes. Nobody reads the counter — the meat, the fish, the eggs, the produce, the bulk bins.

Kristy reads both.
```
<!-- ↑ 157 characters. Everything below is past the fold. -->

```
ASK THE COUNTER — FREE, AND UNLIMITED

Type a question the way you would say it out loud. "Wild or farmed salmon." "Which cut for stew." "What pasture-raised actually leaves out." You get the call in one line, the reason in one line, and a short checklist for the case in front of you — then the better pick lands on your list in one tap.

Produce · Meat · Seafood · Dairy & Eggs · Pantry & Bulk · Label terms.

SCAN THE PACKAGED HALF

Point at a barcode, or photograph an ingredient list and Kristy reads all of it — including the part in six-point type at the bottom. She tells you what she found and what it means. The gold seal is earned, not handed out; most things do not get one.

BUILD THE LIST BY SAYING WHAT THE WEEK IS

"Two dinners, nothing with seafood, something for lunches." The list builds itself, sorts by section, and carries the one note that matters on each row. Change your mind in the same box — "no seafood, more lunches" — and it rewrites around what you already have.

WALK THE STORE WITHOUT LOSING YOUR PLACE

Shop mode is one section at a time, full screen, with the instruction in the largest type on the phone. Tick things off as you go. Scan something and it acts on the list in front of you.

READ THE TRIP BACK

The haul shows what you picked up and what you left behind, and carries it into next week.

WHAT KRISTY WILL NOT DO

No calorie counting. No macros. No meal logging. Nothing to weigh and nothing to confess to.

No food treats, manages, prevents or causes a disease — she is a coach, not a doctor, and anything medical goes to your doctor.

Every claim traces back to a sourced entry in her knowledge base. She cannot invent a concern she was not given.

She will not run down a brand. She teaches the label instead — "pasture-raised means space, not feed; the word to look for is soy-free" — which is defensible, never goes stale, and makes you better at every product on the shelf.

WHAT IS FREE

All scanning. Unlimited questions at the counter. Every card's call, its reason, and where that call stands — settled science, credible concern, or Kristy's own standard. And the entire list: building it, walking it, and reading the haul afterwards.

WHAT MEMBERSHIP BUYS

The depth behind each card — the full sourced read, what to look for, what to watch out for, and the label language decoded. Three full reads are free to try, and eight essential cards are always full for everyone.

Kristy Membership is $5.99 per month or $44.99 per year. Payment is charged to your Apple Account at confirmation of purchase. It renews automatically unless it is turned off at least 24 hours before the end of the current period, and you can manage or cancel it in your Apple Account settings at any time.

Privacy policy: https://kristyapproved.com/privacy
Terms of use: https://kristyapproved.com/terms
```

**Why the structure is this way, so it is not "tidied" later:**

- **"WHAT KRISTY WILL NOT DO" is a selling section, not a disclaimer.** Every competitor in this
  category counts something. Saying plainly that this one does not is the differentiator, and it
  doubles as the honest statement of the no-treatment rule that App Review will look for.
- **The free/paid split is stated in the listing itself.** Apple requires the subscription
  price, length and renewal terms in the metadata for an auto-renewable subscription; stating
  what is free in the same breath is what stops a reviewer reading the screenshots as a bait.
- ⚠️ **"Three full reads are free" is the real number** (`CardMeter.freeReads = 3`, the ask on
  the fourth tap). **If that constant moves, this line moves with it.**

---

## 4. Promotional text — 170 max

```
The half of the store no scanner can read: meat, fish, eggs, produce, bulk. Ask in plain words, get the call in one line, add the better pick in one tap.
```

**153 characters.** It sits above the description and is **editable without shipping a build**,
which is what it is for — use it for the thing that is true this month. It deliberately does not
duplicate the description's first paragraph, because both are visible at once.

---

## 5. What's New — version 1.0

⚠️ **APP STORE CONNECT DOES NOT SHOW A "WHAT'S NEW" FOR A FIRST RELEASE, AND MAY NOT EVEN OFFER
THE FIELD.** Written here because 1.0.1 is a week away and this is the shape the first real one
should take: what changed, in a shopper's words, no version numbers, no "bug fixes and
performance improvements".

```
Kristy's first release.

The counter is open: ask about meat, fish, eggs, produce, dairy and bulk in plain words and get an answer you can act on where you are standing. Scan the packaged half. Build the week's list by describing it. Walk the store one section at a time.
```

---

## 6. Category and age rating

**Primary category: Food & Drink. Secondary: Shopping.**

⛔ **NOT Health & Fitness, and this is a decision rather than a toss-up.** That category invites
review against the health guidelines, and this app is built to make no health claim at all — the
no-treatment rule is symmetric and structural. Filing it under Health & Fitness would ask a
reviewer to check it against a standard it deliberately does not meet, for a category placement
that is worse anyway: people looking for a grocery app do not browse Health & Fitness.

**Age rating: 4+.** Every question in the questionnaire answers to the lowest band:

| question | answer |
| --- | --- |
| Cartoon or Fantasy Violence / Realistic Violence / Prolonged Graphic Violence | None |
| Sexual Content or Nudity / Graphic Sexual Content | None |
| Profanity or Crude Humor | None |
| Alcohol, Tobacco, or Drug Use or References | **None** — see the note below |
| Mature/Suggestive Themes | None |
| Horror/Fear Themes | None |
| **Medical or Treatment-Focused Content** | **None** — see the note below |
| Simulated Gambling / Contests | None |
| Unrestricted Web Access | **No** — there is no in-app browser |
| User-Generated Content | **No** |
| Age Assurance / age-restricted controls | Not applicable |

⚠️ **TWO ANSWERS ARE WORTH BEING ABLE TO DEFEND, BECAUSE BOTH LOOK ARGUABLE FROM OUTSIDE:**

- **Medical or Treatment-Focused Content — None.** The product rule is that no food treats,
  manages, cures, prevents or *causes* anything, it is enforced structurally rather than by
  prompt, and anything medical defers to a doctor. **If a reviewer challenges this, the answer
  is the claim lock and the no-treatment rule, not a softening of the listing.**
- **Alcohol/Tobacco references — None.** Nothing in the shipped corpus is about either. ⚠️ **This
  answer is a property of the corpus and the corpus grows.** A wine or beer card would change
  it, and the age rating is a submission-time answer nobody re-opens. **Re-check before any
  submission that adds cards.**

**Unrestricted Web Access is No** because the only outbound links are `openURL` to
`kristyapproved.com/privacy` and `/terms`, which hand off to Safari. There is no `WKWebView` and
no `SFSafariViewController` in the app.

**Other App Store Connect toggles:** contains in-app purchases **Yes**; contains ads **No**; made
for kids **No**; third-party analytics **No**; third-party advertising **No**.

---

## 7. App Privacy

**Measured 2026-08-20 by reading `Kristy/PrivacyInfo.xcprivacy`, the auth and purchase sources,
and the two linked packages' own shipped manifests.** RevenueCat 5.83.2 declares exactly one
collected type (Purchase History, unlinked, App Functionality); **supabase-swift ships no privacy
manifest at all**, which is allowed — it is not on Apple's required-manifest SDK list.

### Data Used to Track You

**None.** No analytics SDK, no ad framework, no IDFA, no ATT prompt, and nothing is combined with
data from other companies — which is what "tracking" means in Apple's definition.

### Data Linked to You

| type | category | purpose |
| --- | --- | --- |
| **Email Address** | Contact Info | App Functionality |
| **User ID** | Identifiers | App Functionality |
| **Purchase History** | Purchases | App Functionality |
| **Other User Content** | User Content | App Functionality |

- **Email Address** — Sign in with Apple requests `[.email]` and never `.fullName`, and the
  second rail is an email one-time code. Either way an address reaches the auth server.
- **User ID** — the account id, which is also what binds a purchase to its buyer.
- **Purchase History** — ⚠️ **DECLARED LINKED EVEN THOUGH REVENUECAT'S OWN MANIFEST SAYS
  UNLINKED, AND THE DISAGREEMENT IS CORRECT.** The SDK declares what it can know in general;
  this app calls `logIn(supabaseUserId)` before any transaction *on purpose*, so in this app the
  purchase is tied to the account. **The label describes this app's practice, not the vendor's
  default.** Under-declaring here would be the false-generous direction.
- **Other User Content** — shopping-list items and trips, stored against the account.
  ⚠️ **Counter questions are a different case and do not soften this answer:** they are scrubbed
  of emails and long digit runs, capped at 160 characters and stored with no user id. But the
  label is per data type, and if **any** instance of a type is linked the type is declared
  linked. The scrubbing belongs in the privacy policy, where it already is.

### Data Not Linked to You

| type | category | purpose |
| --- | --- | --- |
| **Photos or Videos** | User Content | App Functionality |

- **Photos or Videos** — a label photograph is POSTed to be read by a vision model and is not
  stored. `scanned_products` holds products and never people; it has no `user_id` column and a
  test greps for one. Nothing associates a photo with an account, which is what "linked" asks.

### Everything else: Not Collected

Name · Phone Number · Physical Address · Other Contact Info · Contacts · Health · Fitness ·
Financial Info · Payment Info (Apple handles payment; nothing reaches this app) · Credit Info ·
Precise or Coarse Location · Browsing History · Search History · Device ID · Advertising Data ·
Product Interaction · Crash Data · Performance Data · Other Diagnostic Data · Sensitive Info ·
Customer Support · Emails or Text Messages · Gameplay Content · Audio Data.

**Crash data is Not Collected** because there is no third-party crash SDK; what Apple itself
collects through App Store Connect is excluded from this label by Apple's own rule.

**Account deletion:** required by 5.1.1(v) for any app with accounts, and it exists —
`DeleteAccountSection.swift` → `DELETE /api/account`, in the app, reachable from the account
surface. ⛔ **`/privacy` states there is no delete door on the website and that is deliberate;
the iPhone app is the only route.** Do not answer the questionnaire as though a web door exists.

### ✅ THE APP CHANGE THAT WAS OUTSTANDING HERE IS DONE — `ef58686`, ON `origin/main`

**Both halves shipped in `kristy-ios` and were re-measured here 2026-08-20 rather than taken from
the commit message:** `Kristy/PrivacyInfo.xcprivacy` now declares **Email Address, User ID,
Purchase History and Other User Content as LINKED, Photos or Videos as UNLINKED, no tracking,
`UserDefaults/CA92.1`** — read out of the bundled manifest with `plistlib` — and the false
"no third-party SDKs" sentence is deleted and replaced with the two real package references.
**That is byte-for-byte the table above**, which is the only thing this entry ever asked for:
the manifest and the nutrition label are two renderings of one answer and a reviewer can open
both. `Tools/checks/privacy_manifest.sh` passes and reads the built `.app`, not the repo — ✅ run
here 2026-08-20: *manifest is in the built app, parses, 5 collected types, 4 linked + 1 unlinked,
each matched by NAME and LINKED FLAG.*

⚠️ **NOTE WHAT CAUGHT THE ORIGINAL DEFECT, BECAUSE NO TEST COULD HAVE:** a person writing the
nutrition label found that the two documents disagreed. **Change both or neither** — that rule is
in the manifest's own header and it is the only thing standing between them.

⚠️ **AND ONE THING THAT IS NOT A METADATA PROBLEM BUT WILL END THE REVIEW, AND IT IS STILL FULLY
OPEN:** an auto-renewable
subscription has to be *purchasable by the reviewer*, and today `canPurchase` is
`identity == .member` while **Sign in with Apple has never completed a single token exchange**.
A reviewer who cannot sign in cannot buy, and an IAP that cannot be exercised is rejected under
2.1. **One completed sign-in on real hardware is upstream of submitting at all** — which is what
booking the Mac is for.

### Suggested App Review notes

```
No account is needed to use Kristy. The app opens straight into the free
experience: scanning, the counter (ask or browse), building and walking a
shopping list, and the haul.

Membership ($5.99/month, $44.99/year) unlocks the depth behind each counter
card. Three full reads are free; the upgrade prompt appears on the fourth.
Eight essential cards are always full for everyone.

Signing in is optional and is used for saving trips across devices and for
purchasing. Sign in with Apple and email one-time code are both supported.
Account deletion is in the app: Haul tab → settings → Delete account.

Kristy makes no health, medical or treatment claims. Every statement she makes
traces to a sourced entry in a curated knowledge base and the model is
structurally prevented from introducing a claim it was not given.
```

---

## 8. Screenshots — which six, in which order

⚠️ **FIVE OR SIX, NOT SIX.** Slot 6 is gated on the Mac and **has no fallback** (ruled 2026-08-20). Everything below describes the full set; **five is a shippable listing.**

**Source: `/Users/m1/kristy-review-screenshots/audit-2026-08-18/` — 67 PNGs from a real
`Tools/uisuite/run.sh` against the live production server.** Captures of the real app, not
mocks.

⚠️ **THAT DIRECTORY IS THE AUDIT SET AND IT IS THE WRONG SIZE — IT IS NO LONGER THE
DELIVERABLE.** Every one of the 67 is 1206 × 2622 (iPhone 17 Pro, 6.3-inch); App Store Connect's
required iPhone slot is 6.9-inch, 1320 × 2868 or 1290 × 2796. Measured across all 67 with `sips`.
**The retake has since happened at the right size — see the state block below** — so read this
paragraph as the reason the audit set is not shippable, **not as an instruction to re-shoot
anything already delivered.**

### 📍 THE SHOOT'S STATE — MEASURED 2026-08-20 20:13, AND THIS IS THE BOARD

**Deliverables live in `/Users/m1/kristy-review-screenshots/appstore-1.0/`. All five are
1320 × 2868, measured with `sips` on each file after the re-shoot.** Slots 2–4 were shot at
**17:47**; slots 1 and 5 were re-shot at **20:09** and **20:13**, all on iPhone 17 Pro Max with
the status bar frozen at 9:41.

| slot | state | file |
| --- | --- | --- |
| 1 | 🟡 **DELIVERED, AWAITING THE OWNER'S LOOK** | `slot1-dashboard.png` |
| 2 | ✅ **APPROVED AS SHOT** | `slot2-counter-index.png` |
| 3 | ✅ **APPROVED AS SHOT** | `slot3-shop-mode.png` |
| 4 | ✅ **APPROVED AS SHOT** | `slot4-card-summary.png` |
| 5 | 🟡 **DELIVERED, AWAITING THE OWNER'S LOOK** | `slot5-compose-refined.png` |
| 6 | ⏳ Real hardware, gated on the Mac. **No fallback — ship five** (ruling above). | — |

**Both re-shoots were run in a watched shell, not scheduled.** The two diagnostics they replaced
are filed in `evidence-2026-08-20/` under names that say what they are; ⛔ **nothing named
`DIAGNOSTIC` or `EVIDENCE` belongs in `appstore-1.0/`.**

#### The 20:09 and 20:13 runs, in three lines

- **Slot 1 passed and took the give-back branch again** — `“SEAFOOD” … nudging did not find a gap
  in 8 steps` — this time with the give-back **asserted**. ⚠️ **So the anchor-lost branch did not
  execute on the Pro Max either, exactly as the boundary below predicts.**
- **Slot 5 skipped at 20:09 for a THIRD cause and the diagnostic is what found it** — the
  refinement HAD applied; the test was watching for a button labelled by its FACE. Fixed
  (`kristy-ios` `7833f96`) and shot clean at 20:13, pose `bar overlapping` on “Carrots”.
- **The bucket held.** Slot 1 got its cards (three carded rows in the frame) and no attach 429
  appeared in either run — the 18:45 suite's blackout had expired.

✅ **RULED 2026-08-20 BY THE OWNER: SLOTS 2, 3 AND 4 ARE APPROVED AS SHOT.** ⚠️ **THIS CLOSES
FIX #2's SLOT-2 RE-SHOOT, WHICH IS STILL LISTED BELOW AS OUTSTANDING WORK.** The 17:51 commit
queued "slots 1, 2 and 5 re-shoot" because slot 2's ask card had been clipped by nudging that
bought nothing; **the give-it-back fix landed and the owner has accepted the delivered frame
either way.** ⛔ **So the re-shoot is slots 1 and 5 ONLY.** Do not re-shoot an approved slot to
tidy a fix into it — every run costs the attach bucket, and slots 2–4 are done.

⚠️ **THE RE-SHOOT QUEUED FOR ~18:55 DOES NOT EXIST AS A SCHEDULED THING, AND NOTHING WILL RUN
IT.** Verified rather than assumed, 2026-08-20 18:46: `crontab -l` — none; `atq` — empty;
`~/Library/LaunchAgents` — no such directory; no agent scheduled in-session. **The 03:45 schedule
died with its session and so did this one** — a queued run in this project is an intention held
by a conversation, and **a dropped session takes it with them while leaving every file on disk**,
which is the exact asymmetry the working discipline is built around. 📎 **The rule: a shoot is
run, not scheduled. If it is not in a shell you are watching, it is not queued.**

#### Slot 1 — ✅ THE HERO IS BACK, AND ⚠️ THE ASSERTION THAT ASKS ABOUT IT STILL HAS NOT RUN

**Measured 2026-08-20 18:49, in the 18:45 suite run.** `testSlot1Dashboard` **PASSED** (49.6s),
and its attachment is a complete dashboard: hero *"The list is ready."* first child, largest
type, fully on screen at its natural offset; **two rows carrying real cards** (`PICKING PRODUCE`
and `CHICKEN CUTS…`); the tab bar overlapping "Ground beef, 80/20" exactly as the ruling accepts.

⚠️ **AND THAT 18:45 ATTACHMENT IS NOT A DELIVERABLE — TWO REASONS, BOTH DISQUALIFYING. THE
DELIVERABLE EXISTS AND IT IS THE 20:09 RUN'S** (`slot1-dashboard.png`, board above); this
paragraph is about the evidence frame only, and both files are kept. It is **1206 × 2622**
(`run.sh` defaults to iPhone 17 Pro, not Pro Max) and **the status bar reads 18:47**, because the
9:41 override is part of the shoot procedure and not of `run.sh`. **It is evidence, not a shot** —
kept, with both disqualifications in its filename so it cannot be mistaken for one, at
`/Users/m1/kristy-review-screenshots/evidence-2026-08-20/`. ⛔ **Do not put it in
`appstore-1.0/`.** It was copied out of the result bundle deliberately, because the next
`run.sh` will `rm -rf` that bundle.

⚠️ **NOW THE PART THAT MATTERS, AND IT IS THE FINDINGS FAMILY AGAIN: THE BRANCH THE QUESTION IS
ABOUT DID NOT EXECUTE.** The run log names the branch taken —

> `slot1-dashboard: SHIPPED WITH THE BAR OVERLAPPING — "Ground beef, 80/20" … nudging did not
> find a gap in 8 steps, so it was given back and the surface shipped at its natural offset`

— which is **fix #2's budget-exhausted give-back**, not **fix #1's anchor-lost branch**. The hero
was never lost across those 8 nudges, so `XCTAssertTrue(restored, …)` — the assertion that asks
whether a LOST hero comes back — **was never reached.** ⛔ **So "slot 1 passed" must not be read
as "the loop is proven."** A green test that never entered the branch under test is the family's
own shape, and this file is where it would be easiest to miss.

✅ **What IS proven, in the pixels rather than in the exit code:** `nudgeBack`-as-a-loop **ran**,
in the give-back branch, and **it works** — the hero came back to its natural offset and slot 2
did the same from the same branch. The mechanism reverses nudging. **What is unproven is only the
harder case**: recovery after the anchor has actually scrolled off.

⛔ **THE BOUNDARY, RECORDED SO NOBODY WAITS ON IT: THE ANCHOR-LOST BRANCH MAY STAY UNTESTED
INDEFINITELY, AND THAT IS THE EXPECTED OUTCOME RATHER THAN A PENDING ONE.** Settling it needs a
surface where 8 nudges DO cost the anchor. ⚠️ **The re-shoot makes that LESS likely, not more:**
the evidence run was 1206 × 2622 and the deliverable is **1320 × 2868**, which has more vertical
room, so the hero survives more nudging on the Pro Max than it did on the Pro. **Every future
shoot of this slot is at the larger size.** 📎 **So do not read a passing slot-1 run as the loop
being proven, and do not queue "wait for it to happen" as work** — nothing in the normal course
of shooting this deliverable is expected to enter that branch. If it is ever to be proven, it is
proven deliberately, on a surface built to lose the anchor, not by watching runs go green.

✅ **AND ONE DEFECT FOUND WHILE READING THAT LOG LINE, NOW FIXED (`kristy-ios` `3d425d2`): THE
GIVE-BACK BRANCH CLAIMED SUCCESS IT DID NOT CHECK.** It said *"it was given back"* unconditionally —
`nudgeBack` is `@discardableResult` and that branch discarded it. **If the give-back failed, the log
would have said it succeeded and the shot would have shipped clipped.** It happened to work here and
the pixels are why we know. **This is a comment asserting an invariant, one layer out: the run log
is prose about a mechanism, and prose drifts from mechanism silently.** It now binds `restored` and
asserts it, and `continueAfterFailure` is `false`, so a failed give-back writes no shot at all.

🐞 ⚠️ **THE SAME DEFECT IS STILL LIVE IN THE STATUS-BAR BRANCH, AND THIS DOCUMENT SAID OTHERWISE.**
`nudgeBack(app, budget: 4) { offenderOfStatusBar(app) == nil }` also discards its result, under a
pose reading *"Nudged back off it, so the shot keeps its anchor and a clean clock"* — **so a failed
nudge-back there ships content under the CLOCK, which is the render that made `compose-refined-rows`
unusable, with a log line saying the clock is clean.** ⚠️ **The runner section below claims the
anchor-lost branch was given "the same shape the status-bar branch already had"; the status-bar
branch has the UNDO and has never had the ASSERT.** ⛔ **Deliberately NOT fixed in the same turn as
the give-back**: a new assertion that has never run can only turn a shippable frame into no
deliverable, and it would land in the same build as a shoot with one clean bucket to spend. **It is
a separately proposed change, and the assert belongs in it.**

#### Slot 5 — ✅ THE FAULT IS FOUND, AND IT WAS THE TAP

**Located 2026-08-20 by reading the diagnostic capture, which is what that capture exists for.**
Neither the door nor the apply: **the submit was never tapped.**

`AppStoreShots` tapped `app.buttons["Go"].firstMatch`. `ComposeField` gives the gold button
`.accessibilityLabel("Update the list")` in refine mode — deliberately, so a screen reader hears
what the tap does — **so `buttons["Go"]` cannot match it.** `ComposeRoomShots.swift:283` has
tapped `"Update the list"` all along; the new runner typed the word on the button's face instead.

⚠️ **AND `.firstMatch` IS WHY IT WAS SILENT RATHER THAN LOUD.** A bare `.tap()` on that query
fails with "no matches found" and names the defect in one line. `.firstMatch` resolved to
*something* — **the keyboard's own Go key**, which `submitLabel(.go)` puts on screen a few points
below and which `ComposeField`'s own comment had predicted would be ambiguous. **A missing element
became a wrong element, and the wrong element was unreadable.**

📌 **The tell was in the pixels the whole time: a caret on a blank second line.** The field is
`axis: .vertical`, where the return key inserts a newline and `onSubmit` never fires — so the tap
landed, the field grew a line, and the list sat unchanged for the full 60s.
📎 **That is also a PRODUCTION finding, filed and not fixed:** a shopper who finishes typing and
presses the key that says **Go** gets a blank line and no list change. `kristy-ios`
`docs/API-FINDINGS.md` §11.5. **The gold button is unaffected, which is why nothing ever caught
it** — every path anyone drives goes through the button.

✅ **The tap fix worked, and it exposed a SECOND control addressed by its pixels — 2026-08-20
20:09.** With the tap landing, slot 5 skipped again and **the diagnostic capture showed the
refinement had fully applied**: *"Seafood out. Added bread, sweet potatoes, carrots, and
chickpeas to build lunch around the proteins already here."*, both seafood rows struck, both
put-back buttons on screen. The test was waiting 60s for `label BEGINSWITH "Put it back"` —
**the word on the button's face.** `RefinementSummary` overrides the whole button with
`.accessibilityLabel("Put \(row.name) back on the list")`, so the face and the label share no
prefix and that query can never match; `ComposeRoomShots:287` has always used the real label.
📎 **THAT IS THE SAME DEFECT AS THE `"Go"` TAP, TWENTY LINES LATER IN THE SAME TEST, AND FIXING
THE FIRST IS WHAT EXPOSED IT. The rule this leaves, now paid for twice: in the shot runner,
address a control by what a SCREEN READER hears, never by what the pixels read.**

⚠️ **AND IT WOULD HAVE BITTEN A THIRD TIME ONE LINE ON:** the pose anchor was authored as
`"Put it back"`, which is not a `staticText` either, so `nudgeClearOfTabBar`'s opening assertion
would have failed for the same reason. The anchor is now **read off the button that matched**,
so the pose agrees with whatever the model actually struck on that run.

✅ **SHOT CLEAN AT 20:13** (`kristy-ios` `7833f96`): 1 passed, 0 skipped, 0 failed.
`slot5-compose-refined.png`, 1320 × 2868, clock 9:41, both struck rows offering "Put it back",
the summary card whole, the bar overlapping "Carrots" — the accepted pose.

#### ⚠️ THE BUCKET IS SPENT AGAIN, AND THE STARTUP CHECK IS WHAT SPENT IT

**A full `Tools/uisuite/run.sh` was started at 18:45 to answer the standing state-check block's
"report the iOS UI suite count".** One suite run makes ~23 attaches against `cartBuildLimited`
(20/hour), and the blackout is **63 minutes from the last allowed attach** (`API-FINDINGS.md`
§14.5). **So the earliest clean bucket for the slots 1 and 5 re-shoot is ~19:50**, not 18:55.

⚠️ **AND THE RUN MEASURED THE COST WHILE PAYING IT: 5 OF ITS 6 SKIPS ARE ATTACH 429s.** All five
`ShopModeShots` cases skipped with *"the attach door answered 429"*. **The result — 55 tests, 49
passed, 6 skipped, 0 failed — is therefore not comparable to the 2026-08-16 record of 50/49/0/1**;
the total grew by the five `AppStoreShots` cases, and five of the skips are the budget, not the
code. 📎 **Record it as three numbers with the cause attached, never as "49 passed".**

⚠️ **THIS IS A REAL CONFLICT BETWEEN TWO RULES IN THIS REPO AND NEITHER ONE NAMES IT.** *Every
session starts cold* requires the UI suite count on startup; *shoot once, on a clean bucket*
requires that no run happen before the deliverable's. **They are the same act against the same
budget**, and a session that obeys the first has already broken the second before it reads the
prompt. 📎 **The rule this leaves: WHEN A SHOOT IS OUTSTANDING, REPORT THE UI SUITE COUNT FROM
THE LAST RECORDED RUN AND SAY SO — do not re-run it.** The count is a number in a document; the
bucket is a resource with a 63-minute recovery, and only one of the two is scarce.

⚠️ **A SECOND COST, AND IT IS UNRECOVERABLE: `run.sh` OPENS WITH `rm -rf "$OUT"`.** The 18:45 run
deleted the 17:47 shoot's result bundle at `$TMPDIR/kristy-uisuite/`. The exported PNGs survived
because they had already been written out; **the run log and every failure message did not.**
Slot 1's assertion text was recovered only because `cda2568`'s commit message recorded the run's
verdict in prose. 📎 **A result bundle at a fixed path is one run deep. Export what a later
session will need, or copy the bundle beside the shots.**

**The three fixes below were written for the 17:47 retake. Fix #2 is a ruling, fix #3 is done —
the delivered shots read 9:41. Fix #1 is still open and belongs to the Mac.**

### The six, in order

| # | file | why it is in this slot |
| --- | --- | --- |
| 1 | `HomeSurfaceShots--home-ready.png` | **What this app is, in one glance.** A shopping list, sectioned, with a real note attached to a real row ("Smell the stem end on anything that ripens after picking"). Instantly legible without reading, which is the only job slot 1 has. |
| 2 | `CounterUITests--01-index-section-list.png` | **What makes it different.** The ask box with four real questions under it, then two free card summaries. This is the moat, and it is the shot that stops someone who already has a scanner app. |
| 3 | `ShopModeShots--shop-produce.png` | **The payoff, in the store.** One section, full screen, the instruction in the largest type, "0 of 3" and "Next: Meat". Nothing else in the category looks like this. |
| 4 | `CounterUITests--03-card-summary.png` | **The answer quality, close up.** Decision-first: headline, do line, and the tier sentence saying the A2 preference is a preference and not a finding — which is the honesty the whole product rests on. |
| 5 | `ComposeRoomShots--compose-refined.png` | **The list rewrites when you change your mind.** "Seafood out. Added deli turkey and bread for quick lunches", with the two struck rows each offering "Put it back". |
| 6 | `ScanSurfaceShots--scan-approved-collapsed.png` | **The packaged half and the seal.** ⚠️ **Needs a real-device retake — see below.** Slot 6 is the least-viewed slot, which is why the shot needing the most work is in it. |

**Every one of them is the free experience.** Nothing above is behind the membership: the
list, shop mode, the haul and every card *summary* are free forever, the counter ask is free and
unlimited, and slot 4's card is showing exactly the layer a signed-out shopper sees, with "The
full read" still closed.

### What was deliberately left out, and why

- ⛔ **`CounterUITests--04-full-read.png`, `05-upgrade-moment`, `06-teaser-past-the-meter`, and all
  four `MembershipShots--*`.** These are the paid depth and the paywall. **A screenshot that
  shows paid content without saying so is the rejection risk named in the brief**, and a paywall
  is not a reason to download anything.
- ⛔ **`HaulSurfaceShots--haul-mixed.png` — a genuinely good shot that must not ship.** It carries
  the line *"Scan verdicts are not in this read yet. Those save to an account, and accounts are
  waiting on sign-in."* That is an honest in-app disclosure of an unfinished feature and it is
  **exactly right in the app**; on the App Store it advertises a hole. ✅ **It becomes a good
  slot-6 candidate the moment sign-in works** and that line stops rendering.
- ⛔ **`ComposeRoomShots--compose-refined-rows.png`** — captured mid-scroll with the status bar
  overlapping the content. Unusable, and not fixable by cropping.
- **`CounterUITests--07-ask-answer.png`** — strong, and the runner-up to slot 2. Held back
  because it repeats slot 2's surface, and it carries an upgrade line ("The read for your cart is
  the member part") that is honest but off-message in a store listing.
  ⛔ **RULED 2026-08-20 BY THE OWNER: THERE IS NO SLOT-6 FALLBACK. SHIP FIVE.** The previous
  version of this bullet nominated this shot as the stand-in if the real-device scan shoot does
  not happen before submission. **It is withdrawn.** ⚠️ **A COUNTER ANSWER POSING AS A SCAN SHOT
  IS WORSE THAN SCANNING BEING UNREPRESENTED** — it is a second counter surface in a slot the
  listing has told the reviewer is the packaged half, and **the keyword field can carry `scanner`
  and `barcode` without a screenshot proving them.** So: **five slots if the Mac does not happen,
  and slot 6 is real if it does.** ⛔ **Do not re-propose a substitute for slot 6 from the
  existing set** — this is the shape the ruling forbids, not this one file.

### The three fixes to make during the retake

1. 🐞 ⚠️ **THE TWO SCAN SHOTS ARE UNUSABLE AS THEY STAND AND THE SIMULATOR CANNOT FIX THEM.**
   The top two-thirds of both `scan-approved-collapsed` and `scan-approved-expanded` is **solid
   black** — the simulator has no camera, so the viewfinder is an empty void with a gold reticle
   floating in it. It reads as a broken screen. **Slot 6 has to be shot on real hardware with a
   real package in frame.** Two lesser things go with it: the ingredient line renders a trailing
   `", ."` artifact ("…ascorbic acid, to maintain color, ."), and `scan-approved-expanded` is cut
   off mid-sentence at the bottom edge — **which is why the collapsed shot is the one listed and
   not the expanded one.**
2. ✅ **CONTENT BLEEDING UNDER THE TRANSLUCENT TAB BAR IS DECIDED, NOT FIXED — RULED 2026-08-20:
   KEEP THE HERO, LET THE BAR OVERLAP.** It affects slots 1, 2 and 5 — **not 4**. ⚠️ **This entry
   named slot 4 when it was written and slot 4 is CLEAN**, measured off the pixels: the card ends
   well above the bar with empty space under it. The third bleeding shot is **slot 5**
   (`compose-refined`), where "Bone-in chicken thighs" is cut in half. **Corrected 2026-08-20 by
   looking; the first version was written from memory of the set rather than from the set.**
   ⛔ **This is no longer an item to clear before submitting.** The runner still nudges for a gap
   and takes one where it can get it without losing the hero; where it cannot, the overlap ships.
   **Do not reopen this as a defect against a delivered shot.**
3. **Set the status bar before capture.** The audit shots read `03:59`–`04:09` with a live
   battery. `xcrun simctl status_bar <device> override --time 9:41 --batteryState charged
   --batteryLevel 100 --cellularBars 4`. It is the difference between a screenshot and a capture.

### The runner: `kristy-ios/KristyUITests/AppStoreShots.swift`

**Added 2026-08-20.** It drives the same surfaces with the same fixtures and captures them
**posed** — chosen scroll offset, frozen status bar, nothing clipped.

⚠️ **IT IS A SEPARATE FILE FROM THE AUDIT SUITES ON PURPOSE.** `HomeSurfaceShots`,
`CounterUITests`, `ComposeRoomShots` and `ShopModeShots` capture whatever the surface does,
because that is what makes their shots evidence — **a shot posed until it is flattering has
stopped being evidence**, and that set caught four live defects. Posing them in place would have
quietly converted the audit set into marketing.

**What it enforces, so the deliverable cannot go quietly wrong:**

- **Slot 4 asserts the full-read control is still CLOSED before capturing**, so paid depth cannot
  reach a store listing by accident.
- **Tab-bar clearance is geometry, not judgement** — it drags in small steps until no text frame
  inside the scroll view intersects the bar's frame.
- ✅ **RULED 2026-08-20 BY THE OWNER: KEEP THE HERO, LET THE BAR OVERLAP.** Measured on the real
  surface, "clear of the tab bar" and "hero still on screen" frequently cannot both hold: the
  bar's top edge is y=873, the dashboard's rows are ~18pt of text on ~50pt pitch, and every
  offset with a gap under the bar has already lost the hero. **A shopper reading a store listing
  looks at the TOP of the image, and a translucent bar over a row is ordinary iOS — nobody reads
  it as a defect. Losing the hero costs the thing the screenshot exists for.**
  ⛔ **So `-BAR-NOT-CLEARED` IS RETIRED AND MUST NOT COME BACK.** Both poses now write the plain
  filename and the run log alone says what was settled for. The suffix marked as provisional an
  outcome that is now decided, and **a caveat in a filename outlives the decision that retired
  it** — every downstream step would go on asking a question that has an answer.
  ⚠️ **AND THE RULING IS ENFORCED IN THE PIXELS, NOT ONLY IN THE NAMING.** The branch where
  nudging costs the anchor **undoes that nudge and asserts the anchor came back**, and so does the
  budget-exhausted give-back (`3d425d2`). ⚠️ **The status-bar branch does the UNDO and NOT the
  assert — this line used to say it already had that shape and it never did**; see the open defect
  in the slot-1 section above. Under this ruling a heroless frame is the one
  unshippable outcome, so it may not be the frame that gets captured; reporting the loss while
  shooting it anyway would honour the ruling in the log and break it in the deliverable.
  ⚠️ **THE STATUS BAR IS NOT COVERED BY THE RULING.** Content under a translucent tab bar is
  ordinary iOS; content under the CLOCK is the render that made `compose-refined-rows` unusable.
  It keeps its own branch and its own nudge-back.
- ⚠️ **THE STATUS BAR IS A STOP CONDITION, NOT A KEEP-GOING ONE.** Nudging scrolls content up, so
  once the eyebrow slides under the clock every further nudge makes it worse while the loop reads
  "still not clear" as a reason to continue. **The first run reproduced exactly the render that
  made `compose-refined-rows` unusable.** It now undoes that nudge and reports.

### ⛔ THE ONE THAT NEARLY SHIPPED: A SHOT WITH NO CARDS, AND IT LOOKED FINE

⚠️ **FOUR RUNS INSIDE FORTY-FIVE MINUTES SPENT THE `/guest/list/attach` BUCKET, SO EVERY ROW CAME
BACK UNCARDED AND THE DASHBOARD RENDERED AS A BARE CHECKLIST.** `cartBuildLimited` is 20/hour and
one suite run makes ~23 attaches (`docs/ATTACH-BUCKET.md`), and the window slides from the **last
allowed** attach, so repeated runs keep it pinned shut.

**NOTHING FAILED.** The capture succeeded, the geometry was clean, the status bar read 9:41, and
the screenshot argued that Kristy is a to-do app. **It is the findings family aimed at a
deliverable instead of a test** — the check could not see the thing that mattered, because the
thing that mattered was absent, and absence is what a screenshot is worst at reporting.

📎 **IT IS NOW THE SIXTH MEMBER OF THE FINDINGS FAMILY, RECORDED 2026-08-20** — the rule in
`CLAUDE.md` *Verifying*, the account in `docs/VERIFYING.md`. **The first member pointed at a
DELIVERABLE rather than a test**, and that is why it earned its own entry rather than being filed
under the empty-collection one: a test blind to its subject goes green, but **a deliverable blind
to its subject looks FINISHED**, and a finished-looking artifact gets reviewed for polish, never
for whether its subject is present. **Ask what the artifact would look like if the thing it argues
were absent; when the answer is "fine", the emptiness is the defect.**

**Slots 1 and 3 now REQUIRE an attached card** and skip loudly with a diagnostic capture rather
than posing an empty list beautifully. The eyebrow is the tell: it renders only where a card
attached. ⚠️ **Slot 5 has the same exposure through a different door** — its refinement is a live
model call against `LIST_COMPOSE_FREE_LIMIT` (12/day, free callers).

📎 **THE OPERATIONAL RULE THIS LEAVES: SHOOT ONCE, ON A CLEAN BUCKET.** Delete the app, wait a
genuine hour clear of the last allowed attach, run the class once. **Iterating on the runner and
shooting the deliverable are the same act here, and that is the trap** — every debugging run
spends the budget that the real run needs.

### Notes on the set as a whole

- **All 67 are dark.** That is correct and not a gap: `INFOPLIST_KEY_UIUserInterfaceStyle = Dark`,
  the brand has one palette, and a light-mode screenshot would be of a surface that does not exist.
- ⛔ **RULED 2026-08-20 BY THE OWNER: NO CAPTIONS. BARE SHOTS, ALL OF THEM.** This closes the
  question rather than deferring it — **the screenshots say what the app is, and a caption is a
  second voice explaining the first. Kristy does not narrate.** ⛔ **Do not propose a caption on
  slot 1 or slot 2 later**; the earlier version of this line held that door open and it is now
  shut. The reasoning is the same one that governs the ambient line and the voice spec, applied
  one surface further out.
- ⚠️ **Six is the working set, not the ceiling — App Store Connect accepts up to 10** (and five is the floor, ruled above). If slots 7
  and 8 are ever wanted, `HomeSurfaceShots--home-empty.png` (what the first launch actually looks
  like) and the post-sign-in haul are the two candidates. **Neither is worth blocking submission
  on.**

---

## 9. The rest of the submission form

| field | value |
| --- | --- |
| App name | `Kristy` |
| Bundle display name | `Kristy` (`Config/Base.xcconfig`) |
| Privacy Policy URL | `https://kristyapproved.com/privacy` — live and verified served |
| Terms of Use (EULA) URL | `https://kristyapproved.com/terms` — live and verified served |
| Support URL | `https://kristyapproved.com/support` |
| Marketing URL | `https://kristyapproved.com` — ⚠️ **the canonical front door. NOT the `.vercel.app` alias** |
| Copyright | `2026 Kristy` |
| Sign-in required to review | **No** — the free experience opens without an account |
| Demo account | Not needed; see the review notes in §7 |

✅ **CLOSED 2026-08-20 — `hello@kristyapproved.com` RECEIVES AND THE OWNER READS IT.** ⚠️ **THIS
ENTRY READ "STILL OPEN" FOR FIVE DAYS AFTER IT WAS SETTLED**, which is the stale-marker defect
this repo keeps finding in its own queues: a document describing work as outstanding after it
landed. Corrected 2026-08-25 by checking `CLAUDE.md`'s Open items rather than by remembering.

⚠️ **THE RULE IT LEAVES IS UNCHANGED AND STILL BINDS: A BOUNCING SUPPORT ADDRESS IS WORSE THAN
NO ADDRESS.** `/support` promises a reply within two business days and App Review checks the
support URL. ⛔ **AN MX RECORD IS NOT THE CHECK** — it proves the domain can route mail and says
nothing about whether the mailbox exists or anyone reads it. This item spent a day narrowed on
exactly that distinction. **The only check that settles it is sending mail to it, which is an
outward-facing act and is the owner's. Re-check before any submission.**

📍 **All four public URLs verified served 2026-08-25 by FETCHING them**, which is what a reviewer
does: `/` `200`, `/privacy` `200`, `/terms` `200`, `/support` `200` on `kristyapproved.com`, with
the support page printing `hello@kristyapproved.com` and the domain's MX resolving to Outlook.
⛔ **Do not work around any of it by changing the pages** — they are correct.
