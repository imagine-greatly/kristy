import { useState } from 'react';
import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';
import { COACH_GOALS, FOCUSES, NON_NEGOTIABLES, CONSTRAINTS, CONSTRAINTS_SECTION, FOCUS_DISCLAIMER } from '../lib/coachGoals.js';
import { interpretPreferences, customLineLabel, isCustomLine } from '../lib/preferences.js';

/* ═══════════════════════ Coach onboarding — the front door ═══════════════════════
   The first thing a signed-in, goal-less user sees, before List/Scan/Haul. This is
   where the coaching relationship begins: Kristy asking who she's shopping for. It is
   NOT a fitness intake and NOT the TDEE macro setup.

   GOALS are a SET now — a real shopper is often several at once (high-protein AND
   eating cleaner AND feeding a family), so the goal step is MULTI-SELECT. Focuses,
   hard lines, and constraints are all multi-select and optional. A free-text field
   ("or just tell me") routes through the same claim-safe mapper and fills the
   selections. It ends on a confirmation naming what she'll hold, then drops the user
   into the app with a list already tailored.

   Completing it calls onComplete({ coach_goals, ... }) → saveCoachProfile. It does NOT
   start the trial — that's a separate, explicit choice at the gate. Fully skippable;
   skipping leaves the user goal-less on universal verdicts. Tokens only. */
const STEP_KEYS = ['goals', 'focuses', 'lines', 'constraints', 'confirm'];

export default function CoachOnboarding({ onComplete, onSkip, initialGoal = null }) {
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState(initialGoal ? [initialGoal] : []);
  const [focuses, setFocuses] = useState([]);
  const [constraints, setConstraints] = useState([]);
  const [nonNegotiables, setNonNegotiables] = useState([]);
  const [busy, setBusy] = useState(false);

  // Free-text mapper ("or just tell me").
  const [text, setText] = useState('');
  const [mapping, setMapping] = useState(false);
  const [mapErr, setMapErr] = useState(false);

  const LAST = STEP_KEYS.length - 1;
  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  const uniq = (arr) => [...new Set(arr)];

  async function runFreeText(e) {
    e.preventDefault();
    if (!text.trim() || mapping) return;
    setMapping(true);
    setMapErr(false);
    try {
      const p = await interpretPreferences(text);
      if (p.goal) setGoals((g) => (g.includes(p.goal) ? g : [...g, p.goal]));
      if (p.focuses?.length) setFocuses((f) => uniq([...f, ...p.focuses]));
      if (p.hardLines?.length) setNonNegotiables((n) => uniq([...n, ...p.hardLines]));
      if (p.constraints?.length) setConstraints((c) => uniq([...c, ...p.constraints]));
      setText('');
    } catch {
      setMapErr(true);
    } finally {
      setMapping(false);
    }
  }

  function finish() {
    if (busy || goals.length === 0) return;
    setBusy(true);
    onComplete({ coach_goals: goals, non_negotiables: nonNegotiables, focuses, constraints });
  }

  const labelOf = (v) =>
    COACH_GOALS.find((g) => g.value === v)?.title ||
    FOCUSES.find((f) => f.value === v)?.label ||
    NON_NEGOTIABLES.find((n) => n.value === v)?.label ||
    CONSTRAINTS.find((c) => c.value === v)?.label ||
    (isCustomLine(v) ? customLineLabel(v) : v);

  const naturalList = (arr) =>
    arr.length > 1 ? `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}` : arr[0] || '';

  return (
    <div style={styles.screen} role="dialog" aria-modal="true" aria-label="Let's set up your cart">
      <div style={styles.card}>
        <div style={styles.top}>
          <span style={styles.logo}>Kristy</span>
          <div style={styles.dots} aria-hidden="true">
            {STEP_KEYS.map((k, i) => (
              <span key={k} style={{ ...styles.dot, ...(i === step ? styles.dotOn : null) }} />
            ))}
          </div>
        </div>

        <div style={styles.body}>
          {step === 0 && (
            <>
              <h2 style={styles.prompt}>What are you shopping for?</h2>
              <p style={styles.sub}>
                Pick all that fit &mdash; most people are a few at once. Or just tell me and I&rsquo;ll set it up.
              </p>

              {/* Natural language LEADS — type your whole philosophy instead of tapping. */}
              <form onSubmit={runFreeText} style={styles.freeForm}>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="High protein, clean eating, no seed oils, feeding kids…"
                  style={styles.freeInput}
                  maxLength={600}
                  aria-label="Tell Kristy what you're shopping for"
                />
                <button type="submit" style={styles.freeBtn} disabled={!text.trim() || mapping}>
                  {mapping ? '…' : 'Set it up'}
                </button>
              </form>
              {mapErr && <p style={styles.note}>That didn&rsquo;t go through &mdash; try again, or just tap below.</p>}

              <div style={styles.goals}>
                {COACH_GOALS.map((g) => {
                  const on = goals.includes(g.value);
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => toggle(goals, setGoals, g.value)}
                      aria-pressed={on}
                      style={{ ...styles.goal, ...(on ? styles.goalOn : null) }}
                    >
                      <span style={styles.goalTitle}>{g.title}</span>
                      <span style={styles.goalBlurb}>{g.blurb}</span>
                      {on && <span style={styles.goalCheck}>✓</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 style={styles.prompt}>Anything you want me to keep an eye on?</h2>
              <p style={styles.sub}>Optional. Turn on what matters to you &mdash; I&rsquo;ll flag it as we shop.</p>
              <ChipRow options={FOCUSES} selected={focuses} onToggle={(v) => toggle(focuses, setFocuses, v)} />
              {focuses.length > 0 && <p style={styles.note}>{FOCUS_DISCLAIMER}</p>}
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={styles.prompt}>Any hard lines?</h2>
              <p style={styles.sub}>
                Optional. Things you never want in the cart &mdash; I&rsquo;ll hold them on every product.
              </p>
              <ChipRow options={NON_NEGOTIABLES} selected={nonNegotiables} onToggle={(v) => toggle(nonNegotiables, setNonNegotiables, v)} />
            </>
          )}

          {step === 3 && (
            <>
              <h2 style={styles.prompt}>{CONSTRAINTS_SECTION.title}</h2>
              <p style={styles.sub}>{CONSTRAINTS_SECTION.sub}</p>
              <ChipRow options={CONSTRAINTS} selected={constraints} onToggle={(v) => toggle(constraints, setConstraints, v)} />
            </>
          )}

          {step === 4 && (
            <>
              <h2 style={styles.prompt}>Here&rsquo;s your setup.</h2>
              <p style={styles.sub}>
                {goals.length
                  ? `I'll shop toward ${naturalList(goals.map(labelOf).map((s) => s.toLowerCase()))}.`
                  : 'Pick at least one goal so I know what to shop toward.'}
                {' '}You can change any of it any time from the header.
              </p>
              <ConfirmGroup title="Shopping toward" values={goals} labelOf={labelOf} />
              <ConfirmGroup title="Watching" values={focuses} labelOf={labelOf} />
              <ConfirmGroup title="Hard lines" values={nonNegotiables} labelOf={labelOf} />
              <ConfirmGroup title="Working with" values={constraints} labelOf={labelOf} />
            </>
          )}
        </div>

        <div style={styles.threadWrap}>
          <GoldThread />
        </div>

        <div style={styles.actions}>
          {step > 0 && (
            <button type="button" style={styles.back} onClick={() => setStep((s) => s - 1)} disabled={busy}>
              Back
            </button>
          )}
          {step < LAST && (
            <button
              type="button"
              style={{ ...styles.primary, ...(step === 0 && goals.length === 0 ? styles.primaryOff : null) }}
              onClick={() => setStep((s) => s + 1)}
              disabled={busy || (step === 0 && goals.length === 0)}
            >
              Continue
            </button>
          )}
          {step === LAST && (
            <button type="button" style={styles.primary} onClick={finish} disabled={busy || goals.length === 0}>
              {busy ? 'Setting up…' : "That's everything — let's shop"}
            </button>
          )}
        </div>

        {/* Skippable, never a trap: the escape hatch lives on the first step, where
            "skip" unambiguously means "don't set me up." */}
        {step === 0 && (
          <button type="button" style={styles.skip} onClick={onSkip} disabled={busy}>
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}

function ChipRow({ options, selected, onToggle }) {
  return (
    <div style={styles.chips}>
      {options.map((o) => {
        const on = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onToggle(o.value)}
            aria-pressed={on}
            style={{ ...styles.chip, ...(on ? styles.chipOn : null) }}
          >
            {o.label}
            {on ? '  ✓' : ''}
          </button>
        );
      })}
    </div>
  );
}

function ConfirmGroup({ title, values, labelOf }) {
  if (!values.length) return null;
  return (
    <div style={styles.confirmGroup}>
      <div style={styles.confirmLabel}>{title}</div>
      <div style={styles.chips}>
        {values.map((v) => (
          <span key={v} style={{ ...styles.chip, ...styles.chipOn, cursor: 'default' }}>
            {labelOf(v)}
          </span>
        ))}
      </div>
    </div>
  );
}

const styles = {
  screen: {
    position: 'fixed',
    inset: 0,
    zIndex: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    background: colors.bg,
    overflowY: 'auto',
  },
  // A contained, centered panel on desktop; fills the width on mobile. The body
  // scrolls within if the step is tall, so actions stay reachable.
  card: {
    width: '100%',
    maxWidth: 520,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    margin: 'auto',
    boxSizing: 'border-box',
    padding: '22px 20px calc(22px + env(safe-area-inset-bottom))',
    borderRadius: 20,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
  },
  top: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { ...kristyVoice, fontSize: 22, color: colors.accentGold },
  dots: { display: 'flex', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 999, background: colors.border },
  dotOn: { background: colors.accentGold },
  body: { display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 2 },
  prompt: { ...kristyVoice, margin: 0, fontSize: 25, lineHeight: 1.25, color: colors.textPrimary },
  sub: { margin: 0, fontFamily: fonts.ui, fontSize: 14, lineHeight: 1.5, color: colors.textMuted },
  note: { ...kristyVoice, margin: '4px 0 0', fontSize: 13.5, lineHeight: 1.5, color: colors.textMuted },
  freeForm: { display: 'flex', gap: 8, alignItems: 'stretch', flexWrap: 'wrap', margin: '4px 0 2px' },
  freeInput: {
    flex: '1 1 200px',
    minWidth: 0,
    boxSizing: 'border-box',
    minHeight: 46,
    padding: '11px 14px',
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: colors.bg,
    color: colors.textPrimary,
    fontFamily: fonts.ui,
    fontSize: 15,
  },
  freeBtn: {
    flex: '0 0 auto',
    minHeight: 46,
    padding: '11px 16px',
    borderRadius: 12,
    border: 'none',
    background: colors.accentGold,
    color: colors.bgDeep,
    fontFamily: fonts.ui,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  goals: { display: 'flex', flexDirection: 'column', gap: 10, margin: '6px 0 2px' },
  goal: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 3,
    width: '100%',
    padding: '13px 40px 13px 16px',
    borderRadius: 14,
    border: `1px solid ${colors.border}`,
    background: colors.bg,
    color: colors.textPrimary,
    cursor: 'pointer',
    textAlign: 'left',
  },
  goalOn: { borderColor: colors.borderGold, background: colors.goldTint9 },
  goalTitle: { fontFamily: fonts.ui, fontSize: 15.5, fontWeight: 600, color: colors.textPrimary },
  goalBlurb: { fontFamily: fonts.ui, fontSize: 13, color: colors.textMuted },
  goalCheck: { position: 'absolute', right: 16, top: 14, color: colors.accentGold, fontSize: 16, fontWeight: 700 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8, margin: '6px 0 4px' },
  chip: {
    maxWidth: '100%',
    padding: '9px 14px',
    minHeight: 44,
    boxSizing: 'border-box',
    borderRadius: 999,
    border: `1px solid ${colors.border}`,
    background: colors.bg,
    color: colors.textPrimary,
    fontFamily: fonts.ui,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left',
    overflowWrap: 'anywhere',
  },
  chipOn: { borderColor: colors.borderGold, background: colors.goldTint9, color: colors.accentGold },
  confirmGroup: { display: 'flex', flexDirection: 'column', gap: 2, margin: '2px 0' },
  confirmLabel: {
    fontFamily: fonts.ui,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  threadWrap: { margin: '2px 0 0' },
  actions: { display: 'flex', gap: 10, alignItems: 'center' },
  back: {
    flex: '0 0 auto',
    minHeight: 48,
    padding: '13px 18px',
    borderRadius: 14,
    border: `1px solid ${colors.border}`,
    background: 'transparent',
    color: colors.textMuted,
    fontFamily: fonts.ui,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  primary: {
    flex: 1,
    minHeight: 48,
    padding: '13px 18px',
    borderRadius: 14,
    border: 'none',
    background: colors.accentGold,
    color: colors.bgDeep,
    fontFamily: fonts.ui,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  primaryOff: { opacity: 0.5, cursor: 'default' },
  skip: {
    alignSelf: 'center',
    marginTop: 2,
    padding: '10px 12px',
    border: 'none',
    background: 'transparent',
    color: colors.textMuted,
    fontFamily: fonts.ui,
    fontSize: 13.5,
    textDecoration: 'underline',
    textUnderlineOffset: 3,
    cursor: 'pointer',
  },
};
