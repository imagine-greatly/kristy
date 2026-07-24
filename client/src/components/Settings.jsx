import { useState } from 'react';
import { CloseIcon } from './Icons.jsx';
import { openBillingPortal } from '../lib/api.js';
import { colors } from '../lib/tokens.js';
import { COACH_GOALS, FOCUSES, NON_NEGOTIABLES, CONSTRAINTS } from '../lib/coachGoals.js';
import { customLineLabel, isCustomLine } from '../lib/preferences.js';

// Human label for any stored preference value (goal / focus / hard line / constraint),
// including a custom hard line the user added by search.
const prefLabel = (v) =>
  COACH_GOALS.find((g) => g.value === v)?.title ||
  FOCUSES.find((f) => f.value === v)?.label ||
  NON_NEGOTIABLES.find((n) => n.value === v)?.label ||
  CONSTRAINTS.find((c) => c.value === v)?.label ||
  (isCustomLine(v) ? customLineLabel(v) : v);

// The read-only summary of what the shopper's shopping for — the primary content
// for a grocery user. Chips render current goal + focuses + hard lines + constraints.
function PrefSummary({ profile }) {
  const goal = profile?.coach_goal || null;
  const focuses = profile?.focuses || [];
  const hardLines = profile?.non_negotiables || [];
  const constraints = profile?.constraints || [];
  const items = [goal, ...focuses, ...hardLines, ...constraints].filter(Boolean);

  if (!items.length) {
    return (
      <p className="set-sub" style={{ margin: '0 0 10px' }}>
        Not set yet — tell Kristy what you&rsquo;re shopping for and she&rsquo;ll build around it.
      </p>
    );
  }
  return (
    <div className="set-pref-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '0 0 12px' }}>
      {items.map((v) => (
        <span
          key={v}
          style={{
            padding: '6px 12px',
            borderRadius: 999,
            border: `1px solid ${colors.borderGold}`,
            background: colors.goldTint9,
            color: colors.accentGold,
            fontSize: 13,
            fontWeight: 600,
            maxWidth: '100%',
            overflowWrap: 'anywhere',
          }}
        >
          {prefLabel(v)}
        </span>
      ))}
    </div>
  );
}

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

/**
 * Minimal settings screen — Membership, Shopping preferences, and a guarded
 * account deletion. Kristy is a grocery coach; there are no macro, calorie,
 * weight, or training surfaces here. Opens as a full-screen sheet over the app.
 *
 * @param profile           the user's current profile row (coach_goal/focuses/…)
 * @param onEditPreferences () => void — opens the goal switcher (the pref editor)
 * @param onDelete          () => Promise — deletes the account (and signs out)
 */
export default function Settings({
  profile,
  subscription,
  onUpgrade,
  onClose,
  onEditPreferences,
  onDelete,
}) {
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
  const [error, setError] = useState('');

  const canDelete = confirmText.trim().toLowerCase() === 'delete';

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

          {/* Shopping preferences — the PRIMARY content for a grocery user: what
              they're shopping for (goal / focuses / hard lines / constraints). The
              full editor is the goal switcher; here we summarize + link to it. */}
          <section className="set-section">
            <div className="set-section__label">Shopping preferences</div>
            <PrefSummary profile={profile} />
            {onEditPreferences && (
              <button className="set-membership__btn" onClick={onEditPreferences}>
                Edit shopping preferences
              </button>
            )}
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
                  This permanently deletes your account and all your data — your
                  lists, hauls, scans, chats, and preferences. This can’t be undone.
                  Type <b>delete</b> to confirm.
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
