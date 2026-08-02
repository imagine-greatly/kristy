import { colors, fonts, kristyVoice, radii } from '../lib/tokens.js';
import { UPGRADE_COPY, PRICING, PLAN_ORDER, teaserMore } from '../lib/pricing.js';

/* ═══════════════ The partial reveal ═══════════════

   Tapping "The full read" past the meter must NEVER show a blank or a padlock. It shows
   the card's first real check, fully legible, then the NEXT few at their true length,
   faded to unreadable — and then what is behind them, counted.

   THE FADED LINES CARRY THE CARD'S GEOMETRY, NOT ITS WORDS. The server sends
   `teaser.faded_lengths` — the real character count of each withheld line — and this
   renders blocks at exactly that width, wrapping where the real lines wrap. The point is
   showing HOW MUCH IS THERE, and a true line count does that without shipping a third of
   every card to a client that has not paid for it. A padlock says "no". This says "look
   how much of this there is". */

// A faded line, drawn at the true length of the line it stands for. Segmented into
// word-ish runs so the block reads as prose rather than as a progress bar.
function FadedLine({ length }) {
  const words = [];
  let left = length;
  let seed = length; // deterministic: the same card always fades the same way
  while (left > 0) {
    seed = (seed * 31 + 17) % 97;
    const w = Math.min(left, 3 + (seed % 8));
    words.push(w);
    left -= w + 1;
  }
  return (
    <span style={styles.fadedLine} aria-hidden="true">
      {words.map((w, i) => (
        <span key={i} style={{ ...styles.fadedWord, width: `${w * 0.52}em` }} />
      ))}
    </span>
  );
}

/* `purchasable` is false for a signed-out shopper, and that is a product decision, not
   a styling one. Buying requires an account, an account requires a phone code, and
   phone codes are blocked on 10DLC carrier registration — so a guest who tapped a plan
   would enter a number, tap Send code, and wait for a message that cannot arrive. A
   door that does not open is worse than no door. The teaser still shows the whole
   shape of what is behind the gate; it just stops naming a price nobody can pay. */
export default function CardTeaser({ card, onUpgrade, purchasable = true }) {
  const t = card?.teaser;
  if (!t) return null;
  const more = teaserMore(t.remaining || {});

  return (
    <div style={styles.wrap} data-card-teaser>
      <div style={styles.block}>
        <span style={styles.head}>What to look for</span>
        <ul style={styles.list}>
          {t.look_for_first && (
            <li style={styles.row} data-teaser-legible>
              <span style={styles.mark} aria-hidden="true">✓</span>
              <span style={styles.rowText}>{t.look_for_first}</span>
            </li>
          )}
        </ul>
        {/* THE FADE IS ON THE GROUP, NOT PER LINE. Masking each line on its own made every
            row dissolve identically, which reads as a loading skeleton — the one thing this
            must not look like. Fading the block downward reads as text running past the
            edge of what you are allowed to see. */}
        <ul style={{ ...styles.list, ...styles.fadedGroup }} data-teaser-faded>
          {(t.faded_lengths || []).map((len, i) => (
            <li key={i} style={styles.row}>
              <span style={styles.mark} aria-hidden="true">✓</span>
              <FadedLine length={len} />
            </li>
          ))}
        </ul>
      </div>

      {more && (
        <p style={styles.more} data-teaser-more>
          <span style={styles.arrow} aria-hidden="true">→ </span>
          {more}
        </p>
      )}

      {purchasable ? (
        <button type="button" style={styles.cta} onClick={onUpgrade} data-teaser-cta>
          <span style={{ ...kristyVoice, ...styles.ctaHead }}>{UPGRADE_COPY.read.headline}</span>
          <span style={styles.ctaPrice}>
            Kristy’s full read — {PRICING[PLAN_ORDER[0]].amount}
          </span>
        </button>
      ) : (
        <p style={{ ...kristyVoice, ...styles.ctaHeadPlain }} data-teaser-note>
          {UPGRADE_COPY.read.headline}
        </p>
      )}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 12 },
  block: { display: 'flex', flexDirection: 'column', gap: 7 },
  head: {
    fontFamily: fonts.ui, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: colors.textSecondary,
  },
  list: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 },
  row: { display: 'flex', gap: 9, alignItems: 'flex-start' },
  mark: { flex: '0 0 auto', color: colors.accentGold, fontSize: 12, lineHeight: '20px' },
  rowText: { fontFamily: fonts.ui, fontSize: 14, lineHeight: 1.45, color: colors.inkBody },
  fadedGroup: {
    marginTop: 8,
    maskImage: 'linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.55) 40%, transparent 96%)',
    WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.55) 40%, transparent 96%)',
  },
  fadedLine: {
    display: 'flex', flexWrap: 'wrap', gap: '0.34em', alignItems: 'center',
    minHeight: 20, paddingTop: 5, flex: '1 1 auto',
  },
  fadedWord: {
    // x-height, not a bar: the block should read as words at this size, blurred out.
    display: 'inline-block', height: '0.52em', borderRadius: 2,
    background: colors.inkBody, opacity: 0.30,
  },
  more: {
    margin: 0, fontFamily: fonts.ui, fontSize: 13.5, lineHeight: 1.5,
    color: colors.textSecondary,
  },
  arrow: { color: colors.accentGold },
  cta: {
    display: 'flex', flexDirection: 'column', gap: 3, alignSelf: 'stretch',
    minHeight: 44, padding: '12px 14px', textAlign: 'left', cursor: 'pointer',
    borderRadius: radii.button, border: `1px solid ${colors.gold30}`,
    background: colors.goldTint9,
  },
  ctaHead: { fontSize: 15.5, color: colors.ink, lineHeight: 1.3 },
  ctaHeadPlain: {
    margin: 0, fontSize: 15.5, color: colors.textSecondary, lineHeight: 1.35,
  },
  ctaPrice: { fontFamily: fonts.ui, fontSize: 12.5, fontWeight: 600, color: colors.textSecondary },
};
