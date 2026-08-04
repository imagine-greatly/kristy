import { useState } from 'react';
import { colors, fonts, kristyDisplay, kristyVoice, radii } from '../lib/tokens.js';
import AmbientIsm from './AmbientIsm.jsx';
import FillRow from './FillRow.jsx';

/* ═══════════════════ The entry state: a question, not a list ═══════════════════
   A trip starts LEAN. The cart used to generate an 18-item template before a single
   question had been asked, and however good each row was, nobody requested it — so the
   whole thing read as generic and imposed. Suggestions in the void hurt the product.

   So the shopper drives: they name what they're getting, and the cart is the OUTPUT of
   that. Preferences shape which VERSION of each item lands, not what gets added.

   The quick-taps SEED the field rather than firing immediately, which keeps the answer
   editable and teaches the shape of a good one without making it a form.

   A full cart is still available for anyone who wants one handed over. It's a button
   now, not the landing state.

   ─── Why this is its own module ─────────────────────────────────────────────────
   The dashboard's hero asks this question, and this component asked it again 500px lower:
   rendering the two together printed "What are you getting this week?" and "Name it in
   your own words. Rough is fine." VERBATIM TWICE on one screen. `showHead` is how the
   composer resolves that — the hero carries the question, this carries the answer.

   The heading is NOT deleted for every caller, because a caller that has no hero (the
   trip-loop harness, and any future surface that opens straight onto the question) still
   needs the question asked once. Suppression is the composer's call, not this file's. */

const TRIP_SEEDS = [
  'Chicken, rice, something for breakfast',
  'Three dinners this week',
  'Snacks the kids will eat',
  'Just a few things',
];

export default function TripQuestion({
  cart, premium, onUpgrade, onSetGoal, onScan, onAskAisle, goals = [],
  showHead = true, showSeed = true, submitTone = 'action',
}) {
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const busy = !!cart.busy;

  async function submit(e) {
    e?.preventDefault();
    const answer = text.trim();
    if (!answer || busy) return;
    setErr('');
    const res = await cart.compose(answer, 'build');
    if (res?.ok) setText('');
    // `budget` and `needsAccount` both already say their own piece — over-budget through
    // `note`, sign-in through the account offer. Only a real failure gets "try again",
    // because telling someone to retry against a ceiling is how you make them retry.
    else if (!res?.budget && !res?.needsAccount) setErr('That did not go through. Try it once more.');
  }

  return (
    <div style={styles.ask} data-trip-question>
      {showHead && (
        <>
          <p style={{ ...kristyVoice, ...styles.askQ }}>What are you getting this week?</p>
          <p style={styles.askSub}>Name it in your own words. Rough is fine.</p>
        </>
      )}

      <form style={styles.askForm} onSubmit={submit}>
        <input
          style={styles.askInput}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Chicken, rice, snacks for the kids…"
          aria-label="What you are getting this week"
          disabled={busy}
        />
        {/* EXACTLY ONE FILLED ACTION PER SCREEN. Standing alone this IS the screen's one
            action, so it is bone. Composed under a hero that already carries a filled
            action — the `completed` state, where "Start from those 15 items" is the
            answer — a second bone button makes the screen say two things equally loudly.
            The composer decides, because only the composer can see what is above. */}
        <button
          type="submit"
          style={submitTone === 'quiet' ? styles.askGoQuiet : styles.askGo}
          disabled={!text.trim() || busy}
        >
          {busy ? '…' : 'Go'}
        </button>
      </form>

      {/* Starting points — a tap fills the field, it doesn’t submit for you. */}
      <div style={styles.seeds}>
        {TRIP_SEEDS.map((s) => (
          <button key={s} type="button" style={styles.seed} onClick={() => setText(s)} disabled={busy}>
            {s}
          </button>
        ))}
      </div>

      {busy && <AmbientIsm style={{ marginTop: 16 }} />}
      {err && <p style={styles.askErr}>{err}</p>}

      {/* THE IDENTITY, on the emptiest screen in the app: the two halves of the store,
          at the same weight. The counter had this slot to itself and Scan had none,
          which said the opposite of what it should. Both are gold-edged now, so the
          counter keeps the prominence it earned and Scan simply matches it. */}
      <FillRow onScan={onScan} onAskAisle={onAskAisle} />

      {/* SAME AS LAST WEEK — the single seeding act, and the highest-value tap on this
          screen. Groceries are mostly repeat, so the second trip should be easier than the
          first; that is what a habit feels like. It renders only when the server says
          there IS a completed trip to read, so nobody is offered a button that answers 409.

          It sits above "build a full cart" deliberately: a real previous trip beats a
          generated template every time, and the template is the fallback for someone who
          has no history yet. */}
      {showSeed && cart.seedable?.seedable && (
        <button
          type="button"
          style={styles.seedBtn}
          data-seed-last
          disabled={busy}
          onClick={async () => {
            const res = await cart.seedFromLast();
            if (!res?.ok) setErr('That did not go through. Try it once more.');
          }}
        >
          <span style={styles.seedLabel}>Same as last week</span>
          <span style={styles.seedSub}>
            {cart.seedable.items} item{cart.seedable.items === 1 ? '' : 's'}, unchecked and ready to edit
          </span>
        </button>
      )}

      {/* THE OPT-IN. Some shoppers do want a cart handed to them. That’s a choice
          they make, on every tier, not the default state of the screen. */}
      <button type="button" style={styles.ghostBtn} onClick={cart.rebuild} disabled={busy}>
        Or build a full cart
      </button>

      {/* Nothing is withheld on this screen. The question is the free path in, for
          everyone — there is no tier in which typing an answer here does not work. */}

      {!goals.length && onSetGoal && (
        <button type="button" style={styles.linkBtn} onClick={onSetGoal}>
          Set how you like to eat →
        </button>
      )}
    </div>
  );
}

const styles = {
  ask: { display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 },
  askQ: { ...kristyDisplay, margin: 0, fontSize: 26, lineHeight: 1.3, color: colors.ink },
  askSub: { margin: '-6px 0 0', fontFamily: fonts.ui, fontSize: 13.5, color: colors.textMuted },
  askForm: { display: 'flex', gap: 8, alignItems: 'stretch' },
  askInput: {
    flex: 1, minWidth: 0, padding: '13px 15px', borderRadius: 12,
    border: `1px solid ${colors.borderGold}`, background: colors.surface,
    color: colors.textPrimary, fontFamily: fonts.ui, fontSize: 15, outline: 'none',
  },
  // The cart's ONE filled action.
  askGo: {
    flex: '0 0 auto', padding: '13px 18px', borderRadius: radii.button, border: 'none',
    background: colors.action, color: colors.actionInk,
    fontFamily: fonts.ui, fontWeight: 700, fontSize: 15, cursor: 'pointer',
  },
  askGoQuiet: {
    flex: '0 0 auto', padding: '13px 18px', borderRadius: radii.button,
    border: `1px solid ${colors.borderGold}`, background: 'transparent', color: colors.inkBody,
    fontFamily: fonts.ui, fontWeight: 700, fontSize: 15, cursor: 'pointer',
  },
  seeds: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  seedBtn: {
    alignSelf: 'stretch', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3,
    minHeight: 44, padding: '13px 16px', borderRadius: 14, cursor: 'pointer',
    border: `1px solid ${colors.borderGold}`, background: colors.goldTint9, textAlign: 'left',
  },
  seedLabel: { fontFamily: fonts.ui, fontSize: 15, fontWeight: 700, color: colors.textPrimary },
  seedSub: { fontFamily: fonts.ui, fontSize: 12.5, color: colors.textMuted },
  seed: {
    padding: '9px 14px', borderRadius: 999, border: `1px solid ${colors.border}`,
    background: colors.surface, color: colors.textSecondary,
    fontFamily: fonts.ui, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
  },
  askErr: { margin: 0, fontFamily: fonts.ui, fontSize: 13.5, color: colors.error },
  ghostBtn: {
    padding: '12px 18px', borderRadius: radii.button, border: `0.5px solid ${colors.hairline}`,
    background: 'transparent', color: colors.inkBody,
    fontFamily: fonts.ui, fontWeight: 600, fontSize: 14.5, cursor: 'pointer',
  },
  linkBtn: {
    alignSelf: 'flex-start', padding: 0, background: 'transparent', border: 'none',
    color: colors.textSecondary, fontFamily: fonts.ui, fontSize: 13.5, cursor: 'pointer',
  },
};
