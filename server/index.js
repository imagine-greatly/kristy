import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import chatRoute from './routes/chat.js';
import guestRoute from './routes/guest.js';
import historyRoute from './routes/history.js';
import weeklySummaryRoute from './routes/weeklySummary.js';
import barcodeRoute from './routes/barcode.js';
import photoRoute from './routes/photo.js';
import onboardingRoute from './routes/onboarding.js';
import weightRoute from './routes/weight.js';
import accountRoute from './routes/account.js';
import verdictRoute, { guestVerdictRouter } from './routes/verdict.js';
import scanRoute, { guestScanRouter } from './routes/scan.js';
import haulRoute from './routes/haul.js';
import subscriptionRoute from './routes/subscription.js';
import billingRoute from './routes/billing.js';
import stripeWebhookRoute from './routes/stripe.js';
import revenueCatWebhookRoute from './routes/revenuecat.js';
import pushRoute from './routes/push.js';
import { startCron } from './cron.js';

const app = express();
const PORT = process.env.PORT || 3001;

const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

app.use(cors({ origin: origins }));

// Stripe webhook FIRST, with a raw body — signature verification needs the
// exact bytes Stripe signed, so this must run BEFORE express.json() parses (and
// discards) the raw payload. Everything below uses the JSON parser as normal.
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhookRoute);

app.use(express.json({ limit: '1mb' }));

// Root + health endpoints — both return 200 with no dependencies, so a browser
// hit or a platform health check (Railway) confirms the process is live.
app.get('/', (_req, res) => res.json({ ok: true, service: 'kristy' }));
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'kristy' }));

app.use('/api', chatRoute);
app.use('/api/guest', guestRoute); // no auth — the try-first guest experience
app.use('/api/guest', guestVerdictRouter); // no auth — guest verdict (shares the guest IP budget)
app.use('/api/guest', guestScanRouter); // no auth — guest scan extraction (shares the guest IP budget)
app.use('/api', verdictRoute); // authed — Kristy's Verdict
app.use('/api', scanRoute); // authed — scan extraction (barcode + label vision) → /verdict
app.use('/api', haulRoute); // authed — the Haul (record scans + aggregate trip/week + read)
app.use('/api', historyRoute);
app.use('/api', weeklySummaryRoute);
app.use('/api', barcodeRoute);
app.use('/api', photoRoute);
app.use('/api', onboardingRoute);
app.use('/api', weightRoute);
app.use('/api', accountRoute);
app.use('/api', subscriptionRoute);
app.use('/api/billing', billingRoute);
// Mobile additions: RevenueCat (Apple IAP) webhook + Expo push-token registration.
// Both use the JSON parser above (RC, unlike Stripe, needs no raw-body signature).
app.use('/api/revenuecat', revenueCatWebhookRoute);
app.use('/api/push', pushRoute);

// ───────── Global error handler (final safety net) ─────────
// Last in the chain: catches anything a route forwarded via next(err) or threw
// synchronously (e.g. a multer upload error), logs it with context, and returns
// a clean generic 500 — never a stack trace or raw error object to the client.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(
    `[kristy] unhandled error on ${req.method} ${req.originalUrl} @ ${new Date().toISOString()}:`,
    err?.stack || err
  );
  if (res.headersSent) return next(err);
  res.status(500).json({
    error: true,
    message: 'Something went wrong on our end. Please try again in a moment.',
  });
});

// ───────── Process-level safety nets ─────────
// A stray rejected promise or a throw outside the request cycle would otherwise
// crash the process (Railway restarts it, but that's user-facing downtime).
// Log loudly and stay up. These are backstops — routes still handle their own
// errors above; this only catches what slips through.
process.on('unhandledRejection', (reason) => {
  console.error('[kristy] unhandledRejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[kristy] uncaughtException:', err?.stack || err);
});

app.listen(PORT, () => {
  console.log(`[kristy] server listening on http://localhost:${PORT}`);
  startCron();
});
