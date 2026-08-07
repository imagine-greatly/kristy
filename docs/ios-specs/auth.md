# iOS spec — AUTH

Sign-in, the signed-out shopper, session lifecycle, entitlement, and account deletion.

Derived from `client/src/components/Auth.jsx`, `GuestGate.jsx`, `Settings.jsx`,
`Upgrade.jsx`, `UpgradeSheet.jsx`, `client/src/lib/supabase.js`, `config.js`,
`guestState.js`, `api.js`, `pricing.js`, and the server handlers in
`server/routes/subscription.js`, `account.js`, `billing.js`, `revenuecat.js`.

Conventions (base URL, bearer token, error envelope) are as stated in `cart.md` §0.

---

## 1. THE FRAME

**Signed-out is a capability difference, not a second app.**

The web client has two parallel app shells, and because phone sign-in has been blocked on
carrier registration, **the guest shell is the only one any real visitor has ever
reached**. The authed shell's surface stack has never rendered for a shopper. That
architecture has already produced two production defects invisible to every test — a hero
button that painted, took the tap and did nothing, and a photo-import path that was
unreachable.

**In Swift there is one surface stack.** Every screen renders for everyone; what changes is
what a given control can do, and a control that cannot do its job **does not render at
all** (see `cart.md` §2.1).

**Nothing is behind sign-in that does not genuinely require an account.** Scanning,
browsing the counter, asking the counter, building a cart by talking, importing a list, the
whole free card summary layer, and three full reads all work signed out.

---

## 2. WHAT SIGN-IN ACTUALLY BUYS

| capability | signed out | signed in |
| --- | --- | --- |
| scan a barcode or a label | ✅ shared IP budget | ✅ per-user budget |
| the universal layer, the seal, hard lines | ✅ | ✅ |
| the personalized verdict note | ❌ (`gated`, with the upsell line) | ✅ 3 free, then premium |
| browse the counter, all card summaries, tier sentences | ✅ | ✅ |
| the eight essentials, in full | ✅ | ✅ |
| three full counter reads | ✅ metered on device | ✅ metered on the account |
| ask the counter, generation included | ✅ | ✅ |
| the personalized counter read | ❌ | premium |
| build a cart by talking | ✅ shared IP budget | ✅ 12/day free, premium exempt |
| import a list | ✅ | ✅ |
| counter cards attached to list rows | ✅ (explicit attach call) | ✅ (inside the list save) |
| the list persisting across devices | ❌ device-local | ✅ |
| **complete a trip / "same as last week"** | ❌ | ✅ |
| **the Haul** | ❌ | ✅ |
| **rebuild from a stored profile** | ❌ | ✅ |
| **buy anything** | ❌ | ✅ (see §7.4) |

**The three ⛔ rows above are the only honest reasons to raise sign-in.** Anything else is
selling something already given away.

---

## 3. SIGN-IN — phone, by one-time code

**No password. A 6-digit code by text.** There is no email rail, no social provider, and no
second auth path. Building a parallel sign-in before the first one clears is two things to
maintain and one more surface to get wrong.

The flow is provider-agnostic on the client: request a code for a phone number, then verify
the code. On success the session arrives through the auth state observer and the surface
that hosted the form is replaced — the form itself has nothing more to do.

### 3.1 Step one — the number

- A single phone field. Numeric keyboard, `tel` content type, one-time-code autofill
  disabled here.
- **Format as they type.** A leading `+` switches to international mode: keep the `+`, strip
  everything non-digit, cap at 15 digits, apply no other formatting. Otherwise assume a US
  number: strip non-digits, cap at 10, and format progressively `(555`, `(555) 123`,
  `(555) 123-4567`.
- **Normalize to E.164 before sending:**
  - Leading `+` → digits only; valid if it matches 8–15 digits not starting with 0.
  - Exactly 10 digits → `+1` + digits.
  - 11 digits starting with `1` → `+` + digits.
  - Anything else → invalid.
- Submit ("Send code") is disabled until the number normalizes.
- On submit, label becomes "Sending…".

### 3.2 Step two — the code

- Six-digit field, numeric keyboard, **one-time-code autofill enabled**, max length 6, input
  filtered to digits.
- Copy above it: "Enter the 6-digit code sent to **+15551234567**."
- "Verify" is disabled until exactly 6 digits are entered; label becomes "Verifying…".
- **"Resend"** is locked for **30 seconds** after each send, counting down in the label
  ("Resend code in 12s"). The code itself expires at 60s; 30s is when a fresh one is worth
  asking for. Resending clears the entered code.
- **"Use a different number"** returns to step one and clears the code, the error and the
  countdown.
- A failed verify **stays on this step** so they can retry or resend.

### 3.3 Error copy — a CONFIGURATION failure must never wear the same coat as a typo

Every send error once collapsed into "Check the number and try again", so a project with
its phone provider switched off, or credentials that never landed, looked exactly like a
mistyped digit. The shopper retypes a number that was always correct, and nobody ever
learns the send call is failing upstream.

Map, in this order:

| condition | message |
| --- | --- |
| provider disabled for the project | "Text sign-in is switched off for this app right now. Nothing wrong with your number." |
| the SMS provider rejected the send (bad credentials, no verified sender, trial account) | "The text couldn't be sent from our end. Nothing wrong with your number." |
| sign-ups disabled | "New sign-ups by text are switched off right now." |
| rate limited (HTTP 429 or a rate/too-many message) | "Too many attempts. Wait a minute and try again." |
| an invalid-phone error | "That number doesn't look right. Include your country code (e.g. +1)." |
| anything else | "The code didn't send. Check the number and try again." |
| local normalization failed, before any request | "Enter a valid phone number. Outside the US, include your country code (e.g. +1)." |

Verify errors:

| condition | message |
| --- | --- |
| rate limited | "Too many attempts. Wait a minute and try again." |
| anything else | "That code didn't work. It may be wrong or expired. Tap Resend." |

The provider returns the same error for a wrong code and an expired one, so the copy covers
both rather than guessing.

**Log the raw upstream error** (status, code, message) even though it never reaches the UI.
A silent "couldn't send" with no trace is what makes this class of bug take a week.

### 3.4 THE SMS CONSENT LINE LIVES WITH THE FORM

Beneath the phone field, on **every** surface that renders the form:

> By continuing you agree to our **Terms** and **Privacy Policy**. Requesting a code
> consents to a one-time sign-in code by SMS — one per request, no marketing. Message and
> data rates may apply. Reply STOP to opt out, HELP for help.

Terms and Privacy are tappable and open the hosted pages.

**This is not decoration and it is not optional.** Carrier campaign review looks for the
opt-in wording beside the phone field. It lives with the form rather than on the
surrounding screen because two surfaces render the form and only one of them used to carry
any legal text at all.

The hosted pages must additionally carry: the one-time-code purpose, that entering a number
*constitutes consent*, one message per sign-in request, STOP/HELP, "message and data rates
may apply", and the processor list. These are checked, not decorative.

### 3.5 The two surfaces that host the form

**Full-screen sign-in** — a leaf mark, the wordmark "Kristy", the positioning line, then
the form:

> "Scanners read the box. Kristy reads the whole store: meat, fish, eggs, produce, bulk."

with the form's note reading "No password. A 6-digit code by text."

**The soft gate** — a sheet over the surface the shopper is already on, which stays readable
behind it. A "K" avatar, Kristy's contextual line, the form (note: "No password. A code by
text, and everything sticks."), and — **only when the gate is dismissible** — a
"Not yet — keep looking around" control.

### 3.6 The gate, and when it is terminal

| reason | line | dismissible |
| --- | --- | --- |
| `invite` | "Sign in whenever. Your scans, haul and preferences stick from there." | ✅ |
| account needed (a rebuild, which reads a stored profile) | "Rebuilding reads your stored preferences. Sign in — no password, just a text." | ✅ |
| `memory` (server: the request needs memory we do not have) | the server's `kristyLine` | ✅ |
| `limit` (the shared IP budget ran out) | the server's `kristyLine`, else "That's the free run. Sign in to keep going." | ❌ terminal |
| conversation cap reached (4 real exchanges) | "Sign in and none of it gets thrown away. Your scans, your cart, your preferences." | ❌ terminal |

A terminal gate cannot be dismissed by tapping the scrim and shows no dismiss control. A
dismissible one leaves the session fully usable.

**The line is never about saving something already free.** It once read "Save your cart.
Sign in, no password, just a text." — fronting two controls that both promised persistence
for something the shopper already had. What actually needs an account is a **rebuild**, and
that is what the copy says now.

---

## 4. SESSION LIFECYCLE

### 4.1 Launch

1. Show the splash: the large-format wordmark on the dark ground, nothing else.
2. Restore any persisted session and subscribe to auth state changes.
3. On a session (or on confirming there is none), load the profile, the subscription
   snapshot, and today's thread, then flip to ready.
4. Route:
   - not onboarded → onboarding (`onboarding.md` §1)
   - otherwise → the home surface, **unconditionally**

Sessions persist across launches and refresh automatically.

### 4.2 A configuration failure must name itself

A build missing its backend configuration must **fail loudly and say which value is
missing**, never silently substitute fake data for a real answer. A deploy that says *which*
setting is unset is fixable in one step; "something went wrong" is not.

Specifically: a demo/sample mode must **never auto-engage in a production build**. It once
did, and a sample build answers every barcode with the same fixture — so a shopper scanning
chips got a coffee creamer, confidently, with a verdict on it.

Any sample or fixture data that does reach the screen must be **labeled as sample data**
(see `scan.md` §3.0).

### 4.3 Signing out

Clearing the session returns the shopper to the signed-out capability set on the same
surface stack. There is nothing to unmount and nothing to navigate to.

---

## 5. THE GUEST → ACCOUNT HANDOFF

**Signing in has to feel like locking in work.** Nothing a stranger made may be lost.

Device-local guest state, under one key:

```json
{
  "scans": [ { "product_name": "…", "brand": "…", "tier": "swap_recommended", "barcode": "…" } ],
  "goal": "high_protein",
  "prefs": { "coach_goals": [], "non_negotiables": [], "focuses": [], "constraints": [] },
  "list": { "goal": null, "intro": "", "items": [] },
  "onboarded": true
}
```

- `scans` is capped at the **last 10**, most recent last. A scan with no tier is not a real
  product and is not recorded.
- `goal` is the legacy single value, kept in sync with `prefs.coach_goals[0]` so it can
  pre-fill onboarding.
- Reading must **tolerate an older shape** — a stranger mid-session when the shape changed
  keeps their scans instead of having them silently dropped.

### 5.1 The replay, on the first session of a sign-in

Guard it so repeated auth events cannot double it. Run it **once**, and let sign-in proceed
without waiting on it — a dropped scan must not cost the shopper their preferences.

In this order:

1. **Preferences first** — cheapest to lose, most valuable to keep, and every downstream
   surface reads from them. `POST /api/onboarding/coach` with the guest prefs.
   **An account that already has goals is left alone**: a returning shopper's real profile
   outranks a stranger's session.
2. **The cart** — `POST /api/list` with the guest list, then apply it locally so it is on
   the home surface the moment they land.
3. **The scans** — one `POST /api/haul/scan` each. Individual failures are non-fatal.
4. **Clear the guest key once, at the end**, so a reload cannot double-post.

If any guest goal exists and the account has none, **pre-fill onboarding with it
synchronously**, before the app flips to ready, so onboarding renders already carrying it.

Invalidate any cached Haul afterwards, so it reloads with the carried-over scans.

---

## 6. ACCOUNT DELETION

Required, and it is a real delete.

### 6.1 The screen

In Settings, under an "Account" section, styled as the destructive region.

1. **"Delete my account"** — reveals the confirmation, does not act.
2. Confirmation copy, verbatim:
   > "This permanently deletes your account and all your data — your lists, hauls, scans,
   > chats, and preferences. This can't be undone. Type **delete** to confirm."
3. A text field. The action is enabled only when the trimmed, lowercased text equals
   `delete`.
4. **"Cancel"** and **"Delete forever"**. While deleting, the label reads "Deleting…" and
   both controls are disabled.
5. On failure: `"Could not delete your account. Please try again."` (or the server's
   message), and the confirmation stays open.

### 6.2 `DELETE /api/account` — authed

No body. **200** `{ "ok": true }` · **500** `{ "error": true, "message": "…" }`

On success, clear the local session. The shopper lands back on the signed-out capability
set.

### 6.3 What must actually be gone

Every table keyed to the account, and it must not depend on a database cascade to be true —
the explicit sweep exists so the guarantee does not *depend* on the cascade.

This includes the shopping profile (the most personal thing stored: what they keep buying,
what they removed, what they declined), the haul scans, and any push token. All three were
once missing from the sweep because they were added to the schema after it was written.

**Also clear every device-local artifact**: the cached list, the learning signals, the guest
key, the local read counter, and the disclaimer acknowledgement.

---

## 7. ENTITLEMENT

### 7.1 The snapshot

**`GET /api/subscription` — authed**

**200**
```json
{
  "premium": true,
  "status": "trialing",
  "provider": "promo",
  "trialEndsAt": "2026-08-13T09:00:00.000Z",
  "currentPeriodEnd": null,
  "trialDaysLeft": 6,
  "trialExpired": false
}
```

- `status` ∈ `none` · `trialing` · `active` · `past_due` · `canceled` · `expired`
- `provider` ∈ `stripe` · `apple` · `promo` · null
- `trialExpired` is true only for a lapsed promo trial that never converted — the client
  uses it to say "trial ended" rather than showing a live countdown.

**Never throws.** On any failure it returns the safe non-premium snapshot:
`{ premium: false, status: "none", provider: null, trialEndsAt: null, currentPeriodEnd: null, trialDaysLeft: 0, trialExpired: false }`.
Fail closed to non-premium so a read hiccup never unlocks a paid feature.

**`premium` is the only gate.** Do not derive entitlement from `status` yourself.

### 7.2 Trial eligibility

**Eligible ⇔ `status == "none"`.** That means no trial and no paid history, so the offer is
honest. A lapsed or consumed trial, or any paid record, is not eligible. A **null** snapshot
during the load window is **not eligible** — the safe default is never to dangle a trial CTA
before the shopper's state is known.

### 7.3 `POST /api/subscription/trial` — authed · **THE ONE TRIAL DOOR**

No body. Returns the same snapshot shape as §7.1.

**⚠️ IT IS IDEMPOTENT BY EXISTENCE.** Any subscription row at all — a live trial, a paid
subscription, a canceled or expired one, or one written by mistake — is returned untouched.
That is correct behavior: it stops a shopper restarting a trial they have already had, and
it stops a paying member's state being disturbed.

**The consequence is that a stray write permanently spends the only trial that shopper will
ever get.** Not untidy — unrecoverable without manual database surgery, and invisible,
because the shopper simply never sees a trial offer. **This has already happened once.**

Therefore:

1. **Never call it speculatively** — not on launch, not on onboarding completion, not to
   warm state. It has exactly two call sites: the withheld-read unlock on a scan card
   (`scan.md` §3.8), and the upgrade screen.
2. **Never write a subscription row to represent a purchase state observed locally.** A
   failed or deferred purchase recorded as `past_due` has just consumed the trial.
3. **If a sandbox purchase can reach the production webhook, it can spend a real trial.**
   Keep sandbox events off the production project.

On a successful grant (`premium: true`): update the snapshot, close the upgrade screen, and
— if the shopper was blocked on a gated scan — recompose that read in place from the cached
ingredients. No re-scan, and no free taste spent, because they are now a member.

If the grant did not land (`premium` still false), show
`"The trial didn't start. Give it a moment and try again."` and stay put.

### 7.4 Purchasing — the one real divergence from the web client

The web uses a hosted web checkout. **iOS must use in-app purchase**; a web checkout for
digital goods is a rejection.

**The purchase never reaches the entitlement row directly.** It arrives as a server-side
webhook, and the row is written server-side only:

```
purchase on device → the store → the purchase platform → the server webhook
                  → status mapping → the subscriptions row → `premium` flips
```

Two consequences the client must respect:

1. **The purchase platform's user id MUST be the account's user id**, set before any
   purchase. If the platform mints an anonymous id, the webhook arrives mapping to nobody,
   the route logs and returns success (deliberately, so the platform does not retry an
   unresolvable event), and **the shopper pays and gets nothing.** That is the single most
   likely integration failure and it is silent.
2. **The client must never write premium state, and must never be believed about it.** It
   may optimistically show a success screen off the local transaction, but entitlement is
   whatever `GET /api/subscription` says. Treat a purchase as *pending* until the server
   agrees. Poll the snapshot a few times after a purchase completes (the webhook lands just
   after), then settle.

**Restore purchases is required** by review and is genuinely needed after a reinstall or a
new device. It writes nothing locally; it re-triggers the same webhook path.

**Cancellation is NOT a downgrade.** The status mapping deliberately keeps a shopper
`active`/`trialing` while the paid period is still in the future, and only a later
expiration event flips them. Cancel means "do not renew", not "revoke now" — **do not let
the client short-circuit this.** A cancelled member has paid through the period.

A billing problem maps to `past_due`, which is not premium; grace-period handling is the
platform's and needs nothing client-side.

**A lapse is `expired`, and nothing a lapsed member built is taken away.** They keep the
entire free surface — the card summary including the tier sentence, all scanning, unlimited
asking, all browsing, and the whole list. That is the point of the list being free.

The web billing routes (`POST /api/billing/checkout`, `POST /api/billing/portal`) return
`{ "url": "…" }` and exist for the web client. **Do not call them from iOS.**

### 7.5 Prices

**Two numbers are authored. Everything else is arithmetic.**

- monthly = **$5.99**
- annual = **$44.99**

Derived, never hand-written:
- effective monthly on the annual plan = `round(4499 / 12)` = **$3.75**
- saving = `floor((1 − 4499 / (599 × 12)) × 100)` = **37%**, against the honest baseline of
  twelve monthly payments ($71.88)

**The saving is FLOORED, never rounded.** Overstating a saving is the error that matters;
understating by a fraction of a point costs nothing.

This has been hand-written twice and wrong twice. At $7.99/$59.99 the note read "About
$5/month", correct then; when monthly moved to $5 that line advertised annual as *identical*
to monthly. Rewritten to "$3.75/month … Save 25%", right for $5/$45 and wrong the moment
the real prices landed. **A wrong percentage on a pricing page is the one copy error that
costs trust immediately.** Compute both, from the two numbers, in one place.

**The store product prices must agree with those two numbers or the copy lies.**

Display strings:

| plan | label | price | per | inline amount | note | badge |
| --- | --- | --- | --- | --- | --- | --- |
| annual | Annual | $44.99 | /year | "$44.99/year" | "$3.75/month, billed yearly" | "Save 37%" |
| monthly | Monthly | $5.99 | /month | "$5.99/month" | "Cancel anytime" | — |

**Annual is listed first** — it is the value plan we lead with.

Price *identifiers* are configuration, never hardcoded, and the client never sees them.

---

## 8. THE UPGRADE SURFACES

There are two, and they are different things.

### 8.1 The ask sheet — the ONE interrupting moment

Presented at **exactly one moment in the entire app: the fourth full-read tap.** Not on
open, not on a scan, not on an ask, not on a save, **never a banner**.

The checkable shape of the defect is *an upgrade affordance whose render condition contains
no action* — tier alone is not a moment, because every non-member satisfies it on every
render. Four separate asks have been removed for breaking this rule (see `cart.md` §7).

A bottom sheet, max 440pt, with a grabber:

1. Headline in Kristy's voice, 21pt: **"82 cards. Every counter in the store."**
2. Body: "The summary stays free, always. The full read is what to look for, the traps that
   catch people, and why the call carries the tier it does."
3. A gold thread rule, then the frame, in her voice: "A nutritionist answers the questions
   you bring. This one answers the questions you didn't know to ask, in the aisle, while it
   still matters."
4. The two plans as tappable blocks, **annual first and gold-tinted**: label, badge, price
   with its per-unit, and the note.
5. **"Not now"**, centered and quiet.

**The COUNT is the argument.** No countdown, no "limited time", no urgency of any kind: the
corpus is either worth it or it is not, and saying how big it is answers that better than a
timer. The frame is a nutritionist rather than another scanner, because the counter's real
advantage is the questions a shopper did not know to ask.

There is **exactly one entry in the upgrade copy table**, and adding a second is how the
dishonest list-save ask existed at all.

### 8.2 The upgrade screen — a destination

Reached from the sidebar, from Settings, from the header mark, and from the ask sheet.
These are destinations the shopper navigated to, so **chrome is excluded from the one-moment
rule.**

Content: the "K" avatar, the title "Kristy, your coach", the line "Anyone can see what's in
it. Membership makes every scan about your goal.", then what membership unlocks:

- "Your read on every scan — against your goal, not a generic label"
- "Your focuses, held on every product — sodium, sugar, processed fats"
- "Your week, read — what the cart says and what to fix"
- "Your list, built — around your goal, minus your hard lines"

Then the two plans (selectable, annual preselected), then the action, which **branches on
trial eligibility**:

| eligible | primary | secondary |
| --- | --- | --- |
| yes | **"Start the free week"** → §7.3, then a note "7 days, full access. No card required." | "or subscribe now — $44.99/year" |
| no | **"Start coaching — $44.99/year"** | "Manage subscription" when a managed record exists, else the line "Cancel anytime." |

Errors render inline above the actions; the sheet stays open.

### 8.3 The header mark

A single quiet gold word, "Premium", beside the goal chip, shown only when the snapshot says
`premium == false`. Tapping opens the upgrade screen. **The membership should be findable
from anywhere without ever becoming a banner** — visible, not interruptive.

### 8.4 Settings — the membership row

A status line plus one control.

| snapshot | line |
| --- | --- |
| null | "Free plan" |
| `trialing` and premium | "*N* days left in your trial" (singular at 1) |
| `active` | "Premium — active" |
| `past_due` | "Payment issue — update your card" |
| `trialExpired` | "Trial ended" |
| `canceled` | "Canceled — renew anytime" |
| anything else | "Free plan" |

Control: **"Manage"** when there is a managed billing record to open, otherwise
**"Upgrade"** — or **"See plans"** when they are already premium.

Settings also shows a read-only summary of the shopping preferences as chips (goal,
focuses, hard lines, constraints; "Not set yet — tell Kristy what you're shopping for."
when empty) and an "Edit shopping preferences" control that opens the editor
(`onboarding.md` §5).

---

## 9. GUESTS ARE OFFERED NO PLAN BUTTONS

While phone sign-in is blocked, a signed-out shopper must be shown **no purchasable plan
anywhere**.

Buying needs an account, an account needs a phone code, and phone codes cannot arrive. A
guest who tapped a plan would type a number, press Send code, and wait for a message that
cannot come. **A door that does not open is worse than no door.**

They keep the whole free surface **and the teaser**, which still shows the full shape of
what sits behind the gate — it just stops naming a price nobody can pay. Concretely, in the
card teaser (`counter.md` §4.3) the tappable price block is replaced by the same headline as
plain text.

**Restore the plan buttons the day sign-in works.**

---

## 10. RATE LIMITS AND BUDGETS

Not entitlement, but they surface as gates, so they belong here.

| budget | scope | limit | over-budget response |
| --- | --- | --- | --- |
| guest inference (chat, verdict, scan, guest compose, guest import) | per IP, 1 hour | 8 | `{ "gate": true, "reason": "limit" }` or a 429 with `gate`/`reason` → the **terminal** sign-in gate |
| guest cart build / attach | per IP, 1 hour | 20 | **429** `{ "error": "rate_limited", "message": "…" }` |
| counter ask (anonymous) | per IP, 1 hour | 40 | **429** `{ "error": true, "message": "Too many questions at once. Try again shortly." }` → render as one line in her voice |
| authed model spend (chat, verdict, scan, compose, import) | per user, 1 hour | 60 | **429** `{ "error": true, "message": "<Kristy-voiced line>" }` |
| list compose, non-premium | per user, **24 hours** | 12 | **429** `{ "error": true, "message": "<ceiling line>" }` → show as her note, **no upgrade offer** |
| counter free reads | per account, or per device signed out | 3 | **402** with the summary card and teaser |
| verdict free notes | per account | 3 | `gated: true` with the upsell line |

Two of these are budgets, not gates, and the difference is the copy: over the list-compose
ceiling the shopper is told plainly, in her voice, and adding by hand still works. **Do not
tell someone to retry against a ceiling** — that is how you make them retry.

The counter-ask bucket is deliberately separate from the shared guest one. When they were
shared, eight counter questions left a stranger with no guest chat, verdict or scan for the
hour: the shopper who used the counter ended up with less than the one who ignored it,
which is the opposite of what the free layer is for.

---

## 11. PRIVACY GUARANTEES THE CLIENT MUST NOT BREAK

- **The counter's free layer stores no personal data.** Questions the knowledge base
  answers badly are logged as a normalized topic, an outcome and a timestamp — **no user
  key, no IP, no session** — with the text scrubbed and capped before it is stored. That is
  why the signed-out read meter is on the device and the count rides up on the request: an
  IP-keyed meter would break the claim to enforce a limit that clearing storage defeats
  anyway.
- **A guest's counter answer does not spend their free run.** It is a deterministic
  knowledge-base read with no model call and nothing stored, and the counter is the free
  layer by design — charging it against a four-message budget puts a sign-in wall in front
  of the exact thing a stranger came to try. The budget exists for the model, and the model
  was never called.
- **Scanned products are products, not people.** The shared product catalog carries no user
  identity, ever.
- **Individual behavior never joins the aggregate pool.** The two shared-pool writers must
  not read per-user state at all.
- **No images are stored or uploaded** beyond the vision call that already happens.
- The shopping profile is the most personal thing stored, and **it leaves with the shopper**
  (§6.3).

---

## 12. KNOWN STATE OF THE WORLD

- **Phone sign-in is not live yet, and it gates revenue** — no account, no purchase. The
  carrier brand and campaign are submitted and in verification; nothing else is expected to
  block it. There is **no server work and no client work** left for it: the app is already
  correct and needs nothing.
- Until it lands, **every visitor is a guest**. Build and test the signed-out capability set
  as the primary path, not the fallback.
- **Do not add a custom SMS delivery hook.** One existed to work around a provider that was
  abandoned; the code sat in the repo describing a plan nobody was following for long enough
  to mislead a reader into reporting the wrong provider as live. It has been deleted.
  **Dead code that describes an abandoned decision is worse than no code: it is
  documentation that lies.**
- **No second auth rail.** Email one-time codes were proposed as a faster path and rejected.
