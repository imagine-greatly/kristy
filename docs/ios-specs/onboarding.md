# iOS spec — ONBOARDING

The front door. Kristy asking who she is shopping for.

It is **not** a fitness intake, **not** a macro/TDEE setup, and **not** a sign-in wall. It
runs with or without an account, it is fully skippable, and completing it grants nothing —
no trial, no purchase, no state change beyond the shopper's own preferences.

Derived from `client/src/components/CoachOnboarding.jsx`, `GoalSwitcher.jsx`,
`FocusDisclaimer.jsx`, `Settings.jsx`, `client/src/lib/coachGoals.js`, `preferences.js`,
`guestState.js`, and the server handlers in `server/routes/onboarding.js`,
`preferences.js`.

Conventions (base URL, bearer token, error envelope) are as stated in `cart.md` §0.

---

## 1. WHEN IT RUNS

| shopper | condition | what they see |
| --- | --- | --- |
| signed out, never onboarded | no stored guest prefs and no stored "onboarded" flag | onboarding, with the CTA labeled **"Start shopping"** |
| signed out, onboarded or skipped | otherwise | straight into the app |
| signed in, no goals, never skipped | profile has no goals AND no per-user skip flag | onboarding, CTA **"Start shopping"** |
| signed in, has goals or skipped | otherwise | straight into the app |

The skip decision is remembered **per user id, per device**. A fresh device re-offers
onboarding to a still-goal-less shopper, which is the behavior we want. A guest's
"onboarded" flag is device-local and flips on completion **or** skip.

**Onboarding captures HOW they eat. It does NOT build a cart.**

It used to: a stranger answered four screens and was handed a generated 18-item cart.
However good each row was, nobody asked for it, so the whole thing read as imposed and
generic. **The preferences are the lens; the cart is what the shopper puts in it.** So it
lands them on the home surface with Kristy's question, and the answer to *that* builds the
list. "Build a full cart" is still available to anyone who wants one — it is a choice now,
not the default.

---

## 2. THE FLOW — four steps

A full-screen surface over the app: a contained centered panel on wide screens, filling the
width on a phone. The body scrolls within the panel so the actions stay reachable.

Header: the wordmark "Kristy" in the display italic face at 26pt brass, and four progress
dots with the current one in gold.

Footer, in order: a gold thread rule, then the action row, then the skip link.

| step | key | prompt | required |
| --- | --- | --- | --- |
| 0 | goals | "What are you shopping for?" | **yes** — at least one goal |
| 1 | lines | "Anything to keep out?" | no |
| 2 | context | "Anything to work around?" | no |
| 3 | confirm | "Here's your setup." | — |

Four steps, not five: watching sodium and shopping on a budget are the same *kind* of
answer (things that shape the picks), and asking them on one screen keeps the whole thing
near a minute.

**Actions**
- "Back" (steps 1–3), quiet, outlined.
- **"Continue"** on steps 0–2, **filled** — the step's one filled action. Disabled on step 0
  until at least one goal is selected (render it at reduced emphasis while disabled).
- On step 3 the filled action is the CTA label (default **"Start shopping"**), disabled
  while busy or if no goal is set. Label becomes "One moment…" while saving.

**Skip** — never a trap:
- Step 0 → "Skip for now". This means "don't set me up at all": it dismisses onboarding
  entirely and leaves the shopper goal-less on universal verdicts.
- Steps 1–2 → "Skip this". This just advances past a question they don't have an answer
  for, which is the difference between a conversation and a form.
- Step 3 has no skip.

### 2.1 Step 0 — goals

1. **The identity, said before anything is asked**, in a small muted paragraph with a gold
   left rule:
   > "Coach for the whole store. The boxes with a barcode, and the meat, fish, eggs,
   > produce and bulk that never had one."

   A stranger who came from the landing page arrives here first, and what they need to know
   in one line is that this covers the counter, not just the barcode.
2. Prompt "What are you shopping for?" in the display italic face at 26pt.
3. Sub: "Pick all that fit. Or just say it in your own words."
4. **Natural language LEADS** — a text field plus a "Set it up" button, above the chips.
   Max 600 characters. Placeholder: `"High protein, clean eating, no seed oils, feeding
   kids…"`. See §3.
5. The ten goals, as full-width selectable cards: title, blurb, and a gold checkmark at the
   right when selected. Selected state is a gold hairline plus a gold tint.

**Goals are a SET.** A real shopper is often several at once (high-protein AND eating
cleaner AND feeding a family), so this is multi-select.

| value | title | blurb |
| --- | --- | --- |
| `eating_cleaner` | Eating cleaner | Fewer additives, more real food. |
| `high_protein` | High-protein | Protein that pulls its weight, every trip. |
| `low_sugar` | Low-sugar | Keep the added sugar out of the cart. |
| `family` | Feeding a family | What ends up in everyone's pantry. |
| `gut_health` | Gut health | Feed the gut — fewer additives, more whole food. |
| `avoiding_junk` | Avoiding the junk | Skip the ultra-processed stuff. |
| `weight_loss` | Weight loss | Food that fills you up, not out. |
| `muscle_strength` | Muscle & strength | Protein first, quality close behind. |
| `pregnancy_postpartum` | Pregnancy & postpartum | Extra careful, for a season. |
| `athlete_performance` | Athlete / performance | Fuel that earns its place. |

Each goal also carries three phrasings used elsewhere — the compact chip label, the phrase
sent to the verdict engine, and the phrase shown on a card:

| value | chip label | note label (sent to `/verdict` as `goal`) | read label (shown as "for your …") |
| --- | --- | --- | --- |
| `eating_cleaner` | Eating cleaner | eating cleaner | clean eating |
| `high_protein` | High-protein | high-protein shopping | high-protein shopping |
| `low_sugar` | Low-sugar | keeping added sugar down | low-sugar shopping |
| `family` | Family | feeding your family | family |
| `gut_health` | Gut health | gut health | gut health |
| `avoiding_junk` | Avoiding junk | avoiding the junk | junk-free cart |
| `weight_loss` | Weight loss | losing weight | weight loss |
| `muscle_strength` | Muscle | building muscle | muscle & strength |
| `pregnancy_postpartum` | This season | being extra careful this season | this season |
| `athlete_performance` | Performance | eating for performance | performance |

**Joining several**: `a, b and c`. Two goals → `a and b`.

**Legacy values.** Stored profiles may still hold retired ids. Map them at read time and
never surface the old word:

| stored | reads as | plus |
| --- | --- | --- |
| `cut` | `eating_cleaner` | — |
| `recomp`, `performance` | `high_protein` | — |
| `energy`, `steady energy` | `low_sugar` | — |
| `budget_clean` | `eating_cleaner` | inject constraint `budget` |
| `kids_snacks` | `eating_cleaner` | inject constraint `picky_kids` |

The two retired *goals* map to a goal **plus a constraint**, surfaced at read time so the
list and the note act on it with no data migration. Combine with any constraints the
shopper set explicitly.

### 2.2 Step 1 — hard lines

Prompt "Anything to keep out?" · Sub: "Optional. Held on every product, no exceptions."

1. **A sweep control**: "No artificial anything", with a sub reading "Turns on every
   additive line below" (or "Tap to clear them" when every synthetic line is already on).
   Tapping toggles all of them at once.

   **It deliberately excludes the four dietary lines.** Those are an identity or an allergy,
   and they strip real food from the cart — "everything artificial out" must not quietly
   also mean "no meat". Derive the sweep set as "every hard line not marked dietary", so a
   line added later joins automatically unless it is dietary.

2. The hard lines as chips (multi-select, 44pt minimum height, wrapping, gold-tinted when
   on):

| value | label | dietary | advisory |
| --- | --- | --- | --- |
| `no seed oils` | No seed oils | | |
| `no artificial sweeteners` | No artificial sweeteners | | |
| `no artificial dyes` | No artificial colors or dyes | | |
| `no hfcs` | No HFCS | | |
| `no msg` | No MSG | | |
| `no natural flavors` | No natural flavors | | |
| `no gums` | No gums | | |
| `no refined sugar` | No refined sugar | | |
| `no carrageenan` | No carrageenan | | |
| `no added nitrites` | No added nitrites | | |
| `no palm oil` | No palm oil | | |
| `vegetarian` | Vegetarian | ✓ | |
| `vegan` | Vegan | ✓ | |
| `dairy-free` | Dairy-free | ✓ | ✓ |
| `gluten-free` | Gluten-free | ✓ | ✓ |

**`advisory` means the knowledge base carries no data to check it.** Gluten and dairy are
not in an additive database. Those still reach the note as context, but **nothing may claim
to enforce them** — pretending to check something we cannot check is the same failure as
inventing a concern.

The `value` strings are what the server matches on. They are not display strings and must
not be localized or reformatted.

### 2.3 Step 2 — focuses and constraints

Prompt "Anything to work around?" · Sub: "Optional. What you're watching, and what you're
working with."

**Group "Watching"** — the focuses, as chips:

| value | label |
| --- | --- |
| `lower_sugar` | Watching added sugar |
| `blood_sugar` | Blood-sugar-conscious |
| `lower_sodium` | Watching sodium |
| `heart` | Heart-conscious |
| `caffeine` | Watching caffeine |
| `higher_fiber` | Higher fiber |
| `processed_fats` | Watching processed fats |
| `additive_sensitive` | Additive-sensitive |

**Labels are exact and preference-framed. No condition names, ever.** A focus is something
the shopper turns on **about themselves** — never pre-checked, never inferred.

Every one is backed by a real knowledge-base category or a real nutrition field. A chip
that escalated nothing would be a preference the app pretends to hold.

**As soon as at least one focus is selected on this step, show the disclaimer inline**
beneath the group, in Kristy's voice (§4).

**Group "What are you working with?"** — the constraints, as chips:

| value | label | blurb |
| --- | --- | --- |
| `budget` | Shopping on a budget | Stretch the cart without eating garbage. |
| `short_on_time` | Short on time | Twenty minutes, not an evening. |
| `picky_kids` | Picky kids | It has to actually get eaten. |
| `no_kitchen` | No real kitchen | Minimal equipment — dorm, office, small space. |
| `one_pan` | One pan, one burner | One vessel on a hob. Nothing that needs a second pot. |
| `no_oven` | No oven | Nothing that needs roasting or baking. |
| `cooking_for_one` | Cooking for one | Small portions, nothing that spoils before you finish it. |

Section sub: "Optional. Whatever you're working with, the cart works around it."

**Time and equipment are different constraints.** `short_on_time` is about minutes only. It
once read "Little or no cooking" — an equipment statement standing in for a time one, which
is exactly the collapse `one_pan` and `no_oven` exist to undo. **There is no "full kitchen"
chip on purpose.**

Constraints shape the list and the note's emphasis, and **never move a verdict** — so they
carry no health claim.

### 2.4 Step 3 — confirm

Prompt "Here's your setup." Sub, built from the selections:

> "Shopping toward *high-protein, eating cleaner and gut health*. You can change any of it
> any time from the header."

(lowercased goal titles, joined `a, b and c`). With no goals: "Pick at least one goal to
shop toward."

Then four read-only chip groups, each omitted when empty:

**"Shopping toward"** (goals) · **"Watching"** (focuses) · **"Hard lines"** ·
**"Working with"** (constraints)

Labels resolve through the goal titles, focus labels, hard-line labels, constraint labels,
and — for a custom hard line — §5.2.

### 2.5 Completing

Build the payload from the four sets and hand it off:

```json
{ "coach_goals": ["high_protein"], "non_negotiables": ["no seed oils"], "focuses": ["lower_sodium"], "constraints": ["budget"] }
```

- **Signed in** → `POST /api/onboarding/coach` (§6.1). Apply the values optimistically and
  keep them on failure — the shopper can re-set from the header chip, and losing their
  answers to a network blip is worse than a silent retry.
- **Signed out** → write to device storage under the guest key, mark onboarded, and keep
  the primary goal in the legacy single-goal slot so it can pre-fill a later account.

**If any focus was selected, mark the coach-not-doctor disclaimer as acknowledged** rather
than firing the modal later — the in-context note on step 2 already stood in for it.

**Completing grants nothing.** It saves preferences and marks the shopper onboarded. It
does **not** start a trial, does not touch billing, and does not build a cart. See §7.

---

## 3. FREE TEXT — "or just tell me"

A text field that maps plain words onto the fixed taxonomy. It is offered **above** the
chips on step 0, and again as the lead input in the preferences editor (§5).

### 3.1 `POST /api/preferences/interpret` — public

**Request** `{ "text": "high protein, no seed oils, cooking for one" }`

**200**
```json
{
  "goal": "high_protein",
  "focuses": ["lower_sodium"],
  "hardLines": ["no seed oils"],
  "constraints": ["cooking_for_one"],
  "unmapped": ["organic everything"],
  "reply": "<one line in her voice>"
}
```
**400** `{ "error": "text_required" }` or `{ "error": "text_too_long" }` (over 600 chars)
**502** `{ "error": "interpret_failed" }`

**The server maps onto the fixed taxonomy and filters the result against it**, so nothing
free-form can reach the engine. Values that arrive are guaranteed to be preferences the
engine can act on. `unmapped` is what she could not place — say so plainly rather than
silently dropping it.

### 3.2 Two behaviors, and they differ on purpose

**During onboarding**: the parse is applied **immediately** and merges into the current
selections (union, never a replacement — a shopper who tapped two goals and then typed a
third keeps all three). Clear the field. On failure show, quietly:
"That didn't go through. Try again, or tap below."

The shopper is still mid-flow and every chip is on screen to correct; showing a confirmation
step here would be a form inside a form.

**In the preferences editor**: the parse is shown as chips **for confirmation, never applied
silently**, alongside her `reply`. Two controls: **"Looks right"** applies them (skipping
anything already on) and clears the field; **"Not quite"** discards and returns to idle.
On failure: "That one didn't go through. Try again, or tap what you want above."

---

## 4. THE ONE-TIME DISCLAIMER

Fired **the first time any focus is turned on**, and never again. Acknowledgement is stored
per device.

Verbatim, in Kristy's voice:

> "Straight up: this is a grocery coach, not a doctor. Anything a doctor has already told
> you about stays with them and a dietitian. This is shopping, not treatment."

Two presentations:
- **Inline** on onboarding step 2, as a quiet note beneath the focus chips as soon as one is
  selected. This *counts* as the disclaimer: completing onboarding with a focus set marks it
  acknowledged.
- **As a one-time modal** when a focus is turned on anywhere else (the editor, or accepting
  a contextual focus offer from a scan — see `scan.md` §3.10). Dismissing acknowledges it.

**No disclaimer for constraints.** Constraints are not health, they are the shopper's
situation.

---

## 5. THE PREFERENCES EDITOR

Reached from the goal chip in the header, from Settings, and from a chat bubble's "Edit
preferences". Presented as a bottom sheet, max 460pt wide, up to 92% height, scrollable,
with a close control top-right.

**The goal is a MODE, not an identity**: tap the chip, switch what you're shopping for, and
the next verdict reflects it. No confirmation friction.

Order:

1. Title "What are you shopping for?" (display italic 26pt) and sub "Say it in your own
   words, or tap a few below. Switch anytime."
2. **The free-text intake, leading** (§3.2, confirmation variant). Its "Set it up" button is
   **this sheet's one filled action**.
3. Gold thread rule.
4. "Or pick a few" — the ten goal cards, multi-select, same treatment as onboarding.
5. Gold thread rule.
6. "Anything to keep an eye on?" / "Optional. Whatever is on here gets flagged as you shop."
   — the focus chips.
7. "What are you working with?" / the constraints sub — the constraint chips.
8. "Hard lines" / "Held on every product, no exceptions." — the hard-line chips, **plus**
   any custom lines the shopper has added, rendered on and tappable so they can be turned
   off the same way they were turned on.
9. The custom hard-line search (§5.2).

**Every toggle is immediate and optimistic**, and the sheet **stays open** so several can be
set in one visit. Persist each change; on failure keep the optimistic value.

Toggling a goal keeps the sheet open too (goals are multi-select). Keep a primary goal in
sync — the first in the set — for the header chip.

### 5.1 The header goal chip

Label: the primary goal's **chip label**, plus `" +N"` when more than one goal is set (e.g.
`"High-protein +2"`). Empty string when no goal is set — render the chip in its unset state
rather than hiding it, so there is always a way in.

### 5.2 Custom hard lines

Search the knowledge base by name or alias and add any ingredient as a personal absolute.

**`GET /api/ingredients/search?q=<term>` — public**

**200** `{ "results": [ { "id": "carrageenan", "name": "Carrageenan", "value": "kb:carrageenan", "aliases": ["Irish moss extract", "E407"] } ] }`

Client rules:
- Minimum 2 characters; below that, clear results and issue no request.
- **Debounce ~180 ms, and make it last-write-wins** so a slow response cannot overwrite a
  newer one.
- Cache by exact query for the session.
- Any failure returns nothing. Search is an affordance, never a blocker.

A result row shows the name, up to two aliases (`"also: a, b"`), and an action reading
"+ Hard line", or "Added" and disabled when it is already on. Tapping adds it and clears
the field and results.

A custom line's stored value is `kb:<ingredient_id>`. Its display label is
`"No <id with underscores as spaces>"` — e.g. `kb:red_40` → "No red 40". A value starting
`kb:` is how you recognize one.

**A custom line is a literal matcher**: if the label carries that ingredient, the verdict
escalates and Kristy names it. It introduces **no new health claim**.

---

## 6. API

### 6.1 `POST /api/onboarding/coach` — authed

**Request**
```json
{
  "coach_goal": "high_protein",
  "coach_goals": ["high_protein", "eating_cleaner"],
  "non_negotiables": ["no seed oils", "kb:carrageenan"],
  "focuses": ["lower_sodium"],
  "constraints": ["budget"]
}
```
`coach_goal` is the primary (first of the set), kept for older rows. Send both.
Every array is filtered server-side to non-empty trimmed strings.

**200** `{ "ok": true, "profile": { /* the saved profile row */ } }`
**500** `{ "error": "Could not save your goal." }`

**It does not grant the trial.** Setting a goal is where the coaching relationship begins,
not where the shopper commits to membership. Coupling them would skip the free-taste
mechanic entirely (a trialing user is premium, so the free counter never increments) and
burn a weekly-cadence trial on a casual tap.

### 6.2 `GET /api/preferences/taxonomy` — public

**200** `{ "goals": [...], "focuses": [...], "hardLines": [...], "constraints": [...] }`

The enumerable preference set, as the server holds it. **Prefer this over the hardcoded
tables in §2** if you want the pickers to survive a server-side taxonomy change without a
release. The tables above are the current contents and are what the mirror tests pin.

### 6.3 `POST /api/onboarding/full` — authed

The TDEE / macro setup. **Do not build this.** Macro tracking was removed as a feature —
not hidden, not opt-in — and this endpoint is part of that dead surface. It is listed here
only so nobody wires it up by accident.

### 6.4 Reading the profile back

The profile row carries `coach_goals` (the set), `coach_goal` (the primary, older rows
only), `non_negotiables`, `focuses`, `constraints`, and `free_notes_used` /
`free_reads_used` (the two meters).

Resolve the active goal set as: `coach_goals` when it is a non-empty array, else
`[coach_goal]` when set, else empty.

Resolve constraints as: the stored `constraints`, plus any injected by a retired goal
(§2.1), deduplicated.

---

## 7. WHAT ONBOARDING MUST NEVER DO

1. **Never grant, start, or touch a subscription.** Not the trial, not a purchase, not a
   "warm-up" write. The trial has exactly one door and it is taken at peak intent (see
   `auth.md` §7.3). It is idempotent *by existence*: any subscription row at all, in any
   status, is returned untouched — so a stray write **permanently spends the only trial
   that shopper will ever get**, unrecoverably and invisibly, because they simply never see
   a trial offer. This has already happened once.
2. **Never build a cart.** The payoff is the home surface asking what the trip is for.
3. **Never require an account.** Every step works signed out, and the answers survive
   sign-in (see `auth.md` §5).
4. **Never pre-check a focus or infer one.** Focuses are preferences the shopper turns on
   about themselves, never inferences from behavior.
5. **Never name a medical condition**, in a label, a blurb, or a payoff line. Anything
   medical defers to a doctor.
6. **Never let the sweep include a dietary line.**
7. **Never block on a save.** Apply optimistically; a failed write costs a re-tap from the
   header chip, and a blocking spinner costs the whole flow.

---

## 8. WHERE PREFERENCES ARE USED

So a Swift developer knows what these four sets actually drive:

| set | drives |
| --- | --- |
| goals | the cart template blend, the verdict note's framing (`goal` on `/api/verdict`), the "for your …" label on the scan card, the header chip |
| focuses | bounded escalation in the verdict engine, focus-aware cart additions, the contextual focus offer |
| hard lines | a deterministic knowledge-base match that can **withhold the seal** and escalate a tier — applied on **every tier including guests**, because a refusal is not a personalization luxury |
| constraints | the picks the cart chooses (budget buys the whole chicken; short-on-time buys the rotisserie) and the note's emphasis. **Never a verdict.** |

All four ride on `/api/list/*` from the **stored profile**, never from a request body, so a
tampering client cannot obtain premium capabilities. The exceptions are the guest routes,
which have no profile to read and therefore take them in the body — **filtered against the
taxonomy server-side**, so a client cannot invent a goal, a focus or a constraint.
