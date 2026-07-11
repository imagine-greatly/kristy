# Kristy iOS — launch checklist

Everything needed to take `mobile/` from code to a submitted App Store build.
Grouped by system. Items marked **🔑 you** need your Apple / RevenueCat accounts —
they can't be done from the codebase.

Products (must match **exactly** across App Store Connect and RevenueCat):

| Plan    | Price   | Suggested product ID        | RevenueCat package |
| ------- | ------- | --------------------------- | ------------------ |
| Monthly | $8.99   | `kristy_monthly`            | `$rc_monthly`      |
| Annual  | $49.99  | `kristy_annual`             | `$rc_annual`       |

Bundle ID: **`com.kristyapproved.app`** (set in `app.config.js`; change there if you prefer another).

---

## A. Apple Developer (🔑 you)

1. Enrol in the Apple Developer Program ($99/yr) if you haven't.
2. Note your **Team ID** (Membership page) → put in `eas.json` → `submit.production.ios.appleTeamId`.
3. You do **not** need to hand-create certificates/profiles — EAS manages iOS
   credentials for you on first build (it'll ask to log in to your Apple account).

## B. App Store Connect — create the app (🔑 you)

1. **My Apps → +→ New App**
   - Platform: iOS
   - Name: **Kristy** (must be unique on the App Store; have a backup like
     "Kristy — Nutrition Coach" ready)
   - Primary language: English (U.S.)
   - Bundle ID: `com.kristyapproved.app` (register it under Certificates,
     Identifiers & Profiles first if the dropdown is empty)
   - SKU: `kristy-ios-001` (any unique string)
2. Copy the **Apple ID** (a number, e.g. `6480000000`) from App Information →
   put in `eas.json` → `submit.production.ios.ascAppId`.
3. Put your Apple account email in `eas.json` → `submit.production.ios.appleId`.

## C. In-App Purchases — App Store Connect (🔑 you)

Create **two auto-renewable subscriptions** in one **Subscription Group**
(e.g. group name "Kristy Coaching"):

1. **Monthly** — Reference name "Kristy Monthly", Product ID `kristy_monthly`,
   Duration 1 month, Price **$8.99**.
2. **Annual** — Reference name "Kristy Annual", Product ID `kristy_annual`,
   Duration 1 year, Price **$49.99**.

For each: add a localized display name + description, and one **subscription
review screenshot** (Apple requires it; a screenshot of the in-app upgrade sheet
is fine). Leave introductory offers off — the 7-day trial is a **server-side
promo** (granted at onboarding), not an Apple introductory offer, so new users
never need to purchase until it ends. Status will read "Ready to Submit"; they
get reviewed with your first build.

> ⚠️ Product IDs here **must** match RevenueCat and the table above exactly.

## D. RevenueCat (🔑 you)

1. Create a **Project** → add an **App** of type **App Store** with bundle id
   `com.kristyapproved.app`.
2. **App Store Connect API key**: in App Store Connect → Users and Access →
   Integrations → In-App Purchase, create a key and upload it to RevenueCat
   (lets RC read/validate purchases + receive App Store Server Notifications).
3. **Products**: add `kristy_monthly` and `kristy_annual` (import from App Store).
4. **Entitlement**: create one with identifier **`premium`** and attach both
   products. (This exact string is what the app checks — see
   `PREMIUM_ENTITLEMENT` in `src/lib/config.ts`.)
5. **Offering**: create the **current** offering (e.g. "default") with two
   packages — Annual (`$rc_annual` → `kristy_annual`) and Monthly (`$rc_monthly`
   → `kristy_monthly`). The upgrade screen reads `offerings.current`.
6. **API key**: Project → API keys → copy the **public** *Apple App Store* key
   (starts with `appl_`) → set as `EXPO_PUBLIC_REVENUECAT_IOS_KEY`.
7. **Webhook**: Project → Integrations → Webhooks →
   - URL: `https://<your-railway-domain>/api/revenuecat/webhook`
   - Authorization header: paste the **same** random string you set as
     `REVENUECAT_WEBHOOK_AUTH` on the server.
   - Send all subscription lifecycle events (default).

Result: an Apple purchase → RevenueCat webhook → upserts the shared
`subscriptions` row (`provider='apple'`) → the existing `isPremium()` gate
unlocks coaching for that user on **both** web and mobile.

## E. Server (already coded — you just configure)

1. Run **`supabase/push_tokens.sql`** in the Supabase SQL editor.
2. On Railway, add env var `REVENUECAT_WEBHOOK_AUTH` = the random string from D-7.
3. Redeploy the server (the new routes are already committed:
   `/api/revenuecat/webhook`, `/api/push/register`; push fires from insights + weekly).
4. Nothing else changes — CORS, the JSON parser, and every existing route are untouched.

## F. Push notifications / APNs (🔑 you, via EAS)

Expo push requires an APNs key so Apple will deliver notifications:

```bash
eas credentials       # → iOS → Push Notifications → set up a Push Key (EAS creates/uploads the APNs key)
```

EAS uploads the APNs key to Expo's push service automatically; no manual token
handling. The device registers its Expo push token on sign-in (`registerPushToken`).

## G. Build & submit with EAS

```bash
# One-time project link (writes EAS project id into app.config extra)
eas init

# Dev client (to test purchases / camera / push on a real device)
eas build --profile development --platform ios

# Production build for the App Store
eas build --profile production --platform ios

# Upload the finished build to App Store Connect
eas submit --profile production --platform ios --latest
```

What EAS/Apple will prompt you for the first time:
- Apple account login (App Store Connect) — for credentials + submission
- Permission for EAS to create the App ID, distribution certificate, and
  provisioning profile (say yes; EAS stores them)
- The APNs key setup (step F) if not already done

## H. App Store listing (🔑 you)

**Suggested ASO copy:**
- **Title (30 char max):** `Kristy: AI Nutrition Coach`
- **Subtitle (30 char max):** `Track macros by texting`
- **Keywords (100 char):** `nutrition,macro,calorie,coach,AI,protein,diet,tracker,weight,food log,fitness,TDEE`
- **Promotional text:** "A nutrition coach in your pocket that actually knows
  you — log meals by texting, and get coaching that adapts as your weight moves."

**Screenshots required** (6.7" iPhone — 1290×2796, and 6.5" — 1284×2778; 5.5" optional):
1. Chat with a logged meal + macro card
2. The Today panel (rings + weight trend)
3. Onboarding (a question screen)
4. The upgrade / coach sheet
5. (optional) barcode scan or photo logging

Also required: an **App Privacy** section, **Support URL**, **Privacy Policy URL**
(you already host `client/public/privacy.html` and `terms.html` — reuse those
URLs), a **category** (Health & Fitness), and an **age rating** questionnaire.

## I. App Privacy questionnaire — accurate answers

Kristy collects **Health & Fitness** data. Answer truthfully:

| Data type | Collected? | Linked to identity? | Used for tracking? | Purpose |
| --- | --- | --- | --- | --- |
| Health & Fitness (nutrition, body weight) | **Yes** | Yes (tied to the user's account) | **No** | App Functionality |
| Contact Info — Phone Number | **Yes** (sign-in via SMS OTP) | Yes | No | App Functionality, Authentication |
| User Content — Photos (meal photos) | **Yes** | Yes | No | App Functionality (macro estimation) |
| Identifiers — User ID | **Yes** | Yes | No | App Functionality |
| Purchases | **Yes** (via Apple/RevenueCat) | Yes | No | App Functionality |
| Usage/Diagnostics | Only if you add analytics | — | — | — |

Notes for the reviewer / your own record:
- **No third-party advertising or tracking.** "Used for tracking" = No everywhere.
- Meal **photos** are sent to the server for AI macro estimation and are **not
  stored** (they're processed in-memory by `/api/photo` and discarded).
- Health data (nutrition + weight) is stored per-user in Supabase under RLS and
  is **deletable in-app** (Settings → Delete my account wipes every row + the
  auth user). That satisfies the App Store's account-deletion requirement.
- Because you use SMS OTP + store health data, make sure your Privacy Policy URL
  mentions phone number, nutrition/weight data, and deletion.

## J. Pre-submit sanity pass

- [ ] `npm run typecheck` clean
- [ ] Real-device dev build: sign in (SMS), onboard, log a meal, scan a barcode,
      snap a photo, open Today panel, purchase a sub (sandbox), restore, delete account
- [ ] Sandbox Apple ID purchase flips `/api/subscription` to premium (webhook works)
- [ ] Push received when a weekly summary is generated (trigger
      `POST /api/weekly-summary` with the cron secret to test)
- [ ] Privacy Policy + Support URLs live
- [ ] Screenshots uploaded, IAPs "Ready to Submit", build attached

---

## Blocked on your accounts (summary)

These are the only things I can't do from code — they need credentials you own:

1. **Apple Developer**: Team ID, App ID registration, app creation in App Store
   Connect, the two IAP products, screenshots, privacy questionnaire, submission.
2. **RevenueCat**: project/app creation, App Store Connect API key upload,
   entitlement (`premium`) + offering + packages, the public `appl_` API key,
   and the webhook (URL + Authorization value).
3. **Railway**: add `REVENUECAT_WEBHOOK_AUTH`, redeploy.
4. **Supabase**: run `supabase/push_tokens.sql`.
5. **EAS/Expo**: `eas init`, APNs push key, builds, submission.

Fill the resulting values into `.env` (`EXPO_PUBLIC_REVENUECAT_IOS_KEY`) and
`eas.json` (`appleId`, `ascAppId`, `appleTeamId`), then run the EAS commands in G.
