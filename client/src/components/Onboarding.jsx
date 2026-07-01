import { useMemo, useState } from 'react';
import { STEPS, COMPLETION_MESSAGES, finalizePayload } from '../lib/onboardingSteps.js';
import { saveOnboarding } from '../lib/data.js';
import MacroCard from './MacroCard.jsx';

// A short, one-question-at-a-time profile setup. On completion it computes
// macro goals (server-side, or a demo mirror), shows Kristy's sign-off, and
// hands the result back via onComplete when the user taps "Let's go".
export default function Onboarding({ userId, onComplete }) {
  const [data, setData] = useState({});
  const [idx, setIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // Two-stage measure entry (weight): false = number, true = unit question.
  const [unitStage, setUnitStage] = useState(false);
  // saveOnboarding result → drives the completion screen once set.
  const [result, setResult] = useState(null);

  // Steps visible given the current answers (conditional steps drop out).
  const steps = useMemo(
    () => STEPS.filter((s) => !s.condition || s.condition(data)),
    [data]
  );
  const step = steps[Math.min(idx, steps.length - 1)];

  // Weight asks for the unit on a second screen (it carries a unitPrompt).
  const inUnitStage = step?.type === 'measure' && !!step.unitPrompt && unitStage;

  // Per-type validation — the same check that decides whether to advance or to
  // surface Kristy's error line.
  const ready = (() => {
    if (!step) return false;
    if (step.type === 'text') return (data[step.id] || '').trim().length > 0;
    if (step.type === 'number') {
      const v = Number(data[step.id]);
      return data[step.id] !== undefined && data[step.id] !== '' && v >= (step.min ?? 1) && v <= (step.max ?? 999);
    }
    if (step.type === 'measure') return Number(data[step.valueKey]) > 0;
    if (step.type === 'multi') return true; // empty = "none"
    return true;
  })();

  const set = (id, value) => {
    setError('');
    setData((d) => ({ ...d, [id]: value }));
  };

  async function finish(finalData) {
    setSaving(true);
    setError('');
    try {
      const payload = finalizePayload(finalData);
      const res = await saveOnboarding(userId, payload);
      setResult(res); // show completion screen; onComplete fires on "Let's go"
    } catch {
      setError("Couldn't save that — give it another try.");
      setSaving(false);
    }
  }

  // Advance, recomputing the live step list against the latest answers so
  // conditional steps (e.g. sport) resolve correctly.
  function advance(nextData) {
    setUnitStage(false);
    const d = nextData || data;
    const live = STEPS.filter((s) => !s.condition || s.condition(d));
    if (idx >= live.length - 1) finish(d);
    else setIdx((i) => i + 1);
  }

  // Validate first. If invalid, show Kristy's error line for this step instead
  // of silently blocking. For the weight step, a valid number opens the unit
  // question before moving on.
  function tryAdvance(nextData) {
    if (!ready) {
      setError(step.error || 'Add this so I can keep your targets accurate.');
      return;
    }
    setError('');
    if (step.type === 'measure' && step.unitPrompt && !unitStage) {
      setUnitStage(true);
      return;
    }
    advance(nextData);
  }

  function selectChip(value) {
    const d = { ...data, [step.id]: value };
    setData(d);
    setError('');
    advance(d);
  }

  function selectUnit(value) {
    const d = { ...data, [step.unitKey]: value };
    setData(d);
    setError('');
    advance(d);
  }

  function toggleMulti(value) {
    setError('');
    const cur = Array.isArray(data[step.id]) ? data[step.id] : [];
    let next;
    if (value === 'none') {
      next = ['none'];
    } else {
      next = cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur.filter((v) => v !== 'none'), value];
    }
    set(step.id, next);
  }

  function goBack() {
    setError('');
    // From the weight unit question, step back to the number entry.
    if (inUnitStage) {
      setUnitStage(false);
      return;
    }
    setUnitStage(false);
    setIdx((i) => Math.max(0, i - 1));
  }

  /* ───────── Completion screen ───────── */
  if (result) {
    const quick = data.goal === 'just_track';
    return (
      <div className="onb">
        <div className="onb__card">
          <div className="onb__top">
            <span className="onb__logo">Kristy</span>
          </div>
          <div className="onb__body">
            {quick ? (
              <h2 className="onb__prompt">{COMPLETION_MESSAGES.quick}</h2>
            ) : (
              <>
                <MacroCard macros={result.goals} />
                <h2 className="onb__prompt">{COMPLETION_MESSAGES.full}</h2>
              </>
            )}
          </div>
          <div className="onb__actions">
            <button className="onb__btn" onClick={() => onComplete(result)}>
              Let's go
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((idx + 1) / steps.length) * 100;
  const displayPrompt = inUnitStage ? step.unitPrompt(data[step.valueKey]) : step.prompt;

  return (
    <div className="onb">
      <div className="onb__card">
        <div className="onb__top">
          <span className="onb__logo">Kristy</span>
          <span className="onb__count">
            {idx + 1} / {steps.length}
          </span>
        </div>
        <div className="onb__bar">
          <div className="onb__bar-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="onb__body">
          <h2 className="onb__prompt">{displayPrompt}</h2>
          {!inUnitStage && step.note && <p className="onb__note">{step.note}</p>}

          {step.type === 'chips' && (
            <div className="onb__chips">
              {step.options.map((o) => (
                <button
                  key={o.value}
                  className={`onb__chip ${data[step.id] === o.value ? 'selected' : ''}`}
                  onClick={() => selectChip(o.value)}
                  disabled={saving}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}

          {step.type === 'multi' && (
            <div className="onb__chips">
              {step.options.map((o) => {
                const sel = (data[step.id] || []).includes(o.value);
                return (
                  <button
                    key={o.value}
                    className={`onb__chip ${sel ? 'selected' : ''}`}
                    onClick={() => toggleMulti(o.value)}
                    disabled={saving}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          )}

          {step.type === 'text' && (
            <input
              className="onb__input"
              type="text"
              autoFocus
              placeholder={step.placeholder || ''}
              value={data[step.id] || ''}
              onChange={(e) => set(step.id, e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && tryAdvance()}
            />
          )}

          {step.type === 'number' && (
            <div className="onb__measure">
              <input
                className="onb__input"
                type="number"
                inputMode="numeric"
                autoFocus
                min={step.min}
                max={step.max}
                value={data[step.id] ?? ''}
                onChange={(e) => set(step.id, e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && tryAdvance()}
              />
              {step.suffix && <span className="onb__suffix">{step.suffix}</span>}
            </div>
          )}

          {step.type === 'measure' &&
            (inUnitStage ? (
              // Stage 2 — Kristy asks which unit (e.g. "185 — pounds or kilograms?").
              <div className="onb__chips">
                {step.units.map((u) => {
                  const sel = (data[step.unitKey] || step.defaultUnit) === u.value;
                  return (
                    <button
                      key={u.value}
                      className={`onb__chip ${sel ? 'selected' : ''}`}
                      onClick={() => selectUnit(u.value)}
                      disabled={saving}
                    >
                      {u.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="onb__measure">
                <input
                  className="onb__input"
                  type="number"
                  inputMode="decimal"
                  autoFocus
                  value={data[step.valueKey] ?? ''}
                  onChange={(e) => set(step.valueKey, e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && tryAdvance()}
                />
                {/* Steps with a unitPrompt defer the unit choice to stage 2. */}
                {!step.unitPrompt && (
                  <div className="onb__units">
                    {step.units.map((u) => {
                      const active = (data[step.unitKey] || step.defaultUnit) === u.value;
                      return (
                        <button
                          key={u.value}
                          className={`onb__unit ${active ? 'active' : ''}`}
                          onClick={() => set(step.unitKey, u.value)}
                        >
                          {u.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

          {error && <p className="onb__error">{error}</p>}
        </div>

        <div className="onb__actions">
          {(idx > 0 || inUnitStage) && (
            <button className="onb__back" onClick={goBack} disabled={saving}>
              Back
            </button>
          )}
          {/* Chips auto-advance, as do the stage-2 unit chips; the rest need an
              explicit Continue that runs validation. */}
          {step.type !== 'chips' && !inUnitStage && (
            <button
              className="onb__btn"
              onClick={() => tryAdvance()}
              disabled={saving}
            >
              {saving
                ? 'Saving…'
                : idx >= steps.length - 1
                ? 'Finish'
                : 'Continue'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
