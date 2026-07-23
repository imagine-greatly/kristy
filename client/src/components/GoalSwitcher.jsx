import { useEffect, useRef, useState } from 'react';
import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';
import { CloseIcon } from './Icons.jsx';
import { COACH_GOALS, FOCUSES, NON_NEGOTIABLES, CONSTRAINTS, CONSTRAINTS_SECTION } from '../lib/coachGoals.js';
import { searchIngredients, interpretPreferences, customLineLabel, isCustomLine } from '../lib/preferences.js';

/* ═══════════════════════ Goal switcher — the chip's quick mode switch ═══════════════════════
   The header chip is a MODE, not an identity: tap it, switch what you're shopping
   for, and the next verdict reflects it. No confirmation friction. Below the goals,
   a quiet "keep an eye on" section (dietary focuses + hard lines) — the contextual
   home for what used to be a door-step step. Never pre-checked. Tokens only.

   Goal pick closes the sheet (it's a mode switch). Focus / hard-line toggles keep it
   open so several can be set. The one-time coach-not-doctor disclaimer is owned by
   the parent (fires on the first focus turned on). */
export default function GoalSwitcher({
  goal,
  focuses = [],
  nonNegotiables = [],
  constraints = [],
  onPickGoal,
  onToggleFocus,
  onToggleNonNegotiable,
  onToggleConstraint,
  onClose,
}) {
  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-label="What are you shopping for?">
      <div style={styles.scrim} onClick={onClose} />
      <div style={styles.sheet}>
        <button style={styles.close} onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        <div style={styles.body}>
          <h2 style={styles.title}>What are you shopping for?</h2>
          <p style={styles.sub}>Tell me in your own words &mdash; that becomes your preferences. Or tap a few below. Switch anytime.</p>

          {/* Natural language LEADS: the free-text field is the primary input. The
              chips below are suggestions, not the only way in. */}
          <FreeTextIntake
            lead
            goal={goal}
            focuses={focuses}
            nonNegotiables={nonNegotiables}
            constraints={constraints}
            onPickGoal={onPickGoal}
            onToggleFocus={onToggleFocus}
            onToggleNonNegotiable={onToggleNonNegotiable}
            onToggleConstraint={onToggleConstraint}
          />

          <div style={styles.threadWrap}>
            <GoldThread />
          </div>

          <h3 style={styles.section}>Or pick a starting point</h3>
          <div style={styles.goals}>
            {COACH_GOALS.map((g) => {
              const on = goal === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => onPickGoal(g.value)}
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

          <div style={styles.threadWrap}>
            <GoldThread />
          </div>

          <h3 style={styles.section}>Anything you want me to keep an eye on?</h3>
          <p style={styles.sub}>Optional. Turn on what matters to you — I&rsquo;ll flag it as we shop.</p>
          <div style={styles.chips}>
            {FOCUSES.map((f) => {
              const on = focuses.includes(f.value);
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => onToggleFocus(f.value)}
                  aria-pressed={on}
                  style={{ ...styles.chip, ...(on ? styles.chipOn : null) }}
                >
                  {f.label}
                  {on ? '  ✓' : ''}
                </button>
              );
            })}
          </div>

          <h3 style={styles.section}>{CONSTRAINTS_SECTION.title}</h3>
          <p style={styles.sub}>{CONSTRAINTS_SECTION.sub}</p>
          <div style={styles.chips}>
            {CONSTRAINTS.map((c) => {
              const on = constraints.includes(c.value);
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => onToggleConstraint(c.value)}
                  aria-pressed={on}
                  style={{ ...styles.chip, ...(on ? styles.chipOn : null) }}
                >
                  {c.label}
                  {on ? '  ✓' : ''}
                </button>
              );
            })}
          </div>

          <h3 style={styles.section}>Hard lines</h3>
          <p style={styles.sub}>I&rsquo;ll hold these on every product.</p>
          <div style={styles.chips}>
            {NON_NEGOTIABLES.map((n) => {
              const on = nonNegotiables.includes(n.value);
              return (
                <button
                  key={n.value}
                  type="button"
                  onClick={() => onToggleNonNegotiable(n.value)}
                  aria-pressed={on}
                  style={{ ...styles.chip, ...(on ? styles.chipOn : null) }}
                >
                  {n.label}
                  {on ? '  ✓' : ''}
                </button>
              );
            })}
            {/* Custom lines the user added by search, so they can be turned off
                the same way they were turned on. */}
            {nonNegotiables.filter(isCustomLine).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onToggleNonNegotiable(v)}
                aria-pressed
                style={{ ...styles.chip, ...styles.chipOn }}
              >
                {customLineLabel(v)}  ✓
              </button>
            ))}
          </div>

          <CustomLineSearch
            selected={nonNegotiables}
            onAdd={onToggleNonNegotiable}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Custom hard lines ──────────────────────────────────────────────────────
   Search the KB by name or alias and add any ingredient as a personal absolute.
   A custom line is a literal matcher — if the label carries it, the verdict
   escalates and Kristy names it — so it introduces no new health claim. */
function CustomLineSearch({ selected, onAdd }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const seq = useRef(0);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }
    // Debounced, and last-write-wins so a slow response can't overwrite a newer one.
    const mine = ++seq.current;
    const t = setTimeout(async () => {
      const r = await searchIngredients(term);
      if (mine === seq.current) setResults(r);
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div style={styles.searchWrap}>
      <label htmlFor="kristy-hardline-search" style={styles.searchLabel}>
        Add your own
      </label>
      <input
        id="kristy-hardline-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search an ingredient — carrageenan, red 40…"
        style={styles.input}
        autoComplete="off"
      />
      {results.length > 0 && (
        <ul style={styles.results}>
          {results.map((r) => {
            const on = selected.includes(r.value);
            return (
              <li key={r.id}>
                <button
                  type="button"
                  disabled={on}
                  onClick={() => {
                    onAdd(r.value);
                    setQ('');
                    setResults([]);
                  }}
                  style={{ ...styles.result, ...(on ? styles.resultOn : null) }}
                >
                  <span style={styles.resultName}>{r.name}</span>
                  {r.aliases?.length > 0 && (
                    <span style={styles.resultAlias}>also: {r.aliases.slice(0, 2).join(', ')}</span>
                  )}
                  <span style={styles.resultAdd}>{on ? 'Added' : '+ Hard line'}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ── Free-text intake ───────────────────────────────────────────────────────
   Natural language in, enumerated preferences out. The server maps onto the
   fixed taxonomy and filters the result against it, so nothing free-form can
   reach the engine. We show what it parsed as chips for the user to confirm —
   never applied silently — and Kristy says plainly what she couldn't map. */
function FreeTextIntake({ lead = false, goal, focuses, nonNegotiables, constraints = [], onPickGoal, onToggleFocus, onToggleNonNegotiable, onToggleConstraint }) {
  const [text, setText] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | parsed | error
  const [parsed, setParsed] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim() || state === 'loading') return;
    setState('loading');
    try {
      setParsed(await interpretPreferences(text));
      setState('parsed');
    } catch {
      setState('error');
    }
  }

  function apply() {
    if (!parsed) return;
    if (parsed.goal && parsed.goal !== goal) onPickGoal(parsed.goal);
    parsed.focuses.forEach((f) => { if (!focuses.includes(f)) onToggleFocus(f); });
    parsed.hardLines.forEach((h) => { if (!nonNegotiables.includes(h)) onToggleNonNegotiable(h); });
    (parsed.constraints || []).forEach((c) => { if (!constraints.includes(c)) onToggleConstraint?.(c); });
    setParsed(null);
    setText('');
    setState('idle');
  }

  const label = (v) =>
    COACH_GOALS.find((g) => g.value === v)?.title ||
    FOCUSES.find((f) => f.value === v)?.label ||
    NON_NEGOTIABLES.find((n) => n.value === v)?.label ||
    CONSTRAINTS.find((c) => c.value === v)?.label ||
    (isCustomLine(v) ? customLineLabel(v) : v);

  const picked = parsed
    ? [parsed.goal, ...parsed.focuses, ...parsed.hardLines, ...(parsed.constraints || [])].filter(Boolean)
    : [];

  return (
    <div style={styles.freeWrap}>
      {!lead && <h3 style={styles.section}>Or just tell me</h3>}
      {!lead && <p style={styles.sub}>I&rsquo;ll set it up.</p>}

      <form onSubmit={submit} style={styles.freeForm}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="High protein, no seed oils, shopping for kids…"
          style={{ ...styles.input, flex: '1 1 180px', width: 'auto', minWidth: 0 }}
          maxLength={600}
        />
        <button type="submit" disabled={!text.trim() || state === 'loading'} style={styles.freeBtn}>
          {state === 'loading' ? '…' : 'Set it up'}
        </button>
      </form>

      {state === 'error' && (
        <p style={styles.freeReply}>That one didn&rsquo;t go through. Try again, or tap what you want above.</p>
      )}

      {state === 'parsed' && parsed && (
        <div style={styles.parsed}>
          <p style={styles.freeReply}>{parsed.reply}</p>
          {picked.length > 0 && (
            <>
              <div style={styles.chips}>
                {picked.map((v) => (
                  <span key={v} style={{ ...styles.chip, ...styles.chipOn }}>{label(v)}</span>
                ))}
              </div>
              <div style={styles.parsedActions}>
                <button type="button" onClick={apply} style={styles.freeBtn}>Looks right</button>
                <button
                  type="button"
                  onClick={() => { setParsed(null); setState('idle'); }}
                  style={styles.freeCancel}
                >
                  Not quite
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 60,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  scrim: { position: 'absolute', inset: 0, background: colors.scrimVerdict },
  sheet: {
    position: 'relative',
    width: '100%',
    maxWidth: 460,
    maxHeight: '92vh',
    overflowY: 'auto',
    boxSizing: 'border-box',
    padding: '22px 18px calc(22px + env(safe-area-inset-bottom))',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    border: `1px solid ${colors.border}`,
    borderBottom: 'none',
    background: colors.bg,
  },
  close: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 999,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.textMuted,
    cursor: 'pointer',
  },
  body: { display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 6 },
  title: { ...kristyVoice, margin: 0, fontSize: 24, color: colors.textPrimary },
  sub: { margin: 0, fontFamily: fonts.ui, fontSize: 14, lineHeight: 1.5, color: colors.textMuted },
  goals: { display: 'flex', flexDirection: 'column', gap: 10, margin: '6px 0 2px' },
  goal: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 3,
    width: '100%',
    padding: '13px 16px',
    borderRadius: 14,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.textPrimary,
    cursor: 'pointer',
    textAlign: 'left',
  },
  goalOn: { borderColor: colors.borderGold, background: colors.goldTint9 },
  goalTitle: { fontFamily: fonts.ui, fontSize: 15.5, fontWeight: 600, color: colors.textPrimary },
  goalBlurb: { fontFamily: fonts.ui, fontSize: 13, color: colors.textMuted },
  goalCheck: { position: 'absolute', right: 16, top: 14, color: colors.accentGold, fontSize: 16, fontWeight: 700 },
  threadWrap: { margin: '8px 0 2px' },
  section: { ...kristyVoice, margin: '6px 0 0', fontSize: 18, color: colors.textPrimary },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8, margin: '2px 0 4px' },
  chip: {
    // No nowrap: a custom line can carry a long KB name (carboxymethylcellulose),
    // and at 390px an unbreakable chip is the thing that blows out the sheet.
    maxWidth: '100%',
    padding: '9px 14px',
    minHeight: 44,
    boxSizing: 'border-box',
    borderRadius: 999,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.textPrimary,
    fontFamily: fonts.ui,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left',
    overflowWrap: 'anywhere',
  },
  chipOn: { borderColor: colors.borderGold, background: colors.goldTint9, color: colors.accentGold },

  /* Custom hard-line search */
  searchWrap: { display: 'flex', flexDirection: 'column', gap: 6, margin: '2px 0 4px' },
  searchLabel: { fontFamily: fonts.ui, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: colors.textMuted, textTransform: 'uppercase' },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    minHeight: 44,
    padding: '11px 14px',
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.textPrimary,
    fontFamily: fonts.ui,
    fontSize: 15, // >=16 avoids iOS zoom-on-focus; 15 is the app's existing input scale
  },
  results: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 },
  result: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
    width: '100%',
    boxSizing: 'border-box',
    minHeight: 44,
    padding: '10px 14px',
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    cursor: 'pointer',
    textAlign: 'left',
    overflowWrap: 'anywhere',
  },
  resultOn: { opacity: 0.55, cursor: 'default' },
  resultName: { fontFamily: fonts.ui, fontSize: 14.5, fontWeight: 600, color: colors.textPrimary },
  resultAlias: { fontFamily: fonts.ui, fontSize: 12, color: colors.textMuted },
  resultAdd: { fontFamily: fonts.ui, fontSize: 12, fontWeight: 700, color: colors.accentGold },

  /* Free-text intake */
  freeWrap: { display: 'flex', flexDirection: 'column', gap: 8 },
  freeForm: { display: 'flex', gap: 8, alignItems: 'stretch', flexWrap: 'wrap' },
  freeBtn: {
    flex: '0 0 auto',
    minHeight: 44,
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
  freeCancel: {
    flex: '0 0 auto',
    minHeight: 44,
    padding: '11px 16px',
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: 'transparent',
    color: colors.textMuted,
    fontFamily: fonts.ui,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  freeReply: { ...kristyVoice, margin: 0, fontSize: 15, lineHeight: 1.55, color: colors.textPrimary },
  parsed: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 2 },
  parsedActions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
};
