import { Router } from 'express';
import { stripe } from '../lib/stripe.js';
import {
  upsertSubscription,
  getSubscriptionByCustomer,
} from '../lib/store.js';
import { mapStripeStatus } from '../lib/subscription.js';

// POST /api/stripe/webhook — Stripe → our subscriptions state.
//
// Mounted in index.js with express.raw() BEFORE the JSON body parser, so
// req.body is the exact raw Buffer Stripe signed (constructEvent needs it).
// Every handler resolves the event to OUR user_id and upserts the single
// subscriptions row with provider='stripe' and a mapped internal status.

const router = Router();

const secsToISO = (s) => (s ? new Date(s * 1000).toISOString() : null);

/** Resolve our user id from a Stripe object's metadata, else the stored customer. */
async function resolveUserId({ metadataUserId, customerId }) {
  if (metadataUserId) return metadataUserId;
  if (customerId) {
    const row = await getSubscriptionByCustomer(customerId);
    if (row?.user_id) return row.user_id;
  }
  return null;
}

async function handleEvent(event) {
  switch (event.type) {
    // Fires when Checkout completes. Pull the created subscription for its real
    // status + period end, then record the customer + subscription ids.
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.client_reference_id || session.metadata?.user_id;
      if (!userId) {
        console.error('[kristy] webhook: checkout.session.completed with no user_id');
        return;
      }

      let status = 'active';
      let currentPeriodEnd = null;
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        status = mapStripeStatus(sub.status);
        currentPeriodEnd = secsToISO(sub.current_period_end);
      }

      await upsertSubscription(userId, {
        status,
        provider: 'stripe',
        provider_subscription_id: session.subscription || null,
        provider_customer_id: session.customer || null,
        current_period_end: currentPeriodEnd,
      });
      return;
    }

    // Status/renewal changes and cancellations.
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const userId = await resolveUserId({
        metadataUserId: sub.metadata?.user_id,
        customerId: sub.customer,
      });
      if (!userId) {
        console.error('[kristy] webhook: subscription event, no user for customer', sub.customer);
        return;
      }

      const status =
        event.type === 'customer.subscription.deleted'
          ? 'canceled'
          : mapStripeStatus(sub.status);

      await upsertSubscription(userId, {
        status,
        provider: 'stripe',
        provider_subscription_id: sub.id,
        provider_customer_id: sub.customer,
        current_period_end: secsToISO(sub.current_period_end),
      });
      return;
    }

    // A failed renewal → past_due (isPremium already treats this as non-premium).
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const userId = await resolveUserId({
        metadataUserId: invoice.subscription_details?.metadata?.user_id,
        customerId: invoice.customer,
      });
      if (!userId) {
        console.error('[kristy] webhook: invoice.payment_failed, no user for customer', invoice.customer);
        return;
      }
      await upsertSubscription(userId, {
        status: 'past_due',
        provider: 'stripe',
        provider_customer_id: invoice.customer,
      });
      return;
    }

    default:
      return; // ignore everything else
  }
}

router.post('/', async (req, res) => {
  if (!stripe) return res.status(503).send('billing not configured');

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    // req.body is the raw Buffer (express.raw mounted for this path).
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error('[kristy] webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await handleEvent(event);
  } catch (err) {
    // 500 → Stripe retries. Log with the event type for triage.
    console.error(`[kristy] webhook handler error (${event.type}):`, err.message);
    return res.status(500).send('handler error');
  }

  return res.json({ received: true });
});

export default router;
