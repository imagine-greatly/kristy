import { useState } from 'react';
import { colors, fonts, kristyVoice, radii } from '../lib/tokens.js';
import { askCounter } from '../lib/perimeter.js';
import { useCardMeter } from '../lib/cardMeter.js';
import { trackEvent } from '../lib/analytics.js';
import CounterAnswer, { CounterAnswerSkeleton } from './CounterAnswer.jsx';

/* ═══════════════════════ THE ASK — ONE COMPONENT, THREE SURFACES ═══════════════════════

   A question in plain words, answered from the counter's sourced corpus. It renders on the
   Counter index, on the dashboard (questions get asked at home too), and as an overlay over
   shop mode (standing in front of something the list does not cover).

   IT IS ONE COMPONENT ON PURPOSE, AND THE REASON IS THE METER, NOT THE MARKUP. Every full
   read costs a shopper one of three, and a card opened from the aisle must cost exactly what
   the same card costs from the couch. Two ask implementations that "look alike" would be two
   meters, and the day they diverge is the day the gate copy becomes false on one of them —
   silently, because the surface that drifted still looks right. It shares
   `useCardMeter`, which is also what CartMoment and AisleMoment now use for their card taps.

   The SEEDS differ by surface and the answer does not. A shopper standing at the fish counter
   and a shopper on the sofa get the same sourced card for the same question; only the
   suggested phrasings change, because what is in front of you changes what you think to ask.

   `placeholder` and `seeds` are the only surface-specific inputs. If a fourth surface needs
   more than that, it is a sign the surfaces are diverging, not that this needs more props. */

export const ASK_SEEDS = [
  'Wild or farmed salmon',
  'Which cut for stew',
  'What pasture-raised leaves out',
  'Is organic worth it for berries',
];

/** Seeds for a shopper standing in a specific section of the store. */
export function seedsForSection(sectionId) {
  const BY_SECTION = {
    produce: ['Is organic worth it for berries', 'How do I pick a good cantaloupe', 'Are bagged salads safe'],
    meat: ['Which cut for stew', 'What does grass-fed actually mean', 'Is air-chilled worth it'],
    seafood: ['Wild or farmed salmon', 'Which are low in mercury', 'Is previously frozen worse'],
    eggs_dairy: ['What pasture-raised leaves out', 'Brown or white eggs', 'Is A2 milk different'],
    bulk_pantry: ['Which olive oil grade', 'Dried or canned beans', 'What is bulgur'],
    frozen: ['Is frozen as good as fresh', 'What is in a frozen veg bag'],
  };
  return BY_SECTION[sectionId] || ASK_SEEDS;
}

export default function CounterAsk({
  prefs,
  placeholder = 'Wild or farmed salmon?',
  seeds = ASK_SEEDS,
  via = 'counter',
  purchasable = true,
  submitTone = 'action',
  onUpgrade,
  onAddToCart,
  onAnswer,
  autoFocus = false,
}) {
  const [question, setQuestion] = useState('');
  const [ask, setAsk] = useState(null); // null | { state, resp }
  const { requestFull, view } = useCardMeter(purchasable ? onUpgrade : undefined);

  /* WHETHER THERE IS AN ANSWER ON SCREEN, REPORTED UP. The Counter index hides its eight
     essentials once one arrives — a shopper asked something specific and eight other answers
     under it is noise at the moment they are reading. That state used to be AisleMoment's
     own; moving the ask here took it away, and the leftover `{!ask && …}` was a live
     ReferenceError that took the whole Counter surface down. `vite build` compiled it
     happily — only gate.mjs, which drives the real surface, caught it. */
  const setAskState = (next) => {
    setAsk(next);
    onAnswer?.(Boolean(next));
  };

  /* ONE ROUTE FOR EVERY ASK — the bar and the seed chips both land here. The server decides
     whether the answer is a curated card, one generated for a question the KB never covered,
     or an out-of-scope line; all three come back in the same shape. */
  async function runAsk(raw, how) {
    const q = String(raw || '').trim();
    if (!q || ask?.state === 'loading') return;
    setAskState({ state: 'loading' });
    trackEvent('counter-ask', { via: how });
    try {
      const resp = await askCounter({
        query: q,
        goal: prefs?.goal || '',
        focuses: prefs?.focuses || [],
        hardLines: prefs?.hardLines || [],
        constraints: prefs?.constraints || [],
      });
      setAskState({ state: 'done', resp });
    } catch {
      setAskState({ state: 'error' });
    }
  }

  return (
    <div style={styles.wrap} data-counter-ask={via}>
      <form
        style={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          runAsk(question, via);
        }}
      >
        <input
          style={styles.input}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={placeholder}
          aria-label="Ask about the counter"
          disabled={ask?.state === 'loading'}
          autoFocus={autoFocus}
          data-ask-input
        />
        <button
          type="submit"
          style={submitTone === 'quiet' ? styles.goQuiet : styles.go}
          disabled={!question.trim() || ask?.state === 'loading'}
          data-ask-go
        >
          {ask?.state === 'loading' ? '…' : 'Ask'}
        </button>
      </form>

      {/* A seed ASKS. It used to only fill the box, which made the shortcut two taps — the
          tap, then the same Ask button they could have reached by typing. */}
      {!ask && !!seeds.length && (
        <div style={styles.seeds}>
          {seeds.map((s) => (
            <button
              key={s}
              type="button"
              style={styles.seed}
              onClick={() => {
                setQuestion(s);
                runAsk(s, 'seed');
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* A card can take seconds to generate. The skeleton is the card's own shape, so the
          layout does not jump and the wait reads as an answer arriving. */}
      {ask?.state === 'loading' && <div style={styles.answer}><CounterAnswerSkeleton /></div>}
      {ask?.state === 'error' && <p style={styles.muted}>That did not go through. Try again.</p>}
      {ask?.state === 'done' && (
        <div style={styles.answer} data-ask-answer>
          <CounterAnswer
            resp={{ ...ask.resp, card: view(ask.resp?.card) }}
            onUpgrade={purchasable ? onUpgrade : undefined}
            onAddToCart={onAddToCart}
            onRequestFull={requestFull}
            purchasable={purchasable}
          />
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 10 },
  form: { display: 'flex', gap: 8, alignItems: 'stretch' },
  input: {
    flex: 1, minWidth: 0, padding: '13px 15px', borderRadius: 12,
    border: `1px solid ${colors.borderGold}`, background: colors.surface,
    color: colors.textPrimary, fontFamily: fonts.ui, fontSize: 15, outline: 'none',
  },
  go: {
    flex: '0 0 auto', padding: '13px 18px', borderRadius: radii.button, border: 'none',
    background: colors.action, color: colors.actionInk,
    fontFamily: fonts.ui, fontWeight: 700, fontSize: 15, cursor: 'pointer',
  },
  /* EXACTLY ONE FILLED ACTION PER SCREEN. Standing on the Counter index or inside the shop
     overlay this IS the one action, so it is bone. On the dashboard the hero already carries
     one, so the composer asks for a quiet submit — the same call TripQuestion's Go makes. */
  goQuiet: {
    flex: '0 0 auto', padding: '13px 18px', borderRadius: radii.button,
    border: `1px solid ${colors.borderGold}`, background: 'transparent', color: colors.inkBody,
    fontFamily: fonts.ui, fontWeight: 700, fontSize: 15, cursor: 'pointer',
  },
  seeds: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  seed: {
    padding: '9px 14px', borderRadius: 999, border: `1px solid ${colors.border}`,
    background: colors.surface, color: colors.textSecondary,
    fontFamily: fonts.ui, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
  },
  answer: { marginTop: 2 },
  muted: { margin: 0, ...kristyVoice, fontSize: 14, color: colors.textMuted },
};
