# Kristy — iOS app (Expo / React Native)

A native iOS port of the web client (`../client`). **Same backend** (Railway API),
**same Supabase project**, **same subscription state**. The server does not know or
care whether a client is web or mobile — every API contract is identical. Purchases
go through **RevenueCat** (Apple IAP), never Stripe.

> Brand note: this port follows the *real* web tokens — **Inter** (UI) + **DM Mono**
> (numbers) + **Georgia** (serif wordmark), palette `#0B1F0F / #122718 / #C9A84C /
> #F0E6C8 / #4A9B6F / #6BBF8E`. (The original build brief mentioned "Playfair
> Display" and a `#040805` void; neither exists in the web app, so they weren't
> used. Swap in Playfair via `@expo-google-fonts/playfair-display` if you want it.)

---

## Prerequisites

- Node 18+ and the Expo tooling (`npm i -g eas-cli` for builds)
- An Apple Developer account (for device builds + App Store)
- A RevenueCat account (for IAP)
- A **Mac is _not_ required** — EAS builds iOS in the cloud

## 1. Install

```bash
cd mobile
npm install
npx expo install --fix   # reconcile native module versions to the Expo SDK
```

## 2. Configure env

Copy `.env.example` → `.env` and fill in (these mirror the web client's Supabase
values exactly; the API URL is your Railway server):

```
EXPO_PUBLIC_API_URL=https://your-kristy-api.up.railway.app
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxxxxx
```

For device dev on your LAN, set `EXPO_PUBLIC_API_URL` to your machine's LAN IP
(e.g. `http://192.168.1.20:3001`), not `localhost`.

## 3. Run

```bash
npm run start          # Expo dev server
```

> **Important:** `react-native-purchases`, `expo-camera`, and `expo-notifications`
> need a **native build** (a dev/prod build), **not Expo Go**. Chat/auth/onboarding
> work in Expo Go, but to exercise purchases, the barcode scanner, and push you need
> a dev client:
> ```bash
> eas build --profile development --platform ios
> ```

## 4. Database (one-time)

Run **`../supabase/push_tokens.sql`** in the Supabase SQL editor (adds the
`push_tokens` table + RLS). Everything else already exists from the web build.

## 5. Server (one-time)

The server changes are already in `../server` (additive only):
- `POST /api/push/register` — stores a device's Expo push token
- `POST /api/revenuecat/webhook` — maps Apple IAP events into the existing
  `subscriptions` table (`provider='apple'`)
- Push sender (`server/lib/push.js`) fires on proactive insights + the Sunday summary

Add one env var on Railway:
```
REVENUECAT_WEBHOOK_AUTH=<a long random string>   # paste the same value into RevenueCat's webhook Authorization header
```

See **`docs/LAUNCH_CHECKLIST.md`** for the full RevenueCat + App Store Connect +
EAS walkthrough and everything blocked on your Apple / RevenueCat accounts.

---

## Project structure

```
mobile/
  app.config.js          Expo config (bundle id, icons, splash, iOS privacy strings, plugins)
  eas.json               EAS build/submit profiles
  app/                   expo-router routes
    _layout.tsx          fonts + providers + Stack (modals for settings/upgrade/scanner)
    index.tsx            entry gate (config screen / loader; redirects by auth+onboarding)
    auth.tsx             phone + SMS OTP sign-in
    onboarding.tsx       quick + full TDEE onboarding
    chat.tsx             core chat screen (inverted FlatList, sidebar overlay, composer)
    settings.tsx         goal/unit/sport, membership, account deletion (modal)
    upgrade.tsx          RevenueCat purchase sheet + restore (transparent modal)
    scanner.tsx          expo-camera barcode scanner (full-screen modal)
  src/
    theme/               colors + typography (ported 1:1 from the web :root)
    lib/
      config.ts          env
      supabase.ts        RN Supabase client (AsyncStorage, AppState refresh)
      api.ts             chat / weight / account / subscription (contracts identical to web)
      logging.ts         barcode + photo (RN multipart upload)
      data.ts            Supabase reads/writes (profile, goals, meals, messages, weight)
      format.ts          number/date helpers (verbatim from web)
      dayBoundary.ts     new-day recap (localStorage → AsyncStorage)
      weightChart.ts     pure chart geometry (verbatim from web)
      onboardingSteps.ts step machine + payload (verbatim from web)
      purchases.ts       RevenueCat wrapper
      notifications.ts   Expo push registration
      haptics.ts         expo-haptics on send / macro-card land
      types.ts           shared domain types
    context/
      AppProvider.tsx    single source of truth — a faithful port of the web App.jsx
    components/          MacroRing, MacroCard, MessageBubble, TypingIndicator,
                         InputBar, EmptyState, Sidebar, WeightTrendChart, SignInForm,
                         TopBar, Icons
  scripts/generate-assets.py   regenerates the gold-K icon/splash/notification PNGs
  assets/                icon.png, adaptive-icon.png, splash.png, notification-icon.png
```

## Scripts

```bash
npm run start       # expo start
npm run ios         # expo start --ios
npm run typecheck   # tsc --noEmit
npm run fix         # expo install --fix (align native versions)
npm run doctor      # npx expo-doctor
```
