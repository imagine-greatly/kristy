import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { stripe, stripeReady, PRICE_MONTHLY, PRICE_ANNUAL, clientOrigin } from '../lib/stripe.js';
import { getSubscription } from '../lib/store.js';

const router = Router();

const NOT_CONFIGURED = {
  error: true,
  message: 'Billing is not set up yet — check back soon.',
};

// POST /api/billing/checkout  { plan: 'monthly' | 'annual' }
// Creates a Stripe Checkout session for the chosen price and returns its URL.
// The client redirects the browser there. We stamp the user id on both the
// session (client_reference_id + metadata) and the subscription (subscription_
// data.metadata) so the webhook can map the resulting sub back to our user.
router.post('/checkout', requireAuth, async (req, res) => {
  if (!stripeReady()) return res.status(503).json(NOT_CONFIGURED);

  const plan = req.body?.plan === 'annual' ? 'annual' : 'monthly';
  const price = plan === 'annual' ? PRICE_ANNUAL : PRICE_MONTHLY;
  const origin = clientOrigin();

  try {
    // Reuse the existing Stripe customer if we have one (avoids duplicates when
    // a past subscriber upgrades again).
    const existing = await getSubscription(req.user.id);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/app?checkout=success`,
      cancel_url: `${origin}/app?checkout=cancel`,
      client_reference_id: req.user.id,
      metadata: { user_id: req.user.id },
      subscription_data: { metadata: { user_id: req.user.id } },
      allow_promotion_codes: true,
      ...(existing?.provider_customer_id
        ? { customer: existing.provider_customer_id }
        : {}),
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('[kristy] /api/billing/checkout error:', err.message);
    return res.status(500).json({
      error: true,
      message: 'Could not start checkout. Please try again in a moment.',
    });
  }
});

// POST /api/billing/portal
// Opens the Stripe customer portal so an existing subscriber can update or
// cancel. Requires a stored Stripe customer id (set at checkout completion).
router.post('/portal', requireAuth, async (req, res) => {
  if (!stripe) return res.status(503).json(NOT_CONFIGURED);

  try {
    const sub = await getSubscription(req.user.id);
    const customer = sub?.provider_customer_id;
    if (!customer) {
      return res.status(400).json({
        error: true,
        message: "You don't have a subscription to manage yet.",
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `${clientOrigin()}/app`,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('[kristy] /api/billing/portal error:', err.message);
    return res.status(500).json({
      error: true,
      message: 'Could not open the billing portal. Please try again in a moment.',
    });
  }
});

export default router;
