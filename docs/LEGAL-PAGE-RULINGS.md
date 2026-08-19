# Legal page rulings — the account behind `/privacy` and `/terms`

**These pages are SERVED TO THE PUBLIC, and App Review reads them. This file exists because
their governing rulings were written as HTML comments inside the pages themselves, where the
audience is wrong: a reviewer opening source found "nobody has ever signed in, on any rail",
the Supabase provider measurements, and the state of a Twilio registration.**

⚠️ **NOTHING IN THOSE COMMENTS WAS FALSE. THAT IS NOT THE TEST FOR A SERVED PAGE.** The rule
they were written under — *each file carries its ruling, so a session editing it cannot miss
it* — is a good rule and it is unchanged. **It was written for source files nobody outside the
project reads.** A compliance page is not one of those, and the rule does not survive contact
with an external audience. **The pointer stays in the page; the reasoning lives here.**

📎 **Governs:** `client/public/privacy.html`, `client/public/terms.html`. Both now carry a
one-line pointer to this file in place of the block quoted below.

✅ **A SIDE EFFECT WORTH NAMING: THE TWIN-DIVERGENCE RISK IS GONE.** The two comments were
deliberately different from each other and each ended with *"if you change one, change both"* —
the two-copies shape that produced the category-capture error. **One doc and two identical
one-line pointers cannot disagree.** The *deliberate* difference that mattered is preserved
below, in §3, where it is a recorded fact rather than a live duplication.

---

## 1. The ruling

⛔ **PHONE SIGN-IN IS DEAD PRODUCT-WIDE, RULED 2026-08-19 — not "superseded only on iOS", not
"dormant".** This reverses a standing *dormant-not-deleted* position, and the reversal is the
load-bearing part: under the old position a session would have **defended** the SMS text on
these pages as a live disclosure.

Three measured facts settle it, and none of them is an argument:

1. **The provider is OFF** — Supabase `GET /auth/v1/settings`, live and cache-busted
   2026-08-18: `phone: false`, `apple: true`, `email: true`. **No SMS can be sent.**
2. **Nobody has ever signed in, on any rail.** No numbers held, no users to migrate, no
   revenue at stake.
3. **`client/src` is frozen and the web client becomes a landing page.** `Auth.jsx` still
   calls `signInWithOtp({ phone })`; with the provider off that call **cannot complete**. It
   is an inert form, not a permanent rail.

⚠️ **SO THE DELETED SECTIONS DID NOT DESCRIBE A PRACTICE THAT HAD ENDED. THEY DESCRIBED ONE
THAT CANNOT HAPPEN.** A privacy policy asserting a data collection that does not occur is
worse than one that is silent about it. Both pages now state that Kristy collects no phone
numbers and sends no SMS.

⚠️ **THE CODE IS NOT DELETED AND THAT IS NOT A CONTRADICTION.** `client/src` is frozen, so
`signInWithOtp` stays where it is — **frozen, not endorsed.** The ruling is about what the
product does and what its pages may claim. **Do not open the frozen client to finish it;
there is nothing there to finish.**

## 2. The cost, accepted rather than overlooked

The deleted sentences were the **required A2P 10DLC elements**: OTP purpose,
consent-by-entry, one message per request, STOP/HELP, message frequency, rates, processors,
and the do-not-sell pledge. Each was kept on **one unbroken source line** because carrier
review is often automated against raw HTML (**rejection code 805**). A 10DLC registration was
**in verification at Twilio**.

**A dead rail needs no registration, so it is moot and should be withdrawn.**
✅ The owner took the withdrawal as their own item, 2026-08-19 — not a repo task, and nothing
here is blocked on it.

⛔ **DO NOT RE-ADD THE SMS TEXT TO PASS A CARRIER REVIEW WHILE THE PROVIDER IS OFF.** That
puts a false collection statement back on a live page in order to satisfy a review of a rail
nothing uses. It is the one move this ruling exists to prevent.

## 3. If the rail is ever revived — the recovery procedure

**The sentences are recoverable from git history at `9355a39`** (*"The SMS text comes off the
live pages, cherry-picked past the hold"*). Recover them **from that commit**, and note:

- ⚠️ **THE TWO FILES WORDED THE CONSENT SENTENCE DIFFERENTLY, ON PURPOSE.** Copying one file's
  version into the other loses that. **Recover each file from its own diff at `9355a39`.**
- ⚠️ **PUT THE UNBROKEN-LINE NOTE ABOVE EVERY SENTENCE IT BINDS.** A constraint recorded above
  one sentence does not travel to its neighbour — that is how the mirror-image wrap shipped.
- ⚠️ **RE-ADD THE WHOLE LIST, not only the sentences that happened to carry notes.** The 10DLC
  requirement is a property of the **list**, not of its individual members.
- **Re-check the provider state first.** If `phone` is still `false`, the answer is no.

## 4. What `/privacy` may no longer claim

⛔ **THERE IS NO DELETE DOOR ON THE WEBSITE, AND DO NOT RESTORE ONE.** The page used to say
*"This is the same door on the website and in the iPhone app"* and *"that door works the same
on both platforms"*. **Both false, and the page contradicted itself two screens earlier**,
where it already says Sign in with Apple in the iPhone app is the only way to sign in.

**Measured before changing it:** the web door is `App.jsx:1298`, inside the branch
`App.jsx:975` returns past for every real visitor, and `GuestApp` has no settings or delete
door at all — **unreachable twice over.** The iPhone app is the only route
(`DeleteAccountSection.swift` → `DELETE /api/account`).

⚠️ **THE NON-OBVIOUS HALF WAS THE SCOPE PARAGRAPH**, which listed *"how you delete it"* among
the things applying to website and app **equally** — now the one thing that does not. Deletion
is carved out **by name** rather than dropped silently.

⚠️ **THIS BECOMES WRONG AGAIN THE DAY THE WEB CLIENT GETS A WORKING SIGN-IN.** It is a landing
page today; if that changes, this paragraph is the one to re-read.

## 5. Publication state

✅ **PUBLISHED AND VERIFIED SERVED, 2026-08-19.** `9355a39` + `293a63f` were **cherry-picked
past the hold** on `origin/main` rather than waiting for the stack: a live compliance page
asserting a collection that cannot occur outranks the tidiness of the hold, and App Review
reads these URLs. **Verified by FETCHING, not by reading source** — `/privacy` and `/terms` on
**both** `kristyapproved.com` and the `.vercel.app` alias returned 200 and were byte-identical
to the committed files; the SMS strings were absent from the served bytes.

---

## Appendix — the two comments, verbatim, as they stood in the pages

**Kept verbatim because this is the record of what was removed.** Nothing below is a live
instruction; §1–§5 above are. Where the two disagree, above wins — the appendix is a snapshot.

### A. `client/public/privacy.html`

```html
<!-- ⚠️ RULED 2026-08-19: PHONE SIGN-IN IS DEAD PRODUCT-WIDE, NOT SUPERSEDED ONLY ON iOS.
     This block replaces two SMS sections and an A2P 10DLC pledge that were kept here on
     purpose until that ruling, under a "do not delete, the web rail is live" note. THAT
     NOTE IS SUPERSEDED AND IS NOT TO BE RESTORED. What settles it is not a preference:

       * Supabase's phone provider is OFF, measured live and cache-busted 2026-08-18
         (phone: false, apple: true, email: true). No SMS can be sent.
       * NOBODY HAS EVER SIGNED IN, ON ANY RAIL, so there are no numbers held and no
         users to migrate.
       * client/src is frozen and the web client becomes a landing page. Auth.jsx still
         calls signInWithOtp, and with the provider off that call cannot complete — an
         inert form, not a live rail.

     So the deleted sections did not describe a practice that had ended; they described
     a practice that CANNOT HAPPEN. A privacy policy asserting a data collection that
     does not occur is worse than one that is silent about it.

     ⚠️ THE CONSEQUENCE, STATED RATHER THAN DISCOVERED: the deleted sentences were the
     REQUIRED A2P 10DLC elements, each kept on one unbroken source line because carrier
     review is often automated against raw HTML (rejection code 805). A 10DLC
     registration was IN VERIFICATION at Twilio. With phone sign-in dead product-wide
     that registration is moot and should be withdrawn — but if it is ever revived, this
     page needs those sentences back in their unbroken form. They are in git history at
     the commit that removed them. DO NOT re-add them to satisfy a review while the
```

### B. `client/public/terms.html`

```html
<!-- ⚠️ RULED 2026-08-19: PHONE SIGN-IN IS DEAD PRODUCT-WIDE, NOT SUPERSEDED ONLY ON iOS.
     An SMS section stood here, kept on purpose under a "do not delete, both rails are
     live" note. THAT NOTE IS SUPERSEDED AND IS NOT TO BE RESTORED. Supabase's phone
     provider is OFF (measured live, cache-busted, 2026-08-18), nobody has ever signed in
     on any rail, and client/src is frozen with the web client becoming a landing page —
     so Auth.jsx's signInWithOtp call cannot complete. The section did not describe a
     practice that had ended; it described one that CANNOT HAPPEN.

     ⚠️ WHAT WENT WITH IT, STATED SO IT IS NOT REDISCOVERED AS A LOSS: the consent-by-
     entry sentence, STOP/HELP, message frequency, rates and the do-not-sell pledge were
     the REQUIRED A2P 10DLC elements, each on one unbroken source line because carrier
     review is often automated against raw HTML (rejection code 805). The registration
     was IN VERIFICATION at Twilio; with the rail dead it is moot and should be
     withdrawn. If it is ever revived, the sentences are recoverable from git history at
     the commit that removed them — and note that this file's wording DIFFERED from
     privacy.html's deliberately. DO NOT re-add them to pass a review while the provider
     is off: that puts a false collection statement back on a live page.

     📎 The twin note is in privacy.html. If you change one, change both. -->
```
