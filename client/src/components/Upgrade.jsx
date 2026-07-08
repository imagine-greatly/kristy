import { useState } from 'react';
import { CloseIcon } from './Icons.jsx';
import { startCheckout, openBillingPortal } from '../lib/api.js';

// What premium unlocks, framed as "the coach" vs "the tracker" — the
// optimization loop, not a longer feature list.
const INCLUDES = [
  'Adaptive targets that retune as your weight moves',
  'A weekly read every Sunday — what worked, what to fix',
  'Memory of every day and pattern, always on hand',
  'Weight trends and the full optimization loop',
];

const PLANS = [
  {
    id: 'annual',
    label: 'Annual',
    price: '$49.99',
    per: '/year',
    note: 'Just $4.17/mo — best value',
    badge: 'Save 54%',
  },
  {
    id: 'monthly',
    label: 'Monthly',
    price: '$8.99',
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
        <h2 className="upgrade__title">Kristy, the coach</h2>
        <p className="upgrade__tag">
          The tracker logs your food. The coach optimizes what happens next.
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
