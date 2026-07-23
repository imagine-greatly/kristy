import { useEffect, useState } from 'react';
import { STEPS } from '../lib/onboardingSteps.js';
import { CloseIcon } from './Icons.jsx';
import { openBillingPortal } from '../lib/api.js';
import { hasMacroTracking } from '../lib/data.js';
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

// An accessible on/off switch, tokens only.
function Switch({ on, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      style={{
        position: 'relative',
        width: 46,
        height: 28,
        flex: '0 0 auto',
        padding: 0,
        borderRadius: 999,
        border: `1px solid ${on ? colors.borderGold : colors.border}`,
        background: on ? colors.goldTint9 : 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'background .18s ease, border-color .18s ease',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: 999,
          background: on ? colors.accentGold : colors.textMuted,
          transition: 'left .18s ease, background .18s ease',
        }}
      />
    </button>
  );
}

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
export default function Settings({
  profile,
  subscription,
  macroTracking = false,
  onUpgrade,
  onClose,
  onSave,
  onToggleMacroTracking,
  onEditPreferences,
  onDelete,
  onOpenMacroSetup,
}) {
  const [vals, setVals] = useState({
    goal: profile?.goal || null,
    weight_unit: profile?.weight_unit || 'lbs',
    sport: profile?.sport || null,
    training_frequency: profile?.training_frequency || null,
  });
  const [savingKey, setSavingKey] = useState('');
  const [error, setError] = useState('');

  // Macro-tracking switch — optimistic local mirror of the prop, so the macro
  // sections reveal/hide instantly. Reverts on a failed save.
  const [tracking, setTracking] = useState(macroTracking);
  const [togglingMacro, setTogglingMacro] = useState(false);
  useEffect(() => setTracking(macroTracking), [macroTracking]);

  async function toggleMacro(next) {
    if (togglingMacro || !onToggleMacroTracking) return;
    setTracking(next); // optimistic
    setTogglingMacro(true);
    setError('');
    try {
      await onToggleMacroTracking(next);
    } catch {
      setTracking(!next); // revert
      setError('Could not update macro tracking — try again.');
    } finally {
      setTogglingMacro(false);
    }
  }

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

          {/* Macro tracking — the ONE optional switch. OFF by default: Kristy coaches
              your shopping without calories. This is the only place the macro feature
              appears; everything fitness-shaped below is gated on it. */}
          <section className="set-section">
            <div className="set-section__label">Macro tracking (optional)</div>
            <div className="set-membership">
              <span className="set-membership__status">
                {tracking ? 'On — calories, macros & weight' : 'Off — shopping, not counting'}
              </span>
              <Switch on={tracking} onChange={toggleMacro} disabled={togglingMacro} label="Macro tracking" />
            </div>
            <p className="set-sub" style={{ margin: '6px 0 0' }}>
              Turn this on for calorie/macro logging and adaptive weight targets. Off by default — Kristy shops with you without it.
            </p>
            {tracking && onOpenMacroSetup && (
              <button className="set-membership__btn" style={{ marginTop: 10 }} onClick={onOpenMacroSetup}>
                {hasMacroTracking(profile) ? 'Redo macro setup' : 'Set up macro targets'}
              </button>
            )}
          </section>

          {/* Macro goal / Weight units / Training — the fitness surfaces. They exist
              ONLY when macro tracking is on; a grocery user never sees them. */}
          {tracking && (
            <>
              <section className="set-section">
                <div className="set-section__label">
                  Macro goal {savingKey === 'goal' && <span className="set-saving">saving…</span>}
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
            </>
          )}

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
