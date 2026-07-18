import { useState } from 'react';
import { CloseIcon } from './Icons.jsx';
import { startCheckout, openBillingPortal } from '../lib/api.js';

// What membership unlocks — the repositioned grocery-coach value, named
// specifically (not "go premium"). The universal layer (what's in the food) is
// always free; this is the part that's actually about you.
const INCLUDES = [
  'My read on every scan — against your goal, not a generic label',
  'The focuses you set, watched on every product — sodium, sugar, seed oils',
  'Your weekly Haul read — what the cart says and what to fix',
  'A shopping List built around your goal before every trip',
];

// Launch pricing: $7.99/mo, $59.99/yr. Annual works out to ~$5/mo (59.99 ÷ 12 ≈
// 5.00) and saves ~37% vs paying monthly (7.99 × 12 = 95.88). Stripe Tax adds any
// tax on top at checkout — we don't hand-roll it here.
const PLANS = [
  {
    id: 'annual',
    label: 'Annual',
    price: '$59.99',
    per: '/year',
    note: 'Just ~$5/mo — best value',
    badge: 'Save 37%',
  },
  {
    id: 'monthly',
    label: 'Monthly',
    price: '$7.99',
    per: '/month',
    note: 'Billed monthly, cancel anytime',
    badge: null,
  },
];

/**
 * The upgrade view. Brand-consistent bottom sheet — the two prices, what the
 * coach adds over the tracker, a subscribe button that opens Stripe Checkout,
 * and (for existing subscribers) a link to the billing portal.
 *
 * @param subscription  the current billing snapshot (to offer "manage" when they
 *                       already have a Stripe record)
 * @param onClose       () => void
 */
export default function Upgrade({ subscription, onClose }) {
  const [plan, setPlan] = useState('annual');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

  // Someone who has been through Stripe (active/past_due/canceled) can manage
  // their existing subscription rather than start a new checkout.
  const hasStripeRecord =
    subscription?.provider === 'stripe' &&
    ['active', 'past_due', 'canceled'].includes(subscription?.status);

  async function subscribe() {
    setLoading('checkout');
    setError('');
    try {
      await startCheckout(plan); // redirects to Stripe on success
    } catch (e) {
      setError(e?.message || 'Could not start checkout.');
      setLoading('');
    }
  }

  async function manage() {
    setLoading('portal');
    setError('');
    try {
      await openBillingPortal(); // redirects to the portal on success
    } catch (e) {
      setError(e?.message || 'Could not open the billing portal.');
      setLoading('');
    }
  }

  return (
    <div className="upgrade" role="dialog" aria-modal="true" aria-label="Upgrade to Kristy premium">
      <div className="upgrade__scrim" onClick={onClose} />
      <div className="upgrade__sheet">
        <button className="upgrade__close icon-btn" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        <div className="upgrade__avatar">K</div>
        <h2 className="upgrade__title">Kristy, your coach</h2>
        <p className="upgrade__tag">
          Anyone can see what&rsquo;s in it. Membership makes every scan about your goal.
        </p>

        <ul className="upgrade__list">
          {INCLUDES.map((line) => (
            <li key={line} className="upgrade__item">
              <span className="upgrade__check">✓</span>
              {line}
            </li>
          ))}
        </ul>

        <div className="upgrade__plans">
          {PLANS.map((p) => (
            <button
              key={p.id}
              className={`upgrade__plan${plan === p.id ? ' selected' : ''}`}
              onClick={() => setPlan(p.id)}
              aria-pressed={plan === p.id}
            >
              {p.badge && <span className="upgrade__badge">{p.badge}</span>}
              <span className="upgrade__plan-label">{p.label}</span>
              <span className="upgrade__plan-price">
                {p.price}
                <span className="upgrade__plan-per">{p.per}</span>
              </span>
              <span className="upgrade__plan-note">{p.note}</span>
            </button>
          ))}
        </div>

        {error && <p className="upgrade__error">{error}</p>}

        <button className="upgrade__cta" onClick={subscribe} disabled={!!loading}>
          {loading === 'checkout' ? 'Opening checkout…' : 'Start coaching'}
        </button>

        {hasStripeRecord ? (
          <button className="upgrade__manage" onClick={manage} disabled={!!loading}>
            {loading === 'portal' ? 'Opening…' : 'Manage subscription'}
          </button>
        ) : (
          <p className="upgrade__legal">Cancel anytime. Secure checkout by Stripe.</p>
        )}
      </div>
    </div>
  );
}
