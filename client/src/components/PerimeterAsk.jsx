import { useEffect, useRef, useState } from 'react';
import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';
import { CloseIcon } from './Icons.jsx';
import { askPerimeter } from '../lib/perimeter.js';

/* ═══════════════════════ Ask the aisle — the Perimeter surface ═══════════════════════
   Kristy's answers for the parts of the store with no barcode. The matched KB entry is
   FREE (everyone sees the short answer + buying tips + how the evidence is graded); the
   personalized read + the list refinement are PREMIUM (the server decides and returns
   `gated`). Reachable from a List item ("Ask Kristy") and from the Scan surface ("Ask
   about the aisle"). Tokens only; her spoken lines are kristyVoice. */
export default function PerimeterAsk({
  initialQuestion = '',
  autoAsk = false,
  allowRefine = false,
  prefs = {},
  onRefine,
  onUpgrade,
  onClose,
}) {
  const [question, setQuestion] = useState(initialQuestion);
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [resp, setResp] = useState(null);
  const fired = useRef(false);

  async function ask(q) {
    const query = String(q ?? question).trim();
    if (!query || state === 'loading') return;
    setState('loading');
    setResp(null);
    try {
      const r = await askPerimeter({ question: query, ...prefs });
      setResp(r);
      setState('done');
    } catch {
      setState('error');
    }
  }

  // A List item arrives with its name as the question and asks immediately.
  useEffect(() => {
    if (autoAsk && initialQuestion && !fired.current) {
      fired.current = true;
      ask(initialQuestion);
    }
  }, [autoAsk, initialQuestion]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-label="Ask Kristy about the aisle">
      <div style={styles.scrim} onClick={onClose} />
      <div style={styles.sheet}>
        <button style={styles.close} onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        <div style={styles.body}>
          <h2 style={styles.title}>Ask about the aisle</h2>
          <p style={styles.sub}>
            The fish counter, the butcher, produce, dairy, the bulk bins, or what a label really means.
          </p>

          <form
            style={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              ask();
            }}
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Wild or farmed salmon? What does 'natural' mean?"
              style={styles.input}
              aria-label="Your question"
            />
            <button type="submit" style={styles.askBtn} disabled={!question.trim() || state === 'loading'}>
              {state === 'loading' ? '…' : 'Ask'}
            </button>
          </form>

          {state === 'error' && (
            <p style={styles.err}>That didn&rsquo;t go through — try again in a moment.</p>
          )}

          {state === 'done' && resp && (
            <div style={styles.result}>
              {/* The honest no-answer — never an improvisation. */}
              {!resp.matched && (
                <p style={{ ...kristyVoice, ...styles.answer }}>{resp.answer}</p>
              )}

              {/* Free universal layer — the matched entry, verbatim from the KB. */}
              {(resp.entries || []).map((e) => (
                <div key={e.id} style={styles.entry}>
                  <div style={styles.entryTop}>
                    <span style={styles.entryTitle}>{e.title}</span>
                    {e.evidence_tier && <span style={styles.tier}>{tierLabel(e.evidence_tier)}</span>}
                  </div>
                  <p style={styles.short}>{e.short_answer}</p>
                  {(e.buying_tips || []).length > 0 && (
                    <>
                      <span style={{ fontFamily: fonts.ui, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.textMuted }}>
                        What to look for
                      </span>
                      <ul style={styles.tips}>
                        {e.buying_tips.map((t, i) => (
                          <li key={i} style={styles.tip}>{t}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {(e.labels_decoded || []).length > 0 && (
                    <div style={styles.labels}>
                      {e.labels_decoded.map((l, i) => (
                        <div key={i} style={styles.labelRow}>
                          <span style={styles.labelTerm}>{l.term}</span>
                          <span style={styles.labelMeaning}>{l.meaning}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {(e.sources || []).length > 0 && (
                    <p style={styles.sources}>Sources: {e.sources.join(' · ')}</p>
                  )}
                </div>
              ))}

              {/* Kristy's personalized read (premium). */}
              {resp.answer && resp.matched && (
                <>
                  <GoldThread />
                  <p style={{ ...kristyVoice, ...styles.answer }}>{resp.answer}</p>
                  {allowRefine && resp.refinement && onRefine && (
                    <button type="button" style={styles.refine} onClick={() => onRefine(resp.refinement)}>
                      Use this on my list — {resp.refinement}
                    </button>
                  )}
                </>
              )}

              {/* The withheld personalized read (free user). */}
              {resp.gated && (
                <div style={styles.gate}>
                  <GoldThread />
                  <p style={{ ...kristyVoice, ...styles.gateLine }}>{resp.upsell}</p>
                  {onUpgrade && (
                    <button type="button" style={styles.gateCta} onClick={onUpgrade}>
                      Unlock my read
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function tierLabel(t) {
  return (
    {
      established: 'Settled',
      credible_concern: 'Credible concern',
      kristys_standard: "Kristy's standard",
      time_tested: 'Time-tested',
    }[t] || t
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
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
    position: 'absolute', top: 12, right: 12, zIndex: 2,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36, borderRadius: 999,
    border: `1px solid ${colors.border}`, background: colors.surface, color: colors.textMuted, cursor: 'pointer',
  },
  body: { display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 6 },
  title: { ...kristyVoice, margin: 0, fontSize: 24, color: colors.textPrimary },
  sub: { margin: 0, fontFamily: fonts.ui, fontSize: 14, lineHeight: 1.5, color: colors.textMuted },
  form: { display: 'flex', gap: 8, alignItems: 'stretch', margin: '6px 0 2px' },
  input: {
    flex: 1, minWidth: 0, boxSizing: 'border-box', minHeight: 44, padding: '11px 14px',
    borderRadius: 12, border: `1px solid ${colors.border}`, background: colors.surface,
    color: colors.textPrimary, fontFamily: fonts.ui, fontSize: 15,
  },
  askBtn: {
    flex: '0 0 auto', minHeight: 44, padding: '11px 18px', borderRadius: 12, border: 'none',
    background: colors.accentGold, color: colors.bgDeep, fontFamily: fonts.ui, fontSize: 15, fontWeight: 700, cursor: 'pointer',
  },
  err: { ...kristyVoice, margin: 0, fontSize: 15, color: colors.textPrimary },
  result: { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 },
  entry: {
    display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 15px',
    borderRadius: 14, border: `1px solid ${colors.border}`, background: colors.surface,
  },
  entryTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  entryTitle: { fontFamily: fonts.ui, fontSize: 15.5, fontWeight: 700, color: colors.textPrimary },
  tier: {
    flex: '0 0 auto', fontFamily: fonts.ui, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.03em',
    color: colors.textSecondary, padding: '2px 8px', borderRadius: 999,
    border: `1px solid ${colors.gold30}`, background: colors.goldTint9, whiteSpace: 'nowrap',
  },
  short: { margin: 0, fontFamily: fonts.ui, fontSize: 14.5, lineHeight: 1.5, color: colors.textPrimary },
  tips: { margin: '2px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 },
  tip: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 1.45, color: colors.textMuted },
  labels: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 },
  labelRow: { display: 'flex', flexDirection: 'column', gap: 1 },
  labelTerm: { fontFamily: fonts.ui, fontSize: 12.5, fontWeight: 700, color: colors.textSecondary },
  labelMeaning: { fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 1.4, color: colors.textMuted },
  sources: { margin: '2px 0 0', fontFamily: fonts.ui, fontSize: 11, color: colors.textMuted },
  answer: { margin: 0, fontSize: 17, lineHeight: 1.55, color: colors.textPrimary },
  refine: {
    alignSelf: 'stretch', marginTop: 4, padding: '12px 16px', borderRadius: 12, border: 'none',
    background: colors.accentGold, color: colors.bgDeep, fontFamily: fonts.ui, fontWeight: 700, fontSize: 14.5, cursor: 'pointer',
  },
  gate: { display: 'flex', flexDirection: 'column', gap: 10 },
  gateLine: { margin: 0, fontSize: 16, lineHeight: 1.55, color: colors.textPrimary },
  gateCta: {
    alignSelf: 'stretch', padding: '12px 16px', borderRadius: 12, border: 'none',
    background: colors.accentGold, color: colors.bgDeep, fontFamily: fonts.ui, fontWeight: 700, fontSize: 15, cursor: 'pointer',
  },
};
