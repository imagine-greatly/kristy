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
shopping,list,food,ingredient,label,scanner,barcode,produce,meat,seafood,dairy,eggs,organic,additive
```

**100 characters exactly, 14 terms.** No space follows a comma — a space is a wasted character
and Apple does not need one.

**Nothing here repeats the app name or the subtitle.** Excluded for that reason and that reason
only: `kristy`, `grocery`, `coach`, `for`, `every`, `aisle`.

**Why singular, and why no phrases.** Apple builds search phrases by combining the tokens, so
`shopping` + `list` already covers "shopping list" and spending nine characters on a literal
phrase buys the same result twice. Singulars are used throughout because Apple stems; `scanner`
is preferred over `scan` because it stems *down* to cover both and the noun is what people type.

**The last slot is the one to argue about.** `additive` is in it because that is a term this app
can plausibly rank for. Swap-ins, all measured, all fitting:

| swap `additive` → | total | why you might |
| --- | --- | --- |
| `healthy` | 96 | Much larger volume, and a new app will not rank on it. Cheap to try, unlikely to pay. |
| `butcher` | 96 | Narrow and very on-message for the counter. |
| `pantry` | 95 | Broad, generic, competitive. |
| `market` | 95 | Stems to "supermarket"/"farmers market". |

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

### ⛔ BEFORE THESE ANSWERS ARE TRUE: ONE APP CHANGE IS OUTSTANDING

⚠️ **`Kristy/PrivacyInfo.xcprivacy` IS NOW STALE IN TWO PLACES, AND ITS OWN COMMENT PREDICTED
ONE OF THEM.** This is app-source work in `kristy-ios`, it is not done, and **nothing in this
document does it.** Both are findings, recorded here because the nutrition label cannot be filed
honestly while the bundled manifest disagrees with it:

1. **The manifest declares only Photos-or-Videos and Other-User-Content, both unlinked.** Its own
   comment says: *"`NSPrivacyCollectedDataTypeLinkedToUser` IS FALSE BECAUSE THERE ARE NO
   ACCOUNTS … THE DAY SIGN-IN LANDS, THIS BECOMES A LIE AND MUST BE REVISITED."* **Sign-in ships
   in 1.0.** The manifest needs Email Address, User ID and Purchase History added, and the two
   existing entries re-judged.
2. **The comment asserts "there are also NO third-party SDKs — the pbxproj carries no package
   references".** ⚠️ **That is false as of today, measured:** the pbxproj carries
   `supabase-swift` and RevenueCat `purchases-ios`. Nothing breaks — RevenueCat's manifest merges
   in correctly and supabase-swift needs none — **but the sentence is a signed statement that is
   now wrong, in the file whose whole job is to be right.**

⚠️ **AND ONE THING THAT IS NOT A METADATA PROBLEM BUT WILL END THE REVIEW:** an auto-renewable
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

**Source: `/Users/m1/kristy-review-screenshots/audit-2026-08-18/` — 67 PNGs from a real
`Tools/uisuite/run.sh` against the live production server.** Captures of the real app, not
mocks.

⚠️ **ALL SIX MUST BE RETAKEN, AND IT IS NOT ABOUT THEIR CONTENT. EVERY ONE OF THE 67 IS
1206 × 2622 — iPhone 17 Pro, the 6.3-inch class. App Store Connect's required iPhone slot is
6.9-inch: 1320 × 2868 or 1290 × 2796.** Measured across all 67 with `sips`; there is exactly one
size in the directory and it is the wrong one. **The 6.9-inch device is already available on this
box** — `paywall-review-1320x2868.png` one directory up was shot at it. So the retake is a re-run
of the suite against an iPhone 17 Pro Max destination, not new work.

**Take the retake as the moment to also fix the three things below**, since the shoot is happening
anyway.

### The six, in order

| # | file | why it is in this slot |
| --- | --- | --- |
| 1 | `HomeSurfaceShots--home-ready.png` | **What this app is, in one glance.** A shopping list, sectioned, with a real note attached to a real row ("Smell the stem end on anything that ripens after picking"). Instantly legible without reading, which is the only job slot 1 has. |
| 2 | `CounterUITests--01-index-section-list.png` | **What makes it different.** The ask box with four real questions under it, then two free card summaries. This is the moat, and it is the shot that stops someone who already has a scanner app. |
| 3 | `ShopModeShots--shop-produce.png` | **The payoff, in the store.** One section, full screen, the instruction in the largest type, "0 of 3" and "Next: Meat". Nothing else in the category looks like this. |
| 4 | `CounterUITests--03-card-summary.png` | **The answer quality, close up.** Decision-first: headline, do line, and the tier sentence saying the A2 preference is a preference and not a finding — which is the honesty the whole product rests on. |
| 5 | `ComposeRoomShots--compose-refined.png` | **The list rewrites when you change your mind.** "Seafood out. Added deli turkey and bread for quick lunches", with the two struck rows each offering "Put it back". |
| 6 | `ScanSurfaceShots--scan-approved-collapsed.png` | **The packaged half and the seal.** ⚠️ **Needs a real-device retake — see below.** Slot 6 is the least-viewed slot, which is why the shot needing the most work is in it. |

**Every one of the six is the free experience.** Nothing above is behind the membership: the
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
- **`CounterUITests--07-ask-answer.png`** — strong, and the runner-up to slot 2. Held back only
  because it repeats slot 2's surface, and it carries an upgrade line ("The read for your cart is
  the member part") that is honest but off-message in a store listing. **Use it in place of slot 6
  if a real-device scan shoot is not possible before submitting** — at the cost of leaving
  scanning unrepresented while `scanner` and `barcode` sit in the keyword field.

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
  nudging costs the anchor now **undoes that nudge and asserts the anchor came back**, the same
  shape the status-bar branch already had. Under this ruling a heroless frame is the one
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
- **No caption overlays are proposed here.** If captions are added later, slot 1 and slot 2 carry
  the argument and slots 3–6 should stay bare; a caption on every shot is how a listing starts
  looking like a deck.
- ⚠️ **Six is the working set, not the ceiling — App Store Connect accepts up to 10.** If slots 7
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

🐞 ⚠️ **THE SUPPORT URL PROMISES A REPLY TO `hello@kristyapproved.com` WITHIN TWO BUSINESS DAYS,
AND WHETHER THAT MAILBOX RECEIVES IS STILL OPEN.** The domain has an MX record; an MX proves the
domain can route mail and **does not** prove the mailbox exists or that anyone reads it. **App
Review checks the support URL, and a bouncing support address is worse than no address.**
⛔ **Do not work around it by changing the pages** — they are correct. This is the owner's item
and it is tracked under **Open items** in `CLAUDE.md`. **Re-check it before submitting.**
