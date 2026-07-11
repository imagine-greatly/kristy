// POST /api/revenuecat/webhook — RevenueCat (Apple IAP) → our subscriptions state.
//
// Mirrors routes/stripe.js, but for the mobile provider. Because the app sets the
// RevenueCat App User ID to our Supabase user id (Purchases.configure/logIn with
// userId), every event's `app_user_id` IS our user_id — no customer lookup table
// needed. Each event upserts the single subscriptions row with provider='apple'
// and a mapped internal status, so the existing isPremium() gate works for iOS
// users with zero changes.
//
// Auth: RevenueCat sends the exact Authorization header value configured in its
// dashboard. We compare it to REVENUECAT_WEBHOOK_AUTH (constant-time). This route
// is mounted AFTER express.json() (unlike Stripe, RC needs no raw-body signature).

import { Router } from 'express';
import crypto from 'crypto';
import { upsertSubscription } from '../lib/store.js';

const router = Router();

const msToISO = (ms) => (ms ? new Date(Number(ms)).toISOString() : null);

// Constant-time compare so the auth check can't be timing-probed.
function safeEqual(a, b) {
  const ba = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/**
 * Map a RevenueCat event → our internal status vocabulary
 * ({trialing, active, past_due, canceled, expired}). Returns null for events we
 * intentionally ignore (transfers, alias, test).
 *
 * CANCELLATION means auto-renew was turned off — the user KEEPS access until the
 * period ends, so we do NOT downgrade here; the later EXPIRATION event flips it
 * to expired. This matches Apple's "cancel = don't renew", not "revoke now".
 */
export function mapRevenueCatStatus(type, periodType, expirationMs, now = Date.now()) {
  const stillActive = expirationMs ? Number(expirationMs) > now : true;
  switch (type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'PRODUCT_CHANGE':
    case 'UNCANCELLATION':
    case 'SUBSCRIPTION_EXTENDED':
    case 'NON_RENEWING_PURCHASE':
      return periodType === 'TRIAL' ? 'trialing' : 'active';
    case 'CANCELLATION':
      // Access continues until expiry; keep them premium until EXPIRATION lands.
      return stillActive ? (periodType === 'TRIAL' ? 'trialing' : 'active') : 'expired';
    case 'BILLING_ISSUE':
      return 'past_due';
    case 'EXPIRATION':
      return 'expired';
    default:
      return null; // TRANSFER, SUBSCRIBER_ALIAS, TEST, etc. — ignore
  }
}

router.post('/webhook', async (req, res) => {
  // Verify the shared Authorization header if one is configured.
  const expected = process.env.REVENUECAT_WEBHOOK_AUTH;
  if (expected) {
    const provided = req.headers['authorization'];
    if (!safeEqual(provided, expected)) {
      console.error('[kristy] revenuecat webhook: bad Authorization header');
      return res.status(401).json({ error: 'unauthorized' });
    }
  }

  const event = req.body?.event;
  if (!event || !event.type) {
    return res.status(400).json({ error: 'missing event' });
  }

  // app_user_id is our Supabase user id (set via Purchases.logIn on the client).
  // Fall back to original_app_user_id / aliases if RC re-aliased the identity.
  const userId =
    event.app_user_id ||
    event.original_app_user_id ||
    (Array.isArray(event.aliases) ? event.aliases[0] : null);

  if (!userId) {
    console.error('[kristy] revenuecat webhook: no app_user_id on', event.type);
    // 200 so RC doesn't retry an event we can't ever resolve.
    return res.json({ received: true, skipped: 'no user' });
  }

  const status = mapRevenueCatStatus(event.type, event.period_type, event.expiration_at_ms);
  if (!status) {
    return res.json({ received: true, ignored: event.type });
  }

  try {
    await upsertSubscription(userId, {
      status,
      provider: 'apple',
      provider_subscription_id: event.product_id || event.transaction_id || null,
      current_period_end: msToISO(event.expiration_at_ms),
    });
    return res.json({ received: true });
  } catch (err) {
    // 500 → RevenueCat retries with backoff.
    console.error(`[kristy] revenuecat webhook handler error (${event.type}):`, err.message);
    return res.status(500).json({ error: 'handler error' });
  }
});

export default router;
