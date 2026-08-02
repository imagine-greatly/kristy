import { colors, fonts, kristyVoice, radii } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';
import { UPGRADE_COPY, PRICING, PLAN_ORDER } from '../lib/pricing.js';

/* ═══════════════ The ask ═══════════════

   TWO MOMENTS ONLY: the fourth full-read tap, and a list save. Not on open, not on a
   scan, not on an ask, never a banner. Interrupting someone mid-aisle is how this gets
   deleted, and the free surface is the acquisition engine — it has to stay whole.

   The COUNT is the argument. No countdown, no "limited time", no urgency of any kind:
   the corpus is either worth it or it is not, and saying how big it is answers that
   better than a timer. The frame is a nutritionist rather than another scanner, because
   the Counter's real advantage is the questions a shopper did not know to ask. */

export default function UpgradeSheet({ reason = 'read', itemCount = 0, onPick, onClose }) {
  const copy = UPGRADE_COPY[reason] || UPGRADE_COPY.read;
  const headline = typeof copy.headline === 'function' ? copy.headline(itemCount) : copy.headline;

  return (
    <div style={styles.scrim} onClick={onClose} data-upgrade-scrim>
      <section
        style={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label="Membership"
        onClick={(e) => e.stopPropagation()}
        data-upgrade-sheet={reason}
      >
        <div style={styles.grabber} aria-hidden="true" />

        <p style={{ ...kristyVoice, ...styles.headline }} data-upgrade-headline>{headline}</p>
        <p style={styles.body}>{copy.body}</p>
        {copy.frame && (
          <>
            <GoldThread />
            <p style={{ ...kristyVoice, ...styles.frame }}>{copy.frame}</p>
          </>
        )}

        <div style={styles.plans}>
          {PLAN_ORDER.map((id) => {
            const p = PRICING[id];
            const hero = id === PLAN_ORDER[0];
            return (
              <button
                key={id}
                type="button"
                style={{ ...styles.plan, ...(hero ? styles.planHero : null) }}
                onClick={() => onPick?.(id)}
                data-plan={id}
              >
                <span style={styles.planTop}>
                  <span style={styles.planLabel}>{p.label}</span>
                  {p.badge && <span style={styles.badge}>{p.badge}</span>}
                </span>
                <span style={styles.planPrice}>
                  {p.price}<span style={styles.planPer}>{p.per}</span>
                </span>
                <span style={styles.planNote}>{p.note}</span>
              </button>
            );
          })}
        </div>

        <button type="button" style={styles.later} onClick={onClose} data-upgrade-close>
          Not now
        </button>
      </section>
    </div>
  );
}

const styles = {
  scrim: {
    position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(2,6,3,0.62)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  },
  sheet: {
    width: '100%', maxWidth: 440, maxHeight: '92vh', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 12,
    padding: '10px 18px calc(18px + env(safe-area-inset-bottom))',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    background: colors.surface,
    boxShadow: `0 -1px 0 ${colors.edgeHighlight}, 0 -18px 48px rgba(0,0,0,0.45)`,
  },
  grabber: {
    alignSelf: 'center', width: 36, height: 4, borderRadius: 999,
    background: colors.hairline, opacity: 0.8, marginBottom: 4,
  },
  headline: { margin: 0, fontSize: 21, lineHeight: 1.25, color: colors.ink },
  body: { margin: 0, fontFamily: fonts.ui, fontSize: 14.5, lineHeight: 1.55, color: colors.inkBody },
  frame: { margin: 0, fontSize: 16, lineHeight: 1.5, color: colors.textPrimary },
  plans: { display: 'flex', flexDirection: 'column', gap: 9, marginTop: 2 },
  plan: {
    display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start',
    padding: '13px 15px', minHeight: 44, cursor: 'pointer', textAlign: 'left',
    borderRadius: radii.button, border: `0.5px solid ${colors.hairline}`,
    background: 'transparent',
  },
  planHero: { border: `1px solid ${colors.gold30}`, background: colors.goldTint9 },
  planTop: { display: 'flex', alignItems: 'center', gap: 8, width: '100%' },
  planLabel: {
    fontFamily: fonts.ui, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
    textTransform: 'uppercase', color: colors.textSecondary,
  },
  badge: {
    fontFamily: fonts.ui, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.03em',
    color: colors.ink, padding: '2px 7px', borderRadius: 999,
    border: `1px solid ${colors.gold30}`, background: colors.goldTint9,
  },
  planPrice: { fontFamily: fonts.display, fontSize: 25, lineHeight: 1.1, color: colors.ink },
  planPer: { fontFamily: fonts.ui, fontSize: 13, color: colors.textSecondary },
  planNote: { fontFamily: fonts.ui, fontSize: 12.5, color: colors.textSecondary },
  later: {
    alignSelf: 'center', marginTop: 2, minHeight: 44, padding: '10px 16px',
    border: 'none', background: 'transparent', cursor: 'pointer',
    fontFamily: fonts.ui, fontSize: 13.5, color: colors.textMuted,
  },
};
