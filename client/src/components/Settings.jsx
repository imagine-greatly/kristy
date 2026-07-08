import { useState } from 'react';
import { STEPS } from '../lib/onboardingSteps.js';
import { CloseIcon } from './Icons.jsx';
import { openBillingPortal } from '../lib/api.js';

// A quiet, non-nagging status line for the Membership section.
function membershipLine(sub) {
  if (!sub) return 'Free plan';
  if (sub.status === 'trialing' && sub.premium) {
    const d = sub.trialDaysLeft;
    return `${d} day${d === 1 ? '' : 's'} left in your trial`;
  }
  if (sub.status === 'active') return 'Premium — active';
  if (sub.status === 'past_due') return 'Payment issue — update your card';
  if (sub.trialExpired) return 'Trial ended';
  if (sub.status === 'canceled') return 'Canceled — renew anytime';
  return 'Free plan';
}

// Reuse onboarding's option lists so settings and onboarding never drift.
const opt = (id) => STEPS.find((s) => s.id === id)?.options || [];
const GOAL_OPTIONS = opt('goal');
const SPORT_OPTIONS = opt('sport');
const FREQ_OPTIONS = opt('training_frequency');
const UNIT_OPTIONS = STEPS.find((s) => s.id === 'weight')?.units || [
  { label: 'lbs', value: 'lbs' },
  { label: 'kg', value: 'kg' },
];

function ChipGroup({ options, value, onPick, disabled }) {
  return (
    <div className="set-chips">
      {options.map((o) => (
        <button
          key={o.value}
          className={`set-chip${value === o.value ? ' selected' : ''}`}
          onClick={() => onPick(o.value)}
          disabled={disabled}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Minimal settings screen — edit goal, weight-unit preference, and training,
 * plus a guarded account-deletion. Opens as a full-screen sheet over the app.
 *
 * @param profile  the user's current profile row (goal/weight_unit/sport/…)
 * @param onSave   (patch) => Promise — persists one or more profile fields
 * @param onDelete () => Promise — deletes the account (and signs out)
 */
export default function Settings({ profile, subscription, onUpgrade, onClose, onSave, onDelete }) {
  const [vals, setVals] = useState({
    goal: profile?.goal || null,
    weight_unit: profile?.weight_unit || 'lbs',
    sport: profile?.sport || null,
    training_frequency: profile?.training_frequency || null,
  });
  const [savingKey, setSavingKey] = useState('');
  const [error, setError] = useState('');

  // Manage-subscription (Stripe portal) state.
  const [managing, setManaging] = useState(false);
  const [manageError, setManageError] = useState('');

  const canManage =
    subscription?.provider === 'stripe' &&
    ['active', 'past_due', 'canceled'].includes(subscription?.status);

  async function handleManage() {
    setManaging(true);
    setManageError('');
    try {
      await openBillingPortal(); // redirects on success
    } catch (e) {
      setManageError(e?.message || 'Could not open the billing portal.');
      setManaging(false);
    }
  }

  // Delete-account confirmation state.
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const canDelete = confirmText.trim().toLowerCase() === 'delete';

  async function change(key, value) {
    if (vals[key] === value) return;
    const prev = vals;
    setVals({ ...vals, [key]: value });
    setSavingKey(key);
    setError('');
    try {
      await onSave({ [key]: value });
    } catch {
      setVals(prev); // revert the optimistic pick
      setError('Could not save that — try again.');
    } finally {
      setSavingKey('');
    }
  }

  async function handleDelete() {
    if (!canDelete || deleting) return;
    setDeleting(true);
    setError('');
    try {
      await onDelete();
      // Success unmounts this screen (sign-out → guest view, or demo reload).
    } catch (e) {
      setDeleting(false);
      setError(e?.message || 'Could not delete your account. Please try again.');
    }
  }

  return (
    <div className="settings" role="dialog" aria-modal="true" aria-label="Settings">
      <div className="settings__sheet">
        <header className="settings__header">
          <span className="settings__title">Settings</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close settings">
            <CloseIcon />
          </button>
        </header>

        <div className="settings__body">
          <section className="set-section">
            <div className="set-section__label">Membership</div>
            <div className="set-membership">
              <span className="set-membership__status">
                {membershipLine(subscription)}
              </span>
              {canManage ? (
                <button
                  className="set-membership__btn"
                  onClick={handleManage}
                  disabled={managing}
                >
                  {managing ? 'Opening…' : 'Manage'}
                </button>
              ) : (
                <button className="set-membership__btn" onClick={onUpgrade}>
                  {subscription?.premium ? 'See plans' : 'Upgrade'}
                </button>
              )}
            </div>
            {manageError && <p className="set-error">{manageError}</p>}
          </section>

          <section className="set-section">
            <div className="set-section__label">
              Goal {savingKey === 'goal' && <span className="set-saving">saving…</span>}
            </div>
            <ChipGroup
              options={GOAL_OPTIONS}
              value={vals.goal}
              onPick={(v) => change('goal', v)}
              disabled={!!savingKey}
            />
          </section>

          <section className="set-section">
            <div className="set-section__label">
              Weight units{' '}
              {savingKey === 'weight_unit' && <span className="set-saving">saving…</span>}
            </div>
            <ChipGroup
              options={UNIT_OPTIONS}
              value={vals.weight_unit}
              onPick={(v) => change('weight_unit', v)}
              disabled={!!savingKey}
            />
          </section>

          <section className="set-section">
            <div className="set-section__label">
              Training{' '}
              {(savingKey === 'sport' || savingKey === 'training_frequency') && (
                <span className="set-saving">saving…</span>
              )}
            </div>
            <div className="set-sub">Sport</div>
            <ChipGroup
              options={SPORT_OPTIONS}
              value={vals.sport}
              onPick={(v) => change('sport', v)}
              disabled={!!savingKey}
            />
            <div className="set-sub">How often</div>
            <ChipGroup
              options={FREQ_OPTIONS}
              value={vals.training_frequency}
              onPick={(v) => change('training_frequency', v)}
              disabled={!!savingKey}
            />
          </section>

          {error && <p className="set-error">{error}</p>}

          <section className="set-section set-danger">
            <div className="set-section__label">Account</div>
            {!confirming ? (
              <button className="set-danger__btn" onClick={() => setConfirming(true)}>
                Delete my account
              </button>
            ) : (
              <div className="set-danger__confirm">
                <p className="set-danger__warn">
                  This permanently deletes your account and all your data — meals,
                  weigh-ins, chats, and goals. This can’t be undone. Type{' '}
                  <b>delete</b> to confirm.
                </p>
                <input
                  className="set-danger__input"
                  type="text"
                  autoFocus
                  placeholder="delete"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={deleting}
                />
                <div className="set-danger__actions">
                  <button
                    className="set-danger__cancel"
                    onClick={() => {
                      setConfirming(false);
                      setConfirmText('');
                    }}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    className="set-danger__go"
                    onClick={handleDelete}
                    disabled={!canDelete || deleting}
                  >
                    {deleting ? 'Deleting…' : 'Delete forever'}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
