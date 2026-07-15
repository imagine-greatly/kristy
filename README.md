# Kristy Approved

A conversational AI nutrition coach. No logging forms, no food-search screens — you
just talk, and it handles the tracking underneath. Built around real food and real
conversation.

## Philosophy

Real food, real conversation, no tracking grind. You never fill in a food diary or
hunt through a database UI — you just talk. The macros are still real: typed meals
are resolved against the USDA FoodData Central database (with a Claude estimate as a
fallback), so accuracy doesn't cost you the manual logging.

## What's built

- Conversational logging: describe a meal, get back a macro card (calories, protein,
  carbs, fat) with the meal saved to your history.
- Photo meals (Claude vision) and barcode scanning (Open Food Facts).
- Weight logging with adaptive TDEE and a 30-day trend chart.
- Proactive coaching insights and an automated weekly recap.
- Guest "try-first" chat before sign-up (stateless, rate-limited).
- Kristy's Verdict: scan a meal or grocery haul for a shareable score card.
- Onboarding (goals, sport, eating window), accounts, and a 7-day full-access trial
  with subscription gating (Stripe on web, RevenueCat on iOS).

## Stack

- Web: React + Vite (Vercel)
- Server: Node + Express (Railway)
- Mobile: Expo / React Native, expo-router, push via expo-notifications
- Data & auth: Supabase (Postgres + Auth, RLS)
- AI: Anthropic Claude (Haiku)
- Nutrition data: USDA FoodData Central, Open Food Facts

## Status

In active development. Configuration lives in the `*.env.example` files at each
workspace root (`server/`, `client/`, `mobile/`).
