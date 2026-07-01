# Kristy 🌿

**A nutritionist in your pocket that actually knows you — delivered as a conversation, not a dashboard.**

Kristy is an AI macro tracker where the interface *is* the intelligence. No logging
screens, no forms. You just tell Kristy what you ate, and it tracks macros, remembers
your history, and talks to you like a nutritionist who's been paying attention.

```
You:    100g chicken breast, 150g rice
Kristy: Logged it — solid protein hit. That keeps you on pace for the day.
        ┌──────────────────────────────────────────┐
        │ CAL 360   PROTEIN 34g   CARBS 42g  FAT 4g │
        │ Protein goal hit for the day. Nice work.  │
        └──────────────────────────────────────────┘
```

---

## Stack

| Layer    | Tech                                            |
| -------- | ----------------------------------------------- |
| Frontend | React (Vite)                                    |
| Backend  | Express / Node                                  |
| Database | Supabase (Auth + Postgres, RLS)                 |
| AI       | Anthropic API — `claude-haiku-4-5-20251001`     |
| Fonts    | Inter (UI) + DM Mono (numbers) via Google Fonts |

Design system: dark forest green throughout, ocean-mint accent (`#4FB896`).

---

## Quick start (demo mode — zero setup)

The UI runs fully without any keys, using an in-browser mock of the AI plus seeded
history. Great for exploring the interface.

```bash
npm install
npm run dev:client
```

Open http://localhost:5173 — Kristy launches straight into demo chat. Try the example
chips, edit goals in the sidebar, browse seeded history.

> Demo mode is automatic whenever Supabase env vars are absent. Force it with
> `VITE_DEMO=true` in `client/.env`.

---

## Full setup (real auth + AI + persistence)

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql) — creates the
   four tables, enables RLS with per-user policies, and adds a trigger that seeds
   default goals on signup.
3. Under **Authentication → Providers**, ensure **Email** (magic link) is enabled.

### 2. Server env (`server/.env`)

```bash
cp server/.env.example server/.env
```

```
PORT=3001
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...        # service role — never expose to the browser
CLIENT_ORIGIN=http://localhost:5173
CRON_SECRET=some-long-random-string  # optional, guards the all-users weekly run
```

### 3. Client env (`client/.env`)

```bash
cp client/.env.example client/.env
```

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=...           # anon/public key only
VITE_API_URL=                        # blank in dev → uses the Vite proxy
VITE_DEMO=false
```

### 4. Run both

```bash
npm install
npm run dev        # client (5173) + server (3001) together
```

---

## How it works

### Context injection (every `/api/chat`)
The server pulls the user's last 7 days of `meal_logs` and their `user_goals`, then
builds three blocks injected into Kristy's system prompt:

- **History** — `Day 1 (Mon): 2,340 kcal | 156g protein | …`
- **Goals** — `2,500 kcal | 180g protein | 200g carbs | 80g fat`
- **Today** — `1,240 kcal logged | … | 1,260 kcal remaining`

Kristy replies with strict JSON: `{ message, hasFood, macros, foods, insight }`.
When `hasFood`, the meal is saved and a macro card renders under the reply.

### Proactive insights (server-side, one per message, priority order)
1. **Protein streak** — under protein goal 3+ days running
2. **Under-eating** — past 6pm and >700 kcal under goal
3. **Consistency win** — logged all 7 days
4. **Goal hit** — protein goal reached today

A triggered server insight overrides the model's own insight line.

### Weekly summary
`node-cron` runs every **Sunday 8am**, generating a coach-style recap per user into
`weekly_summaries`. On next app open it's injected as the top AI message.
Trigger manually: `POST /api/weekly-summary` (per-user with a user token, or
all-users with the `x-cron-secret` header).

---

### Guest mode (try-first)
An unauthenticated visitor to `/app` lands in a working chat instead of an auth wall.
Guest turns hit `POST /api/guest/chat` — the **same** USDA meal pipeline and Kristy
voice as the authed chat (shared in `server/lib/chatEngine.js`), but **stateless**:
nothing is written to the database. A memory-requiring action (recall a past day,
log a weigh-in, ask for a weekly summary) or a 4-exchange cap trips a soft sign-in
gate. The endpoint is IP rate-limited to protect Claude/USDA spend.

---

## API

| Endpoint                   | Auth        | Purpose                                             |
| -------------------------- | ----------- | --------------------------------------------------- |
| `POST /api/chat`           | Bearer      | Main conversation + macro detection + persistence   |
| `POST /api/guest/chat`     | None        | Stateless guest chat (try-first, rate-limited)      |
| `POST /api/weight`         | Bearer      | Log a weigh-in + retune the calorie target          |
| `POST /api/barcode`        | Bearer      | Log a scanned product                               |
| `POST /api/photo`          | Bearer      | Log a meal from a photo                             |
| `POST /api/onboarding`     | Bearer      | Save profile + compute macro goals                  |
| `POST /api/weekly-summary` | Bearer/cron | Generate weekly recap (user token or cron secret)   |
| `GET  /api/history/:date`  | Bearer      | Chat messages for a given `YYYY-MM-DD`              |
| `GET  /api/health`         | None        | Health check                                        |

All AI calls go through the server — the Anthropic and Supabase service-role keys
never reach the browser.

---

## Deployment

Kristy deploys as two independent services:

| Piece   | Target      | Notes                                                              |
| ------- | ----------- | ----------------------------------------------------------------- |
| Client  | **Vercel**  | Static Vite build. Set the `VITE_*` env vars in the Vercel project; `VITE_API_URL` points at the Railway server URL. Build: `npm run build --workspace client`, output `client/dist`. |
| Server  | **Railway** | Node/Express. Set `ANTHROPIC_API_KEY`, `USDA_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLIENT_ORIGIN` (your Vercel domain), and optionally `CRON_SECRET`. Start: `npm run start`. |

Point the client's `VITE_API_URL` at the deployed server, and set the server's
`CLIENT_ORIGIN` to the deployed client domain so CORS allows it. Database is Supabase
(managed) — run `supabase/schema.sql` once in the project's SQL editor.

---

## Project layout

```
kristy/
├── client/          # Vite + React app (the product)
│   └── src/
│       ├── components/   TopBar, Sidebar, MacroCard, MacroRing, …
│       └── lib/          api, data, supabase, mock (demo), format
├── server/          # Express API
│   ├── routes/      chat, history, weeklySummary
│   └── lib/         anthropic, supabase, prompts, context, insights, store, weekly
└── supabase/
    └── schema.sql   # tables + RLS + signup trigger
```
