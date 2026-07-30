# Kristy Approved — Privacy Policy & Terms of Service

## ⚠️ THIS IS A STARTING DRAFT. IT IS NOT LEGAL ADVICE. DO NOT PUBLISH AS-IS.

This document was assembled by reading the Kristy codebase and describing what it
actually does with data. It is a **working draft for a qualified lawyer or a legal
review service to revise**, not a finished policy, and it has not been reviewed by
anyone qualified to give legal advice.

**Before this goes live, a lawyer must:**

1. Resolve every ⚖️ flag in the text below (there are 30, indexed in Part 3).
2. Decide the jurisdiction questions in Part 3 — GDPR and CCPA/CPRA applicability are
   **business decisions about where you operate and market**, not facts that can be read
   out of source code.
3. Fill every `[[PLACEHOLDER]]` (legal entity, address, contact, governing law, dates).
4. Confirm the factual descriptions still match the product on the day you publish.
   Code changes; this document does not change with it.

**Three things in this draft differ from the brief that requested it. Read these first:**

| Brief said | Code actually does |
| --- | --- |
| SMS OTP via **Twilio** | **Bird** (formerly MessageBird), via a custom Supabase Send-SMS hook. Twilio is not a dependency anywhere in the repo. Supabase mints and verifies the code; Bird only carries the digits. |
| (not mentioned) | **Vercel Web Analytics** is installed and live in the web client (`@vercel/analytics`), sending pageviews plus ~14 custom product events. It is a data practice that must be disclosed. |
| (not mentioned) | **Open Food Facts** — every barcode scanned is sent to a public third-party API (`world.openfoodfacts.org`). That is a disclosure to an independent third party, not a processor acting on your instructions. |

Also note: a **counter-gap log** was added on 2026-07-30. It records the normalized text
of counter questions the knowledge base answered poorly, with no user identifier. It is
described in §3.7 and is a genuine new collection, though a deliberately anonymous one.

---
---

# PART 1 — PRIVACY POLICY (DRAFT)

**Effective date:** `[[DATE]]`
**Last updated:** `[[DATE]]`

`[[LEGAL ENTITY NAME]]` (“we”, “us”) operates Kristy Approved, a grocery-coaching app
(the “Service”). This policy explains what we collect, why, who we share it with, and
what you can do about it.

> ⚖️ **FLAG 1 — Entity and contact.** Insert the legal entity, its registered address,
> and a working privacy contact address. Several laws require a physical address and a
> designated contact; a personal Gmail address is generally not sufficient for a
> commercial service.

---

## 1. The short version

- We ask for a **phone number** so you can sign in. That is the only identifier we
  require.
- If you choose to, you can tell us **how you want to eat** — your goals, dietary
  focuses, and hard-line restrictions. We use this to personalize what Kristy tells you.
  **Some of this may be treated as health-related information under the law**, so we
  handle it with extra care and never sell it. See §4.
- We record **what you scan, ask, and put on your list**, so the app can do its job.
- **Your individual grocery behavior is yours.** It is used to personalize your own
  experience and is never pooled into a shared dataset.
- We *do* pool **anonymous, product-level and question-level information** — which
  products exist, which questions the app failed to answer — to make the product better
  for everyone. These records carry no user identifier. See §3.6 and §3.7.
- We **never see your card number.** Payments run through Stripe.
- You can **delete your account and all of your data** from inside the app, at any time.

---

## 2. Information you give us

### 2.1 Phone number (required to sign in)

We use phone-number sign-in with a one-time code (OTP). Your number is stored by our
authentication provider, Supabase, and is used to identify your account and to send you
sign-in codes.

The code is generated and verified by Supabase. Delivery is handled by **Bird** (formerly
MessageBird): we pass Bird your phone number and the code so the message can be sent. We
do not use your number for marketing.

> ⚖️ **FLAG 2 — SMS consent and A2P compliance.** US SMS is regulated (TCPA, carrier 10DLC
> registration). Confirm with counsel: (a) the sign-in screen captures adequate consent
> and discloses that message/data rates apply; (b) 10DLC brand and campaign registration
> is complete before any live traffic; (c) whether HELP/STOP handling is required for
> transactional OTP traffic. `CLAUDE.md` records that 10DLC registration was still
> outstanding as of this draft.

> ⚖️ **FLAG 3 — Bird as a sub-processor.** Confirm a signed DPA with Bird, its data
> location, and its retention period for message content (the OTP code is a live
> credential in transit).

### 2.2 Your goals, dietary focuses, and hard-line restrictions (optional)

During onboarding — and any time afterwards in Settings or by telling Kristy in chat —
you can set:

- a **coaching goal** or goals (e.g. eating more whole foods);
- **dietary focuses** (e.g. watching sodium, watching added sugar);
- **hard-line restrictions / non-negotiables** (e.g. no seed oils, no pork);
- **practical constraints** (e.g. budget-conscious, short on time, cooking for one, no
  kitchen).

We use these only to personalize what the app shows *you*: which concerns get emphasized
on a product, how your list is shaped, and how a counter answer is framed.

**We do not infer anything about your health from them.** These are preferences you turn
on about yourself. Kristy is a shopping coach, not a medical service: the app is built so
that no food is ever described as treating, curing, preventing, or causing any disease or
condition, in either direction.

> ⚖️ **FLAG 4 — THIS IS THE MOST IMPORTANT FLAG IN THE DOCUMENT. Sensitive / special
> category data.** Dietary restrictions and health-adjacent goals can reveal or imply
> health status, and in some cases religious belief (e.g. halal, kosher) — both of which
> are **special category data under GDPR Article 9** and **“sensitive personal information”
> under CCPA/CPRA**. This is true even though you never ask a medical question and never
> make a health claim: the law looks at what the data *reveals*, not at what you intend.
>
> If GDPR applies, Article 9 processing generally requires **explicit consent** — a
> separate, affirmative, unbundled opt-in, not acceptance of a general privacy policy.
> If CPRA applies, sensitive personal information carries a **right to limit its use and
> disclosure**, which usually means a “Limit the Use of My Sensitive Personal Information”
> control.
>
> Counsel must decide: (a) whether these fields are in scope; (b) what consent UI is
> required and where it goes; (c) whether the onboarding flow needs restructuring to
> capture it. **This may require a product change, not just a policy paragraph.** It is
> the single item most likely to affect the build.

### 2.3 Optional profile details

If you choose to provide them, we store name, age, sex, height, weight, sport, training
frequency, and eating pattern. These are used to tailor coaching.

> ⚖️ **FLAG 5 — Age and children.** The app collects age. Decide and document the minimum
> age for an account. If anyone under 13 can register, **COPPA** applies in the US
> (verifiable parental consent, among other duties); under 16 raises **GDPR Article 8**
> issues in the EU/UK. The cleanest answer is usually a hard 13+ (or 16+) gate at signup,
> enforced in the UI. There is currently no age gate in the code.

> ⚖️ **FLAG 6 — Weight, height and body metrics** are health data in several regimes even
> though they are self-reported and used only for calorie math. Confirm they fall under
> the same treatment as §2.2.

### 2.4 Things you type

Messages you send Kristy in chat are stored so the conversation persists across devices.

---

## 3. Information created as you use the Service

### 3.1 Scans

When you scan a barcode, we send that barcode to **Open Food Facts**, a public
third-party food database, to look up the product's ingredients.

> ⚖️ **FLAG 7 — Open Food Facts is a third-party disclosure, not a processor.** It is an
> independent public database operating under its own terms, not a vendor processing data
> on our instructions. The barcode alone is not personal information, and we send no user
> identifier with it — but counsel should confirm how this is characterized and whether
> it needs to appear in the disclosure table in §6.

### 3.2 Label photos

If a barcode is not found, you can photograph the ingredients panel. **That image is sent
to Anthropic** to transcribe the printed text. We use the transcription; we do not retain
the photograph.

> ⚖️ **FLAG 8 — Image handling and Anthropic's terms.** Confirm in writing: Anthropic's
> retention period for submitted images and prompts, whether the commercial terms exclude
> training on your data, and whether zero-retention is available and enabled. Confirm the
> statement “we do not retain the photograph” is accurate end to end, including any
> transient storage in the upload middleware and any request logging at Railway.

### 3.3 Your Haul (scan history)

Each scan you make while signed in is recorded to your account — product, brand, verdict
tier, barcode, timestamp — so the app can show your trip and week back to you.

### 3.4 Your List

Your shopping list is stored on our servers so it survives a device change.

### 3.5 Your list patterns (private to you)

The app remembers what you keep buying, what you take off your list, and which suggested
swaps you decline. This is what lets it nudge from where you actually are instead of from
a blank ideal, and lets it stop offering you something you already said no to.

**This is stored against your account, used only to personalize your own experience, and
never contributes to any shared or aggregated dataset.** It holds grocery names only — no
judgments, no health inferences. It is deleted when you delete your account.

### 3.6 Product catalog (anonymous, pooled)

When a scan resolves, we keep the **product's** details — name, brand, barcode,
ingredient text, and where the reading came from. This is how coverage improves: a
product no barcode database knows about gets photographed once, and from then on it
resolves for everyone.

**These records are about products, not people. They carry no user identifier**, and
there is no way to trace one back to who scanned it. Because these records are not
personal information, they are not removed when an individual account is deleted — there
is nothing personal in them to remove.

### 3.7 Counter-question gaps (anonymous, pooled)

When you ask a question about the unpackaged part of the store (the butcher, the fish
counter, produce, bulk) and our knowledge base has no good answer, we log **the question
topic** so we know what to write next.

What is stored: the question text, lowercased and stripped of punctuation, capped in
length, with email addresses and long digit sequences removed before storage; whether
anything matched; and a timestamp. **No user identifier, no IP address, no session
identifier is stored with it**, and the record cannot be linked back to you or to your
account.

> ⚖️ **FLAG 9 — Free-text anonymization.** This is designed to be anonymous and is
> structurally enforced, but free text typed by a user can always contain something
> unexpected. Counsel should assess: (a) whether the scrubbing (emails, 5+ digit runs,
> 160-char cap, punctuation stripping) is sufficient for the standard you must meet —
> note that **GDPR's bar for true “anonymous” data is high**, and pseudonymous data
> remains personal data; (b) whether a retention limit or periodic aggregation should be
> applied; (c) whether this belongs in a “we may retain de-identified data” clause
> instead. If it is judged pseudonymous rather than anonymous, it must be added to the
> deletion path.

### 3.8 Technical and usage data

- **IP address**, used transiently to rate-limit anonymous use and prevent abuse.
- **Web analytics.** The web app uses **Vercel Web Analytics**, which records pageviews
  and a set of product events (for example: that a scan happened and its mode; that a
  verdict was produced and its tier; that onboarding completed; that a counter topic was
  opened, and which one).

> ⚖️ **FLAG 10 — Analytics: cookie consent and CCPA “sale/share”.** Two questions.
> (a) **Cookie/ePrivacy:** Vercel Web Analytics is marketed as cookieless, but the EU
> ePrivacy rules cover any storage of or access to information on a device, and several
> regulators read that broadly. Decide whether a consent banner is required for EU/UK
> visitors and whether analytics must be gated behind it.
> (b) **CCPA/CPRA:** determine whether any analytics constitutes a “sale” or “share”. If
> so, a **“Do Not Sell or Share My Personal Information”** link is mandatory.
> Note the `perimeter-entry` event includes the topic identifier viewed, which can reveal
> health-adjacent interest — assess whether that raises the sensitivity of the event
> stream.

> ⚖️ **FLAG 11 — Server logs.** Confirm what Railway and Vercel retain in request logs (IP
> addresses, URLs, headers), for how long, and whether that needs disclosing here. Note
> that the internal growth dashboard accepts its access token as a URL query parameter,
> which means that token can appear in server logs — an operational security matter, not
> a user-privacy one, but worth raising.

### 3.9 Push notifications (mobile)

If you enable notifications, we store a device push token so we can send them.

---

## 4. Sensitive information — how we handle it

Some of what you may tell us — dietary restrictions, health-adjacent goals, weight —
could be considered sensitive or health-related information under some laws.

- We collect it **only if you choose to provide it**. The Service works without it.
- We use it **only** to personalize what the app shows you.
- We **never sell it**, and we never use it for advertising.
- It is **never pooled** into the shared, anonymous datasets described in §3.6 and §3.7.
  Those datasets are kept separate by design, and that separation is enforced in code and
  covered by automated tests.
- It is deleted when you delete your account.
- **We do not make medical claims and the Service is not medical advice.** See the Terms,
  §T4.

> ⚖️ **FLAG 12 — Verify each of these five promises before publishing.** They are drafted
> from the current implementation and they are enforceable claims. If any becomes untrue
> later, this section becomes a misrepresentation. In the US, an inaccurate privacy
> statement is an FTC Act §5 deceptive-practice exposure independent of any privacy
> statute.

---

## 5. Why we process your information (legal bases)

> ⚖️ **FLAG 13 — GDPR legal bases.** This table is only required if GDPR/UK GDPR applies
> (see Part 3). If it does, counsel must confirm each basis. The mapping below is a
> starting suggestion, not a determination.

| What | Why | Suggested basis (GDPR) |
| --- | --- | --- |
| Phone number | To create your account and sign you in | Contract |
| Goals, focuses, restrictions | To personalize coaching | **Explicit consent** (Art. 9) — see Flag 4 |
| Scans, list, haul | To provide the core features | Contract |
| Chat messages | To keep your conversation | Contract |
| Payment status | To give you what you paid for | Contract |
| Anonymous product/question data | To improve the Service | Legitimate interests, if the data is truly anonymous |
| IP rate-limiting | To prevent abuse | Legitimate interests |
| Analytics | To understand product usage | Consent or legitimate interests — see Flag 10 |

---

## 6. Who we share information with

We do not sell your personal information. We share it with service providers who process
it on our behalf, under contract:

| Provider | What it handles | Where it sits |
| --- | --- | --- |
| **Supabase** | Database and authentication — your account, phone number, goals, list, haul, chat | `[[REGION]]` |
| **Railway** | Application server — processes requests in transit | `[[REGION]]` |
| **Vercel** | Web hosting and web analytics | `[[REGION]]` |
| **Anthropic** | AI processing of your questions, coaching text, and label photos | `[[REGION]]` |
| **Bird** | SMS delivery of sign-in codes | `[[REGION]]` |
| **Stripe** | Payment processing (web) | `[[REGION]]` |
| **Apple / RevenueCat** | In-app purchases and subscription status (iOS) | `[[REGION]]` |
| **Expo** | Push notification delivery (mobile) | `[[REGION]]` |
| **Open Food Facts** | Public product lookup — receives a barcode, no user identifier | Third party, see Flag 7 |

We may also disclose information if legally required, or in connection with a merger or
acquisition.

> ⚖️ **FLAG 14 — Signed DPAs.** Confirm an executed Data Processing Agreement with every
> processor above. Several offer them only on request or only on paid plans.

> ⚖️ **FLAG 15 — Sub-processor list and change notice.** Decide whether to publish a
> sub-processor list and commit to notifying users of changes. Business customers and
> some regulators expect this.

> ⚖️ **FLAG 16 — Data residency and international transfers.** Fill in every `[[REGION]]`.
> If any EU/UK personal data leaves that region, you need a transfer mechanism —
> **Standard Contractual Clauses**, the **EU-US Data Privacy Framework**, or equivalent —
> plus a transfer impact assessment. This cannot be answered from the code; it depends on
> which regions you provisioned.

> ⚖️ **FLAG 17 — AI processing disclosure.** Some regimes and app-store rules expect
> explicit disclosure that user content is sent to a third-party AI provider. Confirm the
> wording is sufficient, and confirm whether your Anthropic terms permit training on
> submitted content (see Flag 8).

---

## 7. How long we keep it

| Data | Retention |
| --- | --- |
| Account, profile, goals | Until you delete your account |
| List, haul, chat history | Until you delete your account |
| Anonymous product records | Indefinitely — no personal information |
| Anonymous counter-gap records | Indefinitely — no personal information (see Flag 9) |
| Payment records | As required by tax and accounting law — `[[PERIOD]]` |
| Server logs | `[[PERIOD]]` |
| Analytics | Per Vercel's retention — `[[PERIOD]]` |

> ⚖️ **FLAG 18 — Retention periods are currently undefined in the system.** Personal data
> is kept until account deletion and no automatic expiry exists. GDPR requires storage
> limitation — data kept no longer than necessary. Counsel should set concrete periods
> (including for inactive accounts), and those periods then need implementing; today
> nothing enforces them.

---

## 8. Your rights and choices

**Everyone, regardless of location:**

- **Delete everything.** Settings → Delete Account permanently removes your account and
  all data held against it: profile, goals, list and list patterns, haul, chat history,
  weight logs, verdicts, subscription record, and push tokens. It is immediate and
  irreversible. The anonymous product and question records described in §3.6 and §3.7 are
  not affected, because they contain nothing personal.
- **Change your preferences** at any time in Settings.
- **Stop notifications** in your device settings.

**If you are in the EEA, UK, or Switzerland** (if GDPR applies — see Flag 19): rights of
access, rectification, erasure, restriction, portability, objection, withdrawal of
consent, and complaint to your supervisory authority.

**If you are a California resident** (if CCPA/CPRA applies — see Flag 20): rights to know,
delete, correct, opt out of sale/sharing, limit use of sensitive personal information, and
non-discrimination for exercising them.

To exercise any right, contact `[[PRIVACY CONTACT]]`.

> ⚖️ **FLAG 19 — Access and portability are not built.** Deletion is implemented and
> works. **There is no data-access or data-export feature.** If GDPR or CCPA applies, you
> must be able to provide a copy of a user's data on request, within a statutory deadline
> (GDPR: one month; CCPA: 45 days). Right now that would have to be done by hand against
> the database. Counsel should confirm the requirement; **engineering should expect to
> build an export.** There is also no correction/rectification flow beyond editing
> preferences in Settings.

> ⚖️ **FLAG 20 — Identity verification for rights requests.** You must verify that someone
> requesting data is who they claim to be, and phone-based identity makes this
> non-trivial. Define and document the process.

> ⚖️ **FLAG 21 — Response process and deadlines.** Designate who monitors the privacy
> contact address and define an internal workflow that meets the statutory clocks. An
> unmonitored address is itself a compliance failure.

---

## 9. Security

Your data sits in Supabase with row-level security, so one account cannot read another's.
Payment card details never reach our servers. Access to production data is limited to
`[[WHO]]`.

> ⚖️ **FLAG 22 — Do not overstate security.** Keep this factual and modest; overclaiming
> is a common enforcement trigger. Confirm the row-level-security description is accurate
> for every table before publishing.

> ⚖️ **FLAG 23 — Breach notification.** Add the required commitments and build an internal
> incident-response plan. GDPR requires notifying a supervisory authority within 72 hours;
> US state laws vary. This is a process obligation, not a paragraph.

---

## 10. Changes to this policy

We will post changes here and update the “last updated” date. Material changes will be
notified in-app or by SMS.

> ⚖️ **FLAG 24 — Retroactive changes.** If a change materially expands how existing data is
> used, fresh consent may be required rather than notice. Confirm the mechanism.

---
---

# PART 2 — TERMS OF SERVICE (DRAFT)

**Effective date:** `[[DATE]]`

## T1. Agreement

By using Kristy Approved you agree to these Terms. If you do not agree, do not use it.

## T2. Who can use it

You must be at least `[[AGE]]` years old. See Flag 5.

## T3. Your account

You sign in with your phone number. Keep access to that number secure; you are
responsible for activity on your account. Tell us at `[[CONTACT]]` if you believe someone
else has access.

## T4. What Kristy is — and is not

**Kristy Approved is a grocery-shopping coach. It is not a medical service, and nothing
it tells you is medical advice.**

- It does not diagnose, treat, cure, or prevent any disease or condition.
- It is not a substitute for a doctor, dietitian, or other qualified professional.
- **Always consult a qualified professional before making decisions about your diet,
  especially if you have a medical condition, are pregnant, or take medication.**
- Ingredient information comes from public databases, from reading product labels, and
  from our own knowledge base. **It can be wrong, incomplete, or out of date.** Product
  formulations change. **If you have a food allergy or intolerance, always read the
  physical label. Do not rely on this app for allergen safety.**

> ⚖️ **FLAG 25 — This is the single most important clause in the Terms.** A food app that
> speaks to people with dietary restrictions carries real product-liability exposure, and
> the allergen disclaimer especially must be drafted by counsel, not adapted from a
> template. Consider whether it also needs to appear in-product — at onboarding and near
> allergen-relevant output — rather than only in the Terms, since a disclaimer buried in
> terms nobody reads is weak protection. Confirm that the app's own “gluten-free” and
> “dairy-free” handling (documented as advisory only, because the knowledge base holds no
> such data) is described accurately here.

> ⚖️ **FLAG 26 — Claims about the product.** The app presents graded verdicts and a
> “Kristy Approved” seal. Confirm with counsel that the tier language, the seal, and any
> marketing around them do not constitute health claims or unfair/deceptive advertising —
> and that describing named products by their ingredients is defensible. The codebase
> deliberately avoids negative claims about named brands; that decision should be
> preserved and understood as a legal posture, not only an editorial one.

## T5. Subscriptions and payment

The Service has a free tier. Paid membership unlocks personalized notes, focus-aware
carts, haul reads, and conversational cart edits.

- **Pricing:** `[[$7.99]]`/month or `[[$59.99]]`/year.
- **Free trial:** `[[7]]` days, started explicitly by you.
- **Renewal:** subscriptions renew automatically until cancelled.
- **Cancellation:** cancel any time; access continues to the end of the paid period.
- **Web payments** are processed by Stripe. **iOS purchases** are processed by Apple and
  governed additionally by Apple's terms; cancel through your Apple ID settings.
- **Refunds:** `[[POLICY]]`.

> ⚖️ **FLAG 27 — Auto-renewal law.** US automatic-renewal statutes (notably California's
> ARL, and now the FTC's negative-option rule) impose specific requirements on disclosure
> before purchase, affirmative consent, renewal reminders, and an easy cancellation path.
> EU consumer law adds a 14-day withdrawal right for digital services with its own
> waiver mechanics. Both may require **UI changes, not just terms**. Confirm pricing
> figures against what is actually live before publishing — repo documentation currently
> carries stale prices in at least one place.

## T6. Acceptable use

Do not misuse the Service: no reverse engineering, no scraping, no automated access, no
attempts to break the rate limits or reach other users' data, no reselling access, no
uploading anything unlawful.

## T7. Our content

The knowledge bases, Kristy's voice and writing, the brand, and the software are ours and
are protected by intellectual property law. You may use the Service; you do not get a
licence to its content.

> ⚖️ **FLAG 28 — Third-party data licensing.** Open Food Facts publishes its data under
> the **Open Database License (ODbL)**, which carries attribution and share-alike
> conditions that can extend to derived databases. The app stores ingredient text
> obtained from Open Food Facts in its own product catalog. **Counsel must assess whether
> that catalog is a derived database under ODbL, what attribution is required, and where
> it must appear.** This is a real and easily-missed obligation.

## T8. Your content

You keep ownership of what you enter. You grant us a licence to use it to operate the
Service. You also agree we may use **anonymous, aggregated** information — which cannot
identify you — to improve the Service, as described in the Privacy Policy.

## T9. Disclaimers and liability

`[[STANDARD "AS IS" DISCLAIMER AND LIABILITY CAP — TO BE DRAFTED BY COUNSEL]]`

> ⚖️ **FLAG 29 — Do not copy a liability cap from another app.** Enforceability varies by
> jurisdiction, consumer-protection law limits what can be excluded, and the health-
> adjacent context matters. Counsel drafts this from scratch.

## T10. Termination

You may stop using the Service and delete your account at any time. We may suspend or
terminate accounts that breach these Terms.

## T11. Governing law and disputes

`[[GOVERNING LAW]]`. `[[DISPUTE RESOLUTION]]`.

> ⚖️ **FLAG 30 — Arbitration and class-action waiver.** Decide whether to include them.
> They have real advantages and real drawbacks, face varying enforceability, and require
> specific formatting and opt-out mechanics to stand up. A decision for counsel, not a
> default.

## T12. Changes

We may update these Terms and will post the new version with an updated date. Continued
use means acceptance.

## T13. Contact

`[[CONTACT]]`

---
---

# PART 3 — REVIEWER'S CHECKLIST

## A. Jurisdiction decisions you must make first

Everything else depends on these. **They are business decisions about where you operate
and market, not questions the code can answer.**

| # | Question | Why it matters |
| --- | --- | --- |
| J1 | **Do you offer the Service to people in the EEA/UK?** | Triggers GDPR/UK GDPR in full: legal bases, explicit consent for health data (Flag 4), DSR workflows including **access/export, which is not built** (Flag 19), 72-hour breach notice, transfer mechanisms (Flag 16), and possibly an **Article 27 EU/UK representative** if you have no establishment there. |
| J2 | **Do you meet a CCPA/CPRA threshold?** | Applies to for-profit businesses doing business in California that meet one of: >$25M annual revenue; buying/selling/sharing personal information of 100,000+ consumers or households; or ≥50% of revenue from selling/sharing personal information. **A pre-launch app likely meets none** — but confirm, and re-check as you grow. |
| J3 | **Other US state laws?** | Virginia, Colorado, Connecticut, Utah, Texas, Oregon, Montana and others now have comprehensive laws with their own thresholds. Several treat health data as sensitive and require opt-in consent. |
| J4 | **Washington My Health My Data Act (and Nevada SB 370)?** | **Flagged specifically because it is unusually broad and unusually dangerous.** It defines “consumer health data” expansively — plausibly covering dietary restrictions and health goals — has a **low applicability threshold with no revenue floor**, requires a separate consumer-health-data privacy policy and opt-in consent, and carries a **private right of action**. If you serve Washington residents, this may bind you well before CCPA does. |
| J5 | **Will you launch on the Apple App Store?** | Apple requires accurate Privacy Nutrition Labels, an in-app account-deletion path (you have one), and its own disclosures for health-adjacent apps. Google Play has parallel requirements. |
| J6 | **Will you have business/enterprise customers?** | Drives sub-processor transparency and DPA obligations (Flags 14–15). |

## B. Work that is not drafting

These need engineering or process, not policy text:

| Item | Status | Flag |
| --- | --- | --- |
| Explicit-consent UI for health-adjacent preferences | Not built | 4 |
| Age gate at signup | Not built | 5 |
| Data access / export feature | **Not built** — deletion exists, export does not | 19 |
| Correction/rectification flow | Partial (Settings editing only) | 19 |
| Retention limits and automatic expiry | Not built; data kept until deletion | 18 |
| Cookie/consent banner for EU visitors | Not built | 10 |
| “Do Not Sell or Share” link | Not built; may not be required | 10 |
| “Limit Use of My Sensitive Personal Information” control | Not built; may be required | 4 |
| Auto-renewal disclosure and cancellation UI | Verify against ARL / FTC rule | 27 |
| Signed DPAs with all nine providers | Unknown | 14 |
| Identity verification for rights requests | Not defined | 20 |
| Monitored privacy contact address and DSR workflow | Not defined | 21 |
| Incident-response plan | Not defined | 23 |
| Open Food Facts ODbL attribution | Not present | 28 |
| 10DLC brand/campaign registration | Outstanding per `CLAUDE.md` | 2 |

## C. What is already in good shape

Worth telling your reviewer, because it is unusual and it reduces the work:

- **Account deletion is implemented and complete.** `DELETE /api/account` clears every
  table keyed to the user, and an automated test parses the database migrations and fails
  the build if any user-keyed table is missing from that sweep — so it cannot silently
  drift out of date as the schema grows.
- **The individual/aggregate separation is structural, not aspirational.** The two pooled
  datasets carry no user identifier by construction; tests forbid the columns, forbid the
  pooled writers from importing any per-user reader, and forbid the internal dashboard
  from touching per-user data.
- **The payment path never touches card data.** Stripe and Apple handle it.
- **The internal analytics dashboard is aggregate-only and off by default**, returning 404
  unless explicitly enabled with a 24+ character token.
- **The app is built not to make medical claims**, enforced by prompt-level rules and
  automated tests rather than by editorial discipline alone — which materially supports
  the position taken in §T4.

## D. Verify before publishing

Every factual statement here was read out of the codebase on **2026-07-30**. Re-confirm
before you publish, particularly:

- The processor list in §6 (a new vendor is the easiest thing to forget).
- The deletion scope in §8.
- That §4's five promises still hold.
- Pricing and trial length in §T5.
- That the counter-gap scrubbing in §3.7 still matches the implementation.
